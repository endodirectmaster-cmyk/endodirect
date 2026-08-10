// Videoaula Endodirect — "Como mitigar a perda de massa magra nos usuários de AR GLP-1"
// 17 slides, 20–30 min, público médico. Notas de apresentação com cronometragem.
const pptxgen = require('/tmp/claude-0/-home-user-endodirect/de180d5c-1c6f-539b-bfcc-0c5f54183b96/scratchpad/node_modules/pptxgenjs');

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';                    // 13.333 x 7.5
p.author = 'Prof. Rodolpho Pinto — Endodirect';
p.title = 'Massa magra e AR GLP-1';

// ── paleta ────────────────────────────────────────────────────────────────
const ESCURO = '06333A';   // pinho profundo (fundos escuros)
const TEAL   = '028090';   // primária
const MENTA  = '00A896';   // secundária
const ALERTA = 'E4572E';   // acento: números que assustam / avisos
const TINTA  = '13262B';   // texto sobre claro
const CINZA  = '5C6B70';   // texto secundário
const PAINEL = 'EEF4F4';   // cartões sobre claro
const BRANCO = 'FFFFFF';

const H = 'Cambria';       // títulos
const B = 'Calibri';       // corpo

const W = 13.333, HH = 7.5, M = 0.62;   // margens

// ── helpers ───────────────────────────────────────────────────────────────
function slideClaro() {
  const s = p.addSlide();
  s.background = { color: BRANCO };
  return s;
}
function slideEscuro() {
  const s = p.addSlide();
  s.background = { color: ESCURO };
  return s;
}
// motivo repetido: selo circular
function selo(s, x, y, texto, corFundo, corTexto, d) {
  const dia = d || 0.62;
  s.addShape(p.ShapeType.ellipse, { x, y, w: dia, h: dia, fill: { color: corFundo } });
  s.addText(texto, {
    x, y, w: dia, h: dia, align: 'center', valign: 'middle',
    fontFace: H, fontSize: dia > 0.7 ? 18 : 15, bold: true, color: corTexto, margin: 0,
  });
}
function titulo(s, texto, sobre) {
  if (sobre) {
    s.addText(sobre.toUpperCase(), {
      x: M, y: 0.42, w: W - 2 * M, h: 0.3, fontFace: B, fontSize: 12,
      bold: true, color: MENTA, charSpacing: 2, margin: 0,
    });
  }
  s.addText(texto, {
    x: M, y: sobre ? 0.74 : 0.5, w: W - 2 * M, h: 0.9,
    fontFace: H, fontSize: 32, bold: true, color: TINTA, margin: 0, valign: 'top',
  });
}
function rodape(s, fonte) {
  s.addText(fonte, {
    x: M, y: HH - 0.62, w: W - 2 * M, h: 0.34,
    fontFace: B, fontSize: 10, italic: true, color: CINZA, margin: 0, valign: 'middle',
  });
}
function cartao(s, x, y, w, h, cor) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08, fill: { color: cor || PAINEL },
  });
}

// ═══ 1. CAPA ══════════════════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addShape(p.ShapeType.ellipse, { x: 10.3, y: -1.5, w: 5.2, h: 5.2, fill: { color: TEAL, transparency: 78 } });
  s.addShape(p.ShapeType.ellipse, { x: 11.6, y: 4.4, w: 3.4, h: 3.4, fill: { color: MENTA, transparency: 85 } });

  s.addText('ENDODIRECT · VIDEOAULA', {
    x: M, y: 1.5, w: 9, h: 0.3, fontFace: B, fontSize: 13, bold: true,
    color: MENTA, charSpacing: 3, margin: 0,
  });
  s.addText('Como mitigar a perda de massa magra nos usuários de AR GLP-1', {
    x: M, y: 2.0, w: 9.2, h: 2.1, fontFace: H, fontSize: 40, bold: true,
    color: BRANCO, margin: 0, lineSpacing: 46,
  });
  s.addText('O que os números realmente dizem — e o que fazer no consultório', {
    x: M, y: 4.25, w: 9.2, h: 0.5, fontFace: B, fontSize: 18, color: 'A8CDD1', margin: 0,
  });
  s.addShape(p.ShapeType.rect, { x: M, y: 5.15, w: 1.5, h: 0.035, fill: { color: ALERTA } });
  s.addText('Prof. Rodolpho Pinto', {
    x: M, y: 5.45, w: 8, h: 0.34, fontFace: B, fontSize: 15, bold: true, color: BRANCO, margin: 0,
  });
  s.addText('Endocrinologia e Metabologia', {
    x: M, y: 5.8, w: 8, h: 0.3, fontFace: B, fontSize: 13, color: '8FB6BB', margin: 0,
  });
  s.addNotes(
    '[0:00–1:00] Abertura.\n\n' +
    'Apresente-se e diga a promessa da aula em uma frase: "no fim desta aula você vai saber ' +
    'quanto de massa magra realmente se perde com um AR GLP-1, quando isso importa, e o que ' +
    'prescrever para mitigar."\n\n' +
    'Avise que a aula tem uma controvérsia real no meio — e que ela é o ponto mais útil do assunto.'
  );
}

// ═══ 2. O CASO ════════════════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'A queixa que abre o consultório', 'O problema clínico');

  cartao(s, M, 1.95, 6.1, 3.55);
  selo(s, M + 0.42, 2.35, '!', ALERTA, BRANCO, 0.66);
  s.addText('Mulher, 62 anos', {
    x: M + 0.42, y: 3.2, w: 5.3, h: 0.36, fontFace: H, fontSize: 20, bold: true, color: TINTA, margin: 0,
  });
  s.addText([
    { text: 'IMC 34 · semaglutida 2,4 mg há 14 meses', options: { bullet: true, breakLine: true } },
    { text: 'Perdeu 18 kg — está satisfeita com o peso', options: { bullet: true, breakLine: true } },
    { text: '"A roupa serve, mas eu não tenho força"', options: { bullet: true, breakLine: true } },
    { text: 'Custa a levantar da cadeira sem apoio', options: { bullet: true } },
  ], {
    x: M + 0.42, y: 3.65, w: 5.3, h: 1.6, fontFace: B, fontSize: 14.5,
    color: TINTA, margin: 0, paraSpaceAfter: 7,
  });

  s.addText('As três perguntas desta aula', {
    x: 7.25, y: 2.0, w: 5.5, h: 0.4, fontFace: H, fontSize: 20, bold: true, color: TEAL, margin: 0,
  });
  const perg = [
    ['1', 'Quanto ela realmente perdeu de músculo?'],
    ['2', 'Isso é dano ou é adaptação?'],
    ['3', 'O que eu prescrevo a partir de hoje?'],
  ];
  perg.forEach(([n, t], i) => {
    const y = 2.62 + i * 1.0;
    selo(s, 7.25, y, n, TEAL, BRANCO, 0.56);
    s.addText(t, {
      x: 8.0, y: y - 0.03, w: 4.75, h: 0.62, fontFace: B, fontSize: 16,
      color: TINTA, margin: 0, valign: 'middle',
    });
  });
  s.addNotes(
    '[1:00–3:00] O caso.\n\n' +
    'Leia o caso devagar. Ele é o fio da aula inteira — volte a ele no slide final.\n\n' +
    'Ponto a marcar: a paciente NÃO está insatisfeita com o peso. A queixa é de FUNÇÃO. ' +
    'É exatamente aí que o assunto deixa de ser estética e vira medicina.\n\n' +
    'Diga que vai responder as três perguntas nessa ordem.'
  );
  rodape(s, 'Caso ilustrativo.');
}

// ═══ 3. A MANCHETE ════════════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addText('A manchete que chegou ao consultório', {
    x: M, y: 0.72, w: W - 2 * M, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: BRANCO, margin: 0,
  });

  s.addText('“≈ 20 anos”', {
    x: M, y: 1.95, w: 6.2, h: 1.5, fontFace: H, fontSize: 66, bold: true, color: ALERTA, margin: 0,
  });
  s.addText('de perda muscular relacionada à idade, concentrados em 68–72 semanas de tratamento', {
    x: M, y: 3.42, w: 6.0, h: 1.0, fontFace: B, fontSize: 17, color: 'CFE3E5', margin: 0,
  });

  cartao(s, 7.15, 1.95, 5.55, 1.28, '0B4650');
  s.addText([
    { text: '≥ 10%  ', options: { fontSize: 26, bold: true, color: BRANCO, fontFace: H } },
    { text: 'da massa muscular perdida nos ensaios', options: { fontSize: 14, color: 'CFE3E5' } },
  ], { x: 7.45, y: 2.12, w: 5.0, h: 0.95, fontFace: B, margin: 0, valign: 'middle' });

  cartao(s, 7.15, 3.4, 5.55, 1.28, '0B4650');
  s.addText([
    { text: '≈ 6 kg  ', options: { fontSize: 26, bold: true, color: BRANCO, fontFace: H } },
    { text: 'de massa magra: “uma década de envelhecimento”', options: { fontSize: 14, color: 'CFE3E5' } },
  ], { x: 7.45, y: 3.46, w: 5.0, h: 1.16, fontFace: B, margin: 0, valign: 'middle' });

  s.addText('Guarde este número. Vamos desmontá-lo no próximo slide.', {
    x: M, y: 5.35, w: 11.5, h: 0.42, fontFace: B, fontSize: 16, italic: true, color: MENTA, margin: 0,
  });
  rodape(s, 'Prado CM et al. Obes Rev 2024 · Vinci C, Villareal DT et al. Diabetes Care 2024;47(10):1718–1730.');
  s.addNotes(
    '[3:00–5:00] A manchete.\n\n' +
    'Esta é a informação que o paciente leu no Instagram e que o colega citou no corredor. ' +
    'NÃO a desqualifique — ela vem de duas revisões sérias, e o número é real.\n\n' +
    'Diga: "está certo, e ainda assim está incompleto". A aula existe para completar.\n\n' +
    'Deixe o número no ar ao virar o slide — o contraste com o próximo é o efeito didático.'
  );
}

// ═══ 4. QUANTO SE PERDE, DE FATO ══════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Quanto se perde, de fato', 'Os dados');

  s.addChart(p.ChartType.bar, [
    { name: 'Massa gorda', labels: ['Tirzepatida', 'Placebo'], values: [75, 76] },
    { name: 'Massa magra', labels: ['Tirzepatida', 'Placebo'], values: [25, 24] },
  ], {
    x: M, y: 1.95, w: 6.5, h: 3.5,
    barDir: 'bar', barGrouping: 'percentStacked',
    chartColors: [TEAL, ALERTA],
    showTitle: true, title: 'Composição do peso perdido (SURMOUNT-1, DXA, 72 sem)',
    titleFontSize: 13, titleColor: TINTA, titleFontFace: B,
    showValue: true, dataLabelPosition: 'ctr', dataLabelColor: BRANCO,
    dataLabelFontSize: 13, dataLabelFontBold: true, dataLabelFormatCode: '0"%"',
    showLegend: true, legendPos: 'b', legendFontSize: 11, legendColor: TINTA,
    catAxisLabelColor: TINTA, catAxisLabelFontSize: 12, catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
  });

  const fatos = [
    ['−0,86 kg', 'de massa magra na metanálise em rede (22 ECR, 2.258 participantes)'],
    ['≈ 25%', 'do peso perdido é massa magra — e essa proporção é a MESMA do placebo'],
    ['sem mudança', 'na massa magra RELATIVA (% do corpo) em relação ao basal'],
  ];
  fatos.forEach(([n, t], i) => {
    const y = 2.0 + i * 1.18;
    cartao(s, 7.35, y, 5.35, 1.0);
    s.addText(n, {
      x: 7.6, y: y + 0.08, w: 2.0, h: 0.4, fontFace: H, fontSize: 19, bold: true, color: TEAL, margin: 0,
    });
    s.addText(t, {
      x: 7.6, y: y + 0.46, w: 4.85, h: 0.48, fontFace: B, fontSize: 12.5, color: TINTA, margin: 0,
    });
  });
  rodape(s, 'Look M et al. Diabetes Obes Metab 2025 (SURMOUNT-1, subestudo DXA, n=160) · Ma X et al. Metabolism 2025 (revisão sistemática e metanálise em rede).');
  s.addNotes(
    '[5:00–8:00] Os números reais.\n\n' +
    'O gráfico é o argumento: a proporção gordura/magra do peso perdido com tirzepatida é ' +
    'praticamente IGUAL à do placebo (≈75/25 nos dois braços). Quem perde peso perde massa magra — ' +
    'a droga não inventou isso, ela só fez o paciente perder MUITO mais peso.\n\n' +
    'O terceiro cartão é o mais sutil e vale parar nele: a massa magra RELATIVA não muda. ' +
    'Em proporção do corpo, o paciente sai igual ou melhor.\n\n' +
    'Não conclua nada ainda — o próximo slide explica por que esses números são fáceis de ler errado.'
  );
}

// ═══ 5. TRÊS ARMADILHAS DE LEITURA ════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Três armadilhas ao ler esses estudos', 'O que separa o dado do susto');

  const arm = [
    ['1', 'Massa magra não é músculo',
      'DXA mede “massa livre de gordura”: entra osso, órgão, água e o líquido do próprio tecido adiposo. Parte da queda é fluido, não sarcômero. Onde há RM, a perda de volume muscular é menor que a de massa magra.'],
    ['2', 'Absoluto engana, relativo informa',
      'Perder 6 kg de massa magra tendo perdido 25 kg é diferente de perder 6 kg tendo perdido 8 kg. Pergunte sempre: que fração do peso perdido foi magra? E a massa magra relativa mudou?'],
    ['3', 'Falta o braço de comparação',
      'O número só significa algo contra o placebo e contra a restrição calórica. No SURMOUNT-1, a proporção foi igual à do placebo. O denominador é a perda de peso, não a droga.'],
  ];
  arm.forEach(([n, t, d], i) => {
    const y = 1.95 + i * 1.28;
    selo(s, M, y + 0.16, n, ALERTA, BRANCO, 0.6);
    s.addText(t, {
      x: M + 0.86, y: y + 0.05, w: 4.3, h: 0.42, fontFace: H, fontSize: 17.5, bold: true, color: TINTA, margin: 0,
    });
    s.addText(d, {
      x: M + 0.86, y: y + 0.47, w: 11.2, h: 0.72, fontFace: B, fontSize: 13, color: CINZA, margin: 0,
    });
  });
  rodape(s, 'Neeland IJ et al. Diabetes Obes Metab 2024 · Look M et al. Diabetes Obes Metab 2025.');
  s.addNotes(
    '[8:00–11:00] As três armadilhas. Este é o slide que diferencia esta aula.\n\n' +
    'Armadilha 1 é a mais importante e a menos conhecida: DXA não mede músculo, mede massa livre ' +
    'de gordura. Osso, víscera, água. Um paciente que desinchou perde “massa magra” sem perder sarcômero.\n\n' +
    'Armadilha 2: dê o exemplo numérico em voz alta, com os dois cenários de 6 kg.\n\n' +
    'Armadilha 3: sem braço-controle o número não tem significado — e quando há controle, ' +
    'a proporção é a mesma.\n\n' +
    'Feche dizendo: nada disso significa que não há problema. Significa que o problema é OUTRO — ' +
    'e é o dos próximos slides.'
  );
}

// ═══ 6. O CONTRAPONTO ADAPTATIVO ══════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Perda adaptativa ou dano?', 'A controvérsia honesta');

  cartao(s, M, 1.95, 5.9, 3.5, PAINEL);
  s.addText('A leitura tranquilizadora', {
    x: M + 0.35, y: 2.15, w: 5.2, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: TEAL, margin: 0,
  });
  s.addText([
    { text: 'A redução é compatível com o esperado para a idade, a doença e o tanto de peso perdido', options: { bullet: true, breakLine: true } },
    { text: 'A QUALIDADE do músculo melhora: menos infiltração gordurosa, mais sensibilidade à insulina', options: { bullet: true, breakLine: true } },
    { text: 'Heterogeneidade enorme entre ensaios: de <15% a 40–60% do peso perdido', options: { bullet: true } },
  ], {
    x: M + 0.35, y: 2.68, w: 5.2, h: 2.5, fontFace: B, fontSize: 13.5,
    color: TINTA, margin: 0, paraSpaceAfter: 9,
  });

  cartao(s, 6.9, 1.95, 5.8, 3.5, '2A1A16');
  s.addText('A leitura preocupante', {
    x: 7.25, y: 2.15, w: 5.1, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: 'F0A58C', margin: 0,
  });
  s.addText([
    { text: 'A velocidade não tem precedente: o que a idade faz em décadas, o fármaco faz em ~1 ano', options: { bullet: true, breakLine: true } },
    { text: 'Massa magra sustenta gasto energético — perdê-la facilita o reganho de peso', options: { bullet: true, breakLine: true } },
    { text: 'Em quem já tem pouca reserva, não há de onde tirar', options: { bullet: true } },
  ], {
    x: 7.25, y: 2.68, w: 5.1, h: 2.5, fontFace: B, fontSize: 13.5,
    color: 'F5E6E0', margin: 0, paraSpaceAfter: 9,
  });

  s.addText('As duas leituras estão publicadas, e as duas têm razão em parte. O que desempata não é a balança — é a função.', {
    x: M, y: 5.65, w: 12.1, h: 0.5, fontFace: B, fontSize: 15.5, italic: true, bold: true, color: TEAL, margin: 0,
  });
  rodape(s, 'Neeland IJ et al. Diabetes Obes Metab 2024;26 Suppl 4:16–27 · Prado CM et al. Obes Rev 2024;25(11):e13818.');
  s.addNotes(
    '[11:00–14:00] A controvérsia.\n\n' +
    'Apresente as duas colunas sem escolher lado ainda. É honesto e é o que um público médico espera.\n\n' +
    'O argumento mais forte da esquerda: qualidade muscular melhora (menos gordura intramuscular, ' +
    'mais sensibilidade à insulina). O mais forte da direita: a VELOCIDADE.\n\n' +
    'A frase de fechamento é a virada da aula: quem desempata é a FUNÇÃO, não a composição. ' +
    'Diga-a olhando para a câmera e faça uma pausa antes de virar.'
  );
}

// ═══ 7. A FUNÇÃO É O DESFECHO ═════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Quando se mede função, a história muda', 'SEMALEAN · 106 pacientes · 12 meses');

  const stats = [
    ['−3 kg', 'de massa magra aos 7 meses — e depois ESTABILIZA', TEAL],
    ['+4,5 kg', 'de força de preensão palmar aos 12 meses', MENTA],
    ['49% → 33%', 'de prevalência de obesidade sarcopênica', TEAL],
  ];
  stats.forEach(([n, t, cor], i) => {
    const x = M + i * 4.12;
    cartao(s, x, 2.0, 3.85, 2.35);
    s.addText(n, {
      x: x + 0.28, y: 2.32, w: 3.3, h: 0.75, fontFace: H, fontSize: 30, bold: true, color: cor, margin: 0,
    });
    s.addText(t, {
      x: x + 0.28, y: 3.12, w: 3.3, h: 1.0, fontFace: B, fontSize: 13.5, color: TINTA, margin: 0,
    });
  });

  cartao(s, M, 4.62, 12.1, 1.15, '0B4650');
  s.addText([
    { text: 'A massa caiu e a força subiu.  ', options: { bold: true, color: BRANCO, fontSize: 16 } },
    { text: 'É a prova de que massa e função não são a mesma variável — e a função é a que o paciente sente.', options: { color: 'CFE3E5', fontSize: 15 } },
  ], { x: M + 0.35, y: 4.8, w: 11.4, h: 0.8, fontFace: B, margin: 0, valign: 'middle' });

  rodape(s, 'Estudo SEMALEAN. Diabetes Obes Metab 2026 — semaglutida 2,4 mg, DXA + dinamometria, IMC médio 46,3 kg/m².');
  s.addNotes(
    '[14:00–16:00] SEMALEAN — a resposta à pergunta 2 do caso.\n\n' +
    'Três números, um por cartão. O do meio é o que importa: a FORÇA aumentou.\n\n' +
    'E a prevalência de obesidade sarcopênica CAIU — de 49% para 33%. Ou seja: no conjunto, ' +
    'esses pacientes ficaram funcionalmente melhores, não piores.\n\n' +
    'Ressalva honesta a dizer em voz alta: é estudo prospectivo sem braço-controle, e a força de ' +
    'preensão melhora com perda de peso por razões que não são só musculares. Não é ensaio randomizado.\n\n' +
    'Ponte: "então não preciso fazer nada? Preciso — em quem?"'
  );
}

// ═══ 8. EM QUEM ISSO IMPORTA ══════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Em quem a perda de massa magra realmente importa', 'Estratificação de risco');

  const risco = [
    'Idade ≥ 65 anos',
    'Obesidade sarcopênica já presente (ESPEN/EASO 2022)',
    'Perda de peso muito rápida ou > 20% do peso',
    'Ingestão proteica baixa ou náusea/vômito limitando a dieta',
    'Sedentarismo, sem nenhum treino de força',
    'Pós-bariátrica, DM2 de longa data, DRC, câncer',
  ];
  risco.forEach((t, i) => {
    const col = i % 2, lin = Math.floor(i / 2);
    const x = M + col * 6.2, y = 2.0 + lin * 1.02;
    cartao(s, x, y, 5.9, 0.82);
    selo(s, x + 0.24, y + 0.16, '✓', TEAL, BRANCO, 0.5);
    s.addText(t, {
      x: x + 0.88, y, w: 4.9, h: 0.82, fontFace: B, fontSize: 14,
      color: TINTA, margin: 0, valign: 'middle',
    });
  });

  s.addText('Sem nenhum destes, a conversa é de rotina. Com dois ou mais, a mitigação deixa de ser opcional.', {
    x: M, y: 5.42, w: 12.1, h: 0.45, fontFace: B, fontSize: 15.5, italic: true, bold: true, color: TEAL, margin: 0,
  });
  rodape(s, 'Critérios de obesidade sarcopênica: Donini LM et al. Consenso ESPEN/EASO. Obes Facts 2022;15(3):321–335.');
  s.addNotes(
    '[16:00–18:00] Estratificação — a parte que o clínico leva para a consulta de amanhã.\n\n' +
    'A mensagem é de PROPORCIONALIDADE: não é para transformar todo usuário de AR GLP-1 em ' +
    'paciente de sarcopenia. É para identificar quem tem pouca reserva.\n\n' +
    'Cite o consenso ESPEN/EASO 2022: rastrear quem tem IMC ou cintura elevados MAIS marcadores ' +
    'de baixa massa/função muscular; confirmar com composição corporal e teste funcional.\n\n' +
    'Frase de fechamento do slide, dita como regra: "sem nenhum, rotina; com dois, prescrição".'
  );
}

// ═══ 9. O ENSAIO QUE RESPONDE ═════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'O ensaio que responde a pergunta', 'NEJM 2021 · 4 braços · 1 ano após dieta de baixa caloria');

  s.addChart(p.ChartType.bar, [
    { name: 'Queda no % de gordura corporal (pontos percentuais)', labels: ['Exercício', 'Liraglutida', 'Exercício + liraglutida'], values: [1.7, 1.9, 3.9] },
  ], {
    x: M, y: 2.0, w: 7.15, h: 3.4,
    barDir: 'col', chartColors: [TEAL, TEAL, ALERTA],
    varyColors: true,
    showTitle: true, title: 'Composição: a combinação dobra o efeito', titleFontSize: 13,
    titleColor: TINTA, titleFontFace: B,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: TINTA,
    dataLabelFontSize: 14, dataLabelFontBold: true,
    showLegend: false,
    catAxisLabelColor: TINTA, catAxisLabelFontSize: 12, catAxisLabelFontBold: true,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
  });

  cartao(s, 8.05, 2.0, 4.65, 3.4, '0B4650');
  s.addText('E só a combinação melhorou', {
    x: 8.35, y: 2.22, w: 4.05, h: 0.4, fontFace: H, fontSize: 17, bold: true, color: BRANCO, margin: 0,
  });
  s.addText([
    { text: 'HbA1c', options: { bullet: true, breakLine: true } },
    { text: 'Sensibilidade à insulina', options: { bullet: true, breakLine: true } },
    { text: 'Fitness cardiorrespiratória', options: { bullet: true } },
  ], {
    x: 8.35, y: 2.78, w: 4.05, h: 1.35, fontFace: B, fontSize: 15,
    color: 'CFE3E5', margin: 0, paraSpaceAfter: 8,
  });
  s.addShape(p.ShapeType.rect, { x: 8.35, y: 4.25, w: 1.1, h: 0.03, fill: { color: MENTA } });
  s.addText('Nenhum dos dois isolados melhorou os três.', {
    x: 8.35, y: 4.45, w: 4.05, h: 0.8, fontFace: B, fontSize: 14, italic: true, color: MENTA, margin: 0,
  });

  rodape(s, 'Lundgren JR et al. Healthy Weight Loss Maintenance with Exercise, Liraglutide, or Both Combined. N Engl J Med 2021;384(18):1719–1730.');
  s.addNotes(
    '[18:00–21:00] O ensaio central. Se a aula tivesse um slide só, seria este.\n\n' +
    'Desenho: dieta de baixa caloria por 8 semanas (perda média de 13,1 kg), depois randomização ' +
    'em 4 braços por 1 ANO — exercício + placebo, liraglutida 3,0 mg, os dois combinados, ou placebo.\n\n' +
    'Peso vs placebo: exercício −4,1 kg; liraglutida −6,8 kg; combinação −9,5 kg.\n\n' +
    'Mas o que importa aqui é a COMPOSIÇÃO: a combinação derrubou o percentual de gordura em ' +
    '3,9 pontos — cerca do DOBRO de cada estratégia isolada. O exercício não somou peso perdido: ' +
    'ele mudou o QUE se perdeu.\n\n' +
    'E o cartão da direita é o argumento final: só a combinação melhorou HbA1c, sensibilidade à ' +
    'insulina e fitness cardiorrespiratória. Nenhum isolado melhorou os três.'
  );
}

// ═══ 10. EXERCÍCIO: A DOSE ════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Exercício resistido: a dose que tem evidência', 'Prescrição 1 de 2');

  const blocos = [
    ['> 10 semanas', 'de treino resistido supervisionado é o limiar a partir do qual os ganhos aparecem de forma consistente'],
    ['+ ~3 kg', 'de massa magra e +25% de força em programas supervisionados, em homens e mulheres'],
    ['Combinado > isolado', 'aeróbio + resistido supera cada um sozinho em desempenho físico no idoso em dieta (NEJM 2017)'],
  ];
  blocos.forEach(([n, t], i) => {
    const y = 1.95 + i * 1.22;
    cartao(s, M, y, 12.1, 1.05);
    s.addText(n, {
      x: M + 0.38, y: y + 0.06, w: 3.3, h: 0.92, fontFace: H, fontSize: 21, bold: true,
      color: TEAL, margin: 0, valign: 'middle',
    });
    s.addText(t, {
      x: M + 3.8, y: y + 0.06, w: 8.1, h: 0.92, fontFace: B, fontSize: 14,
      color: TINTA, margin: 0, valign: 'middle',
    });
  });

  cartao(s, M, 5.65, 12.1, 0.92, '0B4650');
  s.addText('Na prática: 2 a 3 sessões por semana, grandes grupos musculares, carga progressiva — e comece ANTES ou JUNTO com o fármaco, não depois que a queixa aparecer.', {
    x: M + 0.35, y: 5.78, w: 11.4, h: 0.66, fontFace: B, fontSize: 14.5, color: BRANCO, margin: 0, valign: 'middle',
  });
  rodape(s, 'Ard J, Umashanker D et al. Diabetes Care 2024;47(10):1718–1730 · Villareal DT et al. N Engl J Med 2017;376(20):1943–1955.');
  s.addNotes(
    '[21:00–23:30] A prescrição do exercício.\n\n' +
    'O número dos “+3 kg de massa magra e +25% de força” é de programas SUPERVISIONADOS acima de ' +
    '10 semanas — diga “supervisionado”, porque é o que muda o resultado.\n\n' +
    'Villareal (NEJM 2017) é a âncora no idoso em dieta: a combinação aeróbio + resistido foi ' +
    'superior a cada modalidade isolada no desempenho físico.\n\n' +
    'A frase do rodapé escuro é a que o médico anota: comece ANTES ou JUNTO. Prescrever exercício ' +
    'depois que o paciente já perdeu 15 kg é remediar, não prevenir.'
  );
}

// ═══ 11. PROTEÍNA: A DOSE ═════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Proteína: a dose — e o que ela NÃO resolve', 'Prescrição 2 de 2');

  cartao(s, M, 1.95, 5.9, 3.05);
  s.addText('Os alvos', {
    x: M + 0.35, y: 2.12, w: 5.2, h: 0.36, fontFace: H, fontSize: 18, bold: true, color: TEAL, margin: 0,
  });
  s.addText([
    { text: '> 1,3 g/kg/dia → aumenta massa muscular', options: { bullet: true, breakLine: true } },
    { text: '< 1,0 g/kg/dia → maior risco de perda', options: { bullet: true, breakLine: true } },
    { text: '1,0–1,2 g/kg/dia no idoso saudável', options: { bullet: true, breakLine: true } },
    { text: '1,2–1,5 g/kg/dia se doença aguda ou crônica', options: { bullet: true } },
  ], {
    x: M + 0.35, y: 2.58, w: 5.2, h: 2.2, fontFace: B, fontSize: 14, color: TINTA, margin: 0, paraSpaceAfter: 8,
  });

  cartao(s, 6.9, 1.95, 5.8, 3.05, '2A1A16');
  selo(s, 7.25, 2.12, '!', ALERTA, BRANCO, 0.5);
  s.addText('A ressalva que muda a conduta', {
    x: 7.9, y: 2.1, w: 4.5, h: 0.5, fontFace: H, fontSize: 17, bold: true, color: 'F0A58C', margin: 0, valign: 'middle',
  });
  s.addText('Na metanálise de 47 ensaios, a proteína preservou a MASSA — mas NÃO preveniu de forma significativa a perda de FORÇA nem a queda da função física.', {
    x: 7.25, y: 2.78, w: 5.1, h: 1.35, fontFace: B, fontSize: 14, color: 'F5E6E0', margin: 0,
  });
  s.addText('Proteína sozinha protege a balança. Quem protege o paciente é a proteína COM treino de força.', {
    x: 7.25, y: 4.16, w: 5.1, h: 0.7, fontFace: B, fontSize: 14, bold: true, italic: true, color: 'F0A58C', margin: 0,
  });

  s.addText('E vigie a INGESTÃO: náusea, vômito e saciedade precoce derrubam a proteína primeiro. Suplemento oral quando a dieta não alcança o alvo.', {
    x: M, y: 5.25, w: 12.1, h: 0.8, fontFace: B, fontSize: 15, color: TINTA, margin: 0,
  });
  rodape(s, 'Kim JE et al. Clin Nutr ESPEN 2024 (47 ECR, n=3.218) · Deutz NEP et al. ESPEN Expert Group. Clin Nutr 2014;33(6):929–936 · Prado CM et al. Obes Rev 2024.');
  s.addNotes(
    '[23:30–26:00] A prescrição nutricional.\n\n' +
    'Dê os alvos com clareza: acima de 1,3 g/kg/dia ganha massa; abaixo de 1,0 g/kg/dia perde. ' +
    'No idoso, a régua da ESPEN: 1,0–1,2 saudável, 1,2–1,5 se doente.\n\n' +
    'O cartão escuro é o ponto mais importante do slide e o mais esquecido: a mesma metanálise que ' +
    'mostrou preservação de MASSA não mostrou preservação de FORÇA nem de FUNÇÃO. ' +
    'Proteína não substitui treino — ela viabiliza o treino.\n\n' +
    'Lembre do efeito adverso gastrintestinal: é ele que derruba a ingestão proteica na vida real. ' +
    'Perguntar “o que você comeu ontem” vale mais que qualquer exame aqui.'
  );
}

// ═══ 12. O QUE A INCRETINA NÃO FAZ ════════════════════════════════════════
{
  const s = slideEscuro();
  s.addText('E uma coisa que o fármaco não faz', {
    x: M, y: 0.9, w: W - 2 * M, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: BRANCO, margin: 0,
  });

  selo(s, M, 2.1, '✕', ALERTA, BRANCO, 0.8);
  s.addText('Não melhorar a fitness cardiorrespiratória de forma consistente', {
    x: M + 1.1, y: 2.05, w: 10.9, h: 0.95, fontFace: H, fontSize: 26, bold: true, color: BRANCO, margin: 0,
  });
  s.addText([
    { text: 'Os AR GLP-1 e o duplo GLP-1/GIP reduzem eventos cardiovasculares, reduzem massa de VE e melhoram função diastólica — mas os estudos NÃO mostram melhora consistente do VO₂ pico.', options: { breakLine: true } },
    { text: '' , options: { breakLine: true, fontSize: 8 } },
    { text: 'A melhora aparente costuma ser do VO₂ RELATIVO ao peso: o denominador caiu, o numerador não subiu.', options: { breakLine: true } },
  ], {
    x: M + 1.1, y: 3.15, w: 10.9, h: 1.7, fontFace: B, fontSize: 15.5, color: 'CFE3E5', margin: 0,
  });

  cartao(s, M + 1.1, 5.0, 10.9, 0.95, '0B4650');
  s.addText('Quem melhora VO₂ pico é o exercício. Se a fitness é o alvo, ela precisa ser prescrita à parte.', {
    x: M + 1.45, y: 5.14, w: 10.2, h: 0.68, fontFace: B, fontSize: 15.5, bold: true, color: MENTA, margin: 0, valign: 'middle',
  });
  rodape(s, 'Liu Z, Weeldreyer NR, Angadi SS. J Clin Endocrinol Metab 2025;110(10):2709–2717.');
  s.addNotes(
    '[26:00–27:30] O contraponto que evita a promessa exagerada.\n\n' +
    'Este slide existe para você não sair prometendo o que o fármaco não entrega. É comum ouvir ' +
    '“o paciente melhorou o condicionamento” — e a melhora medida costuma ser do VO₂ relativo ao ' +
    'peso, que sobe porque o peso caiu.\n\n' +
    'A fitness cardiorrespiratória é preditor independente de mortalidade. Se ela é o alvo, ' +
    'só o exercício a entrega.\n\n' +
    'Ponte para o slide seguinte: "então como fica a receita?"'
  );
}

// ═══ 13. A RECEITA PRÁTICA ════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'A receita, em três tempos', 'O que fazer amanhã no consultório');

  const cols = [
    ['ANTES de iniciar', TEAL, [
      'Registre função basal: preensão palmar e sentar-levantar 5×',
      'Estime a ingestão proteica atual (g/kg)',
      'Rastreie obesidade sarcopênica em quem tem risco',
      'Combine o treino de força ANTES da 1ª dose',
    ]],
    ['DURANTE o escalonamento', MENTA, [
      'Proteína > 1,3 g/kg/dia, distribuída nas refeições',
      'Treino resistido 2–3×/semana, carga progressiva',
      'Pergunte sobre náusea: é ela que derruba a proteína',
      'Suplemento oral se a dieta não alcançar o alvo',
    ]],
    ['NO SEGUIMENTO', ALERTA, [
      'Repita a função a cada 3–6 meses, não só o peso',
      'Força caindo = investigue, não normalize',
      'Perda > 20% do peso ou idade ≥65: encurte o intervalo',
      'Reganho após parar? Revise massa magra e treino',
    ]],
  ];
  cols.forEach(([tit, cor, itens], i) => {
    const x = M + i * 4.12;
    cartao(s, x, 1.95, 3.85, 3.95);
    s.addShape(p.ShapeType.roundRect, { x, y: 1.95, w: 3.85, h: 0.62, rectRadius: 0.08, fill: { color: cor } });
    s.addText(tit, {
      x: x + 0.2, y: 1.95, w: 3.45, h: 0.62, fontFace: H, fontSize: 15, bold: true,
      color: BRANCO, margin: 0, valign: 'middle',
    });
    s.addText(itens.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < itens.length - 1 } })), {
      x: x + 0.26, y: 2.75, w: 3.35, h: 3.0, fontFace: B, fontSize: 12.5,
      color: TINTA, margin: 0, paraSpaceAfter: 9,
    });
  });
  rodape(s, 'Síntese da aula. Doses e limiares nas fontes citadas em cada slide.');
  s.addNotes(
    '[27:30–29:00] A receita. Diga ao público que este é o slide para dar pause e fotografar.\n\n' +
    'Coluna 1 — o ponto forte é o ÚLTIMO item: combinar o treino antes da primeira dose. ' +
    'A janela de maior perda é o escalonamento.\n\n' +
    'Coluna 2 — o item da náusea é o mais prático da aula: o efeito adverso gastrintestinal é o ' +
    'que faz a proteína despencar, e ninguém pergunta.\n\n' +
    'Coluna 3 — a regra de ouro: mede-se função, não só peso. "Força caindo = investigue, não normalize."'
  );
}

// ═══ 14. COMO MONITORAR ═══════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'O que dá para medir no consultório', 'Sem depender de DXA');

  const linhas = [
    ['Preensão palmar', 'Dinamômetro de mão', 'Barato, validado, sensível — o melhor custo-benefício'],
    ['Sentar-levantar 5×', 'Cadeira e cronômetro', 'Função de membro inferior; zero equipamento'],
    ['Circunferência da panturrilha', 'Fita métrica', 'Marcador de massa muscular; ajuste pelo IMC'],
    ['Velocidade de marcha', '4 metros e cronômetro', 'Preditor funcional consagrado'],
    ['DXA ou bioimpedância', 'Quando disponível', 'Composição corporal; útil, não indispensável'],
  ];
  linhas.forEach(([a, b, c], i) => {
    const y = 1.95 + i * 0.86;
    if (i % 2 === 0) cartao(s, M, y, 12.1, 0.76);
    s.addText(a, {
      x: M + 0.3, y, w: 3.5, h: 0.76, fontFace: B, fontSize: 14, bold: true, color: TEAL, margin: 0, valign: 'middle',
    });
    s.addText(b, {
      x: M + 3.9, y, w: 3.0, h: 0.76, fontFace: B, fontSize: 13, color: TINTA, margin: 0, valign: 'middle',
    });
    s.addText(c, {
      x: M + 7.0, y, w: 5.0, h: 0.76, fontFace: B, fontSize: 12.5, color: CINZA, margin: 0, valign: 'middle',
    });
  });
  rodape(s, 'Instrumentos de rastreio funcional; critérios diagnósticos de obesidade sarcopênica em Donini LM et al. Obes Facts 2022.');
  s.addNotes(
    '[29:00–30:00] Monitorização.\n\n' +
    'A mensagem: a barreira NÃO é tecnológica. Dinamômetro de mão, cadeira, cronômetro e fita ' +
    'métrica resolvem a maior parte.\n\n' +
    'Se você tiver que escolher UM, escolha a preensão palmar — foi o desfecho que melhorou no ' +
    'SEMALEAN e é o mais fácil de repetir na consulta seguinte.\n\n' +
    'DXA é bom e não é pré-requisito. Não deixe de monitorar por não ter DXA.'
  );
}

// ═══ 15. O QUE VEM AÍ ═════════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'O que vem aí', 'Bloqueio da via miostatina–ativina');

  cartao(s, M, 1.95, 12.1, 1.5);
  s.addText('A via', {
    x: M + 0.35, y: 2.12, w: 2.0, h: 0.36, fontFace: H, fontSize: 17, bold: true, color: TEAL, margin: 0,
  });
  s.addText('Miostatina e activina A sinalizam pelos receptores de activina tipo II (ActRII) e ANTAGONIZAM o crescimento muscular. Bloqueá-los induz hipertrofia e reduz massa gorda.', {
    x: M + 0.35, y: 2.55, w: 11.4, h: 0.75, fontFace: B, fontSize: 14, color: TINTA, margin: 0,
  });

  const ev = [
    ['Bimagrumabe · fase 2', 'Em DM2 com obesidade, 48 semanas: perda de massa gorda com ganho de massa magra (JAMA Netw Open 2021)'],
    ['Bimagrumabe + semaglutida', 'Em modelo animal, o bloqueio de ActRII preservou massa muscular e AUMENTOU a perda de gordura durante o agonismo GLP-1 (Mol Metab 2024)'],
    ['Pipeline', 'Trevogrumabe, garetosmabe e combinações com incretinas em desenvolvimento'],
  ];
  ev.forEach(([t, d], i) => {
    const y = 3.7 + i * 1.02;
    selo(s, M, y + 0.1, String(i + 1), TEAL, BRANCO, 0.52);
    s.addText(t, {
      x: M + 0.78, y: y - 0.02, w: 3.6, h: 0.42, fontFace: B, fontSize: 14.5, bold: true, color: TINTA, margin: 0,
    });
    s.addText(d, {
      x: M + 4.5, y: y - 0.02, w: 7.6, h: 0.85, fontFace: B, fontSize: 13, color: CINZA, margin: 0,
    });
  });

  s.addText('Ainda não é conduta. É o motivo pelo qual a pergunta desta aula vai continuar em pauta.', {
    x: M, y: 6.55, w: 12.1, h: 0.4, fontFace: B, fontSize: 14.5, italic: true, color: TEAL, margin: 0,
  });
  rodape(s, 'Heymsfield SB et al. JAMA Netw Open 2021;4(1):e2033457 · Nunn E et al. Mol Metab 2024;80:101880 · Mantzoros CS et al. Metabolism 2024.');
  s.addNotes(
    '[30:00–31:00] Pipeline — mantenha curto, é bônus.\n\n' +
    'Explique a via em uma frase: miostatina e activina freiam o músculo; bloquear o receptor ' +
    'solta o freio.\n\n' +
    'Deixe MUITO claro que não é conduta hoje: fase 2 em humanos, e a combinação com semaglutida ' +
    'ainda é modelo animal.\n\n' +
    'Se estiver acima do tempo, este é o slide a cortar.'
  );
}

// ═══ 16. MENSAGENS FINAIS ═════════════════════════════════════════════════
{
  const s = slideEscuro();
  s.addText('O que levar desta aula', {
    x: M, y: 0.75, w: W - 2 * M, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: BRANCO, margin: 0,
  });

  const msgs = [
    'A perda de massa magra é real, mas a proporção do peso perdido é a mesma do placebo — o que mudou foi quanto peso se perde.',
    'Massa magra não é músculo, e massa não é função. Quem desempata é a força, e ela pode até melhorar.',
    'A mitigação tem duas pernas: proteína > 1,3 g/kg/dia preserva a MASSA; treino resistido preserva a FUNÇÃO. Uma não substitui a outra.',
    'Só a combinação de exercício e fármaco melhorou HbA1c, sensibilidade à insulina e fitness — o exercício muda o QUE se perde.',
    'Meça função, não só peso: preensão palmar e sentar-levantar bastam para começar.',
  ];
  msgs.forEach((t, i) => {
    const y = 1.65 + i * 1.02;
    selo(s, M, y + 0.06, String(i + 1), MENTA, ESCURO, 0.56);
    s.addText(t, {
      x: M + 0.86, y, w: 11.3, h: 0.86, fontFace: B, fontSize: 15,
      color: 'E3EFF0', margin: 0, valign: 'middle',
    });
  });

  s.addText('E a paciente do começo? A conduta não é suspender o fármaco — é acrescentar proteína, força e uma medida de função.', {
    x: M, y: 6.6, w: 12.1, h: 0.5, fontFace: B, fontSize: 15, italic: true, bold: true, color: MENTA, margin: 0,
  });
  s.addNotes(
    '[31:00–32:00] Fechamento.\n\n' +
    'Leia as cinco mensagens sem pressa — são o resumo que o aluno vai anotar.\n\n' +
    'Feche com a volta ao caso: a resposta NÃO é suspender a semaglutida. É acrescentar. ' +
    'Esse é o ponto que evita a conduta errada mais comum do tema.\n\n' +
    'Convide para a discussão no Mural e para os resumos relacionados na plataforma.'
  );
}

// ═══ 17. REFERÊNCIAS ══════════════════════════════════════════════════════
{
  const s = slideClaro();
  titulo(s, 'Referências', 'Para aprofundar');

  const refs = [
    'Lundgren JR, et al. Healthy Weight Loss Maintenance with Exercise, Liraglutide, or Both Combined. N Engl J Med. 2021;384(18):1719–1730.',
    'Villareal DT, et al. Aerobic or Resistance Exercise, or Both, in Dieting Obese Older Adults. N Engl J Med. 2017;376(20):1943–1955.',
    'Ma X, et al. Effect of GLP-1 receptor agonists and co-agonists on body composition: systematic review and network meta-analysis. Metabolism. 2025;164:156113.',
    'Look M, et al. Body composition changes during weight reduction with tirzepatide in the SURMOUNT-1 study. Diabetes Obes Metab. 2025;27(5):2720–2729.',
    'Neeland IJ, et al. Changes in lean body mass with GLP-1-based therapies and mitigation strategies. Diabetes Obes Metab. 2024;26 Suppl 4:16–27.',
    'Prado CM, et al. Strategies for minimizing muscle loss during use of incretin-mimetic drugs. Obes Rev. 2024;25(11):e13818.',
    'Ard J, et al. Incretin-Based Weight Loss Pharmacotherapy: Can Resistance Exercise Optimize Changes in Body Composition? Diabetes Care. 2024;47(10):1718–1730.',
    'Liu Z, Weeldreyer NR, Angadi SS. Incretin Receptor Agonism, Fat-free Mass, and Cardiorespiratory Fitness. J Clin Endocrinol Metab. 2025;110(10):2709–2717.',
    'Donini LM, et al. Definition and Diagnostic Criteria for Sarcopenic Obesity: ESPEN and EASO Consensus. Obes Facts. 2022;15(3):321–335.',
    'Deutz NEP, et al. Protein intake and exercise for optimal muscle function with aging: ESPEN Expert Group. Clin Nutr. 2014;33(6):929–936.',
    'SEMALEAN study. Impact of Semaglutide on fat mass, lean mass and muscle function. Diabetes Obes Metab. 2026.',
    'Heymsfield SB, et al. Effect of Bimagrumab vs Placebo on Body Fat Mass. JAMA Netw Open. 2021;4(1):e2033457.',
  ];
  s.addText(refs.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < refs.length - 1 } })), {
    x: M, y: 1.9, w: 12.1, h: 4.9, fontFace: B, fontSize: 11.5,
    color: TINTA, margin: 0, paraSpaceAfter: 5,
  });
  s.addNotes(
    'Slide de referência — não precisa ser lido na gravação.\n\n' +
    'Deixe no ar por alguns segundos e diga que a lista completa fica disponível junto da aula ' +
    'na plataforma.'
  );
}

p.writeFile({ fileName: '/home/user/endodirect/scratchpad/aula-massa-magra/Aula-massa-magra-AR-GLP1.pptx' })
  .then((f) => console.log('gerado: ' + f));
