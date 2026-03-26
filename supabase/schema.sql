create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'role_view') then
    create type public.role_view as enum ('lead', 'worker');
  end if;
  if not exists (select 1 from pg_type where typname = 'team_member_role') then
    create type public.team_member_role as enum ('owner', 'manager', 'member');
  end if;
  if not exists (select 1 from pg_type where typname = 'membership_status') then
    create type public.membership_status as enum ('active', 'invited', 'suspended', 'left');
  end if;
  if not exists (select 1 from pg_type where typname = 'payout_mode') then
    create type public.payout_mode as enum ('instant', 'scheduled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payout_frequency') then
    create type public.payout_frequency as enum ('daily', 'weekly', 'biweekly', 'monthly');
  end if;
  if not exists (select 1 from pg_type where typname = 'assignment_mode') then
    create type public.assignment_mode as enum ('assigned', 'open_claim');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('open', 'assigned', 'submitted', 'approved', 'paid', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'collection_status') then
    create type public.collection_status as enum ('pending', 'verifying', 'successful', 'failed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type public.payout_status as enum ('pending', 'processing', 'successful', 'failed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'earning_status') then
    create type public.earning_status as enum ('pending', 'processing', 'paid', 'failed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'chat_room_type') then
    create type public.chat_room_type as enum ('team', 'direct', 'task');
  end if;
  if not exists (select 1 from pg_type where typname = 'ledger_entry_type') then
    create type public.ledger_entry_type as enum (
      'funding',
      'task_reserve',
      'task_unreserve',
      'task_approved_to_pending_payout',
      'payout_processing',
      'payout_success',
      'payout_failure',
      'refund',
      'manual_adjustment'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'provider_event_status') then
    create type public.provider_event_status as enum ('received', 'processed', 'ignored', 'failed');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
begin
  return 'CREW-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  default_role_view public.role_view not null default 'worker',
  payout_ready boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payout_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (user_id) on delete cascade,
  bank_code text not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  is_verified boolean not null default false,
  verified_at timestamptz,
  verification_message text,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default public.generate_invite_code(),
  owner_user_id uuid not null references public.profiles (user_id) on delete restrict,
  payout_mode public.payout_mode not null default 'instant',
  payout_frequency public.payout_frequency,
  threshold_minor bigint not null default 0,
  currency text not null default 'NGN',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  role public.team_member_role not null default 'member',
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (team_id, user_id)
);

create table if not exists public.team_wallets (
  team_id uuid primary key references public.teams (id) on delete cascade,
  available_balance_minor bigint not null default 0,
  reserved_balance_minor bigint not null default 0,
  pending_payout_balance_minor bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_collections (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  initiated_by_user_id uuid not null references public.profiles (user_id) on delete restrict,
  provider text not null default 'interswitch',
  txn_ref text not null unique,
  provider_reference text,
  provider_payment_id text,
  amount_minor bigint not null,
  currency text not null default 'NGN',
  status public.collection_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  created_by_user_id uuid not null references public.profiles (user_id) on delete restrict,
  assignment_mode public.assignment_mode not null,
  title text not null,
  description text not null,
  reward_minor bigint not null,
  deadline_at timestamptz,
  status public.task_status not null,
  assignee_user_id uuid references public.profiles (user_id) on delete set null,
  claimed_by_user_id uuid references public.profiles (user_id) on delete set null,
  claimed_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  submitted_by_user_id uuid not null references public.profiles (user_id) on delete restrict,
  note text,
  evidence jsonb not null default '[]'::jsonb,
  status text not null default 'submitted',
  rejection_reason text,
  reviewed_by_user_id uuid references public.profiles (user_id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.worker_earnings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (user_id) on delete restrict,
  amount_minor bigint not null,
  status public.earning_status not null default 'pending',
  payout_id uuid,
  approved_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (user_id) on delete restrict,
  initiated_by_user_id uuid not null references public.profiles (user_id) on delete restrict,
  provider text not null default 'interswitch',
  transaction_reference text not null unique,
  amount_minor bigint not null,
  fee_minor bigint,
  status public.payout_status not null default 'processing',
  recipient_bank_code text not null,
  recipient_bank_name text not null,
  recipient_account_number text not null,
  recipient_account_name text not null,
  narration text not null,
  provider_payload jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wallet_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  type public.ledger_entry_type not null,
  amount_minor bigint not null,
  task_id uuid references public.tasks (id) on delete set null,
  payment_collection_id uuid references public.payment_collections (id) on delete set null,
  payout_id uuid references public.payouts (id) on delete set null,
  created_by_user_id uuid references public.profiles (user_id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'interswitch',
  event_key text not null unique,
  event_type text not null,
  signature text,
  payload jsonb not null default '{}'::jsonb,
  status public.provider_event_status not null default 'received',
  error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  type public.chat_room_type not null,
  name text not null,
  created_by_user_id uuid references public.profiles (user_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (room_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  sender_user_id uuid not null references public.profiles (user_id) on delete cascade,
  content text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.payout_methods enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_wallets enable row level security;
alter table public.payment_collections enable row level security;
alter table public.tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.worker_earnings enable row level security;
alter table public.payouts enable row level security;
alter table public.wallet_ledger_entries enable row level security;
alter table public.provider_events enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_team_member(p_team_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = p_user_id
      and tm.status = 'active'
  );
$$;

create or replace function public.is_team_admin(p_team_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = p_user_id
      and tm.status = 'active'
      and tm.role in ('owner', 'manager')
  );
$$;

create or replace function public.is_team_owner(p_team_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = p_user_id
      and tm.status = 'active'
      and tm.role = 'owner'
  );
$$;

create or replace function public.has_chat_access(p_room_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.chat_room_members crm
    where crm.room_id = p_room_id
      and crm.user_id = p_user_id
  );
$$;

create or replace function public.create_notification(
  p_user_id uuid,
  p_team_id uuid,
  p_task_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (user_id, team_id, task_id, type, title, body, metadata)
  values (p_user_id, p_team_id, p_task_id, p_type, p_title, p_body, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
      phone = coalesce(public.profiles.phone, excluded.phone),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_team(
  p_name text,
  p_payout_mode public.payout_mode,
  p_payout_frequency public.payout_frequency,
  p_threshold_minor bigint,
  p_currency text default 'NGN'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_room_id uuid;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Team name is required';
  end if;

  insert into public.teams (
    name,
    owner_user_id,
    payout_mode,
    payout_frequency,
    threshold_minor,
    currency
  )
  values (
    trim(p_name),
    v_actor,
    p_payout_mode,
    case when p_payout_mode = 'scheduled' then p_payout_frequency else null end,
    greatest(p_threshold_minor, 0),
    upper(coalesce(p_currency, 'NGN'))
  )
  returning id into v_team_id;

  insert into public.team_members (team_id, user_id, role, status)
  values (v_team_id, v_actor, 'owner', 'active');

  insert into public.team_wallets (team_id) values (v_team_id);

  insert into public.chat_rooms (team_id, type, name, created_by_user_id)
  values (v_team_id, 'team', trim(p_name) || ' Team Chat', v_actor)
  returning id into v_room_id;

  insert into public.chat_room_members (room_id, user_id)
  values (v_room_id, v_actor);

  perform public.create_notification(
    v_actor,
    v_team_id,
    null,
    'team_created',
    'Team created',
    'Your team is ready for invites, funding, and task operations.',
    jsonb_build_object('team_id', v_team_id)
  );

  return v_team_id;
end;
$$;

create or replace function public.join_team_by_code(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_team_id uuid;
  v_team_name text;
  v_room_id uuid;
  v_owner_id uuid;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select id, name, owner_user_id
  into v_team_id, v_team_name, v_owner_id
  from public.teams
  where upper(invite_code) = upper(trim(p_invite_code))
    and archived_at is null
  limit 1;

  if v_team_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.team_members (team_id, user_id, role, status)
  values (v_team_id, v_actor, 'member', 'active')
  on conflict (team_id, user_id) do update
  set status = 'active',
      updated_at = timezone('utc', now()),
      joined_at = timezone('utc', now());

  select id into v_room_id
  from public.chat_rooms
  where team_id = v_team_id
    and type = 'team'
  limit 1;

  if v_room_id is not null then
    insert into public.chat_room_members (room_id, user_id)
    values (v_room_id, v_actor)
    on conflict (room_id, user_id) do nothing;
  end if;

  if v_owner_id is not null and v_owner_id <> v_actor then
    perform public.create_notification(
      v_owner_id,
      v_team_id,
      null,
      'member_joined',
      'New team member',
      'A new member joined ' || v_team_name || '.',
      jsonb_build_object('team_id', v_team_id, 'user_id', v_actor)
    );
  end if;

  return v_team_id;
end;
$$;

create or replace function public.create_task(
  p_team_id uuid,
  p_title text,
  p_description text,
  p_assignment_mode public.assignment_mode,
  p_reward_minor bigint,
  p_deadline_at timestamptz,
  p_assignee_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task_id uuid;
  v_task_room_id uuid;
  v_team_name text;
  v_wallet public.team_wallets%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_team_admin(p_team_id, v_actor) then
    raise exception 'You do not have permission to create tasks for this team';
  end if;

  if coalesce(trim(p_title), '') = '' or coalesce(trim(p_description), '') = '' then
    raise exception 'Task title and description are required';
  end if;

  if p_reward_minor < 0 then
    raise exception 'Task reward cannot be negative';
  end if;

  if p_assignment_mode = 'assigned' and p_assignee_user_id is null then
    raise exception 'Assigned tasks need an assignee';
  end if;

  if p_assignee_user_id is not null and not public.is_team_member(p_team_id, p_assignee_user_id) then
    raise exception 'Assigned user is not an active member of this team';
  end if;

  if p_reward_minor > 0 then
    select * into v_wallet
    from public.team_wallets
    where team_id = p_team_id
    for update;

    if v_wallet.available_balance_minor < p_reward_minor then
      raise exception 'Insufficient wallet balance';
    end if;

    update public.team_wallets
    set available_balance_minor = available_balance_minor - p_reward_minor,
        reserved_balance_minor = reserved_balance_minor + p_reward_minor,
        updated_at = timezone('utc', now())
    where team_id = p_team_id;
  end if;

  insert into public.tasks (
    team_id,
    created_by_user_id,
    assignment_mode,
    title,
    description,
    reward_minor,
    deadline_at,
    status,
    assignee_user_id
  )
  values (
    p_team_id,
    v_actor,
    p_assignment_mode,
    trim(p_title),
    trim(p_description),
    p_reward_minor,
    p_deadline_at,
    (case when p_assignment_mode = 'assigned' then 'assigned' else 'open' end)::public.task_status,
    p_assignee_user_id
  )
  returning id into v_task_id;

  if p_reward_minor > 0 then
    insert into public.wallet_ledger_entries (
      team_id,
      type,
      amount_minor,
      task_id,
      created_by_user_id,
      metadata
    )
    values (
      p_team_id,
      'task_reserve',
      -p_reward_minor,
      v_task_id,
      v_actor,
      jsonb_build_object('assignment_mode', p_assignment_mode)
    );
  end if;

  select name into v_team_name from public.teams where id = p_team_id;

  insert into public.chat_rooms (team_id, task_id, type, name, created_by_user_id)
  values (p_team_id, v_task_id, 'task', trim(p_title), v_actor)
  returning id into v_task_room_id;

  insert into public.chat_room_members (room_id, user_id)
  values (v_task_room_id, v_actor)
  on conflict (room_id, user_id) do nothing;

  if p_assignee_user_id is not null then
    insert into public.chat_room_members (room_id, user_id)
    values (v_task_room_id, p_assignee_user_id)
    on conflict (room_id, user_id) do nothing;

    perform public.create_notification(
      p_assignee_user_id,
      p_team_id,
      v_task_id,
      'task_assigned',
      'New task assigned',
      'You have a new task in ' || v_team_name || '.',
      jsonb_build_object('task_id', v_task_id)
    );
  end if;

  return v_task_id;
end;
$$;

create or replace function public.claim_task(p_task_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_room_id uuid;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if v_task.id is null then
    raise exception 'Task not found';
  end if;

  if v_task.status <> 'open' then
    raise exception 'Task is not claimable';
  end if;

  if not public.is_team_member(v_task.team_id, v_actor) then
    raise exception 'Only active team members can claim this task';
  end if;

  update public.tasks
  set status = 'assigned',
      assignee_user_id = v_actor,
      claimed_by_user_id = v_actor,
      claimed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_task_id;

  select id into v_room_id
  from public.chat_rooms
  where task_id = p_task_id
    and type = 'task'
  limit 1;

  if v_room_id is not null then
    insert into public.chat_room_members (room_id, user_id)
    values (v_room_id, v_actor)
    on conflict (room_id, user_id) do nothing;
  end if;

  return p_task_id;
end;
$$;

create or replace function public.submit_task(
  p_task_id uuid,
  p_note text,
  p_evidence jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_submission_id uuid;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if v_task.id is null then
    raise exception 'Task not found';
  end if;

  if v_task.assignee_user_id <> v_actor then
    raise exception 'Only the assigned member can submit this task';
  end if;

  if v_task.status <> 'assigned' then
    raise exception 'Task cannot be submitted in its current state';
  end if;

  insert into public.task_submissions (
    task_id,
    submitted_by_user_id,
    note,
    evidence,
    status
  )
  values (
    p_task_id,
    v_actor,
    nullif(trim(coalesce(p_note, '')), ''),
    coalesce(p_evidence, '[]'::jsonb),
    'submitted'
  )
  returning id into v_submission_id;

  update public.tasks
  set status = 'submitted',
      submitted_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_task_id;

  return v_submission_id;
end;
$$;

create or replace function public.review_task_submission(
  p_task_id uuid,
  p_submission_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_team public.teams%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if v_task.id is null then
    raise exception 'Task not found';
  end if;

  if not public.is_team_admin(v_task.team_id, v_actor) then
    raise exception 'Only team owners and managers can review submissions';
  end if;

  if v_task.status <> 'submitted' then
    raise exception 'Task is not waiting for review';
  end if;

  select * into v_team from public.teams where id = v_task.team_id;

  if lower(p_decision) = 'approve' then
    update public.task_submissions
    set status = 'approved',
        rejection_reason = null,
        reviewed_by_user_id = v_actor,
        reviewed_at = timezone('utc', now())
    where id = p_submission_id
      and task_id = p_task_id;

    if v_task.reward_minor > 0 then
      update public.tasks
      set status = 'approved',
          approved_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = p_task_id;

      update public.team_wallets
      set reserved_balance_minor = reserved_balance_minor - v_task.reward_minor,
          pending_payout_balance_minor = pending_payout_balance_minor + v_task.reward_minor,
          updated_at = timezone('utc', now())
      where team_id = v_task.team_id;

      insert into public.worker_earnings (
        team_id,
        task_id,
        worker_user_id,
        amount_minor,
        status,
        approved_at
      )
      values (
        v_task.team_id,
        v_task.id,
        v_task.assignee_user_id,
        v_task.reward_minor,
        'pending',
        timezone('utc', now())
      )
      on conflict (task_id) do update
      set status = 'pending',
          amount_minor = excluded.amount_minor,
          updated_at = timezone('utc', now());

      insert into public.wallet_ledger_entries (
        team_id,
        type,
        amount_minor,
        task_id,
        created_by_user_id,
        metadata
      )
      values (
        v_task.team_id,
        'task_approved_to_pending_payout',
        v_task.reward_minor,
        v_task.id,
        v_actor,
        jsonb_build_object('payout_mode', v_team.payout_mode)
      );
    else
      update public.tasks
      set status = 'paid',
          approved_at = timezone('utc', now()),
          paid_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = p_task_id;
    end if;

    if v_task.assignee_user_id is not null then
      perform public.create_notification(
        v_task.assignee_user_id,
        v_task.team_id,
        v_task.id,
        'task_approved',
        'Task approved',
        case
          when v_task.reward_minor > 0 then 'Your submission has been approved and is moving into payout processing.'
          else 'Your submission has been approved and marked complete.'
        end,
        jsonb_build_object('task_id', v_task.id, 'team_id', v_task.team_id)
      );
    end if;
  elsif lower(p_decision) = 'reject' then
    update public.task_submissions
    set status = 'rejected',
        rejection_reason = nullif(trim(coalesce(p_rejection_reason, '')), ''),
        reviewed_by_user_id = v_actor,
        reviewed_at = timezone('utc', now())
    where id = p_submission_id
      and task_id = p_task_id;

    update public.tasks
    set status = 'assigned',
        submitted_at = null,
        updated_at = timezone('utc', now())
    where id = p_task_id;

    if v_task.assignee_user_id is not null then
      perform public.create_notification(
        v_task.assignee_user_id,
        v_task.team_id,
        v_task.id,
        'task_rejected',
        'Submission needs another pass',
        coalesce(nullif(trim(coalesce(p_rejection_reason, '')), ''), 'Your work was rejected and can be resubmitted.'),
        jsonb_build_object('task_id', v_task.id, 'team_id', v_task.team_id)
      );
    end if;
  else
    raise exception 'Unsupported review decision';
  end if;

  return v_task.id;
end;
$$;

create or replace function public.cancel_task(p_task_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task public.tasks%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if v_task.id is null then
    raise exception 'Task not found';
  end if;

  if not public.is_team_admin(v_task.team_id, v_actor) then
    raise exception 'Only team owners and managers can cancel tasks';
  end if;

  if v_task.status in ('approved', 'paid', 'cancelled') then
    raise exception 'Task cannot be cancelled in its current state';
  end if;

  if v_task.reward_minor > 0 then
    update public.team_wallets
    set available_balance_minor = available_balance_minor + v_task.reward_minor,
        reserved_balance_minor = reserved_balance_minor - v_task.reward_minor,
        updated_at = timezone('utc', now())
    where team_id = v_task.team_id;
  end if;

  update public.tasks
  set status = 'cancelled',
      cancelled_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_task_id;

  if v_task.reward_minor > 0 then
    insert into public.wallet_ledger_entries (
      team_id,
      type,
      amount_minor,
      task_id,
      created_by_user_id,
      metadata
    )
    values (
      v_task.team_id,
      'task_unreserve',
      v_task.reward_minor,
      v_task.id,
      v_actor,
      jsonb_build_object('reason', 'task_cancelled')
    );
  end if;

  return p_task_id;
end;
$$;

create or replace function public.create_collection(
  p_team_id uuid,
  p_amount_minor bigint
)
returns table (id uuid, txn_ref text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_txn_ref text := 'CRW-FND-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12));
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_team_admin(p_team_id, v_actor) then
    raise exception 'You do not have permission to fund this team';
  end if;

  if p_amount_minor <= 0 then
    raise exception 'Funding amount must be greater than zero';
  end if;

  return query
  insert into public.payment_collections (team_id, initiated_by_user_id, txn_ref, amount_minor, status)
  values (p_team_id, v_actor, v_txn_ref, p_amount_minor, 'pending')
  returning payment_collections.id, payment_collections.txn_ref;
end;
$$;

create or replace function public.apply_collection_success(
  p_collection_id uuid,
  p_provider_reference text,
  p_provider_payment_id text,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_collection public.payment_collections%rowtype;
begin
  select * into v_collection
  from public.payment_collections
  where id = p_collection_id
  for update;

  if v_collection.id is null then
    raise exception 'Collection not found';
  end if;

  if v_collection.status = 'successful' then
    return v_collection.id;
  end if;

  update public.payment_collections
  set status = 'successful',
      provider_reference = p_provider_reference,
      provider_payment_id = p_provider_payment_id,
      payload = coalesce(p_payload, '{}'::jsonb),
      updated_at = timezone('utc', now())
  where id = p_collection_id;

  update public.team_wallets
  set available_balance_minor = available_balance_minor + v_collection.amount_minor,
      updated_at = timezone('utc', now())
  where team_id = v_collection.team_id;

  insert into public.wallet_ledger_entries (
    team_id,
    type,
    amount_minor,
    payment_collection_id,
    created_by_user_id,
    metadata
  )
  values (
    v_collection.team_id,
    'funding',
    v_collection.amount_minor,
    v_collection.id,
    v_collection.initiated_by_user_id,
    jsonb_build_object(
      'provider_reference', p_provider_reference,
      'provider_payment_id', p_provider_payment_id
    )
  );

  perform public.create_notification(
    v_collection.initiated_by_user_id,
    v_collection.team_id,
    null,
    'funding_success',
    'Wallet funded',
    'Your team wallet has been credited successfully.',
    jsonb_build_object('team_id', v_collection.team_id, 'collection_id', v_collection.id)
  );

  return v_collection.id;
end;
$$;

create or replace function public.mark_collection_failed(
  p_collection_id uuid,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_collection public.payment_collections%rowtype;
begin
  select * into v_collection
  from public.payment_collections
  where id = p_collection_id
  for update;

  if v_collection.id is null then
    raise exception 'Collection not found';
  end if;

  update public.payment_collections
  set status = 'failed',
      payload = coalesce(p_payload, '{}'::jsonb),
      updated_at = timezone('utc', now())
  where id = p_collection_id;

  return v_collection.id;
end;
$$;

create or replace function public.create_payout_record(
  p_earning_id uuid,
  p_initiated_by_user_id uuid,
  p_transaction_reference text,
  p_recipient_bank_code text,
  p_recipient_bank_name text,
  p_recipient_account_number text,
  p_recipient_account_name text,
  p_narration text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := coalesce(p_initiated_by_user_id, auth.uid());
  v_earning public.worker_earnings%rowtype;
  v_payout_id uuid;
begin
  if v_actor is null then
    raise exception 'Actor is required';
  end if;

  select * into v_earning
  from public.worker_earnings
  where id = p_earning_id
  for update;

  if v_earning.id is null then
    raise exception 'Worker earning not found';
  end if;

  if v_earning.status not in ('pending', 'failed') then
    raise exception 'Earning is not ready for payout';
  end if;

  insert into public.payouts (
    team_id,
    worker_user_id,
    initiated_by_user_id,
    transaction_reference,
    amount_minor,
    status,
    recipient_bank_code,
    recipient_bank_name,
    recipient_account_number,
    recipient_account_name,
    narration
  )
  values (
    v_earning.team_id,
    v_earning.worker_user_id,
    v_actor,
    p_transaction_reference,
    v_earning.amount_minor,
    'processing',
    p_recipient_bank_code,
    p_recipient_bank_name,
    p_recipient_account_number,
    p_recipient_account_name,
    p_narration
  )
  returning id into v_payout_id;

  update public.worker_earnings
  set status = 'processing',
      payout_id = v_payout_id,
      updated_at = timezone('utc', now())
  where id = p_earning_id;

  insert into public.wallet_ledger_entries (
    team_id,
    type,
    amount_minor,
    task_id,
    payout_id,
    created_by_user_id,
    metadata
  )
  values (
    v_earning.team_id,
    'payout_processing',
    0,
    v_earning.task_id,
    v_payout_id,
    v_actor,
    jsonb_build_object('earning_id', v_earning.id)
  );

  return v_payout_id;
end;
$$;

create or replace function public.mark_payout_success(
  p_payout_id uuid,
  p_payload jsonb default '{}'::jsonb,
  p_fee_minor bigint default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout public.payouts%rowtype;
  v_earning public.worker_earnings%rowtype;
begin
  select * into v_payout
  from public.payouts
  where id = p_payout_id
  for update;

  if v_payout.id is null then
    raise exception 'Payout not found';
  end if;

  if v_payout.status = 'successful' then
    return v_payout.id;
  end if;

  select * into v_earning
  from public.worker_earnings
  where payout_id = p_payout_id
  for update;

  update public.payouts
  set status = 'successful',
      fee_minor = p_fee_minor,
      provider_payload = coalesce(p_payload, '{}'::jsonb),
      updated_at = timezone('utc', now())
  where id = p_payout_id;

  update public.worker_earnings
  set status = 'paid',
      paid_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_earning.id;

  update public.tasks
  set status = 'paid',
      paid_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_earning.task_id;

  update public.team_wallets
  set pending_payout_balance_minor = greatest(0, pending_payout_balance_minor - v_earning.amount_minor),
      updated_at = timezone('utc', now())
  where team_id = v_earning.team_id;

  insert into public.wallet_ledger_entries (
    team_id,
    type,
    amount_minor,
    task_id,
    payout_id,
    created_by_user_id,
    metadata
  )
  values (
    v_earning.team_id,
    'payout_success',
    -v_earning.amount_minor,
    v_earning.task_id,
    p_payout_id,
    v_payout.initiated_by_user_id,
    jsonb_build_object('fee_minor', p_fee_minor)
  );

  perform public.create_notification(
    v_earning.worker_user_id,
    v_earning.team_id,
    v_earning.task_id,
    'payout_success',
    'Payout completed',
    'Your payout has been sent successfully.',
    jsonb_build_object('payout_id', p_payout_id, 'task_id', v_earning.task_id)
  );

  return v_payout.id;
end;
$$;

create or replace function public.mark_payout_failed(
  p_payout_id uuid,
  p_reason text,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout public.payouts%rowtype;
  v_earning public.worker_earnings%rowtype;
begin
  select * into v_payout
  from public.payouts
  where id = p_payout_id
  for update;

  if v_payout.id is null then
    raise exception 'Payout not found';
  end if;

  select * into v_earning
  from public.worker_earnings
  where payout_id = p_payout_id
  for update;

  update public.payouts
  set status = 'failed',
      last_error = p_reason,
      provider_payload = coalesce(p_payload, '{}'::jsonb),
      updated_at = timezone('utc', now())
  where id = p_payout_id;

  update public.worker_earnings
  set status = 'failed',
      updated_at = timezone('utc', now())
  where id = v_earning.id;

  insert into public.wallet_ledger_entries (
    team_id,
    type,
    amount_minor,
    task_id,
    payout_id,
    created_by_user_id,
    metadata
  )
  values (
    v_earning.team_id,
    'payout_failure',
    0,
    v_earning.task_id,
    p_payout_id,
    v_payout.initiated_by_user_id,
    jsonb_build_object('reason', p_reason)
  );

  perform public.create_notification(
    v_earning.worker_user_id,
    v_earning.team_id,
    v_earning.task_id,
    'payout_failed',
    'Payout failed',
    'Your payout could not be completed yet. The team can retry it.',
    jsonb_build_object('payout_id', p_payout_id, 'task_id', v_earning.task_id)
  );

  return v_payout.id;
end;
$$;

create or replace function public.mark_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set read_at = timezone('utc', now())
  where user_id = auth.uid()
    and read_at is null;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists payout_methods_set_updated_at on public.payout_methods;
create trigger payout_methods_set_updated_at before update on public.payout_methods for each row execute function public.set_updated_at();
drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at before update on public.teams for each row execute function public.set_updated_at();
drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at before update on public.team_members for each row execute function public.set_updated_at();
drop trigger if exists team_wallets_set_updated_at on public.team_wallets;
create trigger team_wallets_set_updated_at before update on public.team_wallets for each row execute function public.set_updated_at();
drop trigger if exists payment_collections_set_updated_at on public.payment_collections;
create trigger payment_collections_set_updated_at before update on public.payment_collections for each row execute function public.set_updated_at();
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists worker_earnings_set_updated_at on public.worker_earnings;
create trigger worker_earnings_set_updated_at before update on public.worker_earnings for each row execute function public.set_updated_at();
drop trigger if exists payouts_set_updated_at on public.payouts;
create trigger payouts_set_updated_at before update on public.payouts for each row execute function public.set_updated_at();
drop trigger if exists provider_events_set_updated_at on public.provider_events;
create trigger provider_events_set_updated_at before update on public.provider_events for each row execute function public.set_updated_at();

grant execute on function public.create_team(text, public.payout_mode, public.payout_frequency, bigint, text) to authenticated;
grant execute on function public.join_team_by_code(text) to authenticated;
grant execute on function public.create_task(uuid, text, text, public.assignment_mode, bigint, timestamptz, uuid) to authenticated;
grant execute on function public.claim_task(uuid) to authenticated;
grant execute on function public.submit_task(uuid, text, jsonb) to authenticated;
grant execute on function public.review_task_submission(uuid, uuid, text, text) to authenticated;
grant execute on function public.cancel_task(uuid) to authenticated;
grant execute on function public.create_collection(uuid, bigint) to authenticated;
grant execute on function public.mark_notifications_read() to authenticated;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "payout_methods_self_all" on public.payout_methods;
create policy "payout_methods_self_all"
on public.payout_methods
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "teams_member_select" on public.teams;
create policy "teams_member_select"
on public.teams
for select
to authenticated
using (public.is_team_member(id, auth.uid()));

drop policy if exists "team_members_member_select" on public.team_members;
create policy "team_members_member_select"
on public.team_members
for select
to authenticated
using (public.is_team_member(team_id, auth.uid()));

drop policy if exists "team_wallet_admin_select" on public.team_wallets;
create policy "team_wallet_admin_select"
on public.team_wallets
for select
to authenticated
using (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "payment_collections_admin_select" on public.payment_collections;
create policy "payment_collections_admin_select"
on public.payment_collections
for select
to authenticated
using (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "tasks_member_select" on public.tasks;
create policy "tasks_member_select"
on public.tasks
for select
to authenticated
using (public.is_team_member(team_id, auth.uid()));

drop policy if exists "task_submissions_member_select" on public.task_submissions;
create policy "task_submissions_member_select"
on public.task_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_id
      and public.is_team_member(t.team_id, auth.uid())
  )
);

drop policy if exists "worker_earnings_owner_or_self_select" on public.worker_earnings;
create policy "worker_earnings_owner_or_self_select"
on public.worker_earnings
for select
to authenticated
using (
  worker_user_id = auth.uid()
  or public.is_team_admin(team_id, auth.uid())
);

drop policy if exists "payouts_owner_or_self_select" on public.payouts;
create policy "payouts_owner_or_self_select"
on public.payouts
for select
to authenticated
using (
  worker_user_id = auth.uid()
  or public.is_team_admin(team_id, auth.uid())
);

drop policy if exists "wallet_ledger_admin_select" on public.wallet_ledger_entries;
create policy "wallet_ledger_admin_select"
on public.wallet_ledger_entries
for select
to authenticated
using (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "notifications_self_select" on public.notifications;
create policy "notifications_self_select"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_self_update" on public.notifications;
create policy "notifications_self_update"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "chat_rooms_member_select" on public.chat_rooms;
create policy "chat_rooms_member_select"
on public.chat_rooms
for select
to authenticated
using (public.has_chat_access(id, auth.uid()));

drop policy if exists "chat_room_members_self_select" on public.chat_room_members;
create policy "chat_room_members_self_select"
on public.chat_room_members
for select
to authenticated
using (user_id = auth.uid() or public.has_chat_access(room_id, auth.uid()));

drop policy if exists "messages_member_select" on public.messages;
create policy "messages_member_select"
on public.messages
for select
to authenticated
using (public.has_chat_access(room_id, auth.uid()));

drop policy if exists "messages_member_insert" on public.messages;
create policy "messages_member_insert"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and public.has_chat_access(room_id, auth.uid())
);

insert into storage.buckets (id, name, public)
values ('task-evidence', 'task-evidence', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', false)
on conflict (id) do nothing;
