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
  const tabs=null, grid=zona.querySelector('.ae-grid'), mas=zona.querySelector('.ae-more');
  if(tabs)tabs.hidden=true;
  if(false)tabs.innerHTML=categorias.map(c=>`<button type="button" class="ae-tab" data-ae-cat="${esc(c)}" aria-pressed="${c===estado.cat}">${esc(c)}</button>`).join('');
  const bolsa='<svg class="amazon-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.1 12H6.1L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>';
  const boton=(p,variante)=>`<a class="amazon-cta ${variante} ae-cta-store" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(p.nombre)} en AliExpress; enlace de afiliado">${bolsa}<span>Ver en AliExpress</span></a>`;
  const foto=p=>`<span class="preview-photo-empty"></span><img class="preview-product-image" alt="Imagen de ${esc(p.nombre)}" src="${esc(imagenSegura(p.imagen))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  const badge=p=>p.descuento>0?`<span class="discount-badge" aria-label="Descuento indicado por AliExpress del ${Number(p.descuento)} por ciento">−${Number(p.descuento)}%</span>`:'';
  const precios=(p,tag)=>`<${tag}>${euro(p.precio)}</${tag}>${p.precioAntes>p.precio?`<del title="Precio anterior indicado por AliExpress">${euro(p.precioAntes)}</del>`:''}`;
  function tarjeta(p){
    return `<article class="product-card ae-producto" data-ae-id="${esc(p.id)}">
    <div class="product-photo-frame"><div class="product-photo" role="img" aria-label="Imagen de ${esc(p.nombre)}">${foto(p)}</div>${badge(p)}</div>
    <div class="product-body">
      <span class="product-brand">AliExpress</span>
      <h3><a class="product-title-button" href="${esc(enlaceSeguro(p.enlace))}" target="_blank" rel="noopener noreferrer sponsored">${esc(p.nombre)}</a></h3>
      <div class="pricing">${precios(p,'strong')}</div>
      <p class="product-note">★ ${Math.round(Number(p.valoracion))} % · ${Number(p.ventas).toLocaleString('es-ES')} vendidos · envío aparte</p>
      <div class="product-affiliate-label">Compra final en AliExpress · enlace de afiliado</div>
      ${boton(p,'amazon-cta-card')}
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
    top.innerHTML=lista.map(p=>`<article class="feature-product ae-destacado" data-ae-id="${esc(p.id)}">
      <div class="feature-photo-frame"><div class="fphoto" role="img" aria-label="Imagen de ${esc(p.nombre)}">${foto(p)}</div>${badge(p)}</div>
      <div class="ftxt"><span class="product-brand">${Number(p.ventas).toLocaleString('es-ES')} vendidos</span><h3>${esc(p.nombre)}</h3>
        <div class="fprice">${precios(p,'b')}</div>
        ${boton(p,'amazon-cta-feature')}
      </div></article>`).join('');
    zona.querySelector('.ae-featured').hidden=!lista.length;
    top.scrollLeft=0;
  }
  
  function pintar(){
    pintarTop();
    const lista=productos.filter(p=>estado.cat==='Todas'||p.categoria===estado.cat).sort((a,b)=>b.descuento-a.descuento);
    grid.innerHTML=lista.slice(0,estado.limite).map(tarjeta).join('');
    mas.hidden=lista.length<=estado.limite;
    const cuenta=document.getElementById('ae-count');if(cuenta)cuenta.textContent=`${Math.min(lista.length,estado.limite)} de ${lista.length} ofertas`;
    pintarBest();
  }
  // Lo más vendido: top 50 sin repetir (solo en «Todas»), ordenado por ventas.
  const best=Array.isArray(datos.masVendidos)?datos.masVendidos.filter(p=>enlaceSeguro(p.enlace)&&imagenSegura(p.imagen)):[];
  const bestZona=document.getElementById('ae-mas-vendidos'),bestGrid=zona.querySelector('.ae-best-grid'),bestMas=zona.querySelector('.ae-best-more');
  const bestEstado={limite:10};
  function pintarBest(){
    if(!bestZona)return;
    const ver=best.length&&estado.cat==='Todas';
    bestZona.hidden=!ver;if(!ver)return;
    bestGrid.innerHTML=best.slice(0,bestEstado.limite).map(tarjeta).join('');
    bestMas.hidden=best.length<=bestEstado.limite;
    const c=document.getElementById('ae-best-count');if(c)c.textContent=`${Math.min(best.length,bestEstado.limite)} de ${best.length} artículos`;
  }
  bestMas?.addEventListener('click',()=>{bestEstado.limite+=10;pintarBest();});
  tabs?.addEventListener('click',e=>{const b=e.target.closest('[data-ae-cat]');if(!b)return;estado.cat=b.dataset.aeCat;estado.limite=10;pintar();});
  mas.addEventListener('click',()=>{estado.limite+=10;pintar();});
  
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
    const tt=document.getElementById('ae-top-title');if(tt)tt.textContent=estado.cat==='Todas'?'Destacados':'Destacados · '+(estado.cat==='Hogar'?'Hogar y cocina':estado.cat);
  }
  function tienda(t,{scroll=true,url=true,nav=true}={}){
    t=t==='aliexpress'?'aliexpress':'amazon';
    const antes=document.body.dataset.tienda;
    document.body.dataset.tienda=t;
    botones.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.store===t)));
    if(t==='aliexpress'){estado.limite=20;pintar();}
    if(url){const u=new URL(location.href);if(t==='aliexpress')u.searchParams.set('tienda','aliexpress');else u.searchParams.delete('tienda');history.replaceState(history.state,'',u.pathname+u.search);}
    marcarNav();
    // Al volver a Amazon se abre en Amazon la misma categoría que se estaba viendo en AliExpress.
    if(nav&&t==='amazon'&&antes==='aliexpress'){
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
  // Para el asistente: cambiar de tienda y abrir una oferta concreta de AliExpress.
  window.VelansTienda=(t,o)=>tienda(t,o||{});
  window.VelansAEOpen=id=>{
    const todos=[...productos,...Object.values(datos.destacados||{}).flat()];
    const p=todos.find(x=>x.id===id)||best.find(x=>x.id===id);if(!p)return false;
    tienda('aliexpress',{scroll:false});
    estado.cat=disponibles.has(p.categoria)?p.categoria:'Todas';
    const lista=productos.filter(x=>estado.cat==='Todas'||x.categoria===estado.cat).sort((a,b)=>b.descuento-a.descuento);
    const i=lista.findIndex(x=>x.id===id);estado.limite=Math.max(20,i+1);
    pintar();marcarNav();
    if(!productos.some(x=>x.id===id)&&best.some(x=>x.id===id)){estado.cat='Todas';bestEstado.limite=Math.max(bestEstado.limite,best.findIndex(x=>x.id===id)+1);pintar();marcarNav();}
    const el=zona.querySelector(`.ae-grid [data-ae-id="${CSS.escape(id)}"]`)||zona.querySelector(`.ae-best-grid [data-ae-id="${CSS.escape(id)}"]`)||zona.querySelector(`.ae-top-list [data-ae-id="${CSS.escape(id)}"]`);
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('ae-resaltado');setTimeout(()=>el.classList.remove('ae-resaltado'),2600);}
    return true;
  };
})();
