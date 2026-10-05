// Push AUTOMÁTICO de Breaking News de fonte oficial — decisão do professor em
// 05/10/2026, entre três opções (manual, oficial, todas): "oficial".
//
// Regras:
//   • só item `breaking` que passe em `isBreakingTrusted` (feed oficial ou
//     origem na allowlist de lib/news.js) — comunicado de fonte não oficial
//     continua dependendo do botão 📲 do professor;
//   • só no PRIMEIRO aparecimento (`fresh` da mescla do radar): a lista de
//     candidatos é o que entrou NESTE run, nunca o que já estava gravado;
//   • teto de UM push automático por dia (dia civil de Brasília): a marca
//     `pushAutoAt` fica no próprio item de `radar_avisos`, que é campo do
//     servidor e sobrevive ao save do painel (nenhuma chave nova no payload,
//     nenhuma mudança no gatilho que preserva chaves — ver a lição de 07/09);
//   • item publicado há mais de 7 dias não dispara (um feed que volta de uma
//     pane traz coisa velha como "nova");
//   • envio antes do save do payload: a marca vai no MESMO write dos itens.
//
// O que este módulo NÃO faz: decidir horário (os runs são 07:30 e 17:00 BRT;
// o "Atualizar radar agora" do painel também passa por aqui, e o professor está
// na tela), nem repetir o envio se a gravação do payload falhar depois do push
// (o item volta como `fresh` no run seguinte — caso raro, anotado em Pendências).
'use strict';
const { isBreakingTrusted } = require('./news');

const DIA_MS = 86400000;
const PUBLICACAO_MAX_MS = 7 * DIA_MS;
const BASE_PADRAO = 'https://www.endodirect.com.br';

function diaBRT(ms) { return new Date(Number(ms) - 3 * 3600000).toISOString().slice(0, 10); }
function keyOf(item) { return item && (item.sourceId || item.link || item.titulo); }

// Puro. Devolve { item, motivo }: `item` é o candidato (o mais recente) ou null.
function escolherBreakingParaPush(fresh, avisos, agora) {
  agora = Number(agora) || Date.now();
  const hoje = diaBRT(agora);
  const jaHoje = (Array.isArray(avisos) ? avisos : []).some((it) => it && Number(it.pushAutoAt) > 0 && diaBRT(it.pushAutoAt) === hoje);
  if (jaHoje) return { item: null, motivo: 'teto diário: já houve push automático hoje' };
  const candidatos = (Array.isArray(fresh) ? fresh : []).filter((it) => it && it.breaking && isBreakingTrusted(it) && !it.pushAutoAt
    && !(Number(it.at) > 0 && agora - Number(it.at) > PUBLICACAO_MAX_MS));
  if (!candidatos.length) return { item: null, motivo: 'nenhuma Breaking News oficial nova neste run' };
  candidatos.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  return { item: candidatos[0], motivo: '' };
}

// Mesmo formato do botão 📲 do painel (título "🚨 Breaking News", corpo = título
// do item, link = mural), mais o órgão de origem no título (FDA, ANVISA…).
function mensagemPush(item, base) {
  const orgao = String((item && (item.fonte || item.sourceName)) || '').trim();
  const raiz = String(base || BASE_PADRAO).replace(/\/+$/, '');
  return {
    title: ('🚨 Breaking News' + (orgao ? ' · ' + orgao : '')).slice(0, 120),
    body: String((item && item.titulo) || '').slice(0, 300),
    url: (raiz + '/#mural').slice(0, 400),
    tag: 'endodirect-aviso'
  };
}

function marcar(avisos, item, agora) {
  const k = keyOf(item);
  return (Array.isArray(avisos) ? avisos : []).map((it) => (keyOf(it) === k ? { ...it, pushAutoAt: agora } : it));
}

// Executa: escolhe, envia, marca. Nunca lança (fail-safe, como o resto do radar).
// `enviar(mensagem)` → { ok, sent, ... } (lib/push.sendToAll); `configurado()` → bool.
async function pushBreakingOficial(opts) {
  opts = opts || {};
  const agora = Number(opts.agora) || Date.now();
  const avisos = Array.isArray(opts.avisos) ? opts.avisos : [];
  if (typeof opts.configurado === 'function' && !opts.configurado()) return { sent: false, motivo: 'push não configurado no servidor (VAPID)', avisos };
  const escolha = escolherBreakingParaPush(opts.fresh, avisos, agora);
  if (!escolha.item) return { sent: false, motivo: escolha.motivo, avisos };
  const mensagem = mensagemPush(escolha.item, opts.base);
  let resultado;
  try { resultado = await opts.enviar(mensagem); }
  catch (e) { return { sent: false, motivo: 'envio falhou: ' + ((e && e.message) || e), avisos, item: escolha.item }; }
  if (!resultado || !resultado.ok) return { sent: false, motivo: 'envio recusado: ' + ((resultado && resultado.error) || 'sem detalhe'), avisos, item: escolha.item };
  return { sent: true, motivo: '', avisos: marcar(avisos, escolha.item, agora), item: escolha.item, push: resultado, mensagem };
}

module.exports = { escolherBreakingParaPush, pushBreakingOficial, mensagemPush, diaBRT, PUBLICACAO_MAX_MS };
