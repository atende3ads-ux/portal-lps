# Biblioteca de LPs · 3ADS

Acervo interno com as landing pages que a 3ADS já entregou, organizado por nicho, com prévia no desktop, tablet e celular.

**No ar:** https://atende3ads-ux.github.io/portal-lps/ (uso interno; a página não aparece no Google)

## Como funciona

Cada LP é **copiada** para `modelos/<slug>/` em vez de apontar para o site do cliente. Na cópia:

- só entram os arquivos que as páginas usam;
- GTM, Pixel do Meta, gtag, Clarity, Hotjar e afins são removidos ou bloqueados;
- formulários não enviam, e links de WhatsApp, telefone e e-mail não abrem (aparece um aviso);
- toda página leva `noindex`.

Assim, abrir um modelo não conta visita no Analytics do cliente nem gera lead falso no CRM dele, e o portal não quebra se o repo do cliente mudar.

```
catalogo.json        fonte: a lista de modelos (editar à mão)
data/modelos.json    gerado: catálogo + datas, peso e miniaturas
modelos/<slug>/      gerado: cópia limpa de cada LP
thumbs/              gerado: capturas desktop e celular (WebP)
index.html, assets/  a galeria (HTML, CSS e JS puros, sem build), no visual da página da 3ADS EDU
scripts/             importar, capturar e servir localmente
```

## Adicionar uma LP nova

1. Acrescente um item em `catalogo.json`:

   ```json
   {
     "slug": "nome-curto",
     "nome": "Nome do cliente",
     "repo": "atendimento3ads/lp-do-cliente",
     "nicho": "saude",
     "tipo": "captura",
     "descricao": "Uma frase sobre o que é a LP.",
     "paginas": [
       { "nome": "Principal", "caminho": "index.html" },
       { "nome": "Outra página", "caminho": "outra/index.html" }
     ]
   }
   ```

   Opcionais: `"prototipo": true`, `"tags": ["inglês"]` e `"zip": "deploy.zip"` (quando o site publicado está num zip dentro do repo).
   Nichos e tipos válidos estão no topo do `catalogo.json`; dá para criar novos ali.

2. Importe e capture só esse modelo:

   ```bash
   npm run importar -- nome-curto
   npm run capturar -- nome-curto
   ```

3. Confira localmente com `npm run servir` (abre em http://localhost:4173/portal-lps/), depois faça commit e push. O GitHub Pages publica sozinho.

Para atualizar todos os modelos com a versão mais nova dos repos: `npm run importar -- --atualizar` e depois `npm run capturar`.

A imagem que aparece ao compartilhar o link (`assets/og.jpg`, 1200×630) sai de `scripts/og.html`. Para gerar de novo com a contagem atualizada: `node scripts/gerar-og.mjs`.

## Requisitos

Node 20+, Google Chrome instalado, `cwebp` (`brew install webp`) e `npm install` uma vez (instala o `playwright-core`, que usa o Chrome da máquina).
