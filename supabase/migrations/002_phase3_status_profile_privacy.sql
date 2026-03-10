-- Phase 3: Status system, extended profile, privacy preferences

-- Add status, age, gender to profiles
alter table public.profiles
  add column if not exists status text not null default 'red'
    check (status in ('green', 'yellow', 'red')),
  add column if not exists age integer
    check (age is null or (age >= 13 and age <= 120)),
  add column if not exists gender text
    check (gender is null or gender in ('male', 'female', 'non-binary', 'other', 'prefer-not-to-say'));

-- Interests table
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.interests enable row level security;

create policy "Interests are readable by authenticated users"
  on public.interests for select
  to authenticated
  using (true);

-- Profile interests join table
create table if not exists public.profile_interests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, interest_id)
);

alter table public.profile_interests enable row level security;

create policy "Profile interests are readable by authenticated users"
  on public.profile_interests for select
  to authenticated
  using (true);

create policy "Users can manage their own profile interests"
  on public.profile_interests for insert
  to authenticated
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can delete their own profile interests"
  on public.profile_interests for delete
  to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Privacy preferences table
create table if not exists public.privacy_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  show_distance boolean not null default true,
  show_on_map boolean not null default true,
  discoverable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.privacy_preferences enable row level security;

create policy "Users can read their own privacy preferences"
  on public.privacy_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own privacy preferences"
  on public.privacy_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own privacy preferences"
  on public.privacy_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at for privacy_preferences
create trigger on_privacy_preferences_updated
  before update on public.privacy_preferences
  for each row
  execute function public.handle_updated_at();

-- Seed starter interests
insert into public.interests (name) values
  ('Coffee'), ('Nightlife'), ('Fitness'), ('Gaming'), ('Music'),
  ('Travel'), ('Food'), ('Art'), ('Reading'), ('Sports'),
  ('Movies'), ('Photography'), ('Tech'), ('Nature'), ('Yoga'),
  ('Dancing'), ('Cooking'), ('Pets'), ('Fashion'), ('Volunteering')
on conflict (name) do nothing;
