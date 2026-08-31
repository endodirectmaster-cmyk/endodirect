// A LANDING NÃO PODE PROMETER O QUE A PLATAFORMA NÃO TEM.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (31/08/2026). Foi a TERCEIRA vez no mesmo dia que
// um texto de vitrine sobreviveu à mudança do produto:
//   1. o banner da degustação anunciava o pacote antigo, sem os podcasts;
//   2. o FAQ dizia que o Gold "acrescenta a Prescrição Comentada" depois de ela
//      passar para o Standard;
//   3. a landing anunciava um card "Questões por IA" e ensinava, no FAQ, a
//      clicar num botão "Gerar questões" — recurso retirado do painel do aluno
//      no dia anterior, a pedido do professor.
//
// 🧨 É UM DEFEITO QUE NÃO QUEBRA NADA. Nenhum teste falha, nenhuma tela some: só
// o anúncio deixa de corresponder ao produto. E o custo cai inteiro sobre quem
// menos conhece a plataforma — o visitante decide por uma promessa, e o aluno
// procura um botão que não existe e conclui que está quebrado.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ⚠️ SÃO DUAS PROSAS, e eu errei o recorte na primeira tentativa: achei que o
// FAQ fosse da landing. Não é — ele mora no SUPORTE, dentro do app (a landing
// termina antes do `login-screen`). As duas envelhecem do mesmo jeito e pelo
// mesmo motivo, então as duas entram:
//   · a LANDING, que promete a quem ainda não é aluno;
//   · os itens de FAQ, que ensinam quem já é.
const i0 = html.indexOf('<div id="landing-screen">');
const i1 = html.indexOf('<div id="login-screen"', i0);
ok(i0 > 0 && i1 > i0, 'não achei a região da landing no index.html');
const LANDING = (i0 > 0 && i1 > i0) ? html.slice(i0, i1) : '';
const FAQ = (html.match(/class="faq-a">[\s\S]{0,600}?<\/div>/g) || []).join('\n');
ok(FAQ.length > 0, 'não achei os itens de FAQ no index.html');
// A vitrine, para efeito deste teste, é tudo que DESCREVE o produto em prosa.
const LP = LANDING + '\n' + FAQ;

// ── 1. Recursos RETIRADOS não podem seguir anunciados ──────────────────────
// Cada linha é um recurso que saiu do painel do aluno, com o texto que o
// anunciava. A regra: se o código do recurso não existe, o anúncio também não.
const RETIRADOS = [
  { recurso: 'geração de questões por IA (saiu em 30/08/2026)',
    codigoSumiu: ['id="q-panel-ia"', 'data-qmode="ia"', 'id="btn-genq"'],
    anuncios: [/Quest[õo]es por IA/i, /Gere quest[õo]es in[ée]ditas/i, /clique em "Gerar quest[õo]es"/i] }
];
RETIRADOS.forEach((r) => {
  const aindaExiste = r.codigoSumiu.some((t) => html.indexOf(t) >= 0);
  if (aindaExiste) return;   // o recurso voltou: aí o anúncio pode voltar junto
  r.anuncios.forEach((re) => {
    ok(!re.test(LP),
      '🧨 a landing ainda anuncia ' + r.recurso + ' (' + re + ') — o recurso não existe mais no painel do aluno');
  });
});

// ── 2. 🧨 INSTRUÇÃO QUE CITA UM BOTÃO TEM DE CITAR UM BOTÃO QUE EXISTE ────
// É a guarda GERAL, e a que teria pego o caso 3 sozinha: o FAQ mandava "clique
// em 'Gerar questões'" muito depois de o botão sair. Instrução para um controle
// inexistente é pior que instrução nenhuma — o aluno procura, não acha, e
// conclui que a plataforma está quebrada.
{
  const citados = new Set();
  const re = /(?:clique em|bot[ãa]o|aba)\s+[«"“]([^"”»<]{2,40})[»"”]/gi;
  let m;
  while ((m = re.exec(LP))) citados.add(m[1].trim());
  citados.forEach((rot) => {
    const escapado = rot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // o rótulo aparece como texto de um elemento em qualquer lugar do app?
    const existe = new RegExp('>[^<]{0,14}' + escapado + '[^<]{0,14}<').test(html);
    ok(existe,
      '🧨 a landing manda clicar em "' + rot + '", e não existe controle com esse texto no app — '
      + 'instrução para botão inexistente faz o aluno concluir que a plataforma quebrou');
  });
  // A varredura precisa estar VENDO alguma coisa: se o padrão parar de casar
  // (mudou a redação das instruções), ela vira um teste que não testa nada.
  ok(citados.size >= 1,
    '⚠️ nenhuma instrução com rótulo entre aspas foi encontrada na landing — '
    + 'ou a redação mudou, ou o recorte da região está errado; nos dois casos esta guarda parou de guardar');
}

// ── 3. O que a landing promete de TAMANHO tem de existir ──────────────────
// "Mais de 2.000 questões" é promessa de acervo. Não dá para conferir o número
// exato daqui (ele vive no servidor), mas dá para exigir que a ordem de grandeza
// não seja maior que a que a plataforma comprovadamente tem.
{
  const m = LP.match(/Mais de ([\d.]+) quest[õo]es/i);
  ok(!!m, 'a landing deixou de anunciar o tamanho do banco de questões');
  if (m) {
    const anunciado = parseInt(m[1].replace(/\./g, ''), 10);
    ok(anunciado <= 2965,
      '⚠️ a landing anuncia "mais de ' + m[1] + ' questões" e o banco tem 2.965 — '
      + 'promessa acima do acervo é a única forma desse número virar mentira');
  }
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ vitrine: nada de recurso retirado anunciado, toda instrução cita controle que existe, e o tamanho prometido cabe no acervo');
