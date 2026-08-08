#!/usr/bin/env node
/* Quanto de cada artigo está citado LITERALMENTE nos extratos versionados.
 *
 * POR QUE ISTO EXISTE (08/08/2026). O cofre registra que já se empurrou texto
 * integral de artigo para este repositório — que é PÚBLICO — e foi preciso
 * reescrever o histórico. Desde então a regra é: versiona-se o EXTRATO (fatos em
 * português com citações curtas), nunca o texto integral, e `textos/` está no
 * .gitignore.
 *
 * ⚠️ MAS A REGRA OLHA A CITAÇÃO, E O RISCO É A SOMA. Cada citação isolada é um
 * trecho de uma ou duas frases — uso legítimo, sem discussão. Medindo o
 * agregado, porém, alguns extratos chegam a 60-72% do artigo reconstituído
 * verbatim dentro do JSON. Ninguém decidiu isso; é o efeito colateral de extrair
 * exaustivamente e exigir citação para cada fato. As duas exigências são certas
 * e, juntas, produzem uma terceira coisa que nenhuma das duas pediu.
 *
 * Este script não decide nada — só torna o número visível, porque a proporção
 * cresce em silêncio a cada extração e ninguém olha o total.
 *
 * Uso:  node scripts/proporcao-citada.js [--limite 55]
 * Saída: tabela ordenada; código 1 se algum extrato passar do limite.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const arg = (n, p) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : p; };
const LIMITE = parseFloat(arg('--limite', '55'));

const DIR = path.join(RAIZ, 'scratchpad', 'acervo');
const dirExt = path.join(DIR, 'extratos');
if (!fs.existsSync(dirExt)) { console.error('✗ não existe ' + dirExt); process.exit(1); }

const linhas = [];
let semTexto = 0;
for (const arq of fs.readdirSync(dirExt).filter((f) => f.endsWith('.json'))) {
  const e = JSON.parse(fs.readFileSync(path.join(dirExt, arq), 'utf8'));
  const pTxt = path.join(DIR, 'textos', String(e.fileId || '') + '.txt');
  // Sem o texto-fonte local não dá para medir (ele é gitignored de propósito,
  // então em CI limpo este script mede zero extratos — e isso está certo).
  if (!fs.existsSync(pTxt)) { semTexto++; continue; }
  const fonte = fs.statSync(pTxt).size;
  const citado = (e.fatos || []).reduce((s, f) => s + String(f.citacao || '').length, 0);
  linhas.push({
    titulo: String(e.titulo || e.tema || arq).replace(/\s+/g, ' ').slice(0, 46),
    pct: fonte ? (citado / fonte) * 100 : 0,
    citado, fonte, fatos: (e.fatos || []).length
  });
}

if (!linhas.length) {
  console.log('(nenhum texto-fonte local — `scratchpad/acervo/textos/` é gitignored; rode onde os PDFs foram extraídos)');
  process.exit(0);
}

linhas.sort((a, b) => b.pct - a.pct);
console.log('PROPORÇÃO DO ARTIGO CITADA LITERALMENTE NO EXTRATO VERSIONADO\n');
let acima = 0;
for (const l of linhas) {
  const marca = l.pct > LIMITE ? '⚠️' : '  ';
  if (l.pct > LIMITE) acima++;
  console.log(`${marca} ${l.pct.toFixed(0).padStart(3)}%  ${(Math.round(l.citado / 1000) + 'k/' + Math.round(l.fonte / 1000) + 'k').padEnd(11)} ${String(l.fatos).padStart(4)} fatos  ${l.titulo}`);
}
if (semTexto) console.log(`\n(${semTexto} extrato(s) sem texto-fonte local — não medidos)`);

if (acima) {
  console.error(`\n⚠️ ${acima} extrato(s) acima de ${LIMITE}% do artigo citado verbatim num repositório PÚBLICO.`);
  console.error('Cada citação isolada é uso legítimo; a SOMA é que não foi decidida por ninguém.');
  console.error('Isto é decisão do professor, não do código: reduzir citação, fechar o repositório');
  console.error('ou aceitar como está. O script existe para que a escolha seja consciente.');
  process.exit(1);
}
console.log(`\n✓ nenhum extrato acima de ${LIMITE}%.`);
