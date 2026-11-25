---
tags: [cofre, resumos, video]
atualizado: 2026-11-25
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
  - desde 25/11/2026 todos os vídeos dos Resumos são `.m3u8` do Bunny (ver a seção "Bunny" abaixo);
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
- **Standard: só a liberada (14/11/2026, professor: "só Gold").**
  - **Servidor:** `endodirect_member_resumos` calcula `gold` = `plano:gold` ou `plano:premium`, ou o
    escopo antigo `plano` sem `plano:standard` (o admin recebe todos os escopos, então é gold). No
    Gold, tudo como antes. No Standard, TODOS os capítulos, mas `videos` reduzido ao liberado do
    próprio capítulo, com `videos_total` (o mesmo formato da amostra da degustação). Medido antes de
    gravar (corpo antigo × novo com escopos simulados): Gold, legado e admin idênticos ao antigo
    (233 itens, 21 vídeos); Standard 233 itens, 4 vídeos, `videos_total` somando 21; degustação idêntica.
  - **Cliente:** `_stdVid` (Standard, nos Resumos) faz a aba seguir a regra da degustação só para o
    vídeo (`_vidSo`): só o liberado; sem ele, a aba 🎬 com cadeado e o aviso "As videoaulas deste
    capítulo são do plano Gold"; flashcards e mapas seguem abertos. O aviso da aba diz "Mais N
    videoaulas neste capítulo, no plano Gold", e o cadeado abre o upgrade com o Gold em destaque.
  - **Planos:** o Gold passou a listar "Videoaulas dos Resumos" (cartão da plataforma e página inicial).
  - O Mural de avisos usa o que o servidor entregou: o Standard só vê anunciada a liberada.
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

### Arquivo substituído perde os capítulos (25/11/2026)
O professor trocou o arquivo de "Alfalipoproteinemias" (Lípides): retirou o vídeo e subiu o novo. O painel grava um
vídeo NOVO (src e `at` novos) **sem `caps`**: os capítulos do antigo saem junto. Pedido dele: *"dê só a conferida se
as minutagens estão batendo com a anterior"*. Como fazer:
- rodar `slides.sh` no src novo;
- comparar os segundos das trocas de seção com a `tabela.txt` do vídeo antigo;
- gravar os `caps` no vídeo novo, com backup e guarda pelo src.

Nesse caso, as 12 trocas de seção caíram nos mesmos segundos (mesma duração, 24:21). A única mudança foi no texto: os
slides novos dizem "HDL" onde os antigos diziam "HDL-c", e os títulos dos capítulos acompanharam os slides. O mural
volta a mostrar a aula como nova, pela data do arquivo novo.

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

- O painel ainda sobe o arquivo ao Storage do Supabase; a checagem diária das 03:13 o passa para o
  Bunny (ver a seção abaixo). Quem preferir pode subir direto no Bunny (biblioteca "Resumos") e
  colar o `.m3u8` no campo de link; o player já aceita.
- Excluir a videoaula no painel tira o item da lista, mas **não apaga o arquivo** do Storage.

## Bunny: onde ficam os vídeos dos Resumos (25/11/2026)

Professor, ao perguntar do Cloudflare: *"Somente os videos do bunny. Dou acesso total"*. Os 26
vídeos dos Resumos saíram do Storage do Supabase (banda de saída cara, sem adaptação à conexão do
aluno) e foram para o Bunny Stream, como as aulas dos cursos.
- **Biblioteca "Resumos"**, id 820720, CDN `vz-4fb917fa-a7a.b-cdn.net`. Endereço gravado no `src`:
  `https://vz-4fb917fa-a7a.b-cdn.net/<GUID>/playlist.m3u8` (o player já monta `.m3u8` por
  `montarVideosHls`).
- **Configuração** (feita pelo professor, conferida pelos prints):
  - domínios permitidos `endodirect.com.br` e `*.endodirect.com.br`;
  - acesso direto à URL bloqueado (sem o Referer do site, 403);
  - "direct play" e o MP4 de reserva desligados (só HLS, sem `.mp4` para baixar);
  - originais guardados.
- **Chave da API:** fica só no segredo de rede do ambiente (site `video.bunnycdn.com`, cabeçalho
  `AccessKey`), que o proxy injeta. Nunca no chat nem no repositório. `request_credential` não aceita
  o cabeçalho `AccessKey`: o professor o cadastrou à mão nas configurações do ambiente.
- **Como foi feito:** `POST /library/820720/videos/fetch` com `{url, title}` para cada arquivo (o
  Bunny busca no Storage), espera do status 4, duração conferida contra `dur` (26/26), playlist com
  o Referer do site 200 e sem ele 403, reprodução no Chromium com hls.js a 1080p e salto de tempo.
- **Troca no banco:** só os 26 `src`, com backup `main-antes-videos-bunny-2026-11-25`, guarda pelo
  `src` antigo e conferência: o payload sem os `src` é idêntico ao backup (títulos, capítulos,
  durações, datas e degustação intactos).
- **Arquivos antigos** continuam no Storage do Supabase como reserva. Só saem com o "pode" do
  professor.
- **Vídeo novo:** a checagem diária das 03:13 (passo 0) acha o `src` que ainda aponta para
  `/storage/v1/object/public/` e repete o caminho acima antes de fazer os capítulos.
- 🧨 Professor com o painel aberto durante a troca: F5 antes de editar um vídeo dos Resumos, senão
  o painel pode tentar gravar o endereço antigo.

## Bunny em TODAS as bibliotecas (25/11/2026, v496)

Professor: *"quero que você faça em todas as pastas o mesmo esquema que você fez dos resumos. A gente
sobe o arquivo para a plataforma e de lá você transfere para o Bunny Stream"* e *"Tudo que já subiu,
não precisa subir de novo. É só você agora fazer as devidas alterações para manter somente [o
streaming]"*.
- **Bibliotecas e CDN:**

  | Curso | Biblioteca | CDN |
  |---|---|---|
  | Resumos | 820720 | `vz-4fb917fa-a7a` |
  | EMC | 741440 | `vz-0161a494-b29` |
  | Endocrinologia Essencial | 680513 | `vz-1196f9a8-6ea` |
  | EndoTEEM 2026 | 683460 | `vz-f9c42905-205` |

  Hiperglicemia Hospitalar e Lípides ainda não têm aula nem biblioteca.
- **Chaves na Vercel** (`BUNNY_KEY_RESUMOS`, `BUNNY_KEY_EMC`, `BUNNY_KEY_ESSENCIAL`, `BUNNY_KEY_ENDOTEEM`),
  cadastradas pelo professor. Por quê:
  - O Bunny só aceita a chave DA BIBLIOTECA (a da conta não serve).
  - O segredo de rede do ambiente guarda uma chave por endereço, e todas usam `video.bunnycdn.com`.
  - O segredo do ambiente com a chave dos Resumos ficou sem uso.
- **Rota** `api/ai.js` `kind:'bunny'` → `lib/bunny.js`. Ações:
  - `enviar`: só arquivo do nosso Storage;
  - `status`, `listar`, `resolucoes`;
  - `mp4`: apaga só as cópias MP4 (`outputs=mp4&allResolutions=true&deleteMp4Files=true`). Simula antes e recusa
    se o plano tocar na playlist.
- **Quem chama a rota:** o professor logado, ou a checagem diária com um código curto gravado em
  `endodirect_tarefa_token` (RLS sem política; até 1 h).
- **Painel:**
  - A aula dos cursos aceita arquivo (TUS em `cursos/videos/<curso>`). Nos cursos e nos Resumos, o painel pede
    ao Bunny logo depois do envio e guarda `bunny.guid`.
  - O aluno assiste pelo Storage até a madrugada, quando o passo 0 da checagem das 03:13 troca o `src` para o
    `.m3u8` (backup, guarda e conferência).
  - Trocar o vídeo de uma aula por arquivo novo apaga os tópicos antigos, que a madrugada refaz.
- **Limpeza dos MP4:** 115 aulas (3 EMC, 75 EndoTEEM, 37 Endocrinologia Essencial), 5 cópias cada.
  - Os Resumos já não tinham MP4.
  - Depois disso as 141 aulas do Bunny tocam (playlist, variante e 1º segmento com o Referer do site).
- 🧨 **"Serve MP4 fallback files" desligado NÃO bloqueia os MP4 que já existem** (testado após o Purge:
  206 vindo da origem). Só apagando. E o MP4 fallback desligado impede que as aulas novas gerem cópia.
- 🧨 **As zonas das bibliotecas de vídeo não aparecem no CDN do painel do Bunny** ("No pull zones
  found"): não dá para pôr Edge Rule nelas.
- 🧨 **A EMC usa HLS com `init.mp4`** (fMP4). Bloquear toda extensão `.mp4` derrubaria as aulas. Os
  MP4 de download se chamam `play_<altura>p.mp4`.
- **Configuração de cada biblioteca** (o professor clica no painel do Bunny):
  - Security: Allowed domains `endodirect.com.br` e `*.endodirect.com.br`, "Block direct url file access" ligado,
    "Enable direct play" DESLIGADO. A aula 4 do Endocrinologia Essencial usava `player.mediadelivery.net/play/680513/…`;
    em 25/11 passou para o `.m3u8` (com o "pode" do professor), então nenhuma aula depende mais disso.
  - Encoding: Early-Play desligado, "Serve original files" desligado ("Keep original files" fica ligado),
    MP4 fallback desligado, Free Encoding (o Premium cobrava US$ 0,05/min e não usamos nada dele).
  - Depois: Purge com `https://<cdn>.b-cdn.net/*` na lista de URLs.

## Endocrinologia Essencial: "Nesta aula" (17–18/11/2026)

Pedido do professor (17/11): "implementar nas aulas do curso de endocrinologia essencial os tópicos da
minutagem, assim como já existe no programa de educação médica e também nos resumos". O player do curso
é o mesmo da EMC (`renderAulaPlayer` + `aulaCapsHTML`), então só faltava o dado: `adm_cursos[k].caps`.
- **34 das 37 aulas** com capítulos (7 a 12 tópicos cada), gravados em 5 grupos, cada um com backup
  (`main-antes-capitulos-ee-2026-11-17a` … `…-17e`), guarda por aula (curso `endo_essencial`, GUID do `src`,
  `caps` vazio) e conferência por md5 do payload sem os `caps` = backup.
- **Sem capítulos:** a aula 0 (Avaliação clínica do paciente com obesidade) está no Vimeo e a 4 (Uso e abuso
  dos esteroides anabolizantes) num player embutido; nenhum dos dois deixa saltar. Em 25/11/2026 a 4 passou para o `.m3u8`
  do Bunny (mesmo vídeo, guid 37be5953…) e entra na checagem das 03:13. A 9 (Disfunção Erétil)
  vai ser reenviada pelo professor ("pode pular ela, por enquanto"); a checagem diária das 03:13 a pega
  quando o `src` novo chegar.
- **Bunny das aulas:** `vz-1196f9a8-6ea.b-cdn.net/<GUID>/playlist.m3u8` (exige o Referer do site).
- 🧨 **O professor aparece filmado à direita** nas aulas deste curso: o corte de cena via o rosto e as mãos
  como troca de slide. `slides.sh` aceita `CORTE_ESQ=0.6` (só os 60% da esquerda entram na detecção e no
  OCR). Muitas "trocas" no `tabela.txt` ainda são animação do mesmo slide: agrupar pelo assunto, olhando os
  quadros.
- 🧨 **Download longo cai** (curl 35, conexão reiniciada): `slides.sh` agora repete cada pedaço
  (`--retry 5 --retry-all-errors`) e grava em `video.part`, renomeando só no fim.
- 🧨 **Dois lotes em paralelo na mesma pasta corrompem a leitura** (a aula 07 saiu com 6.248 s de quadros para
  um vídeo de 2.242 s). Conferir sempre o último quadro contra a soma dos `EXTINF` da playlist.
- Erros vistos nos slides (avisados ao professor, não mexidos): ver a conversa de 18/11 e [[Pendências]].

