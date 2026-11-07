// A TELA DE CURSOS DO ALUNO NAVEGA COMO A DO PROFESSOR.
//
// ⚠️ 02/09/2026. O professor, com a tela à vista: *"aparecer os subtemas apenas
// quando clicar no curso. E ao clicar no curso, desaparecer os demais cursos.
// Se espelhe no painel do professor."* A tela do aluno mostrava a grade de
// cursos E as subespecialidades ao mesmo tempo; a do professor (admCursosHTML)
// já era hierárquica: nível 0 só cursos, nível 1 subespecialidades do curso
// escolhido, nível 2 aulas — com volta em cada degrau.
//
// 🧨 O MODO DE QUEBRAR ISTO É PERDER A VOLTA. Esconder a grade sem oferecer o
// caminho de volta prende o aluno dentro de um curso: nenhum erro, nenhuma tela
// branca, só um beco. Por isso cada degrau é medido junto com a sua saída.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}
const render = corpo('renderCursosAluno');

// ── 1. A grade de cursos depende de NÃO haver curso escolhido ─────────────
{
  ok(/frow\.innerHTML=cursoFilter\?''/.test(render),
    '🧨 a grade de cursos voltou a ser desenhada com um curso já aberto — os outros cursos reaparecem embaixo das subespecialidades');
  ok(/Escolha um curso para abrir/.test(render),
    '⚠️ sumiu o rótulo do nível 0, que é o mesmo do painel do professor');
  ok(/if\(!cursoFilter\)\{el\.innerHTML='';return;\}/.test(render),
    '⚠️ o nível 0 voltou a escrever algo abaixo da grade — ali a grade é o conteúdo');
}

// ── 2. Cada degrau tem a sua saída ───────────────────────────────────────
// Sem isso o aluno entra num curso e não sai.
{
  ok(/data-cursobackcursos[^>]*>← Voltar aos cursos/.test(render),
    '🧨 o nível das subespecialidades ficou sem volta para a grade de cursos — o aluno fica preso dentro do curso');
  ok(/data-cursoback [^>]*>← '\+esc\(cursoNomeBySlug\(cursoFilter\)\)/.test(render),
    '🧨 a volta do nível das aulas deixou de nomear o curso (o painel do professor nomeia)');

  const disp = html.slice(html.indexOf('function dispatchClick'), html.indexOf('function dispatchClick') + 6000);
  const alvo = disp || html;
  const iBack = alvo.indexOf("c('[data-cursobackcursos]')");
  const iMod = alvo.indexOf("c('[data-cursoback]')");
  ok(iBack > 0, '🧨 ninguém trata `data-cursobackcursos` — o botão "Voltar aos cursos" seria decorativo');
  ok(/cursoFilter='';cursoMod=''/.test(alvo.slice(iBack, iBack + 160)),
    '🧨 a volta aos cursos não limpa `cursoFilter` — a grade continuaria escondida');
  ok(iMod > 0 && /cursoMod='';renderCursosAluno/.test(alvo.slice(iMod, iMod + 120)),
    '⚠️ a volta às subespecialidades parou de limpar apenas o módulo');
}

// ── 3. O cabeçalho do curso, como no painel do professor ─────────────────
{
  ok(/cursoCapaHTML\(cnome,cursoFilter,ccat&&ccat\.capa,44,false\)/.test(render),
    '⚠️ o nível das subespecialidades perdeu a capa do curso no cabeçalho — o painel do professor mostra');
  ok(/esc\(cnome\)/.test(render), '⚠️ o nome do curso sumiu do cabeçalho');
}

// ── 4. O convite ao plano sobrevive à mudança ────────────────────────────
// Ele mora nos dois níveis; esconder a grade não pode tê-lo levado junto.
{
  ok((render.match(/cursoAmostraCTA\(cursoFilter\)/g) || []).length === 2,
    '🧨 o convite ao plano ficou em ' + (render.match(/cursoAmostraCTA\(cursoFilter\)/g) || []).length + ' dos 2 níveis — a isca do funil perde o pedido');
}

// ── 5. O cartão da aula não repete o que a tela já diz ───────────────────
// Pedido do professor (02/09): tirar, de baixo do título da aula, o selo com o
// nome do curso e o com a subespecialidade. O cartão só existe no nível 2 —
// onde o botão de voltar JÁ nomeia o curso e o cabeçalho JÁ nomeia a
// subespecialidade. Eram três vezes a mesma informação.
{
  const i = html.indexOf('  function lessonCard(c){');
  const cartao = html.slice(i, html.indexOf('\n  }', i));
  ok(i > 0 && cartao.length > 200, '⚠️ não consegui recortar `lessonCard` — as medidas abaixo mediriam o arquivo inteiro');
  ok(!/cursoNomeBySlug\(c\.curso\)/.test(cartao),
    '🧨 voltou o selo com o nome do curso embaixo do título da aula — a volta acima já nomeia o curso');
  ok(!/esc\(c\.modulo\)/.test(cartao),
    '🧨 voltou o selo da subespecialidade embaixo do título da aula — o cabeçalho acima já a nomeia');
  // 07/11/2026, pedido do professor: "Retirar descrição da aula e tempo de duração.
  // Aparecer descrição apenas quando clicar na aula". O cartão não mostra mais nem a
  // duração nem a descrição; a descrição aparece no player, embaixo do vídeo.
  ok(!/c\.dur\b/.test(cartao), '🧨 a duração voltou ao cartão da aula — o professor pediu para tirar');
  ok(!/c\.desc\b/.test(cartao), '🧨 a descrição voltou ao cartão da aula — ela só aparece ao clicar na aula');
  const pl = html.indexOf('function renderAulaPlayer(){');
  ok(pl > 0 && /\(c\.desc\?'<div style="font-size:\.78rem;color:var\(--t2\);line-height:1\.6;margin-top:\.6rem">'\+esc\(c\.desc\)/.test(html.slice(pl, pl + 2600)),
    '⚠️ a descrição sumiu também do player — ela tem de aparecer quando o aluno clica na aula');
  // O que fica no cartão: amostra grátis e concluída.
  ok(/Amostra grátis/.test(cartao),
    '🧨 o selo de amostra grátis saiu junto: o não-assinante deixaria de saber por que aquela aula abre');
  ok(/✓ concluída/.test(cartao), '⚠️ o selo de aula concluída saiu junto');

  // O painel do professor é outra tela e não foi tocado.
  const a2 = html.indexOf('function admLessonCard(c){');
  ok(/cursoNomeBySlug\(c\.curso\)/.test(html.slice(a2, a2 + 2600)),
    '⚠️ os selos sumiram também do cartão do PROFESSOR — ali eles não foram pedidos');
}

// ── 6. Aula aberta: só a aula na tela, a volta em cima (07/11/2026) ──────
// Pedido do professor: "tirar essas aulas do campo inferior e jogar o botão de retornar
// educação médica continuada para o canto superior esquerdo".
{
  const fatia = (nome) => { const i = html.indexOf('function ' + nome + '('); return i < 0 ? '' : html.slice(i, html.indexOf('\n}', i)); };
  ok(/box\.style\.display='block';cursoMostrarLista\(false\);renderAulaPlayer\(\);/.test(fatia('playCursoAluno')),
    '🧨 abrir a aula voltou a deixar a lista de aulas embaixo do player');
  const mostra = fatia('cursoMostrarLista');
  ok(/fr\.style\.display=mostrar\?'flex':'none'/.test(mostra) && /li\.style\.display=mostrar\?'':'none'/.test(mostra),
    '⚠️ cursoMostrarLista não esconde/mostra a grade e a lista de aulas');
  const pl = fatia('renderAulaPlayer');
  ok(/box\.innerHTML='<button class="dir-back" id="curso-player-back"[^>]*>← '\+esc\(cursoNomeBySlug\(c\.curso\)\)\+'<\/button>'\s*\+'<div class="card">'/.test(pl),
    '🧨 a volta "← <curso>" saiu de cima do player (o professor pediu no canto superior esquerdo)');
  const fecha = fatia('fecharAulaAluno');
  ok(/if\(voltarAoCurso\)cursoMod='';/.test(fecha) && /cursoMostrarLista\(true\);/.test(fecha) && /renderCursosAluno\(\)/.test(fecha),
    '⚠️ fechar a aula não devolve a lista (ou a volta não leva às subespecialidades do curso)');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ navegação de cursos: nível 0 só a grade, nível 1 as subespecialidades do curso aberto, nível 2 as aulas — cada degrau com a sua volta');
