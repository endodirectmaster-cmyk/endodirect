// Story 1080×1920 do painel "Desempenho" com dados SIMULADOS, para divulgação.
// A tela é reproduzida fielmente a partir de renderDesempenho() no index.html:
// KPIs → 🎯 Onde focar → Acerto por subespecialidade → Atividade (14 dias).
// Paleta e componentes copiados das variáveis reais do app (linhas 106-116).
//
// ⚠️ Os números são FICTÍCIOS — é peça de divulgação do recurso, não resultado de
// aluno real. As subespecialidades são as 14 que existem de fato na base.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/tmp/pw/node_modules/playwright-core');

const RAIZ = path.join(__dirname, '..', '..');
const logo = fs.readFileSync(path.join(RAIZ, 'logo.png.png')).toString('base64');

// ── Paleta real do app (index.html, tema escuro) ──
const C = {
  bg: '#0b1325', surface: '#16233f', s2: '#1c2a48',
  bd: '#283864', bd2: '#34467a',
  tx: '#e9eef8', t2: '#a7b2c6', t3: '#7b8aa4',
  blue: '#3b6fd4', blue2: '#5585e8',
  grn: '#34d399', red: '#f87171', gold: '#f5b32c', pur: '#a78bfa',
};

// ── Dados simulados ──
const KPIS = [
  { label: 'Acerto geral', val: '78%', col: C.grn },   // >=70 → verde
  { label: 'Respondidas', val: '1.247', col: C.blue },
  { label: 'Ofensiva', val: '23 dias 🔥', col: C.gold },
  { label: 'Hoje', val: '40', col: C.pur },
];

const FOCO = [
  { tema: 'Hipoglicemia no DM1', sub: 'Diabetes', q: 12, pct: 42 },
  { tema: 'Hiperplasia adrenal congênita', sub: 'Adrenal', q: 8, pct: 48 },
  { tema: 'Raquitismo hipofosfatêmico', sub: 'Osteometabolismo', q: 9, pct: 53 },
  { tema: 'Amenorreia secundária', sub: 'Endocrinologia Feminina', q: 12, pct: 58 },
  { tema: 'Nódulo tireoidiano (Bethesda)', sub: 'Tireoide', q: 14, pct: 61 },
];

const SUBS = [
  { sub: 'Obesidade', pct: 91 }, { sub: 'Tireoide', pct: 86 },
  { sub: 'Diabetes', pct: 83 }, { sub: 'Lípides', pct: 79 },
  { sub: 'Neuroendocrinologia', pct: 74 }, { sub: 'Osteometabolismo', pct: 71 },
  { sub: 'Endocrinologia Feminina', pct: 66 }, { sub: 'Adrenal', pct: 58 },
  { sub: 'Endocrinologia Pediátrica', pct: 54 },
];

const ATIV = [12, 28, 0, 35, 41, 22, 18, 44, 31, 0, 26, 38, 47, 40];

// Regras de cor idênticas às do renderDesempenho()
const corFoco = (p) => (p >= 70 ? C.grn : p >= 50 ? C.gold : C.red);
const corSub = (p) => (p >= 80 ? C.grn : p >= 60 ? C.blue : C.red);

const maxAtiv = Math.max(...ATIV) || 1;

// ⚠️ ÁREA SEGURA DO STORY. O Instagram desenha a barra de perfil no TOPO e o campo
// "Enviar mensagem" embaixo; qualquer coisa fora da faixa central fica encoberta.
// O conteúdo vive entre y=210 e y=1730 — o resto é respiro proposital.
const html = `<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1920px;background:${C.bg};color:${C.tx};
       font-family:'Segoe UI',system-ui,sans-serif}
  #safe{position:absolute;top:210px;left:56px;right:56px;height:1520px;
        display:flex;flex-direction:column}
  .card{background:${C.surface};border:1px solid ${C.bd};border-radius:22px;padding:26px 30px}
  .ttl{font-weight:700;font-size:31px;margin-bottom:18px}
</style>
<div id="safe">

<!-- marca -->
<div style="display:flex;align-items:center;gap:18px;margin-bottom:34px">
  <img src="data:image/png;base64,${logo}" style="height:64px">
  <div style="font-size:35px;font-weight:800;letter-spacing:-.02em">Endodirect</div>
</div>

<!-- cabeçalho da tela -->
<div style="margin-bottom:28px">
  <div style="font-size:54px;font-weight:800;letter-spacing:-.02em">📈 Desempenho</div>
  <div style="font-size:27px;color:${C.t2};margin-top:8px">
    Sua evolução por subespecialidade e tema — e onde focar.</div>
</div>

<!-- KPIs -->
<div style="display:flex;gap:16px;margin-bottom:22px">
  ${KPIS.map((k) => `<div class="card" style="flex:1;padding:20px 18px">
    <div style="font-size:17px;text-transform:uppercase;letter-spacing:.05em;color:${C.t3};white-space:nowrap">${k.label}</div>
    <div style="font-size:38px;font-weight:800;color:${k.col};margin-top:6px;white-space:nowrap">${k.val}</div>
  </div>`).join('')}
</div>

<!-- Onde focar -->
<div class="card" style="margin-bottom:22px">
  <div class="ttl">🎯 Onde focar</div>
  ${FOCO.map((w) => `<div style="display:flex;align-items:center;gap:14px;margin:13px 0">
    <span style="flex:1;font-size:25px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.tema}<span style="color:${C.t3}"> · ${w.sub}</span></span>
    <span style="font-size:21px;color:${C.t3}">${w.q}q</span>
    <span style="font-weight:700;font-size:27px;color:${corFoco(w.pct)};min-width:78px;text-align:right">${w.pct}%</span>
  </div>`).join('')}
  <div style="font-size:20px;color:${C.t3};margin-top:16px">
    Temas com mais erros (mín. 4 questões). Comece por eles.</div>
</div>

<!-- Acerto por subespecialidade -->
<div class="card" style="margin-bottom:22px">
  <div class="ttl">Acerto por subespecialidade</div>
  ${SUBS.map((r) => `<div style="display:flex;align-items:center;gap:18px;margin-bottom:12px">
    <div style="font-size:24px;min-width:290px;white-space:nowrap">${r.sub}</div>
    <div style="flex:1;height:14px;background:${C.bd};border-radius:99px;overflow:hidden">
      <div style="height:100%;width:${r.pct}%;background:${corSub(r.pct)};border-radius:99px"></div></div>
    <div style="font-size:23px;font-weight:600;min-width:62px;text-align:right">${r.pct}%</div>
  </div>`).join('')}
</div>

<!-- Atividade -->
<div class="card">
  <div class="ttl">Atividade (14 dias)</div>
  <div style="display:flex;align-items:flex-end;gap:9px;height:100px">
    ${ATIV.map((n) => {
      const h = n ? Math.max(15, Math.round((n / maxAtiv) * 94)) : 6;
      return `<div style="flex:1;height:${h}px;background:${n ? C.blue : C.bd};border-radius:6px 6px 0 0"></div>`;
    }).join('')}
  </div>
  <div style="display:flex;justify-content:space-between;font-size:19px;color:${C.t3};margin-top:10px">
    <span>14 dias atrás</span><span>hoje</span></div>
</div>

<div style="margin-top:auto;padding-top:20px;text-align:center;font-size:24px;color:${C.t3}">
  endodirect.com.br</div>
</div>`;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Guarda: nada pode transbordar a área segura, senão o Instagram corta.
  const fim = await page.evaluate(() => {
    const s = document.getElementById('safe');
    const filhos = [...s.children];
    const ultimo = filhos[filhos.length - 1].getBoundingClientRect();
    return { base: Math.round(ultimo.bottom), limite: Math.round(s.getBoundingClientRect().bottom) };
  });
  console.log('último elemento termina em y=%d; limite da área segura y=%d', fim.base, fim.limite);
  if (fim.base > fim.limite) throw new Error('⚠️ conteúdo transborda a área segura em ' + (fim.base - fim.limite) + 'px');

  const out = path.join(__dirname, 'desempenho-story.png');
  await page.screenshot({ path: out });
  await browser.close();
  console.log('gerado:', out);
})();
