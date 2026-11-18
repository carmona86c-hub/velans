// Velan's · buscador de fotos libres para el catálogo.
// Busca cada producto en Wikimedia Commons (todas las secciones) y en
// Open Beauty Facts (belleza) y guarda una lista de CANDIDATAS para revisar
// a mano. No publica nada en la web: solo genera archivos en data/.
//
// Uso:  node scripts/buscar-fotos-libres.mjs [--limite N] [--desde N]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = "VelansFotosLibres/1.0 (https://velans.es; busqueda de imagenes con licencia libre)";
const PAUSA_MS = 150;
const EN_PARALELO = 4;
const ESPERA_MAX_MS = 15000;

// ---------- utilidades puras (probadas en tests/fotos-libres.test.mjs) ----------
export const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'`´]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const GENERICAS = new Set(('para con sin de del la el los las un una y o en por mujer hombre hombres mujeres unisex nino nina ninos ninas bebe ' +
  'pack piezas pieza set juego talla tallas color negro negra blanco blanca azul rojo roja gris verde rosa marron beige dorado dorada plateado plateada ' +
  'camiseta sudadera vaqueros polo pantalon pantalones zapatillas zapatos bota botas sandalia sandalias chaqueta abrigo coat chaleco mochila bolso ' +
  'reloj relojes digital clasico clasica inteligente auriculares inalambricos inalambrico bluetooth wifi camara vigilancia interior exterior altavoz ' +
  'freidora cafetera tostadora molinillo cuchillos almohadas sabanas organizadores bolsas vacio difusor aromas gel crema balsamo mascara corrector ' +
  'protector termico afeitadora polvo peinado bano contorno ojos ml l cm mm kg w v x mas nuevo nueva original elegante comodo comoda basico basica ' +
  'manga larga corta capucha cuello cierre presion deportiva deportivas deportivo ' +
  'ventilador techo luz led linterna metros auto adhesivo cinta rollo womens mens women men sweatshirt crew trainers camisa')
  .split(' '));

/** Saca la consulta de búsqueda (marca + modelo) del nombre del catálogo. */
export function consulta(nombre) {
  const base = String(nombre).split(/\s+[—–-]\s+/)[0];
  const palabras = base.replace(/[()[\]:,;!¡¿?"]/g, ' ').split(/\s+/).filter(Boolean);
  const utiles = palabras.filter(w => !GENERICAS.has(normal(w)) && normal(w).length >= 2);
  const q = (utiles.length ? utiles : palabras).slice(0, 4).join(' ');
  // Sin una palabra con mayúscula o cifra (marca o modelo) la búsqueda sería genérica: no se busca.
  const tieneMarca = utiles.some(w => /[A-Z0-9]/.test(w) && normal(w).length >= 2);
  return { q, util: tieneMarca, tokens: utiles.map(normal).filter(t => t.length >= 2) };
}

/** Segunda consulta: las palabras de búsqueda del enlace de Amazon (suelen llevar el modelo exacto). */
export function consultaAmazon(enlace) {
  try {
    const k = new URL(enlace).searchParams.get('k');
    if (!k) return null;
    const c = consulta(k);
    return c.util ? c : null;
  } catch { return null; }
}

/** Licencias aceptadas para uso comercial con atribución. Rechaza NC y ND. */
export function licenciaValida(lic) {
  const l = String(lic || '').toLowerCase();
  if (!l) return false;
  if (/\bnc\b|non-?commercial|no comercial|\bnd\b|no-?deriv|sin obras derivadas|fair use|uso justo/.test(l)) return false;
  return /^(cc0|cc-zero|public domain|pd|dominio p[uú]blico|cc[ -]by([ -]sa)?([ -][\d.]+)?)(\b|$)/.test(l.trim());
}

export const sinHtml = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();

/** Puntúa cuánto se parece un resultado al producto (0 a 1). */
export function coincidencia(tokens, texto) {
  if (!tokens.length) return 0;
  const t = ' ' + normal(texto) + ' ';
  const hits = tokens.filter(k => t.includes(' ' + k + ' ') || (k.length >= 4 && t.includes(k)));
  // Con una sola palabra (solo la marca) casi siempre salen fotos de otra cosa:
  // se exige marca + modelo, salvo que la palabra sea un código de modelo con cifras.
  if (hits.length < 2 && !(tokens.length === 1 && /\d/.test(tokens[0]) && hits.length === 1)) return Math.min(0.4, hits.length / tokens.length);
  return hits.length / tokens.length;
}

// ---------- acceso a las fuentes ----------
const pausa = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url) {
  for (let intento = 0; intento < 2; intento++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(ESPERA_MAX_MS) });
      if (r.status === 429 || r.status >= 500) { await pausa(2000 * (intento + 1)); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await pausa(1500); }
  }
  return null;
}

export async function buscarCommons(q, tokens) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2', generator: 'search', gsrnamespace: '6',
    gsrsearch: `${q} filetype:bitmap`, gsrlimit: '8', prop: 'imageinfo',
    iiprop: 'url|extmetadata|size', iiurlwidth: '800',
  });
  const j = await getJSON(url);
  const pages = (j && j.query && j.query.pages) || [];
  return pages.map(p => {
    const ii = (p.imageinfo || [])[0] || {}, m = ii.extmetadata || {};
    const lic = (m.LicenseShortName && m.LicenseShortName.value) || '';
    const desc = sinHtml(m.ImageDescription && m.ImageDescription.value);
    return {
      fuente: 'Wikimedia Commons',
      titulo: p.title.replace(/^File:/, ''),
      pagina: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      imagen: ii.thumburl || ii.url, original: ii.url, ancho: ii.width, alto: ii.height,
      autor: sinHtml(m.Artist && m.Artist.value) || 'Desconocido',
      licencia: lic, licenciaUrl: (m.LicenseUrl && m.LicenseUrl.value) || '',
      parecido: coincidencia(tokens, p.title + ' ' + desc),
    };
  }).filter(c => licenciaValida(c.licencia) && c.parecido >= 0.5)
    .sort((a, b) => b.parecido - a.parecido).slice(0, 3);
}

export async function buscarOpenBeautyFacts(q, tokens) {
  const url = 'https://world.openbeautyfacts.org/cgi/search.pl?' + new URLSearchParams({
    search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '5',
    fields: 'code,product_name,brands,image_front_url,url',
  });
  const j = await getJSON(url);
  return ((j && j.products) || []).filter(p => p.image_front_url).map(p => ({
    fuente: 'Open Beauty Facts',
    titulo: [p.brands, p.product_name].filter(Boolean).join(' — '),
    pagina: p.url || `https://world.openbeautyfacts.org/product/${p.code}`,
    imagen: p.image_front_url, original: p.image_front_url,
    autor: 'Colaboradores de Open Beauty Facts', licencia: 'CC BY-SA 3.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.es',
    parecido: coincidencia(tokens, `${p.brands} ${p.product_name}`),
  })).filter(c => c.parecido >= 0.5).sort((a, b) => b.parecido - a.parecido).slice(0, 2);
}

const LIC_OV = { 'cc0': 'CC0', 'pdm': 'Public domain', 'by': 'CC BY', 'by-sa': 'CC BY-SA' };
let openverseActivo = true;
export async function buscarOpenverse(q, tokens) {
  if (!openverseActivo) return [];
  const r = await fetch('https://api.openverse.org/v1/images/?' + new URLSearchParams({ q, license_type: 'commercial', page_size: '10', mature: 'false' }), { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(ESPERA_MAX_MS) }).catch(() => null);
  if (!r) return [];
  if (r.status === 429) { openverseActivo = false; console.log('Openverse: límite alcanzado, se sigue sin Openverse.'); return []; }
  if (!r.ok) return [];
  const j = await r.json().catch(() => null);
  return ((j && j.results) || []).map(x => ({
    fuente: 'Openverse (' + (x.source || x.provider || 'CC') + ')',
    titulo: x.title || '', pagina: x.foreign_landing_url || x.url, imagen: x.thumbnail || x.url, original: x.url,
    autor: x.creator || 'Autor desconocido',
    licencia: LIC_OV[x.license] ? (LIC_OV[x.license] + (x.license_version && /^by/.test(x.license) ? ' ' + x.license_version : '')).trim() : String(x.license || '').toUpperCase(),
    licenciaUrl: x.license_url || '',
    parecido: coincidencia(tokens, (x.title || '') + ' ' + ((x.tags || []).map(t => t.name).join(' '))),
  })).filter(c => licenciaValida(c.licencia) && c.parecido >= 0.5).sort((a, b) => b.parecido - a.parecido).slice(0, 3);
}

export async function buscarOpenProductsFacts(q, tokens) {
  const url = 'https://world.openproductsfacts.org/cgi/search.pl?' + new URLSearchParams({
    search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '5',
    fields: 'code,product_name,brands,image_front_url,url',
  });
  const j = await getJSON(url);
  return ((j && j.products) || []).filter(p => p.image_front_url).map(p => ({
    fuente: 'Open Products Facts',
    titulo: [p.brands, p.product_name].filter(Boolean).join(' — '),
    pagina: p.url || `https://world.openproductsfacts.org/product/${p.code}`,
    imagen: p.image_front_url, original: p.image_front_url,
    autor: 'Colaboradores de Open Products Facts', licencia: 'CC BY-SA 3.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.es',
    parecido: coincidencia(tokens, `${p.brands} ${p.product_name}`),
  })).filter(c => c.parecido >= 0.5).sort((a, b) => b.parecido - a.parecido).slice(0, 2);
}

// ---------- programa ----------
function cargarCatalogo() {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'catalogo-completo.js'), 'utf8'), ctx);
  return ctx.window.VELANS_PREVIEW_DATA.products;
}

const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

async function main() {
  const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : null; };
  const desde = arg('--desde') || 0, limite = arg('--limite') || Infinity;
  const productos = cargarCatalogo().slice(desde, desde + limite);
  const salida = [];
  let conFoto = 0, buscados = 0;
  const procesar = async p => {
    const c = consulta(p.name), ca = consultaAmazon(p.affiliateUrl);
    const consultas = [c, ca].filter(x => x && x.util).filter((x, i, a) => a.findIndex(y => normal(y.q) === normal(x.q)) === i);
    const fila = { id: p.id, nombre: p.name, seccion: p.category, consulta: consultas.map(x => x.q).join(' | '), buscado: consultas.length > 0, candidatas: [] };
    const vistas = new Set(), anadir = l => { for (const x of l) if (!vistas.has(x.imagen)) { vistas.add(x.imagen); fila.candidatas.push(x); } };
    if (consultas.length) {
      buscados++;
      for (const q of consultas) {
        if (p.category === 'Belleza') { anadir(await buscarOpenBeautyFacts(q.q, q.tokens)); await pausa(PAUSA_MS); }
        else { anadir(await buscarOpenProductsFacts(q.q, q.tokens)); await pausa(PAUSA_MS); }
        anadir(await buscarCommons(q.q, q.tokens)); await pausa(PAUSA_MS);
      }
      // Openverse (Flickr y otros bancos con licencia libre): una consulta por producto, la más detallada.
      const qo = consultas[consultas.length - 1]; anadir(await buscarOpenverse(qo.q, qo.tokens)); await pausa(PAUSA_MS);
      fila.candidatas.sort((a, b) => b.parecido - a.parecido); fila.candidatas.splice(6);
    }
    if (fila.candidatas.length) conFoto++;
    salida.push(fila);
    process.stdout.write(`${fila.candidatas.length ? '✔' : '·'} ${p.id} ${p.name}\n`);
  };
  const cola = [...productos];
  await Promise.all(Array.from({ length: EN_PARALELO }, async () => { while (cola.length) await procesar(cola.shift()); }));
  salida.sort((a, b) => a.id - b.id);

  const dir = path.join(ROOT, 'data'); fs.mkdirSync(dir, { recursive: true });
  const fecha = new Date().toISOString();
  fs.writeFileSync(path.join(dir, 'fotos-libres-candidatas.json'), JSON.stringify({ generado: fecha, total: salida.length, buscados, conFoto, productos: salida }, null, 2));
  const lineas = [['id', 'producto', 'seccion', 'consulta', 'fuente', 'foto', 'pagina', 'autor', 'licencia', 'parecido'].join(',')];
  for (const f of salida) for (const c of f.candidatas)
    lineas.push([f.id, f.nombre, f.seccion, f.consulta, c.fuente, c.imagen, c.pagina, c.autor, c.licencia, c.parecido.toFixed(2)].map(csv).join(','));
  fs.writeFileSync(path.join(dir, 'fotos-libres-candidatas.csv'), '﻿' + lineas.join('\n') + '\n');

  const md = [`# Fotos libres candidatas · ${fecha.slice(0, 10)}`, '',
    `Productos: ${salida.length} · buscados: ${buscados} · con alguna candidata: ${conFoto}`, '',
    'Revisar a mano que la foto es el mismo modelo antes de usarla. Citar siempre autor y licencia.', ''];
  for (const f of salida.filter(x => x.candidatas.length)) {
    md.push(`## ${f.id} · ${f.nombre}`);
    for (const c of f.candidatas) md.push(`- [${c.titulo}](${c.pagina}) · ${c.autor} · ${c.licencia} · parecido ${Math.round(c.parecido * 100)} % · ${c.fuente}`);
    md.push('');
  }
  fs.writeFileSync(path.join(dir, 'fotos-libres-candidatas.md'), md.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.slice(0, 4).join('\n') + '\n');
  console.log(`\nHecho: ${conFoto} de ${salida.length} productos con alguna foto candidata (${buscados} buscados).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
