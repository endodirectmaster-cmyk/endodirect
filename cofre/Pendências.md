---
tags: [cofre, pendencias]
atualizado: 2026-10-31
---

# Pendências

## ⏸️ PAUSA (25/10, 16h51 UTC): limite semanal esgotado; retomada em 30/10, 20h05 UTC

- O `get_session` trouxe `rejected` na janela semanal (`seven_day`), já em uso extra
  (`isUsingOverage`), com renovação em 30/10 às 20h00 UTC. Pela regra dos 90%: parei os
  conferentes de 57 e 58, não lancei mais nada e agendei a retomada (`send_later`) para
  20h05 UTC. Na retomada, seguir a regra (agente sentinela primeiro).
- [x] **Erro de carga dos Resumos: corrigido em 25/10, ~17h40 UTC, a pedido do professor
  ("Corrigir"), no uso extra.**
  - Às 12h06 UTC, as 11 páginas de um assinante estouraram o `statement_timeout` de 8 s
    (HTTP 500, 57014).
  - Repetiu às 17h38: 10 das 11 páginas falharam, e a nova tentativa, 40 s depois,
    carregou com ~7 s por página.
  - Causa: cada página remontava a lista inteira a partir do acervo de 17 MB.
  - Correção: cache `endodirect_resumos_paginas_cache`, por (escopos, página), sem DELETE
    (ver "Dados e Supabase").
  - Medido com o assinante: 358 ms na 1ª página de uma versão nova e 2 ms nas seguintes.
- **Na retomada: o lote 2, 2ª parte** (estado na auditoria, abaixo).

## 🖼️ Open-i em manutenção (25/10): o que ainda depende dele

- [x] Figuras de capítulo:
  - 111 passou para cópia própria (CC BY 4.0);
  - 113 saiu (só uso não comercial);
  - nenhum link do Open-i sobra nos Resumos do aluno.
- [ ] Os 10 links de `ig_stories` (stories do Instagram, só do professor) ficam quebrados
  enquanto o Open-i estiver fora.
- [ ] O buscador de imagem do editor de Resumos e a imagem automática da Questão do Dia
  buscam no Open-i e não acham nada enquanto ele estiver fora.
- [ ] Melhoria proposta, a aprovar: o botão "Usar" do buscador copiar a imagem para
  `resumos/pmc/` em vez de ligar direto, para uma queda do Open-i não quebrar o capítulo.

## ✅ FEITO (24/10): calculadora "Risco CV e metas — SBC 2025" (pedido de 22/10, com prints da Clarity)

No ar: ver [[Calculadoras]] (motor único `sbcEstratifica`, PREVENT com DAC/AVC e a errata de 14/10/2026).
- [x] **Calculadora "LDL (Friedewald)" → "LDL (Martin/Hopkins)" (24/10).** Resposta do professor à pergunta "Mantenho, troco ou retiro?": citou "SBC 2025 recomenda a fórmula de Martin/Hopkins" e escreveu *"mantenha essa"*. A de risco CV também passou a estimar o LDL-c quando o laudo não o traz. Detalhes em [[Calculadoras]].
- [x] **Como a fórmula original (31/10).** O professor pediu tirar o LDL-c sem tratamento, os triglicérides, a intensidade da estatina, a ezetimiba, o ácido bempedoico, o anti-PCSK9 e a intolerância; pôr TGO, TGP e plaquetas; e mostrar o risco em 10 anos como na figura dela. Feito: a de risco CV não estima mais o LDL-c (vale o do laudo), o FIB-4 qualifica a esteatose, e o destaque traz o selo e a DCV total em 10 anos, com a DASCV logo abaixo. Detalhes em [[Calculadoras]].
- [x] **Cartões de Lípides (`FC_MEMBER`), 24/10:** à proposta, o professor respondeu *"Pode sim"*. O verso do Friedewald agora cita a Martin/Hopkins, e o da Lp(a) diz "uma vez na vida em todos os adultos" (SBC 2025: forte, moderada). A frente ficou igual: o `reconcile` do `seedFlashcards` propaga o verso novo aos baralhos sem duplicar cartão. `sw.js` v324.
- [x] **HF do cap. 113 alinhada à SBC 2025 (24/10, 23h UTC).** À pergunta "Alinho à diretriz?", o professor respondeu *"siga esse"*.
  - **A tabela "Estratificação de risco e metas na HF" saiu do modelo antigo.** Antes eram muito alto, alto e intermediário, com "placas em mais de um vaso" e fatores adicionais. Agora:
    - **extremo:** evento maior + mais uma condição de alto risco, porque a HF já é uma delas (T4.2);
    - **muito alto:** evento, obstrução ≥ 50% ou CAC > 100 (T4.1, T4.4);
    - **alto:** prevenção primária mesmo sem outros fatores, porque LDL ≥ 190 sem tratamento é alto (T4.1) e a terapia inicial na HF é a do alto (rec. §7.13). É a mesma leitura E-12 da calculadora.
  - As metas incluem o não-HDL-c (< 70, < 80 e < 100).
  - **Tratamento:** a estatina de alta intensidade vem com ezetimiba desde o início (forte, alta). Se a meta não for atingida, acrescenta-se anti-PCSK9 (anticorpo ou inclisirana) ou ácido bempedoico; na intolerância à estatina, usam-se combinações sem ela.
  - Mudaram também o `pts[5]` (metas) e os `flashcards[7]` e `[8]` (base do tratamento e escalonamento).
  - **Conferências:**
    - backup `main-antes-hf-cap113-sbc2025-2026-10-24`, com guarda de md5 e dos campos antigos;
    - o resumo passou de `65210bee` para `85221a96`;
    - só mudaram o `resumo`, o `pts[5]` e os `flashcards[7]` e `[8]`;
    - as 7 figuras do capítulo seguem uma vez cada;
    - a tabela foi renderizada com o `mdToHtml` do app a 390 e 1280 px.
  - A âncora da figura sbc2025-7-2 na lista foi atualizada para o item novo.

### Registro do pedido (22/10)

Pedido do professor em 22/10, com prints da Clarity Prevention (Clarity Health; apoio de
Libbs, Novo Nordisk, Farmoquímica e Daiichi-Sankyo): *"Será que conseguiríamos importar essa
calculadora para a nossa plataforma? Seria uma tarefa agendada para sábado 8h"*. Lembrete na
sessão: `trig_01PMo4FS7qqYwTMyeK1tia6N` (11h UTC), com o plano completo.
- **Não se copia a Clarity:** código, textos, desenho e marca são dela, e o produto é
  patrocinado. Constrói-se a nossa calculadora pela Diretriz Brasileira de Dislipidemias 2025
  (SBC), que é o que ela aplica.
- **Base que já existe:** `LDL_METAS` e `sbcCategoria`, hoje só na calculadora PREVENT
  (prevenção primária, sem "muito alto" e "extremo").
- **O que falta:** a prevenção secundária (eventos, recorrência, gravidade), o diabetes com
  estratificadores, a DRC, a aterosclerose subclínica e a HF, com o motivo da categoria e o
  "Não dispõe" explícito.
- O site da Clarity é bloqueado no proxy desta sessão. Os prints das demais telas, se o
  professor mandar, ajudam a conferir o fluxo.
- **Prints recebidos em 22/10: todas as telas de entrada e mais as de resultado e de conduta.**
  Campos da Clarity, na ordem (só como referência do que ela pergunta; nada de texto,
  desenho ou marca vai para a nossa):
  1. **Evento cardiovascular** (Sim/Não/Não dispõe): infarto, AVC, AIT, angina,
     revascularização, doença arterial periférica, amputação de membros.
  2. **Recorrência e gravidade:** "o último evento ocorreu há menos de 2 anos?".
  3. **Variáveis clínicas:**
     - sexo, idade, peso, altura e IMC (calculado);
     - colesterol total, HDL e LDL (opcional);
     - PAS e PAD;
     - creatinina e TFGe (calculada; conferir se é a CKD-EPI 2021);
     - RAC urinária, HbA1c, PCR (mg/L) e Lp(a) (mg/dL ou nmol/L);
     - AST, ALT e plaquetas (pelo jeito para o FIB-4).
  4. **Fatores agravantes:**
     - em lista (Não dispõe/…): diagnóstico de diabetes, placa carotídea/coronária, DRC;
     - Sim/Não/Não dispõe: aneurisma de aorta abdominal, tem escore de cálcio (CAC),
       história familiar de DCV precoce, síndrome metabólica, fumante, anti-hipertensivo,
       estatina, hipercolesterolemia familiar, artrite reumatoide, psoríase, LES, doença
       inflamatória intestinal, HIV, transplante de órgãos, e cintura aumentada (> 80 cm
       mulher, > 94 cm homem) ou esteatose hepática.
  - **Diabetes** (aparece quando se escolhe diabetes):
    - "Diagnóstico de diabetes": não diabético / DM sem lesão de órgão-alvo / DM com lesão
      de órgão-alvo / não dispõe;
    - tipo (Tipo 2…) e ano de início (duração);
    - neuropatia autonômica cardiovascular: presente / ausente;
    - retinopatia diabética: ausente / leve não proliferativa / moderada, severa,
      proliferativa ou em progressão;
    - outra lista com ausente / incipiente / instalada (provavelmente a nefropatia).
  - **Placa carotídea/coronária:** ausente / estenose < 50% / estenose > 50%.
  - **Leitura:** são as entradas do PREVENT completo (com RAC e HbA1c, que a nossa
    `prevent` já aceita) mais os estratificadores do diabetes e os agravantes da SBC 2025.
    Conferir na diretriz o papel de cada um (Lp(a), PCR, FIB-4/esteatose, doenças
    inflamatórias, HIV, transplante, duração do DM, retinopatia, neuropatia autonômica)
    antes de usar.
  - **Tela de resultado:**
    - categoria pela SBC, com o risco em 10 anos em destaque (no exemplo, "Alto risco",
      21,9%);
    - aviso de reclassificação pelos agravantes (diabetes, síndrome metabólica, HAS,
      cintura ou esteatose);
    - "Modelo usado: PREVENT + HbA1c";
    - tabela de 10 e 30 anos com DCV total, DASCV, IC, doença coronariana e AVC (o pacote
      de coeficientes do PREVENT que já usamos tem as colunas chd e stroke).
  - **Tela de conduta:**
    - classificação final e metas (LDL-c atual, meta de LDL-c e de não-HDL);
    - "redução adicional do LDL-c" = (LDL atual − meta) / LDL atual (no exemplo,
      (123 − 70)/123 = 43,1%), com "considerar terapias combinadas";
    - gráfico da diretriz com a redução média por estratégia: EZE 20%, ABp 20%, EMI 30%,
      EAI 50%, anti-PCSK9 55%, ABp+EZE 40%, EMI+EZE 50%, EAI+EZE 65%, EZE+anti-PCSK9 70%,
      EAI+EZE+ABp 75%, EAI+anti-PCSK9 80%, EZE+ABp+anti-PCSK9 80%, EAI+EZE+anti-PCSK9 85%,
      EAI+ABp+anti-PCSK9 85% e EAI+EZE+ABp+anti-PCSK9 > 90%;
    - conferir esses números no texto da diretriz;
    - na nossa, refazer como tabela própria, que aponta as estratégias que alcançam a
      redução necessária, sem copiar a imagem.
    - **Cartões no fim**, cada um com o atual, a meta, uma etiqueta e a conduta:
      - pressão: no exemplo 135/80, meta < 130/80, "fora da meta", reavaliar e ajustar o
        anti-hipertensivo;
      - peso: IMC 27,8, "sobrepeso", meta 18,5–24,9, perda de peso e mudança de estilo
        de vida;
      - diabetes: "controle metabólico rigoroso", priorizar iSGLT2 ou aGLP-1 se houver
        doença cardiovascular ou renal;
      - HbA1c: 6,9%, meta < 7%, "controle adequado".
    - Botões: voltar, exportar relatório e novo paciente.
    - **Na nossa:** as metas desses cartões vêm de cada diretriz, com a fonte (SBC e SBH
      para a pressão, SBD/ADA para a HbA1c, com meta individualizada), e o conselho de
      diabetes segue o capítulo de tratamento do DM2.
- [ ] Construir, testar (casos-ouro da diretriz), fazer o A/B, publicar e fazer o relatório.

## ✅ GRAVADO (24/10): figuras de adrenal, neuroendocrinologia e lípides, junto com o 2º lote

Pedido do professor em 24/10 (prints do bucket `livros`, pastas Adrenal, Neuroend e Lipides: "adrenal e neuroendocrino"). 232 figuras revisadas; 101 entram em 29 capítulos, 48 consertadas (10 com troca de número, corte ou conduta para bater com o capítulo). Detalhes em [[Ilustrações dos Resumos]].
- [x] Revisão (13 lotes), curadoria, consertos (4 grupos) e prévia: [Figuras de Adrenal, Neuro e Lípides](https://claude.ai/artifact/4FCQK4oXCKMLXaTytxqsTs).
- [x] **Professor aprovou as duas prévias** (esta e a do 2º lote): *"Aprovo tudo."* A fig. 1 do JAMA e a 41.18 do Williams entram com o defeito pequeno que ficou; a fig. 77-5 do Guyton fica como na edição brasileira.
- [x] Lista no `texto.js`; 48 capítulos reexportados (idênticos às prévias); 135 imagens subidas e conferidas; 12 grupos gravados das 22h17 às 22h29 UTC com backup e md5; conferência final (48 md5, 135 figuras uma vez cada, 334 figuras de livros); professor avisado do F5.
- [x] **Conferência de zumbi (22h45 UTC):** os 48 md5 seguem os gravados, o acervo segue com 334 figuras de livros e nenhum save entrou desde o g12 (`updated_at` 22h29min21).
- [x] **2ª conferência de zumbi (23h59 UTC):** tudo igual (o 113 com o md5 novo da HF). Os saves do painel das 23h46 e 23h58 UTC não desfizeram nada.

## 📋 EM ANDAMENTO (desde 23/10, 19h de Brasília): auditoria das Diretrizes

Pedido do professor em 21/10, com prints de "Rastreio de autoanticorpos pancreáticos" e de
"Tratamento do Diabetes tipo 2": *"Os resumos dos capítulos ficaram excelentes. Entretanto,
as diretrizes estão muito pobres, muito enxutas, muito simples. A ideia é deixá-las mais
completas, baseadas nas principais diretrizes [...] muito parecidas com as diretrizes
originais [...] A tarefa não é para agora, mas deixe agendado para sexta-feira, a partir das
19 horas."* Lembrete na sessão: `trig_0162e7q311i7pg4qxUgsmQnL` (22h UTC), com o plano
completo.
- **Ponto de partida (21/10):** 72 Diretrizes públicas, com ~4,3 mil caracteres em média
  (mín. 765, máx. 10.730), ~10 pontos-chave e ~9 flashcards. Os 118 capítulos dos Resumos
  têm ~12 mil caracteres e ~17,5 pontos.
- [x] **Inventário (23/10, 22h UTC):** as mais enxutas são DM2 e IC (765 caracteres),
  Tratamento do DM2 (1,7 mil) e Rastreio de autoanticorpos (2,4 mil); DMPT, neuropatia,
  perioperatório e hipogonadismo masculino estão sem flashcards nem mapa. Os documentos
  originais de muitas estão no Drive do professor (Endocrine Society, ATA, ESE…); os sites da
  SBD e o PMC dão 403 no proxy, mas o texto completo do PMC chega pelo conector do PubMed e o
  PDF do Drive pelo conector do Drive (até 10 MB).
- [x] **Piloto (24/10):** Tireoide e gestação (pos. 18, ATA 2026: 96 recomendações em 25
  tabelas, 32,8 mil caracteres, 25 pts, 25 flashcards, 4 fluxogramas) e Insuficiência adrenal
  primária (pos. 35, Endocrine Society 2016: 41 recomendações, 30 mil caracteres, 25 pts, 25
  flashcards, 3 fluxogramas). Cada uma escrita por um agente a partir do PDF e conferida por
  outro, recomendação por recomendação: 0 achados graves; 12 e 17 menores, todos aplicados.
  Instruções na sessão: `scratchpad/diretrizes-piloto/INSTRUCOES-PILOTO.md` e
  `VERIFICACAO-PILOTO.md`; prévia (`gera-previa.js` + `render-diretriz.js`, com o `mdToHtml`,
  o `dirMapaHTML`, o `dirFluxoHTML` e o `drawDmap` do app) em
  [Piloto das Diretrizes](https://claude.ai/artifact/K69iLMS8QHmuxg4vU1Jzuw).
  - **Lições do piloto:** (1) a notação da Endocrine Society "1|⊕⊕⊕◯" quebra o texto, porque o
    `mdToHtml` faz tabela de toda linha com "|" e duas células: usar "∣" (U+2223); (2) a
    checagem de cópia por n-gramas compara português com inglês e não pega tradução literal:
    o conferente achou recomendações traduzidas quase palavra a palavra, que foram reescritas;
    (3) o conferente renderiza as tabelas e os fluxogramas do PDF em imagem, porque o texto
    extraído perde as setas.
  - Em 24/10 o professor perguntou quais são os pontos divergentes, e enviei a lista: 4 do cap. 86 × ATA 2026 (aumento da LT4 ~30% × ~25%; TSH < 2,5 só no 1º trimestre × toda a gestação; platô do T4 total com 20 × 16 semanas; PTU mantido depois de 16 semanas × "não se sabe qual é o preferido") e 4 do cap. 89 × Endocrine Society 2016 (cortisol < 3 confirma e > 18 exclui × só < 5 µg/dL com ACTH, como triagem; ACTH > 100 pg/mL × > 2 vezes o LSN; prednisolona 5 mg × 3–5 mg/dia; hidrocortisona na cirurgia a cada 6–8 h × a cada 6 h). Antes de ajustar, conferir cada ponto no PDF.
  - [x] **Professor (24/10):** formato e profundidade *"aprovados"*; sobre os caps. 86 e 89,
    *"Siga as orientações da diretrizes mais recentes, por exenplo a ATA 2026"*; e subiu o
    PDF da SBD 2026 de tratamento do DM2 para `livros/diabetes/` (*Manejo do Diabetes Mellitus
    Tipo 2.pdf*, 8 páginas), baixado em 25/10 pela `baixar-livros` (depois 410) para
    `scratchpad/dm2-sbd2026/manejo-dm2.pdf` (fica só na sessão).
  - [x] **Caps. 86 e 89 alinhados (25/10, 00h23 UTC).** Cada ponto conferido de novo no
    `fonte.txt` dos pilotos antes de escrever. Backup `main-antes-caps-86-89-diretrizes-2026-10-25`.
    - **86 × ATA 2026:** LT4 +~25% ao teste positivo (na dose diária ou com 2 comprimidos
      extras por semana, que a ATA aceita com risco um pouco maior de supertratamento, como
      TSH pré-gestacional < 1,5 e dose > 100 mcg/dia); no subclínico tratado antes da
      gestação, aumento pequeno (12,5 mcg/dia) ou ajuste pelo TSH; TSH a cada 4 semanas até a
      metade da gestação e ao menos uma vez perto de 30 semanas; alvo TSH na referência e
      < 2,5 em **toda** a gestação; necessidade ~25% até a 12ª semana e ~50% até a 20ª; T4
      total +5%/semana da 7ª e platô a partir da **16ª**; depois de 16 semanas, **nenhum
      antitireoidiano preferido** (nem manter o PTU nem trocar é recomendado). Mudou no
      resumo (11 trechos, inclusive as duas tabelas), pts 1, 3, 5, 7, 11, 19, 20 e 27,
      flashcards 2, 3 e 5 (só o verso), os 2 ramos do fluxograma, 4 rótulos do mapa e a
      `fonte` (+ ATA 2026).
    - **89 × Endocrine Society 2016:** cortisol matinal < 5 µg/dL com ACTH elevado é teste
      preliminar, e não há corte consensual para excluir (10,3 a 17 µg/dL); o < 3 e o
      > 15–18 ficaram só como "muitos textos ainda usam", porque não achei a fonte; o teste
      de estímulo confirma (< 18 µg/dL aos 30 ou 60 min, depende do ensaio); ACTH > 2× o
      limite superior define a primária; hidrocortisona 15–25 mg/dia em 2–3 tomadas ou
      prednisolona 3–5 mg/dia; evitar dexametasona (a ES "sugere contra"; "contraindicada"
      era forte demais); cirurgia pequena 25–75 mg/24 h por 1–2 dias e grande 100 mg IV +
      200 mg/24 h (ou 50 mg a cada 6 h); na gestação +20–40% **a partir da 24ª semana**
      (era "20–24"). Mudou no resumo (6 trechos), pts 1 e 2, flashcard 1 (só o verso), 2 nós
      do fluxograma e a `fonte` (+ Endocrine Society 2016).
    - **Como foi gravado:** os dois itens inteiros exportados (`exportar-capitulos`, agora
      devolvendo o item todo; depois 410); trocas em `scratchpad/cap86-89/monta.py`, cada
      trecho antigo com ocorrência única; prévia dos 17 trechos com o `mdToHtml` do app no
      celular (claro) e no notebook (escuro), sem marcação crua (`previa-trechos.js`);
      ensaio no servidor sem gravar; uma instrução só, com guarda do md5 do item **inteiro**
      (o serializador local reproduz o texto do jsonb do Postgres) e conferência do
      resultado: item 86 `7a27ef34…`, item 89 `e7136073…` (resumos `543351c5…` e `e8f797e2…`).
      O `verif/final.sql` das figuras passou a esperar o 89 novo.
  - [x] **Piloto gravado (25/10, 00h28 UTC):** Diretrizes 18 (`cb6f6d49…`) e 35 (`aab2ef58…`),
    com o `at` mantido e o `atEdit` novo. Backups `main-antes-diretriz-18-piloto-2026-10-25` e
    `…-35-…`. Pela função temporária nova `gravar-diretriz` (ver [[Dados e Supabase]]): o item
    vai por POST e o banco só grava se o item de hoje e o literal novo tiverem os md5
    informados. Ensaio antes de cada uma (md5 de hoje zerado de propósito: a guarda barra e
    a função devolve os dois md5 calculados pelo Postgres). Depois, 410 e token apagado.
  - [x] **Conferência de zumbi** dos caps. 86 e 89 e das Diretrizes 18 e 35 (01h37 UTC de
    25/10): os quatro itens com o md5 gravado e o `updated_at` ainda em 00h29m19s, a última
    gravação minha; nenhum save do painel desde então.
- [x] **Entrega em páginas antes dos lotes (25/10).** A resposta única dos Resumos passaria de
  ~6 MB com as 72 Diretrizes completas. Agora vem em páginas de 20 por
  `endodirect_member_resumos_pagina`, com a maior página em 537 KB para o assinante. Ver
  [[Decisões]] 2026-10-25 e [[Dados e Supabase]].
- [x] **Lote 1, diabetes (25/10, 11h37 UTC):** 6 Diretrizes gravadas pela `gravar-diretriz`,
  cada uma com backup `main-antes-diretriz-<pos>-lote-2026-10-25`, `at` mantido e `atEdit`
  novo (1792928151857). Ensaio antes (a guarda barrou as 6 e os md5 do servidor bateram
  com os locais); depois, conferência independente por SQL: os 6 itens com o md5 novo,
  25 pts e 25 flashcards cada, um backup por item.

  | pos | tema | documento | md5 novo | resumo |
  |---|---|---|---|---|
  | 1 | Tratamento do Diabetes tipo 2 | SBD 2026, Manejo do DM2 (PDF do professor) | `7e3a7fae…` | 34.682 |
  | 45 | Cetoacidose diabética (CAD) | Consenso ADA/EASD/JBDS/AACE/DTS 2024 | `d46522c1…` | 32.969 |
  | 46 | MODY (diabetes monogênico) | ISPAD 2022 | `c3bfb93d…` | 34.982 |
  | 47 | LADA | Painel internacional (Buzzetti) 2020 | `8308a256…` | 29.577 |
  | 50 | DMPT | Consenso internacional 2024 (Sharif) | `38d66819…` | 34.339 |
  | 232 | Manejo perioperatório | SBD/SBA/ABESO 2026 | `7161e209…` | 34.997 |

  - Cada uma teve conferente independente; os 2 achados graves do 45 e do 50 eu conferi na
    fonte antes de aceitar (Fig. 2 do consenso de crises; Tabela S1 e Fig. 2 do DMPT).
  - Ajuste meu no 45, conferido na imagem da Fig. 4: os 50% do déficit em 8–12 h valem
    para a hipovolemia grave (depois de 1,0 L/h) e para a leve, não só para a leve.
  - Assinante: a resposta única dos Resumos foi a 3,62 MB; pelas páginas, a maior tem 583 KB.
  - [x] **Conferência de zumbi** do lote 1: às 12h38 e às 16h39 UTC os 6 itens seguiam com o
    md5 gravado, e o `updated_at` só mudou com as minhas gravações.
  - [ ] **Divergências dos capítulos dos Resumos** apontadas pelos redatores (DM2 nos caps.
    129 e 227, CAD no 133, monogênico no 224, LADA no 128, perioperatório no 138): só com
    a orientação do professor, como nos caps. 86 e 89.
- [x] **Lote 2, 1ª parte (25/10, 16h39 UTC):** 5 Diretrizes gravadas, com backup por item,
  ensaio antes e conferência por SQL depois. `atEdit` 1792946323126.

  | pos | tema | documento | md5 novo | resumo |
  |---|---|---|---|---|
  | 7 | Hipertireoidismo e Graves | ATA 2016 (124 recomendações) | `ae92899f…` | 44.982 |
  | 14 | IA induzida por glicocorticoide | ESE/ES 2024 | `09b0dbd5…` | 34.893 |
  | 15 | Síndrome de Cushing | Pituitary Society 2021 | `342f3e9d…` | 34.971 |
  | 25 | Orbitopatia | ATA/ETA 2022 | `276c9ff2…` | 34.991 |
  | 59 | Carcinoma medular | ATA 2015 (67 recomendações) | `e4a70f41…` | 34.994 |

  - Conferentes independentes: 0 achados graves nas cinco; os menores foram todos aplicados.
  - O 7 ganhou Nota Endodirect na crise tireotóxica com o consenso ETA/BTA 2026 (metimazol
    e PTU equivalentes), que conferi no texto do consenso; os campos curtos dizem "ATA 2016".
  - No 25, conferi na Tabela 6 (p. 14) a hemorragia cerebral com teprotumumabe (1–4,9%).
  - **De novo a sessão parou ~4 h com a função a ser ativada:** a v6 saiu já com o prazo
    vencido (410). Reativei com token e prazo novos (v7, 20 min), gravei e voltei ao 410 (v8).
- [x] **Lote 2, 2ª parte GRAVADA (30/10, 20h48 UTC):** 36, 57 e 58, numa ativação só da
  `gravar-diretriz` (v9, token e prazo novos; v10 voltou ao 410, token apagado). Backup por
  item, ensaio antes e conferência por SQL depois. `atEdit` 1793392391806.

  | pos | tema | documento | md5 novo | resumo |
  |---|---|---|---|---|
  | 36 | HAC (21-hidroxilase) | Endocrine Society 2018 | `2521ebe9…` | 34.997 |
  | 57 | Síndrome do eutireoideo doente | Fliers & Boelen 2021 + Langouche 2019 | `7172f295…` | 22.766 |
  | 58 | Tireoidites | ATA 2016 + ETA 2018 + ATA 2026 | `0411e74e…` | 34.898 |

  - Conferentes independentes (relançados em 30/10): 57 com 0 graves (4 menores editoriais,
    aceitos); 58 com 1 grave — o ponteiro de ICI estava específico demais ("ESE 2022") e
    possivelmente mal atribuído; deixei-o genérico ("tem Diretriz própria na plataforma") e
    remontei. Minha conferência confirmou os checadores das três (confere-lote, n-grama só
    com citações, graus 27/27 na 58, coerência).
  - **36:** mantida a recusa do redator de rotular a leitura da 4.14 como "Nota Endodirect":
    confirmei na fonte que *"after 2 years, we advise annual bone age assessment"* é do próprio
    documento (p. 17), não contexto editorial.
  - **58:** o campo `url` aponta para a ATA 2016 (documento mais amplo de tireoidites); os
    três DOIs estão em "Sobre a diretriz". Decisão minha; o professor pode trocar por ETA 2018.
  - Zumbi conferido: lote 2a (7, 14, 15, 25, 59) e piloto (18, 35) intactos; total 233.
- [x] **Lotes 3 e 4 GRAVADOS (31/10, 04h26 UTC):** 62, 216, 30 e 63. Pedido do professor:
  *"faça poucas, para consumir poucos créditos"* e depois *"se quiser escolher mais 2"*;
  rodou de madrugada com a permissão dele (*"dou total permissão, pois vou dormir"*).
  Escolhidas por terem documento completo já baixado do PMC (acesso aberto, CC BY) e serem
  curtas (~10 mil palavras). Gravação pela `gravar-diretriz` v12 (ver [[Dados e Supabase]]),
  backup por item (`main-antes-diretriz-<pos>-lote-2026-10-31`), ensaio antes (md5 do
  servidor = local nos quatro) e conferência por SQL depois. `atEdit` 1793420664761.

  | pos | tema | documento | md5 novo | resumo |
  |---|---|---|---|---|
  | 62 | Endocrinopatias por ICI | ESE 2022 (34 recomendações; antes, japonesa 2019) | `efa9af6d…` | 36.730 |
  | 216 | Hipogonadismo masculino | SBEM/SBU/ABEMSS 2026 (32 recomendações) | `6b759a03…` | 34.552 |
  | 30 | Insuficiência ovariana prematura | ESHRE/ASRM/CRE/IMS 2024 (145 recomendações) | `107e9d1d…` | 29.421 |
  | 63 | McCune-Albright | Consórcio FD/MAS 2019 (Delphi, sem graus) | `d35b4fe1…` | 33.098 |

  - Todas com 25 pts, 25 flashcards, mapa de 7 ramos e 3–4 fluxogramas. A 216 não tinha
    flashcards, mapa nem fluxograma.
  - Conferentes independentes: 0 graves na 62 (12 menores), na 216 (11) e na 30 (9); na 63,
    **1 grave**, que conferi na Tabela 3 antes de aceitar: "90 mg em 2 dias seguidos" lia-se
    como 90 mg no total; o documento dá 90 mg **por dia** em 2 dias seguidos (90 mg × 2), a
    cada 6 meses. Todos os achados foram aplicados por troca exata, com as frases conferidas
    na fonte; depois, confere-lote, n-grama, checa_resumo e coerência limpos nas quatro.
  - Na 62, um parágrafo (orbitopatia) acompanhava o original frase a frase: reescrito com
    outra estrutura. Na 216 saiu a Nota Endodirect sobre classes e níveis (o documento nem
    sempre segue o esquema); ficou só o fato de que ele não publica a tabela.
  - Notas Endodirect mantidas: conversões de unidade na 62; "52mcg" da Figura 3 da ESHRE
    (o SIU tem 52 mg) na 30; discrepância das doses pediátricas de fosfato na 63.
  - Zumbi conferido logo depois: as 16 gravadas antes (piloto, lote 1, 2a e 2b) intactas;
    total 233.
  - [ ] **Divergências dos capítulos dos Resumos** apontadas pelos redatores (só com a
    orientação do professor): cap. 164 × ESE 2022 (critério de levotiroxina, cortes de
    cortisol, dose de pulso, suspender o ICI na crise, intervalo do rastreio); caps. 116 e
    117 × SBEM 2026 (US testicular, alvo 400–700, enantato, PSA anual, PSA alto como
    contraindicação relativa); cap. 124 × ESHRE 2024 (números sem lastro: gravidez ~5–10%,
    doses de cálcio e vitamina D; transdérmica "de escolha").
- [ ] Demais lotes por subespecialidade, pelo mesmo caminho: agente redator a partir do
  documento, agente conferente, conferidor automático (`confere-lote.js`) e gravação pela
  `gravar-diretriz` (token e prazo novos a cada lote).
- [ ] Gravação com backup, F5 e conferência de zumbi. Manter o `at` de cada item (o selo
  "Novo" depende dele) e atualizar o `atEdit`.
- [ ] Cofre e relatório.

## 🖼️ FEITO (21/10): Questão do Dia — figura no comentário

Ver [[Instagram Stories (Questão do Dia)]].
- [x] Figura dos Resumos ou do PubMed no comentário das questões geradas daqui em diante;
  envio de imagem nova no formulário; tirar no lote e nas Pendências.
- [ ] O professor gerar um lote e dizer se a frequência e a pertinência das figuras estão
  boas.
- [x] **Questão de EHH na fila corrigida** (`ig-1791923591718-228416`, 31ª de 37), com a
  autorização do professor (*"pode corrigir"*). A osmolalidade efetiva escrita (342 → 334)
  não batia com o sódio e a glicemia (~346 → ~346 pela conta).
  - Gravado às 01h24 UTC de 21/10, só o `stem`, com guarda de md5 e o backup
    `main-antes-qotd-ehh-osmolalidade-2026-10-21`.
  - Na entrada, glicemia 820 e sódio 148 (osmolalidade 342). Em 3 h, glicemia 560 e sódio
    151 (osmolalidade 333). O md5 do `stem` agora é `d3f11f90…`.
  - **Ajuste sobre a proposta aprovada** (sódio 147; em 3 h, 151 com glicemia 550): a
    glicemia cairia 103 mg/dL/h, acima do teto da JBDS (5 mmol/L/h ≈ 90 mg/dL/h). Com 820 →
    560, cai 87 mg/dL/h, e a osmolalidade 3 mOsm/kg/h (alvo de 3 a 8). A resposta e o
    distrator "sódio acima de 150" seguem iguais.
  - O consenso de 2024 confirma o comentário: a alta inicial do sódio não indica fluido
    hipotônico, e o 0,45% fica para a osmolalidade que não cai.
  - [x] Conferência de zumbi às 11h48 UTC de 21/10: o `stem` segue `d3f11f90…`, na fila.

## ✅ FEITO (18/10): Questão do Dia › Gerar lote — figura, alternativas e questões diretas

Pedido do professor em 18/10. Entregue no mesmo dia; ver [[Instagram Stories (Questão do Dia)]].
- [x] Figura no enunciado: exame de imagem alterado ou foto do sinal clínico (Open-i `ph`).
- [x] Alternativas: três difíceis e uma um pouco mais fácil.
- [x] Questões diretas (~30% do lote no formato misto), com seletor de formato.
- [ ] O professor gerar um lote e dizer se o equilíbrio está bom (proporção de diretas,
  frequência de figura, dificuldade dos distratores).

## ✅ GRAVADO (21/10): parte 2 de tireoide

O professor subiu a parte 2 do zip de tireoide em 20/10 (*"parte 2 ta on; faz teu nome"*).
Processo e números em [[Ilustrações dos Resumos]].
1. [x] Baixar (`baixar-livros`, depois 410): 42 figuras, seções 05 a 08.
2. [x] Revisão por 4 agentes (`t5` a `t8`); as 11 acusações graves conferidas no texto e na
   imagem.
3. [x] 9 rótulos corrigidos, `monta-p2.js` e a prévia:
   [Figuras de Tireoide, Parte 2](https://claude.ai/artifact/W8g7X9zJD9TMUhiFH4QkCZ).
   23 entram em 8 capítulos; 19 ficam de fora.
4. [x] **Aprovação do professor (20/10)**, com as duas respostas:
   - Williams 12.24: *"mantenha a informação condizente com a figura"*. A figura fica como
     está, e o cap. 86 passou a dizer "em geral >6 meses; pode começar a partir do 3º mês"
     (tabela e ponto-chave), gravado às 23h38 UTC com backup.
   - Williams 14.6: *"pode deixar em inglês essa"*. Entrou no 81, com as siglas explicadas
     na legenda.
5. [x] Envio (24 arquivos, conferidos byte a byte) e gravação às 00h22 e 00h24 UTC de 21/10,
   em 2 grupos com backup. Conferido: 35 md5 certos e 199 figuras de livros, todas distintas.
   Detalhes em [[Ilustrações dos Resumos]].
6. [ ] F5 do professor e conferências de zumbi dos 35 capítulos. Os md5 de agora estão na
   tabela de [[Ilustrações dos Resumos]]; 79, 83, 85 e 142 mudaram de novo com a parte 2.
   - [x] **Conferência de 11h48 UTC (21/10):** 35 de 35 md5 certos, 199 figuras de livros,
     todas distintas, e o pts[29] do cap. 86 com "em geral >6 meses; pode começar a partir
     do 3º mês".
     - Saves desde 00h25 UTC: Windows Chrome/155 às 00h30 e 01h18, iPhone às 00h31,
       servidor (`node`, a postagem diária) 6 vezes às 10h46 e Android Chrome/155 às 10h48.
     - Nenhum save da aba Windows/Edge do Rodolpho, e nada foi desfeito.

## ✅ GRAVADO (20/10): figuras de tireoide, obesidade e osteometabolismo

O professor subiu ao bucket `livros` os zips `_PT` de tireoide, obesidade e
osteometabolismo e, em 19/10, pediu para começar já (*"Ja pode fazer agora"*), sem esperar
a renovação do limite semanal. Processo e números em [[Ilustrações dos Resumos]].
1. [x] Baixar (`baixar-livros`, depois 410) e conferir o índice: 190 figuras.
   A parte 2 de tireoide (42 figuras, seções 05 a 08) chegou em 20/10 e está em revisão
   (seção abaixo).
2. [x] Revisão por 17 agentes, um por lote; as acusações graves conferidas no texto dos
   capítulos e na imagem.
3. [x] 15 rótulos corrigidos (`corrige-tob.py`), `monta.js` e a prévia:
   [Figuras de Tireoide, Obesidade e Osteometabolismo](https://claude.ai/artifact/VKAPr6P3dJ6KfFW34W77hQ).
   105 entram em 31 capítulos; 85 ficam de fora.
4. [x] **Aprovação do professor** em 20/10 (*"da minha parte, pode prosseguir"*). As duas
   perguntas sem resposta ficaram como na prévia: a Williams 39.1 entrou com a mancha
   branca e a 39.4 com a tarja só nos olhos. Se o professor pedir, troco a 39.1 pela 72-1
   do Guyton e tiro a 39.4.
   - [ ] Williams fig. 11.9 (TSH × T4 livre), fora do lote: conferir no livro (p. 431) o
     eixo do T4 livre, que pula de 1,2 para 2,0. Com a resposta, corrijo e incluo no
     cap. 77.
5. [x] **Envio e gravação (20/10).** Os 105 arquivos foram pela `subir-figuras-livros`, que
   voltou a responder 410, e foram conferidos byte a byte pela URL pública. A gravação
   correu das 20h27 às 20h35 UTC, em 8 grupos de até 4 capítulos, com backups
   `main-antes-figuras-tob-2026-10-20-g1` a `g8`. Antes, a legenda da Matfin 23-2 ganhou o
   espaço que faltava em "(PO4): PTH". Conferido: as 105 figuras uma vez cada e os 31 md5.
   Tabela em [[Ilustrações dos Resumos]].
   - Às 20h32 houve um save do radar do Mural (cron das 20h, `node`), entre os grupos 5 e
     6. O radar relê o estado logo antes de gravar, e a conferência final pegou os 31
     capítulos certos.
6. [x] **Conferência de zumbi às 20h38 UTC:** os 31 md5 seguem os gravados.
   - [ ] Professor avisado do F5. Repetir a conferência mais tarde, porque a aba do
     Rodolpho (Windows/Edge, v318) pode desfazer no 2º save se ainda estiver aberta.
- **Achado de passagem, resolvido em 19/10:** a manutenção depois do ataque de vitamina D
  (50.000 UI/semana) era 1.500–2.000 UI/dia no cap. 107 e 800 UI/dia no cap. 109. O
  professor: *"deixa esse como correto"* (o do 107). O 109 foi gravado às 13h11 UTC com
  1.500–2.000 UI/dia (backup `cap109-vitd-manutencao-20261019`; md5 `b1b9851b` →
  `c38d80f1`).
  - 🧟 **Voltou às 13h56 UTC** num save do painel aberto desde antes. Regravado às
    14h18 (`c38d80f1`); às 14h40 seguia certo. A causa era um defeito do save, corrigido
    no `sw.js` v319 (ver [[Dados e Supabase]]).
  - [x] **Conferência às 15h47 UTC:** segue `c38d80f1`. O save das 15h35 veio do iPhone
    do Rafael Giorgi, com login às 15h35, já na v319 (a navegação é "rede primeiro" no
    `sw.js`).
  - **Quem desfez:** os saves das 13h54 às 14h00 (com 500/520/502 no meio) vieram de um
    computador Windows com Edge, logado como **Rodolpho**, aberto desde antes das 13h11.
    Não salvou mais desde 14h00. Se essa aba ainda estiver aberta, está na v318 com o 109
    antigo na memória e desfaz de novo no 2º save. O aviso "Nova versão disponível" aparece
    nela, mas não recarrega sozinho: Rodolpho precisa clicar em "Atualizar" ou dar F5.
  - **Conferência às 17h52 UTC:** segue `c38d80f1`. Nenhum save no estado global desde
    15h35; a aba do Rodolpho não salvou desde 14h00. Recarregamento ainda não confirmado.
  - **Conferência às 11h52 UTC de 20/10:** segue `c38d80f1`, depois de dois saves do
    iPhone do Rafael (20h16 e 21h07 UTC) e de sete gravações do servidor (cron, 20h31 UTC e
    10h46 UTC). A aba do Rodolpho segue sem salvar desde 14h00 de 19/10.
  - [ ] Nova conferência de zumbi do 109 depois de o Rodolpho recarregar. Desde a gravação
    das figuras (grupo 7, 20/10), o md5 certo do 109 é `5dd222bd`, e não mais `c38d80f1`.
  - A gravação das figuras esperava a v319 no ar e os painéis abertos antes das 14h44 UTC
    recarregados. O professor liberou em 20/10 (*"da minha parte, pode prosseguir"*), sem
    confirmação da aba do Rodolpho; por isso as conferências de zumbi dos 31 capítulos
    continuam.
  - A base do Chat IA cita a SBEM com manutenção de 1.000–2.000 UI/dia, faixa compatível;
    não foi mexida.

## ✅ GRAVADO (19/10): Figuras de diabetes nos Resumos

51 figuras em 16 capítulos, 10 com rótulo corrigido. O professor aprovou em 19/10
(*"Pode fazer tudo"*). Gravadas das 00h22 às 00h28 UTC, em 4 partes com backup
(`main-antes-figuras-diabetes-2026-10-19-parte1` a `parte4`). Detalhes e md5 em
[[Ilustrações dos Resumos]]; prévia em
[Figuras de Diabetes nos Resumos](https://claude.ai/artifact/Rrq4YVAH631CsABfiyZWHG).
1. [x] Envio dos 51 arquivos pela `subir-figuras-livros`, que voltou a responder 410.
2. [x] Gravação e conferência: 16 md5, 4 backups e as 51 figuras, uma vez cada.
3. [x] Professor avisado do F5.
4. [x] **Conferência de zumbi (01h31 UTC):** os 16 md5 seguem os gravados e as 51 figuras
   aparecem uma vez cada (70 de livros no total). Os saves posteriores (00:34 e 01:24 UTC,
   do Prof. Rafael) já carregaram a versão nova.
5. [ ] *Opcional:* se o zip dos originais em inglês vier, conferir as 22 traduzidas lado
   a lado, em especial o rótulo da úlcera de calcanhar da Matfin 40-1.

## 📚 Figuras dos livros (18/10) — lote 1 gravado; o que fica

1. ✅ **19 recortes traduzidos gravados nos resumos 149–152** (backup `main-antes-figuras-livros-eb-2026-10-18`, 12:14 UTC). Professor avisado do F5; conferência de zumbi às 13:15 UTC.
   - Teto de altura no ar (PR #881, `sw.js` v315).
   - Depois dele, o `{60}`/`{75}` saiu do Netter e do ciclo menstrual no 151 (backup `main-antes-largura-livros-151-2026-10-18`, 12:24 UTC; md5 do 151 agora `891f49b2…`).
   - ✅ **Conferência de zumbi (13:16 UTC):** os 4 resumos seguem com os md5 gravados (149 `416c1c7c…`, 150 `a5a99495…`, 151 `891f49b2…`, 152 `5fb2f669…`), com 19 recortes e nenhum `{N}`. O save de 12:31:52 UTC, posterior à última gravação, já carregou a versão nova.
2. [x] Williams 16.1 (catecolaminas): a versão traduzida está completa (só o original em
   inglês saiu cortado); entra no 149 no 2º lote.
   - [ ] Williams 11.6 (D2/D3, p. 428): segue cortada embaixo (~180 px). Precisa de recorte novo
     da outra conversa do professor (o PDF do Williams no Drive tem 68 MB, acima dos 10 MB do
     conector). Quando vier, entra no 77, no trecho da D3.
3. [x] **2º lote (fisiologia de cada glândula): gravado em 24/10**, junto com as figuras de
   adrenal, neuroendocrinologia e lípides (aprovação: *"Aprovo tudo."*). Começou na hora
   agendada (23/10, 18h de Brasília). 34 figuras em 31 capítulos, 19 com conserto; 15 ficam de
   fora. Detalhes em [[Ilustrações dos Resumos]]; prévia em
   [Figuras de Fisiologia das Glândulas](https://claude.ai/artifact/FvC4tVCW9BKbzv8NicJv7v).
   A fig. 77-5 do Guyton ficou como na edição brasileira ("Iodinase").
4. [x] A cópia da prévia (`Lp7eetjE7zsAtctbPuKVEt`) já não existe (conferido em 19/10). Fica a de sempre (`1PdZcjpHFTp4q8Kw4Qx1Xq`).

## 📱 App nas lojas (18/10) — decisões tomadas; a fazer

1. [ ] **Professor:**
   - CNPJ → D-U-N-S: **SAIU em 29/10 (e-mail da D&B): número 763009852.** Pedido em 18/10 pela ferramenta da Apple. Falta a Apple recebê-lo (até 2 dias úteis).
   - Conta de organização no Google Play (US$ 25) e na Apple (US$ 99/ano), com o mesmo D-U-N-S, a mesma razão social e o mesmo endereço. **Próximo passo dele (30/10):** inscrever a empresa no Apple Developer Program como organização, com e-mail @endodirect.com.br.
   - [x] **Supabase:** `br.com.endodirect.app://login-callback` acrescentado às Redirect URLs pelo professor em 30/10 (23h06 de Brasília). Conferido no servidor: o pedido com esse retorno fica guardado com ele; o de um app inventado cai no site.
2. **Eu, na plataforma** (detalhes em [[App nas Lojas]], seção "Ajustes da plataforma"):
   - [x] exclusão de conta no app, mais a página pública `/excluir-conta` (19/10);
   - [x] política de privacidade e termos: retenção, exclusão, login por e-mail (19/10);
   - [x] preços, "assine" e checkout escondidos dentro do app (19/10);
   - [x] conta de revisão `revisao@endodirect.com.br`, com a senha gerada pelo professor
     em Estudantes (19/10);
   - [ ] `/.well-known/assetlinks.json` no www (precisa do SHA-256 da chave de assinatura do Play Console).
   - [ ] Professor: gerar a senha da conta de revisão quando for preencher os formulários
     das lojas (Google Play: Acesso ao app; App Store: Informações de login).
3. [ ] **iPhone (Capacitor; o professor tem Mac):**
   - [x] projeto do app em `app-ios/` (Capacitor 8.5.3, SPM), abrindo o site com `?app=ios` (30/10);
   - [x] login do Google pelo navegador do sistema, com volta por `br.com.endodirect.app://login-callback` (30/10);
   - [x] roteiro do Xcode e do App Store Connect: `app-ios/LEIA-ME.md` (30/10);
   - [ ] "Entrar com a Apple" (diretriz 4.8; precisa da conta: Services ID, chave e provedor Apple no Supabase);
   - [ ] notificações nativas (APNs) e o envio pelo servidor (precisa da chave APNs da conta);
   - [ ] ícone 1024 em alta (o atual é o de 512 ampliado; pedir o original ao designer);
   - [ ] opcional: ASWebAuthenticationSession ou link universal no lugar da folha do Safari (tira o "Abrir no Endodirect?"; precisa do Team ID).
   - Ver [[App nas Lojas]].

## 🔤 SOMP no acervo do banco (17/10) — gravado; o que fica

Decisão do professor (17/10): *"grava tudo e troca SOMP"*. Gravado em 17/10, 19h15 UTC,
com o backup `main-antes-somp-acervo-2026-10-17`; o cliente que funde os gêmeos dos
baralhos foi junto (sw v314). Detalhes em [[Decisões]].

1. ✅ **Checagem de zumbis feita em 17/10, 20h00 UTC**, adiantada a pedido do professor
   ("Pode fazer agora"). A última gravação no estado global foi às 19h22 UTC, já com o
   painel na versão nova, e não trouxe nada de volta:
   - capítulos e títulos de aula com SOMP (233 capítulos, 106 aulas);
   - nenhum gêmeo nem cartão `fc-seed` novo no `fc_shared` (533 cartões);
   - nenhum SOP sem proteção nos campos-alvo;
   - as 140 questões do dia iguais ao backup `main-antes-somp-acervo-2026-10-17`, tirado
     depois das correções.
2. ✅ **Painel do professor:** não houve gravação por cima depois da migração.
3. **Fica de fora, de propósito:**
   - avisos do radar: resumos datados de artigos, que usam o nome antigo;
   - newsletter e podcasts: já enviados ou gravados;
   - discussões do mural: são de artigos;
   - base profunda: citações literais;
   - enunciados e alternativas das provas oficiais: texto da banca (o comentário e a
     categoria, que são nossos, mudaram);
   - o campo `fonte` dos Resumos: nome do documento e chave do merge.

## 📊 Tabelas das discussões do mural (14/10) — feito; só o backup fica

1. ✅ **Reconversão aplicada em 14/10 (23h UTC)**, com o OK expresso do professor
   ("Aplicar nas 41"): 41 discussões, 66 tabelas, 67 ocorrências, todas gravadas.
   Conferido contra o backup nas 240 linhas: só linhas de tabela mudaram,
   `updated_at` intacto, `meta` só ganhou a marca. Detalhe em
   [[Newsletter e Radar]] 2026-10-14.
2. ✅ A função temporária `retabelar-discussoes` foi substituída por uma que só
   responde 410 (a ferramenta do Supabase não apaga função); o token foi apagado.
3. [ ] **Apagar o `bkp_mural_discussoes_20261014`** (240 linhas) depois de algumas
   semanas sem queixa. Se alguma tabela reconvertida sair errada, a linha original
   está lá: `update public.endodirect_mural_discussoes d set markdown=b.markdown,
   meta=b.meta from public.bkp_mural_discussoes_20261014 b where
   b.source_id=d.source_id and d.source_id='<id>'` (não tocar em `updated_at`).
4. Caso residual, 1 discussão (`pubmed:42676363`): tabela sem `<thead>` com rótulo
   de largura total na 1ª linha. O mural a mostra como tabela; fica assim.

## 🖼️ Ilustrações no meio dos capítulos (17/10)

1. ✅ **As 3 ilustrações do capítulo 150 estão gravadas no banco** (17/10, 14h22 UTC).
   - Backup: `main-antes-ilustracoes-cap150-2026-10-17`.
   - Só o `resumo` mudou.
   - Professor avisado do F5.
2. [ ] **Capítulo 149:**
   - revisor independente da ilustração da tireoide;
   - novas ilustrações: modos de ação, síntese dos peptídeos, StAR/CYP11A1, transporte e regra de ouro.
3. [ ] Capítulos 151, 152, 153 e 223.
4. [ ] **Professor:**
   - dar retorno sobre o estilo;
   - receber a sugestão de ajuste no texto do 150 ("sem depender de transcrição" × via JAK-STAT).

## 🧹 Questão do Dia: conteúdo apontado na varredura de jargão (17/10)

1. [x] **Os problemas de conteúdo foram corrigidos e gravados em 17/10** (110 trocas em
   49 questões; ver [[Instagram Stories (Questão do Dia)]]). Eram os que os revisores
   apontaram nos comentários. São de três tipos:
   - comentário que não justifica o gabarito;
   - corte ou diretriz possivelmente errados;
   - enunciado que contradiz o achado clássico.

   As contradições internas eu conferi no texto; as de diretriz precisam de conferência
   na fonte. Lista na sessão de 17/10 e no relatório ao professor.
2. [x] **Questão 1 (SOMP):** em 17/10 o professor adotou SOMP no lugar de SOP; a questão
   fica com SOMP e a nota do consenso da Lancet (ver [[Decisões]]).
4. [x] **Migrar SOP → SOMP no acervo do banco:** gravado em 17/10 (seção "SOMP no
   acervo do banco", no topo).
3. ✅ **`tmp_jargao_qotd_20261017` apagada em 17/10, 19h55 UTC**, pelo professor, no editor
   SQL do Supabase. Antes, a última conferência com ela: 110 de 110 trechos presentes e
   as questões iguais ao backup `main-antes-somp-acervo-2026-10-17`. A checagem de zumbis
   das 20h25 UTC passou a comparar com esse backup. Não sobrou tabela `tmp_*` no banco.

## 📋 Questão do Dia na prancheta (17/10)

1. [ ] Professor: retorno sobre a prancheta e a aba "Como o aluno vê".

## 🖼️ Figuras dos Resumos (16/10)

1. **Professor: olhar as figuras** (galeria de revisão, privada, em
   https://claude.ai/artifact/XR2ZgeNxnWnfEy5B5z338G) e apontar o que trocar; a
   especificação de cada uma está em `scratchpad/figuras-resumos/specs/` e se refaz em
   minutos. Antes de editar qualquer Resumo no painel, **F5** (o painel aberto antes da
   gravação não tem o campo `figuras` e pode sobrescrevê-lo).
2. ✅ **Função temporária `exportar-capitulos`:** virou stub 410 (16/10), com JWT exigido.
3. Capítulos novos dos Resumos nascem sem figura: seguir [[Figuras dos Resumos]].

## 💊 Bulário — encerrado (17/10)

⛔ **Removido da plataforma em 17/10/2026**, a pedido do professor ("vamos abortar essa
ideia do bulário de uma vez por todas"). Nada pendente. O histórico, as fontes e as lições
ficam em [[Bulário]], caso a ideia volte (por exemplo, com uma base licenciada).

## 💳 Cobrança em dobro (14/10) — o que fica com o professor

1. ✅ **Estorno da compra duplicada do Dr. Pedro Ivo Aranas feito em 14/10**
   (`piaranas@gmail.com`; cobrança `Q12T5XANDR`, pedido `or_dWJ0PX1HwltVQ0LD`, valor
   total), com a correção do webhook já no ar. O Gold dele seguiu ativo (ver
   [[Pagamentos pagar.me]]). ✅ **Respondido no Instagram pelo professor em 15/10**
   (*"ja respondi ao pedro e eduardo"*); o Eduardo também recebeu a resposta sobre o vídeo
   das tabelas (ver [[Decisões]], 14/10).
2. **Procurar outros pedidos duplicados** no pagar.me (mesmo cliente, mesmo plano, mesmo
   dia). O banco não mostra (uma linha por e-mail + escopo). A leitura da chave secreta foi
   autorizada em 14/10, mas o conector da Vercel não tem permissão para ler as variáveis
   (403) e a CLI não está no contêiner. **Caminho mais curto:** em Cobranças, o professor
   tira o filtro (Remover), deixa "Últimos 6 meses", que cobre tudo desde a entrada em
   produção em 10/06, e usa "Enviar relatório". O relatório chega por e-mail, e a sessão
   lê pelo Gmail conectado e cruza os dados. Outro caminho: dar ao conector leitura das
   variáveis de Production. Detalhe em [[Pagamentos pagar.me]].
3. O furo foi fechado no código em 14/10 (quem já tem o plano não é cobrado de novo; "sem
   resposta" não vira mais "não aprovado").

## 📚 Banco de questões — o que ficou do lote de 12/10 (estudos de 2025 e 2026)

1. ✅ **RESOLVIDO em 12/10: as questões saíram do `endodirect_member_content`** e vêm em
   páginas de 500 (`endodirect_member_provas_pagina`), em paralelo com o conteúdo sem elas
   (`endodirect_member_content_sem_provas`, ~1,55 MB). Nenhuma resposta do aluno passa de
   ~1,6 MB, e lote novo só aumenta o número de páginas. O ensaio por perfil achou um caso
   que já estava acima do limite antes do lote: Gold com EndoTEEM, 7,24 MB. Ver
   [[Decisões]] 2026-10-12 e [[Dados e Supabase]].
2. ✅ **`tmp_estudos_2026` apagada em 17/10, 19h41 UTC**, pelo professor, no editor SQL
   do Supabase ("Success. No rows returned"), com a guarda pelo código. Conferido depois:
   a tabela não existe mais, e as 50 questões (ENDODIRECT-2068 a 2117) estão no banco.
   O `DROP` pelo conector expirou duas vezes antes, com o professor na conversa: a
   confirmação do conector abre em janela própria e expira em 60 s, e o "Ok" no chat não
   conta. **Para apagar tabela, o caminho é o editor SQL** (ver [[Dados e Supabase]]).
3. **Backups `bkp_provas_*`** (21/08, 21/08 SBD e 12/10) podem sair quando o professor
   confirmar os lotes.

## 🧪 Testes assíncronos sem guarda de parada (achado em 12/10)

Um teste com `await` cuja promessa nunca resolve sai com código 0 no meio, sem imprimir
nada, e o CI lê isso como aprovado (ver [[Convenções de Trabalho]] 2026-10-12). O
`test-banco-nao-fica-mudo.js` já tem a guarda. Sem ela, hoje: `test-ai-paginas-servidor.js`, `test-ai-system.js`, `test-aula-ao-vivo.js`, `test-aviso-feed-mudo-sem-spam.js`, `test-banco-feitas.js`, `test-discussao-cadeia.js`, `test-feedback.js`, `test-mural-titulo-pt.js`, `test-newsletter-optin.js`, `test-ponte-rss-pubmed.js`, `test-publico-seo.js`, `test-push-breaking-oficial.js`, `test-radar-cadencia.js`, `test-radar-feed-mudo.js`, `test-reengajamento.js`, `test-support-inbox.js`, `test-winback-novidades.js`.
Correção mecânica (bandeira `terminou` + `process.on('exit')`), um arquivo por vez, rodando
cada um antes e depois.

## 🧠 Questão do Dia — corrigida em 10/10; o que fica com o professor

A lista voltou ao aluno logado (RPC `endodirect_qotd_publicadas`), o e-mail leva à
questão (`/#qotd/<id>`) e a rota pública deixou de expor a fila com gabarito (ver
[[Decisões]] 2026-10-10 e [[Dados e Supabase]]).

1. **Responder o chamado de 06/10** (Suporte, categoria "Problema técnico", ainda
   sem resposta). Texto sugerido no relatório da sessão de 10/10.
2. **Decidir se a resposta pelo próprio e-mail vale a pena.** Duas formas:
   (a) cada alternativa do e-mail vira um link `/#qotd/<id>/<letra>` que abre a
   plataforma já registrando a escolha (exige estar logado; pouco código);
   (b) link assinado por destinatário e questão, que grava a resposta sem login
   (endpoint novo com token por e-mail, cuidado com pré-carregamento de links
   pelos provedores de e-mail, que "clicariam" sozinhos na alternativa).
3. **Lista crescendo:** ~3 KB por dia; se passar de ~1 MB, janelar no servidor.
4. **Conferir a notificação da Questão do Dia** no cron de 16/10 (07:30 BRT): `newsletter.pushQotd`
   na resposta do cron e `push.sent` nos logs da Vercel; e o teste do professor pelo botão
   "🔔 Enviar a notificação agora" da aba Postados (15/10).

## 🩺 Auditoria do acervo — correções APLICADAS em 10/10 e o que fica com o professor

Pedido de 05/10: *"faça uma auditoria se os conteúdos dos resumos e das
diretrizes na plataforma estão corretos e atualizados"*; depois do relatório
([Auditoria do Acervo Endodirect](https://claude.ai/artifact/TXVreCG9akVaouQd8DUu8L)),
em 06/10: *"Corrigir tudo"*.

**O que foi aplicado no acervo (10/10, 03h12 UTC), em duas passadas:**

| Passada | O que muda | Itens | Trocas |
|---|---|---|---|
| 1ª — `resumo` (e `ano` em 14) | os 195 achados confirmados, os leves conferidos um a um e as imprecisões extras dos leitores | 152 | 1.338 |
| 2ª — `pts`, `flashcards`, `mapa`, `fluxogramas` | as mesmas correções onde os campos auxiliares repetiam o valor antigo | 133 | 601 |

- **Processo por item:** editor (correção mínima, conferida na base, no núcleo
  e no PubMed) → revisor independente (aprova, ajusta ou rejeita e alinha os
  campos auxiliares). Resultado: 154 revisados, 141 aprovados e 13 aprovados
  com ajuste do revisor, nenhum rejeitado. Dois itens (66 e 102) ficaram sem
  mudança porque a única troca proposta era a da fonte. Conferência mecânica
  antes de aplicar: tabelas com a mesma contagem de colunas, negritos pareados,
  marcas do `checa-jargao` (duas, retocadas pela coordenação nos itens 50 e 89)
  e, nos auxiliares, cada "de" igual à folha do acervo e nada além das folhas
  trocadas. Conferi eu mesma no PubMed o único acréscimo sem lastro na base: o
  novo nome da SOP (item 11), do consenso da Lancet de 05/2026.
- **Aplicação:** instruções únicas de `supabase/correcoes-auditoria-2026-10.sql`,
  guardadas (texto atual = original de cada linha; qualquer divergência cancela
  tudo). Verificado depois: 81 itens idênticos ao backup, nenhum item fora da
  lista mudou, nenhum campo além dos previstos mudou.
- **Reversão:** backup completo `main-antes-aplicar-correcoes-2026-10-10` em
  `endodirect_global_state_backup`; item a item, pelas colunas
  `resumo_original` (tabela `endodirect_correcoes_auditoria`) e
  `campos_original` (tabela `endodirect_correcoes_auxiliares`).
- **Fonte nunca foi trocada:** ela é a chave de merge do painel (ver
  [[Convenções de Trabalho]], regra 12 do limite da sessão).

**Também aplicado em 10/10, depois do "Pode corrigir":**

- **Fontes trocadas** (tabela `endodirect_correcoes_fontes`, backup
  `main-antes-trocar-fontes-2026-10-10`): série Transgeneridade (168–172) de
  "CFM 2.265-2019" para "CFM 2.427-2025"; 96 para "Lancet 2016 e 2024"; 98 para
  "Endocrine Society 2014 / Consensos de Acromegalia 2018 e 2023"; 15 para
  "Endocrine Society (2008) / Pituitary Society (2021)"; 84 com ATA 2015, LATS
  2026 e AJCC 8ª ed.; o fluxograma do 86 passou a citar as diretrizes da ATA de
  2017 e 2026. Verificado: nenhum outro campo mudou e nenhuma chave duplicou.
- **Rodada dos pontos fora dos achados** (tabelas
  `endodirect_correcoes_residuais` e `endodirect_correcoes_auxiliares_res`,
  backup `main-antes-aplicar-residuais-2026-10-10`): os 71 pontos que editores
  e revisores da 1ª rodada tinham anotado em 50 itens passaram pelo mesmo
  processo (o editor confere e corrige só o que se confirma; o revisor
  independente aprova, ajusta ou rejeita e alinha os campos auxiliares).
  Resultado: 49 aprovados, 1 aprovado com ajuste do revisor (62), nenhum
  rejeitado; 45 itens com mudança no resumo (86 trocas) e 25 com campos
  auxiliares alinhados (46 trocas). Li as 86 trocas antes de aplicar, conferi no
  texto-fonte a inversão do 113 ("placas NÃO obstrutivas em mais de um vaso",
  diretriz brasileira de HF de 2021, seção 5.9.1) e retoquei o 129 (Soliqua: 2 a
  4 UI por semana, pela bula do FDA; dulaglutida 3/4,5 mg "aprovadas nos EUA e na
  Europa" em vez de "só no exterior", porque o registro no Brasil não foi
  conferido). Verificado: 188 itens idênticos ao backup; nos 45 alterados, só
  resumo, campos auxiliares e atEdit.
- **Limpeza:** dez resumos (47, 49, 50, 51, 54, 55, 61, 62, 63, 65) terminavam
  num título "## Pontos-Chave" vazio, como o 48; o título saiu (o app já desenha
  os pontos-chave num bloco próprio). Backup
  `main-antes-limpar-titulos-vazios-2026-10-10`.

**O que fica com o professor:**

1. **Recarregar (F5) o painel de administração** que estiver aberto desde antes
   de 10/10 11h45 UTC antes de salvar qualquer coisa. Com as fontes trocadas,
   isto deixou de ser só precaução: o merge do painel usa fonte|tema|sub como
   chave, e um painel antigo salvaria de volta os itens 15, 84, 96, 98 e 168–172
   com a fonte antiga AO LADO dos novos. A conferência de duplicatas está
   agendada para 11/10.
2. **Base profunda (`lib/clinical-deep-data.js`): erros conferidos por mim no
   PubMed, sem correção.** A base é gerada dos extratos com conferência das
   citações contra o texto-fonte, e o corpus não está neste ambiente; corrigir
   exige a máquina com o corpus (rodar `monta-base-profunda.js` depois de editar
   o extrato):
   - Kim & Mathioudakis (fato #7): a metanálise de Liu 2014
     ([DOI](https://doi.org/10.1159/000365892)) é de pacientes SEM diabetes
     prévio, com hiperglicemia em 32,3% e diabetes em 18,6%; a base atribui
     18,6% à "GIH com diabetes prévio" e 32,3% à "GID".
   - ABESO/SBP 2026 (fatos #76 e #122): no STEP TEENS
     ([DOI](https://doi.org/10.1056/NEJMoa2208601)) os −16,1% contra +0,6% são
     do IMC (desfecho primário), não do peso.
   - ABESO/SBP 2026 (fatos #70 e #121): no ensaio da liraglutida
     ([DOI](https://doi.org/10.1056/NEJMoa1916038)) −0,22 é a DIFERENÇA de
     z-IMC contra o placebo (IC95% −0,37 a −0,08; p=0,002), não "−0,22 contra
     +0,20 (diferença −0,42)".
   - A conferir na mesma passada: os valores do SCALE Kids e do STEP TEENS nas
     linhas 154 e 271 (no resumo do 146, os dois ensaios passaram ao desfecho
     primário de cada um).
3. **Observações dos revisores da rodada residual, fora do escopo dela e NÃO
   alteradas** (precisam de conferência antes de mudar):
   - DRD (222): na tabela por faixa de TFG, "Semaglutida se RAC ≥100" × "> 100"
     do texto e da SBD; finerenona "TFG 25–60" × TFGe ≥ 25 sem teto; tabela de
     estudos com "TFG > 25" (a inclusão dos ensaios era ≥ 25).
   - Terapia combinada (129): dulaglutida com dose inicial de 1,5 mg e
     escalonamento 0,75 → 1,5 na mesma linha; dose inicial da glargina +
     lixisenatida (10 ou 20 UI) diverge entre fontes.
   - CAD/EHH (138): redução da insulina "0,02 a 0,05 UI/kg/h" × 0,05 da base;
     SG 5% abaixo de 250 também no EHH.
   - Obesidade (74): o SURMOUNT-5 ficou sem a proporção de perda ≥ 20%
     (provavelmente 48,4% × 27,3%, a conferir no texto integral); orlistate
     "irreversível" × "reversível" (a literatura diverge).
   - Valores a conferir: 24 (toxicidade da vitamina D > 150 ng/mL da ES 2011 ×
     > 100 ng/mL da SBEM/SBPC), 45 (CAD euglicêmica "3–8,7% das CAD" × ~10% na
     base), 122 (finasterida 5 × 2,5–5 mg/dia), 76 (B12 "20% (GV)" × faixa de 4
     a 20%), 105 (dose no hipoparatireoidismo na gestação), 7 (falta o grupo
     pós-menopausa sem estrogênio ou bisfosfonato da ATA 2016).
   - Sem fonte confirmada: 67 (Vigitel por sexo e edição do Atlas), 108
     (distribuição esquelética do Paget), 66 (algoritmo AACE 2026), 99
     (intervalos de RM, Pituitary Society 2025), 79 (macroadenoma 70–80%, a
     conferir na ETA 2013), 121 (SOP 2018: androstenediona e SDHEA).
   - Núcleo da IA: grafia "FEZOLINETANTE" (o item 125 adotou "fezolinetanto",
     nome da bula brasileira).

**Também no código (PR de 10/10):** o núcleo `CLINICAL_GUIDELINES` passou a
dizer que o consenso da Lancet de 05/2026 adotou o nome PMOS (antes: "tendência
ainda não oficial"), mantendo a regra de usar SOP em enunciados, alternativas,
flashcards e mapas; e a RM de sela no hipogonadismo masculino passou a ter
critérios ALTERNATIVOS (T ≤ 150 ng/dL, outras deficiências hipofisárias,
hiperprolactinemia ou sintomas de massa — basta um), conferidos no texto
integral do posicionamento SBEM/SBU/ABEMSS 2026 (PMC13124176).
No PR seguinte (rodada residual), a linha do incidentaloma adrenal no núcleo
deixou de dar "≥ 4 cm" como critério cirúrgico isolado: pela ESE/ENSAT 2023
(conferida no resumo; o texto integral não está no PMC), a lesão homogênea com
HU ≤ 10 é benigna em qualquer tamanho, a cirurgia é a conduta habitual para
lesão > 4 cm heterogênea ou com HU > 20, e no MACS a decisão é individualizada.
Os 26 fatos que restituem o núcleo foram relidos e selados de novo
(selo eca76a154356).

**Auditoria trimestral.** Rotina "Auditoria trimestral do acervo Endodirect"
(`trig_011i6yP2PuRFyg98ZpoWSzdT`): dia 5 de janeiro, abril, julho e outubro,
às 8h47 de Brasília, com aviso por push e e-mail; a próxima é em 05/01/2027.

## 📊 Convite de feedback: 5ª verificação (2026-10-20)

**Feedback:** nenhum novo desde 06/10. Desde 01/09 são 6, com média 4,33 (notas 5, 3,
5, 5, 5, 3). A última resposta foi a do Victor, em 02/10, já corrigida no PR #821.

**Alcance:** 50 assinantes ativos (6 novos entre 07/10 e 17/10), 40 com mais de 30
dias, 32 com o convite aberto e 8 que já responderam. A conta de revisão das lojas
não entra na conta.

**Continuam iguais:**
- o EndoTEEM 2026 invisível a todo aluno real (68 aulas, `tier` nulo e slug em
  `SHOWCASE_ONLY_CURSOS`);
- os flashcards em 533 desde 01/07 e os mapas em 82 desde 21/07.

**Diretrizes públicas:**
- Pelo critério de 06/10, 22 de 72 são de 2022 ou antes, como antes. Esse critério não
  conta faixas como "2012–2019"; pelo ano mais recente do campo, são **30 de 72**.
- As 2 que estavam sem ano ganharam ano. 14 são de 2026.
- Última edição pública em 10/10.

Próxima verificação em 03/11 (`trig_01QDCDys7z6fKKDJLVuhGYmZ`), já com os dois critérios.

## ✅ RESOLVIDO — "Degustação de 7 dias encerrada" para um Gold em todo login (2026-10-05)

Feedback de Victor (01/10, 3/5): *"toda vez que faço login aparece que meu
período de teste de 7 dias já foi encerrado"*, também pelo link da Questão do
Dia. Conferido no banco: Gold anual ativo até 08/2027, RPC devolvendo o plano.
Era ordem no cliente — painel decidido antes de `endodirect_acessos_ativos`
responder, sem reavaliação depois. Ver [[Decisões]] 2026-10-05.

**O que fica em aberto, ligado a isso:** por que a cópia local dos acessos
(`lsSet('acessos')`, desde 24/09) não o protegia no aparelho dele? Hipótese
mais forte: `lsSet` falha em silêncio quando o `localStorage` está cheio
(provas 3,8 MB + radar + flashcards numa cota de ~5 MB), e aí NENHUMA chave
nova grava — nem `acessos`, nem `last_panel`. Não medido no aparelho dele. A
correção de hoje não depende da cópia local, mas a cota continua um risco
para tudo que é só local (ver o item do `member_content`, 24/09).

## ✅ RESOLVIDO — O Banco não lembrava o que o aluno já respondeu (2026-10-05)

Dúvida de Caio (04/10): 5 questões por dia por subespecialidade; "as questões
que já fiz voltam como se eu não tivesse feito"; "as alternativas incorretas
têm explicação?". `DB.feitas` + selo + "só as que ainda não respondi" +
"Sortear 5" + explicação das alternativas pela IA. Ver [[Banco de Questões]]
e [[Decisões]] 2026-10-05.

## 🔎 TRÊS PRÉ-EXISTENTES QUE A REVISÃO DE 05/10 APONTOU (fora do diff, não tocados)

1. **`seedFlashcards()` roda no `DOMContentLoaded` antes de qualquer login** (l.~19667):
   `currentUser` ainda é null → `isDegustacao()` é false → o bloco `FC_MEMBER`
   ("só p/ MEMBROS, não entram na degustação") é semeado para quem está em
   degustação, e gravado no `app_state` dela no primeiro save. Correção
   provável: pular o bloco de membro quando `!currentUser || acessosPendentes()`
   e deixar a semeadura para `refreshAfterRemoteState`. Medir antes quantos
   alunos de degustação já têm os cards de membro no baralho.
2. **`/api/ai` não tem portão de plano nem cota por usuário** (comentário em
   `api/ai.js` ~l.220: "O gate é ESTAR LOGADO, não ter plano"). Todo bloqueio
   da degustação é do cliente; qualquer sessão logada pode gastar Opus pelo
   endpoint. Decisão de produto do professor: cota no servidor (contador diário
   por usuário + plano via `endodirect_acessos_ativos` com a service key)?
3. **`applyDegLocks` força a fonte do Simulado para "Provas" e não a restaura**
   ao destravar (degustação → assinante na mesma sessão). Desde hoje a janela
   pendente não entra nisso; a transição real (compra) continua como estava.

## 🧹 `clearLocalUserData` não zera `perfTema`, `favs` nem `acervoVisto` (2026-10-05)

Ao adicionar `feitas` à lista (trocar de conta no mesmo navegador não pode
herdar as respondidas da conta anterior), vi que três chaves pessoais mais
antigas também não estão nela: `perfTema` (desempenho por tema), `favs`
(favoritos) e `acervoVisto` (marca da última visita). O mesmo vazamento
local→conta nova existe para elas desde que entraram. Baixo impacto (o
hydrate aplica o remoto por cima; `favs` é lista, então mescla), não tocado
hoje para não alargar o diff. Fechar quando mexer em `PERSONAL_STATE_KEYS`.

## 🧹 `genPresc()` É CÓDIGO MORTO E LÊ TRÊS CAMPOS QUE NÃO EXISTEM (2026-08-30)

A varredura de referências órfãs criada em `scripts/test-dashboard-aluno.js`
achou, além das que a minha própria remoção tinha criado, uma **pré-existente**:

- `genPresc()` lê `presc-dx`, `presc-med` e `presc-pac` com
  `document.getElementById('…').value`, **sem guarda**. Nenhum dos três existe
  no markup.
- A função **não tem um único chamador** — nenhum listener, nenhuma referência.
  Por isso ela nunca lançou: é código morto, não defeito em uso.

Não é urgente e não foi tocada nesta mudança (não foi ela que a criou). Fica
**nomeada** na lista de conhecidos do teste, não silenciada: dívida medida não é
dívida esquecida. Quando a Prescrição Simulada for mexida de novo, apagar a
função (ou religá-la a campos que existam) fecha isto.

⚠️ E fica a lição junto: a mesma varredura apontou `adm-mq-a..d` (formulário de
questão manual do professor) como inexistentes, e **não era verdade** — são
criados por concatenação (`id="adm-mq-'+l.toLowerCase()+'"`). Conferir no fonte
antes de acusar valeu de novo.

## 📋 ~556 TRECHOS DE FONTE REPRODUZIDOS NA BASE PUBLICADA (2026-08-29)

Ao criar o guarda de reprodução (ver Convenções), a varredura do acervo inteiro
mediu **~556 janelas de 12 palavras** do texto-fonte presentes no
`clinical-deep-data.js`. O guarda **não reprova** essas: quase todas vêm de
**artigos de acesso aberto e diretrizes de sociedade**, onde reproduzir é
licenciado, e reprovar tudo transformaria o teste em ruído.

O que fica em aberto, para decisão do professor:

1. **Não há metadado de licença por fonte** nos 58 extratos — só o extrato novo
   tem `nota_licenca`. Sem isso não dá para separar "licenciado" de "não medido".
2. Se quiser fechar de vez, o caminho é registrar a licença de cada extrato
   (CC BY, CC BY-NC-ND, diretriz pública, restrito) e ligar o guarda para todas
   as classes que proíbem derivado — não é trabalho de uma sessão.
3. **Nada disso afeta o material com restrição declarada**, que já está guardado
   e reprova no CI.

## 📄 PDF DIGITALIZADO ENTRA POR AMOSTRA: 12 PÁGINAS, NÃO O CAPÍTULO INTEIRO (2026-08-25)

O importador passou a **renderizar as páginas** quando o PDF não tem texto
selecionável (ver Decisões), e com isso o arquivo grande deixou de ser recusado.
Só que o orçamento de corpo da função serverless (~4,5 MB) limita o envio a
**~10–12 páginas**: medido, uma diretriz de 20 páginas digitalizadas entrou com
**10**. Para um capítulo de 46 páginas, isso é uma **amostra**, não o documento.

A tela **diz quantas de quantas** foram lidas, então não há resumo silenciosamente
parcial. Os caminhos para levantar isso, se o professor pedir, em ordem de custo:

1. **Importar capítulo por capítulo** (funciona hoje, custo zero).
2. Subir o PDF para armazenamento e ler no servidor, sem o teto de corpo.
3. OCR no navegador antes de mandar (texto pesa muito menos que imagem).

**Nada disso é urgente enquanto o site da diretriz oferecer o PDF com texto**
— foi o que aconteceu com a SBD 2026 de DM2: a versão do site tem texto (1,06 MB,
46 páginas, 132.591 chars) e entra inteira pelo caminho barato.

## ⚠️ 25 QUESTÕES DO ACERVO LEGADO COM ARTEFATO DE OCR (2026-08-21)

Achado ao varrer a dedup do lote SBD 2026, não procurado. São questões antigas
(TEEM/residência), **nenhuma dos lotes autorais**, com unidades corrompidas na
extração do PDF — o aluno lê o erro:

| artefato | deveria ser | ocorrências |
|---|---|---:|
| `HbAi` | HbA1c | 5 |
| `mEg/L` | mEq/L | 2 |
| `1,73m?` | 1,73 m² | 2 |
| demais suspeitas (`m?` solto) | m² | resto de 25 |

`�` (caractere inválido): **0** — é perda de mapeamento no OCR, não erro de encoding.

Não corrigido de ofício: **é conteúdo já publicado e a correção não foi pedida**. São
trocas mecânicas e seguras (`HbAi`→`HbA1c`, `mEg/L`→`mEq/L`, `1,73m?`→`1,73 m²`), com
backup e conferência por hash como nos lotes. **Decisão do professor.**

## ✅ RESOLVIDO — Diabetes voltou a 93% do teto (2026-08-21)

Estourou para **415.302/400.000** com as três diretrizes SBD 2026 de 21/08 (DMPT,
neuropatia periférica, perioperatório) e foi resolvido **dividindo**, não apagando:
**Diabetes pós-transplante virou área própria** (43.328), e Diabetes voltou a
**371.960 (93%)**, folga de **28.040**.

🧨 **A ALTERNATIVA QUE ESTAVA REGISTRADA AQUI NÃO EXISTIA.** Esta pendência dizia
que a área tinha "4 blocos sobre crises hiperglicêmicas com **sobreposição
evidente** (`CRISES HIPERGLICÊMICAS` ×2)" e que consolidar liberaria mais que
dividir. Conferido no dado: os dois blocos de mesmo título têm **tema E fonte
IDÊNTICOS** e são **"parte 1/2" e "parte 2/2" do MESMO consenso** (Umpierrez
2024, ADA/EASD/JBDS/AACE/DTS), partido porque não cabia num bloco só. **Não é
duplicata — é um documento em duas partes.** Os outros dois (Dhatariya 2020,
Bonora 2020) são artigos distintos sobre assunto vizinho. Consolidar ali seria
**descartar artigo auditado**, e é isso que a palavra "consolidar" escondia.

⚠️ **Obesidade (397.185, 99,3%) e Tireoide (391.912, 98,0%) seguem no limite** e
não têm essa saída pronta. Para Tireoide a divisão por gestação já está
registrada como obrigatória no próximo artigo. Para Obesidade, ainda não há
palavra medida que roteie uma subárea — medir antes de dividir.

## 🚨 ABERTO EM 2026-08-21, ao carregar as 500 questões

1. ✅ **RESOLVIDO no mesmo dia — as 254 de residência já vão para o assinante.**
   `endodirect_member_content()` empilhava `plano` e `curso:endoteem` no mesmo
   ramo (`inst='Endodirect'`), e as 11 instituições de residência não caíam em
   ramo nenhum. O professor decidiu — *"As 254 questões pode distribuir para os
   assinantes"* — e a migração
   `member_content_entrega_provas_residencia_ao_plano` separou os ramos:
   assinante **1.769 → 2.023**; EndoTEEM sem plano e degustação inalterados.
   Ver [[Banco de Questões]].
2. **Rótulos de área fragmentados no banco — o filtro mostra buckets partidos.**
   `AREA_CANON` só mapeia `'Andrologia' → 'Endocrinologia Masculina'`. Sobraram:
   **`'Básica'` (141) × `'Endocrinologia Básica'` (26)**, `'Dislipidemia e
   Aterosclerose'` (9) × `'Lípides'` (192), `'Endocrinologia Feminina e
   Andrologia'` (20) × `'Endocrinologia Feminina'` (169). É pré-existente — o lote
   novo usa os 14 rótulos canônicos de `DIR_SUBS`. Conserto é acrescentar três
   entradas em `AREA_CANON`, mas **muda o que o aluno vê nos filtros**, então
   depende de aval.
3. **`bkp_provas_20260821` pode ser dropada** assim que o professor validar as 500.
   Guarda o array `provas` anterior (2.403 questões, 1.886 kB).
4. **Latente, baixa gravidade — `genCode()` pode repetir código.** Ele numera por
   prefixo de área com `count+1` em **3 dígitos**: repete quando há exclusão no
   prefixo, e **volta a zero depois de 999**. Só afeta `DB.q` (as questões que o
   próprio aluno salva), **não o banco de provas** — mas código repetido funde o
   estado de repetição espaçada via `srsKey`.
5. **Cliente e servidor sorteiam a degustação por regras diferentes.**
   `provasPool()` ordena por `degHash(code|stem)`; a RPC, por `md5(v::text)`. Os
   dois entregam 50 questões válidas, mas **não as mesmas** — o comentário no
   `index.html` diz "espelha a regra do member_content", e não espelha.

## 🔴 O QUE SÓ O PROFESSOR RESOLVE — a lista curta (atualizada 2026-08-15)

Isto é o que sobrou, e **nenhum item depende de mais trabalho meu — depende de
uma resposta dele.**

1. ✅ **RESOLVIDO — o consenso ADA/EASD 2024 chegou pelo professor** (PDF, 14/08).
   Extraído (153 fatos, cobertura das 19 páginas) e, em **15/08**, os **três erros
   ativos do núcleo** que ele expôs foram corrigidos: o corte de potássio (3,5 sem
   exigir sintoma, não 3,3 com sintoma), a cetonemia de volta à gravidade (BOHB
   >6,0 = grave) e o gatilho da cetona (história de diabetes basta). Ver
   [[Decisões]] e a nota [[Crises Hiperglicêmicas no Adulto — CAD e EHH (consenso ADA-EASD 2024)]].
2. **Os 17 extratos com 5+ anos** — quais valem substituir é decisão editorial.
   ⚠️ Os dois de **cetoacidose (2020)** deixaram de ser o pior caso: o adulto está
   coberto pelo consenso de 2024. **A CRIANÇA NÃO** — o consenso é de adultos e
   diz isso; a CAD pediátrica e o edema cerebral seguem só com 2020. Os outros
   sensíveis: insuficiência adrenal (2021), crise tireotóxica (2021).
3. **`nivolumabe`/`pembrolizumabe` → Tireoide** (reponderação — ver a seção do
   teste de caminho; a medição deu empate com troca de lado).
4. **As divergências clínicas do EndoTEEM** — sobretudo **finerenona ×
   espironolactona, cujos limiares de potássio estão invertidos entre a aula de
   2025 e a de 2026**. Arbitrar seria inventar medicina. Estão sinalizadas dentro
   dos capítulos como divergência, não como fato.
5. 🟡 **PR aberto em 15/08** com os 43 commits do ramo para a `main` — **o merge é
   dele.** Contém as três correções de núcleo acima (essas **são** de segurança e
   **ainda não estão no ar**), a propagação do EndoTEEM 2026 e a base clínica.
6. **Dividir capítulos grandes** — *Complicações Crônicas do Diabetes* **já foi
   dividido em 4** (14/08). Faltam: ***Osteoporose*** (25,3k), e decidir se
   ***Tratamento do DM2*** (18,8k) e ***Carcinoma Diferenciado*** (17,4k) também
   entram, se ***Retinopatia, Neuropatia e Pé Diabético*** (11,2k — 1,6× o teto)
   pede segunda divisão, e se **MODY** merece capítulo próprio.


## ✅ AUDITORIA ADVERSARIAL DA BASE FECHADA — 47/47 extratos, 7.087/7.087 fatos (2026-08-14)

Os dois últimos caíram hoje: **endocrinopatia por checkpoint** (111 fatos) e
**acromegalia** (212). Achados graves, todos conferidos por mim na fonte antes de
aceitar:

| | |
|---|---|
| Checkpoint `[48]`/`[104]` | A ordem **glicocorticoide antes da levotiroxina** não sobrevivia à atomização. A prova estava 130 chars depois do fim da fatia (base0@30847). Saída 1 + saída 2. |
| Checkpoint — hidrocortisona | Divergência interna **real e já registrada** pelo extrato: Tabela 1 @20776 `20 mg morning and 10 mg evening` × corpo @37051 `10-20 mg` + `5-10 mg`. |
| Acromegalia `[149]` | Sobreafirmação: promovia achado de **um estudo** a critério de cura, contra a frase 8 chars antes, que diz que limiar e momento **`remain unknown`**. |
| Acromegalia `[114]` | A fatia provava 1 de 3 cláusulas; as outras estavam nos 122 chars contíguos seguintes. |

⚠️ **Ressalva ao verificador, não ao extrato:** ele aprova um fato que cita
"20 mg/10 mg" contra citação do corpo, porque "20" e "10" existem dentro de
"10-20"/"5-10" **com outro sentido**. Verde mecânico — quem garante é o ponteiro.

## ✅ Teste de caminho — o buraco do anexo, investigado e fechado no que dava (2026-08-14)

Os 59 blocos são alcançáveis. As três asserções sondam a **400k**, e produção com
anexo usa **120k** — mas **duplicar a asserção nos dois tetos seria enfeite**: a
marca sobrevive até a 15k, porque o 1º bloco sempre sai inteiro.

**Fechado:** as três frases naturais de imunoterapia que caíam em NENHUMA área
agora alcançam o bloco dedicado, com 4 controles no teste (303 → **311**
roteamentos).

⚠️ **`imunoterapia` sozinha foi testada e REJEITADA**, e o motivo é medido: ela
rouba `imunoterapia e tireoide` de Tireoide, e a comparação do que cada área
entrega deu **empate com troca de lado** — Tireoide traz `tionamida` e não traz
`crise adrenal`; Endocrinopatias traz `crise adrenal` e não traz `tionamida`.

**O que sobra e é decisão dele:** `nivolumabe`/`pembrolizumabe` continuam
apontando para Tireoide (linha ~552, decisão explícita). Com anexo, a pergunta
*"nivolumabe: quais toxicidades endócrinas rastrear"* entrega 62k de tireoide na
gestação e perde `crise adrenal`. **Mudar isso é reponderação, não conserto.**

## 🟡 EndoTEEM 2026 — 8 decisões que ficaram para o professor (2026-08-14)

Detalhe completo em `scratchpad/endoteem2026/revisar.md` (15 seções). O que precisa
de decisão dele:

1. **Dividir capítulos que ficaram grandes.** *Complicações Crônicas do Diabetes* está
   em **27,7 mil caracteres** (sugestão: retinopatia · neuropatia+pé · doença renal ·
   comorbidades). *Osteoporose* está em **25,3 mil**.
2. **Divergências numéricas entre a revisão de 2025 e a aula de 2026** — ~20 pontos,
   sinalizados dentro dos capítulos. O par **finerenona × espironolactona** (limiar de
   potássio) está **invertido** entre as duas aulas.
3. **MODY** entrou dentro de *Diagnóstico e Classificação do Diabetes*; existe uma
   diretriz **pública** "MODY (diabetes monogênico)". Decidir se merece capítulo próprio.
4. **Fluxograma de insulinização do DM2 veio truncado por OCR** ("2001", ">301", lidos
   como 20 e 30 UI) e há dois esquemas de início que não conversam (10/16 UI fixos ×
   0,1–0,2 UI/kg). Confirmar no slide original.
5. **6 aulas sem capítulo correspondente**: DHEM, Lipodistrofias, Diabetes monogênico,
   Diabetes no SUS e Disruptores Endócrinos (×2 — uma anunciada e ausente da pasta).
6. **Capítulos duplicados** entre a aba Resumos e a aba Diretrizes (mesmo `tema`).
7. **A fonte original da diretriz pública `Hipopituitarismo` foi perdida** num update
   meu de sessão anterior e reposta como "Endocrine Society" — **conferir**.
8. **JPEG de 238 KB embutido** em *Regulação do Apetite* (242 mil caracteres, dos quais
   4,1 mil são texto). Único capítulo com `data:image` — não toquei.


## ✅ PARADA COMBINADA — encerrada (2026-08-14)

As duas tarefas da sexta foram feitas: **auditoria adversarial 47/47 (100%)** e o
**roteamento do checkpoint**.

⚠️ **E a linha do deploy estava VELHA.** Ela dizia "produção v214, ramo v219".
Conferi o `origin/main` de hoje — **pelo texto, não pela contagem**:

| Correção represada | Em `origin/main`? |
|---|---|
| Régua da obesidade pediátrica (P95 × P97) | ✅ no ar |
| Cautela do romosozumabe com corticoide | ✅ no ar |
| Copeptina — coleta só com sódio **>150** | ✅ no ar (e **0 ocorrências** do "147" errado) |
| Copeptina — **o basal é o porteiro** | ✅ no ar |
| Corte do GH no TOTG **por ensaio** | ✅ no ar |

`sw.js` está em **v239** nos dois lados. **As cinco correções já chegaram a
médico.** O que separa o ramo da `main` hoje são **36 commits de trabalho novo**
(as duas auditorias, o EndoTEEM e o roteamento) — mérito de PR, não de correção
represada.

## 📅 AUDITORIA DE ATUALIDADE DO ACERVO — resultado, e o que só o professor resolve (2026-08-09)

Resposta à instrução dele (*"mantenha o cuidado de sempre manter o arquivo mais
atualizado — eu tinha uma diretriz de dislipidemia de 2017 e a plataforma já
estava com a de 2025"*). Cruzei os **35 extratos** contra os **245 itens da fila**
por três testes, do mais frouxo ao mais estrito:

1. **palavra-chave + área** → 6 "achados", **todos falso positivo** (sobreposição
   frouxa: *"Type 1 diabetes Seminar"* não é versão nova de *PTDM*);
2. **mesma pasta do Drive + ano maior** → 12 "achados", **também falso positivo**:
   as pastas são amplas (`Plataforma ED/Diabetes`), então artigo mais novo na
   mesma pasta **não** é versão mais nova do mesmo documento;
3. **mesma SOCIEDADE reeditando + ano maior** → 1 "achado", **falso positivo**
   (Endocrine Society publicando sobre *outro* assunto).

**✅ Conclusão: nenhum extrato da base tem edição mais nova esperando na fila.**
Os dois casos que pareciam supersessão real já estavam cobertos — a diretriz
**brasileira de obesidade de 2025** e a **conjunta ESE/Endocrine Society de 2024**
de insuficiência adrenal **já estão extraídas**.

⚠️ **Lição de método: "mesma pasta" e "palavra em comum" NÃO detectam
supersessão.** A organização do Drive é por assunto, não por linhagem de
documento. Só o par *mesma sociedade + mesmo assunto* diria, e isso exige olhar
caso a caso.

### ⛔ O QUE NÃO DÁ PARA CONSERTAR EXTRAINDO — precisa do professor

**A base responde CETOACIDOSE com material de 2020**, e o **consenso ADA/EASD de
2024 sobre crises hiperglicêmicas NÃO EXISTE no Drive** (busquei a fila inteira
por `hyperglycemic crisis`, `ketoacidosis`, `hiperosmolar`: o mais novo é de
**2020**). Cetoacidose é emergência e é dos assuntos mais consultados —
**este é o item de maior risco da lista de defasagem, e só o professor resolve,
mandando o documento.**

### Os 17 extratos com 5+ anos (para ele decidir o que vale substituir)

`2016` PTDM · `2017` osteogênese imperfeita · `2018` hirsutismo (Endocrine
Society), hiperglicemia por glicocorticoide · `2019` fármacos e tireoide,
hipofosfatasia, craniofaringioma · `2020` dumping, cirurgia bariátrica,
craniofaringioma (manejo), **cetoacidose euglicêmica**, **cetoacidose diabética**,
NTIS, exercício com CGM · `2021` insuficiência adrenal, crise tireotóxica,
farmacoterapia da obesidade.

## ✅ RESOLVIDO — O CI FICAVA VERDE COM EXTRATO QUE NÃO MONTA (2026-08-09)

Consertado no mesmo dia com a invariante descrita abaixo:
`monta-base-profunda.js --conferir` remonta a base e exige **igualdade byte a
byte** com o `lib/clinical-deep-data.js` commitado; entrou no `ci-validate`.
Conferido nos dois sentidos — passa hoje (54 blocos, 6.686 fatos) e **reprova
com um único caractere de diferença**, saindo com código 1.

O registro do buraco fica abaixo, porque a lição é sobre o TIPO de guarda.

## 🟢 O CI FICAVA VERDE COM EXTRATO QUE NÃO MONTA (2026-08-09)

Achado processando a leva de Adrenal/Neuroendocrinologia. O
`monta-base-profunda.js` **abortou** — um extrato veio com
`tipo: "revisão narrativa (Review)"`, fora do vocabulário fechado do
`PESO_TIPO`, e a guarda para de propósito em vez de rebaixar em silêncio uma
revisão para o tier de relato de caso. A guarda funcionou.

⚠️ **Mas o `ci-validate` passou verde mesmo assim**, porque ele valida o
`lib/clinical-deep-data.js` já construído — que continua consistente, só
**velho**. Resultado: três artigos extraídos, verificados e commitados podem
existir no repositório sem chegar a médico nenhum, e nada acusa.

É a versão estrutural de "extração verificada não é entrega".

**O conserto certo é uma invariante, não uma peneira nova:** rodar o montador no
CI e exigir que a saída seja IGUAL ao `clinical-deep-data.js` commitado. Isso
pega os dois lados — o extrato que aborta a montagem E o "esqueci de rebuildar".
Copiar só a checagem do `tipo` seria pior: daria confiança falsa sobre as outras
condições de aborto.

Não entrou ainda porque reprovaria agora, com dois extratos cujos agentes ainda
não relataram — e consertar extrato de agente no ar é o acidente que a convenção
do `git add -A` já descreve. Entra quando a leva fechar.

## 👯 A FILA TEM 5 TÍTULOS COM DOIS `fileId` — e um deles já foi extraído (2026-08-09)

Achado varrendo o `fila-extracao.json`: 245 ids para **240 títulos**. Os cinco
repetidos:

| título | ids |
|---|---|
| Diagnosis and management of central diabetes insipidus in adults | `1w-2-Umi` ✅ **já extraído** · `11xOGY3Q` **ainda pendente** |
| Endocrine toxicities of immune checkpoint inhibitors | `1DYg7sRy` · `1UAUYQB9` |
| The epidemiology, diagnosis and treatment of prolactinomas | `1g-okiMj` · `1qmeqMdU` |
| The management of primary aldosteronism: case detection… | `1G3A3M0s` · `1GZZArFd` |
| Postoperative diabetes insipidus: how to define and grade… | `1oYhQhUd` · `1GnEV5Lt` |

⚠️ **O do diabetes insipidus é o perigoso:** um id já virou extrato (169 fatos) e
o outro segue marcado como pendente. Nada impedia a leva seguinte de extraí-lo de
novo — e duplicata **dobra o peso do artigo na seleção por tema**, come teto de
área em dobro e faz a IA ver a mesma afirmação duas vezes, o que soa como
confirmação independente sem ser.

✅ **Guarda de CI criada no mesmo dia** (`confere-artigo-duplicado.js`): compara o
TÍTULO normalizado dos extratos, não o `fileId` — porque o defeito da fila é
justamente ter dois ids para o mesmo artigo. Zero falso positivo hoje (44
extratos, 44 títulos distintos) e conferida nos dois sentidos.

**O que ainda falta, e é trabalho de fila, não de CI:** marcar os ids perdedores
no `fila-extracao.json` para que nenhum agente os escolha. A guarda pega o
acidente **depois** de a extração ser feita — melhor que nada, mas gasta uma leva
inteira de agente antes de acusar.

## 🕵️ O ARTIGO DE CUSHING RESPONDE "QUAL EXAME", NÃO "QUANDO SUSPEITAR" (2026-08-09)

Lacuna de **acervo**, não de roteamento — anotada para a fila do professor.

A metanálise de acurácia que entrou hoje cobre o rastreio bioquímico com
sensibilidade e especificidade por teste. Ela **não descreve o fenótipo**.
Contado na base montada: `estrias violáceas`, `giba`, `face em lua cheia` e
`fragilidade capilar` têm **ZERO** ocorrência em qualquer bloco; `cushingoide`
tem 5 (e nenhuma no bloco de Cushing).

Consequência medida: *"fácies cushingoide e estrias violáceas"* chega à área
certa (pus `cushingoide` → Adrenal, 5×1) e **nenhum bloco responde**.

⚠️ **Não roteei `estrias violáceas` nem as outras**, pela mesma regra do
`xantelasma` em Lípides: rotear para conteúdo que não existe é prometer o que não
se entrega. O conserto é um artigo sobre o quadro clínico de Cushing.

⚠️ E o extrator mediu duas chaves que eu **recusei por redundância**:
`cortisol salivar` (21×0) e `cortisol livre urinario` (27×0). Elas são
exclusivas, mas `cushing`, `cortisol` e `dexametasona` já levam a Adrenal, e com
o tema novo o bloco vence sozinho nas três perguntas que testei. **Chave
redundante é peso escondido** — entra sem precisar e reaparece desequilibrando
outro empate depois.

## 🔤 RAIZ DE 5 LETRAS CASA NO MEIO DE OUTRA PALAVRA (2026-08-09)

Medido, sem conserto, porque o remédio óbvio quebra o que funciona.

O `deepFor` corta 2 letras de radical e casa por **substring** quando a raiz tem
mais de 4 caracteres — só as de até 4 ganham fronteira de palavra. Resultado:
`estrias` vira a raiz `estri` e casa dentro de **"restringi-lo"**. Contado nos
temas da base: das 7 ocorrências de `estri`, **7 são no meio de palavra e zero
começam palavra**.

Foi o que fez o bloco do hiperaldosteronismo vencer *"fácies cushingoide e
estrias violáceas"* por `estri*` (+3 pelo tema).

⚠️ **Subir a fronteira para 5 ou 6 letras NÃO é o conserto**: `calci` casa 11
vezes no meio de palavra e ali é legítimo (`hipocalcemia`, `nefrocalcinose`), que
é justamente a flexão que a regra existe para permitir. Um conserto de verdade
precisa distinguir composição de colisão — provavelmente por lista de radicais
conhecidos, e com medição contra as 277 linhas de roteamento.

## 🔀 A PONTUAÇÃO NÃO ENXERGA DIREÇÃO, E EM ENDOCRINOLOGIA A DIREÇÃO É O DIAGNÓSTICO (2026-08-09)

Medido no teste de ordem, **sem conserto** — o mecanismo certo é maior que o
tempo desta janela, e improvisar aqui é pior que registrar.

**O caso:** toda pergunta de HIPERcalcemia escrita com VALOR recebe em primeiro o
bloco do **HIPOparatireoidismo**.

| pergunta | 1º bloco entregue |
|---|---|
| "cálcio 11,4 com PTH normal-alto" | hipoparatireoidismo crônico |
| "cálcio alto com PTH inapropriadamente normal" | hipoparatireoidismo crônico |
| "cálcio 11,4 e PTH 88" | hipoparatireoidismo crônico |
| "cálcio 13 com PTH baixo" | hipoparatireoidismo crônico |
| "**hipercalcemia** com PTH suprimido" | hipercalcemia com PTH suprimido ✅ |

**Só acerta quando o médico escreve a PALAVRA.** E o médico escreve o valor.

**Por que acontece, e por que não é over-claim de tema:** as palavras da pergunta
(`cálcio`, `PTH`, `alto`, `normal`) estão nos dois temas — só que no do
hipoparatireoidismo elas apontam para o lado OPOSTO (*"fósforo alto"*, *"PTH
inapropriadamente baixo"*). A pontuação conta presença, não direção. Empatados, o
desempate é a ordem de autoridade do montador, e o hipoparatireoidismo é uma
**diretriz internacional de 2022** enquanto o hiperparatireoidismo é um **Seminar
de 2018** — a diretriz sorteia primeiro, por construção e com razão.

⚠️ **E o número não ajuda:** `11,4` vira os tokens `11` e `4`, ambos derrubados
pelo filtro de 4 caracteres. Quem dá o valor em vez da palavra não tem
discriminação nenhuma.

**O que limita o dano hoje** (por isso não é emergência): Osteometabolismo cabe
inteira no teto (313k de 400k), então **os dois blocos CHEGAM** — é ordem, não
evicção, ao contrário do acidente da hiponatremia. E os dois temas se declaram
("hipoparatireoidismo CRÔNICO…" / "⚠️ NÃO CONFUNDIR COM HIPOPARATIREOIDISMO").

**Mecanismo que provavelmente resolve:** desempate por DIREÇÃO, na mesma família
do desempate por condição exigida que já entrou. Quando a pergunta carrega um
marcador de direção para um analito (`cálcio alto`, `hiper-`, valor acima da
faixa), o bloco cujo tema declara a direção OPOSTA para o mesmo analito vai para
trás. Precisa de: um mapa analito → par de direções, leitura do valor numérico
contra a faixa, e medição contra as 274 linhas de roteamento antes de entrar.

## 🎯 O BLOCO "INDUZIDO POR X" VENCE A PERGUNTA QUE NÃO CITA X — METADE RESOLVIDA (2026-08-09)

✅ **A metade da SOBRA está consertada**, e o conserto é de **desempate**, não de
peso: com pontos IGUAIS, o bloco que exige uma condição ausente da pergunta vai
para trás. A estreiteza é o ponto — mexer na pontuação reordenaria blocos de
notas diferentes, que é como se entrega conteúdo da área certa e do assunto
errado. Só condição com sinônimo FECHADO entra no mapa (`CONDICAO_EXIGIDA`); hoje
só `glicocorticoide`, com as 13 formas que o médico escreve (prednisona,
dexametasona, corticoterapia…).

Junto veio o conserto de área que faltava: **`fratura` sozinha não era chave** —
só os compostos —, então *"paciente em prednisona há 4 meses, previno fratura?"*
era decidida por `prednisona` e ia para **Adrenal**. Medido: `fratura` é 329 de
352 em Osteometabolismo (93%). Os dois mecanismos compõem certo: com corticoide
na pergunta chega o GIOP; sem, chega a osteoporose geral.

❌ **A metade da FALTA continua aberta:** *"biotina falseia o TSH?"* e *"lítio e
hipotireoidismo"* recebem em primeiro o bloco do hipertireoidismo no ADULTO, e
não o de **fármaco e tireoide**, que é o dono da interferência de ensaio e da
disfunção medicamentosa. Ali não há empate — o bloco do adulto ganha por pontos,
então o desempate não alcança. E `induzida por MEDICAMENTO` ficou de fora do mapa
de propósito: "medicamento" não tem sinônimo fechado, e exigir a palavra
derrubaria justamente a pergunta que **nomeia o fármaco**.

O que provavelmente resolve: reconhecer que a pergunta nomeia UM FÁRMACO (lista
fechada, como a do `confere-farmaco-na-citacao.js`) e dar bônus ao bloco que
declara `induzid* por medicamento`. Precisa de medição contra as 265 linhas de
roteamento antes de entrar.

**O caso que a expõe, com os números:** *"fratura de quadril após queda da
própria altura"* — paciente que não toma corticoide nenhum — recebe em primeiro
o bloco do **GIOP**. Os dois empatam em **18 pontos**, com exatamente os mesmos
seis termos (`fratura`, `quadril`, `após`, `queda`, `própria`, `altura`) no tema,
e o desempate é a ordem do array. O empate é legítimo: a diretriz do ACR
**discute mesmo** fratura por fragilidade e quadril. Não é tema inflado.

**Por que isso é uma classe e não um caso:** a base tem pelo menos quatro blocos
"induzido por X" — GIOP, hiperglicemia induzida por glicocorticoide, diabetes
pós-transplante e disfunção tireoidiana induzida por medicamento. E o defeito
corta **para os dois lados**, medido na mesma varredura:

- **sobra**: GIOP vence a pergunta que não menciona corticoide;
- **falta**: *"biotina falseia o TSH?"* e *"lítio e hipotireoidismo"* recebem em
  primeiro o bloco do hipertireoidismo no ADULTO, e não o de **fármaco e
  tireoide**, que é o dono da interferência de ensaio e da disfunção
  medicamentosa.

**O mecanismo que falta:** um bloco cuja aplicabilidade é CONDICIONAL deveria
ganhar pontos quando a pergunta cita a condição e perdê-los quando não cita. É a
mesma família do conserto da negação (o `deepFor` passou a saber que "sem
sintomas" não pontua o bloco sintomático): pontuação por contagem de palavra não
enxerga nem negação nem pré-requisito.

⚠️ **Não fazer às pressas.** Derivar a condição do tema (`induzid[oa] por X`) é
elegante e arriscado — precisa de sinônimo (`glicocorticoide` = `prednisona` =
`corticoide` = `dexametasona`) e de medição contra as 254 linhas de roteamento
antes de entrar.

**Consertado hoje, do que era só tema faltando** (esses não precisavam de
mecanismo novo, só das palavras certas na superfície de busca): osteogênese
imperfeita por **esclera azulada** (12 ocorrências no texto, zero no tema — a
pergunta patognomônica recebia o GIOP) e **fratura de quadril** no bloco da
osteoporose (30 ocorrências no texto, zero no tema).

## ⏳ TIREOIDE A 98% DO TETO — e ela cresce SEM artigo novo (2026-08-09)

Números para a decisão do professor, todos medidos:

| | chars | % do teto de 400k |
|---|---|---|
| **Tireoide hoje** | **391.745** | **98%** — folga de 8.255 |
| se dividir: *Tireoide na gestação* (ATA 2026, 4 blocos) | 203.264 | 51% |
| se dividir: *Tireoide* (5 blocos restantes) | 188.481 | 47% |

⚠️ **O que mudou de patamar: a área cresce sem eu extrair nada.** As duas
auditorias adversariais de hoje somaram **8.080 caracteres** de ressalva de
população aos fatos de tireoide — e a folga é de **8.255**. **Uma auditoria a
mais do mesmo tamanho esgota**, e aí o `test-teto-diretrizes.js` reprova.

Auditar é acrescentar texto de segurança, e texto de segurança ocupa teto. Não é
motivo para auditar menos; é motivo para dividir.

⚠️ **E não dá para subir o teto de novo:** 400k já é o `TETO_MAXIMO`.

**O que acontece no instante em que ela cruzar — medido em 09/08 pela sonda
`scratchpad/probe/tireoide-borda.js`, que roda o caminho real (`deepFor`):**

- Hoje os **9 blocos chegam inteiros** em todas as perguntas que testei.
- **O primeiro bloco some com +10.000 caracteres** na área (folga real: 8.237).
  O menor bloco tem 6.782 caracteres; os outros oito vão de 16.769 a 68.373.
  Nenhum artigo real acrescenta menos que isso — **a próxima extração de tireoide
  despeja um bloco inteiro, em silêncio**.
- **A ordem de despejo é sã**, e isso é a boa notícia: cai sempre o bloco *menos*
  relevante para a pergunta (numa pergunta de crise tireotóxica cai o NTIS; numa
  de T3 baixo na UTI cai a crise). Não é o caso da hiponatremia, em que o bloco
  despejado **contradizia** a pergunta — aqui ele só é dispensável.

Ou seja: o risco de hoje é **perder profundidade**, não receber resposta errada.
Isso rebaixa a urgência de "agora" para "antes do próximo artigo de tireoide" —
mas não muda a decisão, porque a folga já não cabe nem mais uma auditoria.

⚠️ **A sonda me ensinou a desconfiar da própria chave.** A primeira versão dela
identificava o bloco cortando o tema no primeiro `" — "`, e os temas **têm
travessão dentro** (o sufixo de seções). Quatro blocos da gestação viraram um só
e ela relatou *"5 de 9 entregues"* quando os 9 chegavam. Chave passou a ser o
índice do bloco. É a mesma armadilha da âncora ambígua que já me pegou dentro do
meu próprio teste de completude.

⚠️ **A divisão NÃO é só roteamento — é mudança de produto**, e por isso é
decisão dele: a lista de áreas está acoplada ao `index.html` em `FC_CATS` (12
subespecialidades), submapas de tema, cores, calculadoras por área e filtros do
mural. Uma 13ª subespecialidade muda o que o aluno vê.

**Correção de uma medição minha:** cheguei a calcular a ATA de gestação como 74%
da área. Estava errado — meu filtro casava `gestação` no tema do artigo do
hipertireoidismo no ADULTO, que discute gravidez. O valor certo é **52%**,
consistente com os 53% que eu tinha medido antes.

## ⛔ A FILA DA ROTA B MUDOU DE ORDEM POR CAUSA DO TETO (2026-08-09)

A tabela mais abaixo põe **Tireoide em 3º**. **Não extraia mais nada de Tireoide
antes de dividir a área** — a medida diz por quê:

| área | ocupa | folga até 400k | cabe |
|---|---|---|---|
| **Tireoide** | 383.665 | **16.335** | **ZERO artigo** |
| Obesidade | 350.391 | 49.609 | ~1 |
| Diabetes | 284.265 | 115.735 | ~2 |
| **Osteometabolismo** | 51.374 | 348.626 | **~7** |
| Adrenal | 87.488 | 312.512 | ~6 |

O teto profundo foi ao **máximo** (400k) em 09/08 e Tireoide já ocupa **96%**.
O próximo extrato de tireoide **reprova o `test-teto-diretrizes.js`** — a guarda
existe justamente para isso. Auditoria de Tireoide pode seguir (não acrescenta
conteúdo); **extração, não**.

**Próxima área para extrair: Osteometabolismo (era a 4ª).** Duas razões que
apontam para o mesmo lugar: é quem tem **mais folga** (~7 artigos) e é onde
moram **três dos doze assuntos sem nenhum bloco** — osteoporose, hipercalcemia/
hiperparatireoidismo e hipoparatireoidismo. Hoje a área só tem hipofosfatasia e
osteogênese imperfeita, que são **doenças raras**: a mesma distorção que fez
Diabetes ser a primeira da fila (130 fatos, 109 de pós-transplante e 21 de MODY).

## ✅ DIABETES FECHADO — a primeira área da Rota B (2026-08-08)

**7 de 7 extratos auditados**, 849 fatos. A área saiu de 130 fatos (109 de
diabetes pós-transplante + 21 de MODY, as duas coisas mais raras do assunto)
para cobertura real: DM1, cetoacidose clássica e euglicêmica, hiperglicemia por
corticoide, pré-diabetes, exercício no DM1.

**O que as sete auditorias mediram:** taxa de erro semântica entre **2,6% e
10,8%**, e quase nada era erro de LEITURA — nenhuma inversão, nenhum número
trocado, nenhum deslocamento de coluna. O defeito dominante é **contexto perdido
na atomização**: o fato responde certo ao parágrafo e errado à pergunta.

Os três que mudavam conduta de verdade:
- regra da NPH com a citação truncada **antes do teto** — prescrevia dose linear,
  quase o dobro de insulina em 75 mg de equivalente de prednisona;
- 20 fatos de uma tabela que era a seção **pediátrica** do ADA sem declarar isso,
  incluindo meta pressórica mais estrita que a do adulto;
- nos 76 fatos da cetoacidose euglicêmica faltava a **única** instrução que a
  distingue: suspender o iSGLT2 depois que a cetoacidose instalou.

**Próxima: Obesidade** (29 pendentes no acervo, 14 de alta ancoragem). Começou
com a Diretriz Brasileira 2025 (162 fatos, em auditoria) + Lancet 2021
farmacoterapia e JAMA 2020 cirurgia bariátrica (em extração).

## 🗺️ ROTA B — fechar uma subespecialidade de cada vez (2026-08-08)

O professor escolheu a Rota B: **extrair E auditar até fechar a área**, em vez de
extrair tudo e auditar depois. Motivo: **todo extrato auditado até hoje tinha
erro** (5–20% de taxa semântica, e em cada rodada pelo menos um que mudava
conduta). Extrair 230 artigos sem auditar produz uma base grande com taxa de erro
desconhecida — rápido, e pior que a de hoje.

**Uma área só está FECHADA quando todos os extratos dela passaram por auditoria
adversarial.** Fila zerada não é área fechada.

### Ordem, e por quê

O critério não é o tamanho da fila, é o **buraco entre importância clínica e
cobertura**:

| # | área | na base | pendentes / alta ancoragem |
|---|---|---|---|
| 1 | **Diabetes** ← em curso | 130 fatos, **todos sobre coisas raras** | 23 / 9 |
| 2 | Obesidade | 86 (só o consenso de dumping) | 30 / 15 |
| 3 | Tireoide | 218 | 23 / 13 |
| 4 | Osteometabolismo | 282 | 32 / 22 |
| 5 | Adrenal | 286 | 34 / 19 |
| 6 | Neuroendocrino (a mais coberta) | 781 | 56 / 29 |

Lípides (583) e Endocrinopatias (638) já estão densas. Esporte tem 3 pendentes e
fecha junto de qualquer leva.

⚠️ **Pediátrica, Masculina e Transgeneridade têm ZERO artigos no acervo do Drive.**
Não é ordem de prioridade — o material não existe lá. Hoje a IA gera essas três só
com o núcleo, e só o professor pode resolver, mandando artigos.

### Por que Diabetes é a primeira

É a área mais usada da endocrinologia e a base tem **130 fatos, sendo 109 de
diabetes pós-transplante e 21 de MODY** — as duas coisas mais raras que existem no
assunto. Nada de DM2, cetoacidose, insulinização ou complicações. É o maior
descompasso entre o que o aluno pergunta e o que a base sabe.

### Ritual por artigo, sem pular etapa

1. agente extrai em `scratchpad/acervo/trabalho/<fileId>/` (pasta isolada)
2. `verifica-extracao.js --dir <trabalho>` → 0 reprovados
3. `cobertura-extracao.js --dir <trabalho>`
4. **eu confiro à mão toda acusação grave contra o texto-fonte** — auditor erra, e
   já errou (a acusação contra a metade 1 da dislipidemia era falso alarme)
5. mover o extrato para `scratchpad/acervo/extratos/`
6. `protege-citacoes.js` — texto da citação vira offset+hash, senão o CI reprova
7. `confere-ressalvas.js`
8. `monta-base-profunda.js`
9. **teste de CAMINHO** — a pergunta real do médico chega ao bloco?
10. auditoria adversarial do extrato
11. correção do núcleo se a fonte o contrariar → `index.html` + bump do `sw.js` +
    harness A/B em Chromium
12. `ci-validate` + commit + PR + merge

### Regra que só aparece com muitos agentes

**Só UM agente pode editar `lib/clinical-deep.js` por vez.** Os demais apenas
RELATAM os termos que faltam em `TERMOS`; eu aplico. Dois agentes no mesmo arquivo
perdem trabalho um do outro sem aviso.

## ✅ RESOLVIDO — Flashcards na degustação: 10% do total (2026-08-31)
O professor decidiu por um limite mais simples e mais restrito que a trava por tier: *"flashcards, libera somente 10% do total"* — **53 de 533**, contra os 353 que a trava por tier daria. Ver [[Decisões]] 2026-08-31 e `supabase/degustacao-amostras.sql`.

### Contexto do achado


Medido ao aplicar a trava dos mapas, com chamada real:

| conteúdo | degustação recebe | dos quais `tier:'member'` |
|---|---|---|
| mapas mentais | 41 (depois da trava) | 0 |
| **flashcards** | **533** | **180** |

O cofre registra em 2026-06-22 a decisão do professor: *"degustação mantém o
combinado; a expansão é só para assinante"*, implementada por `tier` — e diz que
as RPCs passariam a filtrar `fc_shared` (**degustação → só livre, 222**).
`endodirect_public_content` filtra; **`endodirect_member_content` não**. Ou seja:
o visitante deslogado recebe menos que o aluno em degustação, que está um passo
mais perto de assinar.

Não foi tocado porque o professor pediu **os mapas**. A correção é a mesma
linha, no mesmo `case`. Decisão dele: os 180 flashcards de biblioteca continuam
na degustação, ou voltam a ser benefício de assinante como está escrito?

## ✅ RESOLVIDO — Escolher o TEMA no OSCE e na Prescrição (2026-09-24 → 2026-09-25)

Luis (Gold, 83 dias, 5/5): *"No osce e prescrição comentada, seria melhor poder
escolher o tema a ser abordado e não somente a grande área."* Feito em 25/09 a
pedido do professor: select "Tema" nas duas ferramentas com os mesmos temas dos
Resumos (servidor + local), "Sortear" preservado. Ver [[Decisões]] 2026-09-25.

## ⏸️ DECIDIDO — Comunicação por WhatsApp fica de fora por ora (2026-09-25 → 2026-10-05)

Decisão do professor em 05/10: *"Não vamos usar a comunicação de whatsapp por
ora."* Nada a construir; a avaliação abaixo fica guardada para quando (e se) o
tema voltar. Até lá, os canais com os alunos continuam sendo o push no celular,
a newsletter e o Suporte.

Pergunta original do professor: *"É possível gerar uma comunicação por whatsapp
com os alunos?"* Avaliação entregue em chat (não estava no cofre; registrada em
05/10 quando ele pediu para ser lembrado). Medido em 25/09: 135 contas, 40 planos
ativos, 18 inscritos no push, 47 telefones vindos do checkout — e **nenhum
consentimento registrado** para mensagens por WhatsApp (o telefone do checkout
foi dado para a cobrança, não para comunicação).

Dois caminhos, em ordem de custo:
1. **Canal do WhatsApp (broadcast, sem número dos alunos)** + botão "Copiar para
   WhatsApp" no card do Mural/comunicado do painel do professor. Sem API, sem
   custo por mensagem, sem consentimento individual (quem quiser segue o canal).
   Recomendado para começar.
2. **Meta Cloud API** (mensagens individuais): exige conta Business verificada,
   modelos aprovados, custo por conversa e **opt-in explícito** — campo novo no
   perfil/checkout ("aceito receber avisos por WhatsApp") antes de qualquer envio.

Em 05/10 o professor decidiu não seguir nenhum dos dois por ora.

## ✅ RESOLVIDO — O radar notifica sozinho as Breaking News OFICIAIS (2026-09-25 → 2026-10-05)

Decisão do professor em 05/10: *"oficial"* (entre manual, oficial e todas).
Implementado em `lib/push-breaking.js`: só `breaking && isBreakingTrusted`, só no
primeiro aparecimento (`fresh`), um por dia, marca `pushAutoAt` no item, envio
antes do save (a marca vai no mesmo write). Ver [[Newsletter e Radar]].
Fica anotado o caso raro: push enviado e gravação falhando depois → o item volta
como `fresh` no run seguinte e pode ser notificado duas vezes.

## 📦 `member_content` — RESOLVIDO EM PARTE: 12,3 → 5,3 MB (2026-08-31 → 2026-09-24)

Medido em 31/08 com token real: 12.465.614 bytes para um Gold. Em 24/09, com o
feedback da Renata ("as questoes nao aparecem para mim"), a resposta caiu para
**5,31 MB** (sem `diretrizes` duplicadas, radar janelado em 200 — ver
[[Decisões]] 2026-09-24 e `supabase/member-content-mais-leve.sql`) e o cliente
passou a tentar 3×, dizer quando falha e não depender dessa resposta para saber
o plano.

**O que ainda fica em aberto:**

- [ ] **`provas` continua vindo inteira (3,79 MB, 2.085 questões)** numa
      resposta só. É a maior fatia restante. Caminhos: paginar por área/instituição
      (o filtro do Banco já é por área) ou RPC própria com retentativa separada.
      Medir a taxa de falha depois desta rodada antes de decidir.
- [ ] **Cota do `localStorage`:** `applyStatePayload` grava `provas` (3,8 MB),
      `adm_avisos` (0,7 MB) e `carregarResumos` grava `diretrizes` (2,9 MB) chave a
      chave; `lsSet` engole `QuotaExceeded` e cai em memória. No Safari (~5 MB por
      origem, contado em UTF-16) a cópia local das provas provavelmente nunca existe
      — cada abertura depende da rede. Não medido em aparelho.
      - **25/10: a auditoria das Diretrizes agrava a cota.** Com as 72 Diretrizes
        completas, a lista do assinante vai de ~3,3 para ~6 MB, maior que a cota
        inteira (~5,2 milhões de caracteres no Chromium, medido em `teste-cota.js`).
        Aí o `lsSet('diretrizes')` falha sempre, e o `setItem` que falha deixa a
        cópia ANTIGA no aparelho: no boot seguinte o aluno vê as Diretrizes de antes
        da auditoria até a carga em páginas chegar (ou, sem rede, com o aviso de
        "última cópia"). A cópia velha também continua ocupando cota.
      - **Caminho provável:** mover as listas grandes (`diretrizes`, `provas`) para o
        IndexedDB, ou apagar a chave quando o `setItem` falhar.
      - Decidir antes de terminar os lotes.
- [ ] **Dashboard durante falha do `member_resumos`:** a fração "8 de 71" com
      tooltip "A assinatura abre o restante" aparece para um Gold cuja carga caiu.
      Como o `member_content` não manda mais `diretrizes`, a falha da RPC de
      resumos ficou visível na aba Diretrizes (aviso + "Tentar de novo", feito) mas
      o card do Dashboard ainda não distingue "não chegou" de "não tem".
- [ ] **`signOut()` sem escopo** em `doLogout`/`onSessionEvicted` revoga os
      refresh tokens de TODOS os aparelhos do aluno: uma evicção por limite de 2
      dispositivos derruba também os legítimos quando o token expira, e cada
      relogin custa outra carga. Considerar `signOut({scope:'local'})` na evicção.
- [ ] **`@supabase/supabase-js@2` é tag flutuante** no `<script>`: o comportamento
      "queda de conexão devolve `{error}` sem `code`, não lança" — do qual
      `erroDeRede` depende — foi lido no fonte de hoje (2.117.x). Pinar a versão.
- [ ] **Mural sem estado de erro:** se o `member_content` falha, o Mural mostra a
      cópia local (ou "Nenhum aviso encontrado" em aparelho novo) sem dizer por quê.
      O Banco e as Diretrizes já dizem; o Mural não.

## ✅ RESOLVIDO — Vitrine (`alunopro`) ganhou identidade no servidor (2026-08-31)
Feito como planejado: conta real com `plano:gold` + cursos de vitrine, senha fora do bundle (aleatória e descartada), login pelo Supabase, `showcase_resumos` revogada. ⚠️ E revelou uma **segunda porta**: o `member_content` entregava os mesmos 161 itens privados a anônimos e foi corrigido junto. Ver [[Decisões]] 2026-08-31 e `supabase/vitrine-conta-real.sql`.

- [x] **Dar conta REAL no Supabase à vitrine.** Hoje `alunopro` é conta **local do bundle** (`var USERS` no `index.html`), com a senha publicada no código e **sem sessão no Supabase**. Consequência estrutural: **nenhum gate de servidor consegue distinguir a vitrine de um visitante qualquer** — qualquer regra que ela passe, um `curl` também passa. Foi isso que fez o gate de 01/08 devolver vazio e deixar a aba Resumos em branco por um dia (revertido; ver [[Auditoria 2026-08-01]]).
  - **O que fazer:** criar o usuário `alunopro@endodirect.com.br` no Supabase, conceder o acesso de plano e fazer o cliente **logar de fato**. Aí a vitrine pode usar o **`member_resumos` comum** — a função especial `endodirect_showcase_resumos()` deixa de existir, e some junto a superfície aberta que a auditoria apontou. Acesso passa a ser revogável, auditável e com limite de taxa.
  - **⚠️ Mexe no fluxo de login**, que é compartilhado com as contas de admin — exige teste em navegador real antes de mergear, pela regra de [[Convenções de Trabalho]].
  - **Não aumenta exposição:** a senha da vitrine já está pública no bundle. O que muda é que o conteúdo deixa de ser alcançável por quem apenas chama a RPC, sem nem saber que a demo existe.
  - **Alternativa recusada:** token no parâmetro da RPC. Restaura a vitrine e barra o raspador anônimo, mas quem lê o bundle continua conseguindo tudo — é segurança por obscuridade, e não vale gravar como solução.

## Discussão do Mural: texto integral fora do PMC (2026-07-31)
- [x] ~~**⚠️ Tabela de artigo CC BY-NC(-ND) é reproduzida mesmo assim.**~~ **FEITO (2026-08-03).** O marcador `[[TABELA:n]]` só é oferecido quando a licença permite; o conteúdo continua indo à IA (número é fato), que escreve os valores em prosa. **Medido antes: 37 das 38 discussões são CC BY e a única NC-ND inseriu ZERO tabelas** — nada a remediar. ⚠️ Ao fechar isto descobri que **`parseLicense` estava invertido**: `/^CC (BY|0)/` casava o prefixo de *todas* as variantes restritivas (NC, ND, SA) como redistribuíveis, e CC0 saía como restrito. Ver [[Decisões]]. Texto original abaixo, para contexto:
  - ~~ `parseLicense` (lib/fulltext.js) já calcula `redistribuivel` — verdadeiro só em CC BY e CC0 — mas esse campo é usado **só para decidir sobre FIGURAS**. As tabelas do JATS entram na discussão **independentemente da licença**. A plataforma é paga (uso comercial) e `ND` proíbe derivado, então num artigo CC BY-NC-ND vindo do PMC a tabela colada hoje é reprodução que a licença não permite. **Correção pequena:** passar `ft.licenca.redistribuivel` para o prompt e, quando falso, não anexar `[[TABELA:n]]` — a discussão descreve os números em prosa, como foi feito à mão no artigo de hipercortisolismo. **Vale medir antes:** quantas das discussões já gravadas vieram de artigo não-CC BY (`meta.licenca` está gravado em todas).
- [ ] **Artigo aberto na EDITORA mas nunca depositado no PMC continua sem discussão.** A repescagem de 31/07 (`lib/pmc-repescagem.js`) resolveu o **atraso** do depósito — o PMC que chega dias depois da entrada do artigo agora é reperguntado todo dia. O que ela **não** resolve: revista que publica sob CC BY e não vai ao PMC. `lib/fulltext.js` só sabe ler **JATS do PMC**, então nesses casos não há texto integral e o card fica só com o resumo — que é o limite correto do recurso, não um defeito.
  - **Se o professor voltar a apontar artigos abertos sem discussão**, o caminho é uma **segunda fonte de texto integral**, não afrouxar a seleção: Europe PMC (`/europepmc/webservices/rest/{source}/{id}/fullTextXML`, JATS quase igual — o parser atual aproveitaria) e/ou Unpaywall/OpenAlex para descobrir o PDF/HTML aberto na editora. ⚠️ Gerar discussão a partir de **abstract** está descartado desde 28/07: é literalmente o erro dos artigos de Obesidade, em que afirmações verdadeiras para a classe não eram o que o ensaio mediu.
  - **Saída manual, já usada em 31/07 e que funciona:** o professor manda o PDF, eu extraio o texto e gravo a discussão direto em `endodirect_mural_discussoes` (`insert … on conflict do update`). Essa tabela o cliente só LÊ, então escrever nela por fora é seguro — diferente do `payload`. Feito para `pubmed:42533758`.
  - **Primeiro medir, depois construir:** quantos dos itens não-abertos do mural o Europe PMC alcança? Só a produção responde — deste ambiente o proxy devolve 403 para `eutils`/`www.ncbi.nlm.nih.gov`/`ebi.ac.uk`.

## Retenção e ativação (2026-07-28, a partir do material de EdTech)
**Contexto que orienta tudo abaixo:** 7 semanas de operação, **28 pagantes** (24 anuais à vista + 4 mensais) + 1 cortesia. Como quase todo mundo pagou **anual adiantado**, o churn só apareceria em **junho/2027** — quem parar de usar em agosto não gera sinal nenhum. Por isso o indicador que importa agora é **uso**, não receita. **Não montar dashboard de MRR/LTV/CAC neste estágio:** com n=28 e sem 12 meses de histórico, o LTV teria barra de erro maior que ele mesmo.

- [x] **"Qual seu objetivo?" no onboarding — FEITO (2026-07-28).** Obrigatório, com opções + "Outro". Destrava a segmentação por persona.
- [x] **Card "sem acesso há 14+ dias" no Analytics — FEITO (2026-07-31).** `admSumidosCardHTML()`, primeiro card do Analytics (antes do de conversão, porque é o único que gera ação no mesmo dia). Mostra nome, e-mail, plano e há quantos dias sumiu; 30+ dias em vermelho.
  - **⚠️ O campo de data é o que decide o recurso.** `auth.users.last_sign_in_at` só muda em sign-in NOVO, e a sessão do Supabase aqui é persistente: quem entra todo dia pode ter o último sign-in de dois meses atrás. Lista montada sobre ele apontaria os alunos **ATIVOS** — e o professor manda mensagem para esses nomes. A RPC `endodirect_admin_students` (migração `admin_students_ultimo_uso_por_last_seen`) passou a devolver `ultimo_uso` = maior entre `endodirect_devices.last_seen` (carimbado pelo app a cada uso) e `last_sign_in_at` (reserva para quem é anterior à tabela de devices, de 11/06).
  - **Só pagante:** cortesia (`provider='manual'`) não paga e degustação sumir é o esperado. Medido em 31/07: **32 pagantes, 14 parados há 14+ dias, 3 há 30+**.
  - Teste `scripts/test-analytics-sumidos.js` no CI; cobertura provada trocando o campo de data e deixando cortesia entrar — os dois reprovam.
- [ ] **Momento Aha: definir e medir.** Hipótese: **responder a Questão do Dia em 3 dias diferentes na 1ª semana**. Registro já existe (`payload.qotd`). Medir: quem fez isso ainda está ativo em 30/60 dias?
- [ ] **Onboarding de 7 dias** — só DEPOIS dos dois itens acima (decisão do Rodolpho em 28/07).
- [ ] **"Como conheceu?" no cadastro** — adiado a pedido (28/07). É o CAC por canal, e também não dá para reconstruir depois.
- [x] ~~**⚠️ Higiene de dados:**~~ **RESOLVIDO** — conferido em 03/08: **0 linhas** com `status='active'` e `expires_at` no passado (corrigido na auditoria de 01/08). A regra de sempre conferir `expires_at > now()` continua valendo. Contexto original: `endodirect_acessos` tinha linha com `status='active'` e `expires_at` **no passado** (`aluno@endodirect.com.br`, expirou 08/07). Qualquer consulta que filtre só por `status='active'` **superconta**. Conferir sempre `expires_at > now()` — foi o que explicou a diferença entre o meu "31" e os 29 do painel.


## Artigos / trials nos Resumos (2026-07-25)
- [x] **⚠️ OS 43 ARTIGOS ESTÃO LIBERADOS PARA OS ALUNOS (2026-07-31, "Libera os rascunhos").** Ressalva levantada por mim antes — boa parte dos números **vem da memória do modelo**, "coerente internamente, **não conferida**" — e reafirmada pelo professor duas vezes. Chave `rascunho` removida dos 43; `privado:true` mantido. **Conferido nas duas entregas:** assinante recebe **43 artigos** (149 itens privados no total); degustação recebe **4** — um por subespecialidade (Diabetes, Lípides, Obesidade, Osteometabolismo), pelo `distinct on (sub, tipo)` da RPC.
  - **Desfazer é um comando:** snapshot em `endodirect_state_backup` **id=7**.
  - **A revisão clínica/editorial continua pendente** — liberar não conferiu nada. Os itens abaixo seguem abertos de propósito; o que mudou é que o aluno já está lendo enquanto a revisão não acontece.
  - **⚠️ MECANISMO DO CLOBBER, agora entendido e não só observado.** Nas duas primeiras tentativas (16h41 e 16h42) a gravação foi desfeita em segundos. A causa está em `mergeConcurrent` (index.html): ele parte do array **da memória do navegador** e só ACRESCENTA do servidor as chaves que não existem nem no baseline nem na memória. Para um item que existe **nos dois lados**, a versão da memória **sempre vence** — então qualquer edição minha feita por SQL num item já existente de `diretrizes` é perdida no próximo save da aba do professor. Não é corrida de tempo: é o algoritmo.
  - **Por que a terceira tentativa (18h10) segurou:** a aba dele não salvou depois. **Regra prática:** mutação de `payload` por fora do app só dura se o professor der **F5 antes de salvar qualquer coisa**. Quando não dá para garantir isso, use o botão **👁 Liberar todos os rascunhos**, que passa pelo `persistDiretrizes()` e não tem com quem correr.
- [x] **AGUARDANDO REVISÃO DO RODOLPHO — 16 artigos piloto (9 Diabetes + 7 Obesidade) gravados como RASCUNHO.** Estão em `endodirect_global_state.payload.diretrizes` com `tipo:'artigo'`, `privado:true`, **`rascunho:true`** → aparecem **só no painel do professor**, em Resumos › Artigos. Nenhum aluno (assinante ou degustação) os vê — filtro no servidor, ver [[Dados e Supabase]]. Fonte de verdade do conteúdo: `scratchpad/artigos/trials.js` (conferido por md5, 16/16 idênticos ao banco). Revisão em página: `scratchpad/artigos/build_revisao.js` → artifact "Artigos (trials) — revisão antes de publicar".
  - **Ação do professor:** conferir os números e clicar **👁 Liberar para os alunos** em cada artigo aprovado (o botão só remove o `rascunho`; o item já está com `privado:true` e cai na aba Resumos › Artigos).
  - Diabetes: UKPDS 33, EMPA-REG, LEADER, SUSTAIN-6, DECLARE-TIMI 58, CREDENCE, SURPASS-2, FLOW, SOUL.
  - Obesidade: STEP-1, SURMOUNT-1, SELECT, STEP-HFpEF, SURMOUNT-OSA, SURMOUNT-5, ESSENCE.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] **REVISAR o 2º lote — 11 artigos novos (2026-07-27); total de 27 em rascunho.** 8 trials (DCCT, ACCORD, REWIND, STEP-2, STEP-4, STEP-9, SURMOUNT-2, SURMOUNT-4) + 3 comparativos em tabela (Programa STEP, SURMOUNT, SURPASS). **Os números vêm da memória do modelo** — o checador só garante coerência interna, não veracidade. Prioridade de conferência: as **faixas do SURPASS** (o próprio artigo avisa para conferir na publicação) e o **SURPASS-CVOT**, cujos valores exatos ficaram em branco de propósito.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Conferir o 3º lote contra os PDFs.**~~ **FEITO (2026-07-28)** — o professor mandou os 4. SCALE e XENDOS bateram inteiros; SCOUT e COR-I tiveram **a segurança corrigida** (ver [[Decisões]]). Continua valendo a revisão clínica dele, mas os números agora vêm da fonte.
- [x] **REVISAR o 3º lote — 4 artigos; total de 32 em rascunho.** Os ensaios pivotais dos antiobesidade não incretínicos + o da liraglutida: **SCOUT** (sibutramina), **XENDOS** (orlistate), **COR-I** (naltrexona-bupropiona) e **SCALE Obesidade e Pré-diabetes** (liraglutida 3,0 mg). **Os números já foram conferidos contra os PDFs em 28/07** — os HR do SCOUT (1,28 e 1,36) e as proporções do COR-I (48/39/16), que eram os de menor garantia, **bateram**. Falta a revisão **clínica/editorial** do professor: se o recorte, o tom e as ênfases são os que ele quer ensinar.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] **REVISAR o SURMOUNT-MAINTAIN (2026-07-27).** Único artigo cujos números **NÃO** vêm da memória do modelo: foram lidos do PDF que o Rodolpho mandou (Lancet 2026;407:2305-18). Ainda assim vale conferir, porque a transcrição é minha.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Confirmar "SURMOUNT MAINTAIN":** entrou como **SURMOUNT-4**.~~ **RESOLVIDO (2026-07-27) — eu é que estava errado.** Eu havia afirmado que o estudo "não existe com esse nome"; ele existe (Lancet 2026;407:2305-18, NCT06047548) e o professor mandou o PDF. Entrou como artigo próprio. **Lição:** sem conector de busca autorizado, o que eu podia dizer era "não encontrei", nunca "não existe".
- [ ] **Ligar os conectores PubMed e Clinical Trials** — hoje aparecem na sessão como não autorizados. Com eles, dá para conferir os números dos artigos contra a fonte em vez de depender só de revisão manual.
- [ ] **Curvas reais dos outros 5** (EMPA-REG, LEADER, SUSTAIN-6, DECLARE, SOUL): hoje são **projetadas**. O professor já mandou os PDFs de **LEADER, SUSTAIN-6, DECLARE e SOUL**; falta o do EMPA-REG. Estado: **LEADER extraído e validado** (3 âncoras, incluindo HR implícito 0,874 vs 0,87 publicado), **ainda não aplicado**; DECLARE e SOUL têm a mesma estrutura de figura e são diretos; o **SUSTAIN-6 desenha a curva como centenas de segmentos soltos** e precisa da abordagem de nuvem agrupada (`scratchpad/cvot/extrai2.py`). Técnica em [[Convenções de Trabalho]].
- [x] **Liberar em lote — FEITO (2026-07-31).** Botão **👁 Liberar todos os rascunhos (N)** no topo da grade de temas dos Resumos, por subespecialidade. Só aparece quando há rascunho; confirma listando os 6 primeiros nomes; **uma gravação só, fora do laço** (payload de 8,5 MB — uma escrita por item seriam N uploads inteiros); o recorte é exatamente o que a grade mostra (mesma sub, mesmo modo, mesmo tipo), senão o professor publicaria sem saber o quê. Teste `scripts/test-liberar-lote.js` no CI, cobertura provada quebrando o recorte e movendo a gravação para dentro do laço.
- [x] **🎨 Artigos como INFOGRÁFICO — FEITO (2026-07-25).** Ficha visual gerada por código a partir do campo `info` (fonte: `scratchpad/artigos/info.js`); as 16 estão gravadas e conferidas por md5 contra a fonte local. Decisões tomadas: o texto corrido fica **recolhido** abaixo da ficha (as limitações não se perdem) e o **forest plot entra em todos os que têm HR** (10 dos 16). Ver [[Decisões]].
- [x] **Artigos NÃO levam flashcards nem mapas mentais (decisão do Rodolpho, 2026-07-25):** "os artigos sendo em infográfico não precisam de mapas mentais e flashcards". A ficha visual já é o material de revisão. Os **64 flashcards** escritos para o lote piloto ficam gravados no JSON (reversível, custo zero) mas **deixam de ser renderizados** quando `tipo==='artigo'` — ver `dirCardHTML` (~l.8604). Capítulos seguem com os seus normalmente.
- [x] ~~**Mapas mentais dos artigos:** ficaram fora do lote piloto de propósito.~~ **DECIDIDO (2026-07-25): artigos não levam mapas mentais nem flashcards** — ver o item acima.
- [x] **REVISAR o 4º lote — 11 artigos de Lípides e Osteometabolismo (2026-07-28); total de 43 em rascunho.** **Lípides:** 4S, JUPITER, IMPROVE-IT, FOURIER, ODYSSEY OUTCOMES, REDUCE-IT. **Osteometabolismo:** FIT, HORIZON-PFT, FREEDOM, Teriparatida—Neer, ARCH. **Os números vêm da memória do modelo** — pela lição dos PDFs de 28/07, isso é "coerente internamente, **não conferido**".
  - **Onde eu apostaria que está o erro, se houver:** as **proporções absolutas de fratura** (FIT 1,1% vs 2,2%; FREEDOM 0,7% vs 1,2%; ARCH 2,0% vs 3,2%) e os **ganhos de DMO**, que são os números que menos se fixam. As reduções relativas (70%, 68%, 48%) e os HR de Lípides (0,70, 0,56, 0,936, 0,85, 0,75) são os de maior garantia.
  - **Mande os PDFs quando puder** — 11 de uma vez é muito; os que mais rendem conferir primeiro são **REDUCE-IT** (a controvérsia do óleo mineral está escrita como argumento, não como fato) e **ARCH** (o excesso cardiovascular é o que muda conduta).
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Varrer o acervo atrás de marcas de texto gerado.**~~ **FEITO (2026-07-28)** — 16 ocorrências corrigidas em 8 artigos, fonte e banco em sincronia. A regra e o comando de varredura ficaram em [[Convenções de Trabalho]]. Se ainda houver construção que soe artificial, é só apontar a frase.
- [x] ~~**Frase do comparativo SURPASS: corte deliberado ou clobber?**~~ **RESPONDIDO (2026-07-28) — foi corte deliberado.** *"eu tirei porque isso é jargão de IA"*. Eu havia reposto por engano, tratando como perda por clobber; removida de novo, no banco e na fonte. Lição registrada em [[Convenções de Trabalho]].
- [ ] **Demais subespecialidades:** faltam **Tireoide, Adrenal, Neuroendocrinologia, Endo Feminina, Endo Masculina, Endo Pediátrica, Transgeneridade, Endo do Esporte, Endocrinopatias e Endocrinologia Básica**.
  - **Onde há ensaio pivotal de verdade:** Tireoide (DATA, tratamento do hipotireoidismo subclínico no idoso — TRUST; SELENIUM/GO-MTX na oftalmopatia), Adrenal (PATHWAY-2 no hiperaldo; FIRSTMAPPP no feocromocitoma maligno), Neuroendocrinologia (PROMPT/pasireotida na acromegalia; CLARITY no Cushing), Endo Feminina (WHI e KEEPS na terapia hormonal; PPCOS-II no SOP).
  - **⚠️ Onde a literatura é fina, e eu vou dizer isso em vez de inventar ensaio:** Transgeneridade, Endo do Esporte, Endo Pediátrica e Endocrinologia Básica praticamente não têm ECR pivotal — ali o formato honesto é **coorte de referência ou consenso**, com a ficha dizendo que não é ensaio randomizado, ou simplesmente não ter artigo.

## Provas de residência (2026-07-21)
- [x] **29 USP-FMUSP/FUVEST 2023 — SUBIDAS** com `revisar_gabarito:true` (não havia gabarito oficial). **AÇÃO PENDENTE: revisar/confirmar o gabarito dessas 29.**
- [x] **Pasta "Ano adicional" — SUBIDA:** 90 questões USP R3 Endócrino (2023/24/25) com gabarito oficial + comentário.
- [ ] **USP-SP 2024 #76 (US ovário) e #104 (painel CAD):** não recuperáveis (PDF 20 MB > teto 10 MB do download Drive/MCP; hosts Google bloqueados no proxy). Precisa PDF menor ou figuras avulsas.
- [x] **Resumos vazios p/ aluno — CORRIGIDO:** era o `member_content` não enviar diretrizes privadas; agora via RPC dedicado `endodirect_member_resumos` (+ demo/degustação via `hydratePublicContent`). Ver [[Decisões]]/[[Dados e Supabase]]. **Nota:** a conta `alunopro` é DEMO (só conteúdo público) — não serve p/ testar experiência de assinante.


## Varredura completa (2026-06-15) — lançamento
**INCIDENTE (2026-06-15) — perda de aulas por sobrescrita concorrente do estado global:**
- O Eduardo subiu ~37 aulas (`endoteem`); ficaram só 6 (`endo_essencial`) no `endodirect_global_state`. **Não recuperável pelo servidor** (backup `endodirect_state_backup` só tem snapshots de 10/06). Causa: o save do admin reescreve o payload INTEIRO a partir do snapshot EM MEMÓRIA; com dois admins editando, o save de um (com cópia velha) apaga as adições do outro. Mesmo mecanismo afeta o podcast manual que "não subiu". Recuperação possível: navegador do Eduardo (localStorage `adm_cursos`) **se não recarregou**; senão, re-importar os links.
- [x] **Concorrência do estado global — PROTEGIDA (2026-06-15, #305):** `saveRemoteState` (admin) agora guarda `lastGlobalUpdatedAt` (lido no hydrate/último save) e, ao gravar, relê o `updated_at` do servidor; se mudou (outro admin/cron gravou no meio), **mescla** as coleções aditivas (`adm_cursos`, `podcasts`, `provas`, `mm_shared`, `diretrizes`, `diretrizes_temas`, `curso_mods_extra`, `adm_estudantes`) por chave de conteúdo via `unionBy()` em vez de sobrescrever — adições de dois admins não se perdem (avisa e pede recarregar). Trade-off conhecido: um item deletado em paralelo pode reaparecer (raro; só na janela de edição concorrente). Não recupera as 37 já perdidas (re-importar).


**Corrigido (#299):**
- [x] **[CRÍTICO] `findUserByEmail` provisionava conta ERRADA além de 50 usuários** (`api/webhooks/pagarme.js`, `api/checkout/order.js`, `api/checkout/subscribe.js`): o `?email=` do GoTrue admin não filtra de forma confiável e o `|| list[0]` pegava um usuário arbitrário. Agora **pagina** e casa o e-mail exato; nunca cai em `list[0]`.
- [x] **[CRÍTICO] Re-render apagava painéis movidos** (`renderAdmSec`): Consultório (`#panel-presc`) e editor visual de Mapas (`#mm-live`) eram destruídos por `innerHTML` num re-render da MESMA seção (gatilho real: hydrate automático de estado remoto), quebrando inclusive o painel do aluno. Agora `restorePrescPanel()`/`restoreMMLive()` rodam **sempre antes** do `innerHTML`.
- [x] **[MÉDIO] XSS em `<img src>`**: `q.img`/`q.expImg`/previews de upload e `cur*` eram injetados sem `esc()` (vetor se o banco vier de import/IA). Todos escapados. Links do Mural (`a.link`) agora passam por `safeHttpUrl()` (bloqueia `javascript:`/`data:`).

**Sinalizado para depois (não-bloqueante; risco/decisão/teste):**
- [ ] **CONFIRMAR (25/06) que os e-mails de degustação saíram (o usuário pediu p/ avisar):** investigação 24/06 — **infra OK** (cron 10:30 UTC chama `sendTrialEmails`; newsletter/IG marcaram "enviado" em 24/06 → o cron de fato roda), mas o **ledger `payload.trial_emails` estava VAZIO** = nada enviado até então (até 24/06 ninguém estava na janela de envio). RPC `endodirect_trial_email_targets()` retornou **8 elegíveis** (1 warn + 7 winback). Devem sair na rodada de **25/06 10:30 UTC (07:30 BRT)**. **Ação:** após o cron, conferir o ledger (deve listar os 8 com warn/winback) e avisar o usuário.
- [x] **Questão do Dia — curadoria DISTRIBUÍDA por professor — ✅ CONSTRUÍDO e DEPLOYADO (#434, 2026-06-24):** (e-mails recebidos; `endodirectmaster` tratado como Rodolpho — confirmar.) a aba **"Questão do Dia"** passa a aparecer **só para o Rodolpho** (`rodolphomend@gmail.com`, gate por e-mail); cada questão gerada ganha botão **"📤 Distribuir"** → vai para uma nova aba **"Pendências"** no painel, **roteada pela subespecialidade** ao professor responsável (badge de contagem, estilo o do Suporte); cada professor revisa/edita e **aprova** → a questão **vira a Questão do Dia ao vivo** (entra na fila/calendário). **Mapa confirmado pelo usuário** (cobre as 12 subs, sem sobreposição): **Rafael** = Adrenal, Endo do Esporte, Endo Feminina, Endo Masculina; **Eduardo** = Diabetes, Tireoide, **Osteometabolismo** (= "Metabolismo Ósseo"), Transgeneridade; **Bruno** = Endo Pediátrica; **Rodolpho** = Obesidade, Lípides, Neuroendocrinologia. **Armazenar no estado GLOBAL** (`endodirect_global_state`, p/ os outros admins verem) → entra nas chaves de **merge** (como `ig_stories`). **BLOQUEIO:** faltam os **e-mails do Rafael, Eduardo e Bruno** (chave do roteamento) + confirmar se já têm login de admin (`endodirect_admins`); se não, adicioná-los. Construir como **PR novo** (decisão: deployar o #432 primeiro — feito). Ver [[Instagram Stories (Questão do Dia)]].
- [ ] **Stories "Questão do Dia" — evoluções do MVP (2026-06-23):** (1) **publicação automática** via **Instagram Graph API** (a conta @endodirect já é Business) — hoje o professor posta manualmente; o quiz/poll sticker segue manual mesmo com API. (2) **Texto justificado** na arte (hoje alinhado à esquerda). (3) **Imagem do caso** embutida no PNG (hoje sairia por **taint** cross-origin → por ora adicionar no editor do IG; alternativa: upload same-origin/dataURI). (4) **Prints reais** nos promos de domingo (commitar em `figuras/stories/` — desktop→moldura de monitor, iPhone→moldura de iPhone; evitar dado de paciente, repo público). Ver [[Instagram Stories (Questão do Dia)]].
- [ ] **Memed LME (alto custo) não aparece — aguardando suporte da Memed (2026-06-23):** ao emitir LME de **insulina glargina** **direto na plataforma do Memed** (não só no EndoDireto), a opção **"Retirar no SUS / Preencher formulário LME"** não aparece → problema do **lado da Memed** (provável: módulo de alto custo não habilitado na conta OU glargina sem etiqueta LME no catálogo deles). **Ação do usuário:** acionar o suporte da Memed (confirmar módulo LME habilitado + glargina com etiqueta LME; anexar print). **Plano B em standby** (expor o `prescPrintLME` próprio ao lado do Memed; ~5 min p/ reativar — não está na branch, que foi resetada à `main`). Ver [[Decisões]].
- [ ] **Memed — chaves de PRODUÇÃO instaladas mas retornam 401 (2026-06-18, BLOQUEADO no lado da Memed):** o usuário recebeu por e-mail (Washington Jesus/Memed) as novas **chaves de produção** (api-key e secret-key, 60 chars cada) e as instalou na Vercel (`MEMED_API_KEY`/`MEMED_SECRET`, Production). `MEMED_ALLOW` trocado de `memed.teste@…` p/ `rodolphomend@gmail.com` (conta do Rodolpho p/ teste; CRM 186238/SP digitados na tela). Teste real → **HTTP 401 "Código de acesso inválido"** no `POST /v1/sinapse-prescricao/usuarios`. **Diagnóstico (tudo OK do nosso lado):** `GET /api/memed/token` confirma `configured:true` + `allow:["rodolphomend@gmail.com"]`; `MEMED_API_BASE` **não existe** → usa o padrão de produção `https://integrations.api.memed.com.br` (confirmado como a base correta na doc da Memed); testei inclusive **invertendo** api-key/secret-key → continua 401. Logo, o par de chaves **não está sendo aceito pela Memed** (ativação/pareamento pendente do lado deles). **Ação:** usuário vai **responder o Washington** pedindo p/ confirmar que as chaves de produção estão ativas/pareadas. Diagnóstico via Vercel runtime logs (`[memed-resp] status=401`, `[memed-dbg]`). Janela do e-mail: **7 dias úteis** p/ instalar antes de desativarem. **Quando resolver:** fazer **fase 2** = remover `MEMED_ALLOW` (libera a todos os médicos com CRM/UF) + redeploy.
- [x] **Newsletter repetindo conteúdo (2026-06-15, #303):** vinha igual ao dia anterior porque pegava sempre o `top3` do pool estável. Agora `newsletter_recent` (14d) + `pickFresh()` priorizam não-enviados; ranking refinado (revisão>metanálise>original; NEJM>Lancet>JCEM>outros); JCEM deixou de sair como "Endocrinology" (`journalMatches`/`jnorm` no radar).
- [x] ~~**Newsletter envio duplicado (concorrência)**~~ **FEITO (2026-08-03):** claim-first via RPC `endodirect_newsletter_claim` (`update … where newsletter_sent <> dia`, atômico por linha), com devolução da reserva quando **zero** destinatários receberam. RPC ausente → segue pela trava antiga. Ver [[Decisões]]. (`dateBR`/`todayISO` seguem em UTC — não mexido.)
- [ ] **Webhook pagar.me**: (a) ✅ **resolvido em 14/10/2026**: estorno, contestação, cancelamento e falha de pagamento mudam só a linha cujo pedido ou assinatura é o do evento, nunca por e-mail (ver [[Pagamentos pagar.me]]); ~~`charge.refunded`/`subscription.canceled` sem scope revoga TODOS os acessos do e-mail~~; (b) renovação sem `subscriptionId` cairia em `avulso` 365d. Validar o **payload de renovação no sandbox** (1ª renovação só em ~30d) antes de ajustar.
- [x] **[CRÍTICO] Vaga de fundador via PIX/boleto não era contada (2026-06-16):** o webhook (`api/webhooks/pagarme.js`) liberava o Gold mas **não gravava `notes`**, então nunca marcava `:fundador`. Como `lib/founder.js` conta as vagas por `notes ilike '*:fundador*'`, só compras no **cartão** (via `order.js`) entravam no limite — com PIX/boleto (meio dominante no BR) a oferta poderia **vender muito além das 100 vagas** e o auto-desativar/contador de vagas ficariam errados. **Fix:** o webhook lê `metadata.coupon` (que `order.js` já envia) e, quando é `FUNDADOR` no `plano:gold`, grava `notes='gold:anual:fundador'` (mesmo formato do cartão). Validado por teste de lógica. Reaproveita `FOUNDER_COUPON`/`FOUNDER_PLAN` de `lib/founder.js`.
- [ ] **Cupom de fundador não-atômico**: pode passar de 100 vagas sob concorrência (`lib/founder.js`). (Distinto do item acima: aqui é a janela de corrida entre contar e gravar; a contagem em si já inclui PIX/boleto.)
- [x] **Checkout — checagem de origem (2026-06-15, #301):** `api/checkout/order.js` e `subscribe.js` agora validam Origin/Referer pelo hostname (igual `api/ai.js`) — bloqueia abuso externo dos endpoints que criam cobranças LIVE. Header ausente passa (clientes não-browser). Não exige sessão (não quebra checkout de quem não está logado).
- [ ] **Passthrough de erro upstream** (`api/ai.js`, checkout) e **log de comprimento de chave Memed** (`api/memed/token.js`): limpar pós-homologação.
- [x] ~~**Advisors Supabase (performance)**~~ **FEITO (2026-08-03):** 15 WARN → **0**. RLS initplan em 13 policies (`auth.uid()`/`auth.jwt()` envoltos em `(select …)`), 2 policies duplicadas (as de escrita eram `FOR ALL` e o ramo SELECT era redundante — separadas em INSERT/UPDATE/DELETE) e a FK sem índice. **Verificado com fotografia antes/depois:** 24 comparações de leitura por papel, 0 divergências, + 6 casos de escrita. Ver [[Decisões]].
  - **Sobram 4 INFO, de propósito:** 3 tabelas de backup sem PK (são fotografias; apagar backup é decisão sua) e a estratégia de conexões do Auth (ajuste de painel, ligado ao tamanho da instância).
  - ⚠️ **Ficou uma lição cara:** `revoke execute … from anon, authenticated` **não revoga nada** — função nasce com EXECUTE para **PUBLIC**, e os papéis herdam dele. Tem de ser `from public`. Eu abri um buraco assim nas RPCs da newsletter no mesmo dia; fechado e conferido por `has_function_privilege`. Os WARN de `SECURITY DEFINER` chamáveis por anon/authenticated são **por design** (checagem interna). `endodirect_state_backup` RLS sem policy = trancado (só service_role) — OK.
- [ ] **OSCE lazy = NÃO REAPLICAR (quebra navegador real — 2 apagões) ⚠️:** tentei reaplicar a geração passo-a-passo (lazy) duas vezes (#337/#338 e de novo no #345). **Ambas derrubaram TODA a interatividade da plataforma em navegador real** (nenhum botão, não loga) — apagão. Revertido nos #342 e #346 (`index.html` ao estado estável `b9936dc` = #334 + sidebar). **Crítico:** `ci-validate` (parse) E o teste de sandbox `vm` (rodar todos os `<script>` inline) **PASSARAM as duas vezes** e mesmo assim quebrou em produção → meu ferramental aqui **não detecta** o que derruba o navegador real desse `index.html` gigante. Mecanismo exato desconhecido (as mudanças do lazy são só defs de função/`var` no body, que não deveriam lançar no load). **O OSCE fica na forma de geração única** (estável; casos ricos podem dar lentidão/504, mas não derruba a plataforma). **NUNCA reaplicar o lazy** sem testar o **deploy de PREVIEW da Vercel do PR em navegador real ANTES de mergear** — esse é o único processo seguro p/ mudança de JS no frontend (mudança simples de CSS pode ir direto). `api/ai.js maxDuration=60` e `vercel.json functions` ficaram (não afetam UI).
- [ ] **Código morto** (`index.html`): `persistAdm` definido 2×; handlers do antigo editor de mapas (textarea) sem uso. Limpeza cosmética.

## Lado do usuário (fora do código)
- [ ] **Publicar Diretrizes:** flipar `DIRETRIZES_PUBLICADO=true` no `index.html` quando a curadoria estiver pronta. Hoje os alunos veem "Em breve" (e a **janela de Novidades** no login anuncia Diretrizes como **"EM BREVE"** — #430). Ver [[Arquitetura]].
- [ ] **Revisão clínica dos flashcards:** ~180 flashcards da biblioteca de membro foram gerados por IA — médico deve revisar antes/depois do lançamento.
- [ ] **Conta de teste `memed.teste@endodirect.com.br`:** ainda conta como aluno no Analytics (necessária p/ a homologação Memed via `MEMED_ALLOW`). Remover quando a Memed sair de homologação.
- [x] **Limpeza de contas de teste no Analytics (2026-06-14):** removidas 5 contas (`dudukamura@`, `rgmedicaltda@`, `gabysfernandes@`, `eduardo.teste@`, `teste@`) de `auth.users` + `endodirect_app_state`/`acessos`/`devices`/`assinaturas` (nenhuma tinha assinatura paga). "Alunos cadastrados" caiu de 11 → 6. A contagem vem da RPC `endodirect_admin_overview` (`role='aluno'` em `endodirect_app_state`).
- [x] **Webhook pagar.me — 401 RESOLVIDO (2026-06-11).** Diagnóstico (logs `[whdbg]`): o usuário batia, mas a senha enviada pelo webhook tinha um caractere "fantasma" (15 chars vs 14/12 no Vercel) e **as edições no painel do pagar.me não persistiam** — ele seguia mandando a senha original. **Fix em duas frentes:** (1) **código** — `verifyAuth` agora normaliza Usuário/Senha para **só ASCII visível** (`/[^!-~]/g`) antes de comparar com `timingSafeEqual` (#192→#194); fica imune a espaço/zero-width/BOM colado no painel; (2) **operação** — webhook **recriado do zero** com Usuário `endodirect` / Senha `endohook2026` (digitada na criação) e `PAGARME_WEBHOOK_BASIC_PASS=endohook2026` no Vercel. Validado ponta a ponta: **PIX real** liberou `plano:standard` (active) e o webhook respondeu **200**. Diagnóstico removido após confirmar. Ver [[Pagamentos pagar.me]].
- [x] **PIX × duração do acesso — OK (2026-06-11).** O PIX da conta de teste cobrou **R$540,00** (= preço anual Standard, 12× R$45) e liberou **1 ano** (`tipo: avulso`, `ENDODIRECT_AVULSO_DIAS=365`). Duração e preço **batem** — PIX é sempre pagamento único anual (não há PIX recorrente). Sem ajuste necessário.
- [x] **Checkout PIX/boleto libera sozinho (2026-06-11).** Após gerar a cobrança, o front faz polling do estado remoto a cada 5s (`ckStartAutoVerify`) e entra na plataforma automaticamente assim que o webhook provisiona — sem precisar clicar em "Já paguei — verificar" (o botão segue como fallback). Para ao liberar, ao fechar o checkout, ou após ~5 min.
- [x] **pagar.me — validação LIVE (2026-06-11):** compra real (cartão, Gold mensal) liberou acesso ✅. Bug achado: tela R$99 × cobrança R$70 (defaults divergentes) — **corrigido** (#185). Premium removido (#186). Estorno/revogação dependem do webhook (acima); acesso de teste da Gabriella revogado manualmente.
- [x] **"Site fora do ar" no Wi-Fi — falso alarme, era cache de DNS local (2026-06-12).** Sintoma: abria no 5G mas não no Wi-Fi de casa. Diagnóstico: site **sempre esteve no ar** (DNS apex `216.198.79.1` ✅ e www `64.29.17.1` ✅ resolvendo globalmente; HTTPS 200 servindo o `index.html` completo; deploy #234 READY). O Wi-Fi/roteador segurava em **cache o IP antigo** da Vercel (`76.76.21.21`), trocado dias antes no Registro.br. **Resolução:** `ipconfig /flushdns` no PC limpou o cache e o site abriu. Não afeta usuários novos (cache só em quem já tinha acessado o IP velho); expira sozinho pelo TTL. Registros A do apex e CNAME do www **não foram afetados** pela edição de DNS do e-mail.
- [x] **Domínio apex (`endodirect.com.br`):** resolvido em 2026-06-11. O registro A do apex no Registro.br foi trocado do IP antigo da Vercel (`76.76.21.21`) para o novo (`216.198.79.1`); a Vercel passou a "Valid Configuration" e o apex faz **307 → `www`**. (Auth já estava blindado pelo `www` no código, #183.)
- [x] **Supabase (URL Configuration) — OK (2026-06-11).** Site URL = `https://www.endodirect.com.br`; Redirect URLs com curinga: `https://www.endodirect.com.br/**` e `https://endodirect.com.br/**`. Antes estavam sem o `/**`, então `redirect_to` com caminho/parâmetro (ex.: `/?reset=1`) não casava e caía no fallback da Site URL (perdendo o `?reset=1`). Corrigido.
- [ ] **Memed — código PRONTO, trava no lado da Memed em homologação (401 → 503) (2026-06-12).** Integração 100% implementada e *gated* (backend `api/memed/token.js` + front no Consultório; payload `board{}`, `Content-Type: application/json`, `data_nascimento` DD/MM/YYYY, evento `prescricaoImpressa`). Chaves de **homologação** (fixas da doc) setadas na Vercel e **confirmadas corretas** (`api=iJGi..mYCm`, `sec=Xe8M..5nmL`, 56/56). A Memed respondeu primeiro **HTTP 401 "Código de acesso inválido"** e depois **HTTP 503** (Service Unavailable) — **ambos lado Memed** (ativação do parceiro / ambiente instável), confirmado pelos logs `[memed-resp]`; não é o código, as chaves nem o formato da requisição. O front agora trata **5xx** com mensagem amigável ("Memed temporariamente indisponível. Tente novamente em instantes.", #236). Travada por `MEMED_ALLOW=memed.teste@endodirect.com.br` (só a conta de teste vê a Memed; médicos reais ficam no receituário próprio) — **não bloqueia o lançamento**. **Pendente do usuário:** abrir chamado no suporte da Memed (citar o 401/503 + timestamp do log); preencher o formulário de Parceiros (WEBPKI = **Não**; URL `https://www.endodirect.com.br`; login de teste **memed.teste@** já com Gold). Quando resolver: trocar p/ chaves de produção + remover `MEMED_ALLOW`, e **remover os logs de diagnóstico** (`[memed-dbg]`/`[memed-resp]`). Ver [[Integrações]].
  - **ATUALIZAÇÃO 2026-06-17 — chaves de PRODUÇÃO também dão 401 (ativação do parceiro ainda pendente):** o usuário gerou as chaves reais no `landing-pages.memed.com.br/partners-key-generator`, trocou na Vercel e redeployou. Teste real (conta `memed.teste@`, Consultório, 17/06 14:09 UTC) → Memed devolveu de novo **HTTP 401 "Código de acesso inválido"**. **Nosso lado 100% confirmado pelos logs:** `keyLen=64 secLen=64` (= as chaves reais do print, 64 chars cada, sem espaço; homologação era 56/55 → confirma que as NOVAS entraram), `base=https://integrations.api.memed.com.br` (produção), redeploy `dpl_8o59…` de 13:31 UTC pegou as vars, payload JSON:API no formato correto. Ou seja, **o 401 é autenticação/ativação do lado da Memed** — não o nosso código/chaves/base. Gerado um **esboço de e-mail** p/ o suporte da Memed (perguntar: as chaves do gerador são de produção? conta de parceiro ativada p/ produção? base URL correta?; citar 401 + timestamp 14:09 UTC). **MEMED_ALLOW segue só `memed.teste@` — NÃO remover até a Memed confirmar a ativação** (senão todos os médicos Gold batem no mesmo 401). Obs.: a senha do `memed.teste@` foi redefinida via Supabase (último acesso real era 12/06 = meu teste; Memed não usava no dia a dia) — o valor NÃO fica no repo, está no chat/Supabase.
- [x] **E-mail de suporte — `contato@endodirect.com.br` (2026-06-11).** Exibido na plataforma (Suporte do aluno + admin) e no rodapé da landing, como `mailto:` clicável (#232). Caixa criada e ativa no **Zoho Mail** (plano free); DNS no Registro.br: MX (`mx/mx2/mx3.zoho.com`), SPF (`include:zoho.com`) e TXT de verificação adicionados. **DKIM** (`zmail._domainkey`) adicionado e Zoho verificou todos os registros (MX+SPF+DKIM). Falta apenas um teste de envio/recebimento. Os registros do Resend (`send.`) e Supabase (`auth.`) seguem intactos.
- [x] **Supabase — proteção de senha vazada (HaveIBeenPwned) — ATIVADA (2026-06-12).** Ligada em **Authentication → Sign In / Providers → Email → "Prevent use of leaked passwords"** (o botão "Configure in email provider" da aba *Attack Protection* leva até lá). Captcha (hCaptcha) já estava ativo. Scan de segurança de 2026-06-11 também **corrigiu** o RLS exposto de `endodirect_state_backup` (✅, RLS habilitado); funções `SECURITY DEFINER` chamáveis por anon/usuário são **por design** (têm checagem interna via `auth.uid()`). Bucket público `endodirect-assets`: listagem restrita aos admins (ver Concluídas).
- [x] **Newsletter:** Eduardo e Bruno **confirmaram o recebimento** (2026-06-11). O fix do `globalServerKeys` (#166) resolveu a perda do `newsletter_extra`. Ver [[Newsletter e Radar]].
- [x] **Supabase (e-mails de auth):** Confirm email **ON** + **Custom SMTP via Resend** (remetente `Endodirect <nao-responda@endodirect.com.br>`) + **templates branded PT** (Confirm sign up / Reset password). Validado por teste em 2026-06-11: e-mail chega do domínio próprio, com visual do Endodirect. Fontes em `supabase/email-templates/`. Ver [[Integrações]].

## App nativo (iOS/Android)
- [x] **PWA instalável (2026-06-14):** `manifest.webmanifest` + `sw.js` (network-first) + `icons/`. Site vira "instalável" na tela inicial (Android/desktop; iOS com limitações). Ver [[Arquitetura]].
- [ ] **App nas lojas via Capacitor (pendente):** empacotar a SPA em iOS/Android. Depende do usuário: contas **Apple Developer** (US$99/ano) e **Google Play** (US$25); **build/assinatura** exige Mac+Xcode ou CI (EAS/Codemagic/Appflow) — não dá para gerar o `.ipa`/`.aab` no sandbox. **Bloqueio de produto:** regra de **IAP da Apple** (até 30%) para conteúdo digital — definir estratégia (assinatura feita no site, app só consome) antes de submeter. Eu consigo: scaffolding do Capacitor, ícones/splash, deep links e a documentação de build/submissão.

## Lado do código / curadoria
- [ ] Revisar **Grupo 2** — 29 gabaritos ambíguos (`gabaritos-suspeitos.md`). Ver [[Banco de Questões]].
- [x] **Decisões de acesso (varredura 2026-06-12) — implementadas:**
  - **[FEITO #243] Chat IA + geração por IA agora exigem `plano`** (`chat:'plano'` em `PANEL_SCOPE`; `blockIfDegustacao()` passou a checar `hasScope('plano')`). Fecha a brecha do comprador de curso avulso. Degustação (trial 3x) e plano inalterados; 0 usuários "só curso" hoje.
  - **[FEITO #242] Webhook pagar.me fail-closed** (`auth!==true` rejeita; em prod não muda nada).
  - **[PARCIAL #242] `/api/ai`** ganhou **checagem de origem** (barra abuso direto). **Auth por sessão Supabase: SEGURADA** — é mudança no caminho crítico de IA (risco de derrubar IA p/ todos se o token falhar) + quebra contas demo locais (sem sessão). Recomendado fazer pós-lançamento com teste. Reforço alternativo: `NCBI_API_KEY`/rate-limit.
- [ ] **Remover diagnósticos temporários:** `[radar-dbg]` (lib/radar.js) — **REMOVIDO em 2026-06-12 (#247)**, Mural confirmado funcionando. Faltam `[memed-dbg]`/`[memed-resp]` (api/memed/token.js) — manter até a Memed resolver o 401/503.
- [ ] **NCBI API key (opcional, reforço do radar):** gerar em ncbi.nlm.nih.gov → Account settings → API Key Management; setar `NCBI_API_KEY` no Vercel (Settings → Environment Variables, Production) + redeploy. O código já lê a env (troca o pacing do PubMed de 380ms p/ 130ms). Sem ela funciona com o pacing atual.

## Concluídas recentes
- [x] **Varredura completa: segurança, persistência e UX (2026-06-13, #274).** Segunda varredura minuciosa de ponta a ponta após o pacote de Diretrizes. Reforços de `/api/*`: `api/ai.js` valida origem **por hostname** (bloqueia `endodirect.com.br.evil.com`), allowlist de `mediaType` e `prompt` até 200k; `api/podcast-feed.js` com guarda anti-SSRF (resolve DNS e bloqueia IPs privados, cap de 5MB); logs de checkout/Memed sem PII. Auth/sessão, navegação, sync de estado e webhooks (fail-closed) verificados limpos. Corridas conhecidas (cupom de fundador, radar) anotadas como deferidas (decisão de negócio / risco de migração).
- [x] **Mural/radar RESOLVIDO de ponta a ponta (2026-06-12, #242).** Sintoma: Mural não atualizava + "aparece e some". Foram **4 causas** empilhadas, todas corrigidas: (1) save do admin sobrescrevia `radar_avisos` → **gatilho no banco** `endodirect_global_preserve_server_keys` (só service_role escreve); (2) **newsletter** reescrevia o payload inteiro com snapshot velho → re-read antes de gravar (#241); (3) runs concorrentes do radar → relê antes de salvar (#239); (4) **a real**: `[radar-dbg] pubmed=0` — sem `api_key` da NCBI o PubMed dava **429** em todas as ~10 buscas sequenciais → 0 artigos. **Fix (#242):** PubMed com **pacing + retry/backoff + tool/email/api_key** (`lib/radar.js`). Validado: `allIds=113`, **64 itens** no Mural (era 34), mais novo de hoje, +30 adicionados e **persistiram**. **Opcional:** setar `NCBI_API_KEY` no Vercel (sobe limite p/ ~10 req/s). Lembrar de **remover `[radar-dbg]`** depois.
- [x] **Varredura completa da plataforma (2026-06-12, #241 + gatilho no banco).** 4 auditorias paralelas + verificação no banco. Bugs reais corrigidos: **(1) [crítico] Mural revertia** — `sendDailyNewsletter` reescrevia o payload INTEIRO a partir de um snapshot velho (durante o envio Resend), apagando `radar_avisos` do cron (write service_role, furava o gatilho); agora relê o estado fresco e só toca `newsletter_sent`/`newsletter`. **(2) [alto] vazamento de dados entre contas** no `doLogin`: navegador de outra conta sem perfil salvo não limpava o estado local → flashcards/notas/questões vazavam e eram salvos no remoto da nova conta; agora `clearLocalUserData()` sempre. **(3) [médio] médico caía no Dashboard escondido** (degustação pós-7d) → `homePanel()` cai em painel visível. **(4) [baixo] unsubscribe** agora constant-time. Defesas no banco: **gatilho `endodirect_global_preserve_server_keys`** (bloqueia o app de reverter `radar_avisos`/`newsletter_*`; só service_role escreve), `search_path` fixado; **radar relê antes de salvar** (corrida entre runs). Verificado OK: RPC `endodirect_acessos_ativos` filtra `status='active'` (estorno/cancelamento revoga de fato); webhook recupera tier pelo texto do item; advisors de performance = só otimização de escala. Itens de política em aberto na seção acima. **Mural:** `fresh=0` nos refresh manuais provavelmente é estado normal (PubMed 30d sem novidades) — diagnóstico `[radar-dbg]` no ar p/ confirmar.
- [x] **Bucket de assets — listagem restrita aos admins (2026-06-12).** Aviso de segurança do Supabase (`public_bucket_allows_listing`): a política `endodirect_assets_public_read` deixava qualquer um *enumerar* os arquivos do bucket público. Trocada por `endodirect_assets_admin_list` (SELECT só p/ admins). A exibição das imagens usa `getPublicUrl` (servida via `/object/public/`, sem RLS), então **nada muda no site**. Aplicado via migração + `supabase-storage-setup.sql` atualizado.
- [x] **Perfil do aluno — card de Assinatura (2026-06-12).** Na aba Perfil, card "💳 Assinatura" com o plano atual (Degustação/Standard/Gold), **Fazer upgrade** (abre os pacotes via `showAssineScreen`) e **Cancelar assinatura** (e-mail pré-preenchido p/ `contato@endodirect.com.br`; acesso mantido até o fim do período pago, conforme os Termos). **Gold não oferece upgrade** (botão E texto omitidos — é o topo da escada, #237); Standard mostra upgrade; cancelar só aparece com plano ativo.
- [x] **Tela de início e menu por perfil (2026-06-12).** Médicos (residente/endocrinologista/outros): o **Dashboard sai do menu** e o **Mural assume o topo** da seção Estudo, no lugar dele (`applyProfileMenuLayout()`, #237); além disso abrem direto no **Mural** (`homePanel()` + `maybeLandMedicoHome()`, reforça no pós-hydrate sem atrapalhar quem já navegou). Estudantes mantêm o **Dashboard** no topo e o **Mural** em "Pessoal". Cai pro Dashboard se o Mural não estiver visível (ex.: degustação após os 7 dias).
- [x] **Memed — mensagem amigável em erro de servidor (2026-06-12).** Quando a Memed retorna **5xx** (ex.: o HTTP 503 da homologação), o Consultório mostra "Memed temporariamente indisponível. Tente novamente em instantes." em vez do código HTTP cru (#236). Erros **4xx** (validação) seguem com o detalhe específico; log `[memed-resp]` intacto.
- [x] **Onboarding/UI (2026-06-11):** perfil "Estudante de medicina" (instituição + ano → badge `USP · 5º ano`); campos por perfil (médicos: residência + CRM; estudante: graduação + ano); janela aparece antes do dashboard; renomes do menu (Consultório, OSCE, Revisão, Prescrição Simulada); banner de degustação repaginado. Cache de borda corrigido (`vercel.json`: `index.html` sempre revalida, #201) — alunos recebem updates sem hard-refresh.
- [x] **Degustação (2026-06-11):** liberados Calculadoras, Podcasts e Cronograma; "Gerar com IA" travado em Flashcards/Mapas (só visualizar os atuais); Simulado limitado à fonte Provas (IA/Misto bloqueados).
- [x] pagar.me TEST → LIVE (chaves + webhook) — 2026-06-10.
- [x] Health check reconhece formato de chave LIVE do pagar.me (#169).
- [x] Newsletter por subespecialidade (#168).
- [x] Calculadoras TmP/GFR + escore-z estatura/idade (#170).
- [x] Exportação Obsidian no painel do aluno — **removida** (#172); base de conhecimento migrada para este cofre.
