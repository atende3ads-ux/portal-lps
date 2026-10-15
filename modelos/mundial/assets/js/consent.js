/* Consentimento (LGPD): banner, preferências e carregamento condicional de GTM, GA4, Clarity e Spar.
   Modo básico do Consent Mode v2: nenhuma tag opcional é carregada antes da escolha.
   O estado padrão (tudo negado) é definido por um script inline no <head>, antes de qualquer tag. */
(function () {
  "use strict";

  var KEY = "mundial_consent";
  var VERSION = 1; // versão do aviso: ao subir, o visitante escolhe de novo
  var POLICY_URL = "/politica-de-privacidade/";

  var GTM_ID = "GTM-T6JJ5MPM";
  var GA_ID = "G-YPNLP0WT4K";
  var CLARITY_ID = "yqihasm6oq";
  var SPAR_SRC = "https://spar.3ads.com.br/spar-track.js";

  // ---------- Estado ----------
  var memory = null; // usado se o armazenamento do navegador estiver bloqueado
  var loaded = {};

  function read() {
    var s = null;
    try { s = JSON.parse(window.localStorage.getItem(KEY)); } catch (e) {}
    if (!s) s = memory;
    return s && s.v === VERSION && typeof s.analytics === "boolean" && typeof s.marketing === "boolean" ? s : null;
  }

  function write(analytics, marketing) {
    var s = { v: VERSION, ts: new Date().toISOString(), mode: "basic", analytics: analytics, marketing: marketing };
    memory = s;
    try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function gtag() {
    (window.dataLayer = window.dataLayer || []).push(arguments);
  }

  function signals(s) {
    var a = s.analytics ? "granted" : "denied";
    var m = s.marketing ? "granted" : "denied";
    return { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m };
  }

  // ---------- Carregamento das tags (somente após consentimento) ----------
  function addScript(src, async) {
    var el = document.createElement("script");
    el.src = src;
    el.async = async !== false;
    document.head.appendChild(el);
  }

  function once(name, fn) {
    if (loaded[name]) return;
    loaded[name] = true;
    fn();
  }

  function loadGtm() {
    once("gtm", function () {
      (window.dataLayer = window.dataLayer || []).push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      addScript("https://www.googletagmanager.com/gtm.js?id=" + GTM_ID);
    });
  }

  function loadGa() {
    once("ga", function () {
      addScript("https://www.googletagmanager.com/gtag/js?id=" + GA_ID);
      gtag("js", new Date());
      // Cookies só desta página: sem compartilhar com o site institucional, prefixados e com validade de 13 meses
      gtag("config", GA_ID, { cookie_domain: window.location.hostname, cookie_prefix: "lp", cookie_expires: 34128000 });
    });
  }

  function clarityConsent(s) {
    if (typeof window.clarity !== "function") return;
    window.clarity("consentv2", {
      ad_Storage: s.marketing ? "granted" : "denied",
      analytics_Storage: s.analytics ? "granted" : "denied"
    });
  }

  function loadClarity(s) {
    once("clarity", function () {
      (function (c, a) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      })(window, "clarity");
      clarityConsent(s);
      addScript("https://www.clarity.ms/tag/" + CLARITY_ID);
    });
  }

  function loadSpar() {
    once("spar", function () { addScript(SPAR_SRC, false); });
  }

  function start(s) {
    if (s.analytics || s.marketing) loadGtm();
    if (s.analytics) { loadGa(); loadClarity(s); }
    if (s.marketing) loadSpar();
    if (loaded.clarity) clarityConsent(s);
  }

  // ---------- Limpeza ao negar ou revogar ----------
  var COOKIES = {
    analytics: /^(_ga|_ga_[A-Z0-9]+|_gid|_gat.*|lp_ga.*|_clck|_clsk)$/,
    marketing: /^(_gcl_[a-z]+|_fbp|_fbc)$/
  };

  function cookieDomains() {
    var host = window.location.hostname, list = [""];
    if (/^[\d.]+$/.test(host) || host.indexOf(".") < 0) return [""].concat(host);
    var parts = host.split(".");
    while (parts.length >= 2) { list.push(parts.join(".")); list.push("." + parts.join(".")); parts.shift(); }
    return list;
  }

  function removeCookies(re) {
    var names = document.cookie ? document.cookie.split(";") : [];
    var domains = cookieDomains();
    names.forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!re.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  function cleanup(s) {
    if (!s.analytics) removeCookies(COOKIES.analytics);
    if (!s.marketing) {
      removeCookies(COOKIES.marketing);
      try { window.localStorage.removeItem("spar_attribution"); } catch (e) {}
    }
  }

  // ---------- Aplicação da escolha ----------
  function apply(next, prev) {
    gtag("consent", "update", signals(next));
    cleanup(next);
    var wasLoaded = loaded.gtm || loaded.ga || loaded.clarity || loaded.spar || (prev && (prev.analytics || prev.marketing));
    var revoked = prev && ((prev.analytics && !next.analytics) || (prev.marketing && !next.marketing));
    if (revoked && wasLoaded) {
      clarityConsent(next);
      // Recarrega para que nenhum script já em execução continue medindo
      window.location.reload();
      return true;
    }
    start(next);
    return false;
  }

  // ---------- Conteúdo ----------
  var CATEGORIES = [
    {
      id: "necessarios",
      title: "Necessários",
      text: "Guardam a sua escolha de privacidade neste navegador. Estão sempre ativos e não servem para publicidade.",
      items: [
        ["Mundial Refrigeração", "Armazenamento local", "mundial_consent", "produto.mundialrefrigeracaogo.com.br",
          "Registra as categorias escolhidas, a data e a versão deste aviso.", "Até você limpar os dados do navegador ou alterar a escolha"]
      ]
    },
    {
      id: "analytics",
      title: "Analytics",
      text: "Ajudam a entender como a página é usada (visitas, páginas, cliques e gravações de navegação) para melhorar o conteúdo.",
      items: [
        ["Google (Google Analytics 4)", "Cookie", "lp_ga e lp_ga_YPNLP0WT4K", "produto.mundialrefrigeracaogo.com.br",
          "Distingue visitantes e mantém a sessão de medição.", "13 meses"],
        ["Google (Tag Manager)", "Script", "Sem cookie próprio", "googletagmanager.com",
          "Carrega as tags de medição autorizadas.", "Não se aplica"],
        ["Microsoft (Clarity)", "Cookie", "_clck e _clsk", "mundialrefrigeracaogo.com.br",
          "Identificador do visitante e da sessão para mapas de calor e gravações de uso.", "_clck: 1 ano · _clsk: 1 dia (documentação do fornecedor)"],
        ["Microsoft (Clarity)", "Cookie de terceiro", "CLID, ANONCHK, MR, MUID e SM", "clarity.ms e bing.com",
          "Identificação do navegador e sincronização entre domínios da Microsoft.", "Definida pelo fornecedor"]
      ]
    },
    {
      id: "marketing",
      title: "Marketing",
      text: "Permitem saber de qual anúncio ou campanha você veio e ligar essa origem ao clique no botão de WhatsApp.",
      items: [
        ["Spar", "Armazenamento local", "spar_attribution", "produto.mundialrefrigeracaogo.com.br",
          "Guarda a origem da visita (UTMs, identificadores de clique de anúncios, endereço de entrada e referência) e a anexa ao link do WhatsApp.", "Até você limpar os dados do navegador ou revogar"],
        ["Google (sinais de anúncios)", "Sinais de consentimento", "ad_storage, ad_user_data e ad_personalization", "googletagmanager.com",
          "Informam ao Google que você autorizou o uso de dados para anúncios. Cookies de publicidade só existem se houver tags de anúncios ativas.", "Não se aplica"]
      ]
    }
  ];

  var LABELS = ["Fornecedor", "Tecnologia", "Nome", "Domínio", "Finalidade", "Duração"];

  var ICON_SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  // ---------- Interface ----------
  var banner, overlay, modal, live, opener, inerted = [];
  var root = document.documentElement;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  function announce(msg) {
    if (!live) {
      live = el("div", "sr-only");
      live.setAttribute("role", "status");
      document.body.appendChild(live);
    }
    live.textContent = "";
    window.setTimeout(function () { live.textContent = msg; }, 60);
  }

  function setOffset() {
    if (!banner) { root.style.removeProperty("--cc-h"); return; }
    // offsetHeight ignora a animação de entrada (transform); soma-se a folga inferior do cartão (desktop)
    var gap = parseFloat(window.getComputedStyle(banner).bottom) || 0;
    root.style.setProperty("--cc-h", Math.ceil(banner.offsetHeight + gap) + "px");
  }

  function buildBanner() {
    banner = el("div", "cc");
    banner.id = "cc-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-labelledby", "cc-title");
    banner.innerHTML =
      '<div class="cc-main">' +
        '<span class="cc-ico">' + ICON_SHIELD + '</span>' +
        '<div class="cc-copy">' +
          '<h2 class="cc-title" id="cc-title">Sua privacidade</h2>' +
          '<p>Usamos tecnologias necessárias para a página funcionar e, se você permitir, outras para análise de uso e medição de anúncios. ' +
          'Escolha como continuar. <a href="' + POLICY_URL + '">Política de Privacidade</a></p>' +
        '</div>' +
      '</div>' +
      '<div class="cc-actions">' +
        '<button type="button" class="cc-btn cc-btn--solid" data-cc="accept">Aceitar todos</button>' +
        '<button type="button" class="cc-btn cc-btn--solid" data-cc="reject">Rejeitar opcionais</button>' +
        '<button type="button" class="cc-btn cc-btn--line" data-cc="custom">Personalizar</button>' +
      '</div>';
    document.body.insertBefore(banner, document.body.firstChild);
    root.classList.add("cc-open");
    setOffset();
    if ("ResizeObserver" in window) new ResizeObserver(setOffset).observe(banner);
    window.addEventListener("resize", setOffset);
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cc]");
      if (!b) return;
      if (b.dataset.cc === "accept") decide(true, true);
      else if (b.dataset.cc === "reject") decide(false, false);
      else openPrefs(b);
    });
  }

  function removeBanner() {
    if (!banner) return;
    banner.parentNode.removeChild(banner);
    banner = null;
    root.classList.remove("cc-open");
    setOffset();
  }

  function itemHtml(it) {
    return '<dl class="cc-item">' + LABELS.map(function (l, i) {
      return "<div><dt>" + l + "</dt><dd>" + esc(it[i]) + "</dd></div>";
    }).join("") + "</dl>";
  }

  function categoryHtml(c, state) {
    var optional = c.id !== "necessarios";
    var control = optional
      ? '<label class="cc-switch"><input type="checkbox" role="switch" id="cc-sw-' + c.id + '" aria-labelledby="cc-h-' + c.id + '"' + (state[c.id] ? " checked" : "") + '>' +
        '<span class="cc-track" aria-hidden="true"></span><span class="cc-state" data-for="' + c.id + '">' + (state[c.id] ? "Ativado" : "Desativado") + "</span></label>"
      : '<span class="cc-always">Sempre ativos</span>';
    return '<div class="cc-cat">' +
      '<div class="cc-cat-head"><h3 id="cc-h-' + c.id + '">' + c.title + "</h3>" + control + "</div>" +
      "<p>" + c.text + "</p>" +
      '<details class="cc-det"><summary>Ver detalhes</summary>' + c.items.map(itemHtml).join("") + "</details>" +
      "</div>";
  }

  function buildModal() {
    var saved = read() || { analytics: false, marketing: false };
    overlay = el("div", "cc-overlay");
    overlay.innerHTML =
      '<div class="cc-modal" role="dialog" aria-modal="true" aria-labelledby="cc-mt" aria-describedby="cc-md">' +
        '<div class="cc-mhead">' +
          '<h2 id="cc-mt" tabindex="-1">Preferências de privacidade</h2>' +
          '<button type="button" class="cc-x" data-cc="close" aria-label="Fechar sem salvar alterações">' + ICON_CLOSE + "</button>" +
        "</div>" +
        '<div class="cc-mbody">' +
          '<p id="cc-md">Escolha quais categorias você autoriza. As opcionais começam desativadas e você pode mudar a decisão quando quiser em “Configurações de privacidade”, no rodapé. ' +
          '<a href="' + POLICY_URL + '">Política de Privacidade</a></p>' +
          CATEGORIES.map(function (c) { return categoryHtml(c, saved); }).join("") +
        "</div>" +
        '<div class="cc-mfoot">' +
          '<button type="button" class="cc-btn cc-btn--solid" data-cc="save">Salvar preferências</button>' +
          '<button type="button" class="cc-btn cc-btn--solid" data-cc="reject">Rejeitar opcionais</button>' +
          '<button type="button" class="cc-btn cc-btn--solid" data-cc="accept">Aceitar todos</button>' +
        "</div>" +
      "</div>";
    modal = overlay.firstChild;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) return closePrefs();
      var b = e.target.closest("[data-cc]");
      if (!b) return;
      var a = b.dataset.cc;
      if (a === "close") closePrefs();
      else if (a === "accept") decide(true, true);
      else if (a === "reject") decide(false, false);
      else if (a === "save") decide(overlay.querySelector("#cc-sw-analytics").checked, overlay.querySelector("#cc-sw-marketing").checked);
    });
    overlay.addEventListener("change", function (e) {
      var sw = e.target;
      if (sw.type !== "checkbox") return;
      var s = overlay.querySelector('[data-for="' + sw.id.replace("cc-sw-", "") + '"]');
      if (s) s.textContent = sw.checked ? "Ativado" : "Desativado";
    });
  }

  function setInert(on) {
    if (on) {
      [].forEach.call(document.body.children, function (n) {
        if (n === overlay || n === live || n.hasAttribute("inert")) return;
        n.setAttribute("inert", "");
        inerted.push(n);
      });
    } else {
      inerted.forEach(function (n) { n.removeAttribute("inert"); });
      inerted = [];
    }
  }

  function focusables() {
    return [].filter.call(modal.querySelectorAll('a[href], button, input, summary, [tabindex]:not([tabindex="-1"])'), function (n) {
      return !n.disabled && n.offsetParent !== null;
    });
  }

  function onKey(e) {
    if (!modal) return;
    if (e.key === "Escape") { e.preventDefault(); closePrefs(); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPrefs(from) {
    if (overlay) return;
    opener = from || document.activeElement;
    buildModal();
    setInert(true);
    root.classList.add("cc-lock");
    document.addEventListener("keydown", onKey);
    modal.querySelector("#cc-mt").focus();
  }

  function closePrefs(restore) {
    if (!overlay) return;
    document.removeEventListener("keydown", onKey);
    setInert(false);
    overlay.parentNode.removeChild(overlay);
    overlay = modal = null;
    root.classList.remove("cc-lock");
    if (restore !== false && opener && document.contains(opener) && typeof opener.focus === "function") opener.focus();
    opener = null;
  }

  function decide(analytics, marketing) {
    var prev = read();
    var next = write(analytics, marketing);
    var reloading = apply(next, prev);
    closePrefs(false);
    removeBanner();
    if (!reloading) announce("Preferências de privacidade salvas.");
  }

  // ---------- Inicialização ----------
  function init() {
    var state = read();
    if (state) {
      start(state);
    } else {
      buildBanner();
    }
    [].forEach.call(document.querySelectorAll("[data-consent-open]"), function (b) {
      b.addEventListener("click", function () { openPrefs(b); });
    });
  }

  window.MundialConsent = {
    allows: function (category) { var s = read(); return !!(s && s[category]); },
    open: function () { openPrefs(document.activeElement); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
