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

// 17b. ARQUIVO da Questão do Dia na tela do ALUNO: a de HOJE tem de ser a 1ª
//      linha. O arquivo do aluno renderizava na ordem crua do array (mais ANTIGA
//      primeiro) e, com 52 publicadas, a do dia era a 52ª — enquanto o arquivo do
//      PROFESSOR já ordenava por data, o que tornava o defeito invisível da tela
//      dele. Reclamação real de 15/08/2026: "questões diárias não estão mais
//      aparecendo desde o dia 5 de agosto". A publicação nunca falhou um dia.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-qotd-arquivo-aluno.js')], { stdio: 'pipe' });
  ok('arquivo da QdD do aluno: a de hoje é a 1ª linha, marcada e aberta — e as duas telas ordenam igual');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do arquivo da Questão do Dia (aluno) falhou:\n' + out);
}

// 17c. ENQUETE do programa de Educação Médica Continuada: é benefício EXCLUSIVO
//      do plano Gold — se vazar para Standard ou degustação, a exclusividade que
//      o plano vende deixa de existir, e isso não dá erro nenhum: some da tela do
//      professor e só o cliente enxerga. Cobre também o teto de 3 escolhas e a
//      trava de não gravar seleção parcial (defeito real da 1ª versão: o clique
//      no chip escrevia em DB e qualquer persist() do app mandava meio voto).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-enquete-cme.js')], { stdio: 'pipe' });
  ok('enquete EMC: só Gold enxerga, teto de 3, e seleção parcial não vira voto');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da enquete de Educação Médica Continuada falhou:\n' + out);
}

// 17d. ATIVAÇÃO DA PRIMEIRA SESSÃO + META ESCOLHIDA. Medido em 19/08/2026: de
//      112 cadastrados, 58 nunca responderam nada — e 53 DELES fizeram login.
//      E dos 91 com meta gravada, todos os 91 tinham exatamente 50, o valor com
//      que o DB nasce: nenhum aluno jamais tocou no seletor.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ativacao.js')], { stdio: 'pipe' });
  ok('ativação: card não-dispensável nas duas entradas, responder conta como estudo, meta escolhida');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da ativação da primeira sessão falhou:\n' + out);
}

// 17e. JANELAS DE ENTRADA (30/08/2026). O professor pediu a enquete da EMC
//      "aparecendo na janela assim que o aluno abre a plataforma — depois que
//      responder, não abrir novamente" e a primeira questão logo depois da
//      janela inicial de perfil. ⚠️ A JANELA NÃO SUBSTITUI O CARD: o card
//      não-dispensável do item 17d continua no Mural, senão volta o defeito
//      que ele foi criado para consertar (modal que some com um clique e nunca
//      mais volta na sessão). A fila é EXECUTADA no teste — conferir texto
//      provaria que a linha existe, não que ela escolhe certo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-janelas-de-entrada.js')], { stdio: 'pipe' });
  ok('janelas de entrada: primeira questão depois do perfil, enquete só do Gold e só até o voto, uma de cada vez');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão das janelas de entrada do aluno falhou:\n' + out);
}

// 17f. DASHBOARD DO ALUNO (30/08/2026). Trilho lateral com acervo e progresso,
//      Dashboard como tela de início, "Mural de artigos"/"Banco de questões" e a
//      saída da geração por IA. ⚠️ A varredura de REFERÊNCIAS ÓRFÃS mora aqui e
//      é geral: `getElementById('x').algo` sobre elemento removido lança, e um
//      throw na fiação mata todos os listeners depois dele — o apagão que o
//      cofre registra duas vezes. Vale para qualquer remoção futura.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-dashboard-aluno.js')], { stdio: 'pipe' });
  ok('dashboard do aluno: trilho batendo com as abas, Dashboard de entrada, nomes novos e nenhuma referência órfã');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do dashboard do aluno falhou:\n' + out);
}

// 17g. VITRINE COMO CONTA REAL (31/08/2026). `alunopro` tinha a senha em texto
//      puro no index.html — arquivo servido a qualquer um — e nenhuma sessão no
//      servidor. ⚠️ Sem sessão, NENHUM gate conseguia distinguir a vitrine de um
//      visitante: foi o que deixou `endodirect_showcase_resumos` aberta a `anon`
//      com 161 itens privados de assinante. Este teste guarda a senha fora do
//      bundle, a rota especial fora do cliente, e o login caindo no Supabase —
//      sem quebrar as contas locais restantes, que dividem o mesmo fluxo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-vitrine-conta-real.js')], { stdio: 'pipe' });
  ok('vitrine: conta real, senha fora do bundle, rota aberta desligada e login do admin intacto');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da vitrine como conta real falhou:\n' + out);
}

// 17h. A LETRA DA PLATAFORMA (31/08/2026). O token era uma PILHA DE SISTEMA, e
//      por isso o Endodirect tinha uma cara diferente em cada aparelho. ⚠️ As
//      duas metades (token + carga da fonte) falham em SILÊNCIO quando
//      separadas: a tela continua legível, só que com a letra errada.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-fonte-da-plataforma.js')], { stdio: 'pipe' });
  ok('fonte: Inter na frente do token, carregada com swap e reserva de sistema intacta');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da fonte da plataforma falhou:\n' + out);
}

// 17i. PROGRAMA DE EMC COMO BENEFÍCIO DO GOLD (31/08/2026). ⚠️ São DUAS listas
//      separadas: a landing tem os benefícios em MARKUP, e a tela de compra
//      monta a partir de `ENDO_TIERS`. Mexer numa e esquecer a outra dá a pior
//      forma de erro comercial — a propaganda promete o que a tela de pagamento
//      não lista, nada quebra e ninguém vê.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-emc-no-plano-gold.js')], { stdio: 'pipe' });
  ok('Programa de EMC: benefício do Gold na landing E na compra, destacado e fora do Standard');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do Programa de EMC no plano Gold falhou:\n' + out);
}

// 17j. A VITRINE NÃO MENTE (31/08/2026). 🧨 Três vezes no mesmo dia um texto de
//      vitrine sobreviveu à mudança do produto: o banner da degustação, o FAQ
//      dos planos e o card "Questões por IA". É um defeito que NÃO QUEBRA NADA —
//      nenhum teste falha, nenhuma tela some, só o anúncio deixa de
//      corresponder. A guarda cobre recurso retirado ainda anunciado, instrução
//      que manda clicar em botão inexistente, e tamanho prometido acima do
//      acervo real.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-vitrine-nao-mente.js')], { stdio: 'pipe' });
  ok('vitrine: sem recurso retirado anunciado, instruções citam controles que existem, tamanho cabe no acervo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da vitrine falhou:\n' + out);
}

// 17c-bis. A VIDEOAULA TOCA. 104 das 106 aulas são HLS (.m3u8 do Bunny) e o
//      player mandava o .m3u8 direto para o `src` de um <video> — o que nenhum
//      navegador além do Safari reproduz. Ficava preto, sem mensagem. A guarda
//      exige o .m3u8 em `data-hls` com o hls.js montado nos dois players, e
//      cobre os capítulos (formato do Bunny, ordem, escape, campo do admin).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-aula-capitulos.js')], { stdio: 'pipe' });
  ok('videoaula: HLS montado nos dois players e capítulos clicáveis embaixo do vídeo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da videoaula falhou:\n' + out);
}

// 17d. CADÊNCIA DO RADAR: o mural precisa de mais de uma varredura por dia. Com
//      uma só (07:30 BRT), notícia publicada depois dela só aparece no dia
//      seguinte — foi a queixa de 17/08/2026 (ANVISA aprovando canetas de
//      semaglutida às 11:02, 3h32 após a varredura). Nada estava quebrado: a
//      fonte funciona e o filtro deixaria passar; o defeito era a latência.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-radar-cadencia.js')], { stdio: 'pipe' });
  ok('cadência do radar: mais de uma varredura por dia e fontes regulatórias preservadas');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da cadência do radar falhou:\n' + out);
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

// ⚠️ A peneira de citação truncada reprovava DIRETRIZ BRASILEIRA GRADUADA (21/08/2026).
//     "Classe I / Nível A" fecha a recomendação da SBD, e o "A" final casava com o
//     "a" preposição de CAUDA_RUIM: 8 de 16, 9 de 30 e 5 de 17 citações reprovadas
//     nas três diretrizes SBD 2026, nenhuma truncada de verdade. Este teste trava as
//     duas pontas — grau passa, cauda cortada de verdade continua reprovando.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-cauda-graduacao.js')], { stdio: 'pipe' });
  ok('cauda truncada: grau de diretriz passa, frase cortada de verdade segue reprovando');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('peneira de citação truncada com comportamento errado:\n' + out);
}

// ── POPULAÇÃO na guarda de âncora ambígua: "gravidade" não é "grávida" ───────
// Mesma família de defeito do CAUDA_RUIM acima: um radical curto casando palavra
// que não tem nada a ver. `gravid` marcava como DE RISCO 80 afirmações do acervo
// que falam de GRAVIDADE do quadro, e — pior — NÃO casava "grávida" acentuada,
// deixando passar exatamente o caso que a guarda existe para pegar.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-gravidade-nao-e-gestacao.js')], { stdio: 'pipe' });
  ok('âncora ambígua: gravidade do quadro não vira gestante, e grávida acentuada não escapa');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regex de população da confere-ancoragem com comportamento errado:\n' + out);
}

// ── QUEBRA RÍGIDA no markdown do resumo ──────────────────────────────────────
// O professor mandou print (21/08) de "Retinopatia, Neuropatia e Pé Diabético"
// com `**` cru na tela e bullet fora do lugar: o `mdToHtml` lia LINHA A LINHA e
// dava `trim()`, apagando o recuo que marcava a continuação. Medido no acervo:
// 19 capítulos com negrito partido, 334 linhas. Depois da correção, ZERO.
// O mesmo defeito comia o `>` de `>130` (glicemia maior que 130) lendo-o como
// citação — um sinal de maior sumindo de uma regra de dose.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-quebra-rigida-no-resumo.js')], { stdio: 'pipe' });
  ok('quebra rígida no resumo: negrito atravessa a quebra, `>130` não vira citação, e lista/tabela/linha deliberada ficam de pé');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('desdobramento da quebra rígida com comportamento errado:\n' + out);
}

// ── PORTÃO DE ACESSO aos cursos de pacote ────────────────────────────────────
// O portão do Gold era um `if` com o slug no código. Ao criar a "Educação Médica
// Continuada" (24/08) ele passou a ler o `tier` do catálogo — a mesma regra do
// servidor. Isto separa quem pagou de quem não pagou: as duas pontas do erro
// custam caro, então as duas são testadas.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-curso-tier-gold.js')], { stdio: 'pipe' });
  ok('curso por tier: Gold entra, standard e degustação não, e a amostra grátis abre só a aula liberada');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('portão de acesso aos cursos com comportamento errado:\n' + out);
}

// ⚠️ IMPORTAR PDF. Em 25/08/2026 o professor gravou a tela importando a diretriz
// SBD 2026 de DM2 e recebendo "PDF muito grande para leitura por imagem". O
// tamanho era consequência: a extração de texto tinha falhado antes, e o `catch`
// que a precedia apagava a causa. Pior, PDF digitalizado é grande PORQUE é
// imagem — o único caso que precisava do fallback era exatamente o que ele
// recusava. Agora as páginas são renderizadas no navegador; este teste guarda a
// decisão, o orçamento de corpo e a honestidade da mensagem.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-import-pdf-digitalizado.js')], { stdio: 'pipe' });
  ok('importar PDF: digitalizado grande vai pelas páginas renderizadas e o erro diz a causa real');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('importador de PDF das diretrizes com comportamento errado:\n' + out);
}

// ⚠️ A BASE PUBLICADA NÃO PODE REPRODUZIR A FONTE (29/08/2026). As citações já
// viajavam protegidas (offset+hash), mas a `afirmacao` vai INTEIRA para o
// clinical-deep-data.js, que é versionado e servido. Ao assimilar uma apostila
// cujo autor escreve "NÃO AUTORIZO A REPLICAÇÃO", a varredura achou SEIS trechos
// em que a minha paráfrase reproduzia a frase dele — reescrever devagar uma frase
// boa devolve a frase boa. Fato pode coincidir; a frase que o organiza, não.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-nao-reproduz-fonte.js')], { stdio: 'pipe' });
  ok('base publicada não reproduz período do texto-fonte (pula, dizendo, se os textos não estiverem no clone)');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('a base clínica publicada reproduz texto da fonte:\n' + out);
}

// ⚠️ PUSH A PARTIR DO CARD (28/08/2026). O professor pediu para disparar no push
// a aprovação do Mounjaro, e o caminho não existia: o push só saía ao PUBLICAR um
// aviso MANUAL. Notificar sobre notícia do radar exigiria convertê-la em aviso —
// e a conversão apaga `sourceId`, `breaking` e `auto`, quebrando a dedup da
// captação seguinte. O botão lê o card e não o altera; e confirma antes, porque
// vai para todos os aparelhos e não tem desfazer.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-push-do-mural.js')], { stdio: 'pipe' });
  ok('push do mural: botão em todo card, confirma com o texto à vista e não escreve no item');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('botão de notificar do mural com comportamento errado:\n' + out);
}

// ⚠️ FEED OFICIAL MUDO (28/08/2026). O professor mostrou a aprovação
// cardiovascular do Mounjaro e disse "não pegou essa info no mural". O defeito
// não era o filtro — era o silêncio: `fetchFeed` nunca lança (para não derrubar
// o radar) e também não avisa. Medido: ZERO item da Lilly em 1.019 do acervo,
// com o feed oficial na lista desde sempre. Fail-safe é para não derrubar, não
// para não contar.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-radar-feed-mudo.js')], { stdio: 'pipe' });
  ok('radar: a notícia atravessa o pipeline e feed oficial mudo vira alerta');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('radar de notícias com comportamento errado:\n' + out);
}

// ⚠️ META DE LDL NO PREVENT (27/08/2026). A Diretriz Brasileira de Dislipidemias
// 2025 elege o PREVENT como ferramenta preferencial, então a meta entra na tela
// do escore. A armadilha: o escore dá o PISO da categoria, não a categoria —
// diabetes, LDL-c e agravantes SOBEM de faixa e nada desce. Escore de 2% com
// LDL-c 195 é ALTO risco, e ler só a faixa entregaria meta < 115 a quem precisa
// de < 70. Este teste guarda a escada, os números da tabela e a fiação.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-meta-ldl-prevent.js')], { stdio: 'pipe' });
  ok('meta de LDL no PREVENT: faixa sobe por diabetes/LDL-c, metas da tabela da SBC e gatilho de 30 mg/dL');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('meta de LDL-c da calculadora PREVENT com comportamento errado:\n' + out);
}

// ⚠️ AS PÁGINAS NO SERVIDOR. O importador manda PDF digitalizado como N imagens
// de página, e até 26/08 a montagem desse pedido em `api/ai.js` era guardada só
// por conferência de TEXTO do fonte. Texto não vê bloco fora de ordem, `type`
// errado, pedido perdido nem teto que não recuou. Este chama o handler REAL e
// inspeciona o corpo que sairia para a Anthropic. Nove mutações verificadas.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ai-paginas-servidor.js')], { stdio: 'pipe' });
  ok('páginas no servidor: blocos image na ordem certa, profundo recuando por página e caminhos antigos intactos');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('montagem do pedido com páginas de PDF com comportamento errado:\n' + out);
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

// ⚠️ AVISO DE ESCOPO ESCONDIDO NUM `alinhado`. O montador NÃO entrega a ressalva
//     quando `conflito_direcao` é `alinhado` — e a razão é boa (registro de
//     auditoria; o núcleo já foi corrigido a partir daquela fonte). Mas o campo
//     `conflito` acumulou um segundo papel: declarar **o que a fonte não
//     responde**, que é aviso de SEGURANÇA. No feocromocitoma, 2.704 chars
//     declarados `alinhado` incluíam "não traz corte de metanefrina, não traz
//     condição de coleta e NÃO TRAZ CONDUTA DE CRISE HIPERTENSIVA" — descartado
//     em silêncio, e a auditoria confirmou que aquele aviso não chegava por
//     nenhuma outra via (nem núcleo, nem tema, nem os 93 fatos).
//     ⚠️ A primeira versão do padrão dava 3 falsos positivos em 4 (pegava "não
//     há mais o que sobrescrever" e "o NÚCLEO não tem entrada sobre X"). Apertado
//     para exigir o SUJEITO explícito ("a fonte não traz…"): 1 de 4, e era o real.
try {
  execFileSync(process.execPath, [path.join('scripts', 'confere-escopo-alinhado.js')], { stdio: 'pipe' });
  ok('escopo em ressalva alinhada: nenhum aviso de segurança escondido em ressalva que não é entregue');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('ressalva de escopo dentro de um `alinhado` — ela não chega ao médico:\n' + out);
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

// ⚠️ Imagem inserida NO CORPO do resumo (diferente da figura do capítulo) passava
//     pelo editor WYSIWYG e sumia no salvar: o `htmlToMd` só serializava <img> que
//     estivesse DENTRO de um parágrafo, e ao inserir no cursor o navegador põe a
//     imagem como filho direto do contenteditable. Do outro lado, o `mdInline`
//     exigia `https?://` e devolvia o data:URL como TEXTO CRU na tela do aluno.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-imagem-no-corpo.js')], { stdio: 'pipe' });
  ok('imagem no corpo do resumo: sobrevive ao salvar/reabrir, na posição certa');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da imagem no corpo falhou (verifique htmlToMd/mdInline no index.html):\n' + out);
}

// ⚠️ Assinatura que vence sem renovar era INVISÍVEL: a CTE `plano` da RPC filtra
//     acessos vencidos, então quem caducou sumia do painel. Uma mensal venceu e o
//     único sinal foi o contador cair de 34 para 33 — percebido por acaso (11/08).
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-assinatura-vencida.js')], { stdio: 'pipe' });
  ok('assinatura vencida: renovação que não entrou aparece no painel, na ordem de urgência');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de assinatura vencida falhou (verifique admVencidasLista/admVencidasCardHTML):\n' + out);
}

// ⚠️ O botão "H" do editor DESTRUÍA conteúdo: `formatBlock` sobre uma seleção que
//     abrange mais de um bloco funde todos num só. Foi assim que os 4 itens da lista
//     do capítulo de Gestação viraram UM título gigante (11/08) — o capítulo saiu
//     todo em negrito e com as frases coladas. O htmlToMd não tem culpa: gravou
//     fielmente o <h3> único que o navegador criou.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-titulo-funde-blocos.js')], { stdio: 'pipe' });
  ok('título: recusa seleção multibloco (que fundia listas) e mantém o uso de uma linha');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do botão de título falhou (verifique wysSelecaoNumBlocoSo no index.html):\n' + out);
}

// ⚠️ O selo "🔒 Resumo privado" MENTIA e o "📢 Publicar" fazia o contrário do nome.
//     `privado` nunca significou escondido: significa "aba Resumos, dos assinantes",
//     e a RPC endodirect_member_resumos entrega esses itens a quem tem escopo `plano`.
//     O botão não publicava — MOVIA o capítulo para as Diretrizes, tirando-o de onde
//     o assinante o procura. O professor leu o cadeado, estranhou o botão e tinha
//     razão nas duas pontas (13/08). Artigo já tinha perdido o botão em 01/08.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-publicar-capitulo.js')], { stdio: 'pipe' });
  ok('resumos: sem botão de publicar capítulo, selo diz "no ar para assinantes" e as diretrizes reais seguem visíveis');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do botão Publicar/selo de resumo falhou:\n' + out);
}

// ⚠️ A FILA da Questão do Dia passou a reordenar por ARRASTE (as setas saíram).
//     `igStories` guarda postadas e não postadas no MESMO array: reordenar tem de
//     escrever só nas posições das não postadas, senão a postagem de ontem "anda"
//     no histórico. E o arraste usa Pointer Events com os ouvintes no document —
//     o drag nativo do HTML5 não funciona em toque, e `setPointerCapture` seria
//     liberado pelo `insertBefore`, cortando o arraste no meio.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-fila-arrastar.js')], { stdio: 'pipe' });
  ok('fila por arraste: reordena as não postadas e não move as postadas');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do arraste da fila falhou (verifique igAplicarOrdemFila/bindIgFilaDrag):\n' + out);
}

// ⚠️ O gerador de questões repetia a MESMA questão dentro do tema: cada uma do lote
//     era gerada isolada, sem saber das outras nem do que já estava na fila, e todas
//     perguntavam o mesmo ("qual a melhor conduta?"). O limiar de semelhança foi
//     calibrado na base real — a duplicata verdadeira deu 0,400 e o par legítimo mais
//     parecido deu 0,238.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-questao-repetida.js')], { stdio: 'pipe' });
  ok('questão repetida: acusa a duplicata real e o lote sabe o que já existe');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão de questão repetida falhou (verifique igGenOneUnica/FC_SUBTOPICS no index.html):\n' + out);
}

// ⚠️ Clicar na figura AMPLIA na leitura — e NUNCA no editor. O editor do resumo tem
//     `class="wys-edit dir-texto"`, as duas classes: uma condição por `.dir-texto`
//     sozinha o pegaria, e lá o clique na imagem é o que a SELECIONA para os botões
//     P/M/G e para o de legenda. Abrir o ampliador ali tira do professor o único
//     jeito de redimensionar a figura.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-ampliar-figura.js')], { stdio: 'pipe' });
  ok('ampliar figura: amplia na leitura (resumo e mural) e nunca no editor');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do ampliador de figura falhou (verifique ensureLightbox no index.html):\n' + out);
}

// ⚠️ O botão "Anexar" do painel de imagem guardava a foto como `data:image/...` e o
//     render validava com `safeHttpUrl`, que só aceita http(s): o professor anexava,
//     via "Imagem anexada 🖼️", a imagem ficava salva — e o capítulo não desenhava
//     nada. A correção NÃO pode ser afrouxar o `safeHttpUrl`, que também valida
//     `href` de link (ali `data:` abre `data:text/html`) — daí um validador só para
//     src de imagem, e este teste guarda as duas pontas.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-figura-anexada.js')], { stdio: 'pipe' });
  ok('figura anexada: data: de imagem desenha, crédito abaixo, href segue recusando data:');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da figura anexada falhou (verifique safeImgSrc/dirFigurasHTML no index.html):\n' + out);
}

// ⚠️ Seis mapas mentais publicados estavam com o `data` gravado como STRING de
//     JSON e apareciam VAZIOS, com o título genérico "Tema" — 30 ramos e 107
//     folhas invisíveis no ar, sem erro e sem aviso, e ninguém tinha notado.
//     Perder conteúdo em silêncio é pior que quebrar: pelo menos quebrar avisa.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-mapa-mental-forma.js')], { stdio: 'pipe' });
  ok('mapa mental: `data` em string de JSON é lido, não vira mapa vazio');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da forma do mapa mental falhou (verifique normalizeMMData no index.html):\n' + out);
}

// ⚠️ O professor clicou num capítulo e ele NÃO ABRIU — sem erro na tela, sem
//     nada no F12, e recarregar não resolvia. Um script meu gravara `pts` como
//     STRING de JSON em 5 capítulos, e `if(d.pts && d.pts.length)` deixava passar
//     (string TAMBÉM tem `.length`): o `.map` seguinte estourava e levava o card
//     inteiro. Campo malformado pode custar a seção dele, nunca o resumo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-resumo-campo-malformado.js')], { stdio: 'pipe' });
  ok('campo malformado custa a seção, não o resumo inteiro');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do campo malformado falhou (verifique os Array.isArray em dirCardHTML):\n' + out);
}

// ⚠️ O gráfico de BARRAS tem uma armadilha própria: em português a vírgula separa
//     itens e TAMBÉM é o separador decimal. "Semaglutida 2,4 mg" partido na
//     vírgula vira dois itens, com o rótulo destruído e o número errado — por isso
//     o bloco aceita `;` quando o rótulo precisa de vírgula.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-barra-resumo.js')], { stdio: 'pipe' });
  ok('gráfico de barras: vírgula decimal no rótulo preservada e round-trip do editor');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do gráfico de barras falhou (verifique barraHTML/grafItens no index.html):\n' + out);
}

// ⚠️ O gráfico de pizza do resumo é um bloco NÃO-markdown ({pizza: ...}) e o
//     editor do resumo é WYSIWYG: renderiza com mdToHtml e salva com htmlToMd.
//     Sem a marca `wys-pizza`/`data-pizza` que o htmlToMd sabe desfazer, a
//     PRIMEIRA edição do resumo come o gráfico — e some sem erro nenhum, que é
//     o mesmo motivo pelo qual as imagens já carregam `wys-img`.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-pizza-resumo.js')], { stdio: 'pipe' });
  ok('gráfico de pizza: desenha e sobrevive ao round-trip do editor WYSIWYG');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão do gráfico de pizza falhou (verifique pizzaSVG/mdToHtml/htmlToMd no index.html):\n' + out);
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

// ⚠️ CORPO DE E-MAIL TEM DE RENDERIZAR, não só parsear. Escrevi `cedoHtml`
//     chamando `wrap(...)` — helper que não existe neste módulo (é `shell`).
//     `node --check` passava (erro de referência, não de sintaxe), o teste antigo
//     passava (conferia o texto-fonte), e em produção o try/catch do cron
//     engoliria o ReferenceError: o e-mail simplesmente não sairia, calado.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-emails-renderizam.js')], { stdio: 'pipe' });
  ok('corpos de e-mail: renderizam de verdade, com data em pt-BR e a retrospectiva do assinante');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('algum corpo de e-mail não renderiza:\n' + out);
}

// ⚠️ PÁGINAS PÚBLICAS (SEO). Elas servem o MESMO conteúdo que o visitante anônimo
//     já recebe hoje (privado <> true, rascunho <> true) — só que num endereço por
//     capítulo, que o Google consegue indexar. Duas coisas quebram em silêncio:
//     (1) material de assinante (flashcards, mapa mental, fluxogramas, figuras)
//     escapar para a página aberta — não dá erro, e a exclusividade acaba sem
//     ninguém ver; (2) o texto do payload ser injetado sem escape na página.
//     Cobre também o 404 de verdade: soft-404 com status 200 faz o Google
//     indexar o aviso de "não achei" como se fosse conteúdo.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-publico-seo.js')], { stdio: 'pipe' });
  ok('páginas públicas: escapam HTML, não vazam material de assinante, captam e-mail e roteiam 200/404');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão das páginas públicas falhou (verifique lib/publico.js e api/publico.js):\n' + out);
}

// ⚠️ CAPTAÇÃO PÚBLICA DA NEWSLETTER. A invariante é o OPT-OUT: um campo público
//     pode ser preenchido por qualquer um, com o endereço de qualquer um. Se a
//     lista nova entrar por cima do descadastro, a plataforma manda e-mail para
//     quem pediu para não receber — sem erro, sem log, e a primeira notícia é
//     uma denúncia de spam. A rota também não pode responder diferente para
//     "novo" e "já inscrito", senão vira consulta de "fulano assina?".
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-newsletter-optin.js')], { stdio: 'pipe' });
  ok('newsletter: opt-out vence toda lista nova, e a rota pública não enumera nem finge sucesso');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da captação da newsletter falhou:\n' + out);
}

// ⚠️ PAGANTES EM RISCO, MINIMIZADOS. O professor pediu "minimiza" ao ver 11 + 13
//     nomes empurrando o painel de Estudantes para baixo da dobra. Três coisas
//     quebram isso em silêncio: o bloco voltar a nascer aberto; a CONTAGEM sair
//     do cabeçalho (fechado e sem número, ele não informa nada); e o estado de
//     "aberto" passar a morar no DOM — como admRiscoHTML() é renderizado duas
//     vezes (uma com "Apurando…", outra quando a RPC responde), o que ele acabou
//     de abrir fecharia sozinho e pareceria que o clique não pegou.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-risco-minimizado.js')], { stdio: 'pipe' });
  ok('pagantes em risco: nascem fechados com a contagem à vista e sobrevivem ao re-render');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão dos blocos de risco minimizados falhou:\n' + out);
}

// ⚠️ O PRIMEIRO ARTIGO DE UMA SUBESPECIALIDADE VAZIA MEXE NO ROTEAMENTO DA BASE
//     INTEIRA. `deepFor` só desce para a segunda área classificada quando a
//     primeira está VAZIA — então uma vinheta podia estar chegando ao bloco certo
//     POR ACIDENTE, pela descida. Ao entrar o primeiro extrato de Endocrinologia
//     Pediátrica (19/08/2026), a descida parou e a menina com calcificação
//     suprasselar passou a receber obesidade pediátrica no lugar de
//     craniofaringioma. Este guarda cobre as duas pontas: a conduta pediátrica
//     CHEGA a quem pergunta por ela, e não ROUBA de quem tem a resposta.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-pediatria-obesidade.js')], { stdio: 'pipe' });
  ok('obesidade pediátrica: chega pelas perguntas reais, não rouba do craniofaringioma, e o corte em dois blocos não perdeu fato');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da obesidade pediátrica na base profunda falhou:\n' + out);
}

// ⚠️ HIPOGLICEMIA VIROU SUBESPECIALIDADE, e criar uma área mexe no roteamento de
//     TODAS as outras. A palavra "hipoglicemia" aparece 88 vezes em Diabetes, 76
//     em Esporte, 49 em Obesidade e 13 em Adrenal — a área nova pode roubar de
//     quem responde melhor. Foi assim que a criação quebrou, em silêncio, a
//     promoção condicional do Esporte: a pergunta de exercício no DM1 passou a
//     casar três áreas e perdeu o consenso que é o assunto exato dela.
try {
  execFileSync(process.execPath, [path.join('scripts', 'test-hipoglicemia.js')], { stdio: 'pipe' });
  ok('hipoglicemia: o compêndio da ADA chega a quem pergunta, não rouba de Esporte/Obesidade/Adrenal, e a ressalva do AID segue no núcleo');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  fail('regressão da subespecialidade Hipoglicemia falhou:\n' + out);
}

if (errors) { console.error(`\n${errors} verificação(ões) falharam.`); process.exit(1); }
console.log('\nTodas as verificações passaram.');
