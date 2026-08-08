// Endodirect — a CITAÇÃO deixa de ser publicada, e continua conferível.
//
// POR QUE ISTO EXISTE (08/08/2026). A regra da base é inegociável e continua
// valendo: nenhuma afirmação entra sem um trecho LITERAL do artigo que a
// sustente, conferido contra o texto do PDF. Foi assim que se acharam a inversão
// do teto de sódio, o grau de Knosp do prolactinoma e a contraindicação de
// bisfosfonato na hipofosfatasia.
//
// Só que ninguém somou. Medindo o agregado com `scripts/proporcao-citada.js`:
//
//     72%  hipo-2   Best Pract Res Clin Endocrinol Metab 2026 (Elsevier)
//     61%  hipo-4   idem
//     61%  hipo-3   idem
//     59%  hipo-5   idem
//     56%  crise tireotóxica  (capítulo de livro, Springer)
//     50%  prolactinoma       (Nature Reviews Endocrinology)
//     48%  insuficiência adrenal (The Lancet)
//
// Nenhum deles é open access. Cada citação isolada é um trecho de uma ou duas
// frases — citação legítima, sem discussão. Mas 72% de um artigo por assinatura,
// reconstituível verbatim num repositório PÚBLICO, não é mais citação: é cópia.
// E ninguém decidiu isso — é o efeito colateral de duas exigências certas
// (extrair exaustivamente + exigir citação para cada fato) que, juntas,
// produziram uma terceira coisa que nenhuma das duas pediu.
//
// ⚠️ A SAÍDA NÃO PODE SER ENFRAQUECER A PROVA. Encurtar citação para caber num
// limite seria trocar risco jurídico por risco clínico, e o clínico é pior.
//
// A saída é separar PROVA de PUBLICAÇÃO. O extrato versionado passa a guardar,
// no lugar do texto:
//
//   cit: [[base, offset, tamanho], …]   → onde a citação está no texto-fonte
//   cit_sha: "…"                        → hash do texto literal resolvido
//
// O texto-fonte continua onde sempre esteve — `scratchpad/acervo/textos/`, no
// .gitignore. Quem tem o artigo resolve a citação e confere tudo o que se
// conferia antes (literalidade, números, força da recomendação). Quem não tem,
// não recebe o artigo de graça. A prova é a MESMA: o hash prova que o trecho
// naquele offset é exatamente o que sustenta a afirmação, e qualquer edição no
// texto ou no offset quebra.
//
// `base` existe porque o verificador aceita duas normalizações do texto-fonte:
//   0 = espaços colapsados (norm)
//   1 = idem, mais a remoção do hífen de quebra de linha que o PDF injeta
//       ("sulfo- nylureas" → "sulfonylureas"). Só isso; não é afrouxamento.

const crypto = require('crypto');

const ELISAO = /\s*\[(?:…|\.\.\.)\]\s*/;
const JUNTA = ' […] ';

function norm(s) {
  return String(s || '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function semHifenDeQuebra(s) {
  return String(s || '').replace(/-\s+/g, '');
}

// As duas bases contra as quais um offset pode ter sido gravado.
function bases(textoBruto) {
  const b0 = norm(textoBruto);
  return [b0, semHifenDeQuebra(b0)];
}

function sha(s) {
  return crypto.createHash('sha256').update(String(s), 'utf8').digest('hex').slice(0, 16);
}

// Resolve a citação de um fato. Aceita os dois formatos, de propósito: o legado
// (`citacao` com o texto) continua funcionando enquanto houver extrato antigo ou
// enquanto um agente estiver escrevendo um novo. Devolve { texto, origem } ou
// null se não der para resolver.
function resolver(fato, bs) {
  if (!fato) return null;
  if (Array.isArray(fato.cit) && fato.cit.length) {
    const partes = [];
    for (const ref of fato.cit) {
      const [base, off, len] = ref;
      const b = bs[base | 0];
      if (!b || off < 0 || off + len > b.length) return null;
      partes.push(b.slice(off, off + len));
    }
    const texto = partes.join(JUNTA);
    if (fato.cit_sha && sha(texto) !== fato.cit_sha) return null;
    return { texto, origem: 'ref' };
  }
  const t = String(fato.citacao || '').trim();
  return t ? { texto: t, origem: 'texto' } : null;
}

// Localiza uma citação (texto) dentro do texto-fonte e devolve as referências.
// Devolve null quando não encontra — quem chama decide o que fazer, e NUNCA
// deve inventar um offset.
function referenciar(citacao, bs) {
  const pedacos = String(citacao).split(ELISAO).map((p) => p.trim()).filter(Boolean);
  for (let base = 0; base < bs.length; base++) {
    const b = bs[base];
    const refs = [];
    let pos = 0, ok = true;
    for (const p of pedacos) {
      const alvo = base === 1 ? semHifenDeQuebra(norm(p)) : norm(p);
      const j = b.indexOf(alvo, pos);
      if (j < 0) { ok = false; break; }
      refs.push([base, j, alvo.length]);
      pos = j + alvo.length;
    }
    if (ok && refs.length === pedacos.length) {
      const texto = refs.map(([bb, o, l]) => bs[bb].slice(o, o + l)).join(JUNTA);
      return { cit: refs, cit_sha: sha(texto), texto };
    }
  }
  return null;
}

module.exports = { norm, semHifenDeQuebra, bases, sha, resolver, referenciar, ELISAO, JUNTA };
