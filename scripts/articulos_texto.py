"""Artículos originales de Velan's: guías de compra escritas por nosotros.

Cada artículo: slug, titulo, desc, fecha, intro, secciones [(h2, [párrafos o listas])],
claves (palabras para enseñar ofertas relacionadas de AliExpress al final).
Una lista se escribe como ("ul", [puntos]).
"""

ARTICULOS = [
    dict(
        slug="como-elegir-auriculares-inalambricos",
        titulo="Cómo elegir auriculares inalámbricos sin gastar de más",
        desc="Qué mirar en unos auriculares bluetooth: tipo, cancelación de ruido, batería, códecs y micrófono. Guía práctica para no equivocarse.",
        intro="Hay auriculares inalámbricos de 10 € y de 300 €, y por fuera se parecen mucho. La diferencia está en cuatro o cinco detalles que casi nunca aparecen en la foto. Esta guía te ayuda a saber cuáles importan para lo que tú vas a hacer con ellos.",
        secciones=[
            ("Primero: ¿para qué los quieres?", [
                "No es lo mismo escuchar podcasts en el metro que correr o hacer llamadas de trabajo. Antes de mirar modelos, piensa en el uso principal:",
                ("ul", ["Para el transporte y la calle: intrauditivos (los que se meten en el oído) con buen aislamiento.",
                        "Para hacer deporte: con gancho o aletas que sujeten, y resistencia al sudor (IPX4 o superior).",
                        "Para llamadas y teletrabajo: micrófono con reducción de ruido; mejor si es de diadema.",
                        "Para estar en casa o viajar en avión: de diadema con cancelación activa de ruido (ANC)."]),
            ]),
            ("La cancelación de ruido, explicada sin humo", [
                "La cancelación activa de ruido (ANC) usa micrófonos para «restar» el sonido de fuera. Funciona muy bien con ruidos graves y constantes (motor del avión, aire acondicionado) y bastante peor con voces. En modelos baratos suele ser floja, así que no pagues un extra por ella si solo los vas a usar en casa.",
                "Si un producto dice «ENC», no es lo mismo: ENC solo limpia tu voz en las llamadas, no quita el ruido que tú oyes.",
            ]),
            ("Batería: mira la cifra correcta", [
                "En los auriculares tipo botón se anuncian dos cifras: la del auricular (normalmente 4–8 horas) y la total con el estuche (20–40 horas). La que de verdad te importa es la primera, porque es la que aguantas sin parar. Para un trayecto diario largo, busca al menos 5 horas por carga.",
            ]),
            ("Bluetooth, códecs y otros detalles", [
                ("ul", ["Bluetooth 5.0 o superior: conexión más estable y menos cortes.",
                        "Códec AAC si tienes iPhone; aptX o LDAC si tienes Android y te importa la calidad.",
                        "Multipunto: permite estar conectado al móvil y al ordenador a la vez. Muy útil para trabajar.",
                        "Controles táctiles: cómodos, pero se activan sin querer al colocarte el gorro o la capucha."]),
            ]),
            ("Lo que miramos en Velan's", [
                "Cuando seleccionamos auriculares en AliExpress solo enseñamos modelos con al menos un 85 % de valoraciones positivas y ventas reales, y de cada modelo buscamos la tienda que lo vende más barato. Aun así, lee siempre las opiniones más recientes: son las que mejor reflejan si la calidad se mantiene.",
            ]),
        ],
        claves="auriculares bluetooth inalambricos",
    ),
    dict(
        slug="como-elegir-cargador-rapido-usb-c",
        titulo="Cargador rápido USB-C: qué significan W, PD y GaN",
        desc="Guía para elegir cargador USB-C: cuántos vatios necesita tu móvil o portátil, qué es Power Delivery y por qué los cargadores GaN son más pequeños.",
        intro="Los móviles ya no traen cargador en la caja, y en la tienda aparecen siglas que confunden: 20 W, 65 W, PD, QC, GaN… Con tres ideas claras puedes elegir uno que cargue rápido sin pagar de más ni poner en riesgo la batería.",
        secciones=[
            ("¿Cuántos vatios necesitas?", [
                "Los vatios (W) indican la potencia máxima. El cargador nunca «empuja» más de lo que el aparato pide, así que uno más potente no es peligroso, solo innecesario si no lo aprovechas.",
                ("ul", ["iPhone recientes: 20–30 W bastan para la carga rápida.",
                        "Samsung y la mayoría de Android: 25–45 W.",
                        "Tablets: 30–45 W.",
                        "Portátiles con USB-C: 65 W para ultraligeros, 100 W para los más grandes."]),
                "Si vas a cargar varias cosas a la vez, ojo: un cargador de 65 W con tres puertos reparte esos 65 W entre todos.",
            ]),
            ("Power Delivery (PD): la sigla que importa", [
                "USB Power Delivery es el estándar de carga rápida por USB-C que usan iPhone, Samsung, Pixel y los portátiles. Si un cargador indica «PD», funcionará con casi todo. «QC» (Quick Charge) es otro sistema, propio de algunos móviles Android; muchos cargadores llevan los dos.",
            ]),
            ("¿Qué es un cargador GaN?", [
                "GaN (nitruro de galio) es un material que se calienta menos que el silicio, así que el cargador puede ser mucho más pequeño con la misma potencia. Un GaN de 65 W puede tener el tamaño del cargador antiguo de 18 W. Es la mejor opción si viajas o quieres un solo cargador para móvil y portátil.",
            ]),
            ("El cable también cuenta", [
                "Un cable USB-C normal admite hasta 60 W. Para 100 W o más necesitas un cable de 5 A (suele indicarlo como 100 W o 240 W). Un cable malo es la causa más habitual de que la carga rápida «no funcione».",
            ]),
            ("Seguridad", [
                "Para algo que pasa horas enchufado, mira que tenga protección contra sobrecalentamiento y sobretensión, y que el enchufe sea europeo (tipo EU). En Velan's descartamos cargadores con valoraciones bajas aunque estén muy baratos.",
            ]),
        ],
        claves="cargador cable usb tipo",
    ),
    dict(
        slug="como-comprar-en-aliexpress-sin-sustos",
        titulo="Cómo comprar en AliExpress sin sustos: envíos, aduanas y devoluciones",
        desc="Consejos prácticos para comprar en AliExpress desde España: elegir tienda fiable, plazos de envío, IVA y aduanas, protección del comprador y devoluciones.",
        intro="AliExpress tiene precios muy bajos, pero comprar bien requiere fijarse en cosas distintas a las de una tienda española. Estos son los puntos que revisamos antes de recomendar cualquier artículo, y que te conviene mirar a ti también.",
        secciones=[
            ("1. Elige bien la tienda, no solo el producto", [
                "El mismo artículo lo venden decenas de tiendas. Antes de comprar, mira:",
                ("ul", ["El porcentaje de valoraciones positivas de la tienda (mejor por encima del 90 %).",
                        "Cuántos pedidos tiene el artículo: con cientos o miles de ventas hay opiniones reales que leer.",
                        "Las opiniones con fotos: enseñan cómo llega de verdad el producto.",
                        "La antigüedad de la tienda: las que llevan años suelen dar menos problemas."]),
            ]),
            ("2. El precio final incluye el IVA", [
                "Desde 2021, las compras desde fuera de la UE pagan IVA desde el primer euro. En AliExpress el IVA ya aparece incluido al pagar, así que no deberías tener sorpresas en la entrega. Si ves un precio que parece demasiado bajo en la ficha, comprueba el total en el carrito.",
            ]),
            ("3. Plazos de envío", [
                "Muchos artículos se envían desde almacenes en Europa o España y llegan en 3–7 días. Los que salen de China suelen tardar entre 7 y 20 días. Si es un regalo con fecha (Navidad, Reyes, un cumpleaños), mira la fecha de entrega estimada antes de pagar y deja margen.",
            ]),
            ("4. Protección del comprador y devoluciones", [
                "AliExpress retiene el pago hasta que confirmas la recepción o termina el plazo de protección. Si el pedido no llega o no es como se describía, abre una disputa desde «Mis pedidos» antes de que termine ese plazo y adjunta fotos. Muchos artículos tienen además devolución gratuita: aparece indicado en la ficha.",
            ]),
            ("5. Tallas y enchufes", [
                ("ul", ["Las tallas asiáticas suelen ser más pequeñas: mide una prenda tuya y compárala con la tabla de medidas en centímetros.",
                        "En aparatos eléctricos, elige el enchufe «EU».",
                        "En cargadores y cables, desconfía de potencias exageradas a precios mínimos."]),
            ]),
            ("Cómo lo hacemos en Velan's", [
                "Solo enseñamos artículos con al menos un 85 % de valoraciones positivas y ventas reales, y de lo más vendido buscamos la oferta más barata del mismo artículo en una tienda fiable. Los precios se actualizan cada día, pero el que manda es siempre el que ves en AliExpress al pagar.",
            ]),
        ],
        claves="",
    ),
    dict(
        slug="como-elegir-smartwatch-barato",
        titulo="Smartwatch barato: qué funciones merecen la pena",
        desc="Cómo elegir un reloj inteligente o pulsera de actividad económica: compatibilidad, pantalla, batería, sensores y qué no esperar de un modelo barato.",
        intro="Un reloj inteligente de menos de 50 € puede contar pasos, avisarte de los mensajes y medir el sueño razonablemente bien. Lo que no hará es sustituir a un Apple Watch. Saber qué puedes esperar evita la decepción.",
        secciones=[
            ("Compatibilidad con tu móvil", [
                "Casi todos funcionan con Android e iPhone a través de una app propia, pero con iPhone las notificaciones suelen ser más limitadas (por ejemplo, no se puede responder a los mensajes). Busca en la ficha el nombre de la app y mira sus opiniones: una app mala arruina un buen reloj.",
            ]),
            ("Pantalla y batería", [
                ("ul", ["AMOLED: colores vivos y se lee mejor al sol, pero gasta más batería.",
                        "LCD/TFT: más barata y con más autonomía.",
                        "Batería: los modelos sencillos duran 7–14 días; con pantalla siempre encendida o GPS, mucho menos."]),
            ]),
            ("Sensores: qué es fiable y qué no", [
                "Los pasos y el pulso en reposo suelen ser bastante aproximados. El oxígeno en sangre, la tensión arterial o el «estrés» en relojes baratos son orientativos como mucho: no los uses para tomar decisiones de salud. Si quieres medir carreras con precisión, necesitas GPS integrado, que es raro en la gama más económica.",
            ]),
            ("Llamadas por bluetooth", [
                "Algunos modelos tienen altavoz y micrófono para contestar llamadas desde el reloj. Es práctico conduciendo o en casa, pero el sonido es justo. Si no lo vas a usar, mejor un modelo sin esta función y con más batería.",
            ]),
            ("Un buen regalo si…", [
                "…la persona quiere empezar a moverse más, dormir mejor o no perderse avisos del móvil. Para alguien muy deportista o muy tecnológico, mejor mirar gamas superiores.",
            ]),
        ],
        claves="smartwatch reloj inteligente pulsera",
    ),
    dict(
        slug="iluminacion-led-en-casa",
        titulo="Iluminación LED en casa: tiras, luces con sensor y solares",
        desc="Ideas y consejos para iluminar la casa con LED: tiras de luz para muebles y televisión, luces con sensor de movimiento y lámparas solares de exterior.",
        intro="La iluminación LED es de las mejoras más baratas que se pueden hacer en una casa: gasta poco, se instala sin obras y cambia mucho el ambiente. Estas son las opciones más útiles y en qué fijarse para que duren.",
        secciones=[
            ("Tiras LED: detrás de la tele, bajo los muebles", [
                "Las tiras se pegan con adhesivo y se recortan a medida. Para la parte de atrás de la televisión, una de 2–3 metros alimentada por USB es suficiente. Bajo los muebles de cocina, mejor luz blanca cálida o neutra, que es la que de verdad ilumina la encimera.",
                ("ul", ["Limpia la superficie con alcohol antes de pegarla; el adhesivo es lo primero que falla.",
                        "RGB: cambia de color con mando o app. Divertido para habitaciones juveniles.",
                        "Densidad: más LED por metro = luz más uniforme, sin puntitos."]),
            ]),
            ("Luces con sensor de movimiento", [
                "Pequeñas luces recargables que se encienden solas al pasar. Ideales para pasillos, armarios, escaleras o el baño por la noche. Mira que la batería se cargue por USB-C y que el sensor tenga ajuste de luz ambiente, para que no se encienda de día.",
            ]),
            ("Luces solares de exterior", [
                "Se cargan de día y se encienden solas al anochecer: no necesitan cables. Funcionan bien en terrazas y jardines con sol directo varias horas al día. En invierno o en sitios con sombra rinden mucho menos, así que no esperes que estén encendidas toda la noche en diciembre. Comprueba que sean resistentes al agua (IP65).",
            ]),
            ("Temperatura de color, en una frase", [
                "Unos 2700–3000 K es luz cálida, para salón y dormitorio; 4000 K es neutra, para cocina y baño; 6000 K es fría, mejor solo para trabajar o el garaje.",
            ]),
        ],
        claves="led luces luz tira lampara solar sensor",
    ),
    dict(
        slug="organizar-cables-y-escritorio",
        titulo="Cómo organizar los cables y el escritorio por menos de 15 €",
        desc="Trucos baratos para acabar con el lío de cables en el escritorio, la mesita y la tele: bridas de velcro, organizadores, soportes y canaletas.",
        intro="El caos de cables tiene arreglo con muy poco dinero. No hace falta reformar nada: con tres o cuatro accesorios pequeños el escritorio y la zona de la tele quedan ordenados en una tarde.",
        secciones=[
            ("Paso 1: desenchufa y cuenta", [
                "Antes de comprar nada, saca todos los cables y apunta cuántos tienes y a dónde van. Muchas veces sobran: cargadores viejos, cables duplicados o aparatos que ya no usas.",
            ]),
            ("Paso 2: agrupa los cables que van juntos", [
                ("ul", ["Bridas de velcro reutilizables: mejores que las de plástico, que hay que cortar.",
                        "Funda o espiral para unir los cables que bajan de la mesa al enchufe.",
                        "Canaleta adhesiva para esconderlos por la pared o la pata del mueble."]),
            ]),
            ("Paso 3: que cada cable tenga su sitio", [
                "Los clips adhesivos de silicona sujetan el extremo del cable del cargador al borde de la mesa, para que no se caiga detrás cada vez que lo desenchufas. Un soporte para el móvil o la tablet libera espacio y evita que acabes con el cable tirante.",
            ]),
            ("Paso 4: una base de carga para todo", [
                "Si cargas móvil, reloj y auriculares cada noche, una regleta con USB o un cargador de varios puertos en un solo sitio reduce a la mitad los cables a la vista.",
            ]),
            ("Bonus: etiqueta", [
                "Un trozo de cinta con el nombre del aparato en cada enchufe de la regleta ahorra mucho tiempo cuando hay que desconectar algo.",
            ]),
        ],
        claves="organizador cables soporte clips",
    ),
    dict(
        slug="ideas-amigo-invisible-menos-15-euros",
        titulo="Amigo invisible por menos de 15 €: cómo acertar sin conocer a la persona",
        desc="Ideas y criterios para acertar en el amigo invisible con poco presupuesto: regalos útiles, neutros y que no acaban en un cajón.",
        intro="El amigo invisible tiene una trampa: casi siempre te toca alguien que no conoces bien y con un presupuesto pequeño. La clave no es encontrar algo original, sino algo que se use. Estas reglas funcionan casi siempre.",
        secciones=[
            ("Regla 1: útil antes que gracioso", [
                "El regalo de broma hace reír cinco segundos y acaba en la basura. Algo pequeño que se use a diario (un soporte para el móvil, una luz de noche, un organizador) se recuerda más.",
            ]),
            ("Regla 2: neutro y sin talla", [
                "Evita ropa, perfumes y cosas muy personales. Funcionan mejor los objetos que sirven a cualquiera: accesorios para el móvil, detalles para la casa o la oficina, termos y tazas, luces decorativas.",
            ]),
            ("Regla 3: que parezca más de lo que cuesta", [
                "Un artículo de 10 € bien presentado luce más que uno de 15 € en una bolsa cualquiera. Un papel bonito y una nota escrita a mano marcan la diferencia.",
            ]),
            ("Ideas que suelen funcionar", [
                ("ul", ["Para quien trabaja con ordenador: soporte de portátil o de móvil, organizador de cables.",
                        "Para quien pasa frío: guantes táctiles, manta pequeña, bolsa de agua caliente.",
                        "Para casa: luz con sensor, organizador de cocina o de baño.",
                        "Para quien viaja: funda organizadora, candado de maleta, adaptador de enchufes."]),
            ]),
            ("Ojo con los plazos", [
                "Si compras en AliExpress, mira la fecha de entrega antes de pagar: los artículos que se envían desde almacenes en España llegan en pocos días; los de China pueden tardar dos o tres semanas.",
            ]),
        ],
        claves="organizador soporte luz llavero taza termo",
    ),
    dict(
        slug="como-elegir-power-bank",
        titulo="Batería externa (power bank): cuántos mAh necesitas de verdad",
        desc="Guía para elegir una batería externa: capacidad real en mAh, carga rápida, tamaño, MagSafe y qué se puede llevar en el avión.",
        intro="Una batería externa salva el día, pero los números de la caja engañan: una de 10.000 mAh no carga cuatro veces un móvil de 2.500 mAh. Así se calcula lo que necesitas.",
        secciones=[
            ("La capacidad real es menor que la anunciada", [
                "Por pérdidas en la conversión, una power bank entrega alrededor del 60–70 % de lo que marca. Una de 10.000 mAh carga un móvil moderno (4.000–5.000 mAh) más o menos 1,5 veces. Una de 20.000 mAh, unas 3 veces.",
                ("ul", ["Para un día largo fuera: 10.000 mAh.",
                        "Para un fin de semana o compartir con alguien: 20.000 mAh.",
                        "Para cargar un portátil: 20.000 mAh o más y salida USB-C PD de al menos 45 W."]),
            ]),
            ("Carga rápida en las dos direcciones", [
                "Mira dos cosas: la salida (lo rápido que carga tu móvil; busca PD de 20 W o más) y la entrada (lo rápido que se recarga ella). Una power bank de 20.000 mAh con entrada lenta puede tardar toda la noche en llenarse.",
            ]),
            ("Magnéticas (MagSafe y similares)", [
                "Se pegan a la parte de atrás del iPhone y cargan sin cable. Son muy cómodas, pero más lentas, se calientan más y suelen tener poca capacidad (5.000 mAh). Perfectas para un apuro, no para un viaje.",
            ]),
            ("En el avión", [
                "Las baterías externas van siempre en el equipaje de mano, nunca facturadas. Hasta 100 Wh (unos 27.000 mAh) se pueden llevar sin pedir permiso a la aerolínea.",
            ]),
        ],
        claves="power bank bateria externa cargador",
    ),
    dict(
        slug="comprar-ropa-online-acertar-talla",
        titulo="Comprar ropa online y acertar con la talla",
        desc="Cómo acertar con la talla al comprar ropa y calzado por internet: medir bien, leer tablas en centímetros, tallas asiáticas y opiniones con fotos.",
        intro="La mayoría de devoluciones de ropa online son por la talla. Con una cinta métrica y cinco minutos puedes reducir mucho ese riesgo, sobre todo en tiendas con tallas asiáticas.",
        secciones=[
            ("No te fíes de la letra, fíate de los centímetros", [
                "Una M de una marca puede ser una S de otra. Busca siempre la tabla de medidas en centímetros de cada prenda y compárala con tus medidas o, mejor aún, con una prenda tuya que te quede bien.",
            ]),
            ("Cómo medir una prenda que ya tienes", [
                ("ul", ["Camisetas y sudaderas: ancho de axila a axila con la prenda estirada en la mesa, y largo desde el hombro.",
                        "Pantalones: cintura de lado a lado (y multiplica por dos) y largo de la pierna por dentro.",
                        "Calzado: mide el pie de pie, del talón al dedo más largo, por la tarde (el pie está algo más hinchado)."]),
            ]),
            ("Tallas asiáticas", [
                "En tiendas de AliExpress las tallas suelen ser una o dos más pequeñas que las europeas. La tabla de centímetros es la que manda. Si estás entre dos tallas, elige la mayor.",
            ]),
            ("Las opiniones con fotos son oro", [
                "Busca opiniones que indiquen la altura y el peso de quien compró y la talla que eligió. Son la forma más rápida de saber si una prenda talla grande o pequeña.",
            ]),
            ("Antes de pagar", [
                "Comprueba si la devolución es gratuita y en qué plazo. En regalos, guarda el justificante o elige un artículo que se pueda cambiar.",
            ]),
        ],
        claves="sudadera chaqueta zapatillas camiseta pantalones",
    ),
    dict(
        slug="regalos-tecnologicos-adolescentes",
        titulo="Regalos tecnológicos para adolescentes que sí van a usar",
        desc="Qué regalar a un adolescente aficionado a la tecnología o los videojuegos: periféricos gaming, audio, luces RGB y accesorios útiles, con consejos para acertar.",
        intro="Con los adolescentes, la tecnología casi siempre acierta, pero hay que afinar: lo que ya tienen, lo que les falta y para qué lo usan. Estas pistas ayudan a elegir sin preguntar demasiado.",
        secciones=[
            ("Si juega en ordenador", [
                ("ul", ["Ratón gaming: más preciso y con botones extra. Mira los DPI ajustables y que sea para su mano (diestro o zurdo).",
                        "Teclado mecánico: el sonido y el tacto les encantan. Los compactos (sin teclado numérico) dejan más espacio para el ratón.",
                        "Alfombrilla grande: barata y se nota mucho."]),
            ]),
            ("Si juega en consola o móvil", [
                "Unos auriculares con micrófono para hablar con los amigos, un mando extra o un soporte de carga para el mando suelen acertar. Comprueba la compatibilidad con su consola concreta.",
            ]),
            ("Para su cuarto", [
                "Las tiras LED RGB y las lámparas que cambian de color son un éxito casi seguro a esas edades. Un altavoz bluetooth pequeño también.",
            ]),
            ("Lo práctico también gusta", [
                "Un cargador rápido, una batería externa o un buen cable largo para la cama no son emocionantes, pero se usan cada día.",
            ]),
            ("Cómo averiguar lo que tiene sin preguntar", [
                "Fíjate en las fotos de su escritorio o su cuarto, o pregunta a sus padres o hermanos qué usa a diario. Evita repetir algo que ya tiene y, en periféricos, no te vayas a lo más barato: se nota en la duración.",
            ]),
        ],
        claves="gaming raton teclado auriculares led altavoz",
    ),
]
