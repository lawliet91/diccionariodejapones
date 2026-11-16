"""Descarga Klee One con SOLO los caracteres japoneses que usa la web.

Uso: python -I -X utf8 herramientas/fuentes.py
Lee los .html de docs/, junta kana, kanji y signos japoneses, y pide a Google
Fonts el subconjunto (parámetro text=) en pesos 400 y 600. Hay que repetirlo
cada vez que se añada texto en japonés.
"""
import re
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / "docs"
SALIDA = DOCS / "assets" / "fonts"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
JAPONES = re.compile(r"[　-〿぀-ヿ一-鿿！-～]")


def caracteres() -> str:
    texto = "".join(p.read_text(encoding="utf-8") for p in DOCS.glob("*.html"))
    usados = set(JAPONES.findall(texto)) | set("()")
    return "".join(sorted(usados))


def bajar(url: str) -> bytes:
    pedido = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        return r.read()


def main() -> None:
    texto = caracteres()
    for peso in (400, 600):
        css_url = "https://fonts.googleapis.com/css2?family=Klee+One:wght@{}&text={}&display=swap".format(
            peso, urllib.parse.quote(texto)
        )
        css = bajar(css_url).decode("utf-8")
        fuente = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", css).group(1)
        datos = bajar(fuente)
        (SALIDA / f"klee-{peso}.woff2").write_bytes(datos)
        print(f"klee-{peso}.woff2", len(datos), "bytes")
    print("caracteres:", texto)


if __name__ == "__main__":
    main()
