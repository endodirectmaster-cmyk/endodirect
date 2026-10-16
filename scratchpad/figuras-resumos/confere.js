'use strict';
// CONFERÊNCIA DAS FIGURAS EM CHROMIUM: mede o texto de verdade (getBBox) e acusa
// texto sobreposto, texto cortado por traço ou borda (estouro da caixa) e texto
// fora da área; grava um PNG por figura para a revisão a olho. A figura é
// colocada dentro do cartão do app, com o CSS real, como na tela do aluno.
// Uso: PLAYWRIGHT_CORE=… node confere.js --png <pasta> arq1.svg arq2.svg …
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const args = process.argv.slice(2);
let pngDir = null; const arqs = [];
for (let i = 0; i < args.length; i++) { if (args[i] === '--png') pngDir = args[++i]; else arqs.push(args[i]); }
(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 2 });
  let problemas = 0;
  for (const arq of arqs) {
    const svg = fs.readFileSync(arq, 'utf8');
    const nome = path.basename(arq, '.svg');
    await p.setContent('<html data-theme="dark"><head><meta charset="utf-8"><style>' + css + '</style></head><body style="margin:0"><div style="width:940px;margin:16px auto"><div class="dir-card" style="width:100%;padding:16px"><figure class="dir-fig" style="margin:.7rem 0"><div style="text-align:center;overflow-x:auto;margin:.35rem 0">' + svg + '</div></figure></div></div></body></html>');
    const r = await p.evaluate(() => {
      const s = document.querySelector('svg');
      const vb = s.viewBox.baseVal;
      const txt = [...s.querySelectorAll('text')].map((t) => { const bb = t.getBBox(); return { t: t.textContent.slice(0, 40), x: bb.x, y: bb.y, w: bb.width, h: bb.height, lbl: t.classList.contains('lbl'), rot: t.classList.contains('rot') }; });
      const choques = [];
      for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
        const a = txt[i], c = txt[j];
        const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        if (ox > 2 && oy > 2) choques.push('texto ✕ texto: "' + a.t + '" ✕ "' + c.t + '"');
      }
      // traço (seta, linha, borda de caixa) atravessando texto: amostra ao longo do comprimento
      const tracos = [...s.querySelectorAll('path[stroke], line, rect[stroke], polygon[stroke], circle[stroke]')];
      for (const el of tracos) {
        let L = 0; try { L = el.getTotalLength(); } catch (e) { continue; }
        if (!L) continue;
        const stroke = el.getAttribute('stroke');
        if (stroke === '#e2e8f0' && el.tagName === 'rect' && parseFloat(el.getAttribute('rx') || 0) >= 16) continue; // moldura do cartão
        if (stroke === '#eef2f7') continue; // grade do gráfico
        for (let d = 0; d <= L; d += 3) {
          let pt; try { pt = el.getPointAtLength(d); } catch (e) { break; }
          for (const t of txt) {
            if (t.lbl && el.tagName !== 'rect' && el.tagName !== 'polygon') continue; // rótulo de seta senta sobre a seta de propósito
            if (pt.x > t.x + 1 && pt.x < t.x + t.w - 1 && pt.y > t.y + 1 && pt.y < t.y + t.h - 1) {
              const marca = 'traço ✕ "' + t.t + '" (' + el.tagName + ')';
              if (!choques.includes(marca)) choques.push(marca);
            }
          }
        }
      }
      const fora = txt.filter((t) => !t.rot).filter((t) => t.x < 2 || t.y < 2 || t.x + t.w > vb.width - 2 || t.y + t.h > vb.height - 2).map((t) => '"' + t.t + '"');
      return { choques, fora, n: txt.length, w: vb.width, h: vb.height };
    });
    const ok = !r.choques.length && !r.fora.length;
    if (!ok) problemas++;
    console.log((ok ? '✓ ' : '✗ ') + nome + ' (' + r.n + ' textos, ' + r.w + '×' + r.h + ')');
    r.choques.forEach((c) => console.log('    ⚠ ' + c));
    r.fora.forEach((c) => console.log('    ⚠ fora da área: ' + c));
    if (pngDir) await p.locator('figure.dir-fig').screenshot({ path: path.join(pngDir, nome + '.png') });
  }
  await b.close();
  process.exit(problemas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
