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

## Priorização editorial (#275) e layout (#283)
- **Ordenação (`rankArticles`)**: 1º por **tipo** (`articleTypeTier`: tier 0 = revisão/metanálise/diretriz/consenso; tier 1 = ensaios clínicos/originais), 2º por **periódico** (`journalRank`: NEJM=0 > Lancet=1 > outros=2), 3º **data desc** como desempate. Aplicada ao pool de candidatos (`topArticles ∪ muralItems`), ao `topFromMural` e ao `pool` personalizado.
- **Template (`renderEmail`)**: **largura total** (sem caixa centralizada com `max-width`), fontes maiores (título ~23px, corpo ~17px), **logo do Endodirect** no cabeçalho (`publicBase()+'/Icone%20-%20MD%202.png'`, hospedado — Gmail bloqueia `data:`), `@media max-width:600px` para mobile.

## Aluno escolhe temas (Perfil)
- Card "📬 Newsletter — temas de interesse" em `renderPerfil()`, checkboxes de `MURAL_SUBSPECIALTY_FILTERS`, salvos em `user_profile.newsletterSubs` (cross-device via `queueRemoteStateSave`). Preservado ao editar o resto do perfil.

## Variáveis (nomes)
`RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`, `CRON_SECRET`.

## Pendência
Confirmar entrega para Eduardo/Bruno (checar spam; botão "Enviar teste" no admin). Ver [[Pendências]].
