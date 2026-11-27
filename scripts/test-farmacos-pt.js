'use strict';
// Nome de fármaco em português no Mural (professor, 27/11/2026: "Saiu 'topiramate' ao invés de 'topiramato'").
const fs = require('fs');
const path = require('path');
const { farmacosPt, REGRA_PROMPT } = require('../lib/farmacos-pt');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const igual = (ent, esp) => { const s = farmacosPt(ent); ok(s === esp, 'farmacosPt(' + JSON.stringify(ent) + ') = ' + JSON.stringify(s) + ', esperado ' + JSON.stringify(esp)); };

// O caso do print e os parecidos que estavam no Mural.
igual('Topiramate é usado off label para tentar superar o platô', 'Topiramato é usado off label para tentar superar o platô');
igual('semaglutida (Wegovy) com ou sem topiramate, definindo', 'semaglutida (Wegovy) com ou sem topiramato, definindo');
igual('Eficácia e Segurança do Retatrutide em Adultos', 'Eficácia e Segurança da Retatrutida em Adultos');
igual('O survodutide pode representar uma nova opção', 'A survodutida pode representar uma nova opção');
igual('avaliou o survodutide, um agonista dual', 'avaliou a survodutida, um agonista dual');
igual('(mazdutide, survodutide, cotadutide e efinopegdutide) em adultos', '(mazdutida, survodutida, cotadutida e efinopegdutida) em adultos');
igual('o cagrilintide-semaglutide reduziu', 'a cagrilintida-semaglutida reduziu');
igual('O topiramate é usado', 'O topiramato é usado');
igual('TOPIRAMATE e Wegovy', 'TOPIRAMATO e Wegovy');
// Radicais regulares.
igual('empagliflozin, sitagliptin, pioglitazone, atorvastatin, simvastatin, selpercatinib, alendronate',
  'empagliflozina, sitagliptina, pioglitazona, atorvastatina, sinvastatina, selpercatinibe, alendronato');
// O que NÃO pode mudar: nome de estudo, trecho em inglês, palavra comum, português já certo.
igual('os ensaios EVOKE/EVOKE+ e Exenatide-PD3 alertam', 'os ensaios EVOKE/EVOKE+ e Exenatide-PD3 alertam');
igual('o índice SPISE (Single-Point Insulin Sensitivity Estimator)', 'o índice SPISE (Single-Point Insulin Sensitivity Estimator)');
igual("estudo PROMPT (Prospective study of metyrapone in endogenous Cushing's syndrome)", "estudo PROMPT (Prospective study of metyrapone in endogenous Cushing's syndrome)");
igual('O FDA aprovou Onswik (insulin efsitora alfa-gobe)', 'O FDA aprovou Onswik (insulin efsitora alfa-gobe)');
igual('glicêmico, nucleotide, peptide, statins, GLP-1, SURMOUNT-1, denosumab', 'glicêmico, nucleotide, peptide, statins, GLP-1, SURMOUNT-1, denosumab');
igual('A semaglutida e o topiramato já estavam certos.', 'A semaglutida e o topiramato já estavam certos.');
ok(farmacosPt('') === '' && farmacosPt(null) === null && farmacosPt(undefined) === undefined, 'texto vazio ou ausente tem de voltar igual');

// A regra está nos prompts e a conferência roda na saída da IA (radar, notícias, discussão).
ok(/topiramato/.test(REGRA_PROMPT) && /nunca a forma em ingles/.test(REGRA_PROMPT), 'a regra do prompt tem de pedir a forma em português');
const radar = fs.readFileSync(path.join(__dirname, '..', 'lib', 'radar.js'), 'utf8');
ok((radar.match(/\+ REGRA_FARMACOS \+/g) || []).length >= 2, 'o prompt do radar (artigos e informes) tem de levar a regra dos fármacos');
ok(/return farmacosNoResumo\(obj, \['tituloPt', 'tipo', 'resumo', 'porque', 'cautela'\]\)/.test(radar), 'o resumo do artigo (PubMed e RSS) tem de passar pela conferência dos fármacos');
ok(/return farmacosNoResumo\(obj, \['tituloPt', 'resumo', 'porque'\]\)/.test(radar), 'o resumo dos informes tem de passar pela conferência dos fármacos');
const news = fs.readFileSync(path.join(__dirname, '..', 'lib', 'news.js'), 'utf8');
ok(/\+ REGRA_FARMACOS \+/.test(news) && /obj\.resumo = farmacosPt\(obj\.resumo\)/.test(news), 'as notícias (Breaking News) têm de levar a regra e a conferência');
const disc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'discussao.js'), 'utf8');
ok(/REGRA_FARMACOS\n\]\.join/.test(disc) && /const md = farmacosPt\(/.test(disc), 'a discussão completa tem de levar a regra e a conferência');

if (falhas.length) { console.error('✗ nomes de fármacos em português:\n  - ' + falhas.join('\n  - ')); process.exit(1); }
console.log('✓ nomes de fármacos em português no Mural (topiramato, semaglutida...), sem mexer em estudo, trecho em inglês ou palavra comum');
