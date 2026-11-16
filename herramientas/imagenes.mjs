// Genera las imágenes de la web (Coco-chan y logos) en AVIF y WebP.
// Uso: node herramientas/imagenes.mjs
// Necesita «sharp». Si no está instalado aquí, se toma de la web de la academia
// (variable JAF_NODE_MODULES o la ruta por defecto de abajo).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const modulos = process.env.JAF_NODE_MODULES || "C:/Users/lawli/Downloads/JAF-main/node_modules";
const require = createRequire(path.join(modulos, "noop.js"));
const sharp = require("sharp");

const COCO = "D:/JAF/Coco chan";
const KIT = "C:/Users/lawli/Downloads/JAF-main/tmp/recursos-jd0/kit/assets";
const salida = path.join(aqui, "..", "docs", "assets", "img");
mkdirSync(salida, { recursive: true });

// nombre de salida, original, anchos (px reales; en pantalla se ven a la mitad)
const COCOS = [
  ["coco-notas", `${COCO}/Poses/Coco-chan Tomando Notas.png`, [280, 420, 560]],
  ["coco-pregunta", `${COCO}/Poses/Coco-chan Pregunta nueva.png`, [300, 520]],
];

async function recortado(origen) {
  // Quita el margen transparente para que el tamaño en CSS sea el del dibujo.
  return sharp(origen).trim({ threshold: 1 }).toBuffer();
}

for (const [nombre, origen, anchos] of COCOS) {
  const base = await recortado(origen);
  const meta = await sharp(base).metadata();
  for (const ancho of anchos) {
    const img = sharp(base).resize({ width: ancho });
    await img.clone().avif({ quality: 58, effort: 7 }).toFile(path.join(salida, `${nombre}-${ancho}.avif`));
    await img.clone().webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(path.join(salida, `${nombre}-${ancho}.webp`));
  }
  console.log(nombre, `${meta.width}×${meta.height}`, "→", anchos.join(", "));
}

// Logos de Japonés a Fondo (los mismos del kit de recursos).
await sharp(`${KIT}/logo-footer.webp`).resize({ width: 360 }).webp({ quality: 90, effort: 6 })
  .toFile(path.join(salida, "logo-jaf-color.webp"));
// PNG del logo para el JSON-LD (Google no lee WebP en «logo» de forma fiable).
await sharp(`${KIT}/logo-redondo.png`).resize({ width: 512 }).png({ compressionLevel: 9 })
  .toFile(path.join(salida, "logo-jaf-512.png"));
console.log("logos listos");
