// El asistente distingue Amazon y AliExpress, recuerda la tienda elegida y entiende formas coloquiales.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
function load(){
  const ctx={window:{},URL,console};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const f of ['catalogo-completo.js','catalogo-reglas.js','catalogo-clasificador-manager.js','catalogo-taxonomia.js','aliexpress-productos.js','velans-assistence-engine.js','velans-assistence-dialogue.js'])vm.runInContext(read(f),ctx);
  const W=ctx.window,E=W.VelansDialogue.create(W.VelansEngine);E.disableDemo();
  const amazon=W.VelansPreviewRules.dedupeExactNames(W.VELANS_PREVIEW_DATA.products.map(W.VelansPreviewTaxonomy.categorise)).products;
  const ae=W.VELANS_ALIEXPRESS.productos.map(p=>({id:p.id,name:p.nombre,category:p.categoria,store:'AliExpress',source:'aliexpress',description:`Oferta de AliExpress con un ${p.descuento} % de descuento. ${p.ventas} vendidos.`}));
  E.useRealCatalog([...amazon,...ae],{generatedAt:'2026-11-18',giftNames:[]});
  return E;
}
const stores=(E,r)=>[...new Set((r.cards||[]).map(c=>c.store))];
test('sin elegir tienda, se busca en la tienda que se está viendo',()=>{
  const E=load(),s=E.newState();
  s.viewStore='Amazon';const a=E.respond(s,'Busco auriculares bluetooth');
  assert.ok(a.cards.length);assert.deepEqual(stores(E,a),['Amazon']);
  const s2=E.newState();s2.viewStore='AliExpress';const b=E.respond(s2,'Busco auriculares bluetooth');
  assert.ok(b.cards.length,b.text);assert.deepEqual(stores(E,b),['AliExpress']);
});
test('«solo de Amazon» se recuerda aunque esté viendo AliExpress, y viceversa',()=>{
  const E=load(),s=E.newState();s.viewStore='AliExpress';
  const a=E.respond(s,'camisetas de Amazon');
  assert.ok(a.cards.length,a.text);assert.deepEqual(stores(E,a),['Amazon']);assert.match(a.text,/solo productos de Amazon/);
  const b=E.respond(s,'y relojes');assert.deepEqual(stores(E,b),['Amazon']);
  const c=E.respond(s,'ahora solo del aliexpres');assert.equal(s.store,'AliExpress');
  const d=E.respond(s,'Busco relojes');assert.ok(d.cards.length,d.text);assert.deepEqual(stores(E,d),['AliExpress']);
});
test('formas coloquiales y faltas: ali, aliexpres, amazom, las dos tiendas',()=>{
  const E=load(),s=E.newState();s.viewStore='Amazon';
  E.respond(s,'enséñame cosas del ali');assert.equal(s.store,'AliExpress');
  E.respond(s,'mejor de amazom');assert.equal(s.store,'Amazon');
  E.respond(s,'me da igual la tienda');assert.equal(s.store,null);
  const r=E.respond(s,'solo aliexpress');assert.equal(s.store,'AliExpress');assert.ok(!r.cards?.length||stores(E,r).every(x=>x==='AliExpress'));
});
test('«llévame a Amazon» cambia de tienda en la web',()=>{
  const E=load(),s=E.newState();s.viewStore='AliExpress';
  const r=E.respond(s,'llévame a la tienda de Amazon');assert.equal(r.storeSwitch,'Amazon');assert.equal(s.store,'Amazon');
});
test('un producto de Amazon con su nombre no confunde la tienda',()=>{
  const E=load(),s=E.newState();s.viewStore='Amazon';
  E.respond(s,'Amazon Fire TV Stick HD');assert.equal(s.store||null,null);
});
test('vocabulario: preguntas de «qué hay» con palabras de más no se quedan en blanco',()=>{
  const E=load();
  for(const q of ['quiero, ¿qué es lo que puedo comprar?','oye una pregunta, qué es lo que vendéis aquí?','que cosas tienes','quiero ver lo que hay','qué categorías hay','enséñame todo']){
    const s=E.newState();s.viewStore='Amazon';const r=E.respond(s,q);
    assert.match(r.text,/moda.*tecnología/i,q);assert.match(r.text,/Amazon y AliExpress/,q);
  }
});
test('vocabulario: departamentos y peticiones con relleno encuentran productos',()=>{
  const E=load();
  for(const q of ['productos de belleza','quiero ver la categoría de moda','llévame a la sección de tecnología','algo para el gimnasio','me encantaría ver bolsos','oye pues mira quiero unas zapatillas blancas para mi hijo','unos cascos para jugar','hay algo de cocina que esté bien?','mira a ver si tienes algo de bricolaje']){
    const s=E.newState();s.viewStore='Amazon';const r=E.respond(s,q);
    assert.ok(r.cards.length,q+' → '+r.text);
  }
  const s=E.newState();s.viewStore='AliExpress';assert.equal(E.respond(s,'llévame a la sección de tecnología').navCategory,'Tecnología');
});
test('lo más vendido y las rebajas usan los datos reales de AliExpress',()=>{
  const E=load(),s=E.newState();s.viewStore='Amazon';
  const r=E.respond(s,'lo más vendido');assert.ok(r.cards.length);assert.ok(r.cards.every(c=>c.store==='AliExpress'));
  const t=E.respond(E.newState(),'las mejores ofertas de moda');assert.ok(t.cards.every(c=>c.store==='AliExpress'));
  const a=E.newState();E.respond(a,'solo amazon');const n=E.respond(a,'qué es lo más vendido');assert.equal(n.cards.length,0);assert.match(n.text,/AliExpress sí/);
});
