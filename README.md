# diccionariodejapones.com

Página «próximamente» del **Diccionario de Japonés**, un proyecto de Japonés a Fondo. Es una sola pantalla, sin scroll, también en el móvil.

- **Web publicada:** la carpeta `docs/`. GitHub Pages la sirve desde la rama `main`, carpeta `/docs`, con el dominio de `docs/CNAME`.
- **Dominio:** registrado en Spaceship, con sus DNS: 4 registros A y 4 AAAA de GitHub Pages, `www` como CNAME a `lawliet91.github.io` y dos TXT de verificación (Google y GitHub). No hay que tocarlos.
- **Analítica:** Google Analytics 4, propiedad «Diccionario de Japonés» (cuenta «japonesafondo», p564440325, ID de medición `G-6RZ1CL9BTP`, datos 14 meses, enlazada con Search Console). El código está en el `<head>` de los dos HTML y solo se carga en el dominio publicado, no en las pruebas locales.
- **Search Console:** propiedad de dominio `diccionariodejapones.com`, verificada por DNS, con `sitemap.xml` enviado.
- **IndexNow** (Bing y otros): la clave es el archivo `.txt` de 32 caracteres de `docs/`. Para avisar de una URL nueva: `https://api.indexnow.org/indexnow?url=<url>&key=<clave>`.
- **Herramientas** (`herramientas/`, no se publican):
  - `imagenes.mjs`: Coco-chan y logos en AVIF y WebP.
  - `graficos.mjs` + `og.html`: imagen para redes (1200×630) e iconos.
  - `fuentes.py`: Klee One solo con los caracteres japoneses de la web.
  - `capturas.mjs`: capturas a varios tamaños para revisar la página.
  - Usan sharp y Playwright de la web de la academia (variable `JAF_NODE_MODULES`).

## Cambiar la página

1. Editar `docs/index.html` y `docs/assets/estilos.css`.
2. Si cambia el texto en japonés: `python -I -X utf8 herramientas/fuentes.py`.
3. Subir el número `?v=` de `estilos.css` en los HTML.
4. Comprobar que sigue sin scroll: `node herramientas/capturas.mjs <url> <carpeta> 1440x900 390x664 375x553` (la altura que imprime debe ser la de la ventana).
5. `git push`: GitHub Pages publica en uno o dos minutos.

## Créditos

Tipografías: Josefin Sans, Atkinson Hyperlegible Next, Klee One y Noto Sans JP (SIL Open Font License 1.1).

Japonés a Fondo® es una marca registrada. El logo y Coco-chan son de Japonés a Fondo: todos los derechos reservados.
