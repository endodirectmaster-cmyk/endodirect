const fs=require('fs');
const jpath='/root/.claude/projects/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/subagents/workflows/wf_52dd4edf-4c0/journal.jsonl';
const lines=fs.readFileSync(jpath,'utf8').split('\n').filter(Boolean);
const cands=[];
for(const ln of lines){
  let o; try{o=JSON.parse(ln);}catch(e){continue;}
  // find result entries with an svg
  const cand=findSvg(o);
  if(cand) cands.push(cand);
}
function findSvg(o){
  if(o&&typeof o==='object'){
    if(typeof o.svg==='string'&&o.svg.indexOf('<svg')>=0) return {style:o.style||'',svg:o.svg,notes:o.notes||''};
    for(const k of Object.keys(o)){const r=findSvg(o[k]); if(r) return r;}
  }
  return null;
}
// dedup by svg
const seen=new Set(); const uniq=[];
for(const c of cands){const key=c.svg.slice(0,80); if(seen.has(key))continue; seen.add(key); uniq.push(c);}
console.log('found',uniq.length,'candidate svgs');
const NAMES=['esferas-organicas','flat-moderno','figado-central','esferas-densidade','raias-editorial'];
uniq.forEach((c,i)=>{
  const name=NAMES[i]||('cand'+i);
  const html='<!doctype html><meta charset="utf-8"><body style="background:#eef1f5;padding:20px;max-width:720px;margin:auto;font-family:Segoe UI,Arial,sans-serif"><div style="font:700 13px Segoe UI;color:#0b2545;margin-bottom:6px">['+name+']</div><figure style="background:#fff;border:1px solid #e5ddc9;border-radius:12px;padding:14px"><div style="text-align:center;overflow-x:auto">'+c.svg+'</div></figure></body>';
  fs.writeFileSync(__dirname+'/cand_'+i+'.html',html);
  console.log(i,name,'svg_len',c.svg.length);
});
fs.writeFileSync(__dirname+'/candidates.json',JSON.stringify(uniq,null,0));
