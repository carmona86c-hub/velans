#!/usr/bin/env python3
"""Genera las páginas de guía (HTML estático, indexable) con las ofertas de AliExpress.

Velan’s trabaja solo con AliExpress (programa de afiliados de AliExpress). Los datos salen de
aliexpress-productos.js, que la API de afiliados actualiza cada día; este script se ejecuta después.
Uso: python3 scripts/guias.py   (desde la raíz del repositorio)
"""
import html, json, re, sys, unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from guias_navidad import GUIAS_REGALO as _GUIAS_NAVIDAD  # noqa: E402
SITE = "https://velans.es"
HOY = date.today().isoformat()

t = (ROOT / "aliexpress-productos.js").read_text(encoding="utf-8")
DATOS = json.loads(t[t.index("{"):t.rindex("}") + 1])
ACT = DATOS.get("actualizado") or HOY


def fiable(p): return (p.get("valoracion") or 0) >= 85 and (p.get("ventas") or 0) >= 20 and p.get("precio") and p.get("enlace")


POOL = {}
for p in DATOS.get("masVendidos", []) + DATOS.get("productos", []):
    if fiable(p): POOL.setdefault(p["id"], p)
POOL = list(POOL.values())


def norm(x): return unicodedata.normalize("NFD", str(x).lower()).encode("ascii", "ignore").decode()


def sin_amazon(texto):
    """Quita las frases que hablaban de Amazon en los textos editoriales."""
    frases = re.split(r"(?<=[.!?])\s+", texto)
    return " ".join(f for f in frases if "amazon" not in f.lower()).strip()


# Cómo se eligen los artículos de AliExpress de cada guía (palabras sin tildes).
# kw: suman; no: descartan; cats: de qué categorías se rellena si faltan artículos.
NUNCA = "movimiento reemplazo repuesto tornillo broca soldadura pasamontanas tactico cordones plantillas brocas perro perros gato gatos mascota"
CLAVES = {
    "regalos-para-mujer": dict(kw="mujer mujeres senoras reloj pendientes collar pulsera bolso bufanda maquillaje anillo joyero espejo gafas", no="hombre", cats="Belleza Moda"),
    "regalos-para-hombre": dict(kw="hombre hombres reloj cartera cinturon afeitadora barba auriculares botas guantes gafas", no="mujer mujeres nina ninas bebe", cats="Moda Tecnología"),
    "regalos-para-padre": dict(kw="hombre reloj cartera coche herramienta afeitadora barbacoa linterna arrancador compresor maletero", no="mujer mujeres nina ninas bebe", cats="Tecnología Hogar"),
    "regalos-para-madre": dict(kw="mujer bolso crema cocina manta pendientes organizador masaje joyero espejo maquillaje", no="hombre", cats="Hogar Belleza"),
    "regalos-para-adolescentes": dict(kw="auriculares gaming raton teclado mando altavoz smartwatch inteligente luces led tira gafas", no="bebe", cats="Tecnología"),
    "regalos-para-ninos": dict(kw="ninos nino nina ninas infantil juguete juguetes bloques peluche puzzle", no="", cats=""),
    "regalos-amigo-invisible": dict(kw="organizador taza calcetines llavero luces luz led mini soporte lampara nocturna", no="", cats="Hogar Tecnología"),
}


def palabras(p): return set(re.sub(r"[^a-z0-9]+", " ", norm(p["nombre"])).split())


def elegir(cfg, n=16, max_precio=None):
    kw, no, nunca = set(cfg["kw"].split()), set(cfg["no"].split()), set(NUNCA.split())
    ok = lambda p: not (palabras(p) & nunca) and (max_precio is None or p["precio"] <= max_precio)
    def puntos(p):
        w = palabras(p)
        if w & no and not (w & kw - {"reloj", "gafas"}): return 0
        return len(w & kw)
    cand = sorted([p for p in POOL if ok(p) and puntos(p)], key=lambda p: (-puntos(p), -(p.get("ventas") or 0)))
    relleno = sorted([p for p in POOL if ok(p) and p.get("categoria") in cfg["cats"].split() and not (palabras(p) & no)],
                     key=lambda p: -(p.get("ventas") or 0))
    out, vistos = [], set()
    for p in cand + relleno:
        k = " ".join(sorted(palabras(p)))[:0] + " ".join(norm(p["nombre"]).split()[:3])
        if any(q["id"] == p["id"] for q in out) or k in vistos: continue
        out.append(p); vistos.add(k)
        if len(out) == n: break
    return out


# Fuera de las guías: mascotas, herramientas de obra y personajes con licencia (suelen ser imitaciones).
VETADO = re.compile(r"gat[oa]s?\b|gatera|perr[oa]s?\b|mascota|hormig[oó]n|\bsds\b|taladr|broca|martillo|pok[eé]mon|disney|marvel|barbie|\blego\b|hello kitty|stitch|sonic|mario|harry potter|spider|frozen|bluey|paw patrol|minecraft|naruto|one piece|dragon ball|pikachu|kuromi|sanrio|cinnamoroll|labubu|my melody", re.I)


def items_regalo(slug):
    """Primero las búsquedas propias de la guía (API de AliExpress); si faltan, se completa con el resto."""
    tope = 15 if slug == "regalos-amigo-invisible" else None
    propios = [p for p in (DATOS.get("regalos") or {}).get(slug, []) if fiable(p) and not VETADO.search(p["nombre"]) and (tope is None or p["precio"] <= tope)]
    resto = [p for p in elegir(CLAVES[slug], max_precio=tope) if p["id"] not in {q["id"] for q in propios} and not VETADO.search(p["nombre"])]
    return (propios + resto)[:16] if len(propios) < 12 else propios[:20]


GUIAS_REGALO = []
for g in _GUIAS_NAVIDAD:
    GUIAS_REGALO.append(dict(
        slug=g["slug"], titulo=g["titulo"], h1=g["h1"],
        desc=re.sub(r"\s*Elige en Velan’s y compra en Amazon\.es\.?|\s*Elige en Velan’s y cómpralo en Amazon\.es\.?", "", g["desc"]).replace("Amazon.es", "AliExpress").rstrip(".") + ". Ofertas de AliExpress con precio actualizado cada día.",
        intro=[x for x in (sin_amazon(i) for i in g["intro"]) if x] + ["Todos los artículos son de AliExpress, de tiendas con buena valoración y ventas reales, y se actualizan cada día con el precio y el descuento que indica AliExpress."],
        consejos=[c for c in (sin_amazon(c) for c in g.get("consejos", [])) if c] + ["Mira el plazo de entrega en AliExpress antes de comprar: si es para Navidad o Reyes, pídelo con margen."],
        items=lambda g=g: items_regalo(g["slug"])))

GUIAS = [
    dict(slug="ideas-para-regalar", titulo="Ideas para regalar",
         h1="Ideas para regalar que siempre aciertan",
         desc="Regalos que gustan a casi todo el mundo, elegidos entre lo más vendido y mejor valorado de AliExpress, con precio actualizado cada día.",
         intro=["Encontrar un regalo que guste no debería ser difícil. Aquí reunimos lo que más se compra en AliExpress de tiendas bien valoradas: tecnología práctica, detalles para casa, moda y cuidado personal.",
                "Cada artículo lleva a AliExpress, donde ves el precio final, el envío y las condiciones antes de decidir."],
         items=lambda: sorted(POOL, key=lambda p: -(p.get("ventas") or 0))[:24]),
] + [
    dict(slug=slug, titulo=tit, h1=h1, desc=desc, intro=intro,
         items=lambda cat=cat: sorted([p for p in POOL if p.get("categoria") == cat],
                                      key=lambda p: (-(p.get("descuento") or 0), -(p.get("ventas") or 0)))[:30])
    for slug, cat, tit, h1, desc, intro in [
        ("moda", "Moda", "Moda", "Moda: las mayores rebajas de AliExpress",
         "Ropa, calzado y accesorios con las mayores rebajas de AliExpress, de tiendas fiables y actualizados cada día.",
         ["Ropa, calzado y complementos rebajados en AliExpress, solo de tiendas con buena valoración y ventas reales.",
          "Revisa la guía de tallas de cada artículo en AliExpress antes de comprar: las tallas asiáticas suelen ser más pequeñas."]),
        ("hogar-y-cocina", "Hogar", "Hogar y cocina", "Hogar y cocina: rebajas útiles para casa",
         "Orden, cocina, iluminación y limpieza: las mayores rebajas de hogar en AliExpress, actualizadas cada día.",
         ["Artículos para que la casa sea más cómoda: orden, cocina, iluminación y limpieza, con las mayores rebajas de AliExpress.",
          "En aparatos eléctricos, comprueba en la ficha que el enchufe es europeo (tipo EU)."]),
        ("tecnologia", "Tecnología", "Tecnología", "Tecnología: rebajas en gadgets y accesorios",
         "Cables, cargadores, audio y gadgets con las mayores rebajas de AliExpress, de tiendas fiables y actualizados cada día.",
         ["Accesorios para el móvil, audio, cargadores y pequeños gadgets con grandes descuentos en AliExpress.",
          "Comprueba en la ficha la compatibilidad con tu móvil u ordenador antes de comprar."]),
        ("belleza", "Belleza", "Belleza", "Belleza y cuidado personal en oferta",
         "Cuidado personal, maquillaje y accesorios de belleza con las mayores rebajas de AliExpress, actualizados cada día.",
         ["Cuidado personal, maquillaje y accesorios de belleza rebajados en AliExpress.",
          "Si tienes la piel sensible, revisa los ingredientes en la ficha antes de comprar."]),
        ("deportes", "Deportes", "Deportes", "Deporte y aire libre: rebajas en AliExpress",
         "Ropa y accesorios de deporte, ciclismo y aire libre con las mayores rebajas de AliExpress, actualizados cada día.",
         ["Accesorios para entrenar, ciclismo, montaña y aire libre con grandes descuentos en AliExpress.",
          "Fíjate en las medidas y la talla en la ficha de cada artículo."]),
    ]
]


def euro(n): return f"{n:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")
def miles(n): return f"{int(n or 0):,}".replace(",", ".")
def corto(n, k=90):
    n = re.sub(r"\s+", " ", n.replace("\ufffd", "")).strip()
    return n if len(n) <= k else n[:k].rsplit(" ", 1)[0] + "…"


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
ul.rejilla{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:700px){ul.rejilla{grid-template-columns:repeat(4,1fr)}}
li.bf{position:relative;background:var(--card);border:1px solid var(--edge);border-radius:12px;padding:8px 8px 10px;display:flex;flex-direction:column}
li.bf .ph{display:block;border-radius:9px;overflow:hidden;background:#fff;aspect-ratio:1}
li.bf img{width:100%;height:100%;object-fit:contain;display:block}
li.bf .dto{position:absolute;top:14px;left:14px;background:#c8102e;color:#fff;font-weight:700;font-size:13px;padding:3px 8px;border-radius:7px}
li.bf h2{font-size:13.5px;line-height:1.35;margin:8px 0 4px;font-weight:500}
li.bf h2 a{color:var(--ink);text-decoration:none}
li.bf h2 a:hover{text-decoration:underline}
li.bf .pr{margin:auto 0 0;font-size:16px}
li.bf .pr strong{color:#fff}
li.bf del{color:var(--subtle);font-size:13px;margin-left:4px}
li.bf .nt{margin:2px 0 0;font-size:12px;color:var(--subtle)}
.upd{font-size:13px;color:var(--subtle);margin:16px 0 0}
"""

def e(s): return html.escape(str(s or ""), quote=True)

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: "
       "https://*.alicdn.com https://*.aliexpress-media.com "
       "https://velans.goatcounter.com; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; "
       "base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests")


def pildoras(lista, actual):
    return "".join(
        f'<li><a href="{x["slug"]}.html"{" aria-current=\"page\"" if x is actual else ""}>{e(x["titulo"])}</a></li>'
        for x in lista)


def pagina_base(titulo, desc, url, cuerpo, ld, extra=""):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<script src="./velans-seguridad.js"></script>
<script src="./velans-analitica.js" defer></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titulo)} | Velan’s</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Velan’s">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og-velans.png">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}{extra}</style>
</head>
<body>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="top"><img src="velans-v-metal.png" alt="" width="34" height="34"><a class="brand" href="./">Velan’s</a></header>
<aside class="aff" aria-label="Aviso de afiliación"><strong>Enlaces de afiliado:</strong> si compras a través de Velan’s, AliExpress nos paga una pequeña comisión. A ti te cuesta lo mismo.</aside>
<main class="wrap" id="contenido" tabindex="-1">
{cuerpo}
</main>
<footer>
<p>Velan’s participa en el programa de afiliados de AliExpress: si compras desde estos enlaces podemos recibir una comisión, sin coste extra para ti. El precio y la disponibilidad se consultan siempre en AliExpress.</p>
<p><a href="guias-de-compra.html">Guías de compra</a> · <a href="sobre-velans.html">Quiénes somos</a> · <a href="https://t.me/velans_chollos" rel="noopener">Telegram</a> · <a href="aviso-legal.html">Aviso legal, privacidad y cookies</a></p>
</footer>

<!-- Velan’s Assistence: único punto de inserción -->
<link rel="stylesheet" href="./velans-assistence.css?v=5.0.1">
<script src="./velans-assistence.js?v=5.3.0" defer></script>
</body>
</html>
"""


def tarjeta(p):
    dto = int(p.get("descuento") or 0); antes = p.get("precioAntes") or 0
    return (
        f'<li class="bf"><a class="ph" href="{e(p["enlace"])}" rel="sponsored noopener noreferrer" target="_blank" tabindex="-1" aria-hidden="true">'
        f'<img src="{e(p["imagen"])}" alt="" loading="lazy" width="320" height="320"></a>'
        + (f'<span class="dto"><span aria-hidden="true">−{dto}%</span><span class="sr-only">Descuento del {dto} %</span></span>' if dto > 0 else "")
        + f'<h2><a href="{e(p["enlace"])}" rel="sponsored noopener noreferrer" target="_blank">{e(corto(p["nombre"]))}<span class="sr-only"> (en AliExpress, se abre en otra pestaña)</span></a></h2>'
        f'<p class="pr"><strong>{euro(p["precio"])}</strong>'
        + (f' <del><span class="sr-only">Precio anterior: </span>{euro(antes)}</del>' if antes > p["precio"] else "")
        + f'</p><p class="nt"><span aria-hidden="true">★</span><span class="sr-only">Valoración: </span>{round(p.get("valoracion") or 0)} % · {miles(p.get("ventas"))} vendidos</p></li>')


def pagina(g, items):
    url = f"{SITE}/{g['slug']}.html"
    es_regalo = g in GUIAS_REGALO
    filas = [tarjeta(p) for p in items]
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": g["h1"], "url": url,
          "description": g["desc"], "isPartOf": {"@type": "WebSite", "name": "Velan’s", "url": SITE + "/"}}
    if es_regalo:
        ld["mainEntity"] = {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": corto(p["nombre"])} for i, p in enumerate(items)]}
    miga = (f'<a href="./">Inicio</a> › <a href="ideas-para-regalar.html">Ideas para regalar</a> › {e(g["titulo"])}'
            if es_regalo else f'<a href="./">Inicio</a> › {e(g["titulo"])}')
    consejos = ""
    if g.get("consejos"):
        consejos = ('<h2 class="sec">Consejos para acertar</h2><ul class="consejos">'
                    + "".join(f"<li>{e(c)}</li>" for c in g["consejos"]) + "</ul>")
    titulo_lista = '<h2 class="sec">Nuestra selección</h2>' if es_regalo else ""
    cuerpo = f"""
<nav class="crumbs" aria-label="Estás en">{miga}</nav>
<h1>{e(g['h1'])}</h1>
<div class="intro">{''.join(f'<p>{e(x)}</p>' for x in g['intro'])}</div>
<p class="navt">Regalos de Navidad</p>
<nav aria-label="Regalos de Navidad"><ul class="guias">{pildoras([GUIAS[0]] + GUIAS_REGALO, g)}</ul></nav>
<p class="navt">Categorías</p>
<nav aria-label="Categorías"><ul class="guias">{pildoras(GUIAS[1:], g)}</ul></nav>
{consejos}
{titulo_lista}
<ul class="rejilla">
{chr(10).join(filas)}
</ul>
<p class="upd">Precios, precios anteriores y descuentos indicados por AliExpress el {fecha_es(ACT)}. Pueden cambiar y no incluyen el envío: comprueba el precio final en AliExpress.</p>
<p class="cta"><a href="./">Ver todas las rebajas de AliExpress en Velan’s →</a> · <a href="https://t.me/velans_chollos" rel="noopener">Chollos diarios en Telegram</a></p>
"""
    return pagina_base(g["h1"], g["desc"], url, cuerpo, ld)



MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split()


def fecha_es(iso):
    y, m, d = map(int, iso[:10].split("-")); return f"{d} de {MESES[m - 1]} de {y}"


urls = [f"{SITE}/"]
for g in GUIAS + GUIAS_REGALO:
    items = g["items"]()
    (ROOT / f"{g['slug']}.html").write_text(pagina(g, items), encoding="utf-8")
    urls.append(f"{SITE}/{g['slug']}.html")
    print(f"{g['slug']}: {len(items)} productos")
if (ROOT / "black-friday.html").exists(): urls.append(f"{SITE}/black-friday.html")
import articulos  # noqa: E402
import amazon_guias  # noqa: E402
urls += articulos.generar(pagina_base, POOL, tarjeta, amazon_guias.GUIAS_AMAZON)
urls += amazon_guias.generar(pagina_base, articulos.fecha_es)
urls += [f"{SITE}/aviso-legal.html"]

(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc><lastmod>{HOY}</lastmod></url>\n" for u in urls)
    + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(
    f"User-agent: *\nAllow: /\n# Datos internos del Manager (en pausa): no indexar\nDisallow: /data/\nDisallow: /img/pines/\n\nSitemap: {SITE}/sitemap.xml\n",
    encoding="utf-8")
