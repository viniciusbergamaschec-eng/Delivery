-- Controle manual de "loja aberta para pedidos". O campo horario_funcionamento
-- é texto livre e nunca foi usado pra bloquear pedido nenhum — qualquer
-- cliente podia pedir mesmo com a loja "fechada". Isso corrige com um toggle
-- simples que o lojista controla, e que o servidor passa a checar de verdade
-- antes de aceitar um pedido (não é só cosmético na tela).

alter table lojas add column if not exists aberta boolean not null default true;

-- Coluna editável pelo próprio lojista, junto das outras configurações
-- já liberadas (essa tabela tem grant por coluna desde a auditoria de
-- segurança anterior — sem isso, o toggle falharia com "permission denied").
grant update (aberta) on lojas to authenticated;

-- A view pública (lojas_publicas) só expõe colunas específicas — sem
-- recriá-la com "aberta" incluída, o cardápio público nunca saberia se a
-- loja está fechada.
create or replace view lojas_publicas
with (security_invoker = false)
as
select id, nome, slug, whatsapp, endereco, horario_funcionamento,
       cor_primaria, logo_url, pixel_meta_id, aberta
from lojas;

grant select on lojas_publicas to anon, authenticated;
