#!/usr/bin/env node
// PERFIL DO ALUNO: SEM BURACO E COM "ASSINATURA E CONTA" NUM CARTÃO SÓ (16/11/2026). Professor, com prints do app:
// "Ficou um buraco aí no painel do aluno entre o Face ID e esse plano Gold. Já que tem a opção de cancelar a
// assinatura, ainda assim é necessário deixar lá embaixo essa janela de excluir a conta? Não dá para condensar os
// dois numa coisa só?"
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - voltar a empilhar blocos .pc soltos acima do corpo do Perfil (o padding de baixo de cada um é o buraco);
//  - voltar o cartão "Seu plano" duplicado (o plano já está em "Assinatura e conta");
//  - o Face ID ser desenhado antes de o corpo existir (o lugar dele agora é dentro do corpo: não apareceria);
//  - a exclusão da conta sumir ou ficar escondida: a App Store e o Google Play exigem o botão no app, à vista;
//  - confirmar a exclusão sem mostrar antes o que é apagado;
//  - o link da página pública /excluir-conta perder o alvo (#perfil-excluir).
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  let i = html.indexOf('{', ini), prof = 0, q = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return html.slice(ini + 1, i + 1);
}
const painel = (html.match(/<div class="panel" id="panel-perfil">[\s\S]*?<div id="perfil-body"><\/div>/) || [''])[0];
ok('🧨 nada de bloco .pc solto entre o título e o corpo do Perfil (era o buraco)', painel && !/class="pc"/.test(painel), painel.slice(0, 200));
ok('🧨 sem o cartão "Seu plano" duplicado', !/id="perfil-plan-card"/.test(html) && !/getElementById\('perfil-plan-card'\)/.test(html));

const rp = corpo('renderPerfil');
const desenha = rp.indexOf('body.innerHTML='), face = rp.lastIndexOf('faceIdPerfilRender()');
ok('🧨 o Face ID é desenhado depois do corpo (o lugar dele está no corpo)', desenha > 0 && face > desenha && rp.indexOf('faceIdPerfilRender()') > desenha);
ok('ordem: Tema, Face ID, Assinatura e conta, Newsletter', /themeCardHTML\(\)\+'<div id="perfil-faceid" style="display:none;margin-top:1rem"><\/div>'\+assinaturaCard\+nlCard\)/.test(rp));
ok('🧨 cartão único "Assinatura e conta" com a exclusão dentro (sem cartão de exclusão separado)', /💳 Assinatura e conta/.test(rp) && /\(podeExcluirConta\(\)\?excluirContaCardHTML\(\):''\)\+'<\/div>';/.test(rp) && !/excluirCard/.test(rp));
ok('cancelar assinatura continua no cartão', /id="btn-pf-cancel-sub">Cancelar assinatura/.test(rp));

const ex = corpo('excluirContaCardHTML');
const p1 = (ex.match(/<div id="pf-excluir-passo1">[\s\S]*?<\/div>/) || [''])[0];
ok('🧨 "Excluir minha conta" à vista (exigência das lojas), sem estar escondido', /id="btn-pf-excluir"[^>]*>Excluir minha conta</.test(p1) && !/display:none/.test(p1));
ok('🧨 alvo do link da página /excluir-conta preservado', /id="perfil-excluir"/.test(ex) && /getElementById\('perfil-excluir'\)/.test(rp));
const p2 = ex.slice(ex.indexOf('pf-excluir-passo2'));
ok('🧨 o que é apagado aparece antes de confirmar (no 2º passo, junto da confirmação)', /Não dá para desfazer/.test(p2) && /Saem o login/.test(p2) && /registro dos pagamentos/.test(p2) && p2.indexOf('Saem o login') < p2.indexOf('btn-pf-excluir-ok'));
ok('confirmação por digitação continua', /Para confirmar, digite <b>EXCLUIR<\/b>/.test(p2) && /function excluirContaConfirmada/.test(html));
ok('botão de excluir em vermelho; faixa separada dentro do cartão', /\.pf-excluir \.pf-excluir-bt\{color:var\(--red\)/.test(html) && /\.pf-excluir\{margin-top:[^}]*border-top:1px solid var\(--bd\)/.test(html));
ok('newsletter em 2 colunas no celular', /grid-template-columns:repeat\(auto-fill,minmax\(140px,1fr\)\);gap:\.5rem;margin-bottom:\.85rem">'\+nlBoxes/.test(rp));

if (bad) { console.log('✗ perfil do aluno: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ perfil do aluno: sem buraco, sem "Seu plano" duplicado, Face ID depois do Tema, "Assinatura e conta" num cartão com "Excluir minha conta" à vista e o que é apagado antes de confirmar');
