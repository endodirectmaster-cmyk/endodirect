// Auditoria geométrica do deck, lendo o XML do próprio .pptx.
// O LibreOffice está quebrado neste sandbox (não converte nem um .txt), então não
// há como inspecionar os slides renderizados. Isto NÃO substitui olhar — mas ataca
// o defeito nº 1 de deck gerado por script: texto que estoura a caixa.
//
// Estimativa: largura média de caractere ≈ 0,50 × corpo (Calibri/Cambria, mistura
// de maiúsculas e minúsculas); altura de linha ≈ 1,22 × corpo.
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const PPTX = '/home/user/endodirect/scratchpad/aula-massa-magra/Aula-massa-magra-AR-GLP1.pptx';
const EMU = 914400;                      // EMU por polegada
const PT = 12700;                        // EMU por ponto

const tmp = '/tmp/deck-xml';
execSync(`rm -rf ${tmp} && mkdir -p ${tmp} && cd ${tmp} && unzip -qo "${PPTX}"`);

const slides = fs.readdirSync(`${tmp}/ppt/slides`)
  .filter((f) => /^slide\d+\.xml$/.test(f))
  .sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);

let alertas = 0, caixas = 0;
const larguraSlide = 13.333, alturaSlide = 7.5;

for (const arq of slides) {
  const n = +arq.match(/\d+/)[0];
  const xml = fs.readFileSync(`${tmp}/ppt/slides/${arq}`, 'utf8');
  const sps = xml.split('<p:sp>').slice(1);
  const achados = [];

  for (const sp of sps) {
    const off = sp.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>/);
    const ext = sp.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
    if (!off || !ext) continue;
    const x = +off[1] / EMU, y = +off[2] / EMU;
    const w = +ext[1] / EMU, h = +ext[2] / EMU;

    // texto e corpo de fonte de cada run
    const runs = [...sp.matchAll(/<a:rPr[^>]*sz="(\d+)"[^>]*\/?>(?:.*?)?<a:t>(.*?)<\/a:t>/gs)];
    const simples = [...sp.matchAll(/<a:t>(.*?)<\/a:t>/gs)].map((m) => m[1]);
    if (!simples.length) continue;
    caixas++;

    const texto = simples.join(' ').replace(/&[a-z]+;/g, 'x');
    const corpo = runs.length ? Math.max(...runs.map((r) => +r[1] / 100)) : 14;
    if (!texto.trim()) continue;

    // fora do slide?
    if (x < -0.05 || y < -0.05 || x + w > larguraSlide + 0.05 || y + h > alturaSlide + 0.05) {
      // círculos decorativos de propósito sangrando a borda são aceitos
      if (texto.trim()) achados.push(`  ⚠️ FORA DA ÁREA  x=${x.toFixed(2)} y=${y.toFixed(2)} w=${w.toFixed(2)} h=${h.toFixed(2)}  "${texto.slice(0, 42)}"`);
    }

    // margem mínima de 0,5" (só para caixas de texto de verdade)
    if (texto.length > 12 && (x < 0.5 || x + w > larguraSlide - 0.5)) {
      achados.push(`  ⚠️ MARGEM <0,5"  x=${x.toFixed(2)} fim=${(x + w).toFixed(2)}  "${texto.slice(0, 42)}"`);
    }

    // ⚠️ Estouro vertical estimado, POR RUN. A primeira versão usava o corpo MAIOR
    // da caixa para todo o texto e acusou estouro num cartão em que só duas palavras
    // estão em 26 pt e o resto em 14 — falso positivo. Peneira que grita à toa vira
    // paisagem: a demanda de largura é somada run a run.
    const larguraUtil = Math.max(0.4, w) * 72;             // pontos
    const demanda = runs.length
      ? runs.reduce((acc, r) => acc + r[2].replace(/&[a-z]+;/g, 'x').length * 0.50 * (+r[1] / 100), 0)
      : texto.length * 0.50 * corpo;
    const paras = sp.split('<a:p>').length - 1 || 1;       // quebras explícitas
    const linhas = Math.max(paras, Math.ceil(demanda / larguraUtil));
    const alturaNec = (linhas * corpo * 1.22) / 72;        // altura de linha pelo maior corpo (conservador)
    if (alturaNec > h * 1.06) {
      achados.push(`  ⚠️ ESTOURO?  precisa ~${alturaNec.toFixed(2)}" tem ${h.toFixed(2)}"  corpo=${corpo}  ${linhas} linha(s)  "${texto.slice(0, 46)}"`);
    }
  }

  if (achados.length) {
    alertas += achados.length;
    console.log(`\n── slide ${n}`);
    achados.forEach((a) => console.log(a));
  }
}

console.log(`\n${slides.length} slides · ${caixas} caixas de texto · ${alertas} alerta(s)`);
if (!alertas) console.log('Nenhum estouro, nenhuma caixa fora da área, margens ≥ 0,5".');
