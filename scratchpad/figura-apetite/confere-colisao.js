const fs=require('fs');
const {chromium}=require('/tmp/pwlib/node_modules/playwright-core');
const html=fs.readFileSync('/home/user/endodirect/index.html','utf8');
const css=[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const svg=fs.readFileSync('/home/user/endodirect/scratchpad/figura-apetite/apetite.svg','utf8');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  let alertas=0;
  for(const [tema,arq] of [['dark','/home/user/endodirect/scratchpad/figura-apetite/previa-escuro.png'],
                           ['light','/home/user/endodirect/scratchpad/figura-apetite/previa-claro.png']]){
    const p=await b.newPage({viewport:{width:1000,height:1000},deviceScaleFactor:2});
    await p.setContent('<html data-theme="'+tema+'"><head><style>'+css+'</style></head><body>'
      +'<div style="width:940px;margin:16px auto"><div class="dir-card" style="width:100%;padding:16px">'
      +'<figure class="dir-fig" style="margin:.7rem 0"><div class="dfx-title">🖼️ Controle hipotalâmico do apetite</div>'
      +'<div style="text-align:center;overflow-x:auto;margin:.35rem 0">'+svg+'</div></figure></div></div></body></html>');
    const r=await p.evaluate(()=>{
      const s=document.querySelector('svg');
      const vb=s.viewBox.baseVal;
      const txt=[...s.querySelectorAll('text')].map(t=>{
        const bb=t.getBBox();
        return {t:t.textContent.slice(0,30),x:bb.x,y:bb.y,w:bb.width,h:bb.height,rec:t.classList.contains('ap-rec')};
      });
      // sobreposição entre caixas de texto
      const choques=[];
      for(let i=0;i<txt.length;i++)for(let j=i+1;j<txt.length;j++){
        const a=txt[i],c=txt[j];
        const ox=Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x);
        const oy=Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y);
        if(ox>2&&oy>2) choques.push(a.t+' ✕ '+c.t);
      }
      // ⚠️ TEXTO CONTRA TRAÇO. A primeira versão do verificador só comparava texto
      // com texto e deu "sem colisão" num desenho em que a seta da grelina cortava
      // o título "HORMÔNIOS PERIFÉRICOS" ao meio. Aqui cada caminho é amostrado ao
      // longo do comprimento e testado contra as caixas de texto.
      const tracos=[...s.querySelectorAll('path[stroke], line, rect[stroke]')];
      for(const el of tracos){
        let L=0; try{ L=el.getTotalLength(); }catch(e){ continue; }
        if(!L) continue;
        for(let d=0; d<=L; d+=4){
          let pt; try{ pt=el.getPointAtLength(d); }catch(e){ break; }
          for(const t of txt){
            if(t.rec&&el.tagName==='rect') continue;
            if(pt.x>t.x+1&&pt.x<t.x+t.w-1&&pt.y>t.y+1&&pt.y<t.y+t.h-1){
              const marca='traço ✕ "'+t.t+'" em ('+Math.round(t.x)+','+Math.round(t.y)+') — '+el.tagName+' '+String(el.getAttribute('d')||el.getAttribute('x')||'').slice(0,46);
              if(!choques.includes(marca)) choques.push(marca);
            }
          }
        }
      }
      // texto fora da área do desenho
      const fora=txt.filter(t=>t.x<0||t.y<0||t.x+t.w>vb.width+1||t.y+t.h>vb.height+1).map(t=>t.t);
      return {choques,fora,nTextos:txt.length,
              corDoTexto:getComputedStyle(document.querySelector('svg text')).fill};
    });
    console.log('== '+tema+' · '+r.nTextos+' textos · cor herdada '+r.corDoTexto);
    if(r.choques.length){alertas+=r.choques.length;r.choques.forEach(c=>console.log('   ⚠️ colisão: '+c));}
    if(r.fora.length){alertas+=r.fora.length;r.fora.forEach(c=>console.log('   ⚠️ fora da área: '+c));}
    if(!r.choques.length&&!r.fora.length) console.log('   ✓ nenhuma colisão de texto, nada fora da área');
    await p.locator('figure.dir-fig').screenshot({path:arq});
    await p.close();
  }
  await b.close();
  process.exit(alertas?1:0);
})();
