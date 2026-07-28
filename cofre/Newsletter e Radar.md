---
tags: [cofre, newsletter, radar]
atualizado: 2026-07-28
---

# Newsletter e Radar

## Remoção das sociedades ATA e Endocrine Society (2026-07-23)
- **Pedido:** "tirar os comunicados da ATA e endocrine society". Removidas do `SOCIETY_SOURCES` (`lib/radar.js`) — o radar **não puxa mais** esses comunicados. Sobraram **SBEM** e **SBD**.
- **Limpeza dos já gravados:** 22 itens (11 ATA + 11 Endocrine Society) apagados de `radar_avisos` (199→177) e seus `sourceId` adicionados a `radar_hidden` (rede de segurança contra re-add pelo cron antigo até o deploy + o cliente esconde qualquer cópia em aba cacheada).
- **NÃO afeta:** as revistas científicas via PubMed (Thyroid, J Endocr Soc, Endocrine Reviews etc.) seguem no `JOURNALS`; e o texto do card **Diretrizes** (que resume ADA/ATA/Endocrine Society) é conteúdo de estudo, não "comunicado" — intocado. `sw` v121→v122.

## Retenção 90 dias + "Carregar mais" (2026-07-23)
- **`MAX_MURAL_ITEMS=3200`** e **`AUTO_ITEM_TTL_MS=90 dias`** (antes 160 / 45d). O radar traz ~35/dia, então o teto de 160 cortava em ~6 dias; agora guarda ~90 dias.
- **Entrega janelada:** `endodirect_public_content` e `endodirect_member_content` mesclam em `adm_avisos` só os **200 artigos de radar mais recentes** (não o `radar_avisos` inteiro — evita estourar o payload do aluno).
- **Paginação:** RPC `endodirect_mural_radar_more(p_before, p_limit)` + botão "Carregar artigos mais antigos" no `initMural`. O **admin** lê tudo direto (90 dias completos). Ver [[Decisões]].

## Discussão completa do artigo no Mural (2026-07-28)

Pedido do Rodolpho: *"ao invés de somente fazer um resumo como o atual, deixa uma discussão completa do artigo, incluindo as figuras/tabelas dentro da discussão"*.

### ⚠️ O limite que define o recurso: discussão exige TEXTO INTEGRAL
O radar trabalha com o **abstract** (~250 palavras, sem figura e sem tabela). Escrever uma "discussão completa" a partir dele **é inventar** — é literalmente o erro de 28/07 nos artigos de Obesidade, em que afirmações verdadeiras *para a classe* não eram o que o ensaio mediu. Por isso a discussão só existe onde há **PMC (acesso aberto)**: em 28/07, **76 dos 253 itens do mural (30%)**. Nos outros 177 o card segue com o resumo, e o botão nem aparece.

### Figuras e tabelas: tratamento diferente, de propósito
- **Tabelas** — reproduzidas do artigo, convertidas de JATS para **markdown**, que o `muralTextHTML` já renderiza (não precisou de nada novo no cliente). São elas que carregam os números que a discussão cita.
- **Figuras** — **referenciadas pela legenda, não reproduzidas**. Duas razões: estar no PMC não implica licença de redistribuição (boa parte é "free to read", não CC), e a imagem viria de servidor do NIH. O rodapé da discussão diz isso ao aluno, com a licença detectada.

### Onde o texto mora — e por que NÃO no payload
Tabela própria **`endodirect_mural_discussoes`** (migração `mural_discussao_fora_do_payload`), com `endodirect_mural_discussoes_ids()` (só os ids, viaja no carregamento) e `endodirect_mural_discussao(source_id)` (o texto, buscado ao **abrir** o bloco).
- **A conta que decidiu isso:** ~12 KB por discussão × os **200** artigos que as RPCs entregam = **~2,3 MB** somados a um payload já em **~4,6 MB**. O limite empírico deste projeto é **~5,3 MB** — acima dele a resposta **deixa de chegar** e a tela fica vazia. Foi exatamente o que obrigou a separar o `endodirect_member_resumos`. Guardar dentro de `radar_avisos` teria reproduzido a falha assim que o acervo de discussões crescesse.

### Fluxo
Botão **📄 Gerar discussão completa** no card do admin (só nos que têm PMC) → `POST /api/admin/refresh-radar` com `{action:'discussao', sourceId}` → `lib/fulltext.js` busca e faz o parse do JATS → `lib/discussao.js` gera → grava na tabela.
- **⚠️ O endpoint está DENTRO do refresh-radar** e não em arquivo próprio porque `api/` está em **12/12 funções serverless** — o teto que o `scripts/ci-validate.js` barra. Criar `api/admin/discussao.js` quebraria o build.
- O prompt proíbe explicitamente o **jargão de IA** (regra de 28/07), número fora do texto fornecido e citar figura/tabela que não exista na lista.

### O que ainda não foi validado
O parser de JATS foi exercitado contra **fixture** (`scratchpad/test_jats.js`), não contra artigo real: desta sessão o proxy bloqueia `eutils.ncbi.nlm.nih.gov` e `ebi.ac.uk` (403 no CONNECT). **A produção alcança** — é de lá que o radar puxa os abstracts todo dia. A primeira validação contra artigo de verdade é clicar o botão em produção e ler o resultado.

## Discussão completa: geração AUTOMÁTICA só nos tipos que rendem (2026-07-28)
O botão por card continua; o que mudou é que **metanálise, diretriz, consenso e ensaio clínico** de acesso aberto passam a ganhar a discussão sozinhos, no cron do radar (`lib/discussao-auto.js`, chamado por `api/cron/endocrine-radar.js`).

- **Por que não todos os abertos.** Medido em produção: uma discussão sai com **~5.000 palavras**. Dos **81 artigos abertos** do mural, **56 são "Estudo Original"** e 10 revisão narrativa — em observacional pequeno, o resumo de 4 linhas já diz o que há. Gerar os 81 seria ~400.000 palavras que ninguém leu indo ao aluno. **O custo em dólar é baixo** (~US$ 0,19 por artigo no Opus 4.8; ~US$ 15 pelos 81); o que não é baixo é o custo de revisão.
- **⚠️ "Consenso" precisa do reconhecimento por TÍTULO, senão o pedido não tem efeito.** O `MURAL_TYPE_NAMES` do `lib/radar.js` **não inclui Consenso** — o prompt manda classificar consenso como "Diretriz", e o rótulo "Consenso" (que existe em `MURAL_TYPES`) só aparece quando o professor escolhe à mão. Por isso a seleção também lê o título (`consensus|consenso|guideline|position statement|standards of care`), e o mesmo vale para ensaio randomizado escondido em "Estudo Original". **Filtrar só pelo campo `tipo` atenderia o pedido no papel e não no efeito.**
- **Volume real em 28/07:** 10 por tipo (todas metanálises) + 1 consenso por título + 2 ensaios por título = **13 dos 81**.
- **Ritmo:** 2 por execução do cron, com orçamento de tempo — a etapa roda **por último**, para não roubar tempo da Questão do Dia nem da newsletter, que têm hora marcada. O que não couber sai no dia seguinte.
- **Modelo: Opus 4.8**, fixo. A primeira versão lia `process.env.ANTHROPIC_MODEL` **cru** e mandou `claude-sonnet-4-6` — id retirado em 13/07 — reintroduzindo a armadilha que o cofre já documentava para o `api/ai.js`. Agora usa `DISCUSSAO_MODEL` (env própria, com allowlist) e cai em `claude-opus-4-8`.
- **Teste:** `scripts/test-discussao-auto.js`, no CI. Cobertura provada tirando "Consenso" da lista e quebrando o regex de título — os dois reprovam.
- **⚠️ Continua sem etapa de liberação:** a discussão vai ao aluno assim que grava, para assinante e degustação igualmente (as RPCs `endodirect_mural_discussoes_ids`/`endodirect_mural_discussao` não filtram plano nem rascunho). Diferente dos Artigos dos Resumos, que nascem `rascunho:true`. Levantado ao professor em 28/07; ele seguiu para o modelo e os tipos sem pedir a trava. Ver [[Pendências]].

## Radar / Mural (automático)
- `lib/radar.js` + `lib/news.js`: lê feeds RSS de revistas, resume com IA (`summarizeWithAI`), monta itens do mural.
- Filtro de qualidade: descarta artigos com `abstract` curto (`length < 200`) → `buildMuralItem` retorna null; `runRadar` filtra nulos.
- **Breaking News**: linha de tipo "🏷️ Tipo: Lançamento/Aprovação de medicamento" (sem o parêntese de subespecialidade, removido).
- Cron diário `endocrine-radar` (`30 10 * * *`).
- Itens não-breaking ficam em `payload.radar_avisos`. Admin pode editar cada card (inclusive os automáticos).
- **Ordem do mural por importância de TIPO (2026-06-23, pedido do usuário):** o **default** do mural passou a ser `'relevantes'` (aluno `muralSort` e professor `admMuralSort`). A ordem é dada por **`muralStudyRank(a)`**: Artigo de Revisão > Revisão Sistemática > Metanálise > Ensaio Clínico > Coorte > Caso-controle > Transversal > demais (detecta os subtipos finos no tipo+título+texto). `muralRelevance` ficou **dominada pelo tipo** (revista = leve desempate; data por último). Avisos do professor (Urgente/Breaking/Aviso/Comunicado/Evento) no topo. **A newsletter NÃO mudou** (ordena por frescor primeiro). Ver [[Decisões]].

## Newsletter diária — `lib/newsletter.js`
- `sendDailyNewsletter`: idempotência por `payload.newsletter_sent === hoje`.
- Monta `items` a partir dos artigos do dia, com **fallback para o top-3 do mural** quando há menos de 3 artigos novos (garante envio consistente, #167).
- **Destinatários:** membros + `newsletter_extra` − `newsletter_unsub`. List-Unsubscribe por destinatário; envio em batch (Resend).
- **Personalização por subespecialidade:** `getMemberPrefs(key)` lê `app_state -> user_profile -> newsletterSubs` de cada aluno; `itemsFor(email)` filtra o pool do mural pelos temas escolhidos (fallback para destaques gerais). `sendViaResend(...)` aceita `itemsFor` (função por e-mail) ou lista fixa.
- `muralItems(payload)` = todos os artigos não-breaking mapeados; `topFromMural` = primeiros 3.

## Priorização editorial (#275, refinada 2026-06-15) e layout (#283)
- **Ordenação (`rankArticles`)**: 1º por **tipo** (`articleTypeTier`: **0 = revisão/diretriz/consenso**, **1 = metanálise/revisão sistemática**, **2 = original/ensaio/coorte**, 3 = demais), 2º por **periódico** (`journalRank`: **NEJM=0 > Lancet=1 > JCEM=2 > outros=3**), 3º **data desc**. Aplicada ao pool (`topArticles ∪ muralItems`), `topFromMural` e `pool` personalizado.
- **Anti-repetição (2026-06-15)**: `sendDailyNewsletter` mantém `payload.newsletter_recent` (links enviados nos últimos 14 dias, cap 60) e `pickFresh()` prefere artigos ainda não enviados (completa com já-enviados só se faltar p/ 3). Resolve "a newsletter de hoje veio igual à de ontem". `newsletter_recent` é chave de servidor: incluída no **trigger** `endodirect_global_preserve_server_keys` e nas listas de preservação do `index.html` (capture + read-modify-write do admin).
- **Fonte do periódico (radar)**: `journalMatches`/`jnorm` (lib/radar.js) normaliza `&`→`and` e remove `the `; substring só p/ identificadores multi-palavra — antes o nome genérico "Endocrinology" (1 palavra) capturava o JCEM (saía "Endocrinology" em vez de "Journal of Clinical Endocrinology & Metabolism"). Vale p/ artigos novos.
- **Limpeza dos cards antigos (2026-06-15, via SQL)**: a atualização do radar NÃO re-rotula itens já existentes (dedup por `sourceId`). Os cards antigos guardam só a `fonte` normalizada (não o nome cru), mas o **DOI no `link`** identifica a revista: `10.1210/clinem`→JCEM, `10.1515/jpem`→J. Pediatric Endocrinol. Metab., `10.1093/ejendo`→Eur. J. Endocrinol., `10.1038/s41574`→Nat. Rev. Endocrinol., `10.1038/s41591`→Nat. Med., `10.1210/endocr`→Endocrinology (legítimo). Re-rotulados ~50 itens; artigo "Digital biomarkers" (`pubmed:42129603`) removido do `radar_avisos` e adicionado ao `radar_hidden` (não volta).
- **Template (`renderEmail`)**: **largura total** (sem caixa centralizada com `max-width`), fontes maiores (título ~23px, corpo ~17px), **logo do Endodirect** no cabeçalho (`publicBase()+'/Icone%20-%20MD%202.png'`, hospedado — Gmail bloqueia `data:`), `@media max-width:600px` para mobile.

## Seed de avisos removido — "radar atualiza e volta pro antigo no F5" (2026-06-15)
`defaultMuralAvisos()` tinha 6 artigos hardcoded (seed legado de antes do radar) com **`at: Date.now()-X`** (data **relativa** = sempre "hoje"). O `mergeRadarAvisos` injetava esses 6 **crus** (sem normalizar o `at`) quando não estavam na lista. No render **pré-hydrate** (localStorage de `adm_avisos` vazio — sempre, já que avisos manuais=0), o mural mostrava só esses 6 datados de "hoje" (pareciam os artigos novos); **~2s depois**, o hydrate trazia os 128 reais do radar (mais novos 14/06) e os 6 sumiam do topo → sensação de "atualiza e volta pro antigo". Os 6 sourceIds já estavam no `radar_avisos` do servidor (com `at` real = 01/06), então removê-los do seed **não perde conteúdo** (a lista populada continua 128). Fix: `mergeRadarAvisos` só normaliza a lista real, **não injeta mais o seed**; `defaultMuralMap()` segue usado só para canonicalizar o texto dos itens que casam por `sourceId`. Pré-hydrate agora mostra vazio/carregando por ~1s (honesto) em vez de artigos falsos. (O fix anterior #312 `personalOnly` foi diagnóstico errado p/ este sintoma — mantido como hardening.)

## Tipo "Diretriz" e remoção de "Fontes consultadas" (2026-06-15)
- **Tipo "Diretriz"** adicionado ao classificador do mural (`normalizeMuralType`): detecta `guideline`/`diretriz`/`consensus`/`consenso` no **tipo ou título** (sinal preciso) → retorna `'Diretriz'`; antes um "clinical practice guideline" saía como "Estudo Original". Incluído no dropdown de tipo do admin (`MURAL_TYPES`/`tipoOpts`) e no peso de relevância (`muralRelevance`: `Diretriz`=5, acima de Metanálise=4). Alinhado ao `articleTypeTier` da newsletter (revisão/diretriz/consenso = tier 0).
- **Seed legado não re-clobbera edição na leitura (fix 2026-06-15):** `normalizeMuralAviso` casava o item por `sourceId` com `defaultMuralMap()` (os 6 artigos hardcoded de `defaultMuralAvisos()`) e fazia `Object.assign({}, item, original, …)` — o seed sobrescrevia o item a cada render. Para esses 6 cards-semente (vivos no `radar_avisos`), a edição do professor (subespecialidade/tipo/texto) revertia no F5 mesmo após #320 (que só conserta o *save*): a normalização na LEITURA desfazia. Invertido para `Object.assign({}, original, item, …)` — o item gravado vence; o seed só preenche campos ausentes. Cards não-semente (ex.: puberdade precoce) nunca foram afetados. Verificado por simulação Node do round-trip e pela consulta ao banco.
- **Edição manual de tipo é respeitada (fix 2026-06-15):** `normalizeMuralType` agora retorna **verbatim** qualquer rótulo de `MURAL_TYPES` escolhido pelo professor — não re-deriva pelo título/texto. Sem isto, marcar "Artigo de Revisão" voltava a "Diretriz"/"Metanálise" porque o título cita "guidelines" (a auto-classificação rodava antes e sobrescrevia, inclusive no save via `normalizeMuralAviso`). A auto-classificação só vale para itens do radar (`tipo:'Artigo'`/vazio) ou rótulos legados. Além disso, na auto-classificação, **metanálise/revisão sistemática é checada ANTES de diretriz** — "A systematic review supporting ... guidelines" é Metanálise, não a diretriz em si.
- **"Fontes consultadas" removido dos cards:** `lib/radar.js` (`buildMuralItem`) não gera mais a linha `🔗 Fontes consultadas: ...` (o link da fonte já aparece em "Fonte:" no rodapé do card). Itens já gravados foram limpos via SQL (regexp_replace no `texto` de cada `radar_avisos`) **e** o cliente faz strip defensivo em `normalizeMuralAviso` (cobre qualquer resíduo). Importante: a newsletter lê o `texto` direto do payload (não passa pelo cliente), por isso a limpeza no SQL é o que garante e-mails sem essa linha.

## Data de publicação em dd/mm/aaaa (2026-06-15)
O PubMed entrega a data como `2026 Jun 13` / `2026 May` / `2026` / `2026/06/13`. Padronizado para **dd/mm/aaaa** (ou mm/aaaa / aaaa quando faltam dia/mês). Helper `formatPubDateBR` em `lib/radar.js` (exportado) e `pubDateBR` no `index.html` (espelho). Aplicado em: (1) geração do radar — `buildMuralItem` formata a linha `📅 Data de publicacao:` e o campo `publicationDate`; (2) mural — `normalizeMuralAviso` reformata a linha do `texto` no render (cobre itens já gravados); (3) newsletter — `renderEmail` formata `a.data` no render (importa `formatPubDateBR` do radar; sem ciclo, pois o radar não importa o newsletter). Como mural e newsletter formatam no render, **não precisou de SQL** para os itens antigos. Idempotente (se já está dd/mm/aaaa, mantém).

## Aluno escolhe temas (Perfil)
- Card "📬 Newsletter — temas de interesse" em `renderPerfil()`, checkboxes de `MURAL_SUBSPECIALTY_FILTERS`, salvos em `user_profile.newsletterSubs` (cross-device via `queueRemoteStateSave`). Preservado ao editar o resto do perfil.

## Variáveis (nomes)
`RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`, `CRON_SECRET`.

## Pendência
Confirmar entrega para Eduardo/Bruno (checar spam). O botão "✉️ Enviar teste da newsletter" no Mural do admin foi **removido** a pedido do usuário (2026-06-15); o endpoint `/api/newsletter/test` continua existindo, mas sem gatilho na UI. Ver [[Pendências]].
