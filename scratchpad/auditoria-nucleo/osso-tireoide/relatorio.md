# Auditoria do núcleo — lote OSTEOMETABOLISMO / TIREOIDE / ENDOCRINOPATIAS

Entradas #3, #12, #13, #31, #32, #44, #45, #46, #58, #68, #69, #78 (12 entradas, 16.242 chars).
Prova: 18 extratos verbatim do acervo + leitura direta dos textos-fonte. Notas do cofre auditadas
contra os mesmos extratos.

Achados em ordem de gravidade dentro de cada entrada.

---

## ENTRADA #13 — Doença de Graves pediátrica (ETA 2022)

    SEVERIDADE: GRAVE
    O QUE O NÚCLEO DIZ: "Doença de Graves pediátrica (ETA 2022): ... antitireoidiano de 1ª linha
      = carbimazol ou metimazol, NUNCA PTU (falência hepática) ... com metimazol o risco é
      dose-dependente, sobretudo acima de 40 mg/dia ... tempestade tireoidiana — ⚠️ A ORDEM
      IMPORTA: TIONAMIDA PRIMEIRO (metimazol 20–30 mg VO 6/6 h ou PTU 200–400 mg VO 6–8/8 h,
      que ainda reduz a conversão periférica de T4 em T3)"
    O QUE A FONTE DIZ: "methimazole 20-30 mg po q6 h propylthiouracil 200-400 mg po q6-8 h" e,
      no mesmo capítulo, "the dosing for mmi is 80 to 120 mg daily in divided doses of 20-30 mg
      every 6 h"; e "when mmi is the culprit, agranulocytosis tends to be dose-related,
      especially at doses more than 40 mg daily"
    ONDE: extratos/1R37X3uQn1reXfmyHWVPEfcelgeKSF9PS.json fatos 54, 62 e 71.
      ⚠️ MEDIÇÃO NO TEXTO-FONTE INTEIRO (textos/1R37X3uQn1reXfmyHWVPEfcelgeKSF9PS.txt,
      57.513 chars): "pediatr" 0, "paediatr" 0, "children" 0, "child" 0, "infant" 0,
      "adolescen" 0, "juvenile" 0. O capítulo é de adulto, de ponta a ponta, e dosa em mg
      fixos — a única dose por peso do capítulo é a do esmolol.
    CONDUTA QUE SAI DISSO: numa entrada rotulada "pediátrica", o médico dá a uma criança
      metimazol 80–120 mg/dia — dose de adulto, 2 a 3× o teto de 40 mg/dia que a própria
      entrada nomeia como limiar de agranulocitose dose-dependente — e/ou dá PTU 200–400 mg
      6–8/8 h ao mesmo paciente a quem a linha anterior da mesma entrada diz "NUNCA PTU".
    CORREÇÃO SUGERIDA: separar o parágrafo da tempestade e marcá-lo como conduta de ADULTO:
      "tempestade tireoidiana (doses de adulto — na criança, dose por peso, que esta fonte não
      fornece): metimazol 20–30 mg VO 6/6 h (80–120 mg/dia) ou PTU 200–400 mg VO 6–8/8 h;
      ⚠️ acima de 40 mg/dia de metimazol o risco de agranulocitose é dose-dependente. Na
      criança, a ressalva 'NUNCA PTU' de 1ª linha não se transporta automaticamente para a
      tempestade — decidir com quem tem a diretriz pediátrica em mãos."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "e SÓ ENTÃO o iodo, com pelo menos 1 h de intervalo ...; somam-se
      glicocorticoide e betabloqueador."
    O QUE A FONTE DIZ: "sskid 5 drops po q6 h"; "lugol's solutiond 4-8 drops po q6-8 h";
      "propranolol 60-80 mg po q4 h or 80-120 mg po q6 h or 0.5-1 mg iv over 10-15 min";
      "steroidsc hydrocortisone 100 mg iv q8 h treats presumed relative adrenal insufficiency";
      "acetaminophen 325-650 mg po/pr q4-6 h prn avoid salicylates (due to displacement of t4
      from binding globulin, increasing free t4)"
    ONDE: extratos/1R37X3uQn1reXfmyHWVPEfcelgeKSF9PS.json fatos 55, 56, 84, 95, 115.
    CONDUTA QUE SAI DISSO: diante de um paciente grave, a entrada dá a ORDEM certa e nenhuma
      dose do que vem depois da tionamida — e não avisa que o salicilato desloca T4 e AUMENTA
      o T4 livre, justamente no paciente febril em que ele seria a primeira escolha.
    CORREÇÃO SUGERIDA: acrescentar "iodo: SSKI 5 gotas VO 6/6 h ou Lugol 4–8 gotas VO 6–8/8 h,
      ≥1 h APÓS a tionamida; hidrocortisona 100 mg IV 8/8 h (cobre a insuficiência adrenal
      relativa presumida); propranolol 60–80 mg VO 4/4 h (ou 0,5–1 mg IV em 10–15 min);
      antitérmico = paracetamol, ⚠️ EVITAR salicilato (desloca o T4 e eleva o T4 livre)."

---

## ENTRADA #3 — Tireoide na gestação (ATA 2026)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "em uso de levotiroxina, dosar TSH ao confirmar a gravidez e ~6 semanas
      pós-parto/após ajuste"
    O QUE A FONTE DIZ: "moderate conditional in women treated with levothyroxine, tsh testing
      may be performed upon pregnancy confirmation, approximately every 4 weeks during the
      first half of pregnancy, at least once in the third trimester, and 4-6 weeks after any
      dose adjustment."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 44 (Recomendações Tabela 2).
    CONDUTA QUE SAI DISSO: a gestante em levotiroxina tem a dose aumentada 25% ao teste
      positivo e não faz mais nenhum TSH até 6 semanas depois do parto — exatamente na janela
      em que a necessidade sobe 25% até a 12ª semana e 50% até a 20ª. Erra para os dois lados:
      sub e sobretratamento, sem detecção.
    CORREÇÃO SUGERIDA: "em uso de levotiroxina, dosar TSH ao confirmar a gravidez, a cada ~4
      semanas na PRIMEIRA METADE da gestação, pelo menos UMA VEZ no 3º trimestre, 4–6 semanas
      após qualquer ajuste de dose, e ~6 semanas pós-parto."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "HIPOTIREOIDISMO manifesto: tratar (LT4 monoterapia; suspender
      T3/dessecada; alvo pré-concepcional 0,5–2,5)"
    O QUE A FONTE DIZ: "low conditional for new onset maternal overt hypothyroidism during
      pregnancy with a tsh less than 6 mu/l, confirmatory testing may be performed within 3
      weeks to verify an indication for levothyroxine treatment." e "moderate strong new onset
      maternal overt hypothyroidism during pregnancy with a tsh equal or above 6 mu/l, or overt
      hypothyroidism that persists after retesting should be treated with levothyroxine."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fatos 122 e 123; contexto no 121
      ("at least half of these thyroid function test abnormalities spontaneously normalize
      within a few weeks, suggesting that remeasurement can reduce overdiagnosis,
      overtreatment, and associated harms").
    CONDUTA QUE SAI DISSO: a entrada marca a mudança 2026 "mais conservadora" só para o
      SUBCLÍNICO e deixa o manifesto de início gestacional como "tratar" incondicional — o
      médico inicia levotiroxina em metade de gestantes cuja alteração normalizaria sozinha
      em poucas semanas. Erra para o lado de tratar mais.
    CORREÇÃO SUGERIDA: "HIPOTIREOIDISMO manifesto: de início NA GESTAÇÃO com TSH <6 mU/L →
      repetir o exame em até 3 semanas antes de decidir (metade normaliza); TSH ≥6 mU/L, ou
      persistente na repetição → TRATAR (evidência moderada, recomendação forte). Já
      diagnosticado antes da gestação → manter/tratar. LT4 monoterapia; suspender
      T3/dessecada; alvo pré-concepcional 0,5–2,5."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "a dose sobe ~25% na 12ª semana e ~50% na 20ª, então aumentar ~25%
      (≈2 doses extras/semana) já ao confirmar a gravidez"
    O QUE A FONTE DIZ: "if all women undergo a standardized dose increase, there is a slightly
      higher risk of overtreatment in women with a prepregnancy tsh <1.5 mu/l, women with a
      prepregnancy lt4 dose >100 mcg/day, and women who increase the weekly dose by two
      tablets. therefore, the preconception tsh and lt4 dose should be taken into account when
      considering a dose increase and/or the quantity of that increase."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 131; Box 3 no fato 128
      ("however, overtreatment with this approach is possible"). Dano medido do sobretratamento
      nos fatos 153 e 289 ("levothyroxine overtreatment in pregnancy increases the risk of
      pregnancy-induced hypertension, preeclampsia, preterm delivery, and fetal complications").
    CONDUTA QUE SAI DISSO: o esquema que a entrada oferece como operacionalização ("≈2 doses
      extras/semana") é, na fonte, um dos TRÊS fatores de sobretratamento — e a entrada o
      aplica a todas, sem olhar o TSH e a dose pré-concepcionais.
    CORREÇÃO SUGERIDA: "...então aumentar ~25% já ao confirmar a gravidez — ⚠️ ajustando o
      quanto pelo TSH e pela dose PRÉ-CONCEPCIONAIS: TSH pré-gestacional <1,5 mU/L, dose
      >100 µg/dia ou o esquema de '2 comprimidos extras por semana' são os três cenários de
      maior risco de sobretratamento."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "dosar TRAb no 1º trimestre na Graves — se >3× o limite superior,
      repetir e monitorar tireoide fetal/neonatal (TRAb cruza a placenta)"
    O QUE A FONTE DIZ: "always perform fetal ultrasound monitoring starting at 18-20 weeks if
      (1) atds are used, or (2) when the trab/tsi is above 3x uln"; e "fetal ultrasound
      monitoring should be performed monthly starting at 18-20 weeks gestation if the mother
      uses atds during pregnancy"
    ONDE: textos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.txt, busca "18-20 weeks" (fluxograma de TSH
      baixo e Tabela 4); extrato fato 245 para o marco dos 30–34 semanas.
    CONDUTA QUE SAI DISSO: a entrada amarra o monitoramento fetal SÓ ao TRAb >3×. A gestante
      em antitireoidiano com TRAb abaixo desse corte fica sem ultrassom fetal, e é justamente
      ela que corre risco de bócio e hipotireoidismo FETAL pelo próprio fármaco.
    CORREÇÃO SUGERIDA: "...monitorar tireoide fetal por ULTRASSOM MENSAL a partir de 18–20
      semanas sempre que (a) a mãe estiver em antitireoidiano OU (b) o TRAb/TSI for >3× o
      limite superior; considerar suspender o antitireoidiano por volta de 30–34 semanas."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "se o antitireoidiano for necessário, PTU (se disponível) ATÉ 16
      SEMANAS" (a entrada trata de gestante E lactante — "IODO 250 µg/dia (gestante e
      lactante)" — e não diz nada do antitireoidiano na lactação)
    O QUE A FONTE DIZ: "mmi is generally preferred over ptu, due to the risk of ptu-associated
      hepatotoxicity and the convenience of once-daily dosing."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 339; doses seguras na lactação
      no fato 337 (CMZ ≤15 mg/dia, MMI ≤20 mg/dia, PTU ≤750 mg/dia, dados mais robustos até
      450 mg/dia).
    CONDUTA QUE SAI DISSO: a puérpera sai da gestação em PTU e continua nele para amamentar,
      quando a própria diretriz inverte a preferência no pós-parto.
    CORREÇÃO SUGERIDA: acrescentar "⚠️ NA LACTAÇÃO A PREFERÊNCIA SE INVERTE: metimazol é
      preferido ao PTU (hepatotoxicidade do PTU; dose única diária) — MMI ≤20 mg/dia,
      carbimazol ≤15 mg/dia, PTU ≤750 mg/dia (dados mais robustos até 450 mg/dia)."

    SEVERIDADE: IMPRECISO
    O QUE O NÚCLEO DIZ: "Rastreamento NÃO universal: por FATORES DE RISCO (história de
      disfunção/cirurgia tireoidiana ou tireoidite pós-parto, TPOAb+, DM1/autoimunidade,
      bócio, infertilidade/perdas gestacionais, radiação cervical, etc.)"
    O QUE A FONTE DIZ: "there is insufficient evidence to recommend routine thyroid function
      testing (universal screening) in women planning pregnancy, in pregnant women, or in
      women during the postpartum period"; a linha do teste por risco é "moderate conditional
      ... it is suggested that tsh testing be offered upon a positive pregnancy test to those
      at increased risk"; e "the risk factors ... are not exhaustive ... will not enable the
      identification of all women with thyroid dysfunction, specifically overt hypothyroidism"
      (detecção de 75–85% do manifesto e 54–60% do subclínico).
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fatos 43, 46, 47, 48 e 54.
    CONDUTA QUE SAI DISSO: a entrada converte "evidência insuficiente para recomendar" em
      proibição e uma sugestão condicional em regra fechada; quem pergunta ouve que rastrear
      além dos fatores de risco está proscrito, e não que a lista deixa passar 15–25% dos
      hipotireoidismos manifestos e deve SUPLEMENTAR o raciocínio clínico.
    CORREÇÃO SUGERIDA: "Rastreamento universal: a ATA 2026 diz que a evidência é INSUFICIENTE
      para recomendá-lo de rotina (não que ele esteja proscrito). O teste por FATORES DE RISCO
      é SUGESTÃO condicional (evidência moderada) — e a lista não é exaustiva: deixa passar
      15–25% dos hipotireoidismos manifestos, e por isso suplementa, não substitui, o
      raciocínio clínico."

---

## ENTRADA #44 — Osteoporose, tratamento guiado por meta (ASBMR/BHOF 2024)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "Em risco MUITO ALTO ou iminente (fratura recente), iniciar por agente
      ANABÓLICO (teriparatida/abaloparatida/romosozumabe) e seguir com antirreabsortivo
      (concorda com o NOGG); reavaliar meta e sequência periodicamente."
    O QUE A FONTE DIZ: "conditional recommendation against romosozumab (uncertain harms with
      increased myocardial infarction, stroke and death) except in patients intolerant of
      other agents" (Tabela 1, risco alto e muito alto) e "adults ≥40 years at moderate
      fracture risk ... conditionally recommend against romosozumab ... due to risk of
      myocardial infarction, stroke or death" (Tabela 2)
    ONDE: extratos/1vRlLOwy4nllXUh_ktvyPiSsHtYxac9Mn.json fatos 31, 33, 50, 52, 59, 62; a
      Tabela 2 do mesmo documento restringe o romosozumabe aos INTOLERANTES no risco alto e
      muito alto (fato 50) e recomenda CONTRA no risco moderado (≥40 e <40 anos) e no
      transplante de órgão sólido (fatos 52, 59, 62).
    CONDUTA QUE SAI DISSO: a ressalva do romosozumabe em glicocorticoide foi escrita na
      entrada #32 e NÃO na #44. Lida sozinha — e é assim que ela chega — a #44 oferece o
      romosozumabe como um dos três anabólicos intercambiáveis de partida, sem uma palavra
      sobre infarto, AVC ou morte e sem apontar para a restrição em GIOP. O paciente em
      corticoide que entra por esta entrada recebe o texto pré-correção.
    CORREÇÃO SUGERIDA: acrescentar ao fim da entrada "⚠️ o romosozumabe NÃO é intercambiável
      com os outros dois anabólicos no paciente em GLICOCORTICOIDE — ver a ressalva da ACR
      2022 na entrada de osteoporose/NOGG (reservado ao intolerante no risco alto e muito
      alto; recomendação contra no risco moderado e no transplante, por infarto do miocárdio,
      AVC ou morte)."

---

## ENTRADA #32 — Osteoporose, prevenção e tratamento (NOGG 2024)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "Terapia SEQUENCIAL obrigatória: quem interrompe denosumabe,
      romosozumabe, teriparatida ou abaloparatida precisa de um antirreabsortivo de
      continuidade, planejado já no início"
    O QUE A FONTE DIZ: "discontinuation of den after two or more doses has been associated with
      rapid bone loss and development of new vertebral compression fractures as soon as 7-9
      months after the last dose. as such, bp therapy is recommended beginning at 6-7 months
      after the last dose of den." e "patients completing a course of den should transition to
      1-2 years of a bp."
    ONDE: extratos/1vRlLOwy4nllXUh_ktvyPiSsHtYxac9Mn.json fatos 71, 73, 74 (e 75: "tratar por
      PELO MENOS 1 ANO parece prudente").
    CONDUTA QUE SAI DISSO: "planejado já no início" não é um prazo. O médico marca o
      bisfosfonato para o retorno seguinte e o paciente entra na janela de 7–9 meses em que a
      fratura vertebral de rebote aparece.
    CORREÇÃO SUGERIDA: "...precisa de um antirreabsortivo de continuidade com PRAZO: após o
      denosumabe, iniciar bisfosfonato ENTRE 6 E 7 MESES da última dose (as fraturas
      vertebrais de rebote começam a aparecer aos 7–9 meses) e mantê-lo por 1–2 anos; após
      teriparatida, abaloparatida ou romosozumabe, transicionar para bisfosfonato (ou
      denosumabe, exceto após romosozumabe, em que a fonte lista só o bisfosfonato)."

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "Demais (alto risco): antirreabsortivo — bisfosfonato oral (alendronato
      ou risedronato) ou zoledronato IV 5 mg/ano (denosumabe como opção)."
    O QUE A FONTE DIZ: "bisphosphonates should generally not be used in patients with an egfr
      < 35 ml/min"; "when egfr is < 35 ml/min, the risk of renal osteodystrophy, including
      adynamic bone disease, osteomalacia, osteitis fibrosa cystica and mixed uremic
      osteodystrophy, is increased"; e o rodapé "use with caution in women who may become
      pregnant" (maior potência e meia-vida mais longa no osso fetal).
    ONDE: extratos/1vRlLOwy4nllXUh_ktvyPiSsHtYxac9Mn.json fatos 39, 40, 41, 36.
    CONDUTA QUE SAI DISSO: zoledronato ou alendronato prescritos ao idoso com eGFR abaixo de
      35 — a faixa em que a doença óssea adinâmica e a osteomalácia são o diagnóstico, e o
      antirreabsortivo é a conduta errada; e bisfosfonato na mulher em idade fértil sem a
      cautela da meia-vida no osso fetal.
    CORREÇÃO SUGERIDA: acrescentar "⚠️ PISO RENAL: bisfosfonato, em geral, NÃO com eGFR <35
      mL/min (risco de osteodistrofia renal — doença óssea adinâmica, osteomalácia, osteíte
      fibrosa cística —, em que o antirreabsortivo é a conduta errada); nessa faixa, avaliar
      CKD-MBD antes e, excluído, denosumabe/PTH-PTHrP/romosozumabe não exigem ajuste de dose.
      ⚠️ mulher que pode engravidar: bisfosfonato com cautela (meia-vida longa no osso fetal);
      denosumabe exige evitar gravidez por 5 meses após a última dose."

---

## ENTRADA #31 — Hiperparatireoidismo primário (5º Workshop 2022)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "T-score ≤ −2,5 em qualquer sítio OU fratura vertebral; ... idade <50
      anos (nesses, usar Z-score, não T-score)"
    O QUE A FONTE DIZ: "Os limiares de escore T NÃO devem ser aplicados a medições obtidas em
      mulheres na PRÉ-menopausa ou em homens com idade INFERIOR a 50 anos: nessas situações
      deve-se relatar o escore Z, que não pode ser usado isoladamente para diagnosticar
      osteoporose. Escore Z igual ou inferior a -2,0 DP é definido como 'abaixo da faixa
      esperada para a idade'" (Manual Brasileiro de Osteoporose, Cap. 7, posições ABRASSO)
    ONDE: extratos/18h31a068whlaON_ELbeGQfzPMILZNrXK.json fato 144 (e 141 para os limiares de T).
      ⚠️ O 5º Workshop Internacional 2022 NÃO está no acervo — o corte numérico de escore Z
      próprio do hiperparatireoidismo não pôde ser conferido.
    CONDUTA QUE SAI DISSO: dois erros na mesma linha. (1) A condição está trocada: quem não
      usa escore T é a mulher PRÉ-MENOPAUSA e o homem <50 — a mulher pós-menopausa de 47 anos
      usa escore T, e pela regra do núcleo perde o critério ósseo de cirurgia. (2) A entrada
      manda usar o escore Z e não dá corte nenhum, numa lista em que todos os outros critérios
      são números — o critério fica inaplicável, e nas outras fontes do acervo o corte de Z
      varia com o contexto (≤ −2,0 "abaixo do esperado para a idade" no manual brasileiro;
      < −3 na ACR 2022 para o adulto <40 anos em corticoide).
    CORREÇÃO SUGERIDA: "T-score ≤ −2,5 em qualquer sítio (coluna, quadril ou rádio 1/3) OU
      fratura vertebral; ⚠️ em MULHER PRÉ-MENOPAUSA e HOMEM <50 anos não se usa escore T e sim
      escore Z — usar o corte de escore Z do 5º Workshop, com o sinal negativo explícito
      (verificar o número na diretriz: não consta do acervo)."

---

## ENTRADA #68 — Distúrbios do sódio e da água

    SEVERIDADE: SÉRIO
    O QUE O NÚCLEO DIZ: "SIAD é euvolêmica, com urina concentrada e Na urinário alto, APÓS
      excluir hipotireoidismo e insuficiência adrenal"
    O QUE A FONTE DIZ: "the urine [na+] is dependent on na+ intake, because na+ balance is
      maintained. consequently, urinary [na+] is usually elevated, but it may be low in
      patients with siad who are ingesting a low-sodium diet."
    ONDE: extratos/hipo-5.json fato 66 (Verbalis, Hyponatremia: Pathophysiology of different
      etiologies, BPRCEM 2026).
    CONDUTA QUE SAI DISSO: o paciente com SIAD que come pouco sal — o cardiopata, o
      hipertenso, o cirrótico orientado a restringir sódio, que é metade do ambulatório — cai
      com Na urinário baixo e é reclassificado como hipovolêmico: recebe salina em vez de
      restrição hídrica, e a hiponatremia piora.
    CORREÇÃO SUGERIDA: "SIAD é euvolêmica, com urina concentrada e Na urinário habitualmente
      alto (≥30 mmol/L) — ⚠️ mas o Na urinário PODE ESTAR BAIXO em quem faz dieta pobre em
      sódio: Na urinário baixo NÃO exclui SIAD. Excluir antes hipotireoidismo GRAVE e
      insuficiência adrenal."

    SEVERIDADE: IMPRECISO
    O QUE O NÚCLEO DIZ: "classificar por volemia + osmolalidade urinária + Na urinário"
    O QUE A FONTE DIZ: "although volume status assessment is routinely performed in clinical
      care, it has low sensitivity and specificity, particularly when distinguishing between
      euvolemia and mild hypovolemia"; e "however, in older adults - because kidneys dilute
      urine less efficiently - a threshold of ≤ 200 mosm/kg may be more appropriate"
    ONDE: extratos/hipo-1.json fatos 37 e 30 (Refardt, hiponatremia no idoso, BPRCEM 2026).
    CONDUTA QUE SAI DISSO: a volemia é posta como primeiro eixo do algoritmo e no idoso —
      onde a hiponatremia é mais prevalente — ela é justamente o eixo menos confiável, e o
      corte de osmolalidade urinária que a entrada usa implicitamente é o do adulto jovem.
    CORREÇÃO SUGERIDA: "classificar por osmolalidade urinária + Na urinário + volemia — ⚠️ a
      avaliação da volemia tem baixa sensibilidade e especificidade, sobretudo para separar
      euvolemia de hipovolemia leve; no IDOSO, o rim dilui menos e o limiar de osmolalidade
      urinária de ≤200 mOsm/kg pode ser mais apropriado que o clássico ≤100."

    SEVERIDADE: IMPRECISO
    O QUE O NÚCLEO DIZ: "(1º) copeptina BASAL >21,4 pmol/L, sem estímulo nenhum, já fecha
      RESISTÊNCIA À AVP (antigo DI nefrogênico) — pare aqui, não estimule."
    O QUE A FONTE DIZ: "a baseline unstimulated copeptin has been suggested as the initial
      first step in the approach to the patient with hypotonic polyuria, with a plasma
      copeptin >21.4 pmol/l diagnostic of ndi. this makes an assumption that copeptin assays
      will perform in a similar fashion in every institution. as <5% of newly referred
      patients have ndi in our practice, an unstimulated copeptin measurement will be truly
      valuable in a minority of patients"
    ONDE: extratos/1w-2-UmiscpCLQmoRodNaQtONVgg_gjuL.json fato 95 (Tomkins et al., JCEM 2022);
      o mesmo extrato, fato 73, põe a mesma ressalva no teste da arginina ("this test needs
      validation, and each center would have to establish their own assay cut offs").
    CONDUTA QUE SAI DISSO: a ordem de leitura que a entrada fixou está certa e é o conserto
      que salvou o paciente com resistência à AVP; o que sobra é a força do "pare aqui" —
      a fonte apresenta o basal como sugestão dependente do ensaio local e útil numa minoria,
      e a entrada o transforma em regra de parada absoluta.
    CORREÇÃO SUGERIDA: "(1º) copeptina BASAL >21,4 pmol/L, sem estímulo, é fortemente
      sugestiva de RESISTÊNCIA À AVP e dispensa o estímulo — ⚠️ o corte pressupõe desempenho
      equivalente do ensaio de copeptina no seu laboratório e fecha o diagnóstico numa
      minoria dos casos; se não bater com a clínica, siga para o estímulo. (Idem para o corte
      de 3,5 pmol/L do teste da arginina, que a fonte declara ainda carecer de validação e de
      cortes locais.)"

---

## ENTRADA #69 — Doença ocular da tireoide (orbitopatia de Graves)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "Medidas gerais: cessar tabagismo, controlar a função tireoidiana,
      selênio na doença leve."
    O QUE A FONTE DIZ: "¹³¹i should not be used in active graves' orbitopathy, during
      pregnancy, and during breastfeeding"; e "thyroidectomy or antithyroid drugs are
      associated with a decline in tsh-receptor antibodies, but a sustained increase in these
      antibodies is observed after ¹³¹i, putting the patient at risk of developing—or
      worsening of—graves' orbitopathy"
    ONDE: extratos/1sJaq5DeVVTIqEXBi5A5um6F0jrGVUsv3.json fatos 57 e 66 (Lancet Diabetes &
      Endocrinol 2023).
    CONDUTA QUE SAI DISSO: "controlar a função tireoidiana" não diz COMO, e o modo que piora
      o olho é exatamente um dos três disponíveis. O paciente com orbitopatia ativa é mandado
      para radioiodo — o TRAb sobe e a orbitopatia piora.
    CORREÇÃO SUGERIDA: "Medidas gerais: cessar tabagismo; restaurar e manter o eutireoidismo —
      ⚠️ o RADIOIODO NÃO deve ser usado na orbitopatia ATIVA (o TRAb sobe de forma sustentada
      após o ¹³¹I e pode desencadear ou piorar a doença ocular, ao contrário da tireoidectomia
      e do antitireoidiano, que reduzem o TRAb); selênio na doença leve."

---

## ENTRADA #58 — Iodo na gestação no Brasil (SBEM 2025)

    SEVERIDADE: OMISSÃO
    O QUE O NÚCLEO DIZ: "suplementar de forma criteriosa, evitando excesso (atenção a doses
      altas em polivitamínicos/algas)"
    O QUE A FONTE DIZ: "moderate strong sustained excessive dietary iodine intake and dietary
      supplements use exceeding 500 mcg daily should be avoided during pregnancy due to
      concerns for fetal and maternal thyroid dysfunction."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 62 (ATA 2026, Recomendações
      Tabela 3 — evidência moderada, recomendação FORTE). ⚠️ O posicionamento SBEM 2025 que a
      entrada cita NÃO está no acervo; o número vem da ATA 2026, que a própria entrada #3 usa.
    CONDUTA QUE SAI DISSO: a entrada inteira existe para avisar do braço direito da curva em U
      e não dá o único número que torna o aviso acionável — o médico não tem como julgar se o
      polivitamínico da paciente está acima ou abaixo do limite.
    CORREÇÃO SUGERIDA: acrescentar "⚠️ TETO: evitar ingestão dietética excessiva sustentada e
      suplementos ACIMA DE 500 µg/dia na gestação (ATA 2026, recomendação forte) — pelo risco
      de disfunção tireoidiana fetal e materna. Alvo: 250 µg/dia; suplemento de 150 µg/dia."

---

## NOTAS DO COFRE — contradições com o texto-fonte

As três primeiras estão na mesma nota, que se declara "fonte de verdade para tireoide e
gestação no Endodirect (diretriz do painel + geração de conteúdo/IA)". São exatamente os três
pontos que já foram corrigidos NO NÚCLEO e não foram corrigidos NA NOTA.

    NOTA: cofre/Diretrizes Clínicas/Tireoide na Gestação, Preconcepção e Pós-parto (ATA 2026).md
    SEVERIDADE: GRAVE
    O QUE A NOTA DIZ (linha 48): "## Hipotiroxinemia isolada (Tabela 12) — 1º trimestre → NÃO
      tratar. **Após o 1º trimestre → LT4 pode ser considerada** (weak); atenção ao iodo."
    O QUE A FONTE DIZ: "High Strong For maternal isolated hypothyroxinemia diagnosed after the
      first trimester, levothyroxine treatment should not be offered."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 172; verbatim no texto-fonte,
      busca "Table 12" (a citação traz a tabela inteira).
    QUAL LADO A FONTE SUSTENTA: a fonte. A recomendação está INVERTIDA na nota e a força está
      trocada — a nota escreve "weak" onde a diretriz traz o par de MAIOR força e MAIOR
      qualidade daquela tabela (High/Strong). O núcleo (entrada #3) já diz o certo.
    CONDUTA QUE SAI DISSO: levotiroxina oferecida à gestante com hipotiroxinemia isolada de 2º
      ou 3º trimestre — contra recomendação forte de evidência alta, e com o dano medido do
      sobretratamento na gestação.
    CORREÇÃO SUGERIDA: "Hipotiroxinemia isolada (Tabela 12): 1º trimestre → NÃO oferecer LT4
      (baixa, condicional). Após o 1º trimestre → LT4 NÃO DEVE ser oferecida (ALTA, FORTE — a
      recomendação mais firme da tabela). Avaliar ferro e iodo."

    NOTA: a mesma
    SEVERIDADE: SÉRIO
    O QUE A NOTA DIZ (linha 52): "**ATD:** **PTU no 1º trimestre**; após, **metimazol**"
    O QUE A FONTE DIZ: "PTU (if available) until 16 weeks gestation. The choice for a preferred
      ATD after 16 weeks gestation is unknown."
    ONDE: textos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.txt, busca "until 16 weeks";
      extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fatos 219, 220, 221 e 231. A palavra
      "16 semanas" não aparece nenhuma vez na nota.
    QUAL LADO A FONTE SUSTENTA: a fonte. O marco é 16 SEMANAS, não o fim do 1º trimestre, e
      depois dele a diretriz declara a escolha DESCONHECIDA — ausência de recomendação lida
      como recomendação. O núcleo já foi corrigido; a nota não.
    CONDUTA QUE SAI DISSO: troca para metimazol na semana 13 (quatro semanas antes do marco) e
      dupla exposição apresentada como conduta padrão.
    CORREÇÃO SUGERIDA: "ATD: PTU (se disponível) ATÉ 16 SEMANAS; após 16 semanas a ATA 2026
      declara DESCONHECIDA a escolha do antitireoidiano preferido e não recomenda nenhum dos
      dois. Ao confirmar a gravidez, considerar trocar MMI→PTU na razão 1:20."

    NOTA: a mesma
    SEVERIDADE: SÉRIO
    O QUE A NOTA DIZ (linha 17): "Na ausência: **intervalo fixo de TSH 0,1–4,0 mU/L** (ou não
      gestante **−0,4** no inferior e **−0,5** no superior)."
    O QUE A FONTE DIZ: "if a lab and trimester-specific reference interval for tsh is
      unavailable, a tsh reference interval of 0.1-4.0 mu/l can be used during the first and
      second trimesters."
    ONDE: extratos/1SxGKSvCYPwNTmD7oesd6c1qrcOvdEIrc.json fato 24; a regra de subtração é do
      PRIMEIRO trimestre, "followed by a gradual return to the nonpregnant range in the
      subsequent trimesters" (fato 26).
    QUAL LADO A FONTE SUSTENTA: a fonte. Falta a população nos dois atalhos.
    CORREÇÃO SUGERIDA: "Na ausência: intervalo fixo de TSH 0,1–4,0 mU/L ⚠️ SÓ no 1º e no 2º
      trimestres (no 3º, os intervalos de não gestante costumam bastar); a subtração de −0,4
      no inferior e −0,5 no superior é regra de 1º trimestre, com retorno gradual à faixa de
      não gestante depois."

    NOTA: cofre/Diretrizes Clínicas/Deficiência de AVP e de Ocitocina (revisão, JCEM 2026).md
    SEVERIDADE: SÉRIO
    O QUE A NOTA DIZ (linha 21): "copeptina **> 4,9 pmol/L = polidipsia primária**; **≤ 4,9 =
      deficiência de AVP**"
    O QUE A FONTE DIZ: "patients with NDI or PP respond to osmotic stimulation with normal
      plasma AVP concentrations, while subnormal AVP responses are diagnostic of CDI"
    ONDE: textos/1w-2-UmiscpCLQmoRodNaQtONVgg_gjuL.txt (Tomkins et al., JCEM 2022), busca
      "NDI or PP" — a frase aparece duas vezes, contígua e sem quebra de palavra; o mesmo
      trecho está no campo `conflito` de
      extratos/1w-2-UmiscpCLQmoRodNaQtONVgg_gjuL.json.
    QUAL LADO A FONTE SUSTENTA: a fonte. Resposta preservada ao estímulo significa AVP
      PRESENTE — polidipsia primária **ou** resistência à AVP; é o basal que separa as duas. A
      nota carrega o basal >21,4 na linha anterior mas não o declara porteiro, e a linha do
      >4,9 fica lida como diagnóstico único. É o mesmo erro que o núcleo (entrada #68) já
      corrigiu e escreveu por extenso.
    CONDUTA QUE SAI DISSO: o paciente com resistência à AVP (lítio, por exemplo) é rotulado de
      polidipsia primária e recebe ordem de beber menos, com um rim que não concentra.
    CORREÇÃO SUGERIDA: "Teste de salina hipertônica (colher só depois que o sódio atingir ≥150
      mmol/L): copeptina **≤4,9 = deficiência de AVP**; **>4,9 = AVP presente**, o que
      significa polidipsia primária **ou** resistência à AVP — quem separa as duas é a
      copeptina BASAL (>21,4 = resistência à AVP), que por isso se lê PRIMEIRO."

    NOTA: cofre/Diretrizes Clínicas/Hiponatremia e Distúrbios do Equilíbrio de Água
          (série Best Practice 2026).md
    SEVERIDADE: IMPRECISO
    O QUE A NOTA DIZ (linhas 38 e 54): "**SIAD** ... euvolêmica, com **urina concentrada** e
      **Na urinário alto**"; "**Salina hipertônica 3%** em **bólus** (ex.: 100–150 mL,
      repetível) até melhora dos sintomas"
    O QUE A FONTE DIZ: "urinary [na+] is usually elevated, but it may be low in patients with
      siad who are ingesting a low-sodium diet" (hipo-5); e "administration of multiple boluses
      is associated with higher rates of overcorrection ... up to 30% of patients achieve
      correction of 5 mmol/l following a single 150 ml bolus, suggesting that the
      administration of a further bolus in these cases is not only unnecessary but also
      increases the risk of overcorrection" (hipo-4)
    ONDE: extratos/hipo-5.json fato 66; extratos/hipo-4.json fato 51 (e 44: "tanto o NÚMERO
      quanto o VOLUME dos bolus administrados são determinantes-chave do risco de
      supracorreção").
    QUAL LADO A FONTE SUSTENTA: a fonte, nos dois pontos. A nota repete o "Na urinário alto"
      sem a ressalva e escreve "repetível até melhora dos sintomas" sem a reavaliação
      obrigatória entre bólus — aqui o NÚCLEO (entrada #68) está mais correto que a nota.
    CORREÇÃO SUGERIDA: alinhar a nota ao núcleo: "Na urinário habitualmente alto, mas pode
      estar baixo em dieta pobre em sódio"; e "bólus de 150 mL em 20 min, REAVALIANDO sódio e
      sintomas ANTES de repetir — até 30% já sobem 5 mmol/L com um bólus só, e bólus múltiplos
      aumentam a supracorreção".

---

## Entradas examinadas sem achado

#12 (hipotireoidismo congênito), #45 (porteiro da fosfatase alcalina / hipofosfatasia),
#46 (XLH), #78 (palopegteriparatida). O #45 foi conferido linha a linha contra o consenso
canadense e bate em tudo o que checei (ALPL, bisfosfonato contraindicado por ser análogo
estável do pirofosfato, denosumabe suprimindo mais a FA, contaminação por EDTA/citrato, FA por
idade e sexo — 13–14 anos nas meninas e 15–17 nos meninos —, cálcio e fósforo altos, convulsão
responsiva a piridoxina, asfotase alfa na doença de início pediátrico, teriparatida off label
sem ensaio controlado).

## O que ficou SEM FONTE para conferir

Medido por busca de três formas (termo inteiro, radical de 4–5 letras e sinônimo/nome
alternativo) em **todos** os 47 textos-fonte do acervo:

- **#69 — teprotumumabe:** `teprotumumab` 0 ocorrências em todo o acervo; `IGF-1` e
  `insulin-like` 0 no artigo de hipertireoidismo. O consenso ATA/ETA 2022 de doença ocular não
  está no acervo. As 8 infusões a cada 3 semanas, a redução de 2–3 mm de proptose, a
  hiperglicemia, a perda auditiva e a aprovação ANVISA 2023 **não foram verificados**. O único
  ponto que consegui ancorar foi o do radioiodo (achado acima).
- **#46 — XLH:** `burosumab` 0, `XLH` 0, `X-linked hypophosphat` 0 no acervo. Só existe a nota
  do cofre (Arch Endocrinol Metab 2026), que por si não é prova. **Não verificado.**
- **#78 — palopegteriparatida:** `palopegteriparatide` 0 no acervo; `TransCon` aparece 4 vezes,
  e só na diretriz de hipoparatireoidismo de 2022, que a lista entre os agentes "coming". Os
  números do PaTHway (81%, 95%) **não foram verificados**.
- **#12 — hipotireoidismo congênito:** o consenso ENDO-ERN/ESPE/ESE não está no acervo
  (`congenital hypothyroid` só aparece na ATA 2026, em contexto gestacional). TSH >20 mU/L,
  15 µg/kg/dia, fT4 <5 pmol/L, reavaliação aos 2–3 anos e TSH ≥10 após 4–6 semanas de suspensão
  **não foram verificados**. A única regra da entrada que consegui confirmar por fonte
  independente foi "no CH central, excluir/tratar insuficiência adrenal antes do LT4":
  extratos/1DYg7sRy3i5VPictKUvrh5gpGR_W2B5aq.json traz, no adulto em imunoterapia,
  "glucocorticoid replacement started if necessary prior to starting thyroid hormone
  replacement to avoid precipitating adrenal crisis" — mesmo princípio, outra população.
- **#32 e #44 — o arcabouço NOGG 2024 e ASBMR/BHOF 2024:** `NOGG` 0 ocorrências no acervo. Os
  limiares de intervenção dependentes da idade, a classificação em baixo/alto/muito alto e a
  estratégia guiada por meta **não foram verificados**; o que consegui conferir foi a camada
  GIOP (ACR 2022), que é a que produziu os achados acima.
- **#31 — 5º Workshop Internacional 2022:** não está no acervo. Confirmei os critérios
  cirúrgicos contra o Painel 1 do 4º Workshop reproduzido no seminário da Lancet 2018 (cálcio
  >0,25 mmol/L acima do LSN = o mesmo que ">1,0 mg/dL"; T-score < −2,5 em qualquer sítio;
  fratura vertebral; clearance <60 mL/min; cálculo/nefrocalcinose; calciúria >400 mg/dia
  acompanhada de perfil de risco; idade <50 anos) — todos batem. O bloco de **gestação**
  ("cirurgia no 2º trimestre se cálcio >11 mg/dL; imagem apenas por USG; denosumabe
  contraindicado") **não foi verificado**: o seminário não tem uma linha sobre gestação.
- **#58 — posicionamento SBEM Tireoide 2025:** não está no acervo. A iodação do sal brasileira
  e sua redução em 2013 **não foram verificadas**.

---

## Uma linha de sugestão, fora do escopo de defeito

Medi no núcleo (scratchpad/auditoria-nucleo/nucleo.txt, 88 linhas): `biotina` **0**
ocorrências, `amiodarona` **0**, `TBG` **0**, `Wolff` **0**, `Basedow` **0**, `heparina` **0**,
`interferon` **0**, `tirosina` **0**; `checkpoint` **1**, e a única ocorrência é
"HIPOFISITE: lembrar dos inibidores de checkpoint imunológico como causa", na linha 89, que é
uma entrada FORA deste lote. Ou seja: o núcleo não tem entrada sobre efeito de fármaco na
tireoide (doença induzida × artefato de ensaio pela biotina, que são condutas opostas) nem
sobre disfunção tireoidiana por inibidor de checkpoint (anti-PD-1 → tireoide primária,
anti-CTLA-4 → hipofisite, que é o que roteia a investigação). Os dois extratos que responderiam
estão no acervo e no meu lote de prova
(1ONbXDpps7cdD3FWJd6TOhJIKsQZykiBI e 1DYg7sRy3i5VPictKUvrh5gpGR_W2B5aq), mas isso é conteúdo
novo, não defeito de nenhuma das 12 entradas — registro para quem consolida decidir.

---

## Números

- **Entradas examinadas: 12** (#3, #12, #13, #31, #32, #44, #45, #46, #58, #68, #69, #78)
- **Entradas conferidas contra texto-fonte: 9** (#3, #13, #31, #32, #44, #45, #58, #68, #69) —
  destas, #58 e #69 só em parte, por fonte de outra diretriz (a fonte que a própria entrada
  cita não está no acervo)
- **Entradas sem fonte para conferir: 3** (#12, #46, #78)
- Achados: **22** no total — 2 GRAVE, 4 SÉRIO, 4 IMPRECISO, 12 OMISSÃO. Dezessete em entradas
  do núcleo (#3 com 6, #13 com 2, #31 com 1, #32 com 2, #44 com 1, #58 com 1, #68 com 3,
  #69 com 1) e cinco em notas do cofre.
- **Tokens gastos: não tenho instrumentação para medir.** Estimativa grosseira pelo volume de
  entrada lido (brief, 12 entradas, ~10 extratos abertos, 6 notas do cofre, buscas em texto
  integral) e pelo texto produzido: da ordem de 250–350 mil tokens. Trate como estimativa, não
  como medida.
