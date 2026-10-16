// Confere o TEXTO das figuras contra o capítulo (16/10/2026).
//
// O confere.js mede a figura (sobreposição, texto cortado); este confere o conteúdo:
//   1. cada número que aparece na figura (título, caixas, rótulos, notas, legenda,
//      colunas, degraus, marcos) tem de aparecer no texto do capítulo;
//   2. cada trecho do `lastro` tem de estar no capítulo, literalmente.
// É uma peneira, não o veredito: "1ª etapa" acusa o 1 mesmo quando está certo, e um
// número presente no capítulo pode estar no lugar errado da figura. Quem confere lê
// a lista e decide; o que sobra para a leitura humana é a direção causal e o sentido.
//
// Uso: node scratchpad/figuras-resumos/confere-texto.js <pasta dos capítulos> [spec.json …]
//   Sem specs, confere todas as de scratchpad/figuras-resumos/specs/. Os capítulos são
//   os JSON exportados (um por capítulo, com `resumo`, `pts` e `fluxogramas`), com o
//   mesmo nome de arquivo da especificação. Eles NÃO entram no repositório.
// Saída: uma linha JSON por especificação com o que não achou; código 1 se houver algo.
'use strict';
const fs = require('fs');
const path = require('path');

const PASTA_SPECS = path.join(__dirname, 'specs');
const CHAVES_TEXTO = new Set(['texto', 'rotulo', 'legenda', 'rodape', 'titulo', 'detalhe', 'eixo', 'itens', 'rotulos_camadas', 'subtitulo']);

// Ênfase do markdown (*x*, **x**, _x_), marcador de lista e emoji somem: o lastro
// copia a frase, não a formatação (16/10: *browning*, "- Evitar…" e ⚠️ davam falso alarme).
const norm = (s) => String(s || '')
  .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, '')
  .replace(/[*_`]/g, '')
  .replace(/\p{Extended_Pictographic}|\uFE0F/gu, '')
  .replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'")
  .replace(/[‐‑‒–—]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

function textosDoCapitulo(c) {
  const out = [];
  const anda = (v) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(anda); else if (v && typeof v === 'object') Object.values(v).forEach(anda); };
  anda([c.resumo, c.pts, c.fluxogramas, c.tabelas]);
  return out.join('\n');
}

function textosDaFigura(spec) {
  const out = [];
  if (spec.titulo) out.push(spec.titulo);
  if (spec.subtitulo) out.push(spec.subtitulo);
  const anda = (v, chave) => {
    if (typeof v === 'string') { if (CHAVES_TEXTO.has(chave)) out.push(v); return; }
    if (Array.isArray(v)) { v.forEach((x) => anda(x, chave)); return; }
    if (v && typeof v === 'object') for (const k of Object.keys(v)) anda(v[k], k);
  };
  anda(spec[spec.tipo], spec.tipo);
  return out;
}

// Números como aparecem para o leitor: 10, 1,5, 0.9, 130×80 vira 130 e 80. Ordinais
// (1ª, 2º) e a numeração de etapas no começo da linha ("3. Metformina") não contam.
const numerosDe = (s) => (String(s).replace(/^\s*\d+\.\s/gm, '').replace(/\d+\s?[ªº]/g, '').match(/\d+(?:[.,]\d+)?/g) || []);
const variantes = (n) => [n, n.replace(',', '.'), n.replace('.', ',')];

function confere(spec, cap) {
  const bruto = textosDoCapitulo(cap);
  const capNorm = norm(bruto);
  const numerosCap = new Set(numerosDe(bruto));
  const semApoio = [];
  for (const t of textosDaFigura(spec)) {
    for (const n of numerosDe(t)) {
      if (!variantes(n).some((v) => numerosCap.has(v))) semApoio.push(n + ' em "' + t.replace(/\n/g, ' / ') + '"');
    }
  }
  const lastroFora = (spec.lastro || []).filter((l) => !capNorm.includes(norm(l).replace(/^\.\.\.|\.\.\.$|…/g, '').trim()));
  return { semApoio: [...new Set(semApoio)], lastroFora };
}

if (require.main === module) {
  const pastaCap = process.argv[2];
  if (!pastaCap || !fs.existsSync(pastaCap)) { console.error('uso: node confere-texto.js <pasta dos capítulos> [spec.json …]'); process.exit(2); }
  const specs = process.argv.slice(3).length ? process.argv.slice(3) : fs.readdirSync(PASTA_SPECS).filter((f) => f.endsWith('.json')).map((f) => path.join(PASTA_SPECS, f));
  let problemas = 0;
  for (const arq of specs) {
    const spec = JSON.parse(fs.readFileSync(arq, 'utf8'));
    const capArq = path.join(pastaCap, path.basename(arq));
    if (!fs.existsSync(capArq)) { console.log(JSON.stringify({ i: spec.i, erro: 'capítulo não encontrado: ' + path.basename(arq) })); problemas++; continue; }
    const r = confere(spec, JSON.parse(fs.readFileSync(capArq, 'utf8')));
    if (r.semApoio.length || r.lastroFora.length) problemas++;
    console.log(JSON.stringify({ i: spec.i, arquivo: path.basename(arq), numerosSemApoio: r.semApoio, lastroFora: r.lastroFora }));
  }
  console.error(specs.length + ' especificações; ' + problemas + ' com algo a conferir');
  process.exit(problemas ? 1 : 0);
}
module.exports = { confere, textosDaFigura, textosDoCapitulo, norm };
