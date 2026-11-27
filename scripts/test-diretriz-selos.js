'use strict';
// FORÇA DA RECOMENDAÇÃO EM SELOS LEGÍVEIS NAS DIRETRIZES (professor, 27/11/2026, com print da POI: "Essa sigla GPP,
// forte, não ficou bom, essas diretrizes").
// 🧨 Os modos de quebrar isto em silêncio:
//  - "GPP:" ou "Forte ⊕⊕◯◯:" voltarem a aparecer crus no texto da diretriz;
//  - o selo dizer a evidência errada (⊕⊕◯◯ é BAIXA, ⊕◯◯◯ é MUITO BAIXA);
//  - outro negrito ("Volume:", "Nota Endodirect:", "Recomendação 1.1") virar selo;
//  - o editor do professor receber o selo no lugar do texto original (ao salvar, o original se perderia).
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const ini = html.indexOf('var GRAU_EVID='), fim = html.indexOf('\nfunction dirPontoLI(');
ok(ini > 0 && fim > ini, 'o bloco dos selos sumiu');
const ctx = {};
new Function('ctx', html.slice(ini, fim) + '\nctx.rot=dirGrauRotulo;ctx.selos=dirGrauSelos;')(ctx);
const r = (x) => ctx.rot(x);
const so = (h) => String(h || '').replace(/<[^>]+>/g, '');
ok(so(r('GPP:')) === 'Boa prática', 'GPP vira "Boa prática": ' + r('GPP:'));
ok(so(r('GPP (critérios):')) === 'Boa práticaCritérios:' && /<strong>Critérios:<\/strong>/.test(r('GPP (critérios):')), 'GPP com tema: selo + tema em negrito');
ok(so(r('Forte ⊕⊕◯◯:')) === 'Forte · evidência baixa' && /rec-forte/.test(r('Forte ⊕⊕◯◯:')), '🧨 Forte ⊕⊕◯◯ = forte, evidência BAIXA');
ok(so(r('Forte ⊕◯◯◯:')) === 'Forte · evidência muito baixa', '🧨 ⊕◯◯◯ = evidência MUITO BAIXA');
ok(so(r('Forte ⊕⊕⊕◯:')) === 'Forte · evidência moderada' && so(r('Condicional ⊕⊕⊕⊕:')) === 'Condicional · evidência alta', '⊕⊕⊕◯ moderada, ⊕⊕⊕⊕ alta');
ok(/rec-cond/.test(r('Condicional ⊕⊕◯◯:')), 'condicional em âmbar');
ok(so(r('1.10.1 EBR ❖❖❖❖ ⊕⊕⊕◯:')) === '1.10.1Forte · evidência moderada' && /rec-num/.test(r('1.10.1 EBR ❖❖❖❖ ⊕⊕⊕◯:')), 'SOP: número + selo (❖❖❖❖ forte)');
ok(so(r('5.4.5.1 EBR ❖❖❖❖ ⊕◯◯◯ (CC × letrozol):')) === '5.4.5.1Forte · evidência muito baixaCC × letrozol:', 'SOP com tema entre parênteses');
ok(so(r('2.3 CR ❖❖❖:')) === '2.3Condicional · consenso', 'SOP: CR = consenso');
ok(so(r('3.1 CR ❖:')) === '3.1Condicional, contra · consenso' && /rec-contra/.test(r('3.1 CR ❖:')), 'SOP: ❖ = condicional contra');
ok(so(r('4.2 PP:')) === '4.2Ponto de prática' && so(r('PP geral:')) === 'Ponto de prática geral', 'SOP: PP = ponto de prática');
['Volume:', 'Nota Endodirect:', 'Recomendação 1.1', 'Método:', 'TSH', 'Forte demais:'].forEach((x) => ok(r(x) === null, '🧨 "' + x + '" não pode virar selo'));
const h = ctx.selos('<li><strong>GPP:</strong> usar o nome</li><li><strong>Forte ⊕⊕◯◯:</strong> cariótipo</li><li><strong>Volume:</strong> 254 itens</li>');
ok(!/GPP|⊕/.test(h) && /<strong>Volume:<\/strong> 254 itens/.test(h) && / usar o nome/.test(h), 'o HTML da diretriz troca só os rótulos de grau: ' + h);
// ligação: só no texto da diretriz/resumo que tem grau, nunca no editor
const card = html.slice(html.indexOf('\nfunction dirCardHTML('), html.indexOf('\nfunction ', html.indexOf('\nfunction dirCardHTML(') + 10));
ok(/var htmlrz=mdToHtml\(rz\);\n\s*if\(\/⊕\|❖\|GPP\/\.test\(rz\)\)htmlrz=dirGrauSelos\(htmlrz\);/.test(card), '🧨 o texto da diretriz passa pelos selos (só quando tem grau)');
ok((html.match(/dirGrauSelos\(/g) || []).length === 2, '🧨 os selos só entram na leitura (o editor do professor recebe o texto original)');
ok(/\.rec-selo\{/.test(html) && /\.rec-forte\{/.test(html) && /html\[data-theme="light"\] \.rec-forte\{/.test(html), 'CSS dos selos nos dois temas');
if (falhas.length) { console.error('✗ selos de grau nas Diretrizes:\n  - ' + falhas.join('\n  - ')); process.exit(1); }
console.log('✓ Diretrizes: "GPP"/"Forte ⊕⊕◯◯"/"EBR ❖❖❖❖" viram selos em português (Boa prática, Forte · evidência baixa), só na leitura');
