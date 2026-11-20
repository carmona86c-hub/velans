/* Velan's Assistence 5.3.0 · widget (carga diferida) */
/* Velan's Assistence · widget integrable (v4)
   Inserción: <link rel="stylesheet" href="./velans-assistence.css"> + <script src="./velans-assistence.js" defer><\/script>
   Todo funciona en el navegador: sin servidores, sin IA externa, sin cookies. Memoria solo de la pestaña (sessionStorage). */
!function(){"use strict";if(!window.__velansAssistence){window.__velansAssistence=!0;var e="5.3.0",t=null,a=document.currentScript||document.querySelector('script[src*="velans-assistence.js"]'),n=a&&a.src?a.src.replace(/[^\/]*$/,""):"./",i="velans-assistence-v4",o="idle",r=["adidas Essentials Feelcozy — sudadera con capucha","Amazon Fire TV Stick HD","BESCH — paraguas automático antiviento","Bosch — molinillo de café eléctrico","Calvin Klein — bóxer (pack de 3)","Carhartt K87 — camiseta con bolsillo","Casio A168WG — reloj dorado unisex","Casio F-91W — reloj digital clásico","Casio LA670WEGA — reloj de mujer dorado","Cecotec Pure Aroma 300 Yang — difusor de aromas","COSORI — freidora de aire 5,5 L","Crocs con forro — zapatillas de casa","Echo Pop — altavoz inteligente con Alexa","Elizabeth Arden Green Tea Honey Drops","Levi’s Batwing Tote — bolso de mano","Levi’s Housemark — polo","Levi’s Mini Crossbody — bandolera pequeña","Nespresso De’Longhi Inissia — cafetera","Philips Multigroom Serie 3000 — 8 en 1","Philips OneBlade 360 — afeitadora","Tapo C200 — cámara de vigilancia WiFi 360°","Timex Expedition — reloj con correa textil","TRAMAS+ — pijama de invierno de coralina","Weleda Skin Food — bálsamo corporal","Xiaomi Redmi Watch 5 Active — reloj inteligente"],s=function(){try{var e="__va";return sessionStorage.setItem(e,e),sessionStorage.removeItem(e),sessionStorage}catch(e){return null}}(),l={state:null,log:[],open:!1,sound:!1,voiceNoticed:!1,privacyShown:!1,pageChanged:!1,lastOpenSel:null},d=document.createElement("div");d.className="va-root",d.setAttribute("data-version",e),d.style.setProperty("--va-vimg",'url("'+n+'assistence-v.png")'),d.innerHTML='<button class="va-bubble" id="vaBubble" type="button" aria-label="Abrir Velan’s Assistence" aria-expanded="false" aria-controls="vaPanel"><img class="va-logo" alt="" src="'+n+'assistence-logo.png" width="72" height="72"><span class="va-online" aria-hidden="true"></span></button><section class="va-panel" id="vaPanel" role="dialog" aria-modal="false" aria-labelledby="vaTitle" hidden><div class="va-head"><div class="va-av" aria-hidden="true"><img alt="" src="'+n+'assistence-v.png"></div><div class="va-title"><b id="vaTitle">Velan’s Assistence</b><span>Asistente automático</span></div><button class="va-hb" id="vaSound" type="button" aria-label="Leer respuestas en voz alta" aria-pressed="false" title="Lectura en voz alta"><svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path class="w" d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path class="w" d="M18 7.5a6.5 6.5 0 0 1 0 9"/></svg></button><button class="va-hb" id="vaNew" type="button" aria-label="Nueva conversación" title="Nueva conversación"><svg viewBox="0 0 24 24"><path d="M12.5 5.5A6.5 6.5 0 1 1 6 12"/><path d="M10 3.2l2.5 2.3L10 7.8"/></svg></button><button class="va-hb" id="vaMin" type="button" aria-label="Minimizar el asistente" title="Minimizar"><svg viewBox="0 0 24 24"><path d="M7 12h10"/></svg></button></div><div class="va-band" id="vaBand"><i aria-hidden="true"></i><span id="vaStatus">Listo para ayudarte · Sin datos personales</span><button type="button" class="va-forget" id="vaForget" title="Borrar lo que recuerdo de esta visita">Borrar</button></div><div class="va-msgs" id="vaMsgs"></div><div class="sr" id="vaLive" aria-live="polite" aria-atomic="true"></div><div class="va-quick" id="vaQuick" role="group" aria-label="Sugerencias"></div><form class="va-comp" id="vaForm" autocomplete="off"><label for="vaInput" class="sr">Escribe tu mensaje</label><textarea id="vaInput" rows="1" maxlength="600" placeholder="Escribe o pulsa el micrófono..." enterkeyhint="send"></textarea><button class="va-mic" id="vaMic" type="button" aria-label="Dictar mensaje por voz" aria-pressed="false" title="Dictado por voz"><span aria-hidden="true">🎤</span></button><button class="va-send" id="vaSend" type="submit" aria-label="Enviar mensaje" title="Enviar"><svg viewBox="0 0 24 24"><path d="M21 3L10.5 13.5"/><path d="M21 3l-6.5 18-4-7.5L3 9.5z"/></svg></button></form><div class="va-hint" id="vaHint" aria-live="polite">El micrófono usa el dictado del navegador. Puedes revisar el texto antes de enviarlo.</div></section>';var c,u=function(e){return d.querySelector("#"+e)},v=null;["pushState","replaceState"].forEach(function(e){var t=history[e];history[e]=function(){var e=t.apply(this,arguments);return setTimeout(I,0),e}}),window.addEventListener("popstate",function(){setTimeout(I,0)}),window.addEventListener("hashchange",function(){setTimeout(I,0)});var p="Listo para ayudarte · Sin datos personales",h=!1,f=window.speechSynthesis||null,g=null,m=window.SpeechRecognition||window.webkitSpeechRecognition,b=null,w=!1,y="",S=!1;"loading"===document.readyState?document.addEventListener("DOMContentLoaded",W):W()}function C(e){return new Promise(function(t,a){var n=document.createElement("script");n.src=e,n.onload=t,n.onerror=a,document.head.appendChild(n)})}var preparation=null,restored=false,historyEnd=null;
const sessionNotice='Recuerdo esta conversación en la pestaña. Puedes eliminarla con «Borrar».';
async function eachChunk(rows,apply){
    const yieldPage=()=>window.scheduler?.yield?window.scheduler.yield():new Promise(resolve=>setTimeout(resolve,0));
    for(let i=0;i<rows.length;){
      const start=performance.now();
      do {apply(rows.slice(i,i+8));i+=8;}while(i<rows.length&&performance.now()-start<5);
      if(i<rows.length)await yieldPage();
    }
  }
async function E(){
    if(o==='ready')return t.realCatalog().length>0;
    if(preparation)return preparation;
    o='loading';B('Preparando el asistente…','busy');
    preparation=(async function(){
      try{
        await Promise.all([
          window.VelansEngine?null:C(n+'velans-assistence-engine.js?v='+e),
          window.VelansDialogue?null:C(n+'velans-assistence-dialogue.js?v='+e)
        ]);
        window.VelansEngine.disableDemo();
        t=window.VelansDialogue.create(window.VelansEngine);
        // Velan’s solo trabaja con AliExpress: el asistente recomienda las ofertas de AliExpress.
        if(!window.VELANS_ALIEXPRESS)await C(n+'aliexpress-productos.js?v=3');
        const catalog={products:[],generatedAt:(window.VELANS_ALIEXPRESS&&window.VELANS_ALIEXPRESS.actualizado)||''};
        const guide=/\/ideas-para-regalar\.html$/.test(location.pathname)?[...document.querySelectorAll('main h2')].map(h=>h.textContent.trim()):[];
        const build=t.beginPublishedCatalog({generatedAt:catalog.generatedAt,giftNames:guide});
        await eachChunk(catalog.products,chunk=>build.append(chunk));
        const ae=window.VELANS_ALIEXPRESS;
        if(ae&&Array.isArray(ae.productos)){
          const seen=new Set(),rowsAE=[];
          for(const p of [...ae.productos,...Object.values(ae.destacados||{}).flat(),...(ae.masVendidos||[])]){
            if(!p||seen.has(p.id))continue;seen.add(p.id);
            rowsAE.push({id:p.id,name:p.nombre,category:p.categoria,store:'AliExpress',source:'aliexpress',
              description:`Oferta de AliExpress con un ${Number(p.descuento)} % de descuento indicado por AliExpress. ${Number(p.ventas).toLocaleString('es-ES')} vendidos y ${Math.round(Number(p.valoracion))} % de valoraciones positivas.`});
          }
          await eachChunk(rowsAE,chunk=>build.append(chunk));
        }
        build.finish();
        o='ready';B();return t.realCatalog().length>0;
      }catch(error){
        o='error';B('No he podido cargar el asistente','rec');return false;
      }finally{preparation=null;}
    })();
    return preparation;
  }


  // Velan’s ya no trabaja con Amazon: las respuestas hablan solo de AliExpress.
  function sinAmazon(a){
    if(!a)return a;
    const fix=x=>typeof x!=='string'?x:x
      .replace(/(?:el |al )?Programa de Afiliados de Amazon/gi,'el programa de afiliados de AliExpress')
      .replace(/Afiliado de Amazon/gi,'afiliado de AliExpress')
      .replace(/«(?:Consultar|Ver) en Amazon»(?: en la ficha de Velan’s)?/g,'«Ver en AliExpress»')
      .replace(/(?:de )?Amazon(?:\.es)? y (?:de )?AliExpress|AliExpress y (?:de )?Amazon(?:\.es)?/g,'AliExpress')
      .replace(/de dos tiendas, AliExpress \(puedes pedirme solo una de ellas\)/g,'de AliExpress')
      .replace(/Amazon\.es|Amazon/g,'AliExpress')
      .replace(/AliExpress o (?:en )?AliExpress/g,'AliExpress');
    a.text=fix(a.text);
    if(Array.isArray(a.quick))a.quick=a.quick.filter(q=>!/amazon|dos tiendas|tambi[eé]n en|solo aliexpress/i.test(q));
    if(a.table&&Array.isArray(a.table.rows))a.table.rows=a.table.rows.map(r=>r.map(fix));
    if(Array.isArray(a.cards))a.cards=a.cards.map(c=>({...c,reason:fix(c.reason)}));
    return a;
  }
function A(){if(s&&l.state)try{s.setItem(i,JSON.stringify(l))}catch(e){}}function x(){if(s)try{var e=JSON.parse(s.getItem(i)||"null");e&&e.state&&(l=Object.assign(l,e))}catch(e){}}function L(e,t,a){var n=document.createElement(e);return t&&(n.className=t),null!=a&&(n.textContent=a),n}function P(){var e=null;try{var a=new URLSearchParams(location.search).get("articulo");a&&/^\d+$/.test(a)&&(e=a)}catch(e){}if(!e){var n=(location.hash||"").match(/^#articulo-(\d+)$/);n&&(e=n[1])}return e&&t?t.bySiteId(e):null}function I(){if("ready"===o&&l.state){var e=P();if(!e){l.state.selectedProductId=null;return}if(e&&t.byId(e))l.state.selectedProductId!==e&&(t.setSelected(l.state,e),l.open?(z(t.greeting(l.state,{changed:l.state.turns>0})),l.lastOpenSel=e):l.pageChanged=!0,A())}else l.pageChanged=!0}function V(entry){
    const group=document.createElement('div');group.className='va-entry';
    const row=L('div','msg '+entry.role);group.appendChild(row);
    if(entry.role==='a'){
      const avatar=L('span','mini','V');avatar.setAttribute('aria-hidden','true');row.appendChild(avatar);v=row;
    }
    row.appendChild(L('div','bub',entry.text));c.appendChild(group);
    if(entry.role!=='a')return;
    if(entry.table){
      const table=L('table','cmp'),head=L('thead'),tr=L('tr');
      entry.table.head.forEach(col=>tr.appendChild(L('th',null,col)));head.appendChild(tr);table.appendChild(head);
      const body=L('tbody');entry.table.rows.forEach(cols=>{const tr=L('tr');cols.forEach(col=>tr.appendChild(L('td',col==='No confirmado'?'nc':null,col)));body.appendChild(tr)});table.appendChild(body);group.appendChild(table);
    }
    if(entry.cards?.length){
      const box=L('div','cards');
      for(const card of entry.cards){
        const product=t.byId(card.id);if(!product||product.category!=='real')continue;
        const current=t.makePublicCard(product,card.reason);
        const art=L('article','vcard');art.setAttribute('aria-label',product.title);
        const isAE=product.store==='AliExpress';
        art.appendChild(L('div','va-status-chip','Oferta de AliExpress'));
        art.appendChild(L('b',null,product.title));if(product.summary)art.appendChild(L('div','sum',product.summary));
        const ul=L('ul');(current.attrs||[]).forEach(a=>ul.appendChild(L('li',null,a)));art.appendChild(ul);
        if(card.reason)art.appendChild(L('div','why',card.reason));
        for(const line of current.warnings||[])art.appendChild(L('div','warn',line));
        const acts=L('div','acts'),button=L('button','pbtn',isAE?'Ver en la tienda AliExpress':'Ver ficha en Velan’s');button.type='button';
        button.addEventListener('click',()=>{
          if(window.matchMedia('(max-width:600px)').matches)H();
          if(isAE&&typeof window.VelansAEOpen==='function'){window.VelansAEOpen(product.siteId);return;}
          if(isAE){location.href=n+'?tienda=aliexpress&oferta='+encodeURIComponent(product.siteId);return;}
          if(typeof window.VelansAssistenceOpenArticle==='function')window.VelansAssistenceOpenArticle(product.siteId);
          else location.href=n+'?articulo='+encodeURIComponent(product.siteId);
        });
        acts.appendChild(button);art.appendChild(acts);box.appendChild(art);
      }
      group.appendChild(box);
    }
    const groups=c.querySelectorAll('.va-entry');
    if(groups.length>20)groups[0].remove();
  }

function k(e){var t=u("vaQuick");t.textContent="",(e||[]).forEach(function(e){var a=L("button",null,e);a.type="button",a.addEventListener("click",function(){if(k(null),"Reintentar"===e)return o="idle",l.open=!1,u("vaPanel").hidden=!0,void O();R(e)}),t.appendChild(a)})}function M(){c.scrollTop=c.scrollHeight}function historyControls(){
    let nav=c.querySelector('.va-history-controls');if(nav)nav.remove();
    const end=historyEnd??l.log.length;
    if(l.log.length<=20)return;
    nav=L('div','va-history-controls');
    if(end>20){const btn=L('button',null,'Mensajes anteriores');btn.type='button';btn.onclick=()=>{historyEnd=Math.max(1,end-20);T();c.scrollTop=0};nav.appendChild(btn);}
    if(historyEnd!==null){const btn=L('button',null,'Últimos mensajes');btn.type='button';btn.onclick=()=>{historyEnd=null;T()};nav.appendChild(btn);}
    c.prepend(nav);
  }
function T(){
    c.textContent='';const end=historyEnd??l.log.length;
    l.log.slice(Math.max(0,end-20),end).forEach(V);historyControls();
    const last=l.log.at(-1);k(last?.role==='a'?last.quick:null);M();
  }

function z(reply){
    if(reply.resetHistory){l.log=[];c.textContent='';}
    const entry={role:'a',text:reply.text,table:reply.table||null,quick:reply.quick||null,cards:(reply.cards||[]).map(({id,reason})=>({id,reason}))};
    k(entry.quick);l.log.push(entry);if(l.log.length>60)l.log=l.log.slice(-60);
    if(historyEnd!==null){historyEnd=null;T();}else{V(entry);historyControls();}
    const groups=c.querySelectorAll('.va-entry');for(const el of [...groups].slice(0,Math.max(0,groups.length-20)))el.remove();
    if((entry.cards.length||entry.table)&&v)c.scrollTop=Math.max(0,v.offsetTop-12);else M();
    const live=u('vaLive');live.textContent='';setTimeout(()=>{live.textContent=entry.text+(entry.cards.length?' ('+entry.cards.length+' artículos)':'')},50);
    D(entry.text);A();
  }

function N(text){const entry={role:"sys",text};l.log.push(entry);if(l.log.length>60)l.log=l.log.slice(-60);V(entry);historyControls();M();A()}function B(e,t){u("vaStatus").textContent=e||p,u("vaBand").className="va-band"+(t?" "+t:"")}function q(e){u("vaHint").textContent=e||"El micrófono usa el dictado del navegador. Puedes revisar el texto antes de enviarlo."}function R(e){if(o!=="ready")return;if((e=String(e||"").trim().slice(0,600))&&!h){h=!0,u("vaSend").disabled=!0;var a=t&&t.detectSensitive(e).length?"[Mensaje oculto: contenía datos personales]":e;l.log.push({role:"u",text:a}),V({role:"u",text:a}),M(),u("vaInput").value="",j(),F(),k(null),B("Preparando una respuesta…","busy"),requestAnimationFrame(function(){var a;if("ready"!==o)return h=!1,u("vaSend").disabled=!1,void z({text:"Todavía estoy preparándome o no he podido cargar el catálogo. Vuelve a intentarlo en unos segundos.",quick:["Reintentar"]});try{l.state.viewStore='AliExpress';l.state.store='AliExpress';a=sinAmazon(t.respond(l.state,e));if(a&&a.navCategory){var nb=document.querySelector('.department-nav [data-category="'+a.navCategory+'"]');nb&&setTimeout(function(){nb.click()},50)}}catch(e){a={text:"Ha ocurrido un error al procesar el mensaje. Puedes reformularlo o empezar una conversación nueva."}}z(a),h=!1,u("vaSend").disabled=!1,B()})}}function j(){var e=u("vaInput");e.style.height="auto",e.style.height=Math.min(e.scrollHeight,110)+"px"}async function O(keyboard=false){
    if(l.open){u('vaInput').focus();return;}
    l.open=true;u('vaPanel').hidden=false;d.classList.add('va-is-open');u('vaBubble').setAttribute('aria-expanded','true');
    u('vaBubble').setAttribute('aria-label','Minimizar Velan’s Assistence');u('vaSend').disabled=true;
    const available=await E();if(!l.open)return;
    if(o!=='ready'){N('No he podido cargar el asistente. Puedes seguir navegando o pulsar «Reintentar».');k(['Reintentar']);return;}
    if(!restored){
      x();l.open=true;l.state ||= t.newState();
      l.log=(Array.isArray(l.log)?l.log:[]).slice(-60).filter(entry=>entry&&typeof entry.text==='string'&&['u','a','sys'].includes(entry.role)).map(entry=>{
        if(entry.role==='sys'&&entry.text.startsWith(sessionNotice))return {...entry,text:sessionNotice};
        if(entry.role!=='a')return entry;
        const cards=(entry.cards||[]).filter(card=>t.byId(card.id)?.category==='real').map(card=>({id:card.id,reason:card.reason}));
        if(cards.length!==(entry.cards||[]).length)return {role:'sys',text:'Una ficha de esta conversación ha cambiado. Puedes volver a buscarla en el catálogo actual.'};
        return {...entry,cards};
      });T();restored=true;
    }
    l.state ||= t.newState();u('vaSend').disabled=false;
    const id=P();if(id&&id!==l.state.selectedProductId)t.setSelected(l.state,id);
    if(!id)l.state.selectedProductId=null;
    if(!l.privacyShown){N(sessionNotice);l.privacyShown=true;}
    if(!available)N('Ahora mismo no hay artículos publicados que pueda consultar.');
    if(!l.log.some(entry=>entry.role==='a')||id&&id!==l.lastOpenSel)z(t.greeting(l.state,{changed:l.state.turns>0}));
    l.lastOpenSel=id;l.pageChanged=false;A();
    if(keyboard||window.matchMedia('(pointer:fine)').matches){
      const active=document.activeElement;
      if(active===u('vaBubble')||active===document.body||u('vaPanel').contains(active))u('vaInput').focus({preventScroll:true});
    }
  }

function H(){if(l.open){var e=d.contains(document.activeElement);l.open=!1,u("vaPanel").hidden=!0,d.classList.remove("va-is-open"),u("vaBubble").setAttribute("aria-expanded","false"),u("vaBubble").setAttribute("aria-label","Abrir Velan’s Assistence"),U(true),F(),A(),e&&u("vaBubble").focus({preventScroll:!0})}}function _(){if(f){var e=f.getVoices();g=e.filter(function(e){return/^es(-|_)ES/i.test(e.lang)})[0]||e.filter(function(e){return/^es/i.test(e.lang)})[0]||null}}function D(e){if(l.sound&&f&&l.open)try{f.cancel();var t=new SpeechSynthesisUtterance(e.replace(/«|»/g,""));t.lang="es-ES",g&&(t.voice=g),t.onstart=function(){B("Leyendo en voz alta…","busy")},t.onend=function(){B()},f.speak(t)}catch(e){}}function F(){try{f&&f.cancel()}catch(e){}}function U(cancel=false){if(b)try{cancel?b.abort():b.stop()}catch(e){}}function W(){document.body.appendChild(d),function(){if(c=u("vaMsgs"),u("vaForm").addEventListener("submit",function(e){e.preventDefault(),R(u("vaInput").value)}),u("vaInput").addEventListener("keydown",function(e){"Enter"!==e.key||e.shiftKey||e.isComposing||(e.preventDefault(),R(this.value))}),u("vaInput").addEventListener("input",j),u("vaBubble").addEventListener("click",function(event){l.open?H():O(event.detail===0)}),u("vaMin").addEventListener("click",H),document.addEventListener("keydown",function(e){if("Escape"===e.key&&l.open&&!e.defaultPrevented&&d.contains(document.activeElement)){e.preventDefault();w?U():H()}}),u("vaNew").addEventListener("click",function(){if("ready"===o){var e=l.state.selectedProductId;l.state=t.newState(),e&&t.setSelected(l.state,e),l.log=[],c.textContent="",F(),N("Conversación nueva: he borrado lo que buscabas en esta visita."),z(t.greeting(l.state)),A()}}),u("vaForget").addEventListener("click",function(){if("ready"===o){var e=l.state.selectedProductId;l.state=t.newState(),e&&t.setSelected(l.state,e),l.log=[],c.textContent="",F();try{s&&s.removeItem(i)}catch(e){}N("He borrado todo lo que recordaba de esta visita (búsquedas, preferencias y conversación)."),z(t.greeting(l.state)),A()}}),window.addEventListener("offline",function(){B("Sin conexión · sigo respondiendo con lo ya cargado","busy")}),window.addEventListener("online",function(){B()}),f){_();try{f.addEventListener("voiceschanged",_)}catch(e){}}function e(){u("vaSound").setAttribute("aria-pressed",String(!!l.sound)),Array.prototype.forEach.call(u("vaSound").querySelectorAll(".w"),function(e){e.style.opacity=l.sound?1:.25})}function a(){var e=window.visualViewport?window.visualViewport.height:window.innerHeight;d.style.setProperty("--vvh",e+"px"),l.open&&M()}e(),u("vaSound").addEventListener("click",function(){f?(l.sound=!l.sound,e(),l.sound?D("Lectura en voz alta activada."):F(),A()):q("Tu navegador no ofrece lectura en voz alta.")}),u("vaMic").addEventListener("click",function(){if(w)U();else if(m)if(window.isSecureContext){l.voiceNoticed||(N("Aviso: el dictado usa el reconocimiento de voz de tu navegador, que puede procesar el audio en servicios del fabricante. Velan’s no graba ni guarda audio."),l.voiceNoticed=!0,A()),F(),q("Solicitando acceso al micrófono...");try{(b=new m).lang="es-ES",b.interimResults=!0,b.continuous=!1,b.maxAlternatives=1,y=u("vaInput").value?u("vaInput").value.trim()+" ":"",b.onstart=function(){if(!l.open){U(true);return}w=!0,u("vaMic").classList.add("rec"),u("vaMic").setAttribute("aria-pressed","true"),B("Escuchando… habla ahora","rec"),q("Te escucho. Pulsa de nuevo el micrófono para terminar.")},b.onresult=function(e){if(!l.open)return;for(var t="",a=0;a<e.results.length;a++)t+=e.results[a][0].transcript;u("vaInput").value=(y+t).slice(0,600),j()},b.onerror=function(e){var t={"not-allowed":"No se ha concedido acceso al micrófono. Ábrelo en Chrome, comprueba el permiso y utiliza HTTPS si es necesario.","service-not-allowed":"El servicio de dictado del navegador no está disponible aquí. Puedes escribir.","no-speech":"No te he oído. Pulsa el micrófono e inténtalo de nuevo, o escribe.","audio-capture":"No encuentro ningún micrófono disponible.",network:"El dictado necesita conexión con el servicio de voz del navegador y ha fallado. Puedes escribir."}[e.error];"aborted"!==e.error&&(q(t||"El dictado ha fallado. Puedes escribir tu consulta."),S=!0)},b.onend=function(){w=!1,u("vaMic").classList.remove("rec"),u("vaMic").setAttribute("aria-pressed","false"),B(),S||q(u("vaInput").value?"Revisa el texto dictado y pulsa enviar.":null),S=!1},b.start()}catch(e){q("No he podido iniciar el dictado en este navegador. Puedes escribir.")}}else q("El dictado necesita abrir la página por HTTPS. Mientras tanto, puedes escribir.");else q("Tu navegador no ofrece dictado por voz. Puedes escribir; en Chrome suele estar disponible.")}),window.visualViewport&&window.visualViewport.addEventListener("resize",a),window.addEventListener("resize",a),a()}();}}();