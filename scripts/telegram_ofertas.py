#!/usr/bin/env python3
"""Canal de Telegram de Velan's: publica cada día las mejores rebajas de AliExpress.

Lee aliexpress-productos.js (actualizado a diario por la API de afiliados), elige ofertas fiables
que no se hayan publicado en los últimos 30 días y las envía con la Bot API de Telegram.
Necesita los secretos TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID (p. ej. @velans_ofertas).
Si faltan, no hace nada. Uso: python3 scripts/telegram_ofertas.py [--n 4] [--prueba]
"""
import argparse, datetime as dt, html, json, os, re, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = ROOT / "data" / "telegram-publicados.json"
EMOJI = {"Moda": "👗", "Tecnología": "🔌", "Hogar": "🏠", "Belleza": "💄", "Deportes": "🏃"}


def euro(x): return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + " €"


def cargar():
    t = (ROOT / "aliexpress-productos.js").read_text(encoding="utf-8")
    return json.loads(t[t.index("{"):t.rindex("}") + 1])


def elegir(datos, n, publicados):
    hoy = dt.date.today()
    recientes = {k for k, f in publicados.items() if (hoy - dt.date.fromisoformat(f)).days < 30}
    vistos, buenos = set(), []
    for p in datos["masVendidos"] + datos["productos"]:
        if p["id"] in vistos or p["id"] in recientes: continue
        vistos.add(p["id"])
        if (p.get("descuento") or 0) >= 25 and (p.get("valoracion") or 0) >= 88 and (p.get("ventas") or 0) >= 50 and p.get("enlace"):
            buenos.append(p)
    buenos.sort(key=lambda p: (p["descuento"], p["ventas"]), reverse=True)
    out, cats = [], set()
    for p in buenos:  # variedad: una por categoría primero
        if p["categoria"] not in cats: out.append(p); cats.add(p["categoria"])
        if len(out) == n: return out
    return (out + [p for p in buenos if p not in out])[:n]


def texto(p):
    partes = [x.strip() for x in re.split(r"[.,|]\s", p["nombre"]) if x.strip()]
    nombre = partes[0] if partes else p["nombre"]
    if len(nombre) < 30 and len(partes) > 1: nombre += ", " + partes[1]
    nombre = html.escape(nombre[:90].rstrip(" ,"))
    ventas = f'{p["ventas"]:,}'.replace(",", ".")
    antes = f' <s>{euro(p["precioAntes"])}</s>' if p.get("precioAntes") else ""
    return (f'{EMOJI.get(p["categoria"], "🔥")} <b>-{p["descuento"]}% · {nombre}</b>\n\n'
            f'💶 <b>{euro(p["precio"])}</b>{antes}\n'
            f'⭐ {str(p["valoracion"]).replace(".", ",")} % positivas · {ventas} vendidos\n\n' +
            f'👉 <a href="{html.escape(p["enlace"])}">Ver la oferta en AliExpress</a>\n\n'
            '<i>Enlace de afiliado: Velan’s recibe una pequeña comisión y a ti te cuesta lo mismo. '
            'El precio puede cambiar.</i>')


def enviar(token, chat, metodo, datos):
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/{metodo}", data=urllib.parse.urlencode(datos).encode())
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            res = json.load(r)
    except urllib.error.HTTPError as ex:
        raise RuntimeError(f"Telegram respondió {ex.code}: {ex.read().decode(errors='replace')}") from None
    if not res.get("ok"): raise RuntimeError(res)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--n", type=int, default=4); ap.add_argument("--prueba", action="store_true")
    a = ap.parse_args()
    publicados = json.loads(REG.read_text()) if REG.exists() else {}
    elegidas = elegir(cargar(), a.n, publicados)
    if a.prueba:
        for p in elegidas: print(texto(p), "\n---")
        return
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("Faltan TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID: no se publica nada."); return
    enviar(token, chat, "sendMessage", {"chat_id": chat, "parse_mode": "HTML", "disable_web_page_preview": "true",
           "text": f"☀️ <b>Chollos de hoy en AliExpress</b> · {dt.date.today():%d/%m}\nMás rebajas en https://velans.es/?tienda=aliexpress"})
    hoy = dt.date.today().isoformat()
    for p in elegidas:
        try:
            enviar(token, chat, "sendPhoto", {"chat_id": chat, "photo": p["imagen"], "caption": texto(p), "parse_mode": "HTML"})
        except Exception as ex:
            print("foto falló, envío texto:", ex, file=sys.stderr)
            enviar(token, chat, "sendMessage", {"chat_id": chat, "text": texto(p), "parse_mode": "HTML"})
        publicados[p["id"]] = hoy
    publicados = {k: f for k, f in publicados.items() if (dt.date.today() - dt.date.fromisoformat(f)).days < 60}
    REG.parent.mkdir(exist_ok=True); REG.write_text(json.dumps(publicados, indent=0, sort_keys=True))
    print(len(elegidas), "ofertas publicadas")


if __name__ == "__main__":
    main()
