---
tags: [cofre, seguranca, supabase]
atualizado: 2026-08-18
---

# Segurança e Exposição de Dados

## 🚨 OS BACKUPS ESTAVAM ABERTOS PARA O MUNDO — E NINGUÉM PRECISARIA HACKEAR (2026-08-18)

Pergunta do professor: *"Dos nossos alunos, tem que saber se alguém está tentando
hackerar/xeretar algo da nossa plataforma? Pra saber se tem algum DEV querendo
copiar a ideia."*

A resposta honesta não foi sobre alunos. **Duas tabelas de backup estavam legíveis
por qualquer visitante**, sem invasão nenhuma:

| tabela | estado | prova |
|---|---|---|
| `endodirect_global_state_backup` | RLS **desligada**, `SELECT` para `anon`, 57 MB | `HTTP 206`, `content-range: 0-0/14` |
| `endodirect_backup_diretriz` | RLS **desligada**, `SELECT` para `anon` | `HTTP 206`, `content-range: 0-0/8` |
| `endodirect_global_state` (viva) | RLS ligada, 4 políticas | `HTTP 200`, **0 registros** ✓ |

A última linha é o **controle**: prova que o método de teste funciona e que a RLS
faz o trabalho onde está ligada. Sem esse controle, um 206 nas duas primeiras não
provaria nada.

⚠️ **A chave `sb_publishable_...` vive no HTML da página** (linha 3443), e isso é
correto — Supabase é desenhado assim. **Quem protege é a RLS.** Onde ela não está,
a chave pública vira chave de leitura: um `GET` devolvia snapshots INTEIROS da
plataforma — 226 capítulos, banco de questões, mural, tudo.

⚠️⚠️ **E eu ajudei a piorar isso no dia anterior:** os snapshots dos três capítulos
que reescrevi em 17/08 foram gravados justamente em `endodirect_backup_diretriz`.
**Criar tabela de apoio sem RLS é criar porta.** Regra nova: *toda* tabela nova em
`public` nasce com `enable row level security` e sem grant para `anon`/
`authenticated` — backup nunca é conteúdo de cliente.

**Conserto:** RLS ligada nas duas + `revoke` em todas as sete tabelas de
backup/estágio. Reconferido de fora com a mesma requisição: `42501` nas quatro
testadas.

## 🐌 O CONSERTO ACHOU UM 500 EM PRODUÇÃO QUE NINGUÉM VIA (2026-08-18)

Ao verificar que o `revoke` não tinha quebrado o app, o controle acusou **HTTP 500
consistente** em `endodirect_public_content` — a RPC que alimenta a **vitrine e o
funil de aquisição**.

- **Não foi o revoke:** o código era `57014` (statement timeout), não `42501`.
- **Medido:** `16.137 ms`, 478.589 buffers. O `anon` tem `statement_timeout=3s` e o
  `authenticated`, 8 s → estourava para **todo mundo**.
- **Por que ninguém via:** o professor está sempre logado, e a rota do assinante é
  outra função (`endodirect_member_content`, medida em 253 ms — saudável).

⚠️ **A primeira hipótese estava errada, e medir salvou.** Suspeitei do
`order by md5(v::text)` sobre 4,7 MB de questões; medi e deu **55 ms**. A causa
real: a versão SQL referenciava `payload->'...'` ~15 vezes e o Postgres
**re-descomprime o jsonb a cada referência**.

**Conserto:** `plpgsql` lendo o payload **uma vez** para variável local.
**16.137 ms → 326 ms (49×)**, buffers 478.589 → 6.890 (69×). Antes de trocar,
provei que a saída é **byte a byte idêntica** — mesmo md5
(`071d77fabfaa79e46e9446e6b110886c`), 11 chaves, 0 divergências.

## 🔍 O QUE A TELEMETRIA REALMENTE DETECTA (medido em 2026-08-18)

**Aparelhos:** 160 registros, 102 contas, **máximo de 2 aparelhos por conta**,
média 1,57, **zero** contas com user-agent de script e zero sem user-agent. Não há
sinal de raspagem nem de senha compartilhada entre os alunos.

**Requisições (24 h):** 1.029 no total — 937 OK, 6 × 401 (rotina de sessão),
6 × 500 (o defeito acima). Nada com cara de sondagem: 27 caminhos distintos, todos
do próprio app.

⭐ **A telemetria PEGA acesso por script — ela me pegou.** As 19 requisições com
user-agent de ferramenta no período eram `curl/8.5.0` da rede *Anthropic, PBC*:
eu, testando a exposição. É a melhor prova de que o sinal funciona.

**O que o Cloudflare já entrega de graça e ninguém estava olhando:**
`request.cf.botManagement.ja3Hash`/`ja4` (assinatura TLS do cliente — um script
não consegue imitar a de um Chrome real), `clientTrustScore`, `asOrganization`
(rede — datacenter × operadora residencial) e país.

⚠️ **O limite honesto da vigilância:** o assinante legítimo recebe **1,86 MB de
conteúdo** numa única chamada, porque o app é assim. Quem quiser copiar o acervo
não precisa raspar — basta assinar, abrir o DevTools e salvar a resposta. **Nenhum
detector resolve isso**; o que protege é direito autoral e o fato de o valor estar
na curadoria contínua, não no arquivo estático.
