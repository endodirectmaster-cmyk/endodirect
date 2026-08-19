// Print da ativação da primeira sessão, com o CSS e a função REAIS do index.html.
'use strict';
const fs=require('fs'),path=require('path');
const raiz=path.join(__dirname,'..','..');
const html=fs.readFileSync(path.join(raiz,'index.html'),'utf8');
const css=[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const bloco=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function renderAtivacao'));
const corpo=bloco.replace(/^\s*\(function\(\)\{\s*/,'').replace(/^\s*['"]use strict['"];\s*/,'').replace(/\}\)\(\);?\s*$/,'');
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'playwright-core');
const Q={id:'q1',status:'posted',postedAt:1,sub:'Adrenal',
  stem:'Mulher de 46 anos com hipertensão de difícil controle (três anti-hipertensivos) e hipocalemia espontânea. Qual o exame inicial?',
  answer:'B',options:{A:'Cortisol salivar à meia-noite',B:'Relação aldosterona/renina plasmática',C:'Metanefrinas plasmáticas livres',D:'Ultrassonografia de artérias renais'},
  explanation:'A relação aldosterona/renina é o rastreio inicial do hiperaldosteronismo primário, sugerido pela tríade hipertensão resistente + hipocalemia.'};
const CENAS=[
  {arq:'ativacao-1-convite',   act:{}, resp:false},
  {arq:'ativacao-2-respondida',act:{}, resp:true},
];
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  for(const tema of ['dark','light']){
    for(const c of CENAS){
      const page=await b.newPage({viewport:{width:800,height:700},deviceScaleFactor:2});
      await page.setContent('<!doctype html><html'+(tema==='light'?' data-theme="light"':'')+'><head><meta charset="utf-8"><style>'+css
        +'</style><style>body{background:var(--bg);padding:22px;font-family:var(--font)}</style></head><body><div id="ativa-card"></div></body></html>',{waitUntil:'load'});
      await page.addScriptTag({content:corpo}).catch(()=>{});
      await page.evaluate(({Q,act,resp})=>{
        window.currentUser={role:'aluno'};window.igStories=[Q];
        window.DB={act:act,qotd:{},perf:{},perfTema:{},goal:{weekly:50}};
        window.persist=function(){};window.notify=function(){};window.goPanel=function(){};
        window.renderPerfBars=function(){};window.updateDashRec=function(){};window.refreshDash=function(){};
        window.srsAdd=function(){};window.classifyTema=function(){return 'Geral';};
        window.ativacaoFeitaAgora=false;
        renderAtivacao();
        if(resp){document.querySelector('[data-qotd-opt="B"]').click();}
      },{Q,act:c.act,resp:c.resp});
      const el=await page.$('#ativa-card');
      const nome=c.arq+'-'+tema+'.png';
      await el.screenshot({path:path.join(__dirname,nome)});
      console.log('✓ '+nome);
      await page.close();
    }
  }
  await b.close();
})();
