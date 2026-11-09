---
tags: [cofre, seo, conteudo-publico, conversao]
atualizado: 2026-11-09
---

# Páginas Públicas e SEO

## 🔎 A home no Google e a auditoria de 09/11/2026

Pedido do professor: *"ver como está o motor de busca no google da nossa plataforma. Acho que nunca
mexemos nisso"*. A auditoria (somente leitura, robô do Google simulado com `curl`) achou as páginas
públicas de agosto funcionando:
- 73 URLs no sitemap, todas com 200;
- 404 de verdade para endereço inexistente;
- canonical e X-Robots-Tag nos capítulos.

A **home nunca tinha sido tratada.**

**O que entrou (index.html e lib/publico.js; teste `scripts/test-seo-home.js`, ci 17c-undecies-u):**
- Título "Endodirect: Endocrinologia e Metabologia para médicos". "Endodirect" sozinho, no Google,
  é dominado pela Endo Direct, uma empresa americana de **endodontia**.
- Meta description com os números da própria landing. O teste falha se a landing mudar e a
  description não acompanhar.
- Canonical em `https://www.endodirect.com.br/`. Isso também tira a duplicata de `endodirect.vercel.app`,
  que serve a home inteira com 200.
- Open Graph e Twitter card, por ora com o ícone de 512 px como imagem.
- JSON-LD `Organization` + `WebSite`.
- Favicon quadrado (`/icons/icon-192.png`). O antigo tinha 951×1064, e o Google só mostra ícone 1:1.
- `descricao()` apagava qualquer `>`: a description da PBMAH dizia "nódulos bilaterais 1 cm" onde o
  texto é "> 1 cm". Agora só sai o `>` de citação no início da linha.
- Sitemap só com `<loc>`: o Google ignora `changefreq` e `priority`, e `lastmod` exigiria uma data
  real de alteração, que o índice não guarda.
- O hub `/resumos` passou a `og:type website`; as páginas públicas ganharam `og:image`.

**O que depende do professor (fora do código):**
1. **Google Search Console:**
   - verificar o domínio (TXT no DNS);
   - enviar `https://www.endodirect.com.br/sitemap.xml`;
   - pedir a indexação de `/` e `/resumos`;
   - acompanhar os relatórios "Páginas" e "Desempenho".

   Hoje não existe nenhuma medição de tráfego orgânico: o Web Analytics da Vercel não está ativo.
2. **Vercel → Domains:**
   - trocar o redirect de `endodirect.com.br` para **308** (hoje é 307, temporário);
   - redirecionar `endodirect.vercel.app` para www.
3. **Quem assina e revisa** os capítulos públicos. Conteúdo médico é tratado pelo Google como área
   sensível (YMYL), e autor, revisor e "atualizado em" contam.
4. **Arte 1200×630** para o compartilhamento e os **perfis oficiais** (Instagram, podcast) para o
   `sameAs`. Também colocar o link de `/resumos` na bio e na descrição do podcast.

## Por que isto existe (o número que mandou)

Medido em 19/08/2026, no banco:

- **Conversão é 33% e não depende de estudar**: 24/73 entre quem estudou,
  13/39 entre quem não estudou, 2/6 entre quem nunca logou.
- **Mediana de 27 minutos** entre o cadastro e o pagamento; 22 dos 37 pagaram
  na primeira hora.

Ou seja: **conversão não é problema de produto — é problema de tráfego.**
Quem chega, decide rápido, e decide igual tendo usado ou não. O que falta é
gente chegando: 112 pessoas se cadastraram desde o começo.

E o site inteiro era **uma página**. `index.html` é um SPA que monta o conteúdo
por JavaScript depois de falar com o Supabase — o robô do Google recebia um HTML
praticamente vazio, num único endereço, **sem `robots.txt`, sem `sitemap.xml` e
sem meta description**. Não havia o que indexar.

## O que entrou

| endereço | o que serve |
|---|---|
| `/resumos` | índice dos capítulos abertos, agrupado por subespecialidade |
| `/resumo/<slug>` | um capítulo por endereço, renderizado NO SERVIDOR |
| `/sitemap.xml` | gerado do payload, uma URL por capítulo |
| `/robots.txt` | arquivo estático, aponta para o sitemap |

Tudo sai de **uma única função** (`api/publico.js`, com `lib/publico.js` fazendo
o HTML) — ver a trava de 12 funções abaixo.

## ⚠️ NÃO PUBLICA NADA NOVO — e essa é a regra

As páginas servem **exatamente** o que a RPC `endodirect_public_content()` já
entrega hoje a qualquer visitante anônimo: capítulos com `privado <> true` e
`rascunho <> true`. São **66** deles. O que mudou foi o **endereço**: de "dentro
de um SPA" para "uma URL por capítulo".

**Fica de fora, e o teste guarda isso:**

- **flashcards, mapa mental, fluxogramas e figuras** — são o que o assinante
  paga para ter, e o motivo de criar conta;
- **as 64 discussões de artigo** — a própria RPC exige `auth.uid()`, então nunca
  foram públicas;
- **os capítulos `privado: true`** (os Resumos) — 160 dos 226.

Se um dia alguém passar o item inteiro para `paginaCapitulo()`, o material do
assinante apareceria no Google **sem nenhum erro visível**. Por isso
`scripts/test-publico-seo.js` monta um item COM flashcards, mapa, fluxograma e
figura e exige que nada disso saia no HTML.

## ⚠️ A trava de 12 funções serverless da Vercel

Cada arquivo `.js` em `api/` é uma função, e o limite é **12**. O projeto já
estava exatamente no teto — `scripts/test-aula-ao-vivo.js` conta e reprova acima
disso. As duas rotas novas (páginas públicas + inscrição na newsletter) teriam
levado a 14 e **quebrado o deploy inteiro**, não só a novidade.

Como coube em 12:

1. a inscrição na newsletter **mora dentro de `api/publico.js`** (`rota=inscrever`),
   não num arquivo próprio;
2. `api/newsletter/test.js` foi **absorvido** por `api/admin/refresh-radar.js`
   (`action: 'newsletter-teste'`). Aquele endpoint estava **sem gatilho na UI
   desde 15/06/2026** — o botão foi removido a pedido do professor e só era
   chamado à mão. A autenticação é a mesma nos dois (token de admin ou
   `CRON_SECRET`), então nada mudou para quem usava.

**Antes de criar qualquer arquivo em `api/`, conte os que já existem.**

## ⚠️ O service worker sequestrava as páginas novas

O `sw.js` gravava **toda** resposta de navegação como `/index.html`. Um aluno com
o app instalado que abrisse `/resumo/<slug>` substituiria a casca do app pela
página do capítulo — e no próximo acesso **offline** o app abriria mostrando um
resumo em vez do app. Corrigido em duas frentes (v244 → v245):

- os caminhos públicos saem antes de qualquer interceptação (rede sempre);
- só `/` e `/index.html` viram a casca em cache.

## Decisões de implementação

- **Renderização no servidor, não no cliente.** O Googlebot executa JavaScript,
  mas com fila e atraso; e a descrição/título precisam existir no HTML.
- **Slug vem do banco** (`public.endodirect_slug`), fonte única. `lib/publico.js`
  tem um espelho em JS só para montar link a partir de um tema, e o teste compara
  os dois contra uma tabela tirada do banco. Os 66 temas dão 66 slugs distintos.
- **As RPCs novas têm `execute` REVOGADO de `anon` e `authenticated`** e são
  chamadas com a service role pela função serverless: zero superfície nova para
  o navegador.
- **404 de verdade para slug desconhecido.** Devolver a página de "não achei" com
  status 200 é *soft-404*: o Google indexa o aviso como se fosse conteúdo.
- **Sem service key, 503 e nada indexável.** Página vazia no índice do Google
  custa mais que página nenhuma, e demora meses para sair de lá.
- **O texto do payload é escapado antes de virar HTML.** Sem isso, um `<script>`
  dentro de um resumo viraria script executado na página pública.

## Conferido no ar (19/08/2026, logo após o merge)

Buscado em `www.endodirect.com.br`, não no preview:

| endereço | resultado |
|---|---|
| `/robots.txt` | 200, aponta o sitemap |
| `/sitemap.xml` | 200, **68 URLs** (home + índice + 66 capítulos), todas absolutas e distintas |
| `/resumos` | 200, 66 temas agrupados em 14 subespecialidades |
| `/resumo/nodulo-tireoidiano-e-cancer-diferenciado` | 200, `<title>`, description, canonical e JSON-LD corretos; `x-robots-tag: index, follow` |
| `/resumo/slug-que-nao-existe-teste` | **404** de verdade, não soft-404 |

Nenhum flashcard, mapa mental, fluxograma ou figura no HTML servido.

⚠️ **Detalhe cosmético conhecido:** a página de "não encontrado" sai com
`X-Robots-Tag: index, follow` porque a regra do `vercel.json` casa
`/resumo/(.*)`. É inofensivo — o **status 404 prevalece** e o Google não indexa
404 —, mas se um dia isso for arrumado, o lugar é o bloco `headers`.

## Como desligar

Tirar os três `rewrites` do `vercel.json`. As páginas somem na hora; nada mais
depende delas. (O `robots.txt` passaria a apontar para um sitemap inexistente —
tirar a linha `Sitemap:` junto.)

## Onde mexer

- `lib/publico.js` — markdown→HTML, CSS, página de capítulo, índice, sitemap
- `api/publico.js` — roteamento (`rota=indice|resumo|sitemap|inscrever`), cache
- `robots.txt`, `vercel.json` (rewrites + `X-Robots-Tag`)
- `scripts/test-publico-seo.js` — a guarda
- Migration `publico_seo_indice_e_capitulo`
