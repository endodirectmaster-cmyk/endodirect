// A VIDEOAULA TOCA — E OS CAPÍTULOS FICAM EMBAIXO DELA.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (01/09/2026). O professor importou a primeira
// aula do Programa de Educação Médica Continuada e pediu o formato da foto: a
// aula em cima e os capítulos aparecendo embaixo. Ao ligar isso apareceu um
// defeito bem maior embaixo.
//
// 🧨 104 DAS 106 AULAS NÃO TOCAVAM FORA DO SAFARI. `playerEmbed` mandava o
// `.m3u8` do Bunny direto para o atributo `src` de um <video>. Medido em
// Chromium real: `canPlayType('application/vnd.apple.mpegurl')` devolve string
// VAZIA — não há suporte nativo a HLS em Chrome, Edge, Firefox nem no Android.
// O <video> ficava preto e MUDO sobre o erro. O hls.js já estava carregado no
// <head> (a landing e a aula ao vivo o usam há meses); só nunca tinha sido
// ligado no player da aula. Dois relatos do suporte em 07/08/2026 descrevem
// exatamente isto ("vídeo d aula de hipocalcemia não abre").
//
// A REGRA QUE FICA: `.m3u8` NUNCA vai para `src=` no HTML. Vai em `data-hls`, e
// quem monta é `montarAulaHls()` — que também precisa FALAR quando desiste,
// porque foi o silêncio que fez o defeito durar.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// Recorta uma função pelo nome, contando chaves — o index.html é um monólito e
// não dá para exigir (require) nada dele.
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

const caixa = { console };
vm.createContext(caixa);
vm.runInContext(
  ['esc', 'ytId', 'vimeoId', 'playerEmbed',
   'capSegundos', 'capsParse', 'capsNormaliza', 'capsFmt', 'capsTexto', 'aulaCaps', 'aulaCapsHTML']
    .map(corpo).join('\n'), caixa);
const { playerEmbed, capsParse, capsFmt, capsTexto, aulaCapsHTML } = caixa;

// ── 1. O .m3u8 nunca chega ao src ──────────────────────────────────────────
{
  const AULA = { title: 'Aula', tipo: 'link', src: 'https://vz-0161a494-b29.b-cdn.net/90f8b00c/playlist.m3u8' };
  const saida = playerEmbed(AULA);
  ok(!/src="[^"]*\.m3u8/.test(saida),
    '🧨 o `.m3u8` voltou para o `src=` do <video> — fora do Safari a aula fica preta, sem mensagem');
  ok(/data-hls="[^"]*\.m3u8/.test(saida),
    '🧨 o `.m3u8` não está em `data-hls` — `montarAulaHls()` procura por `video[data-hls]` e não acharia nada para montar');
  ok(/id="aula-video"/.test(saida),
    '⚠️ o <video> perdeu o id `aula-video` — os capítulos não teriam a quem mandar o salto');

  // As outras fontes continuam como estavam: quem toca é a própria origem.
  ok(/youtube\.com\/embed\//.test(playerEmbed({ src: 'https://youtu.be/abcdefghijk' })),
    '⚠️ o caminho do YouTube quebrou');
  ok(/player\.vimeo\.com\/video\//.test(playerEmbed({ src: 'https://vimeo.com/123456789' })),
    '⚠️ o caminho do Vimeo quebrou');
  ok(/src="data:video\/mp4;base64,AA"/.test(playerEmbed({ tipo: 'file', src: 'data:video/mp4;base64,AA' })),
    '⚠️ o caminho do arquivo enviado quebrou');
}

// ── 2. Montagem do HLS: existe, nos DOIS players, e desiste falando ────────
{
  // ⚠️ A CONSULTA TEM DE ESTAR DENTRO DE `montarAulaHls`. Medir isso no html
  // inteiro passava cego: o mesmo trecho existe nos players da landing e da
  // aula ao vivo, e a asserção continuaria verde com a aula sem hls nenhum.
  const mh = corpo('montarAulaHls');
  ok(/window\.Hls\s*&&\s*window\.Hls\.isSupported\(\)/.test(mh),
    '🧨 `montarAulaHls` não consulta mais o hls.js — o player volta a depender de suporte nativo que só o Safari tem');
  ok(/canPlayType\('application\/vnd\.apple\.mpegurl'\)/.test(mh),
    '⚠️ sumiu o atalho nativo do Safari/iOS: lá o hls.js é desnecessário e pior');

  ok(/Não consegui carregar o reprodutor/.test(mh),
    '🧨 `montarAulaHls` voltou a desistir EM SILÊNCIO — foi o silêncio que fez "a aula não abre" durar semanas');
  ok(/setTimeout\(function\(\)\{montarAulaHls\(raiz,\(tent\|\|0\)\+1\)/.test(mh),
    '⚠️ sumiu a espera pelo hls.js: ele entra por <script defer> de CDN e pode não ter chegado quando o aluno abre a aula');

  // Os dois players (aluno e admin) usam o MESMO playerEmbed; os dois precisam montar.
  ok((html.match(/montarAulaHls\(box\)/g) || []).length === 2,
    '🧨 só um dos dois players monta o HLS — o outro mostra tela preta (o do admin é onde o professor confere antes de publicar)');
  ok((html.match(/ligarAulaCaps\(box\)/g) || []).length === 2,
    '⚠️ um dos players não liga os capítulos — a lista aparece e não faz nada ao clicar');
}

// ── 3. Fechar o player PARA o vídeo ───────────────────────────────────────
// Antes, fechar só escondia a caixa: o áudio continuava tocando invisível.
{
  const fechar = html.match(/getElementById\('curso-player-close'\)[^\n]*/);
  ok(fechar && /box\.innerHTML=''/.test(fechar[0]) && /aulaSoltarHls\(\)/.test(fechar[0]),
    '🧨 fechar a aula voltou a apenas esconder a caixa — o vídeo segue tocando e o áudio fica órfão na página');
}

// ── 4. O formato que o professor cola vem do painel do Bunny ──────────────
{
  // Exatamente como a aba Chapters mostra: índice, início, "to", fim, título.
  const doBunny = [
    '1 00:02:45 to 00:12:59 Importância do tema',
    '2 00:13:00 to 00:17:39 Conceitos Fundamentais',
    '3 00:17:40 to 00:24:00 Evidências Clínicas',
  ].join('\n');
  const c = capsParse(doBunny);
  ok(c.length === 3, '🧨 o formato do Bunny não foi lido: vieram ' + c.length + ' capítulos de 3');
  ok(c[0] && c[0].t === 165 && c[0].titulo === 'Importância do tema',
    '🧨 o primeiro capítulo saiu errado: ' + JSON.stringify(c[0]) + ' (esperado 165s / "Importância do tema")');
  ok(c[2] && c[2].t === 1060,
    '⚠️ 00:17:40 não virou 1060s — o horário de FIM foi confundido com o de início');

  // As outras formas que uma pessoa digita à mão.
  ok(capsParse('02:45 Importância do tema')[0].t === 165, '⚠️ "MM:SS Título" não foi aceito');
  ok(capsParse('00:13:00 - Conceitos')[0].titulo === 'Conceitos', '⚠️ o traço separador ficou colado no título');
  ok(capsParse('00:13:00 00:17:39 Conceitos')[0].titulo === 'Conceitos', '⚠️ sem "to" o fim vazou para o título');
  ok(capsParse('1) 1:01:14 Estratégias Futuras')[0].t === 3674, '⚠️ hora + índice com parêntese não foi lido');

  // Lixo não vira capítulo, e a ordem/duplicata são resolvidas na entrada.
  ok(capsParse('\n\nsem horário nenhum\n').length === 0, '⚠️ linha sem horário virou capítulo');
  ok(capsParse('00:10:00 Só o horário sem nada depois de b\n05:00 Antes').map(x => x.t).join() === '300,600',
    '🧨 os capítulos não saíram em ordem de tempo — a numeração 01/02/03 mentiria');
  ok(capsParse('02:45 Um\n02:45 Outro').length === 1, '⚠️ dois capítulos no mesmo segundo passaram');
}

// ── 5. Ida e volta pelo campo do admin ────────────────────────────────────
{
  const texto = '1 00:02:45 to 00:12:59 Importância do tema\n6 01:01:14 to 01:12:14 Estratégias Futuras';
  const ida = capsParse(texto);
  const volta = capsParse(capsTexto(ida));
  ok(JSON.stringify(ida) === JSON.stringify(volta),
    '🧨 os capítulos mudam ao reabrir a aula para editar: ' + capsTexto(ida) + ' → ' + JSON.stringify(volta));
  ok(capsFmt(165) === '02:45' && capsFmt(3674) === '1:01:14' && capsFmt(0) === '00:00',
    '⚠️ o horário exibido saiu errado: ' + [capsFmt(165), capsFmt(3674), capsFmt(0)].join(' / '));
}

// ── 6. A lista sai como o professor pediu: embaixo do vídeo ───────────────
{
  const marcado = aulaCapsHTML({ caps: [{ t: 3674, titulo: 'Estratégias <b>Futuras</b>' }, { t: 165, titulo: 'Importância' }] });
  ok(/>01<[\s\S]*Importância[\s\S]*>02<[\s\S]*Estratégias/.test(marcado),
    '🧨 a numeração não acompanha a ordem do vídeo');
  ok(/&lt;b&gt;/.test(marcado), '🧨 o título do capítulo entra sem escapar — HTML colado do Bunny viraria marcação');
  ok(/data-cap="165"/.test(marcado), '⚠️ o segundo de destino sumiu do botão — clicar não saltaria nada');
  ok(aulaCapsHTML({}) === '' && aulaCapsHTML({ caps: [] }) === '',
    '⚠️ aula sem capítulos passou a desenhar um bloco "Nesta aula" vazio');

  // A ORDEM NA TELA é o pedido: vídeo em cima, capítulos embaixo.
  ['aula-tab-body', 'adm-aula-tab-body'].forEach(function (id) {
    const corpoTab = html.slice(0, html.indexOf("'<div id=\"" + id + "\">'"));
    const ultimo = corpoTab.lastIndexOf('playerEmbed(c)');
    ok(ultimo > 0 && corpoTab.indexOf('aulaCapsHTML(c)', ultimo) === ultimo + 'playerEmbed(c)'.length + "+'</div>'+".length,
      '🧨 em `' + id + '` os capítulos não vêm logo depois do vídeo — o professor pediu a aula em cima e os capítulos embaixo');
  });
}

// ── 7. O campo do admin existe E é lido ao salvar ─────────────────────────
// Um campo que aparece e não é gravado é pior do que campo nenhum: o professor
// digita os capítulos, salva, e eles somem sem aviso.
{
  ok(html.indexOf('id="adm-curso-caps"') > 0, '🧨 sumiu o campo de capítulos do formulário de aula');
  ok(/caps:capsParse\(\(\(document\.getElementById\('adm-curso-caps'\)/.test(html),
    '🧨 o campo de capítulos existe mas NÃO é lido ao salvar — o professor digitaria e perderia');
  ok(/capsTexto\(ed\.caps\)/.test(html),
    '🧨 ao reabrir a aula para editar o campo volta vazio — salvar de novo apagaria os capítulos');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ videoaula: HLS montado nos dois players (o .m3u8 nunca no src), capítulos do Bunny lidos, ordenados e clicáveis embaixo do vídeo');
