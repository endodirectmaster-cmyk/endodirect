#!/usr/bin/env bash
# Gera vendor/sentry-<versão>.min.js: pacote mínimo do SDK do Sentry para o navegador, servido do
# nosso domínio (sem script de terceiro). Só o necessário para erros: init, captureException,
# captureMessage, setTag, withScope. Sem tracing, replay nem feedback. Ver cofre/Integrações.md.
# Uso: scripts/gerar-sentry.sh 11.11.0   (roda numa pasta temporária; não mexe no node_modules do projeto)
set -euo pipefail
V="${1:?versão do @sentry/browser, ex.: 11.11.0}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
T="$(mktemp -d)"
cd "$T"
npm init -y >/dev/null
npm install --silent "@sentry/browser@$V" esbuild@0.25.10
cat > entry.js <<JS
import { init, captureException, captureMessage, setTag, withScope } from '@sentry/browser';
window.Sentry = { init, captureException, captureMessage, setTag, withScope, SDK_VERSION: '$V' };
JS
./node_modules/.bin/esbuild entry.js --bundle --minify --format=iife --target=es2017 \
  --define:__SENTRY_DEBUG__=false --define:__SENTRY_TRACING__=false --legal-comments=none \
  --banner:js="/*! @sentry/browser $V (MIT, (c) Functional Software, Inc.) | pacote mínimo do Endodirect, gerado por scripts/gerar-sentry.sh */" \
  --outfile="$RAIZ/vendor/sentry-$V.min.js"
rm -rf "$T"
echo "ok: vendor/sentry-$V.min.js"
