---
tags: [cofre, newsletter, radar]
atualizado: 2026-06-23
---

# Newsletter e Radar

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
