---
tags: [cofre, conteudo, resumos]
atualizado: 2026-10-17
---

# Figuras dos Resumos

Pedido do professor (15/10/2026): *"a maioria dos capítulos dos resumos estão sem
figuras didáticas. Poderia inserir?"* Em 16/10, os 115 capítulos que não tinham
figura ganharam uma cada (os outros já tinham figura própria).

## Como a figura nasce

- **Especificação, não desenho.** Cada figura é um JSON em
  `scratchpad/figuras-resumos/specs/<nº>-<sub>--<tema>.json` (tipos `fluxo`, `painel`,
  `escada`, `linha_tempo`, `espectro`, `curvas`, `ciclo`). Quem escreve decide **o
  que** mostrar; `render.js` decide posição, quebra de linha, cor e tamanho, iguais
  para todas. Regras em `scratchpad/figuras-resumos/ESPECIFICACAO.md`.
- **Regra de conteúdo:** tudo o que a figura afirma está no texto do capítulo (mesmos
  números, cortes, fármacos e direção causal); nada de conhecimento externo; a figura
  cobre outro ângulo quando o capítulo já tem fluxograma. O campo `lastro` guarda
  trechos literais curtos (até 25 palavras) que sustentam a figura.
- **Três conferências automáticas**, todas obrigatórias:
  `render.js` (largura ≤ 900 px, nós com caminho), `confere.js` (Chromium: sobreposição,
  texto cortado, fora da área; grava PNG) e `confere-texto.js` (número da figura que
  não está no capítulo; trecho do lastro que não está literalmente no capítulo).
- **Onde mora:** SVG estático em `figuras/resumos/<sub>--<tema>.svg` (1,4 MB os 115);
  no banco, só `figuras: [{titulo, url, fonte}]` no item de `payload.diretrizes`
  (`inserir.js` gera o UPDATE, casando posição **e** tema, só onde não há figura).
  O app mostra com `dirFigurasHTML` (imagem com `max-width:100%`; o toque amplia).
- **No celular:** a figura cabe na coluna, mas encolhe para 40–50% (texto de ~6 px).
  O ampliador (`ensureLightbox`) abre **esquema SVG mais largo que a tela no tamanho
  natural, com rolagem**; foto continua cabendo na tela. O botão ✕ é escuro e fixo,
  para não sumir sobre a figura branca. Teste: `scripts/test-ampliar-figura.js` (5 de 5
  mutações barradas) e `scratchpad/figuras-resumos-navegador/check.js` (Chromium, 390 e
  1280 px: as 115 carregam e cabem; o ampliador rola no celular e cabe no notebook).

## Como foi feito (16/10)

1. **Desenho:** 34 lotes de 3 a 4 capítulos, um agente por lote, até 4 ao mesmo
   tempo, sempre um sentinela primeiro (regra dos 90% do uso). Cada agente gerava,
   conferia e olhava o PNG, no máximo 3 rodadas por figura.
2. **Conferência por revisor independente** (outro agente, que não desenhou), 8
   capítulos por revisor: cada afirmação da figura classificada em OK, inferida, sem
   apoio ou contradiz, e corrigida na especificação. Instruções em
   `scratchpad/fig-agentes/VERIFICACAO.md` da sessão (não versionado).
3. **Resultado da conferência:** 2.458 afirmações, 94,4% fiéis como desenhadas;
   **70 das 115 figuras corrigidas** (137 mudanças); nenhuma repete fluxograma.
4. **Gravação no banco (16/10, 21h UTC):** backup `endodirect_state_backup` id 15
   (`main-antes-figuras-resumos-2026-10-16`); posições e temas conferidos ao vivo antes
   (115 de 115). Conferência depois: 115 figuras, hash do conjunto igual ao calculado
   antes, 233 itens antes e depois, nenhum outro campo nem outra chave alterados. A
   função temporária `exportar-capitulos` virou stub 410.

**Galeria de revisão** (privada, do professor): https://claude.ai/artifact/XR2ZgeNxnWnfEy5B5z338G
— as 115 figuras por seção, cada uma com o que a conferência corrigiu.

## SOMP no lugar de SOP (17/10)

- As 5 figuras que escreviam SOP (especificações 121, 122, 126, 143 e 223) foram
  refeitas com SOMP, com os mesmos nomes de arquivo.
- ⚠️ **A 121 tem `slug` explícito na especificação.** O nome do SVG vem de `sub` +
  `tema`, e o tema do capítulo mudou para "Síndrome Ovariana Metabólica Poliendócrina
  (SOMP)". Sem o `slug`, o `render.js` gravaria outro arquivo, e a URL do campo
  `figuras` apontaria para o SVG velho.
- O `lastro` das 122 e 143 passou a citar a ponte "SOMP (antiga SOP)", que entrou na
  1ª menção do capítulo.

## Lições

- **O erro não estava nos números, estava nas setas.** A peneira de números e de
  lastro não acusou nada nas 115; o revisor achou 137 problemas de relação: seta
  causal entre fatos que o capítulo só lista lado a lado; causalidade invertida (DM1
  estágio 3 → deficiência de insulina); efeito do fármaco atribuído à célula
  (AGLP-1); ressalva perdida ("costumam", "podem", "baixos ou normais"); quantificador
  trocado ("a maioria" no lugar de "muitas"); lista com "ou" virando "e" (quadro misto
  CAD/EHH). **Manter a conferência semântica por revisor independente** em qualquer
  figura nova.
- **Nota lateral estoura a largura.** Quase toda figura que passou de 900 px tinha
  nota ao lado; a saída foi levar a nota para dentro do nó ou para a legenda.
- **O conector do Supabase travou (60 s, sem chegar ao banco) em todo UPDATE que levava
  o capítulo 157 (doping) no mapa**; os pedaços do texto, isolados, passavam. Resolvido
  com um `jsonb_set` direto na posição, guardado pelo md5 do tema. Gravação grande: em
  partes de ~10 KB, e conferir por hash ao fim.
- **Agentes gravando arquivos disparam o aviso de "mudanças não commitadas"** ao fim
  de cada turno; commitar o que já está gravado a cada etapa (o PR final é squash).

## Pendências

Ver [[Pendências]] (seção "🖼️ Figuras dos Resumos").
