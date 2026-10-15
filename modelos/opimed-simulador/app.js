/* =========================================================
   OPIMED — Simulador visual de aparelho auditivo
   PROTÓTIPO: nada é enviado. As fotos ficam só no navegador,
   a "IA" é uma pontuação simples e a imagem do resultado é
   um exemplo fixo. Pontos de integração marcados com TODO.
   ========================================================= */
(function () {
  var IMG = 'https://aparelhosauditivos.opimed.com.br/wp-content/uploads/sites/2/';
  var SAMPLE = 'https://opimed.com.br/wp-content/uploads/2024/06/opimed-aparelho-auditivo.jpg';

  // Banco de modelos (3 marcas × 5 modelos). Atributos ilustrativos: validar com a Opimed.
  // forma: cic (microcanal) | ric (receptor no canal) | bte (retroauricular) | bud (intracanal, visual de fone)
  var MODELS = [
    { brand: 'Widex', name: 'Allure', tipo: 'Receptor no Canal', forma: 'ric', disc: 2, tech: 3, rec: true, bt: true, novo: true, img: IMG + '2026/01/ALLURE-RIC-R-D_Titanium-Grey_Double_Shadow_Widex.webp' },
    { brand: 'Widex', name: 'Moment Smart RIC', tipo: 'Receptor no Canal', forma: 'ric', disc: 2, tech: 3, rec: true, bt: true, img: IMG + '2024/07/SmartRIC-1-2048x2048.png' },
    { brand: 'Widex', name: 'Moment Sheer', tipo: 'Receptor no Canal', forma: 'ric', disc: 3, tech: 2, rec: true, bt: true, img: IMG + '2024/07/MOMENT-MRIC-2048x2048.png' },
    { brand: 'Widex', name: 'Moment BTE 13 D', tipo: 'Retroauricular', forma: 'bte', disc: 1, tech: 2, rec: false, bt: true, img: IMG + '2024/07/MOMENT-13-D-2048x2048.png' },
    { brand: 'Widex', name: 'Moment CIC', tipo: 'Microcanal', forma: 'cic', disc: 3, tech: 1, rec: false, bt: false, img: IMG + '2024/07/MOMENT-CIC-2048x2048.png' },

    { brand: 'Signia', name: 'Pure Charge&Go IX BCT', tipo: 'Receptor no Canal', forma: 'ric', disc: 2, tech: 3, rec: true, bt: true, novo: true, img: IMG + '2026/04/Signia_Pure-RIC-CnG-BCT-IX_DarkCham_Sleeve-M-Vented_Double_LED-On-1.webp' },
    { brand: 'Signia', name: 'Active Pro IX', tipo: 'Intracanal', forma: 'bud', disc: 2, tech: 3, rec: true, bt: true, img: IMG + '2025/04/Active-Pro.webp' },
    { brand: 'Signia', name: 'Styletto IX', tipo: 'Receptor no Canal', forma: 'ric', disc: 3, tech: 2, rec: true, bt: true, img: IMG + '2025/04/stylettoIX.webp' },
    { brand: 'Signia', name: 'Silk Charge&Go IX', tipo: 'Microcanal', forma: 'cic', disc: 3, tech: 2, rec: true, bt: false, img: IMG + '2024/07/SILK-IX-2048x2048.png' },
    { brand: 'Signia', name: 'Pure Charge&Go IX', tipo: 'Receptor no Canal', forma: 'ric', disc: 2, tech: 2, rec: true, bt: true, img: IMG + '2024/07/PURE-IX-2048x2048.png' },

    { brand: 'ReSound', name: 'Nexia 88', tipo: 'Retroauricular', forma: 'bte', disc: 1, tech: 3, rec: false, bt: true, novo: true, img: IMG + '2025/05/nexia_88-min-2048x2048.webp' },
    { brand: 'ReSound', name: 'Nexia 77', tipo: 'Retroauricular', forma: 'bte', disc: 1, tech: 3, rec: false, bt: true, novo: true, img: IMG + '2025/05/nexia_77-min-2048x2048.webp' },
    { brand: 'ReSound', name: 'Nexia 60s', tipo: 'Receptor no Canal', forma: 'ric', disc: 3, tech: 3, rec: true, bt: true, novo: true, img: IMG + '2025/05/nexia_60-min-2048x2048.webp' },
    { brand: 'ReSound', name: 'Nexia 61', tipo: 'Receptor no Canal', forma: 'ric', disc: 2, tech: 3, rec: true, bt: true, novo: true, img: IMG + '2025/05/nexia_61-min-2048x2048.webp' },
    { brand: 'ReSound', name: 'Omnia 88', tipo: 'Retroauricular', forma: 'bte', disc: 1, tech: 2, rec: false, bt: true, img: IMG + '2024/07/OMNIA-88-2048x2048.png' }
  ];
  var BRANDS = ['Widex', 'Signia', 'ReSound'];

  // As 5 perguntas do quiz
  var QUESTIONS = [
    {
      id: 'prioridade',
      title: 'O que mais importa para você em um aparelho auditivo?',
      opts: [
        { v: 'discreto', icon: 'i-eye-off', label: 'Ser discreto', desc: 'Quanto menos aparecer, melhor' },
        { v: 'tecnologia', icon: 'i-chip', label: 'Ter mais tecnologia', desc: 'Recursos e conexão com o celular' },
        { v: 'conforto', icon: 'i-feather', label: 'Ser confortável', desc: 'Leve para usar o dia inteiro' },
        { v: 'pratico', icon: 'i-battery', label: 'Ser prático', desc: 'Fácil de colocar e de carregar' }
      ]
    },
    {
      id: 'formato',
      title: 'Como você prefere usar o aparelho?',
      opts: [
        { v: 'cic', icon: 'i-ear', label: 'Dentro do ouvido', desc: 'Quase invisível' },
        { v: 'ric', icon: 'i-behind', label: 'Atrás da orelha', desc: 'Fino, com um fio discreto' },
        { v: 'bud', icon: 'i-bud', label: 'Com visual de fone', desc: 'Parece um fone de ouvido moderno' },
        { v: 'livre', icon: 'i-help', label: 'Ainda não sei', desc: 'Quero ver as opções' }
      ]
    },
    {
      id: 'situacao',
      title: 'Em que situação você mais quer ouvir melhor?',
      opts: [
        { v: 'grupo', icon: 'i-group', label: 'Conversas em grupo', desc: 'Família, amigos, reuniões' },
        { v: 'tv', icon: 'i-tv', label: 'Televisão', desc: 'Sem precisar aumentar o volume' },
        { v: 'fone', icon: 'i-phone', label: 'Telefone', desc: 'Ligações e chamadas de vídeo' },
        { v: 'ruido', icon: 'i-noise', label: 'Lugares barulhentos', desc: 'Restaurantes, rua, eventos' }
      ]
    },
    {
      id: 'celular',
      title: 'Você gostaria de conectar o aparelho ao celular?',
      opts: [
        { v: 'sim', icon: 'i-phone', label: 'Sim, quero conectar', desc: 'Atender ligações e ouvir música' },
        { v: 'talvez', icon: 'i-cell', label: 'Talvez', desc: 'Se for simples de usar' },
        { v: 'nao', icon: 'i-minus-circle', label: 'Não preciso', desc: 'Quero só ouvir melhor' }
      ]
    },
    {
      id: 'bateria',
      title: 'Como você prefere a bateria?',
      opts: [
        { v: 'rec', icon: 'i-battery', label: 'Recarregável', desc: 'Carrego à noite, como o celular' },
        { v: 'pilha', icon: 'i-cell', label: 'A pilha', desc: 'Troco quando acabar' },
        { v: 'tanto', icon: 'i-shuffle', label: 'Tanto faz', desc: 'Não é o mais importante' }
      ]
    }
  ];

  var UNIDADES = [
    'Amapá - Macapá', 'Amazonas - Manaus', 'Ceará - Fortaleza',
    'Distrito Federal - Águas Claras', 'Distrito Federal - Brasília (Asa Norte)', 'Distrito Federal - Brasília (Asa Sul)',
    'Goiás - Goiânia (Setor Marista)', 'Goiás - Goiânia (Setor Oeste)', 'Goiás - Anápolis', 'Goiás - Catalão', 'Goiás - Itumbiara', 'Goiás - Rio Verde',
    'Pará - Belém', 'Pernambuco - Recife', 'Rondônia - Porto Velho', 'Tocantins - Palmas', 'Tocantins - Araguaína'
  ];

  var icon = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };

  /* ---------- Página: animação de entrada, abas de modelos, botão flutuante ---------- */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  var tabs = document.getElementById('brandTabs');
  var grid = document.getElementById('modelGrid');
  function renderBrand(brand) {
    tabs.innerHTML = BRANDS.map(function (b) {
      return '<button type="button" class="tab" role="tab" aria-selected="' + (b === brand) + '" data-brand="' + b + '">' + b + '</button>';
    }).join('');
    grid.innerHTML = MODELS.filter(function (m) { return m.brand === brand; }).map(function (m) {
      return '<article class="model">' +
        '<div class="model__tags"><span class="tag">' + m.tipo + '</span>' +
        (m.novo ? '<span class="tag tag--gold">Lançamento</span>' : '') + '</div>' +
        '<div class="model__img"><img src="' + m.img + '" alt="" loading="lazy"></div>' +
        '<p class="model__name">' + m.name + '</p>' +
        '<p class="model__brand">' + m.brand + '</p>' +
      '</article>';
    }).join('');
  }
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-brand]');
    if (b) renderBrand(b.dataset.brand);
  });
  renderBrand(BRANDS[0]);

  var fab = document.getElementById('fab');
  function toggleFab() { fab.classList.toggle('is-visible', window.scrollY > 520); }
  window.addEventListener('scroll', toggleFab, { passive: true });
  toggleFab();

  /* ---------- Simulador ---------- */
  var sim = document.getElementById('sim');
  var body = document.getElementById('simBody');
  var bar = document.getElementById('simBar');
  var phases = document.querySelectorAll('#simPhases li');
  var STEP_PHOTOS = QUESTIONS.length, STEP_FORM = STEP_PHOTOS + 1, STEP_GEN = STEP_FORM + 1, STEP_RESULT = STEP_GEN + 1;
  var state, lastFocus, genTimer;

  function reset() { state = { step: 0, answers: {}, photos: {}, lead: {} }; }
  reset();

  function open() {
    lastFocus = document.activeElement;
    sim.hidden = false;
    document.body.classList.add('is-locked');
    render();
  }
  function close() {
    clearTimeout(genTimer);
    sim.hidden = true;
    document.body.classList.remove('is-locked');
    if (state.step >= STEP_GEN) reset();
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-sim]').forEach(function (b) { b.addEventListener('click', open); });
  document.getElementById('simClose').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sim.hidden) close(); });

  function go(step) { state.step = step; render(); }

  function render() {
    var s = state.step;
    var phase = s < STEP_PHOTOS ? 0 : s === STEP_PHOTOS ? 1 : s === STEP_FORM ? 2 : 3;
    phases.forEach(function (li, i) {
      li.classList.toggle('is-active', i === phase);
      li.classList.toggle('is-done', i < phase);
    });
    bar.style.width = Math.round((Math.min(s, STEP_RESULT) / STEP_RESULT) * 100) + '%';
    clearTimeout(genTimer);

    if (s < STEP_PHOTOS) renderQuestion(s);
    else if (s === STEP_PHOTOS) renderPhotos();
    else if (s === STEP_FORM) renderForm();
    else if (s === STEP_GEN) renderGenerating();
    else renderResult();

    body.scrollTop = 0;
    var first = body.querySelector('[data-autofocus]');
    if (first) first.focus({ preventScroll: true });
  }

  function navHtml(next) {
    return '<div class="sim__nav">' +
      '<button type="button" class="link-btn" data-back>' + icon('i-back') + ' Voltar</button>' +
      (next || '') +
    '</div>';
  }
  function bindBack() {
    var b = body.querySelector('[data-back]');
    if (!b) return;
    if (state.step === 0) { b.textContent = 'Fechar'; b.addEventListener('click', close); }
    else b.addEventListener('click', function () { go(state.step - 1); });
  }

  /* Etapa 1: quiz */
  function renderQuestion(i) {
    var q = QUESTIONS[i];
    body.innerHTML = '<div class="sim__pane">' +
      '<p class="sim__kicker">Pergunta ' + (i + 1) + ' de ' + QUESTIONS.length + '</p>' +
      '<h2 class="sim__title" tabindex="-1" data-autofocus>' + q.title + '</h2>' +
      '<div class="opts">' + q.opts.map(function (o) {
        return '<button type="button" class="opt' + (state.answers[q.id] === o.v ? ' is-selected' : '') + '" data-v="' + o.v + '">' +
          '<span class="opt__icon">' + icon(o.icon) + '</span>' +
          '<span><b>' + o.label + '</b><span>' + o.desc + '</span></span>' +
        '</button>';
      }).join('') + '</div>' +
      navHtml() +
    '</div>';
    bindBack();
    body.querySelectorAll('.opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.answers[q.id] = btn.dataset.v;
        body.querySelectorAll('.opt').forEach(function (b) { b.classList.toggle('is-selected', b === btn); });
        setTimeout(function () { go(i + 1); }, 260);
      });
    });
  }

  /* Etapa 2: fotos (ficam só no navegador neste protótipo) */
  var GUIDE = {
    lado: '<svg class="drop__guide" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M78 100V86c10-6 16-17 16-30 0-21-15-36-35-36S26 34 26 52c0 5-6 11-8 15-1 2 0 4 3 4h5v9c0 5 4 8 9 8h9v12"/><path d="M58 50a9 9 0 1 1 15 7c-3 3-4 5-4 8a5 5 0 0 1-9 2" stroke="#b07a00"/><rect x="46" y="34" width="38" height="46" rx="10" stroke-dasharray="5 6" stroke="#b07a00"/></svg>',
    frente: '<svg class="drop__guide" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M34 54c0-19 11-32 26-32s26 13 26 32-11 34-26 34-26-15-26-34Z"/><path d="M34 50c-6-1-9 3-8 9s4 10 9 10M86 50c6-1 9 3 8 9s-4 10-9 10" stroke="#b07a00"/><path d="M48 88v8c0 3-6 5-14 8M72 88v8c0 3 6 5 14 8M50 54h4M66 54h4M54 72c4 2 8 2 12 0"/></svg>'
  };
  function dropHtml(key, title, text) {
    var src = state.photos[key];
    return '<label class="drop' + (src ? ' is-filled' : '') + '" data-drop="' + key + '">' +
      GUIDE[key] +
      '<b>' + title + '</b><span>' + text + '</span>' +
      '<span class="drop__cta">' + icon('i-camera') + ' Enviar foto</span>' +
      '<input type="file" accept="image/*" aria-label="Enviar foto: ' + title + '">' +
      (src ? '<img class="drop__preview" src="' + src + '" alt=""><span class="drop__done">' + icon('i-check-circle') + ' ' + title + ' · trocar</span>' : '') +
    '</label>';
  }
  function renderPhotos() {
    var ready = state.photos.lado && state.photos.frente;
    body.innerHTML = '<div class="sim__pane">' +
      '<p class="sim__kicker">Suas fotos</p>' +
      '<h2 class="sim__title" tabindex="-1" data-autofocus>Agora envie 2 fotos do seu ouvido</h2>' +
      '<p class="sim__sub">É nelas que a simulação vai posicionar o aparelho.</p>' +
      '<div class="photos">' +
        dropHtml('lado', 'Foto de lado', 'O ouvido inteiro aparecendo, com o rosto de perfil.') +
        dropHtml('frente', 'Foto de frente', 'O rosto reto para a câmera, com os dois ouvidos visíveis.') +
      '</div>' +
      '<ul class="tips">' +
        '<li>' + icon('i-check') + ' Lugar bem iluminado</li>' +
        '<li>' + icon('i-check') + ' Cabelo afastado do ouvido</li>' +
        '<li>' + icon('i-check') + ' Sem fones ou brincos grandes</li>' +
      '</ul>' +
      navHtml(
        '<span style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:flex-end">' +
          (ready ? '' : '<button type="button" class="link-btn" data-sample>Usar fotos de exemplo</button>') +
          '<button type="button" class="btn btn--lg" data-next' + (ready ? '' : ' disabled') + '>Continuar ' + icon('i-arrow') + '</button>' +
        '</span>'
      ) +
    '</div>';
    bindBack();
    body.querySelectorAll('[data-drop] input').forEach(function (input) {
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          state.photos[input.closest('[data-drop]').dataset.drop] = reader.result;
          renderPhotos();
        };
        reader.readAsDataURL(file);
      });
    });
    var sample = body.querySelector('[data-sample]');
    if (sample) sample.addEventListener('click', function () {
      state.photos.lado = state.photos.lado || SAMPLE;
      state.photos.frente = state.photos.frente || SAMPLE;
      renderPhotos();
    });
    body.querySelector('[data-next]').addEventListener('click', function () { go(STEP_FORM); });
  }

  /* Etapa 3: formulário (vai para o CRM) */
  function renderForm() {
    var l = state.lead;
    body.innerHTML = '<div class="sim__pane">' +
      '<p class="sim__kicker">Quase lá</p>' +
      '<h2 class="sim__title" tabindex="-1" data-autofocus>Para quem enviamos a simulação?</h2>' +
      '<p class="sim__sub">Sua simulação aparece na tela em seguida. Um especialista Opimed entra em contato para tirar dúvidas sobre os modelos.</p>' +
      '<form class="card form" id="leadForm" novalidate>' +
        '<div class="field field--full"><label for="f-nome">Nome</label><input id="f-nome" name="nome" type="text" autocomplete="name" placeholder="Digite seu nome" value="' + (l.nome || '') + '" required></div>' +
        '<div class="field"><label for="f-tel">WhatsApp com DDD</label><input id="f-tel" name="telefone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(00) 00000-0000" value="' + (l.telefone || '') + '" required></div>' +
        '<div class="field"><label for="f-un">Unidade Opimed mais próxima</label><select id="f-un" name="unidade" required><option value="">Selecione uma unidade</option>' +
          UNIDADES.map(function (u) { return '<option' + (l.unidade === u ? ' selected' : '') + '>' + u + '</option>'; }).join('') +
        '</select></div>' +
        '<label class="consent field--full"><input type="checkbox" name="aceite" required' + (l.aceite ? ' checked' : '') + '> <span>[VALIDAR TEXTO] Autorizo o uso das minhas fotos para gerar a simulação e o contato da Opimed sobre esta solicitação.</span></label>' +
        '<button type="submit" class="btn btn--lg btn--block field--full">' + icon('i-spark') + ' Gerar minha simulação</button>' +
        '<p class="form__privacy field--full">' + icon('i-lock') + ' Seus dados são usados pela Opimed apenas para este atendimento.</p>' +
      '</form>' +
      navHtml() +
    '</div>';
    bindBack();
    var form = document.getElementById('leadForm');
    form.telefone.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      e.target.value = out;
    });
    form.addEventListener('input', function (e) {
      e.target.classList.remove('is-invalid');
      if (e.target === form.aceite) form.aceite.parentElement.style.color = '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [form.nome, form.telefone, form.unidade].forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10);
        f.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!form.aceite.checked) ok = false;
      form.aceite.parentElement.style.color = form.aceite.checked ? '' : '#c0392b';
      if (!ok) return;
      state.lead = { nome: form.nome.value.trim(), telefone: form.telefone.value, unidade: form.unidade.value, aceite: true };
      // TODO integração: enviar lead + respostas ao CRM e fotos ao serviço de geração de imagens.
      go(STEP_GEN);
    });
  }

  /* Etapa 4: gerando */
  function renderGenerating() {
    var msgs = ['Lendo suas respostas', 'Mapeando o formato do ouvido', 'Escolhendo 2 modelos entre 15', 'Gerando as imagens'];
    body.innerHTML = '<div class="sim__pane gen" role="status" aria-live="polite">' +
      '<div class="gen__orb">' + icon('i-spark') + '</div>' +
      '<h2 class="sim__title" tabindex="-1" data-autofocus>Preparando a sua simulação</h2>' +
      '<p class="sim__sub">Leva só alguns segundos.</p>' +
      '<ul class="gen__list">' + msgs.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul>' +
    '</div>';
    var items = body.querySelectorAll('.gen__list li');
    var n = 0;
    (function tick() {
      if (n < items.length) { items[n++].classList.add('is-on'); genTimer = setTimeout(tick, 900); }
      else genTimer = setTimeout(function () { go(STEP_RESULT); }, 500);
    })();
  }

  /* Seleção dos 2 modelos (no produto final, quem decide é a IA) */
  function score(m) {
    var a = state.answers, pts = 0, why = [];
    if (a.prioridade === 'discreto') { pts += m.disc * 2; if (m.disc === 3) why.push('É um dos modelos mais discretos, como você pediu'); }
    if (a.prioridade === 'tecnologia') { pts += m.tech * 2; if (m.tech === 3) why.push('Está entre os modelos com mais tecnologia'); }
    if (a.prioridade === 'conforto' && m.forma === 'ric') { pts += 4; why.push('Formato leve para usar o dia inteiro'); }
    if (a.prioridade === 'pratico' && m.rec) { pts += 4; }
    if (a.formato === m.forma) {
      pts += 6;
      why.push({ cic: 'Fica dentro do ouvido, quase invisível', ric: 'Fica atrás da orelha, com um fio fino e discreto', bud: 'Tem o visual de um fone de ouvido moderno' }[m.forma]);
    }
    if (a.formato === 'ric' && m.forma === 'bte') pts += 2;
    if ((a.situacao === 'grupo' || a.situacao === 'ruido') && m.tech === 3) { pts += 2; why.push('Recursos para acompanhar conversas com mais gente ou barulho'); }
    if ((a.situacao === 'tv' || a.situacao === 'fone') && m.bt) { pts += 2; }
    if (a.celular === 'sim' && m.bt) { pts += 4; why.push('Conecta ao celular para ligações e música'); }
    if (a.celular === 'talvez' && m.bt) pts += 1;
    if (a.celular === 'nao' && !m.bt) pts += 1;
    if (a.bateria === 'rec' && m.rec) { pts += 4; why.push('É recarregável, sem troca de pilhas'); }
    if (a.bateria === 'pilha' && !m.rec) { pts += 4; why.push('Funciona a pilha, como você prefere'); }
    if (m.novo) pts += 0.5;
    if (!why.length) why.push('Equilibra discrição, conforto e tecnologia');
    return { m: m, pts: pts, why: why.slice(0, 3) };
  }
  function pickTwo() {
    var ranked = MODELS.map(score).sort(function (x, y) { return y.pts - x.pts; });
    var first = ranked[0];
    // o segundo é de outra marca, para a pessoa comparar opções diferentes
    var second = ranked.find(function (r) { return r.m.brand !== first.m.brand; }) || ranked[1];
    return [first, second];
  }

  /* Etapa 5: resultado */
  function renderResult() {
    var picks = pickTwo();
    var nome = (state.lead.nome || '').split(' ')[0];
    body.innerHTML = '<div class="sim__pane sim__pane--wide">' +
      '<p class="sim__kicker">Sua simulação</p>' +
      '<h2 class="sim__title" tabindex="-1" data-autofocus>' + (nome ? nome + ', estes' : 'Estes') + ' são os 2 modelos que mais combinam com você</h2>' +
      '<p class="sim__sub">Compare como cada um fica no seu ouvido, de lado e de frente.</p>' +
      '<div class="results">' + picks.map(function (p, i) {
        return '<article class="card result">' +
          '<div class="result__img">' +
            '<img src="' + SAMPLE + '" alt="Simulação do ' + p.m.name + ' no ouvido, vista de lado">' +
            '<div class="result__front">' + icon('i-image') + 'Imagem de frente gerada pela IA</div>' +
            '<span class="result__badge">Opção ' + (i + 1) + '</span>' +
            '<span class="result__demo">Imagem de exemplo</span>' +
            '<div class="seg"><button type="button" class="is-active" data-view="lado">De lado</button><button type="button" data-view="frente">De frente</button></div>' +
          '</div>' +
          '<div class="result__body">' +
            '<div class="result__head">' +
              '<div class="result__thumb"><img src="' + p.m.img + '" alt=""></div>' +
              '<div><p class="result__brand">' + p.m.brand + '</p><h3 class="result__name">' + p.m.name + '</h3><span class="tag">' + p.m.tipo + '</span></div>' +
            '</div>' +
            '<p class="result__why">Por que indicamos</p>' +
            '<ul class="result__list">' + p.why.map(function (w) { return '<li>' + icon('i-check') + w + '</li>'; }).join('') + '</ul>' +
            '<button type="button" class="btn btn--block" data-done>Quero experimentar este modelo ' + icon('i-arrow') + '</button>' +
          '</div>' +
        '</article>';
      }).join('') + '</div>' +
      '<div class="result-foot">' +
        '<p>Simulação ilustrativa. A indicação do aparelho adequado depende de avaliação com fonoaudiólogo da Opimed.</p>' +
        '<button type="button" class="btn btn--ghost" data-restart>' + icon('i-refresh') + ' Refazer simulação</button>' +
      '</div>' +
    '</div>';
    body.querySelectorAll('.seg').forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('[data-view]');
        if (!b) return;
        seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        seg.closest('.result__img').classList.toggle('is-front', b.dataset.view === 'frente');
      });
    });
    body.querySelectorAll('[data-done]').forEach(function (b) {
      // TODO integração: registrar o modelo de interesse no CRM / abrir agendamento.
      b.addEventListener('click', function () { b.innerHTML = icon('i-check') + ' Pedido registrado. A Opimed entra em contato.'; b.disabled = true; });
    });
    body.querySelector('[data-restart]').addEventListener('click', function () { var lead = state.lead; reset(); state.lead = lead; render(); });
  }
})();
