// Endodirect — Cupons de PARCEIRO (23/11/2026).
// =====================================================================
// Pedido do professor ("Vamos desenvolver isso"): cupom de parceiro com
// desconto, registro de quem trouxe cada venda e um quadro no painel.
// Primeiro caso: a parceria com um endocrinologista que divulga em grupos de
// WhatsApp. Proposta discutida: desconto para os membros (ex.: 15%) e
// comissão de 20% sobre o valor pago no 1º ano (25% a partir de N vendas no
// semestre), paga conforme o dinheiro entra.
//
// Regras:
//   - Só no plano ANUAL (order.js). O mensal não aceita cupom.
//   - O FUNDADOR continua à parte (lib/founder.js); o banco recusa esse código
//     na tabela de parceiros.
//   - Cupom cadastrado no painel (tabela endodirect_cupons, RPC só de
//     professor). Aqui só se LÊ, com a service role.
//   - Cada pedido pago com cupom vira UMA linha em endodirect_cupom_vendas
//     (order_id único): o cartão grava na hora e o webhook (order.paid) grava
//     também; o segundo é ignorado. Estorno marca a linha como "estornado".
//   - A venda guarda plano, método, valores e o pedido do pagar.me. NUNCA nome
//     ou e-mail do aluno: o relatório da comissão vai para o parceiro.
//   - Falha aqui nunca derruba a venda nem a liberação do acesso.
// =====================================================================
'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function sbHeaders() { return { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, 'Content-Type': 'application/json', Accept: 'application/json' }; }

function normCodigo(s) { return String(s == null ? '' : s).trim().toUpperCase(); }
function codigoValido(c) { return /^[A-Z0-9_-]{3,30}$/.test(c) && c !== 'FUNDADOR'; }

// Preço com desconto, em centavos. Mesma conta da tela (index.html, ckPrecoCupom):
// arredonda para o centavo mais próximo.
function precoComCupom(centavos, descontoPct) {
  const v = Number(centavos) || 0, d = Math.max(0, Math.min(50, Number(descontoPct) || 0));
  return Math.round(v * (100 - d) / 100);
}

// Cupom vigente para o plano, ou null. `agora` só para os testes.
function cupomVale(c, plano, agora) {
  if (!c || !c.ativo) return false;
  if (c.valido_ate && Date.parse(c.valido_ate) <= (agora || Date.now())) return false;
  const planos = Array.isArray(c.planos) ? c.planos : [];
  return planos.indexOf(String(plano || '').toLowerCase()) >= 0;
}

// Lê o cupom no banco. Devolve { cupom } (pode ser null = não existe) ou
// { erro } se o banco não respondeu: aí a venda NÃO segue com desconto, e o
// aluno é avisado para tentar de novo (melhor que cobrar sem o desconto).
async function buscarCupom(codigo) {
  const c = normCodigo(codigo);
  if (!codigoValido(c)) return { cupom: null };
  if (!SERVICE_ROLE) return { erro: 'sem chave' };
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/endodirect_cupons?codigo=eq.' + encodeURIComponent(c)
      + '&select=codigo,parceiro,desconto_pct,planos,ativo,valido_ate', { headers: sbHeaders() });
    if (!r.ok) return { erro: 'HTTP ' + r.status };
    const rows = await r.json().catch(function () { return null; });
    if (!Array.isArray(rows)) return { erro: 'resposta inesperada' };
    return { cupom: rows[0] || null };
  } catch (e) {
    return { erro: (e && e.message) || 'falha' };
  }
}

// CUPOM SÓ NA PRIMEIRA COMPRA (professor, 23/11/2026: "Pode sim"). Já pagou a plataforma alguma vez (acesso
// pago em qualquer situação ou assinatura recorrente)? true/false; null se não deu para conferir. Nunca lança.
async function jaPagou(email) {
  email = String(email || '').trim().toLowerCase();
  if (!email || !SERVICE_ROLE) return null;
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/endodirect_ja_pagou', { method: 'POST', headers: sbHeaders(), body: JSON.stringify({ p_email: email }) });
    if (!r.ok) return null;
    const v = await r.json().catch(function () { return null; });
    return v === true ? true : (v === false ? false : null);
  } catch (e) {
    return null;
  }
}

// Grava a venda atribuída (idempotente pelo order_id). Nunca lança.
async function registrarVenda(v) {
  try {
    if (!SERVICE_ROLE || !v || !v.order_id || !codigoValido(normCodigo(v.codigo))) return false;
    const linha = {
      codigo: normCodigo(v.codigo), plano: String(v.plano || '').toLowerCase() || 'gold', ciclo: 'anual',
      metodo: v.metodo || null, valor_cheio: Math.round(Number(v.valor_cheio) || 0),
      valor_pago: Math.round(Number(v.valor_pago) || 0), order_id: String(v.order_id), status: 'pago',
      pago_em: v.pago_em || new Date().toISOString()
    };
    const r = await fetch(SUPABASE_URL + '/rest/v1/endodirect_cupom_vendas?on_conflict=order_id', {
      method: 'POST', headers: Object.assign({}, sbHeaders(), { Prefer: 'resolution=ignore-duplicates,return=minimal' }),
      body: JSON.stringify(linha)
    });
    if (!r.ok) { console.log('[cupom] venda nao gravada status=' + r.status + ' pedido=' + linha.order_id); return false; }
    return true;
  } catch (e) {
    console.log('[cupom] venda nao gravada:', (e && e.message) || e);
    return false;
  }
}

// Estorno ou contestação do pedido: a venda sai da comissão. Nunca lança.
async function estornarVenda(orderId) {
  try {
    if (!SERVICE_ROLE || !orderId) return false;
    const r = await fetch(SUPABASE_URL + '/rest/v1/endodirect_cupom_vendas?order_id=eq.' + encodeURIComponent(orderId) + '&status=eq.pago', {
      method: 'PATCH', headers: Object.assign({}, sbHeaders(), { Prefer: 'return=minimal' }),
      body: JSON.stringify({ status: 'estornado', estornado_em: new Date().toISOString() })
    });
    return r.ok;
  } catch (e) {
    console.log('[cupom] estorno nao marcado:', (e && e.message) || e);
    return false;
  }
}

module.exports = { normCodigo, codigoValido, precoComCupom, cupomVale, buscarCupom, jaPagou, registrarVenda, estornarVenda };
