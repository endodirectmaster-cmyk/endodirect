# E-mails de autenticação do Endodirect (Supabase)

Templates com a identidade do Endodirect (PT-BR) para os e-mails transacionais
de autenticação, e a configuração de remetente próprio. O objetivo é que o aluno
receba e-mails **de `@endodirect.com.br`**, reconhecíveis e confiáveis — em vez do
remetente genérico padrão do Supabase (`noreply@mail.app.supabase.io`).

> Estes arquivos são a **fonte versionada**. A aplicação é manual no painel do
> Supabase (Authentication → Emails), pois a config de Auth não é alterável por SQL.

## 1. Remetente próprio — Custom SMTP (Resend)

Supabase → **Authentication → Emails → SMTP Settings** → **Enable Custom SMTP**:

| Campo        | Valor                                |
| ------------ | ------------------------------------ |
| Sender email | `nao-responda@endodirect.com.br`     |
| Sender name  | `Endodirect`                         |
| Host         | `smtp.resend.com`                    |
| Port         | `465`                                |
| Username     | `resend`                             |
| Password     | uma API key do Resend (`re_…`, a mesma do `RESEND_API_KEY`) |

- O domínio `endodirect.com.br` já está verificado no Resend (a newsletter usa).
- **Nunca** commitar a API key — ela vai só no campo do painel.
- Sem Custom SMTP, o Supabase limita os e-mails (~2–4/h, apenas para teste).

## 2. Templates

Supabase → **Authentication → Emails → Templates**:

| Template (Supabase) | Arquivo                | Assunto sugerido                        |
| ------------------- | ---------------------- | --------------------------------------- |
| Confirm signup      | `confirm-signup.html`  | `Confirme seu e-mail · Endodirect`      |
| Reset password      | `reset-password.html`  | `Definir sua senha · Endodirect`        |

Cole o conteúdo do arquivo no corpo do template e ajuste o **Subject**.
Variável usada: `{{ .ConfirmationURL }}` (link de ação gerado pelo Supabase).

A mesma estética pode ser replicada para Magic Link, Invite e Change Email se/quando forem usados.
