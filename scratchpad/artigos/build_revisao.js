// Gera a página de revisão dos artigos (trials) para o professor conferir os
// números antes de publicar. Saída: revisao-artigos.html
'use strict';
const fs = require('fs');
const path = require('path');
const { DIABETES, OBESIDADE, TODOS } = require('./trials.js');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Markdown inline: **negrito**, *itálico*, `código`.
function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

const isSep = (l) => /^\s*\|?[\s:\-|]+\|?\s*$/.test(l) && l.indexOf('-') >= 0;

// Markdown de bloco: ##/### , listas, tabelas, parágrafos.
function md(src) {
  const lines = String(src).split('\n');
  const out = [];
  let list = [];
  const flush = () => { if (list.length) { out.push('<ul>' + list.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ul>'); list = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flush(); continue; }
    if (isSep(line)) continue;
    if (/^###\s+/.test(line)) { flush(); out.push('<h4>' + inline(line.replace(/^###\s+/, '')) + '</h4>'); continue; }
    if (/^##\s+/.test(line)) { flush(); out.push('<h3>' + inline(line.replace(/^##\s+/, '')) + '</h3>'); continue; }
    if (line.indexOf('|') >= 0 && line.split('|').filter((c) => c.trim()).length >= 2) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].indexOf('|') >= 0) {
        if (!isSep(lines[i])) rows.push(lines[i].split('|').map((c) => c.trim()).filter(Boolean));
        i++;
      }
      i--;
      if (rows.length) {
        const [head, ...body] = rows;
        out.push('<div class="tw"><table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>'
          + body.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      }
      continue;
    }
    if (/^[-*]\s+/.test(line)) { list.push(line.replace(/^[-*]\s+/, '')); continue; }
    flush();
    out.push('<p>' + inline(line) + '</p>');
  }
  flush();
  return out.join('\n');
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Os 6 campos do card padronizado, na ordem em que são autorados.
const CAMPOS = ['População', 'Intervenção', 'Desfecho primário', 'Resultado-chave', 'Segurança', 'Na prática'];

function ficha(t) {
  const id = slug(t.tema);
  const linhas = t.pts.map((p, i) => {
    // Cada bullet começa com "**Rótulo** — texto"; separa rótulo do corpo.
    const m = p.match(/^\*\*(.+?)\*\*\s*—\s*([\s\S]+)$/) || p.match(/^💡\s*\*\*(.+?)\*\*\s*—\s*([\s\S]+)$/);
    const corpo = m ? m[2] : p;
    const destaque = i === 3 ? ' key' : (i === 5 ? ' pratica' : '');
    return '<div class="campo' + destaque + '">'
      + '<div class="rot">' + esc(CAMPOS[i] || '') + '</div>'
      + '<div class="val">' + inline(corpo) + '</div>'
      + '</div>';
  }).join('');

  const flash = t.flashcards.map((c) => '<div class="fc"><p class="q">' + inline(c.q) + '</p><p class="a">' + inline(c.a) + '</p></div>').join('');

  return `<article class="ficha" id="${id}">
  <header class="fh">
    <div>
      <h2>${esc(t.tema)}</h2>
      <p class="meta"><span class="chip ${slug(t.sub)}">${esc(t.sub)}</span><span class="ref">${esc(t.fonte)} · ${esc(t.ano)}</span></p>
    </div>
    <a class="doi" href="${esc(t.url)}" target="_blank" rel="noopener">Conferir publicação ↗</a>
  </header>
  <div class="campos">${linhas}</div>
  <details>
    <summary>Resumo completo <span class="hint">(o texto que o aluno lê)</span></summary>
    <div class="corpo">${md(t.resumo)}</div>
  </details>
  <details>
    <summary>${t.flashcards.length} flashcards</summary>
    <div class="flashes">${flash}</div>
  </details>
</article>`;
}

function indice(titulo, arr) {
  return `<section class="grupo">
  <h3 class="gt">${esc(titulo)} <span class="gc">${arr.length}</span></h3>
  <ol class="ix">${arr.map((t) => `<li><a href="#${slug(t.tema)}">${esc(t.tema)}</a><span class="ixr">${esc(t.fonte)} · ${esc(t.ano)}</span></li>`).join('')}</ol>
</section>`;
}

const nFlash = TODOS.reduce((a, t) => a + t.flashcards.length, 0);

const html = `<title>Artigos (trials) — revisão antes de publicar</title>
<style>
:root{
  --ground:#f6f8f7; --surface:#ffffff; --ink:#12201d; --muted:#5b6b68;
  --line:#dde5e3; --accent:#0f6e63; --accent-soft:#e6f2f0; --warn:#8d5c0f; --warn-soft:#fbf1de;
  --serif:ui-serif,Georgia,"Iowan Old Style","Times New Roman",serif;
  --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){
  :root{--ground:#0d1514;--surface:#15201e;--ink:#e4ecea;--muted:#93a5a1;
        --line:#24322f;--accent:#57c4b2;--accent-soft:#122b28;--warn:#d9a852;--warn-soft:#2a2214;}
}
:root[data-theme="dark"]{--ground:#0d1514;--surface:#15201e;--ink:#e4ecea;--muted:#93a5a1;
  --line:#24322f;--accent:#57c4b2;--accent-soft:#122b28;--warn:#d9a852;--warn-soft:#2a2214;}
:root[data-theme="light"]{--ground:#f6f8f7;--surface:#ffffff;--ink:#12201d;--muted:#5b6b68;
  --line:#dde5e3;--accent:#0f6e63;--accent-soft:#e6f2f0;--warn:#8d5c0f;--warn-soft:#fbf1de;}

*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);
  font-size:16px;line-height:1.6;-webkit-text-size-adjust:100%}
.wrap{max-width:64rem;margin:0 auto;padding:2.5rem 1.25rem 5rem;display:flex;flex-direction:column;gap:2.5rem}

/* ── cabeçalho ── */
.top{display:flex;flex-direction:column;gap:.9rem;border-bottom:2px solid var(--ink);padding-bottom:1.6rem}
.eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0}
h1{font-family:var(--serif);font-size:clamp(1.9rem,4.6vw,2.9rem);line-height:1.12;margin:0;text-wrap:balance;font-weight:600}
.lede{margin:0;max-width:42rem;color:var(--muted);font-size:1.03rem}
.stats{display:flex;flex-wrap:wrap;gap:.5rem 2rem;font-family:var(--mono);font-size:.8rem;
  font-variant-numeric:tabular-nums;color:var(--muted);margin-top:.3rem}
.stats b{color:var(--ink);font-weight:600}

.aviso{background:var(--warn-soft);border-left:3px solid var(--warn);border-radius:0 8px 8px 0;
  padding:1rem 1.15rem;display:flex;flex-direction:column;gap:.45rem}
.aviso h2{margin:0;font-family:var(--sans);font-size:.92rem;font-weight:700;letter-spacing:.01em}
.aviso p{margin:0;font-size:.9rem;color:var(--ink)}

/* ── índice ── */
.indices{display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:1.75rem}
.gt{font-family:var(--mono);font-size:.74rem;letter-spacing:.13em;text-transform:uppercase;
  color:var(--muted);margin:0 0 .7rem;display:flex;align-items:center;gap:.5rem}
.gc{background:var(--accent-soft);color:var(--accent);border-radius:99px;padding:.05rem .5rem;
  font-variant-numeric:tabular-nums}
.ix{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ix li{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;
  padding:.4rem 0;border-bottom:1px solid var(--line)}
.ix a{font-family:var(--serif);font-size:1rem;color:var(--ink);text-decoration:none;border-bottom:1px solid transparent}
.ix a:hover,.ix a:focus-visible{color:var(--accent);border-bottom-color:var(--accent)}
.ixr{font-family:var(--mono);font-size:.7rem;color:var(--muted);white-space:nowrap}

/* ── fichas ── */
.fichas{display:flex;flex-direction:column;gap:1.5rem}
.ficha{background:var(--surface);border:1px solid var(--line);border-radius:12px;
  padding:1.5rem 1.6rem;display:flex;flex-direction:column;gap:1.1rem;scroll-margin-top:1.5rem}
.fh{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}
.fh h2{font-family:var(--serif);font-size:1.42rem;margin:0 0 .35rem;font-weight:600;letter-spacing:-.01em}
.meta{margin:0;display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.chip{font-family:var(--mono);font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;
  padding:.15rem .55rem;border-radius:99px;background:var(--accent-soft);color:var(--accent);font-weight:600}
.ref{font-family:var(--mono);font-size:.76rem;color:var(--muted);font-variant-numeric:tabular-nums}
.doi{font-family:var(--mono);font-size:.75rem;color:var(--accent);text-decoration:none;
  border:1px solid var(--line);border-radius:99px;padding:.35rem .8rem;white-space:nowrap}
.doi:hover,.doi:focus-visible{border-color:var(--accent);background:var(--accent-soft)}

.campos{display:flex;flex-direction:column;gap:.1rem}
.campo{display:grid;grid-template-columns:9.5rem 1fr;gap:1rem;padding:.6rem 0;border-top:1px solid var(--line)}
.campo:first-child{border-top:0;padding-top:0}
.rot{font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;
  color:var(--muted);padding-top:.22rem}
.val{font-size:.95rem}
.campo.key{background:var(--accent-soft);border-radius:8px;padding:.75rem .9rem;margin:.35rem 0;border-top:0}
.campo.key .rot{color:var(--accent);font-weight:700}
.campo.key .val strong{font-family:var(--mono);font-size:.93em;font-variant-numeric:tabular-nums}
.campo.pratica .rot{color:var(--ink)}
.campo.pratica .val{font-style:italic}
@media (max-width:36rem){
  .campo{grid-template-columns:1fr;gap:.15rem}
  .rot{padding-top:0}
}

/* ── blocos recolhíveis ── */
details{border-top:1px solid var(--line);padding-top:.85rem}
summary{cursor:pointer;font-family:var(--mono);font-size:.75rem;letter-spacing:.07em;
  text-transform:uppercase;color:var(--accent);list-style:none;display:flex;align-items:center;gap:.45rem}
summary::-webkit-details-marker{display:none}
summary::before{content:"+";font-size:1rem;line-height:1;width:1rem;text-align:center}
details[open] summary::before{content:"–"}
summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.hint{text-transform:none;letter-spacing:0;color:var(--muted)}
.corpo{padding-top:.6rem;max-width:44rem}
.corpo h3{font-family:var(--serif);font-size:1.08rem;margin:1.3rem 0 .35rem;font-weight:600}
.corpo h3:first-child{margin-top:.4rem}
.corpo h4{font-size:.9rem;margin:1rem 0 .3rem;font-weight:700}
.corpo p{margin:.5rem 0}
.corpo ul{margin:.5rem 0;padding-left:1.15rem}
.corpo li{margin:.25rem 0}
.corpo code{font-family:var(--mono);font-size:.88em;background:var(--accent-soft);padding:.1rem .3rem;border-radius:4px}
.tw{overflow-x:auto;margin:.8rem 0}
table{border-collapse:collapse;width:100%;font-size:.88rem;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:.45rem .8rem;border-bottom:1px solid var(--line);white-space:nowrap}
th{font-family:var(--mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}

.flashes{display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:.8rem;padding-top:.7rem}
.fc{border:1px solid var(--line);border-radius:8px;padding:.8rem .9rem;background:var(--ground)}
.fc .q{margin:0 0 .4rem;font-weight:650;font-size:.88rem}
.fc .a{margin:0;font-size:.86rem;color:var(--muted)}

footer{border-top:1px solid var(--line);padding-top:1.25rem;color:var(--muted);font-size:.84rem}
footer p{margin:.3rem 0;max-width:44rem}
a{color:var(--accent)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
  <header class="top">
    <p class="eyebrow">Endodirect · Resumos › Artigos</p>
    <h1>16 estudos de Diabetes e Obesidade, prontos para sua revisão</h1>
    <p class="lede">Lote piloto da nova aba <strong>Artigos</strong>. Cada ficha segue o mesmo formato que o aluno verá no app. Confira principalmente o campo <strong>Resultado-chave</strong> — é onde estão os números.</p>
    <p class="stats"><span><b>${TODOS.length}</b> artigos</span><span><b>${DIABETES.length}</b> Diabetes</span><span><b>${OBESIDADE.length}</b> Obesidade</span><span><b>${nFlash}</b> flashcards</span><span>anos <b>1998–2025</b></span></p>
  </header>

  <div class="aviso">
    <h2>Ainda não está publicado</h2>
    <p>Nada disto foi gravado no banco — nenhum aluno vê este conteúdo por enquanto. A estrutura da aba já está no ar (vazia); assim que você aprovar, eu insiro os artigos e eles aparecem em Resumos → Artigos.</p>
    <p>Se algum número estiver errado ou algum estudo faltar, me diga qual e eu corrijo antes de subir.</p>
  </div>

  <div class="indices">
    ${indice('Diabetes', DIABETES)}
    ${indice('Obesidade', OBESIDADE)}
  </div>

  <main class="fichas">
    ${TODOS.map(ficha).join('\n')}
  </main>

  <footer>
    <p>Cada artigo entra como item privado da subespecialidade correspondente, na aba Artigos — os capítulos existentes não se misturam nem mudam de lugar.</p>
    <p>Os mapas mentais ficaram de fora deste lote, conforme combinado: entram depois, se você gostar do formato.</p>
  </footer>
</div>`;

const dest = path.join(__dirname, 'revisao-artigos.html');
fs.writeFileSync(dest, html);
console.log('✓ ' + dest + ' (' + (html.length / 1024).toFixed(0) + ' KB, ' + TODOS.length + ' fichas)');
