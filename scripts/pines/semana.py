#!/usr/bin/env python3
"""Planifica y dibuja los pines de Pinterest de Velan's para varios días.

- 3 pines al día (13:30, 20:45 y 22:15, hora de Madrid): guías de regalo con fotos CC0
  combinadas sin repetir, Black Friday en su semana y un artículo rebajado de AliExpress.
- Las imágenes se guardan en img/pines/AAAA-MM-DD/ (fuera del buscador) y el plan en plan.json,
  que luego se programa en Metricool.
- img/pines/usados.json recuerda combinaciones de fotos, textos y artículos ya usados.

Uso: python3 scripts/pines/semana.py --desde 2026-11-23 --dias 7 --fotos data/pines
Necesita: pip install playwright pillow, y Chrome (--chrome /usr/bin/google-chrome).
"""
import argparse, hashlib, html, json, re, sys, tempfile, urllib.request
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("--desde", required=True)
ap.add_argument("--dias", type=int, default=7)
ap.add_argument("--fotos", default="data/pines")
ap.add_argument("--chrome", default="/usr/bin/google-chrome")
ap.add_argument("--sin-productos", action="store_true", help="no dibujar pines de artículos (sin internet)")
a = ap.parse_args()

T = json.loads((ROOT / "scripts/pines/temas.json").read_text(encoding="utf-8"))
FOTOS = (ROOT / a.fotos).resolve()
USADOS_F = ROOT / "img/pines/usados.json"
U = json.loads(USADOS_F.read_text(encoding="utf-8")) if USADOS_F.exists() else {"combos": [], "productos": [], "textos": {}, "giro": 0}
d0 = date.fromisoformat(a.desde)
HORAS = ["13:30", "20:45", "22:15"]
BF_PAGINA = (ROOT / "black-friday.html").exists()
SITE = "https://velans.es/"


def e(s): return html.escape(str(s or ""))
def foto(t, i): return (FOTOS / t / f"{i}.jpg").as_uri()
def enlace(ruta, campana): return SITE + ruta + ("&" if "?" in ruta else "?") + f"utm_source=pinterest&utm_campaign={campana}" if "#" not in ruta else SITE + ruta.split("#")[0] + ("&" if "?" in ruta else "?") + f"utm_source=pinterest&utm_campaign={campana}#" + ruta.split("#")[1]
def texto_idx(clave, n):
    i = U["textos"].get(clave, 0); U["textos"][clave] = i + 1; return i % n


FUENTES = "".join(f"@font-face{{font-family:{n};src:url({(ROOT / 'fonts' / f).as_uri()})}}" for n, f in
                  [("S", "noto-serif-latin-600-normal.woff2"), ("R", "roboto-latin-400-normal.woff2"), ("RM", "roboto-latin-500-normal.woff2")])
LOGO = (ROOT / "velans-v-metal.png").as_uri()
BASE = FUENTES + """
*{margin:0;box-sizing:border-box}body{width:1000px;height:1500px;background:#0e0f12;color:#f3ece2;font-family:R;position:relative;overflow:hidden}
.hero{position:absolute;top:0;left:0;width:1000px;height:960px;background-size:cover;background-position:center}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,15,18,.55) 0%,rgba(14,15,18,0) 22%,rgba(14,15,18,0) 55%,#0e0f12 100%)}
.marco{position:absolute;inset:28px;border:2px solid rgba(217,164,107,.75);border-radius:26px;z-index:5}
.logo{position:absolute;top:58px;left:62px;z-index:6;display:flex;align-items:center;gap:16px}
.logo img{width:86px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.6))}
.logo b{font-family:S;font-size:44px;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.sello{position:absolute;top:66px;right:62px;z-index:6;font-family:RM;font-size:22px;letter-spacing:.2em;color:#111;background:#d9a46b;padding:12px 20px;border-radius:40px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.mini{position:absolute;z-index:4;width:250px;height:250px;border-radius:22px;background-size:cover;background-position:center;border:5px solid #d9a46b;box-shadow:0 18px 40px rgba(0,0,0,.6)}
.m1{top:690px;right:330px;transform:rotate(-5deg)}.m2{top:650px;right:70px;transform:rotate(4deg)}
.panel{position:absolute;left:70px;right:70px;top:975px;z-index:6}
.k{font-family:RM;letter-spacing:.24em;font-size:24px;color:#d9a46b}
h1{font-family:S;font-size:112px;line-height:1.02;color:#fff;margin-top:14px}
.s{font-size:36px;line-height:1.3;color:#e3d6c4;margin-top:20px;max-width:820px}
.cta{position:absolute;left:70px;bottom:78px;z-index:6;display:flex;align-items:center;gap:22px}
.cta span{font-family:RM;font-size:36px;color:#111216;background:#d9a46b;padding:18px 40px;border-radius:60px}
.cta i{font-style:normal;font-family:RM;font-size:32px;color:#f3ece2;letter-spacing:.04em}
.brillo{position:absolute;z-index:3;border-radius:50%;background:radial-gradient(circle,#ffe2b8 0%,rgba(255,226,184,0) 70%)}
"""
BRILLOS = "".join(f'<div class=brillo style="left:{x}px;top:{y}px;width:{w}px;height:{w}px;opacity:{o}"></div>' for x, y, w, o in [(120, 880, 60, .5), (860, 940, 40, .6), (560, 1010, 26, .5), (900, 1240, 50, .35)])
CAB = f'<div class=marco></div><div class=logo><img src="{LOGO}"><b>Velan’s</b></div>'


def html_guia(g, hero, minis, sub):
    return (f'<html><head><meta charset=utf-8><style>{BASE}</style></head><body><div class=hero style="background-image:url({foto(*hero)})"></div>{CAB}'
            f'<div class=sello>NAVIDAD 2026</div><div class="mini m1" style="background-image:url({foto(*minis[0])})"></div>'
            f'<div class="mini m2" style="background-image:url({foto(*minis[1])})"></div>{BRILLOS}'
            f'<div class=panel><div class=k>{e(g["k"])}</div><h1>{g["h"]}</h1><div class=s>{e(sub)}</div></div>'
            f'<div class=cta><span>{e(g["cta"])} →</span><i>velans.es</i></div></body></html>')


def html_bf(hero):
    css = BASE + """.hero{height:1500px}.hero:after{background:linear-gradient(180deg,rgba(14,15,18,.55) 0%,rgba(14,15,18,.25) 30%,rgba(14,15,18,.75) 62%,#0e0f12 100%)}
.bf{position:absolute;left:70px;right:70px;top:640px;z-index:6;text-align:center}
.bf .k{font-size:26px}.bf h1{font-family:RM;font-size:150px;letter-spacing:.02em;line-height:.95;margin-top:18px;text-shadow:0 6px 30px rgba(0,0,0,.6)}
.bf .s{margin:26px auto 0;font-size:40px}.cta{left:0;right:0;justify-content:center}"""
    return (f'<html><head><meta charset=utf-8><style>{css}</style></head><body><div class=hero style="background-image:url({foto(*hero)})"></div>{CAB}'
            f'<div class=sello style="font-size:40px;letter-spacing:0;padding:14px 26px">−%</div>'
            f'<div class=bf><div class=k>27 DE NOVIEMBRE · ALIEXPRESS</div><h1>BLACK<br>FRIDAY</h1><div class=s>Las mayores rebajas, seleccionadas cada día</div></div>'
            f'<div class=cta><span>Ver las rebajas →</span><i>velans.es</i></div></body></html>')


def html_producto(p, img_uri):
    css = BASE + """.card{position:absolute;left:110px;right:110px;top:190px;height:780px;background:#fff;border-radius:34px;z-index:4;box-shadow:0 30px 70px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;overflow:hidden}
.card img{max-width:88%;max-height:88%;object-fit:contain}
.panel{top:1020px}.panel h1{font-size:64px;line-height:1.1}
body{background:radial-gradient(120% 70% at 50% 0%,#2a2620 0%,#0e0f12 60%)}"""
    return (f'<html><head><meta charset=utf-8><style>{css}</style></head><body>{CAB}<div class=sello>REBAJA</div>'
            f'<div class=card><img src="{img_uri}"></div>'
            f'<div class=panel><div class=k>{e(("REBAJA EN ALIEXPRESS · " + p["categoria"]).upper())}</div><h1>{e(nombre_corto(p["nombre"], 58))}</h1></div>'
            f'<div class=cta><span>Ver la oferta →</span><i>velans.es</i></div></body></html>')


RUIDO = re.compile(r"^(?:(?:nuevo|nueva|nuevos|nuevas|new|hot|original|oferta|estilo|moda|20\d\d|\d+ ?(?:pcs|piezas|uds))\b[ ,.:-]*)+", re.I)


def nombre_corto(n, k=70):
    n = RUIDO.sub("", re.sub(r"\s+", " ", n)).strip(" .,-")
    partes = [x.strip(" .-") for x in re.split(r"[,|(]", n) if x.strip(" .-")]
    out = ""
    for x in partes:
        out = (out + ", " + x) if out else x
        if len(out.split()) >= 4: break
    out = out[:1].upper() + out[1:]
    return out if len(out) <= k else out[:k].rsplit(" ", 1)[0] + "…"


def combo(g):
    usados = set(U["combos"])
    giro = U["giro"]
    for h in g["hero"][giro % len(g["hero"]):] + g["hero"][:giro % len(g["hero"])]:
        ms = [m for m in g["mini"] if m != h]
        for i in range(len(ms)):
            for j in range(i + 1, len(ms)):
                c = (h, (ms[i], ms[j]))
                key = f'{g["id"]}:{h[0]}/{h[1]}:{ms[i][0]}/{ms[i][1]}:{ms[j][0]}/{ms[j][1]}'
                if key not in usados:
                    U["combos"].append(key); return c
    return (g["hero"][0], (g["mini"][0], g["mini"][1]))


def productos_candidatos():
    t = (ROOT / "aliexpress-productos.js").read_text(encoding="utf-8")
    d = json.loads(t[t.index("{"):t.rindex("}") + 1])
    vistos, lista = set(U["productos"]), []
    todos = d.get("masVendidos", []) + d.get("productos", [])
    ok = [p for p in todos if p.get("valoracion", 0) >= 88 and p.get("ventas", 0) >= 100 and (p.get("descuento") or 0) >= 20 and p["id"] not in vistos]
    porcat = {}
    for p in sorted(ok, key=lambda p: (-(p.get("descuento") or 0), -(p.get("ventas") or 0))):
        if p["id"] in {x["id"] for x in porcat.get(p.get("categoria", "Otros"), [])}: continue
        porcat.setdefault(p.get("categoria") or "Más vendidos", []).append(p)
    cats = list(porcat)
    while any(porcat.values()):
        for c in cats:
            if porcat[c]: lista.append(porcat[c].pop(0))
    return lista


plan, tareas = [], []
prods = [] if a.sin_productos else productos_candidatos()
gi = U["giro"]
bf = T["black_friday"]
for n in range(a.dias):
    dia = d0 + timedelta(days=n)
    carpeta = ROOT / "img/pines" / dia.isoformat()
    if (carpeta / "plan.json").exists():
        print("ya planificado:", dia); continue
    en_bf = bf["desde"] <= dia.isoformat() <= bf["hasta"]
    tipos = ["guia", "bf", "producto"] if en_bf else (["producto", "producto"] if dia.isoformat() > "2027-01-05" else ["guia", "guia", "producto"])
    for s, tipo in enumerate(tipos):
        nombre = f"{s + 1:02d}.jpg"
        item = {"fecha": f"{dia.isoformat()}T{HORAS[s]}:00", "imagen": f"img/pines/{dia.isoformat()}/{nombre}", "tipo": tipo}
        if tipo == "guia":
            g = T["guias"][gi % len(T["guias"])]; gi += 1
            hero, minis = combo(g)
            i = texto_idx(g["id"], len(g["titulos"]))
            item.update(titulo=g["titulos"][i], texto=g["textos"][i] + " " + g["tags"], enlace=enlace(g["link"], "guia-" + g["id"]),
                        alt=f'{re.sub("<br>", " ", g["h"])}: ideas de regalo de Navidad en Velan’s', html=html_guia(g, hero, minis, g["sub"][i % len(g["sub"])]))
        elif tipo == "bf":
            hero = bf["hero"][texto_idx("bf-hero", len(bf["hero"]))]
            i = texto_idx("bf", len(bf["titulos"]))
            item.update(titulo=bf["titulos"][i], texto=bf["textos"][i] + " " + bf["tags"],
                        enlace=enlace("black-friday.html" if BF_PAGINA else "?tienda=aliexpress", "black-friday"),
                        alt="Black Friday: las mayores rebajas de AliExpress en Velan’s", html=html_bf(hero))
        else:
            if not prods: continue
            p = prods.pop(0); U["productos"].append(p["id"])
            i = texto_idx("producto", len(T["producto"]["titulos"]))
            nc = nombre_corto(p["nombre"], 60)
            cat = (p.get("categoria") or "AliExpress").lower()
            ruta = (f"black-friday.html" if BF_PAGINA and en_bf else "?tienda=aliexpress")
            item.update(titulo=T["producto"]["titulos"][i].format(nombre=nc)[:100], texto=T["producto"]["textos"][i].format(nombre=nc, categoria=cat) + " " + T["producto"]["tags"],
                        enlace=enlace(ruta, "producto"), alt=f"{nc}, rebajado en AliExpress", producto=p)
        tareas.append((carpeta, nombre, item))
U["giro"] = gi

from playwright.sync_api import sync_playwright  # noqa: E402
tmp = Path(tempfile.mkdtemp())
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=a.chrome)
    pg = b.new_page(viewport={"width": 1000, "height": 1500})
    for carpeta, nombre, item in tareas:
        carpeta.mkdir(parents=True, exist_ok=True)
        if item["tipo"] == "producto":
            p = item.pop("producto")
            try:
                req = urllib.request.Request(p["imagen"], headers={"User-Agent": "Mozilla/5.0 VelansPines"})
                raw = urllib.request.urlopen(req, timeout=20).read()
                f = tmp / (hashlib.md5(p["imagen"].encode()).hexdigest() + ".img"); f.write_bytes(raw)
                item["html"] = html_producto(p, f.as_uri())
            except Exception as ex:
                print("sin imagen, se omite:", p["id"], ex); continue
        h = tmp / "pin.html"; h.write_text(item.pop("html"), encoding="utf-8")
        pg.goto(h.as_uri()); pg.wait_for_timeout(500)
        pg.screenshot(path=str(carpeta / nombre), type="jpeg", quality=90)
        plan.append(item)
    b.close()

for carpeta in sorted({c for c, _, _ in tareas}):
    dia_plan = [x for x in plan if x["imagen"].startswith(f"img/pines/{carpeta.name}/")]
    (carpeta / "plan.json").write_text(json.dumps(dia_plan, ensure_ascii=False, indent=1), encoding="utf-8")
USADOS_F.write_text(json.dumps(U, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(plan)} pines del {d0} al {d0 + timedelta(days=a.dias - 1)}")
