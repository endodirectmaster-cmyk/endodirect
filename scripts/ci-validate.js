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

// 4. Regressão do caminho de geração de IA: o `system` não pode truncar as
//    diretrizes nem perder o formato JSON (foi a causa do bug #422 em produção),
//    e o sentinela do prompt-cache tem de bater entre index.html e api/ai.js.
//    Roda em subprocesso porque o handler de api/ai.js é assíncrono.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ai-system.js')], { stdio: 'pipe' });
  ok('regressão IA/system: geração não trunca diretrizes nem perde o formato JSON');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão IA/system falhou (verifique api/ai.js + index.html/authoringSys):\n' + out);
}

// 5. Regressão da CAIXA DE SUPORTE (lib/support.js + lib/admin-auth.js): store do
//    ticket, listagem, gate de admin e envio da resposta ao aluno (fetch mockado).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-support-inbox.js')], { stdio: 'pipe' });
  ok('regressão suporte: store + listagem + gate de admin + responder ao aluno');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da caixa de suporte falhou (verifique lib/support.js + lib/admin-auth.js):\n' + out);
}

// 6. Seleção da DISCUSSÃO AUTOMÁTICA do Mural (lib/discussao-auto.js): quais
//    artigos abertos qualificam, o reconhecimento de consenso pelo TÍTULO (o
//    classificador do radar não emite esse rótulo) e o modelo fixado em Opus 4.8.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-discussao-auto.js')], { stdio: 'pipe' });
  ok('regressão discussão automática: tipos que rendem + consenso por título + Opus 4.8');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da discussão automática falhou (verifique lib/discussao-auto.js + lib/discussao.js):\n' + out);
}

// 7. Renderização do corpo do card do Mural: régua horizontal (`---`, usada pela
//    discussão completa entre seções) sem quebrar tabela nem lista.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-mural-render.js')], { stdio: 'pipe' });
  ok('regressão mural: régua horizontal + tabela e lista intactas');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do render do mural falhou (verifique muralTextHTML no index.html):\n' + out);
}

// 8. FAVORITOS: chave estável por tipo (nem todo item tem id confiável), a
//    alternância e a presença da estrela nos 5 cards.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-favoritos.js')], { stdio: 'pipe' });
  ok('regressão favoritos: chave nos 5 tipos + estrela nos 5 cards');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão dos favoritos falhou (verifique favKey/favStarHTML no index.html):\n' + out);
}

// 9. CADEIA de discussões: a próxima invocação tem de ser disparada ANTES da
//    geração (senão o teto de 60s mata a cadeia em silêncio) e a partida tem de
//    continuar pendurada no /api/checkout/config, que o pacote antigo do
//    navegador também chama.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-discussao-cadeia.js')], { stdio: 'pipe' });
  ok('regressão cadeia de discussões: disparo antes da geração + carona no config + estrangulamento');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da cadeia de discussões falhou (verifique lib/discussao-kick.js + api/admin/refresh-radar.js):\n' + out);
}

// 10. PROMPT da discussão: figuras e tabelas são anexadas ANTES do corte (iam
//     no fim e o truncamento as descartava inteiras), e nada de rodapé de
//     procedência nem selo de contagem no card.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-discussao-prompt.js')], { stdio: 'pipe' });
  ok('regressão prompt da discussão: tabelas sobrevivem ao corte + sem rodapé/selo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do prompt da discussão falhou (verifique lib/fulltext.js + lib/discussao.js):\n' + out);
}

if (errors) { console.error(`\n${errors} verificação(ões) falharam.`); process.exit(1); }
console.log('\nTodas as verificações passaram.');
