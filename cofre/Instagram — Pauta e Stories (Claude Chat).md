---
tags: [cofre, instagram]
atualizado: 2026-11-22
---

# Instagram: pauta do feed e stories (combinado na conversa do Claude Chat)

Origem: resumo que o professor colou em 22/11/2026 da conversa do Claude Chat, que produz e agenda o feed e os
stories (skill "carrossel-instagram-endodirect"). Aqui fica só o que afeta este repositório e as tarefas daqui.
Os IDs de pastas do Drive e de posts ficam na outra conversa: este repositório é público.

## Quem faz o quê
- **Claude Chat:** feed (3 posts por semana, terça, sexta e sábado às 19h; Reels educativo aos domingos), kits
  semanais de stories, roteiros e montagem dos Reels.
- **Claude Code (aqui):** a plataforma; a arte automática da Questão do Dia (gerada pelo painel do professor) e a
  tarefa diária que agenda no Metricool o story da Questão do Dia da plataforma às 18h, todo dia.
- **Regra de sincronia (professor, 22/11):** toda vez que algo for agendado, alterado ou excluído no Metricool,
  entregar ao professor um resumo em Markdown (data, hora, tipo, conteúdo, ID) para ele colar na outra conversa.

## Stories: divisão combinada em 22/11/2026 (vale desde 23/11)
Resumo da conversa do Instagram que o professor colou às 18h10 de 22/11 (substitui o "modelo misto" de 20/11 e a
proposta de questão às 11h + gabarito às 18h, que montei na mesma tarde e desfiz):
- **11h:** "Na prática clínica" (conversa do Instagram);
- **18h:** Questão do Dia da PLATAFORMA (Claude Code, tarefa diária), arte com "Gabarito na plataforma";
- **19h05:** story da capa nos dias de post (conversa do Instagram).
- Tudo automático, sem enquete. A conversa do Instagram não agenda mais questão nem gabarito.
- Semana de 23 a 29/11 (feito lá): as Questões do Dia das 11h viraram "Na prática clínica"; os gabaritos das 18h e as
  enquetes das 13h (23, 25 e 26/11) viraram rascunho. Rascunho não conta como horário ocupado para a tarefa daqui.
- Metricool: ao atualizar um post, o id muda e o uuid continua. Rodar getScheduledPosts antes de mexer.

## Regras de conteúdo combinadas lá que também valem aqui
- Endocrinopediatria é do professor Bruno, às segundas: não propor temas de pediatria.
- Fontes: só artigos publicados (PubMed/PMC) e livros; nunca portais de educação médica (concorrentes).
- Nome de medicamento em inglês (pelacarsen); "Na prática clínica" em vez de "Pontos para a prática";
  "diagnosticar" em vez de "reconhecer".
- Metricool: no máximo 10 imagens por carrossel pela API; figurinha só pelo app; música só em Reels, no
  agendamento. Plano Starter desde 22/11 (sem o teto de 20 publicações por mês).

## Estratégia (auditoria de 19/11, aprovada)
- Posts didáticos (diretriz, consenso, revisão prática) trazem quase todos os seguidores; estudos e posts da
  plataforma, quase nenhum. A partir de 15/12: 2 didáticos e no máximo 1 estudo ou notícia por semana; obesidade
  no máximo 1 vez por semana; título como pergunta clínica.
- Stories: cerca de 150 pessoas por story; o primeiro do dia e o da manhã rendem mais.
