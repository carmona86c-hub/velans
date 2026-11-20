import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

// Velan’s trabaja solo con AliExpress: el asistente carga las ofertas de aliexpress-productos.js.
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=name=>fs.readFileSync(join(root,name),'utf8');
export function loadEngine({now}={}){
  const ctx={window:{},URL,console};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const f of ['aliexpress-productos.js','velans-assistence-engine.js','velans-assistence-dialogue.js'])vm.runInContext(read(f),ctx);
  const W=ctx.window, E=W.VelansDialogue.create(W.VelansEngine,{now});
  E.disableDemo();
  const ae=W.VELANS_ALIEXPRESS,seen=new Set(),rows=[];
  for(const p of [...ae.productos,...Object.values(ae.destacados||{}).flat(),...(ae.masVendidos||[])]){
    if(!p||seen.has(p.id))continue;seen.add(p.id);
    rows.push({id:p.id,name:p.nombre,category:p.categoria,store:'AliExpress',source:'aliexpress',
      description:`Oferta de AliExpress con un ${p.descuento} % de descuento. ${p.ventas} vendidos.`});
  }
  E.useRealCatalog(rows,{generatedAt:ae.actualizado,giftNames:[]});
  return {E,W};
}
