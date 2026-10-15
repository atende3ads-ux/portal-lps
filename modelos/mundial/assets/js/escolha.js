/* Página de escolha: marcas, parallax, inclinação, revelação e registro da seleção */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mobile = window.matchMedia("(max-width: 767.98px)");
  var SPEED = 12; // px por segundo, igual nas duas colunas

  Mundial.keepParams();

  // Registro da seleção (evento de navegação, não é lead)
  document.querySelectorAll(".choice-link").forEach(function (a) {
    a.addEventListener("click", function () {
      Mundial.track("selecao_categoria", { categoria: a.dataset.categoria });
    });
  });

  // ---------- Faixas de marcas ----------
  document.querySelectorAll("[data-brands]").forEach(function (box) {
    var track = box.querySelector(".brands-track");
    var set = track.querySelector(".brands-set");
    var clone = set.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach(function (img) { img.alt = ""; });
    track.appendChild(clone);

    function setDuration() {
      var w = set.getBoundingClientRect().width;
      if (w) track.style.setProperty("--dur", (w / SPEED).toFixed(1) + "s");
    }
    setDuration();
    window.addEventListener("load", setDuration);
    window.addEventListener("resize", setDuration);

    var btn = box.querySelector(".brands-toggle");
    btn.addEventListener("click", function () {
      var paused = box.classList.toggle("is-paused");
      btn.setAttribute("aria-pressed", String(paused));
      btn.setAttribute("aria-label", paused ? "Retomar movimento das marcas" : "Pausar movimento das marcas");
    });

    // Pausa fora da área visível
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { box.classList.toggle("is-off", !e.isIntersecting); });
      }).observe(box);
    }
  });

  // Pausa quando a aba está em segundo plano
  document.addEventListener("visibilitychange", function () {
    document.querySelectorAll("[data-brands]").forEach(function (box) {
      box.querySelector(".brands-track").style.animationPlayState = document.hidden ? "paused" : "";
    });
  });

  // ---------- Revelação única de elementos secundários ----------
  Mundial.reveal(".reveal", { threshold: 0.4 });

  if (reduce.matches) return;

  // ---------- Parallax suave ligado ao scroll real ----------
  var layers = [].slice.call(document.querySelectorAll(".px[data-px]"));
  var ticking = false;
  function parallax() {
    ticking = false;
    var vh = window.innerHeight;
    var scale = mobile.matches ? 0.5 : 1;
    layers.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 aprox.
      p = Math.max(-1, Math.min(1, p));
      var amp = parseFloat(el.dataset.px) * scale;
      el.style.setProperty("--py", (-p * amp / 2).toFixed(2) + "px");
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---------- Inclinação limitada (apenas mouse) ----------
  document.querySelectorAll(".choice-link").forEach(function (link) {
    var tilt = link.querySelector(".tilt");
    link.addEventListener("pointermove", function (e) {
      if (!finePointer.matches || e.pointerType !== "mouse") return;
      var r = link.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty("--ry", (x * 4).toFixed(2) + "deg"); // máx. 2°
      tilt.style.setProperty("--rx", (-y * 4).toFixed(2) + "deg");
    });
    link.addEventListener("pointerleave", function () {
      tilt.style.setProperty("--ry", "0deg");
      tilt.style.setProperty("--rx", "0deg");
    });
  });
})();
