// Story 1080×1920 de um card do Mural: o alerta "Fato ou Fake" da SBD sobre o vídeo
// falso atribuído a Roberto Carlos.
//
// ⚠️ CONTEÚDO REAL, NÃO SIMULADO — diferente do story de desempenho. O texto foi lido
// do banco (`radar_avisos`, sourceId society:SBD:…) e condensado SEM acrescentar
// afirmação nenhuma. Cada linha abaixo tem correspondente no texto original.
//
// ⚠️ A PEÇA É DO ENDODIRECT CITANDO A SBD, não uma peça da SBD. A marca no topo é a
// nossa e a autoria fica explícita no rodapé, com o link da publicação. Não usar
// identidade visual da SBD nem dar a entender que o comunicado partiu daqui.
const path = require('path');
const { C, marca, renderStory } = require('./base');

const FONTE = 'SBD (Sociedade Brasileira de Diabetes)';
const DATA = '12/08/2026';
const LINK = 'diabetes.org.br';

// Cada item cita o que está no comunicado; nada aqui é inferência nossa.
const PONTOS = [
  {
    t: 'O vídeo é falso',
    d: 'Produzido com inteligência artificial <b>sem autorização</b> do cantor, que declarou jamais ter permitido o uso de sua imagem ou voz para divulgar tratamento.',
  },
  {
    t: 'O tratamento não existe',
    d: 'Não há, no âmbito científico mundial, nenhum tratamento chamado <b>“processo metabólico suíço”</b> com capacidade de tratar ou curar o diabetes.',
  },
  {
    t: 'O golpe segue um padrão',
    d: 'Conceito fisiopatológico real para dar credibilidade → alegação de descoberta <b>ocultada por médicos ou pela indústria</b> → oferta de produto ou link de compra.',
  },
  {
    t: 'O problema não é a IA',
    d: 'A ferramenta é legítima quando usada de forma ética; o problema é o <b>uso malicioso</b> para enganar a população e colocar pacientes em risco.',
  },
];

const corpo = `
${marca(30)}

<!-- selo do tipo de post, igual ao do Mural -->
<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
  <span style="background:${C.blue}22;color:${C.blue2};border:1px solid ${C.blue}55;
    border-radius:999px;padding:8px 20px;font-size:21px;font-weight:700">Comunicado</span>
  <span style="background:${C.red}1f;color:${C.red};border:1px solid ${C.red}55;
    border-radius:999px;padding:8px 20px;font-size:21px;font-weight:700">⚠️ FAKE</span>
</div>

<div style="font-size:50px;font-weight:800;line-height:1.16;letter-spacing:-.02em;margin-bottom:14px">
  Roberto Carlos não se curou com o suposto “processo metabólico suíço”
</div>
<div style="font-size:26px;color:${C.t2};margin-bottom:30px">
  Alerta da ${FONTE} · ${DATA}
</div>

${PONTOS.map((p) => `<div class="card" style="margin-bottom:18px;border-left:5px solid ${C.red}">
  <div style="font-size:30px;font-weight:700;margin-bottom:8px">${p.t}</div>
  <div style="font-size:25px;line-height:1.42;color:${C.t2}">${p.d}</div>
</div>`).join('')}

<div class="card" style="background:${C.s2};border-color:${C.bd2}">
  <div style="font-size:26px;line-height:1.4">
    Desconfie de <b>promessa milagrosa</b>. Informação de saúde se confere em
    estudo sério e evidência científica.</div>
</div>

<div style="margin-top:auto;padding-top:22px;display:flex;justify-content:space-between;
     align-items:center;font-size:23px;color:${C.t3}">
  <span>Fonte: SBD · ${LINK}</span>
  <span>endodirect.com.br</span>
</div>`;

renderStory({ corpo, saida: path.join(__dirname, 'mural-story.png') })
  .catch((e) => { console.error(e.message); process.exit(1); });
