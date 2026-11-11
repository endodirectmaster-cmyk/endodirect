#!/usr/bin/env node
// SESSÃO: 6 HORAS SEM USO E ENTÃO A JANELA "PERMANECER CONECTADO" (11/11/2026).
//
// Pedido do professor: "vamos aumentar o tempo de permanência de login na plataforma. Acho
// que dá para deixar 6 horas e após isso gerar a janela se deseja permanecer conectado."
// Antes eram 30 minutos. A janela dá 60 s para responder; sem resposta, sai.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o tempo voltar a 30 min (ou qualquer outro) sem decisão do professor;
//  - a janela sumir e a sessão cair direto, sem perguntar;
//  - "Permanecer conectado" deixar de zerar o relógio.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };

ok('🧨 6 horas sem uso até a janela', /var SESSION_IDLE_MS=6\*60\*60\*1000,SESSION_COUNTDOWN_S=60;/.test(html));
ok('janela pergunta se deseja permanecer conectado e diz o tempo', /id="session-modal"[\s\S]{0,400}sem usar a plataforma há 6 horas[\s\S]{0,200}Deseja permanecer conectado\?/.test(html));
ok('🧨 botões "Permanecer conectado" e "Sair" na janela', /id="btn-session-stay"[^>]*>Permanecer conectado</.test(html) && /id="btn-session-logout"/.test(html));

// O vigia, rodando: antes de 6 h não abre; depois de 6 h abre; "Permanecer" zera.
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}
let agora = 1e12, tique = null, abriu = 0;
const modal = { style: { display: 'none' } };
const ctx = {
  Date: { now: () => agora }, currentUser: { id: 'u' },
  setInterval: (f) => { tique = f; return 1; }, clearInterval: () => {},
  document: { getElementById: (id) => (id === 'session-modal' ? modal : { textContent: '' }) },
  doLogout: () => {}, notify: () => {},
};
vm.createContext(ctx);
vm.runInContext((html.match(/var SESSION_IDLE_MS=[^\n]*\n/) || [''])[0] + 'var sessionLastActivity=Date.now(),sessionCountdownTimer=null,sessionWatcher=null;\n'
  + ['markSessionActivity', 'startSessionWatcher', 'showSessionWarning', 'hideSessionWarning', 'keepSessionAlive'].map(corpo).join('\n'), ctx);
vm.runInContext('startSessionWatcher()', ctx);
agora += 5 * 3600 * 1000 + 59 * 60 * 1000; tique();
ok('🧨 5 h 59 min sem uso: a janela não abre', modal.style.display === 'none');
agora += 60 * 1000; tique();
ok('🧨 6 h sem uso: a janela abre', modal.style.display === 'flex');
vm.runInContext('keepSessionAlive()', ctx);
ok('"Permanecer conectado" fecha a janela', modal.style.display === 'none');
agora += 3 * 3600 * 1000; tique();
ok('"Permanecer conectado" zera o relógio (3 h depois, nada)', modal.style.display === 'none');

if (bad) { console.log('\n' + bad + ' falha(s): sessão por inatividade'); process.exit(1); }
console.log('✓ sessão: 6 h sem uso e então a janela "Permanecer conectado" (60 s para responder)');
