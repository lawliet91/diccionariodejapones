// Genera la imagen para redes (Open Graph) y los iconos de la web.
// Uso: node herramientas/graficos.mjs
// Usa Playwright (Chromium) para dibujar con las fuentes de la web y sharp para
// recortar y comprimir. Se toman de la web de la academia si no están aquí.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const modulos = process.env.JAF_NODE_MODULES || "C:/Users/lawli/Downloads/JAF-main/node_modules";
const require = createRequire(path.join(modulos, "noop.js"));
const { chromium } = require("playwright");
const sharp = require("sharp");

const docs = path.join(aqui, "..", "docs");
const img = path.join(docs, "assets", "img");
const iconos = path.join(docs, "assets", "iconos");
mkdirSync(iconos, { recursive: true });

const ROJO = "#cd0000";
// 辞 en Noto Sans JP 800 (OFL), solo ese carácter: se lee bien hasta en 16 px.
const fuenteIcono = "data:font/woff2;base64," +
  readFileSync(path.join(aqui, "icono-noto-sans-jp-800-ji.woff2")).toString("base64");

// Icono: 辞 en blanco sobre el sol rojo.
function htmlIcono({ fondo, circulo, escala }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: Icono; font-weight: 800; src: url(${fuenteIcono}) format("woff2"); }
    html, body { margin: 0; width: 512px; height: 512px; background: ${fondo}; }
    .i { width: 512px; height: 512px; display: grid; place-items: center; }
    .s { width: 100%; height: 100%; display: grid; place-items: center;
         background: ${ROJO}; border-radius: ${circulo ? "50%" : "0"}; }
    .k { font-family: Icono; font-weight: 800; color: #fff; font-size: ${Math.round(512 * escala)}px;
         line-height: 1; transform: translateY(-2%); }
  </style></head><body><div class="i"><div class="s"><span class="k">辞</span></div></div></body></html>`;
}

function ico(pngs) {
  // ICO con imágenes PNG dentro (válido en todos los navegadores actuales).
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(pngs.length, 4);
  const entradas = [];
  let desplazamiento = 6 + 16 * pngs.length;
  for (const { tam, datos } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(tam >= 256 ? 0 : tam, 0);
    e.writeUInt8(tam >= 256 ? 0 : tam, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(datos.length, 8);
    e.writeUInt32LE(desplazamiento, 12);
    desplazamiento += datos.length;
    entradas.push(e);
  }
  return Buffer.concat([cabecera, ...entradas, ...pngs.map((p) => p.datos)]);
}

const navegador = await chromium.launch();

// --- Imagen para redes ---
{
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await pagina.goto(pathToFileURL(path.join(aqui, "og.html")).href, { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(400);
  const png = await pagina.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(img, "og-diccionario-1.jpg"));
  console.log("og-diccionario-1.jpg listo");
  await pagina.close();
}

// --- Iconos ---
async function dibujar(opciones) {
  const pagina = await navegador.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await pagina.setContent(htmlIcono(opciones), { waitUntil: "load" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(200);
  const png = await pagina.screenshot({ type: "png", omitBackground: opciones.fondo === "transparent" });
  await pagina.close();
  return png;
}

const circulo = await dibujar({ fondo: "transparent", circulo: true, escala: 0.6 });
const cuadrado = await dibujar({ fondo: ROJO, circulo: false, escala: 0.5 });

await sharp(circulo).resize(512).png({ compressionLevel: 9 }).toFile(path.join(iconos, "icono-512.png"));
await sharp(circulo).resize(192).png({ compressionLevel: 9 }).toFile(path.join(iconos, "icono-192.png"));
await sharp(cuadrado).resize(512).png({ compressionLevel: 9 }).toFile(path.join(iconos, "icono-maskable-512.png"));
await sharp(cuadrado).resize(180).png({ compressionLevel: 9 }).toFile(path.join(iconos, "apple-touch-icon.png"));

const tamanos = [16, 32, 48];
const pngs = [];
for (const tam of tamanos) {
  pngs.push({ tam, datos: await sharp(circulo).resize(tam).png({ compressionLevel: 9 }).toBuffer() });
}
writeFileSync(path.join(docs, "favicon.ico"), ico(pngs));
console.log("iconos listos:", tamanos.join(", "), "+ 180, 192, 512");

await navegador.close();
