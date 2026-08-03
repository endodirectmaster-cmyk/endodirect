// Discussão completa de um artigo do Mural, escrita a partir do TEXTO INTEGRAL.
//
// Diferença para o resumo do radar (lib/radar.js → summarizeWithAI):
//   resumo    = 3 a 5 linhas, a partir do ABSTRACT, gerado para todos os artigos
//   discussão = análise longa, a partir do TEXTO INTEGRAL, só para acesso aberto
//
// A separação é deliberada. Discussão escrita em cima de abstract é texto
// inventado com aparência de análise — a lição de 2026-07-28, quando afirmações
// verdadeiras "para a classe" não correspondiam ao que o ensaio mediu.
'use strict';

const { fetchFullText, fullTextForPrompt } = require('./fulltext');

// ⚠️ NÃO segue `process.env.ANTHROPIC_MODEL`, e isso é deliberado. Essa env está
// com `claude-sonnet-4-6` — um id RETIRADO em 2026-07-13, que derrubou todos os
// geradores quando era usado cru. O `api/ai.js` se defende normalizando a env
// (LEGACY_MODEL_MAP + allowlist); este arquivo, na primeira versão, lia a env
// direto e mandou `claude-sonnet-4-6` para a API — reintroduzindo exatamente a
// armadilha que o cofre documenta. A primeira discussão gerada em produção
// registrou esse modelo no `meta`.
//
// Modelo fixado em **Opus 4.8** por decisão do professor (2026-07-28: "migrando
// para o opus 4.8"), alinhado ao padrão dos demais geradores desde 25/07. A env
// própria `DISCUSSAO_MODEL` permite trocar sem deploy, mas passa pela mesma
// allowlist — env inválida cai no padrão em vez de quebrar.
const ALLOWED_MODELS = { 'claude-sonnet-5': 1, 'claude-opus-4-8': 1, 'claude-haiku-4-5': 1 };
const LEGACY_MODEL_MAP = { 'claude-sonnet-4-6': 'claude-sonnet-5' };
function normModel(raw) {
  const m = LEGACY_MODEL_MAP[String(raw || '')] || String(raw || '');
  return ALLOWED_MODELS[m] ? m : '';
}
const ANTHROPIC_MODEL = normModel(process.env.DISCUSSAO_MODEL) || 'claude-opus-4-8';
const AI_TIMEOUT_MS = 120000;

const SISTEMA = [
  'Você é endocrinologista e escreve para outros médicos, em português do Brasil.',
  'Registro FORMAL e TÉCNICO. Frase curta, dado antes do adjetivo, limitação dita por extenso.',
  // Regra do professor (2026-07-28): "Evite termos genéricos de IA."
  'PROIBIDO: metáfora de efeito ("divisor de águas", "cemitério de estudos"), superlativo vago',
  '("robusto", "impressiona", "extremamente"), autoelogio de método ("com honestidade",',
  '"vale dizer em voz alta") e a fórmula "não é apenas X, é Y".',
  // Regra do professor (2026-08-03): "retira esse 'profundo'. Coisa de IA."
  // ⚠️ A proibição é do REFORÇO inventado, não da palavra: o artigo do coma
  // mixedematoso diz "hipotermia pode ser profunda", e "reflexos profundos" é
  // anatomia. Proibir a palavra inteira apagaria os dois usos corretos.
  'Não use "profundo/profunda" para reforçar um quadro clínico ("hipotireoidismo profundo").',
  'Só quando o próprio artigo disser (hipotermia profunda) ou for termo anatômico (reflexos profundos).',
  // Regra do professor (2026-08-03): "trocar FT4 por T4 livre".
  'Escreva "T4 livre" e "T3 livre", nunca "FT4"/"FT3" — a única exceção é decodificar',
  'a sigla impressa numa FIGURA do artigo, na legenda dela ("FT4, T4 livre").',
  'Nunca escreva um número que não esteja no texto fornecido.'
].join(' ');

function montarPrompt(artigo, ft) {
  const temFig = ft.figuras.length;
  const temTab = ft.tabelas.length;
  // Só CC BY e CC0 permitem reproduzir. Ver o comentário longo em
  // fullTextForPrompt (lib/fulltext.js): o CONTEÚDO da tabela vai nos dois
  // casos — o que muda é o direito de colá-la de volta na discussão.
  const podeReproduzir = !!(ft.licenca && ft.licenca.redistribuivel);
  return `Escreva a DISCUSSÃO COMPLETA do artigo abaixo para o Mural do Endodirect.

Título: ${artigo.titulo}
Revista: ${artigo.fonte}
Tipo: ${artigo.studyType || artigo.tipo || '(não informado)'}

Formato de saída: **markdown**, usando \`## \` para os títulos de seção. Estrutura:

## Pergunta e contexto
O que o artigo se propõe a responder e por que a pergunta está em aberto.

## Métodos
Desenho, população, o que foi comparado, desfechos. Se for revisão narrativa, diga
que é narrativa e o que isso limita.

## Achados
Os resultados com os números do artigo. **Aqui entram as figuras e as tabelas.**

## O que isto muda na prática
Conduta concreta. Se não muda conduta, escreva isso.

## Limitações
As do próprio artigo, incluindo as que os autores admitem.

REGRAS SOBRE FIGURAS E TABELAS (a parte que mais importa):
${temTab && !podeReproduzir ? `- ⚠️ A licença deste artigo (${ft.licenca && ft.licenca.cc ? ft.licenca.cc : 'não declarada'}) **NÃO permite reproduzir as tabelas**.
- As tabelas abaixo vão para você **só como fonte dos números**. Use os dados no
  texto, com redação própria — número é fato e pode ser citado.
- **NÃO escreva marcador de tabela** e **não remonte a tabela em markdown.**` : ''}
${temTab && podeReproduzir ? `- As TABELAS abaixo vêm do artigo, cada uma precedida de um marcador \`[[TABELA:n]]\`.
- **Para trazer uma tabela, escreva o marcador sozinho numa linha**, no ponto exato
  em que ela deve aparecer. O servidor substitui o marcador pela tabela do artigo,
  com a legenda e a nota de rodapé originais.
- **NÃO copie, não traduza e não reescreva a tabela.** Copiada à mão ela sai errada:
  numa tabela de comparações par a par, o rótulo dos tratamentos vive na diagonal, e
  reescrevê-la como tabela comum inventa um cabeçalho que o artigo não tem.
- Traga só as que sustentam um argumento — não todas por obrigação. Antes do
  marcador, uma frase dizendo o que a tabela mostra; depois, o que se lê nela.` : ''}
${temTab ? '' : '- O artigo não tem tabelas extraíveis.'}
${temFig ? `- As FIGURAS entram como **referência no texto** ("A Figura 2 mostra…"), com o achado
  descrito em palavras. **Não invente** o que a figura mostra além do que a legenda diz.
  A imagem em si não é reproduzida.` : '- O artigo não tem figuras com legenda.'}
- Nunca cite figura ou tabela que não esteja na lista fornecida.

TEXTO INTEGRAL DO ARTIGO:
${fullTextForPrompt(ft)}

Responda apenas com o markdown da discussão, sem preâmbulo.`;
}

// ⚠️ A TABELA QUE O ALUNO VÊ É A DO ARTIGO, NÃO A QUE A IA ESCREVEU.
// Decisão do professor (30/07), depois de ver uma league table de metanálise em
// rede sair deformada: a IA tinha reescrito a tabela como se fosse uma tabela
// comum, inventando um cabeçalho (`| _D_ | _A_ | _C_ | _B_ |`) que o artigo não
// tem — numa comparação par a par o rótulo dos tratamentos vive na DIAGONAL.
//
// Agora a IA só marca o LUGAR (`[[TABELA:n]]` sozinho numa linha) e a colagem é
// feita aqui, do markdown extraído do JATS. Isso troca uma instrução que o modelo
// pode desobedecer por uma substituição que ele não tem como errar — e traz junto
// a NOTA DE RODAPÉ, que é o que define as siglas e as letras da diagonal.
//
// ⚠️ Efeito colateral aceito pelo professor: os cabeçalhos ficam no idioma do
// artigo (inglês, quase sempre), porque traduzir é reescrever.
const RE_MARCADOR_LINHA = /^[ \t]*\[\[TABELA:(\d+)\]\][ \t]*$/gm;
function inserirTabelas(md, tabelas) {
  const lista = Array.isArray(tabelas) ? tabelas : [];
  const usadas = [];
  let out = String(md || '').replace(RE_MARCADOR_LINHA, function (_linha, n) {
    const t = lista[Number(n) - 1];
    if (!t || !t.markdown) return '';    // marcador para tabela inexistente: some
    if (usadas.indexOf(Number(n)) < 0) usadas.push(Number(n));
    const cabecalho = [t.rotulo, t.legenda].filter(Boolean).join('. ');
    return (cabecalho ? '**' + cabecalho + '**\n\n' : '') + t.markdown
      + (t.nota ? '\n\n' + t.nota : '');
  });
  // Marcador mal escrito ou no meio de uma frase NUNCA chega ao aluno: ver o
  // `_D_` de 30/07 e o "---" de 28/07 — marcação crua na tela é sempre defeito.
  out = out.replace(/\[\[\s*TABELA\s*:[^\]]*\]\]/gi, '');
  return { markdown: out.replace(/\n{3,}/g, '\n\n').trim(), usadas };
}

async function gerarDiscussao(apiKey, artigo, opts) {
  if (!apiKey) return { ok: false, motivo: 'sem_chave_ia' };
  const ft = (opts && opts.fullText) || await fetchFullText(artigo.link);
  if (!ft) return { ok: false, motivo: 'sem_texto_integral' };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 6000,
        system: SISTEMA,
        thinking: { type: 'disabled' },
        messages: [{ role: 'user', content: montarPrompt(artigo, ft) }]
      })
    });
    if (!r.ok) return { ok: false, motivo: 'ia_http_' + r.status };
    const data = await r.json().catch(() => ({}));
    const txt = Array.isArray(data.content)
      ? ((data.content.find((p) => p && p.type === 'text') || {}).text || '')
      : '';
    const md = String(txt).trim();
    if (md.length < 800) return { ok: false, motivo: 'resposta_curta' };
    // O tamanho mínimo é conferido ANTES da colagem: a tabela do artigo não pode
    // servir de enchimento para uma discussão que saiu curta demais.
    const comTabelas = inserirTabelas(md, ft.tabelas);
    return {
      ok: true,
      markdown: comTabelas.markdown,
      meta: {
        pmcid: ft.pmcid,
        licenca: ft.licenca.cc || '(não declarada)',
        palavras: ft.palavras,
        figuras: ft.figuras.length,
        tabelas: ft.tabelas.length,
        tabelas_inseridas: comTabelas.usadas,
        modelo: ANTHROPIC_MODEL,
        em: Date.now()
      }
    };
  } catch (e) {
    return { ok: false, motivo: 'erro_rede' };
  } finally {
    clearTimeout(timer);
  }
}

// ⚠️ NÃO existe mais rodapé de procedência (removido em 29/07, a pedido do
// professor). Ele dizia "N tabela(s) reproduzida(s) do artigo" contando o que o
// ARTIGO tinha, não o que a discussão trouxe — e as tabelas não estavam vindo,
// porque o corte de 60.000 caracteres do prompt cortava justamente o bloco delas
// (ia por último). O rodapé não descrevia o texto: descrevia uma intenção.
// A procedência continua visível pelo link do artigo, que já está no card.

module.exports = { gerarDiscussao, montarPrompt, inserirTabelas, SISTEMA };
