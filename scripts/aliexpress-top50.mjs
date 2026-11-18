// Busca los artículos más vendidos de AliExpress (envío a España) con la API oficial de afiliados.
// Solo genera un JSON de consulta; no publica nada en la web.
import crypto from 'node:crypto';
import fs from 'node:fs';
const KEY = process.env.ALIEXPRESS_APP_KEY, SECRET = process.env.ALIEXPRESS_APP_SECRET, TRACK = process.env.ALIEXPRESS_TRACKING_ID;
if (!KEY || !SECRET || !TRACK) { console.error('Faltan secretos'); process.exit(1); }
const firmar = (p) => crypto.createHmac('sha256', SECRET).update(Object.keys(p).sort().map((k) => k + p[k]).join(''), 'utf8').digest('hex').toUpperCase();
const FIELDS = 'product_id,product_title,target_sale_price,target_original_price,discount,evaluate_rate,lastest_volume,promotion_link,first_level_category_name,second_level_category_name';
async function api(method, extra) {
  const p = { app_key: KEY, method, sign_method: 'sha256', timestamp: String(Date.now()), format: 'json', v: '2.0', page_size: '50', sort: 'LAST_VOLUME_DESC',
    target_currency: 'EUR', target_language: 'ES', ship_to_country: 'ES', tracking_id: TRACK, fields: FIELDS, ...extra };
  p.sign = firmar(p);
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://api-sg.aliexpress.com/sync', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, body: new URLSearchParams(p), signal: AbortSignal.timeout(20000) });
      const j = await r.json();
      if (j.error_response) { console.log('API', method, JSON.stringify(extra), j.error_response.code, j.error_response.msg); await new Promise((s) => setTimeout(s, 1500)); continue; }
      const k = Object.keys(j)[0];
      return j[k]?.resp_result?.result?.products?.product || [];
    } catch (e) { console.log('red', e.message); await new Promise((s) => setTimeout(s, 1500)); }
  }
  return [];
}
const num = (x) => Number(String(x ?? '').replace(/[^0-9.]/g, '')) || 0;
const EXCLUIR = /sexy|sexi|lencer|erótic|erotic|adult|vibrador|consolador|réplica|replica|arma|cuchillo táctico/i;
const todos = new Map();
const add = (lista, origen) => { for (const p of lista) {
  const id = String(p.product_id); const t = String(p.product_title || '').replace(/\s+/g, ' ').trim();
  if (!t || EXCLUIR.test(t) || !String(p.promotion_link || '').startsWith('https://s.click.aliexpress.com/')) continue;
  const v = Number(p.lastest_volume || 0);
  if (!todos.has(id) || todos.get(id).ventas < v) todos.set(id, { id, nombre: t.slice(0, 150), categoria: p.first_level_category_name || '', subcategoria: p.second_level_category_name || '',
    precio: num(p.target_sale_price), precioAntes: num(p.target_original_price), descuento: p.discount || '', valoracion: p.evaluate_rate || '', ventas: v, enlace: p.promotion_link, origen });
} };
// 1) Productos «hot» sin palabra clave
for (let pg = 1; pg <= 6; pg++) { add(await api('aliexpress.affiliate.hotproduct.query', { page_no: String(pg) }), 'hot'); await new Promise((s) => setTimeout(s, 400)); }
// 2) Búsquedas amplias por departamento, ordenadas por ventas
const KW = ['auriculares', 'cargador', 'funda movil', 'cable usb', 'reloj', 'smartwatch', 'zapatillas', 'camiseta', 'calcetines', 'gafas de sol', 'bolso', 'mochila', 'cocina', 'organizador', 'lampara led', 'tira led', 'maquillaje', 'uñas', 'pelo', 'pendientes', 'collar', 'anillo', 'juguetes', 'mascotas', 'herramientas', 'jardin', 'coche accesorios', 'deporte', 'yoga', 'bicicleta', 'pesca', 'camping', 'bebe', 'oficina', 'papeleria', 'teclado', 'raton', 'altavoz', 'power bank', 'soporte movil', 'protector pantalla', 'pegatinas', 'fiesta', 'navidad', 'baño', 'limpieza', 'manualidades', 'ropa mujer', 'ropa hombre', 'pijama'];
for (const kw of KW) { for (const pg of [1, 2]) { add(await api('aliexpress.affiliate.product.query', { keywords: kw, page_no: String(pg) }), kw); await new Promise((s) => setTimeout(s, 350)); } }
const top = [...todos.values()].sort((a, b) => b.ventas - a.ventas).slice(0, 50);
fs.mkdirSync('salida', { recursive: true });
fs.writeFileSync('salida/aliexpress-top50.json', JSON.stringify({ fecha: new Date().toISOString(), candidatos: todos.size, top }, null, 1));
console.log('candidatos', todos.size); top.slice(0, 10).forEach((p, i) => console.log(i + 1, p.ventas, p.nombre.slice(0, 60)));
