// RISCO CV E METAS — SBC 2025 (24/10/2026): a calculadora nova, o motor único
// de estratificação que ela divide com o PREVENT, e o PREVENT com DAC, AVC e a
// errata de 14/10/2026.
//
// Pedido do professor (22/10): uma calculadora de risco cardiovascular feita a
// partir da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose
// 2025 (SBC; Arq Bras Cardiol 2025;122(9):e20250640), com o MOTIVO da categoria,
// o PREVENT de 10 e 30 anos, metas, redução necessária, estratégias e cartões de
// PA, peso, glicemia e tabagismo. As regras foram conferidas no texto da diretriz
// (T4.1–T4.8, F4.1, F5.1, T5.1, F7.2); os casos de F1 a F27 abaixo são os
// "casos-ouro" derivados delas.
//
// 🧨 O QUE ESTE TESTE PRENDE:
// (1) PREVENT: os cinco desfechos (DCV, DASCV, IC, DAC, AVC) de 10 e 30 anos
//     batem com a Tabela S12 de Khan 2024 (modelos sem HbA1c) e com os testes do
//     preventr 0.12.1 (com HbA1c, JÁ COM A ERRATA), a ±0,05 p.p.; a hierarquia
//     DAC/AVC < DASCV < DCV vale nos casos de referência, mas a tela NÃO a impõe
//     (num extremo o AVC passa da DASCV e é mostrado como sai);
// (2) o motor: cada categoria e cada regra (F1–F27), as fronteiras (F22), e
//     "Não sei" que NÃO derruba a categoria — vira pendência "pode subir";
// (3) o alvo de LDL-c: meta e redução mínima juntas (F5.1), meta estrita, gatilho
//     no LDL-c OU no não-HDL-c; as estratégias da Figura 7.2, com a redução
//     relativa de quem já trata (A.6);
// (4) a tela: PREVENT só de 30 a 79 sem doença aterosclerótica (e o de 30 anos só
//     até 59), a conta da redução, os cartões com fonte, um `style` por elemento,
//     campo escapado;
// (5) a fiação: o cartão antes do PREVENT, o caminho `render` de `openCalc`, e o
//     bloco de metas do PREVENT chamando o MESMO motor;
// (6) mutações que cada asserção tem de pegar;
// (7) a revisão independente de 24/10 (commit b9ebf1b), um teste por item: A1 sexo
//     em branco no DM2; A2 esquema fora da Figura 7.2; M1 SCA recente × evento
//     < 2 anos; M2 "sem tratamento" menor que o atual; M3 não-HDL-c do alto para
//     cima; B1 ganho arredondado; B2 LDL-c igual à meta; B3 79–80 e 59–60 anos;
//     B4 duração pelo ano; B5 80 anos com diabetes; B6 diálise peritoneal; B7
//     textos; B8 TFGe < 60 e PAS < 110 nas referências do PREVENT. A varredura do
//     "não sei" passou a cobrir sexo, LDL-c sem tratamento, a coerência SCA × 2
//     anos e os 80 anos.
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
  return src.slice(i + 1, src.indexOf(fim, i) + fim.length);
}
function linhaVar(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf('\n', i + 1));
}
// 31/10/2026: a calculadora deixou de estimar o LDL-c por Martin/Hopkins (sem
// triglicérides, como a fórmula original); a estimativa segue na calculadora própria,
// testada em test-ldl-martin-hopkins.js. Entram o FIB-4 (`fib4Calc`, `fib4Faixa`) e o
// destaque do risco em 10 anos no formato da fórmula original (`rcvDestaqueHTML`, `rcvSemEscore`).
const FUNCOES = ['ckdEpi2021', 'preventRisk', 'sbcN', 'sbcRenalDM', 'fib4Calc', 'fib4Faixa', 'sbcEstratifica', 'sbcDadosDoPrevent', 'sbcCategoria', 'sbcPendenciasHTML',
  'ldlConduta', 'ldlEsquemaNivel', 'ldlEsquemaPelaReducao', 'ldlDosesHTML', 'sbcAlvoLDL', 'ldlCondutaHTML', 'ldlFaixaEscore', 'ldlQuadroHTML', 'ldlAlvoHTML',
  'rcvDados', 'rcvSeg', 'rcvChips', 'rcvNum', 'rcvFormHTML', 'rcvVisivel', 'rcvSemEscore', 'rcvDestaqueHTML', 'rcvCategoriaHTML', 'rcvPreventHTML', 'rcvMetasHTML',
  'rcvEstrategiasHTML', 'rcvCartoesHTML', 'rcvVazio', 'rcvResultadoHTML', 'rcvResumoDados'];
function mundo(fonte) {
  const ctx = vm.createContext({});
  vm.runInContext(
    'function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}\n'
    + linhaVar('PREVENT_COEFS', fonte) + '\n' + trechoVar('PREVENT_AUG', '\n};', fonte) + '\n'
    + trechoVar('LDL_METAS', '\n};', fonte) + '\n' + linhaVar('SBC_ORD', fonte) + '\n' + linhaVar('SBC_COR', fonte) + '\n'
    + linhaVar('LDL_FAIXA_F', fonte) + '\n' + linhaVar('LDL_COLS', fonte) + '\n' + trechoVar('LDL_DOSES', '\n];', fonte) + '\n'
    + trechoVar('RCV_ESTRATEGIAS', '\n];', fonte) + '\n' + linhaVar('RCV_META_PA', fonte) + '\n'
    + FUNCOES.map((n) => corpo(n, fonte)).join('\n')
    + '\nthis.PREVENT_AUG=PREVENT_AUG;this.LDL_METAS=LDL_METAS;this.SBC_ORD=SBC_ORD;this.SBC_COR=SBC_COR;this.RCV_ESTRATEGIAS=RCV_ESTRATEGIAS;', ctx);
  return ctx;
}
const M = mundo();
const ix = (k) => M.SBC_ORD.indexOf(k);

// ───────────────────── (1) PREVENT: cinco desfechos e a errata ─────────────────────
// Valores de referência (fração): Tabela S12 de Khan 2024 (testes do PooledCohort,
// 4 casas; só os modelos SEM HbA1c, que a errata não tocou) e testes do preventr
// 0.12.1 (3 casas; com HbA1c, os valores POSTERIORES à errata). Ordem: DCV total,
// DASCV, IC, DAC, AVC.
const OUT = ['cvd', 'ascvd', 'hf', 'chd', 'stroke'];
const S12 = { age: 50, tc: 200, hdl: 45, sbp: 160, dm: 1, smk: 0, bmi: 35, egfr: 90, bptx: 1, statin: 0 };
const com = (o) => Object.assign({}, S12, o);
const REF = [
  // [nome, paciente, sexo, horizonte, valores]
  ['S12 base', S12, 'f', 10, [.1468, .092, .0806, .0441, .0540]], ['S12 base', S12, 'm', 10, [.1632, .1019, .1059, .0557, .0521]],
  ['S12 base', S12, 'f', 30, [null, .354]], ['S12 base', S12, 'm', 30, [null, .349]],
  ['S12 +RAC 40', com({ uacr: 40 }), 'f', 10, [.1599, .0994, .0893, .0481, .0586]], ['S12 +RAC 40', com({ uacr: 40 }), 'm', 10, [.1718, .1097, .1099, .0591, .0559]],
  ['S12 +RAC 40', com({ uacr: 40 }), 'f', 30, [null, .363]], ['S12 +RAC 40', com({ uacr: 40 }), 'm', 30, [null, .355]],
  ['preventr base', S12, 'f', 10, [.147, .092, .081, .044, .054]], ['preventr base', S12, 'f', 30, [.53, .354, .39, .198, .221]],
  ['preventr base', S12, 'm', 10, [.163, .102, .106, .056, .052]], ['preventr base', S12, 'm', 30, [.514, .349, .424, .216, .197]],
  ['preventr +HbA1c 9,2 (errata)', com({ hba1c: 9.2 }), 'f', 10, [.181, .112, .106, .054, .067]], ['preventr +HbA1c 9,2 (errata)', com({ hba1c: 9.2 }), 'f', 30, [.557, .378, .433, .214, .241]],
  ['preventr +HbA1c 9,2 (errata)', com({ hba1c: 9.2 }), 'm', 10, [.185, .117, .124, .061, .063]], ['preventr +HbA1c 9,2 (errata)', com({ hba1c: 9.2 }), 'm', 30, [.525, .36, .442, .212, .214]],
  ['preventr +RAC 92', com({ uacr: 92 }), 'f', 10, [.181, .111, .105, .055, .065]], ['preventr +RAC 92', com({ uacr: 92 }), 'f', 30, [.565, .381, .437, .22, .241]],
  ['preventr +RAC 92', com({ uacr: 92 }), 'm', 10, [.195, .123, .13, .066, .063]], ['preventr +RAC 92', com({ uacr: 92 }), 'm', 30, [.535, .368, .448, .227, .213]],
  ['preventr completo SDI 3 (errata)', com({ hba1c: 9.2, uacr: 92, sdi: 3 }), 'f', 10, [.181, .112, .108, .054, .067]], ['preventr completo SDI 3 (errata)', com({ hba1c: 9.2, uacr: 92, sdi: 3 }), 'f', 30, [.539, .367, .42, .21, .235]],
  ['preventr completo SDI 3 (errata)', com({ hba1c: 9.2, uacr: 92, sdi: 3 }), 'm', 10, [.185, .115, .12, .063, .058]], ['preventr completo SDI 3 (errata)', com({ hba1c: 9.2, uacr: 92, sdi: 3 }), 'm', 30, [.509, .345, .42, .214, .193]],
  ['preventr IMC 28', com({ bmi: 28 }), 'f', 10, [.147, .092, .061, .044, .054]], ['preventr IMC 28', com({ bmi: 28 }), 'f', 30, [.53, .354, .326, .198, .221]],
  ['preventr IMC 28 +HbA1c 9 (errata)', com({ bmi: 28, hba1c: 9 }), 'f', 10, [.176, .109, .079, .052, .065]], ['preventr IMC 28 +HbA1c 9 (errata)', com({ bmi: 28, hba1c: 9 }), 'f', 30, [.552, .373, .361, .21, .237]],
  ['preventr IMC 28 +RAC 460', com({ bmi: 28, uacr: 460 }), 'f', 10, [.228, .137, .11, .069, .081]], ['preventr IMC 28 +RAC 460', com({ bmi: 28, uacr: 460 }), 'f', 30, [.61, .416, .426, .248, .265]],
  ['preventr IMC 28 completo SDI 6 (errata)', com({ bmi: 28, hba1c: 9, uacr: 460, sdi: 6 }), 'f', 10, [.242, .149, .122, .076, .087]], ['preventr IMC 28 completo SDI 6 (errata)', com({ bmi: 28, hba1c: 9, uacr: 460, sdi: 6 }), 'f', 30, [.601, .419, .423, .253, .268]],
];
[['59a', {}, [.211, .134, .146, .075, .07], [.518, .355, .433, .222, .203]],
  ['+PAS 148', { sbp: 148 }, [.187, .117, .127, .066, .059], [.487, .325, .402, .204, .178]],
  ['+sem anti-HAS', { sbp: 148, bptx: 0 }, [.153, .1, .102, .06, .047], [.437, .299, .35, .196, .152]],
  ['+CT 189', { sbp: 148, bptx: 0, tc: 189 }, [.151, .096, .102, .056, .046], [.433, .29, .35, .185, .151]],
  ['+HDL 60', { sbp: 148, bptx: 0, hdl: 60 }, [.136, .084, .102, .045, .044], [.401, .258, .35, .151, .145]],
  ['+estatina', { sbp: 148, bptx: 0, hdl: 60, statin: 1 }, [.123, .079, .102, .043, .04], [.399, .263, .35, .159, .144]],
  ['+sem DM', { sbp: 148, bptx: 0, hdl: 60, statin: 1, dm: 0 }, [.067, .043, .048, .023, .023], [.301, .194, .236, .112, .107]],
  ['+fumante', { sbp: 148, bptx: 0, hdl: 60, statin: 1, dm: 0, smk: 1 }, [.096, .06, .074, .032, .032], [.334, .213, .271, .122, .119]],
  ['+TFGe 67', { sbp: 148, bptx: 0, hdl: 60, statin: 1, dm: 0, smk: 1, egfr: 67 }, [.099, .062, .076, .033, .033], [.355, .228, .291, .132, .128]],
].forEach(([n, mod, e10, e30]) => { const p = com(Object.assign({ age: 59 }, mod)); REF.push(['preventr homem ' + n, p, 'm', 10, e10], ['preventr homem ' + n, p, 'm', 30, e30]); });
// Revisão de 24/10 (B8): TFGe < 60 e PAS < 110 — os termos egfr_lt_60 e sbp_lt_110 e a
// interação idade × TFGe < 60 (por isso dois perfis de idade) —, nos quatro modelos,
// para prender também os coeficientes de DAC e AVC desses termos, que os casos acima
// (TFGe ≥ 60, PAS ≥ 110) não exercitam. Esperados: preventr 0.12.1 (tabelas do
// sysdata.rda), calculados pela implementação independente em Python
// (calc-risco/tools/gera-ref-b8.py sobre confere-independente.py; o R não está na
// máquina). Fração com 6 casas; o de 30 anos só até 59 anos.
const B8_PERFIL = { 'TFGe 45': { egfr: 45 }, 'PAS 100': { sbp: 100 }, '65a TFGe 45': { age: 65, egfr: 45 } };
const B8_MODELO = { base: {}, uacr: { uacr: 40 }, hba1c: { hba1c: 7.5 }, full: { uacr: 40, hba1c: 7.5 } };
const B8 = [
  ['TFGe 45', 'base', 'f', 10, [.271629, .162404, .184831, .082312, .098132]], ['TFGe 45', 'base', 'f', 30, [.619753, .416930, .515201, .243608, .269621]],
  ['TFGe 45', 'base', 'm', 10, [.271549, .153784, .214121, .084943, .084470]], ['TFGe 45', 'base', 'm', 30, [.587165, .379666, .535209, .236456, .226585]],
  ['TFGe 45', 'uacr', 'f', 10, [.264620, .158438, .176753, .079756, .096123]], ['TFGe 45', 'uacr', 'f', 30, [.610525, .409242, .504192, .238045, .265764]],
  ['TFGe 45', 'uacr', 'm', 10, [.248988, .146086, .185536, .078971, .079370]], ['TFGe 45', 'uacr', 'm', 30, [.561493, .369831, .496397, .226802, .219964]],
  ['TFGe 45', 'hba1c', 'f', 10, [.265708, .155532, .183740, .075866, .094252]], ['TFGe 45', 'hba1c', 'f', 30, [.600231, .395596, .504063, .222488, .255576]],
  ['TFGe 45', 'hba1c', 'm', 10, [.260491, .146936, .202292, .078479, .082088]], ['TFGe 45', 'hba1c', 'm', 30, [.565810, .360420, .513675, .213857, .218446]],
  ['TFGe 45', 'full', 'f', 10, [.259120, .153521, .174682, .074672, .093288]], ['TFGe 45', 'full', 'f', 30, [.586656, .390252, .484846, .220491, .254862]],
  ['TFGe 45', 'full', 'm', 10, [.233124, .135417, .170113, .071642, .076069]], ['TFGe 45', 'full', 'm', 30, [.531492, .341556, .463248, .201978, .207379]],
  ['PAS 100', 'base', 'f', 10, [.076386, .040039, .048622, .021699, .020795]], ['PAS 100', 'base', 'f', 30, [.352555, .187158, .281489, .110583, .098576]],
  ['PAS 100', 'base', 'm', 10, [.093611, .053197, .060770, .031791, .021648]], ['PAS 100', 'base', 'm', 30, [.353654, .207382, .291378, .133602, .090465]],
  ['PAS 100', 'uacr', 'f', 10, [.089248, .045885, .059823, .025236, .023760]], ['PAS 100', 'uacr', 'f', 30, [.376538, .199639, .315635, .120356, .105839]],
  ['PAS 100', 'uacr', 'm', 10, [.106600, .061022, .070964, .035917, .024826]], ['PAS 100', 'uacr', 'm', 30, [.367470, .218833, .309730, .140101, .096458]],
  ['PAS 100', 'hba1c', 'f', 10, [.077238, .039634, .051045, .020945, .020633]], ['PAS 100', 'hba1c', 'f', 30, [.343875, .179449, .284828, .103918, .094935]],
  ['PAS 100', 'hba1c', 'm', 10, [.089286, .050629, .057466, .029285, .021102]], ['PAS 100', 'hba1c', 'm', 30, [.335915, .194807, .278504, .119185, .087238]],
  ['PAS 100', 'full', 'f', 10, [.089245, .045271, .059544, .023427, .023896]], ['PAS 100', 'full', 'f', 30, [.362432, .192002, .301973, .110281, .104354]],
  ['PAS 100', 'full', 'm', 10, [.102167, .057636, .065789, .035100, .023411]], ['PAS 100', 'full', 'm', 30, [.352874, .204894, .290142, .133322, .089021]],
  ['65a TFGe 45', 'base', 'f', 10, [.322276, .186552, .236343, .101065, .106335]], ['65a TFGe 45', 'base', 'm', 10, [.333702, .202151, .276874, .123388, .106157]],
  ['65a TFGe 45', 'uacr', 'f', 10, [.326247, .189084, .240777, .102826, .108586]], ['65a TFGe 45', 'uacr', 'm', 10, [.319981, .199150, .255358, .119968, .104983]],
  ['65a TFGe 45', 'hba1c', 'f', 10, [.330266, .189810, .250829, .102066, .108915]], ['65a TFGe 45', 'hba1c', 'm', 10, [.336795, .203810, .280511, .117905, .110883]],
  ['65a TFGe 45', 'full', 'f', 10, [.325143, .188186, .247157, .102952, .109806]], ['65a TFGe 45', 'full', 'm', 10, [.316636, .193637, .249039, .111916, .105674]],
];
B8.forEach(([pf, mo, sx, hz, vals]) => REF.push(['preventr B8 ' + pf + ' (' + mo + ')', com(Object.assign({}, B8_PERFIL[pf], B8_MODELO[mo])), sx, hz, vals]));

const V = (p, sx) => ({ pv_sexo: sx === 'm' ? '1' : '0', pv_idade: String(p.age), pv_ct: String(p.tc), pv_hdl: String(p.hdl), pv_pas: String(p.sbp), pv_egfr: String(p.egfr),
  pv_imc: String(p.bmi), pv_dm: p.dm ? '1' : '0', pv_fum: p.smk ? '1' : '0', pv_ahas: p.bptx ? '1' : '0', pv_est: p.statin ? '1' : '0',
  pv_uacr: p.uacr != null ? String(p.uacr) : '', pv_hba1c: p.hba1c != null ? String(p.hba1c) : '' });
// O app não tem SDI (índice socioeconômico por CEP dos EUA): usa sempre "SDI
// ausente". Os casos de referência do modelo completo informam SDI; para eles a
// conta é refeita aqui, com os COEFICIENTES DO APP e só os três termos de SDI
// diferentes — e a fidelidade desta cópia é conferida contra o `preventRisk` real.
function riscoComSDI(v, sdi) {
  const male = v.pv_sexo === '1', age = +v.pv_idade, ct = +v.pv_ct, hdl = +v.pv_hdl, sbp = +v.pv_pas, egfr = +v.pv_egfr, bmi = +v.pv_imc;
  const dm = v.pv_dm === '1' || v.pv_dm === '2' ? 1 : 0, smk = +v.pv_fum, ahas = +v.pv_ahas, stat = +v.pv_est;
  const a = (age - 55) / 10, nonhdl = (ct - hdl) * 0.02586 - 3.5, hdlt = (hdl * 0.02586 - 1.3) / 0.3, sbpge = (Math.max(sbp, 110) - 130) / 20, egfrlt = (Math.min(egfr, 60) - 60) / -15, bmigt = (Math.max(bmi, 30) - 30) / 5;
  const uacr = parseFloat(v.pv_uacr), hba1c = parseFloat(v.pv_hba1c), hasU = isFinite(uacr) && uacr > 0, hasH = isFinite(hba1c) && hba1c > 0, hasS = sdi != null;
  const tv = { age: a, age_squared: a * a, non_hdl_c: nonhdl, hdl_c: hdlt, sbp_lt_110: (Math.min(sbp, 110) - 110) / 20, sbp_gte_110: sbpge, dm, smoking: smk, bmi_lt_30: (Math.min(bmi, 30) - 25) / 5,
    bmi_gte_30: bmigt, egfr_lt_60: egfrlt, egfr_gte_60: (Math.max(egfr, 60) - 90) / -15, bp_tx: ahas, statin: stat, bp_tx_sbp_gte_110: ahas * sbpge, statin_non_hdl_c: stat * nonhdl,
    age_non_hdl_c: a * nonhdl, age_hdl_c: a * hdlt, age_sbp_gte_110: a * sbpge, age_dm: a * dm, age_smoking: a * smk, age_bmi_gte_30: a * bmigt, age_egfr_lt_60: a * egfrlt,
    sdi_4_to_6: hasS && sdi >= 4 && sdi <= 6 ? 1 : 0, sdi_7_to_10: hasS && sdi >= 7 ? 1 : 0, missing_sdi: hasS ? 0 : 1,
    ln_uacr: hasU ? Math.log(uacr) : 0, missing_uacr: hasU ? 0 : 1, hba1c_dm: hasH && dm ? hba1c - 5.3 : 0, hba1c_no_dm: hasH && !dm ? hba1c - 5.3 : 0, missing_hba1c: hasH ? 0 : 1, constant: 1 };
  const model = hasU && hasH ? 'full' : (hasU ? 'uacr' : 'hba1c'), sx = male ? 'm' : 'f', r = { model };
  for (const hz of ['10yr', '30yr']) for (const o of OUT) {
    const t = M.PREVENT_AUG[model + '_' + hz], co = t[sx][o]; let s = 0;
    t.k.forEach((k, i) => { s += co[i] * tv[k]; });
    r[o + (hz === '30yr' ? '30' : '')] = Math.exp(s) / (1 + Math.exp(s)) * 100;
  }
  return r;
}
{
  let n = 0, maxDif = 0, fid = 0, fidMax = 0;
  for (const [nome, p, sx, hz, vals] of REF) {
    const v = V(p, sx);
    const r = p.sdi != null ? riscoComSDI(v, p.sdi) : M.preventRisk(v);
    if (p.sdi == null && (p.uacr != null && p.hba1c != null)) { const c = riscoComSDI(v, null), a = M.preventRisk(v); OUT.forEach((o) => { fid++; fidMax = Math.max(fidMax, Math.abs(c[o] - a[o]), Math.abs(c[o + '30'] - a[o + '30'])); }); }
    vals.forEach((esp, i) => {
      if (esp == null) return;
      const k = OUT[i] + (hz === 30 ? '30' : ''), calc = r[k], dif = Math.abs(calc - esp * 100);
      n++; maxDif = Math.max(maxDif, dif);
      ok(dif < 0.05, '(1) PREVENT ' + nome + ' ' + sx + ' ' + hz + 'a ' + OUT[i] + ': esperado ' + (esp * 100).toFixed(2) + '%, calculado ' + calc.toFixed(4) + '% (±0,05 p.p.)');
    });
  }
  // A cópia com SDI só vale se, sem SDI, der o MESMO número do app (sem HbA1c+RAC
  // ela não é usada; o caso abaixo cobre o modelo completo).
  { const v = V(com({ hba1c: 7.5, uacr: 40 }), 'f'), c = riscoComSDI(v, null), a = M.preventRisk(v); OUT.forEach((o) => { fid++; fidMax = Math.max(fidMax, Math.abs(c[o] - a[o]), Math.abs(c[o + '30'] - a[o + '30'])); }); }
  ok(fid > 0 && fidMax < 1e-9, '(1) a cópia do modelo completo com SDI não reproduz o preventRisk do app sem SDI (dif ' + fidMax + ')');
  ok(n === 434, '(1) a tabela de referência perdeu valores (eram 434: 234 + 200 da revisão B8): ' + n);
  // B8: cada perfil novo caiu no modelo pedido (base, +RAC, +HbA1c, completo).
  ok(B8.length === 40 && B8.every(([pf, mo, sx]) => M.preventRisk(V(com(Object.assign({}, B8_PERFIL[pf], B8_MODELO[mo])), sx)).model === mo), '(1) B8: os perfis de TFGe < 60 e PAS < 110 têm de passar pelos quatro modelos');
  // ⚠️ A errata: com HbA1c, os coeficientes "com diabetes" e "sem diabetes" estavam
  // trocados. Antes dela o AVC em 10 anos da mulher S12 com HbA1c 9,2 saía 5,3%; o
  // certo é 6,7% (preventr 0.12.1).
  const e = M.preventRisk(V(com({ hba1c: 9.2 }), 'f'));
  ok(Math.abs(e.stroke - 6.7) < 0.05 && Math.abs(e.stroke - 5.3) > 1, '(1) ⚠️ a errata de 14/10/2026 não está aplicada: AVC 10a da S12 com HbA1c 9,2 deu ' + e.stroke.toFixed(2) + '% (pós-errata 6,7; pré 5,3)');
  ok(e.model === 'hba1c' && M.preventRisk(V(S12, 'f')).model === 'base', '(1) o modelo usado tem de vir no retorno');
  // DM1 é "diabetes" para a equação (pv_dm 2 = tipo 1).
  const d1 = M.preventRisk(Object.assign(V(S12, 'm'), { pv_dm: '2' })), d2 = M.preventRisk(V(S12, 'm'));
  ok(Math.abs(d1.ascvd - d2.ascvd) < 1e-12 && Math.abs(d1.chd30 - d2.chd30) < 1e-12, '(1) pv_dm = 2 (tipo 1) tem de entrar no PREVENT como diabetes');
}
// Hierarquia: DAC e AVC abaixo da DASCV, DASCV e IC abaixo da DCV total — em todos
// os casos de referência. ⚠️ Mas é propriedade dos dados, não do modelo: cada
// desfecho é uma regressão à parte, e num extremo (31 anos, TFGe 15, PAS 193) o
// AVC passa da DASCV. A tela mostra como sai e avisa; não "conserta" a ordem.
{
  let viol = 0;
  for (const [, p, sx] of REF) {
    const r = p.sdi != null ? riscoComSDI(V(p, sx), p.sdi) : M.preventRisk(V(p, sx));
    ['', '30'].forEach((s) => { if (!(r['chd' + s] < r['ascvd' + s] && r['stroke' + s] < r['ascvd' + s] && r['ascvd' + s] < r['cvd' + s] && r['hf' + s] < r['cvd' + s])) viol++; });
  }
  ok(viol === 0, '(1) DAC/AVC < DASCV < DCV (e IC < DCV) falhou em ' + viol + ' caso(s) de referência');
  const ext = M.preventRisk({ pv_sexo: '1', pv_idade: '31', pv_ct: '151', pv_hdl: '73', pv_pas: '193', pv_egfr: '15', pv_imc: '33.6', pv_dm: '0', pv_fum: '1', pv_ahas: '1', pv_est: '0' });
  ok(ext.stroke > ext.ascvd, '(1) o perfil extremo de referência deixou de inverter AVC × DASCV — alguém "consertou" a ordem? (AVC ' + ext.stroke.toFixed(1) + ', DASCV ' + ext.ascvd.toFixed(1) + ')');
  const e = { sexo: 'M', idade: '31', peso: '97', altura: '170', ct: '151', hdl: '73', pas: '193', pad: '100', cr: '5.5', tab: 'sim', has: 'sim', ahas: 'sim', est: 'nao', dm: 'nao', ev: 'nao' };
  const x = M.rcvDados(e, 2026), h = M.rcvPreventHTML(x);
  ok(x.r && x.r.stroke > x.r.ascvd && /fora da ordem esperada/.test(h) && h.indexOf(M.sbcN(x.r.stroke, 2) + '%') > 0,
    '(1) com AVC acima da DASCV a tela tem de mostrar os dois números como saem e avisar que a ordem inverteu');
}

// ───────────────────── (2) o motor: casos-ouro F1–F27 ─────────────────────
const base = () => ({ trat: { estatina: 'nao', eze: false, abp: false, pcsk9: false }, dcva: false, dm: 'nenhum', ag: {}, tabagismo: false, has: false, hf: false, aaa: false });
function E(o) { const d = base(); Object.keys(o).forEach((k) => { d[k] = o[k]; }); return M.sbcEstratifica(d); }
const OURO = [
  // [id, entrada, categoria, regex do motivo, regex da fonte]
  ['F1', { sexo: 'M', idade: 55, prevent: 3.8, ldl: 150, ct: 230, hdl: 50 }, 'baixo', /escore < 5% em 10 anos/, /T4\.1/],
  ['F2', { sexo: 'F', idade: 62, prevent: 8, ldl: 128, ct: 200, hdl: 55 }, 'intermediario', /escore de 5 a < 20% em 10 anos/, /T4\.1/],
  ['F3', { sexo: 'F', idade: 62, prevent: 8, ldl: 128, ct: 200, hdl: 55, lpa: { v: 60, un: 'mg' } }, 'alto', /com agravante \(Lp\(a\) de 60 mg\/dL\)/, /F4\.1/],
  ['F4', { sexo: 'M', idade: 45, prevent: 2.5, ldl: 172 }, 'intermediario', /LDL-c de 160–189/, /§4\.1/],
  ['F5', { sexo: 'M', idade: 45, prevent: 2.5, ldl: 172, ag: { hfam: true } }, 'alto', /LDL-c de 160–189 mg\/dL e agravante \(história familiar/, /F4\.1/],
  ['F6', { sexo: 'F', idade: 35, prevent: 1, ldl: 205 }, 'alto', /LDL-c ≥ 190 .*investigar hipercolesterolemia familiar/, /§4\.1/],
  ['F7', { sexo: 'M', idade: 52, dm: 'DM2', dmDuracao: 5, ldl: 110 }, 'alto', /diabetes tipo 2 em homem ≥ 50 anos/, /T4\.5/],
  ['F8', { sexo: 'F', idade: 48, dm: 'DM2', dmDuracao: 3, tfge: 100, rac: 15, ldl: 118, nac: 'ausente', retino: 'ausente', ag: { hfam: false, sm: false } }, 'intermediario', /mulher < 56 anos, sem estratificador/, /T4\.5/],
  ['F9', { sexo: 'F', idade: 48, dm: 'DM2', dmDuracao: 3, tfge: 100, rac: 15, ldl: 118, tabagismo: true }, 'alto', /DM2 com 1 estratificador de alto risco: tabagismo ativo/, /T4\.6/],
  ['F10', { sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 12, has: true, tabagismo: true, ldl: 120 }, 'muitoalto', /três ou mais estratificadores/, /T4\.8/],
  ['F11', { sexo: 'M', idade: 60, dm: 'DM2', tfge: 40, rac: 120 }, 'muitoalto', /doença renal de muito alto risco \(T4\.7: G3b \+ A2\)/, /T4\.8/],
  ['F12', { sexo: 'F', idade: 50, dm: 'DM2', tfge: 92, rac: 45 }, 'alto', /doença renal de alto risco \(T4\.7: G1 \+ A2\)/, /T4\.6/],
  ['F13', { sexo: 'M', idade: 40, dm: 'DM2', dmDuracao: 2, ldl: 195 }, 'muitoalto', /hipercolesterolemia grave \(LDL-c de 195/, /T4\.8/],
  ['F14', { sexo: 'M', idade: 40, dm: 'DM2', ct: 320, ldl: 180 }, 'muitoalto', /hipercolesterolemia grave \(CT de 320/, /T4\.8/],
  ['F15', { sexo: 'M', idade: 55, dm: 'DM2', ldl: 65 }, 'alto', /homem ≥ 50 anos/, /T4\.5/],
  ['F16', { sexo: 'M', idade: 68, ev: { iam: true }, evento2a: true, has: true, ldl: 130 }, 'extremo', /um evento aterosclerótico maior \(IAM\) com 3 condições de alto risco \(idade ≥ 65 anos; hipertensão arterial; evento agudo/, /T4\.2/],
  ['F17', { sexo: 'M', idade: 55, ev: { iam: true }, evento2a: true, tfge: 90 }, 'muitoalto', /doença aterosclerótica clínica \(IAM\)/, /T4\.1/],
  ['F17+fumo', { sexo: 'M', idade: 55, ev: { iam: true }, evento2a: true, tfge: 90, tabagismo: true }, 'extremo', /2 condições de alto risco \(tabagismo atual; evento agudo/, /T4\.2/],
  ['F18', { sexo: 'F', idade: 58, ev: { anginaEst: true, revCor: true }, revCorEletiva: true, has: true, tabagismo: true }, 'muitoalto', /angina estável, revascularização coronária/, /T4\.1/],
  ['F19', { sexo: 'M', idade: 66, ev: { avc: true, iam: true } }, 'extremo', /dois ou mais eventos ateroscleróticos maiores \(IAM, AVC isquêmico\)/, /T4\.2/],
  ['F20', { sexo: 'M', idade: 55, prevent: 6, cac: 350 }, 'muitoalto', /cálcio coronário de 350 UA \(> 300\)/, /T4\.4/],
  ['F21', { sexo: 'M', idade: 55, prevent: 6, cac: 150 }, 'alto', /cálcio coronário de 150 UA \(> 100\)/, /T4\.4/],
  ['F21+HF', { sexo: 'M', idade: 55, prevent: 6, cac: 150, hf: true }, 'muitoalto', /hipercolesterolemia familiar com CAC de 150 UA/, /T4\.4/],
  ['F22 escore 20,0', { sexo: 'M', idade: 55, prevent: 20 }, 'alto', /escore ≥ 20%/, /T4\.1/],
  ['F22 escore 19,9', { sexo: 'M', idade: 55, prevent: 19.9 }, 'intermediario', /escore de 5 a < 20%/, /T4\.1/],
  ['F22 CAC 100 p60', { sexo: 'M', idade: 55, prevent: 3, cac: 100, cacPct: 60 }, 'baixo', /escore < 5%/, /T4\.1/],
  ['F22 CAC 101', { sexo: 'M', idade: 55, prevent: 3, cac: 101 }, 'alto', /101 UA \(> 100\)/, /T4\.4/],
  ['F22 CAC p76', { sexo: 'M', idade: 55, prevent: 3, cac: 40, cacPct: 76 }, 'alto', /percentil 76 \(> 75\)/, /T4\.4/],
  ['F22 Lp(a) 180', { sexo: 'M', idade: 55, prevent: 3, lpa: { v: 180, un: 'mg' } }, 'intermediario', /agravante \(Lp\(a\) de 180 mg\/dL\): sobe um degrau/, /T4\.1/],
  ['F22 Lp(a) 181', { sexo: 'M', idade: 55, prevent: 3, lpa: { v: 181, un: 'mg' } }, 'alto', /Lp\(a\) de 181 mg\/dL/, /T4\.1/],
  ['F22 Lp(a) 391 nmol', { sexo: 'M', idade: 55, prevent: 3, lpa: { v: 391, un: 'nmol' } }, 'alto', /391 nmol\/L/, /T4\.1/],
  ['F22 Lp(a) 124 nmol', { sexo: 'M', idade: 55, prevent: 3, lpa: { v: 124, un: 'nmol' } }, 'baixo', /escore < 5%/, /T4\.1/],
  ['F22 PCR 2,0', { sexo: 'M', idade: 55, prevent: 3, pcr: 2.0 }, 'intermediario', /PCR-us de 2 mg\/L/, /T4\.1/],
  ['F23', { sexo: 'M', idade: 25, ldl: 140 }, 'baixo', /menos de 30 anos \(sem escore/, /§4\.9/],
  ['F23+LES', { sexo: 'F', idade: 25, ldl: 140, ag: { les: true } }, 'intermediario', /menos de 30 anos com agravante \(lúpus/, /§4\.9/],
  ['F24', { sexo: 'M', idade: 82, prevent: 3 }, 'alto', /80 anos ou mais/, /§4\.8; leitura E-20/],
  ['F25', { sexo: 'M', idade: 60, dialise: 'hemo', prevent: 8 }, 'intermediario', /escore de 5 a < 20%/, /T4\.1/],
  ['F26', { sexo: 'F', idade: 45, dm: 'DM1', dmDuracao: 25 }, 'muitoalto', /DM1 há mais de 20 anos, diagnosticado depois dos 18/, /T4\.8/],
  ['F27', { sexo: 'F', idade: 30, dm: 'DM1', dmDuracao: 10 }, 'intermediario', /DM1 com menos de 20 anos de doença/, /T4\.5/],
];
for (const [id, d, k, mot, fonte] of OURO) {
  const r = E(d);
  ok(r.k === k, '(2) ' + id + ': esperava ' + k + ', veio ' + r.k + ' (' + r.motivo + ')');
  ok(mot.test(r.motivo), '(2) ' + id + ': o motivo não diz a regra que decidiu: "' + r.motivo + '"');
  ok(fonte.test(r.fonte), '(2) ' + id + ': a fonte não cita a tabela/seção da diretriz: "' + r.fonte + '"');
}
// O que os casos-ouro também dizem além da categoria.
{
  ok(E({ sexo: 'M', idade: 55, ev: { iam: true }, evento2a: true, tfge: 90 }).pendencias.some((p) => p.sobe === 'extremo' && /Em aberto: LDL-c persistentemente/.test(p.t)),
    '(2) F17: com 1 condição, a pendência tem de dizer o que falta para o extremo');
  ok(E({ sexo: 'F', idade: 30, dm: 'DM1', dmDuracao: 10 }).pendencias.some((p) => /Steno Type 1 Risk Engine/.test(p.t)), '(2) F27: falta a pendência do ST1RE (T4.5; leitura E-14)');
  ok(E({ sexo: 'M', idade: 60, dialise: 'hemo', prevent: 8 }).alertas.some((a) => /recomenda contra INICIAR estatina/.test(a)), '(2) F25: diálise sem DCV — "não iniciar estatina" (rec. §9.5)');
  ok(E({ sexo: 'M', idade: 82, prevent: 3 }).alertas.some((a) => /individualizar as doses/.test(a)), '(2) F24: acima de 75 anos, individualizar (§9.7–9.9)');
  ok(E({ sexo: 'F', idade: 30, gestante: true, prevent: 1 }).alertas.some((a) => /Gestação: suspender a estatina/.test(a)), '(2) gestação: alerta de conduta (rec. §9.15)');
  // Extremo exige evento MAIOR: doença estável com todas as condições fica no muito alto (F18).
  ok(E({ sexo: 'M', idade: 70, ev: { anginaEst: true, ait: true, revCor: true }, revCorEletiva: true, has: true, tabagismo: true, dm: 'DM2', hf: true }).k === 'muitoalto',
    '(2) ⚠️ sem evento maior não há extremo (F4.1), por mais condições que haja');
  // O mesmo episódio marcado como IAM e como SCA recente é UM evento (leitura E-15).
  ok(E({ sexo: 'M', idade: 50, ev: { iam: true, sca12m: true }, tfge: 90 }).nMaiores === 1, '(2) IAM + "SCA nos últimos 12 meses" sem outra informação é um episódio só');
  ok(E({ sexo: 'M', idade: 50, ev: { iam: true, sca12m: true }, evMais1: true, tfge: 90 }).k === 'extremo', '(2) dois episódios coronários (mais de um evento maior) já são extremo');
  ok(E({ sexo: 'M', idade: 50, ev: { iam: true, revPer: true }, tfge: 90 }).k === 'extremo', '(2) IAM + revascularização periférica (DAP sintomática) são dois eventos maiores');
  // AIT, angina estável e revascularizações não periféricas: muito alto, não evento maior (E-17).
  ok(E({ sexo: 'M', idade: 70, ev: { ait: true }, has: true, tabagismo: true }).k === 'muitoalto', '(2) AIT não é evento maior (T4.2; leitura E-17)');
  // DRC no extremo: < 60, com diálise dentro (leitura E-16).
  ok(E({ sexo: 'M', idade: 55, ev: { avc: true }, dialise: 'peritoneal' }).condicoes.indexOf('DRC (TFGe < 60)') >= 0, '(2) diálise conta como DRC (TFGe < 60) nas condições do extremo');
  // DM2 há 10 anos exatos não é EAR ("há MAIS de 10 anos", leitura E-11).
  ok(E({ sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 10, nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } }).k === 'intermediario', '(2) DM2 há 10 anos exatos ainda não conta como EAR');
  // A idade sozinha basta para o alto no DM2 (leitura E-1).
  ok(E({ sexo: 'F', idade: 56, dm: 'DM2', dmDuracao: 1, nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } }).k === 'alto', '(2) DM2 em mulher de 56 anos sem EAR já é alto (F4.1; E-1)');
  // No DM o escore não categoriza (§4.1; D12): DM2 jovem sem EAR com PREVENT ≥ 20% fica intermediário.
  ok(E({ sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 2, prevent: 25, nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } }).k === 'intermediario',
    '(2) no diabetes a categoria sai das tabelas do DM, não do escore (§4.1; leitura E-3)');
  // Retinopatia moderada: EAR e pendência de EMAR (leitura E-13).
  const rm = E({ sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 2, retino: 'moderada' });
  ok(rm.k === 'alto' && rm.pendencias.some((p) => p.sobe === 'muitoalto' && /moderada-grave ou grave/.test(p.t)), '(2) retinopatia moderada: EAR (alto) e pendência "pode ser EMAR"');
  // Matriz renal: só o que a metade conhecida prova.
  ok(M.sbcRenalDM('G3a', null).nivel === 'EAR' && M.sbcRenalDM(null, 'A3').nivel === 'EMAR' && M.sbcRenalDM('G4', null).nivel === 'EMAR' && M.sbcRenalDM('G2', 'A1').nivel === 'nenhum'
    && M.sbcRenalDM('G3b', 'A2').nivel === 'EMAR' && M.sbcRenalDM('G3b', 'A1').nivel === 'EAR' && M.sbcRenalDM(null, 'A2').nivel === 'EAR' && M.sbcRenalDM(null, null).nivel === null,
    '(2) a matriz renal da T4.7 saiu da tabela');
  // LDL-c sob tratamento: piso do basal (leitura E-19).
  ok(E({ sexo: 'M', idade: 50, prevent: 3, ldl: 195, trat: { estatina: 'alta' } }).k === 'alto', '(2) LDL-c de 195 sob estatina prova basal ≥ 190 (o fármaco só baixa)');
  const sob = E({ sexo: 'M', idade: 50, prevent: 3, ldl: 120, trat: { estatina: 'alta' } });
  ok(sob.k === 'baixo' && sob.pendencias.some((p) => p.sobe === 'alto' && /Em uso de hipolipemiante, o LDL-c do laudo é sob tratamento: se o LDL-c antes do tratamento era de 190 ou mais, a categoria é alto \(§4\.1\)/.test(p.t)),
    '(2) LDL-c de 120 sob estatina não prova nada: pendência do LDL-c de antes do tratamento (E-19)');
  ok(E({ sexo: 'M', idade: 50, prevent: 3, ldl: 120, trat: { estatina: null } }).pendencias.some((p) => /^Uso de estatina não informado: se o LDL-c antes do tratamento/.test(p.t))
    && E({ sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 2, ldl: 120, trat: { estatina: 'sim' } }).pendencias.some((p) => p.sobe === 'muitoalto' && /passava de 190, no diabetes a categoria é muito alto \(T4\.8\)/.test(p.t)),
    '(2) estatina em branco, e estatina no diabetes (> 190 é muito alto): a pendência diz o corte certo');
  ok(E({ sexo: 'M', idade: 50, prevent: 3, ldl: 120, ldlBasal: 175, trat: { estatina: 'alta' } }).k === 'intermediario', '(2) com o basal informado, é ele que decide 160–189');
  // < 18: fora do escopo (§4.10).
  const ped = E({ sexo: 'F', idade: 15, prevent: 1 });
  ok(ped.k === null && ped.fora && /Tabela 4\.9/.test(ped.motivo), '(2) < 18 anos: fora do escopo, com a tabela pediátrica (§4.10)');
  // 30–79 sem escore: só o que os dados provam.
  ok(E({ sexo: 'M', idade: 50 }).k === null, '(2) 30–79 sem escore e sem outro critério: categoria indeterminada, não "baixo"');
  ok(E({ sexo: 'M', idade: 50, ldl: 170 }).k === 'intermediario' && E({ sexo: 'M', idade: 50, ldl: 170, ag: { hfam: true } }).k === 'alto',
    '(2) sem escore, LDL-c 160–189 já é no mínimo intermediário, e com agravante, alto (F4.1)');
  ok(E({ sexo: 'M', idade: 50 }).pendencias.some((p) => /PREVENT não calculado/.test(p.t)), '(2) sem escore, a pendência pede o PREVENT');
}
// ── Revisão independente de 24/10/2026 (commit b9ebf1b): um teste por item ──
{
  const semEAR = { nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } };
  const dm2 = (o) => E(Object.assign({ dm: 'DM2', dmDuracao: 3 }, semEAR, o));
  // A1 — sexo em branco não rebaixa o DM2 nem inventa o sexo no motivo.
  const a60 = dm2({ sexo: null, idade: 60 }), a53 = dm2({ sexo: null, idade: 53 }), a45 = dm2({ sexo: null, idade: 45 });
  ok(a60.k === 'alto' && /com 56 anos ou mais \(alto nos dois sexos\)/.test(a60.motivo) && !/mulher|homem/.test(a60.motivo),
    '(2) ⚠️ A1: DM2 de 60 anos com o sexo em branco é ALTO (≥ 56 vale nos dois sexos), sem citar sexo no motivo: ' + a60.k + ' · ' + a60.motivo);
  ok(a53.k === 'intermediario' && !/mulher|homem/.test(a53.motivo) && /sexo não informado/.test(a53.motivo) && a53.pendencias.some((x) => x.sobe === 'alto' && /Sexo não informado: no DM2, o homem já é alto risco a partir dos 50 anos/.test(x.t)),
    '(2) A1: de 50 a 55 anos com o sexo em branco, intermediário com pendência "→ alto" pedindo o sexo');
  ok(a45.k === 'intermediario' && !a45.pendencias.some((x) => /Sexo não informado/.test(x.t)), '(2) A1: abaixo de 50 anos o sexo não muda o DM2 — sem pendência de sexo');
  ok(dm2({ sexo: 'M', idade: 52 }).k === 'alto' && dm2({ sexo: 'F', idade: 52 }).k === 'intermediario' && /em mulher < 56 anos/.test(dm2({ sexo: 'F', idade: 52 }).motivo), '(2) A1: com o sexo informado, os cortes 50/56 continuam');
  ok(M.rcvDados({ sexo: '', idade: '60', dm: 'DM2', dm_ano: '2023', ev: 'nao' }, 2026).cat.k === 'alto', '(2) A1 pela tela: DM2 de 60 anos sem o sexo marcado é alto');
  // M1 — SCA nos últimos 12 meses já é evento agudo há menos de 2 anos (T4.2).
  const m1 = E({ sexo: 'M', idade: 70, ev: { iam: true, sca12m: true }, tfge: 90 }), m1n = E({ sexo: 'M', idade: 70, ev: { iam: true, sca12m: true }, evento2a: false, tfge: 90 });
  ok(m1.k === 'extremo' && m1.condicoes.some((c) => /há menos de 2 anos, pela SCA dos últimos 12 meses/.test(c)), '(2) ⚠️ M1: IAM + SCA recente aos 70 anos é EXTREMO (idade ≥ 65 + evento < 2 anos): ' + m1.k);
  ok(m1n.k === 'extremo' && m1n.alertas.some((a) => /Respostas em conflito: "SCA nos últimos 12 meses"/.test(a)) && !m1.alertas.some((a) => /em conflito/.test(a)),
    '(2) M1: SCA recente com "evento < 2 anos: Não" é contradição — conta a SCA e avisa');
  // M2 — "sem tratamento" menor que o atual: para os cortes vale o maior, com alerta.
  const m2a = E({ sexo: 'M', idade: 50, prevent: 3, ldl: 200, ldlBasal: 150, trat: { estatina: 'alta' } });
  const m2b = E({ sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 2, ldl: 200, ldlBasal: 180, trat: { estatina: 'moderada' } });
  ok(m2a.k === 'alto' && /LDL-c ≥ 190/.test(m2a.motivo) && m2a.alertas.some((a) => /LDL-c sem tratamento informado \(150 mg\/dL\) abaixo do LDL-c atual \(200\)/.test(a)), '(2) ⚠️ M2: EAI com LDL-c 200 e "basal" 150 é ALTO (≥ 190), não baixo — e avisa: ' + m2a.k);
  ok(m2b.k === 'muitoalto' && /hipercolesterolemia grave \(LDL-c de 200/.test(m2b.motivo), '(2) ⚠️ M2: DM2 com LDL-c 200 sob estatina e "basal" 180 é MUITO ALTO (LDL-c > 190, T4.8): ' + m2b.k);
  ok(E({ sexo: 'M', idade: 50, prevent: 3, ldl: 170, ldlBasal: 120, trat: { estatina: 'nao' } }).k === 'intermediario', '(2) M2: sem tratamento, duas dosagens — vale a maior para 160–189');
  const m2c = E({ sexo: 'M', idade: 50, prevent: 3, ldl: 150, ldlBasal: 120, trat: { estatina: 'alta' } });
  ok(m2c.k === 'baixo' && m2c.pendencias.some((x) => x.sobe === 'alto' && /sem tratamento informado abaixo do atual/.test(x.t)), '(2) M2: basal contraditório abaixo de 190: o verdadeiro pode passar de 190 — pendência');
  // B3 — 79,5 anos ainda tem escore (o campo aceita decimal); 80 já é a regra dos 80.
  const b3 = E({ sexo: 'M', idade: 79.5, prevent: 8 });
  ok(b3.k === 'intermediario' && b3.escoreUsado && !b3.semEscore && E({ sexo: 'M', idade: 80, prevent: 3 }).k === 'alto', '(2) B3: 79,5 anos cai no escore (< 80), não no vão entre "≤ 79" e "≥ 80"');
  // B4 — duração pelo ano do diagnóstico: no limite do corte, pendência.
  const b4 = dm2({ sexo: 'M', idade: 45, dmDuracao: 10, dmDuracaoAprox: true });
  ok(b4.k === 'intermediario' && b4.pendencias.some((x) => x.sobe === 'alto' && /duração do diabetes \(pelo ano do diagnóstico dá 10 anos; com mais de 10, é estratificador\)/.test(x.t)),
    '(2) B4: DM2 "há 10 anos" pela conta do ano pode ter mais de 10 — pendência "→ alto"');
  ok(!dm2({ sexo: 'M', idade: 45, dmDuracao: 10 }).pendencias.some((x) => /duração do diabetes/.test(x.t)) && !dm2({ sexo: 'M', idade: 45, dmDuracao: 9, dmDuracaoAprox: true }).pendencias.some((x) => /duração do diabetes/.test(x.t)),
    '(2) B4: duração exata de 10, ou 9 pelo ano, não deixa o critério em aberto');
  const xb4 = M.rcvDados({ sexo: 'M', idade: '45', dm: 'DM2', dm_ano: '2016', ev: 'nao', nac: 'ausente', retino: 'ausente', ag_hfam: 'nao', ag_sm: 'nao', tab: 'nao', has: 'nao', cr: '0.9', rac: '10' }, 2026);
  ok(xb4.d.dmDuracaoAprox === true && xb4.cat.pendencias.some((x) => /pelo ano do diagnóstico dá 10 anos/.test(x.t)), '(2) B4 pela tela: diagnóstico em 2016 conferido em 2026 deixa os "10 anos" em aberto');
  const dm1 = (o) => E(Object.assign({ dm: 'DM1', sexo: 'F' }, semEAR, o));
  ok(dm1({ idade: 45, dmDuracao: 20, dmDuracaoAprox: true }).pendencias.some((x) => x.sobe === 'muitoalto' && /duração do DM1 e idade ao diagnóstico \(pelo ano do diagnóstico: 20 anos/.test(x.t))
    && dm1({ idade: 43, dmDuracao: 25, dmDuracaoAprox: true }).pendencias.some((x) => /diagnóstico aos 18/.test(x.t)) && !dm1({ idade: 43, dmDuracao: 25 }).pendencias.some((x) => /em aberto/.test(x.t)),
    '(2) B4: no DM1, "20 anos" e "diagnóstico aos 18" pela conta do ano ficam em aberto (T4.8)');
  // B5 — 80 anos ou mais: alto com ou sem diabetes (§4.8).
  const b5 = dm1({ idade: 85, dmDuracao: 10 }), b5b = dm2({ sexo: 'F', idade: 85 });
  ok(b5.k === 'alto' && /80 anos ou mais/.test(b5.motivo) && b5b.k === 'alto' && b5b.outros.some((o) => /80 anos ou mais/.test(o.motivo)), '(2) ⚠️ B5: DM1 de 85 anos sem estratificador é ALTO pela regra dos 80 anos, como o mesmo paciente sem diabetes: ' + b5.k);
  // B7 — DM1 com a idade em branco: a pendência pede a idade, não a duração.
  const b7 = dm1({ idade: NaN, dmDuracao: 25 });
  ok(b7.pendencias.some((x) => x.sobe === 'muitoalto' && /em aberto: idade \(o DM1 com mais de 20 anos/.test(x.t)) && !b7.pendencias.some((x) => /duração do DM1/.test(x.t) || /fica fora das duas regras/.test(x.t)),
    '(2) B7: DM1 há 25 anos com a idade em branco pede a IDADE (diagnóstico depois dos 18), não a duração');
  ok(dm1({ idade: NaN, dmDuracao: 10 }).pendencias.some((x) => /Idade não informada: com 80 anos ou mais/.test(x.t)) && !dm1({ idade: NaN, dmDuracao: 10 }).pendencias.some((x) => /no DM2, 50 anos/.test(x.t)),
    '(2) B7: no DM1 a pendência da idade não cita o corte do DM2');
  // B6 — diálise peritoneal no muito alto: o alerta admite iniciar estatina (§9.5).
  const b6 = E({ sexo: 'M', idade: 60, dm: 'DM2', dmDuracao: 3, dialise: 'peritoneal' }), b6h = E({ sexo: 'M', idade: 60, dm: 'DM2', dmDuracao: 3, dialise: 'hemo' });
  ok(b6.k === 'muitoalto' && b6.alertas.some((a) => /Diálise peritoneal .*no risco muito alto: a diretriz admite iniciar estatina/.test(a)) && b6h.alertas.some((a) => /recomenda contra INICIAR estatina/.test(a)),
    '(2) B6: na diálise peritoneal com risco muito alto o alerta admite iniciar estatina; na hemodiálise, contra');
}
// "NÃO SEI" NÃO DERRUBA A CATEGORIA. Para cada fator de risco em aberto, a
// categoria com "não sei" é a MESMA de "não" (o "não sei" não dispara regra) e
// nunca maior que a de "sim". Varredura determinística sobre pacientes sorteados.
// Revisão de 24/10: a varredura cobre também (b) o SEXO — em branco dá o MÍNIMO das
// duas respostas (A1); (c) o LDL-c SEM TRATAMENTO — em branco é o mesmo que informar
// o próprio LDL-c atual e nunca fica acima de valor nenhum informado (M2); (d) a
// coerência SCA recente × evento < 2 anos — com SCA nos últimos 12 meses, a resposta
// dos 2 anos não muda nada, e vale o mesmo que IAM com evento < 2 anos (M1); e (e) os
// 80 anos — sem doença aterosclerótica, no mínimo alto, com ou sem diabetes (B5).
{
  let seed = 20261024;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const CAMPOS = [['tabagismo'], ['has'], ['hf'], ['aaa'], ['evento2a'], ['ldlPersist100'], ['evMais1'], ['obstrOutra'], ['ag', 'hfam'], ['ag', 'sm'], ['ag', 'les'], ['ag', 'psor'], ['ag', 'menop']];
  const NUM = ['dmDuracao', 'prevent', 'ldl', 'ldlBasal', 'ct', 'tfge', 'rac'];
  const copia = (d) => { const c = JSON.parse(JSON.stringify(d, (k, x) => (typeof x === 'number' && !isFinite(x) ? null : x))); NUM.forEach((k) => { if (c[k] == null) c[k] = NaN; }); return c; };
  const K = (c) => M.sbcEstratifica(c).k;
  const menor = (a, b) => (a === null || b === null ? null : (ix(a) <= ix(b) ? a : b));
  let n = 0, quebras = [];
  const vis = { sexo: [0, []], basal: [0, []], sca: [0, []], idoso: [0, []] };
  const quebra = (q, msg) => { vis[q][1].push(msg); };
  for (let i = 0; i < 1500; i++) {
    const d = {
      idade: Math.round(20 + rnd() * 65), sexo: pick(['M', 'F']), dm: pick(['nenhum', 'DM2', 'DM1', null]), dmDuracao: pick([NaN, 3, 12, 25]),
      prevent: pick([NaN, 2, 7, 14, 22]), ldl: pick([NaN, 90, 150, 175, 200]), ldlBasal: NaN, ct: pick([NaN, 200, 320]), hdl: 45, tfge: pick([NaN, 95, 50, 25]), rac: pick([NaN, 10, 100, 400]),
      ev: pick([{}, { iam: true }, { ait: true }, { iam: true, avc: true }, { sca12m: true }, { iam: true, sca12m: true }]), trat: { estatina: pick(['nao', 'alta', null]) }, nac: pick([null, 'ausente']), retino: pick([null, 'ausente', 'leve']), ag: {}
    };
    // (a) os campos sim / não / não sei
    const campo = pick(CAMPOS);
    const com = (v) => { const c = copia(d); if (campo.length === 2) c.ag[campo[1]] = v; else c[campo[0]] = v; return c; };
    const kNs = K(com(null)), kNao = K(com(false)), kSim = K(com(true));
    n++;
    if (kNs !== kNao || (kSim !== null && kNs !== null && ix(kNs) > ix(kSim))) quebras.push(campo.join('.') + ' ' + JSON.stringify([kNs, kNao, kSim]));
    // (b) sexo em branco = o mínimo de "masculino" e "feminino"
    { const c = copia(d); c.sexo = null; const kN = K(c); c.sexo = 'M'; const kM = K(c); c.sexo = 'F'; const kF = K(c);
      vis.sexo[0]++; if (kN !== menor(kM, kF)) quebra('sexo', JSON.stringify({ idade: d.idade, dm: d.dm, ev: d.ev, k: [kN, kM, kF] })); }
    // (c) LDL-c sem tratamento em branco = informar o próprio LDL-c atual, e nunca acima de um valor informado
    if (isFinite(d.ldl)) {
      const c = copia(d); const k0 = K(c); c.ldlBasal = d.ldl; const kIg = K(c);
      const ks = [d.ldl - 40, d.ldl + 40, 195].map((b) => { c.ldlBasal = b; return K(c); });
      vis.basal[0]++;
      if (k0 !== kIg || ks.some((k) => k0 !== null && (k === null || ix(k) < ix(k0)))) quebra('basal', JSON.stringify({ ldl: d.ldl, trat: d.trat.estatina, dm: d.dm, k: [k0, kIg].concat(ks) }));
    }
    // (d) SCA recente: a resposta dos 2 anos não muda a categoria, e é o mesmo que IAM com evento < 2 anos
    if (d.ev.sca12m) {
      const c = copia(d); const ks = [null, false, true].map((v) => { c.evento2a = v; return K(c); });
      const c2 = copia(d); c2.ev = { iam: true, avc: !!d.ev.avc }; c2.evento2a = true;
      vis.sca[0]++; if (!(ks[0] === ks[1] && ks[1] === ks[2] && ks[0] === K(c2))) quebra('sca', JSON.stringify({ idade: d.idade, ev: d.ev, k: ks.concat([K(c2)]) }));
    }
    // (e) 80 anos ou mais, sem doença aterosclerótica: no mínimo alto, com ou sem diabetes
    if (d.idade >= 80) {
      const c = copia(d); c.ev = {}; c.dcva = false; const k = K(c);
      vis.idoso[0]++; if (k === null || ix(k) < ix('alto')) quebra('idoso', JSON.stringify({ idade: d.idade, dm: d.dm, k }));
    }
  }
  ok(n === 1500 && quebras.length === 0, '(2) ⚠️ "não sei" mudou a categoria em relação a "não", ou ficou acima de "sim": ' + quebras.slice(0, 3).join(' | '));
  ok(vis.sexo[0] === 1500 && vis.sexo[1].length === 0, '(2) ⚠️ A1: sexo em branco tem de dar o MÍNIMO de masculino e feminino (nem abaixo, nem regra disparada): ' + vis.sexo[1].slice(0, 3).join(' | '));
  ok(vis.basal[0] > 800 && vis.basal[1].length === 0, '(2) ⚠️ M2: LDL-c sem tratamento em branco = informar o próprio LDL-c atual, e nenhum valor informado pode baixar a categoria: ' + vis.basal[1].slice(0, 3).join(' | '));
  ok(vis.sca[0] > 300 && vis.sca[1].length === 0, '(2) ⚠️ M1: com SCA recente, a resposta dos 2 anos não pode mudar a categoria (e vale o mesmo que IAM com evento < 2 anos): ' + vis.sca[1].slice(0, 3).join(' | '));
  ok(vis.idoso[0] > 50 && vis.idoso[1].length === 0, '(2) ⚠️ B5: 80 anos ou mais sem doença aterosclerótica é no mínimo alto, com ou sem diabetes: ' + vis.idoso[1].slice(0, 3).join(' | '));
  // E vira pendência, com a categoria a que leva.
  const p = E({ sexo: 'M', idade: 60, prevent: 8, ldl: 120, ct: 190, hdl: 50, ag: { hfam: null } });
  ok(p.k === 'intermediario' && p.pendencias.some((x) => x.sobe === 'alto' && /Agravantes em aberto: história familiar/.test(x.t)), '(2) agravante em aberto vira "pode subir" para alto, no intermediário');
  ok(E({ sexo: 'M', idade: 60, prevent: 3, dcva: null }).pendencias.some((x) => x.sobe === 'extremo' && /Doença aterosclerótica não informada/.test(x.t)), '(2) evento "não sei": pendência, não muito alto');
  ok(E({ sexo: 'M', idade: 60, ev: { iam: true }, has: true, tabagismo: true }).pendencias.length === 0 || E({ sexo: 'M', idade: 60, ev: { iam: true }, has: true, tabagismo: true }).pendencias.every((x) => ix(x.sobe) > ix('extremo')),
    '(2) no extremo não sobra pendência "pode subir"');
}

// ───────────────────── (3) alvo de LDL-c e estratégias ─────────────────────
{
  const A = M.sbcAlvoLDL;
  const f1 = A('baixo', 150, NaN, false, 180);
  ok(f1.gatilho && f1.porPct && Math.abs(f1.alvo - 105) < 1e-9 && f1.red === 30 && f1.inclusivo, '(3) F1: alvo ≤ 105 (−30%) e queda de 30% (F5.1: meta e redução juntas)');
  const f15 = A('alto', 65, NaN, false, 100);
  ok(!f15.naMeta && f15.porPct && Math.floor(f15.alvo) === 32 && f15.red === 50, '(3) ⚠️ F15: DM2 com LDL-c 65 sem tratamento não está "na meta" — alvo ≤ 32 (D3)');
  ok(!A('intermediario', 100, NaN, false, 120).naMeta, '(3) a meta é estrita: LDL-c igual a 100 não está na meta de < 100 (D14)');
  const sobT = A('alto', 85, NaN, true, 110);
  ok(!sobT.porPct && sobT.alvo === 70 && Math.abs(sobT.red - (1 - 70 / 85) * 100) < 1e-4, '(3) em tratamento sem o basal, só a meta se confere');
  const comB = A('muitoalto', 60, 130, true, 90);
  ok(comB.porPct && Math.abs(comB.alvo - 50) < 1e-9 || (!comB.porPct && comB.alvo === 50), '(3) com basal 130, o alvo é o menor entre a meta (< 50) e 65 (−50%)');
  // Gatilho só pelo não-HDL-c (rec. §5: "LDL-c ou não-HDL-c"): com o fármaco
  // indicado, a redução mínima de 30% passa a valer para o LDL-c (110 × 0,7 = 77).
  const nh = A('baixo', 110, NaN, false, 180);
  ok(nh.gatNhdl && !nh.gatLdl && nh.gatilho && !nh.naMeta && nh.porPct && Math.abs(nh.alvo - 77) < 1e-9, '(3) gatilho pelo não-HDL-c com o LDL-c na meta: a redução mínima passa a valer (alvo ≤ 77)');
  // Sem basal (em tratamento), a redução não se confere: LDL-c na meta e gatilho pelo não-HDL-c.
  const nh2 = A('baixo', 110, NaN, true, 180);
  ok(nh2.naMeta && nh2.gatNhdl, '(3) em tratamento, com LDL-c na meta e não-HDL-c ≥ 30 acima: na meta do LDL-c, gatilho pelo não-HDL-c');
  ok(A('baixo', 144, NaN, false, 150).gatilho === false && A('baixo', 145, NaN, false, 150).gatilho === true, '(3) F22: no baixo, o gatilho começa em 145 (meta 115 + 30)');
}
{
  // Estratégias pela Figura 7.2 (A.6), pela tela. Desde 31/10/2026 o formulário só
  // pergunta SE o paciente usa estatina (como a fórmula original): sem intensidade,
  // ezetimiba, ácido bempedoico, anti-PCSK9 e intolerância.
  const tela = (e) => M.rcvEstrategiasHTML(M.rcvDados(e, 2026));
  // A linha da estratégia: o rótulo exato, com ou sem as marcas ("terapia inicial", "sugerida"…).
  const linha = (h, t) => { const m = h.match(new RegExp('<td>' + t.replace(/[+()]/g, '\\$&') + '(?: <span class="rcv-fonte">[^<]*</span>)?</td>[\\s\\S]*?</tr>')); return m ? m[0] : ''; };
  const B = { sexo: 'M', idade: '55', ct: '230', hdl: '50', pas: '120', cr: '1', peso: '80', altura: '178', tab: 'nao', ahas: 'nao', has: 'nao', dm: 'nao', ev: 'nao', lpa_un: 'nd' };
  const ex = (o) => Object.assign({}, B, o);
  const f1 = tela(ex({ ldl: '150', est: 'nao' }));
  ok(/sugerida/.test(linha(f1, 'EMI')) && /Menor estratégia que alcança/.test(f1), '(3) F1 (baixo, gatilho, 30%): a estratégia sugerida é a estatina de moderada intensidade');
  // F16 (extremo, LDL-c 130): a terapia inicial mínima é EAI + EZE + anti-PCSK9.
  const f16 = tela({ sexo: 'M', idade: '68', ev: 'sim', e_iam: '1', e_2a: 'sim', has: 'sim', ahas: 'sim', tab: 'nao', ldl: '130', est: 'nao', dm: 'nao' });
  ok(/terapia inicial · sugerida/.test(linha(f16, 'EAI + EZE + anti-PCSK9')), '(3) F16 (extremo): EAI + EZE + anti-PCSK9 é a terapia inicial e a sugerida');
  // ⚠️ Em uso de estatina, sem a intensidade, a figura (redução sobre o LDL-c sem
  // tratamento) não diz o que cada esquema acrescenta: nenhuma linha "alcança" nem é
  // sugerida, e o caminho vem das reduções adicionais do texto (as do bloco do PREVENT).
  const t = tela({ sexo: 'M', idade: '60', ev: 'sim', e_ait: '1', ldl: '90', est: 'sim', dm: 'nao', tab: 'nao', has: 'nao' });
  ok(/<b>Em uso de estatina:<\/b> a redução que falta, 44,4%, é ADICIONAL ao esquema atual/.test(t) && /associar <b>anti-PCSK9<\/b>/.test(t) && /nenhuma linha é dada como suficiente/.test(t)
    && !/sugerida/.test(t) && !/✓ sim/.test(t) && !/<span class="rcv-t3">não<\/span>/.test(t),
    '(3) ⚠️ em uso de estatina (muito alto, LDL-c 90): redução adicional de 44,4% pelo texto (anti-PCSK9), sem linha da figura dada como suficiente');
  const t2 = tela({ sexo: 'M', idade: '60', ev: 'nao', carot: 'lt50', ldl: '80', est: 'sim', dm: 'nao', tab: 'nao', has: 'nao' });
  ok(/a redução que falta, 12,5%,/.test(t2) && /otimizar a estatina para alta intensidade e associar <b>ezetimiba<\/b>/.test(t2), '(3) em estatina, falta pouca redução (12,5%): otimizar a estatina e associar ezetimiba');
  const semEst = tela({ sexo: 'M', idade: '60', ev: 'sim', e_ait: '1', ldl: '90', dm: 'nao' });
  ok(/Uso de estatina não informado: a tabela supõe que o paciente não usa/.test(semEst) && /sugerida/.test(semEst) && !/Uso de estatina não informado/.test(f1), '(3) estatina em branco: a tabela avisa que supõe "não usa"');
  // Gestação e diálise sem DCV (em quem ainda não trata): a tabela não sugere esquema.
  const tg = tela(ex({ sexo: 'F', gest: 'sim', ldl: '205', est: 'nao' })), td = tela(ex({ ldl: '205', est: 'nao', dial: 'hemo' }));
  ok(/Na gestação, a conduta muda/.test(tg) && !/sugerida/.test(tg) && /recomenda contra INICIAR estatina/.test(td) && !/sugerida/.test(td),
    '(3) gestação (rec. §9.15) e diálise sem DCV (rec. §9.5): nenhuma estratégia sugerida');
  // Os valores da figura.
  const R = {}; M.RCV_ESTRATEGIAS.forEach((s) => { R[s.t] = s.r; });
  ok(R['EZE'] === 20 && R['ABp'] === 20 && R['EMI'] === 30 && R['ABp + EZE'] === 40 && R['EAI'] === 50 && R['EMI + EZE'] === 50 && R['anti-PCSK9'] === 55 && R['EAI + EZE'] === 65
    && R['EZE + anti-PCSK9'] === 70 && R['EAI + EZE + ABp'] === 75 && R['EAI + anti-PCSK9'] === 80 && R['EZE + ABp + anti-PCSK9'] === 80 && R['EAI + EZE + anti-PCSK9'] === 85
    && R['EAI + ABp + anti-PCSK9'] === 85 && R['EAI + EZE + ABp + anti-PCSK9'] === 90 && M.RCV_ESTRATEGIAS.length === 15, '(3) as reduções médias saíram da Figura 7.2');
}
// ── Revisão de 24/10: alvo e estratégias (B1, B2, B6, M2, M3, B7), no formulário de 31/10 ──
{
  const tela = (e) => M.rcvEstrategiasHTML(M.rcvDados(e, 2026));
  const metas = (e) => M.rcvMetasHTML(M.rcvDados(e, 2026));
  const linha = (h, t) => { const m = h.match(new RegExp('<td>' + t.replace(/[+()]/g, '\\$&') + '(?: <span class="rcv-fonte">[^<]*</span>)?</td>[\\s\\S]*?</tr>')); return m ? m[0] : ''; };
  // Muito alto por AIT, sem diabetes.
  const AIT = { sexo: 'M', idade: '60', ct: '200', hdl: '50', pas: '120', cr: '1', peso: '80', altura: '178', tab: 'nao', ahas: 'nao', has: 'nao', dm: 'nao', ev: 'sim', e_ait: '1', lpa_un: 'nd' };
  const ait = (o) => Object.assign({}, AIT, o);
  const corpoTab = (h) => h.slice(h.indexOf('<tbody>'), h.indexOf('</tbody>'));
  // B1 — o LDL-c previsto IGUAL ao alvo estrito não alcança: sem estatina, LDL-c 200 no
  // muito alto; EAI + EZE + ABp (75%) leva a exatamente 50 (meta < 50).
  const b1 = tela(ait({ ldl: '200', est: 'nao' }));
  ok(/não/.test(linha(b1, 'EAI + EZE + ABp')) && !/✓ sim/.test(linha(b1, 'EAI + EZE + ABp')) && /sugerida/.test(linha(b1, 'EAI + anti-PCSK9')),
    '(3) ⚠️ B1: o esquema que leva o LDL-c a exatamente 50 no muito alto (meta < 50) NÃO alcança; a sugerida é a seguinte (EAI + anti-PCSK9)');
  // B2 — LDL-c igual à meta estrita: fora da meta, sem "Redução necessária: 0,0%".
  const lim = M.sbcAlvoLDL('alto', 70, NaN, true, 90);
  ok(lim.limite && !lim.naMeta && lim.red === 0 && !M.sbcAlvoLDL('alto', 69, NaN, true, 90).limite && !M.sbcAlvoLDL('alto', 75, NaN, true, 90).limite, '(3) B2: sbcAlvoLDL marca o limite (LDL-c = meta estrita)');
  const b2 = metas(ait({ ev: 'nao', e_ait: '', carot: 'lt50', ldl: '70', est: 'sim' }));
  ok(/<b>LDL-c no limite da meta:<\/b> a meta é estrita \(&lt; 70\)/.test(b2) && !/Redução necessária: 0,0%/.test(b2) && /no limite \(a meta é &lt; 70\)/.test(b2) && !/\+0 acima/.test(b2),
    '(3) ⚠️ B2: LDL-c de 70 no alto, em estatina: "no limite da meta", não "Redução necessária: 0,0%" nem "+0 acima"');
  ok(/otimizar a estatina para alta intensidade e associar <b>ezetimiba<\/b>/.test(tela(ait({ ev: 'nao', e_ait: '', carot: 'lt50', ldl: '70', est: 'sim' }))), '(3) B2: no limite da meta, em estatina, as estratégias ainda dizem como intensificar');
  // B6 — diálise peritoneal no muito alto: o §9.5 admite iniciar estatina, e o bloco não bloqueia.
  const DPm = { sexo: 'M', idade: '60', ct: '200', hdl: '50', pas: '120', peso: '80', altura: '178', tab: 'nao', ahas: 'nao', has: 'nao', ev: 'nao', lpa_un: 'nd', dm: 'DM2', dm_ano: '2020', ldl: '120', est: 'nao' };
  const b6 = tela(Object.assign({}, DPm, { dial: 'dp' })), b6h = tela(Object.assign({}, DPm, { dial: 'hemo' }));
  ok(M.rcvDados(Object.assign({}, DPm, { dial: 'dp' }), 2026).cat.k === 'muitoalto' && /Diálise peritoneal no risco muito alto: a diretriz admite iniciar estatina/.test(b6) && /sugerida/.test(corpoTab(b6)) && !/contra INICIAR/.test(b6),
    '(3) ⚠️ B6: diálise peritoneal no muito alto — o bloco de estratégias admite iniciar estatina, como o alerta (§9.5)');
  ok(/recomenda contra INICIAR estatina/.test(b6h) && !/sugerida/.test(corpoTab(b6h)), '(3) B6: na hemodiálise sem DCV, continua sem esquema sugerido (rec. §9.5)');
  // M2 — o "sem tratamento" menor que o atual não serve de base (a função ainda aceita o
  // basal, que o formulário não pede mais).
  ok(isNaN(M.sbcAlvoLDL('alto', 120, 100, true, 150).base) && !M.sbcAlvoLDL('alto', 120, 100, true, 150).porPct && M.sbcAlvoLDL('alto', 200, 150, false, 230).base === 200,
    '(3) M2: basal menor que o atual — sob tratamento não serve de base; sem tratamento vale a maior dosagem');
  const semB = metas(ait({ ldl: '120', est: 'sim' }));
  ok(/A redução mínima de 50% é sobre o LDL-c de antes do tratamento: confira-a pelo histórico do paciente/.test(semB) && !/LDL-c sem tratamento/.test(semB),
    '(3) em estatina, a tela diz que a redução mínima se confere pelo histórico (o formulário não pede o LDL-c sem tratamento)');
  // M3 — do alto para cima, não-HDL-c fora da meta não é "manter".
  const nh = M.sbcAlvoLDL('muitoalto', 45, NaN, true, 120);
  ok(nh.naMeta && nh.nhdlAcima && !M.sbcAlvoLDL('muitoalto', 45, NaN, true, 79).nhdlAcima && M.sbcAlvoLDL('muitoalto', 45, NaN, true, 80).nhdlAcima, '(3) M3: sbcAlvoLDL marca o não-HDL-c fora da meta (estrita)');
  const m3 = ait({ ldl: '45', est: 'sim', ct: '160', hdl: '40' });
  const m3m = metas(m3), m3e = tela(m3);
  ok(/não manter — intensificar o tratamento/.test(m3m) && !/manter o esquema e reavaliar/.test(m3m) && /§5\.5/.test(m3m), '(3) ⚠️ M3: muito alto com LDL-c 45 e não-HDL-c 120 (meta < 80): a redução diz intensificar, não manter');
  ok(/intensificar o tratamento/.test(m3e) && !/nenhuma estratégia a acrescentar agora/.test(m3e), '(3) ⚠️ M3: as estratégias também não dizem "nada a acrescentar"');
  ok(/manter o esquema e reavaliar/.test(metas(ait({ ldl: '45', est: 'sim', ct: '110', hdl: '40' }))), '(3) M3: com o não-HDL-c na meta (70 < 80), "manter" continua');
  // B7 — LDL-c igual à meta sem gatilho: "no limite da meta", não "0 mg/dL acima".
  const b7x = M.rcvDados({ sexo: 'M', idade: '55', ct: '170', hdl: '50', pas: '120', cr: '1', peso: '80', altura: '178', tab: 'nao', ahas: 'nao', has: 'nao', dm: 'nao', ev: 'nao', lpa_un: 'nd', ldl: '100', est: 'nao', ag_hfam: 'sim' }, 2026);
  const b7 = M.rcvMetasHTML(b7x);
  ok(b7x.cat.k === 'intermediario' && /Sem gatilho farmacológico: o LDL-c está no limite da meta \(ela é &lt; 100\)/.test(b7) && !/está 0 mg\/dL acima/.test(b7), '(3) ⚠️ B7: LDL-c igual à meta, sem gatilho: "no limite da meta", não "o LDL-c está 0 mg/dL acima da meta"');
  const b7c = M.ldlCondutaHTML({ k: 'intermediario', lip: { basal: 130, nhdl: 120 } }, M.LDL_METAS.intermediario, 95, true);
  ok(/LDL-c abaixo da meta \(&lt; 100\), mas sem a redução mínima de 30%/.test(b7c) && !/no limite da meta/.test(b7c), '(3) B7: a conduta do PREVENT antigo também não chama de "limite" o LDL-c abaixo da meta');
}

// ───────────────────── (4) a tela ─────────────────────
const PRIM = { ev: 'nao', sexo: 'M', idade: '61', peso: '86', altura: '172', ct: '228', hdl: '41', ldl: '148', lpa_un: 'nd', pcr: '2.4', pas: '146', pad: '88', cr: '1.0', rac: '18', hba1c: '5.8',
  tab: 'sim', has: 'sim', ahas: 'sim', est: 'nao', dm: 'nao', cac_f: 'nao', carot: 'na', angio: 'na', obstr: 'na', aaa: 'nao', hf: 'nao', dial: 'nao' };
const SEC = { ev: 'sim', e_iam: '1', e_sca: '1', e_mais1: 'nao', e_2a: 'sim', e_ldl100: 'ns', sexo: 'M', idade: '67', peso: '92', altura: '175', ct: '168', hdl: '38', ldl: '98', lpa_un: 'mg', lpa: '95',
  pcr: '3.1', pas: '142', pad: '84', cr: '1.3', rac: '45', hba1c: '7.8', tab: 'nao', has: 'sim', ahas: 'sim', est: 'sim', dm: 'DM2', dm_ano: '2014', nac: 'na', retino: 'ausente',
  cac_f: 'nao', carot: 'lt50', angio: 'na', obstr: 'na', aaa: 'nao', hf: 'nao', dial: 'nao' };
{
  const hp = M.rcvResultadoHTML(PRIM), xp = M.rcvDados(PRIM, 2026);
  ok(xp.cat.k === 'alto' && /escore de 5 a &lt; 20% em 10 anos com agravante \(PCR-us de 2,4 mg\/L\)/.test(hp), '(4) caso de prevenção primária: ALTO por escore 5–20% + PCR-us ≥ 2,0');
  ok(/Resultado detalhado do cálculo de risco · PREVENT \(AHA\)/.test(hp) && ['Doença cardiovascular total', 'DASCV (doença cardiovascular aterosclerótica)', 'Insuficiência cardíaca', 'Doença coronariana', 'AVC (acidente vascular cerebral)'].every((t) => hp.indexOf('<td>' + t) >= 0)
    && /<th>Tipo de risco<\/th><th>10 anos<\/th><th>30 anos<\/th>/.test(hp),
    '(4) a tabela do PREVENT tem os cinco desfechos, com os nomes por extenso (como a fórmula original)');
  ok(/<b>Modelo usado:<\/b> PREVENT \+ RAC \+ HbA1c/.test(hp) && /errata de 14\/10\/2026/.test(hp), '(4) a tela diz o modelo usado e a errata');
  ok(hp.indexOf('<td>' + M.sbcN(xp.r.cvd, 2) + '%</td>') > 0 && hp.indexOf('<td>' + M.sbcN(xp.r.ascvd, 2) + '%</td>') > 0, '(4) a tabela do PREVENT com duas casas decimais');
  ok(/<td>—<\/td>/.test(hp) && /só vai de 30 a 59 anos/.test(hp), '(4) aos 61 anos o PREVENT de 30 anos não aparece (só 30–59)');
  ok(/Redução necessária: 52,7%<\/b> = \(LDL-c atual − alvo\) ÷ LDL-c atual = \(148 − 70\) ÷ 148/.test(hp), '(4) a redução necessária com a conta à vista');
  const hs = M.rcvResultadoHTML(SEC), xs = M.rcvDados(SEC, 2026);
  ok(xs.cat.k === 'extremo' && /EXTREMO/.test(hs), '(4) caso de prevenção secundária: EXTREMO');
  ok(/Sem escore: com doença aterosclerótica \(prevenção secundária\)/.test(hs) && !/<td>Doença cardiovascular total/.test(hs), '(4) em prevenção secundária não há tabela do PREVENT, e a tela diz por quê');
  ok(/É redução ADICIONAL ao esquema atual/.test(hs) && /A redução mínima de 50% é sobre o LDL-c de antes do tratamento/.test(hs), '(4) em estatina: redução adicional, e o aviso de que a redução mínima é sobre o LDL-c de antes');
  const jovem = M.rcvPreventHTML(M.rcvDados(Object.assign({}, PRIM, { idade: '25' }), 2026)), velho = M.rcvPreventHTML(M.rcvDados(Object.assign({}, PRIM, { idade: '84' }), 2026));
  ok(/menos de 30 anos \(§4\.9\)/.test(jovem) && /vai até 79 anos/.test(velho), '(4) fora de 30–79 a tela diz por que não há escore (§4.8; §4.9)');
  ok(/Faltam para o PREVENT: .*creatinina \(TFGe\)/.test(M.rcvPreventHTML(M.rcvDados(Object.assign({}, PRIM, { cr: '' }), 2026))), '(4) sem creatinina, a tela diz o que falta para o PREVENT');
  // Cartões: cada um com a fonte; PA pela DBHA 2025.
  ok(/&lt; 130\/80/.test(hp) && /Diretriz Brasileira de Hipertensão Arterial 2025 \(SBC\/SBH\/SBN\)/.test(hp) && /fora da meta/.test(hp), '(4) cartão de PA: < 130/80 com a fonte da DBHA 2025');
  ok(M.RCV_META_PA.pas === 130 && M.RCV_META_PA.pad === 80, '(4) a meta de PA da DBHA 2025 é < 130/80 (cap. 5, forte/alta)');
  ok(/&lt; 7% para a maioria \(individualizada\)/.test(hs) && /iSGLT2 ou aGLP-1/.test(hs) && /SBD\/ADA/.test(hs), '(4) cartão do diabetes: HbA1c < 7% individualizada (SBD/ADA) e iSGLT2/aGLP-1 com doença aterosclerótica');
  ok(/IMC 18,5–24,9/.test(hp) && /sobrepeso/.test(hp) && /Classes de IMC da OMS/.test(hp), '(4) cartão de peso pelas classes de IMC da OMS');
  ok(/cessação completa/.test(hp) && /SBC 2025 \(T4\.2; T4\.6\)/.test(hp), '(4) cartão de tabagismo: cessação');
  ok((hp.match(/class="rcv-card"/g) || []).length === (hp.match(/class="rcv-card-f"/g) || []).length, '(4) todo cartão tem a linha da fonte');
  const idoso = M.rcvCartoesHTML(M.rcvDados(Object.assign({}, PRIM, { idade: '82' }), 2026)), dial = M.rcvCartoesHTML(M.rcvDados(Object.assign({}, PRIM, { dial: 'hemo' }), 2026));
  ok(/menor valor tolerado/.test(idoso) && /&lt; 140\/90 antes da sessão ou &lt; 130\/80 depois/.test(dial), '(4) exceções da DBHA: ≥ 80 anos e diálise');
  // Um `style` por elemento; a categoria de muito alto e extremo não é verde.
  for (const h of [hp, hs, M.rcvFormHTML(PRIM), M.rcvFormHTML(SEC)]) ok(!/<[^>]*\sstyle="[^"]*"[^>]*\sstyle="/.test(h), '(4) elemento com dois atributos style');
  ok(M.SBC_COR.muitoalto === 'tag-red' && M.SBC_COR.extremo === 'tag-red' && /tag tag-red rcv-cat">EXTREMO/.test(hs), '(4) ⚠️ muito alto e extremo em vermelho (D17)');
  // Campo escapado: o valor volta ao formulário pelo atributo value.
  const inj = M.rcvFormHTML({ idade: '"><img src=x onerror=1>' });
  ok(inj.indexOf('<img src=x') < 0 && /value="&quot;&gt;&lt;img src=x onerror=1&gt;"/.test(inj), '(4) o valor do campo tem de voltar escapado');
  // Formulário: seções na ordem, "Não sei" explícito, condicionais.
  const f = M.rcvFormHTML({});
  const ord = ['1 · Doença aterosclerótica', '2 · Dados clínicos', '3 · Tratamentos e hábitos', '4 · Diabetes', '5 · Aterosclerose subclínica', '6 · Fatores agravantes'].map((t) => f.indexOf(t));
  ok(ord.every((p, i) => p > 0 && (i === 0 || p > ord[i - 1])), '(4) as seis seções do formulário, na ordem do roteiro');
  ok((f.match(/data-rcv-v="ns" aria-pressed="false">Não sei</g) || []).length >= 20 && /data-rcv-v="na" aria-pressed="false">Não avaliada</.test(f) && /data-rcv-v="nao" aria-pressed="false">Não fez</.test(f),
    '(4) "Não sei", "Não avaliada" e "Não fez" são respostas explícitas');
  ok(/data-rcv-se="ev=sim"/.test(f) && /data-rcv-se="dm=DM2,DM1"/.test(f) && /data-rcv-se="sexo=F"/.test(f) && /data-rcv-se="@mais1"/.test(f), '(4) os trechos que aparecem conforme a resposta');
  ok(M.rcvVisivel('dm=DM2,DM1', { dm: 'DM1' }) && !M.rcvVisivel('dm=DM2,DM1', { dm: 'ns' }) && M.rcvVisivel('@mais1', { ev: 'sim', e_iam: '1' }) && !M.rcvVisivel('@mais1', { ev: 'sim', e_iam: '1', e_avc: '1' }),
    '(4) visibilidade: "mais de um evento maior?" só com um território marcado');
  ok(!/Clarity/i.test(html), '(4) nada de marca de terceiros no app');
  // Campo escondido não conta: tipos de evento marcados e depois "Não".
  ok(M.rcvDados({ ev: 'nao', e_iam: '1', e_avc: '1', sexo: 'M', idade: '50' }, 2026).cat.nMaiores === 0, '(4) evento marcado atrás de "Não" não pode contar');
  ok(/Preencha o formulário/.test(M.rcvResultadoHTML({})) && /Imprimir relatório/.test(M.rcvResultadoHTML({})) && !/Imprimir relatório/.test(M.rcvResultadoHTML(PRIM, true)), '(4) tela vazia, botões e folha de impressão sem botões');
  ok(/TFGe/.test(M.rcvResumoDados(xp)) && /Estatina:<\/b> não usa/.test(M.rcvResumoDados(xp)) && /Estatina:<\/b> usa/.test(M.rcvResumoDados(xs)) && /CT\/HDL-c\/LDL-c:<\/b> 228 \/ 41 \/ 148 mg\/dL/.test(M.rcvResumoDados(xp))
    && !/TG|sem tratamento|Hipolipemiante/.test(M.rcvResumoDados(xp) + M.rcvResumoDados(xs)), '(4) o resumo dos dados para o relatório impresso (sem TG nem LDL-c sem tratamento)');
  // CKD-EPI 2021 (sem raça): a mesma conta nas duas calculadoras.
  const ck = (cr, idade, fem) => { const k = fem ? 0.7 : 0.9, a = fem ? -0.241 : -0.302; return 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.2) * Math.pow(0.9938, idade) * (fem ? 1.012 : 1); };
  ok([[1, 60, false], [0.6, 40, true], [2.5, 75, false], [1.3, 67, false]].every(([c, i, f]) => Math.abs(M.ckdEpi2021(c, i, f) - ck(c, i, f)) < 1e-9) && isNaN(M.ckdEpi2021(NaN, 50, true)),
    '(4) CKD-EPI 2021 diferente da fórmula publicada');
  ok(Math.round(xs.tfge) === 60 && /G2 \+ A2/.test(hs), '(4) a TFGe calculada entra na matriz renal (creatinina 1,3, 67 anos → G2; RAC 45 → A2)');
}

// ───────────────────── (5) fiação e o PREVENT antigo ─────────────────────
{
  const iC = html.indexOf('var CALCS=[');
  const iR = html.indexOf("{id:'riscocv'", iC), iP = html.indexOf("{id:'prevent',", iC);
  ok(iR > iC && iP > iR, '(5) o item "riscocv" tem de vir em CALCS ANTES do PREVENT (Lípides continua a primeira área)');
  const item = html.slice(iR, iP);
  ok(/name:'Risco CV e metas — SBC 2025',area:'Lípides',unit:'categoria SBC'/.test(item) && /render:function\(root\)\{rcvRender\(root\);\}/.test(item) && /note:'Diretriz Brasileira de Dislipidemias/.test(item),
    '(5) o item da calculadora (nome, área, unidade, render, nota com as fontes)');
  const oc = corpo('openCalc');
  ok(/if\(typeof c\.render==='function'\)\{/.test(oc) && /c\.render\(alvo\)/.test(oc) && /det\.querySelector\('#calc-close'\)/.test(oc.slice(oc.indexOf("typeof c.render"))), '(5) openCalc ganhou o caminho `render`, com o "← Voltar"');
  ok(/if\(!c\|\|typeof c\.render==='function'\)return;/.test(corpo('calcUpdate')), '(5) calcUpdate não pode tentar ler `fields` da calculadora de tela própria');
  ok(/return sbcEstratifica\(sbcDadosDoPrevent\(escore,v\)\);/.test(corpo('sbcCategoria')), '(5) ⚠️ o bloco de metas do PREVENT tem de usar o MESMO motor da calculadora nova');
  ok(/ckdEpi2021\(/.test(html.slice(html.indexOf("{id:'ckdepi'"), html.indexOf("{id:'ldl',"))), '(5) a calculadora de TFG usa a mesma função CKD-EPI 2021');
  ok(/opts:\['Não','Sim, tipo 2','Sim, tipo 1'\],vals:\[0,1,2\]/.test(html.slice(iP, html.indexOf("{id:'imc'", iP))), '(5) o PREVENT separa DM1 de DM2 (T4.5)');
  // O PREVENT antigo pelo motor novo: D1 (EAR que o formulário coleta), D4 (fora de 30–79), D9 (20,0%), D12 (DM e escore).
  const pac = (o) => Object.assign({ pv_sexo: '0', pv_idade: '48', pv_dm: '0', pv_ct: '200', pv_hdl: '50' }, o);
  ok(M.sbcCategoria(3, pac({ pv_dm: '1', pv_fum: '1' })).k === 'alto', '(5) D1: DM2 jovem FUMANTE no PREVENT é alto (tabagismo é EAR, T4.6)');
  ok(M.sbcCategoria(3, pac({ pv_dm: '1', pv_egfr: '40', pv_uacr: '120' })).k === 'muitoalto', '(5) D1: DM2 com G3b + A2 no PREVENT é muito alto (T4.7)');
  ok(M.sbcCategoria(3, pac({ pv_dm: '1', pv_ct: '320' })).k === 'muitoalto', '(5) D2: DM2 com CT > 310 é muito alto (T4.8)');
  ok(M.sbcCategoria(25, pac({ pv_idade: '25' })).k === 'baixo' && /fora de 30–79 anos o escore não categoriza/.test(M.ldlAlvoHTML(25, pac({ pv_idade: '25' }))),
    '(5) D4: aos 25 anos um escore extrapolado de 25% não faz ninguém alto (§4.9)');
  ok(M.sbcCategoria(3, pac({ pv_idade: '85' })).k === 'alto', '(5) D4: com 85 anos, alto pelo §4.8 (leitura E-20), não pelo escore extrapolado');
  ok(M.ldlFaixaEscore(20) === 'alto' && M.ldlFaixaEscore(19.99) === 'intermediario' && M.ldlFaixaEscore(4.99) === 'baixo', '(5) D9: faixa do escore com "≥ 20%" e o nome "intermediário"');
  const d12 = M.ldlAlvoHTML(25, pac({ pv_dm: '1', pv_sexo: '1', pv_idade: '45', pv_fum: '0', pv_ahas: '0', pv_egfr: '95', pv_uacr: '10' }));
  ok(/CATEGORIA SBC · INTERMEDIÁRIO/.test(d12) && /a faixa do escore é alta, mas no diabetes a categoria sai das tabelas do DM \(§4\.1\)/.test(d12), '(5) D12: no DM jovem sem EAR o escore ≥ 20% não sobe a categoria');
  ok(M.sbcCategoria(3, pac({ pv_dm: '2', pv_idade: '45' })).k === 'intermediario' && M.sbcCategoria(3, pac({ pv_dm: '2', pv_idade: '45' })).pendencias.some((p) => /duração do DM1/.test(p.t)),
    '(5) D6: DM1 no PREVENT não usa o corte 50/56 do DM2, e pede a duração');
  ok(M.sbcCategoria(3, pac({ pv_dm: '1', pv_idade: '60' })).pendencias.some((p) => /Estratificadores do diabetes em aberto/.test(p.t))
    && /O que ainda pode subir a categoria \(este formulário não pergunta tudo\)/.test(M.ldlAlvoHTML(3, pac({ pv_dm: '1', pv_idade: '52' }))),
    '(5) o bloco do PREVENT mostra o que o formulário não perguntou como "pode subir"');
  const d3 = M.ldlAlvoHTML(3, pac({ pv_dm: '1', pv_sexo: '1', pv_idade: '55', pv_ldl: '65' }));
  ok(/precisa cair <b>≥ 50%<\/b>/.test(d3) && /alvo ≤ 32 mg\/dL/.test(d3) && !/já abaixo da meta/.test(d3) && /falta a redução mínima de 50%/.test(d3), '(5) D3/F15 no PREVENT: LDL-c 65 sem tratamento no alto precisa cair à metade (alvo ≤ 32)');
  const d14 = M.ldlAlvoHTML(8, pac({ pv_idade: '60', pv_ldl: '100' }));
  ok(/no limite da meta/.test(d14) && !/já abaixo da meta/.test(d14), '(5) D14: LDL-c igual à meta não está "abaixo da meta"');
  const d8 = M.ldlAlvoHTML(2, pac({ pv_idade: '60', pv_ct: '230', pv_hdl: '40', pv_ldl: '110' }));
  ok(/[Hh]á gatilho farmacológico pelo não-HDL-c/.test(d8) && /precisa cair/.test(d8), '(5) D8: com o LDL-c na meta e o não-HDL-c ≥ 30 acima, a conduta diz que o gatilho veio do não-HDL-c e trata');
  ok(/estatina só se o LDL-c ou o não-HDL-c persistirem/.test(M.LDL_METAS.baixo.terapia) && /Lp\(a\) &gt; 180/.test(M.LDL_METAS.alto.quando) && /CAC &gt; 300/.test(M.LDL_METAS.muitoalto.quando)
    && /LDL-c &lt; 160/.test(M.LDL_METAS.baixo.quando), '(5) D10/D19: o quadro com os critérios completos da T4.1/F5.1');
  ok(M.LDL_METAS.baixo.ldl === 115 && M.LDL_METAS.intermediario.ldl === 100 && M.LDL_METAS.alto.ldl === 70 && M.LDL_METAS.muitoalto.ldl === 50 && M.LDL_METAS.extremo.ldl === 40, '(5) os números de LDL_METAS não mudam');
  ok(/mais de 90%/.test(M.ldlEsquemaPelaReducao(88, false)) && /≈ 85%/.test(M.ldlEsquemaPelaReducao(70, false)), '(5) D13: o triplo reduz ≈ 85% (Figura 7.2) e a quádrupla, mais de 90%');
  ok(/cerca de 4 semanas/.test(M.ldlCondutaHTML(M.sbcCategoria(25, pac({})), M.LDL_METAS.alto, 150, false)), '(5) D15: reavaliar em cerca de 4 semanas (§7.1)');
  const nota = html.slice(iP, html.indexOf("{id:'prevent30'", iP));
  ok(!/Reestratificar o risco moderado pelo escore de cálcio/.test(nota) && /intermediário 5 a &lt; 20%|intermediário 5 a < 20%/.test(nota), '(5) D9/D18: a nota do PREVENT com as faixas e o reclassificador da diretriz');
  // ── Revisão de 24/10 no PREVENT antigo e na tela nova ──
  // B2: LDL-c igual à meta estrita, em estatina — antes "precisa cair ≥ 1% além do que a estatina atual já faz: ." (esquema vazio).
  const b2 = M.ldlAlvoHTML(25, pac({ pv_sexo: '1', pv_idade: '60', pv_ldl: '70', pv_est: '1' }));
  ok(/no limite da meta \(ela é &lt; 70, estrita\): basta <b>qualquer redução<\/b>/.test(b2) && !/precisa cair <b>≥ 1%/.test(b2) && !/: \./.test(b2) && /associar <b>ezetimiba<\/b>/.test(b2) && !/\+0 acima/.test(b2),
    '(5) ⚠️ B2: no PREVENT antigo, LDL-c de 70 no alto em estatina: "no limite da meta", com o esquema (EZE), sem frase vazia nem "+0 acima"');
  // M3: LDL-c na meta e não-HDL-c acima, no alto — não "manter".
  const m3 = M.ldlAlvoHTML(25, pac({ pv_sexo: '1', pv_idade: '60', pv_ct: '200', pv_hdl: '40', pv_ldl: '65', pv_est: '1' }));
  ok(/não basta manter — intensificar o tratamento/.test(m3) && !/manter o esquema e reavaliar/.test(m3), '(5) ⚠️ M3: no PREVENT antigo, LDL-c na meta com não-HDL-c 160 (meta < 100) pede intensificar');
  // B3: 79,5 anos tem escore; 59,5, o de 30 anos — "até 79" é < 80 e "até 59", < 60.
  const ex = Object.assign({}, PRIM, { idade: '79.5' }), h795 = M.rcvPreventHTML(M.rcvDados(ex, 2026)), h595 = M.rcvPreventHTML(M.rcvDados(Object.assign({}, PRIM, { idade: '59.5' }), 2026));
  ok(/<td>Doença cardiovascular total/.test(h795) && !/vai até 79 anos/.test(h795) && /vai até 79 anos/.test(M.rcvPreventHTML(M.rcvDados(Object.assign({}, PRIM, { idade: '80' }), 2026))), '(5) ⚠️ B3: aos 79,5 anos o PREVENT aparece (antes: vão entre "> 79" e "≥ 80")');
  ok(!/só vai de 30 a 59 anos/.test(h595) && !/<td>—<\/td>/.test(h595), '(5) B3: aos 59,5 anos o PREVENT de 30 anos aparece');
  const h795p = M.ldlAlvoHTML(8, pac({ pv_idade: '79.5' }));
  ok(/CATEGORIA SBC · INTERMEDIÁRIO/.test(h795p) && /por escore de 5 a &lt; 20% em 10 anos/.test(h795p) && !/fora de 30–79 anos o escore não categoriza/.test(h795p) && /fora de 30–79 anos o escore não categoriza/.test(M.ldlAlvoHTML(8, pac({ pv_idade: '80' }))),
    '(5) B3: no PREVENT antigo, 79,5 anos ainda categoriza pelo escore (8% → intermediário)');
  const itemP = html.slice(iP, html.indexOf("{id:'prevent30'", iP)), item30 = html.slice(html.indexOf("{id:'prevent30'", iP), html.indexOf("{id:'imc'", iP));
  ok(/var fora=\(idade>=30&&idade<80\)/.test(itemP) && (item30.match(/idade<30\|\|idade>=60/g) || []).length === 2 && !/idade<=79|idade>59/.test(itemP + item30), '(5) B3: a tarja do PREVENT e o de 30 anos usam < 80 e < 60');
}

// ───────────────────── (6) mutações ─────────────────────
function mutante(fn, de, para) {
  const alvo = corpo(fn);
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica (o código mudou): ' + fn + ': ' + de);
  return mundo(html.replace(alvo, alvo.replace(de, para)));
}
const Em = (W, o) => { const d = base(); Object.keys(o).forEach((k) => { d[k] = o[k]; }); return W.sbcEstratifica(d); };
ok(Em(mutante('sbcEstratifica', "else if(nMaiores===1&&COND.length>=2)", "else if(false)"), { sexo: 'M', idade: 68, ev: { iam: true }, evento2a: true, has: true }).k !== 'extremo',
  'MUTAÇÃO: sem a regra "1 evento maior + 2 condições", F16 deixaria de ser extremo');
ok(Em(mutante('sbcEstratifica', "if(dur>10)EAR.push", "if(dur>=10)EAR.push"), { sexo: 'M', idade: 45, dm: 'DM2', dmDuracao: 10, nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } }).k !== 'intermediario',
  'MUTAÇÃO: "≥ 10 anos" no lugar de "> 10 anos" tinha de mudar o DM2 de 10 anos exatos');
ok(Em(mutante('sbcEstratifica', "if(idade>=65)COND.push", "if(idade>=70)COND.push"), { sexo: 'M', idade: 68, ev: { iam: true }, evento2a: true, tfge: 90 }).k !== 'extremo',
  'MUTAÇÃO: mexer no corte de 65 anos da condição tinha de mudar o extremo');
ok(Em(mutante('sbcEstratifica', "if(num(d.cac)&&d.cac>300)", "if(num(d.cac)&&d.cac>350)"), { sexo: 'M', idade: 55, prevent: 6, cac: 350 }).k !== 'muitoalto',
  'MUTAÇÃO: CAC > 350 no lugar de > 300 tinha de derrubar o F20');
ok(Em(mutante('sbcEstratifica', "if(lpaAg)agSim.push(lpaTxt);", ""), { sexo: 'F', idade: 62, prevent: 8, ldl: 128, lpa: { v: 60, un: 'mg' } }).k !== 'alto',
  'MUTAÇÃO: sem a Lp(a) como agravante, o F3 deixaria de ser alto');
ok(Em(mutante('sbcEstratifica', "if(temAg)dispara('alto','escore de 5 a < 20% em 10 anos com agravante", "if(false)dispara('alto','escore de 5 a < 20% em 10 anos com agravante"), { sexo: 'F', idade: 62, prevent: 8, ldl: 128, ag: { les: true } }).k !== 'alto',
  'MUTAÇÃO: sem "intermediário + agravante → alto" (T4.1) o teste tinha de ver');
ok(Em(mutante('sbcEstratifica', "if(temIdade&&idade>=30&&idade<80&&num(escore))", "if(temIdade&&idade>=18&&num(escore))"), { sexo: 'M', idade: 25, prevent: 25 }).k !== 'baixo',
  'MUTAÇÃO: deixar o escore categorizar abaixo de 30 anos (D4) tinha de aparecer');
ok(Math.abs(mutante('sbcAlvoLDL', 'var porPct=teto<m.ldl', 'var porPct=false').sbcAlvoLDL('alto', 65, NaN, false, 100).red - 50) > 1,
  'MUTAÇÃO: sem a redução mínima no alvo, o F15 voltaria a "abaixo da meta"');
{
  // A errata: desfazer a troca num array tinha de derrubar a validação.
  const ia = html.indexOf('"hba1c_10yr":{k:[');
  const linhaF = html.slice(html.indexOf('\n  f:{cvd:[', ia) + 1, html.indexOf('\n', html.indexOf('\n  f:{cvd:[', ia) + 1));
  const lista = linhaF.slice(linhaF.indexOf('stroke:[') + 8, linhaF.indexOf(']', linhaF.indexOf('stroke:[')));
  const t = lista.split(','), x = t[22]; t[22] = t[23]; t[23] = x;
  const W = mundo(html.replace(linhaF, linhaF.replace('stroke:[' + lista + ']', 'stroke:[' + t.join(',') + ']')));
  ok(Math.abs(W.preventRisk(V(com({ hba1c: 9.2 }), 'f')).stroke - 6.7) >= 0.05, 'MUTAÇÃO: desfazer a errata no AVC tinha de tirar o valor da tolerância');
  // B7 (revisão de 24/10): o comentário da procedência dizia que a errata muda "até 4
  // p.p."; nas faixas válidas chega a ~15 (AVC da mulher com diabetes e HbA1c 15, risco
  // perto de 50%). O número do comentário tem de ser o medido.
  const pior = { pv_sexo: '0', pv_idade: '51', pv_ct: '130', pv_hdl: '50', pv_pas: '200', pv_egfr: '30', pv_imc: '18.5', pv_dm: '1', pv_fum: '1', pv_ahas: '0', pv_est: '0', pv_hba1c: '15', pv_uacr: '' };
  const dif = Math.abs(M.preventRisk(pior).stroke - W.preventRisk(pior).stroke);
  const proc = html.slice(html.indexOf('// ⚠️ ERRATA DE 14/10/2026'), html.indexOf('\nvar PREVENT_COEFS='));
  ok(dif > 14 && dif < 15.5 && /chega a ~15 p\.p\./.test(proc) && !/até 4 p\.p\./.test(proc), '(1) B7: o comentário da errata tem de trazer a diferença medida nas faixas válidas (~15 p.p.; deu ' + dif.toFixed(2) + ')');
}
// Revisão de 24/10: uma mutação por item de gravidade alta ou média, e as de B1, B5 e B8.
{
  const semEAR = { nac: 'ausente', retino: 'ausente', tfge: 95, rac: 10, ag: { hfam: false, sm: false } };
  ok(Em(mutante('sbcEstratifica', '(idade>=56||(M&&idade>=50))', '((M&&idade>=50)||(F&&idade>=56))'), Object.assign({ sexo: null, idade: 60, dm: 'DM2', dmDuracao: 3 }, semEAR)).k !== 'alto',
    'MUTAÇÃO A1: voltar ao corte que exige o sexo tinha de rebaixar o DM2 de 60 anos com sexo em branco');
  ok(Em(mutante('sbcEstratifica', 'cnd(ev.sca12m===true?true:d.evento2a,', 'cnd(d.evento2a,'), { sexo: 'M', idade: 70, ev: { iam: true, sca12m: true }, tfge: 90 }).k !== 'extremo',
    'MUTAÇÃO M1: sem "SCA recente ⇒ evento < 2 anos", IAM + SCA aos 70 anos deixaria de ser extremo');
  ok(Em(mutante('sbcEstratifica', 'var ldlMin=num(basal)?(basalBaixo?ldl:basal):', 'var ldlMin=num(basal)?basal:'), { sexo: 'M', idade: 50, prevent: 3, ldl: 200, ldlBasal: 150, trat: { estatina: 'alta' } }).k !== 'alto',
    'MUTAÇÃO M2: valer o "basal" menor que o atual tinha de derrubar o LDL-c 200 sob estatina');
  ok(Em(mutante('sbcEstratifica', 'if(!dcva&&temIdade&&idade>=80)dispara(', 'if(!temDM&&!dcva&&temIdade&&idade>=80)dispara('), Object.assign({ sexo: 'F', idade: 85, dm: 'DM1', dmDuracao: 10 }, semEAR)).k !== 'alto',
    'MUTAÇÃO B5: a regra dos 80 anos só sem diabetes tinha de deixar o DM1 de 85 anos no intermediário');
  const AIT = { sexo: 'M', idade: '60', ct: '200', hdl: '50', pas: '120', cr: '1', peso: '80', altura: '178', tab: 'nao', ahas: 'nao', has: 'nao', dm: 'nao', ev: 'sim', e_ait: '1', lpa_un: 'nd' };
  const Wa2 = mutante('rcvEstrategiasHTML', "emEst=est==='sim'", 'emEst=false');
  ok(/sugerida/.test(Wa2.rcvEstrategiasHTML(Wa2.rcvDados(Object.assign({}, AIT, { ldl: '90', est: 'sim' }), 2026))),
    'MUTAÇÃO: tratar quem usa estatina como "sem tratamento" tinha de voltar a sugerir linha da figura (redução total) a quem já trata');
  const Wb1 = mutante('rcvEstrategiasHTML', 'prev<a.alvo-1e-9', 'prev<=a.alvo+1e-9');
  const hb1 = Wb1.rcvEstrategiasHTML(Wb1.rcvDados(Object.assign({}, AIT, { ldl: '200', est: 'nao' }), 2026));
  ok(/✓ sim/.test((hb1.match(/<td>EAI \+ EZE \+ ABp(?: <span class="rcv-fonte">[^<]*<\/span>)?<\/td>[\s\S]*?<\/tr>/) || [''])[0]), 'MUTAÇÃO B1: igualar o alvo estrito tinha de dar "✓ sim" ao esquema que leva a exatamente 50');
  const Wd = mutante('rcvDestaqueHTML', 'sbcN(r.cvd,1)', 'sbcN(r.ascvd,1)');
  const xd = Wd.rcvDados(PRIM, 2026);
  ok(Wd.rcvDestaqueHTML(xd).indexOf('rcv-c-red">' + M.sbcN(xd.r.cvd, 1) + '%') < 0, 'MUTAÇÃO: o número grande do destaque tem de ser o da DCV total (o da figura), não o da DASCV');
  const Wf = mutante('fib4Faixa', 'f<=2.67', 'f<2.67');
  ok(Wf.fib4Faixa(2.67, 50).k !== 'indet', 'MUTAÇÃO: o FIB-4 de 2,67 é indeterminado (acima de 2,67, provável)');
  // B8: mexer no termo da TFGe < 60 (ou na interação com a idade) da DAC, ou no da PAS < 110 do AVC, no modelo base, tinha de tirar os perfis novos da tolerância.
  const lin = linhaVar('PREVENT_COEFS'), W0 = vm.createContext({});
  vm.runInContext(lin + '\nthis.P=PREVENT_COEFS;', W0);
  const fora = (sx, out, i) => {
    const P = JSON.parse(JSON.stringify(W0.P)); P[sx][out][i] += 0.1;
    const Wm = mundo(html.replace(lin, 'var PREVENT_COEFS=' + JSON.stringify(P) + ';'));
    let maior = 0;
    B8.filter((r) => r[1] === 'base' && r[2] === sx).forEach(([pf, mo, s2, hz, vals]) => { const r = Wm.preventRisk(V(com(B8_PERFIL[pf]), s2)); OUT.forEach((o, j) => { maior = Math.max(maior, Math.abs(r[o + (hz === 30 ? '30' : '')] - vals[j] * 100)); }); });
    return maior;
  };
  ok(fora('m', 'chd', 10) > 0.05 && fora('m', 'chd', 22) > 0.05 && fora('f', 'stroke', 4) > 0.05 && fora('f', 'stroke30', 4) > 0.05,
    'MUTAÇÃO B8: os perfis de TFGe < 60 e PAS < 110 tinham de pegar um erro nos termos de DAC e AVC');
}

// ───────────────────── (8) a fórmula original (31/10/2026) ─────────────────────
// Pedido do professor: sem o LDL-c sem tratamento e sem triglicérides; estatina só
// "usa / não usa"; sem ezetimiba, ácido bempedoico, anti-PCSK9 e intolerância; com
// TGO, TGP e plaquetas; e o risco em 10 anos em destaque, como a figura que ele mandou.
{
  const f = M.rcvFormHTML({});
  ok(!/data-rcv-k="(ldlb|tg|eze|abp|pcsk9|intol)"/.test(f) && !/LDL-c sem tratamento|Triglicérides|Ezetimiba|Ácido bempedoico|Anti-PCSK9|Intolerância à estatina|Martin\/Hopkins/.test(f),
    '(8) o formulário não pode ter LDL-c sem tratamento, triglicérides, ezetimiba, ácido bempedoico, anti-PCSK9 nem intolerância');
  const estBotoes = f.match(/data-rcv-k="est" data-rcv-v="[^"]*"/g) || [];
  ok(/>Usa estatina</.test(f) && estBotoes.join() === 'data-rcv-k="est" data-rcv-v="sim",data-rcv-k="est" data-rcv-v="nao"', '(8) estatina só "Sim / Não", sem intensidade: ' + estBotoes.join());
  ok(/data-rcv-k="ast"/.test(f) && /data-rcv-k="alt"/.test(f) && /data-rcv-k="plaq"/.test(f) && /data-rcv-calc="fib4"/.test(f) && />TGO\/AST \(U\/L\)</.test(f) && />Plaquetas \(mil\/mm³\)</.test(f),
    '(8) TGO, TGP e plaquetas no formulário, com o FIB-4 calculado embaixo');
  ok(/>LDL-c \(mg\/dL\)</.test(f), '(8) o LDL-c é o do laudo, com o rótulo simples');
  // 31/10/2026, pedido do professor: sem as notas do FIB-4, da estatina e da doença renal no formulário.
  ok(!/FIB-4 = idade|o LDL-c do laudo já é sob tratamento|A doença renal entra pela TFGe/.test(f) && (f.match(/rcv-bloco-dica/g) || []).length === 3,
    '(8) o formulário não tem as três notas que o professor tirou (FIB-4, estatina e doença renal); ficam as outras três');
  // 31/10/2026, pedido do professor: o agravante é a adiposidade visceral, pela circunferência abdominal.
  ok(/>Adiposidade visceral <span class="rcv-dica">circunferência abdominal &gt; 80 cm em mulheres e &gt; 94 cm em homens<\/span>/.test(f)
    && /adiposidade visceral/.test(E({ sexo: 'M', idade: 55, prevent: 8, ldl: 120, ct: 190, hdl: 50, ag: { adip: true } }).motivo), '(8) "Adiposidade visceral", com a circunferência abdominal no subtítulo e no motivo');
  // FIB-4: a conta, a conversão da contagem absoluta e as faixas (as da calculadora FIB-4).
  ok(Math.abs(M.fib4Calc(55, 40, 30, 200) - 55 * 40 / (200 * Math.sqrt(30))) < 1e-12 && M.fib4Calc(55, 40, 30, 200000) === M.fib4Calc(55, 40, 30, 200)
    && isNaN(M.fib4Calc(NaN, 40, 30, 200)) && isNaN(M.fib4Calc(55, 40, 0, 200)), '(8) FIB-4 = idade × TGO ÷ (plaquetas × √TGP), com a contagem absoluta convertida');
  ok(M.fib4Faixa(1.29, 50).k === 'baixo' && M.fib4Faixa(1.3, 50).k === 'indet' && M.fib4Faixa(1.9, 70).k === 'baixo' && M.fib4Faixa(1.9, 65).k === 'indet'
    && M.fib4Faixa(2.67, 50).k === 'indet' && M.fib4Faixa(2.68, 50).k === 'alto' && M.fib4Faixa(NaN, 50) === null, '(8) faixas do FIB-4: < 1,30 (< 2,0 acima de 65), até 2,67 e acima');
  const itF = html.slice(html.indexOf("{id:'fib4'"), html.indexOf("{id:'trp'"));
  ok(/fib4Calc\(/.test(itF) && /fib4Faixa\(/.test(itF) && !/var low=/.test(itF), '(8) a calculadora FIB-4 usa a mesma conta e as mesmas faixas');
  // No motor: o FIB-4 qualifica a esteatose informada; sozinho, não é agravante.
  const D = { sexo: 'M', idade: 55, prevent: 8, ldl: 120, ct: 190, hdl: 50, fib4: 2.1 };
  const comE = E(Object.assign({}, D, { ag: { masld: true } }));
  ok(comE.k === 'alto' && /esteatose hepática \(MASLD\), FIB-4 de 2,10: fibrose indeterminada/.test(comE.motivo), '(8) esteatose informada com FIB-4: agravante, com o FIB-4 no motivo');
  const aberto = E(Object.assign({}, D, { ag: {} }));
  ok(aberto.k === 'intermediario' && aberto.pendencias.some((p) => p.sobe === 'alto' && /esteatose hepática \(MASLD\), FIB-4 de 2,10: fibrose indeterminada/.test(p.t)),
    '(8) ⚠️ FIB-4 alterado com a esteatose em aberto: pendência "pode subir", nunca agravante sozinho');
  const nao = E(Object.assign({}, D, { fib4: 3.2, ag: { masld: false } }));
  ok(nao.k === 'intermediario' && nao.alertas.some((a) => /FIB-4 de 3,20 \(fibrose avançada provável\) com a esteatose hepática marcada como "Não": o FIB-4 sozinho não é agravante/.test(a)),
    '(8) FIB-4 alto com a esteatose marcada "Não": não é agravante, e a tela avisa');
  ok(E(Object.assign({}, D, { ag: { masld: true }, fib4: NaN })).motivo.indexOf('esteatose hepática (MASLD)') > 0, '(8) sem FIB-4, a esteatose aparece como antes');
  // Transaminases acima de 3× o limite usual: o aviso da rec. §9.12.
  ok(E(Object.assign({}, D, { alt: 130 })).alertas.some((a) => /TGO ou TGP acima de 120 U\/L/.test(a) && /rec\. §9\.12/.test(a)) && !E(Object.assign({}, D, { alt: 120, ast: 90 })).alertas.some((a) => /TGO ou TGP/.test(a)),
    '(8) TGO ou TGP acima de 120 U/L: aviso de 3× o limite (rec. §9.12)');
  // rcvDados: a estatina "Sim" entra no PREVENT; campos antigos não pesam; LDL-c só o do laudo.
  const xs = M.rcvDados(Object.assign({}, PRIM, { est: 'sim' }), 2026), xn = M.rcvDados(PRIM, 2026);
  ok(xs.d.trat.estatina === 'sim' && xs.cat.lip.emTrat && xs.r && xn.r && xs.r.ascvd !== xn.r.ascvd, '(8) "usa estatina" entra no PREVENT e no motor como tratamento');
  const leg = M.rcvDados(Object.assign({}, PRIM, { ldl: '', tg: '150', ldlb: '250', est: 'alta', eze: 'sim', intol: 'sim' }), 2026);
  ok(isNaN(leg.d.ldl) && isNaN(leg.d.ldlBasal) && leg.d.trat.estatina === null && leg.d.tg === undefined && Object.keys(leg.d.trat).join() === 'estatina',
    '(8) chaves antigas (TG, LDL-c sem tratamento, intensidade, ezetimiba, intolerância) não pesam, e sem o LDL-c do laudo não há estimativa');
  const x4 = M.rcvDados(Object.assign({}, PRIM, { ast: '40', alt: '30', plaq: '200' }), 2026);
  ok(Math.abs(x4.fib4 - 61 * 40 / (200 * Math.sqrt(30))) < 1e-12 && x4.d.fib4 === x4.fib4, '(8) rcvDados calcula o FIB-4 com a idade do formulário');
  ok(/<b>TGO\/TGP:<\/b> 40 \/ 30 U\/L/.test(M.rcvResumoDados(x4)) && /<b>Plaquetas:<\/b> 200 mil\/mm³/.test(M.rcvResumoDados(x4)) && /<b>FIB-4:<\/b> 2,23/.test(M.rcvResumoDados(x4)),
    '(8) o relatório impresso traz TGO, TGP, plaquetas e FIB-4');
  // O destaque, como a figura: o selo, o risco em 10 anos (DCV total) em número grande
  // e, logo abaixo, a DASCV, que é o que a SBC usa.
  const dp = M.rcvDestaqueHTML(xn);
  ok(/<span class="tag tag-red rcv-pill">Risco alto<\/span>/.test(dp) && dp.indexOf('<div class="rcv-big rcv-c-red">' + M.sbcN(xn.r.cvd, 1) + '%</div>') > 0
    && /Risco em 10 anos · doença cardiovascular total \(PREVENT\)/.test(dp) && dp.indexOf('DASCV em 10 anos: <b>' + M.sbcN(xn.r.ascvd, 1) + '%</b>') > 0 && /é a DASCV que a SBC usa para categorizar/.test(dp),
    '(8) destaque: selo, DCV total em 10 anos em número grande e a DASCV com o aviso de que é ela que a SBC usa');
  const ds = M.rcvDestaqueHTML(M.rcvDados(SEC, 2026));
  ok(/rcv-pill">Risco extremo</.test(ds) && !/rcv-big"/.test(ds) && !/rcv-big /.test(ds) && /Sem escore: com doença aterosclerótica/.test(ds), '(8) em prevenção secundária, o selo sem número, e o porquê');
  ok(/rcv-pill">Risco intermediário</.test(M.rcvDestaqueHTML(M.rcvDados(Object.assign({}, PRIM, { pcr: '1' }), 2026))) && /rcv-c-gold/.test(M.rcvDestaqueHTML(M.rcvDados(Object.assign({}, PRIM, { pcr: '1' }), 2026))),
    '(8) o número grande tem a cor da categoria');
  const vazio = M.rcvDestaqueHTML(M.rcvDados({ sexo: 'M', idade: '50' }, 2026));
  ok(/rcv-pill">Categoria ainda indeterminada</.test(vazio) && /Faltam para o PREVENT/.test(vazio), '(8) sem dados: categoria indeterminada e o que falta para o PREVENT');
  ok(/Fora do escopo/.test(M.rcvDestaqueHTML(M.rcvDados({ sexo: 'M', idade: '15' }, 2026))), '(8) menos de 18 anos: fora do escopo no destaque');
  const hr = M.rcvResultadoHTML(PRIM);
  ok(hr.indexOf('class="rcv-dest"') > 0 && hr.indexOf('class="rcv-dest"') < hr.indexOf('Categoria e motivo') && hr.indexOf('Categoria e motivo') < hr.indexOf('Resultado detalhado do cálculo de risco'),
    '(8) a ordem da tela: destaque, categoria e motivo, e o resultado detalhado do PREVENT');
  const css = html.slice(html.indexOf('/* rcv-resultado: início'), html.indexOf('/* rcv-resultado: fim'));
  ok(/\.rcv-dest\{/.test(css) && /\.tag\.rcv-pill\{/.test(css) && /\.rcv-big\{/.test(css) && /\.rcv-big\.rcv-c-red\{color:var\(--red\)\}/.test(css), '(8) o estilo do destaque fica no trecho que a folha impressa copia');
  // O calc do formulário: o FIB-4 embaixo das plaquetas (ou o pedido da idade).
  const at = corpo('rcvAtualiza');
  ok(/fib4:isFinite\(x\.fib4\)\?'FIB-4 '\+sbcN\(x\.fib4,2\)/.test(at) && /informe a idade para o FIB-4/.test(at) && !/ldlmh/.test(at), '(8) a linha do FIB-4 embaixo das plaquetas');
  ok(!/function rcvLdlEstimadoTxt|function rcvRegime/.test(html), '(8) as funções do LDL-c estimado e do esquema por intensidade saíram');
}

if (falhas.length) { console.error('test-risco-cv-sbc: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-risco-cv-sbc: ok (PREVENT com DAC/AVC e errata contra S12/preventr ±0,05 p.p., motor SBC 2025 nos casos-ouro F1–F27, "não sei" que não derruba, alvo e estratégias da F7.2, tela, fiação, mutações e a fórmula original: destaque do risco em 10 anos, estatina sim/não e FIB-4)');
