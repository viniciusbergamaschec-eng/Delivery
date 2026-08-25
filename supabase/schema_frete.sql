create table regioes_entrega (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id) on delete cascade,
  nome text not null,
  taxa numeric(10,2) not null default 0,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

alter table regioes_entrega enable row level security;

create policy "Qualquer um pode ler regiões de entrega"
  on regioes_entrega for select
  using (true);

create policy "Lojista gerencia regiões da própria loja"
  on regioes_entrega for all
  using (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()))
  with check (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()));

-- Pedido passa a registrar a taxa de entrega aplicada
alter table pedidos add column if not exists taxa_entrega numeric(10,2) not null default 0;
alter table pedidos add column if not exists regiao_entrega text;
