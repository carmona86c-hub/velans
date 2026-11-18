// Velan's · descarga las fotos libres APROBADAS (scripts/fotos-libres-seleccion.json),
// las guarda en img/libres/ y genera fotos-libres.js (créditos) y creditos-imagenes.html.
// Se ejecuta en GitHub Actions (tarea «Velans - preparar fotos libres para la web»).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { licenciaValida, sinHtml } from './buscar-fotos-libres.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'VelansFotosLibres/1.0 (https://velans.es; imagenes con licencia libre y atribucion)';
const H = { 'User-Agent': UA, 'Api-User-Agent': UA };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function json(url) { const r = await fetch(url, { headers: { ...H, Accept: 'application/json' } }); if (!r.ok) throw Error(`${r.status} ${url}`); return r.json(); }
async function bajar(url, destinoSinExt) {
  const r = await fetch(url, { headers: H }); if (!r.ok) throw Error(`${r.status} ${url}`);
  const tipo = r.headers.get('content-type') || '';
  const ext = /png/.test(tipo) ? 'png' : /webp/.test(tipo) ? 'webp' : 'jpg';
  if (!/^image\//.test(tipo)) throw Error(`No es una imagen: ${tipo} ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 1.5e6) throw Error(`Imagen demasiado grande (${buf.length} bytes): ${url}`);
  fs.writeFileSync(`${destinoSinExt}.${ext}`, buf);
  return path.basename(`${destinoSinExt}.${ext}`);
}

async function commons(pagina) {
  const titulo = decodeURIComponent(new URL(pagina).pathname.replace(/^\/wiki\//, '')).replace(/_/g, ' ');
  const j = await json('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', titles: titulo, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '800' }));
  const ii = j.query.pages[0].imageinfo[0], m = ii.extmetadata || {};
  return { imagen: ii.thumburl || ii.url, autor: sinHtml(m.Artist && m.Artist.value) || 'Autor desconocido', licencia: (m.LicenseShortName && m.LicenseShortName.value) || '', licenciaUrl: (m.LicenseUrl && m.LicenseUrl.value) || '', fuente: 'Wikimedia Commons', titulo };
}
async function openBeautyFacts(pagina) {
  const code = new URL(pagina).pathname.split('/')[2];
  const j = await json(`https://world.openbeautyfacts.org/api/v2/product/${code}?fields=image_front_url,product_name,brands`);
  if (!j.product || !j.product.image_front_url) throw Error('Sin foto en Open Beauty Facts: ' + pagina);
  return { imagen: j.product.image_front_url, autor: 'Colaboradores de Open Beauty Facts', licencia: 'CC BY-SA 3.0', licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.es', fuente: 'Open Beauty Facts', titulo: [j.product.brands, j.product.product_name].filter(Boolean).join(' — ') };
}

const sel = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/fotos-libres-seleccion.json'), 'utf8')).fotos;
const dir = path.join(ROOT, 'img/libres'); fs.mkdirSync(dir, { recursive: true });
const creditos = {};
for (const f of sel) {
  try {
    const d = /commons\.wikimedia\.org/.test(f.pagina) ? await commons(f.pagina) : await openBeautyFacts(f.pagina);
    if (!licenciaValida(d.licencia)) { console.log(`✗ ${f.id}: licencia no válida (${d.licencia})`); continue; }
    const archivo = await bajar(d.imagen, path.join(dir, String(f.id)));
    creditos[f.id] = { src: `img/libres/${archivo}`, autor: d.autor.slice(0, 160), licencia: d.licencia, licenciaUrl: d.licenciaUrl, fuente: d.fuente, pagina: f.pagina, titulo: d.titulo };
    console.log(`✔ ${f.id} ${archivo} · ${d.autor} · ${d.licencia}`);
  } catch (e) { console.log(`✗ ${f.id}: ${e.message}`); }
  await new Promise(r => setTimeout(r, 400));
}

fs.writeFileSync(path.join(ROOT, 'fotos-libres.js'),
  `/* Velan's · fotos con licencia libre y su atribución (generado por scripts/descargar-fotos-libres.mjs). */\nwindow.VELANS_FOTOS_LIBRES=${JSON.stringify(creditos)};\n`);

// Página de créditos con la misma cabecera de seguridad que el aviso legal.
const aviso = fs.readFileSync(path.join(ROOT, 'aviso-legal.html'), 'utf8');
const head = aviso.slice(0, aviso.indexOf('</head>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Créditos de imágenes — Velan’s</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Autores y licencias de las fotografías con licencia libre que se usan en Velan’s.">')
  .replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://velans.es/creditos-imagenes.html">')
  .replace('</style>', '  .foto{display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center}\n  .foto img{width:96px;height:96px;object-fit:contain;background:#fff;border:1px solid var(--edge);border-radius:8px}\n</style>');
const filas = Object.entries(creditos).map(([id, c]) => `  <section class="foto"><img src="./${esc(c.src)}" alt="" loading="lazy" width="96" height="96"><div><h2>${esc(c.titulo)}</h2><p>Autor: ${esc(c.autor)} · Licencia: ${c.licenciaUrl ? `<a href="${esc(c.licenciaUrl)}" rel="noopener license" target="_blank">${esc(c.licencia)}</a>` : esc(c.licencia)} · Fuente: <a href="${esc(c.pagina)}" rel="noopener" target="_blank">${esc(c.fuente)}</a></p></div></section>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'creditos-imagenes.html'), `${head}</head>
<body>
<main class="wrap">
  <a class="back" href="./">← Volver a Velan’s</a>
  <p class="logo">Velan<span>’</span>s</p>
  <h1>Créditos de imágenes</h1>
  <p class="upd">Algunas fotografías de productos proceden de bancos de imágenes con licencia libre. Agradecemos a sus autores que las compartan. Las marcas y diseños que aparecen pertenecen a sus titulares; su uso es solo identificativo.</p>
${filas}
</main>
</body>
</html>
`);
console.log(`\nHecho: ${Object.keys(creditos).length} de ${sel.length} fotos preparadas.`);
