// Favoritos: chave estável por tipo, alternância e presença da estrela nos 5 cards.
//
// O defeito que este teste existe para pegar: a chave. Nem todo item tem id
// confiável — artigo do radar tem `sourceId`, aviso escrito à mão não tem;
// resumo às vezes só tem sub+tema; questão do banco tem `code`, a gerada por IA
// nem sempre. Se `favKey` devolvesse vazio para algum desses, a estrela sumiria
// silenciosamente daquele card e ninguém notaria até um aluno reclamar.
//
// O segundo defeito: dois tipos diferentes com a MESMA chave. Como a lista é
// única, um mapa e um flashcard com o mesmo texto se cancelariam.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

function trecho(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) { console.log('  ✗ não achei function ' + nome); bad++; return ''; }
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j < 0 ? undefined : j);
}
const ctx = {
  console, DB: { favs: [] },
  lsSet: () => {}, queueRemoteStateSave: () => {}, notify: () => {},
  document: { getElementById: () => null, addEventListener: () => {} }
};
vm.createContext(ctx);
vm.runInContext([
  trecho('esc'),
  trecho('favKey'), trecho('favLabel'), trecho('favSub'), trecho('favList'),
  trecho('favIdx'), trecho('favHas'), trecho('favToggle'), trecho('favStarHTML')
].join('\n'), ctx);

// ---- 1. a chave nunca é vazia nos casos reais de cada tipo ------------------
const casos = [
  ['mural', { sourceId: 'pubmed:42500129', titulo: 'Obesity and bone health' }, 'artigo do radar'],
  ['mural', { titulo: 'Aviso da equipe sobre a prova' }, 'aviso à mão, SEM sourceId'],
  ['resumo', { id: 'abc', titulo: 'Hipotireoidismo' }, 'resumo com id'],
  ['resumo', { sub: 'Tireoide', tema: 'Nódulo', titulo: 'Nódulo tireoidiano' }, 'resumo SEM id'],
  ['questao', { code: 'END-014', stem: 'Paciente com TSH elevado…' }, 'questão do banco'],
  ['questao', { stem: 'Questão gerada por IA sem código.' }, 'questão SEM code'],
  ['mapa', { id: 7, topic: 'Eixo HHA' }, 'mapa com id'],
  ['mapa', { topic: 'Eixo HHA', at: 1770000000000 }, 'mapa SEM id'],
  ['flashcard', { id: 3, front: 'O que é efeito Wolff-Chaikoff?' }, 'flashcard com id'],
  ['flashcard', { front: 'O que é efeito Wolff-Chaikoff?' }, 'flashcard SEM id']
];
casos.forEach(([t, o, nome]) => ok('chave não-vazia: ' + t + ' — ' + nome, !!ctx.favKey(t, o), JSON.stringify(o)));
ok('objeto nulo devolve chave vazia', ctx.favKey('mural', null) === '');
ok('tipo desconhecido devolve chave vazia', ctx.favKey('outro', { id: 1 }) === '');

// ---- 2. a chave é ESTÁVEL e DISTINGUE itens diferentes ----------------------
const a1 = ctx.favKey('mural', { sourceId: 'pubmed:1', titulo: 'X' });
const a2 = ctx.favKey('mural', { sourceId: 'pubmed:1', titulo: 'Título editado depois' });
ok('mesmo sourceId = mesma chave, mesmo mudando o título', a1 === a2);
ok('sourceIds diferentes = chaves diferentes',
   ctx.favKey('mural', { sourceId: 'pubmed:1' }) !== ctx.favKey('mural', { sourceId: 'pubmed:2' }));
ok('resumos de temas diferentes não colidem',
   ctx.favKey('resumo', { sub: 'Tireoide', tema: 'A' }) !== ctx.favKey('resumo', { sub: 'Tireoide', tema: 'B' }));

// ---- 3. ⚠️ tipos diferentes com o MESMO texto não se cancelam ---------------
ctx.DB.favs = [];
const texto = { front: 'Eixo HHA', topic: 'Eixo HHA', id: undefined };
ctx.favToggle('mapa', { topic: 'Eixo HHA', at: 1 });
ctx.favToggle('flashcard', { front: 'Eixo HHA' });
ok('mapa e flashcard homônimos convivem', ctx.DB.favs.length === 2, JSON.stringify(ctx.DB.favs));
ok('cada um com o seu tipo', ctx.DB.favs.map((x) => x.t).sort().join(',') === 'flashcard,mapa');

// ---- 4. alternância: salva, marca, remove ----------------------------------
ctx.DB.favs = [];
const art = { sourceId: 'pubmed:9', titulo: 'FOURIER', subespecialidade: 'Lípides' };
ok('não está salvo no início', ctx.favHas('mural', art) === false);
ok('primeiro clique SALVA (devolve true)', ctx.favToggle('mural', art) === true);
ok('agora está salvo', ctx.favHas('mural', art) === true);
ok('guarda o rótulo p/ quando o item sair do ar', ctx.DB.favs[0].tit === 'FOURIER');
ok('guarda a subespecialidade', ctx.DB.favs[0].sub === 'Lípides');
ok('guarda o momento', typeof ctx.DB.favs[0].at === 'number' && ctx.DB.favs[0].at > 0);
ok('segundo clique REMOVE (devolve false)', ctx.favToggle('mural', art) === false);
ok('lista vazia de novo', ctx.DB.favs.length === 0);
ok('mais novo entra no topo', (function () {
  ctx.DB.favs = [];
  ctx.favToggle('mural', { sourceId: 'a', titulo: 'primeiro' });
  ctx.favToggle('mural', { sourceId: 'b', titulo: 'segundo' });
  return ctx.DB.favs[0].tit === 'segundo';
})());

// ---- 5. o HTML da estrela reflete o estado ---------------------------------
ctx.DB.favs = [];
const off = ctx.favStarHTML('mural', art);
ok('desmarcada usa ☆', off.indexOf('☆') >= 0 && off.indexOf('★') < 0);
ok('desmarcada tem aria-pressed=false', off.indexOf('aria-pressed="false"') >= 0);
ctx.favToggle('mural', art);
const on = ctx.favStarHTML('mural', art);
ok('marcada usa ★', on.indexOf('★') >= 0);
ok('marcada tem a classe on', /class="fav-star on"/.test(on));
ok('marcada tem aria-pressed=true', on.indexOf('aria-pressed="true"') >= 0);
ok('carrega tipo e chave no dataset', on.indexOf('data-fav-t="mural"') >= 0 && on.indexOf('data-fav-k="pubmed:9"') >= 0);
ok('item sem chave não gera estrela', ctx.favStarHTML('mural', null) === '');
// Aspas no título não podem quebrar o atributo HTML.
ok('chave com aspas sai escapada',
   ctx.favStarHTML('mural', { titulo: 'Estudo "X" sobre TSH' }).indexOf('&quot;') >= 0);

// ---- 6. a estrela está mesmo nos 5 cards do index.html ---------------------
[['mural', "favStarHTML('mural',a)"],
 ['resumo', "favStarHTML('resumo',d)"],
 ['questão', "favStarHTML('questao',q)"],
 ['mapa mental', "favStarHTML('mapa',m)"],
 ['flashcard', "favStarHTML('flashcard',c)"]
].forEach(([nome, marca]) => ok('estrela presente no card de ' + nome, SRC.indexOf(marca) >= 0, marca));

// ---- 7. persistência e navegação ------------------------------------------
ok("'favs' entrou em PERSONAL_STATE_KEYS (sincroniza entre aparelhos)",
   /PERSONAL_STATE_KEYS=\[[^\]]*'favs'/.test(SRC));
ok('DB.favs tem valor inicial', /favs:lsGet\('favs'\)\|\|\[\]/.test(SRC));
ok('painel Favoritos existe', SRC.indexOf('id="panel-favs"') >= 0);
ok('item na barra lateral', SRC.indexOf('data-p="favs"') >= 0);
ok('rótulo do painel', /favs:'Favoritos'/.test(SRC));
ok('goPanel renderiza ao abrir', /if\(id==='favs'\)renderFavoritos\(\);/.test(SRC));
// A estrela não pode abrir o card em que está: o handler é de CAPTURA e corta.
ok('handler de captura com stopPropagation', /ev\.stopPropagation\(\);[^]{0,200}data-fav-t|stopPropagation\(\)/.test(
  SRC.slice(SRC.indexOf("closest('[data-fav-t]')"), SRC.indexOf("closest('[data-fav-t]')") + 400)));

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ favoritos: chave estável nos 5 tipos, alternância e estrela nos 5 cards');
process.exit(bad ? 1 : 0);
