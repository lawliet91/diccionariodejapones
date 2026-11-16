# diccionariodejapones.com

Página «próximamente» del **Diccionario de Japonés**, un proyecto de Japonés a Fondo.

- **Web publicada:** la carpeta `docs/`. GitHub Pages la sirve desde la rama `main`, carpeta `/docs`, con el dominio de `docs/CNAME`.
- **Analítica:** Google Analytics 4, propiedad «Diccionario de Japonés» (cuenta «japonesafondo», ID de medición `G-6RZ1CL9BTP`). Solo se carga si la persona acepta el aviso de cookies (`docs/assets/app.js`).
- **Herramientas** (`herramientas/`, no se publican):
  - `imagenes.mjs`: Coco-chan y logos en AVIF y WebP.
  - `graficos.mjs` + `og.html`: imagen para redes (1200×630) e iconos.
  - `fuentes.py`: Klee One solo con los caracteres japoneses de la web.
  - `trazos.py`: copia los trazos de KanjiVG en la ficha de muestra.
  - `capturas.mjs`: capturas a varios tamaños para revisar la página.
  - Usan sharp y Playwright de la web de la academia (variable `JAF_NODE_MODULES`).

## Cambiar la página

1. Editar `docs/index.html` y `docs/assets/estilos.css`.
2. Si cambia el texto en japonés: `python -I -X utf8 herramientas/fuentes.py`.
3. Subir el número `?v=` de `estilos.css` y `app.js` en los HTML.
4. `git push`: GitHub Pages publica en uno o dos minutos.

## Créditos

Datos de la ficha de muestra: JMdict (EDRDG, CC BY-SA 4.0), UniDic (NINJAL) y KanjiVG (Ulrich Apel, CC BY-SA 3.0).
Tipografías: Josefin Sans, Atkinson Hyperlegible Next, Klee One y Noto Sans JP (SIL Open Font License 1.1).

Japonés a Fondo® es una marca registrada. El logo y Coco-chan son de Japonés a Fondo: todos los derechos reservados.
