// Gera um test.html autocontido: inclui o converter + fixtures e roda o
// round-trip (estabilidade visual) escrevendo o resultado em <pre id="out">.
const fs = require('fs'), path = require('path');
const dir = __dirname;
const conv = fs.readFileSync(path.join(dir, 'converter.js'), 'utf8');
const fxDir = path.join(dir, '..', 'basica', 'expanded');
const fixtures = fs.readdirSync(fxDir).filter(f => f.endsWith('.md')).map(f => ({ name: f, md: fs.readFileSync(path.join(fxDir, f), 'utf8') }));

// fixture sintético cobrindo TODAS as features + emoji + < > & e inline aninhado
fixtures.push({ name: 'synthetic.md', md: [
'## Título com 📊 e **negrito**',
'',
'Parágrafo com **negrito**, *itálico*, __sublinhado__, `código` e HbA1c < 5,7% (VR > 100) & cia.',
'',
'- item 1 com **negrito**',
'- item 2 com *itálico* e `code`',
'',
'## 📊 Tabela de teste',
'| Coluna A | Coluna B | Alvo |',
'| --- | --- | --- |',
'| LDL-c < 40 | muito alto | **sim** |',
'| TSH > 4,0 | alto | não |',
'',
'> Uma citação com <tag> e & símbolo.',
'',
'---',
'',
'Parágrafo final com **negrito com *itálico* dentro** e fim.'
].join('\n') });

const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<pre id="out">rodando...</pre>
<script>
${conv}
var FIXTURES = ${JSON.stringify(fixtures)};
function firstDiff(a,b){ for(var i=0;i<Math.max(a.length,b.length);i++){ if(a[i]!==b[i]){ return 'pos '+i+': ...'+JSON.stringify(a.slice(Math.max(0,i-40),i+40))+' | ...'+JSON.stringify(b.slice(Math.max(0,i-40),i+40)); } } return ''; }
var res = FIXTURES.map(function(f){
  var html1 = mdToHtml(f.md);
  var div = document.createElement('div'); div.innerHTML = html1;
  var back = htmlToMd(div);
  var html2 = mdToHtml(back);
  var stable = (html1 === html2);
  var exact = (back.trim() === f.md.trim());
  return { name: f.name, stable: stable, exact: exact, mdLen: f.md.length, backLen: back.length, diff: stable ? '' : firstDiff(html1, html2) };
});
var allStable = res.every(function(r){ return r.stable; });
document.getElementById('out').textContent = JSON.stringify({ allStable: allStable, results: res }, null, 2);
</script></body></html>`;

fs.writeFileSync(path.join(dir, 'test.html'), html);
console.log('test.html gerado (' + Buffer.byteLength(html) + ' bytes, ' + fixtures.length + ' fixtures)');
