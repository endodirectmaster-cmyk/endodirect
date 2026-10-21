---
tags: [cofre, integracoes, marketing]
atualizado: 2026-10-21
---

# Instagram Stories — "Questão do Dia"

## 🖼️ FIGURA NO COMENTÁRIO (2026-10-21)

Pedido do professor: *"Vamos melhorar os comentários das questões do dia, no sentido de,
sempre que possível, jogar uma imagem nos comentários para contextualizar e reforçar o
comentário por escrito. Não precisa ser em todas as questões [...] as imagens podem ser
novas, retiradas do PubMed, ou dos próprios resumos dos capítulos. [...] Podem ser das
questões geradas a partir de agora."* As já geradas e postadas ficam como estão.

- **Onde aparece:**
  - no cartão do aluno, **só depois da resposta**, dentro do gabarito comentado (antes
    entregaria o gabarito). Vale no arquivo, na janela do mural e em "Como o aluno vê";
  - no cartão de revisão do arquivo dos professores;
  - no lote, com a etiqueta **🖼️ comentário**, o *"Por que esta figura"* e o botão
    **✕ Tirar a imagem do comentário**;
  - nas Pendências, com *"remover imagem do comentário ao aprovar"*;
  - no formulário manual: prévia, legenda editável, **🔎 Sugerir dos Resumos / PubMed**,
    **⬆ Enviar uma imagem** e ✕.

  Tocar na figura amplia (`ensureLightbox`, classe `qp-zoom`). A figura do caso no
  enunciado passou a ampliar também.
  - **Efeito nas outras telas que usam a prancheta** (questões da aula, caderno de erros,
    "Comece por aqui"): a questão do banco que já tinha imagem no comentário (`expImg`,
    enviada pelo professor no Banco) passa a mostrá-la depois da resposta, como a tela
    do Banco já fazia.
- **Campos da questão:** `expImg`, `expImgRef` (a legenda), `expImgTema` (o capítulo) e
  `expImgOrigem` (`resumo`, `pubmed` ou `upload`). Questão sem figura não ganha campo
  nenhum (`igExpCampos`). O porquê da escolha (`_expMotivo`) fica só na tela do professor
  e não é gravado.
- **De onde vem, em ordem:**
  1. **Resumos.** Entram as imagens do corpo com URL `https` e legenda, e o esquema por URL
     de cada capítulo (`figuras`). Ficam de fora a imagem em base64 do cap. 69 (iria
     inteira na Questão do Dia de cada aluno), os 3 esquemas em SVG embutido, imagem sem
     legenda e capítulo em rascunho. São 317 candidatas no banco de hoje.
  2. **PubMed (Open-i)**, só quando nenhuma dos Resumos serve, o ponto da resposta é
     visual e o enunciado **não** tem figura. Passa pelas mesmas guardas da figura do caso
     (`igImgPedidoCoerente`, `igImgRelevante`), contra o enunciado **e** o comentário.
  3. **Nenhuma.** Figura que não sustenta o comentário é pior do que nenhuma.

  A imagem **nova** é a que o professor envia pelo formulário. Ela vai para o
  armazenamento (`uploadAdminAsset(f,'qotd')`) e só a URL fica na questão.
- **Como escolhe:**
  - **Pré-seleção** (`igExpRanking`, as 10 melhores). Os termos vêm do comentário e da
    alternativa correta (peso 2) e do enunciado (peso 1): sigla inteira, palavra cortada
    em 7 letras, sinônimos de sigla (CAD/cetoacidose, EHH/hiperosmolar, SOP/SOMP…).
    - O peso usa IDF e a normalização de tamanho do BM25.
    - A figura da mesma subespecialidade ganha ×1,5, e são exigidos 2 termos em comum.
    - A fonte do livro na legenda não conta.
  - **Texto dos esquemas:** `figuras/resumos/textos.json`, gerado dos SVGs por
    `scripts/indice-figuras-resumos.js`. O `ci-validate` falha se ele ficar velho. Sem ele,
    o esquema chegava à escolha só com o título.
  - **Escolha pela IA** (`igExpEscolha`, `AI_MODEL_CLINICO`, 220 tokens):
    - a figura tem de mostrar o ponto que **justifica** a resposta e não contradizer nada;
    - na dúvida, nenhuma; entre duas boas, a que mostra direto o critério ou o mecanismo;
    - a busca no PubMed nunca vai atrás de achado hipotético (o resultado de um exame que a
      resposta manda pedir) nem do achado de um distrator.

    Custa uma chamada a mais por questão.
- **Validação:**
  - **Dados reais:** as 40 questões mais recentes têm pré-seleção com candidatas.
  - **Simulação da escolha com 8 questões reais** (agente independente): 6 boas e 1
    aceitável. Nas 2 que faltavam, a figura certa existia, mas era um esquema lido só pelo
    título. Com o índice do texto dos SVGs, as duas ficaram em 1º lugar na pré-seleção.
  - **Teste:** `scripts/test-imagem-comentario.js`, no `ci-validate`. As 19 sabotagens
    feitas foram todas acusadas.
  - **Harness A/B no Chromium:** `scratchpad/qotd-imagem-comentario-navegador/check.js`.
    Cobre o aluno no celular e no notebook, escuro e claro, a janela do mural, lote →
    Pendências → publicação, e o formulário com envio. A main faz o mesmo caminho sem
    figura e sem erro.
  - `sw.js` v320.
- **Achado de passagem, já corrigido:** a questão de EHH na fila (Diabetes,
  `ig-1791923591718-228416`, 31ª de 37) tinha a osmolalidade efetiva incoerente.
  - Com Na 149 e glicemia 860 dava ~346, e não 342. Com Na 156 e glicemia 610 dava ~346
    também, e não 334.
  - Quem fizesse a conta veria a osmolalidade parada e, pela regra do próprio comentário,
    marcaria 0,45%.
  - Corrigida em 21/10 com a autorização do professor: entrada 820/148 (342) e 3 h
    560/151 (333). Detalhes em [[Pendências]].

## 🖼️ LOTE COM FIGURA, ALTERNATIVAS MAIS DIFÍCEIS E QUESTÕES DIRETAS (2026-10-18)

Pedido do professor: *"Estão sendo geradas questões somente com texto, mas sem nenhuma
imagem contextualizando os casos clínicos. Portanto, gerar questões também com imagens no
enunciado. Além disso, deixar as alternativas um pouco mais difíceis, mais ou menos três
difíceis e uma um pouco mais fácil. Na geração das questões também, inclua questões mais
diretas, sem necessariamente serem casos clínicos."*

- **Por que quase nunca vinha figura:** a regra do prompt (`IG_IMAGEQUERY_RULE`, de 06/08)
  só pedia figura quando ela fosse *indispensável* para responder. A regra foi ampliada:
  caso clínico com achado **visual alterado** pede figura. O achado continua escrito no
  enunciado, e a figura ilustra; a questão segue respondível sem ela.
  - **Exame de imagem alterado:** como antes, modalidade + órgão + achado em inglês.
  - **Sinal visível no exame físico (novo):** foto clínica do Open-i, tipo `ph`
    (`OPENI_TIPOS_FOTO` em `api/ai.js`, pedido com `tipo:'foto'`). Só sinal da lista
    `IG_IMG_SINAIS` (18 sinais: acantose, estrias, fácies cushingoide, acromegalia,
    exoftalmia, bócio, mixedema pré-tibial, necrobiose, xantoma, xantelasma, úlcera no pé,
    Charcot, vitiligo, hirsutismo, ginecomastia, hiperpigmentação, lipo-hipertrofia,
    pescoço alado).
  - `igImgTipoDaBusca` decide pela busca: modalidade vence; sinal sem modalidade é foto.
- **Guardas da foto (iguais em espírito às do exame):**
  - o enunciado tem de **descrever** o sinal, sem negá-lo: "sem acantose" recusa, mas
    "sem bócio, acantose…" não;
  - a **legenda da própria foto** tem de citar o sinal;
  - `IG_IMG_NAO_FOTO` recusa bicho, modelo de IA, cirurgia, dermatoscopia, antes e depois,
    tratamento, lesão resolvida e carcinoma;
  - recusa também prancha que junta foto com exame (TC, radiografia);
  - entre as aprovadas, `igImgNotaFoto` escolhe a que mostra **só** o sinal: sem outro
    sinal da lista na legenda, sem painéis (a)/(b).
  - **Validado ao vivo no Open-i (18/10):** exoftalmia, acromegalia, acantose, necrobiose,
    xantoma, bócio e mixedema pré-tibial deram foto certa, conferida no olho.
  - A úlcera no pé não achou foto (o tipo `ph` traz modelo de IA e rato) e fica sem figura.
  - O Open-i está lento: daqui, várias buscas estouraram o tempo. Sem resposta, a questão
    fica sem figura.
- **Alternativas:** `IG_ALTERNATIVAS_RULE`, nas duas formas de questão. Das 4, três
  difíceis (a correta e dois distratores do mesmo tipo, que um residente escolheria) e uma
  um pouco mais fácil, mas nunca absurda. A correta não pode ser a mais longa.
- **Questões diretas:** `IG_FORMATO_DIRETA` + `IG_EIXOS_DIRETA` (critério ou corte,
  mecanismo, efeito adverso, recomendação de diretriz, genética).
  - Enunciado de 1 a 2 frases, sem paciente, e sem figura: `igGenOne` nem busca.
  - `igNivelDesc(level,'direta')` não diz "evite questões diretas", como o texto dos casos.
- **Plano do lote:** `igPlanoLote(n, formato)`, com o seletor **Formato** no lote:
  - "Casos e diretas" (padrão): ~30% diretas, e 2 em cada 3 casos montados em torno de um
    achado visual (`IG_CASO_COM_IMAGEM`);
  - "Só casos clínicos";
  - "Só diretas".

  A revisão marca a direta com a etiqueta **❓ direta**.
- **Uma instrução só:** `igSysQuestao(sub, eixo, opts)` serve o lote e o "Gerar 1 com IA"
  do formulário manual (antes eram dois textos copiados).
- **Testes:**
  - `scripts/test-questao-formato.js` (novo, no `ci-validate`) roda o plano, a instrução,
    o nível e a geração com `aiRequest` falso;
  - `scripts/test-imagem-questao.js` ganhou a foto, com legendas reais colhidas ao vivo;
  - 7 mutantes testados, todos pegos.
- `sw.js` v316 → **v317**.

## 🩺 CORREÇÕES DE CONTEÚDO GRAVADAS (2026-10-17)

Sobre os problemas de conteúdo que os revisores apontaram nos comentários, o professor
pediu *"corrigir tudo"* e, vista a página de revisão
(https://claude.ai/artifact/8DTYUqo9XWuLWviHcpzoTh), *"grava tudo e troca SOMP"*.

**O que foi gravado** (17/10, 18h36 UTC): **110 trocas em 49 questões**, no enunciado,
nas alternativas e no comentário.
- Cada afirmação apontada foi conferida na fonte (PubMed); o texto final passou por
  revisor independente e pelo `checa-jargao.js`.
- **Nenhuma letra de gabarito mudou.** Onde o comentário certo contradizia o caso, mudou
  o dado do caso. Posições em `ig_stories` (P = `ig_pending`):
  - 42: IGF-1 960/780, HbA1c 5,4% e 1 ano;
  - 122: 7 dias por mês;
  - 80: só a asa do ilíaco;
  - 26: paciente que recusa a cirurgia; razão de depuração;
  - 5: TSH confirmatório de 6,1 depois de 2 semanas;
  - P2: reescrita como puberdade precoce central aos 6 anos e 6 meses;
  - P3: LH de 0,1;
  - 38: LDL de 44 e infarto há 3 anos;
  - 8: 1,0 µg/L;
  - 16 e 96: meio do intervalo;
  - 44: 240 → 60 mL/h;
  - 45: creatinina;
  - 47: frases contraditórias retiradas;
  - 52: TmP/TFG e 1,25-di-hidroxivitamina D;
  - 63: macroadenoma;
  - 89: cateterismo adequado;
  - 110: mUI/L;
  - 30: "firmes";
  - 20: "7 a 14 dias antes da cirurgia";
  - 68: peptídeo C;
  - 102: alternativa com MACS.
- **SOMP:** as 6 questões que citavam SOP ou PMOS (posições 0, 27, 48, 54, 120 e 128)
  passaram a SOMP, com a nota de transição só no comentário (regra 7 do gerador).

**Mecânica:**
- Backup `main-antes-correcoes-conteudo-qotd-2026-10-17`.
- Trocas na tabela temporária `public.tmp_jargao_qotd_20261017`, lote
  `conteudo-2026-10-17-b`, com a assinatura md5 de cada campo conferida.
  ⚠️ A chave primária da tabela não inclui o `lote`: cada lote usa uma faixa própria de
  `ordem` (1, 1001, 2001).
- Uma única instrução aplicou tudo e conferiu que:
  - cada trecho aparecia uma vez;
  - id e md5 de cada campo batiam;
  - nada fora de `ig_stories`/`ig_pending` mudou, e os tamanhos das listas ficaram iguais;
  - nenhum outro campo e nenhuma letra de gabarito mudaram.
- Depois: 110 de 110 trechos novos presentes, nenhum antigo restante, nenhuma nota de
  PMOS antiga. Reconferido às 18h47 UTC: intacto, sem gravação depois das 18h36.
- A chave do merge das questões é o `id`, que não mudou: um painel aberto antes da
  gravação pode devolver o texto antigo ao salvar. Professor avisado do F5; a checagem
  de zumbis da migração SOMP confere também estes 110 trechos ([[Pendências]]).

## 🧹 JARGÃO DE IA TIRADO DOS COMENTÁRIOS (2026-10-17)

O professor mandou o print do comentário da questão da sarcoidose, com "não ataca o
mecanismo" e "não freada" marcados, e pediu: *"Remover esses jargões de IA"*.

**A questão da sarcoidose** foi reescrita à mão.
- Backup `main-antes-jargao-qotd-sarcoidose-2026-10-17`.
- Corrigi também "CYP27B" para "CYP27B1" e "25(OH)D no limite alto" para "dentro da
  faixa de referência".
- A frase atribuída à Endocrine Society virou "na doença granulomatosa, a reposição de
  vitamina D exige cautela, com monitorização do cálcio". O professor aprovou a troca,
  feita com o backup `main-antes-endocrine-society-sarcoidose-2026-10-17`.

**Varredura dos outros 139 comentários** (95 publicados, 38 na fila, 7 pendentes):
- três revisores independentes propuseram trocas mínimas;
- li as 170 reescritas e conferi o contexto das 13 que dependiam dele;
- **261 trocas** gravadas em 110 questões (116 campos), com o backup
  `main-antes-jargao-comentarios-qotd-2026-10-17`.

O que entrou nas trocas:
- caixa alta de ênfase;
- metáfora ("janela", "gatilho", "régua", "motor", "assinatura");
- moldura ("a chave é", "armadilha", "pegadinha", "o ponto que decide");
- julgamento coloquial de alternativa ("está errado", "é erro grave", "tornando
  incorreta" → "não está indicado");
- "justamente", "exatamente";
- 19 correções seguras de grafia e digitação:
  - "hipósfise";
  - "nesipidioblastose";
  - "litio";
  - "transesfenoinal";
  - "RM de sem alterações";
  - "Kallmann)";
  - TSH em mUI/mL;
  - "ciproterona" num comentário cuja alternativa é medroxiprogesterona;
  - "recém-nascido PIG" para um menino de 8 anos.
- A nota sobre PMOS de uma questão foi alinhada à regra 7 do gerador (consenso da
  Lancet, maio de 2026).

**Mecânica:**
- As trocas foram para uma tabela temporária protegida, com RLS e sem acesso de
  anon/authenticated; a assinatura md5 do lote foi conferida contra a calculada aqui.
- Uma única instrução aplicou tudo e conferiu que:
  - cada trecho aparecia uma vez;
  - id e md5 de cada comentário batiam;
  - nada fora de `ig_stories`/`ig_pending` mudou;
  - nenhum outro campo das questões mudou.
- Depois, todos os 261 trechos novos estavam presentes, nenhum antigo restou, e a busca
  por jargão e por caixa alta deu zero.

**Ficou de fora, de propósito,** o parágrafo da questão 1, que parece escrito pelo
professor ("Lembrar que…"). Ele traz a sigla "SOMP", que a regra 7 diz não existir em
fonte nenhuma; está apontado ao professor.

**Prevenção:**
- a regra 3 do `CLINICAL_AUTHORING` proíbe metáfora, moldura, julgamento coloquial e
  maiúscula de ênfase;
- o `checa-jargao.js` ganhou as marcas novas e as siglas endócrinas;
- o `test-jargao.js` leva os trechos reais.

**Conteúdo:** os revisores também apontaram cerca de 40 problemas de conteúdo
(comentário que não justifica o gabarito, corte de diretriz, referência). Nenhum foi
corrigido sem o professor; ver [[Pendências]].

## 📋 PRANCHETA E ABA "COMO O ALUNO VÊ" (2026-10-17)

Pedido do professor (17/10), com o print do painel e a figura de uma prancheta:
*"Deixe a questão do dia aparecendo no perfil do professor de forma semelhante como
aparece para o aluno. Deixa uma aba ao lado de 'postados'"* e *"Vamos deixar mais
didático a visualização da questão do dia"*.

- **Prancheta.** O `qotdCardHTML` é o único cartão da questão e aparece:
  - no arquivo do aluno;
  - na janela do mural;
  - no "Comece por aqui";
  - na aba nova do professor.

  Virou uma prancheta: madeira, prendedor de metal e folha branca com "Questão do dia".
  A tinta da folha é fixa e escura, porque com os tokens do tema o modo escuro poria
  texto claro no papel branco.
- **Texto justificado.** O caso, a pergunta e o comentário vão justificados, como no
  cartão antigo. Foi pedido do professor, na mesma tarde, olhando a aba no ar
  (`sw.js` v310).
- **Caso + pergunta.** `qotdPartes` separa a pergunta final ("Qual a melhor conduta
  inicial?") e a põe em destaque abaixo do caso.
  - Só separa quando a última frase é uma pergunta que começa com maiúscula, sem ponto
    no meio; nunca corta em "ex.".
  - Nos 133 enunciados do banco (17/10), 130 se separam e 3 ficam inteiros (2 são uma
    pergunta única).
- **Aba "👁 Como o aluno vê"**, para o professor dono, ao lado de "Postados":
  - mostra o mesmo arquivo do aluno, com a de hoje aberta;
  - a lista vem de `qotdArchListHTML`, compartilhada, com prefixo próprio (`admqal`)
    para não cruzar ids com o painel do aluno;
  - a resposta ali é de **teste**: fica só na memória da página, sem `DB.qotd`, sem
    `studyEvent` e sem sincronizar;
  - "Limpar respostas de teste" zera.
- **Provas:**
  - `scripts/test-qotd-prancheta.js`, no `ci-validate`, barrou 7 de 7 mutações;
  - `scratchpad/qotd-prancheta-navegador/check.js`, no Chromium, em A/B: aluno em 390
    e 1280 px, tema claro, janela do mural e professor em 1280 e 390 px.

## 🧑‍🏫 Lotes distribuídos aos professores (`ig_pending`, desde 11/10/2026)

Preferência do professor (11/10): *"antes de lançar na fila, distribua essas questões
para os professores aprovarem"*. Lote gerado pela coordenação entra em `ig_pending` com o
formato de `igMakePending` (status `pending`, `distributedBy`), e cada professor aprova
só as suas subespecialidades na aba Pendências (`QOTD_CURATORS`); só depois vai para a
fila (`ig_stories`). Detalhes de cada lote em [[Decisões]].

| data | lote | distribuição |
|---|---|---|
| 11/10 | 12 sobre as correções do acervo de 10/10 | Eduardo 5, Rafael 3, Rodolpho 3, Bruno 1 |
| 12/10 | 5 sobre estudos de 2025–2026 (SYNCHRONIZE-1, ESSENCE-TIMI 73b, Bax24, REIMAGINE 2, Opti-DOR) | Rodolpho 3, Rafael 1, Eduardo 1 |

## 🚨 A QUESTÃO DE HOJE ESTAVA NA ÚLTIMA LINHA DA LISTA DO ALUNO (2026-08-16)

Reclamação real pelo Suporte (15/08, assinante): *"Questões diárias não estão
mais aparecendo para serem respondidas desde o dia 5 de agosto."*

**A publicação nunca falhou.** Medido no `ig_stories` de produção: o cron promoveu
**uma questão por dia, todos os dias**, de 01/08 a 16/08, sem buraco — 52 postadas,
14 ainda na fila. O defeito era de **ORDENAÇÃO, na tela do aluno**:

- `renderQotdArchive()` (aba 🧠 Questão do Dia) renderizava `qotdPublished()` na
  **ordem crua do array**, que é a de publicação — **mais ANTIGA primeiro**. Com 52
  publicadas, a do dia era a **52ª linha**.
- O modal do mural (`renderQotd`) só aparece **no Mural**, 1× por sessão. Quem entra
  pela aba nunca o vê.

⚠️ **O rastro do aluno prova o efeito.** Até 06/08 ele respondia a questão do dia
**no próprio dia** (04/08→04/08, 05/08→05/08, 06/08→06/08). De 10/08 em diante
respondeu as posições **1, 2, 3, 4, 5…** do array — questões de **junho** —, uma por
dia. Ele achou a lista, começou do topo e nunca chegou na de hoje.

⚠️⚠️ **POR QUE ISSO SOBREVIVEU 10 DIAS: o arquivo do PROFESSOR já ordenava por
data**, com padrão `admQotdArchSort='recent'` e seletor de ordem. Da tela dele a
questão de hoje era a primeira linha. **As duas telas divergiam, e a que tinha o
defeito era a que ninguém da casa abre.**

**O conserto** (`sw.js` v240 → v241):
1. `qotdArchSort='recent'` no aluno — mesmo padrão do professor — com o mesmo
   seletor "mais recentes / mais antigas primeiro" (a varredura cronológica que ele
   estava fazendo à força continua possível, só não é mais o padrão).
2. Selo **`🧠 De hoje`** na linha, vindo de **`qotdTodays()`** — a mesma fonte que o
   modal usa, para as duas telas nunca apontarem questões diferentes.
3. A de hoje **abre sozinha** na 1ª entrada do painel, se ainda não respondida
   (`qotdArchAuto`). Se já foi respondida, **não** abre — senão o painel abriria
   direto no gabarito.
4. 🐛 **Segundo furo, achado no mesmo caminho:** `igStories` nasce de
   `lsGet('ig_stories')` (cópia do navegador), e o hydrate do payload só redesenhava
   o **mural**. Quem abria a aba antes de o servidor responder ficava preso na cópia
   velha — inclusive em *"Nenhuma questão publicada ainda"* — até sair e voltar.
   Agora o hydrate redesenha o arquivo também, no mesmo padrão da linha do
   `payload.qotd`.

**Guarda:** `scripts/test-qotd-arquivo-aluno.js`, no `ci-validate` (item 17b).
Monta 52 questões em JSDOM e exige que a de hoje seja a **1ª** linha, marcada e
aberta. **Verificado por mutação nas três pontas** — voltar à ordem crua, tirar a
abertura automática ou tirar o selo reprova o teste. Ele também trava o padrão
`'recent'` **nas duas telas**, que é a divergência que escondeu tudo.

## Dificuldade 60/40 prova de título / muito avançado (2026-07-23)
- **Pedido do usuário:** "deixa então 60/40" (refina o "vá alternando" anterior — agora com proporção fixa).
- **Onde:** `igGenOne(sub,topic,level)` tem o 3º parâmetro `level`; helper **`igNivelDesc(level)`** devolve o trecho do prompt: `'titulo'` = "nível PROVA DE TÍTULO (padrão especialista)…" · qualquer outro (default `'muito_avancado'`) = "nível MUITO AVANÇADO / DIFÍCIL (banca difícil…)" com raciocínio de múltiplas etapas, nuance fina, exceções/armadilhas de diretriz e distratores muito plausíveis.
- **Proporção 60/40:** no laço do lote (`ig-lote-gen`) monta-se `levels` = `Math.round(n*0.4)` × `'muito_avancado'` + resto `'titulo'`, **embaralhado** (`igShuffle`) p/ não agrupar os difíceis, e usa `levels[idx]`. Distribuição: n=5 → 2 avançadas/3 título (40%); n=10 → 4/6; n=3 → 1/2 (33%); n=1 → 1 título. `sys` (examinador) intacto. Bump `sw.js` v118→v119.
- **Histórico:** v116→v117 fixou TODAS em "muito avançado" → v117→v118 alternava 50/50 (idx%2) → **v118→v119 fixa 60/40**.
- **Remove "distribuída por &lt;email&gt;"** do card de Pendências (`admPendCardHTML`) — professor não precisa ver quem distribuiu (o campo `distributedBy` continua no dado, só não é exibido).
- **Sugestão AUTOMÁTICA de imagem de exame complementar ao gerar** (decisão do usuário: automático + qualquer figura do PMC com referência): a IA, ao gerar a questão, devolve um campo opcional **`imageQuery`** (termos EM INGLÊS para achar a imagem, ex.: "pituitary MRI microadenoma") quando a vinheta envolve exame de imagem; senão vazio. Regra injetada via `IG_IMAGEQUERY_RULE` nos prompts do `igGenOne` (lote) e do gerador manual.
  - **Fonte:** **Open-i** (NLM/NIH) = figuras do **PubMed Central**. Proxy **server-side** em `api/ai.js` via `kind:'openi'` (reusa o endpoint p/ respeitar o teto 12/12 funções; mesma proteção same-origin; não usa Anthropic). Helper `openiSearch()` normaliza `imgLarge/imgThumb/imgGrid150` (URLs relativas → prefixa `https://openi.nlm.nih.gov`), `journal_title/journal_date/authors/pmid/pmcid/image.caption`. Best-effort: falha → lista vazia → questão sem imagem.
  - **Cliente:** `igFetchExamImage(query)` → POST `{kind:'openi'}`; `igFormatImgRef(it)` monta a minirreferência ("1º autor et al. Revista. Ano. Fonte: PubMed Central/Open-i · PMID"); `igAttachExamImage(q,d)` anexa `img`+`imgRef` ao objeto da questão (nunca falha a geração).
  - **Modelo de dados:** novo campo **`imgRef`** ao lado de `img`, carregado em `igReadDraft`/`igFillForm`/`igLoteToQueue`/`igMakePending`/`pendApprove` + pushes de aprovação/edição.
  - **Exibição:** helper **`qFigHTML(q)`** (imagem + legenda da referência) nas telas da Questão do Dia (`qotdCardHTML`, `qotdReviewCardHTML`); preview no editor (`igRenderImgPrev`), no lote (`renderIgLote`, com chip "🖼️ imagem") e no card de Pendências (com checkbox **"remover imagem ao aprovar"** — `pend-rmimg-<id>`, honrado em `pendApprove`) para o professor vetar imagem ruim.
  - **⚠️ CORS/PNG:** `igQuestionSVG` só embute imagem **`data:`** (upload) no PNG do Story — URL externa tornaria o canvas *tainted* e quebraria o `toBlob`. A imagem do PubMed **ilustra dentro do app**; no Story o professor adiciona pelo editor do Instagram (consistente com a limitação já anotada). `<img>` de exibição usa `referrerpolicy="no-referrer"` + `onerror` (some se o hotlink falhar).
  - **Ressalvas registradas ao usuário:** copyright (nem toda figura do PMC é reutilizável comercialmente — usuário optou por "qualquer figura + referência", com atribuição sempre visível p/ vetar); correção clínica (por isso o professor revisa/remove). Não testável no sandbox (proxy bloqueia `openi.nlm.nih.gov` por política) — validar em produção.

## Ajustes do usuário (2026-06-30)
- **LDL-c sem meta/VR no enunciado (regra #10 do `CLINICAL_AUTHORING`):** a IA NÃO inclui mais o valor de referência nem a META de LDL-c (nem demais alvos lipídicos) no enunciado — o aluno deduz a meta pelo risco CV. A regra também impõe COERÊNCIA: não afirmar "no alvo/na meta" sem conferir o valor contra a meta do risco (origem: questão gerada com "LDL-c 62 (meta <55)… já no alvo" — contradição, 62 > 55). Vale para todos os geradores (via `authoringSys`).
- **Botão "👥 Pendências por professor" na aba Gerar lote:** mostra quantas questões cada curador tem para aprovar (agrupado por subespecialidade), p/ o Rodolpho equilibrar a distribuição dos temas. Funções: `qotdPendingByCurator()` (dados, agrupa `igPending` por `qotdCuratorForSub`) + `admPendByProfHTML()` (render) + toggle `#ig-pendprof-toggle`/`#ig-pendprof-panel` em `bindAdmStories`. Recalcula ao abrir; counts já refletem o estado pós-distribuição (a aba re-renderiza).

## Status
**MVP + CARD NO APP CONSTRUÍDOS (2026-06-23).** PR **#423** em **preview**, aguardando "pode dar deploy". Inclui: card clicável da Questão do Dia no app (Dashboard + topo do Mural), questões **diárias** (Seg–Sáb; Dom = 2 promos), legenda com CTA **"resposta no app"** (funil) e **geração em lote** no painel. O **gerador de IA** (usado aqui e no app) teve a causa-raiz corrigida e **já está em produção** (hotfix #422 — ver [[Decisões]]).

## Implementação do MVP (2026-06-23) — CONSTRUÍDO
Respeita o teto (12/12 funções, 2/2 crons) e o deploy **SEM `package.json`** (serverless = Node puro + `fetch`; o `@resvg` do sandbox NÃO existe em produção).
- **`lib/instagram.js`** (módulo, não função): `igTodayPlan` (calendário por dia da semana BRT); `questionCaption`/`answerCaption`; **lembrete diário por e-mail** (Resend; destinatários = `endodirect_admins`/`ALERT_TO`, igual ao `alert.js`); idempotente por dia (`ig_notice_sent`, preservado como os `newsletter_*` no client e no save do admin).
- **Carona no cron** `api/cron/endocrine-radar.js` → `sendIgDailyNotice()` (fail-safe, após os trial-emails).
- **Painel → "📲 Questão do Dia"** (`admStoriesHTML`/`bindAdmStories`): gerar 4-alt com IA (`aiRequest`+`authoringSys`), editar, **pré-visualizar**, **baixar PNG 1080×1920** (pergunta+gabarito), **copiar legenda**, **aprovar p/ fila**, gerir fila (editar/baixar/marcar postada/excluir), **promos** de domingo (fundo branded + legenda).
- **Arte 100% client-side**: `igQuestionSVG`/`igAnswerSVG`/`igPromoSVG` → `igRenderCanvas` (SVG→canvas; logo dourado `Icone - MD.png` same-origin desenhado por cima = sem taint) → `toBlob` PNG.
- **Fila `ig_stories`** no estado global (`globalStatePayload`/`applyStatePayload`; professor escreve, cron só lê).
- **Pendências (futuro):** publicação automática via **Graph API**; **texto justificado** na arte (hoje alinhado à esquerda); **imagem do caso** embutida (sairia por taint cross-origin → por ora o professor adiciona no editor do IG); **prints reais** nos promos (commit em `figuras/stories/`).

## App + funil + lote (2026-06-23) — CONSTRUÍDO (PR #423, em preview)
- **Questão do Dia = JANELA (modal) na frente do mural** (ajuste do usuário 2026-06-23): a questão **aprovada mais recente** (a mesma que vai ao Story) aparece como **modal sobre o mural esmaecido** (backdrop). O aluno toca a alternativa → acerto/erro + **explicação comentada** na hora + botão **"Ver o mural →"**; ao fechar (botão, "Agora não" ou backdrop) o mural volta ao normal. Persiste (`localStorage qotd_answered`) + conta no desempenho por área. Funções: `qotdModalEl`/`qotdRenderModal`/`qotdClose`/`renderQotd`/`qotdPick` (+ `qotdCardHTML`/`qotdTodays`/`qotdReadAns`); modal criado em runtime e anexado ao `body`; CSS `.qotd-overlay/.qotd-backdrop/.qotd-dialog` (z-index 9000). Aparece **só no Mural** (`goPanel('mural')` mostra; outros painéis escondem), **1× por sessão** ou até responder. Os divs antigos `#qotd-card` (Dashboard) e `#qotd-mural-wrap` (topo do Mural) ficaram **inertes** (display:none).
- **Caminho de dados (migração `add_ig_stories_to_content_rpcs`, JÁ aplicada no Supabase):** `endodirect_member_content()` e `endodirect_public_content()` passam a expor **`ig_stories`** (chave ADITIVA; o gating das demais chaves é cópia verbatim → **não muda acesso**). A questão do dia é **livre** (aluno/degustação/público) — é a isca do funil. O cliente já lia `payload.ig_stories` no hydrate (`applyStatePayload`).
- **SEM story de gabarito (ajuste do usuário 2026-06-23):** o Story é só a imagem do caso (enunciado + alternativas) + rodapé **"GABARITO NA PLATAFORMA · Acesse www.endodirect.com.br"** (`igQuestionSVG`). Removidos os botões/itens de gabarito (manual + fila) e o gabarito da prévia; `igAnswerSVG`/`igCaptionA` ficaram sem uso. **Tabela de exames:** IA gera tabela markdown no enunciado → app via `mdToHtml` (`<table>`), Story/legenda via `igStemText` (texto alinhado). **Imagem:** só **descrição** em texto por ora (a IA não cria imagem médica real). Ver [[Decisões]].
- **Calendário (ajuste do usuário):** `igTodayPlan` agora **Seg–Sáb = questão**, **Dom = 2 promos**. Sem "dia de gabarito" (a resposta vive no app).
- **Legenda = funil:** `questionCaption` (lib) e `igCaptionQ` (painel) trocaram "gabarito amanhã" por **"A resposta COMENTADA está no app — link na bio"**. O e-mail do cron idem.
- **Geração em lote** no painel: `igGenLote`/`igPool`/`renderIgLote` — gera N (3/5/7/10), opção **variar subespecialidades** (rotação `DIR_SUBS`), **concorrência limitada a 3** (anti rate-limit), modelo fixo **Sonnet**. Professor revisa e **Aprovar/Editar/Descartar** (ou "Aprovar todas") → entra na fila `ig_stories`.
- **Layout do painel (ajuste do usuário 2026-06-23):** "Gerar em lote" é a **ação principal** (topo, com seletor de subespecialidade próprio `ig-lote-sub`); o formulário "Criar/editar questão" fica **recolhido** atrás de "✏️ Criar questão manualmente" (`#ig-manual-wrap`, revelado também ao clicar Editar no lote/fila); a caixa de divulgação de domingo ficou **recolhida + com explicação** do "fundo branded" (fundo pronto p/ sobrepor o print real da ferramenta).
- **Prompt caching (2026-06-23, no MESMO PR #423):** as diretrizes clínicas (`CLINICAL_GUIDELINES`, ~10,7k tokens) agora vão **inteiras** a TODO gerador (inclusive a Questão do Dia) e são **cacheadas** (`cache_control` ephemeral) — `api/ai.js` manda o `system` como blocos e `authoringSys` põe as diretrizes na frente (prefixo idêntico) separadas do formato por um sentinela. Custo controlado (1ª chamada 1,25×, depois ~0,1×). Detalhes em [[Decisões]].
- **Pendente:** publicação automática via Graph API (stickers de quiz/poll seguem manuais — limite da Meta); histórico de "questões anteriores" no card.

## Decisões de produto (2026-06-22)
- **Canal/formato:** **somente Stories** (9:16, **1080×1920**). Conta **@endodirect** (já é **Business** → habilita a Graph API no futuro). Postagem às **18h BRT**.
- **Fluxo:** **rota C — híbrido com aprovação.** O sistema prepara arte + legenda + gabarito; o professor revisa/edita e **aprova**; postagem **manual** no MVP. Depois troca-se o "avisar" por publicação via API (a conta já é Business).
- **Conteúdo:** **misto.** O banco curado (TEEM) serve de **calibragem** de estilo/dificuldade; o que vai ao ar são, em regra, **casos ORIGINAIS** (IA + revisão). **Atualização (2026-06-22, usuário):** **eventualmente PODE ir ao ar uma questão do próprio TEEM**; quando for, **iniciar o enunciado identificando a origem**, no formato **"(TEEM ANO)"** — ex.: *"(TEEM 2026) Homem, 65 anos…"*. ⚠️ *Caveat:* a prova é oficial da SBEM → usar enunciado **verbatim** tem risco de direito autoral; a atribuição ajuda, mas o ideal é confirmar permissão de uso e preferir paráfrase quando possível. Decisão do usuário registrada.
- **Engajamento (Stories) — DECIDIDO (2026-06-22): 4 alternativas (A–D)**, para encaixar no **sticker de quiz nativo** do Instagram (máx. 4 opções; dá acerto/erro na hora + estatística). A alternativa correta vira a opção certa do quiz. As questões completas de **5 alternativas** seguem **dentro do app** (separar "atrair" de "estudar"). **Stickers de quiz/poll NÃO podem ser adicionados via API** → reforça a aprovação humana + postagem manual no MVP.
- **Calendário editorial (decidido 2026-06-22):** **Seg/Qua/Sex** = questão do dia, cada uma de uma **subespecialidade diferente** (rotação pela taxonomia canônica `DIR_SUBS`: Diabetes · Tireoide · Adrenal · Obesidade · Lípides · Osteometabolismo · Neuroendocrinologia · Endoc. Feminina · Endoc. Masculina · Endoc. Pediátrica · Endoc. do Esporte). **Ter/Qui/Sáb** = gabarito da questão anterior (seg→ter, qua→qui, sex→sáb). **Dom** = **2 stories de propaganda** das ferramentas da plataforma (rotacionando), para atrair alunos.
- **Tipografia & imagens (2026-06-22):** enunciado (e explicação) em **texto justificado**. A questão suporta **imagem opcional do caso** (ECG, TC, RM, USG de tireoide, etc.) num slot **abaixo do enunciado** → o modelo de dados da questão ganha um campo de imagem.

## Amostra (2026-06-22)
- Gerada **localmente** (SVG → PNG via `@resvg/resvg-js`, fonte Liberation Sans), on-brand (navy `#0b1325`/`#1a2744` + dourado). 2 slides: **pergunta** (**4 alternativas A–D**) + **gabarito**. Caso original: hiperaldosteronismo primário (rastreio aldo/renina → **teste confirmatório** antes de localizar; resposta **B**). **Layout (decidido 2026-06-22):** **logo** (ícone dourado ED, `Icone - MD.png`) no topo; **sem** @handle, **sem** etiqueta de área e **sem** disclaimer na arte (o @ já aparece na UI do story).
- **Lição técnica:** o **Canva AI** (`generate-design`) **falha** (`design_generation_error`) com texto clínico longo / caracteres especiais / `brand_kit_id` — só gera com prompt curto e genérico. E **não dá** para baixar export/thumbnail do Canva no sandbox (403). ⇒ Para produção, usar **Canva brand template com autofill** (campos fixos) **ou** render próprio HTML/SVG→PNG (controlado e reprodutível).

## MVP — proposta original (referência; já construído acima)
- `lib/instagram.js` (**módulo**, não função): escolhe o item do dia, monta a legenda da pergunta e a do gabarito.
- **Card "Questão do dia"** no painel do professor: a IA gera caso + arte; o professor edita/aprova; aprovados entram numa fila (estado em `payload`, espelhando `newsletter_*`). Ver [[Dados e Supabase]].
- **Disparo diário pegando carona no cron do radar** (`/api/cron/endocrine-radar`, 10:30 UTC; ver [[Newsletter e Radar]]) com **lógica de dia da semana**: Seg/Qua/Sex → avisa a **questão** (próxima subespecialidade da fila); Ter/Qui/Sáb → avisa o **gabarito** do item anterior; Dom → as **2 promos**. **Avisa por e-mail** (Resend) com a arte + legenda copiável → o professor posta às 18h BRT. Depois, migrar para publicação via Graph API (imagem do story; quiz/poll seguem manuais).
- **Story de domingo (promo):** template **separado** destacando 1 ferramenta por story (Banco de Questões, Simulador de casos, Calculadoras, Flashcards, Mapas Mentais, Diretrizes, Podcasts, Prescrição/Memed, Chat IA, Cursos) — 2 por domingo, rotacionando, com CTA p/ atrair alunos.
- **Prints reais nos promos (decidido 2026-06-22):** o promo deve usar **screenshot REAL da ferramenta**. Como não dá p/ capturar a tela logada nem embutir print colado no chat (sandbox sem navegador/sem acesso ao arquivo), o entregável é o **fundo branded** (logo + título + CTA + **moldura tracejada**) e o professor **sobrepõe o print no editor de Stories** do Instagram. Alternativa: se os screenshots vierem como **arquivo** (commit no repo ou URL público), dá p/ compor o PNG final. Fundos de exemplo (Banco de Questões, Simulador) gerados via `@resvg/resvg-js`.
- **Molduras por origem do print (decidido 2026-06-22):** o usuário vai mandar **vários prints** p/ usar aos poucos na rotação. Print de **desktop → moldura de monitor/computador**; print de **iPhone → moldura de iPhone**. **Armazenar os prints no repo** (ex.: `figuras/stories/`) porque o container reseta — só o git persiste. Evitar prints com **dado de paciente** (repo é público).
- **Arte:** brand template no Canva (autofill) ou render SVG→PNG.

Ver [[Decisões]] e [[Integrações]].
