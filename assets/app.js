(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const el = (tag, attrs = {}, ...filhos) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style') n.style.cssText = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const f of filhos.flat()) if (f != null && f !== false) n.append(f);
    return n;
  };
  const guardar = (k, v) => { try { localStorage.setItem('portal-lps:' + k, v); } catch (e) {} };
  const ler = (k) => { try { return localStorage.getItem('portal-lps:' + k); } catch (e) { return null; } };
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const data = (iso) => {
    if (!iso) return '—';
    const [a, m, d] = iso.split('-');
    return `${+d} ${MESES[+m - 1]} ${a}`;
  };
  const num = (i) => '№ ' + String(i + 1).padStart(3, '0');
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

  let NICHOS = {}, TIPOS = {}, MODELOS = [];
  const filtro = { nicho: '', tipo: '', ordem: 'recentes', q: '' };
  let visiveis = [];

  // ---------- filtros na URL ----------
  function lerFiltrosDaUrl() {
    const p = new URLSearchParams(location.search);
    filtro.nicho = p.get('nicho') || '';
    filtro.tipo = p.get('tipo') || '';
    filtro.ordem = p.get('ordem') || 'recentes';
    filtro.q = p.get('q') || '';
  }
  function gravarFiltrosNaUrl() {
    const p = new URLSearchParams();
    if (filtro.nicho) p.set('nicho', filtro.nicho);
    if (filtro.tipo) p.set('tipo', filtro.tipo);
    if (filtro.ordem !== 'recentes') p.set('ordem', filtro.ordem);
    if (filtro.q) p.set('q', filtro.q);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function casaBusca(m, termos) {
    if (!termos.length) return true;
    const alvo = normal([m.nome, m.descricao, NICHOS[m.nicho], TIPOS[m.tipo], m.repo, ...(m.tags || []),
      ...m.paginas.map((p) => p.nome), m.prototipo ? 'prototipo' : ''].join(' '));
    return termos.every((t) => alvo.includes(t));
  }

  function aplicar() {
    const termos = normal(filtro.q).split(/\s+/).filter(Boolean);
    const base = MODELOS.filter((m) => casaBusca(m, termos) && (!filtro.tipo || m.tipo === filtro.tipo));
    visiveis = base.filter((m) => !filtro.nicho || m.nicho === filtro.nicho);
    const ord = {
      recentes: (a, b) => (b.atualizado || '').localeCompare(a.atualizado || '') || a.nome.localeCompare(b.nome),
      az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
      paginas: (a, b) => b.paginas.length - a.paginas.length || a.nome.localeCompare(b.nome),
    }[filtro.ordem] || (() => 0);
    visiveis.sort(ord);
    desenharNichos(base);
    desenharGrade();
    gravarFiltrosNaUrl();
  }

  // ---------- nichos ----------
  function desenharNichos(base) {
    const cont = {};
    for (const m of base) cont[m.nicho] = (cont[m.nicho] || 0) + 1;
    const chip = (valor, rotulo, n) => el('button', {
      type: 'button', class: 'chip', role: 'tab', 'aria-selected': String(filtro.nicho === valor),
      'data-vazio': String(n === 0),
      onclick: () => { filtro.nicho = valor; aplicar(); },
    }, rotulo, el('sup', {}, String(n)));
    const caixa = $('#nichos');
    caixa.replaceChildren(
      chip('', 'Todos', base.length),
      ...Object.entries(NICHOS).map(([k, r]) => chip(k, r, cont[k] || 0))
    );
  }

  // ---------- grade ----------
  function card(m, i) {
    const indice = MODELOS.indexOf(m);
    const razao = m.thumbAltura ? m.thumbAltura / 495 : 1;
    const dur = Math.min(14, Math.max(2.2, (razao - 1) * 1.7));
    const tela = el('div', { class: 'tela' },
      m.thumb
        ? el('img', { src: m.thumb, alt: '', loading: i < 6 ? 'eager' : 'lazy', decoding: 'async', width: 720, height: m.thumbAltura || 495 })
        : el('div', { class: 'sem-imagem mono' }, 'sem miniatura'));
    const fone = m.thumbMobile
      ? el('div', { class: 'fone', 'aria-hidden': 'true' }, el('img', { src: m.thumbMobile, alt: '', loading: 'lazy', decoding: 'async' }))
      : null;
    return el('a', {
      class: 'card', href: `#/${m.slug}`, style: `--i:${i};--dur:${dur.toFixed(1)}s`,
      'aria-label': `${m.nome}, ${NICHOS[m.nicho]}, ${plural(m.paginas.length, 'página', 'páginas')}`,
    },
      el('div', { class: 'quadro' }, tela, fone),
      el('div', { class: 'legenda' },
        el('p', { class: 'meta mono' },
          el('span', { class: 'num' }, num(indice)),
          el('span', {}, NICHOS[m.nicho]),
          el('span', {}, plural(m.paginas.length, 'página', 'páginas'))),
        el('h3', {}, m.nome),
        el('p', { class: 'desc' }, m.descricao),
        el('div', { class: 'etiquetas' },
          el('span', { class: 'etiqueta' }, TIPOS[m.tipo]),
          m.prototipo && el('span', { class: 'etiqueta proto' }, 'Protótipo'),
          ...(m.tags || []).map((t) => el('span', { class: 'etiqueta' }, t)))));
  }

  function desenharGrade() {
    $('#grade').replaceChildren(...visiveis.map(card));
    const vazio = !visiveis.length;
    $('#vazio').hidden = !vazio;
    $('#vazio-termo').textContent = filtro.q ? ` para “${filtro.q}”` : '';
  }

  function desenharContagem() {
    const paginas = MODELOS.reduce((s, m) => s + m.paginas.length, 0);
    const ultima = MODELOS.map((m) => m.atualizado).filter(Boolean).sort().pop();
    $('#contagem').innerHTML =
      `<b>${MODELOS.length}</b> modelos<i>/</i><b>${paginas}</b> páginas<i>/</i><b>${Object.keys(NICHOS).length}</b> nichos<i>/</i>atualizado em ${data(ultima)}`;
  }

  // ---------- visualizador ----------
  const V = {
    raiz: $('#visualizador'), palco: $('#v-palco'), aparelho: $('#v-aparelho'), frame: $('#v-frame'), info: $('#v-info'),
    modelo: null, pagina: 0, disp: ler('disp') || 'desktop', voltarFoco: null,
  };
  const DIMS = { desktop: [1440, 0], tablet: [834, 1112], celular: [390, 844] };
  const telaPequena = () => matchMedia('(max-width: 760px)').matches;

  function ajustar() {
    if (V.raiz.hidden) return;
    const disp = telaPequena() ? 'celular' : V.disp;
    const folga = disp === 'desktop' ? 20 : 44;
    const W = V.palco.clientWidth - folga * 2;
    const H = V.palco.clientHeight - folga * 2;
    let [w, h] = DIMS[disp];
    const barra = disp === 'celular' ? 34 : 0; // barra de status do celular
    let s;
    if (disp === 'desktop') {
      s = Math.min(1, W / w);
      h = H / s;
    } else {
      s = Math.min(1, W / w, H / (h + barra));
    }
    V.aparelho.dataset.disp = disp;
    V.aparelho.style.setProperty('--s', s);
    V.aparelho.style.width = `${Math.floor(w * s)}px`;
    V.aparelho.style.height = `${Math.floor((h + barra) * s)}px`;
    V.frame.style.top = `${barra * s}px`;
    V.frame.style.width = `${w}px`;
    V.frame.style.height = `${Math.ceil(h)}px`;
    V.frame.style.transform = `scale(${s})`;
    for (const b of V.raiz.querySelectorAll('[data-disp]')) {
      if (b.tagName === 'BUTTON') b.setAttribute('aria-checked', String(b.dataset.disp === V.disp));
    }
  }

  function urlPagina(m, i) {
    return `modelos/${m.slug}/${m.paginas[i].caminho}`;
  }
  function urlPublicada(m, i) {
    if (!m.urlOriginal) return null;
    return m.urlOriginal + m.paginas[i].caminho.replace(/(^|\/)index\.html$/, '$1');
  }

  function abrir(slug, pagina, disp) {
    const m = MODELOS.find((x) => x.slug === slug);
    if (!m) { fechar(); return; }
    const mudouModelo = V.modelo !== m;
    const p = Math.min(Math.max(0, pagina || 0), m.paginas.length - 1);
    if (disp && DIMS[disp]) { V.disp = disp; guardar('disp', disp); }
    if (V.raiz.hidden) {
      V.voltarFoco = document.activeElement;
      V.raiz.hidden = false;
      document.body.classList.add('travado');
      $('#v-fechar').focus({ preventScroll: true });
    }
    const mudouPagina = mudouModelo || V.pagina !== p;
    V.modelo = m;
    V.pagina = p;

    if (mudouModelo) {
      $('#v-nome').textContent = m.nome;
      $('#v-meta').textContent = `${num(MODELOS.indexOf(m))} · ${NICHOS[m.nicho]} · ${TIPOS[m.tipo]}${m.prototipo ? ' · protótipo' : ''}`;
      $('#v-desc').textContent = m.descricao;
      const dados = [
        ['Nicho', NICHOS[m.nicho]],
        ['Tipo', TIPOS[m.tipo]],
        ['Páginas', String(m.paginas.length)],
        ['Atualizado', data(m.atualizado)],
        ['Peso', m.tamanhoMB != null ? `${m.tamanhoMB.toLocaleString('pt-BR')} MB` : '—'],
        ['Conta', m.repo.split('/')[0]],
      ];
      $('#v-dados').replaceChildren(...dados.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, v)]));
      $('#v-clone').textContent = `gh repo clone ${m.repo}`;
    }
    $('#v-paginas').replaceChildren(...m.paginas.map((pg, i) => el('button', {
      type: 'button', role: 'tab', 'aria-selected': String(i === p),
      onclick: () => irPara(m.slug, i),
    }, pg.nome)));
    $('#v-paginas').hidden = m.paginas.length < 2;
    $('#v-lista').replaceChildren(...m.paginas.map((pg, i) => el('li', {}, el('button', {
      type: 'button', 'aria-current': String(i === p), onclick: () => irPara(m.slug, i),
    }, pg.nome))));
    const links = [el('a', { href: `https://github.com/${m.repo}`, target: '_blank', rel: 'noopener' }, 'Repositório no GitHub')];
    const pub = urlPublicada(m, p);
    if (pub) links.push(el('a', { href: pub, target: '_blank', rel: 'noopener' }, 'Página publicada'));
    $('#v-links').replaceChildren(...links);
    $('#v-abrir').href = urlPagina(m, p);

    const lista = posicaoNaLista();
    $('#v-pos').textContent = `${String(lista.indexOf(m) + 1).padStart(2, '0')}/${String(lista.length).padStart(2, '0')}`;

    if (mudouPagina) {
      V.palco.classList.add('carregando');
      V.frame.src = urlPagina(m, p);
      const sel = $('#v-paginas [aria-selected="true"]');
      if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    document.title = `${m.nome} · Biblioteca de LPs · 3ADS`;
    ajustar();
  }

  function fechar() {
    if (V.raiz.hidden) return;
    V.raiz.hidden = true;
    V.modelo = null;
    V.frame.src = 'about:blank';
    document.body.classList.remove('travado');
    document.title = 'Biblioteca de LPs · 3ADS';
    if (V.voltarFoco && document.contains(V.voltarFoco)) V.voltarFoco.focus({ preventScroll: true });
  }

  // Anterior/próximo seguem a lista filtrada; se o modelo não está nela, usam o acervo todo.
  function posicaoNaLista() {
    return visiveis.includes(V.modelo) ? visiveis : MODELOS;
  }
  function vizinho(passo) {
    if (!V.modelo) return;
    const lista = posicaoNaLista();
    const i = (lista.indexOf(V.modelo) + passo + lista.length) % lista.length;
    irPara(lista[i].slug, 0);
  }

  // Atualiza o estado na hora (teclas rápidas não podem esperar o hashchange) e só depois a URL.
  function irPara(slug, pagina = 0, disp = V.disp) {
    const h = `#/${slug}` + (pagina ? `/${pagina + 1}` : '') + (disp !== 'desktop' ? `?d=${disp}` : '');
    const outroModelo = !V.modelo || V.modelo.slug !== slug;
    if (location.hash !== h) history[outroModelo ? 'pushState' : 'replaceState'](null, '', h);
    abrir(slug, pagina, disp);
  }

  function lerHash() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (!h) { fechar(); return; }
    const [caminho, qs] = h.split('?');
    const [slug, pg] = caminho.split('/');
    const disp = new URLSearchParams(qs || '').get('d') || 'desktop';
    abrir(slug, pg ? +pg - 1 : 0, disp);
  }

  function mostrarInfo(sim) {
    V.info.hidden = !sim;
    $('#v-info-btn').setAttribute('aria-expanded', String(sim));
    guardar('info', sim ? '1' : '0');
    requestAnimationFrame(ajustar);
  }

  function avisar(msg) {
    const a = $('#aviso');
    a.textContent = msg;
    a.hidden = false;
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => { a.hidden = true; }, 1800);
  }

  // ---------- eventos ----------
  function ligar() {
    const busca = $('#busca');
    busca.value = filtro.q;
    let t;
    busca.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { filtro.q = busca.value.trim(); aplicar(); }, 120);
    });
    const tipo = $('#tipo');
    tipo.append(...Object.entries(TIPOS).map(([k, r]) => el('option', { value: k }, r)));
    tipo.value = filtro.tipo;
    tipo.addEventListener('change', () => { filtro.tipo = tipo.value; aplicar(); });
    const ordem = $('#ordem');
    ordem.value = filtro.ordem;
    ordem.addEventListener('change', () => { filtro.ordem = ordem.value; aplicar(); });
    $('#limpar').addEventListener('click', () => {
      Object.assign(filtro, { nicho: '', tipo: '', q: '' });
      busca.value = '';
      tipo.value = '';
      aplicar();
    });

    $('#v-fechar').addEventListener('click', () => { history.pushState(null, '', location.pathname + location.search); fechar(); });
    $('#v-ant').addEventListener('click', () => vizinho(-1));
    $('#v-prox').addEventListener('click', () => vizinho(1));
    $('#v-info-btn').addEventListener('click', () => mostrarInfo(V.info.hidden));
    for (const b of V.raiz.querySelectorAll('button[data-disp]')) {
      b.addEventListener('click', () => V.modelo && irPara(V.modelo.slug, V.pagina, b.dataset.disp));
    }
    $('#v-copiar-clone').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#v-clone').textContent); avisar('Comando copiado'); }
      catch (e) { avisar('Não foi possível copiar'); }
    });
    V.frame.addEventListener('load', () => V.palco.classList.remove('carregando'));

    window.addEventListener('hashchange', lerHash);
    window.addEventListener('popstate', lerHash);
    window.addEventListener('resize', () => requestAnimationFrame(ajustar));
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const digitando = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if (!V.raiz.hidden) {
        if (e.key === 'Escape') { e.preventDefault(); $('#v-fechar').click(); }
        else if (digitando) return;
        else if (e.key === 'ArrowLeft') vizinho(-1);
        else if (e.key === 'ArrowRight') vizinho(1);
        else if (e.key === '1') irPara(V.modelo.slug, V.pagina, 'desktop');
        else if (e.key === '2') irPara(V.modelo.slug, V.pagina, 'tablet');
        else if (e.key === '3') irPara(V.modelo.slug, V.pagina, 'celular');
        else if (e.key === 'i') mostrarInfo(V.info.hidden);
        return;
      }
      if (e.key === '/' && !digitando) { e.preventDefault(); busca.focus(); busca.select(); }
      if (e.key === 'Escape' && document.activeElement === busca && busca.value) {
        busca.value = '';
        filtro.q = '';
        aplicar();
      }
    });
    // Mantém o foco dentro do visualizador.
    V.raiz.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focaveis = [...V.raiz.querySelectorAll('button:not([hidden]), a[href], iframe')]
        .filter((n) => n.offsetParent !== null);
      const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    });
  }

  async function iniciar() {
    lerFiltrosDaUrl();
    const r = await fetch('data/modelos.json', { cache: 'no-cache' });
    const dados = await r.json();
    NICHOS = dados.nichos;
    TIPOS = dados.tipos;
    MODELOS = dados.modelos;
    desenharContagem();
    ligar();
    mostrarInfo(ler('info') !== '0' && !matchMedia('(max-width: 1100px)').matches);
    aplicar();
    lerHash();
  }

  iniciar().catch((e) => {
    console.error(e);
    $('#grade').replaceChildren(el('p', { class: 'vazio' }, 'Não foi possível carregar o catálogo.'));
  });
})();
