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
ok('🧨 "Questão x de n", Anterior desligado na 1ª, "Concluir ✓" na última',
  /setText\('qz-prog','Questão '\+\(qzIdx\+1\)\+' de '\+n\);/.test(rnd) && /ant\.disabled=qzIdx===0;/.test(rnd) && /prox\.textContent=qzIdx>=n-1\?'Concluir ✓':'Próxima →';/.test(rnd));
ok('troca de questão desliza (mesma animação de Flashcards/Simulado)', /deslizar\(function\(\)\{return document\.getElementById\('qz-card'\);\},dir,/.test(rnd));
const vai = corpo('qzVai');
ok('🧨 não avança sozinho: só Próxima/Anterior; no fim fecha com o resumo', /if\(passo>0&&qzIdx>=n-1\)\{/.test(vai) && /qzFechar\(\);/.test(vai) && /Fim! Você respondeu/.test(vai));
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

if (bad) { console.log('✗ Banco — Estudar: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Banco — Estudar: contagem nos filtros, uma questão por vez em tela cheia, Anterior/Próxima, sem contar duas vezes');
