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
  if(tabs)tabs.hidden=true;
  if(false)tabs.innerHTML=categorias.map(c=>`<button type="button" class="ae-tab" data-ae-cat="${esc(c)}" aria-pressed="${c===estado.cat}">${esc(c)}</button>`).join('');
  function tarjeta(p){
    const nombre=p.nombre; // título original de AliExpress, sin modificar (solo se acorta visualmente con CSS)
    return `<article class="ae-card">
      <a class="ae-photo" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(nombre)} en AliExpress; enlace de afiliado">
        <img src="${esc(imagenSegura(p.imagen))}" alt="${esc(nombre)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span class="ae-badge-store">AliExpress</span>
        ${p.descuento>0?`<span class="ae-badge-off">−${Number(p.descuento)}%</span>`:''}
      </a>
      <div class="ae-body">
        <h3>${esc(nombre)}</h3>
        <div class="ae-price"><strong>${euro(p.precio)}</strong>${p.precioAntes>p.precio?`<del title="Precio anterior indicado por AliExpress">${euro(p.precioAntes)}</del>`:''}</div>
        <p class="ae-meta"><span title="Valoraciones positivas">★ ${Math.round(Number(p.valoracion))} %</span> · ${Number(p.ventas).toLocaleString('es-ES')} vendidos</p>
        <a class="ae-cta" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(nombre)} en AliExpress; enlace de afiliado">Ver oferta <span aria-hidden="true">↗</span></a>
        <small class="ae-paid">Enlace de afiliado · envío aparte</small>
      </div>
    </article>`;
  }
  // Destacados: más vendidos (dominante) + descuento del mismo producto. Si los datos aún no traen
  // la lista diaria, se calcula aquí con la misma fórmula: 70 % ventas (escala logarítmica) + 30 % descuento.
  function puntuar(lista){
    const lv=lista.map(p=>Math.log10(1+Number(p.ventas||0))),ds=lista.map(p=>Number(p.descuento||0));
    const n=(x,a)=>{const mn=Math.min(...a),mx=Math.max(...a);return mx>mn?(x-mn)/(mx-mn):0};
    return lista.map((p,i)=>({...p,puntuacion:0.7*n(lv[i],lv)+0.3*n(ds[i],ds)})).sort((a,b)=>b.puntuacion-a.puntuacion);
  }
  const top=zona.querySelector('.ae-top-list');
  function destacadosDe(cat){
    const lista=(datos.destacados&&Array.isArray(datos.destacados[cat])?datos.destacados[cat]:null)
      ||puntuar(productos.filter(p=>cat==='Todas'||p.categoria===cat)).slice(0,cat==='Todas'?12:10);
    return lista.filter(p=>enlaceSeguro(p.enlace)&&imagenSegura(p.imagen));
  }
  function pintarTop(){
    if(!top)return;
    const lista=destacadosDe(estado.cat);
    top.innerHTML=lista.map(p=>`<article class="ae-top-card">
      <a class="ae-photo" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(p.nombre)} en AliExpress; enlace de afiliado">
        <img src="${esc(imagenSegura(p.imagen))}" alt="${esc(p.nombre)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span class="ae-badge-store">AliExpress</span>${p.descuento>0?`<span class="ae-badge-off">−${Number(p.descuento)}%</span>`:''}
      </a>
      <div class="ae-body"><span class="ae-sold">${Number(p.ventas).toLocaleString('es-ES')} vendidos</span><h3>${esc(p.nombre)}</h3>
        <div class="ae-price"><strong>${euro(p.precio)}</strong>${p.precioAntes>p.precio?`<del title="Precio anterior indicado por AliExpress">${euro(p.precioAntes)}</del>`:''}</div>
        <a class="ae-cta" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(p.nombre)} en AliExpress; enlace de afiliado">Ver oferta <span aria-hidden="true">↗</span></a>
        <small class="ae-paid">Enlace de afiliado</small></div></article>`).join('');
    zona.querySelector('.ae-top').hidden=!lista.length;
    top.scrollLeft=0;
  }
  top?.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.closest('.ae-top-card')?.remove();},true);
  function pintar(){
    pintarTop();
    const lista=productos.filter(p=>estado.cat==='Todas'||p.categoria===estado.cat).sort((a,b)=>b.descuento-a.descuento);
    grid.innerHTML=lista.slice(0,estado.limite).map(tarjeta).join('');
    mas.hidden=lista.length<=estado.limite;
  }
  tabs?.addEventListener('click',e=>{const b=e.target.closest('[data-ae-cat]');if(!b)return;estado.cat=b.dataset.aeCat;estado.limite=10;pintar();});
  mas.addEventListener('click',()=>{estado.limite+=10;pintar();});
  grid.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.closest('.ae-card')?.remove();},true);
  const f=zona.querySelector('.ae-date');if(f&&datos.actualizado)f.textContent=new Date(datos.actualizado+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
  zona.hidden=false;pintar();

  // Selector de tienda (debajo de las categorías): Amazon o AliExpress, por separado.
  // Con AliExpress elegido, las categorías de arriba filtran las ofertas de AliExpress (no hay pestañas aparte).
  const botones=[...document.querySelectorAll('[data-store]')];
  const titulo=document.getElementById('ae-title');
  const disponibles=new Set(productos.map(p=>p.categoria));
  const navBtns=()=>[...document.querySelectorAll('.department-nav [data-category]')];
  function marcarNav(){
    const ae=document.body.dataset.tienda==='aliexpress';
    navBtns().forEach(b=>{
      const cat=b.dataset.category;
      b.classList.toggle('ae-oculta',ae&&cat!=='Todas'&&!disponibles.has(cat));
      if(ae){const on=cat===estado.cat;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}
    });
    if(titulo)titulo.textContent=estado.cat==='Todas'?'Rebajas en AliExpress':'Rebajas en AliExpress · '+(estado.cat==='Hogar'?'Hogar y cocina':estado.cat);
  }
  function tienda(t,{scroll=true,url=true}={}){
    t=t==='aliexpress'?'aliexpress':'amazon';
    const antes=document.body.dataset.tienda;
    document.body.dataset.tienda=t;
    botones.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.store===t)));
    if(t==='aliexpress'){estado.limite=20;pintar();}
    if(url){const u=new URL(location.href);if(t==='aliexpress')u.searchParams.set('tienda','aliexpress');else u.searchParams.delete('tienda');history.replaceState(history.state,'',u.pathname+u.search);}
    marcarNav();
    // Al volver a Amazon se abre en Amazon la misma categoría que se estaba viendo en AliExpress.
    if(t==='amazon'&&antes==='aliexpress'){
      const destino=navBtns().find(b=>b.dataset.category===estado.cat)||navBtns().find(b=>b.dataset.category==='Todas');
      destino?.click();
    }
    if(scroll)window.scrollTo({top:0,behavior:'auto'});
  }
  botones.forEach(b=>b.addEventListener('click',()=>tienda(b.dataset.store)));
  document.addEventListener('click',e=>{
    if(document.body.dataset.tienda!=='aliexpress')return;
    const cat=e.target.closest('.department-nav [data-category]');
    if(cat){
      // Categorías de arriba → filtran AliExpress.
      e.preventDefault();e.stopImmediatePropagation();
      estado.cat=cat.dataset.category==='Todas'||disponibles.has(cat.dataset.category)?cat.dataset.category:'Todas';
      estado.limite=20;pintar();marcarNav();
      const inner=document.getElementById('department-nav-inner');
      if(inner?.classList.contains('is-expanded')){inner.classList.remove('is-expanded');document.getElementById('mobile-menu')?.setAttribute('aria-expanded','false');}
      window.scrollTo({top:0,behavior:'auto'});
      return;
    }
    // Logo, favoritos, novedades o abrir un artículo de Amazon → vuelve a la tienda Amazon.
    if(e.target.closest('#logo-home, #header-offers, #saved-top, #nav-new'))tienda('amazon',{scroll:false});
  },true);
  document.getElementById('search-form')?.addEventListener('submit',()=>{if(document.body.dataset.tienda==='aliexpress')tienda('amazon',{scroll:false});},true);
  tienda(new URLSearchParams(location.search).get('tienda'),{scroll:false,url:false});
})();
