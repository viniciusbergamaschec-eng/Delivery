alter table lojas add column if not exists endereco text;
alter table lojas add column if not exists horario_funcionamento text;
alter table lojas add column if not exists cor_primaria text not null default '#16a34a';
