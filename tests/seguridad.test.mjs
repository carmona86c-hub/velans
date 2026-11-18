// Comprobaciones de seguridad de velans.es: se ejecutan en cada cambio.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const code=fs.readdirSync(root).filter(f=>f.endsWith('.js')||f.endsWith('.html'));

test('todas las páginas llevan política de seguridad, referer y antimarco',()=>{
  assert.ok(pages.length>=7);
  for(const p of pages){
    const s=read(p);
    assert.match(s,/http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';/,p);
    assert.match(s,/name="referrer" content="strict-origin-when-cross-origin"/,p);
    assert.match(s,/src="\.\/velans-seguridad\.js"/,p);
  }
});
test('no se cargan scripts ni hojas de estilo de otras webs',()=>{
  for(const p of pages){
    const s=read(p);
    for(const m of s.matchAll(/<script[^>]+src="([^"]+)"/g)) assert.ok(!/^(https?:)?\/\//.test(m[1]),p+': '+m[1]);
    for(const m of s.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) assert.ok(!/^(https?:)?\/\//.test(m[1]),p+': '+m[1]);
  }
});
test('los enlaces externos solo van a Amazon.es con velans-21, o a velans.es',()=>{
  for(const f of code){
    const s=read(f);
    for(const m of s.matchAll(/https?:\/\/(?:www\.)?amazon\.[a-z.]+\/[^"'\s<>`)]*/g)){
      assert.ok(/^https:\/\/www\.amazon\.es\//.test(m[0]),f+': '+m[0]);
      assert.match(m[0],/tag=velans-21/,f+': '+m[0]);
    }
  }
});
test('los enlaces que abren otra pestaña llevan noopener',()=>{
  for(const f of code){
    for(const m of read(f).matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0],/noopener/,f+': '+m[0].slice(0,120));
    if(f.endsWith('.js')) for(const m of read(f).matchAll(/target="_blank"[^;]{0,80}/g)) assert.match(read(f),/noopener/,f);
  }
});
test('no hay claves ni contraseñas en el código publicado',()=>{
  for(const f of code){
    const s=read(f);
    assert.ok(!/(sk-ant-|AKIA[0-9A-Z]{16}|apify_api_|ghp_[A-Za-z0-9]{20}|-----BEGIN [A-Z ]*PRIVATE KEY)/.test(s),f);
  }
});
test('los datos internos no se publican en la web',()=>{
  const cfg=read('_config.yml');
  for(const d of ['data','scripts','tests']) assert.match(cfg,new RegExp('- '+d+'\\b'));
  assert.ok(!fs.existsSync(new URL('.nojekyll',root)),'.nojekyll publicaría todo el repositorio');
});
