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

// 11. %PEP pós-bariátrica: o denominador é o peso de IMC 25, e quem já operou
//     abaixo disso não tem excesso de peso — a calculadora tem de recusar em vez
//     de devolver número. Valores conferidos à mão no teste.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-calc-pep.js')], { stdio: 'pipe' });
  ok('regressão %PEP: denominador em IMC 25 + recusa sem excesso de peso');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail("regressão do %PEP falhou (verifique a entrada id:'pep' de CALCS no index.html):\n" + out);
}

// 12. SOPHIA: as árvores foram transcritas de FIGURAS do apêndice do artigo, e
//     transcrição de figura erra trocando o lado de um ramo ou o valor de uma
//     folha — nenhum dos dois aparece como erro de execução. O teste confere as
//     22 folhas, o fechamento dos n com a raiz (948, 755, 578) e os SEIS valores
//     da tabela de valores da ferramenta oficial. Também barra a volta de M1/M3,
//     que não constam do artigo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-calc-sophia.js')], { stdio: 'pipe' });
  ok('regressão SOPHIA: 22 folhas + n fechando + 10 valores da tabela oficial + M1/M3 por proporção');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do SOPHIA falhou (verifique sophiaM24/sophiaM60 no index.html):\n' + out);
}

// 13. Acréscimos ao painel do professor: Favoritos (container com id PRÓPRIO,
//     senão a lista do aluno escondida é que seria alvo do getElementById),
//     calculadoras agrupadas por área (títulos precisam de grid-column:1/-1) e o
//     perfil profissional no Analytics (percentual sobre quem INFORMOU).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-painel-professor.js')], { stdio: 'pipe' });
  ok('regressão painel do professor: favoritos + calculadoras por área + perfil profissional');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do painel do professor falhou (verifique renderFavoritos/initCalc/admAnalyticsHTML no index.html):\n' + out);
}

// 14. REPESCAGEM DE ACESSO ABERTO: o PMC de um artigo aparece dias DEPOIS da
//     publicação e o radar pega o artigo no primeiro dia — a resposta "não tem
//     PMC" era calculada uma vez e valia para sempre, deixando o artigo fora da
//     discussão completa. O teste cobre a cadeia (repescar → `qualifica()` passa
//     a dizer sim), a guarda do link editado à mão e a ordem dentro do runRadar.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-pmc-repescagem.js')], { stdio: 'pipe' });
  ok('regressão repescagem de acesso aberto: destrava a discussão + não sobrescreve link manual');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da repescagem de acesso aberto falhou (verifique lib/pmc-repescagem.js + runRadar em lib/radar.js):\n' + out);
}

// 15. CARD "sem acesso há 14+ dias" no Analytics. O defeito que o teste pega é a
//     escolha do campo de data: `last_sign_in_at` não muda em sessão persistente,
//     então a lista de "sumidos" montada sobre ele apontaria os alunos ATIVOS — e
//     o professor manda mensagem para os nomes dessa lista. Também cobre a
//     exclusão de cortesia e degustação.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-analytics-sumidos.js')], { stdio: 'pipe' });
  ok('regressão card de sumidos: último USO (não último login) + só pagante');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do card de sumidos falhou (verifique admSumidosCardHTML/admDiasSemUso no index.html):\n' + out);
}

// 16. LIBERAR EM LOTE nos Resumos. O lote não pode alcançar item fora do recorte
//     que a grade mostra (outra sub, outro modo, outro tipo) — o professor
//     publicaria sem saber o quê — e a gravação tem de ser UMA, fora do laço:
//     o payload tem ~8,5 MB e uma escrita por item seriam N uploads inteiros.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-liberar-lote.js')], { stdio: 'pipe' });
  ok('regressão liberar em lote: recorte da grade + uma gravação só');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da liberação em lote falhou (verifique _admRascunhosDaSub/btn-ref-liberar-lote no index.html):\n' + out);
}

// 17. CURADORIA da Questão do Dia: toda subespecialidade de DIR_SUBS precisa ter
//     UM curador. "Endocrinologia Básica" estava sem nenhum — questão gerada com
//     esse rótulo caía em "(sem responsável)" e não entrava na fila de professor
//     algum, sem erro e sem log. Cobre também sub com dois donos e item solto no
//     seletor do gerador (foi assim que "Transgeneridade" saía duplicada).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-curadoria-qotd.js')], { stdio: 'pipe' });
  ok('regressão curadoria QdD: nenhuma sub órfã nem com dois donos + seletor sem duplicata');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da curadoria da Questão do Dia falhou (verifique QOTD_CURATORS/DIR_SUBS/loteSubs no index.html):\n' + out);
}

// 18. ARTIGO é conteúdo só de Resumos, nunca da aba Diretrizes. O card do artigo
//     trazia "📢 Publicar", que move o item para as Diretrizes — leitura crítica
//     de um trial no meio das recomendações de sociedade, e para todo mundo.
//     Cobre as DUAS camadas: o botão sumiu para artigo e o filtro exclui artigo
//     da aba Diretrizes (aluno e professor, com e sem filtro de tipo).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-artigo-so-nos-resumos.js')], { stdio: 'pipe' });
  ok('regressão artigo só nos Resumos: fora das Diretrizes + sem botão Publicar');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de "artigo só nos Resumos" falhou (verifique dirSoNosResumos/dirIsVisible/toggleBtn no index.html):\n' + out);
}

// 19. PONTE RSS → PUBMED: item vindo de RSS de revista entra sem PMID e com o
//     link da editora, então a repescagem de acesso aberto nem o enxergava (97
//     itens, 23 de tipo que renderia discussão, travados). O teste cobre acima
//     de tudo a GUARDA DE TÍTULO: casar um "parecido" reescreve o link do card
//     para OUTRO artigo — errar aqui é pior que não fazer nada.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ponte-rss-pubmed.js')], { stdio: 'pipe' });
  ok('regressão ponte RSS→PubMed: guarda de título exata + marca de tentativa + ordem no runRadar');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da ponte RSS→PubMed falhou (verifique lib/pmc-repescagem.js + runRadar):\n' + out);
}

// ⚠️ A caixa "Na prática" da newsletter — o dado que alimenta um bloco OPCIONAL.
//     Em 02/08/2026 o rótulo do mural mudou e `extractFromTexto` ficou só com o
//     antigo: `porque` virou string vazia e o template pula a caixa quando ela é
//     falsy. O e-mail do dia saiu com a caixa em 1 de 3 artigos, SEM erro em log
//     nenhum. Perder dado que alimenta bloco condicional é invisível em produção
//     — o teste é o único lugar onde "veio vazio" faz barulho.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-newsletter-porque.js')], { stdio: 'pipe' });
  ok('regressão newsletter: a caixa "Na prática" sobrevive aos dois rótulos + campo do radar primeiro');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da caixa "Na prática" da newsletter falhou (verifique lib/newsletter.js):\n' + out);
}

// ⚠️ Allowlist de fontes do Breaking News. Em 03/08/2026 dois cards de
//     "aprovação do FDA" entraram no mural publicados por **FC Bayern** — um site
//     de futebol — porque a checagem era `nome.indexOf('bayer') >= 0` e
//     `'fc bayern'.indexOf('bayer') === 3`. O card afirma que um medicamento foi
//     aprovado e diz "Fonte: FDA": fonte errada aqui é informação clínica sem
//     procedência, não ruído de curadoria.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-news-fonte-confiavel.js')], { stdio: 'pipe' });
  ok('regressão fontes do Breaking News: nome por palavra inteira + domínio por hostname');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da allowlist de notícias falhou (verifique lib/news.js):\n' + out);
}

if (errors) { console.error(`\n${errors} verificação(ões) falharam.`); process.exit(1); }
console.log('\nTodas as verificações passaram.');
