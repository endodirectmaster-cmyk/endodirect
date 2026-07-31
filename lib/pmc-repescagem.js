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
  RE_LINK_SUBSTITUIVEL
};
