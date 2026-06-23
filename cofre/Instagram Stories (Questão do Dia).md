---
tags: [cofre, integracoes, marketing]
atualizado: 2026-06-23
---

# Instagram Stories — "Questão do Dia"

## Status
**MVP CONSTRUÍDO (2026-06-23).** Em **preview**, aguardando aprovação do usuário p/ deploy. Amostra visual validada em 2026-06-22; build feito após o "Pode construir".

## Implementação do MVP (2026-06-23) — CONSTRUÍDO
Respeita o teto (12/12 funções, 2/2 crons) e o deploy **SEM `package.json`** (serverless = Node puro + `fetch`; o `@resvg` do sandbox NÃO existe em produção).
- **`lib/instagram.js`** (módulo, não função): `igTodayPlan` (calendário por dia da semana BRT); `questionCaption`/`answerCaption`; **lembrete diário por e-mail** (Resend; destinatários = `endodirect_admins`/`ALERT_TO`, igual ao `alert.js`); idempotente por dia (`ig_notice_sent`, preservado como os `newsletter_*` no client e no save do admin).
- **Carona no cron** `api/cron/endocrine-radar.js` → `sendIgDailyNotice()` (fail-safe, após os trial-emails).
- **Painel → "📲 Questão do Dia"** (`admStoriesHTML`/`bindAdmStories`): gerar 4-alt com IA (`aiRequest`+`authoringSys`), editar, **pré-visualizar**, **baixar PNG 1080×1920** (pergunta+gabarito), **copiar legenda**, **aprovar p/ fila**, gerir fila (editar/baixar/marcar postada/excluir), **promos** de domingo (fundo branded + legenda).
- **Arte 100% client-side**: `igQuestionSVG`/`igAnswerSVG`/`igPromoSVG` → `igRenderCanvas` (SVG→canvas; logo dourado `Icone - MD.png` same-origin desenhado por cima = sem taint) → `toBlob` PNG.
- **Fila `ig_stories`** no estado global (`globalStatePayload`/`applyStatePayload`; professor escreve, cron só lê).
- **Pendências (futuro):** publicação automática via **Graph API**; **texto justificado** na arte (hoje alinhado à esquerda); **imagem do caso** embutida (sairia por taint cross-origin → por ora o professor adiciona no editor do IG); **prints reais** nos promos (commit em `figuras/stories/`).

## Decisões de produto (2026-06-22)
- **Canal/formato:** **somente Stories** (9:16, **1080×1920**). Conta **@endodirect** (já é **Business** → habilita a Graph API no futuro). Postagem às **18h BRT**.
- **Fluxo:** **rota C — híbrido com aprovação.** O sistema prepara arte + legenda + gabarito; o professor revisa/edita e **aprova**; postagem **manual** no MVP. Depois troca-se o "avisar" por publicação via API (a conta já é Business).
- **Conteúdo:** **misto.** O banco curado (TEEM) serve de **calibragem** de estilo/dificuldade; o que vai ao ar são, em regra, **casos ORIGINAIS** (IA + revisão). **Atualização (2026-06-22, usuário):** **eventualmente PODE ir ao ar uma questão do próprio TEEM**; quando for, **iniciar o enunciado identificando a origem**, no formato **"(TEEM ANO)"** — ex.: *"(TEEM 2026) Homem, 65 anos…"*. ⚠️ *Caveat:* a prova é oficial da SBEM → usar enunciado **verbatim** tem risco de direito autoral; a atribuição ajuda, mas o ideal é confirmar permissão de uso e preferir paráfrase quando possível. Decisão do usuário registrada.
- **Engajamento (Stories) — DECIDIDO (2026-06-22): 4 alternativas (A–D)**, para encaixar no **sticker de quiz nativo** do Instagram (máx. 4 opções; dá acerto/erro na hora + estatística). A alternativa correta vira a opção certa do quiz. As questões completas de **5 alternativas** seguem **dentro do app** (separar "atrair" de "estudar"). **Stickers de quiz/poll NÃO podem ser adicionados via API** → reforça a aprovação humana + postagem manual no MVP.
- **Calendário editorial (decidido 2026-06-22):** **Seg/Qua/Sex** = questão do dia, cada uma de uma **subespecialidade diferente** (rotação pela taxonomia canônica `DIR_SUBS`: Diabetes · Tireoide · Adrenal · Obesidade · Lípides · Osteometabolismo · Neuroendocrinologia · Endoc. Feminina · Endoc. Masculina · Endoc. Pediátrica · Endoc. do Esporte). **Ter/Qui/Sáb** = gabarito da questão anterior (seg→ter, qua→qui, sex→sáb). **Dom** = **2 stories de propaganda** das ferramentas da plataforma (rotacionando), para atrair alunos.
- **Tipografia & imagens (2026-06-22):** enunciado (e explicação) em **texto justificado**. A questão suporta **imagem opcional do caso** (ECG, TC, RM, USG de tireoide, etc.) num slot **abaixo do enunciado** → o modelo de dados da questão ganha um campo de imagem.

## Amostra (2026-06-22)
- Gerada **localmente** (SVG → PNG via `@resvg/resvg-js`, fonte Liberation Sans), on-brand (navy `#0b1325`/`#1a2744` + dourado). 2 slides: **pergunta** (**4 alternativas A–D**) + **gabarito**. Caso original: hiperaldosteronismo primário (rastreio aldo/renina → **teste confirmatório** antes de localizar; resposta **B**). **Layout (decidido 2026-06-22):** **logo** (ícone dourado ED, `Icone - MD.png`) no topo; **sem** @handle, **sem** etiqueta de área e **sem** disclaimer na arte (o @ já aparece na UI do story).
- **Lição técnica:** o **Canva AI** (`generate-design`) **falha** (`design_generation_error`) com texto clínico longo / caracteres especiais / `brand_kit_id` — só gera com prompt curto e genérico. E **não dá** para baixar export/thumbnail do Canva no sandbox (403). ⇒ Para produção, usar **Canva brand template com autofill** (campos fixos) **ou** render próprio HTML/SVG→PNG (controlado e reprodutível).

## MVP — proposta original (referência; já construído acima)
- `lib/instagram.js` (**módulo**, não função): escolhe o item do dia, monta a legenda da pergunta e a do gabarito.
- **Card "Questão do dia"** no painel do professor: a IA gera caso + arte; o professor edita/aprova; aprovados entram numa fila (estado em `payload`, espelhando `newsletter_*`). Ver [[Dados e Supabase]].
- **Disparo diário pegando carona no cron do radar** (`/api/cron/endocrine-radar`, 10:30 UTC; ver [[Newsletter e Radar]]) com **lógica de dia da semana**: Seg/Qua/Sex → avisa a **questão** (próxima subespecialidade da fila); Ter/Qui/Sáb → avisa o **gabarito** do item anterior; Dom → as **2 promos**. **Avisa por e-mail** (Resend) com a arte + legenda copiável → o professor posta às 18h BRT. Depois, migrar para publicação via Graph API (imagem do story; quiz/poll seguem manuais).
- **Story de domingo (promo):** template **separado** destacando 1 ferramenta por story (Banco de Questões, Simulador de casos, Calculadoras, Flashcards, Mapas Mentais, Diretrizes, Podcasts, Prescrição/Memed, Chat IA, Cursos) — 2 por domingo, rotacionando, com CTA p/ atrair alunos.
- **Prints reais nos promos (decidido 2026-06-22):** o promo deve usar **screenshot REAL da ferramenta**. Como não dá p/ capturar a tela logada nem embutir print colado no chat (sandbox sem navegador/sem acesso ao arquivo), o entregável é o **fundo branded** (logo + título + CTA + **moldura tracejada**) e o professor **sobrepõe o print no editor de Stories** do Instagram. Alternativa: se os screenshots vierem como **arquivo** (commit no repo ou URL público), dá p/ compor o PNG final. Fundos de exemplo (Banco de Questões, Simulador) gerados via `@resvg/resvg-js`.
- **Molduras por origem do print (decidido 2026-06-22):** o usuário vai mandar **vários prints** p/ usar aos poucos na rotação. Print de **desktop → moldura de monitor/computador**; print de **iPhone → moldura de iPhone**. **Armazenar os prints no repo** (ex.: `figuras/stories/`) porque o container reseta — só o git persiste. Evitar prints com **dado de paciente** (repo é público).
- **Arte:** brand template no Canva (autofill) ou render SVG→PNG.

Ver [[Decisões]] e [[Integrações]].
