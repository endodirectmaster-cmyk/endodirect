// Allowlist de fontes do Breaking News — quem pode virar card de "Comunicado".
//
// ⚠️ O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR (03/08/2026): o professor
// perguntou "essas notícias estão corretas?". Dois cards de **aprovação do FDA**
// tinham entrado no mural com token aleatório no meio do título — "View
// cyRXhxjjE", "*G8NgoFLbt*" — e o publicador, no sufixo que o Google News anexa,
// era **FC Bayern**. Um site de futebol anunciando aprovação de medicamento.
//
// A causa era uma linha:
//
//     TRUSTED_SOURCE_NAMES.some((n) => name.indexOf(n) >= 0)
//
// A lista tem `'bayer'` (a farmacêutica). E `'fc bayern'.indexOf('bayer') === 3`.
// O clube casou com a Bayer e **a allowlist inteira virou decoração** — bastava o
// nome do veículo conter, em qualquer posição, o nome de uma fonte confiável.
//
// O mesmo valia para domínio: `url.indexOf('gov.br')` aceitaria
// `naogov.br.spam.com`, e `url.indexOf('fda.gov')` aceitaria `fda.gov.evil.com`.
//
// ⚠️ POR QUE ISTO É PIOR QUE UM CARD FEIO: o card diz "Fonte: FDA" e afirma que
// um medicamento foi aprovado. Um aluno pode mudar conduta com base nisso. Fonte
// errada aqui não é ruído de curadoria, é informação clínica sem procedência.
'use strict';
const fs = require('fs');
const path = require('path');
const { isBreakingTrusted } = require('../lib/news');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. ⚠️ O CASO REAL: o clube de futebol NÃO é a farmacêutica -------------
{
  ok('⚠️ "FC Bayern" NÃO é fonte confiável', isBreakingTrusted({ sourceName: 'FC Bayern' }) === false,
     "'fc bayern'.indexOf('bayer') === 3 — era assim que entrava");
  ok('⚠️ "FC Bayern München" também não', isBreakingTrusted({ sourceName: 'FC Bayern München' }) === false);
  // O título real que o professor viu, com a origem só no sufixo.
  ok('⚠️ e nem pelo sufixo do título',
     isBreakingTrusted({ titulo: 'FDA Approves Wegovy Weight Loss Pill - View cyRXhxjjE - FC Bayern' }) === false,
     'é o caminho dos itens antigos, sem origem gravada');
  // ⚠️ E a Bayer de verdade continua passando: apertar demais quebraria o recurso.
  ok('a Bayer (farmacêutica) continua confiável', isBreakingTrusted({ sourceName: 'Bayer' }) === true);
  ok('"Bayer AG" também', isBreakingTrusted({ sourceName: 'Bayer AG' }) === true);
  ok('"Novo Nordisk A/S" também', isBreakingTrusted({ sourceName: 'Novo Nordisk A/S' }) === true);
}

// ---- 2. ⚠️ DOMÍNIO É HOSTNAME, NÃO SUBSTRING --------------------------------
{
  ok('anvisa.gov.br passa', isBreakingTrusted({ sourceUrl: 'https://www.anvisa.gov.br/noticia' }) === true);
  ok('fda.gov passa', isBreakingTrusted({ sourceUrl: 'https://www.fda.gov/news-events/x' }) === true);
  ok('⚠️ fda.gov.evil.com NÃO passa', isBreakingTrusted({ sourceUrl: 'https://fda.gov.evil.com/x' }) === false,
     'o substring aceitava: o domínio confiável aparecia no meio do host');
  ok('⚠️ naogov.br.spam.com NÃO passa', isBreakingTrusted({ sourceUrl: 'https://naogov.br.spam.com/x' }) === false);
  ok('⚠️ nem quando o domínio confiável está só no CAMINHO',
     isBreakingTrusted({ sourceUrl: 'https://spam.com/redir?u=fda.gov' }) === false);
  ok('subdomínio de fonte confiável passa', isBreakingTrusted({ sourceUrl: 'https://investor.lilly.com/x' }) === true);
}

// ---- 3. o resto da política continua de pé ----------------------------------
{
  ok('feed oficial passa sem checar origem', isBreakingTrusted({ official: true }) === true);
  ok('sem origem e sem sufixo: NÃO passa', isBreakingTrusted({ titulo: 'FDA aprova alguma coisa' }) === false,
     'a política é "só oficiais" quando não dá para saber a procedência');
  ok('veículo desconhecido não passa', isBreakingTrusted({ sourceName: 'Blog do Zé' }) === false);
  ok('item nulo não quebra', isBreakingTrusted(null) === false && isBreakingTrusted(undefined) === false);
  ok('campos vazios não passam', isBreakingTrusted({ sourceName: '', sourceUrl: '' }) === false);
}

// ---- 4. ⚠️ A COMPARAÇÃO NÃO PODE VOLTAR A SER POR SUBSTRING -----------------
// A regra vive em duas funções pequenas; um "simplifica isso aqui" desfaz.
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'news.js'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  ok('nome é comparado por palavra inteira', /new RegExp\('\(\^\|\[\^a-z0-9\]\)'/.test(src), 'era indexOf');
  ok('domínio é comparado por hostname', /host === d \|\| host\.endsWith\('\.' \+ d\)/.test(src));
  ok('não sobrou indexOf na checagem de fonte',
     !/TRUSTED_SOURCE_(DOMAINS|NAMES)\.some\(\([^)]*\) => [a-z]+\.indexOf\(/.test(src),
     'o substring é exatamente o defeito');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) da allowlist de notícias falharam.'); process.exit(1); }
console.log('Fonte confiável do Breaking News: OK');
