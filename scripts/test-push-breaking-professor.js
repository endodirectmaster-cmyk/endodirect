// Breaking News do Mural do professor notifica sozinha, uma vez por card (24/11/2026).
//
// Professor: "Quando for breaking news, automaticamente já dispare". O card do ORION-4
// virou Breaking News por gravação direta no banco e ninguém foi notificado: o push só
// saía pelo botão/caixa do painel. Agora quem notifica é o servidor (rota pública
// api/publico?rota=push-breaking → lib/push-breaking.js, pushBreakingDoProfessor), e o
// painel só dispara a rota depois de salvar. Este teste prende:
//   1. o servidor manda UMA vez por card (reserva antes do envio), no máximo 3 por chamada,
//      no formato do botão Notificar, e não faz nada sem VAPID ou sem a lista do banco;
//   2. o painel chama a rota depois de gravar o estado global e NÃO manda ele mesmo o push
//      de uma Breaking News nova (seriam dois avisos no celular);
//   3. a chave do card no painel é a mesma da RPC (sourceId, at:<at>, link, título).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const { pushBreakingDoProfessor } = require(path.join(RAIZ, 'lib', 'push-breaking.js'));
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

(async () => {
  // ── 1. servidor ──
  const marcadas = new Set();
  const lista = [1, 2, 3, 4].map((n) => ({ chave: 'at:' + n, titulo: 'Notícia ' + n, fonte: n === 1 ? 'Novartis' : '' }));
  const rpc = async (nome, args) => {
    if (nome === 'endodirect_breaking_pendentes') return lista.filter((x) => !marcadas.has(x.chave));
    if (nome === 'endodirect_breaking_reservar') { if (marcadas.has(args.p_chave)) return false; marcadas.add(args.p_chave); return true; }
    return null;
  };
  const envios = [];
  const enviar = async (m) => { envios.push(m); return { ok: true, sent: 7 }; };
  const r1 = await pushBreakingDoProfessor({ rpc, enviar, configurado: () => true, base: 'https://www.endodirect.com.br' });
  ok('1ª chamada manda no máximo 3', envios.length === 3, String(envios.length));
  ok('formato do botão Notificar (título com a fonte)', envios[0] && envios[0].title === '🚨 Breaking News · Novartis', envios[0] && envios[0].title);
  ok('corpo é o título do card', envios[0] && envios[0].body === 'Notícia 1');
  ok('link abre o Mural', envios[0] && /\/#mural$/.test(envios[0].url));
  ok('relatório traz o que saiu', r1.ok && r1.enviados.length === 3 && r1.enviados[0].sent === 7);
  await pushBreakingDoProfessor({ rpc, enviar, configurado: () => true });
  ok('2ª chamada manda só o que faltava', envios.length === 4, String(envios.length));
  await pushBreakingDoProfessor({ rpc, enviar, configurado: () => true });
  ok('3ª chamada não repete nada', envios.length === 4, String(envios.length));
  // corrida: reserva já feita por outra chamada → não envia
  const envios2 = [];
  await pushBreakingDoProfessor({ rpc: async (n) => (n === 'endodirect_breaking_pendentes' ? [{ chave: 'x', titulo: 'X' }] : false), enviar: async (m) => { envios2.push(m); return { ok: true }; }, configurado: () => true });
  ok('sem a reserva, não envia (outra chamada chegou antes)', envios2.length === 0);
  let chamouRpc = false;
  const r3 = await pushBreakingDoProfessor({ rpc: async () => { chamouRpc = true; return []; }, enviar, configurado: () => false });
  ok('sem VAPID não lê nem envia', !r3.ok && !chamouRpc);
  const r4 = await pushBreakingDoProfessor({ rpc: async () => null, enviar, configurado: () => true });
  ok('lista ilegível: não envia e devolve ok:false', !r4.ok);
  const envFalha = await pushBreakingDoProfessor({ rpc: async (n) => (n === 'endodirect_breaking_pendentes' ? [{ chave: 'y', titulo: 'Y' }] : true), enviar: async () => { throw new Error('rede'); }, configurado: () => true });
  ok('envio que falha vira relatório, não exceção', envFalha.ok && envFalha.enviados[0] && envFalha.enviados[0].ok === false);

  // ── rota pública ──
  const pub = fs.readFileSync(path.join(RAIZ, 'api', 'publico.js'), 'utf8');
  ok('api/publico.js atende rota=push-breaking', /rota === 'push-breaking'\) return await pushBreaking\(req, res\)/.test(pub));
  ok('rota usa pushBreakingDoProfessor', /pushBreakingDoProfessor\(\{/.test(pub));

  // ── 2. painel ──
  const SRC = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  ok('depois de gravar o estado global, o painel chama breakingAutoPush', /captureGlobalBaseline\(p\);try\{breakingAutoPush\(p\);\}catch\(e\)\{\}/.test(SRC));
  ok('breakingAutoPush chama a rota pública', /fetch\('\/api\/publico\?rota=push-breaking'/.test(SRC));
  ok('editor do card: Breaking News nova não manda push pelo painel', /var _wantPush=!!\(_miPush&&_miPush\.checked\)&&!\(ehBreaking\(updatedAv\)&&!ehBreaking\(orig\)\);/.test(SRC));
  ok('formulário: Breaking News nova não manda push pelo painel', /if\(_bnNova\)wantPush=false;/.test(SRC));
  ok('caixa não se marca mais sozinha ao virar Breaking News', !/miPush\.checked=\/breaking\/i\.test\(miTipo\.value/.test(SRC));

  // ── 3. mesma chave do banco ──
  function corpo(nome) {
    const i = SRC.indexOf('function ' + nome + '(');
    let d = 0; const j = SRC.indexOf('{', i);
    for (let k = j; k < SRC.length; k++) { if (SRC[k] === '{') d++; else if (SRC[k] === '}') { d--; if (d === 0) return SRC.slice(i, k + 1); } }
    return '';
  }
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext('var breakingVistos={};' + corpo('breakingChave') + corpo('ehBreaking') + corpo('breakingNovas'), ctx);
  const ch = (o) => vm.runInContext('breakingChave(' + JSON.stringify(o) + ')', ctx);
  ok('chave: sourceId primeiro', ch({ sourceId: 's1', at: 5, link: 'l', titulo: 't' }) === 's1');
  ok('chave: depois at:<at> (como a RPC)', ch({ at: 1795532982990, link: 'l', titulo: 't' }) === 'at:1795532982990');
  ok('chave: depois link e título', ch({ link: 'l', titulo: 't' }) === 'l' && ch({ titulo: 't' }) === 't');
  const novas = vm.runInContext('breakingNovas([{tipo:"Breaking News",at:1},{tipo:"Comunicado",at:2},{tipo:"Breaking News",at:3,pushAutoAt:9},{breaking:true,at:4}])', ctx);
  ok('só Breaking News sem pushAutoAt contam', novas.length === 2, JSON.stringify(novas));
  const sql = fs.existsSync(path.join(RAIZ, 'supabase', 'push-breaking-automatico.sql')) ? fs.readFileSync(path.join(RAIZ, 'supabase', 'push-breaking-automatico.sql'), 'utf8') : '';
  ok('SQL versionado em supabase/push-breaking-automatico.sql', /endodirect_breaking_pendentes/.test(sql) && /'at:'\|\|\(v->>'at'\)/.test(sql));

  if (bad) { console.error('\n' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ Breaking News do professor: notifica sozinha, uma vez por card, sem push duplicado do painel');
})();
