// Três acréscimos ao painel do professor, verificados na fonte real do
// index.html: Favoritos como seção própria, calculadoras agrupadas por área e o
// card de perfil profissional no Analytics.
//
// Os defeitos que este teste existe para pegar:
//  1. `renderFavoritos` procurava `#favs-body` por id. Reaproveitá-la no painel
//     do professor com o MESMO id criaria dois elementos homônimos, e o
//     getElementById devolveria o do ALUNO — que está escondido. A lista
//     apareceria vazia sem erro nenhum.
//  2. o agrupamento por área insere títulos dentro de uma grade de 3 colunas
//     (`.g3`). Sem `grid-column:1/-1`, cada título ocuparia uma célula de um
//     terço e a lista sairia intercalada com os cards.
//  3. o percentual do perfil profissional tem de sair sobre quem INFORMOU, não
//     sobre o total de alunos — senão os percentuais não fecham em 100%.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const semComentarios = SRC.replace(/^\s*\/\/.*$/gm, '');

// ---- 1. ⚠️ FAVORITOS NO PAINEL DO PROFESSOR --------------------------------
{
  ok('renderFavoritos aceita o container', /function renderFavoritos\(host\)\{/.test(semComentarios));
  ok('e usa o host quando recebido', /var el=host\|\|document\.getElementById\('favs-body'\)/.test(semComentarios));
  ok('o professor tem container com id PRÓPRIO', SRC.indexOf("id=\"adm-favs-body\"") > 0);
  ok('o id do professor difere do id do aluno', SRC.indexOf('id="adm-favs-body"') !== SRC.indexOf('id="favs-body"'));
  ok('há botão de Favoritos na navegação do professor', /data-asec="favs">⭐ Favoritos/.test(SRC));
  ok('a seção despacha para admFavsHTML', /sec==='favs'\)m\.innerHTML=admFavsHTML\(\)/.test(semComentarios));
  ok('e renderiza a lista no container do professor',
     /sec==='favs'\)\{\s*try\{renderFavoritos\(document\.getElementById\('adm-favs-body'\)\)/.test(semComentarios));
  ok('o título da seção existe', /favs:'Favoritos'/.test(SRC));
  // Ao (des)favoritar com o painel do professor aberto, a lista dele redesenha.
  ok('a estrela redesenha o painel do professor', /getElementById\('adm-favs-body'\);if\(af\)renderFavoritos\(af\)/.test(semComentarios));
}

// ---- 2. ⚠️ CALCULADORAS POR ÁREA -------------------------------------------
{
  ok('o grid é montado por área', /var areas=\[\],porArea=\{\}/.test(semComentarios));
  ok('a ordem das áreas segue a primeira aparição, não alfabética',
     semComentarios.indexOf('areas.sort(') < 0 && /areas\.push\(a\)/.test(semComentarios));
  ok('o card não repete mais a área (já é o título do grupo)',
     semComentarios.indexOf("esc(c.area)+'</div><div style=\"font-size:.71rem") < 0);
  ok('o título do grupo ocupa a linha inteira', /\.calc-area-tit\{grid-column:1\/-1/.test(SRC));
  ok('a sub-grade ocupa a linha inteira', /\.calc-area-grid\{grid-column:1\/-1/.test(SRC));
  ok('a sub-grade colapsa em 1 coluna no celular', /\.g2,\.g3,\.g4,\.calc-area-grid\{grid-template-columns:1fr\}/.test(SRC));
  ok('o grupo mostra a contagem', /porArea\[a\]\.length\+'<\/span>/.test(semComentarios));

  // ---- abas de área acima da lista -----------------------------------------
  ok('há uma aba por área mais a de "Todas"', /data-calcarea=""/.test(semComentarios) && /data-calcarea="'\+esc\(a\)\+'"/.test(semComentarios));
  ok('a aba mostra a contagem', /calc-pill-n">'\+ix\.porArea\[a\]\.length/.test(semComentarios));
  ok('clicar na aba filtra e redesenha', /calcAreaFiltro=b\.getAttribute\('data-calcarea'\)\|\|'';renderCalcGrid\(\)/.test(semComentarios));
  // ⚠️ Trocar de aba NÃO pode fechar a calculadora aberta: apagaria o resultado
  // que a pessoa está lendo. renderCalcGrid só mexe no grid, nunca em activeCalc.
  ok('o filtro não mexe em activeCalc',
     (function(){
       const i = semComentarios.indexOf('function renderCalcGrid()');
       const j = semComentarios.indexOf('\nfunction ', i + 1);   // até o fim DESTA função
       return i > 0 && j > i && semComentarios.slice(i, j).indexOf('activeCalc=') < 0;
     })());
  ok('com uma área filtrada o título do grupo não repete a aba', /calcAreaFiltro\?'':'<div class="calc-area-tit">/.test(semComentarios));
  ok('área inexistente cai em "Todas"', /ix\.areas\.indexOf\(calcAreaFiltro\)<0\)calcAreaFiltro=''/.test(semComentarios));
  // ⚠️ `min-width:0` na faixa de abas. Em tela estreita o .pill-tab-row vira
  // nowrap + overflow-x:auto; como item de grade, o padrão `min-width:auto` faz
  // o item se recusar a encolher abaixo do conteúdo, e as 9 abas em linha única
  // empurravam a GRADE INTEIRA para além da largura da tela — descrições dos
  // cards cortadas à direita no iPhone. Sem esta regra o defeito volta, e volta
  // sem erro nenhum: só quebra o layout no celular.
  ok('a faixa de abas ocupa a linha inteira E pode encolher',
     /\.calc-pills-wrap\{grid-column:1\/-1;min-width:0\}/.test(SRC));
  ok('a sub-grade também pode encolher', /\.calc-area-grid\{min-width:0\}/.test(SRC));
  ok('a faixa de abas não passa da largura do container', /\.calc-pills\{margin:0 0 \.35rem;max-width:100%\}/.test(SRC));
  ok('as abas rolam na horizontal no celular', /\.pill-tab-row\{overflow-x:auto;flex-wrap:nowrap/.test(SRC));

  // ---- ⚠️ A COR VEM DO MURAL, não de uma paleta nova ------------------------
  // Agora que as áreas são as subespecialidades, inventar cor aqui faria Lípides
  // ser vermelho no Mural e outra coisa nas Calculadoras. `muralSubMeta` é a
  // fonte única — se alguém trocar por um mapa local, a leitura de cor deixa de
  // valer entre as telas e nada quebra visivelmente para avisar.
  ok('o card usa muralSubMeta', /var meta=muralSubMeta\(a\);/.test(semComentarios));
  ok('não há paleta local nas calculadoras',
     (function(){
       const i = semComentarios.indexOf('function renderCalcGrid()');
       const j = semComentarios.indexOf('\nfunction ', i + 1);
       const b = semComentarios.slice(i, j);
       // Cor hexadecimal literal — `'#calc-grid'` é seletor, não cor.
       return !/#[0-9a-f]{3}\b|#[0-9a-f]{6}\b/i.test(b) && b.indexOf('CORES') < 0;
     })());
  ok('o card recebe a classe de cor', /class="card calc-card'\+meta\.card\+'"/.test(semComentarios));
  ok('a aba e o título têm o ponto colorido',
     /<i class="calc-dot '\+muralSubMeta\(a\)\.tag\+'"><\/i>/.test(semComentarios)
     && /<i class="calc-dot '\+meta\.tag\+'"><\/i>/.test(semComentarios));
  // A borda existe SEMPRE, mesmo sem cor mapeada: sem ela os grupos ficariam
  // com alinhamento diferente entre si.
  ok('a borda do card é declarada com fallback neutro', /\.calc-card\{border-left:3px solid var\(--bd2\)\}/.test(SRC));
  ok('o ponto herda a cor da classe de subespecialidade', /\.calc-dot\{display:inline-block/.test(SRC));

  // ---- ⚠️ AS ÁREAS SÃO AS SUBESPECIALIDADES, não rótulos de disciplina -------
  // Reatribuição ditada pelo professor (29/07), calculadora a calculadora. As
  // áreas antigas ("Risco cardiovascular", "Antropometria", "Lipidologia",
  // "Função renal", "Fígado (MASLD)", "Crescimento") eram nomes de assunto e não
  // batiam com as subespecialidades do resto da plataforma — o aluno procurava
  // FIB-4 em Obesidade e não achava.
  const bloco = SRC.slice(SRC.indexOf('var CALCS=['), SRC.indexOf('\n];', SRC.indexOf('var CALCS=[')));
  const areaDe = {};
  const re = /\{id:'([^']+)',name:'[^']*',area:'([^']*)'/g;
  let m;
  while ((m = re.exec(bloco))) areaDe[m[1]] = m[2];

  const esperado = {
    prevent: 'Lípides', prevent30: 'Lípides', ldl: 'Lípides',
    imc: 'Obesidade', pep: 'Obesidade', sophia: 'Obesidade', fib4: 'Obesidade',
    bsa: 'Endocrinologia Pediátrica', alvo: 'Endocrinologia Pediátrica', zha: 'Endocrinologia Pediátrica',
    velcresc: 'Endocrinologia Pediátrica', idcorr: 'Endocrinologia Pediátrica',
    ckdepi: 'Diabetes', drc: 'Diabetes', homa: 'Diabetes',
    nacorr: 'Distúrbios hidroeletrolíticos', osmol: 'Distúrbios hidroeletrolíticos',
    cacorr: 'Osteometabolismo', trp: 'Osteometabolismo', tmpgfr: 'Osteometabolismo', frax: 'Osteometabolismo',
    cortic: 'Adrenal', lt4: 'Tireoide'
  };
  Object.keys(esperado).forEach(function (id) {
    ok('"' + id + '" está em ' + esperado[id], areaDe[id] === esperado[id], String(areaDe[id]));
  });
  ok('as 23 calculadoras estão mapeadas', Object.keys(areaDe).length === 23, String(Object.keys(areaDe).length));
  ['Risco cardiovascular', 'Antropometria', 'Lipidologia', 'Função renal', 'Fígado (MASLD)', 'Crescimento'].forEach(function (velha) {
    ok('nenhuma calculadora ficou em "' + velha + '"',
       Object.keys(areaDe).every(function (id) { return areaDe[id] !== velha; }));
  });
}

// ---- 3. ⚠️ PERFIL PROFISSIONAL NO ANALYTICS --------------------------------
{
  ok('busca a RPC do perfil', /rpc\('endodirect_admin_overview_perfil'\)/.test(semComentarios));
  ok('falha da RPC não derruba o Analytics', /catch\(function\(\)\{admPerfilPro=null;\}\)/.test(semComentarios));
  ok('o card entra na página antes da origem geográfica',
     semComentarios.indexOf("+perfilHtml\n  +geoHtml") > 0);
  // O denominador é quem informou.
  ok('o percentual usa comPerfil como denominador', /comPerfil\?Math\.round\(n\(x\.n\)\/comPerfil\*100\)/.test(semComentarios));
  ok('e não usa o total de alunos', semComentarios.indexOf('n(x.n)/n(ov.alunos)') < 0);
  ok('quem não informou é declarado', /aluno\(s\) sem esse campo/.test(SRC));
  ok('há estado vazio explicando de onde vem o dado', /Ainda sem perfil informado/.test(SRC));
  ok('os quatro perfis têm cor', /'Endocrinologista':'var\(--blue\)'/.test(SRC) && /'Residente':'var\(--grn\)'/.test(SRC)
     && /'Estudante':'var\(--gold\)'/.test(SRC) && /'Outros':'var\(--pur\)'/.test(SRC));
}

// ---- 4. o `extra` das calculadoras (gráfico/tabela) ------------------------
{
  ok('calcUpdate chama o extra', /typeof c\.extra==='function'/.test(semComentarios));
  ok('erro no extra não derruba o número', /try\{extra=c\.extra\(s,v\)\|\|'';\}catch\(e\)\{extra='';\}/.test(semComentarios));
  ok('o extra é anexado depois do resultado', /<\/span><\/div><\/div>'\+extra;/.test(semComentarios));
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ painel do professor: Favoritos com container próprio, calculadoras por área, perfil profissional sobre quem informou');
process.exit(bad ? 1 : 0);
