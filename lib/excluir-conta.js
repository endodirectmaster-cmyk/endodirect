// Exclusão da conta pelo próprio aluno. O Google Play e a App Store exigem que a
// conta criada no app possa ser excluída DENTRO dele, com os dados. Módulo de lib/
// (NÃO conta como função serverless): roda em api/ai.js, kind:'excluir_conta', que
// já resolveu o usuário pelo token de sessão. NUNCA lança: devolve
// { ok, code, error } para o endpoint responder.
//
// A ORDEM IMPORTA, e cada passo pode ser repetido sem estrago (se a rede cair no
// meio, o aluno tenta de novo e a exclusão termina):
//   1. `endodirect_exclusao(uid,'listar')` devolve as chaves do que sai e as
//      assinaturas do pagar.me ligadas à conta. Professor não se exclui por aqui.
//   2. Cancela no pagar.me TODA assinatura ligada à conta, qualquer que seja o
//      estado aqui (um estorno marca a linha como cancelada sem cancelar a
//      assinatura lá). Se uma não cancelar, nada é apagado: apagar a conta e deixar
//      a mensalidade correndo seria cobrar quem não tem mais conta.
//   3. Apaga, pela chave, os acessos sem pagamento, os aparelhos de notificação, a
//      inscrição na newsletter e os tickets de suporte.
//   4. `endodirect_exclusao(uid,'anonimizar')`: os acessos pagos ficam sem e-mail e
//      sem usuário. O pedido e a assinatura continuam lá, porque estorno e
//      contestação chegam por eles, e o e-mail sai do registro de degustação.
//   5. Apaga o usuário pela API de administração do Auth. O banco leva junto o
//      progresso, os aparelhos e as identidades (ON DELETE CASCADE).
//
// ⚠️ POR QUE A FUNÇÃO DO BANCO NÃO APAGA NADA: o conector do Supabase segura para
// confirmação todo SQL com DELETE, até dentro do corpo de uma função (19/10/2026).
// Apagar pela API, daqui, é o caminho normal e não depende de SQL destrutivo.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const PAGARME_API = 'https://api.pagar.me/core/v5';

const ERRO_GERAL = 'A exclusão não terminou. Tente de novo em alguns minutos: o que já saiu não volta, e o resto sai na próxima tentativa.';
const ERRO_ASSINATURA = 'Não conseguimos cancelar a renovação da sua assinatura, por isso nada foi apagado. Tente de novo em alguns minutos ou escreva para contato@endodirect.com.br.';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function sbHeaders(key, extra) {
  return Object.assign({ apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Accept: 'application/json' }, extra || {});
}
function pagarmeHeaders(secret) {
  return { Authorization: 'Basic ' + Buffer.from(secret + ':').toString('base64'), 'Content-Type': 'application/json', Accept: 'application/json' };
}
function chaves(a) {
  return (Array.isArray(a) ? a : []).filter((x) => x != null && String(x) !== '').map(String);
}

async function etapa(key, uid, nome) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/endodirect_exclusao`, {
    method: 'POST', headers: sbHeaders(key), body: JSON.stringify({ p_user_id: uid, p_etapa: nome })
  });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d || typeof d !== 'object') throw new Error(`etapa ${nome}: HTTP ${r.status}`);
  return d;
}

// "Já cancelada" e "não existe" contam como canceladas: o que importa é que ela
// não cobre mais. Qualquer outra resposta é falha, e a exclusão para.
async function cancelarAssinatura(secret, id) {
  const url = `${PAGARME_API}/subscriptions/${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: 'DELETE', headers: pagarmeHeaders(secret), body: JSON.stringify({ cancel_pending_invoices: true }) });
  if (r.ok || r.status === 404) return true;
  const g = await fetch(url, { method: 'GET', headers: pagarmeHeaders(secret) });
  if (g.status === 404) return true;
  const d = await g.json().catch(() => null);
  return !!(g.ok && d && String(d.status || '').toLowerCase() === 'canceled');
}

async function apagar(key, tabela, filtro) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?${filtro}`, {
    method: 'DELETE', headers: sbHeaders(key, { Prefer: 'return=minimal' })
  });
  if (!r.ok) throw new Error(`apagar ${tabela}: HTTP ${r.status}`);
}

async function excluirConta(user) {
  try {
    if (!user || !user.id) return { ok: false, code: 401, error: 'Entre na sua conta para excluí-la.' };
    const key = serviceKey();
    if (!key) {
      console.error('[excluir-conta] service key ausente');
      return { ok: false, code: 500, error: 'A exclusão está indisponível agora. Tente de novo em alguns minutos.' };
    }
    const uid = String(user.id);

    // 1. O que sai.
    const lista = await etapa(key, uid, 'listar');
    if (!lista.ok) {
      if (lista.motivo === 'admin') return { ok: false, code: 403, error: 'Conta de professor não é excluída por aqui. Fale com o suporte.' };
      if (lista.motivo === 'nao_encontrado') return { ok: true, jaExcluida: true };
      return { ok: false, code: 400, error: ERRO_GERAL };
    }

    // 2. Assinaturas do pagar.me.
    const assinaturas = chaves(lista.assinaturas);
    if (assinaturas.length) {
      const secret = process.env.PAGARME_SECRET_KEY || '';
      if (!secret) {
        console.error('[excluir-conta] PAGARME_SECRET_KEY ausente; assinatura não cancelada');
        return { ok: false, code: 502, error: ERRO_ASSINATURA };
      }
      for (const id of assinaturas) {
        let cancelou = false;
        try { cancelou = await cancelarAssinatura(secret, id); } catch (e) { cancelou = false; }
        if (!cancelou) {
          console.error('[excluir-conta] assinatura não cancelou:', id);
          return { ok: false, code: 502, error: ERRO_ASSINATURA };
        }
      }
    }

    // 3. Acessos sem pagamento, aparelhos de notificação, newsletter e suporte.
    const acessos = chaves(lista.acessos);
    if (acessos.length) await apagar(key, 'endodirect_acessos', 'id=in.(' + acessos.map(encodeURIComponent).join(',') + ')');
    for (const ep of chaves(lista.push)) await apagar(key, 'endodirect_push_subs', 'endpoint=eq.' + encodeURIComponent(ep));
    for (const em of chaves(lista.newsletter)) await apagar(key, 'endodirect_newsletter_optin', 'email=eq.' + encodeURIComponent(em));
    const tickets = chaves(lista.suporte);
    if (tickets.length) await apagar(key, 'endodirect_support', 'id=in.(' + tickets.map(encodeURIComponent).join(',') + ')');

    // 4. Acessos pagos sem identificação e registro de degustação.
    const anon = await etapa(key, uid, 'anonimizar');
    if (!anon.ok && anon.motivo !== 'nao_encontrado') throw new Error('anonimizar: ' + (anon.motivo || '?'));

    // 5. O usuário.
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(uid)}`, {
      method: 'DELETE', headers: sbHeaders(key)
    });
    if (!r.ok && r.status !== 404) throw new Error('auth: HTTP ' + r.status);

    console.log('[excluir-conta] conta excluída', JSON.stringify({
      assinaturas: assinaturas.length, acessosApagados: acessos.length,
      acessosAnonimizados: Number(anon.acessos_anonimizados) || 0, tickets: tickets.length
    }));
    return { ok: true, assinaturasCanceladas: assinaturas.length };
  } catch (e) {
    console.error('[excluir-conta] falha:', (e && e.message) || e);
    return { ok: false, code: 502, error: ERRO_GERAL };
  }
}

module.exports = { excluirConta, cancelarAssinatura, ERRO_GERAL, ERRO_ASSINATURA };
