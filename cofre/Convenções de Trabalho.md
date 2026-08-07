---
tags: [cofre, processo]
atualizado: 2026-08-07
---

# Convenções de Trabalho

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
