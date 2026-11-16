// Capturas de la web a varios tamaños para revisarla.
// Uso: node herramientas/capturas.mjs <url> <carpeta> [ancho×alto ...] [--completa] [--espera=ms]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const modulos = process.env.JAF_NODE_MODULES || "C:/Users/lawli/Downloads/JAF-main/node_modules";
const require = createRequire(path.join(modulos, "noop.js"));
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const url = args[0];
const carpeta = args[1];
const completa = args.includes("--completa");
const espera = Number((args.find((a) => a.startsWith("--espera=")) || "--espera=3500").split("=")[1]);
const tamanos = args.slice(2).filter((a) => /^\d+x\d+$/.test(a));
if (!tamanos.length) tamanos.push("1440x900", "390x844");
mkdirSync(carpeta, { recursive: true });

const navegador = await chromium.launch();
for (const t of tamanos) {
  const [ancho, alto] = t.split("x").map(Number);
  const movil = ancho < 700;
  const pagina = await navegador.newPage({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: movil ? 2 : 1,
    isMobile: movil,
    hasTouch: movil,
  });
  const errores = [];
  pagina.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  pagina.on("pageerror", (e) => errores.push(String(e)));
  pagina.on("requestfailed", (r) => errores.push("falló " + r.url()));
  await pagina.goto(url, { waitUntil: "networkidle" });
  if (args.includes("--trazos")) {
    // Baja hasta la ficha para que se dibujen los kanji y vuelve arriba.
    await pagina.evaluate(() => document.querySelector(".ficha__kanji")?.scrollIntoView({ block: "center" }));
    await pagina.waitForTimeout(8000);
    await pagina.evaluate(() => window.scrollTo(0, 0));
  }
  await pagina.waitForTimeout(espera);
  const archivo = path.join(carpeta, `${t}${completa ? "-completa" : ""}.png`);
  await pagina.screenshot({ path: archivo, fullPage: completa });
  const medidas = await pagina.evaluate(() => ({
    alto: document.documentElement.scrollHeight,
    anchoDoc: document.documentElement.scrollWidth,
  }));
  console.log(t, archivo, JSON.stringify(medidas), errores.length ? "ERRORES: " + errores.join(" | ") : "sin errores");
  await pagina.close();
}
await navegador.close();
