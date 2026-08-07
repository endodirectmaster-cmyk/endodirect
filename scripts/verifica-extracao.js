#!/usr/bin/env node
/* Verificador mecânico da extração dos artigos do acervo.
 *
 * POR QUE ELE EXISTE: o professor pediu "risco extremamente baixo de alucinar" e
 * "extrair 100% das informações dos artigos". A única forma de garantir a primeira
 * parte não é confiar no cuidado de quem extrai — é EXIGIR QUE CADA AFIRMAÇÃO
 * CARREGUE UMA CITAÇÃO LITERAL e conferir, por texto, que essa citação existe
 * mesmo no PDF de origem.
 *
 * O cofre já registra por que isto é necessário: em 06/08 eu validei um filtro com
 * fixtures que EU MESMO escrevi e elas passavam 10/10 — no dado real, 3 de 6
 * estavam erradas. Extração conferida contra a fonte é o oposto disso.
 *
 * Entrada:
 *   scratchpad/acervo/textos/<fileId>.txt    — texto integral do PDF
 *   scratchpad/acervo/extratos/<fileId>.json — { fileId, titulo, fonte, area,
 *                                                fatos: [{ afirmacao, citacao, secao }] }
 *
 * Regras de aprovação (qualquer uma falha reprova o extrato inteiro):
 *   1. toda `citacao` tem de aparecer no texto-fonte, com espaços normalizados;
 *   2. citação com menos de 25 caracteres não conta como evidência (curta demais
 *      para provar qualquer coisa: "insulin" aparece em qualquer artigo);
 *   3. todo NÚMERO citado na `afirmacao` tem de aparecer na `citacao` — é onde a
 *      alucinação mais entra (trocar 264 por 300, 6,5 por 6,0);
 *   4. `fonte` não pode ser vazia (sem procedência não entra na base).
 *
 * Uso:  node scripts/verifica-extracao.js [--dir scratchpad/acervo]
 * Saída: relatório por arquivo + código 1 se algum extrato reprovar.
 */
const fs = require('fs');
const path = require('path');

const argDir = (() => {
  const i = process.argv.indexOf('--dir');
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : path.join('scratchpad', 'acervo');
})();
const DIR_TEXTOS = path.join(argDir, 'textos');
const DIR_EXTRATOS = path.join(argDir, 'extratos');

// Normalização usada nos dois lados: espaços colapsados, aspas e travessões
// unificados, minúsculas. NÃO remove acento nem pontuação — a citação tem de ser
// fiel, e afrouxar demais transformaria o verificador em carimbo.
function norm(s) {
  return String(s || '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

// Segunda passada, SÓ para o artefato de PDF: o extrator de texto quebra a palavra
// no fim da linha e deixa "sulfo- nylureas", "dia- betes". Removemos APENAS hífen
// SEGUIDO DE ESPAÇO — "low-dose" e "HNF1B-diabetes" não têm espaço depois do
// hífen e ficam intactos. É normalização de ARTEFATO, não afrouxamento: as
// palavras são as mesmas, muda só onde o PDF quebrou a linha.
function semHifenDeQuebra(s) {
  return String(s || '').replace(/-\s+/g, '');
}

// Números da afirmação que precisam estar na citação. Ignora numeração de item
// ("(1)", "(2)") e anos isolados de 4 dígitos, que costumam vir da referência.
function numerosRelevantes(s) {
  const bruto = String(s || '').match(/\d+(?:[.,]\d+)?/g) || [];
  return bruto.filter((n) => {
    if (/^(19|20)\d{2}$/.test(n)) return false;      // ano
    if (n.length === 1 && Number(n) <= 4) return false; // provável marcador de lista
    return true;
  });
}
// Compara número tolerando vírgula/ponto decimal (pt-BR x en).
function numeroPresente(n, hay) {
  const a = n.replace(',', '.');
  const b = n.replace('.', ',');
  return hay.includes(a) || hay.includes(b) || hay.includes(n);
}

function main() {
  if (!fs.existsSync(DIR_EXTRATOS)) {
    console.error('✗ não existe ' + DIR_EXTRATOS + ' — nada a verificar.');
    process.exit(1);
  }
  const arquivos = fs.readdirSync(DIR_EXTRATOS).filter((f) => f.endsWith('.json'));
  if (!arquivos.length) {
    console.error('✗ nenhum extrato em ' + DIR_EXTRATOS);
    process.exit(1);
  }

  let totFatos = 0, totReprovados = 0, extratosRuins = 0;
  const relatorio = [];

  for (const arq of arquivos.sort()) {
    const ext = JSON.parse(fs.readFileSync(path.join(DIR_EXTRATOS, arq), 'utf8'));
    const id = ext.fileId || path.basename(arq, '.json');
    const problemas = [];

    if (!ext.fonte || String(ext.fonte).trim().length < 10) {
      problemas.push('SEM PROCEDÊNCIA: campo `fonte` vazio ou curto demais');
    }

    const pTexto = path.join(DIR_TEXTOS, id + '.txt');
    if (!fs.existsSync(pTexto)) {
      problemas.push('SEM TEXTO-FONTE: ' + pTexto + ' não existe — impossível conferir as citações');
      relatorio.push({ arq, id, titulo: ext.titulo, fatos: 0, problemas });
      extratosRuins++;
      continue;
    }
    const fonte = norm(fs.readFileSync(pTexto, 'utf8'));

    const fatos = Array.isArray(ext.fatos) ? ext.fatos : [];
    if (!fatos.length) problemas.push('extrato sem nenhum fato');

    fatos.forEach((f, i) => {
      totFatos++;
      const rot = `fato #${i + 1}`;
      const cit = String((f && f.citacao) || '');
      const afi = String((f && f.afirmacao) || '');
      if (!afi.trim()) { problemas.push(`${rot}: sem afirmação`); totReprovados++; return; }
      if (!cit.trim()) { problemas.push(`${rot}: SEM CITAÇÃO — regra inegociável`); totReprovados++; return; }
      if (cit.trim().length < 25) {
        problemas.push(`${rot}: citação curta demais (${cit.trim().length} chars) para servir de prova`);
        totReprovados++; return;
      }
      const c = norm(cit);
      if (!fonte.includes(c) && !semHifenDeQuebra(fonte).includes(semHifenDeQuebra(c))) {
        problemas.push(`${rot}: ⚠️ CITAÇÃO NÃO ENCONTRADA NO PDF → "${cit.slice(0, 90)}…"`);
        totReprovados++; return;
      }
      const faltando = numerosRelevantes(afi).filter((n) => !numeroPresente(n, c));
      if (faltando.length) {
        problemas.push(`${rot}: ⚠️ número(s) na afirmação sem respaldo na citação: ${faltando.join(', ')} → "${afi.slice(0, 90)}…"`);
        totReprovados++;
      }
    });

    if (problemas.length) extratosRuins++;
    relatorio.push({ arq, id, titulo: ext.titulo, fatos: fatos.length, problemas });
  }

  for (const r of relatorio) {
    const marca = r.problemas.length ? '✗' : '✓';
    console.log(`${marca} ${(r.titulo || r.id).slice(0, 78)}  — ${r.fatos} fato(s)`);
    r.problemas.forEach((p) => console.log('    · ' + p));
  }
  console.log(`\n${arquivos.length} extrato(s) · ${totFatos} fato(s) · ${totReprovados} fato(s) reprovado(s) · ${extratosRuins} extrato(s) com problema`);
  if (extratosRuins) {
    console.error('\n✗ REPROVADO: há fato sem citação verificável. Nada entra na base clínica assim.');
    process.exit(1);
  }
  console.log('✓ toda afirmação tem citação literal encontrada no PDF de origem.');
}

main();
