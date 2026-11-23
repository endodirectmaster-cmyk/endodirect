// Pendências com lugar marcado na fila (23/11/2026).
//
// O lote "Temas de revisão" (40 Questões do Dia) foi distribuído aos professores pela aba
// Pendências, mas planejado INTERCALADO com a fila: uma que já estava, uma nova. Antes, aprovar
// uma pendência fazia `igStories.push`, isto é, a questão ia para o FIM da fila (fevereiro) e o
// plano se perdia sem erro nenhum. Agora a pendência traz filaAntes/filaApos e `igPosAprovada`
// devolve o ponto de entrada. Este teste roda a função de verdade, tirada do index.html.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

function corpo(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return null;
  let d = 0, j = SRC.indexOf('{', i);
  for (let k = j; k < SRC.length; k++) {
    if (SRC[k] === '{') d++;
    else if (SRC[k] === '}') { d--; if (d === 0) return SRC.slice(i, k + 1); }
  }
  return null;
}
const fPos = corpo('igPosAprovada');
const fNota = corpo('pendAlertNotaHTML');
const fApr = corpo('pendApprove');
ok('igPosAprovada existe', !!fPos);
ok('pendAlertNotaHTML existe', !!fNota);
ok('pendApprove existe', !!fApr);
if (!fPos || !fNota || !fApr) { console.error('\nfunções não encontradas'); process.exit(1); }

// pendApprove usa o lugar marcado, e não push no fim
ok('pendApprove insere com igPosAprovada', /igStories\.splice\(igPosAprovada\(it\),0,/.test(fApr), 'voltou a ir para o fim da fila?');
ok('pendApprove não faz mais igStories.push', !/igStories\.push\(/.test(fApr));

const ctx = { esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) };
vm.createContext(ctx);
vm.runInContext('var igStories=[];' + fPos + fNota, ctx);
const P = (id) => ({ id, status: 'posted' });
const Q = (id) => ({ id, status: 'queued' });
const pos = (fila, it) => { ctx.igStories = fila; return vm.runInContext('igPosAprovada(' + JSON.stringify(it) + ')', ctx); };

// fila: p1 p2 | e1 e2 e3
const base = () => [P('p1'), P('p2'), Q('e1'), Q('e2'), Q('e3')];
ok('sem lugar marcado: fim da fila', pos(base(), { id: 'x' }) === 5);
ok('antes de filaAntes quando ela ainda espera', pos(base(), { filaApos: 'e1', filaAntes: 'e2' }) === 3);
ok('filaAntes já saiu: logo depois de filaApos', pos([P('p1'), P('e1'), Q('e2'), Q('e3')], { filaApos: 'e2', filaAntes: 'e1' }) === 3);
ok('só filaApos: logo depois dela', pos(base(), { filaApos: 'e3' }) === 5);
ok('as duas já saíram: começo da fila, depois das postadas', pos([P('p1'), P('e1'), P('e2'), Q('e3')], { filaApos: 'e1', filaAntes: 'e2' }) === 3);
ok('ids que sumiram: começo da fila', pos(base(), { filaApos: 'zz', filaAntes: 'yy' }) === 2);
ok('fila vazia e atrasada: fim', pos([P('p1')], { filaApos: 'e1', filaAntes: 'e2' }) === 1);
// duas aprovadas seguidas do mesmo trecho mantêm a ordem: e1 N1 e2 N2 e3
{
  const f = base();
  ctx.igStories = f;
  f.splice(pos(f, { filaApos: 'e2', filaAntes: 'e3' }), 0, Q('N2'));
  f.splice(pos(f, { filaApos: 'e1', filaAntes: 'e2' }), 0, Q('N1'));
  ok('intercala na ordem planejada', f.map((x) => x.id).join(' ') === 'p1 p2 e1 N1 e2 N2 e3', f.map((x) => x.id).join(' '));
}

// aviso ao entrar
ctx.lista = [{ lote: 'Temas de revisão', distributedAt: Date.UTC(2026, 10, 23, 15) }, { lote: 'Temas de revisão', distributedAt: Date.UTC(2026, 10, 23, 15) }, { sub: 'x' }];
const nota = vm.runInContext('pendAlertNotaHTML(lista)', ctx);
ok('aviso cita o lote e a quantidade', /<b>2<\/b> do lote <b>Temas de revisão<\/b>/.test(nota), nota);
ok('aviso diz que entram no dia planejado', /dia planejado/.test(nota));
ok('sem lote, aviso sem nota extra', vm.runInContext('pendAlertNotaHTML([{sub:"x"}])', ctx) === '');
ok('modal tem o lugar da nota', /id="pend-alert-nota"/.test(SRC));
ok('cartão da pendência mostra o lote', /it\.lote\?' <span class="tag">'\+esc\(it\.lote\)/.test(SRC));

if (bad) { console.error('\n' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ pendências com lugar marcado na fila: entram no dia planejado, aviso cita o lote');
