// Harness A/B no Chromium: baralho de membro com os gêmeos do #876 (card SOP antigo e
// card SOMP novo), carregado pelo app da main e pelo do branch, sem rede.
// Uso: PLAYWRIGHT_CORE=… AB_DIR=<pasta com main/ e branch/> node scratchpad/somp/check.js
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const RAIZ = process.env.AB_DIR;
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FEM = 'Endocrinologia Feminina';
const ROT = '2 de 3: oligo/anovulação, hiperandrogenismo (clínico ou laboratorial) e ovários policísticos ao US, após excluir outras causas.';
const PL = 'Mudança de estilo de vida + anticoncepcional combinado; metformina se houver alteração metabólica.';
const BARALHO = [
  { id: 1, front: 'Critérios de Rotterdam para SOP?', back: ROT, cat: FEM, seed: true, box: 4, due: 111 },
  { id: 2, front: 'Primeira linha na SOP sem desejo de gestar?', back: PL, cat: FEM, seed: true, member: true, box: 3, due: 222 },
  { id: 3, front: 'Primeira linha na SOMP sem desejo de gestar?', back: PL, cat: FEM, seed: true, member: true, box: 1, due: 333 },
  { id: 4, front: 'Critérios de Rotterdam para SOMP (antiga SOP)?', back: ROT, cat: FEM, seed: true, shared: true, box: 1, due: 444 },
  { id: 5, front: 'Minha anotação sobre SOP', back: 'SOP e insulina', cat: FEM, seed: false, box: 2, due: 555 },
];
const FC_SHARED = [
  { id: 'fc-orig-1', front: 'Critérios de Rotterdam para SOP?', back: ROT, sub: FEM, at: 1 },
  { id: 'fc-seed-1792262118386-0', front: 'Critérios de Rotterdam para SOMP (antiga SOP)?', back: ROT, sub: FEM, at: 1792262118386, tier: undefined },
];
const LEDGER_SHARED = { 'critérios de rotterdam para sop?': 1, 'critérios de rotterdam para somp (antiga sop)?': 1 };

function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      const p = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript');
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}

async function medir(browser, url, rotulo, ledgerMembro) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 200)));
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await ctx.addInitScript(([fc, sh, lm, ls]) => {
    if (sessionStorage.getItem('semeado')) return;
    sessionStorage.setItem('semeado', '1');
    localStorage.setItem('endodirect_v1_fc', JSON.stringify(fc));
    localStorage.setItem('endodirect_v1_fc_shared', JSON.stringify(sh));
    localStorage.setItem('endodirect_v1_fc_member_seeded', JSON.stringify(lm));
    localStorage.setItem('endodirect_v1_fc_shared_seeded', JSON.stringify(ls));
  }, [BARALHO, FC_SHARED, ledgerMembro, LEDGER_SHARED]);
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  const r1 = await page.evaluate(() => ({
    fc: JSON.parse(localStorage.getItem('endodirect_v1_fc') || '[]'),
    lm: JSON.parse(localStorage.getItem('endodirect_v1_fc_member_seeded') || '{}'),
  }));
  // 2ª carga: nada pode mudar de novo (sem pingue-pongue entre a troca e o reconcile)
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const r2 = await page.evaluate(() => JSON.parse(localStorage.getItem('endodirect_v1_fc') || '[]'));
  await ctx.close();
  return { rotulo, fc: r1.fc, lm: r1.lm, fc2: r2, erros };
}

(async () => {
  // ledger de membro semeado antes do #876: chaves antigas + a do gêmeo de "primeira linha"
  const src = fs.readFileSync(path.join(RAIZ, 'branch', 'index.html'), 'utf8');
  const i = src.indexOf('var FC_MEMBER={'), j = src.indexOf('\n};', i) + 3;
  const FC_MEMBER = new Function(src.slice(i, j) + '\nreturn FC_MEMBER;')();
  const antiga = { 'Por que usar metformina na SOMP?': 'Por que usar metformina na SOP?', 'Primeira linha na SOMP sem desejo de gestar?': 'Primeira linha na SOP sem desejo de gestar?',
    'Manifestações de hiperandrogenismo na SOMP?': 'Manifestações de hiperandrogenismo na SOP?', 'Risco endometrial na SOMP e prevenção?': 'Risco endometrial na SOP e prevenção?',
    'Riscos metabólicos a rastrear na SOMP?': 'Riscos metabólicos a rastrear na SOP?', 'Indução de ovulação na SOMP: opções?': 'Indução de ovulação na SOP: opções?' };
  const ledgerMembro = { 'primeira linha na somp sem desejo de gestar?': 1 };
  for (const cat of Object.keys(FC_MEMBER)) for (const p of FC_MEMBER[cat]) ledgerMembro[(antiga[p[0]] || p[0]).trim().toLowerCase()] = 1;

  const sA = await serve(path.join(RAIZ, 'main'), 8811), sB = await serve(path.join(RAIZ, 'branch'), 8812);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const a = await medir(browser, 'http://127.0.0.1:8811/', 'main', ledgerMembro);
  const b = await medir(browser, 'http://127.0.0.1:8812/', 'branch', ledgerMembro);
  await browser.close(); sA.close(); sB.close();

  // gêmeo = mesma frente depois da troca SOP → SOMP (sompTxt do branch)
  const k0 = src.indexOf('function sompTxt('), k1 = src.indexOf('\nfunction sompChaveFc(');
  const sompTxt = new Function(src.slice(k0, k1) + '\nreturn sompTxt;')();
  const resumo = (x) => {
    const fem = x.fc.filter((c) => /SOP|SOMP|Rotterdam|metformina/.test(c.front));
    const fr = x.fc.map((c) => sompTxt(String(c.front)).trim().toLowerCase());
    return { cartoes: x.fc.length, duplicadas: fr.filter((f, k) => fr.indexOf(f) !== k), fem: fem.map((c) => c.id + ' ' + c.front + ' (caixa ' + c.box + ')'), erros: x.erros };
  };
  const ra = resumo(a), rb = resumo(b);
  console.log('main  ', JSON.stringify(ra, null, 1));
  console.log('branch', JSON.stringify(rb, null, 1));
  const p = [];
  if (rb.duplicadas.length) p.push('branch com frente duplicada: ' + rb.duplicadas.join(' | '));
  const rot = b.fc.filter((c) => /Rotterdam/.test(c.front));
  if (rot.length !== 1 || rot[0].id !== 1 || rot[0].front !== 'Critérios de Rotterdam para SOMP (antiga SOP)?' || rot[0].box !== 4) p.push('Rotterdam no branch: ' + JSON.stringify(rot));
  const pl = b.fc.filter((c) => /Primeira linha na SO/.test(c.front));
  if (pl.length !== 1 || pl[0].id !== 2 || pl[0].box !== 3) p.push('Primeira linha no branch: ' + JSON.stringify(pl));
  if (b.fc.some((c) => /metformina na SOMP/.test(c.front))) p.push('branch: o card de metformina, deletado pelo aluno, voltou');
  const meu = b.fc.find((c) => c.id === 5);
  if (!meu || meu.front !== 'Minha anotação sobre SOP') p.push('branch: o card do aluno mudou');
  if (JSON.stringify(b.fc2) !== JSON.stringify(b.fc)) p.push('branch: a 2ª carga mudou o baralho de novo');
  if (rb.erros.length > ra.erros.length) p.push('erros de página novos no branch: ' + JSON.stringify(rb.erros));
  if (ra.duplicadas.length < 2) p.push('a main não reproduziu os gêmeos (o cenário não prova nada)');
  if (!a.fc.some((c) => /metformina na SOMP/.test(c.front))) p.push('a main não reproduziu a volta do card deletado');
  if (p.length) { console.error('\nREPROVADO:\n- ' + p.join('\n- ')); process.exit(1); }
  console.log('\nAPROVADO: a main reproduz os gêmeos; o branch funde, mantém o histórico, respeita a deleção e não muda na 2ª carga.');
})().catch((e) => { console.error(e); process.exit(1); });
