# Achados meus (fora dos auditores) — auditoria de 10/08/2026

## ⚠️ O ESCOPO MUDOU NO MEIO: "os resumos e as diretrizes" são as ABAS DA PLATAFORMA

Comecei auditando o núcleo (`CLINICAL_GUIDELINES`) e a pasta
`cofre/Diretrizes Clínicas/`. No meio, achei o `dirSoNosResumos()` no
`index.html` e caiu a ficha: a plataforma tem uma aba **Resumos** e uma aba
**Diretrizes**, com conteúdo próprio no Supabase
(`endodirect_global_state.payload.diretrizes`).

**São 215 itens e 1.717.639 caracteres de texto clínico** — 24× o núcleo:
`resumo` 828k, flashcards 267k, pontos-chave 222k, fluxogramas 179k, mapas 152k,
info 70k. Distribuição: Diabetes 37, Obesidade 33, Tireoide 20, Osteometabolismo
19, Neuroendocrinologia 18, Adrenal 16, Lípides 15, Endocrinopatias 11,
Pediátrica 11, Feminina 11, Esporte 8, Masculina 6, Básica 5, Transgeneridade 5.

**Isto não se audita numa tacada.** O que fiz foi a varredura que já tinha
provado valor: **os cinco erros que corrigi no núcleo existem também aqui?**
Três existem. Os achados 5, 6 e 7 abaixo.

---


Vindos do crivo mecânico de cortes (`cortes.js`) e da leitura das entradas
pareadas. Os auditores rodam em paralelo e reportam por conta deles; convergir é
bom sinal, divergir manda olhar de novo.

---

## 1. ✅ CORRIGIDO — copeptina `Na ≥147` vivo na nota do cofre

**Onde:** `cofre/Diretrizes Clínicas/Deficiência de AVP e de Ocitocina (revisão, JCEM 2026).md`,
linhas 21 e 23.

**Severidade:** GRAVE. Essa pasta é a fonte de verdade declarada de flashcards,
questões, newsletter, Mural e resumos de aula.

**Prova (primária, não parafraseada):** Fenske W et al. *A Copeptin-Based
Approach in the Diagnosis of Diabetes Insipidus.* N Engl J Med 2018;379:428–39 —
baixado do Drive, texto em `scratchpad/acervo/textos/1V2GSmfqGC114ZTFKQT1XAVVKpi1atjuA.txt`.
Três ocorrências de "at least 150 mmol per liter" ligadas à coleta da copeptina;
**`147` tem zero ocorrências no artigo**.

**Direção do erro:** colher com 147 sub-estimula → copeptina mais baixa → cai no
≤4,9 → lê-se deficiência de AVP → desmopressina em quem tem polidipsia primária
→ hiponatremia.

**Estado:** nota corrigida, com a citação primária e o porquê. O núcleo já estava
certo desde 09/08.

---

## 2. ⚠️ ABERTO — o núcleo discorda de si mesmo sobre metformina na gestação

**Onde:** núcleo #2 × núcleo #67, mesma fonte declarada (SBD).

- **#2:** "metformina **só como alternativa quando a insulina for inviável**"
- **#67:** "metformina **é opção** (atravessa a placenta)"
- **Nota do cofre (fonte preferencial declarada):** "**Metformina = opção** (não
  1ª linha): atravessa a placenta; **sinal de crescimento acelerado na prole**
  exposta intraútero → cautela."

**Severidade:** SÉRIO. O núcleo vai inteiro em toda chamada; o modelo lê as duas
entradas e pode citar qualquer uma. O médico que pergunta "posso usar metformina
na DMG?" recebe respostas diferentes conforme a que dominar.

**Direção:** #2 é mais restritivo que a fonte (menos metformina, mais insulina) —
o lado seguro, mas ainda assim não é o que a diretriz diz.

**Achado embutido, e é o pior dos dois:** **nenhuma das duas entradas carrega a
cautela que justifica a metformina não ser 1ª linha** — o sinal de crescimento
acelerado na prole. "Atravessa a placenta" sozinho não transmite isso: soa como
detalhe farmacocinético, não como motivo de cautela.

⚠️ **Não há extrato verbatim da diretriz de DMG da SBD.** A melhor prova
disponível é a nota do cofre, que é resumo. Registrado como lacuna de acervo.

**Conserto proposto (junto com os demais, numa edição só do núcleo):** alinhar #2
ao #67 e acrescentar a cautela do crescimento fetal nas duas.

---

## 3. Verificações que passaram (não são achado, mas foram feitas)

- **Critérios de DMG no TOTG 75 g** — núcleo #67 (`jejum ≥92 / 1 h ≥180 / 2 h
  ≥153`) confere com a nota do cofre e com o README da pasta. Sem divergência.
- **Metas glicêmicas na gestação** (`jejum <95, 1 h <140, 2 h <120`) — idênticas
  em #2, #47, #67 e na nota. Sem divergência.
- **Corte do DST 1 mg** (`1,8 µg/dL`) — idêntico em núcleo #6, #7, #79, na nota
  de Cushing e no bloco profundo do incidentaloma. Um só valor em cinco lugares.
- **Copeptina no núcleo** — o texto de #68 confere com a fonte primária, inclusive
  na ordem de leitura (basal primeiro). A diferença entre "ultrapassou 150" e "pelo
  menos 150" é de uma unidade num sódio que se está empurrando para cima: não muda
  conduta, e não vale o custo de invalidar o `nucleo_sha`. **Não é achado.**
- **FSH na POI** (`>25 ESHRE` × `>30 NICE`) — a nota rotula as duas réguas. Correto.
- **ACTH na subtipagem** (`<10` independente, `≥20` dependente) — não são valores
  divergentes, são as duas bordas da zona cinzenta. Correto.

---

## 3b. ❌ O QUE EU TENTEI MEDIR E NÃO CONSEGUI — o lastro das notas do cofre

Quis publicar um inventário: das 39 notas de `cofre/Diretrizes Clínicas/`,
quantas têm extrato verbatim atrás (conferíveis byte a byte), quantas têm o PDF
no Drive (conferíveis se baixar) e quantas não têm nada. **Escrevi o casador duas
vezes e ele mentiu as duas.** Apaguei-o em vez de publicar o número.

- **v1, casando por TÍTULO:** deu "Diabetes na Gestação (SBD)" → *Monogenic
  diabetes* e "Raquitismo Hipofosfatêmico" → *Craniopharyngioma*. Duas causas, as
  duas minhas: as notas têm título em **português** e os artigos em **inglês**,
  então não havia palavra em comum e o "melhor" casamento era ruído puro; e o
  Jaccard dividia pelo **menor** conjunto, então um título de duas palavras casava
  1,00 com qualquer coisa.
- **v2, casando por SOBRENOME DO PRIMEIRO AUTOR:** errou para o outro lado —
  sobrenome colide entre artigos diferentes, e casou "Hiperparatireoidismo
  Primário e Sistema Cardiovascular" com o *Posicionamento Nutricional da ABESO*.
  Pior: marcou "Tireoide na Gestação (ATA 2026)" como SEM LASTRO **existindo
  extrato verbatim da ATA 2026 no acervo**, só porque a nota não tem linha de
  `Citação:` no formato esperado.

**O que fica:** o pareamento nota ↔ artigo não se resolve por metadado, porque o
formato das citações das notas varia e sobrenome não identifica artigo. São 39
notas — isso se faz lendo, não casando string. **Não tenho o número, e prefiro
dizer isso a publicar um que não sustento.**

---

## 5. ⚠️ ABERTO — romosozumabe sem a cautela cardiovascular, no item mais geral de osteoporose

**Onde:** item `Osteoporose: Diagnóstico e Tratamento` (Osteometabolismo, fonte
"Síntese Endodirect · Vilar 8ed + William"), 7.346 chars.

**Medido, não impressão:** o item cita **romosozumabe 5 vezes** e tem **zero**
ocorrências de `infarto`, `AVC`/`acidente vascular` e `cardiovascular`. Oferece-o
como anabólico intercambiável ("teriparatida e abaloparatida … e romosozumabe …
Em muito alto risco, considerar iniciar pelo anabólico").

**Prova de que é omissão e não escolha editorial:** o item irmão da MESMA
subespecialidade, `Osteoporose na pós-menopausa`, cita romosozumabe 10 vezes e
carrega 2 `infarto`, 4 `AVC` e 4 `cardiovascular`. E o resumo do próprio ensaio
`ARCH (2017)` — que é onde o desequilíbrio cardiovascular apareceu — tem 6/8/9.

**Severidade:** GRAVE. É o mesmo defeito que corrigi no núcleo em 09/08, vivo no
conteúdo que o médico lê. **Não editei o Supabase** — é conteúdo clínico dele.

---

## 6. ⚠️ ABERTO — PTU→metimazol na gestação, contra a ATA 2026 que a própria base carrega

**Onde:** 5 itens de Tireoide + 1 de Endocrinologia Básica. Os dois que mandam
TROCAR:
- `Tireoide e gestação`: "**Antitireoidiano: PTU no 1º trimestre** e **metimazol
  a partir do 2º**"
- `Tireoide e Gestação` (**flashcard**, que o aluno memoriza): pergunta "O que
  fazer [depois do 1º trimestre]?" → resposta "**Trocar o propiltiouracil por
  metimazol.**"

Os outros três (`Hipertireoidismo e doença de Graves`, `Tireotoxicose`,
`Doença de Graves`) dizem só "PTU no 1º trimestre" — incompletos, não invertidos.
**Nenhum dos seis traz o marco de 16 semanas.**

**Prova — ATA 2026 verbatim (`1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.txt`), três
passagens independentes:**
> "treat with PTU (if available) **until 16 weeks gestation**. The choice for a
> preferred ATD **after 16 weeks gestation is unknown**."
> "If ATD therapy continues to be required after 16 weeks gestation, **it remains
> unclear whether PTU should be continued or switched to MMI**."
> "…after 16 weeks' gestation (**the time of skin closure**) … As both medications
> are associated with potential adverse effects and **switching between the two
> may potentially result in a period of suboptimal control**."

**Severidade:** GRAVE. Dois erros somados: o marco é **16 semanas**, não o fim do
1º trimestre (~13) — a troca acontece 3–4 semanas cedo demais, dentro da janela
em que a diretriz ainda quer PTU; e a **troca em si** é o que a diretriz declara
desconhecida, avisando que trocar pode causar período de controle subótimo.

---

## 7. ⚠️ ABERTO — régua pediátrica P95 atribuída a "OMS/CDC"

**Onde:** item `Obesidade na Infância e Adolescência` (Endocrinologia Pediátrica):
"**Sobrepeso:** IMC entre percentil 85 e 95. **Obesidade:** IMC ≥ percentil 95. …
Usar as curvas de IMC para idade e sexo (**OMS/CDC**)".

**Prova — tabela do Posicionamento ABESO
(`1w6SQlCHJ-gqXdzUxXK0xfmS2BrdezsyK.txt`):**
> "Sobrepeso > 85 e < 97 (escore-z > +1 e < +2) · **Obesidade > 97** e < 99,9
> (escore-z **> +2**)"

**Severidade:** SÉRIO. A criança no percentil 96 é **obesa** pela régua do item e
**sobrepeso** pela régua da ABESO. O item junta "OMS/CDC" como se fossem a mesma
curva, e a régua brasileira é a que o pediatra endocrinologista daqui usa. É o
mesmo defeito que corrigi no núcleo — o conserto é o mesmo: dizer QUAL curva.

⚠️ **Conferi antes de acusar, e quase errei ao contrário:** eu ia afirmar que a
fonte brasileira usa P97 de memória. A diretriz brasileira de obesidade de 2025
não trata de percentil pediátrico (`percentil`: 1 ocorrência, e é sobre
percentil 25-75 de fração de ejeção). Quem tem a tabela é o Posicionamento
Nutricional. Sem abrir os dois, eu teria citado a fonte errada.

---

## 4. Sobre o crivo mecânico (`cortes.js`) — o que ele é e o que não é

409 cortes reconhecidos, 52 exames, 31 grupos com mais de um valor, 15 tocando o
núcleo.

⚠️ **Não vira guarda de CI.** A maioria das divergências é legítima: meta de LDL
muda com o risco, corte de cortisol muda com o teste, definição de remissão muda
com o estudo. Falso positivo alto vira paisagem — a régua do projeto reprova isto
como guarda. **É lista de leitura**, e como lista rendeu o achado nº 1.

**E ele mentiu duas vezes antes de servir, as duas por minha causa:**
1. Leu `não-HDL-c` como `HDL-c` e inventou "11 valores divergentes" num artigo só.
2. **Sigla curta casando no meio de palavra** — `arr` dentro de "a**rr**itmia",
   `rac` dentro de "satu**rac**ão" e "sup**rac**orreção". O potássio da
   cetoacidose virou "relação aldosterona/renina"; a testosterona virou
   "albuminúria". São 44 cortes falsos de 453. É a MESMA colisão de radical no
   meio de palavra já registrada no cofre, e eu a repeti.
