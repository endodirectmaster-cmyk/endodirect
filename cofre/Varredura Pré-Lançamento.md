---
tags: [cofre, lancamento, qa]
atualizado: 2026-06-11
quando: domingo 2026-06-14 (lançamento geral segunda 2026-06-15)
---

# Varredura Pré-Lançamento — Endodirect

> **Como usar:** no domingo, abra uma sessão e peça *"roda a varredura pré-lançamento"*.
> Percorra os itens marcando ✅/❌. Para cada ❌, abrir correção (branch → PR → merge).
> Itens com **[bot]** o Claude consegue verificar via ferramentas (Vercel/Supabase/GitHub);
> itens com **[user]** precisam de você no navegador (não tenho acesso à UI).

## 0. Sanidade de deploy/infra [bot]
- [ ] `main` e o deploy de produção da Vercel no mesmo commit (e **READY**).
- [ ] `www.endodirect.com.br` e apex `endodirect.com.br` apontam para o deploy de produção; apex faz 307 → www.
- [ ] `index.html` servido = versão mais nova (cache de borda OK; headers `max-age=0, must-revalidate`).
- [ ] Crons ativos no `vercel.json`: newsletter (`30 10 * * *`) e healthcheck (`0 11 * * 1`).
- [ ] Variáveis de ambiente na Vercel presentes: `SUPABASE_*`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `PAGARME_*` (LIVE), `PAGARME_WEBHOOK_BASIC_USER/PASS`. (Memed: ver §6.)
- [ ] Sem erros no console do navegador na home/dashboard [user].

## 1. Pagamentos — pagar.me [bot+user]
- [ ] Healthcheck reconhece chave **LIVE** (não "modo teste").
- [ ] **Webhook responde 200** (reenviar um evento ou fazer compra de teste). Logs sem 401.
- [ ] **Cartão** — assinatura **mensal** Standard e Gold liberam o tier certo na hora.
- [ ] **Cartão** — plano **anual** Standard e Gold (1 ano) liberam o tier certo.
- [ ] **PIX** — paga → libera **sozinho** (auto-verify entra no dashboard, sem clicar).
- [ ] **Boleto** — gera o boleto (compensação libera depois).
- [ ] **Preço cobrado = preço mostrado** em todos os fluxos (mensal/anual, Standard/Gold).
- [ ] **Estorno/cancelamento** no pagar.me **revoga** o acesso (webhook).
- [ ] Nenhum dado de cartão é armazenado (só tokenização no pagar.me).

## 2. Autenticação / contas [user]
- [ ] **Cadastro** novo → e-mail de confirmação chega **do domínio** (`@endodirect.com.br`), branded.
- [ ] Confirmar e-mail → entra **direto no dashboard** (não cai na landing).
- [ ] **Esqueci minha senha** → link `/?reset=1` abre a tela de nova senha → login com a nova senha.
- [ ] **Login Google** (OAuth) funciona.
- [ ] **Limite de 2 dispositivos**: 3º acesso derruba o mais antigo.
- [ ] **Onboarding**: 4 perfis na ordem certa; campos por perfil (estudante: graduação+ano; médicos: residência+CRM); badge no topo (`USP · 5º ano`, "Médico(a) Residente", etc.). Janela aparece antes do dashboard.
- [ ] Trocar de conta no mesmo navegador **não vaza** dados/perfil entre contas.

## 3. Gating de pacotes / degustação [user]
- [ ] **Degustação** libera: Dashboard, Questões (banco 50), Flashcards (ver), Mapas (ver), Calculadoras, Podcasts, Cronograma, Mural (7 dias), Perfil, Suporte.
- [ ] **Degustação** trava: "Gerar com IA" (flashcards/mapas) 🔒; Simulado só **Provas** (IA/Misto off); 3 usos de trial em OSCE/Simulado/Prescrição/Chat.
- [ ] **Consultório (MEMED)**: só aparece para médicos (Residente/Endo/Outros), **oculto** para Estudante.
- [ ] **Prescrição Simulada**: disponível conforme plano (inclui estudante).
- [ ] **Standard**: tudo menos Prescrição Comentada + Curso Endo Essencial. **Gold**: tudo.
- [ ] **Landing × in-app × pós-checkout** 100% sincronizados (o que a landing promete = o que libera).

## 4. Funcionalidades / conteúdo [user]
- [ ] **Questões**: banco abre; geração por IA funciona (pago).
- [ ] **Flashcards**: 60 cards presentes; estudar; gerar por IA (pago).
- [ ] **Mapas Mentais**: 33 salvos abrem; gerar por IA (pago).
- [ ] **OSCE** (Simulador de Caso): conduz caso e dá nota/feedback.
- [ ] **Prescrição Simulada**: fluxo completo.
- [ ] **Consultório**: abas receituário/LME/exames/seguimento (e Memed, se configurado — §6).
- [ ] **Simulado Cronometrado**: inicia, cronometra, corrige.
- [ ] **Resumidor de artigos**, **Chat IA**: respondem.
- [ ] **Calculadoras**: amostragem (incl. TmP/GFR e escore-z estatura/idade) com valores corretos.
- [ ] **Cursos**, **Cronograma**, **Revisão (SM-2)**, **Podcasts**, **Caderno**, **Mural** abrem e funcionam.
- [ ] **Newsletter/Radar**: último envio chegou; rodapé com o texto novo.

## 5. Admin (professor) [user]
- [ ] Login admin; seções Analytics, Estudantes, Mural, Provas, Cursos, Conteúdo, Mapas, Chat, Perfil, Suporte.
- [ ] Publicar aviso no mural aparece para o aluno.
- [ ] Analytics mostra dados reais (UF de todos + cidade dos pagantes).

## 6. Pendências que podem bloquear o lançamento
- [ ] **Memed**: contrato assinado? `MEMED_API_KEY`/`MEMED_SECRET` configurados? Se **não**, decidir: lançar com Consultório/emissão em "em breve" ou esconder a emissão real. (Hoje 2026-06-11: pendente.)
- [ ] **Grupo 2 — 29 gabaritos ambíguos** revisados? (`gabaritos-suspeitos.md`.)
- [ ] **Supabase**: Confirm email ON; Custom SMTP (Resend) ON; Site URL + Redirect URLs (`/**`) corretos.

## 7. Pós-checagem
- [ ] Lista de ❌ corrigida (PRs mergeados) e re-deploy READY.
- [ ] Compra de teste de validação **estornada/cancelada** e acesso de teste **revogado** no banco.
- [ ] Tudo verde → ok para divulgação de segunda (2026-06-15).

---
### Nota sobre agendamento automático
Este ambiente é efêmero (sem `send_later`/scheduler), então o Claude **não dispara sozinho** no domingo.
Para automatizar de verdade, use os **agendamentos do Claude Code na web** (gatilho cron/agendado) apontando
para este repositório — veja https://code.claude.com/docs/en/claude-code-on-the-web. Sem isso, basta abrir
uma sessão no domingo e pedir "roda a varredura pré-lançamento".
