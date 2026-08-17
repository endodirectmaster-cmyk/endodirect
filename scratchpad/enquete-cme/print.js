// Print da enquete de Educação Médica Continuada, em Chromium real.
//
// ⚠️ NÃO É MOCKUP. O CSS e a função vêm do `index.html` de verdade — os mesmos
// `<style>` e o mesmo `renderEnqueteCme()` que o aluno executa. Se eu desenhasse
// um HTML parecido à mão, o print mostraria o que eu ACHO que ficou, não o que
// ficou; e o professor decidiria em cima da minha imaginação.
//
// Uso:
//   PLAYWRIGHT_CORE=/tmp/pw/node_modules/playwright-core node scratchpad/enquete-cme/print.js
'use strict';
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const SAIDA = path.join(__dirname);

// 1. TODO o CSS do app (são vários <style>): pega variáveis de tema, .card, .btn,
//    input e as regras .cme-chip de uma vez.
const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
// 2. O bloco de script que contém a função — o mesmo que o teste extrai.
const bloco = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1]).find((s) => s.includes('function renderEnqueteCme'));
if (!bloco) { console.error('não achei renderEnqueteCme no index.html'); process.exit(1); }
const corpo = bloco.replace(/^\s*\(function\(\)\{\s*/, '').replace(/^\s*['"]use strict['"];\s*/, '').replace(/\}\)\(\);?\s*$/, '');

const PW = process.env.PLAYWRIGHT_CORE || 'playwright-core';
const { chromium } = require(PW);

const CENAS = [
  { arq: 'enquete-1-vazia',     titulo: 'como o aluno Gold encontra',      voto: null, cliques: [] },
  { arq: 'enquete-2-escolhendo', titulo: 'com 3 marcados (teto atingido)', voto: null, cliques: ['Diabetes', 'Tireoide', 'Obesidade'] },
  { arq: 'enquete-3-confirmada', titulo: 'depois de enviar',               voto: { temas: ['Diabetes', 'Tireoide', 'Obesidade'], outro: 'Manejo do incidentaloma adrenal', em: 1 }, cliques: [] },
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const tema of ['dark', 'light']) {
    for (const cena of CENAS) {
      const page = await browser.newPage({ viewport: { width: 780, height: 620 }, deviceScaleFactor: 2 });
      await page.setContent('<!doctype html><html' + (tema === 'light' ? ' data-theme="light"' : '') + '>'
        + '<head><meta charset="utf-8"><style>' + css + '</style>'
        + '<style>body{background:var(--bg);padding:22px;font-family:var(--font)}</style></head>'
        + '<body><div id="cme-card"></div></body></html>', { waitUntil: 'load' });
      // roda o MESMO código do app
      await page.addScriptTag({ content: corpo }).catch(() => {});
      await page.evaluate(({ voto, cliques }) => {
        window.userAcessos = ['plano:gold'];
        window.DB = { enqueteCme: voto };
        window.persist = function () {};
        window.cmeSel = null; window.cmeEditando = false; window.cmeOutroRascunho = '';
        renderEnqueteCme();
        cliques.forEach((t) => {
          const b = document.querySelector('[data-cme-tema="' + t + '"]');
          if (b) b.click();
        });
        if (cliques.length) {
          const cx = document.getElementById('cme-outro');
          if (cx) cx.value = 'Manejo do incidentaloma adrenal';
        }
      }, { voto: cena.voto, cliques: cena.cliques });
      const el = await page.$('#cme-card');
      const nome = cena.arq + '-' + tema + '.png';
      await el.screenshot({ path: path.join(SAIDA, nome) });
      const n = await page.evaluate(() => document.querySelectorAll('[data-cme-tema]').length);
      const marcados = await page.evaluate(() => document.querySelectorAll('.cme-chip.on').length);
      console.log('✓ ' + nome.padEnd(34) + ' chips=' + n + ' marcados=' + marcados + '  (' + cena.titulo + ')');
      await page.close();
    }
  }
  await browser.close();
})();
