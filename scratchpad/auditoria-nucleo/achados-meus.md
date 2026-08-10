# Achados meus (fora dos auditores) — auditoria de 10/08/2026

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
