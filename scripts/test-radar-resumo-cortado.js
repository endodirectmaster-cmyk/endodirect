// Regressão: artigo do radar sem resumo da IA NÃO vai ao mural com o texto genérico.
//
// Professor, 15/11/2026, com print do card do REDEFINE 9 (CagriSema) no Mural de
// artigos: "Ficou muito genérico esse post aqui do mural". O card dizia só "Artigo
// recente sobre diabetes, tecnologia e controle metabólico, publicado em ... e
// selecionado pelo radar Endodirect...". Causa: desde a troca para o Sonnet 5.5
// (09/11), o JSON do resumo passava dos 700 tokens de saída em parte dos artigos,
// chegava cortado, o parse falhava e o radar publicava o texto de reserva. De 10/11 a
// 15/11 foram 25 artigos do PubMed assim (antes da troca, nenhum desde agosto).
//
// O que este teste prende:
//   1) o resumo de artigo pede folga de saída (≥ 1.500 tokens), e o de comunicado de
//      sociedade também (≥ 1.200);
//   2) resposta cortada (stop_reason max_tokens, JSON sem fecho) → buildMuralItem
//      devolve null (o artigo tenta de novo na rodada seguinte), e o log diz o motivo;
//   3) recusa, HTTP de erro e JSON sem resumo também não viram card genérico;
//   4) resposta inteira → card com o resumo da IA e aiSummary true;
//   5) sem chave de API (ambiente de teste/dev) o texto de reserva continua valendo.
'use strict';
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const src = fs.readFileSync(path.join(raiz, 'lib', 'radar.js'), 'utf8');
const mArt = src.match(/const AI_MAX_TOKENS_ARTIGO = (\d+);/);
const mSoc = src.match(/const AI_MAX_TOKENS_SOCIEDADE = (\d+);/);
ok(mArt && Number(mArt[1]) >= 1500, 'o resumo de artigo do radar tem de pedir ≥ 1.500 tokens de saída (o corte de 10–15/11 foi com 700)');
ok(mSoc && Number(mSoc[1]) >= 1200, 'o resumo de comunicado de sociedade tem de pedir ≥ 1.200 tokens de saída');
ok(!/max_tokens:\s*[1-9]\d{2}\s*,/.test(src), 'sobrou max_tokens de 3 dígitos no radar');
ok(/max_tokens: AI_MAX_TOKENS_ARTIGO/.test(src) && /max_tokens: AI_MAX_TOKENS_SOCIEDADE/.test(src), 'as duas chamadas de IA do radar têm de usar as constantes');
const newsSrc = fs.readFileSync(path.join(raiz, 'lib', 'news.js'), 'utf8');
const mNews = newsSrc.match(/max_tokens:\s*(\d+)/);
ok(mNews && Number(mNews[1]) >= 800, 'a classificação de Breaking News tem de pedir ≥ 800 tokens de saída');

const radar = require(path.join(raiz, 'lib', 'radar.js'));
const artigo = { title: 'Efficacy and safety of CagriSema (REDEFINE 9)', journal: 'The lancet. Diabetes & endocrinology', studyType: 'Ensaio clinico randomizado', subespecialidade: 'Obesidade', abstract: 'Background ... Methods ... Findings ... Interpretation ...', link: 'https://pubmed.ncbi.nlm.nih.gov/43033821/', pmid: '43033821', publicationDate: '2026 Nov 14' };
const resposta = (corpo, status) => async () => ({ ok: !status || status < 400, status: status || 200, json: async () => corpo });
const jsonCompleto = JSON.stringify({ semAbstract: false, tituloPt: 'Eficácia e segurança do CagriSema (REDEFINE 9)', tipo: 'Ensaio clínico randomizado', subespecialidade: 'Obesidade', tipoMural: 'Ensaio Clínico', resumo: 'Resumo de verdade do estudo.', porque: 'Na prática, X.', cautela: 'Cautela Y.' });

(async () => {
  const fetchOriginal = global.fetch;
  const errOriginal = console.error;
  const logs = [];
  console.error = (...a) => { logs.push(a.join(' ')); };
  async function rodar(fakeFetch, chave) {
    global.fetch = fakeFetch;
    try { return await radar.buildMuralItem(Object.assign({}, artigo), chave); }
    catch (e) { falhas.push('buildMuralItem lançou: ' + (e && e.message)); return undefined; }
    finally { global.fetch = fetchOriginal; }
  }
  try {
    // 2) cortado no max_tokens
    logs.length = 0;
    const cortado = await rodar(resposta({ stop_reason: 'max_tokens', content: [{ type: 'text', text: jsonCompleto.slice(0, 120) }] }), 'chave-falsa');
    ok(cortado === null, 'resposta cortada tem de devolver null (sem card genérico): ' + JSON.stringify(cortado && cortado.texto));
    ok(logs.some((l) => /pmid 43033821/.test(l) && /cortado no max_tokens/.test(l)), 'o log tem de dizer que o resumo foi cortado e de qual pmid: ' + JSON.stringify(logs));
    // 3) recusa, HTTP 529, JSON sem resumo
    logs.length = 0;
    ok(await rodar(resposta({ stop_reason: 'refusal', stop_details: { category: 'bio' }, content: [] }), 'chave-falsa') === null, 'recusa tem de devolver null');
    ok(logs.some((l) => /recusa/.test(l)), 'o log tem de registrar a recusa');
    ok(await rodar(resposta({ error: { type: 'overloaded_error' } }, 529), 'chave-falsa') === null, 'HTTP de erro tem de devolver null');
    ok(await rodar(resposta({ content: [{ type: 'text', text: JSON.stringify({ semAbstract: false, tipo: 'x' }) }] }), 'chave-falsa') === null, 'JSON sem resumo tem de devolver null');
    // 4) resposta inteira
    const bom = await rodar(resposta({ stop_reason: 'end_turn', content: [{ type: 'text', text: jsonCompleto }] }), 'chave-falsa');
    ok(bom && bom.aiSummary === true && /Resumo de verdade do estudo\./.test(bom.texto) && !/selecionado pelo radar/.test(bom.texto), 'resposta inteira tem de virar card com o resumo da IA: ' + JSON.stringify(bom && bom.texto));
    // 5) sem chave
    const semChave = await rodar(async () => { throw new Error('não devia chamar a API sem chave'); }, '');
    ok(semChave && semChave.aiSummary === false && /selecionado pelo radar/.test(semChave.texto), 'sem chave de API o texto de reserva continua (ambiente de teste)');
  } finally {
    console.error = errOriginal;
  }
  if (falhas.length) { console.error('✗ radar: resumo cortado'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('✓ radar: resumo cortado/recusado não vira card genérico; folga de saída de 1.600 tokens; motivo no log');
})();
