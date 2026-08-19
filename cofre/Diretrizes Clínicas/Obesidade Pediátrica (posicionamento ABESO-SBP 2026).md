---
tags: [cofre, diretriz, obesidade, pediatria, abeso, sbp]
atualizado: 2026-08-19
---

# Obesidade Pediátrica — Posicionamento Brasileiro ABESO/SBP 2026

**Fonte:** Posicionamento Brasileiro sobre Avaliação e Tratamento da Obesidade
Pediátrica — realização conjunta **ABESO + Sociedade Brasileira de Pediatria**,
**primeiro capítulo da Diretriz ABESO 2026**. Lançado em **18/08/2026**.
https://diretriz.abeso.org.br/posicionamento-brasileiro-sobre-avaliacao-e-tratamento-da-obesidade-pediatrica/

⚠️ **Como o documento chegou:** o proxy do sandbox bloqueia `abeso.org.br`, não
havia cópia no Drive nem no Gmail, e o documento é de véspera. O professor mandou
o texto em **prints, seção por seção**. O texto-fonte ficou em
`scratchpad/abeso-ped/fonte.md` — **fora do repositório**, pela regra de nunca
commitar texto integral de terceiro.

---

## 🚨 As duas divergências que a base tinha, e o que elas custavam

### 1. A régua de corte não tinha faixa etária — e errava abaixo dos 5 anos

O núcleo citava o **Posicionamento ABESO 2022** com **uma régua só**, declarada
como valendo "até 19 anos". O 2026 tem **duas**:

| faixa | curva | sobrepeso | obesidade |
|---|---|---|---|
| **< 5 anos** | OMS 2006 | IMC > +2 DP | **IMC > +3 DP** |
| **5–19 anos** | OMS 2007 | IMC > +1 DP | **IMC > +2 DP** |

A régua que estava no ar era **exatamente a de 5–19 anos**, aplicada a toda a
pediatria. Abaixo dos 5 anos o erro é de **uma categoria inteira, nos dois
sentidos**: aos 3 anos, escore-Z **+2,5 é sobrepeso** (a plataforma dizia
obesidade) e **+1,5 está abaixo do corte** (a plataforma dizia sobrepeso).

⚠️ **E o +3 DP passou a ter dois sentidos:** limiar de **obesidade** abaixo dos 5
anos e de **obesidade grave** dos 5 aos 19 (grave = **≥120% do P95 ou Z ≥ +3**,
seção 7.1). Por isso as entradas novas **dizem a idade antes do número, sempre**.

### 2. Cirurgia bariátrica: "13 anos" é dos EUA, não do Brasil

O núcleo trazia da **AAP 2023** que a cirurgia vale "a partir dos 13 anos". No
Brasil vale a **Resolução CFM 2.429/2025**, que o Posicionamento cita:

- **16 a 18 anos** — permitida, com acompanhamento multidisciplinar;
- **14 a 16 anos** — **só excepcionalmente**, com **IMC > 40** e complicação
  clínica **com risco de vida**;
- consentimento livre e esclarecido dos responsáveis, **obrigatório**.

É a mais perigosa das duas porque **não é nomenclatura, é regulatória**: agir pelo
"13 anos" põe o médico fora da resolução do CFM.

### 3. O capítulo do aluno usava a régua americana

Os `pts` do capítulo privado diziam "sobrepeso P85–95, obesidade ≥P95" — **corte
do CDC/AAP**, não o brasileiro. Corrigido na reescrita.

---

## ✅ O que já estava certo (conferido, não presumido)

- **Farmacoterapia a partir dos 12 anos** — liraglutida e semaglutida têm
  aprovação ANVISA nessa faixa.
- **≥ 26 horas** de intervenção comportamental — confirmado, e agora com o número
  por trás (USPSTF 2024: 50 ECRs, n=8.798, **−0,7 kg/m²**, IC95% −1,0 a −0,3).
- **Obesidade grave = ≥120% do P95 ou Z ≥ +3** — confirmado na seção 7.1.
- **Curvas da OMS como padrão brasileiro** — confirmado e reforçado.

## 🆕 O que não existia na base

RCEst (**>0,5**, e **>0,55** em contexto selecionado) · posição brasileira sobre o
framework **Lancet 2025** (não substitui a OMS; exigir comorbidade **postergaria**
o diagnóstico) · rastreio de IMC **a partir dos 2 anos** · modelo dos **4 M** ·
**ALT pediátrica < 26 U/L (M) e < 22 U/L (F)**, com ≥80 U/L indicando especialista ·
**síndrome metabólica não se diagnostica antes dos 10 anos** · **TG > 100 mg/dL dos
2 aos 9** e **> 130 dos 10 aos 19** (o corte do menor é o mais baixo) · apneia no
SUS tratada **sem aguardar polissonografia** · MAPA/eco/polissonografia **não são
triagem de rotina** · rastreio anual de depressão **a partir dos 12 anos** ·
**anorexia nervosa atípica com peso elevado** · **NCOA1** entre as monogênicas ·
**MC4R cursa com PA mais BAIXA** que controles de mesmo IMC · linguagem inclusiva
e o termo **"medicamentos antiobesidade"**.

---

## ⚠️ O NÚCLEO ENCOSTOU NO TETO — e isso é decisão de arquitetura, não detalhe

O bloco `CLINICAL_GUIDELINES` viaja como **prefixo cacheável em TODA chamada de
IA** e tem teto de **80.000** caracteres em `api/ai.js`. A primeira versão desta
atualização levou o núcleo a **84.012** — o guarda
(`scripts/test-teto-diretrizes.js`) reprovou dizendo que **4.012 caracteres
seriam cortados em silêncio do FIM do bloco**.

Depois de enxugar, ficou em **79.443/80.000 — folga de 557 caracteres**.

⚠️ **A próxima diretriz não cabe no núcleo.** O que entrar daqui em diante tem de
ir para a **camada PROFUNDA** (`lib/clinical-deep-data.js`, por subespecialidade),
que é para isso que ela existe. O detalhe de ensaio (n, percentuais, Teen-LABS,
STEP TEENS) foi deliberadamente para os **capítulos**, não para o núcleo.

## ⚠️ MUDAR O NÚCLEO QUEBRA AS RESSALVAS DOS EXTRATOS — e isso é o sistema funcionando

Ao acrescentar as técnicas cirúrgicas na linha pediátrica, o `confere-ressalvas`
reprovou o extrato de **cirurgia bariátrica no ADULTO**: a ressalva dele declarava
em `nucleo_ausente` que o núcleo **não falava** de "Roux", "gastrectomia vertical"
e "banda gástrica" — e passou a falar.

⚠️ **O conserto NÃO foi apagar os três termos e seguir.** A lacuna do ADULTO
continua real: o núcleo só fala de técnica **em pediatria**. Os termos saíram de
`nucleo_ausente` (literalmente deixaram de estar ausentes) **e o `conflito` ganhou
um parágrafo explícito** dizendo que a linha nova é sobre adolescentes (CFM
2.429/2025) e **não se transporta para o adulto**, para quem a fonte segue sendo a
referência de técnica. Apagar sem esse parágrafo faria o modelo responder adulto
com régua de adolescente.

Depois disso, **26 fatos** ficaram com selo de núcleo velho. Antes de carimbar com
`--selar`, provei por diff que **a única mudança no núcleo foi nas entradas de
obesidade pediátrica** (1 entrada saiu, 3 entraram) e conferi que nenhum dos 26
atribui ao núcleo algo dessa área. O próprio script avisa: *"carimbo sem leitura é
enfeite"*.

## ⚠️ INCONSISTÊNCIA DENTRO DO PRÓPRIO DOCUMENTO — registrada, não resolvida

O ensaio **MOCA** da metformina aparece com dois desenhos:

- corpo da seção 7.4: **n = 85, 10–16 anos**
- Tabela 6: **n = 15, 8–18 anos**

Os dois não podem estar certos. **Decisão:** citar a metformina pelo efeito de
metanálise (**−1,35 kg/m²**), que bate nos dois lugares, e **não citar o n do
MOCA**. Vale perguntar à ABESO.

---

## O que entrou no produto

- **Núcleo:** a entrada única virou **três** — diagnóstico, comorbidades/exames e
  tratamento (`index.html`, `CLINICAL_GUIDELINES`).
- **Capítulo reescrito:** *Obesidade na Infância e Adolescência* — 3.858 → **7.284**
  caracteres, 12 pontos, 8 flashcards, mapa e tabela 📊.
- **Capítulo novo:** *Tratamento da Obesidade na Infância e Adolescência* —
  **9.776** caracteres, 13 pontos, 9 flashcards, mapa e tabela 📊. ⚠️ Acima da
  banda da casa (4.845–7.234); mantido inteiro porque estilo de vida,
  farmacoterapia, cirurgia e psicossocial formam um fluxo único. **Candidato a
  divisão se o professor preferir.**
- Base: 226 → **227 itens**; públicas seguem **66**, `privado` booleano nos dois.

## ⚠️ ESCREVI OS DOIS CAPÍTULOS COM O JARGÃO QUE EU TINHA ACABADO DE LIMPAR

Resposta do professor ao abrir o capítulo novo: *"Mais uma vez com jargão de IA"*.
E ele tem razão — em **17/08** eu removi 81 alertas e títulos retóricos de três
capítulos de Obesidade, e em **19/08** escrevi dois capítulos novos exatamente no
mesmo vício: **26 alertas na prosa** (10 + 16) e títulos como *"A lógica do
tratamento"*, *"Estilo de vida: a intensidade é o ingrediente ativo"*, *"O eixo
psicossocial não é acessório"*, *"Farmacoterapia pediátrica em uma tela"*.

**A régua da casa, que já estava decidida:** títulos **nominais**, conectivos
formais, **zero alerta na prosa**. O capítulo de referência é *Ganho de Peso
Induzido por Fármacos*.

Também caíram as construções de IA: *"nunca sai de cena"*, *"o número que define
eficácia é a dose de contato"*, *"não é o tipo de dieta que separa quem responde,
é a quantidade de contato"*, *"deixam de ser teóricos e viram alternativa real"*,
*"a dose tolerada é uma opção válida, não um fracasso"*, *"a pista continua sendo
a estatura"*, *"contraintuitivo e cobrado"*.

**Conservação provada, não presumida:** 26 → **0 alertas**, títulos todos
nominais, tabelas 📊 preservadas nos dois, e os **49 números clínicos conferidos
um a um** (cortes de DP, RCEst, ALT, TG, doses, percentuais dos ensaios, CFM
2.429/2025) — **nenhum perdido**. Tamanhos: 7.284 → 7.170 e 9.776 → 9.774.

⚠️ **A lição que fica:** limpar jargão de um lote não conserta o hábito. **Capítulo
novo nasce na régua**, e a régua se confere contra o capítulo aprovado antes de
escrever — não depois de o professor abrir a tela.

## ✅ A CAMADA PROFUNDA SAIU — e a pendência era o caminho certo

**161 fatos**, cada um com citação literal ancorada por *offset + hash*, extraídos
das seções 1 a 12. Endocrinologia Pediátrica saiu de **ZERO bloco** para dois.

O `tema` de cada fato foi escrito para voltar **sozinho** à IA (o montador só
envia `afirmacao`), com a **faixa etária colada ao número** — porque neste
documento o mesmo número muda de sentido com a idade: **+3 DP** é limiar de
obesidade abaixo dos 5 anos e de obesidade grave dos 5 aos 19; e o
**triglicerídeo alterado é >100 mg/dL dos 2 aos 9 e >130 dos 10 aos 19** — o
corte do menor é o mais baixo.

---

## 🚨 O PRIMEIRO ARTIGO DE UMA ÁREA VAZIA MEXE NO ROTEAMENTO DA BASE INTEIRA

Este é o achado que vale mais que o conteúdo, e ele **não é sobre obesidade**.

`deepFor` só desce para a segunda área classificada **quando a primeira está
vazia**. Enquanto Endocrinologia Pediátrica não tinha bloco nenhum, a vinheta
*"menina de 9 anos com cefaleia, baixa estatura e calcificação suprasselar"*
roteava para a pediatria e chegava em Neuroendocrinologia **por acidente**, pela
descida. No instante em que a pediatria ganhou o primeiro artigo, a descida parou
e essa menina passou a receber **53k de obesidade pediátrica no lugar dos 295k de
craniofaringioma** — o assunto exato da pergunta.

⚠️ **O próprio arquivo já tinha previsto isso, por escrito**, para a área
masculina: *"Só não dói porque a área masculina está vazia; no dia em que entrar
o 1º artigo de hipogonadismo, vira resposta errada."* Hoje foi esse dia, na
pediatria. **Toda área vazia da base é uma dessas esperando.**

**Consertado por medição, não por palpite.** Duas correções foram medidas em 14
perguntas:

| correção | resolve a vinheta? | efeito colateral |
|---|---|---|
| reclassificar `baixa estatura` como ACHADO | **não** (1014 × 1011 — os dois viram achado e o comprimento continua decidindo) | move "baixa estatura após transplante e corticoide" para Adrenal |
| chave composta **`calcificação suprasselar`** | **sim**, nas duas vinhetas | **nenhum** — as outras 12 perguntas não mudam |

Ficou a que mede. Calcificação suprasselar é o achado de imagem clássico do
craniofaringioma adamantinomatoso — não é chave genérica.

## ⚠️ O EXTRATO NASCEU PARTIDO EM DOIS, E ISSO FOI DECISÃO DE ARQUITETURA

Obesidade tinha 8 blocos e **356k de um teto de 400.000 (89%)**. O documento
inteiro num bloco só levava a área a **405.254** — acima do teto os últimos
blocos **somem em silêncio**, e **400k já é o `TETO_MAXIMO`**: não há para onde
subir. A saída documentada em `lib/clinical-deep.js` é **dividir**.

⚠️ **E não dava para simplesmente arquivar só na pediatria.** Medido em **12
perguntas realistas**: **10 canonizam para Obesidade e nenhuma para
Endocrinologia Pediátrica** — quem pergunta escreve *"obesidade"*, não o nome da
subespecialidade. Pior: *"adolescente com obesidade grave, quando indicar
cirurgia?"* receberia os **8 blocos de ADULTO sem o pediátrico junto** — a
inversão de régua que o núcleo existe para impedir. E não dá para consertar com
chave de roteamento: *"criança … obesidade"* é **co-ocorrência**, e o roteador só
casa substring.

**O corte é por USO, não por tamanho:**

| bloco | o que leva | áreas |
|---|---|---|
| **conduta** (128 fatos) | diagnóstico, avaliação, comorbidades e exames, estilo de vida, farmacoterapia, cirurgia | Endocrinologia Pediátrica **+ Obesidade** |
| **contexto** (33 fatos) | epidemiologia, linguagem inclusiva, síndromes genéticas, ECAP/EDE-Q, equidade, conclusão | só Endocrinologia Pediátrica |

**Nenhum fato foi descartado** — o documento inteiro continua inteiro na
subespecialidade. Obesidade ficou em **397.001/400.000 (99%, folga de 2.999)**.

## ⚠️ O `tema` PROMETIA O QUE TINHA IDO PARA O BLOCO IRMÃO

Ao partir o extrato eu deixei o `tema` original nos dois lados. O do bloco de
conduta continuava anunciando **Prader-Willi, Bardet-Biedl, ECAP, EDE-Q,
linguagem inclusiva e equidade** — tudo que acabara de sair dele. É exatamente o
defeito do prolactinoma (o campo anunciava seções que o extrato não tinha), e
aqui o risco é **estrutural**: dois blocos do mesmo documento, e a tentação é
reaproveitar o tema inteiro. O `tema` não é decoração — ele **pontua a escolha do
bloco**. Reescrito contra a lista de fatos que de fato ficaram em cada lado.

## ⚠️ A RCEst ENTROU NA BASE E NÃO TINHA COMO SER PERGUNTADA

Este documento é a **única fonte da base** que fala de relação cintura-estatura,
e ele a recomenda como acréscimo ao IMC (>0,5 como limiar primário, >0,55 em
contexto selecionado). Medido depois de montar a camada profunda: *"relação
cintura-estatura em criança, qual o corte?"* e *"RCEst maior que 0,5 em
adolescente"* canonizavam para **NENHUMA área** — zero caractere de bloco
profundo, **com a resposta parada ao lado**. Conteúdo que ninguém alcança é
conteúdo que não existe.

Contado antes de criar a chave, que é a regra: `cintura-estatura` e `rcest`
aparecem **só neste extrato** e em nenhum outro bloco da base; `cintura estatura`
sem hífen é **zero** em toda a base. Não há de quem roubar. As chaves vão para
**Obesidade**, e não para a pediatria, porque o bloco pediátrico está declarado
nas **duas** áreas: por Obesidade o médico recebe a resposta pediátrica *e* o
contexto do adulto; pela pediatria receberia só o primeiro.

## ❌ O QUE EU **NÃO** CONSERTEI, E POR QUÊ

*"Síndrome metabólica em criança de 8 anos"* também cai em **nenhuma área** — e a
resposta (o IDF não permite o diagnóstico antes dos 10 anos) está no bloco novo.
**Não criei a chave:** `síndrome metabólica` aparece em **seis áreas** da base
(Obesidade 11, Lípides 9, Pediátrica 4, Neuroendocrino 2, Diabetes 1, Feminina 1).
Chave genérica é como se sequestra área, e o arquivo já registra dois acidentes
desses. A frase equivalente do adulto (*"síndrome metabólica em adulto com IMC
32"*) já roteia, pelo `IMC`; o que falta é **co-ocorrência** (`criança` + assunto),
que o roteador não sabe expressar — ele só casa substring. **Fica registrado como
limitação conhecida do roteador, não como pendência de conteúdo.**

## Guarda

`scripts/test-pediatria-obesidade.js`, no `ci-validate`. Cobre as quatro coisas
que quebram calado: a conduta pediátrica **deixar de chegar** a quem pergunta
(se alguém tirar `Obesidade` da declaração de área), a pediatria **roubar** o
craniofaringioma, o `tema` prometer o que está no irmão, e Obesidade voltar a
estourar o teto. **Verificado por mutação nas três primeiras — as três reprovam.**

## ⚠️ A ÂNCORA DESTE EXTRATO NÃO É UM PDF

O texto-fonte é a **transcrição que eu fiz dos prints do professor**, porque o
proxy bloqueia `abeso.org.br` e o documento é de véspera. O `cit_sha` prova que a
citação bate com a **transcrição** — ele **não prova, e não pode provar**, que a
transcrição bate com o documento publicado. Todo o resto da cadeia é igual à dos
outros extratos. Registrado dentro do próprio extrato (`auditoria.texto_fonte`)
para que ninguém o leia supondo a mesma procedência dos que vieram do Drive.
**Quando o PDF ficar acessível, vale reancorar contra ele.**
