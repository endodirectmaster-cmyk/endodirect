// ARTIGO é conteúdo só de Resumos — nunca da aba Diretrizes.
//
// O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR (2026-08-01, "esses resumos artigos
// não é para aparecerem nas diretrizes. Apenas nos resumos dos artigos"):
// o card do artigo no painel trazia o botão "📢 Publicar", cujo texto de
// confirmação era "Ele passará a aparecer nas Diretrizes". Um clique punha a
// leitura crítica de um trial no meio das recomendações de sociedade — dois
// tipos de conteúdo que não se misturam — e para TODO MUNDO, porque publicar
// tira o `privado` e as RPCs entregam `diretrizes` por esse campo.
//
// São DUAS camadas, de propósito, e é o mesmo padrão do RESUMOS_ONLY_SUBS:
//  1. o botão não existe mais para artigo — o estado errado não é alcançável;
//  2. `dirSoNosResumos()` filtra artigo da aba Diretrizes nos QUATRO filtros
//     (aluno e professor, com e sem filtro de tipo) — para o caso de algum
//     artigo já estar público por edição antiga ou por outro admin.
// Só a camada 1 deixaria o dado ruim passar; só a 2 deixaria o botão mentindo.
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

const ctx = { String, Boolean };
vm.createContext(ctx);
vm.runInContext([
  extrai('dirTipoOf'), extrai('dirIsRascunho'), extrai('dirIsPrivate'),
  extrai('dirSoNosResumos'), extrai('dirIsVisible'), extrai('dirIsVisibleAnyTipo'),
  extrai('dirModeMatch'), extrai('dirModeMatchAnyTipo')
].join('\n'), ctx);
['dirSoNosResumos', 'dirIsVisible', 'dirIsVisibleAnyTipo', 'dirModeMatch', 'dirModeMatchAnyTipo']
  .forEach((f) => ok(f + ' foi extraída', typeof ctx[f] === 'function'));

const artigoPublico   = { tipo: 'artigo',   privado: false };
const artigoPrivado   = { tipo: 'artigo',   privado: true  };
const capituloPublico = { tipo: 'capitulo', privado: false };
const capituloPrivado = { tipo: 'capitulo', privado: true  };
const artigoRascunho  = { tipo: 'artigo',   privado: true, rascunho: true };

// ---- 1. a regra em si -------------------------------------------------------
{
  ok('artigo é conteúdo só de Resumos', ctx.dirSoNosResumos(artigoPublico) === true);
  ok('capítulo NÃO é', ctx.dirSoNosResumos(capituloPublico) === false);
  ok('item sem tipo conta como capítulo', ctx.dirSoNosResumos({}) === false);
}

// ---- 2. ⚠️ ABA DIRETRIZES DO ALUNO: artigo nunca aparece --------------------
{
  ctx.refPrivadoMode = false;            // false = aba Diretrizes
  ok('artigo público NÃO aparece nas Diretrizes', ctx.dirIsVisible(artigoPublico) === false,
     'é a leitura crítica de um trial no meio das recomendações de sociedade');
  ok('capítulo público APARECE nas Diretrizes', ctx.dirIsVisible(capituloPublico) === true);
  ok('artigo privado também não (já não apareceria)', ctx.dirIsVisible(artigoPrivado) === false);
  // A grade de subespecialidades conta pelo AnyTipo — se ela contar o artigo,
  // o card da sub aparece com número que a lista de dentro não mostra.
  ok('a grade (AnyTipo) também não conta artigo em Diretrizes',
     ctx.dirIsVisibleAnyTipo(artigoPublico) === false);
  ok('a grade conta capítulo em Diretrizes', ctx.dirIsVisibleAnyTipo(capituloPublico) === true);
}

// ---- 3. e continua aparecendo em RESUMOS ------------------------------------
{
  ctx.refPrivadoMode = true;             // true = aba Resumos
  ctx.refTipoSel = 'artigo';
  ok('artigo privado APARECE em Resumos › Artigos', ctx.dirIsVisible(artigoPrivado) === true,
     'o recorte que o professor quer');
  ok('rascunho continua invisível para o aluno', ctx.dirIsVisible(artigoRascunho) === false);
  ctx.refTipoSel = 'capitulo';
  ok('em Resumos › Capítulos o artigo não entra', ctx.dirIsVisible(artigoPrivado) === false);
  ok('capítulo privado aparece em Resumos › Capítulos', ctx.dirIsVisible(capituloPrivado) === true);
  ok('a grade de Resumos conta os dois tipos juntos',
     ctx.dirIsVisibleAnyTipo(artigoPrivado) === true && ctx.dirIsVisibleAnyTipo(capituloPrivado) === true);
}

// ---- 4. mesma regra no painel do PROFESSOR ---------------------------------
// Se o professor visse nas Diretrizes um artigo que o aluno não vê, a tela dele
// deixaria de descrever o que está no ar — e é a tela onde ele decide.
{
  ctx.admRefMode = 'dir';
  ok('professor não vê artigo público nas Diretrizes', ctx.dirModeMatch(artigoPublico) === false);
  ok('professor vê capítulo público nas Diretrizes', ctx.dirModeMatch(capituloPublico) === true);
  ok('grade do professor (AnyTipo) idem', ctx.dirModeMatchAnyTipo(artigoPublico) === false
     && ctx.dirModeMatchAnyTipo(capituloPublico) === true);
  ctx.admRefMode = 'res'; ctx.admRefTipo = 'artigo';
  ok('e vê o artigo em Resumos › Artigos', ctx.dirModeMatch(artigoPrivado) === true);
}

// ---- 5. ⚠️ O BOTÃO QUE CRIAVA O ESTADO NÃO EXISTE PARA ARTIGO --------------
{
  const i = semComentarios.indexOf('var toggleBtn=rasc');
  ok('o bloco do botão existe', i > 0);
  const bloco = semComentarios.slice(i, i + 700);
  ok('"📢 Publicar" é condicionado a NÃO ser artigo', /priv\s*&&\s*!dirSoNosResumos\(x\.d\)/.test(bloco),
     bloco.slice(0, 260));
  ok('"👁 Liberar" continua para rascunho de qualquer tipo', /data-adm-refliberar/.test(bloco));
  // A confirmação do botão promete Diretrizes; se ela aparecer para artigo, mente.
  ok('o texto que promete Diretrizes segue existindo só no toggle de privado',
     /passará a aparecer nas Diretrizes/.test(SRC));
}

if (bad) { console.error('\n' + bad + ' verificação(ões) de "artigo só nos Resumos" falharam.'); process.exit(1); }
console.log('Artigo é conteúdo só de Resumos: OK');
