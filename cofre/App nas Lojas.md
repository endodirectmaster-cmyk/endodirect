---
tags: [cofre, app, lojas]
atualizado: 2026-11-11
---

# App nas Lojas (Google Play e App Store)

Pedido do professor (18/10/2026): *"Quero deixar transformar a plataforma do ED em
aplicativo no google play e apple store. Me de o passo a passo"*. A pesquisa (fontes
oficiais da Apple, do Google e do gov.br, lidas em 18/10) e o passo a passo foram
entregues na conversa. Aqui ficam o resumo, as decisões e o que falta.

## Decisões do professor (18/10)

- **Pagamento só no site** (pagar.me). Nada de compra pela Apple nem cobrança do Google.
- **Manter o login com Google.** No iPhone isso obriga a ter também "Entrar com a Apple"
  (diretriz 4.8 da Apple).
- **Sem desenvolvedor contratado.** Ele tem Mac: eu escrevo o código e o roteiro, e ele
  faz no Mac só o que exige a conta Apple (Xcode, App Store Connect).
- Ele propôs *"o que o app pode fazer é direcionar para o site"*. Expliquei que não dá:
  - **Google, Brasil:** o app não pode ter botão, link nem cadastro que leve a pagar
    fora. Link para pagar no site só existe nos EUA, no Reino Unido e na Europa.
  - **Apple, Brasil (desde 18/06/2026):** o link para o site só vale **ao lado** da compra
    pela Apple, com a folha de aviso da Apple e comissão (10–15% das vendas pelo link em
    até 7 dias).
  - **O caminho:** app **só de acesso**. O aluno assina no site, e a divulgação fica fora
    do app (Instagram, e-mail, WhatsApp). No app: login, sem preço e sem "assine".
    - O Google aceita isso de forma explícita.
    - Na Apple há risco de recusa (diretriz 3.1.3(b) pede que o vendido no site também
      possa ser comprado no app). Se recusarem, as saídas são acrescentar a compra pela
      Apple (com o link ao lado) ou manter no iPhone o atalho da tela inicial.

## Andamento

- **18/10, 13h54 de Brasília:** D-U-N-S pedido pela ferramenta da Apple; aguarda o e-mail da D&B.
- **19/10, 22h17 de Brasília:** e-mail automático da D&B (iResearch) confirma o pedido:
  rastreamento 11080153, caso 11138655, categoria "Add business" (cadastrar a empresa).
  O número ainda não saiu; o resultado vem num e-mail separado. Prazos oficiais:
  - **Apple:** até 5 dias úteis para a D&B emitir (por volta de 27/10). Depois de
    emitido, até 2 dias úteis para a Apple recebê-lo. Se passar de duas semanas,
    escrever à D&B.
  - **Google:** até 30 dias ou mais. O nome jurídico e o endereço do perfil de pagamentos
    do Google têm de ser iguais aos da D&B.
  - O D-U-N-S é gratuito: não pagar "serviço expresso" nem intermediário.
- **29/10, 13h11 UTC:** D-U-N-S EMITIDO. E-mail da D&B (não responder): caso 11138655
  resolvido, "D-U-N-S Number created", "Verified through national registry". Número
  **763009852**, razão social ENDODIRECT CURSOS EM ENDOCRINOLOGIA E METABOLOGIA LTDA,
  nome fantasia ENDODIRECT. Endereço e telefone estão no e-mail do professor (não
  copiados aqui porque o repositório é público). Saiu em ~8 dias úteis, dentro do prazo.
  - Próximo: abrir a conta de organização na Apple (US$ 99/ano) e no Google Play
    (US$ 25) com este D-U-N-S, a mesma razão social e o mesmo endereço.
- **30/10:** o professor perguntou o próximo passo na Apple: inscrever a empresa no Apple
  Developer Program como organização, com o D-U-N-S, a razão social e um e-mail
  @endodirect.com.br. Com *"Pode começar"*, montei a parte que não depende da conta
  (seção "Projeto do app do iPhone" abaixo).
- **31/10, ~14h UTC:** o professor começou a inscrição no Apple Developer Program. A Conta
  Apple usada para pedir o D-U-N-S foi a pessoal (Gmail). Orientei a criar uma Conta Apple nova
  com e-mail @endodirect.com.br, com o nome legal dele e a verificação em duas etapas, e a
  escolher **Organização**. O D-U-N-S é da empresa e vale com qualquer conta. A página da Apple
  (lida em 31/10) recomenda a conta com o e-mail da organização e pede e-mail de trabalho do
  domínio da empresa. Nome da empresa ou apelido no lugar do nome legal atrasa a aprovação.
  Próximo: depois da aprovação e do pagamento, ele me manda o Team ID.
- **31/10, 11h27 de Brasília (14h27 UTC): INSCRIÇÃO ENVIADA.**
  - Tipo: Company / Organization. A Apple aceitou o D-U-N-S e puxou da D&B a razão social e o
    endereço.
  - E-mail de trabalho: contato@endodirect.com.br, verificado por código. Autoridade:
    "proprietário/fundador".
  - Status: "Sua inscrição está sendo processada". O ID de inscrição está no print do
    professor e não vai para o repositório público.
  - A Apple ainda confere a autoridade para assinar, por telefone ou pedindo documento. Depois
    manda o e-mail para aceitar o contrato e pagar US$ 99.
- **31/10, 11h30 de Brasília: a Apple pediu documentos** (e-mail "Review your Apple Developer
  Program enrollment"). Ela não conseguiu verificar a identidade dele nem o vínculo com a
  empresa. Pede:
  - documento oficial com foto;
  - comprovação do vínculo com a empresa;
  - um documento da empresa: contrato social, cartão CNPJ ou contrato de constituição.
  - **Envio:** em developer.apple.com/contact/file-upload/. Português do Brasil é aceito, sem
    tradução.
  - **Orientei:** CNH ou passaporte; contrato social consolidado com ele como
    sócio-administrador (é o vínculo); cartão CNPJ atualizado, do site da Receita. O nome tem
    de ser igual no documento, na Conta Apple e no contrato social. Os documentos não passam
    por mim.
- **31/10, 11h34 de Brasília: documentos enviados** pelo formulário da Apple. Foram o acordo
  de sócios, o contrato social registrado, a 2ª alteração contratual, o cartão CNPJ e o
  passaporte. Tela da Apple: "Your documents are being processed". Agora é esperar a resposta
  (dias úteis); se ela pedir mais, o professor manda o print.
- **10/11: INSCRIÇÃO ACEITA.** E-mail "Continue your Apple Developer Program enrollment": "Your
  enrollment request has been accepted". Falta o professor entrar em developer.apple.com/account
  com a mesma Conta Apple da inscrição, aceitar o Apple Developer Program License Agreement e
  pagar a anuidade. Orientei a digitar o endereço em vez de clicar no link do e-mail. Depois do
  e-mail de boas-vindas ("Welcome to the Apple Developer Program"), ele me manda o **Team ID**
  (Membership details, 10 caracteres) para a etapa 4 de `app-ios/LEIA-ME.md` (Entrar com a
  Apple, links universais) e segue a etapa 2 no Mac.
  - **Qual Conta Apple (conferido no e-mail "Your program enrollment has been received", 31/10):**
    a inscrição da empresa está na Conta Apple **contato@endodirect.com.br** (campo "Email" da
    inscrição), nome exibido "Endodirect Endocrinologia". É com ela que se aceita o contrato e se
    paga. O link "Go to the website" do e-mail aponta para developer.apple.com/enroll.
  - **⚠️ A Conta Apple pessoal do professor tem uma assinatura ANTIGA, de pessoa física, expirada**
    (tentativa de app anterior). Ela mostra "Renovar a assinatura": **não renovar**. Isso pagaria
    uma conta individual no nome dele, e o app tem de ficar na conta da empresa. Pelo mesmo motivo,
    o /enroll com a conta pessoal dá "already associated with the Account Holder of a membership".
  - Em 10/11 a conta da empresa, entrando por /enroll/app → "Continue a inscrição na web", abriu
    "Selecione o tipo de entidade" com "Individual" marcado. Orientado a não continuar ali e a ir
    por developer.apple.com/account; se a tela voltar, decidir antes de clicar (escolher
    Company / Organization ou falar com o suporte).
- **10/11, ~17h UTC: CONTRATO ACEITO E ANUIDADE PAGA** (US$ 99, cobrado em dólar) com a Conta Apple
  da inscrição (contato@endodirect.com.br, nome "RODOLPHO MENDONCA"). Tela da Apple: "Thank You —
  We are processing your order and will send you an activation email when it's ready… up to two (2)
  business days". Próximo: o e-mail de ativação ("Welcome to the Apple Developer Program"); depois, o
  professor manda o **Team ID** e segue a etapa 2 de `app-ios/LEIA-ME.md` (pelo GitHub, sem Mac;
  ver abaixo).
- **10/11, 14h46 de Brasília: CONTA ATIVADA.** E-mails "Welcome to the Apple Developer Program." e
  "Welcome to App Store Connect." para contato@endodirect.com.br. Próximo: Team ID, identificador do
  app com Sign In with Apple, app no App Store Connect, chave da API e os quatro segredos.
  - **Team ID: `9Q4Y44Z44C`** (não é segredo: vai na assinatura de todo app). Equipe "ENDODIRECT
    CURSOS EM ENDOCRINOLOGIA E METABOLOGIA LTDA", inscrita como Organização, titular Rodolpho
    Mendonça; renovação em 10/11/2027 (US$ 99). O professor ainda cadastra o Team ID como o
    segredo `APPLE_TEAM_ID` no GitHub, junto com os da chave da API.
  - **Identificador registrado em 10/11:** App ID "Endodirect" = `br.com.endodirect.app` (explícito), com
    **Sign In with Apple** ("Enable as a primary App ID"). O quadro "Finish Setting up Sign in with
    Apple" lista Service ID e Key (só para login no site, não usado) e **Email Sources** (pendente: os
    e-mails da plataforma só chegam a quem escondeu o e-mail se o remetente estiver cadastrado).
  - **App no App Store Connect, 10/11: o nome "Endodirect" está OCUPADO.** Há na App Store um app
    "Endodirect" (id 6700791940) da KING TECNOLOGIA DA INFORMACAO LTDA, a empresa que o professor
    contratou antes (app de banco de questões, contrato encerrado). Nome de app é único na loja.
    Orientado: lançar como **"Endodirect Endocrinologia"** (o nome do app muda em versão futura) e
    pedir à King que retire e apague o app antigo; apagado, o nome volta ao conjunto geral e o nosso
    pode passar a "Endodirect" numa atualização. Com marca registrada no INPI, a Apple tem formulário
    de disputa de nome. O "Nome da empresa" (desenvolvedor, permanente) ficou "Endodirect".
  - **App criado em 10/11: "Endodirect Endocrinologia"** (Apple ID do app 6833147654, SKU
    `endodirect-ios`, Português (Brasil), Acesso total).
  - **Chave da API "GitHub Actions" (Admin) criada em 10/11** em Usuários e acesso → Integrações →
    Chaves da equipe (o acesso à API foi solicitado e aprovado na hora). O `.p8` ficou com o professor.
    **Os quatro segredos** (`APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`) foram
    cadastrados por ele no GitHub; nenhum valor passou pelo Claude além do Team ID e dos dois IDs.
  - **10/11, 17h50 de Brasília: PRIMEIRO ENVIO AO APP STORE CONNECT OK** (run 42898729978, build 4,
    Xcode 26.6, ~2,5 min). A 1ª tentativa bastou: arquivo com assinatura local ("-") + exportação
    assinada pela nuvem da Apple ("Upload succeeded", "EXPORT SUCCEEDED"). Nenhum certificado de
    desenvolvimento criado. Próximo: a Apple processa o build; o professor se adiciona como testador
    interno no TestFlight e instala no iPhone.
  - **10/11, ~21h: APP INSTALADO NO IPHONE DO PROFESSOR PELO TESTFLIGHT.** Grupo interno
    **"Equipe"** com distribuição automática (todo build novo chega sozinho ao iPhone), testador
    RODOLPHO MENDONCA (convite em contato@endodirect.com.br, aceito com outro Apple ID no iPhone:
    o TestFlight permite). iPhone 12 Pro, iOS 27.0.1. Build 4 vale até 08/02/2027. O TestFlight
    dele ainda lista os apps da empresa antiga ("Endodirect" e "Simulados Pro", builds removidos).
    O app ainda não está na App Store: falta a página do produto e o envio à revisão.
  - **10/11: 1º achado do teste — o ☰ do painel não respondia.** O app desenha o site sob o
    relógio (Capacitor `contentInset: "never"`) e a barra do topo começava em y=0, atrás do
    relógio e da bateria. Correção em 11/11 (site, vale sem reinstalar): as barras do topo
    (`.topbar` e `.adm-topbar`), a lateral do painel e a Questão do Dia descem por
    `env(safe-area-inset-top)`; faixa fixa escura (`body::after`) pinta o fundo do relógio quando
    a página rola. No app, `UIStatusBarStyleLightContent` no Info.plist deixa o relógio claro
    (vale a partir do build 5). Teste: `scripts/test-app-ios-area-segura.js` (ci 17c-undecies-aa).
  - **11/11: build 5 enviado** (run 42929484795, com o relógio claro) e distribuído sozinho ao
    grupo "Equipe".
  - **11/11: ROTEIRO DE TESTE NO IPHONE — TUDO PASSOU** (professor, iPhone 12 Pro, iOS 27.0.1):
    tela de entrada sem preços; Continuar com a Apple (e-mail compartilhado); Google; e-mail e
    senha; sair e entrar; modo avião mostra "Sem conexão" com "Tentar de novo". Próximo: preparar
    o envio à revisão da Apple (página do produto, privacidade, conta do revisor, revogação do
    token da Apple ao excluir a conta, Email Sources do relay privado).
  - **11/11: FICHA DA APP STORE** (página privada do professor:
    https://claude.ai/artifact/9Gq7kJPZ19BY1b49Sh7YGd): subtítulo "Questões, resumos e
    simulados", texto promocional, descrição (sem preço nem "assine"), palavras-chave (95
    caracteres), URLs, copyright da razão social, categorias Educação + Medicina, classificação
    etária, notas ao revisor em inglês, respostas de privacidade, gratuito e só Brasil.
    Lançamento recomendado: manual.
  - **Conta do revisor:** já existia (19/10). O professor gera a senha em Estudantes › "Conta de
    revisão das lojas" e cola no App Store Connect ("Início de sessão obrigatório").
  - **11/11: DUAS DIRETRIZES QUE O APP NÃO CUMPRIA, corrigidas só no app do iPhone:**
    - **1.4.2** (calculadora de dose só de fabricante, hospital, universidade ou entidade
      aprovada): somem `cliques` (semaglutida), `lt4` e `cortic`. Professor: "pode".
    - **5.1.2(i)** (permissão explícita antes de mandar dados a IA de terceiros): aviso uma vez,
      na primeira chamada de IA (`garantirConsentimentoIA` em `aiRequest`), com Anthropic/Claude,
      o que vai e o que não vai (nome, e-mail, CPF e pagamento não vão: conferido em `api/ai.js`),
      sem treino de modelo e "não escreva dados que identifiquem pacientes". "Agora não" recusa
      só aquela chamada. Concordância em `localStorage` (`endo_ia_consent_v1`).
    - Teste `scripts/test-app-ios-revisao-apple.js` (ci 17c-undecies-ab), 9 mutações pegas.
  - **11/11: REVOGAÇÃO NA APPLE AO EXCLUIR A CONTA** (exigência da Apple para quem oferece Entrar
    com a Apple). No app do iPhone, conta com identidade Apple: a folha da Apple abre de novo na
    exclusão e o `authorizationCode` vai com o pedido (`apple_code`); o servidor
    (`lib/apple-revogar.js`, chamado por `lib/excluir-conta.js` antes de apagar o usuário) assina o
    client_secret ES256, troca o código em /auth/token, confere o `sub` com as identidades Apple da
    conta (`userFromReq` agora devolve `appleSubs`) e revoga em /auth/revoke. Nenhum token guardado.
    Falha da Apple não trava a exclusão (vai ao log: `apple: revogada` ou o motivo). Fechar a folha
    para a exclusão com aviso. Página /excluir-conta atualizada. Teste
    `scripts/test-apple-revogar.js` (ci 17c-undecies-ac), 11 mutações pegas.
    - **Teste da chave no painel (11/11):** Estudantes › cartão "Conta de revisão das lojas" ›
      "Testar a chave da Apple" (`kind:'apple_chave_teste'`, só professor). Manda à Apple um código
      inválido de propósito: `invalid_grant` = chave aceita; `invalid_client` = chave/Key ID errados.
      O teste real de exclusão não dá para fazer com o Apple ID do professor: o "Continuar com a
      Apple" de 10/11 vinculou a Apple à conta de professor (Google + Apple), que não se exclui.
    - **10/11, 23h48: CHAVE "SIGN IN WITH APPLE" CONFIGURADA E ACEITA PELA APPLE.** Chave "Endodirect
      Sign in with Apple" criada em Keys (Sign in with Apple, app br.com.endodirect.app); envs
      `APPLE_SIWA_KEY_ID` e `APPLE_SIWA_PRIVATE_KEY` (Production) coladas pelo professor; redeploy
      23h47; botão do painel: "A Apple aceitou a chave".
    - **⚠️ 10/11, 23h39: o professor abriu por engano a chave do App Store Connect ("GitHub Actions",
      a do TestFlight, papel Admin) e o conteúdo apareceu num print.** Orientado a revogá-la, criar
      outra (Admin) e trocar `ASC_KEY_ID` e `ASC_KEY_P8` no GitHub; a cópia local do print foi apagada.
      Depois da troca, rodar um envio de teste ao TestFlight. Regra: print de arquivo .p8 nunca,
      só o nome do arquivo.
    - **Email Sources cadastrados pelo professor (10/11, 23h33):** domínios endodirect.com.br e
      send.endodirect.com.br; e-mails nao-responda@, newsletter@, noticias@, suporte@ e contato@.
    - **Falta do professor:** chave "Sign in with Apple" no portal (Keys) e as envs da Vercel
      `APPLE_SIWA_KEY_ID` e `APPLE_SIWA_PRIVATE_KEY` (a chave não passa pelo Claude); depois, redeploy
      e um teste real (conta nova pela Apple no iPhone, excluída no app, conferir o log).
  - **Ficha preenchida pelo professor em 10/11 à noite:** capturas (6, 1179 × 2556), textos, build 5,
    login do revisor, notas, contato, categorias, direitos de conteúdo ("Sim"), classificação 16+ (A16
    no Brasil), privacidade (11 tipos; Saúde por causa da Memed; ID do dispositivo pelo limite de
    aparelhos). Falta: preço e disponibilidade, Email Sources, chave da Apple.
- **10/11: O MAC DO PROFESSOR NÃO SERVE PARA ENVIAR O APP.** É um MacBook Air Retina 13" de 2019
  (Intel Core i5, 8 GB, macOS Sonoma 14.8). O Sequoia só vai do MacBook Air de 2020 em diante e o
  Tahoe só nos de chip da Apple, então esse Mac fica no Sonoma. O Xcode 26 exige Sequoia 15.6 ou
  mais novo (26.4 em diante: Tahoe 26.2), e desde 28/04/2026 a App Store só aceita envio feito com
  Xcode 26 / SDK do iOS 26. Saídas: (a) compilar e enviar ao TestFlight pelo GitHub Actions (runner
  macOS; gratuito em repositório público), com chave da API do App Store Connect criada pelo
  professor e guardada por ele nos segredos do GitHub; (b) um Mac com chip da Apple (M1 ou mais novo);
  (c) Mac alugado na nuvem. Recomendado (a).
- **10/11: o professor escolheu o "Caminho 1" (GitHub Actions).** Rotina `.github/workflows/app-ios.yml`:
  - só disparo manual; modo `compilar` (sem assinatura, sem segredo) e modo `testflight`;
  - o modo `testflight` assina pela nuvem da Apple (cloud signing, chave da API com papel
    **Admin**) e envia direto ao App Store Connect. Primeiro tenta o arquivo sem assinatura,
    assinado na exportação; se a Apple recusar, arquiva com assinatura automática;
  - segredos: `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, cadastrados pelo
    professor no GitHub. A chave não passa pelo Claude;
  - esquema compartilhado `App.xcscheme` versionado, porque o Mac do GitHub nunca abriu o
    projeto no Xcode;
  - roteiro do professor na etapa 2 de `app-ios/LEIA-ME.md`: Team ID, identificador do app
    com Sign In with Apple, app no App Store Connect, chave da API, segredos, primeiro envio
    e TestFlight. Teste: `scripts/test-app-ios-workflow.js` (ci 17c-undecies-y).
  - **Primeira compilação (modo `compilar`), 10/11: OK** no runner `macos-26` com **Xcode 26.6**,
    em ~2 min (o Capacitor e os plugins resolvidos pelo Swift Package Manager). Actions em Node 24
    (checkout v6.1.0, setup-node v6.5.0). Falta o modo `testflight`, que depende da conta ativa,
    do identificador do app, do app no App Store Connect e dos quatro segredos.
- **10/11: ENTRAR COM A APPLE (diretriz 4.8), pedido do professor "Vamos resolver isso".** Nativo:
  - plugin Swift do próprio app (`AppleSignInPlugin`, jsName `AppleSignIn`, método `entrar`),
    registrado em `AppViewController` (SceneDelegate e storyboard apontam para ele); permissão
    `com.apple.developer.applesignin` em `App.entitlements`;
  - site: botão "Continuar com a Apple" (estilo branco da Apple) só no app do iPhone com o plugin;
    nonce aleatório, SHA-256 para a Apple e cru para o Supabase; `signInWithIdToken` provider
    `apple`; o nome do primeiro login vai para o perfil; cancelar não mostra erro;
  - sem Services ID nem chave secreta (só o login web precisaria, e ele expira a cada 6 meses);
  - conferido no Chromium com o supabase-js real: a Apple recebeu o hash e o Supabase o nonce
    cru correspondente; o botão some no site;
  - a rotina do iPhone confere a permissão no app assinado localmente, e o arquivo do
    testflight passa a levá-la (assinatura local "-" antes da assinatura pela nuvem);
  - **Supabase: provedor Apple LIGADO pelo professor em 10/11, ~17h24 de Brasília**, com
    `br.com.endodirect.app` em Client IDs e a Secret Key vazia (o Chrome tinha preenchido os dois
    campos com um usuário e uma senha salvos; foram apagados antes de salvar). Conferido:
    `/auth/v1/settings` mostra apple/google/email, e o `/token?grant_type=id_token` com token
    falso responde "not an Apple ID token issuer" (o provedor aceita o fluxo nativo).
  - falta do professor: capability no App ID (depois da ativação da conta); testar pelo TestFlight. Pendente antes da revisão: revogar o token da Apple ao
    excluir a conta. Teste: `scripts/test-login-apple-app-ios.js` (ci 17c-undecies-z).
  - **Compilado no GitHub em 10/11 (Xcode 26.6):** o Swift compila e o app assinado localmente sai
    com `com.apple.developer.applesignin = [Default]`.
- **19/10:** ajustes da plataforma feitos (seção abaixo), autorizados pelo professor com
  *"Pode fazer tudo"*. Falta o `assetlinks.json`, que depende do Play Console.

## ✅ Ajustes da plataforma (19/10/2026)

### 1. Exclusão de conta dentro do app, mais a página pública

- **Onde:** Meu perfil → cartão **Excluir conta**. O aluno digita **EXCLUIR** e confirma.
  Só aparece para conta real de aluno: professor não se exclui por aqui. (A conta de
  demonstração local `aluno@`, que não tinha o que apagar no servidor, saiu em 30/10.)
- **Página pública:** `https://www.endodirect.com.br/excluir-conta` (`excluir-conta.html`).
  É o endereço que vai nos formulários do Google Play (Segurança dos dados → exclusão de
  conta) e da App Store. O botão "Entrar e excluir minha conta" leva a `/#excluir-conta`,
  que abre o login e depois o perfil já no cartão.
- **O que o servidor faz** (`api/ai.js`, `kind:'excluir_conta'`, código em
  `lib/excluir-conta.js`; identidade só pelo token, nunca pelo corpo):
  1. lista o que sai (`endodirect_exclusao(uid,'listar')`);
  2. **cancela no pagar.me toda assinatura ligada à conta**; se uma não cancelar,
     **nada é apagado**;
  3. apaga, pela chave, os acessos sem pagamento, os aparelhos de notificação, a
     inscrição na newsletter e os tickets de suporte;
  4. anonimiza os acessos pagos (`'anonimizar'`): ficam sem usuário e com e-mail
     `excluida.<id>@conta-excluida.invalid`. O pedido e a assinatura continuam para
     estorno e contestação, e o `notes` continua, então as vagas de fundador seguem
     contadas. O e-mail sai do registro de degustação (`trial_emails`);
  5. apaga o usuário pela API do Auth. O progresso (`endodirect_app_state`) e os
     aparelhos saem junto, por cascata.
- **O que fica:** o registro dos pagamentos sem nome e e-mail; a lista de descadastro da
  newsletter (se o e-mail estava nela); o que o pagar.me e a Memed guardam; logs dos
  provedores (até 7 dias); cópias de segurança internas.
- **Plano pago:** termina na hora. O período pago **não é devolvido automaticamente**;
  o cartão e a página mandam falar com o suporte antes, se quiser reembolso.
- **No aparelho:** depois da exclusão saem todas as chaves `endodirect_v1_*` e a sessão,
  e a página recarrega no login com o aviso "Sua conta foi excluída".
- **Política de privacidade e Termos** atualizados em 19/10: retenção e exclusão, login
  com Google ou e-mail e senha, fim do Premium e "não é dispositivo médico".

### 2. Sem preço, "assine" nem checkout dentro do app

- **Como o app se identifica** (`APP_LOJA`, no `<head>` do `index.html`):
  - `?app=android` ou `?app=ios` no endereço de abertura;
  - a marca na aba (sessionStorage), que sobrevive ao login com Google;
  - o referrer `android-app://`;
  - o Capacitor ou `EndodirectApp/<versão> (android|ios)` no user agent;
  - a marca do aparelho (localStorage), só em janela de app (display-mode standalone).
  O app do Android roda no Chrome e divide o armazenamento com o site; sem essa trava,
  o site no navegador esconderia os preços de quem quer assinar.
- ⚠️ **Na hora de empacotar:**
  - Android (Bubblewrap/PWABuilder): URL de abertura
    `https://www.endodirect.com.br/?app=android`;
  - iPhone (Capacitor): `server.url` `https://www.endodirect.com.br/?app=ios` e
    `appendUserAgent: 'EndodirectApp/1.0 (ios)'`.
- **O que muda no app** (no site, nada):
  - a landing some, e o app abre direto no login;
  - a tela de pacotes, o checkout e a janela de degustação não abrem;
  - os botões de pacotes e upgrade somem;
  - os bloqueios e avisos dizem o que aconteceu sem mandar assinar ("Este conteúdo não
    está liberado na sua conta").
  - Toda porta para a compra passa por `showAssineScreen`, que no app vira esse aviso.
- **A/B em Chromium** (`scratchpad/app-lojas-navegador/check.js`), app em degustação:
  | | main | branch |
  |---|---|---|
  | painéis com texto de compra (de 26) | 26 | 0 |
  | tela de pacotes abre | sim | não |
  | landing de preços sem sessão | sim | não |
  No site, a barra e o "Assinar agora" do perfil continuam nos dois lados.
- ⚠️ **Para o professor:** aviso ou comunicado com "assine" ou preço aparece também no
  app. Promoção vai por e-mail, Instagram e WhatsApp, fora do app.

### 3. Conta de revisão das lojas

- **E-mail:** `revisao@endodirect.com.br`. Gold + EndoTEEM, fora das contagens de aluno
  (as 5 cópias da régua de contas de teste) e sem o limite de 2 aparelhos.
  - A isenção do limite fica no cliente (`contaRevisaoLojas`), porque é ele que derruba.
  - A função do banco (`endodirect_session_claim`) tem DELETE no corpo e cairia na trava
    do conector.
- **Senha:** painel do professor → **Estudantes** → cartão **Conta de revisão das lojas**
  → "Gerar a senha".
  - A senha nasce no servidor (`kind:'conta_revisao'`, `lib/conta-revisao.js`) e só
    aparece ali, na hora.
  - A conta é criada na primeira vez.
  - Gerar outra faz a anterior parar de funcionar.
- Se o revisor testar a exclusão e apagar a conta, basta gerar a senha de novo: a conta
  é recriada.

### Testes

- `scripts/test-excluir-conta.js` (no CI): ordem dos passos, assinatura que não cancela,
  falha no meio, professor recusado, identidade só pelo token e conta de revisão.
  20 de 20 mutantes pegos (`mutantes-exclusao.js`, pasta da sessão).
- `endodirect_exclusao` testada numa transação desfeita no fim: aluno falso com acesso
  pago, assinatura em atraso, cortesia, dois aparelhos de push, optin, ticket e registro
  de degustação.
- Harness em Chromium com 44 conferências (site e app; exclusão com sucesso, com falha e
  sem confirmar; link direto; aparelhos; cartão do professor; página pública no celular).
- ✅ **Produção, 19/10, 01h20 UTC** (PR #889, `sw.js` v318):
  - `/excluir-conta`, `/privacidade` e `/termos` no ar;
  - sem sessão, as duas ações respondem 401, mesmo com um `p_user_id` no corpo;
  - **ponta a ponta com uma conta descartável** (`teste.exclusao@endodirect.com.br`), criada no
    banco com progresso, aparelho, notificação, newsletter (e-mail em maiúsculas), ticket,
    cortesia e registro de degustação. A senha e o token ficaram só em arquivo, apagado no fim.
    - Com o token dela, a conta de revisão deu 401 e "excluir" sem a palavra deu 400.
    - A exclusão deu 200 em 3,8 s.
    - **Tudo saiu do banco.** As contagens gerais voltaram ao que eram: 160 usuários,
      57 acessos e 130 chaves no registro.
    - Depois disso, o token antigo dá `user_not_found`, o login com a senha é recusado e a
      API recusa o token.
    - O save do painel às 01:24 UTC (Prof. Rafael), depois da exclusão, não devolveu a
      chave apagada de `trial_emails`. Confirma em produção que o cliente copia essa chave
      do servidor ao gravar.

## 📱 Projeto do app do iPhone (30/10/2026)

Pasta `app-ios/` do repositório (fora do site publicado: `.vercelignore`). Roteiro do
Mac e do App Store Connect em `app-ios/LEIA-ME.md`.

- **Capacitor 8.5.3 com Swift Package Manager** (sem CocoaPods). O `npx cap add ios`
  roda no Linux; compilar e assinar só no Mac. Plugins: `@capacitor/app` 8.1.2 e
  `@capacitor/browser` 8.0.5, versões fixas no `package.json`.
- **Configuração:** `appId` `br.com.endodirect.app`; `server.url`
  `https://www.endodirect.com.br/?app=ios`; `server.errorPath` `erro.html` (página
  "Sem conexão" local); `ios.appendUserAgent` `EndodirectApp/1.0 (ios)`; fundo #0b1325.
- **Projeto:** iOS 15+, iPhone e iPad, versão 1.0 (build 1), assinatura automática
  sem Team (o professor escolhe a conta da empresa no Xcode).
- **Info.plist:** esquema `br.com.endodirect.app` (volta do login), pt-BR e
  `ITSAppUsesNonExemptEncryption = false`.
- **Ícone e abertura:** 1024×1024 sem transparência, ampliado do `icons/icon-512.png`
  (provisório: o `Icone - MD.png` da raiz é só o "D", não o ícone inteiro); abertura
  2732×2732 com a marca no centro.
- **Login com Google no app** (`index.html`): no iPhone, `startGoogleOAuth` pede ao
  Supabase só o endereço (`skipBrowserRedirect`, retorno
  `br.com.endodirect.app://login-callback`) e abre no navegador do sistema
  (SFSafariViewController, plugin Browser). O `appUrlOpen` do plugin App entrega a
  volta; `tratarRetornoLoginApp` lê os tokens do "#", faz `setSession` (o `SIGNED_IN`
  segue o caminho de sempre), libera o `loggingOut` e fecha a folha. O site e o
  Android não mudam.
  - **Por que SFSafariViewController e não ASWebAuthenticationSession** (o plano de
    18/10): o plugin oficial já compilado, sem Swift próprio que eu não consigo
    compilar aqui. É o padrão da documentação do Supabase (implícito + `setSession`).
    Custo: o iPhone pode perguntar "Abrir no Endodirect?" na volta. A troca fica para
    depois do Team ID.
  - **A página vem do site, sem `@capacitor/core`:** o app injeta os plugins em
    `window.Capacitor.Plugins` (não há `registerPlugin` na ponte nativa).
  - **O evento de volta não se perde:** o plugin App guarda o `appUrlOpen` até alguém
    ouvir (`retainUntilConsumed`). Por isso não uso `getLaunchUrl`, que devolveria o
    mesmo endereço velho a cada recarga e poderia relogar depois de um "Sair".
  - **Supabase:** `br.com.endodirect.app://login-callback` nas Redirect URLs, posto pelo
    professor em 30/10, 23h06 de Brasília (a ferramenta do Supabase não mexe na
    configuração do Auth). **Conferido em 31/10, 02h08 UTC:** chamei
    `/auth/v1/authorize?provider=google` cinco vezes e li `auth.flow_state.referrer`.
    Os três pedidos com o retorno do app ficaram com
    `br.com.endodirect.app://login-callback`; os dois com um app inventado
    (`br.com.outro.app://…`) caíram no Site URL. O Supabase confere a lista já no
    `authorize` e guarda o retorno ali; o `redirect_to` que ele repassa ao Google é o
    pedido cru e não serve de prova.
- **Testes:** `scripts/test-login-google-app-ios.js` no CI (site, Android e iPhone sem
  o plugin no redirect de sempre; iPhone abre o navegador; leitura do retorno; sessão
  uma vez só; Info.plist, config, plugins e `.vercelignore` combinando). 9 de 9 mutantes
  pegos. A/B no Chromium com o supabase-js real (2.118.0, servido localmente porque o
  CDN é bloqueado aqui): o site leva ao mesmo endereço de antes; no iPhone simulado o
  login abre no navegador, a janela do app não navega e os retornos com erro e com
  token inválido aparecem na tela de login, sem erro de JS.
- ✅ **Produção, 30/10, 21h32 UTC** (PR #926, `sw.js` v327): o `index.html` servido traz
  o retorno do app e o ouvinte ligado no carregamento, o botão da faixa corrigido e
  nenhum `onclick="showLoginScreen()"`; `app-ios/LEIA-ME.md`, `capacitor.config.json`
  e `Info.plist` respondem 404 no site.

## Caminho técnico

- **Android:** Trusted Web Activity pelo PWABuilder (Bubblewrap), apontando para
  `https://www.endodirect.com.br` (o domínio sem www redireciona com 307).
  - O `manifest.webmanifest` já atende.
  - Falta `/.well-known/assetlinks.json` no www, com o SHA-256 da **chave de assinatura
    do app** (Play Console › Integridade do app).
  - A URL de abertura do pacote é `https://www.endodirect.com.br/?app=android` (ver
    "Sem preço, 'assine' nem checkout").
  - As notificações da web continuam funcionando, porque o app roda no Chrome.
  - Desde 31/08/2026 o pacote precisa mirar a API 36.
- **iPhone:** Capacitor 8 (Xcode 26 / SDK do iOS 26).
  - Diretriz 4.2: o app não pode ser só o site embrulhado.
  - O web push não funciona dentro de app no iPhone: precisa de notificação nativa
    (APNs) e do envio pelo servidor.
  - O Google bloqueia login dentro de WebView: o login do Google abre no navegador do
    sistema (por ora SFSafariViewController; ver "Projeto do app do iPhone"), com
    retorno por deep link.
- **As duas lojas exigem:**
  - exclusão de conta dentro do app, que apaga os dados, mais uma página pública;
  - política de privacidade dentro do app;
  - conta de demonstração para o revisor.
  - O Google exige ainda a declaração de app de saúde e o aviso de que o app "não é
    dispositivo médico".
- **Conta de empresa:** com prescrição (Memed), CRM e CPF, é app de saúde. O Google
  exige conta de organização para app de saúde, e a Apple pede pessoa jurídica (5.1.1(ix)).
  Daí o CNPJ, o D-U-N-S (grátis) e as contas Google (US$ 25 uma vez) e Apple (US$ 99/ano).
- **Prazos (estimativa):** Android em 1 a 3 semanas depois da conta pronta; iPhone em 4 a
  10 semanas.

## Ainda não confirmado

- Se só o conteúdo educacional já obrigaria conta de organização no Google (com a
  prescrição, é muito provável).
- Se a Apple aprovaria app só de acesso, sem compra pela Apple, para esta plataforma.

Ver [[Pendências]] (seção do app) e [[Decisões]].
