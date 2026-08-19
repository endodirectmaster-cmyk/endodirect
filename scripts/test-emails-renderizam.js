// TODO corpo de e-mail tem de RENDERIZAR — não basta o arquivo parsear.
//
// ⚠️ O DEFEITO QUE CRIOU ESTA PENEIRA (19/08/2026). Escrevi `cedoHtml` (o e-mail
// de reengajamento de 3 dias) chamando `wrap(...)`, um helper que NÃO EXISTE
// neste módulo — o certo é `shell(...)`. Consequências, todas silenciosas:
//   · `node --check` passa: é erro de REFERÊNCIA, não de sintaxe;
//   · o `test-reengajamento.js` passava: ele conferia o TEXTO-FONTE, não a
//     execução;
//   · em produção o `try/catch` do cron engoliria o ReferenceError e o e-mail
//     simplesmente não sairia — sem erro visível, sem alerta, sem ninguém saber.
//
// A lição é a de sempre neste projeto: teste que lê código não substitui teste
// que RODA código. Aqui cada corpo é renderizado de verdade, com dados mínimos.
'use strict';
const T = require('../lib/trial-emails.js');
const falhas = [];
const ok = (nome, fn, extras) => {
  try {
    const html = fn();
    if (typeof html !== 'string' || html.length < 200) { falhas.push(nome + ': devolveu ' + typeof html + ' de ' + (html && html.length) + ' chars'); return; }
    if (/undefined|\[object Object\]/.test(html)) falhas.push(nome + ': saiu com "undefined" ou "[object Object]" no corpo');
    (extras || []).forEach(([desc, cond]) => { if (!cond(html)) falhas.push(nome + ': ' + desc); });
  } catch (e) { falhas.push(nome + ' ESTOUROU: ' + (e && e.message)); }
};

const PAYLOAD = {
  ig_stories: [{ status: 'posted', stem: 'Enunciado de teste com dados suficientes.', answer: 'A',
                 options: { A: 'alternativa A', B: 'alternativa B' }, sub: 'Adrenal' }],
  radar_avisos: [], adm_avisos: [], radar_hidden: [],
};
const CONTAGENS = { artigos: 42, discussoes: 42, capitulos: 42, diretrizes: 42, questoes: 42, flashcards: 42, mapas: 42, podcasts: 42, calculadoras: 42, cursos: 42 };
const DADOS = { revisoes: [{ titulo: 'Revisão X', fonte: 'JCEM' }], diretrizes: [{ titulo: 'Consenso Y', fonte: 'ADA' }], conteudo: {} };

ok('warnHtml (degustação terminando)', () => T.warnHtml(3));
ok('winbackHtml (degustação terminou)', () => T.winbackHtml());
// ⚠️ `novidadesHtml` recebe um objeto de CONTAGENS (n.artigos, n.discussoes...),
// não (dados, nome, email) como os outros. Chamei errado na primeira versão
// deste teste e ele acusou "undefined" no corpo — parecia defeito do e-mail e
// era defeito do teste. Conferi a assinatura na fonte antes de acusar.
ok('novidadesHtml (campanha)', () => T.novidadesHtml(CONTAGENS), [
  ['as contagens não apareceram no corpo', (h) => h.indexOf('42') > 0],
]);
ok('reengajamentoHtml (14 dias)', () => T.reengajamentoHtml(DADOS, 'Fulano', 'a@b.com'));
ok('cedoHtml (3 dias, com questão)', () => T.cedoHtml(PAYLOAD, 'Fulano', 'a@b.com'), [
  ['a questão não apareceu no corpo', (h) => h.indexOf('Enunciado de teste') > 0],
  ['as alternativas não apareceram', (h) => h.indexOf('alternativa A') > 0],
  // ⚠️ Sem gabarito de propósito: com a resposta no e-mail, o aluno resolve de
  // cabeça e não abre o app — e é a abertura que tira ele de "nunca estudou".
  ['⚠️ o gabarito vazou para o e-mail', (h) => !/resposta correta|gabarito/i.test(h)],
]);
ok('renovacaoHtml (aviso de renovação + "seu ano no Endodirect")',
   () => T.renovacaoHtml({ email: 'a@b.com', nome: 'Fulano de Tal', dias_para_vencer: 7,
                           vence_em: '2027-06-17', tipo: 'avulso', dias_estudados: 3,
                           respondidas: 63, acertos: 44, area_top: 'Diabetes',
                           primeiro_dia: '2026-06-30' }, DADOS), [
  ['não diz a data de vencimento em português', (h) => h.indexOf('17/06/2027') > 0],
  // ⚠️ A RPC devolve 'YYYY-MM-DD'. "vence em 2027-06-17" numa frase em português
  // lê-se como defeito — e é o tipo de coisa que ninguém reporta, só desconta.
  ['⚠️ vazou data em formato ISO no corpo', (h) => h.indexOf('2027-06-17') < 0],
  ['não avisa que a anual NÃO renova sozinha', (h) => /não renova sozinha|nao renova sozinha/i.test(h)],
  ['⚠️ não oferece o plano recorrente — é a hora certa de oferecer', (h) => /recorrente/i.test(h)],
  ['não trouxe a retrospectiva', (h) => h.indexOf('Seu ano no Endodirect') > 0],
  ['não mostrou as questões respondidas', (h) => h.indexOf('63') > 0],
  ['não calculou o acerto (44/63 = 70%)', (h) => h.indexOf('70%') > 0],
  ['não disse a área mais estudada', (h) => h.indexOf('Diabetes') > 0],
]);
// e o mesmo aviso para quem NUNCA usou não pode cobrar um uso que não houve
ok('renovacaoHtml (assinante que nunca estudou)',
   () => T.renovacaoHtml({ email: 'a@b.com', nome: '', dias_para_vencer: 30,
                           vence_em: '2027-06-17', tipo: 'avulso', dias_estudados: 0,
                           respondidas: 0, acertos: 0 }, DADOS), [
  ['⚠️ mencionou dias de estudo para quem tem zero — soa como cobrança', (h) => !/estudou em <b>0/.test(h)],
  ['⚠️ mostrou a retrospectiva vazia — painel de zeros é argumento CONTRA renovar', (h) => h.indexOf('Seu ano no Endodirect') < 0],
]);
// ⚠️ CONTA LEGADA: respondeu questões antes de studyEvent() existir (25/07/2026),
// então tem `perf` cheio e `act` VAZIO. Olhando só para os dias, o e-mail diria
// "você não estudou" a quem respondeu 41 questões — e ainda mostraria "0 dias".
ok('retrospectivaHtml (conta legada: 0 dias registrados, 41 questões)',
   () => '<html>' + T.retrospectivaHtml({ dias_estudados: 0, respondidas: 41, acertos: 36 })
         + '<!-- preenchimento para o piso de 200 chars do arranjo de teste -->'.repeat(4) + '</html>', [
  ['não mostrou as questões respondidas', (h) => h.indexOf('41') > 0],
  ['⚠️ escreveu uma célula "0" de dias de estudo', (h) => !/>0<\/div>/.test(h)],
]);
ok('retrospectivaHtml (amostra pequena não vira porcentagem)',
   () => '<html>' + T.retrospectivaHtml({ dias_estudados: 2, respondidas: 3, acertos: 1 })
         + '<!-- preenchimento para o piso de 200 chars do arranjo de teste -->'.repeat(4) + '</html>', [
  // 1/3 = 33% dito a quem respondeu TRÊS questões é ruído apresentado como nota.
  // ⚠️ Procura o RÓTULO, não o caractere '%': a própria tabela usa width="50%",
  // e a 1ª versão desta asserção reprovou por causa disso — defeito do teste.
  ['⚠️ calculou porcentagem sobre 3 questões', (h) => !/de acerto/.test(h)],
  ['perdeu os dias de estudo', (h) => h.indexOf('2') > 0],
]);

if (falhas.length) {
  console.error('✗ corpos de e-mail:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ corpos de e-mail: renderizam de verdade, sem undefined, com data em pt-BR e a retrospectiva que prometem');
