// A GUARDA CONTRA JARGÃO PRECISA PEGAR O TEXTO QUE FOI PUBLICADO ERRADO.
//
// ⚠️ 02/09/2026. O professor: *"evite jargão de IA. Você está sempre escrevendo
// com jargão. Deixe sempre conteúdo estritamente técnico e formal."* A correção
// é sobre um hábito, não sobre uma frase — por isso virou script
// (`scripts/checa-jargao.js`) e não uma nota que eu leio e esqueço.
//
// Este teste prova duas coisas: que o leitor PEGA o texto real que eu publiquei
// errado no resumo da 1ª aula de EMC, e que NÃO acusa prosa clínica legítima.
const { analisar } = require('./checa-jargao.js');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// Trechos LITERAIS da primeira versão do resumo, publicada e corrigida.
const ERRADO = [
  'POR QUE O TEMA IMPORTA',
  'Leitura Prática',
  'Massa Magra Não É Sinônimo De Músculo',
  '• A ordem importa: função é o primeiro passo diagnóstico, não o último.',
  '• Repetir força e função periodicamente. A balança sozinha não responde à pergunta.',
  '• O efeito anorexígeno compete com a meta: dentro de um apetite menor, a proteína precisa vir primeiro no prato.',
  '• Perda muito rápida com aporte energético e proteico muito baixo é o cenário que mais custa músculo.',
  '• ⚠️ Nenhuma dessas opções está aprovada para essa finalidade.',
  'o que muda com o incretínico é a MAGNITUDE da perda total',
];
ERRADO.forEach(t => {
  ok(analisar(t, 'x').length > 0,
    '🧨 o leitor de jargão NÃO pega um trecho que eu publiquei errado: ' + JSON.stringify(t));
});

// Prosa clínica legítima não pode ser acusada — guarda que grita demais é
// guarda que se desliga.
const CERTO = [
  'FUNDAMENTAÇÃO',
  'ESTRATIFICAÇÃO DE RISCO',
  '• Na densitometria de dupla energia (DXA), o compartimento de massa magra compreende água corporal, vísceras, tecido conjuntivo e glicogênio.',
  '• Tirzepatida: redução de 21,3% do peso, 33,9% da massa gorda e 10,9% da massa magra.',
  '• O consenso ESPEN-EASO estabelece algoritmo sequencial: rastreamento, avaliação da função muscular, avaliação da composição corporal e estadiamento.',
  '• Índice de massa corporal e circunferência abdominal têm função de rastreamento e não estabelecem o diagnóstico.',
  '• 1,0 a 1,5 g/kg/dia, calculados sobre o peso ajustado ou ideal.',
  'Qual é a leitura CORRETA desses dados?',
  'Ao interpretar a DXA, qual afirmação é INCORRETA?',
];
CERTO.forEach(t => {
  const a = analisar(t, 'x');
  ok(a.length === 0,
    '🧨 falso positivo em prosa clínica legítima: ' + JSON.stringify(t) + ' → ' + JSON.stringify(a.map(x => x.trecho + ' (' + x.motivo + ')')));
});

// O leitor precisa dizer ONDE está o problema, não só que existe.
{
  const a = analisar('linha boa\n• Na prática, isso é fundamental.', 'y');
  ok(a.length >= 2 && a.every(x => x.linha === 2 && x.origem === 'y' && x.trecho && x.motivo),
    '⚠️ o relato do leitor perdeu linha, origem, trecho ou motivo — sem isso não dá para corrigir');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ jargão: o leitor pega os ' + ERRADO.length + ' trechos que foram publicados errados e não acusa nenhum dos ' + CERTO.length + ' trechos de prosa clínica legítima');
