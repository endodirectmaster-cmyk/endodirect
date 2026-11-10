# App do Endodirect para iPhone e iPad

O app abre o site (`https://www.endodirect.com.br/?app=ios`) numa janela nativa feita
com o Capacitor 8. Tudo o que muda no site chega ao app na hora, sem enviar versão nova
à Apple. Só mudanças **nesta pasta** (ícone, nome, plugins, permissões) pedem um novo
envio.

## O que já está pronto

| Peça | Onde |
|---|---|
| Projeto do Xcode (Capacitor 8, Swift Package Manager, sem CocoaPods) | `ios/App/App.xcodeproj` |
| Identificador `br.com.endodirect.app`, versão 1.0 (build 1), iOS 15 ou mais novo, iPhone e iPad | Xcode → target **App** |
| Endereço próprio `br.com.endodirect.app://`, por onde o login volta ao app | `ios/App/App/Info.plist` |
| Idioma pt-BR e criptografia isenta (`ITSAppUsesNonExemptEncryption = false`) | `ios/App/App/Info.plist` |
| Ícone 1024×1024 e tela de abertura na cor da marca (#0b1325) | `ios/App/App/Assets.xcassets` |
| Página "Sem conexão" quando o aparelho está sem internet | `www/erro.html` |
| Login com Google pelo navegador do sistema, com volta ao app | `index.html` do site (`startGoogleOAuth`, `tratarRetornoLoginApp`) |
| Sem preço, checkout nem "assine" dentro do app | site (`APP_LOJA`) |
| Exclusão de conta no Meu perfil e página pública `/excluir-conta` | site |
| Conta de revisão para a Apple (`revisao@endodirect.com.br`) | painel do professor → Estudantes → Conta de revisão das lojas |

**Por que o Google abre fora do app.** O Google recusa login dentro da janela embutida
de um app (erro `disallowed_useragent`). No iPhone, o botão "Continuar com o Google"
abre o login numa folha do Safari por cima do app. Quando o aluno termina, o Supabase
manda o login para `br.com.endodirect.app://login-callback`, o app recebe, a folha
fecha e o aluno entra. O iPhone pode perguntar "Abrir no Endodirect?" nessa volta;
basta tocar em **Abrir**.

## 1. No Supabase ✅ feito em 30/10/2026

Supabase → projeto Endodirect → **Authentication** → **URL Configuration** →
**Redirect URLs** → **Add URL**:

```
br.com.endodirect.app://login-callback
```

Sem esse endereço na lista, o Supabase devolve o login ao site e o aluno fica logado
dentro da folha do Safari, não no app. O site não muda com isso. Não tire esse
endereço da lista.

## 2. Pelo GitHub, sem Mac (caminho escolhido em 10/11/2026)

O MacBook Air do professor (2019, Intel, macOS Sonoma) não roda o Xcode 26, que a App
Store exige desde 28/04/2026. A compilação e o envio acontecem num Mac do GitHub, pela
rotina `.github/workflows/app-ios.yml` (Actions → **App iOS** → **Run workflow**):

- **modo `compilar`:** compila sem assinar, só para conferir o projeto. Não precisa de
  nenhum segredo;
- **modo `testflight`:** assina pela nuvem da Apple (o certificado fica com a Apple) e
  envia o build ao App Store Connect. O número do build sobe sozinho a cada execução.

Só roda quando alguém dispara: push e pull request não acionam nada. O repositório é
público; os segredos ficam guardados no GitHub e não aparecem nos logs.

**O que o professor faz uma vez, no navegador, depois do e-mail de ativação da Apple**
(sempre com a Conta Apple `contato@endodirect.com.br`):

1. **Team ID:** developer.apple.com/account → **Membership details** → Team ID (10
   caracteres).
2. **Identificador do app:** developer.apple.com/account/resources/identifiers → **+** →
   **App IDs** → **App** → Description `Endodirect`, Bundle ID **Explicit**
   `br.com.endodirect.app` → em Capabilities, marque **Sign In with Apple** → Continue →
   Register.
3. **O app no App Store Connect:** como na etapa 3 abaixo (Apps → + → Novo app).
4. **Chave da API:** appstoreconnect.apple.com → **Usuários e acesso** → **Integrações**
   → **API do App Store Connect** → **Chaves da equipe**. Se aparecer "Solicitar
   acesso", só o titular solicita, e a liberação é imediata. Depois, **+**: nome
   `GitHub Actions`, acesso **Admin** (a assinatura pela nuvem recusa papel menor) →
   Gerar. Anote o **Issuer ID** (no alto da página) e o **Key ID**, e clique em
   **Baixar** a chave (arquivo `AuthKey_XXXX.p8`). Ela só pode ser baixada uma vez.
5. **Segredos no GitHub:** github.com/endodirectmaster-cmyk/endodirect → **Settings** →
   **Secrets and variables** → **Actions** → **New repository secret**, um de cada vez:

   | Nome | Valor |
   |---|---|
   | `APPLE_TEAM_ID` | o Team ID |
   | `ASC_KEY_ID` | o Key ID |
   | `ASC_ISSUER_ID` | o Issuer ID |
   | `ASC_KEY_P8` | o conteúdo inteiro do `.p8` (abra no TextEdit e cole tudo, da linha `-----BEGIN PRIVATE KEY-----` à `-----END PRIVATE KEY-----`) |

   A chave não passa por mensagem nem pelo Claude. Depois de colada, guarde o `.p8`
   em lugar seguro ou apague (se precisar, gera-se outra e revoga-se esta).
6. **Primeiro envio:** Actions → **App iOS** → **Run workflow** → modo `testflight`.
   Leva uns 15 minutos. Se a Apple recusar a assinatura, o log diz o motivo.
7. **No iPhone:** instale o app **TestFlight** (App Store). No App Store Connect → app →
   **TestFlight** → **Testes internos** → adicione o próprio e-mail. O convite chega e o
   app instala pelo TestFlight.

## 2b. No Mac (alternativa, se um dia houver um Mac com chip da Apple)

Precisa de:
- **Xcode** na versão mais recente (App Store do Mac). A Apple só aceita envio feito
  com o SDK atual;
- **Node.js 22** ou mais novo (nodejs.org, versão LTS).

No Terminal, dentro da pasta do repositório:

```bash
cd app-ios
npm install          # baixa o Capacitor e os plugins (o Xcode os lê de node_modules)
npx cap sync ios     # copia a configuração e a página offline para o projeto
npx cap open ios     # abre o projeto no Xcode
```

Rode `npm install` e `npx cap sync ios` de novo sempre que esta pasta mudar.

No Xcode:
1. Clique em **App** (o projeto, no topo da lista à esquerda) → target **App** →
   aba **Signing & Capabilities**.
2. Deixe marcado **Automatically manage signing** e escolha em **Team** a conta da
   empresa (ENDODIRECT CURSOS EM ENDOCRINOLOGIA E METABOLOGIA LTDA).
3. Escolha um simulador de iPhone no alto da janela e clique em ▶. Confira:
   - o app abre direto no login, sem preços;
   - o login com e-mail e senha;
   - o login com Google (depois do passo 1);
   - sair e entrar de novo;
   - com o Mac sem internet, a página "Sem conexão".
4. No iPhone de verdade: ligue pelo cabo, escolha o aparelho no alto e clique em ▶. Na
   primeira vez, o iPhone pede o **Modo de Desenvolvedor** (Ajustes → Privacidade e
   Segurança).
5. Para enviar à Apple: **Product → Archive** → **Distribute App** → **App Store
   Connect** → **Upload**. O envio aparece no TestFlight para testar no seu iPhone
   antes da revisão.

A cada novo envio, aumente o **Build** (target App → General). A **Version** só muda
quando quiser mostrar um número novo na loja.

## 3. No App Store Connect (appstoreconnect.apple.com)

- **Apps → + → Novo app:** iOS, nome "Endodirect", idioma principal Português (Brasil),
  bundle ID `br.com.endodirect.app`, SKU `endodirect-ios`.
- **Preço:** gratuito. A assinatura é feita só no site.
- **Política de privacidade:** `https://www.endodirect.com.br/privacidade.html`.
- **Capturas de tela:** iPhone 6,9" **e** iPad 13", porque o app vale para os dois.
  Se preferir lançar só no iPhone, me avise para tirar o iPad do projeto.
- **Informações para a revisão:** e-mail `revisao@endodirect.com.br` e a senha gerada
  na hora no painel do professor. Gerar outra senha derruba a anterior.
- **Privacidade do app:** responder com o que a política de privacidade já declara.

## 4. O que falta e depende da conta da Apple

1. **Entrar com a Apple: código pronto (10/11/2026).** Como o app oferece o Google, a
   diretriz 4.8 exige também "Entrar com a Apple". É **nativo**: a folha da Apple (com
   Face ID) abre pelo plugin do próprio app (`ios/App/App/AppleSignInPlugin.swift`,
   registrado em `AppViewController.swift`), e o site troca o token por sessão no
   Supabase (`startAppleSignIn` no `index.html`). O botão "Continuar com a Apple" só
   aparece no app do iPhone. Não usa Services ID nem chave: isso só seria preciso para o
   login com a Apple no site, que a Apple não exige. Falta, do professor:
   - no identificador do app (etapa 2, passo 2), a capability **Sign In with Apple**
     marcada;
   - no **Supabase** → Authentication → **Sign In / Providers** → **Apple** → ligar
     (Enable), em **Client IDs** pôr `br.com.endodirect.app`, deixar o campo da chave
     secreta em branco e salvar;
   - testar no iPhone pelo TestFlight.
   Pendente para antes da revisão: ao excluir a conta, revogar o token da Apple (a Apple
   recomenda a API REST dela; exige uma chave de Sign in with Apple no servidor).
2. **Notificações (APNs).** As notificações do site não funcionam dentro de app no
   iPhone. Precisam da chave APNs da conta e do envio pelo servidor.
3. **Sem a pergunta "Abrir no Endodirect?"** (opcional). Trocar a folha do Safari pela
   sessão de login da Apple (ASWebAuthenticationSession) ou por link universal. Os
   dois precisam do Team ID.
4. **Ícone em alta.** O ícone atual foi ampliado do de 512 px. Se o designer tiver o
   original em 1024×1024 (sem transparência), basta trocar
   `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.

## Riscos na revisão da Apple

- **Diretriz 4.2 (funcionalidade mínima).** App que é só o site embrulhado pode ser
  recusado. A plataforma tem banco de questões, flashcards, simulados e calculadoras;
  login nativo, página offline e notificações ajudam. A própria documentação do
  Capacitor avisa que abrir o site remoto (`server.url`) "não é para produção". Se a
  Apple recusar por isso, a saída é empacotar o site dentro do app.
- **Diretriz 3.1.3(b) (compra fora da Apple).** O app só dá acesso: não vende nada
  nem leva a pagar no site. Se a Apple exigir a compra pelo app, as saídas estão no
  cofre (`cofre/App nas Lojas.md`).

## Arquivos

```
app-ios/
├── package.json            Capacitor 8.5.3 + plugins App e Browser (versões fixas)
├── capacitor.config.json   endereço do site, cor de fundo, marca no user agent
├── ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme
│                           esquema compartilhado (o GitHub arquiva por ele)
├── www/                    só a página offline (o app abre o site)
└── ios/App/                projeto do Xcode
```

`ios/App/App/public/` e `ios/App/App/capacitor.config.json` são gerados pelo
`npx cap sync ios` e não vão para o repositório.

O teste `scripts/test-login-google-app-ios.js` (no CI) confere que o endereço de volta
do login, o esquema no `Info.plist`, a configuração e os plugins continuam combinando.
