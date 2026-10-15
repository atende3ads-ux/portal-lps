#!/usr/bin/env node
// Copia as LPs listadas em catalogo.json para modelos/<slug>/, já limpas:
// só os arquivos que as páginas usam, sem rastreio e com formulários desativados.
//
//   node scripts/importar.mjs                 importa tudo
//   node scripts/importar.mjs honcord savana  importa só esses
//   node scripts/importar.mjs --atualizar     baixa a versão mais nova dos repos antes
//
// Depois de importar, rode scripts/capturar.mjs para gerar as miniaturas.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { servir } from './servir.mjs';
import { navegador, fecharNavegador, rolar, DESKTOP, CELULAR } from './navegador.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(RAIZ, '.cache', 'fontes');
const SAIDA = path.join(RAIZ, 'modelos');
const DADOS = path.join(RAIZ, 'data', 'modelos.json');
const GRANDE = 20 * 1024 * 1024; // acima disso o arquivo é lido do site original

const catalogo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'catalogo.json'), 'utf8'));
const guarda = fs.readFileSync(path.join(RAIZ, 'scripts', 'guarda.js'), 'utf8');

const args = process.argv.slice(2);
const atualizar = args.includes('--atualizar');
const escolhidos = args.filter((a) => !a.startsWith('--'));

const TEXTO = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.svg', '.webmanifest']);
const FORA = new Set(['.php', '.md', '.zip', '.pdf', '.psd', '.ai', '.fig', '.sketch', '.gs', '.yml', '.yaml', '.lock', '.map', '.py', '.sh', '.ts', '.tsx', '.jsx']);
const MIDIA = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)$/i;

// Rastreio removido do HTML (o guarda.js ainda bloqueia o que for injetado depois).
const SRC_RASTREIO = /googletagmanager\.com|google-analytics\.com|googleadservices\.com|doubleclick\.net|connect\.facebook\.net|clarity\.ms|hotjar\.com|analytics\.tiktok\.com|snap\.licdn\.com|ads-twitter\.com|bat\.bing\.com|d335luupugsy2\.cloudfront\.net\/js\/loader-scripts|hs-scripts\.com/i;
const INLINE_RASTREIO = /googletagmanager\.com\/(gtm|gtag)|connect\.facebook\.net|fbq\(\s*['"]init|clarity\.ms\/tag|static\.hotjar\.com|analytics\.tiktok\.com|snap\.licdn\.com|bat\.bing\.com|gtag\(\s*['"]config/i;

const CSP = [
  "connect-src 'self' data: blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.lottiefiles.com https://lottie.host https://maps.googleapis.com https://maps.gstatic.com",
  "form-action 'none'",
].join('; ');

function sh(cmd, argv) {
  return execFileSync(cmd, argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
const ehArquivo = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const ehPasta = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function baixar(m) {
  const pasta = path.join(CACHE, m.repo.replace('/', '__'));
  if (!ehPasta(pasta)) {
    fs.mkdirSync(CACHE, { recursive: true });
    sh('git', ['clone', '-q', '--depth', '1', `https://github.com/${m.repo}.git`, pasta]);
  } else if (atualizar) {
    sh('git', ['-C', pasta, 'fetch', '-q', '--depth', '1', 'origin']);
    sh('git', ['-C', pasta, 'reset', '-q', '--hard', 'FETCH_HEAD']);
  }
  const data = sh('git', ['-C', pasta, 'log', '-1', '--format=%cs']);
  if (!m.zip) return { fonte: pasta, data };
  const extraida = pasta + '__zip';
  fs.rmSync(extraida, { recursive: true, force: true });
  fs.mkdirSync(extraida, { recursive: true });
  sh('unzip', ['-oq', path.join(pasta, m.zip), '-d', extraida]);
  return { fonte: extraida, data };
}

async function temSiteNoAr(dono, repo) {
  try {
    const r = await fetch(`https://${dono}.github.io/${repo}/`, { method: 'HEAD', redirect: 'follow' });
    return r.ok;
  } catch { return false; }
}

function candidatos(txt) {
  const c = new Set();
  for (const x of txt.matchAll(/(["'`])((?:(?!\1)[^\n<>]){1,300})\1/g)) c.add(x[2]);
  for (const x of txt.matchAll(/url\(\s*([^)'"\s]+)\s*\)/g)) c.add(x[1]);
  for (const x of txt.matchAll(/\b(?:src|href|srcset|poster|data-[\w-]+)\s*=\s*([^\s"'>]+)/gi)) c.add(x[1]);
  const out = new Set();
  for (const s of c) {
    out.add(s);
    if (/[\s,]/.test(s)) for (const t of s.split(/[\s,]+/)) if (t) out.add(t);
  }
  return out;
}

// Um modelo em importação: sabe achar os arquivos que as páginas usam e copiá-los já limpos.
function criarModelo(m, fonte, urlOriginal) {
  const [dono, repo] = m.repo.split('/');
  const baseModelo = `${catalogo.base}modelos/${m.slug}/`;
  const destino = path.join(SAIDA, m.slug);
  const ghAbs = new RegExp(`^(?:https?:)?//${escRe(dono)}\\.github\\.io/${escRe(repo)}/`, 'i');
  const prefixoRepo = new RegExp(`^/${escRe(repo)}/`);
  const pastasDasPaginas = m.paginas.map((p) => path.posix.dirname(p.caminho));
  const usados = new Set();
  const refs = new Map(); // arquivo -> [{bruto, alvo}]
  const grandes = new Map(); // arquivo -> url no site original
  let bytes = 0;

  function resolver(bruto, deDir, extras) {
    let r = bruto.trim();
    if (!r || r.length > 300 || /^(data:|blob:|javascript:|mailto:|tel:|#|\$\{|\{\{)/i.test(r)) return null;
    r = r.replace(/[?#].*$/, '');
    try { r = decodeURIComponent(r); } catch {}
    let bases;
    if (ghAbs.test(r)) { r = r.replace(ghAbs, ''); bases = ['']; }
    else if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(r)) return null;
    else if (r.startsWith('/')) { r = r.replace(prefixoRepo, '/').slice(1); bases = ['']; }
    else bases = [deDir, ...extras, ''];
    for (const b of bases) {
      const p = path.posix.normalize(path.posix.join(b, r)).replace(/\/$/, '');
      if (p.startsWith('..')) continue;
      const abs = path.join(fonte, p);
      if (p && p !== '.' && ehArquivo(abs)) return p;
      if (ehPasta(abs) && ehArquivo(path.join(abs, 'index.html'))) return path.posix.join(p === '.' ? '' : p, 'index.html');
      if (p && !path.posix.extname(p) && ehArquivo(abs + '.html')) return p + '.html';
    }
    return null;
  }

  const ignorar = (rel) => FORA.has(path.extname(rel).toLowerCase()) ||
    /(^|\/)(readme|license|package(-lock)?\.json)$/i.test(rel) || /(^|\/)(\.git|node_modules)(\/|$)/.test(rel);

  // Segue as referências a partir dos arquivos dados; devolve os arquivos novos.
  function explorar(inicio) {
    const novos = [];
    const fila = [...inicio];
    while (fila.length) {
      const rel = fila.pop();
      if (usados.has(rel) || ignorar(rel)) continue;
      usados.add(rel);
      novos.push(rel);
      const ext = path.extname(rel).toLowerCase();
      if (!TEXTO.has(ext)) continue;
      const txt = fs.readFileSync(path.join(fonte, rel), 'utf8');
      const deDir = path.posix.dirname(rel) === '.' ? '' : path.posix.dirname(rel);
      const extras = ['.js', '.mjs', '.json'].includes(ext) ? pastasDasPaginas : [];
      const lista = [];
      for (const bruto of candidatos(txt)) {
        const alvo = resolver(bruto, deDir, extras);
        if (!alvo || alvo === rel) continue;
        lista.push({ bruto, alvo });
        if (!usados.has(alvo)) fila.push(alvo);
      }
      refs.set(rel, lista);
    }
    return novos;
  }

  function limparHtml(html) {
    // Caminhos absolutos do site original ("/assets/x.png", "/aquecedores") passam a apontar para a cópia.
    const absoluto = (valor) => {
      const [, caminho, resto] = valor.match(/^([^?#]*)(.*)$/);
      const alvo = resolver(caminho, '', []);
      return alvo ? baseModelo + alvo.replace(/(^|\/)index\.html$/, '$1') + resto : valor;
    };
    html = html.replace(/(\s(?:src|href|poster|action|data-src|data-bg|data-background|data-image)\s*=\s*["'])(\/(?!\/)[^"']*)/gi,
      (x, a, v) => a + absoluto(v));
    html = html.replace(/(\s(?:srcset|data-srcset)\s*=\s*["'])([^"']*)/gi,
      (x, a, v) => a + v.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/g, (y, s, u) => s + absoluto(u)));
    html = html.replace(/url\(\s*(['"]?)(\/(?!\/)[^)'"]+)\1\s*\)/g, (x, q, v) => `url(${q}${absoluto(v)}${q})`);

    // Rastreio fora.
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (x, attrs, corpo) => {
      const src = (attrs.match(/\bsrc\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || '';
      const rastreio = src ? SRC_RASTREIO.test(src) : corpo.length < 4000 && INLINE_RASTREIO.test(corpo);
      return rastreio ? '<!-- rastreio removido pelo portal -->' : x;
    });
    html = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi,
      (x) => (/googletagmanager|facebook\.com\/tr|clarity\.ms|hotjar/i.test(x) ? '' : x));
    html = html.replace(/<link\b[^>]*(googletagmanager|google-analytics|connect\.facebook\.net)[^>]*>/gi, '');
    html = html.replace(/<meta\b[^>]*name\s*=\s*["']robots["'][^>]*>/gi, '');

    // Proteções no topo do <head>, logo depois do charset.
    const topo = `<meta http-equiv="Content-Security-Policy" content="${CSP}">` +
      `<meta name="robots" content="noindex,nofollow">` +
      `<script>${guarda}</script>`;
    const charset = html.match(/<meta\b[^>]*(charset\s*=|http-equiv\s*=\s*["']content-type)[^>]*>/i);
    if (charset && charset.index < 3000) {
      const fim = charset.index + charset[0].length;
      return html.slice(0, fim) + topo + html.slice(fim);
    }
    if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (h) => `${h}<meta charset="utf-8">${topo}`);
    return `<meta charset="utf-8">${topo}` + html;
  }

  function trocarBase(txt) {
    txt = txt.replace(new RegExp(`(?:https?:)?//${escRe(dono)}\\.github\\.io/${escRe(repo)}/`, 'gi'), baseModelo);
    return txt.replace(new RegExp(`(["'(\\s=,])/${escRe(repo)}/`, 'g'), `$1${baseModelo}`);
  }

  function copiar(rel) {
    const origem = path.join(fonte, rel);
    const tam = fs.statSync(origem).size;
    if (tam > GRANDE && urlOriginal) { grandes.set(rel, urlOriginal + rel); return; }
    if (tam > GRANDE) console.warn(`  ! ${m.slug}: ${rel} tem ${(tam / 1e6).toFixed(0)} MB e o repo não tem site no ar`);
    const ext = path.extname(rel).toLowerCase();
    const alvo = path.join(destino, rel);
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    if (!TEXTO.has(ext)) { fs.copyFileSync(origem, alvo); bytes += tam; return; }
    let txt = fs.readFileSync(origem, 'utf8');
    for (const { bruto, alvo: a } of refs.get(rel) || []) {
      if (urlOriginal && fs.statSync(path.join(fonte, a)).size > GRANDE) txt = txt.split(bruto).join(urlOriginal + a);
    }
    if (ext === '.html' || ext === '.htm') txt = limparHtml(txt);
    txt = trocarBase(txt);
    fs.writeFileSync(alvo, txt);
    bytes += Buffer.byteLength(txt);
  }

  // Arquivo que o navegador pediu e não achou na cópia: existe no repo original?
  function noRepo(rel) {
    rel = rel.replace(/\/$/, '');
    for (const t of [rel, rel + '.html', path.posix.join(rel, 'index.html')]) {
      if (t && ehArquivo(path.join(fonte, t)) && !ignorar(t)) return t;
    }
    return null;
  }

  return {
    m, fonte, baseModelo, destino, usados, grandes, explorar, copiar, noRepo,
    get bytes() { return bytes; },
    inicio() {
      for (const p of m.paginas) {
        if (!ehArquivo(path.join(fonte, p.caminho))) throw new Error(`página não existe no repo: ${p.caminho}`);
      }
      fs.rmSync(destino, { recursive: true, force: true });
      for (const rel of explorar(m.paginas.map((p) => p.caminho))) copiar(rel);
    },
  };
}

// Abre as páginas no Chrome e traz do repo os arquivos que o JavaScript pediu e a cópia não tinha
// (ex.: fotos montadas por código como "images-ofertas/" + carro.img).
async function completar(modelo, porta) {
  const { m, baseModelo, usados, explorar, copiar, noRepo, fonte } = modelo;
  const raizUrl = `http://127.0.0.1:${porta}${baseModelo}`;
  const nav = await navegador();
  const pastasDinamicas = new Set();
  let total = 0;
  for (let rodada = 0; rodada < 3; rodada++) {
    const faltando = new Set();
    for (const perfil of [DESKTOP, CELULAR]) {
      const ctx = await nav.newContext(perfil);
      const page = await ctx.newPage();
      page.on('response', (r) => {
        if (r.status() === 404 && r.url().startsWith(raizUrl)) {
          faltando.add(decodeURIComponent(new URL(r.url()).pathname.slice(baseModelo.length)));
        }
      });
      for (const p of m.paginas) {
        await page.goto(raizUrl + p.caminho, { waitUntil: 'load', timeout: 45000 }).catch(() => {});
        await rolar(page, { passo: 700, pausa: 90 });
      }
      await ctx.close();
    }
    const inicio = [];
    for (const rel of faltando) {
      const achado = noRepo(rel);
      if (achado && !usados.has(achado)) {
        inicio.push(achado);
        pastasDinamicas.add(path.posix.dirname(achado));
      }
    }
    // Se o código monta caminhos numa pasta de mídia, traz a pasta inteira (cobre itens ainda não exibidos).
    for (const d of pastasDinamicas) {
      for (const f of fs.readdirSync(path.join(fonte, d))) {
        const rel = d === '.' ? f : `${d}/${f}`;
        if (MIDIA.test(f) && !usados.has(rel) && ehArquivo(path.join(fonte, rel))) inicio.push(rel);
      }
    }
    const novos = explorar(inicio);
    novos.forEach(copiar);
    total += novos.length;
    if (!novos.length) break;
  }
  return total;
}

async function importar(m, porta) {
  const t0 = Date.now();
  const { fonte, data } = baixar(m);
  const [dono, repo] = m.repo.split('/');
  const urlOriginal = (await temSiteNoAr(dono, repo)) ? `https://${dono}.github.io/${repo}/` : null;
  const modelo = criarModelo(m, fonte, urlOriginal);
  modelo.inicio();
  const extras = await completar(modelo, porta);

  const n = modelo.usados.size - modelo.grandes.size;
  console.log(`✓ ${m.slug.padEnd(24)} ${String(n).padStart(4)} arquivos  ${(modelo.bytes / 1e6).toFixed(1).padStart(6)} MB  ${((Date.now() - t0) / 1000).toFixed(1).padStart(5)}s` +
    (extras ? `  +${extras} achados no navegador` : '') +
    (modelo.grandes.size ? `  (${modelo.grandes.size} arquivo grande lido do site original)` : ''));
  return { atualizado: data, urlOriginal, tamanhoMB: +(modelo.bytes / 1e6).toFixed(1), arquivos: n };
}

const anterior = ehArquivo(DADOS) ? JSON.parse(fs.readFileSync(DADOS, 'utf8')) : { modelos: [] };
const calculado = new Map(anterior.modelos.map((x) => [x.slug, x]));

const alvo = escolhidos.length ? catalogo.modelos.filter((m) => escolhidos.includes(m.slug)) : catalogo.modelos;
if (escolhidos.length && alvo.length !== escolhidos.length) {
  console.error('Slug não encontrado no catalogo.json:', escolhidos.filter((s) => !alvo.some((m) => m.slug === s)).join(', '));
  process.exit(1);
}

const servidor = await servir(0);
const porta = servidor.address().port;
let falhas = 0;
for (const m of alvo) {
  try {
    const extra = await importar(m, porta);
    calculado.set(m.slug, { ...(calculado.get(m.slug) || {}), ...extra });
  } catch (e) {
    falhas++;
    console.error(`✗ ${m.slug}: ${e.message}`);
  }
}
await fecharNavegador();
servidor.close();

// Modelos que saíram do catálogo deixam de existir no portal.
const slugs = new Set(catalogo.modelos.map((m) => m.slug));
for (const d of fs.existsSync(SAIDA) ? fs.readdirSync(SAIDA) : []) {
  if (!slugs.has(d) && ehPasta(path.join(SAIDA, d))) fs.rmSync(path.join(SAIDA, d), { recursive: true });
}

const modelos = catalogo.modelos.map((m) => {
  const c = calculado.get(m.slug) || {};
  const { zip, ...resto } = m;
  return {
    ...resto,
    tags: m.tags || [],
    prototipo: !!m.prototipo,
    atualizado: c.atualizado || null,
    urlOriginal: c.urlOriginal ?? null,
    tamanhoMB: c.tamanhoMB ?? null,
    arquivos: c.arquivos ?? null,
    thumb: c.thumb || null,
    thumbMobile: c.thumbMobile || null,
    thumbAltura: c.thumbAltura || null,
  };
});
fs.mkdirSync(path.dirname(DADOS), { recursive: true });
fs.writeFileSync(DADOS, JSON.stringify({ nichos: catalogo.nichos, tipos: catalogo.tipos, modelos }, null, 2) + '\n');
console.log(`\n${alvo.length - falhas}/${alvo.length} importados · data/modelos.json atualizado`);
process.exit(falhas ? 1 : 0);
