// Monta um único HTML multi-página (5 páginas) para o Canva importar como design
// EDITÁVEL, reaproveitando exatamente o conteúdo já renderizado dos slides.
// Cada página recebe data-document-role="page" (exigido pelo import do Canva).
const fs=require('fs');
const first=fs.readFileSync(__dirname+'/slide1.html','utf8');
const css=first.split('<style>')[1].split('</style>')[0];
const labels=['Capa','Farmacologia (carga de iodo)','Padrão laboratorial e hipotireoidismo','Tireotoxicose tipo 1 x tipo 2','CTA Endodirect'];
let pages='';
for(let i=1;i<=5;i++){
  const html=fs.readFileSync(__dirname+`/slide${i}.html`,'utf8');
  const inner=html.split('<div class="slide">')[1].split('</div></body>')[0];
  pages+=`<section class="slide" data-document-role="page" data-label="${labels[i-1]}">${inner}</section>\n`;
}
const out=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Amiodarona e tireoide — carrossel</title><style>${css}
html,body{width:auto;height:auto;background:#fff}
</style></head><body>\n${pages}</body></html>`;
fs.writeFileSync(__dirname+'/canva.html',out);
console.log('canva.html gerado com 5 páginas. bytes:',out.length);
