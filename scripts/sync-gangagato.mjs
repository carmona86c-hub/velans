// Importación programada de publicaciones públicas de GangaGato.
// No necesita librerías de terceros. Nunca guarda credenciales ni estados del Manager.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FILE = path.resolve('data/gangagato-feed.json');
const BUDGET_FILE = path.resolve('data/gangagato-budget.json');
const START_DATE = '2026-11-15';
const MONTHLY_HARD_CAP_CENTS = 400; // Solo para ESTA automatización, en cualquier ventana de 31 días.
const PERIOD_MS = 31 * 24 * 60 * 60 * 1000;
const PER_RUN_CAP_USD = 0.10;
const PER_RUN_CAP_CENTS = 10;
const MAX_ITEMS = 50;
const MAX_STORED_ITEMS = 5000;

export function sanitizeItem(item) {
  if (!item || typeof item !== 'object') return null;
  const url = [ ...(Array.isArray(item.links) ? item.links : []), item.linkPreview?.url, item.text ]
    .filter(x => typeof x === 'string').join(' ');
  const match = url.match(/https?:\/\/(?:www\.)?amazon\.es\/dp\/([A-Z0-9]{10})(?:[/?#\s]|$)/i);
  const price = String(item.text || '').match(/(\d[\d.,]*)\s*€(?:\s*\(?\s*antes\s*(\d[\d.,]*)\s*€)?/i);
  const postedAt = String(item.postedAt || '');
  if (!match || !price || !Number.isFinite(Date.parse(postedAt))) return null;
  const asin = match[1].toUpperCase();
  const canonical = `https://www.amazon.es/dp/${asin}`;
  const label = `${price[1]} €${price[2] ? ` (antes ${price[2]} €)` : ''}`;
  const postId = String(item.id || '').slice(0, 32);
  const originalPost = String(item.url || '');
  if (!/^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+\/[0-9]+$/.test(originalPost)) return null;
  return {
    id: postId, url: originalPost, postedAt,
    channelName: 'GangaGato - Errores de precio, chollos',
    text: `✅ ${label}\n➡️ ${canonical}\nPrecio anunciado en canal; comprobar en Amazon.`,
    links: [canonical],
    linkPreview: { url: canonical, title: String(item.linkPreview?.title || '').slice(0, 180) },
  };
}

export function mergeFeed(feed, incoming, now = new Date().toISOString()) {
  const byId = new Map();
  for (const raw of Array.isArray(feed.items) ? feed.items : []) {
    const item = sanitizeItem(raw);
    if (item) byId.set(item.url, item);
  }
  const before = byId.size;
  for (const raw of incoming) {
    const item = sanitizeItem(raw);
    if (item) byId.set(item.url, item);
  }
  const sorted = [...byId.values()].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
  const items = sorted.slice(0, MAX_STORED_ITEMS);
  const latestDate = items.length ? items[0].postedAt.slice(0, 10) : String(feed.lastPostDate || START_DATE);
  return {
    schemaVersion: 1, updatedAt: now, status: 'ok',
    lastPostDate: latestDate > String(feed.lastPostDate || START_DATE) ? latestDate : String(feed.lastPostDate || START_DATE),
    items, newPosts: byId.size - before,
  };
}

// Registra el coste máximo posible, no el coste estimado. No depende de permisos
// de facturación (que Apify niega a los tokens con alcance limitado).
export function reserveBudget(ledger, now = new Date().toISOString()) {
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs) || !Number.isFinite(Date.parse(now)) ||
      !/^\d{4}-\d{2}-\d{2}T/.test(now)) throw new Error('Fecha de reserva inválida');
  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.reservations)) {
    throw new Error('Registro de presupuesto inválido. Captura cancelada.');
  }
  let reservedCents = 0;
  for (const entry of ledger.reservations) {
    const atMs = Date.parse(entry.at);
    if (!Number.isFinite(atMs) || !Number.isSafeInteger(entry.maxUsdCents) ||
        entry.maxUsdCents < 1 || entry.maxUsdCents > PER_RUN_CAP_CENTS || atMs > nowMs) {
      throw new Error('Registro de presupuesto corrupto. Captura cancelada.');
    }
    if (atMs > nowMs - PERIOD_MS) reservedCents += entry.maxUsdCents;
  }
  if (reservedCents + PER_RUN_CAP_CENTS > MONTHLY_HARD_CAP_CENTS) return null;
  const reservations = ledger.reservations.filter(entry => Date.parse(entry.at) > nowMs - PERIOD_MS);
  reservations.push({ at: now, maxUsdCents: PER_RUN_CAP_CENTS });
  return {
    ledger: { schemaVersion: 1, reservations },
    reservedCents: reservedCents + PER_RUN_CAP_CENTS,
  };
}

async function reserveAndCommitBudget() {
  let ledger;
  try { ledger = JSON.parse(await fs.readFile(BUDGET_FILE, 'utf8')); }
  catch (err) {
    if (err.code !== 'ENOENT') throw err;
    ledger = { schemaVersion: 1, reservations: [] };
  }
  const reservation = reserveBudget(ledger);
  if (!reservation) return false;
  await fs.mkdir(path.dirname(BUDGET_FILE), { recursive: true });
  await fs.writeFile(BUDGET_FILE, JSON.stringify(reservation.ledger, null, 2) + '\n');
  // Commit y push ANTES de contactar con Apify: si no se puede registrar la
  // reserva persistentemente, no se inicia ningún Actor que pueda cobrar.
  try {
    execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { stdio: 'ignore' });
    execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { stdio: 'ignore' });
    execFileSync('git', ['add', '--', 'data/gangagato-budget.json'], { stdio: 'ignore' });
    execFileSync('git', ['commit', '-m', 'Reservar presupuesto de captura Apify'], { stdio: 'ignore' });
    execFileSync('git', ['push', 'origin', 'HEAD:main'], { stdio: 'ignore' });
  } catch {
    throw new Error('No se pudo guardar la reserva en GitHub; no se ha iniciado el scraper.');
  }
  console.log(`Presupuesto reservado: $${(reservation.reservedCents / 100).toFixed(2)} de $4.00 en 31 días. Esta reserva cubre hasta $0.10 para el intento actual.`);
  return true;
}

async function api(url, token, init = {}) {
  const response = await fetch(`https://api.apify.com/v2${url}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (!response.ok) throw new Error(`Apify respondió HTTP ${response.status} en ${url.split('?')[0]}`);
  return response.json();
}

async function run() {
  const token = process.env.APIFY_TOKEN;
  const taskId = process.env.APIFY_TASK_ID;
  if (!token || !taskId) {
    console.log('Sin iniciar capturas: faltan APIFY_TOKEN o APIFY_TASK_ID en la configuración de GitHub. Coste: 0.');
    return;
  }
  if (!/^[A-Za-z0-9_~.-]{5,100}$/.test(taskId)) throw new Error('APIFY_TASK_ID no tiene el formato esperado');
  const feed = JSON.parse(await fs.readFile(FILE, 'utf8'));
  const after = String(feed.lastPostDate || START_DATE);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(after)) throw new Error('Fecha de seguimiento inválida');
  if (!await reserveAndCommitBudget()) {
    console.log('Sin iniciar captura: agotado el presupuesto reservado de $4.00 en 31 días para esta automatización.');
    return;
  }
  console.log(`Capturando hasta ${MAX_ITEMS} publicaciones posteriores a ${after}. Coste máximo de ejecución: $${PER_RUN_CAP_USD.toFixed(2)}.`);
  const options = new URLSearchParams({ maxTotalChargeUsd: PER_RUN_CAP_USD.toFixed(2), maxItems: String(MAX_ITEMS), timeout: '150', restartOnError: 'false' });
  const started = await api(`/actor-tasks/${encodeURIComponent(taskId)}/runs?${options}`, token, {
    method: 'POST', body: JSON.stringify({ postedAfter: after }),
  });
  const runId = started.data?.id;
  if (typeof runId !== 'string') throw new Error('Apify no devolvió ID de ejecución');
  let state = started.data;
  for (let i = 0; i < 40 && !['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(state?.status); i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    state = (await api(`/actor-runs/${encodeURIComponent(runId)}`, token)).data;
  }
  if (state?.status !== 'SUCCEEDED') throw new Error(`La captura terminó en estado ${state?.status || 'desconocido'}. No se importa ningún resultado parcial.`);
  const datasetId = state.defaultDatasetId;
  if (typeof datasetId !== 'string') throw new Error('La ejecución no devolvió dataset');
  const result = await api(`/datasets/${encodeURIComponent(datasetId)}/items?format=json&clean=true&limit=${MAX_ITEMS}`, token);
  const items = Array.isArray(result) ? result : Array.isArray(result.items) ? result.items : [];
  const next = mergeFeed(feed, items);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2) + '\n');
  console.log(`Resultado: ${items.length} mensajes examinados, ${next.newPosts} publicaciones nuevas, ${next.items.length} acumuladas. Precio sin verificar en Amazon.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  run().catch(err => { console.error(`Sincronización detenida: ${err.message}`); process.exitCode = 1; });
}
