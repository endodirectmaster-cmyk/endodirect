// Todo número que aparece na FICHA tem de existir no TEXTO ORIGINAL do trial.
//
// ⚠️ LIÇÃO (2026-07-27): existiam `check_info.js` e `check_info2.js`, um por lote.
// Quando entrou um lote novo, ninguém lembrou de criar o terceiro — e o mesmo
// aconteceu com o `check_info_db.js`, que ficou meses só olhando o 1º lote e
// ainda assim imprimia um ✓ tranquilizador. Este arquivo é a versão ÚNICA:
// descobre os lotes pela lista LOTES abaixo e falha se um trial tiver ficha sem
// fonte ou fonte sem ficha. Ao criar `trials4.js`/`info4.js`, acrescente UMA
// linha aqui — e nada mais.
//
// O que ele NÃO faz: conferir veracidade. Ele prova coerência interna entre a
// ficha e a prosa que eu mesmo escrevi. A revisão do professor continua sendo a
// única checagem contra a fonte real.
'use strict';
const B = '/home/user/endodirect/scratchpad/artigos/';

const LOTES = [
  { trials: 'trials.js', chaveT: 'TODOS', info: 'info.js', chaveI: 'INFO', nome: '1º lote' },
  { trials: 'trials2.js', chaveT: 'TODOS2', info: 'info2.js', chaveI: 'INFO2', nome: '2º lote' },
  { trials: 'trials3.js', chaveT: 'TODOS3', info: 'info3.js', chaveI: 'INFO3', nome: '3º lote' },
  { trials: 'trials4.js', chaveT: 'TODOS4', info: 'info4.js', chaveI: 'INFO4', nome: '4º lote' }
];

const norm = (s) => String(s).replace(/[–—−]/g, '-').replace(/\s+/g, ' ');
const NUM = /\d[\d.]*(?:,\d+)?/g;
// Números tão comuns que casariam por acaso (doses, IC95%, ordinais…).
const ignorar = new Set(['3', '2', '1', '95', '5', '6', '10', '15', '4', '50', '100', '80', '30', '27', '7', '9', '0']);

let falhas = 0, checados = 0, fichas = 0;

for (const lote of LOTES) {
  const trials = require(B + lote.trials)[lote.chaveT];
  const INFO = require(B + lote.info)[lote.chaveI];
  if (!Array.isArray(trials)) { console.log('  ✗ ' + lote.nome + ': ' + lote.chaveT + ' não é array'); falhas++; continue; }
  if (!INFO) { console.log('  ✗ ' + lote.nome + ': ' + lote.chaveI + ' não exportado'); falhas++; continue; }

  // Ficha órfã: entrada em INFO sem trial correspondente — sinal de tema renomeado.
  const temas = new Set(trials.map((t) => t.tema));
  Object.keys(INFO).forEach((k) => {
    if (!temas.has(k)) { console.log('  ✗ ' + lote.nome + ': ficha "' + k + '" não tem trial com esse tema'); falhas++; }
  });

  for (const t of trials) {
    const f = INFO[t.tema];
    if (!f) continue; // comparativos e afins não têm ficha, de propósito
    fichas++;
    const fonte = norm((t.pts || []).join(' ') + ' ' + t.resumo);
    const alvos = [];
    (f.chips || []).forEach((c) => alvos.push(['chip', c]));
    (f.desfechos || []).forEach((d, i) => {
      (d.barras || []).forEach((b) => alvos.push(['desf ' + i + ' ' + b.n, b.t]));
      if (d.efeito) alvos.push(['desf ' + i + ' efeito', d.efeito.v + ' ' + (d.efeito.p || '')]);
      if (d.curva && !d.curva.real) alvos.push(['desf ' + i + ' curva', String(d.curva.dur)]);
      if (Array.isArray(d.series)) {
        d.series.forEach((se, k) => {
          (se.linhas || []).forEach((l) => alvos.push(['desf ' + i + ' série ' + k + ' ' + l.n,
            (l.pts || []).map((pt) => String(pt[1]).replace('.', ',')).join(' ')]));
          if (se.nota) alvos.push(['desf ' + i + ' série ' + k + ' nota', se.nota]);
        });
      }
      if (d.grupos && Array.isArray(d.grupos.cats)) {
        d.grupos.cats.forEach((c) => alvos.push(['desf ' + i + ' grupos ' + c.k,
          (c.vs || []).map((v) => String(v).replace('.', ',')).join(' ')]));
        if (d.grupos.nota) alvos.push(['desf ' + i + ' grupos nota', d.grupos.nota]);
      }
    });
    (f.tiles || []).forEach((x) => alvos.push(['tile', x.v + ' ' + x.k]));
    if (f.seg) alvos.push(['segurança', f.seg]);
    if (f.prat) alvos.push(['prática', f.prat]);

    for (const [onde, txt] of alvos) {
      for (const n of (norm(txt).match(NUM) || [])) {
        if (ignorar.has(n)) continue;
        checados++;
        if (![n, n.replace(',', '.'), n.replace('.', ',')].some((v) => fonte.includes(v))) {
          console.log('  ✗ [' + lote.nome + '] ' + t.tema + ' — ' + onde + ': "' + n + '" não existe no texto original');
          falhas++;
        }
      }
    }
  }
}

console.log('\n' + (falhas
  ? 'FALHOU: ' + falhas + ' de ' + checados
  : '✓ ' + checados + ' números de ' + fichas + ' fichas (' + LOTES.length + ' lotes) conferidos contra o texto original'));
process.exit(falhas ? 1 : 0);
