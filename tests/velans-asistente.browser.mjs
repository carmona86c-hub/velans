// Interacción real sobre los mismos archivos estáticos que publica el sitio.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright-core');
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const origin='https://velans.test';
const browser=await chromium.launch({executablePath:process.env.VELANS_BROWSER_PATH||'/usr/bin/google-chrome',headless:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
async function surface(mobile,failDialogue=false){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:850},isMobile:mobile,hasTouch:mobile,locale:'es-ES'});
  const page=await context.newPage(),files=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin)return route.abort();
    const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    if(!/^[a-zA-Z0-9._/-]+$/.test(file)||file.includes('..'))return route.abort();
    files.push(file);
    if(file==='velans-assistence-dialogue.js'&&failDialogue){failDialogue=false;return route.abort('failed');}
    try{return await route.fulfill({body:await fs.readFile(path.join(root,file)),contentType:types[path.extname(file)]||'application/octet-stream'});}
    catch{return route.fulfill({status:404,body:'File missing'});}
  });
  return {page,files,errors,context};
}
const session=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('velans-assistence-v4')));
async function ready(page){
  await page.waitForFunction(()=>document.querySelector('#vaPanel')?.hidden===false&&document.querySelector('#vaSend')?.disabled===false&&window.VelansEngine?.isReal());
}
async function send(page,question){
  const turn=(await session(page)).state.turns;
  await page.locator('#vaInput').fill(question);
  await page.locator('#vaInput').press('Enter');
  await page.waitForFunction(before=>JSON.parse(sessionStorage.getItem('velans-assistence-v4'))?.state.turns>before,turn);
  return (await session(page)).log.at(-1);
}
try {
  const {page,files,context,errors}=await surface(true);
  await page.goto(origin+'/');
  await page.waitForSelector('#vaBubble');
  assert.ok(await page.evaluate(()=>window.VelansPublishedCatalog.products.length>20));
  assert.equal(files.filter(f=>f==='velans-assistence-engine.js'||f==='velans-assistence-dialogue.js').length,0);
  await page.locator('#vaBubble').click();await ready(page);
  for(const file of ['velans-assistence-engine.js','velans-assistence-dialogue.js','catalogo-completo.js'])assert.equal(files.filter(f=>f===file).length,1,file);
  const long=await send(page,'Paso la Navidad en un sitio frío, busco camisetas de manga larga');
  assert.ok(long.cards.length);assert.match(long.text,/Navidad/);
  await send(page,'Pásame la ficha de la primera');
  assert.equal(await page.locator('#vaPanel a[href*="amazon"]').count(),0);
  await page.locator('#vaMsgs .vcard .pbtn').last().click();
  await page.waitForFunction(()=>new URLSearchParams(location.search).has('articulo')&&document.getElementById('vaPanel').hidden);
  await page.locator('#vaBubble').click();await ready(page);
  const title=await page.locator('#product-page-title').textContent();
  assert.ok((await session(page)).log.at(-1).text.includes(title),title);
  assert.match((await send(page,'¿Es térmica?')).text,/ficha/i);
  await page.locator('#vaForget').click();
  assert.equal((await session(page)).state.turns,0);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const durations=[];
  for(let i=0;i<50;i++){
    const start=Date.now();await send(page,i%3===0?'Busco mochilas':i%3===1?'Compara las dos primeras':'¿Quién cobra el pedido?');durations.push(Date.now()-start);
  }
  assert.equal(await page.locator('#vaMsgs .va-entry').count(),20);
  assert.equal((await session(page)).log.length,60);
  await page.getByRole('button',{name:'Mensajes anteriores'}).click();
  await page.getByRole('button',{name:'Últimos mensajes'}).click();
  assert.equal(await page.locator('#vaMsgs .va-entry').count(),20);
  await send(page,'Mi correo es prueba@example.com');
  assert.ok(!JSON.stringify(await session(page)).includes('prueba@example.com'));
  await page.locator('#vaForget').click();
  assert.ok((await session(page)).log.length<=3);
  console.log('Móvil con CPU ×4 · 50 turnos · p95 de interacción automatizada '+durations.sort((a,b)=>a-b)[47]+' ms · 20 mensajes en pantalla');
  assert.deepEqual(errors,[]);
  await context.close();

  const desktop=await surface(false,true);
  await desktop.page.goto(origin+'/tecnologia.html');
  await desktop.page.locator('#vaBubble').click();
  await desktop.page.getByRole('button',{name:'Reintentar'}).click();await ready(desktop.page);
  await send(desktop.page,'Busco relojes Casio');
  await desktop.page.locator('#vaMsgs .vcard .pbtn').first().click();
  await desktop.page.waitForURL(/articulo=/);
  await desktop.page.locator('#vaBubble').click();await ready(desktop.page);
  const watch=await desktop.page.locator('#product-page-title').textContent();
  assert.match(watch,/Casio/);assert.ok((await session(desktop.page)).log.at(-1).text.includes(watch));
  assert.deepEqual(desktop.errors,[]);await desktop.context.close();
  console.log('Escritorio · guía editorial, fallo de carga recuperable, ficha, sesión y navegación interna verificados.');
}finally{await browser.close();}
