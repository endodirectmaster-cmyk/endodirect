---
tags: [cofre, resumos, video]
atualizado: 2026-11-07
---

# Videoaulas dos Resumos

Pedido do professor (02/11/2026), com print do capítulo de Hiperaldosteronismo Primário e um vídeo
de exemplo: *"Insira ao lado de 'Mapas mentais' o botão de 'Videoaulas'. Dentro dela, iremos
inserir aos poucos pequenos vídeos (como o exemplo em anexo) de no máx 15 min cada."*

## Como funciona

- **Dado:** campo `videos` do item em `payload.diretrizes[pos]`, lista de
  `{titulo, src, dur?, path?, at}`. `dur` em segundos, `path` é o caminho no Storage (quando o
  arquivo foi enviado para lá) e `at` é a data em ms. Entrada sem `src` é ignorada.
- **Entrega ao aluno:** `endodirect_member_resumos` devolve o item inteiro ao assinante
  (Standard ou Gold). Quem não assina recebe só a videoaula liberada de cada subespecialidade: ver
  "Degustação: uma videoaula por subespecialidade" abaixo (desde 07/11/2026).
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
- **Reprodução confirmada pelo professor (03/11):** *"Está rodando sim! Ja testei agora"*, com o
  vídeo do cap. 91 em produção.

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

## Degustação: uma videoaula por subespecialidade (07/11/2026)

Pedido do professor: *"Para o pessoal do plano Gold, obviamente, eles terão acesso a todas essas
videoaulas. Lá nos resumos. Para o pessoal do modo degustação, a ideia é que eles tenham acesso a
uma videoaula de cada subespecialidade. Então, por exemplo, pode escolher uma videoaula de
obesidade para deixar liberado para eles. E também assim das outras subespecialidades."*

- **Dado:** `degustacao: true` no vídeo (`diretrizes[pos].videos[j]`).
- **Painel:**
  - cada vídeo do editor tem o botão **🎁 Liberar na degustação**;
  - liberar um desmarca o que estava liberado **na mesma subespecialidade**, e clicar de novo tira
    da degustação (`admRefVideoAcao('deg', …)`);
  - o topo do editor diz qual está liberado na área (`admVideoLiberadoDaSub`).
- **Servidor (`endodirect_member_resumos`, `supabase/videoaulas-degustacao.sql`, migração
  `videoaulas_degustacao_uma_por_sub`):**
  - com plano: tudo, como antes (conferido: saída idêntica à da versão anterior);
  - sem plano: no máximo **um** vídeo liberado por subespecialidade (o do 1º tema em ordem
    alfabética, se houver dois marcados);
  - no capítulo-amostra, `videos` vem só com o liberado (ou vazio) e `videos_total` traz quantos o
    capítulo tem;
  - o liberado de outro capítulo vem como item **só de vídeo**:
    `{sub, tema, titulo, tipo, privado, so_video: true, videos: [o liberado]}`, sem resumo,
    pontos-chave, flashcards, mapa, figuras ou referências;
  - nenhum outro `src` de vídeo chega à degustação. O `src` é público no Storage, então não
    entregar o link é o que impede de assistir.
- **Cliente:**
  - `separarSoVideo` tira os itens só de vídeo de `diretrizes` (não viram tema, contagem nem
    busca) e os guarda em `dirVideosAmostra`;
  - `dirVideoAmostraDaSub(sub)` acha o liberado no capítulo-amostra ou no item só de vídeo;
  - na grade, a área com vídeo liberado mostra "🎬 1 videoaula liberada";
  - na lista de temas, o bloco "🎁 Videoaula liberada na degustação" traz o player e o capítulo
    de origem;
  - no capítulo-amostra, a aba **🎬 Videoaulas** abre só com o liberado e avisa "Mais N
    videoaulas neste capítulo, para assinantes". Sem vídeo liberado, a aba fica com 🔒.
- **Escolha inicial** (o professor pediu que eu escolhesse; ele troca no painel):
  - **Adrenal:** "Carcinoma adrenocortical", que fica no capítulo que a degustação já abre;
  - **Obesidade:** "Obesidade clínica x pré-clínica", o capítulo de avaliação e diagnóstico;
  - **Endocrinologia Masculina:** "Hipogonadismo masculino", a única da área;
  - **Lípides:** "Lipoproteína (a)", a única da área.
  - Gravado em 07/11, às 12h42 UTC, depois do deploy (v344 no ar). Posições 95, 70, 116 e 110,
    `videos[0]`. Backup `main-antes-videoaulas-degustacao-2026-11-07`; guardas: md5 do payload,
    233 itens, e tema e título de cada vídeo.
  - Conferido: tirando as 4 marcas, o payload é idêntico ao backup; a degustação passou a
    receber 31 itens (28 + 3 só de vídeo, nenhum com `resumo`).
- **Standard (aberto):** o professor falou do Gold e da degustação. O Standard (1 assinante em
  07/11) continua vendo todas, porque o portão do servidor é `plano`. Se ele quiser só no Gold,
  é trocar `@> array['plano']` por um teste de `plano:gold` no ramo das privadas.
- **Teste:** `scripts/test-videoaulas-degustacao.js`, no ci-validate.

## Pontos de atenção

- Vídeo grande no Storage gasta banda de saída do Supabase. Se as videoaulas crescerem muito,
  avaliar mandar para o Bunny (como as aulas dos cursos) e colar o `.m3u8` no campo de link; o
  player já aceita.
- Excluir a videoaula no painel tira o item da lista, mas **não apaga o arquivo** do Storage.
