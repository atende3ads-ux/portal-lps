/* Scooter Goiânia — interações das landing pages
   Os cards de produto, ícones e links de WhatsApp já vêm prontos no HTML (gerados por _dev/build.mjs). */

const CONFIG = {
  // ID do contêiner do Google Tag Manager (ex.: 'GTM-XXXXXXX'). Vazio = GTM desativado.
  // GA4 e Google Ads devem ser configurados dentro do GTM.
  gtmId: 'GTM-59HD4DQB',
  // URL do webhook que recebe os cliques no WhatsApp (ex.: n8n, Make, Zapier). Vazio = desativado.
  // O domínio precisa estar liberado no connect-src da CSP (.htaccess).
  webhookUrl: '',
  whatsappDefault: '5562999881098'
};

const WHATSAPP_NUMBER = document.body.dataset.whatsappNumber || CONFIG.whatsappDefault;
const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}`;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.dataLayer = window.dataLayer || [];

/* ---------- Links de WhatsApp (mantém o href em sincronia com data-message) ---------- */
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  const message = encodeURIComponent(link.dataset.message || 'Olá! Gostaria de falar com a equipe da Scooter Goiânia.');
  link.href = `${WHATSAPP}?text=${message}`;
  link.target = '_blank';
  link.rel = 'noopener';
});

/* ---------- Parâmetros de campanha (UTM, gclid, fbclid) guardados na sessão ---------- */
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
const campaign = (() => {
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('sg_campaign') || '{}'); } catch (e) { /* storage indisponível */ }
  const params = new URLSearchParams(location.search);
  const fresh = Object.fromEntries(CAMPAIGN_KEYS.filter(k => params.get(k)).map(k => [k, params.get(k)]));
  const merged = Object.keys(fresh).length ? fresh : stored;
  try { sessionStorage.setItem('sg_campaign', JSON.stringify(merged)); } catch (e) { /* storage indisponível */ }
  return merged;
})();

/* ---------- Rastreamento de cliques no WhatsApp (dataLayer + webhook) ---------- */
document.addEventListener('click', event => {
  const link = event.target.closest('[data-whatsapp]');
  if (!link) return;
  const section = link.closest('section[id], header, footer, .floating-whatsapp');
  const detail = {
    event: 'whatsapp_click',
    whatsapp_number: WHATSAPP_NUMBER,
    whatsapp_message: link.dataset.message || '',
    product_name: link.dataset.product || '',
    click_location: link.classList.contains('floating-whatsapp') ? 'botao_flutuante' : (section?.id || section?.tagName.toLowerCase() || 'pagina'),
    page_path: location.pathname
  };
  window.dataLayer.push(detail);
  if (CONFIG.webhookUrl && navigator.sendBeacon) {
    const body = new URLSearchParams({ ...detail, page_url: location.href, page_title: document.title, referrer: document.referrer, timestamp: new Date().toISOString(), ...campaign });
    navigator.sendBeacon(CONFIG.webhookUrl, body);
  }
});

/* ---------- Carrossel de produtos ---------- */
document.querySelectorAll('[data-carousel]').forEach(wrapper => {
  const track = wrapper.querySelector('.product-carousel');
  if (!track) return;
  const step = () => {
    const card = track.firstElementChild;
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 380;
  };
  wrapper.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  wrapper.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
});

/* ---------- Header ao rolar ---------- */
const header = document.querySelector('.site-header');
if (header) {
  let ticking = false;
  const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 120); ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Título animado do hero (desktop e tablet) ---------- */
document.querySelectorAll('[data-animated-heading]').forEach(heading => {
  if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 620px)').matches) return;
  const lines = heading.innerText.split('\n');
  let characterIndex = 0;
  heading.textContent = '';
  lines.forEach((lineText, lineIndex) => {
    const line = document.createElement('span');
    line.className = 'animated-line';
    line.setAttribute('aria-hidden', 'true');
    [...lineText].forEach(character => {
      const span = document.createElement('span');
      span.className = 'animated-char';
      span.textContent = character === ' ' ? ' ' : character;
      span.style.setProperty('--char-delay', `${200 + characterIndex * 30}ms`);
      characterIndex += 1;
      line.appendChild(span);
    });
    heading.appendChild(line);
    if (lineIndex < lines.length - 1) heading.appendChild(document.createElement('br'));
  });
});

/* ---------- FAQ em sanfona: abre um e fecha os outros, com animação ----------
   Sem JS, o atributo name="faq" dos <details> já garante um item aberto por vez. */
document.querySelectorAll('.faq-list').forEach(list => {
  const items = [...list.querySelectorAll('.faq-item')];
  const duration = reduceMotion ? 0 : 380;
  const easing = 'cubic-bezier(.2,.7,.2,1)';
  // O JS controla a exclusividade; o name nativo fecharia os outros sem animação
  items.forEach(item => item.removeAttribute('name'));

  const closedHeight = item => item.querySelector('summary').offsetHeight + (item.offsetHeight - item.clientHeight);
  const run = (item, from, to, done) => {
    item.animation?.cancel();
    item.classList.add('is-animating');
    const animation = item.animate({ height: [`${from}px`, `${to}px`] }, { duration, easing });
    item.animation = animation;
    animation.onfinish = () => { item.animation = null; item.classList.remove('is-animating'); done?.(); };
    animation.oncancel = () => { item.classList.remove('is-animating'); };
    return animation.finished.catch(() => {});
  };
  const close = item => {
    if (!item.open || item.classList.contains('is-closing')) return Promise.resolve();
    item.classList.add('is-closing');
    return run(item, item.offsetHeight, closedHeight(item), () => { item.open = false; item.classList.remove('is-closing'); });
  };
  const open = item => {
    item.classList.remove('is-closing');
    const from = item.animation ? item.offsetHeight : closedHeight(item);
    item.animation?.cancel();
    item.open = true;
    return run(item, from, item.offsetHeight);
  };

  items.forEach(item => {
    const summary = item.querySelector('summary');
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (item.open && !item.classList.contains('is-closing')) { close(item); return; }
      const others = items.filter(other => other !== item).map(close);
      open(item);
      window.dataLayer.push({ event: 'faq_open', faq_question: summary.textContent.trim(), page_path: location.pathname });
      // Se a pergunta subir para baixo do header ao fechar a anterior, reposiciona a rolagem
      Promise.all(others).then(() => {
        const top = summary.getBoundingClientRect().top;
        if (top < 110) window.scrollBy({ top: top - 110, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    // Aberturas feitas pelo navegador (ex.: busca na página) também fecham as demais
    item.addEventListener('toggle', () => {
      if (item.open && !item.animation) items.filter(other => other !== item && other.open).forEach(close);
    });
  });
});

/* ---------- Efeitos de rolagem (fade in / slide) ---------- */
(() => {
  document.querySelectorAll('[data-reveal-stagger]').forEach(group => {
    [...group.children].forEach((child, index) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', group.dataset.revealStagger || '');
      child.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 90}ms`);
    });
  });
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length) return;
  // Ao terminar a animação, remove o reveal para devolver os estilos originais (hover, transições)
  const settle = el => { el.removeAttribute('data-reveal'); el.classList.remove('is-visible'); el.style.removeProperty('--reveal-delay'); };
  const reveal = el => {
    el.classList.add('is-visible');
    setTimeout(() => settle(el), (parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0) + 900);
  };
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(settle);
    return;
  }
  // O que já está na tela no carregamento não anima (evita "piscar")
  const viewportHeight = window.innerHeight;
  const pending = items.filter(el => {
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < viewportHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
    if (onScreen) settle(el);
    return !onScreen;
  });
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  pending.forEach(el => observer.observe(el));
})();

/* ---------- Google Tag Manager ----------
   Carrega no que vier primeiro: primeira interação do visitante (toque, rolagem, tecla) ou logo após o load.
   Assim não pesa no PageSpeed e fica pronto antes dos cliques nos botões de WhatsApp. */
function loadGTM(id) {
  if (!/^GTM-[A-Z0-9]+$/.test(id) || window.google_tag_manager) return;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
  document.head.appendChild(script);
}
if (CONFIG.gtmId) {
  const interactions = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'mousemove'];
  const startNow = () => { interactions.forEach(type => window.removeEventListener(type, startNow)); loadGTM(CONFIG.gtmId); };
  interactions.forEach(type => window.addEventListener(type, startNow, { once: true, passive: true }));
  const afterLoad = () => ('requestIdleCallback' in window ? requestIdleCallback(startNow, { timeout: 1500 }) : setTimeout(startNow, 1));
  if (document.readyState === 'complete') afterLoad(); else window.addEventListener('load', afterLoad, { once: true });
}
