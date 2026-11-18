import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=name=>fs.readFileSync(join(root,name),'utf8');
export function loadEngine({catalog,now}={}){
  const ctx={window:{},URL,console};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const f of ['catalogo-completo.js','catalogo-reglas.js','catalogo-clasificador-manager.js','catalogo-taxonomia.js','velans-assistence-engine.js','velans-assistence-dialogue.js'])vm.runInContext(read(f),ctx);
  const W=ctx.window, E=W.VelansDialogue.create(W.VelansEngine,{now});
  E.disableDemo();
  const rows=W.VelansPreviewRules.dedupeExactNames(W.VELANS_PREVIEW_DATA.products.map(W.VelansPreviewTaxonomy.categorise)).products;
  const gifts=[...read('ideas-para-regalar.html').matchAll(/<h2>([^<]+)<\/h2>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
  E.useRealCatalog(catalog??rows,{generatedAt:W.VELANS_PREVIEW_DATA.generatedAt,giftNames:gifts});
  return E;
}
