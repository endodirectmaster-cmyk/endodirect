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
//   • e "publicado" é a data do EVENTO, não só a do feed (10/11/2026): o feed da
//     FDA republicou páginas de 2024 com data nova e uma delas virou o push das
//     07:45. Vale `dataEvento` gravado no item ou, nos itens anteriores à
//     correção, a data mais recente citada no título e no texto;
//   • envio antes do save do payload: a marca vai no MESMO write dos itens.
//
// O que este módulo NÃO faz: decidir horário (os runs são 07:30 e 17:00 BRT;
// o "Atualizar radar agora" do painel também passa por aqui, e o professor está
// na tela), nem repetir o envio se a gravação do payload falhar depois do push
// (o item volta como `fresh` no run seguinte — caso raro, anotado em Pendências).
'use strict';
const { isBreakingTrusted, dataDoEvento } = require('./news');

const DIA_MS = 86400000;
const PUBLICACAO_MAX_MS = 7 * DIA_MS;
const BASE_PADRAO = 'https://www.endodirect.com.br';

function diaBRT(ms) { return new Date(Number(ms) - 3 * 3600000).toISOString().slice(0, 10); }
function keyOf(item) { return item && (item.sourceId || item.link || item.titulo); }
function eventoVelho(item, agora) {
  const d = Number(item && item.dataEvento) || dataDoEvento(item);
  return d > 0 && agora - d > PUBLICACAO_MAX_MS;
}

// Puro. Devolve { item, motivo }: `item` é o candidato (o mais recente) ou null.
function escolherBreakingParaPush(fresh, avisos, agora) {
  agora = Number(agora) || Date.now();
  const hoje = diaBRT(agora);
  const jaHoje = (Array.isArray(avisos) ? avisos : []).some((it) => it && Number(it.pushAutoAt) > 0 && diaBRT(it.pushAutoAt) === hoje);
  if (jaHoje) return { item: null, motivo: 'teto diário: já houve push automático hoje' };
  const candidatos = (Array.isArray(fresh) ? fresh : []).filter((it) => it && it.breaking && isBreakingTrusted(it) && !it.pushAutoAt
    && !(Number(it.at) > 0 && agora - Number(it.at) > PUBLICACAO_MAX_MS)
    && !eventoVelho(it, agora));
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
    body: String((item && (item.titulo_pt || item.titulo)) || '').slice(0, 300), // título em português quando o radar o gerou (11/10/2026)
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

// ── BREAKING NEWS DO PROFESSOR: NOTIFICA SOZINHO (24/11/2026) ─────────────────────────
// Professor: "Quando for breaking news, automaticamente já dispare". Vale para todo card
// de `adm_avisos` (o Mural do professor) com tipo Breaking News, venha ele do painel ou
// de uma gravação direta no banco: o card do ORION-4 virou Breaking News por SQL e
// ninguém foi notificado, porque o push só saía pelo botão/caixa do painel.
//   • quem lista o que falta é o banco (RPC endodirect_breaking_pendentes): Breaking
//     News de adm_avisos sem linha em endodirect_push_breaking e sem `pushAutoAt` (o
//     card do radar já notificado não repete quando o professor o edita);
//   • UMA notificação por card: a RPC endodirect_breaking_reservar grava a chave ANTES
//     do envio (insert on conflict do nothing); só quem gravou primeiro envia, então
//     duas chamadas ao mesmo tempo (painel + cron) não duplicam;
//   • no máximo 3 por chamada: um lote inteiro marcado de uma vez não vira rajada;
//   • se o envio falhar depois da reserva, o card fica marcado (melhor perder um push do
//     que mandar dois): o botão 📲 Notificar do painel reenvia.
// Quem chama: o painel depois de salvar o estado global (api/publico?rota=push-breaking),
// o cron diário como reserva, e o Claude depois de gravar Breaking News direto no banco.
async function pushBreakingDoProfessor(opts) {
  opts = opts || {};
  if (typeof opts.configurado === 'function' && !opts.configurado()) return { ok: false, motivo: 'push não configurado no servidor (VAPID)', enviados: [] };
  const lista = await opts.rpc('endodirect_breaking_pendentes', {});
  if (!Array.isArray(lista)) return { ok: false, motivo: 'não consegui ler as Breaking News pendentes', enviados: [] };
  const enviados = [];
  for (const it of lista.slice(0, 3)) {
    if (!it || !it.chave || !it.titulo) continue;
    const reservou = await opts.rpc('endodirect_breaking_reservar', { p_chave: String(it.chave), p_titulo: String(it.titulo) });
    if (reservou !== true) continue;
    const mensagem = mensagemPush({ fonte: it.fonte, titulo: it.titulo }, opts.base);
    let r = null;
    try { r = await opts.enviar(mensagem); } catch (e) { r = { ok: false, error: (e && e.message) || String(e) }; }
    enviados.push({ titulo: it.titulo, ok: !!(r && r.ok), sent: (r && r.sent) || 0, erro: (r && !r.ok && r.error) || '' });
  }
  return { ok: true, motivo: enviados.length ? '' : 'nenhuma Breaking News pendente', enviados, pendentes: lista.length };
}

module.exports = { escolherBreakingParaPush, pushBreakingOficial, pushBreakingDoProfessor, mensagemPush, diaBRT, PUBLICACAO_MAX_MS };
