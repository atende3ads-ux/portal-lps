#!/usr/bin/env node
// Servidor local que imita o GitHub Pages: o portal fica em http://localhost:4173/portal-lps/
//   node scripts/servir.mjs [porta]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = JSON.parse(fs.readFileSync(path.join(RAIZ, 'catalogo.json'), 'utf8')).base;

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml',
};

function achar(p) {
  const tentativas = [p, path.join(p, 'index.html'), p + '.html'];
  for (const t of tentativas) {
    try { if (fs.statSync(t).isFile()) return t; } catch {}
  }
  return null;
}

export function servir(porta = 4173) {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/' || url === BASE.slice(0, -1)) { res.writeHead(302, { Location: BASE }); return res.end(); }
    if (!url.startsWith(BASE)) { res.writeHead(404); return res.end('404'); }
    const alvo = path.normalize(path.join(RAIZ, url.slice(BASE.length)));
    if (!alvo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
    const arq = achar(alvo);
    if (!arq) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
    const tam = fs.statSync(arq).size;
    const tipo = TIPOS[path.extname(arq).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const ini = range[1] ? +range[1] : 0;
      const fim = range[2] ? +range[2] : tam - 1;
      res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${ini}-${fim}/${tam}`, 'Accept-Ranges': 'bytes', 'Content-Length': fim - ini + 1 });
      return fs.createReadStream(arq, { start: ini, end: fim }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': tam, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    fs.createReadStream(arq).pipe(res);
  });
  return new Promise((ok) => srv.listen(porta, '127.0.0.1', () => ok(srv)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const porta = +process.argv[2] || 4173;
  await servir(porta);
  console.log(`Portal em http://localhost:${porta}${BASE}`);
}
