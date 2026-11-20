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
// Images de AliExpress: el test no sale a internet (se bloquean las peticiones externas).
try {
  for(const mobile of [true,false]){
    const {page,errors,context}=await surface(mobile);
    await page.goto(origin+'/');
    await page.waitForSelector('.ae-grid .product-card');
    assert.equal(await page.locator('[data-store]').count(),0,'sin selector de tienda');
    assert.equal(await page.locator('a[href*="amazon"]').count(),0,'sin enlaces a Amazon');
    assert.ok(await page.locator('.ae-grid a[href^="https://s.click.aliexpress.com/"]').count()>=10);
    // Categorías
    if(mobile)await page.locator('#mobile-menu').click();
    await page.locator('.department-nav [data-category="Tecnología"]').click();
    assert.match(await page.locator('#ae-title').innerText(),/Tecnología/);
    // Buscador
    await page.locator('#search-input').fill('cable');
    await page.locator('#search-input').press('Enter');
    assert.match(await page.locator('#ae-title').innerText(),/cable/i);
    assert.ok(await page.locator('.ae-grid .product-card').count()>0);
    // Asistente
    await page.locator('#vaBubble').click();await ready(page);
    const r=await send(page,'Busco auriculares bluetooth');
    assert.ok(r.cards&&r.cards.length,r.text);
    assert.doesNotMatch(await page.locator('#vaPanel').innerText(),/amazon/i);
    await page.locator('#vaMsgs .vcard .pbtn').first().click();
    await page.waitForTimeout(300);
    assert.deepEqual(errors,[]);await context.close();
    console.log((mobile?'Móvil':'Escritorio')+' · portada AliExpress, categorías, buscador y asistente verificados.');
  }
}finally{await browser.close();}
