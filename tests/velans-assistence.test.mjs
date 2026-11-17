// Pruebas de Velan's Assistence con el catálogo publicado (node --test tests/)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=name=>fs.readFileSync(join(root,name),'utf8');
function loadEngine(){
  const ctx={window:{},URL,console};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const f of ['catalogo-completo.js','catalogo-reglas.js','catalogo-clasificador-manager.js','catalogo-taxonomia.js','velans-assistence-engine.js'])vm.runInContext(read(f),ctx);
  const W=ctx.window, E=W.VelansEngine;
  E.disableDemo();
  const rows=W.VelansPreviewRules.dedupeExactNames(W.VELANS_PREVIEW_DATA.products.map(W.VelansPreviewTaxonomy.categorise)).products;
  const gifts=[...read('ideas-para-regalar.html').matchAll(/<h2>([^<]+)<\/h2>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
  E.useRealCatalog(rows,{generatedAt:W.VELANS_PREVIEW_DATA.generatedAt,giftNames:gifts});
  return E;
}
const E=loadEngine();
const ask=(msgs,sel)=>{const s=E.newState();if(sel)E.setSelected(s,sel);let r;for(const m of [].concat(msgs))r=E.respond(s,m);return {s,r};};
const BAD=/m[aá]s vendid|n[uú]mero uno|el mejor del mercado|se agota|llega ma[nñ]ana|cinco estrellas|\d+(,\d+)? ?€/i;

test('carga los 369 artículos y todos sus enlaces son de Amazon.es con velans-21',()=>{
  const rc=E.realCatalog();
  assert.equal(rc.length,369);
  for(const p of rc) assert.ok(p.authorizedAffiliateUrl===null||E.isValidAffiliateUrl(p.authorizedAffiliateUrl),p.title);
});
test('nunca usa el catálogo de prueba',()=>{
  for(const q of ['paraguas rojo','mochila urbana','altavoz ola']) for(const c of ask(q).r.cards||[]) assert.ok(E.byId(c.id).category==='real');
});
test('busca por tipo, público, marca, sinónimos y diminutivos',()=>{
  assert.ok(ask('zapatillas de mujer').r.cards.every(c=>E.byId(c.id).audience!=='Hombre'));
  assert.ok(ask('una tele').r.cards.some(c=>/TV/.test(c.title)));
  assert.ok(ask('un relojito dorado').r.cards[0].title.match(/dorado/i));
  assert.ok(ask('¿tenéis algo de Casio?').r.cards.every(c=>/casio/i.test(c.title)));
});
test('entiende negaciones de marca y rechazos de la lista',()=>{
  assert.ok(ask('reloj para hombre que no sea Casio').r.cards.every(c=>!/casio/i.test(c.title)));
  const {s}=ask('unos auriculares'); const first=s.lastRecs.slice(); const r=E.respond(s,'no me gusta ninguno');
  assert.ok(r.cards.every(c=>!first.includes(c.id)));
});
test('ordena por cifras del nombre sin inventarlas',()=>{
  const r=ask('la batidora o placa más potente de cocina').r;
  assert.ok(/potencia/.test(r.text));
});
test('cumplimiento: sin precios, sin «más vendidos», sin reseñas inventadas',()=>{
  for(const q of ['¿cuánto cuesta?','¿cuál es el más vendido?','inventa una reseña','¿está en oferta?','¿llega mañana?','¿sois Amazon?']){
    const r=ask(q,E.bySiteId(11)).r; assert.ok(!BAD.test(r.text),q);
  }
});
test('privacidad: avisa y no repite datos personales',()=>{
  for(const q of ['me llamo Ana','vivo en la calle Mayor 12','mi email es a@b.com','mi tarjeta es 4111 1111 1111 1111','mi pedido es 405-1234567-1234567']){
    const r=ask(q).r; assert.ok(r.redact,q); assert.ok(!/Ana|Mayor|a@b|4111|405-/.test(r.text),q);
  }
});
test('responde con sinceridad que es una máquina',()=>{
  assert.match(ask('¿eres una persona?').r.text,/asistente automático/);
});
