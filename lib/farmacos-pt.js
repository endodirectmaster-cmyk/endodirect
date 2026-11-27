'use strict';
// Nome de fármaco em português do Brasil (DCB) nos textos que a IA escreve para o Mural.
// Professor, 27/11/2026, com print do card "Coprescrição de topiramato com semaglutida":
// "Saiu 'topiramate' ao invés de 'topiramato'". O resumo veio do abstract em inglês e a IA
// manteve a forma inglesa do nome. O prompt agora pede a forma em português, e esta função
// confere depois, porque o modelo às vezes escapa.
//
// O que NÃO muda:
// - nome comercial (Wegovy, Mounjaro) e anticorpo (-mabe fica para a IA; "denosumab" ok);
// - nome de estudo grudado com hífen ("Exenatide-PD3", "SURMOUNT-1");
// - trecho em inglês, como a sigla aberta "Prospective study of metyrapone" ou
//   "Single-Point Insulin Sensitivity Estimator": se a palavra anterior for de inglês
//   (of, with, in, and...), fica como está. Por isso "insulin" nem entra na lista: quase
//   sempre aparece dentro de nome de índice ou de produto em inglês.

// Inglês → português. Os que seguem um radical regular (gliflozina, gliptina...) ficam nas
// regras de baixo; aqui só o que é irregular ou não tem radical seguro.
const DICIONARIO = {
  semaglutide: 'semaglutida', tirzepatide: 'tirzepatida', liraglutide: 'liraglutida', dulaglutide: 'dulaglutida',
  exenatide: 'exenatida', lixisenatide: 'lixisenatida', retatrutide: 'retatrutida', cagrilintide: 'cagrilintida',
  pramlintide: 'pranlintida', survodutide: 'survodutida', mazdutide: 'mazdutida', cotadutide: 'cotadutida',
  efinopegdutide: 'efinopegdutida', petrelintide: 'petrelintida', eloralintide: 'eloralintida',
  setmelanotide: 'setmelanotida', bremelanotide: 'bremelanotida',
  topiramate: 'topiramato', phentermine: 'fentermina', naltrexone: 'naltrexona', bupropion: 'bupropiona',
  sibutramine: 'sibutramina', lorcaserin: 'lorcasserina',
  metformin: 'metformina', glimepiride: 'glimepirida', gliclazide: 'gliclazida', glibenclamide: 'glibenclamida',
  glyburide: 'gliburida', glipizide: 'glipizida',
  levothyroxine: 'levotiroxina', liothyronine: 'liotironina', methimazole: 'metimazol', thiamazole: 'tiamazol',
  carbimazole: 'carbimazol', propylthiouracil: 'propiltiouracila',
  teriparatide: 'teriparatida', abaloparatide: 'abaloparatida', palopegteriparatide: 'palopegteriparatida',
  hydrocortisone: 'hidrocortisona', dexamethasone: 'dexametasona', prednisone: 'prednisona',
  prednisolone: 'prednisolona', methylprednisolone: 'metilprednisolona', fludrocortisone: 'fludrocortisona',
  metyrapone: 'metirapona', ketoconazole: 'cetoconazol', levoketoconazole: 'levocetoconazol',
  mifepristone: 'mifepristona', pasireotide: 'pasireotida', octreotide: 'octreotida', lanreotide: 'lanreotida',
  paltusotine: 'paltusotina', cabergoline: 'cabergolina', bromocriptine: 'bromocriptina', somatropin: 'somatropina',
  lonapegsomatropin: 'lonapegsomatropina',
  testosterone: 'testosterona', progesterone: 'progesterona', spironolactone: 'espironolactona',
  eplerenone: 'eplerenona', finerenone: 'finerenona', finasteride: 'finasterida', dutasteride: 'dutasterida',
  letrozole: 'letrozol', anastrozole: 'anastrozol', tamoxifen: 'tamoxifeno', clomiphene: 'clomifeno',
  raloxifene: 'raloxifeno', triptorelin: 'triptorrelina', goserelin: 'gosserrelina', leuprolide: 'leuprorrelina',
  simvastatin: 'sinvastatina', ezetimibe: 'ezetimiba', fenofibrate: 'fenofibrato', pemafibrate: 'pemafibrato',
  gemfibrozil: 'genfibrozila', tolvaptan: 'tolvaptana', desmopressin: 'desmopressina', vasopressin: 'vasopressina',
  diazoxide: 'diazóxido', amiodarone: 'amiodarona', acarbose: 'acarbose'
};

// Radicais regulares (a palavra inteira precisa terminar assim e ter algo antes).
const RADICAIS = [
  [/^(\w{2,}gliflozin)$/i, (m) => m + 'a'],          // empagliflozin → empagliflozina
  [/^(\w{2,}gliptin)$/i, (m) => m + 'a'],            // sitagliptin → sitagliptina
  [/^(\w{2,}glitazone)$/i, (m) => m.slice(0, -1) + 'a'], // pioglitazone → pioglitazona
  [/^(\w{2,}vastatin)$/i, (m) => m + 'a'],           // atorvastatin → atorvastatina
  [/^(\w{2,}(?:glutide|dutide|lintide|trutide|patide|paratide|reotide|melanotide))$/i, (m) => m.slice(0, -1) + 'a'],
  [/^(\w{2,}(?:tinib|fenib|tanib))$/i, (m) => m + 'e'], // selpercatinib → selpercatinibe
  [/^(\w{2,}dronate)$/i, (m) => m.slice(0, -1) + 'o']   // alendronate → alendronato
];

// Palavra anterior que indica trecho em inglês: aí o nome fica como está.
const INGLES_ANTES = /^(of|with|in|for|the|and|on|to|by|from|or|after|plus|among|without)$/i;

function emPortugues(palavra) {
  const baixa = palavra.toLowerCase();
  let pt = Object.prototype.hasOwnProperty.call(DICIONARIO, baixa) ? DICIONARIO[baixa] : null;
  if (!pt) for (const [re, fn] of RADICAIS) { if (re.test(baixa)) { pt = fn(baixa); break; } }
  if (!pt || pt === baixa) return null;
  // Mantém a caixa: TOPIRAMATE → TOPIRAMATO, Topiramate → Topiramato.
  if (palavra === palavra.toUpperCase() && palavra.length > 1) return pt.toUpperCase();
  if (palavra[0] === palavra[0].toUpperCase()) return pt[0].toUpperCase() + pt.slice(1);
  return pt;
}

// Artigo masculino → feminino. A forma inglesa vinha com artigo masculino ("o survodutide",
// "do retatrutide"); a portuguesa terminada em -a é feminina ("a survodutida", "da retatrutida").
const ARTIGO_FEM = { o: 'a', do: 'da', no: 'na', ao: 'à', pelo: 'pela', um: 'uma', dum: 'duma', num: 'numa',
  este: 'esta', esse: 'essa', deste: 'desta', desse: 'dessa', neste: 'nesta', nesse: 'nessa' };

function farmacosPt(texto) {
  if (typeof texto !== 'string' || !texto) return texto;
  const femininos = new Set();
  const saida = trocaNomes(texto, femininos);
  if (!femininos.size) return saida;
  const nomes = Array.from(femininos).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp('(^|[^\\wÀ-ÿ])(' + Object.keys(ARTIGO_FEM).join('|') + ')(\\s+)(' + nomes + ')(?![\\wÀ-ÿ])', 'gi');
  return saida.replace(re, (todo, ini, art, esp, nome) => {
    let fem = ARTIGO_FEM[art.toLowerCase()];
    if (art === art.toUpperCase() && art.length > 1) fem = fem.toUpperCase();
    else if (art[0] === art[0].toUpperCase()) fem = fem[0].toUpperCase() + fem.slice(1);
    return ini + fem + esp + nome;
  });
}

function trocaNomes(texto, femininos) {
  return texto.replace(/[A-Za-z][A-Za-z]+/g, (palavra, pos, tudo) => {
    // Pedaço de outra palavra (acentuada, com dígito ou hífen colado antes)? Não mexe.
    const antes = tudo.charAt(pos - 1), depois = tudo.charAt(pos + palavra.length);
    if (/[\wÀ-ÿ]/.test(antes) || /[\wÀ-ÿ]/.test(depois)) return palavra;
    // Hífen antes: só segue se for a combinação de dois fármacos ("cagrilintide-semaglutide");
    // depois de sigla ou número ("PD3-...") fica como está.
    if (antes === '-' && !/[a-zà-ÿ]/.test(tudo.charAt(pos - 2))) return palavra;
    // Nome de estudo: "Exenatide-PD3", "Semaglutide-1".
    if (depois === '-' && /[A-Z0-9]/.test(tudo.charAt(pos + palavra.length + 1))) return palavra;
    const pt = emPortugues(palavra);
    if (!pt) return palavra;
    const anterior = (tudo.slice(Math.max(0, pos - 30), pos).match(/([A-Za-z]+)[^A-Za-z]*$/) || [])[1] || '';
    if (INGLES_ANTES.test(anterior)) return palavra;
    if (/a$/i.test(pt)) femininos.add(pt);
    return pt;
  });
}

// Regra que vai nos prompts (radar, notícias, discussão).
const REGRA_PROMPT = 'Escreva os nomes de farmacos na forma em portugues do Brasil (DCB): topiramato, semaglutida, tirzepatida, survodutida, metformina, empagliflozina, levotiroxina; nunca a forma em ingles (topiramate, semaglutide). Nomes comerciais e de estudos ficam como estao.';

module.exports = { farmacosPt, REGRA_PROMPT, DICIONARIO };
