'use strict';
// RECORTES DE FIGURAS DE LIVROS NOS RESUMOS (decisão do professor, 17/10/2026: "Apenas faça
// recorte da gravura e abaixo coloque a referência do livro abreviado").
// O recorte entra sem alteração; a legenda é a descrição + a referência abreviada (autor,
// obra, edição, número da figura). As imagens NÃO entram no repositório (é público): ficam no
// armazenamento da plataforma (bucket endodirect-assets, pasta resumos/livros) e os recortes
// originais no bucket privado `livros`. Aqui só a lista: capítulo, trecho, legenda.
//   origem: arquivo no zip da extração (pasta/nome); arquivo: nome final no bucket.
//   depoisDe: trecho do capítulo (aparece UMA vez) depois de cuja linha a figura entra.
//   substitui: ilustração própria (SVG) que o recorte substitui, onde o livro tem figura
//   equivalente; largura: % da coluna (sintaxe {N} do editor), para pranchas altas;
//   formato: 'jpg' para prancha pintada pesada (o PNG do Netter tinha 2 MB); aparaTopo: tira
//   a faixa de cima com o fio decorativo da página, acima da figura.
const W = 'Melmed S et al., Williams Textbook of Endocrinology, 14ª ed.';
const G = 'Gardner DG, Shoback D, Greenspan\'s Basic & Clinical Endocrinology, 10ª ed.';
const M = 'Molina PE, Endocrine Physiology, 5ª ed.';
const N = 'Young WF Jr, The Netter Collection of Medical Illustrations: Endocrine System, 2ª ed.';
const H = 'Hall JE, Guyton & Hall Tratado de Fisiologia Médica, 13ª ed.';
const fonte = (obra, fig) => ' Fonte: ' + obra + ', ' + fig + '.';

const C149 = 'Hormônios: Classes, Síntese e Transporte';
const C150 = 'Receptores Hormonais e Transdução de Sinal';
const C151 = 'Fisiologia Endócrina: Eixos e Feedback';
const C152 = 'Biologia Molecular e Genética em Endocrinologia';

module.exports = [
  // 149 — Hormônios: classes, síntese e transporte
  { id: 'greenspan-1-1-modos-de-acao', pos: 149, tema: C149, origem: '01_organizacao_anatomia_histologia/modos_de_sinalizacao_endocrina_paracrina_autocrina__Greenspan_p28.png',
    depoisDe: 'age na própria célula que o secretou (IGF-1 em alguns tumores).',
    legenda: 'Modos de ação dos hormônios e neurotransmissores: endócrino, parácrino, autócrino e intrácrino.' + fonte(G, 'fig. 1-1') },
  { id: 'greenspan-17-2-celula-beta', pos: 149, tema: C149, origem: '06_pancreas_endocrino/estrutura_da_celula_beta_e_biossintese_da_insulina__Greenspan_p623.png',
    depoisDe: 'é o marcador da secreção **endógena** de insulina.',
    legenda: 'Célula beta: síntese da pré-pró-insulina no retículo, conversão da pró-insulina em insulina no Golgi e estoque em grânulos de secreção.' + fonte(G, 'fig. 17-2') },
  { id: 'williams-15-4-esteroidogenese', pos: 149, tema: C149, origem: '05_adrenal/esteroidogenese_adrenal_enzimas__Williams_p599.png', aparaTopo: true,
    depoisDe: 'com acúmulo de **17-OH-progesterona**.',
    legenda: 'Esteroidogênese adrenal: do colesterol (StAR, CYP11A1) às vias dos mineralocorticoides, dos glicocorticoides e dos androgênios.' + fonte(W, 'fig. 15.4') },
  { id: 'williams-11-1-celula-folicular', pos: 149, tema: C149, origem: '04_tireoide/celula_folicular_transporte_de_iodo_e_sintese_hormonal__Williams_p416.png',
    depoisDe: 'PTU também inibe a D1.',
    legenda: 'Célula folicular tireoidiana: captação de iodeto pelo NIS, organificação pela TPO com a DUOX2, acoplamento na tireoglobulina e secreção de T4 e T3.' + fonte(W, 'fig. 11.1') },
  // 150 — Receptores hormonais e transdução de sinal
  { id: 'williams-1-2-membrana-e-intracelular', pos: 150, tema: C150, origem: '02_mecanismos_acao_hormonal/receptores_de_superficie_e_intracelulares__Williams_p19.png',
    depoisDe: 'e **receptores nucleares** (hormônios lipossolúveis).',
    legenda: 'Sinalização por receptores de membrana (via AMPc e via tirosina-quinase) e por receptor intracelular (progesterona).' + fonte(W, 'fig. 1.2') },
  { id: 'guyton-75-4-ativacao-proteina-g', pos: 150, tema: C150, origem: '02_mecanismos_acao_hormonal/ativacao_receptor_acoplado_proteina_g_pt__Guyton_p2686.png',
    depoisDe: 'a atividade **GTPásica** intrínseca encerra o sinal.',
    legenda: 'Ativação do receptor acoplado à proteína G: a ligação do hormônio troca o GDP por GTP na subunidade α, que se separa e ativa a proteína-alvo.' + fonte(H, 'fig. 75-4') },
  { id: 'molina-1-5-receptor-proteina-g', pos: 150, tema: C150, origem: '02_mecanismos_acao_hormonal/receptor_acoplado_a_proteina_g__Molina_p26.png',
    substitui: 'endocrinologia-basica--receptores-gpcr.svg',
    legenda: 'Receptor acoplado à proteína G (sete domínios transmembrana) e os efetores de cada subunidade α: Gs e Gi (adenilil-ciclase), Gq (fosfolipase C-β) e G12 (Rho).' + fonte(M, 'fig. 1-5') },
  { id: 'williams-34-4-receptor-insulina', pos: 150, tema: C150, origem: '06_pancreas_endocrino/sinalizacao_do_receptor_de_insulina__Williams_p1691.png',
    depoisDe: 'e **RAS/MAPK** (crescimento e mitogênese).',
    legenda: 'Sinalização dos receptores de insulina e de IGF-1: IRS, via PI3K-Akt (efeitos metabólicos) e via Ras-MAPK (crescimento).' + fonte(W, 'fig. 34.4') },
  { id: 'molina-1-6-quinase-e-jak-stat', pos: 150, tema: C150, origem: '02_mecanismos_acao_hormonal/receptores_tirosina_cinase_e_citocinas_jak_stat__Molina_p28.png',
    substitui: 'endocrinologia-basica--receptores-quinases.svg',
    legenda: 'Receptor com atividade tirosina-quinase (insulina, com a translocação do GLUT4) e receptor de citocina classe 1 (JAK-STAT, com regulação negativa pela SOCS).' + fonte(M, 'fig. 1-6') },
  { id: 'williams-2-16-dominios-nucleares', pos: 150, tema: C150, origem: '02_mecanismos_acao_hormonal/dominios_estruturais_dos_receptores_nucleares__Williams_p48.png',
    depoisDe: 'Exemplos de hormônios: **cortisol, aldosterona, andrógenos, estrógenos, progesterona, T3, vitamina D, ácido retinoico**.',
    legenda: 'Organização dos receptores nucleares em domínios (A/B a F): AF-1, ligação ao DNA, ligação ao ligante e AF-2.' + fonte(W, 'fig. 2.16') },
  // 151 — Fisiologia endócrina: eixos e feedback
  { id: 'netter-1-3-sistema-porta', pos: 151, tema: C151, origem: '01_organizacao_anatomia_histologia/irrigacao_da_hipofise_sistema_porta_hipofisario__Netter_p18.png', largura: 60, formato: 'jpg',
    depoisDe: 'e **dopamina** (inibe prolactina).',
    legenda: 'Irrigação da hipófise: o sistema porta hipotálamo-hipofisário leva os hormônios hipotalâmicos à adeno-hipófise.' + fonte(N, 'prancha 1-3') },
  { id: 'molina-1-10-alcas-de-feedback', pos: 151, tema: C151, origem: '03_eixos_hipotalamo_hipofise/alcas_de_retroalimentacao_longa_curta_ultracurta__Molina_p38.png',
    depoisDe: 'e **ultracurta** (hormônio hipotalâmico sobre a própria secreção).',
    legenda: 'Alças de retroalimentação negativa: longa (a), curta (b) e ultracurta (c).' + fonte(M, 'fig. 1-10') },
  { id: 'williams-11-8-feedback-tireoidiano', pos: 151, tema: C151, origem: '04_tireoide/retroalimentacao_t4_t3_no_hipotalamo_e_hipofise__Williams_p429.png',
    depoisDe: 'por isso o TSH é o teste mais sensível de disfunção primária.',
    legenda: 'Retroalimentação do eixo tireoidiano: a D2 converte T4 em T3 no hipotálamo e na hipófise, e o T3 local inibe o TRH e o TSH.' + fonte(W, 'fig. 11.8') },
  { id: 'williams-8-4-eixos', pos: 151, tema: C151, origem: '03_eixos_hipotalamo_hipofise/visao_geral_dos_eixos_hipotalamo_hipofise_alvo__Williams_p236.png',
    depoisDe: '(esta inibe seletivamente o FSH).',
    legenda: 'Os eixos hipotálamo-hipófise-órgão-alvo lado a lado: corticotrófico, tireotrófico, gonadotrófico, somatotrófico e lactotrófico.' + fonte(W, 'fig. 8.4') },
  { id: 'williams-17-1-ciclo-menstrual', pos: 151, tema: C151, origem: '08_gonadas_ciclo_menstrual/ciclo_menstrual_ovariano_endometrial_e_hormonal__Williams_p707.png', aparaTopo: true, largura: 75,
    depoisDe: 'Outros exemplos: **ocitocina** no parto (reflexo de Ferguson) e na ejeção láctea.',
    legenda: 'Ciclo menstrual: folículo, endométrio e níveis de FSH, LH, estradiol e progesterona, com o eixo hipotálamo-hipófise-ovário.' + fonte(W, 'fig. 17.1') },
  { id: 'greenspan-17-5-sensor-de-glicose', pos: 151, tema: C151, origem: '06_pancreas_endocrino/sensor_de_glicose_e_secrecao_de_insulina_glp1__Greenspan_p625.png',
    depoisDe: 'explica por que os agonistas de GLP-1 não provocam hipoglicemia isoladamente.',
    legenda: 'Detecção da glicose pela célula beta e secreção de insulina: ATP, canal de potássio dependente de ATP (SUR1), canal de cálcio e a potencialização pelo GLP-1.' + fonte(G, 'fig. 17-5') },
  { id: 'greenspan-7-7-tireoglobulina', pos: 151, tema: C151, origem: '04_tireoide/sintese_iodacao_e_reabsorcao_da_tireoglobulina__Greenspan_p200.png',
    depoisDe: '| **4. Secreção** | **Endocitose da tireoglobulina** e liberação de T3 e T4 na circulação por **proteases** |',
    legenda: 'Síntese e iodação da tireoglobulina e sua reabsorção e digestão lisossomal, com a liberação de T4 e T3.' + fonte(G, 'fig. 7-7') },
  { id: 'greenspan-7-14-desiodacao', pos: 151, tema: C151, origem: '04_tireoide/vias_de_desiodacao_da_tiroxina__Greenspan_p206.png',
    depoisDe: 'e é o que explica por que o TSH é tão sensível a pequenas quedas do T4.',
    legenda: 'Vias de desiodação da T4: ativação em T3 e inativação em T3 reverso.' + fonte(G, 'fig. 7-14') },
  // 152 — Biologia molecular e genética
  { id: 'greenspan-1-17-receptor-esteroide', pos: 152, tema: C152, origem: '02_mecanismos_acao_hormonal/mecanismo_do_receptor_nuclear_de_esteroide__Greenspan_p45.png',
    depoisDe: 'contra segundos–minutos dos que agem por receptor de membrana.',
    legenda: 'Receptor de esteroide: o hormônio desloca a HSP, o receptor dimeriza, liga-se ao elemento responsivo (HRE) no DNA e recruta os fatores de transcrição.' + fonte(G, 'fig. 1-17') },
];
