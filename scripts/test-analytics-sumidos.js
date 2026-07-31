// Card "assinantes sem acesso há 14+ dias" no Analytics.
//
// O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR é a escolha do campo de data.
// `auth.users.last_sign_in_at` só muda quando a pessoa faz um sign-in NOVO, e a
// sessão do Supabase neste app é persistente: quem entra todo dia pode ter o
// último sign-in de dois meses atrás. Uma lista de "sumidos" montada sobre esse
// campo apontaria justamente os alunos ATIVOS — e o recurso existe para o
// professor MANDAR MENSAGEM para os nomes da lista. Errar aqui não é um número
// torto na tela: é o professor cobrando engajamento de quem não sumiu.
//
// O segundo defeito: misturar cortesia e degustação com pagante. Cortesia não
// paga (não se cobra engajamento de quem ganhou) e degustação sumir é o
// esperado, não uma perda. Só assinante pagante gera ação.
//
// Contexto que dá sentido ao card (28/07): quase todo mundo pagou ANUAL
// ADIANTADO, então churn só apareceria em junho/2027. Uso é o único sinal.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const semComentarios = SRC.replace(/^\s*\/\/.*$/gm, '');

// Extrai as funções puras do index.html e roda de verdade — asserção sobre
// comportamento, não sobre a presença de um texto na fonte.
function extrai(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  // Conta chaves a partir do primeiro '{' da assinatura.
  let j = SRC.indexOf('{', i), nivel = 0;
  for (let k = j; k < SRC.length; k++) {
    if (SRC[k] === '{') nivel++;
    else if (SRC[k] === '}') { nivel--; if (!nivel) return SRC.slice(i, k + 1); }
  }
  return '';
}

const ctx = { Date, Number, Math, Array, isNaN, console };
const decl = (SRC.match(/var ADM_SUMIDO_DIAS = \d+;/) || [''])[0];
ok('ADM_SUMIDO_DIAS é declarado', !!decl, 'a janela do card precisa de nome, não de literal solto');
const codigo = [decl, extrai('admDiasSemUso'), extrai('admConvIsPaying'), extrai('admSumidosLista')].join('\n');
ok('admDiasSemUso existe', codigo.indexOf('function admDiasSemUso') >= 0);
ok('admSumidosLista existe', codigo.indexOf('function admSumidosLista') >= 0);
vm.createContext(ctx);
vm.runInContext(codigo, ctx);

const DIA = 864e5;
const atras = (d) => new Date(Date.now() - d * DIA).toISOString();
const aluno = (o) => Object.assign({ name: 'X', email: 'x@y.z', plano: 'Gold' }, o);

// ---- 1. ⚠️ O CAMPO DE DATA: ultimo_uso manda, sign-in é só reserva ----------
{
  const dias = (e) => ctx.admDiasSemUso(e);
  ok('usa ultimo_uso quando existe',
     dias(aluno({ ultimo_uso: atras(3), last_sign_in_at: atras(90) })) === 3,
     'sessão longa: o sign-in de 90 dias não pode vencer o uso de 3');
  ok('cai no last_seen se não vier ultimo_uso',
     dias(aluno({ last_seen: atras(5), last_sign_in_at: atras(90) })) === 5);
  ok('só usa last_sign_in_at quando não há mais nada',
     dias(aluno({ last_sign_in_at: atras(7) })) === 7);
  ok('sem data nenhuma devolve null (nunca acessou)', dias(aluno({})) === null);
  ok('data inválida não vira NaN de dias', dias(aluno({ ultimo_uso: 'nao-e-data' })) === null);
}

// ---- 2. ⚠️ SÓ PAGANTE ENTRA NA LISTA ---------------------------------------
{
  ctx.admEstData = { students: [
    aluno({ name: 'Pagante sumido', plano: 'Gold', ultimo_uso: atras(40) }),
    aluno({ name: 'Pagante ativo', plano: 'Standard', ultimo_uso: atras(2) }),
    aluno({ name: 'Cortesia sumida', plano: 'Cortesia', cortesia: true, ultimo_uso: atras(60) }),
    aluno({ name: 'Degustação sumida', plano: 'Degustação', ultimo_uso: atras(60) })
  ] };
  const nomes = ctx.admSumidosLista().map((x) => x.e.name);
  ok('assinante parado entra', nomes.indexOf('Pagante sumido') >= 0, nomes.join(', '));
  ok('assinante ativo NÃO entra', nomes.indexOf('Pagante ativo') < 0, nomes.join(', '));
  ok('CORTESIA não entra (não paga, não se cobra engajamento)', nomes.indexOf('Cortesia sumida') < 0, nomes.join(', '));
  ok('DEGUSTAÇÃO não entra (sumir é o esperado, não é perda)', nomes.indexOf('Degustação sumida') < 0, nomes.join(', '));
  ok('a lista tem exatamente 1', nomes.length === 1, nomes.join(', '));
}

// ---- 3. a fronteira dos 14 dias e a ordenação -------------------------------
{
  ctx.admEstData = { students: [
    aluno({ name: 'D13', ultimo_uso: atras(13) }),
    aluno({ name: 'D14', ultimo_uso: atras(14) }),
    aluno({ name: 'D45', ultimo_uso: atras(45) }),
    aluno({ name: 'Nunca' })
  ] };
  const nomes = ctx.admSumidosLista().map((x) => x.e.name);
  ok('13 dias fica de fora, 14 entra', nomes.indexOf('D13') < 0 && nomes.indexOf('D14') >= 0, nomes.join(', '));
  ok('quem nunca acessou vem PRIMEIRO', nomes[0] === 'Nunca', nomes.join(', '));
  ok('depois, a ausência mais longa primeiro', nomes[1] === 'D45' && nomes[2] === 'D14', nomes.join(', '));
  ok('lista vazia não quebra', (ctx.admEstData = { students: [] }, ctx.admSumidosLista().length === 0));
  ok('sem dados carregados não quebra', (ctx.admEstData = null, ctx.admSumidosLista().length === 0));
}

// ---- 4. a ligação na tela ---------------------------------------------------
{
  ok('o card é montado por admSumidosCardHTML', /function admSumidosCardHTML\(\)\{/.test(semComentarios));
  ok('o Analytics renderiza o card', /html\+=admSumidosCardHTML\(\);/.test(semComentarios));
  const iSum = semComentarios.indexOf('html+=admSumidosCardHTML();');
  const iConv = semComentarios.indexOf('html+=admConversionCardHTML();');
  ok('vem ANTES do card de conversão', iSum > 0 && iConv > 0 && iSum < iConv,
     'é o único indicador da tela que gera ação no mesmo dia');
  // O card lê a mesma lista da aba Estudantes; se essa carga parar de avisar o
  // Analytics, o card fica preso no "Carregando…" para sempre.
  ok('a carga de alunos redesenha o Analytics',
     /admCurrentSec==='estudantes'\|\|admCurrentSec==='analytics'/.test(semComentarios));
  ok('o card mostra os NOMES (é o que gera a ação)', /adm-table-head.*Estudante/.test(SRC));
  ok('e diz há quanto tempo cada um sumiu', /Sem acessar/.test(SRC));
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do card de sumidos falharam.'); process.exit(1); }
console.log('Card "sem acesso há 14+ dias": OK');
