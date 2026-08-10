# Brief — auditoria do NÚCLEO (e das notas do cofre)

Você audita **texto que já está no ar**. O núcleo (`CLINICAL_GUIDELINES` do
`index.html`) vai junto em **TODA** chamada de IA do Endodirect, para médicos
brasileiros, sobre qualquer assunto. Uma entrada errada não erra uma vez: erra em
toda resposta que tocar o tema, com a autoridade de "diretriz".

Não é revisão de estilo. É procurar **o que está errado, o que está incompleto a
ponto de ficar perigoso, e o que envelheceu**.

---

## O que é prova

**Prova é o texto-fonte.** Nada mais.

Você tem 47 artigos extraídos em `scratchpad/acervo/extratos/*.json`, com 7.087
fatos. Cada fato guarda `cit` (offset + comprimento no texto-fonte) e `cit_sha`.
O texto integral está em `scratchpad/acervo/textos/<fileId>.txt` — presente na sua
máquina, fora do git.

Para ler a prova de um fato:

    node scripts/mostra-citacao.js <extrato.json> <n>
    node scripts/mostra-citacao.js <extrato.json> --busca "termo"

E o texto-fonte inteiro é seu: leia, procure, releia.

**O que NÃO é prova:**
- "eu sei que a diretriz X diz…" — isso é hipótese, e hipótese se confere.
- "é o consenso da área" — se não está no texto que você tem, você não tem.
- o próprio núcleo dizendo — é ele o acusado.
- outra nota do cofre dizendo — duas notas erradas concordam perfeitamente.

Se você não tem fonte para julgar uma entrada, **diga que não tem**. "Não pude
verificar" é um resultado honesto e útil. Aprovar sem ler é o único resultado
inaceitável.

---

## ⚠️ A busca ingênua MENTE, e mentiu 5 vezes em um dia

O texto vem de PDF. Ele quebra palavras no fim da linha (`diag- nostic`,
`Ta- ble 1`), tem espaço duplo dentro de números (`138  nmol/L`) e frases que
atravessam a quebra de linha. Uma busca que não acha **não prova ausência**.

Antes de escrever "o artigo não menciona X", procure de **três** jeitos
diferentes: o termo inteiro, um pedaço do termo (4–5 letras), e um sinônimo ou o
número associado. Só então "zero ocorrências" vira achado — e aí é um achado
**forte**, dos melhores que existem.

---

## As perguntas que você faz em cada entrada

1. **O que esta entrada faz se for lida SOZINHA?** É assim que ela chega: o
   modelo pega uma linha e responde. Uma entrada certa "em contexto" e perigosa
   isolada é uma entrada errada.
2. **Como está hoje, ela pode causar dano?** Dano é conduta: exame que não se
   pede, remédio que não se dá, remédio que se para, diagnóstico que se perde.
3. **O erro tem DIREÇÃO?** Errar para o lado de investigar mais é diferente de
   errar para o lado de tratar menos. Diga para que lado.
4. **O número carrega a CONDIÇÃO que o valida?** Corte de exame sem a condição de
   coleta é um corte errado, mesmo com o número certo. (A copeptina errava por
   isso: `Na ≥147` onde a fonte dizia `exceeded 150`, e o paciente
   sub-estimulado caía na faixa que se lê como o diagnóstico oposto.)
5. **A ORDEM de leitura está certa?** Ordem é conteúdo clínico. A mesma entrada
   da copeptina listava "polidipsia primária" antes da regra do basal, e nessa
   ordem o DI nefrogênico virava polidipsia primária — conduta: mandar beber
   menos quem tem rim que não concentra.
6. **O que a entrada OMITE?** Omissão não deixa rastro. O romosozumabe estava lá
   como anabólico intercambiável, sem uma palavra sobre infarto, AVC ou morte.
   Pergunte: a fonte condiciona, contraindica ou limita algo que a entrada não diz?
7. **Envelheceu?** Nomenclatura trocada, corte revisto, critério substituído.

---

## Severidade — use estas quatro

- **GRAVE** — leva a conduta errada com dano plausível. Prescrição invertida,
  diagnóstico perdido, tratamento suspenso, exame com corte que muda a decisão.
- **SÉRIO** — está errado e muda a resposta, mas o dano depende de outros erros.
- **IMPRECISO** — a fonte não sustenta como está escrito (número redondo demais,
  superlativo indevido, generalização de uma população para todas).
- **OMISSÃO** — o que falta torna o que está lá perigoso.

Não invente uma quinta. Não classifique como GRAVE o que é IMPRECISO: inflar
severidade custa credibilidade e faz perder tempo de quem confere.

---

## O que você entrega

Um relatório em texto. Para **cada achado**:

    ENTRADA #<i do mapa> — <rótulo>
    SEVERIDADE: GRAVE | SÉRIO | IMPRECISO | OMISSÃO
    O QUE O NÚCLEO DIZ: "<trecho literal da entrada, copiado>"
    O QUE A FONTE DIZ:  "<trecho literal do texto-fonte, copiado>"
    ONDE:               <extrato.json> fato <n>  (ou textos/<id>.txt, busca "<termo>")
    CONDUTA QUE SAI DISSO: <o que o médico faz de errado, em uma frase>
    CORREÇÃO SUGERIDA:  <o texto que você poria no lugar>

E no fim: **quantas entradas você examinou, quantas conferiu contra fonte, e
quantas ficaram sem fonte para conferir.** Esse último número é parte do
resultado, não uma desculpa.

Se não achar nada numa entrada, **não escreva nada sobre ela** — a lista de
achados é o relatório. Mas conte-a no total examinado.

---

## Regras de convívio (várias auditorias rodam ao mesmo tempo)

- **NÃO edite `index.html`.** Nem o núcleo, nem nada. Você relata; a correção é
  feita num lugar só, depois, por quem consolida. Duas auditorias editando o
  mesmo arquivo destroem o trabalho uma da outra.
- **NÃO edite os extratos** (`scratchpad/acervo/extratos/*.json`).
- **NÃO edite as notas do cofre.**
- **NÃO execute scripts de `scratchpad/` que você não escreveu.** Em 08/08 um
  agente executou o script de outro e duplicou 29 fatos. Os scripts de `scripts/`
  são estáveis e podem ser usados à vontade.
- Se precisar de arquivo de trabalho, escreva **dentro da sua própria pasta**,
  com o seu nome no caminho.

---

## ⚠️ Duas coisas que auditores já erraram aqui

**1. Roteamento.** Se você quiser afirmar que um bloco "chega" ou "não chega" a
uma pergunta, MEÇA — não deduza. Já aconteceu duas vezes de um relatório afirmar
ranking dentro de uma área esquecendo que, sem chave de roteamento, `canonArea`
não devolve área nenhuma e o bloco não chega de jeito nenhum. Se não for medir,
não afirme.

**2. Repetir o erro que você está denunciando.** Ao escrever a correção
sugerida, não copie o vocabulário do defeito. Uma ressalva minha repetia a
palavra "FATAL" enquanto acusava a fonte de não dizer "fatal" (a fonte dizia
`life-threatening`; `fatal` tinha **zero** ocorrências).

---

## O que NÃO é achado

- Preferência de redação, ordem alfabética, estilo.
- "Poderia mencionar também X" sem que a ausência de X torne o que está lá
  perigoso. (Isso é sugestão de conteúdo novo, não defeito — no máximo, uma
  linha no fim do relatório.)
- Divergência entre você e a fonte quando a fonte está no texto. **A fonte vence.**
