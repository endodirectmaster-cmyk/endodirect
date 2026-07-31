# Boot em navegador real — A/B contra a `main`

Rede de segurança para **a classe de mudança mais perigosa deste projeto**: JS
dentro do `index.html`. O cofre registra **dois apagões** (2026-06) em que o
`ci-validate` (parse) e um sandbox `vm` **passaram** e mesmo assim a plataforma
ficou sem nenhum botão funcionando em navegador real.

A regra do cofre é abrir o **preview da Vercel em navegador real** antes de
mergear. Quando o ambiente não alcança `vercel.app` (o proxy bloqueia), este
harness é o substituto: roda o **mesmo teste** contra a `main` e contra o branch
e compara. Diferença entre os dois é culpa do diff.

## Uso

```bash
mkdir -p /tmp/ab/main /tmp/ab/branch
git show origin/main:index.html > /tmp/ab/main/index.html
cp index.html                     /tmp/ab/branch/index.html
cp growth-lms.js /tmp/ab/main/ && cp growth-lms.js /tmp/ab/branch/
npm i playwright-core            # o Chromium já vem no ambiente
AB_DIR=/tmp/ab node scratchpad/boot-navegador/check.js
```

## ⚠️ Duas armadilhas que já produziram um falso apagão

1. **Os `<script src>` de CDN são bloqueantes** e o proxy deste ambiente os
   **pendura** em vez de recusar. Sem interceptar, o parser trava no primeiro e
   **nenhum bloco inline roda** — os dois lados medem zero e parece que o app
   morreu. O harness devolve stub imediato para tudo que não é o servidor local.
2. **O app inteiro é uma IIFE** (`index.html` l.2552–15950, ~1,19 MB, com
   `'use strict'`). As funções **não** viram propriedades de `window`, então
   `typeof goPanel === 'undefined'` mesmo com tudo funcionando. **Sondar
   `window[...]` é medir nada** — foi o meu primeiro erro aqui.

## A sonda que presta

A **última linha** do bloco grande liga um listener em `#fb-submit`. Se esse
listener existe (lido via CDP `DOMDebugger.getEventListeners`), as 13.398 linhas
executaram **até o fim** — que é exatamente o que o apagão quebrava.
