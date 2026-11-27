#!/usr/bin/env node
// RESUMOS: NOVA ORGANIZAÇÃO (27/11/2026).
//
// Professor, sobre a prévia (capítulos numerados, selos no lugar de "1 resumo", 4 colunas, progresso): "Aceito todas
// as sugestões, exceto [...] o tempo total de leitura [...] Pode retirar essa informação."
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o tempo TOTAL de leitura voltar ao topo (o professor pediu para tirar);
//  - o número do capítulo não seguir a ordem do professor;
//  - "Lido" aparecer cedo demais (abrir o capítulo não é ler) ou o % voltar para trás;
//  - ler no celular apagar o lido no computador (a sincronização tem de ficar com o MAIOR);
//  - o progresso não ir para o servidor, ou não sair da conta ao sair;
//  - a degustação ver "0 de 15 lidos" e cadeados sem explicação;
//  - artigos contarem como capítulos no progresso da área;
//  - a grade nova vazar para Flashcards, Mapas ou Diretrizes (só os Resumos mudaram).
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
const linha = (re) => { const m = html.match(re); return m ? m[0] : ''; };

// ── 1. Funções (vm) ─────────────────────────────────────────────────────────────────────
const palavras = (n) => Array.from({ length: n }, (_, i) => 'palavra' + i).join(' ');
const ctx = {
  Math, String, Array, Object, JSON, isNaN,
  DB: { lidos: {} },
  refSubSel: 'Obesidade',
  diretrizes: [
    { sub: 'Obesidade', tema: 'Definição', privado: true, resumo: palavras(1000), videos: [{ src: 'a.m3u8' }], mapa: { nodes: [{}] }, flashcards: [{}] },
    { sub: 'Obesidade', tema: 'Fisiopatologia', privado: true, resumo: palavras(3000), videos: [], mapa: { nodes: [{}] }, flashcards: [{}] },
    { sub: 'Obesidade', tema: 'Tratamento', privado: true, resumo: palavras(150), videos: [{ src: 'b' }, { src: 'c' }], mapa: { nodes: [] }, flashcards: [] },
    { sub: 'Obesidade', tema: 'SELECT (2023)', privado: true, tipo: 'artigo', resumo: palavras(500) },
    { sub: 'Obesidade', tema: 'Rascunho', privado: true, rascunho: true, resumo: palavras(10) },
  ],
  esc: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  dirIsRascunho: (d) => !!(d && d.rascunho),
  dirTipoOf: (d) => (d && d.tipo === 'artigo' ? 'artigo' : 'capitulo'),
  dirTemaOf: (d) => d.tema,
  dirVideosDe: (d) => (Array.isArray(d && d.videos) ? d.videos.filter((v) => v && v.src) : []),
  buscaPlano: (s) => String(s || '').replace(/\s+/g, ' ').trim(),
};
vm.createContext(ctx);
vm.runInContext([linha(/var RESU_LIDO=\d+;/), 'var resuInfoCache={};', linha(/var RESU_ICO_RELOGIO='[^\n]*';/), linha(/var RESU_ICO_VIDEO='[^\n]*';/),
  corpo('resuLidosMapa'), corpo('resuLidoChave'), corpo('resuLidoPct'), corpo('resuLidoMarca'), corpo('resuLidosMescla'), corpo('resuCapInfo'),
  corpo('resuMetaHTML'), corpo('resuResumoHTML'), corpo('resuCapCardHTML'), corpo('resuProgressoHTML'), corpo('resuSubProgressoHTML'), corpo('dirTemaList')].join('\n'), ctx);
const run = (c) => vm.runInContext(c, ctx);
ok('"Lido" a partir de 90%', run('RESU_LIDO') === 90);
// Progresso
ok('🧨 o % só sobe (rolar para cima não desfaz o lido)', run('resuLidoMarca("Obesidade","Definição",0.4)') === true && run('resuLidoMarca("Obesidade","Definição",0.2)') === false && run('resuLidoPct("Obesidade","Definição")') === 40);
run('resuLidosMescla({"Obesidade||Definição":30,"Obesidade||Fisiopatologia":95,"x||y":"lixo","z||w":250})');
ok('🧨 sincronizar fica com o MAIOR entre aparelho e servidor (e ignora lixo)', run('resuLidoPct("Obesidade","Definição")') === 40 && run('resuLidoPct("Obesidade","Fisiopatologia")') === 95
  && run('resuLidoPct("x","y")') === 0 && run('resuLidoPct("z","w")') === 100);
run('DB.lidos=null');
ok('estado ausente ou estragado vira {}', run('resuLidoPct("Obesidade","Definição")') === 0 && run('JSON.stringify(DB.lidos)') === '{}');
// Informação do capítulo
const vis = 'function(d){return !dirIsRascunho(d)&&d.privado===true;}';
ok('minutos de leitura (200 palavras/min) e videoaulas', run('JSON.stringify(resuCapInfo("Obesidade","Definição",' + vis + '))') === '{"min":5,"vids":1,"mapa":true,"fc":true}'
  && run('resuCapInfo("Obesidade","Fisiopatologia",' + vis + ').min') === 15 && run('resuCapInfo("Obesidade","Tratamento",' + vis + ').min') === 1);
ok('artigo e rascunho não são capítulo; tema sem conteúdo = null', run('resuCapInfo("Obesidade","SELECT (2023)",' + vis + ')') === null && run('resuCapInfo("Obesidade","Rascunho",' + vis + ')') === null && run('resuCapInfo("Obesidade","Nada",' + vis + ')') === null);
const meta = run('resuMetaHTML(resuCapInfo("Obesidade","Tratamento",' + vis + '))');
ok('meta: minutos e "2 videoaulas"', /1 min de leitura/.test(meta) && /2 videoaulas/.test(meta) && /<svg[^>]*aria-hidden="true"/.test(meta));
ok('sem vídeo, sem o selo de vídeo; sem conteúdo, "Sem conteúdo ainda"', !/videoaula/.test(run('resuMetaHTML(resuCapInfo("Obesidade","Fisiopatologia",' + vis + '))')) && /Sem conteúdo ainda/.test(run('resuMetaHTML(null)')));
// Topo
const infosTodos = '[{min:5,vids:1,mapa:true,fc:true},{min:15,vids:0,mapa:true,fc:true}]';
const topo = run('resuResumoHTML(' + infosTodos + ')');
ok('topo: "2 capítulos · 1 com videoaula · Todos com mapa mental e flashcards"', /<b>2<\/b> capítulos/.test(topo) && /<b>1<\/b> com videoaula/.test(topo) && /Todos com mapa mental e flashcards/.test(topo));
ok('🧨 SEM o tempo total de leitura (pedido do professor)', !/min|hora|leitura/.test(topo));
const topo2 = run('resuResumoHTML([{min:5,vids:0,mapa:true,fc:false},{min:3,vids:0,mapa:false,fc:false}])');
ok('quando nem todos têm, o topo diz quantos têm (e nada inventado)', /<b>1<\/b> com mapa mental/.test(topo2) && !/flashcards/.test(topo2) && !/videoaula/.test(topo2));
// Cartão
run('DB.lidos={"Obesidade||A":95,"Obesidade||B":40,"Obesidade||C":3}');
const cA = run('resuCapCardHTML({tema:"A"},1,{min:5,vids:1},false,true)'), cB = run('resuCapCardHTML({tema:"B"},12,{min:7,vids:0},false,true)'), cC = run('resuCapCardHTML({tema:"C"},3,{min:7,vids:0},false,true)');
ok('🧨 número na ordem do professor, com dois dígitos', /<span class="resu-num">01<\/span>/.test(cA) && /<span class="resu-num">12<\/span>/.test(cB));
ok('lido ≥ 90% → "✓ Lido"; em andamento → "40% lido" com a barrinha; < 5% → nada', /resu-st lido">✓ Lido/.test(cA) && /resu-st and">40% lido/.test(cB) && /resu-cap-bar"><span style="width:40%"/.test(cB) && !/resu-st/.test(cC));
ok('o cartão abre o capítulo (data-dir-tema) e é um botão', /^<button class="resu-cap" data-dir-tema="A">/.test(cA));
const cL = run('resuCapCardHTML({tema:"B"},2,{min:7,vids:0},true,false)');
ok('🧨 degustação: cadeado, "Exclusivo para assinantes", leva ao convite (data-dir-lockedtema) e sem progresso', /resu-cap dir-locked" data-dir-lockedtema="B"/.test(cL) && /Exclusivo para assinantes/.test(cL) && !/% lido/.test(cL));
// Faixa "Você leu"
const temas = '[{tema:"A"},{tema:"B"},{tema:"C"},{tema:"D"}]';
run('DB.lidos={"Obesidade||B":100,"Obesidade||C":40}');
const pg = run('resuProgressoHTML(' + temas + ')');
ok('🧨 faixa: "Você leu 1 de 4" e "Continuar" no capítulo EM ANDAMENTO (03 · C), não no 1º não lido', /Você leu <b>1 de 4<\/b> capítulos/.test(pg) && /data-dir-tema="C">Continuar: 03 · C →/.test(pg) && /width:25%/.test(pg));
run('DB.lidos={}');
ok('sem leitura: "Começar: 01 · A"', /Você ainda não leu nenhum capítulo/.test(run('resuProgressoHTML(' + temas + ')')) && /Começar: 01 · A →/.test(run('resuProgressoHTML(' + temas + ')')));
run('DB.lidos={"Obesidade||A":100,"Obesidade||B":100,"Obesidade||C":100,"Obesidade||D":91}');
const tudo = run('resuProgressoHTML(' + temas + ')');
ok('tudo lido: "Você leu todos os 4" sem botão', /todos os 4<\/b> capítulos/.test(tudo) && !/resu-prog-go/.test(tudo));
// Grade de subespecialidades
run('DB.lidos={"Obesidade||Definição":100,"Obesidade||SELECT (2023)":100}');
const sp = run('resuSubProgressoHTML("Obesidade")');
ok('🧨 área: "1 de 3 capítulos lidos" (artigo e rascunho não contam)', /1 de 3 capítulos lidos/.test(sp) && /width:33%/.test(sp));
ok('área sem capítulos: nada', run('resuSubProgressoHTML("Tireoide")') === '');

// ── 2. Ligações no app ──────────────────────────────────────────────────────────────────
ok('🧨 % lido é pessoal e sincroniza (PERSONAL_STATE_KEYS, payload, persist, chegada do servidor, sair da conta)',
  /var PERSONAL_STATE_KEYS=\[[^\]]*'lidos'[^\]]*\];/.test(html) && /leitura:DB\.leitura,grifos:DB\.grifos,lidos:DB\.lidos,/.test(html)
  && /lsSet\('lidos',DB\.lidos\);/.test(corpo('persist')) && /if\(payload\.lidos&&typeof payload\.lidos==='object'\)resuLidosMescla\(payload\.lidos\);/.test(html)
  && /DB\.leitura=null;DB\.grifos=\[\];DB\.lidos=\{\};/.test(html) && /lidos:lsGet\('lidos'\)\|\|\{\},/.test(html));
ok('🧨 a rolagem do capítulo marca o % (só capítulos) e vai para o aparelho', /if\(\(l\.tipo\|\|'capitulo'\)!=='artigo'\)resuLidoMarca\(l\.sub,l\.tema,l\.pos\);/.test(corpo('leituraNoScroll'))
  && /lsSet\('lidos',DB\.lidos\)/.test(corpo('leituraSalva')));
ok('capítulo curto (cabe na tela) também conta', /setTimeout\(function\(\)\{try\{leituraNoScroll\(\);\}catch\(e\)\{\}\},700\);/.test(corpo('resuPosRender')));
const v = corpo('diretrizesViewHTML');
ok('🧨 aluno: cartões novos só nos CAPÍTULOS dos Resumos (artigos e Diretrizes como antes)', /var _resuCaps=refPrivadoMode&&!_isArt;/.test(v) && /if\(_resuCaps\)return resuCapCardHTML\(t,ti\+1,_infos\[ti\],lk,!_deg1\);/.test(v));
ok('🧨 degustação não vê a faixa de progresso nem o progresso das áreas', /\(_resuCaps\?resuResumoHTML\(_infos\)\+\(_deg1\?'':resuProgressoHTML\(temas\)\):''\)/.test(v) && /\(\(refPrivadoMode&&!_deg1\)\?resuSubProgressoHTML\(s\.sub\):''\)/.test(v));
ok('4 colunas só nos Resumos (resu-grade), no aluno e no professor', /'<div class="dir-sub-grid'\+\(refPrivadoMode\?' resu-grade':''\)\+'">'/.test(v)
  && (html.match(/\(admRefMode==='res'\?' resu-grade':''\)/g) || []).length === 2 && /\.dir-sub-grid\.resu-grade\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(html));
ok('topo da grade de subespecialidades: subespecialidades, capítulos e artigos', /'<div class="resu-resumo"><span><b>'\+subs\.length\+'<\/b> '/.test(v));
ok('professor: capítulos numerados com minutos e videoaulas, alça de arrastar e rascunho mantidos',
  /'<span class="resu-num dtc-num">'\+\(\(ti\+1\)<10\?'0':''\)\+\(ti\+1\)\+'<\/span>/.test(html) && /resuCapInfo\(admRefSub,t\.tema,dirModeMatch\)/.test(html) && /data-ref-tema-drag=/.test(html) && /🚧 rascunho/.test(html));
ok('no celular, o cartão vira linha (número, título, estado)', /@media\(max-width:560px\)\{\s*\.resu-cap\{grid-template-columns:2\.3rem minmax\(0,1fr\) auto;grid-template-areas:"num tit st" "num meta st" "bar bar bar"/.test(html));

if (bad) { console.log(`\n${bad} verificação(ões) da nova organização dos Resumos falharam.`); process.exit(1); }
console.log('Resumos, nova organização: ok');
