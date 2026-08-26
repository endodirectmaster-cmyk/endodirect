// Regressão do LADO SERVIDOR do importador de PDF: as páginas renderizadas.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (26/08/2026). Em 25/08 o importador passou a
// mandar PDF digitalizado como N imagens de página (`imagesBase64`), e a
// montagem do pedido em `api/ai.js` era guardada só por CONFERÊNCIA DE TEXTO do
// próprio fonte, dentro do `test-teto-diretrizes.js`. Texto do fonte não vê
// bloco fora de ordem, `type` errado, pedido perdido nem teto que não recuou —
// vê apenas que a linha está escrita. Aqui o handler REAL é chamado e o que se
// inspeciona é o corpo que sairia para a Anthropic.
//
// 🧨 E A PRIMEIRA VERSÃO DESTA PROVA MEDIU NADA. Eu afirmava "o bloco profundo
// recuou" com `system.length < 400000` sobre uma chamada cujo `system` não tinha
// o sentinela `SYS_SPLIT` — e sem sentinela o `api/ai.js` CALCULA o profundo e
// depois o DESCARTA. O `system` vinha com 13 caracteres, a asserção passava, e
// não havia recuo nenhum sendo medido. Toda asserção sobre o profundo aqui usa
// o sentinela, e o recuo é medido por COMPARAÇÃO (com anexo × sem anexo), não
// contra um número que qualquer resposta pequena satisfaz.
'use strict';
const path = require('path');
const Module = require('module');

const REPO = path.join(__dirname, '..');
const SYS_SPLIT = '__ENDODIRECT_SYS_SPLIT_b1f7__'; // IDÊNTICO ao de api/ai.js e authoringSys
const { TETO_COM_ANEXO, TETO_PROFUNDO } = require(path.join(REPO, 'lib', 'clinical-deep'));

process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-teste-nunca-usada';

// O portão do endpoint é ESTAR LOGADO; quem loga não é o objeto deste teste.
// O stub entra no cache de módulos antes de `api/ai.js` ser carregado.
const authPath = require.resolve(path.join(REPO, 'lib', 'admin-auth.js'));
const stub = new Module(authPath, null);
stub.filename = authPath; stub.loaded = true;
stub.exports = {
  userFromReq: async () => ({ id: 'u1', email: 'professor@endodirect.com.br' }),
  adminFromReq: async () => ({ id: 'u1', email: 'professor@endodirect.com.br' })
};
require.cache[authPath] = stub;

// Nenhuma chamada de rede sai daqui: o fetch é interceptado e o corpo, guardado.
let capturado = null;
global.fetch = async (url, opts) => {
  capturado = { url: String(url), body: JSON.parse(opts.body) };
  return {
    ok: true, status: 200,
    json: async () => ({ content: [{ type: 'text', text: '{"titulo":"ok"}' }] }),
    text: async () => '{}'
  };
};

const handler = require(path.join(REPO, 'api', 'ai.js'));

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function chamar(body) {
  capturado = null;
  const req = { method: 'POST', headers: { origin: 'https://www.endodirect.com.br' }, body };
  const res = { statusCode: 200, _corpo: '', setHeader() {}, end(c) { this._corpo = c || ''; } };
  return handler(req, res).then(() => ({ status: res.statusCode, corpo: String(res._corpo || ''), enviado: capturado }));
}
// System no formato que os geradores usam: núcleo cacheável + sentinela + persona.
const sysComSentinela = (nucleo) => (nucleo || 'nucleo clinico de teste') + SYS_SPLIT + 'persona e formato';
// Tamanho do bloco PROFUNDO no que foi enviado (o 2º bloco cacheável do system).
function profundoEnviado(env) {
  const s = env && env.body && env.body.system;
  if (!Array.isArray(s) || s.length < 2) return 0;
  return String(s[1].text || '').length;
}
const paginas = (n, tam) => Array.from({ length: n }, (_, i) => 'A'.repeat((tam || 4000) - i));

(async () => {
  // ── 1. A forma do pedido: N imagens, em ordem, e o texto por último ─────────
  const r = await chamar({
    system: 'Você é professor de endocrinologia.',       // o importador manda system CURTO, sem sentinela
    prompt: 'Leia as páginas do documento e retorne APENAS JSON',
    imagesBase64: paginas(10),
    mediaType: 'image/jpeg',
    maxTokens: 8000
  });
  ok(r.status === 200, 'o handler recusou o corpo com páginas: HTTP ' + r.status + ' — ' + r.corpo.slice(0, 200));
  ok(!!r.enviado, 'nada chegou a ser montado para a Anthropic');
  if (r.enviado) {
    const c = r.enviado.body.messages[0].content;
    ok(Array.isArray(c), 'o conteúdo tinha de ser uma LISTA de blocos, veio ' + typeof c);
    ok(c.length === 11, 'esperava 10 imagens + 1 texto, vieram ' + c.length + ' blocos');
    ok(c.slice(0, 10).every((b) => b && b.type === 'image'),
      '⚠️ página não foi como bloco `image` — a Anthropic RECUSA media_type de imagem em bloco `document`');
    ok(c.slice(0, 10).every((b) => b.source && b.source.type === 'base64' && b.source.media_type === 'image/jpeg'),
      'alguma página foi montada com `source`/`media_type` errado');
    ok(c[10] && c[10].type === 'text' && /Leia as páginas/.test(c[10].text),
      '⚠️ o PEDIDO sumiu do fim da lista — a IA receberia as páginas sem saber o que fazer com elas');
    // Cada página foi gerada 1 char menor que a anterior: a ordem é verificável.
    const ordem = c.slice(0, 10).map((b) => b.source.data.length);
    ok(ordem.every((n, i) => i === 0 || n === ordem[i - 1] - 1),
      '⚠️ as páginas chegaram FORA DE ORDEM — a IA leria a diretriz embaralhada e o resumo sairia errado sem nenhum sinal');
  }

  // ── 2. Páginas contam como ANEXO: o bloco profundo recua ───────────────────
  // ⚠️ Medido por COMPARAÇÃO. Um limiar fixo passaria por acidente (foi assim que
  // a 1ª versão desta prova mediu nada). O sentinela é obrigatório: sem ele o
  // `api/ai.js` calcula o profundo e o descarta.
  const semAnexo = await chamar({ system: sysComSentinela(), prompt: 'p', area: 'Diabetes', maxTokens: 4000 });
  const comPaginas = await chamar({
    system: sysComSentinela(), prompt: 'p', area: 'Diabetes', maxTokens: 4000,
    imagesBase64: paginas(10), mediaType: 'image/jpeg'
  });
  const pSem = profundoEnviado(semAnexo.enviado), pCom = profundoEnviado(comPaginas.enviado);
  ok(pSem > TETO_COM_ANEXO,
    'sem anexo o bloco profundo deveria passar de ' + TETO_COM_ANEXO + ' (veio ' + pSem + ') — sem isso a comparação abaixo não prova nada');
  ok(pSem <= TETO_PROFUNDO, 'sem anexo o profundo passou do teto de ' + TETO_PROFUNDO + ': ' + pSem);
  ok(pCom > 0 && pCom <= TETO_COM_ANEXO,
    '⚠️ com páginas anexadas o bloco profundo NÃO recuou (' + pCom + ' > ' + TETO_COM_ANEXO + ') — somado às imagens, o contexto estoura e a importação falha INTEIRA');

  // ── 3. Página custa POR PÁGINA, não um valor fixo ──────────────────────────
  // ⚠️ Cenário deliberadamente extremo — prompt no corte de 200k E o máximo de
  // páginas. Com prompt curto o teto de ' + TETO_COM_ANEXO + ' domina e a conta
  // por página fica INVISÍVEL: é justamente na soma que ela existe para agir.
  const promptGrande = 'x'.repeat(200000);
  const poucas = await chamar({
    system: sysComSentinela(), prompt: promptGrande, area: 'Diabetes', maxTokens: 4000,
    imagesBase64: paginas(2), mediaType: 'image/jpeg'
  });
  const muitas = await chamar({
    system: sysComSentinela(), prompt: promptGrande, area: 'Diabetes', maxTokens: 4000,
    imagesBase64: paginas(24), mediaType: 'image/jpeg'
  });
  const pPoucas = profundoEnviado(poucas.enviado), pMuitas = profundoEnviado(muitas.enviado);
  ok(pMuitas < pPoucas,
    '⚠️ 24 páginas ocuparam o MESMO espaço que 2 no orçamento (' + pMuitas + ' vs ' + pPoucas + ') — a conta voltou a ser valor fixo e 24 páginas (~89k tokens de visão) passam a caber onde não cabem');

  // ── 4. O teto de páginas do servidor ───────────────────────────────────────
  const demais = await chamar({
    system: 's', prompt: 'p', imagesBase64: paginas(40), mediaType: 'image/jpeg', maxTokens: 4000
  });
  const nImgs = demais.enviado.body.messages[0].content.filter((b) => b.type === 'image').length;
  ok(nImgs === 24, 'o servidor tem de cortar em 24 páginas por pedido, aceitou ' + nImgs);

  // Entradas vazias não viram bloco de imagem vazio (a API recusa o pedido inteiro).
  const sujo = await chamar({
    system: 's', prompt: 'p', imagesBase64: ['AAAA', '', null, 'BBBB'], mediaType: 'image/jpeg', maxTokens: 4000
  });
  const cs = sujo.enviado.body.messages[0].content;
  ok(cs.filter((b) => b.type === 'image').length === 2,
    'entrada vazia na lista de páginas virou bloco de imagem — a Anthropic recusa o pedido inteiro por causa dela');

  // mediaType que não é de imagem, com páginas: cai para JPEG em vez de montar
  // um bloco `image` com `media_type: application/pdf`, que a API recusa.
  const tipoErrado = await chamar({
    system: 's', prompt: 'p', imagesBase64: paginas(2), mediaType: 'application/pdf', maxTokens: 4000
  });
  ok(tipoErrado.enviado.body.messages[0].content[0].source.media_type === 'image/jpeg',
    'páginas com mediaType não-imagem tinham de cair para image/jpeg');

  // ── 5. Os caminhos antigos seguem intactos ─────────────────────────────────
  const doc = await chamar({ system: 's', prompt: 'p', documentBase64: 'JVBERi0=', mediaType: 'application/pdf', maxTokens: 4000 });
  const cd = doc.enviado.body.messages[0].content;
  ok(Array.isArray(cd) && cd[0].type === 'document' && cd[0].source.media_type === 'application/pdf',
    'o caminho do PDF inteiro em base64 quebrou — é o que atende PDF pequeno sem texto');
  const puro = await chamar({ system: 's', prompt: 'só texto', maxTokens: 2000 });
  ok(typeof puro.enviado.body.messages[0].content === 'string',
    'pedido sem anexo deixou de mandar o prompt como string');

  // ── 6. O orçamento do cliente cabe no corpo da função ──────────────────────
  // O navegador para de renderizar em 3.400.000 chars de base64 somados. Aqui se
  // mede o que isso vira DEPOIS de montado em JSON, contra o teto de 4,5 MB da
  // função serverless — o número que, estourado, devolve 413 e perde o trabalho.
  const cheio = await chamar({
    system: 'Você é professor de endocrinologia.', prompt: 'Leia as páginas do documento',
    imagesBase64: paginas(12, 283333), mediaType: 'image/jpeg', maxTokens: 8000
  });
  const mb = JSON.stringify(cheio.enviado.body).length / 1048576;
  ok(mb < 4.5, 'o orçamento do cliente monta um corpo de ' + mb.toFixed(2) + ' MB, acima do teto de 4,5 MB da função');

  if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('✓ páginas no servidor: blocos image na ordem certa, pedido no fim, profundo recuando por página, teto de 24 e caminhos antigos intactos');
})().catch((e) => { console.error('✗ erro inesperado: ' + (e && e.stack || e)); process.exit(1); });
