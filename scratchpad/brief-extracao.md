# Brief da extração — modelo pronto para disparar

Escrito em 09/08/2026, quando a base fechou 40/40 auditados e as lições das 40
extrações já estavam medidas. Substitua `{{FILEID}}`, `{{TITULO}}`, `{{AREA}}` e
`{{CAMINHO}}` e mande. Irmão do `brief-auditoria.md`.

---

## PROMPT

Você vai extrair um artigo clínico para a base profunda do Endodirect. O produto
é um JSON de **fatos com citação verificável**, não um resumo.

**Artigo:** `{{TITULO}}`
**fileId:** `{{FILEID}}` · **área:** `{{AREA}}` · **Drive:** `{{CAMINHO}}`

### Antes de tudo: baixe e confira a integridade da fonte

1. Baixe o PDF do Drive e extraia o texto para
   `scratchpad/acervo/textos/{{FILEID}}.txt`. ⚠️ `textos/` é **gitignored** — o
   repositório é PÚBLICO e **nunca** pode receber texto integral de artigo.
2. Rode a conferência de fonte corrompida **antes de auditar qualquer número**:

```
node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');
for (const c of ['µ','–','−','°','α']) console.log(c, t.split(c).length-1);
console.log('þ (era +):', t.split('þ').length-1);
console.log('N.NeN.N (era travessão):', (t.match(/\d+[.,]\d+e\d+[.,]\d+/g)||[]).length);" scratchpad/acervo/textos/{{FILEID}}.txt
```

`þ` ou `N.NeN.N` presentes = **fonte corrompida**. Já aconteceu: um artigo saiu
com zero `µ` e o limite da EFSA para vitamina D virou "100 mg/day" quando o real
é 100 **µg** — erro de 1000×. Aí toda unidade e todo sinal são suspeitos:
**não invente o que se perdeu**, encolha a afirmação e diga onde conferir.

⚠️ **E há mais DUAS assinaturas que esse teste NÃO pega**, ambas achadas em
09/08/2026 e ambas com `þ` = 0:

- **HÍFEN APAGADO (NEJM).** A fonte do corpo mapeia o hífen para largura quase
  zero e o texto sai `extraadrenal`, `lipid rich`, `α adrenergic`,
  `pheochromocy` + quebra + `toma`. Sinal: **contagem de hífen absurdamente
  baixa** — 83 neste artigo contra 600+ em outras extrações NEJM da base.
  ⚠️ **Não reconstrua o hífen**: os itens de largura pequena são ambíguos entre
  hífen e espaço real (`18 ⟦ ⟧ year` é hífen, `Fig. ⟦ ⟧ 1` é espaço), e
  reconstruir é fabricar a fonte. Números, unidades, `>`, `<`, `%` e o travessão
  de faixa costumam sobreviver — confira e declare no `conflito`.
- **ZERO WIDTH SPACE depois do hífen (Nature Reviews).** 351 ocorrências de
  U+200B em `anti-PD1`, `ICI-DM`, `immune-related`. ⚠️ **O `norm` de
  `lib/citacao.js` não remove U+200B** (não é `\s` em JS) e o `semHifenDeQuebra`
  também não: procurar `anti-pd1` **falha com a palavra lá**. Saída: busque numa
  vista sem ZWSP e mapeie o offset de volta — a fatia gravada continua sendo
  pedaço exato da base.

**Diagnóstico das duas, em uma linha:**

```
node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');
console.log('hifens:', (t.match(/-/g)||[]).length,
            '| U+200B:', (t.match(/​/g)||[]).length);" CAMINHO_DO_TXT
```

⚠️ **O Lancet escreve decimal com ponto médio** (`0·25`, `–2·5`). O `norm` de
`lib/citacao.js` não converte `·` em `.`, então escreva o número **como a fonte
escreve**. E **nunca modifique o arquivo em `textos/`** para contornar: ele é
gitignored, e um novo download quebraria todos os `cit_sha` do seu extrato.

### A regra que sustenta tudo

**Nenhuma afirmação entra sem citação literal do artigo.** A citação é
REFERÊNCIA, não texto: `cit: [[base, offset, len]]` mais `cit_sha`. Use
`lib/citacao.js` (`bases`, `sha`, `referenciar`) — ⚠️ `bases()` recebe o **TEXTO
CRU**, não o extrato.

- Entre peças consecutivas da mesma citação o buraco não passa de **400
  caracteres** (`GAP_MAX`). 400 cobre respingo de coluna de PDF e não deixa
  costurar trechos distantes. **Costurar é fabricar prova.**
- **Todo número da afirmação tem de aparecer na citação.** É onde a alucinação
  entra (trocar 264 por 300, 6,5 por 6,0).
- Citação com menos de 25 caracteres não vale como prova.

**Se a prova está em dois pontos distantes, use UMA destas três saídas:**

1. **Tornar contígua** — mesmo assunto, estenda a peça única.
2. **Fato novo** — a peça distante é outra passagem: vira fato próprio, com
   citação contígua e ponteiro recíproco.
3. **Encolher a afirmação** — tire o acessório e aponte onde o resto está provado.

⚠️ **Ao encolher a citação, encolha também a afirmação.** Já ficou um
"(16 semanas)" num ponteiro cujo lastro tinha ido embora.

### 🚫 NUNCA REPITA A MESMA CITAÇÃO EM DOIS FATOS SEM CONFERIR CADA UM

Copiar o `cit` de um fato para o seguinte é a forma mais fácil de fabricar prova,
e ela já passou verde pelo verificador. No GIOP, **quatro** fatos carregavam a
mesma fatia byte a byte; ela provava o primeiro, e os outros três afirmavam
preferência de fármaco cuja frase ficava 100–400 chars adiante.

O verificador não pegou porque a peneira dele é de **números**, e o único número
daquelas afirmações era o `40` do cabeçalho *"adults ≥40 years"* que a fatia
continha. **Ele prova que a citação EXISTE no PDF, não que ela prova o que você
escreveu.**

Hoje há guarda de CI (`confere-farmaco-na-citacao.js`) para o caso do fármaco.
Ela não cobre corte, população nem direção da recomendação — isso é com você.

### ⚖️ Estender a citação para trás conserta população e ANESTESIA os números

Estender até a frase que fixa idade, doença ou cenário é a saída certa para o
defeito dominante desta base. Mas fatias longas (já chegaram a 1.902 chars)
passam a conter **toda a tabela**, e aí um corte trocado entre linhas passa
verde. **Estenda, e depois confira à mão os fatos que estendeu — e diga no
relatório que conferiu.**

### 📄 O FATO TEM DE SE BASTAR — o `secao` NUNCA chega ao médico

Conferido no código: `monta-base-profunda.js` envia **só** a `afirmacao`. O
`secao` só aparece no sufixo do tema das partes, cortado em 150 chars.

O caso: dois critérios diziam só *"CRITÉRIO 2a — escore T < −2,5"* e *"CRITÉRIO
4: >400 mg/dia"*. A seção dizia "indicações de **cirurgia**"; o fato, não.
Sozinho, o primeiro lia-se como o corte **diagnóstico** de osteoporose, e
**>400 mg/dia é o teto de tratamento do HIPOparatireoidismo**, da mesma área.

**Escreva a doença, o cenário e a população DENTRO da `afirmacao`.** Antes de
salvar cada fato, pergunte: *"o que isto responde se for recuperado SOZINHO?"* e
*"isto, como está, pode causar dano?"* — dose, corte de exame, contraindicação,
população e via são onde o dano mora.

### 🏷️ O `tema` É A SUPERFÍCIE DE BUSCA — escreva a palavra do MÉDICO

O tema é o que decide se a sua extração **chega** à pergunta. Ele pontua `+3` por
termo achado nele contra `+1` no corpo. Erros medidos que custaram o artigo:

- o bloco da osteogênese imperfeita tinha **12 ocorrências de "esclera" no texto
  e zero no tema** — a pergunta patognomônica recebia outro artigo;
- o da osteoporose tinha **30 de "quadril"** e zero no tema;
- o do eutireoidiano doente só era alcançável pelo **próprio nome**.

**Escreva no tema:** a doença, o **analito** (sódio, cálcio, T3), o cenário
(gestação, UTI, pós-operatório), a população e **as formas que o médico digita**.
⚠️ O buscador corta 2 letras de radical e **não conjuga**: `convulsionando` não
alcança `convulsão`, `correr` não alcança `corrida`, `emagrece` não alcança
`emagrecer`. Onde a forma importa, escreva as duas.

### ⚖️ E O LIMITE DISSO: só reivindique no tema o que o seu corpo DOMINA

O tema é onde se ganha a pergunta, então a tentação é listar tudo. **Não faça**:
uma palavra no tema vale `+3` e no corpo vale `+1`, então reivindicar assunto que
você mal menciona **rouba a pergunta do bloco que a responde**. Reivindicar não é
*"o meu texto menciona?"*, é *"o meu texto DOMINA?"*.

Três casos medidos em 09/08/2026, todos no mesmo artigo de tireoide:

| o tema reivindicava | ocorrências no corpo dele | no bloco que responde |
|---|---|---|
| crise tireotóxica / Burch-Wartofsky | **0** e 1 | 3 e 7 |
| biotina | 1 | **22** |
| lítio | 1 | **15** |

O primeiro fazia a pergunta *"crise tireotóxica com febre e taquicardia, o que
faço agora"* — uma emergência — receber o bloco do hipertireoidismo crônico.

**Antes de pôr um assunto no seu tema, conte-o no seu corpo e nos outros blocos
da área.** Se outro bloco domina, deixe para ele.

⚠️ **E o ponteiro não pode repetir a palavra que você quer ceder.** Tentei
escrever *"⚠️ BIOTINA tem bloco próprio: ver fármaco e tireoide"* e a palavra
continuou valendo `+3` no tema — o ponteiro anulava a cessão. Ceda de vez, ou
descreva sem nomear.

### Campos — não confunda, isto já produziu falso verde

- `afirmacao` · `cit` · `cit_sha` · `secao` (organização) · `extracao` (suas
  decisões de extração).
- ⚠️ **`auditoria` NÃO é seu.** É o campo do auditor adversarial, e escrever
  nele fez o `status-auditoria.js` relatar 33/34 quando eram 32/34.
- `conflito_direcao` só aceita: `nucleo_prevalece`, `fonte_prevalece`, `misto`,
  `lacuna`, `alinhado`. **Conflito sem direção aborta a montagem.**
- `nucleo_citado` tem de ser **verbatim** do núcleo (`CLINICAL_GUIDELINES` no
  `index.html`), senão `confere-ressalvas.js` reprova.
- Entrada com **valor de exame** tem de carregar a **condição de coleta**.

### Se a fonte contrariar o núcleo

Declare em `conflito` + `conflito_direcao`, com `nucleo_citado` verbatim. ⚠️ E
avise no relatório: **ressalva no bloco profundo é atenuação, não conserto** — se
o núcleo estiver errado ou incompleto, quem conserta o núcleo sou eu.

**O `conflito` CHEGA ao modelo.** Conferido no código: ele é colado como
cabeçalho do bloco e **repetido em todos os pedaços** de um artigo partido. É ali
que vai um aviso de segurança que não cabe dentro de cada fato. O `extracao` e o
`secao` **não** chegam.

### ⛔ EXCEÇÃO QUE JÁ ENGOLIU UM AVISO DE SEGURANÇA: `alinhado` DESCARTA a ressalva

Quando `conflito_direcao` é **`alinhado`**, o montador entrega **só o corpo** — a
ressalva fica no JSON e **some da entrega**. A razão é boa e está no código:
alinhado é *registro de auditoria*, o núcleo já foi corrigido a partir daquela
fonte, e repetir a ressalva seria alarme falso ocupando o prefixo cacheado.

⚠️ **Mas o `conflito` acumulou dois papéis**, e o segundo não pode ser
descartado: além de "onde esta fonte diverge do núcleo", virou o lugar de
declarar **o que a fonte NÃO responde**. No extrato do feocromocitoma, 2.704
caracteres declarados `alinhado` incluíam *"não traz nenhum valor de corte
absoluto de metanefrina… e não tem conduta de crise hipertensiva"* — descartado
em silêncio.

**Regra:** se você vai declarar `alinhado`, **o que a fonte não responde tem de
estar DENTRO das `afirmacao`** dos fatos onde o médico procuraria o número que
falta — como já se faz com população e condição de coleta. E se há mesmo
divergência ativa com o núcleo, então a direção não é `alinhado`.

### Antes de devolver, rode e cole a saída

```
node scripts/verifica-extracao.js scratchpad/acervo/extratos/{{FILEID}}.json
node scripts/cobertura-extracao.js
node scripts/confere-ressalvas.js
```

### O que devolver

- Quantos fatos, e a **cobertura**: o artigo foi até o fim ou parou no meio?
- Os pontos em que você **encolheu** a afirmação por falta de lastro.
- Os **conflitos com o núcleo**, com a direção declarada.
- O que a fonte **NÃO responde** — vale tanto quanto o resto.
- ⚠️ **Não edite `lib/clinical-deep.js`.** Só uma pessoa mexe nele por vez, e não
  é o extrator. Se a sua área precisar de chave de roteamento nova, **diga no
  relatório** e eu meço a exclusividade antes de aplicar.
