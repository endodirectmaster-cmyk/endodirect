---
tags: [cofre, seo, conteudo-publico, conversao]
atualizado: 2026-08-19
---

# Páginas Públicas e SEO

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
