// Gera 2 figuras PRÓPRIAS (SVG) em português — visualizações originais dos
// conceitos (dados/ideias não são protegidos; a arte específica da revista sim).
const fs = require('fs');
const OUT = '/home/user/endodirect/figuras';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const FONT = "-apple-system,BeMi,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/* ---------- FIGURA 2: secreção por faixa etária (gráfico de linhas) ---------- */
(function fig2(){
  const W=760,H=470, mL=64,mR=210,mT=64,mB=70;
  const px0=mL, px1=W-mR, py0=H-mB, py1=mT;      // área do gráfico
  const ages=['8–19','20–29','30–39','40–49','50–59','60–69','70–79'];
  const ymax=100;
  const X=i=> px0 + i*(px1-px0)/(ages.length-1);
  const Y=v=> py0 - (v/ymax)*(py0-py1);
  const series=[
    {name:'Glicose', color:'#2563eb', d:[55,88,70,58,60,52,48]},
    {name:'Aminoácidos', color:'#d9a300', d:[42,55,50,48,52,50,47]},
    {name:'Ácidos graxos', color:'#dc2626', d:[30,45,40,33,38,34,30]},
    {name:'Basal', color:'#64b5e6', d:[12,14,13,13,14,13,12]}
  ];
  let s='';
  s+=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Padrões de secreção de insulina por faixa etária">`;
  s+=`<rect x="1" y="1" width="${W-2}" height="${H-2}" rx="16" fill="#ffffff" stroke="#e2e8f0"/>`;
  s+=`<text x="${W/2}" y="34" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="700" fill="#0f172a">Padrões de secreção de insulina por faixa etária</text>`;
  s+=`<text x="${W/2}" y="52" text-anchor="middle" font-family="${FONT}" font-size="12.5" fill="#64748b">Tendências conceituais em ilhotas humanas · secreção basal e estimulada por nutrientes</text>`;
  // grades horizontais
  for(let g=0;g<=4;g++){const v=g*25, y=Y(v);
    s+=`<line x1="${px0}" y1="${y.toFixed(1)}" x2="${px1}" y2="${y.toFixed(1)}" stroke="#eef2f7" stroke-width="1"/>`;
  }
  // eixos
  s+=`<line x1="${px0}" y1="${py1}" x2="${px0}" y2="${py0}" stroke="#94a3b8" stroke-width="1.5"/>`;
  s+=`<line x1="${px0}" y1="${py0}" x2="${px1}" y2="${py0}" stroke="#94a3b8" stroke-width="1.5"/>`;
  // rótulo eixo Y
  s+=`<text transform="translate(20 ${(py0+py1)/2}) rotate(-90)" text-anchor="middle" font-family="${FONT}" font-size="12.5" fill="#475569">Secreção de insulina (relativa)</text>`;
  // rótulos X
  ages.forEach((a,i)=>{s+=`<text x="${X(i).toFixed(1)}" y="${py0+20}" text-anchor="middle" font-family="${FONT}" font-size="11.5" fill="#475569">${esc(a)}</text>`;});
  s+=`<text x="${(px0+px1)/2}" y="${py0+44}" text-anchor="middle" font-family="${FONT}" font-size="12.5" fill="#475569">Faixa etária do doador (anos)</text>`;
  // linhas + pontos
  series.forEach(se=>{
    const pts=se.d.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    s+=`<polyline points="${pts}" fill="none" stroke="${se.color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
    se.d.forEach((v,i)=>{s+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3.4" fill="#fff" stroke="${se.color}" stroke-width="2"/>`;});
  });
  // legenda (à direita)
  let ly=mT+18;
  s+=`<text x="${px1+26}" y="${ly-16}" font-family="${FONT}" font-size="12.5" font-weight="700" fill="#0f172a">Estímulo</text>`;
  series.forEach(se=>{
    s+=`<line x1="${px1+26}" y1="${ly}" x2="${px1+52}" y2="${ly}" stroke="${se.color}" stroke-width="3"/>`;
    s+=`<circle cx="${px1+39}" cy="${ly}" r="3.4" fill="#fff" stroke="${se.color}" stroke-width="2"/>`;
    s+=`<text x="${px1+60}" y="${ly+4}" font-family="${FONT}" font-size="12" fill="#334155">${esc(se.name)}</text>`;
    ly+=26;
  });
  s+=`<text x="${W-14}" y="${H-14}" text-anchor="end" font-family="${FONT}" font-size="10.5" fill="#94a3b8">Figura própria · Endodirect</text>`;
  s+=`</svg>`;
  fs.writeFileSync(OUT+'/insulina-secrecao-idade.svg', s);
  console.log('fig2 ok', s.length, 'bytes');
})();

/* ---------- FIGURA 1: moduladores + jejum→pós-prandial ---------- */
(function fig1(){
  const W=880,H=660;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Fatores que modulam a secreção de insulina basal e pós-prandial">`;
  s+=`<rect x="1" y="1" width="${W-2}" height="${H-2}" rx="16" fill="#ffffff" stroke="#e2e8f0"/>`;
  s+=`<text x="24" y="34" font-family="${FONT}" font-size="19" font-weight="700" fill="#0f172a">Fatores que modulam a secreção de insulina</text>`;
  // Painel A — moduladores agrupados (esquerda)
  const groups=[
    {t:'Fisiológicos agudos', c:'#2563eb', items:['Glicose','Aminoácidos','Lipídios','Outros combustíveis','Incretinas (GLP-1/GIP)','Hormônios parácrinos','Estímulo neural','Fluxo sanguíneo']},
    {t:'Endógenos crônicos', c:'#0891b2', items:['Genética','Massa de células β','Idade','Estresse','Exercício','Sexo biológico']},
    {t:'β-célula (autônomos)', c:'#7c3aed', items:['Produção de insulina','Estresse do retículo (RE)','Metabolismo e EROs','Desdiferenciação','Estado de maturação']},
    {t:'Exógenos', c:'#dc2626', items:['Fármacos','Aditivos alimentares','Toxinas ambientais']}
  ];
  s+=`<text x="24" y="62" font-family="${FONT}" font-size="13" font-weight="700" fill="#334155">a · Principais moduladores</text>`;
  let gy=78; const colX=24, colW=372;
  groups.forEach(g=>{
    const rows=Math.ceil(g.items.length/1);
    const boxH=24+g.items.length*18+8;
    s+=`<rect x="${colX}" y="${gy}" width="${colW}" height="${boxH}" rx="9" fill="${g.c}0d" stroke="${g.c}55"/>`;
    s+=`<rect x="${colX}" y="${gy}" width="5" height="${boxH}" rx="2.5" fill="${g.c}"/>`;
    s+=`<text x="${colX+16}" y="${gy+18}" font-family="${FONT}" font-size="12.5" font-weight="700" fill="${g.c}">${esc(g.t)}</text>`;
    g.items.forEach((it,i)=>{
      const iy=gy+24+18+i*18-6;
      s+=`<circle cx="${colX+18}" cy="${iy-4}" r="2.2" fill="${g.c}"/>`;
      s+=`<text x="${colX+28}" y="${iy}" font-family="${FONT}" font-size="11.8" fill="#334155">${esc(it)}</text>`;
    });
    gy+=boxH+10;
  });
  // Painel B — curva jejum → pós-prandial (direita)
  const bx0=430, bx1=W-28, by0=540, by1=180;
  s+=`<text x="${bx0}" y="62" font-family="${FONT}" font-size="13" font-weight="700" fill="#334155">b · Do jejum ao pós-prandial</text>`;
  // eixos
  s+=`<line x1="${bx0}" y1="${by1}" x2="${bx0}" y2="${by0}" stroke="#94a3b8" stroke-width="1.5"/>`;
  s+=`<line x1="${bx0}" y1="${by0}" x2="${bx1}" y2="${by0}" stroke="#94a3b8" stroke-width="1.5"/>`;
  s+=`<text transform="translate(${bx0-14} ${(by0+by1)/2}) rotate(-90)" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#475569">Secreção de insulina</text>`;
  s+=`<text x="${(bx0+bx1)/2}" y="${by0+40}" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#475569">Transição do jejum para o estado pós-prandial</text>`;
  // linha de base (insulina basal)
  const baseY=by0-46;
  s+=`<line x1="${bx0}" y1="${baseY}" x2="${bx1}" y2="${baseY}" stroke="#64b5e6" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  // curva: basal plano → pico pós-prandial (1ª fase aguda + sustentação) → retorno
  const A=bx0, B=bx1, span=B-A;
  const p=(f)=>A+f*span;
  // path da secreção estimulada (vermelho)
  const path=`M ${A} ${baseY}`+
    ` L ${p(0.30).toFixed(1)} ${baseY}`+
    ` C ${p(0.36).toFixed(1)} ${baseY} ${p(0.38).toFixed(1)} ${by1+8} ${p(0.44).toFixed(1)} ${(by1+18).toFixed(1)}`+   // 1ª fase (pico)
    ` C ${p(0.50).toFixed(1)} ${(by1+30).toFixed(1)} ${p(0.52).toFixed(1)} ${(by1+64).toFixed(1)} ${p(0.62).toFixed(1)} ${(by1+70).toFixed(1)}`+ // vale entre fases
    ` C ${p(0.72).toFixed(1)} ${(by1+76).toFixed(1)} ${p(0.80).toFixed(1)} ${(by1+58).toFixed(1)} ${p(0.90).toFixed(1)} ${(by1+96).toFixed(1)}`+ // 2ª fase sustentada
    ` L ${B} ${(by1+120).toFixed(1)}`;
  // área sombreada até a linha de base
  s+=`<path d="${path} L ${B} ${baseY} L ${A} ${baseY} Z" fill="#2563eb14"/>`;
  s+=`<path d="${path}" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linejoin="round"/>`;
  // rótulos internos
  s+=`<text x="${p(0.02).toFixed(1)}" y="${baseY-8}" font-family="${FONT}" font-size="11" fill="#2b7fbf">Insulina basal (jejum, ~4 mM glicose)</text>`;
  s+=`<text x="${p(0.44).toFixed(1)}" y="${by1+4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="#dc2626">1ª fase</text>`;
  s+=`<text x="${p(0.86).toFixed(1)}" y="${by1+44}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="#dc2626">2ª fase (sustentada)</text>`;
  s+=`<text x="${p(0.55).toFixed(1)}" y="${by1+150}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="#475569">Insulina para controle glicêmico pós-prandial (&gt;10 mM glicose)</text>`;
  s+=`<text x="${W-14}" y="${H-14}" text-anchor="end" font-family="${FONT}" font-size="10.5" fill="#94a3b8">Figura própria · Endodirect</text>`;
  s+=`</svg>`;
  fs.writeFileSync(OUT+'/insulina-moduladores-basal-posprandial.svg', s);
  console.log('fig1 ok', s.length, 'bytes');
})();
