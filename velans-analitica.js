/* Velan's · estadísticas de visitas sin cookies (GoatCounter).
   No usa cookies ni guarda nada en el navegador, y no envía datos personales:
   solo la página vista, la web de procedencia y el ancho de pantalla.
   También cuenta los clics hacia Amazon y AliExpress para saber qué página vende.
   Los datos se ven en https://velans.goatcounter.com */
(function(){
  var CODIGO='velans';
  var BASE='https://'+CODIGO+'.goatcounter.com/count';
  if(location.hostname!=='velans.es'&&location.hostname!=='www.velans.es')return;   // no contar pruebas
  if(navigator.webdriver)return;                                                      // ni robots
  function enviar(q){
    var p=[];for(var k in q)if(q[k]!==undefined&&q[k]!=='')p.push(k+'='+encodeURIComponent(q[k]));
    p.push('rnd='+Math.random().toString(36).slice(2));
    var img=new Image();img.referrerPolicy='no-referrer';img.src=BASE+'?'+p.join('&');
  }
  var ruta=location.pathname==='/index.html'?'/':location.pathname;
  var origen='';try{var r=new URL(document.referrer);if(r.hostname!==location.hostname)origen=r.origin+r.pathname;}catch(e){}
  var utm=new URLSearchParams(location.search).get('utm_source');   // ?utm_source=pinterest en los enlaces de cada red
  if(utm)origen=utm;
  enviar({p:ruta,t:document.title,r:origen,s:screen.width});
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest?ev.target.closest('a[href]'):null;if(!a)return;
    var h;try{h=new URL(a.href).hostname;}catch(e){return;}
    var tienda=/(^|\.)amazon\.es$/.test(h)?'amazon':/(^|\.)aliexpress\.com$/.test(h)?'aliexpress':'';
    if(!tienda)return;
    enviar({p:'clic-'+tienda+ruta,t:'Clic a '+(tienda==='amazon'?'Amazon':'AliExpress')+' desde '+ruta,e:'true'});
  },true);
})();
