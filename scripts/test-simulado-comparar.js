#!/usr/bin/env node
// "VOCÊ FOI MELHOR QUE X% DOS ALUNOS" NO FIM DO SIMULADO (27/11/2026).
//
// Professor: "Faz a 1, 5, 6 e 10." A sugestão 6: comparação anônima no fim do Simulado.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a função do banco devolver quem são, quantos são ou as notas dos outros (é só a porcentagem);
//  - comparar com poucos alunos (uma porcentagem sobre 3 pessoas engana) ou com a própria conta;
//  - o visitante sem login (anon) poder chamar a função;
//  - a tela mostrar "melhor que undefined%" quando a função diz que não há como comparar;
//  - simulado de 3 questões comparar (a nota oscila demais).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(raiz, 'supabase', 'simulado-comparar.sql'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

// ── 1. Banco ────────────────────────────────────────────────────────────────────────────
ok('a função existe, security definer com search_path fixo', /create or replace function public\.endodirect_simulado_comparar\(p_pct numeric\)\s+returns jsonb\s+language plpgsql\s+stable security definer\s+set search_path to 'public'/.test(sql));
ok('🧨 só quem está logado (auth.uid) e nunca a própria conta', /v_uid uuid := auth\.uid\(\);/.test(sql) && /if v_uid is null or p_pct is null/.test(sql) && /where s\.user_id <> v_uid/.test(sql));
ok('🧨 só alunos com pelo menos 20 questões respondidas', /coalesce\(s\.role, 'aluno'\) = 'aluno'/.test(sql) && /from u where t >= 20/.test(sql));
ok('🧨 com menos de 15 alunos, nada', /if v_n < 15 then return jsonb_build_object\('ok', false\); end if;/.test(sql));
ok('🧨 devolve só a porcentagem (nada de n, notas ou ids)', /return jsonb_build_object\('ok', true, 'melhor_que', round\(100 \* v_abaixo \/ v_n\)::int\);/.test(sql)
  && (sql.match(/jsonb_build_object\(/g) || []).length === 3);
ok('🧨 anon não executa; authenticated sim', /revoke all on function public\.endodirect_simulado_comparar\(numeric\) from public, anon;/.test(sql) && /grant execute on function public\.endodirect_simulado_comparar\(numeric\) to authenticated;/.test(sql));

// ── 2. Tela ─────────────────────────────────────────────────────────────────────────────
const sf = corpo('submitSF');
ok('o resultado do simulado tem o lugar da comparação (escondido até a resposta)', /<div id="sf-comparar" class="sf-comparar" hidden><\/div>/.test(sf));
ok('🧨 a comparação é pedida depois de o relatório estar na tela', /fbPontualLigar\(\);\n  simuladoComparar\(pct,sfState\.total\);/.test(sf));
function roda(total, resposta, logado) {
  const el = { innerHTML: '', hidden: true };
  let chamado = null;
  const ctx = {
    Math, document: { getElementById: (id) => (id === 'sf-comparar' ? el : null) },
    currentUser: logado === false ? null : { id: 'u1' },
    getSupabaseClient: () => ({ rpc: (nome, args) => { chamado = { nome, args }; return { then: (f) => f(resposta) }; } }),
  };
  vm.createContext(ctx);
  vm.runInContext(corpo('simuladoComparar'), ctx);
  ctx.simuladoComparar(72, total);
  return { el, chamado };
}
let r = roda(20, { data: { ok: true, melhor_que: 64 } });
ok('🧨 mostra "Você foi melhor que 64% dos alunos"', !r.el.hidden && /📊 Você foi melhor que <b>64%<\/b> dos alunos/.test(r.el.innerHTML) && /Comparação anônima/.test(r.el.innerHTML));
ok('chama a função certa com a nota do simulado', r.chamado && r.chamado.nome === 'endodirect_simulado_comparar' && r.chamado.args.p_pct === 72);
r = roda(20, { data: { ok: false } });
ok('🧨 sem comparação possível, nada aparece (nada de "undefined%")', r.el.hidden && r.el.innerHTML === '');
r = roda(20, { data: null, error: { message: 'x' } });
ok('erro na chamada: nada aparece', r.el.hidden && r.el.innerHTML === '');
r = roda(5, { data: { ok: true, melhor_que: 64 } });
ok('🧨 simulado de menos de 10 questões não compara', r.chamado === null && r.el.hidden);
r = roda(20, { data: { ok: true, melhor_que: 64 } }, false);
ok('sem conta, não chama', r.chamado === null);
r = roda(20, { data: { ok: true, melhor_que: 0 } });
ok('0%: mensagem que orienta em vez de "melhor que 0%"', !r.el.hidden && !/melhor que <b>0%/.test(r.el.innerHTML) && /erros abaixo/.test(r.el.innerHTML));
ok('a linha tem estilo próprio', /\.sf-comparar\{/.test(html) && /\.sf-comparar b\{/.test(html));

if (bad) { console.log(`\n${bad} verificação(ões) da comparação do Simulado falharam.`); process.exit(1); }
console.log('Comparação do Simulado: ok');
