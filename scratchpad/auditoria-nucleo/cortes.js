#!/usr/bin/env node
/* INVENTÁRIO DE CORTES: o mesmo exame com números diferentes em lugares diferentes.
 *
 * Por que existe: as auditorias semânticas leem entrada por entrada e são caras.
 * Esta peneira é mecânica e responde uma pergunta que nenhuma delas responde
 * sozinha: **a base concorda consigo mesma?** Se `DST ≤1,8 µg/dL` aparece no
 * núcleo e `DST ≤1,9` numa nota do cofre, um dos dois está errado — e não
 * precisa de leitura clínica para saber que há defeito.
 *
 * Não decide QUEM está certo. Diz onde há divergência, que é onde vale gastar
 * leitura.
 *
 * Corpus: núcleo (`CLINICAL_GUIDELINES`) + `cofre/Diretrizes Clínicas/*.md` +
 * os temas/textos da base profunda (`lib/clinical-deep-data.js`).
 *
 * ⚠️ Dicionário de EXAMES, não regex solta em número. Regex solta acha "40" no
 * cabeçalho de uma tabela e chama de corte — foi assim que uma prova fabricada
 * passou verde. Aqui um corte só existe quando um exame NOMEADO está perto de
 * um comparador com número e unidade.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
const { nucleoTexto } = require(path.join(RAIZ, 'lib', 'nucleo.js'));

const deacc = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Exame → sinônimos. A chave é o nome canônico do que se mede.
const EXAMES = {
  'TSH':               ['tsh'],
  'T4 livre':          ['t4 livre', 't4l', 'free t4', 'ft4'],
  // ⚠️ `não-HDL-c` e `ApoB` são exames PRÓPRIOS, não variantes do HDL. A primeira
  // versão desta peneira leu "não-HDL-c < 130" como corte de HDL e inventou uma
  // divergência de 11 valores num único artigo, todos legítimos.
  'LDL-c':             ['ldl-c', 'ldl'],
  'não-HDL-c':         ['nao-hdl-c', 'nao-hdl', 'colesterol nao-hdl'],
  'ApoB':              ['apob', 'apolipoproteina b'],
  'HDL-c':             ['hdl-c', 'hdl'],
  'triglicérides':     ['triglicerides', 'triglicerideos', 'tg'],
  'Lp(a)':             ['lp(a)', 'lipoproteina (a)'],
  'HbA1c':             ['hba1c', 'a1c', 'hemoglobina glicada'],
  'glicemia de jejum': ['glicemia de jejum', 'jejum'],
  'TOTG 1h':           ['totg-1h', 'totg 1h', 'glicemia de 1 hora', '1 hora no totg'],
  'TOTG 2h':           ['totg-2h', 'totg 2h', 'glicemia 2h', '2h no totg'],
  'cortisol (DST 1mg)': ['dst', 'supressao com 1 mg', 'supressao com dexametasona', '1 mg de dexametasona'],
  'cortisol matinal':  ['cortisol matinal', 'cortisol basal', 'cortisol serico matinal'],
  'cortisol salivar':  ['lnsc', 'cortisol salivar'],
  'UFC (cortisol livre urinário)': ['ufc', 'cortisol livre urinario'],
  'ACTH':              ['acth'],
  'copeptina':         ['copeptina', 'copeptin'],
  'sódio':             ['sodio', 'natremia', 'na serico'],
  'cálcio':            ['calcio total', 'calcio serico', 'calcemia'],
  'cálcio iônico':     ['calcio ionico', 'calcio ionizado'],
  'PTH':               ['pth', 'paratormonio'],
  'vitamina D (25-OH)': ['25-oh', '25(oh)d', 'vitamina d'],
  'fósforo':           ['fosforo', 'fosfatemia'],
  'prolactina':        ['prolactina', 'prl'],
  'IGF-1':             ['igf-1', 'igf1'],
  'GH (nadir no TOTG)': ['nadir de gh', 'nadir do gh', 'gh no totg', 'nadir'],
  'testosterona total': ['testosterona total', 'testosterona'],
  'FSH':               ['fsh'],
  'AMH':               ['amh', 'hormonio antimulleriano'],
  'escore T':          ['escore t', 't-score'],
  'escore Z':          ['escore z', 'z-score'],
  'metanefrinas':      ['metanefrina', 'normetanefrina'],
  'aldosterona/renina (ARR)': ['arr', 'aldosterona/renina', 'relacao aldosterona'],
  'TFGe':              ['tfge', 'egfr', 'clcr', 'clearance'],
  'RAC (albumina/creatinina)': ['rac', 'razao albumina', 'albuminuria'],
  'IMC':               ['imc', 'indice de massa corporal'],
  'circunferência abdominal': ['circunferencia abdominal', 'circunferencia da cintura'],
  '17-OH-progesterona': ['17-oh-progesterona', '17ohp', '17-ohp'],
  'TRAb':              ['trab'],
  'anti-TPO':          ['anti-tpo', 'tpoab', 'antitpo'],
  'iodo':              ['iodo'],
};

// Unidades reconhecidas. Sem unidade, um número não é corte (é contagem, ano, dose).
const UNI = ['mg/dl', 'g/dl', 'mcg/dl', 'µg/dl', 'ug/dl', 'ng/ml', 'ng/dl', 'pg/ml', 'pmol/l',
  'nmol/l', 'mmol/l', 'meq/l', 'mui/l', 'miu/l', 'ui/l', 'iu/l', 'u/l', 'mui/ml', '%',
  'ml/min/1,73', 'ml/min', 'mg/g', 'mg/mmol', 'kg/m2', 'kg/m²', 'cm', 'µg/d', 'mcg/d', 'µg/dia'];
const UNI_RE = UNI.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|');

// corte = comparador + número + unidade
const CORTE = new RegExp('([<>≥≤]=?|maior que|menor que|acima de|abaixo de)\\s*([0-9]{1,4}(?:[.,][0-9]{1,3})?)\\s*(' + UNI_RE + ')', 'gi');

const JANELA = 90; // quantos chars antes do corte procuramos o nome do exame

// ⚠️ SIGLA CURTA CASA NO MEIO DE PALAVRA, e a primeira versão desta peneira caiu
// nisso três vezes: `arr` dentro de "a-RR-itmia", `rac` dentro de "satu-RAC-ão" e
// de "sup-RAC-orreção", `tg` dentro de qualquer coisa. O potássio da cetoacidose
// virou "relação aldosterona/renina" e a testosterona virou "albuminúria".
// É a mesma colisão já registrada no cofre (radical de 5 letras casando no meio
// de palavra) — e eu a repeti. Borda de palavra resolve.
const BORDA = /[a-z0-9]/;
function ultimaComBorda(hay, agulha) {
  let p = hay.lastIndexOf(agulha);
  while (p >= 0) {
    const antes = p > 0 ? hay[p - 1] : '';
    const depois = hay[p + agulha.length] || '';
    const abre = !antes || !BORDA.test(antes);
    // depois pode ser plural/flexão: "ldl-c" seguido de "s" ainda é ldl-c
    const fecha = !depois || !BORDA.test(depois) || depois === 's';
    if (abre && fecha) return p;
    p = hay.lastIndexOf(agulha, p - 1);
  }
  return -1;
}

function acha(texto, origem, achados) {
  const t = deacc(texto);
  let m;
  CORTE.lastIndex = 0;
  while ((m = CORTE.exec(t)) !== null) {
    const antes = t.slice(Math.max(0, m.index - JANELA), m.index);
    // O exame mais PRÓXIMO do número vence — "TSH … LDL <70" não é corte de TSH.
    // ⚠️ Proximidade é do FIM do nome, e empate desempata pelo nome MAIS LONGO:
    // "nao-hdl-c" e "hdl-c" terminam no mesmo ponto, e é o longo que está certo.
    let melhor = null, melhorFim = -1, melhorLen = -1;
    for (const [nome, sins] of Object.entries(EXAMES)) {
      for (const s of sins) {
        const d = deacc(s);
        const p = ultimaComBorda(antes, d);
        if (p < 0) continue;
        const fim = p + d.length;
        if (fim > melhorFim || (fim === melhorFim && d.length > melhorLen)) {
          melhorFim = fim; melhorLen = d.length; melhor = nome;
        }
      }
    }
    if (!melhor) continue;
    achados.push({
      exame: melhor,
      comparador: m[1].replace(/\s+/g, ' '),
      valor: m[2].replace('.', ','),
      unidade: m[3],
      origem,
      trecho: texto.slice(Math.max(0, m.index - 70), m.index + m[0].length + 10).replace(/\s+/g, ' '),
    });
  }
}

const achados = [];

// 1. núcleo, entrada por entrada
nucleoTexto().split('\n').filter((l) => l.trim().startsWith('•')).forEach((l, i) => {
  acha(l, 'núcleo #' + i + ' — ' + l.replace(/^\s*•\s*/, '').split(/[:—]/)[0].slice(0, 42), achados);
});

// 2. notas do cofre
const DIR = path.join(RAIZ, 'cofre', 'Diretrizes Clínicas');
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md') && x !== 'README.md')) {
  acha(fs.readFileSync(path.join(DIR, f), 'utf8'), 'cofre/' + f.replace(/\.md$/, '').slice(0, 52), achados);
}

// 3. base profunda (o que a IA recebe nas perguntas da área)
const DEEP = require(path.join(RAIZ, 'lib', 'clinical-deep-data.js'));
for (const area of Object.keys(DEEP)) {
  for (const b of DEEP[area]) acha(b.tema + ' ' + b.texto, 'profundo/' + area + ' — ' + String(b.fonte).slice(0, 34), achados);
}

// ── agrupa por exame + unidade e procura divergência de valor ────────────────
const porExame = {};
for (const a of achados) {
  const k = a.exame + ' [' + a.unidade + ']';
  (porExame[k] = porExame[k] || []).push(a);
}

const divergentes = [];
for (const k of Object.keys(porExame).sort()) {
  const grupo = porExame[k];
  const chaves = new Set(grupo.map((g) => g.comparador + ' ' + g.valor));
  const valores = new Set(grupo.map((g) => g.valor));
  if (valores.size > 1 || chaves.size > 1) divergentes.push({ k, grupo, valores: [...valores] });
}

console.log('INVENTÁRIO DE CORTES DA BASE CLÍNICA\n');
console.log('cortes reconhecidos: ' + achados.length + ' em ' + new Set(achados.map((a) => a.origem)).size + ' origens');
console.log('exames com corte: ' + Object.keys(porExame).length);
console.log('exames com MAIS DE UM valor: ' + divergentes.length);

// ⚠️ NEM TODA DIVERGÊNCIA É CONTRADIÇÃO. Meta de LDL muda com o risco, corte de
// cortisol muda com o teste — a mesma base pode dizer 50, 70 e 100 mg/dL sem
// nenhum erro. Por isso isto NÃO é guarda de CI: é lista de leitura.
// O recorte que vale ler primeiro é o que envolve o NÚCLEO, que é o acusado —
// ele vai em toda chamada de IA e não tem contexto para escolher a faixa.
const daNucleo = divergentes.filter((d) => d.grupo.some((g) => g.origem.startsWith('núcleo')));
console.log('  destes, envolvendo o NÚCLEO: ' + daNucleo.length + '\n');
console.log('══ SEÇÃO A — divergências que tocam o núcleo (ler estas) ══\n');

const mostra = (lista) => {
  for (const d of lista) {
    console.log('── ' + d.k + '  → ' + d.valores.length + ' valores: ' + d.valores.join(' | '));
    const vistos = new Set();
    for (const g of d.grupo) {
      const key = g.comparador + g.valor + g.origem;
      if (vistos.has(key)) continue;
      vistos.add(key);
      console.log('     ' + (g.comparador + ' ' + g.valor).padEnd(12) + ' ' + g.origem);
      console.log('        …' + g.trecho + '…');
    }
    console.log('');
  }
};
mostra(daNucleo);

fs.writeFileSync(path.join(__dirname, 'cortes.json'), JSON.stringify({ achados, divergentes }, null, 1));
console.log('gravado em scratchpad/auditoria-nucleo/cortes.json');
