// Esquema PRÓPRIO do metabolismo das lipoproteínas — original, mais completo
// (vias exógena/endógena/reversa + AGL/LPL, HPL, CETP e LCAT). NÃO reproduz a
// figura da diretriz SBC 2017 (material protegido); apenas ilustra os fatos das
// vias, creditando a diretriz como fonte CONCEITUAL. Ilustração original.
// Gera test_lip.html (conferir) + lipides_fig.sql (substitui `figuras` do resumo).
const fs=require('fs');
const NAVY='#0b2545', GOLD='#d9b652', INK='#20364e', SLATE='#33506e', CREAM='#f2ede0';
const DEFS='<defs>'
 +'<marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="'+GOLD+'"/></marker>'
 +'<marker id="ahb" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="'+SLATE+'"/></marker>'
 +'</defs>';
function box(x,y,w,t,fill){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" rx="8" fill="'+(fill||NAVY)+'"/><text x="'+(x+w/2)+'" y="'+(y+22)+'" fill="#fff" font-size="12.5" font-weight="700" text-anchor="middle">'+t+'</text>';}
function liver(x,y,t){return '<text x="'+x+'" y="'+y+'" fill="'+NAVY+'" font-size="12.5" font-weight="800" text-anchor="middle">'+t+'</text>';}
function arr(x1,x2,y){return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>';}
function varr(x,y1,y2){return '<line x1="'+x+'" y1="'+y1+'" x2="'+x+'" y2="'+y2+'" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>';}
function tag(x,y,t){return '<text x="'+x+'" y="'+y+'" fill="'+SLATE+'" font-size="10" text-anchor="middle">'+t+'</text>';}
function rowlbl(y,t){return '<text x="16" y="'+(y+22)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">'+t+'</text>';}

// Linhas base (y do topo de cada caixa)
const y1=48, y2=150, y3=262;
const cy1=y1+17, cy2=y2+17, cy3=y3+17;
let g='';
// faixas de fundo suaves p/ separar as vias
g+='<rect x="8" y="'+(y1-16)+'" width="624" height="74" rx="10" fill="#f6f2e6"/>';
g+='<rect x="8" y="'+(y3-16)+'" width="624" height="74" rx="10" fill="#f6f2e6"/>';

// ── Via exógena (dieta → quilomícron → remanescente → fígado; LPL libera AGL) ──
g+=rowlbl(y1,'Exógena');
g+=box(96,y1,104,'Intestino')+arr(200,236,cy1)+tag(218,y1-6,'dieta')
 +box(238,y1,124,'Quilomícron')+arr(362,398,cy1)+tag(380,y1-6,'LPL')
 +box(400,y1,132,'Remanescente')+arr(532,566,cy1)
 +liver(600,cy1+4,'Fígado');
// ramo AGL para tecidos (a partir da lipólise pela LPL)
g+=varr(380,y1+34,y1+56)+'<text x="386" y="'+(y1+52)+'" fill="'+SLATE+'" font-size="10">AGL → tecidos</text>';

// ── Via endógena (fígado → VLDL → IDL → LDL; LPL, HPL, captação via LDLR) ──
g+=rowlbl(y2,'Endógena');
g+=liver(120,cy2+4,'Fígado')+arr(150,186,cy2)
 +box(188,y2,96,'VLDL')+arr(284,320,cy2)+tag(302,y2-6,'LPL')
 +box(322,y2,86,'IDL')+arr(408,444,cy2)+tag(426,y2-6,'HPL')
 +box(446,y2,96,'LDL')+arr(542,578,cy2)+tag(560,y2-6,'LDLR')
 +'<text x="606" y="'+(cy2+4)+'" fill="'+SLATE+'" font-size="10" text-anchor="middle">captação</text>';

// ── Via reversa (tecidos → HDL → fígado; ABCA1, LCAT/transporte reverso) ──
g+=rowlbl(y3,'Reversa');
g+=box(96,y3,150,'Tecidos / macrófago')+arr(246,282,cy3)+tag(264,y3-6,'ABCA1')
 +box(284,y3,86,'HDL',SLATE)+arr(370,470,cy3)+tag(420,y3-6,'LCAT · transporte reverso')
 +liver(520,cy3+4,'Fígado');

// ── CETP: transferência de ésteres de colesterol HDL ↔ VLDL/LDL (tracejado) ──
g+='<line x1="327" y1="'+y3+'" x2="470" y2="'+(y2+34)+'" stroke="'+SLATE+'" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ahb)" marker-start="url(#ahb)"/>';
g+='<rect x="372" y="'+(y2+58)+'" width="52" height="18" rx="9" fill="#eef1f5"/>'
 +'<text x="398" y="'+(y2+71)+'" fill="'+SLATE+'" font-size="10.5" font-weight="700" text-anchor="middle">CETP</text>';

// ── Alvos terapêuticos ──
const ty=340;
g+='<rect x="8" y="'+ty+'" width="624" height="70" rx="10" fill="'+CREAM+'" stroke="'+GOLD+'"/>';
g+='<text x="24" y="'+(ty+22)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">Alvos terapêuticos</text>';
g+='<text x="24" y="'+(ty+43)+'" fill="'+INK+'" font-size="11.5">• Estatina: ↑LDLR  ·  Ezetimiba: absorção intestinal (NPC1L1)</text>';
g+='<text x="24" y="'+(ty+61)+'" fill="'+INK+'" font-size="11.5">• iPCSK9 / inclisirana: preservam o LDLR  ·  Fibrato / ômega-3: ↑LPL, ↓TG</text>';

const H=ty+70+8;
const SVG='<svg viewBox="0 0 640 '+H+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:640px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS+g+'</svg>';

const FIG={titulo:'Vias das lipoproteínas e alvos terapêuticos', svg:SVG,
  fonte:'Esquema Endodirect das vias das lipoproteínas — exógena, endógena e transporte reverso do colesterol (conceito conforme a Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose, SBC, 2017). Ilustração original.'};

// test html
fs.writeFileSync(__dirname+'/test_lip.html','<!doctype html><meta charset="utf-8"><body style="background:#f7f3e9;padding:20px;max-width:720px;margin:auto;font-family:Segoe UI,Arial,sans-serif"><figure style="background:#fff;border:1px solid #e5ddc9;border-radius:10px;padding:14px"><div style="color:'+NAVY+';font-weight:700;font-size:13px;margin-bottom:6px">🖼️ '+FIG.titulo+'</div><div style="text-align:center;overflow-x:auto">'+FIG.svg+'</div><figcaption style="color:#8a8266;font-size:11px;margin-top:6px">'+FIG.fonte+'</figcaption></figure></body>');

// SQL: substitui figuras do resumo Lípides/Metabolismo
const j=JSON.stringify([FIG]);
if(j.indexOf('$j$')>=0)throw new Error('$j$');
const sql='UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, \'{diretrizes}\', (\n'
 +'  SELECT jsonb_agg(\n'
 +'    CASE WHEN a->>\'privado\'=\'true\' AND a->>\'sub\'=\'Lípides\' AND a->>\'tema\'=\'Metabolismo Lipídico e Lipoproteínas\'\n'
 +'         THEN a || jsonb_build_object(\'figuras\', $j$'+j+'$j$::jsonb)\n'
 +'         ELSE a END ORDER BY ord)\n'
 +'  FROM jsonb_array_elements(payload->\'diretrizes\') WITH ORDINALITY t(a,ord)\n'
 +'))\nWHERE payload ? \'diretrizes\';';
fs.writeFileSync(__dirname+'/lipides_fig.sql',sql);
console.log('svg chars:',SVG.length,'| height:',H,'| sql bytes:',sql.length);
