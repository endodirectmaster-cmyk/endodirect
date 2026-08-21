// ⚠️ Nenhum extrato VERSIONADO pode carregar o texto literal da citação.
//
// Ver lib/citacao.js para o porquê: 72% de um artigo Elsevier por assinatura
// estava reconstituível verbatim neste repositório, que é público. O extrato
// passou a guardar `cit` (offset) + `cit_sha` (hash), e o texto fica em
// `scratchpad/acervo/textos/`, no .gitignore.
//
// O agente extrator continua escrevendo `citacao` com o texto — é o jeito
// natural de trabalhar, e o verificador aceita. O que NÃO pode é isso chegar ao
// commit. `node scripts/protege-citacoes.js` converte; este teste garante que
// ninguém esqueça, porque esquecer publica o artigo e ninguém percebe.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo', 'extratos');
if (!fs.existsSync(DIR)) { console.log('✓ (sem extratos)'); process.exit(0); }

// Só o que está RASTREADO pelo git importa: um extrato ainda não commitado pode
// legitimamente ter texto, porque o agente acabou de escrevê-lo.
//
// 🧨 O BURACO QUE ISSO DEIXAVA, E QUE ME MORDEU EM 21/08/2026. Extrato NOVO nasce
// não rastreado — então este teste o PULAVA, o `ci-validate` passava, e o
// `git add -A && git commit` seguinte publicava o texto integral do artigo. Foi
// exatamente o que aconteceu com as três diretrizes SBD 2026: rodei o verificador,
// refiz os extratos por causa de um número errado e esqueci de rodar
// `protege-citacoes.js` de novo. O CI aprovou porque os arquivos ainda eram novos.
//
// Agora conta também o que está EM STAGE: é o último instante em que dá para
// impedir, e um arquivo em stage não é mais "rascunho do agente" — é commit.
const gitLista = (args) => {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) { return null; }
};
const versionados = gitLista(['ls-files', 'scratchpad/acervo/extratos']);
const emStage = gitLista(['diff', '--cached', '--name-only', '--', 'scratchpad/acervo/extratos']);
// fora de um repo (as duas chamadas falham): confere tudo.
const rastreados = (versionados === null && emStage === null)
  ? null
  : (versionados || []).concat(emStage || []);

const falhas = [];
for (const arq of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const rel = 'scratchpad/acervo/extratos/' + arq;
  if (rastreados && rastreados.indexOf(rel) < 0) continue;
  const e = JSON.parse(fs.readFileSync(path.join(DIR, arq), 'utf8'));
  const comTexto = (e.fatos || []).filter((f) => String(f.citacao || '').trim()).length;
  if (comTexto) falhas.push(`${arq}: ${comTexto} de ${(e.fatos || []).length} fatos ainda com o TEXTO da citação`);
}

if (falhas.length) {
  console.error('✗ texto literal de artigo prestes a ser publicado:');
  falhas.forEach((f) => console.error('  - ' + f));
  console.error('\nRode: node scripts/protege-citacoes.js');
  console.error('Ele troca o texto por offset+hash. A prova continua igual; o artigo deixa de sair.');
  process.exit(1);
}
console.log('✓ nenhum extrato versionado carrega o texto literal da citação');
