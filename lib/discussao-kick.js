// Partida da cadeia de discussões do Mural — o único lugar que sabe COMO
// disparar, para os quatro gatilhos não terem quatro cópias divergentes.
//
// A cadeia em si vive em /api/admin/refresh-radar (action: 'discussao_cadeia').
// Cada invocação gera UMA discussão e chama a próxima; aqui só se dá a partida.
//
// ⚠️ POR QUE UM GATILHO PENDURADO EM TRÁFEGO COMUM (2026-07-29): os dois crons
// diários e o disparo ao abrir o Mural dependem, respectivamente, da hora do dia
// e de o navegador do professor já ter o JavaScript novo. No dia em que o recurso
// entrou, o professor voltou dizendo que nada saía — e os logs mostraram que a
// cadeia NUNCA tinha sido invocada: os crons do dia já haviam passado e o service
// worker dele ainda servia o pacote antigo, sem o disparo do Mural. Pendurar a
// partida numa rota que o cliente ANTIGO já chama (/api/checkout/config, em toda
// carga de página) tira o recurso da dependência do cache do navegador.
'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Janela do estrangulamento. Serve a dois propósitos ao mesmo tempo:
//  - não disparar a cadeia a cada carga de página;
//  - não disparar uma cadeia nova enquanto outra está andando — enquanto ela
//    anda, grava uma discussão a cada ~40s, e a escrita recente é a evidência.
const JANELA_MS = 10 * 60 * 1000;

// Última partida dada POR ESTA instância. É só um atalho para não consultar o
// banco a cada requisição; a decisão que vale é a da escrita mais recente, que
// é compartilhada entre instâncias.
let ultimoKickLocal = 0;

// Pura, para ser testável: dispara se ninguém desta instância disparou na janela
// E se ninguém gravou discussão na janela.
function deveKickar(ultimoLocal, ultimaEscritaMs, agora, janelaMs) {
  const j = janelaMs || JANELA_MS;
  if (ultimoLocal && agora - ultimoLocal < j) return false;
  if (ultimaEscritaMs && agora - ultimaEscritaMs < j) return false;
  return true;
}

// Dispara uma invocação da cadeia. NÃO espera a resposta: aborta em 2s, tempo de
// sobra para a requisição sair. O que importa é a invocação do outro lado ter
// começado — ela roda até o fim por conta própria.
async function dispararCadeia(extra) {
  if (!process.env.CRON_SECRET) return false;
  const base = process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br';
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2000);
  try {
    await fetch(`${base}/api/admin/refresh-radar`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.CRON_SECRET },
      body: JSON.stringify(Object.assign({ action: 'discussao_cadeia' }, extra || {}))
    });
  } catch (e) { /* abort esperado: a requisição já saiu */ }
  finally { clearTimeout(t); }
  return true;
}

// Milissegundos da discussão gravada mais recentemente, ou 0 se não der para ler.
// Consulta barata: uma linha, uma coluna.
async function ultimaEscritaMs() {
  if (!SUPABASE_URL || !SERVICE_ROLE) return 0;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?select=updated_at&order=updated_at.desc&limit=1`, {
      headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' }
    });
    if (!r.ok) return 0;
    const rows = await r.json().catch(() => []);
    const t = rows && rows[0] && rows[0].updated_at;
    const ms = t ? Date.parse(t) : 0;
    return Number.isFinite(ms) ? ms : 0;
  } catch (e) { return 0; }
}

// Gatilho de tráfego comum. Nunca lança e nunca é caminho crítico: quem chama
// responde ao usuário do mesmo jeito se isto falhar.
async function kickSeNecessario() {
  try {
    if (!process.env.CRON_SECRET) return false;
    const agora = Date.now();
    // Atalho: se esta instância já disparou na janela, nem consulta o banco.
    if (!deveKickar(ultimoKickLocal, 0, agora)) return false;
    if (!deveKickar(ultimoKickLocal, await ultimaEscritaMs(), agora)) return false;
    ultimoKickLocal = agora; // marca ANTES do disparo: falha não vira laço
    return await dispararCadeia();
  } catch (e) { return false; }
}

module.exports = { dispararCadeia, kickSeNecessario, deveKickar, JANELA_MS };
