-- Correções da auditoria do acervo (06/10/2026). Pedido do professor: "Corrigir tudo".
--
-- Tabela de TRABALHO, fora do payload que o app serve. Cada linha guarda o texto
-- original de um item de payload.diretrizes, o texto corrigido, as trocas feitas e
-- a revisão independente. O acervo só muda quando uma única instrução copia, do
-- lado do servidor, as linhas aprovadas para o payload (ver o fim deste arquivo):
-- nenhum texto é redigitado entre a revisão e a aplicação.
--
-- Identidade do item = fonte|tema|sub, a mesma chave que o painel do professor usa
-- para mesclar gravações concorrentes (GLOBAL_MERGE_KEYS.diretrizes no index.html).
-- A posição (idx) muda se alguém inserir ou apagar um item; a chave, não.
--
-- RLS ligada e sem política: nem aluno nem visitante leem esta tabela. Ela é o
-- registro da operação e serve de reversão item a item (resumo_original).
create table if not exists public.endodirect_correcoes_auditoria (
  chave text primary key,
  idx int not null,
  sub text,
  tema text,
  acesso text,
  resumo_original text not null,
  resumo_novo text,
  ano_original text,
  ano_novo text,
  fonte_original text,
  fonte_novo text,
  patches jsonb,
  leves_descartados jsonb,
  status text not null default 'proposto'
    check (status in ('proposto', 'aprovado', 'rejeitado', 'aplicado')),
  revisao jsonb,
  criado_em timestamptz not null default now(),
  revisado_em timestamptz,
  aplicado_em timestamptz
);

alter table public.endodirect_correcoes_auditoria enable row level security;
revoke all on public.endodirect_correcoes_auditoria from anon, authenticated;

comment on table public.endodirect_correcoes_auditoria is
  'Correções da auditoria do acervo de 06/10/2026: texto original, texto corrigido, trocas e revisão de cada item de payload.diretrizes. Tabela de trabalho e de reversão; não é lida pelo app.';

-- ── Aplicação (uma única instrução, depois da revisão) ──────────────────────────
-- Copia para payload.diretrizes o texto (e o ano/fonte, quando mudam) de cada
-- linha 'aprovado', casando pela chave fonte|tema|sub, e marca atEdit (edição, não
-- republicação: não dispara novidade nem newsletter). Só grava se NENHUM item
-- aprovado tiver mudado desde a proposta (texto atual = resumo_original); havendo
-- divergência, nada é gravado e a divergência aparece no retorno. O gatilho
-- endodirect_global_state_touch_updated_at renova updated_at, e o painel do
-- professor, ao ver o updated_at novo, mescla em vez de sobrescrever.
-- Linha aprovada sem mudança nenhuma (texto, ano e fonte iguais; ex.: revisor
-- anulou a única troca proposta, a da fonte) não entra: só marcaria atEdit.
with c as (
  select chave, resumo_original, resumo_novo, ano_novo, fonte_novo
  from public.endodirect_correcoes_auditoria
  where status = 'aprovado'
    and (resumo_novo is distinct from resumo_original or ano_novo is not null or fonte_novo is not null)
),
itens as (
  select o, v, c.chave as ch, c.resumo_original, c.resumo_novo, c.ano_novo, c.fonte_novo
  from public.endodirect_global_state g,
       jsonb_array_elements(g.payload->'diretrizes') with ordinality t(v,o)
       left join c on c.chave = coalesce(v->>'fonte','')||'|'||coalesce(nullif(v->>'tema',''), v->>'titulo','')||'|'||coalesce(v->>'sub','')
  where g.id = 'main'
),
novo as (
  select jsonb_agg(
           case when ch is not null and v->>'resumo' = resumo_original then
             v || jsonb_build_object('resumo', resumo_novo, 'atEdit', (extract(epoch from now()) * 1000)::bigint)
               || case when ano_novo is not null then jsonb_build_object('ano', ano_novo) else '{}'::jsonb end
               || case when fonte_novo is not null then jsonb_build_object('fonte', fonte_novo) else '{}'::jsonb end
           else v end
           order by o) as arr,
         count(*) filter (where ch is not null and v->>'resumo' = resumo_original) as aplicados,
         count(*) filter (where ch is not null and v->>'resumo' <> resumo_original) as divergentes,
         (select count(*) from c) as aprovados
  from itens
)
update public.endodirect_global_state g
   set payload = jsonb_set(g.payload, '{diretrizes}', (select arr from novo))
 where g.id = 'main'
   and (select divergentes from novo) = 0
   and (select aplicados from novo) = (select aprovados from novo)
returning (select aplicados from novo) as aplicados, jsonb_array_length(g.payload->'diretrizes') as n_itens;

-- Depois de conferir no acervo (resumo atual = resumo_novo em cada linha aplicada),
-- marcar as linhas: as aplicadas e as aprovadas sem mudança.
-- update public.endodirect_correcoes_auditoria c set status = 'aplicado', aplicado_em = now()
--  from public.endodirect_global_state g, jsonb_array_elements(g.payload->'diretrizes') v
--  where g.id = 'main' and c.status = 'aprovado'
--    and c.chave = coalesce(v->>'fonte','')||'|'||coalesce(nullif(v->>'tema',''), v->>'titulo','')||'|'||coalesce(v->>'sub','')
--    and v->>'resumo' = c.resumo_novo;

-- ── 2ª passada: campos auxiliares (pts, flashcards, mapa, fluxogramas) ──────────
-- Os campos auxiliares de cada item foram derivados do resumo antigo e repetem os
-- valores corrigidos na 1ª passada (ex.: a flashcard e o fluxograma da CAD ainda
-- com K < 3,3 depois de o resumo passar a 3,5). Mesmo desenho: proposta por item
-- numa tabela de trabalho, revisão e aplicação única guardada. A proposta é
-- gravada por CAMINHO (jsonb_set em cada folha de texto), e a gravação só acontece
-- se o texto atual de cada folha for exatamente o que o editor leu.
create table if not exists public.endodirect_correcoes_auxiliares (
  chave text primary key,
  idx int not null,
  campos_original jsonb not null,
  campos_novo jsonb,
  trocas jsonb,
  sem_mudanca boolean not null default false,
  notas text,
  status text not null default 'proposto'
    check (status in ('proposto', 'aprovado', 'rejeitado', 'aplicado')),
  revisao jsonb,
  criado_em timestamptz not null default now(),
  revisado_em timestamptz,
  aplicado_em timestamptz
);

alter table public.endodirect_correcoes_auxiliares enable row level security;
revoke all on public.endodirect_correcoes_auxiliares from anon, authenticated;

comment on table public.endodirect_correcoes_auxiliares is
  'Correções da auditoria do acervo, 2ª passada (campos pts, flashcards, mapa e fluxogramas): campos originais, campos corrigidos e trocas por caminho de cada item de payload.diretrizes. Tabela de trabalho e de reversão; não é lida pelo app.';

-- Aplicação da 2ª passada (uma única instrução, depois da revisão). Para cada
-- linha 'aprovado' com campos_novo, confere que os campos atuais do item ainda são
-- iguais (igualdade jsonb) a campos_original e substitui os campos; marca atEdit.
-- Mesma guarda da 1ª passada: qualquer divergência cancela a instrução inteira.
with c as (
  select chave, campos_original, campos_novo
  from public.endodirect_correcoes_auxiliares
  where status = 'aprovado' and campos_novo is not null
),
itens as (
  select o, v, c.chave as ch, c.campos_original, c.campos_novo,
         (select jsonb_object_agg(k, v->k)
            from jsonb_object_keys(coalesce(c.campos_original, '{}'::jsonb)) k) as atual
  from public.endodirect_global_state g,
       jsonb_array_elements(g.payload->'diretrizes') with ordinality t(v,o)
       left join c on c.chave = coalesce(v->>'fonte','')||'|'||coalesce(nullif(v->>'tema',''), v->>'titulo','')||'|'||coalesce(v->>'sub','')
  where g.id = 'main'
),
novo as (
  select jsonb_agg(
           case when ch is not null and atual = campos_original then
             v || campos_novo || jsonb_build_object('atEdit', (extract(epoch from now()) * 1000)::bigint)
           else v end
           order by o) as arr,
         count(*) filter (where ch is not null and atual = campos_original) as aplicados,
         count(*) filter (where ch is not null and atual is distinct from campos_original) as divergentes,
         (select count(*) from c) as aprovados
  from itens
)
update public.endodirect_global_state g
   set payload = jsonb_set(g.payload, '{diretrizes}', (select arr from novo))
 where g.id = 'main'
   and (select divergentes from novo) = 0
   and (select aplicados from novo) = (select aprovados from novo)
returning (select aplicados from novo) as aplicados, jsonb_array_length(g.payload->'diretrizes') as n_itens;

-- ── Troca de fontes (10/10, autorizada pelo professor) ──────────────────────────
-- A fonte é a chave de merge do painel (fonte|tema|sub). Cada troca fica
-- registrada com a chave antiga e a nova; a reversão é trocar de volta pelo
-- registro (ou pelo backup main-antes-trocar-fontes-2026-10-10). Painel aberto
-- desde antes da troca precisa ser recarregado antes de salvar (senão o merge
-- acrescenta o item novo e mantém o antigo).
create table if not exists public.endodirect_correcoes_fontes (
  idx int not null,
  chave_antiga text primary key,
  chave_nova text not null,
  fonte_antiga text not null,
  fonte_nova text not null,
  extra jsonb,          -- ex.: {"fluxogramas_0_fonte": "..."} (metadado interno que não é chave)
  motivo text not null,
  aplicado_em timestamptz
);
alter table public.endodirect_correcoes_fontes enable row level security;
revoke all on public.endodirect_correcoes_fontes from anon, authenticated;

with f as (select * from public.endodirect_correcoes_fontes where aplicado_em is null),
itens as (
  select o, v, f.chave_antiga as ch, f.fonte_antiga, f.fonte_nova, f.extra
  from public.endodirect_global_state g,
       jsonb_array_elements(g.payload->'diretrizes') with ordinality t(v,o)
       left join f on f.chave_antiga = coalesce(v->>'fonte','')||'|'||coalesce(nullif(v->>'tema',''), v->>'titulo','')||'|'||coalesce(v->>'sub','')
  where g.id = 'main'
),
novo as (
  select jsonb_agg(
           case when ch is not null and v->>'fonte' = fonte_antiga then
             (case when extra ? 'fluxogramas_0_fonte' and jsonb_typeof(v->'fluxogramas') = 'array' and jsonb_array_length(v->'fluxogramas') > 0
                   then jsonb_set(v, '{fluxogramas,0,fonte}', to_jsonb(extra->>'fluxogramas_0_fonte'))
                   else v end)
             || jsonb_build_object('fonte', fonte_nova, 'atEdit', (extract(epoch from now()) * 1000)::bigint)
           else v end
           order by o) as arr,
         count(*) filter (where ch is not null and v->>'fonte' = fonte_antiga) as aplicados,
         (select count(*) from f) as pendentes
  from itens
)
update public.endodirect_global_state g
   set payload = jsonb_set(g.payload, '{diretrizes}', (select arr from novo))
 where g.id = 'main' and (select aplicados from novo) = (select pendentes from novo) and (select pendentes from novo) > 0
returning (select aplicados from novo) as aplicados;

-- ── Rodada dos pontos fora dos achados (10/10) ───────────────────────────────────
-- Mesmo desenho, em tabelas próprias para não sobrescrever o registro da 1ª
-- rodada (resumo_original/campos_original de lá são a reversão da 1ª rodada).
-- A aplicação é a mesma das duas passadas acima, trocando os nomes das tabelas
-- por endodirect_correcoes_residuais e endodirect_correcoes_auxiliares_res.
create table if not exists public.endodirect_correcoes_residuais
  (like public.endodirect_correcoes_auditoria including all);
alter table public.endodirect_correcoes_residuais enable row level security;
revoke all on public.endodirect_correcoes_residuais from anon, authenticated;

create table if not exists public.endodirect_correcoes_auxiliares_res
  (like public.endodirect_correcoes_auxiliares including all);
alter table public.endodirect_correcoes_auxiliares_res enable row level security;
revoke all on public.endodirect_correcoes_auxiliares_res from anon, authenticated;

-- Aplicada em 10/10, 11h41 UTC. 50 itens revisados: 49 aprovados e 1 aprovado com
-- ajuste do revisor, nenhum rejeitado. 45 tiveram mudança no resumo (86 trocas) e
-- 25 tiveram campos auxiliares alinhados (46 trocas); 5 ficaram como estavam
-- porque nenhum ponto se confirmou. Retoques da coordenação antes de aplicar
-- (anotados no "motivo" das trocas do item): no item da terapia combinada do DM2,
-- a titulação da glargina + lixisenatida passou de "passos de 2 UI" a "2 a 4 UI"
-- (bula do FDA), e a dulaglutida 3/4,5 mg passou de "só no exterior" a "aprovadas
-- nos EUA e na Europa" (o registro no Brasil não foi conferido).
-- Backup: main-antes-aplicar-residuais-2026-10-10. Verificação: 188 itens
-- idênticos ao backup; nos 45 alterados, só resumo, campos auxiliares e atEdit.

-- ── Limpeza mecânica (10/10): título "## Pontos-Chave" vazio no fim do resumo ────
-- Dez resumos terminavam nesse título sem conteúdo; o app desenha os pontos-chave
-- (campo pts) num bloco próprio, com cabeçalho, logo abaixo do texto, e o título
-- aparecia vazio e duplicado. Backup: main-antes-limpar-titulos-vazios-2026-10-10.
with itens as (
  select o, v, (v->>'resumo') ~* '\n#+[ \t]*pontos[- ]chave\s*$' as alvo
  from public.endodirect_global_state g, jsonb_array_elements(g.payload->'diretrizes') with ordinality t(v,o)
  where g.id = 'main'
),
novo as (
  select jsonb_agg(case when alvo then
           v || jsonb_build_object('resumo', regexp_replace(v->>'resumo', '\s*\n#+[ \t]*pontos[- ]chave\s*$', '', 'i'),
                                   'atEdit', (extract(epoch from now()) * 1000)::bigint)
         else v end order by o) as arr,
         count(*) filter (where alvo) as n
  from itens
)
update public.endodirect_global_state g
   set payload = jsonb_set(g.payload, '{diretrizes}', (select arr from novo))
 where g.id = 'main' and (select n from novo) = 10
returning (select n from novo) as limpos;
