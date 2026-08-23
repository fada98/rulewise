create extension if not exists vector with schema extensions;

alter table public.documents
  add column if not exists status text not null default 'Uploaded'
  check (status in ('Uploaded', 'Processing', 'Ready', 'Failed'));

alter table public.document_chunks
  add column if not exists embedding extensions.vector(1536);

create index if not exists idx_document_chunks_embedding
  on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_sources (
  id bigint generated always as identity primary key,
  message_id uuid not null references public.messages(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_id bigint not null references public.document_chunks(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  similarity_score double precision not null
);

create index if not exists idx_conversations_user_created on public.conversations(user_id, created_at desc);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);
create index if not exists idx_message_sources_message on public.message_sources(message_id);

grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.message_sources to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_sources enable row level security;

create policy "conversations_owner" on public.conversations for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "messages_owner" on public.messages for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "message_sources_owner" on public.message_sources for all
  using (exists (
    select 1 from public.messages
    where messages.id = message_sources.message_id
      and messages.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.messages
    where messages.id = message_sources.message_id
      and messages.user_id = auth.uid()
  ));

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_user_id uuid,
  filter_document_id uuid default null,
  match_threshold double precision default 0.78,
  match_count integer default 6
)
returns table (
  id bigint,
  document_id uuid,
  document_name text,
  page_number integer,
  content text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    chunks.id,
    chunks.document_id,
    documents.name,
    chunks.page_number,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks as chunks
  join public.documents as documents on documents.id = chunks.document_id
  where chunks.user_id = auth.uid()
    and chunks.user_id = match_user_id
    and chunks.embedding is not null
    and (filter_document_id is null or chunks.document_id = filter_document_id)
    and 1 - (chunks.embedding <=> query_embedding) >= match_threshold
  order by chunks.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

grant execute on function public.match_document_chunks(
  extensions.vector(1536), uuid, uuid, double precision, integer
) to authenticated;
