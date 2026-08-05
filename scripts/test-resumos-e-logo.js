// Duas quebras que o professor viu no CELULAR em 05/08/2026:
//   (1) a tela de Resumos com o cabeçalho e MAIS NADA;
//   (2) o logo invisível — azul-marinho sobre fundo azul-marinho.
//
// ⚠️ POR QUE (1) ERA MUDO. Os capítulos privados (Resumos e Artigos) só existem
// no servidor: a semente local `REF_GUIDELINES` tem 8 itens e NENHUM `privado`.
// Se a carga falha, a grade fica vazia, o cabeçalho continua na tela e o aluno
// lê "não tem conteúdo". Pior: a chamada dos Resumos estava encadeada no `.then`
// de SUCESSO da chamada anterior (`public_content` / `member_content`, esta já
// em ~5 MB) — uma falha lá pulava os Resumos inteiros, e o erro morria num
// `.catch(function(){})` sem log, sem retentativa e sem aviso.
// Medido em Chromium real: na versão antiga a RPC dos Resumos nem chegava a ser
// chamada (1 tentativa no total); agora são 3 retentativas e a tela explica.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. ⚠️ OS RESUMOS NÃO DEPENDEM DO SUCESSO DA CHAMADA GRANDE -------------
{
  ok('existe uma função única de carga dos Resumos', /function carregarResumos\(client,rpc,tentativa\)/.test(APP));
  ok('⚠️ ela retenta antes de desistir', /if\(tentativa<3\)/.test(APP),
     'uma tentativa só = tela vazia pelo resto da sessão numa rede de celular');
  ok('e marca o estado de falha para a tela saber', /resumosErro=true/.test(APP));
  ok('o sucesso limpa o estado de falha', /resumosErro=false/.test(APP));

  // O ponto crítico: `.catch` ANTES do `.then` que carrega os Resumos, nos dois
  // caminhos (visitante/demo e aluno real). Sem isso volta o acoplamento.
  const trechoPublic = APP.slice(APP.indexOf('function hydratePublicContent'), APP.indexOf('function hydrateRemoteState'));
  const iCatchPub = trechoPublic.indexOf('.catch(');
  const iResuPub = trechoPublic.indexOf('carregarResumos(');
  ok('⚠️ no caminho da demo/visitante os Resumos vêm DEPOIS de um .catch',
     iCatchPub > 0 && iResuPub > iCatchPub,
     'encadeados no .then de sucesso, uma falha anterior pula os Resumos em silêncio');

  const trechoMembro = APP.slice(APP.indexOf("client.rpc('endodirect_member_content')"), APP.indexOf("client.rpc('endodirect_member_content')") + 1400);
  const iCatchMem = trechoMembro.indexOf('.catch(');
  const iResuMem = trechoMembro.indexOf('carregarResumos(');
  ok('⚠️ no caminho do aluno real, idem', iCatchMem > 0 && iResuMem > iCatchMem);

  ok('nenhum .catch mudo sobrou na carga dos Resumos',
     !/carregarResumos[^]{0,200}\.catch\(function\(\)\{\}\)/.test(APP));
}

// ---- 2. ⚠️ A TELA NUNCA FICA VAZIA E CALADA ---------------------------------
{
  const i = APP.indexOf('if(refPrivadoMode&&!subs.length)');
  ok('⚠️ a grade vazia de Resumos tem tratamento próprio', i > 0,
     'sem isto volta o cabeçalho sozinho na tela — foi o que o professor fotografou');
  const bloco = APP.slice(i, i + 1200);
  // ⚠️ A mensagem tem de estar ATRÁS da condição de erro — só procurar o texto
  // deixava passar um `if(false)` com a mensagem inalcançável logo abaixo.
  ok('falha → explica e oferece tentar de novo',
     /if\(resumosErro\)\{/.test(bloco) && /Não foi possível carregar os resumos/.test(bloco) && /btn-resumos-retry/.test(bloco));
  ok('ainda carregando → mostra que está carregando', /!remoteStateLoaded\)return _cab\+/.test(bloco) && /ldHTML\(/.test(bloco));
  ok('o botão de tentar de novo está ligado', /#btn-resumos-retry/.test(APP) && /recarregarResumos\(\)\.then/.test(APP));
  ok('e recarregar escolhe a MESMA RPC do perfil (demo usa showcase)',
     /function recarregarResumos\(\)[^]{0,420}isTestShowcase\(\)\)\?'endodirect_showcase_resumos'/.test(APP));
}

// ---- 3. ⚠️ O LOGO DO CELULAR SEGUE O TEMA -----------------------------------
// No desktop a faixa tem fundo próprio escuro nos dois temas → logo dourado
// sempre. No celular a faixa é transparente: quem manda é o tema. Até 05/08 o
// azul era forçado nos dois e sumia no tema escuro (o padrão).
{
  const i = APP.indexOf('.tb-logo-img{width:30px;height:30px}');
  ok('achei o bloco do logo no celular', i > 0);
  const bloco = APP.slice(i, i + 700);
  ok('⚠️ no celular o padrão é o logo DOURADO (tema escuro)',
     /\.tb-logo-light\{display:inline-block\}/.test(bloco) && /\.tb-logo-dark\{display:none\}/.test(bloco),
     'o azul-marinho sobre o fundo escuro é literalmente invisível');
  ok('⚠️ e o tema CLARO troca para o logo azul',
     /html\[data-theme="light"\] \.tb-logo-light\{display:none\}/.test(bloco)
     && /html\[data-theme="light"\] \.tb-logo-dark\{display:inline-block\}/.test(bloco),
     'sem isto o dourado ficaria ilegível sobre o branco');
  ok('o arquivo dourado é o do tema escuro', /tb-logo-light" src="logo\.png\.png"/.test(APP));
  ok('e o azul é o do tema claro', /tb-logo-dark" src="Icone%20-%20MD%202\.png"/.test(APP));
}

if (bad) { console.error('\n' + bad + ' verificação(ões) de Resumos/logo falharam.'); process.exit(1); }
console.log('Resumos (nunca em branco) e logo do celular: OK');
