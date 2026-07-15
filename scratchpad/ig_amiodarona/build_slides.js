const fs=require('fs');
const LOGO='data:image/png;base64,'+fs.readFileSync(__dirname+'/logo.b64','utf8').trim();

const CSS=`
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
html,body{width:1080px;height:1350px}
:root{
  --navy:#0b2545; --navy2:#15325c; --ink:#1b2735; --mut:#5c6b7d;
  --gold:#d9b652; --gold2:#e7cd7e; --line:#e7e0cf;
  --bg1:#f7f3e9; --bg2:#fbf8f0; --card:#ffffff;
}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;
  background:linear-gradient(160deg,var(--bg1) 0%,var(--bg2) 55%,#f4efe2 100%);
  font-family:'Segoe UI',-apple-system,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);
  padding:80px 84px 76px}
.slide::before{content:"";position:absolute;top:0;left:0;right:0;height:10px;
  background:linear-gradient(90deg,var(--gold),var(--gold2) 60%,var(--navy))}
.brand{display:flex;align-items:center;gap:16px}
.brand .badge{width:66px;height:66px;border-radius:16px;background:#fff;
  box-shadow:0 6px 18px rgba(11,37,69,.10);display:flex;align-items:center;justify-content:center}
.brand .badge img{width:44px;height:44px;object-fit:contain}
.brand .wm{font-size:31px;font-weight:800;color:var(--navy);letter-spacing:.3px}
.brand .wm b{color:var(--gold)}
.kicker{display:inline-block;margin-top:54px;font-size:20px;font-weight:800;letter-spacing:2.4px;
  color:var(--navy);text-transform:uppercase}
.kicker .n{color:var(--gold);margin-right:10px}
h1{margin-top:22px;font-size:70px;line-height:1.03;font-weight:800;color:var(--navy);letter-spacing:-1px}
h2{margin-top:14px;font-size:52px;line-height:1.06;font-weight:800;color:var(--navy);letter-spacing:-.5px}
.sub{margin-top:26px;font-size:31px;line-height:1.34;color:var(--mut);font-weight:500;max-width:900px}
ul{margin-top:30px;list-style:none;display:flex;flex-direction:column;gap:20px}
li{position:relative;padding-left:44px;font-size:28px;line-height:1.38;color:var(--ink)}
li::before{content:"";position:absolute;left:6px;top:13px;width:14px;height:14px;border-radius:50%;
  background:var(--gold);box-shadow:0 0 0 5px rgba(217,182,82,.20)}
li b{color:var(--navy);font-weight:700}
.foot{position:absolute;left:84px;right:84px;bottom:60px;display:flex;align-items:center;
  justify-content:space-between;font-size:23px;color:var(--mut);font-weight:600}
.foot .hd{color:var(--navy);font-weight:800}
.swipe{color:var(--navy);font-weight:800}
/* tabela */
table{width:100%;margin-top:32px;border-collapse:separate;border-spacing:0;border-radius:18px;overflow:hidden;
  box-shadow:0 10px 30px rgba(11,37,69,.10);font-size:25px}
thead th{background:var(--navy);color:#fff;font-weight:800;text-align:left;padding:22px 24px;font-size:25px}
thead th:first-child{width:34%}
tbody td{background:#fff;padding:20px 24px;border-top:1px solid #eee;vertical-align:top;line-height:1.3}
tbody tr:nth-child(even) td{background:#faf7ee}
td.k{font-weight:800;color:var(--navy)}
.t1{color:#b26a17;font-weight:700}
.t2{color:#1f6f57;font-weight:700}
.note{margin-top:26px;font-size:24px;color:var(--mut);line-height:1.4}
.note b{color:var(--navy)}
/* caixa destaque */
.box{margin-top:34px;background:#fff;border:2px solid var(--line);border-left:12px solid var(--gold);
  border-radius:16px;padding:30px 34px;box-shadow:0 8px 24px rgba(11,37,69,.07)}
.box .bt{font-size:24px;font-weight:800;color:var(--navy);letter-spacing:.4px;text-transform:uppercase}
.box p{margin-top:12px;font-size:29px;line-height:1.36;color:var(--ink)}
/* gráfico de barras */
.chart{margin-top:34px;background:#fff;border-radius:18px;padding:34px 36px;
  box-shadow:0 10px 30px rgba(11,37,69,.10)}
.chart .ct{font-size:26px;font-weight:800;color:var(--navy)}
.bar{margin-top:26px}
.bar .lbl{display:flex;justify-content:space-between;font-size:24px;font-weight:700;color:var(--ink);margin-bottom:10px}
.bar .lbl .v{color:var(--navy);font-weight:800}
.track{height:40px;border-radius:20px;background:#eef0f3;overflow:hidden}
.fill{height:100%;border-radius:20px}
.fill.big{width:100%;background:linear-gradient(90deg,#b21f2d,#e05a3a)}
.fill.small{width:2.3%;background:linear-gradient(90deg,var(--gold),var(--gold2))}
.chart .cap{margin-top:20px;font-size:21px;color:var(--mut)}
/* CTA */
.cta{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.cta .badge{width:120px;height:120px;border-radius:28px}
.cta .badge img{width:80px;height:80px}
.cta h1{margin-top:36px;font-size:64px}
.cta .sub{text-align:center;margin-left:auto;margin-right:auto;max-width:840px}
.pill{margin-top:44px;display:inline-flex;gap:16px;align-items:center;background:var(--navy);color:#fff;
  font-size:34px;font-weight:800;padding:26px 46px;border-radius:60px;box-shadow:0 14px 34px rgba(11,37,69,.25)}
.pill .dot{width:16px;height:16px;border-radius:50%;background:var(--gold)}
.handle{margin-top:34px;font-size:28px;font-weight:700;color:var(--mut)}
.chips{margin-top:34px;display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:860px}
.chip{background:#fff;border:2px solid var(--line);border-radius:40px;padding:14px 26px;font-size:24px;
  font-weight:700;color:var(--navy);box-shadow:0 6px 16px rgba(11,37,69,.06)}
`;

function brand(){return `<div class="brand"><div class="badge"><img src="${LOGO}"></div><div class="wm">Endo<b>direct</b></div></div>`;}

// Ilustração vetorial: amiodarona (cápsula) liberando iodo (I) sobre a tireoide.
const ILLUS=`<svg viewBox="120 86 602 486" xmlns="http://www.w3.org/2000/svg" style="width:892px;height:auto">
  <defs>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e7cd7e" stop-opacity=".40"/><stop offset="70%" stop-color="#e7cd7e" stop-opacity=".10"/><stop offset="100%" stop-color="#e7cd7e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gnavy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#204a7d"/><stop offset="100%" stop-color="#0b2545"/></linearGradient>
    <linearGradient id="ggold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eed595"/><stop offset="100%" stop-color="#d9b652"/></linearGradient>
  </defs>
  <circle cx="575" cy="330" r="240" fill="url(#halo)"/>
  <g>
    <rect x="566" y="392" width="18" height="74" rx="9" fill="#9aa7b4" opacity=".40"/>
    <path d="M0,-96 C50,-98 70,-50 60,10 C53,58 30,104 4,116 C-4,116 -12,96 -20,66 C-30,26 -34,-40 -12,-84 C-8,-92 -4,-96 0,-96 Z" transform="translate(592 300) rotate(13)" fill="url(#gnavy)"/>
    <path d="M0,-96 C-50,-98 -70,-50 -60,10 C-53,58 -30,104 -4,116 C4,116 12,96 20,66 C30,26 34,-40 12,-84 C8,-92 4,-96 0,-96 Z" transform="translate(528 300) rotate(-13)" fill="url(#gnavy)"/>
    <rect x="530" y="356" width="60" height="46" rx="20" fill="url(#gnavy)"/>
    <path d="M0,-96 C50,-98 70,-50 60,10" transform="translate(592 300) rotate(13)" fill="none" stroke="#e7cd7e" stroke-width="6" opacity=".55" stroke-linecap="round"/>
    <path d="M0,-96 C-50,-98 -70,-50 -60,10" transform="translate(528 300) rotate(-13)" fill="none" stroke="#e7cd7e" stroke-width="6" opacity=".55" stroke-linecap="round"/>
  </g>
  <g transform="rotate(-24 230 165)">
    <rect x="150" y="140" width="170" height="62" rx="31" fill="#0b2545"/>
    <rect x="235" y="140" width="85" height="62" rx="31" fill="url(#ggold)"/>
    <ellipse cx="186" cy="160" rx="20" ry="8" fill="#ffffff" opacity=".18"/>
  </g>
  <path d="M300 236 C372 252 404 250 452 288" fill="none" stroke="#d9b652" stroke-width="5" stroke-dasharray="3 14" stroke-linecap="round"/>
  <g font-family="'Segoe UI',Arial,sans-serif" font-weight="800" text-anchor="middle">
    <g><circle cx="332" cy="250" r="26" fill="url(#ggold)" stroke="#0b2545" stroke-width="3"/><text x="332" y="260" font-size="26" fill="#0b2545">I</text></g>
    <g><circle cx="396" cy="238" r="22" fill="url(#ggold)" stroke="#0b2545" stroke-width="3"/><text x="396" y="247" font-size="22" fill="#0b2545">I</text></g>
    <g><circle cx="456" cy="266" r="24" fill="url(#ggold)" stroke="#0b2545" stroke-width="3"/><text x="456" y="275" font-size="23" fill="#0b2545">I</text></g>
    <g opacity=".95"><circle cx="512" cy="304" r="18" fill="url(#ggold)" stroke="#0b2545" stroke-width="3"/><text x="512" y="312" font-size="18" fill="#0b2545">I</text></g>
  </g>
  <text x="196" y="120" font-family="'Segoe UI',Arial,sans-serif" font-size="24" font-weight="800" fill="#0b2545" text-anchor="middle" transform="rotate(-24 196 120)">Amiodarona</text>
  <text x="392" y="198" font-family="'Segoe UI',Arial,sans-serif" font-size="21" font-weight="700" fill="#8a6d1e" text-anchor="middle">sobrecarga de iodo</text>
  <text x="560" y="520" font-family="'Segoe UI',Arial,sans-serif" font-size="24" font-weight="800" fill="#0b2545" text-anchor="middle">Tireoide</text>
</svg>`;
function page(inner){return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="slide">${inner}</div></body></html>`;}

const slides=[];

// SLIDE 1 — capa
slides.push(page(`
  ${brand()}
  <div class="kicker" style="margin-top:44px"><span class="n">●</span>Endocrinologia · Atualização clínica</div>
  <h1 style="margin-top:18px;font-size:62px">Disfunção tireoidiana<br>induzida por amiodarona</h1>
  <div class="sub" style="margin-top:18px">Farmacologia do iodo, hipotireoidismo e tireotoxicose — AIT tipo 1 × tipo 2.</div>
  <div style="margin-top:14px;text-align:center">${ILLUS}</div>
  <div class="foot"><span class="hd">@endodirect</span><span class="swipe">arraste →</span></div>
`));

// SLIDE 2 — farmacologia + gráfico
slides.push(page(`
  ${brand()}
  <div class="kicker"><span class="n">01</span>Por que acontece</div>
  <h2>A carga de iodo da amiodarona</h2>
  <div class="chart">
    <div class="ct">Iodo disponibilizado × necessidade diária</div>
    <div class="bar">
      <div class="lbl"><span>Amiodarona (200 mg/dia)</span><span class="v">~6.000–9.000 µg/dia</span></div>
      <div class="track"><div class="fill big"></div></div>
    </div>
    <div class="bar">
      <div class="lbl"><span>Necessidade diária de iodo</span><span class="v">~150 µg/dia</span></div>
      <div class="track"><div class="fill small"></div></div>
    </div>
    <div class="cap">Cada comprimido de 200 mg contém ~75 mg de iodo orgânico e libera 6–9 mg de iodo livre/dia — dezenas de vezes acima da recomendação.</div>
  </div>
  <ul>
    <li><b>Farmacocinética:</b> benzofurano lipofílico, meia-vida ~100 dias → acúmulo; efeitos persistem meses após suspender.</li>
    <li><b>Mecanismos:</b> efeito Wolff–Chaikoff; inibição da desiodase (↓ T4→T3); bloqueio do receptor de T3; citotoxicidade direta ao tireócito.</li>
  </ul>
  <div class="foot"><span class="hd">@endodirect</span><span class="swipe">arraste →</span></div>
`));

// SLIDE 3 — padrão laboratorial + hipotireoidismo
slides.push(page(`
  ${brand()}
  <div class="kicker"><span class="n">02</span>Padrão laboratorial · Hipotireoidismo</div>
  <h2>Como interpretar e o HIA</h2>
  <table>
    <thead><tr><th>Parâmetro (eutireóideo em uso)</th><th>Tendência</th></tr></thead>
    <tbody>
      <tr><td class="k">T4 livre</td><td>↑ no limite superior</td></tr>
      <tr><td class="k">T3</td><td>↓ (menor conversão)</td></tr>
      <tr><td class="k">TSH</td><td>↑ transitório nos 1ºs 3 meses → normaliza</td></tr>
    </tbody>
  </table>
  <div class="box">
    <div class="bt">Hipotireoidismo induzido (HIA)</div>
    <p>Mais comum em áreas <b>iodo-suficientes</b> e em <b>anti-TPO+/Hashimoto</b> (falha do escape do Wolff–Chaikoff). Laboratório: <b>TSH↑ com T4L baixo</b>. Conduta: <b>levotiroxina</b> — em geral <b>sem suspender a amiodarona</b>.</p>
  </div>
  <div class="note"><b>Dica:</b> avalie o TSH após ~3 meses (estado de equilíbrio) para não confundir a elevação transitória com disfunção.</div>
  <div class="foot"><span class="hd">@endodirect</span><span class="swipe">arraste →</span></div>
`));

// SLIDE 4 — tireotoxicose tipo 1 x tipo 2 (tabela)
slides.push(page(`
  ${brand()}
  <div class="kicker"><span class="n">03</span>Tireotoxicose</div>
  <h2>TIA: tipo 1 × tipo 2</h2>
  <table>
    <thead><tr><th>Característica</th><th class="t1">Tipo 1</th><th class="t2">Tipo 2</th></tr></thead>
    <tbody>
      <tr><td class="k">Tireoide de base</td><td>Doença prévia (bócio nodular / Graves)</td><td>Glândula normal</td></tr>
      <tr><td class="k">Mecanismo</td><td>Síntese excessiva por iodo (Jod-Basedow)</td><td>Tireoidite destrutiva</td></tr>
      <tr><td class="k">Doppler (vascularização)</td><td>Aumentada</td><td>Reduzida / ausente</td></tr>
      <tr><td class="k">Tratamento</td><td>Tionamida (metimazol) ± perclorato</td><td>Glicocorticoide (prednisona)</td></tr>
    </tbody>
  </table>
  <div class="note">Mais frequente em áreas <b>iodo-deficientes</b>. <b>Formas mistas/indeterminadas</b> são comuns → considerar <b>terapia combinada</b>; discutir com o cardiologista a manutenção da amiodarona.</div>
  <div class="foot"><span class="hd">@endodirect</span><span class="swipe">arraste →</span></div>
`));

// SLIDE 5 — CTA
slides.push(page(`
  <div class="cta">
    <div class="badge" style="background:#fff;box-shadow:0 10px 30px rgba(11,37,69,.14);display:flex;align-items:center;justify-content:center"><img src="${LOGO}"></div>
    <h1>Estude endocrino<br>de verdade</h1>
    <div class="sub">Resumos com fluxogramas de diretriz, banco de questões comentadas, mapas mentais e flashcards — tudo em um só lugar.</div>
    <div class="chips"><span class="chip">Resumos + fluxogramas</span><span class="chip">Questões comentadas</span><span class="chip">Mapas mentais</span><span class="chip">Flashcards</span></div>
    <div class="pill"><span class="dot"></span>endodirect.com.br</div>
    <div class="handle">@endodirect</div>
  </div>
`));

slides.forEach((h,i)=>fs.writeFileSync(__dirname+`/slide${i+1}.html`,h));
console.log('Escritos',slides.length,'slides HTML.');
