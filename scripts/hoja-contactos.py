"""Velan's · hojas de contacto de las fotos candidatas (para revisarlas a ojo).
Lee data/fotos-libres-candidatas.json y crea data/hoja-NN.jpg con hasta 2 fotos por producto."""
import json, io, urllib.request, textwrap
from PIL import Image, ImageDraw, ImageFont

UA = 'VelansFotosLibres/1.0 (https://velans.es)'
d = json.load(open('data/fotos-libres-candidatas.json', encoding='utf8'))
items = []
for p in d['productos']:
    for i, c in enumerate(p['candidatas'][:2]):
        items.append((f"{p['id']}{'ab'[i]}", p['nombre'], c))
CELL, COLS, ROWS = 260, 4, 5
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
except Exception: font = ImageFont.load_default()
indice = []
for n in range(0, len(items), COLS * ROWS):
    hoja = Image.new('RGB', (COLS * CELL, ROWS * (CELL + 60)), 'white'); dr = ImageDraw.Draw(hoja)
    for k, (cod, nombre, c) in enumerate(items[n:n + COLS * ROWS]):
        x, y = (k % COLS) * CELL, (k // COLS) * (CELL + 60)
        try:
            req = urllib.request.Request(c['imagen'], headers={'User-Agent': UA})
            im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=20).read())).convert('RGB')
            im.thumbnail((CELL - 10, CELL - 10)); hoja.paste(im, (x + 5, y + 5))
        except Exception as e:
            dr.text((x + 10, y + 100), 'sin vista previa', fill='red', font=font)
        dr.text((x + 5, y + CELL), f"[{cod}] " + textwrap.shorten(nombre, 34), fill='black', font=font)
        dr.text((x + 5, y + CELL + 16), textwrap.shorten(c['fuente'] + ' · ' + c['licencia'], 40), fill='gray', font=font)
        dr.text((x + 5, y + CELL + 32), textwrap.shorten(c['titulo'], 40), fill='gray', font=font)
        indice.append({'codigo': cod, 'hoja': n // (COLS * ROWS) + 1, **c, 'producto': nombre})
    hoja.save(f"data/hoja-{n // (COLS * ROWS) + 1:02d}.jpg", quality=80)
json.dump(indice, open('data/hojas-indice.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(items), 'fotos en', (len(items) + COLS * ROWS - 1) // (COLS * ROWS), 'hojas')
