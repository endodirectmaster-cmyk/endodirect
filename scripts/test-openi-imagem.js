#!/usr/bin/env node
// Open-i: licença livre e cópia própria (31/10/2026).
//
// O Open-i ficou fora do ar de 25 a 31/10 e quebrou as figuras ligadas direto a ele.
// Ao voltar, o professor aprovou a melhoria: o "Usar" do buscador copia a figura para
// o nosso bucket (`endodirect-assets/resumos/pmc/`), e a Questão do Dia faz o mesmo.
// Na conferência apareceu o outro buraco: o servidor lia a licença de campos que o
// Open-i não manda, e 7 das 10 figuras das Questões do Dia eram NC/ND ou sem licença.
// A regra do produto é só CC BY, CC0 ou domínio público.
//
// Este teste prende:
//   1. a leitura da licença (`ccLicense`/`licenseURL`) e quem é livre;
//   2. o download só de imagem do próprio Open-i, com tipo e tamanho conferidos;
//   3. a ação do servidor só para professor;
//   4. o painel: busca só livre, "Usar" bloqueado para não livre e cópia antes de anexar;
//      na Questão do Dia, a figura escolhida sai em cópia própria (sem cópia, sem figura).
const fs = require('fs');
const path = require('path');
const { licencaOpeni, urlOpeniValida, baixarImagemOpeni, TETO_BYTES } = require('../lib/openi-imagem');

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

(async () => {
  // 1. licença
  const L = (o) => licencaOpeni(o);
  ok(L({ ccLicense: 'by' }).licenca === 'CC BY' && L({ ccLicense: 'by' }).livre === true, 'ccLicense "by" é CC BY, livre');
  ok(L({ ccLicense: 'byncnd' }).licenca === 'CC BY-NC-ND' && L({ ccLicense: 'byncnd' }).livre === false, 'ccLicense "byncnd" é CC BY-NC-ND, não livre');
  ok(L({ ccLicense: 'bync' }).licenca === 'CC BY-NC' && !L({ ccLicense: 'bync' }).livre, 'CC BY-NC não é livre');
  ok(L({ ccLicense: 'byncsa' }).licenca === 'CC BY-NC-SA' && !L({ ccLicense: 'byncsa' }).livre, 'CC BY-NC-SA não é livre');
  ok(L({ ccLicense: 'bysa' }).licenca === 'CC BY-SA' && !L({ ccLicense: 'bysa' }).livre, 'CC BY-SA fica de fora (a regra é CC BY, CC0 ou domínio público)');
  ok(L({ licenseURL: 'http://creativecommons.org/licenses/by/4.0/' }).livre === true, 'sem ccLicense, a URL da CC BY basta');
  ok(L({ licenseURL: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' }).licenca === 'CC BY-NC-ND', 'a URL da CC BY-NC-ND vira o rótulo certo');
  ok(L({ licenseURL: 'https://creativecommons.org/publicdomain/zero/1.0/' }).licenca === 'CC0' && L({ licenseURL: 'https://creativecommons.org/publicdomain/zero/1.0/' }).livre, 'CC0 é livre');
  ok(L({}).licenca === '' && L({}).livre === false && L(null).livre === false, 'sem licença informada não é livre');
  ok(L({ license: 'CC BY', Rights: 'by' }).livre === false, 'os campos antigos (license/Rights) não contam: o Open-i não os manda');

  // 2. endereço e download
  ok(urlOpeniValida('https://openi.nlm.nih.gov/imgs/512/1/2/x.png'), 'imagem do Open-i em https é aceita');
  ['http://openi.nlm.nih.gov/imgs/512/1/2/x.png', 'https://openi.nlm.nih.gov.evil.com/imgs/x.png', 'https://evil.com/imgs/x.png',
    'https://openi.nlm.nih.gov/api/search?q=1', 'https://user:pw@openi.nlm.nih.gov/imgs/x.png', 'https://openi.nlm.nih.gov:8443/imgs/x.png', 'javascript:alert(1)', '']
    .forEach((u) => ok(!urlOpeniValida(u), 'endereço recusado: ' + u));
  let chamadas = 0;
  const resp = (status, tipo, bytes) => ({ ok: status >= 200 && status < 300, status, headers: { get: (h) => (h === 'content-type' ? tipo : null) }, arrayBuffer: async () => new Uint8Array(bytes).buffer });
  const fake = (r) => async () => { chamadas++; return r; };
  let r = await baixarImagemOpeni('https://evil.com/imgs/x.png', fake(resp(200, 'image/png', 10)));
  ok(!r.ok && r.code === 400 && chamadas === 0, 'endereço inválido nem chega a ser baixado');
  r = await baixarImagemOpeni('https://openi.nlm.nih.gov/imgs/512/1/2/x.png', fake(resp(200, 'text/html; charset=utf-8', 50)));
  ok(!r.ok && /não devolveu uma imagem/.test(r.error), 'a página de manutenção (HTML com 200) não vira imagem');
  r = await baixarImagemOpeni('https://openi.nlm.nih.gov/imgs/512/1/2/x.png', fake(resp(503, 'text/html', 10)));
  ok(!r.ok && r.code === 502, 'erro do Open-i vira 502');
  r = await baixarImagemOpeni('https://openi.nlm.nih.gov/imgs/512/1/2/x.png', fake(resp(200, 'image/png', TETO_BYTES + 1)));
  ok(!r.ok && r.code === 413, 'imagem acima de 3 MB é recusada (a resposta da Vercel tem teto)');
  r = await baixarImagemOpeni('https://openi.nlm.nih.gov/imgs/512/1/2/x.png', fake(resp(200, 'image/png', 4)));
  ok(r.ok && r.tipo === 'image/png' && r.base64 === Buffer.from(new Uint8Array(4)).toString('base64'), 'imagem boa volta em base64 com o tipo');
  r = await baixarImagemOpeni('https://openi.nlm.nih.gov/imgs/512/1/2/x.png', async () => { throw new Error('rede'); });
  ok(!r.ok && r.code === 502, 'queda de rede vira erro, sem lançar');

  // 3. servidor
  const ai = fs.readFileSync(path.join(__dirname, '..', 'api', 'ai.js'), 'utf8');
  const bloco = ai.slice(ai.indexOf("sbody.kind === 'openi_imagem'"), ai.indexOf("sbody.kind === 'openi_imagem'") + 600);
  ok(/const admin = await adminFromReq\(req\);\s*if \(!admin\) return json\(res, 401/.test(bloco) && bloco.indexOf('adminFromReq') < bloco.indexOf('baixarImagemOpeni'),
    'a cópia do Open-i é só para professor, conferido antes de baixar');
  ok(/license: lic\.licenca,\s*livre: lic\.livre/.test(ai) && /x\.img && \(!livres \|\| x\.livre\)/.test(ai), 'a busca devolve a licença real e filtra as livres quando pedido');

  // 4. painel
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const fn = (nome) => { const i = html.indexOf('\nfunction ' + nome + '('); const f = html.indexOf('\nfunction ', i + 10); return i < 0 ? '' : html.slice(i, f); };
  const usar = fn('admOpenImgUse');
  ok(/if\(!it\.livre\)\{notify\(/.test(usar), 'o "Usar" recusa licença não livre');
  ok(usar.indexOf('oiCopiaPropria(it.img)') > 0 && usar.indexOf('oiCopiaPropria(it.img)') < usar.indexOf('admOpenImgAttach(') && /url:up\.url/.test(usar) && !/url:it\.img/.test(usar),
    'o "Usar" copia para o nosso bucket ANTES de anexar e anexa a cópia, nunca o link do Open-i');
  ok(/livres:true/.test(fn('admOiFetch')), 'o buscador do editor pede só licença livre');
  ok(/data-adm-oi-use="'\+i\+'"'\+\(it\.livre\?'':' disabled'\)/.test(html), 'o botão "Usar" fica desligado para licença não livre');
  const exame = fn('igFetchExamImage');
  ok(/livres:true/.test(exame) && /it\.livre&&igImgRelevante/.test(exame) && /return igImgCopia\(it\)/.test(exame) && /melhor\?igImgCopia\(melhor\):null/.test(exame) && !/img:it\.img/.test(exame),
    'a Questão do Dia só usa figura livre, e em cópia própria');
  ok(/\.catch\(function\(\)\{return null;\}\)/.test(fn('igImgCopia')), 'sem cópia, a Questão do Dia fica sem figura (não volta ao link do Open-i)');
  const copia = fn('oiCopiaPropria');
  ok(/kind:'openi_imagem'/.test(copia) && /Authorization:'Bearer '\+token/.test(copia) && /uploadAdminAsset\(new File\(\[u\],nome,\{type:d\.tipo\}\),'resumos\/pmc'\)/.test(copia),
    'a cópia pede a imagem ao servidor com a sessão e sobe em resumos/pmc/ pelo upload de professor');

  if (falhas.length) { console.error('test-openi-imagem: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
  console.log('test-openi-imagem: ok (licença real do Open-i, só CC BY/CC0/domínio público, download conferido, só professor, e cópia própria no "Usar" e na Questão do Dia)');
})();
