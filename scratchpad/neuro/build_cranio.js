// Novo capítulo "Craniofaringioma" para a subespecialidade Neuroendocrinologia
// (privado). Mesma fonte da série neuro → junta-se ao grupo. Append (tema novo).
const FONTE='Síntese Endodirect · Vilar 8ed + Williams/Melmed + Pituitary Society/Endocrine Society';
const R=[
{ sub:'Neuroendocrinologia', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Craniofaringioma', fonte:FONTE,
  resumo:`## Conceito
Tumor **epitelial benigno** (grau I da OMS) da região **selar/suprasselar**, derivado de remanescentes da **bolsa de Rathke**. Histologicamente benigno, mas **localmente agressivo** (adere ao quiasma, hipotálamo e haste), o que explica a morbidade e as recidivas.

## Dois subtipos
- **Adamantinomatoso:** distribuição **bimodal** (pico na infância, 5–14 anos, e outro no adulto); **cístico com calcificações**, conteúdo tipo "óleo de motor"; mutação de **CTNNB1 (β-catenina)**.
- **Papilífero:** quase só em **adultos**; **sólido**, sem calcificação; mutação **BRAF V600E** (abre porta para terapia-alvo).

## Quadro clínico (efeito de massa + endócrino)
- **Visual:** compressão do quiasma → **hemianopsia bitemporal**, ↓acuidade.
- **Massa/pressão:** cefaleia, hidrocefalia.
- **Hipopituitarismo:** deficiência de **GH** (baixa estatura na criança), gonadotrofinas, **ACTH** e **TSH**.
- **Diabetes insípido (deficiência de AVP)** por lesão de haste/neuro-hipófise.
- **Hiperprolactinemia de desconexão** (compressão da haste).
- **Síndrome hipotalâmica:** **obesidade hipotalâmica**, distúrbios de saciedade, sono e temperatura — sobretudo **após o tratamento**.

## Diagnóstico
- **RM** de sela (lesão selar/suprasselar, cística/sólida) + **TC** (mostra bem as **calcificações**, típicas do adamantinomatoso).
- **Avaliação hormonal completa** dos eixos hipofisários + **campimetria**.
- Diferenciais: **adenoma hipofisário**, cisto da bolsa de Rathke, meningioma, glioma.

## Tratamento
- **Cirurgia** (transesfenoidal ou transcraniana): ressecção com objetivo de **descomprimir preservando o hipotálamo** (evitar obesidade hipotalâmica); **radioterapia** adjuvante no resíduo/recidiva.
- **Papilífero com BRAF V600E:** **terapia-alvo (inibidores de BRAF ± MEK)** — inclusive neoadjuvante.
- **Reposição hormonal** de todas as deficiências (frequentemente **pan-hipopituitarismo vitalício** + **desmopressina** para o diabetes insípido) e **seguimento multidisciplinar** de longo prazo.

## 📊 Adamantinomatoso × papilífero
| Característica | Adamantinomatoso | Papilífero |
| --- | --- | --- |
| Idade | Bimodal (criança e adulto) | Adulto |
| Aspecto | Cístico + calcificação | Sólido, sem calcificação |
| Mutação | CTNNB1 (β-catenina) | BRAF V600E |
| Terapia-alvo | — | Inibidor de BRAF/MEK |`,
  pts:[
    'Craniofaringioma é tumor epitelial benigno (grau I) selar/suprasselar da bolsa de Rathke.',
    'É histologicamente benigno, mas localmente agressivo (adere a quiasma, hipotálamo e haste).',
    'Adamantinomatoso: bimodal (criança e adulto), cístico com calcificação, mutação CTNNB1/β-catenina.',
    'Papilífero: adultos, sólido, sem calcificação, mutação BRAF V600E.',
    'Clínica visual: hemianopsia bitemporal por compressão do quiasma.',
    'Causa hipopituitarismo (GH, gonadotrofinas, ACTH, TSH) e diabetes insípido (deficiência de AVP).',
    'Pode dar hiperprolactinemia de desconexão pela compressão da haste.',
    'Síndrome hipotalâmica (obesidade hipotalâmica) é sequela importante, sobretudo pós-tratamento.',
    'Diagnóstico: RM + TC (calcificações), avaliação hormonal completa e campimetria.',
    'Tratamento: cirurgia preservando o hipotálamo ± radioterapia; BRAF+ responde a terapia-alvo; repor hormônios.'],
  mapa:{ central:'Craniofaringioma', nodes:[
    {label:'Conceito', children:['Benigno (grau I)','Selar/suprasselar (bolsa de Rathke)','Localmente agressivo']},
    {label:'Subtipos', children:[
      {label:'Adamantinomatoso',children:['Bimodal','Cístico + calcificação','CTNNB1']},
      {label:'Papilífero',children:['Adulto, sólido','BRAF V600E']}]},
    {label:'Clínica', children:[
      {label:'Hemianopsia bitemporal'},
      {label:'Hipopituitarismo'},
      {label:'Diabetes insípido (AVP)'},
      {label:'Obesidade hipotalâmica'}]},
    {label:'Diagnóstico', children:['RM + TC (calcificação)','Eixos hipofisários','Campimetria']},
    {label:'Tratamento', children:[
      {label:'Cirurgia (poupar hipotálamo)'},
      {label:'Radioterapia (resíduo)'},
      {label:'BRAF → terapia-alvo'},
      {label:'Repor hormônios + desmopressina'}]}]},
  flashcards:[
    {q:'O que é o craniofaringioma e de onde se origina?',a:'É um tumor epitelial benigno (grau I da OMS) da região selar/suprasselar, derivado de remanescentes da bolsa de Rathke; apesar de benigno, é localmente agressivo por aderir ao quiasma, hipotálamo e haste hipofisária.'},
    {q:'Quais os dois subtipos e suas mutações características?',a:'O adamantinomatoso (distribuição bimodal, cístico com calcificações, mutação de CTNNB1/β-catenina) e o papilífero (em adultos, sólido, sem calcificação, mutação BRAF V600E).'},
    {q:'Quais manifestações clínicas o craniofaringioma provoca?',a:'Sintomas de efeito de massa (cefaleia e hemianopsia bitemporal por compressão do quiasma), hipopituitarismo (deficiência de GH, gonadotrofinas, ACTH e TSH), diabetes insípido por lesão da haste, hiperprolactinemia de desconexão e síndrome hipotalâmica com obesidade hipotalâmica.'},
    {q:'Qual achado de imagem ajuda a diferenciar o craniofaringioma de um adenoma hipofisário?',a:'A presença de calcificações (mais bem vistas na TC) e o componente cístico, típicos do subtipo adamantinomatoso, favorecem o craniofaringioma; a RM define a extensão selar/suprasselar e a relação com o quiasma.'},
    {q:'Como se trata o craniofaringioma e qual o cuidado-chave?',a:'Com cirurgia (transesfenoidal ou transcraniana) visando descomprimir preservando o hipotálamo (para evitar obesidade hipotalâmica), com radioterapia adjuvante em resíduo/recidiva; o papilífero com BRAF V600E responde a inibidores de BRAF/MEK, e repõem-se as deficiências hormonais (frequentemente pan-hipopituitarismo e desmopressina).'}],
  fluxogramas:[{ titulo:'Abordagem do craniofaringioma', fonte:'Algoritmo baseado em consensos e revisões de manejo do craniofaringioma (incl. recomendações de neuroendocrinologia), adaptado ao português', nos:[
    {tipo:'inicio', texto:'Massa selar/suprasselar (± calcificação/cisto) com sintomas visuais/endócrinos → RM + TC, avaliação hormonal completa e campimetria'},
    {tipo:'decisao', texto:'Padrão compatível com craniofaringioma (calcificação, cisto, hipopituitarismo, DI)?', ramos:[
      {rotulo:'NÃO', tipo:'fim', texto:'Investigar diferenciais (adenoma, cisto de Rathke, meningioma, glioma)'},
      {rotulo:'SIM', tipo:'acao', texto:'Repor deficiências (± desmopressina); planejar cirurgia poupando o hipotálamo'} ]},
    {tipo:'decisao', texto:'Resíduo/recidiva ou papilífero BRAF V600E?', ramos:[
      {rotulo:'SIM', tipo:'fim', texto:'Radioterapia no resíduo; terapia-alvo (inibidor de BRAF/MEK) se papilífero BRAF+'},
      {rotulo:'NÃO', tipo:'fim', texto:'Seguimento multidisciplinar de longo prazo (endócrino, visual, hipotalâmico, neurocognitivo)'} ]}
  ]}]
}
];

const fs=require('fs');
function mkSql(arr){const j=JSON.stringify(arr);if(j.indexOf('$j$')>=0)throw new Error('$j$');return `UPDATE endodirect_global_state\nSET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || $j$${j}$j$::jsonb)\nWHERE payload ? 'diretrizes';`;}
fs.writeFileSync(__dirname+'/cranio.sql', mkSql(R));
R.forEach(r=>{ (r.resumo.split('\n').filter(l=>l.trim().startsWith('|'))).forEach(l=>{ l.split('|').slice(1,-1).forEach(c=>{ if(c.trim()==='')throw new Error('célula vazia em '+r.tema); }); }); });
console.log('Neuro +1:', R.map(r=>r.tema).join(', '), '| pts', R[0].pts.length, 'fc', R[0].flashcards.length, 'flux', R[0].fluxogramas.length);
