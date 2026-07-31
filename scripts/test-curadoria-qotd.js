// Curadoria distribuída da Questão do Dia: toda subespecialidade tem UM dono.
//
// O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR (31/07/2026): "Endocrinologia
// Básica" estava em `DIR_SUBS` e no seletor do gerador de lote, mas em NENHUM
// `subs` de `QOTD_CURATORS`. Uma questão gerada com esse rótulo era distribuída
// para "(sem responsável)": não entrava na aba Pendências de nenhum professor e
// não aparecia em `qotdMyPending()` de ninguém. Sumia sem erro e sem log — o
// mesmo padrão de falha silenciosa que já custou caro neste projeto duas vezes.
//
// O defeito espelho, igualmente silencioso: a mesma sub em DOIS curadores faria
// a questão aparecer para os dois, e o `qotdCuratorForSub` (que devolve o
// PRIMEIRO que casar) esconderia o segundo.
//
// O terceiro: item solto no seletor. A opção "Transgeneridade" estava pendurada
// depois do `DIR_SUBS.map(...)`, e como DIR_SUBS já a continha, a subespecialidade
// aparecia duas vezes na lista.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const semComentarios = SRC.replace(/^\s*\/\/.*$/gm, '');

// Lê as duas estruturas da fonte real e as avalia.
const mDir = semComentarios.match(/var DIR_SUBS=(\[[^\]]*\]);/);
const mCur = semComentarios.match(/var QOTD_CURATORS=(\[[\s\S]*?\n\]);/);
ok('DIR_SUBS foi encontrado', !!mDir);
ok('QOTD_CURATORS foi encontrado', !!mCur);
if (!mDir || !mCur) { console.error('\nnão consegui ler as estruturas'); process.exit(1); }

const ctx = {};
vm.createContext(ctx);
vm.runInContext('var DIR_SUBS=' + mDir[1] + '; var QOTD_CURATORS=' + mCur[1] + ';', ctx);
const SUBS = ctx.DIR_SUBS;
const CUR = ctx.QOTD_CURATORS;

// ---- 1. ⚠️ NENHUMA SUBESPECIALIDADE ÓRFÃ -----------------------------------
{
  const donos = {};
  CUR.forEach((c) => c.subs.forEach((s) => { (donos[s] = donos[s] || []).push(c.nome); }));
  const orfas = SUBS.filter((s) => !donos[s]);
  ok('toda subespecialidade de DIR_SUBS tem curador', orfas.length === 0,
     orfas.length ? 'sem dono: ' + orfas.join(', ') + ' — questão desta sub cai em "(sem responsável)" e não entra na fila de ninguém' : '');

  // ---- 2. ⚠️ E NENHUMA COM DOIS DONOS --------------------------------------
  const duplas = Object.keys(donos).filter((s) => donos[s].length > 1);
  ok('nenhuma subespecialidade tem dois curadores', duplas.length === 0,
     duplas.map((s) => s + ' → ' + donos[s].join(' e ')).join('; ') + ' (qotdCuratorForSub devolve só o primeiro)');

  // ---- 3. curador não pode apontar para sub que não existe ------------------
  const fantasmas = Object.keys(donos).filter((s) => SUBS.indexOf(s) < 0);
  ok('nenhum curador aponta para sub fora de DIR_SUBS', fantasmas.length === 0,
     fantasmas.join(', ') + ' — sub renomeada em DIR_SUBS e esquecida aqui deixa o curador sem receber nada');
}

// ---- 4. o pedido de 31/07: Endocrinologia Básica é do Rodolpho -------------
{
  const rod = CUR.filter((c) => c.nome === 'Rodolpho')[0];
  ok('Rodolpho existe na lista de curadores', !!rod);
  ok('Endocrinologia Básica é do Rodolpho', !!rod && rod.subs.indexOf('Endocrinologia Básica') >= 0,
     rod ? rod.subs.join(', ') : '');
}

// ---- 5. ⚠️ O SELETOR DO GERADOR SAI SÓ DE DIR_SUBS -------------------------
// Item solto acrescentado depois do map foi exatamente como "Transgeneridade"
// passou a aparecer duas vezes na lista.
{
  // ⚠️ Captura até o FIM DA LINHA, não até o primeiro `;`: o `.map(function(s){
  // return …; })` tem ponto-e-vírgula DENTRO, e um `[^;]+` corta a expressão
  // antes do `.join('')` — foi assim que a primeira versão deste teste passou
  // com o duplicado reintroduzido. Asserção que não alcança o trecho que julga
  // é pior que teste nenhum: dá veredito verde sobre o que nem leu.
  const m = semComentarios.match(/^\s*var loteSubs=(.*)$/m);
  ok('o seletor de lote foi encontrado', !!m);
  const expr = m ? m[1] : '';
  ok('as opções saem de DIR_SUBS', /DIR_SUBS\.map\(/.test(expr));
  ok('não há option solto depois do map', !/\.join\(''\)\s*\+\s*'<option>/.test(expr),
     'DIR_SUBS já contém todas as subs; option extra vira duplicata no seletor');
  ok('Transgeneridade não aparece solta no seletor', expr.indexOf('<option>Transgeneridade</option>') < 0, expr.slice(0, 200));
  // e a taxonomia em si não pode ter repetição
  const vistos = {}, rep = SUBS.filter((s) => (vistos[s] ? true : (vistos[s] = 1, false)));
  ok('DIR_SUBS não tem subespecialidade repetida', rep.length === 0, rep.join(', '));
}

if (bad) { console.error('\n' + bad + ' verificação(ões) da curadoria da Questão do Dia falharam.'); process.exit(1); }
console.log('Curadoria da Questão do Dia: OK — ' + SUBS.length + ' subs, ' + CUR.length + ' curadores, nenhuma órfã');
