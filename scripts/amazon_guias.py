#!/usr/bin/env python3
"""Comparativas de productos de Amazon (texto propio, sin fotos ni precios: no hay API).

AMAZON_TAG: identificador de afiliado de Amazon. Vacío mientras no haya cuenta aprobada:
los enlaces van a Amazon.es sin identificador y el aviso lo dice. Al tener el nuevo ID,
se pone aquí y se vuelve a ejecutar scripts/guias.py.
"""
import html, json, sys, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://velans.es"
sys.path.insert(0, str(ROOT / "scripts"))
from amazon_guias_texto import GUIAS_AMAZON  # noqa: E402

AMAZON_TAG = ""  # p. ej. "velans0X-21" cuando Amazon apruebe la nueva solicitud
PUBLICADO = "2026-11-20"


def e(s): return html.escape(str(s or ""), quote=True)


def enlace(q):
    url = "https://www.amazon.es/s?k=" + urllib.parse.quote_plus(q)
    return url + (f"&tag={AMAZON_TAG}" if AMAZON_TAG else "")


AVISO = ("En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables."
         if AMAZON_TAG else
         "Los enlaces a Amazon de esta guía son informativos: ahora mismo Velan’s no recibe ninguna comisión por ellos. El precio y la disponibilidad se consultan siempre en Amazon.es.")

EXTRA = """
.ficha{background:var(--card);border:1px solid var(--edge);border-radius:14px;padding:16px;margin:14px 0}
.ficha h3{margin:0 0 6px;font-size:19px;color:var(--ink)}.ficha .sub{color:var(--subtle);font-weight:500;font-size:15px}
.ficha h4{font-size:14px;margin:8px 0 4px;color:var(--bronze)}.ficha ul{margin:0 0 8px}
.pc{display:grid;gap:4px}@media(min-width:700px){.pc{grid-template-columns:1fr 1fr;gap:16px}}
.btn.grande{display:inline-block;padding:12px 20px;font-size:16px;background:var(--bronze);color:#111;border-radius:10px;text-decoration:none;font-weight:700;margin-top:6px}
table.cmp{width:100%;border-collapse:collapse;margin:14px 0 6px;font-size:14px}
table.cmp caption{text-align:left;font-weight:700;margin-bottom:6px;color:var(--ink)}
table.cmp th,table.cmp td{border-bottom:1px solid var(--edge);padding:8px 6px;text-align:left;color:#ddd5ca;vertical-align:top}
.aviso{background:#2a2118;border:1px solid var(--bronze);border-radius:12px;padding:12px 14px;margin:26px 0 0;font-size:14px;color:#f1e5d6}
"""


def generar(pagina_base, fecha_es):
    urls = []
    for g in GUIAS_AMAZON:
        url = f"{SITE}/{g['slug']}.html"
        tabla = ('<table class="cmp"><caption>En resumen: cuál elegir</caption><thead><tr><th scope="col">Si buscas…</th><th scope="col">Te recomendamos</th></tr></thead><tbody>'
                 + "".join(f"<tr><td>{e(a)}</td><th scope=\"row\">{e(b)}</th></tr>" for a, b in g["resumen"]) + "</tbody></table>")
        fichas = ""
        for p in g["productos"]:
            fichas += (f'<section class="ficha"><h3>{e(p["nombre"])} <span class="sub">· {e(p["sub"])}</span></h3><p>{e(p["res"])}</p>'
                       '<div class="pc"><div><h4>A favor</h4><ul>' + "".join(f"<li>{e(x)}</li>" for x in p["pros"]) + "</ul></div>"
                       '<div><h4>A tener en cuenta</h4><ul>' + "".join(f"<li>{e(x)}</li>" for x in p["cons"]) + "</ul></div></div>"
                       f'<p><strong>Para quién:</strong> {e(p["quien"])}</p>'
                       f'<a class="btn grande" href="{e(enlace(p["q"]))}" rel="{"sponsored " if AMAZON_TAG else ""}noopener" target="_blank">Ver precio en Amazon'
                       f'<span class="sr-only">: {e(p["nombre"])}{" (enlace de afiliado" if AMAZON_TAG else " ("}se abre en otra pestaña)</span></a></section>')
        cuerpo = (f'<nav class="crumbs" aria-label="Estás en"><a href="./">Inicio</a> › <a href="guias-de-compra.html">Guías de compra</a></nav>'
                  f'<article><h1>{e(g["titulo"])}</h1><p class="meta">Por el equipo de Velan’s · Comparativa · {e(fecha_es(g.get("fecha", PUBLICADO)))}</p>'
                  f'<p class="lead">{e(g["intro"])}</p>{tabla}'
                  f'<h2>Los productos, uno a uno</h2>{fichas}'
                  '<h2>Consejos antes de comprar</h2><ul>' + "".join(f"<li>{e(c)}</li>" for c in g["consejos"]) + "</ul>"
                  '<h2>Cómo hacemos estas comparativas</h2><p>Partimos de las especificaciones oficiales de cada producto y de cómo se suele usar, y lo ordenamos por lo que de verdad cambia de uno a otro. No aceptamos dinero de las marcas por aparecer. Las fotos, el precio y las condiciones de venta se consultan en Amazon.es, que es donde se compra.</p>'
                  f'</article><aside class="aviso"><strong>{e(AVISO)}</strong></aside>')
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": g["titulo"], "description": g["desc"], "url": url,
              "inLanguage": "es-ES", "datePublished": g.get("fecha", PUBLICADO), "author": {"@type": "Organization", "name": "Velan’s", "url": SITE + "/"}}
        (ROOT / f"{g['slug']}.html").write_text(pagina_base(g["titulo"], g["desc"], url, cuerpo, ld, EXTRA), encoding="utf-8")
        urls.append(url)
    return urls
