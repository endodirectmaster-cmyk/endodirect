#!/usr/bin/env node
/* Medidor de consumo da janela de 5 horas — o freio dos 85%.
 *
 * POR QUE ISTO EXISTE (08/08/2026). O professor pediu: rodar a força máxima e
 * RECUAR ao chegar perto de 85% do consumo, voltando a todo vapor quando a janela
 * resetar. Só que **eu não enxergo esse percentual**: ele aparece no painel da
 * interface dele, não na minha sessão. Sem medir, "recuar aos 85%" vira palpite —
 * e o palpite já falhou uma vez, custando 4 agentes mortos no meio do trabalho.
 *
 * O que eu SEI medir: cada agente, ao terminar, relata `subagent_tokens` na
 * notificação. Isso é medição real, não estimativa. Este script acumula esses
 * números dentro da janela corrente e aplica o freio.
 *
 * ⚠️ O TETO É CALIBRADO, NÃO OFICIAL. Ninguém me diz quantos tokens cabem na
 * janela. O número abaixo vem da única observação que tenho: a janela estourou
 * com 8 agentes rodando quando o painel marcava 92%, somando ~2,0 M de tokens de
 * agente. Então 2,0 M ≈ 100%. É um teto grosseiro e deliberadamente
 * CONSERVADOR — errar para baixo custa uma pausa; errar para cima mata agentes no
 * meio do trabalho e perde tudo o que eles gastaram.
 *
 * Recalibre quando houver observação melhor: se a janela estourar de novo, anote
 * o total acumulado no momento e ajuste TETO.
 *
 * Uso:
 *   node scripts/orcamento-agentes.js                    → estado e veredito
 *   node scripts/orcamento-agentes.js --soma 253751      → registra um agente
 *   node scripts/orcamento-agentes.js --estimado 270000 → agente que NÃO relatou (ver abaixo)
 *   node scripts/orcamento-agentes.js --reset            → nova janela (após o reset)
 *   node scripts/orcamento-agentes.js --reset-em "2026-08-08T07:00:00Z"
 */
const fs = require('fs');
const path = require('path');

const ARQ = path.join(__dirname, '..', 'scratchpad', 'orcamento-agentes.json');
const TETO = 2000000;    // tokens de agente por janela — calibrado, ver acima
const FREIO = 0.85;      // o professor pediu recuo aos 85%
const JANELA_H = 5;

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? (process.argv[i + 1] || true) : null; };

function ler() {
  if (!fs.existsSync(ARQ)) return null;
  try { return JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch (e) { return null; }
}
function gravar(d) {
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.writeFileSync(ARQ, JSON.stringify(d, null, 1) + '\n');
}

let d = ler();
const agora = Date.now();

// ⚠️ A janela vira sozinha depois de 5 h. Sem isto, o freio ficaria travado para
// sempre e eu pararia de trabalhar sem motivo — falha na direção oposta, mas
// falha do mesmo jeito.
if (d && agora - new Date(d.inicio).getTime() > JANELA_H * 3600 * 1000) d = null;

if (process.argv.includes('--reset') || !d) {
  const inicio = arg('--reset-em') && arg('--reset-em') !== true ? new Date(arg('--reset-em')).toISOString() : new Date(agora).toISOString();
  d = { inicio, tokens: 0, agentes: 0 };
  gravar(d);
}

const soma = arg('--soma');
if (soma && soma !== true) {
  d.tokens += parseInt(soma, 10) || 0;
  d.agentes += 1;
  gravar(d);
}

// ⚠️ AGENTE QUE TERMINA E NÃO RELATA (08/08/2026). O extrator da cirurgia
// bariátrica gravou o extrato inteiro — 138 fatos, todos com citação — e
// **morreu sem mandar a notificação**. `ListAgents` não o via mais, e o
// `subagent_tokens` dele nunca chegou.
//
// O efeito é o pior possível para um medidor de freio: ele **subconta**. Um
// agente inteiro (~14% da janela) sumia da soma, e o script daria luz verde
// para lançar outro em cima de capacidade que não existe. É a mesma doença das
// peneiras cegas — selo verde sobre dado incompleto.
//
// Daí `--estimado`: registra o gasto de um agente que não relatou, SEPARADO do
// medido, para que a calibração do TETO continue limpa (ela depende só de
// número real) enquanto a segurança usa a soma dos dois. Estimativa entra pela
// média observada, e o script diz quanto do total é chute.
const est = arg('--estimado');
if (est) {
  const n = est !== true ? (parseInt(est, 10) || 0) : 250000;
  d.estimado = (d.estimado || 0) + n;
  d.agentesEstimados = (d.agentesEstimados || 0) + 1;
  gravar(d);
}

const totalTokens = d.tokens + (d.estimado || 0);
const pct = totalTokens / TETO;
const decorrido = (agora - new Date(d.inicio).getTime()) / 3600000;
const restante = Math.max(0, JANELA_H - decorrido);
const fmt = (n) => (n / 1000).toFixed(0) + 'k';

console.log(`JANELA DE ${JANELA_H} h — começou ${d.inicio.slice(11, 16)} UTC, restam ${restante.toFixed(1)} h`);
console.log(`  ${d.agentes} agente(s) relatado(s) · ${fmt(d.tokens)} MEDIDO · ${((d.tokens / TETO) * 100).toFixed(0)}%`);
if (d.estimado) {
  console.log(`  + ${d.agentesEstimados} agente(s) que NÃO relataram · ${fmt(d.estimado)} ESTIMADO`);
}
console.log(`  = ${fmt(totalTokens)} de ~${fmt(TETO)} · ${(pct * 100).toFixed(0)}%${d.estimado ? ` (${((d.estimado / totalTokens) * 100).toFixed(0)}% disso é estimativa)` : ''}`);
console.log(`  (teto CALIBRADO, não oficial — ver o cabeçalho do script)`);

if (pct >= FREIO) {
  console.log(`\n⛔ FREIO: ${(pct * 100).toFixed(0)}% ≥ ${FREIO * 100}%.`);
  console.log(`   NÃO lançar agente novo. Deixar terminar o que já roda (matar perde o que gastaram).`);
  console.log(`   Commitar o que estiver pronto e esperar a janela virar em ${restante.toFixed(1)} h.`);
  process.exit(2);
}
const cabem = Math.floor((TETO * FREIO - totalTokens) / 250000); // ~250k por agente, média observada
console.log(`\n✓ SEGUE: cabem mais ~${cabem} agente(s) antes do freio (média observada ~250k cada).`);
