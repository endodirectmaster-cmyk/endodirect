// MODELOS DE IA — GERAÇÃO 5.5 (09/11/2026).
//
// O professor perguntou se valia trocar de modelo; a resposta foi atualizar o app, que
// ainda chamava Opus 4.8 / Sonnet 5 / Haiku 4.5. Ele disse "Pode fazer".
//
// 🧨 OS MODOS DE QUEBRAR ISTO, todos silenciosos ou quase:
//  - mandar `thinking: {type: 'disabled'}` ao Opus 5.5 ou ao Sonnet 5.5 → erro 400 em
//    TODO gerador (foi o padrão do código até aqui);
//  - esquecer que o raciocínio do Opus 5.5 conta no max_tokens → JSON truncado ("a IA não
//    retornou um JSON válido"), como o Sonnet 5 fez em julho;
//  - ler `content[0]` → no 5.5 a resposta pode começar por blocos `thinking` ou `fallback`;
//  - ignorar `stop_reason: 'refusal'` → o gerador recebe texto vazio e acusa defeito;
//  - deixar a bancada de testes da prévia chegar ao main.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const M = require('../lib/modelos-ia');

// ---- 1. ids --------------------------------------------------------------------------------
ok('Opus 4.8 (index.html em cache) vira Opus 5.5', M.normModelo('claude-opus-4-8') === 'claude-opus-5-5');
ok('Sonnet 5 e o retirado Sonnet 4.6 viram Sonnet 5.5', M.normModelo('claude-sonnet-5') === 'claude-sonnet-5-5' && M.normModelo('claude-sonnet-4-6') === 'claude-sonnet-5-5');
ok('Haiku 4.5 vira Haiku 5.5', M.normModelo('claude-haiku-4-5') === 'claude-haiku-5-5');
ok('os atuais passam como estão', ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'].every((m) => M.normModelo(m) === m));
ok('id inventado ou vazio não passa', M.normModelo('claude-fable-5-2') === '' && M.normModelo('') === '' && M.normModelo(undefined) === '');

// ---- 2. corpo por modelo ---------------------------------------------------------------------
const base = { max_tokens: 2400, system: 'S', messages: [{ role: 'user', content: 'P' }] };
const opus = M.montarCorpo(base, 'claude-opus-5-5', 'low');
ok('Opus 5.5: sem campo thinking (disabled é 400)', !('thinking' in opus), JSON.stringify(opus));
ok('Opus 5.5: esforço explícito', opus.output_config && opus.output_config.effort === 'low');
ok('Opus 5.5: folga no max_tokens para o raciocínio', opus.max_tokens === 2400 + M.FOLGA_RACIOCINIO && M.FOLGA_RACIOCINIO >= 2000);
ok('Opus 5.5: fallback no servidor', opus.fallbacks === 'default');
ok('Opus 5.5: esforço inválido cai em low', M.montarCorpo(base, 'claude-opus-5-5', 'turbo').output_config.effort === 'low');
const sonnet = M.montarCorpo(base, 'claude-sonnet-5-5', 'low');
ok('Sonnet 5.5: between_tools (disabled é 400), sem outro campo dentro', JSON.stringify(sonnet.thinking) === '{"type":"between_tools"}');
ok('Sonnet 5.5: xhigh rebaixado a high (between_tools só aceita até high)', M.montarCorpo(base, 'claude-sonnet-5-5', 'xhigh').output_config.effort === 'high');
ok('Sonnet 5.5: fallback e max_tokens sem folga', sonnet.fallbacks === 'default' && sonnet.max_tokens === 2400);
const haiku = M.montarCorpo(base, 'claude-haiku-5-5', 'low');
ok('Haiku 5.5: disabled vale, sem fallback no servidor', haiku.thinking.type === 'disabled' && !('fallbacks' in haiku));
ok('o corpo não perde system nem messages', opus.system === 'S' && opus.messages.length === 1 && opus.model === 'claude-opus-5-5');
ok('cabeçalho beta do fallback só onde há fallback',
  M.cabecalhos('k', 'claude-opus-5-5')['anthropic-beta'] === M.FALLBACK_BETA && M.cabecalhos('k', 'claude-sonnet-5-5')['anthropic-beta'] === M.FALLBACK_BETA
  && !('anthropic-beta' in M.cabecalhos('k', 'claude-haiku-5-5')) && M.cabecalhos('k', 'claude-opus-5-5')['x-api-key'] === 'k');

// ---- 3. leitura da resposta ------------------------------------------------------------------
const r1 = M.lerResposta({ stop_reason: 'end_turn', model: 'claude-opus-5-5', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: '{"a":' }, { type: 'text', text: '1}' }] });
ok('lê pelo tipo: ignora thinking e junta os textos', r1.texto === '{"a":1}' && !r1.recusa && !r1.truncado);
const r2 = M.lerResposta({ stop_reason: 'refusal', stop_details: { category: 'bio' }, content: [] });
ok('recusa reconhecida, com a categoria', r2.recusa === true && r2.categoria === 'bio' && r2.texto === '');
const r3 = M.lerResposta({ stop_reason: 'end_turn', model: 'claude-opus-4-8', content: [{ type: 'fallback', from: { model: 'claude-opus-5-5' }, to: { model: 'claude-opus-4-8' } }, { type: 'text', text: 'ok' }], usage: { iterations: [{ type: 'message' }, { type: 'fallback_message' }] } });
ok('fallback: texto do modelo que respondeu e sinal de fallback', r3.texto === 'ok' && r3.fallback === true && r3.modelo === 'claude-opus-4-8');
ok('max_tokens marcado como truncado', M.lerResposta({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{' }] }).truncado === true);
ok('resposta vazia ou estranha não quebra', M.lerResposta(null).texto === '' && M.lerResposta({ content: 'x' }).texto === '');

// ---- 4. quem usa ----------------------------------------------------------------------------
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/^\s*\/\/.*$/gm, '');
const ai = ler('api/ai.js');
ok('api/ai.js: padrão Opus 5.5 pela normalização comum', /const DEFAULT_MODEL = normModelo\(process\.env\.ANTHROPIC_MODEL\) \|\| 'claude-opus-5-5';/.test(ai));
ok('api/ai.js: corpo, cabeçalho e leitura pelo módulo', /montarCorpo\(\{ max_tokens: maxTokens, system, messages:/.test(ai) && /headers: cabecalhos\(apiKey, model\)/.test(ai) && /lerResposta\(data\)/.test(ai));
ok('api/ai.js: recusa vira mensagem ao aluno (422), não JSON vazio', /if \(lido\.recusa\) return json\(res, 422, \{ error: mensagemRecusa\(\) \}\);/.test(ai));
ok('api/ai.js: esforço dos geradores explícito', /const ESFORCO_GERADORES = '(low|medium|high)';/.test(ai));
ok('🧨 a bancada de testes da prévia não chegou ao main', !/BANCADA/.test(ai) && !/bancada/i.test(ai), 'remova o bloco BANCADA de api/ai.js antes do merge');
['api/ai.js', 'lib/discussao.js', 'lib/radar.js', 'lib/news.js'].forEach((f) => {
  const src = ler(f);
  ok(f + ': nenhum thinking disabled montado à mão', !/thinking:\s*\{\s*type:\s*'disabled'\s*\}/.test(src));
  ok(f + ': nenhum id de modelo antigo', !/claude-(opus-4-8|sonnet-5'|sonnet-4-6|haiku-4-5)/.test(src));
});
['lib/radar.js', 'lib/news.js'].forEach((f) => {
  const src = ler(f);
  ok(f + ': env normalizada (não usada crua)', /normModelo\(process\.env\.ANTHROPIC_MODEL\) \|\| 'claude-sonnet-5-5'/.test(src) && !/process\.env\.ANTHROPIC_MODEL \|\|/.test(src));
});
ok('discussão: recusa vira motivo próprio', /if \(lido\.recusa\) return \{ ok: false, motivo: 'recusa_ia' \};/.test(ler('lib/discussao.js')));
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
ok('index.html: constantes no Opus 5.5', /var AI_MODEL_CLINICO='claude-opus-5-5';/.test(html) && /var AI_MODEL_SIM_GEN='claude-opus-5-5';/.test(html));
ok('index.html: nenhum id antigo pedido ao servidor', !/'claude-(opus-4-8|sonnet-5|sonnet-4-6|haiku-4-5)'/.test(html));

if (bad) { console.log('\n' + bad + ' falha(s) nos modelos de IA'); process.exit(1); }
console.log('modelos de IA (geração 5.5): ok');
