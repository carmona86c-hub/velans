import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEngine} from './asistente-fixture.mjs';

const live=loadEngine();
const run=(engine,...queries)=>{
  const state=engine.newState();
  const replies=queries.map(q=>engine.respond(state,q));
  return {state,replies,last:replies.at(-1)};
};
const fixture=[
  ['Camiseta Alba de manga larga','Algodón, manga larga y cuello redondo.','Moda'],
  ['Camiseta Nube de manga larga','Camiseta de manga larga con capucha.','Moda'],
  ['Camiseta Arena de manga corta','Manga corta de lino y talla XL.','Moda'],
  ['Camiseta Sol de manga corta','Manga corta con bolsillo.','Moda'],
  ['Camiseta simple',null,'Moda'],
  ['Adornos para el árbol de Navidad sin luces','Adornos sin luces.','Hogar'],
  ['Adornos del árbol de Navidad','Set con luces LED.','Hogar'],
  ['Bolas para el árbol de Navidad',null,'Hogar'],
  ['Árbol de Navidad artificial sin luces',null,'Hogar'],
  ['Auriculares A321 con cable','Conector jack.','Tecnología'],
  ['Auriculares B402 inalámbricos','Bluetooth y micrófono.','Tecnología'],
  ['Mochila para portátil de 15 pulgadas','Volumen de 20 L.','Moda'],
  ['Mochila de 38 L',null,'Moda'],
  ['Casio F-91W — reloj con correa',null,'Moda'],
  ['Bosch — molinillo','Potencia de 180 W.','Hogar'],
  ['Molinillo X731',null,'Hogar']
].map(([name,description,category],i)=>({id:i+1,ref:'test:'+i,name,description,category}));
const fixed=loadEngine({catalog:fixture,now:()=>new Date('2026-12-18T12:00:00Z')});
const numbers=r=>(r.cards||[]).map(c=>c.siteId).join(',');
const assertInternal=(engine,reply)=>{
  for(const card of reply.cards||[]){
    assert.ok(engine.byId(card.id));
    assert.equal(card.affiliateUrl,undefined);
  }
};

test('60 conversaciones de cinco turnos mantienen el hilo entre ocasiones y climas opuestos',()=>{
  let conversations=0,turns=0;
  for(const start of ['Busco','Quiero ver','¿Tenéis','Enséñame','Me gustaría ver']){
    for(const occasion of ['Navidad','Reyes','Semana Santa','el cumpleaños','el aniversario','la vuelta al cole']){
      for(const sleeve of ['larga','corta']){
        const other=sleeve==='larga'?'corta':'larga';
        const ids=sleeve==='larga'?'1,2':'3,4', inverse=sleeve==='larga'?'3,4':'1,2';
        const messages=[
          start+' camisetas de manga '+sleeve+' para '+occasion+'. '+(sleeve==='larga'?'En el destino hace calor.':'En el destino hace frío.'),
          'Antes de seguir, ¿quién cobra el pedido?',
          'Al revés, mejor de manga '+other,
          'Pásame la ficha de la segunda',
          '¿Por qué me recomiendas esto?'
        ];
        const {replies,state}=run(fixed,...messages);
        assert.equal(numbers(replies[0]),ids,messages[0]);
        assert.match(replies[1].text,/pago se realiza en Amazon/);
        assert.equal(numbers(replies[2]),inverse,messages[2]);
        assert.equal(numbers(replies[3]),inverse.split(',')[1]);
        assert.match(replies[4].text,/fichas coinciden/);
        assert.equal(state.dialogue.search.features[other==='larga'?'long':'short'],1);
        assert.equal(state.turns,5);
        for(const r of replies)assertInternal(fixed,r);
        conversations++;turns+=messages.length;
      }
    }
  }
  assert.equal(conversations,60);assert.equal(turns,300);
});

test('solo se recomienda un adorno sin luces cuando la ficha confirma ambos requisitos',()=>{
  const reply=run(fixed,'Quiero adornos de Navidad para el árbol, sin luces').last;
  assert.equal(numbers(reply),'6');
  const unavailable=run(live,'Quiero adornos de Navidad para el árbol, sin luces').last;
  for(const c of unavailable.cards)assert.match((live.byId(c.id).title+' '+live.byId(c.id).summary).toLowerCase(),/sin (?:luz|luces|iluminación)/);
});

test('presupuesto hablado, cambio absoluto y relativo, eliminación del límite y datos numéricos distintos',()=>{
  const {replies,state}=run(fixed,'Amigo invisible, máximo quince euros','Subo el tope a 45','Baja el tope en 5','Quita el límite');
  assert.match(replies[0].text,/15 €/);assert.match(replies[1].text,/45 €/);assert.match(replies[2].text,/40 €/);
  assert.equal(state.budget.max,null);
  const bag=run(fixed,'Es la vuelta al cole, busco una mochila para portátil de 15 pulgadas');
  assert.equal(numbers(bag.last),'12');assert.equal(bag.state.budget.max,null);
  const range=run(fixed,'Camisetas entre quince y treinta y cinco euros');
  assert.equal(range.state.budget.min,15);assert.equal(range.state.budget.max,35);
});

test('mantiene categoría, cambia conexión y conserva solo tallas o materiales documentados',()=>{
  assert.equal(numbers(run(fixed,'Busco unos auriculares con cable','Al revés, sin cable').last),'11');
  assert.equal(numbers(run(fixed,'Busco camisetas','En talla XL').last),'3');
  assert.equal(numbers(run(fixed,'Una camiseta de lana morada en talla XXL').last),'');
  assert.equal(numbers(run(fixed,'Quiero camisetas de lino').last),'3');
  assert.equal(numbers(run(fixed,'Busco un reloj de la marca inventada').last),'');
  assert.equal(numbers(run(fixed,'Camisetas de manga larga','Pásame la ficha de la tercera').last),'');
  assert.equal(numbers(run(fixed,'Busco una camiseta con bolsillo').last),'4');
});

test('compara modelos por su código y deja como desconocidos los atributos ausentes',()=>{
  const comparison=run(fixed,'Compara los auriculares A321 con los B402').last;
  assert.equal(numbers(comparison),'10,11');assert.equal(comparison.table.head.length,3);
  assert.ok(comparison.table.rows.some(row=>/micrófono|sin cable/i.test(row[0])&&row.includes('No confirmado')));
  const unknown=run(fixed,'Busco relojes Casio','¿Qué reloj Casio tiene más potencia en vatios?').last;
  assert.doesNotMatch(unknown.text,/91\s*W/);assert.match(unknown.text,/no indican potencia/);
});

test('la ficha abierta manda al cambiar de artículo y los modelos parciales mantienen sus límites',()=>{
  const state=fixed.newState();
  fixed.respond(state,'Busco camisetas');
  fixed.setSelected(state,fixed.bySiteId(15));
  assert.match(fixed.respond(state,'¿Cuántos vatios tiene este molinillo?').text,/180 W/);
  assert.match(fixed.respond(state,'¿Eso quiere decir que es silencioso?').text,/ruido/);
  fixed.setSelected(state,fixed.bySiteId(16));
  assert.match(fixed.respond(state,'¿Qué potencia tiene?').text,/no indica potencia/);
});

test('consulta editorial y compra en una frase, entregas y ausencia de ranking',()=>{
  const r=run(live,'Hola, busco unos auriculares sin cables y dime cómo se compra aquí').last;
  assert.ok(r.cards.length);assert.match(r.text,/pago se realiza en Amazon/);assertInternal(live,r);
  assert.match(run(live,'¿Qué diferencia hay entre Bluetooth y cancelación de ruido?').last.text,/micrófonos/);
  assert.match(run(live,'¿Quién escribió el Quijote?').last.text,/compras/);
  assert.match(run(live,'¿Qué es lo que más compra la gente estas Navidades?').last.text,/ranking de ventas comprobado/);
  assert.match(run(live,'Es para Reyes','¿Llegará para el 5 de enero?').last.text,/estimación/);
  assert.match(run(live,'Necesito algo para las fiestas').last.text,/vestir.*decorar.*regalar/);
  const corrected=run(live,'Quiero un regalo de Navidad para mi hermana','Perdón, es para su cumpleaños y le gusta el café');
  assert.match(corrected.last.text,/cumpleaños de tu hermana/);assert.ok(corrected.last.cards.length);
});

test('calendario peninsular, cambio de día local, festividades móviles y preferencia regional explícita',()=>{
  for(const [date,kind,location] of [
    ['2026-12-24T12:00Z','christmas'],['2026-12-25T23:05Z','kings'],['2026-01-06T12:00Z','kings'],
    ['2026-04-04T12:00Z','easter'],['2026-04-22T12:00Z','jordi','tarragona'],
    ['2026-05-02T12:00Z','mother'],['2026-02-14T12:00Z','valentine'],['2026-03-19T12:00Z','father'],
    ['2026-07-10T12:00Z','summer'],['2026-09-01T12:00Z','school'],['2026-10-29T12:00Z','halloween'],
    ['2026-11-27T12:00Z','black']
  ])assert.equal(fixed.season(new Date(date),location).id,kind,date);
  assert.notEqual(fixed.season(new Date('2026-04-22T12:00Z')).id,'jordi');
});

test('actualización del catálogo, publicación vacía y borrado de la sesión',()=>{
  const engine=loadEngine({catalog:fixture});const state=engine.newState();
  const first=engine.respond(state,'Busco camisetas de manga larga');assert.ok(first.cards.length);
  const build=engine.beginPublishedCatalog();build.append([fixture[3]]);
  assert.equal(engine.realCatalog().length,fixture.length);build.finish();
  assert.equal(engine.realCatalog().length,1);
  assert.equal(numbers(engine.respond(state,'Busco camisetas de manga corta')),'4');
  engine.useRealCatalog([]);assert.equal(engine.respond(state,'Quiero un regalo').cards.length,0);
  const cleared=engine.respond(state,'Borra todo');assert.equal(cleared.resetHistory,true);
  assert.equal(state.lastRecs.length,0);assert.equal(state.budget.max,null);
});

test('la ocasión nunca sustituye al artículo y las sugerencias de temporada existen en el catálogo',()=>{
  assert.equal(numbers(run(fixed,'Busco camisetas de manga larga para Sant Jordi').last),'1,2');
  assert.equal(numbers(run(fixed,'Camisetas de manga larga','Mejor cortas').last),'3,4');
  const sparse=loadEngine({catalog:[{id:1,name:'Colgante de oro',category:'Moda'},{id:2,name:'Bolas de pádel',category:'Deportes'}],now:()=>new Date('2026-12-12T12:00Z')});
  const reply=run(sparse,'Quiero adornos de Navidad para el árbol').last;
  assert.equal(reply.cards.length,0);assert.ok(!reply.quick.includes('Ver árboles de Navidad'));
  assert.ok(!sparse.greeting(sparse.newState()).quick.includes('Adornos para el árbol'));
  const size=run(fixed,'Busco una mochila, máximo 30 euros','para un portátil entre 13 y 15 pulgadas');
  assert.equal(size.state.budget.max,30);
});

test('los atributos de una tarjeta se extraen de palabras completas y respetan las negaciones',()=>{
  const e=loadEngine({catalog:[
    {id:1,name:'Camiseta con bolsillo',description:'Tejido grueso y ajuste ligeramente holgado.',category:'Moda'},
    {id:2,name:'Mochila ligera y plegable',category:'Moda'},
    {id:3,name:'Lámpara de luz cálida',category:'Hogar'},
    {id:4,name:'Auriculares sin micrófono',category:'Tecnología'}
  ]});
  const p=id=>e.byId(e.bySiteId(id));
  assert.ok(!p(1).attributes.light);assert.ok(!p(3).attributes.warm);assert.ok(!p(4).attributes.mic);
  assert.ok(p(2).attributes.light&&p(2).attributes.foldable);
  const state=e.newState();e.setSelected(state,p(1).id);
  assert.match(e.respond(state,'¿Es ligera?').text,/no confirma/);
  const real=live.byId(live.bySiteId(10));
  assert.ok(!live.makePublicCard(real).attrs.some(x=>/ligero/.test(x)));
});

test('explica qué hay en Velan’s antes de orientar al pago, sin usar una búsqueda previa',()=>{
  const {state,replies}=run(live,'Busco mochilas','¿qué se compra aquí?','¿Dónde se paga?','¿Qué vendéis?','¿Dónde está mi pedido?','La segunda porfa');
  const [bags,offer,pay,synonym,order,pick]=replies;
  for(const reply of [offer,synonym]){
    assert.match(reply.text,/moda.*tecnología.*hogar y cocina.*belleza/i);
    assert.match(reply.text,/comparar fichas.*Amazon/i);
    assert.doesNotMatch(reply.text,/Balance|afiliad|comisi[oó]n/i);
    assert.equal(reply.cards.length,0);
  }
  assert.match(pay.text,/pago se realiza en Amazon.*Ver en Amazon/);
  assert.doesNotMatch(pay.text,/moda|belleza/);
  assert.match(order.text,/Mis pedidos.*seguimiento/);
  assert.equal(numbers(pick),String(bags.cards[1].siteId));
  assert.equal(state.dialogue.search.kind,'bag');
  const combined=run(live,'¿Qué se compra aquí y cómo se paga?').last;
  assert.match(combined.text,/selección de productos.*pago se realiza en Amazon/);
});

test('las categorías del menú y la coincidencia por nombre se adaptan a cada catálogo',()=>{
  const mini=loadEngine({catalog:[
    {id:5001,ref:'a',name:'Cepillo para perros',category:'Mascotas'},
    {id:5002,ref:'b',name:'Carpeta Azul con anillas',category:'Oficina'},
    {id:5003,ref:'c',name:'Tostadora Nébula negra',category:'Hogar'}
  ]});
  const intro=run(mini,'¿Qué productos hay en esta página?').last;
  assert.match(intro.text,/hogar y cocina.*oficina.*mascotas/);
  assert.doesNotMatch(intro.text,/tecnología|moda/);
  assert.equal(numbers(run(mini,'Ver mascotas').last),'5001');
  assert.equal(numbers(run(mini,'Enséñame la ficha del artículo Tostadora Nébula negra').last),'5003');
  assert.equal(numbers(run(mini,'Busco Tostadora Nébula negra con Bluetooth').last),'');
  const empty=loadEngine({catalog:[]});
  assert.match(run(empty,'¿Qué se compra aquí?').last.text,/no hay fichas publicadas/);
});

test('comprueba límites de capacidad, ambigüedad y preguntas sin respaldo en la ficha',()=>{
  assert.equal(numbers(run(fixed,'Busco mochilas de más de 20 litros').last),'13');
  assert.equal(numbers(run(fixed,'Busco mochilas de menos de 38 litros').last),'12');
  const p=run(live,'¿Qué tipo de casco de bici tenéis?').last;
  assert.equal(numbers(p),'348');
  const state=live.newState();
  live.setSelected(state,live.bySiteId(147));
  assert.match(live.respond(state,'¿Puedo tomar estos caramelos si tengo alergia?').text,/no confirma.*ingredientes/);
  live.setSelected(state,live.bySiteId(235));
  assert.match(live.respond(state,'¿De cuántos voltios es?').text,/21 V/);
  assert.match(live.respond(state,'Entonces, ¿cuántos vatios?').text,/no indica potencia/);
});

