// "Apaguei a notícia do mural" tem de valer PARA O ALUNO.
//
// ⚠️ O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR ESTAVA NO AR E ERA INVISÍVEL.
// Quando o professor apagava um card do Mural, o item sumia da tela DELE (o
// cliente filtra por `radar_hidden` na leitura) e continuava no banco — o
// gatilho `endodirect_global_preserve_server_keys` restaurava `radar_avisos` do
// valor antigo no mesmo UPDATE, e as RPCs de conteúdo entregavam o item a todos
// os alunos sem olhar `radar_hidden`. Em 03/08/2026 havia 4 itens apagados
// ainda publicados, entre eles duas notícias FALSAS ("FC Bayern" entrando como
// se fosse a Bayer). O professor só descobriu porque abriu a conta de demo.
//
// Três lugares precisam concordar, e a chave do item é a MESMA nos três
// (sourceId || link || titulo):
//   • banco: gatilho + RPCs de conteúdo  → supabase/mural-apagado-vale-para-o-aluno.sql
//   • cron:  lib/radar.js                → não re-adiciona E não mantém o oculto
//   • app:   index.html                  → filtra na leitura (mergeRadarAvisos)
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(RAIZ, 'lib', 'radar.js'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Recorta uma função pelo nome, até a próxima declaração no nível zero.
// ⚠️ `\nfunction ` sozinho não basta: em lib/radar.js a declaração seguinte pode
// ser `async function`, e aí o recorte engolia o resto do arquivo (inclusive o
// module.exports, que estoura no vm).
function trecho(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) { console.log('  ✗ não achei function ' + nome); bad++; return ''; }
  const fins = ['\nfunction ', '\nasync function ', '\nconst ', '\nmodule.exports']
    .map((d) => SRC.indexOf(d, i + 1)).filter((p) => p > 0);
  return SRC.slice(i, fins.length ? Math.min.apply(null, fins) : undefined);
}
function linhaConst(nome) {
  const m = new RegExp('^const ' + nome + '[^\\n]*$', 'm').exec(SRC);
  if (!m) { console.log('  ✗ não achei const ' + nome); bad++; return ''; }
  return m[0];
}

const ctx = { console, Map, Set, Number, Array, String, Date, isBreakingTrusted: require('../lib/news').isBreakingTrusted };
vm.createContext(ctx);
vm.runInContext([
  linhaConst('MAX_MURAL_ITEMS'), linhaConst('AUTO_ITEM_TTL_MS'),
  trecho('mergeMuralItems'), trecho('existingMuralKeys')
].join('\n'), ctx);

const agora = Date.now();
const item = (sourceId, extra) => Object.assign({ sourceId, titulo: 'Artigo ' + sourceId, at: agora - 864e5, fonte: 'JCEM' }, extra || {});

// ---- 1. ⚠️ O ITEM APAGADO SAI DO PAYLOAD --------------------------------------
// O cron grava como service_role e NÃO passa pelo gatilho do banco. Se ele
// mantiver o item apagado, o aluno volta a vê-lo mesmo com o banco corrigido.
{
  const payload = {
    radar_avisos: [item('news:a'), item('news:b'), item('news:c')],
    radar_hidden: ['news:b']
  };
  const r = ctx.mergeMuralItems(payload, []);
  const chaves = r.payload.radar_avisos.map((x) => x.sourceId).sort();
  ok('⚠️ o item apagado pelo professor NÃO sobrevive ao merge do cron',
     chaves.indexOf('news:b') < 0, chaves.join(','));
  ok('e o resto do mural continua inteiro', chaves.join(',') === 'news:a,news:c', chaves.join(','));
}

// ---- 2. ⚠️ SEM EXCESSO DE ZELO ------------------------------------------------
// Filtrar demais esvazia o Mural — o oposto do defeito, igualmente grave.
{
  const payload = { radar_avisos: [item('news:a'), item('news:b')], radar_hidden: [] };
  ok('lista de apagados vazia não apaga nada',
     ctx.mergeMuralItems(payload, []).payload.radar_avisos.length === 2);
  const semChave = { radar_avisos: [item('news:a')] };
  ok('payload sem radar_hidden não quebra e não apaga',
     ctx.mergeMuralItems(semChave, []).payload.radar_avisos.length === 1);
}

// ---- 3. a chave do apagado casa por link e por título -------------------------
// avisoKeyStr = sourceId || link || titulo. Item antigo pode não ter sourceId.
{
  const porLink = { radar_avisos: [{ titulo: 'X', link: 'https://x/y', at: agora }], radar_hidden: ['https://x/y'] };
  ok('apagado casa pelo link quando não há sourceId',
     ctx.mergeMuralItems(porLink, []).payload.radar_avisos.length === 0);
  const porTitulo = { radar_avisos: [{ titulo: 'Só título', at: agora }], radar_hidden: ['Só título'] };
  ok('apagado casa pelo título quando não há link nem sourceId',
     ctx.mergeMuralItems(porTitulo, []).payload.radar_avisos.length === 0);
}

// ---- 4. ⚠️ E NÃO VOLTA NA PRÓXIMA COLHEITA -----------------------------------
{
  const payload = { radar_avisos: [], radar_hidden: ['news:b'] };
  const keys = ctx.existingMuralKeys(payload);
  ok('⚠️ a chave apagada entra na lista de exclusão da busca', keys.has('news:b'),
     'sem isso o cron recolhe a mesma notícia amanhã');
  const r = ctx.mergeMuralItems(payload, [item('news:b')]);
  ok('e mesmo se ela chegar assim mesmo, não é gravada',
     r.payload.radar_avisos.every((x) => x.sourceId !== 'news:b'),
     JSON.stringify(r.payload.radar_avisos.map((x) => x.sourceId)));
}

// ---- 5. ⚠️ A CORREÇÃO DO BANCO ESTÁ REGISTRADA NO REPO ------------------------
// O corpo autoritativo do gatilho e das RPCs vive no Supabase. O arquivo abaixo
// é o registro — sem ele, a correção some no histórico do painel e a próxima
// pessoa reescreve o gatilho antigo.
{
  const sql = path.join(RAIZ, 'supabase', 'mural-apagado-vale-para-o-aluno.sql');
  ok('o registro da migração existe no repo', fs.existsSync(sql), sql);
  if (fs.existsSync(sql)) {
    const t = fs.readFileSync(sql, 'utf8');
    ok('o gatilho registrado filtra por radar_hidden', /ocultos\s*\?\s*coalesce\(it ->> 'sourceId'/.test(t));
    ok('e o gatilho AINDA preserva as chaves do servidor',
       /server_keys text\[\] := array\['radar_avisos'/.test(t) && /newsletter_recent/.test(t),
       'sem isso um save com cópia velha volta a apagar o que o cron trouxe');
    ok('o filtro das RPCs de conteúdo está registrado', /radar_hidden'.*\?\s*coalesce\(v->>'sourceId'/s.test(t));
    ok('a limpeza do resíduo está registrada e é idempotente', /update public\.endodirect_global_state/.test(t));
  }
}

// ---- 6. ⚠️ A CÓPIA NO APARELHO DO ALUNO TAMBÉM TEM DE SER LIMPA ---------------
// Depois de o banco já estar correto, os dois cards falsos CONTINUARAM na tela.
// O app semeia o mural com a cópia do localStorage
// (`admAvisos = mergeRadarAvisos(lsGet('adm_avisos'))`) e essa semente só é
// filtrada por `radarHidden`. Duas falhas somadas: `radarHidden` era declarado
// DEPOIS (logo, vazio na hora da semente) e nenhuma RPC de conteúdo devolvia
// `radar_hidden` — o filtro existia e nunca recebia a lista.
{
  const app = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  ok('mergeRadarAvisos filtra o que foi apagado', /var hid=\{\};\(Array\.isArray\(radarHidden\)/.test(app));
  ok('a chave do app é a mesma dos outros dois lugares',
     /function avisoKeyStr\(a\)\{return String\(\(a&&\(a\.sourceId\|\|a\.link\|\|a\.titulo\)\)\|\|''\);\}/.test(app),
     'se a regra da chave divergir, o apagado volta em um dos lados');

  const iHidden = app.indexOf('var radarHidden=');
  const iAvisos = app.indexOf('var admAvisos=');
  ok('⚠️ radarHidden é declarado ANTES de admAvisos', iHidden > 0 && iAvisos > 0 && iHidden < iAvisos,
     'declarado depois, a semente do localStorage passa por um filtro VAZIO');
  ok('⚠️ e a lista de apagados vem do aparelho, não de uma lista vazia',
     /var radarHidden=lsGet\('radar_hidden'\)/.test(app),
     'sem isso o filtro da semente não tem o que filtrar antes de o servidor responder');
  ok('⚠️ o que o servidor manda é guardado no aparelho',
     /radarHidden=payload\.radar_hidden;try\{lsSet\('radar_hidden'/.test(app),
     'sem guardar, a próxima abertura recomeça sem saber o que foi apagado');

  const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'mural-apagado-vale-para-o-aluno.sql'), 'utf8');
  ok('⚠️ e as RPCs de conteúdo ENTREGAM radar_hidden ao cliente',
     /'radar_hidden',\s*coalesce\(payload->'radar_hidden'/.test(sql),
     'o filtro do app roda com lista vazia se o servidor não mandar');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do mural apagado falharam.'); process.exit(1); }
console.log('Mural apagado (vale para o aluno): OK');
