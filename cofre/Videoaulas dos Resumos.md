---
tags: [cofre, resumos, video]
atualizado: 2026-11-03
---

# Videoaulas dos Resumos

Pedido do professor (02/11/2026), com print do capítulo de Hiperaldosteronismo Primário e um vídeo
de exemplo: *"Insira ao lado de 'Mapas mentais' o botão de 'Videoaulas'. Dentro dela, iremos
inserir aos poucos pequenos vídeos (como o exemplo em anexo) de no máx 15 min cada."*

## Como funciona

- **Dado:** campo `videos` do item em `payload.diretrizes[pos]`, lista de
  `{titulo, src, dur?, path?, at}`. `dur` em segundos, `path` é o caminho no Storage (quando o
  arquivo foi enviado para lá) e `at` é a data em ms. Entrada sem `src` é ignorada.
- **Entrega ao aluno:** `endodirect_member_resumos` devolve o item inteiro, então o campo
  chega sem mudança no servidor. Vale a regra de sempre: o assinante vê todos os capítulos; quem
  não assina vê um capítulo de amostra por subespecialidade, e nele a aba aparece com 🔒.
- **Aba do aluno (`diretrizesViewHTML`):**
  - aparece só na aba **Resumos**, fora dos artigos;
  - aparece só quando o capítulo tem ao menos um vídeo;
  - vem depois de "🧠 Mapas mentais", como **🎬 Videoaulas**.
  - Sem vídeo, `refFormat` volta para `resumo`, e o capítulo segue com as três abas de antes.
- **Player (`dirVideoPlayerHTML`):**
  - arquivo (Storage) em `<video controls playsinline preload="metadata">`, com `#t=0.1` no fim
    do `src` para o iPhone mostrar o 1º quadro;
  - `.m3u8` (Bunny) vai em `data-hls` e é montado por `montarVideosHls`: no Safari toca nativo;
    nos outros navegadores usa hls.js, que chega por `defer`, e a montagem tenta 20 × 500 ms;
  - YouTube e Vimeo em iframe;
  - um link que não é http(s) não vira player.
  - Título e `src` passam por `esc`.
- **Painel (`admRefSecHTML` → `admRefVideoHTML`):**
  - a aba aparece em todo capítulo dos Resumos, para o professor adicionar;
  - cada vídeo tem o player, o título editável (💾), botões ↑ ↓ e 🗑;
  - "＋ Nova videoaula": título e arquivo **ou** link.
  - O arquivo sobe com `uploadAdminAssetResumable(arq,'resumos/videos',…)`: TUS a partir de
    20 MB, com barra de progresso, em `endodirect-assets/resumos/videos/AAAA-MM-DD/<ms>-<nome>`.
  - Acima de 15 min, o painel pede confirmação.
  - A gravação passa por `persistDiretrizes()`, que faz o merge por item do save do painel.
- **Teste:** `scripts/test-videoaulas.js` (ci-validate 17c-undecies-o). Harness no Chromium com
  o vídeo real servido localmente: abas, player, capítulo sem vídeo e editor, no notebook e no
  celular, sem rolagem lateral. O Chromium do Playwright não tem H.264 (dá erro 4 no `<video>`),
  então a reprodução em si só se confere num navegador de verdade.

## Vídeos gravados

| Capítulo | Vídeo | Duração | Arquivo |
|---|---|---|---|
| 91, Hiperaldosteronismo Primário | Rastreio do hiperaldosteronismo primário | 11:13 (673 s) | `resumos/videos/2026-11-02/1793663784222-rastreio-hiperaldosteronismo-primario.mp4` (26,5 MB, 1080p H.264/AAC, faststart) |

- **Envio do exemplo (02/11):**
  - a `subir-figuras-livros` (v17) foi reativada com token novo (só o sha256 no código) e prazo
    de 60 min;
  - ela devolveu só uma URL assinada de envio (`createSignedUploadUrl`, sem sobrescrever) para
    aquele caminho;
  - o arquivo foi por `PUT` direto ao Storage, sem passar pela função;
  - em seguida a função voltou ao 410 (v18) e o token foi apagado.
  - Conferido pela URL pública: 200, `video/mp4`, 26.479.880 bytes, `Range` (206) e sha256 igual
    ao do arquivo.
- **Gravação:**
  - backup `main-antes-videoaula-cap91-2026-11-02`;
  - guardas: md5 do item, tema, sem `videos` antes e 233 itens;
  - conferido que só `videos` mudou no item e que os outros itens e o resto do payload ficaram
    iguais.

## Pontos de atenção

- Vídeo grande no Storage gasta banda de saída do Supabase. Se as videoaulas crescerem muito,
  avaliar mandar para o Bunny (como as aulas dos cursos) e colar o `.m3u8` no campo de link; o
  player já aceita.
- Excluir a videoaula no painel tira o item da lista, mas **não apaga o arquivo** do Storage.
