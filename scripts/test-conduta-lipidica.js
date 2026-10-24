// CONDUTA TERAPÊUTICA NA CALCULADORA PREVENT (Diretriz Brasileira de
// Dislipidemias 2025, SBC).
//
// Pedido do professor (14/10/2026): "insira também a conduta terapêutica (dose
// de estatina, ezetimiba, etc)". A fonte das recomendações e das reduções é o
// texto integral da diretriz (PMC12674852); as doses por intensidade e a
// posologia dos anti-PCSK9 vêm das sínteses do acervo.
//
// 🧨 O QUE ESTE TESTE PRENDE:
// (1) o esquema inicial por categoria é o da tabela de recomendações: alto =
//     estatina de alta intensidade + ezetimiba; muito alto = + anti-PCSK9
//     conforme a meta; extremo = os três; baixo/intermediário = gatilho dos 30;
// (2) o quadro das metas ganhou a coluna TERAPIA INICIAL, nas cinco linhas;
// (3) a redução que falta é calculada do LDL-c informado e mapeada pelas
//     reduções médias da diretriz (moderada 30–50; alta ≥ 50; + ezetimiba 65;
//     + anti-PCSK9 > 85), e em quem já usa estatina se SOMA fármaco;
// (4) no baixo/intermediário a menos de 30 mg/dL da meta não há fármaco;
// (5) a tabela de doses traz os seis grupos com as doses; (6) o bloco de
//     conduta está na tela do PREVENT; (7) nenhum elemento com dois `style`.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome, fonte) {
  const src = fonte || html;
  const marca = '\nfunction ' + nome + '(';
  const i = src.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = src.indexOf('\nfunction ', i + marca.length);
  return src.slice(i + 1, f < 0 ? src.length : f);
}
function trechoVar(nome, fim, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  const f = src.indexOf(fim, i);
  return src.slice(i + 1, f + fim.length);
}
function linhaVar(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf('\n', i + 1));
}
// 24/10/2026: a categoria vem do motor único da SBC 2025 (`sbcEstratifica`), e o
// alvo de LDL-c de `sbcAlvoLDL` (meta e redução mínima juntas). O mundo carrega os
// dois e os ajudantes.
function mundo(fonte) {
  const ctx = vm.createContext({});
  vm.runInContext(
    'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}\n'
    + trechoVar('LDL_METAS', '\n};', fonte) + '\n'
    + linhaVar('SBC_ORD', fonte) + '\n'
    + linhaVar('SBC_COR', fonte) + '\n'
    + corpo('sbcN', fonte) + '\n'
    + corpo('sbcRenalDM', fonte) + '\n'
    + corpo('sbcEstratifica', fonte) + '\n'
    + corpo('sbcDadosDoPrevent', fonte) + '\n'
    + corpo('sbcPendenciasHTML', fonte) + '\n'
    + corpo('ldlFaixaEscore', fonte) + '\n'
    + linhaVar('LDL_FAIXA_F', fonte) + '\n'
    + corpo('sbcCategoria', fonte) + '\n'
    + linhaVar('LDL_COLS', fonte) + '\n'
    + corpo('ldlConduta', fonte) + '\n'
    + corpo('ldlEsquemaNivel', fonte) + '\n'
    + corpo('ldlEsquemaPelaReducao', fonte) + '\n'
    + trechoVar('LDL_DOSES', '\n];', fonte) + '\n'
    + corpo('ldlDosesHTML', fonte) + '\n'
    + corpo('sbcAlvoLDL', fonte) + '\n'
    + corpo('ldlCondutaHTML', fonte) + '\n'
    + corpo('ldlQuadroHTML', fonte) + '\n'
    + corpo('ldlAlvoHTML', fonte), ctx);
  return ctx;
}
const M = mundo();
const paciente = (o) => Object.assign({ pv_sexo: '0', pv_idade: '60', pv_dm: '0', pv_ct: '200', pv_hdl: '50', pv_est: '0' }, o);
const semTag = (s) => String(s).replace(/<[^>]+>/g, '');
// A frase da distância até a meta ("… precisa cair ≥ N%: esquema (reduz …)."),
// isolada do quadro e da conduta por categoria, que também citam os fármacos.
const esquema = (h) => (h.match(/precisa cair <b>≥ (\d+)%<\/b>(.*?)\)\./) || [])[2] || '';

// (1) esquema inicial por categoria, pela tabela de recomendações
ok(/estatina de alta intensidade \+ ezetimiba/.test(M.ldlConduta('alto')) && /desde já/.test(M.ldlConduta('alto')), '(1) alto risco: estatina de alta intensidade + ezetimiba desde o início');
ok(/anti-PCSK9 conforme a meta/.test(M.ldlConduta('muitoalto')), '(1) muito alto: anti-PCSK9 conforme a meta');
ok(/alta intensidade \+ ezetimiba \+ anti-PCSK9/.test(M.ldlConduta('extremo')), '(1) extremo: os três desde o início');
ok(/30 mg\/dL ou mais acima da meta/.test(M.ldlConduta('baixo')) && /30 mg\/dL ou mais acima da meta/.test(M.ldlConduta('intermediario')), '(1) baixo e intermediário: o gatilho dos 30');
ok(!/anti-PCSK9/.test(M.ldlConduta('baixo')), '(1) o baixo risco não começa por anti-PCSK9');

// (2) a coluna TERAPIA INICIAL no quadro
{
  const q = M.ldlQuadroHTML('alto');
  ok(/TERAPIA INICIAL/.test(M.LDL_COLS), '(2) o cabeçalho do quadro perdeu a coluna TERAPIA INICIAL');
  ['baixo', 'intermediario', 'alto', 'muitoalto', 'extremo'].forEach((k) => {
    ok(typeof M.LDL_METAS[k].terapia === 'string' && M.LDL_METAS[k].terapia.length > 10 && q.indexOf(M.LDL_METAS[k].terapia) >= 0, '(2) a linha ' + k + ' do quadro não mostra a terapia inicial');
  });
  ok(/min-width:70rem/.test(q), '(2) sete colunas precisam de mais largura mínima (70rem) para rolar em vez de espremer');
}

// (3) redução que falta → esquema
const E = M.ldlEsquemaPelaReducao;
ok(E(NaN, false) === '' && E(0, false) === '' && E(-5, false) === '', '(3) sem redução a fazer, sem esquema');
ok(/moderada intensidade/.test(E(25, false)) && !/alta intensidade/.test(E(25, false)), '(3) 25%: estatina de moderada intensidade');
ok(/^<b>estatina de alta intensidade<\/b>/.test(E(40, false)), '(3) 40%: estatina de alta intensidade');
ok(/alta intensidade \+ ezetimiba<\/b> \(reduz até 65%\)/.test(E(60, false)), '(3) 60%: alta intensidade + ezetimiba');
ok(/ezetimiba \+ anti-PCSK9/.test(E(70, false)), '(3) 70%: alta intensidade + ezetimiba + anti-PCSK9');
ok(/ezetimiba<\/b> \(≈ 24% a mais\)/.test(E(20, true)) && !/anti-PCSK9/.test(E(20, true)), '(3) em uso de estatina, 20% a mais vem da ezetimiba');
ok(/^associar <b>anti-PCSK9<\/b>/.test(E(40, true)), '(3) em uso de estatina, 40% a mais pede anti-PCSK9');
ok(/ezetimiba \+ anti-PCSK9/.test(E(60, true)), '(3) em uso de estatina, 60% a mais pede ezetimiba + anti-PCSK9');
{
  // alto risco (LDL-c ≥ 190), LDL-c 200: (200 − 70)/200 = 65% → esquema triplo
  const h = M.ldlAlvoHTML(2, paciente({ pv_ldl: '200' }));
  ok(/Conduta terapêutica · SBC 2025/.test(h), '(3) o bloco de conduta não apareceu');
  ok(/precisa cair <b>≥ 65%<\/b>/.test(h), '(3) a redução que falta (65%) não apareceu');
  ok(/alta intensidade \+ ezetimiba \+ anti-PCSK9/.test(esquema(h)), '(3) com 65% a cair, o esquema tinha de ser o triplo: ' + esquema(h));
  // 150: (150 − 70)/150 = 53,3% → alta + ezetimiba
  const h2 = M.ldlAlvoHTML(25, paciente({ pv_ldl: '150' }));
  ok(/≥ 54%/.test(h2) && /alta intensidade \+ ezetimiba<\/b> \(reduz até 65%/.test(esquema(h2)), '(3) com 54% a cair: alta intensidade + ezetimiba: ' + esquema(h2));
  // em uso de estatina, alto risco, LDL-c 85: (85 − 70)/85 = 17,6% → ezetimiba
  const h3 = M.ldlAlvoHTML(25, paciente({ pv_ldl: '85', pv_est: '1' }));
  ok(/além do que a estatina atual já faz/.test(h3) && /associar <b>ezetimiba<\/b>/.test(esquema(h3)), '(3) em uso de estatina, 18% a mais: ezetimiba: ' + esquema(h3));
  ok(!/Mesmo assim, nesta categoria/.test(h3), '(3) a ressalva da combinação inicial é para quem ainda não trata');
  // alto risco sem tratamento com pouca distância: a diretriz começa pela combinação mesmo assim
  const h4 = M.ldlAlvoHTML(25, paciente({ pv_ldl: '90' }));
  ok(/Mesmo assim, nesta categoria a diretriz começa pela combinação acima/.test(h4), '(3) no alto risco sem tratamento, distância pequena não dispensa a combinação inicial');
}

// (4) baixo/intermediário a menos de 30 da meta
{
  const h = M.ldlAlvoHTML(2, paciente({ pv_ldl: '130' })); // baixo, meta 115, +15
  ok(/ainda sem gatilho farmacológico/.test(h) && !/precisa cair/.test(h), '(4) a 15 mg/dL da meta no baixo risco não há fármaco');
  // ⚠️ EXPECTATIVA ATUALIZADA em 24/10/2026: antes "≥ 24%" (só a distância até a
  // meta: (150 − 115)/150). A meta e a redução mínima valem JUNTAS — Figura 5.1:
  // "ALVO < 115 mg/dL e redução ≥ 30%"; §5.1: "além das metas específicas, a adoção
  // de uma redução percentual mínima do LDL-c" (Tabela 5.1, coluna da redução).
  // Com gatilho, o alvo é 150 × 0,7 = 105, e a queda pedida é 30%, que a estatina
  // de moderada intensidade (30%, Figura 7.2) alcança.
  const h2 = M.ldlAlvoHTML(2, paciente({ pv_ldl: '150' })); // +35 → alvo ≤ 105 → 30% → moderada
  ok(/precisa cair <b>≥ 30%<\/b>/.test(h2) && /alvo ≤ 105 mg\/dL/.test(h2) && /moderada intensidade/.test(h2), '(4) a 35 mg/dL da meta no baixo risco: redução mínima de 30% (alvo ≤ 105), estatina de moderada intensidade');
  const h3 = M.ldlAlvoHTML(2, paciente({ pv_ldl: '90' }));
  ok(/já abaixo da meta/.test(h3), '(4) LDL-c abaixo da meta: manter');
}

// (5) tabela de doses
{
  const h = M.ldlAlvoHTML(25, paciente({}));
  ['atorvastatina 40–80 mg ou rosuvastatina 20–40 mg', 'sinvastatina 20–40', 'pitavastatina 2–4', '10 mg/dia, junto da estatina', '180 mg/dia',
   'evolocumabe 140 mg SC a cada 2 semanas ou 420 mg ao mês', 'alirocumabe 75–150 mg SC a cada 2 semanas', '284 mg SC no início, aos 3 meses e depois a cada 6 meses']
    .forEach((d) => ok(h.indexOf(d) >= 0, '(5) sumiu da tabela de doses: ' + d));
  ok(M.LDL_DOSES.length === 6, '(5) a tabela de doses tem seis grupos');
  ok(/4 a 6 semanas/.test(h), '(5) o prazo de reavaliação sumiu');
  ok(/Intolerância à estatina: ácido bempedoico \+ ezetimiba/.test(h), '(5) a conduta na intolerância sumiu');
  ok(/alta intensidade/.test(semTag(h)) && !/alta potência/.test(semTag(h)), '(5) o vocabulário é o da diretriz: intensidade, não potência');
}

// (6) o bloco está na tela do PREVENT, e (7) um só style por elemento
{
  const i = html.indexOf("{id:'prevent',name:'Risco CV — PREVENT (AHA)'");
  const bloco = html.slice(i, html.indexOf("{id:'prevent30'", i));
  ok(/extra:function\(s,v\)\{try\{return ldlAlvoHTML\(s,v\);\}/.test(bloco), '(6) o PREVENT parou de chamar o bloco de meta e conduta');
  ok(/ldlCondutaHTML\(cat,m,ldl,String\(v\.pv_est\|\|'0'\)==='1'\)/.test(corpo('ldlAlvoHTML')), '(6) o uso de estatina do formulário não chega à conduta');
  const h = M.ldlAlvoHTML(25, paciente({ pv_ldl: '150', pv_est: '1' }));
  ok(!/<div[^>]*style="[^"]*"[^>]*style="/.test(h), '(7) elemento com DOIS atributos style: o segundo é ignorado');
}

// Mutações
function mutante(fn, de, para) {
  const alvo = corpo(fn);
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica: ' + de);
  return mundo(html.replace(alvo, alvo.replace(de, para)));
}
// 24/10/2026: os cortes do esquema moraram para `ldlEsquemaNivel` e o gatilho para
// `sbcAlvoLDL`; as mutações seguem a mesma intenção, no lugar novo.
ok(!/ezetimiba \+ anti-PCSK9/.test(esquema(mutante('ldlEsquemaNivel', 'cabe(65)', 'cabe(75)').ldlAlvoHTML(2, paciente({ pv_ldl: '200' })))),
  'MUTAÇÃO: subir o corte do esquema triplo de 65 para 75 tinha de tirar o triplo do LDL-c 200 — a asserção do caso (3) não vigia o corte');
ok(!/além do que a estatina atual já faz/.test(mutante('ldlCondutaHTML', "(emEstatina?' <b>além do que a estatina atual já faz</b>':'')", "''").ldlAlvoHTML(25, paciente({ pv_ldl: '85', pv_est: '1' }))),
  'MUTAÇÃO: apagar a frase do uso de estatina tinha de aparecer');
ok(!/ainda sem gatilho/.test(mutante('sbcAlvoLDL', '(ldl-m.ldl)>=30', '(ldl-m.ldl)>=0').ldlAlvoHTML(2, paciente({ pv_ldl: '130' }))),
  'MUTAÇÃO: tirar o gatilho dos 30 tinha de mudar o baixo risco a 15 da meta');

if (falhas.length) { console.error('test-conduta-lipidica: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-conduta-lipidica: ok (esquema inicial por categoria, coluna no quadro, redução que falta → esquema, gatilho dos 30, doses e posologia, fiação no PREVENT)');
