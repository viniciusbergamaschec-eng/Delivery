-- Pixel Meta, logo da loja e flag de aceitação automática (sem efeito ainda,
-- reservado pra quando a impressão automática existir)
alter table lojas add column if not exists pixel_meta_id text;
alter table lojas add column if not exists logo_url text;
alter table lojas add column if not exists aceitacao_automatica boolean not null default false;

-- Bucket público de storage pra logos das lojas
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Qualquer um pode ver as logos (cardápio é público)
create policy "Qualquer um pode ver logos"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Só lojista autenticado pode enviar/atualizar/remover logo,
-- e só dentro de uma pasta com o próprio loja_id (ex: logos/<loja_id>/arquivo.png)
create policy "Lojista envia logo da própria loja"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select loja_id::text from lojistas where lojistas.id = auth.uid()
    )
  );

create policy "Lojista atualiza logo da própria loja"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select loja_id::text from lojistas where lojistas.id = auth.uid()
    )
  );

create policy "Lojista remove logo da própria loja"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select loja_id::text from lojistas where lojistas.id = auth.uid()
    )
  );
