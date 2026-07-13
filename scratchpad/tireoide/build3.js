// Anexa uma TABELA markdown (## 📊) ao final do `resumo` de cada capítulo de
// Tireoide que ainda não tem tabela. mdToHtml renderiza tabelas markdown.
// ⚠️ LIÇÃO: nenhuma célula pode ficar VAZIA (o parser derruba célula vazia) → usar "—".
// Método: UPDATE reconstruindo o array com jsonb_agg+CASE, concatenando a tabela
// ao resumo existente (a || jsonb_build_object('resumo', resumo||tabela)).

const TABELAS = {
'Hipotireoidismo':
`## 📊 Principais causas de hipotireoidismo
| Tipo | Causas | Laboratório |
| --- | --- | --- |
| Primário (autoimune) | Tireoidite de Hashimoto | TSH↑, T4L↓, anti-TPO+ |
| Primário (iatrogênico) | Pós-tireoidectomia, radioiodo, fármacos (amiodarona, lítio) | TSH↑, T4L↓ |
| Primário (mundo) | Deficiência de iodo | TSH↑, T4L↓ |
| Central | Tumor/cirurgia selar, Sheehan, hipofisite | T4L↓, TSH baixo/normal |
| Subclínico | Hashimoto inicial | TSH↑, T4L normal |`,

'Tireotoxicose: Abordagem e Diagnóstico Diferencial':
`## 📊 Diagnóstico diferencial pela captação de iodo (RAIU)
| Captação | Causa provável | Pista clínica |
| --- | --- | --- |
| Alta e difusa | Doença de Graves | TRAb+, oftalmopatia |
| Focal (nódulo quente) | Adenoma tóxico | Nódulo único autônomo |
| Heterogênea | Bócio multinodular tóxico | Idoso, TRAb− |
| Baixa/ausente | Tireoidite / iodo / factícia | VHS↑ (subaguda), Tg baixa (factícia) |`,

'Doença de Graves (Hipertireoidismo)':
`## 📊 Comparação das três opções de tratamento
| Opção | Vantagens | Desvantagens / cuidados |
| --- | --- | --- |
| Tionamida (metimazol) | Sem cirurgia nem radiação; chance de remissão | Recidiva ~50%; agranulocitose, hepatotoxicidade |
| Radioiodo (I-131) | Definitivo, ambulatorial | Hipotireoidismo; contraindicado na gestação; piora oftalmopatia |
| Tireoidectomia total | Definitivo e rápido; resolve compressão | Hipoparatireoidismo, lesão do laríngeo recorrente |`,

'Bócio e Hipertireoidismo por Autonomia (BMN tóxico e adenoma tóxico)':
`## 📊 Graves × Bócio multinodular tóxico × Adenoma tóxico
| Característica | Graves | BMN tóxico | Adenoma tóxico |
| --- | --- | --- | --- |
| Idade típica | Jovem/adulto | Idoso | Adulto |
| TRAb | Positivo | Negativo | Negativo |
| Cintilografia | Difusa | Heterogênea | Focal (nódulo quente) |
| Oftalmopatia | Sim | Não | Não |
| Remissão com tionamida | Possível | Não | Não |`,

'Carcinoma Diferenciado de Tireoide (papilífero e folicular)':
`## 📊 Carcinoma papilífero × folicular
| Característica | Papilífero | Folicular |
| --- | --- | --- |
| Frequência | ~85% | ~10% |
| Disseminação | Linfática (linfonodos cervicais) | Hematogênica (pulmão, osso) |
| Diagnóstico | Citologia (núcleos típicos) | Histologia (invasão capsular/vascular) |
| Fatores/mutações | Radiação, BRAF | RAS; variante Hürthle |`,

// CA medular já ganhou a tabela no build4 (resumo reescrito) — não re-anexar aqui.

'Tireoide e Gestação':
`## 📊 Manejo por situação na gestação
| Situação | Conduta | Alvo |
| --- | --- | --- |
| Já em levotiroxina | Aumentar ~30% ao confirmar a gravidez | TSH < 2,5 (1º trimestre) |
| Hipotireoidismo subclínico | Tratar se TSH acima da referência do trimestre (anti-TPO+) | Referência por trimestre |
| Doença de Graves | PTU no 1º trimestre → metimazol depois | T4L no limite superior |
| Tireotoxicose gestacional | Suporte (associada à hiperêmese) | Autolimitada |`,

'Emergências Tireoidianas: Crise Tireotóxica e Coma Mixedematoso':
`## 📊 Crise tireotóxica × Coma mixedematoso
| Aspecto | Crise tireotóxica | Coma mixedematoso |
| --- | --- | --- |
| Doença de base | Hipertireoidismo | Hipotireoidismo |
| Temperatura | Febre alta | Hipotermia |
| Cardíaco | Taquicardia / fibrilação atrial | Bradicardia |
| Neurológico | Agitação, delirium | Rebaixamento, coma |
| Tratamento-chave | Betabloq → PTU → iodo → corticoide | Levotiroxina IV + hidrocortisona |`,

'Oftalmopatia de Graves (Doença Ocular Tireoidiana)':
`## 📊 Gravidade (EUGOGO) e tratamento
| Gravidade | Achados | Tratamento |
| --- | --- | --- |
| Leve | Retração discreta, olho seco, proptose leve | Medidas locais + selênio |
| Moderada-grave (ativa) | Proptose, diplopia, quemose, CAS ≥ 3 | Glicocorticoide IV em pulsos (± teprotumumabe) |
| Muito grave | Neuropatia óptica compressiva / úlcera de córnea | Pulso em alta dose + descompressão orbitária |`
};

const fs=require('fs');
// Sanidade: nenhuma célula vazia (todo campo entre pipes deve ter conteúdo)
Object.entries(TABELAS).forEach(([tema,md])=>{
  md.split('\n').filter(l=>l.trim().startsWith('|')).forEach(l=>{
    const cells=l.split('|').slice(1,-1).map(c=>c.trim());
    cells.forEach((c,i)=>{ if(c===''){ throw new Error('CÉLULA VAZIA em "'+tema+'": '+l); } });
  });
});

// Monta o UPDATE (append da tabela ao resumo, por tema)
let cases='';
Object.entries(TABELAS).forEach(([tema,md])=>{
  const bloco='\n\n'+md; // separa do resumo por linha em branco
  if(bloco.indexOf('$tb$')>=0) throw new Error('colisão $tb$');
  const temaEsc=tema.replace(/'/g,"''");
  cases+=`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='${temaEsc}'\n`+
         `        THEN a || jsonb_build_object('resumo', (a->>'resumo') || $tb$${bloco}$tb$)\n`;
});
const sql=
`-- Anexa tabela markdown ao resumo dos capítulos de Tireoide sem tabela\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n`+
`    CASE\n`+cases+
`      ELSE a\n`+
`    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\n`+
`WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/tables.sql', sql);
console.log('Tabelas para', Object.keys(TABELAS).length, 'capítulos. SQL bytes:', sql.length);
Object.keys(TABELAS).forEach((t,i)=>console.log('  '+(i+1)+'. '+t));
