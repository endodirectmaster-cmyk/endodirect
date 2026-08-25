// Regressão do IMPORTADOR DE PDF das Diretrizes.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (25/08/2026). O professor gravou a tela tentando
// importar a diretriz SBD 2026 de DM2 e recebendo:
//
//   "Erro ao ler o PDF: PDF muito grande para leitura por imagem. Use um PDF com
//    texto selecionável, ou um arquivo menor (até ~3 MB), ou cole o conteúdo nos
//    campos."
//
// Duas coisas estavam erradas ali. A primeira é que a mensagem culpava o TAMANHO,
// e tamanho era consequência: para chegar naquela linha, a extração de texto já
// tinha falhado — e o `catch` que a precedia era `function(){return null;}`, que
// apaga a causa. O professor lia um diagnóstico que não era o do seu arquivo.
//
// A segunda é que PDF DIGITALIZADO é grande JUSTAMENTE POR SER IMAGEM. Sem texto
// selecionável, o único caminho restante exigia mandar o arquivo inteiro em
// base64 — e esse caminho tem teto de ~3 MB. Os dois sintomas tinham a mesma
// causa e chegavam sempre juntos: o único caso que precisava do fallback era
// exatamente o caso que o fallback recusava. A saída é RENDERIZAR as páginas.
//
// Por isso a decisão saiu de dentro do callback e virou `pdfRotaDeLeitura`:
// regra escondida em cadeia de promessa não se testa, e esta é a regra que
// separa "importou a diretriz" de "perdeu o trabalho e não sabe por quê".
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function linhaVar(nome, fonte) {
  const src = fonte || html;
  const i = src.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return src.slice(i + 1, src.indexOf('\n', i + 1));
}
function corpo(nome, fonte) {
  const src = fonte || html;
  const marca = '\nfunction ' + nome + '(';
  const i = src.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = src.indexOf('\nfunction ', i + marca.length);
  return src.slice(i + 1, f < 0 ? src.length : f);
}

// Mundo mínimo: só a decisão e o que ela consulta.
function rotas(fonte) {
  const ctx = vm.createContext({});
  vm.runInContext(corpo('pdfMB', fonte) + '\n' + corpo('pdfRotaDeLeitura', fonte), ctx);
  return ctx;
}
const R = rotas();
const MB3 = 4000000;          // teto do base64 (~3 MB de arquivo)
const GRANDE = 5000000;       // ~3,6 MB — o tamanho do PDF do professor
const texto = 'x'.repeat(200);

// ── O caminho normal: PDF com texto selecionável ─────────────────────────────
ok(R.pdfRotaDeLeitura({ texto, base64Len: 1000 }).via === 'texto',
  'PDF com texto selecionável deixou de ir pelo texto — é o caminho barato e o de maior fidelidade');
ok(R.pdfRotaDeLeitura({ texto: 'y'.repeat(199), base64Len: 1000 }).via !== 'texto',
  '199 caracteres passaram como texto: uma capa OCRada mal lida viraria a diretriz inteira');
ok(R.pdfRotaDeLeitura({ texto: ' \n\t'.repeat(5000), base64Len: 1000 }).via !== 'texto',
  'texto só de espaço em branco passou como conteúdo — o corte tem de contar caractere, não tamanho');

// ── O caso do professor: digitalizado E grande ───────────────────────────────
// Este é o teste que a versão antiga reprovava.
const digitalizadoGrande = R.pdfRotaDeLeitura({
  texto: '', paginas: 8, base64Len: GRANDE, motivo: 'PDF sem texto selecionável (digitalizado)'
});
ok(digitalizadoGrande.via === 'imagens',
  '⚠️ PDF digitalizado de 3,6 MB não foi pelas páginas renderizadas — é EXATAMENTE o caso que o professor reportou em 25/08/2026, e o outro caminho o recusa por tamanho');
ok(R.pdfRotaDeLeitura({ texto: '', paginas: 1, base64Len: GRANDE }).via === 'imagens',
  'uma página renderizada já basta para seguir por imagem: ler uma página é melhor que recusar o arquivo');

// ── Quando nem renderizar deu certo ──────────────────────────────────────────
ok(R.pdfRotaDeLeitura({ texto: '', paginas: 0, base64Len: 1000 }).via === 'documento',
  'sem páginas e com arquivo pequeno, o PDF inteiro ainda cabe no pedido — recusar aqui seria perder um caminho que funciona');

const semSaida = R.pdfRotaDeLeitura({
  texto: '', paginas: 0, base64Len: GRANDE, motivo: 'PDF sem texto selecionável (digitalizado)'
});
ok(semSaida.via === 'erro', 'arquivo grande sem texto e sem páginas tinha de virar erro, não pedido quebrado no servidor');
ok(/digitalizado/.test(semSaida.erro),
  '⚠️ a mensagem não diz a CAUSA REAL (o PDF não tem texto) — foi assim que o professor recebeu "muito grande" para um problema que não era de tamanho');
ok(/3\.6 MB|3,6 MB/.test(semSaida.erro),
  'a mensagem tem de dizer o tamanho MEDIDO do arquivo; "até ~3 MB" sem o número não deixa o professor decidir nada');
ok(/selecionável|menor|cole/.test(semSaida.erro),
  'a mensagem tem de terminar com o que fazer — erro sem saída manda o professor adivinhar');

const semB64 = R.pdfRotaDeLeitura({ texto: '', paginas: 0, base64Len: 0, motivo: 'não consegui abrir o PDF (Falha ao carregar o leitor de PDF.)' });
ok(semB64.via === 'erro' && /leitor de PDF/.test(semB64.erro),
  'quando o pdf.js não carrega, a mensagem tem de dizer isso — culpar o arquivo manda o professor trocar de PDF sem motivo');

// ── O limite de tamanho continua existindo, e no lugar certo ─────────────────
ok(R.pdfRotaDeLeitura({ texto: '', paginas: 0, base64Len: MB3 }).via === 'documento',
  'exatamente no teto ainda cabe');
ok(R.pdfRotaDeLeitura({ texto: '', paginas: 0, base64Len: MB3 + 1 }).via === 'erro',
  'um byte acima do teto tem de parar aqui: mandar assim volta como 413 e o professor perde o trabalho');
ok(R.pdfMB(4000000) === '2.9', 'pdfMB errou a conta do base64 → MB (base64 infla 4/3)');

// ── Mutação: cada uma destas devolve o defeito de 25/08 ──────────────────────
function mutante(de, para) {
  const alvo = corpo('pdfRotaDeLeitura');
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica (o código mudou): ' + de);
  return rotas(html.replace(alvo, alvo.replace(de, para)));
}
ok(mutante("if((r.paginas||0)>0)return {via:'imagens'};", '').pdfRotaDeLeitura({
  texto: '', paginas: 8, base64Len: GRANDE
}).via === 'erro',
  'MUTAÇÃO: tirar o caminho das páginas devia reproduzir o defeito do professor — o teste não vigia o que deveria');
ok(mutante(">=200)return {via:'texto'}", ">=0)return {via:'texto'}").pdfRotaDeLeitura({
  texto: '', paginas: 8, base64Len: 10
}).via === 'texto',
  'MUTAÇÃO: sem o piso de 200 caracteres, PDF vazio passaria como texto e o teste não veria');
ok(mutante('if(r.base64Len>PDF_B64_MAX)', 'if(false)').pdfRotaDeLeitura({
  texto: '', paginas: 0, base64Len: GRANDE
}).via === 'documento',
  'MUTAÇÃO: sem a guarda de tamanho o pedido sairia e voltaria 413 — o teste não veria');
ok(!/digitalizado/.test(mutante("var pre=r.motivo?(r.motivo+'. '):'';", "var pre='';").pdfRotaDeLeitura({
  texto: '', paginas: 0, base64Len: GRANDE, motivo: 'PDF sem texto selecionável (digitalizado)'
}).erro || ''),
  'MUTAÇÃO: engolir o motivo devia apagar a causa da mensagem — é o defeito original e o teste não o pega');

// ── O renderizador de páginas ────────────────────────────────────────────────
// Fábrica de um PDF e de um canvas de mentira: interessa a ORDEM das operações e
// o orçamento, não o bitmap.
function renderiza({ paginas, bytesPorPagina, larguraPagina }) {
  const ctx = vm.createContext({});
  const eventos = [];
  const fakeCanvas = () => {
    const cv = {
      width: 0, height: 0,
      getContext() { return { fillStyle: '', fillRect() { eventos.push('fundo'); } }; },
      toDataURL(tipo, q) {
        eventos.push('toDataURL:' + tipo + ':' + q);
        return 'data:image/jpeg;base64,' + 'A'.repeat(bytesPorPagina);
      }
    };
    return cv;
  };
  const canvases = [];
  ctx.document = { createElement() { const c = fakeCanvas(); canvases.push(c); return c; } };
  ctx.pdf = {
    numPages: paginas,
    getPage(p) {
      return Promise.resolve({
        getViewport({ scale }) { return { width: (larguraPagina || 700) * scale, height: 990 * scale }; },
        render() { eventos.push('render:' + p); return { promise: Promise.resolve() }; }
      });
    }
  };
  vm.runInContext(linhaVar('PDF_IMG_LARGURA') + '\n' + linhaVar('PDF_IMG_ORCAMENTO') + '\n'
    + linhaVar('PDF_IMG_MAX_PAG') + '\n' + corpo('pdfPaginasJpeg'), ctx);
  vm.runInContext('var _lidas=[];var _esc=null;'
    + 'var _p=pdfPaginasJpeg(pdf,function(n,t){_lidas.push(n+"/"+t);});', ctx);
  return ctx._p.then((imgs) => ({ imgs, eventos, canvases, lidas: ctx._lidas, ctx }));
}

const provas = [];

provas.push(renderiza({ paginas: 3, bytesPorPagina: 1000 }).then(({ imgs, eventos, canvases }) => {
  ok(imgs.length === 3, 'renderizador não devolveu uma imagem por página');
  // ⚠️ `indexOf` de algo AUSENTE é -1, e -1 < 0 é verdadeiro: sem exigir a
  // presença, apagar o fundo passava no teste. (Furo achado por mutação em 25/08.)
  ok(eventos.indexOf('fundo') >= 0 && eventos.indexOf('fundo') < eventos.indexOf('render:1'),
    '⚠️ o fundo branco tem de ser pintado ANTES de desenhar a página: JPEG não tem alfa e o transparente do PDF sai PRETO');
  ok(/toDataURL:image\/jpeg:/.test(eventos.join('|')), 'as páginas têm de sair em JPEG (PNG de página inteira não cabe no orçamento)');
  ok(canvases.every((c) => c.width === 1 && c.height === 1),
    '⚠️ os canvases não foram liberados: 12 bitmaps de página vivos ao mesmo tempo estouram a memória do navegador do professor');
}));

// Teto de páginas: um capítulo de diretriz tem dezenas; o pedido tem de parar.
provas.push(renderiza({ paginas: 60, bytesPorPagina: 1000 }).then(({ imgs }) => {
  ok(imgs.length === 12, 'o teto de 12 páginas sumiu — 60 páginas em imagem não cabem em pedido nenhum');
}));

// Orçamento em BYTES: página densa pesa mais, e o corpo da função é que não pode estourar.
provas.push(renderiza({ paginas: 12, bytesPorPagina: 1200000 }).then(({ imgs }) => {
  ok(imgs.length > 0 && imgs.length < 12,
    'o orçamento em bytes não mordeu: 12 páginas pesadas passariam do limite de corpo e o pedido voltaria 413');
  ok(imgs.join('').length <= 3400000 + 1200000,
    'o orçamento estourou mesmo contando a primeira página, que entra sempre');
}));

// Uma única página maior que o orçamento inteiro: entra assim mesmo. Recusar
// devolveria zero imagens e o professor cairia no erro por tamanho — de novo.
provas.push(renderiza({ paginas: 4, bytesPorPagina: 4000000 }).then(({ imgs, eventos }) => {
  ok(imgs.length === 1,
    '⚠️ página única acima do orçamento tem de entrar sozinha; devolver lista vazia joga o caso de volta no erro de tamanho');
  // E o que não vai ser mandado não deve nem ser desenhado: renderizar página de
  // diretriz é caro, e travar o navegador do professor para jogar fora o
  // resultado é o pior dos dois mundos.
  ok(eventos.filter((e) => /^render:/.test(e)).length === 1,
    'o laço continuou renderizando páginas depois de o orçamento acabar — trabalho pesado jogado fora no navegador');
}));

// Escala: mira 1400 px de largura e nunca amplia além de 2x (página pequena
// ampliada só engorda o upload — a API de visão reduz acima de ~1568 px).
provas.push(renderiza({ paginas: 1, bytesPorPagina: 100, larguraPagina: 200 }).then(({ canvases }) => {
  ok(canvases[0] && canvases[0].width <= 1, 'o canvas devia ter sido liberado no fim');
}));
{
  const fonte = corpo('pdfPaginasJpeg');
  ok(/Math\.min\(2,\s*PDF_IMG_LARGURA\/\(base\.width\|\|PDF_IMG_LARGURA\)\)/.test(fonte),
    'a escala deixou de mirar 1400 px com teto de 2x — acima disso é upload jogado fora');
}

// ── A fiação do importador ───────────────────────────────────────────────────
{
  const i = html.indexOf("var rPdfGen=document.getElementById('btn-adm-ref-pdfgen');");
  ok(i > 0, 'o botão de importar PDF sumiu do painel');
  const fluxo = html.slice(i, i + 6000);
  ok(/arrayBuffer\(\)\.then\(abrirPdf\)/.test(fluxo),
    '⚠️ o PDF tem de ser aberto UMA vez: o pdf.js transfere o ArrayBuffer que recebe e reabrir devolve um arquivo vazio');
  ok(/pdfPaginasJpeg\(pdf/.test(fluxo) && /imagesBase64:imgs/.test(fluxo),
    'o caminho das páginas renderizadas sumiu do importador');
  // ⚠️ Texto não prova fluxo: a chamada pode continuar escrita e nunca ser
  // alcançada. Estas duas amarram a decisão ao que ela manda fazer.
  ok(/return pdfPaginasJpeg\(pdf/.test(fluxo),
    '⚠️ a renderização das páginas deixou de ser o que o fluxo DEVOLVE — escrita mas não alcançada é o mesmo que ausente');
  ok(/r2\.via!=='imagens'\)return viaDocumento\(r2\)/.test(fluxo),
    'o resultado da decisão sobre as páginas deixou de comandar o caminho seguinte');
  ok(!/\.catch\(function\(\)\{return null;\}\)/.test(fluxo),
    '⚠️ voltou o `catch` que engole a causa da falha — foi ele que fez o professor ler "muito grande" para um PDF sem texto');
  // ⚠️ E não basta proibir a forma antiga: trocar o handler por um `function(){}`
  // mudo tem o mesmo efeito e outra escrita. Exigir o MECANISMO — o handler de
  // falha do texto GRAVANDO o motivo — é o que pega as duas. (Furo de mutação.)
  ok(/function\(e\)\{pdfMotivo=/.test(fluxo),
    '⚠️ a falha ao ler o texto voltou a ser engolida: sem gravar o motivo, a mensagem culpa o tamanho de novo');
  // ⚠️ TODA chamada à decisão carrega o motivo — contar "pelo menos N" deixava
  // apagar de uma delas sem o teste ver. Aqui a conta é exata e casada com o
  // número de chamadas: apagar de qualquer uma reprova. (Furo achado por mutação.)
  const chamadas = (fluxo.match(/pdfRotaDeLeitura\(\{/g) || []).length;
  const comMotivo = (fluxo.match(/motivo:pdfMotivo\}\)/g) || []).length;
  ok(chamadas > 0 && comMotivo === chamadas,
    'alguma decisão do importador ficou sem o motivo real (' + comMotivo + ' de ' + chamadas + ') — é por ali que a mensagem volta a culpar o tamanho');
  ok(/pdfPaginasLidas\+' primeiras de '\+pdfTotalPaginas/.test(html),
    '⚠️ sumiu o aviso de quantas páginas foram lidas — um resumo de 12 de 46 páginas parece completo e não é');
}

Promise.all(provas).then(() => {
  if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('✓ importar PDF: digitalizado grande vai pelas páginas renderizadas, o erro diz a causa real e o aviso conta quantas páginas foram lidas');
});
