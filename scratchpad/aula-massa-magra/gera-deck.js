// Videoaula Endodirect — "Massa magra e agonistas do receptor de GLP-1"
// 17 slides, 20–30 min, público médico. Notas de apresentação com cronometragem.
//
// ⚠️ REGISTRO TÉCNICO (revisão de 10/08/2026, a pedido do professor). A primeira
// versão usava ponte retórica — "guarde este número", "a história muda", "o que
// separa o dado do susto". Para público médico isso é enchimento. Regra desta
// versão: o título diz o CONTEÚDO, não o efeito narrativo; toda afirmação carrega
// n, desenho e duração; nenhuma frase existe só para criar expectativa.
const pptxgen = require('/tmp/claude-0/-home-user-endodirect/de180d5c-1c6f-539b-bfcc-0c5f54183b96/scratchpad/node_modules/pptxgenjs');

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';                    // 13.333 x 7.5
p.author = 'Prof. Rodolpho Pinto — Endodirect';
p.title = 'Massa magra e AR GLP-1';

const ESCURO = '06333A', TEAL = '028090', MENTA = '00A896', ALERTA = 'E4572E';
const TINTA = '13262B', CINZA = '5C6B70', PAINEL = 'EEF4F4', BRANCO = 'FFFFFF';
const H = 'Cambria', B = 'Calibri';
const W = 13.333, HH = 7.5, M = 0.62;

function slideClaro() { const s = p.addSlide(); s.background = { color: BRANCO }; return s; }
function slideEscuro() { const s = p.addSlide(); s.background = { color: ESCURO }; return s; }
function selo(s, x, y, texto, corFundo, corTexto, d) {
  const dia = d || 0.62;
  s.addShape(p.ShapeType.ellipse, { x, y, w: dia, h: dia, fill: { color: corFundo } });
  s.addText(texto, { x, y, w: dia, h: dia, align: 'center', valign: 'middle',
    fontFace: H, fontSize: dia > 0.7 ? 18 : 15, bold: true, color: corTexto, margin: 0 });
}
function titulo(s, texto, sobre) {
  if (sobre) s.addText(sobre.toUpperCase(), { x: M, y: 0.42, w: W - 2 * M, h: 0.3,
    fontFace: B, fontSize: 12, bold: true, color: MENTA, charSpacing: 2, margin: 0 });
  s.addText(texto, { x: M, y: sobre ? 0.74 : 0.5, w: W - 2 * M, h: 0.9,
    fontFace: H, fontSize: 30, bold: true, color: TINTA, margin: 0, valign: 'top' });
}
function rodape(s, fonte) {
  s.addText(fonte, { x: M, y: HH - 0.62, w: W - 2 * M, h: 0.34,
    fontFace: B, fontSize: 10, italic: true, color: CINZA, margin: 0, valign: 'middle' });
}
function cartao(s, x, y, w, h, cor) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: cor || PAINEL } });
}

// ═══ 1. CAPA ══════════════════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addShape(p.ShapeType.ellipse, { x: 10.3, y: -1.5, w: 5.2, h: 5.2, fill: { color: TEAL, transparency: 78 } });
  s.addShape(p.ShapeType.ellipse, { x: 11.6, y: 4.4, w: 3.4, h: 3.4, fill: { color: MENTA, transparency: 85 } });
  s.addText('ENDODIRECT · VIDEOAULA', { x: M, y: 1.5, w: 9, h: 0.3, fontFace: B, fontSize: 13,
    bold: true, color: MENTA, charSpacing: 3, margin: 0 });
  s.addText('Perda de massa magra sob agonistas do receptor de GLP-1', {
    x: M, y: 2.0, w: 9.2, h: 1.6, fontFace: H, fontSize: 38, bold: true, color: BRANCO, margin: 0, lineSpacing: 44 });
  s.addText('Magnitude, interpretação metodológica e estratégias de mitigação', {
    x: M, y: 3.85, w: 9.2, h: 0.5, fontFace: B, fontSize: 18, color: 'A8CDD1', margin: 0 });
  s.addShape(p.ShapeType.rect, { x: M, y: 4.75, w: 1.5, h: 0.035, fill: { color: ALERTA } });
  s.addText('Prof. Rodolpho Pinto', { x: M, y: 5.05, w: 8, h: 0.34, fontFace: B, fontSize: 15,
    bold: true, color: BRANCO, margin: 0 });
  s.addText('Endocrinologia e Metabologia', { x: M, y: 5.4, w: 8, h: 0.3, fontFace: B, fontSize: 13,
    color: '8FB6BB', margin: 0 });
  s.addNotes('[0:00–1:00] Objetivos da aula.\n\n' +
    'Enuncie os três: (1) quantificar a perda de massa magra sob AR GLP-1; (2) reconhecer as ' +
    'limitações metodológicas dos estudos de composição corporal; (3) aplicar as estratégias de ' +
    'mitigação com respaldo em ensaio randomizado.');
}

// ═══ 2. VINHETA CLÍNICA ═══════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Vinheta clínica', 'Situação de referência');

  cartao(s, M, 1.95, 6.1, 3.4);
  s.addText('Feminina, 62 anos', { x: M + 0.4, y: 2.2, w: 5.3, h: 0.4,
    fontFace: H, fontSize: 20, bold: true, color: TINTA, margin: 0 });
  s.addText([
    { text: 'IMC inicial 34 kg/m²; semaglutida 2,4 mg/sem há 14 meses', options: { bullet: true, breakLine: true } },
    { text: 'Redução ponderal de 18 kg (≈ 19% do peso inicial)', options: { bullet: true, breakLine: true } },
    { text: 'Refere fraqueza; dificuldade para levantar-se sem apoio dos braços', options: { bullet: true, breakLine: true } },
    { text: 'Sem queixa relacionada ao peso', options: { bullet: true } },
  ], { x: M + 0.4, y: 2.72, w: 5.3, h: 2.4, fontFace: B, fontSize: 14.5, color: TINTA, margin: 0, paraSpaceAfter: 8 });

  s.addText('Perguntas a responder', { x: 7.25, y: 2.0, w: 5.5, h: 0.4,
    fontFace: H, fontSize: 20, bold: true, color: TEAL, margin: 0 });
  [['1', 'Qual a magnitude esperada da perda de massa magra?'],
   ['2', 'A perda é adaptativa ou deletéria?'],
   ['3', 'Que intervenções têm respaldo em ensaio randomizado?']].forEach(([n, t], i) => {
    const y = 2.62 + i * 1.0;
    selo(s, 7.25, y, n, TEAL, BRANCO, 0.56);
    s.addText(t, { x: 8.0, y: y - 0.03, w: 4.75, h: 0.62, fontFace: B, fontSize: 15.5,
      color: TINTA, margin: 0, valign: 'middle' });
  });
  s.addNotes('[1:00–2:30] Vinheta.\n\n' +
    'A queixa é funcional, não ponderal — isso define o desfecho que interessa nesta aula.\n\n' +
    'Dificuldade para levantar-se sem apoio dos braços é sinal de fraqueza de extensores de joelho ' +
    'e quadril, e corresponde ao domínio avaliado pelo teste de sentar-levantar cinco vezes.');
  rodape(s, 'Vinheta construída para a aula.');
}

// ═══ 3. MAGNITUDE RELATADA ════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addText('Magnitude relatada da perda de massa magra', { x: M, y: 0.72, w: W - 2 * M, h: 0.7,
    fontFace: H, fontSize: 30, bold: true, color: BRANCO, margin: 0 });
  s.addText('Revisões de 2024 sobre ensaios de 68–72 semanas', { x: M, y: 1.42, w: 11.5, h: 0.34,
    fontFace: B, fontSize: 15, color: '8FB6BB', margin: 0 });

  cartao(s, M, 2.05, 5.85, 1.35, '0B4650');
  s.addText([{ text: '≥ 10%  ', options: { fontSize: 26, bold: true, color: BRANCO, fontFace: H } },
             { text: 'da massa muscular, em 68–72 semanas', options: { fontSize: 14.5, color: 'CFE3E5' } }],
    { x: M + 0.3, y: 2.15, w: 5.25, h: 1.15, fontFace: B, margin: 0, valign: 'middle' });

  cartao(s, M, 3.58, 5.85, 1.35, '0B4650');
  s.addText([{ text: '≈ 6 kg  ', options: { fontSize: 26, bold: true, color: BRANCO, fontFace: H } },
             { text: 'de massa magra em valor absoluto', options: { fontSize: 14.5, color: 'CFE3E5' } }],
    { x: M + 0.3, y: 3.68, w: 5.25, h: 1.15, fontFace: B, margin: 0, valign: 'middle' });

  cartao(s, 7.0, 2.05, 5.7, 2.88, '0B4650');
  s.addText('Referencial de comparação usado pelos autores', { x: 7.3, y: 2.25, w: 5.1, h: 0.4,
    fontFace: H, fontSize: 16, bold: true, color: BRANCO, margin: 0 });
  s.addText('A perda muscular fisiológica do envelhecimento é de ≈ 0,8% ao ano. As duas revisões ' +
    'expressam a magnitude observada como equivalente a uma a duas décadas desse processo, ' +
    'concentradas em pouco mais de um ano de tratamento.', {
    x: 7.3, y: 2.75, w: 5.1, h: 2.0, fontFace: B, fontSize: 14, color: 'CFE3E5', margin: 0 });

  rodape(s, 'Prado CM et al. Obes Rev 2024;25(11):e13818 · Ard J et al. Diabetes Care 2024;47(10):1718–1730.');
  s.addNotes('[2:30–4:30] Magnitude relatada.\n\n' +
    'Estes são os números que circulam. Ambos vêm de revisões narrativas, não de metanálise, e ' +
    'ambos são compatíveis com os dados primários.\n\n' +
    'O referencial de 0,8%/ano é a taxa de sarcopenia fisiológica. A analogia com "décadas de ' +
    'envelhecimento" é dos próprios autores.\n\n' +
    'Os slides seguintes tratam da interpretação desses números.');
}

// ═══ 4. COMPOSIÇÃO DO PESO PERDIDO ════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Composição do peso perdido: DXA e metanálise em rede', 'Dados primários');

  s.addChart(p.ChartType.bar, [
    { name: 'Massa gorda', labels: ['Tirzepatida', 'Placebo'], values: [75, 76] },
    { name: 'Massa magra', labels: ['Tirzepatida', 'Placebo'], values: [25, 24] },
  ], {
    x: M, y: 1.95, w: 6.5, h: 3.5, barDir: 'bar', barGrouping: 'percentStacked',
    chartColors: [TEAL, ALERTA],
    showTitle: true, title: 'SURMOUNT-1, subestudo DXA (n=160), 72 semanas',
    titleFontSize: 13, titleColor: TINTA, titleFontFace: B,
    showValue: true, dataLabelPosition: 'ctr', dataLabelColor: BRANCO,
    dataLabelFontSize: 13, dataLabelFontBold: true, dataLabelFormatCode: '0"%"',
    showLegend: true, legendPos: 'b', legendFontSize: 11, legendColor: TINTA,
    catAxisLabelColor: TINTA, catAxisLabelFontSize: 12, catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
  });

  [['−0,86 kg', 'de massa magra (IC 95% −1,30 a −0,42); 22 ECR, n = 2.258'],
   ['≈ 25%', 'do peso perdido corresponde a massa magra — proporção equivalente à do placebo'],
   ['sem variação', 'da massa magra relativa (% do peso corporal) em relação ao basal']].forEach(([n, t], i) => {
    const y = 2.0 + i * 1.18;
    cartao(s, 7.35, y, 5.35, 1.0);
    s.addText(n, { x: 7.6, y: y + 0.08, w: 2.3, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: TEAL, margin: 0 });
    s.addText(t, { x: 7.6, y: y + 0.46, w: 4.85, h: 0.48, fontFace: B, fontSize: 12.5, color: TINTA, margin: 0 });
  });
  rodape(s, 'Look M et al. Diabetes Obes Metab 2025 (SURMOUNT-1, DXA, n=160) · Ma X et al. Metabolism 2025 (revisão sistemática e metanálise em rede, 22 ECR).');
  s.addNotes('[4:30–7:30] Dados primários.\n\n' +
    'No subestudo DXA do SURMOUNT-1, a razão massa gorda / massa magra do peso perdido foi ' +
    'aproximadamente 75/25 tanto no braço tirzepatida quanto no placebo, e manteve-se estável ' +
    'nas análises por sexo, faixa etária e tercil de perda ponderal.\n\n' +
    'Na metanálise em rede, a redução absoluta de massa magra foi de 0,86 kg. Liraglutida foi o ' +
    'único agente com redução ponderal significativa sem redução significativa de massa magra; ' +
    'tirzepatida 15 mg e semaglutida 2,4 mg produziram a maior perda de peso e de gordura e ' +
    'estiveram entre os menos preservadores de massa magra.\n\n' +
    'A massa magra relativa não se alterou.');
}

// ═══ 5. LIMITAÇÕES METODOLÓGICAS ══════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Limitações metodológicas na interpretação', 'Como ler os estudos de composição corporal');

  [['1', 'Massa livre de gordura ≠ massa muscular',
    'A DXA quantifica massa livre de gordura, compartimento que inclui osso, vísceras, água corporal e o conteúdo hídrico do próprio tecido adiposo. Séries com ressonância magnética mostram redução de volume muscular menor que a redução de massa livre de gordura.'],
   ['2', 'Valor absoluto sem denominador não é interpretável',
    'Uma redução de 6 kg de massa magra tem significado distinto conforme a perda ponderal total tenha sido de 8 kg ou de 25 kg. As variáveis informativas são a fração do peso perdido e a variação da massa magra relativa.'],
   ['3', 'Ausência de comparador',
    'A restrição calórica isolada e a cirurgia bariátrica produzem perda de massa magra na mesma ordem de grandeza. Sem braço-controle, o número não discrimina efeito do fármaco de efeito do balanço energético negativo.']].forEach(([n, t, d], i) => {
    const y = 1.95 + i * 1.28;
    selo(s, M, y + 0.16, n, ALERTA, BRANCO, 0.6);
    s.addText(t, { x: M + 0.86, y: y + 0.02, w: 11.2, h: 0.46, fontFace: H, fontSize: 17, bold: true, color: TINTA, margin: 0 });
    s.addText(d, { x: M + 0.86, y: y + 0.5, w: 11.2, h: 0.72, fontFace: B, fontSize: 12.5, color: CINZA, margin: 0 });
  });
  rodape(s, 'Neeland IJ et al. Diabetes Obes Metab 2024;26 Suppl 4:16–27 · Look M et al. Diabetes Obes Metab 2025.');
  s.addNotes('[7:30–10:30] Limitações metodológicas.\n\n' +
    'Item 1: a nomenclatura importa. "Lean body mass" na DXA é massa livre de gordura, não massa ' +
    'muscular esquelética. Parte da variação corresponde a redistribuição hídrica.\n\n' +
    'Item 2: apresente os dois cenários numéricos de 6 kg.\n\n' +
    'Item 3: no SURMOUNT-1 o comparador existe e a proporção é equivalente. Em estudos de braço ' +
    'único, não há como atribuir a perda ao fármaco em vez do déficit calórico.');
}

// ═══ 6. PERDA ADAPTATIVA × DELETÉRIA ══════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Perda adaptativa × perda deletéria', 'Posições divergentes na literatura');

  cartao(s, M, 1.95, 5.9, 3.5, PAINEL);
  s.addText('Argumentos a favor de adaptação', { x: M + 0.32, y: 2.15, w: 5.3, h: 0.4,
    fontFace: H, fontSize: 17, bold: true, color: TEAL, margin: 0 });
  s.addText([
    { text: 'Redução compatível com a esperada para idade, estado mórbido e magnitude da perda ponderal', options: { bullet: true, breakLine: true } },
    { text: 'Melhora da qualidade muscular: redução da infiltração gordurosa e da resistência insulínica', options: { bullet: true, breakLine: true } },
    { text: 'Heterogeneidade entre ensaios de <15% a 40–60% do peso perdido', options: { bullet: true } },
  ], { x: M + 0.32, y: 2.68, w: 5.3, h: 2.5, fontFace: B, fontSize: 13, color: TINTA, margin: 0, paraSpaceAfter: 9 });

  cartao(s, 6.9, 1.95, 5.8, 3.5, '2A1A16');
  s.addText('Argumentos a favor de dano', { x: 7.22, y: 2.15, w: 5.2, h: 0.4,
    fontFace: H, fontSize: 17, bold: true, color: 'F0A58C', margin: 0 });
  s.addText([
    { text: 'Velocidade sem paralelo fisiológico: magnitude de décadas concentrada em ~1 ano', options: { bullet: true, breakLine: true } },
    { text: 'Massa magra é determinante do gasto energético de repouso; sua redução favorece o reganho', options: { bullet: true, breakLine: true } },
    { text: 'Reserva muscular basal reduzida limita a tolerância à perda', options: { bullet: true } },
  ], { x: 7.22, y: 2.68, w: 5.2, h: 2.5, fontFace: B, fontSize: 13, color: 'F5E6E0', margin: 0, paraSpaceAfter: 9 });

  s.addText('A divergência não se resolve por composição corporal. O critério discriminante é o desfecho funcional.', {
    x: M, y: 5.6, w: 12.1, h: 0.5, fontFace: B, fontSize: 15, bold: true, color: TEAL, margin: 0 });
  rodape(s, 'Neeland IJ et al. Diabetes Obes Metab 2024 · Prado CM et al. Obes Rev 2024 · Mantzoros CS et al. Metabolism 2024;161:156043.');
  s.addNotes('[10:30–13:00] Divergência na literatura.\n\n' +
    'Duas revisões de 2024, ambas em periódicos de referência, chegam a ênfases opostas a partir ' +
    'do mesmo conjunto de ensaios.\n\n' +
    'A posição adaptativa apoia-se em dados de ressonância e em marcadores de qualidade muscular. ' +
    'A posição de dano apoia-se na velocidade e no papel da massa magra no gasto energético.\n\n' +
    'Nenhuma das duas dispõe de desfecho funcional em ensaio randomizado de longo prazo. ' +
    'Por isso o slide seguinte trata de função medida.');
}

// ═══ 7. DESFECHOS FUNCIONAIS ══════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Desfechos funcionais: estudo SEMALEAN', 'Prospectivo, 106 pacientes, 12 meses, sem braço-controle');

  [['−3 kg', 'de massa magra aos 7 meses, com estabilização subsequente', TEAL],
   ['+4,5 kg', 'de força de preensão palmar aos 12 meses', MENTA],
   ['49% → 33%', 'de prevalência de obesidade sarcopênica', TEAL]].forEach(([n, t, cor], i) => {
    const x = M + i * 4.12;
    cartao(s, x, 2.0, 3.85, 2.3);
    s.addText(n, { x: x + 0.26, y: 2.3, w: 3.35, h: 0.72, fontFace: H, fontSize: 28, bold: true, color: cor, margin: 0 });
    s.addText(t, { x: x + 0.26, y: 3.08, w: 3.35, h: 1.0, fontFace: B, fontSize: 13, color: TINTA, margin: 0 });
  });

  cartao(s, M, 4.55, 12.1, 1.25, '0B4650');
  s.addText([{ text: 'Massa e função dissociaram-se. ', options: { bold: true, color: BRANCO, fontSize: 15.5 } },
    { text: 'Perda ponderal média de 13% aos 12 meses, redução de massa gorda de 18%, e gasto energético de repouso normalizado pela massa magra aumentado de 7 para 12 meses.', options: { color: 'CFE3E5', fontSize: 14 } }],
    { x: M + 0.32, y: 4.68, w: 11.45, h: 0.98, fontFace: B, margin: 0, valign: 'middle' });

  rodape(s, 'Estudo SEMALEAN. Diabetes Obes Metab 2026 — semaglutida 2,4 mg; DXA e dinamometria; IMC médio 46,3 kg/m²; 68,9% mulheres.');
  s.addNotes('[13:00–15:30] SEMALEAN.\n\n' +
    'Coorte prospectiva, 115 incluídos e 106 completaram. Avaliações em M0, M7 e M12.\n\n' +
    'A massa magra caiu 3 kg até M7 e estabilizou; a força de preensão aumentou 4,5 kg até M12; ' +
    'a prevalência de obesidade sarcopênica caiu de 49% para 33%.\n\n' +
    'Limitações a explicitar: desenho prospectivo sem braço-controle e sem randomização; a força ' +
    'de preensão pode melhorar por fatores não musculares associados à redução ponderal. ' +
    'Subgrupos: resposta atenuada em diabetes tipo 2 e em uso prévio de análogo de GLP-1.');
}

// ═══ 8. ESTRATIFICAÇÃO DE RISCO ═══════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Estratificação de risco', 'Critérios que qualificam para mitigação ativa');

  ['Idade ≥ 65 anos',
   'Obesidade sarcopênica pelos critérios ESPEN/EASO 2022',
   'Perda ponderal > 20% do peso inicial ou taxa acelerada',
   'Ingestão proteica < 1,0 g/kg/dia, ou intolerância gastrintestinal limitante',
   'Ausência de treinamento resistido regular',
   'Pós-bariátrica, DM2 de longa duração, DRC, neoplasia ativa'].forEach((t, i) => {
    const col = i % 2, lin = Math.floor(i / 2);
    const x = M + col * 6.2, y = 2.0 + lin * 1.02;
    cartao(s, x, y, 5.9, 0.82);
    selo(s, x + 0.24, y + 0.16, '✓', TEAL, BRANCO, 0.5);
    s.addText(t, { x: x + 0.88, y, w: 4.9, h: 0.82, fontFace: B, fontSize: 13.5, color: TINTA, margin: 0, valign: 'middle' });
  });

  s.addText('Rastreio ESPEN/EASO: IMC ou circunferência abdominal elevados associados a marcadores de baixa massa ou função muscular; confirmação por composição corporal e teste funcional.', {
    x: M, y: 5.35, w: 12.1, h: 0.7, fontFace: B, fontSize: 13.5, color: TINTA, margin: 0 });
  rodape(s, 'Donini LM et al. Definition and Diagnostic Criteria for Sarcopenic Obesity: ESPEN and EASO Consensus Statement. Obes Facts 2022;15(3):321–335.');
  s.addNotes('[15:30–17:30] Estratificação.\n\n' +
    'O consenso ESPEN/EASO estrutura o diagnóstico em rastreio, seguido de avaliação de função ' +
    'muscular e, em caso de alteração, composição corporal — e depois estadiamento.\n\n' +
    'A conduta é proporcional: sem critérios, orientação de rotina; com dois ou mais, ' +
    'mitigação estruturada e reavaliação funcional programada.');
}

// ═══ 9. ENSAIO RANDOMIZADO ════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Exercício associado ao AR GLP-1: ensaio de 4 braços', 'N Engl J Med 2021 · 195 participantes · 1 ano após dieta de baixa caloria');

  s.addChart(p.ChartType.bar, [
    { name: 'Redução do percentual de gordura corporal (pontos percentuais)',
      labels: ['Exercício', 'Liraglutida', 'Exercício + liraglutida'], values: [1.7, 1.9, 3.9] },
  ], {
    x: M, y: 2.0, w: 7.15, h: 3.4, barDir: 'col', chartColors: [TEAL, TEAL, ALERTA], varyColors: true,
    showTitle: true, title: 'Variação do percentual de gordura corporal em 1 ano',
    titleFontSize: 13, titleColor: TINTA, titleFontFace: B,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: TINTA,
    dataLabelFontSize: 14, dataLabelFontBold: true, showLegend: false,
    catAxisLabelColor: TINTA, catAxisLabelFontSize: 12, catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
  });

  cartao(s, 8.05, 2.0, 4.65, 3.4, '0B4650');
  s.addText('Desfechos metabólicos', { x: 8.32, y: 2.2, w: 4.1, h: 0.4,
    fontFace: H, fontSize: 16, bold: true, color: BRANCO, margin: 0 });
  s.addText('Melhora significativa apenas no braço combinado:', { x: 8.32, y: 2.62, w: 4.1, h: 0.52,
    fontFace: B, fontSize: 13, color: '8FB6BB', margin: 0 });
  s.addText([{ text: 'HbA1c', options: { bullet: true, breakLine: true } },
             { text: 'Sensibilidade à insulina', options: { bullet: true, breakLine: true } },
             { text: 'Capacidade cardiorrespiratória', options: { bullet: true } }],
    { x: 8.32, y: 3.22, w: 4.1, h: 1.28, fontFace: B, fontSize: 14.5, color: 'CFE3E5', margin: 0, paraSpaceAfter: 8 });
  s.addText('Peso vs placebo: exercício −4,1 kg; liraglutida −6,8 kg; combinação −9,5 kg.', {
    x: 8.32, y: 4.55, w: 4.1, h: 0.72, fontFace: B, fontSize: 12.5, color: MENTA, margin: 0 });

  rodape(s, 'Lundgren JR et al. Healthy Weight Loss Maintenance with Exercise, Liraglutide, or Both Combined. N Engl J Med 2021;384(18):1719–1730.');
  s.addNotes('[17:30–21:00] Ensaio de Lundgren.\n\n' +
    'Desenho: adultos com obesidade (IMC 32–43) sem diabetes; dieta de baixa caloria por 8 semanas ' +
    'com perda média de 13,1 kg; randomização em 4 braços por 1 ano — exercício de intensidade ' +
    'moderada a vigorosa mais placebo, liraglutida 3,0 mg, ambos combinados, ou placebo.\n\n' +
    'Desfecho primário: variação de peso. Secundário pré-especificado: percentual de gordura corporal.\n\n' +
    'A combinação reduziu o percentual de gordura em 3,9 pontos, aproximadamente o dobro de cada ' +
    'estratégia isolada, sem que a diferença de peso em relação à liraglutida isolada fosse ' +
    'significativa (−2,7 kg; p = 0,13). Ou seja, o exercício alterou a composição do peso perdido.\n\n' +
    'Colelitíase e aumento da frequência cardíaca foram mais frequentes na liraglutida isolada que ' +
    'na combinação.');
}

// ═══ 10. TREINAMENTO RESISTIDO ════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Treinamento resistido: parâmetros de prescrição', 'Mitigação 1 de 2');

  [['> 10 semanas', 'duração mínima dos programas supervisionados nos quais os ganhos se mostram consistentes'],
   ['+ ~3 kg / +25%', 'de massa magra e de força, respectivamente, em programas supervisionados, em ambos os sexos'],
   ['Aeróbio + resistido', 'superior a cada modalidade isolada em desempenho físico no idoso sob restrição calórica (n=160, 6 meses)']].forEach(([n, t], i) => {
    const y = 1.95 + i * 1.2;
    cartao(s, M, y, 12.1, 1.02);
    s.addText(n, { x: M + 0.34, y: y + 0.06, w: 3.5, h: 0.9, fontFace: H, fontSize: 19, bold: true,
      color: TEAL, margin: 0, valign: 'middle' });
    s.addText(t, { x: M + 4.0, y: y + 0.06, w: 7.85, h: 0.9, fontFace: B, fontSize: 13.5,
      color: TINTA, margin: 0, valign: 'middle' });
  });

  cartao(s, M, 5.6, 12.1, 0.95, '0B4650');
  s.addText('Prescrição operacional: 2 a 3 sessões semanais, grandes grupos musculares, sobrecarga progressiva, iniciada antes ou concomitantemente ao fármaco — a maior taxa de perda ocorre durante o escalonamento da dose.', {
    x: M + 0.32, y: 5.72, w: 11.45, h: 0.72, fontFace: B, fontSize: 13.5, color: BRANCO, margin: 0, valign: 'middle' });
  rodape(s, 'Ard J et al. Diabetes Care 2024;47(10):1718–1730 · Villareal DT et al. N Engl J Med 2017;376(20):1943–1955 (n=160, obesos ≥65 anos).');
  s.addNotes('[21:00–23:30] Treinamento resistido.\n\n' +
    'Os valores de +3 kg de massa magra e +25% de força referem-se a programas supervisionados ' +
    'com mais de 10 semanas. Programas não supervisionados não reproduzem essa magnitude.\n\n' +
    'No ensaio de Villareal, 160 idosos obesos sob restrição calórica: o Physical Performance Test ' +
    'aumentou 21% no grupo combinado contra 14% nos grupos aeróbio e resistido isolados.\n\n' +
    'A recomendação de iniciar antes ou junto com o fármaco decorre da distribuição temporal da ' +
    'perda, concentrada nos primeiros meses.');
}

// ═══ 11. APORTE PROTEICO ══════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Aporte proteico: alvos e limitações', 'Mitigação 2 de 2');

  cartao(s, M, 1.95, 5.9, 3.05);
  s.addText('Alvos', { x: M + 0.32, y: 2.12, w: 5.3, h: 0.36, fontFace: H, fontSize: 17, bold: true, color: TEAL, margin: 0 });
  s.addText([
    { text: '> 1,3 g/kg/dia — associado a aumento de massa muscular', options: { bullet: true, breakLine: true } },
    { text: '< 1,0 g/kg/dia — maior risco de perda de massa muscular', options: { bullet: true, breakLine: true } },
    { text: '1,0–1,2 g/kg/dia no idoso hígido (ESPEN)', options: { bullet: true, breakLine: true } },
    { text: '1,2–1,5 g/kg/dia na doença aguda ou crônica (ESPEN)', options: { bullet: true } },
  ], { x: M + 0.32, y: 2.58, w: 5.3, h: 2.2, fontFace: B, fontSize: 13.5, color: TINTA, margin: 0, paraSpaceAfter: 8 });

  cartao(s, 6.9, 1.95, 5.8, 3.05, '2A1A16');
  s.addText('Limitação do efeito', { x: 7.22, y: 2.12, w: 5.2, h: 0.4, fontFace: H, fontSize: 17,
    bold: true, color: 'F0A58C', margin: 0 });
  s.addText('Na metanálise de 47 ECR (n = 3.218), o aumento do aporte proteico preveniu a redução de massa muscular (DMP 0,75; IC 95% 0,41 a 1,10; p < 0,001), mas não preveniu de forma significativa a perda de força nem a queda de função física.', {
    x: 7.22, y: 2.62, w: 5.2, h: 1.6, fontFace: B, fontSize: 13, color: 'F5E6E0', margin: 0 });
  s.addText('O aporte proteico preserva massa; a preservação de força depende do estímulo mecânico.', {
    x: 7.22, y: 4.22, w: 5.2, h: 0.65, fontFace: B, fontSize: 13, bold: true, color: 'F0A58C', margin: 0 });

  s.addText('Monitorar a ingestão efetiva: náusea, vômito e saciedade precoce reduzem preferencialmente o aporte proteico. Suplementação oral quando a dieta não atinge o alvo.', {
    x: M, y: 5.22, w: 12.1, h: 0.8, fontFace: B, fontSize: 14, color: TINTA, margin: 0 });
  rodape(s, 'Kim JE et al. Clin Nutr ESPEN 2024 (47 ECR, n=3.218) · Deutz NEP et al. ESPEN Expert Group. Clin Nutr 2014;33(6):929–936.');
  s.addNotes('[23:30–25:30] Aporte proteico.\n\n' +
    'Os limiares de 1,3 e 1,0 g/kg/dia vêm da metanálise de 47 ensaios; as faixas de 1,0–1,2 e ' +
    '1,2–1,5 g/kg/dia são do grupo de especialistas da ESPEN para o idoso.\n\n' +
    'A dissociação entre massa e força na mesma metanálise é o dado que fundamenta a combinação: ' +
    'proteína isolada não substitui o treinamento resistido.\n\n' +
    'Eventos gastrintestinais ocorrem em 40 a 70% dos tratados e são a principal causa de queda ' +
    'do aporte proteico na prática.');
}

// ═══ 12. CAPACIDADE CARDIORRESPIRATÓRIA ═══════════════════════════════════
{
  const s = slideEscuro();
  s.addText('Capacidade cardiorrespiratória', { x: M, y: 0.85, w: W - 2 * M, h: 0.65,
    fontFace: H, fontSize: 30, bold: true, color: BRANCO, margin: 0 });
  s.addText('Ausência de efeito consistente dos agonistas incretínicos sobre o VO₂ pico', {
    x: M, y: 1.52, w: 11.5, h: 0.4, fontFace: B, fontSize: 16, color: '8FB6BB', margin: 0 });

  selo(s, M, 2.3, '✕', ALERTA, BRANCO, 0.72);
  s.addText([
    { text: 'Os AR GLP-1 e o agonista duplo GLP-1/GIP reduzem desfechos cardiovasculares, reduzem massa de ventrículo esquerdo e melhoram função diastólica e o teste de caminhada de 6 minutos na ICFEp. Os estudos não demonstram melhora consistente do VO₂ pico.', options: { breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 9 } },
    { text: 'A melhora descrita costuma referir-se ao VO₂ relativo ao peso corporal: reduz-se o denominador sem elevação do consumo absoluto de oxigênio.', options: { breakLine: true } },
  ], { x: M + 1.0, y: 2.28, w: 11.0, h: 2.0, fontFace: B, fontSize: 15, color: 'CFE3E5', margin: 0 });

  cartao(s, M + 1.0, 4.5, 11.0, 1.1, '0B4650');
  s.addText('A capacidade cardiorrespiratória é preditor independente de mortalidade cardiovascular e por todas as causas. Quando é desfecho pretendido, requer prescrição de exercício específica.', {
    x: M + 1.3, y: 4.62, w: 10.4, h: 0.86, fontFace: B, fontSize: 14.5, color: MENTA, margin: 0, valign: 'middle' });
  rodape(s, 'Liu Z, Weeldreyer NR, Angadi SS. Incretin Receptor Agonism, Fat-free Mass, and Cardiorespiratory Fitness: A Narrative Review. J Clin Endocrinol Metab 2025;110(10):2709–2717.');
  s.addNotes('[25:30–27:00] Capacidade cardiorrespiratória.\n\n' +
    'Princípio de Fick: VO₂ = débito cardíaco × diferença arteriovenosa de O₂. A obesidade ' +
    'compromete o componente central e o periférico — densidade capilar, síntese proteica, ' +
    'mioesteatose e resistência insulínica microvascular.\n\n' +
    'A distinção entre VO₂ absoluto e VO₂ relativo ao peso é a fonte mais comum de interpretação ' +
    'equivocada nesse contexto.');
}

// ═══ 13. PROTOCOLO DE MITIGAÇÃO ═══════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Protocolo de mitigação', 'Síntese operacional');

  [['ANTES DE INICIAR', TEAL, [
      'Documentar função basal: preensão palmar e sentar-levantar 5×',
      'Quantificar ingestão proteica atual em g/kg/dia',
      'Rastrear obesidade sarcopênica nos pacientes de risco',
      'Estabelecer o treinamento resistido antes da primeira dose',
    ]],
   ['DURANTE O ESCALONAMENTO', MENTA, [
      'Aporte proteico > 1,3 g/kg/dia, distribuído nas refeições',
      'Treinamento resistido 2–3×/semana com sobrecarga progressiva',
      'Avaliar sintomas gastrintestinais a cada consulta',
      'Suplementação oral se a dieta não atingir o alvo',
    ]],
   ['NO SEGUIMENTO', ALERTA, [
      'Reavaliação funcional a cada 3–6 meses, além do peso',
      'Redução de força: investigar, não atribuir à perda ponderal',
      'Perda > 20% do peso ou idade ≥ 65: encurtar intervalo',
      'Na descontinuação: reavaliar massa magra e manter o treino',
    ]]].forEach(([tit, cor, itens], i) => {
    const x = M + i * 4.12;
    cartao(s, x, 1.95, 3.85, 3.95);
    s.addShape(p.ShapeType.roundRect, { x, y: 1.95, w: 3.85, h: 0.6, rectRadius: 0.08, fill: { color: cor } });
    s.addText(tit, { x: x + 0.18, y: 1.95, w: 3.5, h: 0.6, fontFace: H, fontSize: 13.5, bold: true,
      color: BRANCO, margin: 0, valign: 'middle' });
    s.addText(itens.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < itens.length - 1 } })), {
      x: x + 0.24, y: 2.72, w: 3.38, h: 3.05, fontFace: B, fontSize: 12, color: TINTA, margin: 0, paraSpaceAfter: 9 });
  });
  rodape(s, 'Síntese das fontes citadas nos slides anteriores.');
  s.addNotes('[27:00–28:30] Protocolo.\n\n' +
    'Slide de referência para o aluno registrar.\n\n' +
    'Três pontos que costumam ser omitidos na prática: estabelecer o treinamento antes da primeira ' +
    'dose; avaliar sintomas gastrintestinais como determinante do aporte proteico; e reavaliar ' +
    'função, não apenas peso, no seguimento.');
}

// ═══ 14. AVALIAÇÃO FUNCIONAL ══════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Instrumentos de avaliação funcional ambulatorial', 'Aplicáveis sem densitometria');

  [['Preensão palmar', 'Dinamômetro de mão', 'Validado, reprodutível, baixo custo; desfecho alterado no SEMALEAN'],
   ['Sentar-levantar 5×', 'Cadeira e cronômetro', 'Função de membros inferiores; sem equipamento específico'],
   ['Circunferência da panturrilha', 'Fita métrica', 'Marcador antropométrico de massa muscular; requer ajuste pelo IMC'],
   ['Velocidade de marcha', 'Percurso de 4 m e cronômetro', 'Preditor funcional estabelecido em sarcopenia'],
   ['DXA ou bioimpedância', 'Conforme disponibilidade', 'Quantificação de compartimentos; complementar, não obrigatória']
  ].forEach(([a, b, c], i) => {
    const y = 1.95 + i * 0.86;
    if (i % 2 === 0) cartao(s, M, y, 12.1, 0.76);
    s.addText(a, { x: M + 0.28, y, w: 3.5, h: 0.76, fontFace: B, fontSize: 13.5, bold: true, color: TEAL, margin: 0, valign: 'middle' });
    s.addText(b, { x: M + 3.85, y, w: 3.1, h: 0.76, fontFace: B, fontSize: 12.5, color: TINTA, margin: 0, valign: 'middle' });
    s.addText(c, { x: M + 7.05, y, w: 4.95, h: 0.76, fontFace: B, fontSize: 12, color: CINZA, margin: 0, valign: 'middle' });
  });
  rodape(s, 'Instrumentos de rastreio e confirmação conforme o algoritmo ESPEN/EASO (Donini LM et al. Obes Facts 2022).');
  s.addNotes('[28:30–29:30] Avaliação funcional.\n\n' +
    'O algoritmo ESPEN/EASO não exige densitometria na etapa de rastreio: a avaliação de função ' +
    'muscular precede a de composição corporal.\n\n' +
    'Entre os instrumentos, a preensão palmar reúne validação, reprodutibilidade e menor custo, ' +
    'e foi o desfecho funcional alterado no SEMALEAN.');
}

// ═══ 15. PERSPECTIVAS ═════════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Perspectivas: inibição da via miostatina–ativina', 'Desenvolvimento clínico');

  cartao(s, M, 1.95, 12.1, 1.4);
  s.addText('Mecanismo', { x: M + 0.32, y: 2.1, w: 2.0, h: 0.36, fontFace: H, fontSize: 16, bold: true, color: TEAL, margin: 0 });
  s.addText('Miostatina e ativina A são ligantes da superfamília TGF-β que sinalizam pelos receptores de ativina tipo II (ActRII) e antagonizam a hipertrofia muscular. O bloqueio do ActRII induz hipertrofia esquelética e reduz massa gorda.', {
    x: M + 0.32, y: 2.52, w: 11.45, h: 0.72, fontFace: B, fontSize: 13.5, color: TINTA, margin: 0 });

  [['Bimagrumabe — fase 2', 'DM2 com obesidade, 48 semanas, n=75: redução de massa gorda com ganho de massa magra e melhora de HbA1c'],
   ['Bimagrumabe + semaglutida', 'Modelo murino de obesidade: o bloqueio do ActRII preservou massa muscular e ampliou a perda de gordura durante o agonismo GLP-1'],
   ['Em desenvolvimento', 'Trevogrumabe e garetosmabe; combinações com agonistas incretínicos em avaliação']
  ].forEach(([t, d], i) => {
    const y = 3.6 + i * 1.0;
    selo(s, M, y + 0.08, String(i + 1), TEAL, BRANCO, 0.5);
    s.addText(t, { x: M + 0.75, y: y - 0.02, w: 3.7, h: 0.42, fontFace: B, fontSize: 14, bold: true, color: TINTA, margin: 0 });
    s.addText(d, { x: M + 4.55, y: y - 0.02, w: 7.55, h: 0.85, fontFace: B, fontSize: 12.5, color: CINZA, margin: 0 });
  });

  s.addText('Sem indicação clínica estabelecida. Dados de fase 2 em humanos e pré-clínicos para a associação com agonistas incretínicos.', {
    x: M, y: 6.5, w: 12.1, h: 0.4, fontFace: B, fontSize: 13.5, color: TEAL, margin: 0 });
  rodape(s, 'Heymsfield SB et al. JAMA Netw Open 2021;4(1):e2033457 · Nunn E et al. Mol Metab 2024;80:101880 · Mantzoros CS et al. Metabolism 2024;161:156043.');
  s.addNotes('[29:30–30:30] Perspectivas.\n\n' +
    'Conteúdo complementar; suprimir se o tempo estiver excedido.\n\n' +
    'Enfatizar que não há indicação estabelecida: os dados em humanos são de fase 2 e a associação ' +
    'com semaglutida foi avaliada em modelo animal.');
}

// ═══ 16. SÍNTESE ══════════════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addText('Síntese', { x: M, y: 0.7, w: W - 2 * M, h: 0.65, fontFace: H, fontSize: 30, bold: true, color: BRANCO, margin: 0 });

  ['A perda de massa magra corresponde a ≈ 25% do peso perdido, proporção equivalente à observada com placebo; a massa magra relativa não se altera.',
   'Massa livre de gordura não equivale a massa muscular, e massa não equivale a função: no SEMALEAN a força de preensão aumentou enquanto a massa magra reduzia.',
   'Aporte proteico > 1,3 g/kg/dia preserva massa muscular, mas não preveniu perda de força nem de função física na metanálise de 47 ECR.',
   'Apenas a associação de exercício e liraglutida melhorou HbA1c, sensibilidade à insulina e capacidade cardiorrespiratória (NEJM 2021).',
   'A avaliação de seguimento deve incluir desfecho funcional: preensão palmar e sentar-levantar 5× são suficientes para a prática ambulatorial.'
  ].forEach((t, i) => {
    const y = 1.55 + i * 1.05;
    selo(s, M, y + 0.08, String(i + 1), MENTA, ESCURO, 0.54);
    s.addText(t, { x: M + 0.82, y, w: 11.35, h: 0.9, fontFace: B, fontSize: 14, color: 'E3EFF0', margin: 0, valign: 'middle' });
  });

  s.addText('Na vinheta inicial, a conduta indicada é a associação de aporte proteico, treinamento resistido e avaliação funcional seriada — não a suspensão do fármaco.', {
    x: M, y: 6.6, w: 12.1, h: 0.5, fontFace: B, fontSize: 14, bold: true, color: MENTA, margin: 0 });
  s.addNotes('[30:30–31:30] Síntese.\n\n' +
    'Retome a vinheta: a conduta é aditiva, não substitutiva. A suspensão do agonista é a conduta ' +
    'inadequada mais frequente nesse cenário.\n\n' +
    'Indicar o material complementar disponível na plataforma.');
}

// ═══ 17. REFERÊNCIAS ══════════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Referências', null);

  const refs = [
    'Lundgren JR, et al. Healthy Weight Loss Maintenance with Exercise, Liraglutide, or Both Combined. N Engl J Med. 2021;384(18):1719–1730.',
    'Villareal DT, et al. Aerobic or Resistance Exercise, or Both, in Dieting Obese Older Adults. N Engl J Med. 2017;376(20):1943–1955.',
    'Ma X, et al. Effect of GLP-1 receptor agonists and co-agonists on body composition: systematic review and network meta-analysis. Metabolism. 2025;164:156113.',
    'Look M, et al. Body composition changes during weight reduction with tirzepatide in the SURMOUNT-1 study. Diabetes Obes Metab. 2025;27(5):2720–2729.',
    'Neeland IJ, et al. Changes in lean body mass with GLP-1-based therapies and mitigation strategies. Diabetes Obes Metab. 2024;26 Suppl 4:16–27.',
    'Prado CM, et al. Strategies for minimizing muscle loss during use of incretin-mimetic drugs. Obes Rev. 2024;25(11):e13818.',
    'Ard J, et al. Incretin-Based Weight Loss Pharmacotherapy: Can Resistance Exercise Optimize Changes in Body Composition? Diabetes Care. 2024;47(10):1718–1730.',
    'Liu Z, Weeldreyer NR, Angadi SS. Incretin Receptor Agonism, Fat-free Mass, and Cardiorespiratory Fitness. J Clin Endocrinol Metab. 2025;110(10):2709–2717.',
    'Donini LM, et al. Definition and Diagnostic Criteria for Sarcopenic Obesity: ESPEN and EASO Consensus Statement. Obes Facts. 2022;15(3):321–335.',
    'Deutz NEP, et al. Protein intake and exercise for optimal muscle function with aging: ESPEN Expert Group. Clin Nutr. 2014;33(6):929–936.',
    'Kim JE, et al. Enhanced protein intake on maintaining muscle mass, strength, and physical function in adults with overweight/obesity: systematic review and meta-analysis. Clin Nutr ESPEN. 2024;62:210–223.',
    'Heymsfield SB, et al. Effect of Bimagrumab vs Placebo on Body Fat Mass Among Adults With Type 2 Diabetes and Obesity. JAMA Netw Open. 2021;4(1):e2033457.',
  ];
  s.addText(refs.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < refs.length - 1 } })), {
    x: M, y: 1.55, w: 12.1, h: 5.2, fontFace: B, fontSize: 11.5, color: TINTA, margin: 0, paraSpaceAfter: 5 });
  s.addNotes('Slide de referência. Lista disponibilizada junto do material da aula na plataforma.');
}

p.writeFile({ fileName: '/home/user/endodirect/scratchpad/aula-massa-magra/Aula-massa-magra-AR-GLP1.pptx' })
  .then((f) => console.log('gerado: ' + f));
