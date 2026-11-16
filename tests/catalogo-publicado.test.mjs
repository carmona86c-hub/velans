import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=name=>fs.readFileSync(join(root,name),'utf8');

test('369 productos con enlaces Amazon.es y únicamente el afiliado velans-21',()=>{
  const context={window:{}};
  vm.runInNewContext(read('catalogo-completo.js'),context);
  const rows=context.window.VELANS_PREVIEW_DATA.products;
  assert.equal(rows.length,369);
  let direct=0,search=0;
  for(const row of rows){
    const url=new URL(row.affiliateUrl);
    assert.equal(url.origin,'https://www.amazon.es');
    assert.deepEqual(url.searchParams.getAll('tag'),['velans-21']);
    if(url.pathname.startsWith('/dp/')){
      assert.equal(url.pathname,`/dp/${row.asin}`);
      assert.deepEqual([...url.searchParams.keys()],['tag']);
      direct++;
    }else{
      assert.equal(url.pathname,'/s');
      assert.ok(url.searchParams.get('k'));
      assert.deepEqual([...url.searchParams.keys()].sort(),['k','tag']);
      search++;
    }
  }
  assert.equal(direct,298);
  assert.equal(search,71);
});

test('los archivos de la nueva tienda están presentes',()=>{
  for(const name of ['catalogo-completo.js','catalogo-reglas.js','catalogo-taxonomia.js','catalogo-clasificador-manager.js','marketplace-v3.js','marketplace-v3.css','velans-premium.css','preview-catalog.css','velans-v-metal.png']){
    assert.ok(fs.statSync(join(root,name)).size>0,`${name} sin contenido`);
  }
});

test('portada pública sin mensajes de maqueta y con Compra con criterio limpio',()=>{
  const html=read('index.html');
  assert.doesNotMatch(html,/VISTA PREVIA PRIVADA|maqueta privada|No cambia velans\.es|segunda-ronda\.html/);
  assert.match(html,/<section class="transparency"[^>]*><div><span class="eyebrow">COMPRA CON CRITERIO<\/span><h2>369 artículos en nuestra selección\.<\/h2><\/div><\/section>/);
  assert.match(html,/En calidad de Afiliado de Amazon, obtengo ingresos/);
  assert.match(html,/id="product-page-amazon"/);
  assert.match(html,/Ver en Amazon<\/a>/);
});

test('todos los productos ofrecen acceso a Amazon, con icono sin flecha azul',()=>{
  const js=read('marketplace-v3.js');
  assert.match(js,/amazonButton\(p,'amazon-cta-card'\)/);
  assert.match(js,/amazonButton\(p,'amazon-cta-feature'\)/);
  assert.match(js,/amazon\.href=link\|\|'#'/);
  assert.match(js,/<span>Ver en Amazon<\/span>/);
  assert.match(js,/cleanUrl\.searchParams\.set\('tag','velans-21'\)/);
  assert.doesNotMatch(js,/Ver artículo en Amazon ↗|<span>↗<\/span><\/button>/);
});
