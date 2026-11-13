-- Add monthly and annual pricing for the separate pre-1955 membership.
-- Annual price follows the same 10-months-for-12 policy as ORDO 1962.
insert into public.plan_prices(plan_code,interval_unit,amount_vnd,currency,is_active)
values
  ('ORDO_PRE55','month',69000,'VND',true),
  ('ORDO_PRE55','year',690000,'VND',true)
on conflict (plan_code,interval_unit) do update set
  amount_vnd=excluded.amount_vnd,
  currency=excluded.currency,
  is_active=true;
