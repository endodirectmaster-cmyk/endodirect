---
tags: [cofre, pendencias]
atualizado: 2026-08-09
---

# Pendências

## 📅 AUDITORIA DE ATUALIDADE DO ACERVO — resultado, e o que só o professor resolve (2026-08-09)

Resposta à instrução dele (*"mantenha o cuidado de sempre manter o arquivo mais
atualizado — eu tinha uma diretriz de dislipidemia de 2017 e a plataforma já
estava com a de 2025"*). Cruzei os **35 extratos** contra os **245 itens da fila**
por três testes, do mais frouxo ao mais estrito:

1. **palavra-chave + área** → 6 "achados", **todos falso positivo** (sobreposição
   frouxa: *"Type 1 diabetes Seminar"* não é versão nova de *PTDM*);
2. **mesma pasta do Drive + ano maior** → 12 "achados", **também falso positivo**:
   as pastas são amplas (`Plataforma ED/Diabetes`), então artigo mais novo na
   mesma pasta **não** é versão mais nova do mesmo documento;
3. **mesma SOCIEDADE reeditando + ano maior** → 1 "achado", **falso positivo**
   (Endocrine Society publicando sobre *outro* assunto).

**✅ Conclusão: nenhum extrato da base tem edição mais nova esperando na fila.**
Os dois casos que pareciam supersessão real já estavam cobertos — a diretriz
**brasileira de obesidade de 2025** e a **conjunta ESE/Endocrine Society de 2024**
de insuficiência adrenal **já estão extraídas**.

⚠️ **Lição de método: "mesma pasta" e "palavra em comum" NÃO detectam
supersessão.** A organização do Drive é por assunto, não por linhagem de
documento. Só o par *mesma sociedade + mesmo assunto* diria, e isso exige olhar
caso a caso.

### ⛔ O QUE NÃO DÁ PARA CONSERTAR EXTRAINDO — precisa do professor

**A base responde CETOACIDOSE com material de 2020**, e o **consenso ADA/EASD de
2024 sobre crises hiperglicêmicas NÃO EXISTE no Drive** (busquei a fila inteira
por `hyperglycemic crisis`, `ketoacidosis`, `hiperosmolar`: o mais novo é de
**2020**). Cetoacidose é emergência e é dos assuntos mais consultados —
**este é o item de maior risco da lista de defasagem, e só o professor resolve,
mandando o documento.**

### Os 17 extratos com 5+ anos (para ele decidir o que vale substituir)

`2016` PTDM · `2017` osteogênese imperfeita · `2018` hirsutismo (Endocrine
Society), hiperglicemia por glicocorticoide · `2019` fármacos e tireoide,
hipofosfatasia, craniofaringioma · `2020` dumping, cirurgia bariátrica,
craniofaringioma (manejo), **cetoacidose euglicêmica**, **cetoacidose diabética**,
NTIS, exercício com CGM · `2021` insuficiência adrenal, crise tireotóxica,
farmacoterapia da obesidade.

## 🎯 O BLOCO "INDUZIDO POR X" VENCE A PERGUNTA QUE NÃO CITA X — METADE RESOLVIDA (2026-08-09)

✅ **A metade da SOBRA está consertada**, e o conserto é de **desempate**, não de
peso: com pontos IGUAIS, o bloco que exige uma condição ausente da pergunta vai
para trás. A estreiteza é o ponto — mexer na pontuação reordenaria blocos de
notas diferentes, que é como se entrega conteúdo da área certa e do assunto
errado. Só condição com sinônimo FECHADO entra no mapa (`CONDICAO_EXIGIDA`); hoje
só `glicocorticoide`, com as 13 formas que o médico escreve (prednisona,
dexametasona, corticoterapia…).

Junto veio o conserto de área que faltava: **`fratura` sozinha não era chave** —
só os compostos —, então *"paciente em prednisona há 4 meses, previno fratura?"*
era decidida por `prednisona` e ia para **Adrenal**. Medido: `fratura` é 329 de
352 em Osteometabolismo (93%). Os dois mecanismos compõem certo: com corticoide
na pergunta chega o GIOP; sem, chega a osteoporose geral.

❌ **A metade da FALTA continua aberta:** *"biotina falseia o TSH?"* e *"lítio e
hipotireoidismo"* recebem em primeiro o bloco do hipertireoidismo no ADULTO, e
não o de **fármaco e tireoide**, que é o dono da interferência de ensaio e da
disfunção medicamentosa. Ali não há empate — o bloco do adulto ganha por pontos,
então o desempate não alcança. E `induzida por MEDICAMENTO` ficou de fora do mapa
de propósito: "medicamento" não tem sinônimo fechado, e exigir a palavra
derrubaria justamente a pergunta que **nomeia o fármaco**.

O que provavelmente resolve: reconhecer que a pergunta nomeia UM FÁRMACO (lista
fechada, como a do `confere-farmaco-na-citacao.js`) e dar bônus ao bloco que
declara `induzid* por medicamento`. Precisa de medição contra as 265 linhas de
roteamento antes de entrar.

**O caso que a expõe, com os números:** *"fratura de quadril após queda da
própria altura"* — paciente que não toma corticoide nenhum — recebe em primeiro
o bloco do **GIOP**. Os dois empatam em **18 pontos**, com exatamente os mesmos
seis termos (`fratura`, `quadril`, `após`, `queda`, `própria`, `altura`) no tema,
e o desempate é a ordem do array. O empate é legítimo: a diretriz do ACR
**discute mesmo** fratura por fragilidade e quadril. Não é tema inflado.

**Por que isso é uma classe e não um caso:** a base tem pelo menos quatro blocos
"induzido por X" — GIOP, hiperglicemia induzida por glicocorticoide, diabetes
pós-transplante e disfunção tireoidiana induzida por medicamento. E o defeito
corta **para os dois lados**, medido na mesma varredura:

- **sobra**: GIOP vence a pergunta que não menciona corticoide;
- **falta**: *"biotina falseia o TSH?"* e *"lítio e hipotireoidismo"* recebem em
  primeiro o bloco do hipertireoidismo no ADULTO, e não o de **fármaco e
  tireoide**, que é o dono da interferência de ensaio e da disfunção
  medicamentosa.

**O mecanismo que falta:** um bloco cuja aplicabilidade é CONDICIONAL deveria
ganhar pontos quando a pergunta cita a condição e perdê-los quando não cita. É a
mesma família do conserto da negação (o `deepFor` passou a saber que "sem
sintomas" não pontua o bloco sintomático): pontuação por contagem de palavra não
enxerga nem negação nem pré-requisito.

⚠️ **Não fazer às pressas.** Derivar a condição do tema (`induzid[oa] por X`) é
elegante e arriscado — precisa de sinônimo (`glicocorticoide` = `prednisona` =
`corticoide` = `dexametasona`) e de medição contra as 254 linhas de roteamento
antes de entrar.

**Consertado hoje, do que era só tema faltando** (esses não precisavam de
mecanismo novo, só das palavras certas na superfície de busca): osteogênese
imperfeita por **esclera azulada** (12 ocorrências no texto, zero no tema — a
pergunta patognomônica recebia o GIOP) e **fratura de quadril** no bloco da
osteoporose (30 ocorrências no texto, zero no tema).

## ⏳ TIREOIDE A 98% DO TETO — e ela cresce SEM artigo novo (2026-08-09)

Números para a decisão do professor, todos medidos:

| | chars | % do teto de 400k |
|---|---|---|
| **Tireoide hoje** | **391.745** | **98%** — folga de 8.255 |
| se dividir: *Tireoide na gestação* (ATA 2026, 4 blocos) | 203.264 | 51% |
| se dividir: *Tireoide* (5 blocos restantes) | 188.481 | 47% |

⚠️ **O que mudou de patamar: a área cresce sem eu extrair nada.** As duas
auditorias adversariais de hoje somaram **8.080 caracteres** de ressalva de
população aos fatos de tireoide — e a folga é de **8.255**. **Uma auditoria a
mais do mesmo tamanho esgota**, e aí o `test-teto-diretrizes.js` reprova.

Auditar é acrescentar texto de segurança, e texto de segurança ocupa teto. Não é
motivo para auditar menos; é motivo para dividir.

⚠️ **E não dá para subir o teto de novo:** 400k já é o `TETO_MAXIMO`.

**O que acontece no instante em que ela cruzar — medido em 09/08 pela sonda
`scratchpad/probe/tireoide-borda.js`, que roda o caminho real (`deepFor`):**

- Hoje os **9 blocos chegam inteiros** em todas as perguntas que testei.
- **O primeiro bloco some com +10.000 caracteres** na área (folga real: 8.237).
  O menor bloco tem 6.782 caracteres; os outros oito vão de 16.769 a 68.373.
  Nenhum artigo real acrescenta menos que isso — **a próxima extração de tireoide
  despeja um bloco inteiro, em silêncio**.
- **A ordem de despejo é sã**, e isso é a boa notícia: cai sempre o bloco *menos*
  relevante para a pergunta (numa pergunta de crise tireotóxica cai o NTIS; numa
  de T3 baixo na UTI cai a crise). Não é o caso da hiponatremia, em que o bloco
  despejado **contradizia** a pergunta — aqui ele só é dispensável.

Ou seja: o risco de hoje é **perder profundidade**, não receber resposta errada.
Isso rebaixa a urgência de "agora" para "antes do próximo artigo de tireoide" —
mas não muda a decisão, porque a folga já não cabe nem mais uma auditoria.

⚠️ **A sonda me ensinou a desconfiar da própria chave.** A primeira versão dela
identificava o bloco cortando o tema no primeiro `" — "`, e os temas **têm
travessão dentro** (o sufixo de seções). Quatro blocos da gestação viraram um só
e ela relatou *"5 de 9 entregues"* quando os 9 chegavam. Chave passou a ser o
índice do bloco. É a mesma armadilha da âncora ambígua que já me pegou dentro do
meu próprio teste de completude.

⚠️ **A divisão NÃO é só roteamento — é mudança de produto**, e por isso é
decisão dele: a lista de áreas está acoplada ao `index.html` em `FC_CATS` (12
subespecialidades), submapas de tema, cores, calculadoras por área e filtros do
mural. Uma 13ª subespecialidade muda o que o aluno vê.

**Correção de uma medição minha:** cheguei a calcular a ATA de gestação como 74%
da área. Estava errado — meu filtro casava `gestação` no tema do artigo do
hipertireoidismo no ADULTO, que discute gravidez. O valor certo é **52%**,
consistente com os 53% que eu tinha medido antes.

## ⛔ A FILA DA ROTA B MUDOU DE ORDEM POR CAUSA DO TETO (2026-08-09)

A tabela mais abaixo põe **Tireoide em 3º**. **Não extraia mais nada de Tireoide
antes de dividir a área** — a medida diz por quê:

| área | ocupa | folga até 400k | cabe |
|---|---|---|---|
| **Tireoide** | 383.665 | **16.335** | **ZERO artigo** |
| Obesidade | 350.391 | 49.609 | ~1 |
| Diabetes | 284.265 | 115.735 | ~2 |
| **Osteometabolismo** | 51.374 | 348.626 | **~7** |
| Adrenal | 87.488 | 312.512 | ~6 |

O teto profundo foi ao **máximo** (400k) em 09/08 e Tireoide já ocupa **96%**.
O próximo extrato de tireoide **reprova o `test-teto-diretrizes.js`** — a guarda
existe justamente para isso. Auditoria de Tireoide pode seguir (não acrescenta
conteúdo); **extração, não**.

**Próxima área para extrair: Osteometabolismo (era a 4ª).** Duas razões que
apontam para o mesmo lugar: é quem tem **mais folga** (~7 artigos) e é onde
moram **três dos doze assuntos sem nenhum bloco** — osteoporose, hipercalcemia/
hiperparatireoidismo e hipoparatireoidismo. Hoje a área só tem hipofosfatasia e
osteogênese imperfeita, que são **doenças raras**: a mesma distorção que fez
Diabetes ser a primeira da fila (130 fatos, 109 de pós-transplante e 21 de MODY).

## ✅ DIABETES FECHADO — a primeira área da Rota B (2026-08-08)

**7 de 7 extratos auditados**, 849 fatos. A área saiu de 130 fatos (109 de
diabetes pós-transplante + 21 de MODY, as duas coisas mais raras do assunto)
para cobertura real: DM1, cetoacidose clássica e euglicêmica, hiperglicemia por
corticoide, pré-diabetes, exercício no DM1.

**O que as sete auditorias mediram:** taxa de erro semântica entre **2,6% e
10,8%**, e quase nada era erro de LEITURA — nenhuma inversão, nenhum número
trocado, nenhum deslocamento de coluna. O defeito dominante é **contexto perdido
na atomização**: o fato responde certo ao parágrafo e errado à pergunta.

Os três que mudavam conduta de verdade:
- regra da NPH com a citação truncada **antes do teto** — prescrevia dose linear,
  quase o dobro de insulina em 75 mg de equivalente de prednisona;
- 20 fatos de uma tabela que era a seção **pediátrica** do ADA sem declarar isso,
  incluindo meta pressórica mais estrita que a do adulto;
- nos 76 fatos da cetoacidose euglicêmica faltava a **única** instrução que a
  distingue: suspender o iSGLT2 depois que a cetoacidose instalou.

**Próxima: Obesidade** (29 pendentes no acervo, 14 de alta ancoragem). Começou
com a Diretriz Brasileira 2025 (162 fatos, em auditoria) + Lancet 2021
farmacoterapia e JAMA 2020 cirurgia bariátrica (em extração).

## 🗺️ ROTA B — fechar uma subespecialidade de cada vez (2026-08-08)

O professor escolheu a Rota B: **extrair E auditar até fechar a área**, em vez de
extrair tudo e auditar depois. Motivo: **todo extrato auditado até hoje tinha
erro** (5–20% de taxa semântica, e em cada rodada pelo menos um que mudava
conduta). Extrair 230 artigos sem auditar produz uma base grande com taxa de erro
desconhecida — rápido, e pior que a de hoje.

**Uma área só está FECHADA quando todos os extratos dela passaram por auditoria
adversarial.** Fila zerada não é área fechada.

### Ordem, e por quê

O critério não é o tamanho da fila, é o **buraco entre importância clínica e
cobertura**:

| # | área | na base | pendentes / alta ancoragem |
|---|---|---|---|
| 1 | **Diabetes** ← em curso | 130 fatos, **todos sobre coisas raras** | 23 / 9 |
| 2 | Obesidade | 86 (só o consenso de dumping) | 30 / 15 |
| 3 | Tireoide | 218 | 23 / 13 |
| 4 | Osteometabolismo | 282 | 32 / 22 |
| 5 | Adrenal | 286 | 34 / 19 |
| 6 | Neuroendocrino (a mais coberta) | 781 | 56 / 29 |

Lípides (583) e Endocrinopatias (638) já estão densas. Esporte tem 3 pendentes e
fecha junto de qualquer leva.

⚠️ **Pediátrica, Masculina e Transgeneridade têm ZERO artigos no acervo do Drive.**
Não é ordem de prioridade — o material não existe lá. Hoje a IA gera essas três só
com o núcleo, e só o professor pode resolver, mandando artigos.

### Por que Diabetes é a primeira

É a área mais usada da endocrinologia e a base tem **130 fatos, sendo 109 de
diabetes pós-transplante e 21 de MODY** — as duas coisas mais raras que existem no
assunto. Nada de DM2, cetoacidose, insulinização ou complicações. É o maior
descompasso entre o que o aluno pergunta e o que a base sabe.

### Ritual por artigo, sem pular etapa

1. agente extrai em `scratchpad/acervo/trabalho/<fileId>/` (pasta isolada)
2. `verifica-extracao.js --dir <trabalho>` → 0 reprovados
3. `cobertura-extracao.js --dir <trabalho>`
4. **eu confiro à mão toda acusação grave contra o texto-fonte** — auditor erra, e
   já errou (a acusação contra a metade 1 da dislipidemia era falso alarme)
5. mover o extrato para `scratchpad/acervo/extratos/`
6. `protege-citacoes.js` — texto da citação vira offset+hash, senão o CI reprova
7. `confere-ressalvas.js`
8. `monta-base-profunda.js`
9. **teste de CAMINHO** — a pergunta real do médico chega ao bloco?
10. auditoria adversarial do extrato
11. correção do núcleo se a fonte o contrariar → `index.html` + bump do `sw.js` +
    harness A/B em Chromium
12. `ci-validate` + commit + PR + merge

### Regra que só aparece com muitos agentes

**Só UM agente pode editar `lib/clinical-deep.js` por vez.** Os demais apenas
RELATAM os termos que faltam em `TERMOS`; eu aplico. Dois agentes no mesmo arquivo
perdem trabalho um do outro sem aviso.

## ⚠️ Vitrine (`alunopro`) sem identidade no servidor — decisão do professor (2026-08-02)
- [ ] **Dar conta REAL no Supabase à vitrine.** Hoje `alunopro` é conta **local do bundle** (`var USERS` no `index.html`), com a senha publicada no código e **sem sessão no Supabase**. Consequência estrutural: **nenhum gate de servidor consegue distinguir a vitrine de um visitante qualquer** — qualquer regra que ela passe, um `curl` também passa. Foi isso que fez o gate de 01/08 devolver vazio e deixar a aba Resumos em branco por um dia (revertido; ver [[Auditoria 2026-08-01]]).
  - **O que fazer:** criar o usuário `alunopro@endodirect.com.br` no Supabase, conceder o acesso de plano e fazer o cliente **logar de fato**. Aí a vitrine pode usar o **`member_resumos` comum** — a função especial `endodirect_showcase_resumos()` deixa de existir, e some junto a superfície aberta que a auditoria apontou. Acesso passa a ser revogável, auditável e com limite de taxa.
  - **⚠️ Mexe no fluxo de login**, que é compartilhado com as contas de admin — exige teste em navegador real antes de mergear, pela regra de [[Convenções de Trabalho]].
  - **Não aumenta exposição:** a senha da vitrine já está pública no bundle. O que muda é que o conteúdo deixa de ser alcançável por quem apenas chama a RPC, sem nem saber que a demo existe.
  - **Alternativa recusada:** token no parâmetro da RPC. Restaura a vitrine e barra o raspador anônimo, mas quem lê o bundle continua conseguindo tudo — é segurança por obscuridade, e não vale gravar como solução.

## Discussão do Mural: texto integral fora do PMC (2026-07-31)
- [x] ~~**⚠️ Tabela de artigo CC BY-NC(-ND) é reproduzida mesmo assim.**~~ **FEITO (2026-08-03).** O marcador `[[TABELA:n]]` só é oferecido quando a licença permite; o conteúdo continua indo à IA (número é fato), que escreve os valores em prosa. **Medido antes: 37 das 38 discussões são CC BY e a única NC-ND inseriu ZERO tabelas** — nada a remediar. ⚠️ Ao fechar isto descobri que **`parseLicense` estava invertido**: `/^CC (BY|0)/` casava o prefixo de *todas* as variantes restritivas (NC, ND, SA) como redistribuíveis, e CC0 saía como restrito. Ver [[Decisões]]. Texto original abaixo, para contexto:
  - ~~ `parseLicense` (lib/fulltext.js) já calcula `redistribuivel` — verdadeiro só em CC BY e CC0 — mas esse campo é usado **só para decidir sobre FIGURAS**. As tabelas do JATS entram na discussão **independentemente da licença**. A plataforma é paga (uso comercial) e `ND` proíbe derivado, então num artigo CC BY-NC-ND vindo do PMC a tabela colada hoje é reprodução que a licença não permite. **Correção pequena:** passar `ft.licenca.redistribuivel` para o prompt e, quando falso, não anexar `[[TABELA:n]]` — a discussão descreve os números em prosa, como foi feito à mão no artigo de hipercortisolismo. **Vale medir antes:** quantas das discussões já gravadas vieram de artigo não-CC BY (`meta.licenca` está gravado em todas).
- [ ] **Artigo aberto na EDITORA mas nunca depositado no PMC continua sem discussão.** A repescagem de 31/07 (`lib/pmc-repescagem.js`) resolveu o **atraso** do depósito — o PMC que chega dias depois da entrada do artigo agora é reperguntado todo dia. O que ela **não** resolve: revista que publica sob CC BY e não vai ao PMC. `lib/fulltext.js` só sabe ler **JATS do PMC**, então nesses casos não há texto integral e o card fica só com o resumo — que é o limite correto do recurso, não um defeito.
  - **Se o professor voltar a apontar artigos abertos sem discussão**, o caminho é uma **segunda fonte de texto integral**, não afrouxar a seleção: Europe PMC (`/europepmc/webservices/rest/{source}/{id}/fullTextXML`, JATS quase igual — o parser atual aproveitaria) e/ou Unpaywall/OpenAlex para descobrir o PDF/HTML aberto na editora. ⚠️ Gerar discussão a partir de **abstract** está descartado desde 28/07: é literalmente o erro dos artigos de Obesidade, em que afirmações verdadeiras para a classe não eram o que o ensaio mediu.
  - **Saída manual, já usada em 31/07 e que funciona:** o professor manda o PDF, eu extraio o texto e gravo a discussão direto em `endodirect_mural_discussoes` (`insert … on conflict do update`). Essa tabela o cliente só LÊ, então escrever nela por fora é seguro — diferente do `payload`. Feito para `pubmed:42533758`.
  - **Primeiro medir, depois construir:** quantos dos itens não-abertos do mural o Europe PMC alcança? Só a produção responde — deste ambiente o proxy devolve 403 para `eutils`/`www.ncbi.nlm.nih.gov`/`ebi.ac.uk`.

## Retenção e ativação (2026-07-28, a partir do material de EdTech)
**Contexto que orienta tudo abaixo:** 7 semanas de operação, **28 pagantes** (24 anuais à vista + 4 mensais) + 1 cortesia. Como quase todo mundo pagou **anual adiantado**, o churn só apareceria em **junho/2027** — quem parar de usar em agosto não gera sinal nenhum. Por isso o indicador que importa agora é **uso**, não receita. **Não montar dashboard de MRR/LTV/CAC neste estágio:** com n=28 e sem 12 meses de histórico, o LTV teria barra de erro maior que ele mesmo.

- [x] **"Qual seu objetivo?" no onboarding — FEITO (2026-07-28).** Obrigatório, com opções + "Outro". Destrava a segmentação por persona.
- [x] **Card "sem acesso há 14+ dias" no Analytics — FEITO (2026-07-31).** `admSumidosCardHTML()`, primeiro card do Analytics (antes do de conversão, porque é o único que gera ação no mesmo dia). Mostra nome, e-mail, plano e há quantos dias sumiu; 30+ dias em vermelho.
  - **⚠️ O campo de data é o que decide o recurso.** `auth.users.last_sign_in_at` só muda em sign-in NOVO, e a sessão do Supabase aqui é persistente: quem entra todo dia pode ter o último sign-in de dois meses atrás. Lista montada sobre ele apontaria os alunos **ATIVOS** — e o professor manda mensagem para esses nomes. A RPC `endodirect_admin_students` (migração `admin_students_ultimo_uso_por_last_seen`) passou a devolver `ultimo_uso` = maior entre `endodirect_devices.last_seen` (carimbado pelo app a cada uso) e `last_sign_in_at` (reserva para quem é anterior à tabela de devices, de 11/06).
  - **Só pagante:** cortesia (`provider='manual'`) não paga e degustação sumir é o esperado. Medido em 31/07: **32 pagantes, 14 parados há 14+ dias, 3 há 30+**.
  - Teste `scripts/test-analytics-sumidos.js` no CI; cobertura provada trocando o campo de data e deixando cortesia entrar — os dois reprovam.
- [ ] **Momento Aha: definir e medir.** Hipótese: **responder a Questão do Dia em 3 dias diferentes na 1ª semana**. Registro já existe (`payload.qotd`). Medir: quem fez isso ainda está ativo em 30/60 dias?
- [ ] **Onboarding de 7 dias** — só DEPOIS dos dois itens acima (decisão do Rodolpho em 28/07).
- [ ] **"Como conheceu?" no cadastro** — adiado a pedido (28/07). É o CAC por canal, e também não dá para reconstruir depois.
- [x] ~~**⚠️ Higiene de dados:**~~ **RESOLVIDO** — conferido em 03/08: **0 linhas** com `status='active'` e `expires_at` no passado (corrigido na auditoria de 01/08). A regra de sempre conferir `expires_at > now()` continua valendo. Contexto original: `endodirect_acessos` tinha linha com `status='active'` e `expires_at` **no passado** (`aluno@endodirect.com.br`, expirou 08/07). Qualquer consulta que filtre só por `status='active'` **superconta**. Conferir sempre `expires_at > now()` — foi o que explicou a diferença entre o meu "31" e os 29 do painel.


## Artigos / trials nos Resumos (2026-07-25)
- [x] **⚠️ OS 43 ARTIGOS ESTÃO LIBERADOS PARA OS ALUNOS (2026-07-31, "Libera os rascunhos").** Ressalva levantada por mim antes — boa parte dos números **vem da memória do modelo**, "coerente internamente, **não conferida**" — e reafirmada pelo professor duas vezes. Chave `rascunho` removida dos 43; `privado:true` mantido. **Conferido nas duas entregas:** assinante recebe **43 artigos** (149 itens privados no total); degustação recebe **4** — um por subespecialidade (Diabetes, Lípides, Obesidade, Osteometabolismo), pelo `distinct on (sub, tipo)` da RPC.
  - **Desfazer é um comando:** snapshot em `endodirect_state_backup` **id=7**.
  - **A revisão clínica/editorial continua pendente** — liberar não conferiu nada. Os itens abaixo seguem abertos de propósito; o que mudou é que o aluno já está lendo enquanto a revisão não acontece.
  - **⚠️ MECANISMO DO CLOBBER, agora entendido e não só observado.** Nas duas primeiras tentativas (16h41 e 16h42) a gravação foi desfeita em segundos. A causa está em `mergeConcurrent` (index.html): ele parte do array **da memória do navegador** e só ACRESCENTA do servidor as chaves que não existem nem no baseline nem na memória. Para um item que existe **nos dois lados**, a versão da memória **sempre vence** — então qualquer edição minha feita por SQL num item já existente de `diretrizes` é perdida no próximo save da aba do professor. Não é corrida de tempo: é o algoritmo.
  - **Por que a terceira tentativa (18h10) segurou:** a aba dele não salvou depois. **Regra prática:** mutação de `payload` por fora do app só dura se o professor der **F5 antes de salvar qualquer coisa**. Quando não dá para garantir isso, use o botão **👁 Liberar todos os rascunhos**, que passa pelo `persistDiretrizes()` e não tem com quem correr.
- [x] **AGUARDANDO REVISÃO DO RODOLPHO — 16 artigos piloto (9 Diabetes + 7 Obesidade) gravados como RASCUNHO.** Estão em `endodirect_global_state.payload.diretrizes` com `tipo:'artigo'`, `privado:true`, **`rascunho:true`** → aparecem **só no painel do professor**, em Resumos › Artigos. Nenhum aluno (assinante ou degustação) os vê — filtro no servidor, ver [[Dados e Supabase]]. Fonte de verdade do conteúdo: `scratchpad/artigos/trials.js` (conferido por md5, 16/16 idênticos ao banco). Revisão em página: `scratchpad/artigos/build_revisao.js` → artifact "Artigos (trials) — revisão antes de publicar".
  - **Ação do professor:** conferir os números e clicar **👁 Liberar para os alunos** em cada artigo aprovado (o botão só remove o `rascunho`; o item já está com `privado:true` e cai na aba Resumos › Artigos).
  - Diabetes: UKPDS 33, EMPA-REG, LEADER, SUSTAIN-6, DECLARE-TIMI 58, CREDENCE, SURPASS-2, FLOW, SOUL.
  - Obesidade: STEP-1, SURMOUNT-1, SELECT, STEP-HFpEF, SURMOUNT-OSA, SURMOUNT-5, ESSENCE.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] **REVISAR o 2º lote — 11 artigos novos (2026-07-27); total de 27 em rascunho.** 8 trials (DCCT, ACCORD, REWIND, STEP-2, STEP-4, STEP-9, SURMOUNT-2, SURMOUNT-4) + 3 comparativos em tabela (Programa STEP, SURMOUNT, SURPASS). **Os números vêm da memória do modelo** — o checador só garante coerência interna, não veracidade. Prioridade de conferência: as **faixas do SURPASS** (o próprio artigo avisa para conferir na publicação) e o **SURPASS-CVOT**, cujos valores exatos ficaram em branco de propósito.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Conferir o 3º lote contra os PDFs.**~~ **FEITO (2026-07-28)** — o professor mandou os 4. SCALE e XENDOS bateram inteiros; SCOUT e COR-I tiveram **a segurança corrigida** (ver [[Decisões]]). Continua valendo a revisão clínica dele, mas os números agora vêm da fonte.
- [x] **REVISAR o 3º lote — 4 artigos; total de 32 em rascunho.** Os ensaios pivotais dos antiobesidade não incretínicos + o da liraglutida: **SCOUT** (sibutramina), **XENDOS** (orlistate), **COR-I** (naltrexona-bupropiona) e **SCALE Obesidade e Pré-diabetes** (liraglutida 3,0 mg). **Os números já foram conferidos contra os PDFs em 28/07** — os HR do SCOUT (1,28 e 1,36) e as proporções do COR-I (48/39/16), que eram os de menor garantia, **bateram**. Falta a revisão **clínica/editorial** do professor: se o recorte, o tom e as ênfases são os que ele quer ensinar.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] **REVISAR o SURMOUNT-MAINTAIN (2026-07-27).** Único artigo cujos números **NÃO** vêm da memória do modelo: foram lidos do PDF que o Rodolpho mandou (Lancet 2026;407:2305-18). Ainda assim vale conferir, porque a transcrição é minha.
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Confirmar "SURMOUNT MAINTAIN":** entrou como **SURMOUNT-4**.~~ **RESOLVIDO (2026-07-27) — eu é que estava errado.** Eu havia afirmado que o estudo "não existe com esse nome"; ele existe (Lancet 2026;407:2305-18, NCT06047548) e o professor mandou o PDF. Entrou como artigo próprio. **Lição:** sem conector de busca autorizado, o que eu podia dizer era "não encontrei", nunca "não existe".
- [ ] **Ligar os conectores PubMed e Clinical Trials** — hoje aparecem na sessão como não autorizados. Com eles, dá para conferir os números dos artigos contra a fonte em vez de depender só de revisão manual.
- [ ] **Curvas reais dos outros 5** (EMPA-REG, LEADER, SUSTAIN-6, DECLARE, SOUL): hoje são **projetadas**. O professor já mandou os PDFs de **LEADER, SUSTAIN-6, DECLARE e SOUL**; falta o do EMPA-REG. Estado: **LEADER extraído e validado** (3 âncoras, incluindo HR implícito 0,874 vs 0,87 publicado), **ainda não aplicado**; DECLARE e SOUL têm a mesma estrutura de figura e são diretos; o **SUSTAIN-6 desenha a curva como centenas de segmentos soltos** e precisa da abordagem de nuvem agrupada (`scratchpad/cvot/extrai2.py`). Técnica em [[Convenções de Trabalho]].
- [x] **Liberar em lote — FEITO (2026-07-31).** Botão **👁 Liberar todos os rascunhos (N)** no topo da grade de temas dos Resumos, por subespecialidade. Só aparece quando há rascunho; confirma listando os 6 primeiros nomes; **uma gravação só, fora do laço** (payload de 8,5 MB — uma escrita por item seriam N uploads inteiros); o recorte é exatamente o que a grade mostra (mesma sub, mesmo modo, mesmo tipo), senão o professor publicaria sem saber o quê. Teste `scripts/test-liberar-lote.js` no CI, cobertura provada quebrando o recorte e movendo a gravação para dentro do laço.
- [x] **🎨 Artigos como INFOGRÁFICO — FEITO (2026-07-25).** Ficha visual gerada por código a partir do campo `info` (fonte: `scratchpad/artigos/info.js`); as 16 estão gravadas e conferidas por md5 contra a fonte local. Decisões tomadas: o texto corrido fica **recolhido** abaixo da ficha (as limitações não se perdem) e o **forest plot entra em todos os que têm HR** (10 dos 16). Ver [[Decisões]].
- [x] **Artigos NÃO levam flashcards nem mapas mentais (decisão do Rodolpho, 2026-07-25):** "os artigos sendo em infográfico não precisam de mapas mentais e flashcards". A ficha visual já é o material de revisão. Os **64 flashcards** escritos para o lote piloto ficam gravados no JSON (reversível, custo zero) mas **deixam de ser renderizados** quando `tipo==='artigo'` — ver `dirCardHTML` (~l.8604). Capítulos seguem com os seus normalmente.
- [x] ~~**Mapas mentais dos artigos:** ficaram fora do lote piloto de propósito.~~ **DECIDIDO (2026-07-25): artigos não levam mapas mentais nem flashcards** — ver o item acima.
- [x] **REVISAR o 4º lote — 11 artigos de Lípides e Osteometabolismo (2026-07-28); total de 43 em rascunho.** **Lípides:** 4S, JUPITER, IMPROVE-IT, FOURIER, ODYSSEY OUTCOMES, REDUCE-IT. **Osteometabolismo:** FIT, HORIZON-PFT, FREEDOM, Teriparatida—Neer, ARCH. **Os números vêm da memória do modelo** — pela lição dos PDFs de 28/07, isso é "coerente internamente, **não conferido**".
  - **Onde eu apostaria que está o erro, se houver:** as **proporções absolutas de fratura** (FIT 1,1% vs 2,2%; FREEDOM 0,7% vs 1,2%; ARCH 2,0% vs 3,2%) e os **ganhos de DMO**, que são os números que menos se fixam. As reduções relativas (70%, 68%, 48%) e os HR de Lípides (0,70, 0,56, 0,936, 0,85, 0,75) são os de maior garantia.
  - **Mande os PDFs quando puder** — 11 de uma vez é muito; os que mais rendem conferir primeiro são **REDUCE-IT** (a controvérsia do óleo mineral está escrita como argumento, não como fato) e **ARCH** (o excesso cardiovascular é o que muda conduta).
  - **✅ REVISADO — o professor confirmou em 2026-08-03** ("Revisados"), ao autorizar que a campanha de recuperação anunciasse os 43 artigos. A ressalva que estas linhas carregavam — números vindos da memória do modelo, coerentes internamente mas não conferidos — **foi resolvida pela revisão dele**, que é quem tem autoridade clínica para isso. Mantidas aqui para registro do que a ressalva era.
- [x] ~~**Varrer o acervo atrás de marcas de texto gerado.**~~ **FEITO (2026-07-28)** — 16 ocorrências corrigidas em 8 artigos, fonte e banco em sincronia. A regra e o comando de varredura ficaram em [[Convenções de Trabalho]]. Se ainda houver construção que soe artificial, é só apontar a frase.
- [x] ~~**Frase do comparativo SURPASS: corte deliberado ou clobber?**~~ **RESPONDIDO (2026-07-28) — foi corte deliberado.** *"eu tirei porque isso é jargão de IA"*. Eu havia reposto por engano, tratando como perda por clobber; removida de novo, no banco e na fonte. Lição registrada em [[Convenções de Trabalho]].
- [ ] **Demais subespecialidades:** faltam **Tireoide, Adrenal, Neuroendocrinologia, Endo Feminina, Endo Masculina, Endo Pediátrica, Transgeneridade, Endo do Esporte, Endocrinopatias e Endocrinologia Básica**.
  - **Onde há ensaio pivotal de verdade:** Tireoide (DATA, tratamento do hipotireoidismo subclínico no idoso — TRUST; SELENIUM/GO-MTX na oftalmopatia), Adrenal (PATHWAY-2 no hiperaldo; FIRSTMAPPP no feocromocitoma maligno), Neuroendocrinologia (PROMPT/pasireotida na acromegalia; CLARITY no Cushing), Endo Feminina (WHI e KEEPS na terapia hormonal; PPCOS-II no SOP).
  - **⚠️ Onde a literatura é fina, e eu vou dizer isso em vez de inventar ensaio:** Transgeneridade, Endo do Esporte, Endo Pediátrica e Endocrinologia Básica praticamente não têm ECR pivotal — ali o formato honesto é **coorte de referência ou consenso**, com a ficha dizendo que não é ensaio randomizado, ou simplesmente não ter artigo.

## Provas de residência (2026-07-21)
- [x] **29 USP-FMUSP/FUVEST 2023 — SUBIDAS** com `revisar_gabarito:true` (não havia gabarito oficial). **AÇÃO PENDENTE: revisar/confirmar o gabarito dessas 29.**
- [x] **Pasta "Ano adicional" — SUBIDA:** 90 questões USP R3 Endócrino (2023/24/25) com gabarito oficial + comentário.
- [ ] **USP-SP 2024 #76 (US ovário) e #104 (painel CAD):** não recuperáveis (PDF 20 MB > teto 10 MB do download Drive/MCP; hosts Google bloqueados no proxy). Precisa PDF menor ou figuras avulsas.
- [x] **Resumos vazios p/ aluno — CORRIGIDO:** era o `member_content` não enviar diretrizes privadas; agora via RPC dedicado `endodirect_member_resumos` (+ demo/degustação via `hydratePublicContent`). Ver [[Decisões]]/[[Dados e Supabase]]. **Nota:** a conta `alunopro` é DEMO (só conteúdo público) — não serve p/ testar experiência de assinante.


## Varredura completa (2026-06-15) — lançamento
**INCIDENTE (2026-06-15) — perda de aulas por sobrescrita concorrente do estado global:**
- O Eduardo subiu ~37 aulas (`endoteem`); ficaram só 6 (`endo_essencial`) no `endodirect_global_state`. **Não recuperável pelo servidor** (backup `endodirect_state_backup` só tem snapshots de 10/06). Causa: o save do admin reescreve o payload INTEIRO a partir do snapshot EM MEMÓRIA; com dois admins editando, o save de um (com cópia velha) apaga as adições do outro. Mesmo mecanismo afeta o podcast manual que "não subiu". Recuperação possível: navegador do Eduardo (localStorage `adm_cursos`) **se não recarregou**; senão, re-importar os links.
- [x] **Concorrência do estado global — PROTEGIDA (2026-06-15, #305):** `saveRemoteState` (admin) agora guarda `lastGlobalUpdatedAt` (lido no hydrate/último save) e, ao gravar, relê o `updated_at` do servidor; se mudou (outro admin/cron gravou no meio), **mescla** as coleções aditivas (`adm_cursos`, `podcasts`, `provas`, `mm_shared`, `diretrizes`, `diretrizes_temas`, `curso_mods_extra`, `adm_estudantes`) por chave de conteúdo via `unionBy()` em vez de sobrescrever — adições de dois admins não se perdem (avisa e pede recarregar). Trade-off conhecido: um item deletado em paralelo pode reaparecer (raro; só na janela de edição concorrente). Não recupera as 37 já perdidas (re-importar).


**Corrigido (#299):**
- [x] **[CRÍTICO] `findUserByEmail` provisionava conta ERRADA além de 50 usuários** (`api/webhooks/pagarme.js`, `api/checkout/order.js`, `api/checkout/subscribe.js`): o `?email=` do GoTrue admin não filtra de forma confiável e o `|| list[0]` pegava um usuário arbitrário. Agora **pagina** e casa o e-mail exato; nunca cai em `list[0]`.
- [x] **[CRÍTICO] Re-render apagava painéis movidos** (`renderAdmSec`): Consultório (`#panel-presc`) e editor visual de Mapas (`#mm-live`) eram destruídos por `innerHTML` num re-render da MESMA seção (gatilho real: hydrate automático de estado remoto), quebrando inclusive o painel do aluno. Agora `restorePrescPanel()`/`restoreMMLive()` rodam **sempre antes** do `innerHTML`.
- [x] **[MÉDIO] XSS em `<img src>`**: `q.img`/`q.expImg`/previews de upload e `cur*` eram injetados sem `esc()` (vetor se o banco vier de import/IA). Todos escapados. Links do Mural (`a.link`) agora passam por `safeHttpUrl()` (bloqueia `javascript:`/`data:`).

**Sinalizado para depois (não-bloqueante; risco/decisão/teste):**
- [ ] **CONFIRMAR (25/06) que os e-mails de degustação saíram (o usuário pediu p/ avisar):** investigação 24/06 — **infra OK** (cron 10:30 UTC chama `sendTrialEmails`; newsletter/IG marcaram "enviado" em 24/06 → o cron de fato roda), mas o **ledger `payload.trial_emails` estava VAZIO** = nada enviado até então (até 24/06 ninguém estava na janela de envio). RPC `endodirect_trial_email_targets()` retornou **8 elegíveis** (1 warn + 7 winback). Devem sair na rodada de **25/06 10:30 UTC (07:30 BRT)**. **Ação:** após o cron, conferir o ledger (deve listar os 8 com warn/winback) e avisar o usuário.
- [x] **Questão do Dia — curadoria DISTRIBUÍDA por professor — ✅ CONSTRUÍDO e DEPLOYADO (#434, 2026-06-24):** (e-mails recebidos; `endodirectmaster` tratado como Rodolpho — confirmar.) a aba **"Questão do Dia"** passa a aparecer **só para o Rodolpho** (`rodolphomend@gmail.com`, gate por e-mail); cada questão gerada ganha botão **"📤 Distribuir"** → vai para uma nova aba **"Pendências"** no painel, **roteada pela subespecialidade** ao professor responsável (badge de contagem, estilo o do Suporte); cada professor revisa/edita e **aprova** → a questão **vira a Questão do Dia ao vivo** (entra na fila/calendário). **Mapa confirmado pelo usuário** (cobre as 12 subs, sem sobreposição): **Rafael** = Adrenal, Endo do Esporte, Endo Feminina, Endo Masculina; **Eduardo** = Diabetes, Tireoide, **Osteometabolismo** (= "Metabolismo Ósseo"), Transgeneridade; **Bruno** = Endo Pediátrica; **Rodolpho** = Obesidade, Lípides, Neuroendocrinologia. **Armazenar no estado GLOBAL** (`endodirect_global_state`, p/ os outros admins verem) → entra nas chaves de **merge** (como `ig_stories`). **BLOQUEIO:** faltam os **e-mails do Rafael, Eduardo e Bruno** (chave do roteamento) + confirmar se já têm login de admin (`endodirect_admins`); se não, adicioná-los. Construir como **PR novo** (decisão: deployar o #432 primeiro — feito). Ver [[Instagram Stories (Questão do Dia)]].
- [ ] **Stories "Questão do Dia" — evoluções do MVP (2026-06-23):** (1) **publicação automática** via **Instagram Graph API** (a conta @endodirect já é Business) — hoje o professor posta manualmente; o quiz/poll sticker segue manual mesmo com API. (2) **Texto justificado** na arte (hoje alinhado à esquerda). (3) **Imagem do caso** embutida no PNG (hoje sairia por **taint** cross-origin → por ora adicionar no editor do IG; alternativa: upload same-origin/dataURI). (4) **Prints reais** nos promos de domingo (commitar em `figuras/stories/` — desktop→moldura de monitor, iPhone→moldura de iPhone; evitar dado de paciente, repo público). Ver [[Instagram Stories (Questão do Dia)]].
- [ ] **Memed LME (alto custo) não aparece — aguardando suporte da Memed (2026-06-23):** ao emitir LME de **insulina glargina** **direto na plataforma do Memed** (não só no EndoDireto), a opção **"Retirar no SUS / Preencher formulário LME"** não aparece → problema do **lado da Memed** (provável: módulo de alto custo não habilitado na conta OU glargina sem etiqueta LME no catálogo deles). **Ação do usuário:** acionar o suporte da Memed (confirmar módulo LME habilitado + glargina com etiqueta LME; anexar print). **Plano B em standby** (expor o `prescPrintLME` próprio ao lado do Memed; ~5 min p/ reativar — não está na branch, que foi resetada à `main`). Ver [[Decisões]].
- [ ] **Memed — chaves de PRODUÇÃO instaladas mas retornam 401 (2026-06-18, BLOQUEADO no lado da Memed):** o usuário recebeu por e-mail (Washington Jesus/Memed) as novas **chaves de produção** (api-key e secret-key, 60 chars cada) e as instalou na Vercel (`MEMED_API_KEY`/`MEMED_SECRET`, Production). `MEMED_ALLOW` trocado de `memed.teste@…` p/ `rodolphomend@gmail.com` (conta do Rodolpho p/ teste; CRM 186238/SP digitados na tela). Teste real → **HTTP 401 "Código de acesso inválido"** no `POST /v1/sinapse-prescricao/usuarios`. **Diagnóstico (tudo OK do nosso lado):** `GET /api/memed/token` confirma `configured:true` + `allow:["rodolphomend@gmail.com"]`; `MEMED_API_BASE` **não existe** → usa o padrão de produção `https://integrations.api.memed.com.br` (confirmado como a base correta na doc da Memed); testei inclusive **invertendo** api-key/secret-key → continua 401. Logo, o par de chaves **não está sendo aceito pela Memed** (ativação/pareamento pendente do lado deles). **Ação:** usuário vai **responder o Washington** pedindo p/ confirmar que as chaves de produção estão ativas/pareadas. Diagnóstico via Vercel runtime logs (`[memed-resp] status=401`, `[memed-dbg]`). Janela do e-mail: **7 dias úteis** p/ instalar antes de desativarem. **Quando resolver:** fazer **fase 2** = remover `MEMED_ALLOW` (libera a todos os médicos com CRM/UF) + redeploy.
- [x] **Newsletter repetindo conteúdo (2026-06-15, #303):** vinha igual ao dia anterior porque pegava sempre o `top3` do pool estável. Agora `newsletter_recent` (14d) + `pickFresh()` priorizam não-enviados; ranking refinado (revisão>metanálise>original; NEJM>Lancet>JCEM>outros); JCEM deixou de sair como "Endocrinology" (`journalMatches`/`jnorm` no radar).
- [x] ~~**Newsletter envio duplicado (concorrência)**~~ **FEITO (2026-08-03):** claim-first via RPC `endodirect_newsletter_claim` (`update … where newsletter_sent <> dia`, atômico por linha), com devolução da reserva quando **zero** destinatários receberam. RPC ausente → segue pela trava antiga. Ver [[Decisões]]. (`dateBR`/`todayISO` seguem em UTC — não mexido.)
- [ ] **Webhook pagar.me**: (a) `charge.refunded`/`subscription.canceled` sem scope revoga TODOS os acessos do e-mail; (b) renovação sem `subscriptionId` cairia em `avulso` 365d. Validar o **payload de renovação no sandbox** (1ª renovação só em ~30d) antes de ajustar.
- [x] **[CRÍTICO] Vaga de fundador via PIX/boleto não era contada (2026-06-16):** o webhook (`api/webhooks/pagarme.js`) liberava o Gold mas **não gravava `notes`**, então nunca marcava `:fundador`. Como `lib/founder.js` conta as vagas por `notes ilike '*:fundador*'`, só compras no **cartão** (via `order.js`) entravam no limite — com PIX/boleto (meio dominante no BR) a oferta poderia **vender muito além das 100 vagas** e o auto-desativar/contador de vagas ficariam errados. **Fix:** o webhook lê `metadata.coupon` (que `order.js` já envia) e, quando é `FUNDADOR` no `plano:gold`, grava `notes='gold:anual:fundador'` (mesmo formato do cartão). Validado por teste de lógica. Reaproveita `FOUNDER_COUPON`/`FOUNDER_PLAN` de `lib/founder.js`.
- [ ] **Cupom de fundador não-atômico**: pode passar de 100 vagas sob concorrência (`lib/founder.js`). (Distinto do item acima: aqui é a janela de corrida entre contar e gravar; a contagem em si já inclui PIX/boleto.)
- [x] **Checkout — checagem de origem (2026-06-15, #301):** `api/checkout/order.js` e `subscribe.js` agora validam Origin/Referer pelo hostname (igual `api/ai.js`) — bloqueia abuso externo dos endpoints que criam cobranças LIVE. Header ausente passa (clientes não-browser). Não exige sessão (não quebra checkout de quem não está logado).
- [ ] **Passthrough de erro upstream** (`api/ai.js`, checkout) e **log de comprimento de chave Memed** (`api/memed/token.js`): limpar pós-homologação.
- [x] ~~**Advisors Supabase (performance)**~~ **FEITO (2026-08-03):** 15 WARN → **0**. RLS initplan em 13 policies (`auth.uid()`/`auth.jwt()` envoltos em `(select …)`), 2 policies duplicadas (as de escrita eram `FOR ALL` e o ramo SELECT era redundante — separadas em INSERT/UPDATE/DELETE) e a FK sem índice. **Verificado com fotografia antes/depois:** 24 comparações de leitura por papel, 0 divergências, + 6 casos de escrita. Ver [[Decisões]].
  - **Sobram 4 INFO, de propósito:** 3 tabelas de backup sem PK (são fotografias; apagar backup é decisão sua) e a estratégia de conexões do Auth (ajuste de painel, ligado ao tamanho da instância).
  - ⚠️ **Ficou uma lição cara:** `revoke execute … from anon, authenticated` **não revoga nada** — função nasce com EXECUTE para **PUBLIC**, e os papéis herdam dele. Tem de ser `from public`. Eu abri um buraco assim nas RPCs da newsletter no mesmo dia; fechado e conferido por `has_function_privilege`. Os WARN de `SECURITY DEFINER` chamáveis por anon/authenticated são **por design** (checagem interna). `endodirect_state_backup` RLS sem policy = trancado (só service_role) — OK.
- [ ] **OSCE lazy = NÃO REAPLICAR (quebra navegador real — 2 apagões) ⚠️:** tentei reaplicar a geração passo-a-passo (lazy) duas vezes (#337/#338 e de novo no #345). **Ambas derrubaram TODA a interatividade da plataforma em navegador real** (nenhum botão, não loga) — apagão. Revertido nos #342 e #346 (`index.html` ao estado estável `b9936dc` = #334 + sidebar). **Crítico:** `ci-validate` (parse) E o teste de sandbox `vm` (rodar todos os `<script>` inline) **PASSARAM as duas vezes** e mesmo assim quebrou em produção → meu ferramental aqui **não detecta** o que derruba o navegador real desse `index.html` gigante. Mecanismo exato desconhecido (as mudanças do lazy são só defs de função/`var` no body, que não deveriam lançar no load). **O OSCE fica na forma de geração única** (estável; casos ricos podem dar lentidão/504, mas não derruba a plataforma). **NUNCA reaplicar o lazy** sem testar o **deploy de PREVIEW da Vercel do PR em navegador real ANTES de mergear** — esse é o único processo seguro p/ mudança de JS no frontend (mudança simples de CSS pode ir direto). `api/ai.js maxDuration=60` e `vercel.json functions` ficaram (não afetam UI).
- [ ] **Código morto** (`index.html`): `persistAdm` definido 2×; handlers do antigo editor de mapas (textarea) sem uso. Limpeza cosmética.

## Lado do usuário (fora do código)
- [ ] **Publicar Diretrizes:** flipar `DIRETRIZES_PUBLICADO=true` no `index.html` quando a curadoria estiver pronta. Hoje os alunos veem "Em breve" (e a **janela de Novidades** no login anuncia Diretrizes como **"EM BREVE"** — #430). Ver [[Arquitetura]].
- [ ] **Revisão clínica dos flashcards:** ~180 flashcards da biblioteca de membro foram gerados por IA — médico deve revisar antes/depois do lançamento.
- [ ] **Conta de teste `memed.teste@endodirect.com.br`:** ainda conta como aluno no Analytics (necessária p/ a homologação Memed via `MEMED_ALLOW`). Remover quando a Memed sair de homologação.
- [x] **Limpeza de contas de teste no Analytics (2026-06-14):** removidas 5 contas (`dudukamura@`, `rgmedicaltda@`, `gabysfernandes@`, `eduardo.teste@`, `teste@`) de `auth.users` + `endodirect_app_state`/`acessos`/`devices`/`assinaturas` (nenhuma tinha assinatura paga). "Alunos cadastrados" caiu de 11 → 6. A contagem vem da RPC `endodirect_admin_overview` (`role='aluno'` em `endodirect_app_state`).
- [x] **Webhook pagar.me — 401 RESOLVIDO (2026-06-11).** Diagnóstico (logs `[whdbg]`): o usuário batia, mas a senha enviada pelo webhook tinha um caractere "fantasma" (15 chars vs 14/12 no Vercel) e **as edições no painel do pagar.me não persistiam** — ele seguia mandando a senha original. **Fix em duas frentes:** (1) **código** — `verifyAuth` agora normaliza Usuário/Senha para **só ASCII visível** (`/[^!-~]/g`) antes de comparar com `timingSafeEqual` (#192→#194); fica imune a espaço/zero-width/BOM colado no painel; (2) **operação** — webhook **recriado do zero** com Usuário `endodirect` / Senha `endohook2026` (digitada na criação) e `PAGARME_WEBHOOK_BASIC_PASS=endohook2026` no Vercel. Validado ponta a ponta: **PIX real** liberou `plano:standard` (active) e o webhook respondeu **200**. Diagnóstico removido após confirmar. Ver [[Pagamentos pagar.me]].
- [x] **PIX × duração do acesso — OK (2026-06-11).** O PIX da conta de teste cobrou **R$540,00** (= preço anual Standard, 12× R$45) e liberou **1 ano** (`tipo: avulso`, `ENDODIRECT_AVULSO_DIAS=365`). Duração e preço **batem** — PIX é sempre pagamento único anual (não há PIX recorrente). Sem ajuste necessário.
- [x] **Checkout PIX/boleto libera sozinho (2026-06-11).** Após gerar a cobrança, o front faz polling do estado remoto a cada 5s (`ckStartAutoVerify`) e entra na plataforma automaticamente assim que o webhook provisiona — sem precisar clicar em "Já paguei — verificar" (o botão segue como fallback). Para ao liberar, ao fechar o checkout, ou após ~5 min.
- [x] **pagar.me — validação LIVE (2026-06-11):** compra real (cartão, Gold mensal) liberou acesso ✅. Bug achado: tela R$99 × cobrança R$70 (defaults divergentes) — **corrigido** (#185). Premium removido (#186). Estorno/revogação dependem do webhook (acima); acesso de teste da Gabriella revogado manualmente.
- [x] **"Site fora do ar" no Wi-Fi — falso alarme, era cache de DNS local (2026-06-12).** Sintoma: abria no 5G mas não no Wi-Fi de casa. Diagnóstico: site **sempre esteve no ar** (DNS apex `216.198.79.1` ✅ e www `64.29.17.1` ✅ resolvendo globalmente; HTTPS 200 servindo o `index.html` completo; deploy #234 READY). O Wi-Fi/roteador segurava em **cache o IP antigo** da Vercel (`76.76.21.21`), trocado dias antes no Registro.br. **Resolução:** `ipconfig /flushdns` no PC limpou o cache e o site abriu. Não afeta usuários novos (cache só em quem já tinha acessado o IP velho); expira sozinho pelo TTL. Registros A do apex e CNAME do www **não foram afetados** pela edição de DNS do e-mail.
- [x] **Domínio apex (`endodirect.com.br`):** resolvido em 2026-06-11. O registro A do apex no Registro.br foi trocado do IP antigo da Vercel (`76.76.21.21`) para o novo (`216.198.79.1`); a Vercel passou a "Valid Configuration" e o apex faz **307 → `www`**. (Auth já estava blindado pelo `www` no código, #183.)
- [x] **Supabase (URL Configuration) — OK (2026-06-11).** Site URL = `https://www.endodirect.com.br`; Redirect URLs com curinga: `https://www.endodirect.com.br/**` e `https://endodirect.com.br/**`. Antes estavam sem o `/**`, então `redirect_to` com caminho/parâmetro (ex.: `/?reset=1`) não casava e caía no fallback da Site URL (perdendo o `?reset=1`). Corrigido.
- [ ] **Memed — código PRONTO, trava no lado da Memed em homologação (401 → 503) (2026-06-12).** Integração 100% implementada e *gated* (backend `api/memed/token.js` + front no Consultório; payload `board{}`, `Content-Type: application/json`, `data_nascimento` DD/MM/YYYY, evento `prescricaoImpressa`). Chaves de **homologação** (fixas da doc) setadas na Vercel e **confirmadas corretas** (`api=iJGi..mYCm`, `sec=Xe8M..5nmL`, 56/56). A Memed respondeu primeiro **HTTP 401 "Código de acesso inválido"** e depois **HTTP 503** (Service Unavailable) — **ambos lado Memed** (ativação do parceiro / ambiente instável), confirmado pelos logs `[memed-resp]`; não é o código, as chaves nem o formato da requisição. O front agora trata **5xx** com mensagem amigável ("Memed temporariamente indisponível. Tente novamente em instantes.", #236). Travada por `MEMED_ALLOW=memed.teste@endodirect.com.br` (só a conta de teste vê a Memed; médicos reais ficam no receituário próprio) — **não bloqueia o lançamento**. **Pendente do usuário:** abrir chamado no suporte da Memed (citar o 401/503 + timestamp do log); preencher o formulário de Parceiros (WEBPKI = **Não**; URL `https://www.endodirect.com.br`; login de teste **memed.teste@** já com Gold). Quando resolver: trocar p/ chaves de produção + remover `MEMED_ALLOW`, e **remover os logs de diagnóstico** (`[memed-dbg]`/`[memed-resp]`). Ver [[Integrações]].
  - **ATUALIZAÇÃO 2026-06-17 — chaves de PRODUÇÃO também dão 401 (ativação do parceiro ainda pendente):** o usuário gerou as chaves reais no `landing-pages.memed.com.br/partners-key-generator`, trocou na Vercel e redeployou. Teste real (conta `memed.teste@`, Consultório, 17/06 14:09 UTC) → Memed devolveu de novo **HTTP 401 "Código de acesso inválido"**. **Nosso lado 100% confirmado pelos logs:** `keyLen=64 secLen=64` (= as chaves reais do print, 64 chars cada, sem espaço; homologação era 56/55 → confirma que as NOVAS entraram), `base=https://integrations.api.memed.com.br` (produção), redeploy `dpl_8o59…` de 13:31 UTC pegou as vars, payload JSON:API no formato correto. Ou seja, **o 401 é autenticação/ativação do lado da Memed** — não o nosso código/chaves/base. Gerado um **esboço de e-mail** p/ o suporte da Memed (perguntar: as chaves do gerador são de produção? conta de parceiro ativada p/ produção? base URL correta?; citar 401 + timestamp 14:09 UTC). **MEMED_ALLOW segue só `memed.teste@` — NÃO remover até a Memed confirmar a ativação** (senão todos os médicos Gold batem no mesmo 401). Obs.: a senha do `memed.teste@` foi redefinida via Supabase (último acesso real era 12/06 = meu teste; Memed não usava no dia a dia) — o valor NÃO fica no repo, está no chat/Supabase.
- [x] **E-mail de suporte — `contato@endodirect.com.br` (2026-06-11).** Exibido na plataforma (Suporte do aluno + admin) e no rodapé da landing, como `mailto:` clicável (#232). Caixa criada e ativa no **Zoho Mail** (plano free); DNS no Registro.br: MX (`mx/mx2/mx3.zoho.com`), SPF (`include:zoho.com`) e TXT de verificação adicionados. **DKIM** (`zmail._domainkey`) adicionado e Zoho verificou todos os registros (MX+SPF+DKIM). Falta apenas um teste de envio/recebimento. Os registros do Resend (`send.`) e Supabase (`auth.`) seguem intactos.
- [x] **Supabase — proteção de senha vazada (HaveIBeenPwned) — ATIVADA (2026-06-12).** Ligada em **Authentication → Sign In / Providers → Email → "Prevent use of leaked passwords"** (o botão "Configure in email provider" da aba *Attack Protection* leva até lá). Captcha (hCaptcha) já estava ativo. Scan de segurança de 2026-06-11 também **corrigiu** o RLS exposto de `endodirect_state_backup` (✅, RLS habilitado); funções `SECURITY DEFINER` chamáveis por anon/usuário são **por design** (têm checagem interna via `auth.uid()`). Bucket público `endodirect-assets`: listagem restrita aos admins (ver Concluídas).
- [x] **Newsletter:** Eduardo e Bruno **confirmaram o recebimento** (2026-06-11). O fix do `globalServerKeys` (#166) resolveu a perda do `newsletter_extra`. Ver [[Newsletter e Radar]].
- [x] **Supabase (e-mails de auth):** Confirm email **ON** + **Custom SMTP via Resend** (remetente `Endodirect <nao-responda@endodirect.com.br>`) + **templates branded PT** (Confirm sign up / Reset password). Validado por teste em 2026-06-11: e-mail chega do domínio próprio, com visual do Endodirect. Fontes em `supabase/email-templates/`. Ver [[Integrações]].

## App nativo (iOS/Android)
- [x] **PWA instalável (2026-06-14):** `manifest.webmanifest` + `sw.js` (network-first) + `icons/`. Site vira "instalável" na tela inicial (Android/desktop; iOS com limitações). Ver [[Arquitetura]].
- [ ] **App nas lojas via Capacitor (pendente):** empacotar a SPA em iOS/Android. Depende do usuário: contas **Apple Developer** (US$99/ano) e **Google Play** (US$25); **build/assinatura** exige Mac+Xcode ou CI (EAS/Codemagic/Appflow) — não dá para gerar o `.ipa`/`.aab` no sandbox. **Bloqueio de produto:** regra de **IAP da Apple** (até 30%) para conteúdo digital — definir estratégia (assinatura feita no site, app só consome) antes de submeter. Eu consigo: scaffolding do Capacitor, ícones/splash, deep links e a documentação de build/submissão.

## Lado do código / curadoria
- [ ] Revisar **Grupo 2** — 29 gabaritos ambíguos (`gabaritos-suspeitos.md`). Ver [[Banco de Questões]].
- [x] **Decisões de acesso (varredura 2026-06-12) — implementadas:**
  - **[FEITO #243] Chat IA + geração por IA agora exigem `plano`** (`chat:'plano'` em `PANEL_SCOPE`; `blockIfDegustacao()` passou a checar `hasScope('plano')`). Fecha a brecha do comprador de curso avulso. Degustação (trial 3x) e plano inalterados; 0 usuários "só curso" hoje.
  - **[FEITO #242] Webhook pagar.me fail-closed** (`auth!==true` rejeita; em prod não muda nada).
  - **[PARCIAL #242] `/api/ai`** ganhou **checagem de origem** (barra abuso direto). **Auth por sessão Supabase: SEGURADA** — é mudança no caminho crítico de IA (risco de derrubar IA p/ todos se o token falhar) + quebra contas demo locais (sem sessão). Recomendado fazer pós-lançamento com teste. Reforço alternativo: `NCBI_API_KEY`/rate-limit.
- [ ] **Remover diagnósticos temporários:** `[radar-dbg]` (lib/radar.js) — **REMOVIDO em 2026-06-12 (#247)**, Mural confirmado funcionando. Faltam `[memed-dbg]`/`[memed-resp]` (api/memed/token.js) — manter até a Memed resolver o 401/503.
- [ ] **NCBI API key (opcional, reforço do radar):** gerar em ncbi.nlm.nih.gov → Account settings → API Key Management; setar `NCBI_API_KEY` no Vercel (Settings → Environment Variables, Production) + redeploy. O código já lê a env (troca o pacing do PubMed de 380ms p/ 130ms). Sem ela funciona com o pacing atual.

## Concluídas recentes
- [x] **Varredura completa: segurança, persistência e UX (2026-06-13, #274).** Segunda varredura minuciosa de ponta a ponta após o pacote de Diretrizes. Reforços de `/api/*`: `api/ai.js` valida origem **por hostname** (bloqueia `endodirect.com.br.evil.com`), allowlist de `mediaType` e `prompt` até 200k; `api/podcast-feed.js` com guarda anti-SSRF (resolve DNS e bloqueia IPs privados, cap de 5MB); logs de checkout/Memed sem PII. Auth/sessão, navegação, sync de estado e webhooks (fail-closed) verificados limpos. Corridas conhecidas (cupom de fundador, radar) anotadas como deferidas (decisão de negócio / risco de migração).
- [x] **Mural/radar RESOLVIDO de ponta a ponta (2026-06-12, #242).** Sintoma: Mural não atualizava + "aparece e some". Foram **4 causas** empilhadas, todas corrigidas: (1) save do admin sobrescrevia `radar_avisos` → **gatilho no banco** `endodirect_global_preserve_server_keys` (só service_role escreve); (2) **newsletter** reescrevia o payload inteiro com snapshot velho → re-read antes de gravar (#241); (3) runs concorrentes do radar → relê antes de salvar (#239); (4) **a real**: `[radar-dbg] pubmed=0` — sem `api_key` da NCBI o PubMed dava **429** em todas as ~10 buscas sequenciais → 0 artigos. **Fix (#242):** PubMed com **pacing + retry/backoff + tool/email/api_key** (`lib/radar.js`). Validado: `allIds=113`, **64 itens** no Mural (era 34), mais novo de hoje, +30 adicionados e **persistiram**. **Opcional:** setar `NCBI_API_KEY` no Vercel (sobe limite p/ ~10 req/s). Lembrar de **remover `[radar-dbg]`** depois.
- [x] **Varredura completa da plataforma (2026-06-12, #241 + gatilho no banco).** 4 auditorias paralelas + verificação no banco. Bugs reais corrigidos: **(1) [crítico] Mural revertia** — `sendDailyNewsletter` reescrevia o payload INTEIRO a partir de um snapshot velho (durante o envio Resend), apagando `radar_avisos` do cron (write service_role, furava o gatilho); agora relê o estado fresco e só toca `newsletter_sent`/`newsletter`. **(2) [alto] vazamento de dados entre contas** no `doLogin`: navegador de outra conta sem perfil salvo não limpava o estado local → flashcards/notas/questões vazavam e eram salvos no remoto da nova conta; agora `clearLocalUserData()` sempre. **(3) [médio] médico caía no Dashboard escondido** (degustação pós-7d) → `homePanel()` cai em painel visível. **(4) [baixo] unsubscribe** agora constant-time. Defesas no banco: **gatilho `endodirect_global_preserve_server_keys`** (bloqueia o app de reverter `radar_avisos`/`newsletter_*`; só service_role escreve), `search_path` fixado; **radar relê antes de salvar** (corrida entre runs). Verificado OK: RPC `endodirect_acessos_ativos` filtra `status='active'` (estorno/cancelamento revoga de fato); webhook recupera tier pelo texto do item; advisors de performance = só otimização de escala. Itens de política em aberto na seção acima. **Mural:** `fresh=0` nos refresh manuais provavelmente é estado normal (PubMed 30d sem novidades) — diagnóstico `[radar-dbg]` no ar p/ confirmar.
- [x] **Bucket de assets — listagem restrita aos admins (2026-06-12).** Aviso de segurança do Supabase (`public_bucket_allows_listing`): a política `endodirect_assets_public_read` deixava qualquer um *enumerar* os arquivos do bucket público. Trocada por `endodirect_assets_admin_list` (SELECT só p/ admins). A exibição das imagens usa `getPublicUrl` (servida via `/object/public/`, sem RLS), então **nada muda no site**. Aplicado via migração + `supabase-storage-setup.sql` atualizado.
- [x] **Perfil do aluno — card de Assinatura (2026-06-12).** Na aba Perfil, card "💳 Assinatura" com o plano atual (Degustação/Standard/Gold), **Fazer upgrade** (abre os pacotes via `showAssineScreen`) e **Cancelar assinatura** (e-mail pré-preenchido p/ `contato@endodirect.com.br`; acesso mantido até o fim do período pago, conforme os Termos). **Gold não oferece upgrade** (botão E texto omitidos — é o topo da escada, #237); Standard mostra upgrade; cancelar só aparece com plano ativo.
- [x] **Tela de início e menu por perfil (2026-06-12).** Médicos (residente/endocrinologista/outros): o **Dashboard sai do menu** e o **Mural assume o topo** da seção Estudo, no lugar dele (`applyProfileMenuLayout()`, #237); além disso abrem direto no **Mural** (`homePanel()` + `maybeLandMedicoHome()`, reforça no pós-hydrate sem atrapalhar quem já navegou). Estudantes mantêm o **Dashboard** no topo e o **Mural** em "Pessoal". Cai pro Dashboard se o Mural não estiver visível (ex.: degustação após os 7 dias).
- [x] **Memed — mensagem amigável em erro de servidor (2026-06-12).** Quando a Memed retorna **5xx** (ex.: o HTTP 503 da homologação), o Consultório mostra "Memed temporariamente indisponível. Tente novamente em instantes." em vez do código HTTP cru (#236). Erros **4xx** (validação) seguem com o detalhe específico; log `[memed-resp]` intacto.
- [x] **Onboarding/UI (2026-06-11):** perfil "Estudante de medicina" (instituição + ano → badge `USP · 5º ano`); campos por perfil (médicos: residência + CRM; estudante: graduação + ano); janela aparece antes do dashboard; renomes do menu (Consultório, OSCE, Revisão, Prescrição Simulada); banner de degustação repaginado. Cache de borda corrigido (`vercel.json`: `index.html` sempre revalida, #201) — alunos recebem updates sem hard-refresh.
- [x] **Degustação (2026-06-11):** liberados Calculadoras, Podcasts e Cronograma; "Gerar com IA" travado em Flashcards/Mapas (só visualizar os atuais); Simulado limitado à fonte Provas (IA/Misto bloqueados).
- [x] pagar.me TEST → LIVE (chaves + webhook) — 2026-06-10.
- [x] Health check reconhece formato de chave LIVE do pagar.me (#169).
- [x] Newsletter por subespecialidade (#168).
- [x] Calculadoras TmP/GFR + escore-z estatura/idade (#170).
- [x] Exportação Obsidian no painel do aluno — **removida** (#172); base de conhecimento migrada para este cofre.
