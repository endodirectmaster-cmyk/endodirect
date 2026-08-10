#!/usr/bin/env node
/* Monta lib/clinical-deep-data.js a partir dos extratos VERIFICADOS.
 *
 * Cadeia completa da varredura do acervo:
 *   1. agente lê o PDF          → scratchpad/acervo/textos/<id>.txt
 *   2. agente extrai com citação → scratchpad/acervo/extratos/<id>.json
 *   3. scripts/verifica-extracao.js confere CADA citação contra o texto
 *   4. este script monta o módulo que o api/ai.js entrega à IA
 *
 * ⚠️ Ele RECUSA gerar se qualquer extrato reprovar na etapa 3. Não existe modo
 * "gera assim mesmo": conteúdo sem citação conferida não entra na base clínica.
 *
 * ⚠️ ORDEM IMPORTA. `deepFor` corta a área ao atingir o teto, e o que se perde é
 * o FIM. Por isso os blocos saem ordenados por AUTORIDADE e RECÊNCIA: diretriz
 * antes de revisão, revisão antes de estudo isolado, e mais novo antes de mais
 * velho. Se algo tiver de cair, cai o menos forte — nunca a diretriz vigente.
 *
 * Uso:  node scripts/monta-base-profunda.js [--dir scratchpad/acervo] [--dry]
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const argDir = (() => {
  const i = process.argv.indexOf('--dir');
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : path.join('scratchpad', 'acervo');
})();
const DRY = process.argv.includes('--dry');
const CONFERIR = process.argv.includes('--conferir');
const DIR_EXTRATOS = path.join(RAIZ, argDir, 'extratos');
const SAIDA = path.join(RAIZ, 'lib', 'clinical-deep-data.js');

// Peso por tipo de documento: quanto MENOR, mais cedo entra no bloco (e mais
// protegido fica do corte por teto).
const PESO_TIPO = { diretriz: 0, consenso: 0, posicionamento: 0, revisao: 1, metanalise: 2, ensaio: 3, observacional: 4, caso: 5, outro: 6 };

// ⚠️ TIPO FORA DO VOCABULÁRIO ABORTA A MONTAGEM (08/08/2026), e o motivo é um
// caso real que passou despercebido por horas.
//
// O Posicionamento Nutricional da ABESO — documento de sociedade, 138 fatos —
// veio com `tipo: "posicionamento de sociedade (diretriz)"`. A string é
// descritiva e está CORRETA em português; ela só não é uma das nove chaves.
// O código antigo caía no `!= null ? ... : 6` e atribuía peso 6 — `outro`, o
// tier MAIS BAIXO, abaixo de relato de caso — a uma diretriz de sociedade.
//
// O estrago é silencioso e vale exatamente onde dói: `_peso` é o PRIMEIRO
// critério de ordenação, e Obesidade tem 322k contra teto de 120k. O artigo
// ficava em ÚLTIMO na área mais espremida da base — primeiro a ser cortado
// sempre que a relevância empata. Nenhum erro de fato, nenhuma citação falsa,
// nenhum aviso: um documento inteiro rebaixado por uma palavra a mais no campo.
//
// Padrão silencioso em campo de AUTORIDADE é o mesmo defeito que já corrigimos
// em `conflito_direcao`: se o valor não é reconhecido, o certo é PARAR, não
// chutar o pior. Quem escreve um tipo novo escolhe conscientemente entre
// acrescentá-lo ao vocabulário ou usar uma das chaves existentes.
function pesoDoTipo(e) {
  const t = String(e.tipo || 'outro').toLowerCase().trim();
  if (PESO_TIPO[t] == null) {
    console.error(`\n✗ TIPO NÃO RECONHECIDO: "${e.tipo}"`);
    console.error(`  no extrato: ${String(e.titulo || e.fileId || '?').slice(0, 70)}`);
    console.error(`  vocabulário aceito: ${Object.keys(PESO_TIPO).join(', ')}`);
    console.error('  \n  Isto ABORTA de propósito. O padrão antigo era peso 6 ("outro"), o tier');
    console.error('  mais baixo — e rebaixar em silêncio uma diretriz de sociedade para baixo');
    console.error('  de relato de caso é pior que parar. Corrija o campo `tipo` do extrato');
    console.error('  ou acrescente a chave nova a PESO_TIPO, conscientemente.\n');
    process.exit(1);
  }
  return PESO_TIPO[t];
}

// ⚠️ QUEM VENCE A RESSALVA — o campo mais perigoso desta base.
//
// Até 07/08/2026 este cabeçalho era UM SÓ, fixo, e dizia sempre "o núcleo
// prevalece sobre esta fonte". A auditoria da hipofosfatasia/osteogênese
// imperfeita mostrou o estrago: o `conflito` daquele extrato diz, com citação
// literal, que na hipofosfatasia `bisphosphonates are contraindicated`, e o
// núcleo recomenda bisfosfonato/denosumabe para osteoporose sem falar em
// fosfatase alcalina. O cabeçalho entregava a contraindicação à IA já mandando
// ignorá-la. Nenhum fato errado, nenhuma citação falsa — e a conduta invertida.
//
// A direção NÃO é adivinhável a partir do texto: entre os 13 conflitos escritos
// até hoje há artigo velho superado pelo núcleo (PTDM 2016), artigo novo que
// supera o núcleo (hiponatremia 2026), lacuna pura (NTIS, craniofaringioma) e
// caso em que o vencedor muda de ponto para ponto. Por isso é campo OBRIGATÓRIO
// e sem valor padrão: extrato com `conflito` e sem `conflito_direcao` REPROVA a
// montagem. Um padrão silencioso aqui é exatamente o defeito que se está
// corrigindo.
const CABECALHO_RESSALVA = {
  nucleo_prevalece: '⚠️ RESSALVA — O NÚCLEO PREVALECE sobre esta fonte nos pontos a seguir (fonte mais antiga ou superada); use o núcleo neles e esta fonte no resto: ',
  fonte_prevalece: '⚠️ EXCEÇÃO — ESTA FONTE PREVALECE SOBRE O NÚCLEO nos pontos a seguir. NÃO aplique aqui a regra geral do núcleo; siga o que está escrito nesta ressalva: ',
  // ⚠️ "não cobre OS PONTOS A SEGUIR", e não "não cobre este tema": a lacuna é
  // quase sempre PARCIAL. A dislipidemia é o caso claro — o núcleo tem as metas
  // por categoria de risco, certas e conferidas, e não tem nada sobre estatina
  // em diálise, fitosterol ou teto de dose com imunossupressor. Dizer que ele
  // "não cobre o tema" seria falso e convidaria a IA a descartar o que está certo.
  lacuna: '⚠️ LACUNA DO NÚCLEO — o núcleo não cobre os pontos a seguir (pode cobrir o tema em geral); esta fonte é a referência NELES: ',
  misto: '⚠️ RESSALVA PONTO A PONTO — núcleo e fonte divergem e o vencedor MUDA a cada item. Leia cada ponto e siga o que ele determina; NÃO presuma que um dos dois vence em bloco: ',
  alinhado: '' // não é entregue à IA; ver abaixo
};

function canonizar(area) {
  const { canonArea } = require(path.join(RAIZ, 'lib', 'clinical-deep.js'));
  return canonArea(area);
}

// ⚠️ UM EXTRATO PODE ALIMENTAR MAIS DE UMA ÁREA (08/08/2026).
//
// Achado pela auditoria dos eventos gastrintestinais dos AR GLP-1, e ele expõe
// uma tensão real da arquitetura. A regra "o fármaco cede para a doença nomeada"
// está certa e é testada — mas Obesidade guardava o ÚNICO bloco da base sobre
// evento gastrintestinal de AR GLP-1, e **7 das 9 linhas da tabela do artigo são
// de pacientes com DM2**. Medido: "DM2 em semaglutida com vômito, reduzo a
// dose?" canoniza para Diabetes e o bloco NÃO CHEGA.
//
// Podia-se remendar com composto (`nausea com glp-1` → Obesidade), mas seria
// mentira sobre a natureza do assunto: evento gastrintestinal de incretina
// acontece nas duas populações e o artigo trata das duas. O campo `area` aceitar
// lista é o conserto honesto — e é conservador, porque só vale para o extrato
// que declarar isso explicitamente.
//
// ⚠️ NÃO É DE GRAÇA: o bloco entra inteiro nas duas áreas e ambas têm teto de
// 120k. Duplicar um extrato grande empurra os últimos blocos da área para fora.
// Declare duas áreas só quando a pergunta REAL chega pelas duas.
function areasDoExtrato(e) {
  const bruto = Array.isArray(e.area) ? e.area : String(e.area || '').split(/\s*[;|]\s*/);
  const vistas = [];
  for (const a of bruto) {
    const c = canonizar(a);
    if (c && vistas.indexOf(c) < 0) vistas.push(c);
  }
  return vistas;
}

// ⚠️ O TEXTO-FONTE NÃO EXISTE NO CI, E NUNCA VAI EXISTIR (09/08/2026).
//
// A guarda `--conferir` entrou no `ci-validate` verde na minha máquina e VERMELHA
// no runner, reprovando os 47 extratos de uma vez. Não havia defeito nenhum:
// `scratchpad/acervo/textos/` está no `.gitignore` porque o repositório é PÚBLICO
// e o texto integral dos artigos é protegido por direito autoral. O
// `verifica-extracao.js` simplesmente não tinha o que ler.
//
// Peneira que só pode dar vermelho não protege — vira paisagem e ensina a ignorar
// o CI inteiro. E a INVARIANTE que esta guarda existe para provar ("o que está
// commitado é o que os extratos produzem hoje") NÃO depende do texto-fonte: a
// montagem lê só `extratos/*.json`. As três etapas abaixo são pré-requisito de
// ESCRITA, e a escrita acontece onde o corpus está.
//
// ⚠️ TUDO OU NADA, de propósito. Um único `.txt` presente e as etapas rodam
// inteiras. Corpus PELA METADE tem de reprovar mesmo: peneira cega devolve "✓"
// sem ter olhado, e foi exatamente assim que a cobertura ficou cega na migração
// das citações — o relatório veio limpo e limpo era o sintoma.
function temCorpus() {
  try { return fs.readdirSync(path.join(RAIZ, argDir, 'textos')).some((f) => f.endsWith('.txt')); }
  catch (_) { return false; }
}

function main() {
  const semCorpus = CONFERIR && !temCorpus();
  if (semCorpus) {
    console.log(`⚠️ nenhum .txt em ${path.join(argDir, 'textos')} — a conferência das CITAÇÕES e da`);
    console.log('   COBERTURA não rodou. Este modo prova só a invariante da montagem. As citações');
    console.log('   são conferidas onde o corpus existe: na máquina que gera a base, antes do commit.\n');
  }

  // ── etapa 3: a verificação é PRÉ-REQUISITO, não opcional ──────────────────
  if (!semCorpus) try {
    execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'verifica-extracao.js'), '--dir', path.join(RAIZ, argDir)], { stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    console.error('✗ A verificação das citações REPROVOU — nada será gerado.\n');
    console.error(out);
    process.exit(1);
  }

  // ── etapa 3b: COBERTURA — o extrato representa o artigo inteiro? ──────────
  // A etapa 3 prova que o que está lá está certo. Não prova que está tudo lá.
  // O consenso de prolactinoma passou 100% na etapa 3 tendo deixado de fora as
  // seções de gestação, criança, doença psiquiátrica, menopausa, pessoa trans e
  // doença renal — com o campo `tema` anunciando todas. Erro de OMISSÃO não
  // deixa rastro; por isso vira pré-requisito, não relatório opcional.
  if (!semCorpus) try {
    execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'cobertura-extracao.js'), '--dir', path.join(RAIZ, argDir)], { stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    console.error('✗ A verificação de COBERTURA reprovou — nada será gerado.\n');
    console.error(out);
    process.exit(1);
  }

  // ── etapa 3c: a RESSALVA ainda descreve o núcleo que existe hoje? ─────────
  // A varredura do acervo CORRIGE o núcleo — é metade do objetivo dela. E toda
  // vez que corrige, a ressalva do artigo que motivou a correção passa a
  // descrever um núcleo que não existe mais. Medido em 07/08/2026: 6 das 13
  // ressalvas citavam texto já substituído, entre elas a do prolactinoma, que
  // mandava sobrescrever uma entrada JÁ CERTA. Ressalva velha chega com
  // autoridade de aviso de segurança — por isso é pré-requisito, não relatório.
  try {
    execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'confere-ressalvas.js'), '--dir', path.join(RAIZ, argDir)], { stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    console.error('✗ A conferência das RESSALVAS reprovou — nada será gerado.\n');
    console.error(out);
    process.exit(1);
  }

  if (!fs.existsSync(DIR_EXTRATOS)) { console.error('✗ não existe ' + DIR_EXTRATOS); process.exit(1); }
  const arquivos = fs.readdirSync(DIR_EXTRATOS).filter((f) => f.endsWith('.json'));
  if (!arquivos.length) { console.error('✗ nenhum extrato em ' + DIR_EXTRATOS); process.exit(1); }

  const porArea = {};
  const semArea = [];
  const semDirecao = [];
  for (const arq of arquivos) {
    const e = JSON.parse(fs.readFileSync(path.join(DIR_EXTRATOS, arq), 'utf8'));
    const areas = areasDoExtrato(e);
    if (!areas.length) { semArea.push(`${arq} (area=${JSON.stringify(e.area)})`); continue; }
    const fatos = (Array.isArray(e.fatos) ? e.fatos : []).map((f) => String(f.afirmacao || '').trim()).filter(Boolean);
    if (!fatos.length) continue;
    // ⚠️ A RESSALVA VAI NA FRENTE, e isso é deliberado.
    // O extrator registra em `conflito` quando o artigo e o núcleo divergem.
    // Caso real: a revisão de diabetes pós-transplante de 2016 manda EVITAR
    // iSGLT2 e AR GLP-1, enquanto o núcleo carrega o ADA 2026, que os recomenda.
    // Até 07/08 o montador DESCARTAVA esse campo: a IA recebia a conduta de 2016
    // sem saber que fora superada. Fica no INÍCIO do texto porque `deepFor` corta
    // pelo fim — uma ressalva que o truncamento apaga é pior do que inútil, dá
    // falsa sensação de proteção.
    const ressalva = String(e.conflito || '').trim();
    // ⚠️ ARTIGO GRANDE DEMAIS PARA UM BLOCO SÓ — split por seção (08/08/2026).
    //
    // A Diretriz Brasileira de Dislipidemias 2025 rendeu 583 fatos, 144.584
    // caracteres: 24 mil ACIMA do teto de entrega. Com um bloco único, `deepFor`
    // corta pelo FIM, e o fim era exatamente o conteúdo mais difícil de achar em
    // outro lugar — gestação, pediatria com idade-gatilho por fármaco, tetos de
    // dose com imunossupressor e antirretroviral, e o "não iniciar estatina em
    // diálise sem DCV estabelecida". O corte é POSICIONAL e cego: não sabe que
    // está jogando fora a parte rara para preservar a parte que todo mundo sabe.
    //
    // Partido em pedaços, cada um vira um bloco com o seu próprio `tema` (as
    // seções que ele cobre), e aí a seleção por relevância de `deepFor` passa a
    // funcionar DENTRO do artigo: quem pergunta de estatina na gestação recebe o
    // pedaço da gestação, não os primeiros 120 mil caracteres do documento.
    //
    // A ressalva é repetida em TODOS os pedaços de propósito: ela é o cabeçalho
    // de segurança, e um pedaço que chegue sozinho sem ela é um pedaço sem aviso.
    const TETO_BLOCO = 60000;
    const grupos = [];
    {
      const seq = (Array.isArray(e.fatos) ? e.fatos : []).filter((f) => String(f.afirmacao || '').trim());
      let atual = null;
      for (const f of seq) {
        const sec = String(f.secao || '').replace(/\s+/g, ' ').trim();
        if (!atual || atual.n + f.afirmacao.length > TETO_BLOCO) {
          atual = { fatos: [], n: 0, secoes: [] };
          grupos.push(atual);
        }
        atual.fatos.push(String(f.afirmacao).trim());
        atual.n += f.afirmacao.length;
        if (sec && atual.secoes.indexOf(sec) < 0 && atual.secoes.length < 4) atual.secoes.push(sec);
      }
    }
    const corpo = fatos.join(' ');
    let texto = corpo;
    if (ressalva) {
      const dir = String(e.conflito_direcao || '').trim();
      // ⚠️ presença da CHAVE, não verdade do valor: `alinhado` mapeia para ''
      // (não vai à IA) e um `!CABECALHO_RESSALVA[dir]` o reprovaria como se
      // fosse direção ausente. Foi o que aconteceu na primeira execução.
      if (!Object.prototype.hasOwnProperty.call(CABECALHO_RESSALVA, dir)) {
        semDirecao.push(`${arq} (conflito_direcao=${JSON.stringify(e.conflito_direcao || null)})`);
        continue;
      }
      // `alinhado` é registro de auditoria, não instrução: o núcleo JÁ foi
      // corrigido a partir desta fonte, então mandar a ressalva para a IA seria
      // alarme falso ocupando o prefixo cacheado. Fica no JSON, sai da entrega.
      texto = dir === 'alinhado' ? corpo : (CABECALHO_RESSALVA[dir] + ressalva + ' | CONTEÚDO: ' + corpo);
    }
    const temaBase = String(e.tema || e.titulo || '').trim();
    const cabecalhoRessalva = (ressalva && e.conflito_direcao !== 'alinhado')
      ? CABECALHO_RESSALVA[String(e.conflito_direcao || '').trim()] + ressalva + ' | CONTEÚDO: '
      : '';
    // Um pedaço só → bloco único, como sempre foi. Vários → um bloco por pedaço,
    // cada um nomeado pelas seções que cobre, para a seleção por tema funcionar.
    const pedacos = grupos.length > 1 ? grupos : null;
    const blocos = pedacos
      ? pedacos.map((g, i) => ({
        tema: `${temaBase} (parte ${i + 1}/${pedacos.length}${g.secoes.length ? ' — ' + g.secoes.join('; ').slice(0, 150) : ''})`,
        texto: cabecalhoRessalva + g.fatos.join(' '),
        _fatos: g.fatos.length
      }))
      : [{ tema: temaBase, texto: texto, _fatos: fatos.length }];
    for (const canon of areas) for (const b of blocos) {
      (porArea[canon] = porArea[canon] || []).push({
        tema: b.tema,
        fonte: String(e.fonte || '').trim(),
        texto: b.texto,
        _peso: pesoDoTipo(e),
        _ano: Number(e.ano) || 0,
        _fatos: b._fatos
      });
    }
  }

  // ⚠️ ABORTA: ressalva sem direção declarada. Ver CABECALHO_RESSALVA.
  if (semDirecao.length) {
    console.error('✗ ' + semDirecao.length + ' extrato(s) têm `conflito` sem `conflito_direcao` — nada será gerado.\n');
    semDirecao.forEach((s) => console.error('   · ' + s));
    console.error('\nDeclare `conflito_direcao` com um destes valores:');
    console.error('   nucleo_prevalece — a fonte é mais antiga/superada; o núcleo vence nos pontos da ressalva');
    console.error('   fonte_prevalece  — a fonte é mais nova/mais específica e SOBREPÕE o núcleo nesses pontos');
    console.error('   lacuna           — o núcleo é silente no tema; a fonte é a referência');
    console.error('   misto            — o vencedor muda de ponto para ponto dentro da mesma ressalva');
    console.error('   alinhado         — o núcleo já foi corrigido a partir desta fonte (fica no JSON, não vai à IA)');
    console.error('\nNão existe padrão. Assumir "o núcleo prevalece" foi o que quase entregou');
    console.error('bisfosfonato contraindicado na hipofosfatasia com aval da própria ressalva.');
    process.exit(1);
  }

  // ordena: autoridade primeiro, depois mais recente, depois mais denso
  for (const a of Object.keys(porArea)) {
    porArea[a].sort((x, y) => (x._peso - y._peso) || (y._ano - x._ano) || (y._fatos - x._fatos));
  }

  // ── relatório e aviso de corte ────────────────────────────────────────────
  const TETO_AREA = require('../lib/clinical-deep').TETO_PROFUNDO; // fonte única, não cópia
  let totalBlocos = 0, totalFatos = 0;
  console.log('Base profunda por área:');
  for (const a of Object.keys(porArea).sort()) {
    const blocos = porArea[a];
    const tam = blocos.reduce((n, b) => n + b.tema.length + b.fonte.length + b.texto.length + 6, 0);
    totalBlocos += blocos.length;
    totalFatos += blocos.reduce((n, b) => n + b._fatos, 0);
    const alerta = tam > TETO_AREA
      ? `  ⚠️ ${tam} chars ULTRAPASSA o teto de ${TETO_AREA}: os últimos blocos (menos autoritativos) não chegarão à IA`
      : '';
    console.log(`  ${a.padEnd(28)} ${String(blocos.length).padStart(3)} bloco(s) · ${String(tam).padStart(6)} chars${alerta}`);
  }
  if (semArea.length) {
    console.log('\n⚠️ extratos SEM área canônica (ignorados — corrija o campo `area`):');
    semArea.forEach((s) => console.log('   · ' + s));
  }
  console.log(`\ntotal: ${totalBlocos} bloco(s) de ${arquivos.length} extrato(s) · ${totalFatos} fato(s) verificado(s)`);

  if (DRY) { console.log('\n(--dry: nada foi escrito)'); return; }

  // ── gera o módulo ─────────────────────────────────────────────────────────
  const limpo = {};
  for (const a of Object.keys(porArea).sort()) {
    limpo[a] = porArea[a].map((b) => ({ tema: b.tema, fonte: b.fonte, texto: b.texto }));
  }
  const cabecalho = `// GERADO — não editar à mão. Produzido por scripts/monta-base-profunda.js a
// partir dos extratos verificados em ${argDir}/extratos/, cada fato com citação
// literal conferida contra o PDF por scripts/verifica-extracao.js.
//
// Separado de lib/clinical-deep.js de propósito: lá fica a LÓGICA (canonização de
// área, montagem do bloco, tetos), aqui só o CONTEÚDO. Assim o conteúdo pode
// crescer para centenas de KB sem que ninguém precise reler a lógica, e um erro
// de geração nunca corrompe o código que decide o que vai para a IA.
//
// Ordem dentro de cada área: diretriz antes de revisão, revisão antes de estudo
// isolado, mais novo antes de mais velho — porque \`deepFor\` corta pelo FIM.
//
// ${totalBlocos} bloco(s) · ${totalFatos} fato(s) verificado(s).
module.exports = `;
  const conteudo = cabecalho + JSON.stringify(limpo, null, 1) + ';\n';

  // ⚠️ `--conferir`: a INVARIANTE de que o que está commitado é o que os extratos
  // produzem hoje. Nasceu de um buraco medido em 09/08/2026 — um extrato chegou
  // com `tipo` fora do vocabulário fechado, este montador ABORTOU (corretamente),
  // e o `ci-validate` passou VERDE assim mesmo, porque ele valida o
  // `clinical-deep-data.js` já construído, que seguia consistente e apenas
  // VELHO. Três artigos extraídos, verificados e commitados podiam existir no
  // repositório sem chegar a médico nenhum, e nada acusava.
  //
  // Conferir a IGUALDADE pega os dois lados de uma vez — o extrato que aborta a
  // montagem E o "esqueci de rebuildar". Copiar só a checagem do `tipo` para o CI
  // seria pior: daria confiança falsa sobre as outras condições de aborto.
  if (CONFERIR) {
    const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
    if (atual === conteudo) {
      console.log(`\n✓ base montada confere com ${path.relative(RAIZ, SAIDA)} ` +
                  `(${totalBlocos} bloco(s) · ${totalFatos} fato(s)).`);
      return;
    }
    console.error(`\n✗ ${path.relative(RAIZ, SAIDA)} NÃO é o que os extratos produzem hoje.`);
    console.error(`  commitado: ${atual.length} chars · montado agora: ${conteudo.length} chars`);
    console.error('\n  O que está no ar não é o que foi extraído. Rode:');
    console.error('    node scripts/monta-base-profunda.js\n');
    process.exit(1);
  }

  fs.writeFileSync(SAIDA, conteudo);
  console.log('\n✓ gerado ' + path.relative(RAIZ, SAIDA));
}

main();
