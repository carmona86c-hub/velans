// El asistente solo recomienda ofertas de AliExpress (Velan’s ya no trabaja con Amazon).
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEngine} from './asistente-fixture.mjs';

const {E}=loadEngine();
const ask=q=>{const s=E.newState();s.viewStore='AliExpress';s.store='AliExpress';return E.respond(s,q);};
const stores=r=>[...new Set((r.cards||[]).map(c=>E.byId(c.id)?.store||c.store))];

for(const q of ['Busco auriculares bluetooth','quiero un cargador para el móvil','algo para la cocina','un reloj','luces led para mi cuarto']){
  test(`«${q}» enseña ofertas de AliExpress`,()=>{
    const r=ask(q);
    assert.ok(r.cards&&r.cards.length,r.text);
    assert.deepEqual(stores(r),['AliExpress']);
  });
}
test('responde con sinceridad que es una máquina',()=>{
  assert.match(ask('¿eres una persona?').text,/asistente automático/);
});
