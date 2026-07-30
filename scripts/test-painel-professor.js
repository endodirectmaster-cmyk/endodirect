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
