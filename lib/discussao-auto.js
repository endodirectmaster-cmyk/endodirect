// Geração AUTOMÁTICA da discussão completa, acoplada ao cron do radar.
//
// POR QUE NÃO GERAR PARA TODOS OS ARTIGOS ABERTOS (decisão de 2026-07-28):
// medido em produção, uma discussão sai com ~5.000 palavras. Dos 81 artigos de
// acesso aberto do mural, 56 são "Estudo Original" e 10 revisão narrativa — em
// estudo observacional pequeno, o resumo de 4 linhas já diz o que há para dizer,
// e a discussão vira volume. Gerar os 81 seriam ~400.000 palavras que ninguém
// leu indo ao aluno. O custo em dólar é baixo (~US$ 0,19 por artigo no Opus 4.8);
// o custo de revisão é que não é.
//
// Então: automático só nos desenhos em que a discussão rende — metanálise,
// diretriz, consenso e ensaio clínico. O resto continua no botão do card.
//
// ⚠️ TETO DE TEMPO: cada geração leva dezenas de segundos (texto integral +
// ~4.000 tokens de saída). O cron tem orçamento finito, então isto processa
// POUCOS por execução e vai alcançando o atraso ao longo dos dias. Com ~2,7
// artigos abertos novos por dia e ~1 em 4 qualificando, 2 por execução sobra.
'use strict';

const { gerarDiscussao } = require('./discussao');
const { pmcIdFromLink } = require('./fulltext');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Os rótulos de `MURAL_TYPES` em que a discussão completa rende.
// "Consenso" entrou a pedido do professor (2026-07-28).
// "Artigo de Revisão" entrou em 28/07, depois de o professor ler a primeira
// discussão gerada (uma revisão narrativa de doença ocular tireoidiana) e pedir
// que esses saíssem sem clique. Eu havia argumentado o contrário — que revisão
// narrativa renderia pouco. O texto real mostrou que rende: a discussão explicita
// o que a revisão NÃO tem (protocolo de busca, desfecho homogêneo, metanálise),
// que é justamente o que o resumo de 4 linhas não diz.
const TIPOS_QUE_RENDEM = ['Metanálise', 'Diretriz', 'Consenso', 'Ensaio Clínico', 'Artigo de Revisão'];

// ⚠️ O classificador do radar NÃO consegue emitir "Consenso": o `MURAL_TYPE_NAMES`
// de lib/radar.js só tem Diretriz | Metanálise | Artigo de Revisão | Ensaio
// Clínico | Estudo Genético | Perspectiva Clínica | Estudo Original, e o prompt
// manda tratar consenso como "Diretriz". "Consenso" só aparece quando o professor
// escolhe à mão no editor — por isso, hoje, zero artigos abertos têm esse rótulo.
// Sem o reconhecimento por título abaixo, pedir "inclua consenso" não teria
// efeito nenhum sobre o que o radar traz.
const RE_TITULO = /\b(consensus|consenso|guideline|guidance|diretriz|position statement|practice recommendation|standards of (medical )?care)\b/i;
// Ensaio randomizado que a IA classificou como "Estudo Original" — acontece com
// análise secundária e com estudo cujo título não diz "trial".
const RE_ENSAIO = /\b(randomi[sz]ed|randomizado|placebo-controlled|double-blind|duplo-cego|clinical trial|ensaio cl[ií]nico)\b/i;

// Um artigo qualifica se TEM texto integral aberto E (é de um tipo que rende OU
// o título/resumo o denuncia como consenso/diretriz/ensaio apesar do rótulo).
function qualifica(item) {
  if (!item || !pmcIdFromLink(item.link)) return false;
  const tipo = String(item.tipo || '');
  if (TIPOS_QUE_RENDEM.indexOf(tipo) >= 0) return true;
  const hay = `${item.titulo || ''} ${item.studyType || ''}`;
  return RE_TITULO.test(hay) || RE_ENSAIO.test(hay);
}

// Fila: qualifica, ainda não tem discussão, mais NOVOS primeiro.
// `jaTem` é um Set/objeto de sourceIds já gravados.
function selecionar(avisos, jaTem, limite) {
  const tem = (id) => (jaTem instanceof Set ? jaTem.has(id) : !!(jaTem && jaTem[id]));
  return (Array.isArray(avisos) ? avisos : [])
    .filter((a) => a && a.sourceId && !tem(a.sourceId) && qualifica(a))
    .sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
    .slice(0, Math.max(0, limite));
}

async function idsJaGerados(base) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?select=source_id`, { headers: base });
  if (!r.ok) return new Set();
  const rows = await r.json().catch(() => []);
  return new Set((rows || []).map((x) => x && x.source_id).filter(Boolean));
}

// Roda dentro do cron do radar. Fail-safe por artigo: um que falhe não impede
// os outros, e a função nunca lança (o cron não pode cair por causa disto).
async function gerarDiscussoesPendentes(opts) {
  const limite = (opts && opts.limite) || 2;
  // Para de COMEÇAR uma geração nova quando o orçamento acabou. Não interrompe
  // a que está em curso — abortar no meio gastaria os tokens sem gravar nada.
  const orcamentoMs = (opts && opts.orcamentoMs) || 150000;
  const inicio = (opts && opts.agora) || Date.now();
  if (!SUPABASE_URL || !SERVICE_ROLE) return { geradas: 0, motivo: 'sem_supabase' };
  if (!process.env.ANTHROPIC_API_KEY) return { geradas: 0, motivo: 'sem_chave_ia' };

  const base = { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: base });
  if (!r.ok) return { geradas: 0, motivo: 'sem_estado' };
  const rows = await r.json().catch(() => []);
  const avisos = ((rows && rows[0] && rows[0].payload) || {}).radar_avisos || [];

  const fila = selecionar(avisos, await idsJaGerados(base), limite);
  const feitas = [];
  const falhas = [];
  for (const item of fila) {
    if (Date.now() - inicio > orcamentoMs) { falhas.push({ sourceId: item.sourceId, motivo: 'sem_orcamento' }); break; }
    let out;
    try { out = await gerarDiscussao(process.env.ANTHROPIC_API_KEY, item); }
    catch (e) { out = { ok: false, motivo: 'excecao' }; }
    if (!out || !out.ok) { falhas.push({ sourceId: item.sourceId, motivo: (out && out.motivo) || 'desconhecido' }); continue; }
    const up = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?on_conflict=source_id`, {
      method: 'POST',
      headers: Object.assign({}, base, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ source_id: item.sourceId, markdown: out.markdown, meta: out.meta, updated_at: new Date().toISOString() })
    }).catch(() => ({ ok: false }));
    if (up.ok) feitas.push(item.sourceId);
    else falhas.push({ sourceId: item.sourceId, motivo: 'gravacao' });
  }
  return { geradas: feitas.length, feitas, falhas, naFila: fila.length };
}

module.exports = { gerarDiscussoesPendentes, selecionar, qualifica, TIPOS_QUE_RENDEM };
