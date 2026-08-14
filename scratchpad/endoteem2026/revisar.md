# Pontos que NÃO propaguei — precisam da palavra do professor

Cada item abaixo aparece numa aula do EndoTEEM 2026 e **não entrou nos capítulos**,
porque contradiz o que está consolidado na literatura. Nenhum foi corrigido por
minha conta: ficam aqui para o professor decidir.

## 1. "Receptor de LH → síndrome de Morris" (Endocrinologia Básica, aula 1)

A tabela de doenças por mutação em receptores acoplados à proteína G associa o
**receptor de LH** à **síndrome de Morris**. A síndrome de Morris é a
**insensibilidade completa a andrógenos**, causada por mutação do **receptor de
androgênio** — que é **nuclear**, não acoplado à proteína G. Mutações
inativadoras do receptor de LH causam **hipoplasia de células de Leydig**.

**O que fiz:** reproduzi a tabela inteira no capítulo *Receptores Hormonais e
Transdução de Sinal*, **menos essa linha**. As outras sete linhas entraram.

## 2. "Proteínas 1,5 a 2 kg/semana" e "15-25% em 4 meses vs 8% em 6 meses" (Obesidade, aula 9)

Sinalizado em sessão anterior; segue pendente.

## 3. Estatinas com excreção renal (Lípides 2b)

Sinalizado em sessão anterior; segue pendente.

## 4. Divergências REGISTRADAS (não são erro — as duas cifras circulam)

Essas eu não omiti: entraram no capítulo com atribuição das duas fontes.

- **Corte inferior da testosterona total:** 230 ng/dL (Endocrine Society 2018,
  usado na aula) x 264 ng/dL (posicionamento SBEM/SBU/ABEMSS 2026, que o
  capítulo já trazia).
- **Espironolactona na terapia feminilizante:** 100-200 mg/dia (aula) x até
  300 mg/dia (capítulo).
- **Acetato de ciproterona:** 10 mg/dia (WPATH 2022) x 25-50 mg (Endocrine
  Society 2017) — a divergência é da própria aula.
- **iPCSK9 e Lp(a):** 20-25% (capítulo) x 30% (aula) — registrei a faixa 20-30%.
- **Espessura endometrial pré-menopausa:** a aula de Fisiologia dá 2-4 / 5-11 /
  até 16 mm; a de Menopausa dá <=4 / 4-8 (ate 10) / 8-15 mm. Duas aulas do mesmo
  curso. O valor acionável, sem divergência, é o corte de 5 mm na pós-menopausa
  com sangramento.

## 5. ⚠️ ERRO MEU, JÁ CORRIGIDO: a diretriz PÚBLICA de Hipopituitarismo foi tocada

O update de Neuroendocrinologia parte 1 filtrou por `sub` e por `tema`, mas **não
por `privado`** — e existe uma diretriz **pública** chamada `Hipopituitarismo`
além do capítulo privado de mesmo nome. O texto dela **não** mudou (a âncora de
seção não existia lá), mas ela recebeu **16 pontos-chave a mais** e teve a
**fonte sobrescrita**.

**Correção aplicada:** os 16 pontos foram removidos (voltou aos 9 originais, o
mesmo número das diretrizes irmãs da área).

⚠️ **A fonte original não era recuperável** — o payload é um blob jsonb sem
histórico. Repus **"Endocrine Society"**, que é de fato a autoria da diretriz de
hipopituitarismo do JCEM 2016 e segue o padrão curto das irmãs. **Se o professor
lembrar o texto exato, é só corrigir no painel.**

Auditei todas as demais diretrizes públicas da plataforma: nenhuma outra carrega
fonte do EndoTEEM 2026 nem contagem de pontos alterada.

## 6. Unidade do DDAVP nasal (Neuroendocrinologia parte 3)

O slide de tratamento do diabetes insípido escreve **"DDAVP: 0,1-0,2mg/d VO ou
10-20mg/d nasal"**. A dose nasal em **miligramas** seria mil vezes a terapêutica;
o próprio deck confirma a unidade certa dois slides antes, ao usar
**"desmopressina 20 µg intranasal"** no teste de restrição hídrica.

**O que fiz:** escrevi **10 a 20 mcg/dia** no capítulo. É correção de UNIDADE, não
de conduta — propagar "mg" seria perigoso. Vale corrigir o slide.

## 7. Falso-positivo x falso-negativo no teste de 1 mg (Neuroendocrinologia parte 2)

O slide agrupa sob **"resultados falso-negativos"** duas listas de fármacos:
(a) os que **reduzem o metabolismo hepático da dexametasona** — amiodarona,
fluoxetina, fluconazol, ciprofloxacino, ritonavir — e (b) os que **elevam a CBG**
— estrógenos, tamoxifeno, mitotano.

Só o grupo (a) dá falso-NEGATIVO. O grupo (b) eleva o cortisol **total** medido e
produz **falso-POSITIVO** — que é, aliás, o que o próprio deck ensina dois slides
adiante ao mandar **não usar** o teste de 1 mg em quem usa estrógeno, e o que a
questão do anticoncepcional cobra.

**O que fiz:** separei os dois grupos corretamente no capítulo. Vale corrigir o
slide, porque, do jeito que está, ele contradiz a própria aula.

## 8. 🖼️ Uma imagem de 238 KB embutida em base64 dentro de um capítulo

O capítulo **Regulação do Apetite** tem **242.396 caracteres**. Não é texto: são
**4.117 caracteres de conteúdo** mais **um JPEG de 238.279 caracteres em base64**
(cerca de 179 KB de imagem), embutido no corpo do resumo com marcador `{:center}`.

Para dimensionar: o `payload` inteiro de `endodirect_global_state` ocupa
**4.458 kB** e reúne **218 diretrizes**. Essa única figura é ~**5% de toda a base
clínica** — e é a única da plataforma nessa condição (conferi: apenas 1 diretriz
contém `data:image`).

**Não mexi nela** — é figura do professor e a decisão é dele. Mas vale saber que
ela viaja junto com o bloco inteiro toda vez que a base é carregada, mesmo para
quem nunca abre esse capítulo. Se valer a pena, a saída natural é hospedar a
imagem e referenciá-la por URL em vez de embutir o base64.

## 9. Deficiência de B12 na tabela de interferência da HbA1c (Diabetes: rastreio e diagnóstico)

O slide lista **"deficiência de vitamina B12"** entre as causas de **falsa REDUÇÃO**
da HbA1c. Pela lógica do próprio slide — que coloca **anemia por deficiência de
ferro** entre as causas de falsa **elevação** e **terapia com ferro** entre as de
falsa **redução** —, a deficiência de B12 deveria estar do lado da **elevação**:
ela prolonga a vida da hemácia, como a de ferro. É a **terapia** com B12, ferro ou
EPO que encurta a sobrevida eritrocitária e **reduz** falsamente a HbA1c.

**O que fiz:** escrevi a tabela pela regra mecanística (tempo de vida da hemácia),
com **deficiência de B12 na coluna da elevação** e **terapia com ferro, B12 ou EPO**
na da redução — internamente consistente com o resto do próprio slide. Vale
corrigir a linha.

## 10. "Síndrome de Hirata (ou Resistência Insulínica tipo A)" (Hipoglicemia: investigação)

O slide titula a síndrome de Hirata como sinônimo de **resistência insulínica tipo
A** — e, no mesmo slide, descreve corretamente o mecanismo: **anticorpos contra a
INSULINA**. São coisas diferentes:

- **Hirata** = síndrome autoimune à insulina, por **anticorpos anti-INSULINA**.
- **Resistência tipo A** = defeito **genético do receptor** de insulina.
- **Resistência tipo B** = **anticorpos anti-RECEPTOR** — que é justamente o quadro
  descrito dois slides adiante, com o nome certo.

**O que fiz:** escrevi Hirata sem o parêntese, e acrescentei ao capítulo o alerta
explícito de não confundir Hirata (anticorpo contra a insulina) com resistência
tipo B (anticorpo contra o receptor). Vale corrigir o título do slide.

## 11. Linha do IGF-2 na tabela de diferencial da hipoglicemia

Na tabela comparativa, a linha do **tumor produtor de IGF-2** aparece com
**"pesquisa de sulfonilureia +"**. Não faz sentido — a pesquisa de sulfonilureia
é positiva na hipoglicemia por **secretagogo**, e a linha dos antidiabéticos orais
já traz esse "+" corretamente. Parece **desalinhamento de célula** na tabela.

**O que fiz:** montei a tabela do capítulo pelo mecanismo de cada etiologia, com a
pesquisa de sulfonilureia **negativa** na linha do IGF-2.

## 12. DM2 tratamento — fluxograma de insulinização veio truncado (OCR)

Aula **"Diabetes tipo 2: tratamento"** (DAG0Z8KSb_k), slide do fluxograma de início
de insulina. O slide é imagem e o texto extraído traz dois números quebrados:

- *"Se em uso de 20-30UI de insulina, iniciar com **2001** (caneta 10-40)"* — li como **20 UI**
- *"Se em uso de **>301** de insulina, iniciar com 30UI (caneta 30-60)"* — li como **>30 UI**

Registrei no capítulo com esses valores. **Confirmar no slide original.**

E há uma ambiguidade de escopo: o esquema de **10 UI** (só antidiabético oral) /
**16 UI** (já em AGLP-1 ou basal, suspendendo o AGLP-1) aparece **logo depois** do
slide de coformulado (liraglutida+degludeca) — 10 e 16 são exatamente os passos de
dose de coformulado. Escrevi como "esquema fixo do fluxograma da aula", sem afirmar
a qual fármaco pertence. **Decidir se é do coformulado ou da basal isolada.**

Além disso, a aula traz **dois esquemas de início** que não conversam: o do
fluxograma (10/16 UI fixos, ajuste ±2 UI a cada 3 dias) e o do slide seguinte
(0,1–0,2 UI/kg/dia, ajuste ±15–20% a cada 3 dias). Mantive os dois, cada um
identificado. **Se um deles for o preferido, dizer qual.**

## 13. "Complicações Crônicas do Diabetes" chegou a 27,7 mil caracteres

Depois de receber as aulas de **risco cardiovascular** e de **complicações crônicas**
(80 slides), o capítulo passou de 10,2k para **27,7k caracteres e 57 pontos**. Está
correto e completo, mas é grande demais para uma leitura só.

**Sugestão de divisão em quatro capítulos:**

1. **Retinopatia diabética e outras doenças oculares**
2. **Neuropatia diabética e pé diabético** (inclui autonômica, Ipswich, IWGDF,
   osteomielite e antibioticoterapia)
3. **Doença renal do diabetes** (estadiamento, albuminúria, finerenona, faixas de
   TFG, DRC avançada, insulina no dialítico)
4. **Comorbidades no paciente diabético** (insuficiência cardíaca, hipertensão,
   imunização, depressão)

O capítulo atual ficaria como **macrovasculares + risco cardiovascular + metas
lipídicas**. Decisão sua — não dividi por conta própria.

## 14. Diabetes: divergências entre a revisão 2025 e as aulas de 2026

A aula **"Diabetes 2025"** (186 slides) é revisão e repete as aulas individuais.
Propaguei só o que era novo. **Onde os números discordam, mantive o de 2026 no
capítulo** e registro aqui — confirme qual vale para a prova:

| Tema | Revisão 2025 | Aula 2026 (aplicada) |
|---|---|---|
| Canagliflozina — TFG mínima para iniciar | **≥35** mL/min | **≥45** mL/min |
| Demais AGLP-1 na DRD | TFG **>20** | TFG **>15** |
| Finerenona — limiar de potássio | K **<5,0** (recomendação IIa) | K **<4,8** |
| Espironolactona — limiar de potássio | K **<4,8** (IIb) | K **<5** |
| FIDELIO/FIGARO — TFG da população | 25–**75** | **>25** |
| Meta pressórica no idoso >80 saudável | <140×**80** | <140×**90** |
| Neuropatia induzida pelo tratamento | queda >**3** pts de HbA1c em 3 meses | queda >**2** pts |
| Misturar degludeca com rápida | **"pode ser misturada"** | **"nunca misturar análogo longo com rápida"** |
| GLP-1 no pré-operatório | dulaglutida/semaglutida SC/VO com prazos de **2, 15 e 21 dias** (slide truncado, ordem ambígua) | **curto 1 dia / longo 7 dias**, com ressalva de manter se dose estável há >12 semanas |

⚠️ **O par finerenona/espironolactona está literalmente invertido entre as duas
aulas.** No capítulo ficou a versão de 2026. As duas divergências que mais pesam em
prova são essa e a da mistura da degludeca — ambas estão sinalizadas dentro dos
capítulos como divergência, não como fato.

**Sobre o MODY**: a aula traz um bloco completo. Não existe capítulo privado de MODY
— existe uma **diretriz pública** "MODY (diabetes monogênico)". Coloquei o conteúdo
dentro de *Diagnóstico e Classificação do Diabetes*, em "Outras causas". **Se
preferir um capítulo próprio de MODY na aba Resumos, me diga.**
