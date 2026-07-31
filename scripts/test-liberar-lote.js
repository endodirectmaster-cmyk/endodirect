// "Liberar todos os rascunhos" — liberação em lote nos Resumos do professor.
//
// POR QUE EXISTE (31/07): eram 43 artigos em rascunho e um clique POR ITEM. Com
// esse custo, a liberação simplesmente não acontecia — a pendência "Liberar em
// lote" estava aberta desde 25/07.
//
// ⚠️ E POR QUE TEM DE SER PELO CLIENTE, não por SQL: em 31/07 eu liberei os 43
// por UPDATE direto no `payload` e a gravação foi DESFEITA DUAS VEZES, em
// segundos, por uma aba do app que ainda tinha o payload antigo em memória — o
// cliente grava os 8,5 MB inteiros e atropela qualquer escrita externa. A única
// liberação que sobrevive é a que passa pelo `persistDiretrizes()`.
//
// OS DOIS DEFEITOS QUE ESTE TESTE PEGA:
//  1. o lote alcançar item FORA do recorte que a grade mostra (outra
//     subespecialidade, outro modo, outro tipo) — o professor publicaria sem
//     saber o quê;
//  2. gravar DENTRO do laço: com payload de 8,5 MB, N itens virariam N uploads
//     inteiros do estado global.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const semComentarios = SRC.replace(/^\s*\/\/.*$/gm, '');

function extrai(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let nivel = 0;
  for (let k = SRC.indexOf('{', i); k < SRC.length; k++) {
    if (SRC[k] === '{') nivel++;
    else if (SRC[k] === '}') { nivel--; if (!nivel) return SRC.slice(i, k + 1); }
  }
  return '';
}

// ---- 1. ⚠️ O RECORTE: o lote não alcança o que a grade não mostra ----------
{
  const ctx = { String, Boolean };
  vm.createContext(ctx);
  vm.runInContext([
    extrai('dirIsPrivate') || 'function dirIsPrivate(d){return !!(d&&d.privado);}',
    extrai('dirTipoOf')    || "function dirTipoOf(d){return (d&&d.tipo)||'capitulo';}",
    extrai('dirIsRascunho'),
    extrai('dirModeMatch'),
    extrai('_admRascunhosDaSub')
  ].join('\n'), ctx);
  ok('dirIsRascunho foi extraída', /function dirIsRascunho/.test(extrai('dirIsRascunho')));
  ok('_admRascunhosDaSub foi extraída', /function _admRascunhosDaSub/.test(extrai('_admRascunhosDaSub')));

  ctx.admRefMode = 'res';
  ctx.admRefTipo = 'artigo';
  ctx.diretrizes = [
    { sub: 'Diabetes',   tipo: 'artigo',   privado: true, rascunho: true,  tema: 'alvo-1' },
    { sub: 'Diabetes',   tipo: 'artigo',   privado: true, rascunho: true,  tema: 'alvo-2' },
    { sub: 'Diabetes',   tipo: 'artigo',   privado: true,                  tema: 'ja-liberado' },
    { sub: 'Diabetes',   tipo: 'capitulo', privado: true, rascunho: true,  tema: 'outro-TIPO' },
    { sub: 'Obesidade',  tipo: 'artigo',   privado: true, rascunho: true,  tema: 'outra-SUB' },
    { sub: 'Diabetes',   tipo: 'artigo',   privado: false, rascunho: true, tema: 'outro-MODO' }
  ];
  const nomes = ctx._admRascunhosDaSub('Diabetes').map((x) => x.d.tema);
  ok('pega os rascunhos da sub/modo/tipo abertos', nomes.indexOf('alvo-1') >= 0 && nomes.indexOf('alvo-2') >= 0, nomes.join(','));
  ok('NÃO pega o que já foi liberado', nomes.indexOf('ja-liberado') < 0, nomes.join(','));
  ok('NÃO pega outro TIPO (capítulo × artigo)', nomes.indexOf('outro-TIPO') < 0, nomes.join(','));
  ok('NÃO pega outra SUBESPECIALIDADE', nomes.indexOf('outra-SUB') < 0, nomes.join(','));
  ok('NÃO pega outro MODO (Diretrizes × Resumos)', nomes.indexOf('outro-MODO') < 0, nomes.join(','));
  ok('são exatamente 2', nomes.length === 2, nomes.join(','));
  // Trocar o tipo aberto muda o recorte — é o que a grade faz.
  ctx.admRefTipo = 'capitulo';
  const cap = ctx._admRascunhosDaSub('Diabetes').map((x) => x.d.tema);
  ok('ao abrir Capítulos, o lote passa a ser o de capítulos', cap.length === 1 && cap[0] === 'outro-TIPO', cap.join(','));
  ok('sub sem rascunho devolve vazio', ctx._admRascunhosDaSub('Tireoide').length === 0);
}

// ---- 2. ⚠️ UMA GRAVAÇÃO SÓ, FORA DO LAÇO -----------------------------------
{
  const i = semComentarios.indexOf("getElementById('btn-ref-liberar-lote')");
  ok('o handler do lote existe', i > 0);
  const bloco = semComentarios.slice(i, i + 1400);
  ok('apaga o rascunho de cada item', /alvo\.forEach\(function\(x\)\{delete x\.d\.rascunho;\}\)/.test(bloco), bloco.slice(0, 200));
  ok('grava UMA vez, depois do laço', /\}\);\s*persistDiretrizes\(\)/.test(bloco),
     'payload de 8,5 MB: gravar dentro do laço seria N uploads inteiros');
  ok('não grava dentro do laço',
     !/forEach\([^)]*\{[^}]*persistDiretrizes\(\)/.test(bloco));
  ok('confirma antes (publicar é irreversível pelo aluno)', /confirm\(/.test(bloco));
  ok('a confirmação diz QUANTOS e QUAIS', /alvo\.length\+' rascunho/.test(bloco) && /nomes/.test(bloco));
  ok('redesenha depois', /rerenderRef\(\)/.test(bloco));
  ok('avisa o resultado', /notify\(alvo\.length\+/.test(bloco));
}

// ---- 3. o botão só aparece quando há rascunho -------------------------------
{
  ok('o botão é montado a partir da contagem real',
     /var _rasc=_admRascunhosDaSub\(admRefSub\);/.test(semComentarios));
  ok('sem rascunho, sem botão', /_rasc\.length\s*\?[\s\S]{0,400}:\s*''/.test(semComentarios));
  ok('o rótulo traz a contagem', /Liberar todos os rascunhos \('\+_rasc\.length\+'\)/.test(SRC));
  ok('o botão entra no corpo da grade', /\+_btnLote\b/.test(semComentarios));
}

if (bad) { console.error('\n' + bad + ' verificação(ões) da liberação em lote falharam.'); process.exit(1); }
console.log('Liberar em lote: OK');
