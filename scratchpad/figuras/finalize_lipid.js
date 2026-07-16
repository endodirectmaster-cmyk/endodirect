const fs=require('fs');
const cands=JSON.parse(fs.readFileSync(__dirname+'/candidates.json','utf8'));
const IDX=parseInt(process.argv[2]||'2',10); // 2 = figado-central (Opção A)
const svg=cands[IDX].svg;
// validações de segurança/conteúdo
const forbidden=['<image','<foreignObject','<script','href="http','xlink:href="http','@import','url(http'];
forbidden.forEach(f=>{ if(svg.toLowerCase().indexOf(f.toLowerCase())>=0) throw new Error('proibido no svg: '+f); });
if(svg.indexOf('<svg')!==0) throw new Error('não começa com <svg');
if(svg.lastIndexOf('</svg>')!==svg.length-6) throw new Error('não termina com </svg>');
const need=['Quil','nescente','VLDL','IDL','LDL','HDL','gado','CETP','LCAT','ABCA1','LPL','HPL','LDLR','AGL','Alvos terap'];
const miss=need.filter(t=>svg.indexOf(t)<0);
if(miss.length) throw new Error('faltam tokens: '+miss.join(', '));
fs.writeFileSync(__dirname+'/chosen_lipides.svg',svg);
const FIG={titulo:'Vias das lipoproteínas e alvos terapêuticos', svg:svg,
  fonte:'Esquema Endodirect das vias das lipoproteínas — exógena, endógena e transporte reverso do colesterol (conceito conforme a Atualização da Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose, SBC, 2017). Ilustração original.'};
const j=JSON.stringify([FIG]);
if(j.indexOf('$j$')>=0)throw new Error('$j$');
const sql='UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, \'{diretrizes}\', (\n'
 +'  SELECT jsonb_agg(\n'
 +'    CASE WHEN a->>\'privado\'=\'true\' AND a->>\'sub\'=\'Lípides\' AND a->>\'tema\'=\'Metabolismo Lipídico e Lipoproteínas\'\n'
 +'         THEN a || jsonb_build_object(\'figuras\', $j$'+j+'$j$::jsonb)\n'
 +'         ELSE a END ORDER BY ord)\n'
 +'  FROM jsonb_array_elements(payload->\'diretrizes\') WITH ORDINALITY t(a,ord)\n'
 +'))\nWHERE payload ? \'diretrizes\';';
fs.writeFileSync(__dirname+'/lipides_final.sql',sql);
console.log('OK idx',IDX,'| svg',svg.length,'chars | sql',sql.length,'bytes | tokens OK');
