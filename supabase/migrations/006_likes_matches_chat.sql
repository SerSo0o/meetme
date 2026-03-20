-- Phase 5: Likes, Matches, and Chat System

-- ============================================
-- LIKES TABLE
-- ============================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid not null references auth.users(id) on delete cascade,
  liked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(liker_id, liked_id),
  check (liker_id != liked_id)
);

create index if not exists idx_likes_liker on public.likes(liker_id);
create index if not exists idx_likes_liked on public.likes(liked_id);

alter table public.likes enable row level security;

-- Users can see likes they sent or received
create policy "Users can view their own likes"
  on public.likes for select
  to authenticated
  using (auth.uid() = liker_id or auth.uid() = liked_id);

-- Users can create likes
create policy "Users can create likes"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = liker_id);

-- Users can delete their own likes (unlike)
create policy "Users can delete their own likes"
  on public.likes for delete
  to authenticated
  using (auth.uid() = liker_id);

-- ============================================
-- MATCHES TABLE
-- ============================================
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid not null references auth.users(id) on delete cascade,
  matched_at timestamptz not null default now(),
  check (user1_id < user2_id),
  unique(user1_id, user2_id)
);

create index if not exists idx_matches_user1 on public.matches(user1_id);
create index if not exists idx_matches_user2 on public.matches(user2_id);

alter table public.matches enable row level security;

-- Users can see matches they're part of
create policy "Users can view their matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_messages_match on public.messages(match_id);
create index if not exists idx_messages_created on public.messages(match_id, created_at desc);

alter table public.messages enable row level security;

-- Users can view messages in their matches
create policy "Users can view messages in their matches"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Users can send messages in their matches
create policy "Users can send messages in their matches"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Users can update messages they received (for read_at)
create policy "Users can mark messages as read"
  on public.messages for update
  to authenticated
  using (
    sender_id != auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  )
  with check (
    sender_id != auth.uid()
  );

-- ============================================
-- ENABLE REALTIME FOR MESSAGES
-- ============================================
alter publication supabase_realtime add table public.messages;

-- ============================================
-- RPC: CREATE LIKE (with auto-match detection)
-- ============================================
create or replace function public.create_like(p_liked_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_liker_id uuid := auth.uid();
  v_like_id uuid;
  v_match_id uuid;
  v_is_mutual boolean := false;
  v_user1 uuid;
  v_user2 uuid;
begin
  -- Prevent self-like
  if v_liker_id = p_liked_id then
    raise exception 'Cannot like yourself';
  end if;

  -- Insert the like (ignore if already exists)
  insert into public.likes (liker_id, liked_id)
  values (v_liker_id, p_liked_id)
  on conflict (liker_id, liked_id) do nothing
  returning id into v_like_id;

  -- Check if mutual like exists
  if exists (
    select 1 from public.likes
    where liker_id = p_liked_id and liked_id = v_liker_id
  ) then
    v_is_mutual := true;
    
    -- Determine user1 and user2 (user1 < user2 for uniqueness)
    if v_liker_id < p_liked_id then
      v_user1 := v_liker_id;
      v_user2 := p_liked_id;
    else
      v_user1 := p_liked_id;
      v_user2 := v_liker_id;
    end if;

    -- Create match if doesn't exist
    insert into public.matches (user1_id, user2_id)
    values (v_user1, v_user2)
    on conflict (user1_id, user2_id) do nothing
    returning id into v_match_id;

    -- If match was just created, get its ID
    if v_match_id is null then
      select id into v_match_id
      from public.matches
      where user1_id = v_user1 and user2_id = v_user2;
    end if;
  end if;

  return jsonb_build_object(
    'like_id', v_like_id,
    'is_mutual', v_is_mutual,
    'match_id', v_match_id
  );
end;
$$;

-- ============================================
-- RPC: GET INCOMING LIKES (not yet matched)
-- ============================================
create or replace function public.get_incoming_likes()
returns table (
  like_id uuid,
  liker_id uuid,
  display_name text,
  bio text,
  avatar_url text,
  age integer,
  gender text,
  created_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    l.id as like_id,
    l.liker_id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.age,
    p.gender,
    l.created_at
  from public.likes l
  inner join public.profiles p on p.user_id = l.liker_id
  where l.liked_id = auth.uid()
  -- Exclude if already matched
  and not exists (
    select 1 from public.matches m
    where (m.user1_id = l.liker_id and m.user2_id = auth.uid())
       or (m.user1_id = auth.uid() and m.user2_id = l.liker_id)
  )
  order by l.created_at desc;
end;
$$;

-- ============================================
-- RPC: GET MATCHES WITH LAST MESSAGE
-- ============================================
create or replace function public.get_matches()
returns table (
  match_id uuid,
  matched_at timestamptz,
  other_user_id uuid,
  display_name text,
  bio text,
  avatar_url text,
  age integer,
  gender text,
  last_message text,
  last_message_at timestamptz,
  last_message_sender_id uuid,
  unread_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    m.id as match_id,
    m.matched_at,
    case 
      when m.user1_id = auth.uid() then m.user2_id 
      else m.user1_id 
    end as other_user_id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.age,
    p.gender,
    (
      select msg.content
      from public.messages msg
      where msg.match_id = m.id
      order by msg.created_at desc
      limit 1
    ) as last_message,
    (
      select msg.created_at
      from public.messages msg
      where msg.match_id = m.id
      order by msg.created_at desc
      limit 1
    ) as last_message_at,
    (
      select msg.sender_id
      from public.messages msg
      where msg.match_id = m.id
      order by msg.created_at desc
      limit 1
    ) as last_message_sender_id,
    (
      select count(*)
      from public.messages msg
      where msg.match_id = m.id
      and msg.sender_id != auth.uid()
      and msg.read_at is null
    ) as unread_count
  from public.matches m
  inner join public.profiles p on p.user_id = (
    case 
      when m.user1_id = auth.uid() then m.user2_id 
      else m.user1_id 
    end
  )
  where m.user1_id = auth.uid() or m.user2_id = auth.uid()
  order by 
    coalesce(
      (select msg.created_at from public.messages msg where msg.match_id = m.id order by msg.created_at desc limit 1),
      m.matched_at
    ) desc;
end;
$$;

-- ============================================
-- RPC: CHECK IF USER IS LIKED
-- ============================================
create or replace function public.check_like_status(p_other_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_i_liked boolean := false;
  v_they_liked boolean := false;
  v_match_id uuid;
begin
  -- Check if current user liked the other
  select exists(
    select 1 from public.likes
    where liker_id = auth.uid() and liked_id = p_other_user_id
  ) into v_i_liked;

  -- Check if other user liked current user
  select exists(
    select 1 from public.likes
    where liker_id = p_other_user_id and liked_id = auth.uid()
  ) into v_they_liked;

  -- Get match ID if exists
  select id into v_match_id
  from public.matches
  where (user1_id = auth.uid() and user2_id = p_other_user_id)
     or (user1_id = p_other_user_id and user2_id = auth.uid());

  return jsonb_build_object(
    'i_liked', v_i_liked,
    'they_liked', v_they_liked,
    'is_matched', v_match_id is not null,
    'match_id', v_match_id
  );
end;
$$;

-- ============================================
-- RPC: SEND MESSAGE
-- ============================================
create or replace function public.send_message(p_match_id uuid, p_content text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_message_id uuid;
begin
  -- Verify user is part of the match
  if not exists (
    select 1 from public.matches
    where id = p_match_id
    and (user1_id = auth.uid() or user2_id = auth.uid())
  ) then
    raise exception 'Not authorized to send message to this match';
  end if;

  insert into public.messages (match_id, sender_id, content)
  values (p_match_id, auth.uid(), p_content)
  returning id into v_message_id;

  return v_message_id;
end;
$$;

-- ============================================
-- RPC: MARK MESSAGES AS READ
-- ============================================
create or replace function public.mark_messages_read(p_match_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.messages
  set read_at = now()
  where match_id = p_match_id
  and sender_id != auth.uid()
  and read_at is null;
end;
$$;
