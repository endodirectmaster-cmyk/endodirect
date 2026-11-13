#!/usr/bin/env node
// MURAL DE AVISOS NO DASHBOARD (13/11/2026).
//
// Professor: "Acho que vale a pena também aqui no dashboard o mural de avisos. Por exemplo,
// quando for introduzida uma nova videoaula, uma nova aula do Educação Médica Continuada, algum
// aviso importante de edital, de alguma prova, etc."
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o aviso do professor não chegar ao aluno (a função do servidor monta a resposta campo a
//    campo: sem 'avisos_alunos' nela, o mural do aluno fica vazio para sempre);
//  - o painel do professor não gravar a coleção (ou um save concorrente apagá-la);
//  - aviso vencido continuar no mural, ou videoaula/aula de meses atrás aparecer como novidade;
//  - aula de OUTRO curso aparecer como "Educação Médica Continuada";
//  - link do professor virar `javascript:` no botão do aluno;
//  - a notificação no celular sair antes de o aviso estar no servidor.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

// ── 1. Servidor: o aluno recebe a coleção ───────────────────────────────────────────────
const sqlPath = path.join(raiz, 'supabase', 'avisos-aos-alunos.sql');
const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : '';
ok('🧨 a função do aluno (member_content_sem_provas) entrega avisos_alunos, para todos',
  /create or replace function public\.endodirect_member_content_sem_provas\(\)/.test(sql)
  && /'avisos_alunos', coalesce\(\(select payload->'avisos_alunos' from g\), '\[\]'::jsonb\),/.test(sql));
ok('a função continua security definer com search_path fixo', /stable security definer\s+set search_path to 'public'/.test(sql));

// ── 2. Cliente: estado global gravado, mesclado e lido ──────────────────────────────────
ok('🧨 o painel do professor grava a coleção (globalStatePayload)', /aovivo:aoVivoAgendada,avisos_alunos:avisosAlunos\}\);/.test(corpo('globalStatePayload')));
ok('🧨 save concorrente mescla por id (GLOBAL_MERGE_KEYS)', /avisos_alunos:function\(it\)\{return it\.id\|\|/.test(html));
ok('🧨 a carga lê a coleção e redesenha o mural', /if\(Array\.isArray\(payload\.avisos_alunos\)\)\{avisosAlunos=payload\.avisos_alunos;[^\n]*renderDashAvisos\(\)/.test(html));
ok('o Dashboard redesenha o mural (refreshDash) e quando chegam Resumos e aulas',
  /try\{renderDashAvisos\(\);\}catch\(e\)\{\}/.test(corpo('refreshDash')) && /renderDashAvisos\(\)/.test(corpo('aplicarResumos'))
  && /if\(Array\.isArray\(payload\.adm_cursos\)\)\{admCursos=payload\.adm_cursos;try\{renderDashAvisos\(\);\}catch\(e\)\{\}\}/.test(html));
ok('lugar do mural no topo do Dashboard, escondido quando não há aviso', /<div id="dash-avisos" style="display:none;margin-bottom:10px"><\/div>\s*<div id="qotd-card"/.test(html)
  && /if\(!itens\.length\)\{el\.style\.display='none';el\.innerHTML='';return;\}/.test(corpo('renderDashAvisos')));

// ── 3. O que entra no mural, rodando ────────────────────────────────────────────────────
const AGORA = Date.UTC(2026, 10, 13, 15, 0, 0), D = 86400000;
const ctx = { Date, Math, String, Array, Number, Object, EMC_SLUG: 'emc',
  dirIsVisibleAnyTipo: (d) => !d.oculto, dirTemaOf: (d) => d.tema || d.titulo || 'Geral' };
vm.createContext(ctx);
const decl = (html.match(/var AVISOS_AUTO_DIAS=\d+,AVISOS_VISIVEIS=\d+,dashAvisosTodos=false,dashAvisosItens=\[\];\nvar AVISO_TIPOS=\{[\s\S]*?\n\};/) || [''])[0];
ok('constantes do mural declaradas (30 dias)', /AVISOS_AUTO_DIAS=30/.test(decl));
vm.runInContext(decl + '\n' + ['avisoLinkSeguro', 'avisosDoMural'].map(corpo).join('\n'), ctx);
ctx.avisosAlunos = [
  { id: 'a1', tipo: 'edital', titulo: 'Edital publicado', texto: 'Inscrições até 15/12', link: 'https://sbem.org.br/x', at: AGORA - 5 * D },
  { id: 'a2', tipo: 'prova', titulo: 'Simulado sábado', at: AGORA - 1 * D, ate: AGORA + 2 * D },
  { id: 'a3', tipo: 'aviso', titulo: 'Vencido', at: AGORA - 20 * D, ate: AGORA - 2 * D },
  { id: 'a4', tipo: 'aviso', titulo: 'Link malicioso', link: 'javascript:alert(1)', at: AGORA - 3 * D },
  { id: 'a5', tipo: 'aviso', titulo: '   ', at: AGORA },
];
ctx.diretrizes = [
  { sub: 'Tireoide', tema: 'Hipotireoidismo', videos: [{ titulo: 'Vídeo novo', src: 'v1', at: AGORA - 2 * D }, { titulo: 'Vídeo velho', src: 'v0', at: AGORA - 45 * D }] },
  { sub: 'Adrenal', tema: 'Oculto', oculto: true, videos: [{ titulo: 'De capítulo oculto', src: 'v9', at: AGORA - 1 * D }] },
];
ctx.admCursos = [
  { curso: 'emc', title: 'Aula EMC nova', modulo: 'Obesidade', at: AGORA - 1 * D },
  { curso: 'emc', title: 'Aula EMC velha', at: AGORA - 60 * D },
  { curso: 'emc', title: 'Aula agendada no futuro', at: AGORA + 3 * D },
  { curso: 'outro', title: 'Aula de outro curso', at: AGORA - 1 * D },
];
const itens = JSON.parse(vm.runInContext('JSON.stringify(avisosDoMural(' + AGORA + ').map(function(a){return [a.tipo,a.titulo,a.manual?1:0,a.link||""]}))', ctx));
const titulos = itens.map((x) => x[1]);
ok('🧨 avisos do professor primeiro (mais novo em cima), depois aula e videoaula (mais novo em cima) — veio ' + JSON.stringify(titulos),
  JSON.stringify(titulos) === JSON.stringify(['Simulado sábado', 'Link malicioso', 'Edital publicado', 'Aula EMC nova', 'Vídeo novo']));
ok('🧨 aviso vencido ("mostrar até" no passado) sai do mural', !titulos.includes('Vencido'));
ok('aviso sem título não entra', itens.length === 5);
ok('🧨 videoaula e aula com mais de 30 dias não entram', !titulos.includes('Vídeo velho') && !titulos.includes('Aula EMC velha'));
ok('🧨 aula de outro curso não vira "Educação Médica Continuada"; aula do futuro não entra', !titulos.includes('Aula de outro curso') && !titulos.includes('Aula agendada no futuro'));
ok('videoaula de capítulo que o aluno não vê não entra', !titulos.includes('De capítulo oculto'));
ok('🧨 link `javascript:` do aviso é descartado; https fica', itens.find((x) => x[1] === 'Link malicioso')[3] === '' && itens.find((x) => x[1] === 'Edital publicado')[3] === 'https://sbem.org.br/x');
ok('tipos certos (prova, edital, emc, video)', itens.map((x) => x[0]).join(',') === 'prova,aviso,edital,emc,video');

// ── 4. Abrir o que o aviso anuncia ──────────────────────────────────────────────────────
const abrir = corpo('avisoAbrir');
ok('🧨 aula da EMC abre o curso na aula (o mesmo caminho da notificação)', /cursoLinkPendente=\{slug:EMC_SLUG,at:a\.emcAt\|\|0\};goPanel\('cursos'\);/.test(abrir));
ok('🧨 videoaula abre o capítulo dela na aba de videoaulas', /refFormat='video';refVideoAberto=a\.src\|\|'';/.test(abrir) && /refTemaSel=dirTemaOf\(d\);/.test(abrir));
ok('link do professor abre em aba nova, sem acesso à janela de origem', /window\.open\(a\.link,'_blank','noopener'\)/.test(abrir));

// ── 5. Painel do professor ──────────────────────────────────────────────────────────────
ok('🧨 item "📌 Avisos aos alunos" no menu do professor, logo depois do Mural de artigos',
  /data-asec="mural">📣 Mural de artigos<\/button>\s*<button class="adm-nav" data-asec="avisos">📌 Avisos aos alunos<\/button>/.test(html)
  && /if\(sec==='avisos'\)\{m\.innerHTML=admAvisosAlunosHTML\(\);bindAdmAvisosAlunos\(\);bindAdmSec\(sec\);return;\}/.test(corpo('renderAdmSec')));
const bind = corpo('bindAdmAvisosAlunos');
ok('formulário: tipo, título, texto, link, "mostrar até" e notificação opcional',
  ['adm-aviso-tipo', 'adm-aviso-titulo', 'adm-aviso-texto', 'adm-aviso-link', 'adm-aviso-ate', 'adm-aviso-push'].every((id) => corpo('admAvisosAlunosHTML').includes('id="' + id + '"')));
ok('🧨 recusa aviso sem título e link que não seja http(s)', /if\(!titulo\)\{notify\(/.test(bind) && /if\(link&&!avisoLinkSeguro\(link\)\)\{notify\(/.test(bind));
ok('🧨 grava já no servidor (save imediato)', /return queueRemoteStateSave\(true\);/.test(corpo('persistAvisosAlunos')));
ok('🧨 notificação só depois de gravado no servidor', /Promise\.resolve\(gravou\)\.then\(function\(salvo\)\{\s*if\(!salvo\)\{notify\(/.test(bind) && /return admSendPush\(\{title:/.test(bind));
ok('excluir pede confirmação', /if\(!confirm\('Excluir o aviso "/.test(bind));

if (bad) { console.log('✗ mural de avisos: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ mural de avisos: chega ao aluno, só o que vale (sem vencidos nem antigos), abre o que anuncia, e o professor escreve no painel');
