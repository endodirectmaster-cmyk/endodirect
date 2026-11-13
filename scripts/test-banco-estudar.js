#!/usr/bin/env node
// BANCO DE QUESTÕES: CONTAGEM NOS FILTROS E "ESTUDAR" EM TELA CHEIA, UMA POR VEZ (13/11/2026).
//
// Pedido do professor (print do Banco no iPhone): "quando clicar em um dos filtros, por exemplo,
// diabetes, automaticamente já mostra quantas questões existem no banco, sem precisar do botão
// buscar questões ... ao invés do botão buscar questões, trocar para estudar. E quando o aluno
// clicasse, e aparecer apenas uma questão na tela cheia. E à medida que ele fosse respondendo,
// ... ia passando para a próxima questão quando ele apertasse o botão avançar, próximo ou voltar."
//
// Conferido no Chromium (390×844): Diabetes → "▶ Estudar 5 questões"; abre em tela cheia em
// "Questão 1 de 5"; voltar a uma respondida mostra a marcação sem contar de novo; "Concluir ✓"
// fecha com o resumo; setas, Esc e troca de painel funcionam.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - voltar o "Buscar questões" / a lista de 3 por página;
//  - o botão deixar de dizer quantas questões entram (ou ficar ativo com zero);
//  - voltar a uma questão respondida e contar a resposta outra vez (desempenho inflado);
//  - o estudo ficar aberto cobrindo outro painel, ou por cima das janelas de sessão/login;
//  - "Tentar de novo" (ou a troca para degustação) abrir o estudo sozinho.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

ok('🧨 sem "Buscar questões"; o botão é "▶ Estudar"', !/Buscar questões<\/button>/.test(html) && /id="btn-filter-provas" disabled>▶ Estudar<\/button>/.test(html));
ok('🧨 a lista de 3 por página saiu (renderGenQ, GEN_PER_PAGE, Salvar todas)', !/function renderGenQ\(|GEN_PER_PAGE|btn-save-all-q|function saveAllQ\(/.test(html));
const upi = corpo('updateProvaInfo');
ok('a contagem muda a cada filtro (change → updateProvaInfo)', /\['q-inst','q-ano','q-parea','q-ptype'\]\.forEach\(function\(id\)\{var e=document\.getElementById\(id\);if\(e\)e\.addEventListener\('change',updateProvaInfo\);\}\);/.test(html));
ok('🧨 o botão diz quantas questões entram e fica desligado com zero ou carregando',
  /var podeN=\(!estado&&n>0\)\?n:0;bt\.disabled=!podeN;bt\.textContent=podeN\?\('▶ Estudar '\+podeN\+\(podeN===1\?' questão':' questões'\)\):'▶ Estudar';/.test(upi));
ok('🧨 Estudar abre a tela cheia (renderProvaResults → qzAbrir)', /qzAbrir\(\);/.test(corpo('renderProvaResults')) && /bancoEstadoHTML\(_est\)/.test(corpo('renderProvaResults')));

ok('🧨 tela de estudo: Voltar, Anterior, Próxima e o card num palco de deslize',
  /<div id="qz-tela" class="qz-tela" style="display:none" role="dialog" aria-modal="true"/.test(html)
  && /id="qz-sair"[^>]*>← Voltar<\/button>/.test(html) && /id="qz-ant">← Anterior<\/button>/.test(html)
  && /id="qz-prox">Próxima →<\/button>/.test(html) && /<div class="desl-palco"><div id="qz-card"><\/div><\/div>/.test(html));
const zq = +((html.match(/\.qz-tela\{position:fixed;inset:0;z-index:(\d+)/) || [, 'NaN'])[1]);
const zModal = +((html.match(/\.modal-bg\{[^}]*z-index:(\d+)/) || [, 'NaN'])[1]);
const zLogin = +((html.match(/#login-screen\{[^}]*z-index:(\d+)/) || [, 'NaN'])[1]);
ok('🧨 tela cheia abaixo da janela de sessão e do login (z ' + zq + ')', zq > 0 && zq < zModal && zq < zLogin);
ok('o card rola por dentro; a página por baixo não rola', /\.qz-corpo\{flex:1 1 auto;min-height:0;overflow-y:auto/.test(html) && /body\.qz-aberto\{overflow:hidden\}/.test(html));

const rnd = corpo('qzRender');
ok('🧨 "Questão x de n", Anterior desligado na 1ª, "✓ Finalizar" na última (e o Finalizar do lado some nela)',
  /setText\('qz-prog','Questão '\+\(qzIdx\+1\)\+' de '\+n\);/.test(rnd) && /ant\.disabled=qzIdx===0;/.test(rnd) && /prox\.textContent=qzIdx>=n-1\?'✓ Finalizar':'Próxima →';/.test(rnd)
  && /fin\.style\.display=qzIdx>=n-1\?'none':'';/.test(rnd));
ok('troca de questão desliza (mesma animação de Flashcards/Simulado)', /deslizar\(function\(\)\{return document\.getElementById\('qz-card'\);\},dir,/.test(rnd));
const vai = corpo('qzVai');
ok('🧨 não avança sozinho: só Próxima/Anterior; na última, Próxima mostra o resultado', /if\(passo>0&&qzIdx>=n-1\)\{qzFinalizar\(\);return;\}/.test(vai) && /if\(qzResultado\)return;/.test(vai));
ok('🧨 selectOpt guarda a letra respondida', /genAnswered\[parseInt\(idx\)\]=\{ok:ok,anulada:anulada,letra:letter\};/.test(corpo('selectOpt')));
const mr = corpo('marcaResposta');
ok('🧨 voltar a uma respondida remostra SEM registrar de novo (marcaResposta não conta)',
  /marcaResposta\(r\.letra,q\.answer\|\|'',q\.explanation\|\|'','gen',i,q\);/.test(corpo('qzRestaura')) && mr && !/feitaRegistrar|DB\.perf|genAnswered|studyEvent|persist\(/.test(mr));
ok('selectOpt continua registrando uma vez (feita + desempenho)', /if\(q\)\{try\{feitaRegistrar\(q,anulada\?null:ok,src,idx,anulada\?'anulada':''\);\}catch\(e\)\{\}\}/.test(corpo('selectOpt')) && /DB\.perf\[q\.area\]\.total\+\+/.test(corpo('selectOpt')));
ok('teclado: setas andam e Esc sai (fora de campos de texto)', /if\(e\.key==='ArrowRight'\)\{e\.preventDefault\(\);qzVai\(1\);\}/.test(html) && /else if\(e\.key==='Escape'\)\{e\.preventDefault\(\);qzFechar\(\);\}/.test(html) && /if\(tg==='TEXTAREA'\|\|tg==='INPUT'\)return;/.test(html));
ok('🧨 trocar de painel fecha o estudo', /if\(id!=='quest'\)try\{if\(qzAberto\(\)\)qzFechar\(\);\}catch\(e\)\{\}/.test(corpo('goPanel')));
ok('sair da conta fecha o estudo', /if\(qzAberto\(\)\)qzFechar\(\);/.test(corpo('doLogout')));
ok('🧨 "Tentar de novo" não abre o estudo sozinho', !/btn-filter-provas/.test(corpo('bancoTentarDeNovo')));

// Texto da questão justificado e comentário um pouco maior (professor, 13/11/2026, com print do Estudar).
const regraCss = (sel) => (html.match(new RegExp('\\n' + sel.replace(/[.]/g, '\\.') + '\\{([^}]*)\\}')) || [, ''])[1];
ok('🧨 enunciado, alternativas e comentário justificados', ['.q-stem', '.qo', '.q-fb'].every((c) => /text-align:justify/.test(regraCss(c)) && /text-align-last:left/.test(regraCss(c))));
const letraFb = parseFloat((regraCss('.q-fb').match(/font-size:([\d.]+)rem/) || [, '0'])[1]);
ok('🧨 letra do comentário maior que antes (.75rem) e igual à da Questão do Dia (veio ' + letraFb + 'rem)', letraFb > 0.75 && letraFb === parseFloat((regraCss('.qp-fb').match(/font-size:([\d.]+)rem/) || [, '0'])[1]));
ok('link da referência quebra dentro do comentário (não estoura a tela)', /overflow-wrap:anywhere/.test(regraCss('.q-fb')));

// No computador: coluna central, botões com largura própria logo abaixo da questão (professor,
// 13/11/2026, print no desktop: "os botões ... não precisam ocupar a tela inteira, assim como
// também a caixa da questão").
const desk = (html.match(/@media \(min-width:900px\)\{\n  \.qz-tela\{[\s\S]*?\n\}\n/) || [''])[0];
ok('🧨 no computador, topo, questão e botões numa coluna central (max-width)', /\.qz-topo,\.qz-corpo,\.qz-rodape\{width:100%;max-width:\d+px;margin-left:auto;margin-right:auto\}/.test(desk));
ok('🧨 no computador, os botões não esticam (largura própria, um em cada canto)', /\.qz-rodape \.btn\{flex:0 0 auto;/.test(desk) && /\.qz-rodape\{[^}]*justify-content:space-between/.test(desk));
ok('🧨 no computador, os botões vêm logo abaixo da questão e grudam no pé quando ela é comprida', /\.qz-corpo\{flex:0 0 auto;/.test(desk) && /\.qz-rodape\{position:sticky;bottom:0/.test(desk) && /\.qz-tela\{overflow-y:auto/.test(desk));
ok('trocar de questão no computador volta ao topo (a tela inteira rola)', /var tela=document\.getElementById\('qz-tela'\);if\(tela\)tela\.scrollTop=0;/.test(corpo('qzRender')));

// ── "Finalizar" e o resultado do estudo (professor, 13/11/2026: "ter um botão ao lado de próximo
// de finalizar ... o seu total de acertos, de erros, quais as áreas de adrenal ele errou mais e
// acertou"). O resumo, rodando com questões de verdade.
ok('🧨 botão "✓ Finalizar" entre Anterior e Próxima, desligado até a 1ª resposta',
  /id="qz-ant">← Anterior<\/button>\s*<button[^>]*class="btn btn-outline qz-nav qz-fin" id="qz-fin" disabled[^>]*>✓ Finalizar<\/button>\s*<button[^>]*id="qz-prox">Próxima →/.test(html)
  && /fin\.disabled=!Object\.keys\(genAnswered\)\.some/.test(corpo('updateGenCounter')));
ok('🧨 o Finalizar está ligado ao resultado', /getElementById\('qz-fin'\)\.addEventListener\('click',qzFinalizar\)/.test(html));
ok('🧨 o tema do resultado é o MESMO do Desempenho (temaDaQuestao nos dois)', /var _t=temaDaQuestao\(q\),sub=_t\.sub,tema=_t\.tema;/.test(corpo('studyEvent')) && /temaDaQuestao\(q\)/.test(corpo('qzResumo')));
{
  const ctx2 = { Object, Math, String, Array, parseInt,
    classifyTema: (t) => (/aldosteron|renina/.test(t) ? 'Hiperaldosteronismo' : /cushing|dexametason/.test(t) ? 'Cushing' : /feocromocit/.test(t) ? 'Feocromocitoma' : 'Geral') };
  vm.createContext(ctx2);
  vm.runInContext('var genQs=[],genAnswered={};' + ['esc', 'temaDaQuestao', 'qzResumo', 'qzResultadoHTML'].map(corpo).join('\n'), ctx2);
  vm.runInContext(`genQs=[
    {stem:'hiperaldosteronismo com renina baixa',area:'Adrenal'},{stem:'feocromocitoma',area:'Adrenal'},
    {stem:'aldosterona elevada',area:'Adrenal'},{stem:'cushing com dexametasona',area:'Adrenal'},
    {stem:'questão anulada',area:'Adrenal'},{stem:'feocromocitoma de novo',area:'Adrenal'},{stem:'sem resposta',area:'Adrenal'},
    {stem:'tireoide',area:'Tireoide',tema:'Nódulo'}];
    genAnswered={0:{ok:false},1:{ok:true},2:{ok:false},3:{ok:true},4:{ok:false,anulada:true},5:{ok:true},7:{ok:false}};`, ctx2);
  const r = JSON.parse(vm.runInContext('JSON.stringify(qzResumo())', ctx2));
  ok('🧨 resultado: 3 acertos, 3 erros, 50%, anulada fora da conta, 1 sem resposta (veio ' + [r.ac, r.er, r.pct, r.anuladas, r.naoResp].join('/') + ')',
    r.ac === 3 && r.er === 3 && r.pct === 50 && r.anuladas === 1 && r.naoResp === 1 && r.respondidas === 6);
  ok('🧨 por tema, do que mais errou para o que mais acertou (Hiperaldosteronismo primeiro)', r.temas[0].tema === 'Hiperaldosteronismo' && r.temas[0].er === 2 && r.temas[r.temas.length - 1].ac === 2);
  ok('por subespecialidade quando o estudo mistura áreas', r.subs.length === 2);
  ok('🧨 lista das erradas, em ordem (questões 1, 3 e 8)', JSON.stringify(r.erradas) === '[0,2,7]');
  const h = vm.runInContext('qzResultadoHTML(qzResumo())', ctx2);
  ok('🧨 a tela mostra acertos, erros e aproveitamento', />3<\/b><span>Acertos/.test(h) && />3<\/b><span>Erros/.test(h) && />50%<\/b><span>Aproveitamento/.test(h));
  ok('🧨 a tela diz onde mais errou e onde mais acertou', /Onde mais errou: <b>Hiperaldosteronismo/.test(h) && /Onde mais acertou: <b>Feocromocitoma/.test(h));
  ok('a tela leva de volta a cada questão errada', (h.match(/data-qz-ir="\d+"/g) || []).length === 3 && /data-qz-ir="7">Questão 8</.test(h));
  ok('a tela avisa que já entrou no Desempenho e no Caderno de erros', /Desempenho, no Dashboard, e as que você errou foram para o Caderno de erros/.test(h));
}
ok('no resultado: Anterior/Finalizar/Próxima somem e aparecem "← Questões" e "Encerrar"',
  /\.qz-tela\.qz-modo-resultado \.qz-rodape \.qz-nav\{display:none\}/.test(html) && /\.qz-tela\.qz-modo-resultado \.qz-rodape \.qz-res-bt\{display:inline-flex\}/.test(html)
  && /getElementById\('qz-encerrar'\)\.addEventListener\('click',qzFechar\)/.test(html));
ok('no resultado as setas não andam; Esc sai', /if\(qzResultado\)\{if\(e\.key==='Escape'\)\{e\.preventDefault\(\);qzFechar\(\);\}return;\}/.test(html));
ok('🧨 sair ou abrir de novo tira o modo resultado', /qzModoResultado\(false\);/.test(corpo('qzFechar')) && /qzModoResultado\(false\);/.test(corpo('qzAbrir')));

if (bad) { console.log('✗ Banco — Estudar: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Banco — Estudar: contagem nos filtros, uma questão por vez em tela cheia, Anterior/Próxima, sem contar duas vezes');
