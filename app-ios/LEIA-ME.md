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

## 1. No Supabase (pode ser feito já)

Supabase → projeto Endodirect → **Authentication** → **URL Configuration** →
**Redirect URLs** → **Add URL**:

```
br.com.endodirect.app://login-callback
```

Sem esse endereço na lista, o Supabase devolve o login ao site e o aluno fica logado
dentro da folha do Safari, não no app. O site não muda com isso.

## 2. No Mac, depois que a Apple aprovar a conta

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

1. **Entrar com a Apple.** Como o app oferece o Google, a diretriz 4.8 exige também
   "Entrar com a Apple". É preciso criar o Services ID e a chave na conta da Apple e
   ligar o provedor Apple no Supabase. Sem isso a revisão deve recusar.
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
├── www/                    só a página offline (o app abre o site)
└── ios/App/                projeto do Xcode
```

`ios/App/App/public/` e `ios/App/App/capacitor.config.json` são gerados pelo
`npx cap sync ios` e não vão para o repositório.

O teste `scripts/test-login-google-app-ios.js` (no CI) confere que o endereço de volta
do login, o esquema no `Info.plist`, a configuração e os plugins continuam combinando.
