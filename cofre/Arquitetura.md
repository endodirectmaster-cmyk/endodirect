---
tags: [cofre, arquitetura]
atualizado: 2026-06-23
---

# Arquitetura

## Frontend — `index.html`

- **Single-file SPA**, JS vanilla, scripts inline. Arquivo grande (~7k+ linhas).
- ⚠️ **Funções são redefinidas mais adiante no arquivo** em alguns casos — sempre editar a **versão ATIVA (última)** de uma função.
- Recursos externos via `<script src>`: Supabase JS, tus-js-client, e `growth-lms.js` (tabelas LMS das [[Calculadoras]]).

### Estado e sincronização
- `DB` (objeto cliente) com chaves: `q` (questões salvas), `fc` (flashcards), `mm` (mapas mentais), `notes` (caderno), `crono`, `sf_results`, `perf` (desempenho agregado por categoria). `provas` (banco principal) fica em `provasDB`.
- `persist()` grava `DB` no localStorage e chama `queueRemoteStateSave()`.
- **Estado global** (`endodirect_global_state`, payload JSONB): `globalStatePayload()` **substitui o payload inteiro** ao salvar. Por isso há o mecanismo `globalServerKeys` + captura em `applyStatePayload` para **preservar chaves geridas pelo servidor** (`newsletter_extra`, `newsletter_unsub`, `newsletter_sent`, `newsletter`). Esquecer isso já causou apagar a newsletter (corrigido em #166).
- **Estado por usuário** (`endodirect_app_state`): `userStatePayload` / `REMOTE_STATE_KEYS` espelham chaves para o localStorage. Inclui `user_profile`, `ck_billing`, `deg_trials`.

### Navegação (tela inicial vs. reload) — #284
- **Reload mantém a tela**; **logout+login volta ao padrão** (professor → Analytics; aluno → Mural). Mecanismo: `goPanel()` persiste `last_panel` (aluno) e `renderAdmSec()` persiste `adm_sec` (professor); `doLogout()` **limpa** `last_panel`+`adm_sec`. No `startApp`: admin chama `goPanel('adm')` (que restaura via `admRestoreSec()`, default `analytics`); aluno restaura `last_panel` se visível, senão `homePanel()` (Mural-first).
- ⚠️ `admRestoreSec()` default passou de `ref` → `analytics`.

### Diretrizes (antiga "Referência") — #276–#284
- Hierarquia **subespecialidade → tema → diretriz**; cada diretriz tem `resumo` (texto+bullets), `flashcards`, `mapa`. Taxonomia canônica de 11 subespecialidades (`DIR_SUBS`).
- **Aluno**: `diretrizesViewHTML()`/`renderDiretrizesInto()` com 3 botões de formato (📄 Resumo / 🃏 Flashcards / 🧠 Mapas), só leitura, flip 3D e mapas expansíveis. Gated por `DIRETRIZES_PUBLICADO=false` → mostra "Em breve" (ver [[Pendências]]).
- **Professor** (`admRefSecHTML`/`bindAdmSec`): mesma navegação; ao abrir um **tema** vê a **mesma tela do aluno** (formatos), acrescida de ✏️ Editar / 🗑 Excluir por diretriz (#284). Editor com importação de PDF via IA (gera resumo/bullets/flashcards/mapa, todos editáveis) + chat assistente. A IA usa a conta Anthropic do servidor (`/api/ai`), **não** consome créditos de aluno.

### Mapas Mentais — grade por subespecialidade (admin + aluno, 2026-06-15)
- **Admin** (`admMapasHTML`/`bindAdmSec`): mesmo padrão das Diretrizes. Estado `admMMSub`; `admMMSubList()` conta por subespecialidade (`DIR_SUBS`/`dirSubIcon`). Nível 1 = grade (`data-admmm-sub`); nível 2 = form "Criar mapa mental em <sub>" (sub fixa = `admMMSub`) + lista (Editar/Excluir). Voltar: `adm-mm-back`, `adm-mm-editback`.
  - **Editor VISUAL (2026-06-15):** criar/editar usa o **mesmo editor do aluno** (`renderMMEditor`/`#mm-live`), não mais o form de textareas. Ao abrir o draft, o `bindAdmSec` **move o `#mm-live`** para `#adm-mm-visual-host` (flag `mmAdminEdit`, home guardado em `__mmLiveHome`), seta `curMM` e renderiza. `saveMM` detecta `mmAdminEdit` e grava em `sharedMM` (não em `DB.mm`); o "×"/voltar cancelam. `restoreMMLive()` devolve o `#mm-live` ao sair da seção e no `startApp`. (`admMMSyncDraft`/`admMMSave`/form ficaram obsoletos.)
- **Aluno** (`renderMMList`): também por grade. Estado `mmSubSel`; `mmSubGrid()` conta `sharedMM` **+ `DB.mm`** por subespecialidade. Nível 1 = só a grade (form de criar escondido via classe `mm-grid` no `#panel-mmap`); nível 2 = cabeçalho voltar (`#mm-subhead`) + form "Gerar IA/Manual" + lista = mapas do professor (tag Professor, "Ver") **e** os pessoais da sub (`DB.mm`, "Ver"+excluir). Criação só dentro da sub: `genMM`/`newBlankMM`/`viewMM*` gravam `sub:mmSubSel`. Delegação: `data-mmsubsel`, `data-mmback`. Removidos o `<select id="mm-sub-filter">` e o card "Meus mapas" (os pessoais entram nas próprias subespecialidades).
- **`canonSub(s)`**: normaliza **na exibição** rótulos antigos → canônico (Dislipidemia e Aterosclerose→Lípides; Endocrinologia Feminina e Andrologia→Endocrinologia Feminina; Endocrinologia Esportiva→Endocrinologia do Esporte) para não duplicar cards na grade, **sem** alterar os dados salvos. Usado nas 4 agregações/filtros (aluno+professor).
- Dados em `sharedMM` (`mm_shared`).

### Cursos — por subespecialidade (aluno + professor, 2026-06-15)
- **Aluno** (`renderCursosAluno`): tiles de pacote (`curso-filter-row`, nome via `cursoNomeBySlug`/catálogo `catalogoCursos`); ao escolher o pacote (`cursoFilter`), o `#curso-list` mostra **grade de subespecialidades** agrupando as aulas por `c.modulo` (`dirSubIcon`), e clicar (`data-cursomod`→`cursoMod`) abre as aulas daquela subespecialidade (voltar `data-cursoback`; back/header usam `grid-column:1/-1` no grid `.g2`).
- **Professor** (`admCursosHTML`/`bindAdmSec`): navegação **igual às Diretrizes** em 3 níveis — (0) grade de cursos; (1) clica no curso → some os outros, mostra subespecialidades do curso + "← Voltar aos cursos" + "➕ Adicionar subespecialidade" (inline, persiste em `admCursoModsExtra`/`curso_mods_extra`); (2) clica na subespecialidade → aulas (Assistir/Editar/Excluir) + "+ Adicionar aula" (abre o form de importar com curso+módulo pré-preenchidos via `admCursoAddMod`). Estado: `admCursoFiltro`, `admCursoMod`, `admCursoModAdd`. `cursoModList(curso)` = módulos das aulas + extras vazios. `curso_mods_extra` só é usado pelo admin (vai no `globalStatePayload`/`applyStatePayload`; alunos não precisam).
- Catálogo de nomes: `member_content` já devolve `cursos`; a RPC `endodirect_public_content` passou a devolver `cursos` também (2026-06-15) para o **demo/preview** não exibir o slug ("endo_essencial" → "Endocrinologia Essencial"). `applyStatePayload` aplica `payload.cursos`→`catalogoCursos`.

### Menu lateral do aluno (ordem)
- ESTUDO: Dashboard, Questões, Flashcards, Mapas Mentais, Podcasts, Cursos, Cronograma, Revisão, **Diretrizes** (movida de PESSOAL p/ logo após Revisão — 2026-06-15). `applyProfileMenuLayout()` (médicos) só move o Mural e esconde o Dashboard.

## Backend

### `lib/`
- `newsletter.js` — envio diário + teste. Ver [[Newsletter e Radar]].
- `radar.js` + `news.js` — radar/mural automático (RSS + IA).
- `healthcheck.js` — verificação semanal da plataforma.
- `founder.js` — regras da oferta de fundador. Ver [[Planos e Preços]].
- `instagram.js` — lembrete diário do Story "Questão do Dia" (Resend), via carona no cron do radar (MVP 2026-06-23). Ver [[Instagram Stories (Questão do Dia)]].

### `api/`
- `checkout/config.js` — config pública (chave pública, valores, founder).
- `checkout/order.js` — plano **anual** (pagamento único, 365 dias).
- `checkout/subscribe.js` — **assinatura mensal** recorrente.
- `webhooks/pagarme.js` — libera/revoga acesso conforme eventos.
- `cron/endocrine-radar.js` — radar diário.
- `cron/healthcheck.js` — health check semanal.

### `vercel.json` (crons)
- `endocrine-radar`: `30 10 * * *` (diário)
- `healthcheck`: `0 11 * * 1` (segundas)
- Crons autenticam via `Authorization: Bearer $CRON_SECRET`.

## Tema claro/escuro (#250–#252)
- **Escuro é o padrão.** `:root` define as variáveis escuras; `html[data-theme="light"]{…}` sobrescreve para o claro. O atributo `data-theme` é setado já no `<head>` a partir de `localStorage.endodirect_theme` (default `dark`), evitando flash.
- `setTheme(t)` grava a preferência e marca os botões `[data-theme-opt]`. Seletor no Perfil (aluno e professor) usa **botões reais** (não `<select>`, que sumiam no claro — #252).

## Players de vídeo na landing (#244–#246)
- Carregados via `<script src>` com `defer`: **hls.js@1.5.13** (streams HLS `.m3u8` do Bunny dos 4 professores, grid 2×2) e **Vimeo Player API**.
- A aula do Rodolpho é um iframe Vimeo que toca um **trecho fixo 00:55→01:05 em loop** (`initVimeoClip`). Safari usa HLS nativo; demais navegadores usam `Hls()` quando suportado.

## Importação de PDF nas Diretrizes (#259, #276)
- `pdf.js` (**pdfjs-dist@3.11.174**, UMD do jsDelivr) é **lazy-loaded** só quando o professor importa um PDF. Extrai o **texto no navegador** e envia o texto (não o binário) para `/api/ai` — corrige o **HTTP 413** (corpo > ~4,5MB no Vercel). Fallback para base64 em PDFs pequenos/escaneados; mensagem amigável no 413.

## PWA (app instalável) — 2026-06-14
- `manifest.webmanifest` (raiz): nome, `display:standalone`, `theme_color #1a2744`, `background_color #0b1325`, ícones 192/512 + maskable.
- `sw.js` (raiz, registrado no `<head>`): service worker **network-first** — navegações (HTML) sempre buscam a rede (offline cai no último `/index.html` cacheado); `/api/*` **nunca** é cacheado; cross-origin (Supabase, jsDelivr, Vimeo) passa direto; estáticos do domínio em stale-while-revalidate. Conservador de propósito, para não repetir o problema de conteúdo desatualizado por cache.
- `icons/` (192, 512, maskable-512, apple-touch-180) gerados do `Icone - MD.png` (versão **dourada** do símbolo — alto contraste sobre o fundo escuro; a versão navy `Icone - MD 2.png` sumia no `#0b1325`) sobre fundo `#0b1325` (script com `sharp`). `apple-touch-icon` aponta para o ícone quadrado. Ao trocar ícones, **subir a versão do cache** no `sw.js` (`CACHE`, hoje `endodirect-v2`) para forçar atualização.
- **App nativo (lojas):** ainda **não** feito — plano é empacotar a SPA com **Capacitor** (iOS/Android). Ver [[Pendências]] (contas dev, build com Mac/CI, e a regra de IAP da Apple para pagamentos).

## Validação
Ver [[Convenções de Trabalho]] para os comandos de validação (scripts inline e `node --check`).
