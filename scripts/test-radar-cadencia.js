// O radar do mural tem de varrer DUAS VEZES POR DIA — e nenhuma entrada de cron
// pode disparar mais de uma vez por dia.
//
// O CASO (17/08/2026). O professor mandou o print de uma notícia da ANVISA —
// "Anvisa aprova duas novas canetas para tratamento de diabetes", princípio ativo
// semaglutida — e disse: "Não captou essa notícia no mural."
//
// ⚠️ NADA ESTAVA QUEBRADO, e vale registrar por quê, para ninguém "consertar" a
// coisa errada:
//   · a fonte FUNCIONA — o mural tem um item da própria ANVISA de 29/07/2026
//     ("Anvisa registra cinco novas canetas de semaglutida"), do mesmo assunto;
//   · o FILTRO deixaria passar — `isRelevant()` exige um termo de aprovação E um
//     termo de área: "aprova" casa `aprov` e "diabetes" casa `diabet`;
//   · o cron RODOU no dia, normalmente.
//
// A causa era CADÊNCIA: o radar rodava `30 10 * * *` — uma vez por dia, 07:30 BRT
// — e a notícia saiu 11:02 BRT. Ela só entraria na manhã seguinte.
//
// ⚠️⚠️ E O CONSERTO DAQUELE DIA DERRUBOU O DEPLOY POR 33 HORAS. Eu troquei o
// agendamento para `30 10,20 * * *` — duas execuções na MESMA entrada de cron. O
// plano da Vercel aceita 2 crons, mas cada um só pode disparar UMA VEZ POR DIA:
// a plataforma recusou o `vercel.json` inteiro, ANTES de criar qualquer
// implantação. Resultado: nenhum deploy entre 17/08 18:43 e 19/08, a produção
// congelada na v242, e cinco PRs mergeados que nunca chegaram ao aluno — inclusive
// a enquete na tela de entrada e o pacote de engajamento. O status no GitHub dizia
// só "Deployment failed", e o `ci-validate` passava: nada no repositório acusava.
//
// ⚠️ E A "PROVA" DE QUE O PROJETO ERA PRO NÃO PROVAVA NADA. Eu argumentei que
// `maxDuration: 120` declarado no `vercel.json` só faria sentido no Pro (o teto do
// Hobby é 60 s). A Vercel **corta em silêncio** pelo limite do plano — declarar um
// valor acima do teto não falha, então declará-lo não prova plano nenhum.
//
// A CADÊNCIA CONTINUA SENDO DE DUAS VARREDURAS: uma em cada entrada diária de
// cron — 07:30 BRT no `endocrine-radar` e 17:00 BRT no `healthcheck`, que chama
// `runRadar()`. Este teste guarda as duas coisas ao mesmo tempo: duas varreduras
// por dia E nenhum cron disparando mais de uma vez por dia.
'use strict';
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, 'vercel.json'), 'utf8'));
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const crons = Array.isArray(cfg.crons) ? cfg.crons : [];
ok(crons.length > 0, 'sumiram os crons do vercel.json');

// Quantas execuções por dia uma expressão de cron produz.
function execucoesPorDia(schedule) {
  const p = String(schedule).trim().split(/\s+/);
  if (p.length !== 5) return 0;
  const [min, hora] = p;
  const conta = (campo, total) => {
    if (campo === '*') return total;
    if (campo.startsWith('*/')) return Math.ceil(total / parseInt(campo.slice(2), 10));
    return campo.split(',').length;
  };
  return conta(min, 60) * conta(hora, 24);
}

// ── 1. ⚠️ NENHUM CRON MAIS DE 1×/DIA — é o que a Vercel recusa, e recusa o
//        arquivo INTEIRO: o deploy nem chega a existir.
crons.forEach((c) => {
  const n = execucoesPorDia(c.schedule);
  ok(n === 1,
    '⚠️ O CRON ' + c.path + ' ESTÁ AGENDADO PARA ' + n + '× POR DIA ("' + c.schedule + '"). '
    + 'O plano só aceita disparo DIÁRIO: a Vercel recusa o vercel.json inteiro e NENHUM deploy sai — '
    + 'foi o que congelou a produção na v242 entre 17 e 19/08/2026. Para varrer mais vezes, '
    + 'ponha a varredura extra DENTRO de outra entrada diária de cron (é o que o healthcheck faz).');
});
ok(crons.length <= 2, 'mais de 2 crons no vercel.json — o plano aceita 2');

// ── 2. e ainda assim, DUAS varreduras por dia ──────────────────────────────
const temRadarProprio = crons.some((c) => String(c.path || '').includes('endocrine-radar'));
ok(temRadarProprio, 'sumiu o cron do radar (/api/cron/endocrine-radar) do vercel.json');

// A 2ª varredura não está no agendamento — está no CÓDIGO do outro cron. Se
// alguém tirar o runRadar() de lá, a cadência volta a 1×/dia sem que o
// vercel.json mude nada.
const health = fs.readFileSync(path.join(raiz, 'api', 'cron', 'healthcheck.js'), 'utf8');
const temRadarNoHealth = /require\(['"]\.\.\/\.\.\/lib\/radar['"]\)/.test(health) && /await runRadar\(\)/.test(health);
ok(temRadarNoHealth,
  '⚠️ O CRON DAS 17h DEIXOU DE VARRER O RADAR. Sem ele a cadência volta a uma passagem diária, '
  + 'e notícia publicada depois das 07:30 só aparece no mural no dia seguinte — a queixa de '
  + '17/08/2026 (ANVISA, canetas de semaglutida, publicada 3h32 depois da varredura).');

const varreduras = (temRadarProprio ? 1 : 0) + (temRadarNoHealth ? 1 : 0);
ok(varreduras >= 2, 'o radar ficou com ' + varreduras + ' varredura(s) por dia — o combinado são 2');

// As duas varreduras têm de estar em HORAS diferentes: duas no mesmo horário
// não cobrem o intervalo do dia.
const horas = crons.map((c) => String(c.schedule).trim().split(/\s+/)[1]);
ok(new Set(horas).size === horas.length,
  'os dois crons estão na mesma hora — a segunda varredura não cobre a tarde');

// A falha silenciosa: uma varredura só faz sentido se a notícia ainda estiver na
// janela de recência quando ela roda.
const news = fs.readFileSync(path.join(raiz, 'lib', 'news.js'), 'utf8');
const m = news.match(/NEWS_RECENT_DAYS\s*=\s*(\d+)/);
ok(!!m, 'não achei NEWS_RECENT_DAYS em lib/news.js');
if (m) ok(parseInt(m[1], 10) >= 1,
  'NEWS_RECENT_DAYS ficou menor que 1 dia — notícia expiraria entre duas varreduras');

// As fontes regulatórias que sustentam o caso não podem sumir da lista.
[['anvisa.gov.br', 'domínio da ANVISA'], ['gov.br', 'domínio gov.br'], ["'anvisa'", 'nome ANVISA']]
  .forEach(([t, nome]) => ok(news.includes(t), 'sumiu ' + nome + ' das fontes confiáveis de lib/news.js'));
ok(/gov\.br\/anvisa[^'"]*RSS/i.test(news), 'sumiu o feed oficial da ANVISA de lib/news.js');

if (falhas.length) {
  console.error('✗ cadência do radar:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ cadência do radar: ' + varreduras + ' varreduras/dia em ' + crons.length
  + ' crons diários (nenhum acima de 1×/dia) e as fontes regulatórias preservadas');
