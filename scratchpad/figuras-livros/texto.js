'use strict';
// O TEXTO DO CAPÍTULO COM OS RECORTES DOS LIVROS — o mesmo para a prévia e para o banco.
// A figura entra na linha seguinte à do trecho combinado (`depoisDe`, que aparece UMA vez e
// fecha a linha), ou no lugar da ilustração própria que ela substitui (`substitui`). Como
// imagem de markdown com legenda, o mdToHtml do app a transforma em <figure> com legenda e
// ampliador. Idempotente: se a figura já está no texto, só a linha dela é refeita.
// lote 1 (Endocrinologia Básica), lote de diabetes (figuras-diabetes.js, 18/10/2026), lote de
// tireoide, obesidade e osteometabolismo (figuras-tireoide-obesidade-osteo.js, 19/10/2026) e parte
// 2 de tireoide (figuras-tireoide-parte2.js, 20/10/2026)
const FIGURAS = require('./figuras.js').concat(require('./figuras-diabetes.js'), require('./figuras-tireoide-obesidade-osteo.js'), require('./figuras-tireoide-parte2.js'));
const BASE = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/resumos/livros/';
const escAlt = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const arquivoDe = (f) => f.id + '.' + (f.formato || 'png');
const linhaDe = (f, base) => '![' + escAlt(f.legenda) + '](' + (base || BASE) + arquivoDe(f) + ')' + (f.largura ? '{' + f.largura + '}' : '');
// a linha de imagem de um arquivo (a leitura do alt é a do mdAltRE do app)
const linhaGravada = (nome) => new RegExp('^!\\[(?:[^\\]\\\\]|\\\\.)*\\]\\([^)\\s]*/' + escRe(nome) + '\\)(\\{\\d{1,3}\\})?$', 'm');
function figurasDo(cap) {
  const t = String(cap.resumo || '');
  const onde = (f) => (f.substitui ? t.search(linhaGravada(f.substitui)) : t.indexOf(f.depoisDe));
  return FIGURAS.filter((f) => f.tema === cap.tema).sort((a, b) => onde(a) - onde(b));
}
function textoComFiguras(cap, base) {
  let t = String(cap.resumo || '');
  for (const f of figurasDo(cap)) {
    const linha = linhaDe(f, base);
    if (linhaGravada(arquivoDe(f)).test(t)) { t = t.replace(linhaGravada(arquivoDe(f)), () => linha); continue; }
    if (f.substitui) {
      if (!linhaGravada(f.substitui).test(t)) throw new Error(f.id + ': a ilustração a substituir (' + f.substitui + ') não está no capítulo');
      t = t.replace(linhaGravada(f.substitui), () => linha);
      continue;
    }
    const n = t.split(f.depoisDe).length - 1;
    if (n !== 1) throw new Error(f.id + ': o trecho de inserção aparece ' + n + ' vez(es) no capítulo');
    const p = t.indexOf(f.depoisDe) + f.depoisDe.length;
    if (p < t.length && t[p] !== '\n') throw new Error(f.id + ': o trecho não fecha a linha');
    t = t.slice(0, p) + '\n\n' + linha + '\n' + t.slice(p);
  }
  return t;
}
module.exports = { FIGURAS, BASE, arquivoDe, linhaDe, linhaGravada, figurasDo, textoComFiguras, escAlt };
