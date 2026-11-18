// Selección de productos de AliExpress con mayor descuento (API oficial de afiliados).
// Genera aliexpress-productos.js. No publica nada por sí mismo.
import crypto from 'node:crypto';
import fs from 'node:fs';

const KEY = process.env.ALIEXPRESS_APP_KEY, SECRET = process.env.ALIEXPRESS_APP_SECRET, TRACK = process.env.ALIEXPRESS_TRACKING_ID;
if (!KEY || !SECRET || !TRACK) { console.error('Faltan secretos'); process.exit(1); }
const POR_CATEGORIA = Number(process.env.POR_CATEGORIA || 20);

export const CATEGORIAS = {
  Moda: ['zapatillas hombre', 'zapatillas mujer', 'chaqueta mujer', 'chaqueta hombre', 'bolso mujer', 'reloj hombre', 'reloj mujer', 'gafas de sol', 'sudadera', 'mochila'],
  Tecnología: ['auriculares bluetooth', 'smartwatch', 'cargador rapido', 'power bank', 'altavoz bluetooth', 'teclado mecanico', 'raton inalambrico', 'camara vigilancia wifi', 'soporte movil', 'cable usb c'],
  Hogar: ['organizador cocina', 'lampara led', 'utensilios cocina', 'almacenamiento hogar', 'sabanas', 'cortinas', 'decoracion hogar', 'herramientas cocina', 'aspiradora inalambrica', 'tira led'],
  Belleza: ['brochas maquillaje', 'cepillo alisador', 'masajeador facial', 'set manicura', 'rizador pelo', 'recortadora barba', 'organizador maquillaje', 'espejo maquillaje led', 'secador pelo', 'depiladora'],
  Deportes: ['bandas elasticas', 'esterilla yoga', 'botella deporte', 'mancuernas', 'ropa deportiva mujer', 'ropa deportiva hombre', 'mochila senderismo', 'guantes gimnasio', 'comba', 'rodillera'],
};

function firmar(params) {
  const base = Object.keys(params).sort().map((k) => k + params[k]).join('');
  return crypto.createHmac('sha256', SECRET).update(base, 'utf8').digest('hex').toUpperCase();
}
async function query(keywords, page) {
  const params = { app_key: KEY, method: 'aliexpress.affiliate.product.query', sign_method: 'sha256', timestamp: String(Date.now()), format: 'json', v: '2.0',
    keywords, page_no: String(page), page_size: '50', sort: 'LAST_VOLUME_DESC', target_currency: 'EUR', target_language: 'ES', ship_to_country: 'ES', tracking_id: TRACK,
    fields: 'product_id,product_title,product_main_image_url,target_sale_price,target_original_price,discount,evaluate_rate,lastest_volume,promotion_link,first_level_category_name' };
  params.sign = firmar(params);
  for (let intento = 0; intento < 3; intento++) {
    try {
      const r = await fetch('https://api-sg.aliexpress.com/sync', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, body: new URLSearchParams(params), signal: AbortSignal.timeout(20000) });
      const j = await r.json();
      if (j.error_response) { console.log('API', keywords, j.error_response.code, j.error_response.msg); await new Promise((s) => setTimeout(s, 1500)); continue; }
      return j.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || [];
    } catch (e) { console.log('red', keywords, e.message); await new Promise((s) => setTimeout(s, 1500)); }
  }
  return [];
}
const num = (x) => Number(String(x ?? '').replace(/[^0-9.]/g, '')) || 0;
const segura = (u, hosts) => { try { const x = new URL(u); return x.protocol === 'https:' && hosts.some((h) => x.hostname === h || x.hostname.endsWith('.' + h)) ? x.href : null; } catch { return null; } };

const salida = []; const vistos = new Set();
for (const [cat, palabras] of Object.entries(CATEGORIAS)) {
  const candidatos = [];
  for (const kw of palabras) {
    for (const page of [1, 2]) {
      for (const p of await query(kw, page)) {
        const precio = num(p.target_sale_price), antes = num(p.target_original_price);
        const valor = num(p.evaluate_rate), ventas = Number(p.lastest_volume || 0);
        const img = segura(p.product_main_image_url, ['alicdn.com', 'aliexpress-media.com']);
        const link = segura(p.promotion_link, ['s.click.aliexpress.com']);
        if (!img || !link || !precio || !antes || antes <= precio) continue;
        const descuento = Math.round((1 - precio / antes) * 100);
        if (valor < 90 || ventas < 50 || descuento < 20) continue;   // calidad mínima
        candidatos.push({ id: 'ae-' + p.product_id, tienda: 'AliExpress', categoria: cat, busqueda: kw,
          nombre: String(p.product_title).replace(/\s+/g, ' ').trim().slice(0, 140), imagen: img,
          precio, precioAntes: antes, descuento, valoracion: valor, ventas, enlace: link });
      }
      await new Promise((s) => setTimeout(s, 400));
    }
  }
  candidatos.sort((a, b) => b.descuento - a.descuento || b.ventas - a.ventas);
  const porBusqueda = {}; let n = 0;
  for (const c of candidatos) {                         // variedad: máx. 3 por búsqueda
    if (n >= POR_CATEGORIA || vistos.has(c.id) || (porBusqueda[c.busqueda] || 0) >= 3) continue;
    vistos.add(c.id); porBusqueda[c.busqueda] = (porBusqueda[c.busqueda] || 0) + 1; salida.push(c); n++;
  }
  console.log(`${cat}: ${candidatos.length} candidatos → ${n} elegidos`);
}
const fecha = new Date().toISOString().slice(0, 10);
fs.writeFileSync('aliexpress-productos.js', `/* Productos de AliExpress (API oficial de afiliados, tracking velans-21). Actualizado: ${fecha}. Precios orientativos: pueden cambiar en AliExpress. */\nwindow.VELANS_ALIEXPRESS = ${JSON.stringify({ actualizado: fecha, productos: salida }, null, 1)};\n`);
const res = salida.map((p) => `- [${p.categoria}] −${p.descuento}% · ${p.precio} € (antes ${p.precioAntes} €) · ★${p.valoracion}% · ${p.ventas} vendidos · ${p.nombre.slice(0, 60)}`).join('\n');
console.log(res);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Selección AliExpress (${salida.length})\n\n${res}\n`);
