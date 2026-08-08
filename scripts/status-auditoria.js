#!/usr/bin/env node
/* Quanto da base passou por auditoria adversarial — a resposta única.
 *
 * POR QUE ISTO EXISTE (08/08/2026). O professor perguntou "% de extração?" e eu
 * dei três números seguidos, dois deles errados:
 *
 *   1. "Obesidade em 2/5 auditados" — errado, a cirurgia bariátrica JÁ estava
 *      auditada e eu não contei;
 *   2. "30/30, 100% auditados" — errado ao contrário, porque contei como
 *      auditoria o que era ANOTAÇÃO DO EXTRATOR.
 *
 * A causa: o campo `auditoria` tinha TRÊS formatos convivendo — string do
 * formato antigo, objeto com `achado` (auditoria de verdade) e objeto com
 * `escopo`/`nao_extraido`, que o extrator usava como bloco de notas. Cada
 * contagem improvisada acertava um formato e errava outro.
 *
 * ⚠️ O SEGUNDO ERRO É O PERIGOSO, e é a mesma família das peneiras cegas: um
 * "100% auditado" falso encerra o assunto. Ninguém volta a olhar o que já está
 * verde. Por isso a normalização foi feita na origem — a nota do extrator mudou
 * para o campo `extracao` — e a contagem virou este script, único.
 *
 * REGRA DO CAMPO, daqui em diante:
 *   `auditoria`  → SÓ auditoria adversarial. String (legado) ou objeto com
 *                  `achado`. Nada mais entra aqui.
 *   `extracao`   → decisões e limites de quem EXTRAIU (o que não foi extraído,
 *                  discordância interna do artigo, tabelas puladas).
 *
 * ⚠️ O QUE ESTE SCRIPT EXIGE E O QUE ELE SÓ INFORMA — a distinção é deliberada:
 *
 *   REPROVA  quando o campo `auditoria` está MALFORMADO (objeto sem `achado`),
 *            porque aí ele voltou a significar duas coisas e toda contagem
 *            futura fica errada em silêncio. É a trava contra a deriva.
 *   INFORMA  a cobertura. Auditoria é trabalho de agente/gente e leva tempo;
 *            exigir 100% por CI só faria alguém marcar o campo para o vermelho
 *            sumir, que é o oposto do que ele serve.
 *
 * Uso:  node scripts/status-auditoria.js [--pendentes]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'scratchpad', 'acervo', 'extratos');
const SO_PENDENTES = process.argv.includes('--pendentes');

if (!fs.existsSync(DIR)) { console.log('(sem extratos)'); process.exit(0); }

// ⚠️ A definição, num lugar só. String = formato antigo (o campo já foi texto
// corrido); objeto precisa de `achado`, que é o que um auditor escreve e um
// extrator não.
const auditado = (e) => {
  const a = e.auditoria;
  if (typeof a === 'string') return a.trim().length > 0;
  if (a && typeof a === 'object') return !!a.achado;
  return false;
};

const linhas = [];
const malformados = [];
for (const arq of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const e = JSON.parse(fs.readFileSync(path.join(DIR, arq), 'utf8'));
  // A trava: objeto sem `achado` significa que alguém escreveu nota de extração
  // (ou qualquer outra coisa) dentro de `auditoria`. Foi exatamente isso que me
  // fez relatar "100% auditado" sobre 93%.
  const a = e.auditoria;
  if (a && typeof a === 'object' && !a.achado) {
    malformados.push({
      arq, titulo: String(e.titulo || arq).slice(0, 46),
      chaves: Object.keys(a).filter((k) => isNaN(k)).slice(0, 5).join(', ') || '(índices numéricos)'
    });
  }
  linhas.push({
    titulo: String(e.titulo || arq).replace(/\s+/g, ' ').slice(0, 52),
    n: (e.fatos || []).length,
    ok: auditado(e),
    temNotaExtracao: !!e.extracao
  });
}

const tot = linhas.length;
const aud = linhas.filter((l) => l.ok).length;
const fatos = linhas.reduce((s, l) => s + l.n, 0);
const fatosAud = linhas.filter((l) => l.ok).reduce((s, l) => s + l.n, 0);
const pend = linhas.filter((l) => !l.ok).sort((a, b) => b.n - a.n);

if (!SO_PENDENTES) {
  console.log('AUDITORIA ADVERSARIAL DA BASE\n');
  console.log(`  extratos  ${aud}/${tot}  (${((aud / tot) * 100).toFixed(0)}%)`);
  console.log(`  fatos     ${fatosAud}/${fatos}  (${((fatosAud / fatos) * 100).toFixed(0)}%)`);
  console.log(`\n  (auditoria = campo \`auditoria\` com \`achado\`, ou string do formato antigo.`);
  console.log(`   nota de extração vive em \`extracao\` e NÃO conta — foi assim que eu`);
  console.log(`   cheguei a relatar "100% auditado" sobre 93%.)`);
}

if (!pend.length) {
  console.log('\n✓ nenhum extrato pendente de auditoria.');
} else {
  console.log(`\nPENDENTES (${pend.length}), do maior para o menor:`);
  for (const l of pend) {
    console.log(`  ${String(l.n).padStart(4)} fatos  ${l.titulo}${l.temNotaExtracao ? '   [tem nota de extração]' : ''}`);
  }
}

// ⚠️ A TRAVA CONTRA A DERIVA DO CAMPO. Se `auditoria` voltar a carregar algo que
// não é auditoria, toda contagem futura erra em silêncio — e erra para o lado
// que ENCERRA o assunto, porque ninguém revisita o que já está verde.
if (malformados.length) {
  console.error(`\n✗ ${malformados.length} extrato(s) com \`auditoria\` MALFORMADA (objeto sem \`achado\`):`);
  for (const m of malformados) console.error(`   · ${m.titulo}\n     chaves: ${m.chaves}`);
  console.error('\n  O campo `auditoria` significa UMA coisa: auditoria adversarial.');
  console.error('  Nota de quem extraiu (o que ficou de fora, tabela pulada, discordância');
  console.error('  interna do artigo) vai no campo `extracao`. Mover para lá resolve.');
  process.exit(1);
}
