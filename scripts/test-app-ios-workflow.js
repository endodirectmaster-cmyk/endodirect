#!/usr/bin/env node
// APP DO IPHONE COMPILADO E ENVIADO PELO GITHUB ACTIONS (10/11/2026).
//
// O Mac do professor (MacBook Air 2019, Intel, macOS Sonoma) não roda o Xcode 26, que a
// App Store exige desde 28/04/2026. Ele escolheu o "Caminho 1": compilar num Mac do
// GitHub e enviar ao TestFlight daqui (.github/workflows/app-ios.yml).
//
// 🧨 O repositório e os logs são PÚBLICOS. Os modos de quebrar isto em silêncio:
//  - pôr `push`/`pull_request` no gatilho (todo push gastaria build e, no pior caso,
//    enviaria à Apple sem ninguém pedir);
//  - usar action de terceiros, ou action oficial sem fixar o commit;
//  - expor os segredos fora dos passos do modo testflight, imprimir a chave ou
//    esquecer de apagar o arquivo .p8;
//  - apagar o esquema compartilhado (sem ele, `xcodebuild -scheme App archive` não acha
//    o esquema numa máquina que nunca abriu o projeto no Xcode).
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const wf = fs.readFileSync(path.join(RAIZ, '.github', 'workflows', 'app-ios.yml'), 'utf8');
const semComent = wf.replace(/^\s*#.*$/gm, '');

// ---- 1. gatilho e permissões -------------------------------------------------------------
const blocoOn = (semComent.match(/^on:\n([\s\S]*?)^\S/m) || [])[1] || '';
ok('🧨 só disparo manual (workflow_dispatch)', /^\s{2}workflow_dispatch:/m.test(blocoOn) && !/^\s{2}(push|pull_request|pull_request_target|schedule|workflow_run|release):/m.test(blocoOn), blocoOn.slice(0, 120));
ok('modos compilar e testflight, padrão compilar', /default: compilar/.test(wf) && /- compilar/.test(wf) && /- testflight/.test(wf));
ok('permissão mínima (contents: read)', /^permissions:\n\s+contents: read\s*$/m.test(semComent));
ok('runner macOS com tempo-limite', /runs-on: macos-\d+/.test(wf) && /timeout-minutes: \d+/.test(wf));

// ---- 2. actions ------------------------------------------------------------------------
const usos = [...semComent.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
ok('há actions de checkout e setup-node', usos.some((u) => u.startsWith('actions/checkout@')) && usos.some((u) => u.startsWith('actions/setup-node@')));
ok('🧨 nenhuma action de terceiros', usos.every((u) => u.startsWith('actions/')), usos.join(', '));
ok('🧨 actions fixadas por commit (40 hex)', usos.every((u) => /@[0-9a-f]{40}$/.test(u)), usos.join(', '));
ok('checkout sem guardar credencial', /persist-credentials: false/.test(wf));

// ---- 3. segredos ---------------------------------------------------------------------------
// Cada passo começa em "      - " (6 espaços). Os segredos só podem aparecer em passos
// com `if: inputs.modo == 'testflight'`.
const passos = wf.split(/\n(?=      - )/).slice(1);
const comSegredo = passos.filter((p) => /\$\{\{\s*secrets\./.test(p));
ok('os segredos são usados', comSegredo.length >= 2);
ok('🧨 segredos só nos passos do modo testflight', comSegredo.every((p) => /if: inputs\.modo == 'testflight'/.test(p)));
['APPLE_TEAM_ID', 'ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8'].forEach((s) => ok('segredo ' + s + ' lido do cofre do GitHub', new RegExp('\\$\\{\\{ secrets\\.' + s + ' \\}\\}').test(wf)));
ok('🧨 chave .p8 em arquivo temporário restrito e apagado no fim',
  /umask 077/.test(wf) && /KEY="\$RUNNER_TEMP\/AuthKey_\$\{ASC_KEY_ID\}\.p8"/.test(wf) && /trap 'rm -f "\$KEY"' EXIT/.test(wf));
ok('🧨 nada de set -x nem de imprimir a chave', !/set -x/.test(semComent) && !/(cat|echo|printf)[^\n]*\$\{?ASC_KEY_P8\}?[^\n]*$/m.test(semComent.replace(/printf '%s\\n' "\$ASC_KEY_P8" > "\$KEY"/, '')));
ok('formato dos segredos conferido antes de usar', /BEGIN PRIVATE KEY/.test(wf) && /\^\[A-Z0-9\]\{10\}\$/.test(wf));

// ---- 4. compilação e envio ---------------------------------------------------------------
ok('Xcode 26 estável mais novo do runner', /Xcode_26\*\.app/.test(wf) && /beta\|release_candidate/.test(wf) && /xcode-select -s/.test(wf));
ok('npm ci + cap sync antes de compilar', /npm ci\n\s+npx cap sync ios/.test(wf));
ok('modo compilar: sem assinatura', /CODE_SIGNING_ALLOWED=NO build/.test(wf));
ok('🧨 modo compilar confere a permissão do Entrar com a Apple no app assinado localmente',
  /CODE_SIGN_IDENTITY=- AD_HOC_CODE_SIGNING_ALLOWED=YES/.test(wf) && /codesign -d --entitlements - --xml "\$APP"/.test(wf) && /grep -q 'com\.apple\.developer\.applesignin'/.test(wf));
ok('🧨 o arquivo do testflight leva a permissão (assinatura local, não CODE_SIGNING_ALLOWED=NO)',
  /"\$\{BASE\[@\]\}" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY=- AD_HOC_CODE_SIGNING_ALLOWED=YES PROVISIONING_PROFILE_SPECIFIER= archive/.test(wf) && !/CODE_SIGNING_ALLOWED=NO archive/.test(wf));
ok('envio direto ao App Store Connect (cloud signing)', /<key>method<\/key><string>app-store-connect<\/string>/.test(wf) && /<key>destination<\/key><string>upload<\/string>/.test(wf) && /<key>signingStyle<\/key><string>automatic<\/string>/.test(wf));
ok('número do build cresce a cada execução', /BUILD: \$\{\{ github\.run_number \}\}/.test(wf) && /CURRENT_PROJECT_VERSION="\$BUILD"/.test(wf));
ok('autenticação pela chave da API', /-authenticationKeyPath "\$KEY" -authenticationKeyID "\$ASC_KEY_ID" -authenticationKeyIssuerID "\$ASC_ISSUER_ID"/.test(wf));

// ---- 5. projeto do Xcode -----------------------------------------------------------------
const pbx = fs.readFileSync(path.join(RAIZ, 'app-ios', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'), 'utf8');
const alvo = (pbx.match(/([0-9A-F]{24}) \/\* App \*\/ = \{\s*isa = PBXNativeTarget;/) || [])[1];
const esquemaArq = path.join(RAIZ, 'app-ios', 'ios', 'App', 'App.xcodeproj', 'xcshareddata', 'xcschemes', 'App.xcscheme');
ok('🧨 esquema compartilhado App.xcscheme existe', fs.existsSync(esquemaArq));
if (fs.existsSync(esquemaArq)) {
  const esq = fs.readFileSync(esquemaArq, 'utf8');
  ok('o esquema aponta para o target App do projeto', !!alvo && esq.includes('BlueprintIdentifier = "' + alvo + '"') && esq.includes('ReferencedContainer = "container:App.xcodeproj"'), 'target ' + alvo);
  ok('o esquema arquiva em Release', /<ArchiveAction\s+buildConfiguration = "Release"/.test(esq));
}
ok('Info.plist lê versão e build do projeto', /<key>CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/.test(fs.readFileSync(path.join(RAIZ, 'app-ios', 'ios', 'App', 'App', 'Info.plist'), 'utf8')));

if (bad) { console.log('\n' + bad + ' falha(s): app iOS pelo GitHub Actions'); process.exit(1); }
console.log('app iOS pelo GitHub Actions: só manual, actions fixadas, segredos só no envio, esquema compartilhado: ok');
