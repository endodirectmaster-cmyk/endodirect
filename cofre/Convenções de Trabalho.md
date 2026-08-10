---
tags: [cofre, processo]
atualizado: 2026-08-09
---

# Convenções de Trabalho

## 🔀 SÃO TRÊS CAMINHOS ATÉ O MÉDICO, E CORRIGIR UM NÃO CORRIGE OS OUTROS (2026-08-10)

O mesmo fato clínico chega ao médico por **três vias independentes**, e elas não
se atualizam sozinhas:

1. **O núcleo** (`CLINICAL_GUIDELINES` do `index.html`) — vai em toda chamada de IA.
2. **As notas de `cofre/Diretrizes Clínicas/`** — fonte de verdade declarada de
   flashcards, questões, newsletter, Mural e resumos de aula.
3. **O conteúdo da plataforma** (`endodirect_global_state.payload.diretrizes` no
   Supabase) — 215 itens, 1,7 milhão de caracteres, o que o médico LÊ nas abas
   Resumos e Diretrizes.

**Medido em 10/08/2026, e é por isso que esta nota existe:** quatro correções que
eu tinha feito no núcleo continuavam VIVAS COMO DEFEITO nas notas do cofre
(condição de coleta da copeptina, ordem de leitura da copeptina, marco de 16
semanas do PTU, ranking de risco por via do glicocorticoide), e três continuavam
vivas na plataforma (romosozumabe sem cautela cardiovascular, PTU→metimazol
inclusive num flashcard, régua pediátrica P95).

**A regra: toda correção de núcleo exige varredura das TRÊS vias pelo termo.**
A varredura do `index.html` sozinha está certa e é insuficiente. Para a
plataforma, a varredura é SQL sobre o `payload` — e vale rodar também a pergunta
inversa: *"os defeitos que já corrigi no núcleo existem aqui?"*, que foi como os
três da plataforma apareceram.

⚠️ **E o inverso também acontece:** em dois casos o NÚCLEO estava certo e a NOTA
errada (o ranking por via do glicocorticoide, o Na urinário na SIAD). Não
presuma que a nota é a fonte e o núcleo a cópia — as duas envelhecem.

## 🔴 GUARDA VERDE AQUI, VERMELHA NO CI: O CORPUS NÃO EXISTE LÁ (2026-08-09)

Abri o PR #729 com o `ci-validate` inteiro verde na minha máquina. **O check
`validate` do GitHub reprovou os 47 extratos de uma vez** — e não havia defeito
nenhum na base.

A guarda nova `monta-base-profunda.js --conferir` roda, antes de montar, as três
etapas de pré-requisito — e a primeira delas, o `verifica-extracao.js`, **lê
`scratchpad/acervo/textos/`**. Esse diretório está no `.gitignore` porque o
repositório é PÚBLICO e o texto integral dos artigos é protegido por direito
autoral. **No runner ele nunca vai existir.** A peneira não achou defeito: ela
não tinha o que ler.

**A regra que fica: antes de pôr uma peneira no `ci-validate`, pergunte de que
arquivos ela depende e se esses arquivos estão versionados.** Rodar verde na
máquina que tem o corpus não prova nada sobre o runner, que tem só o que está no
git. Peneira que só pode dar vermelho é pior que peneira ausente — vira paisagem
e ensina a ignorar o CI inteiro.

**O conserto, e por que ele não afrouxa nada:** a INVARIANTE que a guarda existe
para provar — "o `clinical-deep-data.js` commitado é o que os extratos produzem
hoje" — não depende do texto-fonte; a montagem lê só `extratos/*.json`. As três
etapas são pré-requisito de ESCRITA, e a escrita acontece onde o corpus está.
Então em `--conferir` sem corpus elas não rodam, e o script **diz isso em voz
alta** na primeira linha da saída.

⚠️ **Tudo ou nada, de propósito.** Um único `.txt` presente e as etapas rodam
inteiras — corpus PELA METADE tem de reprovar mesmo. Peneira cega devolve "✓" sem
ter olhado, e foi assim que a cobertura ficou cega na migração das citações: o
relatório veio limpo e limpo era o sintoma, não o resultado. Testado nos dois
sentidos: sem nenhum `.txt` passa e diz que não conferiu; com um só, reprova.

## ⏳ EU DECLAREI UM AGENTE MORTO E ELE ESTAVA VIVO (2026-08-09)

**Correção de um erro meu, e a versão anterior desta nota estava errada.**

Declarei a auditoria da HAC morta porque o transcrito dela estava parado às 15:27
e às 18:06 nada tinha mudado — quase três horas contra os ~25 minutos típicos dos
outros cinco agentes do dia. Cheguei a somar 250k ao medidor como estimativa do
gasto perdido.

**Ela não tinha morrido: terminou em 3h32min e relatou 227.307 tokens.** Auditoria
completa, sete defeitos achados, um deles grave. O `stat` do arquivo e o último
`"timestamp"` do transcrito **não são sinal confiável de vida** — o arquivo é
escrito por um caminho em que o `stat` mente (reportava 121 bytes num arquivo de
594 KB).

**O que fica, corrigido:**
- **Duração não é sinal de morte.** Um auditor sério pode levar 8× o tempo de um
  extrator. Só a notificação de término (ou a ausência do processo) decide.
- **A estimativa que somei ao medidor era ruído**, e tive de desfazê-la. Se for
  estimar mesmo assim, marque a estimativa como tal e reverta assim que o agente
  relatar.
- ⚠️ **O risco real que a nota anterior descrevia continua existindo** — o
  `orcamento-agentes.js` só conta o que o agente relata ao terminar, então um
  agente que morra de verdade fica fora do medidor e o freio erra para baixo.
  Mas o remédio não é declarar morte por relógio.
- **Não leia o `.output` inteiro** — 594 KB de JSONL estouram o contexto.

E o custo do meu erro: **segurei lançamentos por uma hora** achando que havia um
fantasma. A ironia é que havia um agente vivo, fazendo o melhor trabalho do dia.

## 🧪 CHAVE NOVA SÓ ENTRA DEPOIS DO CONTROLE INVERSO (2026-08-09)

Contar a dominância não basta. **Teste também a pergunta que NOMEIA a doença
concorrente** — é lá que a chave nova rouba.

O caso: `acne` mede 9 em Endocrinologia Feminina contra 4 em Adrenal (2,25:1) e
parecia aceitável. Com ela aplicada, *"acne grave em adolescente com HAC"* passou
a cair em **Feminina** — porque `acne` tem 4 letras (peso 3004) e `hac` tem 3
(3003), e o desempate DENTRO da categoria é por comprimento. **Uma pergunta que
nomeia a doença perdeu para um sinal, por uma letra.** É a segunda vez que o
desempate por comprimento morde (a primeira foi `cintilografia` 3013 ×
`paratireoide` 3012). Chave removida.

**O roteiro, então, é:** (1) contar alvo × resto; (2) rodar as perguntas que a
chave deve consertar; (3) **rodar as perguntas das áreas vizinhas que nomeiam a
doença delas**; (4) só então aplicar. E vale a regra do `perda auditiva`: domínio
não basta quando o termo pertence à clínica inteira — acne é da dermatologia, da
adrenal e da ginecologia.

⚠️ **Corolário do mesmo dia:** chave que a base já resolve é **peso escondido**.
`cortisol salivar` (21×0) e `cortisol livre urinario` (27×0) eram exclusivas e
foram recusadas: `cushing`, `cortisol` e `dexametasona` já levavam a Adrenal e o
bloco vencia sozinho. Chave desnecessária entra sem precisar e reaparece
desequilibrando outro empate depois.

## 📎 CITAÇÃO REPETIDA BYTE A BYTE É PROVA COPIADA (2026-08-09)

Achado pela auditoria do GIOP e **conferido por mim na fonte**: quatro fatos
(idx 26, 28, 29, 30) carregavam a MESMA citação — mesmo offset, mesmo tamanho,
mesmo `cit_sha`. A fatia provava o primeiro. Os outros três afirmavam
preferência de fármaco cuja frase ficava **100 a 400 caracteres adiante**, na
mesma célula da tabela.

⚠️ **E o `verifica-extracao.js` passou VERDE nos três.** A peneira dele é de
NÚMEROS, e o único número daquelas afirmações era `40` — que está na fatia,
porque ela começa no cabeçalho *"adults ≥40 years"*. **Prova fabricada com
número emprestado do cabeçalho.** É o limite do verificador escrito com todas as
letras: ele prova que a citação EXISTE no PDF, não que ela prova a afirmação.

Virou guarda de CI (`confere-farmaco-na-citacao.js`) depois de medir o escopo:

| escopo | candidatos em 6.197 fatos |
|---|---|
| fármaco na afirmação e ausente da citação, em qualquer fato | 176 (2,8%) |
| o mesmo, só onde a `cit` é IDÊNTICA à de outro fato | 2 |
| idem, aceitando a abreviatura da diretriz (`rom`, `den`, `ral`) | **0** |

Os 176 são quase todos legítimos: a fonte escreve a CLASSE (`GLP-1 RA`, `oral
BP`) e o fato nomeia o agente que o cabeçalho da tabela dava. **É a diferença
entre técnica e guarda de novo** — 2,8% vira paisagem, 0% significa alguma
coisa. Conferida nos dois sentidos: passa hoje e REPROVA na versão pré-auditoria
do GIOP.

## ⚖️ ESTENDER A CITAÇÃO PARA TRÁS ANESTESIA A PENEIRA DE NÚMEROS (2026-08-09)

A técnica que conserta população órfã — estender a citação até a frase que fixa
idade, doença ou cenário — **tem preço, e ele não estava escrito**. No GIOP as
citações estendidas chegaram a **1.902 caracteres** e passaram a conter
praticamente **todos os números da Tabela 1**. Dentro de uma fatia dessas, um
corte trocado entre linhas da mesma tabela passa verde: o número está lá, só que
provando outra linha.

**Não é motivo para não estender** — a população órfã é o defeito dominante da
base. É motivo para saber que, nesses fatos, a garantia deixou de ser mecânica e
passou a ser humana. O auditor do GIOP conferiu os 17 um a um e declarou isso no
relatório; é o que se espera de quem usar a técnica.

## 🏷️ O `tema` É A SUPERFÍCIE DE BUSCA — escreva a palavra do MÉDICO (2026-08-09)

O `deepFor` pontua `+3` por termo da pergunta achado no **tema** e `+1` no
corpo. Com todos os blocos da área cabendo no teto (é o caso de Endocrinopatias,
172k de 400k), **todos chegam** — o tema não decide QUEM chega, decide QUEM VEM
PRIMEIRO. E na hiponatremia isso decidiu errado nos dois sentidos:

- *"sódio 118 com convulsão, conduta agora"* → 1º era o **algoritmo
  diagnóstico**. O bloco de emergência empatava em 4 pontos e perdia no
  desempate por ordem de array, porque `sodio` estava no tema do algoritmo
  (*"sódio urinário"*) e não no dele — que dizia só "hiponatremia".
- *"sódio 120 sem sintomas, velocidade de correção"* → 1º era o bloco **agudo
  sintomático**, com bolus de salina hipertônica. O bloco crônico, dono do
  limite de velocidade, não dizia nem "sódio" nem "correção" no tema.

**Regra:** o tema tem de trazer o **analito**, o **cenário** e o **verbo que se
digita**. Não basta a palavra do artigo. ⚠️ E o radical do `deepFor` corta 2
letras, **não conjuga**: `convulsionando` não alcança `convulsão`, `correr` não
alcança `corrida`. Onde a forma importa, escreva as duas.

Corolário medido no mesmo dia, no roteamento de área: a lista do Esporte tinha
`corrida`, `natacao`, `musculacao` e **nenhum verbo** — e `correr`, `nadar`,
`pedalar` caíam em Diabetes.

## 🧾 EDITANDO EXTRATO POR SCRIPT, PRESERVE A INDENTAÇÃO (2026-08-09)

Mudei UM campo de `hipo-3.json` e o diff saiu com **2.360 linhas**: reescrevi com
`JSON.stringify(j, null, 2)` e o arquivo estava com indentação 1. O conteúdo
estava certo (conferi que os 97 fatos eram idênticos como JSON), mas um diff
desses **esconde a mudança real** e inutiliza o `git log -p` daquele arquivo.

A base tem os dois estilos (28 extratos com indentação 1, 12 com 2) — então não
há um número certo: **leia o do arquivo antes de reescrever**. Refeito com o
indent original, o diff voltou a ser 1 linha.

## 🧹 `git add -A` COM AGENTE RODANDO VARRE O TRABALHO DELE PELA METADE (2026-08-09)

Commitei um conserto meu enquanto o auditor do GIOP estava no ar. `git add -A`
pega **tudo**, inclusive um extrato salvo no meio da edição do agente — e o que
entra no commit é um JSON pela metade, com a validação passando porque o
verificador só roda depois.

Desta vez não pegou nada (conferi o `--stat`: só os meus dois arquivos), mas foi
**sorte de temporização**, não cuidado.

**Regra: com agente no ar, commit por CAMINHO EXPLÍCITO.** `git add lib/x.js
scripts/y.js`, nunca `-A`. O `-A` volta a ser seguro quando `git status` estiver
limpo e nenhum agente estiver rodando. E confira sempre o `git show --stat` do
que acabou de commitar — é a única prova barata de que só entrou o que você quis.

## 🏷️ O `tema` É PARA O BLOCO O QUE O `secao` É PARA O FATO (2026-08-09)

Extensão medida da regra abaixo, um nível acima. O `deepFor` emite cada bloco
como `• {tema} — {fonte}: {texto}` — então o `tema` **chega ao modelo**, ao
contrário do `secao`. Só que ele chega **uma vez, no cabeçalho de até 68 mil
caracteres de fatos**. Esperar que um "no ADULTO" no topo governe um fato que
está 40 mil caracteres abaixo é a mesma aposta que o `secao` já perdeu.

Medido em Obesidade: **3 dos 8 blocos não trazem marca de população no tema**
(diretriz CV da ABESO, efeito gastrintestinal de AR GLP-1, dumping) — todos são
de adulto. E a pergunta *"obesidade em criança de 8 anos, IMC no P97"* roteia
para **Obesidade** e recebe os 350 mil caracteres de conteúdo adulto, com o
cabeçalho mandando *"prefira-os a lembranças gerais"*.

O que segura hoje: a régua pediátrica entrou no **núcleo** (v216), e o núcleo vai
em toda chamada; e os blocos que carregam **dose** (farmacoterapia, bariátrica)
escrevem "no ADULTO" no tema.

**Não virou peneira de CI, pelo mesmo critério de sempre:** exigir marca de
população em todo tema acusaria blocos onde população não quer dizer nada
(hipercalcemia, dislipidemia) — falso positivo alto demais para um alarme que
precisa significar algo quando dispara. Vale como reforço da regra que já existe:
**a população mora na `afirmacao`**, não no cabeçalho que a carrega.

Áreas sem nenhum bloco (Pediátrica, Masculina, Transgeneridade) devolvem **vazio**
— conferido: não há queda silenciosa para a área vizinha quando só elas pontuam.

## 📄 O CAMPO `secao` NUNCA CHEGA AO MODELO — o fato tem de se bastar (2026-08-09)

Achado por auditoria adversarial e **conferido no código** por mim
(`monta-base-profunda.js`): o montador faz `atual.fatos.push(String(f.afirmacao))`
e mais nada. O `secao` só é usado no **sufixo do tema** das partes de um artigo
partido — no máximo 4 seções, cortadas em 150 caracteres. **Ele não acompanha o
fato.**

Consequência: um fato que se apoia no cabeçalho da seção para dizer de que
doença, cenário ou população fala **chega órfão** à tela do médico.

O caso que provou: dois critérios do Painel 1 do hiperparatireoidismo diziam só
*"PAINEL 1, CRITÉRIO 2a (ENVOLVIMENTO ESQUELÉTICO) — escore T < −2,5"* e
*"CRITÉRIO 4 (CALCIÚRIA): >400 mg/dia"*. A seção dizia "indicações de cirurgia";
o fato, não. Sozinhos, o primeiro lia-se como o corte **diagnóstico** de
osteoporose e o segundo como limiar de tratamento — e **>400 mg/dia é justamente
o teto de tratamento do HIPOparatireoidismo**, o extrato irmão da mesma área.

**Regra para todo extrator: escreva a doença, o cenário e a população DENTRO da
`afirmacao`.** `secao` é organização, não contexto entregue.

⚠️ **Tentei transformar isso em peneira e MEDI que não presta como guarda:**
procurar palavra de escopo presente na `secao` e ausente na `afirmacao` dá 59 de
6.182 fatos (1%), e dos **6 que amostrei, 6 eram falso positivo** — o contexto
agudo viaja por **via e tempo** ("intravenosa rápida", "1 L em 1 h", "até a
recuperação clínica"), não pela palavra "crise". A peneira acharia os dois casos
reais, mas afogados em ruído. Foi para o brief como técnica.

## 🪤 EU CAÍ NA ARMADILHA QUE POLICIO, E O VERIFICADOR ME PEGOU (2026-08-09)

Consertando um fato acusado pela auditoria, escrevi na afirmação que *"no
hiperparatireoidismo primário o núcleo manda manter **25OHD >30 ng/mL**"*. É
verdade, está verbatim no núcleo — **e não tem lastro na citação daquele
artigo**, que é sobre hipercalcemia PTH-INDEPENDENTE. O `verifica-extracao.js`
reprovou na hora: *"números na afirmação sem respaldo na citação: 25, 30"*.

**É exatamente o erro que eu escrevo em todo brief de agente.** Reescrevi sem o
número — "o núcleo manda MANTER a vitamina D reposta (o alvo numérico está na
entrada de hiperparatireoidismo primário do núcleo, onde é conferido verbatim)"
— e passou.

**A regra vale para mim igual:** quando o conserto precisa de um fato que vem de
OUTRA fonte, aponte para onde ele é provado; não o transcreva com número dentro
de uma afirmação cuja citação é de outro artigo. É a mesma disciplina do "(16
semanas)" que um auditor teve de desfazer.

⚠️ **E o que isso diz da peneira: ela pegou o revisor, não só o revisado.** Uma
guarda que só reprova trabalho de agente e nunca o meu não estaria medindo o
processo inteiro.

## 🔤 QUANDO A FONTE DE SÍMBOLOS DO PDF NÃO SOBREVIVE (2026-08-09)

O irmão mais grave do sinal de menos comido. No artigo de hipercalcemia
PTH-independente, o texto extraído tinha **zero `µ`, zero travessão, zero `−`,
zero `°`, zero letra grega**, mais `þ` no lugar de `+` e o padrão `2.20e2.55` no
lugar de faixas. O limite da EFSA para vitamina D saía impresso como
**"100 mg/day"** quando o real é 100 **µg** — **erro de 1000×**.

**O extrator conteve:** extraiu o fato **sem número e sem unidade**, com aviso de
conferir no original. Confirmei depois nos 139 fatos publicados: **zero `þ` e
zero faixa corrompida herdados**, e o único valor em mg é prednisolona 40 mg/dia,
verbatim e plausível. O `1-a-hydroxylase` da fonte virou `1-alfa-hidroxilase` —
restauração inequívoca, não invenção.

**Virou AVISO em `verifica-extracao.js`, não reprovação.** A detecção tem falso
positivo ~zero (`þ` não é caractere de português nem inglês; `2.20e2.55` não é
notação clínica), mas reprovar impediria de trabalhar com um PDF ruim — e este
extrato lidou bem. O aviso aparece para quem está conferindo, que é quem age.

⚠️ **A peneira INVERSA foi medida e recusada:** "fármaco dosado em µg escrito em
mg" deu **2 de 2 falsos positivos** na base inteira (fludrocortisona É em mg; o
"grão de 60 mg" é de tireoide dessecada). Ficou como pista no brief.

### ·  E o primo silencioso: o Lancet escreve decimal com PONTO MÉDIO

`0·25`, `–2·5`, `31·4`. O `norm` de `lib/citacao.js` **não** converte `·` em `.`,
então uma afirmação com `0,25` não é reconhecida dentro de `0·25`. Medido: **6
fontes da base** usam ponto médio entre dígitos (uma com 848 ocorrências) e **75
fatos já escrevem o número com `·`** — essa é a saída certa, **escrever como a
fonte escreve**.

⚠️ **Um extrator contornou modificando o arquivo em `textos/`.** A conversão era
correta e está declarada, mas `textos/` é gitignored: **um novo download quebra
todos os `cit_sha` daquele artigo**, e quem re-baixar tem de reaplicar a mesma
conversão. Escrever o número com `·` não tem esse problema.

## ➖ O PDF COME O SINAL DE MENOS, E O CORTE TROCA DE LADO (2026-08-09)

O defeito de maior consequência de prescrição que esta base já produziu, e ele
cabia em um caractere: um fato publicava **`escore T ≤ 2,5`**, sem o menos.
Recuperado sozinho, **diagnostica osteoporose em quem tem densidade NORMAL** e
manda tratar com antirreabsortivo. O hífen do `−2,5` se perdeu na conversão do
PDF, junto com metade da pontuação da tabela.

⚠️ **E o extrator SABIA do risco.** Ele declarou, em `extracao`, ter deixado de
publicar **dois outros** escores T do capítulo 8 exatamente porque tinham perdido
o sinal. Cuidou de dois; o terceiro passou. **Cuidado manual não escala** — é
por isso que virou peneira (`scripts/confere-sinal-de-corte.js`, no `ci-validate`).

### A regra que decide o que vira CI e o que vira técnica de auditor

No MESMO dia eu tinha uma segunda varredura candidata — a da "cabeça perdida"
(citação que começa no meio da frase e deixa o qualificador para trás). Medi as
duas antes de decidir, sobre as 6.625 citações da base:

| varredura | falso positivo | destino |
|---|---|---|
| sinal de escore T/Z | ~zero (corte com `≤` é negativo **por definição**) | **CI** |
| cabeça perdida | ~85%; o gatilho de limiar acertou **0 de 3** | **brief do auditor** |

**Peneira só vira guarda quando o falso positivo é baixo o bastante para que
reprovar signifique alguma coisa.** Alarme ruidoso vira paisagem, e aí não
protege mais nada — a mesma razão pela qual excluí `nucleotídeo` e o núcleo
paraventricular da peneira do selo.

⚠️ **E não generalize esta guarda para "todo número negativo".** Ela é estreita
de propósito: só sabe de escore T e Z, onde a direção é conhecida (OMS:
osteoporose é T ≤ −2,5). Verificador que tenta adivinhar o sinal de qualquer
número volta a ser ruído.

## 🚦 APRESENTAÇÃO ROTEIA, CRISE NÃO — e a linha se traça LENDO A ENTREGA (2026-08-09)

Faltava um critério para o caso em que a área está certa e o artigo é
**parcial**: ele responde a pergunta diagnóstica, mas não a de emergência.

Aconteceu no hipoparatireoidismo. A diretriz de 2022 é de manejo **crônico** —
conferido: ZERO ocorrência de tetany, Chvostek, Trousseau, cálcio intravenoso,
gluconato, infusão, ECG e emergency — e manda mirar a **metade inferior** da
faixa normal. Entregá-la a quem tem doente em tetania repete o acidente da
hiponatremia aguda, que recebia o bloco da correção lenta.

Minha primeira decisão foi excluir tudo: `tetania`, `chvostek`, `trousseau`,
`parestesia perioral`. **Estava larga demais.** *"Formigamento perioral e cãibras
após cirurgia de pescoço"* é a apresentação clássica do hipoparatireoidismo
pós-cirúrgico — pergunta **diagnóstica**, exatamente o que a diretriz responde
(como confirmar, PTH de 12-24 h, quando chamar de permanente). Recusá-la deixava
o médico sem nada numa complicação comum de tireoidectomia.

**O que decidiu não foi o argumento, foi ler o que CHEGA à IA.** Fui conferir e o
bloco entregue **declara sozinho** o que a fonte não cobre — "não responde",
"o que infundir" e "emergênc" aparecem no texto entregue, porque o `conflito` é
repetido no cabeçalho de cada pedaço. Com essa declaração viajando junto, a
apresentação pode rotear; sem ela, não poderia.

**A regra:** quando o artigo cobre parte do assunto, roteie a pergunta que ele
RESPONDE e recuse a que ele contradiz — e só confie nisso depois de **ler o
bloco entregue** e ver o limite declarado lá dentro. `tetania`, `chvostek` e
`trousseau` seguem fora, com sentinela no teste, até existir fonte de
hipocalcemia AGUDA.

## 🔐 TEXTO QUE COPIA OUTRO TEXTO PRECISA DE SELO DO QUE COPIOU (2026-08-09)

A regra do `cit_sha` — citação carrega o hash do que citou — valia para o
ARTIGO. Faltava para o **núcleo**, e o buraco custou uma prescrição invertida
entregue por três dias.

Corrigi o núcleo no marco do PTU da ATA 2026 (**16 semanas**, não o fim do 1º
trimestre; e passado o marco a diretriz declara **DESCONHECIDA** a escolha do
antitireoidiano). O `confere-ressalvas.js` seguiu verde — **e estava certo**:
ele confere `conflito` e `nucleo_citado`, que são campos **do extrato**.

Só que **15 fatos, em 5 extratos, restituem o núcleo por escrito dentro de
`fatos[].afirmacao`**, e ali nenhuma peneira olhava. Um deles dizia: *"prevalece
o núcleo: propiltiouracil no 1º trimestre e metimazol depois"*. Depois da
correção, virou mentira — mandava trocar a gestante de volta para metimazol
exatamente onde a diretriz se recusa a recomendar, e com o marco errado.
Cabeçalho do extrato certo, fato entregue errado.

**Achado por AUDITORIA ADVERSARIAL, não por teste — e por isso virou teste.**
`lib/nucleo.js` + `scripts/confere-nucleo-nos-fatos.js`: fato que menciona o
núcleo carrega `nucleo_sha`; mudou o núcleo, todos reprovam. A reprovação **é** o
pedido de releitura, e reler 15 fatos custa minutos.

⚠️ **Duas armadilhas na própria peneira, as duas achadas medindo:**
1. `/núcleo/` casa com **nucleo**tídeo — "polimorfismo de nucleotídeo único",
   "oligonucleotídeo antissenso". Sem fronteira de palavra, 36 achados em vez de
   17, quase metade de genética e lípides.
2. "núcleo" também é **anatomia** — o núcleo paraventricular hipotalâmico, na
   fisiopatologia do eutireoidiano doente. Sem excluí-lo, dois fatos reprovariam
   **para sempre**, a cada mudança do núcleo.

**Ruído que nunca resolve é o jeito mais rápido de um alarme virar paisagem.**
Peneira larga demais não protege mais — ensina a ignorar.

## 🚨 O HARNESS A/B APROVOU UM RETRATO DE TRÊS DIAS ATRÁS (2026-08-09)

O portão que existe para pegar apagão **passou verde sem medir o meu diff** — e
o portão é justamente o que não pode falhar em silêncio.

O `check.js` **não copia nada**: ele lê o que estiver em `$AB_DIR/main/` e
`$AB_DIR/branch/`. Como reusei `AB_DIR=/tmp/ab` de uma sessão anterior, ele
mediu um `index.html` de **6 de agosto**, imprimiu "OK — mesmos números da main,
nenhum pageerror" e eu quase entreguei em cima disso.

**O que me salvou foi conferir um número que eu já esperava ver mudar:** o
`maiorScript` do branch veio **idêntico** ao da rodada anterior, depois de eu ter
somado ~800 caracteres ao `index.html`. Número que não muda quando deveria mudar
é sinal tão forte quanto número errado.

**Consertado na raiz:** o harness agora compara `branch/index.html` byte a byte
com o `index.html` da árvore de trabalho e **recusa rodar** se diferirem,
imprimindo o comando para repopular. Testado nos dois sentidos — um único byte
a mais já reprova.

⚠️ **A lição que vale além deste script: ferramenta que LÊ de um diretório
externo tem de provar que leu o que você acha que ela leu.** Verde de ferramenta
desatualizada é pior que vermelho, porque encerra a investigação.

## 🔎 O ARTIGO SÓ RESPONDIA A QUEM JÁ SABIA O DIAGNÓSTICO (2026-08-09)

Passei o dia caçando **evicção** — artigo certo cortado pelo teto. Varrendo as
quatro áreas que **cabem** no teto (e que por isso não podem sofrer evicção)
achei o defeito que vem **antes** dela: a área nem é consultada.

A osteogênese imperfeita tem 30k de texto e era alcançável **só pelo próprio
nome**. Das 7 formas naturais de perguntar por ela, **6 caíam em NENHUMA área**:
o sinal (*"escleras azuladas"*), a classificação (*Sillence*), o gene
(*COL1A1*), o achado associado (*dentinogênese imperfeita*) e a apresentação
(*fragilidade óssea*). *"Criança com fraturas de repetição e escleras azuladas"*
— o quadro de livro-texto — não chegava a lugar nenhum.

**A assimetria é o ponto: quem já sabe o diagnóstico chega; quem está
DIAGNOSTICANDO, não.** E quem está diagnosticando é justamente quem precisa.
Vale para toda área pequena: ao varrer, pergunte pelo **quadro**, não pelo nome
da doença — perguntar pelo nome é a forma mais fácil de um teste passar sem
medir nada.

**Cada chave contada antes de entrar**, como manda a regra de dominância:
`esclera` 12 na área contra **1 em toda a base** (e `esclerose`/`esclerodermia`
não casam — divergem na 7ª letra), `col1a1` 11×0, `dentinogenese` 8×0,
`sillence` 4×0, `fragilidade ossea` 6×0, `antirreabsortivo` 5×0.

❌ **`perda auditiva` ficou de fora APESAR de dominar 7 a 1.** É sintoma
genérico, e chave genérica é como área é sequestrada (foi assim que "diabetes"
levou a de Esporte). **Dominância autoriza, mas não obriga: se o termo pertence
à clínica inteira, ele não é chave de área.** A guarda ficou no teste —
*"perda auditiva no hipotireoidismo"* tem de continuar caindo em Tireoide.

## ⚖️ REIVINDICAR NÃO É "O TEXTO MENCIONA?", É "O TEXTO DOMINA?" (2026-08-09)

A regra do tema como reivindicação (nota abaixo) dizia **quando não reivindicar**.
Faltava o outro lado: **quando reivindicar é obrigatório**. Dois casos no mesmo
dia, com desfechos opostos, fecham o critério.

**Caso NTIS — parei.** O artigo da síndrome do eutireoidiano doente perdia a
pergunta *"paciente em UTI com T3 baixo e TSH normal: é doença tireoidiana?"*.
Podia ter enfiado o painel laboratorial no tema, mas **outros artigos de tireoide
discutem T3 e TSH tanto quanto ele**. Reivindicar ali seria escrever para vencer
a sonda. Fica em 1%, registrado como limite.

**Caso hiponatremia aguda — enriqueci.** O bloco do tratamento de emergência
perdia a pergunta do paciente **convulsionando**, e quem chegava no lugar era o
bloco da hiponatremia **crônica**, que manda corrigir DEVAGAR. Aqui o tema
**tinha de** reivindicar: `bolus` aparece **40 vezes nele contra ≤3** em qualquer
vizinho, `salina hipertonica` 19 contra ≤4, `desmopressina` 22 contra ≤4.

**O critério é comparativo, não absoluto.** Antes de pôr um assunto no tema,
conte-o **nos outros blocos da mesma área**:
- o texto **domina** o assunto (ordem de grandeza acima dos vizinhos) → o tema
  **tem de** dizer, e calar é deixar a pergunta com quem responde pior;
- o texto **menciona** e um vizinho entrega mais → **é reivindicação falsa**,
  mesmo sendo verdade que o texto menciona.

⚠️ **E o dano da omissão não é simétrico ao da omissão comum.** Perder um artigo
costuma **omitir** informação; aqui **entregou a recomendação oposta** numa
emergência. Ao varrer uma área acima do teto, a pergunta não é só "chega o
artigo certo?" — é **"quem chega no lugar dele diz o CONTRÁRIO?"**.

## 🎯 A SONDA TAMBÉM TEM ÂNCORA, E ÂNCORA AMBÍGUA MEDE O ARTIGO ERRADO (2026-08-09)

Já sabia que **âncora ambígua** estraga citação. Descobri que estraga **teste**
— e o meu estava estragado.

A asserção de COMPLETUDE identifica o bloco-alvo por um trecho do `tema`. Usei
`tireotoxica` para "tempestade tireoidiana com Burch-Wartofsky 55" e o teste
reprovou acusando **3% de chegada**. Ia registrar como limite de teto. Fui medir
antes: o bloco da crise tireotóxica chegava **INTEIRO — 100%, 15 menções de
"burch"**. O que estava em 3% era o artigo da **GESTAÇÃO**: `tireotoxica` casa
com **7 dos 9 blocos** da área, e o `find` devolve o primeiro. A sonda mediu um
artigo pelo outro.

**O erro de uma sonda é pior que o erro que ela procura**, porque vem assinado
como medição. Uma reprovação falsa manda consertar o que não está quebrado — e
uma aprovação falsa é o que eu já tinha, dormindo em dois casos: `dumping` casa
com o artigo do dumping **e** com o da bariátrica, `prolactinoma` com dois
blocos. Passavam porque o `find` calhava de pegar o certo — **acerto emprestado
dentro do próprio teste**.

**Conserto estrutural, em três partes:**
1. **Âncora e palavra viraram campos separados.** Identificar o bloco e contar
   presença são trabalhos diferentes: a âncora precisa ser *única*, a palavra
   precisa ser *frequente*. Um campo só obrigava a mesma string a ser as duas
   coisas, e é isso que força o uso de termo genérico.
2. **Âncora que casa com dois artigos REPROVA por ambiguidade, antes de medir** —
   com a mensagem dizendo que é ambiguidade. Silenciosamente medir o primeiro é
   o que produziu os dois acertos emprestados.
3. **Artigo partido pelo montador não é ambiguidade.** `(parte 1/2)` e
   `(parte 2/2)` são o mesmo artigo: o sufixo sai antes de comparar, e mede-se o
   maior pedaço.

⚠️ **E confirmei que o aperto não afrouxou a sonda**, mutando as três: âncora
ambígua reprova com o diagnóstico certo; artigo partido não é falso-positivo; e
**evicção de verdade continua pega** — com teto de 60k em vez de 120k, o bloco
da crise despenca de 100% para 0%. Teste verde só vale depois de ficar vermelho
pelo motivo certo.

## 🏷️ O TEMA É UMA REIVINDICAÇÃO, E REIVINDICAÇÃO FALSA ROUBA O ARTIGO CERTO (2026-08-08)

O `tema` do extrato não é enfeite: é o índice pelo qual `deepFor` escolhe o
bloco, e cada assunto listado nele **compete** por toda pergunta daquele
assunto. Reivindicar o que o texto não entrega é tirar a pergunta de quem a
responde.

Medido: o tema do Posicionamento da ABESO prometia `síndrome de dumping`, e o
texto dela entrega **2 ocorrências** contra **78** do artigo dedicado. Empatavam
em 7 pontos — `dumping`(3, no tema) + `bypass`(3, no tema) + `tardio`(1) de um
lado; `dumping`(3) + `tardio`(3) + `bypass`(1) do outro — e **o desempate era a
ordem do montador**. Ou seja: o teste do dumping esteve certo o dia inteiro **por
acaso**, e virou errado no instante em que corrigi o campo `tipo` da ABESO e a
ordem mudou.

**O conserto é no DADO, não no peso.** Tirei `síndrome de dumping` do tema (21
caracteres) e o bloco voltou de **6% para 100%**, com 87 ocorrências entregues.
Nenhuma pergunta de nutrição se moveu.

**Regra: assunto entra no tema quando o TEXTO o entrega.** Antes de listar,
pergunte se outro bloco da mesma área entrega muito mais — se entrega, a
reivindicação é dele. E `tema` é campo de índice, não de citação: corrigi-lo não
mexe em prova nenhuma.

⚠️ Já tinha tentado resolver isto por HEURÍSTICA duas vezes — desempate por tema
mais curto e por menos assuntos reivindicados — e as duas erravam tanto quanto
acertavam (ver a nota do dumping mais abaixo). **O problema nunca foi o
desempate; era a reivindicação falsa.**

## 🧰 A ASSERÇÃO DE COMPLETUDE PEGOU UMA REGRESSÃO NO DIA EM QUE NASCEU (2026-08-08)

Escrevi o bloco COMPLETUDE de manhã, para medir o DANO (o artigo chega inteiro?)
em vez do proxy (qual bloco vem primeiro). Horas depois, ao processar a
auditoria da ABESO, ele reprovou: o bloco de dumping chegava a **6%**.

Era regressão de verdade e eu não a teria visto: a asserção antiga, de ordem,
teria passado — o bloco *aparecia* na entrega, só que truncado a 6%. **"Bloco
entregue" e "bloco entregue INTEIRO" são medidas diferentes, e a distância entre
elas é o artigo.**

## 📏 O QUE UM AUDITOR NÃO SABE, O BRIEF TEM DE DIZER (2026-08-08)

Duas auditorias no mesmo dia, e **as duas quebraram citações da mesma forma**:
para acrescentar conteúdo achado noutro lugar do PDF, costuraram peças distantes
numa elisão só. Uma pulava 6.161 caracteres; outra, **162.904**.

`verifica-extracao.js` barra isso (`GAP_MAX = 400`) e barrou. Mas os dois
auditores só souberam da regra **depois de reprovar**, porque o meu brief não a
mencionava. O defeito é meu, não deles.

**As três saídas legítimas, agora no brief:**
1. **Tornar contígua** — se o buraco é do mesmo assunto, estenda a peça única.
2. **Fato novo** — se a peça distante é outra passagem (célula de tabela, outro
   capítulo), ela não pertence à mesma citação: vira fato próprio com citação
   contígua e ponteiro recíproco.
3. **Encolher a afirmação** — se a peça distante sustentava só um acessório,
   tire-o e aponte onde está provado.

E o corolário que os dois casos ensinaram: **ao encolher a citação, encolha
também a afirmação.** O segundo auditor deixou "(16 semanas)" num ponteiro cujo
lastro tinha ido embora — e o verificador pegou.

## 🔎 CONFERÊNCIA PARCIAL NÃO É AUDITORIA, E NÃO PODE ENTRAR NO CAMPO (2026-08-08)

Com o orçamento em 75% e 0 agentes cabendo, usei a hora conferindo eu mesma a
fatia de MAIOR RISCO do extrato de MASLD/DHGNA (96 fatos): **os 25 fatos que
carregam número, corte ou dose**, um a um contra o texto-fonte.

**Resultado: zero erro.** Conferidos dígito a dígito — FIB-4 <1,3 com VPN ≥90%,
o corte 2,0 no ≥65 anos, >2,67, a zona 1,3–2,67; LSM <8,0 / 8,0–12,0 / >12,0
kPa; ELF 7,7–9,8 e >9,8; CAP 274/311/336 dB/m; os números dos três casos
clínicos; pioglitazona 15→30 mg/dia **com a ressalva de que a eficácia de 15
mg/dia na NASH "remains to be established"**; câncer de bexiga 1 caso adicional
por 899–6.380 tratados ≥3 anos com NNT 4–256 e 2–12; álcool >21 doses/semana
homens e >14 mulheres em 2 anos.

Dois sinais de qualidade que vale registrar: a ressalva de dose **não sumiu**
(é o tipo de hedge que já se perdeu nesta base), e o fato #82 declara uma
**contradição interna do próprio artigo** — a legenda da figura 3 dá cT1
633–794 ms e o texto do caso 2 dá ≤820 ms — em vez de escolher uma das duas.

### E a decisão que importa mais que o resultado

**Não escrevi isso no campo `auditoria`.** Conferi ~26% dos fatos, e só numa
dimensão. Marcar o extrato como auditado seria repetir literalmente o erro já
registrado neste cofre: *relatar "100% auditado" sobre 93%*.

O que a auditoria adversarial ainda tem de fazer e eu **não** fiz:
- os outros 71 fatos, que não têm número;
- se a **citação sustenta** a afirmação (citação íntegra que não prova o que o
  fato diz é defeito tão grave quanto citação errada);
- cabeça de frase encalhada, âncora ambígua, população apagada;
- conferir as **decisões de NÃO-extração** do extrator.

`status-auditoria.js` continua contando o extrato como PENDENTE, que é o certo.
O ganho é outro: quando o agente rodar, ele começa sabendo que a fatia numérica
já foi batida — e deve gastar o esforço no resto, conferindo-me por amostragem
em vez de refazer tudo.

**Regra: conferência parcial vira BRIEF do auditor, nunca campo `auditoria`.**

### O mesmo feito no extrato da ABESO (138 fatos), na mesma hora

- **Zero caractere de controle.** Importa: o `≥` virando U+0002 já transformou
  "IMC ≥30" em "IMC 30" em dois outros artigos da base. Aqui os símbolos vieram
  íntegros.
- **Cortes conferidos:** IMC 25,0–29,9 (sobrepeso) e ≥30,0 (obesidade); VLCD
  definida como **< 800 kcal/dia** com 70–100 g/dia de proteína ou 0,8–1,5 g/kg
  de peso **ideal**; metanálise de 6 RCTs com 16,1 ± 1,6% vs 9,7 ± 2,4% em 4
  meses; n = 6.163 nos estudos com seguimento ≥3 anos.
- **138/138 citações resolvem** com hash conferido, e as amostradas sustentam
  mesmo a afirmação — inclusive a **Classe IIa, Nível A** preservada no fato da
  recomendação formal contra VLCD como primeira opção.

**Um falso alarme meu, registrado porque quase virou acusação.** Vi `≤ 800kcal`
na fonte e o fato dizendo "MENOS de 800" — ia apontar divergência. O `≤ 800` é
critério de inclusão de uma revisão sistemática específica; a **definição** de
VLCD, noutra linha, é `< 800kcal`. O extrator não confundiu os dois contextos.
**Contexto de número é parte do número.**

⚠️ E duas vezes na mesma hora meu `grep` com janela de contexto devolveu ZERO
para números que estavam lá — a hifenização de quebra de linha do PDF (`proteí-
nas`) e o `.` do regex não casando `\n`. **Busca que não acha não prova
ausência**: conferi cada "sumiço" pelo número cru antes de concluir qualquer
coisa, e os três estavam no texto.

### Terceira dimensão medida: dose sem população — resultado NEGATIVO

Varri os 234 fatos dos dois extratos procurando a classe de dano da tabela
pediátrica da ADA: **fato com dose ou corte que não carrega a própria
população**. Saíram 6 candidatos, e ao ler os 6 **nenhum é defeito** — são
definições (o que É uma VLCD, o que É densidade energética, o que É a IDA) ou
afirmações autossuficientes.

O melhor exemplo de por que a peneira sozinha não decide: **efedrina (#81)**
tem dose (60–150 mg) e nenhum marcador de população — e está certo, porque
carrega o próprio dano na MESMA frase: benefício de menos de 1 kg contra
aumento de **2 a 3,5×** em eventos psiquiátricos, gastrintestinais e cardíacos,
**incluindo AVC**. Recuperado sozinho, ele desaconselha. E o fato #80 traz a
**Classe III** para o capítulo inteiro de suplementos.

**Risco que viaja junto da dose dispensa marcador de população.** A pergunta
certa nunca foi "tem a palavra adulto?", é *"o que este fato responde se for
recuperado sozinho?"*.

## 🏷️ UMA PALAVRA A MAIS NO CAMPO `tipo` REBAIXOU UMA DIRETRIZ INTEIRA (2026-08-08)

O professor perguntou se os 10% extraídos já estavam no ar e mandou a regra:
**manter sempre a versão mais atual do documento**. Fui auditar o acervo por
ano/versão e achei outra coisa, pior, no meio do caminho.

O Posicionamento Nutricional da ABESO — documento de sociedade, 138 fatos —
veio com:

```json
"tipo": "posicionamento de sociedade (diretriz)"
```

A string está **correta em português** e é descritiva. Ela só não é uma das nove
chaves de `PESO_TIPO`. O código fazia `PESO_TIPO[t] != null ? PESO_TIPO[t] : 6`
e atribuía **peso 6 — `outro`, o tier mais baixo, abaixo de relato de caso** — a
uma diretriz de sociedade.

O estrago é silencioso e cai exatamente onde dói: `_peso` é o **primeiro**
critério de ordenação do montador, e Obesidade tem 322k contra teto de 120k. O
artigo ficava em **último** na área mais espremida da base — primeiro a ser
cortado sempre que a relevância empatasse. Nenhum fato errado, nenhuma citação
falsa, nenhum aviso.

**Conserto do dado é metade. A outra metade é o silêncio:** o montador agora
**ABORTA** em tipo fora do vocabulário, com a lista do que é aceito. Mesma
decisão já tomada em `conflito_direcao` — **padrão silencioso em campo de
autoridade é o defeito, não a conveniência**. Quem escrever um tipo novo escolhe
conscientemente entre acrescentá-lo ao vocabulário ou usar uma chave existente.

### O efeito colateral que virou correção de MEDIDA

Corrigir o tipo mudou a ordem do montador (o bloco nutricional subiu de último
para 2º) e **reprovou o teste de ordem do dumping** — que eu tinha escrito
horas antes para guardar uma evicção real.

Fui medir antes de reagir: o bloco de dumping continuava chegando **100%
inteiro, com 85 menções**. A asserção reprovava uma mudança que era melhoria.

O defeito original nunca foi de ordem — era **evicção** (chegavam 6 menções em
vez de 85). "Qual bloco vem primeiro" pegava o defeito, mas mede uma coisa mais
estreita que o dano. Entrou o bloco **COMPLETUDE**: o artigo que responde chega
≥90% inteiro e com N ocorrências mínimas da palavra, independente de ordem.
Conferido por mutação — desfazer as palavras-cola reprova.

**Asserção de ordem é proxy; meça o dano quando puder.**

### E os dois desempates estruturais que MEDI e não enviei

Tentei os dois candidatos óbvios para "tema-lista vence tema-focado":

| desempate | resultado |
|---|---|
| tema mais **curto** | 5 perguntas melhores, **2 piores** |
| **menos assuntos** reivindicados no tema | erra nos mesmos lugares |

Os dois quebram no mesmo ponto: o bloco de eventos adversos dos AR GLP-1
reivindica **60 assuntos** e **é** a resposta certa para "náusea com
semaglutida"; e "hiponatremia de 118" troca o algoritmo pelo bloco do **idoso**,
estreitando a população sem que a idade tenha sido dita. **Tema-lista não é
sinal de irrelevância** — um posicionamento de 260 páginas cobre 90 assuntos
mesmo. Nenhum dos dois foi enviado.

## 🔢 CONTAR OCORRÊNCIA NÃO É MEDIR CONTEÚDO (2026-08-08)

A regra que venho aplicando o dia inteiro — **"onde está o conteúdo é"**, nascida
da correção da exenatida — quase me fez estragar uma decisão certa. Ela precisa
de uma ressalva, e a ressalva custou uma leitura.

Fiz a varredura ESPELHO da anterior: em vez de "que conteúdo não tem rota?",
perguntei **"que rota aponta para área que não tem o termo?"**. Saiu, entre
outros:

```
alca fechada  -> Diabetes   mas o conteúdo está em: Endocrinologia do Esporte:6
```

Seis ocorrências lá, ZERO no bloco que Diabetes entrega. Pela regra do conteúdo,
mudança óbvia — e o cofre ainda registra `alça fechada` como "o mais grave" dos
buracos consertados, o que tornava tentador achar que eu o tinha consertado para
o lado errado.

**Fui ler as seis ocorrências. Todas são cláusula de EXCLUSÃO:**

> "⚠️ LIMITE DE APLICAÇÃO: todas as recomendações de alvo glicêmico e de
> carboidrato deste consenso **NÃO se aplicam a sistemas híbridos de alça
> fechada**."

O artigo de exercício não ensina nada sobre alça fechada — ele repete cinco
vezes que as tabelas dele **não valem** para quem a usa. Mandar a pergunta para
lá entregaria um bloco que menciona o assunto só para dizer "isto não é para
você". Diabetes não tem a expressão, mas tem o conteúdo vizinho que serve (CSII,
incrementos de 0,025 U/h, bomba aumentada por sensor) e o núcleo carrega a
recomendação da ADA 2026. **A decisão antiga estava certa.**

**A ressalva, então:** frequência é uma PISTA de onde está o conteúdo, não uma
medida dele. Antes de mover uma chave por contagem, leia as ocorrências —
menção pode ser negação, ressalva, referência bibliográfica ou nome de estudo.
Guardei o raciocínio como comentário na própria linha da bateria, porque a
próxima varredura vai reencontrar exatamente esta contagem e sentir a mesma
tentação.

**Achado de acervo que saiu disso:** a base **não tem conteúdo substantivo de
alça fechada / AID em lugar nenhum**. O núcleo diz que é o método preferido no
DM1; a camada profunda tem CSII e bomba aumentada por sensor, que é uma geração
anterior. Falta artigo — é material do professor, não conserto de código.

### Dois outros "achados" da mesma varredura que NÃO eram achados

- **`hipogonadismo` → Endocrinologia Masculina devolve 0 caracteres**, com 20
  ocorrências em Neuroendocrinologia. É correto: aquelas 20 são hipogonadismo
  CENTRAL por prolactinoma/hipopituitarismo, e mandar "reponho testosterona?"
  para o artigo da hipófise é **trocar buraco por erro** — a mesma decisão já
  registrada para `células germinativas`. O núcleo tem o posicionamento
  SBEM-SBU-ABEMSS, então a pergunta é respondida de lá.
- **Chaves de nome de área, marca e grafia variante** (`osteometabolismo`,
  `mounjaro`, `craniofaringeoma` com "e") aparecem na lista por construção: elas
  existem justamente para casar o que o TEXTO não escreve. Ruído da medida, não
  defeito.

## 🔦 INVERTER A PERGUNTA DA VARREDURA — "que conteúdo NENHUMA pergunta alcança?" (2026-08-08)

Duas varreduras no mesmo dia, e a segunda rendeu dez vezes mais que a primeira
porque a pergunta era outra.

**A primeira** foi bloco a bloco: uma sonda escrita à mão por bloco, medindo se
ele chega. Custou caro em atenção e achou **um** defeito.

**A segunda** foi ao contrário e é mecânica: listar os termos **distintivos** de
cada área — os que concentram ≥85% das ocorrências numa área só, com frequência
mínima — e perguntar quais **não têm rota nenhuma**. Deu **137**, e nove eram
sérios, incluindo `macroprolactinoma`/`microprolactinoma` (84 ocorrências
mudas), `nao-HDL` (44) e `triglicerides` (65).

```js
// distintivo = ≥85% das ocorrências numa área; sem rota = canonArea() vazio
if (freq[k][dom] / tot < 0.85) continue;
if (D.canonArea(k)) continue;      // já alcançável
achados.push([freq[k][dom], dom, k]);
```

**Por que isto NÃO é a tautologia do `confere-alcance.js`.** Aquele script
derivava a sonda do próprio bloco e media se o bloco vencia a si mesmo — sempre
vencia. Este não mede vitória nenhuma: mede se **existe alguma pergunta capaz de
alcançar** um conteúdo que já está na base. Termo com conteúdo e sem rota é
inalcançável por definição, não por comparação.

### O padrão que os achados têm em comum

Quase todos são **a forma que o mapa tem × a forma que o médico digita**:

| no mapa | mudo | ocorrências |
|---|---|---|
| `prolactinoma` | `macroprolactinoma`, `microprolactinoma` | 84 |
| `hipertrigliceridemia` | `triglicerides` | 65 |
| `trulicity` (marca) | `dulaglutida` (genérico) | 10 |
| `anovulacao` | `ovulacao` | 29 |
| `letrozol` | `clomifeno` | 19 |
| `apneia obstrutiva do sono` | `apneia do sono` | 41 |
| `desmielinizacao osmotica` (consequência) | `supracorrecao` (o erro) | 38 |

**A regra: para cada chave do mapa, pergunte qual é a OUTRA palavra para a mesma
coisa** — a sigla, o genérico ao lado da marca, a forma curta ao lado da
extensa, o achado ao lado da doença, a causa ao lado da consequência. É onde os
buracos se escondem, porque quem escreveu a chave já sabia o que queria dizer.

### E uma exceção à regra do conteúdo, que precisou ser medida para existir

`cgm` tem 45 ocorrências em Esporte e 14 em Diabetes. Pela regra que vale desde
a correção da exenatida — **onde está o conteúdo é** — iria para Esporte. Pus,
medi e **voltei**: chave de Esporte não é só um peso, é **gatilho da promoção
condicional**. CGM é dispositivo, não esporte, e alargar o gatilho quebrou
*"tempo no alvo no CGM: qual a meta?"* e *"CGM no diabetes tipo 2 em insulina"*,
que foram parar em endocrinologia do esporte.

**"Onde está o conteúdo" decide o DESTINO, não o TIER.** Quando a chave também é
gatilho de regra, o gatilho manda.

## 🧹 A PALAVRA DE PERGUNTA VALIA 3 PONTOS, E EXPULSOU UM ARTIGO INTEIRO (2026-08-08)

Achado ao varrer, bloco a bloco, se algum conteúdo de Obesidade tinha sido
expulso pelo teto depois de a área ganhar 84k de nutrição. Um tinha, e era o
pior candidato possível: **o artigo de síndrome de dumping não chegava à
pergunta que diz "dumping"**.

```
"dumping tardio dois anos após bypass: como investigo?"
   bloco de DUMPING  (tema de   129 chars, 78 ocorrências da palavra) → 12 pts
   bloco de CIRURGIA (tema de 1.804 chars)                            → 13 pts  ← vencia
   bloco de NUTRIÇÃO (tema de 2.466 chars)                            → 13 pts  ← vencia
```

Chegavam **6** menções de dumping em vez de 85. A causa não é o teto: é que
`apos`, `anos` e `dois` caem dentro de um tema longo e lá valem **+3 cada**, a
mesma pontuação da palavra que descreve o assunto. **Tema longo é lista de
palavras-chave, e lista de palavras-chave casa quase toda pergunta da área.**

Conserto: as palavras de pergunta entraram em `VAZIAS`. `dumping` voltou de 6
para 85 ocorrências e o bloco certo vem em primeiro.

### E a metade que eu NÃO enviei, que é a lição de verdade

O conserto óbvio para "tema-lista vence tema-focado" é desempatar pelo tema
mais curto. Escrevi, passou na bateria, e **não fui em frente** — porque a
bateria não media aquilo (a mutação do desempate passava). Antes de manter,
rodei varredura diferencial em 25 perguntas realistas: **4 mudavam de bloco e
DUAS ficavam piores.**

- *"náusea com semaglutida"* perdia o artigo que **é** sobre eventos adversos
  gastrintestinais dos AR GLP-1 — cujo tema é longo — para o de farmacoterapia.
- *"hiponatremia de 118"* trocava o **algoritmo diagnóstico** pelo bloco do
  **idoso**, estreitando a população num caso em que a idade não foi dita. É
  exatamente o dano que a auditoria da tabela pediátrica já tinha achado.

Dois melhores e dois piores não é conserto, é cara-ou-coroa — e eu estaria
enviando um selo verde por cima. **Ficou o que mede; saiu o que empata.** Mesma
decisão de quando apaguei o `confere-alcance.js`: peneira que não distingue não
vira peneira só porque o número dela é bonito.

**Regra: mutação que passa é ordem de investigar, não permissão de enviar.** Se
a bateria não vê a mudança, ou eu acho o caso que a prova, ou ela não vai.

## 🧪 A PERGUNTA DE TESTE CARREGAVA A RESPOSTA NO BOLSO (2026-08-08)

Segunda cara do **acerto emprestado**, e esta é minha, de escrever teste. A
primeira (abaixo) era empate desfeito por ordem arbitrária. Esta é pior porque
parece rigor: eu tinha acabado de acrescentar 24 termos de nutrição ao roteador
e escrevi 15 perguntas novas para medi-los. Todas passaram. Rodei a mutação —
tirar o termo e exigir que a bateria reprove — e **seis passaram com o conserto
desfeito**.

O motivo é banal e por isso perigoso:

```
['jejum intermitente funciona para emagrecer?', 'Obesidade']   ← `emagrecer` já roteava
['dieta low carb na obesidade',                'Obesidade']   ← `obesidade` já roteava
['escore-Z do IMC na crianca',                 'Obesidade']   ← `imc` já roteava
['adocante aspartame faz mal?',                'Obesidade']   ← `adocante` cobria `aspartame`
```

A pergunta continha uma chave **antiga** que sozinha dava o destino certo. O
teste media o mapa de ontem e dizia "verde" sobre o de hoje. Note que a última
é a mais traiçoeira: `adocante` e `aspartame` eram **as duas novas**, e mesmo
assim a genérica escondia a nomeada — dentro do próprio lote recém-escrito.

**A regra que ficou: pergunta de teste de roteamento não pode conter nenhum
termo que já roteasse para o destino esperado.** A forma de conferir é
mecânica e leva 30 segundos — `git stash` no arquivo do roteador, rodar as
perguntas novas contra a árvore antiga, e toda que já devolver o destino certo
está emprestada:

```
git stash push lib/clinical-deep.js -q
node -e "…canonArea(p)…"   # quem já acerta aqui NÃO mede nada
git stash pop -q
```

Depois disso as perguntas viraram `posso indicar jejum intermitente?`,
`dieta low carb tem risco?`, `escore-Z de 2,5 na crianca`,
`aspartame causa cancer?` — todas devolviam `(vazio)` antes do conserto, e
todas reprovam quando a chave sai. **Doze mutações, uma chave por vez, doze
reprovações.**

Corolário que já vale para a próxima vez: **mutação em lote mente.** Mutei
`cetogenica` e `dieta cetogenica` juntas e a bateria reprovou, o que me deixaria
satisfeita — mas era a frase longa segurando tudo. Só ao mutar a curta sozinha
apareceu que ela não tinha nenhuma pergunta própria. É a mesma lição da fronteira
de palavra, logo abaixo: **mutação incompleta parece mutação.**

## 🔤 A SIGLA NUNCA PONTUAVA, E O BLOCO CERTO VINHA POR ACASO (2026-08-08)

Achado ao investigar uma regressão que eu mesma causei. `deepFor` filtra os
termos da pergunta por `length >= 4` — para tirar "com", "de", "em". Só que isso
derrubava junto **as siglas que decidem a pergunta**: `EHH`, `CAD`, `SOP`,
`PTH`, `GH`, `T4`.

Medido: *"EHH em idoso com glicemia 900"* pontuava só em `idoso` e `glicemia`.
**Quatro blocos empatavam em 4 pontos** e o desempate era a ordem de autoridade
do montador — o bloco certo vinha em primeiro **por acaso**, e parou de vir
assim que outro bloco entrou na frente dele na ordem.

Ou seja: o teste que eu tinha escrito para o EHH passava por coincidência, não
por acerto. **Empate desfeito por ordem arbitrária é acerto emprestado.**

### O conserto tem DUAS metades, e a segunda eu aprendi quebrando

1. **Token curto passa quando é termo clínico conhecido** (está em `TERMOS` ou
   `CANON`). Palavra que o mapa reconhece nunca é ruído, tenha o tamanho que
   tiver — e ruído genérico de 3 letras continua fora, porque não está no mapa.
2. **Sigla precisa de FRONTEIRA DE PALAVRA.** Ao deixar `CAD` pontuar, o
   casamento por substring passou a achar `cad` dentro de *"cadeia"*, *"década"*
   e *"aplicador"* — e *"paciente com CAD e pH 7,1"* devolveu o bloco de **DM1**
   em primeiro. Token de 3 letras num texto de 40 mil casa em quase tudo.

Conferido por mutação, uma de cada vez: desfazer (1) reprova; desfazer (2)
**sozinha não reprovava** — porque eu tinha mutado só a busca no texto e deixado
a fronteira no `tema`. Mutação incompleta é mutação que mente. Refeita nos dois
lugares, reprova.

## 🔀 UM EXTRATO PODE ALIMENTAR DUAS ÁREAS (2026-08-08)

A regra "o fármaco cede para a doença nomeada" está certa e é testada — mas
Obesidade guardava o **único** bloco da base sobre evento gastrintestinal de AR
GLP-1, e **7 das 9 linhas da tabela do artigo são de pacientes com DM2**. Medido:
*"DM2 em semaglutida com vômito, reduzo a dose?"* canoniza para Diabetes e o
bloco **não chegava**.

Dava para remendar com composto (`nausea com glp-1` → Obesidade), mas seria
mentira sobre a natureza do assunto: evento gastrintestinal de incretina
acontece nas duas populações. O campo `area` passou a aceitar **lista**.

⚠️ **Não é de graça:** o bloco entra inteiro nas duas áreas e ambas têm teto de
120k. Diabetes foi de 234k para 284k. Declare duas áreas só quando a pergunta
REAL chega pelas duas — e rode a bateria depois, porque foi exatamente essa
duplicação que expôs o defeito da sigla acima.

## 🔢 UM CAMPO, UM SIGNIFICADO — e o "100% auditado" que era 93% (2026-08-08)

O professor perguntou "% de extração?" e eu dei **três números seguidos, dois
errados**:

1. "Obesidade em 2/5 auditados" — errado: a cirurgia bariátrica **já** estava
   auditada e eu não contei;
2. "30/30, **100% auditados**" — errado ao contrário: contei como auditoria o
   que era **anotação do extrator**.

A causa: `auditoria` tinha **três formatos convivendo** — string do legado,
objeto com `achado` (auditoria de verdade) e objeto com `escopo`/`nao_extraido`,
que o extrator usava como bloco de notas. Cada contagem improvisada acertava um
formato e errava outro.

**O segundo erro é o perigoso**, e é a mesma família das peneiras cegas: um
"100% auditado" falso **encerra o assunto**. Ninguém volta a olhar o que já está
verde. Errar para menos custa uma conferência; errar para mais apaga o trabalho
que falta.

**Conserto em três camadas, porque contagem improvisada foi o que falhou:**

| camada | o que faz |
|---|---|
| origem | a nota do extrator mudou para o campo `extracao` |
| contagem | `scripts/status-auditoria.js`, único, com a definição num lugar só |
| trava | o mesmo script **reprova** `auditoria` malformada, e está no `ci-validate` |

**Regra do campo, daqui em diante:**
- `auditoria` → SÓ auditoria adversarial (string legada ou objeto com `achado`);
- `extracao` → decisões e limites de quem extraiu (o que ficou de fora, tabela
  pulada, discordância interna do artigo).

E a distinção que a trava faz de propósito: ela **exige o formato** e apenas
**informa a cobertura**. Exigir 100% de auditoria por CI só faria alguém marcar
o campo para o vermelho sumir — que é o oposto do que ele serve.

## 📉 O MEDIDOR DO FREIO SUBCONTAVA — agente que termina e não relata (2026-08-08)

O extrator da cirurgia bariátrica gravou o extrato **inteiro** (138 fatos, todos
com citação, `tema` escrito) e **morreu sem mandar a notificação**. `ListAgents`
não o via mais e o `subagent_tokens` dele nunca chegou.

**O medidor marcava 83%. A conta real era 96%.** Um agente inteiro — ~14% da
janela — sumia da soma, e eu teria lançado outro sobre capacidade inexistente.

É a mesma doença das peneiras cegas, e é pior num medidor de FREIO: ele erra na
direção que **libera**. Peneira cega dá selo verde; medidor que subconta dá sinal
verde.

**Conserto:** `--estimado`, que registra o gasto de quem não relatou **separado
do medido**. A calibração do TETO continua limpa (depende só de número real) e a
segurança usa a soma dos dois. O script mostra as duas linhas e diz que fração
do total é chute.

```
6 agente(s) relatado(s) · 1655k MEDIDO · 83%
+ 1 agente(s) que NÃO relataram · 270k ESTIMADO
= 1925k de ~2000k · 96% (14% disso é estimativa)
```

**Regra: ao ver `ListAgents` vazio com trabalho novo no disco, procure o agente
que não relatou e registre o gasto dele.** Extrato completo sem notificação
correspondente é o sintoma.

## 💊 A PALAVRA QUE SE DIGITA ≠ A PALAVRA QUE ESTÁ NO ARTIGO (2026-08-08)

Quinta ocorrência do mesmo padrão em um dia, e agora dá para nomear a família:

| o que o artigo escreve | o que o médico digita | devolvia |
|---|---|---|
| cetoacidose diabética | **CAD** | `""` |
| estado hiperglicêmico hiperosmolar | **EHH** | `""` |
| lipoproteína(a) | **Lp(a)** | `""` |
| craniofaringioma | **craniofaringeoma** | `""` |
| semaglutida, tirzepatida, liraglutida | **Ozempic, Mounjaro, Saxenda** | `""` |

Em todos, o conteúdo estava na base, verificado, e a palavra real não estava no
mapa. Os nomes comerciais são o caso mais gritante porque **o paciente também
escreve assim**: semaglutida tem 88 ocorrências em Obesidade, tirzepatida 29
(mais 26 no núcleo), e `ozempic`/`mounjaro` devolviam nada.

**O buraco é invisível para quem lê o código** — o mapa parece completo, porque
cada entrada dele está certa. Só medição com vocabulário humano acha, e é por
isso que `scripts/test-caminho-clinico.js` é escrito à mão (ver a nota sobre a
peneira de alcance que não pode existir).

**Ao extrair artigo novo, pergunte: como o paciente chama isso?** Sigla,
abreviação, nome comercial e grafia alternativa entram no mapa junto com o termo
técnico. Nomes comerciais entram com peso de FÁRMACO, então cedem para qualquer
doença nomeada na frase — "Ozempic em paciente com DM2 e DRC" continua indo para
Diabetes.

## 🕳️ O FATO QUE DECLARA A PRÓPRIA CEGUEIRA (2026-08-08)

O artigo de eventos gastrintestinais dos AR GLP-1 é de dez/2022 e **não trata**
de jejum pré-operatório, risco de aspiração nem gastroparesia estabelecida —
justamente a pergunta em que mais se erra hoje (a orientação da ASA é de
jun/2023, posterior).

O extrator fez duas coisas certas, e a segunda não estava no briefing:

1. **Não pôs esses termos no `tema`**, para o bloco não ser escolhido nessas
   perguntas;
2. **gravou um fato que declara o limite de escopo** — *"FORA desse escopo
   declarado … este documento não traz nenhuma recomendação, e não deve ser
   usado como…"*.

O (1) sozinho não bastaria: a pergunta chega a Obesidade por outras palavras, e
o bloco vem junto de qualquer jeito. Com o (2), a IA recebe **a declaração
explícita de que a fonte não sabe** — que é a única defesa contra confabular
quando o bloco é recuperado fora do escopo dele.

**Regra: quando um artigo é notoriamente omisso num ponto vizinho e perigoso,
grave um fato dizendo isso.** Silêncio parece cobertura; declaração de silêncio
é cobertura de verdade.

## 🆔 O fileId DO DRIVE TEM 33 CARACTERES — não corte ao montar briefing (2026-08-08)

Passei `1aTQRBGfXP56X1QlWEPb` (20 chars) no briefing de extração; o real é
`1aTQRBGfXP56X1QlWEPb8M5VFmD-ZTcrX`. O agente não conseguiu baixar do Drive,
achou o completo em `fila-extracao.json` e seguiu — mas gastou rodadas nisso, e
se tivesse "consertado" adivinhando teria baixado outro artigo.

`verifica-extracao.js` resolve o texto por `ext.fileId`, então o ID errado
quebraria a verificação depois. **Copie o ID de `fila-extracao.json` ou do
`manifest.json`, sempre inteiro.**

## 🛑 O GERADOR RECUSA EXTRATO VAZIO, E ISSO ME SALVOU (2026-08-08)

Rodei `monta-base-profunda.js` com um agente de extração ainda no meio do
trabalho. Ele tinha criado o arquivo do extrato com **0 fatos**, e o gerador
reprovou: *"extrato sem nenhum fato · A verificação REPROVOU — nada será
gerado."*

Sem essa recusa eu teria assado na base um artigo vazio e publicado o resultado
como se estivesse completo. **Regra: com agente de extração rodando, remontar a
base só depois da notificação de término** — arquivo que já existe no disco não
quer dizer trabalho terminado.

## 📏 CONDIÇÃO DE COLETA: A REGRA GANHOU GUARDA, E A GUARDA SÓ FICOU BOA NA 3ª TENTATIVA (2026-08-08)

A regra estava no cofre e não tinha nenhuma verificação:
`scripts/test-coleta-nucleo.js` agora a aplica no `ci-validate`.

**Três versões, e as duas primeiras mentiam:**

1. **Ruído.** Marcava 11 entradas, 7 eram lixo — casava "insulina" em
   *"prescrever glucagon para todos em insulina"* (fármaco, não exame) e "GH" em
   *"tratar com GH"*. Conserto: exigir **contexto de dosagem** antes do analito
   (dosar, colher, rastrear, "diagnóstico bioquímico por"…).
2. **Distância.** Procurava a condição em QUALQUER lugar da entrada — e entrada
   de núcleo tem até 2 000 caracteres. Apaguei *"pela manhã, sentado, SEM
   restringir sódio"* do hiperaldosteronismo para ver a peneira reprovar e **ela
   passou**: a palavra "sódio" reaparecia 900 caracteres adiante, em *"restrição
   de sódio (<5 g de sal/dia)"*, que é TRATAMENTO. Conserto: janela de 130
   caracteres em volta do analito.

**Condição de coleta que não está ao lado do exame não é condição de coleta, é
coincidência de vocabulário.**

E a peneira carrega **controle positivo**: as entradas de hiperaldosteronismo e
de incidentaloma adrenal declaram a coleta e não podem ser marcadas. Sem
controle positivo não dá para distinguir peneira limpa de peneira cega — que é o
defeito que já cegou três scripts deste repositório.

### A lacuna que ficou, e por que não a consertei

A entrada de **feocromocitoma** manda pedir metanefrinas plasmáticas livres e
**não diz em que posição colher** — e a posição é a causa clássica de
falso-positivo desse rastreio, que manda o paciente para tomografia e teste
genético à toa.

**Não há nenhum artigo de feocromocitoma no acervo** (conferido na base
profunda inteira). Escrever a condição de memória é exatamente o que este
projeto proíbe. Está registrada como `PENDENTES` dentro do próprio script — em
código, não em promessa —, e sai de lá quando entrar material.

## 🚫 A PENEIRA DE ALCANCE QUE EU TENTEI ESCREVER NÃO PODE EXISTIR (2026-08-08)

Quatro áreas passam do teto de 120k (Diabetes 234k, Endocrinopatias 170k,
Lípides 150k, Neuroendocrinologia 137k) e nelas **bloco não escolhido é bloco
que não existe**. Quis automatizar a conferência: para cada bloco, montar uma
pergunta e ver se ele volta.

**Escrevi duas versões e as duas passavam com teto de 20 000**, o que é
impossível se estivessem medindo alguma coisa.

O motivo é estrutural: `deepFor` dá **prioridade absoluta ao bloco mais
relevante** e o CORTA em vez de pulá-lo. Qualquer sonda que eu derive *do
próprio bloco* — do `tema` ou do vocabulário exclusivo do texto — torna aquele
bloco o mais relevante, e ele sempre volta. A medição é tautológica.

O caso real é o oposto: o EHH sumiu porque a pergunta usava uma sigla que **não
está no bloco**, e as palavras que ela tinha ("idoso", "glicemia") casavam
melhor com os irmãos. Detectar isso exige saber que médico escreve "EHH" para
"estado hiperglicêmico hiperosmolar" — **conhecimento de domínio, não extraível
do texto por máquina.**

**Apaguei o script em vez de versionar um selo verde que mede tautologia.** O
que protege de verdade é a bateria escrita à mão em
`scripts/test-caminho-clinico.js`, com a sigla e a grafia que o médico usa. Foi
ela que achou, na mesma sessão, `Lp(a)` sem rota com **45 ocorrências** na base
— `lipoproteina(a)` roteava, mas ninguém digita isso.

**Regra: automatize a peneira quando a máquina souber o que procurar. Quando o
sinal é vocabulário humano, a bateria é escrita à mão, e isso não é preguiça —
é a única coisa que funciona.**

## 📡 O RELATO DO AGENTE ERRA PARA OS DOIS LADOS (2026-08-08)

Já estava registrado que agente exagera achado. Hoje apareceu o **oposto**, que
é mais perigoso porque não levanta suspeita: o auditor do DM1 listou os termos
de roteamento faltantes e deu `glucagon nasal`, `lua de mel` e `remissão
parcial` como **"já roteiam corretamente"**.

Medi os três: **devolviam vazio**. Como eu estava conferindo a lista dele de
qualquer jeito, achei — mas se tivesse aceitado a parte "está tudo bem" do
relato sem medir, os três teriam ficado mudos indefinidamente.

**Conferir a acusação e conferir a absolvição custam o mesmo.** Ao processar
relato de agente, meça as duas colunas.

No total eram **nove** assuntos do Seminar de DM1 com conteúdo na base e
`canonArea` devolvendo `""` — incluindo `alça fechada`, que o núcleo chama de
método **preferido** no DM1 em todas as idades (ADA 2026).

## 🫥 O SÍMBOLO QUE VIROU BYTE INVISÍVEL (2026-08-08)

O extrator de PDF trocou `≥` por **U+0002** em oito lugares do artigo de
pré-diabetes. O efeito no extrato:

> "IMC de 25,0 a 29,9 para sobrepeso e **30** para obesidade"

quando a fonte diz **≥30**. O corte virou PONTO em vez de PISO — quem tem IMC 34
deixa de ter obesidade pela leitura do fato. O mesmo apagou o `≥` de
`≥150 min/semana` e dos três porteiros da metformina (`IMC ≥35`, `jejum ≥110`,
`HbA1c ≥6,0%`).

⚠️ **Nenhuma peneira pegava, e não é descuido delas:** `norm()` normaliza aspas,
travessões e espaços, mas não toca em caractere de controle. A citação resolve,
o hash confere, o verificador aprova — e o operador de comparação simplesmente
não está lá. É primo da âncora ambígua: **a prova está íntegra e mesmo assim diz
outra coisa.**

`scripts/confere-controle.js` mostra onde olhar, priorizando o que está colado
em número (que é o que muda conduta). **Ele avisa e não reprova de propósito**:
o conserto exige abrir o PDF e decidir qual símbolo era (`≥`, `≤`, `±`, `→`), e
isso é leitura humana.

Varrido o acervo inteiro: **1 artigo, 8 ocorrências, todas `≥`, todas já
corrigidas.** Rodar ao extrair artigo novo.

E o contraexemplo que impede o conserto automático burro: no mesmo artigo,
"TRIPOD … IMC 30" está **certo sem** o `≥` — o cabeçalho da tabela diz
`bmi at entry, mean (sd)`, então ali 30 é média, não corte.

## 🧪 MUTAÇÃO NO DEFEITO QUE VOCÊ ACABOU DE CONSERTAR (2026-08-08)

Consertei uma cegueira real do `deepFor`, escrevi `scripts/test-caminho-clinico.js`
com **46 medições**, reintroduzi o defeito por mutação para conferir a rede — e
**as 46 passaram alegremente.**

Peneira que não pega o defeito que acabou de ser consertado não é rede, é
enfeite. E o motivo era de FORMULAÇÃO: eu media "o bloco chega?" quando o que
discrimina é "**qual bloco vem primeiro?**". Diabetes tem 232k contra teto de
120k — o bloco existir não quer dizer nada; ele ser escolhido é tudo.

Com a cegueira, *"Pré-diabetes pode reverter sozinho?"* devolvia o bloco de
hiperglicemia por **corticoide** em primeiro, e o de pré-diabetes sumia inteiro.
Essa é a medição que virou teste.

**Regra: todo conserto ganha uma mutação, e a mutação tem de REPROVAR antes de o
conserto ser considerado feito.** Já falhou assim três vezes hoje (a M4 das
ressalvas, o teto do bloco clínico duas vezes).

## 🔎 A CEGUEIRA DO `deepFor`: o nome da área era removido como SUBSTRING (2026-08-08)

Achado pela auditoria do pré-diabetes. A linha era:

```js
const alvo = deacc(tema || area).replace(deacc(canon), ' ');
```

`String.replace` com padrão de TEXTO casa **substring** e troca só a **primeira**
ocorrência. Em Diabetes:

```
"pre-diabetes pode reverter sozinho?"  →  "pre-  pode reverter sozinho?"
```

e o que sobrava, `pre`, morria no filtro de 4 caracteres. A palavra mais
discriminante da pergunta valia **zero** na escolha do bloco. `canonArea`
acertava a área sempre — a cegueira era só na seleção do bloco, que é onde
ninguém olhava.

Conserto: tokenizar **preservando o hífen** e derrubar o nome da área só quando
ele é token inteiro. E emitir cada composto **também partido** (`basal-bolus` →
`basal-bolus`, `basal`, `bolus`), senão o conserto seria troca e não ganho: um
bloco que escreve "basal e bolus" deixaria de casar.

## 🔗 O HASH PROVA QUE O TEXTO NÃO MUDOU — NUNCA QUE ELE VEIO DO LUGAR CERTO (2026-08-08)

Dois fatos **pediátricos** citavam a tabela de **ADULTO**, com `cit_sha`
conferindo e `verifica-extracao.js` aprovando. Não era erro de digitação: as
duas tabelas repetem linhas inteiras, palavra por palavra.

**A causa é estrutural e vale para a base toda.** `lib/citacao.js › referenciar`
localiza a citação com `indexOf(alvo, 0)` — **ancora sempre na PRIMEIRA
ocorrência**. O extrator original tinha a trava certa (um marco de
desambiguação, com comentário explícito de que "as tabelas de adulto e de
criança repetem linhas inteiras") e **a migração para offset a desfez em
silêncio**. Como a tabela de adulto vem antes no artigo, todo texto repetido
migrou para ela.

E o hash não pega, por construção: as duas ocorrências resolvem para o mesmo
texto, logo para o mesmo hash.

`scripts/confere-ancoragem.js` mede isso, e está no `ci-validate`. Medido em
4.441 citações: **71 ambíguas, 0 de risco.**

**A triagem é o que torna a peneira usável.** Ambíguo não é errado:
- **benigno** (a maioria) — recomendação impressa no quadro-resumo e de novo no
  corpo. Texto igual, sentido igual, tanto faz onde ancora. Só avisa.
- **de risco** — o fato **fala de população** (criança/adulto/gestante) e ancora
  na 1ª ocorrência de um texto repetido. É o padrão exato do defeito. **Reprova.**

Saída para quem conserta: abrir as duas ocorrências e decidir. Âncora certa →
marcar o fato com `cit_ancora_ok: true`. Errada → reancorar e estender a citação
até um trecho **único**. A marca existe porque **peneira tem de convergir**:
sem ela, o fato já conferido seria acusado para sempre, e peneira que grita o
que já se sabe correto morre de ser ignorada.

### ⚠️ E a peneira nova quase mentiu na primeira versão

Ela contava ocorrências **pedaço a pedaço** e acusou um fato da diretriz de
obesidade cujo 1º pedaço é `é recomendada a redução sustentada de pelo menos` —
que aparece duas vezes, uma seguida de **5%** e outra de **10%**. Parecia o
achado perfeito. Mas a citação tem **dois** pedaços com elisão declarada, e o
segundo traz "5% do peso… risco DASCV moderado": **junta, ela identifica um
lugar só e prova o número.**

A ambiguidade é da **sequência inteira**, não do pedaço isolado. Contar pedaço
super-relata — e peneira que grita demais é ignorada tão depressa quanto peneira
cega. Corrigido, o total caiu de 91 para 71, e as de risco de 8 para 4 (as 4
restantes conferidas à mão e marcadas).

## 🕶️ PENEIRA CEGA É PIOR QUE PENEIRA AUSENTE — a terceira reincidência (2026-08-08)

A migração das citações para referência (`cit` + `cit_sha`) esvaziou o campo
`citacao`. **Três peneiras liam esse campo e passaram a medir o nada** —
`cobertura-extracao.js`, a sub-peneira `CABEÇA_SOLTA` dentro dela, e agora
`scripts/proporcao-citada.js`, achado pelo auditor do exercício no DM1.

O padrão é sempre o mesmo e é o que o torna perigoso: **a peneira não quebra,
ela ATESTA.** O `proporcao-citada.js` imprimia `✓ nenhum extrato acima de 55%`
somando zero de 27 extratos. Se tivesse dado erro, alguém teria consertado.

Regra que fica: **toda peneira precisa de uma trava que a impeça de dar selo
verde sobre medição vazia.** A do `proporcao-citada.js` é literal — se TODOS os
extratos medirem 0%, ele sai com código 1 dizendo que isso é cegueira, não
limpeza. Ao mudar o formato de um dado, procure quem o LÊ antes de comemorar o
relatório limpo.

## ⚖️ AO CONSERTAR UMA PENEIRA CEGA, NÃO TROQUE O ALARME FALSO PELO SILÊNCIO

Consertado, o `proporcao-citada.js` acusou seis extratos entre 57% e 72% e
gritou "citado verbatim num repositório PÚBLICO". **Era mentira, e na direção
que assusta.** Depois da migração o JSON versionado guarda `[[0,418,271]]` e um
hash: quem clona e não tem o artigo não reconstitui uma palavra.

São **dois números diferentes**, e confundi-los era o erro:

| | o que é | o que faz |
|---|---|---|
| **EXPOSTO** | citação gravada como TEXTO no JSON | risco real de direito autoral · **reprova** |
| **COBERTO** | união de tudo, inclusive só-referência | dependência do artigo · **informa** |

Hoje EXPOSTO é 0% em todos os 27. COBERTO chega a 72% e é sinal editorial
("o extrato virou quase uma tradução"), não jurídico. Antes de reescrever,
conferi os dois lados: `test-citacao-nao-publicada.js` passa, e o
`lib/clinical-deep-data.js` — que É versionado — é gerado só de `f.afirmacao`.

## 📐 A CONTA DE COBERTURA É DE UNIÃO, NUNCA DE SOMA

As auditorias estendem muitas citações a partir de outras, então sobreposição é
regra. Somar comprimentos conta o mesmo trecho duas vezes e passa de 100%. E
como um fato pode ancorar na base 0 ou na 1 (sem hífen de quebra), cujos offsets
não são comparáveis, tudo é resolvido para TEXTO e relocalizado numa régua só.

## 🎯 TESTE QUE PROCURA PALAVRA-CHAVE NUMA JANELA REPROVA O ACERTO (2026-08-08)

O `test-teto-diretrizes.js` reprovou **três vezes** com o bloco CERTO em
primeiro lugar: janela de 70 caracteres (os `tema` cresceram), `[^—]` (o `tema`
tem travessão), janela de 240 (uma frase nova caiu depois dela).

Não era o tamanho da janela — era a **formulação**. O teste quer afirmar "veio o
bloco certo", e isso se verifica por **IDENTIDADE** (comparar o cabeçalho
devolvido com o `tema` esperado), não caçando uma palavra num pedaço do
cabeçalho. Reformulado assim, e conferido por mutação: fazer o `deepFor` PULAR o
bloco que não cabe volta a reprovar, mostrando MODY no lugar da cetoacidose.

## 🚦 RELATO DE AGENTE É PISTA, NÃO PROVA — meça você mesmo

O auditor do corticoide entregou um pacote de roteamento medido: "base GIH 6/12
→ 11/12, Adrenal 15/15, dano zero". Montei **bateria própria**
(`scratchpad/bateria-caminho.js`) e a minha linha de base deu **3/12**, não
6/12. Não é contradição — são perguntas diferentes —, mas é a razão de o número
que vale ser o medido aqui. Já houve agente relatando "regressão passa" quando
não passava.

E a bateria própria pegou **dois danos que o relato não tinha**: promover
`glicemia`/`hiperglicemia` a peso de doença sequestrava "hiperglicemia na
acromegalia", e promover `insulina` sequestrava "obeso em insulina: indico
bariátrica?". Daí o quarto degrau de peso (abaixo).

**A bateria tem duas metades, e a segunda é a que importa:** alvos (resposta
certa conhecida) e **sentinelas**, medidas por MOVIMENTO contra um instantâneo —
a pergunta pode estar hoje numa área discutível, mas o pacote não pode ser o que
a muda.

## 🔋 FORÇA MÁXIMA COM FREIO EM 85% — e o medidor, porque eu não enxergo o painel (2026-08-08)

Regra do professor, válida **até o fim da extração/auditoria**: rodar a todo vapor
e **recuar aos 85% do consumo**, voltando à força máxima quando a janela resetar.

⚠️ **O percentual está no painel DELE, não na minha sessão.** Sem medir, "recuar
aos 85%" é palpite — e o palpite já falhou uma vez, custando 4 agentes mortos no
meio do trabalho. O que eu SEI medir é o `subagent_tokens` que cada agente relata
ao terminar. Daí o `scripts/orcamento-agentes.js`:

```
node scripts/orcamento-agentes.js                 # estado e veredito (saída 2 = freio)
node scripts/orcamento-agentes.js --soma 253751   # registra um agente que terminou
```

O teto de 2,0 M de tokens por janela é **calibrado, não oficial**: vem da única
observação real que existe — a janela estourou com 8 agentes rodando quando o
painel marcava 92%, somando ~2,0 M. Na conferência seguinte o script marcou 58%
com o painel em 57%. É grosseiro e deliberadamente conservador: **errar para baixo
custa uma pausa; errar para cima mata agente no meio e perde tudo o que gastou.**

O freio é o **passo zero** da rotina horária. Ao bater 85%: não lançar agente
novo, deixar terminar o que já roda, commitar e encerrar em silêncio.

E a lição de como isso deu errado na primeira tentativa: lancei **8 agentes de uma
vez**, o limite de 5 horas estourou no meio, e **4 morreram com o trabalho pela
metade**. Agente morto não devolve nada — os tokens que ele gastou viram zero.

**Lote grande demais não é força máxima, é desperdício máximo.** A força está no
trabalho CONCLUÍDO, e um lote só é bom se couber inteiro no orçamento restante.
Melhor 5 que terminam do que 8 que morrem aos 60%.

**O que salvou o que dava para salvar** foi a convenção da pasta isolada
`scratchpad/acervo/trabalho/<fileId>/`:

- os **9 textos-fonte já baixados** sobreviveram — e o download do Drive + extração
  do PDF é a parte cara e lenta;
- **2 extratos parciais** (118 e 116 fatos) sobreviveram **conferidos, 0
  reprovados**, e um agente novo pôde CONTINUAR em vez de recomeçar.

**Ao relançar depois de uma queda por limite:** antes de disparar, rode um
inventário das pastas de trabalho (texto presente? extrato parcial? quantos
fatos?) e mande o agente **continuar**, não recomeçar. O prompt tem de dizer, com
todas as letras, "NÃO apague o que está lá, ACRESCENTE" e "o texto já está
baixado, não vá ao Drive".

**Ordem de prioridade ao escolher o lote:** primeiro os que têm trabalho parcial
salvo (o token já gasto se aproveita), depois os que têm o texto baixado, e só
então os que começam do zero.

## 📚 A CITAÇÃO NÃO É MAIS PUBLICADA — e continua sendo a prova (2026-08-08)

Duas exigências certas, juntas, produziram uma terceira coisa que nenhuma das
duas pediu:

- extrair EXAUSTIVAMENTE (o professor pediu "100% das informações");
- exigir CITAÇÃO LITERAL para cada fato (a garantia anti-alucinação).

Somando as citações de um extrato, **72% de um artigo Elsevier por assinatura
estava reconstituível verbatim** neste repositório, que é PÚBLICO. Cinco extratos
passavam de 55%. Nenhum dos artigos é open access.

**A saída não podia ser encurtar a citação** — seria trocar risco jurídico por
risco clínico, e o clínico é pior. A saída foi separar PROVA de PUBLICAÇÃO:

```json
"cit":     [[0, 12045, 236]],        // base, offset, tamanho no texto-fonte
"cit_sha": "a3f9c2…"                 // hash do texto literal resolvido
```

O texto continua em `scratchpad/acervo/textos/`, que está no .gitignore. Quem tem
o artigo resolve e confere tudo o que se conferia antes; quem não tem, não ganha
o artigo de graça. **A prova ficou MAIS forte**: deslocar o offset em 1 caractere
agora reprova, o que o `includes` de antes não pegava.

**No fluxo de trabalho:** o agente extrator continua escrevendo `citacao` com o
texto — é o jeito natural, e o verificador aceita as duas formas. Antes de
commitar, rode:

```
node scripts/protege-citacoes.js     # troca texto por offset+hash
node scripts/mostra-citacao.js <extrato> [n|--busca "termo"]   # ler a prova localmente
```

`scripts/test-citacao-nao-publicada.js` (no `ci-validate`) reprova se um extrato
RASTREADO ainda tiver texto. Esquecer publica o artigo, e ninguém percebe.

**O que continua versionado, e por quê:** as citações dentro do campo `conflito`
(~383 caracteres por artigo, menos de 1% de cada um). Elas são o aviso de
segurança entregue à IA em tempo de execução — sem elas o bloco chega sem
ressalva.

## 🕶️ PENEIRA CEGA DEVOLVE "✓" SEM TER OLHADO (2026-08-08)

Ao migrar as citações, rodei `cobertura-extracao.js` e o relatório veio **limpo**.
Eu quase comemorei. As peneiras liam `f.citacao`, que tinha acabado de sumir do
JSON: elas não acharam nada porque não tinham o que ler.

**Limpo era o sintoma, não o resultado.** Quando um campo que uma verificação
consome muda de forma, a verificação não falha — ela emudece, e o silêncio se
parece com aprovação. Hoje `cobertura-extracao.js` reclama alto quando não
consegue resolver a citação, em vez de aprovar por omissão.

**A regra:** ao mudar o formato de um dado, procure TODO consumidor
(`grep -n "\.campo"`) e confira se o número de achados MUDOU no sentido esperado.
Verificação que passa a achar zero logo depois de uma migração está quebrada até
prova em contrário.

## 🚪 AUDITE O CAMINHO, NÃO SÓ O CONTEÚDO (2026-08-07)

A auditoria da hipofosfatasia devolveu 15,4% de erro semântico e **zero
inversões clínicas** — e mesmo assim concluiu que *"como está hoje, a base pode
levar alguém a dar bisfosfonato a quem não deve"*. Nenhum fato errado. Três
defeitos de **caminho**:

1. a pergunta do médico não canonizava para nenhuma área (`"osteoporose"` → `''`);
2. o chat não mandava a pergunta como `grounding`, então **nunca** recebia base
   profunda — em nenhum tema;
3. quando o bloco chegava, o cabeçalho da ressalva mandava preferir o núcleo,
   exatamente onde a fonte contraindica o que o núcleo recomenda.

**A regra:** extração verificada não é entrega. Depois de extrair, teste a
CADEIA com a pergunta que um médico faria de verdade — em português, com
vinheta, com o termo decisivo no meio da frase:

```
node -e "const d=require('./lib/clinical-deep');
const q='<a pergunta real>'; console.log(d.canonArea(q), d.deepFor(q,120000,q).length)"
```

Se der `'' 0`, o artigo não existe para quem pergunta. **Ao mandar auditar, peça
também:** *"que pergunta um médico faria para precisar deste artigo, e ela chega
até ele?"*

## 🕰️ A RESSALVA ENVELHECE — e quanto melhor a varredura, mais depressa (2026-08-07)

O campo `conflito` é uma **fotografia do núcleo no dia da leitura**. A varredura
CORRIGE o núcleo (é metade do objetivo dela), e no instante em que corrige, a
ressalva do artigo que motivou a correção passa a descrever um núcleo que não
existe mais. Medido: **6 das 13 ressalvas** citavam texto já substituído — a do
prolactinoma mandava sobrescrever uma entrada **já certa**.

**A trava é a mesma dos fatos: citação literal, conferida.** Ao escrever ou
mexer num `conflito`, preencher:

- `conflito_direcao` — **obrigatório, sem padrão**: `nucleo_prevalece` |
  `fonte_prevalece` | `lacuna` | `misto` | `alinhado`. O montador reprova sem ele.
- `nucleo_citado` — trechos que a ressalva atribui ao núcleo, **verbatim**. É o
  que quebra quando o núcleo muda.
- `nucleo_ausente` — para `lacuna`: se o termo passar a existir, a lacuna acabou.
- `nucleo_prevalece_porque` — exigido quando a ressalva contém proibição e a
  direção é `nucleo_prevalece`.

**Depois de corrigir o núcleo a partir de um artigo, volte no `conflito` daquele
artigo.** Rode `node scripts/confere-ressalvas.js` (está no `ci-validate`).

## 🧪 TESTE QUE CONFERE CONSISTÊNCIA NÃO CONFERE CORREÇÃO (2026-08-07)

Descoberto testando por mutação a própria correção acima. Troquei o
`conflito_direcao` da hipofosfatasia de volta para `nucleo_prevalece` — a
inversão original, a que entrega contraindicação sob ordem de ignorá-la — e
**todos os testes continuaram verdes**. Porque eles conferiam que o cabeçalho
entregue bate com o campo declarado, e o cabeçalho **muda junto com o campo**.

E não dava para consertar com mais asserção: a **mesma linguagem de proibição
aparece nas duas pontas**. Na hipofosfatasia é a fonte que proíbe e ela tem de
vencer; no PTDM de 2016 é a fonte que manda evitar iSGLT2 e ela tem de perder
para o ADA 2026 do núcleo. Nenhum teste distingue os dois — só julgamento clínico.

**A saída, quando o certo não é derivável:** não finja que é. Exija que o
julgamento fique **escrito** (`nucleo_prevalece_porque`) e falhe sem ele. Não
impede o erro; impede que seja cometido de passagem. E **diga no próprio teste o
que ele não prova** — asserção que não pode falhar é pior que asserção nenhuma,
porque compra confiança sem entregar nada.

## 🎣 RECUPERAÇÃO FALSA: o perigo não é o que o fato diz, é o que ele responde (2026-08-07)

Modo de falha descoberto na auditoria da tireoide, e que nenhuma das quatro
camadas anteriores mede.

Nenhum dos 218 fatos afirmava "dar iodo antes da tionamida" — três diziam
explicitamente o contrário. Mas:

- **um** fato continha a frase *"o iodo for administrado primeiro"* (correto: é
  a ordem entre iodo e **lítio**, terapia alternativa de uso incomum). Numa base
  indexada, é ele que volta para *"qual a ordem do iodo na tempestade?"*;
- **três** fatos de dose de iodo não tinham marcador de ordem nenhum — e a fonte
  **tinha** o marcador na mesma célula de tabela. O fato irmão do SSKI preservou;
  o do Lugol perdeu. Assimetria dentro do mesmo extrato.

**A regra:** num acervo atomizado, todo fato precisa sobreviver a ser lido
SOZINHO. Fato de dose de um fármaco cuja ORDEM importa tem de carregar a ordem.
Fato de posologia cuja indicação tem porteiro (diagnóstico, população, fase) tem
de carregar o porteiro — foi o mesmo defeito no NTIS, onde a posologia de
hormônio flutuava ao lado da mensagem "não trate o eutireoidiano doente".

**Ao mandar auditar, peça explicitamente:** *"o que este fato responde se for
recuperado sozinho, sem os vizinhos?"*

## ⏰ Rotina horária que mantém a sessão viva (2026-08-07)

*"mantenha sempre a sessão ativa"*. O contêiner é recuperado por inatividade, e
com ele param os agentes e se perde o estado de trabalho. Criada a rotina
**`Endodirect — varredura clínica`**, que dispara **de hora em hora nesta mesma
sessão** (não abre sessão nova — o contexto continua).

**A ordem de prioridade que ela segue**, sempre nesta ordem:
1. processar resultado de agente pendente (conferindo as acusações graves no
   texto-fonte antes de aceitar — auditor erra);
2. auditar os extratos que ainda não têm o campo `auditoria`, **priorizando por
   risco clínico do assunto, não por tamanho**;
3. só então extrair artigo novo, começando pelas áreas sem nenhum bloco.

**⚠️ LIMITAÇÃO REAL da rotina: ela roda SEM conectores MCP.** As sessões que ela
dispara não têm Google Drive nem GitHub. Consequências práticas:
- **não consegue baixar artigo novo do Drive** (a etapa 3 fica bloqueada);
- **não consegue abrir nem dar merge em PR** — ou seja, **não deploya**.

O que ela FAZ bem: auditoria (os agentes trabalham em arquivo local), correção de
extrato, verificação, remontagem da base, commit e push para o branch. O trabalho
se acumula no branch e vai para produção na próxima sessão viva.

Para a rotina ganhar conectores, ela precisa ser criada pela interface de
Routines do claude.ai, não por aqui.

## 🚀 Deploy AUTORIZADO em pé, sem perguntar (2026-08-07)

*"pode ir deployando sem falar comigo"* — dito depois de eu segurar em produção,
esperando aprovação, uma correção de conteúdo clínico que podia levar alguém a
corrigir sódio rápido demais. **A autorização é permanente e vale para o
trabalho normal.**

**O que NÃO muda:** deploy só depois de `ci-validate` + harness A/B em Chromium
(e, para mudança de aparência, print). A autorização remove a espera pela
aprovação, não a conferência.

**O que continua exigindo pergunta**, porque é decisão dele e não minha:
mudança de preço, de regra de acesso/liberação de curso, envio de e-mail em
massa, e qualquer coisa que apague dado de aluno.

**A lição por trás:** havia correção clínica pronta e testada parada no branch
enquanto a versão errada rodava em produção. Segurar por educação tem custo — e
naquele caso o custo era clínico.

## 🕳️ A QUARTA camada: erro de OMISSÃO não deixa rastro (2026-08-07)

A auditoria adversarial do consenso de prolactinoma achou 9 erros de sentido em
175 fatos (5,1%). **Nenhum deles foi o achado que importou.**

O artigo tem **151 recomendações graduadas**. O extrato cobria as primeiras e
**parou em "Aggressive prolactinomas"**. Gestação (15 recomendações),
criança/adolescente, doença psiquiátrica, menopausa, pessoa trans e doença renal
crônica ficaram **inteiramente de fora** — e o campo `tema` do extrato
**anunciava todos eles**.

**Por que nenhuma camada existente pegava isso:**

| camada | o que mede | por que passa |
|---|---|---|
| `verifica-extracao.js` | a citação existe no PDF? o número bate? | o que está lá está certo |
| autoconferência do agente | o mesmo | idem |
| auditoria adversarial | o sentido do que está lá | audita o que existe |

Um fato errado alguém contesta. **Uma seção ausente é invisível** — e quem
consome o extrato lê o `tema` e supõe cobertura completa.

`scripts/cobertura-extracao.js` é a peneira que faltava, e virou
**pré-requisito do montador** (como a etapa 3), não relatório opcional:

1. **COBERTURA** — recomendações graduadas no PDF × fatos que declaram força.
2. **PROMESSA** — cada tema anunciado no campo `tema` aparece em algum fato?
3. **CITAÇÃO TRUNCADA** — citação terminada em preposição, conjunção ou hífen.
   Ela passa no verificador e **não sustenta a afirmação**. Dois fatos tiveram de
   ser apagados por isso: o PDF de duas colunas parte a frase no meio, e o
   pedaço que sobra ("…in patients aged", "…and are of low concern for") vira
   lastro falso. 13 dos 19 extratos têm alguma citação assim.

**Regra:** ao mandar extrair, dizer explicitamente para não usar citação partida
e para preservar população e qualificadores ("men", "children",
"microprolactinoma", "rarely", "although", "potentially") — foi por perder esses
que 6 dos 9 erros de sentido entraram.

## 🩺 A terceira camada pagou: 2,3% de erro SEMÂNTICO num extrato aprovado (2026-08-07)

O extrato da Diretriz Internacional de SOP 2023 passou nas duas primeiras
camadas: verificador mecânico (256/256 citações existem no PDF, todo número da
afirmação aparece na citação) e autoconferência do extrator. A auditoria
adversarial auditou **os 256 fatos** e achou **6 não-OK — 2,3%; 3,3% no
subconjunto de alto risco**.

### O erro que justifica a camada inteira

Fato [232]: *"letrozol é 1ª linha; **clomifeno associado a metformina**,
gonadotrofinas ou cirurgia ovariana têm papel principalmente de **segunda
linha**"*. A fonte diz: *"Letrozole is the preferred first line pharmacological
infertility therapy, **with clomiphene in combination with metformin**;
gonadotrophins or ovarian surgery primarily having a role as second line
therapy."*

**O ponto e vírgula é o divisor.** Clomifeno+metformina é aposto da 1ª linha, não
da 2ª. A citação é literal e correta — a leitura é que inverteu. **Nenhuma
camada mecânica pega isso.**

E o dano seria clínico: o letrozol é off-label em vários países, então rebaixar
a via ORAL empurra o clínico direto para gonadotrofina ou cirurgia, removendo a
alternativa barata e segura — o oposto do que a diretriz quer.

### Onde os erros se concentraram

Os dois graves ([232] e o AMH sem "em adultas") vieram da **Discussion**, não das
tabelas de recomendação. Em texto corrido a qualificação mora na frase seguinte
ou depois de um ponto e vírgula. **Gate para as próximas levas:** fato originado
em Abstract/Discussion exige leitura do parágrafo inteiro e dois testes
explícitos — *"vale para adolescente?"* e *"esta frase atribui linha de
tratamento?"*.

### ⚠️ Minha própria instrução injetou uma premissa falsa

Mandei o auditor conferir "ultrassom não diagnostica dentro de 8 anos da
menarca". **Esse prazo não existe neste artigo** — é da diretriz de 2018. O
auditor não engoliu e me corrigiu. Lição: o prompt do auditor também é fonte de
erro, e um auditor que só confirma o que o chefe sugeriu não serve.

### Melhoria estrutural pendente

O extrato **não registra a categoria** da recomendação. A diretriz separa
evidência (EBR), consenso clínico (CR) e ponto de boa prática (PP, "evidence not
sought") — e o formato atual entrega os três iguais para a IA. Levar `tipo` e
GRADE como campos do fato.

## 🎨 Mudança de APARÊNCIA se confere com print, não com teste (2026-08-07)

O `ci-validate` e o harness A/B em Chromium provam que o app **sobe** e que o
bloco grande executa até a última linha. **Nenhum dos dois vê se ficou bonito** —
que foi exatamente a reclamação do professor sobre os ícones dos cursos.

Ao desenhar as capas, três glifos passaram em toda verificação e estavam errados
na tela: a tireoide virou dois círculos, o osso virou um halter de academia e a
adrenal virou outra gota, indistinguível da do diabetes. Só apareceu quando
montei uma bancada que renderiza os candidatos lado a lado, no tamanho real, e
tirei print.

**O procedimento:** extrair o CSS e o JS reais do `index.html` (nunca reescrevê-los
no harness — senão se testa outra coisa), renderizar em Chromium, tirar print
**nos dois temas** e **na largura de celular**, e olhar. Foi assim que apareceu
também que o card de 176 px fixos deixava **um por linha** no celular.

O harness fica em `scratchpad/capas/` (`render.js` = as telas reais;
`cand.js` = candidatos lado a lado para escolher um glifo).

## 🔬 Varredura do acervo clínico: ritmo escolhido é o SEGURO (2026-08-07)

Perguntado se preferia acelerar (6–8 agentes simultâneos) ou manter o ritmo, o
professor respondeu: *"Deixe do jeito mais seguro e preciso. Não vamos perder
qualidade."* **A decisão é essa, e vale para o resto da varredura.** Levas
pequenas, verificação completa, nada de paralelismo que atropele conferência.

### As três camadas de conferência, e o que cada uma NÃO pega

1. **`scripts/verifica-extracao.js`** — a citação existe no texto? o número da
   afirmação aparece na citação? ⚠️ **Não confere se a citação SUSTENTA a
   afirmação.** Um trecho verdadeiro embaixo de uma frase que diz outra coisa
   passa.
2. **Autoverificação do agente** — ele roda o script contra si mesmo até passar.
   Pega os próprios deslizes de fatiamento (foi assim que 53 fatos foram
   reescritos na 1ª leva), mas **é o mesmo autor conferindo o próprio trabalho**.
3. **Auditoria adversarial** (criada em 07/08) — um agente que tenta DERRUBAR
   extratos já aprovados, classificando cada fato em OK / EXAGERO / INVERSÃO /
   DESCONTEXTO / INCOMPLETO. Audita amostra + **todos** os fatos com dose, corte
   laboratorial, "contraindicado", "não deve", "primeira linha" ou percentual —
   os que causam dano se errados.

**A lição por trás:** as duas primeiras camadas medem FIDELIDADE LITERAL; nenhuma
mede FIDELIDADE DE SENTIDO. Antes de escalar a extração, medir a taxa de erro
semântica — escalar um processo cuja taxa de erro você não conhece é multiplicar
o desconhecido.


## 🌐 A rede do ambiente é CONFIGURÁVEL — e desde 06/08/2026 está aberta (2026-08-06)

Durante meses eu tratei "o proxy bloqueia" como fato da natureza e **construí
contornos**: o harness de Chromium local existe porque eu não alcançava o preview
da Vercel; recusei escrever conteúdo clínico porque não alcançava o site da
revista; validei o filtro de imagem com **fixtures inventadas por mim** porque não
alcançava o Open-i.

**Era configuração, não limite.** O ambiente roda com um nível de acesso de rede
(`None` / `Trusted` / `Full` / `Custom`). O padrão é **Trusted**, que libera só
uma lista fixa (npm, PyPI, GitHub, registries) — todo o resto leva **403 do
proxy**. Em `claude.ai/code` → ícone de nuvem acima da caixa de mensagem →
engrenagem do ambiente → **Network access: Custom** → **Allowed domains**, um por
linha. ⚠️ Marcar **"Also include default list of common package managers"**, senão
o Custom SUBSTITUI a lista padrão e o npm/PyPI somem.

O professor abriu em 06/08 e passou a valer **na sessão em curso**, não só nas
novas. Liberados: `openi.nlm.nih.gov`, `eutils.ncbi.nlm.nih.gov`,
`pubmed.ncbi.nlm.nih.gov`, `endodirect.com.br` (+ subdomínios), `*.supabase.co`,
`*.vercel.app`.

**O que isso mudou na mesma hora:** validei o filtro de imagem contra a busca real
e descobri que **3 das 6 figuras que meu filtro aprovava não eram exame** (curva
ROC, gráfico de barras, lâmina de citologia) — as fixtures davam 10/10. Ver
[[Decisões]].

**A lição, e ela é geral:** *fixture escrita por mim é otimista por construção — eu
escrevo a entrada que o meu código espera.* Antes de me contentar com teste
sintético, **perguntar se dá para bater na fonte de verdade** — e se um 403 estiver
no caminho, dizer qual host e pedir, em vez de contornar.

⚠️ **Não contornar a política por dentro:** cheguei a ver que o Postgres do
Supabase tem a extensão `http` disponível e daria para fazer o banco buscar por
mim. Não é o caminho — é furar a política de egresso por dentro da produção, e
abre SSRF a partir do banco. O `README` do proxy diz explicitamente para **relatar
o host bloqueado, não rotear em volta**.

## ⚠️ Branch depois de um squash-merge: rebase ANTES de abrir o próximo PR (2026-07-31)

Abri o PR #659 no mesmo branch que já tinha sido **squash-mergeado** duas vezes. Dois sintomas, os dois com cara de outra coisa:
- **O CI não disparava.** Nenhum run de `validate` aparecia — só o check da Vercel. Cheguei a suspeitar de Actions desligado e a inventar teoria sobre eventos de app.
- **O merge deu 405 "merge conflicts"**, sem conflito nenhum no `git merge-tree` local.

**A causa é a mesma:** o squash faz `main` ganhar UM commit novo que não é nenhum dos commits do branch. O branch fica divergido, o GitHub vê os patches já aplicados como conflito e o PR entra num estado em que o evento não gera run.

**A correção é uma linha,** e é a mesma dos dois casos: `git fetch origin main && git rebase origin/main` — o rebase **descarta sozinho** os patches já upstream (`dropping … -- patch contents already upstream`) — depois `push --force-with-lease`. Feito isso, o CI disparou e o merge passou na hora.

**Ficou também:** `workflow_dispatch` no `.github/workflows/ci.yml`, para dar como pedir a validação sem empurrar commit vazio.

### Resultado da 1ª auditoria adversarial (07/08/2026): 6,1%

**196 fatos auditados nos 3 extratos de maior risco. 12 achados.**
EXAGERO 8 · DESCONTEXTO 3 · INCOMPLETO 1 · **INVERSÃO 0**.
⚠️ **Nenhum número, dose ou corte estava trocado** — a fidelidade numérica que o
verificador garante estava de pé. O que se perdia era outra coisa.

**O padrão dominante, e virou guarda automática:** *"We suggest"* — recomendação
GRADE **condicional**, às vezes com certeza muito baixa — chegava à base como
**"não se deve"**, **"devem ser trocados"**, **"deve-se"**. Uma sugestão fraca
virava ordem. `forcaPerdida()` no verificador agora reprova isso; ela achou
**7 casos**, dois a mais do que a amostra da auditoria tinha visto.

**A guarda é ESTREITA de propósito:** só dispara com "we suggest" na citação (marcador
inequívoco) + imperativo em português + nenhuma ressalva. A primeira versão aceitava
a palavra **"pode"** solta como ressalva e deixou passar um caso — "pode" aparece por
mil motivos numa frase e não é sinal da força da recomendação.

**Achado sistêmico que nenhuma guarda pega:** no craniofaringioma, **56% (139/249)**
das citações terminam no meio da frase — o PDF de duas colunas foi extraído com as
colunas intercaladas. A citação existe e os números batem, mas ela não é prova
legível sozinha. Nos artigos que extraí **localmente com pdfjs** (hiponatremia) isso
cai para **5%**; nos vindos do texto do Google Drive, sobe. **Quando houver escolha,
extrair o texto localmente.**

**hipo-3 passou LIMPO** — 61 fatos, zero achados, com todos os limites de correção,
doses e "primeira linha" exatos. É a prova de que a taxa não é ruído de método.


## 🖥️ Mudança de JS no `index.html` — testar em NAVEGADOR REAL antes de mergear

O cofre já registrava a regra ([[Pendências]], item do OSCE lazy): **dois apagões**
em 2026-06 derrubaram toda a interatividade da plataforma com o `ci-validate`
(parse) **e** um sandbox `vm` **passando**. O ferramental de parse não detecta o
que quebra a execução desse `index.html` de 1,4 MB.

Desde 31/07 existe o harness: **`scratchpad/boot-navegador/check.js`** — sobe
Chromium de verdade (já vem no ambiente, `/opt/pw-browsers/chromium-1194/`) e roda
o **mesmo teste contra a `main` e contra o branch**. Diferença entre os dois é
culpa do diff. É o substituto do preview da Vercel quando o proxy não alcança
`vercel.app` (que é o caso deste ambiente).

**A sonda que presta:** a **última linha** do bloco grande liga um listener em
`#fb-submit`. Se ele existe (lido por CDP `DOMDebugger.getEventListeners`), as
13.398 linhas rodaram até o fim — que é exatamente o que o apagão quebrava.

### ⚠️ Duas armadilhas que me fizeram ler um falso apagão (31/07)
1. **Os `<script src>` de CDN são bloqueantes e o proxy os PENDURA** em vez de
   recusar. Sem interceptar, o parser trava no primeiro e **nenhum bloco inline
   executa** — os dois lados medem zero e parece que o app morreu.
2. **O app inteiro é uma IIFE** (`l.2552–15950`, `'use strict'`). As funções
   **não** viram propriedades de `window`: `typeof goPanel` é `'undefined'` com
   tudo funcionando. Minha primeira versão sondava `window[...]` e "reprovou" um
   branch que estava perfeito. **Sonda errada é pior que teste nenhum** — ela
   produz um veredito com cara de evidência.


## ⚠️ Ler o cofre ANTES de escrever código — não só depois, para registrar

Instrução direta do Rodolpho (2026-07-27): *"Sempre, sempre cheque o cofre para não dar bobeira."*

O cofre não é só o lugar onde eu **anoto** o que fiz; é onde descubro o que **já existe**. Buscar aqui pelos nomes que vou tocar (constante, função, campo, tabela) **antes** de editar leva segundos e evita reconstruir algo já resolvido de outro jeito.

- **Caso concreto (2026-07-27):** ia mergear o PR #539, que criava a constante `RESUMO_ONLY_SUBS`. Um `grep` no cofre mostrou que a `main` já tinha **`RESUMOS_ONLY_SUBS`** (com S), resolvendo o mesmo problema por outro mecanismo, desde 17/07. Sem essa checagem eu teria deixado **duas constantes quase homônimas** no mesmo arquivo — o tipo de coisa em que alguém edita uma e esquece a outra. Detalhe: `grep` no `index.html` pelo nome do #539 dava **zero**, porque o nome real diferia por uma letra. **Foi a prosa do cofre que pegou, não o código.**
- **Como buscar:** `grep -rn "<termo>" cofre/` com o **conceito** (ex.: "Endocrinologia Básica", "rascunho", "clobber"), não só com o identificador exato — o nome no código pode diferir do que estou prestes a escrever, e é justamente aí que mora o erro.
- **Vale em dobro para PR antigo:** um PR parado por dias pode ter sido resolvido por outro caminho enquanto isso. Antes de mergear, conferir no cofre **e** no código se o problema ainda existe.

### ⚠️ `git fetch origin main` também faz parte de "checar antes" (2026-07-28)
O professor pediu a discussão completa dos artigos do Mural. Eu li o cofre, li o `lib/radar.js`, medi 76/253 open-access, descobri que o `api/` estava em 12/12 e **propus construir a funcionalidade** — que **já estava pronta e em produção**, mergeada no **PR #626** minutos antes, com `lib/fulltext.js`, `lib/discussao.js` e o botão no card.

O detalhe que dói: cheguei sozinho exatamente ao mesmo desenho (abstract não sustenta discussão; só PMC tem texto integral; tabela sim, figura não; endpoint dentro de um handler existente por causa do teto de 12). Não foi análise perdida — foi **trabalho refeito**, e uma pergunta ao professor que não precisava existir.

- **A causa:** a branch estava em `c46558b`, e a `main` já tinha `c392dd8`. Ler o cofre não bastou porque **o cofre ainda não tinha sido atualizado** com o #626 — o registro chega junto com o merge, não antes dele.
- **A regra:** antes de propor ou escrever qualquer coisa nova, `git fetch origin main && git log --oneline origin/main -5` e, se o assunto tiver nome, `git log --oneline -S"<termo>" origin/main`. São dois comandos.
- **Sinal secundário que eu tinha na mão e ignorei:** o `get_deployment` da Vercel trazia a mensagem do commit de produção, e ela dizia *"Discussão completa do artigo no Mural"*. **Metadado de deploy é fonte sobre o que está no ar** — vale ler, não só olhar o `readyState`.

## Números de artigo: "conferido" só vale contra o PDF

**⚠️ LIÇÃO (2026-07-28).** O `check_numeros.js` prova que **todo número da ficha existe na prosa do resumo**. Isso pega inconsistência interna — mas **prosa e ficha são ambas escritas por mim**, então um número errado na origem passa nos dois lados sem alarme nenhum. Foi o que aconteceu no 3º lote: os quatro artigos passaram em todos os checadores e, quando o professor mandou os PDFs, **três afirmações caíram** (pressão arterial no SCOUT e no COR-I; convulsão e suicidalidade atribuídas ao COR-I).

- **Vocabulário honesto:** enquanto não houver conector de busca autorizado, dizer "conferido" só é legítimo para o que foi lido **no PDF**. Para o resto, a frase é "coerente internamente, **pendente de revisão**".
- **Onde o erro nasce:** não nos números de eficácia — esses eu costumo lembrar bem. Nasce na **segurança**, ao escrever o que "todo mundo sabe da classe" em vez do que aquele ensaio mediu. Efeito adverso de bula ≠ achado do estudo; os dois podem ser verdadeiros e **não são a mesma afirmação**.
- **Armadilha específica, que apareceu duas vezes no mesmo lote:** "o fármaco eleva a pressão". Em estudos de emagrecimento a pressão em geral **cai nos dois braços**, e o fármaco apenas **atenua a queda**. Antes de escrever que algo eleva a PA, procurar no artigo se a comparação é **contra o basal** ou **contra o placebo** — quase sempre é a segunda.
- **DECISÃO DO RODOLPHO (2026-07-28): pode escrever primeiro, sem esperar o PDF.** Eu havia proposto exigir a fonte antes de redigir qualquer artigo novo; ele preferiu manter a velocidade e conferir depois. **Consequência operacional, que fica valendo:** enquanto o artigo não passou por PDF, ele é **"coerente internamente, pendente de revisão"** — nunca "conferido" —, e isso vale tanto no que eu digo no chat quanto no que o cofre registra. O rótulo é o que sustenta a escolha dele: sem ele, a velocidade viraria confiança indevida.
- **Ao conferir um PDF, ir direto a:** n randomizado (≠ n incluído), desfecho primário com IC e p, componentes do composto, mortalidade separada, PA/FC com a base de comparação explícita, critérios de exclusão (eles explicam ausências de eventos) e % que completou o estudo.

## ⚠️ Falso positivo do stop-hook de assinatura DEPOIS de um merge

**Situação (2026-07-28, PR #625).** Terminado o merge, alinhei a branch local com a `main` (`git checkout -B <branch> origin/main`). O stop-hook de verificação de assinatura então acusou o commit do topo como "Unverified — committer email is not noreply@anthropic.com" e sugeriu `git commit --amend --no-edit --reset-author`.

**NÃO fazer isso.** O commit acusado era o **squash-merge criado pelo próprio GitHub** (`committer: GitHub <noreply@github.com>`, autor = o dono do repo), já presente em `origin/main` e **já em produção**. Amendá-lo reescreveria história publicada e exigiria **force-push na `main`** — quebrando o vínculo com o PR e a correlação com o deploy.

**Como distinguir em 10 segundos**, antes de obedecer ao hook:
```
git log -1 --format='autor: %an <%ae>  committer: %cn <%ce>' <sha>
git branch -r --contains <sha>     # se aparecer origin/main, é história publicada
```
- **Committer `GitHub <noreply@github.com>` + presente em `origin/main`** → é o merge do GitHub. **Não tocar.**
- **Committer meu, ainda não empurrado** → aí sim vale o `--amend --reset-author`.

**⚠️ A partir de 29/07 esse aviso passou a ser ESPERADO, e com frequência.** Desde que a branch é reiniciada da `main` logo após cada merge (ver Git / deploy), o topo dela fica sendo justamente o squash-merge do GitHub até eu fazer o próximo commit. Ou seja: **o hook vai acusar depois de todo deploy**. Não é sinal de nada — é o preço de manter a branch alinhada. Aconteceu duas vezes seguidas (#629 e #630) com a mesma resposta.

O falso positivo se resolve sozinho no commit seguinte da branch. E vale a regra geral: **hook é feedback, não ordem** — quando a correção sugerida for destrutiva ou irreversível, conferir o alvo antes.

## Git / deploy

### ✅ Deploy AUTORIZADO em pé — não perguntar (2026-07-28)

**⚠️ Reiniciar a branch LOGO APÓS o merge, não na próxima entrega.** Aconteceu duas vezes em 29/07 (#628 e #629): mergeei por squash, continuei commitando na branch antiga e o PR seguinte abriu com conflito. O squash cria um commit novo na `main` que não é ancestral da branch, então tudo que estava no PR anterior volta a aparecer como diferença.
```
# imediatamente depois de mergear:
git fetch origin main && git checkout -B <branch> origin/main
```
Se já houver commit novo em cima da branch velha, o conserto é `git checkout -B <branch> origin/main && git cherry-pick <sha do commit novo>` — barato, mas evitável.

Instrução direta do Rodolpho: *"Sempre pode gerar deploy sem perguntar."*

Vale para o fluxo normal do projeto: branch → PR → squash-merge na `main` → a Vercel publica. **Não** esperar aprovação a cada entrega; o que se espera é o **relato depois**, com o que foi ao ar e o estado do deploy.

O que a autorização **não** dispensa:
- **CI verde antes de mergear** (`node scripts/ci-validate.js`) — a autorização é para não perguntar, não para pular verificação.
- **Confirmar `state:READY` no `target:production`** depois do merge. Um PR mergeado pode ficar fora do ar (já aconteceu em #311/#313, deploy ERROR pelo teto de funções) e o professor veria o bug "corrigido" continuar.
- **Gravação em banco** e **ação irreversível** continuam fora deste escopo: aqui a autorização é de *publicar código*, não de apagar ou reescrever dado do professor.

- **⚠️ LIÇÃO (2026-07-28) — a regra do `tail` vale para o `git push` TAMBÉM, e eu a repeti:** meu laço de retry era `if git push ... 2>&1 | tail -1; then echo "PUSH OK"`. Num pipeline o **exit code é o do último comando** (`tail`), que sempre sai 0 — então um push **rejeitado** (non-fast-forward) imprimiu "PUSH OK". Só percebi porque a linha de `hint:` do git vazou na saída. **Padrão correto:** `git push ...; rc=$?` — nunca canalizar o push, e nunca decidir sucesso por texto. Mesma família da lição do `merge` abaixo: **truncar saída de git é como perder o exit code.**
- **⚠️ LIÇÃO (2026-07-27) — NÃO cortar a saída do `git merge` com `tail`:** ao resolver conflitos, rodei `git merge … 2>&1 | tail -4`. O `tail` **escondeu a linha do `index.html`**, que também havia conflitado — resolvi só os arquivos que apareceram e **commitei com marcadores `<<<<<<<` dentro do `index.html`**. Quem pegou foi o `scripts/ci-validate.js` (`Unexpected token '<<'`), não eu. **Correção obrigatória:** depois de QUALQUER merge, auditar o repositório inteiro antes de commitar — `grep -rln "^<<<<<<< \|^>>>>>>> " --include="*.js" --include="*.html" --include="*.md"` — e só então `git add`. Nunca confiar na lista de conflitos vista por uma saída truncada.
- **⚠️ LIÇÃO (2026-07-27, aconteceu DUAS vezes na mesma sessão) — conferir a branch ANTES de commitar:** depois de sincronizar com `git checkout main`, esqueci de voltar para a branch de desenvolvimento e commitei em `main`. Não houve dano porque não empurrei (o push é sempre `-u origin <branch>`, que falhou/avisou), mas a recuperação custa tempo: `git branch -f <branch> <sha> && git reset --hard origin/main && git checkout <branch>`. **Rodar `git branch --show-current` como primeiro passo de todo commit.**
- **⚠️ LIÇÃO (2026-07-27) — `git reset --hard` com trabalho NÃO commitado apaga tudo:** ver a entrada do amarelo da landing em [[Decisões]]. Commitar ou `git stash` antes de sincronizar.
- **⚠️ O gatilho de `pull_request` do CI é intermitente** (visto nos PRs #606, #608, #617 e #619): o check `validate` simplesmente não inicia, e **commit vazio não resolve**. O que destravou nas duas vezes foi **resolver a divergência de histórico com a `main`** (merge de `origin/main` na branch) e empurrar. O gatilho de `push` em `main` **sempre** funciona. **Ausência de check NÃO é aprovação** — confirmar que a execução EXISTE para o SHA (via `actions_list`/`get_workflow_run`) antes de mergear.

- **⚠️ LIÇÃO (2026-06-25) — NÃO empilhar 2 pushes em `main` em segundos:** dois commits enviados em sequência rápida (`672c2a7` filtros, depois `7935cc2` remove ✓) geraram builds concorrentes na Vercel e a **promoção saiu fora de ordem** — o deploy do commit **mais antigo** virou produção ~24s depois, e o site ficou servindo a versão SEM a última correção (o usuário via o ✓ que eu já havia removido). **Correção:** subir **um commit por vez** e, em caso de mudanças rápidas, **agrupar num único commit** ou confirmar via `list_deployments` que o deploy de produção aponta para o SHA mais novo antes de avisar o usuário. Hotfix usado: um commit novo (bump do cache do `sw.js` v4→v5) força um deploy limpo (mais recente, sem corrida) **e** busta o cache do service worker dos clientes. **Webhook GitHub→Vercel pode atrasar ~2–3 min** — não confiar em "deve estar pronto"; checar o estado real.
- **Branch de desenvolvimento:** `claude/funny-brahmagupta-9n8yT`.
- Fluxo: commitar na branch → abrir PR → **squash merge** em `main` → deploy automático na Vercel.
- **⚠️ REGRA ATUAL (reforçada pelo usuário 2026-06-18) — PREVIEW + APROVAÇÃO ANTES DO DEPLOY:** toda mudança que afeta **o app** (frontend `index.html`, prompts, backend `api/`/`lib/`) segue: branch → PR → **CI verde** → **enviar o link do PREVIEW da Vercel no chat** → **esperar o "ok"/"pode dar deploy" do usuário** → só então squash-merge na `main`. **NÃO mergear/deployar sem a aprovação explícita.** Isso **supersede** a antiga "merge automático" abaixo. Exceção: **docs do `cofre/`** (`.md`) não fazem deploy no app → podem ser commitadas/mergeadas direto (mantendo o campo `atualizado:` em dia).
- ~~**Merge + deploy AUTOMÁTICOS — autorização permanente do usuário (2026-06-16):**~~ (SUPERSEDIDO pela regra acima) depois do **CI ficar verde**, fazer **squash-merge na `main` e deixar a Vercel deployar**. Travas mantidas: (1) CI `validate` verde; (2) PR que mexe em **pagamento/acesso** → revisar o diff antes. Para acompanhar o CI sem `sleep`, usar `mcp__github__pull_request_read` (`get_check_runs`/`get_status`).
- **Cofre SEMPRE atualizado (lição 2026-06-18):** ao mexer numa nota do `cofre/`, **atualizar o campo `atualizado:` do frontmatter** (não só o conteúdo) — senão o Obsidian do usuário mostra data velha. O usuário precisa dar `git pull` no vault local p/ ver o que foi mergeado (eu trabalho no container na nuvem).
- ⚠️ Após cada merge, a `main` avança e a branch local fica defasada. Antes do próximo PR, **rebasear** sobre a `main` nova para evitar conflito:
  - `git fetch origin main`
  - `git rebase --onto origin/main <último-commit-já-mergeado>` (ou `git reset --hard origin/main` e reaplicar só o que falta).
- O container é efêmero e às vezes re-clona em commit antigo — **sempre** `git fetch origin main && git reset --hard origin/main` antes de começar.
- Identidade de commit: `Claude <noreply@anthropic.com>`. (O commit de squash-merge na `main` é gerado pelo GitHub e aparece como `committer: GitHub <noreply@github.com>` / "Unverified" — isso é **normal**, não reescrever.)
- O fluxo PR → squash → deploy está **pré-autorizado** (ver acima): criar PR, esperar o CI, mergear e deployar sem pedir ok a cada vez.

## Linguagem do conteúdo — formal e técnica, sem marcas de texto gerado (2026-07-28)

Instrução direta do Rodolpho: *"Evite termos genéricos de IA. Deixe linguagem sempre formal e técnica."* Vale para **todo texto que o aluno lê** — artigos, capítulos, fichas, Questão do Dia, newsletter, Mural.

- **Preferir o termo técnico à construção derivada.** O gatilho foi a pergunta do SUSTAIN-6: *"é cardiovascularmente segura?"* → **"é segura do ponto de vista cardiovascular?"**. Advérbio em `-mente` fabricado a partir do adjetivo soa a tradução automática; a forma preposicionada é a que se escreve em português médico.
- **O que evitar,** por serem tiques reconhecíveis de texto gerado: metáfora de efeito ("divisor de águas", "cemitério de estudos negativos", "mergulhar em"), superlativo vago ("robusto", "impressiona", "extremamente"), autoelogio de método ("com honestidade", "vale dizer em voz alta"), e a fórmula "não é apenas X, é Y".
- **O que manter:** o texto continua **didático e direto** — frase curta, dado antes do adjetivo, e a limitação dita por extenso. Formal não quer dizer empolado nem impessoal; quer dizer **preciso**.
- **⚠️ Eu havia reposto uma frase que o professor tinha apagado de propósito.** No comparativo do SURPASS faltavam 82 caracteres — *"Vencer placebo é uma coisa; medir-se contra um fármaco já cardioprotetor é outra"* — e eu tratei como perda por clobber, porque era o modo de falha documentado. Ele respondeu: *"eu tirei porque isso é jargão de IA"*. Frase removida de novo, no banco e na fonte.
  - **A lição não é "não repor".** É que **a hipótese de clobber não é a única** quando some texto: uma edição deliberada do professor produz o mesmo rastro. Antes de repor, olhar **o que** sumiu — se for exatamente o tipo de frase que ele vem cortando, o mais provável é que tenha sido ele.
- **Varredura de 2026-07-28:** 16 ocorrências corrigidas em `trials.js`, `trials2.js`, `trials4.js` e `comparativos.js` — títulos de seção ("divisor de águas", "cemitério de estudos negativos", "O paradoxo que…", "A pergunta incômoda…"), autoelogio de método ("com honestidade", "vale dizer em voz alta") e ênfase vazia ("a magnitude impressiona" → a redução absoluta em pontos percentuais). Fonte local e banco em sincronia; 43/43 e 40/40 conferidos depois.
  - **Como reencontrar o resto,** quando aparecer mais: `grep -o -n "divisor de águas\|cemitério\|com honestidade\|em voz alta\|vale dizer\|incômoda\|paradoxo\|impressiona\|chave de tudo\|não pode ser omitida\|desconfortável" trials*.js info*.js comparativos.js`

## Conteúdo / marketing
- **Posts de feed do Instagram: SEMPRE com a logo do Endodirect (pedido do Rodolpho, 2026-06-29).** Usar a marca real **`logo.png.png`** (marca "ED" dourada, fundo transparente — fica bem sobre fundo escuro) no cabeçalho de toda arte. Gerar os slides com **HTML→PNG via Playwright** (1080×1350, identidade Endodirect: fundo navy `#0b1325`, azul `#3b6fd4`/`#5585e8`, verde `#34d399`, vermelho `#fb7185`; logo embutida em base64). **NÃO** reaproveitar como arte de carrossel as mesmas figuras que já estão no texto do post.
- **Textos de leitura SEMPRE justificados (pedido do Rodolpho, 2026-06-29):** newsletter (`lib/newsletter.js` — `text-align:justify` inline nos blocos `.art-body`) e cards do Mural (`.mural-text` → `text-align:justify;text-align-last:left`; o `text-align-last:left` evita esticar cabeçalhos/última linha de bullet com `white-space:pre-line`). Ao criar novos blocos de texto corrido, manter justificado.
- **Carrossel EDITÁVEL no Canva com o NOSSO design (técnica, 2026-06-29):** para levar o design exato (não a versão recriada pela IA) ao Canva editável: (1) montar o HTML dos slides anotando **cada slide com `data-document-role="page"`** (atributo opcional `data-label`), CSS inline e logo embutida em base64; (2) hospedar num **URL HTTPS público** — usei `raw.githubusercontent.com/<owner>/<repo>/<SHA>/arquivo.html` (por SHA = imutável e sem ambiguidade de branch com `/`); (3) `import-design-from-url` (Canva MCP) → vira design com **layout do HTML + texto editável**. ⚠️ Essa ferramenta **exige permissão no conector do Canva**: se voltar `MCP tool call requires approval`, pedir ao usuário para **reconectar o conector / dar permissão total**, depois repetir. Verificar a copy com `get-design-content` (não consigo renderizar a prévia — o proxy bloqueia o host de imagens do Canva). Alternativa rápida (sem permissão): `generate-design` (`instagram_post`) — mas a IA **condensa** a copy e usa layout próprio. Arquivo HTML de importação fica **só na branch** (nunca em `main`/produção); o URL por SHA continua válido mesmo após apagar o arquivo do tip.
- **⚠️ Onde o design importado vai parar + fidelidade (lição 2026-06-29):** o design criado por `import-design-from-url` **NÃO aparece sozinho na grade de "Projetos"** do Canva do usuário — ele entra na conta, mas só surge em **"Recentes"** depois de aberto pelo link, ou via **busca pelo nome exato**. Os links `/d/<code>` que `get-design`/`start-editing-transaction` retornam **são regenerados a cada chamada** (não são fixos/permanentes) → ao entregar, mandar **o link mais recente E o nome exato do design** pra o usuário poder buscar (o identificador estável é o `design_id`, ex.: `DAHN_PiV6vw`). **Fidelidade:** uma frase longa numa caixa de texto pode importar como **linha única que estoura a borda** — corrigir abrindo transação e inserindo `\n` via `find_and_replace_text` (ex.: quebrei a frase do "Atenção" em 2 linhas), conferir pelo thumbnail e `commit-editing-transaction`.

## Extrair a CURVA de um artigo (Kaplan-Meier) do PDF — técnica (2026-07-26)
Figura de NEJM/Lancet costuma ser **vetorial**: dá para recuperar os pontos reais da curva, em vez de projetar. Feito no SELECT (Figura 1A) e replicável nos outros trials.
1. `pdftotext -layout arquivo.pdf saida.txt` → achar em que página está a figura (procurar "Months since Randomization" / "No. at Risk") e conferir o **limite do eixo X** (o SELECT trunca em **48 meses**, que **não** é o seguimento médio de 39,8).
2. `pdftocairo -svg -f <pág> -l <pág> arquivo.pdf fig.svg`.
3. **O texto vira glifo** (`<use>`, sem `<text>`) → não dá para ler rótulo de eixo. **Calibrar pelas marcas de escala:** extrair os `<path>` de 2 pontos, aplicar o `transform="matrix(...)"` de cada um, separar os segmentos curtos horizontais (ticks do eixo Y) e verticais (eixo X) e agrupar por coluna/linha. Espaçamento regular = escala.
4. As curvas são os `<path>` longos (centenas de pontos), coloridos. **O `matrix` tem `d=-1`** (eixo Y invertido) e o traçado é desenhado **da direita para a esquerda** — a origem local é o **fim** da curva, então `ty` já é a coordenada de tela do valor final.
5. Converter cada ponto para (tempo, %) e reamostrar (usei passo de 1,5 mês, guardando o máximo acumulado — curva de degrau não desce).
6. **Validar com 3 âncoras independentes**, senão não confiar: (a) a curva começa em (0, 0); (b) o inset e o gráfico principal do mesmo painel têm de dar o mesmo valor final (deram 7,85/9,63 e 7,67/9,58); (c) o **HR implícito** `ln(1−p_int)/ln(1−p_ctl)` tem de bater com o publicado — deu **0,79 vs 0,80**.
7. **KM > proporção bruta.** No SELECT o texto diz 6,5% e 8,0% (eventos ÷ randomizados), mas a curva aos 48 meses dá **7,7% e 9,6%**. Não são incompatíveis — são coisas diferentes, e o card explica isso. Nunca rotular um como o outro.
- **Sem o PDF**, a ficha desenha uma curva **projetada** (risco constante, `λ = −ln(1−p)/T`) ancorada nas duas taxas publicadas, com aviso explícito de que não é a curva original. Aluno que vê curva assume que é o dado do estudo — o rótulo não é opcional.

## Referências clínicas (fontes de verdade médicas)
- **Toda produção de conteúdo médico** (flashcards, Mural/discussões, resumos de aula, questões, newsletter, posts) deve seguir as diretrizes em **`cofre/Diretrizes Clínicas/`** — os cortes, doses, alvos e critérios da diretriz citada mandam; citar a âncora (ex.: "ESE/ES 2024"). Em conflito com a memória, **a diretriz vence** (precisão > fluência, prioridade recorrente do Rodolpho).
- **Quando o Rodolpho mandar um PDF de diretriz e disser "incorpore":** ler o PDF inteiro (`Read` com `pages:`; ⚠️ se o PDF for grande/imagem ou o payload de imagens da sessão já estiver alto, o `Read` **deixa de renderizar** → extrair o texto com **`pdftotext`** [poppler, disponível no sandbox], ex.: `pdftotext -f 1 -l 3 arquivo.pdf -`), criar uma nota-resumo em `cofre/Diretrizes Clínicas/` (citação + DOI + escopo + recomendações + tabelas de doses/cortes/alvos), linkar no `README.md` da pasta e registrar em [[Decisões]]. **Acervo inicial (2026-06-30):** IA por glicocorticoides (ESE/ES 2024), Vitamina D (Endocrine Society 2024), Transgênero (Endocrine Society 2017) — e a biblioteca cresceu bastante depois (ver `cofre/Diretrizes Clínicas/README.md`).
- **⭐ Diagnóstico de DMG → diretriz da SBD (pedido do Rodolpho, 2026-06-30):** para **diabetes mellitus gestacional**, usar **preferencialmente os critérios da SBD** (em [[Diabetes na Gestação — Diagnóstico, Metas e Tratamento (SBD)]]), **não** ADA/IADPSG. Resumo: **1ª consulta** — jejum **≥92–125 = DMG**, **≥126 = DM overt**; **TOTG 75 g (24–28 sem)** — jejum **≥92** / 1 h **≥180** / 2 h **≥153** (≥1 valor). Metas: jejum <95, 1 h <140, 2 h <120 mg/dL; **insulina é 1ª linha**.

## Validação antes de commitar
- **Automatizado no CI (GitHub Actions `.github/workflows/ci.yml` → `scripts/ci-validate.js`):** roda em cada PR/push p/ `main` e faz as 3 checagens abaixo + **barra se `api/` passar de 12 funções** (limite Vercel que já travou prod). Localmente: `node scripts/ci-validate.js`.
- **Scripts inline do `index.html`:** extrair cada `<script>` sem `src` e rodar `new Function(corpo)` (deve dar 0 erros).
- **`lib/` e `api/`:** `node --check <arquivo>`.
- Calculadoras/IA: testar a lógica com valores de referência conhecidos quando possível.

### ⚠️ Verificador que sai com código 0 quando falha é pior que verificador nenhum
Achado em 2026-07-28: o `audit_resumos.js` imprimia **"DIVERGENTES: 1"** e ainda assim terminava com **exit 0**. Faltava o `process.exit`. Qualquer hook, CI ou `&&` na linha de comando olharia o código e daria tudo por certo. É a mesma família do `git push … | tail -1`, que na véspera imprimiu "PUSH OK" sobre um push rejeitado — **o código de saída da pipeline é o do `tail`**.
- **Regra:** todo verificador termina com `process.exit(falhas ? 1 : 0)`, e nunca se decide sucesso pelo **texto** da saída.
- **Como se prova que um verificador verifica:** sabotar um valor e exigir que ele acuse. Foi assim que se descobriu que o `check_info_db.js` passou meses imprimindo "16/16" sem nunca ter lido o 2º lote.

### O que os verificadores de artigo cobrem hoje (2026-07-28)
| Campo | Quem confere | Contra o quê |
|---|---|---|
| `resumo` | `audit_resumos.js` | md5 do banco vs fonte local (tolera normalização cosmética do editor) |
| `pts` | `audit_resumos.js` | md5 do banco vs fonte local — **entrou só em 28/07**; antes ninguém olhava |
| `info` (ficha) | `check_info_db.js` + `check_info_db.sql` | hash concat_ws espelhado nos dois lados, **incluindo `curva`** desde 28/07 |
| números da ficha | `check_numeros.js` | todo número da ficha existe na prosa — **coerência interna, não veracidade** |

- **O espelho SQL agora mora no repositório** (`scratchpad/artigos/check_info_db.sql`). Antes era reescrito de cabeça a cada lote, o que tornava a prova irreproduzível. **Ele se valida reproduzindo os hashes dos lotes anteriores byte a byte** — se um hash antigo mudar sem que o dado tenha mudado, o errado é o espelho.
- **Armadilha de número no espelho:** `->>` devolve a forma textual do jsonb, que preserva zero à direita (`8.0` continua `"8.0"`), enquanto `String(8.0)` em JS dá `"8"`. Os dois lados usam `::float8::text` / `String(Number(x))` para normalizar. Sem isso, um `2.0` digitado num INSERT diverge de um `2.0` escrito em JS **sem nenhuma diferença real**.

### Renderizar a ficha de um lote antes de gravar
`node scratchpad/artigos/render_fichas.js info4.js INFO4 trials4.js TODOS4 > fichas.html` monta a página usando **os renderizadores recortados do `index.html` de verdade** (não uma cópia — cópia diverge) e o CSS `.fx-*` do próprio arquivo. Depois, screenshot por ficha com o Chromium de `/opt/pw-browsers`. Foi assim que se decidiu tirar a `curva` do IMPROVE-IT: com 7 anos o eixo do tempo cai no passo de 6 e sairia com marcas só em 0 e 6.

## Sandbox / rede
- Egress restrito a uma allowlist. Confirmados acessíveis: `raw.githubusercontent.com`, `github.com`, `api.anthropic.com`. Bloqueados: `who.int`, `cdc.gov` (usar mirrors no GitHub).
- Não há ferramenta para gravar variáveis de ambiente na Vercel — isso é feito pelo usuário no painel.
- Verificação de produção (GET): `mcp web_fetch_vercel_url` em `https://www.endodirect.com.br/...` (não satisfaz auth de endpoints protegidos).

## GitHub
- Usar as ferramentas `mcp__github__*` (sem `gh` CLI). Escopo: `endodirectmaster-cmyk/endodirect`.
- Merge 401 transitório às vezes ocorre — apenas re-tentar `merge_pull_request`.

## Manutenção do cofre
Atualizar a nota relevante a cada mudança e registrar decisões em [[Decisões]]. Manter `atualizado:` no topo.
- **Hook SessionStart (2026-06-14, ampliado 2026-06-15):** `.claude/settings.json` injeta no início de toda sessão o lembrete de manter o cofre atualizado **e agora também o conteúdo de `cofre/Convenções de Trabalho.md` + `cofre/Decisões.md`** (via `jq --rawfile`, com fallback se faltar `jq`/arquivo), para começar já ciente de convenções, decisões e lições. Sincronizar o cofre faz parte de toda tarefa, não é opcional. (Há também um hook **Stop** que faz `git push origin HEAD`.)

## Lições operacionais (aprendidas em campo)
Hábitos que evitam retrabalho — ler antes de agir, especialmente em bugs e deploy:
- **Bug de estado/sync? Conferir o dado REAL antes de propor fix.** Usar `mcp execute_sql` no Supabase (`endodirect_global_state.payload`, `endodirect_app_state`, definições de RPC/trigger via `pg_get_functiondef`) para ver o estado de verdade. Lição cara (2026-06-15): empurrei o #312 (`applyStatePayload personalOnly`) como palpite para o "radar volta no F5" e estava errado; a causa real (seed `defaultMuralAvisos` com `at` relativo) só apareceu ao olhar o banco. Diagnóstico empírico > teoria; um fix especulativo custa um ciclo de deploy.
- **Depois de mergear, confirmar que o deploy de produção ficou READY.** Um PR mergeado pode estar **fora do ar**: usar `mcp list_deployments`/`get_deployment` (team `team_fufkQHFICWnQDbeIKmAKo6a8`, project `endodirect`) e checar `state:READY` no `target:production`. Lição (2026-06-15): #311/#312/#313 ficaram em **ERROR** (limite de 12 funções) e o último READY no ar era o #310 — o usuário via o bug "corrigido" persistir. Build pode concluir e ainda dar ERROR em "Deploying outputs" (limites de plano). Logs: `get_deployment_build_logs`.
- **Limites do plano Vercel (Hobby):** **12 serverless functions** em `api/` (projeto no teto) e **2 cron jobs**. Não criar função nova em `api/` sem remover outra; lógica reusável vai em `lib/` (módulo, não conta). Ver [[Decisões]] e [[Integrações]].

### Teto de 12 funções: por que NÃO subir de plano (2026-07-28)
Pergunta do Rodolpho: *"resolva pendência do vercel. qual a melhor recomendação?"*

**A contagem não é o gargalo, e já está resolvida por arquitetura.** A Vercel conta **arquivos** em `api/`, não rotas — então um handler que roteia por ação vale por muitos endpoints. O projeto já faz isso em dois lugares: `api/ai.js` roteia por `kind` (`support`, `support_list`, `support_reply`, `support_mine`, `openi`) e o `api/admin/refresh-radar.js` roteia por `action` (`discussao`, no #626). Endpoint novo entra assim; arquivo novo, não.

**Quando faltar espaço de verdade,** a folga mais barata é juntar os **dois crons num handler só** — dois agendamentos podem apontar para o mesmo caminho com query diferente (`?job=radar` / `?job=health`), o que devolve 1 slot sem tocar em `checkout/` nem no `newsletter/unsubscribe` (esse tem URL já enviada em e-mails; mudar o caminho quebra o List-Unsubscribe de quem já recebeu).
- **⚠️ Mas não fazer isso preventivamente:** é o cron do healthcheck que posta a **Questão do Dia** às 10h BRT. Ele falhou silenciosamente em 27/07. Operar nele para liberar um slot que ninguém está pedindo é risco sem retorno — fazer só quando o 13º endpoint existir.

**O Pro (US$ 20/mês) só se compra tempo, não contagem.** O Hobby limita a execução a **60s**; o `vercel.json` pede `maxDuration: 120` para o `api/ai.js` e **esse pedido não tem efeito no Hobby**. O candidato natural a estourar é a **discussão completa do Mural**, que manda o texto integral do artigo e pede ~12 KB de volta. **Como decidir sem chutar:** clicar o botão num artigo longo em produção; se der timeout, o Pro (300s) compra algo real — e antes disso ainda cabe cortar o texto enviado (só métodos, resultados, discussão e tabelas) e limitar o `max_tokens`.
- **Aviso "Unverified" do hook Stop é benigno:** ele acusa o commit de **squash-merge do próprio GitHub** (committer `noreply@github.com`) no tip da `main`. NÃO reescrever (é histórico já mergeado). Meus commits usam `Claude <noreply@anthropic.com>`.
- **Validar sempre antes de commitar** (scripts inline + `node --check`), conforme a seção acima — barato e evita deploy quebrado.
- **⚠️ O check `validate` pode simplesmente NÃO APARECER no PR — ausência não é aprovação.** No **#606 (2026-07-25)** o `pull_request` do `ci.yml` não gerou run nenhum: o `get_status` do PR trazia só o **Vercel**, e a lista de runs da branch parava no commit anterior. "Sem check vermelho" leu como verde e quase passou batido. **Conferir que o run existe**, não só que nada falhou — `actions_list` (`list_workflow_runs`, filtrando pela branch) e comparar o `head_sha` com o tip do PR. Rede de segurança que funcionou: rodar **`node scripts/ci-validate.js` localmente** (é exatamente o que o workflow executa) antes de mergear; o `push:` em `main` também dispara o mesmo workflow **depois** do merge (rodou e passou em `779d6575`) — mas aí já está em produção.
- **⚠️ LIÇÃO (2026-07-25) — INSERT grande de conteúdo: nunca confiar na transcrição; conferir por hash.** Ao inserir os 16 artigos no `payload.diretrizes`, colei o SQL em lotes de 4 e **truncei um item no meio** (FLOW 2024): ele perdeu o array `flashcards` **e** o flag `rascunho:true`. O JSON truncado continuou **sintaticamente válido** (cortou campos antes da chave de fechamento), então o Postgres aceitou sem erro — e o artigo incompleto ficou visível aos assinantes por alguns segundos até eu corrigir. Regras que ficam:
  1. **Lotes de no máximo 2 itens** por `execute_sql` (~9 KB). Truncagem escala com o tamanho do bloco.
  2. **Conferir por md5, não por olho.** Depois de inserir, comparar banco × fonte local campo a campo: `md5(v->>'resumo')`, `md5(string_agg)` dos `pts`/`flashcards`, `md5(concat_ws)` dos metadados — e diferenciar por script, não visualmente. Contagem de itens não pega nada: o item truncado **está lá**.
  3. **Se o lote carrega um flag de segurança** (`rascunho`, `privado`), reaplicá-lo em um `update` separado depois do insert — idempotente e imune à truncagem: `set payload = jsonb_set(..., jsonb_agg(case when v->>'tipo'='artigo' then v || '{"rascunho":true}'::jsonb else v end order by ord))`. Flag correto não pode depender de o insert ter saído inteiro.
