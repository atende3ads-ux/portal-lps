/* Mundial Refrigeração — configuração e utilitários compartilhados */
(function () {
  // Parâmetros de aquisição preservados entre a página de escolha e as LPs
  var KEEP = /^(utm_|gclid$|gbraid$|wbraid$|fbclid$|msclkid$|ttclid$)/;

  function acquisitionParams() {
    var out = new URLSearchParams();
    new URLSearchParams(window.location.search).forEach(function (v, k) {
      if (KEEP.test(k)) out.set(k, v);
    });
    return out;
  }

  function keepParams(root) {
    var params = acquisitionParams();
    if (![...params.keys()].length) return;
    (root || document).querySelectorAll("a[data-keep-params]").forEach(function (a) {
      var url = new URL(a.getAttribute("href"), window.location.href);
      params.forEach(function (v, k) { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
      a.setAttribute("href", url.pathname + url.search + url.hash);
    });
  }

  // Eventos só entram no dataLayer depois de o visitante autorizar analytics ou marketing; antes disso são descartados
  // (assim o GTM não reproduz, mais tarde, cliques feitos antes da escolha). Nunca inclua PII no payload.
  function track(event, data) {
    var consent = window.MundialConsent;
    if (!consent || !(consent.allows("analytics") || consent.allows("marketing"))) return;
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event };
    for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
  }

  // Botões de WhatsApp: o href é o link rastreável do Spar (/l/<slug>), que o spar-track.js decora com
  // gclid/fbclid/UTMs. data-wa="camara|linha", data-intent e data-pos alimentam o dataLayer.
  function wireWhatsApp(root) {
    (root || document).querySelectorAll("a[data-wa]").forEach(function (a) {
      a.target = "_blank";
      a.rel = "noopener";
      a.addEventListener("click", function () {
        track("clique_whatsapp", {
          frente: a.dataset.wa,
          intencao: a.dataset.intent || "geral",
          posicao: a.dataset.pos || ""
        });
      });
    });
  }

  // Revelação única ao rolar. Só esconde (.fx-wait) o que está abaixo da dobra no carregamento:
  // hero e conteúdo já visível nunca somem; sem JS, sem IntersectionObserver ou com redução de movimento, nada é escondido.
  function reveal(selector, options) {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.classList.add("fx-in");
        el.classList.remove("fx-wait");
        el.addEventListener("transitionend", function done(ev) {
          if (ev.target !== el) return;
          el.classList.remove("fx-in"); // devolve ao elemento as próprias transições (ex.: hover dos cards)
          el.style.removeProperty("--fx-d");
          el.removeEventListener("transitionend", done);
        });
      });
    }, options);
    var seen = new Map(); // escalona irmãos que entram juntos (grades de cards)
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.getBoundingClientRect().top <= vh) return;
      var n = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, n + 1);
      if (n) el.style.setProperty("--fx-d", Math.min(n, 4) * 70 + "ms");
      el.classList.add("fx-wait");
      io.observe(el);
    });
  }

  window.Mundial = { keepParams: keepParams, track: track, wireWhatsApp: wireWhatsApp, reveal: reveal };
})();
