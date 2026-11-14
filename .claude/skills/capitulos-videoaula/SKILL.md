---
name: capitulos-videoaula
description: Lê os slides de uma videoaula do Endodirect e grava os capítulos "Nesta aula" (minutagem em tópicos), nas videoaulas dos Resumos (diretrizes[i].videos[j].caps) e nas aulas da Educação Médica Continuada (adm_cursos[k].caps). Use sempre que entrar videoaula nova, quando o professor pedir capítulos ou minutagem, ou quando a checagem diária achar vídeo sem capítulos.
---

# Capítulos das videoaulas ("Nesta aula")

Pedido do professor (09/11/2026): *"Nas videoaulas que estão contidas nos resumos, deixa do
modo igual a da educação médica continuada, com a minutagem em tópicos. Já faz isso nas
videoaulas que já estão lá nos resumos e, consequentemente, também as próximas que serão
introduzidas na plataforma. Coloca isso como uma skill sua."*

O aluno vê, embaixo do vídeo, a lista "Nesta aula": número, título e minuto de cada tópico.
Um toque salta o vídeo para ali, e o tópico em curso fica aceso. A tela já existe nos dois
lugares (`aulaCapsHTML` no player da EMC; `dirVideoCapsHTML` nos cartões dos Resumos). O
trabalho desta skill é o DADO: `caps: [{t: <segundo>, titulo: <texto>}]` no objeto do vídeo.

## 1. Achar o que falta

```sql
-- Resumos: vídeos sem capítulos
select d.ord-1 as i, v.vord-1 as j, d.item->>'sub' sub, d.item->>'tema' tema,
       v.vid->>'titulo' titulo, v.vid->>'src' src, v.vid->>'dur' dur
from endodirect_global_state g,
     jsonb_array_elements(g.payload->'diretrizes') with ordinality d(item,ord),
     jsonb_array_elements(coalesce(d.item->'videos','[]'::jsonb)) with ordinality v(vid,vord)
where g.id='main' and jsonb_array_length(coalesce(v.vid->'caps','[]'::jsonb))=0;

-- EMC: aulas sem capítulos
select x.i-1 as k, a->>'title' titulo, a->>'src' src
from endodirect_global_state g, jsonb_array_elements(g.payload->'adm_cursos') with ordinality x(a,i)
where g.id='main' and a->>'curso'='emc' and jsonb_array_length(coalesce(a->'caps','[]'::jsonb))=0;
```

Nada faltando: termine aí, sem gravar nada e sem avisar ninguém.

## 2. Ler os slides

```bash
# uma vez por máquina (o ambiente não traz o pacote):
command -v tesseract >/dev/null || apt-get install -y tesseract-ocr tesseract-ocr-por ffmpeg
.claude/skills/capitulos-videoaula/slides.sh "<src>" "<scratchpad>/caps/<i>-<j>"
```

`slides.sh` baixa o vídeo, guarda um quadro a cada troca de slide, lê cada quadro com o
tesseract e escreve:
- `tabela.txt`: `m:ss  NNNs  sobretítulo | título` a cada troca de slide (o mapa para os capítulos; `NNN` é o segundo que vai em `t`);
- `slides.txt`: o texto inteiro de cada slide, para conferir um título ilegível.

Leva cerca de 30 s por vídeo de 15 min. Aceita o `.mp4` do Storage (Resumos) e o
`playlist.m3u8` do Bunny (EMC).

Armadilhas já pagas:
- O ffmpeg daqui não usa o proxy: o download é sempre por `curl` (o script já faz).
- O CDN do Bunny responde 403 sem `Referer: https://www.endodirect.com.br/` (o script já manda).
- Sem `OMP_THREAD_LIMIT=1`, os tesseracts em paralelo ficam ~1.000× mais lentos.
- O corte de cena tem de ser baixo (`scene > 0.004`, 2 quadros/s); com 0.10 só o 1º quadro passa.
- Quadro de transição (dois slides sobrepostos) sai com texto embaralhado e o mesmo minuto da
  linha seguinte. O capítulo começa nesse primeiro quadro.

## 3. Montar os capítulos

Siga o modelo das aulas da EMC (`adm_cursos`, curso `emc`, já com capítulos):
- **De 6 a 12 tópicos.** Um vídeo de 15 min tem de 15 a 20 slides. Junte os slides
  vizinhos do mesmo assunto, por exemplo "Brasil: Vigitel" e "Brasil: medidas aferidas" em
  "Dados brasileiros". Não abra um tópico por slide.
- **O 1º tópico é o 1º slide de conteúdo.** A capa ("VIDEOAULA", nome do professor) não entra.
- **O minuto é o do 1º quadro em que o novo título aparece**, em segundos inteiros (`t`).
- **O título vem do slide e é corrigido à mão.** O OCR troca letras ("Epidgatiologia"):
  confira em `slides.txt` ou no quadro (`s_NNN.jpg`). Use título curto e nominal, em
  português, sem emoji e sem caixa alta.
- **Nome de estudo e número só depois de olhar o quadro.** O OCR troca dígitos: leu
  "SURMOUNT-5" onde o slide diz SURMOUNT-3, e "COR-T" onde diz COR-BMOD. Recorte o
  cabeçalho (`ffmpeg -i s_NNN.jpg -vf "crop=iw:ih*0.22:0:0,scale=960:-1" cab.jpg`) e leia a
  imagem antes de gravar qualquer sigla de ensaio, dose ou ano.
- **Se houver slide "Roteiro da aula", use-o.** Ele lista os blocos que o professor
  planejou e serve de guia para agrupar os slides.
- O último tópico costuma ser "Resumo" ou "Mensagens para a prática". Ele entra.
- Em ordem crescente de `t`, sem dois tópicos no mesmo segundo.

## 4. Gravar

Regras do projeto para escrever no banco (ver `cofre/Dados e Supabase.md`):
1. **Backup** antes de tudo: `insert into endodirect_global_state_backup (id, payload,
   backed_up_at, motivo) select 'main-antes-capitulos-<data>', payload, now(), '<motivo>'
   from endodirect_global_state where id='main';`. O insert é simples: a tabela não tem
   chave única, então `on conflict` falha.
2. **Guarda:** grave cada vídeo com `jsonb_set` no caminho exato
   (`{diretrizes,<i>,videos,<j>,caps}` ou `{adm_cursos,<k>,caps}`), dentro de um `update`
   cujo `where` confere o `src` e o `titulo` daquele caminho. Assim, se a lista mudou de
   ordem desde a consulta, nada é gravado. Grave numa transação só e confira a contagem de
   linhas afetadas.
3. **Verifique** relendo os `caps` gravados, e confirme que o resto do payload não mudou
   (md5 do payload sem os `caps` = md5 do backup sem os `caps`).
4. O conector do Supabase recusa SQL que contenha a palavra DELETE: use `#-` ou
   `jsonb_set`, nunca essa palavra, nem em comentário.
5. Se o professor estiver com o painel aberto, peça F5 antes de ele editar o mesmo
   capítulo. O merge do painel adota a versão do servidor em item que ele não tocou; se ele
   tocou, fica a dele e o painel avisa do conflito.

## 5. Avisar

Responda ao professor em português, tratando-o por "o senhor": quantos vídeos ganharam
capítulos e quantos tópicos cada um. Atualize o cofre (`cofre/Videoaulas dos Resumos.md`)
só se algo novo foi aprendido. A checagem diária automática não precisa avisar quando não
há vídeo novo.

**Aula da EMC:** além dos capítulos, a aula ganha resumo fiel aos slides e 8 questões próprias:
siga a skill `trilha-aula-emc` (pedido do professor de 14/11/2026).

**A checagem diária** é a tarefa agendada "Capítulos das videoaulas novas" (todo dia às
03:13, horário de Brasília). Ela roda as consultas da seção 1 e, se achar vídeo sem
capítulos, segue esta skill. O vídeo que o professor sobe durante o dia amanhece com
"Nesta aula".

## O professor também pode editar à mão

No painel, em Resumos, cada vídeo tem o campo "Capítulos ("Nesta aula")": uma linha por
tópico, `02:45 Título`, aceitando o formato da aba Chapters do Bunny (`00:02:45 to 00:12:59
Título`). Nas aulas da EMC, o mesmo campo fica no formulário da aula. Os dois usam
`capsParse`. Vídeo do YouTube ou do Vimeo não mostra capítulos, porque o player deles não
deixa saltar o tempo daqui.
