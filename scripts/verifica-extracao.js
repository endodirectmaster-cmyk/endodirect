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
// Resolução de citação por REFERÊNCIA (offset+hash) — ver o cabeçalho de lib/citacao.js
// para por que o texto literal deixou de ser versionado.
const CIT = require('../lib/citacao');

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

// ⚠️ ELISÃO DECLARADA — `[…]` dentro da citação (07/08/2026).
//
// POR QUE ISTO EXISTE. O PDF de duas colunas do Nature Reviews Primer de
// osteogênese imperfeita sai da extração com as COLUNAS INTERCALADAS. A frase
// verdadeira é:
//
//   "The increased mineral content in bone of patients with osteogenesis
//    imperfecta is unchanged by bisphosphonate treatment"
//
// e no texto extraído ela aparece assim, partida por um pedaço da outra coluna:
//
//   "The increased mineral content in bone of patients with |deletion in Wnt1 in
//    exon 3) survives post natally, has| osteogenesis imperfecta is unchanged by
//    bisphosphonate treatment"
//
// Exigindo citação CONTÍGUA, o extrator só tinha dois caminhos, os dois ruins:
// cortar a citação no ponto da quebra — e aí a afirmação "não é alterado pelo
// bisfosfonato" fica sem NENHUM respaldo, que é o defeito que a auditoria achou
// em 11 fatos deste extrato — ou descartar o fato, perdendo o conteúdo.
//
// A elisão declarada resolve sem afrouxar: cada pedaço continua LITERAL e
// conferido, a ordem tem de ser a do texto, e o buraco tem tamanho máximo. O que
// muda é que o extrator passa a poder DIZER que pulou algo, em vez de fingir que
// a frase acabava ali. Escondido é que era perigoso.
const ELISAO = /\s*\[(?:…|\.\.\.)\]\s*/;
const GAP_MAX = 400; // um respingo de coluna tem ~50-120 chars; 400 dá folga sem permitir costurar trechos distantes

// Mesmas regras de qualidade da elisão, aplicadas à forma REFERENCIADA — onde a
// literalidade já vem provada pelo hash e só falta julgar se a elisão é honesta.
function conferirElisaoRef(refs) {
  if (!Array.isArray(refs) || !refs.length) return 'referência de citação vazia';
  for (const [, , len] of refs) {
    if (len < 12) return `pedaço de citação com ${len} caracteres entre elisões — não prova nada`;
  }
  for (let i = 1; i < refs.length; i++) {
    const [bAnt, oAnt, lAnt] = refs[i - 1];
    const [b, o] = refs[i];
    if (b !== bAnt) return 'elisão atravessa normalizações diferentes do texto-fonte';
    const buraco = o - (oAnt + lAnt);
    if (buraco < 0) return 'pedaços da elisão fora de ordem no texto-fonte';
    if (buraco > GAP_MAX) return `elisão pula ${buraco} caracteres (máximo ${GAP_MAX}) — isso não é quebra de coluna, é costurar trechos distantes`;
  }
  return null;
}

// Devolve null se a citação (com ou sem elisão) casa com a fonte; senão, o motivo.
function conferirCitacao(cit, fonte, fonteSH) {
  const pedacos = String(cit).split(ELISAO).map((p) => norm(p)).filter((p) => p.length);
  if (pedacos.length === 1) {
    const c = pedacos[0];
    if (fonte.includes(c) || fonteSH.includes(semHifenDeQuebra(c))) return null;
    return 'CITAÇÃO NÃO ENCONTRADA NO PDF';
  }
  // Com elisão: cada pedaço literal, NA ORDEM, e o buraco entre eles limitado.
  for (const p of pedacos) {
    if (p.length < 12) return `pedaço de citação curto demais entre elisões ("${p}") — não prova nada`;
  }
  for (const base of [fonte, fonteSH]) {
    const alvos = base === fonte ? pedacos : pedacos.map(semHifenDeQuebra);
    let pos = 0, ok = true, buraco = 0;
    for (const p of alvos) {
      const j = base.indexOf(p, pos);
      if (j < 0) { ok = false; break; }
      if (pos > 0) buraco = Math.max(buraco, j - pos);
      pos = j + p.length;
    }
    if (ok && buraco <= GAP_MAX) return null;
    if (ok) return `elisão pula ${buraco} caracteres (máximo ${GAP_MAX}) — isso não é quebra de coluna, é costurar trechos distantes`;
  }
  return 'CITAÇÃO NÃO ENCONTRADA NO PDF (algum pedaço da elisão não existe, ou estão fora de ordem)';
}


// ⚠️ FORÇA DA RECOMENDAÇÃO — achado da auditoria adversarial de 07/08/2026.
// "We suggest" é recomendação GRADE CONDICIONAL (frequentemente com certeza muito
// baixa). Nas extrações ela virava "não se deve" e "devem ser trocados": uma
// sugestão fraca chegava à IA como ordem. Oito dos doze achados da auditoria eram
// desse tipo — nenhum número estava errado, a FORÇA é que se perdia.
// A regra é estreita de propósito: só dispara quando a citação diz "we suggest"
// (marcador inequívoco de condicional) E a afirmação usa linguagem imperativa SEM
// nenhuma marca de ressalva. "should not be used" continua podendo virar "não deve".
const IMPERATIVO_PT = /(^|[^a-zà-ú])(deve|devem|deve-se|não se deve|nao se deve|é obrigatóri|e obrigatori|é mandatóri|tem de|têm de|sempre se|nunca se)/i;
// ⚠️ Só marcas de ressalva INEQUÍVOCAS. A primeira versão aceitava "pode" solto e
// deixou passar o caso #30 ("Não se deve desmamar…, nesses casos pode ser
// interrompido"): o "pode" ali é de outra oração, não é a força da recomendação.
const RESSALVA_PT = /(sugere-se|sugerimos|sugere que|pode-se considerar|pode ser considerad|é opcional|condicional|baixa certeza|certeza muito baixa|recomendação fraca)/i;
function forcaPerdida(afirmacao, citacao) {
  if (!/we suggest/i.test(citacao)) return false;
  if (/we recommend/i.test(citacao)) return false;   // a citação traz as duas: não dá para decidir aqui
  if (RESSALVA_PT.test(afirmacao)) return false;
  return IMPERATIVO_PT.test(afirmacao);
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
    const bruto = fs.readFileSync(pTexto, 'utf8');
    const bs = CIT.bases(bruto);            // [norm, norm+sem hífen de quebra]
    const fonte = bs[0];
    const fonteSH = bs[1];                  // calculados uma vez por extrato, não por fato

    const fatos = Array.isArray(ext.fatos) ? ext.fatos : [];
    if (!fatos.length) problemas.push('extrato sem nenhum fato');

    fatos.forEach((f, i) => {
      totFatos++;
      const rot = `fato #${i + 1}`;
      const afi = String((f && f.afirmacao) || '');
      if (!afi.trim()) { problemas.push(`${rot}: sem afirmação`); totReprovados++; return; }

      // ⚠️ A citação pode vir de duas formas, e as duas provam a mesma coisa:
      //   · REFERÊNCIA (`cit` + `cit_sha`) — o formato de hoje. O texto literal
      //     NÃO é versionado; fica no texto-fonte, que está no .gitignore. O
      //     hash prova que o trecho naquele offset é exatamente o que sustenta a
      //     afirmação; mexer no texto ou no offset quebra. Ver lib/citacao.js.
      //   · TEXTO (`citacao`) — o formato antigo, aceito enquanto houver extrato
      //     recém-escrito por um agente que ainda não referenciou.
      const res = CIT.resolver(f, bs);
      if (!res) {
        problemas.push(`${rot}: ⚠️ CITAÇÃO NÃO RESOLVE — ${Array.isArray(f.cit) ? 'o offset não bate com o texto-fonte ou o hash falhou (texto-fonte alterado?)' : 'SEM CITAÇÃO — regra inegociável'}`);
        totReprovados++; return;
      }
      const cit = res.texto;
      if (cit.replace(ELISAO, ' ').trim().length < 25) {
        problemas.push(`${rot}: citação curta demais (${cit.trim().length} chars) para servir de prova`);
        totReprovados++; return;
      }
      // Literalidade e ordem já estão provadas pelo offset+hash quando a citação
      // é referência. O que continua valendo para as duas formas é a regra de
      // QUALIDADE da elisão: pedaço curto demais e buraco grande demais.
      const motivo = res.origem === 'ref'
        ? conferirElisaoRef(f.cit)
        : conferirCitacao(cit, fonte, fonteSH);
      if (motivo) {
        problemas.push(`${rot}: ⚠️ ${motivo} → "${cit.slice(0, 90)}…"`);
        totReprovados++; return;
      }
      // Para as regras seguintes (números, força) a elisão não importa: o que
      // vale é o texto literal que a citação de fato traz.
      const c = norm(String(cit).split(ELISAO).join(' '));
      const faltando = numerosRelevantes(afi).filter((n) => !numeroPresente(n, c));
      if (faltando.length) {
        problemas.push(`${rot}: ⚠️ número(s) na afirmação sem respaldo na citação: ${faltando.join(', ')} → "${afi.slice(0, 90)}…"`);
        totReprovados++;
        return;
      }
      if (forcaPerdida(afi, cit)) {
        problemas.push(`${rot}: ⚠️ FORÇA DA RECOMENDAÇÃO PERDIDA — a citação diz "we suggest" (GRADE condicional) e a afirmação usa imperativo. Escreva "sugere-se"/"pode-se considerar" → "${afi.slice(0, 90)}…"`);
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
