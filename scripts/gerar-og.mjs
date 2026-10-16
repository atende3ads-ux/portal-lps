#!/usr/bin/env node
// Gera assets/og.jpg (1200×630), a imagem que aparece ao compartilhar o link do portal.
// Rode de novo quando o acervo mudar:  node scripts/gerar-og.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servir } from './servir.mjs';
import { navegador, fecharNavegador } from './navegador.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = await servir(0);
const nav = await navegador();
const ctx = await nav.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${srv.address().port}/portal-lps/scripts/og.html`, { waitUntil: 'load' });
await page.waitForSelector('body[data-pronto="1"]', { timeout: 30000 });
await page.waitForTimeout(300);
const saida = path.join(RAIZ, 'assets', 'og.jpg');
await page.locator('#og').screenshot({ path: saida, type: 'jpeg', quality: 88 });
console.log('✓ assets/og.jpg');
await fecharNavegador();
srv.close();
process.exit(0);
