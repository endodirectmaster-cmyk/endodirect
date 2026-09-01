-- Capítulos da primeira aula do Programa de Educação Médica Continuada.
--
-- 01/09/2026. O professor importou a aula e definiu os capítulos no painel do
-- Bunny (biblioteca 741440, vídeo 90f8b00c-e810-4f75-93bd-410e8f25b2d2). O que
-- o Bunny guarda fica no Bunny: a plataforma lê o `.m3u8`, não a API deles.
-- Este script copia os mesmos seis capítulos para o campo `caps` da aula, que é
-- o que o aluno vê embaixo do vídeo. Daqui para frente o professor cola os
-- capítulos no campo do formulário de aula (Cursos → editar → Capítulos).
--
-- Início de cada capítulo, em segundos, exatamente como no painel do Bunny:
--   00:02:45 → 165    Importância do tema
--   00:13:00 → 780    Conceitos Fundamentais
--   00:17:40 → 1060   Evidências Clínicas
--   00:24:01 → 1441   Estratificação de Risco
--   00:46:29 → 2789   Estratégias de Tratamento
--   01:01:14 → 3674   Estratégias Futuras
-- O horário de FIM que o Bunny mostra não é guardado: o fim de um capítulo é o
-- início do seguinte, e o do último é o fim do vídeo.
--
-- Os títulos entram LETRA POR LETRA como o professor os escreveu no Bunny — são
-- palavras dele, não texto da plataforma.
--
-- ⚠️ A ORDEM DO ARRAY IMPORTA: `adm_cursos` é lido por índice em vários pontos
-- do app (data-curso-play="i"). O `with ordinality` existe para devolver o
-- array na mesma ordem em que entrou.
update public.endodirect_global_state g
set payload = jsonb_set(g.payload, '{adm_cursos}', (
  select jsonb_agg(
    case
      when a->>'curso' = 'emc'
       and a->>'src' like '%90f8b00c-e810-4f75-93bd-410e8f25b2d2%'
      then a || jsonb_build_object('caps', jsonb_build_array(
        jsonb_build_object('t',  165, 'titulo', 'Importância do tema'),
        jsonb_build_object('t',  780, 'titulo', 'Conceitos Fundamentais'),
        jsonb_build_object('t', 1060, 'titulo', 'Evidências Clínicas'),
        jsonb_build_object('t', 1441, 'titulo', 'Estratificação de Risco'),
        jsonb_build_object('t', 2789, 'titulo', 'Estratégias de Tratamento'),
        jsonb_build_object('t', 3674, 'titulo', 'Estratégias Futuras')))
      else a
    end order by ord)
  from jsonb_array_elements(g.payload->'adm_cursos') with ordinality t(a, ord)
))
where g.id = 'main';
