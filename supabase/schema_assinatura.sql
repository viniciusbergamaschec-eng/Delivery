alter table lojas add column if not exists asaas_customer_id text;
alter table lojas add column if not exists asaas_subscription_id text;
alter table lojas add column if not exists valor_mensalidade numeric(10,2) not null default 49.90;
