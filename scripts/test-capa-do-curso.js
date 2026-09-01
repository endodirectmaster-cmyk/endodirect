// A CAPA ENVIADA CHEGA AO CAMPO QUE O SALVAMENTO LÊ.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (01/09/2026). O professor mandou a arte da capa
// do Programa de EMC e pediu para colocá-la no curso. O campo `capa` do
// catálogo só aceitava um LINK digitado — e a arte estava no computador dele.
// O envio pelo próprio painel fechou isso.
//
// 🧨 O MODO DE FALHAR AQUI É MUDO. O upload NÃO grava o catálogo: ele preenche
// o campo de link, e quem grava é o "Salvar catálogo". Se o link não cair no
// input certo, ou se o professor sair sem salvar, a capa some sem erro nenhum —
// ele viu "Enviada ✓" e o curso continua com o desenho gerado.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

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
vm.runInContext(corpo('capaUrlOk'), caixa);

// ── 1. A ponta a ponta: o endereço que o upload devolve PASSA no validador ──
// `uploadAdminAsset` devolve a URL pública do Storage. Se `capaUrlOk` a
// recusasse, o salvamento a descartaria com "ignorada" — depois de o professor
// ter visto "Enviada ✓". As duas metades precisam concordar.
{
  const doStorage = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/capas/2026-09-01/1756738000-capa.jpg';
  ok(caixa.capaUrlOk(doStorage),
    '🧨 a URL que o próprio upload devolve é RECUSADA por capaUrlOk — a capa seria descartada ao salvar, depois de dizer "Enviada ✓"');
  ok(caixa.capaUrlOk('/img/cursos/emc.jpg'), '⚠️ caminho do próprio site deixou de valer como capa');
  ok(!caixa.capaUrlOk('javascript:alert(1)') && !caixa.capaUrlOk('data:image/png;base64,AA'),
    '🧨 capaUrlOk aceitou um esquema que não é http nem caminho do site');
}

// ── 2. O botão só existe onde o campo existe ───────────────────────────────
// `catalogoTemCapa()` decide se a coluna `capa` existe no banco desta
// instalação. Oferecer envio sem o campo seria mandar o professor preencher
// algo que não viaja no upsert.
{
  const i = html.indexOf('var podeCapa=catalogoTemCapa();');
  const j = html.indexOf('<div class="g2" style="margin-bottom:.6rem"><div class="fld2" style="margin:0"><label>Nome</label>', i);
  const regiao = html.slice(i, j);
  const semCapa = regiao.indexOf('A capa é desenhada a partir do nome do curso');
  const campo = regiao.indexOf('class="cat-capa"');
  const botao = regiao.indexOf('cat-capa-btn');
  ok(botao > 0, '🧨 sumiu o botão de enviar a capa');
  // ⚠️ "vem antes do texto de fallback" NÃO prova estar no ramo certo: o ramo
  // `?` inteiro vem antes. O que prova é estar DEPOIS do próprio campo de link
  // e existir uma vez só na região.
  ok(campo > 0 && botao > campo && botao < semCapa,
    '🧨 o botão de enviar a capa saiu do ramo `podeCapa` — ofereceria envio para um campo que o banco não tem');
  ok((regiao.match(/cat-capa-btn/g) || []).length === 1,
    '⚠️ o botão de enviar a capa aparece ' + (regiao.match(/cat-capa-btn/g) || []).length + ' vezes no cartão do catálogo — era uma');
}

// A LIGAÇÃO do envio: tudo daqui para baixo é medido DENTRO do bloco do envio,
// nunca no html inteiro. 🧨 O teto de 8 MB existe em outros quatro lugares do
// arquivo (upload de imagem de resumo, de mural…): medir no html todo deixava
// a mutação passar cega — exatamente o erro que o cofre registra.
const envio = html.slice(
  html.indexOf("var bt=card.querySelector('.cat-capa-btn')"),
  html.indexOf("var bCatSave=document.getElementById('btn-cat-save')"));
ok(envio.length > 200 && envio.length < 3000,
  '⚠️ não consegui recortar o bloco do envio da capa (' + envio.length + ' caracteres) — as medidas abaixo mediriam o arquivo inteiro');

// ── 3. O que foi enviado cai no input que o salvamento lê ─────────────────
{
  ok(/if\(inp\)inp\.value=a\.url;/.test(envio),
    '🧨 o endereço da imagem enviada não é escrito em nada — o "Enviada ✓" seria mentira');
  ok(/var inp=card\.querySelector\('\.cat-capa'\)/.test(envio),
    '🧨 o upload escreve em outro campo que não `.cat-capa` — é `.cat-capa` que o "Salvar catálogo" lê');
  // A prévia é um <img class="cc-img"> POR CIMA do desenho (cursoCapaHTML).
  ok(/prev\.querySelector\('img\.cc-img'\)/.test(envio),
    '⚠️ a prévia deixou de trocar o `img.cc-img` — mexer no fundo não aparece, o desenho gerado continua por cima');
}

// ── 4. Enviar não é salvar, e a tela precisa dizer isso ──────────────────
// Este é o passo que se perde: enviar, ver o ✓ e sair sem clicar em Salvar.
{
  ok(/Enviada ✓ — clique em “Salvar catálogo” para valer\./.test(envio),
    '🧨 sumiu o aviso de que ainda falta salvar — o professor sairia da tela achando que a capa está no ar');
  ok(/diz\('Enviada ✓[^']*','var\(--gold\)'\)/.test(envio),
    '⚠️ o aviso de "falta salvar" ficou em cor de sucesso: lido como pronto, que é justamente o engano');
  ok(!/saveCursoCatalogo|queueRemoteStateSave/.test(envio),
    '⚠️ o envio passou a gravar o catálogo sozinho — levaria junto tudo o que estivesse meio digitado nos outros cursos');
}

// ── 5. Recusa antes de subir ─────────────────────────────────────────────
{
  ok(/if\(!\/\^image\\\/\/\.test\(f\.type\|\|''\)\)/.test(envio),
    '⚠️ sumiu a recusa de arquivo que não é imagem — um PDF viraria "capa" quebrada');
  ok(/f\.size>8\*1024\*1024/.test(envio),
    '⚠️ sumiu o teto de tamanho da capa: uma foto de 40 MB entraria e travaria o carregamento do card');
  ok(/\.catch\(function\(e\)\{\s*diz\(uploadErrorMessage\(e\)/.test(envio),
    '🧨 a falha do upload voltou a ser silenciosa — `uploadErrorMessage` é quem explica bucket ausente e falta de permissão');
  ok(/\}\)\.then\(function\(\)\{bt\.disabled=false;fi\.value='';\}\)/.test(envio),
    '⚠️ o botão não é reabilitado depois do envio — uma falha deixaria o professor sem poder tentar de novo');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ capa do curso: envio pelo painel cai no campo que o salvamento lê, a URL do Storage passa no validador e a tela avisa que ainda falta salvar');
