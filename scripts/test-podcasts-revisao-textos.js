#!/usr/bin/env node
// PROPOSTAS 11, 12 E 17 DA REVISÃO DE FORMATAÇÃO (professor, 17/11/2026: "Eu acato as sugestões ... Concordo com tudo").
// 🧨 Os modos de quebrar isto em silêncio:
//  - Podcasts voltarem a ocupar ~1 tela por episódio no celular (texto recuado atrás do ícone, descrição inteira);
//  - o "Ler mais" aparecer em descrição curta, ou ser ligado a cada desenho (abriria e fecharia no mesmo toque);
//  - "intervalo 0d · EF 2.5" e "Devido" voltarem à Revisão ou ao Caderno de erros;
//  - "questão(ões)" e números sem milhar voltarem ao Banco; "79 NOVOS" repetindo "79 cards".
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
// 11. Podcasts
const pod = corpo('renderPodcasts');
ok('🧨 cabeçalho (ícone + título) separado do corpo (texto e player)', /<div class="card pod-card(?:'\+\(_ok\?' pod-ouvido':''\)\+')?"( data-pod-at="'\+\(\+p\.at\|\|0\)\+'")?(?: data-pod-key="'\+esc\(podKey\(p\)\)\+'")?><div class="pod-cab"><div class="pod-ico">🎧<\/div><div class="pod-tit">/.test(pod) && /<div class="pod-corpo'\+\(_longo\?' pod-longo':''\)\+'"><div class="pod-texto">/.test(pod));
ok('🧨 "Ler mais" só na descrição longa (> 180 caracteres de texto)', /_longo=_pt\.texto\.join\(' '\)\.length>180;/.test(pod) && /\(_longo\?'<button type="button" class="pod-mais" data-pod-mais aria-expanded="false">Ler mais<\/button>':''\)/.test(pod));
ok('🧨 "Ler mais" ligado uma vez só', /if\(!podMaisLigado\)\{podMaisLigado=true;document\.addEventListener\('click'/.test(pod));
const cssPod = (html.match(/\/\* PODCASTS COMPACTOS[\s\S]*?\n@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('no computador, o texto segue recuado ao lado do ícone (desenho de antes)', /\n\.pod-corpo\{margin-left:calc\(46px \+ \.8rem\)\}/.test(html) && /\n\.pod-mais\{display:none\}/.test(html));
ok('🧨 no celular: texto na largura toda, descrição longa recolhida, sem "Siga/Acesse"', /\.pod-corpo\{margin-left:0;/.test(cssPod) && /\.pod-longo:not\(\.pod-aberto\) \.pod-texto \.pod-desc\{max-height:4\.7em;overflow:hidden/.test(cssPod) && /\.pod-card \.pod-links\{display:none\}/.test(cssPod) && /\.pod-mais\{display:inline-flex/.test(cssPod));
// 12. Revisão e Caderno de erros
const c = { Date, Math, Number, srInit: () => {} };
vm.createContext(c);
vm.runInContext(corpo('srIsDue') + corpo('srQuandoHTML'), c);
const agora = Date.now();
ok('vencido: "Revisar hoje"', /Revisar hoje/.test(vm.runInContext('srQuandoHTML({due:' + (agora - 1000) + '})', c)));
ok('daqui a 1 dia: "Próxima revisão em 1 dia"', /Próxima revisão em 1 dia</.test(vm.runInContext('srQuandoHTML({due:' + (agora + 5 * 3600000) + '})', c)));
ok('daqui a 3 dias: "Próxima revisão em 3 dias"', /Próxima revisão em 3 dias</.test(vm.runInContext('srQuandoHTML({due:' + (agora + 2.5 * 86400000) + '})', c)));
const sr = corpo('renderSR'), err = html.slice(html.indexOf("var el=document.getElementById('err-card-list');"), html.indexOf("var el=document.getElementById('err-card-list');") + 1200);
ok('🧨 Revisão sem "intervalo/EF/Devido", com o "quando" na linha da área', !/intervalo '|• EF |>Devido</.test(sr) && /esc\(c\.cat\|\|'Geral'\)\+' · '\+srQuandoHTML\(c\)/.test(sr));
ok('🧨 Caderno de erros sem "intervalo/Devido", com o "quando" na linha da área', !/intervalo '|>Devido</.test(err) && /esc\(sub\)\+' · '\+srQuandoHTML\(it\)/.test(err));
// 17. Textos
const upi = corpo('updateProvaInfo');
ok('🧨 sem "questão(ões)" no Banco', !/questão\(ões\)/.test(upi));
ok('Banco: milhar e sem "Mostrando X de X" quando nada está filtrado', /n===total\?nBR\(total\)\+' '\+\(total===1\?'questão':'questões'\)\+' no seu banco':'Mostrando '\+nBR\(n\)\+' de '\+nBR\(total\)/.test(upi) && /'▶ Estudar '\+nBR\(podeN\)/.test(upi));
const n = { esc: String };
vm.createContext(n);
vm.runInContext(corpo('novosSufixoHTML') + corpo('novosDeTotalHTML'), n);
ok('🧨 todos novos: "Todos novos", sem repetir o número', vm.runInContext('novosDeTotalHTML(79,79,false)', n) === ' <span class="novo-selo">Todos novos</span>');
ok('parte nova: o número segue', vm.runInContext('novosDeTotalHTML(20,50,false)', n) === ' <span class="novo-selo">20 novos</span>');
ok('nenhum novo: nada', vm.runInContext('novosDeTotalHTML(0,50,false)', n) === '');
if (bad) { console.log('✗ Podcasts, Revisão e textos: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Podcasts compactos no celular, Revisão e Caderno de erros com "quando revisar" em palavras, textos do Banco e dos novos');
