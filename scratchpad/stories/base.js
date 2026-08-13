// Base compartilhada dos stories 1080×1920 do Endodirect.
//
// ⚠️ ÁREA SEGURA. O Instagram desenha a barra de perfil no topo e o campo "Enviar
// mensagem" embaixo; o que ficar fora da faixa central é encoberto. O conteúdo vive
// entre y=210 e y=1730, e renderStory() FALHA se transbordar — a primeira versão do
// story de desempenho cortava o último card, e só o erro na cara evitou publicar.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/tmp/pw/node_modules/playwright-core');

const RAIZ = path.join(__dirname, '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const LOGO = fs.readFileSync(path.join(RAIZ, 'logo.png.png')).toString('base64');

// Paleta real do app (index.html, tema escuro, linhas 106-116).
const C = {
  bg: '#0b1325', surface: '#16233f', s2: '#1c2a48',
  bd: '#283864', bd2: '#34467a',
  tx: '#e9eef8', t2: '#a7b2c6', t3: '#7b8aa4',
  blue: '#3b6fd4', blue2: '#5585e8',
  grn: '#34d399', red: '#f87171', gold: '#f5b32c', pur: '#a78bfa',
};

const TOPO = 210, ALTURA = 1520;

// Cabeçalho de marca — o cofre exige a logo real em toda arte (2026-06-29).
function marca(margem) {
  return `<div style="display:flex;align-items:center;gap:18px;margin-bottom:${margem == null ? 34 : margem}px">
    <img src="data:image/png;base64,${LOGO}" style="height:64px">
    <div style="font-size:35px;font-weight:800;letter-spacing:-.02em">Endodirect</div>
  </div>`;
}

async function renderStory({ corpo, saida }) {
  const html = `<style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:1080px;height:1920px;background:${C.bg};color:${C.tx};
         font-family:'Segoe UI',system-ui,sans-serif}
    #safe{position:absolute;top:${TOPO}px;left:56px;right:56px;height:${ALTURA}px;
          display:flex;flex-direction:column}
    .card{background:${C.surface};border:1px solid ${C.bd};border-radius:22px;padding:26px 30px}
    .ttl{font-weight:700;font-size:31px;margin-bottom:18px}
  </style>
  <div id="safe">${corpo}</div>`;

  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const fim = await page.evaluate(() => {
    const s = document.getElementById('safe');
    const filhos = [...s.children];
    return {
      base: Math.round(filhos[filhos.length - 1].getBoundingClientRect().bottom),
      limite: Math.round(s.getBoundingClientRect().bottom),
    };
  });
  console.log('último elemento termina em y=%d; limite da área segura y=%d', fim.base, fim.limite);
  if (fim.base > fim.limite) {
    await browser.close();
    throw new Error('⚠️ conteúdo transborda a área segura em ' + (fim.base - fim.limite) + 'px');
  }

  await page.screenshot({ path: saida });
  await browser.close();
  console.log('gerado:', saida);
}

module.exports = { C, LOGO, marca, renderStory, RAIZ };
