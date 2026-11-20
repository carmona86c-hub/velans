/* Local conversation for the published Velan’s catalogue. Loaded when the panel opens. */
(function (root) {
  'use strict';

  const fold = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const spelling = {kiero:'quiero',kieres:'quieres',qiero:'quiero',busko:'busco',kables:'cables',kable:'cable',aurikulares:'auriculares',caskos:'cascos',pa:'para',pal:'para el',tb:'tambien',tmb:'tambien',xq:'porque',xfa:'por favor',pls:'por favor',xmas:'navidad',navida:'navidad',camisetta:'camiseta',moxila:'mochila',presu:'presupuesto',inalanbricos:'inalambricos',bluethoot:'bluetooth',blutut:'bluetooth'};
  function words(value) {
    return fold(value).replace(/\b(levi)'s\b/g,'$1s').replace(/[¿?¡!;:]/g,' ').replace(/\b[a-z]+\b/g,w=>spelling[w]||w).replace(/\s+/g,' ').trim();
  }

  // Store questions are distinct from the checkout instructions and from a search for a product.
  const shopQualifier = /^(?:que (?:se (?:puede[n]? )?(?:comprar|compra|vende|encuentra|ofrece)|(?:puedo|podemos) (?:comprar|encontrar|ver)|hay|venden|vendeis|vende|ofreceis|ofrecen|teneis|tienen|encuentro|encontrare)|que (?:(?:tipo|clase|tipos|clases) de )?(?:productos|articulos|categorias|cosas) (?:teneis|hay|vendeis|ofreceis|se vend\w*|se puede[n]? comprar))(?:(?: (?:por )?(?:aqui|ahi|online|en (?:esta|la|vuestra) (?:web|pagina|tienda)|en velan'?s|en (?:vuestro|el) catalogo))| (?:exactamente|ahora mismo|ahora|hoy|por favor|porfa))*$/;
  const shopIntroduction = /^(?:que es|de que va|para que sirve|como funciona) (?:esta (?:web|pagina|tienda)|velan'?s)(?: exactamente)?$/;
  const shopGeneral = /^(?:(?:que vende|que ofrece|que tiene) velan'?s|que puedo encontrar en (?:vuestra|esta) pagina|que (?:tipo de|clase de) (?:cosas|articulos|productos) (?:puedo encontrar|puedo comprar|se compran|se pueden comprar) (?:aqui|en (?:esta|la) (?:web|pagina|tienda))|(?:me (?:puedes|podeis) (?:decir|contar) )?que (?:se puede comprar|se vende|hay a la venta) por aqui|de que (?:es|trata) (?:esta|la) (?:web|pagina|tienda)|(?:para que (?:es|sirve)|que ofrece) velan'?s)$/;
  const departments = [
    ['Moda','moda y complementos','Ver ropa'],
    ['Tecnología','tecnología','Ver tecnología'],
    ['Hogar','hogar y cocina','Ver hogar y cocina'],
    ['Belleza','belleza y cuidado personal','Ver belleza'],
    ['Infantil','infantil','Ver infantil'],
    ['Bricolaje','bricolaje','Ver bricolaje'],
    ['Deportes','deporte','Ver deportes'],
    ['Oficina','papelería y oficina','Ver papelería'],
    ['Automoción','accesorios de coche','Ver accesorios de coche'],
    ['Mascotas','mascotas','Ver mascotas'],
    ['Alimentación','alimentación','Ver alimentación'],
    ['Otros','otros artículos','Ver otros artículos']
  ];
  const supportQuestion = /\b(?:donde (?:miro|veo|encuentro|consulto|esta)|como (?:sigo|localizo|consulto|cancelo|anulo|rastre[oar]\w*)|no (?:veo|encuentro|me llega)|donde (?:esta|va)) (?:el |mi |un )?(?:seguimiento|pedido|paquete|factura|envio)\b/;
  const topics = [
    [/\b(?:alerg(?:ia|en[oa]\w*)|intoleran\w*|ingredientes?|formula|composicion|perfume|fragancia|lleva gluten|contiene gluten|contiene lactosa)\b/,['Alimentación','Belleza'],'Comprueba la lista completa de ingredientes y los avisos del fabricante en el envase o la ficha del producto.'],
    [/\b(?:secadora|lavadora|lavar|lavado|planchar|lejia|encoge)\b/,['Moda'],'Revisa la etiqueta de cuidados de la prenda. Ahí se indica si admite secadora, la temperatura o el programa de lavado.'],
    [/\b(?:edad|meses?|recien nacid[oa]|de \d+ anos|cual es el peso maximo)\b/,['Infantil'],'Comprueba la edad, el peso y los límites de uso indicados por el fabricante para ese modelo.']
  ];
  const listES = new Intl.ListFormat('es-ES');
  const nameKey = value => fold(value).replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  function nameQuery(input) {
    return nameKey(input)
      .replace(/^(?:(?:hola|buenas|oye|mira|vale|por favor) )+/,'')
      .replace(/^(?:(?:busco|estoy buscando|necesito|quiero ver|me gustaria ver|ensename|muestrame|abre(?:me)?|ver|quiero|queria ver) |(?:puedes|podrias) (?:ensenarme|mostrarme|abrirme) )/,'')
      .replace(/^(?:(?:la )?ficha d(?:el|e(?:l| la| los| las)?) |(?:el )?modelo |(?:el |la )?articulo )/,'')
      .replace(/ (?:por favor|porfa|si lo teneis|si lo tienes)$/,'');
  }

  // A product kind describes what is being bought. The shopping occasion is separate.
  const kinds = [
    ['smartwatch','relojes inteligentes',/\b(?:smartwatch(?:es)?|smart ?watch|relojes? inteligentes?|pulseras? (?:de actividad|inteligentes?))\b/,/\b(?:smartwatch|smart ?watch|redmi watch|reloj inteligente|reloj gps|garmin|amazfit|fitbit|forerunner|instinct)\b/],
    ['houseSlippers','zapatillas de casa',/\b(?:zapatillas? (?:de|para) (?:estar |andar )?(?:por )?casa|pantuflas?|zapatillas? de estar por casa)\b/,/\b(?:zapatillas de casa|pantuflas?|slippers?)\b/],
    ['boardGame','juegos de mesa',/\b(?:juegos? de (?:mesa|cartas|tablero)|jugar en familia|juegos? para (?:toda la )?familia)\b/,/\b(?:palabreando|saber ancestral|if you were|juego de mesa)\b/],
    ['bikeHelmet','cascos de ciclismo',/\b(?:cascos?.{0,26}(?:ciclismo|bicicletas?|bici)|(?:ciclismo|bicicletas?|bici).{0,18}cascos?)\b/,/\bcascos?.{0,26}(?:ciclismo|bicicleta|bici)\b/],
    ['mouse','ratones de ordenador',/\b(?:raton(?:es)?|mouse|mice)\b/,/\b(?:raton(?:es)?|mouse)\b/],
    ['monitor','monitores',/\b(?:monitor(?:es)?|pantallas? (?:de ordenador|para (?:pc|ordenador|jugar|videojuegos)))\b/,/\b(?:monitor(?:es)?|pantalla de ordenador)\b/],
    ['toaster','tostadoras',/\b(?:tostadoras?|tostar (?:el )?pan|toasters?)\b/,/\b(?:tostadoras?|toasters?)\b/],
    ['dryShampoo','champú en seco',/\b(?:champu.{0,27}(?:seco|sin agua)|dry shampoo)\b/,/\b(?:champu.{0,7}seco|dry shampoo)\b/],
    ['mascara','máscara de pestañas',/\b(?:rimel|mascara de pestanas|mascara para (?:las )?pestanas)\b/,/\b(?:rimel|mascara de pestanas|lash.{0,45}mascara|mascara.{0,25}pestanas)\b/,'Belleza'],
    ['tricycle','triciclos',/\b(?:triciclos?|tres ruedas.{0,24}(?:nino|nina|peque|infantil))\b/,/\btriciclos?\b/],
    ['babySeat','hamacas para bebé',/\b(?:hamacas?|hamaquitas?|tumbonas?).{0,30}\bbebes?\b/,/\b(?:hamaca|mecedora).{0,24}\bbebes?\b/],
    ['threadedRod','varillas roscadas',/\b(?:varillas?|barras?|esparragos?) (?:roscadas?|roscados?|de rosca)\b/,/\b(?:varilla|barra) roscada\b/],
    ['bowSaw','sierras de arco',/\b(?:sierras?|serruchos?).{0,20}\barco\b/,/\bsierra(?:s)? de arco\b/],
    ['reel','carretes de pesca',/\bcarretes?.{0,24}(?:pesca|pescar|cana)\b/,/\bcarretes?\b/,'Deportes'],
    ['notebook','cuadernos y libretas',/\b(?:cuadernos?|libretas?|llibretes?|blocs?).{0,20}\ba[ -]?5\b|\ba[ -]?5\b.{0,15}\b(?:cuaderno|libreta|llibreta|bloc)\b/,/\b(?:cuaderno|libreta|bloc)\b/,'Oficina'],
    ['notes','notas adhesivas',/\b(?:notas? (?:adhesivas?|autoadhesivas?)|pos[ -]?its?|post[ -]?its?|papelitos? (?:que se pegan|adhesivos?))\b/,/\b(?:notas? (?:adhesivas?|autoadhesivas?)|post[ -]?it)\b/],
    ['carplay','adaptadores CarPlay',/\bcar[ -]?play\b/,/\bcar[ -]?play\b/],
    ['carScent','ambientadores de coche',/\b(?:ambientador(?:es)?|perfume|huela bien|aroma|quite (?:el )?olor).{0,40}\b(?:coche|auto|vehiculo)\b|\b(?:coche|auto|vehiculo).{0,28}\bambientador(?:es)?\b/,/\b(?:ambientador(?:es)?|car air freshener)\b/,'Automoción'],
    ['petGroom','peines para mascotas',/\b(?:peines?|peinar|cepillar|cepillos?).{0,34}\b(?:perr[oa]s?|gat[oa]s?|mascotas?|michis?)\b/,/\b(?:peines?|cepillos?).{0,34}\b(?:perr[oa]s?|gat[oa]s?|mascotas?)\b/],
    ['mints','caramelos y pastillas',/\b(?:smint|caramelos?|pastillas de menta)\b/,/\b(?:smint|caramelos?|pastillas de menta)\b/,'Alimentación'],
    ['sheets','sábanas y juegos de cama',/\b(?:sabanas?|ropa de cama|juego de cama)\b/,/\b(?:sabanas?|juego de cama)\b/],
    ['screwdriver','destornilladores',/\b(?:destornillador(?:es)?|desarmador(?:es)?|juego de puntas)\b/,/\b(?:destornillador(?:es)?|desarmador(?:es)?|juego de puntas)\b/],
    ['router','routers Wi‑Fi',/\b(?:routers?|enrutador(?:es)?)\b/,/\b(?:routers?|enrutador(?:es)?)\b/],
    ['groomer','afeitadoras y recortadoras',/\b(?:afeitadoras?|barber[ao]s?|recortadoras? (?:de|para la) barba|maquinas? de afeitar)\b/,/\b(?:afeitadoras?|barber[ao]s?|recortadoras?|oneblade|multigroom)\b/],
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
    ['shoes','calzado',/\b(?:zapatillas?|deportivas?|bambas?|tenis|sneakers?)\b/,/^(?!.*\b(?:camiset\w*|sudader\w*|pantal\w*|calcetin\w*|chaquet\w*|mochil\w*|leggings|botell\w*|plantillas?)\b).*\b(?:zapatillas?|sneakers?|calzado|deportivas?|bambas?)\b/],
    ['grinder','molinillos de café',/\b(?:molinillos?|molinos? de cafe|moler (?:el )?cafe|coffee grinder)\b/,/\b(?:molinillos?|molinos? de cafe)\b/],
    ['coffee','artículos para café',/\b(?:cafeteras?|cafeter[oa]s?|cafe|cafes|espresso|capsulas?)\b/,/\b(?:cafeteras?|cafe|espresso|nespresso|molinillo|capsulas? de cafe)\b/],
    ['light','iluminación',/\b(?:lamparas?|luces|iluminacion|linternas?)\b/,/\b(?:lamparas?|luces|iluminacion|linternas?|bombillas?)\b/],
    ['drill','taladros y atornilladores',/\b(?:taladros?|atornilladores?|atornillador)\b/,/\b(?:taladros?|atornillador(?:es)?)\b/],
    ['airfryer','freidoras de aire',/\b(?:freidoras?|airfryers?|air fryers?)\b/,/\b(?:freidoras?|air[ -]?fryers?)\b/],
    ['stationery','papelería',/\b(?:papeleria|libretas?|cuadernos?|estuches?|material escolar)\b/,/\b(?:libretas?|cuadernos?|estuches?|notas|rotuladores?|boligrafos?)\b/]
  ];
  // Each feature has a positive assertion and, where available, contrary evidence.
  // A missing feature is unknown. It cannot certify an exclusion.
  const features = [
    ['long','manga larga',/\b(?:mangas? largas?|brazos? largos?|long sleeve)\b/,/\b(?:mangas? largas?|long[ -]sleeve)\b/,/\b(?:mangas? cortas?|sin mangas?|tirantes|short[ -]sleeve)\b/,'sleeve'],
    ['short','manga corta',/\b(?:mangas? cortas?|short sleeve)\b/,/\b(?:mangas? cortas?|short[ -]sleeve)\b/,/\b(?:mangas? largas?|sin mangas?|tirantes|long[ -]sleeve)\b/,'sleeve'],
    ['thermal','térmico',/\btermic[oa]s?\b/,/\btermic[oa]s?\b/,/\bno termic/],
    ['warm','de abrigo',/\b(?:de abrigo|abrigad[oa]s?|calentit[oa]s?)\b/,/\b(?:abrigo|abrigad[oa]|forrad[oa]|forro|polar|plumon|plumifero|acolchad[oa]|termic[oa]|invierno)\b/],
    ['lighted','luces',/\b(?:luces|iluminacion|lucecitas|luz|leds?)\b/,/\b(?:luces|iluminacion|iluminad[oa]|luz|leds?|luminos[oa])\b/,/\b(?:sin|no (?:tiene|lleva|incluye)) (?:luces|iluminacion|luz|leds?)\b/],
    ['wireless','sin cable',/\b(?:sin cables?|inalambric[oa]s?|wireless|bluetooth)\b/,/\b(?:inalambric[oa]s?|sin cables?|wireless|bluetooth)\b/,/\b(?:solo con cable|no inalambric[oa]s?)\b/,'connection'],
    ['wired','con cable',/\b(?:con cables?|de cables?|por cable|cablead[oa]s?|jack)\b/,/\b(?:con cables?|cablead[oa]s?|jack|por cable)\b/,/\b(?:solo inalambric[oa]|exclusivamente bluetooth|sin entrada de cable)\b/,'connection'],
    ['anc','cancelación activa de ruido',/\b(?:anc|cancelacion (?:activa )?(?:de )?ruido)\b/,/\b(?:anc|cancelacion activa (?:de |del )?ruido)\b/,/\bsin (?:anc|cancelacion activa)\b/],
    ['lightweight','ligero',/\b(?:liger[oa]s?|de poco peso|lightweight)\b/,/\b(?:liger[oa]s?|de poco peso|lightweight)\b/,/\b(?:no (?:es |son )?liger[oa]s?|pesad[oa]s?)\b/],
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
  features.push(
    ['a5','formato A5',/\ba[ -]?5\b/,/\ba[ -]?5\b/],
    ['bluetooth','Bluetooth',/\bbluetooth\b/,/\bbluetooth\b/,/\bsin bluetooth\b/]
  );
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
  const popularity = /\b(?:mas vendid\w*|mas (?:se )?compra\w*|compran mas|lo que mas compra\w*|ranking de ventas?|mas buscad\w*|se vende mas|se venden mas|mas se vende|mas se venden)\b/;
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
    const max=t.match(new RegExp('(?:tope|presupuesto|limite|maximo|hasta|menos de|no (?:mas de|pas[ea] de)|no supere|sub(?:e|elo|o)(?: el (?:tope|limite|presupuesto))? a|baj(?:a|alo|o)(?: el (?:tope|limite|presupuesto))? a|puedo gastar)\\s*(?:es |de |a |son |unos |unas )*'+amount+'(?![\\d,.])(?!\\s*(?:pulgadas|anos|meses|horas|cm|mm|l|litros?|ml|kg|g|w|v|voltios?|vatios?|gb|hz)\\b)'));
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
    [/\b(?:car[ -]?play|android auto)\b/,null,'CarPlay y Android Auto muestran aplicaciones compatibles del móvil en la pantalla del coche. Para un adaptador, comprueba qué conexión trae el coche de fábrica y qué modelos admite el fabricante.'],
    [/\b(?:pos[ -]?it|post[ -]?it|notas? adhesivas?)\b/,/\b(?:diferencia|elegir|reutiliza|pega)\w*\b/,'Para elegir notas adhesivas, fíjate en el tamaño útil, el número de hojas y la superficie a la que quieres pegarlas. Comprueba en la ficha si el fabricante indica que se pueden recolocar.'],
    [/\b(?:carretes?|pesca)\b/,/\b(?:elegir|ca[ñn]a|talla|tama[ñn]o|hilo)\b/,'Para un carrete, compara el tamaño, el tipo de pesca y la capacidad de línea con lo que admite tu caña. Una cifra de tamaño por sí sola no identifica la capacidad.'],
    [/\b(?:champu seco|champu en seco)\b/,null,'El champú en seco se usa entre lavados según sus instrucciones. Para elegir uno, revisa el modo de aplicación, el tono al que está dirigido y la lista de ingredientes si buscas evitar alguno.'],
    [/\b(?:etiqueta|ingredientes|ale[rs]genos|gluten)\b/,/\b(?:comida|caramelos?|alimentacion|alimentos?)\b/,'Para saber qué lleva un alimento, revisa la lista de ingredientes y los avisos de alérgenos del envase. El sabor comercial o el nombre de la ficha no permiten deducir la composición.'],
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
    const family=/^(?:ver |busco |quiero ver |mostrar |muestrame )?(?:articulos de |accesorios de )?(tecnologia|electronica|belleza|hogar(?: y cocina)?|infantil|bricolaje|deportes?|automocion|coche|mascotas|alimentacion|oficina|moda|otros articulos)$/.exec(text);
    if(family){
      const department=departments.find(d=>fold(d[0])===family[1])||
        departments.find(d=>({electronica:'Tecnología','hogar y cocina':'Hogar',deporte:'Deportes',coche:'Automoción','otros articulos':'Otros'})[family[1]]===d[0]);
      if(department)return 'family:'+department[0];
    }
    const other=engine.rTarget(text);
    if(other)return 'base:'+other.key;
    return null;
  }
  function typeMatch(row,id,engine){
    if(!id)return true;
    if(id.startsWith('base:'))return engine.matchesKind(row.p,id.slice(5));
    if(id==='ornaments')return byKind.get(id)[3].test(row.title)&&/navid|nochebuena|espumillon|guirnalda|adorno.{0,20}arbol|bolas? (?:para |del? )(?:el )?arbol/.test(row.evidence);
    if(id.startsWith('family:'))return row.p.family===id.slice(7);
    if(id==='top')return row.p.family==='Moda'&&/\b(?:ropa|camiset\w*|camis[ao]s?|polo|sudader\w*|jersey|pantal\w*|vestid[oa]s?|abrigo|chaqueta|prenda|legg\w*|pijama|blusa|falda)\b/.test(row.title+' '+fold(row.p.module));
    const def=byKind.get(id);return !!def&&(!def[4]||row.p.family===def[4])&&def[3].test(row.title);
  }
  function kindLabel(id,engine){
    if(!id)return 'artículos';
    if(id.startsWith('family:'))return departments.find(d=>d[0]===id.slice(7))?.[1]||'artículos';
    return byKind.get(id)?.[1]||engine.kindLabel(String(id).replace(/^base:/,''))||'artículos';
  }
  function freshSearch(kind){return {kind,features:{},brands:{},audience:null,size:null,laptopInches:null,capacity:null,climate:null,occasion:null,rejected:[],anyColors:false}}
  function describe(c,engine){
    const attrs=Object.entries(c.features).map(([k,v])=>featureDescription(k,v));
    for(const [brand,v] of Object.entries(c.brands))attrs.push(v>0?'de '+brand:'sin la marca '+brand);
    if(c.size)attrs.push('talla '+c.size.toUpperCase());
    if(c.laptopInches)attrs.push('para portátil de '+c.laptopInches+' pulgadas');
    if(c.capacity)attrs.push(c.capacity.label);
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
    if(c.capacity){
      const capacity=(row.values||=metricValues(row.evidence)).capacity;
      if(capacity==null)return false;
      const {value,operator}=c.capacity;
      if(operator==='eq'&&capacity!==value||operator==='ge'&&capacity<value||
        operator==='gt'&&capacity<=value||operator==='le'&&capacity>value||operator==='lt'&&capacity>=value)return false;
    }
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



  // ---- Tienda: Amazon, AliExpress o las dos. Se recuerda en la conversación (state.store). ----
  const storeAli=/\b(?:ali ?express?|ali ?expres+|aliexpre|aliexp|ali ?espres+|aliexprees|aliex|ali)\b/;
  const storeAmazon=/\b(?:amazon|amazom|amason|amazn|amazonn|amz)\b(?! (?:basics|essentials|fire|echo)\b)/;
  const storeBoth=/\b(?:las dos(?: tiendas)?|ambas(?: tiendas)?|cualquier(?:a)? tienda|da igual (?:la )?tienda|todas las tiendas|(?:amazon|ali\w*) y (?:amazon|ali\w*)|de las dos|en las dos|tambien en (?:amazon|ali\w*)|sin importar la tienda)\b/;
  const storeGo=/\b(?:ir|ve|vete|vamos|llevame|lleva|abre|abreme|cambia(?:me)?|pasa(?:me)?|pon(?:me)?|navega)\b/;
  const storeFiller=/\b(?:solo|solamente|unicamente|nada mas|productos?|articulos?|cosas|ofertas?|rebajas|de|del|en|desde|la|el|los|las|a|al|tienda|apartado|seccion|pagina|web|quiero|prefiero|busca(?:r|me|lo|las|los)?|mira(?:r|me)?|enseñar|mostrar|ensename|muestrame|ver|ir|ve|vete|vamos|llevame|lleva|abre|abreme|cambia(?:me)?|pasa(?:me)?|pon(?:me)?|por favor|porfa|ahora|mejor|y|ademas|tambien|que sean|que sea|me|te|lo|recuerda(?:lo)?|siempre|todo|tambien|las dos|ambas|cualquier(?:a)?|da igual|todas|sin importar)\b/g;
  function storeIntent(raw){
    const text=words(raw);
    let set=null;
    if(storeBoth.test(text))set='both';
    else{
      const ali=storeAli.exec(text),amz=storeAmazon.exec(text);
      if(ali&&amz)set=ali.index>amz.index?'AliExpress':'Amazon';else if(ali)set='AliExpress';else if(amz)set='Amazon';
    }
    if(!set)return {set:null,clean:raw,only:false,go:false};
    const clean=text.replace(storeBoth,' ').replace(new RegExp(storeAli.source,'g'),' ').replace(new RegExp(storeAmazon.source,'g'),' ')
      .replace(/\b(?:solo|solamente|unicamente|nada mas) (?=\s*$)/,' ').replace(/\b(?:de|del|en|desde) (?:la tienda de |el apartado de )?(?=\s|$)/g,' ').replace(/\s+/g,' ').trim();
    const leftover=clean.replace(storeFiller,' ').replace(/\s+/g,' ').trim();
    return {set,clean:leftover?clean:'',only:!leftover,go:storeGo.test(text)};
  }
  const storeLabel=s=>s==='AliExpress'?'AliExpress':s==='Amazon'?'Amazon':'Amazon y AliExpress';

  // ---- Vocabulario amplio: saludos y relleno, preguntas de «qué hay», departamentos, lo más vendido y ofertas ----
  const fillerWords=/\b(?:hola|buenas|buenos dias|buenas tardes|buenas noches|oye|oiga|mira|pues|vale|venga|bueno|a ver|eh|ey|porfa|por favor|please|gracias|quiero|quisiera|queria|me gustaria|me gusta|necesito|busco|buscando|estoy buscando|ando buscando|me interesa|me interesan|podrias|puedes|podeis|me puedes|me podrias|ensename|ensenam?e|muestrame|dime|dame|pasame|quiero ver|ver|mirar|echar un vistazo|un vistazo|algo|alguna|algunas|alguno|algunos|unos|unas|un|una|el|la|los|las|lo|de|del|en|para|por|con|que|me|te|mi|y|o|tambien|tipo|cosa|cosas|productos?|articulos?|categoria|seccion|apartado|departamento|zona|parte|tienda|web|pagina|aqui|ahi|ahora|hoy|rollo|en plan|o algo asi|algo asi|tal|cual|tienes|teneis|tienen|hay)\b/g;
  const deptWords=[
    ['Moda',/\b(?:moda|ropa|vestir|prendas?)\b/],
    ['Tecnología',/\b(?:tecnologia|tecno|electronica|gadgets?|cacharros)\b/],
    ['Hogar',/\b(?:hogar|decoracion)\b/],
    ['Belleza',/\b(?:belleza|cosmetica|cosmeticos|maquillaje|cuidado personal|perfumeria)\b/],
    ['Deportes',/\b(?:deportes?|deportivo|gimnasio|gym|fitness|entrenar|entrenamiento)\b/],
    ['Infantil',/\b(?:infantil|bebes?|crianza)\b/],
    ['Bricolaje',/\b(?:bricolaje|ferreteria)\b/],
    ['Mascotas',/\b(?:mascotas?|animales)\b/],
    ['Automoción',/\b(?:automocion|motor)\b/],
    ['Oficina',/\b(?:oficina|papeleria)\b/],
    ['Alimentación',/\b(?:alimentacion|comida|alimentos)\b/]
  ];
  const deptGo=/\b(?:llevame|lleva|ve|vete|ir|vamos|abre|abreme|pasa(?:me)?|cambia(?:me)?|navega)\b/;
  const askCatalogue=/^(?:(?:que|cuales?) (?:es lo que |son las |son los )?(?:cosas |productos |articulos |tipo de (?:cosas|productos|articulos) |clase de (?:cosas|productos) |categorias |secciones |departamentos |marcas )?(?:se )?(?:puedo|podria|podemos|puede|pueden|hay|teneis|tienes|tienen|vendeis|vendes|venden|vende|ofreceis|ofreces|ofrecen|ofrece|encuentro|hay a la venta)\b|(?:que|cuales) (?:categorias|secciones|departamentos)\b|(?:saber|conocer|ver) (?:lo que|que|todo lo que) (?:hay|teneis|tienes|vendeis|vendes|ofreceis|ofreces)\b|(?:lo que|todo lo que) (?:hay|teneis|tienes|vendeis|vendes)\b|(?:que|q) (?:me )?(?:ofreces|ofreceis|vendes|vendeis)\b)/;
  const bestRx=/\b(?:(?:lo |los |las )?mas vendid\w*|lo que mas se vende|lo que mas vende\w*|top ventas|mas populares?|mas exitos?o?s?|superventas|best ?sellers?|lo mas top|mas comprad\w*)\b/;
  const offerRx=/\b(?:ofertas?|rebaj\w*|descuentos?|chollos?|gangas?|promociones?|promos?|black friday|en oferta)\b/;
  const softFiller=/\b(?:me (?:encantaria|gustaria|apeteceria|apetece|interesaria|vendria bien|haria falta)(?: (?:ver|tener|comprar|mirar|encontrar|echar un ojo a))?|quisiera(?: ver)?|querria(?: ver)?|estaria bien|si puede ser|si es posible|si puedes|por favor|porfa|porfavor|gracias|muchas gracias|a ver si (?:tienes|teneis|hay)|una pregunta|pregunta|perdona|disculpa|oye|oiga|mira|pues|vale|venga|bueno|hola|buenas|vosotros|ustedes|exactamente|entonces|en general|basicamente)\b/g;
  const leadFill=/^(?:(?:hola|buenas|oye|oiga|mira|pues|nada|vale|venga|bueno|a ver|eh|ey|que tal|como estas|quiero|quisiera|queria|una pregunta|pregunta|perdona|disculpa)[ ,!]+)+/;
  const askTail=/(?:^|\by )?\bque (?:es lo que |son las cosas que |cosas |productos |articulos )?(?:teneis|tienes|tienen|vendeis|vendes|venden|hay|ofreceis|ofreces|ofrecen|se vende|se puede comprar|puedo comprar)(?: (?:por )?(?:aqui|ahi|en la web|en la tienda|en la pagina|en velan'?s))?$/;
  const numberIn=(text,rx)=>{const m=rx.exec(text||'');return m?Number(String(m[1]).replace(/[.\s]/g,'')):0;};
  const soldOf=p=>numberIn(p.summary,/([\d.]+) vendidos/);
  const offOf=p=>numberIn(p.summary,/(\d+) % de descuento/);

  function createDialogue(base,{now=()=>new Date()}={}) {
    let source=null,rows=[],byId=new Map(),models=new Map(),names=new Map(),titleTokens=new Map(),families=new Set();
    function index(){
      const current=base.realCatalog();
      if(current===source)return;
      source=current;rows=prepRows(current);byId=new Map(rows.map(r=>[r.p.id,r]));
      models=new Map();names=new Map();titleTokens=new Map();families=new Set();
      for(const row of rows){
        families.add(row.p.family);
        const key=nameKey(row.p.title);
        if(key)names.set(key,[...(names.get(key)||[]),row.p]);
        for(const token of new Set(key.split(' '))){
          if(token.length<5)continue;
          if(titleTokens.has(token))titleTokens.set(token,null);
          else titleTokens.set(token,row.p);
        }
      }
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
    function overview() {
      const present=departments.filter(d=>families.has(d[0])&&d[0]!=='Otros');
      if(!present.length&&!rows.length)return answer('Velan’s reúne una selección de productos y guías de compra. Ahora mismo no hay fichas publicadas para consultar.');
      const categories=listES.format(present.slice(0,5).map(d=>d[1]));
      const more=listES.format(present.slice(5).map(d=>d[1]));
      const offer=categories?' En el catálogo encontrarás '+categories+'.'+(more?' También hay '+more+'.':''):' Puedes explorar los artículos de la selección.';
      return answer('Velan’s reúne una selección de productos y guías para ayudarte a elegir.'+offer+' Aquí puedes explorar y comparar fichas de productos de dos tiendas, Amazon y AliExpress (puedes pedirme solo una de ellas). La compra se completa en la tienda de cada producto. ¿Qué categoría te interesa?',present.slice(0,4).map(d=>d[2]));
    }
    function article(state,product) {
      state.focusId=product.id;
      return answer('«'+product.title+'». '+(product.summary||'La ficha publicada contiene el nombre del artículo y su categoría.')+' Puedes abrirla aquí.',
        ['Buscar algo parecido','Volver a las opciones'],[internalCard(base,product,'Artículo seleccionado.')]);
    }
    function list(state,c,{more=false}={}){
      const d=state.dialogue;
      if(more)c.rejected=[...new Set([...c.rejected,...(state.lastRecs||[])])].slice(-75);
      d.search=c;
      let matches=ranked(rows,c,base),relaxedNote='';
      if(!matches.length&&c.kind){
        // No se queda en blanco: si los filtros dejan cero, se enseñan los más parecidos del mismo tipo.
        // Solo se relajan rasgos «blandos» (color, estilo, uso, público); talla, material, conexión o capacidad nunca.
        const softKeys=/^(?:color:|gaming$|formal$|loose$|sport$|running$|casual$|elegant$|warm$|summer$|winter$|laptop$)/;
        const hard=Object.fromEntries(Object.entries(c.features||{}).filter(([k])=>!softKeys.test(k)));
        const loose={...c,features:hard,anyColors:false};
        let alt=Object.keys(hard).length===Object.keys(c.features||{}).length&&!c.audience?[]:ranked(rows,loose,base);
        // Antes de olvidar el público, se prueba sin los demás rasgos pero para el mismo público.
        if(!alt.length&&c.audience){alt=ranked(rows,{...c,features:{},anyColors:false},base);}
        if(!alt.length&&c.audience){
          // Nunca se enseña ropa del otro público ni infantil a quien pidió hombre o mujer.
          const other=c.audience==='Hombre'?'Mujer':c.audience==='Mujer'?'Hombre':null;
          alt=ranked(rows,{...loose,audience:null},base).filter(r=>!(other&&r.p.audience===other)&&!(c.audience!=='Infantil'&&childProduct(r))&&!(other&&new RegExp('\\b(?:'+(other==='Mujer'?'mujer|mujeres|women|ladies|nina':'hombre|hombres|men|caballero|nino')+')\\b').test(r.title)));
        }
        if(alt.length){matches=alt;relaxedNote=`No tengo ${describe(c,base)} exactamente; te enseño lo más parecido. `;}
      }
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
      const phrase=describe(c,base),intro=more?'Estas son otras opciones':['Estas fichas encajan','He encontrado estas opciones','Puedes empezar por estas fichas'][d.pageCount%3];
      d.pageCount++;
      const person=state.recipientContext?.label;
      const purpose=c.occasion&&eventById[c.occasion]?' para '+eventById[c.occasion]+(person&&c.occasion==='birthday'?' de tu '+person:''):'';
      const text=relaxedNote?relaxedNote+budgetNote(state.budget).trim():`${shown.length===1?'Hay una coincidencia':intro} en Velan’s${purpose}. Buscabas ${phrase}.`+budgetNote(state.budget);
      let quick=['Háblame del primero'];
      if(shown.length>1)quick.push('Compara los dos primeros');
      if(matches.length>3)quick.push('Enséñame otros');
      return answer(text,quick,shown.map(r=>internalCard(base,r.p,relaxedNote?'Lo más parecido que tengo.':`Coincide con ${phrase}.`)));
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
    function productQuestion(state,text,product) {
      const row=product&&byId.get(product.id);
      const asker=/^(?:(?:y|pero|entonces|vale)[, ]+)*(?:que|cual|puedo|le vale|la puedo|lo puedo|se puede|lleva|tiene|contiene|su|es|sirve|funciona|admite|cuanto)\w*\b/;
      if(!row||!asker.test(text)||/\b(?:busco|quiero ver|muestrame|ensename)\b/.test(text))return null;
      const relatedTopic=topics.find(([pattern,families])=>families.includes(product.family)&&pattern.test(text));
      const compatibility=/\b(?:funciona con (?:mi|el|una?)|compatib\w*|de fabrica|sirve (?:con|para mi)|me vale para (?:mi|el))\b/.test(text);
      const identification=/^(?:que clase de|que tipo de|que hace|para que sirve|que es (?:esto|este|esta))\b/.test(text);
      if(identification){
        return answer('La ficha de «'+product.title+'» '+(product.summary?'dice esto: '+product.summary:'solo publica su nombre y categoría. Para saber qué hace, comprueba la descripción del modelo.') ,['Ver su ficha'],[internalCard(base,product,'Artículo consultado.')]);
      }
      if(relatedTopic||compatibility){
        const next=relatedTopic?.[2]||(product.family==='Automoción'&&/\bcar[ -]?play\b/.test(row.evidence)?
          'Comprueba con el fabricante del adaptador si requiere CarPlay por cable de fábrica y si es compatible con el modelo y el año del coche.':
          'Comprueba la compatibilidad declarada por el fabricante para tu modelo exacto y su versión.');
        return answer('La ficha de «'+product.title+'» no confirma ese detalle. '+next,['Ver su ficha'],[internalCard(base,product,'Artículo consultado.')]);
      }
      return null;
    }
    function factual(state,text,product){
      if(!product)return null;
      const row=byId.get(product.id);if(!row)return null;
      const ask=/^(?:(?:y|pero|entonces|vale|o sea)[, ]+)*(?:este|esta|es |son |sirve|lleva|viene|tiene|tienen|incluye|cuant|de cuant|que |cual |se puede|cabe|me vale|y (?:su|el|la) )/.test(text)||/\b(?:que (?:potencia|capacidad)|cuantos? (?:litros|vatios)|dime (?:la|su|los)|confirmame)\b/.test(text);
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
      if(/\b(?:guard\w*|graba\w*|almacen\w*|ret[eie]n\w*|envi\w*)\b/.test(text)&&/\b(?:mi voz|audio|microfono|dictado|escribo|mis mensajes|conversacion)\b/.test(text)){
        return answer('La conversación escrita se conserva durante esta visita en la pestaña. Puedes borrarla con «Borrar». Si activas el dictado, el navegador puede procesar el audio con su servicio de reconocimiento. Velan’s recibe el texto reconocido para que lo revises antes de enviarlo.');
      }
      if(/\b(?:como (?:se financia|gana(?:is)? dinero)|monetiza\w*|como (?:se )?gana dinero|de donde (?:salen|vienen) (?:los |vuestros )?ingresos|(?:cobra(?:is|n)?|recib\w*) (?:una )?comisi[oó]n)\b/.test(text)){
        return answer('Velan’s puede recibir una comisión por las compras que cumplan las condiciones del programa de afiliación. La operación se completa en Amazon.');
      }
      if(supportQuestion.test(text)){
        const cancel=/\b(?:cancelo|anulo)\b/.test(text);
        const invoice=/\bfactura\b/.test(text);
        const detail=cancel?'Abre los detalles para ver si todavía aparece la opción de cancelar. Si ya se ha enviado, revisa las opciones que Amazon o el vendedor indiquen para ese pedido.':
          invoice?'Abre los detalles y busca la opción de factura. Si no aparece, comprueba si el pedido permite solicitarla al vendedor.':
          'Abre los detalles del pedido para ver su estado y el seguimiento que esté disponible.';
        return answer('Ve a «Mis pedidos» en la cuenta de Amazon con la que compraste. '+detail);
      }
      if(privateOrPolicy.test(text))return null;
      const queryName=nameQuery(raw);
      const titleMatches=names.get(queryName);
      if(titleMatches?.length===1){
        const product=titleMatches[0];
        if(!state.lastRecs?.includes(product.id))state.lastRecs=[product.id];
        return article(state,product);
      }
      if(titleMatches?.length>1){
        const shown=titleMatches.slice(0,3);
        state.lastRecs=shown.map(p=>p.id);
        return answer('Hay varias fichas con ese nombre. Abre una para identificar el artículo que buscabas.',
          ['Ver la primera ficha'],shown.map(p=>internalCard(base,p,'Coincidencia por nombre.')));
      }
      if(shopQualifier.test(text)||shopIntroduction.test(text)||shopGeneral.test(text))return overview();
      const introAndCheckout=/^(.+?) (?:y|tambien) (?=(?:como|donde|quien)\b)(.+)$/.exec(text);
      if(introAndCheckout&&[shopQualifier,shopIntroduction,shopGeneral].some(pattern=>pattern.test(introAndCheckout[1].replace(/,$/,'')))&&purchase.test(introAndCheckout[2])){
        const reply=overview();
        reply.text=reply.text.replace('La compra se completa en la tienda de cada producto.','La compra se completa en la tienda de cada producto. '+commercialCopy.replace('El pago se realiza en Amazon.','En los de Amazon, el pago se realiza en Amazon.').replace('En los de Amazon, el pago','El pago')+' En los de AliExpress, se paga en AliExpress.');
        return reply;
      }
      if(/^(?:que (?:presupuesto|tope|limite|importe) (?:te )?(?:dije|puse|marque|tengo)|cuanto (?:te dije|dije que podia gastar)|cual era (?:mi|el) (?:presupuesto|tope|limite))$/.test(text)){
        return answer(state.budget?.max!=null?'El límite que me indicaste fue de '+format(state.budget.max)+' €.'+budgetNote(state.budget):'Todavía no has indicado un presupuesto. Puedes decir «hasta 40 euros».',d.search?['Volver a las opciones']:[]);
      }
      if(/\b(?:agotad[oa]s?|queda(?:n)? (?:alguno|alguna|stock|unidades)|existencias|stock|(?:talla|la x[sl]|la l|la m|la s).{0,18}ahora mismo)\b/.test(text)&&!/\b(?:busco|quiero ver)\b/.test(text)){
        return answer('Puedes consultar la disponibilidad actual en Amazon. Si el artículo tiene variantes, selecciona allí la talla o el color antes de comprobar las existencias.',
          state.focusId||state.selectedProductId?['Ver su ficha']:[]);
      }
      if(/\b(?:mas sencill[oa]s?|mas facil|en cristiano|en pocas palabras|no lo entiendo)\b/.test(text)&&d.explanation){
        return answer(d.explanation,d.search?['Volver a las opciones']:[]);
      }
      if(socialEnd.test(text))return answer('¡Hasta pronto! Cuando quieras, seguimos con la selección de Velan’s.');
      const seasonalAsk=/\b(?:en estas fechas|por estas fechas|(?:esta|la) temporada|que (?:se lleva|pega) ahora|que (?:me )?recomiendas (?:ahora|hoy)|ideas (?:de|para) (?:esta epoca|estos dias)|que hay para (?:estas|las) fiestas)\b/.test(text);
      if(popularity.test(text))return answer('No dispongo de un ranking de ventas comprobado. Puedo enseñarte ideas de las fichas publicadas según la ocasión o el uso que les quieras dar.',seasonal.quick);
      let kind=kindFrom(text,base);
      if(d.search && /^(?:y |pero |al reves[, ]+|mejor |perdon[, ]+)*(?:sin |con |nada de |que (?:sea|tenga)|en (?:color|talla) |solo de )/.test(text) && !newSearch.test(text))kind=d.search.kind;
      const removeColour=/\b(?:me da igual|no importa|quita|olvida|cualquier) (?:el )?color\b/.test(text);
      const excludeBrand=/\b(?:cualquier[ao] menos|(?:todo|todas?|todos?) menos|excepto|sin la marca) \b/.test(text)&&Object.keys(brandHits(text)).length>0;
      if(d.search&&(removeColour||excludeBrand))kind=d.search.kind;
      if(d.search && kind==='top' && !/\b(?:ropa|prendas?|vestirme)\b/.test(text) && /manga/.test(text))kind=d.search.kind;
      const own=kind&&!kind.startsWith('base:');
      const refinements=readFeatures(text,kind||d.search?.kind);
      const shopping=newSearch.test(text)||!!kind||Object.keys(refinements).length>0;
      // Delivery vocabulary also appears in product names, such as a book or a shipping label.
      const logisticsRequest=/\b(?:cuando|como|donde|quien|cuanto|llegara|si lo pido|lo recibire|me llega|enviais|envian|haceis envios|portes|plazo de entrega|fecha de entrega)\b/;
      const mentionsPurchase=purchase.test(text)||/\b(?:puedo pagar|aceptais (?:tarjeta|paypal)|formas de pago|metodos de pago|como lo pido|donde se tramita el pedido)\b/.test(text);
      const mentionsDelivery=delivery.test(text)&&logisticsRequest.test(text);
      if(mentionsPurchase||mentionsDelivery){
        const tail=[mentionsPurchase&&commercialCopy,mentionsDelivery&&deliveryCopy].filter(Boolean).join(' ');
        const separated=raw.match(/^(.+?)(?:[,.!?¿]\s*|\s+y(?:\s+(?:dime|explicame|explícame))?\s+)(?=(?:¿?\s*)?(?:d[oó]nde|c[oó]mo|qui[eé]n|cu[aá]ndo|llegar|cu[aá]nto tarda))/i);
        if(separated&&shopping&&separated[1].trim().length>4){
          const part=separated[1].trim();
          if(!kindFrom(words(part),base)&&!newSearch.test(words(part)))return answer(tail);
          const reply=route(state,part)||base.respond(state,part);
          reply.text+=' '+tail;return reply;
        }
        const parts=raw.split(/\s+y\s+(?=(?:que|qué|de qué|de que|para qué|para que)\b)/i,2);
        if(parts.length===2&&[shopQualifier,shopIntroduction,shopGeneral].some(pattern=>pattern.test(words(parts[1])))){
          const reply=overview();reply.text+=' '+tail;return reply;
        }
        return answer(tail,state.lastRecs?.length?['Volver a las opciones','Ver la primera ficha']:[]);
      }
      if(activeRetail.test(text)&&!budget&&!seasonalAsk)return null;
      const explicit=referenced(text,state,base);
      // A distinctive abbreviated name can resolve a request for a specific fiche.
      if(/^(?:queria ver|quiero ver|abre(?:me)?|ver|ensename|muestrame) (?:la )?ficha\b/.test(text)&&/^[a-z0-9]{5,}$/.test(queryName)){
        const match=titleTokens.get(queryName);
        if(match)explicit.push(match);
      }
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
      const specific=productQuestion(state,text,product);
      if(specific)return specific;
      const guide=guideFor(text);
      if(guide){
        d.explanation=/bluetooth/.test(text)&&/ruido/.test(text)?'Bluetooth sirve para escuchar sin cable. La cancelación de ruido reduce el sonido de alrededor. Unos auriculares pueden tener las dos funciones.':null;
        return answer(guide,state.lastRecs?.length?['Volver a las opciones','Ver la primera ficha']:['Ver productos relacionados','Quiero un regalo']);
      }
      if(d.lastMetric==='power'&&/ruido|silencios/.test(text)&&product&&!newSearch.test(text)){
        return answer(`La potencia por sí sola no indica el ruido. `+(factual(state,'cuantos decibelios',product)?.text||'Haría falta una medición en decibelios.'),['Ver su ficha']);
      }
      if(/\b(?:compara\w*|comparativa|diferencias? (?:hay )?entre|en que se distinguen)\b/.test(text)&&!newSearch.test(text)){
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
      if(product&&(namedLink||/\b(?:explicame (?:este|esta)|hablame de|cuentame (?:mas|sobre)|ver (?:su|la (?:primera|segunda|tercera)) ficha|ver la ficha|ensename (?:este|esta)|dame (?:el )?enlace|pasame (?:el )?enlace|abre (?:su|la) ficha)\b/.test(text)||explicit.length&&(/enlace|ficha|quiero el|quiero la|me quedo/.test(text)||/^(?:y )?(?:el|la) (?:primer[oa]?|segund[oa]|tercer[oa]?)(?:,? (?:por favor|porfa|gracias))?$/.test(text)||/^(?:busco (?:el modelo )?)?[a-z0-9-]{4,}$/.test(text)))){
        if(namedLink&&!named&&!explicit.length)return null;
        return article(state,product);
      }
      const fact=factual(state,text,product);if(fact)return fact;
      if(/\b(?:quien escribio|capital de|quien gano el partido|que hora es|politica internacional|resultado del partido|(?:cuenta(?:me)?|dime) (?:un chiste|una receta)|que tiempo (?:hace|hara))\b/.test(text))return answer('Mi especialidad son las compras y las guías de Velan’s. Puedo ayudarte a elegir un artículo, comparar fichas o retomar tu búsqueda.',d.search?['Volver a las opciones']:themes.open);
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
      if(d.search && /(?:no me gusta ninguno|ningun[oa] me (?:gusta|encaja)|otros? (?:distint|diferent)|(?:esos|estos) no me convencen|tienes otros|descarto (?:esos|estos|todos)|otras opciones|(?:muestrame|ensename|dame|ver|busca) (?:mas|otr[oa]s?)|algo parecido)/.test(text)&&!own)return list(state,d.search,{more:true});
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
      if(occasion&&correcting&&kind==='coffee'&&state.recipientContext?.label){
        const c=freshSearch('coffee');c.occasion=occasion[0];remember(d,c);return list(state,c);
      }
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
        if(removeColour){
          for(const key of Object.keys(c.features))if(key.startsWith('color:'))delete c.features[key];
          c.anyColors=false;
        }
        setFeatures(c,refinements,correcting);
        if(currentKind==='bag'){
          const amount=/\b(?:(?:de )?(al menos|minimo|hasta|maximo|como mucho|menos de|mas de) )?(\d+(?:[.,]\d+)?)\s*(?:l|litros?)\b/.exec(numericText(text));
          if(amount){
            const value=Number(amount[2].replace(',','.'));
            const operator={'al menos':'ge',minimo:'ge',hasta:'le',maximo:'le','como mucho':'le','menos de':'lt','mas de':'gt'}[amount[1]]||'eq';
            c.capacity={value,operator,label:(amount[1]?amount[1]+' ':'')+format(value)+' L'};
          }
        }
        if(/(?:\bo\b|\/)/.test(text)&&Object.keys(refinements).filter(k=>k.startsWith('color:')).length>1)c.anyColors=true;
        Object.assign(c.brands,brandHits(text));c.audience=explicitAudience(text)||c.audience;
        if(/\b(?:cualquier|me da igual|no importa|quita|olvida) (?:la )?talla\b/.test(text))c.size=null;
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
    function cardsFrom(list,reason){return list.slice(0,3).map(row=>internalCard(base,row.p,reason(row.p)));}
    // Devuelve una respuesta, false (= seguir con el texto canónico en state.__canonical) o null (= flujo normal).
    function preRoute(state,raw,scope){
      index();
      state.__canonical=null;
      let text=words(raw).replace(leadFill,'').replace(/[.,]+/g,' ').replace(/\s+/g,' ').trim();
      if(!text)return null;
      if(/\b(?:pag\w*|envios?|pedidos?|devoluc\w*|garantia|factura|como (?:se )?compr\w*|cobr\w*)\b/.test(text))return null; // pago y pedidos: los resuelve el flujo de siempre
      const kind=kindFrom(text,base);
      const dept=deptWords.find(([,rx])=>rx.test(text));
      // 1) Lo más vendido / ofertas: con datos reales de AliExpress.
      if(bestRx.test(text)||(offerRx.test(text)&&(!kind||kind.startsWith('family:')||dept))){
        const best=bestRx.test(text);
        const label=best?'lo más vendido':'las mayores rebajas';
        // Sin tienda elegida por el cliente, se usan los datos reales de AliExpress aunque esté viendo Amazon.
        if(!state.store&&scope==='Amazon'&&base.setStoreScope){base.setStoreScope(null);index();}
        let pool=rows.filter(r=>r.p.store==='AliExpress'&&(!dept||r.p.family===dept[0]));
        if(kind&&!kind.startsWith('family:'))pool=pool.filter(r=>typeMatch(r,kind,base));
        if(kind&&kind.startsWith('family:')&&!dept)pool=pool.filter(r=>r.p.family===kind.slice(7));
        if(!pool.length){
          if(scope==='Amazon'||!rows.some(r=>r.p.store==='AliExpress'))return answer(`De los productos de Amazon no tenemos datos propios de ventas ni de ofertas: el precio y las promociones los marca Amazon en cada ficha.${rows.length?' En AliExpress sí tengo esos datos. ¿Quieres verlos?':''}`,[best?'Lo más vendido en AliExpress':'Rebajas de AliExpress','Ver tecnología','Quiero un regalo']);
          return answer(`Ahora no tengo ${label} de esa categoría. ¿Miramos otra?`,['Lo más vendido','Ver moda','Ver tecnología']);
        }
        pool=[...pool].sort((a,b)=>best?(soldOf(b.p)-soldOf(a.p))||(offOf(b.p)-offOf(a.p)):(offOf(b.p)-offOf(a.p))||(soldOf(b.p)-soldOf(a.p)));
        state.lastRecs=pool.slice(0,3).map(r=>r.p.id);state.focusId=state.lastRecs[0];
        const where=dept?` de ${dept[0]==='Hogar'?'hogar y cocina':dept[0].toLowerCase()}`:'';
        const note=scope==='Amazon'&&!state.store?'De los productos de Amazon no tenemos datos de ventas ni ofertas propios; ':'';
        const lead=best?`sto es lo más vendido${where} en AliExpress`:`stas son las mayores rebajas${where} en AliExpress`;
        return answer(`${note}${note?'e':'E'}${lead} ahora mismo (datos de AliExpress, se actualizan cada día):`,
          ['Enséñame otros','Compara los dos primeros',best?'Rebajas de AliExpress':'Lo más vendido'],
          cardsFrom(pool,p=>best?`${soldOf(p).toLocaleString('es-ES')} vendidos · −${offOf(p)} %`:`−${offOf(p)} % · ${soldOf(p).toLocaleString('es-ES')} vendidos`));
      }
      // 2) «¿Qué puedo comprar?», «qué tenéis», «qué categorías hay»… con palabras de más.
      if(/^(?:ensename|muestrame|ver|dame|quiero ver|ensename|ensenam?e) (?:todo|todos los productos|todo el catalogo|el catalogo|todo lo que hay|todo lo que teneis|todo lo que tienes)$/.test(text))return overview();
      if(!kind&&!dept&&askTail.test(text.replace(softFiller,' ').replace(/\s+/g,' ').trim()))return overview();
      if(askCatalogue.test(text)&&!(kind&&!kind.startsWith('family:'))&&!dept)return overview();
      const bare=text.replace(fillerWords,' ').replace(/\s+/g,' ').trim();
      if(!bare&&/\b(?:puedo|hay|teneis|tienes|vendeis|vendes|ofreces|ofreceis|comprar)\b/.test(text))return overview();
      // 3) Departamentos con palabras de más: «productos de belleza», «llévame a la sección de tecnología», «algo para el gimnasio».
      if(dept){
        const rest=bare.replace(dept[1],' ').replace(new RegExp(deptGo.source,'g'),' ').replace(/\b(?:a|al|ir)\b/g,' ').replace(/\s+/g,' ').trim();
        if(!rest||/^(?:y|o)$/.test(rest)){
          const key=fold(dept[0]);
          state.__canonical='ver '+(key==='hogar'?'hogar':key==='automocion'?'automocion':key);
          if(deptGo.test(text)){
            const reply=respondCanonical(state,state.__canonical);
            if(reply){reply.navCategory=dept[0];reply.text='Te llevo a '+(dept[0]==='Hogar'?'Hogar y cocina':dept[0])+'. '+reply.text;}
            return reply||false;
          }
          return false;
        }
      }
      // 4) Cortesías y verbos de deseo que no son parte del producto: «me encantaría ver bolsos» → «bolsos».
      const soft=text.replace(softFiller,' ').replace(/\s+/g,' ').trim();
      if(soft&&soft!==text){state.__canonical=soft;return false;}
      return null;
    }
    function respondCanonical(state,text){
      const reply=route(state,text)||base.respond(state,text);
      return reply&&reply.cards?.length?reply:null;
    }
    function respond(state,raw){
      let input=String(raw||'').trim().slice(0,600);
      const initialTurnsPre=state.turns;
      if(base.detectSensitive(input).length)return base.respond(state,input);
      // Lenguaje coloquial: «juega a la play», «frío en los pies», «la piel de la cara»… → términos del catálogo.
      if(base.rewrite)input=base.rewrite(words(input)).trim()||input;
      // Tienda elegida por el cliente (se recuerda) o, si no ha elegido, la tienda que está viendo.
      const si=storeIntent(input);
      const before=state.store||null;
      if(si.set)state.store=si.set==='both'?null:si.set;
      const scope=state.store||(si.set==='both'?null:state.viewStore)||null;
      if(base.setStoreScope)base.setStoreScope(scope);
      const changed=si.set&&(state.store||null)!==before;
      const switchTo=si.set&&si.set!=='both'?si.set:null;
      if(si.set&&si.only&&state.lastQuery&&!si.go){input=state.lastQuery;}
      else if(si.set&&si.only){
        if(state.turns!==undefined)state.turns++;
        const text=si.set==='both'
          ?'Perfecto, a partir de ahora te enseño productos de Amazon y de AliExpress. ¿Qué buscas?'
          :`Hecho: a partir de ahora solo te enseño productos de ${storeLabel(si.set)} y lo recordaré durante la conversación.${si.go?` Te llevo a la tienda ${storeLabel(si.set)}.`:''} ¿Qué buscas?`;
        const reply=answer(text,si.set==='AliExpress'?['Ver tecnología','Quiero un regalo','Solo Amazon','Las dos tiendas']:si.set==='Amazon'?['Ver tecnología','Quiero un regalo','Solo AliExpress','Las dos tiendas']:['Ver tecnología','Quiero un regalo','Solo Amazon','Solo AliExpress']);
        reply.quick=[...new Set(reply.quick)];
        if(switchTo&&(si.go||state.viewStore!==switchTo))reply.storeSwitch=switchTo;
        state.lastRecs=[];
        return reply;
      }
      if(si.set&&si.clean)input=si.clean;
      const pre=preRoute(state,input,scope);
      if(pre){
        if(state.turns===undefined||state.turns===initialTurnsPre)state.turns=(state.turns||0)+1;
        if(changed&&state.store)pre.text=`Vale, te enseño solo productos de ${storeLabel(state.store)} (lo recordaré). `+pre.text;
        if(switchTo&&si.go)pre.storeSwitch=switchTo;
        pre.cards=(pre.cards||[]).map(c=>({...c,store:byId.get(c.id)?.p.store||'Amazon'}));
        pre.quick=[...new Set(pre.quick||[])].slice(0,4);
        if(pre.cards.length)state.lastQuery=input;
        return pre;
      }
      if(pre===false)input=state.__canonical||input;
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
      if(!reply.cards?.length&&/^(?:no estoy seguro de haberte entendido|no encuentro una)/i.test(reply.text)){
        const dept=deptWords.find(([,rx])=>rx.test(words(input)));
        if(dept){const alt=respondCanonical(state,'ver '+fold(dept[0]));if(alt)reply=alt;}
      }
      if(!reply.cards?.length&&/^(?:no estoy seguro de haberte entendido|no encuentro una coincidencia)/i.test(reply.text)){
        // Palabras de más: se quitan las de relleno y se intenta otra vez con lo esencial.
        const essential=words(input).replace(fillerWords,' ').replace(/\s+/g,' ').trim();
        if(essential&&essential!==words(input)){
          const retry=route(state,essential)||base.respond(state,essential);
          if(retry&&retry.cards?.length&&!/^(?:no estoy seguro|no encuentro)/i.test(retry.text))reply=retry;
        }
      }
      if(state.turns===initialTurns)state.turns++;
      reply.cards=(reply.cards||[]).filter(c=>byId.has(c.id)).map(c=>{const {affiliateUrl,...card}=c;return {...card,store:byId.get(c.id).p.store||'Amazon'};});
      if(changed&&state.store)reply.text=`Vale, te enseño solo productos de ${storeLabel(state.store)} (lo recordaré). `+reply.text;
      else if(changed&&!state.store)reply.text='Vale, busco en Amazon y en AliExpress. '+reply.text;
      if(!reply.cards.length&&scope&&/no (?:encuentro|tengo|he encontrado)/i.test(reply.text)){
        reply.text+=` Ahora mismo miro solo en ${storeLabel(scope)}.`;
        reply.quick=[...new Set([scope==='Amazon'?'Buscar también en AliExpress':'Buscar también en Amazon',...(reply.quick||[])])].slice(0,4);
      }
      if(reply.cards.length&&scope)reply.store=scope;
      if(reply.cards.length)state.lastQuery=input;
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
    // Si con todas las condiciones no hay nada, se busca por la palabra principal (AliExpress
    // no trae la clasificación fina por tipo de artículo que tenía el catálogo antiguo).
    const FILLER=new Set('quiero queria busco buscando algo alguna alguno algun para pero como unos unas cosa cosas regalo regalar tengo necesito mirar ensename ensenarme dame tienes hay barato barata bueno buena mejor mio mia comprar compra'.split(' '));
    function respondWithFallback(state,raw){
      const reply=respond(state,raw);
      if(!reply||(reply.cards&&reply.cards.length)||!/No encuentro en el catálogo/i.test(reply.text||''))return reply;
      const pre=((reply.text||'').match(/^Vale, te enseño solo productos de [^.]+\. /)||[''])[0];
      const words=fold(String(raw||'')).split(/[^a-z0-9ñ]+/).filter(w=>w.length>3&&!FILLER.has(w));
      for(const w of words){
        const probe={...base.newState(),store:state.store,viewStore:state.viewStore};
        const alt=respond(probe,w);
        if(alt&&alt.cards&&alt.cards.length){
          alt.text=pre+`Esto es lo que tengo relacionado con «${w}»:`;
          state.lastQuery=w;state.lastRecs=probe.lastRecs;
          return alt;
        }
      }
      // Último recurso: buscar la palabra en el nombre de las ofertas.
      const cat=base.realCatalog?base.realCatalog():[];
      for(const w of words){
        let raiz=w.replace(/(es|s)$/,'');if(raiz.length<4)raiz=w;
        const tienda=state.store||state.viewStore||null;
        const hits=cat.filter(p=>fold(p.title).includes(raiz)&&(!tienda||(p.store||'Amazon')===tienda)).slice(0,4);
        if(hits.length){
          const cards=hits.map(p=>({id:p.id,siteId:p.siteId,title:p.title,summary:p.summary,attrs:[p.category].filter(Boolean),reason:`Coincide con lo que buscas: ${w}.`,warnings:[],internalUrl:null,status:'VERIFICADO',store:p.store||'AliExpress'}));
          state.lastQuery=w;state.lastRecs=hits.map(p=>p.id);
          return {text:pre+`Esto es lo que tengo relacionado con «${w}»:`,cards,quick:['Ver tecnología','Quiero un regalo']};
        }
      }
      return reply;
    }
    return {...base,respond:respondWithFallback,greeting,season,setSelected};
  }
  root.VelansDialogue={create:createDialogue};

})(typeof window === 'undefined' ? globalThis : window);
