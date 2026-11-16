"""Copia los trazos de KanjiVG (en orden) dentro de la ficha de muestra.

Uso: python -I -X utf8 herramientas/trazos.py
Sustituye el contenido de cada <g class="trazos"> de docs/index.html por los
trazos exactos de kanji/svg/<código>.svg, en el orden de los kanji de la ficha.
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SVG = RAIZ.parent / "kanji" / "svg"
HTML = RAIZ / "docs" / "index.html"
KANJI = ["辞", "書"]


def trazos(kanji: str) -> list[str]:
    texto = (SVG / f"{ord(kanji):05x}.svg").read_text(encoding="utf-8")
    pares = re.findall(r'<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*?\sd="([^"]+)"', texto)
    pares.sort(key=lambda p: int(p[0]))
    return [d for _, d in pares]


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    bloques = list(re.finditer(r'(<g class="trazos">)(.*?)(\n\s*</g>)', html, re.S))
    assert len(bloques) == len(KANJI), f"esperaba {len(KANJI)} bloques, hay {len(bloques)}"
    for bloque, kanji in reversed(list(zip(bloques, KANJI))):
        sangria = "\n" + " " * 20
        caminos = "".join(
            f'{sangria}<path style="--i:{i}" pathLength="1" d="{d}"/>' for i, d in enumerate(trazos(kanji))
        )
        html = html[: bloque.start(2)] + caminos + html[bloque.end(2):]
    HTML.write_text(html, encoding="utf-8", newline="\n")
    print("trazos:", ", ".join(f"{k} {len(trazos(k))}" for k in KANJI))


if __name__ == "__main__":
    main()
