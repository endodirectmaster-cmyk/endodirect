// Modelos de IA do Endodirect: quais ids valem, como os antigos são remapeados e o que
// cada modelo precisa no corpo da requisição. UM lugar só — api/ai.js, lib/discussao.js,
// lib/radar.js e lib/news.js liam o modelo cada um do seu jeito, e foi assim que um id
// retirado passou pela env ANTHROPIC_MODEL duas vezes (13/07 e 28/07/2026).
//
// GERAÇÃO 5.5 (09/11/2026). Pergunta do professor sobre trocar de modelo; resposta:
// atualizar o app, que ainda usava Opus 4.8 / Sonnet 5 / Haiku 4.5. Ele respondeu
// "Pode fazer". O Opus 5.5 custa menos que o 4.8 (US$ 4/20 contra 5/25 por milhão de
// tokens; leitura de cache US$ 0,20) e o Haiku 5.5 um décimo do Haiku 4.5.
//
// ⚠️ O QUE MUDOU NA API e é a razão deste arquivo existir:
//  - Opus 5.5: o raciocínio NÃO desliga. `thinking: {type: 'disabled'}` é erro 400. O
//    controle passa a ser o `effort`: em `low` o raciocínio fica curto. O raciocínio
//    CONTA no `max_tokens` mesmo sem o texto voltar — sem folga, o JSON dos geradores
//    sai truncado (foi exatamente o defeito do Sonnet 5 em julho).
//  - Sonnet 5.5: `disabled` também é 400; o "sem raciocínio" é `between_tools`, aceito só
//    com esforço até `high`.
//  - Haiku 5.5: `disabled` vale (até `high`).
//  - Os três podem RECUSAR por classificador de segurança (`stop_reason: 'refusal'`,
//    HTTP 200, conteúdo vazio). Opus e Sonnet 5.5 levam `fallbacks: 'default'`: a própria
//    API refaz o pedido no modelo indicado para aquela categoria. O Haiku 5.5 não tem
//    fallback no servidor.
'use strict';

const ATUAIS = { 'claude-opus-5-5': 1, 'claude-sonnet-5-5': 1, 'claude-haiku-5-5': 1 };
// Ids antigos que ainda chegam: index.html em cache no service worker manda
// `claude-opus-4-8`; envs da Vercel podem ter `claude-sonnet-5` ou `claude-sonnet-4-6`.
const LEGADO = {
  'claude-opus-4-8': 'claude-opus-5-5',
  'claude-opus-5': 'claude-opus-5-5',
  'claude-sonnet-4-6': 'claude-sonnet-5-5',
  'claude-sonnet-5': 'claude-sonnet-5-5',
  'claude-haiku-4-5': 'claude-haiku-5-5'
};
const ESFORCOS = { low: 1, medium: 1, high: 1, xhigh: 1, max: 1 };
// Quanto o raciocínio do Opus 5.5 pode ocupar além do texto pedido (medido em 09/11/2026
// na bancada da prévia; ver cofre/Decisões.md).
const FOLGA_RACIOCINIO = 4000;
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

// Id normalizado, ou '' se não for um modelo aceito. Env inválida cai no padrão de quem
// chama, em vez de mandar à API um id que ela recusa.
function normModelo(raw) {
  const s = String(raw || '').trim();
  const m = LEGADO[s] || s;
  return ATUAIS[m] ? m : '';
}

// O que o corpo da requisição precisa para cada modelo, no esforço pedido:
//   corpo    → campos a somar ao corpo (thinking / output_config / fallbacks)
//   folga    → tokens a somar ao max_tokens pedido (espaço do raciocínio)
//   fallback → se manda o cabeçalho beta do fallback no servidor
// Modelos fora da lista (só a bancada de testes os usa) seguem sem nada a mais.
function parametros(modelo, esforco) {
  const e = ESFORCOS[esforco] ? esforco : 'low';
  const ateHigh = (e === 'xhigh' || e === 'max') ? 'high' : e;
  if (modelo === 'claude-opus-5-5') {
    return { corpo: { output_config: { effort: e }, fallbacks: 'default' }, folga: FOLGA_RACIOCINIO, fallback: true };
  }
  if (modelo === 'claude-sonnet-5-5') {
    return { corpo: { thinking: { type: 'between_tools' }, output_config: { effort: ateHigh }, fallbacks: 'default' }, folga: 0, fallback: true };
  }
  if (modelo === 'claude-haiku-5-5') {
    return { corpo: { thinking: { type: 'disabled' }, output_config: { effort: ateHigh } }, folga: 0, fallback: false };
  }
  // Legados (bancada): o comportamento que tinham em produção até 09/11/2026.
  if (modelo === 'claude-sonnet-5' || modelo === 'claude-opus-5') {
    return { corpo: { thinking: { type: 'disabled' }, output_config: { effort: 'low' } }, folga: 0, fallback: false };
  }
  return { corpo: {}, folga: 0, fallback: false };
}

// Corpo completo: `base` traz model-agnóstico (max_tokens, system, messages).
function montarCorpo(base, modelo, esforco) {
  const p = parametros(modelo, esforco);
  return Object.assign({}, base, p.corpo, {
    model: modelo,
    max_tokens: (Number(base && base.max_tokens) || 1500) + p.folga
  });
}

function cabecalhos(apiKey, modelo) {
  const h = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
  if (parametros(modelo).fallback) h['anthropic-beta'] = FALLBACK_BETA;
  return h;
}

// Lê a resposta pelo TIPO dos blocos, não pela posição: no 5.5 ela pode começar por
// blocos `thinking` (vazios) e, se houve fallback, por um bloco `fallback`.
function lerResposta(data) {
  const d = data || {};
  if (d.stop_reason === 'refusal') {
    return { texto: '', recusa: true, categoria: (d.stop_details && d.stop_details.category) || null, modelo: d.model || '' };
  }
  const texto = (Array.isArray(d.content) ? d.content : [])
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text).join('');
  const it = d.usage && Array.isArray(d.usage.iterations) ? d.usage.iterations : [];
  return {
    texto,
    recusa: false,
    truncado: d.stop_reason === 'max_tokens',
    modelo: d.model || '',
    fallback: it.some((x) => x && x.type === 'fallback_message')
  };
}

// Mensagem para o aluno quando a IA recusa: nada de "erro", porque não é defeito do app.
function mensagemRecusa() {
  return 'A IA não respondeu a este pedido. Reformule a pergunta ou tente outro tema.';
}

module.exports = {
  ATUAIS, LEGADO, FOLGA_RACIOCINIO, FALLBACK_BETA,
  normModelo, parametros, montarCorpo, cabecalhos, lerResposta, mensagemRecusa
};
