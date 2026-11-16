/* Diccionario de Japonés · página «próximamente».
   1) Aviso de cookies: Google Analytics solo se carga si la persona acepta.
   2) Orden de trazos de los kanji de la ficha de muestra. */
(function () {
  "use strict";

  var GA_ID = "G-6RZ1CL9BTP";
  var DOMINIOS = ["diccionariodejapones.com", "www.diccionariodejapones.com"];
  var CLAVE = "ddj-consentimiento";
  var VIGENCIA = 365 * 24 * 60 * 60 * 1000; // se vuelve a preguntar al año

  var aviso = document.querySelector(".cookies");
  var medible = DOMINIOS.indexOf(location.hostname) !== -1 && /^G-[A-Z0-9]+$/.test(GA_ID);

  function leer() {
    try {
      var dato = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (dato && (dato.v === "si" || dato.v === "no") && Date.now() - dato.t < VIGENCIA) return dato.v;
    } catch (e) { /* almacenamiento bloqueado: se pregunta otra vez */ }
    return null;
  }

  function guardar(valor) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ v: valor, t: Date.now() })); } catch (e) { /* sin almacenamiento */ }
  }

  function cargarAnalitica() {
    if (!medible || window.__ddjGA) return;
    window.__ddjGA = true;
    window["ga-disable-" + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function quitarAnalitica() {
    window["ga-disable-" + GA_ID] = true;
    var dominio = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (/^_ga(_|$)/.test(nombre)) {
        ["", "; domain=" + dominio, "; domain=." + dominio].forEach(function (d) {
          document.cookie = nombre + "=; Max-Age=0; path=/" + d;
        });
      }
    });
  }

  function mostrarAviso() {
    if (!aviso) return;
    aviso.hidden = false;
  }

  function ocultarAviso() {
    if (aviso) aviso.hidden = true;
  }

  if (aviso) {
    aviso.addEventListener("click", function (e) {
      var boton = e.target.closest("[data-consentimiento]");
      if (!boton) return;
      var valor = boton.getAttribute("data-consentimiento");
      guardar(valor);
      ocultarAviso();
      if (valor === "si") cargarAnalitica();
      else quitarAnalitica();
    });
  }

  document.querySelectorAll("[data-cookies]").forEach(function (b) {
    b.addEventListener("click", mostrarAviso);
  });

  var decision = leer();
  if (decision === "si") cargarAnalitica();
  else if (decision === null && medible) setTimeout(mostrarAviso, 1200);

  /* ---------- Orden de trazos ---------- */
  var dibujos = Array.prototype.slice.call(document.querySelectorAll(".kanji__dibujo"));
  var conMovimiento = document.documentElement.classList.contains("js-anim");

  function animar(dibujo, espera) {
    dibujo.classList.remove("animar");
    dibujo.style.setProperty("--espera", (espera || 0) + "s");
    void dibujo.getBoundingClientRect(); // reinicia la animación
    dibujo.classList.add("animar");
  }

  dibujos.forEach(function (dibujo) {
    dibujo.addEventListener("click", function () {
      if (conMovimiento) animar(dibujo, 0);
    });
  });

  if (conMovimiento && dibujos.length) {
    var empezar = function () {
      // 辞 primero; 書 cuando acaba el último trazo de 辞.
      var espera = 0;
      dibujos.forEach(function (dibujo) {
        animar(dibujo, espera);
        espera += dibujo.querySelectorAll("path").length * 0.27 + 0.5;
      });
    };
    if ("IntersectionObserver" in window) {
      var observador = new IntersectionObserver(function (entradas) {
        if (entradas.some(function (e) { return e.isIntersecting; })) {
          observador.disconnect();
          empezar();
        }
      }, { threshold: 0.6 });
      observador.observe(document.querySelector(".ficha__kanji"));
    } else {
      empezar();
    }
  }
})();
