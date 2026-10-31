'use strict';
// Conferência no Chromium (Playwright): mede o texto de verdade (getBBox) e acusa
//  - texto ✕ texto (caixas que se cruzam);
//  - traço (seta, linha, contorno) cortando texto: amostra cada traço a cada 2 px;
//  - forma preenchida desenhada DEPOIS do texto e por cima dele (texto coberto);
//  - qualquer elemento fora da moldura (retângulo branco de rx 16);
//  - fonte menor que 11 px.
// Grava um PNG (2×) de cada SVG.
// Uso: NODE_PATH=$(npm root -g) node confere.js [--largo] arq1.svg ...
//   --largo: troca a fonte por DejaVu Sans (mais larga) como teste de folga.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const OUT = __dirname;
const args = process.argv.slice(2);
const largo = args.includes('--largo');
const arqs = args.filter((a) => !a.startsWith('--'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
  let ruins = 0;
  for (const arq of arqs) {
    let svg = fs.readFileSync(arq, 'utf8');
    if (largo) svg = svg.replace(/font-family="[^"]*"/g, 'font-family="DejaVu Sans"');
    const nome = path.basename(arq, '.svg');
    await p.setContent('<html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff"><div id="w" style="display:inline-block">' + svg + '</div></body></html>');
    const r = await p.evaluate(() => {
      const s = document.querySelector('svg');
      const vb = s.viewBox.baseVal;
      const todos = [...s.querySelectorAll('*')].filter((e) => !e.closest('defs') && !['title', 'defs', 'marker', 'g'].includes(e.tagName));
      const ordem = new Map(todos.map((e, i) => [e, i]));
      const moldura = [...s.querySelectorAll('rect')].find((e) => e.getAttribute('rx') === '16' && e.getAttribute('stroke') === '#e2e8f0');
      const M = moldura.getBBox();
      const caixa = (e) => { const bb = e.getBBox(); const m = e.getCTM(), sm = s.getCTM().inverse().multiply(m);
        const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => { const q = s.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(sm); });
        const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
        return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }; };
      const txt = [...s.querySelectorAll('text')].map((t) => ({ el: t, t: t.textContent.slice(0, 44), fs: parseFloat(t.getAttribute('font-size')), ...caixa(t) }));
      const ach = [];
      // fonte mínima
      txt.forEach((t) => { if (t.fs < 11) ach.push('fonte ' + t.fs + ' px: "' + t.t + '"'); });
      // texto ✕ texto
      for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
        const a = txt[i], c = txt[j];
        const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        if (ox > 0.5 && oy > 0.5) ach.push('texto ✕ texto: "' + a.t + '" ✕ "' + c.t + '" (' + ox.toFixed(1) + '×' + oy.toFixed(1) + ')');
      }
      // traço cortando texto (a caixa do texto encolhida 1 px; a moldura fica de fora)
      const tracos = todos.filter((e) => ['path', 'line', 'rect', 'polygon', 'circle', 'ellipse', 'polyline'].includes(e.tagName) && e !== moldura && e.getAttribute('stroke') && e.getAttribute('stroke') !== 'none');
      for (const el of tracos) {
        let Ltot = 0; try { Ltot = el.getTotalLength(); } catch (e) { continue; }
        if (!Ltot) continue;
        const sw = parseFloat(el.getAttribute('stroke-width') || 1) / 2;
        const sm = s.getCTM().inverse().multiply(el.getCTM());
        for (let d = 0; d <= Ltot; d += 2) {
          const q0 = el.getPointAtLength(d); const q = s.createSVGPoint(); q.x = q0.x; q.y = q0.y; const pt = q.matrixTransform(sm);
          for (const t of txt) {
            if (pt.x > t.x - sw + 1 && pt.x < t.x + t.w + sw - 1 && pt.y > t.y - sw + 1 && pt.y < t.y + t.h + sw - 1) {
              const m = 'traço ✕ texto: "' + t.t + '" (' + el.tagName + ' ' + (el.getAttribute('d') || '').slice(0, 30) + ')';
              if (!ach.includes(m)) ach.push(m);
            }
          }
        }
      }
      // forma preenchida desenhada por cima do texto
      const cheios = todos.filter((e) => ['path', 'rect', 'polygon', 'circle', 'ellipse'].includes(e.tagName) && e.getAttribute('fill') && e.getAttribute('fill') !== 'none' && e !== moldura);
      for (const t of txt) for (const f of cheios) {
        if (ordem.get(f) < ordem.get(t.el)) continue;
        const c = caixa(f);
        const ox = Math.min(t.x + t.w, c.x + c.w) - Math.max(t.x, c.x), oy = Math.min(t.y + t.h, c.y + c.h) - Math.max(t.y, c.y);
        if (ox > 1 && oy > 1) ach.push('forma por cima do texto: "' + t.t + '" (' + f.tagName + ')');
      }
      // tudo dentro da moldura (margem: 2 px além do contorno)
      const fora = [];
      for (const e of todos) {
        if (e === moldura || ['tspan'].includes(e.tagName)) continue;
        let c; try { c = caixa(e); } catch (er) { continue; }
        if (!c.w && !c.h) continue;
        if (c.x < M.x + 2 || c.y < M.y + 2 || c.x + c.w > M.x + M.width - 2 || c.y + c.h > M.y + M.height - 2) fora.push(e.tagName + (e.tagName === 'text' ? ' "' + e.textContent.slice(0, 30) + '"' : '') + ' [' + c.x.toFixed(0) + ',' + c.y.toFixed(0) + ' ' + c.w.toFixed(0) + '×' + c.h.toFixed(0) + ']');
      }
      fora.forEach((f) => ach.push('fora da moldura: ' + f));
      // folga até a borda do conteúdo (para ajustar a altura)
      const base = Math.max(...todos.filter((e) => e !== moldura).map((e) => { try { const c = caixa(e); return c.y + c.h; } catch (er) { return 0; } }));
      const temRole = s.getAttribute('role') === 'img' && !!s.getAttribute('aria-label') && !!s.querySelector('title');
      if (!temRole) ach.push('falta role/aria-label/title');
      return { ach, n: txt.length, W: vb.width, H: vb.height, base: base.toFixed(1), minFs: Math.min(...txt.map((t) => t.fs)) };
    });
    const ok = !r.ach.length;
    if (!ok) ruins++;
    console.log((ok ? '✓ ' : '✗ ') + nome + (largo ? ' [DejaVu]' : '') + ' — ' + r.n + ' textos, ' + r.W + '×' + r.H + ', menor fonte ' + r.minFs + ' px, último elemento em y=' + r.base);
    r.ach.forEach((a) => console.log('    ⚠ ' + a));
    if (!largo) await p.locator('svg').first().screenshot({ path: path.join(OUT, nome + '.png') });
  }
  await b.close();
  process.exit(ruins ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
