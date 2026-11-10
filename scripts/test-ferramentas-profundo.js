#!/usr/bin/env node
// CHAT, OSCE E PRESCRIÇÃO COM AS DIRETRIZES INTEIRAS E O APROFUNDAMENTO (10/11/2026).
//
// Os seis pontos das ferramentas do aluno (chat do aluno e do painel, geração e
// relatório do OSCE, geração e avaliação da prescrição) montavam o system como
// `texto_próprio + CLINICAL_GUIDELINES`, sem o sentinela. No servidor isso caía no
// ramo "system longo fixo", que corta em 60 mil caracteres: o fim das diretrizes
// (~21 mil caracteres, as entradas mais novas) não chegava ao modelo, e o
// aprofundamento da subespecialidade era calculado e descartado. O chat mandava a
// pergunta como `grounding` desde 07/08 justamente para receber o aprofundamento,
// e nunca recebeu.
//
// 🧨 OS MODOS DE QUEBRAR ISTO, todos silenciosos:
//  - voltar a concatenar `+CLINICAL_GUIDELINES` (o corte em 60 mil volta, sem erro);
//  - tirar o `profundoMax` de um dos pontos (o bloco volta a 400 mil caracteres por
//    mensagem, ~180 mil tokens no Opus 5.5: ~US$ 0,90 por mensagem fria, sem nada visível);
//  - pôr FERRAMENTA_PROFUNDO em 0 "para desligar" (0 não vai ao servidor e o bloco sai inteiro);
//  - deixar o servidor aceitar `profundoMax` para CIMA (o cliente estouraria o teto);
//  - gerar e avaliar com áreas diferentes (o bloco muda e o cache da avaliação erra).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ---- 1. app: nenhum system com as diretrizes fora do sentinela ----------------------------
ok('🧨 nenhum `+CLINICAL_GUIDELINES` no app (sem sentinela o servidor corta em 60 mil e descarta o profundo)',
  html.indexOf('+CLINICAL_GUIDELINES') < 0);
const mTeto = html.match(/var FERRAMENTA_PROFUNDO=(\d+);/);
ok('FERRAMENTA_PROFUNDO definido', !!mTeto);
const TETO_FERRAMENTA = mTeto ? Number(mTeto[1]) : 0;
ok('FERRAMENTA_PROFUNDO abaixo do teto do servidor e acima do mínimo útil', TETO_FERRAMENTA >= 30000 && TETO_FERRAMENTA < 400000, String(TETO_FERRAMENTA));
ok('os seis pontos passam o teto (chat ×2, OSCE ×2, prescrição ×2)', (html.match(/profundoMax:FERRAMENTA_PROFUNDO/g) || []).length === 6);
ok('chat do aluno e do painel via groundSys', (html.match(/callAI\(groundSys\('ESCOPO RESTRITO/g) || []).length === 2);
ok('OSCE: geração e relatório via groundSys',
  /var sys=groundSys\('Você é preceptor de endocrinologia conduzindo/.test(html) && /var sys=groundSys\('Você é preceptor de endocrinologia avaliando o desempenho/.test(html));
ok('prescrição: geração e avaliação via groundSys',
  /callAIJson\(groundSys\('Você é preceptor de endocrinologia \(Brasil\)/.test(html) && /var sys=groundSys\('Você é preceptor de endocrinologia avaliando a prescrição/.test(html));
ok('OSCE: o relatório usa a MESMA área da geração (bloco idêntico, cache acerta)',
  /var simArea=/.test(html) && /area:simArea\}/.test(html) && /area:simArea,profundoMax:FERRAMENTA_PROFUNDO/.test(html)
  && /\{area:simState\.area\|\|'',profundoMax:FERRAMENTA_PROFUNDO\}/.test(html));
ok('prescrição: a avaliação usa a MESMA área da geração',
  /var rxArea=/.test(html) && /areaProfunda:rxArea\}/.test(html) && /area:rxArea,profundoMax:FERRAMENTA_PROFUNDO/.test(html)
  && /\{area:\(rxCase&&rxCase\.areaProfunda\)\|\|'',profundoMax:FERRAMENTA_PROFUNDO\}/.test(html));
ok('callAI leva area e profundoMax ao servidor',
  /function callAI\(sys,usr,maxTok,model,grounding,opts\)/.test(html) && /if\(opts&&opts\.area\)p\.area=String\(opts\.area\);/.test(html) && /if\(opts&&opts\.profundoMax\)p\.profundoMax=opts\.profundoMax;/.test(html));
ok('callAIJson repassa opts também na nova tentativa',
  /return callAI\(sys,usr,maxTok,model,grounding,opts\)\.then/.test(html) && /callAIJson\(sys,usr,maxTok,retries-1,model,grounding,opts\)/.test(html));

// ---- 2. servidor real: o teto por pedido só abaixa ---------------------------------------
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'ci-test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'ci-test-service-key';
const aiSrc = fs.readFileSync(path.join(ROOT, 'api/ai.js'), 'utf8');
const SENT = (aiSrc.match(/SYS_SPLIT\s*=\s*'([^']+)'/) || [])[1];
const { deepFor, TETO_PROFUNDO } = require(path.join(ROOT, 'lib/clinical-deep'));
const handler = require(path.join(ROOT, 'api/ai.js'));
let enviado = null;
global.fetch = async (u, o) => {
  if (String(u).indexOf('/auth/v1/user') >= 0) return { ok: true, status: 200, json: async () => ({ id: 'user-ci', email: 'aluno@ci.test' }) };
  enviado = JSON.parse(o.body);
  return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: '{}' }], usage: {} }) };
};
function pedir(extra) {
  enviado = null;
  const res = { statusCode: 0, setHeader() {}, end() {} };
  const body = Object.assign({ system: 'D'.repeat(38000) + SENT + 'PERSONA DA FERRAMENTA', prompt: 'Caso de Adrenal.', maxTokens: 500 }, extra);
  return handler({ method: 'POST', headers: { origin: 'https://endodirect.com.br', authorization: 'Bearer t' }, body: JSON.stringify(body) }, res)
    .then(() => enviado);
}
const AREA = 'Adrenal Incidentaloma adrenal';
const profundoDe = (b) => (b && Array.isArray(b.system) && b.system.length === 3 ? b.system[1].text : '');

(async () => {
  const cheio = profundoDe(await pedir({ area: AREA }));
  ok('sem teto: o profundo é o da área no teto do servidor', cheio.length > 0 && cheio === deepFor(AREA, TETO_PROFUNDO, AREA), String(cheio.length));
  const b120 = await pedir({ area: AREA, profundoMax: TETO_FERRAMENTA });
  const p120 = profundoDe(b120);
  ok('com o teto das ferramentas: o recorte cabe no teto e é o mesmo do deepFor', p120.length > 0 && p120.length <= TETO_FERRAMENTA && p120 === deepFor(AREA, TETO_FERRAMENTA, AREA), String(p120.length));
  ok('o recorte é menor que o bloco inteiro', p120.length < cheio.length);
  ok('três blocos: diretrizes e profundo cacheáveis, persona por último', b120 && b120.system[0].cache_control && b120.system[1].cache_control && !b120.system[2].cache_control && b120.system[2].text === 'PERSONA DA FERRAMENTA');
  ok('diretrizes inteiras no bloco 0 (sem o corte de 60 mil)', b120 && b120.system[0].text.length === 38000);
  const p120b = profundoDe(await pedir({ area: AREA, profundoMax: TETO_FERRAMENTA }));
  ok('mesma área e mesmo teto → bloco idêntico (o cache da avaliação acerta)', p120b === p120);
  const acima = profundoDe(await pedir({ area: AREA, profundoMax: 9999999 }));
  ok('🧨 profundoMax acima do teto do servidor não sobe nada', acima === cheio);
  const lixo = profundoDe(await pedir({ area: AREA, profundoMax: 'abc' }));
  const negativo = profundoDe(await pedir({ area: AREA, profundoMax: -5 }));
  ok('profundoMax inválido é ignorado', lixo === cheio && negativo === cheio);
  const semArea = await pedir({ profundoMax: TETO_FERRAMENTA });
  ok('sem área não há profundo (dois blocos)', semArea && Array.isArray(semArea.system) && semArea.system.length === 2);

  if (bad) { console.log('\n' + bad + ' falha(s): ferramentas com diretrizes e aprofundamento'); process.exit(1); }
  console.log('ferramentas do aluno com diretrizes inteiras e aprofundamento limitado: ok');
})().catch((e) => { console.error('erro no teste das ferramentas:', e); process.exit(1); });
