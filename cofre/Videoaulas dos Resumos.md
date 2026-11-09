---
tags: [cofre, resumos, video]
atualizado: 2026-11-09
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

## Capítulos "Nesta aula" em cada vídeo (09/11/2026)

Pedido do professor: *"Nas videoaulas que estão contidas nos resumos, deixa do modo igual a da
educação médica continuada, com a minutagem em tópicos. Já faz isso nas videoaulas que já estão
lá nos resumos e, consequentemente, também as próximas que serão introduzidas na plataforma.
Coloca isso como uma skill sua."*

- **Dado:** `diretrizes[i].videos[j].caps = [{t, titulo}]`, o mesmo formato das aulas da EMC
  (`adm_cursos[k].caps`). O RPC `endodirect_member_resumos` entrega o objeto do vídeo inteiro,
  então os capítulos chegam ao aluno sem mudança no servidor, inclusive na degustação.
- **Tela:** `dirVideoCapsHTML(v)` põe o bloco "Nesta aula" (o mesmo `aulaCapsHTML` da EMC)
  embaixo do título de cada cartão. O clique global (`.dir-video .aula-cap`) salta o vídeo
  do MESMO cartão, porque um capítulo pode ter vários vídeos (Tratamento Farmacológico da
  Obesidade tem 7). O tópico em curso acende por um `timeupdate` escutado na captura (esse
  evento não borbulha). Vídeos do YouTube e do Vimeo não mostram capítulos: o iframe não
  deixa saltar.
- **Painel:** cada vídeo tem o campo "Capítulos" (uma linha por tópico, `02:45 Título`,
  aceitando o formato do Bunny) e o botão "💾 Salvar capítulos". Texto sem nenhum horário
  reconhecível é recusado e não apaga os capítulos que havia.
- **Os 14 vídeos de 09/11** ganharam 155 tópicos (de 9 a 12 cada), lidos dos slides.
  - Backup: `main-antes-capitulos-videoaulas-resumos-2026-11-09`.
  - A gravação teve guarda (md5 do payload, mais `src` e `titulo` de cada vídeo). Depois
    dela, o payload sem os `caps` ficou idêntico ao backup.
- **Skill:** `.claude/skills/capitulos-videoaula/` traz `SKILL.md`, `slides.sh` (download,
  trocas de slide, OCR) e os auxiliares `tabela.py`, `agrupa.py` e `cabecalho.py`. A tarefa
  agendada "Capítulos das videoaulas novas" roda todo dia às 03:13 (Brasília), nesta sessão,
  e só age se houver vídeo sem capítulos.
- 🧨 **O OCR troca dígitos em nome de estudo.** Ele leu SURMOUNT-5 onde o slide diz
  SURMOUNT-3, e COR-T onde diz COR-BMOD. Toda sigla de ensaio, dose ou ano é conferida no
  recorte do quadro antes de gravar.
- 🧨 **Os slides dos Resumos têm o nome da aula como sobretítulo em todos os quadros.**
  Agrupar pela 1ª linha (como funcionava na EMC) juntava a aula inteira num slide só. Agora
  o cabeçalho são as duas primeiras linhas com texto de verdade, comparadas por semelhança.

## Uma videoaula por vez: lista de escolha (09/11/2026)

Pedido do professor, com print da aba Videoaulas mostrando todos os vídeos abertos: *"Não deixar
todas as videoaulas abertas de uma vez só, nos resumos, nem tampouco em nenhum curso. (...)
deixa uma subjanela onde ele vai escolher qual a videoaula que ele quer assistir. Então, por
exemplo, ele clica em tirzepatida, então vai abrir a videoaula e, claro, (...) embaixo já os
tópicos, a minutagem (...) tanto para a versão de computador, mas também para a versão mobile"*.

- Capítulo com 2 ou mais vídeos mostra a **lista**: ▶, título, duração e quantidade de
  tópicos (`dirVideoItemHTML`). Nenhum player é carregado enquanto a lista aparece.
- Ao tocar num item, só aquele vídeo abre, com "Nesta aula" embaixo e o botão
  "← Videoaulas do capítulo (N)" em cima. O botão leva de volta à lista, como na aula da EMC.
  A tela rola até o topo do que abriu.
- Capítulo com um vídeo só abre o vídeo direto, porque não há o que escolher. A degustação
  também abre direto, porque ela só recebe o vídeo liberado.
- O estado é `refVideoAberto`, que guarda o src do vídeo aberto. Ele volta a vazio ao trocar
  de capítulo, de área, de aba (Resumo, Flashcards…) ou de tipo, e ao entrar em
  Resumos/Diretrizes.
- Os **Cursos** já funcionavam assim desde 07/11: lista de aulas, e a aula aberta esconde a
  lista. O painel do professor continua mostrando todos os vídeos do capítulo, porque ali é
  onde se editam título, capítulos e degustação.

## Pontos de atenção

- Vídeo grande no Storage gasta banda de saída do Supabase. Se as videoaulas crescerem muito,
  avaliar mandar para o Bunny (como as aulas dos cursos) e colar o `.m3u8` no campo de link; o
  player já aceita.
- Excluir a videoaula no painel tira o item da lista, mas **não apaga o arquivo** do Storage.
