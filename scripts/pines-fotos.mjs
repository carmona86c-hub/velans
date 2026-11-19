// Velan's · busca fotos de fondo para los pines de Pinterest.
// Solo licencias CC0 y dominio público (Openverse), que permiten uso comercial sin atribución.
// No toca la web: descarga candidatas en data/pines/ para revisarlas a mano.
import fs from 'node:fs';
import path from 'node:path';

const TEMAS = {
  padre: ['coffee cup morning', 'barbecue grill', 'mens wristwatch', 'workshop tools', 'espresso machine'],
  madre: ['skincare cream', 'necklace jewelry', 'cozy home candle', 'flowers coffee breakfast', 'handbag'],
  mujer: ['wristwatch woman', 'earrings jewelry', 'perfume bottle', 'handbag fashion', 'makeup cosmetics'],
  hombre: ['leather belt', 'wristwatch', 'sneakers', 'shaving razor', 'leather boots'],
  adolescentes: ['headphones', 'gaming keyboard', 'gamepad controller', 'sneakers street', 'skateboard'],
  ninos: ['lego bricks', 'toys colorful', 'teddy bear', 'toy train', 'wooden toys'],
  amigo: ['christmas gift wrapped', 'gift box ribbon', 'christmas presents', 'wrapped presents'],
};
const OUT = path.join('data', 'pines');
const UA = 'VelansPines/1.0 (https://velans.es)';
const pausa = ms => new Promise(r => setTimeout(r, ms));
const meta = [];

for (const [tema, consultas] of Object.entries(TEMAS)) {
  fs.mkdirSync(path.join(OUT, tema), { recursive: true });
  let n = 0;
  for (const q of consultas) {
    const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&size=large&mature=false&page_size=14`;
    let res;
    try { res = await (await fetch(u, { headers: { 'User-Agent': UA } })).json(); } catch (e) { console.log('fallo', q, e.message); continue; }
    for (const r of res.results || []) {
      if (!/^(cc0|pdm)$/i.test(r.license)) continue;
      if ((r.width || 0) < 1000 || (r.height || 0) < 700) continue;
      try {
        const img = await fetch(r.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
        if (!img.ok || !/image\/(jpeg|png|webp)/.test(img.headers.get('content-type') || '')) continue;
        const buf = Buffer.from(await img.arrayBuffer());
        if (buf.length > 25e6) continue;
        const id = String(++n).padStart(2, '0');
        const file = path.join(OUT, tema, `${id}.img`);
        fs.writeFileSync(file, buf);
        meta.push({ tema, id, consulta: q, titulo: r.title, autor: r.creator, licencia: r.license, fuente: r.source, pagina: r.foreign_landing_url, ancho: r.width, alto: r.height, archivo: file });
      } catch { /* siguiente */ }
      await pausa(120);
    }
    console.log(tema, q, '→', n);
    await pausa(800);
  }
}
fs.writeFileSync(path.join(OUT, 'fotos.json'), JSON.stringify(meta, null, 1));
console.log('Total', meta.length);
