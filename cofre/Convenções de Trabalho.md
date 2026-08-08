---
tags: [cofre, processo]
atualizado: 2026-08-08
---

# Convenções de Trabalho

## 💊 A PALAVRA QUE SE DIGITA ≠ A PALAVRA QUE ESTÁ NO ARTIGO (2026-08-08)

Quinta ocorrência do mesmo padrão em um dia, e agora dá para nomear a família:

| o que o artigo escreve | o que o médico digita | devolvia |
|---|---|---|
| cetoacidose diabética | **CAD** | `""` |
| estado hiperglicêmico hiperosmolar | **EHH** | `""` |
| lipoproteína(a) | **Lp(a)** | `""` |
| craniofaringioma | **craniofaringeoma** | `""` |
| semaglutida, tirzepatida, liraglutida | **Ozempic, Mounjaro, Saxenda** | `""` |

Em todos, o conteúdo estava na base, verificado, e a palavra real não estava no
mapa. Os nomes comerciais são o caso mais gritante porque **o paciente também
escreve assim**: semaglutida tem 88 ocorrências em Obesidade, tirzepatida 29
(mais 26 no núcleo), e `ozempic`/`mounjaro` devolviam nada.

**O buraco é invisível para quem lê o código** — o mapa parece completo, porque
cada entrada dele está certa. Só medição com vocabulário humano acha, e é por
isso que `scripts/test-caminho-clinico.js` é escrito à mão (ver a nota sobre a
peneira de alcance que não pode existir).

**Ao extrair artigo novo, pergunte: como o paciente chama isso?** Sigla,
abreviação, nome comercial e grafia alternativa entram no mapa junto com o termo
técnico. Nomes comerciais entram com peso de FÁRMACO, então cedem para qualquer
doença nomeada na frase — "Ozempic em paciente com DM2 e DRC" continua indo para
Diabetes.

## 🕳️ O FATO QUE DECLARA A PRÓPRIA CEGUEIRA (2026-08-08)

O artigo de eventos gastrintestinais dos AR GLP-1 é de dez/2022 e **não trata**
de jejum pré-operatório, risco de aspiração nem gastroparesia estabelecida —
justamente a pergunta em que mais se erra hoje (a orientação da ASA é de
jun/2023, posterior).

O extrator fez duas coisas certas, e a segunda não estava no briefing:

1. **Não pôs esses termos no `tema`**, para o bloco não ser escolhido nessas
   perguntas;
2. **gravou um fato que declara o limite de escopo** — *"FORA desse escopo
   declarado … este documento não traz nenhuma recomendação, e não deve ser
   usado como…"*.

O (1) sozinho não bastaria: a pergunta chega a Obesidade por outras palavras, e
o bloco vem junto de qualquer jeito. Com o (2), a IA recebe **a declaração
explícita de que a fonte não sabe** — que é a única defesa contra confabular
quando o bloco é recuperado fora do escopo dele.

**Regra: quando um artigo é notoriamente omisso num ponto vizinho e perigoso,
grave um fato dizendo isso.** Silêncio parece cobertura; declaração de silêncio
é cobertura de verdade.

## 🆔 O fileId DO DRIVE TEM 33 CARACTERES — não corte ao montar briefing (2026-08-08)

Passei `1aTQRBGfXP56X1QlWEPb` (20 chars) no briefing de extração; o real é
`1aTQRBGfXP56X1QlWEPb8M5VFmD-ZTcrX`. O agente não conseguiu baixar do Drive,
achou o completo em `fila-extracao.json` e seguiu — mas gastou rodadas nisso, e
se tivesse "consertado" adivinhando teria baixado outro artigo.

`verifica-extracao.js` resolve o texto por `ext.fileId`, então o ID errado
quebraria a verificação depois. **Copie o ID de `fila-extracao.json` ou do
`manifest.json`, sempre inteiro.**

## 🛑 O GERADOR RECUSA EXTRATO VAZIO, E ISSO ME SALVOU (2026-08-08)

Rodei `monta-base-profunda.js` com um agente de extração ainda no meio do
trabalho. Ele tinha criado o arquivo do extrato com **0 fatos**, e o gerador
reprovou: *"extrato sem nenhum fato · A verificação REPROVOU — nada será
gerado."*

Sem essa recusa eu teria assado na base um artigo vazio e publicado o resultado
como se estivesse completo. **Regra: com agente de extração rodando, remontar a
base só depois da notificação de término** — arquivo que já existe no disco não
quer dizer trabalho terminado.

## 📏 CONDIÇÃO DE COLETA: A REGRA GANHOU GUARDA, E A GUARDA SÓ FICOU BOA NA 3ª TENTATIVA (2026-08-08)

A regra estava no cofre e não tinha nenhuma verificação:
`scripts/test-coleta-nucleo.js` agora a aplica no `ci-validate`.

**Três versões, e as duas primeiras mentiam:**

1. **Ruído.** Marcava 11 entradas, 7 eram lixo — casava "insulina" em
   *"prescrever glucagon para todos em insulina"* (fármaco, não exame) e "GH" em
   *"tratar com GH"*. Conserto: exigir **contexto de dosagem** antes do analito
   (dosar, colher, rastrear, "diagnóstico bioquímico por"…).
2. **Distância.** Procurava a condição em QUALQUER lugar da entrada — e entrada
   de núcleo tem até 2 000 caracteres. Apaguei *"pela manhã, sentado, SEM
   restringir sódio"* do hiperaldosteronismo para ver a peneira reprovar e **ela
   passou**: a palavra "sódio" reaparecia 900 caracteres adiante, em *"restrição
   de sódio (<5 g de sal/dia)"*, que é TRATAMENTO. Conserto: janela de 130
   caracteres em volta do analito.

**Condição de coleta que não está ao lado do exame não é condição de coleta, é
coincidência de vocabulário.**

E a peneira carrega **controle positivo**: as entradas de hiperaldosteronismo e
de incidentaloma adrenal declaram a coleta e não podem ser marcadas. Sem
controle positivo não dá para distinguir peneira limpa de peneira cega — que é o
defeito que já cegou três scripts deste repositório.

### A lacuna que ficou, e por que não a consertei

A entrada de **feocromocitoma** manda pedir metanefrinas plasmáticas livres e
**não diz em que posição colher** — e a posição é a causa clássica de
falso-positivo desse rastreio, que manda o paciente para tomografia e teste
genético à toa.

**Não há nenhum artigo de feocromocitoma no acervo** (conferido na base
profunda inteira). Escrever a condição de memória é exatamente o que este
projeto proíbe. Está registrada como `PENDENTES` dentro do próprio script — em
código, não em promessa —, e sai de lá quando entrar material.

## 🚫 A PENEIRA DE ALCANCE QUE EU TENTEI ESCREVER NÃO PODE EXISTIR (2026-08-08)

Quatro áreas passam do teto de 120k (Diabetes 234k, Endocrinopatias 170k,
Lípides 150k, Neuroendocrinologia 137k) e nelas **bloco não escolhido é bloco
que não existe**. Quis automatizar a conferência: para cada bloco, montar uma
pergunta e ver se ele volta.

**Escrevi duas versões e as duas passavam com teto de 20 000**, o que é
impossível se estivessem medindo alguma coisa.

O motivo é estrutural: `deepFor` dá **prioridade absoluta ao bloco mais
relevante** e o CORTA em vez de pulá-lo. Qualquer sonda que eu derive *do
próprio bloco* — do `tema` ou do vocabulário exclusivo do texto — torna aquele
bloco o mais relevante, e ele sempre volta. A medição é tautológica.

O caso real é o oposto: o EHH sumiu porque a pergunta usava uma sigla que **não
está no bloco**, e as palavras que ela tinha ("idoso", "glicemia") casavam
melhor com os irmãos. Detectar isso exige saber que médico escreve "EHH" para
"estado hiperglicêmico hiperosmolar" — **conhecimento de domínio, não extraível
do texto por máquina.**

**Apaguei o script em vez de versionar um selo verde que mede tautologia.** O
que protege de verdade é a bateria escrita à mão em
`scripts/test-caminho-clinico.js`, com a sigla e a grafia que o médico usa. Foi
ela que achou, na mesma sessão, `Lp(a)` sem rota com **45 ocorrências** na base
— `lipoproteina(a)` roteava, mas ninguém digita isso.

**Regra: automatize a peneira quando a máquina souber o que procurar. Quando o
sinal é vocabulário humano, a bateria é escrita à mão, e isso não é preguiça —
é a única coisa que funciona.**

## 📡 O RELATO DO AGENTE ERRA PARA OS DOIS LADOS (2026-08-08)

Já estava registrado que agente exagera achado. Hoje apareceu o **oposto**, que
é mais perigoso porque não levanta suspeita: o auditor do DM1 listou os termos
de roteamento faltantes e deu `glucagon nasal`, `lua de mel` e `remissão
parcial` como **"já roteiam corretamente"**.

Medi os três: **devolviam vazio**. Como eu estava conferindo a lista dele de
qualquer jeito, achei — mas se tivesse aceitado a parte "está tudo bem" do
relato sem medir, os três teriam ficado mudos indefinidamente.

**Conferir a acusação e conferir a absolvição custam o mesmo.** Ao processar
relato de agente, meça as duas colunas.

No total eram **nove** assuntos do Seminar de DM1 com conteúdo na base e
`canonArea` devolvendo `""` — incluindo `alça fechada`, que o núcleo chama de
método **preferido** no DM1 em todas as idades (ADA 2026).

## 🫥 O SÍMBOLO QUE VIROU BYTE INVISÍVEL (2026-08-08)

O extrator de PDF trocou `≥` por **U+0002** em oito lugares do artigo de
pré-diabetes. O efeito no extrato:

> "IMC de 25,0 a 29,9 para sobrepeso e **30** para obesidade"

quando a fonte diz **≥30**. O corte virou PONTO em vez de PISO — quem tem IMC 34
deixa de ter obesidade pela leitura do fato. O mesmo apagou o `≥` de
`≥150 min/semana` e dos três porteiros da metformina (`IMC ≥35`, `jejum ≥110`,
`HbA1c ≥6,0%`).

⚠️ **Nenhuma peneira pegava, e não é descuido delas:** `norm()` normaliza aspas,
travessões e espaços, mas não toca em caractere de controle. A citação resolve,
o hash confere, o verificador aprova — e o operador de comparação simplesmente
não está lá. É primo da âncora ambígua: **a prova está íntegra e mesmo assim diz
outra coisa.**

`scripts/confere-controle.js` mostra onde olhar, priorizando o que está colado
em número (que é o que muda conduta). **Ele avisa e não reprova de propósito**:
o conserto exige abrir o PDF e decidir qual símbolo era (`≥`, `≤`, `±`, `→`), e
isso é leitura humana.

Varrido o acervo inteiro: **1 artigo, 8 ocorrências, todas `≥`, todas já
corrigidas.** Rodar ao extrair artigo novo.

E o contraexemplo que impede o conserto automático burro: no mesmo artigo,
"TRIPOD … IMC 30" está **certo sem** o `≥` — o cabeçalho da tabela diz
`bmi at entry, mean (sd)`, então ali 30 é média, não corte.

## 🧪 MUTAÇÃO NO DEFEITO QUE VOCÊ ACABOU DE CONSERTAR (2026-08-08)

Consertei uma cegueira real do `deepFor`, escrevi `scripts/test-caminho-clinico.js`
com **46 medições**, reintroduzi o defeito por mutação para conferir a rede — e
**as 46 passaram alegremente.**

Peneira que não pega o defeito que acabou de ser consertado não é rede, é
enfeite. E o motivo era de FORMULAÇÃO: eu media "o bloco chega?" quando o que
discrimina é "**qual bloco vem primeiro?**". Diabetes tem 232k contra teto de
120k — o bloco existir não quer dizer nada; ele ser escolhido é tudo.

Com a cegueira, *"Pré-diabetes pode reverter sozinho?"* devolvia o bloco de
hiperglicemia por **corticoide** em primeiro, e o de pré-diabetes sumia inteiro.
Essa é a medição que virou teste.

**Regra: todo conserto ganha uma mutação, e a mutação tem de REPROVAR antes de o
conserto ser considerado feito.** Já falhou assim três vezes hoje (a M4 das
ressalvas, o teto do bloco clínico duas vezes).

## 🔎 A CEGUEIRA DO `deepFor`: o nome da área era removido como SUBSTRING (2026-08-08)

Achado pela auditoria do pré-diabetes. A linha era:

```js
const alvo = deacc(tema || area).replace(deacc(canon), ' ');
```

`String.replace` com padrão de TEXTO casa **substring** e troca só a **primeira**
ocorrência. Em Diabetes:

```
"pre-diabetes pode reverter sozinho?"  →  "pre-  pode reverter sozinho?"
```

e o que sobrava, `pre`, morria no filtro de 4 caracteres. A palavra mais
discriminante da pergunta valia **zero** na escolha do bloco. `canonArea`
acertava a área sempre — a cegueira era só na seleção do bloco, que é onde
ninguém olhava.

Conserto: tokenizar **preservando o hífen** e derrubar o nome da área só quando
ele é token inteiro. E emitir cada composto **também partido** (`basal-bolus` →
`basal-bolus`, `basal`, `bolus`), senão o conserto seria troca e não ganho: um
bloco que escreve "basal e bolus" deixaria de casar.

## 🔗 O HASH PROVA QUE O TEXTO NÃO MUDOU — NUNCA QUE ELE VEIO DO LUGAR CERTO (2026-08-08)

Dois fatos **pediátricos** citavam a tabela de **ADULTO**, com `cit_sha`
conferindo e `verifica-extracao.js` aprovando. Não era erro de digitação: as
duas tabelas repetem linhas inteiras, palavra por palavra.

**A causa é estrutural e vale para a base toda.** `lib/citacao.js › referenciar`
localiza a citação com `indexOf(alvo, 0)` — **ancora sempre na PRIMEIRA
ocorrência**. O extrator original tinha a trava certa (um marco de
desambiguação, com comentário explícito de que "as tabelas de adulto e de
criança repetem linhas inteiras") e **a migração para offset a desfez em
silêncio**. Como a tabela de adulto vem antes no artigo, todo texto repetido
migrou para ela.

E o hash não pega, por construção: as duas ocorrências resolvem para o mesmo
texto, logo para o mesmo hash.

`scripts/confere-ancoragem.js` mede isso, e está no `ci-validate`. Medido em
4.441 citações: **71 ambíguas, 0 de risco.**

**A triagem é o que torna a peneira usável.** Ambíguo não é errado:
- **benigno** (a maioria) — recomendação impressa no quadro-resumo e de novo no
  corpo. Texto igual, sentido igual, tanto faz onde ancora. Só avisa.
- **de risco** — o fato **fala de população** (criança/adulto/gestante) e ancora
  na 1ª ocorrência de um texto repetido. É o padrão exato do defeito. **Reprova.**

Saída para quem conserta: abrir as duas ocorrências e decidir. Âncora certa →
marcar o fato com `cit_ancora_ok: true`. Errada → reancorar e estender a citação
até um trecho **único**. A marca existe porque **peneira tem de convergir**:
sem ela, o fato já conferido seria acusado para sempre, e peneira que grita o
que já se sabe correto morre de ser ignorada.

### ⚠️ E a peneira nova quase mentiu na primeira versão

Ela contava ocorrências **pedaço a pedaço** e acusou um fato da diretriz de
obesidade cujo 1º pedaço é `é recomendada a redução sustentada de pelo menos` —
que aparece duas vezes, uma seguida de **5%** e outra de **10%**. Parecia o
achado perfeito. Mas a citação tem **dois** pedaços com elisão declarada, e o
segundo traz "5% do peso… risco DASCV moderado": **junta, ela identifica um
lugar só e prova o número.**

A ambiguidade é da **sequência inteira**, não do pedaço isolado. Contar pedaço
super-relata — e peneira que grita demais é ignorada tão depressa quanto peneira
cega. Corrigido, o total caiu de 91 para 71, e as de risco de 8 para 4 (as 4
restantes conferidas à mão e marcadas).

## 🕶️ PENEIRA CEGA É PIOR QUE PENEIRA AUSENTE — a terceira reincidência (2026-08-08)

A migração das citações para referência (`cit` + `cit_sha`) esvaziou o campo
`citacao`. **Três peneiras liam esse campo e passaram a medir o nada** —
`cobertura-extracao.js`, a sub-peneira `CABEÇA_SOLTA` dentro dela, e agora
`scripts/proporcao-citada.js`, achado pelo auditor do exercício no DM1.

O padrão é sempre o mesmo e é o que o torna perigoso: **a peneira não quebra,
ela ATESTA.** O `proporcao-citada.js` imprimia `✓ nenhum extrato acima de 55%`
somando zero de 27 extratos. Se tivesse dado erro, alguém teria consertado.

Regra que fica: **toda peneira precisa de uma trava que a impeça de dar selo
verde sobre medição vazia.** A do `proporcao-citada.js` é literal — se TODOS os
extratos medirem 0%, ele sai com código 1 dizendo que isso é cegueira, não
limpeza. Ao mudar o formato de um dado, procure quem o LÊ antes de comemorar o
relatório limpo.

## ⚖️ AO CONSERTAR UMA PENEIRA CEGA, NÃO TROQUE O ALARME FALSO PELO SILÊNCIO

Consertado, o `proporcao-citada.js` acusou seis extratos entre 57% e 72% e
gritou "citado verbatim num repositório PÚBLICO". **Era mentira, e na direção
que assusta.** Depois da migração o JSON versionado guarda `[[0,418,271]]` e um
hash: quem clona e não tem o artigo não reconstitui uma palavra.

São **dois números diferentes**, e confundi-los era o erro:

| | o que é | o que faz |
|---|---|---|
| **EXPOSTO** | citação gravada como TEXTO no JSON | risco real de direito autoral · **reprova** |
| **COBERTO** | união de tudo, inclusive só-referência | dependência do artigo · **informa** |

Hoje EXPOSTO é 0% em todos os 27. COBERTO chega a 72% e é sinal editorial
("o extrato virou quase uma tradução"), não jurídico. Antes de reescrever,
conferi os dois lados: `test-citacao-nao-publicada.js` passa, e o
`lib/clinical-deep-data.js` — que É versionado — é gerado só de `f.afirmacao`.

## 📐 A CONTA DE COBERTURA É DE UNIÃO, NUNCA DE SOMA

As auditorias estendem muitas citações a partir de outras, então sobreposição é
regra. Somar comprimentos conta o mesmo trecho duas vezes e passa de 100%. E
como um fato pode ancorar na base 0 ou na 1 (sem hífen de quebra), cujos offsets
não são comparáveis, tudo é resolvido para TEXTO e relocalizado numa régua só.

## 🎯 TESTE QUE PROCURA PALAVRA-CHAVE NUMA JANELA REPROVA O ACERTO (2026-08-08)

O `test-teto-diretrizes.js` reprovou **três vezes** com o bloco CERTO em
primeiro lugar: janela de 70 caracteres (os `tema` cresceram), `[^—]` (o `tema`
tem travessão), janela de 240 (uma frase nova caiu depois dela).

Não era o tamanho da janela — era a **formulação**. O teste quer afirmar "veio o
bloco certo", e isso se verifica por **IDENTIDADE** (comparar o cabeçalho
devolvido com o `tema` esperado), não caçando uma palavra num pedaço do
cabeçalho. Reformulado assim, e conferido por mutação: fazer o `deepFor` PULAR o
bloco que não cabe volta a reprovar, mostrando MODY no lugar da cetoacidose.

## 🚦 RELATO DE AGENTE É PISTA, NÃO PROVA — meça você mesmo

O auditor do corticoide entregou um pacote de roteamento medido: "base GIH 6/12
→ 11/12, Adrenal 15/15, dano zero". Montei **bateria própria**
(`scratchpad/bateria-caminho.js`) e a minha linha de base deu **3/12**, não
6/12. Não é contradição — são perguntas diferentes —, mas é a razão de o número
que vale ser o medido aqui. Já houve agente relatando "regressão passa" quando
não passava.

E a bateria própria pegou **dois danos que o relato não tinha**: promover
`glicemia`/`hiperglicemia` a peso de doença sequestrava "hiperglicemia na
acromegalia", e promover `insulina` sequestrava "obeso em insulina: indico
bariátrica?". Daí o quarto degrau de peso (abaixo).

**A bateria tem duas metades, e a segunda é a que importa:** alvos (resposta
certa conhecida) e **sentinelas**, medidas por MOVIMENTO contra um instantâneo —
a pergunta pode estar hoje numa área discutível, mas o pacote não pode ser o que
a muda.

## 🔋 FORÇA MÁXIMA COM FREIO EM 85% — e o medidor, porque eu não enxergo o painel (2026-08-08)

Regra do professor, válida **até o fim da extração/auditoria**: rodar a todo vapor
e **recuar aos 85% do consumo**, voltando à força máxima quando a janela resetar.

⚠️ **O percentual está no painel DELE, não na minha sessão.** Sem medir, "recuar
aos 85%" é palpite — e o palpite já falhou uma vez, custando 4 agentes mortos no
meio do trabalho. O que eu SEI medir é o `subagent_tokens` que cada agente relata
ao terminar. Daí o `scripts/orcamento-agentes.js`:

```
node scripts/orcamento-agentes.js                 # estado e veredito (saída 2 = freio)
node scripts/orcamento-agentes.js --soma 253751   # registra um agente que terminou
```

O teto de 2,0 M de tokens por janela é **calibrado, não oficial**: vem da única
observação real que existe — a janela estourou com 8 agentes rodando quando o
painel marcava 92%, somando ~2,0 M. Na conferência seguinte o script marcou 58%
com o painel em 57%. É grosseiro e deliberadamente conservador: **errar para baixo
custa uma pausa; errar para cima mata agente no meio e perde tudo o que gastou.**

O freio é o **passo zero** da rotina horária. Ao bater 85%: não lançar agente
novo, deixar terminar o que já roda, commitar e encerrar em silêncio.

E a lição de como isso deu errado na primeira tentativa: lancei **8 agentes de uma
vez**, o limite de 5 horas estourou no meio, e **4 morreram com o trabalho pela
metade**. Agente morto não devolve nada — os tokens que ele gastou viram zero.

**Lote grande demais não é força máxima, é desperdício máximo.** A força está no
trabalho CONCLUÍDO, e um lote só é bom se couber inteiro no orçamento restante.
Melhor 5 que terminam do que 8 que morrem aos 60%.

**O que salvou o que dava para salvar** foi a convenção da pasta isolada
`scratchpad/acervo/trabalho/<fileId>/`:

- os **9 textos-fonte já baixados** sobreviveram — e o download do Drive + extração
  do PDF é a parte cara e lenta;
- **2 extratos parciais** (118 e 116 fatos) sobreviveram **conferidos, 0
  reprovados**, e um agente novo pôde CONTINUAR em vez de recomeçar.

**Ao relançar depois de uma queda por limite:** antes de disparar, rode um
inventário das pastas de trabalho (texto presente? extrato parcial? quantos
fatos?) e mande o agente **continuar**, não recomeçar. O prompt tem de dizer, com
todas as letras, "NÃO apague o que está lá, ACRESCENTE" e "o texto já está
baixado, não vá ao Drive".

**Ordem de prioridade ao escolher o lote:** primeiro os que têm trabalho parcial
salvo (o token já gasto se aproveita), depois os que têm o texto baixado, e só
então os que começam do zero.

## 📚 A CITAÇÃO NÃO É MAIS PUBLICADA — e continua sendo a prova (2026-08-08)

Duas exigências certas, juntas, produziram uma terceira coisa que nenhuma das
duas pediu:

- extrair EXAUSTIVAMENTE (o professor pediu "100% das informações");
- exigir CITAÇÃO LITERAL para cada fato (a garantia anti-alucinação).

Somando as citações de um extrato, **72% de um artigo Elsevier por assinatura
estava reconstituível verbatim** neste repositório, que é PÚBLICO. Cinco extratos
passavam de 55%. Nenhum dos artigos é open access.

**A saída não podia ser encurtar a citação** — seria trocar risco jurídico por
risco clínico, e o clínico é pior. A saída foi separar PROVA de PUBLICAÇÃO:

```json
"cit":     [[0, 12045, 236]],        // base, offset, tamanho no texto-fonte
"cit_sha": "a3f9c2…"                 // hash do texto literal resolvido
```

O texto continua em `scratchpad/acervo/textos/`, que está no .gitignore. Quem tem
o artigo resolve e confere tudo o que se conferia antes; quem não tem, não ganha
o artigo de graça. **A prova ficou MAIS forte**: deslocar o offset em 1 caractere
agora reprova, o que o `includes` de antes não pegava.

**No fluxo de trabalho:** o agente extrator continua escrevendo `citacao` com o
texto — é o jeito natural, e o verificador aceita as duas formas. Antes de
commitar, rode:

```
node scripts/protege-citacoes.js     # troca texto por offset+hash
node scripts/mostra-citacao.js <extrato> [n|--busca "termo"]   # ler a prova localmente
```

`scripts/test-citacao-nao-publicada.js` (no `ci-validate`) reprova se um extrato
RASTREADO ainda tiver texto. Esquecer publica o artigo, e ninguém percebe.

**O que continua versionado, e por quê:** as citações dentro do campo `conflito`
(~383 caracteres por artigo, menos de 1% de cada um). Elas são o aviso de
segurança entregue à IA em tempo de execução — sem elas o bloco chega sem
ressalva.

## 🕶️ PENEIRA CEGA DEVOLVE "✓" SEM TER OLHADO (2026-08-08)

Ao migrar as citações, rodei `cobertura-extracao.js` e o relatório veio **limpo**.
Eu quase comemorei. As peneiras liam `f.citacao`, que tinha acabado de sumir do
JSON: elas não acharam nada porque não tinham o que ler.

**Limpo era o sintoma, não o resultado.** Quando um campo que uma verificação
consome muda de forma, a verificação não falha — ela emudece, e o silêncio se
parece com aprovação. Hoje `cobertura-extracao.js` reclama alto quando não
consegue resolver a citação, em vez de aprovar por omissão.

**A regra:** ao mudar o formato de um dado, procure TODO consumidor
(`grep -n "\.campo"`) e confira se o número de achados MUDOU no sentido esperado.
Verificação que passa a achar zero logo depois de uma migração está quebrada até
prova em contrário.

## 🚪 AUDITE O CAMINHO, NÃO SÓ O CONTEÚDO (2026-08-07)

A auditoria da hipofosfatasia devolveu 15,4% de erro semântico e **zero
inversões clínicas** — e mesmo assim concluiu que *"como está hoje, a base pode
levar alguém a dar bisfosfonato a quem não deve"*. Nenhum fato errado. Três
defeitos de **caminho**:

1. a pergunta do médico não canonizava para nenhuma área (`"osteoporose"` → `''`);
2. o chat não mandava a pergunta como `grounding`, então **nunca** recebia base
   profunda — em nenhum tema;
3. quando o bloco chegava, o cabeçalho da ressalva mandava preferir o núcleo,
   exatamente onde a fonte contraindica o que o núcleo recomenda.

**A regra:** extração verificada não é entrega. Depois de extrair, teste a
CADEIA com a pergunta que um médico faria de verdade — em português, com
vinheta, com o termo decisivo no meio da frase:

```
node -e "const d=require('./lib/clinical-deep');
const q='<a pergunta real>'; console.log(d.canonArea(q), d.deepFor(q,120000,q).length)"
```

Se der `'' 0`, o artigo não existe para quem pergunta. **Ao mandar auditar, peça
também:** *"que pergunta um médico faria para precisar deste artigo, e ela chega
até ele?"*

## 🕰️ A RESSALVA ENVELHECE — e quanto melhor a varredura, mais depressa (2026-08-07)

O campo `conflito` é uma **fotografia do núcleo no dia da leitura**. A varredura
CORRIGE o núcleo (é metade do objetivo dela), e no instante em que corrige, a
ressalva do artigo que motivou a correção passa a descrever um núcleo que não
existe mais. Medido: **6 das 13 ressalvas** citavam texto já substituído — a do
prolactinoma mandava sobrescrever uma entrada **já certa**.

**A trava é a mesma dos fatos: citação literal, conferida.** Ao escrever ou
mexer num `conflito`, preencher:

- `conflito_direcao` — **obrigatório, sem padrão**: `nucleo_prevalece` |
  `fonte_prevalece` | `lacuna` | `misto` | `alinhado`. O montador reprova sem ele.
- `nucleo_citado` — trechos que a ressalva atribui ao núcleo, **verbatim**. É o
  que quebra quando o núcleo muda.
- `nucleo_ausente` — para `lacuna`: se o termo passar a existir, a lacuna acabou.
- `nucleo_prevalece_porque` — exigido quando a ressalva contém proibição e a
  direção é `nucleo_prevalece`.

**Depois de corrigir o núcleo a partir de um artigo, volte no `conflito` daquele
artigo.** Rode `node scripts/confere-ressalvas.js` (está no `ci-validate`).

## 🧪 TESTE QUE CONFERE CONSISTÊNCIA NÃO CONFERE CORREÇÃO (2026-08-07)

Descoberto testando por mutação a própria correção acima. Troquei o
`conflito_direcao` da hipofosfatasia de volta para `nucleo_prevalece` — a
inversão original, a que entrega contraindicação sob ordem de ignorá-la — e
**todos os testes continuaram verdes**. Porque eles conferiam que o cabeçalho
entregue bate com o campo declarado, e o cabeçalho **muda junto com o campo**.

E não dava para consertar com mais asserção: a **mesma linguagem de proibição
aparece nas duas pontas**. Na hipofosfatasia é a fonte que proíbe e ela tem de
vencer; no PTDM de 2016 é a fonte que manda evitar iSGLT2 e ela tem de perder
para o ADA 2026 do núcleo. Nenhum teste distingue os dois — só julgamento clínico.

**A saída, quando o certo não é derivável:** não finja que é. Exija que o
julgamento fique **escrito** (`nucleo_prevalece_porque`) e falhe sem ele. Não
impede o erro; impede que seja cometido de passagem. E **diga no próprio teste o
que ele não prova** — asserção que não pode falhar é pior que asserção nenhuma,
porque compra confiança sem entregar nada.

## 🎣 RECUPERAÇÃO FALSA: o perigo não é o que o fato diz, é o que ele responde (2026-08-07)

Modo de falha descoberto na auditoria da tireoide, e que nenhuma das quatro
camadas anteriores mede.

Nenhum dos 218 fatos afirmava "dar iodo antes da tionamida" — três diziam
explicitamente o contrário. Mas:

- **um** fato continha a frase *"o iodo for administrado primeiro"* (correto: é
  a ordem entre iodo e **lítio**, terapia alternativa de uso incomum). Numa base
  indexada, é ele que volta para *"qual a ordem do iodo na tempestade?"*;
- **três** fatos de dose de iodo não tinham marcador de ordem nenhum — e a fonte
  **tinha** o marcador na mesma célula de tabela. O fato irmão do SSKI preservou;
  o do Lugol perdeu. Assimetria dentro do mesmo extrato.

**A regra:** num acervo atomizado, todo fato precisa sobreviver a ser lido
SOZINHO. Fato de dose de um fármaco cuja ORDEM importa tem de carregar a ordem.
Fato de posologia cuja indicação tem porteiro (diagnóstico, população, fase) tem
de carregar o porteiro — foi o mesmo defeito no NTIS, onde a posologia de
hormônio flutuava ao lado da mensagem "não trate o eutireoidiano doente".

**Ao mandar auditar, peça explicitamente:** *"o que este fato responde se for
recuperado sozinho, sem os vizinhos?"*

## ⏰ Rotina horária que mantém a sessão viva (2026-08-07)

*"mantenha sempre a sessão ativa"*. O contêiner é recuperado por inatividade, e
com ele param os agentes e se perde o estado de trabalho. Criada a rotina
**`Endodirect — varredura clínica`**, que dispara **de hora em hora nesta mesma
sessão** (não abre sessão nova — o contexto continua).

**A ordem de prioridade que ela segue**, sempre nesta ordem:
1. processar resultado de agente pendente (conferindo as acusações graves no
   texto-fonte antes de aceitar — auditor erra);
2. auditar os extratos que ainda não têm o campo `auditoria`, **priorizando por
   risco clínico do assunto, não por tamanho**;
3. só então extrair artigo novo, começando pelas áreas sem nenhum bloco.

**⚠️ LIMITAÇÃO REAL da rotina: ela roda SEM conectores MCP.** As sessões que ela
dispara não têm Google Drive nem GitHub. Consequências práticas:
- **não consegue baixar artigo novo do Drive** (a etapa 3 fica bloqueada);
- **não consegue abrir nem dar merge em PR** — ou seja, **não deploya**.

O que ela FAZ bem: auditoria (os agentes trabalham em arquivo local), correção de
extrato, verificação, remontagem da base, commit e push para o branch. O trabalho
se acumula no branch e vai para produção na próxima sessão viva.

Para a rotina ganhar conectores, ela precisa ser criada pela interface de
Routines do claude.ai, não por aqui.

## 🚀 Deploy AUTORIZADO em pé, sem perguntar (2026-08-07)

*"pode ir deployando sem falar comigo"* — dito depois de eu segurar em produção,
esperando aprovação, uma correção de conteúdo clínico que podia levar alguém a
corrigir sódio rápido demais. **A autorização é permanente e vale para o
trabalho normal.**

**O que NÃO muda:** deploy só depois de `ci-validate` + harness A/B em Chromium
(e, para mudança de aparência, print). A autorização remove a espera pela
aprovação, não a conferência.

**O que continua exigindo pergunta**, porque é decisão dele e não minha:
mudança de preço, de regra de acesso/liberação de curso, envio de e-mail em
massa, e qualquer coisa que apague dado de aluno.

**A lição por trás:** havia correção clínica pronta e testada parada no branch
enquanto a versão errada rodava em produção. Segurar por educação tem custo — e
naquele caso o custo era clínico.

## 🕳️ A QUARTA camada: erro de OMISSÃO não deixa rastro (2026-08-07)

A auditoria adversarial do consenso de prolactinoma achou 9 erros de sentido em
175 fatos (5,1%). **Nenhum deles foi o achado que importou.**

O artigo tem **151 recomendações graduadas**. O extrato cobria as primeiras e
**parou em "Aggressive prolactinomas"**. Gestação (15 recomendações),
criança/adolescente, doença psiquiátrica, menopausa, pessoa trans e doença renal
crônica ficaram **inteiramente de fora** — e o campo `tema` do extrato
**anunciava todos eles**.

**Por que nenhuma camada existente pegava isso:**

| camada | o que mede | por que passa |
|---|---|---|
| `verifica-extracao.js` | a citação existe no PDF? o número bate? | o que está lá está certo |
| autoconferência do agente | o mesmo | idem |
| auditoria adversarial | o sentido do que está lá | audita o que existe |

Um fato errado alguém contesta. **Uma seção ausente é invisível** — e quem
consome o extrato lê o `tema` e supõe cobertura completa.

`scripts/cobertura-extracao.js` é a peneira que faltava, e virou
**pré-requisito do montador** (como a etapa 3), não relatório opcional:

1. **COBERTURA** — recomendações graduadas no PDF × fatos que declaram força.
2. **PROMESSA** — cada tema anunciado no campo `tema` aparece em algum fato?
3. **CITAÇÃO TRUNCADA** — citação terminada em preposição, conjunção ou hífen.
   Ela passa no verificador e **não sustenta a afirmação**. Dois fatos tiveram de
   ser apagados por isso: o PDF de duas colunas parte a frase no meio, e o
   pedaço que sobra ("…in patients aged", "…and are of low concern for") vira
   lastro falso. 13 dos 19 extratos têm alguma citação assim.

**Regra:** ao mandar extrair, dizer explicitamente para não usar citação partida
e para preservar população e qualificadores ("men", "children",
"microprolactinoma", "rarely", "although", "potentially") — foi por perder esses
que 6 dos 9 erros de sentido entraram.

## 🩺 A terceira camada pagou: 2,3% de erro SEMÂNTICO num extrato aprovado (2026-08-07)

O extrato da Diretriz Internacional de SOP 2023 passou nas duas primeiras
camadas: verificador mecânico (256/256 citações existem no PDF, todo número da
afirmação aparece na citação) e autoconferência do extrator. A auditoria
adversarial auditou **os 256 fatos** e achou **6 não-OK — 2,3%; 3,3% no
subconjunto de alto risco**.

### O erro que justifica a camada inteira

Fato [232]: *"letrozol é 1ª linha; **clomifeno associado a metformina**,
gonadotrofinas ou cirurgia ovariana têm papel principalmente de **segunda
linha**"*. A fonte diz: *"Letrozole is the preferred first line pharmacological
infertility therapy, **with clomiphene in combination with metformin**;
gonadotrophins or ovarian surgery primarily having a role as second line
therapy."*

**O ponto e vírgula é o divisor.** Clomifeno+metformina é aposto da 1ª linha, não
da 2ª. A citação é literal e correta — a leitura é que inverteu. **Nenhuma
camada mecânica pega isso.**

E o dano seria clínico: o letrozol é off-label em vários países, então rebaixar
a via ORAL empurra o clínico direto para gonadotrofina ou cirurgia, removendo a
alternativa barata e segura — o oposto do que a diretriz quer.

### Onde os erros se concentraram

Os dois graves ([232] e o AMH sem "em adultas") vieram da **Discussion**, não das
tabelas de recomendação. Em texto corrido a qualificação mora na frase seguinte
ou depois de um ponto e vírgula. **Gate para as próximas levas:** fato originado
em Abstract/Discussion exige leitura do parágrafo inteiro e dois testes
explícitos — *"vale para adolescente?"* e *"esta frase atribui linha de
tratamento?"*.

### ⚠️ Minha própria instrução injetou uma premissa falsa

Mandei o auditor conferir "ultrassom não diagnostica dentro de 8 anos da
menarca". **Esse prazo não existe neste artigo** — é da diretriz de 2018. O
auditor não engoliu e me corrigiu. Lição: o prompt do auditor também é fonte de
erro, e um auditor que só confirma o que o chefe sugeriu não serve.

### Melhoria estrutural pendente

O extrato **não registra a categoria** da recomendação. A diretriz separa
evidência (EBR), consenso clínico (CR) e ponto de boa prática (PP, "evidence not
sought") — e o formato atual entrega os três iguais para a IA. Levar `tipo` e
GRADE como campos do fato.

## 🎨 Mudança de APARÊNCIA se confere com print, não com teste (2026-08-07)

O `ci-validate` e o harness A/B em Chromium provam que o app **sobe** e que o
bloco grande executa até a última linha. **Nenhum dos dois vê se ficou bonito** —
que foi exatamente a reclamação do professor sobre os ícones dos cursos.

Ao desenhar as capas, três glifos passaram em toda verificação e estavam errados
na tela: a tireoide virou dois círculos, o osso virou um halter de academia e a
adrenal virou outra gota, indistinguível da do diabetes. Só apareceu quando
montei uma bancada que renderiza os candidatos lado a lado, no tamanho real, e
tirei print.

**O procedimento:** extrair o CSS e o JS reais do `index.html` (nunca reescrevê-los
no harness — senão se testa outra coisa), renderizar em Chromium, tirar print
**nos dois temas** e **na largura de celular**, e olhar. Foi assim que apareceu
também que o card de 176 px fixos deixava **um por linha** no celular.

O harness fica em `scratchpad/capas/` (`render.js` = as telas reais;
`cand.js` = candidatos lado a lado para escolher um glifo).

## 🔬 Varredura do acervo clínico: ritmo escolhido é o SEGURO (2026-08-07)

Perguntado se preferia acelerar (6–8 agentes simultâneos) ou manter o ritmo, o
professor respondeu: *"Deixe do jeito mais seguro e preciso. Não vamos perder
qualidade."* **A decisão é essa, e vale para o resto da varredura.** Levas
pequenas, verificação completa, nada de paralelismo que atropele conferência.

### As três camadas de conferência, e o que cada uma NÃO pega

1. **`scripts/verifica-extracao.js`** — a citação existe no texto? o número da
   afirmação aparece na citação? ⚠️ **Não confere se a citação SUSTENTA a
   afirmação.** Um trecho verdadeiro embaixo de uma frase que diz outra coisa
   passa.
2. **Autoverificação do agente** — ele roda o script contra si mesmo até passar.
   Pega os próprios deslizes de fatiamento (foi assim que 53 fatos foram
   reescritos na 1ª leva), mas **é o mesmo autor conferindo o próprio trabalho**.
3. **Auditoria adversarial** (criada em 07/08) — um agente que tenta DERRUBAR
   extratos já aprovados, classificando cada fato em OK / EXAGERO / INVERSÃO /
   DESCONTEXTO / INCOMPLETO. Audita amostra + **todos** os fatos com dose, corte
   laboratorial, "contraindicado", "não deve", "primeira linha" ou percentual —
   os que causam dano se errados.

**A lição por trás:** as duas primeiras camadas medem FIDELIDADE LITERAL; nenhuma
mede FIDELIDADE DE SENTIDO. Antes de escalar a extração, medir a taxa de erro
semântica — escalar um processo cuja taxa de erro você não conhece é multiplicar
o desconhecido.


## 🌐 A rede do ambiente é CONFIGURÁVEL — e desde 06/08/2026 está aberta (2026-08-06)

Durante meses eu tratei "o proxy bloqueia" como fato da natureza e **construí
contornos**: o harness de Chromium local existe porque eu não alcançava o preview
da Vercel; recusei escrever conteúdo clínico porque não alcançava o site da
revista; validei o filtro de imagem com **fixtures inventadas por mim** porque não
alcançava o Open-i.

**Era configuração, não limite.** O ambiente roda com um nível de acesso de rede
(`None` / `Trusted` / `Full` / `Custom`). O padrão é **Trusted**, que libera só
uma lista fixa (npm, PyPI, GitHub, registries) — todo o resto leva **403 do
proxy**. Em `claude.ai/code` → ícone de nuvem acima da caixa de mensagem →
engrenagem do ambiente → **Network access: Custom** → **Allowed domains**, um por
linha. ⚠️ Marcar **"Also include default list of common package managers"**, senão
o Custom SUBSTITUI a lista padrão e o npm/PyPI somem.

O professor abriu em 06/08 e passou a valer **na sessão em curso**, não só nas
novas. Liberados: `openi.nlm.nih.gov`, `eutils.ncbi.nlm.nih.gov`,
`pubmed.ncbi.nlm.nih.gov`, `endodirect.com.br` (+ subdomínios), `*.supabase.co`,
`*.vercel.app`.

**O que isso mudou na mesma hora:** validei o filtro de imagem contra a busca real
e descobri que **3 das 6 figuras que meu filtro aprovava não eram exame** (curva
ROC, gráfico de barras, lâmina de citologia) — as fixtures davam 10/10. Ver
[[Decisões]].

**A lição, e ela é geral:** *fixture escrita por mim é otimista por construção — eu
escrevo a entrada que o meu código espera.* Antes de me contentar com teste
sintético, **perguntar se dá para bater na fonte de verdade** — e se um 403 estiver
no caminho, dizer qual host e pedir, em vez de contornar.

⚠️ **Não contornar a política por dentro:** cheguei a ver que o Postgres do
Supabase tem a extensão `http` disponível e daria para fazer o banco buscar por
mim. Não é o caminho — é furar a política de egresso por dentro da produção, e
abre SSRF a partir do banco. O `README` do proxy diz explicitamente para **relatar
o host bloqueado, não rotear em volta**.

## ⚠️ Branch depois de um squash-merge: rebase ANTES de abrir o próximo PR (2026-07-31)

Abri o PR #659 no mesmo branch que já tinha sido **squash-mergeado** duas vezes. Dois sintomas, os dois com cara de outra coisa:
- **O CI não disparava.** Nenhum run de `validate` aparecia — só o check da Vercel. Cheguei a suspeitar de Actions desligado e a inventar teoria sobre eventos de app.
- **O merge deu 405 "merge conflicts"**, sem conflito nenhum no `git merge-tree` local.

**A causa é a mesma:** o squash faz `main` ganhar UM commit novo que não é nenhum dos commits do branch. O branch fica divergido, o GitHub vê os patches já aplicados como conflito e o PR entra num estado em que o evento não gera run.

**A correção é uma linha,** e é a mesma dos dois casos: `git fetch origin main && git rebase origin/main` — o rebase **descarta sozinho** os patches já upstream (`dropping … -- patch contents already upstream`) — depois `push --force-with-lease`. Feito isso, o CI disparou e o merge passou na hora.

**Ficou também:** `workflow_dispatch` no `.github/workflows/ci.yml`, para dar como pedir a validação sem empurrar commit vazio.

### Resultado da 1ª auditoria adversarial (07/08/2026): 6,1%

**196 fatos auditados nos 3 extratos de maior risco. 12 achados.**
EXAGERO 8 · DESCONTEXTO 3 · INCOMPLETO 1 · **INVERSÃO 0**.
⚠️ **Nenhum número, dose ou corte estava trocado** — a fidelidade numérica que o
verificador garante estava de pé. O que se perdia era outra coisa.

**O padrão dominante, e virou guarda automática:** *"We suggest"* — recomendação
GRADE **condicional**, às vezes com certeza muito baixa — chegava à base como
**"não se deve"**, **"devem ser trocados"**, **"deve-se"**. Uma sugestão fraca
virava ordem. `forcaPerdida()` no verificador agora reprova isso; ela achou
**7 casos**, dois a mais do que a amostra da auditoria tinha visto.

**A guarda é ESTREITA de propósito:** só dispara com "we suggest" na citação (marcador
inequívoco) + imperativo em português + nenhuma ressalva. A primeira versão aceitava
a palavra **"pode"** solta como ressalva e deixou passar um caso — "pode" aparece por
mil motivos numa frase e não é sinal da força da recomendação.

**Achado sistêmico que nenhuma guarda pega:** no craniofaringioma, **56% (139/249)**
das citações terminam no meio da frase — o PDF de duas colunas foi extraído com as
colunas intercaladas. A citação existe e os números batem, mas ela não é prova
legível sozinha. Nos artigos que extraí **localmente com pdfjs** (hiponatremia) isso
cai para **5%**; nos vindos do texto do Google Drive, sobe. **Quando houver escolha,
extrair o texto localmente.**

**hipo-3 passou LIMPO** — 61 fatos, zero achados, com todos os limites de correção,
doses e "primeira linha" exatos. É a prova de que a taxa não é ruído de método.


## 🖥️ Mudança de JS no `index.html` — testar em NAVEGADOR REAL antes de mergear

O cofre já registrava a regra ([[Pendências]], item do OSCE lazy): **dois apagões**
em 2026-06 derrubaram toda a interatividade da plataforma com o `ci-validate`
(parse) **e** um sandbox `vm` **passando**. O ferramental de parse não detecta o
que quebra a execução desse `index.html` de 1,4 MB.

Desde 31/07 existe o harness: **`scratchpad/boot-navegador/check.js`** — sobe
Chromium de verdade (já vem no ambiente, `/opt/pw-browsers/chromium-1194/`) e roda
o **mesmo teste contra a `main` e contra o branch**. Diferença entre os dois é
culpa do diff. É o substituto do preview da Vercel quando o proxy não alcança
`vercel.app` (que é o caso deste ambiente).

**A sonda que presta:** a **última linha** do bloco grande liga um listener em
`#fb-submit`. Se ele existe (lido por CDP `DOMDebugger.getEventListeners`), as
13.398 linhas rodaram até o fim — que é exatamente o que o apagão quebrava.

### ⚠️ Duas armadilhas que me fizeram ler um falso apagão (31/07)
1. **Os `<script src>` de CDN são bloqueantes e o proxy os PENDURA** em vez de
   recusar. Sem interceptar, o parser trava no primeiro e **nenhum bloco inline
   executa** — os dois lados medem zero e parece que o app morreu.
2. **O app inteiro é uma IIFE** (`l.2552–15950`, `'use strict'`). As funções
   **não** viram propriedades de `window`: `typeof goPanel` é `'undefined'` com
   tudo funcionando. Minha primeira versão sondava `window[...]` e "reprovou" um
   branch que estava perfeito. **Sonda errada é pior que teste nenhum** — ela
   produz um veredito com cara de evidência.


## ⚠️ Ler o cofre ANTES de escrever código — não só depois, para registrar

Instrução direta do Rodolpho (2026-07-27): *"Sempre, sempre cheque o cofre para não dar bobeira."*

O cofre não é só o lugar onde eu **anoto** o que fiz; é onde descubro o que **já existe**. Buscar aqui pelos nomes que vou tocar (constante, função, campo, tabela) **antes** de editar leva segundos e evita reconstruir algo já resolvido de outro jeito.

- **Caso concreto (2026-07-27):** ia mergear o PR #539, que criava a constante `RESUMO_ONLY_SUBS`. Um `grep` no cofre mostrou que a `main` já tinha **`RESUMOS_ONLY_SUBS`** (com S), resolvendo o mesmo problema por outro mecanismo, desde 17/07. Sem essa checagem eu teria deixado **duas constantes quase homônimas** no mesmo arquivo — o tipo de coisa em que alguém edita uma e esquece a outra. Detalhe: `grep` no `index.html` pelo nome do #539 dava **zero**, porque o nome real diferia por uma letra. **Foi a prosa do cofre que pegou, não o código.**
- **Como buscar:** `grep -rn "<termo>" cofre/` com o **conceito** (ex.: "Endocrinologia Básica", "rascunho", "clobber"), não só com o identificador exato — o nome no código pode diferir do que estou prestes a escrever, e é justamente aí que mora o erro.
- **Vale em dobro para PR antigo:** um PR parado por dias pode ter sido resolvido por outro caminho enquanto isso. Antes de mergear, conferir no cofre **e** no código se o problema ainda existe.

### ⚠️ `git fetch origin main` também faz parte de "checar antes" (2026-07-28)
O professor pediu a discussão completa dos artigos do Mural. Eu li o cofre, li o `lib/radar.js`, medi 76/253 open-access, descobri que o `api/` estava em 12/12 e **propus construir a funcionalidade** — que **já estava pronta e em produção**, mergeada no **PR #626** minutos antes, com `lib/fulltext.js`, `lib/discussao.js` e o botão no card.

O detalhe que dói: cheguei sozinho exatamente ao mesmo desenho (abstract não sustenta discussão; só PMC tem texto integral; tabela sim, figura não; endpoint dentro de um handler existente por causa do teto de 12). Não foi análise perdida — foi **trabalho refeito**, e uma pergunta ao professor que não precisava existir.

- **A causa:** a branch estava em `c46558b`, e a `main` já tinha `c392dd8`. Ler o cofre não bastou porque **o cofre ainda não tinha sido atualizado** com o #626 — o registro chega junto com o merge, não antes dele.
- **A regra:** antes de propor ou escrever qualquer coisa nova, `git fetch origin main && git log --oneline origin/main -5` e, se o assunto tiver nome, `git log --oneline -S"<termo>" origin/main`. São dois comandos.
- **Sinal secundário que eu tinha na mão e ignorei:** o `get_deployment` da Vercel trazia a mensagem do commit de produção, e ela dizia *"Discussão completa do artigo no Mural"*. **Metadado de deploy é fonte sobre o que está no ar** — vale ler, não só olhar o `readyState`.

## Números de artigo: "conferido" só vale contra o PDF

**⚠️ LIÇÃO (2026-07-28).** O `check_numeros.js` prova que **todo número da ficha existe na prosa do resumo**. Isso pega inconsistência interna — mas **prosa e ficha são ambas escritas por mim**, então um número errado na origem passa nos dois lados sem alarme nenhum. Foi o que aconteceu no 3º lote: os quatro artigos passaram em todos os checadores e, quando o professor mandou os PDFs, **três afirmações caíram** (pressão arterial no SCOUT e no COR-I; convulsão e suicidalidade atribuídas ao COR-I).

- **Vocabulário honesto:** enquanto não houver conector de busca autorizado, dizer "conferido" só é legítimo para o que foi lido **no PDF**. Para o resto, a frase é "coerente internamente, **pendente de revisão**".
- **Onde o erro nasce:** não nos números de eficácia — esses eu costumo lembrar bem. Nasce na **segurança**, ao escrever o que "todo mundo sabe da classe" em vez do que aquele ensaio mediu. Efeito adverso de bula ≠ achado do estudo; os dois podem ser verdadeiros e **não são a mesma afirmação**.
- **Armadilha específica, que apareceu duas vezes no mesmo lote:** "o fármaco eleva a pressão". Em estudos de emagrecimento a pressão em geral **cai nos dois braços**, e o fármaco apenas **atenua a queda**. Antes de escrever que algo eleva a PA, procurar no artigo se a comparação é **contra o basal** ou **contra o placebo** — quase sempre é a segunda.
- **DECISÃO DO RODOLPHO (2026-07-28): pode escrever primeiro, sem esperar o PDF.** Eu havia proposto exigir a fonte antes de redigir qualquer artigo novo; ele preferiu manter a velocidade e conferir depois. **Consequência operacional, que fica valendo:** enquanto o artigo não passou por PDF, ele é **"coerente internamente, pendente de revisão"** — nunca "conferido" —, e isso vale tanto no que eu digo no chat quanto no que o cofre registra. O rótulo é o que sustenta a escolha dele: sem ele, a velocidade viraria confiança indevida.
- **Ao conferir um PDF, ir direto a:** n randomizado (≠ n incluído), desfecho primário com IC e p, componentes do composto, mortalidade separada, PA/FC com a base de comparação explícita, critérios de exclusão (eles explicam ausências de eventos) e % que completou o estudo.

## ⚠️ Falso positivo do stop-hook de assinatura DEPOIS de um merge

**Situação (2026-07-28, PR #625).** Terminado o merge, alinhei a branch local com a `main` (`git checkout -B <branch> origin/main`). O stop-hook de verificação de assinatura então acusou o commit do topo como "Unverified — committer email is not noreply@anthropic.com" e sugeriu `git commit --amend --no-edit --reset-author`.

**NÃO fazer isso.** O commit acusado era o **squash-merge criado pelo próprio GitHub** (`committer: GitHub <noreply@github.com>`, autor = o dono do repo), já presente em `origin/main` e **já em produção**. Amendá-lo reescreveria história publicada e exigiria **force-push na `main`** — quebrando o vínculo com o PR e a correlação com o deploy.

**Como distinguir em 10 segundos**, antes de obedecer ao hook:
```
git log -1 --format='autor: %an <%ae>  committer: %cn <%ce>' <sha>
git branch -r --contains <sha>     # se aparecer origin/main, é história publicada
```
- **Committer `GitHub <noreply@github.com>` + presente em `origin/main`** → é o merge do GitHub. **Não tocar.**
- **Committer meu, ainda não empurrado** → aí sim vale o `--amend --reset-author`.

**⚠️ A partir de 29/07 esse aviso passou a ser ESPERADO, e com frequência.** Desde que a branch é reiniciada da `main` logo após cada merge (ver Git / deploy), o topo dela fica sendo justamente o squash-merge do GitHub até eu fazer o próximo commit. Ou seja: **o hook vai acusar depois de todo deploy**. Não é sinal de nada — é o preço de manter a branch alinhada. Aconteceu duas vezes seguidas (#629 e #630) com a mesma resposta.

O falso positivo se resolve sozinho no commit seguinte da branch. E vale a regra geral: **hook é feedback, não ordem** — quando a correção sugerida for destrutiva ou irreversível, conferir o alvo antes.

## Git / deploy

### ✅ Deploy AUTORIZADO em pé — não perguntar (2026-07-28)

**⚠️ Reiniciar a branch LOGO APÓS o merge, não na próxima entrega.** Aconteceu duas vezes em 29/07 (#628 e #629): mergeei por squash, continuei commitando na branch antiga e o PR seguinte abriu com conflito. O squash cria um commit novo na `main` que não é ancestral da branch, então tudo que estava no PR anterior volta a aparecer como diferença.
```
# imediatamente depois de mergear:
git fetch origin main && git checkout -B <branch> origin/main
```
Se já houver commit novo em cima da branch velha, o conserto é `git checkout -B <branch> origin/main && git cherry-pick <sha do commit novo>` — barato, mas evitável.

Instrução direta do Rodolpho: *"Sempre pode gerar deploy sem perguntar."*

Vale para o fluxo normal do projeto: branch → PR → squash-merge na `main` → a Vercel publica. **Não** esperar aprovação a cada entrega; o que se espera é o **relato depois**, com o que foi ao ar e o estado do deploy.

O que a autorização **não** dispensa:
- **CI verde antes de mergear** (`node scripts/ci-validate.js`) — a autorização é para não perguntar, não para pular verificação.
- **Confirmar `state:READY` no `target:production`** depois do merge. Um PR mergeado pode ficar fora do ar (já aconteceu em #311/#313, deploy ERROR pelo teto de funções) e o professor veria o bug "corrigido" continuar.
- **Gravação em banco** e **ação irreversível** continuam fora deste escopo: aqui a autorização é de *publicar código*, não de apagar ou reescrever dado do professor.

- **⚠️ LIÇÃO (2026-07-28) — a regra do `tail` vale para o `git push` TAMBÉM, e eu a repeti:** meu laço de retry era `if git push ... 2>&1 | tail -1; then echo "PUSH OK"`. Num pipeline o **exit code é o do último comando** (`tail`), que sempre sai 0 — então um push **rejeitado** (non-fast-forward) imprimiu "PUSH OK". Só percebi porque a linha de `hint:` do git vazou na saída. **Padrão correto:** `git push ...; rc=$?` — nunca canalizar o push, e nunca decidir sucesso por texto. Mesma família da lição do `merge` abaixo: **truncar saída de git é como perder o exit code.**
- **⚠️ LIÇÃO (2026-07-27) — NÃO cortar a saída do `git merge` com `tail`:** ao resolver conflitos, rodei `git merge … 2>&1 | tail -4`. O `tail` **escondeu a linha do `index.html`**, que também havia conflitado — resolvi só os arquivos que apareceram e **commitei com marcadores `<<<<<<<` dentro do `index.html`**. Quem pegou foi o `scripts/ci-validate.js` (`Unexpected token '<<'`), não eu. **Correção obrigatória:** depois de QUALQUER merge, auditar o repositório inteiro antes de commitar — `grep -rln "^<<<<<<< \|^>>>>>>> " --include="*.js" --include="*.html" --include="*.md"` — e só então `git add`. Nunca confiar na lista de conflitos vista por uma saída truncada.
- **⚠️ LIÇÃO (2026-07-27, aconteceu DUAS vezes na mesma sessão) — conferir a branch ANTES de commitar:** depois de sincronizar com `git checkout main`, esqueci de voltar para a branch de desenvolvimento e commitei em `main`. Não houve dano porque não empurrei (o push é sempre `-u origin <branch>`, que falhou/avisou), mas a recuperação custa tempo: `git branch -f <branch> <sha> && git reset --hard origin/main && git checkout <branch>`. **Rodar `git branch --show-current` como primeiro passo de todo commit.**
- **⚠️ LIÇÃO (2026-07-27) — `git reset --hard` com trabalho NÃO commitado apaga tudo:** ver a entrada do amarelo da landing em [[Decisões]]. Commitar ou `git stash` antes de sincronizar.
- **⚠️ O gatilho de `pull_request` do CI é intermitente** (visto nos PRs #606, #608, #617 e #619): o check `validate` simplesmente não inicia, e **commit vazio não resolve**. O que destravou nas duas vezes foi **resolver a divergência de histórico com a `main`** (merge de `origin/main` na branch) e empurrar. O gatilho de `push` em `main` **sempre** funciona. **Ausência de check NÃO é aprovação** — confirmar que a execução EXISTE para o SHA (via `actions_list`/`get_workflow_run`) antes de mergear.

- **⚠️ LIÇÃO (2026-06-25) — NÃO empilhar 2 pushes em `main` em segundos:** dois commits enviados em sequência rápida (`672c2a7` filtros, depois `7935cc2` remove ✓) geraram builds concorrentes na Vercel e a **promoção saiu fora de ordem** — o deploy do commit **mais antigo** virou produção ~24s depois, e o site ficou servindo a versão SEM a última correção (o usuário via o ✓ que eu já havia removido). **Correção:** subir **um commit por vez** e, em caso de mudanças rápidas, **agrupar num único commit** ou confirmar via `list_deployments` que o deploy de produção aponta para o SHA mais novo antes de avisar o usuário. Hotfix usado: um commit novo (bump do cache do `sw.js` v4→v5) força um deploy limpo (mais recente, sem corrida) **e** busta o cache do service worker dos clientes. **Webhook GitHub→Vercel pode atrasar ~2–3 min** — não confiar em "deve estar pronto"; checar o estado real.
- **Branch de desenvolvimento:** `claude/funny-brahmagupta-9n8yT`.
- Fluxo: commitar na branch → abrir PR → **squash merge** em `main` → deploy automático na Vercel.
- **⚠️ REGRA ATUAL (reforçada pelo usuário 2026-06-18) — PREVIEW + APROVAÇÃO ANTES DO DEPLOY:** toda mudança que afeta **o app** (frontend `index.html`, prompts, backend `api/`/`lib/`) segue: branch → PR → **CI verde** → **enviar o link do PREVIEW da Vercel no chat** → **esperar o "ok"/"pode dar deploy" do usuário** → só então squash-merge na `main`. **NÃO mergear/deployar sem a aprovação explícita.** Isso **supersede** a antiga "merge automático" abaixo. Exceção: **docs do `cofre/`** (`.md`) não fazem deploy no app → podem ser commitadas/mergeadas direto (mantendo o campo `atualizado:` em dia).
- ~~**Merge + deploy AUTOMÁTICOS — autorização permanente do usuário (2026-06-16):**~~ (SUPERSEDIDO pela regra acima) depois do **CI ficar verde**, fazer **squash-merge na `main` e deixar a Vercel deployar**. Travas mantidas: (1) CI `validate` verde; (2) PR que mexe em **pagamento/acesso** → revisar o diff antes. Para acompanhar o CI sem `sleep`, usar `mcp__github__pull_request_read` (`get_check_runs`/`get_status`).
- **Cofre SEMPRE atualizado (lição 2026-06-18):** ao mexer numa nota do `cofre/`, **atualizar o campo `atualizado:` do frontmatter** (não só o conteúdo) — senão o Obsidian do usuário mostra data velha. O usuário precisa dar `git pull` no vault local p/ ver o que foi mergeado (eu trabalho no container na nuvem).
- ⚠️ Após cada merge, a `main` avança e a branch local fica defasada. Antes do próximo PR, **rebasear** sobre a `main` nova para evitar conflito:
  - `git fetch origin main`
  - `git rebase --onto origin/main <último-commit-já-mergeado>` (ou `git reset --hard origin/main` e reaplicar só o que falta).
- O container é efêmero e às vezes re-clona em commit antigo — **sempre** `git fetch origin main && git reset --hard origin/main` antes de começar.
- Identidade de commit: `Claude <noreply@anthropic.com>`. (O commit de squash-merge na `main` é gerado pelo GitHub e aparece como `committer: GitHub <noreply@github.com>` / "Unverified" — isso é **normal**, não reescrever.)
- O fluxo PR → squash → deploy está **pré-autorizado** (ver acima): criar PR, esperar o CI, mergear e deployar sem pedir ok a cada vez.

## Linguagem do conteúdo — formal e técnica, sem marcas de texto gerado (2026-07-28)

Instrução direta do Rodolpho: *"Evite termos genéricos de IA. Deixe linguagem sempre formal e técnica."* Vale para **todo texto que o aluno lê** — artigos, capítulos, fichas, Questão do Dia, newsletter, Mural.

- **Preferir o termo técnico à construção derivada.** O gatilho foi a pergunta do SUSTAIN-6: *"é cardiovascularmente segura?"* → **"é segura do ponto de vista cardiovascular?"**. Advérbio em `-mente` fabricado a partir do adjetivo soa a tradução automática; a forma preposicionada é a que se escreve em português médico.
- **O que evitar,** por serem tiques reconhecíveis de texto gerado: metáfora de efeito ("divisor de águas", "cemitério de estudos negativos", "mergulhar em"), superlativo vago ("robusto", "impressiona", "extremamente"), autoelogio de método ("com honestidade", "vale dizer em voz alta"), e a fórmula "não é apenas X, é Y".
- **O que manter:** o texto continua **didático e direto** — frase curta, dado antes do adjetivo, e a limitação dita por extenso. Formal não quer dizer empolado nem impessoal; quer dizer **preciso**.
- **⚠️ Eu havia reposto uma frase que o professor tinha apagado de propósito.** No comparativo do SURPASS faltavam 82 caracteres — *"Vencer placebo é uma coisa; medir-se contra um fármaco já cardioprotetor é outra"* — e eu tratei como perda por clobber, porque era o modo de falha documentado. Ele respondeu: *"eu tirei porque isso é jargão de IA"*. Frase removida de novo, no banco e na fonte.
  - **A lição não é "não repor".** É que **a hipótese de clobber não é a única** quando some texto: uma edição deliberada do professor produz o mesmo rastro. Antes de repor, olhar **o que** sumiu — se for exatamente o tipo de frase que ele vem cortando, o mais provável é que tenha sido ele.
- **Varredura de 2026-07-28:** 16 ocorrências corrigidas em `trials.js`, `trials2.js`, `trials4.js` e `comparativos.js` — títulos de seção ("divisor de águas", "cemitério de estudos negativos", "O paradoxo que…", "A pergunta incômoda…"), autoelogio de método ("com honestidade", "vale dizer em voz alta") e ênfase vazia ("a magnitude impressiona" → a redução absoluta em pontos percentuais). Fonte local e banco em sincronia; 43/43 e 40/40 conferidos depois.
  - **Como reencontrar o resto,** quando aparecer mais: `grep -o -n "divisor de águas\|cemitério\|com honestidade\|em voz alta\|vale dizer\|incômoda\|paradoxo\|impressiona\|chave de tudo\|não pode ser omitida\|desconfortável" trials*.js info*.js comparativos.js`

## Conteúdo / marketing
- **Posts de feed do Instagram: SEMPRE com a logo do Endodirect (pedido do Rodolpho, 2026-06-29).** Usar a marca real **`logo.png.png`** (marca "ED" dourada, fundo transparente — fica bem sobre fundo escuro) no cabeçalho de toda arte. Gerar os slides com **HTML→PNG via Playwright** (1080×1350, identidade Endodirect: fundo navy `#0b1325`, azul `#3b6fd4`/`#5585e8`, verde `#34d399`, vermelho `#fb7185`; logo embutida em base64). **NÃO** reaproveitar como arte de carrossel as mesmas figuras que já estão no texto do post.
- **Textos de leitura SEMPRE justificados (pedido do Rodolpho, 2026-06-29):** newsletter (`lib/newsletter.js` — `text-align:justify` inline nos blocos `.art-body`) e cards do Mural (`.mural-text` → `text-align:justify;text-align-last:left`; o `text-align-last:left` evita esticar cabeçalhos/última linha de bullet com `white-space:pre-line`). Ao criar novos blocos de texto corrido, manter justificado.
- **Carrossel EDITÁVEL no Canva com o NOSSO design (técnica, 2026-06-29):** para levar o design exato (não a versão recriada pela IA) ao Canva editável: (1) montar o HTML dos slides anotando **cada slide com `data-document-role="page"`** (atributo opcional `data-label`), CSS inline e logo embutida em base64; (2) hospedar num **URL HTTPS público** — usei `raw.githubusercontent.com/<owner>/<repo>/<SHA>/arquivo.html` (por SHA = imutável e sem ambiguidade de branch com `/`); (3) `import-design-from-url` (Canva MCP) → vira design com **layout do HTML + texto editável**. ⚠️ Essa ferramenta **exige permissão no conector do Canva**: se voltar `MCP tool call requires approval`, pedir ao usuário para **reconectar o conector / dar permissão total**, depois repetir. Verificar a copy com `get-design-content` (não consigo renderizar a prévia — o proxy bloqueia o host de imagens do Canva). Alternativa rápida (sem permissão): `generate-design` (`instagram_post`) — mas a IA **condensa** a copy e usa layout próprio. Arquivo HTML de importação fica **só na branch** (nunca em `main`/produção); o URL por SHA continua válido mesmo após apagar o arquivo do tip.
- **⚠️ Onde o design importado vai parar + fidelidade (lição 2026-06-29):** o design criado por `import-design-from-url` **NÃO aparece sozinho na grade de "Projetos"** do Canva do usuário — ele entra na conta, mas só surge em **"Recentes"** depois de aberto pelo link, ou via **busca pelo nome exato**. Os links `/d/<code>` que `get-design`/`start-editing-transaction` retornam **são regenerados a cada chamada** (não são fixos/permanentes) → ao entregar, mandar **o link mais recente E o nome exato do design** pra o usuário poder buscar (o identificador estável é o `design_id`, ex.: `DAHN_PiV6vw`). **Fidelidade:** uma frase longa numa caixa de texto pode importar como **linha única que estoura a borda** — corrigir abrindo transação e inserindo `\n` via `find_and_replace_text` (ex.: quebrei a frase do "Atenção" em 2 linhas), conferir pelo thumbnail e `commit-editing-transaction`.

## Extrair a CURVA de um artigo (Kaplan-Meier) do PDF — técnica (2026-07-26)
Figura de NEJM/Lancet costuma ser **vetorial**: dá para recuperar os pontos reais da curva, em vez de projetar. Feito no SELECT (Figura 1A) e replicável nos outros trials.
1. `pdftotext -layout arquivo.pdf saida.txt` → achar em que página está a figura (procurar "Months since Randomization" / "No. at Risk") e conferir o **limite do eixo X** (o SELECT trunca em **48 meses**, que **não** é o seguimento médio de 39,8).
2. `pdftocairo -svg -f <pág> -l <pág> arquivo.pdf fig.svg`.
3. **O texto vira glifo** (`<use>`, sem `<text>`) → não dá para ler rótulo de eixo. **Calibrar pelas marcas de escala:** extrair os `<path>` de 2 pontos, aplicar o `transform="matrix(...)"` de cada um, separar os segmentos curtos horizontais (ticks do eixo Y) e verticais (eixo X) e agrupar por coluna/linha. Espaçamento regular = escala.
4. As curvas são os `<path>` longos (centenas de pontos), coloridos. **O `matrix` tem `d=-1`** (eixo Y invertido) e o traçado é desenhado **da direita para a esquerda** — a origem local é o **fim** da curva, então `ty` já é a coordenada de tela do valor final.
5. Converter cada ponto para (tempo, %) e reamostrar (usei passo de 1,5 mês, guardando o máximo acumulado — curva de degrau não desce).
6. **Validar com 3 âncoras independentes**, senão não confiar: (a) a curva começa em (0, 0); (b) o inset e o gráfico principal do mesmo painel têm de dar o mesmo valor final (deram 7,85/9,63 e 7,67/9,58); (c) o **HR implícito** `ln(1−p_int)/ln(1−p_ctl)` tem de bater com o publicado — deu **0,79 vs 0,80**.
7. **KM > proporção bruta.** No SELECT o texto diz 6,5% e 8,0% (eventos ÷ randomizados), mas a curva aos 48 meses dá **7,7% e 9,6%**. Não são incompatíveis — são coisas diferentes, e o card explica isso. Nunca rotular um como o outro.
- **Sem o PDF**, a ficha desenha uma curva **projetada** (risco constante, `λ = −ln(1−p)/T`) ancorada nas duas taxas publicadas, com aviso explícito de que não é a curva original. Aluno que vê curva assume que é o dado do estudo — o rótulo não é opcional.

## Referências clínicas (fontes de verdade médicas)
- **Toda produção de conteúdo médico** (flashcards, Mural/discussões, resumos de aula, questões, newsletter, posts) deve seguir as diretrizes em **`cofre/Diretrizes Clínicas/`** — os cortes, doses, alvos e critérios da diretriz citada mandam; citar a âncora (ex.: "ESE/ES 2024"). Em conflito com a memória, **a diretriz vence** (precisão > fluência, prioridade recorrente do Rodolpho).
- **Quando o Rodolpho mandar um PDF de diretriz e disser "incorpore":** ler o PDF inteiro (`Read` com `pages:`; ⚠️ se o PDF for grande/imagem ou o payload de imagens da sessão já estiver alto, o `Read` **deixa de renderizar** → extrair o texto com **`pdftotext`** [poppler, disponível no sandbox], ex.: `pdftotext -f 1 -l 3 arquivo.pdf -`), criar uma nota-resumo em `cofre/Diretrizes Clínicas/` (citação + DOI + escopo + recomendações + tabelas de doses/cortes/alvos), linkar no `README.md` da pasta e registrar em [[Decisões]]. **Acervo inicial (2026-06-30):** IA por glicocorticoides (ESE/ES 2024), Vitamina D (Endocrine Society 2024), Transgênero (Endocrine Society 2017) — e a biblioteca cresceu bastante depois (ver `cofre/Diretrizes Clínicas/README.md`).
- **⭐ Diagnóstico de DMG → diretriz da SBD (pedido do Rodolpho, 2026-06-30):** para **diabetes mellitus gestacional**, usar **preferencialmente os critérios da SBD** (em [[Diabetes na Gestação — Diagnóstico, Metas e Tratamento (SBD)]]), **não** ADA/IADPSG. Resumo: **1ª consulta** — jejum **≥92–125 = DMG**, **≥126 = DM overt**; **TOTG 75 g (24–28 sem)** — jejum **≥92** / 1 h **≥180** / 2 h **≥153** (≥1 valor). Metas: jejum <95, 1 h <140, 2 h <120 mg/dL; **insulina é 1ª linha**.

## Validação antes de commitar
- **Automatizado no CI (GitHub Actions `.github/workflows/ci.yml` → `scripts/ci-validate.js`):** roda em cada PR/push p/ `main` e faz as 3 checagens abaixo + **barra se `api/` passar de 12 funções** (limite Vercel que já travou prod). Localmente: `node scripts/ci-validate.js`.
- **Scripts inline do `index.html`:** extrair cada `<script>` sem `src` e rodar `new Function(corpo)` (deve dar 0 erros).
- **`lib/` e `api/`:** `node --check <arquivo>`.
- Calculadoras/IA: testar a lógica com valores de referência conhecidos quando possível.

### ⚠️ Verificador que sai com código 0 quando falha é pior que verificador nenhum
Achado em 2026-07-28: o `audit_resumos.js` imprimia **"DIVERGENTES: 1"** e ainda assim terminava com **exit 0**. Faltava o `process.exit`. Qualquer hook, CI ou `&&` na linha de comando olharia o código e daria tudo por certo. É a mesma família do `git push … | tail -1`, que na véspera imprimiu "PUSH OK" sobre um push rejeitado — **o código de saída da pipeline é o do `tail`**.
- **Regra:** todo verificador termina com `process.exit(falhas ? 1 : 0)`, e nunca se decide sucesso pelo **texto** da saída.
- **Como se prova que um verificador verifica:** sabotar um valor e exigir que ele acuse. Foi assim que se descobriu que o `check_info_db.js` passou meses imprimindo "16/16" sem nunca ter lido o 2º lote.

### O que os verificadores de artigo cobrem hoje (2026-07-28)
| Campo | Quem confere | Contra o quê |
|---|---|---|
| `resumo` | `audit_resumos.js` | md5 do banco vs fonte local (tolera normalização cosmética do editor) |
| `pts` | `audit_resumos.js` | md5 do banco vs fonte local — **entrou só em 28/07**; antes ninguém olhava |
| `info` (ficha) | `check_info_db.js` + `check_info_db.sql` | hash concat_ws espelhado nos dois lados, **incluindo `curva`** desde 28/07 |
| números da ficha | `check_numeros.js` | todo número da ficha existe na prosa — **coerência interna, não veracidade** |

- **O espelho SQL agora mora no repositório** (`scratchpad/artigos/check_info_db.sql`). Antes era reescrito de cabeça a cada lote, o que tornava a prova irreproduzível. **Ele se valida reproduzindo os hashes dos lotes anteriores byte a byte** — se um hash antigo mudar sem que o dado tenha mudado, o errado é o espelho.
- **Armadilha de número no espelho:** `->>` devolve a forma textual do jsonb, que preserva zero à direita (`8.0` continua `"8.0"`), enquanto `String(8.0)` em JS dá `"8"`. Os dois lados usam `::float8::text` / `String(Number(x))` para normalizar. Sem isso, um `2.0` digitado num INSERT diverge de um `2.0` escrito em JS **sem nenhuma diferença real**.

### Renderizar a ficha de um lote antes de gravar
`node scratchpad/artigos/render_fichas.js info4.js INFO4 trials4.js TODOS4 > fichas.html` monta a página usando **os renderizadores recortados do `index.html` de verdade** (não uma cópia — cópia diverge) e o CSS `.fx-*` do próprio arquivo. Depois, screenshot por ficha com o Chromium de `/opt/pw-browsers`. Foi assim que se decidiu tirar a `curva` do IMPROVE-IT: com 7 anos o eixo do tempo cai no passo de 6 e sairia com marcas só em 0 e 6.

## Sandbox / rede
- Egress restrito a uma allowlist. Confirmados acessíveis: `raw.githubusercontent.com`, `github.com`, `api.anthropic.com`. Bloqueados: `who.int`, `cdc.gov` (usar mirrors no GitHub).
- Não há ferramenta para gravar variáveis de ambiente na Vercel — isso é feito pelo usuário no painel.
- Verificação de produção (GET): `mcp web_fetch_vercel_url` em `https://www.endodirect.com.br/...` (não satisfaz auth de endpoints protegidos).

## GitHub
- Usar as ferramentas `mcp__github__*` (sem `gh` CLI). Escopo: `endodirectmaster-cmyk/endodirect`.
- Merge 401 transitório às vezes ocorre — apenas re-tentar `merge_pull_request`.

## Manutenção do cofre
Atualizar a nota relevante a cada mudança e registrar decisões em [[Decisões]]. Manter `atualizado:` no topo.
- **Hook SessionStart (2026-06-14, ampliado 2026-06-15):** `.claude/settings.json` injeta no início de toda sessão o lembrete de manter o cofre atualizado **e agora também o conteúdo de `cofre/Convenções de Trabalho.md` + `cofre/Decisões.md`** (via `jq --rawfile`, com fallback se faltar `jq`/arquivo), para começar já ciente de convenções, decisões e lições. Sincronizar o cofre faz parte de toda tarefa, não é opcional. (Há também um hook **Stop** que faz `git push origin HEAD`.)

## Lições operacionais (aprendidas em campo)
Hábitos que evitam retrabalho — ler antes de agir, especialmente em bugs e deploy:
- **Bug de estado/sync? Conferir o dado REAL antes de propor fix.** Usar `mcp execute_sql` no Supabase (`endodirect_global_state.payload`, `endodirect_app_state`, definições de RPC/trigger via `pg_get_functiondef`) para ver o estado de verdade. Lição cara (2026-06-15): empurrei o #312 (`applyStatePayload personalOnly`) como palpite para o "radar volta no F5" e estava errado; a causa real (seed `defaultMuralAvisos` com `at` relativo) só apareceu ao olhar o banco. Diagnóstico empírico > teoria; um fix especulativo custa um ciclo de deploy.
- **Depois de mergear, confirmar que o deploy de produção ficou READY.** Um PR mergeado pode estar **fora do ar**: usar `mcp list_deployments`/`get_deployment` (team `team_fufkQHFICWnQDbeIKmAKo6a8`, project `endodirect`) e checar `state:READY` no `target:production`. Lição (2026-06-15): #311/#312/#313 ficaram em **ERROR** (limite de 12 funções) e o último READY no ar era o #310 — o usuário via o bug "corrigido" persistir. Build pode concluir e ainda dar ERROR em "Deploying outputs" (limites de plano). Logs: `get_deployment_build_logs`.
- **Limites do plano Vercel (Hobby):** **12 serverless functions** em `api/` (projeto no teto) e **2 cron jobs**. Não criar função nova em `api/` sem remover outra; lógica reusável vai em `lib/` (módulo, não conta). Ver [[Decisões]] e [[Integrações]].

### Teto de 12 funções: por que NÃO subir de plano (2026-07-28)
Pergunta do Rodolpho: *"resolva pendência do vercel. qual a melhor recomendação?"*

**A contagem não é o gargalo, e já está resolvida por arquitetura.** A Vercel conta **arquivos** em `api/`, não rotas — então um handler que roteia por ação vale por muitos endpoints. O projeto já faz isso em dois lugares: `api/ai.js` roteia por `kind` (`support`, `support_list`, `support_reply`, `support_mine`, `openi`) e o `api/admin/refresh-radar.js` roteia por `action` (`discussao`, no #626). Endpoint novo entra assim; arquivo novo, não.

**Quando faltar espaço de verdade,** a folga mais barata é juntar os **dois crons num handler só** — dois agendamentos podem apontar para o mesmo caminho com query diferente (`?job=radar` / `?job=health`), o que devolve 1 slot sem tocar em `checkout/` nem no `newsletter/unsubscribe` (esse tem URL já enviada em e-mails; mudar o caminho quebra o List-Unsubscribe de quem já recebeu).
- **⚠️ Mas não fazer isso preventivamente:** é o cron do healthcheck que posta a **Questão do Dia** às 10h BRT. Ele falhou silenciosamente em 27/07. Operar nele para liberar um slot que ninguém está pedindo é risco sem retorno — fazer só quando o 13º endpoint existir.

**O Pro (US$ 20/mês) só se compra tempo, não contagem.** O Hobby limita a execução a **60s**; o `vercel.json` pede `maxDuration: 120` para o `api/ai.js` e **esse pedido não tem efeito no Hobby**. O candidato natural a estourar é a **discussão completa do Mural**, que manda o texto integral do artigo e pede ~12 KB de volta. **Como decidir sem chutar:** clicar o botão num artigo longo em produção; se der timeout, o Pro (300s) compra algo real — e antes disso ainda cabe cortar o texto enviado (só métodos, resultados, discussão e tabelas) e limitar o `max_tokens`.
- **Aviso "Unverified" do hook Stop é benigno:** ele acusa o commit de **squash-merge do próprio GitHub** (committer `noreply@github.com`) no tip da `main`. NÃO reescrever (é histórico já mergeado). Meus commits usam `Claude <noreply@anthropic.com>`.
- **Validar sempre antes de commitar** (scripts inline + `node --check`), conforme a seção acima — barato e evita deploy quebrado.
- **⚠️ O check `validate` pode simplesmente NÃO APARECER no PR — ausência não é aprovação.** No **#606 (2026-07-25)** o `pull_request` do `ci.yml` não gerou run nenhum: o `get_status` do PR trazia só o **Vercel**, e a lista de runs da branch parava no commit anterior. "Sem check vermelho" leu como verde e quase passou batido. **Conferir que o run existe**, não só que nada falhou — `actions_list` (`list_workflow_runs`, filtrando pela branch) e comparar o `head_sha` com o tip do PR. Rede de segurança que funcionou: rodar **`node scripts/ci-validate.js` localmente** (é exatamente o que o workflow executa) antes de mergear; o `push:` em `main` também dispara o mesmo workflow **depois** do merge (rodou e passou em `779d6575`) — mas aí já está em produção.
- **⚠️ LIÇÃO (2026-07-25) — INSERT grande de conteúdo: nunca confiar na transcrição; conferir por hash.** Ao inserir os 16 artigos no `payload.diretrizes`, colei o SQL em lotes de 4 e **truncei um item no meio** (FLOW 2024): ele perdeu o array `flashcards` **e** o flag `rascunho:true`. O JSON truncado continuou **sintaticamente válido** (cortou campos antes da chave de fechamento), então o Postgres aceitou sem erro — e o artigo incompleto ficou visível aos assinantes por alguns segundos até eu corrigir. Regras que ficam:
  1. **Lotes de no máximo 2 itens** por `execute_sql` (~9 KB). Truncagem escala com o tamanho do bloco.
  2. **Conferir por md5, não por olho.** Depois de inserir, comparar banco × fonte local campo a campo: `md5(v->>'resumo')`, `md5(string_agg)` dos `pts`/`flashcards`, `md5(concat_ws)` dos metadados — e diferenciar por script, não visualmente. Contagem de itens não pega nada: o item truncado **está lá**.
  3. **Se o lote carrega um flag de segurança** (`rascunho`, `privado`), reaplicá-lo em um `update` separado depois do insert — idempotente e imune à truncagem: `set payload = jsonb_set(..., jsonb_agg(case when v->>'tipo'='artigo' then v || '{"rascunho":true}'::jsonb else v end order by ord))`. Flag correto não pode depender de o insert ter saído inteiro.
