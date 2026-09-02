// TODA TELA TEM UMA PORTA.
//
// 🧨 POR QUE ESTE TESTE EXISTE (02/09/2026). O professor tentou trocar a capa do
// curso e respondeu: *"não está aparecendo a opção de enviar imagem"*. Não
// estava mesmo — e o problema era maior do que a capa. A tela de **Catálogo de
// cursos** (nome, preço, pacote, ordem, o interruptor **Ativo** e a capa) era
// lida em `admCursoSubtab==='catalogo'` e esse valor **nunca era escrito em
// lugar nenhum**: não havia botão, link ou atalho que o pusesse. A tela existia
// inteira — render, salvamento, validador de URL — e nunca teve porta. O
// histórico do repositório confirma: `data-csub="catalogo"` nunca existiu.
//
// ⚠️ ISSO NÃO QUEBRA NADA. Nenhum erro, nenhum teste vermelho, nenhuma tela em
// branco: só uma parte do painel que ninguém alcança. Passa despercebido para
// sempre — e, pior, eu mesma mandei o professor clicar em "Cursos → Catálogo"
// numa mensagem, sem ter conferido que o caminho existia.
//
// A REGRA: todo valor de aba que o código LÊ tem de poder ser ESCRITO — por
// atribuição direta, por um atributo `data-…` no markup, ou por uma lista de
// botões montada por concatenação.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const kebab = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

// Variáveis de aba/subtela: as que aparecem em comparação com string literal.
const nomes = new Set();
for (const m of html.matchAll(/\b([A-Za-z_$][\w$]*(?:Subtab|Tab|Aba))\s*[=!]==\s*'/g)) nomes.add(m[1]);
ok(nomes.size >= 3, '⚠️ a varredura não encontrou variáveis de aba (achou ' + nomes.size + ') — o padrão mudou e este teste virou decorativo');

const semPorta = [];
for (const v of [...nomes].sort()) {
  const lidos = new Set(), escritos = new Set(), attrs = new Set();
  for (const m of html.matchAll(new RegExp('\\b' + v + "\\s*[=!]==\\s*'([^']*)'", 'g'))) lidos.add(m[1]);
  for (const m of html.matchAll(new RegExp('\\b' + v + "\\s*=\\s*'([^']*)'", 'g'))) escritos.add(m[1]);
  // Atribuição dinâmica: `v=b.dataset.csub` ou `v=b.getAttribute('data-aulatab')`.
  for (const m of html.matchAll(new RegExp('\\b' + v + "\\s*=\\s*[\\w.$]*\\.dataset\\.(\\w+)", 'g'))) attrs.add('data-' + kebab(m[1]));
  for (const m of html.matchAll(new RegExp('\\b' + v + "\\s*=\\s*[\\w.$]*\\.getAttribute\\('([^']+)'\\)", 'g'))) attrs.add(m[1]);

  const viaDom = new Set();
  for (const a of attrs) for (const m of html.matchAll(new RegExp(a + '="([^"\'+]*)"', 'g'))) viaDom.add(m[1]);
  // ⚠️ O ATRIBUTO PODE SER MONTADO POR CONCATENAÇÃO — `data-aulatab="'+t[0]+'"`,
  // com os valores numa lista de pares. Foi assim que a varredura de órfãos de
  // 30/08 quase acusou `adm-mq-a..d`, que funcionavam. Quando o atributo é
  // montado assim, o critério passa a ser: o valor precisa existir como string
  // em ALGUM outro lugar além das próprias comparações que o leem.
  // ⚠️ E a busca do valor tem de ficar DENTRO da função que monta esses botões.
  // Medindo no arquivo inteiro, a lista do player do admin fazia as abas do
  // player do aluno parecerem alcançáveis mesmo depois de apagadas.
  let montador = '';
  for (const a of attrs) {
    const c = html.indexOf(a + '="\'+');
    if (c < 0) continue;
    const ini = html.lastIndexOf('function ', c);
    if (ini < 0) continue;
    let j = html.indexOf('{', ini), n = 0;
    for (let k = j; k < html.length; k++) {
      if (html[k] === '{') n++;
      else if (html[k] === '}') { n--; if (!n) { montador = html.slice(ini, k + 1); break; } }
    }
    if (montador) break;
  }

  for (const val of lidos) {
    if (!val || escritos.has(val) || viaDom.has(val)) continue;
    if (montador) {
      const esc = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const forasDaLeitura = (montador.match(new RegExp("'" + esc + "'", 'g')) || []).length
        - (montador.match(new RegExp('\\b' + v + "\\s*[=!]==\\s*'" + esc + "'", 'g')) || []).length;
      if (forasDaLeitura > 0) continue;   // está na lista que monta os botões
    }
    semPorta.push(v + " === '" + val + "'");
  }
}
ok(semPorta.length === 0,
  '🧨 tela sem porta: ' + semPorta.join(', ') + ' — o código lê esse estado e nada no painel consegue chegar nele');

// ── A porta do catálogo, nomeada ──────────────────────────────────────────
// A varredura acima é geral; esta é a instância que custou uma mensagem errada
// ao professor. Vale ficar escrita com nome próprio.
{
  ok(/data-csub="catalogo"/.test(html),
    '🧨 sumiu de novo o botão do Catálogo de cursos — sem ele não há como trocar a capa NEM marcar um curso como Ativo');
  // ⚠️ O RECORTE TEM DE PARAR NO FECHAMENTO DA BARRA. Indo até o render das
  // abas, um botão solto DEPOIS do </div> ainda cairia dentro da fatia e a
  // medida passaria cega — foi o que a mutação 2 mostrou.
  const i0 = html.indexOf('data-csub="ver"');
  const barra = html.slice(i0, html.indexOf("+'</div>'", i0));
  ok(/data-csub="ver"/.test(barra) && /data-csub="importar"/.test(barra) && /data-csub="catalogo"/.test(barra),
    '⚠️ o botão do Catálogo saiu da mesma barra de abas dos outros dois');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ telas com porta: todo estado de aba que o código lê pode ser alcançado por um controle real (' + nomes.size + ' variáveis varridas)');
