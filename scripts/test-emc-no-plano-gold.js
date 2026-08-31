// O PROGRAMA DE EDUCAÇÃO MÉDICA CONTINUADA É BENEFÍCIO DO GOLD — NOS DOIS LUGARES.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (31/08/2026). O professor pediu: "acrescentar de
// benefícios no plano Gold também o acesso ao Programa de Educação Médica" e,
// em seguida, "atualizar tanto na propaganda da landing page como também no
// pacote de compra dentro do app".
//
// 🧨 SÃO DUAS LISTAS SEPARADAS, e é por isso que o segundo pedido existiu. A
// landing tem os benefícios em MARKUP (`<li>` fixos); a tela de compra dentro
// do app monta a partir de `ENDO_TIERS`. Mexer em uma e esquecer a outra dá a
// pior forma de erro comercial: a propaganda promete o que a tela de pagamento
// não lista — ou o contrário. Nada quebra, ninguém vê, e o aluno decide com
// informação diferente da que recebe.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const NOME = 'Programa de Educação Médica Continuada';

// ── 1. A landing (markup) ──────────────────────────────────────────────────
{
  const i = html.indexOf('<div class="lp-plan hot">');
  ok(i > 0, 'o card Gold da landing sumiu');
  const gold = html.slice(i, html.indexOf('</div>', html.indexOf('</ul>', i)));
  ok(gold.indexOf(NOME) >= 0,
    '⚠️ o Programa sumiu da PROPAGANDA (landing) — a tela de compra prometeria o que o anúncio não menciona');
  // ⚠️ `class="course"` é o que põe a ★ dourada (`.lp-plan li.course::before`).
  // Sem ela o item entra como benefício comum, e o exclusivo do Gold deixa de
  // se distinguir do que o Standard também tem.
  ok(new RegExp('<li class="course">' + NOME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</li>').test(gold),
    '⚠️ o Programa entrou na landing sem `class="course"` — perde a ★ que marca o exclusivo do Gold');

  // E NÃO pode aparecer no Standard: é exclusivo do Gold.
  const iS = html.indexOf('<div class="lp-plan"');
  const std = iS >= 0 ? html.slice(iS, html.indexOf('</ul>', iS)) : '';
  ok(std.indexOf(NOME) < 0,
    '🧨 o Programa apareceu no card do STANDARD — é exclusivo do Gold; prometer no plano errado é promessa que a plataforma não cumpre');
}

// ── 2. O pacote de compra dentro do app (ENDO_TIERS) ──────────────────────
{
  const i = html.indexOf('var ENDO_TIER_BASE=');
  const bloco = html.slice(i, html.indexOf('\n];', html.indexOf('var ENDO_TIERS=', i)) + 3);
  const ctx = vm.createContext({});
  vm.runInContext(bloco, ctx);
  const gold = ctx.ENDO_TIERS.find((t) => t.key === 'gold');
  const std = ctx.ENDO_TIERS.find((t) => t.key === 'standard');
  ok(!!gold && gold.cursos.indexOf(NOME) >= 0,
    '⚠️ o Programa sumiu do PACOTE DE COMPRA no app — o anúncio prometeria o que a tela de pagamento não lista');
  ok(!!std && std.cursos.indexOf(NOME) < 0,
    '🧨 o Programa entrou no pacote Standard — é exclusivo do Gold');
  // A base comum é dos dois planos: o Programa não pode cair ali.
  ok(ctx.ENDO_TIER_BASE.indexOf(NOME) < 0,
    '🧨 o Programa foi para a base COMUM dos planos — o Standard passaria a prometê-lo');
}

// ── 3. 🧨 A ESTRELA É DECIDIDA POR PREFIXO DE TEXTO ───────────────────────
// `var c=/^(Curso|Programa)/.test(b)` dá o dourado aos exclusivos do Gold. Era
// `indexOf('Curso')===0`: com a regra antiga o Programa entraria com o ✓ verde
// dos benefícios comuns, ao lado de "Flashcards", e o exclusivo deixaria de
// parecer exclusivo. O trecho é EXECUTADO, não conferido por texto.
{
  const i = html.indexOf('var bens=benefits.map(function(b){');
  const linha = html.slice(i, html.indexOf('\n', i));
  const ctx = vm.createContext({});
  vm.runInContext('var benefits=["Flashcards","Prescrição Comentada",'
    + '"Curso de Endocrinologia Essencial",' + JSON.stringify(NOME) + '];'
    + 'function esc(x){return x;}'
    + linha.replace(/;\s*$/, '') + ';', ctx);
  const saida = String(ctx.bens);   // a linha já termina em `.join('')`
  const estrelas = (saida.match(/★/g) || []).length;
  ok(estrelas === 2,
    '⚠️ os itens exclusivos do Gold não saíram com ★: ' + estrelas + ' de 2 (Curso e Programa)');
  // ⚠️ E o destaque não pode transbordar: os benefícios comuns seguem com ✓.
  const ateFlash = saida.slice(0, saida.indexOf('Flashcards'));
  ok(ateFlash.indexOf('★') < 0,
    '🧨 um benefício COMUM ganhou o destaque de exclusivo — a distinção entre os planos se perde');
  ok((saida.match(/✓/g) || []).length === 2,
    'os benefícios comuns perderam o ✓: ' + (saida.match(/✓/g) || []).length + ' de 2');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ Programa de EMC: benefício do Gold na landing E no pacote de compra, destacado como exclusivo e fora do Standard');
