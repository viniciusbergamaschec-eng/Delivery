-- Categorias do cardápio (ex: Lanches, Bebidas) — nome editável pelo lojista
create table categorias (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

-- Produtos do cardápio
create table produtos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id) on delete cascade,
  categoria_id uuid references categorias(id) on delete set null,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  disponivel boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

alter table categorias enable row level security;
alter table produtos enable row level security;

-- Leitura pública (cardápio do cliente precisa ver sem estar logado)
create policy "Qualquer um pode ler categorias"
  on categorias for select
  using (true);

create policy "Qualquer um pode ler produtos"
  on produtos for select
  using (true);

-- Lojista só mexe na própria loja
create policy "Lojista gerencia categorias da própria loja"
  on categorias for all
  using (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()))
  with check (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()));

create policy "Lojista gerencia produtos da própria loja"
  on produtos for all
  using (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()))
  with check (loja_id in (select loja_id from lojistas where lojistas.id = auth.uid()));
