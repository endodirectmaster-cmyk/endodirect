---
tags: [cofre, app, lojas]
atualizado: 2026-10-19
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
- **19/10:** ajustes da plataforma feitos (seção abaixo), autorizados pelo professor com
  *"Pode fazer tudo"*. Falta o `assetlinks.json`, que depende do Play Console.

## ✅ Ajustes da plataforma (19/10/2026)

### 1. Exclusão de conta dentro do app, mais a página pública

- **Onde:** Meu perfil → cartão **Excluir conta**. O aluno digita **EXCLUIR** e confirma.
  Só aparece para conta real de aluno: professor não se exclui por aqui, e a conta de
  demonstração local (`aluno@`) não tem o que apagar no servidor.
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
    sistema (ASWebAuthenticationSession), com retorno por deep link.
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
