#!/usr/bin/env python3
"""Canal de Telegram de Velan's: publica cada día las mejores rebajas de AliExpress.

Lee aliexpress-productos.js (actualizado a diario por la API de afiliados), elige ofertas fiables
que no se hayan publicado en los últimos 30 días y las envía con la Bot API de Telegram.
Necesita los secretos TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID (p. ej. @velans_ofertas).
Si faltan, no hace nada. Uso: python3 scripts/telegram_ofertas.py [--n 4] [--prueba]
"""
import argparse, datetime as dt, html, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = ROOT / "data" / "telegram-publicados.json"
EMOJI = {"Moda": "👗", "Tecnología": "🔌", "Hogar": "🏠", "Belleza": "💄", "Deportes": "🏃"}


def euro(x): return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + " €"


def cargar():
    t = (ROOT / "aliexpress-productos.js").read_text(encoding="utf-8")
    return json.loads(t[t.index("{"):t.rindex("}") + 1])


def fiable(p, desc=0):
    return (p.get("descuento") or 0) >= desc and (p.get("valoracion") or 0) >= 88 and (p.get("ventas") or 0) >= 50 and p.get("enlace")


def recientes(publicados, dias):
    hoy = dt.date.today()
    return {k for k, f in publicados.items() if (hoy - dt.date.fromisoformat(f)).days < dias}


def elegir_vendidos(datos, n, publicados):
    """Lo más vendido de AliExpress (ya con la oferta más barata de cada artículo). Repite como mucho cada 7 días."""
    evita = recientes(publicados, 7)
    lista = [p for p in datos["masVendidos"] if fiable(p) and p["id"] not in evita]
    lista.sort(key=lambda p: p.get("ventas") or 0, reverse=True)
    out, claves = [], set()
    for p in lista:  # sin dos artículos casi iguales
        k = " ".join(re.findall(r"\w+", p["nombre"].lower())[:2])
        if k not in claves: out.append(p); claves.add(k)
        if len(out) == n: break
    return out


def elegir_rebajados(datos, n, publicados, excluir=()):
    """Lo más rebajado de tiendas fiables, con variedad de categorías. No repite en 30 días."""
    evita = recientes(publicados, 30) | set(excluir)
    vistos, buenos = set(), []
    for p in datos["productos"] + datos["masVendidos"]:
        if p["id"] in vistos or p["id"] in evita: continue
        vistos.add(p["id"])
        if fiable(p, 25): buenos.append(p)
    buenos.sort(key=lambda p: (p["descuento"], p["ventas"]), reverse=True)
    out, cats = [], set()
    for p in buenos:
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
    return (f'{EMOJI.get(p["categoria"], "🛒")} <b>{f"-{p['descuento']}% · " if p.get("descuento") else ""}{nombre}</b>\n\n'
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


def catalogo(datos, total):
    """Los mejores artículos: primero lo más vendido (por ventas), después lo más rebajado (por descuento)."""
    pool = {}
    for p in datos["masVendidos"] + datos["productos"]:
        if (p.get("valoracion") or 0) >= 85 and (p.get("ventas") or 0) >= 20 and p.get("enlace"): pool.setdefault(p["id"], p)
    mitad = total // 2
    vendidos = sorted(pool.values(), key=lambda p: p.get("ventas") or 0, reverse=True)[:mitad]
    ids = {p["id"] for p in vendidos}
    rebajados = sorted([p for p in pool.values() if p["id"] not in ids], key=lambda p: (p.get("descuento") or 0, p.get("ventas") or 0), reverse=True)
    return vendidos, rebajados[:total - len(vendidos)]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--n", type=int, default=3, help="artículos por sección")
    ap.add_argument("--prueba", action="store_true")
    ap.add_argument("--catalogo", type=int, default=0, help="publicar de una vez los N mejores artículos")
    a = ap.parse_args()
    publicados = json.loads(REG.read_text()) if REG.exists() else {}
    datos = cargar()
    if a.catalogo:
        vendidos, rebajados = catalogo(datos, a.catalogo)
    else:
        vendidos = elegir_vendidos(datos, a.n, publicados)
        rebajados = elegir_rebajados(datos, a.n, publicados, excluir=[p["id"] for p in vendidos])
    secciones = [("🏆 <b>Lo más vendido hoy en AliExpress</b>\n(siempre con la oferta más barata de cada artículo)", vendidos, "🏆 Top ventas"),
                 ("🔥 <b>Lo más rebajado hoy en AliExpress</b>", rebajados, "🔥 Superrebaja")]
    if a.prueba:
        for cab, lista, et in secciones:
            print(cab, len(lista)); [print(f"{et} · " + texto(p).split(chr(10))[0]) for p in lista[:3]]
        return
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("Faltan TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID: no se publica nada."); return
    hoy = dt.date.today().isoformat(); n = 0
    for cab, lista, et in secciones:
        if not lista: continue
        enviar(token, chat, "sendMessage", {"chat_id": chat, "parse_mode": "HTML", "disable_web_page_preview": "true",
               "text": f"{cab} · {dt.date.today():%d/%m}\nMás en https://velans.es/?tienda=aliexpress"})
        for p in lista:
            cap = f"<b>{et}</b>\n" + texto(p)
            try:
                enviar(token, chat, "sendPhoto", {"chat_id": chat, "photo": p["imagen"], "caption": cap, "parse_mode": "HTML"})
            except Exception as ex:
                print("foto falló, envío texto:", ex, file=sys.stderr)
                enviar(token, chat, "sendMessage", {"chat_id": chat, "text": cap, "parse_mode": "HTML"})
            if not a.catalogo: publicados[p["id"]] = hoy
            n += 1
            time.sleep(3.5 if a.catalogo else 1)  # límite de Telegram: unos 20 mensajes por minuto en un canal
    publicados = {k: f for k, f in publicados.items() if (dt.date.today() - dt.date.fromisoformat(f)).days < 60}
    REG.parent.mkdir(exist_ok=True); REG.write_text(json.dumps(publicados, indent=0, sort_keys=True))
    print(n, "ofertas publicadas")


if __name__ == "__main__":
    main()
