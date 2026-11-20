/* Clasificación orientativa a partir del título, sin inventar atributos del producto. */
(function(){
  'use strict';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const test=(title,re)=>re.test(title);
  const patterns=[
    ['Infantil',/\b(bebe|bebes|infantil|infancia|juguetes?|jugueteria|munecas?|playmobil|lego|funko|puzzle|peluches?|hamaca para bebes|carrito bebe|cochecito|trona|sonajero)\b|monster high|minecraft|nerf|fisher.price/],
    ['Bricolaje',/\b(taladro|atornillador|destornillador|brocas?|martillo|sierras?|lijadora|amoladora|herramientas?|ferreteria|enchufes?|cables? electric|soldador|multimetro|grapadora electrica|anclajes?|varilla roscada|bridas?|llave inglesa|alicates?|fischer)\b/],
    ['Moda',/\b(camisetas?|camisas?|blusas?|polos?|pantalones?|vaqueros?|jeans|leggings?|vestidos?|faldas?|sudaderas?|jerseys?|jers[eé]is|chaquetas?|abrigos?|chalecos?|cazadoras?|bomber|blazer|ropa|zapatos?|zapatillas?|sneakers?|sandalias?|botas?|calcetines?|boxer|braguitas?|pijamas?|sujetadores?|bolsos?|bandoleras?|mochilas?|cinturones?|carteras?|maletas?|paraguas?|gorras?|bufandas?|guantes?|sombreros?|relojes? analogicos?|cronografo|wristwatch|t.shirt|hoodie|trousers|jacket|cardigan|coat|shirt|sweater|sneaker|trainers|backpack|crossbody|handbag|sunglasses)\b|the perfect tee|quartz watch|reloj (?!inteligente)/],
    ['Belleza',/\b(champu|acondicionador|serum|crema facial|pestanas?|mascara de|maquillaje|corrector|labial|contorno de ojos|hidratante|dermocosmetica|protector solar|perfume|colonia|desodorante|gel de bano|afeitador|afeitar|depilador|oneblade|barbero|recortadora|secador de pelo|peinado|cepillo de pelo|pasta de dientes|dentifrico|hyaluron|cosrx|lumea)\b/],
    ['Tecnología',/\b(televisores?|smart tv|tv stick|fire tv|ordenadores?|pc gaming|portatiles?|laptops?|monitores?|tablets?|moviles?|smartphones?|iphone|samsung galaxy|cargadores? usb|fundas? de silicona|magsafe|auriculares?|headphones?|altavoces?|microfonos?|teclados?|raton|ratones|smartwatch|reloj inteligente|pulsera inteligente|webcams?|camara vigilancia|camara wifi|router|repetidor wifi|wifi|bluetooth|hub usb|realidad virtual|playstation|xbox|videoconsola|mando de juego|ssd|disco duro|tarjeta grafica|ram|fuente de alimentacion|tarjeta de memoria|usb|pila|bateria externa|localizador bluetooth|smart glasses|gafas inteligentes)\b/],
    ['Hogar',/\b(aspiradora|friegasuelos|lavadora|tostadora|cafetera|molinillo|batidora|freidora|placa de induccion|horno|microondas|barbacoa|cuchillos|vajilla|sarten|ollas?|utensilios|escurridor|sabanas?|almohadas?|fundas? nordicas?|edredon|manta|colchon|organizadores?|estropajo|limpieza|escritorio|mesas?|sillas?|lamparas?|ventilador|climatizador|ambientador|difusor|percheros?|estanterias?|decoracion|temporizador de cocina|rollos de cocina)\b/],
    ['Deportes',/\b(mancuernas?|pesas?|fitness|yoga|deportivo|balon|pelotas?|bicicleta|patinete|senderismo|camping|tienda de campana|esterilla|botella deportiva|botella mezcladora|entrenamiento|proteinas)\b/]
  ];
  const modules={
    Moda:[['Camisetas y polos',/\b(camiseta|camisetas|polo|polos|t.shirt|tee)\b/],['Camisas y blusas',/\b(camisa|camisas|blusa|blusas|shirt)\b/],['Pantalones y vaqueros',/\b(pantalon|pantalones|vaquero|vaqueros|jeans|legging|leggings|shorts|trousers)\b/],['Vestidos y faldas',/\b(vestido|vestidos|falda|faldas|dress|skirt)\b/],['Sudaderas y jerséis',/\b(sudadera|sudaderas|jersey|jerseis|hoodie|sweater|cardigan|forro polar)\b/],['Chaquetas y abrigos',/\b(chaqueta|chaquetas|abrigo|abrigos|chaleco|chalecos|cazadora|cazadoras|bomber|blazer|jacket|coat)\b/],['Ropa interior y pijamas',/\b(boxer|braguita|sujetador|pijama|pijamas|ropa interior|calcetin|calcetines)\b/],['Calzado',/\b(zapato|zapatos|zapatilla|zapatillas|sneakers|sandalia|sandalias|bota|botas|zuecos|trainers)\b/],['Bolsos, mochilas y maletas',/\b(bolso|bolsos|bandolera|mochila|mochilas|maleta|maletas|backpack|crossbody|handbag|tote)\b/],['Cinturones y carteras',/\b(cinturon|cinturones|cartera|carteras|billetera|monedero)\b/],['Relojes y complementos',/\b(reloj|relojes|cronografo|quartz|gafas|sunglasses|paraguas|gorra|bufanda|guantes|sombrero|joya|pulsera)\b/]],
    Tecnología:[['Televisores',/\b(televisor|televisores|smart tv)\b/],['Streaming y TV sticks',/\b(tv stick|fire tv|chromecast|proyector)\b/],['Ordenadores',/\b(ordenador|ordenadores|portatil|laptop|pc gaming)\b/],['Monitores y componentes',/\b(monitor|monitores|ssd|tarjeta grafica|fuente de alimentacion|ram|disco duro)\b/],['Fundas y accesorios móviles',/\b(funda|fundas|magsafe|cargador)\b/],['Teléfonos móviles',/\b(movil|moviles|telefono|telefonos|smartphone|iphone|galaxy)\b/],['Auriculares y sonido',/\b(auricular|auriculares|headphone|altavoz|altavoces|microfono|microfonos|diadema|audio|soundbar)\b/],['Relojes y wearables',/\b(smartwatch|reloj inteligente|pulsera inteligente|smart glasses|gafas inteligentes)\b/],['Teclados y periféricos',/\b(teclado|raton|ratones|webcam|hub usb|periferico|logitech)\b/],['Cámaras y seguridad',/\b(camara|camaras|vigilancia|mirilla electronica|videovigilancia)\b/],['Internet y redes',/\b(router|wifi|ethernet|redes|repetidor|malla eero)\b/],['Consolas y videojuegos',/\b(playstation|xbox|nintendo|gaming|realidad virtual|vr2|videoconsola)\b/],['Alimentación y pilas',/\b(pilas?|baterias?|duracell|cr2032|powerbank)\b/]],
    Hogar:[['Cocina y electrodomésticos',/\b(tostadora|cafetera|freidora|batidora|molinillo|cocina|cuchillo|cuchillos|sarten|olla|barbacoa|induccion|vajilla|espumador|escurridor|temporizador)\b/],['Limpieza y aspiración',/\b(aspirador|aspiradora|friegasuelos|estropajo|limpieza|lavadora|bolsas de vacio)\b/],['Dormitorio y textiles',/\b(sabana|sabanas|almohada|almohadas|edredon|manta|colchon|bedding)\b/],['Muebles y organización',/\b(escritorio|mesa|silla|carrito|organizador|organizadores|estanteria|perchero)\b/],['Luz y climatización',/\b(lampara|luz|ventilador|climatizador|calefactor)\b/],['Decoración y ambiente',/\b(ambientador|difusor|aroma|decoracion|reloj de pared)\b/]],
    Belleza:[['Cuidado facial y cosmética',/\b(serum|crema|contorno|cosmetica|maquillaje|corrector|mascara|pestanas|hidratante|facial|revitalift|hyaluron|cosrx)\b/],['Cabello y peinado',/\b(champu|acondicionador|cabello|peinado|secador|protector termico|mascarilla capilar|batiste|moroccanoil)\b/],['Afeitado y depilación',/\b(afeitadora|afeitar|oneblade|barbero|depilacion|depiladora|recortadora|cuchillas)\b/],['Perfumes y fragancias',/\b(perfume|colonia|fragancia|eau de|aroma)\b/],['Higiene y cuerpo',/\b(desodorante|gel de bano|vaseline|corporal|pasta de dientes|dentifrico|cepillo de dientes)\b/]],
    Bricolaje:[['Herramientas manuales',/\b(destornillador|martillo|llave|alicates|herramientas|anclajes|varilla roscada)\b/],['Herramientas eléctricas',/\b(taladro|atornillador|sierra|lijadora|amoladora|soldador)\b/],['Electricidad e instalación',/\b(cable|enchufe|regleta|interruptor|electricidad|multimetro)\b/]],
    Infantil:[['Juguetes y juegos',/\b(juguete|muneca|lego|funko|playmobil|puzzle|peluche|monster high|minecraft|nerf)\b/],['Bebés y crianza',/\b(bebe|bebes|hamaca|trona|carrito|cochecito|sonajero)\b/],['Ropa infantil',/\b(ropa|camiseta|pantalon|zapatillas|vestido)\b/]],
    Deportes:[['Entrenamiento y fitness',/\b(fitness|yoga|mancuernas|pesas|entrenamiento|proteinas|botella)\b/],['Outdoor y aventura',/\b(senderismo|camping|tienda de campana|bicicleta|patinete)\b/]]
  };
  // La tienda conserva los departamentos de origen, pero añade sectores
  // necesarios para que productos de mascotas, automóvil, etc. no caigan en «Otros».
  Object.assign(modules,{
    Automoción:[['Electrónica y seguridad',/\b(carplay|android auto|co.driver|dgt|v16|alertas de peligro|dongle)\b/],['Accesorios para el coche',/\b(ambientador|air freshener|car air|limpiaparabrisas|coche|automovil)\b/]],
    Mascotas:[['Cuidado y accesorios de mascotas',/\b(perro|gato|mascota|cepillo|peine|correa|rascador)\b/]],
    Oficina:[['Papelería y escritura',/\b(libreta|cuaderno|bloc|notas|boligrafo|agenda|papeleria|adhesivas)\b/]],
    Alimentación:[['Caramelos y snacks',/\b(smint|caramelo|galleta|chocolate|snack|sabor|golosina)\b/]],
  });
  const categories=['Moda','Tecnología','Hogar','Belleza','Bricolaje','Infantil','Deportes','Automoción','Mascotas','Oficina','Alimentación','Otros'];
  // Las expresiones específicas tienen prioridad sobre coincidencias genéricas.
  // Ejemplo: «cámara vigilancia bebé» es tecnología, no un producto de crianza.
  const preciseCategories=[
    ['Tecnología',/camara (de )?vigilancia|mirilla electronica|videoportero|smartwatch|reloj inteligente|smart glasses|gafas inteligentes|pulsera inteligente|fuente de alimentacion|\bvr2\b|localizador bluetooth|funda(s)? de silicona|carplay(?= nunca)|\btelevisor\b/],
    ['Automoción',/\b(carplay|android auto|co.driver|dgt|v16 certificada|alertas de peligro|car air freshener)\b/],
    ['Mascotas',/\b(peine perros|cepillo (para )?(perros|gatos)|rascador gato|comida para perros|comida para gatos|mascotas)\b/],
    ['Infantil',/\b(lego|playmobil|juguete|juego de mesa|monster high|fisher.price)\b/],
    ['Alimentación',/\b(smint|caramelos|golosinas|galletas|chocolate|snack)\b/],
    ['Oficina',/\b(bloc de notas|notas adhesivas|libreta|cuaderno|boligrafo|papeleria)\b/],
    ['Infantil',/\b(youth boys|only girl|parka para nina|ropa infantil|equipaje para ninos|pijama infantil)\b/],
    ['Hogar',/cesto.*ropa sucia|cesta.*lavanderia|botella de agua|purificador de aire|sistema de cajones|rollos extra grandes|papel higienico|arbol de navidad|cocotte|cazuela|campana decorativa|lavadora|robot aspirador|roomba|friegasuelos|funda sombrilla|funda parasol/],
    ['Deportes',/detector de metales|casco de ciclismo|casco mips|waveboard|\bpesca\b|\bcarrete giratorio\b|cana y carrete|plataforma vibratoria/],
    ['Bricolaje',/pistola pintura|pulverizador de pintura|adhesivo sellador|cinta rollo hook|kit de fijacion|varilla roscada|anclajes|taladro|atornillador/],
    ['Belleza',/night repair|overnight treatment|cuchillas de afeitar|balsamo labial|colirio|spray frio|face cream|skin care|bean cream/],
    ['Moda',/\b(satchel|sneaker|shoes|swimsuit|dress|sweatshirt|pants|knit|orologio|quartz watch|pendientes|collar|calcetines|gorro|polo|chaqueta|mochila|back pack|equipaje|neceser|9forty|davis square mid|hummel tenis)\b/]
  ];
  const departmentGroups={
    'Moda':'Moda','Zapatos y complementos':'Moda','Bolsos y accesorios':'Moda','Relojes':'Moda','Joyería':'Moda','Equipaje':'Moda',
    'Informática':'Tecnología','Electrónica':'Tecnología','Videojuegos':'Tecnología','Software':'Tecnología',
    'Hogar y cocina':'Hogar','Grandes electrodomésticos':'Hogar','Jardín':'Hogar','Iluminación':'Hogar',
    'Belleza':'Belleza','Salud y cuidado personal':'Belleza','Bricolaje y herramientas':'Bricolaje',
    'Bebé':'Infantil','Juguetes y juegos':'Infantil','Deportes y aire libre':'Deportes',
    'Coche y moto':'Automoción','Productos para mascotas':'Mascotas','Oficina y papelería':'Oficina','Alimentación y bebidas':'Alimentación',
    'Libros':'Otros','Industria y ciencia':'Otros','Instrumentos musicales':'Otros'
  };
  // Identificaciones puntuales por referencia de producto, contrastadas en fuentes
  // especializadas y fabricante. Son pistas de catálogo, NO precio ni stock vivo.
  const referenceHints={
    B0G7JBT935:{category:'Tecnología',module:'Consolas y videojuegos',source:'Tesura Games · edición física de PS5'},
    B084DT2W79:{category:'Infantil',module:'Juguetes y juegos',source:'Ravensburger · juego de mesa Der Weisse Hai'},
    B0C9V4KJKX:{category:'Moda',module:'Calzado',audience:'Unisex',source:'Vans Knu Skool · referencia de zapatillas'},
    B0F5BJ8VKK:{category:'Moda',module:'Calzado',audience:'Mujer',source:'Helly Hansen W Buzzard TR · zapatillas de trail'},
    B0B74W76GK:{category:'Tecnología',module:'Fundas y accesorios móviles',source:'SP Connect SPC+ · soporte universal para smartphone'},
    B0FDQT2KFR:{category:'Hogar',module:'Limpieza y aspiración',source:'Corrección revisada · suavizante para la ropa'},
    B0B6WQ9RHM:{category:'Moda',module:'Bolsos, mochilas y maletas',source:'Corrección revisada · bolsa de viaje'},
    B0FVQ5ZGN1:{category:'Moda',module:'Sudaderas y jerséis',audience:'Mujer',source:'Corrección revisada · sudadera de mujer'},
    B0GFGH9B4M:{category:'Moda',module:'Sudaderas y jerséis',source:'Corrección revisada · suéter'},
    B0CN3WJYVT:{category:'Moda',module:'Sudaderas y jerséis',source:'Corrección revisada · forro polar Columbia'},
    B0H448WZ71:{category:'Tecnología',module:'Streaming y TV sticks',source:'Corrección revisada · televisor'},
    B08BKPQQDD:{category:'Tecnología',module:'Monitores y componentes',source:'Corrección revisada · fuente de alimentación de PC'},
    B0FFTPW4FL:{category:'Infantil',module:'Bebés y crianza',source:'Corrección revisada · pañal de baño'},
    B0C384VMY2:{category:'Tecnología',module:'Auriculares y sonido',source:'Corrección revisada · auriculares Beats'},
    B08LNZYST2:{category:'Moda',module:'Camisetas y polos',audience:'Hombre',source:'Corrección revisada · camiseta técnica Under Armour'},
    B0GPD64LXK:{category:'Moda',module:'Bolsos, mochilas y maletas',source:'Corrección revisada · mochila Samsonite'},
    B0DK5ZWC9Y:{category:'Moda',module:'Sudaderas y jerséis',source:'Corrección revisada · forro polar Columbia'},
    B07J5FJWJX:{category:'Hogar',module:'Decoración y ambiente',source:'Corrección revisada · ambientador'},
    B0DYHGQ1YR:{category:'Belleza',module:'Cuidado facial y cosmética',source:'Corrección revisada · bálsamo labial'},
    B0F8R3QGNG:{category:'Infantil',module:'Juguetes y juegos',source:'Corrección revisada · figura Pokémon'},
    B0B82989KQ:{category:'Bricolaje',module:'Herramientas manuales',source:'Corrección revisada · cinta adhesiva'},
    B0DT4M11JM:{category:'Moda',module:'Calzado',source:'Corrección revisada · calzado Superfit'},
    B09SL7WKG3:{category:'Moda',module:'Calzado',source:'Corrección revisada · calzado Superfit'},
    B0C58XX5YH:{category:'Moda',module:'Calzado',source:'Corrección revisada · zapatillas Hummel'},
    B0D54HT97H:{category:'Moda',module:'Calzado',source:'Corrección revisada · zapatillas Timberland'},
    B0BG599RFT:{category:'Moda',module:'Camisetas y polos',source:'Corrección revisada · camiseta GANT'},
    B0BG3C9B6D:{category:'Moda',module:'Camisetas y polos',source:'Corrección revisada · camiseta GANT'},
    B0D67CPYF2:{category:'Infantil',module:'Ropa infantil',source:'Corrección revisada · ropa infantil Champion'},
    B09DC1SH5G:{category:'Infantil',module:'Ropa infantil',source:'Corrección revisada · ropa infantil ONLY talla 152'},
    B085H134H5:{category:'Moda',module:'Pantalones y vaqueros',audience:'Hombre',source:'Corrección revisada · chinos Jack & Jones'},
    B084QRY7WR:{category:'Belleza',module:'Afeitado y depilación',source:'Corrección revisada · maquinilla Wilkinson'},
    B076PPC9W6:{category:'Tecnología',module:'Auriculares y sonido',source:'Corrección revisada · altavoz NGS'}
  };
  function moduleFromSuggestion(category,subcategory){
    const t=norm(subcategory);
    const hints={
      Moda:[['Calzado',/zapatilla|botas|calzado|sandalia/],['Bolsos, mochilas y maletas',/bolsos|mochilas|equipaje|bandolera|maletas/],['Camisetas y polos',/camiseta|polos|tops/],['Camisas y blusas',/camisas|blusas/],['Pantalones y vaqueros',/pantalon|monos/],['Vestidos y faldas',/vestido|falda/],['Sudaderas y jerséis',/sudadera|punto|chandal/],['Chaquetas y abrigos',/chaqueta|abrigo/],['Ropa interior y pijamas',/ropa interior|calcetin/],['Relojes y complementos',/joyas|reloj|accesorios|cartera/]],
      Tecnología:[['Televisores',/television|tv/],['Ordenadores',/ordenador|portatil/],['Auriculares y sonido',/audio|sonido/],['Cámaras y seguridad',/camara|seguridad/],['Internet y redes',/redes/],['Relojes y wearables',/inteligentes|wearable/],['Consolas y videojuegos',/consola|videojuego/],['Monitores y componentes',/componentes|perifericos/],['Alimentación y pilas',/pilas|alimentacion/]],
      Hogar:[['Limpieza y aspiración',/limpieza|aspiracion|hepa/],['Cocina y electrodomésticos',/cocina|electrodomestico|menaje|botellas/],['Muebles y organización',/mueble|armario|cajon|almacenaje/],['Luz y climatización',/climatizacion|lampara|ventilador/],['Decoración y ambiente',/decoracion|terraza|festiva|papel/]],
      Belleza:[['Cuidado facial y cosmética',/facial|maquillaje|cosmetica/],['Cabello y peinado',/capilar/],['Afeitado y depilación',/afeitado|depilacion/],['Perfumes y fragancias',/fragancia/],['Higiene y cuerpo',/higiene|botiquin|ojos/]],
      Infantil:[['Juguetes y juegos',/juego|figuras|juguete/],['Bebés y crianza',/bebe|crianza/],['Ropa infantil',/ropa/]],
      Deportes:[['Entrenamiento y fitness',/fitness|recuperacion|plataforma/],['Outdoor y aventura',/senderismo|exploracion|pesca/]],
      Bricolaje:[['Herramientas manuales',/herramienta|ferreteria/],['Herramientas eléctricas',/sierra/],['Electricidad e instalación',/instalacion/]]
    };
    return (hints[category]||[]).find(([,re])=>re.test(t))?.[0]||'';
  }
  const priorityModules={
    Tecnología:[
      ['Relojes y wearables',/\b(smartwatch|reloj inteligente|smart glasses|gafas inteligentes|pulsera inteligente)\b/],
      ['Cámaras y seguridad',/\b(camara|camaras|mirilla electronica|videoportero|vigilancia)\b/],
      ['Fundas y accesorios móviles',/\b(funda|fundas|magsafe|soporte universal spc|sp connect)\b/],
      ['Teclados y periféricos',/\b(raton|mouse|teclado|webcam|localizador bluetooth)\b/],
      ['Consolas y videojuegos',/\b(playstation|ps5|xbox|nintendo|vr2)\b/],
      ['Televisores',/\b(television|televisor|smart tv)\b/],
      ['Ordenadores',/\b(portatil|laptop|ordenador|pc gaming)\b/],
    ],
    Moda:[
      ['Calzado',/\b(zapatillas|zapatos|sneakers|sneaker|botas|sandalias|calzado|davis square|buzzard tr)\b/],
      ['Bolsos, mochilas y maletas',/\b(bolso|bandolera|mochila|backpack|maleta|equipaje|satchel|neceser)\b/],
      ['Relojes y complementos',/\b(reloj|pendientes|collar|pulsera|9forty|gorra|sombrero)\b/],
    ]
  };
  function categorise(product){
    const name=norm(product.name),source=product.source;
    const text=norm(product.description&&source==='web'?product.name+' '+product.description:product.name);
    const matchByReference=source==='manager'?referenceHints[String(product.asin||'').toUpperCase()]:null;
    const suggested=window.VelansCatalog?.classifyOffer({title:product.name,description:source==='web'?product.description:''})||null;
    // El catálogo histórico conserva sus secciones verificadas por el dueño.
    // Para Manager, prioridad a las pistas precisas y al clasificador de Manager v16.
    let category=product.category||'Otros';
    if(source==='manager'){
      const precise=preciseCategories.find(([,re])=>test(name,re));
      const mapped=departmentGroups[suggested?.department];
      const old=patterns.find(([,re])=>test(name,re));
      category=matchByReference?.category||precise?.[0]||mapped||(old?old[0]:category);
      // Marca y accesorios: estos falsos positivos se resuelven por el objeto principal.
      if(/\b(mochila|backpack|satchel|equipaje de cabina)\b/.test(name))category='Moda';
      if(/\b(casco (de )?ciclismo|casco mips)\b/.test(name))category='Deportes';
      if(/\b(smartwatch|reloj inteligente)\b/.test(name))category='Tecnología';
    }
    const audience=category==='Moda'?(matchByReference?.audience|| (test(name,/\b(unisex)\b/)?'Unisex':test(name,/\b(mujer|women|womens|woman|ladies|femenina|para ella|girl)\b/)?'Mujer':test(name,/\b(hombre|men|mens|caballero|masculino|para el|boys)\b/)?'Hombre':test(norm(product.kind),/mujer/)?'Mujer':test(norm(product.kind),/hombre/)?'Hombre':'Sin especificar')):'all';
    const group=modules[category]||[];
    let module=matchByReference?.module||priorityModules[category]?.find(([,re])=>test(name,re))?.[0]||group.find(([,re])=>test(name,re))?.[0]||group.find(([,re])=>test(text,re))?.[0]||'';
    if(!module&&category==='Moda'&&/\b(skechers|vl court|summits lite|graceful get connected)\b/.test(name))module='Calzado';
    if(!module&&category==='Hogar'&&/\b(quitapelusas|cesto|cesta|lavanderia|papel higienico)\b/.test(name))module='Limpieza y aspiración';
    if(!module&&category==='Hogar'&&/\b(campana decorativa|cocotte|cazuela)\b/.test(name))module='Cocina y electrodomésticos';
    if(!module&&category==='Tecnología'&&/\b(vr2|carga del controlador)\b/.test(name))module='Consolas y videojuegos';
    if(!module&&category==='Tecnología'&&/\b(localizador|tile)\b/.test(name))module='Teclados y periféricos';
    if(!module&&category==='Infantil'&&/\b(parka|vestido|ropa|nina|nino)\b/.test(name))module='Ropa infantil';
    if(!module&&category==='Deportes'&&/\b(casco|ciclismo)\b/.test(name))module='Outdoor y aventura';
    if(!module&&category==='Deportes'&&/\b(pesca|carrete|cana|waveboard)\b/.test(name))module='Outdoor y aventura';
    if(!module&&category==='Bricolaje'&&/\b(pattex|fijacion|adhesivo|pistola pintura|pulverizador|cinta rollo|gancho)\b/.test(name))module='Herramientas manuales';
    if(!module&&category==='Belleza'&&/\b(multigroom|peinado|quitapelusas)\b/.test(name))module='Afeitado y depilación';
    if(!module&&category==='Belleza'&&/night repair|overnight treatment/.test(name))module='Cuidado facial y cosmética';
    if(!module&&category==='Moda'&&/\b(neceser|satchel)\b/.test(name))module='Bolsos, mochilas y maletas';
    if(!module&&category==='Moda'&&/\b(9forty|gorro|gorra|new era)\b/.test(name))module='Relojes y complementos';
    if(!module&&category==='Moda'&&/\b(davis square|tenis|mid lace|wheat nubuck)\b/.test(name))module='Calzado';
    if(!module)module=moduleFromSuggestion(category,suggested?.subcategory)||'Otros artículos';
    return {...product,category,audience,module,classificationConfidence:category==='Otros'?'pendiente':matchByReference?'contrastada externamente':suggested?.confidence||'orientativa',classificationSource:matchByReference?.source||'Reglas y pistas del título'};
  }
  window.VelansPreviewTaxonomy={categorise,categories,modules};
})();
