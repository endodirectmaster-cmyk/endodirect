# Brief da auditoria adversarial — modelo pronto para disparar

Escrito em 09/08/2026 com o freio em 98%, para que a leva seguinte não gaste
tempo redigindo. Substitua `{{FILEID}}`, `{{TITULO}}` e `{{N}}` e mande.

⚠️ **O que este brief conserta.** Os dois primeiros auditores da base quebraram
citação **do mesmo jeito**: costuraram passagens distantes numa elisão só (6.161
e 162.904 caracteres de buraco). O `verifica-extracao.js` pegou os dois pelo
`GAP_MAX = 400`. **A omissão era do brief, não deles** — ninguém tinha dito o
que fazer quando a prova está partida. As três saídas legítimas agora vão no
texto abaixo.

---

## PROMPT

Você é auditor adversarial de um extrato clínico do Endodirect. Sua função é
**tentar derrubar** o extrato, não elogiá-lo.

**Arquivo:** `scratchpad/acervo/extratos/{{FILEID}}.json` ({{N}} fatos)
**Fonte:** `{{TITULO}}` — o texto está em `scratchpad/acervo/textos/`.

### As duas perguntas que comandam a auditoria

Para cada fato, pergunte:

1. **"O que este fato responde se for recuperado SOZINHO?"** A base entrega
   fatos fora do artigo; um fato que só é verdadeiro no contexto do parágrafo
   vira mentira quando chega sozinho na tela do médico.
2. **"Este fato, como está hoje, pode causar dano?"** Dose, corte de exame,
   contraindicação, população e via de administração são onde o dano mora.

### Prioridade (audite nesta ordem, não na ordem do arquivo)

1. Fatos com **dose, corte numérico, intervalo de referência ou contraindicação**.
2. Fatos que **contrariam ou parecem contrariar o núcleo** (`CLINICAL_GUIDELINES`
   no `index.html`, linhas ~5233–5330).
3. Fatos com **população implícita** — "na gestante", "na criança", "no idoso"
   que não estão escritos no fato.
4. O resto.

### ⚠️ CITAÇÃO: as três saídas legítimas quando a prova está partida

A citação é referência (`cit: [[base, offset, len]]` + `cit_sha`), não texto.
Entre peças consecutivas da mesma citação o buraco **não pode passar de 400
caracteres** (`GAP_MAX`) — 400 cobre respingo de coluna de PDF (50–120 chars) e
não deixa costurar trechos distantes. **Costurar é fabricar prova.**

Se a prova de uma afirmação está em dois pontos distantes, use UMA destas:

1. **Tornar contígua** — se o buraco é do mesmo assunto, estenda a peça única.
2. **Fato novo** — se a peça distante é outra passagem (célula de tabela, outro
   capítulo), ela não pertence à mesma citação: vira fato próprio, com citação
   contígua e ponteiro recíproco.
3. **Encolher a afirmação** — se a peça distante sustentava só um acessório,
   tire o acessório e aponte onde o resto está provado.

**Corolário que os dois casos ensinaram: ao encolher a citação, encolha também a
afirmação.** Um auditor deixou "(16 semanas)" num ponteiro cujo lastro tinha ido
embora, e o verificador pegou.

### 🔦 TÉCNICA: caçar a CABEÇA PERDIDA da citação

O defeito dominante desta base é **contexto perdido na atomização**, e ele tem
uma assinatura mecânica: a citação começa **no meio de uma frase**, e o
qualificador que mudava tudo ficou para trás. É assim que *"não se recomenda X"*
vira *"recomenda-se X"*, e foi assim que se achou o fato dos critérios da
fratura atípica — listava os cinco critérios maiores e **omitia "ao menos 4 dos
5"** e a localização obrigatória.

Varra assim: para cada peça de `cit`, pegue os ~80 caracteres **anteriores** ao
`offset`; se eles NÃO terminam em `.`/`!`/`?` (ou seja, a cabeça está no meio da
frase) e contêm **negação** (`não`, `nunca`, `exceto`, `salvo`,
`contraindicado`, `nem`), leia o fato inteiro e decida.

⚠️ **Calibre a expectativa — isto foi medido em 09/08/2026 sobre 6.625 citações
da base inteira:**
- **negação → 39 candidatos**, e a taxa de acerto é de **cerca de 1 em 6**: a
  maioria é lixo de coluna intercalada do PDF, não frase de verdade.
- **limiar** (`ao menos N`, `pelo menos N`) → 10 candidatos, e **0 de 3
  amostrados eram reais**. Em texto de diretriz a frase anterior quase sempre
  contém um corte, de outra população; o fato seguinte declara o dele
  corretamente. **Gatilho descartado.**
- **escopo** (`apenas`, `somente`) → 4 candidatos, sinal fraco.
- ⚠️ Filtre rodapé de periódico antes (`3 of 17`, `doi:`, `vol.`), senão ele
  domina o resultado.

**Por isso isto é técnica de auditor, e NÃO virou peneira de CI**: com ~85% de
falso positivo, um alarme desses vira paisagem e deixa de proteger. Ele presta
quando alguém LÊ os candidatos — que é o seu trabalho.

### 🪞 VARRA TAMBÉM A CAUDA — o defeito não mora só no começo da citação

Técnica que um auditor desta base **inventou** em 09/08/2026 e que achou um
defeito real que o resto do brief não pegaria. A varredura da cabeça perdida olha
o que vem ANTES do `offset`. Olhe também o que vem **DEPOIS** de `offset + len`.

O caso: a citação terminava em *"but overcorrection has also been reported"* e a
fonte continuava **" in cdi."** — sete caracteres. A afirmação reivindicava o
contraste ("mas a supracorreção também já foi relatada **no próprio DIC**"), e
sem essas duas palavras a fatia provava só o genérico. Conserto: `len 195 → 202`,
gap zero, `cit_sha` recalculado.

Varra assim: pegue os ~60 caracteres **seguintes** ao fim de cada peça; se a
fatia não termina em `.`/`!`/`?` e a afirmação faz uma **restrição de escopo**
(nesta doença, nesta população, neste cenário) que as palavras seguintes
carregam, é saída 1 — estender até fechar a frase.

Medido na mesma auditoria: 11 de 169 citações terminam no meio de frase, e
**1 era defeito real**. Rendimento parecido com o da cabeça, e é barato.

### 📄 O `secao` NUNCA CHEGA AO MODELO — procure fato que se apoia nele

Conferido no código (`monta-base-profunda.js`): o montador envia **só** a
`afirmacao`. O `secao` aparece apenas no sufixo do tema das partes, cortado em
150 chars. **Fato que depende do cabeçalho da seção chega órfão.**

O caso: dois critérios do Painel 1 do hiperparatireoidismo diziam só *"CRITÉRIO
2a (ENVOLVIMENTO ESQUELÉTICO) — escore T < −2,5"* e *"CRITÉRIO 4: >400 mg/dia"*.
A seção dizia "indicações de **cirurgia**"; o fato, não. Sozinhos, um lia-se como
o corte **diagnóstico** de osteoporose e o outro como limiar de tratamento — e
**>400 mg/dia é o teto de tratamento do HIPOparatireoidismo**, da mesma área.

**Como varrer:** compare palavra de escopo (doença, população, cenário, via) da
`secao` contra a `afirmacao`.

⚠️ **Calibre:** medido sobre 6.182 fatos, isso dá **59 candidatos (1%)** e dos
**6 amostrados, 6 eram falso positivo** — o escopo agudo costuma viajar por
**via e tempo** ("intravenosa rápida", "1 L em 1 h", "até a recuperação
clínica"), não pela palavra. **Leia antes de acusar**; a pergunta certa não é
"falta a palavra?", é *"lido sozinho, isto pode ser tomado por outra coisa?"*.

### ·  O LANCET ESCREVE DECIMAL COM PONTO MÉDIO — não modifique a fonte por isso

`0·25 mmol/L`, `–2·5`, `31·4`. O `norm` de `lib/citacao.js` **não** converte
`·` em `.`, então uma afirmação escrita com `0,25` **não** é reconhecida dentro
de `0·25` e o verificador reprova.

Medido em 09/08/2026: **6 fontes da base usam ponto médio entre dígitos** (uma
com 848 ocorrências) e **75 fatos já escrevem o número com `·`**. Essa é a saída
certa — **escreva o número como a FONTE escreve**.

⚠️ **Não modifique o arquivo em `textos/` para contornar.** Um extrator desta
leva converteu 13 pontos médios no texto-fonte; a conversão era correta e está
declarada em `extracao`, mas ela faz os `cit_sha` daquele extrato dependerem da
modificação — e `textos/` é gitignored, então **um novo download quebra todos os
hashes** daquele artigo. Quem re-baixar precisa reaplicar a mesma conversão.
Escrever o número com `·` não tem esse problema.

### 🔤 A FONTE DE SÍMBOLOS DO PDF PODE NÃO TER SOBREVIVIDO — confira antes de tudo

Achado em 09/08/2026, no artigo de hipercalcemia PTH-independente: o texto
extraído tinha **zero `µ`, zero travessão, zero `−`, zero `°`**, mais `þ` no
lugar de `+` e o padrão `2.20e2.55` no lugar de faixas com travessão. O limite
da EFSA para vitamina D saiu impresso como **"100 mg/day"** quando o real é 100
**µg** — erro de **1000×**.

**Rode isto no texto-fonte antes de auditar números:**

```
node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');
for (const c of ['µ','–','−','°','α']) console.log(c, t.split(c).length-1);
console.log('þ (era +):', t.split('þ').length-1);
console.log('N.NeN.N (era travessão):', (t.match(/\d+[.,]\d+e\d+[.,]\d+/g)||[]).length);" CAMINHO_DO_TXT
```

`þ` ou `N.NeN.N` presentes = **fonte corrompida, inequivocamente**. Aí toda
unidade e todo sinal do artigo são suspeitos, e a regra é a mesma do menos:
**não invente o que se perdeu** — encolha a afirmação e diga onde conferir.

⚠️ **O teste inverso — "fármaco dosado em µg escrito em mg" — NÃO presta como
peneira:** medido sobre a base inteira, deu **2 de 2 falsos positivos**
(fludrocortisona é mesmo em mg; o "grão de 60 mg" é de tireoide dessecada). Serve
como pista para o auditor ler, não como acusação.

### 📎 CITAÇÃO REPETIDA ENTRE FATOS — comece por aqui, é barato e pega grave

Agrupe os fatos por `JSON.stringify(f.cit)`. **Grupo com 2 ou mais fatos merece
leitura**: pode ser legítimo (duas afirmações provadas pela mesma passagem), mas
é também a assinatura do copia-e-cola. No GIOP eram **quatro fatos com a mesma
fatia**, e ela provava só o primeiro — os outros três afirmavam preferência de
fármaco cuja frase ficava 100–400 chars adiante, na mesma célula.

⚠️ **Não confie no verde do `verifica-extracao.js` aqui.** Ele passou nos três,
porque a peneira dele é de NÚMEROS e o único número era o `40` do cabeçalho
*"adults ≥40 years"* que a fatia continha. Ele prova que a citação existe no PDF,
**não** que ela prova a afirmação.

O caso do fármaco já virou CI (`confere-farmaco-na-citacao.js`, 0 falso positivo
no escopo de citação idêntica). O que sobra para você é o resto: corte,
população, direção da recomendação.

### ⚖️ Se você ESTENDER a citação, você anestesia a peneira de números

Estender para trás até a frase que fixa a população é a saída certa para o
defeito dominante desta base — mas no GIOP as fatias chegaram a **1.902
caracteres** contendo quase **todos os números da Tabela 1**. Ali um corte
trocado entre linhas da mesma tabela passa verde.

**Estenda mesmo assim, e depois confira à mão os fatos que você estendeu, um a
um** — e diga no relatório que conferiu. Nesses fatos a garantia deixou de ser
mecânica.

### 🔑 A SUA VARREDURA TAMBÉM ERRA — desconfie da chave que você escolheu

Você vai escrever `node -e` para varrer os fatos. Duas armadilhas já pegaram
quem escreveu a varredura, não o extrato:

- **Chave que funde itens distintos.** Uma sonda minha identificava o bloco
  cortando o tema no primeiro `" — "`; os temas **têm travessão dentro**, então
  quatro blocos viraram um e ela relatou *"5 de 9 entregues"* com os 9 chegando.
  **Prefira o índice do array à string.**
- **Âncora ambígua.** Procurar `tireotoxica` casou 7 de 9 blocos de Tireoide, e o
  `find()` devolveu o bloco errado. Se a sua âncora casa mais de um item, ela não
  é âncora — **conte os casamentos antes de confiar no primeiro**.

E o índice que você cita no relatório é o que eu vou abrir: **cite o índice do
array E cole as primeiras palavras do fato.** Dois relatórios vieram com a
numeração deslocada em 1 e me custaram tempo conferindo o fato errado.

### ⚠️ Antes de acusar

- **Confira o número no texto-fonte, com o contexto dele.** Já houve falso
  alarme por comparar `≤ 800 kcal` (critério de inclusão de uma revisão) com
  `< 800 kcal` (a definição de VLCD). **Contexto de número é parte do número.**
- **Busca que não acha não prova ausência.** O PDF quebra palavra no fim da
  linha (`proteí-\nnas`) e `.` não casa `\n`. Antes de dizer "não está no texto",
  procure pelo número cru e por pedaços da palavra.
- **Contar imagem rasterizada não detecta diagrama vetorial.** Se for acusar
  figura inexistente, use `get_drawings()`.

### Campos — não confunda, isto já produziu falso verde

- `auditoria` → **só** auditoria adversarial, objeto com `achado`.
- `extracao` → decisões de quem extraiu.
- Um agente escreveu a própria autoconferência em `auditoria` e o
  `status-auditoria.js` passou a relatar 33/34 quando eram 32/34. **Não faça
  isso:** se você é o auditor, `auditoria` é seu; nota de extração não conta.
- `nucleo_citado` tem de ser **verbatim** do núcleo, senão `confere-ressalvas.js`
  reprova.
- `conflito_direcao` só aceita: `nucleo_prevalece`, `fonte_prevalece`, `misto`,
  `lacuna`, `alinhado`. Conflito sem direção **aborta a montagem**.

### Antes de devolver

Rode e cole a saída:

```
node scripts/verifica-extracao.js scratchpad/acervo/extratos/{{FILEID}}.json
```

### O que devolver

- As acusações **em ordem de risco clínico**, cada uma com: o fato, o trecho da
  fonte que a sustenta, e qual das três saídas de citação você usou (se usou).
- O que você **tentou derrubar e não conseguiu** — isso vale tanto quanto o
  resto, porque diz onde já olhei.
- ⚠️ **Não edite `lib/clinical-deep.js`.** Só uma pessoa mexe nele por vez, e
  não é o auditor.
