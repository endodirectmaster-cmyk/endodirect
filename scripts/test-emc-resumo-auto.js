// Resumo automático da aula da Educação Médica Continuada (07/11/2026).
//
// Pedido do professor: "Sempre que for inserida uma nova aula no curso de Educação Médica
// Continuada, já introduz automaticamente um resumo conforme modelo aula anterior que foi dado
// por mim".
//
// O que este teste prende:
//   1. o MODELO é o resumo da aula mais antiga da EMC que não foi gerado automaticamente;
//   2. a transcrição do Bunny (legenda do HLS ou captions/<idioma>.vtt) vira texto corrido, e a
//      falta dela (ou do CORS) não derruba nada;
//   3. o pedido leva o modelo como exemplo de estrutura, as seções na ordem, as regras de registro
//      e de precisão (número só com fonte), a base certa (transcrição ou título/descrição/capítulos)
//      e o grounding do PubMed com a busca em inglês;
//   4. a saída é limpa (markdown, emoji, marcador, título repetido) e só entra se tiver o formato;
//   5. nunca sobrescreve um resumo existente, salvo no "refazer", em que o antigo só sai quando
//      o novo chega; uma geração por aula de cada vez;
//   6. o gancho: aula NOVA da EMC com a caixa marcada e o campo Resumo vazio; botão no card.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function extrai(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let nivel = 0;
  for (let k = SRC.indexOf('{', i); k < SRC.length; k++) {
    if (SRC[k] === '{') nivel++;
    else if (SRC[k] === '}') { nivel--; if (!nivel) return SRC.slice(i, k + 1); }
  }
  return '';
}
const NOMES = ['emcModeloResumo', 'vttParaTexto', 'emcTranscricaoBunny', 'emcResumoPrompt', 'emcLimpaResumo', 'emcResumoValido', 'emcAchaAula', 'gerarResumoAulaEmc'];
const ctx = { String, Math, Array, Object, Promise, Date, JSON, RegExp, URL, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n') + `
  var EMC_SLUG='emc';var EMC_SECOES=['FUNDAMENTAÇÃO','DEFINIÇÕES','EVIDÊNCIA CLÍNICA','ESTRATIFICAÇÃO DE RISCO','CONDUTA','PERSPECTIVAS'];
  var emcResumoEmCurso={};var CLINICAL_AUTHORING='[REGRAS DE AUTORIA]';var AI_MODEL_CLINICO='claude-opus-5-5';
  function groundSys(s){return '[DIRETRIZES]__SPLIT__'+s;}
  var admCursos=[],avisos=[],salvos=0,chamadas=[],respostas=[],rede={};
  var admCurrentSec='cursos',admCursoSubtab='ver';
  function notify(m,t){avisos.push([t||'',m]);}
  function persistCursos(){salvos++;}
  function renderAdmSec(){} function renderCursosAluno(){}
  function callAI(sys,usr,max,model,grounding){chamadas.push({sys:sys,usr:usr,max:max,model:model,grounding:grounding});var r=respostas.shift();return r instanceof Error?Promise.reject(r):Promise.resolve(r);}
  var AbortController=undefined;
  function fetch(u){var r=rede[u];if(r===undefined)return Promise.reject(new Error('CORS'));return Promise.resolve({ok:r!==null,text:function(){return Promise.resolve(r||'');}});}
`, ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', vm.runInContext('typeof ' + f, ctx) === 'function'));
const run = (c) => vm.runInContext(c, ctx);

const MODELO = 'FUNDAMENTAÇÃO\n• Item do modelo.\n\nEVIDÊNCIA CLÍNICA\nSubestudo X\n• Outro item.';
const BOM = 'FUNDAMENTAÇÃO\n• ' + 'A'.repeat(600) + '\n\nEVIDÊNCIA CLÍNICA\n• ' + 'B'.repeat(600) + '\n\nCONDUTA\n• ' + 'C'.repeat(600);

(async () => {
  // ---- 1. o modelo --------------------------------------------------------------------------
  run(`admCursos=[
    {curso:'emc',title:'Auto antiga',at:1,resumo:'auto',resumoAuto:{at:1}},
    {curso:'emc',title:'Massa magra',at:2,resumo:${JSON.stringify(MODELO)}},
    {curso:'emc',title:'Outra manual mais nova',at:5,resumo:'manual nova'},
    {curso:'endoteem',title:'Outro curso',at:0,resumo:'de outro curso'},
    {curso:'emc',title:'Nova',at:9,src:'https://vz-1.b-cdn.net/abc/playlist.m3u8',desc:'Evidências e diretrizes.',modulo:'Diabetes',caps:[{t:165,titulo:'Importância do tema'}]}];`);
  ok('modelo = aula mais antiga da EMC, não automática, de outro curso não', run('emcModeloResumo(admCursos[4])') === MODELO);
  ok('modelo exclui a própria aula', run('emcModeloResumo(admCursos[1])') === 'manual nova');

  // ---- 2. transcrição -----------------------------------------------------------------------
  const vtt = 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\n<v Prof>Hoje falamos de GLP-1</v>\n\n2\n00:00:04.000 --> 00:00:06.000\nHoje falamos de GLP-1\n\n3\n00:00:06.000 --> 00:00:09.000\nno diabetes tipo 1.\nNOTE comentário';
  ok('VTT → texto corrido sem tempo, número, tag nem repetição', run('vttParaTexto(' + JSON.stringify(vtt) + ')') === 'Hoje falamos de GLP-1 no diabetes tipo 1.');
  const longo = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n' + 'fala da aula '.repeat(30);
  run(`rede={'https://vz-1.b-cdn.net/abc/playlist.m3u8':'#EXTM3U\\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="s",LANGUAGE="en",URI="captions/en.m3u8"\\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="s",LANGUAGE="pt",URI="captions/pt.m3u8"\\n#EXT-X-STREAM-INF:BANDWIDTH=1\\n720p/video.m3u8',
    'https://vz-1.b-cdn.net/abc/captions/pt.m3u8':'#EXTM3U\\n#EXTINF:600,\\npt-0.vtt\\n#EXTINF:600,\\npt-1.vtt',
    'https://vz-1.b-cdn.net/abc/captions/pt-0.vtt':${JSON.stringify(longo)},'https://vz-1.b-cdn.net/abc/captions/pt-1.vtt':'WEBVTT\\n\\n00:10:00.000 --> 00:10:02.000\\nparte final'};`);
  const t1 = await run(`emcTranscricaoBunny('https://vz-1.b-cdn.net/abc/playlist.m3u8')`);
  ok('legenda do HLS (pt antes de en), em segmentos', /^fala da aula/.test(t1) && /parte final$/.test(t1), t1.slice(0, 80));
  run(`rede={'https://vz-1.b-cdn.net/abc/playlist.m3u8':'#EXTM3U\\n#EXT-X-STREAM-INF:BANDWIDTH=1\\n720p/video.m3u8','https://vz-1.b-cdn.net/abc/captions/pt.vtt':null,'https://vz-1.b-cdn.net/abc/captions/pt-BR.vtt':${JSON.stringify(longo)}};`);
  ok('sem trilha no HLS: tenta captions/<idioma>.vtt', /^fala da aula/.test(await run(`emcTranscricaoBunny('https://vz-1.b-cdn.net/abc/playlist.m3u8')`)));
  run(`rede={};`);
  ok('CORS/rede falhou: string vazia, sem erro', (await run(`emcTranscricaoBunny('https://vz-1.b-cdn.net/abc/playlist.m3u8')`)) === '');
  ok('YouTube/Vimeo: sem transcrição', (await run(`emcTranscricaoBunny('https://youtu.be/abcdEFGH123')`)) === '');

  // ---- 3. o pedido ----------------------------------------------------------------------------
  const p1 = run(`emcResumoPrompt(admCursos[4],${JSON.stringify(MODELO)},'')`);
  ok('pedido: diretrizes de referência + regras de autoria', p1.sys.indexOf('[DIRETRIZES]__SPLIT__[REGRAS DE AUTORIA]') === 0);
  ok('pedido: o modelo vai como exemplo, com o aviso de não reaproveitar o conteúdo', p1.sys.indexOf('<<<\n' + MODELO + '\n>>>') > 0 && /o CONTEÚDO é de outra aula e não deve ser reaproveitado/.test(p1.sys));
  ok('pedido: seções na ordem do modelo', p1.sys.indexOf('FUNDAMENTAÇÃO, DEFINIÇÕES, EVIDÊNCIA CLÍNICA, ESTRATIFICAÇÃO DE RISCO, CONDUTA, PERSPECTIVAS') > 0);
  ok('pedido: registro técnico, sem "você", sem jargão nem caixa alta', /terceira pessoa impessoal/.test(p1.sys) && /Sem "você"/.test(p1.sys) && /crucial, fundamental/.test(p1.sys) && /caixa alta/.test(p1.sys));
  ok('pedido: número só com fonte; nunca inventar estudo', /número .* só quando constar/.test(p1.sys) && /Nunca invente estudo/.test(p1.sys));
  ok('pedido sem transcrição: escopo pelo título, descrição e capítulos', /não há transcrição/.test(p1.sys) && !/TRANSCRIÇÃO DA AULA/.test(p1.usr));
  ok('pedido: título, subespecialidade, descrição e capítulos em m:ss', /AULA: Nova/.test(p1.usr) && /SUBESPECIALIDADE: Diabetes/.test(p1.usr) && /DESCRIÇÃO: Evidências e diretrizes\./.test(p1.usr) && /CAPÍTULOS: 2:45 Importância do tema/.test(p1.usr), p1.usr);
  const p2 = run(`emcResumoPrompt(admCursos[4],'M','o professor disse X')`);
  ok('pedido com transcrição: ela é a fonte principal', /TRANSCRIÇÃO da aula é a fonte principal/.test(p2.sys) && /TRANSCRIÇÃO DA AULA:\no professor disse X/.test(p2.usr));

  // ---- 4. limpeza e formato -------------------------------------------------------------------
  const sujo = 'Nova\n# FUNDAMENTAÇÃO\n- **Item** um 🚀\n* item dois\n\n\n\nCONDUTA\n•item três';
  const limpo = run('emcLimpaResumo(' + JSON.stringify(sujo) + ',"Nova")');
  ok('limpeza: tira título repetido, #, **, emoji; marcadores viram "• "', limpo === 'FUNDAMENTAÇÃO\n• Item um\n• item dois\n\nCONDUTA\n• item três', JSON.stringify(limpo));
  ok('formato: 3 seções, 1.500+ caracteres e itens', run('emcResumoValido(' + JSON.stringify(BOM) + ')') === true);
  ok('formato: texto solto não passa', run('emcResumoValido("Resumo sem seção nenhuma. ".repeat(100))') === false);

  // ---- 5. gerar e gravar ----------------------------------------------------------------------
  run(`rede={};chamadas=[];avisos=[];salvos=0;respostas=['GLP-1 receptor agonists type 1 diabetes',${JSON.stringify(BOM)}];`);
  const r1 = await run('gerarResumoAulaEmc(admCursos[4])');
  const ch = run('chamadas');
  ok('gera: 1ª chamada (Haiku) faz a busca em inglês; 2ª usa o grounding dela', ch.length === 2 && ch[0].model === 'claude-haiku-5-5' && ch[1].grounding === 'GLP-1 receptor agonists type 1 diabetes' && ch[1].model === 'claude-opus-5-5' && ch[1].max === 6000, JSON.stringify(ch.map((c) => [c.model, c.grounding, c.max])));
  ok('gera: grava o resumo, marca automático (base título) e salva', r1 === true && run('admCursos[4].resumo') === BOM && run('admCursos[4].resumoAuto.base') === 'titulo' && run('salvos') === 1);
  run(`chamadas=[];respostas=['busca','Texto sem formato nenhum.'];admCursos[4].resumo='';delete admCursos[4].resumoAuto;salvos=0;`);
  const r2 = await run('gerarResumoAulaEmc(admCursos[4])');
  ok('saída fora do formato: não grava e avisa', r2 === false && run('admCursos[4].resumo') === '' && run('salvos') === 0 && run('avisos[avisos.length-1][0]') === 'err');
  run(`respostas=['busca',${JSON.stringify(BOM)}];admCursos[4].resumo='Resumo que o professor escreveu';`);
  const r3 = await run('gerarResumoAulaEmc(admCursos[4])');
  ok('não sobrescreve resumo existente', r3 === false && run('admCursos[4].resumo') === 'Resumo que o professor escreveu');
  run(`respostas=['busca',${JSON.stringify(BOM)}];admCursos[4].resumo='Automático antigo';admCursos[4].resumoAuto={at:1};`);
  const r4 = await run('gerarResumoAulaEmc(admCursos[4],null,true)');
  ok('refazer: substitui quando o novo chega', r4 === true && run('admCursos[4].resumo') === BOM);
  run(`respostas=[new Error('rede'),new Error('rede')];admCursos[4].resumo='Automático antigo';`);
  await run('gerarResumoAulaEmc(admCursos[4],null,true)');
  ok('refazer que falha: o antigo fica', run('admCursos[4].resumo') === 'Automático antigo');
  run(`chamadas=[];respostas=['busca',${JSON.stringify(BOM)}];admCursos[4].resumo='';`);
  const a = run('gerarResumoAulaEmc(admCursos[4])'), b = run('gerarResumoAulaEmc(admCursos[4])');
  await a; await b;
  ok('uma geração por aula de cada vez', a === b && run('chamadas.length') === 2);
  run(`admCursos=[{curso:'emc',title:'Só ela',at:3}];avisos=[];`);
  ok('sem modelo: não gera e avisa', (await run('gerarResumoAulaEmc(admCursos[0])')) === false && /resumo-modelo/.test(run('avisos[0][1]')));

  // ---- 6. o gancho -----------------------------------------------------------------------------
  const add = SRC.slice(SRC.indexOf("var bAddCurso=document.getElementById('btn-adm-addcurso');"), SRC.indexOf("var cCancelCurso=document.getElementById('btn-adm-cancelcurso');"));
  ok('adicionar: aula NOVA da EMC, caixa marcada e campo Resumo vazio', /if\(nova\.curso===EMC_SLUG&&resEl&&resEl\.checked&&!String\(nova\.resumo\|\|''\)\.trim\(\)\)gerarResumoAulaEmc\(nova\);/.test(add));
  ok('editar aula não gera resumo', add.indexOf('gerarResumoAulaEmc') > add.indexOf("notify('Aula atualizada!','ok')"));
  const form = extrai('admCursosHTML');
  ok('formulário: caixa 📝 marcada, na linha da EMC', form.indexOf('<input type="checkbox" id="adm-curso-autoresumo" checked> 📝 Gerar o resumo da aula no modelo da 1ª aula') > 0);
  ok('card: "📝 Gerar resumo" sem resumo; "refazer" só no automático', /'<button class="btn btn-outline btn-sm" data-adm-resumocurso="'\+i\+'"[^']*>📝 Gerar resumo<\/button>'/.test(form) && form.indexOf('📝 Resumo automático · refazer') > 0);
  ok('card: refazer pede confirmação e não apaga antes', SRC.indexOf("gerarResumoAulaEmc(c,b,refazer);") > 0 && SRC.indexOf("será substituído quando o novo ficar pronto") > 0);

  if (bad) { console.log('\n' + bad + ' falha(s) no resumo automático da EMC'); process.exit(1); }
  console.log('resumo automático da EMC: ok');
})().catch((e) => { console.log('  ✗ erro: ' + (e && e.stack || e)); process.exit(1); });
