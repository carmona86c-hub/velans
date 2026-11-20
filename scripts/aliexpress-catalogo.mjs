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
async function query(keywords, page, sort = 'LAST_VOLUME_DESC') {
  const params = { app_key: KEY, method: 'aliexpress.affiliate.product.query', sign_method: 'sha256', timestamp: String(Date.now()), format: 'json', v: '2.0',
    keywords, page_no: String(page), page_size: '50', sort, target_currency: 'EUR', target_language: 'ES', ship_to_country: 'ES', tracking_id: TRACK,
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
// «Lo más vendido»: los 50 artículos con más ventas en AliExpress (envío a España), sin repetir.
// Se buscan términos amplios ordenados por ventas y se quitan los duplicados: mismo producto
// (id) o el mismo artículo vendido por otra tienda (título casi igual).
const AMPLIAS = ['auriculares', 'cargador', 'funda movil', 'cable usb', 'reloj', 'smartwatch', 'zapatillas', 'camiseta', 'calcetines', 'gafas de sol', 'bolso', 'mochila', 'cocina', 'organizador', 'lampara led', 'tira led', 'maquillaje', 'uñas', 'pelo', 'pendientes', 'collar', 'anillo', 'juguetes', 'mascotas', 'herramientas', 'jardin', 'coche accesorios', 'deporte', 'yoga', 'bicicleta', 'pesca', 'camping', 'bebe', 'oficina', 'papeleria', 'teclado', 'raton', 'altavoz', 'power bank', 'soporte movil', 'protector pantalla', 'pegatinas', 'fiesta', 'navidad', 'baño', 'limpieza', 'manualidades', 'ropa mujer', 'ropa hombre', 'pijama'];
const NO_TOP = /sexy|sexi|lencer|erótic|erotic|adult|vibrador|consolador|réplica|replica|cuchillo|navaja/i;
const STOP = new Set(['de', 'para', 'con', 'y', 'a', 'el', 'la', 'los', 'las', 'en', 'del', 'por', 'un', 'una', 'tipo', 'usb', 'c']);
const fichas = (t) => new Set(t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter((w) => w.length > 1 && !STOP.has(w)).slice(0, 14));
// Mismo artículo: misma primera palabra (marca o tipo) y al menos 60 % de palabras en común.
export function parecidos(a, b) { if ([...a][0] !== [...b][0]) return false; let c = 0; for (const w of a) if (b.has(w)) c++; return c / (a.size + b.size - c || 1) >= 0.6; }
const amplios = new Map();
for (const kw of AMPLIAS) {
  for (const page of [1, 2]) {
    for (const p of await query(kw, page)) {
      const precio = num(p.target_sale_price), antes = num(p.target_original_price), ventas = Number(p.lastest_volume || 0);
      const img = segura(p.product_main_image_url, ['alicdn.com', 'aliexpress-media.com']);
      const link = segura(p.promotion_link, ['s.click.aliexpress.com']);
      const titulo = String(p.product_title || '').replace(/\s+/g, ' ').trim();
      if (!img || !link || !precio || !titulo || NO_TOP.test(titulo)) continue;
      const id = 'ae-' + p.product_id;
      if ((amplios.get(id)?.ventas || -1) >= ventas) continue;
      const conAntes = antes > precio ? antes : precio;
      amplios.set(id, { id, tienda: 'AliExpress', categoria: 'Más vendidos', nombre: titulo.slice(0, 140), imagen: img, precio, precioAntes: conAntes,
        descuento: conAntes > precio ? Math.round((1 - precio / conAntes) * 100) : 0, valoracion: num(p.evaluate_rate), ventas, enlace: link });
    }
    await new Promise((s) => setTimeout(s, 350));
  }
}
const masVendidos = [];
for (const p of [...amplios.values()].sort((a, b) => b.ventas - a.ventas)) {
  if (masVendidos.length >= 50) break;
  const f = fichas(p.nombre);
  if (masVendidos.some((q) => parecidos(f, q._f))) continue;   // mismo artículo de otra tienda
  masVendidos.push({ ...p, _f: f });
}
// Regla permanente: de cada artículo más vendido se muestra la oferta MÁS BARATA de ese mismo
// artículo en AliExpress (otras tiendas que lo venden). Se compara con todo lo ya consultado y
// con una búsqueda extra por su nombre ordenada de más barato a más caro. Solo cuentan tiendas
// fiables (valoración ≥ 85 % y ≥ 20 vendidos) para no llevar al cliente a una oferta dudosa.
export function elegirMasBarato(top, candidatos) {
  const f = fichas(top.nombre);
  const validos = candidatos.filter((c) => c.precio > 0 && (c.id === top.id || (c.valoracion >= 85 && c.ventas >= 20 && parecidos(f, fichas(c.nombre)))));
  const mejor = validos.reduce((m, c) => (c.precio < m.precio || (c.precio === m.precio && c.ventas > m.ventas) ? c : m), top);
  return { ...mejor, categoria: top.categoria, ventasTop: top.ventas, tiendasComparadas: new Set(validos.map((c) => c.id)).size };
}
const aFicha = (p) => {
  const precio = num(p.target_sale_price), antes = num(p.target_original_price), titulo = String(p.product_title || '').replace(/\s+/g, ' ').trim();
  const img = segura(p.product_main_image_url, ['alicdn.com', 'aliexpress-media.com']), link = segura(p.promotion_link, ['s.click.aliexpress.com']);
  if (!img || !link || !precio || !titulo || NO_TOP.test(titulo)) return null;
  const conAntes = antes > precio ? antes : precio;
  return { id: 'ae-' + p.product_id, tienda: 'AliExpress', categoria: 'Más vendidos', nombre: titulo.slice(0, 140), imagen: img, precio, precioAntes: conAntes,
    descuento: conAntes > precio ? Math.round((1 - precio / conAntes) * 100) : 0, valoracion: num(p.evaluate_rate), ventas: Number(p.lastest_volume || 0), enlace: link };
};
const yaVistos = [...amplios.values()];
for (let i = 0; i < masVendidos.length; i++) {
  const top = masVendidos[i];
  const kw = [...top._f].slice(0, 6).join(' ');
  const extra = (await query(kw, 1, 'SALE_PRICE_ASC')).map(aFicha).filter(Boolean);
  await new Promise((s) => setTimeout(s, 350));
  const { _f, ...limpio } = elegirMasBarato(top, [...yaVistos, ...extra]);
  if (limpio.id !== top.id) console.log(`Más barato: ${top.precio} € → ${limpio.precio} € · ${top.nombre.slice(0, 50)}`);
  masVendidos[i] = limpio;
}
masVendidos.forEach((p) => delete p._f);
console.log(`Lo más vendido: ${amplios.size} candidatos → ${masVendidos.length} sin repetir (precio más bajo de cada artículo)`);
// Resto de la web (ofertas por categoría y destacados): si el mismo artículo está más barato en
// otra tienda fiable con descuento real, se muestra esa oferta. Sin repetir artículos.
const conRebaja = [...todos.map(({ busqueda, ...q }) => q), ...yaVistos].filter((c) => c.precioAntes > c.precio && c.valoracion >= 90 && c.ventas >= 30);
function abaratar(lista) {
  const usados = new Set(lista.map((p) => p.id)); let cambios = 0;
  const nueva = lista.map((p) => {
    const { busqueda, ...q } = p; const r = elegirMasBarato(q, conRebaja);
    if (r.id === q.id || usados.has(r.id) || r.precio >= q.precio) return p;
    usados.add(r.id); cambios++; console.log(`[${q.categoria}] ${q.precio} € → ${r.precio} € · ${q.nombre.slice(0, 50)}`);
    return busqueda ? { ...r, busqueda } : r;
  });
  return { nueva, cambios };
}
{ const r = abaratar(salida); salida.splice(0, salida.length, ...r.nueva); console.log(`Ofertas abaratadas: ${r.cambios}`); }
for (const k of Object.keys(destacados)) destacados[k] = abaratar(destacados[k]).nueva;
masVendidos.forEach((p, i) => console.log(`${i + 1}. ${p.ventas} · ${p.precio} € · ${p.nombre.slice(0, 70)}`));
const fecha = new Date().toISOString().slice(0, 10);
// Guías de regalo: búsquedas propias de cada guía (lo más vendido de tiendas fiables).
// La primera palabra de cada búsqueda tiene que aparecer en el título, para que sea relevante.
const BUSQUEDAS_REGALO = {
  'regalos-para-mujer': ['reloj mujer', 'pendientes plata mujer', 'bolso bandolera mujer', 'bufanda mujer', 'joyero'],
  'regalos-para-hombre': ['reloj hombre', 'cartera hombre', 'cinturon hombre', 'afeitadora', 'auriculares inalambricos'],
  'regalos-para-padre': ['destornillador precision', 'linterna recargable', 'cartera hombre piel', 'soporte movil coche', 'reloj hombre acero'],
  'regalos-para-madre': ['manta franela', 'masajeador', 'joyero', 'pendientes perla', 'bolso mujer'],
  'regalos-para-adolescentes': ['auriculares gaming', 'raton gaming', 'teclado mecanico', 'tira led', 'smartwatch'],
  'regalos-para-ninos': ['juguetes niños', 'bloques construccion', 'peluche', 'puzzle', 'juguete educativo'],
  'regalos-amigo-invisible': ['taza', 'calcetines divertidos', 'llavero', 'luz nocturna', 'lampara luna'],
};
const sinTildes = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const regalos = {};
for (const [slug, busquedas] of Object.entries(BUSQUEDAS_REGALO)) {
  const lista = []; const ids = new Set();
  for (const kw of busquedas) {
    const raiz = sinTildes(kw.split(' ')[0]).slice(0, 5);
    const buenos = [];
    for (const p of await query(kw, 1)) {
      const precio = num(p.target_sale_price), antes = num(p.target_original_price) || precio;
      const valor = num(p.evaluate_rate), ventas = Number(p.lastest_volume || 0);
      const img = segura(p.product_main_image_url, ['alicdn.com', 'aliexpress-media.com']);
      const link = segura(p.promotion_link, ['s.click.aliexpress.com']);
      const titulo = String(p.product_title || '').replace(/\s+/g, ' ').trim();
      if (!img || !link || !precio || valor < 88 || ventas < 30 || NO_TOP.test(titulo) || !sinTildes(titulo).includes(raiz)) continue;
      buenos.push({ id: 'ae-' + p.product_id, tienda: 'AliExpress', categoria: 'Regalos', nombre: titulo.slice(0, 140), imagen: img,
        precio, precioAntes: antes, descuento: antes > precio ? Math.round((1 - precio / antes) * 100) : 0, valoracion: valor, ventas, enlace: link });
    }
    await new Promise((s) => setTimeout(s, 400));
    buenos.sort((a, b) => b.ventas - a.ventas);
    let n = 0;
    for (const q of buenos) { if (n >= 4) break; if (ids.has(q.id) || lista.some((r) => parecidos(fichas(q.nombre), fichas(r.nombre)))) continue; ids.add(q.id); lista.push(q); n++; }
  }
  regalos[slug] = lista;
  console.log(`Guía ${slug}: ${lista.length} artículos`);
}

fs.writeFileSync('aliexpress-productos.js', `/* Productos de AliExpress (API oficial de afiliados, tracking velans-21). Actualizado: ${fecha}. Precios orientativos: pueden cambiar en AliExpress. */\nwindow.VELANS_ALIEXPRESS = ${JSON.stringify({ actualizado: fecha, productos: salida.map(({ busqueda, ...q }) => q), destacados, masVendidos, regalos }, null, 1)};\n`);
const res = salida.map((p) => `- [${p.categoria}] −${p.descuento}% · ${p.precio} € (antes ${p.precioAntes} €) · ★${p.valoracion}% · ${p.ventas} vendidos · ${p.nombre.slice(0, 60)}`).join('\n');
console.log(res);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Selección AliExpress (${salida.length})\n\n${res}\n`);
