---
tags: [cofre, app, lojas]
atualizado: 2026-10-31
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
