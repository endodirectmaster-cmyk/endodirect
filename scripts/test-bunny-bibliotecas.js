// Regressão: Bunny em todas as bibliotecas (professor, 25/11/2026: "quero que você faça em todas as pastas o mesmo
// esquema que você fez dos resumos. A gente sobe o arquivo para a plataforma e de lá você transfere para o Bunny
// Stream" e "Tudo que já subiu, não precisa subir de novo [...] manter somente [o streaming]").
//  1) lib/bunny.js: cada curso na sua biblioteca, chave só da Vercel (nunca devolvida), só arquivo do nosso Storage
//     vai ao Bunny, e a limpeza apaga SÓ os MP4 (simula antes e recusa se o plano tocar no streaming).
//  2) api/ai.js: a rota exige o professor logado ou o código curto da checagem diária.
//  3) index.html: o formulário de aula dos cursos aceita arquivo; Resumos e cursos pedem ao Bunny depois do envio.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

async function main() {
  // ── 1) lib/bunny.js com fetch falso ──
  const CHAVE = 'chave-secreta-emc-123';
  let chamadas = [];
  let respostas = [];
  global.fetch = async (url, op) => {
    chamadas.push({ url: String(url), op: op || {} });
    const r = respostas.shift() || { status: 200, body: {} };
    return { ok: r.status < 300, status: r.status, json: async () => r.body };
  };
  delete process.env.BUNNY_KEY_EMC;
  const lib = require(path.join(raiz, 'lib', 'bunny.js'));
  const { bunnyAcao, arquivoNosso, biblioteca, tarefaValida } = lib;

  ok(biblioteca('emc').id === 741440 && biblioteca('emc').cdn === 'vz-0161a494-b29.b-cdn.net', 'EMC → biblioteca 741440');
  ok(biblioteca('resumos').id === 820720 && biblioteca('endo_essencial').id === 680513, 'Resumos 820720, Endocrinologia Essencial 680513');
  ok(biblioteca('endoteem').id === 683460 && biblioteca('endoteem').cdn === 'vz-f9c42905-205.b-cdn.net', 'ENDOTEEM → biblioteca 683460');
  ok(biblioteca('hiperglicemia') === null && biblioteca('__proto__') === null && biblioteca('toString') === null, 'curso sem biblioteca → null (sem herdar do Object)');

  const nosso = 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/cursos/videos/emc/1-aula.mp4';
  ok(arquivoNosso(nosso), 'arquivo do nosso Storage aceito');
  ok(arquivoNosso('https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/resumos/videos/x.mp4'), 'host do Supabase também');
  ['http://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/x.mp4',
    'https://auth.endodirect.com.br.evil.com/storage/v1/object/public/endodirect-assets/x.mp4',
    'https://evil.com/storage/v1/object/public/endodirect-assets/x.mp4',
    'https://auth.endodirect.com.br/storage/v1/object/public/outro-bucket/x.mp4',
    'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/../../x',
    'nada'].forEach((u) => ok(!arquivoNosso(u), '🧨 endereço de fora aceito: ' + u));

  // Sem chave: recusa dizendo qual variável falta, sem chamar o Bunny.
  chamadas = [];
  let r = await bunnyAcao({ acao: 'enviar', curso: 'emc', url: nosso, titulo: 'Aula' });
  ok(!r.ok && r.code === 503 && /BUNNY_KEY_EMC/.test(r.error) && chamadas.length === 0, 'sem a chave na Vercel: 503 dizendo qual variável falta: ' + JSON.stringify(r));
  r = await bunnyAcao({ acao: 'enviar', curso: 'lipides', url: nosso });
  ok(!r.ok && r.code === 400, 'curso sem biblioteca: 400');

  process.env.BUNNY_KEY_EMC = CHAVE;
  // enviar
  chamadas = []; respostas = [{ status: 200, body: { success: true, id: '11111111-2222-3333-4444-555555555555' } }];
  r = await bunnyAcao({ acao: 'enviar', curso: 'emc', url: nosso, titulo: 'Cetoacidose' });
  ok(r.ok && r.guid === '11111111-2222-3333-4444-555555555555' && r.hls === 'https://vz-0161a494-b29.b-cdn.net/11111111-2222-3333-4444-555555555555/playlist.m3u8', 'enviar devolve o código e o .m3u8 do CDN da EMC: ' + JSON.stringify(r));
  ok(chamadas.length === 1 && chamadas[0].url === 'https://video.bunnycdn.com/library/741440/videos/fetch' && chamadas[0].op.method === 'POST', 'enviar chama /library/741440/videos/fetch');
  ok(chamadas[0].op.headers.AccessKey === CHAVE, 'a chave vai só no cabeçalho AccessKey');
  const corpoEnvio = JSON.parse(chamadas[0].op.body);
  ok(corpoEnvio.url === nosso && corpoEnvio.title === 'Cetoacidose', 'corpo do pedido: url e título');
  ok(JSON.stringify(r).indexOf(CHAVE) < 0, '🧨 a resposta nunca devolve a chave');
  chamadas = [];
  r = await bunnyAcao({ acao: 'enviar', curso: 'emc', url: 'https://evil.com/x.mp4' });
  ok(!r.ok && r.code === 400 && chamadas.length === 0, '🧨 endereço de fora: recusado sem chamar o Bunny');
  respostas = [{ status: 401, body: { success: false } }];
  r = await bunnyAcao({ acao: 'enviar', curso: 'emc', url: nosso });
  ok(!r.ok && r.code === 502 && JSON.stringify(r).indexOf(CHAVE) < 0, 'Bunny recusou: 502 sem vazar a chave');

  // guid inválido
  chamadas = [];
  r = await bunnyAcao({ acao: 'status', curso: 'emc', guid: '../videos' });
  ok(!r.ok && r.code === 400 && chamadas.length === 0, '🧨 código de vídeo inválido: recusado sem chamar o Bunny');

  // mp4: simulação por padrão
  const G = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const planoBom = { data: { resolutionsToDeleteFromMp4: ['720p', '360p'], resolutionsToDeleteFromPlaylist: [], availableResolutionsAfter: ['240p', '360p', '720p'], modifiedPlaylist: false, deletedStorageObjects: false } };
  chamadas = []; respostas = [{ status: 200, body: planoBom }];
  r = await bunnyAcao({ acao: 'mp4', curso: 'emc', guid: G });
  ok(r.ok && r.simulado === true && r.mp4.join() === '720p,360p' && chamadas.length === 1, 'mp4 sem simular:false só simula: ' + JSON.stringify(r));
  ok(/\/videos\/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee\/resolutions\/cleanup\?outputs=mp4&allResolutions=true&deleteMp4Files=true&deleteOriginal=false&dryRun=true$/.test(chamadas[0].url), 'limpeza só de MP4 (outputs=mp4), sem o original, em simulação: ' + chamadas[0].url);
  // mp4 de verdade
  chamadas = []; respostas = [{ status: 200, body: planoBom }, { status: 200, body: { data: Object.assign({}, planoBom.data, { deletedStorageObjects: true }) } }];
  r = await bunnyAcao({ acao: 'mp4', curso: 'emc', guid: G, simular: false });
  ok(r.ok && r.simulado === false && r.apagou === true && chamadas.length === 2 && /dryRun=false$/.test(chamadas[1].url), 'simular:false: simula e depois apaga: ' + JSON.stringify(r));
  // plano que tocaria no streaming
  chamadas = []; respostas = [{ status: 200, body: { data: Object.assign({}, planoBom.data, { resolutionsToDeleteFromPlaylist: ['720p'] }) } }];
  r = await bunnyAcao({ acao: 'mp4', curso: 'emc', guid: G, simular: false });
  ok(!r.ok && r.code === 409 && chamadas.length === 1, '🧨 plano que mexeria no streaming: nada é apagado');
  chamadas = []; respostas = [{ status: 200, body: { data: Object.assign({}, planoBom.data, { modifiedPlaylist: true }) } }];
  r = await bunnyAcao({ acao: 'mp4', curso: 'emc', guid: G, simular: false });
  ok(!r.ok && r.code === 409 && chamadas.length === 1, '🧨 playlist alterada na simulação: nada é apagado');
  chamadas = []; respostas = [{ status: 200, body: { data: Object.assign({}, planoBom.data, { resolutionsToDeleteFromMp4: [] }) } }];
  r = await bunnyAcao({ acao: 'mp4', curso: 'emc', guid: G, simular: false });
  ok(r.ok && r.simulado === true && chamadas.length === 1, 'sem MP4 para apagar: não chama a limpeza de verdade');

  // listar / resolucoes / status
  chamadas = []; respostas = [{ status: 200, body: { totalItems: 3, items: [{ guid: G, title: 'A', status: 4, length: 100, storageSize: 1 }] } }];
  r = await bunnyAcao({ acao: 'listar', curso: 'emc', pagina: 2 });
  ok(r.ok && r.total === 3 && r.itens.length === 1 && !('storageSize' in r.itens[0]) && /\/videos\?page=2&itemsPerPage=100/.test(chamadas[0].url), 'listar: página e campos enxutos');
  respostas = [{ status: 200, body: { data: { availableResolutions: ['720p'], mp4Resolutions: [{ resolution: '720p', path: 'x' }], hasOriginal: true } } }];
  r = await bunnyAcao({ acao: 'resolucoes', curso: 'emc', guid: G });
  ok(r.ok && r.mp4.join() === '720p' && r.streaming.join() === '720p' && r.original === true, 'resolucoes: streaming, MP4 e original');
  respostas = [{ status: 200, body: { status: 4, length: 900, title: 'A', encodeProgress: 100 } }];
  r = await bunnyAcao({ acao: 'status', curso: 'emc', guid: G });
  ok(r.ok && r.status === 4 && r.length === 900 && /vz-0161a494-b29\.b-cdn\.net\/aaaaaaaa/.test(r.hls), 'status do processamento');

  // código curto da tarefa diária
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  chamadas = [];
  ok(await tarefaValida('curto') === false && await tarefaValida('') === false && await tarefaValida('g'.repeat(64)) === false && chamadas.length === 0, '🧨 código fora do formato: recusado sem consultar o banco');
  const tk = 'a'.repeat(64);
  respostas = [{ status: 200, body: [{ token: tk }] }];
  ok(await tarefaValida(tk) === true && /\/rest\/v1\/endodirect_tarefa_token\?token=eq\.a{64}&expira=gt\./.test(chamadas[0].url) && chamadas[0].op.headers.apikey === 'svc', 'código válido e não vencido: aceito (consulta pelo service role)');
  respostas = [{ status: 200, body: [] }];
  ok(await tarefaValida(tk) === false, 'código vencido ou inexistente: recusado');

  // apagar do Storage a cópia que já foi para o Bunny (professor, 25/11/2026: "Pode")
  const cam = 'resumos/videos/2026-11-02/1793663784222-rastreio.mp4';
  for (const ruim of ['resumos/pmc/figura.png', 'resumos/videos/../../segredo.mp4', 'outra/videos/x.mp4', 'resumos/videos//x.mp4', '', 'cursos/videos/emc/x.exe']) {
    chamadas = [];
    r = await bunnyAcao({ acao: 'apagar_storage', caminho: ruim });
    ok(!r.ok && r.code === 400 && chamadas.length === 0, '🧨 apagar fora das pastas de vídeo: recusado sem chamar nada: ' + ruim);
  }
  chamadas = []; respostas = [{ status: 200, body: true }];
  r = await bunnyAcao({ acao: 'apagar_storage', caminho: cam });
  ok(!r.ok && r.code === 409 && chamadas.length === 1, '🧨 arquivo ainda usado por alguma aula: nada é apagado');
  ok(/\/rest\/v1\/rpc\/endodirect_storage_em_uso$/.test(chamadas[0].url) && JSON.parse(chamadas[0].op.body).p_path === cam, 'confere o uso pela função do banco, com o caminho exato');
  chamadas = []; respostas = [{ status: 200, body: false }, { status: 200, body: [{ name: cam }] }];
  r = await bunnyAcao({ acao: 'apagar_storage', caminho: cam });
  ok(r.ok && r.apagado === true && chamadas.length === 2, 'arquivo sem uso: apagado: ' + JSON.stringify(r));
  ok(/\/storage\/v1\/object\/endodirect-assets$/.test(chamadas[1].url) && chamadas[1].op.method === 'DELETE' && JSON.parse(chamadas[1].op.body).prefixes.join() === cam, 'apaga só aquele arquivo do bucket endodirect-assets');
  chamadas = []; respostas = [{ status: 500, body: { message: 'x' } }];
  r = await bunnyAcao({ acao: 'apagar_storage', caminho: cam });
  ok(!r.ok && r.code === 502 && chamadas.length === 1, '🧨 sem conseguir conferir o uso: nada é apagado');
  chamadas = []; respostas = [{ status: 200, body: false }, { status: 200, body: [] }];
  r = await bunnyAcao({ acao: 'apagar_storage', caminho: 'cursos/videos/emc/1-aula.mp4' });
  ok(r.ok && r.apagado === false, 'arquivo que já não existia: ok, apagado=false');

  // ── 2) api/ai.js ──
  const api = fs.readFileSync(path.join(raiz, 'api', 'ai.js'), 'utf8');
  const iRota = api.indexOf("sbody.kind === 'bunny'");
  ok(iRota > 0 && iRota < api.indexOf('DAQUI PARA BAIXO É A CHAMADA GENÉRICA À ANTHROPIC'), 'rota bunny antes da chamada à Anthropic');
  ok(/const admin = await adminFromReq\(req\);\s*if \(!admin && !\(await tarefaValida\(sbody\.tarefa\)\)\) return json\(res, 401/.test(api.slice(iRota, iRota + 400)), '🧨 rota bunny exige professor ou código da tarefa');

  // ── 3) index.html ──
  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  function corpo(nome) {
    const i = html.indexOf('\nfunction ' + nome + '(');
    if (i < 0) throw new Error('função ' + nome + ' não encontrada');
    let d = 0;
    for (let j = html.indexOf('{', i); j < html.length; j++) {
      if (html[j] === '{') d++;
      else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
    }
    throw new Error('não fechou ' + nome);
  }
  ok(/id="adm-curso-file" accept="video\//.test(html), 'formulário da aula dos cursos aceita arquivo');
  ok(/uploadAdminAssetResumable\(arq,'cursos\/videos\/'\+/.test(html), 'arquivo da aula sobe em cursos/videos/<curso>');
  ok(/if\(arqNovo&&aulaSalva\)bunnyEnviarAula\(aulaSalva\.curso,aulaSalva,'src',aulaSalva\.title,persistCursos\);/.test(html), 'aula salva com arquivo novo: pede ao Bunny do curso');
  ok(/if\(arqNovo&&arqNovo\.trocaVideo\)\{delete aulaSalva\.caps;delete aulaSalva\.bunny;\}/.test(html), 'vídeo trocado: tópicos e pedido antigos saem');
  ok(/grava\(v\);bunnyEnviarAula\('resumos',v,'src',titulo,persistDiretrizes\);/.test(html), 'Resumos: pede ao Bunny depois do envio');
  ok(/if\(videoNoStorage\(c\.src\)\)meta\+=/.test(html), 'cartão da aula no painel mostra que ainda está no Storage');

  const ctx = vm.createContext({});
  vm.runInContext(`
    var avisos=[],pedidos=[],salvos=0,resp=null,AI_API_ENDPOINT='/api/ai';
    function notify(m,t){avisos.push([t,m]);}
    function admSupportToken(){return Promise.resolve('tok');}
    function fetch(u,op){pedidos.push([u,op]);return Promise.resolve({ok:resp.ok,json:function(){return Promise.resolve(resp.body);}});}
    function salvar(){salvos++;}
  `, ctx);
  vm.runInContext(corpo('videoNoStorage') + '\n' + corpo('bunnyEnviarAula'), ctx);
  const run = (c) => vm.runInContext(c, ctx);
  run(`resp={ok:true,body:{ok:true,guid:'g1'}};var o1={src:'${nosso}'};`);
  await run("bunnyEnviarAula('emc',o1,'src','Aula',salvar)");
  const pedido = JSON.parse(run('pedidos[0][1].body'));
  ok(pedido.kind === 'bunny' && pedido.acao === 'enviar' && pedido.curso === 'emc' && pedido.url === nosso, 'painel manda kind bunny/enviar com curso e arquivo');
  ok(run("pedidos[0][1].headers.Authorization") === 'Bearer tok', 'com a sessão do professor');
  ok(run('o1.bunny&&o1.bunny.guid') === 'g1' && run('salvos') === 1, 'guarda o código do Bunny na aula e salva');
  run(`pedidos=[];var o2={src:'https://vz-0161a494-b29.b-cdn.net/x/playlist.m3u8'};`);
  await run("bunnyEnviarAula('emc',o2,'src','Aula',salvar)");
  ok(run('pedidos.length') === 0 && !run('o2.bunny'), 'aula que já está no Bunny: nada é pedido');
  run(`resp={ok:true,body:{ok:true,guid:'g3'}};var o3={src:'${nosso}'};`);
  const p3 = run("bunnyEnviarAula('emc',o3,'src','Aula',salvar)");
  run("o3.src='https://outro/storage/v1/object/public/endodirect-assets/novo.mp4'");
  await p3;
  ok(!run('o3.bunny'), '🧨 arquivo trocado enquanto o pedido ia: não marca o código errado');
  run(`resp={ok:false,body:{ok:false,error:'Falta a chave'}};var o4={src:'${nosso}'};avisos=[];`);
  await run("bunnyEnviarAula('emc',o4,'src','Aula',salvar)");
  ok(!run('o4.bunny') && run('avisos[0][0]') === 'info' && /madrugada/.test(run('avisos[0][1]')), 'Bunny falhou: aviso calmo, a madrugada tenta de novo');

  if (falhas.length) { console.error('✗ Bunny nas bibliotecas:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('✓ Bunny nas bibliotecas: cada curso na sua, chave só na Vercel, só MP4 apagado, envio pelo painel');
}
main().catch((e) => { console.error(e); process.exit(1); });
