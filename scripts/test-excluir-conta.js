#!/usr/bin/env node
// EXCLUSÃO DE CONTA PELO ALUNO E CONTA DE REVISÃO DAS LOJAS (19/10/2026).
//
// O Google Play e a App Store exigem que a conta criada no app possa ser excluída
// dentro dele, com os dados. Este teste chama as rotinas DE VERDADE
// (lib/excluir-conta.js, lib/conta-revisao.js e o roteamento de api/ai.js), com o
// banco, o Auth e o pagar.me falsos, e prende:
//   (1) a ordem: listar → cancelar no pagar.me → apagar pela chave → anonimizar os
//       pagamentos → apagar o usuário. Nada sai antes de toda assinatura cancelar;
//   (2) assinatura que não cancela = nada apagado. "Já cancelada" e "não existe"
//       contam como canceladas;
//   (3) falha no meio para antes do usuário (repetir termina a exclusão);
//   (4) professor recusado; conta que já não existe responde ok sem apagar nada;
//   (5) a identidade vem SÓ do token: o corpo não escolhe quem é excluído, e sem a
//       palavra EXCLUIR nada acontece;
//   (6) a conta de revisão: só professor gera, a senha volta sem cache, a conta
//       nova nasce confirmada e com Gold + EndoTEEM, a existente só troca a senha.
'use strict';
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const consoleOriginal = { log: console.log, error: console.error };
console.log = function () {}; console.error = function () {};
process.env.SUPABASE_URL = 'https://sb.teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv_teste';
process.env.PAGARME_SECRET_KEY = 'sk_test_teste';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'ci-test-key';

const LIB = require(path.join(RAIZ, 'lib', 'excluir-conta.js'));
const REV = require(path.join(RAIZ, 'lib', 'conta-revisao.js'));

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ---- fetch falso, roteado por URL e método; cada teste monta o cenário ----
let cen = {};
let chamadas = [];
function resp(status, body) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body), text: () => Promise.resolve(JSON.stringify(body)) });
}
global.fetch = function (url, opts) {
  url = String(url); opts = opts || {};
  const m = (opts.method || 'GET').toUpperCase();
  const corpo = opts.body ? (() => { try { return JSON.parse(opts.body); } catch (e) { return opts.body; } })() : null;
  chamadas.push({ url, m, corpo });
  if (url.indexOf('/rest/v1/rpc/endodirect_exclusao') >= 0) {
    const etapa = corpo && corpo.p_etapa;
    const r = (cen.etapas || {})[etapa];
    return r ? resp(r.status || 200, r.body) : resp(500, { message: 'sem cenário para ' + etapa });
  }
  if (url.indexOf('api.pagar.me') >= 0) {
    const id = decodeURIComponent(url.split('/subscriptions/')[1] || '');
    const s = (cen.pagarme || {})[id] || { del: 200 };
    if (m === 'DELETE') return resp(s.del, { id, status: s.del < 300 ? 'canceled' : 'active' });
    return resp(s.get || 200, { id, status: s.status || 'active' });
  }
  if (url.indexOf('/rest/v1/') >= 0 && m === 'DELETE') {
    const tabela = url.split('/rest/v1/')[1].split('?')[0];
    const st = (cen.apagar || {})[tabela] || 204;
    return resp(st, null);
  }
  if (url.indexOf('/auth/v1/admin/users/') >= 0 && m === 'DELETE') return resp(cen.authDel || 200, {});
  if (url.indexOf('/auth/v1/admin/users/') >= 0 && m === 'PUT') return resp(cen.authPut || 200, { id: 'uid-revisao' });
  if (url.indexOf('/auth/v1/admin/users?') >= 0) return resp(200, { users: cen.usuarios || [] });
  if (url.indexOf('/auth/v1/admin/users') >= 0 && m === 'POST') return resp(cen.authPost || 200, { id: 'uid-revisao-nova', email: 'revisao@endodirect.com.br' });
  if (url.indexOf('/auth/v1/user') >= 0) return cen.sessao ? resp(200, cen.sessao) : resp(401, {});
  if (url.indexOf('/rest/v1/endodirect_admins') >= 0) return resp(200, cen.admin ? [{ email: cen.sessao && cen.sessao.email }] : []);
  if (url.indexOf('/rest/v1/endodirect_acessos') >= 0) {
    if (m === 'GET') return resp(200, cen.acessosRevisao || []);
    return resp(cen.acessoGrava || 201, null);
  }
  return resp(404, { message: 'sem rota: ' + m + ' ' + url });
};

const LISTA = {
  ok: true,
  assinaturas: ['sub_A'],
  acessos: ['a1b2c3d4-0000-4000-8000-000000000001'],
  push: ['https://fcm.googleapis.com/fcm/send/abc:APA91b-x_y?z=1'],
  newsletter: ['Aluno.Teste@Gmail.com'],
  suporte: ['5e2b0000-0000-4000-8000-0000000000aa']
};
function etapasPadrao() {
  return { listar: { body: LISTA }, anonimizar: { body: { ok: true, acessos_anonimizados: 1, registro_emails: 1 } } };
}
const USER = { id: '0e5c1a7e-0000-4000-8000-00000000e5c1', email: 'aluno.teste@gmail.com' };
const idx = (pred) => chamadas.findIndex(pred);
const ehRpc = (etapa) => (c) => c.url.indexOf('/rpc/endodirect_exclusao') >= 0 && c.corpo && c.corpo.p_etapa === etapa;
const ehPagarme = (c) => c.url.indexOf('api.pagar.me') >= 0;
const ehApagarRest = (c) => c.url.indexOf('/rest/v1/') >= 0 && c.url.indexOf('/rpc/') < 0 && c.m === 'DELETE';
const ehApagarUser = (c) => c.url.indexOf('/auth/v1/admin/users/') >= 0 && c.m === 'DELETE';

async function rodar() {
  // (1) caminho feliz, na ordem certa
  cen = { etapas: etapasPadrao() }; chamadas = [];
  let r = await LIB.excluirConta(USER);
  ok(r.ok === true, '(1) exclusão completa devolve ok');
  const iL = idx(ehRpc('listar')), iP = idx(ehPagarme), iR = idx(ehApagarRest), iA = idx(ehRpc('anonimizar')), iU = idx(ehApagarUser);
  ok(iL === 0, '(1) a primeira chamada é a lista');
  ok(iL < iP && iP < iR, '(1) a assinatura é cancelada ANTES de qualquer dado sair');
  ok(iR < iA && iA < iU, '(1) apaga pela chave, anonimiza os pagamentos e só então apaga o usuário');
  ok(chamadas[iP].m === 'DELETE' && /\/subscriptions\/sub_A$/.test(chamadas[iP].url), '(1) cancela a assinatura certa no pagar.me');
  ok(chamadas[iU].url.endsWith('/auth/v1/admin/users/' + USER.id), '(1) apaga o usuário certo no Auth');
  const apagados = chamadas.filter(ehApagarRest).map((c) => decodeURIComponent(c.url.split('/rest/v1/')[1]));
  ok(apagados.some((u) => u.indexOf('endodirect_acessos?id=in.(' + LISTA.acessos[0] + ')') === 0), '(1) apaga os acessos sem pagamento pelo id');
  ok(apagados.some((u) => u === 'endodirect_push_subs?endpoint=eq.' + LISTA.push[0]), '(1) apaga o aparelho de notificação pelo endpoint exato (com ":" e "?")');
  ok(chamadas.some((c) => c.url.endsWith('endodirect_push_subs?endpoint=eq.' + encodeURIComponent(LISTA.push[0]))), '(1) o endpoint vai codificado na URL ("?" e "&" cru quebrariam o filtro)');
  ok(apagados.some((u) => u === 'endodirect_newsletter_optin?email=eq.' + LISTA.newsletter[0]), '(1) apaga a inscrição com o e-mail exatamente como está guardado');
  ok(apagados.some((u) => u.indexOf('endodirect_support?id=in.(' + LISTA.suporte[0] + ')') === 0), '(1) apaga os tickets de suporte pelo id');
  ok(chamadas.filter(ehApagarRest).every((c) => c.url.indexOf('user_id=') < 0 && c.url.indexOf('ilike') < 0), '(1) nunca apaga por filtro largo (user_id/ilike): só pela chave que a lista devolveu');

  // (2) assinatura que não cancela: nada sai
  cen = { etapas: etapasPadrao(), pagarme: { sub_A: { del: 500, get: 200, status: 'active' } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && r.code === 502 && r.error === LIB.ERRO_ASSINATURA, '(2) assinatura que não cancela devolve o aviso da assinatura');
  ok(idx(ehApagarRest) < 0 && idx(ehRpc('anonimizar')) < 0 && idx(ehApagarUser) < 0, '(2) e NADA é apagado nem anonimizado');

  // (2b) já cancelada lá: segue
  cen = { etapas: etapasPadrao(), pagarme: { sub_A: { del: 400, get: 200, status: 'canceled' } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === true && idx(ehApagarUser) >= 0, '(2b) assinatura que já estava cancelada no pagar.me não impede a exclusão');
  // (2c) não existe lá: segue
  cen = { etapas: etapasPadrao(), pagarme: { sub_A: { del: 404 } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === true && idx(ehApagarUser) >= 0, '(2c) assinatura inexistente no pagar.me não impede a exclusão');
  // (2d) erro ao consultar o estado depois da recusa: para
  cen = { etapas: etapasPadrao(), pagarme: { sub_A: { del: 500, get: 500 } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && idx(ehApagarRest) < 0, '(2d) sem confirmar o cancelamento, nada sai');
  // (2e) sem a chave do pagar.me e com assinatura: para
  const sk = process.env.PAGARME_SECRET_KEY; delete process.env.PAGARME_SECRET_KEY;
  cen = { etapas: etapasPadrao() }; chamadas = [];
  r = await LIB.excluirConta(USER);
  process.env.PAGARME_SECRET_KEY = sk;
  ok(r.ok === false && r.error === LIB.ERRO_ASSINATURA && idx(ehApagarRest) < 0 && idx(ehPagarme) < 0, '(2e) sem a chave do pagar.me, quem tem assinatura não é excluído');
  // (2f) sem assinatura: o pagar.me nem é chamado
  cen = { etapas: Object.assign(etapasPadrao(), { listar: { body: Object.assign({}, LISTA, { assinaturas: [] }) } }) }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === true && idx(ehPagarme) < 0, '(2f) sem assinatura, o pagar.me não é chamado');

  // (3) falha no meio: para antes do usuário
  cen = { etapas: etapasPadrao(), apagar: { endodirect_support: 500 } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && r.error === LIB.ERRO_GERAL, '(3) falha ao apagar devolve o aviso de tentar de novo');
  ok(idx(ehRpc('anonimizar')) < 0 && idx(ehApagarUser) < 0, '(3) e o usuário continua (repetir termina a exclusão)');
  cen = { etapas: Object.assign(etapasPadrao(), { anonimizar: { status: 500, body: { message: 'x' } } }) }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && idx(ehApagarUser) < 0, '(3b) se a anonimização falha, o usuário não é apagado');
  cen = { etapas: Object.assign(etapasPadrao(), { anonimizar: { body: { ok: false, motivo: 'etapa_invalida' } } }) }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && idx(ehApagarUser) < 0, '(3e) anonimização recusada (resposta sem erro HTTP) também segura o usuário');
  cen = { etapas: etapasPadrao(), authDel: 404 }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === true, '(3c) usuário que já não existe no Auth conta como apagado');
  cen = { etapas: etapasPadrao(), authDel: 500 }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false, '(3d) Auth fora do ar: a exclusão não é dada como feita');

  // (4) professor e conta inexistente
  cen = { etapas: { listar: { body: { ok: false, motivo: 'admin' } } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === false && r.code === 403 && chamadas.length === 1, '(4) conta de professor é recusada sem nenhuma outra chamada');
  cen = { etapas: { listar: { body: { ok: false, motivo: 'nao_encontrado' } } } }; chamadas = [];
  r = await LIB.excluirConta(USER);
  ok(r.ok === true && chamadas.length === 1, '(4b) conta que já não existe: ok, sem apagar nada');
  r = await LIB.excluirConta(null);
  ok(r.ok === false && r.code === 401, '(4c) sem usuário: 401');

  // (5) roteamento em api/ai.js: identidade só pelo token, e EXCLUIR obrigatório
  const handler = require(path.join(RAIZ, 'api', 'ai.js'));
  async function chamar(body, headers) {
    const res = { statusCode: 0, headers: {}, corpo: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.corpo = b; } };
    const h = Object.assign({ origin: 'https://www.endodirect.com.br' }, headers || {});
    await handler({ method: 'POST', headers: h, body: JSON.stringify(body) }, res);
    let j = null; try { j = JSON.parse(res.corpo); } catch (e) {}
    return { status: res.statusCode, j, headers: res.headers };
  }
  cen = { etapas: etapasPadrao() }; chamadas = [];
  let h = await chamar({ kind: 'excluir_conta', confirmar: 'EXCLUIR' });
  ok(h.status === 401 && idx(ehRpc('listar')) < 0, '(5) sem token: 401 e nada consultado');
  cen = { etapas: etapasPadrao(), sessao: { id: USER.id, email: USER.email } }; chamadas = [];
  h = await chamar({ kind: 'excluir_conta', confirmar: 'sim' }, { authorization: 'Bearer t' });
  ok(h.status === 400 && idx(ehRpc('listar')) < 0, '(5b) sem a palavra EXCLUIR: 400 e nada consultado');
  cen = { etapas: etapasPadrao(), sessao: { id: USER.id, email: USER.email } }; chamadas = [];
  h = await chamar({ kind: 'excluir_conta', confirmar: 'excluir', user_id: 'OUTRO-USUARIO', p_user_id: 'OUTRO-USUARIO', email: 'outro@x.com' }, { authorization: 'Bearer t' });
  const lst = chamadas.find(ehRpc('listar'));
  ok(h.status === 200 && h.j && h.j.ok === true, '(5c) com token e EXCLUIR (sem distinguir caixa): 200');
  ok(lst && lst.corpo.p_user_id === USER.id, '(5d) o usuário excluído é o do TOKEN, nunca o do corpo');
  ok(chamadas.filter(ehApagarUser).every((c) => c.url.endsWith('/' + USER.id)), '(5e) e é ele que sai do Auth');

  // (6) conta de revisão
  cen = { sessao: { id: 'u-aluno', email: 'aluno.teste@gmail.com' }, admin: false }; chamadas = [];
  h = await chamar({ kind: 'conta_revisao' }, { authorization: 'Bearer t' });
  ok(h.status === 401 && !chamadas.some((c) => c.url.indexOf('/auth/v1/admin/users') >= 0), '(6) aluno não gera a conta de revisão (401, nada tocado)');
  cen = { sessao: { id: 'u-prof', email: 'prof@teste.com' }, admin: true, usuarios: [] }; chamadas = [];
  h = await chamar({ kind: 'conta_revisao' }, { authorization: 'Bearer t' });
  const criou = chamadas.find((c) => c.url.endsWith('/auth/v1/admin/users') && c.m === 'POST');
  ok(h.status === 200 && h.j && h.j.ok && h.j.criada === true && h.j.email === REV.EMAIL_REVISAO, '(6b) professor cria a conta de revisão');
  ok(String(h.headers['cache-control'] || '') === 'no-store', '(6c) a resposta com a senha vai sem cache');
  ok(criou && criou.corpo.email_confirm === true && criou.corpo.password === h.j.senha, '(6d) a conta nasce confirmada, com a senha devolvida ao professor');
  const gravados = chamadas.filter((c) => c.url.indexOf('/rest/v1/endodirect_acessos') >= 0 && c.m === 'POST').map((c) => c.corpo);
  ok(['plano:gold', 'curso:endoteem'].every((s) => gravados.some((g) => g.scope === s && g.status === 'active' && g.provider === 'interno' && g.user_id === 'uid-revisao-nova' && g.expires_at === null)),
    '(6e) a conta recebe Gold e EndoTEEM, ativos, internos e sem vencimento');
  cen = { sessao: { id: 'u-prof', email: 'prof@teste.com' }, admin: true, usuarios: [{ id: 'uid-revisao', email: 'Revisao@Endodirect.com.br' }], acessosRevisao: [{ id: 'linha-1' }] }; chamadas = [];
  h = await chamar({ kind: 'conta_revisao' }, { authorization: 'Bearer t' });
  ok(h.status === 200 && h.j.criada === false, '(6f) conta existente: só troca a senha');
  ok(!chamadas.some((c) => c.url.endsWith('/auth/v1/admin/users') && c.m === 'POST'), '(6g) e não cria outra');
  ok(chamadas.some((c) => c.url.endsWith('/auth/v1/admin/users/uid-revisao') && c.m === 'PUT' && c.corpo.password === h.j.senha), '(6h) a senha nova vai para a conta existente');
  ok(chamadas.filter((c) => c.url.indexOf('endodirect_acessos?id=eq.linha-1') >= 0 && c.m === 'PATCH').length === 2, '(6i) e os acessos dela são reativados no lugar');

  // (6j) senhas: grupos legíveis, sem caracteres ambíguos, todas diferentes
  const senhas = new Set();
  let formato = true;
  for (let i = 0; i < 300; i++) {
    const s = REV.gerarSenha();
    senhas.add(s);
    if (!/^[a-km-zA-HJ-NP-Z2-9]{4}(-[a-km-zA-HJ-NP-Z2-9]{4}){3}$/.test(s) || !/[a-z]/.test(s) || !/[A-Z]/.test(s) || !/[0-9]/.test(s)) formato = false;
  }
  ok(formato, '(6j) a senha tem 4 grupos de 4, com minúscula, maiúscula e dígito, sem 0/O/1/l/I');
  ok(senhas.size === 300, '(6k) 300 senhas geradas, 300 diferentes');
}

rodar().then(() => {
  console.log = consoleOriginal.log; console.error = consoleOriginal.error;
  if (falhas.length) {
    console.error('test-excluir-conta: ' + falhas.length + ' falha(s):\n  - ' + falhas.join('\n  - '));
    process.exit(1);
  }
  console.log('test-excluir-conta: ok');
}).catch((e) => {
  console.log = consoleOriginal.log; console.error = consoleOriginal.error;
  console.error('test-excluir-conta: erro inesperado:', (e && e.stack) || e);
  process.exit(1);
});
