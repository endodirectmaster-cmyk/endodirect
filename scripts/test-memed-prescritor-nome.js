// Regressão: nome do prescritor na Memed (23/11/2026).
//
// Um aluno entrou pelo Google com o nome escrito errado; esse nome foi o do 1º
// cadastro de prescritor na Memed. Em produção o POST de um prescritor já
// cadastrado falha ("já cadastrado") e o backend só buscava o token: o nome
// corrigido nunca chegava à Memed, e é ele que sai impresso na receita.
// Agora, se o nome mudou, o backend manda um PATCH (só nome e sobrenome).
// O fetch é simulado: nada sai daqui.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

process.env.MEMED_API_KEY = 'k'.repeat(10);
process.env.MEMED_SECRET = 's'.repeat(10);
process.env.MEMED_API_BASE = 'https://api.memed.com.br';
process.env.SUPABASE_URL = 'https://sb.exemplo';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv';
delete process.env.MEMED_ALLOW;

let chamadas = [];
let cenario = {};
global.fetch = async function (url, opt) {
  opt = opt || {};
  const metodo = opt.method || 'GET';
  chamadas.push({ url: String(url), metodo, body: opt.body ? JSON.parse(opt.body) : null });
  const resp = (status, obj) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(obj), json: async () => obj });
  if (String(url).startsWith('https://sb.exemplo/auth/v1/user')) return resp(200, { id: 'uid-1', email: 'medico@exemplo.com' });
  if (metodo === 'POST') return resp(400, { errors: [{ title: 'Usuário já cadastrado' }] });
  if (metodo === 'GET') return cenario.get();
  if (metodo === 'PATCH') return cenario.patch ? cenario.patch() : resp(200, { data: { type: 'usuarios', attributes: {} } });
  throw new Error('chamada inesperada ' + metodo + ' ' + url);
};
const ok = (status, obj) => async () => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(obj), json: async () => obj });

const handler = require(path.join(__dirname, '..', 'api', 'memed', 'token.js'));
const logs = [];
const logOrig = console.log, errOrig = console.error;
console.log = function () { logs.push(Array.from(arguments).join(' ')); };
console.error = function () { logs.push(Array.from(arguments).join(' ')); };

function chama(nome) {
  return new Promise((resolve) => {
    const req = { method: 'POST', headers: { authorization: 'Bearer tok' }, body: { nome, crm: '12345', uf: 'SP', cpf: '123.456.789-09', especialidade: 'Endocrinologia', nascimento: '1980-01-02' } };
    const res = { statusCode: 0, setHeader() {}, end(s) { resolve({ status: this.statusCode, body: JSON.parse(s) }); } };
    handler(req, res);
  });
}
const patches = () => chamadas.filter((c) => c.metodo === 'PATCH');

(async () => {
  // 1) Nome na Memed diferente do enviado → PATCH com nome/sobrenome novos, e o token sai.
  chamadas = []; cenario = { get: ok(200, { data: { attributes: { token: 'T1', nome: 'dr', sobrenome: 'joao da silv' } } }) };
  let r = await chama('João Carlos da Silva');
  assert.strictEqual(r.status, 200); assert.strictEqual(r.body.token, 'T1');
  assert.strictEqual(patches().length, 1, 'nome mudou: deveria mandar 1 PATCH');
  const p = patches()[0];
  assert.ok(/\/v1\/sinapse-prescricao\/usuarios\/uid-1\?api-key=/.test(p.url), 'PATCH pelo external_id: ' + p.url);
  assert.deepStrictEqual(p.body, { data: { type: 'usuarios', attributes: { nome: 'João', sobrenome: 'Carlos da Silva' } } });

  // 2) Mesmo nome (espaços à parte) → sem PATCH.
  chamadas = []; cenario = { get: ok(200, { data: { attributes: { token: 'T2', nome: 'João', sobrenome: 'Carlos  da Silva ' } } }) };
  r = await chama('João Carlos da Silva');
  assert.strictEqual(r.body.token, 'T2'); assert.strictEqual(patches().length, 0, 'nome igual: nada de PATCH');

  // 3) GET sem os atributos de nome (formato inesperado) → tenta o PATCH mesmo assim.
  chamadas = []; cenario = { get: ok(200, { data: [{ attributes: { token: 'T3' } }] }) };
  r = await chama('Maria Souza');
  assert.strictEqual(r.body.token, 'T3'); assert.strictEqual(patches().length, 1);

  // 4) PATCH recusado → a prescrição abre do mesmo jeito, e o log não leva o nome.
  chamadas = []; logs.length = 0;
  cenario = { get: ok(200, { data: { attributes: { token: 'T4', nome: 'X', sobrenome: 'Y' } } }), patch: ok(422, { errors: [{ title: 'Campo inválido', detail: 'Maria Souza' }] }) };
  r = await chama('Maria Souza');
  assert.strictEqual(r.status, 200); assert.strictEqual(r.body.token, 'T4');
  const lp = logs.filter((l) => l.indexOf('[memed-patch]') >= 0).join('\n');
  assert.ok(/status=422/.test(lp), 'log do PATCH com o status: ' + lp);
  assert.ok(lp.indexOf('Maria') < 0, 'o log do PATCH não pode levar o nome do médico');

  // 5) PATCH que estoura (rede) também não impede o token.
  chamadas = []; cenario = { get: ok(200, { data: { attributes: { token: 'T5', nome: 'X', sobrenome: 'Y' } } }), patch: async () => { throw new Error('rede'); } };
  r = await chama('Maria Souza');
  assert.strictEqual(r.body.token, 'T5');

  // 6) Front: o nome do prescritor entra na assinatura do token pré-aquecido,
  //    senão um nome corrigido reaproveitava o token antigo e nunca ia ao backend.
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(/function prescSig\(\)\{return \[normNomePresc\(prescVal\('memed-nome'\)\),/.test(html), 'prescSig sem o nome do prescritor');

  console.log = logOrig; console.error = errOrig;
  console.log('ok: nome do prescritor na Memed atualizado quando muda (PATCH só de nome/sobrenome, sem travar a prescrição)');
})().catch((e) => { console.log = logOrig; console.error = errOrig; console.error(e && e.stack || e); process.exit(1); });
