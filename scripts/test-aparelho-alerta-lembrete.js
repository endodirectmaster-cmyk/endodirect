#!/usr/bin/env node
// E-MAIL DE APARELHO NOVO + LEMBRETE DIÁRIO DE ESTUDO (27/11/2026).
//
// Professor: "Faz a 1, 5, 6 e 10." A 10: e-mail ao aluno quando um aparelho novo entra na conta.
// A 5: lembrete no celular na hora que o aluno escolhe ("Hora das suas 10 questões").
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o 1º aparelho da conta (o cadastro) disparar "aparelho novo";
//  - o aviso depender do navegador de quem entrou (cliente adulterado não avisaria);
//  - um ladrão insistente virar enxurrada de e-mail (limite de 3 em 24 h);
//  - duas chamadas ao mesmo tempo mandarem o e-mail ou o lembrete em dobro;
//  - o token do banco abrir outras ações da rota (ex.: aviso a todos os alunos);
//  - o lembrete sair na hora de Brasília para quem mora em Manaus, ou sair para quem já fez a meta;
//  - o nome do aluno entrar cru no HTML do e-mail;
//  - a falha do alerta impedir o login.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const html = ler('index.html');
const sql = ler('supabase/aparelho-novo-e-lembrete.sql');
const apar = ler('supabase/aparelhos-cadastrados.sql');
const rota = ler('api/admin/refresh-radar.js');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome, src) {
  src = src || html;
  const i = src.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = src.indexOf('{', i), n = 0;
  for (; j < src.length; j++) { if (src[j] === '{') n++; else if (src[j] === '}') { n--; if (!n) break; } }
  return src.slice(i, j + 1);
}
const fn = (nome) => { const i = sql.indexOf('function public.' + nome + '('); return i < 0 ? '' : sql.slice(i, sql.indexOf('$function$;', i)); };

(async function () {
  // ── 1. Banco ────────────────────────────────────────────────────────────────────────────
  ok('pg_net e pg_cron', /create extension if not exists pg_net;/.test(sql) && /create extension if not exists pg_cron;/.test(sql));
  ok('🧨 o token nasce no Vault (64 hex), uma vez', /vault\.create_secret\(\s*replace\(gen_random_uuid\(\)::text, '-', ''\) \|\| replace\(gen_random_uuid\(\)::text, '-', ''\),\s*'endodirect_tarefas_token'/.test(sql)
    && /if not exists \(select 1 from vault\.secrets where name = 'endodirect_tarefas_token'\)/.test(sql));
  ok('🧨 só a chave de serviço pergunta se o token confere', /grant execute on function public\.endodirect_tarefas_token_confere\(text\) to service_role;/.test(sql)
    && /revoke all on function public\.endodirect_tarefas_token_confere\(text\) from public, anon, authenticated;/.test(sql));
  const chamar = fn('endodirect_chamar_tarefa');
  ok('🧨 o banco só chama as duas tarefas, e uma falha de rede nunca derruba quem chamou',
    /if p_action not in \('alertas_aparelho', 'tarefas_hora'\) then return; end if;/.test(chamar) && /net\.http_post\(\s*url := 'https:\/\/www\.endodirect\.com\.br\/api\/admin\/refresh-radar'/.test(chamar)
    && /exception when others then\s+return;/.test(chamar) && /revoke all on function public\.endodirect_chamar_tarefa\(text\) from public, anon, authenticated;/.test(sql));
  ok('🧨 a fila e a tabela dos lembretes: RLS ligado, nada pela API, e saem com a conta',
    /alter table public\.endodirect_alertas_aparelho enable row level security;\s*revoke all on public\.endodirect_alertas_aparelho from anon, authenticated;/.test(sql)
    && /alter table public\.endodirect_lembretes_enviados enable row level security;\s*revoke all on public\.endodirect_lembretes_enviados from anon, authenticated;/.test(sql)
    && (sql.match(/references auth\.users\(id\) on delete cascade/g) || []).length === 2);
  const reg = fn('endodirect_alerta_aparelho_registrar');
  ok('🧨 no máximo 3 alertas por conta em 24 h, e o alerta nunca impede o login',
    /criado_em > now\(\) - interval '24 hours'\) >= 3 then return; end if;/.test(reg) && /perform public\.endodirect_chamar_tarefa\('alertas_aparelho'\);/.test(reg) && /exception when others then\s+return;/.test(reg));
  const pegar = fn('endodirect_alertas_aparelho_pegar');
  ok('🧨 cada alerta é pego uma vez (skip locked), até 50 por chamada, até 3 tentativas, só dos últimos 2 dias',
    /for update skip locked/.test(pegar) && /least\(coalesce\(p_max, 20\), 50\)/.test(pegar) && /a\.tentativas < 3/.test(pegar) && /interval '2 days'/.test(pegar));
  ok('envio que falhou volta para a fila', /enviado_em = case when p_ok then enviado_em else null end/.test(fn('endodirect_alertas_aparelho_resultado')));
  const cand = fn('endodirect_lembrete_candidatos');
  ok('🧨 lembrete: só quem ligou e tem aparelho com notificação, e só os 3 últimos dias de estudo',
    /\(s\.payload->'user_profile'->'lembrete'->>'on'\) = 'true'/.test(cand) && /exists \(select 1 from public\.endodirect_push_subs p where p\.user_id = s\.user_id\)/.test(cand)
    && /current_date - 2/.test(cand));
  ok('🧨 lembrete uma vez por dia do aluno (reserva atômica)', /on conflict \(user_id, dia\) do nothing\s+returning user_id;/.test(fn('endodirect_lembrete_reservar')));
  ['endodirect_alertas_aparelho_pegar(int)', 'endodirect_alertas_aparelho_resultado(bigint, boolean, text)', 'endodirect_lembrete_candidatos()', 'endodirect_lembrete_reservar(uuid[], date[])'].forEach((f) => {
    ok('só a chave de serviço chama ' + f, sql.indexOf('revoke all on function public.' + f + ' from public, anon, authenticated;') >= 0 && sql.indexOf('grant execute on function public.' + f + ' to service_role;') >= 0);
  });
  ok('o relógio: de hora em hora, no minuto 0', /cron\.schedule\('endodirect-tarefas-hora', '0 \* \* \* \*', \$\$select public\.endodirect_chamar_tarefa\('tarefas_hora'\)\$\$\)/.test(sql));

  const entrar = apar.slice(apar.indexOf('function public.endodirect_aparelho_entrar('), apar.indexOf('function public.endodirect_session_claim('));
  const isento = entrar.slice(entrar.indexOf('endodirect_aparelhos_isento(v_uid)'), entrar.indexOf("revogado_motivo = 'inativo'"));
  ok('🧨 aparelho novo: só quando a linha NASCE (não ao voltar um aparelho conhecido) e só se a conta já tinha outro',
    /returning \(xmax = 0\) into v_novo;/.test(entrar) && /if v_novo and exists \(select 1 from public\.endodirect_devices d\s+where d\.user_id = v_uid and d\.device_id <> p_device_id and left\(d\.device_id, 1\) <> '#'\) then\s+perform public\.endodirect_alerta_aparelho_registrar\(v_uid, 'novo', v_ua\);/.test(entrar));
  ok('🧨 3º aparelho barrado avisa, na mesma janela de 10 min da contagem',
    /select bloqueado_em into v_bloq_antes from public\.endodirect_devices where user_id = v_uid and device_id = p_device_id;/.test(entrar)
    && /if v_bloq_antes is null or v_bloq_antes < now\(\) - interval '10 minutes' then\s+perform public\.endodirect_alerta_aparelho_registrar\(v_uid, 'bloqueado', v_ua\);/.test(entrar));
  ok('professor e contas de revisão (isentos) não recebem o alerta', isento.length > 0 && isento.indexOf('alerta') < 0);

  // ── 2. Rota ─────────────────────────────────────────────────────────────────────────────
  ok('🧨 a rota confere o token no banco (64 hex) e o token só abre as duas tarefas',
    /if \(!\/\^\[0-9a-f\]\{64\}\$\/\.test\(token\)\) return false;/.test(rota) && /rpc\/endodirect_tarefas_token_confere/.test(rota)
    && /const ACOES_DO_BANCO = \['alertas_aparelho', 'tarefas_hora'\];/.test(rota)
    && /if \(doBanco && ACOES_DO_BANCO\.indexOf\(payload && payload\.action\) < 0\) return json\(res, 403/.test(rota)
    && /const doBanco = !doServidor && await tokenDoBanco\(token\);\n  if \(!doServidor && !doBanco\) \{/.test(rota));
  const iBloq = rota.indexOf('if (doBanco && ACOES_DO_BANCO'), iPush = rota.indexOf("payload.action === 'push'"), iNews = rota.indexOf("payload.action === 'newsletter-teste'");
  ok('🧨 o bloqueio do token vem antes de qualquer outra ação', iBloq > 0 && iBloq < iPush && iBloq < iNews);
  ok('tarefas_hora manda os lembretes e reenvia os alertas da fila', /const lembretes = await sendLembretesEstudo\(\);\s+const alertas = await processarAlertasAparelho\(\);/.test(rota));

  // ── 3. O e-mail ─────────────────────────────────────────────────────────────────────────
  const AA = require(path.join(raiz, 'lib', 'aparelho-alerta.js'));
  const UA = {
    winChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
    iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    app: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    android: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
    macEdge: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Edg/131.0',
  };
  ok('aparelho descrito em português', AA.descreveAparelho(UA.winChrome) === 'Chrome no Windows' && AA.descreveAparelho(UA.iphoneSafari) === 'Safari no iPhone'
    && AA.descreveAparelho(UA.app) === 'app do Endodirect no iPhone' && AA.descreveAparelho(UA.android) === 'Chrome no Android' && AA.descreveAparelho(UA.macEdge) === 'Edge no Mac'
    && AA.descreveAparelho('') === 'aparelho não identificado');
  ok('horário de Brasília', AA.quandoBR('2026-11-28T00:40:00Z') === '27/11/2026 às 21:40');
  const novo = AA.montarEmail({ tipo: 'novo', nome: 'Ana <b>Souza</b>', ua: UA.winChrome, criado_em: '2026-11-28T00:40:00Z' });
  ok('e-mail de aparelho novo: assunto, aparelho, horário e o que fazer', novo.subject === 'Novo aparelho entrou na sua conta Endodirect'
    && /Chrome no Windows/.test(novo.html) && /27\/11\/2026 às 21:40/.test(novo.html) && /Esqueci minha senha/.test(novo.html) && /Perfil › Meus aparelhos/.test(novo.html)
    && /Se foi você, não precisa fazer nada\./.test(novo.text));
  ok('🧨 o nome entra escapado (só o primeiro nome)', /Olá, Ana\./.test(novo.html) && novo.html.indexOf('<b>Souza') < 0);
  const malicioso = AA.montarEmail({ tipo: 'novo', nome: '<i>Ana</i> X', ua: UA.winChrome, criado_em: '2026-11-28T00:40:00Z' });
  ok('🧨 nome com HTML não vira HTML no e-mail', malicioso.html.indexOf('<i>Ana') < 0 && malicioso.html.indexOf('&lt;i&gt;Ana') >= 0);
  const bloq = AA.montarEmail({ tipo: 'bloqueado', nome: '', ua: UA.android, criado_em: '2026-11-28T00:40:00Z' });
  ok('e-mail do 3º aparelho barrado', bloq.subject === 'Tentativa de entrar na sua conta Endodirect em outro aparelho' && /barrado/.test(bloq.html) && /2 aparelhos permitidos/.test(bloq.html) && /Olá\./.test(bloq.html));

  const fetchOrig = global.fetch, envOrig = Object.assign({}, process.env);
  const chamadas = [];
  global.fetch = async (url, o) => {
    chamadas.push({ url: String(url), body: o && o.body ? JSON.parse(o.body) : null });
    if (/endodirect_alertas_aparelho_pegar/.test(url)) return { ok: true, json: async () => [
      { id: 1, tipo: 'novo', ua: UA.winChrome, criado_em: '2026-11-28T00:40:00Z', email: 'aluno@exemplo.com', nome: 'Ana' },
      { id: 2, tipo: 'novo', ua: UA.app, criado_em: '2026-11-28T00:41:00Z', email: 'outro@exemplo.com', nome: '' },
    ] };
    return { ok: true, json: async () => null };
  };
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc'; delete process.env.RESEND_API_KEY;
  let r = await AA.processarAlertasAparelho();
  ok('🧨 sem a chave do Resend, não pega nada (a fila espera)', r.ok === false && chamadas.length === 0);
  process.env.RESEND_API_KEY = 're';
  const mandados = [];
  r = await AA.processarAlertasAparelho({ enviar: async (m) => { mandados.push(m); return { ok: m.to[0] !== 'outro@exemplo.com', status: m.to[0] === 'outro@exemplo.com' ? 500 : 200 }; } });
  const res = chamadas.filter((c) => /alertas_aparelho_resultado/.test(c.url)).map((c) => c.body);
  ok('manda o e-mail e devolve o resultado de cada um (o que falhou volta para a fila)', r.enviados === 1 && r.falhas === 1 && mandados.length === 2
    && res.length === 2 && res[0].p_id === 1 && res[0].p_ok === true && res[1].p_id === 2 && res[1].p_ok === false && /Resend HTTP 500/.test(res[1].p_resultado));
  global.fetch = fetchOrig; process.env = envOrig;

  // ── 4. O lembrete ───────────────────────────────────────────────────────────────────────
  const LE = require(path.join(raiz, 'lib', 'lembrete-estudo.js'));
  const ms = Date.parse('2026-11-27T22:00:00Z'); // 19h em Brasília, 18h em Manaus
  const rows = [
    { user_id: 'a', lembrete: { on: true, h: 19, q: 10, tz: 'America/Sao_Paulo' }, act: {} },
    { user_id: 'b', lembrete: { on: true, h: 19, q: 10, tz: 'America/Manaus' }, act: {} },
    { user_id: 'c', lembrete: { on: true, h: 18, q: 20, tz: 'America/Manaus' }, act: { '2026-11-27': 5 } },
    { user_id: 'd', lembrete: { on: true, h: 19, q: 10, tz: 'America/Sao_Paulo' }, act: { '2026-11-27': 12 } },
    { user_id: 'e', lembrete: { on: false, h: 19, q: 10, tz: 'America/Sao_Paulo' }, act: {} },
    { user_id: 'f', lembrete: { on: true, h: 19, q: 7, tz: 'Fuso/Inexistente' }, act: {} },
    { user_id: 'g', lembrete: { on: true, h: 25, q: 10 }, act: {} },
  ];
  const q = LE.quemRecebe(rows, ms), ids = q.map((x) => x.user_id).join(',');
  ok('🧨 a hora é a do fuso do aluno (19h SP recebe; 19h Manaus não; 18h Manaus recebe)', /^a,c/.test(ids) && ids.indexOf('b') < 0);
  ok('🧨 quem já fez a meta do dia não recebe; desligado não recebe; hora inválida não recebe', ids.indexOf('d') < 0 && ids.indexOf('e') < 0 && ids.indexOf('g') < 0);
  ok('fuso inválido cai em Brasília; meta fora da lista vira 10', ids === 'a,c,f' && q[2].meta === 10);
  const mc = LE.mensagem(q[1]), ma = LE.mensagem(q[0]);
  ok('a mensagem: "Hora das suas N questões", e quantas faltam se já começou', ma.title === '📚 Hora das suas 10 questões' && /10 questões hoje/.test(ma.body)
    && mc.title === '📚 Hora das suas 20 questões' && /Faltam 15 das suas 20 questões de hoje/.test(mc.body));
  ok('🧨 o toque na notificação abre o Banco de questões', /\/#quest$/.test(ma.url) && /cursos\|quest\)\(\?:/.test(html) && /quest:1\}/.test(html));

  // ── 5. O cartão no Perfil ───────────────────────────────────────────────────────────────
  const el = {};
  const ctx = {
    Math, JSON, String, Intl, prof: {}, salvos: 0, currentUser: { id: 'u1', profile: null },
    lsGet: (k) => (k === 'user_profile' ? ctx.prof : null), lsSet: (k, v) => { if (k === 'user_profile') ctx.prof = v; },
    queueRemoteStateSave: () => { ctx.salvos++; },
    document: { getElementById: (id) => el[id] || null },
    pushSupported: () => true, pushAtivoAgora: () => ctx._push, _push: false,
  };
  vm.createContext(ctx);
  vm.runInContext(['var LEMBRETE_METAS=[5,10,15,20,30,50];', corpo('lembretePref'), corpo('lembreteFuso'), corpo('lembreteCardHTML'), corpo('lembreteSalvar')].join('\n'), ctx);
  let card = ctx.lembreteCardHTML();
  ok('o cartão: liga/desliga, hora (05h–23h) e meta, desligado de início, 19h e 10 questões', /⏰ Lembrete diário de estudo/.test(card) && /<input type="checkbox" id="pf-lb-on">/.test(card)
    && /<option value="19" selected>19h<\/option>/.test(card) && /<option value="10" selected>10 questões<\/option>/.test(card) && /<option value="5">05h<\/option>/.test(card) && !/value="4"/.test(card));
  ok('🧨 sem notificação ativa neste aparelho, o cartão oferece ativar', /id="pf-lb-push"/.test(card));
  ctx._push = true;
  ok('com notificação ativa, sem o convite', !/id="pf-lb-push"/.test(ctx.lembreteCardHTML()));
  Object.assign(el, { 'pf-lb-on': { checked: true }, 'pf-lb-h': { value: '7' }, 'pf-lb-q': { value: '20' }, 'pf-lb-msg': { textContent: '', style: {} } });
  const l = ctx.lembreteSalvar();
  ok('🧨 salvar grava no perfil (sincronizado) com o fuso do aparelho', ctx.prof.lembrete && ctx.prof.lembrete.on === true && ctx.prof.lembrete.h === 7 && ctx.prof.lembrete.q === 20
    && typeof l.tz === 'string' && l.tz.length > 2 && ctx.salvos === 1 && /todo dia às 07h, meta de 20 questões/.test(el['pf-lb-msg'].textContent));
  el['pf-lb-q'].value = '999'; el['pf-lb-h'].value = 'x'; ctx.lembreteSalvar();
  ok('valores fora da lista voltam ao padrão', ctx.prof.lembrete.q === 10 && ctx.prof.lembrete.h === 19);
  card = ctx.lembreteCardHTML();
  ok('o cartão relê o que foi salvo', /<input type="checkbox" id="pf-lb-on" checked>/.test(card));
  ok('🧨 o cartão está no Perfil e os botões são ligados', /\+assinaturaCard\+lembreteCardHTML\(\)\+qdCard\+nlCard/.test(html) && /try\{lembreteLigar\(\);\}catch\(e\)\{\}/.test(html));
  ok('a Política de Privacidade cita o e-mail de aparelho novo e o lembrete', /aparelho novo entra na sua conta/.test(ler('privacidade.html')) && /lembrete diário de estudo/.test(ler('privacidade.html')));

  if (bad) { console.log(`\n${bad} verificação(ões) do alerta de aparelho / lembrete falharam.`); process.exit(1); }
  console.log('Alerta de aparelho novo e lembrete diário: ok');
})().catch((e) => { console.error(e); process.exit(1); });
