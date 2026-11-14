// O MAPA MENTAL DO CAPÍTULO (RESUMOS) ABRE NO MESMO VISUALIZADOR DA FERRAMENTA DE MAPAS.
//
// 🧨 POR QUE ESTE TESTE EXISTE (14/11/2026). Print do professor no celular, em Resumos ›
// "Diagnóstico e Classificação do Diabetes" › 🧠 Mapas mentais: a raiz à esquerda e os ramos
// cortados na borda do cartão. *"Os mapas mentais dos resumos dos capítulos está desconfigurado
// como era antigamente. Deixe no mesmo formato da ferramenta dos mapas mentais que você já
// consertou e ficou muito bom."*
//
// O capítulo tinha um desenhista próprio (`dirMapaHTML`: árvore inteira aberta dentro do
// cartão). A ferramenta já faz certo (tela cheia, encaixe, só raiz e ramos, toque abre,
// "← Voltar"). Agora a aba mostra um cartão e abre o MESMO #mm-live da ferramenta.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

// ── 1. A aba do capítulo não usa mais o desenhista antigo ────────────────
ok(html.indexOf('function dirMapaHTML(') < 0, '🧨 o desenhista antigo do mapa do capítulo (dirMapaHTML) voltou');
const card = corpo('dirCardHTML');
ok(/refFormat==='mapa'\)\{\s*body=dirMapaCardHTML\(d,i\);/.test(card),
  '🧨 a aba 🧠 Mapas mentais do capítulo não usa mais o cartão que abre o visualizador da ferramenta');

// ── 2. Conversão do mapa do capítulo para o formato da ferramenta ────────
const cx = { console, JSON, Array, String, Object, Math };
vm.createContext(cx);
vm.runInContext([corpo('dirTemaOf'), corpo('normMMLeaf'), corpo('normalizeMMData'), corpo('dirMapaParaMM'),
  'function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}',
  corpo('dirMapaCardHTML')].join('\n'), cx);
const mapa = { central: 'Diagnóstico e classificação', nodes: [
  { label: 'Critérios', children: [{ label: 'HbA1c ≥ 6,5%' }, { label: 'Jejum ≥ 126' }] },
  { label: 'Pré-diabetes', children: ['HbA1c 5,7–6,4%', 'GJA 100–125'] },
  { label: 'Classificação', children: [{ label: 'Específicos', children: ['MODY', 'Fármaco/pancreático'] }] }] };
{
  const mm = cx.normalizeMMData(cx.dirMapaParaMM({ tema: 'T', mapa }));
  ok(mm.root === 'Diagnóstico e classificação', '🧨 a raiz do mapa do capítulo não chegou ao visualizador: ' + mm.root);
  ok(mm.branches.map((b) => b.label).join('|') === 'Critérios|Pré-diabetes|Classificação', '🧨 os ramos do capítulo não chegaram ao visualizador');
  ok(mm.branches[0].leaves.join('|') === 'HbA1c ≥ 6,5%|Jejum ≥ 126', '🧨 subramos em objeto ({label}) se perderam na conversão');
  ok(mm.branches[1].leaves.join('|') === 'HbA1c 5,7–6,4%|GJA 100–125', '🧨 subramos em texto se perderam na conversão');
  const esp = mm.branches[2].leaves[0];
  ok(esp && esp.label === 'Específicos' && esp.children.join('|') === 'MODY|Fármaco/pancreático', '🧨 o 3º nível (sub-subramo) se perdeu na conversão');
  ok(cx.normalizeMMData(cx.dirMapaParaMM({ tema: 'Tema do capítulo', mapa: { nodes: mapa.nodes } })).root === 'Tema do capítulo',
    '⚠️ mapa sem `central` (8 capítulos em 14/11) ficou sem raiz — devia usar o tema do capítulo');
  ok(cx.dirMapaParaMM({ tema: 'T', mapa: { central: '', nodes: [] } }) === null && cx.dirMapaParaMM({ tema: 'T' }) === null,
    '⚠️ capítulo sem mapa abriria um visualizador vazio');
  const h = cx.dirMapaCardHTML({ tema: 'T', mapa }, 127);
  ok(/data-dir-abremapa="127"/.test(h) && /3 ramos/.test(h), '🧨 o cartão do mapa não leva ao mapa do capítulo certo');
  ok(/Mapa mental ainda não disponível/.test(cx.dirMapaCardHTML({ tema: 'T' }, 1)), '⚠️ capítulo sem mapa perdeu o aviso de "ainda não disponível"');
}

// ── 3. Abrir e fechar: o #mm-live vai para o <body> e volta para a ferramenta ──
{
  const casa = { id: 'casa' }, body = { id: 'body' };
  const live = { parentNode: casa, style: { display: 'none' } };
  body.appendChild = (x) => { x.parentNode = body; };
  casa.appendChild = (x) => { x.parentNode = casa; };
  const log = [];
  const c2 = { console, JSON, Array, String, Object, Math, Date, diretrizes: [{ id: 'c1', tema: 'T', sub: 'Diabetes', mapa }],
    document: { body, getElementById: (id) => (id === 'mm-live' ? live : null) },
    mmTelaCheia: (on) => log.push('tela:' + on), mmNovaAbertura: () => log.push('nova'),
    renderMMEditor: () => log.push('render'), setText: () => {}, canonSub: (s) => s };
  vm.createContext(c2);
  vm.runInContext([corpo('dirTemaOf'), corpo('normMMLeaf'), corpo('normalizeMMData'), corpo('dirMapaParaMM'),
    'var curMM=null,mmAdminEdit=false,__mmLiveHome=null,mmDoCapitulo=false;',
    corpo('restoreMMLive'), corpo('abrirMapaDoCapitulo'), corpo('fecharMapaDoCapitulo')].join('\n'), c2);
  c2.abrirMapaDoCapitulo(0);
  ok(live.parentNode === body, '🧨 o visualizador não saiu do painel de Mapas (escondido) — o mapa do capítulo não apareceria');
  ok(live.style.display === 'block' && log.join(',') === 'tela:true,nova,render',
    '🧨 o mapa do capítulo não abre como a ferramenta (tela cheia → abertura nova, só raiz e ramos → desenho): ' + log.join(','));
  ok(vm.runInContext('mmDoCapitulo&&curMM&&curMM.data.root', c2) === 'Diagnóstico e classificação', '🧨 o visualizador abriu sem o mapa do capítulo');
  c2.fecharMapaDoCapitulo();
  ok(live.parentNode === casa && live.style.display === 'none', '🧨 ao voltar, o visualizador não foi devolvido à ferramenta de Mapas Mentais');
  ok(vm.runInContext('!mmDoCapitulo&&curMM===null', c2), '⚠️ ao voltar, o mapa do capítulo continuou como mapa aberto');
}

// ── 4. Ligações: aba abre direto; × / ← Voltar, troca de painel e logout fecham ──
{
  const bind = corpo('bindDiretrizesView');
  ok(/if\(refFormat==='mapa'\)\{[^}]*abrirMapaDoCapitulo/.test(bind), '🧨 tocar na aba 🧠 Mapas mentais não abre mais o mapa direto');
  ok(/\[data-dir-abremapa\][^;]*abrirMapaDoCapitulo/.test(bind), '🧨 o cartão do mapa não abre o visualizador');
  const i = html.indexOf("getElementById('btn-mm-close').addEventListener('click',function(){");
  const fecha = html.slice(i, html.indexOf('});', i));
  ok(/if\(mmDoCapitulo\)\{fecharMapaDoCapitulo\(\);return;\}/.test(fecha) && fecha.indexOf('mmDoCapitulo') < fecha.indexOf('mmAdminEdit'),
    '🧨 o "← Voltar" do mapa do capítulo cai na lista da ferramenta em vez de voltar ao capítulo');
  ok(/fecharMapaDoCapitulo\(\)/.test(corpo('goPanel')), '🧨 trocar de painel com o mapa do capítulo aberto deixa a tela cheia por cima');
  ok(/fecharMapaDoCapitulo\(\)/.test(corpo('doLogout')), '⚠️ sair da conta com o mapa do capítulo aberto deixa o visualizador fora do lugar');
}

if (falhas.length) {
  console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - '));
  process.exit(1);
}
console.log('✓ mapa mental do capítulo: abre no visualizador da ferramenta (tela cheia, raiz e ramos, toque abre, Voltar devolve ao capítulo)');
