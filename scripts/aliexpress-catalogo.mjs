// Selección de productos de AliExpress con mayor descuento (API oficial de afiliados).
// Genera aliexpress-productos.js. No publica nada por sí mismo.
import crypto from 'node:crypto';
import fs from 'node:fs';

const KEY = process.env.ALIEXPRESS_APP_KEY, SECRET = process.env.ALIEXPRESS_APP_SECRET, TRACK = process.env.ALIEXPRESS_TRACKING_ID;
if (!KEY || !SECRET || !TRACK) { console.error('Faltan secretos'); process.exit(1); }
const POR_CATEGORIA = Number(process.env.POR_CATEGORIA || 20);

// [búsqueda, palabras que DEBE contener el título] — evita resultados que no tienen que ver
export const CATEGORIAS = {
  Moda: [['zapatillas hombre', /zapatilla|sneaker|calzado deportivo/], ['zapatillas mujer', /zapatilla|sneaker/], ['chaqueta mujer', /chaqueta|abrigo|cazadora|parka/], ['chaqueta hombre', /chaqueta|abrigo|cazadora|parka/],
    ['bolso mujer', /bolso|bandolera|cartera/], ['reloj hombre', /reloj/], ['reloj mujer', /reloj/], ['gafas de sol', /gafas de sol/], ['sudadera', /sudadera|hoodie/], ['vestido mujer', /vestido/], ['jersey', /jersey|suéter|sueter|cárdigan|cardigan/], ['vaqueros', /vaquero|jeans/], ['botas mujer', /bota|botín|botin/], ['bufanda', /bufanda|pañuelo/], ['cartera hombre', /cartera|billetera/], ['camisa hombre', /camisa/]],
  Tecnología: [['auriculares bluetooth', /auricular/], ['smartwatch', /reloj inteligente|smartwatch|smart watch/], ['cargador rapido', /cargador/], ['power bank', /power ?bank|batería externa|bateria externa/],
    ['altavoz bluetooth', /altavoz/], ['teclado mecanico', /teclado/], ['raton inalambrico', /ratón|raton/], ['camara vigilancia wifi', /cámara|camara/], ['soporte movil', /soporte/], ['cable usb c', /cable/], ['auriculares inalambricos', /auricular/], ['proyector', /proyector/], ['tablet', /tablet|tableta/], ['hub usb', /hub|adaptador/]],
  Hogar: [['organizador cocina', /organizador|estante|almacenamiento/], ['lampara led', /lámpara|lampara/], ['utensilios cocina', /utensilio|cocina/], ['almacenamiento hogar', /almacenamiento|organizador|caja/], ['sabanas', /sábana|sabana|funda de colchón|edredón|nórdic/],
    ['cortinas', /cortina/], ['decoracion hogar', /decoraci/], ['herramientas cocina', /cocina|cortador|pelador|rallador/], ['aspiradora inalambrica', /aspirador/], ['tira led', /tira.*led|led.*tira/], ['toallas', /toalla/], ['cojines', /cojín|cojin|funda de cojín/], ['vajilla', /plato|vajilla|taza|vaso/], ['sarten', /sartén|sarten|olla/], ['alfombra', /alfombra/]],
  Belleza: [['brochas maquillaje', /brocha|pincel/], ['cepillo alisador', /alisador|plancha/], ['masajeador facial', /masajeador|facial/], ['set manicura', /manicura|uñas|unas/], ['rizador pelo', /rizador|ondulador/],
    ['recortadora barba', /recortador|afeitadora|barba/], ['organizador maquillaje', /maquillaje/], ['espejo maquillaje led', /espejo/], ['secador pelo', /secador/], ['depiladora', /depil/], ['pinceles maquillaje', /pincel|brocha/], ['plancha pelo', /plancha|alisador/], ['cepillo facial', /cepillo/], ['bolsa aseo', /neceser|bolsa de aseo|cosmético|cosmetico/], ['cepillo dientes electrico', /cepillo de dientes/]],
  Deportes: [['bandas elasticas', /banda|elástic|elastic/], ['esterilla yoga', /esterilla|yoga/], ['botella deporte', /botella/], ['mancuernas', /mancuerna|pesa/], ['ropa deportiva mujer', /deportiv|yoga|leggings|mallas/],
    ['ropa deportiva hombre', /deportiv|camiseta|pantal/], ['mochila senderismo', /mochila/], ['guantes gimnasio', /guante/], ['comba', /comba|cuerda de saltar|saltar/], ['rodillera', /rodillera/], ['rueda abdominal', /rueda|abdominal/], ['zapatillas running', /zapatilla/], ['mallas deporte mujer', /mallas|leggings/], ['bolsa deporte', /bolsa|mochila/], ['pelota', /pelota|balón|balon/]],
};
const EXCLUIR = /moto|motocicleta|coche|automóvil|automovil|repuesto|recambio|sexy|sexi|lencería|lenceria|halloween|réplica|replica/i;

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

const salida = []; const vistos = new Set(); const todos = [];
for (const [cat, palabras] of Object.entries(CATEGORIAS)) {
  const candidatos = [];
  for (const [kw, exige] of palabras) {
    for (const page of [1, 2, 3]) {
      for (const p of await query(kw, page)) {
        const precio = num(p.target_sale_price), antes = num(p.target_original_price);
        const valor = num(p.evaluate_rate), ventas = Number(p.lastest_volume || 0);
        const img = segura(p.product_main_image_url, ['alicdn.com', 'aliexpress-media.com']);
        const link = segura(p.promotion_link, ['s.click.aliexpress.com']);
        if (!img || !link || !precio || !antes || antes <= precio) continue;
        const titulo = String(p.product_title || '');
        if (!exige.test(titulo.toLowerCase()) || EXCLUIR.test(titulo)) continue;   // relevancia
        const descuento = Math.round((1 - precio / antes) * 100);
        if (valor < 90 || ventas < 30 || descuento < 20) continue;   // calidad mínima
        candidatos.push({ id: 'ae-' + p.product_id, tienda: 'AliExpress', categoria: cat, busqueda: kw,
          nombre: String(p.product_title).replace(/\s+/g, ' ').trim().slice(0, 140), imagen: img,
          precio, precioAntes: antes, descuento, valoracion: valor, ventas, enlace: link });
      }
      await new Promise((s) => setTimeout(s, 400));
    }
  }
  todos.push(...candidatos);
  candidatos.sort((a, b) => b.descuento - a.descuento || b.ventas - a.ventas);
  const porBusqueda = {}; let n = 0;
  for (const c of candidatos) {                         // variedad: máx. 3 por búsqueda
    if (n >= POR_CATEGORIA || vistos.has(c.id) || (porBusqueda[c.busqueda] || 0) >= 3) continue;
    vistos.add(c.id); porBusqueda[c.busqueda] = (porBusqueda[c.busqueda] || 0) + 1; salida.push(c); n++;
  }
  console.log(`${cat}: ${candidatos.length} candidatos → ${n} elegidos`);
}
// Destacados: los más vendidos con buen descuento. Puntuación del MISMO producto:
// 70 % ventas (dominante, en escala logarítmica) + 30 % descuento.
export function puntuar(lista) {
  const lv = lista.map((p) => Math.log10(1 + p.ventas)); const ds = lista.map((p) => p.descuento);
  const n = (x, a) => { const mn = Math.min(...a), mx = Math.max(...a); return mx > mn ? (x - mn) / (mx - mn) : 0; };
  return lista.map((p, i) => ({ ...p, puntuacion: Math.round((0.7 * n(lv[i], lv) + 0.3 * n(ds[i], ds)) * 1000) / 1000 }));
}
const unicos = [...new Map(todos.map((p) => [p.id, p])).values()];
const puntuados = puntuar(unicos).sort((a, b) => b.puntuacion - a.puntuacion);
const destacados = { Todas: [] };
const porCat = {};
for (const p of puntuados) {
  const { busqueda, ...q } = p;
  if (destacados.Todas.length < 12 && (porCat[p.categoria] || 0) < 4) { destacados.Todas.push(q); porCat[p.categoria] = (porCat[p.categoria] || 0) + 1; }
  destacados[p.categoria] = destacados[p.categoria] || [];
  if (destacados[p.categoria].length < 10) destacados[p.categoria].push(q);
}
console.log('Destacados (más vendidos + descuento):\n' + destacados.Todas.map((p) => `- ${p.puntuacion} · ${p.ventas} vendidos · −${p.descuento}% · ${p.nombre.slice(0, 50)}`).join('\n'));
const fecha = new Date().toISOString().slice(0, 10);
fs.writeFileSync('aliexpress-productos.js', `/* Productos de AliExpress (API oficial de afiliados, tracking velans-21). Actualizado: ${fecha}. Precios orientativos: pueden cambiar en AliExpress. */\nwindow.VELANS_ALIEXPRESS = ${JSON.stringify({ actualizado: fecha, productos: salida.map(({ busqueda, ...q }) => q), destacados }, null, 1)};\n`);
const res = salida.map((p) => `- [${p.categoria}] −${p.descuento}% · ${p.precio} € (antes ${p.precioAntes} €) · ★${p.valoracion}% · ${p.ventas} vendidos · ${p.nombre.slice(0, 60)}`).join('\n');
console.log(res);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Selección AliExpress (${salida.length})\n\n${res}\n`);
