'use strict';
// Los precios y descuentos proceden del catálogo; no son cotizaciones de Amazon en tiempo real.
const sourceCatalog=window.VELANS_PREVIEW_DATA;
if(!sourceCatalog||!Array.isArray(sourceCatalog.products))throw Error('Falta el catálogo de artículos');
const deduplicated=window.VelansPreviewRules.dedupeExactNames(sourceCatalog.products.map(window.VelansPreviewTaxonomy.categorise));
const products=deduplicated.products;
// Fotos con licencia libre (Wikimedia Commons / Open Beauty Facts) con su atribución: fotos-libres.js
const freePhotos=window.VELANS_FOTOS_LIBRES||{};
products.forEach(p=>{const f=freePhotos[p.id];if(f&&f.src&&!p.imageUrl){p.imageUrl=f.src;p.photoCredit=f;p.photoVerified=true}});
const hiddenDuplicates=deduplicated.discarded;
// The assistant reads the exact collection used by the storefront, including later pages.
window.VelansPublishedCatalog = {products, generatedAt:sourceCatalog.generatedAt};
window.VelansAssistenceOpenArticle = openProductPage;
// El control de duplicados sigue actuando sobre los datos, pero no se expone en la tienda.
const displayedCatalogCount=products.length;
const state={category:'Todas',audience:'all',subtype:'all',band:'all',term:'',sort:'featured',onlySaved:false,limit:20,view:'home',productId:null};
// Los favoritos se guardan únicamente en este navegador, sin datos de cuenta.
let previousFavorites=[];
try{previousFavorites=JSON.parse(localStorage.getItem('velans-favorites')||'[]')}catch{}
const saved=new Set(Array.isArray(previousFavorites)?previousFavorites.filter(id=>products.some(p=>p.id===id)):[]);
const categoryInfo={
  Moda:{slug:'moda',title:'Moda y accesorios',description:'Ropa, calzado y complementos. Descubre la selección de moda de Velan’s.',symbol:'M'},
  Tecnología:{slug:'tecnologia',title:'Tecnología',description:'Audio, relojes y dispositivos. Una selección de oportunidades en tecnología.',symbol:'T'},
  Hogar:{slug:'hogar',title:'Hogar y cocina',description:'Equipamiento, decoración y pequeños electrodomésticos para tu día a día.',symbol:'H'},
  Bricolaje:{slug:'bricolaje',title:'Bricolaje',description:'Una sección reservada para herramientas, reparaciones y proyectos del hogar.',symbol:'B'},
  Belleza:{slug:'belleza',title:'Belleza y cuidado personal',description:'Perfumería, cuidado facial y productos para tu rutina de bienestar.',symbol:'B'},
  Infantil:{slug:'infantil',title:'Bebés, infancia y juguetes',description:'Artículos infantiles y de crianza presentes en nuestro catálogo.',symbol:'I'},
  Deportes:{slug:'deportes',title:'Deporte y aire libre',description:'Equipamiento deportivo y aventura de nuestro catálogo.',symbol:'D'},
  Automoción:{slug:'automocion',title:'Coche y moto',description:'Accesorios, conectividad y seguridad para vehículos.',symbol:'A'},
  Mascotas:{slug:'mascotas',title:'Mascotas',description:'Productos y complementos para animales de compañía.',symbol:'M'},
  Oficina:{slug:'oficina',title:'Oficina y papelería',description:'Cuadernos, accesorios y material de escritorio.',symbol:'O'},
  Alimentación:{slug:'alimentacion',title:'Alimentación',description:'Alimentos, bebidas y pequeños caprichos.',symbol:'A'},
  Otros:{slug:'otros',title:'Más productos',description:'Artículos pendientes de una clasificación más específica.',symbol:'+'}
};
const tiers=[['all','Todos'],['10-29','10–29 %'],['30-49','30–49 %'],['50+','50 % o más']];
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const pct=p=>null; // Sin descuentos: Amazon solo permite datos de precio de su API.
const priceText=p=>'';
const wasText=p=>'';
const percentageBadge=p=>pct(p)>0?`<span class="discount-badge" aria-label="Descuento anunciado del ${pct(p)} por ciento">−${pct(p)}%</span>`:'';
const heroDiscount=p=>pct(p)>0?`<span class="hero-offer-indicator" aria-label="Descuento anunciado del ${pct(p)} por ciento"><span>AHORRA</span><strong>−${pct(p)}%</strong></span>`:'';
const amazonIcon='<svg class="amazon-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.1 12H6.1L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>';
// Los títulos vienen de catálogos externos y no deben interpretarse como HTML.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayBrand=p=>/^(CANAL GANGAGATO|CATÁLOGO ACTUAL)$/i.test(p.brand||'')?'VELAN’S':p.brand;
const photoMark=p=>({Moda:'✧',Tecnología:'◇',Hogar:'⌂',Belleza:'❋',Otros:'✦'}[p.category]||'✦');
const photoMessage=p=>`<span class="preview-photo-mark" aria-hidden="true">${photoMark(p)}</span><span class="preview-photo-label">IMAGEN PENDIENTE</span>`;
// Solo la URL de Amazon.es con la etiqueta de afiliado configurada puede
// convertirse en enlace comercial. No se confía en destinos ajenos del feed.
function amazonLink(p){
  try{
    const url=new URL(String(p.affiliateUrl||''));
    if(url.protocol!=='https:'||url.username||url.password||!['amazon.es','www.amazon.es'].includes(url.hostname))return null;
    const cleanUrl=new URL('https://www.amazon.es'+url.pathname);
    if(/^\/dp\/[A-Z0-9]{10}\/?$/i.test(url.pathname)){
      // Solo enlace directo al ASIN y nuestro identificador comercial.
    }else if(url.pathname==='/s'&&url.searchParams.get('k')){
      // Artículos antiguos sin ASIN identificado: búsqueda de su descripción.
      cleanUrl.searchParams.set('k',url.searchParams.get('k'));
    }else return null;
    cleanUrl.searchParams.set('tag','velans-21');
    return cleanUrl.href;
  }catch{}
  return null;
}
function amazonButton(p,variant=''){
  const link=amazonLink(p);
  return link?`<a class="amazon-cta ${variant}" href="${esc(link)}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Ver ${esc(p.name)} en Amazon.es; enlace de afiliado">${amazonIcon}<span>Ver en Amazon</span></a>`:'<span class="amazon-unavailable">Enlace de Amazon pendiente</span>';
}
// Las fotografías obtenidas por ASIN son orientativas hasta contrastar la variante.
function photoCandidate(p){
  if(typeof p.imageUrl==='string'){
    try{const url=new URL(p.imageUrl,location.href);const local=url.origin===location.origin&&/^\/img\/libres\//.test(url.pathname);if((local||url.protocol==='https:')&&!/amazon|media-amazon/i.test(url.hostname)&&!url.username&&!url.password)return {url:url.href,verified:p.photoVerified===true};}catch{}
  }
  // Sin fotos de Amazon: sus normas de afiliado solo permiten imágenes obtenidas por su API.
  return null;
}
function photoMarkup(p){
  const candidate=photoCandidate(p);
  if(!candidate)return photoMessage(p);
  return `<span class="preview-photo-empty">${photoMessage(p)}</span><img class="preview-product-image" alt="Imagen de ${esc(p.name)}" src="${esc(candidate.url)}"${p.photoCredit?` title="Foto: ${esc(p.photoCredit.autor)} · ${esc(p.photoCredit.licencia)}"`:''} loading="lazy" decoding="async">${p.photoCredit?'':`<span class="preview-photo-source ${candidate.verified?'is-verified':''}" hidden>${candidate.verified?'IMG VERIFICADA':'IMG PROVI.'}</span>`}`;
}
document.addEventListener('load',event=>{
  if(!event.target.matches?.('.preview-product-image'))return;
  const image=event.target;
  if(image.naturalWidth<60||image.naturalHeight<60)return;
  image.parentElement.classList.add('has-product-photo');
  const source=image.parentElement.querySelector('.preview-photo-source');
  if(source)source.hidden=false;
},true);
document.addEventListener('error',event=>{
  if(!event.target.matches?.('.preview-product-image'))return;
  event.target.remove();
},true);
const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// Los sectores solo aparecen cuando hay artículos de ese sector.
// Si se añade un producto de una categoría nueva, también se crea su vista y sus filtros.
function availableCategories(){
  const categories=[...new Set(products.map(p=>p.category).filter(Boolean))];
  for(const category of categories){
    if(!categoryInfo[category])categoryInfo[category]={
      slug:clean(category).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
      title:category,
      description:`Explora los artículos de ${category} disponibles en Velan’s.`,
      symbol:category.charAt(0).toUpperCase()
    };
  }
  const order=Object.keys(categoryInfo);
  return categories.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
}
function availableSubtypes(category,audience='all'){
  const types=[...new Set(products.filter(p=>p.category===category&&(audience==='all'||p.audience===audience)).map(p=>p.module).filter(Boolean))];
  const preferred=(window.VelansPreviewTaxonomy.modules[category]||[]).map(([name])=>name);
  return types.sort((a,b)=>{
    const first=preferred.indexOf(a),second=preferred.indexOf(b);
    return (first<0?1000:first)-(second<0?1000:second)||a.localeCompare(b,'es');
  });
}
function availableAudiences(category){
  return ['Hombre','Mujer','Unisex','Sin especificar'].filter(a=>products.some(p=>p.category===category&&p.audience===a));
}
function initCategoryNavigation(){
  const filterButton=$('#nav-filter-toggle');
  const categorySelect=$('#nav-filter-category');
  categorySelect.replaceChildren(categorySelect.firstElementChild);
  for(const category of availableCategories()){
    const button=document.createElement('button');
    button.type='button';button.dataset.category=category;
    button.textContent=category==='Hogar'?'Hogar y cocina':category;
    filterButton.before(button);
    const option=document.createElement('option');
    option.value=category;option.textContent=categoryInfo[category].title;
    categorySelect.append(option);
  }
  // El acceso a descuentos especiales tampoco debe llevar a una sección vacía.
  $('[data-band="50+"]').hidden=true;
}
// El panel se adapta al departamento; dentro de Moda añade un nivel de público.
function populateContextualFilters(category,audience='all',module='all'){
  const categoryField=$('#nav-filter-category-field');
  const audienceField=$('#nav-filter-audience-field');
  const moduleField=$('#nav-filter-module-field');
  const categorySelect=$('#nav-filter-category');
  const audienceSelect=$('#nav-filter-audience');
  const moduleSelect=$('#nav-filter-module');
  const committedCategory=state.category!=='Todas'&&state.view==='listing';
  categoryField.hidden=committedCategory;
  categoryField.style.gridColumn='1 / -1';
  categorySelect.value=category;
  audienceField.hidden=category!=='Moda';
  audienceSelect.replaceChildren(new Option('Hombre y mujer · Todos','all'));
  for(const a of availableAudiences(category)){
    const count=products.filter(p=>p.category===category&&p.audience===a).length;
    audienceSelect.add(new Option(`${a} (${count})`,a));
  }
  audienceSelect.value=[...audienceSelect.options].some(o=>o.value===audience)?audience:'all';
  moduleField.hidden=category==='Todas';
  moduleField.style.gridColumn=category==='Moda'?'auto':'1 / -1';
  const selectedAudience=category==='Moda'?audienceSelect.value:'all';
  const pool=products.filter(p=>p.category===category&&(selectedAudience==='all'||p.audience===selectedAudience));
  moduleSelect.replaceChildren(new Option('Todos los tipos de artículo','all'));
  const available=availableSubtypes(category,selectedAudience);
  const knownModules=category==='Moda'?available:[...(window.VelansPreviewTaxonomy.modules[category]||[]).map(([name])=>name),...available.filter(name=>!(window.VelansPreviewTaxonomy.modules[category]||[]).some(([known])=>known===name))];
  for(const type of knownModules){
    const count=pool.filter(p=>p.module===type).length;
    const option=new Option(count?`${type} (${count})`:`${type} (sin artículos)`,type);
    option.disabled=count===0;
    moduleSelect.add(option);
  }
  moduleSelect.value=[...moduleSelect.options].some(o=>o.value===module)?module:'all';
  const count=pool.filter(p=>moduleSelect.value==='all'||p.module===moduleSelect.value).length;
  $('#nav-filter-context').textContent=category==='Todas'?'TODOS LOS DEPARTAMENTOS':`FILTROS DE ${category.toUpperCase()}`;
  $('#nav-filter-title').textContent=category==='Todas'?'Elige tu departamento':category==='Moda'?'Hombre, mujer y prendas':categoryInfo[category]?.title||category;
  $('#nav-filter-hint').textContent=category==='Todas'?'Selecciona un departamento para desplegar sus apartados.':`${count} artículos disponibles en esta selección.`;
  $('#mobile-filter-toggle').textContent=category==='Todas'?'☷  Categorías':'☷  Filtros de '+category;
}
function imageStyle(p){
  const tones={Moda:['#f6eee7','#cfaf9b'],Tecnología:['#e9e9f2','#a8a9c1'],Hogar:['#eff1e9','#b6c5a9'],Belleza:['#f6eaf0','#d6aebe'],Otros:['#f1ece8','#c3b8b0']};
  const [a,b]=tones[p.category]||tones.Otros;
  return `--image:linear-gradient(140deg,${a},${b});--size:cover;--x:50%;--y:50%`;
}
// El escaparate superior solo admite fichas cuya imagen ha cargado de verdad.
// La mera existencia de un ASIN o URL no implica que haya fotografía disponible.
const heroCandidates=products.filter(p=>photoCandidate(p)&&amazonLink(p));
const firstHeroCandidates=heroCandidates.slice(0,16);
const differentDepartments=heroCandidates.filter((p,i,list)=>list.findIndex(q=>q.category===p.category)===i);
const heroPool=[...new Set([...firstHeroCandidates,...differentDepartments])].slice(0,25);
let heroProducts=[];
let heroReady=false;
let heroCurrent=0;
let heroTimer;
let heroTouchPausedUntil=0;
function hasUsablePhoto(p){
  const candidate=photoCandidate(p);
  if(!candidate)return Promise.resolve(false);
  return new Promise(resolve=>{
    const img=new Image();let finished=false;
    const stop=ok=>{if(finished)return;finished=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(ok)};
    const timer=setTimeout(()=>stop(false),7500);
    img.onload=()=>stop(img.naturalWidth>=60&&img.naturalHeight>=60);
    img.onerror=()=>stop(false);
    img.src=candidate.url;
  });
}
async function prepareHero(){
  const results=await Promise.all(heroPool.map(async p=>({product:p,loaded:await hasUsablePhoto(p)})));
  heroProducts=results.filter(entry=>entry.loaded).slice(0,10).map(entry=>entry.product);
  if(!heroProducts.length)return; // No se muestra un escaparate vacío.
  heroReady=true;
  initHero();
  $('#hero-carousel').hidden=state.view!=='home';
}
function scheduleHero(){
  window.clearTimeout(heroTimer);
  if(!heroProducts.length)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const delay=heroProducts[heroCurrent].name.length>44?4000:3000;
  heroTimer=window.setTimeout(()=>{
    const banner=$('#hero-carousel');
    if(banner.hidden){scheduleHero();return}
    const pauseForInteraction=(window.matchMedia('(hover: hover)').matches&&(banner.matches(':hover')||banner.contains(document.activeElement)))||Date.now()<heroTouchPausedUntil;
    if(pauseForInteraction||!$('#detail-modal').hidden){scheduleHero();return}
    showHero(heroCurrent+1);
  },delay);
}
function initHero(){
  const colors=['#60424f','#625257','#6b5148','#45475c','#70525d','#64464b','#63505d','#544755','#60505b','#6c514f'];
  $('#hero-carousel-slides').innerHTML=heroProducts.map((p,index)=>`
    <article class="hero-slide ${index===0?'is-active':''}" data-hero-slide="${index}" aria-hidden="${index!==0}" style="--hero-tone:${colors[index]}">
      <div class="hero-slide-copy">
        <div class="hero-slide-kicker"><span class="hero-kicker-line"></span> DESTACADOS DE NUESTRA SELECCIÓN <span class="hero-kicker-secondary">/ VELAN’S</span></div>
        <span class="hero-slide-brand">${esc(displayBrand(p))}</span>
        <h1 class="hero-slide-title"><button type="button" class="hero-title-link" data-product-page="${p.id}" ${index===0?'':'tabindex="-1"'}>${esc(p.name)}</button></h1>
        <div class="hero-slide-prices">
          <div class="hero-current-price">${priceText(p)}</div>
          <div class="hero-previous-price">${wasText(p)?`<span>ANTES</span> <del>${wasText(p)}</del>`:''}</div>
          ${heroDiscount(p)}
        </div>
        <p class="hero-legal-note">Descubre los artículos destacados de nuestra selección.</p>
        <button type="button" class="hero-slide-link" data-product-page="${p.id}" ${index===0?'':'tabindex="-1"'}>Ver este artículo</button>
      </div>
      <button type="button" class="hero-slide-display" data-product-page="${p.id}" aria-label="Abrir ficha de ${esc(p.name)}" ${index===0?'':'tabindex="-1"'}>
        <div class="hero-photo-backdrop"></div>
        <div class="hero-photo-frame"><div class="hero-item-photo" style="${imageStyle(p)}">${photoMarkup(p)}</div></div>
      </button>
    </article>`).join('');
  $('#hero-dots').innerHTML=heroProducts.map((p,index)=>`<button type="button" class="hero-dot ${index===0?'is-active':''}" data-hero-index="${index}" aria-label="Mostrar artículo ${index+1}: ${esc(p.kind)}" aria-pressed="${index===0}"></button>`).join('');
  $('#hero-page-number').textContent=`01 / ${String(heroProducts.length).padStart(2,'0')}`;
  scheduleHero();
}
function showHero(index){
  if(!heroProducts.length)return;
  heroCurrent=(index+heroProducts.length)%heroProducts.length;
  $$('[data-hero-slide]').forEach(slide=>{
    const active=Number(slide.dataset.heroSlide)===heroCurrent;
    slide.classList.toggle('is-active',active);
    slide.setAttribute('aria-hidden',String(!active));
    slide.querySelectorAll('[data-product-page]').forEach(button=>{button.tabIndex=active?0:-1});
  });
  $$('[data-hero-index]').forEach(dot=>{
    const active=Number(dot.dataset.heroIndex)===heroCurrent;
    dot.classList.toggle('is-active',active);
    dot.setAttribute('aria-pressed',String(active));
  });
  $('#hero-page-number').textContent=String(heroCurrent+1).padStart(2,'0')+' / '+String(heroProducts.length).padStart(2,'0');
  scheduleHero();
}
function card(p){
  return `<article class="product-card" data-card-product="${p.id}">
    <div class="product-photo-frame">
      <div class="product-photo" role="img" aria-label="Imagen provisional por comprobar para ${esc(p.name)}" style="${imageStyle(p)}">
        ${photoMarkup(p)}
        <button type="button" class="favorite ${saved.has(p.id)?'active':''}" data-save="${p.id}" aria-label="${saved.has(p.id)?'Quitar de':'Añadir a'} favoritos" aria-pressed="${saved.has(p.id)}">${saved.has(p.id)?'♥':'♡'}</button>
      </div>
      ${percentageBadge(p)}
    </div>
    <div class="product-body">
      <span class="product-brand">${esc(displayBrand(p))}</span>
      <span class="product-category">${esc(p.category)} · ${p.audience!=='all'?esc(p.audience)+' · ':''}${esc(p.module)}</span>
      <h3><button type="button" class="product-title-button" data-product="${p.id}" aria-label="Ver detalles de ${esc(p.name)}">${esc(p.name)}</button></h3>
      <div class="pricing"><strong>${priceText(p)}</strong>${wasText(p)?`<del>${wasText(p)}</del>`:''}</div>
      <p class="product-note">${'Precio y disponibilidad actualizados en Amazon.es.'}</p>
      <div class="product-affiliate-label">Compra final en Amazon.es</div>
      ${amazonButton(p,'amazon-cta-card')}
    </div>
  </article>`;
}
function featured(p){
  return `<article class="feature-product" data-card-product="${p.id}" tabindex="0" aria-label="Ver detalles de ${esc(p.name)}">
    <div class="feature-photo-frame"><div class="fphoto" role="img" aria-label="Fotografía del producto" style="${imageStyle(p)}">${photoMarkup(p)}</div>${percentageBadge(p)}</div>
    <div class="ftxt"><span class="product-brand">${esc(displayBrand(p))}</span><span class="product-category">${esc(p.category)}</span><h3>${esc(p.name)}</h3>
      <div class="fprice"><b>${priceText(p)}</b>${wasText(p)?`<del>${wasText(p)}</del>`:''}</div>
      ${amazonButton(p,'amazon-cta-feature')}
    </div>
  </article>`;
}
function initFilters(){
  const top=products.filter(p=>p.source==='manager').slice(0,9);
  $('#featured-list').innerHTML=top.map(featured).join('');
}
function inBand(p,band){
  const d=pct(p);
  if(band==='10-29')return d>=10&&d<30;
  if(band==='30-49')return d>=30&&d<50;
  if(band==='50+')return d>=50;
  return true;
}
function filtered(){
  const q=clean(state.term).trim();
  let rows=products.filter(p=>{
    if(state.category!=='Todas'&&p.category!==state.category)return false;
    if(state.audience!=='all'&&p.audience!==state.audience)return false;
    if(state.subtype!=='all'&&p.module!==state.subtype)return false;
    if(state.onlySaved&&!saved.has(p.id))return false;
    if(q&&!clean(p.name+' '+p.category+' '+p.kind+' '+p.subtype+' '+p.brand).includes(q))return false;
    if(state.band!=='all'&&(!p.checked||!inBand(p,state.band)))return false;
    return true;
  });
  // El catálogo prioriza fichas con una imagen orientativa recuperable,
  // sin sacar del catálogo las que siguen esperando fotografía.
  if(state.sort==='featured')rows.sort((a,b)=>Number(Boolean(photoCandidate(b)))-Number(Boolean(photoCandidate(a))));
  if(state.sort==='discount')rows.sort((a,b)=>(b.checked?pct(b):-1)-(a.checked?pct(a):-1));
  if(state.sort==='cheap')rows.sort((a,b)=>(Number.isFinite(a.price)?a.price:Infinity)-(Number.isFinite(b.price)?b.price:Infinity));
  if(state.sort==='latest')rows.sort((a,b)=>String(b.postedAt||'').localeCompare(String(a.postedAt||'')));
  return rows;
}
let observer;
function renderProductPage(){
  const p=products.find(item=>item.id===state.productId);
  if(!p)return;
  $('#product-page-breadcrumb').textContent=p.category+' / '+p.module;
  $('#product-page-photo').style.cssText=imageStyle(p);
  $('#product-page-photo').setAttribute('aria-label','Imagen de '+p.name);
  // En la ficha grande el descuento ya está junto al precio: fotografía despejada.
  $('#product-page-photo').innerHTML=photoMarkup(p);
  const caption=$('#product-page-photo-caption');caption.textContent=photoCandidate(p)?'':'IMAGEN PENDIENTE';
  if(p.photoCredit){const c=p.photoCredit;caption.textContent='Foto: '+c.autor+' · ';const a=document.createElement('a');a.href=c.licenciaUrl||c.pagina;a.target='_blank';a.rel='noopener noreferrer license';a.textContent=c.licencia;caption.append(a,document.createTextNode(' · '));const b=document.createElement('a');b.href='./creditos-imagenes.html';b.textContent='créditos';caption.append(b);caption.classList.add('is-credit')}else caption.classList.remove('is-credit');
  $('#product-page-brand').textContent=displayBrand(p);
  $('#product-page-title').textContent=p.name;
  $('#product-page-kind').textContent=p.category+' · '+(p.audience==='all'?'':p.audience+' · ')+p.module;
  $('#product-page-price').textContent=priceText(p);
  $('#product-page-was').textContent=wasText(p);
  $('#product-page-discount').textContent=pct(p)>0?`−${pct(p)}%`:'';
  $('#product-page-discount').hidden=!(pct(p)>0);
  $('#product-page-note').textContent='Artículo de nuestra selección. Consulta el precio y la disponibilidad actualizados en Amazon.es.';
  const amazon=$('#product-page-amazon');
  const link=amazonLink(p);
  amazon.hidden=!link;
  amazon.href=link||'#';
  amazon.setAttribute('aria-label',`Ver ${p.name} en Amazon.es; enlace de afiliado`);
  document.title=p.name+' · Velan’s';
}
function renderSection(){
  const listing=state.view==='listing';
  const productPage=state.view==='product';
  $$('[data-home-only]').forEach(section=>{section.hidden=listing||productPage||(section.id==='hero-carousel'&&!heroReady)});
  $('#category-landing').hidden=!listing;
  $('#product-landing').hidden=!productPage;
  $('#catalogo').hidden=productPage;
  if(productPage){renderProductPage();return}
  $('#catalogo').classList.toggle('listing-view',listing);
  if(!listing){
    document.title='Velan’s · Selección de moda, tecnología y hogar';
    $('#catalog-eyebrow').textContent='DESCUBRE Y COMPARA';
    $('#catalog-title').textContent='Nuestra selección';
    $('#catalog-subtitle').textContent='Una selección de moda, tecnología, hogar y mucho más. Descubre tu próximo favorito.';
    return;
  }
  const category=categoryInfo[state.category];
  const title=category?.title||(state.onlySaved?'Mis favoritos':state.term?'Resultados de búsqueda':state.sort==='latest'?'Últimas incorporaciones':'Catálogo integrado');
  const description=(category?.description|| (state.onlySaved?'Los productos que has guardado en tu selección personal.':state.term?`Productos relacionados con «${state.term}».`:'Explora los artículos seleccionados con los criterios que has elegido.'))+(state.audience!=='all'?` · ${state.audience}`:'')+(state.subtype!=='all'?` · ${state.subtype}`:'');
  $('#section-title').textContent=title;
  $('#section-breadcrumb').textContent=title;
  $('#section-description').textContent=description;
  $('#section-eyebrow').textContent=category?'DEPARTAMENTO VELAN’S':'SELECCIÓN VELAN’S';
  $('#section-monogram').textContent=category?.symbol||'V';
  $('#catalog-eyebrow').textContent='EXPLORA Y COMPARA';
  $('#catalog-title').textContent=category?'Artículos de esta categoría':'Artículos disponibles';
  $('#catalog-subtitle').textContent='Filtra esta categoría para encontrar lo que estás buscando.';
  document.title=`${title} · Velan’s`;
}
function render(){
  if(observer){observer.disconnect();observer=undefined}
  renderSection();
  const all=filtered();
  const visible=all.slice(0,state.limit);
  const empty='<div class="no-results"><h3>No hay resultados con estos filtros</h3><p>Prueba otra búsqueda o categoría.</p><button type="button" data-reset>Ver todos los artículos</button></div>';
  $('#product-grid').innerHTML=visible.length?visible.map(card).join(''):empty;
  $('#catalog-count').textContent=all.length+' de '+displayedCatalogCount+' artículos integrados';
  $('#saved-count').textContent=saved.size+' guardados';
  $('#saved-top').setAttribute('aria-pressed',String(state.onlySaved));
  $('#saved-top .action-icon').textContent=state.onlySaved?'♥':'♡';
  const active=[state.onlySaved?'Favoritos':'',state.category!=='Todas'?state.category:'',state.audience!=='all'?state.audience:'',state.subtype!=='all'?state.subtype:'',state.band!=='all'?'Descuento '+tiers.find(x=>x[0]===state.band)[1]:'',state.term?'Búsqueda: '+state.term:''].filter(Boolean);
  $('#active-message').textContent=active.length?active.join(' · '):`${displayedCatalogCount} artículos en nuestra selección`;
  $('#clear-active').hidden=active.length===0;
  $$('[data-category]').forEach(el=>{const on=el.dataset.category===state.category;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on))});
  $$('[data-band]').forEach(el=>{const on=el.dataset.band===state.band;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on))});
  $('#nav-filter-toggle').classList.toggle('has-filters',state.view==='listing'&&(state.category!=='Todas'||state.audience!=='all'||state.subtype!=='all'||state.band!=='all'));
  $('#mobile-filter-toggle').textContent=state.category==='Todas'?'☷  Categorías':'☷  Filtros de '+state.category;
  $('#sort-select').value=state.sort;
  const more=visible.length<all.length;
  $('#load-zone').hidden=!more;
  $('#load-caption').textContent=`Mostrando ${visible.length} de ${all.length} artículos del catálogo integrado`;
  $('#load-more').firstChild.textContent='Mostrar más ';
}
function writeRoute(){
  const url=new URL(window.location.href);
  ['categoria','publico','tipo','descuento','buscar','favoritos','orden','articulo'].forEach(param=>url.searchParams.delete(param));
  if(state.view==='product'&&state.productId){
    url.searchParams.set('articulo',String(state.productId));
  }
  if(state.view==='listing'){
    if(categoryInfo[state.category])url.searchParams.set('categoria',categoryInfo[state.category].slug);
    if(state.audience!=='all')url.searchParams.set('publico',state.audience);
    if(state.subtype!=='all')url.searchParams.set('tipo',state.subtype);
    if(state.band!=='all')url.searchParams.set('descuento',state.band);
    if(state.term)url.searchParams.set('buscar',state.term);
    if(state.onlySaved)url.searchParams.set('favoritos','1');
    if(state.sort==='latest')url.searchParams.set('orden','recientes');
  }
  window.history.pushState({},'',url.pathname+url.search);
}
function readRoute(){
  const params=new URLSearchParams(window.location.search);
  const selected=availableCategories().find(key=>categoryInfo[key].slug===params.get('categoria'));
  const product=products.find(p=>String(p.id)===params.get('articulo'));
  state.productId=product?.id||null;
  state.category=product?.category||selected||'Todas';
  state.audience=selected&&availableAudiences(selected).includes(params.get('publico'))?params.get('publico'):'all';
  state.subtype=selected&&availableSubtypes(selected,state.audience).includes(params.get('tipo'))?params.get('tipo'):'all';
  state.band='all'; // Filtro de descuento EN PAUSA hasta tener la API de Amazon: se ignora ?descuento=
  state.term=params.get('buscar')||'';
  state.onlySaved=params.get('favoritos')==='1';
  state.sort=params.get('orden')==='recientes'?'latest':'featured';
  state.view=product?'product':selected||state.band!=='all'||state.term||state.onlySaved||state.sort==='latest'?'listing':'home';
  state.limit=20;
  $('#search-input').value=state.term;
}
function showPage(){
  closeFilters();closeMobileMenu();writeRoute();render();window.scrollTo({top:0,behavior:'auto'});
}
function closeMobileMenu(){
  $('#department-nav-inner').classList.remove('is-expanded');
  $('#mobile-menu').setAttribute('aria-expanded','false');
  $('#mobile-menu').setAttribute('aria-label','Mostrar todas las categorías');
}
function updateCategory(c){
  state.category=c;state.audience='all';state.subtype='all';state.productId=null;state.band='all';state.term='';state.onlySaved=false;state.sort='featured';state.view=c==='Todas'?'home':'listing';
  $('#search-input').value='';state.limit=20;showPage();
}
function updateBand(b){
  b='all'; // Descuentos EN PAUSA hasta la API de Amazon
  state.category='Todas';state.audience='all';state.subtype='all';state.productId=null;state.band=b;state.term='';state.onlySaved=false;state.sort='featured';state.view=b==='all'?'home':'listing';
  $('#search-input').value='';state.limit=20;showPage();
}
function openFilters(focusOnDiscount=false){
  populateContextualFilters(state.category,state.audience,state.subtype);
  $('#nav-filter-discount').value=state.band;
  $('#nav-filter-panel').hidden=false;
  $('#nav-filter-backdrop').hidden=false;
  $('#nav-filter-toggle').setAttribute('aria-expanded','true');
  $('#mobile-filter-toggle').setAttribute('aria-expanded','true');
  $('#mobile-filter-toggle').textContent='×  Cerrar filtros';
  $(focusOnDiscount?'#nav-filter-discount':state.category==='Moda'?'#nav-filter-audience':state.category==='Todas'?'#nav-filter-category':'#nav-filter-module').focus();
}
function closeFilters(){
  $('#nav-filter-panel').hidden=true;
  $('#nav-filter-backdrop').hidden=true;
  $('#nav-filter-toggle').setAttribute('aria-expanded','false');
  $('#mobile-filter-toggle').setAttribute('aria-expanded','false');
  $('#mobile-filter-toggle').textContent=state.category==='Todas'?'☷  Categorías':'☷  Filtros de '+state.category;
}
function applyFilters(){
  state.category=$('#nav-filter-category').value;
  state.audience=state.category==='Moda'?$('#nav-filter-audience').value:'all';
  state.subtype=state.category!=='Todas'?$('#nav-filter-module').value:'all';
  state.productId=null;
  state.band='all';
  state.term='';state.onlySaved=false;state.sort='featured';state.limit=20;
  state.view=state.category==='Todas'&&state.band==='all'?'home':'listing';
  $('#search-input').value='';showPage();
}
function reset(){
  state.category='Todas';state.audience='all';state.subtype='all';state.productId=null;state.band='all';state.term='';state.onlySaved=false;state.sort='featured';state.limit=20;state.view='home';
  $('#search-input').value='';showPage();
}
function toggleFavorite(id){
  saved.has(id)?saved.delete(id):saved.add(id);
  try{localStorage.setItem('velans-favorites',JSON.stringify([...saved]))}catch{}
  render();
}
function openProductPage(id){
  const p=products.find(item=>item.id===id);if(!p)return;
  state.category=p.category;state.audience='all';state.subtype='all';state.band='all';state.term='';state.sort='featured';state.onlySaved=false;state.productId=p.id;state.view='product';state.limit=20;
  $('#search-input').value='';showPage();
}
function details(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  $('#detail-image').style.cssText=imageStyle(p);
  $('#detail-image').innerHTML=photoMarkup(p);
  $('#detail-brand').textContent=displayBrand(p);
  $('#detail-title').textContent=p.name;
  $('#detail-price').textContent=priceText(p);
  $('#detail-info').textContent='Consulta las condiciones y el precio definitivo en Amazon.es.';
  $('#detail-modal').hidden=false;
  $('#modal-close').focus();
}
document.addEventListener('click',event=>{
  const cardBox=event.target.closest('[data-card-product]');
  if(cardBox&&!event.target.closest('button,a,input,select,label,textarea')){openProductPage(Number(cardBox.dataset.cardProduct));return}
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const cardBox=event.target.closest&&event.target.closest('.feature-product[data-card-product]');
  if(cardBox&&event.target===cardBox){event.preventDefault();openProductPage(Number(cardBox.dataset.cardProduct))}
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.id==='mobile-menu'){
    const opening=!$('#department-nav-inner').classList.contains('is-expanded');
    $('#department-nav-inner').classList.toggle('is-expanded',opening);
    button.setAttribute('aria-expanded',String(opening));
    button.setAttribute('aria-label',opening?'Ocultar categorías':'Mostrar todas las categorías');
    return;
  }
  if(button.id==='mobile-filter-toggle'||button.id==='mobile-discount-toggle'){$('#nav-filter-panel').hidden?openFilters(button.id==='mobile-discount-toggle'):closeFilters();return}
  if(button.id==='header-offers'){reset();return}
  if(button.id==='nav-filter-toggle'){$('#nav-filter-panel').hidden?openFilters():closeFilters();return}
  if(button.id==='nav-filter-close'||button.id==='nav-filter-dismiss'||button.id==='nav-filter-backdrop'){closeFilters();$('#nav-filter-toggle').focus();return}
  if(button.id==='nav-filter-reset'){populateContextualFilters(state.category,'all','all');return}
  if(button.id==='nav-filter-apply'){applyFilters();return}
  if(button.id==='category-back-home'){reset();return}
  if(button.id==='product-back-home'||button.id==='product-page-back'){reset();return}
  if(button.id==='hero-prev'){showHero(heroCurrent-1);return}
  if(button.id==='hero-next'){showHero(heroCurrent+1);return}
  if(button.dataset.heroIndex!==undefined){showHero(Number(button.dataset.heroIndex));return}
  if(button.dataset.category){updateCategory(button.dataset.category);return}
  if(button.dataset.band){updateBand(button.dataset.band);return}
  if(button.dataset.reset!==undefined){reset();return}
  if(button.dataset.productPage){openProductPage(Number(button.dataset.productPage));return}
  if(button.dataset.product){openProductPage(Number(button.dataset.product));return}
  if(button.dataset.save){toggleFavorite(Number(button.dataset.save));return}
  if(button.id==='saved-top'){state.onlySaved=!state.onlySaved;state.category='Todas';state.audience='all';state.subtype='all';state.productId=null;state.band='all';state.term='';state.sort='featured';state.limit=20;state.view=state.onlySaved?'listing':'home';$('#search-input').value='';showPage();return}
  if(button.id==='clear-active'){reset();return}
  if(button.id==='nav-new'){state.category='Todas';state.audience='all';state.subtype='all';state.productId=null;state.band='all';state.term='';state.onlySaved=false;state.sort='latest';state.limit=20;state.view='listing';$('#search-input').value='';showPage();return}
  if(button.id==='load-more'){state.limit+=20;render();return}
  if(button.id==='modal-close'||button.id==='detail-close'){$('#detail-modal').hidden=true;return}
});
document.addEventListener('click',event=>{
  if(!event.target.closest('#nav-filter-panel')&&!event.target.closest('#nav-filter-toggle')&&!event.target.closest('#mobile-filter-toggle')&&!event.target.closest('#mobile-discount-toggle'))closeFilters();
  if(!event.target.closest('#mobile-menu')&&!event.target.closest('#department-nav-inner'))closeMobileMenu();
});
$('#nav-filter-category').addEventListener('change',event=>populateContextualFilters(event.target.value,'all','all'));
$('#nav-filter-audience').addEventListener('change',event=>populateContextualFilters($('#nav-filter-category').value,event.target.value,'all'));
$('#nav-filter-module').addEventListener('change',event=>populateContextualFilters($('#nav-filter-category').value,$('#nav-filter-audience').value,event.target.value));
$('#hero-carousel').addEventListener('pointerdown',()=>{heroTouchPausedUntil=Date.now()+6000});
$('#search-form').addEventListener('submit',event=>{
  event.preventDefault();
  state.term=$('#search-input').value.trim();state.category='Todas';state.audience='all';state.subtype='all';state.productId=null;state.band='all';state.onlySaved=false;state.sort='featured';state.view=state.term?'listing':'home';state.limit=20;
  showPage();
});
$('#sort-select').addEventListener('change',event=>{state.sort=event.target.value;state.limit=20;render()});
$('#logo-home').addEventListener('click',event=>{event.preventDefault();reset()});
$('#detail-modal').addEventListener('click',event=>{if(event.target.id==='detail-modal')$('#detail-modal').hidden=true});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#detail-modal').hidden=true;if(!$('#nav-filter-panel').hidden){closeFilters();$('#nav-filter-toggle').focus()}closeMobileMenu()}});
window.addEventListener('popstate',()=>{readRoute();closeFilters();closeMobileMenu();render();window.scrollTo({top:0,behavior:'auto'})});
initCategoryNavigation();
readRoute();
initFilters();
prepareHero();
render();
