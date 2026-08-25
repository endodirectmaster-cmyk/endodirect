// Story do Instagram (1080×1920) — aula de estreia da Educação Médica
// Continuada, 02/09.
//
// ⚠️ VERSÃO 2, ENXUTA. A primeira trazia o dado (25–40%), barra de composição,
// três marcadores do que a aula cobre e a referência. O professor reprovou:
// *"mais objetivo apenas com o título da aula e a propaganda pra assistir"*.
// Story não é slide — é uma batida só. Ficaram: marca, título e convite.
//
// ⚠️ PALETA DA CASA: navy #0b2545 / gold #d9b652, do post anterior
// (scratchpad/ig_amiodarona/build_slides.js). Fundo escuro porque story é visto
// em tela cheia, e o professor liberou trocar.
//
// ⚠️ ÁREA SEGURA: o Instagram cobre ~200px no topo (perfil) e ~190px no rodapé
// (barra de resposta). `render.js` reprova o build se algum bloco sair disso.
//
// ⚠️ SEM O NOME DO PROFESSOR — pedido explícito dele.
const fs = require('fs');
const LOGO = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/logo.b64', 'utf8').trim();

const HTML = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
html,body{width:1080px;height:1920px}
:root{--gold:#d9b652;--gold2:#efd489;--mut:#a8bad2}
body{font-family:'Liberation Sans','DejaVu Sans',Arial,sans-serif;color:#fff}
.s{position:relative;width:1080px;height:1920px;overflow:hidden;
  background:radial-gradient(1150px 820px at 76% 16%,#1a4878 0%,rgba(26,72,120,0) 62%),
             radial-gradient(950px 720px at 10% 94%,#123256 0%,rgba(18,50,86,0) 60%),
             linear-gradient(168deg,#0b2545 0%,#081d35 54%,#0b2545 100%);
  padding:200px 90px 190px}
.s::before{content:"";position:absolute;top:0;left:0;right:0;height:9px;
  background:linear-gradient(90deg,var(--gold),var(--gold2) 55%,rgba(217,182,82,0))}
.s::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,rgba(0,0,0,0) 1px 48px)}
.z{position:relative;z-index:2;display:flex;flex-direction:column;height:100%}

.brand{display:flex;align-items:center;gap:18px}
.badge{width:78px;height:78px;border-radius:20px;background:#fff;display:flex;align-items:center;
  justify-content:center;box-shadow:0 10px 26px rgba(0,0,0,.3)}
.badge img{width:53px;height:53px;object-fit:contain}
.wm{font-size:34px;font-weight:800;letter-spacing:.4px}

/* o título é o herói: ocupa o miolo e respira */
.mid{flex:1;display:flex;flex-direction:column;justify-content:center}
.tag{display:inline-flex;align-self:flex-start;align-items:center;gap:12px;
  border:1.5px solid rgba(217,182,82,.55);border-radius:999px;padding:14px 26px;
  font-size:20px;font-weight:800;letter-spacing:3px;color:var(--gold2);text-transform:uppercase}
.tag i{width:9px;height:9px;border-radius:50%;background:var(--gold);font-style:normal}
h1{margin-top:44px;font-size:82px;line-height:1.13;font-weight:800;letter-spacing:-2.2px}
h1 em{font-style:normal;color:var(--gold2)}
.rule{margin-top:52px;width:172px;height:7px;border-radius:4px;
  background:linear-gradient(90deg,var(--gold),rgba(217,182,82,0))}

.foot{display:flex;align-items:center;gap:26px}
.when{background:var(--gold);color:#0b2545;border-radius:20px;padding:22px 30px;text-align:center;flex-shrink:0}
.when .d{font-size:56px;font-weight:800;line-height:1;letter-spacing:-1.5px}
.when .m{font-size:21px;font-weight:800;letter-spacing:2.8px;margin-top:7px}
.cta .t{font-size:40px;font-weight:800;line-height:1.2}
.cta .u{margin-top:11px;font-size:27px;color:var(--gold2);font-weight:700}
</style>
<div class="s"><div class="z">

  <div class="brand"><div class="badge"><img src="${LOGO}"></div><div class="wm">ENDODIRECT</div></div>

  <div class="mid">
    <div class="tag"><i></i>Aula gratuita</div>
    <h1>Como mitigar a perda de <em>massa magra</em> e funcionalidade em terapias incretínicas?</h1>
    <div class="rule"></div>
  </div>

  <div class="foot">
    <div class="when"><div class="d">02</div><div class="m">SET</div></div>
    <div class="cta"><div class="t">Assista de graça,<br>é só se cadastrar.</div><div class="u">endodirect.com.br</div></div>
  </div>

</div></div>`;

fs.writeFileSync(__dirname + '/story.html', HTML);
console.log('story.html gerado (' + HTML.length + ' chars)');
