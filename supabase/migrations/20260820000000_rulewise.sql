create extension if not exists vector with schema extensions;

create type public.document_status as enum ('Uploaded','Processing','Ready','Failed');
create type public.message_role as enum ('user','assistant');
create type public.feedback_rating as enum ('helpful','incorrect');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,email text not null,created_at timestamptz not null default now());
create table public.documents (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,filename text not null,original_name text not null,status public.document_status not null default 'Uploaded',page_count integer not null default 0,chunk_count integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.document_chunks (id uuid primary key default gen_random_uuid(),document_id uuid not null references public.documents(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,page_number integer not null check(page_number>0),chunk_index integer not null,content text not null,embedding extensions.vector(1536) not null,created_at timestamptz not null default now(),unique(document_id,chunk_index));
create table public.conversations (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,title text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.messages (id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role public.message_role not null,content text not null,created_at timestamptz not null default now());
create table public.message_sources (id uuid primary key default gen_random_uuid(),message_id uuid not null references public.messages(id) on delete cascade,document_id uuid not null references public.documents(id) on delete cascade,chunk_id uuid not null references public.document_chunks(id) on delete cascade,page_number integer not null,similarity_score double precision not null,created_at timestamptz not null default now());
create table public.feedback (id uuid primary key default gen_random_uuid(),message_id uuid not null references public.messages(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,rating public.feedback_rating not null,comment text,created_at timestamptz not null default now(),unique(message_id,user_id));

create index document_chunks_embedding_idx on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index documents_user_created_idx on public.documents(user_id,created_at desc);
create index conversations_user_updated_idx on public.conversations(user_id,updated_at desc);

alter table public.profiles enable row level security; alter table public.documents enable row level security; alter table public.document_chunks enable row level security; alter table public.conversations enable row level security; alter table public.messages enable row level security; alter table public.message_sources enable row level security; alter table public.feedback enable row level security;
create policy "profiles_owner" on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy "documents_owner" on public.documents for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "chunks_owner" on public.document_chunks for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "conversations_owner" on public.conversations for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "messages_owner" on public.messages for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "sources_owner" on public.message_sources for all using(exists(select 1 from public.messages m where m.id=message_id and m.user_id=auth.uid())) with check(exists(select 1 from public.messages m where m.id=message_id and m.user_id=auth.uid()));
create policy "feedback_owner" on public.feedback for all using(user_id=auth.uid()) with check(user_id=auth.uid());

insert into storage.buckets (id,name,public) values ('documents','documents',false) on conflict(id) do nothing;
create policy "document_files_read" on storage.objects for select using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "document_files_insert" on storage.objects for insert with check(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "document_files_delete" on storage.objects for delete using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,email) values(new.id,coalesce(new.email,'')); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.match_document_chunks(query_embedding extensions.vector(1536),match_user_id uuid,filter_document_id uuid default null,match_threshold double precision default .78,match_count integer default 6)
returns table(id uuid,document_id uuid,document_name text,page_number integer,content text,similarity double precision) language sql stable security invoker set search_path='' as $$
select dc.id,dc.document_id,d.original_name,dc.page_number,dc.content,1-(dc.embedding <=> query_embedding) as similarity from public.document_chunks dc join public.documents d on d.id=dc.document_id where dc.user_id=auth.uid() and dc.user_id=match_user_id and d.status='Ready' and (filter_document_id is null or dc.document_id=filter_document_id) and 1-(dc.embedding <=> query_embedding)>=match_threshold order by dc.embedding <=> query_embedding limit least(match_count,12)
$$;
