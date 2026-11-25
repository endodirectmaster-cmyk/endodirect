// Bunny Stream: uma biblioteca por curso, com a chave de cada uma na Vercel (25/11/2026).
//
// Pedido do professor: "quero que você faça em todas as pastas o mesmo esquema que você fez
// dos resumos. A gente sobe o arquivo para a plataforma e de lá você transfere para o Bunny
// Stream." E: "Tudo que já subiu, não precisa subir de novo. É só você agora fazer as devidas
// alterações para manter somente [o streaming]."
//
// Por que aqui, e não no ambiente do Claude: o Bunny exige a chave DA BIBLIOTECA para mexer nos
// vídeos (a chave da conta não serve), e todas as bibliotecas usam o mesmo endereço
// (video.bunnycdn.com). O segredo de rede do ambiente guarda uma chave por endereço, então
// caberia uma biblioteca por vez. Na Vercel cada biblioteca tem a sua variável; o professor as
// cadastra uma vez e ninguém mais as vê (este módulo nunca devolve a chave).
//
// Módulo de lib/ (NÃO conta como função serverless). Quem chama é api/ai.js (kind 'bunny').

const API = 'https://video.bunnycdn.com';

// Número e CDN de cada biblioteca não são segredo (o CDN aparece no src das aulas). A chave é.
const BIBLIOTECAS = {
  resumos: { id: 820720, cdn: 'vz-4fb917fa-a7a.b-cdn.net', env: 'BUNNY_KEY_RESUMOS', nome: 'Resumos' },
  emc: { id: 741440, cdn: 'vz-0161a494-b29.b-cdn.net', env: 'BUNNY_KEY_EMC', nome: 'Educação Médica Continuada' },
  endo_essencial: { id: 680513, cdn: 'vz-1196f9a8-6ea.b-cdn.net', env: 'BUNNY_KEY_ESSENCIAL', nome: 'Endocrinologia Essencial' },
  endoteem: { id: 683460, cdn: 'vz-f9c42905-205.b-cdn.net', env: 'BUNNY_KEY_ENDOTEEM', nome: 'EndoTEEM 2026' }
};

// Só arquivos do NOSSO bucket podem ser mandados ao Bunny: sem isso, a rota viraria um jeito
// de fazer o Bunny baixar qualquer endereço da internet com a conta do professor.
const HOSTS_STORAGE = ['auth.endodirect.com.br', 'eutizblmrcypzyqzczgq.supabase.co'];
const PREFIXO_STORAGE = '/storage/v1/object/public/endodirect-assets/';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function biblioteca(curso) {
  const b = Object.prototype.hasOwnProperty.call(BIBLIOTECAS, curso) ? BIBLIOTECAS[curso] : null;
  if (!b) return null;
  return { curso, id: b.id, cdn: b.cdn, env: b.env, nome: b.nome };
}

function chave(b) {
  return String(process.env[b.env] || '').trim();
}

function hlsDe(b, guid) {
  return 'https://' + b.cdn + '/' + guid + '/playlist.m3u8';
}

function arquivoNosso(url) {
  let u;
  try { u = new URL(String(url || '')); } catch (e) { return false; }
  return u.protocol === 'https:' && HOSTS_STORAGE.indexOf(u.hostname.toLowerCase()) >= 0 &&
    u.pathname.indexOf(PREFIXO_STORAGE) === 0 && u.pathname.indexOf('..') < 0;
}

async function chamar(b, metodo, caminho, corpo) {
  const r = await fetch(API + '/library/' + b.id + caminho, {
    method: metodo,
    headers: Object.assign({ AccessKey: chave(b), Accept: 'application/json' }, corpo ? { 'Content-Type': 'application/json' } : {}),
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const d = await r.json().catch(() => null);
  return { http: r.status, d };
}

function erro(code, error) { return { ok: false, code, error }; }

// Quem pode chamar, além do professor logado no painel: a checagem diária das 03:13 (tarefa do
// Claude), que não tem a sessão dele. Ela grava um código aleatório de uso curto (até 1 h) em
// `endodirect_tarefa_token` pelo banco e o manda aqui; só quem escreve no banco consegue isso.
// A tabela tem RLS sem política: aluno e visitante não leem nem gravam.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
async function tarefaValida(token) {
  try {
    token = String(token || '');
    if (!/^[0-9a-f]{64}$/.test(token)) return false;
    const key = serviceKey();
    if (!key) return false;
    const agora = encodeURIComponent(new Date().toISOString());
    const r = await fetch(SUPABASE_URL + '/rest/v1/endodirect_tarefa_token?token=eq.' + token + '&expira=gt.' + agora + '&select=token',
      { headers: { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' } });
    if (!r.ok) return false;
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) && rows.length === 1;
  } catch (e) {
    return false;
  }
}

// Ação pedida pela rota. `p`: { acao, curso, url, titulo, guid, pagina, simular }.
async function bunnyAcao(p) {
  p = p || {};
  const b = biblioteca(String(p.curso || ''));
  if (!b) return erro(400, 'Curso sem biblioteca do Bunny: ' + String(p.curso || '(vazio)') + '.');
  if (!b.id) return erro(503, 'Falta o número da biblioteca "' + b.nome + '".');
  if (!chave(b)) return erro(503, 'Falta a chave da biblioteca "' + b.nome + '" na Vercel (' + b.env + ').');
  const acao = String(p.acao || '');
  const guid = String(p.guid || '');
  if (acao !== 'enviar' && acao !== 'listar' && !GUID.test(guid)) return erro(400, 'Código do vídeo inválido.');

  try {
    if (acao === 'enviar') {
      if (!arquivoNosso(p.url)) return erro(400, 'Só arquivos do Storage da plataforma podem ir para o Bunny.');
      const titulo = String(p.titulo || '').trim().slice(0, 200) || 'Videoaula';
      const r = await chamar(b, 'POST', '/videos/fetch', { url: String(p.url), title: titulo });
      const id = r.d && (r.d.id || r.d.guid);
      if (r.http >= 300 || !id || !GUID.test(String(id))) return erro(502, 'O Bunny recusou o pedido (' + r.http + ').');
      return { ok: true, guid: String(id), hls: hlsDe(b, String(id)), biblioteca: b.id };
    }
    if (acao === 'status') {
      const r = await chamar(b, 'GET', '/videos/' + guid);
      if (r.http === 404) return erro(404, 'Vídeo não encontrado no Bunny.');
      if (r.http >= 300 || !r.d) return erro(502, 'O Bunny não respondeu (' + r.http + ').');
      return { ok: true, guid, status: r.d.status, length: r.d.length, encodeProgress: r.d.encodeProgress, titulo: r.d.title, hls: hlsDe(b, guid) };
    }
    if (acao === 'listar') {
      const pagina = Math.max(1, Math.min(50, parseInt(p.pagina, 10) || 1));
      const r = await chamar(b, 'GET', '/videos?page=' + pagina + '&itemsPerPage=100&orderBy=date');
      if (r.http >= 300 || !r.d) return erro(502, 'O Bunny não respondeu (' + r.http + ').');
      const itens = (Array.isArray(r.d.items) ? r.d.items : []).map((v) => ({ guid: v.guid, titulo: v.title, status: v.status, length: v.length }));
      return { ok: true, total: r.d.totalItems, pagina, itens };
    }
    if (acao === 'resolucoes') {
      const r = await chamar(b, 'GET', '/videos/' + guid + '/resolutions');
      const d = r.d && r.d.data;
      if (r.http >= 300 || !d) return erro(502, 'O Bunny não respondeu (' + r.http + ').');
      return {
        ok: true, guid,
        streaming: d.availableResolutions || [],
        mp4: (d.mp4Resolutions || []).map((x) => x && x.resolution).filter(Boolean),
        original: !!d.hasOriginal
      };
    }
    if (acao === 'mp4') {
      // Apaga SÓ as cópias MP4 de download (outputs=mp4). O streaming (HLS) e o original ficam.
      // Antes de apagar de verdade, simula e recusa se o plano tocar no HLS.
      const q = '/videos/' + guid + '/resolutions/cleanup?outputs=mp4&allResolutions=true&deleteMp4Files=true&deleteOriginal=false';
      const sim = await chamar(b, 'POST', q + '&dryRun=true');
      const ds = sim.d && sim.d.data;
      if (sim.http >= 300 || !ds) return erro(502, 'A simulação falhou (' + sim.http + ').');
      const plano = {
        mp4: ds.resolutionsToDeleteFromMp4 || [],
        playlist: ds.resolutionsToDeleteFromPlaylist || [],
        depois: ds.availableResolutionsAfter || []
      };
      if (plano.playlist.length || ds.modifiedPlaylist || !plano.depois.length) {
        return erro(409, 'A limpeza mexeria no streaming; nada foi apagado.');
      }
      if (p.simular !== false || !plano.mp4.length) return { ok: true, guid, simulado: true, mp4: plano.mp4, streaming: plano.depois };
      const real = await chamar(b, 'POST', q + '&dryRun=false');
      const dr = real.d && real.d.data;
      if (real.http >= 300 || !dr) return erro(502, 'O Bunny não apagou (' + real.http + ').');
      return { ok: true, guid, simulado: false, mp4: dr.resolutionsToDeleteFromMp4 || plano.mp4, apagou: !!dr.deletedStorageObjects, streaming: dr.availableResolutionsAfter || plano.depois };
    }
    return erro(400, 'Ação desconhecida.');
  } catch (e) {
    console.error('[bunny] falha:', (e && e.message) || e);
    return erro(502, 'Falha ao falar com o Bunny.');
  }
}

module.exports = { bunnyAcao, tarefaValida, BIBLIOTECAS, arquivoNosso, biblioteca };
