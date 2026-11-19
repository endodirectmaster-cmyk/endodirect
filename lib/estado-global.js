// Leitura e gravação do estado global (endodirect_global_state, id = 'main') pelo servidor.
//
// ⚠️🐛 INCIDENTE DE 19/11/2026 (07:46 BRT). O Supabase respondeu 503 por alguns segundos durante
// o cron diário. O `loadPayload` da rotina de e-mails devolvia `{}` quando a leitura falhava, a
// rotina acrescentava só o seu ledger (`trial_emails`) e gravava esse objeto como o payload
// INTEIRO: provas, Resumos, cursos, podcasts e a fila da Questão do Dia sumiram para todos.
// As rotinas seguintes leram o estado já vazio, acharam o ledger zerado e reenviaram e-mails
// de campanha. Restaurado do backup no mesmo dia.
//
// Regra, para todo código de servidor que lê e regrava o payload:
//  1. Leitura que falhou (HTTP não 2xx, JSON ilegível, linha ausente, payload que não é
//     objeto) LANÇA ERRO. Nunca vira `{}`: "não consegui ler" não é "servidor vazio".
//  2. Antes de gravar o payload inteiro, `confereParaGravar` recusa o objeto que não traz nem
//     `provas` nem `diretrizes`: é a assinatura de um payload montado do nada.
// O mesmo princípio vale no painel desde o incidente de 19/10/2026 (ver queueRemoteStateSave).

async function payloadDaResposta(r) {
  if (!r || !r.ok) throw new Error('estado global: leitura falhou (HTTP ' + ((r && r.status) || '?') + ')');
  let rows;
  try { rows = await r.json(); } catch (e) { throw new Error('estado global: resposta ilegível na leitura'); }
  const p = Array.isArray(rows) && rows[0] ? rows[0].payload : null;
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('estado global: linha main sem payload');
  return p;
}

function confereParaGravar(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('estado global: payload inválido; gravação recusada');
  }
  if (!Array.isArray(payload.provas) && !Array.isArray(payload.diretrizes)) {
    throw new Error('estado global: payload sem provas nem diretrizes (leitura incompleta?); gravação recusada');
  }
  return payload;
}

module.exports = { payloadDaResposta, confereParaGravar };
