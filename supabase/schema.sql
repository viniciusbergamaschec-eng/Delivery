-- Tabela de lojas
create table lojas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  whatsapp text,
  status_assinatura text not null default 'trial', -- trial | ativa | inadimplente | cancelada
  criado_em timestamptz not null default now()
);

-- Vínculo entre usuário autenticado (auth.users) e a loja que ele administra
create table lojistas (
  id uuid primary key references auth.users(id) on delete cascade,
  loja_id uuid not null references lojas(id) on delete cascade,
  email text not null,
  nome text,
  criado_em timestamptz not null default now()
);

-- Segurança: cada lojista só enxerga/edita a própria loja
alter table lojas enable row level security;
alter table lojistas enable row level security;

create policy "Lojista vê a própria loja"
  on lojas for select
  using (
    id in (select loja_id from lojistas where lojistas.id = auth.uid())
  );

create policy "Lojista edita a própria loja"
  on lojas for update
  using (
    id in (select loja_id from lojistas where lojistas.id = auth.uid())
  );

create policy "Qualquer um pode ler lojas (cardápio público)"
  on lojas for select
  using (true);

create policy "Lojista vê o próprio vínculo"
  on lojistas for select
  using (id = auth.uid());
