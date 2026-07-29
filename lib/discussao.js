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
  'Nunca escreva um número que não esteja no texto fornecido.'
].join(' ');

function montarPrompt(artigo, ft) {
  const temFig = ft.figuras.length;
  const temTab = ft.tabelas.length;
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
${temTab ? `- As TABELAS abaixo vêm do artigo. **Reproduza no corpo da discussão, em markdown**, as
  que sustentam um argumento — não todas por obrigação. Antes de cada uma, uma frase
  dizendo o que ela mostra; depois, o que se lê nela. Mantenha os valores EXATOS.
- **A tabela sai em português**: traduza cabeçalhos de coluna e o texto das células.
  Ficam como estão, sem tradução: números, unidades, siglas, nomes de fármacos, de
  táxons e de estudos. Traduzir o rótulo não é alterar o dado; deixar a tabela em
  inglês no meio de um texto em português é que quebra a leitura.
- **Reproduzir é colar a tabela, não descrevê-la.** Se você escrever "a Tabela 1
  mostra…" sem a tabela em markdown logo em seguida, a tabela não foi reproduzida.` : '- O artigo não tem tabelas extraíveis.'}
${temFig ? `- As FIGURAS entram como **referência no texto** ("A Figura 2 mostra…"), com o achado
  descrito em palavras. **Não invente** o que a figura mostra além do que a legenda diz.
  A imagem em si não é reproduzida.` : '- O artigo não tem figuras com legenda.'}
- Nunca cite figura ou tabela que não esteja na lista fornecida.

TEXTO INTEGRAL DO ARTIGO:
${fullTextForPrompt(ft)}

Responda apenas com o markdown da discussão, sem preâmbulo.`;
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
    return {
      ok: true,
      markdown: md,
      meta: {
        pmcid: ft.pmcid,
        licenca: ft.licenca.cc || '(não declarada)',
        palavras: ft.palavras,
        figuras: ft.figuras.length,
        tabelas: ft.tabelas.length,
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

module.exports = { gerarDiscussao, montarPrompt, SISTEMA };
