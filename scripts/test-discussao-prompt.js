// O que vai (e o que NÃO vai) no prompt da discussão completa.
//
// O defeito que este teste existe para pegar: figuras e tabelas eram anexadas
// no FIM do texto e o truncamento por caractere cortava justamente elas. Num
// artigo de 8.100 palavras o bloco das tabelas ficava inteiro fora do prompt, e
// a discussão saía dizendo "a Tabela 1 (referida no artigo) sintetiza…" — o
// modelo só via a menção no corpo, nunca a tabela. O prompt mandava reproduzir
// tabelas cujo conteúdo não tinha sido enviado.
//
// O segundo: o rodapé de procedência dizia "N tabela(s) reproduzida(s) do
// artigo" contando o que o ARTIGO tinha, não o que a discussão trouxe. Rótulo
// que promete o que não está no texto foi removido a pedido do professor.
'use strict';
const fs = require('fs');
const path = require('path');
const { fullTextForPrompt } = require('../lib/fulltext');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Artigo longo o bastante para o corpo sozinho estourar o teto.
const paragrafo = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod. ';
const ft = {
  pmcid: 'PMC13381830',
  palavras: 8109,
  licenca: { cc: 'CC BY' },
  secoes: Array.from({ length: 12 }, (_, i) => ({
    titulo: 'Seção ' + (i + 1),
    paragrafos: Array.from({ length: 40 }, () => paragrafo.repeat(3))
  })),
  figuras: [
    { rotulo: 'Figura 1', legenda: 'Distribuição anatômica do receptor de GLP-1.' },
    { rotulo: 'Figura 2', legenda: 'Interação entre determinantes host-microbiota-fármaco.' }
  ],
  tabelas: [
    { rotulo: 'Tabela 1', legenda: 'Composição da microbiota sob GLP-1 RA.', markdown: '| Estudo | n | Achado |\n| --- | --- | --- |\n| MARCA-T1 | 52 | β-diversidade divergiu |', nota: 'AGCC: ácidos graxos de cadeia curta.' },
    { rotulo: 'Tabela 2', legenda: 'Assinaturas microbianas da resposta.', markdown: '| Táxon | Grupo |\n| --- | --- |\n| MARCA-T2 | respondedor |', nota: '' },
    { rotulo: 'Tabela 3', legenda: 'Determinantes multifatoriais.', markdown: '| Fator | Peso |\n| --- | --- |\n| MARCA-T3 | alto |', nota: '' },
    { rotulo: 'Tabela 4', legenda: 'Controle de confundimento.', markdown: '| Estudo | Ajuste |\n| --- | --- |\n| MARCA-T4 | ausente |', nota: '' }
  ]
};

// ---- 1. ⚠️ O CORPO É QUE CEDE ESPAÇO, NUNCA AS TABELAS -----------------------
{
  const TETO = 20000;
  const p = fullTextForPrompt(ft, TETO);
  ok('o corpo do artigo entra', p.indexOf('## Seção 1') >= 0);
  ok('o corpo foi truncado (o cenário é de estouro)', p.indexOf('[…texto truncado]') > 0);
  ['MARCA-T1', 'MARCA-T2', 'MARCA-T3', 'MARCA-T4'].forEach((m) => {
    ok('a ' + m + ' chegou ao prompt', p.indexOf(m) > 0);
  });
  ok('as legendas das figuras chegaram', p.indexOf('Distribuição anatômica') > 0 && p.indexOf('host-microbiota') > 0);
  ok('as notas de rodapé da tabela chegaram', p.indexOf('ácidos graxos de cadeia curta') > 0);
  ok('o prompt respeita o teto com folga razoável', p.length <= TETO + 2000, 'saiu com ' + p.length);
}

// ---- 2. sem estouro, nada é cortado -----------------------------------------
{
  const curto = Object.assign({}, ft, { secoes: [{ titulo: 'Métodos', paragrafos: [paragrafo] }] });
  const p = fullTextForPrompt(curto, 60000);
  ok('sem estouro não trunca', p.indexOf('[…texto truncado]') < 0);
  ok('sem estouro as tabelas continuam lá', p.indexOf('MARCA-T4') > 0);
}

// ---- 3. anexos gigantescos não zeram o corpo --------------------------------
{
  const inchado = Object.assign({}, ft, {
    tabelas: Array.from({ length: 60 }, (_, i) => ({
      rotulo: 'Tabela ' + (i + 1), legenda: 'x'.repeat(400), markdown: 'y'.repeat(400), nota: ''
    }))
  });
  const p = fullTextForPrompt(inchado, 20000);
  ok('resta corpo mesmo com anexos enormes', p.indexOf('## Seção 1') >= 0 && p.indexOf('Lorem ipsum') > 0);
}

// ---- 4. ⚠️ NENHUM RODAPÉ DE PROCEDÊNCIA NO MARKDOWN GRAVADO -----------------
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'discussao.js'), 'utf8');
  const codigo = src.replace(/^\s*\/\/.*$/gm, '');
  ok('lib/discussao.js não monta rodapé', codigo.indexOf('Discussão elaborada sobre') < 0);
  ok('lib/discussao.js não conta tabelas para o texto', !/tabela\(s\) reproduzida\(s\)/.test(codigo));
  ok('o markdown gravado é o da IA, sem apêndice', /markdown:\s*md\s*,/.test(codigo));
}

// ---- 5. ⚠️ O CABEÇALHO DO CARD NÃO ANUNCIA TABELA NEM FIGURA ---------------
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const i = html.indexOf('function muralDiscussaoHTML');
  const bloco = html.slice(i, i + 600);
  ok('o resumo do card não tem selo de meta', bloco.indexOf('mural-disc-meta') < 0);
  ok('o card continua anunciando a discussão', bloco.indexOf('Discussão completa do artigo') > 0);
  ok('nenhum código preenche o selo', html.indexOf("querySelector('.mural-disc-meta')") < 0);
}

// ---- 6. as instruções sobre tabela dizem o que precisam dizer ---------------
// A primeira regeneração com as tabelas no prompt saiu com a tabela reproduzida,
// mas com os cabeçalhos em inglês, copiados do artigo — no meio de um texto em
// português. E "reproduzir" precisa estar dito como colar, não como descrever:
// era exatamente descrevendo que o modelo fugia da tabela.
{
  const { montarPrompt } = require('../lib/discussao');
  const artigo = { titulo: 'T', fonte: 'F', tipo: 'Artigo de Revisão' };
  const comTabela = montarPrompt(artigo, ft);
  ok('manda reproduzir em markdown', /\*\*Reproduza no corpo da discussão, em markdown\*\*/.test(comTabela));
  ok('manda traduzir a tabela', /A tabela sai em português/.test(comTabela));
  ok('preserva número, sigla, fármaco e táxon', /números, unidades, siglas, nomes de fármacos/.test(comTabela));
  ok('diz que reproduzir é colar, não descrever', /Reproduzir é colar a tabela, não descrevê-la/.test(comTabela));

  const semTabela = montarPrompt(artigo, Object.assign({}, ft, { tabelas: [] }));
  ok('sem tabela, não manda reproduzir nada', semTabela.indexOf('Reproduza no corpo') < 0);
  ok('sem tabela, diz que não há', /não tem tabelas extraíveis/.test(semTabela));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ prompt da discussão: figuras e tabelas sobrevivem ao corte; tabela em português; sem rodapé e sem selo');
process.exit(bad ? 1 : 0);
