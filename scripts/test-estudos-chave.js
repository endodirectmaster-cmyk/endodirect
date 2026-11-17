// Regressão: estudos-chave no fim do capítulo dos Resumos, "Capítulos relacionados" na ficha do
// artigo e revisão rápida dos estudos em cartões (pedido do professor, 17/11/2026: "Artigos-chave
// em cada capítulo", "Revisão rápida dos estudos ... cartões para passar com o dedo").
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}
const ini = html.indexOf('var ESTUDOS_CHAVE={');
const fim = html.indexOf('\nfunction estNorm(');
ok(ini > 0 && fim > ini, 'a tabela ESTUDOS_CHAVE sumiu');

const D = [
  { sub: 'Tireoide', tema: 'Tireoide e Gestação', privado: true },
  { sub: 'Tireoide', tema: 'Hipotireoidismo', privado: true },
  { sub: 'Tireoide', tema: 'Carcinoma Medular e Anaplásico de Tireoide', privado: true },
  { sub: 'Osteometabolismo', tema: 'Osteomalácia e Raquitismo', privado: true },
  { sub: 'Tireoide', tema: 'Tireoidites', privado: true },
  { sub: 'Tireoide', tema: 'CATS (2012)', privado: true, tipo: 'artigo', fonte: 'NEJM', ano: '2012', pts: ['**Pergunta / população** — Rastrear a **função tireoidiana** na gestação melhora o QI?', 'b', 'c', 'd', 'e', 'f'] },
  { sub: 'Tireoide', tema: 'Casey — levotiroxina na gestação e QI da criança (2017)', privado: true, tipo: 'artigo', fonte: 'NEJM', pts: ['p1'] },
  { sub: 'Tireoide', tema: 'TABLET (2019)', privado: true, tipo: 'artigo', rascunho: true, fonte: 'NEJM' },
  { sub: 'Tireoide', tema: 'TRUST (2017)', privado: true, tipo: 'artigo', fonte: 'NEJM' },
  { sub: 'Tireoide', tema: 'LIBRETTO-531 (2023)', privado: true, tipo: 'artigo', fonte: 'NEJM' },
  { sub: 'Tireoide', tema: 'Subbiah — dabrafenibe (2018)', privado: true, tipo: 'artigo', fonte: 'J Clin Oncol' },
  { sub: 'Tireoide', tema: 'Estudo novo do professor (2026)', privado: true, tipo: 'artigo', capitulos: ['Tireoidites'] },
  { sub: 'Endocrinologia Pediátrica', tema: 'Imel — burosumabe (2019)', privado: true, tipo: 'artigo', fonte: 'Lancet' },
  { sub: 'Tireoide', tema: 'Hipotireoidismo', privado: false },
];
const ctx = {
  diretrizes: D, refSubSel: 'Tireoide', refRevArt: null,
  esc: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  mdInline: (s) => String(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'),
};
vm.createContext(ctx);
vm.runInContext(html.slice(ini, fim) + ['estNorm', 'estSubDe', 'estItensResumos', 'estudosDoCapitulo', 'capitulosDoEstudo', 'estDescr',
  'dirEstudosHTML', 'dirCapsDoEstudoHTML', 'dirRevisaoArtigosHTML', 'dirPontoLI', 'dirTipoOf', 'dirIsRascunho', 'dirTemaOf'].map(corpo).join('\n')
  + '\nfunction dirIsVisible(d){return !dirIsRascunho(d)&&d.privado===true&&dirTipoOf(d)==="artigo";}', ctx);
const run = (c) => vm.runInContext(c, ctx);
const temas = (c) => JSON.parse(run('JSON.stringify(' + c + '.map(function(d){return d.tema;}))'));

// 1) capítulo → estudos (só publicados; rascunho nunca)
let t = temas('estudosDoCapitulo("Tireoide","Tireoide e Gestação")');
ok(JSON.stringify(t) === JSON.stringify(['CATS (2012)', 'Casey — levotiroxina na gestação e QI da criança (2017)']),
   'gestação → CATS e Casey, sem o TABLET em rascunho: ' + JSON.stringify(t));
t = temas('estudosDoCapitulo("Tireoide","Hipotireoidismo")');
ok(JSON.stringify(t) === JSON.stringify(['TRUST (2017)']), 'hipotireoidismo → TRUST: ' + JSON.stringify(t));
t = temas('estudosDoCapitulo("Tireoide","Carcinoma Medular e Anaplásico de Tireoide")');
ok(t.length === 2 && /LIBRETTO/.test(t[0]) && /Subbiah/.test(t[1]), 'medular e anaplásico → LIBRETTO-531 e Subbiah: ' + JSON.stringify(t));
// 2) de outra subespecialidade ("Sub|prefixo")
t = temas('estudosDoCapitulo("Osteometabolismo","Osteomalácia e Raquitismo")');
ok(t.length === 1 && /^Imel/.test(t[0]), 'raquitismo (Osteometabolismo) → burosumabe da Pediátrica: ' + JSON.stringify(t));
// 3) campo opcional `capitulos` liga um artigo novo sem mexer no código
t = temas('estudosDoCapitulo("Tireoide","Tireoidites")');
ok(t.length === 1 && /professor/.test(t[0]), 'artigo com `capitulos` aparece no capítulo: ' + JSON.stringify(t));
// 4) inverso: capítulos relacionados (só capítulos dos Resumos, sem repetir)
t = temas('capitulosDoEstudo(diretrizes.filter(function(d){return d.tema==="TRUST (2017)";})[0])');
ok(JSON.stringify(t) === JSON.stringify(['Hipotireoidismo']), 'TRUST → capítulo Hipotireoidismo, uma vez, só o dos Resumos: ' + JSON.stringify(t));
// 5) HTML do bloco
const h = run('dirEstudosHTML("Tireoide","Tireoide e Gestação")');
ok(/🔬 Estudos-chave deste tema/.test(h) && /data-dir-estudo="Tireoide\|\|CATS \(2012\)"/.test(h), 'o bloco não tem o título ou o botão do estudo: ' + h.slice(0, 300));
ok(/Rastrear a função tireoidiana na gestação melhora o QI\?/.test(h) && !/\*\*/.test(h), 'a linha do estudo mostra a pergunta sem o rótulo e sem **: ' + h);
ok(run('dirEstudosHTML("Tireoide","Emergências")') === '', 'capítulo sem estudo não ganha bloco vazio');
ok(/📚 Capítulos relacionados/.test(run('dirCapsDoEstudoHTML(diretrizes[8])')), 'a ficha do artigo não mostra os capítulos relacionados');
// 6) revisão rápida: um cartão por estudo, com os pontos-chave e navegação
run('refRevArt={idx:0}');
let r = run('dirRevisaoArtigosHTML([{tema:"CATS (2012)"},{tema:"TRUST (2017)"},{tema:"TABLET (2019)"}])');
ok(/Estudo 1 de 2/.test(r) && /CATS \(2012\)/.test(r) && (r.match(/<li>/g) || []).length === 6, 'o 1º cartão tem de mostrar o CATS com os 6 pontos (rascunho fora): ' + r.slice(0, 300));
ok(/data-dir-revnav="prev" disabled/.test(r) && /data-dir-revnav="next">/.test(r) && /data-dir-revabre="CATS \(2012\)"/.test(r), 'navegação/abrir estudo no cartão');
run('refRevArt={idx:9}');
r = run('dirRevisaoArtigosHTML([{tema:"CATS (2012)"},{tema:"TRUST (2017)"}])');
ok(/Estudo 2 de 2/.test(r) && run('refRevArt.idx') === 1 && run('refRevArt.n') === 2, 'índice fora do intervalo cai no último cartão');

// 7) ligação na tela (estático): bloco no fim do capítulo, volta ao capítulo, revisão
const view = corpo('diretrizesViewHTML'), bind = corpo('bindDiretrizesView');
ok(/dirEstudosHTML\(refSubSel,refTemaSel\)/.test(view) && /dirCapsDoEstudoHTML\(list\[0\]\.d\)/.test(view), 'o capítulo/artigo não chama o bloco de estudos');
ok(/typeof dirEstudosHTML==='function'/.test(view), 'a chamada tem de ser protegida (testes que montam a tela sem a tabela)');
ok(/data-dir-voltacap/.test(view) && /dirRevisaoArtigosHTML\(temas\)/.test(view) && /data-dir-revart/.test(view), 'faltam a volta ao capítulo ou a revisão rápida na tela');
ok(/\[data-dir-estudo\]/.test(bind) && /\[data-dir-capitulo\]/.test(bind) && /\[data-dir-revnav\]/.test(bind) && /touchend/.test(bind), 'faltam os eventos (estudo, capítulo, navegação, arrastar)');
ok(/refVoltaCap=\{sub:refSubSel,tema:refTemaSel\}/.test(bind), 'abrir um estudo do capítulo tem de guardar a volta');

if (falhas.length) {
  console.error('✗ estudos-chave e revisão rápida:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ estudos-chave no fim do capítulo, capítulos relacionados no artigo e revisão rápida em cartões');
