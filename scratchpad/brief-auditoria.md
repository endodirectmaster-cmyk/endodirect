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
