// NOTIFICAÇÃO DA QUESTÃO DO DIA NO CELULAR (15/10/2026).
//
// Relato do professor, no iPhone: o botão do e-mail abre no Safari, não no app
// instalado. É regra da Apple: só aplicativo da App Store recebe link de outro
// app; o Endodirect é instalado pela tela inicial e fica de fora. O que abre
// DENTRO do app instalado é a notificação: o toque dispara o `notificationclick`
// do sw.js, que foca (ou abre) o app na url da mensagem. Então a Questão do Dia
// vai também por push, para todas as inscrições de `endodirect_push_subs`.
//
// Quando: no mesmo run da newsletter (cron das 07:30 BRT, depois do auto-post da
// questão), e só quando o e-mail do dia levou uma questão NOVA. Sem chave nova no
// payload: quem marca "já avisada" é `newsletter_qotd_id`, que a newsletter grava
// nesse mesmo run e que o save do painel preserva (lista de chaves do servidor no
// index.html). O painel tem um botão para mandar agora (conferência no aparelho
// e reenvio se o cron falhar); ele passa por aqui também.
'use strict';

const BASE_PADRAO = 'https://www.endodirect.com.br';
const RE_ID = /^[A-Za-z0-9_-]{1,80}$/; // o mesmo filtro do botão do e-mail (newsletter.js)
const CORPO_MAX = 200;

// Corta no fim de uma palavra e termina com reticências; nunca passa de `max`+1.
function cortar(s, max) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const corte = s.lastIndexOf(' ', max - 1);
  return s.slice(0, corte > max * 0.6 ? corte : max - 1).replace(/[\s,;:.]+$/, '') + '…';
}

// Mesmo formato dos outros avisos (lib/push.js: {title, body, url, tag}); a url é
// a do botão do e-mail, /#qotd/<id>, que o app abre na questão (10/10/2026).
function mensagemPushQotd(q, base) {
  const raiz = String(base || BASE_PADRAO).replace(/\/+$/, '');
  const id = RE_ID.test(String((q && q.id) || '')) ? String(q.id) : '';
  const corpo = cortar(q && q.stem, CORPO_MAX) || 'Nova questão publicada. Toque para responder.';
  return {
    title: '🧠 Questão do Dia',
    body: corpo.slice(0, 300),
    url: (raiz + '/#qotd' + (id ? '/' + id : '')).slice(0, 400),
    tag: 'endodirect-qotd' // tag própria: não substitui uma breaking news ainda não lida
  };
}

// Executa: monta, envia. Nunca lança (fail-safe, como o push das breaking news).
// `enviar(mensagem)` → { ok, sent, ... } (lib/push.sendToAll); `configurado()` → bool.
async function pushQotd(opts) {
  opts = opts || {};
  const q = opts.qotd;
  if (!q || !q.stem) return { sent: false, motivo: 'sem Questão do Dia publicada' };
  if (typeof opts.configurado === 'function' && !opts.configurado()) return { sent: false, motivo: 'push não configurado no servidor (VAPID)' };
  if (typeof opts.enviar !== 'function') return { sent: false, motivo: 'sem função de envio' };
  const mensagem = mensagemPushQotd(q, opts.base);
  let resultado;
  try { resultado = await opts.enviar(mensagem); }
  catch (e) { return { sent: false, motivo: 'envio falhou: ' + ((e && e.message) || e), mensagem }; }
  if (!resultado || !resultado.ok) return { sent: false, motivo: 'envio recusado: ' + ((resultado && resultado.error) || 'sem detalhe'), mensagem };
  return { sent: true, motivo: '', mensagem, push: resultado };
}

module.exports = { mensagemPushQotd, pushQotd, cortar, CORPO_MAX };
