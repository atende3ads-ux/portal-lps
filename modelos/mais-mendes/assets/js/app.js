/* Mais Mendes — protótipo do e-commerce.
   Cabeçalho, rodapé e "Meu orçamento" são compartilhados pelas três páginas.
   Frete, prazos e a maior parte dos preços são ILUSTRATIVOS (ver PLANO-ECOMMERCE.md). */
(function () {
  'use strict';

  const { categorias: CATS, produtos: PRODS } = window.MM_DATA;
  const IMG = 'assets/img/';
  const LOGO = IMG + 'logo-mais-mendes.png';
  const LOGO_CLARO = IMG + 'logo-mais-mendes-branco.png';
  const FONE = '4003-1960';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const params = new URLSearchParams(location.search);
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

  /* ---------- Ícones (traço, conforme o manual) ---------- */
  const ICONES = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    droplet: '<path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2v.2h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    faucet: '<path d="M3 10h10a4 4 0 0 1 4 4v1M15 15h4v3h-4zM8 10V6M5.5 6h5M17 21v.5"/>',
    layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5L12 3zM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
    bag: '<path d="M7 4h10l2 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8l2-4zM5 8h14M9 13h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
    building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M3 21h18M8 8h3M8 12h3M8 16h3"/>',
    pin: '<path d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    store: '<path d="M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M9 20v-6h6v6"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M19.5 19a4 4 0 0 1-4 3H13"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7M9.5 9l1.8 1.8L14.8 7"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>',
    whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
    facebook: '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.8 1.9-1.8h1.7V2.7c-.4-.1-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.5H7.5V13h3.1v8"/>',
  };
  const PREENCHIDOS = ['whatsapp'];
  const ico = (nome, tam = 24, classe = '') =>
    `<svg class="ico ${PREENCHIDOS.includes(nome) ? 'ico-cheio ' : ''}${classe}" width="${tam}" height="${tam}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ''}</svg>`;

  /* ---------- Catálogo ---------- */
  const produto = (slug) => PRODS.find((p) => p.slug === slug);
  const urlProd = (p) => `produto.html?p=${p.slug}`;
  const urlCat = (c, sub) => `categoria.html?c=${c.slug}${sub ? '&s=' + encodeURIComponent(sub) : ''}`;
  const temEscolha = (p) => p.opcoes.some((o) => o.valores.length > 1);
  const opcoesPadrao = (p) => Object.fromEntries(p.opcoes.map((o) => [o.nome, o.valores[0]]));
  const precoAtual = (p, opts) => {
    if (p.precoVar && opts) {
      const v = Object.values(opts).find((x) => x in p.precoVar);
      if (v) return p.precoVar[v];
    }
    return p.preco;
  };
  const precoMin = (p) => (p.precoVar ? Math.min(...Object.values(p.precoVar)) : p.preco);
  const centavos = (v) => Math.round(v * 100) / 100;
  // Desconto no Pix: na Nuvemshop é um percentual único por meio de pagamento, para a loja toda. 5% é exemplo.
  const DESCONTO_PIX = 0.05;
  const PARCELAS_MAX = 10, PARCELA_MIN = 20;
  const noPix = (v) => centavos(v * (1 - DESCONTO_PIX));

  /* ---------- Preço por perfil ----------
     O preço de vitrine é o do cliente CPF. CNPJ e CREA-GO são tabelas de preço da Nuvemshop ("Varejo e Atacado"):
     o cliente se cadastra pelo link da tabela, a equipe aprova e o preço aparece depois do login.
     CREA-GO: regra publicada na LP do cliente (5% de desconto + 3% de cashback, fiação fora).
     CNPJ: 10% é exemplo. Duas tabelas pedem o plano Escala (ver PLANO-ECOMMERCE.md, item 15). */
  const PERFIS = {
    cnpj: { nome: 'Empresa (CNPJ)', curto: 'CNPJ', desconto: 0.10, cashback: 0, fora: [],
      resumo: 'Tabela de atacado: 10% de desconto (exemplo)' },
    crea: { nome: 'Profissional CREA-GO', curto: 'CREA-GO', desconto: 0.05, cashback: 0.03, fora: ['Cabo Elétrico'],
      resumo: '5% de desconto + 3% de cashback · fiação elétrica fora' },
  };
  const tabela = () => PERFIS[perfil] || null;
  const pct = (v) => `${Math.round(v * 100)}%`;
  const comTabela = (p) => !!tabela() && !tabela().fora.includes(p.sub);
  const foraDaTabela = (p) => !!tabela() && tabela().fora.includes(p.sub);
  const precoCliente = (p, opts) => (comTabela(p) ? centavos(precoAtual(p, opts) * (1 - tabela().desconto)) : precoAtual(p, opts));
  const precoMinCliente = (p) => (comTabela(p) ? centavos(precoMin(p) * (1 - tabela().desconto)) : precoMin(p));
  const parcelas = (v) => {
    const n = Math.min(PARCELAS_MAX, Math.floor(v / PARCELA_MIN));
    return n >= 2 ? `ou ${n}x de ${brl(v / n)} sem juros no cartão` : 'ou à vista no cartão';
  };
  const foto = (p, adiar = true) => `<img src="${IMG}produtos/${p.img}" alt="" width="800" height="800"${adiar ? ' loading="lazy"' : ''}>`;
  const desconto = (p) => (p.precoDe ? Math.round((1 - p.preco / p.precoDe) * 100) : 0);
  const tagDesconto = (p) => (desconto(p) ? `<span class="tag tag-desc"><span>-${desconto(p)}%</span></span>` : '');

  /* ---------- Estado (fica no navegador de quem está testando) ---------- */
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch (e) { return padrao; } };
  let orc = ler('mm_orcamento', []).filter((i) => produto(i.slug));
  let cep = ler('mm_cep', '');
  let freteId = ler('mm_frete', '');
  let perfil = ler('mm_perfil', ''); // '' = visitante ou cliente CPF; 'cnpj' e 'crea' simulam o login aprovado
  if (!PERFIS[perfil]) perfil = '';

  const chave = (slug, opts) => slug + '|' + Object.values(opts).join('|');
  const qtdTotal = () => orc.reduce((s, i) => s + i.qtd, 0);
  const somar = (fn) => centavos(orc.reduce((s, i) => s + i.qtd * fn(produto(i.slug), i.opts), 0));
  const subtotalVitrine = () => somar(precoAtual);
  const subtotal = () => somar(precoCliente);
  // cashback do CREA-GO: 3% sobre os itens do benefício (fiação fora), para usar na próxima compra
  const cashback = () => (tabela() && tabela().cashback ? centavos(somar((p, o) => (comTabela(p) ? precoCliente(p, o) : 0)) * tabela().cashback) : 0);

  function adicionar(slug, opts, qtd = 1) {
    const k = chave(slug, opts);
    const item = orc.find((i) => i.chave === k);
    if (item) item.qtd += qtd; else orc.push({ chave: k, slug, opts, qtd });
    mudou(true);
  }
  function definirQtd(k, qtd) {
    const item = orc.find((i) => i.chave === k);
    if (!item) return;
    if (qtd <= 0) orc = orc.filter((i) => i.chave !== k); else item.qtd = Math.min(qtd, 9999);
    mudou();
  }
  function mudou(pulsar) {
    guardar('mm_orcamento', orc);
    atualizar();
    if (pulsar) {
      const b = $('#barra');
      b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
    }
  }

  /* ---------- Frete (simulação da Política de Frete do cliente, 13/10/2026) ----------
     Grande Goiânia, frota própria, em até 24h após a aprovação do pagamento: grátis a partir de R$ 200 (CPF e CREA-GO)
     ou R$ 1.000 (CNPJ, com taxa fixa entre R$ 200 e R$ 999,99). Abaixo de R$ 200, só retirada na loja, que é grátis
     para todos. Fora da região: transportadora (Nuvem Envio, valores de exemplo); argamassas e barras de tubo,
     só frete a combinar. Faixas de CEP, cidades atendidas e a taxa de R$ 25 ainda dependem do cliente. */
  const cepMascara = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
  const MINIMO_ENTREGA = 200, TAXA_CNPJ = 25;
  const limiteGratis = () => (perfil === 'cnpj' ? 1000 : 200);
  const grandeGoiania = (c) => { // Goiânia e Aparecida (74), Senador Canedo e Trindade
    const n = Number(c.slice(0, 5));
    return (n >= 74000 && n <= 74999) || (n >= 75250 && n <= 75264) || (n >= 75380 && n <= 75394);
  };
  const pesado = (p) => p.sub === 'Tubos' || p.cat === 'Argamassas';
  const RETIRADA = { id: 'retirada', nome: 'Retirar na loja · Setor Capuava', preco: 0, prazo: 'Avisamos quando o pedido estiver separado' };

  // valor: produtos do orçamento, sem o frete. Na página do produto (valor nulo) a regra aparece por extenso.
  function fretes(c, valor, itens) {
    if (grandeGoiania(c)) {
      const lim = limiteGratis();
      const entrega = { id: 'entrega', nome: 'Entrega Mais Mendes', prazo: 'Em até 24h após a aprovação do pagamento' };
      const regiao = 'Goiânia e região';
      if (valor == null) {
        return { regiao, opcoes: [{ ...entrega, rotulo: `Grátis acima de ${brl(lim)}` }, RETIRADA],
          nota: perfil === 'cnpj'
            ? `Entrega a partir de ${brl(MINIMO_ENTREGA)} em produtos: taxa fixa de ${brl(TAXA_CNPJ)} até ${brl(lim)}. Abaixo disso, retirada na loja.`
            : `Para compras abaixo de ${brl(MINIMO_ENTREGA)}, retirada na loja.` };
      }
      if (valor >= lim) return { regiao, opcoes: [{ ...entrega, preco: 0 }, RETIRADA] };
      if (valor >= MINIMO_ENTREGA) return { regiao, opcoes: [{ ...entrega, preco: TAXA_CNPJ }, RETIRADA] };
      return { regiao, opcoes: [RETIRADA],
        nota: `A entrega começa em ${brl(MINIMO_ENTREGA)} em produtos. Até lá, a retirada na loja é grátis.` };
    }
    const uf = Number(c.slice(0, 2));
    const goias = uf >= 72 && uf <= 76;
    const regiao = goias ? 'Goiás e Distrito Federal' : 'Demais estados';
    const pesados = (itens || []).filter(pesado);
    if (pesados.length) {
      return { regiao, opcoes: [{ id: 'combinar', nome: 'Frete a combinar', preco: null, rotulo: 'A combinar', prazo: 'Nosso time cota o frete pelo WhatsApp' }, RETIRADA],
        nota: `Argamassas e barras de tubo são entregues só em Goiânia e região. Para a sua cidade, cotamos o frete de: ${pesados.map((p) => p.nome).join('; ')}.` };
    }
    const transp = goias
      ? { id: 'transp', nome: 'Transportadora', preco: 49.9, prazo: 'Postagem em até 2 dias úteis + 2 a 4 dias úteis' }
      : { id: 'transp', nome: 'Transportadora', preco: 89.9, prazo: 'Postagem em até 2 dias úteis + 5 a 9 dias úteis' };
    return { regiao, opcoes: [transp, RETIRADA] };
  }
  const itensOrc = () => orc.map((i) => produto(i.slug));
  const freteEscolhido = () => {
    if (!cep || !orc.length) return null;
    const { opcoes } = fretes(cep, subtotal(), itensOrc());
    return opcoes.find((o) => o.id === freteId) || opcoes[0];
  };
  const precoFrete = (o) => o.rotulo || (o.preco ? brl(o.preco) : 'Grátis');
  const valorFrete = (f) => (f && f.preco ? f.preco : 0);

  function blocoCep(contexto, prod) {
    const editavel = contexto === 'orc';
    if (!cep) {
      return `<form class="cep" data-cep novalidate>
          <label class="sr-only" for="cep-${contexto}">Seu CEP</label>
          <input id="cep-${contexto}" name="cep" inputmode="numeric" autocomplete="postal-code" placeholder="Digite seu CEP" maxlength="9">
          <button class="btn btn-escuro btn-p">Calcular</button>
        </form>
        <p class="cep-erro" hidden>Digite um CEP com 8 números.</p>`;
    }
    const { regiao, opcoes, nota } = editavel ? fretes(cep, subtotal(), itensOrc()) : fretes(cep, null, prod ? [prod] : []);
    const sel = freteEscolhido();
    const linhas = opcoes.map((o) => `
      <label class="frete">
        ${editavel ? `<input type="radio" name="frete" value="${o.id}" ${sel && o.id === sel.id ? 'checked' : ''}>` : ''}
        <span><strong>${o.nome}</strong><small>${ico('clock', 14)} ${o.prazo}</small></span>
        <b class="${o.preco === 0 ? 'gratis' : ''}">${precoFrete(o)}</b>
      </label>`).join('');
    return `<p class="cep-regiao">Entrega para <strong>${cepMascara(cep)}</strong> · ${regiao}
        <button class="link-seta" data-acao="trocar-cep" style="margin-left:8px;font-size:13px">Trocar</button></p>
      <div class="fretes ${editavel ? '' : 'fretes-ler'}">${linhas}</div>
      ${nota ? `<p class="frete-nota">${nota}</p>` : ''}`;
  }

  // Barra "faltam R$ X para o frete grátis" (só faz sentido na Grande Goiânia ou antes de informar o CEP)
  function barraFreteGratis() {
    if (cep && !grandeGoiania(cep)) return '';
    const lim = limiteGratis(), sub = subtotal();
    if (sub >= lim) return `<div class="frete-gratis ok">${ico('check', 18)}<p><strong>Entrega grátis</strong> em Goiânia e região garantida.</p></div>`;
    return `<div class="frete-gratis">
        <p>Faltam <strong>${brl(lim - sub)}</strong> para a <strong>entrega grátis</strong> em Goiânia e região</p>
        <div class="frete-progresso" role="progressbar" aria-label="Caminho até o frete grátis" aria-valuemin="0" aria-valuemax="${lim}" aria-valuenow="${Math.round(sub)}"><span style="width:${Math.min(100, (sub / lim) * 100).toFixed(1)}%"></span></div>
      </div>`;
  }

  /* ---------- Componentes ---------- */
  function card(p) {
    const meu = precoMinCliente(p);
    const preco = (temEscolha(p) && p.precoVar ? '<small>a partir de</small> ' : '') + brl(meu);
    const de = comTabela(p) ? precoMin(p) : p.precoDe;
    return `<article class="card">
      <a class="card-img" href="${urlProd(p)}" tabindex="-1" aria-hidden="true">${foto(p)}${tagDesconto(p)}</a>
      <div class="card-corpo">
        <span class="card-marca">${esc(p.marca)}</span>
        <a class="card-nome" href="${urlProd(p)}">${esc(p.nome)}</a>
        <div class="card-de">${de ? `<span class="sr-only">De </span><s>${brl(de)}</s>` : ''}${comTabela(p) ? ` <span class="selo-tabela">Preço ${tabela().curto}</span>` : ''}</div>
        <div class="card-preco">${preco}</div>
        <div class="card-pix"><strong>${brl(noPix(meu))}</strong> no Pix</div>
        <div class="card-acao" data-card="${p.slug}">${cardAcao(p)}</div>
      </div>
    </article>`;
  }
  function cardAcao(p) {
    if (temEscolha(p)) return `<a class="btn btn-primario btn-p" href="${urlProd(p)}">Escolher opção</a>`;
    const item = orc.find((i) => i.slug === p.slug);
    if (!item) return `<button class="btn btn-primario btn-p" data-acao="add" data-slug="${p.slug}">Adicionar</button>`;
    return seletor(item, 'qtd-bloco qtd-p');
  }
  function seletor(item, classe = '') {
    const nome = esc(produto(item.slug).nome);
    return `<div class="qtd ${classe}" role="group" aria-label="Quantidade de ${nome}">
      <button data-acao="menos" data-chave="${esc(item.chave)}" aria-label="Diminuir">${ico(item.qtd === 1 ? 'trash' : 'minus', 18)}</button>
      <output>${item.qtd}</output>
      <button data-acao="mais" data-chave="${esc(item.chave)}" aria-label="Aumentar">${ico('plus', 18)}</button>
    </div>`;
  }

  function cabecalho() {
    const cats = CATS.map((c) => `<li><a href="${urlCat(c)}" ${params.get('c') === c.slug ? 'aria-current="page"' : ''}>${c.curto}</a></li>`).join('');
    const mega = CATS.map((c) => `<div>
        <h3>${ico(c.icone, 20)}<a href="${urlCat(c)}">${c.nome}</a></h3>
        <ul>${c.subs.map((s) => `<li><a href="${urlCat(c, s)}">${s}</a></li>`).join('')}</ul>
      </div>`).join('');
    return `
    <div class="aviso" id="aviso"><div class="container">
      <span><strong>Protótipo de navegação.</strong> Preços, frete e prazos são ilustrativos. <a href="sitemap.html">Ver mapa da loja</a></span>
      <button data-acao="fechar-aviso">Entendi</button>
    </div></div>
    <div class="topo"><div class="container">
      <ul>
        <li><a href="#">Clube Mais Mendes</a></li>
        <li><a href="#" data-acao="cadastro" data-tipo="cnpj">Venda para empresas (CNPJ)</a></li>
        <li><a href="#" data-acao="cadastro" data-tipo="crea">Profissionais CREA-GO</a></li>
        <li><a href="#">Nossa história</a></li>
      </ul>
      <ul>
        <li><a href="tel:${FONE.replace(/\D/g, '')}">${ico('phone', 16)} ${FONE}</a></li>
        <li><a href="#" aria-label="Instagram">${ico('instagram', 18)}</a></li>
        <li><a href="#" aria-label="Facebook">${ico('facebook', 18)}</a></li>
      </ul>
    </div></div>
    <header class="cab">
      <div class="container cab-principal">
        <button class="btn-menu" data-acao="abrir-menu" aria-label="Abrir menu de categorias">${ico('menu', 26)}</button>
        <a class="logo" href="index.html"><img src="${LOGO}" alt="Mais Mendes Distribuidora" data-logo></a>
        <form class="busca" action="categoria.html" role="search">
          <label class="sr-only" for="q">Buscar produto</label>
          <input id="q" name="q" type="search" placeholder="O que você procura? Ex.: cabo 2,5 mm" value="${esc(params.get('q') || '')}">
          <button aria-label="Buscar">${ico('search', 20)}</button>
        </form>
        <div class="cab-acoes">
          <button class="cab-acao cab-conta" data-acao="conta">${ico('user')}<span>${tabela()
            ? `<small class="cab-perfil">Preço ${tabela().curto} ativo</small><strong>Minha conta</strong>`
            : '<small>Entre ou cadastre-se</small><strong>Minha conta</strong>'}</span></button>
          <button class="cab-acao cab-orc" data-acao="abrir-orc" aria-label="Abrir meu orçamento">
            <span class="ico-wrap">${ico('cart')}<span class="contador" data-contador hidden>0</span></span>
            <span class="txt"><small>Meu orçamento</small><strong data-total>R$ 0,00</strong></span>
          </button>
        </div>
      </div>
      <nav class="nav" aria-label="Categorias"><div class="container">
        <ul class="nav-lista">
          <li class="mega-wrap">
            <button class="nav-todas" data-acao="mega" aria-expanded="false">${ico('menu', 18)} Todas as categorias ${ico('down', 16)}</button>
            <div class="mega">${mega}</div>
          </li>
          ${cats}
        </ul>
        <div class="nav-apoio"><a href="#">Ajuda</a><a href="#">Nossa loja</a><a href="#">Fale conosco</a></div>
      </div></nav>
    </header>
    <div class="info"><div class="container"><ul>
      <li>${ico('truck', 20)} Entrega em até 24h em Goiânia e região</li>
      <li>${ico('check', 20)} Frete grátis acima de R$ 200 na Grande Goiânia</li>
      <li>${ico('pin', 20)} Enviamos para todo o Brasil</li>
      <li>${ico('building', 20)} Preço especial para CNPJ e CREA-GO</li>
    </ul></div></div>`;
  }

  function rodape() {
    return `<div class="container">
      <div class="rodape-grade">
        <div>
          <a class="logo" href="index.html"><img src="${LOGO_CLARO}" alt="Mais Mendes Distribuidora" data-logo></a>
          <p>Materiais elétricos, hidráulicos, iluminação e ferramentas com qualidade e preço justo. De quem entende de obra, para quem constrói.</p>
          <div class="redes">
            <a href="#" aria-label="Instagram">${ico('instagram', 20)}</a>
            <a href="#" aria-label="Facebook">${ico('facebook', 20)}</a>
          </div>
        </div>
        <div><h3>Categorias</h3><ul>${CATS.map((c) => `<li><a href="${urlCat(c)}">${c.nome}</a></li>`).join('')}</ul></div>
        <div><h3>Ajuda</h3><ul>
          <li><a href="#">Como comprar</a></li>
          <li><a href="#">Frete e prazo de entrega</a></li>
          <li><a href="#">Trocas e devoluções</a></li>
          <li><a href="#">Dúvidas frequentes</a></li>
          <li><a href="#">Política de privacidade</a></li>
          <li><a href="#">Nossa história</a></li>
          <li><a href="#">Clube Mais Mendes</a></li>
          <li><a href="#" data-acao="cadastro" data-tipo="cnpj">Venda para empresas (CNPJ)</a></li>
          <li><a href="#" data-acao="cadastro" data-tipo="crea">Profissionais CREA-GO</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Trabalhe conosco</a></li>
        </ul></div>
        <div><h3>Atendimento</h3><ul class="rodape-contato">
          <li>${ico('phone', 18)}<span>${FONE}</span></li>
          <li>${ico('mail', 18)}<span>comercial@maismendesdistribuidora.com.br</span></li>
          <li>${ico('pin', 18)}<span>Rua Antônio Carlos, Qd. 82 · Setor Capuava<br>Goiânia/GO · CEP 74450-360</span></li>
        </ul></div>
      </div>
      <div class="rodape-base">
        <div class="pagamentos">Pagamento: <span>Pix</span><span>Cartão</span><span>Boleto</span></div>
        <div class="rodape-razao">© 2026 Mais Mendes Distribuidora · CNPJ 33.859.997/0001-99</div>
        <div class="rodape-credito">Desenvolvido por <a href="https://3ads.com.br/" target="_blank" rel="noopener">3ADS</a></div>
      </div>
    </div>`;
  }

  function sobreposicoes() {
    return `
    <div class="fundo" id="fundo" data-acao="fechar"></div>
    <aside class="gaveta" id="gaveta-orc" role="dialog" aria-modal="true" aria-labelledby="orc-titulo" hidden>
      <div class="gaveta-cab"><h2 id="orc-titulo">Meu orçamento</h2><button data-acao="fechar" aria-label="Fechar">${ico('x')}</button></div>
      <div class="gaveta-corpo" id="orc-corpo"></div>
      <div class="gaveta-pe" id="orc-pe"></div>
    </aside>
    <aside class="gaveta" id="gaveta-conta" role="dialog" aria-modal="true" aria-labelledby="conta-titulo" hidden>
      <div class="gaveta-cab"><h2 id="conta-titulo">Minha conta</h2><button data-acao="fechar" aria-label="Fechar">${ico('x')}</button></div>
      <div class="gaveta-corpo" id="conta-corpo"></div>
    </aside>
    <aside class="gaveta gaveta-esq" id="gaveta-menu" role="dialog" aria-modal="true" aria-label="Categorias" hidden>
      <div class="gaveta-cab"><h2>Categorias</h2><button data-acao="fechar" aria-label="Fechar">${ico('x')}</button></div>
      <div class="gaveta-corpo">
        ${CATS.map((c) => `<div class="menu-cat"><a href="${urlCat(c)}">${ico(c.icone, 22)} ${c.nome}</a></div>`).join('')}
        <div class="menu-apoio"><a href="#" data-acao="conta">Minha conta</a><a href="#" data-acao="cadastro" data-tipo="cnpj">Venda para empresas (CNPJ)</a><a href="#" data-acao="cadastro" data-tipo="crea">Profissionais CREA-GO</a><a href="#">Ajuda</a><a href="#">Nossa loja</a><a href="#">Clube Mais Mendes</a></div>
      </div>
    </aside>
    <div class="barra" id="barra" role="status">
      <div><small data-barra-itens></small><strong data-total></strong></div>
      <button class="btn btn-primario btn-p" data-acao="abrir-orc">Ver orçamento</button>
    </div>
    <a class="zap" href="#" data-acao="zap" aria-label="Falar com a Mais Mendes no WhatsApp">${ico('whatsapp', 30)}</a>
    <div class="aviso-flutuante" id="toast" role="status" aria-live="polite"></div>`;
  }

  /* ---------- Meu orçamento ---------- */
  function desenharOrcamento() {
    const corpo = $('#orc-corpo'), pe = $('#orc-pe');
    if (!orc.length) {
      corpo.innerHTML = `<div class="orc-vazio">${ico('cart', 56)}
        <strong>Seu orçamento está vazio</strong>
        <p>Adicione produtos e veja aqui o total, o frete e o prazo de entrega.</p>
        <a class="btn btn-primario" href="categoria.html">Ver produtos</a></div>`;
      pe.innerHTML = '';
      pe.hidden = true;
      return;
    }
    pe.hidden = false;
    corpo.innerHTML = barraFreteGratis() + orc.map((i) => {
      const p = produto(i.slug);
      const variacao = Object.entries(i.opts).map(([n, v]) => `${n}: ${v}`).join(' · ');
      return `<div class="item">
        <a class="item-img" href="${urlProd(p)}" tabindex="-1" aria-hidden="true">${foto(p)}</a>
        <div>
          <a class="item-nome" href="${urlProd(p)}">${esc(p.nome)}</a>
          ${variacao ? `<div class="item-var">${esc(variacao)}</div>` : ''}
          ${foraDaTabela(p) ? `<div class="item-var">Fora do benefício ${tabela().curto}</div>` : ''}
          <div class="item-linha">${seletor(i, 'qtd-p')}<strong>${brl(i.qtd * precoCliente(p, i.opts))}</strong></div>
        </div>
      </div>`;
    }).join('') + `<div class="caixa"><h2>${ico('truck', 20)} Frete e prazo de entrega</h2>${blocoCep('orc')}</div>`;

    const f = freteEscolhido();
    const sub = subtotal(), vitrine = subtotalVitrine(), t = tabela(), cb = cashback();
    pe.innerHTML = `<div class="resumo">
        <div><span>Subtotal (${plural(qtdTotal(), 'item', 'itens')})</span><span>${brl(vitrine)}</span></div>
        ${t && vitrine > sub ? `<div class="desconto"><span>Desconto ${t.curto} (${pct(t.desconto)})</span><span>−${brl(vitrine - sub)}</span></div>` : ''}
        <div><span>Frete</span><span>${f ? precoFrete(f) : 'Informe o CEP'}</span></div>
        ${f ? `<div class="prazo"><span>${f.nome}</span><span>${f.prazo}</span></div>` : ''}
        <div class="total"><span>Total</span><span>${brl(sub + valorFrete(f))}</span></div>
        <div class="pix"><span>No Pix (${pct(DESCONTO_PIX)} de desconto)</span><span>${brl(noPix(sub) + valorFrete(f))}</span></div>
        ${cb ? `<div class="cashback"><span>Cashback CREA-GO (${pct(t.cashback)}) para a próxima compra</span><span>${brl(cb)}</span></div>` : ''}
      </div>
      ${t ? '' : `<p class="resumo-perfil">Tem CNPJ ou registro no CREA-GO? <a href="#" data-acao="conta">Entre e veja o seu preço</a></p>`}
      <button class="btn btn-primario btn-bloco" data-acao="finalizar">Finalizar compra</button>
      <button class="btn btn-linha btn-bloco" data-acao="enviar-zap">${ico('whatsapp', 20)} Enviar orçamento pelo WhatsApp</button>`;
  }

  function textoOrcamento() {
    const f = freteEscolhido();
    const t = tabela();
    const linhas = orc.map((i) => {
      const p = produto(i.slug);
      const v = Object.values(i.opts).join(', ');
      return `• ${i.qtd}x ${p.nome}${v ? ` (${v})` : ''} — ${brl(i.qtd * precoCliente(p, i.opts))}`;
    });
    return ['Olá! Quero fechar este orçamento:', ...(t ? [`(Cliente ${t.nome})`] : []), '', ...linhas, '', `Subtotal: ${brl(subtotal())}`,
      f ? `Frete (${cepMascara(cep)}): ${precoFrete(f)} — ${f.nome}, ${f.prazo.toLowerCase()}` : 'Frete: a calcular',
      `Total: ${brl(subtotal() + valorFrete(f))}`,
      `No Pix: ${brl(noPix(subtotal()) + valorFrete(f))}`].join('\n');
  }

  /* ---------- Minha conta e cadastro profissional (simulação) ----------
     No site real: login e cadastro padrão da Nuvemshop, e um link de autocadastro por tabela de preço, com
     aprovação manual (a equipe confere o CNPJ ou o registro no CREA-GO). Nada do que se digita aqui é guardado. */
  let telaConta = 'inicio', tipoCadastro = 'cnpj';
  function desenharConta() {
    const corpo = $('#conta-corpo');
    const t = tabela();
    if (telaConta === 'cadastro') {
      const crea = tipoCadastro === 'crea';
      corpo.innerHTML = `<form class="conta-form" data-cadastro>
          <h3>Cadastro de empresa ou profissional</h3>
          <p>Depois da aprovação, o seu preço aparece sempre que você entrar na loja.</p>
          <fieldset class="opcao"><legend>Você é</legend><div class="pilulas">
            <label><input type="radio" name="tipo" value="cnpj" ${crea ? '' : 'checked'}><span>Empresa (CNPJ)</span></label>
            <label><input type="radio" name="tipo" value="crea" ${crea ? 'checked' : ''}><span>Profissional CREA-GO</span></label>
          </div></fieldset>
          <div class="beneficio">${ico('badge', 22)}<p>${crea
            ? '<strong>5% de desconto + 3% de cashback</strong> em compras de qualquer valor. O cashback vale na próxima compra, por 30 dias. Fiação elétrica fica fora do benefício.'
            : '<strong>Preço de atacado</strong> em todo o catálogo, com nota fiscal para a sua empresa. O percentual é definido pela Mais Mendes.'}</p></div>
          <label class="campo"><span>${crea ? 'Nome completo' : 'Razão social'}</span><input name="nome" required autocomplete="${crea ? 'name' : 'organization'}"></label>
          <label class="campo"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="campo"><span>WhatsApp</span><input name="fone" type="tel" required inputmode="tel" autocomplete="tel"></label>
          ${crea
            ? '<label class="campo"><span>Nº do registro no CREA-GO</span><input name="doc" required inputmode="numeric"><small>Está na sua carteira profissional. Também vale o CNPJ vinculado ao Conselho.</small></label>'
            : '<label class="campo"><span>CNPJ</span><input name="doc" required inputmode="numeric"></label>'}
          <button class="btn btn-primario btn-bloco">Enviar cadastro</button>
          <button type="button" class="btn btn-linha btn-bloco" data-acao="conta-voltar">Voltar</button>
        </form>`;
      return;
    }
    if (telaConta === 'enviado') {
      corpo.innerHTML = `<div class="conta-ok">${ico('check', 40)}
          <h3>Cadastro enviado!</h3>
          <p>Nossa equipe confere os dados e avisa por e-mail quando o seu preço ${PERFIS[tipoCadastro].curto} estiver liberado. Enquanto isso, você pode comprar pelo preço de vitrine.</p>
          <button class="btn btn-primario btn-bloco" data-acao="perfil" data-perfil="${tipoCadastro}">Simular a aprovação</button>
          <button class="btn btn-linha btn-bloco" data-acao="fechar">Continuar comprando</button>
          <p class="conta-nota">Protótipo: no site real, a aprovação é feita pela equipe no painel da Nuvemshop.</p>
        </div>`;
      return;
    }
    const opcao = (id, titulo, desc) => `<button class="perfil-op" data-acao="perfil" data-perfil="${id}" ${perfil === id ? 'aria-current="true"' : ''}>
        <strong>${titulo}</strong><span>${desc}</span>${perfil === id ? `<em>${ico('check', 16)} Ativo</em>` : ''}</button>`;
    corpo.innerHTML = `<div class="conta-inicio">
        ${t ? `<div class="beneficio">${ico('badge', 22)}<p>Você entrou como <strong>${t.nome}</strong>. ${t.resumo}.</p></div>` : ''}
        <h3>Ver os preços como</h3>
        <p class="conta-nota">Protótipo: no site real, aqui ficam o login e o cadastro da Nuvemshop. Escolha um perfil para simular o cliente já aprovado.</p>
        ${opcao('', 'Visitante ou pessoa física (CPF)', 'Preço de vitrine')}
        ${opcao('cnpj', 'Empresa (CNPJ)', PERFIS.cnpj.resumo)}
        ${opcao('crea', 'Profissional CREA-GO', PERFIS.crea.resumo)}
        <div class="conta-cadastro">
          <strong>Tem CNPJ ou registro no CREA-GO?</strong>
          <p>Cadastre-se uma vez e compre sempre com o seu preço.</p>
          <button class="btn btn-escuro btn-bloco" data-acao="cadastro" data-tipo="cnpj">Cadastrar empresa ou profissional</button>
        </div>
      </div>`;
  }
  function abrirConta(tela, tipo) {
    telaConta = tela;
    if (tipo) tipoCadastro = tipo;
    desenharConta();
    if (!$('#gaveta-conta').classList.contains('aberto')) abrir('gaveta-conta');
    else $('#gaveta-conta .gaveta-cab button').focus();
  }
  function trocarPerfil(novo) {
    guardar('mm_perfil', novo);
    try { sessionStorage.setItem('mm_aviso_perfil', novo || 'vitrine'); } catch (e) { /* ok */ }
    location.reload(); // preços, cabeçalho e frete são redesenhados com o novo perfil
  }

  function atualizar() {
    const n = qtdTotal();
    $$('[data-total]').forEach((e) => { e.textContent = brl(subtotal()); });
    $$('[data-contador]').forEach((e) => { e.textContent = n; e.hidden = !n; });
    $('[data-barra-itens]').textContent = `Seu orçamento · ${plural(n, 'item', 'itens')}`;
    const aberta = $('#gaveta-orc').classList.contains('aberto');
    $('#barra').classList.toggle('visivel', n > 0 && !aberta);
    document.body.classList.toggle('com-barra', n > 0);
    $$('[data-card]').forEach((e) => { e.innerHTML = cardAcao(produto(e.dataset.card)); });
    $$('[data-frete-produto]').forEach((e) => { e.innerHTML = blocoCep('produto', produto(e.dataset.freteProduto)); });
    desenharOrcamento();
  }

  /* ---------- Gavetas ---------- */
  let quemAbriu = null;
  function abrir(id) {
    fechar(true);
    quemAbriu = document.activeElement;
    const g = $('#' + id);
    g.hidden = false;
    requestAnimationFrame(() => { g.classList.add('aberto'); $('#fundo').classList.add('aberto'); });
    document.body.classList.add('travado');
    $('#barra').classList.remove('visivel');
    $('.gaveta-cab button', g).focus();
  }
  function fechar(silencioso) {
    $$('.gaveta.aberto').forEach((g) => { g.classList.remove('aberto'); setTimeout(() => { if (!g.classList.contains('aberto')) g.hidden = true; }, 260); });
    $('#fundo').classList.remove('aberto');
    document.body.classList.remove('travado');
    if (silencioso !== true) { atualizar(); if (quemAbriu) quemAbriu.focus(); }
  }
  let relogio;
  function avisar(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('visivel');
    clearTimeout(relogio);
    relogio = setTimeout(() => t.classList.remove('visivel'), 3200);
  }

  /* ---------- Páginas ---------- */
  // Marcas do catálogo inicial, das mais presentes na loja para as demais, com a largura do logo (os PNGs têm 96 px
  // de altura). A Luxpremium fica de fora até haver um logo oficial (ver CREDITOS.md).
  const MARCAS = [['Tramontina', 640], ['Krona', 476], ['Lamesa', 278], ['Stanley', 197], ['DeWalt', 312], ['Docol', 476],
    ['Viapol', 193], ['Precon', 790], ['Icasa', 416], ['Blumenau', 410], ['Pluzie', 260], ['Wesco', 425], ['Sibratec', 554],
    ['Lumanti', 495], ['Luconi', 329], ['DuroPVC', 264], ['Decoralita', 966], ['Elitek', 496], ['Pevesul', 296], ['Ônix', 221]];
  const slugMarca = (m) => norm(m).replace(/[^a-z0-9]/g, '');
  // logos com a mesma área visual: os largos ficam mais baixos, os compactos chegam a 46 px de altura
  const alturaLogo = (largura) => Math.round(Math.min(46, Math.sqrt(4800 / (largura / 96))));

  function paginaHome() {
    const destaque = (slugs) => slugs.map(produto).filter(Boolean).map(card).join('');
    const fotoCat = { 'material-eletrico': 'eletrica', 'material-hidraulico': 'hidraulica', iluminacao: 'iluminacao', 'ferramentas-eletricas-e-manuais': 'ferramentas' };
    $('#banners').innerHTML = CATS.slice(0, 4).map((c) => `<a class="banner" href="${urlCat(c)}">
        <img src="${IMG}banners/categoria-${fotoCat[c.slug]}.jpg" alt="" width="900" height="675" loading="lazy">
        <strong>${c.nome}</strong><span>Ver ${plural(c.total, 'produto', 'produtos')} ${ico('right', 16)}</span>
      </a>`).join('');
    $('#mais-procurados').innerHTML = destaque([
      'cabo-flexivel-450-750v-lamesa-rolo-100-m', 'disjuntor-unipolar-din-3-ka-tramontina',
      'tomada-2p-t-10a-250v-linha-aria-tramontina', 'tubo-pvc-esgoto-primario-100-mm-krona-barra-6-m',
      'lampada-led-bulbo-e27-6500k-tramontina', 'sifao-sanfonado-universal-krona',
      'argamassa-colante-cinza-20-kg-precon', 'adesivo-plastico-para-pvc-com-pincel-krona']);
    $('#ferramentas').innerHTML = destaque([
      'parafusadeira-e-furadeira-de-impacto-20v-stanley', 'furadeira-de-impacto-1-2-710w-dewalt',
      'martelete-perfurador-sds-800w-26-mm-stanley', 'furadeira-de-impacto-13-mm-800w-wesco']);
    $('#categorias').innerHTML = CATS.map((c) => `<a class="cat" href="${urlCat(c)}">
        <span class="cat-ico">${ico(c.icone, 26)}</span>
        <span><strong>${c.nome}</strong><small>${c.subs.length ? c.subs.join(' · ') : 'AC-I · AC-II · AC-III'}</small></span>
      </a>`).join('');
    // Marcas parceiras: logos em faixa contínua; a segunda cópia só existe para o laço não ter emenda
    const logos = MARCAS.map(([m, largura]) => {
      const h = alturaLogo(largura);
      return `<li><a href="categoria.html?q=${encodeURIComponent(m)}" title="Ver produtos ${esc(m)}">
        <img src="${IMG}marcas/${slugMarca(m)}.png" alt="${esc(m)}" width="${Math.round((largura / 96) * h)}" height="${h}" style="--h:${h}px" data-marca></a></li>`;
    }).join('');
    $('#marcas').innerHTML = `<ul class="marcas-faixa">${logos}</ul><ul class="marcas-faixa" aria-hidden="true">${logos.replace(/<a /g, '<a tabindex="-1" ')}</ul>`;
    carrossel();
    $('#news').addEventListener('submit', (e) => {
      e.preventDefault();
      e.target.outerHTML = '<p class="news-ok">Pronto! Você vai receber nossas ofertas por e-mail.</p>';
    });
  }

  // Banner rotativo: rolagem horizontal com encaixe; troca sozinho a cada 6 s e pausa quando a pessoa interage
  function carrossel() {
    const trilho = $('#hero-trilho');
    const slides = $$('.slide', trilho);
    const pontos = $('#hero-pontos');
    pontos.innerHTML = slides.map((_, i) => `<button data-ir="${i}" aria-label="Ir para o banner ${i + 1} de ${slides.length}"></button>`).join('');
    const atual = () => Math.round(trilho.scrollLeft / trilho.clientWidth);
    const ir = (i) => trilho.scrollTo({ left: ((i + slides.length) % slides.length) * trilho.clientWidth, behavior: 'smooth' });
    const marcar = () => $$('button', pontos).forEach((b, i) => b.setAttribute('aria-current', i === atual()));
    trilho.addEventListener('scroll', () => requestAnimationFrame(marcar), { passive: true });
    $('.hero').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ir], [data-passo-hero]');
      if (!b) return;
      ir(b.dataset.ir !== undefined ? Number(b.dataset.ir) : atual() + Number(b.dataset.passoHero));
    });
    let pausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ['pointerenter', 'focusin', 'touchstart'].forEach((ev) => $('.hero').addEventListener(ev, () => { pausado = true; }, { passive: true }));
    ['pointerleave', 'focusout'].forEach((ev) => $('.hero').addEventListener(ev, () => { pausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }));
    setInterval(() => { if (!pausado && !document.hidden) ir(atual() + 1); }, 6000);
    marcar();
  }

  function paginaCategoria() {
    const cat = CATS.find((c) => c.slug === params.get('c'));
    const sub = params.get('s');
    const q = (params.get('q') || '').trim();
    let base = PRODS;
    let titulo = 'Todos os produtos';
    if (q) {
      const termos = norm(q).split(/\s+/).filter(Boolean);
      base = PRODS.filter((p) => { const h = norm([p.nome, p.marca, p.cat, p.sub, p.tags].join(' ')); return termos.every((t) => h.includes(t)); });
      titulo = `Resultados para "${esc(q)}"`;
    } else if (cat) {
      base = PRODS.filter((p) => p.cat === cat.nome && (!sub || p.sub === sub));
      titulo = esc(sub || cat.nome);
    }
    document.title = `${q ? 'Busca: ' + q : sub || (cat ? cat.nome : 'Produtos')} | Mais Mendes`;

    const trilha = [`<a href="index.html">Início</a>`];
    if (cat && !q) { trilha.push(sub ? `<a href="${urlCat(cat)}">${cat.nome}</a>` : `<span>${cat.nome}</span>`); if (sub) trilha.push(`<span>${esc(sub)}</span>`); }
    else trilha.push(`<span>${q ? 'Busca' : 'Produtos'}</span>`);

    const contar = (fn) => PRODS.filter(fn).length;
    const navCats = cat && !q
      ? `<a href="${urlCat(cat)}" ${sub ? '' : 'aria-current="page"'}>Tudo em ${cat.curto}<small>${cat.total}</small></a>` +
        cat.subs.map((s) => `<a href="${urlCat(cat, s)}" ${s === sub ? 'aria-current="page"' : ''}>${s}<small>${contar((p) => p.cat === cat.nome && p.sub === s)}</small></a>`).join('')
      : CATS.map((c) => `<a href="${urlCat(c)}">${c.nome}<small>${c.total}</small></a>`).join('');
    const marcas = [...new Set(base.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    $('#conteudo').innerHTML = `<div class="container">
      <nav class="trilha" aria-label="Você está em">${trilha.join(ico('right', 14))}</nav>
      <h1 class="pag-titulo">${titulo}</h1>
      <div class="listagem">
        <details class="filtros" id="filtros" open>
          <summary>${ico('filter', 20)} Filtrar ${ico('down', 18)}</summary>
          <div class="filtros-corpo">
            <div class="filtro"><h2>Categorias</h2>${navCats}</div>
            ${marcas.length > 1 ? `<div class="filtro"><h2>Marca</h2>${marcas.map((m) => `<label><input type="checkbox" name="marca" value="${esc(m)}"> ${esc(m)}<small>${base.filter((p) => p.marca === m).length}</small></label>`).join('')}</div>` : ''}
          </div>
        </details>
        <div>
          <div class="lista-topo">
            <span id="contagem"></span>
            <label class="ordenar">Ordenar por
              <select id="ordem">
                <option value="rel">Mais vendidos</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="az">Nome (A–Z)</option>
              </select>
            </label>
          </div>
          <div class="grade" id="lista"></div>
        </div>
      </div>
    </div>`;

    if (window.matchMedia('(max-width: 820px)').matches) $('#filtros').open = false;

    function listar() {
      const marcadas = $$('input[name="marca"]:checked').map((i) => i.value);
      let itens = base.filter((p) => !marcadas.length || marcadas.includes(p.marca));
      const ordem = $('#ordem').value;
      if (ordem === 'menor') itens = [...itens].sort((a, b) => precoMin(a) - precoMin(b));
      if (ordem === 'maior') itens = [...itens].sort((a, b) => precoMin(b) - precoMin(a));
      if (ordem === 'az') itens = [...itens].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      $('#contagem').textContent = plural(itens.length, 'produto', 'produtos');
      $('#lista').innerHTML = itens.length ? itens.map(card).join('') : `<div class="vazio">
          <strong>Não encontramos esse produto por aqui</strong>
          <p>Confira a escrita ou fale com a gente: temos muito mais itens na loja do que no site.</p>
          <a class="btn btn-escuro" href="#" data-acao="zap">${ico('whatsapp', 20)} Pedir pelo WhatsApp</a>
        </div>`;
    }
    $('#conteudo').addEventListener('change', (e) => { if (e.target.matches('input[name="marca"], #ordem')) listar(); });
    listar();
  }

  // Bloco de preço da página do produto: vitrine para quem não entrou; preço da tabela para CNPJ e CREA-GO aprovados
  function precosPdp(p, sel) {
    const t = tabela(), vitrine = precoAtual(p, sel), meu = precoCliente(p, sel);
    const de = comTabela(p) ? vitrine : p.precoDe;
    const nota = comTabela(p)
      ? `<strong class="economia">Você economiza ${brl(vitrine - meu)} com o preço ${t.curto}</strong>`
      : p.precoDe ? `<strong class="economia">Você economiza ${brl(p.precoDe - vitrine)}</strong>` : 'Preço por unidade';
    return `
      ${comTabela(p) ? `<p class="pdp-tabela">${ico('badge', 16)} Seu preço ${t.curto} · ${pct(t.desconto)} de desconto</p>` : ''}
      ${de ? `<div class="pdp-de"><span class="sr-only">De </span><s>${brl(de)}</s></div>` : ''}
      <div class="pdp-preco">${brl(meu)}</div>
      <p class="pdp-pix"><strong>${brl(noPix(meu))}</strong> no Pix <span>${pct(DESCONTO_PIX)} de desconto</span></p>
      <p class="pdp-parcelas">${parcelas(meu)}</p>
      ${comTabela(p) && t.cashback ? `<p class="pdp-cashback">+ ${brl(centavos(meu * t.cashback))} de cashback (${pct(t.cashback)}) para a próxima compra</p>` : ''}
      <p class="pdp-preco-nota">${nota}</p>
      ${foraDaTabela(p) ? `<p class="pdp-perfil">${ico('badge', 20)}<span>Fiação elétrica não entra no benefício ${t.curto}. Este produto segue com o preço de vitrine.</span></p>` : ''}
      ${t ? '' : `<p class="pdp-perfil">${ico('badge', 20)}<span>Tem CNPJ ou registro no CREA-GO? <a href="#" data-acao="conta">Entre e veja o seu preço</a></span></p>`}`;
  }

  function paginaProduto() {
    const p = produto(params.get('p')) || PRODS[0];
    const cat = CATS.find((c) => c.nome === p.cat);
    document.title = `${p.nome} | Mais Mendes`;
    const sel = opcoesPadrao(p);
    const relacionados = [...PRODS.filter((x) => x.slug !== p.slug && x.sub === p.sub && x.cat === p.cat),
      ...PRODS.filter((x) => x.slug !== p.slug && x.cat === p.cat && x.sub !== p.sub),
      ...PRODS.filter((x) => x.cat !== p.cat)].slice(0, 4);

    $('#conteudo').innerHTML = `<div class="container">
      <nav class="trilha" aria-label="Você está em">${[`<a href="index.html">Início</a>`, `<a href="${urlCat(cat)}">${cat.nome}</a>`,
        p.sub ? `<a href="${urlCat(cat, p.sub)}">${p.sub}</a>` : '', `<span>${esc(p.nome)}</span>`].filter(Boolean).join(ico('right', 14))}</nav>
      <div class="pdp">
        <figure class="foto" style="margin:0">${foto(p, false)}${tagDesconto(p)}</figure>
        <div>
          <span class="pdp-marca">${esc(p.marca)}</span>
          <h1>${esc(p.nome)}</h1>
          <div id="pdp-precos">${precosPdp(p, sel)}</div>
          ${p.opcoes.map((o, i) => `<fieldset class="opcao"><legend>${esc(o.nome)}</legend><div class="pilulas">
            ${o.valores.map((v, j) => `<label><input type="radio" name="op${i}" data-opcao="${esc(o.nome)}" value="${esc(v)}" ${j === 0 ? 'checked' : ''}><span>${esc(v)}</span></label>`).join('')}
          </div></fieldset>`).join('')}
          <div class="comprar">
            <div class="qtd" role="group" aria-label="Quantidade">
              <button type="button" data-passo="-1" aria-label="Diminuir">${ico('minus', 18)}</button>
              <input id="qtd" type="number" inputmode="numeric" min="1" max="9999" value="1" aria-label="Quantidade">
              <button type="button" data-passo="1" aria-label="Aumentar">${ico('plus', 18)}</button>
            </div>
            <button class="btn btn-primario" id="add-produto">Adicionar ao orçamento</button>
          </div>
          <p class="disponivel">${ico('check', 18)} Disponível para entrega e retirada</p>
          <div class="caixa"><h2>${ico('truck', 20)} Calcule frete e prazo</h2><div data-frete-produto="${p.slug}"></div></div>
          <div class="descricao"><h2>Descrição</h2>${p.descricao}</div>
          <div class="garantias">
            <div class="selo">${ico('shield', 28)}<div><strong>Compra segura</strong><span>Seus dados protegidos do início ao fim.</span></div></div>
            <div class="selo">${ico('headset', 28)}<div><strong>Dúvida técnica?</strong><span>Fale com quem entende de obra.</span></div></div>
          </div>
        </div>
      </div>
    </div>
    <section class="secao secao-cinza"><div class="container">
      <div class="sec-cab"><h2 class="sec-titulo">Produtos relacionados</h2></div>
      <div class="grade rolagem">${relacionados.map(card).join('')}</div>
    </div></section>`;

    const campo = $('#qtd');
    const qtd = () => Math.max(1, Math.min(9999, parseInt(campo.value, 10) || 1));
    $('#conteudo').addEventListener('click', (e) => {
      const passo = e.target.closest('[data-passo]');
      if (passo) campo.value = Math.max(1, qtd() + Number(passo.dataset.passo));
    });
    $('#conteudo').addEventListener('change', (e) => {
      if (!e.target.dataset.opcao) return;
      sel[e.target.dataset.opcao] = e.target.value;
      $('#pdp-precos').innerHTML = precosPdp(p, sel);
    });
    $('#add-produto').addEventListener('click', () => {
      adicionar(p.slug, { ...sel }, qtd());
      avisar(`${plural(qtd(), 'unidade adicionada', 'unidades adicionadas')} ao seu orçamento.`);
      campo.value = 1;
    });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-acao]');
    if (!alvo) { $$('.mega-wrap.aberto').forEach((m) => { if (!m.contains(e.target)) fecharMega(); }); return; }
    const { acao, slug, chave: k } = alvo.dataset;
    const item = k && orc.find((i) => i.chave === k);
    if (acao === 'add') { const p = produto(slug); adicionar(slug, opcoesPadrao(p)); }
    else if (acao === 'mais' && item) definirQtd(k, item.qtd + 1);
    else if (acao === 'menos' && item) definirQtd(k, item.qtd - 1);
    else if (acao === 'abrir-orc') { desenharOrcamento(); abrir('gaveta-orc'); }
    else if (acao === 'abrir-menu') abrir('gaveta-menu');
    else if (acao === 'fechar') fechar();
    else if (acao === 'mega') { const w = alvo.closest('.mega-wrap'); const ab = w.classList.toggle('aberto'); alvo.setAttribute('aria-expanded', ab); }
    else if (acao === 'trocar-cep') {
      const onde = alvo.closest('#gaveta-orc') ? '#gaveta-orc' : '#conteudo';
      cep = ''; guardar('mm_cep', cep); atualizar();
      const c = $(onde + ' [data-cep] input'); if (c) c.focus();
    }
    else if (acao === 'fechar-aviso') { $('#aviso').remove(); try { sessionStorage.setItem('mm_aviso', '1'); } catch (err) { /* ok */ } }
    else if (acao === 'finalizar') avisar('No site real, aqui você segue para o pagamento (checkout da Nuvemshop).');
    else if (acao === 'enviar-zap') window.open('https://wa.me/?text=' + encodeURIComponent(textoOrcamento()), '_blank', 'noopener');
    else if (acao === 'conta') { e.preventDefault(); abrirConta('inicio'); }
    else if (acao === 'cadastro') { e.preventDefault(); abrirConta('cadastro', alvo.dataset.tipo); }
    else if (acao === 'conta-voltar') { telaConta = 'inicio'; desenharConta(); }
    else if (acao === 'perfil') trocarPerfil(alvo.dataset.perfil);
    else if (acao === 'zap') { e.preventDefault(); avisar('No site real, este botão abre o WhatsApp da Mais Mendes.'); }
  });
  function fecharMega() {
    $$('.mega-wrap.aberto').forEach((m) => { m.classList.remove('aberto'); $('.nav-todas', m).setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecharMega(); if ($('.gaveta.aberto')) fechar(); } });
  document.addEventListener('input', (e) => { if (e.target.name === 'cep') e.target.value = cepMascara(e.target.value); });
  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-cadastro]')) {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      telaConta = 'enviado';
      desenharConta();
      $('#gaveta-conta .gaveta-cab button').focus();
      return;
    }
    const f = e.target.closest('[data-cep]');
    if (!f) return;
    e.preventDefault();
    const numeros = f.cep.value.replace(/\D/g, '');
    const erro = f.parentElement.querySelector('.cep-erro');
    if (numeros.length !== 8) { erro.hidden = false; f.cep.focus(); return; }
    cep = numeros; freteId = '';
    guardar('mm_cep', cep); guardar('mm_frete', freteId);
    atualizar();
  });
  document.addEventListener('change', (e) => {
    if (e.target.name === 'tipo' && e.target.closest('[data-cadastro]')) {
      tipoCadastro = e.target.value;
      desenharConta();
      $(`#conta-corpo input[name="tipo"][value="${tipoCadastro}"]`).focus();
      return;
    }
    if (e.target.name !== 'frete') return;
    freteId = e.target.value;
    guardar('mm_frete', freteId);
    desenharOrcamento();
  });
  // a logo vem do site atual do cliente; se não carregar, entra a versão em texto (o mesmo vale para as marcas)
  document.addEventListener('error', (e) => {
    if (e.target.matches && e.target.matches('img[data-logo]')) e.target.outerHTML = '<span class="logo-txt"><b>+</b>MENDES</span>';
    if (e.target.matches && e.target.matches('img[data-marca]')) e.target.outerHTML = `<span class="marca-txt">${esc(e.target.alt)}</span>`;
  }, true);

  /* ---------- Início ---------- */
  $('#cabecalho').innerHTML = cabecalho();
  $('#rodape').innerHTML = rodape();
  document.body.insertAdjacentHTML('beforeend', sobreposicoes());
  try { if (sessionStorage.getItem('mm_aviso')) $('#aviso').remove(); } catch (err) { /* ok */ }
  const pagina = document.body.dataset.pagina;
  if (pagina === 'home') paginaHome();
  if (pagina === 'categoria') paginaCategoria();
  if (pagina === 'produto') paginaProduto();
  atualizar();
  try {
    const novo = sessionStorage.getItem('mm_aviso_perfil');
    if (novo) {
      sessionStorage.removeItem('mm_aviso_perfil');
      avisar(PERFIS[novo] ? `Pronto: você está vendo os preços de ${PERFIS[novo].nome}.` : 'Pronto: você está vendo o preço de vitrine.');
    }
  } catch (err) { /* ok */ }
  // Link direto do mapa da loja (sitemap.html): abre o orçamento já com um exemplo, se estiver vazio
  if (location.hash === '#orcamento') {
    if (!orc.length) {
      [['cabo-flexivel-450-750v-lamesa-rolo-100-m', 2], ['disjuntor-unipolar-din-3-ka-tramontina', 6], ['tomada-2p-t-10a-250v-linha-aria-tramontina', 10]]
        .forEach(([slug, qtd]) => adicionar(slug, opcoesPadrao(produto(slug)), qtd));
      avisar('Orçamento de exemplo carregado.');
    }
    abrir('gaveta-orc');
  }
  // Também do mapa: abre "Minha conta" (perfis e cadastro de empresa ou profissional CREA-GO)
  if (location.hash === '#conta') abrirConta('inicio');
})();
