'use strict';
// Ofertas de AliExpress: sección aparte de los productos de Amazon (programa de afiliados de AliExpress).
// Datos obtenidos con la API oficial de afiliados (aliexpress-productos.js). Precios orientativos.
(function(){
  const datos=window.VELANS_ALIEXPRESS;
  const zona=document.getElementById('aliexpress-ofertas');
  if(!zona||!datos||!Array.isArray(datos.productos)||!datos.productos.length){if(zona)zona.hidden=true;return;}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
  // Solo se aceptan enlaces de afiliado e imágenes de los dominios oficiales de AliExpress.
  const enlaceSeguro=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='s.click.aliexpress.com'?x.href:null}catch{return null}};
  const imagenSegura=u=>{try{const x=new URL(u);return x.protocol==='https:'&&/(^|\.)(alicdn\.com|aliexpress-media\.com)$/.test(x.hostname)?x.href:null}catch{return null}};
  const productos=datos.productos.filter(p=>enlaceSeguro(p.enlace)&&imagenSegura(p.imagen));
  const categorias=['Todas',...new Set(productos.map(p=>p.categoria))];
  const estado={cat:'Todas',limite:10};
  const tabs=zona.querySelector('.ae-tabs'), grid=zona.querySelector('.ae-grid'), mas=zona.querySelector('.ae-more');
  tabs.innerHTML=categorias.map(c=>`<button type="button" class="ae-tab" data-ae-cat="${esc(c)}" aria-pressed="${c===estado.cat}">${esc(c)}</button>`).join('');
  function tarjeta(p){
    const nombre=p.nombre; // título original de AliExpress, sin modificar (solo se acorta visualmente con CSS)
    return `<article class="ae-card">
      <a class="ae-photo" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(nombre)} en AliExpress; enlace de afiliado">
        <img src="${esc(imagenSegura(p.imagen))}" alt="${esc(nombre)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span class="ae-badge-store">AliExpress</span>
        ${p.descuento>0?`<span class="ae-badge-off">−${Number(p.descuento)}%</span>`:''}
      </a>
      <div class="ae-body">
        <span class="ae-cat">${esc(p.categoria)}</span>
        <h3>${esc(nombre)}</h3>
        <div class="ae-price"><strong>${euro(p.precio)}</strong>${p.precioAntes>p.precio?`<del title="Precio anterior indicado por AliExpress">${euro(p.precioAntes)}</del>`:''}</div>
        <p class="ae-meta"><span title="Valoraciones positivas">★ ${Math.round(Number(p.valoracion))} %</span> · ${Number(p.ventas).toLocaleString('es-ES')} vendidos</p>
        <a class="ae-cta" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(nombre)} en AliExpress; enlace de afiliado">Ver oferta <span aria-hidden="true">↗</span></a>
        <small class="ae-paid">Enlace de afiliado · envío aparte</small>
      </div>
    </article>`;
  }
  function pintar(){
    const lista=productos.filter(p=>estado.cat==='Todas'||p.categoria===estado.cat).sort((a,b)=>b.descuento-a.descuento);
    grid.innerHTML=lista.slice(0,estado.limite).map(tarjeta).join('');
    mas.hidden=lista.length<=estado.limite;
    tabs.querySelectorAll('.ae-tab').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.aeCat===estado.cat)));
  }
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-ae-cat]');if(!b)return;estado.cat=b.dataset.aeCat;estado.limite=10;pintar();});
  mas.addEventListener('click',()=>{estado.limite+=10;pintar();});
  grid.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.closest('.ae-card')?.remove();},true);
  const f=zona.querySelector('.ae-date');if(f&&datos.actualizado)f.textContent=new Date(datos.actualizado+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
  zona.hidden=false;pintar();

  // Selector de tienda (debajo de las categorías): Amazon o AliExpress, por separado.
  const botones=[...document.querySelectorAll('[data-store]')];
  function tienda(t,{scroll=true,url=true}={}){
    t=t==='aliexpress'?'aliexpress':'amazon';
    document.body.dataset.tienda=t;
    botones.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.store===t)));
    if(t==='aliexpress'){estado.limite=20;pintar();}
    if(url){const u=new URL(location.href);if(t==='aliexpress')u.searchParams.set('tienda','aliexpress');else u.searchParams.delete('tienda');history.replaceState(history.state,'',u.pathname+u.search);}
    if(scroll)window.scrollTo({top:0,behavior:'auto'});
  }
  botones.forEach(b=>b.addEventListener('click',()=>tienda(b.dataset.store)));
  // Elegir un departamento, buscar o abrir un artículo de Amazon vuelve a la tienda Amazon.
  document.addEventListener('click',e=>{
    if(document.body.dataset.tienda!=='aliexpress')return;
    if(e.target.closest('.department-nav [data-category], #logo-home, #header-offers, #saved-top, #nav-new, #nav-filter-apply'))tienda('amazon',{scroll:false});
  },true);
  document.getElementById('search-form')?.addEventListener('submit',()=>{if(document.body.dataset.tienda==='aliexpress')tienda('amazon',{scroll:false});},true);
  tienda(new URLSearchParams(location.search).get('tienda'),{scroll:false,url:false});
})();
