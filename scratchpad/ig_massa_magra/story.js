// Story do Instagram (1080×1920) para a aula de estreia da Educação Médica
// Continuada, em 02/09.
//
// ⚠️ PALETA DA CASA, não inventada: navy #0b2545 / gold #d9b652 vêm do post de
// Instagram anterior (scratchpad/ig_amiodarona/build_slides.js). O que muda é o
// FUNDO — escuro, porque o professor liberou ("pode mudar o fundo") e porque
// story é visto em tela cheia, onde o escuro destaca no meio do feed.
//
// ⚠️ SEM FOTO DE BANCO DE IMAGENS: mesma decisão registrada para as capas dos
// cursos (direito de uso + a foto não tem nada a ver com a aula). A ilustração é
// desenhada aqui, e ELA ENSINA: mostra a fração do peso perdido que é massa
// magra, que é justamente o assunto da aula.
//
// ⚠️ ÁREA SEGURA: o Instagram cobre ~250px no topo (perfil) e ~250px no rodapé
// (barra de resposta). Todo conteúdo fica entre y=200 e y=1730.
//
// ⚠️ SEM O NOME DO PROFESSOR — pedido explícito dele.
const fs = require('fs');
const LOGO = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/logo.b64', 'utf8').trim();

// Fração de massa magra no peso perdido: 25–40% (Liu Z et al., JCEM 2025).
// A barra desenha 32%, dentro da faixa citada.
const PCT_MAGRA = 32;

const HTML = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
html,body{width:1080px;height:1920px}
:root{--navy:#0b2545;--gold:#d9b652;--gold2:#efd489;--mut:#9fb2cc}
body{font-family:'Liberation Sans','DejaVu Sans',Arial,sans-serif;color:#fff}
.s{position:relative;width:1080px;height:1920px;overflow:hidden;
  background:radial-gradient(1100px 780px at 78% 14%,#17406f 0%,rgba(23,64,111,0) 62%),
             radial-gradient(900px 700px at 12% 92%,#123256 0%,rgba(18,50,86,0) 60%),
             linear-gradient(168deg,#0b2545 0%,#092039 52%,#0b2545 100%);
  padding:200px 84px 190px}
.s::before{content:"";position:absolute;top:0;left:0;right:0;height:9px;
  background:linear-gradient(90deg,var(--gold),var(--gold2) 55%,rgba(217,182,82,0))}
.s::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.028) 0 1px,rgba(0,0,0,0) 1px 46px)}
.z{position:relative;z-index:2;display:flex;flex-direction:column;height:100%}

.brand{display:flex;align-items:center;gap:18px}
.badge{width:76px;height:76px;border-radius:19px;background:#fff;display:flex;align-items:center;
  justify-content:center;box-shadow:0 10px 26px rgba(0,0,0,.28)}
.badge img{width:52px;height:52px;object-fit:contain}
.wm{font-size:33px;font-weight:800;letter-spacing:.4px}
.kick{margin-top:46px;font-size:20px;font-weight:800;letter-spacing:3.2px;color:var(--gold);text-transform:uppercase}

.stat{margin-top:32px;display:flex;align-items:baseline;gap:16px}
.stat .n{font-size:152px;font-weight:800;line-height:.9;letter-spacing:-5px;
  background:linear-gradient(180deg,#fff 0%,var(--gold2) 96%);-webkit-background-clip:text;background-clip:text;color:transparent}
.stat .u{font-size:54px;font-weight:800;color:var(--gold2);letter-spacing:-1px}
.lead{margin-top:18px;font-size:43px;line-height:1.26;font-weight:600;color:#e8eefa;max-width:880px}
.lead b{color:#fff;font-weight:800}

.bar{margin-top:46px}
.bar .track{height:74px;border-radius:16px;overflow:hidden;display:flex;
  border:1px solid rgba(255,255,255,.16);box-shadow:0 12px 30px rgba(0,0,0,.26)}
.bar .fat{background:linear-gradient(180deg,#20507f,#173d63);display:flex;align-items:center;padding-left:26px}
.bar .lean{background:linear-gradient(180deg,var(--gold2),var(--gold));display:flex;align-items:center;justify-content:center}
.bar .fat span{font-size:25px;font-weight:700;color:#cfe0f5}
.bar .lean span{font-size:26px;font-weight:800;color:#0b2545}
.bar .cap{margin-top:15px;font-size:23px;line-height:1.45;color:var(--mut)}

.q{margin-top:52px;font-size:46px;line-height:1.24;font-weight:800;letter-spacing:-.6px;
  padding-left:26px;border-left:6px solid var(--gold)}
.na{margin-top:60px}
.na .h{font-size:19px;font-weight:800;letter-spacing:3.2px;color:var(--gold);text-transform:uppercase}
.na ul{margin-top:24px;list-style:none;display:flex;flex-direction:column;gap:20px}
.na li{display:flex;gap:18px;align-items:flex-start;font-size:30px;line-height:1.34;color:#dce6f5}
.na li .m{width:11px;height:11px;border-radius:3px;background:var(--gold);flex-shrink:0;margin-top:12px;transform:rotate(45deg)}
.na li b{color:#fff;font-weight:800}
.src{margin-top:34px;font-size:20px;line-height:1.5;color:var(--mut)}

.foot{margin-top:auto;padding-top:46px;display:flex;align-items:center;gap:24px}
.when{background:var(--gold);color:#0b2545;border-radius:18px;padding:18px 28px;text-align:center;flex-shrink:0}
.when .d{font-size:48px;font-weight:800;line-height:1;letter-spacing:-1px}
.when .m{font-size:20px;font-weight:800;letter-spacing:2.6px;margin-top:6px}
.cta .t{font-size:34px;font-weight:800;line-height:1.22}
.cta .u{margin-top:9px;font-size:25px;color:var(--gold2);font-weight:700}
</style>
<div class="s"><div class="z">

  <div class="brand"><div class="badge"><img src="${LOGO}"></div><div class="wm">ENDODIRECT</div></div>

  <div class="kick">Educação Médica Continuada · Aula gratuita</div>

  <div class="stat"><div class="n">25–40</div><div class="u">%</div></div>
  <div class="lead">do peso perdido com <b>terapias incretínicas</b> é <b>massa magra</b>.</div>

  <div class="bar">
    <div class="track">
      <div class="fat" style="width:${100 - PCT_MAGRA}%"><span>gordura</span></div>
      <div class="lean" style="width:${PCT_MAGRA}%"><span>massa magra</span></div>
    </div>
    <div class="cap">Composição do peso perdido — e o VO₂ pico não melhora de forma consistente.</div>
  </div>

  <div class="q">Como mitigar a perda de massa magra e funcionalidade em terapias incretínicas?</div>

  <div class="na">
    <div class="h">Na aula</div>
    <ul>
      <li><span class="m"></span><span>Quanto de <b>massa magra</b> se perde em cada ensaio — e por que o número assusta menos do que parece.</span></li>
      <li><span class="m"></span><span>Por que <b>peso não é desfecho</b>: o que medir de função antes e durante o tratamento.</span></li>
      <li><span class="m"></span><span>O que <b>preserva</b> massa e função — treino resistido, proteína e o que ainda é promessa.</span></li>
    </ul>
  </div>

  <div class="src">Liu Z, Weeldreyer NR, Angadi SS. J Clin Endocrinol Metab. 2025;110(10):2709–2717.</div>

  <div class="foot">
    <div class="when"><div class="d">02</div><div class="m">SET</div></div>
    <div class="cta"><div class="t">Assista de graça,<br>é só se cadastrar.</div><div class="u">endodirect.com.br</div></div>
  </div>

</div></div>`;

fs.writeFileSync(__dirname + '/story.html', HTML);
console.log('story.html gerado (' + HTML.length + ' chars)');
