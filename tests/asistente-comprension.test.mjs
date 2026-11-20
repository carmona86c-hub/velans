// Comprensión de frases coloquiales: las palabras de relleno no se buscan como artículo
// y las expresiones habituales se traducen a lo que hay en el catálogo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEngine} from './asistente-fixture.mjs';
const E=loadEngine();
const ask=(...msgs)=>{const s=E.newState();let r;for(const m of msgs)r=E.respond(s,m);return r;};
const titles=r=>(r.cards||[]).map(c=>c.title).join(' | ');
const NOT_FOUND=/No (tengo nada de|he encontrado nada con) «/;

const casos=[
  ['quiero algo para regalar a mi padre que le gusta mucho el café',/cafetera/i],
  ['busco unas zapatillas cómodas para andar por casa',/zapatillas de casa/i],
  ['tenéis cosas de cocina que estén bien',/cocina/i],
  ['mi madre siempre tiene frío en los pies',/zapatillas de casa/i],
  ['algo para cuidar la piel de la cara',/serum|crema/i],
  ['me hace falta una plancha para el pelo',/./],
  ['un secador para el pelo',/secador/i],
  ['cosas para la casa que sean útiles',/./],
  ['tenéis botas para la nieve',/botas/i],
  ['algún juego de mesa para jugar en familia',/palabreando|saber ancestral|if you were/i],
  ['tengo un perro que suelta mucho pelo',/aspirador/i],
  ['necesito algo para que no se me pierdan las llaves',/localizador/i],
  ['busco un regalo para un niño de 8 años al que le gustan los dinosaurios',/dino/i],
  ['algo para dormir mejor que duermo fatal',/almohada|pijama|sabanas/i],
  ['mi padre se pasa el día en el taller arreglando cosas',/destornillador|sierra|varilla|taladro/i],
  ['busco algo para que mi hija no pase frío en el cole',/./],
  ['algo para limpiar el suelo sin agacharse',/aspirador/i],
  ['un reloj que mida los pasos',/inteligente|watch|gps/i],
  ['algo para hacer ejercicio',/./],
  ['algo para la cocina que me ayude a cocinar más rápido',/freidora/i],
];
for(const [q,rx] of casos){
  test('entiende: '+q,()=>{
    const r=ask(q);
    assert.ok(!NOT_FOUND.test(r.text),'trata palabras de la frase como artículo: '+r.text);
    assert.ok((r.cards||[]).length>0,'sin artículos: '+r.text);
    assert.match(titles(r),rx);
  });
}
test('«invierno» no se lee como «no» (negación)',()=>{
  const r=ask('una chaqueta de invierno abrigada');
  assert.ok(!/descartando/.test(r.text),r.text);
});
test('zapatillas: no salen camisetas «deportivas»',()=>{
  for(const q of ['necesito unas zapatillas para correr que sean de hombre','unas zapatillas blancas que vayan con todo'])
    assert.ok(!/camiseta/i.test(titles(ask(q))),q);
});
test('al relajar filtros no se cambia de público',()=>{
  const r=ask('hay alguna camiseta de manga larga negra para hombre');
  for(const c of r.cards||[]){const p=E.byId(c.id);assert.notEqual(p.audience,'Mujer',c.title);assert.ok(!/niña|niño|mujer/i.test(c.title),c.title);}
});
test('le gusta la play: pregunta la edad y luego enseña artículos para jugar',()=>{
  const s=E.newState();
  assert.match(E.respond(s,'algo para mi hermano que juega mucho a la play').text,/edad/);
  assert.match(titles(E.respond(s,'tiene 16 años')),/gaming|lightspeed|g502/i);
});
