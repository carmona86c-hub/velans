/* Clasificador local orientativo basado en departamentos de Amazon.es.
   Las categorías oficiales definitivas solo pueden verificarse con datos autorizados de Amazon. */
(function () {
  'use strict';

  const departments = [
    'Sin clasificar', 'Moda', 'Zapatos y complementos', 'Bolsos y accesorios',
    'Relojes', 'Joyería', 'Belleza', 'Salud y cuidado personal', 'Bebé',
    'Informática', 'Electrónica', 'Videojuegos', 'Software',
    'Hogar y cocina', 'Jardín', 'Bricolaje y herramientas',
    'Grandes electrodomésticos', 'Deportes y aire libre', 'Juguetes y juegos',
    'Coche y moto', 'Productos para mascotas', 'Oficina y papelería',
    'Alimentación y bebidas', 'Libros', 'Equipaje', 'Iluminación',
    'Instrumentos musicales', 'Industria y ciencia', 'Otros'
  ];
  const velansSections = [
    ['moda-mujer', 'Moda mujer'], ['moda-hombre', 'Moda hombre'],
    ['calzado', 'Calzado'], ['relojes', 'Relojes'],
    ['bolsos', 'Bolsos y accesorios'], ['belleza', 'Belleza'],
    ['hogar', 'Hogar'], ['cocina', 'Cocina'], ['tecnologia', 'Tecnología']
  ];

  const rules = [
    {dept:'Bebé', sub:'Ropa y accesorios de bebé', words:['neopreno para bebe','traje de neopreno para bebe','ropa bebe','ropa para bebe','pelele','body bebe','bodies bebe','pañal','cuna','carrito bebe','cochecito bebe','biberon','chupete']},
    {dept:'Zapatos y complementos',sub:'Zapatillas',words:['sneaker','sneakers','zapatillas','deportivas','tenis para correr','running shoes','st runner']},
    {dept:'Zapatos y complementos',sub:'Botas y calzado',words:['botas','botines','zapatos','sandalias','mocasines','chanclas','tacones']},
    {dept:'Bolsos y accesorios',sub:'Bolsos y bandoleras',words:['bolso','bolsa de mensajero','bandolera','bolsa de hombro','messenger bag','handbag']},
    {dept:'Bolsos y accesorios',sub:'Carteras y pequeños accesorios',words:['cartera','monedero','billetera','tarjetero','cinturon','bufanda','gorro']},
    {dept:'Relojes',sub:'Relojes inteligentes',words:['smartwatch','reloj inteligente']},
    {dept:'Relojes',sub:'Relojes de pulsera',words:['reloj','watch','cronografo']},
    {dept:'Joyería',sub:'Joyas',words:['pendientes','collar','pulsera joya','anillo','joyeria']},
    {dept:'Belleza',sub:'Cuidado facial',words:['mascarilla facial','mascara facial','serum facial','crema facial','contorno de ojos','hidratante rostro']},
    {dept:'Belleza',sub:'Cuidado capilar',words:['mascarilla capilar','champu','acondicionador','tinte cabello','secador pelo','plancha de pelo']},
    {dept:'Salud y cuidado personal',sub:'Protección e higiene',words:['mascarilla quirurgica','mascarilla ffp2','mascarilla ffp3','mascarilla protectora','jabon de baño','jabon para el baño','jabon para baño','jabon corporal','gel de ducha','gel de baño','desodorante','cepillo de dientes']},
    {dept:'Belleza',sub:'Maquillaje y cosmética',words:['maquillaje','labial','pintalabios','rimel','base maquillaje','esmalte de uñas','perfume','fragancia']},
    {dept:'Informática',sub:'Ordenadores portátiles',words:['portatil','laptop','notebook','macbook','chromebook']},
    {dept:'Informática',sub:'Ordenadores y componentes',words:['ordenador','pc gaming','tarjeta grafica','gpu','procesador','placa base','memoria ram','disco ssd','ssd nvme','sobremesa']},
    {dept:'Informática',sub:'Monitores y periféricos',words:['monitor','teclado','raton gaming','mouse gaming','impresora','escaner','webcam']},
    {dept:'Videojuegos',sub:'Consolas y videojuegos',words:['playstation','nintendo switch','xbox','videojuego','consola']},
    {dept:'Electrónica',sub:'Móviles y telefonía',words:['smartphone','telefono movil','iphone','samsung galaxy','tablet','telefono inteligente']},
    {dept:'Electrónica',sub:'Audio y sonido',words:['auriculares','altavoces','soundbar','barra de sonido','microfono','headphones']},
    {dept:'Electrónica',sub:'Fotografía y televisión',words:['television','smart tv','camara digital','proyector','camara fotos']},
    {dept:'Jardín',sub:'Barbacoas y exterior',words:['barbacoa','bbq','barbecue','parrilla','brasero de jardin']},
    {dept:'Jardín',sub:'Jardinería',words:['cortacesped','manguera jardin','tijeras de podar','macetero','jardineria']},
    {dept:'Coche y moto',sub:'Accesorios de automoción',words:['coche','automovil','moto','motocicleta','limpiaparabrisas','neumaticos','arrancador bateria']},
    {dept:'Bricolaje y herramientas',sub:'Herramientas',words:['taladro','destornillador','llave inglesa','amoladora','sierra circular','herramientas','atornillador']},
    {dept:'Grandes electrodomésticos',sub:'Lavado y refrigeración',words:['lavadora','lavavajillas','frigorifico','nevera','secadora','congelador']},
    {dept:'Hogar y cocina',sub:'Pequeños electrodomésticos de cocina',words:['cafetera','freidora de aire','air fryer','tostadora','microondas','batidora','robot cocina']},
    {dept:'Hogar y cocina',sub:'Hogar y decoración',words:['sofa','lampara','alfombra','edredon','funda nordica','aspiradora','cojin','decoracion']},
    {dept:'Deportes y aire libre',sub:'Equipamiento deportivo',words:['mancuernas','pesas','esterilla yoga','bicicleta','raqueta','tienda de campaña','botella deportiva']},
    {dept:'Juguetes y juegos',sub:'Juguetes infantiles',words:['lego','juguete','puzzle','peluche','muñeca','juego de mesa']},
    {dept:'Productos para mascotas',sub:'Cuidado de mascotas',words:['comida perro','comida gato','arenero','correa perro','rascador gato','pienso mascotas']},
    {dept:'Oficina y papelería',sub:'Material de oficina',words:['boligrafo','cuaderno','agenda','grapadora','archivador','papeleria']},
    {dept:'Alimentación y bebidas',sub:'Alimentos y bebidas',words:['cafe en grano','te verde','aceite oliva','chocolate','galletas','bebida']},
    {dept:'Libros',sub:'Libros',words:['novela','libro','edicion bolsillo','libros de']},
    {dept:'Moda',sub:'Pantalones',words:['pantalones','pantalon','vaqueros','jeans','leggings','chino slim']},
    {dept:'Moda',sub:'Polos',words:['polo','jjepaulos']},
    {dept:'Moda',sub:'Camisetas',words:['camiseta','t-shirt','tshirt']},
    {dept:'Moda',sub:'Sudaderas',words:['sudadera','hoodie']},
    {dept:'Moda',sub:'Camisas y blusas',words:['camisa','blusa']},
    {dept:'Moda',sub:'Vestidos y faldas',words:['vestido','falda']},
    {dept:'Moda',sub:'Ropa y accesorios',words:['ropa','chaqueta','abrigo','jersey','sweater','chandal']}
  ];

  // Segunda cobertura: sin alterar las reglas tradicionales que ya funcionan.
  const extraRules = [
    {dept:'Equipaje',sub:'Maletas y equipaje de viaje',words:['maleta','maleta de cabina','equipaje','trolley','suitcase']},
    {dept:'Bolsos y accesorios',sub:'Mochilas y bolsos de mano',words:['mochila','backpack','back pack','tote bag','crossbody','satchel','llavero']},
    {dept:'Bebé',sub:'Crianza y accesorios de bebé',words:['hamaca para bebe','ergobaby','trona','baby monitor','recien nacido']},
    {dept:'Moda',sub:'Camisetas y tops',words:['t shirt','tee','shirt','top deportivo','polo shirt']},
    {dept:'Moda',sub:'Sudaderas y punto',words:['sweatshirt','fleece','forro polar','knit','pullover','cardigan','polar']},
    {dept:'Moda',sub:'Chaquetas y abrigos',words:['jacket','coat','blazer','bomber','chaleco','plumifero','cazadora']},
    {dept:'Moda',sub:'Ropa interior y pijamas',words:['boxer','calzoncillo','calcetines','pijama','sujetador']},
    {dept:'Zapatos y complementos',sub:'Calzado',words:['sandalia','zapatilla','sneaker','trainers','shoe','clog','zuecos','slippers']},
    {dept:'Relojes',sub:'Relojes de pulsera',words:['orologio','quartz watch','automatic watch','reloj analogico','relojes']},
    {dept:'Belleza',sub:'Cuidado facial',words:['serum','peptide','retinol','cosrx','revitalift','hyaluron','mascara de pestanas']},
    {dept:'Belleza',sub:'Cuidado capilar',words:['hair dryer','secador de pelo','champu seco','spray de pelo','moroccanoil']},
    {dept:'Belleza',sub:'Afeitado y depilación',words:['oneblade','afeitadora','depiladora','recortadora','gel de afeitar']},
    {dept:'Salud y cuidado personal',sub:'Higiene personal',words:['pasta de dientes','dentifrico','cepillo de dientes','protector solar']},
    {dept:'Informática',sub:'Redes y conexiones',words:['router','mesh wifi','wifi de malla','hub usb','usb c','fuente de alimentacion']},
    {dept:'Electrónica',sub:'Seguridad y cámaras',words:['camara vigilancia','camara de vigilancia','cctv','mirilla electronica','videoportero','tapo c','ezviz']},
    {dept:'Electrónica',sub:'Smart TV y streaming',words:['fire tv','tv stick','streaming','televisor','televisores']},
    {dept:'Electrónica',sub:'Relojes inteligentes y wearables',words:['smart glasses','smartwatch','reloj inteligente','pulsera inteligente']},
    {dept:'Hogar y cocina',sub:'Limpieza y aspiración',words:['aspiradora','aspirador','friegasuelos','roborock','dreame','eufy']},
    {dept:'Hogar y cocina',sub:'Cocina y utensilios',words:['escurridor','cuchillos','sarten','placa de induccion','temporizador de cocina','especiero','rollos de cocina']},
    {dept:'Hogar y cocina',sub:'Muebles y decoración',words:['escritorio','silla de oficina','perchero','estanteria','organizador','ambientador','difusor']},
    {dept:'Iluminación',sub:'Lámparas y ventiladores de techo',words:['ventilador de techo','luz led','lampara led','tira led']},
    {dept:'Bricolaje y herramientas',sub:'Instalaciones y ferretería',words:['varilla roscada','anclajes quimicos','destornillador','regleta schuko','carrete de cable']},
    {dept:'Juguetes y juegos',sub:'Juegos y figuras',words:['funko','playmobil','monster high','minecraft','figura coleccionable','muneca','casa de munecas']},
    {dept:'Oficina y papelería',sub:'Papelería y escritorio',words:['bloc de notas','notas adhesivas','cuaderno','boligrafo','agenda escolar']},
    {dept:'Deportes y aire libre',sub:'Fitness y senderismo',words:['senderismo','botella mezcladora','proteinas','fitness','mochila de senderismo']},
    {dept:'Alimentación y bebidas',sub:'Bebidas y consumibles',words:['caramelos','snack','galletas','chocolate','bebida energetica']},
    {dept:'Moda',sub:'Pantalones y monos',words:['pants','trousers','chino trousers','mono largo','flare pants','hr flare','boot pants']},
    {dept:'Moda',sub:'Chándales y ropa deportiva',words:['track suit','tracksuit','tricot track','cortavientos']},
    {dept:'Moda',sub:'Ropa interior y calcetines',words:['sock','socks','sock 5 pack']},
    {dept:'Moda',sub:'Vestidos',words:['dress','womens dress']},
    {dept:'Zapatos y complementos',sub:'Calzado',words:['shoes','calzado deportivo','plantillas gel','plantillas para calzado']},
    {dept:'Equipaje',sub:'Maletas y viaje',words:['juego de maletas']},
    {dept:'Bricolaje y herramientas',sub:'Sierra y herramientas',words:['sierra de arco','sierra para metal','stanley sierra']},
    {dept:'Bricolaje y herramientas',sub:'Pintura y reparaciones',words:['pistola pintura','pintura electrica','adhesivo sellador','kit de fijacion','cinta adhesiva','cinta rollo hook','pattex']},
    {dept:'Hogar y cocina',sub:'Armarios y almacenaje',words:['sistema de cajones','cajon organizador','metalbox']},
    {dept:'Hogar y cocina',sub:'Climatización y aire',words:['purificador de aire','filtro hepa']},
    {dept:'Hogar y cocina',sub:'Botellas y menaje',words:['botella de agua','botella antifugas']},
    {dept:'Hogar y cocina',sub:'Papel y consumibles',words:['papel higienico','rollos extra grandes','colhogar']},
    {dept:'Hogar y cocina',sub:'Decoración festiva',words:['arbol de navidad','adorno navideno']},
    {dept:'Hogar y cocina',sub:'Limpieza y aspiración',words:['roomba','irobot','robot aspirador']},
    {dept:'Jardín',sub:'Accesorios de terraza',words:['funda sombrilla','funda parasol','sombrilla excentrico']},
    {dept:'Deportes y aire libre',sub:'Detectores y exploración',words:['detector de metales']},
    {dept:'Deportes y aire libre',sub:'Pesca',words:['cana y carrete','carrete de pesca','abu garcia max']},
    {dept:'Deportes y aire libre',sub:'Fitness y recuperación',words:['plataforma vibratoria','poc omne','casco mips']},
    {dept:'Bebé',sub:'Triciclos y paseos',words:['triciclo infantil','triciclo para bebe']},
    {dept:'Juguetes y juegos',sub:'Figuras y juegos de mesa',words:['bluey','bitzee','mattel games','juego saber ancestral','palabreando','juego de fiesta','star wars the black series']},
    {dept:'Salud y cuidado personal',sub:'Ojos y botiquín',words:['colirio','optrex','traumeel','spray frio']},
    {dept:'Belleza',sub:'Cuidado facial',words:['skin care','cream for face','bean cream','face cream']},
    {dept:'Belleza',sub:'Depilación',words:['lumea','depilacion ipl']},
    {dept:'Belleza',sub:'Fragancias',words:['rituals wild fig','private collection 110 ml']},
    {dept:'Electrónica',sub:'Pilas y alimentación',words:['pilas alcalinas','duracell plus aa']},
    {dept:'Electrónica',sub:'Foto y vídeo',words:['luz de relleno','luz para video','ulanzi vl49']},
    {dept:'Coche y moto',sub:'Conectividad en automóvil',words:['carplay','android auto','dongle de coche']},
    {dept:'Coche y moto',sub:'Ambientadores y accesorios',words:['hanging car air freshener','armor all podium']}
  ];

  function clean(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function hasPhrase(haystack, word) {
    const needle=clean(word);return needle && (' '+haystack+' ').includes(' '+needle+' ');
  }
  function audience(title) {
    const t=clean(title);
    if (['bebe','baby','infantil','ninos','ninas','kids','toddler','junior','youth','boys','girls'].some(x=>hasPhrase(t,x)))return 'Infantil';
    if (['unisex'].some(x=>hasPhrase(t,x)))return 'Unisex';
    if (['mujer','women','womens','woman','ladies','femenino','senora'].some(x=>hasPhrase(t,x)))return 'Mujer';
    if (['hombre','men','mens','male','caballero','masculino'].some(x=>hasPhrase(t,x)))return 'Hombre';
    return 'Sin especificar';
  }
  function sectionFor(department, target) {
    if (department==='Moda')return target==='Mujer'?'moda-mujer':target==='Hombre'?'moda-hombre':'';
    if (department==='Zapatos y complementos')return 'calzado';
    if (department==='Bolsos y accesorios')return 'bolsos';
    if (department==='Relojes')return 'relojes';
    if (['Belleza','Salud y cuidado personal'].includes(department))return 'belleza';
    if (department==='Hogar y cocina')return 'cocina';
    if (['Informática','Electrónica','Videojuegos','Software'].includes(department))return 'tecnologia';
    if (['Jardín','Bricolaje y herramientas','Grandes electrodomésticos','Iluminación'].includes(department))return 'hogar';
    return '';
  }
  function classify(title, description) {
    const t=clean(title);
    const target=audience(title);
    const match=[...rules,...extraRules].find(rule=>rule.words.some(word=>hasPhrase(t,word)));
    if(!match)return {department:'Sin clasificar',subcategory:'',audience:target,velansSection:'',confidence:'pendiente'};
    return {department:match.dept,subcategory:match.sub,audience:target,velansSection:sectionFor(match.dept,target),confidence:'sugerida'};
  }

  // Ruta interna de la NUEVA tienda, no una confirmación de que exista en velans.es.
  function destinationFor(department,sub,aud){
    const targets={
      'Moda':'Moda','Zapatos y complementos':'Moda','Bolsos y accesorios':'Moda','Relojes':'Moda','Joyería':'Moda','Equipaje':'Moda',
      'Informática':'Tecnología','Electrónica':'Tecnología','Videojuegos':'Tecnología','Software':'Tecnología',
      'Hogar y cocina':'Hogar','Grandes electrodomésticos':'Hogar','Iluminación':'Hogar',
      'Belleza':'Belleza','Salud y cuidado personal':'Belleza','Bricolaje y herramientas':'Bricolaje','Jardín':'Hogar',
      'Juguetes y juegos':'Infantil','Bebé':'Infantil','Deportes y aire libre':'Deportes',
      'Coche y moto':'Otros','Oficina y papelería':'Otros','Alimentación y bebidas':'Otros',
      'Productos para mascotas':'Otros','Instrumentos musicales':'Otros','Industria y ciencia':'Otros','Libros':'Otros','Otros':'Otros'
    };
    const category=targets[department]||'';
    if(!category)return null;
    const who=category==='Moda'?aud||'Sin especificar':'';
    const module=sub||'Otros artículos';
    return {category,audience:who,module,display:[category,who,module].filter(Boolean).join(' › ')};
  }

  // Evidencias semánticas reales. Un ASIN opaco o una foto sin metadatos NO revelan la categoría.
  function classifyOffer(offer={},context={}){
    const entries=[
      {source:'título',value:offer.title,weight:8},
      {source:'descripción del producto',value:offer.description,weight:4},
      {source:'mensaje del canal',value:offer.text,weight:2},
      {source:'texto del enlace',value:offer.urlTitleHint,weight:3},
      {source:'etiqueta de imagen',value:offer.imageAlt,weight:4},
      {source:'categoría aportada',value:offer.categoryHint,weight:4},
      {source:'catálogo fotográfico',value:context.catalogPhoto?.title,weight:5},
      {source:'fabricante o modelo',value:[context.catalogPhoto?.brand,context.catalogPhoto?.model].filter(Boolean).join(' '),weight:2}
    ].filter(e=>typeof e.value==='string'&&e.value.trim());
    const votes=new Map();
    for(const e of entries){
      const match=classify(e.value);
      if(match.department==='Sin clasificar')continue;
      const vote=votes.get(match.department)||{department:match.department,subcategory:match.subcategory,score:0,sources:[],audience:'Sin especificar'};
      vote.score+=e.weight;vote.sources.push(e.source);
      if(e.source==='título'||(!vote.subcategory&&match.subcategory))vote.subcategory=match.subcategory;
      if(vote.audience==='Sin especificar'&&match.audience!=='Sin especificar')vote.audience=match.audience;
      votes.set(match.department,vote);
    }
    const ranked=[...votes.values()].sort((a,b)=>b.score-a.score);
    const first=ranked[0],second=ranked[1];
    const conflict=Boolean(first&&second&&second.score>=first.score-2);
    const confidence=!first||conflict?'pendiente':'sugerida';
    const certainty=!first?'sin datos':conflict?'dudosa':first.score>=12&&first.sources.length>1?'alta':first.score>=7?'media':'baja';
    const target=audience(offer.title)||'Sin especificar';
    const aud=target!=='Sin especificar'?target:first?.audience||'Sin especificar';
    const department=conflict?'Sin clasificar':first?.department||'Sin clasificar';
    const subcategory=conflict?'':first?.subcategory||'';
    const route=destinationFor(department,subcategory,aud);
    return {
      department,subcategory,audience:aud,velansSection:sectionFor(department,aud),
      confidence,certainty,route,
      evidence:first?.sources||[],
      conflict:conflict?ranked.slice(0,2).map(x=>x.department):[],
      requiresReview:!route||certainty!=='alta'||conflict,
      analysis:'Se han contrastado únicamente textos y metadatos disponibles. No se han leído los píxeles de ninguna fotografía ni consultado Amazon.'
    };
  }

  window.VelansCatalog={departments,velansSections,classify,classifyOffer,destinationFor,sectionFor,audience};
})();
