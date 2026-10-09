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
with c as (
  select chave, resumo_original, resumo_novo, ano_novo, fonte_novo
  from public.endodirect_correcoes_auditoria where status = 'aprovado'
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
