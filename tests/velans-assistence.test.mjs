// Pruebas de Velan's Assistence con el catálogo publicado (node --test tests/)
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEngine} from './asistente-fixture.mjs';
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
test('regalo para la mujer: nada de hombre y «no sé» enseña ideas',()=>{
  const {r}=ask(['algún regalo para mi mujer','pues no lo se']);
  assert.ok(r.cards.length>0);
  assert.ok(r.cards.every(c=>E.byId(c.id).audience!=='Hombre'),r.cards.map(c=>c.title).join(' | '));
  assert.ok(ask(['regalo para mi mujer','Enséñame ideas para regalar']).r.cards.every(c=>E.byId(c.id).audience!=='Hombre'));
  assert.ok(ask(['regalo para mi marido','ni idea']).r.cards.every(c=>E.byId(c.id).audience!=='Mujer'));
});
test('«no lo sé» sin contexto no se busca como palabra',()=>{
  const r=ask('Pues no lo se').r;
  assert.ok(!/pues/.test(r.text)); assert.match(r.text,/regalo/);
});
test('lenguaje coloquial: «cojer», «mi chica», «mi señora», «pillarle»',()=>{
  const r=ask('No se que cojer para mi chica').r;
  assert.ok(!/cojer/.test(r.text)); assert.ok(r.cards.length && r.cards.every(c=>E.byId(c.id).audience!=='Hombre'));
  assert.match(ask('qué le compro a mi señora').r.text,/tu señora/);
  assert.ok(!/pillarle/.test(ask('quiero pillarle algo a mi chico').r.text));
  assert.ok(!/escoger/.test(ask('no sé qué escoger').r.text));
  assert.ok(ask(['no se que cojer','para mi chica']).r.cards.every(c=>E.byId(c.id).audience!=='Hombre'));
});
test('conversación de nivel medio: charla, ocasiones, gustos y seguimiento',()=>{
  assert.match(ask('buenos días, qué tal estás?').r.text,/Muy bien/);
  assert.match(ask('cómo funciona esto?').r.text,/Ver en Amazon/);
  assert.match(ask('ok gracias adiós').r.text,/Hasta pronto/);
  assert.match(ask('es fiable esta web?').r.text,/Amazon\.es/);
  assert.match(ask('cuánto tarda en llegar?').r.text,/entrega/);
  assert.match(ask('regalo de aniversario para mi mujer').r.text,/aniversario/);
  const g=ask(['regalo para mi mujer','es muy coqueta y le gusta viajar']).r;
  assert.match(g.text,/cuidarse/); assert.ok(g.cards.every(c=>E.byId(c.id).audience!=='Hombre'));
  const t=ask(['regalo para mi chico','es muy friki de la tecnología']).r; assert.match(t.text,/tecnolog/);
  assert.match(ask(['regalo para mi mujer','no sé','¿por qué me recomiendas eso?']).r.text,/Te los he propuesto/);
  assert.equal(ask(['regalo para mi mujer','no sé','dame el enlace del reloj']).r.cards.length,1);
  assert.match(ask('necesito algo para mi hijo de 10 años').r.text,/peque/);
  for(const q of ['me puedes ayudar?','quiero comprar algo','estoy aburrido','gano algo si compro?']) assert.ok(!/No he encontrado|No estoy seguro/.test(ask(q).r.text),q);
});
