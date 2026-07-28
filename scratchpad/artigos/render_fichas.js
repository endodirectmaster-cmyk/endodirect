// Renderiza as fichas de um lote usando os MESMOS renderizadores do index.html,
// extraídos por recorte do arquivo real (não uma cópia — cópia diverge).
// Uso: node render_fichas.js info4.js INFO4 trials4.js TODOS4 > fichas4.html
'use strict';
const fs = require('fs');
const vm = require('vm');
const SRC = fs.readFileSync('/home/user/endodirect/index.html', 'utf8');

const [, , modInfo, chaveInfo, modTrials, chaveTrials] = process.argv;
const INFO = require('./' + modInfo)[chaveInfo];
const TRIALS = require('./' + modTrials)[chaveTrials];

// Recorta o bloco de funções da ficha do index.html.
const ini = SRC.indexOf('function dirChipHTML(');
const fim = SRC.indexOf('// ---------------------------------------------------------------------------\n// REORDENAR TEMAS');
if (ini < 0 || fim < 0 || fim < ini) { console.error('não achei o bloco das fichas no index.html'); process.exit(1); }
const bloco = SRC.slice(ini, fim);

// Dependências mínimas que o bloco usa e que vivem noutro ponto do arquivo.
const trecho = (nome) => {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) { console.error('não achei function ' + nome); process.exit(1); }
  // até a próxima declaração de função no nível zero
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j);
};
// `mdInline` depende de WYS_CORES_RE, que é montado noutro ponto do arquivo.
const iCores = SRC.indexOf('var WYS_CORES=[');
const fCores = SRC.indexOf('\n', SRC.indexOf('var WYS_CORES_RE='));
const ctx = { console };
vm.createContext(ctx);
vm.runInContext([SRC.slice(iCores, fCores),
  trecho('esc'), trecho('mdInline'), trecho('safeHttpUrl'), bloco].join('\n'), ctx);

// CSS das fichas: pega as regras .fx-* / .dir-ficha do próprio index.html.
const cssTudo = SRC.match(/<style>[\s\S]*?<\/style>/g).join('\n');
const regras = (cssTudo.match(/[^{}]*\{[^{}]*\}/g) || [])
  .filter((r) => /(^|[\s,>])\.(fx-|dir-ficha)/.test(r.split('{')[0]))
  .join('\n');
const vars = (cssTudo.match(/:root\s*\{[^}]*\}/g) || []).join('\n');

const fichas = TRIALS.filter((t) => INFO[t.tema]).map((t) => {
  const d = { fonte: t.fonte, ano: t.ano, tema: t.tema, url: t.url };
  return '<section class="amostra"><div class="amostra-h">' + ctx.esc(t.sub + ' · ' + t.tema) + '</div>'
    + ctx.dirFichaHTML(INFO[t.tema], d) + '</section>';
}).join('\n');

process.stdout.write('<meta charset="utf-8"><title>Fichas — ' + chaveInfo + '</title><style>\n'
  + vars + '\n' + regras + '\n'
  + 'body{margin:0;background:#eef1f0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#12201d}'
  + '.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(23rem,1fr));gap:1.25rem;padding:1.25rem;align-items:start}'
  + '.amostra{background:#fff;border-radius:12px;overflow:hidden;border:1px solid #d8e0de}'
  + '.amostra-h{font:600 .78rem/1 ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;'
  + 'padding:.6rem .9rem;background:#0f6e63;color:#fff}'
  + '</style><div class="grade">' + fichas + '</div>\n');
