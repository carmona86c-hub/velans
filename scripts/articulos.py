#!/usr/bin/env python3
"""Artículos de Velan's (guías de compra originales) y página «Quiénes somos».

Genera <slug>.html para cada artículo de articulos_texto.py, el índice guias-de-compra.html y
sobre-velans.html. Al final de cada artículo enseña ofertas relacionadas de AliExpress (si las hay).
Lo llama scripts/guias.py, que también los añade al sitemap.
"""
import html, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://velans.es"
sys.path.insert(0, str(ROOT / "scripts"))
from articulos_texto import ARTICULOS  # noqa: E402

PUBLICADO = "2026-11-20"  # fecha de publicación de la primera tanda


def e(s): return html.escape(str(s or ""), quote=True)
def norm(x): return unicodedata.normalize("NFD", str(x).lower()).encode("ascii", "ignore").decode()
def euro(n): return f"{n:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


EXTRA = """
article p{color:#ddd5ca;margin:0 0 12px}
article h2{font-size:21px;margin:28px 0 10px}
article ul{color:#ddd5ca;padding-left:22px;margin:0 0 14px}
article li{margin:5px 0}
.meta{font-size:13px;color:var(--subtle);margin:-4px 0 18px}
.lead{font-size:18px;color:#ece5db}
.rel{background:var(--card);border:1px solid var(--edge);border-radius:14px;padding:14px 16px;margin:30px 0 0}
.rel h2{margin-top:0}
ul.arts{list-style:none;padding:0;margin:0;display:grid;gap:10px}
ul.arts a{display:block;padding:14px 16px;background:var(--card);border:1px solid var(--edge);border-radius:12px;text-decoration:none}
ul.arts b{display:block;color:var(--ink);font-size:16px;margin-bottom:3px}
ul.arts span{color:var(--subtle);font-size:14px}
"""


def bloque(x):
    if isinstance(x, tuple) and x[0] == "ul":
        return "<ul>" + "".join(f"<li>{e(i)}</li>" for i in x[1]) + "</ul>"
    return f"<p>{e(x)}</p>"


def relacionados(pool, claves, n=4):
    if not claves: return []
    pal = claves.split()
    def puntos(p):
        w = set(re.sub(r"[^a-z0-9]+", " ", norm(p["nombre"])).split())
        return len(w & set(pal))
    c = sorted([p for p in pool if puntos(p)], key=lambda p: (-puntos(p), -(p.get("ventas") or 0)))
    out, vistos = [], set()
    for p in c:
        k = " ".join(norm(p["nombre"]).split()[:3])
        if k in vistos: continue
        out.append(p); vistos.add(k)
        if len(out) == n: break
    return out


def generar(pagina_base, pool, tarjeta):
    """pagina_base(titulo, desc, url, cuerpo, ld, extra_css) → HTML completo (plantilla de guias.py)."""
    urls = []
    for a in ARTICULOS:
        url = f"{SITE}/{a['slug']}.html"
        rel = relacionados(pool, a["claves"])
        cuerpo = (f'<nav class="crumbs" aria-label="Estás en"><a href="./">Inicio</a> › <a href="guias-de-compra.html">Guías de compra</a></nav>'
                  f'<article><h1>{e(a["titulo"])}</h1><p class="meta">Por el equipo de Velan’s · {e(fecha_es(a.get("fecha", PUBLICADO)))}</p>'
                  f'<p class="lead">{e(a["intro"])}</p>'
                  + "".join(f'<h2>{e(h)}</h2>' + "".join(bloque(x) for x in xs) for h, xs in a["secciones"])
                  + "</article>")
        if rel:
            cuerpo += ('<section class="rel" aria-labelledby="h-rel"><h2 id="h-rel">Ofertas relacionadas en AliExpress</h2>'
                       '<p class="nota">Seleccionadas entre lo más vendido y mejor valorado; precio indicado por AliExpress hoy.</p>'
                       f'<ul class="rejilla">{"".join(tarjeta(p) for p in rel)}</ul></section>')
        otros = [x for x in ARTICULOS if x is not a][:4]
        cuerpo += ('<h2 class="sec">Otras guías de compra</h2><ul class="arts">'
                   + "".join(f'<li><a href="{x["slug"]}.html"><b>{e(x["titulo"])}</b><span>{e(x["desc"])}</span></a></li>' for x in otros) + "</ul>")
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": a["titulo"], "description": a["desc"],
              "url": url, "inLanguage": "es-ES", "datePublished": a.get("fecha", PUBLICADO), "dateModified": a.get("fecha", PUBLICADO),
              "author": {"@type": "Organization", "name": "Velan’s", "url": SITE + "/"},
              "publisher": {"@type": "Organization", "name": "Velan’s", "logo": {"@type": "ImageObject", "url": f"{SITE}/logo-velans-512.png"}}}
        (ROOT / f"{a['slug']}.html").write_text(pagina_base(a["titulo"], a["desc"], url, cuerpo, ld, EXTRA), encoding="utf-8")
        urls.append(url)

    # Índice
    url = f"{SITE}/guias-de-compra.html"
    cuerpo = ('<nav class="crumbs" aria-label="Estás en"><a href="./">Inicio</a> › Guías de compra</nav>'
              '<h1>Guías de compra de Velan’s</h1>'
              '<div class="intro"><p>Explicaciones claras para comprar mejor: qué mirar antes de elegir, qué siglas importan y qué es solo marketing. '
              'Las escribimos nosotros, a partir de cómo seleccionamos cada día las ofertas de la web.</p></div>'
              '<ul class="arts">' + "".join(f'<li><a href="{x["slug"]}.html"><b>{e(x["titulo"])}</b><span>{e(x["desc"])}</span></a></li>' for x in ARTICULOS) + "</ul>")
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Guías de compra de Velan’s", "url": url,
          "hasPart": [{"@type": "Article", "headline": x["titulo"], "url": f"{SITE}/{x['slug']}.html"} for x in ARTICULOS]}
    (ROOT / "guias-de-compra.html").write_text(pagina_base("Guías de compra", "Guías de compra originales de Velan’s: cómo elegir auriculares, cargadores, smartwatch, power bank, iluminación LED y más, y cómo comprar en AliExpress sin sustos.", url, cuerpo, ld, EXTRA), encoding="utf-8")
    urls.insert(0, url)

    # Quiénes somos
    url = f"{SITE}/sobre-velans.html"
    cuerpo = ('<nav class="crumbs" aria-label="Estás en"><a href="./">Inicio</a> › Quiénes somos</nav>'
              '<article><h1>Quiénes somos y cómo elegimos</h1>'
              '<p class="lead">Velan’s es un proyecto independiente hecho en España. Cada día revisamos miles de artículos para quedarnos solo con los que merecen la pena: lo más vendido y lo más rebajado de tiendas fiables.</p>'
              '<h2>Cómo seleccionamos</h2>'
              + bloque(("ul", ["Solo artículos con al menos un 85 % de valoraciones positivas y ventas reales.",
                               "De lo más vendido, buscamos la oferta más barata del mismo artículo en otra tienda fiable.",
                               "Descartamos productos con títulos engañosos, réplicas o contenido para adultos.",
                               "Los precios y descuentos se actualizan cada día con los datos que facilita la tienda."]))
              + '<h2>Qué no hacemos</h2>'
              + bloque("No vendemos nada directamente ni cobramos por aparecer en la web. Ninguna tienda ni marca nos paga por recomendar un artículo concreto. Si compras desde nuestros enlaces de afiliado podemos recibir una pequeña comisión, sin coste extra para ti; así se financia el proyecto.")
              + '<h2>Dónde encontrarnos</h2>'
              + bloque(("ul", ["Web: velans.es, con guías de regalo y guías de compra.",
                               "Canal de Telegram con chollos diarios: t.me/velans_chollos.",
                               "Pinterest: Velan’s (velans_oficial).",
                               "Contacto: contacto@velans.es."]))
              + '<p>Titular: David Carmona Córdoba. Más información en el <a href="aviso-legal.html">aviso legal</a>.</p></article>')
    ld = {"@context": "https://schema.org", "@type": "AboutPage", "name": "Quiénes somos", "url": url,
          "about": {"@type": "Organization", "name": "Velan’s", "url": SITE + "/", "email": "contacto@velans.es"}}
    (ROOT / "sobre-velans.html").write_text(pagina_base("Quiénes somos y cómo elegimos", "Quiénes somos en Velan’s y cómo seleccionamos cada día lo más vendido y lo más rebajado de tiendas fiables.", url, cuerpo, ld, EXTRA), encoding="utf-8")
    urls.append(url)
    return urls


MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split()


def fecha_es(iso):
    y, m, d = map(int, iso[:10].split("-")); return f"{d} de {MESES[m - 1]} de {y}"
