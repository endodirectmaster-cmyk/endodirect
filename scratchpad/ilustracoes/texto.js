'use strict';
// O TEXTO DO CAPÍTULO COM AS ILUSTRAÇÕES no meio — o mesmo para a prévia e para o banco.
//
// Cada ilustração (ilus/*.js) diz o capítulo (`tema`) e o trecho depois do qual entra
// (`depoisDe`, que precisa aparecer UMA vez). A figura vai na linha seguinte à linha que
// contém o trecho, como imagem de markdown com legenda — o `mdToHtml` do app a transforma
// em <figure> com <figcaption>, com o ampliador ao toque. Idempotente: se a figura já está
// no texto, não entra de novo — só a linha dela é refeita (legenda e endereço atuais).
const fs = require('fs');
const path = require('path');
const { slugify } = require('../figuras-resumos/render.js');

function todas() {
  return fs.readdirSync(path.join(__dirname, 'ilus')).filter((f) => f.endsWith('.js')).sort().map((f) => require(path.join(__dirname, 'ilus', f)));
}
function arquivoDe(ilus) { return slugify(ilus.sub) + '--' + ilus.id + '.svg'; }
// As ilustrações do capítulo, na ordem em que aparecem no texto.
function ilustracoesDo(cap) {
  const t = String(cap.resumo || '');
  return todas().filter((i) => i.tema === cap.tema).map((i) => ({ i, p: t.indexOf(i.depoisDe) })).sort((a, b) => a.p - b.p).map((x) => x.i);
}
const escAlt = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// a linha de imagem já gravada de uma ilustração (a leitura do alt é a do mdAltRE do app)
const linhaGravada = (arq) => new RegExp('^!\\[(?:[^\\]\\\\]|\\\\.)*\\]\\([^)\\s]*/figuras/resumos/ilustracoes/' + escRe(arq) + '\\)(\\{\\d{1,3}\\})?$', 'm');
function textoComIlustracoes(cap, base) {
  let t = String(cap.resumo || '');
  for (const i of ilustracoesDo(cap)) {
    const url = base.replace(/\/$/, '') + '/figuras/resumos/ilustracoes/' + arquivoDe(i);
    if (t.indexOf('/figuras/resumos/ilustracoes/' + arquivoDe(i)) >= 0) { // já está: refaz só a linha
      t = t.replace(linhaGravada(arquivoDe(i)), (m0, w) => '![' + escAlt(i.legenda) + '](' + url + ')' + (w || ''));
      continue;
    }
    const n = t.split(i.depoisDe).length - 1;
    if (n !== 1) throw new Error(i.id + ': o trecho de inserção aparece ' + n + ' vez(es) no capítulo');
    const p = t.indexOf(i.depoisDe) + i.depoisDe.length;
    const fimLinha = t.indexOf('\n', p) < 0 ? t.length : t.indexOf('\n', p);
    t = t.slice(0, fimLinha) + '\n\n![' + escAlt(i.legenda) + '](' + url + ')\n' + t.slice(fimLinha);
  }
  return t;
}
module.exports = { todas, arquivoDe, ilustracoesDo, textoComIlustracoes, linhaGravada, escAlt };
