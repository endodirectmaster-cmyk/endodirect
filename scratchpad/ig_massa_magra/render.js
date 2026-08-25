// Renderiza o story em PNG 1080×1920 e CONFERE o layout antes de entregar:
// nada pode transbordar, nem invadir a área que o Instagram cobre.
const {chromium}=require(process.env.PLAYWRIGHT_CORE);
const path=require('path');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
  const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await pg.goto('file://'+path.join(__dirname,'story.html'));
  await pg.waitForTimeout(400);

  const d=await pg.evaluate(()=>{
    const s=document.querySelector('.s');
    const r={alturaConteudo:s.scrollHeight,transbordou:s.scrollHeight>1920||s.scrollWidth>1080,itens:[]};
    document.querySelectorAll('.brand,.kick,.stat,.lead,.bar,.q,.src,.foot').forEach(function(el){
      const b=el.getBoundingClientRect();
      r.itens.push({cls:el.className.split(' ')[0],topo:Math.round(b.top),base:Math.round(b.bottom),
        estouraLargura:b.right>1080-40});
    });
    return r;
  });
  const TOPO_SEGURO=200, BASE_SEGURA=1730;
  const foraTopo=d.itens.filter(i=>i.topo<TOPO_SEGURO);
  const foraBase=d.itens.filter(i=>i.base>BASE_SEGURA);
  const largura=d.itens.filter(i=>i.estouraLargura);
  console.log('altura do conteúdo: '+d.alturaConteudo+'px (canvas 1920)');
  console.log('transbordou: '+(d.transbordou?'SIM ⚠️':'não'));
  console.log('acima da área segura ('+TOPO_SEGURO+'px): '+(foraTopo.length?foraTopo.map(i=>i.cls+'@'+i.topo).join(', '):'nenhum'));
  console.log('abaixo da área segura ('+BASE_SEGURA+'px): '+(foraBase.length?foraBase.map(i=>i.cls+'@'+i.base).join(', '):'nenhum'));
  console.log('estourando a largura: '+(largura.length?largura.map(i=>i.cls).join(', '):'nenhum'));
  d.itens.forEach(i=>console.log('   '+i.cls.padEnd(7)+' y '+String(i.topo).padStart(4)+' → '+String(i.base).padStart(4)));

  await pg.screenshot({path:path.join(__dirname,'story.png')});
  await b.close();
  const ok=!d.transbordou&&!foraTopo.length&&!foraBase.length&&!largura.length;
  console.log('\n'+(ok?'✓ layout dentro da área segura':'✗ AJUSTAR o layout'));
  process.exit(ok?0:1);
})();
