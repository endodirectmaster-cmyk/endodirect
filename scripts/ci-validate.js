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

// ⚠️ Campanha de recuperação por e-mail. É o único caminho do repositório que
//     dispara mensagem para PESSOAS REAIS, e e-mail enviado não tem desfazer.
//     As guardas: idempotência por chave de campanha (o cron roda todo dia),
//     opt-out respeitado, números contados na hora do envio e aborto quando não
//     há conteúdo para anunciar.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-winback-novidades.js')], { stdio: 'pipe' });
  ok('regressão campanha de recuperação: idempotente + opt-out + números contados na hora');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da campanha de recuperação falhou (verifique lib/trial-emails.js):\n' + out);
}

// ⚠️ Hipogonadismo SBEM/SBU/ABEMSS 2026: dois erros de FATO estavam no bloco que
//     ancora toda a geração de IA ("repetir em 2 dias" e "Ht >54%" como
//     contraindicação), e metade dos geradores clínicos não recebia diretriz
//     nenhuma. Ver cofre/Diretrizes Clínicas.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-hipogonadismo-2026.js')], { stdio: 'pipe' });
  ok('regressão hipogonadismo 2026: números do posicionamento + geradores clínicos ancorados');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do hipogonadismo 2026 falhou (verifique CLINICAL_GUIDELINES e groundSys no index.html):\n' + out);
}

// ⚠️ "Alunos com atividade" era ACUMULADO desde sempre e passava por indicador
//     de engajamento — um número que só cresce e nunca cai. Agora o KPI tem
//     janela de 30 dias, com o acumulado como linha de apoio.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ativos-janela.js')], { stdio: 'pipe' });
  ok('regressão ativos: o número grande é o da janela de 30 dias, não o acumulado');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de ativos por janela falhou:\n' + out);
}

// ⚠️ Anual x mensal no painel. A distinção vem do `tipo` que o CHECKOUT grava —
//     deduzir por duração faz um mensal renovado 12 vezes virar 'anual'.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ciclo-cobranca.js')], { stdio: 'pipe' });
  ok('regressão ciclo de cobrança: anual x mensal sai do checkout, não de palpite por duração');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do ciclo de cobrança falhou:\n' + out);
}

// ⚠️ Reengajamento do assinante parado 14+ dias. Diferente das campanhas de
//     disparo único, a condição NÃO expira sozinha: sem o cooldown, as mesmas
//     pessoas receberiam o mesmo e-mail todo dia.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-reengajamento.js')], { stdio: 'pipe' });
  ok('regressão reengajamento: cooldown, opt-out, títulos reais do mural e sem repetição');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do reengajamento falhou (verifique lib/trial-emails.js e a RPC endodirect_reengajamento_alvos):\n' + out);
}

// ⚠️ Resumos nunca em branco + logo legível no celular. A tela de Resumos ficava
//     só com o cabeçalho quando a carga falhava (a semente local não tem nenhum
//     capítulo privado), e o erro morria num .catch mudo. O logo azul-marinho
//     era forçado no celular e sumia no tema escuro.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-resumos-e-logo.js')], { stdio: 'pipe' });
  ok('regressão Resumos/logo: falha de carga é visível e retentável; logo segue o tema');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de Resumos/logo falhou (verifique carregarResumos e o bloco .tb-logo do celular):\n' + out);
}

// ⚠️ Andrologia = Endocrinologia Masculina. O Analytics mostrava as duas como
//     linhas separadas (84 questões contra 3). A área NÃO entra na chave de
//     merge de `provas`, então uma aba antiga reescreveria o rótulo de volta.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-area-canonica.js')], { stdio: 'pipe' });
  ok('regressão área canônica: Andrologia não volta a se separar de Endocrinologia Masculina');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da área canônica falhou (verifique canonProvaArea no index.html):\n' + out);
}

// ⚠️ "Apaguei do mural" tem de valer para o ALUNO. O item apagado sumia da tela
//     do professor e continuava publicado: o gatilho do banco restaurava
//     radar_avisos e as RPCs de conteúdo ignoravam radar_hidden. Ficaram 4 itens
//     apagados no ar, entre eles duas notícias falsas.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-mural-apagado.js')], { stdio: 'pipe' });
  ok('regressão mural apagado: o cron não mantém nem recolhe o que o professor excluiu');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do mural apagado falhou (verifique lib/radar.js e supabase/mural-apagado-vale-para-o-aluno.sql):\n' + out);
}

// ⚠️ Aula ao vivo. A regra do professor é que a aula é aberta a quem SE CADASTRA
//     (é a porta de entrada) e a gravação é só de assinante. Se o link do stream
//     vazasse para o visitante, a funcionalidade perderia o propósito inteiro —
//     por isso o corte é na RPC, e este teste falha se voltar a ser só de tela.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-aula-ao-vivo.js')], { stdio: 'pipe' });
  ok('regressão aula ao vivo: link só para quem tem conta; gravação só p/ assinante; aviso não repete');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da aula ao vivo falhou (verifique supabase/aula-ao-vivo.sql, lib/aovivo.js e aoVivo* no index.html):\n' + out);
}

// ⚠️ TETO do bloco clínico. `api/ai.js` corta o prefixo cacheável num teto fixo e
//     o que se perde é o FIM do bloco — sem erro, sem log, sem nada quebrar na
//     tela: a IA simplesmente passa a gerar sem aquela diretriz. Em 07/08 o núcleo
//     estava a 341 caracteres do corte.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-teto-diretrizes.js')], { stdio: 'pipe' });
  ok('teto do bloco clínico: núcleo dentro do limite + camada profunda por subespecialidade ligada');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('teto do bloco clínico falhou (verifique CLINICAL_GUIDELINES, lib/clinical-deep.js e api/ai.js):\n' + out);
}

// ⚠️ TEXTO DE ARTIGO NO REPOSITÓRIO PÚBLICO. Medido em 08/08/2026: 72% de um
//     artigo Elsevier por assinatura estava reconstituível verbatim aqui, somando
//     as citações de um extrato. Cada citação isolada é legítima; a SOMA não era.
//     O extrato passou a guardar offset+hash; este teste impede que o texto volte.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-citacao-nao-publicada.js')], { stdio: 'pipe' });
  ok('citações: extratos versionados guardam referência, não o texto do artigo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('texto literal de artigo prestes a ser publicado:\n' + out);
}

// ⚠️ RESSALVAS × NÚCLEO. O campo `conflito` de um extrato é uma FOTOGRAFIA do
//     núcleo no dia da leitura, e a varredura do acervo CORRIGE o núcleo — é
//     metade do objetivo dela. Toda correção envelhece a ressalva do artigo que
//     a motivou. Medido em 07/08/2026: 6 das 13 ressalvas citavam texto já
//     substituído, e a do prolactinoma mandava sobrescrever uma entrada JÁ CERTA.
//     A trava é a mesma dos fatos: citação literal do núcleo, conferida.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-ressalvas.js')], { stdio: 'pipe' });
  ok('ressalvas da base profunda: direção declarada e citações do núcleo conferidas');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('conferência das ressalvas falhou (o núcleo mudou e alguma ressalva ficou para trás):\n' + out);
}

// ⚠️ E UM NÍVEL ABAIXO: o FATO que restitui o núcleo dentro de `afirmacao`.
//     A trava acima confere `conflito` e `nucleo_citado`, que são campos DO
//     EXTRATO — e por isso ficou verde em 09/08/2026 enquanto 15 fatos, em 5
//     extratos, restituíam o núcleo por escrito dentro de `fatos[].afirmacao`,
//     onde nenhuma peneira olhava. Um deles dizia que "o núcleo manda
//     propiltiouracil no 1º trimestre e metimazol depois". Corrigi o núcleo (o
//     marco da ATA 2026 é 16 SEMANAS, e passado ele a escolha do antitireoidiano
//     é DECLARADA DESCONHECIDA) e o fato virou mentira: passou a mandar trocar a
//     gestante de volta para metimazol exatamente onde a diretriz se recusa a
//     recomendar. Ficou três dias assim, com o cabeçalho do extrato certo.
//     A regra é a do `cit_sha`: texto que copia outro texto carrega selo do que
//     copiou. Achado pela auditoria adversarial, não por teste — por isso virou
//     teste.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-nucleo-nos-fatos.js')], { stdio: 'pipe' });
  ok('núcleo restituído dentro dos fatos: selo confere com o núcleo de hoje');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('há fato que restitui o núcleo com selo velho — releia antes de selar:\n' + out);
}

// ⚠️ O PDF COME O SINAL DE MENOS, E O CORTE TROCA DE LADO. Achado pela auditoria
//     adversarial do Manual Brasileiro de Osteoporose (09/08/2026): um fato
//     publicava `escore T ≤ 2,5`, sem o menos — o que diagnostica osteoporose em
//     densidade NORMAL e manda tratar com antirreabsortivo. O extrator até
//     declarara ter retido DOIS outros escores T pelo mesmo motivo; cuidou de
//     dois e o terceiro passou. Cuidado manual não escala.
//     Esta guarda é estreita de propósito — só escore T e escore Z, onde a
//     direção é conhecida (OMS: osteoporose é T ≤ −2,5). Por isso ela pode ser
//     CI, enquanto a varredura de "cabeça perdida" ficou só no brief do auditor:
//     medida no mesmo dia, aquela dava ~85% de falso positivo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-sinal-de-corte.js')], { stdio: 'pipe' });
  ok('sinal dos cortes: nenhum escore T/Z publicado sem o menos');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('corte de escore T/Z sem o sinal de menos — o PDF comeu o hífen:\n' + out);
}

// ⚠️ O QUE ESTÁ NO AR TEM DE SER O QUE FOI EXTRAÍDO. Buraco medido em
//     09/08/2026: um extrato chegou com `tipo` fora do vocabulário fechado, o
//     `monta-base-profunda.js` ABORTOU (corretamente, para não rebaixar em
//     silêncio uma revisão ao tier de relato de caso) — e este arquivo passou
//     VERDE assim mesmo, porque validava o `clinical-deep-data.js` já
//     construído, que seguia consistente e apenas VELHO. TRÊS artigos
//     extraídos, verificados e commitados podiam existir no repositório sem
//     chegar a médico nenhum, e nada acusava. É a versão estrutural de
//     "extração verificada não é entrega".
//     A guarda é a INVARIANTE, não uma peneira nova: remontar e exigir
//     igualdade byte a byte pega o extrato que aborta a montagem E o "esqueci de
//     rebuildar". Copiar só a checagem do `tipo` daria confiança falsa sobre as
//     outras condições de aborto.
try {
  execFileSync(process.execPath, [path.join('scripts', 'monta-base-profunda.js'), '--conferir'], { stdio: 'pipe' });
  ok('base profunda no ar: o `clinical-deep-data.js` é o que os extratos produzem hoje');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('a base profunda commitada não corresponde aos extratos:\n' + out);
}

// ⚠️ O MESMO ARTIGO EXTRAÍDO DUAS VEZES. Achado em 09/08/2026 varrendo a fila:
//     **5 títulos têm DOIS fileId** no `fila-extracao.json`, e num deles — o
//     diabetes insipidus central — um id JÁ foi extraído (169 fatos) e o outro
//     seguia na fila marcado como pendente. Nada impedia a leva seguinte de
//     extraí-lo de novo. Duplicata não é só desperdício: dobra o peso do artigo
//     na seleção por tema, come teto de área em dobro, e faz a IA ver a mesma
//     afirmação duas vezes — o que soa como confirmação independente sem ser.
//     Medido ao entrar: 44 extratos, 44 títulos distintos, zero duplicados.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-artigo-duplicado.js')], { stdio: 'pipe' });
  ok('artigo duplicado: nenhum artigo extraído duas vezes sob ids diferentes');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('o mesmo artigo foi extraído mais de uma vez:\n' + out);
}

// ⚠️ PROVA COPIADA ENTRE FATOS. A auditoria do GIOP achou QUATRO fatos com a
//     MESMA citação byte a byte — mesmo offset, mesmo tamanho, mesmo `cit_sha`.
//     A fatia provava o primeiro; os outros três afirmavam preferência de
//     fármaco cuja frase ficava 100–400 chars adiante, na mesma célula da
//     tabela. E o `verifica-extracao.js` passou VERDE nos três: a peneira dele é
//     de NÚMEROS, e o único número daquelas afirmações era o "40" do cabeçalho
//     "adults ≥40 years", que a fatia continha. Prova fabricada com número
//     emprestado.
//     Escopo medido antes de virar guarda: "fármaco na afirmação e ausente da
//     citação" em QUALQUER fato dá 176 de 6.197 (2,8%, quase tudo legítimo — a
//     fonte escreve a classe, o fato nomeia o agente). Restrito a fatos com
//     citação IDÊNTICA à de outro, dá 2, e zero depois de aceitar a abreviatura
//     da própria diretriz (`rom`, `den`, `ral`). Citação repetida é a assinatura
//     do copia-e-cola: é onde falhar volta a significar alguma coisa.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-farmaco-na-citacao.js')], { stdio: 'pipe' });
  ok('fármaco na citação: nenhum agente afirmado sem lastro na fatia que o prova');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('fármaco nomeado na afirmação e ausente da citação dela:\n' + out);
}

// ⚠️ O CAMPO `auditoria` SIGNIFICA UMA COISA SÓ. Ele chegou a ter três formatos
//     convivendo — string do legado, objeto com `achado` (auditoria de verdade)
//     e objeto que o extrator usava como bloco de notas. Medido em 08/08/2026:
//     contando o bloco de notas como auditoria, a base parecia 100% auditada
//     quando estava em 93%. Erro na direção que ENCERRA o assunto, porque
//     ninguém revisita o que já está verde. Nota de extração vai em `extracao`.
try {
  execFileSync(process.execPath, [path.join('scripts', 'status-auditoria.js')], { stdio: 'pipe' });
  ok('campo `auditoria`: só auditoria adversarial, nota de extração em `extracao`');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('campo `auditoria` malformado — a contagem de cobertura vai errar em silêncio:\n' + out);
}

// ⚠️ CONDIÇÃO DE COLETA NO NÚCLEO. Regra do professor que estava no cofre sem
//     nenhuma guarda: um valor de exame sem a condição em que foi colhido é
//     OUTRO número — testosterona de 300 às 7 h em jejum não é 300 às 16 h. E o
//     núcleo vai em TODA chamada de IA, então a entrada que manda pedir um exame
//     sem dizer como colhê-lo ensina o erro em toda geração da plataforma.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-coleta-nucleo.js')], { stdio: 'pipe' });
  ok('condição de coleta: entrada de núcleo que pede exame diz como colhê-lo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('entrada de núcleo pede exame sem a condição de coleta:\n' + out);
}

// ⚠️ CAMINHO CLÍNICO. Extração verificada NÃO é entrega: o projeto já perdeu
//     artigos inteiros por roteamento, com o conteúdo certo na base e
//     inalcançável (a contraindicação de bisfosfonato devolvendo 0 caractere, os
//     154 fatos de hirsutismo arquivados em Adrenal, `CAD` devolvendo ""). E o
//     teste mede as DUAS pontas: cair na área certa e o bloco devolvido conter
//     mesmo o assunto — "EHH em idoso" roteava certo e voltava sem uma linha
//     sobre estado hiperosmolar.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-caminho-clinico.js')], { stdio: 'pipe' });
  ok('caminho clínico: a pergunta do médico chega ao artigo que a responde');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('roteamento ou chegada do bloco clínico regrediu:\n' + out);
}

// ⚠️ ÂNCORA AMBÍGUA. A citação por offset prova que o TEXTO não foi adulterado —
//     nunca provou que ele veio do LUGAR certo. Onde o artigo repete um trecho
//     (tabela de adulto e de criança com linhas idênticas), `referenciar` ancora
//     na PRIMEIRA ocorrência e o `cit_sha` confere do mesmo jeito, porque as duas
//     resolvem para o mesmo texto. Medido em 08/08/2026: dois fatos PEDIÁTRICOS
//     citavam a tabela de ADULTO, com o verificador aprovando. Reprova só o caso
//     de risco (o fato fala de população E ancora na 1ª ocorrência); repetição
//     benigna — a recomendação impressa no resumo e de novo no corpo — só avisa.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-ancoragem.js')], { stdio: 'pipe' });
  ok('âncora das citações: nenhum fato de população provado por trecho ambíguo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('citação ancorada em trecho que aparece em mais de um lugar do artigo:\n' + out);
}

// ⚠️ Endocrinologia PEDIÁTRICA no Analytics. O risco não é o número, é a leitura
//     dele: "0" sem a cobertura da pergunta faz parecer "não tenho nenhum
//     endocrinopediatra" quando a verdade é "ainda não perguntei" (0 de 53).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-endocrino-pediatrica.js')], { stdio: 'pipe' });
  ok('regressão endocrino pediátrica: conta só quem declarou + mostra a cobertura da pergunta');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de endocrinologia pediátrica falhou (verifique ATUACAO_* e admPedHTML no index.html):\n' + out);
}

// ⚠️ A figura da Questão do Dia precisa ter a ver com a questão. O app anexava o
//     PRIMEIRO resultado do Open-i sem conferir nada, e a busca do Open-i casa o
//     TEXTO DO ARTIGO — uma prancha de oncologia de 6 painéis ilustrou uma questão
//     de prolactina cujo enunciado dizia que a RM de sela era NORMAL.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-imagem-questao.js')], { stdio: 'pipe' });
  ok('regressão imagem da questão: figura conferida contra a busca; exame normal não é ilustrado');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da imagem da questão falhou (verifique igImgRelevante/IG_IMAGEQUERY_RULE no index.html):\n' + out);
}

// ⚠️ O save do painel apagava, em silêncio, edição feita direto no banco. Em
//     06/08 as tabelas do posicionamento de hipogonadismo foram gravadas às 12:30
//     e sumiram às 12:48 no save de uma aba aberta desde antes: mergeConcurrent só
//     acrescentava chave nova e descartava alteração em item já existente.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-merge-servidor.js')], { stdio: 'pipe' });
  ok('regressão merge com o servidor: edição server-side sobrevive ao save do painel');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do merge com o servidor falhou (verifique mergeConcurrent/itemSig no index.html):\n' + out);
}

// ⚠️ Feedback do aluno. O botão "Enviar" ficou meses trocando a tela pelo
//     "Obrigado pelo feedback!" e DESCARTANDO o texto — sem erro em log nenhum.
//     Como a plataforma agora CONVIDA quem assina há mais de 30 dias, voltar
//     àquele comportamento seria pior do que não perguntar nada.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-feedback.js')], { stdio: 'pipe' });
  ok('regressão feedback: envia de verdade + convite só para quem o banco autoriza');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do feedback falhou (verifique index.html):\n' + out);
}

// ⚠️ Capa dos cursos. O professor reprovou os ícones ("está muito feio esses
//     ícones") e o conserto se desfaz calado de dois jeitos: alguém volta ao
//     emoji (que cada sistema desenha do seu jeito) ou duas subespecialidades
//     passam a dividir o mesmo desenho — e os cards voltam a ser idênticos.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-capa-curso.js')], { stdio: 'pipe' });
  ok('regressão capa dos cursos: SVG por subespecialidade nos dois painéis, sem slug cru');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da capa dos cursos falhou (verifique cursoCapaHTML/CURSO_TEMAS no index.html):\n' + out);
}

if (errors) { console.error(`\n${errors} verificação(ões) falharam.`); process.exit(1); }
console.log('\nTodas as verificações passaram.');
