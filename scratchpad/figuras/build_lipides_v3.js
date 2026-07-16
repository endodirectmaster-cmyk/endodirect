// Metabolismo das lipoproteínas — esquema PRÓPRIO v3 (esferas com gradiente,
// 3 raias limpas com faixa de fundo, órgãos como nós, alvos terapêuticos).
// Arte 100% original (NÃO reproduz a figura da diretriz SBC nem de livros);
// ilustra apenas os FATOS das vias. Gera test_v3.html + v3.sql.
const fs=require('fs');
const NAVY='#0b2545', GOLD='#d9b652', INK='#20364e', SLATE='#33506e', CREAM='#f2ede0', LIVER='#9a4634';
// gradientes das lipoproteínas (centro claro → borda escura = aspecto de esfera)
const SPH=[
  ['qm','#fbeeb0','#e2ba46'],   // quilomícron
  ['rem','#f2dd8a','#d9b34a'],  // remanescente
  ['vldl','#e6b074','#b5773a'], // VLDL
  ['idl','#d59a5c','#9c5f2e'],  // IDL
  ['ldl','#c88a4e','#8f5624'],  // LDL
  ['hdl','#7cc0d6','#357a92'],  // HDL
];
const DEFS='<defs>'
 +'<marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="'+GOLD+'"/></marker>'
 +'<marker id="ahs" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="'+SLATE+'"/></marker>'
 +SPH.map(s=>'<radialGradient id="g_'+s[0]+'" cx="38%" cy="34%" r="72%"><stop offset="0%" stop-color="'+s[1]+'"/><stop offset="100%" stop-color="'+s[2]+'"/></radialGradient>').join('')
 +'</defs>';

// helpers
function band(y,h){return '<rect x="8" y="'+y+'" width="624" height="'+h+'" rx="12" fill="#f7f2e4"/>';}
function lane(y,t,col){return '<rect x="18" y="'+(y-10)+'" width="20" height="20" rx="5" fill="'+col+'"/>'
  +'<text x="46" y="'+(y+5)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">'+t+'</text>';}
function organ(cx,cy,w,t,fill){var x=cx-w/2;return '<rect x="'+x+'" y="'+(cy-17)+'" width="'+w+'" height="34" rx="9" fill="'+(fill||SLATE)+'"/>'
  +'<text x="'+cx+'" y="'+(cy+4)+'" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">'+t+'</text>';}
function sph(cx,cy,r,g,t){return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#g_'+g+')" stroke="#00000018" stroke-width="1"/>'
  +'<ellipse cx="'+(cx-r*0.28)+'" cy="'+(cy-r*0.32)+'" rx="'+(r*0.42)+'" ry="'+(r*0.28)+'" fill="#ffffff" opacity=".38"/>'
  +'<text x="'+cx+'" y="'+(cy+r+15)+'" fill="'+INK+'" font-size="11.5" font-weight="800" text-anchor="middle">'+t+'</text>';}
function arr(x1,y1,x2,y2){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+GOLD+'" stroke-width="2.6" marker-end="url(#ah)"/>';}
function tag(x,y,t){return '<text x="'+x+'" y="'+y+'" fill="'+SLATE+'" font-size="10" text-anchor="middle" font-weight="600">'+t+'</text>';}

let g='';
// faixas
const b1=44,b2=182,b3=320; const h=118;
g+=band(b1,h)+band(b2,h)+band(b3,h);
const y1=b1+62, y2=b2+58, y3=b3+58; // centrelines

// ── Exógena ──
g+=lane(b1+18,'Exógena',GOLD);
g+=organ(108,y1,84,'Intestino');
g+=arr(152,y1,180,y1)+tag(166,y1-24,'dieta');
g+=sph(232,y1,28,'qm','Quilomícron');
g+=arr(262,y1,356,y1)+tag(309,y1-30,'LPL');
g+='<text x="316" y="'+(y1+15)+'" fill="'+SLATE+'" font-size="9.5" text-anchor="middle" font-weight="600">→ AGL p/ tecidos</text>';
g+=sph(400,y1,20,'rem','Remanescente');
g+=arr(422,y1,482,y1);
g+=organ(540,y1,84,'Fígado',LIVER);

// ── Endógena ──
g+=lane(b2+18,'Endógena',SLATE);
g+=organ(96,y2,84,'Fígado',LIVER);
g+=arr(140,y2,168,y2);
g+=sph(206,y2,22,'vldl','VLDL');
g+=arr(230,y2,300,y2)+tag(265,y2-26,'LPL');
g+=sph(330,y2,18,'idl','IDL');
g+=arr(350,y2,410,y2)+tag(380,y2-24,'HPL');
g+=sph(436,y2,16,'ldl','LDL');
g+=arr(454,y2,520,y2)+tag(487,y2-22,'LDLR');
g+='<text x="566" y="'+(y2-2)+'" fill="'+SLATE+'" font-size="10.5" font-weight="700" text-anchor="middle">captação</text>'
 +'<text x="566" y="'+(y2+12)+'" fill="'+SLATE+'" font-size="9" text-anchor="middle">fígado/periferia</text>';

// ── Reversa ──
g+=lane(b3+18,'Reversa','#357a92');
g+=organ(120,y3,132,'Tecidos / macrófago');
g+=arr(188,y3,236,y3)+tag(212,y3-26,'ABCA1');
g+=sph(292,y3,18,'hdl','HDL');
g+=arr(314,y3,470,y3)+tag(392,y3-26,'LCAT · transporte reverso');
g+=organ(524,y3,84,'Fígado',LIVER);

// ── CETP (HDL ↔ VLDL/LDL) — curva que termina na LATERAL da LDL (livre do rótulo) ──
g+='<path d="M300 '+(y3-20)+' C 352 '+(y3-64)+', 402 '+(y2+52)+', 418 '+y2+'" fill="none" stroke="'+SLATE+'" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#ahs)" marker-start="url(#ahs)"/>';
g+='<rect x="352" y="'+(b2+h+1)+'" width="52" height="18" rx="9" fill="#e9edf2" stroke="'+SLATE+'" stroke-width="1"/>'
 +'<text x="378" y="'+(b2+h+13)+'" fill="'+SLATE+'" font-size="10.5" font-weight="800" text-anchor="middle">CETP</text>';

// ── Alvos terapêuticos ──
const ty=b3+h+16;
g+='<rect x="8" y="'+ty+'" width="624" height="72" rx="12" fill="'+CREAM+'" stroke="'+GOLD+'" stroke-width="1.4"/>';
g+='<text x="24" y="'+(ty+23)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">Alvos terapêuticos</text>';
g+='<text x="24" y="'+(ty+44)+'" fill="'+INK+'" font-size="11.5">• Estatina: ↑LDLR  ·  Ezetimiba: absorção intestinal (NPC1L1)</text>';
g+='<text x="24" y="'+(ty+63)+'" fill="'+INK+'" font-size="11.5">• iPCSK9 / inclisirana: preservam o LDLR  ·  Fibrato / ômega-3: ↑LPL, ↓TG</text>';

const H=ty+72+10;
const SVG='<svg viewBox="0 0 640 '+H+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:640px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS+g+'</svg>';

const FIG={titulo:'Vias das lipoproteínas e alvos terapêuticos', svg:SVG,
  fonte:'Esquema Endodirect das vias das lipoproteínas — exógena, endógena e transporte reverso do colesterol (conceito conforme a Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose, SBC, 2017). Ilustração original.'};

fs.writeFileSync(__dirname+'/test_v3.html','<!doctype html><meta charset="utf-8"><body style="background:#eef1f5;padding:24px;max-width:740px;margin:auto;font-family:Segoe UI,Arial,sans-serif"><figure style="background:#fff;border:1px solid #e5ddc9;border-radius:12px;padding:16px;box-shadow:0 2px 12px #0b254512"><div style="color:'+NAVY+';font-weight:700;font-size:13px;margin-bottom:8px">🖼️ '+FIG.titulo+'</div><div style="text-align:center;overflow-x:auto">'+FIG.svg+'</div><figcaption style="color:#8a8266;font-size:11px;margin-top:8px">'+FIG.fonte+'</figcaption></figure></body>');

const j=JSON.stringify([FIG]);
if(j.indexOf('$j$')>=0)throw new Error('$j$');
const sql='UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, \'{diretrizes}\', (\n'
 +'  SELECT jsonb_agg(\n'
 +'    CASE WHEN a->>\'privado\'=\'true\' AND a->>\'sub\'=\'Lípides\' AND a->>\'tema\'=\'Metabolismo Lipídico e Lipoproteínas\'\n'
 +'         THEN a || jsonb_build_object(\'figuras\', $j$'+j+'$j$::jsonb)\n'
 +'         ELSE a END ORDER BY ord)\n'
 +'  FROM jsonb_array_elements(payload->\'diretrizes\') WITH ORDINALITY t(a,ord)\n'
 +'))\nWHERE payload ? \'diretrizes\';';
fs.writeFileSync(__dirname+'/v3.sql',sql);
console.log('v3 svg chars:',SVG.length,'| height:',H);
