/* Local conversation for the published Velan’s catalogue. Loaded when the panel opens. */
(function (root) {
  'use strict';

  const fold = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const spelling = {kiero:'quiero',kieres:'quieres',qiero:'quiero',busko:'busco',kables:'cables',kable:'cable',aurikulares:'auriculares',caskos:'cascos',pa:'para',pal:'para el',tb:'tambien',tmb:'tambien',xq:'porque',xfa:'por favor',pls:'por favor',xmas:'navidad',navida:'navidad',camisetta:'camiseta',moxila:'mochila',presu:'presupuesto',inalanbricos:'inalambricos',bluethoot:'bluetooth',blutut:'bluetooth'};
  function words(value) {
    return fold(value).replace(/\b(levi)'s\b/g,'$1s').replace(/[¿?¡!;:]/g,' ').replace(/\b[a-z]+\b/g,w=>spelling[w]||w).replace(/\s+/g,' ').trim();
  }

  // A product kind describes what is being bought. The shopping occasion is separate.
  const kinds = [
    ['ornaments','adornos para el árbol',/\b(?:bolas|bolitas|adornos|colgantes|guirnaldas|espumillon|decoraciones)\b/,/\b(?:bolas?|adornos?|colgantes?|guirnaldas?|espumillon|decoraciones?)\b/],
    ['tree','árboles de Navidad',/\b(?:arbol(?:es)?|pino(?:s)?)\b.*(?:navidad|naviden)|(?:navidad|naviden).*?\barbol/,/\barbol(?:es)?\b.*(?:navidad|naviden)|(?:navidad|naviden).*?\barbol/],
    ['table','decoración de mesa',/(?:decorar|vestir|adornar|decoracion|centro).{0,24}\bmesa\b|\bmantel(?:es)?\b/,/\b(?:mantel(?:es)?|caminos? de mesa|centros? de mesa|servilleteros?|servilletas?)\b/],
    ['seat','bancos de jardín',/\bbanco(?:s)?\b/,/\bbancos?\b.*(?:jardin|asiento|madera|exterior)|\bbancos? de jardin\b/],
    ['reading','accesorios de lectura',/marcapaginas|sujetalibros|lampara de lectura|(?:alguien|persona) que lee|(?:gusta|aficionad[ao] a) (?:a )?leer/,/\b(?:marcapaginas|sujetalibros|lectura|atril para libros|lector de libros)\b/],
    ['shirt','camisetas',/\b(?:camisetas?|camisetitas?|camisettas?|t shirts?|tees?)\b/,/\b(?:camisetas?|t[ -]?shirts?|tee)\b/],
    ['top','prendas',/\b(?:ropa|prendas?|vestirme|que ponerme)\b|\bmanga (?:corta|larga)\b/,null,'Moda'],
    ['hoodie','sudaderas',/\b(?:sudaderas?|hoodies?)\b/,/\b(?:sudaderas?|hoodies?)\b/],
    ['coat','prendas de abrigo',/\b(?:abrigos?|anoraks?|chaquet(?:as?|ones?)|plumiferos?|parkas?|ropa de abrigo)\b/,/\b(?:abrigos?|anoraks?|chaquet(?:as?|ones?)|plumiferos?|parkas?|cazadoras?|plumon|polar)\b/],
    ['bag','mochilas',/\b(?:mochil(?:as?|itas?)|macutos?|backpacks?)\b/,/\b(?:mochil(?:as?|itas?)|macutos?|backpacks?)\b/],
    ['audio','auriculares',/\b(?:auriculares?|cascos?|audifonos?|headphones?|earbuds?|pinganillos?)\b/,/\b(?:auriculares?|cascos? de audio|audifonos?|headphones?|earbuds?|headsets?|headphone|jbuds)\b/],
    ['watch','relojes',/\b(?:reloj(?:es|ito[s]?)?|smartwatch(?:es)?)\b/,/\b(?:relojes?|reloj|smartwatch(?:es)?|watch)\b/],
    ['shoes','calzado',/\b(?:zapatillas?|deportivas?|bambas?|tenis|sneakers?)\b/,/\b(?:zapatillas?|sneakers?|calzado|deportivas?|bambas?)\b/],
    ['grinder','molinillos de café',/\b(?:molinillos?|molinillos? de cafe|molinos? de cafe)\b/,/\b(?:molinillos?|molinos? de cafe)\b/],
    ['coffee','artículos para café',/\b(?:cafeteras?|cafeter[oa]s?|cafe|cafes|espresso|capsulas?)\b/,/\b(?:cafeteras?|cafe|espresso|nespresso|molinillo|capsulas? de cafe)\b/],
    ['light','iluminación',/\b(?:lamparas?|luces|iluminacion|linternas?)\b/,/\b(?:lamparas?|luces|iluminacion|linternas?|bombillas?)\b/],
    ['drill','taladros y atornilladores',/\b(?:taladros?|atornilladores?|atornillador)\b/,/\b(?:taladros?|atornillador(?:es)?)\b/],
    ['airfryer','freidoras de aire',/\b(?:freidoras?|airfryers?|air fryers?)\b/,/\b(?:freidoras?|air[ -]?fryers?)\b/],
    ['stationery','papelería',/\b(?:papeleria|libretas?|cuadernos?|estuches?|material escolar)\b/,/\b(?:libretas?|cuadernos?|estuches?|notas|rotuladores?|boligrafos?)\b/]
  ];
  // Each feature has a positive assertion and, where available, contrary evidence.
  // A missing feature is unknown. It cannot certify an exclusion.
  const features = [
    ['long','manga larga',/\b(?:mangas? largas?|long sleeve)\b/,/\b(?:mangas? largas?|long[ -]sleeve)\b/,/\b(?:mangas? cortas?|sin mangas?|tirantes|short[ -]sleeve)\b/,'sleeve'],
    ['short','manga corta',/\b(?:mangas? cortas?|short sleeve)\b/,/\b(?:mangas? cortas?|short[ -]sleeve)\b/,/\b(?:mangas? largas?|sin mangas?|tirantes|long[ -]sleeve)\b/,'sleeve'],
    ['thermal','térmico',/\btermic[oa]s?\b/,/\btermic[oa]s?\b/,/\bno termic/],
    ['warm','de abrigo',/\b(?:de abrigo|abrigad[oa]s?|calentit[oa]s?)\b/,/\b(?:abrigo|abrigad[oa]|forrad[oa]|forro|polar|plumon|plumifero|acolchad[oa]|termic[oa]|invierno)\b/],
    ['lighted','luces',/\b(?:luces|iluminacion|lucecitas|luz|leds?)\b/,/\b(?:luces|iluminacion|iluminad[oa]|luz|leds?|luminos[oa])\b/,/\b(?:sin|no (?:tiene|lleva|incluye)) (?:luces|iluminacion|luz|leds?)\b/],
    ['wireless','sin cable',/\b(?:sin cables?|inalambric[oa]s?|wireless|bluetooth)\b/,/\b(?:inalambric[oa]s?|sin cables?|wireless|bluetooth)\b/,/\b(?:solo con cable|no inalambric[oa]s?)\b/,'connection'],
    ['wired','con cable',/\b(?:con cables?|de cables?|por cable|cablead[oa]s?|jack)\b/,/\b(?:con cables?|cablead[oa]s?|jack|por cable)\b/,/\b(?:solo inalambric[oa]|exclusivamente bluetooth|sin entrada de cable)\b/,'connection'],
    ['anc','cancelación activa de ruido',/\b(?:anc|cancelacion (?:activa )?(?:de )?ruido)\b/,/\b(?:anc|cancelacion activa (?:de |del )?ruido)\b/,/\bsin (?:anc|cancelacion activa)\b/],
    ['sport','uso deportivo',/\b(?:correr|entrenar|entreno|running|para (?:el )?gimnasio|deportiv[oa]s?)\b/,/\b(?:deportiv[oa]s?|deporte|running|correr|gimnasio|entrenamiento|fitness)\b/],
    ['fold','plegable',/\bplegables?\b/,/\b(?:plegables?|plegad[oa]|foldable)\b/,/\b(?:no plegable|sin plegado)\b/],
    ['water','impermeable',/\bimpermeables?\b/,/\b(?:impermeables?|waterproof)\b/,/\bno impermeables?\b/],
    ['cotton','algodón',/\balgodon\b/,/\b(?:algodon|cotton)\b/],
    ['linen','lino',/\blino\b/,/\b(?:lino|linen)\b/],
    ['wool','lana',/\blana\b/,/\b(?:lana|wool)\b/],
    ['polyester','poliéster',/\bpoliester\b/,/\b(?:poliester|polyester)\b/],
    ['leather','piel o cuero',/\b(?:cuero|de piel)\b/,/\b(?:de piel|cuero|leather)\b/,/\b(?:sintetic[oa]|polipiel|cuero vegano|imitacion)\b/],
    ['sleeveless','sin mangas',/\b(?:sin mangas?|de tirantes)\b/,/\b(?:sin mangas?|tirantes|sleeveless)\b/,/\bmanga (?:larga|corta)\b/,'sleeve'],
    ['formal','de vestir',/\b(?:formal(?:es)?|elegantes?|de vestir|para la cena)\b/,/\b(?:formal(?:es)?|elegantes?|de vestir|arreglad[oa]|de fiesta)\b/],
    ['loose','holgado',/\b(?:holgad[oa]s?|oversiz(?:e|ed))\b/,/\b(?:holgad[oa]s?|oversiz(?:e|ed)|loose fit)\b/,/\b(?:slim fit|cenid[oa]s?)\b/],
    ['mic','micrófono',/\b(?:microfonos?|con micro)\b/,/\b(?:microfonos?|microphone|con micro)\b/,/\bsin micro(?:fono)?\b/],
    ['gaming','para videojuegos',/\b(?:gaming|gamer|para jugar)\b/,/\b(?:gaming|gamer|para jugar|videojuegos?)\b/],
    ['recharge','recargable',/\brecargables?\b/,/\b(?:recargables?|rechargeable)\b/,/\bno recargables?\b/],
    ['pockets','bolsillos',/\bbolsillos?\b/,/\bbolsillos?\b/,/\bsin bolsillos?\b/],
    ['hood','capucha',/\bcapuchas?\b/,/\bcapuchas?\b/,/\bsin capucha\b/],
    ['artificial','artificial',/\bartificial(?:es)?\b/,/\bartificial(?:es)?\b/,/\bnatural(?:es)?\b/],
    ['laptop','compartimento para portátil',/\b(?:portatil|ordenador|laptop)\b/,/\b(?:para (?:el |un )?(?:portatil|ordenador|laptop)|compartimento.{0,20}(?:portatil|ordenador)|laptop backpack|portatil de)\b/]
  ];
  const byKind = new Map(kinds.map(x=>[x[0],x]));
  const byFeature = new Map(features.map(x=>[x[0],x]));
  const colourTerms = {
    negro:/\b(?:negr[oa]s?|black)\b/,blanco:/\b(?:blanc[oa]s?|white)\b/,azul:/\b(?:azul(?:es)?|blue|navy)\b/,
    rojo:/\b(?:roj[oa]s?|red)\b/,verde:/\b(?:verdes?|green)\b/,rosa:/\b(?:rosas?|pink)\b/,
    dorado:/\b(?:dorad[oa]s?|gold(?:en)?)\b/,plateado:/\b(?:platead[oa]s?|silver)\b/,gris:/\b(?:gris(?:es)?|grey|gray)\b/,
    beige:/\bbeige\b/,marrón:/\b(?:marron(?:es)?|brown)\b/,amarillo:/\b(?:amarill[oa]s?|yellow)\b/,morado:/\b(?:morad[oa]s?|purple|violeta)\b/
  };
  for(const [name,rx] of Object.entries(colourTerms)) byFeature.set('color:'+name,['color:'+name,name,rx,rx,null,'color']);
  const activeRetail = /\b(?:oferta|descuento|rebajas|precio|cuesta|vale en amazon|stock|disponibilidad|resenas?|valoraciones?|vendid[oa]s?|se agota|ranking de venta|cupon)\b/;
  const popularity = /\b(?:mas vendid\w*|mas (?:se )?compra\w*|compran mas|lo que mas compra\w*|ranking de ventas?|mas buscad\w*)\b/;
  const privateOrPolicy = /\b(?:ignora|jailbreak|hazte pasar|modo desarrollador|inventa|inventate|resena falsa|mi pedido|garantia|devolucio\w*|reembolso|privacidad|cookies|eres una persona|eres (?:un )?(?:bot|humano|robot)|afiliad[oa]s?)\b/;
  const purchase = /\b(?:como (?:se (?:hace |realiza )?(?:la )?)?(?:compr[ao]\w*|paga)|(?:como|donde) (?:lo |la |los |las )?(?:compro|pago)|donde (?:se )?(?:compra|paga)|quien (?:me )?(?:cobra|factura)|a quien (?:le )?pago|como hago (?:el|un) pedido)\b/;
  const delivery = /\b(?:llegar(?:an?)?|llegan?|llegue|lleguen|recibire|recibirlo|entreg[aan]\w*|envio|envian|mandan a casa|portes)\b/;
  const cold = /\b(?:frio|fria|nieve|nevara|heladas?|invierno|frioler[oa]|camara frigorifica)\b/;
  const hot = /\b(?:calor|caluroso|calurosa|tropical|verano|playa)\b/;
  const socialEnd = /^(?:(?:bueno|ok|vale|muchas gracias|gracias)[ ,]+)*(?:me voy|adios|hasta luego|chao|hasta pronto)[ ,.]*$/;
  const newSearch = /\b(?:busco|buscar|ensename|muestrame|enseñame|quiero (?:un|una|unos|unas|ver)|necesito|teneis|estoy buscando|me gustaria)\b/;
  function polarity(text,match) {
    let before=text.slice(0,match.index);
    const clauses=before.split(/[,.;]|\b(?:pero|aunque|sino|prefiero|quiero|mejor|con)\b/);
    const tail=clauses[clauses.length-1];
    if(/\bno (?:quiero|necesito|me gustan?)\s+(?:(?:nada|ningun[oa]?|de|las?|los?|un[oa]?|que|sea|sean|tenga|tengan)\s+)*$/.test(before))return -1;
    return /\b(?:sin|excepto|salvo|evit(?:ar|a)|descarta|odio|ni|nada de|no(?: sean?| tenga[n]?| lleve[n]?| de)?|menos)(?:\s+(?:nada|de|en|las?|los?|ningun[oa]?|un[oa]?|color|que|con|sea|sean|tenga|tengan|lleve|lleven|manga|cualquier)){0,4}\s*$/.test(tail)?-1:1;
  }
  function readFeatures(text,kind) {
    const result={};
    for(const f of byFeature.values()){
      if(f[0]==='laptop' && kind!=='bag')continue;
      if(f[0]==='sport' && kind==='shoes' && /^(?:deportivas?|unas deportivas)$/.test(text))continue;
      for(const m of text.matchAll(new RegExp(f[2].source,'g'))){
        result[f[0]]=polarity(text,m);
      }
    }
    return result;
  }
  function fitSize(text) {
    const m=/\btalla\s+(?:la |una )?(xxxs|xxs|xs|s|m|l|xl|xxl|xxxl|[2-5]xl|\d{2}(?:[.,]5)?)(?![a-z0-9])/.exec(text);
    return m?m[1]:null;
  }
  function setFeatures(criteria,changes,correcting) {
    for(const [key,value] of Object.entries(changes)){
      const group=byFeature.get(key)?.[5];
      if(group && value===1 && (correcting||group==='sleeve'||group==='connection'||group==='color')){
        for(const old of Object.keys(criteria.features)){
          if(old!==key && byFeature.get(old)?.[5]===group && !Object.hasOwn(changes,old)) delete criteria.features[old];
        }
      }
      criteria.features[key]=value;
    }
  }
  const positiveNumbers = {cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiuno:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100,ciento:100,doscientos:200,quinientos:500,mil:1000};
  function numericText(s){
    return s.replace(/\b(?:treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa) y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g,t=>{
      const [a,b]=t.split(' y ');return String(positiveNumbers[a]+positiveNumbers[b]);
    }).replace(/\b[a-z]+\b/g,w=>Object.hasOwn(positiveNumbers,w)?String(positiveNumbers[w]):w);
  }
  function readBudget(text,old){
    if(/\b(?:sin (?:limite de )?presupuesto|quita (?:el )?(?:limite|tope)|olvida el presupuesto|el precio me da igual)\b/.test(text))return {min:null,max:null,cheap:false};
    const t=numericText(text), amount='(\\d{1,6}(?:[.,]\\d{1,2})?)';
    const pair=t.match(new RegExp('\\bentre '+amount+'(?:\\s*(?:€|euros?))? (?:y|a) '+amount+'(?:\\s*(?:€|euros?)|\\b)'));
    const n=s=>Number(s.replace(',','.'));
    if(pair && (/(?:euros?|€|presupuesto|gastar|precio|tope)/.test(text)||old?.max!=null&&!/pulgadas?|centimetros?|litros?|vatios?|tallas?|horas?|minutos?|años|anos|\b(?:cm|mm|kg|db|gb|ml)\b/.test(text)))return {min:Math.min(n(pair[1]),n(pair[2])),max:Math.max(n(pair[1]),n(pair[2])),cheap:false};
    const delta=t.match(new RegExp('(?:sub(?:e|elo|o)|baj(?:a|alo|o)|aument(?:a|alo)|recort(?:a|alo)) (?:el (?:tope|limite|presupuesto) )?(?:en )?'+amount+'\\s*(?:€|euros?)?\\s*(?:mas|menos)?\\s*$'));
    if(delta && old?.max!=null && !/\ba \d/.test(t))return {min:null,max:Math.max(0,old.max+(/baj|recort/.test(t)?-1:1)*n(delta[1])),cheap:false};
    const max=t.match(new RegExp('(?:tope|presupuesto|limite|maximo|hasta|menos de|no (?:mas de|pas[ea] de)|no supere|sub(?:e|elo|o)(?: el (?:tope|limite|presupuesto))? a|baj(?:a|alo|o)(?: el (?:tope|limite|presupuesto))? a|puedo gastar)\\s*(?:es |de |a |son |unos |unas )*'+amount+'(?![\\d,.])(?!\\s*(?:pulgadas|anos|horas|cm|litros|kg|w)\\b)'));
    const currency=t.match(new RegExp(amount+'\\s*(?:€|euros?\\b|pavos?\\b)'));
    if(max||currency)return {min:null,max:n((max||currency)[1]),cheap:false};
    return null;
  }


  // Editorial prompts only. A calendar event never supplies a product, stock or a price.
  const events = [
    ['christmas','Navidad',/\b(?:navidad(?:es)?|naviden[oa]s?|nochebuena|papa noel)\b/],
    ['kings','Reyes',/\b(?:reyes(?: magos)?|cabalgata)\b/],
    ['invisible','el amigo invisible',/\b(?:amig[oa] invisible|amig[oa] secret[oa]|secret santa)\b/],
    ['year','fin de año',/\b(?:nochevieja|fin de ano|ano nuevo|cotillon)\b/],
    ['school','la vuelta al cole',/\b(?:(?:vuelta|regreso) (?:al cole(?:gio)?|a (?:clases?|la escuela))|curso escolar|comienzo del curso)\b/],
    ['jordi','Sant Jordi',/\b(?:sant jordi|san jorge|diada del llibre)\b/],
    ['easter','Semana Santa',/\b(?:semana santa|pascua)\b/],
    ['valentine','San Valentín',/\b(?:san valentin|14 de febrero)\b/],
    ['mother','el Día de la Madre',/\bdia de la madre\b/],['father','el Día del Padre',/\bdia del padre\b/],
    ['halloween','Halloween',/\b(?:halloween|noche de brujas)\b/],
    ['black','Black Friday',/\b(?:black friday|viernes negro|cyber monday)\b/],
    ['birthday','el cumpleaños',/\b(?:cumple(?:anos)?|fiesta de cumple)\b/],
    ['anniversary','el aniversario',/\baniversario\b/],['wedding','la boda',/\b(?:boda|enlace matrimonial)\b/],
    ['birth','el nacimiento',/\b(?:nacimiento|recien nacid[oa]|baby shower)\b/],
    ['summer','el verano',/\b(?:vacaciones de verano|verano|vacaciones de agosto)\b/]
  ];
  const eventById=Object.fromEntries(events.map(e=>[e[0],e[1]]));
  const themes={
    christmas:['Adornos para el árbol','Ropa para la cena','Un regalo de Navidad'],
    kings:['Un regalo de Reyes','Ideas para alguien que viaja','¿Dónde miro la entrega?'],
    invisible:['Ideas de papelería','Algo para alguien que toma café','Cambiar el presupuesto'],
    school:['Mochilas para portátil','Ver papelería','Comparar dos mochilas'],
    jordi:['Accesorios de lectura','Un detalle que no sea un libro'],
    summer:['Camisetas de manga corta','Mochilas para viajar','Gafas de sol'],
    cold:['Ropa de abrigo','Camisetas de manga larga','Sudaderas'],
    party:['Decorar la mesa','Ropa para la cena','Un regalo'],
    open:['Quiero un regalo','Ver tecnología','Algo para mi casa']
  };
  let madrid;
  function dayParts(date) {
    madrid ||= new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'});
    const [day,month,year]=madrid.format(date).split('/').map(Number);
    return {year,month,day};
  }
  function easter(year){
    const a=year%19,b=Math.floor(year/100),c=year%100;
    const h=(19*a+b-Math.floor(b/4)-Math.floor((b-Math.floor((b+8)/25)+1)/3)+15)%30;
    const l=(32+2*(b%4)+2*Math.floor(c/4)-h-(c%4))%7,m=Math.floor((a+11*h+22*l)/451);
    const n=h+l-7*m+114;return Date.UTC(year,Math.floor(n/31)-1,n%31+1);
  }
  function season(date,localeHint=''){
    const {year,month,day}=dayParts(date),md=month*100+day,now=Date.UTC(year,month-1,day);
    if(md<=106||md>=1226)return {id:'kings',label:'Reyes',quick:themes.kings};
    const thanksgiving=22+(4-new Date(Date.UTC(year,10,22)).getUTCDay()+7)%7;
    if(month===11 && day>=thanksgiving-3&&day<=thanksgiving+1)return {id:'black',label:'Black Friday',quick:['Ideas de Navidad','Comparar productos','¿Dónde veo el precio?']};
    if(md>=1115&&md<=1225)return {id:'christmas',label:'Navidad',quick:themes.christmas};
    if(md>=201&&md<=214)return {id:'valentine',label:'San Valentín',quick:['Un regalo para alguien','Algo para la cena','Ver relojes']};
    if(md>=310&&md<=319)return {id:'father',label:'el Día del Padre',quick:['Un regalo para mi padre','Ideas de tecnología','Algo de café']};
    if(md>=415&&md<=423&&/catalu|catalan|barcelona|tarragona|girona|lleida|sant jordi/.test(localeHint))return {id:'jordi',label:'Sant Jordi',quick:themes.jordi};
    const mothersDay=1+(7-new Date(Date.UTC(year,4,1)).getUTCDay())%7;
    if(now>=Date.UTC(year,4,mothersDay-8)&&now<=Date.UTC(year,4,mothersDay))return {id:'mother',label:'el Día de la Madre',quick:['Un regalo para mi madre','Algo para casa','Ideas para viajar']};
    const daysToEaster=(easter(year)-now)/86400000;
    if(daysToEaster>=0&&daysToEaster<=12)return {id:'easter',label:'Semana Santa',quick:['Una mochila para viajar','Ropa de abrigo','Calzado para caminar']};
    if(md>=815&&md<=915)return {id:'school',label:'la vuelta al cole',quick:themes.school};
    if(month>=6&&month<=8)return {id:'summer',label:'el verano',quick:themes.summer};
    if(md>=1018&&md<=1031)return {id:'halloween',label:'Halloween',quick:['Decorar la mesa','Algo para una fiesta','Ver manualidades']};
    if(month<=2||month===11)return {id:'cold',label:'la temporada de frío en España',quick:themes.cold};
    return {id:'open',label:null,quick:themes.open};
  }

  // General guidance is editorial; an entry is never evidence about a specific model.
  const guides = [
    [/\bbluetooth\b/,/\b(?:anc|cancelacion|ruido)\b/,'Bluetooth sirve para conectar dispositivos sin cable. La cancelación activa de ruido usa micrófonos y procesamiento para reducir parte del sonido exterior. Unos auriculares pueden tener Bluetooth y carecer de cancelación activa.'],
    [/\b(?:anc|cancelacion de ruido|aislamiento acustico)\b/,null,'La cancelación activa trata de reducir parte del ruido ambiente. El aislamiento pasivo depende del ajuste y de los materiales. Para confirmar la función de un modelo concreto, su ficha debe indicarla.'],
    [/\b(?:voltios?|voltaje|tension)\b/,/\b(?:vatios?|watts?|potencia)\b/,'Los voltios indican tensión eléctrica y los vatios indican potencia. No se pueden ordenar dos herramientas por potencia comparando sus voltios con los vatios de otra.'],
    [/\b(?:mah|miliamperios|autonomia)\b/,null,'Los mAh expresan capacidad de carga. Las horas de uso también dependen del consumo y de las condiciones. Una cifra de mAh por sí sola no permite prometer una duración.'],
    [/\b(?:usb[ -]?c|tipo c)\b/,null,'USB-C describe la forma del conector. Carga rápida, salida de vídeo y velocidad de datos dependen de los dispositivos y del cable. Hay que comprobar qué funciones declara cada uno.'],
    [/\b(?:decibelios|ruido|silencioso)\b/,/\b(?:potencia|vatios|motor|molinillo|w)\b/,'Los vatios indican potencia. Para comparar ruido hace falta una medición, normalmente en decibelios y en condiciones comparables. Los vatios por sí solos no lo dicen.'],
    [/\b(?:litros?|capacidad)\b/,/\b(?:portatil|pulgadas|mochila)\b/,'Los litros describen el volumen de la mochila. Para saber si cabe un portátil importan el ancho, alto y grosor del equipo y las medidas interiores del compartimento.'],
    [/\b(?:manga larga|capas|termica|polar)\b/,/\b(?:frio|abriga|abrigar|termica|capas)\b/,'La manga larga describe el corte. Para abrigarse también importan el tejido, el grosor y las capas. Solo llamaría térmica a una prenda si su ficha lo especifica.'],
    [/\b(?:impermeable|repelente|resistente al agua)\b/,null,'Un acabado repelente puede ayudar con salpicaduras. La impermeabilidad exige una prestación concreta. Para una lluvia prolongada miraría el nivel de protección que declara el fabricante.'],
    [/\b(?:maleta|equipaje|mochila)\b/,/\b(?:cabina|avion|compania aerea)\b/,'Para llevar equipaje en cabina importan las medidas exteriores, incluidas asas y ruedas. Compáralas con las condiciones de tu aerolínea y tu tarifa para ese viaje.'],
    [/\b(?:que talla|elegir (?:la )?talla|medirme|tallaje)\b/,null,'Consulta la tabla de esa marca y esa prenda. Para comparar dos camisetas puedes medir una que ya te quede bien, en plano, de axila a axila y desde el hombro hasta el bajo.'],
    [/\b(?:algodon|poliester|tejidos?)\b/,/\b(?:diferencia|mejor|elegir|compara|disting)\w*\b/,'El algodón absorbe humedad y el poliéster suele secarse antes. El grosor, el tejido y las mezclas influyen en el resultado. Para un artículo, comprueba su composición publicada.'],
    [/\b(?:cafe|cafetera|capsulas?|molinillo)\b/,/\b(?:molido|grano|capsulas?)\b/,'Con cápsulas conviene comprobar el sistema compatible. Para preparar café en grano necesitas un molino o una cafetera que lo incorpore. Una cafetera para café molido no necesariamente muele grano.'],
    [/\b(?:induccion|vitroceramica)\b/,null,'Para una placa de inducción la base del recipiente debe ser compatible y tener el diámetro adecuado. Comprueba ambas cosas en las fichas de la placa y del recipiente.'],
    [/\b(?:freidora|airfryer)\b/,/\b(?:litros?|capacidad|raciones?|personas?)\b/,'Los litros orientan sobre el volumen. La superficie de la cesta y el alimento también influyen en cuántas raciones caben en una tanda.'],
    [/\b(?:atornillador|taladro|bateria)\b/,/\b(?:compatib|misma bateria|intercambi)\w*/,'En herramientas a batería deben coincidir la plataforma del fabricante, el encaje y el voltaje admitido. Compartir una cifra de voltios no demuestra compatibilidad.'],
    [/\b(?:lumenes?|iluminacion|bombilla)\b/,/\b(?:vatios|brillo|luz|potencia|lumenes)\b/,'Los lúmenes indican flujo luminoso y los vatios, consumo eléctrico. Para elegir una lámpara también importan la temperatura de color y dónde irá colocada.'],
    [/\b(?:perfume|colonia|toilette|parfum)\b/,null,'Eau de toilette y eau de parfum son denominaciones de perfumería. La concentración y la duración concretas varían entre fórmulas. En la ficha buscaría el tipo indicado y los mililitros.'],
    [/\b(?:mascota|perro|gato|arnes)\b/,/\b(?:talla|medida|elegir)\w*\b/,'Para un accesorio de mascota, compara las medidas del animal con la tabla del modelo. La talla por sí sola puede cambiar entre marcas.'],
    [/\b(?:herramientas?|bricolaje)\b/,/\b(?:elegir|regalar|empezar)\b/,'Primero concreta la tarea y el material. Para una herramienta a batería, saber si ya utiliza una plataforma ayuda a elegir algo compatible.'],
    [/\b(?:colegio|cole|escolar)\b/,/\b(?:preparar|que mirar|como elegir|necesito para)\b/,'Empezaría por la lista del centro. Para la mochila, revisaría medidas, contenido que debe caber y ajustes. Después podemos mirar mochilas o papelería que aparezcan en la selección.'],
    [/\b(?:cuaderno|libreta|folio)\b/,/\ba[45]\b/,'A4 mide 21 × 29,7 cm y A5 mide 14,8 × 21 cm. A5 ocupa menos espacio para notas. Para archivar hojas A4 enteras conviene ese formato o superior.'],
    [/\b(?:in ear|intraurales|diadema|over ear)\b/,null,'Los auriculares de diadema se apoyan sobre las orejas o las cubren. Los intraurales se colocan dentro del oído y ocupan menos espacio al guardarlos. ¿Los usarás sobre todo fuera o en casa?'],
    [/\b(?:teclado|raton)\b/,/\b(?:cable|inalambrico|bluetooth)\b/,'Para un teclado o ratón inalámbrico revisaría si usa Bluetooth o un receptor propio, qué puertos necesita y cómo se alimenta. Si eliges uno con cable, comprueba el conector y la longitud.'],
    [/\b(?:pantalla|televisor|television|monitor)\b/,/\b(?:pulgadas|diagonal|tamano)\b/,'Las pulgadas expresan la diagonal de la pantalla. Para saber si cabe un televisor o un monitor, compara las medidas exteriores y la profundidad del soporte con el espacio disponible.'],
    [/\b(?:ssd|disco duro|almacenamiento|memoria ram)\b/,null,'El almacenamiento guarda archivos y programas. La memoria RAM se usa mientras se ejecutan. Para ampliar un equipo interesa distinguir ambas cosas y comprobar qué admite ese modelo.'],
    [/\b(?:reloj|correa)\b/,/\b(?:muneca|tamano|medir|ajustar)\b/,'Mide el contorno de la muñeca y compáralo con el rango de la correa. Si vas a cambiarla, comprueba también el ancho de unión y el tipo de anclaje del reloj.'],
    [/\b(?:bolso|mochila|bandolera)\b/,/\b(?:diferencia|elegir|viajar|caminar)\b/,'Una mochila reparte la carga entre dos tirantes. Una bandolera suele facilitar el acceso sin quitártela. Para elegir, piensa qué vas a llevar y mide el objeto más grande.'],
    [/\b(?:tupper|taper|recipiente|fiambrera)\b/,/\b(?:microondas|congelar|hermetic|elegir)\w*\b/,'Capacidad, tipo de cierre y usos admitidos son tres datos distintos. Antes de usar una fiambrera en el microondas o el congelador, comprueba que ese uso figure en las instrucciones del modelo.'],
    [/\b(?:robot aspirador|aspiradora|aspirador)\b/,/\b(?:filtro|alfombra|pelo|deposito|elegir)\b/,'Para comparar aspiradores miraría el tipo de suelo, el cepillo, el depósito y cómo se limpia el filtro. Para pelo de mascota conviene que la ficha describa el accesorio o el uso concreto.'],
    [/\b(?:sarten|cacerola|olla)\b/,/\b(?:tamano|diametro|tapa|elegir)\b/,'En una sartén o una olla conviene distinguir el diámetro de la boca, el diámetro de la base y la capacidad. Para reutilizar una tapa importa que encaje en la boca.'],
    [/\b(?:bricolaje|taladro|atornillador)\b/,/\b(?:broca|atornillar|percutor|diferencia)\b/,'Un atornillador se orienta a tornillos. Para perforar, comprueba qué materiales y diámetros admite el taladro, qué brocas necesitas y si se incluyen.'],
    [/\b(?:coche|auto|automovil)\b/,/\b(?:soporte|accesorio|compatibilidad|elegir)\b/,'Para un accesorio de coche revisa el sistema de sujeción, el espacio disponible y las medidas. Si necesita alimentación o conexión al vehículo, comprueba también el conector compatible.'],
    [/\b(?:alfombrilla|raton)\b/,/\b(?:oficina|tamano|jugar|elegir)\b/,'Mide la superficie libre de la mesa y cuánto espacio dejas al teclado. Para una alfombrilla grande importan el ancho y el fondo reales.'],
    [/\b(?:plantas|maceta|jardinera)\b/,/\b(?:elegir|diametro|interior|exterior)\b/,'Para elegir una maceta compararía diámetro, profundidad y drenaje. Si estará en el exterior, busca que el material y ese uso estén indicados en la ficha.'],
    [/\b(?:juego de mesa|puzle|puzzle)\b/,null,'Para un juego de mesa miraría el número de participantes, la edad indicada y el tiempo de partida. Para un puzle, también el número de piezas y el tamaño una vez montado.'],
    [/\b(?:toalla|sabana|ropa de cama)\b/,/\b(?:elegir|gramaje|medidas|tamano)\b/,'En textil de hogar, comprueba primero las medidas. El gramaje expresa cuánta masa de tejido hay por unidad de superficie. La composición y el acabado también influyen en el tacto.'],
    [/\b(?:regalo|regalar|amigo invisible)\b/,/\b(?:elegir|acertar|sin conocer|original)\b/,'Empieza por algo que esa persona haga a menudo. Para alguien que toma café, por ejemplo, tiene sentido saber antes si usa cápsulas o café molido. Si apenas la conoces, podemos mirar ideas que no dependan de una talla.'],
    [/\b(?:juguete|bebe|infantil)\b/,/\b(?:edad|seguro|elegir)\b/,'Busca la edad indicada y las advertencias del fabricante para ese modelo. El nombre de una categoría infantil por sí solo no confirma que sea adecuado para una edad concreta.']
  ];
  function guideFor(text){
    const asking=/\b(?:que (?:es|son|diferencia|significa|distingue|indica|mido|mide|miro|mirar)|por que|para que|como (?:se |puedo )?(?:elijo|elegir|saber|distingo|funciona|mido|medir|preparo)|explicame|diferencias?|distinguir|sirven para|me dice si|en que (?:se diferencia|me fijo)|consejo|guia)\b/.test(text);
    if(!asking)return null;
    const hit=guides.find(([a,b])=>a.test(text)&&(!b||b.test(text)));
    return hit?.[2]||null;
  }


  const metrics = [
    ['storage','almacenamiento','GB',/\b(?:almacenamiento|gigabytes?|terabytes?|gb|tb)\b/,/(?:gb|tb|gigabytes?|terabytes?)/],
    ['power','potencia','W',/\b(?:vatios?|watts?|potencia|potente[s]?)\b/,/(?:w|kw|vatios?|watts?)/],
    ['voltage','tensión','V',/\b(?:voltios?|voltaje|tension)\b/,/(?:v|voltios?)/],
    ['capacity','capacidad','L',/\b(?:litros?|capacidad|volumen)\b/,/(?:l|ml|litros?)/],
    ['screen','diagonal','pulgadas',/\b(?:pulgadas?|diagonal)\b/,/(?:pulgadas?|inches|["”])/],
    ['charge','capacidad de batería','mAh',/\b(?:mah|miliamperios)\b/,/mah/],
    ['runtime','autonomía','h',/\b(?:autonomia|cuanto dura (?:la )?bateria|horas de uso|horas de bateria)\b/,/(?:h|horas?)/],
    ['noise','nivel de ruido','dB',/\b(?:decibelios|ruido|silencios[oa])\b/,/(?:db(?:a)?|decibelios?)/],
    ['mass','peso','g',/\b(?:peso|cuanto pesa|gramos?|kilogramos?)\b/,/(?:kg|g|gramos?)/],
    ['pressure','presión','bar',/\b(?:bares|presion)\b/,/(?:bar|bares)/],
    ['lumens','flujo luminoso','lm',/\b(?:lumenes?|luminosidad)\b/,/(?:lm|lumenes?)/]
  ];
  const numberUnits = metrics.map(m => [m[0], new RegExp(String.raw`(?:^|[\s(,;:])(\d+(?:[.,]\d+)?)\s*(${m[4].source})(?![a-z0-9])`, 'gi')]);
  function metricValues(text) {
    const result={};
    for(const [key,rx] of numberUnits){
      const matches=[...text.matchAll(rx)].filter(m=>{
        if(key==='storage'){
          const nearby=text.slice(Math.max(0,m.index-13),m.index+m[0].length+12);
          return !/ram|memoria grafica/.test(nearby)&&/almacenamiento|ssd|disco duro|microsd|pendrive|tarjeta de memoria|rom/.test(text);
        }
        if(key!=='runtime')return true;
        const before=text.slice(Math.max(0,m.index-38),m.index);
        const after=text.slice(m.index+m[0].length,m.index+m[0].length+30);
        return !/carg[ae]|recarg[ae]/.test(before.slice(-18)+' '+after.slice(0,14))&&
          (/autonomia|reproduccion|duracion|bateria.{0,10}(?:de|hasta)/.test(before)||/^\s*(?:de (?:uso|autonomia|reproduccion|bateria)|en funcionamiento)/.test(after));
      });
      const values=matches.map(m=>{
        let v=Number(m[1].replace(',','.'));const unit=m[2].toLowerCase();
        if(unit==='kg'||unit==='kw')v*=1000;
        if(unit==='ml')v/=1000;
        if(unit==='tb'||unit.startsWith('terabyte'))v*=1000;
        return v;
      });
      if(values.length&&values.every(v=>v===values[0]))result[key]=values[0];
    }
    return result;
  }
  const commercialCopy='El pago se realiza en Amazon. Abre la ficha de Velan’s y pulsa «Ver en Amazon» para consultar las condiciones y completar allí la compra.';
  const priceCopy='En Amazon puedes comprobar si el precio encaja en ese importe.';
  const deliveryCopy='La fecha de entrega depende de la oferta y del destino. Abre la ficha en Amazon para ver la estimación antes de comprar.';
  const brandWords=['casio','timex','xiaomi','samsung','bosch','philips','adidas','puma','tommy jeans','tommy hilfiger','lee','levis','levi s','eastpak','gant','calvin klein','joma','nike','anker','jlab','sony','nespresso','cecotec','tapo','crocs','cosori','amazon essentials','carhartt','logitech','invicta','lenovo','asus','apple','lego','braun','tefal','rowenta','bissell','dyson','einhell','makita','milwaukee','stanley','black decker','columbia','vans','fossil','bering'];
  function brandHits(text) {
    const result={};
    for(const brand of brandWords){
      if(brand==='lee'&&!/\b(?:marca|de|vaqueros|jeans|polo)\s+lee\b|^lee$/.test(text))continue;
      const hit=new RegExp('\\b'+brand+'\\b').exec(text);
      if(hit)result[brand]=polarity(text,hit);
    }
    const named=/\b(?:de (?:la )?marca|marca) ([a-z0-9][a-z0-9-]{1,30})\b/g;
    for(const m of text.matchAll(named)){
      if(!brandWords.some(b=>b===m[1]||b.startsWith(m[1]+' ')))result[m[1]]=polarity(text,m);
    }
    return result;
  }
  function trait(row,f) {
    if(f[0].startsWith('color:')){
      if(f[3].test(row.title))return true;
      if(f[3].test(row.evidence))return true;
      return row.colours.length ? false:null;
    }
    if(f[4]?.test(row.evidence))return false;
    const m=f[3].exec(row.evidence);
    if(m)return polarity(row.evidence,m)===1;
    return null;
  }
  function featureDescription(key,val) {
    const f=byFeature.get(key);
    if(!f)return '';
    if(val===1)return f[1];
    if(key==='lighted')return 'sin luces';
    return 'excluyendo '+f[1];
  }
  function childProduct(row){return row.p.family==='Infantil'||/\b(?:ninos?|ninas?|junior|infantil|kids|bebes?|boys|girls)\b/.test(row.title)}
  function explicitAudience(text){
    const kin=/\b(?:para|de) mi (madre|padre|marido|mujer|novia|novio|hermano|hermana|pareja)\b/.exec(text);
    if(kin&&kin[1]!=='pareja')return /^(?:madre|mujer|novia|hermana)$/.test(kin[1])?'Mujer':'Hombre';
    if(/\b(?:para|de) (?:un[oa]? |mi )?(?:nin[oa]|bebe)|\binfantil(?:es)?\b/.test(text))return 'Infantil';
    if(/\b(?:para|de) (?:una? )?(?:mujer|chica|senora)|\bfemenin[oa]s?\b/.test(text))return 'Mujer';
    if(/\b(?:para|de) (?:un )?(?:hombre|chico|caballero)|\bmasculin[oa]s?\b/.test(text))return 'Hombre';
    return null;
  }
  function kindFrom(text,engine){
    for(const [id,,rx] of kinds){
      if(id==='top')continue;
      if(id==='light'&&/\b(?:sin luces|sin iluminacion|nada de luces)\b/.test(text))continue;
      if(id==='ornaments'&&/bolas? (?:de|para) (?:padel|golf|tenis|perros?|gatos?)/.test(text))continue;
      const m=rx.exec(text);if(m&&polarity(text,m)===1)return id;
    }
    const top=byKind.get('top')[2].exec(text);if(top&&polarity(text,top)===1)return 'top';
    const other=engine.rTarget(text);
    if(other)return 'base:'+other.key;
    return null;
  }
  function typeMatch(row,id,engine){
    if(!id)return true;
    if(id.startsWith('base:'))return engine.matchesKind(row.p,id.slice(5));
    if(id==='ornaments')return byKind.get(id)[3].test(row.title)&&/navid|nochebuena|espumillon|guirnalda|adorno.{0,20}arbol|bolas? (?:para |del? )(?:el )?arbol/.test(row.evidence);
    if(id==='top')return row.p.family==='Moda'&&/\b(?:ropa|camiset\w*|camis[ao]s?|polo|sudader\w*|jersey|pantal\w*|vestid[oa]s?|abrigo|chaqueta|prenda|legg\w*|pijama|blusa|falda)\b/.test(row.title+' '+fold(row.p.module));
    const def=byKind.get(id);return !!def&&def[3].test(row.title);
  }
  function kindLabel(id,engine){
    if(!id)return 'artículos';
    return byKind.get(id)?.[1]||engine.kindLabel(String(id).replace(/^base:/,''))||'artículos';
  }
  function freshSearch(kind){return {kind,features:{},brands:{},audience:null,size:null,laptopInches:null,climate:null,occasion:null,rejected:[],anyColors:false}}
  function describe(c,engine){
    const attrs=Object.entries(c.features).map(([k,v])=>featureDescription(k,v));
    for(const [brand,v] of Object.entries(c.brands))attrs.push(v>0?'de '+brand:'sin la marca '+brand);
    if(c.size)attrs.push('talla '+c.size.toUpperCase());
    if(c.laptopInches)attrs.push('para portátil de '+c.laptopInches+' pulgadas');
    if(c.audience)attrs.push('para público '+c.audience.toLowerCase());
    return [kindLabel(c.kind,engine),...attrs].filter(Boolean).join(' · ');
  }
  function modelTokens(text) {
    return (text.match(/\b[a-z0-9]+(?:-[a-z0-9]+)*\b/g)||[]).filter(t=>t.length>=3&&/[a-z]/.test(t)&&/\d/.test(t)&&!/^\d+(?:w|v|ml|mah|gb|tb|g|kg|hz|lm|cm|mm|l|k)$/.test(t)).map(t=>t.replaceAll('-',''));
  }
  function prepRows(items){
    return items.map(p=>{
      const title=fold(p.title).replace(/['’]/g,''),evidence=title+' . '+fold(p.summary);
      const colours=Object.entries(colourTerms).filter(([,rx])=>rx.test(title)).map(([k])=>k);
      return {p,title,evidence,colours,values:null};
    });
  }
  function matchesCriteria(row,c,engine){
    if(!typeMatch(row,c.kind,engine)||c.rejected.includes(row.p.id))return false;
    if(c.audience==='Infantil'&&!childProduct(row))return false;
    if(c.audience&&c.audience!=='Infantil'&&(childProduct(row)||(['Hombre','Mujer'].includes(row.p.audience)&&row.p.audience!==c.audience)))return false;
    for(const [brand,sign] of Object.entries(c.brands)){
      const present=new RegExp('\\b'+brand+'\\b').test(row.title);
      if(present!==(sign>0))return false;
    }
    const colors=[];
    for(const [key,v] of Object.entries(c.features)){
      const f=byFeature.get(key);
      if(!f)continue;
      if(c.anyColors&&v===1&&key.startsWith('color:')){colors.push(f);continue;}
      if(trait(row,f)!==(v===1))return false;
    }
    if(colors.length&&!colors.some(f=>trait(row,f)===true))return false;
    if(c.size&&!new RegExp('\\b(?:tallas?|size) '+c.size.replace(/[.,]/g,'[.,]')+'(?![a-z0-9])').test(row.evidence))return false;
    if(c.laptopInches){
      // Volume or an unrelated diagonal cannot establish padded-compartment fit.
      const match=row.evidence.match(/(?:portatil(?:es)?|laptops?|ordenador(?:es)?)\s*(?:(?:de|hasta|hasta un|hasta de|de hasta) )?(\d+(?:[.,]\d+)?)\s*(?:pulgadas?|["”])/);
      if(!match||Number(match[1].replace(',','.'))!==c.laptopInches)return false;
    }
    return true;
  }
  function score(row,c){
    let points=row.p.summary?2:0;
    if(c.audience&&row.p.audience===c.audience)points+=4;
    if(!c.audience&&childProduct(row))points-=4;
    if(c.climate==='cold'&&/\b(?:invierno|polar|forro|abrigo|termic[oa]|manga larga)\b/.test(row.evidence))points+=3;
    if(c.climate==='hot'&&/\b(?:verano|manga corta|tirantes|transpirable)\b/.test(row.evidence))points+=3;
    if(c.occasion&&c.kind==='ornaments'&&/navid/.test(row.title))points+=3;
    return points;
  }
  function ranked(rows,c,engine){
    return rows.filter(row=>matchesCriteria(row,c,engine)).map(row=>({row,s:score(row,c)}))
      .sort((a,b)=>b.s-a.s || a.row.p.siteId-b.row.p.siteId).map(x=>x.row);
  }
  function internalCard(engine,p,reason){
    const card=engine.makePublicCard(p,reason);
    // The chat opens the same public product page as the storefront.
    delete card.affiliateUrl;
    return card;
  }
  const ordinals=[/\b(?:primer[oa]?|1[ºª]|el uno|la uno)\b/,/\b(?:segund[oa]|2[ºª]|el dos|la dos)\b/,/\b(?:tercer[oa]?|3[ºª]|el tres|la tres)\b/];
  function referenced(text,state,engine){
    const list=(state.lastRecs||[]).map(id=>engine.byId(id)).filter(Boolean);
    const refs=[];
    for(let i=0;i<ordinals.length;i++){const m=ordinals[i].exec(text);if(m&&list[i])refs.push({p:list[i],at:m.index})}
    return refs.sort((a,b)=>a.at-b.at).map(x=>x.p);
  }
  function budgetNote(b) {
    if(b?.max==null)return '';
    const amount=b.min!=null?`entre ${b.min} y ${b.max} €`:`hasta ${b.max} €`;
    return ` Tomo ${amount} como presupuesto. ${priceCopy}`;
  }


  function createDialogue(base,{now=()=>new Date()}={}) {
    let source=null,rows=[],byId=new Map(),models=new Map();
    function index(){
      const current=base.realCatalog();
      if(current===source)return;
      source=current;rows=prepRows(current);byId=new Map(rows.map(r=>[r.p.id,r]));
      models=new Map();
      for(const row of rows){
        for(const token of new Set(modelTokens(row.title))){
          if(models.has(token))models.set(token,null);
          else models.set(token,row.p);
        }
      }
    }
    const quickCache=new Map();
    let quickSource=null;
    function publishedQuick(choices){
      index();
      if(quickSource!==source){quickCache.clear();quickSource=source;}
      return (choices||[]).filter(label=>{
        if(quickCache.has(label))return quickCache.get(label);
        const text=words(label);
        if(/ficha|primer|segund|anterior|opciones|presupuesto|tem[aá]|regalo|compr|consult|comparar dos articulos/.test(text))return true;
        const kind=kindFrom(text,base);
        if(!kind)return true;
        const c=freshSearch(kind);
        if(!text.includes('sin esos filtros'))setFeatures(c,readFeatures(text,kind),false);
        const available=rows.some(row=>matchesCriteria(row,c,base));quickCache.set(label,available);return available;
      });
    }
    function answer(text,quick=[],cards=[]){return {text,quick,cards,safe:true}}
    function list(state,c,{more=false}={}){
      const d=state.dialogue;
      if(more)c.rejected=[...new Set([...c.rejected,...(state.lastRecs||[])])].slice(-75);
      d.search=c;
      const matches=ranked(rows,c,base);
      if(!matches.length){
        state.lastRecs=[];state.focusId=null;
        const offer=c.kind==='ornaments'?['Ver árboles de Navidad','Decorar la mesa']:
          c.kind==='reading'?['Ver papelería','Buscar otro regalo']:
          c.kind==='table'?['Ver artículos de cocina','Cambiar de tema']:
          c.kind==='seat'?['Ver muebles de jardín','Cambiar de tema']:
          ['Ver '+kindLabel(c.kind,base)+' sin esos filtros','Cambiar de tema'];
        const note=c.laptopInches?' Los litros no confirman que quepa ese portátil.':'';
        return answer(`No encuentro una ficha publicada que confirme ${describe(c,base)}${more?' entre las opciones que quedan':''}.${note} ${c.kind==='ornaments'?'Un árbol entero tampoco sustituye al adorno. ':''}Puedes cambiar una condición o mirar otra categoría.`+budgetNote(state.budget),offer);
      }
      const shown=matches.slice(0,3);
      state.lastRecs=shown.map(r=>r.p.id);state.focusId=shown[0].p.id;
      const phrase=describe(c,base),intro=more?'Estas son otras opciones':d.pageCount%2?'He encontrado estas opciones':'Estas fichas encajan';
      d.pageCount++;
      const person=state.recipientContext?.label;
      const purpose=c.occasion&&eventById[c.occasion]?' para '+eventById[c.occasion]+(person&&c.occasion==='birthday'?' de tu '+person:''):'';
      const text=`${shown.length===1?'Hay una coincidencia':intro} en Velan’s${purpose}. Buscabas ${phrase}.`+budgetNote(state.budget);
      let quick=['Háblame del primero'];
      if(shown.length>1)quick.push('Compara los dos primeros');
      if(matches.length>3)quick.push('Enséñame otros');
      return answer(text,quick,shown.map(r=>internalCard(base,r.p,`Coincide con ${phrase}.`)));
    }
    function compare(state,products){
      if(products.length<2)return answer('¿Qué dos artículos quieres comparar? Puedes elegir dos de la última lista o abrir sus fichas.');
      const chosen=products.slice(0,2);state.comparedIds=chosen.map(p=>p.id);
      const records=chosen.map(p=>byId.get(p.id));
      const summaryRows=[['Ficha',...chosen.map(p=>p.summary||'Solo consta el título')]];
      for(const [key,label,unit] of metrics){
        const vals=records.map(r=>r?(r.values||=metricValues(r.evidence))[key]:undefined);
        if(vals.some(v=>v!=null))summaryRows.push([label,...vals.map(v=>v==null?'No confirmado':`${format(v)} ${unit}`)]);
      }
      for(const key of ['long','short','thermal','wireless','wired','anc','sport','fold','water','cotton','hood']){
        const f=byFeature.get(key);const vals=records.map(r=>r?trait(r,f):null);
        if(vals.some(v=>v===true))summaryRows.push([f[1],...vals.map(v=>v==null?'No confirmado':v?'Sí':'No (según la ficha)')]);
      }
      return {...answer('He comparado los datos publicados de los dos artículos. Puedes abrir sus fichas para verlos por separado.',[],chosen.map(p=>internalCard(base,p,'Artículo de la comparación.'))),table:{head:['Característica',...chosen.map(p=>p.title)],rows:summaryRows}};
    }
    function seasonIdeas(state,event,climate){
      const choices=climate==='cold'?['coat','hoodie','shirt']:climate==='hot'?['shirt','shoes','bag']:
        ({christmas:['tree','table','coffee'],school:['bag','stationery'],summer:['shirt','bag','shoes'],jordi:['reading'],kings:['coffee','watch','audio'],cold:['coat','hoodie'],easter:['bag','shoes'],halloween:['table','ornaments'],year:['table','coffee'],invisible:['stationery','coffee'],black:['audio','coffee','bag']})[event.id]||['coffee','bag','audio'];
      const articles=[];
      for(const kind of choices){
        const c=freshSearch(kind);c.climate=climate;c.occasion=event.id;
        if(kind==='shirt'&&climate)c.features[climate==='cold'?'long':'short']=1;
        const hit=ranked(rows,c,base).find(r=>!articles.some(p=>p.id===r.p.id));
        if(hit)articles.push(hit.p);
      }
      const text=event.label?`Para ${event.label}, ${articles.length?'puedes empezar por estas ideas de nuestra selección':'podemos afinar por el uso que tienes en mente'}.`:'Podemos empezar por estas ideas del catálogo. ¿Buscas algo para ti, para casa o para regalar?';
      state.lastRecs=articles.map(p=>p.id);state.focusId=articles[0]?.id||null;
      state.dialogue.search=null;
      return answer(text,event.quick||themes.open,articles.map(p=>internalCard(base,p,'Idea editorial de Velan’s según el tipo de artículo.')));
    }
    const format=v=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(v);
    function factual(state,text,product){
      if(!product)return null;
      const row=byId.get(product.id);if(!row)return null;
      const ask=/^(?:y |pero |entonces |vale |o sea )*(?:este|esta|es |son |sirve|lleva|viene|tiene|tienen|incluye|cuant|que |cual |se puede|cabe|me vale|y (?:su|el|la) )/.test(text)||/\b(?:que (?:potencia|capacidad)|cuantos? (?:litros|vatios)|dime (?:la|su|los)|confirmame)\b/.test(text);
      if(!ask||newSearch.test(text))return null;
      const metric=metrics.find(m=>m[3].test(text));
      if(metric){
        const vals=row.values||=metricValues(row.evidence),v=vals[metric[0]];
        const msg=v==null?`La ficha de «${product.title}» no indica ${metric[1]}.`:`Para «${product.title}», la ficha indica ${format(v)} ${metric[2]} de ${metric[1]}.`;
        state.dialogue.lastMetric=metric[0];state.focusId=product.id;
        return answer(msg,['Ver su ficha','Buscar algo parecido'],[internalCard(base,product,'Ficha que estamos consultando.')]);
      }
      if(/\b(?:talla|medidas|dimensiones|cab(?:e|ra)|compatib\w*|sirve (?:con|para mi))\b/.test(text)){
        const what=/talla/.test(text)?'la talla disponible':/medidas|dimensiones/.test(text)?'las medidas exactas':'esa compatibilidad';
        return answer(`La ficha de «${product.title}» no confirma ${what} para lo que indicas. Puedes comprobar ese detalle antes de elegir.`,['Ver su ficha'],[internalCard(base,product,'Comprueba los detalles del modelo.')]);
      }
      const requested=Object.keys(readFeatures(text,state.dialogue.search?.kind||''));
      if(requested.length){
        const details=requested.map(k=>{
          const f=byFeature.get(k),value=trait(row,f);
          return value===true?`La ficha sí indica «${f[1]}».`:value===false?`La ficha contiene información contraria a «${f[1]}».`:`La ficha no confirma «${f[1]}».`;
        });
        return answer(`Sobre «${product.title}»: `+details.join(' '),['Ver su ficha','Buscar algo parecido'],[internalCard(base,product,'Solo indicaciones presentes en la ficha.')]);
      }
      return null;
    }
    function rankedMetric(state,text,kind){
      const m=metrics.find(m=>m[3].test(text));
      if(!m||!/(?:mas |mayor |menor |menos |orden|cual tiene|cual pesa)/.test(text))return null;
      const c=state.dialogue.search?.kind===kind?structuredCriteria(state.dialogue.search):freshSearch(kind);
      Object.assign(c.brands,brandHits(text));
      const candidates=ranked(rows,c,base);const known=candidates.filter(r=>(r.values||=metricValues(r.evidence))[m[0]]!=null);
      if(!known.length)return answer(`Las fichas de ${kindLabel(kind,base)} que encajan no indican ${m[1]} en ${m[2]}. No puedo ordenarlas por ese dato.`,['Ver '+kindLabel(kind,base)]);
      const smallest=/\b(?:menor|menos|pequen\w*|liger\w*)\b/.test(text);
      known.sort((a,b)=>(smallest?1:-1)*(a.values[m[0]]-b.values[m[0]]));
      const shown=known.slice(0,3);state.lastRecs=shown.map(r=>r.p.id);state.focusId=shown[0].p.id;state.dialogue.search=c;
      return answer(`Por ${m[1]}, la cifra ${smallest?'menor':'mayor'} publicada entre estas opciones es ${format(shown[0].values[m[0]])} ${m[2]}, en «${shown[0].p.title}».${known.length<candidates.length?' Hay otras fichas sin ese dato.':''}`,['Ver la primera ficha'],shown.map(r=>internalCard(base,r.p,`${m[1]} publicada: ${format(r.values[m[0]])} ${m[2]}.`)));
    }
    function structuredCriteria(c){return {...c,features:{...c.features},brands:{...c.brands},rejected:[...c.rejected]}}
    function remember(d,c){
      if(d.search&&d.search.kind!==c.kind)d.previous=structuredCriteria(d.search);
      d.search=c;
    }
    function route(state,raw){
      index();
      const d=state.dialogue||=( {search:null,previous:null,occasion:null,pageCount:0,lastMetric:null} );
      let text=words(raw).replace(/^(?:bueno[, ]+|vale[, ]+|hola[, ]+|buenas[, ]+|oye[, ]+|pues[, ]+|gracias[, ]+|mira[, ]+)(?=.{4})/,'').trim().replace(/[.,]+$/,'');
      if(['shirt','top','hoodie','coat'].includes(d.search?.kind)){
        text=text.replace(/\b(mejor|prefiero|solo|las quiero|que sean|en vez de) (?:las? )?(largas?|cortas?)\b/g,(_,lead,cut)=>lead+' manga '+(cut.startsWith('larg')?'larga':'corta'));
      }
      const seasonal=season(now(),text);
      const occasion=events.find(e=>e[2].test(text));
      const climate=hot.test(text)?'hot':cold.test(text)?'cold':null;
      const hasGift=/\b(?:regal[oa]s?|regalar(?:le)?|para mi (?:mujer|marido|novi[ao]|herman[oa]))\b/.test(text)&&!/\bno (?:es|quiero|busco) (?:un )?regalo\b/.test(text);
      const budget=readBudget(text,state.budget);
      const originalBudget=state.budget?.max;
      if(budget)state.budget=budget;
      if(occasion)d.occasion=occasion[0];
      if(/(?:nueva conversacion|empieza de cero|empezar de cero|borra(?:r)? todo|olvida(?:lo)? todo|reinicia la conversacion)/.test(text)){
        const selected=state.selectedProductId;
        for(const key of Object.keys(state))delete state[key];
        Object.assign(state,base.newState());if(selected&&base.byId(selected))base.setSelected(state,selected);
        return {...answer('He borrado la conversación y las preferencias de esta visita. ¿Qué buscas ahora?',themes.open),resetHistory:true};
      }
      if(/^(?:cambi(?:a|ar|emos) de tema|otra (?:busqueda|cosa)|algo distinto|busca otra cosa)$/.test(text)){
        d.previous=d.search||d.previous; d.search=null;d.occasion=null;d.pausedBudget=state.budget;
        const fresh=base.newState();Object.assign(state,{intent:null,category:null,real:null,budget:fresh.budget,recipientContext:fresh.recipientContext,lastRecs:[],focusId:null,preferences:fresh.preferences,exclusions:fresh.exclusions,pending:null});
        return answer('De acuerdo. ¿Qué quieres mirar ahora?',themes.open);
      }
      if(privateOrPolicy.test(text))return null;
      if(socialEnd.test(text))return answer('¡Hasta pronto! Cuando quieras, seguimos con la selección de Velan’s.');
      const seasonalAsk=/\b(?:en estas fechas|por estas fechas|(?:esta|la) temporada|que (?:se lleva|pega) ahora|que (?:me )?recomiendas (?:ahora|hoy)|ideas (?:de|para) (?:esta epoca|estos dias)|que hay para (?:estas|las) fiestas)\b/.test(text);
      if(popularity.test(text))return answer('No dispongo de un ranking de ventas comprobado. Puedo enseñarte ideas de las fichas publicadas según la ocasión o el uso que les quieras dar.',seasonal.quick);
      let kind=kindFrom(text,base);
      if(d.search && /^(?:y |pero |al reves[, ]+|mejor |perdon[, ]+)*(?:sin |con |nada de |que (?:sea|tenga)|en (?:color|talla) |solo de )/.test(text) && !newSearch.test(text))kind=d.search.kind;
      if(d.search && kind==='top' && !/\b(?:ropa|prendas?|vestirme)\b/.test(text) && /manga/.test(text))kind=d.search.kind;
      const own=kind&&!kind.startsWith('base:');
      const refinements=readFeatures(text,kind||d.search?.kind);
      const shopping=newSearch.test(text)||!!kind||Object.keys(refinements).length>0;
      const mentionsPurchase=purchase.test(text),mentionsDelivery=delivery.test(text);
      if(mentionsPurchase||mentionsDelivery){
        const tail=[mentionsPurchase&&commercialCopy,mentionsDelivery&&deliveryCopy].filter(Boolean).join(' ');
        const separated=raw.match(/^(.+?)(?:[,.!?¿]\s*|\s+y(?:\s+(?:dime|explicame|explícame))?\s+)(?=(?:¿?\s*)?(?:d[oó]nde|c[oó]mo|qui[eé]n|cu[aá]ndo|llegar|cu[aá]nto tarda))/i);
        if(separated&&shopping&&separated[1].trim().length>4){
          const part=separated[1].trim();
          if(!kindFrom(words(part),base)&&!newSearch.test(words(part)))return answer(tail);
          const reply=route(state,part)||base.respond(state,part);
          reply.text+=' '+tail;return reply;
        }
        return answer(tail,state.lastRecs?.length?['Volver a las opciones','Ver la primera ficha']:[]);
      }
      if(activeRetail.test(text)&&!budget&&!seasonalAsk)return null;
      const explicit=referenced(text,state,base);
      for(const token of modelTokens(text)){
        const model=models.get(token);if(model&&!explicit.some(p=>p.id===model.id))explicit.push(model);
      }
      if(!explicit.length&&ordinals.some((rx,i)=>rx.test(text)&&i>=(state.lastRecs||[]).length)&&/\b(?:ficha|enlace|abr[ei]|compara|ver|ensena|hablame)\w*\b/.test(text)){
        return answer('Esa posición no aparece en la última lista. Puedes elegir una de las opciones que sí te enseñé o pedir más artículos.',['Volver a las opciones']);
      }
      const selected=base.byId(state.selectedProductId),focused=base.byId(state.focusId);
      const namedLink=kind&&/\b(?:enlace|ficha) (?:de(?:l| la| los| las)?|para)\s+/.test(text);
      const named=namedLink?(state.lastRecs||[]).map(id=>byId.get(id)).find(r=>r&&typeMatch(r,kind,base))?.p:null;
      const product=explicit[0]||named||(/\b(?:de (?:la|esta) ficha|estoy (?:viendo|mirando)|este (?:articulo|producto))\b/.test(text)?selected:null)||focused||selected;
      const guide=guideFor(text);
      if(guide)return answer(guide,state.lastRecs?.length?['Volver a las opciones','Ver la primera ficha']:['Ver productos relacionados','Quiero un regalo']);
      if(d.lastMetric==='power'&&/ruido|silencios/.test(text)&&product&&!newSearch.test(text)){
        return answer(`La potencia por sí sola no indica el ruido. `+(factual(state,'cuantos decibelios',product)?.text||'Haría falta una medición en decibelios.'),['Ver su ficha']);
      }
      if(/\b(?:compara\w*|comparativa|diferencia entre los dos|en que se distinguen)\b/.test(text)&&!newSearch.test(text)){
        if(/\b(?:con el anterior|con la anterior)\b/.test(text)&&selected){
          const prev=base.byId((state.previousProductIds||[]).at(-1));return compare(state,[selected,prev].filter(Boolean));
        }
        const list=(state.lastRecs||[]).map(id=>base.byId(id)).filter(Boolean);
        if(explicit.length>=2||(/\b(?:dos|amb[oa]s|primer[oa]s)\b/.test(text)&&list.length>=2))return compare(state,explicit.length>=2?explicit:list);
        if(/\b(?:comparar|comparame|compara) (?:dos |los dos|articulos|productos|opciones)/.test(text)){
          if(kind){const found=ranked(rows,freshSearch(kind),base).slice(0,2).map(row=>row.p);if(found.length>=2)return compare(state,found);}
          return answer('¿Qué dos artículos quieres comparar? Elige primero una categoría y podrás señalar el primero y el segundo de la lista.',['Ver mochilas','Ver auriculares','Ver relojes']);
        }
      }
      if((kind||d.search?.kind)&&/\b(?:mas potente|mas potencia|mayor potencia|mas vatios|mas capacidad|mayor capacidad|mas litros|menos litros|mayor autonomia|mas autonomia|menos peso|menor peso|mayor voltaje|mas voltios)\b/.test(text)){
        const r=rankedMetric(state,text,kind||d.search.kind);if(r)return r;
      }
      if(product&&(namedLink||/\b(?:explicame (?:este|esta)|hablame de|cuentame (?:mas|sobre)|ver (?:su|la (?:primera|segunda|tercera)) ficha|ver la ficha|ensename (?:este|esta)|dame (?:el )?enlace|pasame (?:el )?enlace|abre (?:su|la) ficha)\b/.test(text)||explicit.length&&/enlace|ficha|quiero el|quiero la|me quedo/.test(text))){
        if(namedLink&&!named&&!explicit.length)return null;
        state.focusId=product.id;
        return answer(`«${product.title}». ${product.summary||'La ficha publicada contiene el nombre del artículo y su categoría.'} Puedes abrirla aquí.`,['Ver algo parecido','Volver a las opciones'],[internalCard(base,product,'Artículo seleccionado.')]);
      }
      const fact=factual(state,text,product);if(fact)return fact;
      if(/\b(?:quien escribio|capital de|quien gano el partido|que hora es|politica internacional)\b/.test(text))return answer('Mi especialidad son las compras y las guías de Velan’s. Puedo ayudarte a elegir un artículo, comparar fichas o retomar tu búsqueda.',d.search?['Volver a las opciones']:themes.open);
      if(/\bbanco\b/.test(text)&&!/\b(?:jardin|sentar|asiento|mueble)\b/.test(text)){
        d.pending='bank';return answer('¿Te refieres a un banco para sentarte, a un banco de trabajo o a otra cosa?',['Un banco para el jardín','Un banco de trabajo']);
      }
      if(d.pending==='bank'&&/jardin|sentar|asiento|banco de trabajo/.test(text)){
        delete d.pending;
        if(/banco de trabajo/.test(text)){
          const available=rows.filter(r=>/\bbanco de trabajo\b/.test(r.title)).slice(0,3);
          state.lastRecs=available.map(r=>r.p.id);
          return answer(available.length?'Estas fichas indican banco de trabajo.':'No encuentro un banco de trabajo identificado en el catálogo.',[],available.map(r=>internalCard(base,r.p,'Banco de trabajo indicado en el título.')));
        }
        return list(state,freshSearch('seat'));
      }
      if(/(?:para las fiestas|para estas fiestas)/.test(text)&&!own&&!hasGift&&!occasion){
        return answer('¿Quieres algo para vestir, para decorar o para regalar en las fiestas?',themes.party);
      }
      if(occasion?.[0]==='invisible'&&!own){
        d.pending='invisible';return answer('Para un amigo invisible, ¿preferirías un detalle práctico de papelería o algo para una persona que toma café?'+budgetNote(state.budget),themes.invisible);
      }
      if(/cambiar el presupuesto/.test(text)&&!budget)return answer('¿Qué tope te gustaría poner? Puedes escribir, por ejemplo, «hasta treinta euros».');
      if(budget&&!kind&&(originalBudget!=null||d.search)&&(!hasGift||/\b(?:sub|baj|tope|limite)/.test(text))){
        return answer(budget.max==null?'He quitado el límite de presupuesto.':`El nuevo tope es ${format(budget.max)} €. Mantengo las demás preferencias. ${priceCopy}`,d.search?['Volver a las opciones','Cambiar de tema']:['Ver ideas para regalar']);
      }
      if(/^(?:volver a las opciones|ver (?:otra vez |de nuevo )?las opciones|volvamos a lo de antes|retoma (?:mi |la )?busqueda)\b/.test(text)){
        if(!d.search&&d.previous){d.search=d.previous;d.previous=null;if(d.pausedBudget)state.budget=d.pausedBudget;}
        if(d.search)return list(state,d.search);
        const old=(state.lastRecs||[]).map(id=>base.byId(id)).filter(Boolean);
        if(old.length)return answer('Estas eran las últimas opciones de esta visita.',[],old.map(p=>internalCard(base,p,'Opción anterior.')));
      }
      if(!d.search&&product&&/\b(?:algo|otro|uno) parecid[oa]\b/.test(text)){
        const type=kindFrom(words(product.title),base);
        if(type){const c=freshSearch(type);c.rejected=[product.id];return list(state,c);}
      }
      if(d.search && /(?:no me gusta ninguno|ningun[oa] me (?:gusta|encaja)|otros? (?:distint|diferent)|otras opciones|(?:muestrame|ensename|dame|ver|busca) (?:mas|otr[oa]s?)|algo parecido)/.test(text)&&!own)return list(state,d.search,{more:true});
      if(d.search && /por que (?:me )?(?:recomiendas|esos|estos|lo has|los has)|en que te basas/.test(text)){
        return answer(`Te los he propuesto porque las fichas coinciden con ${describe(d.search,base)}. Puedes cambiar una condición.`,['Volver a las opciones','Enséñame otros']);
      }
      if(d.search&&/sin (?:esos|los) filtros/.test(text)){
        const c=freshSearch(d.search.kind);return list(state,c);
      }
      if(occasion&&/perdon|rectifico|queria decir|en realidad/.test(text)){
        d.occasion=occasion[0];state.recipientContext.occasion=occasion[1];
      }
      if(occasion?.[0]==='jordi'&&(kind==='reading'||!kind)){const c=freshSearch('reading');c.occasion='jordi';return list(state,c);}
      const correcting=/\b(?:al reves|mejor|queria decir|rectifico|perdon|mas bien|en realidad|preferiria|en vez de)\b/.test(text);
      if(hasGift&&(!own||kind==='coffee')&&(!d.search||occasion||!kind)){
        if(occasion&&correcting){
          state.recipientContext.occasion=occasion[1];d.occasion=occasion[0];
          if(kind==='coffee'){const c=freshSearch('coffee');c.occasion=d.occasion;return list(state,c);}
        }
        return null;
      }
      const related=/\b(?:al reves|mejor|ahora|mas bien|solo|pero|sin|con|nada de|perdon|otra|otro|que sea|que sean|preferiria|volvamos|mant[eé]n|para correr)\b/.test(text)||Object.keys(refinements).length||!!fitSize(text);
      if((own||kind&&Object.keys(refinements).length||d.search&&related&&!kind||kind&&correcting)&&(!hasGift||own)){
        const currentKind=kind||d.search?.kind;
        if(!currentKind)return null;
        const old=d.search?.kind===currentKind?d.search: d.previous?.kind===currentKind&&/volvamos|volver|retom/.test(text)?d.previous:null;
        const c=old?structuredCriteria(old):freshSearch(currentKind);
        if(correcting && Object.keys(refinements).length)c.rejected=[];
        setFeatures(c,refinements,correcting);
        if(/(?:\bo\b|\/)/.test(text)&&Object.keys(refinements).filter(k=>k.startsWith('color:')).length>1)c.anyColors=true;
        Object.assign(c.brands,brandHits(text));c.audience=explicitAudience(text)||c.audience;
        const size=fitSize(text);if(size)c.size=size;
        c.occasion=occasion?.[0]||c.occasion;c.climate=climate||c.climate;
        const inch=text.match(/(\d+(?:[.,]\d+)?)\s*(?:pulgadas?|["”])/);
        if(currentKind==='bag'&&inch&&('laptop' in c.features))c.laptopInches=Number(inch[1].replace(',','.'));
        remember(d,c);d.lastMetric=null;return list(state,c);
      }
      if(climate&&!kind&&!hasGift&&/\b(?:que (?:me pongo|llevo|ropa)|ropa|vestir|vestirme|algo para (?:el |la )?(?:frio|calor)|como me visto)\b/.test(text)){
        return seasonIdeas(state,{id:climate,label:climate==='cold'?'el frío que indicas':'el calor que indicas',quick:climate==='cold'?themes.cold:themes.summer},climate);
      }
      if(seasonalAsk&&!kind||occasion&&!hasGift&&!kind&&/\b(?:ideas|opciones|sugerencias|recomiendas)\b/.test(text)){
        const e=occasion?{id:occasion[0],label:occasion[1],quick:themes[occasion[0]]||themes.party}:seasonal;
        return seasonIdeas(state,e,climate);
      }
      if(/^(?:quiero |ver )?productos relacionados$/.test(text))return answer('¿En qué tipo de artículo te gustaría aplicar la guía?',themes.open);
      return null;
    }
    function respond(state,raw){
      const input=String(raw||'').trim().slice(0,600);
      if(base.detectSensitive(input).length)return base.respond(state,input);
      const initialTurns=state.turns;
      let reply=route(state,input);
      if(!reply){
        // Policy, social conversation, gift discovery and unhandled product families keep their original engine.
        if(!rows.length && !privateOrPolicy.test(words(input)))return answer('Ahora no hay una ficha publicada que pueda consultar. Puedo explicar cómo usar Velan’s.', ['Cómo se compra aquí']);
        reply=base.respond(state,input);
        if(/no tengo nada de|no he encontrado nada con/i.test(reply.text)&&reply.cards?.length){
          reply=answer('No encuentro una coincidencia confirmada con esa descripción. ¿Qué tipo de artículo o característica te interesa más?',['Cambiar de tema']);state.lastRecs=[];
        }
        if(reply.cards?.length&&state.budget?.max!=null&&!reply.text.includes('presupuesto'))reply.text+=budgetNote(state.budget);
        if(reply.cards?.length&&state.dialogue && !/enlace|compar|hablame|explicame|detalle/.test(words(input))){
          if(state.dialogue.search)state.dialogue.previous=state.dialogue.search;
          state.dialogue.search=null;
        }
      }
      if(state.turns===initialTurns)state.turns++;
      reply.cards=(reply.cards||[]).filter(c=>byId.has(c.id)).map(c=>{const {affiliateUrl,...card}=c;return card;});
      reply.quick=publishedQuick(reply.quick);
      if(reply.text.includes('Consultar en Amazon'))reply.text=reply.text.replaceAll('«Consultar en Amazon»','«Ver en Amazon» en la ficha de Velan’s');
      return reply;
    }
    function greeting(state,opts={}){
      const reply=base.greeting(state,opts);
      if(!state.selectedProductId&&!opts.resume && !opts.changed){
        const e=season(now());
        reply.text='Soy el asistente de compras de Velan’s. Puedo buscar en nuestro catálogo, explicarte una ficha y comparar artículos. ¿Qué necesitas?';
        const ideas=publishedQuick(e.quick);
        reply.quick=publishedQuick(e.label&&ideas.length?[ideas[0],'Quiero un regalo','Comparar dos artículos','Cómo se compra aquí']:['Quiero un regalo','Comparar dos artículos','Ver tecnología','Cómo se compra aquí']);
        reply.quick=[...new Set(reply.quick)];
      }
      return reply;
    }
    function setSelected(state,id){
      const item=base.setSelected(state,id);
      if(item){state.focusId=item.id;if(state.dialogue)state.dialogue.lastMetric=null;}
      return item;
    }
    return {...base,respond,greeting,season,setSelected};
  }
  root.VelansDialogue={create:createDialogue};

})(typeof window === 'undefined' ? globalThis : window);
