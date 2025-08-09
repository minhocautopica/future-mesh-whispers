-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enumerations for controlled values
create type public.gender as enum ('Masculino','Feminino','Não-binário','Prefiro não responder');
create type public.age_range as enum ('Até 18', '19-25', '26-35', '36-45', '46-60', '60+');
create type public.answer_type as enum ('text','audio');
create type public.question_key as enum ('future_vision','magic_wand','what_is_missing');

-- Stations/devices where data is collected
create table if not exists public.stations (
  id text primary key,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed the three devices/locations
insert into public.stations (id, label, active)
values
  ('plataforma', 'Plataforma', true),
  ('mercado', 'Mercado', true),
  ('vila_flor', 'Vila Flor', true)
on conflict (id) do nothing;

-- Submissions hold demographics and consent metadata
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  station_id text not null references public.stations(id) on delete restrict,
  timestamp timestamptz not null default now(),
  gender public.gender,
  age public.age_range,
  resident boolean,
  -- GDPR/consent metadata (academic research purpose)
  consent_given boolean not null default true,
  consent_version text not null default 'v1',
  consent_purpose text not null default 'academic research',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to maintain updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.update_updated_at_column();

-- Answers reference files in Storage (text/audio) per question
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_number smallint not null check (question_number in (1,2,3)),
  question_key public.question_key not null,
  type public.answer_type not null,
  storage_path text not null, -- path in storage bucket (e.g., survey/..)
  mime_type text,
  size_bytes integer,
  duration_seconds numeric, -- for audio, optional
  text_content text, -- optional convenience copy of text answers
  created_at timestamptz not null default now(),
  unique (submission_id, question_number, type)
);

-- Helpful indexes
create index if not exists idx_submissions_station_created on public.submissions (station_id, created_at desc);
create index if not exists idx_answers_submission on public.answers (submission_id);
create index if not exists idx_answers_question on public.answers (question_number, type);

-- Enable Row Level Security
alter table public.stations enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;

-- Stations are public readable (no sensitive data)
create policy if not exists "Stations readable for everyone"
  on public.stations for select
  using (true);

-- Submissions: allow anonymous inserts from kiosks, but do not expose reads publicly
create policy if not exists "Anonymous can insert submissions"
  on public.submissions for insert to anon
  with check (true);

create policy if not exists "Authenticated can view submissions"
  on public.submissions for select to authenticated
  using (true);

-- Answers: allow anonymous insert only if the submission exists; reads only for authenticated
create policy if not exists "Anonymous can insert answers"
  on public.answers for insert to anon
  with check (exists (select 1 from public.submissions s where s.id = submission_id));

create policy if not exists "Authenticated can view answers"
  on public.answers for select to authenticated
  using (true);

-- Storage bucket for survey files (private by default)
insert into storage.buckets (id, name, public)
values ('survey', 'survey', false)
on conflict (id) do nothing;

-- Storage RLS policies: allow anonymous uploads to 'survey' bucket, restrict reads to authenticated
create policy if not exists "Anon can upload survey files"
  on storage.objects for insert to anon
  with check (bucket_id = 'survey');

create policy if not exists "Authenticated can read survey files"
  on storage.objects for select to authenticated
  using (bucket_id = 'survey');

create policy if not exists "Authenticated can update survey files"
  on storage.objects for update to authenticated
  using (bucket_id = 'survey')
  with check (bucket_id = 'survey');

create policy if not exists "Authenticated can delete survey files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'survey');