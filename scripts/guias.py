#!/usr/bin/env python3
"""Genera las páginas de guía (HTML estático, indexable) a partir de catalogo-completo.js.

Uso: python3 scripts/guias.py   (desde la raíz del repositorio)
Sin precios, descuentos ni fotos de Amazon: solo nombre, descripción propia y enlace de afiliado.
"""
import html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from guias_navidad import GUIAS_REGALO  # noqa: E402
SITE = "https://velans.es"
HOY = date.today().isoformat()

t = (ROOT / "catalogo-completo.js").read_text(encoding="utf-8")
productos = json.loads(t[t.index("{"):t.rindex("}") + 1])["products"]

# Ideas para regalar: selección propia del catálogo original (refs web:<id>)
REGALOS = {
    "web:" + x for x in """
    casio-f91w casio-a168wg casio-la670 timex-expedition xiaomi-redmi-watch levis-polo carhartt-k87
    adidas-feelcozy tramas-pijama calvin-klein-boxer crocs-forro levis-batwing-tote levis-mini-crossbody
    besch-paraguas elizabeth-arden-green-tea weleda-skin-food philips-multigroom philips-oneblade
    cecotec-difusor cosori-freidora nespresso-inissia bosch-molinillo fire-tv-stick echo-pop tapo-c200
    """.split()
}

GUIAS = [
    dict(slug="ideas-para-regalar", titulo="Ideas para regalar",
         h1="Ideas para regalar que siempre aciertan",
         desc="Regalos que suelen gustar a casi todo el mundo: moda, belleza, hogar y tecnología. Elige la idea en Velan’s y cómprala en Amazon.es.",
         intro=["Encontrar un regalo que guste no debería ser difícil. Aquí reunimos ideas que funcionan para casi cualquier persona: relojes y accesorios de siempre, cosmética para cuidarse, detalles para la casa y tecnología útil del día a día.",
                "Cada idea lleva a Amazon.es, donde ves el precio actualizado, las opciones de envío y las condiciones de devolución antes de decidir. Si dudas con la talla o el color, en Amazon puedes elegirlo y, en la mayoría de los casos, cambiarlo después."],
         filtro=lambda p: p["ref"] in REGALOS),
    dict(slug="moda", titulo="Moda",
         h1="Moda: básicos y marcas que no fallan",
         desc="Selección de moda de mujer y hombre, calzado, bolsos y relojes de marcas conocidas. Consulta precio y tallas en Amazon.es.",
         intro=["Ropa, calzado y accesorios para el día a día: camisas, vaqueros, sudaderas, zapatillas, bolsos y relojes de marcas reconocidas.",
                "Te recomendamos revisar la guía de tallas de cada producto en Amazon.es antes de comprar: la información de tallas, colores y disponibilidad que ves allí es siempre la actualizada."],
         filtro=lambda p: p["category"] == "Moda"),
    dict(slug="hogar-y-cocina", titulo="Hogar y cocina",
         h1="Hogar y cocina: cosas útiles para casa",
         desc="Pequeño electrodoméstico, menaje y artículos para el hogar seleccionados. Mira precio y disponibilidad en Amazon.es.",
         intro=["Artículos que hacen la casa más cómoda: pequeño electrodoméstico, menaje de cocina, orden y limpieza.",
                "Antes de comprar un electrodoméstico, revisa en Amazon.es las medidas, la potencia y el tipo de enchufe en la ficha del producto."],
         filtro=lambda p: p["category"] == "Hogar"),
    dict(slug="tecnologia", titulo="Tecnología",
         h1="Tecnología útil para el día a día",
         desc="Gadgets, audio, accesorios y tecnología práctica seleccionada. Consulta precio y compatibilidad en Amazon.es.",
         intro=["Tecnología que se usa de verdad: audio, accesorios para el móvil, dispositivos para casa y pequeños gadgets prácticos.",
                "Comprueba siempre en Amazon.es la compatibilidad con tu móvil u ordenador antes de comprar."],
         filtro=lambda p: p["category"] == "Tecnología"),
    dict(slug="belleza", titulo="Belleza",
         h1="Belleza y cuidado personal",
         desc="Cosmética, cuidado de la piel, perfumes y cuidado personal seleccionados. Consulta precio y detalles en Amazon.es.",
         intro=["Cuidado de la piel, cabello, perfumes y básicos de cuidado personal de marcas conocidas.",
                "Si tienes la piel sensible o alguna alergia, revisa la lista de ingredientes en la ficha de Amazon.es antes de comprar."],
         filtro=lambda p: p["category"] == "Belleza"),
]

CSS = """
:root{--ink:#f3eee7;--subtle:#b9b1a6;--edge:#2b2c33;--canvas:#111216;--card:#191a20;--bronze:#d9a46f}
*{box-sizing:border-box}
body{margin:0;background:var(--canvas);color:var(--ink);font:16px/1.6 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
a{color:var(--bronze)}
.top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--edge)}
.top img{width:34px;height:34px}
.top a.brand{color:var(--ink);font:600 22px Georgia,serif;text-decoration:none}
.aff{font-size:12.5px;color:var(--subtle);text-align:center;padding:8px 16px;border-bottom:1px solid var(--edge)}
.wrap{max-width:900px;margin:0 auto;padding:22px 18px 50px}
nav.crumbs{font-size:13px;color:var(--subtle);margin-bottom:8px}
h1{font-size:28px;line-height:1.25;margin:4px 0 12px}
.intro p{color:#ddd5ca;margin:0 0 10px}
.guias{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 22px;padding:0;list-style:none}
.guias a{display:inline-block;padding:7px 13px;border:1px solid var(--edge);border-radius:999px;text-decoration:none;font-size:14px}
.guias a[aria-current]{background:var(--bronze);color:#111;border-color:var(--bronze)}
ol.lista{list-style:none;margin:0;padding:0;display:grid;gap:10px}
ol.lista li{background:var(--card);border:1px solid var(--edge);border-radius:12px;padding:14px 16px;display:flex;gap:14px;align-items:center;justify-content:space-between}
ol.lista h2{font-size:16px;margin:0 0 3px;line-height:1.35}
ol.lista p{margin:0;color:var(--subtle);font-size:14px}
.btn{flex:none;padding:9px 14px;border:1px solid var(--bronze);border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap}
.cta{margin:26px 0 0;text-align:center}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
.skip-link{position:absolute;left:12px;top:-60px;z-index:100;background:var(--bronze);color:#111216;padding:10px 16px;border-radius:8px;font-weight:600}.skip-link:focus{top:12px}main:focus{outline:none}
a:focus-visible{outline:3px solid #e7bc83;outline-offset:2px}
.navt{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--subtle);margin:18px 0 -10px}
.consejos{background:var(--card);border:1px solid var(--edge);border-radius:12px;padding:12px 16px 12px 34px;margin:6px 0 20px;color:#ddd5ca}
.consejos li{margin:4px 0}
h2.sec{font-size:18px;margin:18px 0 8px}
footer{border-top:1px solid var(--edge);padding:18px;font-size:12.5px;color:var(--subtle);text-align:center}
footer p{margin:0 0 6px}
@media(max-width:560px){ol.lista li{flex-direction:column;align-items:flex-start}h1{font-size:24px}}
"""

def e(s): return html.escape(str(s or ""), quote=True)

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: "
       "https://m.media-amazon.com https://images-na.ssl-images-amazon.com https://*.alicdn.com https://*.aliexpress-media.com "
       "https://velans.goatcounter.com; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; "
       "base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests")


def pildoras(lista, actual):
    return "".join(
        f'<li><a href="{x["slug"]}.html"{" aria-current=\"page\"" if x is actual else ""}>{e(x["titulo"])}</a></li>'
        for x in lista)


def pagina(g, items):
    url = f"{SITE}/{g['slug']}.html"
    es_regalo = g in GUIAS_REGALO
    filas = []
    for p in items:
        d = p.get("description") or ""
        if "Consulta el precio" in d: d = ""
        filas.append(
            f'<li><div><h2>{e(p["name"])}</h2>{f"<p>{e(d)}</p>" if d else ""}</div>'
            f'<a class="btn" href="{e(p["affiliateUrl"])}" rel="sponsored noopener" target="_blank">Ver en Amazon<span class="sr-only">: {e(p["name"])} (enlace de afiliado, se abre en otra pestaña)</span></a></li>')
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": g["h1"], "url": url,
          "description": g["desc"], "isPartOf": {"@type": "WebSite", "name": "Velan’s", "url": SITE + "/"}}
    if es_regalo:
        ld["mainEntity"] = {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": p["name"]} for i, p in enumerate(items)]}
    miga = (f'<a href="./">Inicio</a> › <a href="ideas-para-regalar.html">Ideas para regalar</a> › {e(g["titulo"])}'
            if es_regalo else f'<a href="./">Inicio</a> › {e(g["titulo"])}')
    consejos = ""
    if g.get("consejos"):
        consejos = ('<h2 class="sec">Consejos para acertar</h2><ul class="consejos">'
                    + "".join(f"<li>{e(c)}</li>" for c in g["consejos"]) + "</ul>")
    titulo_lista = '<h2 class="sec">Nuestra selección</h2>' if es_regalo else ""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<script src="./velans-seguridad.js"></script>
<script src="./velans-analitica.js" defer></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(g['h1'])} | Velan’s</title>
<meta name="description" content="{e(g['desc'])}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Velan’s">
<meta property="og:title" content="{e(g['h1'])}">
<meta property="og:description" content="{e(g['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og-velans.png">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="top"><img src="velans-v-metal.png" alt="" width="34" height="34"><a class="brand" href="./">Velan’s</a></header>
<aside class="aff" aria-label="Aviso de afiliación"><strong>Enlaces de afiliado:</strong> si compras a través de Velan’s, Amazon nos paga una pequeña comisión. A ti te cuesta lo mismo.</aside>
<main class="wrap" id="contenido" tabindex="-1">
<nav class="crumbs" aria-label="Estás en">{miga}</nav>
<h1>{e(g['h1'])}</h1>
<div class="intro">{''.join(f'<p>{e(x)}</p>' for x in g['intro'])}</div>
<p class="navt">Regalos de Navidad</p>
<nav aria-label="Regalos de Navidad"><ul class="guias">{pildoras([GUIAS[0]] + GUIAS_REGALO, g)}</ul></nav>
<p class="navt">Categorías</p>
<nav aria-label="Categorías"><ul class="guias">{pildoras(GUIAS[1:], g)}</ul></nav>
{consejos}
{titulo_lista}
<ol class="lista">
{chr(10).join(filas)}
</ol>
<p class="cta"><a href="./">Ver toda la selección de Velan’s →</a></p>
</main>
<footer>
<p>En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio y la disponibilidad se consultan siempre en Amazon.es.</p>
<p><a href="guias-de-compra.html">Guías de compra</a> · <a href="sobre-velans.html">Quiénes somos</a> · <a href="https://t.me/velans_chollos" rel="noopener">Telegram</a> · <a href="aviso-legal.html">Aviso legal, privacidad y cookies</a></p>
</footer>

<!-- Velan’s Assistence: único punto de inserción -->
<link rel="stylesheet" href="./velans-assistence.css?v=5.0.1">
<script src="./velans-assistence.js?v=5.3.0" defer></script>
</body>
</html>
"""


por_ref = {p["ref"]: p for p in productos}


def items_regalo(g):
    out = []
    for ref, nombre, texto in g["items"]:
        if ref not in por_ref: sys.exit(f"{g['slug']}: no existe {ref} en el catálogo")
        p = dict(por_ref[ref])
        if nombre: p["name"] = nombre
        if texto: p["description"] = texto
        out.append(p)
    return out


urls = [f"{SITE}/"]
for g in GUIAS:
    items = [p for p in productos if g["filtro"](p)]
    # primero el catálogo seleccionado a mano, luego el resto
    items.sort(key=lambda p: (p["source"] != "web", p["name"].lower()))
    (ROOT / f"{g['slug']}.html").write_text(pagina(g, items), encoding="utf-8")
    urls.append(f"{SITE}/{g['slug']}.html")
    print(f"{g['slug']}: {len(items)} productos")
for g in GUIAS_REGALO:
    items = items_regalo(g)
    (ROOT / f"{g['slug']}.html").write_text(pagina(g, items), encoding="utf-8")
    urls.append(f"{SITE}/{g['slug']}.html")
    print(f"{g['slug']}: {len(items)} productos")
# Guías de compra (artículos propios) y comparativas de productos de Amazon
import plantilla_web, articulos, amazon_guias  # noqa: E402
urls += articulos.generar(plantilla_web.pagina_base, plantilla_web.POOL, plantilla_web.tarjeta, amazon_guias.GUIAS_AMAZON)
urls += amazon_guias.generar(plantilla_web.pagina_base, plantilla_web.fecha_es)
urls += [f"{SITE}/aviso-legal.html", f"{SITE}/creditos-imagenes.html"]

(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc><lastmod>{HOY}</lastmod></url>\n" for u in urls)
    + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(
    f"User-agent: *\nAllow: /\n# Datos internos del Manager (en pausa): no indexar\nDisallow: /data/\nDisallow: /img/pines/\n\nSitemap: {SITE}/sitemap.xml\n",
    encoding="utf-8")
