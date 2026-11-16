// Regressão: o mesmo artigo pelo PubMed e pelo RSS da revista em rodadas diferentes (16/11/2026).
//
// Em 15/11/2026 o REDEFINE 9 entrou às 10h31 (UTC) pelo PubMed e às 20h24 pelo RSS da Lancet
// Diabetes & Endocrinology. A dedup entre rodadas usava o título EXATO, e os dois títulos diferem
// num travessão ("cagrilintide–semaglutide" × "cagrilintide-semaglutide") e no ponto final: o mural
// ficou com dois cards do mesmo artigo, o do RSS genérico, no topo.
'use strict';
const path = require('path');
const { existingMuralKeys, chaveTitulo } = require(path.join(__dirname, '..', 'lib', 'radar.js'));
const fs = require('fs');

const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const pubmed = 'Efficacy and safety of co-administered cagrilintide-semaglutide (CagriSema) 1·7 mg each and 1·0 mg each in adults with overweight or obesity (REDEFINE 9): a multicentre, randomised, double-blind within-dose-level, placebo-controlled, parallel-group, phase 3b trial.';
const rss = 'Efficacy and safety of co-administered cagrilintide–semaglutide (CagriSema) 1·7 mg each and 1·0 mg each in adults with overweight or obesity (REDEFINE 9): a multicentre, randomised, double-blind within-dose-level, placebo-controlled, parallel-group, phase 3b trial';

const k1 = existingMuralKeys({ radar_avisos: [{ titulo: pubmed }] });
ok(k1.has(chaveTitulo(rss)), '🧨 o RSS da revista não reconhece o artigo que já entrou pelo PubMed');
const k2 = existingMuralKeys({ radar_avisos: [{ titulo: rss }] });
ok(k2.has(chaveTitulo(pubmed)), '🧨 o PubMed não reconhece o artigo que já entrou pelo RSS');
ok(chaveTitulo('Editorial') === '' && chaveTitulo('Correction') === '', '⚠️ título curto virou chave: daria falso positivo entre artigos diferentes');
ok(!existingMuralKeys({ radar_avisos: [{ titulo: 'Editorial' }, { titulo: '' }] }).has(''), '⚠️ chave vazia no conjunto: todo item sem título seria descartado');
ok(chaveTitulo('Hipotireoidismo subclínico no idoso: tratar ou não tratar?') === chaveTitulo('Hipotireoidismo subclinico no idoso - tratar ou nao tratar'), 'acentos e pontuação deveriam ser ignorados');

// Os dois caminhos de entrada usam a chave.
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'radar.js'), 'utf8');
ok(/!exclude\.has\(chaveTitulo\(a\.title\)\)/.test(src), '🧨 a busca do PubMed não confere o título normalizado');
ok(/excludeKeys\.has\(chaveTitulo\(e\.title\)\)/.test(src), '🧨 o RSS das revistas não confere o título normalizado');

if (falhas.length) { console.error('✗ radar: dedup por título normalizado'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
console.log('✓ radar: o mesmo artigo pelo PubMed e pelo RSS da revista não entra duas vezes');
