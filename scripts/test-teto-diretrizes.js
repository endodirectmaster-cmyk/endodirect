// Regressão: o bloco clínico que ancora TODA geração de IA não pode estourar o
// teto — porque estourar CORTA EM SILÊNCIO, e o que se perde é o FIM do bloco.
//
// Descoberto em 07/08/2026, ao planejar a leitura do acervo do Drive: o
// `api/ai.js` faz `parts[0].slice(0, 60000)` no prefixo cacheável. O bloco
// avaliado estava em 59.659 caracteres — 341 de folga. A entrada de MODY que eu
// tinha acabado de acrescentar consumiu ~1.470: antes dela havia ~1.811.
//
// Ou seja: a próxima entrada de tamanho normal derrubaria a última entrada do
// bloco, sem erro, sem log e sem teste falhando. A IA passaria a gerar questão,
// comentário e flashcard sem aquela diretriz, e ninguém notaria.
//
// Este teste mede o bloco JÁ AVALIADO (não o código-fonte, que é maior por causa
// da concatenação `+'…'`) e falha antes do corte.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const ai = fs.readFileSync(path.join(raiz, 'api', 'ai.js'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ── o teto vem do api/ai.js, não é constante deste teste ────────────────────
const mTeto = ai.match(/TETO_NUCLEO\s*=\s*(\d+)/);
ok(!!mTeto, 'não achei TETO_NUCLEO em api/ai.js');
ok(/parts\[0\]\.slice\(0,\s*TETO_NUCLEO\)/.test(ai),
  'o corte do prefixo cacheável tem de usar TETO_NUCLEO — número solto volta a divergir deste teste');
if (!mTeto) { falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
const TETO = parseInt(mTeto[1], 10);

// ── a camada PROFUNDA tem de estar ligada, senão o conteúdo extraído dos
//    artigos não chega à IA e o núcleo volta a ser o único limite ────────────
ok(/require\(.*clinical-deep.*\)/.test(ai), 'api/ai.js tem de carregar lib/clinical-deep');
ok(/nucleoHead\s*=\s*parts\[0\]\.slice\(0,\s*TETO_NUCLEO\)/.test(ai),
  'o núcleo tem de ser cortado no TETO_NUCLEO antes de virar prefixo cacheável');
const deep = require(path.join(raiz, 'lib', 'clinical-deep'));
ok(deep.canonArea('Andrologia') === 'Endocrinologia Masculina',
  'a área tem de ser canonizada igual ao index.html (Andrologia = Endocrinologia Masculina)');
ok(deep.canonArea('Cardiologia') === '', 'área fora da endocrinologia não pode receber bloco profundo');
ok(deep.deepFor('Cardiologia') === '', 'sem área canônica, o bloco profundo é vazio');
ok(deep.deepFor('Diabetes').length > 500, 'a área Diabetes já deve ter conteúdo profundo');


// ── SELEÇÃO POR TEMA dentro da área ─────────────────────────────────────────
// A extração do acervo é exaustiva de propósito (10 artigos = 1.325 fatos), então
// a ENTREGA precisa escolher. Sem isto, ou a área inteira estoura o teto ou a IA
// recebe a tabela de doses da hipofosfatasia numa questão de cetoacidose.
const cob = deep.coberturaDeep();
const areaComVarios = Object.keys(cob).filter((a) => cob[a] >= 2)[0];
if (areaComVarios) {
  const blocos = deep.DEEP[areaComVarios];
  const temaDoSegundo = String(blocos[1].tema || '').split(/[—-]/)[0].trim();
  const saida = deep.deepFor(areaComVarios, 120000, areaComVarios + ' ' + temaDoSegundo);
  const primeiro = (saida.match(/• ([^—]{0,70})/) || [])[1] || '';
  ok(primeiro.toLowerCase().includes(temaDoSegundo.toLowerCase().slice(0, 12)),
    `⚠️ a seleção por tema não priorizou o bloco pedido: pedi "${temaDoSegundo}" e veio "${primeiro.trim()}"`);
}
// ⚠️ Teto apertado NÃO pode devolver vazio: um artigo bem extraído passa de 40 mil
// caracteres, então nenhum bloco inteiro cabe — e devolver nada faria a IA perder
// justamente o tema que foi pedido.
if (areaComVarios) {
  const curto = deep.deepFor(areaComVarios, 9000, areaComVarios + ' ' + String(deep.DEEP[areaComVarios][0].tema || ''));
  ok(curto.length > 3000, '⚠️ com teto apertado o bloco profundo veio VAZIO — deveria entregar o mais relevante cortado');
  ok(/cortado por limite/.test(curto), 'o corte por limite tem de ser declarado no próprio texto');
}
// Os dois pontos de cache: núcleo e aprofundamento separados.
ok(/nucleoHead, cache_control/.test(ai.replace(/\s+/g, ' ')) || /text: nucleoHead/.test(ai),
  'o núcleo tem de ir como bloco cacheável próprio');
ok(/text: profundo, cache_control/.test(ai.replace(/\s+/g, ' ')),
  '⚠️ o aprofundamento tem de ter cache PRÓPRIO — junto do núcleo, cada tema novo invalidaria o núcleo também');
ok(/deepFor\(areaPedida, TETO_PROFUNDO, areaPedida\)/.test(ai),
  'api/ai.js tem de passar o TEMA para a seleção, não só a área');


// ⚠️ O bloco MAIS RELEVANTE não pode ser pulado por não caber. Sem esta garantia,
// pedir um tema grande entregava silenciosamente um tema pequeno da mesma área —
// conteúdo da área certa e do assunto errado, sem nenhum sinal.
{
  // ⚠️ A área tem de ter um bloco PEQUENO convivendo com um GRANDE. Numa área só
  // de blocos grandes, nenhum cabe e o corte gracioso já salvaria sozinho — o teste
  // passaria mesmo com o defeito. O caso que discrimina é: o pequeno cabe, o
  // relevante não, e o pequeno entra no lugar dele.
  const areas = Object.keys(deep.DEEP).filter((a) => {
    const t = deep.DEEP[a].map((x) => x.texto.length);
    return t.length >= 2 && Math.min(...t) < 6000 && Math.max(...t) > 20000;
  });
  for (const a of areas) {
    const maior = deep.DEEP[a].slice().sort((x, y) => y.texto.length - x.texto.length)[0];
    // ⚠️ A chave tem de DISCRIMINAR. Pegar o começo do tema não serve: o bloco
    // grande de Diabetes chama-se "Diabetes pós-transplante…" e o começo dá
    // "diabetes", que casa também com o bloco de MODY — o teste passava com o
    // defeito presente. Use a palavra mais longa do tema que NÃO é o nome da área.
    const chave = String(maior.tema || '')
      .split(/[^A-Za-zÀ-ÿ]+/)
      .filter((w) => w.length >= 7 && w.toLowerCase() !== a.toLowerCase())
      .sort((x, y) => y.length - x.length)[0] || '';
    if (chave.length < 7) continue;
    const apertado = deep.deepFor(a, 9000, a + ' ' + chave);
    const primeiro = (apertado.match(/• ([^—]{0,70})/) || [])[1] || '';
    ok(primeiro.toLowerCase().includes(chave.toLowerCase().slice(0, 7)),
      `⚠️ com teto apertado, pedi "${chave}" em ${a} e veio "${primeiro.trim()}" — o bloco mais relevante foi PULADO em vez de cortado`);
    break;
  }
}
// A RESSALVA de conflito com o núcleo tem de chegar à IA, e no INÍCIO do bloco
// (o corte por teto come o fim). Sem ela, a IA recebe conduta superada sem aviso.
{
  const dados = require('../lib/clinical-deep-data.js');
  const CABECA = /^⚠️ (RESSALVA|EXCEÇÃO|LACUNA DO NÚCLEO)/;
  let comRessalva = null, areaR = '';
  for (const a of Object.keys(dados)) {
    const b = (dados[a] || []).find((x) => CABECA.test(x.texto));
    if (b) { comRessalva = b; areaR = a; break; }
  }
  if (comRessalva) {
    const ent = deep.deepFor(areaR, 120000, areaR + ' ' + String(comRessalva.tema || ''));
    ok(CABECA.test(ent.slice(ent.indexOf(comRessalva.texto.slice(0, 40)))) || ent.indexOf(comRessalva.texto.slice(0, 40)) >= 0,
      '⚠️ a ressalva de conflito com o núcleo NÃO está chegando à IA');
  }

  // ⚠️ A DIREÇÃO DA RESSALVA — o defeito que motivou este teste (07/08/2026).
  // O cabeçalho era um só e dizia sempre "o núcleo prevalece sobre esta fonte".
  // O extrato de hipofosfatasia carrega, com citação literal, que ali o
  // bisfosfonato é CONTRAINDICADO — e o núcleo recomenda antirreabsortivo para
  // osteoporose. O cabeçalho entregava a contraindicação já mandando ignorá-la:
  // nenhum fato errado, nenhuma citação falsa, e a conduta invertida.
  // Este teste lê os EXTRATOS e confere que o texto entregue diz o que o extrato
  // declarou — em particular que `fonte_prevalece` nunca vira "o núcleo prevalece".
  //
  // ⚠️ O QUE ESTE TESTE **NÃO** PROVA, e o teste por mutação mostrou: ele confere
  // CONSISTÊNCIA, não CORREÇÃO. Trocar o `conflito_direcao` da hipofosfatasia
  // para `nucleo_prevalece` reintroduz a inversão original e este bloco continua
  // verde, porque o cabeçalho entregue muda junto com o campo. Quem pega esse
  // caso é o scripts/confere-ressalvas.js, que exige justificativa escrita
  // (`nucleo_prevalece_porque`) para marcar `nucleo_prevalece` numa ressalva que
  // contém proibição. Não confie só no que está aqui.
  const fsx = require('fs');
  const dirExt = path.join(raiz, 'scratchpad', 'acervo', 'extratos');
  if (fsx.existsSync(dirExt)) {
    const porTema = {};
    for (const a of Object.keys(dados)) for (const b of dados[a]) porTema[String(b.tema || '').trim()] = b;
    let conferidos = 0;
    for (const arq of fsx.readdirSync(dirExt).filter((f) => f.endsWith('.json'))) {
      const e = JSON.parse(fsx.readFileSync(path.join(dirExt, arq), 'utf8'));
      if (!String(e.conflito || '').trim()) continue;
      const b = porTema[String(e.tema || e.titulo || '').trim()];
      if (!b) continue;
      conferidos++;
      const t = b.texto;
      if (e.conflito_direcao === 'fonte_prevalece') {
        ok(/^⚠️ EXCEÇÃO — ESTA FONTE PREVALECE SOBRE O NÚCLEO/.test(t),
          `⚠️ INVERSÃO DE CONDUTA: "${String(e.tema).slice(0, 40)}" está marcado fonte_prevalece e o bloco entregue não abre com a exceção`);
        ok(!/O NÚCLEO PREVALECE sobre esta fonte/.test(t),
          `⚠️ INVERSÃO DE CONDUTA: "${String(e.tema).slice(0, 40)}" é fonte_prevalece e o texto manda usar o núcleo`);
      }
      if (e.conflito_direcao === 'nucleo_prevalece') {
        ok(/^⚠️ RESSALVA — O NÚCLEO PREVALECE/.test(t),
          `"${String(e.tema).slice(0, 40)}" está marcado nucleo_prevalece e o bloco não diz isso`);
      }
      if (e.conflito_direcao === 'lacuna') {
        ok(/^⚠️ LACUNA DO NÚCLEO/.test(t), `"${String(e.tema).slice(0, 40)}" está marcado lacuna e o bloco não diz isso`);
      }
      if (e.conflito_direcao === 'alinhado') {
        ok(!CABECA.test(t),
          `"${String(e.tema).slice(0, 40)}" está marcado alinhado (o núcleo já foi corrigido a partir dele) e mesmo assim entrega ressalva — é alarme falso no prefixo cacheado`);
      }
    }
    ok(conferidos >= 5, `esperava conferir a direção de várias ressalvas e conferi ${conferidos}`);
  }
}

// ── ROTEAMENTO POR TERMO CLÍNICO ────────────────────────────────────────────
// ⚠️ Medido em 07/08/2026: "osteoporose", "fosfatase alcalina baixa" e
// "Osteoporose refratária" canonizavam para NADA — bloco profundo de 0 caractere.
// O único texto que alcançava Osteometabolismo era a palavra "Osteometabolismo",
// que nenhum médico digita. O artigo que diz `bisphosphonates are contraindicated`
// estava na base, verificado, e não chegava a quem perguntava exatamente por ele.
ok(deep.canonArea('osteoporose') === 'Osteometabolismo', 'termo clínico "osteoporose" tem de rotear para Osteometabolismo');
ok(deep.canonArea('fosfatase alcalina baixa') === 'Osteometabolismo', '"fosfatase alcalina" tem de rotear para Osteometabolismo');
ok(deep.canonArea('prolactinoma') === 'Neuroendocrinologia', '"prolactinoma" tem de rotear para Neuroendocrinologia');
{
  const q = 'Mulher de 62 anos, fratura de punho após queda da própria altura, DXA com T-score −2,7, sem causa secundária aparente. Fosfatase alcalina 22 U/L. Posso iniciar alendronato?';
  ok(deep.canonArea(q) === 'Osteometabolismo', 'a pergunta clínica inteira tem de rotear pela palavra que decide, mesmo tarde na frase');
  const b = deep.deepFor(q, 120000, q);
  ok(/CONTRAINDICADO|contraindicated/i.test(b),
    '⚠️ a contraindicação de bisfosfonato na hipofosfatasia NÃO está chegando a quem pergunta por ela');
}
// ⚠️ FRONTEIRA DE PALAVRA. A chave 'osso' (sinônimo de Osteometabolismo) está
// dentro de "posso" e "nosso". Enquanto canonArea só recebia NOME DE ÁREA isso
// era inofensivo; ao receber a pergunta do médico, "posso dar isso ao nosso
// paciente?" roteava para Osteometabolismo por acidente.
ok(deep.canonArea('posso dar isso ao nosso paciente?') === '',
  '⚠️ substring casual ("posso"/"nosso" contêm "osso") não pode definir a subespecialidade');

// ── O CHAT precisa mandar a pergunta como grounding ─────────────────────────
// Era o único consumidor de IA que nunca recebia a base profunda: o api/ai.js
// roteia por `body.area||body.grounding` e o chat não mandava nem um nem outro.
// ⚠️ Nada de regex sobre o system inteiro: ele passa de 1 KB e tem parênteses
// dentro, então `[^)]*` casa errado e o teste vira sempre-verde. Ancora-se no
// fim do argumento (`+CLINICAL_GUIDELINES,`) e lê só o que vem depois.
{
  const ANCORA = "+CLINICAL_GUIDELINES,";
  let i = -1, n = 0;
  while ((i = html.indexOf("callAI('ESCOPO RESTRITO", i + 1)) >= 0) {
    n++;
    const j = html.indexOf(ANCORA, i);
    ok(j > 0 && j - i < 4000, `chat ${n}: não achei o fim do system (${ANCORA})`);
    if (j < 0) continue;
    const cauda = html.slice(j + ANCORA.length, j + ANCORA.length + 60);
    ok(/^(text|txt),\s*1200\s*,\s*null\s*,\s*\1\s*\)/.test(cauda),
      `⚠️ chat ${n}: a pergunta não vai como grounding (veio "${cauda.slice(0, 32)}…") — sem isso o chat NUNCA recebe a base profunda`);
  }
  ok(n === 2, `esperava 2 chamadas de chat (aluno e admin) e achei ${n}`);
}

// ── avalia CLINICAL_GUIDELINES de verdade ────────────────────────────────────
function valorDaVar(nome) {
  const i = html.indexOf('var ' + nome + '=');
  if (i < 0) throw new Error('var ' + nome + ' não encontrada no index.html');
  const fim = html.indexOf("';", i);
  if (fim < 0) throw new Error('não achei o fim de ' + nome);
  const src = html.slice(i, fim + 2).replace('var ' + nome + '=', 'RESULTADO=');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext('var RESULTADO;' + src + ';', sandbox);
  return sandbox.RESULTADO;
}

const bloco = valorDaVar('CLINICAL_GUIDELINES');
ok(typeof bloco === 'string' && bloco.length > 1000, 'CLINICAL_GUIDELINES não avaliou para string');

const folga = TETO - bloco.length;
const entradas = (bloco.match(/•/g) || []).length;

// ⚠️ A margem existe para que a falha apareça ANTES do prejuízo. Estourar o teto
// não quebra nada visível: só apaga diretriz da cabeça da IA.
const MARGEM = 500;
ok(bloco.length <= TETO,
  `⚠️ CLINICAL_GUIDELINES tem ${bloco.length} caracteres e o teto de api/ai.js é ${TETO}: ` +
  `${bloco.length - TETO} caracteres estão sendo CORTADOS EM SILÊNCIO de toda chamada de IA. ` +
  `O que se perde é o FIM do bloco.`);
ok(folga >= MARGEM,
  `⚠️ só restam ${folga} caracteres até o corte de ${TETO} (mínimo exigido: ${MARGEM}). ` +
  `Não acrescente diretriz sem antes ampliar o teto em api/ai.js ou mover conteúdo para o nível PROFUNDO por subespecialidade.`);

// ── o sentinela do split tem de bater entre os dois arquivos ─────────────────
const sentIdx = (html.match(/__ENDODIRECT_SYS_SPLIT_[a-z0-9]+__/) || [])[0];
const sentAi = (ai.match(/__ENDODIRECT_SYS_SPLIT_[a-z0-9]+__/) || [])[0];
ok(sentIdx && sentAi && sentIdx === sentAi,
  'o sentinela do split precisa ser idêntico em index.html e api/ai.js — senão o bloco inteiro vira "tail" e é cortado em 8000');

// ── a cauda também tem teto, e é bem menor ──────────────────────────────────
const mTail = ai.match(/parts\.slice\(1\)\.join\(''\)\.slice\(0,\s*(\d+)\)/);
ok(!!mTail, 'não achei o corte da cauda variável em api/ai.js');

if (falhas.length) {
  console.error('✗ teto do bloco clínico:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log(`✓ teto do bloco clínico: ${bloco.length}/${TETO} caracteres (${entradas} entradas, folga ${folga})`);
