// Refaz a figura de Metabolismo Lipídico (esquema PRÓPRIO, mais limpo/espaçado).
// Gera test_lip.html (conferir) + lipides_fig.sql (substitui `figuras` do resumo).
const fs=require('fs');
const NAVY='#0b2545', GOLD='#d9b652', GOLDL='#e7cd7e', INK='#20364e', SLATE='#33506e', CREAM='#f2ede0';
const DEFS='<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="'+GOLD+'"/></marker></defs>';
function box(x,y,w,t,fill){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" rx="8" fill="'+(fill||NAVY)+'"/><text x="'+(x+w/2)+'" y="'+(y+22)+'" fill="#fff" font-size="12.5" font-weight="700" text-anchor="middle">'+t+'</text>';}
function arr(x1,x2,y){return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>';}
function tag(x,y,t){return '<text x="'+x+'" y="'+y+'" fill="'+SLATE+'" font-size="10" text-anchor="middle">'+t+'</text>';}
function rowlbl(y,t){return '<text x="16" y="'+(y+22)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">'+t+'</text>';}

// Linhas base (y do topo de cada caixa)
const y1=40, y2=132, y3=224;
const cy1=y1+17, cy2=y2+17, cy3=y3+17;
let g='';
// faixas de fundo suaves p/ separar as vias
g+='<rect x="8" y="'+(y1-14)+'" width="624" height="70" rx="10" fill="#f6f2e6"/>';
g+='<rect x="8" y="'+(y3-14)+'" width="624" height="70" rx="10" fill="#f6f2e6"/>';

// Via exógena
g+=rowlbl(y1,'Exógena');
g+=box(96,y1,104,'Intestino')+arr(200,236,cy1)+tag(218,y1-6,'dieta')
 +box(238,y1,124,'Quilomícron')+arr(362,398,cy1)+tag(380,y1-6,'LPL')
 +box(400,y1,132,'Remanescente')+arr(532,566,cy1)
 +'<text x="600" y="'+(cy1+4)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800" text-anchor="middle">Fígado</text>';

// Via endógena
g+=rowlbl(y2,'Endógena');
g+='<text x="96" y="'+(cy2+4)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800">Fígado</text>'+arr(150,186,cy2)
 +box(188,y2,96,'VLDL')+arr(284,320,cy2)+tag(302,y2-6,'LPL')
 +box(322,y2,86,'IDL')+arr(408,444,cy2)
 +box(446,y2,96,'LDL')+arr(542,578,cy2)+tag(560,y2-6,'LDLR')
 +'<text x="606" y="'+(cy2+4)+'" fill="'+SLATE+'" font-size="10" text-anchor="middle">captação</text>';

// Via reversa
g+=rowlbl(y3,'Reversa');
g+=box(96,y3,150,'Tecidos / macrófago')+arr(246,282,cy3)+tag(264,y3-6,'ABCA1')
 +box(284,y3,86,'HDL',SLATE)+arr(370,470,cy3)+tag(420,y3-6,'LCAT · transporte reverso')
 +'<text x="520" y="'+(cy3+4)+'" fill="'+NAVY+'" font-size="12.5" font-weight="800" text-anchor="middle">Fígado</text>';

// Alvos terapêuticos
g+='<rect x="8" y="300" width="624" height="70" rx="10" fill="'+CREAM+'" stroke="'+GOLD+'"/>';
g+='<text x="24" y="322" fill="'+NAVY+'" font-size="12.5" font-weight="800">Alvos terapêuticos</text>';
g+='<text x="24" y="343" fill="'+INK+'" font-size="11.5">• Estatina: ↑LDLR  ·  Ezetimiba: absorção intestinal (NPC1L1)</text>';
g+='<text x="24" y="361" fill="'+INK+'" font-size="11.5">• iPCSK9 / inclisirana: preservam o LDLR  ·  Fibrato / ômega-3: ↑LPL, ↓TG</text>';

const SVG='<svg viewBox="0 0 640 384" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:620px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS+g+'</svg>';

const FIG={titulo:'Vias das lipoproteínas e alvos terapêuticos', svg:SVG,
  fonte:'Esquema Endodirect — vias exógena/endógena/reversa e alvos terapêuticos (conceito conforme SBC/EAS). Ilustração original.'};

// test html
fs.writeFileSync(__dirname+'/test_lip.html','<!doctype html><meta charset="utf-8"><body style="background:#f7f3e9;padding:20px;max-width:700px;margin:auto;font-family:Segoe UI,Arial,sans-serif"><figure style="background:#fff;border:1px solid #e5ddc9;border-radius:10px;padding:14px"><div style="color:'+NAVY+';font-weight:700;font-size:13px;margin-bottom:6px">🖼️ '+FIG.titulo+'</div><div style="text-align:center;overflow-x:auto">'+FIG.svg+'</div><figcaption style="color:#8a8266;font-size:11px;margin-top:6px">'+FIG.fonte+'</figcaption></figure></body>');

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
console.log('svg chars:',SVG.length,'| sql bytes:',sql.length);
