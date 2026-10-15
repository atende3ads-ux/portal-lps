(() => {
  "use strict";

  const floatingSelector = '[data-id="e0adc9d"], [data-id="b53421f"]';
  const assetBase = new URL(".", document.currentScript?.src || document.baseURI);

  const elevateFloatingButtons = () => {
    const pageRoot = document.querySelector('[data-elementor-type="wp-page"]');
    if (!pageRoot) return;

    document.querySelectorAll(floatingSelector).forEach((button) => {
      if (button.parentElement !== pageRoot) pageRoot.appendChild(button);

      button.style.setProperty("position", "fixed", "important");
      button.style.setProperty("z-index", "2147483647", "important");
      button.style.setProperty("pointer-events", "none", "important");

      button.querySelectorAll("a").forEach((link) => {
        link.style.setProperty("position", "relative", "important");
        link.style.setProperty("z-index", "2147483647", "important");
        link.style.setProperty("pointer-events", "auto", "important");
        link.querySelectorAll("*").forEach((child) => {
          child.style.setProperty("pointer-events", "auto", "important");
        });
      });
    });

    const syncClickTargets = () => {
      document.querySelectorAll(floatingSelector).forEach((button) => {
        const link = button.querySelector("a");
        if (!link) return;

        let target = pageRoot.querySelector(`[data-iceo-floating-target="${button.dataset.id}"]`);
        if (!target) {
          target = document.createElement("a");
          target.dataset.iceoFloatingTarget = button.dataset.id;
          target.setAttribute("aria-hidden", "true");
          target.tabIndex = -1;
          target.addEventListener("pointerdown", () => {
            target.href = link.href;
          });
          pageRoot.appendChild(target);
        }

        const rect = link.getBoundingClientRect();
        target.href = link.href;
        target.target = link.target;
        target.rel = link.rel;
        target.style.cssText = [
          "position:fixed!important",
          "z-index:2147483647!important",
          `left:${rect.left}px!important`,
          `top:${rect.top}px!important`,
          `width:${rect.width}px!important`,
          `height:${rect.height}px!important`,
          `display:${rect.width && rect.height ? "block" : "none"}!important`,
          "background:transparent!important",
          "pointer-events:auto!important",
          "touch-action:manipulation",
        ].join(";");
      });
    };

    requestAnimationFrame(syncClickTargets);
    window.setTimeout(syncClickTargets, 350);
  };

  const enableScrollReveals = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pageRoot = document.querySelector('[data-elementor-type="wp-page"]');
    if (!pageRoot) return;

    const sections = [...pageRoot.children].filter((section) => {
      if (!section.matches(".e-con.e-parent")) return false;
      if (section.matches(floatingSelector)) return false;
      return !["69df86f", "63508ad"].includes(section.dataset.id);
    });

    sections.forEach((section, index) => {
      section.classList.add("iceo-reveal");
      if (index % 3 === 2) section.classList.add("iceo-reveal--right");
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    sections.forEach((section) => observer.observe(section));
  };

  const finishElementorAnimations = () => {
    window.setTimeout(() => {
      document.querySelectorAll(".elementor-invisible").forEach((element) => {
        if (!element.closest(".elementor-popup-modal")) {
          element.classList.remove("elementor-invisible");
          element.classList.add("animated", "fadeInUp");
        }
      });
    }, 1800);
  };

  const initializeNativeCarousels = () => {
    document.querySelectorAll(".elementor-image-carousel-wrapper").forEach((carousel) => {
      carousel.classList.add("iceo-native-carousel");
      carousel.removeAttribute("aria-roledescription");
    });
  };

  const initializeAccordion = () => {
    document.querySelectorAll(".eael-accordion-header").forEach((header) => {
      const contentId = header.getAttribute("aria-controls");
      const content = contentId ? document.getElementById(contentId) : null;
      if (!content) return;
      const expanded = header.classList.contains("active-default");
      header.setAttribute("role", "button");
      header.setAttribute("aria-expanded", String(expanded));
      content.hidden = !expanded;

      const toggle = () => {
        const accordion = header.closest(".eael-adv-accordion");
        accordion?.querySelectorAll(".eael-accordion-header").forEach((item) => {
          const target = document.getElementById(item.getAttribute("aria-controls") || "");
          const open = item === header && item.getAttribute("aria-expanded") !== "true";
          item.setAttribute("aria-expanded", String(open));
          item.classList.toggle("active", open);
          if (target) target.hidden = !open;
        });
      };

      header.addEventListener("click", toggle);
      header.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggle();
      });
    });
  };

  const initializeMenu = () => {
    const popup = document.querySelector(".elementor-location-popup");
    if (!popup) return;
    const openers = document.querySelectorAll('a[href^="#elementor-action"]');
    const close = () => {
      popup.classList.remove("iceo-popup-open");
      popup.setAttribute("aria-hidden", "true");
      document.body.classList.remove("iceo-menu-open");
    };
    const open = (event) => {
      event.preventDefault();
      popup.classList.add("iceo-popup-open");
      popup.setAttribute("aria-hidden", "false");
      document.body.classList.add("iceo-menu-open");
      popup.querySelector("a")?.focus();
    };
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-label", "Menu de navegação");
    popup.setAttribute("aria-hidden", "true");
    openers.forEach((opener) => opener.addEventListener("click", open));
    popup.addEventListener("click", (event) => {
      if (event.target === popup || event.target.closest('a[href^="#"]')) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  };

  const lazyLoadReviews = () => {
    const placeholder = document.querySelector('[data-template-id="trustindex-google-widget-html"]');
    const template = document.getElementById("trustindex-google-widget-html");
    if (!placeholder || !template) return;

    const load = () => {
      if (placeholder.dataset.loaded === "true") return;
      placeholder.dataset.loaded = "true";

      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = placeholder.dataset.cssUrl;
      document.head.appendChild(stylesheet);

      const fragment = template.content.cloneNode(true);
      fragment.querySelectorAll("trustindex-image").forEach((source) => {
        const image = document.createElement("img");
        [...source.attributes].forEach((attribute) => {
          if (attribute.name !== "data-imgurl") image.setAttribute(attribute.name, attribute.value);
        });
        image.src = source.dataset.imgurl;
        source.replaceWith(image);
      });
      placeholder.replaceWith(fragment);

      const reviews = document.querySelector(".ti-reviews-container-wrapper");
      document.querySelector(".ti-next")?.addEventListener("click", () => {
        reviews?.scrollBy({ left: reviews.clientWidth, behavior: "smooth" });
      });
      document.querySelector(".ti-prev")?.addEventListener("click", () => {
        reviews?.scrollBy({ left: -reviews.clientWidth, behavior: "smooth" });
      });
    };

    const reviews = document.querySelector("#depoimentos");
    if (!reviews || !("IntersectionObserver" in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      load();
      observer.disconnect();
    }, { rootMargin: "700px 0px" });
    observer.observe(reviews);
  };

  const loadFontsAfterFirstPaint = () => {
    if (document.querySelector("link[data-iceo-fonts]")) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.dataset.iceoFonts = "true";
    stylesheet.href = new URL("fonts.css", assetBase).href;
    document.head.appendChild(stylesheet);
  };

  const initialize = () => {
    elevateFloatingButtons();
    enableScrollReveals();
    finishElementorAnimations();
    initializeNativeCarousels();
    initializeAccordion();
    initializeMenu();
    lazyLoadReviews();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  ["pointermove", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, loadFontsAfterFirstPaint, { once: true, passive: true });
  });
  window.addEventListener("pageshow", elevateFloatingButtons);
  window.addEventListener("resize", elevateFloatingButtons, { passive: true });
  window.addEventListener("orientationchange", elevateFloatingButtons, { passive: true });
  window.addEventListener("load", () => window.setTimeout(loadFontsAfterFirstPaint, 5000), { once: true });
})();
