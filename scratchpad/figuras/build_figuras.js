// Amostra de figuras ILUSTRATIVAS (esquemas PRÓPRIOS/originais) para resumos.
// Não reproduz figuras de livros — são diagramas autorais de fatos fisiológicos/
// condutas, com mini-referência à fonte do conceito. Gera:
//  - test.html (para conferir o render)
//  - figuras.sql (adiciona o campo `figuras` aos 3 resumos-alvo, por sub+tema)
const fs=require('fs');
const NAVY='#0b2545', GOLD='#d9b652', GOLDL='#e7cd7e', RED='#c0392b', INK='#20364e';
const DEFS='<defs>'
 +'<marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="'+GOLD+'"/></marker>'
 +'<marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="'+RED+'"/></marker>'
 +'</defs>';
function box(x,y,w,h,t1,t2){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="'+NAVY+'"/>'
   +'<text x="'+(x+w/2)+'" y="'+(y+ (t2?22:h/2+5))+'" fill="#fff" font-size="15" font-weight="700" text-anchor="middle">'+t1+'</text>'
   +(t2?'<text x="'+(x+w/2)+'" y="'+(y+40)+'" fill="'+GOLDL+'" font-size="11.5" text-anchor="middle">'+t2+'</text>':'');
}

// ── Figura 1 — Eixo HHA (Adrenal / Síndrome de Cushing) ──
const F1='<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS
 +box(130,14,220,52,'Hipotálamo','CRH')
 +'<line x1="240" y1="66" x2="240" y2="104" stroke="'+GOLD+'" stroke-width="3" marker-end="url(#ah)"/>'
 +box(130,106,220,52,'Hipófise','ACTH')
 +'<line x1="240" y1="158" x2="240" y2="196" stroke="'+GOLD+'" stroke-width="3" marker-end="url(#ah)"/>'
 +box(130,198,220,52,'Adrenal','Cortisol → tecidos')
 +'<path d="M350 224 C 445 220 445 40 350 40" fill="none" stroke="'+RED+'" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#ar)"/>'
 +'<text x="462" y="132" fill="'+RED+'" font-size="11.5" font-weight="700" text-anchor="middle" transform="rotate(90 462 132)">feedback negativo (−)</text>'
 +'<text x="120" y="132" fill="'+INK+'" font-size="11" text-anchor="end">ACTH-dependente</text>'
 +'<text x="120" y="224" fill="'+INK+'" font-size="11" text-anchor="end">ACTH-independente</text>'
 +'</svg>';

// ── Figura 2 — Eixo hipotálamo-hipófise-tireoide (Tireoide) ──
const F2='<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS
 +box(130,14,220,52,'Hipotálamo','TRH')
 +'<line x1="240" y1="66" x2="240" y2="104" stroke="'+GOLD+'" stroke-width="3" marker-end="url(#ah)"/>'
 +box(130,106,220,52,'Hipófise','TSH')
 +'<line x1="240" y1="158" x2="240" y2="196" stroke="'+GOLD+'" stroke-width="3" marker-end="url(#ah)"/>'
 +box(130,198,220,52,'Tireoide','T4 / T3 → tecidos')
 +'<path d="M350 224 C 445 220 445 40 350 40" fill="none" stroke="'+RED+'" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#ar)"/>'
 +'<text x="462" y="132" fill="'+RED+'" font-size="11.5" font-weight="700" text-anchor="middle" transform="rotate(90 462 132)">feedback negativo (−)</text>'
 +'<text x="120" y="140" fill="'+INK+'" font-size="10.5" text-anchor="end">↑TSH + ↓T4 =</text>'
 +'<text x="120" y="154" fill="'+INK+'" font-size="10.5" text-anchor="end">hipotireoidismo 1º</text>'
 +'</svg>';

// ── Figura 3 — Vias das lipoproteínas e alvos terapêuticos (Lípides) ──
function pill(x,y,w,t,fill){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="30" rx="8" fill="'+(fill||NAVY)+'"/><text x="'+(x+w/2)+'" y="'+(y+19)+'" fill="#fff" font-size="11.5" font-weight="700" text-anchor="middle">'+t+'</text>';}
const F3='<svg viewBox="0 0 620 330" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:600px;height:auto;font-family:Segoe UI,Arial,sans-serif">'+DEFS
 // via exógena
 +'<text x="14" y="34" fill="'+INK+'" font-size="12" font-weight="700">Exógena</text>'
 +pill(90,18,90,'Intestino')
 +'<line x1="180" y1="33" x2="214" y2="33" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +pill(216,18,110,'Quilomícron')
 +'<line x1="326" y1="33" x2="360" y2="33" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +'<text x="343" y="14" fill="'+INK+'" font-size="10" text-anchor="middle">LPL</text>'
 +pill(362,18,120,'Remanescente')
 +'<line x1="482" y1="33" x2="516" y2="33" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 // fígado (central)
 +'<rect x="518" y="12" width="90" height="120" rx="10" fill="'+NAVY+'"/><text x="563" y="66" fill="#fff" font-size="13" font-weight="700" text-anchor="middle">Fígado</text><text x="563" y="84" fill="'+GOLDL+'" font-size="10" text-anchor="middle">LDLR</text>'
 // via endógena
 +'<text x="14" y="118" fill="'+INK+'" font-size="12" font-weight="700">Endógena</text>'
 +pill(90,102,90,'VLDL')
 +'<line x1="180" y1="117" x2="214" y2="117" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +pill(216,102,80,'IDL')
 +'<line x1="296" y1="117" x2="330" y2="117" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +pill(332,102,90,'LDL')
 +'<line x1="422" y1="117" x2="516" y2="117" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +'<text x="470" y="110" fill="'+INK+'" font-size="9.5" text-anchor="middle">captação hepática</text>'
 // reversa
 +'<text x="14" y="202" fill="'+INK+'" font-size="12" font-weight="700">Reversa</text>'
 +pill(90,186,120,'Tecidos/macrófago')
 +'<line x1="210" y1="201" x2="244" y2="201" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +'<text x="227" y="182" fill="'+INK+'" font-size="9.5" text-anchor="middle">ABCA1</text>'
 +pill(246,186,90,'HDL',INK)
 +'<line x1="336" y1="201" x2="516" y2="201" stroke="'+GOLD+'" stroke-width="2.5" marker-end="url(#ah)"/>'
 +'<text x="426" y="194" fill="'+INK+'" font-size="9.5" text-anchor="middle">LCAT / transporte reverso</text>'
 // alvos terapêuticos
 +'<rect x="20" y="250" width="580" height="66" rx="10" fill="#f2ede0" stroke="'+GOLD+'"/>'
 +'<text x="34" y="270" fill="'+NAVY+'" font-size="12" font-weight="700">Alvos terapêuticos</text>'
 +'<text x="34" y="290" fill="'+INK+'" font-size="11">• Estatina ↑LDLR &#160;&#160; • Ezetimiba: absorção intestinal (NPC1L1)</text>'
 +'<text x="34" y="307" fill="'+INK+'" font-size="11">• iPCSK9 / inclisirana: preservam o LDLR &#160;&#160; • Fibrato/ômega-3: ↑LPL, ↓TG</text>'
 +'</svg>';

const R=[
 {sub:'Adrenal', tema:'Síndrome de Cushing',
  figuras:[{titulo:'Eixo hipotálamo-hipófise-adrenal (HHA) e feedback', svg:F1,
    fonte:'Esquema Endodirect — eixo HHA (fisiologia clássica; conceito conforme Endocrine Society). Ilustração original.'}]},
 {sub:'Tireoide', tema:'Tireoide: Avaliação da Função e Imagem',
  figuras:[{titulo:'Eixo hipotálamo-hipófise-tireoide (HPT) e feedback', svg:F2,
    fonte:'Esquema Endodirect — eixo HPT (fisiologia clássica; conceito conforme ATA). Ilustração original.'}]},
 {sub:'Lípides', tema:'Metabolismo Lipídico e Lipoproteínas',
  figuras:[{titulo:'Vias das lipoproteínas e alvos terapêuticos', svg:F3,
    fonte:'Esquema Endodirect — vias exógena/endógena/reversa (conceito conforme SBC/EAS). Ilustração original.'}]}
];

// test.html
const test='<!doctype html><meta charset="utf-8"><body style="background:#f7f3e9;font-family:Segoe UI,Arial,sans-serif;padding:20px;max-width:680px;margin:auto">'
 +R.map(function(r){var f=r.figuras[0];return '<figure style="margin:.9rem 0;background:#fff;border:1px solid #e5ddc9;border-radius:10px;padding:12px"><div style="color:'+NAVY+';font-weight:700;font-size:13px;margin-bottom:6px">🖼️ '+f.titulo+' <span style="color:#888;font-weight:400">('+r.sub+' — '+r.tema+')</span></div><div style="text-align:center;overflow-x:auto">'+f.svg+'</div><figcaption style="color:#8a8266;font-size:11px;margin-top:6px">'+f.fonte+'</figcaption></figure>';}).join('')
 +'</body>';
fs.writeFileSync(__dirname+'/test.html',test);

// figuras.sql — adiciona `figuras` por sub+tema (privado), preservando o resto
const arr=R.map(function(r){return {sub:r.sub,tema:r.tema,figuras:r.figuras};});
const j=JSON.stringify(arr);
if(j.indexOf('$j$')>=0)throw new Error('$j$');
const sql='UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, \'{diretrizes}\', (\n'
 +'  WITH m AS (SELECT $j$'+j+'$j$::jsonb AS arr)\n'
 +'  SELECT jsonb_agg(\n'
 +'    CASE WHEN a->>\'privado\'=\'true\' AND EXISTS (SELECT 1 FROM jsonb_array_elements((SELECT arr FROM m)) u WHERE u->>\'sub\'=a->>\'sub\' AND u->>\'tema\'=a->>\'tema\')\n'
 +'         THEN a || jsonb_build_object(\'figuras\', (SELECT u->\'figuras\' FROM jsonb_array_elements((SELECT arr FROM m)) u WHERE u->>\'sub\'=a->>\'sub\' AND u->>\'tema\'=a->>\'tema\' LIMIT 1))\n'
 +'         ELSE a END ORDER BY ord)\n'
 +'  FROM jsonb_array_elements(payload->\'diretrizes\') WITH ORDINALITY t(a,ord)\n'
 +'))\nWHERE payload ? \'diretrizes\';';
fs.writeFileSync(__dirname+'/figuras.sql',sql);
console.log('figuras:',R.length,'| test.html + figuras.sql gerados | sql bytes',sql.length);
R.forEach(function(r){console.log('  -',r.sub,'›',r.tema,'| svg chars',r.figuras[0].svg.length);});
