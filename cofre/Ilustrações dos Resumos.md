---
tags: [cofre, conteudo, resumos]
atualizado: 2026-10-18
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
