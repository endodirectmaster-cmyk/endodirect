// Story 1080×1920 do painel "Desempenho" com dados SIMULADOS, para divulgação.
// A tela é reproduzida fielmente a partir de renderDesempenho() no index.html:
// KPIs → 🎯 Onde focar → Acerto por subespecialidade → Atividade (14 dias).
// Paleta e componentes copiados das variáveis reais do app (linhas 106-116).
//
// ⚠️ Os números são FICTÍCIOS — é peça de divulgação do recurso, não resultado de
// aluno real. As subespecialidades são as 14 que existem de fato na base.
const path = require('path');
const { C, marca, renderStory } = require('./base');

// ── Dados simulados ──
// ⚠️ Os quatro KPIs e o gráfico de atividade NÃO são independentes no app real:
//   • `Hoje` é act[hoje], que é exatamente a ÚLTIMA barra da atividade;
//   • `Ofensiva` vem de computeStreak(), que PARA no primeiro dia com zero — logo
//     uma ofensiva de 23 dias exige as 14 barras todas > 0;
//   • `Respondidas` é o total histórico, então tem de ser MAIOR que a soma das
//     14 barras (que são só a ponta recente desse histórico).
// A guarda no fim do arquivo verifica as três coisas.
const RESPONDIDAS = 323;
const HOJE = 25;
const OFENSIVA = 23;

const KPIS = [
  { label: 'Acerto geral', val: '78%', col: C.grn },   // >=70 → verde
  { label: 'Respondidas', val: RESPONDIDAS.toLocaleString('pt-BR'), col: C.blue },
  { label: 'Ofensiva', val: OFENSIVA + ' dias 🔥', col: C.gold },
  { label: 'Hoje', val: String(HOJE), col: C.pur },
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

// Nenhum zero (a ofensiva de 23 dias morreria no primeiro) e a última barra é HOJE.
const ATIV = [9, 15, 8, 19, 12, 24, 14, 11, 27, 17, 7, 21, 15, HOJE];

// Regras de cor idênticas às do renderDesempenho()
const corFoco = (p) => (p >= 70 ? C.grn : p >= 50 ? C.gold : C.red);
const corSub = (p) => (p >= 80 ? C.grn : p >= 60 ? C.blue : C.red);

const maxAtiv = Math.max(...ATIV) || 1;

// ── Guarda de coerência dos dados simulados ──
// Número inventado que contradiz outro número inventado é o jeito mais fácil de o
// print perder credibilidade. Estes três casos já aconteceram nesta peça.
(function coerencia() {
  const somaAtiv = ATIV.reduce((a, b) => a + b, 0);
  const erros = [];
  if (ATIV[ATIV.length - 1] !== HOJE)
    erros.push(`a última barra da atividade (${ATIV[ATIV.length - 1]}) tem de ser igual a "Hoje" (${HOJE})`);
  if (OFENSIVA > ATIV.length && ATIV.some((n) => n === 0))
    erros.push(`ofensiva de ${OFENSIVA} dias é impossível com dia zerado nas últimas ${ATIV.length} barras`);
  if (somaAtiv >= RESPONDIDAS)
    erros.push(`as 14 barras somam ${somaAtiv}, que não cabe no total histórico de ${RESPONDIDAS} respondidas`);
  const minFoco = FOCO.reduce((a, w) => a + w.q, 0);
  if (minFoco > RESPONDIDAS)
    erros.push(`os temas de "Onde focar" somam ${minFoco} questões, mais que o total de ${RESPONDIDAS}`);
  if (erros.length) { console.error('✗ dados incoerentes:'); erros.forEach((e) => console.error('  - ' + e)); process.exit(1); }
  console.log('✓ coerência: hoje=%d bate com a última barra; 14 dias somam %d de %d respondidas; ofensiva de %d dias sem zeros',
    HOJE, somaAtiv, RESPONDIDAS, OFENSIVA);
})();

const corpo = `
${marca()}

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
  endodirect.com.br</div>`;

renderStory({ corpo, saida: path.join(__dirname, 'desempenho-story.png') })
  .catch((e) => { console.error(e.message); process.exit(1); });
