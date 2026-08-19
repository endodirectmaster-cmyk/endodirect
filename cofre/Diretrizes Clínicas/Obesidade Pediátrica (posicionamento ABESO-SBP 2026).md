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

## Pendência

A **camada profunda** de Endocrinologia Pediátrica **não recebeu extrato deste
documento**. O pipeline exige texto-fonte em `scratchpad/acervo/textos/`
(gitignored) + extrato com `cit`/`cit_sha` ancorados por offset. É trabalho
próprio, do tamanho de uma sessão — e é o caminho certo para a profundidade que
não coube no núcleo.
