// Discussão completa no Mural — as duas decisões que NÃO podem regredir.
//
// 1. A discussão não pode viajar no payload de carregamento. São ~12 KB por
//    artigo; nos 200 que as RPCs entregam, seriam ~2,3 MB somados a um payload
//    já em ~4,6 MB. O limite empírico deste projeto é ~5,3 MB — acima dele a
//    resposta DEIXA de chegar e a tela do aluno fica vazia (foi o que obrigou a
//    criar o endodirect_member_resumos). Guardar em tabela própria é o que
//    impede isso.
// 2. Não se gera discussão sem texto integral. Escrita em cima do abstract, ela
//    seria invenção com aparência de análise — o erro de 28/07 nos artigos de
//    Obesidade, em que afirmações verdadeiras "para a classe" não eram o que o
//    ensaio mediu.
'use strict';
const fs = require('fs');
const SRC = fs.readFileSync('/home/user/endodirect/index.html', 'utf8');
const API = fs.readFileSync('/home/user/endodirect/api/admin/refresh-radar.js', 'utf8');
const DISC = fs.readFileSync('/home/user/endodirect/lib/discussao.js', 'utf8');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det !== undefined ? ' — ' + det : '')); };

// ---- 1. o texto fica FORA do payload ---------------------------------------
ok('o servidor grava na tabela própria, não no payload',
   /endodirect_mural_discussoes\?on_conflict=source_id/.test(API));
ok('o servidor NÃO reescreve radar_avisos ao gerar a discussão',
   !/radar_avisos:\s*lista/.test(API), (API.match(/radar_avisos:[^,\n]*/) || [])[0]);
ok('o carregamento traz só os IDs',
   /rpc\('endodirect_mural_discussoes_ids'\)/.test(SRC));
ok('o texto é buscado por artigo, sob demanda',
   /rpc\('endodirect_mural_discussao',\{p_source_id:/.test(SRC));
ok('a busca sob demanda acontece ao ABRIR (evento toggle), não no render',
   /addEventListener\('toggle'/.test(SRC));
ok('não busca duas vezes o mesmo card', /dataset\.discLoaded/.test(SRC));
ok('falha na busca permite nova tentativa (não trava em "carregando")',
   (SRC.match(/d\.dataset\.discLoaded=''/g) || []).length >= 2);

// ---- 2. só onde há texto integral ------------------------------------------
ok('o botão só aparece com link do PMC',
   /function muralTemFullText\(a\)\{[\s\S]{0,200}pmc\\\/articles\\\/PMC/i.test(SRC));
ok('o servidor recusa artigo sem PMC', /if \(!pmcIdFromLink\(item\.link\)\)/.test(API));
ok('a recusa explica o motivo ao professor',
   /seria inventada a partir do resumo/.test(API));
ok('sem texto integral, gerarDiscussao devolve motivo próprio',
   /motivo: 'sem_texto_integral'/.test(DISC));

// ---- 3. o registro do texto -------------------------------------------------
// Regra do professor em 28/07: "Evite termos genéricos de IA."
ok('o prompt proíbe explicitamente o jargão de IA',
   /PROIBIDO/.test(DISC) && /divisor de águas/.test(DISC));
ok('o prompt proíbe número fora do texto fornecido',
   /Nunca escreva um número que não esteja no texto fornecido/.test(DISC));
ok('o prompt manda reproduzir as TABELAS em markdown',
   /Reproduza no corpo da discussão, em markdown/.test(DISC));
ok('o prompt NÃO manda reproduzir a imagem da figura, só descrevê-la',
   /A imagem em si não é reproduzida/.test(DISC));
ok('o prompt proíbe citar figura/tabela inexistente',
   /Nunca cite figura ou tabela que não esteja na lista fornecida/.test(DISC));

// ---- 4. o rodapé que diz de onde veio --------------------------------------
// Sem ele, uma discussão longa passa a impressão de ter sido lida do PDF com as
// figuras à vista.
const { gerarDiscussao } = require('/home/user/endodirect/lib/discussao.js');
ok('gerarDiscussao existe e é função', typeof gerarDiscussao === 'function');
ok('o rodapé declara a licença', /Licença: \$\{|Licença: /.test(DISC));
ok('o rodapé diz que as figuras NÃO foram reproduzidas',
   /não reproduzidas/.test(DISC));

// ---- 5. sem chave/sem rede, degrada sem quebrar ----------------------------
gerarDiscussao('', { titulo: 'x', link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1/' })
  .then((r) => {
    ok('sem chave da IA → devolve motivo, não lança', r && r.ok === false && r.motivo === 'sem_chave_ia', JSON.stringify(r));
    console.log(bad ? '\nFALHOU: ' + bad : '\n✓ discussão do Mural: fora do payload, só com texto integral, com o registro certo');
    process.exit(bad ? 1 : 0);
  });
