// Endodirect — Páginas públicas indexáveis (SEO).
//
// POR QUE ISTO EXISTE. Medido em 19/08/2026: a conversão é de 33% e independe de
// o inscrito estudar (24/73 entre quem estudou, 13/39 entre quem não estudou), e
// a mediana entre cadastro e pagamento é de 27 minutos. Conversão não é problema
// de produto — é problema de TRÁFEGO. E o site inteiro é UMA página (`index.html`)
// que monta o conteúdo por JavaScript depois do login: o Google tem exatamente
// um endereço para indexar, sem descrição, sem sitemap, sem robots.txt.
//
// ⚠️ NÃO PUBLICA NADA NOVO. As páginas servem SÓ os capítulos que
// `endodirect_public_content()` já entrega hoje a qualquer visitante anônimo
// (`privado <> true`, `rascunho <> true`). O que muda é o ENDEREÇO em que esse
// conteúdo já público existe — de "dentro de um SPA" para "uma URL por capítulo".
//
// ⚠️ E o que é do assinante continua sendo. Flashcards, mapa mental, fluxogramas
// e as discussões de artigo (essas exigem `auth.uid()` na própria RPC) NÃO entram
// aqui. A página pública leva o resumo e os pontos-chave; as ferramentas de
// estudo são o motivo de criar conta.

const BASE_PADRAO = 'https://www.endodirect.com.br';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function publicBase() {
  return (process.env.PUBLIC_BASE_URL || BASE_PADRAO).replace(/\/+$/, '');
}

// Espelho em JS do `public.endodirect_slug(text)`. Os slugs de produção vêm do
// banco (fonte única); este existe para montar link a partir de um tema quando
// só o tema está à mão, e é comparado ao do banco no teste.
const ACENTOS = { a: 'ÁÀÂÃÄáàâãä', e: 'ÉÈÊËéèêë', i: 'ÍÌÎÏíìîï', o: 'ÓÒÔÕÖóòôõö', u: 'ÚÙÛÜúùûü', c: 'Çç', n: 'Ññ' };
function slug(t) {
  let s = String(t == null ? '' : t);
  for (const [alvo, origem] of Object.entries(ACENTOS)) {
    for (const ch of origem) s = s.split(ch).join(alvo);
  }
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Markdown → HTML (subconjunto usado pelos capítulos) ─────────────────────
// Os resumos usam `## título`, `**negrito**`, `*itálico*`, listas com `-` e a
// tabela `## 📊` da convenção da casa. Escapa ANTES de marcar: o texto vem do
// payload e não pode injetar HTML na página pública.
function inline(t) {
  return esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function linhaTabela(l) {
  return l.trim().split('|').slice(1, -1).map((c) => c.trim());
}
function mdToHtml(md) {
  const linhas = String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const fechaPara = (buf) => { if (buf.length) { out.push('<p>' + inline(buf.join(' ')) + '</p>'); buf.length = 0; } };
  const buf = [];
  while (i < linhas.length) {
    const l = linhas[i];
    const t = l.trim();
    if (!t) { fechaPara(buf); i++; continue; }
    let m;
    if ((m = t.match(/^(#{1,4})\s+(.*)$/))) {
      fechaPara(buf);
      // `##` (o nível de seção que os capítulos usam) vira <h2>; um `#` solto
      // também — o <h1> da página é o tema, e dois <h1> confundem o índice.
      const n = Math.min(4, Math.max(2, m[1].length));
      out.push('<h' + n + '>' + inline(m[2]) + '</h' + n + '>');
      i++; continue;
    }
    // Tabela: linha de cabeçalho + separador |---|---| + corpo
    if (t.indexOf('|') === 0 && i + 1 < linhas.length && /^\|[\s:|-]+\|$/.test(linhas[i + 1].trim())) {
      fechaPara(buf);
      const cab = linhaTabela(t);
      i += 2;
      const corpo = [];
      while (i < linhas.length && linhas[i].trim().indexOf('|') === 0) { corpo.push(linhaTabela(linhas[i].trim())); i++; }
      out.push('<div class="tw"><table><thead><tr>' + cab.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>'
        + corpo.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^[-*+]\s+/.test(t)) {
      fechaPara(buf);
      const itens = [];
      while (i < linhas.length && /^\s*[-*+]\s+/.test(linhas[i])) { itens.push(linhas[i].replace(/^\s*[-*+]\s+/, '')); i++; }
      out.push('<ul>' + itens.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ul>');
      continue;
    }
    if (/^\d+[.)]\s+/.test(t)) {
      fechaPara(buf);
      const itens = [];
      while (i < linhas.length && /^\s*\d+[.)]\s+/.test(linhas[i])) { itens.push(linhas[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
      out.push('<ol>' + itens.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ol>');
      continue;
    }
    buf.push(t); i++;
  }
  fechaPara(buf);
  return out.join('\n');
}

// Descrição da meta tag: texto puro, sem marcação, cortado em palavra inteira.
function descricao(md, limite) {
  const lim = limite || 155;
  const txt = String(md == null ? '' : md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*#{1,6}\s+.*$/gm, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/[*_`>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (txt.length <= lim) return txt;
  return txt.slice(0, lim).replace(/\s+\S*$/, '') + '…';
}

const CSS = `*{box-sizing:border-box}body{margin:0;background:#f7f9fc;color:#1f2937;font:16px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
a{color:#2563eb}.wrap{max-width:760px;margin:0 auto;padding:0 20px 64px}
header.top{background:#13294b;padding:16px 0;margin-bottom:28px}
header.top .wrap{padding-bottom:0;display:flex;align-items:center;gap:12px}
header.top a{color:#fff;font-weight:800;font-size:20px;text-decoration:none}
header.top span{color:#b9c6dc;font-size:14px}
h1{font-size:30px;line-height:1.25;color:#13294b;margin:0 0 10px}
h2{font-size:22px;color:#13294b;margin:32px 0 10px;line-height:1.3}
h3{font-size:18px;color:#1e3a5f;margin:24px 0 8px}
h4{font-size:16px;color:#1e3a5f;margin:20px 0 6px}
.meta{color:#64748b;font-size:14px;margin:0 0 22px}
.badge{display:inline-block;background:#eef2ff;color:#3730a3;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;margin:0 8px 8px 0}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:26px 26px 30px}
ul,ol{padding-left:22px}li{margin:6px 0}
.tw{overflow-x:auto;margin:16px 0}table{border-collapse:collapse;width:100%;font-size:15px}
th,td{border:1px solid #e5e7eb;padding:8px 10px;text-align:left;vertical-align:top}th{background:#f1f5f9;color:#13294b}
code{background:#f1f5f9;border-radius:4px;padding:1px 5px;font-size:14px}
.pts{background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:16px 20px;margin:26px 0}
.pts h2{margin-top:0;font-size:18px}
.cta{display:inline-block;background:#2563eb;color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:6px}
.box{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px 24px;margin:28px 0}
.box h2{margin:0 0 8px;font-size:19px}
form.nl{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
form.nl input{flex:1 1 240px;padding:11px 13px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;font-family:inherit}
form.nl button{background:#13294b;color:#fff;border:0;border-radius:9px;padding:11px 20px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
.nlmsg{font-size:14px;margin-top:10px;min-height:20px}
.aviso{font-size:13px;color:#64748b;margin-top:14px;line-height:1.6}
.lista{list-style:none;padding:0}.lista li{margin:0 0 10px}
footer{color:#64748b;font-size:13px;margin-top:36px;line-height:1.7}
@media(max-width:600px){h1{font-size:25px}.card{padding:20px 18px 24px}}`;

// Formulário de captação. Vale para quem NUNCA vai criar conta: até aqui a
// newsletter só alcançava quem já tinha cadastro, e quem chegava pelo Google e
// não queria criar conta ia embora sem deixar nada.
function formNewsletter(origem) {
  return `<div class="box">
  <h2>Receba a Questão do Dia por e-mail</h2>
  <p style="margin:0;color:#475569;font-size:15px">Uma questão de endocrinologia e os artigos mais relevantes do dia. Sem conta, sem custo — cancele com um clique.</p>
  <form class="nl" id="nl-form" data-origem="${esc(origem || '')}">
    <input type="email" name="email" placeholder="seu@email.com" required autocomplete="email" aria-label="Seu e-mail">
    <button type="submit">Quero receber</button>
  </form>
  <div class="nlmsg" id="nl-msg" role="status"></div>
</div>
<script>
(function(){
  var f=document.getElementById('nl-form'),m=document.getElementById('nl-msg');
  if(!f)return;
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var email=(f.email.value||'').trim();
    if(!email)return;
    m.style.color='#475569';m.textContent='Enviando…';
    fetch('/api/publico?rota=inscrever',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,origem:f.dataset.origem})})
      .then(function(r){return r.json().catch(function(){return {};});})
      .then(function(j){
        if(j&&j.ok){m.style.color='#0f7a52';m.textContent='Pronto. A próxima edição chega no seu e-mail.';f.reset();}
        else{m.style.color='#b91c1c';m.textContent='Não consegui inscrever esse endereço. Confira e tente de novo.';}
      })
      .catch(function(){m.style.color='#b91c1c';m.textContent='Falha de rede. Tente de novo em instantes.';});
  });
})();
</script>`;
}

function cabecalho() {
  return `<header class="top"><div class="wrap"><a href="/">Endodirect</a><span>Educação médica em endocrinologia</span></div></header>`;
}
function rodape(base) {
  return `<footer>Conteúdo educacional produzido pelo Endodirect a partir das diretrizes citadas. Não substitui a leitura do documento original nem o julgamento clínico.
  <br><a href="${esc(base)}/resumos">Todos os resumos</a> · <a href="${esc(base)}/">Plataforma</a> · <a href="${esc(base)}/privacidade">Privacidade</a> · <a href="${esc(base)}/termos">Termos</a></footer>`;
}
function documento({ titulo, desc, canonical, corpo, jsonld }) {
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Endodirect">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<style>${CSS}</style>
${jsonld ? '<script type="application/ld+json">' + JSON.stringify(jsonld).replace(/</g, '\\u003c') + '</script>' : ''}
</head><body>${cabecalho()}<div class="wrap">${corpo}</div></body></html>`;
}

// ── Página de um capítulo ───────────────────────────────────────────────────
function paginaCapitulo(item, base) {
  const b = base || publicBase();
  const url = b + '/resumo/' + encodeURIComponent(item.slug);
  const desc = descricao(item.resumo);
  const pts = Array.isArray(item.pts) ? item.pts.filter((x) => String(x || '').trim()) : [];
  const corpo = `<article class="card">
<h1>${esc(item.tema)}</h1>
<div>${item.sub ? '<span class="badge">' + esc(item.sub) + '</span>' : ''}${item.ano ? '<span class="badge">' + esc(item.ano) + '</span>' : ''}</div>
<p class="meta">${item.fonte ? 'Fonte: ' + esc(item.fonte) : ''}${item.url ? ' · <a href="' + esc(item.url) + '" rel="nofollow noopener" target="_blank">documento original</a>' : ''}</p>
${mdToHtml(item.resumo)}
${pts.length ? '<div class="pts"><h2>Pontos-chave</h2><ul>' + pts.map((p) => '<li>' + inline(String(p)) + '</li>').join('') + '</ul></div>' : ''}
<p class="aviso">Resumo de estudo. Confira sempre o documento original antes de aplicar qualquer conduta.</p>
</article>
<div class="box">
  <h2>Flashcards, mapa mental e questões deste tema</h2>
  <p style="margin:0 0 14px;color:#475569;font-size:15px">Este resumo é a parte aberta. Na plataforma ele vem com flashcards de repetição espaçada, mapa mental, questões comentadas por banca e a Questão do Dia.</p>
  <a class="cta" href="${esc(b)}/">Abrir a plataforma</a>
</div>
${formNewsletter('resumo:' + item.slug)}
${rodape(b)}`;
  return documento({
    titulo: item.tema + ' — Endodirect',
    desc,
    canonical: url,
    corpo,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: item.tema,
      description: desc,
      inLanguage: 'pt-BR',
      url,
      about: item.sub || undefined,
      isPartOf: { '@type': 'WebSite', name: 'Endodirect', url: b },
      publisher: { '@type': 'Organization', name: 'Endodirect', url: b },
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician' },
    },
  });
}

// ── Índice (hub) ────────────────────────────────────────────────────────────
function paginaIndice(itens, base) {
  const b = base || publicBase();
  const porSub = {};
  (itens || []).forEach((it) => { (porSub[it.sub || 'Geral'] = porSub[it.sub || 'Geral'] || []).push(it); });
  const secoes = Object.keys(porSub).sort((a, z) => a.localeCompare(z, 'pt-BR')).map((s) =>
    `<h2>${esc(s)}</h2><ul class="lista">` + porSub[s]
      .sort((a, z) => String(a.tema).localeCompare(String(z.tema), 'pt-BR'))
      .map((it) => `<li><a href="${esc(b)}/resumo/${esc(it.slug)}">${esc(it.tema)}</a>${it.ano ? ' <span style="color:#94a3b8;font-size:14px">· ' + esc(it.ano) + '</span>' : ''}</li>`)
      .join('') + '</ul>').join('');
  const desc = 'Resumos de diretrizes e consensos de endocrinologia em português: ' + (itens || []).length
    + ' temas com pontos-chave, das sociedades brasileiras e internacionais.';
  return documento({
    titulo: 'Resumos de diretrizes de endocrinologia — Endodirect',
    desc,
    canonical: b + '/resumos',
    corpo: `<article class="card"><h1>Resumos de diretrizes de endocrinologia</h1>
<p class="meta">${(itens || []).length} temas, com o que a diretriz recomenda e por quê. Atualizados conforme as sociedades publicam.</p>
${secoes}</article>
${formNewsletter('indice')}
${rodape(b)}`,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Resumos de diretrizes de endocrinologia',
      description: desc,
      inLanguage: 'pt-BR',
      url: b + '/resumos',
      isPartOf: { '@type': 'WebSite', name: 'Endodirect', url: b },
    },
  });
}

function paginaNaoEncontrada(base) {
  const b = base || publicBase();
  return documento({
    titulo: 'Resumo não encontrado — Endodirect',
    desc: 'Esta página não existe ou o resumo saiu do ar.',
    canonical: b + '/resumos',
    corpo: `<article class="card"><h1>Este resumo não está aqui</h1>
<p>O endereço pode ter mudado, ou o capítulo saiu da parte aberta.</p>
<p><a class="cta" href="${esc(b)}/resumos">Ver todos os resumos</a></p></article>${rodape(b)}`,
  });
}

function sitemapXml(itens, base) {
  const b = base || publicBase();
  const url = (loc, prio) => `  <url><loc>${esc(loc)}</loc><changefreq>weekly</changefreq><priority>${prio}</priority></url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + [url(b + '/', '1.0'), url(b + '/resumos', '0.9')]
      .concat((itens || []).map((it) => url(b + '/resumo/' + it.slug, '0.8')))
      .join('\n')
    + `\n</urlset>\n`;
}

module.exports = {
  slug, mdToHtml, descricao, esc,
  paginaCapitulo, paginaIndice, paginaNaoEncontrada, sitemapXml,
  formNewsletter, publicBase,
};
