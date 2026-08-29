// A base clínica publicada não pode REPRODUZIR o texto das fontes.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (29/08/2026). O professor mandou uma apostila de
// congresso sobre desprescrição de AR GLP-1 com o aviso, no rodapé de todas as
// páginas: "NÃO AUTORIZO A REPLICAÇÃO DESTE MATERIAL". As citações já viajavam
// protegidas (offset + hash, nunca o texto — ver test-citacao-nao-publicada.js),
// mas isso guarda só metade: a `afirmacao` é redação minha e vai INTEIRA para o
// `clinical-deep-data.js`, que é versionado e servido.
//
// 🧨 E ela tinha ficado perto demais. A primeira varredura achou SEIS trechos em
// que a paráfrase reproduzia a frase do autor — não por cópia deliberada, mas
// porque reescrever devagar uma frase boa devolve a frase boa. Nenhuma guarda
// olhava para isso.
//
// A medida é janela de 12 palavras, com espaço normalizado: abaixo disso pega
// coincidência inevitável de vocabulário clínico ("perfil lipídico e pressão
// arterial"); acima, deixa passar período inteiro reproduzido.
//
// ⚠️ FATO NÃO É EXPRESSÃO. Números, doses e nomes de estudo podem — e devem —
// coincidir. O que não pode coincidir é a FRASE que os organiza.
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR_TEXTOS = path.join(REPO, 'scratchpad', 'acervo', 'textos');
const PUBLICADO = path.join(REPO, 'lib', 'clinical-deep-data.js');
const JANELA = 12;      // palavras
const MIN_CHARS = 60;   // ignora janelas curtas demais para significar cópia

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// ⚠️ Os textos-fonte são gitignored de propósito (é o que impede o artigo de
// entrar no repositório). Num clone limpo eles não existem, e aí este teste não
// tem o que comparar. Etapa que não roda tem de DIZER que não rodou — silêncio
// aqui viraria "está tudo certo" quando na verdade nada foi medido.
if (!fs.existsSync(DIR_TEXTOS)) {
  console.log('↷ não reproduz a fonte: PULADO — scratchpad/acervo/textos/ não existe neste clone (os textos são gitignored).');
  process.exit(0);
}
// ⚠️ A REGRA VALE ONDE ELA OBRIGA. Rodado sobre o acervo inteiro, este teste
// acha 514 trechos reproduzidos — quase todos de artigos de acesso aberto e de
// diretrizes de sociedade, onde reproduzir é LICENCIADO. Reprovar tudo isso
// transformaria o guarda em ruído e ele seria desligado na semana seguinte.
//
// O que se guarda aqui é a fonte com RESTRIÇÃO DECLARADA: o extrato que carrega
// `nota_licenca`. Foi para essa que o autor escreveu "não autorizo a replicação",
// e é nela que a paráfrase precisa ser redação própria de verdade.
// O número do acervo inteiro fica IMPRESSO — dívida medida não é dívida
// esquecida —, mas não reprova. Está em cofre/Pendências.md.
const DIR_EXTRATOS = path.join(REPO, 'scratchpad', 'acervo', 'extratos');
const restritos = new Set();
if (fs.existsSync(DIR_EXTRATOS)) {
  for (const f of fs.readdirSync(DIR_EXTRATOS).filter((x) => x.endsWith('.json'))) {
    try {
      const e = JSON.parse(fs.readFileSync(path.join(DIR_EXTRATOS, f), 'utf8'));
      if (e && e.nota_licenca && e.fileId) restritos.add(String(e.fileId) + '.txt');
    } catch (err) { /* extrato ilegível é problema de outro teste */ }
  }
}
const todos = fs.readdirSync(DIR_TEXTOS).filter((f) => f.endsWith('.txt'));
const arquivos = todos.filter((f) => restritos.has(f));
if (!todos.length) {
  console.log('↷ não reproduz a fonte: PULADO — nenhum texto-fonte local para comparar.');
  process.exit(0);
}
if (!arquivos.length) {
  console.log('↷ não reproduz a fonte: nenhum extrato com `nota_licenca` — nada com restrição declarada a conferir.');
  process.exit(0);
}

// ⚠️ Um `indexOf` por janela é quadrático e levava minutos: são ~7,8 milhões de
// palavras de fonte contra 2 MB de base publicada. O conjunto das janelas do
// arquivo publicado é montado UMA vez, e a comparação vira consulta.
const publicado = norm(fs.readFileSync(PUBLICADO, 'utf8')).split(' ');
const JANELAS_PUB = new Set();
for (let i = 0; i + JANELA <= publicado.length; i++) {
  JANELAS_PUB.add(publicado.slice(i, i + JANELA).join(' '));
}
const achados = [];

for (const arq of arquivos) {
  const palavras = norm(fs.readFileSync(path.join(DIR_TEXTOS, arq), 'utf8')).split(' ');
  const spans = [];
  for (let i = 0; i + JANELA <= palavras.length; i++) {
    const jan = palavras.slice(i, i + JANELA).join(' ');
    if (jan.length < MIN_CHARS) continue;
    if (!JANELAS_PUB.has(jan)) continue;
    // Junta janelas que se sobrepõem: um período reproduzido é UM achado, não vinte.
    if (spans.length && i <= spans[spans.length - 1][1] + 1) spans[spans.length - 1][1] = i;
    else spans.push([i, i]);
  }
  for (const [a, b] of spans) {
    achados.push({ arq, trecho: palavras.slice(a, b + JANELA).join(' ') });
  }
}

if (achados.length) {
  console.error('✗ a base clínica publicada REPRODUZ ' + achados.length + ' trecho(s) do texto-fonte:\n');
  for (const a of achados.slice(0, 12)) {
    console.error('  · ' + a.arq + '\n    "' + a.trecho.slice(0, 180) + (a.trecho.length > 180 ? '…' : '') + '"\n');
  }
  console.error('  A `afirmacao` é para ser REDAÇÃO PRÓPRIA. Reescreva os trechos acima com');
  console.error('  suas palavras — os números e os nomes de estudo podem (e devem) ficar.');
  process.exit(1);
}

// A conta do acervo inteiro, só para não perder a medida de vista.
let outros = 0;
for (const arq of todos) {
  if (restritos.has(arq)) continue;
  const palavras = norm(fs.readFileSync(path.join(DIR_TEXTOS, arq), 'utf8')).split(' ');
  for (let i = 0; i + JANELA <= palavras.length; i++) {
    const jan = palavras.slice(i, i + JANELA).join(' ');
    if (jan.length >= MIN_CHARS && JANELAS_PUB.has(jan)) { outros++; i += JANELA; }
  }
}
console.log('✓ não reproduz a fonte: ' + arquivos.length + ' fonte(s) com restrição declarada conferida(s), nenhum período reproduzido'
  + ' · nas demais (acesso aberto/diretrizes, onde reproduzir é licenciado): ' + outros + ' trecho(s) — ver cofre/Pendências.md');
