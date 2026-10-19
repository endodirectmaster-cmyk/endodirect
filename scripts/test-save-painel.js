// Regressão: o SEGUNDO save do painel não pode desfazer o que o primeiro adotou do
// servidor, e leitura que falhou não pode virar save às cegas.
//
// Em 19/10/2026 a troca do cap. 109 (vitamina D, gravada direto no banco às 13h11
// UTC) voltou às 13h56. O painel do professor, aberto desde antes, salvou várias
// vezes seguidas: o primeiro save rodou o merge, adotou a edição do servidor e
// gravou certo — mas só em `p`, o objeto enviado; a memória do painel seguiu com a
// cópia velha. No save seguinte o servidor não tinha mudado desde o save deste
// painel, o merge não rodava e `p` saía da memória: a edição sumia. Nos mesmos
// minutos o GET do estado global devolveu 525 e 503, e o save seguia com `{}` como
// "servidor", sem merge nenhum.
//
// Este teste roda o saveRemoteState REAL do index.html (com o merge, o
// globalStatePayload e o applyStatePayload reais) contra um Supabase falso.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada no index.html');
  let d = 0, j = html.indexOf('{', i);
  for (; j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou o corpo de ' + nome);
}
function objeto(nome) {
  const i = html.indexOf('var ' + nome + '={');
  if (i < 0) throw new Error('objeto ' + nome + ' não encontrado no index.html');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1) + ';'; }
  }
  throw new Error('não fechou o objeto ' + nome);
}

// a declaração vem do próprio index.html: sem ela o save real quebraria no 1º uso
const DECL = (html.match(/^var globalReadRetries=[^\n]*;$/m) || [])[0];
ok(DECL, 'index.html tem de declarar globalReadRetries e globalReadRetryTimer');
const clone = (x) => JSON.parse(JSON.stringify(x));
const VAZIAS = ['provasDB', 'podcasts', 'admCursos', 'admCursoModsExtra', 'admEstudantes', 'sharedMM', 'fcShared',
  'dirTemasExtra', 'igStories', 'igPending', 'admAvisos', 'radarAvisos', 'radarHidden', 'admQuestoes'];

function cenario(servidor) {
  const sb = {
    console: { log: console.log, error: console.error, warn: (...a) => sb.warns.push(a) },
    document: { getElementById: () => null },
    DB: {}, REMOTE_STATE_KEYS: [], PERSONAL_STATE_KEYS: [], globalServerKeys: {}, aoVivoAgendada: null,
    currentUser: { id: 'prof', email: 'prof@x', role: 'admin' }, remoteStateLoaded: true, remoteStateWarned: false,
    remoteStateSaveTimer: null, lastGlobalUpdatedAt: null, globalBaseline: {},
    upserts: 0, avisos: [], warns: [], timers: [], canon: 0,
  };
  // timer agendado: guarda o atraso; a "próxima tentativa" o teste dispara à mão
  sb.setTimeout = (fn, ms) => { sb.timers.push({ fn, ms, vivo: true }); return sb.timers.length; };
  sb.clearTimeout = (id) => { if (id && sb.timers[id - 1]) sb.timers[id - 1].vivo = false; };
  VAZIAS.forEach((k) => { sb[k] = []; });
  // o que o app faz em volta do save e não importa aqui
  sb.canonProvaArea = (x) => { sb.canon++; return x; };
  ['normalizeAdmEstudantes', 'dirMigrateSub', 'mergeRadarAvisos'].forEach((f) => { sb[f] = (x) => x; });
  ['lsSet', 'invalidateSharedMeta', 'renderMMList', 'updateAdmPendBadge', 'maybePendAlert', 'renderQotdArchive',
    'renderEnqueteCme', 'renderDashAcervo', 'definirAcessos'].forEach((f) => { sb[f] = () => {}; });
  sb.mesclarFeitas = (a) => a;
  sb.isRadarAuto = () => false;
  sb.avisoKeyStr = (it) => String(it && it.k);
  sb.rotuloConflito = (c) => String(c && c.key);
  sb.notify = (msg, tipo) => { sb.avisos.push({ msg, tipo }); };
  sb.canUseRemoteState = () => true;
  sb.userStatePayload = () => ({});
  sb.queueRemoteStateSave = () => null;
  sb.getSupabaseClient = () => ({
    from(tab) {
      return {
        upsert(row) {
          if (tab === 'endodirect_global_state') { sb.upserts++; servidor.payload = clone(row.payload); servidor.updated_at = row.updated_at; }
          return Promise.resolve({ error: null });
        },
        select() {
          return { eq() { return { maybeSingle() {
            if (servidor.falhaLeitura) return Promise.resolve({ data: null, error: { message: '525' } });
            return Promise.resolve({ data: { payload: clone(servidor.payload), updated_at: servidor.updated_at }, error: null });
          } }; } };
        },
      };
    },
  });
  vm.createContext(sb);
  vm.runInContext([objeto('GLOBAL_MERGE_KEYS'), DECL || 'var globalReadRetries=0,globalReadRetryTimer=null;', corpo('stableStr'),
    corpo('itemSig'), corpo('mergeConcurrent'), corpo('captureGlobalBaseline'), corpo('globalStatePayload'),
    corpo('applyStatePayload'), corpo('saveRemoteState')].join('\n'), sb);
  // o painel carregou o estado do servidor (como no hydrate)
  vm.runInContext('applyStatePayload(' + JSON.stringify(servidor.payload) + ');lastGlobalUpdatedAt=' + JSON.stringify(servidor.updated_at) +
    ';captureGlobalBaseline(' + JSON.stringify(servidor.payload) + ');', sb);
  return sb;
}
const cap = (resumo, tema) => ({ fonte: 'Síntese Endodirect', tema: tema || 'Osteomalácia e Raquitismo', sub: 'Osteometabolismo', resumo });
const VELHO = 'manutenção de 800 UI/dia', NOVO = 'manutenção de 1.500–2.000 UI/dia';
const vivos = (sb) => sb.timers.filter((t) => t.vivo);

(async () => {
  // 1) Edição no banco com o painel aberto; o painel salva DUAS vezes depois.
  {
    const servidor = { payload: { diretrizes: [cap(VELHO)], ig_stories: [], provas: [{ id: 'q1', stem: 'x' }] }, updated_at: '2026-10-19T13:10:07.000Z' };
    const sb = cenario(servidor);
    const canonCarga = sb.canon;
    servidor.payload.diretrizes[0] = cap(NOVO); servidor.updated_at = '2026-10-19 13:11:46.155878+00';
    // o professor mexe noutra coisa (a fila de stories) e o painel salva
    vm.runInContext("igStories.push({id:'s1',stem:'x'});", sb);
    await vm.runInContext('saveRemoteState()', sb);
    ok(servidor.payload.diretrizes[0].resumo === NOVO, '1º save: o merge tem de adotar a edição do servidor (já era assim)');
    vm.runInContext("igStories.push({id:'s2',stem:'y'});", sb);
    await vm.runInContext('saveRemoteState()', sb);
    ok(servidor.payload.diretrizes[0].resumo === NOVO,
      'REGRESSÃO 19/10: o 2º save desfez a edição do servidor que o 1º tinha adotado (o cap. 109 voltou a ' +
      JSON.stringify(servidor.payload.diretrizes[0].resumo) + ')');
    ok(servidor.payload.ig_stories.length === 2, 'as edições do próprio professor (stories) seguem gravadas');
    ok(vm.runInContext('diretrizes[0].resumo', sb) === NOVO, 'a memória do painel tem de ficar com o que foi adotado do servidor');
    ok(sb.canon === canonCarga, 'só as coleções que trouxeram algo do servidor voltam à memória (as questões não mudaram e foram refeitas)');
  }
  // 2) Item novo de outro editor, adotado num save, não pode sumir no seguinte.
  {
    const servidor = { payload: { diretrizes: [cap(VELHO)], fc_shared: [] }, updated_at: 't0' };
    const sb = cenario(servidor);
    servidor.payload.fc_shared.push({ id: 'fc-novo', front: 'Cálcio?', back: '8,5–10,5' }); servidor.updated_at = 't1';
    await vm.runInContext('saveRemoteState()', sb);
    await vm.runInContext('saveRemoteState()', sb);
    ok(servidor.payload.fc_shared.length === 1, 'flashcard criado por outro editor sumiu no 2º save do painel');
    ok(vm.runInContext('fcShared.length', sb) === 1, 'o flashcard do outro editor tem de entrar na memória do painel');
  }
  // 3) Conflito: o professor mexeu no MESMO capítulo que o banco. Fica o dele (e o
  // aviso), e o capítulo vizinho que só o banco mudou entra — sem levar o dele junto.
  {
    const servidor = { payload: { diretrizes: [cap(VELHO), cap('vizinho velho', 'Raquitismo hipofosfatêmico')] }, updated_at: 't0' };
    const sb = cenario(servidor);
    vm.runInContext("diretrizes[0]=Object.assign({},diretrizes[0],{resumo:'versão do professor'});", sb);
    servidor.payload.diretrizes[0] = cap(NOVO);
    servidor.payload.diretrizes[1] = cap('vizinho novo', 'Raquitismo hipofosfatêmico'); servidor.updated_at = 't1';
    await vm.runInContext('saveRemoteState()', sb);
    await vm.runInContext('saveRemoteState()', sb);
    ok(servidor.payload.diretrizes[0].resumo === 'versão do professor' && vm.runInContext('diretrizes[0].resumo', sb) === 'versão do professor',
      'no conflito, a edição do professor tem de ficar no banco e na memória');
    ok(servidor.payload.diretrizes[1].resumo === 'vizinho novo' && vm.runInContext('diretrizes[1].resumo', sb) === 'vizinho novo',
      'no conflito, o capítulo que só o banco mudou tem de entrar e ficar');
    ok(sb.avisos.some((a) => a.tipo === 'err' && /mantive a SUA versão/.test(a.msg)), 'conflito tem de avisar em vermelho');
  }
  // 4) A leitura antes do save falhou: não grava às cegas e tenta de novo até conseguir.
  {
    const servidor = { payload: { diretrizes: [cap(VELHO)], newsletter_sent: ['a'] }, updated_at: 't0' };
    const sb = cenario(servidor);
    servidor.payload.diretrizes[0] = cap(NOVO); servidor.payload.newsletter_sent = ['a', 'b']; servidor.updated_at = 't1';
    servidor.falhaLeitura = true;
    const r = await vm.runInContext('saveRemoteState()', sb);
    ok(sb.upserts === 0, 'com a leitura falhando (525/503), o save NÃO pode gravar o estado global às cegas');
    ok(r === false, 'o save tem de devolver false quando a leitura falha');
    ok(servidor.payload.diretrizes[0].resumo === NOVO && servidor.payload.newsletter_sent.length === 2,
      'nada do servidor pode ser sobrescrito quando a leitura falhou');
    ok(vivos(sb).length === 1 && vivos(sb)[0].ms === 4000, 'a 1ª falha de leitura agenda nova tentativa em 4 s');
    ok(!sb.avisos.length, 'uma falha só (o 525 passageiro) não assusta o professor com aviso');
    // falhas seguidas: o atraso dobra até um minuto, nunca desiste e avisa uma vez só
    for (let i = 0; i < 5; i++) await vm.runInContext('saveRemoteState()', sb);
    ok(sb.upserts === 0, 'nenhuma das tentativas com a leitura falhando pode gravar');
    ok(JSON.stringify(sb.timers.map((t) => t.ms)) === '[4000,8000,16000,32000,60000,60000]',
      'tentativas em 4, 8, 16, 32 s e depois a cada minuto (veio ' + JSON.stringify(sb.timers.map((t) => t.ms)) + ')');
    ok(vivos(sb).length === 1, 'só uma próxima tentativa agendada por vez');
    const naoFeche = sb.avisos.filter((a) => /NÃO foram salvas/.test(a.msg));
    ok(naoFeche.length === 1 && naoFeche[0].tipo === 'err', 'na 3ª falha seguida, avisa UMA vez para não fechar o painel');
    ok(!sb.avisos.some((a) => /setup SQL/.test(a.msg)), 'falha de leitura não é "verifique o setup SQL"');
    // a leitura volta: a próxima tentativa junta normalmente e avisa que salvou
    servidor.falhaLeitura = false;
    await vm.runInContext('saveRemoteState()', sb);
    ok(sb.upserts === 1 && servidor.payload.diretrizes[0].resumo === NOVO && servidor.payload.newsletter_sent.length === 2,
      'com a leitura de volta, o save junta e grava sem perder o que o servidor tinha');
    ok(vm.runInContext('globalReadRetries', sb) === 0 && !vivos(sb).length, 'leitura bem-sucedida zera as tentativas e cancela a agendada');
    ok(sb.avisos.some((a) => a.tipo === 'info' && /^Salvo: o servidor voltou/.test(a.msg)), 'depois do aviso de falha, avisa que salvou');
  }
  if (falhas.length) {
    console.error('✗ save do painel:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ save do painel: o 2º save não desfaz o que o 1º adotou do servidor, e leitura que falha não grava às cegas');
})().catch((e) => { console.error(e); process.exit(1); });
