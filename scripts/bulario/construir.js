// BULÁRIO: constrói bulario.json a partir das duas fontes públicas oficiais (16/10/2026).
//
// Pedido do professor: "ferramenta de Bulário atualizada na plataforma, se possível
// de todas as medicações disponíveis no Brasil". Fontes:
//   • ANVISA, dados abertos: DADOS_ABERTOS_MEDICAMENTOS.csv (todos os registros, com
//     situação, categoria regulatória, classe, detentor, vencimento e princípio ativo);
//   • CMED, Lista de Preços (PMC): apresentações, preço máximo ao consumidor por
//     alíquota de ICMS, tarja, restrição hospitalar e se houve comercialização no ano.
// A bula em si NÃO entra aqui: o texto pertence ao fabricante, e o Bulário Eletrônico
// da ANVISA recusa servidores fora do Brasil. O app leva o aluno à bula oficial por link.
//
// Uso:
//   node scripts/bulario/construir.js                 baixa as duas fontes e grava bulario.json
//   node scripts/bulario/construir.js --local <pasta> usa DADOS_ABERTOS_MEDICAMENTOS.csv e lista_pmc.xlsx da pasta
// Saída: bulario.json na raiz (servido como estático; o painel 💊 Bulário o carrega sob demanda).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..', '..');
const URL_CSV = 'https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv';
const URL_CMED = 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos';

// Áreas da endocrinologia pela classe ATC (EphMRA) da CMED. Vale a primeira área
// que casar: H4B, glucagon, vai para Diabetes antes de cair em "Hipófise".
const AREAS = [
  ['Diabetes', /^(A10|H4B)/],
  ['Obesidade', /^A8A/],
  ['Lípides', /^C10/],
  ['Tireoide', /^H3/],
  ['Adrenal e corticoides', /^H2/],
  ['Hipófise', /^(H1C|H4C|H4D|H4X)/],
  ['Osso e cálcio', /^(A11C2|A11C3|A12A|H4A|H4E|H4F|M5B)/],
  ['Hormônios sexuais', /^(G3|G03H)/]
];
// Para o produto sem apresentação na CMED, a classe da ANVISA (nomes por extenso).
const AREAS_ANVISA = [
  ['Diabetes', /ANTIDIABET|INSULIN|GLUCAGON/],
  ['Obesidade', /ANOREXIC|ANTIOBESIDADE/],
  ['Lípides', /LIPID|LIPEM|COLESTER|TRIGLIC|ESTATIN|FIBRAT/],
  ['Tireoide', /TIREOID|TIROID/],
  ['Adrenal e corticoides', /GLICOCORTICOIDES SISTEMICOS|MINERALOCORTICOIDE|HORMONIOS CORTICOSTEROIDES/],
  ['Hipófise', /HIPOFISE|CRESCIMENTO HUMANO|SOMATOSTATINA|HIPOTALAMIC/],
  ['Osso e cálcio', /VITAMINA D|REABSORCAO OSSEA|BIFOSFONATO|PARATIR|PARATIREOID|REPOSITOR DE CALCIO|HIPOCALCEMIC/],
  ['Hormônios sexuais', /ESTROGEN|PROGESTAGEN|ANDROGEN|ANABOLIZANTE|GONADOTROF|RECEPTOR ESTROG|CONTRACEPTIVOS HORMONAIS|HORMONIOS SEXUAIS|USO TOPICO GINECOLOGICO/]
];
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

function baixar(url, destino) {
  return new Promise((ok, falha) => {
    const ir = (u, n) => https.get(u, { headers: { 'User-Agent': 'Endodirect-Bulario/1.0 (+https://www.endodirect.com.br)' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 5) { r.resume(); return ir(new URL(r.headers.location, u).toString(), n + 1); }
      if (r.statusCode !== 200) { r.resume(); return falha(new Error('HTTP ' + r.statusCode + ' em ' + u)); }
      const f = fs.createWriteStream(destino); r.pipe(f); f.on('finish', () => f.close(() => ok(destino))); f.on('error', falha);
    }).on('error', falha);
    ir(url, 0);
  });
}
async function obterFontes() {
  const i = process.argv.indexOf('--local');
  if (i > 0) { const d = process.argv[i + 1]; return { csv: path.join(d, 'DADOS_ABERTOS_MEDICAMENTOS.csv'), xlsx: path.join(d, 'lista_pmc.xlsx'), arquivoCmed: 'lista_pmc (local)' }; }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bulario-'));
  const pagina = path.join(tmp, 'cmed.html');
  await baixar(URL_CMED, pagina);
  const html = fs.readFileSync(pagina, 'utf8');
  const m = html.match(/href="([^"]*lista_pmc__[^"]*\.xlsx\/@@download\/file)"/i);
  if (!m) throw new Error('não achei o link da lista PMC na página da CMED');
  const urlX = new URL(m[1], 'https://www.gov.br').toString();
  const csv = await baixar(URL_CSV, path.join(tmp, 'DADOS_ABERTOS_MEDICAMENTOS.csv'));
  const xlsx = await baixar(urlX, path.join(tmp, 'lista_pmc.xlsx'));
  return { csv, xlsx, arquivoCmed: (urlX.match(/(lista_pmc__[^/]+?)\.xlsx/) || [])[1] || 'lista_pmc' };
}

// CSV da ANVISA: Windows-1252 (o latin1 com travessão, apóstrofo e aspas curvas em
// 0x80–0x9F), ";" e aspas. A tabela é nossa porque o TextDecoder('latin1') muda entre
// versões do Node: no 22 lê 0x96 como travessão; no 20, que roda no GitHub, como
// caractere de controle invisível (16/10: "D’orto" virou "Dorto" na 1ª atualização).
// As cinco posições que o Windows-1252 não define (0x81, 0x8D, 0x8F, 0x90, 0x9D) saem.
const CP1252 = ['€', '', '‚', 'ƒ', '„', '…', '†', '‡', 'ˆ', '‰', 'Š', '‹', 'Œ', '', 'Ž', '',
  '', '‘', '’', '“', '”', '•', '–', '—', '˜', '™', 'š', '›', 'œ', '', 'ž', 'Ÿ'];
function decodificar1252(buf) {
  return Buffer.from(buf).toString('latin1').replace(/[\u0080-\u009f]/g, (c) => CP1252[c.charCodeAt(0) - 0x80]);
}
function lerCsv(arq) {
  const txt = decodificar1252(fs.readFileSync(arq));
  const linhas = txt.split(/\r?\n/).filter(Boolean);
  const campos = (l) => { const out = []; let cur = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (c === '"') { q = !q; continue; } if (c === ';' && !q) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out; };
  const cab = campos(linhas[0]);
  return linhas.slice(1).map((l) => { const c = campos(l); const o = {}; cab.forEach((h, i) => { o[h] = (c[i] || '').trim(); }); return o; });
}
// XLSX mínimo, sem dependências: sharedStrings + a planilha de dados, por regex.
function lerXlsx(arq) {
  const listar = execFileSync('unzip', ['-Z1', arq]).toString('utf8').split('\n');
  const sx = execFileSync('unzip', ['-p', arq, 'xl/sharedStrings.xml'], { maxBuffer: 1 << 30 }).toString('utf8');
  const des = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  const strings = [];
  for (const m of sx.matchAll(/<si>([\s\S]*?)<\/si>/g)) strings.push(des([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  const col = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
  // A lista de preços é a MAIOR planilha do arquivo (a outra é o cabeçalho explicativo).
  const folhas = listar.filter((f) => /^xl\/worksheets\/sheet\d+\.xml$/.test(f));
  let melhor = null;
  for (const f of folhas) {
    const sh = execFileSync('unzip', ['-p', arq, f], { maxBuffer: 1 << 30 }).toString('utf8');
    if (!melhor || sh.length > melhor.length) melhor = sh;
  }
  const linhas = [];
  for (const r of melhor.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cel = [];
    for (const c of r[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const t = (c[2].match(/t="([^"]+)"/) || [])[1];
      const v = ((c[3] || '').match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      const is = ((c[3] || '').match(/<is>([\s\S]*?)<\/is>/) || [])[1];
      cel[col(c[1])] = t === 's' ? strings[Number(v)] : (is ? des(is.replace(/<[^>]+>/g, '')) : (v != null ? des(v) : ''));
    }
    linhas.push(cel);
  }
  const h = linhas.findIndex((l) => l && l.some((c) => /^SUBST/i.test(String(c || ''))) && l.some((c) => /^APRESENTA/i.test(String(c || ''))));
  if (h < 0) throw new Error('cabeçalho da lista PMC não encontrado');
  const cab = linhas[h].map((c) => String(c || '').trim());
  return linhas.slice(h + 1).filter((l) => l && l.length > 5).map((l) => { const o = {}; cab.forEach((k, i) => { o[k] = l[i] == null ? '' : String(l[i]).trim(); }); return o; });
}
const num = (s) => { const v = parseFloat(String(s || '').replace(/\./g, '').replace(',', '.')); return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0; };
// Nome em caixa de título, mas sigla curta continua sigla (XR, T4, S/A, D3) e
// preposição fica minúscula. "GLIFAGE XR" vira "Glifage XR", não "Glifage Xr".
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'com', 'em', 'para', 'por', 'sem', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os']);
const titulo = (s) => String(s || '').trim().split(/(\s+|[-/()+,])/).map((tok, i, arr) => {
  if (!/[A-Za-zÀ-ú]/.test(tok)) return tok;
  if (/^([A-Za-z]\.){1,4}$/.test(tok)) return tok.toUpperCase(); // S.A.
  if (tok.length === 1 && (arr[i - 1] === '/' || arr[i + 1] === '/')) return tok.toUpperCase(); // S/A
  const low = tok.toLowerCase();
  if (i > 0 && MINUSCULAS.has(low)) return low;
  if (tok.length <= 3 && tok === tok.toUpperCase() && !MINUSCULAS.has(low)) return tok;
  return low.charAt(0).toUpperCase() + low.slice(1);
}).join('');

async function main() {
  const fontes = await obterFontes();
  const anv = lerCsv(fontes.csv);
  const cmed = lerXlsx(fontes.xlsx);
  // ANVISA: só registro ATIVO; um produto por número de registro (ou nome + detentor quando não há número).
  const prod = new Map();
  for (const r of anv) {
    if (r.SITUACAO_REGISTRO !== 'Ativo' || r.TIPO_PRODUTO !== 'MEDICAMENTO') continue;
    const reg = (r.NUMERO_REGISTRO_PRODUTO || '').replace(/\D/g, '');
    const emp = r.EMPRESA_DETENTORA_REGISTRO.replace(/^\d{8,14}\s*-\s*/, '').trim();
    const chave = reg || ('n:' + semAcento(r.NOME_PRODUTO) + '|' + semAcento(emp));
    const p = prod.get(chave) || { n: r.NOME_PRODUTO, pa: new Set(), cat: r.CATEGORIA_REGULATORIA, cl: r.CLASSE_TERAPEUTICA, emp, reg, venc: r.DATA_VENCIMENTO_REGISTRO, data: '' , apr: [] };
    if (r.PRINCIPIO_ATIVO) r.PRINCIPIO_ATIVO.split(/\s*[;+]\s*/).forEach((x) => x && p.pa.add(x.toLowerCase()));
    if ((r.DATA_FINALIZACAO_PROCESSO || '') > p.data) { p.data = r.DATA_FINALIZACAO_PROCESSO; if (r.CLASSE_TERAPEUTICA) p.cl = r.CLASSE_TERAPEUTICA; if (r.CATEGORIA_REGULATORIA) p.cat = r.CATEGORIA_REGULATORIA; }
    prod.set(chave, p);
  }
  // CMED: apresentações ligadas pelo registro (os 9 primeiros dígitos do código de 13).
  const kPmc = Object.keys(cmed[0] || {}).find((k) => /^PMC 18\s*%$/.test(k));
  const kCom = Object.keys(cmed[0] || {}).find((k) => /^COMERCIALIZA/i.test(k)) || '';
  const anoCom = (kCom.match(/(\d{4})/) || [])[1] || '';
  if (!kPmc) throw new Error('coluna "PMC 18 %" não encontrada na lista da CMED');
  let ligadas = 0, soltas = 0;
  for (const c of cmed) {
    const reg = String(c.REGISTRO || '').replace(/\D/g, '').slice(0, 9);
    const p = prod.get(reg);
    if (!p) { soltas++; continue; }
    ligadas++;
    p.apr.push({ a: c['APRESENTAÇÃO'], pmc: num(c[kPmc]), tarja: String(c.TARJA || '').replace(/^Tarja\s*/i, '').replace(/^-\s*\(\*\)\s*$/, '').trim(), hosp: /^sim/i.test(c['RESTRIÇÃO HOSPITALAR']) ? 1 : 0, com: /^sim/i.test(c[kCom] || '') ? 1 : 0, atc: String(c['CLASSE TERAPÊUTICA'] || ''), tipo: c['TIPO DE PRODUTO (STATUS DO PRODUTO)'] || '' });
  }
  // Tabelas de valores repetidos (o arquivo fica menor e o diff semanal, legível).
  const tab = { cat: [], cl: [], emp: [], tarja: [], area: AREAS.map((a) => a[0]) };
  const idx = (t, v) => { v = v || ''; let i = tab[t].indexOf(v); if (i < 0) { tab[t].push(v); i = tab[t].length - 1; } return i; };
  const ORDEM_TARJA = ['Preta', 'Vermelha sob restrição', 'Vermelha', 'Sem Tarja', ''];
  const saida = [];
  for (const p of prod.values()) {
    let area = -1;
    for (const ap of p.apr) { const k = AREAS.findIndex((a) => a[1].test(ap.atc)); if (k >= 0) { area = k; break; } }
    if (area < 0) { const cl = semAcento(p.cl); area = AREAS_ANVISA.findIndex((a) => a[1].test(cl)); }
    p.apr.sort((x, y) => (y.com - x.com) || x.a.localeCompare(y.a, 'pt-BR'));
    const tarjaP = p.apr.map((a) => a.tarja).sort((x, y) => ORDEM_TARJA.indexOf(x) - ORDEM_TARJA.indexOf(y))[0] || '';
    saida.push([titulo(p.n), [...p.pa].join(' + '), idx('cat', p.cat), idx('cl', p.cl), idx('emp', titulo(p.emp)), p.reg, p.venc, area, idx('tarja', tarjaP),
      p.apr.map((a) => [a.a, a.pmc, idx('tarja', a.tarja), a.hosp, a.com])]);
  }
  saida.sort((a, b) => a[0].localeCompare(b[0], 'pt-BR') || a[1].localeCompare(b[1], 'pt-BR'));
  const hoje = new Date().toISOString().slice(0, 10);
  const dataCmed = (fontes.arquivoCmed.match(/(\d{4})(\d{2})(\d{2})/) || []).slice(1).reverse().join('/');
  const meta = { v: 1, gerado: hoje, fontes: { anvisa: 'ANVISA, dados abertos de medicamentos registrados (situação ativa), baixados em ' + hoje.split('-').reverse().join('/'), cmed: 'CMED, lista de preços máximos ao consumidor' + (dataCmed ? ' de ' + dataCmed : '') + ' (PMC com ICMS de 18%)' },
    anoComercializacao: anoCom,
    campos: ['nome', 'principio_ativo', 'categoria', 'classe', 'detentor', 'registro', 'vencimento_mmaaaa', 'area', 'tarja', 'apresentacoes[apresentacao, pmc18, tarja, restricao_hospitalar, comercializado]'],
    totais: { produtos: saida.length, apresentacoes: ligadas, apresentacoesSemRegistroAtivo: soltas, endocrinologia: saida.filter((p) => p[7] >= 0).length } };
  // Uma linha por produto: o diff da atualização semanal mostra só o que mudou.
  const texto = '{"meta":' + JSON.stringify(meta) + ',\n"tab":' + JSON.stringify(tab) + ',\n"p":[\n' + saida.map((p) => JSON.stringify(p)).join(',\n') + '\n]}\n';
  fs.writeFileSync(path.join(RAIZ, 'bulario.json'), texto);
  console.log(JSON.stringify(meta.totais) + ' · ' + (texto.length / 1e6).toFixed(2) + ' MB · CMED: ' + fontes.arquivoCmed);
}
if (require.main === module) main().catch((e) => { console.error('bulário: ' + ((e && e.stack) || e)); process.exit(1); });
module.exports = { decodificar1252 };
