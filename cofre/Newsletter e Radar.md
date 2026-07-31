---
tags: [cofre, newsletter, radar]
atualizado: 2026-07-31
---

# Newsletter e Radar

### ⚠️ O PMC chega DEPOIS — e a pergunta só era feita uma vez (2026-07-31)
O professor apontou uma revisão de acesso aberto que não ganhou discussão sozinha: *"Artigo de revisão de revista open access e não gerou discussão automaticamente"* — **"Is Hypercortisolism Treatable?"** (Diabetes, Obesity and Metabolism, `pubmed:42533758`, entrou em 31/07 às 08h16).

**O tipo não era o problema.** "Artigo de Revisão" está em `TIPOS_QUE_RENDEM` desde 28/07. O item entrou com `link: https://doi.org/10.1111/dom.71163` e **`oa:false`**, e `qualifica()` (`lib/discussao-auto.js`) exige `pmcIdFromLink(item.link)`. Sem PMC não há texto integral, e sem texto integral não há discussão — isso é o limite que **define** o recurso.

**O que era defeito:** `articleLink()` calcula o link **uma vez**, na entrada do artigo, a partir dos `articleids` do esummary — e nunca mais. Só que a editora deposita no PMC **dias ou semanas depois** da publicação online, e o radar é diário: ele pega o artigo **no primeiro dia** em que aparece no PubMed, que é exatamente quando o PMC ainda não existe. O artigo virava acesso aberto no dia seguinte e **ninguém reperguntava**.

- **A escala, medida em 31/07:** dos **251** itens de PubMed no mural, **146** tinham link de DOI sem PMC — e **44 desses eram de um tipo que renderia discussão**. Não era um artigo; era um vazamento contínuo.
- **O sinal já estava no cofre e eu não tinha lido como sintoma:** o backfill manual de 01/07 registrou *"2 PMIDs muito novos deram erro/sem PMC = pulados"*. Aquilo não era ruído do backfill — era o defeito aparecendo pela primeira vez, e o backfill foi feito **à mão, uma vez só**.

**A correção — `lib/pmc-repescagem.js`:** todo run do radar repergunta ao conversor de ids da NCBI (`idconv`, PMID→PMCID) quais dos itens não-abertos ganharam PMC, e reescreve `link` + `oa` de quem ganhou. A partir daí o artigo entra na fila da discussão pelos gatilhos que já existem, sem nada novo.

- **Corre EM PARALELO com a busca de artigos**, não pendurada no fim. São 1–2 requisições contra um bloco de 30–45s: custo de relógio ~zero. Pendurar no fim é como a geração automática ficou dois dias sem rodar em 29/07 — o teto real do plano é 60s e etapa no fim não é alcançada.
- **Reusa o `fetchJson` paceado do radar.** O limite de req/s da NCBI é **por IP** e vale para o conversor também; solta em paralelo com o E-utilities, a dupla levaria 429.
- **`aplicar()` é pura e roda entre o merge e o save.** A consulta à rede acontece **antes** da releitura do estado — a janela do read-modify-write curto continua de milissegundos, que é o que impede um run concorrente de sumir com itens.
- **⚠️ Não sobrescreve link editado à mão.** Só troca o que o próprio `articleLink()` teria posto (`doi.org/…` ou `pubmed.ncbi.nlm.nih.gov/…`). Qualquer outro endereço foi o professor que digitou no card, e apagá-lo em silêncio seria pior que não repescar.
- **`live:"false"` do conversor é descartado** (artigo retirado do PMC) — senão o card ganharia um link quebrado.
- **Fail-safe:** NCBI fora do ar devolve mapa vazio e o radar do dia grava normalmente. Trocar um artigo antigo por nenhum artigo novo seria péssimo negócio.
- **Diz quanto fez:** `openAccessRepescados` volta no `runRadar` e aparece no aviso do botão "Atualizar radar" (*"· 3 viraram acesso livre 📖"*). Etapa silenciosa vira "o recurso está quebrado" — já aconteceu duas vezes neste mesmo recurso.
- **Teste:** `scripts/test-pmc-repescagem.js`, no CI. A asserção que importa é a **cadeia**: depois de repescar, `qualifica()` tem de passar a dizer **sim** para o mesmo artigo. Cobertura provada quebrando três coisas (guarda do link manual, `live:false`, aplicar no snapshot velho) — as três reprovam.

**⚠️ O que isto NÃO resolve, e é bom não confundir com o pedido do professor:** *aberto na editora* ≠ *depositado no PMC*. Uma revista pode publicar sob CC BY e nunca ir ao PMC; `lib/fulltext.js` só sabe ler JATS do PMC. Se `pubmed:42533758` for esse caso, ele continua sem discussão — por falta de texto integral, não por seleção. Daqui **não dá para verificar** (o proxy deste ambiente devolve 403 no CONNECT para `eutils.ncbi.nlm.nih.gov`, `www.ncbi.nlm.nih.gov` e `ebi.ac.uk`); quem responde é o primeiro run em produção. Suportar texto integral fora do PMC (Europe PMC, Unpaywall, JATS da editora) é outro recurso, não um ajuste deste. Ver [[Pendências]].

### ⚠️ `_itálico_` não era interpretado — e o aluno via `_D_` na tela (2026-07-30)
O professor mostrou uma league table de metanálise em rede cujo cabeçalho saía como `| _D_ | _A_ | _C_ | _B_ |`. O JATS traz os códigos dos tratamentos em itálico; a IA reproduziu com **underscore**, e essa era a única marca de ênfase que o renderizador do card não conhecia.

**O erro que quase cometi:** corrigi primeiro em `mdInline` e o teste continuou reprovando. O card do Mural tem renderizador **próprio** — `muralInlineHTML` (~l.14816) — e não passa por `mdInline`. O comentário no código já avisava; eu não li antes de editar.

- A regra vai **depois** de `__sublinhado__`: nesta plataforma a marca dupla é sublinhado (convenção do editor WYSIWYG), e a regra do underscore simples rodando antes comeria a dupla.
- Guardas de borda `(^|[^\w_])` e `(?![\w_])` para não transformar `user_profile` nem `SLC38A1_v2` em ênfase.
- **A mesma regra existe nos dois renderizadores, de propósito.** São dois por razões históricas, mas as marcas de ênfase têm de bater: marca que funciona num e não no outro é defeito que só aparece para o aluno.
- Teste em `scripts/test-mural-render.js`, incluindo a célula de tabela e a preservação de `__sublinhado__`.


### ⚠️ A tabela que o aluno vê é a DO ARTIGO, não a que a IA escreveu (2026-07-30)
Decisão do professor: *"reproduzir fiel ao artigo"*. Veio depois de ele ver uma **league table** de metanálise em rede sair deformada: a IA reescreveu a comparação par a par como tabela comum e **inventou um cabeçalho** (`| _D_ | _A_ | _C_ | _B_ |`) que o artigo não tem — ali o rótulo dos tratamentos vive na **diagonal**.

**A instrução antiga era a causa.** Ela mandava "reproduzir em markdown" e "traduzir os cabeçalhos" — ou seja, mandava o modelo **reescrever**, que é exatamente onde ele erra. Traduzir uma tabela é reescrevê-la.

**Mecanismo novo — marcador + substituição no servidor:**
1. `fullTextForPrompt` numera cada tabela no anexo: `[[TABELA:n]] — Table 8: …`.
2. O prompt manda escrever **só o marcador, sozinho numa linha**, no ponto em que a tabela entra. Proíbe copiar, traduzir e reescrever.
3. `inserirTabelas(md, tabelas)` (`lib/discussao.js`) troca cada marcador pelo markdown extraído do JATS, com **legenda e nota de rodapé originais**.

Troca uma instrução que o modelo pode desobedecer por uma substituição que ele não tem como errar.

- **A nota de rodapé resolve metade do problema relatado:** é ela que define A, B, C e D. Sem ela as letras da diagonal não significam nada.
- **Marcador inválido ou no meio de frase é apagado**, nunca chega à tela — mesma regra do `---` de 28/07 e do `_D_` de 30/07: marcação crua na tela é sempre defeito.
- **A colagem roda DEPOIS da checagem de tamanho mínimo:** a tabela do artigo não pode servir de enchimento para uma discussão que saiu curta.
- **Efeito colateral aceito pelo professor:** os cabeçalhos ficam **no idioma do artigo** (inglês, quase sempre). Foi dito antes da decisão e ele escolheu fidelidade.
- **Risco residual:** nada impede o modelo de colar uma tabela à mão em vez de usar o marcador. Não bloqueei isso — bloquear exigiria apagar tabelas do texto, e aí uma frase "a tabela abaixo mostra" ficaria órfã. `meta.tabelas_inseridas` registra quais marcadores foram de fato usados, que é por onde se detecta se o modelo está desobedecendo.


## ⚠️ Tabela de estudos incluídos não vai para o card (2026-07-30)
Pedido do professor a partir de uma metanálise de HIIT vs MICT: *"exclui essas tabelas assim dos estudos de metanálises"*. A discussão tinha reproduzido a tabela de **8 colunas × 20 estudos**, com o protocolo de cada braço por extenso — no card vira um bloco com rolagem horizontal que ninguém lê, e o aluno não tira dali nenhuma conduta.

Cortada em `tableToMarkdown` (`lib/fulltext.js`), na origem — mesmo lugar da coluna de referências, e pelo mesmo motivo: **se a IA nunca vê a tabela, não tem como reproduzi-la nem parafraseá-la**.

### O critério é ESTRUTURAL, e foi calibrado nas tabelas reais do banco
`ehTabelaDeEstudosIncluidos(cabecalhos, nLinhas)`: coluna de estudo/autor **na primeira posição**, **≥6 colunas** e **≥5 linhas de dados**.

| tabela gravada | forma | decisão |
|---|---|---|
| transportadores de aminoácidos | 7 col × 17 lin | sai |
| HIIT vs MICT (a do print) | 8 col × 20 lin | sai |
| microbioma e GLP-1 | 7 col × 7 lin | sai |
| definições de PTx | 5 col × 5 lin | **fica** — compacta e legível |

**A primeira versão que escrevi era por vocabulário** — exigia 3 cabeçalhos de uma lista ("sample size", "age", "duration"…) — e pegava **uma das quatro**. As outras diziam "População", "Nº de pacientes", "Metodologia": nenhuma lista de palavras prevê o vocabulário de todo autor. **Contar coluna e linha não depende de adivinhar.** A fronteira em 6 colunas cai exatamente entre a tabela compacta que vale a pena e as três que não.

- **O que continua passando:** efeito combinado, subgrupo, heterogeneidade — o que interessa de uma metanálise. Tabela de resultado *com* coluna de estudo (`Estudo | Efeito | IC 95% | Peso`) tem 4 colunas e sobrevive. Regra que cortasse "toda tabela com coluna Study" mataria justamente o ponto da discussão.
- **Sai junto a tabela de risco de viés por estudo** (mesma forma: um estudo por linha, 6+ domínios).
- **⚠️ A legenda decide o que a forma não resolve.** Duas tabelas reais de 5 colunas começam com "Estudo" e a contagem não as separa: `Estudo | Definição | PTx pré | PTx pós | Observações` traz **1/23 (4,3%), P = 0,36** — é desfecho por estudo, o dado da revisão, e **fica**; `Estudo | Perda de peso | Dieta | Metformina | Comentários` traz "sem ajuste formal" — é característica metodológica, e **sai**. Quem distingue é o `<caption>` do JATS, escrito pelo autor. Contar número nas células **não** funciona: a de resultado tem número, mas a de características também (n, idade, IMC). Daí `RE_LEGENDA_ESTUDOS` (characteristics / included studies / risk of bias / quality assessment / confounding) valer para tabelas de 5 colunas; de 6 em diante a forma basta.
- **As já gravadas foram corrigidas por RECORTE, não por regeneração.** Eu havia dito que recortar deixaria referência órfã; ao ler o texto integral das três, as frases que anunciam a tabela são localizadas e identificáveis ("A tabela abaixo resume o conjunto incluído…"), imediatamente antes dela. Removi frase + legenda + tabela, com trava por `md5` e conferência de que nenhuma referência sobrou. Preserva as tabelas de resultado da metanálise, que é o que interessa.

### ⚠️ A tabela gigante estava TRUNCANDO a discussão (descoberto em 30/07)
Ao conferir o resultado do recorte, dois dos textos **terminavam no meio de uma frase** e não tinham as seções "O que isto muda na prática" e "Limitações" — e **já estavam assim antes do recorte**. No banco: **3 de 29 discussões sem `## Limitações`, 4 de 29 terminando sem pontuação final**.

O teto de saída é **`max_tokens: 6000`** (`lib/discussao.js`). Tabela em markdown é cara em token (pipes, traços, números, siglas): a de HIIT tinha 4.961 caracteres e consumia perto de metade do orçamento, e a geração acabava antes do fim do texto. **Retirar a tabela devolve esse espaço** — é o efeito colateral mais valioso desta mudança.

**Não corrigido ainda (decisão do professor):** (1) as 4 discussões truncadas continuam truncadas — recorte não recria texto que nunca foi escrito, só regeneração resolve; (2) não há **guarda de truncamento** na gravação: hoje uma saída cortada no meio da frase é gravada como se estivesse pronta. A guarda óbvia (recusar e devolver à fila) precisa de teto de tentativas, senão um artigo que sempre trunca fica em laço.


## Remoção das sociedades ATA e Endocrine Society (2026-07-23)
- **Pedido:** "tirar os comunicados da ATA e endocrine society". Removidas do `SOCIETY_SOURCES` (`lib/radar.js`) — o radar **não puxa mais** esses comunicados. Sobraram **SBEM** e **SBD**.
- **Limpeza dos já gravados:** 22 itens (11 ATA + 11 Endocrine Society) apagados de `radar_avisos` (199→177) e seus `sourceId` adicionados a `radar_hidden` (rede de segurança contra re-add pelo cron antigo até o deploy + o cliente esconde qualquer cópia em aba cacheada).
- **NÃO afeta:** as revistas científicas via PubMed (Thyroid, J Endocr Soc, Endocrine Reviews etc.) seguem no `JOURNALS`; e o texto do card **Diretrizes** (que resume ADA/ATA/Endocrine Society) é conteúdo de estudo, não "comunicado" — intocado. `sw` v121→v122.

## Retenção 90 dias + "Carregar mais" (2026-07-23)
- **`MAX_MURAL_ITEMS=3200`** e **`AUTO_ITEM_TTL_MS=90 dias`** (antes 160 / 45d). O radar traz ~35/dia, então o teto de 160 cortava em ~6 dias; agora guarda ~90 dias.
- **Entrega janelada:** `endodirect_public_content` e `endodirect_member_content` mesclam em `adm_avisos` só os **200 artigos de radar mais recentes** (não o `radar_avisos` inteiro — evita estourar o payload do aluno).
- **Paginação:** RPC `endodirect_mural_radar_more(p_before, p_limit)` + botão "Carregar artigos mais antigos" no `initMural`. O **admin** lê tudo direto (90 dias completos). Ver [[Decisões]].

## Discussão completa do artigo no Mural (2026-07-28)

Pedido do Rodolpho: *"ao invés de somente fazer um resumo como o atual, deixa uma discussão completa do artigo, incluindo as figuras/tabelas dentro da discussão"*.

### ⚠️ O limite que define o recurso: discussão exige TEXTO INTEGRAL
O radar trabalha com o **abstract** (~250 palavras, sem figura e sem tabela). Escrever uma "discussão completa" a partir dele **é inventar** — é literalmente o erro de 28/07 nos artigos de Obesidade, em que afirmações verdadeiras *para a classe* não eram o que o ensaio mediu. Por isso a discussão só existe onde há **PMC (acesso aberto)**: em 28/07, **76 dos 253 itens do mural (30%)**. Nos outros 177 o card segue com o resumo, e o botão nem aparece.

### Figuras e tabelas: tratamento diferente, de propósito
- **Tabelas** — reproduzidas do artigo, convertidas de JATS para **markdown**, que o `muralTextHTML` já renderiza (não precisou de nada novo no cliente). São elas que carregam os números que a discussão cita.
- **Figuras** — **referenciadas pela legenda, não reproduzidas**. Duas razões: estar no PMC não implica licença de redistribuição (boa parte é "free to read", não CC), e a imagem viria de servidor do NIH. O rodapé da discussão diz isso ao aluno, com a licença detectada.

### Onde o texto mora — e por que NÃO no payload
Tabela própria **`endodirect_mural_discussoes`** (migração `mural_discussao_fora_do_payload`), com `endodirect_mural_discussoes_ids()` (só os ids, viaja no carregamento) e `endodirect_mural_discussao(source_id)` (o texto, buscado ao **abrir** o bloco).
- **A conta que decidiu isso:** ~12 KB por discussão × os **200** artigos que as RPCs entregam = **~2,3 MB** somados a um payload já em **~4,6 MB**. O limite empírico deste projeto é **~5,3 MB** — acima dele a resposta **deixa de chegar** e a tela fica vazia. Foi exatamente o que obrigou a separar o `endodirect_member_resumos`. Guardar dentro de `radar_avisos` teria reproduzido a falha assim que o acervo de discussões crescesse.

### Fluxo
Botão **📄 Gerar discussão completa** no card do admin (só nos que têm PMC) → `POST /api/admin/refresh-radar` com `{action:'discussao', sourceId}` → `lib/fulltext.js` busca e faz o parse do JATS → `lib/discussao.js` gera → grava na tabela.
- **⚠️ O endpoint está DENTRO do refresh-radar** e não em arquivo próprio porque `api/` está em **12/12 funções serverless** — o teto que o `scripts/ci-validate.js` barra. Criar `api/admin/discussao.js` quebraria o build.
- O prompt proíbe explicitamente o **jargão de IA** (regra de 28/07), número fora do texto fornecido e citar figura/tabela que não exista na lista.

### O que ainda não foi validado
O parser de JATS foi exercitado contra **fixture** (`scratchpad/test_jats.js`), não contra artigo real: desta sessão o proxy bloqueia `eutils.ncbi.nlm.nih.gov` e `ebi.ac.uk` (403 no CONNECT). **A produção alcança** — é de lá que o radar puxa os abstracts todo dia. A primeira validação contra artigo de verdade é clicar o botão em produção e ler o resultado.

## Discussão completa: geração AUTOMÁTICA só nos tipos que rendem (2026-07-28)
O botão por card continua; o que mudou é que **metanálise, diretriz, consenso e ensaio clínico** de acesso aberto passam a ganhar a discussão sozinhos, no cron do radar (`lib/discussao-auto.js`, chamado por `api/cron/endocrine-radar.js`).

- **Por que não todos os abertos.** Medido em produção: uma discussão sai com **~5.000 palavras**. Dos **81 artigos abertos** do mural, **56 são "Estudo Original"** e 10 revisão narrativa — em observacional pequeno, o resumo de 4 linhas já diz o que há. Gerar os 81 seria ~400.000 palavras que ninguém leu indo ao aluno. **O custo em dólar é baixo** (~US$ 0,19 por artigo no Opus 4.8; ~US$ 15 pelos 81); o que não é baixo é o custo de revisão.
- **⚠️ "Consenso" precisa do reconhecimento por TÍTULO, senão o pedido não tem efeito.** O `MURAL_TYPE_NAMES` do `lib/radar.js` **não inclui Consenso** — o prompt manda classificar consenso como "Diretriz", e o rótulo "Consenso" (que existe em `MURAL_TYPES`) só aparece quando o professor escolhe à mão. Por isso a seleção também lê o título (`consensus|consenso|guideline|position statement|standards of care`), e o mesmo vale para ensaio randomizado escondido em "Estudo Original". **Filtrar só pelo campo `tipo` atenderia o pedido no papel e não no efeito.**
- **Volume real em 28/07:** 10 por tipo (todas metanálises) + 1 consenso por título + 2 ensaios por título = **13 dos 81**.
- **Ritmo:** 2 por execução do cron, com orçamento de tempo — a etapa roda **por último**, para não roubar tempo da Questão do Dia nem da newsletter, que têm hora marcada. O que não couber sai no dia seguinte.
- **Modelo: Opus 4.8**, fixo. A primeira versão lia `process.env.ANTHROPIC_MODEL` **cru** e mandou `claude-sonnet-4-6` — id retirado em 13/07 — reintroduzindo a armadilha que o cofre já documentava para o `api/ai.js`. Agora usa `DISCUSSAO_MODEL` (env própria, com allowlist) e cai em `claude-opus-4-8`.
- **Teste:** `scripts/test-discussao-auto.js`, no CI. Cobertura provada tirando "Consenso" da lista e quebrando o regex de título — os dois reprovam.
- **⚠️ Continua sem etapa de liberação:** a discussão vai ao aluno assim que grava, para assinante e degustação igualmente (as RPCs `endodirect_mural_discussoes_ids`/`endodirect_mural_discussao` não filtram plano nem rascunho). Diferente dos Artigos dos Resumos, que nascem `rascunho:true`. Levantado ao professor em 28/07; ele seguiu para o modelo e os tipos sem pedir a trava. Ver [[Pendências]].

### ⚠️ "Gerei a discussão e não deu certo" — tinha dado (2026-07-29)
O professor clicou em "Gerar discussão completa", esperou, e a tela não mudou: o bloco não apareceu e o botão continuou dizendo "Gerar discussão completa". **A discussão tinha sido gerada e gravada** (6.479 caracteres, Opus 4.8, HTTP 200, ~40 s). Um F5 mostraria.

- **A causa:** o texto **não vive no payload** — fica em `endodirect_mural_discussoes`. O cliente, depois de gerar, relia o `endodirect_global_state` e redesenhava; só que **quem decide se o bloco aparece é `muralDiscIds`**, e esse mapa só era populado no hydrate do login. Reler o payload não traz notícia nenhuma da tabela nova.
- **A lição, que é geral:** quando o dado sai do payload por um bom motivo (tamanho, clobber), **todo caminho que "atualiza a tela" precisa saber disso**. Reler a fonte antiga passa a ser um no-op silencioso — e silencioso é o pior, porque parece falha do recurso caro que acabou de rodar.
- **Correção:** `carregarMuralDiscIds(client)` antes de redesenhar, nos **dois** caminhos (botão da discussão e botão "Atualizar radar").
- **Gatilho manual da geração automática:** ela só rodava no cron das 7h30, sem nada sob o controle do professor. O botão **"Atualizar radar"** passa a gerar também as pendentes (2 por clique, com orçamento de tempo), e o aviso diz quantas saíram.
- **Dado útil:** a geração levou **~40 s** e passou no Opus 4.8 — o teto de 60 s do plano Hobby aguentou neste artigo. Continua sendo o limite a vigiar em artigo longo.

### ⚠️ A geração automática NUNCA rodou — e o motivo é o teto de 60s (2026-07-29)
Depois de ligar o recurso, o professor voltou: *"Não gerou a discussão do artigo automaticamente"*. Estava certo — e o motivo não era seleção, era **tempo**.

- **Evidência:** 20 artigos qualificados na fila, o cron das 7h30 rodou, o professor clicou duas vezes em "Atualizar radar" (13h05 e 13h11) — e a tabela continuava com **2 discussões**, ambas geradas à mão na véspera.
- **A conta que estava errada:** o handler calculava o orçamento a partir de `maxDuration: 300`, mas **no Hobby esse pedido não tem efeito** — o teto real é **60 s**. Uma discussão leva **~40 s**, e antes dela rodam radar, Questão do Dia, newsletter, podcasts, e-mails de degustação e aviso do Instagram. A etapa "cabia" no papel; na prática a função era morta antes de chegar nela. **Sumia sem erro, sem log e sem discussão** — o pior tipo de falha, porque o botão dizia "Radar atualizado" e parecia que o recurso não servia.
- **A correção estrutural: UMA INVOCAÇÃO POR DISCUSSÃO.** Encadear N gerações de 40 s dentro de uma função de 60 s é impossível por construção, e nenhum ajuste de orçamento conserta isso.
  - `action:'discussao_fila'` devolve só a lista de pendentes (rápida, sem IA).
  - O botão **"📄 Gerar discussões pendentes"** no Mural do admin percorre a fila **sequencialmente, um `fetch` por artigo** — cada um com os seus próprios 60 s — e mostra "Gerando 3/20…".
  - **Sequencial, não paralelo:** N requisições de 40 s em paralelo competiriam pelo mesmo limite de execução.
- **No cron ficou só a carona:** `limite: 1` e orçamento calculado sobre **60 s**, não sobre 300. Quase nunca vai sobrar tempo, e tudo bem — quem gera em volume é o botão.
- **A lição, que vale para qualquer etapa nova:** ao pendurar trabalho no fim de um handler que já faz muita coisa, o orçamento tem de sair do **teto real do plano**, não do `maxDuration` pedido. E etapa que "não roda" precisa **dizer** que não rodou — silêncio vira "o recurso está quebrado".

### ✅ A forma que finalmente é automática: CADEIA DE INVOCAÇÕES (2026-07-29)
Três tentativas até acertar, e as duas primeiras erraram pelo mesmo motivo — eu insistia em caber tudo numa invocação só.

1. **Pendurar no fim do cron** → nunca alcançada (o orçamento saía do `maxDuration:300`, que no Hobby não vale).
2. **Botão que percorre a fila pelo cliente** → funciona, mas **exige o professor clicar e manter a aba aberta**. Ele pediu automático três vezes; eu entreguei mecanismo manual duas.
3. **Cadeia de invocações** — a que presta. `action:'discussao_cadeia'` gera **UMA** discussão e, antes de responder, dispara a **próxima invocação** para o próximo da fila. Cada artigo tem os seus 60s; a cadeia anda até esvaziar, sem cliente e sem aba aberta.

- **Autenticação servidor-a-servidor:** o endpoint aceita `Bearer <CRON_SECRET>` além da sessão de admin. Esse segredo nunca chega ao navegador.
- **⚠️ Disparar ANTES de responder.** Depois do `res.end()` a Vercel pode congelar a função e a requisição nem sai. O disparo usa `AbortController` com 2s: a conexão abre, a invocação do outro lado começa, e o abort é esperado — não é erro.
- **Quem dá a partida:** o cron do radar (todo dia) e o botão "📄 Gerar discussões pendentes" (quando o professor quiser adiantar). O botão agora só dá a partida e avisa quantos estão na fila; não prende a aba.
- **Se um elo falhar, a cadeia para** — e o cron do dia seguinte recomeça. Aceitável, e melhor que travar tentando ser esperto.

### Quatro gatilhos, porque um só nunca bastou (2026-07-29)
O professor voltou **cinco vezes** dizendo que a discussão não saía sozinha. Cada resposta minha dependia de algo que ele não ia fazer: primeiro do cron (1x/dia), depois de um botão, depois de o navegador dele já ter o JavaScript novo. A leitura correta do pedido é *"não quero clicar em nada"*.

Quem dá a partida na cadeia, hoje (`lib/discussao-kick.js` é o **único** lugar que sabe como disparar):
1. **Cron do radar (07h30)** — a partida principal.
2. **Cron do healthcheck (10h)** — segunda chance no mesmo dia, cobre falha do primeiro.
3. **Abrir o Mural no painel do professor** — `kickDiscussaoCadeia()` em `goPanel('mural')`, estrangulado a 1x/hora por `localStorage`.
4. **⭐ Qualquer carga de página** — `kickSeNecessario()` pega carona no `/api/checkout/config`, rota que o `index.html` chama em toda abertura, no IIFE do topo. Estrangulado a **1 partida por 10 min**.

**Por que o gatilho 4 existe, e por que ele é o que importa.** Os três primeiros dependiam da hora do dia ou de o cliente estar atualizado. Na tarde em que a cadeia entrou, os logs mostraram que ela **nunca havia sido invocada**: os crons do dia já tinham passado e o service worker do professor ainda servia o pacote antigo, sem o gatilho 3. O `/api/checkout/config` é chamado **pelo pacote antigo também** — pendurar a partida ali tira o recurso da dependência de cache de navegador.

- **Estrangulamento em duas camadas** (`deveKickar`): uma variável de módulo evita consultar o banco a cada requisição; a decisão que vale é a **escrita mais recente** em `endodirect_mural_discussoes`. Enquanto uma cadeia anda, ela grava a cada ~40s — escrita recente significa "já tem cadeia rodando", e nenhuma partida nova sai.
- **Nunca é caminho crítico:** não bloqueia render nem resposta, corre em paralelo com o `founderStatus` e falha em silêncio.
- **A marca de horário é gravada ANTES do disparo** — falha não vira retentativa em laço.

### ⚠️ O disparo da próxima vem ANTES da geração (2026-07-29)
A primeira versão da cadeia gerava (~40s) e **só então** disparava o elo seguinte. Isso amarrava a continuidade da fila a esta invocação caber nos 60s do plano: se estourasse, a função morria com a próxima nunca disparada e a fila parava **sem erro, sem log e sem discussão** — o mesmo sintoma que o recurso já tinha tido por outro motivo.

Hoje o elo seguinte sai em ~2s, antes da geração, e **a lista do que falta vai no corpo da requisição** (`{action:'discussao_cadeia', ids:[...]}`). Passar a lista adiante não é detalhe: recalcular a fila na invocação seguinte a faria ver o estado **anterior** à gravação desta e escolher o **mesmo artigo**.

- Antes de gerar, confere se o artigo **já** tem discussão (`jaTemDiscussao`): duas partidas simultâneas custariam uma chamada de IA repetida.
- `scripts/test-discussao-cadeia.js` reprova se as duas linhas trocarem de lugar, se a carona no `/api/checkout/config` sumir ou se alguma rota voltar a ter cópia própria do disparo.

### ⚠️ Leque, não corrente — e isso foi MEDIDO (2026-07-29)
Primeira versão do disparo antecipado: cada invocação disparava **a seguinte**. Rodei ao vivo com `LOTE_CADEIA = 6` e o resultado foi inequívoco — **saíram 3 discussões e o 4º elo nunca foi invocado**. Sem erro, sem 5xx, sem requisição nenhuma nos logs; a tabela simplesmente parou de crescer.

Corrente de N saltos tem **N pontos de falha em série**, e qualquer um deles engole o resto da fila em silêncio. Hoje quem recebe a partida (`discussao_cadeia` **sem** `sourceId`) calcula o lote, dispara **todos os outros de uma vez** com `Promise.all` e só então gera o seu. Quem recebe `{sourceId}` é folha: gera e não dispara nada. Um ponto de falha só, e o que não subir volta na partida seguinte.

- **A espera do disparo subiu de 2s para 6s.** O lote inteiro sobe junto e quem chega por último pode pegar partida a frio; 2s não davam. Como os disparos saem em paralelo, os 6s são pagos **uma vez**, não por artigo.
- `LOTE_CADEIA = 6` é o teto de gerações simultâneas — cabe nos limites de taxa da IA e custa ~US$ 1,20 por partida.

### ⚠️ As tabelas nunca chegavam ao modelo — o corte do prompt comia justamente elas (2026-07-29)
O professor abriu uma discussão cujo cabeçalho anunciava **"4 tabelas · 2 figuras"** e cujo rodapé dizia **"4 tabela(s) reproduzida(s) do artigo"**. No texto não havia tabela nenhuma: só prosa do tipo *"A Tabela 1 (referida no artigo) sintetiza…"*. Ele resumiu em uma linha: *"Não gerou as tabelas e figuras"*.

**A causa não estava no prompt nem no modelo.** `fullTextForPrompt` montava corpo → figuras → tabelas e cortava o resultado em 60.000 caracteres. Como os anexos iam **por último**, num artigo de 8.100 palavras o bloco inteiro das tabelas ficava **fora** do prompt. O modelo via a menção "Table 1" no corpo do texto e nunca a tabela; a instrução mandava reproduzir um material que não tinha sido enviado. Hoje figuras e tabelas são montadas primeiro e **quem cede espaço é o corpo** (com piso de 20% do teto, para o caso de anexos gigantescos).

**Os dois rótulos saíram**, a pedido dele:
- O selo `mural-disc-meta` no cabeçalho do card. Ele contava o que o **artigo** tinha, não o que a **discussão** trouxe.
- O rodapé de procedência (`*Discussão elaborada sobre o texto integral (PMC …)*`). Removido da geração **e das 21 discussões já gravadas**, com `regexp_replace` ancorado no fim do texto — 21 de 21 atingidas, nenhuma sobrou terminando em régua solta. O `updated_at` ficou intacto de propósito: é ele que o estrangulamento do gatilho lê como "tem cadeia rodando".

A lição que vale além deste recurso: **rótulo que promete o que não está no texto é pior do que rótulo nenhum**. Os dois foram escritos por mim para dar procedência ao aluno e acabaram atestando conteúdo inexistente.

`scripts/test-discussao-prompt.js` reprova se os anexos voltarem para depois do corte (sabotagem verificada: restaurar o truncamento antigo derruba 6 asserções), se o rodapé voltar ou se o selo reaparecer.

**Confirmado em produção, regerando um artigo:** a mesma revisão que antes saía com 7.446 caracteres e zero tabela voltou com **11.730 caracteres, 170 barras e linha separadora de tabela markdown** — e sem nenhuma ocorrência de "(referida no artigo)".

**Duas regras a mais no prompt, escritas a partir dessa primeira regeneração:**
- **A tabela sai em português.** Ela veio com os cabeçalhos em inglês, copiados do artigo (`Study | Population | GLP-1 RA | …`), no meio de um texto em português. Traduzir rótulo e célula; **número, unidade, sigla, fármaco, táxon e nome de estudo ficam como estão**. Traduzir o rótulo não altera o dado.
- **"Reproduzir" é colar, não descrever.** Dito explicitamente: escrever "a Tabela 1 mostra…" sem a tabela em markdown logo em seguida não conta como reproduzir. Era exatamente por aí que o modelo escapava.

### Prévia da discussão no card, no lugar do resumo repetido (2026-07-29)
Com a discussão pronta, o professor colou **o card que quer**: as duas linhas de cabeçalho (`📅 Data de publicação`, `🔬 Tipo de estudo`), depois **"Pergunta e contexto"** e **"Métodos"** à vista, e *"o resto aparece quando clicar no maximizar"*.

O que ele **não** colou foi o resumo de quatro linhas do radar — e faz sentido: `📝 Resumo` diz em um parágrafo o que `## Pergunta e contexto` desenvolve, e `⚠️ Cautela/limitação` o que `## Limitações` detalha. Com a discussão presente, aquele resumo é releitura.

- **`muralTextSemRepetido`** corta do primeiro rótulo coberto em diante (`📝 Resumo:`, `💡 Por que importa na prática:`, `⚠️ Cautela/limitação:`). **Data e tipo de estudo ficam**: são identificação do artigo, não conteúdo, e a discussão não os traz.
- **Só corta onde há prévia para pôr no lugar.** Sem discussão, ou com a RPC da prévia falhando, o card fica exatamente como era — cortar deixaria duas linhas de cabeçalho e nada.
- Se o corte não deixar nada, devolve o texto original: card vazio é pior que card repetitivo.
- **A prévia fica FORA do `<details>`**, não dentro do `<summary>`: dentro, o navegador trataria os parágrafos como parte do controle de clique. Ao abrir, a prévia é escondida e o corpo mostra a discussão inteira — a prévia é recorte do mesmo texto.

**RPC nova `endodirect_mural_discussoes_previas()`** (migração `mural_discussoes_previas`), porque o cliente não tem o markdown na hora de renderizar. Devolve `{source_id: previa}`, onde a prévia são as duas primeiras seções:

```sql
array_to_string((string_to_array(ltrim(markdown, E'\n'), E'\n## '))[1:2], E'\n## ')
```

- **Limite de 200 linhas e corte em 2.000 caracteres** são o que impede esta RPC de virar o problema que ela evita. Hoje: 23 prévias, **44 KB**. Com o acervo em 200, teto de ~400 KB — se passar disso, trocar por busca só dos ids em tela.
- A RPC antiga `endodirect_mural_discussoes_ids()` **continua existindo** e o cliente cai nela se a nova falhar; sem isso um cliente em cache perderia a discussão inteira.

### A coluna de referências sai na origem (2026-07-29)
Com as tabelas finalmente aparecendo, o professor apontou a coluna **Referência** — `(122, 124, 126, 127, 129)`: são os números da bibliografia do artigo, e a discussão não publica a lista de referências. *"Essa coluna de referências pode sempre tirar dos artigos."*

**Cortada em `tableToMarkdown` (lib/fulltext.js), não no prompt.** Se a IA nunca vê a coluna, não tem como reproduzi-la nem copiar os números para outra célula. Instrução no prompt seria pedido; corte na conversão é garantia.

- `RE_COL_REFERENCIA` casa `Reference(s)`, `Referência(s)`, `Ref.`, `Refs`, `Ref No.`, `Citations`. **NÃO casa `Study`/`Estudo`**: ali o número `(37)` é o rótulo da linha, e sem ele a tabela perde a identificação.
- Se o descarte deixar **menos de 2 colunas**, a tabela não é enviada — o que sobra não é tabela.
- O separador `|---|---|` é montado depois do corte, com a largura nova.
- Coberto em `scripts/test-discussao-prompt.js`; desligar o corte derruba **9 asserções**.

**As discussões anteriores foram regeradas em massa** (o acervo inteiro), porque tinham sido escritas com o prompt sem as tabelas. Como a fila só considera artigo **sem** discussão, regerar = apagar a linha e deixar a cadeia refazer. A cópia de segurança ficou em `endodirect_mural_discussoes_bkp_20260729`.

### ⚠️ `module.exports.config = { maxDuration }` NÃO vale neste runtime
É convenção de Next.js; o runtime Node puro a ignora. Quem manda é a chave `functions` do **`vercel.json`** — `api/ai.js` está lá com 120s há tempos, e `api/admin/refresh-radar.js` entrou com 120s em 29/07. Foi acreditando no `300` declarado no código que eu calculei um orçamento de tempo inexistente e a geração automática morria antes de acontecer. **Conferir o `vercel.json`, não o topo do arquivo.**

### ✅ O feed da ANVISA funciona
No mesmo dia o professor perguntou por que o Mural não pegou a notícia *"Anvisa registra cinco novas canetas de semaglutida"*. **Pegou:** entrou em `adm_avisos` às 13h05, com fonte "Agência Nacional de Vigilância Sanitária (Anvisa)" e o link oficial do gov.br. O que ele tinha visto antes era o card **G1** da mesma notícia, criado à mão pelo "Gerar texto com IA" a partir de uma URL — G1 **não é fonte do radar** (a allowlist do Breaking News só tem regulador e farmacêutica). Card do G1 removido a pedido.

## Radar / Mural (automático)
- `lib/radar.js` + `lib/news.js`: lê feeds RSS de revistas, resume com IA (`summarizeWithAI`), monta itens do mural.
- Filtro de qualidade: descarta artigos com `abstract` curto (`length < 200`) → `buildMuralItem` retorna null; `runRadar` filtra nulos.
- **Breaking News**: linha de tipo "🏷️ Tipo: Lançamento/Aprovação de medicamento" (sem o parêntese de subespecialidade, removido).
- Cron diário `endocrine-radar` (`30 10 * * *`).
- Itens não-breaking ficam em `payload.radar_avisos`. Admin pode editar cada card (inclusive os automáticos).
- **Ordem do mural por importância de TIPO (2026-06-23, pedido do usuário):** o **default** do mural passou a ser `'relevantes'` (aluno `muralSort` e professor `admMuralSort`). A ordem é dada por **`muralStudyRank(a)`**: Artigo de Revisão > Revisão Sistemática > Metanálise > Ensaio Clínico > Coorte > Caso-controle > Transversal > demais (detecta os subtipos finos no tipo+título+texto). `muralRelevance` ficou **dominada pelo tipo** (revista = leve desempate; data por último). Avisos do professor (Urgente/Breaking/Aviso/Comunicado/Evento) no topo. **A newsletter NÃO mudou** (ordena por frescor primeiro). Ver [[Decisões]].

## Newsletter diária — `lib/newsletter.js`
- `sendDailyNewsletter`: idempotência por `payload.newsletter_sent === hoje`.
- Monta `items` a partir dos artigos do dia, com **fallback para o top-3 do mural** quando há menos de 3 artigos novos (garante envio consistente, #167).
- **Destinatários:** membros + `newsletter_extra` − `newsletter_unsub`. List-Unsubscribe por destinatário; envio em batch (Resend).
- **Personalização por subespecialidade:** `getMemberPrefs(key)` lê `app_state -> user_profile -> newsletterSubs` de cada aluno; `itemsFor(email)` filtra o pool do mural pelos temas escolhidos (fallback para destaques gerais). `sendViaResend(...)` aceita `itemsFor` (função por e-mail) ou lista fixa.
- `muralItems(payload)` = todos os artigos não-breaking mapeados; `topFromMural` = primeiros 3.

## Priorização editorial (#275, refinada 2026-06-15) e layout (#283)
- **Ordenação (`rankArticles`)**: 1º por **tipo** (`articleTypeTier`: **0 = revisão/diretriz/consenso**, **1 = metanálise/revisão sistemática**, **2 = original/ensaio/coorte**, 3 = demais), 2º por **periódico** (`journalRank`: **NEJM=0 > Lancet=1 > JCEM=2 > outros=3**), 3º **data desc**. Aplicada ao pool (`topArticles ∪ muralItems`), `topFromMural` e `pool` personalizado.
- **Anti-repetição (2026-06-15)**: `sendDailyNewsletter` mantém `payload.newsletter_recent` (links enviados nos últimos 14 dias, cap 60) e `pickFresh()` prefere artigos ainda não enviados (completa com já-enviados só se faltar p/ 3). Resolve "a newsletter de hoje veio igual à de ontem". `newsletter_recent` é chave de servidor: incluída no **trigger** `endodirect_global_preserve_server_keys` e nas listas de preservação do `index.html` (capture + read-modify-write do admin).
- **Fonte do periódico (radar)**: `journalMatches`/`jnorm` (lib/radar.js) normaliza `&`→`and` e remove `the `; substring só p/ identificadores multi-palavra — antes o nome genérico "Endocrinology" (1 palavra) capturava o JCEM (saía "Endocrinology" em vez de "Journal of Clinical Endocrinology & Metabolism"). Vale p/ artigos novos.
- **Limpeza dos cards antigos (2026-06-15, via SQL)**: a atualização do radar NÃO re-rotula itens já existentes (dedup por `sourceId`). Os cards antigos guardam só a `fonte` normalizada (não o nome cru), mas o **DOI no `link`** identifica a revista: `10.1210/clinem`→JCEM, `10.1515/jpem`→J. Pediatric Endocrinol. Metab., `10.1093/ejendo`→Eur. J. Endocrinol., `10.1038/s41574`→Nat. Rev. Endocrinol., `10.1038/s41591`→Nat. Med., `10.1210/endocr`→Endocrinology (legítimo). Re-rotulados ~50 itens; artigo "Digital biomarkers" (`pubmed:42129603`) removido do `radar_avisos` e adicionado ao `radar_hidden` (não volta).
- **Template (`renderEmail`)**: **largura total** (sem caixa centralizada com `max-width`), fontes maiores (título ~23px, corpo ~17px), **logo do Endodirect** no cabeçalho (`publicBase()+'/Icone%20-%20MD%202.png'`, hospedado — Gmail bloqueia `data:`), `@media max-width:600px` para mobile.

## Seed de avisos removido — "radar atualiza e volta pro antigo no F5" (2026-06-15)
`defaultMuralAvisos()` tinha 6 artigos hardcoded (seed legado de antes do radar) com **`at: Date.now()-X`** (data **relativa** = sempre "hoje"). O `mergeRadarAvisos` injetava esses 6 **crus** (sem normalizar o `at`) quando não estavam na lista. No render **pré-hydrate** (localStorage de `adm_avisos` vazio — sempre, já que avisos manuais=0), o mural mostrava só esses 6 datados de "hoje" (pareciam os artigos novos); **~2s depois**, o hydrate trazia os 128 reais do radar (mais novos 14/06) e os 6 sumiam do topo → sensação de "atualiza e volta pro antigo". Os 6 sourceIds já estavam no `radar_avisos` do servidor (com `at` real = 01/06), então removê-los do seed **não perde conteúdo** (a lista populada continua 128). Fix: `mergeRadarAvisos` só normaliza a lista real, **não injeta mais o seed**; `defaultMuralMap()` segue usado só para canonicalizar o texto dos itens que casam por `sourceId`. Pré-hydrate agora mostra vazio/carregando por ~1s (honesto) em vez de artigos falsos. (O fix anterior #312 `personalOnly` foi diagnóstico errado p/ este sintoma — mantido como hardening.)

## Tipo "Diretriz" e remoção de "Fontes consultadas" (2026-06-15)
- **Tipo "Diretriz"** adicionado ao classificador do mural (`normalizeMuralType`): detecta `guideline`/`diretriz`/`consensus`/`consenso` no **tipo ou título** (sinal preciso) → retorna `'Diretriz'`; antes um "clinical practice guideline" saía como "Estudo Original". Incluído no dropdown de tipo do admin (`MURAL_TYPES`/`tipoOpts`) e no peso de relevância (`muralRelevance`: `Diretriz`=5, acima de Metanálise=4). Alinhado ao `articleTypeTier` da newsletter (revisão/diretriz/consenso = tier 0).
- **Seed legado não re-clobbera edição na leitura (fix 2026-06-15):** `normalizeMuralAviso` casava o item por `sourceId` com `defaultMuralMap()` (os 6 artigos hardcoded de `defaultMuralAvisos()`) e fazia `Object.assign({}, item, original, …)` — o seed sobrescrevia o item a cada render. Para esses 6 cards-semente (vivos no `radar_avisos`), a edição do professor (subespecialidade/tipo/texto) revertia no F5 mesmo após #320 (que só conserta o *save*): a normalização na LEITURA desfazia. Invertido para `Object.assign({}, original, item, …)` — o item gravado vence; o seed só preenche campos ausentes. Cards não-semente (ex.: puberdade precoce) nunca foram afetados. Verificado por simulação Node do round-trip e pela consulta ao banco.
- **Edição manual de tipo é respeitada (fix 2026-06-15):** `normalizeMuralType` agora retorna **verbatim** qualquer rótulo de `MURAL_TYPES` escolhido pelo professor — não re-deriva pelo título/texto. Sem isto, marcar "Artigo de Revisão" voltava a "Diretriz"/"Metanálise" porque o título cita "guidelines" (a auto-classificação rodava antes e sobrescrevia, inclusive no save via `normalizeMuralAviso`). A auto-classificação só vale para itens do radar (`tipo:'Artigo'`/vazio) ou rótulos legados. Além disso, na auto-classificação, **metanálise/revisão sistemática é checada ANTES de diretriz** — "A systematic review supporting ... guidelines" é Metanálise, não a diretriz em si.
- **"Fontes consultadas" removido dos cards:** `lib/radar.js` (`buildMuralItem`) não gera mais a linha `🔗 Fontes consultadas: ...` (o link da fonte já aparece em "Fonte:" no rodapé do card). Itens já gravados foram limpos via SQL (regexp_replace no `texto` de cada `radar_avisos`) **e** o cliente faz strip defensivo em `normalizeMuralAviso` (cobre qualquer resíduo). Importante: a newsletter lê o `texto` direto do payload (não passa pelo cliente), por isso a limpeza no SQL é o que garante e-mails sem essa linha.

## Data de publicação em dd/mm/aaaa (2026-06-15)
O PubMed entrega a data como `2026 Jun 13` / `2026 May` / `2026` / `2026/06/13`. Padronizado para **dd/mm/aaaa** (ou mm/aaaa / aaaa quando faltam dia/mês). Helper `formatPubDateBR` em `lib/radar.js` (exportado) e `pubDateBR` no `index.html` (espelho). Aplicado em: (1) geração do radar — `buildMuralItem` formata a linha `📅 Data de publicacao:` e o campo `publicationDate`; (2) mural — `normalizeMuralAviso` reformata a linha do `texto` no render (cobre itens já gravados); (3) newsletter — `renderEmail` formata `a.data` no render (importa `formatPubDateBR` do radar; sem ciclo, pois o radar não importa o newsletter). Como mural e newsletter formatam no render, **não precisou de SQL** para os itens antigos. Idempotente (se já está dd/mm/aaaa, mantém).

## Aluno escolhe temas (Perfil)
- Card "📬 Newsletter — temas de interesse" em `renderPerfil()`, checkboxes de `MURAL_SUBSPECIALTY_FILTERS`, salvos em `user_profile.newsletterSubs` (cross-device via `queueRemoteStateSave`). Preservado ao editar o resto do perfil.

## Variáveis (nomes)
`RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`, `CRON_SECRET`.

## Pendência
Confirmar entrega para Eduardo/Bruno (checar spam). O botão "✉️ Enviar teste da newsletter" no Mural do admin foi **removido** a pedido do usuário (2026-06-15); o endpoint `/api/newsletter/test` continua existindo, mas sem gatilho na UI. Ver [[Pendências]].
