---
name: trilha-aula-emc
description: Monta a trilha completa de cada aula nova da Educação Médica Continuada (EMC) do Endodirect — tópicos "Nesta aula" (capítulos), resumo fiel aos slides e 8 questões próprias da aula — e grava em adm_cursos com backup e guarda. Use sempre que entrar aula nova na EMC, quando o professor pedir tópicos, resumo ou questões de uma aula, ou quando a checagem diária achar aula da EMC incompleta.
---

# Trilha da aula da EMC: tópicos, resumo e questões

Pedido do professor (14/11/2026), com print da aba Questões de uma aula da EMC que mostrava
questões do Banco sorteadas pela área (uma de TTGO numa aula de GLP-1 no DM1): *"deixar as
questões condizentes com os temas das aulas"*. E logo depois: *"Coloque isso como uma skill
sua, conforme novas aulas vão subindo para o curso de Educação Médica Continuada, acrescentar
também questões das respectivas aulas, assim como também os tópicos de cada aula"* e *"além das
questões, os resumos para as aulas da educação médica continuada"*.

Cada aula da EMC (`payload.adm_cursos[k]`, `curso: 'emc'`) tem três abas para o aluno:
▶ Aula (vídeo + "Nesta aula"), 📝 Resumo e 🧠 Questões. Esta skill preenche o DADO das três:

| Aba | Campo | Formato |
|---|---|---|
| Nesta aula | `caps` | `[{t: <segundo>, titulo: <texto>}]`, 6 a 12 tópicos |
| Resumo | `resumo` | texto com seções em CAIXA ALTA numa linha própria e itens "• " (ver §3) |
| Questões | `aulaQ` | 8 questões `{area, tema, stem, options{A,B,C,D}, answer, explanation}` |

Sem `aulaQ`, a aba Questões cai no Banco por área (`aulaQuestions`), que é o que o professor
reclamou. O EndoTEEM fica fora por ora (professor, 14/11: *"Por enquanto, não precisa fazer
questões para as aulas do Endoteem"*).

**Modelos (leia antes de escrever):** `adm_cursos[105]` (massa magra, 1ª aula, revista pelo
professor) e `adm_cursos[106]`/`[107]` (GLP-1 no DM1 e Metformina). Regras de registro no
`cofre/Decisões.md`, entradas "TRILHA DA 1ª AULA DE EMC" (02/09/2026) e a seguinte.

## 1. Achar o que falta

```sql
select x.i-1 as k, a->>'title' titulo, a->>'modulo' modulo, a->>'src' src,
       jsonb_array_length(coalesce(a->'caps','[]'::jsonb)) caps,
       length(coalesce(a->>'resumo','')) resumo_len, (a->>'resumoAuto') resumo_auto,
       jsonb_array_length(coalesce(a->'aulaQ','[]'::jsonb)) aulaq
from endodirect_global_state g, jsonb_array_elements(g.payload->'adm_cursos') with ordinality x(a,i)
where g.id='main' and a->>'curso'='emc'
  and (jsonb_array_length(coalesce(a->'caps','[]'::jsonb))=0
       or coalesce(a->>'resumo','')='' or a->>'resumoAuto'='true'
       or jsonb_array_length(coalesce(a->'aulaQ','[]'::jsonb))<8);
```

Nada faltando: termine aí, sem gravar e sem avisar. `resumoAuto: true` é o rascunho que o
painel gera ao publicar (só título, descrição e capítulos; não lê os slides): ele é refeito
aqui a partir dos slides e perde a marca.

## 2. Tópicos ("Nesta aula")

Siga a skill `capitulos-videoaula` (seções 2 e 3): `slides.sh` baixa o vídeo do Bunny, separa
os slides e faz o OCR; os tópicos saem da `tabela.txt`, com siglas e números conferidos no
quadro. Guarde a pasta: `slides.txt` é a base do resumo e das questões.

## 3. Resumo fiel aos slides

A lição de 08/11 (cofre): o resumo escrito só a partir do título e da literatura errou o que a
aula ensina (disse que não havia ensaio de tirzepatida no DM1, e havia). **O resumo sai dos
slides**, na ordem da aula, e a literatura só confere números.

- **Formato** (o que `resumoBlocksHTML` desenha): seções com o título em CAIXA ALTA numa linha
  só (`FUNDAMENTAÇÃO`, `DEFINIÇÕES`, `EVIDÊNCIA CLÍNICA`, `ESTRATIFICAÇÃO DE RISCO`, `CONDUTA`,
  `PERSPECTIVAS`, adaptando ao tema), subtítulo opcional numa linha simples, e itens começando
  por "• ". De 4.000 a 10.000 caracteres.
- **Registro impessoal**: sem metáfora, sem caixa alta de ênfase no meio da frase, sem emoji,
  sem "você". Rode `node scripts/checa-jargao.js <arquivo>` e corrija o que ele apontar.
- **Número só com fonte**: o que está no slide entra atribuído ao estudo do slide; confira por
  amostragem no PubMed (`mcp__PubMed__*`). Divergência entre slide e artigo: fica o do artigo
  e o professor é avisado. Resultado ainda sem publicação (ex.: congresso) entra atribuído à
  apresentação.

## 4. Oito questões próprias

Escritas a partir do resumo (e dos slides), uma ou duas por bloco da aula. Um agente escreve e
**outro, independente, revisa** antes de gravar (como na fase 2 das diretrizes e nas aulas
106/107):

- A–D, nível prova de título/residência, vinheta curta quando couber, **uma única correta**;
  a correta não é a mais longa nem a única diferente.
- **Gabarito 2×A, 2×B, 2×C, 2×D.**
- **Comentário**: por que a correta está certa e por que cada outra está errada, **por conteúdo
  — nunca "a alternativa C"**: a tela do aluno embaralha as alternativas das questões próprias
  a cada abertura (`renderAulaQuest` → `igShuffleMCQ` numa cópia); a revisão do professor e o
  `aulaQ` gravado ficam na ordem original.
- Mesmo registro do resumo; `checa-jargao.js` limpo; sem DOI/PMID no texto.
- `area` = `modulo` da aula; `tema` = o `tema` da aula (se vazio, um rótulo curto do assunto).
- O revisor **resolve cada questão antes de ler o gabarito** e só aprova se bater.

## 5. Gravar

Regras do projeto (`cofre/Dados e Supabase.md`):
1. **Backup**: `insert into endodirect_global_state_backup (id, payload, backed_up_at, motivo)
   select 'main-antes-trilha-emc-<data>', payload, now(), '<motivo>' from endodirect_global_state
   where id='main';` (sem `on conflict`: a tabela não tem chave única).
2. **Guarda**: `jsonb_set` no caminho exato (`{adm_cursos,<k>,caps}`, `{adm_cursos,<k>,resumo}`,
   `{adm_cursos,<k>,aulaQ}`), num `update` cujo `where` confere `title` e `src` da aula `k` e o
   estado lido (ex.: `aulaQ` vazio, md5 do resumo anterior). Ao refazer um rascunho automático,
   tire a marca: `#- '{adm_cursos,<k>,resumoAuto}'`.
3. **Verifique**: releia e compare md5 de cada campo com o arquivo local; o payload sem os
   campos gravados tem de ser idêntico ao backup.
4. O conector recusa SQL com a palavra DELETE (nem em comentário): use `#-` ou `jsonb_set`.
5. Conteúdo grande (resumo + 8 questões) pode ir por função temporária com token (sha256 no
   código, prazo, revogar o anon e apagar o token ao fim; DROP só com o professor no
   computador), como em `diretrizes-banco/fase2`.
6. Painel aberto: peça F5 ao professor antes de ele editar a mesma aula.

## 6. Avisar

Em português, tratando o professor por "o senhor": quais aulas ganharam tópicos, resumo e
questões, quantos de cada, e qualquer número do slide que divergiu do artigo. Atualize o cofre
(`cofre/Decisões.md` e `cofre/Pendências.md`) quando algo novo for aprendido.

**A checagem diária** ("Capítulos das videoaulas novas", 03:13 de Brasília) roda a consulta da
§1 junto com a da skill `capitulos-videoaula`: a aula da EMC que o professor sobe durante o dia
amanhece com tópicos, resumo e questões.
