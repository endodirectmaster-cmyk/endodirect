---
tags: [cofre, newsletter, radar]
atualizado: 2026-06-14
---

# Newsletter e Radar

## Radar / Mural (automático)
- `lib/radar.js` + `lib/news.js`: lê feeds RSS de revistas, resume com IA (`summarizeWithAI`), monta itens do mural.
- Filtro de qualidade: descarta artigos com `abstract` curto (`length < 200`) → `buildMuralItem` retorna null; `runRadar` filtra nulos.
- **Breaking News**: linha de tipo "🏷️ Tipo: Lançamento/Aprovação de medicamento" (sem o parêntese de subespecialidade, removido).
- Cron diário `endocrine-radar` (`30 10 * * *`).
- Itens não-breaking ficam em `payload.radar_avisos`. Admin pode editar cada card (inclusive os automáticos).

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

## Aluno escolhe temas (Perfil)
- Card "📬 Newsletter — temas de interesse" em `renderPerfil()`, checkboxes de `MURAL_SUBSPECIALTY_FILTERS`, salvos em `user_profile.newsletterSubs` (cross-device via `queueRemoteStateSave`). Preservado ao editar o resto do perfil.

## Variáveis (nomes)
`RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`, `CRON_SECRET`.

## Pendência
Confirmar entrega para Eduardo/Bruno (checar spam). O botão "✉️ Enviar teste da newsletter" no Mural do admin foi **removido** a pedido do usuário (2026-06-15); o endpoint `/api/newsletter/test` continua existindo, mas sem gatilho na UI. Ver [[Pendências]].
