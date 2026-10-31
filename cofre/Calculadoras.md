---
tags: [cofre, calculadoras]
atualizado: 2026-10-31
---

# Calculadoras

## 🫀 RISCO CV E METAS: COMO A FÓRMULA ORIGINAL, COM O RISCO EM 10 ANOS EM DESTAQUE (2026-10-31)

O professor comparou a calculadora com a da Clarity (dois prints: o nosso campo "LDL-c sem
tratamento, se souber" marcado e o formulário dela) e escreveu: *"Não existe na formula origina;
não precisa dos triglicerídeos; faltando transaminases e plaquetas na formula; uso de estatina não
estratifica a intensidade; retirar Intolerância à estatina, Ácido bempedoico, Anti-PCSK9 (anticorpo
ou inclisirana) e Ezetimiba"*. Depois, com o print do resultado dela: *"mostrar o risco como o da
figura em 10 anos"*.

**O que mudou no formulário:**
- **Saíram:** o LDL-c sem tratamento, os triglicérides (e com eles a estimativa de Martin/Hopkins
  dentro desta calculadora; a calculadora "LDL (Martin/Hopkins)" continua), a ezetimiba, o ácido
  bempedoico, o anti-PCSK9 e a intolerância. O LDL-c é o do laudo.
- **Estatina:** só "Usa estatina: Sim / Não". Entra no PREVENT (`pv_est`) e no motor como
  tratamento (`trat.estatina 'sim'`).
- **Entraram TGO, TGP e plaquetas** (seção 2, "Fígado"), para o **FIB-4**, com a conta e a faixa
  embaixo das plaquetas. `fib4Calc`/`fib4Faixa` são a conta e as faixas da calculadora FIB-4, que
  passou a usar as mesmas funções (< 1,30, ou < 2,0 acima de 65 anos; até 2,67; acima).

**Como o FIB-4 pesa:** a T4.3 da SBC 2025 traz a "esteatose hepática, especialmente formas mais
graves (por exemplo, com fibrose) ou associada a fatores cardiometabólicos"; a diretriz não cita o
FIB-4. Então o FIB-4 **qualifica** a esteatose marcada (aparece no motivo: "esteatose hepática
(MASLD), FIB-4 de 2,10: fibrose indeterminada"), aparece na pendência quando a esteatose está em
aberto, e **nunca é agravante sozinho**. Com a esteatose marcada "Não" e FIB-4 acima de 2,67, a tela
avisa que não é agravante e manda investigar a hepatopatia. TGO ou TGP acima de 120 U/L (3× o limite
usual, "confira o do laboratório") dá o aviso da rec. §9.12: estatina admitida na esteatose com
enzimas até 3× o limite; contraindicada na doença hepática ativa ou descompensada.

**O destaque (`rcvDestaqueHTML`), como a figura:** título "Risco conforme a Diretriz Brasileira de
Dislipidemias e Prevenção da Aterosclerose 2025 (SBC)", selo da categoria ("Risco alto"), o risco em
10 anos em número grande na cor da categoria e "Risco em 10 anos · doença cardiovascular total
(PREVENT)". ⚠️ **O número grande é a DCV total, como na figura (25,3% = a linha "Doença Cardiovascular
Total"), mas a SBC categoriza pela DASCV** (§4.2; rec. forte/alta). Por isso a linha de baixo traz a
DASCV com o aviso "é a DASCV que a SBC usa para categorizar pelo escore". Sem PREVENT (doença
aterosclerótica, < 30 ou ≥ 80 anos, dado faltando), no lugar do número vai o porquê (`rcvSemEscore`).
A tabela do PREVENT virou "Resultado detalhado do cálculo de risco", com "Modelo usado: PREVENT +
HbA1c", os nomes por extenso e duas casas decimais.

**Estratégias (Figura 7.2):** sem estatina, como antes (redução total; a menor estratégia com
estatina que alcança o alvo sem ficar abaixo da terapia inicial). **Em estatina de intensidade
desconhecida**, nenhuma linha da figura é dada como suficiente (ela mede a redução a partir do
LDL-c sem tratamento), e o caminho vem das reduções adicionais do texto (`ldlEsquemaPelaReducao`, o
mesmo do bloco do PREVENT, que também só pergunta "usa estatina"). Saíram `rcvRegime` (esquema por
intensidade) e `rcvLdlEstimadoTxt`. O motor (`sbcEstratifica`) ainda aceita LDL-c basal e as
intensidades, mas nenhum formulário os envia; os alertas de TG saíram.

**Adiposidade visceral (31/10, depois):** o professor, com print da seção 6: *"No título troca
para "adiposidade visceral" e no subtítulo para "circunferência abdominal" > 80 cm mulheres e > 94
cm em homens"*. Feito no formulário e no motivo. Esses cortes não estão na SBC 2025, que define
adiposidade por IMC elevado com um parâmetro antropométrico elevado (§4.3.2); são decisão do
professor (os da IDF para a população europeia, que ela escreve como ≥). `sw.js` v330.

**Conferência:** `test-risco-cv-sbc.js` (seção 8 nova: formulário, FIB-4, motor, destaque, ordem
da tela, impressão e mutações do destaque e do FIB-4; os testes de esquema por intensidade viraram
testes de "usa estatina"), `test-ldl-martin-hopkins.js` (a de risco CV só com o LDL-c do laudo),
ci-validate e A/B no Chromium contra a versão no ar (computador e celular, sem erro de JS, sem
rolagem lateral). `sw.js` v328→v329. ⚠️ O `test-risco-cv-sbc.js` proíbe o nome da Clarity no
`index.html` (marca de terceiros): nos comentários do código ela é "a fórmula original".

## 🧪 LDL-c POR MARTIN/HOPKINS: A CALCULADORA "LDL" DEIXA O FRIEDEWALD (2026-10-24)

Pergunta ao professor, depois da calculadora de risco CV: *"A calculadora 'LDL (Friedewald)'
continua no app, mas a SBC 2025 recomenda a fórmula de Martin/Hopkins. Mantenho, troco ou
retiro?"* Resposta: citou "SBC 2025 recomenda a fórmula de Martin/Hopkins" e escreveu *"mantenha
essa"*. A diretriz: *"Recomenda-se a favor do uso da equação de Martin/Hopkins para cálculo de LDL-c
para todos os indivíduos"* (FORTE/MODERADA) e, *"quando os valores de triglicérides estão acima de
800 mg/dL"*, o LDL-c pode estar subestimado e se avalia o não-HDL-c. `sw.js` v322 → **v323**.

**A conta: `ldlMartinHopkins(ct, hdl, tg)`.** LDL-c = CT − HDL-c − TG ÷ fator. O fator vem da tabela
de 180 células de Martin et al. (JAMA 2013): `MARTIN_TG` tem as 30 faixas de TG, `MARTIN_NHDL` os
5 cortes de não-HDL-c e `MARTIN_FATOR` os fatores. Cada faixa começa no seu piso (TG 50 já é 50–56;
não-HDL-c 100 já é 100–129), como no EBMcalc. O pacote LDLcalc do CRAN erra nisso: tem a tabela
certa, mas a busca põe o piso na faixa de baixo. Entrada inválida (vazio, texto, ≤ 0, HDL-c ≥ CT)
dá NaN. TG fora da tabela (< 7 ou > 13.975) usa a linha da ponta e vem marcado. É a tabela
**original**, não a "estendida" de Sajja 2021: a diretriz cita a original.

**A tabela não foi digitada de memória.** O agente a tirou do LDLcalc 2.1 e a conferiu por
programa. Eu repeti a conferência à parte, lendo cada fonte só como dado:
- 5 fontes batem nas 180 células e nas faixas: o EBMcalc v23.1, que é a calculadora dos MSD
  Manuals (a matriz e a tabela da página), consensuslab, outlabs, rodrigovoigt e pkarinaas;
- a do app Kotlin é a tabela estendida e bate nas 29 linhas abaixo de 400.

A figura do artigo não abriu (o proxy barra o PMC e a JAMA). O texto publicado confirma a
última linha (11,9 / 10,0 / 8,8 / 8,1 / 7,5 / 6,7), a primeira célula (3,5) e a faixa de 3,1 a 11,9
que a diretriz dá. Uma célula fura o padrão em todas as fontes: TG 97–100 com não-HDL-c ≥ 220 é
4,3, abaixo do 4,4 da faixa anterior.

**Limite de TG: acima de 800, como na diretriz** ("acima de 800"; ">800" no texto em inglês). O
agente tinha posto "≥ 800" atribuindo o pedido ao professor. A origem era o meu briefing ("≥ 800, ou
acima do limite que a fonte define"), e o professor nunca falou disso. Voltou para > 800 no
código, nos textos e nos testes; o 800 em si fica sem aviso.

**Na calculadora "LDL (Martin/Hopkins)"** (o `id` continua `'ldl'`, por causa de favoritos e testes):
- o número sai inteiro, como num laudo;
- a etiqueta curta mostra o fator e o não-HDL-c (até ~40 caracteres, porque a `.tag` não quebra
  linha e a 360 px corta);
- embaixo vem a conta à vista: a fórmula com os números, a célula da tabela e o não-HDL-c, que é
  meta coprimária;
- com LDL-c ≥ 160, vem o corte da SBC 2025 que não depende da categoria (§4.1);
- com TG > 800, o valor sai com o aviso por extenso; estimativa ≤ 0 mostra "sem valor, avalie o
  não-HDL-c";
- as faixas "ótimo/desejável" da tela antiga saíram, porque na SBC 2025 a meta depende da
  categoria de risco.

**Na "Risco CV e metas — SBC 2025"**, o LDL-c do laudo vale. Sem ele, com CT, HDL-c e TG, a tela
usa o estimado por Martin/Hopkins:
- arredondado ao inteiro, o número que a tela mostra é o mesmo que entra nos cortes de 160 e 190
  e na meta;
- a tela marca o valor como estimado: embaixo do campo, no motivo da categoria, na linha de
  metas e no relatório impresso;
- com TG > 800 ou estimativa ≤ 0, não estima, e o texto manda acompanhar pelo não-HDL-c.

**Conferência:**
- `scripts/test-ldl-martin-hopkins.js`, ligado ao ci-validate, cobre:
  - as 180 células, as faixas e o desenho da tabela;
  - o exemplo publicado (PMC8101115: TG 1986, CT 299, HDL-c 21 → −18,418 mg/dL, fator 6,7) e
    contas à mão;
  - as fronteiras, o TG 800 × 801, a entrada inválida, a tela e a estimativa na de risco CV;
  - as mutações.
- O ci-validate completo e o harness A/B no Chromium passaram (mesmos números da `main`, nenhum
  pageerror).
- As duas calculadoras foram abertas no Chromium a 1280, 390 e 360 px (sem rolagem horizontal).

## 🫀 RISCO CV E METAS — SBC 2025: CALCULADORA NOVA E UM MOTOR SÓ DE CATEGORIAS (2026-10-24)

Pedido do professor em 22/10, com prints da Clarity Prevention: *"Será que conseguiríamos
importar essa calculadora para a nossa plataforma? Seria uma tarefa agendada para sábado 8h"*.
Feita a partir da **Diretriz Brasileira de Dislipidemias 2025 (SBC)**; da Clarity só se usou a
lista do que ela pergunta (cofre/Pendências.md, seção da calculadora). Nada de código, texto,
desenho ou marca dela.

**Onde está:** item `riscocv` de `CALCS`, antes do `prevent` (a ordem de `CALCS` define a ordem das
áreas). É a primeira calculadora de **tela própria**: `openCalc` ganhou o caminho `c.render(root)`
(monta o cabeçalho e o "← Voltar" e entrega o contêiner), e `calcUpdate` ignora quem tem `render`.
Funções `rcv*` (formulário em 6 seções, resultado ao lado a partir de 1100 px, folha impressa).

**O motor: `sbcEstratifica(d)`** devolve `{k, motivo, fonte, outros, pendencias:[{sobe,t}], alertas}`.
A categoria final é o **máximo** das regras que disparam (F5.1: "um dos seguintes critérios");
dado ausente **nunca rebaixa**, vira pendência ("pode subir para…"). Regras conferidas no texto
da diretriz (T4.1–T4.8, T5.1, §4.8, §4.9 e a recomendação da diálise): extremo (T4.2: ≥ 2 eventos
maiores, ou 1 + ≥ 2 condições, entre elas evento agudo < 2 anos; SCA < 12 meses já preenche
essa condição), muito alto (doença aterosclerótica clínica, obstrução ≥ 50%, CAC > 300, HF com
CAC > 100, DM com EMAR ou ≥ 3 EAR, incluindo CT > 310 ou LDL-c > 190), alto (PREVENT ≥ 20%,
intermediário + agravante, placa < 50%, CAC > 100 ou p > 75, AAA, LDL-c ≥ 190, Lp(a) > 180 mg/dL
ou > 390 nmol/L, DM2 ≥ 50 H / ≥ 56 M, DM com 1–2 EAR, ≥ 80 anos), intermediário e baixo. O
PREVENT só categoriza de 30 a 79 anos e sem DM (o DM tem estratificação própria, T4.5–T4.8). A
**calculadora PREVENT antiga usa o mesmo motor** (`sbcDadosDoPrevent` → `sbcCategoria`), e o que o
formulário dela não pergunta entra como "não sei" (vira pendência na tela).

**Metas (`sbcAlvoLDL`):** alvo de LDL-c **e** redução mínima juntos (T5.1/F5.1), meta estrita;
gatilho dos 30 mg/dL só no baixo/intermediário, pelo LDL-c **ou** pelo não-HDL-c; do alto para cima
trata-se sempre, e o não-HDL-c acima da meta pede intensificação mesmo com o LDL-c no alvo
(§5.1, §5.5). Estratégias pela Figura 7.2 (`RCV_ESTRATEGIAS`), sempre contendo o esquema atual; com
esquema fora da figura e sem LDL-c basal, nenhuma é marcada como suficiente. LDL-c é o do laudo;
sem ele, desde 24/10, o estimado por Martin/Hopkins (seção acima). O LDL-c sob tratamento é piso
do basal.

**Cartões:** PA < 130/80 para todo hipertenso (Diretriz Brasileira de Hipertensão Arterial 2025,
FORTE/ALTA; exceções: idoso frágil/≥ 80, diálise, AVC agudo); HbA1c < 7% para a maioria,
individualizada (capítulos de DM2 e metas glicêmicas); IMC pela OMS; tabagismo.

**PREVENT: DAC e AVC + a errata de 14/10/2026.** Coeficientes de doença coronariana e AVC (10 e 30
anos, todos os modelos) do pacote R `bcjaeger/PooledCohort` (`data-raw/coefs_prevent.xlsx`, Tabelas
S12A–J do suplemento), validados contra a Tabela S12 e o `preventr` 0.12.1. A **errata** (Circulation,
14/10/2026, DOI 10.1161/CIR.0000000000001491; FAQ da AHA de 14/10) troca de lugar os dois coeficientes
de HbA1c ("com DM" × "sem DM") nos modelos +HbA1c e completo; aplicada a todos os desfechos. O texto
da errata não abriu (proxy); os números vêm do `preventr` 0.12.1, conferidos nos 2.140 coeficientes.
Muda só o resultado de quem preenche HbA1c (diferença de até ~7 p.p. com HbA1c ≤ 10).

**Conferência:** `scripts/test-risco-cv-sbc.js` (724 asserções: casos-ouro de cada regra, valores do
PREVENT com tolerância de 0,05 p.p., varreduras "não sei não derruba" com sexo, LDL-c basal e SCA
recente, mutações), ci-validate, harness A/B no Chromium e uma **revisão independente**, que achou
dois erros graves antes do ar: sexo em branco rebaixava o DM2 de 60 anos para intermediário, e
esquema fora da Figura 7.2 (EMI + anti-PCSK9) era lido como "sem tratamento", sugerindo desescalonar.

⚠️ **Lições:** (1) o escore dá o piso, não a categoria; (2) campo vazio tem de ser testado campo a
campo (o sexo escapou da primeira varredura); (3) os desfechos do PREVENT não têm hierarquia garantida
(AVC passa da DASCV em extremos, IC passa da DCV total em obesas com TFGe baixa): só mostrar, nunca
subtrair um do outro.

**Ficou de fora:** FIB-4 (a diretriz não usa); a frase da Lp(a) nas perguntas e respostas (a SBC 2025
recomenda Lp(a) uma vez na vida para todos); o texto da base da IA que ainda diz "moderado 5–20%"
(diretriz de obesidade, ~l. 7684). A calculadora "LDL (Friedewald)" virou "LDL (Martin/Hopkins)"
em 24/10, por decisão do professor (seção acima).

## 🧮 A GRADE DAS CALCULADORAS: COLUNAS PELA LARGURA, CARTÃO COM UNIDADE E BUSCA (2026-10-15, #850)

Pedido do professor, olhando a tela: *"Melhora o layout pra deixar mais bonito e
organizado"*. A tela tinha os 23 cartões em **3 colunas fixas por área**
(`repeat(3,1fr)`, sobrando espaço em tela larga e espremendo no notebook), cartão
só com nome e descrição, sem nada que dissesse o que a calculadora devolve, e nenhum
jeito de achar uma calculadora pelo nome além de rolar a página.

**O que entrou** (`index.html`: CSS perto da linha 236, JS logo antes de `renderCalcGrid`):

- **Colunas pela largura.** Sub-grade de cada área com
  `repeat(auto-fill,minmax(248px,1fr))`: 5 colunas a 1600px, 3 no notebook, 1 no
  celular. A regra de colapso (`.g2,.g3,.g4,.calc-area-grid{grid-template-columns:1fr}`
  a ≤ 820px) ficou como estava.
- **Cartão em três partes** (`calcCardHTML(c,meta)`): `.calc-card-nm` (nome),
  `.calc-card-ds` (descrição, até 3 linhas por `line-clamp`) e `.calc-card-ft`
  (rodapé com `margin-top:auto`): a **unidade do resultado** (`c.unit`, com
  `title="Resultado em …"`), ou **"Ferramenta oficial ↗"** para a externa
  (`c.external`), e o convite **"Abrir →"**. 21 dos 23 cartões têm unidade ou a
  marca de externa; os dois sem unidade ficam só com "Abrir". `align-items:stretch`
  deixa os cartões da mesma linha com a mesma altura. A cor da subespecialidade
  continua vindo de `muralSubMeta(a)` (`meta.card` → `mural-card-*`), e a borda com
  fallback neutro (`.calc-card{border-left:3px solid var(--bd2)}`) ficou intacta.
- **Régua ao lado do título do grupo** (`.calc-area-tit::after`, `flex:1 1 auto`).
- **Busca por nome.** `.calc-pills-wrap` virou linha flex (abas + campo
  `#calc-busca`). `calcNormaliza` tira acento (`NFD` + remoção dos diacríticos) e
  caixa; o cartão carrega `data-busca` com nome + descrição + área já normalizados.
  `calcAplicarBusca(el)` só liga/desliga a classe `.calc-oculto` (`display:none
  !important`) em cartão, sub-grade e título do grupo, **sem redesenhar a grade** (o
  campo não perde o foco a cada tecla); `calcBusca` guarda o texto em memória, e o
  campo nasce com `value=` dele, então trocar de aba (que redesenha) não apaga a
  busca. `.calc-vazio` aparece quando nenhum cartão bate.
- **Teclado.** Cartão com `role="button" tabindex="0"`; Enter e espaço chamam
  `openCalc`; `:focus-visible` com anel azul; `prefers-reduced-motion` desliga a
  animação do hover.
- **Celular** (≤ 820px): cartão sem altura mínima (uma coluna não precisa de
  alinhamento) e `.calc-pills .pill-tab{white-space:nowrap}`: a aba não quebra o
  número para a linha de baixo, a faixa rola na horizontal.

**⚠️ Especificidade: `.calc-busca input` perdia para a regra global de inputs.** A
regra `input:not([type]),input[type=text],input[type=search],…{padding:.44rem .72rem;
border-radius:var(--rs)}` (perto da linha 337) tem a **mesma especificidade** (0,1,1)
de `.calc-busca input` e vem depois, então ganhava o padding e o raio: a lupa ficava
em cima do "B" de "Buscar". Nenhum teste de texto pegaria isso; apareceu na captura
do harness. O seletor passou a `.calc-busca input[type=search]` (0,2,1). **Regra
geral:** campo de formulário com estilo próprio neste projeto precisa vencer a
regra global com `[type=…]` ou mais uma classe, e a captura em Chromium é a prova.

**O teste antigo prende o texto exato das regras.** `test-painel-professor.js`
exige `.calc-pills-wrap{grid-column:1/-1;min-width:0}` e
`.calc-pills{margin:0 0 .35rem;max-width:100%}` (a lição do iPhone, abaixo). As
declarações novas (flex) entraram em **regras separadas**, logo depois, em vez de
mexer no teste que guarda a lição.

**Prova:** `scripts/test-calc-grade.js` (17c-undecies-g no `ci-validate`) e o
cenário 3 de `scratchpad/calc-navegador/check.js`, rodado nos dois lados em
Chromium (`LADO=antes` com o `index.html` da `main`): 1600px → 3 colunas antes, 5
depois; "LDL" deixa só o cartão `ldl` e esconde 7 dos 8 grupos; "xyzxyz" mostra o
aviso; limpar devolve os 23; Enter abre a calculadora (`#calc-close` aparece);
392px → 1 coluna, sem rolagem horizontal, busca visível; sem `pageerror`. A
medida de colunas no harness é `getComputedStyle(grade).gridTemplateColumns`
(lista de faixas em px numa grade visível), e não "cartões com o mesmo
`offsetTop`": o primeiro grupo tem 3 cartões e dava 3 mesmo com 5 colunas.

## 💊 CONDUTA TERAPÊUTICA NO PREVENT: ESQUEMA, DOSES E O QUE FALTA REDUZIR (2026-10-14)

Pedido do professor, olhando a tela: *"insira também a conduta terapêutica (dose de
estatina, ezetimiba, etc)"*. Fonte: a **Diretriz Brasileira de Dislipidemias 2025**
(texto integral no PMC, `PMC12674852`, CC BY), lida nas tabelas de recomendações
"farmacológicas" e "uso combinado de estatina, ezetimiba, ácido bempedoico e terapias
anti-PCSK9" e no capítulo de tratamento:

- **Esquema inicial por categoria** (todas FORTE/ALTA): alto risco = estatina de alta
  intensidade **+ ezetimiba desde o início**; muito alto = os dois e anti-PCSK9
  "potencialmente"; extremo = os três de saída; LDL-c ≥ 190 (HF) = alta intensidade +
  ezetimiba; quem não atinge a meta com estatina + ezetimiba = anti-PCSK9 ou ácido
  bempedoico; inclisirana é alternativa aos anticorpos; intolerância = ácido bempedoico
  + ezetimiba, ou anti-PCSK9 com ou sem ezetimiba.
- **Intensidade por redução**: alta = reduz o LDL-c em ≥ 50%; moderada = 30 a 50%.
- **Reduções esperadas**: alta intensidade ≈ 50%; + ezetimiba até 65%; + anti-PCSK9
  > 85%; ezetimiba isolada ≈ 24% (IMPROVE-IT); anticorpos anti-PCSK9 55–60% e
  inclisirana 50–55% em quem já usa estatina; ácido bempedoico 180 mg/dia, ≈ 17% e
  ≈ 38% com ezetimiba.
- ⚠️ **A diretriz não traz tabela de doses por intensidade** nem posologia dos
  anti-PCSK9. As doses (atorvastatina 40–80 / rosuvastatina 20–40 como alta;
  atorvastatina 10–20, rosuvastatina 5–10, sinvastatina 20–40, pravastatina 40–80,
  pitavastatina 2–4, lovastatina 40, fluvastatina 80 como moderada) e a posologia
  (evolocumabe 140 mg SC/2 sem ou 420 mg/mês; alirocumabe 75–150 mg SC/2 sem;
  inclisirana 284 mg SC no início, aos 3 meses e depois a cada 6 meses) vêm das
  sínteses do acervo (Hipercolesterolemias Secundárias e Primárias), que batem com o
  que a diretriz cita de dose (atorvastatina 80 e rosuvastatina 40 como doses altas;
  10–20 mg das duas como moderada; 5 mg de rosuvastatina e 10 de atorvastatina como
  as menores). O prazo de reavaliação (4 a 6 semanas) é o que a diretriz usa na SCA e
  na abordagem da ESC que ela descreve.

**O que entrou na tela** (`ldlCondutaHTML`, `ldlEsquemaPelaReducao`, `LDL_DOSES`):
1. O quadro das metas ganhou a coluna **TERAPIA INICIAL** (sete colunas; `min-width`
   subiu para 70rem e o quadro rola no celular).
2. Bloco **Conduta terapêutica · SBC 2025**: o esquema da categoria do paciente; e,
   com o LDL-c informado, **a redução que falta** até a meta (`(LDL − meta)/LDL`) e o
   esquema compatível pelas reduções médias: < 30% moderada; 30–50% alta (ou moderada
   + ezetimiba); 50–65% alta + ezetimiba; ≥ 65% + anti-PCSK9. **Em uso de estatina**
   (campo do formulário), o LDL-c já é sob tratamento e o que falta se obtém SOMANDO
   fármaco: ≤ 24% ezetimiba; ≤ 55% anti-PCSK9; acima, os dois. No alto risco sem
   tratamento, distância pequena não dispensa a combinação inicial (a tela diz isso).
   No baixo e no intermediário, a menos de 30 mg/dL da meta não há fármaco.
3. Tabela de doses com os seis grupos, a linha da intolerância e o prazo de
   reavaliação. Vocabulário da diretriz: **intensidade**, não "potência".

Testes: `scripts/test-conduta-lipidica.js` (no CI; 10 de 10 mutações pegas na conduta),
`test-meta-ldl-prevent.js` ajustado (conta as linhas só do quadro; vocabulário). A/B em
Chromium (`scratchpad/calc-navegador/check.js`): formulário do print do professor
(mulher de 62 anos com diabetes, em uso de estatina, LDL-c 150) → categoria ALTO, bloco
de conduta, "≥ 54% além do que a estatina atual já faz → anti-PCSK9", tabela de doses;
no celular, quadro e tabela rolam na horizontal sem a página rolar. sw v296→v297.

## 🎯 PREVENT entrega META DE LDL-c e CONDUTA (SBC 2025) — 2026-08-27

A Diretriz Brasileira de Dislipidemias 2025 elege o PREVENT como ferramenta
**preferencial** de estratificação (30–79 anos, sem doença aterosclerótica
conhecida), então a meta mora na tela do escore.

⚠️ **O escore dá o PISO da categoria, não a categoria.** Diabetes (corte 50 anos
no homem, 56 na mulher), LDL-c (160–189 → intermediário; ≥ 190 → alto) e
agravantes/aterosclerose subclínica **sobem** de faixa; nada desce. Escore de 2%
com LDL-c 195 é ALTO. O que o escore não vê fica escrito na tela.

| faixa | LDL-c | não-HDL-c | ApoB | redução |
|---|---:|---:|---:|---:|
| baixo | < 115 | < 145 | < 100 | ≥ 30% |
| intermediário | < 100 | < 130 | < 90 | ≥ 30% |
| alto | < 70 | < 100 | < 70 | ≥ 50% |
| muito alto | < 50 | < 80 | < 55 | ≥ 50% |
| extremo | < 40 | < 70 | < 45 | ≥ 50% |

- **Gatilho farmacológico só no baixo e no intermediário**: ali não se medica por
  estar acima da meta, e sim por persistir **≥ 30 mg/dL acima**. No alto se
  medica desde o diagnóstico — exibir o gatilho ali foi defeito real, achado
  olhando a tela renderizada.
- **Muito alto e extremo não saem do escore** (são clínicos), e o **PREVENT de 30
  anos não deriva meta**: a diretriz não define limiares para aquela estimativa.
- O campo **LDL-c é opcional e inerte para o escore** (o PREVENT usa CT e HDL).
- ⚠️ Números vêm da **tabela** de valores referenciais. No PDF de duas colunas os
  bullets ao fim da seção do muito alto risco saem com os valores do extremo.
- ⚠️ No baixo risco **SBC (< 115) e SBD (< 100) divergem** — citar a fonte junto
  do número. A tela diz isso.

### 📊 O QUADRO INTEIRO, EM LARGURA CHEIA (2026-08-28)

Pedido do professor: *"deixa o quadro das metas ocupando toda a tela e bem
didático"*. As quatro fichas do paciente viraram a **escada completa das cinco
categorias** — LDL-c, não-HDL-c, redução, ApoB e uma coluna **QUANDO SE APLICA**
com a definição da própria diretriz. Mostrar só a meta de quem está na tela
responde ao caso; mostrar a escada **ensina**: dá para ver onde o paciente caiu,
o que teria mudado a meta, e para onde ele anda se piorar.

- A linha do paciente é marcada por **fundo e etiqueta**, não só por cor — cor
  sozinha some ao imprimir, para quem enxerga mal, e no meio das outras tarjas.
- **Muito alto e extremo levam ⓘ** na própria linha: são clínicos, fora do
  alcance do escore. A marca substitui um parágrafo de rodapé.
- O quadro **rola** no celular (`overflow-x:auto` + `min-width`): seis colunas não
  cabem em 360 px, e espremer quebraria os números, que são o conteúdo.
- ⚠️ `.adm-table-row` traz `min-height:58px` da casa, dimensionada para linha com
  botão. Sem soltar essa amarra, cinco linhas de texto ocupam meia tela em vão.
- **O quadro ocupa a tela; a prosa, não.** Conduta e ressalvas seguem com
  `max-width: 60rem` — tabela ganha com coluna larga, texto corrido não.
- A antiga lista de "sobe de faixa" **saiu do rodapé** e virou a coluna do
  quadro. Ficou só o que o quadro não diz: procurar agravante ativamente, o teto
  do escore e a divergência SBC × SBD no baixo risco.

🧨 **Um `style` por elemento.** A largura da linha do medido vinha num SEGUNDO
atributo `style` no mesmo `<div>` — o navegador **ignora o segundo em silêncio**,
então a medida de leitura não valia ali, e o teste passava numa marcação que não
fazia nada. Achado por mutação. Guarda no teste: nenhum elemento do bloco pode
ter dois `style`.

### 🧨 DUAS MEDIDAS COM O MESMO NOME DÃO DUAS RESPOSTAS (2026-08-28)

O professor olhou a tela e perguntou: **"risco alto ou moderado? ficou dúbio."**
E estava certo. A tarja dizia `DASCV moderado (12,5%)` e o bloco logo abaixo
dizia `RISCO ALTO`. As duas corretas, e sobre coisas diferentes:

| medida | o que é | responde |
|---|---|---|
| faixa do escore | % de DASCV em 10 anos (baixo <5, moderado 5–20, alto >20) | qual a probabilidade |
| categoria da SBC | estrato de risco da diretriz de dislipidemias | **qual a meta e o tratamento** |

Enquanto as duas se chamavam "risco", a tela dava **duas respostas para a mesma
pergunta** e deixava o médico escolher no chute. Conserto em três partes:

1. a tarja diz o que é — `DASCV 12,5% em 10 anos · faixa moderada do escore`;
2. o bloco nomeia a sua — `CATEGORIA SBC · ALTO`;
3. a tela diz **qual decide** — *"é ela que define a meta e a conduta"* — e
   reconcilia as duas: *"a faixa do escore é moderada; sobe por diabetes em
   mulher ≥ 56 anos"*.

Regra que fica: **dois números na mesma tela precisam de dois nomes e de uma
frase dizendo qual manda.** Explicar a diferença não basta se os dois continuam
se chamando a mesma coisa — foi o que eu tinha feito na rodada anterior, e não
resolveu.

⚠️ E concordância importa: a frase virou "faixa X do escore", então X concorda
com "faixa" (baixa/moderada/alta). "A faixa do escore é moderado" é frase
capenga em tela clínica, e frase capenga tira a autoridade do número ao lado.

### Layout: ressalva que não se aplica é ruído (2026-08-27, 2ª rodada)

O professor abriu a calculadora em tela cheia e pediu para melhorar o final. Dois
problemas, e o segundo não era de estética:

1. **Linha corrida de ponta a ponta** num monitor de 1.600 px — nenhum olho
   acompanha. O bloco ganhou `max-width: 52rem`, as metas viraram **fichas** (o
   número é o que se procura ali, e em linha corrida ele se perde na frase), o
   medido × meta virou linha alinhada com o delta, e a conduta ganhou barra
   lateral.
2. **O bloco explicava a uma paciente já de ALTO risco que "LDL 160–189 sobe
   para intermediário"** e mostrava a divergência SBC × SBD, que só existe no
   baixo risco. Ressalva constante ensina a pular o bloco inteiro — inclusive a
   que importa. Agora entra só o que vale para aquele paciente; o teto do escore
   (muito alto/extremo são clínicos) fica em **todas** as faixas, porque é ele
   que evita subtratar quem já tem doença.

⚠️ E quando a categoria da SBC fica **acima** da faixa do escore, a tela diz
`acima da faixa do escore (moderado) — por diabetes em mulher ≥ 56 anos`. Sem
isso a tarja dizia "moderado" e o bloco dizia "ALTO" logo abaixo, o que na tela
lê como defeito.


Painel **Calculadoras Clínicas**. Array `CALCS` em `index.html` (~linha 1707). Cada item:
```
{id, name, area, desc, fields:[{id,label,type:'num'|'select',opts,vals}], calc(v)->scalar, interp(s,v)->{t,c}, unit, note}
```
Renderização em `openCalc`/`calcUpdate`. Itens `external:true` apenas linkam para a ferramenta oficial (ex.: FRAX) — padrão de "não reproduzir cálculo proprietário".

## Calculadoras adicionadas (2026-06-10, #170)

### TmP/GFR (limiar renal de fosfato) — Osteometabolismo
- Fórmula de **Payne (1998)**. Calcula TRP = 1 − (P_urin × Cr_sérica)/(P_sérico × Cr_urin); se TRP ≤ 0,86 → TmP/GFR = TRP × P_sérico; senão → [0,3·TRP/(1−0,8·TRP)] × P_sérico.
- Ref. adulto ~2,5–4,2 mg/dL. Útil em hipofosfatemias por perda renal (XLH, TIO/FGF23, Fanconi, hiperPTH).
- Complementa a calculadora **TRP** que já existia.

### Escore-z de estatura/idade — Crescimento
- Método **LMS**: `z = ((x/M)^L − 1)/(L·S)` (ou `ln(x/M)/S` se L≈0). Percentil via CDF normal.
- Bases: **OMS** (WHO 2006 0–5a + WHO 2007 5–19a) e **CDC 2000** (2–20a), por sexo. OMS é o padrão (recomendado no Brasil).
- Dados em **`growth-lms.js`** (raiz do repo), gerado das fontes oficiais. Estrutura: `window.GROWTH_LMS.<cdc|who>.<M|F> = [[idadeMeses, L, M, S], ...]`. Helpers em `index.html`: `_gLMSrow` (interpolação linear), `growthZ`, `zToPct`, `fmtPct`.
- Classifica baixa estatura (z<−2 ≈ P3) e grave (z<−3).

## %PEP e %PPT pós-bariátrica (2026-07-29)
Pedido do Rodolpho a partir da calculadora de Fernanda Mattos. Entrada `id:'pep'` em `CALCS`, área **Antropometria**: peso no dia da cirurgia, altura, peso atual.

- **%PEP = (peso da cirurgia − peso atual) ÷ (peso da cirurgia − peso de IMC 25) × 100.** O denominador é o **excesso sobre o teto da eutrofia** — convenção da literatura bariátrica, e é por isso que o valor **passa de 100%** quando o IMC cai abaixo de 25. Não é bug; é a natureza da métrica.
- **⚠️ O denominador do %PEP é ESCOLHA, não medida.** Trocar IMC 25 por IMC 22 muda o resultado sem mudar o paciente. Por isso o teste confere valores **à mão** (120→96 kg em 1,70 m = 50,3%; chegar a 72,25 kg = exatamente 100%) e a sabotagem do denominador derruba 6 asserções.
- **%PPT sai junto**, na linha de interpretação, com IMC atual e o peso de IMC 25. Os dois juntos de propósito: o %PEP é o número que o operado acompanha, mas infla em quem operou com IMC mais baixo; o %PPT não tem esse arbítrio e é o que as sociedades passaram a preferir. Mostrar só um gera a conversa errada no consultório.
- **Quem operou já abaixo de IMC 25 não tem excesso de peso:** `calc` devolve `NaN` e a interpretação explica, oferecendo o %PPT. Sem essa guarda a divisão daria negativo ou infinito com cara de resultado.
- **Leitura:** <50% do excesso após 12–18 meses é o limiar clássico de resposta insuficiente — que pede investigação (adesão, complicação anatômica, medicação que favorece ganho de peso) antes de rotular o paciente.
- Valores esperados na `note`, com as fontes que a página original cita (Brolin 1989 → Zilberstein 2019).
- Teste `scripts/test-calc-pep.js`, passo 11 do CI. `sw` v155→v156.

## SOPHIA — trajetória de peso pós-bariátrica (2026-07-29)
Entrada `id:'sophia'`. O professor mandou o artigo **e o apêndice**, e isso mudou o que era possível: o apêndice (Appendix Figure 3) **publica as árvores CART** de M12, M24 e M60. Deixou de ser "modelo treinado inacessível" e passou a ser transcrição — legítima e verificável.

**Fonte:** Saux et al., Lancet Digit Health 2023;5:e692-702. Sete variáveis pré-operatórias por LASSO; uma árvore CART por tempo pós-operatório; %TWL na folha; peso previsto = peso pré × (1 − %TWL).

### As três árvores, e o que cada uma usa
- **M12** (Figura 3B, raiz n=948): 7 folhas. **É a única em que TABAGISMO entra** — e a favor: fumante perde mais no primeiro ano (0,36), efeito que o artigo descreve e que desaparece depois.
- **M24** (Figura 3C, raiz n=755): 7 folhas, de 0,16 (banda) a 0,38 (bypass, sem diabetes, <49 anos).
- **M60** (Figura 3D, raiz n=578): 8 folhas. **A única em que banda e sleeve caem no MESMO ramo**, e a única em que a **altura** entra (corte em 161 cm).

### ⚠️ Como a leitura das figuras foi validada — duas travas, e uma que valeu mais
1. **Os `n` das folhas somam o `n` da raiz** em cada figura: 948, 755 e 578. Estrutura lida errada não fecha essa conta. Foi o que autorizou escrever o código.
2. **A tabela de valores da ferramenta oficial.** O professor rodou dois pacientes (120 kg, 170 cm, 30 anos, não fumantes, bypass) e mandou os números **exatos**, não leitura de gráfico:

| | M12 | M24 | M60 |
|---|---|---|---|
| sem diabetes | 84 kg / 30% | 75 kg / 38% | 80 kg / 33% |
| DM2 de 5 anos | 84 kg / 30% | 87 kg / 27% | 91 kg / 24% |

As três árvores reproduzem os **seis** valores.

### ⚠️ Foi a medição que resolveu o nó ambíguo de M12 — e desmentiu o texto do artigo
No nó (bypass, <51 anos, não fumante, n=344) o corte é "duração do DM2 ≷ 19 anos", e a figura **não diz para onde vai quem NÃO tem diabetes**. As duas leituras davam 0,30 e 0,34 — **5 kg num paciente de 120 kg**.

Eu tinha um argumento forte para 0,34: os tamanhos dos grupos (n=215 no lado ">19 anos" só fecharia com os não diabéticos nele, roteados por variável substituta) **e a prosa do artigo**, que afirma que diabetes está *sempre* associado a menor perda. **Estava errado.** Os dois pacientes dão 30% em M12, então o não diabético (duração 0) cai no mesmo ramo do diabético de curta duração, e a folha de 0,34 é só de quem tem mais de 19 anos de doença. **Neste nó, a prosa do artigo não vale.**

Lição além deste caso: quando existe uma implementação de referência acessível, **duas consultas a ela valem mais que qualquer dedução a partir do texto** — inclusive a partir de argumentos que parecem fechar.

### Meses 1 e 3 passaram a ser projetados — por proporção (2026-07-30)
O professor pediu: *"Tanto na curva como na tabela, projeta esses outros meses também"*, com a tabela oficial à vista. **Reverte parcialmente a decisão registrada logo abaixo** — e o motivo dela continua verdadeiro: **as árvores de M1 e M3 não foram publicadas**. O que mudou foi o que se faz com essa limitação.

**O que NÃO fiz: fixar 9% e 16%.** São os valores da ferramenta oficial *naquele paciente*. Fixados, valeriam igual para banda e bypass — e numa banda com 13% de perda em 1 ano, o mês 3 empataria com o ano inteiro. Número fixo aqui produz absurdo aritmético, não só imprecisão.

**O que fiz: fração da perda de 12 meses**, que escala com a operação e preserva a ordem cronológica. As duas frações saem da tabela oficial, recuperadas pela **coluna do IMC** (dois algarismos a mais que a do %PPT inteiro), no caso de referência 120 kg / 1,70 m / 30 anos / não fumante / bypass:

| | IMC oficial | peso recuperado | %PPT | fração da perda de 1 ano |
|---|---|---|---|---|
| mês 1 | 37,9 | 109,5 kg | 8,72% | **0,291** |
| mês 3 | 34,7 | 100,3 kg | 16,43% | **0,549** |
| mês 12 | 29,1 | 84,1 kg | 29,92% | — |

Com elas, **as seis células dos meses 1 e 3 reproduzem a tabela oficial exatamente** (110/9/37,9/22 e 100/16/34,7/41). Somadas às seis de M12/M24/M60, são **10 valores oficiais conferidos**.

### ⚠️ As frações são POR OPERAÇÃO — e a medição da banda desmentiu a fração única (2026-07-30, mesmo dia)
Publiquei a versão acima com **uma fração só**, a do bypass, para as três operações, e registrei como limitação que a queda precoce do sleeve e da banda não tinha sido conferida. O professor rodou a banda na ferramenta oficial no mesmo dia. **A fração única não vale:**

| | mês 1 | mês 3 | mês 12 | fração m1 | fração m3 |
|---|---|---|---|---|---|
| bypass (IMC oficial) | 37,9 → 8,72% | 34,7 → 16,43% | 29,1 → 29,92% | **0,291** | **0,549** |
| banda (IMC oficial) | 39,4 → 5,11% | 38,2 → 8,00% | 36,0 → 13,30% | **0,384** | **0,602** |

A banda perde **uma fatia maior** da sua perda de 1 ano já no primeiro mês, embora perca muito menos em valor absoluto. Com a fração do bypass, o mês 1 da banda saía **1,5 kg errado**. Agora `FRACAO_PRECOCE` é uma tabela indexada pela operação.

### O sleeve fechou a lacuna — e a herança não tinha como funcionar (2026-07-30, terceira rodada)
O professor rodou o sleeve no mesmo dia. **As frações dele são 0,276 e 0,568** — e o formato explica por que herdar do bypass estava errado por construção, não por pouco:

| operação | fração mês 1 | fração mês 3 |
|---|---|---|
| bypass | 0,291 | 0,549 |
| **sleeve** | **0,276** ← *abaixo* do bypass | **0,568** ← *acima* do bypass |
| banda | 0,384 | 0,602 |

**A ordem entre as operações inverte entre o mês 1 e o mês 3.** O sleeve não é intermediário entre bypass e banda, nem versão escalada de nenhum dos dois — não havia como deduzir esses dois números de argumento nenhum. Herdando do bypass, ele errava ~0,2 de IMC nos dois tempos.

**Duas árvores validadas de brinde:** as folhas de **12 e 24 meses do sleeve** nunca tinham sido conferidas e batem exatas (85 kg, IMC 29,5 nas duas — o sleeve é a única operação em que o nadir não desce entre 1 e 2 anos). E **sleeve e banda devolvem o mesmo peso aos 60 meses**, confirmando empiricamente a leitura da Figura 3D (a única em que as duas caem no mesmo ramo).

### ⚠️ Todo resíduo contra a ferramenta oficial cabe no arredondamento da figura
Com as três operações medidas, sobram 7 células divergentes em 60 (15 tempos × 4 colunas), sempre por ≤1 kg / ≤0,2 de IMC / ≤1 pp. **Recuperando a folha interna deles pelo IMC oficial e comparando com a folha impressa na Figura 3:**

| | folha interna | folha na figura | diferença |
|---|---|---|---|
| bypass M24 | 0,3762 | 0,38 | 0,38 pp |
| bypass M60 | 0,3329 | 0,33 | 0,29 pp |
| sleeve M60 | 0,2438 | 0,24 | 0,38 pp |
| banda M12 | 0,1330 | 0,13 | 0,30 pp |
| banda M24 | 0,1571 | 0,16 | 0,29 pp |

A maior é **0,38 pp**, contra um teto de 0,50 pp para arredondamento a duas casas. **Nenhuma divergência exige explicação além do arredondamento, e nenhuma é erro de transcrição** — erro de leitura de ramo daria vários pontos percentuais, não décimos. O teste trava esse limite: é a asserção que denunciaria uma folha lida errado no futuro.

**Não substituí as folhas pelos valores internos recuperados**, embora eu agora os conheça para 6 delas. Ficaria um código com metade das folhas em alta precisão (as dos caminhos que o paciente de referência percorre) e metade com as duas casas da figura — menos auditável, e parecendo mais preciso do que a fonte é. O ganho seria de 0,2 de IMC numa previsão cuja faixa interquartil tem ~15 kg de largura.
- **Sobra ~0,2 kg no mês 3 da banda** (110,6 contra 110,4 oficiais). ⚠️ **A causa não é a razão: é a folha de 12 meses da banda, que a figura publica arredondada** (0,13 contra 0,133 internos deles). O mesmo desvio já aparece no próprio mês 12 (104,4 contra 104,0). **Ajustar a razão para compensar faria os meses 1 e 3 baterem enquanto o mês 12 — que vem da árvore de verdade — continuaria fora**: seria esconder o arredondamento da figura dentro de um parâmetro que tem outro significado. O teste trava a tolerância em 1 kg e confere que o resíduo do mês 3 é exatamente o do mês 12 propagado pela razão.
- **Lição que se repete pela terceira vez neste recurso:** eu declarei a limitação certa ("não conferi sleeve e banda") e mesmo assim publiquei o parâmetro único. **Declarar a incerteza não a resolve — quando existe implementação de referência acessível, uma rodada dela vale mais que a nota de rodapé.** Foi assim no nó ambíguo de M12 e de novo aqui.
- **Três avisos no desenho, não só na legenda:** traço **pontilhado**, ponto **vazado** (contra o ponto cheio das árvores) e **sem faixa** — não há desvio publicado para esses tempos. Na tabela, as duas linhas vêm com **"(aprox.)"**; no toque, a segunda linha diz "estimativa aproximada" em vez de faixa.
- **A curva é uma só, partida no mês 12.** `sophiaSegmentos` calcula os pontos de controle sobre a lista **inteira** e devolve um comando por segmento; o gráfico junta 0→1→3→12 num traço e 12→24→60 noutro. Calculando cada traço sobre a sua própria lista, as tangentes não bateriam e apareceria **um bico no mês 12** — o teste checa a colinearidade dos controles na emenda (produto vetorial ≈ 0).
- **O eixo do tempo ganhou uma segunda altura.** A escala é linear em meses (a da ferramenta oficial — mexer nela mudaria a forma da curva, que é o que se quer reproduzir), e nela o mês 1 fica a 7 px do pré-op. Nenhum texto cabe ali na mesma linha: "1m" e "3m" vão numa segunda altura, abreviados. Pelo mesmo motivo os dois **não têm rótulo de peso impresso** — a 14 px um do outro, dois textos de ~45 px se ilegibilizariam. O número sai no toque e na tabela, que é onde a ferramenta oficial também põe.
- `viewBox` 250→262 de altura. `sw` v165→v166.

### O contexto original da exclusão: M1 e M3
*(29/07, superado em 30/07 pela seção acima — fica registrado porque metade do raciocínio continua valendo.)* Não foram publicados (o pipeline tem cinco árvores, a figura traz três), então a queda inicial não sai de modelo nenhum e a calculadora entregava três pontos. A tabela oficial mostra 9% e 16% naqueles dois pacientes, mas **dois pontos não são um modelo**: fixá-los valeria para sleeve, banda, outras idades e outros pesos sem base nenhuma.

**O que eu errei aqui foi o salto**, não a premissa: de "não posso fixar dois números" concluí "não posso projetar nada". Havia um caminho intermediário — projetar a **razão** em vez do valor — que preserva a objeção (o número deixa de ser fixo e passa a escalar com a operação) e ainda assim entrega o que o professor precisava. **Lição: quando um dado publicado não basta para a forma direta, testar se ele basta para uma forma derivada antes de descartar o recurso inteiro.**

`scripts/test-calc-sophia.js` continua reprovando se aparecer `sophiaM1`/`sophiaM3` — árvore inventada segue proibida — e agora reprova também se a perda precoce deixar de escalar com a operação.

### Detalhes de implementação
- A tela mostra o **caminho percorrido na árvore**. O modelo é interpretável de propósito; expor o caminho é o que permite auditar a previsão em vez de acreditar nela.
- O IMC da tabela oficial (25,9 aos 2 anos) sai do peso **já arredondado** (75 kg); aqui sai do peso exato (74,4 kg → 25,7). Diferença de arredondamento da tela deles, não de modelo.
- `scripts/test-calc-sophia.js` (passo 12 do CI) confere as **22 folhas**, os três fechamentos de `n` e os seis valores oficiais. Trocar o lado de um ramo derruba 6 asserções. `sw` v157→v158.

## Cores por subespecialidade nas calculadoras (2026-07-30)
Pedido do professor: cards divididos por cor. **A cor NÃO é nova** — vem de `muralSubMeta(sub)`, a mesma função que colore os cards do Mural.

**Por que reusar em vez de criar uma paleta:** agora que as áreas são as subespecialidades, uma paleta local faria Lípides ser vermelho no Mural e outra coisa nas Calculadoras. A leitura de cor só vale se for a mesma em toda a plataforma. `scripts/test-painel-professor.js` reprova se aparecer **cor hexadecimal literal** dentro de `renderCalcGrid`.

Onde a cor aparece: **borda esquerda do card** (classes `mural-card-*`, que só definem `border-left-color` — a borda em si é declarada em `.calc-card`), **ponto colorido na aba** e **ponto no título do grupo** (classes `tag-sub-*`, das quais o ponto herda o fundo).

- **A borda existe sempre**, mesmo sem cor mapeada: sem ela os grupos ficariam com alinhamento diferente entre si.
- **"Distúrbios hidroeletrolíticos" fica neutro** — é a única área que não é subespecialidade da plataforma, então `muralSubMeta` cai no `tag-muted`. Foi mantido assim de propósito: dar a ele a cor de outra subespecialidade seria mentir sobre a categoria.

## ⚠️ `min-width:0` — a faixa de abas estourava a página no iPhone (2026-07-29)
O professor mandou a tela do celular: cards enormes e as **descrições cortadas à direita**. Não era zoom nem fonte grande — era **estouro de largura**.

**A causa:** em tela estreita (`max-width:760px`) o `.pill-tab-row` vira `flex-wrap:nowrap; overflow-x:auto`. Só que a faixa é **item de uma grade**, e o padrão `min-width:auto` de item de grade faz o item **se recusar a encolher abaixo do conteúdo**. As 9 abas em linha única viravam a largura mínima da grade inteira, e a página passava da tela.

**A correção é uma declaração:** `min-width:0` no `.calc-pills-wrap` (e no `.calc-area-grid`, pelo mesmo motivo). Com ela o item encolhe e o `overflow-x` interno é que rola.

**A regra geral, que vale para qualquer grade deste projeto:** filho de grade ou flex que contenha algo com `nowrap`/`overflow-x` precisa de `min-width:0`, senão o filho impõe a própria largura ao pai. O sintoma é sempre o mesmo — layout quebrado só no celular, sem erro nenhum no console.

## ⚠️ As áreas das calculadoras são as SUBESPECIALIDADES (2026-07-29)
Reatribuição ditada pelo Rodolpho, calculadora a calculadora:

| Antes | Agora |
|---|---|
| Risco cardiovascular · Lipidologia | **Lípides** (PREVENT, PREVENT 30 anos, LDL Friedewald — Martin/Hopkins desde 24/10/2026) |
| Antropometria (IMC, %PEP, SOPHIA) · Fígado (MASLD) | **Obesidade** (+ FIB-4) |
| Antropometria (superfície corporal) · Crescimento | **Endocrinologia Pediátrica** |
| Função renal | **Diabetes** (+ HOMA-IR, que já estava lá) |

Inalteradas: Distúrbios hidroeletrolíticos, Osteometabolismo, Adrenal, Tireoide.

**O porquê:** as áreas antigas eram nomes de **assunto**, não as subespecialidades usadas no resto da plataforma (Resumos, Questões, Flashcards, Mural). Quem procurava FIB-4 pensando em Obesidade não achava, porque estava em "Fígado (MASLD)". Agora as abas das calculadoras falam a mesma língua do resto.

Ficaram **8 áreas para 23 calculadoras**: Lípides 3 · Obesidade 4 · Distúrbios hidroeletrolíticos 2 · Osteometabolismo 4 · Adrenal 1 · Diabetes 3 · Tireoide 1 · Endocrinologia Pediátrica 5.

`scripts/test-painel-professor.js` trava o mapa **id → área** das 23 e reprova se alguma voltar para um dos rótulos antigos.

## Gráfico e tabela de valores nas calculadoras (2026-07-29)
O framework de `CALCS` só renderizava **número + tag**. Ganhou um ponto de extensão: `extra:function(s,v){return html}`, anexado depois da caixa de resultado. Erro dentro do `extra` é engolido — o número, que é o principal, não pode cair por causa de um gráfico.

Primeiro uso: o SOPHIA, com gráfico SVG (gerado por código, como as fichas dos artigos) e tabela de peso/%PPT/IMC/%PEP em 1, 2 e 5 anos.

- **⚠️ O trecho 0→12 meses do gráfico é PONTILHADO.** As árvores de 1 e 3 meses não constam do artigo, então a forma da queda inicial é desconhecida. Reta cheia ali afirmaria perda linear no primeiro ano, o que é falso — a perda real é concentrada nos primeiros meses.
- **O %PEP da tabela usa a mesma definição da ferramenta oficial** (excesso sobre IMC 25): no 12º mês do caso de referência dá 75%, exatamente o que a tabela deles mostra. Confirmação a mais de que a definição é a mesma.
- Sem excesso de peso, o %PEP sai como travessão em vez de número.

## Calculadoras agrupadas por área (2026-07-29)
Pedido do professor. A lista corrida passou de 30 itens e virava varredura visual. Agora `initCalc` agrupa por `c.area`, com contagem por grupo.

- **A ordem dos grupos segue a PRIMEIRA aparição em `CALCS`, não alfabética.** A ordem do array já expressa prioridade (risco cardiovascular e antropometria primeiro), e ordenar por nome jogaria "Adrenal" para o topo sem motivo.
- **⚠️ `grid-column:1/-1` no título e na sub-grade.** O container é `.g3` (3 colunas); sem isso cada título ocuparia uma célula de um terço e a lista sairia intercalada com os cards.
- O card deixou de repetir a área — ela já é o título do grupo.

**Abas de área acima da lista (mesmo dia, segundo pedido).** Agrupar resolveu a leitura, mas com 30 itens ainda era preciso rolar até o grupo. Agora há uma faixa de `pill-tab` — "Todas" + uma por área, com contagem — que filtra o grid.
- **⚠️ Trocar de aba NÃO fecha a calculadora aberta.** `renderCalcGrid` só mexe no grid e nunca toca `activeCalc`; fechar apagaria o resultado que a pessoa está lendo. O teste verifica isso lendo o corpo da função.
- Com uma área filtrada, o título do grupo é omitido — repetiria a aba selecionada.
- Área que deixe de existir em `CALCS` cai de volta em "Todas" em vez de mostrar lista vazia.

## Faixa de incerteza no gráfico do SOPHIA (2026-07-29)
O professor pediu a área sombreada que a ferramenta oficial mostra, com o tooltip de mês, peso e faixa.

**O que a faixa deles é:** o artigo diz que a calculadora exibe *"prediction intervals corresponding to IQR of prediction errors"*, e a Figura 3 se chama *"Predicted trajectory and IQR of BMI"*. É **interquartil** — metade dos pacientes.

**Os percentis empíricos não são publicados.** O que a **Tabela 3** dá é o **desvio do erro de IMC por operação e por tempo** nas coortes de validação: bypass 3,2 / 3,9 / 4,5 · sleeve 4,3 / 4,8 / 5,6 · banda 3,9 / 4,1 / 4,3 (12/24/60 meses). Daí a meia-largura interquartil sai por aproximação normal, **0,6745 × DP**.

**Conferência:** no caso de referência (bypass, 2 anos) isso dá largura de **15,2 kg**, contra **~16 kg** da faixa verde deles. A largura bate. O **centro** difere: a deles é deslocada para cima (usam o percentil do erro, que carrega viés), a nossa é simétrica em torno da previsão. Está declarado na legenda — é aproximação da mesma grandeza, não a faixa deles.

### ⚠️ O caminho errado que eu tomei primeiro
Usei os **limites de concordância de Bland-Altman** do apêndice (±1,96 DP: 6,8 / 8,1 / 9,4 kg/m²). É dado publicado, mas é intervalo de **~95%**: dava **51–98 kg** aos 2 anos, engolia o gráfico e não correspondia ao que a ferramenta mostra. Dado publicado não basta — tem de ser **a mesma grandeza** que se está reproduzindo.

- A faixa **começa em 1 ano**: antes disso não há modelo, logo não há incerteza para sombrear.
- Tooltip por `<title>` em cada ponto (mês, peso, faixa), com um círculo transparente de raio 14 por cima para o dedo alcançar. Sem JS. **Só nos três tempos do modelo** — hover em mês intermediário exigiria interpolar valores que não existem.
- Coluna "Faixa (kg)" na tabela de valores.

## Gráfico do SOPHIA: o que estava errado (2026-07-29)
Primeira versão saía **gigante**: `viewBox` de 320×200 com `width:100%;height:auto` numa tela larga vira um bloco de mais de mil pixels de altura, e as fontes de 8 unidades escalam junto — números enormes, gráfico ilegível.

- **`max-width:480px` e centralizado.** É o teto que faz o texto sair no tamanho pretendido.
- **Marcas do eixo do peso arredondadas para múltiplos de 5**, com o eixo terminando *em cima* das marcas. Antes saíam os extremos crus do intervalo (125 / 95 / 66), que ninguém lê.
- **Eixo do tempo por extenso** (pré-op · 1 ano · 2 anos · 5 anos) em vez de números de mês.
- **Faixa sombreada** sobre o trecho pré-op→1 ano, além do pontilhado, para o olho ver onde o modelo começa.
- **O rótulo do nadir (2 anos) vai ABAIXO do ponto**; acima colidiria com a linha que sobe para os 5 anos.

## Curva suave e tooltip que responde ao toque (2026-07-30)
O professor comparou lado a lado com a ferramenta oficial: *"A projeção da curva na nossa plataforma está diferente da original e não está aparecendo esses pontos quando clica em cima"*. Dois defeitos distintos no mesmo gráfico.

**1. A curva era uma poligonal.** Os três pontos modelados (1, 2 e 5 anos) eram ligados por retas, com um bico no nadir; a projeção oficial é suave. Entrou `sophiaCurva(pts)` — **Catmull-Rom convertido para Bézier cúbica** (pontos de controle a ±1/6 da diferença dos vizinhos) — aplicada à linha central **e às duas bordas da faixa**. Se só a linha central fosse suavizada, a área sombreada descolaria dela e ficaria com bicos onde a linha não tem.
- **O trecho pré-op→1 ano continua RETA pontilhada.** Ali não há previsão (não há árvore de 1 e 3 meses no artigo) e curvar sugeriria uma forma de queda que o artigo não publica. A curvatura é uma afirmação sobre os dados, não enfeite.

**2. ⚠️ O `<title>` de SVG não é tooltip de toque.** Era o que eu tinha usado. Ele só abre com o **mouse parado por ~1s**: clique não abre, toque não abre. No desktop com mouse funciona, e é por isso que o defeito passa despercebido de quem escreveu — o professor viu no iPhone. Trocado por uma caixa em SVG dentro de `<g class="sph-pt" tabindex="0">`, revelada por CSS em `:hover`, `:focus` e `:focus-within`: clique e toque **dão foco**, então os três gestos funcionam, sem uma linha de JS e sem re-registrar listener a cada re-render.
- Alvo de toque é um `<circle r="16" fill="transparent">`, bem maior que o ponto desenhado (r=4).
- A caixa é **grampeada dentro da área do desenho** (`Math.min/Math.max` contra `x0`/`x1`), senão sairia cortada nos pontos das bordas; e vai acima ou abaixo conforme o ponto esteja na metade de baixo ou de cima.
- O mesmo texto vai no `aria-label` do grupo, para leitor de tela.
- **`viewBox` 240→250 de altura** para caber a caixa do ponto mais baixo.

## A legenda longa saiu do gráfico do SOPHIA (2026-07-30)
Pedido do professor: *"pode retirar esse parágrafo 'A área sombreada é a faixa…'"*. Eram ~10 linhas de texto miúdo abaixo do gráfico, e dominavam a tela.

**O que NÃO podia sair junto:** a identificação da faixa. Faixa sombreada sem rótulo é lida como **IC 95%**, e ela é **interquartil** — metade dos pacientes. Confundir as duas dobra a incerteza percebida numa conversa pré-operatória. Movi a identificação para a `note` da calculadora (o bloco ℹ️ logo abaixo, que ele manteve), em uma frase: o que é, de onde vem (Tabela 3, aproximação normal) e em que difere da faixa da ferramenta oficial.

O resto do parágrafo — as frações por operação, o motivo do pontilhado — já estava duplicado na `note`, então não se perdeu nada. O teste passou a conferir a `note` no lugar do `extra`, e reprova se o parágrafo voltar ao gráfico.

## A calculadora abre em tela própria, com "← Voltar" (2026-07-31)
Pedido do professor: *"ao invés de clicar na calculadora e ela aparecer lá embaixo, abrir em nova tela sozinha com botão no canto superior de voltar"*. Com 30 calculadoras em 8 áreas, o formulário nascia **abaixo** de toda a grade — abrir um cartão de Endocrinologia Pediátrica e ter de rolar para achar o próprio resultado.

- `openCalc` esconde `#calc-grid`; `closeCalc` devolve.
- **Botão FORA do cartão e à esquerda.** Dentro do `card-head`, ao lado do título, ele lê como "fechar este bloco" — que é o que ele era (`✕ Minimizar`). Voltar é navegação de tela.
- **`scrollIntoView` passou de `nearest` para `start`:** com `nearest` a página não rolava, e quem abria um cartão lá embaixo continuava vendo o meio do formulário.
- **Ao voltar, a rolagem vai para o CARTÃO de origem**, não para o topo da grade — senão quem estava lá embaixo recomeça a procura.

### ⚠️ A grade escondida é um estado que precisa de três donos
`renderCalcGrid` **também** faz `el.style.display=''`. Sem isso existe um caminho para a aba ficar **em branco**: abrir uma calculadora (grade escondida), sair da aba, e voltar depois de o `activeCalc` ter sido zerado — o painel do professor zera em `bindAdmSec`. Aí `initCalc` redesenha a grade mas ela continua `display:none`, e não há calculadora aberta para mostrar. O teste trava os três lugares (`openCalc` esconde, `closeCalc` mostra, `renderCalcGrid` mostra), porque o defeito só aparece depois de navegar para fora e voltar — o caminho que ninguém testa à mão.

## Ajuste de framework
`calcUpdate` mostra **`—`** quando `calc()` retorna não-finito (entrada incompleta ou idade fora da faixa) em vez de `NaN`.
- **Campo `type:'date'`** (2026-06-15): o framework de calculadoras agora renderiza `<input type="date">` além de `num`/`select`. Helpers `ageMonthsFromDates(dobStr,domStr)` (idade em meses fracionários; `dom` vazio = hoje; mês médio 30,44 dias) e `ageLabelFromMonths(mo)`.
- **Escore-z de estatura/idade (`zha`)**: passou a receber **Data de nascimento + Data da medida** (em vez de idade em meses, que era pouco prático). A idade é calculada e exibida no resultado (ex.: "idade 8 anos"). Mesma matemática LMS/limites de faixa (OMS 0–228m, CDC 24–240m).

## Também no painel do professor (#277)
As mesmas calculadoras aparecem no admin (seção 🧮 Calculadoras, `admCalcHTML`/`data-asec="calc"`). Para conviver com o painel do aluno sem colisão de IDs, as funções de cálculo são **escopadas a um contêiner ativo** (`calcRoot` via `calcEl(sel)`): `initCalc(root)`/`openCalc`/`closeCalc`/`calcUpdate`. No `bindAdmSec`, `sec==='calc'` reseta `activeCalc` e chama `initCalc(main)`.

## Regenerar `growth-lms.js`
Fontes (hosts permitidos no sandbox: `raw.githubusercontent.com`): CDC `statage.csv` (mirror MITRE/GrowthViz), WHO 2006 (`growthfile_who.csv.gz` do GrowthViz), WHO 2007 (`erik1066/anthstat-statistics` → `src/WHO2007.data.cs`, dicionário `WHO2007_HeightAge`). Validar com z=0 na mediana.

## PREVENT (risco CV) — modelo base + aprimorado (UACR/HbA1c) (2026-06-22)
- `preventRisk(v)` (~linha 2007 do `index.html`) implementa as equações **AHA PREVENT** (Khan, Circulation 2024). **Modelo base** (sexo, idade, CT, HDL, PAS, TFGe, IMC, DM, tabagismo, anti-HTN, estatina) em `PREVENT_COEFS`; saída de 10a e 30a para DASCV, DCV total e IC.
- **Modelo aprimorado:** campos **opcionais** `pv_uacr` (RAC/UACR, mg/g) e `pv_hba1c` (HbA1c, %). Se preenchidos, usa as variantes oficiais **uacr / hba1c / full** em `PREVENT_AUG` — cada modelo é **reajustado** (TODOS os coeficientes mudam; não é só somar termos ao base). Sem zip/SDI no Brasil → **SDI tratado como ausente** (`missing_sdi=1`). Campos vazios → cai no **base** (saída idêntica à anterior). O resultado indica o modelo usado (`+UACR` / `+HbA1c` / `+UACR/HbA1c`).
- **Transforms** (iguais ao pacote `preventr`): `ln_uacr=ln(UACR)`; `hba1c_dm=(HbA1c−5,3)` se DM, senão `hba1c_no_dm`; centralizações idade 55 / não-HDL 3,5 mmol/L / HDL 1,3÷0,3 / PAS 130 / IMC 25 / eGFR 90 (colesterol mg/dL→mmol/L = ×0,02586).
- **Fonte dos coeficientes:** pacote R **`preventr`** (martingmayer), `R/sysdata.rda` lido com `pyreadr` — NÃO transcritos à mão. Tabelas `base/uacr/hba1c/full × 10yr/30yr`.
- **Validação:** referência Python (mesmas tabelas) + harness Node extraindo do `index.html` (24 casos aumentados, dif ≤1e-6; base = legado). **Âncora externa:** masculino, UACR 45 + HbA1c 6,9 → **31,3% DCV total**, igual à calculadora **oficial da AHA**.
- **LIÇÃO:** "PREVENT diferente da AHA" quase sempre é comparação desigual — conferir **sexo** e se o site da AHA usou **UACR/HbA1c/SDI** (full equations) antes de supor bug.
