// Protótipo Cinthya Lobo — comportamentos de interface

// Menu mobile
const burger = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// Header: escurece ao sair do hero
const header = document.getElementById('siteHeader');
if (header) {
  // Só os heros escuros (páginas internas) pedem header claro no topo
  const hero = document.querySelector('.hero-page, .event-banner-full');
  const onScroll = () => {
    header.classList.toggle('solid', window.scrollY > 40);
    if (hero) header.classList.toggle('over-hero', window.scrollY < hero.offsetHeight - 90);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Revelação ao rolar
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Faixas diagonais: deslocam horizontalmente conforme o scroll, em direções opostas
const tickerTracks = document.querySelectorAll('.ticker .track');
if (tickerTracks.length) {
  const reducedTicker = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedTicker) {
    let tickerRaf = null;
    const moveTickers = () => {
      tickerRaf = null;
      const y = window.scrollY;
      tickerTracks.forEach((track, i) => {
        const half = track.scrollWidth / 2;
        if (!half) return;
        const m = (y * 0.45) % half;
        // grupos duplicados: o wrap no módulo é invisível nas duas direções
        const shift = i % 2 === 0 ? -m : m - half;
        track.style.transform = `translateX(${shift}px)`;
      });
    };
    window.addEventListener('scroll', () => {
      if (tickerRaf === null) tickerRaf = requestAnimationFrame(moveTickers);
    }, { passive: true });
    moveTickers();
  }
}

// Citação: as palavras acendem conforme o scroll atravessa a faixa
const quote = document.querySelector('.quote-inner blockquote');
if (quote) {
  // Envolve cada palavra em um span, preservando os destaques (.hl)
  const wrapWords = (el) => {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          frag.appendChild(w);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        wrapWords(node);
      }
    });
  };
  wrapWords(quote);

  const words = quote.querySelectorAll('.w');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    words.forEach(w => w.classList.add('lit'));
  } else {
    const onQuoteScroll = () => {
      const r = quote.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o topo da citação entra em 90% do viewport; 1 quando a base chega em 45%
      const start = vh * 0.9;
      const end = vh * 0.45;
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const litCount = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
    };
    onQuoteScroll();
    window.addEventListener('scroll', onQuoteScroll, { passive: true });
  }
}

// Formulário de contato (protótipo: sem envio real)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('formOk').classList.add('show');
  });
}

// Rodapé: a marca d'água se ilumina suavemente ao redor do cursor
const footer = document.querySelector('.site-footer');
const footerWatermark = footer?.querySelector('.footer-watermark');
const canLightFooter = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (footer && footerWatermark && canLightFooter) {
  let currentX = footerWatermark.clientWidth / 2;
  let currentY = footerWatermark.clientHeight / 2;
  let targetX = currentX;
  let targetY = currentY;
  let lightRaf = null;

  const renderFooterLight = () => {
    currentX += (targetX - currentX) * .16;
    currentY += (targetY - currentY) * .16;
    footerWatermark.style.setProperty('--footer-light-x', `${currentX}px`);
    footerWatermark.style.setProperty('--footer-light-y', `${currentY}px`);

    if (Math.abs(targetX - currentX) > .2 || Math.abs(targetY - currentY) > .2) {
      lightRaf = requestAnimationFrame(renderFooterLight);
    } else {
      lightRaf = null;
    }
  };

  footer.addEventListener('pointerenter', () => footer.classList.add('has-pointer-light'));
  footer.addEventListener('pointerleave', () => footer.classList.remove('has-pointer-light'));
  footer.addEventListener('pointermove', (event) => {
    const rect = footerWatermark.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
    if (lightRaf === null) lightRaf = requestAnimationFrame(renderFooterLight);
  }, { passive:true });
}
