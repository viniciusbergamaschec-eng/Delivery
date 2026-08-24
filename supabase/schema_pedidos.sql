create table pedidos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id) on delete cascade,
  cliente_nome text not null,
  cliente_telefone text not null,
  tipo_entrega text not null default 'retirada', -- retirada | entrega
  endereco text,
  total numeric(10,2) not null,
  status text not null default 'recebido', -- recebido | preparo | pronto | entregue | cancelado
  criado_em timestamptz not null default now()
);

create table pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_nome text not null, -- guarda o nome no momento do pedido (histórico não muda se o produto for editado depois)
  preco_unitario numeric(10,2) not null,
  quantidade int not null
);

alter table pedidos enable row level security;
alter table pedido_itens enable row level security;

-- Qualquer cliente pode CRIAR um pedido (não precisa estar logado)
create policy "Qualquer um pode criar pedido"
  on pedidos for insert
  with check (true);

create policy "Qualquer um pode criar itens de pedido"
  on pedido_itens for insert
  with check (true);

-- Só o lojista da loja pode LER e ATUALIZAR os pedidos da própria loja
create policy "Lojista lê pedidos da própria loja"
  on pedidos for select
  using (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()));

create policy "Lojista atualiza pedidos da própria loja"
  on pedidos for update
  using (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()))
  with check (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()));

create policy "Lojista lê itens dos próprios pedidos"
  on pedido_itens for select
  using (pedido_id in (
    select id from pedidos where loja_id in (
      select loja_id from lojistas where lojistas.id = auth.uid()
    )
  ));
