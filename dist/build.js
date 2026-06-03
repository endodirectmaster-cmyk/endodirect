#!/usr/bin/env node
/**
 * Gera o artefato publicável standalone do Endodirect.
 *
 * Lê o index.html da raiz do projeto e embute o logo (logo.png.png) como
 * data-URI base64, produzindo um único arquivo (dist/endodirect.html) sem
 * dependências de arquivos locais — pronto para hospedar em qualquer lugar
 * (Vercel, GitHub Pages, Netlify, S3) ou abrir direto no navegador.
 *
 * Uso:  node dist/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_HTML = path.join(ROOT, 'index.html');
const LOGO = path.join(ROOT, 'logo.png.png');
const OUT = path.join(__dirname, 'endodirect.html');

function build() {
  const html = fs.readFileSync(SRC_HTML, 'utf8');
  const b64 = fs.readFileSync(LOGO).toString('base64');
  const dataUri = 'data:image/png;base64,' + b64;

  const replaced = (html.match(/logo\.png\.png/g) || []).length;
  const out = html.split('logo.png.png').join(dataUri);
  const remaining = (out.match(/logo\.png\.png/g) || []).length;

  if (remaining !== 0) {
    throw new Error('Restaram referencias locais ao logo: ' + remaining);
  }

  fs.writeFileSync(OUT, out);
  console.log('OK  ->', path.relative(ROOT, OUT));
  console.log('     logo embutido em', replaced, 'referencia(s)');
  console.log('     tamanho:', (out.length / 1024).toFixed(0) + ' KB');
}

build();
