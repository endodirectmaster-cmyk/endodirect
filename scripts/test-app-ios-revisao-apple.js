#!/usr/bin/env node
// APP DO IPHONE PRONTO PARA A REVISÃO DA APPLE (11/11/2026).
//
// Duas diretrizes da App Store que o site, embrulhado no app, não cumpria:
//  - 1.4.2: calculadora de dose só de fabricante, hospital, universidade, operadora,
//    farmácia ou entidade aprovada. O professor autorizou esconder no app do iPhone a
//    semaglutida em cliques, a levotiroxina por peso e a equivalência de corticoides.
//  - 5.1.2(i): antes de mandar dados a uma IA de terceiros, dizer qual e pedir
//    permissão explícita. Aviso uma vez, na primeira chamada de IA.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - esconder as calculadoras no site ou no Android (a regra é só do app do iPhone);
//  - criar um caminho de IA que não passe por aiRequest (o aviso não apareceria);
//  - mandar a chamada antes do "Concordo", ou guardar a concordância no "Agora não";
//  - prometer no aviso o que o servidor não cumpre (nome, e-mail ou CPF à Anthropic).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

// ---- 1. calculadoras de dose -----------------------------------------------------------------
const lista = (html.match(/var CALC_DOSE_FORA_DO_IOS=\[([^\]]*)\];/) || [])[1] || '';
const ids = [...lista.matchAll(/'([a-z0-9]+)'/g)].map((m) => m[1]);
ok('🧨 as três calculadoras de dose na lista', ['cliques', 'lt4', 'cortic'].every((i) => ids.includes(i)) && ids.length === 3, lista);
ids.forEach((i) => ok('a calculadora ' + i + ' existe em CALCS', new RegExp("\\{id:'" + i + "',name:").test(html)));
ok('🧨 o filtro vale só no app do iPhone', /if\(typeof APP_LOJA!=='undefined'&&APP_LOJA==='ios'\)CALCS=CALCS\.filter\(function\(c\)\{return CALC_DOSE_FORA_DO_IOS\.indexOf\(c\.id\)<0;\}\);/.test(html));
const posCalcs = html.indexOf('var CALCS=[');
const posFiltro = html.indexOf("if(typeof APP_LOJA!=='undefined'&&APP_LOJA==='ios')CALCS=CALCS.filter");
ok('o filtro vem logo depois da definição de CALCS', posCalcs > 0 && posFiltro > posCalcs && !/\nvar CALCS=/.test(html.slice(posFiltro)));
// As telas leem CALCS na hora; nenhuma guarda cópia antes do filtro.
ok('nenhuma cópia de CALCS feita antes do filtro', !/=\s*CALCS\.slice\(|=\s*CALCS;/.test(html.slice(0, posFiltro)));

// ---- 2. consentimento da IA: estrutura ----------------------------------------------------------
ok('🧨 aiRequest pede o consentimento antes de enviar',
  /function aiRequest\(payload\)\{\n\s*return garantirConsentimentoIA\(\)\.then\(function\(\)\{return aiRequestEnviar\(payload\);\}\);\n\}/.test(html));
// Só aiRequestEnviar manda system/prompt ao /api/ai.
const fetchesIA = [...html.matchAll(/fetch\(AI_API_ENDPOINT,[\s\S]{0,400}?\)\s*[;)]/g)].map((m) => m[0]);
ok('há chamadas ao /api/ai para conferir', fetchesIA.length >= 5, String(fetchesIA.length));
const enviar = html.slice(html.indexOf('function aiRequestEnviar(payload){'), html.indexOf('function aiRequestEnviar(payload){') + 1600);
const outras = fetchesIA.filter((f) => !enviar.includes(f.slice(0, 60)) && /\b(system|prompt|documentBase64|imagesBase64)\s*:/.test(f));
ok('🧨 nenhum outro fetch manda texto para a IA sem passar pelo aviso', outras.length === 0, outras.map((f) => f.slice(0, 90)).join(' | '));
ok('o envio de verdade ficou em aiRequestEnviar', /fetch\(AI_API_ENDPOINT,\{/.test(enviar) && /body:JSON\.stringify\(payload\|\|\{\}\)/.test(enviar));

const aviso = (html.match(/bg\.innerHTML='<div class="ia-consent-box">'[\s\S]*?'<\/div>';/) || [''])[0];
ok('o aviso nomeia a Anthropic e o modelo', /Claude, da empresa Anthropic/.test(aviso));
ok('o aviso diz o que é enviado e o que não é', /envia à Anthropic o texto/.test(aviso) && /Nome, e-mail, CPF e dados de pagamento não são enviados/.test(aviso));
ok('o aviso pede para não identificar pacientes', /Não escreva dados que identifiquem pacientes/.test(aviso));
ok('o aviso tem Concordo e Agora não', /data-ia-ok>Concordo</.test(aviso) && /data-ia-nao>Agora não</.test(aviso));
ok('o aviso aponta a política de privacidade', /href="\/privacidade"/.test(aviso));
ok('o aviso fica acima da Questão do Dia e respeita o recuo do relógio',
  /\.ia-consent-bg\{position:fixed;inset:0;z-index:9500;[^}]*padding:max\(1rem,env\(safe-area-inset-top,0px\)\)/.test(html));
const privacidade = fs.readFileSync(path.join(RAIZ, 'privacidade.html'), 'utf8');
ok('a política de privacidade cita a Anthropic', /Anthropic/.test(privacidade));

// O que o aviso promete: o servidor manda à Anthropic só system + messages.
const ai = fs.readFileSync(path.join(RAIZ, 'api', 'ai.js'), 'utf8');
ok('🧨 o servidor não manda identidade do aluno à Anthropic',
  /montarCorpo\(\{ max_tokens: maxTokens, system, messages: \[\{ role: 'user', content \}\] \}/.test(ai) && !/metadata\s*:/.test(ai));

// ---- 2b. nada de "instale na tela inicial" nem web push dentro do app do iPhone -----------
ok('🧨 faixa do Mural vazia no app do iPhone', /function muralPushCtaHTML\(\)\{\n(?:\s*\/\/[^\n]*\n)*\s*if\(typeof APP_LOJA!=='undefined'&&APP_LOJA==='ios'\)return '';/.test(html));
ok('cartão "Tenha o app no celular" só no site', /<div class="so-site"[^>]*>\s*<div[^>]*>📲<\/div>/.test(html));
ok('🧨 web push desligado no app do iPhone (pushSupported falso)', /function pushSupported\(\)\{if\(typeof APP_LOJA!=='undefined'&&APP_LOJA==='ios'\)return false;/.test(html));
ok('cartão de notificações das novidades some no app do iPhone', /id="wn-push-card"/.test(html) && /if\(wpc&&typeof APP_LOJA!=='undefined'&&APP_LOJA==='ios'\)wpc\.style\.display='none';/.test(html));

// ---- 3. consentimento da IA: comportamento ---------------------------------------------------
const ini = html.indexOf("var IA_CONSENT_CHAVE='endo_ia_consent_v1'");
const fimBloco = html.indexOf('function aiRequestEnviar(payload){');
ok('bloco do consentimento encontrado', ini > 0 && fimBloco > ini);
const bloco = html.slice(ini, fimBloco);

function ambiente(appLoja, guardado) {
  const store = {};
  if (guardado) store.endo_ia_consent_v1 = '2026-11-11T00:00:00.000Z';
  const corpo = { filhos: [] };
  function elemento() {
    const botoes = {};
    const el = {
      className: '', id: '', attrs: {}, parentNode: null,
      setAttribute(k, v) { this.attrs[k] = v; },
      set innerHTML(v) {
        this._html = v;
        ['data-ia-ok', 'data-ia-nao'].forEach((k) => {
          if (v.includes(k)) botoes[k] = { ouvintes: [], addEventListener(t, f) { this.ouvintes.push(f); }, focus() {}, clicar() { this.ouvintes.forEach((f) => f()); } };
        });
      },
      get innerHTML() { return this._html; },
      querySelector(sel) { return botoes[sel.replace(/[[\]]/g, '')] || null; },
    };
    return el;
  }
  corpo.appendChild = (el) => { el.parentNode = corpo; corpo.filhos.push(el); };
  corpo.removeChild = (el) => { corpo.filhos = corpo.filhos.filter((x) => x !== el); el.parentNode = null; };
  const enviados = [];
  const ctx = {
    APP_LOJA: appLoja,
    document: { createElement: elemento, body: corpo },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    aiRequestEnviar: (p) => { enviados.push(p); return Promise.resolve('ok'); },
    Promise, Error, Date,
  };
  vm.createContext(ctx);
  vm.runInContext(bloco + '\nthis.aiRequest=aiRequest;this.IA_CONSENT_RECUSA=IA_CONSENT_RECUSA;', ctx);
  return { ctx, corpo, store, enviados, aviso: () => corpo.filhos.find((e) => e.id === 'ia-consent') };
}
const tique = () => new Promise((r) => setImmediate(r));
// Promessa pendurada esvazia o laço de eventos e o Node sai com 0 sem chegar ao fim:
// isso tem de contar como falha.
let terminou = false;
process.on('exit', () => { if (!terminou) { console.log('  ✗ o teste não chegou ao fim (promessa pendurada)'); process.exitCode = 1; } });

(async () => {
  for (const loja of ['', 'android']) {
    const a = ambiente(loja, false);
    const r = await a.ctx.aiRequest({ prompt: 'x' });
    ok('🧨 ' + (loja || 'site') + ': envia sem aviso', r === 'ok' && a.enviados.length === 1 && a.corpo.filhos.length === 0);
  }

  {
    const a = ambiente('ios', false);
    let erro = null, resp = null;
    a.ctx.aiRequest({ prompt: 'caso' }).then((r) => { resp = r; }, (e) => { erro = e; });
    a.ctx.aiRequest({ prompt: 'outro' }).catch(() => {});
    await tique();
    ok('🧨 iPhone: o aviso aparece e nada sai antes da resposta', !!a.aviso() && a.enviados.length === 0);
    ok('duas chamadas ao mesmo tempo abrem um aviso só', a.corpo.filhos.length === 1);
    a.aviso().querySelector('[data-ia-nao]').clicar();
    await tique(); await tique();
    ok('🧨 "Agora não": recusa, não envia e não guarda', erro && erro.message === a.ctx.IA_CONSENT_RECUSA && resp === null && a.enviados.length === 0 && !a.store.endo_ia_consent_v1 && !a.aviso());
    const p = a.ctx.aiRequest({ prompt: 'de novo' });
    await tique();
    ok('depois do "Agora não", a próxima chamada pergunta de novo', !!a.aviso());
    a.aviso().querySelector('[data-ia-ok]').clicar();
    const r = await p;
    ok('🧨 "Concordo": envia e guarda', r === 'ok' && a.enviados.length === 1 && a.enviados[0].prompt === 'de novo' && !!a.store.endo_ia_consent_v1 && !a.aviso());
    const r2 = await a.ctx.aiRequest({ prompt: 'terceira' });
    ok('depois do "Concordo", não pergunta mais', r2 === 'ok' && a.enviados.length === 2 && a.corpo.filhos.length === 0);
  }

  {
    const a = ambiente('ios', true);
    const r = await a.ctx.aiRequest({ prompt: 'x' });
    ok('concordância já guardada no aparelho: envia sem aviso', r === 'ok' && a.enviados.length === 1 && a.corpo.filhos.length === 0);
  }

  terminou = true;
  if (bad) { console.log('\n' + bad + ' falha(s): app do iPhone para a revisão da Apple'); process.exit(1); }
  console.log('app do iPhone para a revisão da Apple: sem calculadora de dose e com consentimento antes da IA: ok');
})().catch((e) => { console.log('  ✗ erro no teste: ' + (e && e.stack || e)); process.exit(1); });
