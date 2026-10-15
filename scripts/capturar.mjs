#!/usr/bin/env node
// Gera as miniaturas de cada modelo a partir da cópia em modelos/:
//   thumbs/<slug>.webp    página inteira no desktop (até 8 telas), usada no card com rolagem no hover
//   thumbs/<slug>-m.webp  primeira tela no celular
//
//   node scripts/capturar.mjs                 captura tudo
//   node scripts/capturar.mjs honcord savana  captura só esses

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { servir } from './servir.mjs';
import { navegador, fecharNavegador, rolar, DESKTOP, CELULAR } from './navegador.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DADOS = path.join(RAIZ, 'data', 'modelos.json');
const THUMBS = path.join(RAIZ, 'thumbs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-lps-'));
const ALTURA_MAX = 900 * 8;
const PARALELO = 3;

const dados = JSON.parse(fs.readFileSync(DADOS, 'utf8'));
const base = JSON.parse(fs.readFileSync(path.join(RAIZ, 'catalogo.json'), 'utf8')).base;
const escolhidos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const alvo = escolhidos.length ? dados.modelos.filter((m) => escolhidos.includes(m.slug)) : dados.modelos;

// Fecha banners de cookies e pop-ups que cobririam a miniatura.
async function limparTela(page) {
  await page.evaluate(() => {
    const aceitar = /^(aceitar|aceito|aceitar todos|aceitar tudo|concordo|entendi|ok|ok, entendi|accept|accept all|got it|fechar|prosseguir)$/i;
    for (const b of document.querySelectorAll('button, a, [role=button]')) {
      const t = (b.textContent || '').trim();
      const caixa = b.closest('[class*=cookie i],[id*=cookie i],[class*=consent i],[id*=consent i],[class*=lgpd i],[id*=lgpd i],[class*=privac i],[id*=privac i]');
      if (caixa && aceitar.test(t)) b.click();
    }
    for (const el of document.querySelectorAll('[class*=cookie i],[id*=cookie i],[class*=consent i],[id*=consent i],[class*=lgpd i],[id*=lgpd i]')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') el.style.setProperty('display', 'none', 'important');
    }
  }).catch(() => {});
}

// Animações de entrada deixam seções com opacity 0 até aparecerem na tela (e algumas somem de novo
// ao voltar ao topo). Para a captura de página inteira, mostra tudo que está no fluxo normal.
// Elementos fixos/absolutos (menus, modais, slides de carrossel) ficam como estão.
async function revelar(page) {
  await page.evaluate(() => {
    const css = document.createElement('style');
    css.textContent = '*,*::before,*::after{transition:none!important;animation-play-state:paused!important;content-visibility:visible!important}';
    document.head.append(css);
    for (const e of document.body.querySelectorAll('*')) {
      const cs = getComputedStyle(e);
      if (cs.position === 'fixed' || cs.position === 'absolute') continue;
      const escondido = parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden';
      if (!escondido || e.offsetWidth === 0 || e.offsetHeight === 0) continue;
      if (e.closest('[aria-hidden="true"], nav, header, dialog, [role=dialog], [class*=modal i], [class*=menu i], [class*=drawer i]')) continue;
      e.style.setProperty('opacity', '1', 'important');
      e.style.setProperty('visibility', 'visible', 'important');
      e.style.setProperty('transform', 'none', 'important');
      e.style.setProperty('filter', 'none', 'important');
      e.style.setProperty('clip-path', 'none', 'important');
    }
  }).catch(() => {});
}

function paraWebp(entrada, saida, largura) {
  execFileSync('cwebp', ['-quiet', '-q', '74', '-resize', String(largura), '0', entrada, '-o', saida]);
}

async function capturar(m, porta) {
  const url = `http://127.0.0.1:${porta}${base}modelos/${m.slug}/${m.paginas[0].caminho}`;
  const nav = await navegador();

  const d = await nav.newContext(DESKTOP);
  const pd = await d.newPage();
  await pd.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await pd.waitForTimeout(1200);
  await limparTela(pd);
  await rolar(pd, { passo: 450, pausa: 180 });
  await limparTela(pd);
  await pd.waitForTimeout(1000);
  await revelar(pd);
  await pd.waitForTimeout(300);
  const altura = Math.min(await pd.evaluate(() => document.documentElement.scrollHeight), ALTURA_MAX);
  const jpgD = path.join(TMP, `${m.slug}.jpg`);
  await pd.screenshot({ timeout: 60000, path: jpgD, type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: 1440, height: altura } });
  await d.close();

  const c = await nav.newContext(CELULAR);
  const pc = await c.newPage();
  await pc.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await pc.waitForTimeout(1200);
  await limparTela(pc);
  await rolar(pc, { passo: 600, pausa: 120 });
  await limparTela(pc);
  await pc.waitForTimeout(1000);
  const jpgM = path.join(TMP, `${m.slug}-m.jpg`);
  await pc.screenshot({ timeout: 60000, path: jpgM, type: 'jpeg', quality: 90 });
  await c.close();

  paraWebp(jpgD, path.join(THUMBS, `${m.slug}.webp`), 720);
  paraWebp(jpgM, path.join(THUMBS, `${m.slug}-m.webp`), 360);
  return { thumb: `thumbs/${m.slug}.webp`, thumbMobile: `thumbs/${m.slug}-m.webp`, thumbAltura: Math.round(altura / 2) };
}

fs.mkdirSync(THUMBS, { recursive: true });
const servidor = await servir(0);
const porta = servidor.address().port;
const fila = [...alvo];
let falhas = 0;
async function trabalhador() {
  while (fila.length) {
    const m = fila.shift();
    const t0 = Date.now();
    try {
      Object.assign(m, await capturar(m, porta));
      console.log(`✓ ${m.slug.padEnd(24)} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      falhas++;
      console.error(`✗ ${m.slug}: ${e.message.split('\n')[0]}`);
    }
  }
}
await Promise.all(Array.from({ length: PARALELO }, trabalhador));
await fecharNavegador();
servidor.close();
fs.rmSync(TMP, { recursive: true, force: true });

fs.writeFileSync(DADOS, JSON.stringify(dados, null, 2) + '\n');
console.log(`\n${alvo.length - falhas}/${alvo.length} capturados · data/modelos.json atualizado`);
process.exit(falhas ? 1 : 0);
