// Repescagem de acesso aberto: reperguntar à NCBI quais artigos do mural
// GANHARAM um PMC depois de terem entrado.
//
// ⚠️ O DEFEITO QUE ISTO CORRIGE (2026-07-31). O professor apontou uma revisão de
// acesso aberto — "Is Hypercortisolism Treatable?" (Diabetes, Obesity and
// Metabolism, pubmed:42533758) — que não ganhou discussão sozinha. O tipo estava
// certo ("Artigo de Revisão" está em TIPOS_QUE_RENDEM desde 28/07); o que faltava
// era o PMC: o item entrou com `link` de DOI e `oa:false`, e `qualifica()`
// (lib/discussao-auto.js) exige `pmcIdFromLink(item.link)`.
//
// O que fazia disso um defeito e não uma limitação: `articleLink()` calcula o
// link UMA VEZ, no momento em que o artigo entra no mural, a partir dos
// `articleids` do esummary — e NUNCA MAIS. Só que a editora deposita no PMC dias
// ou semanas DEPOIS da publicação online, e o radar é diário: ele pega o artigo
// no primeiro dia em que aparece no PubMed, que é exatamente quando o PMC ainda
// não existe. O artigo virava acesso aberto no dia seguinte e ninguém
// reperguntava — ficava fora da discussão para sempre, por uma resposta velha.
//
// A escala medida em 31/07: dos 251 itens de PubMed no mural, 146 tinham link de
// DOI sem PMC, e 44 desses eram de um tipo que renderia discussão. O backfill
// manual de 01/07 já tinha esbarrado nisso ("2 PMIDs muito novos deram erro/sem
// PMC = pulados") e foi feito à mão, uma vez só.
//
// ⚠️ ISTO NÃO RESOLVE ARTIGO ABERTO QUE NUNCA VAI AO PMC. Aberto na editora
// (Wiley/Elsevier com licença CC) não implica depósito no PMC, e o `lib/fulltext.js`
// só sabe ler JATS do PMC. Nesse caso continua sem discussão, por falta de texto
// integral — que é o limite que define o recurso, não um defeito.
'use strict';

// Conversor de IDs da NCBI: PMID → PMCID. Serviço próprio, fora do E-utilities.
const IDCONV_URL = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/';
const NCBI_TOOL = 'endodirect';
const NCBI_EMAIL = (process.env.NCBI_EMAIL || 'contato@endodirect.com.br').trim();
const TIMEOUT_MS = 12000;

// Teto do conversor por requisição (documentado pela NCBI).
const LOTE = 200;
// ⚠️ Teto de requisições por execução. O radar já está paceado contra o limite
// de req/s da NCBI; este módulo acrescenta no MÁXIMO 2 chamadas por rodada.
const MAX_LOTES = 2;

// ⚠️ SÓ TROCA O LINK QUE O PRÓPRIO `articleLink()` TERIA POSTO. Ele emite, na
// ordem: PMC → DOI → página do PubMed. Um link fora desses dois padrões foi
// editado à mão pelo professor no card, e sobrescrevê-lo apagaria a edição dele.
const RE_LINK_SUBSTITUIVEL = /^https:\/\/(doi\.org\/|pubmed\.ncbi\.nlm\.nih\.gov\/)/i;

// O item do radar guarda `pmid` desde sempre; o `sourceId` é a rede de segurança
// para itens antigos gravados por versões anteriores.
function pmidDoAviso(aviso) {
  if (!aviso) return '';
  const direto = String(aviso.pmid || '').trim();
  if (/^\d+$/.test(direto)) return direto;
  const m = String(aviso.sourceId || '').match(/^pubmed:(\d+)$/);
  return m ? m[1] : '';
}

// Quem vale a pena reperguntar: veio do PubMed, ainda não é aberto e continua
// com o link que o radar montou. Mais NOVOS primeiro — são os que a editora
// acabou de depositar, e os que o teto de lotes tem de alcançar primeiro se um
// dia a fila passar de MAX_LOTES × LOTE.
function candidatos(avisos, limite) {
  const teto = Number.isFinite(limite) ? limite : LOTE * MAX_LOTES;
  const vistos = new Set();
  return (Array.isArray(avisos) ? avisos : [])
    .filter((a) => a && !a.oa && RE_LINK_SUBSTITUIVEL.test(String(a.link || '')) && pmidDoAviso(a))
    .sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
    .map(pmidDoAviso)
    .filter((pmid) => (vistos.has(pmid) ? false : (vistos.add(pmid), true)))
    .slice(0, Math.max(0, teto));
}

function pmcUrl(pmcid) {
  return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PONTE RSS → PUBMED (2026-08-01)
//
// ⚠️ O BURACO QUE ISTO FECHA. A repescagem de 31/07 só olhava item do PubMed,
// porque só ele tem PMID. Mas quase um terço do mural vem por RSS de revista
// (`journalrss:…`), e esses itens entram com o **link da editora** e **sem
// PMID** — logo `pmcIdFromLink` é vazio, `qualifica()` é falso, e a repescagem
// nem os considerava. Medido em 01/08: **97 itens de RSS, ZERO com PMC, ZERO
// com PMID, 23 deles de um tipo que renderia discussão** — travados para sempre,
// não por falta de texto aberto, mas por falta de caminho até ele.
// Foi assim que o consenso de coma mixedematoso (European Thyroid Journal, uma
// revista inteiramente aberta) ficou sem discussão.
//
// A ponte é: achar o PMID pelo TÍTULO no PubMed; daí em diante o item entra no
// mesmo caminho dos outros.
const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
// Quantos títulos resolver por execução. Cada um custa 2 chamadas (esearch +
// esummary), então isto é o dobro em requisições — por isso é baixo. Como o
// `pmid` resolvido é GRAVADO no item, o custo é uma vez por artigo, não por dia.
const LOTE_TITULO = 8;
// Só tenta de novo depois disto: artigo recém-publicado pode ainda não estar
// indexado no PubMed. Sem esta marca, os 97 sem PMID seriam reperguntados todo
// dia para sempre.
const REPETIR_BUSCA_APOS_MS = 7 * 24 * 60 * 60 * 1000;

// Normalização para COMPARAR títulos. Tem de ser agressiva o bastante para
// absorver diferença de pontuação/acento entre o RSS e o PubMed, e nada além —
// a comparação é por igualdade exata depois disto.
function normTitulo(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Itens que precisam da ponte: sem PMID, ainda não abertos, com título, e que
// não foram procurados há pouco tempo. Mais novos primeiro.
function candidatosSemPmid(avisos, opts) {
  const agora = (opts && opts.agora) || Date.now();
  const teto = (opts && Number.isFinite(opts.limite)) ? opts.limite : LOTE_TITULO;
  return (Array.isArray(avisos) ? avisos : [])
    .filter((a) => {
      if (!a || a.oa || pmidDoAviso(a)) return false;
      if (!String(a.titulo || '').trim()) return false;
      const tent = Number(a.pmidTent) || 0;
      return !tent || (agora - tent) > REPETIR_BUSCA_APOS_MS;
    })
    .sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
    .slice(0, Math.max(0, teto));
}

function urlEsearch(titulo) {
  const url = new URL(`${EUTILS}/esearch.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('term', `"${String(titulo).replace(/"/g, ' ').trim()}"[Title]`);
  url.searchParams.set('retmax', '5');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('tool', NCBI_TOOL);
  url.searchParams.set('email', NCBI_EMAIL);
  return url.toString();
}

function urlEsummary(pmids) {
  const url = new URL(`${EUTILS}/esummary.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('id', pmids.join(','));
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('tool', NCBI_TOOL);
  url.searchParams.set('email', NCBI_EMAIL);
  return url.toString();
}

// Do esummary de um registro: o PMCID, se houver.
function pmcidDoResumo(rec) {
  const ids = (rec && Array.isArray(rec.articleids)) ? rec.articleids : [];
  const pmc = ids.find((x) => x && (x.idtype === 'pmc' || x.idtype === 'pmcid') && x.value);
  if (!pmc) return '';
  const num = String(pmc.value).replace(/[^0-9]/g, '');
  return num ? 'PMC' + num : '';
}

// Resolve UM item: título → PMID (+ PMCID se já houver).
//
// ⚠️ A GUARDA DE TÍTULO É O CORAÇÃO DISTO. Casar errado não deixa o card como
// está: REESCREVE o link para OUTRO artigo, e o aluno leria a discussão de um
// estudo diferente do que o card anuncia. Por isso a exigência é igualdade
// EXATA do título normalizado — busca por título no PubMed traz parecidos, e
// "parecido" aqui é pior que nada. Na dúvida, devolve vazio.
async function resolverPorTitulo(aviso, opts) {
  const buscar = (opts && opts.fetchJson) || fetchJsonProprio;
  const titulo = String((aviso && aviso.titulo) || '').trim();
  if (!titulo) return null;
  try {
    const busca = await buscar(urlEsearch(titulo));
    const ids = (busca && busca.esearchresult && Array.isArray(busca.esearchresult.idlist))
      ? busca.esearchresult.idlist.filter((x) => /^\d+$/.test(String(x))) : [];
    if (!ids.length) return null;
    const resumo = await buscar(urlEsummary(ids));
    const res = (resumo && resumo.result) || {};
    const alvo = normTitulo(titulo);
    for (const id of ids) {
      const rec = res[id];
      if (!rec) continue;
      if (normTitulo(rec.title) !== alvo) continue;   // ⚠️ igualdade exata ou nada
      return { pmid: String(id), pmcid: pmcidDoResumo(rec) };
    }
    return null;
  } catch (e) {
    console.error('[pmc-repescagem] busca por título falhou:', (e && e.message) || e);
    return null;
  }
}

// Resolve um lote, sequencialmente (o pacer da NCBI é global por IP).
// NUNCA lança. Devolve { sourceId: {pmid, pmcid} } só do que casou, e
// { sourceId: null } do que foi procurado e não achou — o `null` vira a marca
// `pmidTent`, que evita reperguntar o mesmo título todo dia.
async function resolverPmidsPorTitulo(avisos, opts) {
  const lista = Array.isArray(avisos) ? avisos : [];
  const out = {};
  for (const a of lista) {
    if (!a || !a.sourceId) continue;
    out[a.sourceId] = await resolverPorTitulo(a, opts);
  }
  return out;
}

// Aplica o resultado da ponte. PURA, como o `aplicar`.
// - casou com PMC  → grava pmid + link do PMC + oa:true
// - casou sem PMC  → grava só o pmid (o `aplicar` normal cuida dele nos dias
//                    seguintes, via idconv, quando a editora depositar)
// - não casou      → grava `pmidTent` (marca de tentativa) e mais nada
function aplicarTitulos(avisos, mapa, agora) {
  const t = agora || Date.now();
  const resolvidos = [];
  const lista = (Array.isArray(avisos) ? avisos : []).map((a) => {
    if (!a || !a.sourceId || !(a.sourceId in (mapa || {}))) return a;
    const r = mapa[a.sourceId];
    if (!r || !r.pmid) return Object.assign({}, a, { pmidTent: t });
    const novo = Object.assign({}, a, { pmid: r.pmid, pmidTent: t });
    if (r.pmcid && !a.oa) { novo.link = pmcUrl(r.pmcid); novo.oa = true; }
    resolvidos.push({ sourceId: a.sourceId, pmid: r.pmid, pmcid: r.pmcid || '', abriu: !!r.pmcid });
    return novo;
  });
  return { avisos: lista, resolvidos };
}

async function fetchJsonProprio(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('idconv HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

function urlDoLote(pmids) {
  const url = new URL(IDCONV_URL);
  url.searchParams.set('ids', pmids.join(','));
  url.searchParams.set('idtype', 'pmid');
  url.searchParams.set('format', 'json');
  // Sem a versão no id: o link do card não deve carregar "PMC1234.2".
  url.searchParams.set('versions', 'no');
  url.searchParams.set('tool', NCBI_TOOL);
  url.searchParams.set('email', NCBI_EMAIL);
  return url.toString();
}

// { pmid: 'PMC…' } só para quem ganhou PMC. Registro sem `pmcid`, com `errmsg`
// (id inválido) ou com `live:"false"` (retirado do PMC) fica de fora.
function mapaDaResposta(json) {
  const mapa = {};
  const registros = (json && Array.isArray(json.records)) ? json.records : [];
  registros.forEach((r) => {
    if (!r || r.errmsg || String(r.live) === 'false') return;
    const pmid = String(r.pmid || '').trim();
    const pmcid = String(r.pmcid || '').trim().toUpperCase();
    if (/^\d+$/.test(pmid) && /^PMC\d+$/.test(pmcid)) mapa[pmid] = pmcid;
  });
  return mapa;
}

// Consulta o conversor em lotes. NUNCA lança: a repescagem é um bônus dentro do
// radar, e o radar não pode cair porque a NCBI está fora do ar.
// `opts.fetchJson` existe para o radar injetar o SEU fetch paceado (o pacer da
// NCBI é global por IP e as duas rotas competem pelo mesmo limite de req/s).
async function consultarPmcids(pmids, opts) {
  const lista = (Array.isArray(pmids) ? pmids : []).filter((p) => /^\d+$/.test(String(p)));
  if (!lista.length) return {};
  const buscar = (opts && opts.fetchJson) || fetchJsonProprio;
  const maxLotes = (opts && Number.isFinite(opts.maxLotes)) ? opts.maxLotes : MAX_LOTES;
  const mapa = {};
  for (let i = 0, lote = 0; i < lista.length && lote < maxLotes; i += LOTE, lote++) {
    try {
      const json = await buscar(urlDoLote(lista.slice(i, i + LOTE)));
      Object.assign(mapa, mapaDaResposta(json));
    } catch (e) {
      // Lote falho é lote perdido: o do dia seguinte repergunta os mesmos ids.
      console.error('[pmc-repescagem] lote falhou:', (e && e.message) || e);
      break;
    }
  }
  return mapa;
}

// Aplica o mapa sobre a lista de avisos. PURA de propósito: quem chama já releu o
// estado mais recente do banco, e esta função não pode acrescentar latência entre
// a releitura e a gravação — é essa janela curta que impede um run concorrente de
// sumir com itens (ver o read-modify-write curto em `runRadar`).
function aplicar(avisos, mapa) {
  const alterados = [];
  const lista = (Array.isArray(avisos) ? avisos : []).map((a) => {
    if (!a || a.oa) return a;
    if (!RE_LINK_SUBSTITUIVEL.test(String(a.link || ''))) return a;
    const pmid = pmidDoAviso(a);
    const pmcid = pmid && mapa ? mapa[pmid] : '';
    if (!pmcid) return a;
    const link = pmcUrl(pmcid);
    alterados.push({ sourceId: a.sourceId, pmid, pmcid, de: a.link, para: link, tipo: a.tipo });
    return Object.assign({}, a, { link, oa: true });
  });
  return { avisos: lista, alterados };
}

module.exports = {
  candidatos,
  consultarPmcids,
  aplicar,
  pmidDoAviso,
  mapaDaResposta,
  urlDoLote,
  pmcUrl,
  LOTE,
  MAX_LOTES,
  RE_LINK_SUBSTITUIVEL,
  // ponte RSS → PubMed
  candidatosSemPmid,
  resolverPmidsPorTitulo,
  aplicarTitulos,
  normTitulo,
  urlEsearch,
  pmcidDoResumo,
  LOTE_TITULO,
  REPETIR_BUSCA_APOS_MS
};
