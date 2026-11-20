#!/usr/bin/env python3
"""Informe semanal de Velan's con los datos de GoatCounter (visitas, páginas, origen y clics a tiendas).

Escribe data/informe/AAAA-MM-DD.json y .md (la fecha es el lunes del informe) y, si existen
TELEGRAM_BOT_TOKEN y TELEGRAM_INFORME_CHAT, se lo manda por Telegram al dueño.
Necesita GOATCOUNTER_TOKEN (API de GoatCounter con permiso de lectura de estadísticas).
"""
import datetime as dt, json, os, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://velans.goatcounter.com/api/v0"


def get(ruta, **q):
    req = urllib.request.Request(f"{API}{ruta}?{urllib.parse.urlencode(q)}",
                                 headers={"Authorization": "Bearer " + os.environ["GOATCOUNTER_TOKEN"], "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def periodo(fin):
    ini = fin - dt.timedelta(days=7)
    return {"start": ini.isoformat() + "T00:00:00Z", "end": (fin - dt.timedelta(days=1)).isoformat() + "T23:59:59Z"}


def semana(fin):
    q = periodo(fin)
    total = get("/stats/total", **q)
    hits = get("/stats/hits", limit=100, **q).get("hits", [])
    paginas = [(h["path"], h.get("count", 0)) for h in hits if not h.get("event")]
    eventos = [(h["path"], h.get("count", 0)) for h in hits if h.get("event")]
    try:
        refs = [(r.get("name") or "(directo)", r.get("count", 0)) for r in get("/stats/toprefs", limit=10, **q).get("stats", [])]
    except Exception:
        refs = []
    clic = lambda t: sum(c for p, c in eventos if p.startswith("clic-" + t))
    return {"visitas": total.get("total", 0), "paginas": paginas[:10], "origen": refs, "clicsAmazon": clic("amazon"),
            "clicsAliExpress": clic("aliexpress"), "eventos": eventos[:10]}


def main():
    if not os.environ.get("GOATCOUNTER_TOKEN"):
        print("Falta GOATCOUNTER_TOKEN: no hay informe."); return
    hoy = dt.date.today()
    lunes = hoy - dt.timedelta(days=hoy.weekday())
    ahora, antes = semana(lunes), semana(lunes - dt.timedelta(days=7))

    def var(k):
        a, b = ahora[k], antes[k]
        return "" if not b else f" ({'+' if a >= b else ''}{round((a - b) * 100 / b)} % frente a la semana anterior)"
    md = [f"# Informe semanal de Velan’s · semana del {(lunes - dt.timedelta(days=7)):%d/%m} al {(lunes - dt.timedelta(days=1)):%d/%m}", "",
          f"- Visitas: **{ahora['visitas']}**{var('visitas')}",
          f"- Clics a Amazon: **{ahora['clicsAmazon']}**{var('clicsAmazon')}",
          f"- Clics a AliExpress: **{ahora['clicsAliExpress']}**{var('clicsAliExpress')}", "", "## Páginas más vistas"]
    md += [f"{i}. {p} — {c}" for i, (p, c) in enumerate(ahora["paginas"], 1)] or ["(sin datos)"]
    md += ["", "## De dónde llegan"] + ([f"- {n}: {c}" for n, c in ahora["origen"]] or ["- (sin datos)"])
    d = ROOT / "data" / "informe"; d.mkdir(parents=True, exist_ok=True)
    (d / f"{lunes}.json").write_text(json.dumps({"lunes": str(lunes), "semana": ahora, "anterior": antes}, ensure_ascii=False, indent=1))
    (d / f"{lunes}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("\n".join(md))
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_INFORME_CHAT")
    if token and chat:
        txt = "\n".join(md).replace("**", "").replace("# ", "📊 ", 1).replace("## ", "\n")
        urllib.request.urlopen(urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage",
                               data=urllib.parse.urlencode({"chat_id": chat, "text": txt[:4000]}).encode()), timeout=30)


if __name__ == "__main__":
    main()
