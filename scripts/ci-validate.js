#!/usr/bin/env node
/* Validação de CI do Endodirect (sem dependências externas).
 * Automatiza as checagens que antes eram manuais (ver cofre/Convenções):
 *   1. `node --check` em todos os .js de api/ e lib/ (sintaxe do servidor).
 *   2. Cada <script> inline do index.html roda em `new Function` (sintaxe do cliente).
 *   3. api/ NÃO pode passar de 12 funções serverless (limite do plano Vercel Hobby).
 *      Esse estouro já derrubou produção (deploy ERROR em #311/#313); aqui é pego
 *      ANTES do merge.
 * Sai com código 1 se qualquer checagem falhar. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let errors = 0;
const fail = (msg) => { console.error('✗ ' + msg); errors++; };
const ok = (msg) => { console.log('✓ ' + msg); };

function walk(dir, out) {
  out = out || [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

// 1. Sintaxe dos módulos de servidor (CommonJS) via `node --check`.
const serverFiles = [].concat(walk('api'), walk('lib'));
let syntaxOk = 0;
for (const f of serverFiles) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); syntaxOk++; }
  catch (e) { fail('node --check falhou em ' + f + '\n' + (e.stderr ? e.stderr.toString() : e.message)); }
}
if (syntaxOk === serverFiles.length) ok(`node --check: ${syntaxOk} arquivo(s) de api/ e lib/ OK`);

// 2. Scripts inline do index.html (apenas sintaxe; não executa nada do browser).
const html = fs.readFileSync('index.html', 'utf8');
const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
let m, inlineN = 0, inlineErr = 0;
while ((m = re.exec(html))) {
  const attrs = m[1] || '';
  if (/\ssrc\s*=/.test(attrs)) continue;                                  // externo (src)
  if (/type\s*=\s*["'](?!text\/javascript|module)/i.test(attrs)) continue; // não-JS (ex.: json)
  inlineN++;
  try { new Function(m[2]); }
  catch (e) { inlineErr++; fail(`<script> inline #${inlineN} do index.html: ${e.message}`); }
}
if (inlineErr === 0) ok(`index.html: ${inlineN} script(s) inline OK`);

// 3. Limite de funções serverless da Vercel (plano Hobby = 12). Cada .js em api/ conta.
const MAX_FUNCS = 12;
const apiFuncs = walk('api');
if (apiFuncs.length > MAX_FUNCS) {
  fail(`api/ tem ${apiFuncs.length} funções serverless (limite ${MAX_FUNCS} do plano Vercel). ` +
       `Mova lógica para lib/ (módulos não contam) ou remova um endpoint antes de mergear.`);
} else {
  ok(`api/: ${apiFuncs.length}/${MAX_FUNCS} funções serverless`);
}

if (errors) { console.error(`\n${errors} verificação(ões) falharam.`); process.exit(1); }
console.log('\nTodas as verificações passaram.');
