# Ilustrações no meio dos capítulos

Ilustrações de mecanismo (receptores, síntese hormonal, transporte…) que entram **no
corpo do resumo**, logo depois do parágrafo de que tratam. São diferentes das figuras do
fim do capítulo (`scratchpad/figuras-resumos/`, campo `figuras`): aqui a imagem vira uma
linha de markdown dentro do próprio `resumo`, e o app a mostra com legenda e ampliador.

## Peças

- `lib.js` — primitivas desenhadas à mão em SVG (membrana, receptores, proteína G,
  núcleo, DNA, setas, barra de inibição, caixas, notas) e a moldura igual à das figuras
  do fim do capítulo (cartão branco, título, subtítulo, mesma paleta e fonte).
- `ilus/<id>.js` — uma ilustração por arquivo: `tema` (capítulo), `depoisDe` (trecho
  depois do qual a figura entra; precisa aparecer uma vez só), `titulo`, `subtitulo`,
  `legenda`, `lastro` e `desenhar()`.
- `lastro` — os trechos do capítulo que sustentam cada afirmação da ilustração. **O
  repositório é público e o texto dos capítulos não entra nele**: trecho longo vai
  abreviado como `início … fim` (as primeiras e as últimas palavras).
- `build.js [id]` — gera `figuras/resumos/ilustracoes/<sub>--<id>.svg` (veta `<image>`,
  `<script>`, `href`, estilos externos; largura até 820).
- `texto.js` — monta o texto do capítulo com as ilustrações (o mesmo para a prévia e
  para o banco); idempotente.

## Conferências (todas antes de gravar)

1. `node confere-lastro.js <pasta dos capítulos exportados> [id]` — lastro presente no
   capítulo, inserção única, todo número da ilustração presente no capítulo.
2. `PLAYWRIGHT_CORE=… node ../figuras-resumos/confere.js --png <pasta> <svgs>` — texto
   sobreposto, traço cruzando texto, foto PNG para olhar.
3. Revisor independente: confere cada rótulo, seta e agrupamento contra o capítulo
   (ok, inferida, sem apoio, contradiz). Toda acusação é conferida no texto antes de
   corrigir.
4. `PLAYWRIGHT_CORE=… node previa.js <capítulo.json> <pasta>` — renderiza com o
   `mdToHtml` e o CSS reais do `index.html`, no celular (390 px) e no notebook
   (1280 px): figura logo depois do trecho, com legenda, cabendo na coluna; no celular
   o toque abre no tamanho natural, com rolagem.

Os capítulos exportados ficam só na pasta temporária da sessão, nunca aqui.
