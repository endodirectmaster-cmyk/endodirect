---
tags: [cofre, conteudo, resumos]
atualizado: 2026-10-24
---

# Ilustrações dos Resumos (no meio do capítulo)

Pedido do professor (17/10/2026): *"vamos nos concentrar na geração de
imagens/ilustrações nos resumos dos capítulos. Podemos começar, por exemplo com
endocrinologia básica. (...) a ideia é inserir ilustrações referentes a mecanismos de
ação, etc, no meio do capítulo"*. Depois: *"pode ser de outra coisa também nos
capítulos"*.

É diferente das [[Figuras dos Resumos]] (campo `figuras`, no fim do capítulo). Aqui a
ilustração entra **no corpo do `resumo`**, logo depois do parágrafo de que trata, como
linha de imagem em markdown:

`![legenda](https://www.endodirect.com.br/figuras/resumos/ilustracoes/<sub>--<id>.svg)`

O `mdToHtml` transforma essa linha em `<figure class="wys-fig">` com legenda e
ampliador. O editor do professor preserva a figura ao salvar (ramo `figure` do
`htmlToMd`).

## Como nasce

- **Desenho próprio em SVG**, montado à mão com as primitivas de
  `scratchpad/ilustracoes/lib.js`:
  - membrana;
  - receptores (7TM, insulina, citocina) e proteína G;
  - núcleo e DNA;
  - setas e barra de inibição.

  A moldura é igual à das figuras do fim do capítulo (mesmo cartão, título, subtítulo e
  paleta).
- **Recorte de livro: decisão do professor (17/10/2026).** Expliquei que a figura é da
  editora e que traduzir ou adaptar exige licença (Lei 9.610/98, art. 29), e ofereci três
  caminhos: livros de licença aberta, licença da editora ou desenho próprio. Ele decidiu:
  *"Apenas faça recorte da gravura e abaixo coloque a referência do livro abreviado"*.
  - **Como se faz:**
    - recorte da figura sem nenhuma alteração (nem tradução);
    - embaixo, a referência abreviada com autor, obra, edição e número da figura;
    - só a figura que o trecho do capítulo pede.

    É o formato mais próximo do direito de citação (art. 46, III).
  - **Retirada:** se a editora pedir, a figura sai.
  - **Tradução (18/10/2026):** não traduzi (art. 29). Outra conversa do professor
    traduziu os rótulos das 64 figuras do zip, e ele mandou *"Usar essas figuras"*. Desde
    então a versão usada é a traduzida (`<nome>_PT.png` no zip `_PT`), com a legenda
    *"Fonte: traduzida de …"*. O Guyton já vem da edição brasileira e entra como está.
  - **Lote 1 (Endocrinologia Básica, 149–152), gravado em 18/10:**
    - 19 recortes; lista em `scratchpad/figuras-livros/figuras.js`.
    - **Revisão:** cada tradução lado a lado com o original (`pares/`). O conteúdo estava
      certo em todas.
    - **Acabamento:** cinco tinham defeito (seta, borda ou arco apagados pela caixa do
      rótulo, borrões). `corrige.py` traz a arte de volta do original só nos pontos
      medidos, sem trazer texto em inglês. Ele monta o fundo do "Transcrição" sobre o
      núcleo azul refazendo a curva da borda.
    - **Preparo:** `prepara.py` (apara o topo de 15.4 e 17.1; o Netter vai em JPEG).
    - **Prévia:** `previa.js` (com `INDEX_HTML` e `ALTURA_MAX` para comparar antes e
      depois).
    - **Envio:** função temporária `subir-figuras-livros` para
      `endodirect-assets/resumos/livros/`, depois desativada (410).
    - **Gravação:** `gera-sql.js`, numa instrução com guardas de md5, backup e conferência
      do resto do estado.
    - **Tamanho na tela:** até 640 px de largura e 55% da altura da janela
      (`.dir-texto .wys-img` sem largura do editor; dois pedidos do professor em 18/10,
      `sw.js` v315 e v316). Por isso nenhum recorte usa mais `{N}`.
  - **Lote de diabetes (18/10): gravado em 19/10, das 00h22 às 00h28 UTC.**
    - **Origem:** `livros/diabetes/imagens_diabetes_PT.zip` + `indice_PT.csv`, que o
      professor subiu às 17h04 UTC. São 79 figuras já traduzidas por outra conversa dele.
      O zip dos originais em inglês **não** veio.
    - **Revisão:** 74 figuras em 9 lotes, um agente por lote. Cada agente conferiu a imagem,
      escolheu o trecho e escreveu a legenda. Eu juntei e conferi tudo com `monta.js`
      (pasta da sessão). As 5 restantes foram separadas antes:
      - 2 do guia de hipoglicemia da ADA (Clinical Compendia 2026): a licença permite uso
        educacional **sem alteração**, e estas são traduções;
      - 3 tabelas do "Diabetes Technology Overview 2026" (Diabetotech): catálogo de
        marcas que muda a cada poucos meses.
    - **Resultado:** 51 entram em 16 capítulos (127–138, 221, 222, 224, 227, 231). Ficam de
      fora 23:
      - 12 contradizem o capítulo ou estão desatualizadas;
      - 7 repetem uma figura melhor;
      - 4 tratam de assunto que nenhum capítulo cobre.
      Lista em `scratchpad/figuras-livros/figuras-diabetes.js`.
    - **Rótulos corrigidos (10), com `corrige-diabetes.py`:**
      - HAAF (Matfin 31-3): ↑ → ↓ nas respostas neurais simpáticas;
      - Vilar 69.5: "sensibilidade motora" → "protetora";
      - Vilar 70.5: rim rotulado "Fígado" → "Rim";
      - Vilar 70.1: "contrarregulares" → "contrarreguladores" e "Função normal" → "renal";
      - Vilar 68.2: "neutróficos" → "neurotróficos";
      - Vilar 59.2: "neutrotransmissores" → "neurotransmissores";
      - Vilar 63.5: "atuomatizado" → "automatizado";
      - Williams 36.8: "Glicose" e "Sensor de glicose" estavam trocados; e "10:53 AM" → "10:53";
      - Vilar 59.9: saiu uma caixa solta e repetida;
      - Vilar 63.4: "< 63 mg/dℓ" → "< 70 mg/dℓ" na coluna do DM1/DM2.

      A legenda dessas diz *"Fonte: adaptada de …"* (ou *"traduzida e adaptada de …"*).
    - **Posições:** três figuras mudaram de lugar para não ficarem coladas:
      - Williams 36.5 foi para a seção de estágios da SBD 2025 (cap. 128);
      - a HAAF foi para "Fatores de risco" (cap. 134);
      - a Vilar 70.4 foi para depois da tabela "Níveis de hipoglicemia", no fim do 134.
    - **Fim do capítulo:** `gera-sql.js` agora aceita trecho que termina o capítulo (Netter
      5-18 no 132 e Vilar 70.4 no 134). O ensaio gerou 51 trocas.
    - **Conferências:**
      - `previa.js` nos 16 capítulos (390 e 1280 px): todas carregam, cabem e ficam logo
        depois do trecho. O único aviso é o do ampliador no celular, que abre a figura do
        tamanho da tela, como no lote 1.
      - Os md5 dos 16 resumos não mudaram desde a exportação (conferido às 19h UTC):
        127 `447372ff`, 128 `4b717dc5`, 129 `f12064bc`, 130 `75b1e95f`, 131 `d8a587f3`,
        132 `cf9e4072`, 133 `79a49efd`, 134 `ab841931`, 135 `9c02c14f`, 137 `7668d90f`,
        138 `3d9a05b9`, 221 `87b887de`, 222 `f3ad1708`, 224 `92b2adaf`, 227 `b10356c8`,
        231 `c5d2855f`.
    - **Prévia:** [Figuras de Diabetes nos Resumos](https://claude.ai/artifact/Rrq4YVAH631CsABfiyZWHG).
    - **Aprovação:** o professor aprovou a prévia em 19/10 (*"Pode fazer tudo"*), sem
      mandar o zip dos originais.
      - Por isso as 22 traduzidas não foram conferidas lado a lado com o original. Fica
        opcional, se o zip vier.
      - Na Matfin 40-1, o rótulo "Úlcera do calcanhar – geralmente neuropática" pode ser
        "neuroisquêmica" no original.
    - **Envio:** os 51 arquivos de `prontas/` foram para `endodirect-assets/resumos/livros/`
      pela `subir-figuras-livros`, que voltou a responder 410. Conferidos byte a byte pela
      URL pública.
    - **Gravação:** em 4 instruções de 4 capítulos cada (ver "Gravações feitas").
  - **Lote de tireoide, obesidade e osteometabolismo (19–20/10): gravado em 20/10** (ver
    "Gravações feitas"). A parte 2 de tireoide (42 figuras) chegou em 20/10 e está em
    revisão, como lote à parte.
    - **Origem:** bucket `livros`, zips `_PT` de tireoide (só a parte 1, porque o
      "parte1" veio duas vezes), obesidade e osteometabolismo, com 190 figuras. O professor pediu *"Ja pode fazer agora"* em vez de esperar a
      renovação semanal.
    - **Revisão:** 17 lotes, um agente por lote, em duas levas. Ver `INSTRUCOES.md`,
      `monta.js` e `ajustes.json` na pasta da sessão (`figuras-tob/`). Toda acusação grave
      foi conferida na imagem e no texto do capítulo antes de aceitar.
    - **Resultado:** 105 entram em 31 capítulos (65 traduzidas); ficam de fora 85:
      - 22 contradizem o capítulo ou têm erro de conteúdo;
      - 27 repetem uma figura melhor;
      - 35 tratam de assunto que nenhum capítulo cobre;
      - 1 para conferir no livro (Williams 11.9, eixo do T4 livre).

      Lista em `scratchpad/figuras-livros/figuras-tireoide-obesidade-osteo.js` (já no
      `texto.js`).
    - **Rótulos corrigidos (15), com `corrige-tob.py`:**
      - Apovian 2.6: captação de glicose no coração ↓ → ↑;
      - Netter 2-16: tireoidite "aguda" → "subaguda";
      - Apovian 3.1: DHEM, SOMP (antiga SOP) e cânceres sem colo do útero e próstata;
      - Vilar 31.1: "gente" → "gene" e "Prejuízo";
      - Williams 12.10: "P13K" → "PI3K";
      - Golan 26.5: "Tioaminas" → "Tionamidas";
      - Vilar 76.1: sai o rótulo repetido sob o fígado saudável;
      - Essencial 89.5: "biliodigestiva" → "biliopancreática" e o "íleo" cortado;
      - Igaz 24.2: sai o aviso do densitômetro;
      - Vilar 86.7: Z "Média para a idade";
      - Netter 6-4: 80–85%, 10–15% e < 1% (os números do cap. 104);
      - Netter 6-5: NEM1 sem tireoide;
      - Netter 6-6: "Mieloma múltiplo" sem o linfoma;
      - Netter 6-21: "tórax em quilha";
      - Netter 6-23: saem 4 linhas de chamada sem rótulo e o fio da moldura.
    - **Ferramentas novas no `corrige-tob.py`:**
      - `nitidez`: o texto refeito saía mais claro que o do livro, e escurecer a tinta
        média engrossava o traço; a rampa na cobertura afina a borda sem engrossar;
      - `risco`: apaga linha fina interpolando os dois lados;
      - `junta`, `desloca`, `linhas`, `replica`, `move` e `corta`.

      O `prepara.py` ganhou `corte` (moldura do PDF na Diretriz 2025, fig. 1).
    - **Conferências:**
      - `previa.js` nos 31 capítulos (390 e 1280 px): todas as figuras carregam, cabem e
        ficam logo depois do trecho.
      - Avisos só os conhecidos: o ampliador no celular e uma "deformação" de 1,9% numa
        figura larga, que é a borda de 1 px entrando na medida.
      - O contêiner perdeu o Pillow e o numpy ao reiniciar: `pip install pillow numpy`
        antes de rodar.
    - **Prévia:** [Figuras de Tireoide, Obesidade e Osteometabolismo](https://claude.ai/artifact/VKAPr6P3dJ6KfFW34W77hQ).
    - **Aprovação (20/10):** *"da minha parte, pode prosseguir"*. A Williams 39.1 (mancha
      branca sobre uma seta) e a 39.4 (foto com tarja só nos olhos) ficaram como na prévia,
      porque as duas perguntas não tiveram resposta.
    - **Envio:** 105 arquivos para `endodirect-assets/resumos/livros/` pela
      `subir-figuras-livros`, que voltou a responder 410; conferidos byte a byte pela URL
      pública.
  - **Parte 2 de tireoide (20/10): gravada em 21/10** (ver "Gravações feitas").
    - **Origem:** `Tireoide/imagens_tireoide_PT_parte2.zip` (bucket `livros`), 42 figuras das
      seções 05 a 08 (tireoidites, nódulos, câncer, gestação e emergências), em 4 lotes
      (`t5` a `t8`), um agente por lote. Toda acusação grave (11) foi conferida na imagem e
      no texto dos capítulos 81, 83, 84, 85, 86 e 87.
    - **Capítulos exportados de novo** antes de montar (`exportar-capitulos`, depois 410): 79,
      83, 85 e 142 tinham mudado com a gravação da parte 1. Os md5 bateram com os gravados.
    - **Resultado:** 23 entram em 8 capítulos (79, 81, 83, 84, 85, 86, 87 e 142), 15
      traduzidas e 9 com rótulo corrigido; 19 ficam de fora:
      - 9 contradizem o capítulo ou têm erro de conteúdo (entre elas a Vilar 22.13, com cinco
        pontos contra o cap. 81, a Vilar 33.4, contra a ATA 2026 do cap. 86, e a Igaz 13.3,
        que condiciona a tempestade tireoidiana aos exames);
      - 8 repetem o que já está no capítulo ou acrescentam pouco;
      - 1 trata de assunto que nenhum capítulo cobre (ultrassom em modo B da subaguda).
      - A Williams 14.6 (modelo BRAF-like × RAS-like) ficou de fora na prévia, por uns 20
        rótulos em inglês. Na aprovação, o professor a quis assim mesmo (*"pode deixar em
        inglês essa"*), e ela entrou no 81 com as siglas explicadas na legenda. Total: 24 em
        8 capítulos, 10 com correção e 18 fora.

      Lista em `scratchpad/figuras-livros/figuras-tireoide-parte2.js` (já no `texto.js`).
      Na sessão: `monta-p2.js`, `lista-p2.json`, `prontas-p2/` e `pagina-p2/`.
    - **Rótulos corrigidos (9), com `corrige-tob.py`:**
      - Vilar 34.3: "Hipertireoidismo" → "Tireotoxicose"; saem os números do eixo (punham a
        fase tireotóxica em ~3,4 meses; o cap. 85 diz 2–8 semanas) e "Meses" → "Tempo";
      - Netter 2-25: "Sítios menos comuns de metástase" (fígado e rim) → "Fígado: comum; rim:
        raro"; "nódulos discretos" → "bem definidos";
      - Vilar 25.2: esvaziamento "nível IV" → "VI" (o I e o V trocados de lugar com os glifos
        da própria figura) e "634,883" → "C634, A883F";
      - Williams 14.2: "Margem anterior" → "inferior" da cricoide; sai a letra "A" sem "B";
      - Greenspan 24-2: sai "Fluxo noturno" (sem sentido clínico claro) e um ponto solto;
      - Williams 22.1: "UI/L × 1.000", vírgula decimal e "TSH" sem o "h";
      - Netter 2-22: o gráfico de febre em °F perde os números; sai uma linha de chamada solta;
      - Williams 12.24: refeito o trecho de curva que o fundo do rótulo apagava;
      - Vilar 24.2: sai o asterisco sem nota.
      - Williams 14.6: as siglas ficam em inglês e saem só os remendos da tradução. Na caixa
        "Carga mutacional aumentada", volta o degradê e a borda, e o texto fica centrado.
        Atrás de "PDCA, RAS-like", sai o retângulo liso.
    - **Ferramentas novas no `corrige-tob.py`:**
      - `traco`: refaz trecho de curva, pintando só sobre pixel claro;
      - `gira`: corrige rótulo vertical girando a caixa;
      - `permuta`: troca letras de lugar com os glifos da própria figura. Serve quando o texto
        do livro é borrado e a fonte redesenhada sai mais escura que o resto da linha.
      - `refundo`: tira o remendo de tradução (retângulo liso ou branco sobre o degradê). O
        texto sai como cobertura sobre o fundo do remendo, o degradê volta pela linha de
        referência e o texto é recolocado, centrado se preciso.

      O despacho das operações virou a função `aplica`.
    - **Conferências:** `previa.js` nos 8 capítulos (390 e 1280 px), com as figuras da parte 1
      junto (`prontas-todas/`). Todas carregam, cabem e ficam logo depois do trecho. Avisos só
      os conhecidos (ampliador no celular e a "deformação" de 1,9% da Vilar 31.4, da parte 1).
    - **Prévia:** [Figuras de Tireoide, Parte 2](https://claude.ai/artifact/W8g7X9zJD9TMUhiFH4QkCZ).
  - **2º lote da Endocrinologia Básica, fisiologia de cada glândula (23–24/10): gravado em
    24/10** (aprovação do professor: *"Aprovo tudo"*; ver "Gravações feitas").
    - **Origem:** as 49 figuras do zip `imagens_endocrinologia_basica_PT` que ficaram fora do
      lote 1 (47 de fisiologia, mais as Williams 16.1 e 11.6, que vieram cortadas).
    - **Capítulos exportados de novo** (`exportar-capitulos`, depois 410): 97, das posições
      77–109, 116–172, 220–224, 227 e 228.
    - **Revisão:** 7 lotes, um agente por lote (`figuras-eb2/INSTRUCOES.md` na sessão), com a
      tradução comparada ao original rótulo por rótulo e a lista das 199 já gravadas, para não
      repetir figura nem assunto.
    - **Resultado:** 34 entram em 31 capítulos (32 traduzidas, 2 do Guyton já em português); 15
      ficam de fora:
      - 3 com erro de conteúdo: a Netter 6-2 (a tradução pôs "reabsorção óssea" onde o original
        aponta a reabsorção tubular de cálcio), a Netter 5-4 ("Gs" no receptor que ativa a PLC,
        que é Gq) e a Molina 1-1 (vasopressina e ocitocina entre os inibidores);
      - 8 repetem uma figura melhor;
      - 3 tratam de assunto que nenhum capítulo cobre;
      - a Williams 11.6 aguarda recorte novo (faltam ~180 px embaixo; o PDF do Williams no
        Drive tem 68 MB, acima dos 10 MB do conector).

      Lista em `scratchpad/figuras-livros/figuras-fisiologia-glandulas.js` (já no `texto.js`).
      Na sessão: `monta-eb2.js`, `ajustes.json` (5 decisões minhas sobre colisões de trecho),
      `prepara-eb2.py`, `prontas/` e `pagina/`.
    - **Consertos (19 figuras), com `corrige-eb2.py`:** as operações ficam em
      `correcoes-eb2/*.json`, uma lista por grupo, para três agentes trabalharem em paralelo
      (`figuras-eb2/CORRECOES.md` na sessão). Os que mudam o sentido:
      - Williams 19.8: "Via Δ4" e "Via Δ5" trocadas já no livro (`troca_caixas`, só os
        algarismos);
      - Guyton 78-2: "21β-Hidroxilase" → "21-Hidroxilase" (erro do livro), com os glifos da
        figura;
      - Molina 7-5: a seta em degrau da fosforilase-cinase até a fosforilase b, cortada pelo
        remendo, voltou;
      - Netter 4-23: veio deitada (`girahor`) e "Lactância" → "Lactente".

      Os outros são acabamento (caixas opacas, contornos e setas apagados, restos de texto em
      inglês). Uma figura só aparada (Netter 3-5) não vira "adaptada".
    - **Ferramentas novas no `corrige-eb2.py`:** `troca_caixas`, `girahor` e `restaura` (traz a
      arte do recorte em inglês, nas mesmas coordenadas, só nos pixels claros do remendo; nunca
      em caixa com texto em inglês).
    - **Defeito achado pela prévia:** os capítulos 94 (Adrenal) e 143 (Pediatria) têm o mesmo
      tema, "Hiperplasia Adrenal Congênita (HAC)", e o `texto.js` casava a figura só pelo tema:
      a do 94 ia para o 143. Agora casa pela posição e pelo tema.
    - **Conferências:** `previa.js` nos 31 capítulos (390 e 1280 px), com as 233 figuras de
      livros numa pasta só (`prontas-todas/`, links para as dos lotes anteriores). As 34 novas
      carregam, cabem e ficam logo depois do trecho. Avisos só os conhecidos (ampliador no
      celular e a "deformação" de 1,9% da Vilar 31.4).
    - **Prévia:** [Figuras de Fisiologia das Glândulas](https://claude.ai/artifact/FvC4tVCW9BKbzv8NicJv7v).
  - **Adrenal, neuroendocrinologia e lípides (24/10): gravado em 24/10, junto com o 2º lote**
    (mesma aprovação; ver "Gravações feitas").
    - **Origem:** três zips novos no bucket `livros` (pastas Adrenal, Neuroend e Lipides), 232
      figuras (79 + 80 + 73), baixados pela `baixar-livros` (depois 410). Sem recorte em inglês
      desta vez: a tradução foi julgada pela própria imagem. O índice de lípides lista 26 arquivos
      sem o `_PT` que o zip usa (casar tentando com `_PT`) e não traz `status_traducao` (com `_PT`
      = traduzida; sem, já em português ou sem texto). Fontes novas: Endocrine Hypertension
      (Pappachan), Endocrine Emergencies (Loriaux), revisões (NEJM, JAMA, J Clin Med, Feingold e
      Chait) e diretrizes (ES 2016/2018/2020, ESE 2016, SBC 2017 e 2025).
    - **Revisão:** 13 lotes (`figuras-an/INSTRUCOES.md` na sessão), sobre os 60 capítulos
      candidatos já com as figuras do 2º lote inseridas. Regra nova: diretriz conferida contra a
      que o capítulo usa (a ESE 2016 de incidentaloma, a SBC 2017 e o algoritmo AHA/ACC 2018 ficaram
      de fora por isso), foto de paciente com rosto = grave, e troca de sigla só para a do capítulo.
    - **Resultado:** 101 entram em 29 capítulos (34 adrenal, 38 neuro, 29 lípides); 131 ficam de
      fora (erro de conteúdo ou diretriz superada, repetição, assunto sem capítulo e 4 por
      curadoria nos capítulos cheios: Cushing com 8, Hipertrigliceridemias e Hipercolesterolemias
      Primárias com 7). Lista em `scratchpad/figuras-livros/figuras-adrenal-neuro-lipides.js`,
      no `texto.js` desde a aprovação, depois da do 2º lote. Na sessão: `figuras-an-scripts/` (`monta-lotes.py`, `monta-an.js`,
      `lista-cap.js`, `monta-correcoes.js`, `prepara-an.py`), `figuras-an/ajustes.json`
      (curadoria e 14 legendas acertadas às siglas que ficaram na figura), `prontas/` e `pagina/`.
    - **Consertos (48 figuras), com `corrige-an.py`:** operações em `correcoes-an/c1–c4.json`.
      Ferramenta nova: `inverte` (exame de imagem que sai do PDF em negativo). 10 consertos mudam
      número, corte ou conduta para bater com o capítulo, cada um com a frase do capítulo que o
      sustenta (metanefrinas 4× o LSN; macroadenoma ≥ 10 mm; dose inicial de GH 0,1–0,3 mg/dia;
      DI nefrogênico < 10%; glicocorticoide EV imediato na apoplexia; "rastrear todos os
      hipertensos" no hiperaldosteronismo; ramo da RAR sem os cortes que o capítulo não usa; TG a
      partir de 150; SM com PA ≥ 130/85; SMRE sem o "grau 2" errado). Conversão de LDL-c de mmol/L
      para mg/dL (× 38,67) na figura da ES 2020, dita na legenda.
    - **Prévia:** [Figuras de Adrenal, Neuro e Lípides](https://claude.ai/artifact/4FCQK4oXCKMLXaTytxqsTs).
    - **Formato de arquivo:** o `monta-an.js` decide jpg ou png pelo tamanho do arquivo
      **corrigido**, quando existe (`corrigidas-c1..c4/`), e não pelo do recorte original. A
      Pappachan 13-1 saía jpg na lista e png na pasta; achado na conferência antes do envio
      (101 de 101 batem agora).
  - **Desenho próprio:** onde o livro tiver figura equivalente, o recorte substitui o
    desenho; onde não tiver, o desenho fica.
  - **Origem dos livros:** estão no Drive, em Livros › Endocrino Geral (Williams,
    Greenspan, Vilar 8ª ed. 2024, Essencial em Endocrinologia).
    - O conector baixa arquivos de até 10 MB, e os livros têm de 30 a 68 MB.
    - Ele não lê o texto do Williams nem do Greenspan, e do Vilar lê só até o capítulo 5.
    - Por isso, o professor exporta as páginas (PDF de até 10 MB na pasta Plataforma ED)
      ou manda o print da figura.
- **Um arquivo por ilustração** (`ilus/<id>.js`), com:
  - capítulo (`tema`);
  - trecho depois do qual entra (`depoisDe`, que aparece uma vez só no capítulo);
  - título, subtítulo e legenda;
  - `lastro`.
- **Legenda: só a descrição da ilustração.** Por pedido do professor, em 17/10, sem a
  frase "Ilustração Endodirect a partir do texto do capítulo.".
- **Lastro abreviado.** O repositório é público, e o texto dos capítulos não entra
  nele. O trecho longo vai como "início … fim": o conferidor acha o início e, até 900
  caracteres adiante, o fim.

## Conferências (todas antes de gravar)

1. **`confere-lastro.js`.** Confere o lastro no capítulo, a inserção única e se todo
   número da ilustração está no capítulo. Num teste de mutação, reprovou um trecho
   alterado.
2. **`figuras-resumos/confere.js`**, no Chromium: procura texto sobreposto e traço
   cruzando texto.
3. **Revisor independente**, que classifica cada item (ok, inferida, sem apoio,
   contradiz). Toda acusação é conferida no texto antes de corrigir.
4. **`previa.js`.** Renderiza com o `mdToHtml` e o CSS reais do `index.html` em 390 e
   em 1280 px. No celular, o toque abre a figura no tamanho natural, com rolagem.

## Feito

| capítulo | ilustrações | estado |
|---|---|---|
| Receptores Hormonais e Transdução de Sinal (posição 150) | GPCR (Gs/Gi/Gq); quinases (insulina × GH, JAK-STAT); nucleares (tipo I × tipo II) | **no ar** (SVG #871; gravado em 17/10, 14h22 UTC — ver abaixo) |
| Hormônios: Classes, Síntese e Transporte (149) | síntese dos hormônios tireoidianos | SVG no ar (#871); falta o revisor e as outras ilustrações do capítulo |

## Lições

- **Gravar no máximo 4 capítulos por instrução (19/10).**
  - O `payload` tem 16,5 MB como texto (6,9 MB guardado). Cada `jsonb_set` encadeado
    remonta o documento inteiro.
  - A instrução única dos 16 capítulos passou dos 60 s do `execute_sql` e não gravou
    nada: sem backup, md5 iguais, sem consulta presa nem trava.
  - Em 4 grupos de 4, todas passaram. Cada grupo tem o próprio backup e as próprias
    guardas, então uma parte que falhe não deixa as outras pela metade.
- **Trocar uma palavra numa figura (`corrige-diabetes.py`, 18/10).**
  - Não chutar o corpo da fonte pela largura: a palavra nova sai fina e clara.
  - O que funciona: desenhar a palavra errada em Liberation Sans a 8× e procurar a
    fonte (normal ou negrito), o corpo, a espessura (em 1/8 de pixel), o desfoque e a
    posição que a reproduzem pixel a pixel. Depois, escrever a certa com os mesmos
    parâmetros.
  - Fixar a cor da tinta, a dos 2% de pixels mais escuros. Com a cor solta, o ajuste
    troca traço fino e escuro por grosso e claro.
  - O erro quadrático sozinho puxa para traço mais claro quando as letras não coincidem.
    Entre os ajustes até 4% piores que o melhor, ficar com o que tem a mesma
    quantidade de tinta do original.
  - Quando a mesma figura já tem o texto certo (a seta ↓ vizinha, o "< 70 mg/dℓ" da outra
    coluna), copiar os pixels é melhor que desenhar.
  - Conferir a caixa numa grade ampliada antes: na 1ª tentativa, a troca da 63.5 caiu na
    linha de baixo.
- **O script do app é uma função autoexecutada.** Para a prévia extrair as funções:
  - é preciso descer no corpo da função;
  - as variáveis vão na ordem do código-fonte, porque o `RE_IMG_BLOCO` usa o
    `mdAltRE`; fora de ordem, a figura cai num `<p>`.
- **A revisão das 3 ilustrações de receptores** achou 1 contradição (o hormônio sumia
  do dímero do tipo I) e 6 itens sem apoio no texto, todos corrigidos:
  - fosfato na JAK2;
  - alvo da SOCS;
  - conversão T4→T3 dentro da célula;
  - "transcrição" na via JAK-STAT;
  - pontes S–S só entre as α;
  - PLC-β atravessando a membrana.
- **O capítulo 150 se contradiz:**
  - diz que os receptores de membrana agem "sem depender de transcrição";
  - mas, na via JAK-STAT, a STAT migra ao núcleo;
  - e a tabela põe os ligados a quinases em "minutos a horas".

  A ilustração não desenha transcrição. Falta sugerir ao professor um ajuste no texto.

## Gravação no banco

- **Onde:** `endodirect_global_state` (id `main`), em
  `payload.diretrizes[<posição>].resumo`.
- **Cuidados:**
  - backup antes;
  - guarda pelo md5 do `resumo`;
  - conferência de que só o `resumo` mudou;
  - depois, aviso de F5 ao professor.
- **Posições de Endocrinologia Básica:** 149, 150, 151, 152, 153 e 223.

### Gravações feitas

- **Capítulo 150, 17/10/2026, 14h22 UTC.**
  - Backup: `endodirect_global_state_backup`, id `main-antes-ilustracoes-cap150-2026-10-17`.
  - O `UPDATE` faz `replace()` no servidor. Só as âncoras e as linhas de imagem vão no SQL; o texto do capítulo não trafega.
  - Guardas: o md5 de antes (`69bd171b…`) e o md5 esperado depois (`b64382f4…`, igual ao texto da prévia).
  - Conferido na mesma instrução: o resto do item, os outros 232 itens e o estado fora de `diretrizes` ficaram idênticos.
  - Gerador do SQL: o protótipo do `gera-sql.js` (ver abaixo).
- **Capítulo 150, legendas, 17/10/2026.** A frase "Ilustração Endodirect a partir do
  texto do capítulo." saiu das 3 legendas, a pedido do professor.
  - Backup: `main-antes-legendas-cap150-2026-10-17`.
  - md5 `b64382f4…` → `adf74b87…`.
  - Só o `resumo` mudou.
- **O gerador agora está no repositório:** `scratchpad/ilustracoes/gera-sql.js`.
  - Monta as trocas por `replace()` no servidor: para ilustração nova, a âncora; para
    ilustração já gravada, a linha da imagem inteira, com a legenda atual.
  - Confere que as trocas reproduzem a prévia (`texto.js`).
- **Figuras de diabetes, 19/10/2026, das 00h22 às 00h28 UTC.** 51 figuras em 16
  capítulos, gravadas em 4 instruções de `gera-sql.js` (a de 16 capítulos estourou o
  tempo; ver "Lições").

  | parte | capítulos | backup (`main-antes-figuras-diabetes-2026-10-19-…`) | md5 antes → depois |
  |---|---|---|---|
  | 1 | 127–130 | `parte1` | 127 `447372ff` → `9174744f`; 128 `4b717dc5` → `9c764c32`; 129 `f12064bc` → `70adde69`; 130 `75b1e95f` → `f9d4f87c` |
  | 2 | 131–134 | `parte2` | 131 `d8a587f3` → `c569b512`; 132 `cf9e4072` → `b79b2ef1`; 133 `79a49efd` → `3da40d92`; 134 `ab841931` → `4ef268a1` |
  | 3 | 135, 137, 138, 221 | `parte3` | 135 `9c02c14f` → `391dcf75`; 137 `7668d90f` → `4d2f405f`; 138 `3d9a05b9` → `5617c25b`; 221 `87b887de` → `f02df9dd` |
  | 4 | 222, 224, 227, 231 | `parte4` | 222 `f3ad1708` → `7a765980`; 224 `92b2adaf` → `661f636c`; 227 `b10356c8` → `4d2ff4cf`; 231 `c5d2855f` → `8e8741c7` |

  - Cada instrução conferiu: o backup, os md5 de depois, o resto de cada item, os outros
    itens, o estado fora de `diretrizes` e o número de itens. Tudo verdadeiro nas 4.
  - Conferido depois: os 16 md5, os 4 backups e as 51 figuras, uma vez cada. O acervo
    tem agora 70 figuras de livros (19 do lote 1 e 51 de diabetes).
  - Nenhum save do cliente entre as 4 partes. Professor avisado do F5.
  - ✅ **Conferência de zumbi (01h31 UTC):** os 16 md5 e as 51 figuras seguem os gravados.
    Os dois saves seguintes (00:34 e 01:24 UTC, ambos do Prof. Rafael) já carregaram a
    versão nova.
- **Figuras de tireoide, obesidade e osteometabolismo, 20/10/2026, das 20h27 às 20h35
  UTC.** 105 figuras em 31 capítulos, em 8 instruções de `gera-sql.js` com até 4 capítulos
  cada. Backups `main-antes-figuras-tob-2026-10-20-g1` a `g8`.

  | grupo | figuras | md5 antes → depois |
  |---|---|---|
  | g1 | 15 | 67 `1e19c636` → `531a1988`; 68 `87d95417` → `e2b0ab39`; 69 `9bc187f2` → `bf1ff587`; 70 `26bdaee2` → `efb9988a` |
  | g2 | 13 | 71 `efd198e5` → `4459ea3f`; 72 `55f3b8b4` → `8f3b8617`; 73 `b5484ee1` → `1dd6ec79`; 74 `84f7bbf6` → `b16057f1` |
  | g3 | 13 | 75 `66369633` → `b9c19c5c`; 76 `d4a43869` → `179abcc9`; 77 `78b824fc` → `975d24c5`; 78 `4d02e0b7` → `c6b58fac` |
  | g4 | 12 | 79 `83fc3cd2` → `9815d41e`; 80 `ca85d09e` → `e437e330`; 82 `d98a4139` → `9a869d53`; 83 `84c07811` → `e9378674` |
  | g5 | 20 | 85 `5864c634` → `e6a32a78`; 88 `ee0d6348` → `0df77e3d`; 103 `47ab0ce0` → `270a0f25`; 104 `1542f26c` → `2ff265e5` |
  | g6 | 14 | 105 `d901116e` → `bc1c0c49`; 106 `eec74816` → `b9d6f4a9`; 107 `9b5964a8` → `db6f8875`; 108 `ddef14ff` → `19e3b959` |
  | g7 | 10 | 109 `c38d80f1` → `5dd222bd`; 142 `a4d16ae3` → `7c001f6b`; 145 `c3cae4d9` → `66ec9f83`; 146 `b0b0f5ad` → `a7a14034` |
  | g8 | 8 | 147 `bbffa783` → `7362cc93`; 217 `fd43b021` → `f72cb8f9`; 225 `7bb87fc4` → `f226522e` |

  - Antes do g6, a legenda da Matfin 23-2 ganhou o espaço que faltava em "(PO4): PTH".
    O SQL do grupo foi refeito (`grava-6b.sql`) e a lista do repositório, corrigida.
  - Cada instrução conferiu o backup, os md5 de depois, o resto de cada item, os outros
    itens, o estado fora de `diretrizes` e o número de itens. Tudo verdadeiro nas 8.
  - **Conferido no fim:** as 105 figuras aparecem uma vez cada, os 31 md5 estão certos e
    os 8 backups existem. O acervo tem agora 175 figuras de livros (19 + 51 + 105).
  - Às 20h32 entrou um save do radar do Mural (cron das 20h), entre o g5 e o g6. O radar
    relê o estado logo antes de gravar (`lib/radar.js`) e não desfez nada.
  - ✅ **Conferência de zumbi (20h38 UTC):** os 31 md5 seguem os gravados.
- **Cap. 86, tempo do Graves no puerpério, 20/10/2026, 23h38 UTC.** Pedido do professor sobre
  a Williams 12.24: *"mantenha a informação condizente com a figura"*. Na figura, a curva do
  Graves sobe a partir do 3º mês. A tabela "Tireotoxicose no puerpério" e o ponto-chave 30
  diziam "tardia (>6 meses)" e passaram a dizer "em geral >6 meses; pode começar a partir do
  3º mês".
  - A literatura sustenta as duas partes (Kuma Hospital): 83% dos Graves pós-parto começam a
    partir do 6º mês, mas o início vai de 2 a 12 meses (Ide 2017, doi 10.1186/s13044-017-0039-0;
    Ide 2014, doi 10.1089/thy.2013.0585).
  - Backup `main-antes-cap86-graves-puerperio-2026-10-20`; md5 `f96792c2` → `9c35b512`.
    Conferido que só o `resumo` e o `pts[29]` mudaram.
  - ⚠️ A 1ª tentativa estourou os 60 s do conector sem gravar nada (sem backup, md5 igual).
    Coincidiu com saves do painel entre 23h30 e 23h32 UTC. A 2ª passou.
- **Parte 2 de tireoide, 21/10/2026, 00h22 e 00h24 UTC.** 24 figuras em 8 capítulos, em 2
  instruções de `gera-sql.js`. Backups `main-antes-figuras-tireoide-p2-2026-10-21-g1` e `g2`.

  | grupo | figuras | md5 antes → depois |
  |---|---|---|
  | g1 | 14 | 79 `9815d41e` → `ef21f770`; 81 `1a2c485c` → `1ef38ba9`; 83 `e9378674` → `cae5c4f9`; 84 `88c9884c` → `d3066567` |
  | g2 | 10 | 85 `e6a32a78` → `450c5ffd`; 86 `9c35b512` → `a8762747`; 87 `568589ce` → `53980f64`; 142 `7c001f6b` → `9e07f8e6` |

  - Envio: 24 arquivos pela `subir-figuras-livros` (depois 410), conferidos byte a byte.
  - Cada instrução conferiu o backup, os md5, o resto de cada item, os outros itens, o estado
    fora de `diretrizes` e o número de itens. Tudo verdadeiro nas 2.
  - **Conferido no fim:** as 24 aparecem uma vez cada; o acervo tem 199 figuras de livros,
    todas distintas; os 35 capítulos com figura das partes 1 e 2 estão com o md5 certo.
- **2º lote e adrenal, neuroendocrinologia e lípides, 24/10/2026, das 22h17 às 22h29 UTC.**
  Aprovação do professor: *"Aprovo tudo."* (as duas prévias). 135 figuras (34 do 2º lote e
  101 de adrenal, neuro e lípides) em 48 capítulos, em 12 instruções de `gera-sql.js` com até
  4 capítulos cada. Backups `main-antes-figuras-an-2026-10-24-g01` a `g12`.

  | grupo | md5 antes → depois |
  |---|---|
  | g01 | 77 `975d24c5` → `76b35ba4`; 79 `ef21f770` → `8bdd8e0f`; 89 `02aa2a4c` → `7d0cac65`; 90 `bab2dd43` → `b24fae7a` |
  | g02 | 91 `875efd7c` → `97cef938`; 92 `f46b4ca6` → `d79d3161`; 93 `89cc2a07` → `a6a81a1f`; 94 `e168de8a` → `70bc9622` |
  | g03 | 95 `2259e4ac` → `59e81ae9`; 96 `c6909076` → `0026ed5f`; 97 `2923487e` → `6de80a0e`; 98 `c393311c` → `a5ba679a` |
  | g04 | 99 `45d244b9` → `4ab69223`; 100 `08e45876` → `3b440105`; 101 `a4bbb88c` → `fddb0fef`; 102 `97343125` → `2097ab4c` |
  | g05 | 107 `db6f8875` → `0741fdd4`; 109 `5dd222bd` → `12e9fbe2`; 110 `46dd6410` → `516a7401`; 111 `eb557677` → `23f42173` |
  | g06 | 112 `ea91a5e1` → `73a427e4`; 113 `3d2d03bf` → `65210bee`; 114 `85b12bf9` → `5b077523`; 115 `e27c5bdf` → `157f6ee2` |
  | g07 | 116 `8dc9f66d` → `e189df5c`; 118 `f2d93d40` → `58a2632a`; 121 `a95fd5db` → `b8579af3`; 123 `c112845d` → `969594a5` |
  | g08 | 128 `9c764c32` → `b763c3f8`; 129 `70adde69` → `b798658c`; 139 `cf91bd64` → `340281c3`; 143 `afa970fb` → `2c9fc07a` |
  | g09 | 144 `3ad28bf5` → `71464457`; 147 `7362cc93` → `f111a420`; 148 `13f2738f` → `4b7fc75c`; 149 `416c1c7c` → `b27f4a19` |
  | g10 | 150 `a5a99495` → `8fa2a16a`; 151 `891f49b2` → `725b7920`; 152 `5fb2f669` → `6139f714`; 153 `2d0148fb` → `fb932c0f` |
  | g11 | 154 `d8771107` → `2c68bb7d`; 159 `47a6c0d9` → `c76ecb36`; 160 `5a8fe36c` → `e715f9e7`; 161 `5b78d856` → `87fffdaf` |
  | g12 | 163 `e33f7f17` → `29865389`; 165 `ac2f44e7` → `1d32dba5`; 166 `bc0edc45` → `05bd1bcf`; 220 `652e030d` → `6c93d7f7` |

  - **Antes de gravar:** os 48 capítulos foram exportados de novo (`exportar-capitulos`,
    depois 410) e eram idênticos às bases das prévias. As 135 imagens subiram pela
    `subir-figuras-livros` (nome conferido por regex, sem sobrescrever; depois 410), todas com
    200 e conferidas byte a byte. O token desta rodada foi apagado.
  - Cada instrução conferiu o backup, os md5 de depois, o resto de cada item, os outros itens,
    o estado fora de `diretrizes` e o número de itens. Tudo verdadeiro nas 12.
  - **Conferido no fim:** os 48 md5 estão certos; as 135 figuras aparecem uma vez cada, no
    capítulo esperado; os 12 backups existem; o acervo tem 334 figuras de livros (199 + 135).
    Os 135 endereços públicos respondem 200 (53 JPG e 82 PNG, 45 MB).
  - Nenhum save do painel durante a gravação: o `updated_at` ficou no g12 e os logs não têm
    escrita no estado global desde as 22h UTC. Um acesso às 22h30 já carregou a versão nova.
  - ✅ **Conferência de zumbi (22h45 UTC):** os 48 md5 seguem os gravados e o acervo segue com
    334 figuras de livros; nenhum save desde o g12.
  - ✅ **2ª conferência de zumbi (23h59 UTC):** os 48 md5 seguem; o do 113 já é o `85221a96`,
    da mudança feita de propósito na HF às 23h54. Seguem também as 334 figuras e os 12 backups.
    Os dois saves do painel (23h46 e 23h58 UTC) já carregaram a versão nova.
