// OS CAPÍTULOS MOVEM O VÍDEO DE VERDADE — em Chromium, com DOM e eventos reais.
//
// POR QUE ESTE CHECK EXISTE (01/09/2026): `scripts/test-aula-capitulos.js` roda
// as funções num `vm`, sem DOM. Ele prova que a MARCAÇÃO sai certa, não que o
// clique chega ao <video>. A ligação (addEventListener dentro de
// `ligarAulaCaps`, o `querySelector` com raiz, o `currentTime` enfileirado até
// os metadados chegarem) só existe em navegador — e é exatamente o tipo de
// coisa que o cofre registra como "passou no vm e não funcionou na tela".
//
// Como rodar:
//   PLAYWRIGHT_CORE=/tmp/pw/node_modules/playwright-core node scratchpad/capitulos-navegador/check.js
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham: ' + nome);
}
const FONTE = ['esc', 'ytId', 'vimeoId', 'playerEmbed', 'capSegundos', 'capsParse',
  'capsNormaliza', 'capsFmt', 'capsTexto', 'aulaCaps', 'aulaCapsHTML',
  'aulaSeek', 'aulaCapAtivo', 'ligarAulaCaps'].map(corpo).join('\n');

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  // Um MP4 minúsculo de verdade seria melhor, mas offline não há um; o que
  // importa aqui é o caminho do clique até o <video>, e para isso basta um
  // elemento com metadados prontos (readyState forjado) e um currentTime real.
  await p.setContent('<div id="raiz"></div>');
  // evaluate recebe uma EXPRESSÃO: as declarações vão dentro de uma arrow.
  const r = await p.evaluate('(() => {' + FONTE + `;return (function(){
    var raiz=document.getElementById('raiz');
    var caps=capsParse('1 00:02:45 to 00:12:59 Importância do tema\\n2 00:13:00 to 00:17:39 Conceitos\\n6 01:01:14 to 01:12:14 Estratégias Futuras');
    raiz.innerHTML=playerEmbed({title:'Aula',tipo:'link',src:'https://vz.b-cdn.net/x/playlist.m3u8'})+aulaCapsHTML({caps:caps});
    var v=raiz.querySelector('#aula-video');
    // Sem fonte tocável offline: finge metadados prontos para o seek valer.
    Object.defineProperty(v,'readyState',{get:function(){return 1;}});
    var t=0;Object.defineProperty(v,'currentTime',{get:function(){return t;},set:function(x){t=x;}});
    v.play=function(){return Promise.resolve();};
    ligarAulaCaps(raiz);
    var botoes=raiz.querySelectorAll('.aula-cap');
    botoes[2].click();
    var depoisDoTerceiro=v.currentTime;
    var marcadoDepois=raiz.querySelector('.aula-cap.on');
    botoes[0].click();
    var depoisDoPrimeiro=v.currentTime;
    // O destaque tem de ANDAR com o vídeo, não só com o clique.
    v.currentTime=800;v.dispatchEvent(new Event('timeupdate'));
    var marcadoAndando=raiz.querySelector('.aula-cap.on');
    return {
      capitulos:botoes.length,
      srcTemM3u8:/\\.m3u8/.test(v.getAttribute('src')||''),
      temDataHls:!!v.getAttribute('data-hls'),
      depoisDoTerceiro:depoisDoTerceiro,
      depoisDoPrimeiro:depoisDoPrimeiro,
      marcadoDepois:marcadoDepois?marcadoDepois.textContent:'',
      marcadoAndando:marcadoAndando?marcadoAndando.textContent:'',
      nativoHls:v.canPlayType('application/vnd.apple.mpegurl')
    };
  })();})()`);
  await b.close();

  const falhas = [];
  const ok = (c, m) => { if (!c) falhas.push(m); };
  ok(r.capitulos === 3, 'saíram ' + r.capitulos + ' capítulos de 3');
  ok(!r.srcTemM3u8, '🧨 o .m3u8 foi para o src do <video> — tela preta fora do Safari');
  ok(r.temDataHls, '🧨 o .m3u8 não ficou em data-hls: montarAulaHls não teria o que montar');
  ok(r.nativoHls === '', '⚠️ este Chromium diz tocar HLS nativamente (' + r.nativoHls + '): a premissa do teste mudou');
  ok(r.depoisDoTerceiro === 3674, '🧨 clicar no 3º capítulo levou o vídeo a ' + r.depoisDoTerceiro + 's, não a 3674s');
  ok(r.depoisDoPrimeiro === 165, '🧨 clicar no 1º capítulo levou o vídeo a ' + r.depoisDoPrimeiro + 's, não a 165s');
  ok(/Estratégias Futuras/.test(r.marcadoDepois), '⚠️ o capítulo clicado não ficou marcado (marcado: "' + r.marcadoDepois + '")');
  ok(/Conceitos/.test(r.marcadoAndando), '🧨 o destaque não acompanha o vídeo andando (aos 800s marcava "' + r.marcadoAndando + '", devia ser Conceitos)');
  ok(!erros.length, 'erro de página: ' + erros.join(' | '));

  console.log(JSON.stringify(r));
  if (falhas.length) { console.error('\n✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('\nOK — em Chromium real o clique no capítulo move o <video>, o destaque segue o tempo e o .m3u8 fica fora do src.');
})();
