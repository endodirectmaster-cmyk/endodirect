#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// `alinhado` DESCARTA A RESSALVA — e alguém escreveu segurança dentro dela.
//
// O `monta-base-profunda.js` entrega o campo `conflito` como cabeçalho do bloco,
// repetido em todos os pedaços… EXCETO quando `conflito_direcao` é `alinhado`.
// Ali ele manda só o corpo, e a razão está escrita no código e é boa: alinhado é
// **registro de auditoria** — o núcleo já foi corrigido a partir daquela fonte,
// e repetir a ressalva seria alarme falso ocupando o prefixo cacheado.
//
// ⚠️ O problema achado em 09/08/2026: o campo `conflito` acumulou DOIS papéis.
// Além de "onde esta fonte diverge do núcleo", virou também o lugar de declarar
// **o que a fonte NÃO responde** — que é aviso de SEGURANÇA e tem de chegar ao
// médico sempre. No extrato do feocromocitoma, 2.704 caracteres de `conflito`
// declarado `alinhado` incluíam "esta fonte não tem corte de metanefrina, não
// tem condição de coleta e **não tem conduta de crise hipertensiva**" — e tudo
// isso estava sendo descartado em silêncio.
//
// A guarda acusa a COMBINAÇÃO: direção `alinhado` + linguagem de escopo dentro
// do `conflito`. Não é peneira de estilo — é a única situação em que o montador
// joga fora, sem avisar, texto escrito para proteger.
//
// Medido ao escrever: 4 extratos `alinhado`; 3 dizem "RESOLVIDO — registro de
// auditoria, sem divergência ativa" e não disparam; 1 dispara, e é o real.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo', 'extratos');

// Linguagem de ESCOPO: declara ausência **NA FONTE**. É o que precisa ser
// entregue, e é o que o `alinhado` descarta.
//
// ⚠️ A PRIMEIRA VERSÃO DESTE PADRÃO ERA FROUXA E EU MEDI: acusava 4 de 4
// extratos `alinhado`, e **3 eram falso positivo** (75%). Ela pegava "Não há
// mais o que sobrescrever" — que é o OPOSTO de escopo — e "o NÚCLEO não tem
// entrada sobre X", cujo sujeito é o núcleo, não a fonte. Pela regra da casa,
// peneira com 75% de falso positivo não vira CI: alarme que dispara sempre
// vira paisagem.
//
// O sinal verdadeiro exige o SUJEITO explícito: quem não responde é a FONTE.
const ESCOPO = /(esta\s+fonte|a\s+fonte|o\s+artigo|ela)\s+(n[ãa]o|jamais)\s*(traz|tem|d[áa]|responde|informa|fornece|publica|define|cobre|menciona)/i;

if (!fs.existsSync(DIR)) { console.log('✓ sem extratos para conferir.'); process.exit(0); }

const achados = [];
let alinhados = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (e) { continue; }
  if (String(j.conflito_direcao || '').trim() !== 'alinhado') continue;
  alinhados++;
  const c = String(j.conflito || '');
  const m = c.match(ESCOPO);
  if (!m) continue;
  achados.push({
    id: f.replace(/\.json$/, ''),
    tema: String(j.tema || '').slice(0, 60),
    trecho: c.slice(Math.max(0, m.index - 70), m.index + 130).replace(/\s+/g, ' '),
  });
}

if (achados.length) {
  console.error('\n✖ RESSALVA DE ESCOPO DENTRO DE UM `alinhado` — ela NÃO chega ao médico.\n');
  for (const a of achados) {
    console.error(`  · ${a.id}`);
    console.error(`    ${a.tema}`);
    console.error(`    …${a.trecho}…`);
  }
  console.error('\n  `conflito_direcao: "alinhado"` faz o montador entregar SÓ o corpo do bloco —');
  console.error('  a ressalva fica no JSON e some da entrega, de propósito (é registro de');
  console.error('  auditoria, não instrução). Mas o que a FONTE NÃO RESPONDE é aviso de');
  console.error('  segurança e tem de chegar sempre.');
  console.error('\n  Saídas: (a) mova a declaração de escopo para dentro das `afirmacao` dos');
  console.error('  fatos onde o médico procuraria o número que falta; ou (b) se há mesmo uma');
  console.error('  divergência ativa com o núcleo, a direção não é `alinhado`.\n');
  process.exit(1);
}

console.log(`✓ escopo em ressalva alinhada: ${alinhados} extrato(s) \`alinhado\` conferido(s), ` +
            'nenhum esconde aviso de escopo numa ressalva que não é entregue.');
