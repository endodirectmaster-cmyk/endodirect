---
tags: [cofre, conteudo, resumos]
atualizado: 2026-10-20
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
