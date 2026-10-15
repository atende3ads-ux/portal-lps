/* O contêiner do empreendimento carrega em toda visita e recebe a escolha do visitante
   pelo Consent Mode (negado até o aceite). O Clarity só carrega depois do aceite. */
(() => {
  // Cada empreendimento carrega apenas o próprio contêiner, na LP e na página de obrigado.
  // As páginas legais não carregam GTM.
  const LP_CONTAINER_IDS = { bueno: 'GTM-567FGJ8X', dgn: 'GTM-N8XMH8WZ', lina: 'GTM-TFTCTCLB' };
  const CLARITY_ID = 'ypvkeny2jq';
  const CONSENT_KEY = 'fr_gtm_consent_v1';
  const LEAD_KEY = 'fr_lead_success_v1';
  const MAX_CONSENT_AGE = 180 * 24 * 60 * 60 * 1000;
  const MAX_LEAD_AGE = 10 * 60 * 1000;
  const allowedSlugs = new Set(['bueno', 'dgn', 'lina']);
  const pageSegment = location.pathname.split('/')[1];
  const pageSlug = pageSegment.replace(/-obrigado$/, '');
  window.dataLayer = window.dataLayer || [];

  function readConsent() {
    try {
      const choice = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      if (choice && ['accepted', 'rejected'].includes(choice.value) &&
          Number.isFinite(choice.at) && Date.now() - choice.at < MAX_CONSENT_AGE) {
        return choice.value;
      }
      localStorage.removeItem(CONSENT_KEY);
    } catch { /* Navegador pode bloquear armazenamento. */ }
    return null;
  }

  function saveConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, at: Date.now() })); }
    catch { /* A escolha continua válida nesta visita. */ }
  }

  function queueConsent(action, granted) {
    const status = granted ? 'granted' : 'denied';
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', action, {
      analytics_storage: status,
      ad_storage: status,
      ad_user_data: status,
      ad_personalization: status,
    });
  }

  function readConfirmedLead() {
    try {
      const lead = JSON.parse(sessionStorage.getItem(LEAD_KEY) || 'null');
      if (!lead) return null;
      if (!allowedSlugs.has(lead.slug) || !Number.isFinite(lead.at) ||
          Date.now() - lead.at < 0 || Date.now() - lead.at > MAX_LEAD_AGE) {
        sessionStorage.removeItem(LEAD_KEY);
        return null;
      }
      if (lead.path !== location.pathname) return null;
      sessionStorage.removeItem(LEAD_KEY);
      return { event: 'formSubmit', empreendimento: lead.slug, origem: 'lp_fr' };
    } catch { return null; }
  }

  const pendingLead = readConfirmedLead();
  let containerLoaded = false;
  let clarityLoaded = false;
  let choice = readConsent();

  function loadContainer() {
    if (containerLoaded || !allowedSlugs.has(pageSlug)) return;
    containerLoaded = true;
    // Antes do gtm.js: estado de consentimento e evento de inicialização.
    queueConsent('default', choice === 'accepted');
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    if (pendingLead) window.dataLayer.push(pendingLead);
    appendScript(`https://www.googletagmanager.com/gtm.js?id=${LP_CONTAINER_IDS[pageSlug]}`);
  }

  function appendScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  // Clarity só nas três LPs; carregado como arquivo externo para respeitar a CSP.
  function loadClarity() {
    if (clarityLoaded || !allowedSlugs.has(pageSegment)) return;
    clarityLoaded = true;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    appendScript(`https://www.clarity.ms/tag/${CLARITY_ID}`);
  }

  loadContainer();
  if (choice === 'accepted') loadClarity();

  function renderBanner() {
    const panel = document.createElement('section');
    panel.className = 'fr-consent';
    panel.setAttribute('aria-label', 'Preferências de cookies');
    panel.innerHTML = `
      <div class="fr-consent__copy">
        <strong>Medição e publicidade</strong>
        <p>Estas páginas carregam o Google Tag Manager. Com sua autorização, as ferramentas de análise e publicidade e o Microsoft Clarity usam cookies para medir visitas, navegação e resultados das campanhas. Você pode mudar sua escolha a qualquer momento. <a href="../politica-de-cookies/">Veja a política de cookies</a>.</p>
      </div>
      <div class="fr-consent__actions">
        <button type="button" data-consent="rejected">Rejeitar opcionais</button>
        <button type="button" data-consent="accepted">Aceitar medição e publicidade</button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = button.dataset.consent;
        const previous = choice;
        saveConsent(next);
        choice = next;
        panel.hidden = true;
        const revoked = previous === 'accepted' && next === 'rejected';
        if (containerLoaded) queueConsent('update', next === 'accepted');
        if (next === 'accepted') loadClarity();
        // Revogar consentimento exige descarregar as tags já executadas.
        if (revoked) location.reload();
      });
    });
    document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
      button.addEventListener('click', () => {
        panel.hidden = false;
        panel.querySelector('button').focus();
      });
    });
    panel.hidden = choice !== null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner, { once: true });
  } else {
    renderBanner();
  }
})();
