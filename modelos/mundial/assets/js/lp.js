/* Landing pages: WhatsApp, parâmetros de origem, FAQ e animação de entrada */
(function () {
  Mundial.keepParams();
  Mundial.wireWhatsApp();

  document.querySelectorAll("a[data-track]").forEach(function (a) {
    a.addEventListener("click", function () { Mundial.track(a.dataset.track, { destino: a.getAttribute("href") }); });
  });

  // FAQ exclusivo: <details name="..."> já fecha a resposta anterior nos navegadores atuais; aqui fica o fallback.
  if (!("name" in HTMLDetailsElement.prototype)) {
    document.querySelectorAll("details[name]").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        document.querySelectorAll("details[name]").forEach(function (o) {
          if (o !== d && o.getAttribute("name") === d.getAttribute("name")) o.open = false;
        });
      });
    });
  }

  Mundial.reveal(".fx", { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
})();
