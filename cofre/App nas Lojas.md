---
tags: [cofre, app, lojas]
atualizado: 2026-10-18
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

## Caminho técnico

- **Android:** Trusted Web Activity pelo PWABuilder (Bubblewrap), apontando para
  `https://www.endodirect.com.br` (o domínio sem www redireciona com 307).
  - O `manifest.webmanifest` já atende.
  - Falta `/.well-known/assetlinks.json` no www, com o SHA-256 da **chave de assinatura
    do app** (Play Console › Integridade do app).
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
