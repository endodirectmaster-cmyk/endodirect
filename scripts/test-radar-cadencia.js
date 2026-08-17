// O radar do mural tem de rodar MAIS DE UMA VEZ POR DIA.
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
// — e a notícia saiu 11:02 BRT. Ela só entraria na manhã seguinte. Para notícia
// de agência reguladora sobre a classe de fármacos que é o centro da plataforma,
// ~24 h de latência é o defeito, mesmo sem nenhum erro no caminho.
//
// Este teste falha se alguém voltar o radar para uma única execução diária.
'use strict';
const fs = require('fs');
const path = require('path');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const radar = (cfg.crons || []).filter((c) => String(c.path || '').includes('endocrine-radar'));
ok(radar.length > 0, 'sumiu o cron do radar (/api/cron/endocrine-radar) do vercel.json');

// Quantas execuções por dia o conjunto de entradas do radar produz.
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
const porDia = radar.reduce((s, c) => s + execucoesPorDia(c.schedule), 0);
ok(porDia >= 2,
  '⚠️ O RADAR VOLTOU A RODAR ' + porDia + '× POR DIA. Com uma única passagem diária, notícia '
  + 'publicada logo depois dela só aparece no mural no dia seguinte — foi exatamente a queixa de '
  + '17/08/2026 (ANVISA, canetas de semaglutida, publicada 3h32 depois da varredura).');

// A janela de recência não pode ser menor que o intervalo entre execuções, senão
// a notícia expira antes de alguém a ler.
const news = fs.readFileSync(path.join(__dirname, '..', 'lib', 'news.js'), 'utf8');
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
console.log('✓ cadência do radar: ' + porDia + ' varreduras/dia e as fontes regulatórias (ANVISA) preservadas');
