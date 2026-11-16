// Regressão: mapas mentais do PAINEL DO PROFESSOR no modo do aluno (16/11/2026).
//
// Professor, com prints do editor de Mapas Mentais (o mapa abria inteiro e todo editável) e da
// aba "Mapas mentais" das Diretrizes (editor antigo, em lista): "Deixar de modo semelhante ao
// painel do aluno, com o botão de editar e em cima do card, abrir apenas quando clicar em cima.
// Deixar a configuração desses mapas mentais das diretrizes semelhantes aos da ferramenta dos
// mapas mentais, com a mesma configuração."
//
// O que este teste prende:
//   1) o CSS do modo dentro do painel exige as DUAS classes (mm-tela-cheia + mm-adm-inline) e
//      tira o position:fixed da tela cheia;
//   2) mmAbreNoPainel liga o modo leitura (tela cheia) e a abertura nova, e restoreMMLive desliga
//      a classe do painel e esquece o capítulo;
//   3) a ferramenta abre o mapa por mmAbreNoPainel (não mais o editor inteiro), e o mapa em branco
//      abre no modo Editar;
//   4) a aba das Diretrizes e dos Resumos usa admCapMapaHTML (cartão do aluno + visualizador), não
//      os editores antigos, com "✏️ Editar" em cima do cartão;
//   5) mmParaDirMapa é o inverso de dirMapaParaMM (3 níveis preservados);
//   6) Salvar e "← Voltar" tratam o capítulo antes da ferramenta.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };
function corpo(nome) {
  const a = html.indexOf('function ' + nome + '(');
  if (a < 0) { falhas.push('não achei function ' + nome); return ''; }
  const b = html.indexOf('\n}', a);
  return html.slice(a, b + 2);
}

// ── 1. CSS ───────────────────────────────────────────────────────────────────
const regra = (html.match(/body\.mm-tela-cheia\.mm-adm-inline #mm-live\{([^}]*)\}/) || [, ''])[1];
ok(/position:relative/.test(regra) && /z-index:1/.test(regra), '🧨 o mapa no painel continua em position:fixed — cobriria o painel inteiro');
ok(/height:min\(/.test(regra), 'o cartão do mapa no painel perdeu a altura própria (o encaixe precisa dela)');
ok(/body\.mm-tela-cheia\.mm-adm-inline\{overflow:auto\}/.test(html), '⚠️ com o mapa aberto, o painel deixaria de rolar');
ok(!/(^|[\s,}])body\.mm-adm-inline[ {.#:]/.test(html), '⚠️ regra com .mm-adm-inline sem .mm-tela-cheia: a classe sozinha não pode mudar nada');

// ── 2. abrir e devolver ──────────────────────────────────────────────────────
const abre = corpo('mmAbreNoPainel');
ok(/classList\.add\('mm-adm-inline'\)/.test(abre) && /mmTelaCheia\(true\)/.test(abre), '🧨 o mapa do painel não abre no modo leitura do aluno');
// 16/11/2026 (professor, print do capítulo "Tratamento do DM2" no iPhone): "Deixa aparecendo também em
// modo de tela cheia, assim como também é na ferramenta dos mapas mentais". O capítulo abre por cima de
// tudo (no body, sem .mm-adm-inline); a ferramenta segue no cartão.
ok(/if\(telaCheia\)\{if\(live\.parentNode!==document\.body\)document\.body\.appendChild\(live\);document\.body\.classList\.remove\('mm-adm-inline'\);\}/.test(abre), '🧨 tela cheia: o mapa tem de sair do cartão (ir para o body) e sem a classe do cartão');
ok(/else\{host\.appendChild\(live\);document\.body\.classList\.add\('mm-adm-inline'\);\}/.test(abre), 'sem tela cheia, o mapa fica no cartão da página');
ok(/if\(mmAbreNoPainel\(host,mm,admCapMMEditar,true\)\)mmCapAdmin=i;/.test(corpo('admCapMMBind')), '🧨 o mapa do capítulo (Diretrizes/Resumos) no painel não abre em tela cheia');
ok(abre.indexOf('mmNovaAbertura()') > 0 && abre.indexOf('mmNovaAbertura()') < abre.indexOf('renderMMEditor()'), '🧨 o mapa do painel não abre só com a raiz e os ramos (mmNovaAbertura antes do desenho)');
ok(/if\(editar\)mmModoEdicao\(true\)/.test(abre), 'falta abrir já no modo Editar quando pedido');
const devolve = corpo('restoreMMLive');
ok(/classList\.remove\('mm-adm-inline'\)/.test(devolve), '🧨 sair do mapa do painel deixa a classe ligada');
ok(/mmCapAdmin=-1/.test(devolve), '⚠️ sair do mapa não esquece o capítulo: o Salvar seguinte gravaria no capítulo errado');

// ── 3. ferramenta ────────────────────────────────────────────────────────────
const iAdm = html.indexOf("if(sec==='mapas'){");
const bindMapas = html.slice(iAdm, html.indexOf('// Grade de subespecialidades → entra na subespecialidade.', iAdm));
ok(/mmAbreNoPainel\(vhost,/.test(bindMapas) && /mmAdminEdit=true/.test(bindMapas), '🧨 a ferramenta voltou a abrir o mapa inteiro e todo editável');
ok(/editar:true,data:\{root:topic,branches:\[\{label:'Ramo 1'/.test(html), 'o mapa em branco deveria abrir já no modo Editar');
ok(!/id="adm-mm-editback"/.test(corpo('admMapasHTML')), 'o "← subespecialidade" duplicava o "← Voltar" do mapa');

// ── 4. aba das Diretrizes e dos Resumos ──────────────────────────────────────
ok(/fmtAtivo==='mapa'\?admCapMapaHTML\(x\.d,x\.i\):/.test(html), '🧨 a aba Mapas mentais voltou para os editores antigos');
ok(!/fmtAtivo==='mapa'\?\(mapaEdit/.test(html), 'resto do seletor antigo de editor da aba');
ok(/if\(fmtAtivo==='mapa'&&admCapMM!==x\.i&&dirMapaParaMM\(x\.d\)\)editBtn='<button class="btn btn-outline btn-sm" data-adm-capmm-editar="'/.test(html), 'falta o "✏️ Editar" em cima do cartão do mapa');
ok(/admCapMMBind\(main\)/.test(html), '🧨 a aba Mapas mentais não liga os cartões nem o visualizador');

// ── 5. ida e volta do formato ────────────────────────────────────────────────
{
  const cx = { JSON, Array, String, Object };
  vm.createContext(cx);
  vm.runInContext([corpo('dirTemaOf'), corpo('normMMLeaf'), corpo('normalizeMMData'), corpo('dirMapaParaMM'), corpo('mmParaDirMapa')].join('\n'), cx);
  const mapa = { central: 'Nódulo tireoidiano', nodes: [
    { label: 'Avaliação', children: ['TSH', { label: 'Ultrassonografia', children: ['TI-RADS', 'Tamanho'] }] },
    { label: 'PAAF', children: ['Bethesda'] }] };
  cx.d = { tema: 'T', mapa };
  const volta = vm.runInContext('mmParaDirMapa(dirMapaParaMM(d))', cx);
  ok(JSON.stringify(volta) === JSON.stringify(mapa), '🧨 salvar o mapa do capítulo pelo visualizador muda o conteúdo: ' + JSON.stringify(volta));
}

// ── 6. Salvar e Voltar ───────────────────────────────────────────────────────
const salvar = corpo('saveMM');
ok(salvar.indexOf('if(mmCapAdmin>=0){admCapMMSalvar();return;}') > 0 && salvar.indexOf('mmCapAdmin') < salvar.indexOf('if(mmAdminEdit)'), '🧨 o Salvar do capítulo cairia no mapa publicado da ferramenta');
ok(/d\.mapa=mmParaDirMapa\(curMM\.data\)/.test(corpo('admCapMMSalvar')) && /persistDiretrizes\(\)/.test(corpo('admCapMMSalvar')), '🧨 o Salvar do capítulo não grava no capítulo');
const i = html.indexOf("getElementById('btn-mm-close').addEventListener('click',function(){");
const fecha = html.slice(i, html.indexOf('});', i));
ok(fecha.indexOf('mmDoCapitulo') < fecha.indexOf('mmCapAdmin') && fecha.indexOf('mmCapAdmin') < fecha.indexOf('mmAdminEdit'), '🧨 o "← Voltar" do capítulo no painel cai na lista da ferramenta');

if (falhas.length) { console.error('✗ mapas do painel do professor'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
console.log('✓ mapas do painel do professor: modo do aluno, Editar em cima, Diretrizes e Resumos no mesmo visualizador');
