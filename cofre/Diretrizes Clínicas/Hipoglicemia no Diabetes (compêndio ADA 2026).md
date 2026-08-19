---
tags: [cofre, diretriz, diabetes, hipoglicemia, ada]
atualizado: 2026-08-19
---

# Hipoglicemia no Diabetes — compêndio ADA 2026

**Fonte:** Ratzki-Leewing A, McCoy RG, Aleppo G, Neumiller JJ, Pilla SJ, Riddell MC.
*A Practical Guide to Hypoglycemia: New Approaches to Overcoming a Persistent
Barrier to Optimal Glycemic Management.* ADA Clinical Compendia Series.
Arlington, VA, American Diabetes Association, 2026. https://doi.org/10.2337/db20261

**Como chegou:** o professor mandou o print e disse *"incorpore esse livro que
está no drive"*. O arquivo é `2026_aug_hc.pdf` (12,3 MB), lido pelo conector do
Drive — **214.663 caracteres** de texto. Cinco capítulos mais introdução e
conclusão; as referências ocupam o resto do arquivo e não entram.

⚠️ **Direito autoral:** o compêndio traz *"©2026 by American Diabetes
Association. All rights reserved. None of the contents may be reproduced without
the written permission"*. **Não é material de reprodução livre.** O texto ficou em
`scratchpad/acervo/textos/`, que está no `.gitignore`; o repositório guarda só
offset e hash. Cobertura medida: **34%** — bem abaixo do limiar de 55%.

**O que entrou:** **172 fatos**, cada um com citação literal ancorada por
offset + hash, cobrindo fisiologia, consequências, classificação, epidemiologia,
avaliação, prevenção e tratamento.

---

## 🚨 HIPOGLICEMIA VIROU SUBESPECIALIDADE — a 2ª divisão por teto, e a 1ª que era possível

Diabetes estava em **370.219 de 400.000 (93%)**, e **400k é o `TETO_MAXIMO`** — não
há para onde subir. O compêndio pesa **~64k**. Não cabia, e a saída documentada em
`lib/clinical-deep.js` é **DIVIDIR a subespecialidade**.

⚠️ **Por que aqui a divisão funcionou e na obesidade pediátrica não:** a divisão só
é honesta se a pergunta souber achar a área nova. **"Hipoglicemia" é uma palavra
só, específica, que roteia sozinha.** *"Criança + obesidade"* é **co-ocorrência**, e
o roteador só casa substring — foi por isso que o bloco pediátrico teve de ficar
declarado nas DUAS áreas, e este não precisa.

**E o ganho não é só caber:** uma pergunta de hipoglicemia recebia **372k de
Diabetes**, dos quais a parte de hipoglicemia era uma fração. Agora recebe **64k
inteiramente sobre o assunto perguntado.**

## ⚠️ CRIAR UMA ÁREA MEXE NO ROTEAMENTO DE TODAS AS OUTRAS

Medido no corpus antes de decidir: **"hipoglicemia" aparece 88 vezes em Diabetes,
76 em Endocrinologia do Esporte, 49 em Obesidade e 13 em Adrenal.** A chave nova
podia roubar de quem responde melhor — e roubou.

**A varredura diferencial em 28 perguntas pegou uma regressão real:**

*"hipoglicemia no exercício aeróbico prolongado no DM1"* deixou de ir para
**Endocrinologia do Esporte**. A causa é fina: existe uma **promoção condicional do
Esporte** que só dispara quando `ordem.length === 2` e o topo é `Diabetes`. Com a
área nova, a pergunta passou a casar **três** áreas e o topo virou `Hipoglicemia`
— **as duas condições falharam juntas**, e a pergunta perdeu o consenso de
exercício no DM1, que é o assunto exato dela.

**Conserto:** a condição "só duas áreas" existe para não sequestrar quando uma
**terceira DOENÇA** é nomeada. Hipoglicemia não é uma terceira doença — é o mesmo
aglomerado do diabetes, partido por teto. A regra passou a olhar o **conjunto**:
se tudo que casou está dentro de {Diabetes, Hipoglicemia, Esporte} e o Esporte
casou, é interseção pura e o Esporte sobe. Os quatro contraexemplos que a regra
original protege continuam verdes.

## ⚠️ EU AFIRMEI UMA COISA ERRADA SOBRE O CÓDIGO, E CORRIGI

Ao consertar o roteamento da **hipoglicemia pós-bariátrica**, escrevi no
`lib/clinical-deep.js` que **`bypass gastrico` não era chave**. **Era.** Ela existe
desde antes e está em `CAT_FARMACO` **de propósito** — menção de PROCEDIMENTO não
sequestra a pergunta —, por isso pesa 2015 e perde para `hipoglicemia` (3012).

Reclassificá-la para tier de doença consertaria este caso e **estragaria o que
aquela decisão protege**. O conserto certo foi o **composto**
(`hipoglicemia pos-bariatrica`, `hipoglicemia apos bypass`…), que só casa quando a
pergunta é exatamente sobre isso — e aí a resposta é o **consenso de dumping**, que
mora em Obesidade, não este compêndio, que declara essa causa **fora do seu escopo**.

## ⚠️ O PDF VEM COM AS COLUNAS INTERCALADAS

Em vários trechos dos capítulos 3 e 4 a extração alterna **meia linha de uma coluna
com meia linha da outra**. Uma fatia contígua ali **não seria a citação** — seria
duas frases embaralhadas, e o risco é **inverter o sentido** quando a negação fica
do outro lado. Esses fatos usam **elisão declarada**, com cada pedaço literal e
buraco dentro do limite de 400 caracteres.

Onde a elisão não era possível **sem costurar trecho distante**, o fato foi
**partido em dois** em vez de forçado — aconteceu duas vezes, quando uma tabela
caía no meio da frase (438 e 2.207 caracteres de buraco).

⚠️ **Um aviso do `cobertura-extracao` ficou de pé, e é falso positivo conferido:**
a citação do fato de pós-exercício começa no meio da frase porque a Tabela 4.3
separa a cabeça do corpo por 438 caracteres. O que ficou para trás é *"Some people
with diabetes"* — **sem negação nenhuma**. A afirmação foi reescrita para não dizer
"algumas pessoas", afirmando só o que a citação sustenta.

⚠️ **E o `proporcao-citada` reporta "1 não localizada", que também é artefato:** ele
procura cada pedaço na base **1** (sem hífen de quebra), e um pedaço meu termina em
`medica-`. Na base 1 isso vira `medicamentos`, então a busca falha. O
`verifica-extracao` e o `confere-ancoragem` — que são os que valem — passam
**172/172, zero âncora ambígua**.

---

## O que entrou no NÚCLEO (e o que deliberadamente não entrou)

O núcleo tinha **557 caracteres de folga**. Entrou **uma coisa só**, a que corrige
uma regra **que já estava lá** e podia causar dano:

> `regra 15-15: 15 g e repetir em 15 min se persistir` — ⚠️ **em AID bastam 8–10 g,
> 15 g dão REBOTE**

⚠️ **Por que essa e não outra:** o núcleo viaja em TODA chamada e ensinava o 15-15
**sem qualificação**. Em quem usa sistema automatizado de entrega, quando a glicose
do sensor chega à faixa hipoglicêmica o algoritmo **já suspendeu a insulina** — dar
os 15 g ali causa **hiperglicemia de rebote**. Ficou em **79.486/80.000, folga 514**.

**Ficou de fora do núcleo, por falta de espaço, e vive na camada profunda:** a
preferência por **D10 sobre D50** no pré-hospitalar, as **três formulações prontas de
glucagon** (intranasal 3 mg, SC 0,5–1 mg, dasiglucagon 0,6 mg) e a atualização
**anual** da receita de glucagon.

## O que a base não tinha e agora tem

Cortes e fisiologia contrarreguladora com os **limiares de cada defesa** ·
**bradicardia** na hipoglicemia noturna contra taquicardia na diurna · estado
**pró-trombótico que persiste por dias** · risco **dobrado** de demência e de eventos
cardiovasculares · **falência autonômica associada à hipoglicemia** e a
reversibilidade parcial da percepção · os instrumentos de **percepção prejudicada**
(Pedersen-Bjergaard, **Gold ≥4**, **Clarke ≥4 "R"**, **HypoA-Q ≥12**) e o rastreio
**anual** · **medo de hipoglicemia** e seus instrumentos · **>90% dos eventos graves em
<15% das pessoas** · **90–95%** dos eventos graves tratados fora de serviço médico ·
**Beers 2023** contra sulfonilureia no idoso · **glibenclamida contraindicada com TFG
<60** · **sobrebasalização** · análogos basais de 2ª geração · **iGlarLixi/IdegLira** ·
**empilhamento de insulina** e a espera de **4–5 h** · fator de correção proativo
contra escala móvel · **antimicrobianos que potencializam sulfonilureia** ·
betabloqueador **mascarando** sintoma · ajuste ao iniciar GLP-1 (**parar a SU se A1C
≤7,5%**, **reduzir 50%** entre 7,6 e 8,5%; **basal −20–30%**) · exercício
(**<90 mg/dL** pré-exercício pede carboidrato) · **direção** (não iniciar viagem longa
com 70–90 mg/dL sem carboidrato profilático) · ensaios **DIAMOND, HypoDE, GOLD,
WISDM, RELIEF** · programas **BGAT-2, DAFNE, HARPdoc, Hypo COMPaSS** · **D10 × D50**.

## Guarda

`scripts/test-hipoglicemia.js`, no `ci-validate`. Cobre as quatro coisas que
quebram calado: o compêndio **deixar de chegar** a quem pergunta (7 perguntas, cada
uma conferindo o CONTEÚDO e não a área), a área nova **roubar** de
Esporte/Obesidade/Adrenal/Diabetes (10 controles), Diabetes voltar a estourar o
teto, e a **ressalva do AID sumir do núcleo**. Verificado por mutação em três
pontas — as três reprovam.

⚠️ **Duas expectativas do `test-caminho-clinico` mudaram de `Diabetes` para
`Hipoglicemia`**, e não foi para deixar o teste verde: conferi que as respostas
entregues agora trazem a bradicardia noturna e a supressão contrarreguladora pelo
sono, que é o que as perguntas pedem e não estava em bloco nenhum de Diabetes.

## Pendência

O compêndio declara **fora do escopo** — e a base também não cobre — a hipoglicemia
**não diabética**: insulinoma, hipoglicemia de jejum, hipoglicemia neonatal. Hoje
essas perguntas caem em Hipoglicemia e recebem um bloco que **avisa, no campo
`conflito`, que não é sobre elas**. É honesto, mas é lacuna de conteúdo.
