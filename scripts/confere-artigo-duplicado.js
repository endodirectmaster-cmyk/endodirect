#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// O MESMO ARTIGO EXTRAÍDO DUAS VEZES DOBRA OS FATOS DELE NA BASE.
//
// Achado em 09/08/2026 varrendo a fila de extração: **5 títulos têm DOIS ids**
// no `fila-extracao.json`, e num deles — *"Diagnosis and management of central
// diabetes insipidus in adults"* — um id **já foi extraído** (169 fatos) e o
// outro segue na fila marcado como pendente. Nada impedia a leva seguinte de
// extraí-lo de novo.
//
// ⚠️ Duplicata não é só desperdício: ela **dobra o peso** do artigo na seleção
// por tema (dois blocos com o mesmo conteúdo competindo), come teto de área em
// dobro e faz a IA ver a mesma afirmação duas vezes, o que soa como confirmação
// independente quando não é.
//
// A guarda compara o TÍTULO normalizado (sem acento, sem pontuação, sem caixa),
// não o `fileId` — porque o defeito da fila é exatamente ter dois ids para o
// mesmo artigo. Medido ao escrever: 44 extratos, **44 títulos distintos, zero
// duplicados** — falso positivo zero hoje, que é o critério para virar CI.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo', 'extratos');

const norm = (s) => String(s || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();

if (!fs.existsSync(DIR)) { console.log('✓ sem extratos para conferir.'); process.exit(0); }

const porTitulo = new Map();
let comTitulo = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (e) { continue; }
  // `titulo` é o campo canônico; o `tema` serve de reserva para extrato antigo.
  const k = norm(j.titulo || j.tema);
  if (!k) continue;
  comTitulo++;
  if (!porTitulo.has(k)) porTitulo.set(k, []);
  porTitulo.get(k).push({ id: f.replace(/\.json$/, ''), n: (j.fatos || []).length });
}

const duplicados = [...porTitulo.entries()].filter(([, v]) => v.length > 1);

if (duplicados.length) {
  console.error('\n✖ O MESMO ARTIGO FOI EXTRAÍDO MAIS DE UMA VEZ:\n');
  for (const [titulo, v] of duplicados) {
    console.error(`  · "${titulo.slice(0, 78)}"`);
    for (const x of v) console.error(`      ${x.id}  (${x.n} fatos)`);
  }
  console.error('\n  A fila tem títulos com DOIS fileId — extrair os dois dobra os fatos na base,');
  console.error('  dobra o peso do artigo na seleção por tema e come teto de área em dobro.');
  console.error('  Apague o extrato repetido e marque o id perdedor na fila.\n');
  process.exit(1);
}

console.log(`✓ artigo duplicado: ${comTitulo} extrato(s) conferido(s), ` +
            `${porTitulo.size} título(s) distinto(s), nenhum repetido.`);
