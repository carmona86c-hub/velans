# Velan’s

Escaparate de ofertas por categoría, con búsqueda, filtros, fotografías orientativas,
precios anunciados y enlaces de afiliado a Amazon.es.

- Web pública: https://velans.es
- Catálogo publicado: `catalogo-completo.js` (370 artículos en esta versión).
- Clasificación y eliminación de duplicados por nombre: `catalogo-taxonomia.js`, `catalogo-reglas.js` y `catalogo-clasificador-manager.js`.
- Interfaz, tarjetas y enlaces comerciales: `index.html`, `marketplace-v3.js` y hojas CSS correspondientes.
- Afiliado único para los enlaces publicados: `velans-21`.
- La captura programada de Gangagato sigue en `.github/workflows/velans-gangagato-sync.yml` y actualiza `data/gangagato-feed.json`.
  El catálogo publicado es una instantánea separada: los nuevos mensajes capturados no aparecen automáticamente en la web hasta incorporarlos a `catalogo-completo.js`.

Los precios y descuentos mostrados son orientativos, no una consulta en tiempo real a Amazon. Las fotografías no verificadas llevan la etiqueta «IMG PROVI.». La compra se formaliza siempre en Amazon.es.
