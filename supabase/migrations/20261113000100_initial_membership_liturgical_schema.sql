-- LICH ROMA: schema nền tảng cho hội viên và dữ liệu phụng vụ.
-- Chạy bằng Supabase CLI hoặc SQL Editor. Không chứa khóa thanh toán hay bí mật.
begin;

create extension if not exists pgcrypto;

-- 1) Danh mục lịch và gói sản phẩm
create table if not exists public.liturgical_calendars (
  code text primary key check (code in ('1962','PRE55')),
  name_vi text not null,
  name_la text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.liturgical_calendars(code,name_vi,name_la,description)
values
 ('1962','Lịch Rôma 1962','Calendarium Romanum 1962','Lịch phụng vụ theo Missale Romanum 1962.'),
 ('PRE55','Lịch Rôma trước 1955','Calendarium Romanum ante 1955','Niên lịch phụng vụ trước các cải tổ năm 1955.')
on conflict (code) do update set
 name_vi=excluded.name_vi,
 name_la=excluded.name_la,
 description=excluded.description;

create table if not exists public.plans (
  code text primary key check (code in ('ORDO_1962','ORDO_PRE55')),
  name_vi text not null,
  calendar_code text not null references public.liturgical_calendars(code),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.plans(code,name_vi,calendar_code,description)
values
 ('ORDO_1962','Hội viên ORDO 1962','1962','Truy cập đầy đủ lịch và sách lễ Rôma 1962.'),
 ('ORDO_PRE55','Hội viên ORDO tiền 1955','PRE55','Truy cập đầy đủ lịch và sách lễ Rôma trước 1955.')
on conflict (code) do update set
 name_vi=excluded.name_vi,
 calendar_code=excluded.calendar_code,
 description=excluded.description;

create table if not exists public.plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null references public.plans(code),
  interval_unit text not null check (interval_unit in ('month','year')),
  amount_vnd integer not null check (amount_vnd > 0),
  currency char(3) not null default 'VND' check (currency='VND'),
  provider text,
  provider_price_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(plan_code,interval_unit)
);

-- Giá đã chốt cho cả hai thư viện. Gói năm bằng 10 tháng phí tháng (tặng 2 tháng).
insert into public.plan_prices(plan_code,interval_unit,amount_vnd)
values
 ('ORDO_1962','month',39000),
 ('ORDO_1962','year',390000),
 ('ORDO_PRE55','month',69000),
 ('ORDO_PRE55','year',690000)
on conflict (plan_code,interval_unit) do update set
 amount_vnd=excluded.amount_vnd,
 is_active=true;

-- 2) Hồ sơ và vai trò. Không cho người dùng tự cấp role.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('member','editor','admin')),
  created_at timestamptz not null default now(),
  primary key(user_id,role)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles(id,display_name,email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.email
  )
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- 3) Đăng ký, giao dịch và quyền hội viên.
-- Trạng thái chỉ được cập nhật bởi backend/webhook đáng tin cậy.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  price_id uuid not null references public.plan_prices(id),
  provider text not null,
  provider_subscription_id text,
  status text not null default 'pending'
    check (status in ('pending','active','past_due','cancelled','expired','failed')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_subscription_id)
);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_code text not null references public.liturgical_calendars(code),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  source text not null default 'subscription'
    check (source in ('subscription','manual','compensation')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until > valid_from)
);

create index if not exists entitlements_user_calendar_period_idx
  on public.entitlements(user_id,calendar_code,valid_from,valid_until);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null,
  provider_transaction_id text,
  amount_vnd integer not null check (amount_vnd >= 0),
  currency char(3) not null default 'VND' check (currency='VND'),
  status text not null check (status in ('initiated','pending','succeeded','failed','refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,provider_transaction_id)
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  signature_valid boolean not null default false,
  processed_at timestamptz,
  processing_status text not null default 'received'
    check (processing_status in ('received','processed','ignored','failed')),
  payload jsonb,
  created_at timestamptz not null default now(),
  unique(provider,provider_event_id)
);

-- 4) Dữ liệu phụng vụ: ngày, từng mục, nguồn sách.
create table if not exists public.liturgical_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_or_editor text,
  edition text,
  publication_year integer,
  page_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.liturgical_days (
  id uuid primary key default gen_random_uuid(),
  calendar_code text not null references public.liturgical_calendars(code),
  civil_date date not null,
  title_la text,
  title_vi text not null,
  class text,
  liturgical_color text,
  season text,
  day_type text,
  is_sunday boolean not null default false,
  is_solemnity boolean not null default false,
  is_published boolean not null default false,
  source_id uuid references public.liturgical_sources(id) on delete set null,
  editorial_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(calendar_code,civil_date)
);

create index if not exists liturgical_days_date_idx
  on public.liturgical_days(calendar_code,civil_date);

drop trigger if exists liturgical_days_set_updated_at on public.liturgical_days;
create trigger liturgical_days_set_updated_at
before update on public.liturgical_days
for each row execute function public.set_updated_at();

create table if not exists public.liturgical_sections (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.liturgical_days(id) on delete cascade,
  position integer not null check (position >= 0),
  section_key text not null,
  label_la text,
  label_vi text not null,
  reference_la text,
  reference_vi text,
  text_la text,
  text_vi text,
  is_free_today boolean not null default false,
  is_published boolean not null default false,
  source_id uuid references public.liturgical_sources(id) on delete set null,
  editorial_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(day_id,position),
  check (section_key ~ '^[a-z0-9_]+$')
);

create index if not exists liturgical_sections_day_position_idx
  on public.liturgical_sections(day_id,position);

drop trigger if exists liturgical_sections_set_updated_at on public.liturgical_sections;
create trigger liturgical_sections_set_updated_at
before update on public.liturgical_sections
for each row execute function public.set_updated_at();

-- 5) Nhật ký quản trị và kiểm toán.
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

-- 6) Hàm quyền truy cập. SECURITY DEFINER để RLS gọi an toàn,
-- không dựa vào dữ liệu plan/role do trình duyệt tự khai báo.
create or replace function public.has_calendar_access(p_calendar_code text)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.entitlements e
    where e.user_id = auth.uid()
      and e.calendar_code = p_calendar_code
      and e.valid_from <= now()
      and (e.valid_until is null or e.valid_until > now())
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  );
$$;

create or replace function public.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role in ('editor','admin')
  );
$$;

create or replace function public.is_vietnam_today(p_date date)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select p_date = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

revoke all on function public.has_calendar_access(text) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_content_editor() from public;
revoke all on function public.is_vietnam_today(date) from public;
grant execute on function public.has_calendar_access(text) to anon, authenticated;
grant execute on function public.is_vietnam_today(date) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_content_editor() to authenticated;

-- 7) Bật RLS trên mọi bảng nghiệp vụ.
alter table public.liturgical_calendars enable row level security;
alter table public.plans enable row level security;
alter table public.plan_prices enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.liturgical_sources enable row level security;
alter table public.liturgical_days enable row level security;
alter table public.liturgical_sections enable row level security;
alter table public.audit_logs enable row level security;

-- Bảng công khai chỉ đọc.
create policy "Active calendars are readable"
on public.liturgical_calendars for select to anon, authenticated
using (is_active);

create policy "Active plans are readable"
on public.plans for select to anon, authenticated
using (is_active);

create policy "Active prices are readable"
on public.plan_prices for select to anon, authenticated
using (is_active);

-- Hồ sơ: người dùng chỉ đọc/sửa hồ sơ của chính mình.
create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins manage profiles"
on public.profiles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins read roles"
on public.user_roles for select to authenticated
using (public.is_admin());

-- Người dùng chỉ đọc dữ liệu đăng ký/quyền/thanh toán của mình.
create policy "Users read own subscriptions"
on public.subscriptions for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users read own entitlements"
on public.entitlements for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users read own payments"
on public.payments for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Admins read webhook events"
on public.payment_webhook_events for select to authenticated
using (public.is_admin());

create policy "Admins read audit logs"
on public.audit_logs for select to authenticated
using (public.is_admin());

-- Nguồn tư liệu chỉ hiển thị cho biên tập viên/quản trị viên.
create policy "Editors read sources"
on public.liturgical_sources for select to authenticated
using (public.is_content_editor());

create policy "Editors manage sources"
on public.liturgical_sources for all to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

-- Ngày lễ: Free chỉ thấy metadata của ngày hiện tại; gói tương ứng thấy lịch đầy đủ.
create policy "Read current day or entitled calendar metadata"
on public.liturgical_days for select to anon, authenticated
using (
  is_published
  and (
    public.is_vietnam_today(civil_date)
    or public.has_calendar_access(calendar_code)
  )
);

create policy "Editors manage liturgical days"
on public.liturgical_days for all to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

-- Mục sách lễ: Free chỉ thấy hai phần được đánh dấu miễn phí của hôm nay.
-- Mọi phần khác yêu cầu entitlement đúng với niên lịch của ngày đó.
create policy "Read free today sections or entitled calendar sections"
on public.liturgical_sections for select to anon, authenticated
using (
  is_published
  and exists (
    select 1
    from public.liturgical_days d
    where d.id = liturgical_sections.day_id
      and d.is_published
      and (
        public.has_calendar_access(d.calendar_code)
        or (
          public.is_vietnam_today(d.civil_date)
          and liturgical_sections.is_free_today
          and liturgical_sections.section_key in ('bai_tho','phuc_am_thu')
        )
      )
  )
);

create policy "Editors manage liturgical sections"
on public.liturgical_sections for all to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

-- Không tạo INSERT/UPDATE/DELETE policy cho subscriptions, entitlements,
-- payments, webhook events hoặc roles. Chỉ backend service-role mới được ghi.
commit;
