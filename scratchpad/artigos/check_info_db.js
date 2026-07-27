// Reproduz em JS o mesmo concat_ws/md5 que o Postgres calculou sobre v->'info',
// para provar que as fichas gravadas são idênticas à fonte local.
//
// ⚠️ LIÇÃO (2026-07-27): por muito tempo este arquivo só carregava `info.js` —
// as 9 fichas do 2º LOTE (info2.js) nunca foram conferidas contra o banco, e o
// script ainda assim imprimia um ✓ tranquilizador ("16/16"). Era o mesmo tipo de
// fresta que deixou uma divergência de `resumo` viver até o audit_resumos.js.
// Ao acrescentar um lote novo, acrescente-o TAMBÉM aqui e prove a cobertura
// corrompendo um valor até o script acusar.
const crypto = require('crypto');
const { INFO } = require('/home/user/endodirect/scratchpad/artigos/info.js');
const { INFO2 } = require('/home/user/endodirect/scratchpad/artigos/info2.js');
const { INFO3 } = require('/home/user/endodirect/scratchpad/artigos/info3.js');
const LOCAIS = Object.assign({}, INFO, INFO2, INFO3);

// concat_ws ignora NULL, mas mantém string vazia. Campo ausente no jsonb -> NULL.
const cw = (sep, ...xs) => xs.filter((x) => x !== null && x !== undefined).join(sep);
// jsonb ->> de um número devolve a forma canônica do Postgres: 7, 7.9, 0.8, 2.5
const num = (n) => (n === undefined || n === null) ? undefined : String(n);

function hash(f) {
  const desf = (f.desfechos || []).map((d) => cw(':',
    d.lab, d.nome, d.dir, num(d.escala),
    d.barras ? d.barras.map((b) => cw(',', b.n, b.t, num(b.v), num(b.i))).join(';') : undefined,
    d.efeito && d.efeito.k, d.efeito && d.efeito.v, d.efeito && d.efeito.p,
    d.forest && num(d.forest.e), d.forest && num(d.forest.lo), d.forest && num(d.forest.hi),
    d.forest && d.forest.fav, d.forest && d.forest.des,
    // barras agrupadas (painel de metas): sem isto o verificador diria "idêntico"
    // sem ter olhado nenhum dos números do gráfico novo
    d.grupos ? cw(',', d.grupos.bracos[0], d.grupos.bracos[1], d.grupos.eixo, d.grupos.fig,
      (d.grupos.cats || []).map((c) => cw('/', c.k, ...(c.vs || []).map(num))).join(';'), d.grupos.nota) : undefined,
    // séries temporais (ESSENCE Fig. 2): sem isto o verificador ignoraria os pontos
    Array.isArray(d.series) ? d.series.map((se) => cw(',', se.tit, se.eixo, se.fig,
      num(se.min), num(se.max), (se.ticks || []).map(num).join('+'), num(se.dec),
      (se.tempos || []).map(num).join('+'),
      (se.linhas || []).map((l) => cw('/', l.n, (l.pts || []).map((pt) => num(pt[0]) + '@' + num(pt[1])).join('+'))).join('!'),
      se.nota)).join('#') : undefined
  )).join('~');
  const tiles = (f.tiles || []).map((t) => cw(',', t.v, t.k, t.t)).join('~');
  const s = cw('|',
    f.desenho, f.pergunta, f.seg, f.prat, f.segIco,
    (f.chips || []).join('~'),
    f.bracos.int.n, f.bracos.int.s, f.bracos.ctl.n, f.bracos.ctl.s,
    desf || undefined,
    tiles || undefined
  );
  return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}

// Hashes lidos DO BANCO (a expressão concat_ws/md5 equivalente rodou no
// Postgres). Prova de que a expressão SQL é a mesma daqui: ela reproduziu, sem
// alterar uma vírgula, os 16 hashes do 1º lote que já estavam neste arquivo.
const DB = {
  // ---- 1º lote (info.js) ----
  'CREDENCE (2019)': 'd1d07045974df4d7e78086bf64831a40',
  'DECLARE-TIMI 58 (2019)': 'f107f99d6f85b28fccaee98ccb53ca76',
  'EMPA-REG OUTCOME (2015)': '1d4fdfb9a825c5a69bd814bb738a98e4',
  'ESSENCE (2025)': '4a42a3a9dfba28592b4e669aeaeffefb',
  'FLOW (2024)': 'ca93aa1c3e6a20c740af501da73ce390',
  'LEADER (2016)': '8f7193577cb8b4bd84d6099387f7116f',
  'SELECT (2023)': 'a6bf674cd09376442dce2db19e9d4e58',
  'SOUL (2025)': '3e3b13b10ae7eea1c93693eadcc476bc',
  'STEP-1 (2021)': '72926ca6586b9442aebaa16646318da9',
  'STEP-HFpEF (2023)': 'ee781895ed3b3cca59990caca9f03083',
  'SURMOUNT-1 (2022)': '3c4cde78a318fc82828e92f8cf05d51b',
  'SURMOUNT-5 (2025)': '91e56b48f641c40033d934ee049a093b',
  'SURMOUNT-OSA (2024)': '3066146695a7765fe4cdc4dcb7e7d11f',
  'SURPASS-2 (2021)': '522efc4baa04624d3e569e9f5998851a',
  'SUSTAIN-6 (2016)': '5319cb5c932c9d044cf9f67051c09b82',
  'UKPDS 33 (1998)': 'daeaf0e2d4f951a8a9d1d75102f66691',
  // ---- 2º lote (info2.js) ----
  'ACCORD (2008)': 'c180d0e777e164ca8099785ad9b3e2d8',
  'DCCT (1993)': 'a4a3b18a98686f174d9bf7ac4296f485',
  'REWIND (2019)': '8c8ddbb30046174b13b5e3da8cfcf5f4',
  'STEP-2 (2021)': 'c04968dfd4b8d3b73dadf27a3d0a7cf0',
  'STEP-4 (2021)': 'd60c340247145a4cfaec2d976eeda9b2',
  'STEP-9 (2024)': 'b2cfc8da9039372009ab02a1ad33659a',
  'SURMOUNT-2 (2023)': '6bff2c1c6f35183e25f1fc413bbaf12b',
  'SURMOUNT-4 (2024)': '20265e542c7998bdfad933c51f97a10c',
  'SURMOUNT-MAINTAIN (2026)': '3ca804a7e993541d8f69fa7967eb588d',
  // ---- 3º lote (info3.js) ----
  'SCOUT (2010)': 'e2633d711fa4dd6aea6c3e6f352863e5',
  'XENDOS (2004)': '504179f97115a81e0e2aa3e2c3907b89',
  'COR-I (2010)': 'c42d5365209cb1f6adb32d71df3e57ad',
  'SCALE Obesidade e Pré-diabetes (2015)': 'e934a4a0862571babc88b413bfd10bac'
};

let bad = 0;
const locais = Object.keys(LOCAIS), noBanco = Object.keys(DB);
if (locais.length !== noBanco.length) { console.log('!! contagem difere:', locais.length, 'local vs', noBanco.length, 'no banco'); bad++; }
locais.forEach((t) => {
  if (!DB[t]) { console.log('  ✗ ' + t + ' — não está no banco'); bad++; return; }
  const h = hash(LOCAIS[t]);
  if (h !== DB[t]) { console.log('  ✗ ' + t + ' — ficha no banco DIFERE da local (' + h + ' vs ' + DB[t] + ')'); bad++; }
});
noBanco.forEach((t) => { if (!LOCAIS[t]) { console.log('  ✗ ' + t + ' — no banco mas sem fonte local'); bad++; } });

console.log(bad ? '\nFALHOU: ' + bad
  : '\n✓ ' + locais.length + '/' + noBanco.length + ' fichas gravadas são idênticas à fonte local'
    + ' (desenho, pergunta, chips, braços, desfechos, barras, efeitos, forest, grupos, séries, tiles, segurança e prática)');
process.exit(bad ? 1 : 0);
