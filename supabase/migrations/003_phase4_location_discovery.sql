-- Phase 4: Location, discovery, and avatar storage

-- Enable PostGIS
create extension if not exists postgis schema extensions;

-- Private user locations (NEVER expose raw coords to other users)
create table if not exists public.user_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  location extensions.geography(Point, 4326) not null,
  updated_at timestamptz not null default now()
);

alter table public.user_locations enable row level security;

create policy "Users can read their own location"
  on public.user_locations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own location"
  on public.user_locations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own location" 
  on public.user_locations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_locations_geo
  on public.user_locations using gist (location);

-- RPC: upsert user location (security definer bypasses RLS for insert/update)
create or replace function public.upsert_user_location(
  p_user_id uuid,
  p_point text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.user_locations (user_id, location, updated_at)
  values (p_user_id, extensions.st_geogfromtext(p_point), now())
  on conflict (user_id)
  do update set
    location = extensions.st_geogfromtext(p_point),
    updated_at = now();
end;
$$;

-- RPC: discover nearby users within radius
-- Returns ONLY public-safe data + approximate distance (rounded to 50m)
-- NEVER returns raw coordinates
create or replace function public.discover_nearby_users(
  requesting_user_id uuid,
  radius_meters double precision default 3000
)
returns table (
  profile_id uuid,
  user_id uuid,
  display_name text,
  bio text,
  avatar_url text,
  status text,
  age integer,
  gender text,
  distance_meters double precision
)
language plpgsql
security definer
as $$
declare
  requester_location extensions.geography;
begin
  select ul.location into requester_location
  from public.user_locations ul
  where ul.user_id = requesting_user_id;

  if requester_location is null then
    return;
  end if;

  return query
  select
    p.id as profile_id,
    p.user_id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.status,
    p.age,
    p.gender,
    round(
      extensions.st_distance(ul.location, requester_location)::numeric / 50
    )::double precision * 50 as distance_meters
  from public.profiles p
  inner join public.user_locations ul on ul.user_id = p.user_id
  left join public.privacy_preferences pp on pp.user_id = p.user_id
  where
    p.user_id != requesting_user_id
    and p.status != 'red'
    and (pp.discoverable is null or pp.discoverable = true)
    and extensions.st_dwithin(ul.location, requester_location, radius_meters)
  order by extensions.st_distance(ul.location, requester_location) asc;
end;
$$;

-- Storage: avatars bucket (created via SQL, policies via storage API)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
