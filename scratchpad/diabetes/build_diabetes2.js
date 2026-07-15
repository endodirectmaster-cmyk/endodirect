// Resumos de Diabetes (privados) — LOTE 2: idoso, tecnologia, hiperglicemia
// hospitalar. Mesma fórmula e fonte (ADA 2026/SBD). Síntese própria.
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Greenspan + ADA 2026/SBD';
const R=[

// 1 ─ Diabetes no idoso ─────────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Diabetes no Idoso', fonte:FONTE,
  resumo:`## Princípio central
As metas e o tratamento se **individualizam pelo estado de saúde e função**, não pela idade cronológica. O maior risco no idoso é a **hipoglicemia** (queda, fratura, evento cardiovascular, declínio cognitivo) — por isso se **evita o supertratamento**.

## Estratificação por estado de saúde
- **Saudável** (poucas comorbidades, cognição/função preservadas): metas mais estritas — **HbA1c < 7,0–7,5%**.
- **Intermediário/complexo** (múltiplas comorbidades, comprometimento leve, ≥ 2 AVDs instrumentais dependentes): **HbA1c < 8,0%**.
- **Muito complexo/saúde precária** (doença terminal, demência moderada-avançada, dependência): **evitar hipoglicemia e sintomas de hiperglicemia** — foco em **glicemias**, não em A1c rígida (ex.: evitar > ~200 mg/dL e < 100 mg/dL).

## Avaliação geriátrica
Rastrear **cognição** (demência prejudica autocuidado/insulina), **depressão**, **quedas**, **polifarmácia**, estado funcional (AVDs), nutrição e **suporte social**. Simplificar/**desintensificar** esquemas de risco.

## Escolha de fármacos
- Preferir agentes de **baixo risco de hipoglicemia**: metformina (se TFG permite), **SGLT2i, GLP-1 RA, iDPP-4**.
- **Evitar sulfonilureias de longa ação (glibenclamida)** e esquemas de insulina complexos.
- **Desintensificar** quando a A1c está abaixo da meta com fármacos de risco — reduzir/retirar insulina/sulfonilureia.

## Metas associadas
Individualizar PA e estatina pelo prognóstico; cuidar de **visão, pés e função renal**; alinhar ao objetivo de vida do paciente.

## 📊 Metas por estado de saúde (idoso)
| Estado | HbA1c-alvo | Foco |
| --- | --- | --- |
| Saudável | < 7,0–7,5% | Prevenir complicações |
| Intermediário/complexo | < 8,0% | Equilíbrio risco/benefício |
| Muito complexo/precário | Evitar hipo/sintomas | Glicemia, não A1c rígida |`,
  pts:[
    'No idoso, metas e tratamento se individualizam pelo estado de saúde e função, não pela idade.',
    'O maior risco é a hipoglicemia (quedas, fraturas, eventos CV, declínio cognitivo).',
    'Idoso saudável: HbA1c-alvo < 7,0–7,5%.',
    'Idoso intermediário/complexo (várias comorbidades): HbA1c < 8,0%.',
    'Idoso muito complexo/saúde precária: evitar hipoglicemia e sintomas, foco em glicemia, não A1c rígida.',
    'Fazer avaliação geriátrica: cognição, depressão, quedas, polifarmácia, função e suporte social.',
    'Preferir fármacos de baixo risco de hipoglicemia (metformina, SGLT2i, GLP-1 RA, iDPP-4).',
    'Evitar sulfonilureias de longa ação (glibenclamida) e esquemas de insulina complexos.',
    'Desintensificar o tratamento quando a A1c está abaixo da meta com fármacos de risco.',
    'A demência prejudica o autocuidado e a insulinoterapia — simplificar o esquema.'],
  mapa:{ central:'Diabetes no idoso', nodes:[
    {label:'Princípio', children:['Individualizar por saúde/função','Maior risco: hipoglicemia','Evitar supertratamento']},
    {label:'Metas por estado', children:[
      {label:'Saudável → < 7,0–7,5%'},
      {label:'Complexo → < 8,0%'},
      {label:'Muito complexo → evitar hipo/sintomas'}]},
    {label:'Avaliação geriátrica', children:['Cognição, depressão','Quedas, polifarmácia','Função (AVDs), suporte']},
    {label:'Fármacos', children:[
      {label:'Baixo risco de hipo (metformina, SGLT2i, GLP-1, iDPP-4)'},
      {label:'Evitar glibenclamida'},
      {label:'Desintensificar se abaixo da meta'}]}]},
  flashcards:[
    {q:'Por que a hipoglicemia é especialmente perigosa no idoso com diabetes?',a:'Porque se associa a quedas e fraturas, eventos cardiovasculares e arritmias, além de acelerar o declínio cognitivo; por isso evita-se o supertratamento e preferem-se fármacos de baixo risco de hipoglicemia.'},
    {q:'Como se definem as metas de HbA1c no idoso conforme o estado de saúde?',a:'Idoso saudável: < 7,0–7,5%; idoso intermediário/complexo (múltiplas comorbidades): < 8,0%; idoso muito complexo/saúde precária: evitar hipoglicemia e sintomas de hiperglicemia, priorizando glicemias em vez de uma A1c rígida.'},
    {q:'O que se avalia na abordagem geriátrica do diabetes?',a:'Cognição, depressão, risco de quedas, polifarmácia, estado funcional (atividades de vida diária), nutrição e suporte social — pois impactam a segurança e a adesão ao tratamento.'},
    {q:'Quais fármacos preferir e quais evitar no idoso?',a:'Preferir agentes de baixo risco de hipoglicemia (metformina se a função renal permite, SGLT2i, GLP-1 RA, iDPP-4); evitar sulfonilureias de longa ação (glibenclamida) e esquemas de insulina complexos.'},
    {q:'O que significa desintensificar o tratamento no idoso?',a:'Reduzir ou retirar fármacos de risco (insulina, sulfonilureias) quando a HbA1c está abaixo da meta individualizada, para diminuir o risco de hipoglicemia sem prejuízo relevante.'}],
  fluxogramas:[{ titulo:'Individualização do tratamento no idoso', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (older adults) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Idoso com diabetes → avaliação geriátrica (cognição, função, comorbidades, quedas, suporte)'},
    {tipo:'decisao', texto:'Qual estado de saúde?', ramos:[
      {rotulo:'Saudável', tipo:'fim', texto:'Meta HbA1c < 7,0–7,5%; fármacos de baixo risco de hipoglicemia'},
      {rotulo:'Intermediário/complexo', tipo:'fim', texto:'Meta < 8,0%; simplificar esquema; evitar glibenclamida'},
      {rotulo:'Muito complexo/precário', tipo:'fim', texto:'Evitar hipoglicemia e sintomas; guiar por glicemia; desintensificar'} ]}
  ]}]
},

// 2 ─ Tecnologia no diabetes ────────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tecnologia no Diabetes', fonte:FONTE,
  resumo:`## Monitorização contínua de glicose (CGM)
- **rtCGM** (tempo real, com alarmes) e **isCGM/flash** (leitura por escaneamento). Reduzem A1c e hipoglicemia; **recomendados no DM1** e no **DM2 em uso de insulina** (e úteis em outros perfis).
- Métricas do relatório (AGP): **tempo no alvo (TIR) > 70%**, **tempo abaixo (TBR) < 4% (<70)/ <1% (<54)**, **GMI** e **variabilidade (CV ≤ 36%)**.
- **Vantagens** sobre a glicemia capilar: tendências (setas), alarmes de hipo/hiper, dados noturnos.

## Bombas de insulina e sistemas integrados
- **Bomba (CSII):** infusão contínua de insulina de ação rápida (basal programável + bólus).
- **SAP / suspensão preditiva:** a bomba interrompe a basal antes da hipoglicemia (predictive low-glucose suspend).
- **Sistemas híbridos de alça fechada (AID / "pâncreas artificial"):** CGM + bomba + algoritmo ajustam a basal automaticamente (e correções); reduzem hipoglicemia e aumentam o TIR. O usuário ainda **anuncia as refeições** (bólus).

## Canetas inteligentes e apps
Canetas com registro de dose (memória/conectividade) e aplicativos de bólus/contagem de carboidratos apoiam a adesão e a titulação.

## Boas práticas
Escolher a tecnologia conforme **necessidade, habilidade e acesso**; **educar** no uso; garantir **continuidade** (a interrupção de CGM/bomba pode piorar o controle); interpretar o AGP em conjunto com a A1c.

## 📊 Tecnologias e finalidade
| Tecnologia | Função | Ganho principal |
| --- | --- | --- |
| CGM (rtCGM/flash) | Medir glicose contínua + tendências | ↑ TIR, ↓ hipoglicemia |
| Bomba (CSII) | Infusão contínua programável | Flexibilidade, menos picos |
| Suspensão preditiva | Para a basal antes da hipo | ↓ hipoglicemia |
| Alça fechada híbrida (AID) | Ajuste automático da basal | ↑ TIR, ↓ hipoglicemia |`,
  pts:[
    'O CGM pode ser em tempo real (rtCGM, com alarmes) ou por escaneamento (flash/isCGM).',
    'CGM reduz A1c e hipoglicemia; é recomendado no DM1 e no DM2 em uso de insulina.',
    'Métricas do AGP: TIR > 70%, TBR < 4% (<70) e < 1% (<54), GMI e CV ≤ 36%.',
    'A vantagem sobre a glicemia capilar são tendências, alarmes e dados noturnos.',
    'A bomba (CSII) infunde insulina rápida de forma contínua (basal programável + bólus).',
    'A suspensão preditiva interrompe a basal antes da hipoglicemia.',
    'Os sistemas híbridos de alça fechada (AID) ajustam a basal automaticamente pelo CGM.',
    'No AID o usuário ainda anuncia as refeições (faz o bólus prandial).',
    'Canetas inteligentes e apps registram dose e apoiam a titulação e a adesão.',
    'Escolher a tecnologia conforme necessidade, habilidade e acesso, com educação e continuidade.'],
  mapa:{ central:'Tecnologia no diabetes', nodes:[
    {label:'CGM', children:[
      {label:'rtCGM (alarmes)'},
      {label:'Flash/isCGM'},
      {label:'AGP',children:['TIR, TBR','GMI, CV']}]},
    {label:'Bombas', children:[
      {label:'CSII (basal + bólus)'},
      {label:'Suspensão preditiva'},
      {label:'Alça fechada híbrida (AID)'}]},
    {label:'Canetas/apps', children:['Registro de dose','Bólus/contagem de carbo']},
    {label:'Boas práticas', children:['Escolher por perfil/acesso','Educar e dar continuidade','Ler AGP + A1c']}]},
  flashcards:[
    {q:'Qual a diferença entre CGM em tempo real (rtCGM) e flash (isCGM)?',a:'O rtCGM transmite a glicose continuamente e emite alarmes de hipo/hiperglicemia; o flash (isCGM) mostra o valor quando o sensor é escaneado. Ambos reduzem A1c e hipoglicemia e fornecem tendências.'},
    {q:'O que é um sistema híbrido de alça fechada (AID)?',a:'É a integração de CGM, bomba de insulina e um algoritmo que ajusta automaticamente a insulina basal (e faz correções) conforme a glicose, aumentando o tempo no alvo e reduzindo hipoglicemia; o usuário ainda anuncia as refeições com o bólus.'},
    {q:'O que faz a suspensão preditiva de baixa glicose?',a:'A bomba interrompe automaticamente a infusão basal quando prevê que a glicose cairá abaixo do limiar, prevenindo a hipoglicemia (predictive low-glucose suspend).'},
    {q:'Quais métricas do relatório de CGM (AGP) devem ser avaliadas?',a:'Tempo no alvo (TIR) acima de 70%, tempo abaixo do alvo (TBR) menor que 4% abaixo de 70 e 1% abaixo de 54 mg/dL, o indicador de gestão da glicose (GMI) e a variabilidade (coeficiente de variação até 36%).'},
    {q:'Por que a continuidade é importante ao usar tecnologia no diabetes?',a:'Porque a interrupção do CGM ou da bomba (por custo, acesso ou falha) tende a piorar o controle; garantir suporte, educação e continuidade é parte do sucesso terapêutico.'}],
  fluxogramas:[{ titulo:'Escolha de tecnologia no diabetes', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (diabetes technology) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Pessoa com diabetes (sobretudo em insulina) → avaliar necessidade, habilidade e acesso'},
    {tipo:'decisao', texto:'Usa insulina e/ou tem hipoglicemia/variabilidade?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Indicar CGM (rtCGM se precisa de alarmes) e interpretar o AGP'},
      {rotulo:'NÃO', tipo:'fim', texto:'Automonitorização conforme o esquema; reavaliar necessidade'} ]},
    {tipo:'decisao', texto:'Controle/hipoglicemia insatisfatórios apesar de múltiplas doses + CGM?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Considerar bomba / sistema híbrido de alça fechada (AID) com educação'},
      {rotulo:'NÃO', tipo:'fim', texto:'Manter esquema; garantir continuidade e educação' } ]}
  ]}]
},

// 3 ─ Hiperglicemia hospitalar ──────────────────────────────────────────────
{ sub:'Diabetes', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Hiperglicemia Hospitalar', fonte:FONTE,
  resumo:`## Definições e avaliação
- **Hiperglicemia hospitalar:** glicemia **> 140 mg/dL** no internamento. Dosar **HbA1c** se não houver recente (**≥ 6,5%** sugere diabetes prévio não diagnosticado).
- A hiperglicemia intra-hospitalar **piora desfechos** (infecção, tempo de internação, mortalidade).

## Metas glicêmicas no hospital
- **Maioria (crítico e não crítico): 140–180 mg/dL.**
- Alvo **mais estrito (110–140)** apenas em casos selecionados **se alcançável sem hipoglicemia**.
- **Evitar < 100** (ajustar terapia) e tratar **< 70** (hipoglicemia).

## Tratamento — insulina é a base
- **Fora da UTI:** **esquema basal-bólus (basal + prandial + correção)**. **NÃO usar "sliding scale" isolada** (só correção) — controla mal e oscila.
- **UTI/crítico:** **insulina IV contínua** com protocolo, quando há hiperglicemia persistente.
- **Suspender a maioria dos antidiabéticos orais** na internação (risco com jejum, contraste, instabilidade); reavaliar SGLT2i (**risco de CAD euglicêmica** — suspender em doença aguda/jejum/cirurgia).
- **Corticoterapia** causa hiperglicemia **pós-prandial/vespertina** → reforçar cobertura (ex.: NPH matinal / ajuste do prandial).

## Monitorização e transição
- **Glicemia capilar** antes das refeições e ao deitar (ou de hora em hora na IV); protocolo de **hipoglicemia**.
- **Alta:** definir esquema domiciliar conforme A1c e função; **educação**, receita e seguimento; retomar orais quando seguro.

## 📊 Metas e conduta no hospital
| Situação | Meta | Conduta |
| --- | --- | --- |
| Maioria (crítico/não crítico) | 140–180 mg/dL | Insulina (basal-bólus ou IV) |
| Selecionados, sem risco de hipo | 110–140 | Individualizar |
| Glicemia < 100 | Reduzir terapia | Prevenir hipoglicemia |
| Glicemia < 70 | Tratar | Protocolo de hipoglicemia |`,
  pts:[
    'Hiperglicemia hospitalar é glicemia > 140 mg/dL no internamento e piora desfechos.',
    'Dosar HbA1c se não houver recente; ≥ 6,5% sugere diabetes prévio não diagnosticado.',
    'Meta glicêmica para a maioria (crítico e não crítico): 140–180 mg/dL.',
    'Alvo mais estrito (110–140) só em casos selecionados e sem risco de hipoglicemia.',
    'Evitar glicemia < 100 (ajustar terapia) e tratar < 70 (hipoglicemia).',
    'Fora da UTI, usar esquema basal-bólus; não usar sliding scale isolada.',
    'Na UTI/crítico com hiperglicemia persistente, usar insulina IV contínua com protocolo.',
    'Suspender a maioria dos orais na internação; SGLT2i traz risco de CAD euglicêmica.',
    'Corticoide causa hiperglicemia pós-prandial/vespertina — reforçar a cobertura de insulina.',
    'Na alta, definir esquema domiciliar pela A1c/função, com educação e seguimento.'],
  mapa:{ central:'Hiperglicemia hospitalar', nodes:[
    {label:'Avaliação', children:['Glicemia > 140','HbA1c (≥ 6,5% = DM prévio)','Piora desfechos']},
    {label:'Metas', children:[
      {label:'Maioria: 140–180'},
      {label:'Selecionados: 110–140'},
      {label:'< 100 ajustar / < 70 tratar'}]},
    {label:'Tratamento', children:[
      {label:'Fora da UTI: basal-bólus',children:['Não usar sliding scale isolada']},
      {label:'UTI: insulina IV'},
      {label:'Suspender orais',children:['SGLT2i → CAD euglicêmica']},
      {label:'Corticoide → reforçar cobertura'}]},
    {label:'Transição/alta', children:['Glicemia capilar + protocolo hipo','Esquema domiciliar pela A1c','Educação e seguimento']}]},
  flashcards:[
    {q:'Qual a meta glicêmica para a maioria dos pacientes internados?',a:'140–180 mg/dL, tanto em pacientes críticos quanto não críticos; um alvo mais estrito (110–140) reserva-se a casos selecionados, apenas se alcançável sem hipoglicemia.'},
    {q:'Por que não se deve usar apenas "sliding scale" (esquema de correção) fora da UTI?',a:'Porque tratar só reativamente com insulina de correção controla mal a glicemia e gera oscilações; o padrão é o esquema basal-bólus (insulina basal + prandial + correção).'},
    {q:'Como se conduz a hiperglicemia no paciente crítico (UTI)?',a:'Com insulina intravenosa contínua guiada por protocolo, com monitorização frequente da glicemia, quando há hiperglicemia persistente, mirando a faixa de 140–180 mg/dL.'},
    {q:'Qual o cuidado com os inibidores de SGLT2 no paciente internado?',a:'Suspendê-los na doença aguda, jejum ou cirurgia, pelo risco de cetoacidose diabética euglicêmica (com glicemia pouco elevada), que pode passar despercebida.'},
    {q:'Que padrão de hiperglicemia o corticoide causa e como cobri-lo?',a:'Hiperglicemia predominantemente pós-prandial e vespertina; reforça-se a cobertura de insulina nesse período (por exemplo, NPH matinal ou ajuste da insulina prandial), monitorando a glicemia.'}],
  fluxogramas:[{ titulo:'Manejo da hiperglicemia hospitalar', fonte:'Algoritmo baseado no ADA Standards of Care 2026 (diabetes care in the hospital) e nas Diretrizes SBD, adaptado ao português', nos:[
    {tipo:'inicio', texto:'Internado com glicemia > 140 mg/dL → dosar HbA1c; suspender orais de risco (SGLT2i, etc.)'},
    {tipo:'decisao', texto:'Paciente crítico (UTI)?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Insulina IV contínua com protocolo (alvo 140–180)'},
      {rotulo:'NÃO', tipo:'acao', texto:'Insulina SC basal-bólus (não sliding scale isolada); reforçar cobertura se corticoide'} ]},
    {tipo:'decisao', texto:'Glicemia < 70 (hipoglicemia) ou < 100?', ramos:[
      {rotulo:'SIM', tipo:'acao', texto:'Tratar hipoglicemia / reduzir a terapia'},
      {rotulo:'NÃO', tipo:'acao', texto:'Manter e titular pela glicemia capilar'} ]},
    {tipo:'fim', texto:'Na alta: definir esquema domiciliar pela A1c/função; educação, receita e seguimento'}
  ]}]
}
];

// ── SQL (1 lote de 3) ──
const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
fs.writeFileSync(__dirname+'/dm4.sql', mkSql(R));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Diabetes lote 2:', R.length, 'resumos');
R.forEach((r,i)=>console.log('  '+(i+1)+'.', r.tema, '[pts '+r.pts.length+' fc '+r.flashcards.length+' flux '+r.fluxogramas.length+']'));
