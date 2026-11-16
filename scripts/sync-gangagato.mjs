// Importación programada de publicaciones públicas de GangaGato.
// No necesita librerías de terceros. Nunca guarda credenciales ni estados del Manager.
import fs from 'node:fs/promises';
import path from 'node:path';

const FILE = path.resolve('data/gangagato-feed.json');
const START_DATE = '2026-11-15';
const MONTHLY_HARD_CAP_USD = 4.00; // Margen conservador frente a los 5 € disponibles.
const PER_RUN_CAP_USD = 0.10;
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
  // Consulta la facturación real antes de cada ejecución; si falla, no gasta.
  const usage = await api('/users/me/usage/monthly', token);
  const total = Number(usage.data?.totalUsageCreditsUsdAfterVolumeDiscount);
  if (!Number.isFinite(total) || total < 0) {
    throw new Error('Consumo de Apify desconocido. Ejecución cancelada sin iniciar Actor.');
  }
  const spent = total;
  const available = Math.floor((MONTHLY_HARD_CAP_USD - spent) * 100) / 100;
  if (available < 0.10) {
    console.log(`Sin iniciar captura: consumo mensual de Apify ${spent.toFixed(2)} USD, margen insuficiente.`);
    return;
  }
  const cap = Math.min(PER_RUN_CAP_USD, available);
  const after = String(feed.lastPostDate || START_DATE);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(after)) throw new Error('Fecha de seguimiento inválida');
  console.log(`Capturando hasta ${MAX_ITEMS} publicaciones posteriores a ${after}. Coste máximo de ejecución: $${cap.toFixed(2)}.`);
  const options = new URLSearchParams({ maxTotalChargeUsd: cap.toFixed(2), maxItems: String(MAX_ITEMS), timeout: '150', restartOnError: 'false' });
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
