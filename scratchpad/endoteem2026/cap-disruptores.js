// Capítulo novo: Disruptores endócrinos (aula EndoTEEM 2026 "4 - Disruptores", design DAGnvvZVfxU, 19 slides)
const resumo = `## O que são e onde estão

Disruptores endócrinos (DE) são substâncias que interferem na função hormonal normal. A aula organiza as fontes em quatro grupos, com um representante cada:

- **Plásticos** → **bisfenol A**;
- **Cosméticos** → **parabenos**;
- **Pesticidas** → **percloratos**;
- **Metais pesados** → **mercúrio**.

As questões da aula acrescentam à lista as **dioxinas** e os **fitoestrógenos**, e registram que **as agências de controle ambiental vêm identificando um número crescente de contaminantes com atividade de disruptor**, que podem se tornar um grande problema de saúde pública.

## Propriedades que explicam o dano

- Podem ser **substâncias naturais ou sintéticas**.
- Agem como **agonistas ou antagonistas de receptores hormonais** — o **bisfenol A é agonista do receptor estrogênico** e os **ftalatos são antagonistas do receptor androgênico**.
- Produzem **efeitos na transdução de sinal hormonal**, ou seja, atuam além da simples ocupação do receptor.
- São frequentemente **lipofílicos** e **acumulam-se no tecido adiposo**.
- Têm **efeito cumulativo** no organismo.
- **Atravessam a barreira placentária**.

## Eixo metabólico

O bloco que a aula mais desenvolve, apoiado na revisão de Dalamaga e colaboradores sobre bisfenóis e ftalatos na obesidade (*Int J Mol Sci*, 2024), separa três alvos:

- **Metabolismo energético** — alteração na expressão de genes da **adipogênese (PPARγ)** e na **diferenciação de pré-adipócitos em adipócitos maduros**.
- **Sinalização de saciedade e fome** — **resistência à leptina** e **alteração da microbiota intestinal**.
- **Sinalização de insulina** — **resistência insulínica**.

## Os três eixos hipotálamo-hipófise

- **Tireoide** — alteração na **TPO** (tireoperoxidase) e no **NIS** (cotransportador sódio-iodeto), com **aumento do TSH**.
- **Adrenal** — alteração do **ciclo circadiano do cortisol**.
- **Gônadas** — a ligação ao **receptor estrogênico** leva a **puberdade precoce em meninas**; há **redução da ação dos contraceptivos orais**; e a alteração da **secreção de LH** leva a **SOP**.

## 📊 Tipos de disruptor, exposição e alterações

| Disruptor | Exposição | Alterações |
| --- | --- | --- |
| DDT | pesticidas | redução da espermatogênese; alteração na foliculogênese; criptorquidia |
| Mercúrio | tintas, agrotóxicos | teratogênico; SOP; abortamento |
| Cádmio | estabilizantes de plásticos, baterias | câncer de próstata e testículo; atrofia testicular |
| Chumbo | eletrônicos, brinquedos | alteração na foliculogênese; disfunção tireoidiana |
| Bisfenol A | recipiente de alimentos | aumento de prolactina; obesidade e DM2; SOP; puberdade precoce em meninas |
| Ftalatos | esmaltes de unhas, verniz | câncer de mama; criptorquidia e hipospádia |

## Regulação no Brasil

**Desde 2009 a ANVISA limita a concentração de ftalatos e derivados a menos de 1% em peso** nos **copos e garrafas plásticas descartáveis**.

⚠️ Depois da proibição do **bisfenol A (BPA)**, a indústria criou os **bisfenóis F e S** acreditando que não seriam nocivos — **o que, de fato, não se comprovou**. A substituição não resolveu o problema, e é esse o ponto que a aula quer fixar.

## Como reduzir a exposição

1. **Intervenções nutricionais e de estilo de vida** — evitar recipientes de plástico e alimentos e bebidas enlatadas; consumir alimentos frescos e orgânicos.
2. **Educação e conscientização** — orientar os pacientes sobre os riscos dos DE e sobre como evitá-los, inclusive quanto a produtos de cuidado pessoal e de uso doméstico que podem contê-los.
3. **Políticas e regulações** — implementar políticas que limitem a exposição e regulamentar produtos químicos em alimentos, água e produtos de consumo.
4. **Cuidados de saúde preventivos** — reduzir a exposição já nas consultas de rotina, especialmente em **populações vulneráveis: gestantes e crianças**.

## ⚠️ Pegadinhas de prova

- **O mecanismo não é único.** A afirmação correta é que os disruptores **mimetizam, bloqueiam ou alteram o metabolismo dos hormônios naturais**, com disfunção nos sistemas **reprodutivo, neurológico e metabólico**. ⚠️ É falso dizer que agem **exclusivamente como agonistas**, que a exposição é **sempre aguda e sem consequência de longo prazo**, ou que os efeitos se **limitam ao sistema reprodutor**.
- **A associação com diabetes e obesidade existe.** A alternativa incorreta de uma das questões é justamente a que admite ligação com doenças tireoidianas e alguns cânceres, mas **nega associação com diabetes mellitus e obesidade** — o eixo metabólico é um bloco inteiro desta aula.
- **A ação vai além do receptor.** Os DE também **alteram a expressão de enzimas envolvidas na síntese ou no catabolismo dos esteroides**, além de se ligarem a receptores hormonais e a fatores de transcrição.
- **Bisfenol A, pesticidas, dioxinas, ftalatos e fitoestrógenos interagem com o sistema reprodutivo feminino E masculino** — a alternativa que restringe o efeito a um dos sexos, ou a um único sistema, é falsa.
- **Guarde o par por substância:** bisfenol A com **prolactina alta, obesidade, DM2, SOP e puberdade precoce**; ftalatos com **criptorquidia e hipospádia**; cádmio com **câncer de próstata e testículo**; chumbo com **disfunção tireoidiana**; mercúrio com **teratogenicidade e abortamento**.`;

const pts = [
 'Disruptores endócrinos são substâncias, naturais ou sintéticas, que interferem na função hormonal normal.',
 'As fontes que a aula agrupa são plásticos (bisfenol A), cosméticos (parabenos), pesticidas (percloratos) e metais pesados (mercúrio).',
 'Agem como agonistas ou antagonistas de receptores: o bisfenol A é agonista do receptor estrogênico e os ftalatos são antagonistas do receptor androgênico.',
 'São lipofílicos, acumulam-se no tecido adiposo, têm efeito cumulativo e atravessam a barreira placentária.',
 'No eixo metabólico alteram a expressão de genes da adipogênese (PPARγ) e a diferenciação de pré-adipócitos em adipócitos maduros.',
 'Ainda no eixo metabólico, causam resistência à leptina, alteração da microbiota intestinal e resistência insulínica.',
 'No eixo tireoidiano alteram a TPO e o NIS, com aumento do TSH; no adrenal, alteram o ciclo circadiano do cortisol.',
 'No eixo gonadal, a ligação ao receptor estrogênico causa puberdade precoce em meninas, reduz a ação dos contraceptivos orais e altera a secreção de LH, levando a SOP.',
 'Desde 2009 a ANVISA limita ftalatos e derivados a menos de 1% em peso em copos e garrafas plásticas descartáveis.',
 'Após a proibição do bisfenol A, a indústria criou os bisfenóis F e S supondo que não seriam nocivos, o que não se comprovou.'
];

const flashcards = [
 { q: 'Qual é o mecanismo de ação dos disruptores endócrinos?',
   a: 'Podem mimetizar, bloquear ou alterar o metabolismo dos hormônios naturais, agindo como agonistas ou antagonistas de receptores e interferindo na transdução do sinal hormonal — com disfunção nos sistemas reprodutivo, neurológico e metabólico. Também alteram a expressão de enzimas da síntese e do catabolismo dos esteroides.' },
 { q: 'Que propriedades farmacocinéticas tornam a exposição a disruptores endócrinos particularmente preocupante?',
   a: 'São frequentemente lipofílicos e acumulam-se no tecido adiposo, têm efeito cumulativo no organismo e atravessam a barreira placentária.' },
 { q: 'Como os disruptores endócrinos agem no eixo metabólico?',
   a: 'Alteram a expressão de genes da adipogênese (PPARγ) e a diferenciação de pré-adipócitos em adipócitos maduros; causam resistência à leptina e alteração da microbiota intestinal na sinalização de fome e saciedade; e produzem resistência insulínica.' },
 { q: 'O que os disruptores endócrinos fazem em cada eixo hipotálamo-hipófise?',
   a: 'Tireoide: alteram a TPO e o NIS, com aumento do TSH. Adrenal: alteram o ciclo circadiano do cortisol. Gônadas: ligam-se ao receptor estrogênico e causam puberdade precoce em meninas, reduzem a ação dos contraceptivos orais e alteram a secreção de LH, levando a SOP.' },
 { q: 'Quais alterações a aula atribui ao bisfenol A e quais aos ftalatos?',
   a: 'Bisfenol A, presente em recipientes de alimentos: aumento de prolactina, obesidade, DM2, SOP e puberdade precoce em meninas. Ftalatos, presentes em esmaltes de unhas e vernizes: câncer de mama, criptorquidia e hipospádia.' }
];

const mapa = { nodes: [
 { label: 'Fontes', children: ['Plásticos: bisfenol A', 'Cosméticos: parabenos', 'Pesticidas: percloratos', 'Metais pesados: mercúrio'] },
 { label: 'Propriedades', children: ['Naturais ou sintéticos', 'Agonistas e antagonistas', 'Lipofílicos, no tecido adiposo', 'Efeito cumulativo', 'Atravessam a placenta'] },
 { label: 'Eixo metabólico', children: ['PPARγ e adipogênese', 'Resistência à leptina', 'Microbiota intestinal', 'Resistência insulínica'] },
 { label: 'Eixos hipofisários', children: ['Tireoide: TPO, NIS, ↑TSH', 'Adrenal: circadiano do cortisol', 'Gônadas: puberdade precoce', 'Gônadas: ↓ ação do ACO e SOP'] },
 { label: 'Substâncias-chave', children: ['DDT: espermatogênese, criptorquidia', 'Cádmio: câncer de próstata/testículo', 'Chumbo: disfunção tireoidiana', 'Mercúrio: teratogênico, abortamento'] },
 { label: 'Prevenção', children: ['Evitar plástico e enlatados', 'Educar o paciente', 'Regulação (ANVISA 2009)', 'Gestantes e crianças'] }
]};

const fluxogramas = [];

const item = {
  ano: '2026',
  pts,
  sub: 'Endocrinologia Básica',
  url: '',
  mapa,
  tema: 'Disruptores Endócrinos: Bisfenol A, Ftalatos e Metais Pesados',
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (4 - Disruptores)',
  resumo,
  titulo: '',
  flashcards,
  fluxogramas
};

if (require.main === module) {
  if (process.argv[2] === '--json') { process.stdout.write(JSON.stringify(item)); }
  else console.error('resumo: %d chars · pts: %d · flashcards: %d · mapa: %d · flux: %d · 📊: %d',
    resumo.length, pts.length, flashcards.length, mapa.nodes.length, fluxogramas.length,
    (resumo.match(/^## 📊/gm) || []).length);
}
module.exports = item;
