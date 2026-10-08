-- Horário de funcionamento programado + liga/desliga de entrega e retirada.

-- modo_funcionamento: 'manual' (só o botão aberta/fechada) ou 'programado'
-- (só aceita pedido dentro dos horários). horarios é um array de 7 dias
-- (índice 0 = domingo), cada um { ativo, abre, fecha }.
alter table lojas add column if not exists modo_funcionamento text not null default 'manual';
alter table lojas add column if not exists horarios jsonb;
alter table lojas add column if not exists fuso_horario text not null default 'America/Sao_Paulo';
alter table lojas add column if not exists aceita_entrega boolean not null default true;
alter table lojas add column if not exists aceita_retirada boolean not null default true;

alter table lojas drop constraint if exists lojas_modo_funcionamento_valido;
alter table lojas add constraint lojas_modo_funcionamento_valido
  check (modo_funcionamento in ('manual', 'programado'));

alter table lojas drop constraint if exists lojas_fuso_horario_valido;
alter table lojas add constraint lojas_fuso_horario_valido
  check (fuso_horario in ('America/Sao_Paulo', 'America/Manaus', 'America/Rio_Branco', 'America/Noronha'));

-- Pelo menos uma modalidade precisa ficar ligada, senão ninguém consegue pedir.
alter table lojas drop constraint if exists lojas_ao_menos_uma_modalidade;
alter table lojas add constraint lojas_ao_menos_uma_modalidade
  check (aceita_entrega or aceita_retirada);

-- O lojista edita essas colunas direto (a tabela tem grant por coluna desde
-- a auditoria de segurança — sem isso daria "permission denied").
grant update (modo_funcionamento, horarios, fuso_horario, aceita_entrega, aceita_retirada)
  on lojas to authenticated;

-- A view pública precisa dessas colunas pro cardápio saber se está aberto e
-- quais modalidades mostrar. Colunas novas sempre no FIM (exigência do
-- create or replace view).
create or replace view lojas_publicas
with (security_invoker = false)
as
select id, nome, slug, whatsapp, endereco, horario_funcionamento,
       cor_primaria, logo_url, pixel_meta_id, aberta, pix_habilitado,
       modo_funcionamento, horarios, fuso_horario, aceita_entrega, aceita_retirada
from lojas;

grant select on lojas_publicas to anon, authenticated;
