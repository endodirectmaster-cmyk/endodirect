# Figuras didáticas dos Resumos

- `ESPECIFICACAO.md` — como descrever uma figura (o que os agentes leem).
- `specs/*.json` — a especificação de cada capítulo (conteúdo autoral, regenerável).
- `render.js` — especificação → SVG em `figuras/resumos/<sub>--<tema>.svg`.
- `confere.js` — mede o texto no Chromium (sobreposição, corte, fora da área) e grava PNG.
- `galeria.js` — página de revisão com todas as figuras.
- `inserir.js` — gera o UPDATE que grava `figuras: [{titulo, url, fonte}]` no capítulo
  (só URL: o SVG é estático, o payload cresce ~200 bytes por capítulo).

Regenerar tudo: `node scratchpad/figuras-resumos/render.js scratchpad/figuras-resumos/specs/*.json`.
