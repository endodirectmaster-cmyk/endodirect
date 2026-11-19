#!/usr/bin/env node
// DESEMPENHO NO APP DO IPHONE (17/11/2026; professor, TestFlight: "depois de uns 2, 3, 4 segundos aparece o restante
// dos demais podcasts ... tem aparecido também no dashboard"). Medido no Chromium a 4× de lentidão: a carga depois do
// login ocupava 5,0 s de processador com uma tarefa contínua de 1,03 s; depois das mudanças, 3,4 s e 0,32 s.
// 🧨 Os modos de quebrar isto em silêncio:
//  - questões (~6 MB) e Resumos (~4 MB) voltarem ao localStorage: no iPhone (cota de 5 MB) a gravação falha sempre,
//    depois de serializar tudo, e o caminho de erro serializava e desserializava de novo;
//  - a falha de cota deixar no aparelho a cópia VELHA, que voltaria na próxima abertura;
//  - lsGet deixar de devolver o que ficou só na memória (ou devolver a mesma referência mutável do texto);
//  - o Mural voltar a calcular o tipo do artigo dentro do comparador do sort;
//  - Mural e Podcasts voltarem a ser redesenhados escondidos a cada carga.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  return html.slice(ini + 1, html.indexOf('\n}', ini) + 2);
}
const linha = (re) => (html.match(re) || [''])[0];
// localStorage falso com cota (em caracteres), como o WebKit
function armazenamento(cota) {
  const m = new Map(); let gravacoes = 0;
  const tam = () => [...m.values()].reduce((a, v) => a + v.length, 0);
  return {
    get gravacoes() { return gravacoes; }, m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { gravacoes++; const antes = m.has(k) ? m.get(k).length : 0; if (tam() - antes + String(v).length > cota) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}
function ctx(cota) {
  const ls = armazenamento(cota);
  const c = { window: {}, localStorage: ls, JSON };
  c.window.localStorage = ls;
  vm.createContext(c);
  vm.runInContext('var mem={};' + linha(/\nvar LS_MAX_CHARS=\d+;/) + '\n' + linha(/\nvar LS_SO_MEMORIA=\{[^}]*\};/) + '\n' + corpo('lsGet') + corpo('lsSoAparelho') + corpo('lsSet'), c);
  return c;
}
{
  const c = ctx(5000000);
  c.localStorage.setItem('endodirect_v1_provas', JSON.stringify([{ id: 'velha' }])); // cópia de antes da mudança
  const provas = Array.from({ length: 3 }, (_, i) => ({ id: 'q' + i }));
  c.provas = provas;
  vm.runInContext("lsSet('provas',provas)", c);
  ok('🧨 questões não vão ao localStorage (e a cópia velha sai do aparelho)', c.localStorage.getItem('endodirect_v1_provas') === null);
  ok('questões seguem legíveis na sessão', vm.runInContext("lsGet('provas').length", c) === 3);
  vm.runInContext("lsSet('diretrizes',[{sub:'Tireoide'}])", c);
  ok('🧨 Resumos também ficam só na memória', c.localStorage.getItem('endodirect_v1_diretrizes') === null && vm.runInContext("lsGet('diretrizes')[0].sub", c) === 'Tireoide');
  // valor grande qualquer (acima de LS_MAX_CHARS): não tenta gravar, devolve cópia nova a cada leitura
  const antes = c.localStorage.gravacoes;
  c.grande = { t: 'x'.repeat(1100000) };
  vm.runInContext("lsSet('adm_avisos',grande)", c);
  ok('🧨 acima do limite: nem tenta gravar no aparelho', c.localStorage.gravacoes === antes && c.localStorage.getItem('endodirect_v1_adm_avisos') === null);
  const a = vm.runInContext("lsGet('adm_avisos')", c), b = vm.runInContext("lsGet('adm_avisos')", c);
  ok('acima do limite: leitura devolve o valor, cópia nova a cada vez', a.t.length === 1100000 && a !== b);
  // pequeno: segue no aparelho
  vm.runInContext("lsSet('notes',[{id:1,title:'A'}])", c);
  ok('o que é do aluno (pequeno) segue no localStorage', JSON.parse(c.localStorage.getItem('endodirect_v1_notes'))[0].title === 'A');
}
{
  // cota estourada: a cópia velha sai e o valor novo fica na memória
  const c = ctx(60);
  c.localStorage.setItem('endodirect_v1_fc', JSON.stringify([1]));
  vm.runInContext("lsSet('fc',[" + Array.from({ length: 40 }, (_, i) => i).join(',') + '])', c);
  ok('🧨 cota estourada: a cópia velha não fica no aparelho', c.localStorage.getItem('endodirect_v1_fc') === null);
  ok('cota estourada: o valor novo segue legível na sessão', vm.runInContext("lsGet('fc').length", c) === 40);
}
{
  // Pacientes da Trajetória do peso só existem no aparelho: sem teto de tamanho e, na cota estourada, a cópia anterior fica
  const c = ctx(5000000);
  c.grande = { pac: [{ t: 'x'.repeat(1100000) }] };
  ok('pacientes acima de LS_MAX_CHARS vão para o aparelho mesmo assim', vm.runInContext("lsSet('trajpeso_u1',grande)", c) === true && c.localStorage.getItem('endodirect_v1_trajpeso_u1').length > 1100000);
  const d = ctx(80);
  d.localStorage.setItem('endodirect_v1_trajpeso_u1', JSON.stringify({ pac: [1] }));
  const r = vm.runInContext("lsSet('trajpeso_u1',{pac:[" + Array.from({ length: 40 }, (_, i) => i).join(',') + "]})", d);
  ok('🧨 cota estourada nos pacientes: a cópia anterior fica no aparelho e lsSet avisa (false)', r === false && JSON.parse(d.localStorage.getItem('endodirect_v1_trajpeso_u1')).pac.length === 1 && vm.runInContext("lsGet('trajpeso_u1').pac.length", d) === 1);
}
// Mural: tipo calculado uma vez por item, mesma ordem de antes
{
  const fn = corpo('muralSortList');
  ok('🧨 o comparador do Mural não chama muralTypeRank (calculado antes, uma vez por item)', /var _ord=arr\.map\(function\(a,i\)\{return \{a:a,i:i,dk:muralDayKey\(a\),r:muralTypeRank\(a\)/.test(fn) && !/sort\(function\(a,b\)\{\s*var dk=muralDayKey/.test(fn));
  let chamadas = 0;
  const c = { muralTypeRank: (a) => { chamadas++; return a.r; }, Number };
  vm.createContext(c);
  vm.runInContext(corpo('muralDayKey') + corpo('muralSortList'), c);
  const dia = (d, h) => new Date(2026, 10, d, h).getTime();
  c.lista = [{ id: 'a', at: dia(15, 9), r: 7 }, { id: 'b', at: dia(16, 8), r: 9 }, { id: 'c', at: dia(16, 10), r: 1 }, { id: 'd', at: dia(16, 7), r: 9 }, { id: 'e', at: dia(15, 20), r: 0 }];
  const ord = vm.runInContext("muralSortList(lista,'relevantes').map(function(x){return x.id;}).join('')", c);
  ok('ordem "mais relevantes": dia mais novo, depois tipo, depois hora', ord === 'cbdea', ord);
  ok('tipo calculado uma vez por item', chamadas === 5, String(chamadas));
}
// refresh pós-carga: Mural e Podcasts só se estiverem na tela
{
  const r = corpo('refreshAfterRemoteState');
  ok('🧨 Podcasts só redesenhados na carga se estiverem na tela', /if\(painelNaTela\('podcast'\)\)renderPodcasts\(\);/.test(r) && !/try\{renderPodcasts\(\);\}/.test(r));
  ok('🧨 Mural só redesenhado na carga se estiver na tela', /if\(painelNaTela\('mural'\)\)initMural\(\);/.test(r) && !/try\{initMural\(\);\}/.test(r));
  ok('ao abrir, goPanel desenha os dois', /if\(id==='podcast'\)renderPodcasts\(\);/.test(html) && /if\(id==='mural'\)initMural\(\);/.test(html));
}
ok('formatador de números único no Dashboard', /function nBR\(n\)\{try\{nBR\.f=nBR\.f\|\|new Intl\.NumberFormat\('pt-BR'\);return nBR\.f\.format\(Number\(n\|\|0\)\);\}/.test(html));
if (bad) { console.log('✗ desempenho do app: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ desempenho do app: questões e Resumos fora do localStorage, cota estourada não deixa cópia velha, Mural ordena sem recalcular, telas escondidas não redesenham');
