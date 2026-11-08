// QUEM RECEBE O E-MAIL DE FIM DE DEGUSTAÇÃO (08/11/2026).
//
// Pergunta do professor: "A automação de aviso de vencimento do modo degustação está
// funcionando?". Funcionava; o defeito achado foi o público. A RPC
// `endodirect_trial_email_targets()` tirava da lista só quem tinha plano ATIVO, e todo
// assinante entrou pela degustação. No dia em que o plano vencia (ou a cobrança recorrente
// falhava), o assinante recebia "Sua degustação de 7 dias terminou". Aconteceu duas vezes;
// 41 pagantes estavam na fila.
//
// 🧨 O MODO DE QUEBRAR ISTO é "simplificar" a exclusão de volta para status = 'active'. Não dá
// erro nenhum: o e-mail sai, chega, e chega errado para quem paga.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'degustacao-sem-ex-assinante.sql'), 'utf8');
const lib = fs.readFileSync(path.join(RAIZ, 'lib', 'trial-emails.js'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const sem = (s) => s.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ');
const corpo = sem(sql);

ok(/create or replace function public\.endodirect_trial_email_targets\(\)/.test(corpo),
  '⚠️ o arquivo não redefine endodirect_trial_email_targets()');

// 1. Já pagou alguma vez: fora, em QUALQUER status.
const pago = corpo.match(/not exists \(select 1 from public\.endodirect_acessos p where ([^)]*\))[^)]*\)/);
ok(!!pago, '🧨 sumiu a exclusão de quem já teve acesso pago — ex-assinante volta a receber "sua degustação terminou"');
ok(pago && /coalesce\(p\.provider, ''\) not in \('manual', 'interno'\)/.test(pago[0]),
  '⚠️ a exclusão de ex-pagante deixou de olhar o provedor (cortesia manual/interna não é compra)');
ok(pago && !/status/.test(pago[0]),
  '🧨 a exclusão de ex-pagante voltou a filtrar por status — plano vencido ou em atraso escapa dela');
ok(/not exists \(select 1 from public\.endodirect_assinaturas q where q\.user_id = a\.user_id\)/.test(corpo),
  '🧨 quem tem qualquer linha em endodirect_assinaturas voltou a poder receber o e-mail de degustação');

// 2. Acesso ativo hoje (inclusive cortesia): fora, como antes.
ok(/endodirect_acessos x where x\.user_id = a\.user_id and x\.status = 'active' and \(x\.expires_at is null or x\.expires_at > now\(\)\)/.test(corpo),
  '⚠️ quem tem acesso ativo hoje (cortesia incluída) deixou de ser excluído');

// 3. O calendário não mudou: aviso no dia 5–6, convite a partir do 7.
ok(/case when day >= 7 then 'winback' else 'warn' end/.test(corpo) && /where day >= 5;/.test(corpo)
  && /greatest\(0, 7 - day\) as days_left/.test(corpo),
  '⚠️ mudou o calendário dos e-mails (aviso dia 5–6, convite dia 7+)');
ok(/not in \(select lower\(email\) from public\.endodirect_admins\)/.test(corpo), '⚠️ admins voltaram a entrar na lista');

// 4. A RPC devolve e-mails: só o service role executa.
ok(/revoke execute on function public\.endodirect_trial_email_targets\(\) from anon, authenticated, public;/.test(corpo),
  '🧨 o arquivo não revoga o EXECUTE público — a anon key listaria e-mails de alunos');

// 5. O cron continua lendo esta RPC e gravando o registro por pessoa.
ok(/rpc\/endodirect_trial_email_targets/.test(lib), '⚠️ lib/trial-emails.js deixou de usar a RPC');
ok(/if \(ledger\[email\] && ledger\[email\]\[kind\]\) continue;/.test(lib),
  '🧨 sumiu a trava "já enviado" — cada pessoa receberia o mesmo e-mail todo dia');

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ e-mail de degustação: só para quem nunca pagou, aviso no dia 5–6, convite no dia 7+, uma vez por pessoa');
