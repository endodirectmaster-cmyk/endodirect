// Confere SVGs no Chromium: texto x texto, texto dentro da moldura,
// linhas/contornos x texto, tamanho mínimo de fonte; gera PNG.
// uso: NODE_PATH=$(npm root -g) node check.js out_dir arquivo1.svg [arquivo2.svg ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [outDir, ...files] = process.argv.slice(2);
  const browser = await chromium.launch();
  let totalProblems = 0;
  for (const file of files) {
    const svg = fs.readFileSync(file, 'utf8');
    const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
    const W = +m[1], H = +m[2];
    const page = await browser.newPage({ viewport: { width: W + 40, height: H + 40 }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:20px;background:#1e293b">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const res = await page.evaluate(({ W, H }) => {
      const root = document.querySelector('svg');
      const out = { problems: [], warnings: [], fonts: new Set(), texts: [] };
      const inDefs = el => !!el.closest('defs');
      const tf = (el, x, y) => { const mm = el.getCTM(); return { x: mm.a * x + mm.c * y + mm.e, y: mm.b * x + mm.d * y + mm.f }; };
      // caixas de texto
      const texts = [...root.querySelectorAll('text')].filter(t => !inDefs(t)).map((t, i) => {
        const b = t.getBBox();
        const c = [tf(t, b.x, b.y), tf(t, b.x + b.width, b.y), tf(t, b.x, b.y + b.height), tf(t, b.x + b.width, b.y + b.height)];
        const xs = c.map(p => p.x), ys = c.map(p => p.y);
        const cs = getComputedStyle(t);
        out.fonts.add(cs.fontFamily);
        return { i, s: t.textContent, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys),
                 size: parseFloat(t.getAttribute('font-size')), anchor: t.getAttribute('text-anchor') || 'start',
                 rot: !!t.getAttribute('transform') };
      });
      out.texts = texts.map(t => ({ s: t.s, box: [t.x0, t.y0, t.x1, t.y1].map(v => +v.toFixed(1)) }));
      for (const t of texts) {
        if (!(t.size >= 11)) out.problems.push(`fonte < 11 px: "${t.s}" (${t.size})`);
        if (t.x0 < 8 || t.x1 > W - 8 || t.y0 < 6 || t.y1 > H - 6) out.problems.push(`texto fora/encostado na moldura: "${t.s}" [${t.x0.toFixed(1)},${t.y0.toFixed(1)},${t.x1.toFixed(1)},${t.y1.toFixed(1)}]`);
      }
      const ov = (a, b, padx = 0.5, pady = 0.5) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > padx && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > pady;
      const widen = (t, k) => { const w = (t.x1 - t.x0) * k; if (t.rot) return t;
        if (t.anchor === 'middle') return { ...t, x0: t.x0 - w / 2, x1: t.x1 + w / 2 };
        if (t.anchor === 'end') return { ...t, x0: t.x0 - w };
        return { ...t, x1: t.x1 + w }; };
      for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
        if (ov(texts[a], texts[b])) out.problems.push(`texto sobre texto: "${texts[a].s}" x "${texts[b].s}"`);
        else if (ov(widen(texts[a], 0.08), widen(texts[b], 0.08))) out.warnings.push(`(fonte +8%) texto encosta: "${texts[a].s}" x "${texts[b].s}"`);
      }
      // contornos de todas as formas
      const geo = [...root.querySelectorAll('path,line,polyline,polygon,rect,ellipse,circle')].filter(e => !inDefs(e));
      const frame = geo[0];
      const desc = e => e.tagName + ' ' + ['d', 'x', 'y', 'cx', 'cy', 'x1', 'y1', 'points', 'width'].filter(k => e.hasAttribute(k)).map(k => k + '=' + e.getAttribute(k).slice(0, 40)).join(' ');
      const inside = (p, t, sx, sy) => p.x > t.x0 + sx && p.x < t.x1 - sx && p.y > t.y0 + sy && p.y < t.y1 - sy;
      for (const e of geo) {
        if (e === frame) continue;
        let len = 0; try { len = e.getTotalLength(); } catch (_) { continue; }
        const pts = [];
        const n = Math.max(2, Math.ceil(len / 1));
        for (let k = 0; k <= n; k++) { const p = e.getPointAtLength(len * k / n); pts.push(tf(e, p.x, p.y)); }
        // ponta de seta / barra de inibição
        const mk = e.getAttribute('marker-end');
        if (mk && len > 1) {
          const p1 = e.getPointAtLength(len), p0 = e.getPointAtLength(Math.max(0, len - 1.5));
          let dx = p1.x - p0.x, dy = p1.y - p0.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
          const px = -dy, py = dx;
          if (mk.includes('i-r')) { for (let j = -6; j <= 6; j++) pts.push(tf(e, p1.x + px * j, p1.y + py * j)); }
          else for (let k = 0; k <= 7; k++) for (let j = -4; j <= 4; j++) { const ww = 4 * k / 7; if (Math.abs(j) <= ww) pts.push(tf(e, p1.x - dx * k + px * j, p1.y - dy * k + py * j)); }
        }
        const sw = parseFloat(e.getAttribute('stroke-width') || '0');
        const hasStroke = e.getAttribute('stroke') && e.getAttribute('stroke') !== 'none';
        const half = hasStroke ? sw / 2 : 0;
        for (const p of pts) if (p.x < 1 || p.x > W - 1 || p.y < 1 || p.y > H - 1) { out.problems.push(`forma sai da moldura: ${desc(e)}`); break; }
        for (const t of texts) {
          // margem: 0,5 px na horizontal, 1,5 px em cima e embaixo (espaço da ascendente/descendente)
          const hit = pts.find(p => inside(p, { x0: t.x0 - half, x1: t.x1 + half, y0: t.y0 - half, y1: t.y1 + half }, 0.5, 1.5));
          if (hit) out.problems.push(`linha/contorno corta texto "${t.s}": ${desc(e)} em (${hit.x.toFixed(1)},${hit.y.toFixed(1)})`);
          else {
            const wt = widen(t, 0.08);
            const hit2 = pts.find(p => inside(p, { x0: wt.x0 - half, x1: wt.x1 + half, y0: wt.y0 - half, y1: wt.y1 + half }, 0.5, 1.5));
            if (hit2) out.warnings.push(`(fonte +8%) contorno encosta em "${t.s}": ${desc(e)}`);
          }
        }
      }
      out.fonts = [...out.fonts];
      return out;
    }, { W, H });
    // fonte efetivamente usada
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const doc = await cdp.send('DOM.getDocument', { depth: -1 });
    const q = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'svg text' });
    const pf = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: q.nodeId });
    const base = path.basename(file, '.svg');
    await page.locator('svg').screenshot({ path: path.join(outDir, base + '.png') });
    fs.writeFileSync(path.join(outDir, base + '.boxes.json'), JSON.stringify(res.texts, null, 1));
    console.log(`\n== ${base}  (${W}x${H})  fonte usada: ${pf.fonts.map(x => x.familyName).join(', ')}`);
    console.log(`   ${res.texts.length} textos; problemas: ${res.problems.length}; avisos: ${res.warnings.length}`);
    res.problems.forEach(p => console.log('   ERRO  ' + p));
    res.warnings.forEach(p => console.log('   aviso ' + p));
    totalProblems += res.problems.length;
    await page.close();
  }
  await browser.close();
  console.log(`\nTOTAL de problemas: ${totalProblems}`);
})();
