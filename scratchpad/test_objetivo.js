// Onboarding: campo "Qual seu objetivo?" — opções + "Outro" com texto livre.
//
// O defeito que este teste existe para pegar: o objetivo ser capturado DEPOIS
// do early-return do perfil "Estudante". O submit tem um `return` no meio para
// o estudante de medicina; se a leitura do objetivo ficasse abaixo dele, a
// persona mais jovem — justamente a que mais muda de objetivo — salvaria o
// perfil sem o campo, em silêncio.
'use strict';
const fs = require('fs');
const SRC = fs.readFileSync('/home/user/endodirect/index.html', 'utf8');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. o campo existe, com opções ------------------------------------------
const bloco = SRC.slice(SRC.indexOf('id="ob-objetivo"'), SRC.indexOf('</select>', SRC.indexOf('id="ob-objetivo"')));
const opcoes = (bloco.match(/<option value="([^"]*)"/g) || []).map((o) => o.replace(/<option value="|"/g, ''));
ok('select de objetivo existe', bloco.length > 0);
ok('tem opção vazia (placeholder)', opcoes[0] === '');
ok('inclui "Passar no TEEM"', opcoes.indexOf('Passar no TEEM') > 0, JSON.stringify(opcoes));
ok('inclui "Atualização em endocrinologia"', opcoes.indexOf('Atualização em endocrinologia') > 0);
ok('inclui "Outro"', opcoes.indexOf('Outro') > 0);
ok('tem 5 opções reais (TEEM, residência, atualização, consultório, Outro)',
   opcoes.filter((o) => o).length === 5, JSON.stringify(opcoes));
ok('"Acompanhar a residência" foi removida (pedido de 28/07)',
   opcoes.indexOf('Acompanhar a residência') < 0);
ok('campo livre para "Outro" existe', SRC.indexOf('id="ob-objetivo-outro"') > 0);

// ---- 2. a leitura acontece ANTES do early-return do Estudante ---------------
const sub = SRC.slice(SRC.indexOf('submitOnboard=function(){'));
const iObj = sub.indexOf('obLerObjetivo()');
const iEst = sub.indexOf("if(perfil==='Estudante')");
ok('objetivo é lido antes do early-return do Estudante', iObj > 0 && iEst > 0 && iObj < iEst,
   'obj@' + iObj + ' estudante@' + iEst);
ok('objetivo entra no objeto de perfil', /var prof=\{perfil:perfil,objetivo:objetivo\}/.test(sub));

// ---- 3. COMPORTAMENTO do leitor --------------------------------------------
const fn = SRC.slice(SRC.indexOf('function obLerObjetivo()'), SRC.indexOf('submitOnboard=function(){'));
const obLer = new Function('document', fn + '; return obLerObjetivo;');
const doc = (sel, outro) => ({ getElementById: (id) => (
  id === 'ob-objetivo' ? (sel === undefined ? null : { value: sel })
  : id === 'ob-objetivo-outro' ? { value: outro || '' } : null) });

ok('nada selecionado → null', obLer(doc(''))() === null);
ok('opção normal → o próprio texto', obLer(doc('Passar no TEEM'))() === 'Passar no TEEM');
ok('"Outro" sem texto → string vazia (bloqueia)', obLer(doc('Outro', '  '))() === '');
ok('"Outro" com texto → o texto', obLer(doc('Outro', ' Preceptoria '))() === 'Preceptoria');
// Build antigo em cache não pode travar o cadastro de ninguém.
ok('campo ausente → não trava o onboarding', obLer(doc(undefined))() === 'nao_informado');

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ objetivo no onboarding: opções, "Outro" e captura antes do early-return');
process.exit(bad ? 1 : 0);
