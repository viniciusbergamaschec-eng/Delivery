-- Pagamento Pix do cliente final, direto na conta do lojista (subconta
-- Asaas). Opcional por loja — não substitui "combinar na entrega/WhatsApp",
-- fica como opção extra no checkout quando o lojista configurar.

alter table lojas add column if not exists asaas_subconta_id text;
alter table lojas add column if not exists asaas_subconta_wallet_id text;
-- Chave de API da PRÓPRIA subconta do lojista. Só a service role grava isso
-- (nunca o client comum) — é credencial com poder de criar cobrança e ver
-- saldo. O lojista PODE ler a própria linha (RLS de sempre), só não pode
-- editar essa coluna diretamente.
alter table lojas add column if not exists asaas_subconta_api_key text;
alter table lojas add column if not exists asaas_subconta_status text not null default 'nao_configurada';
-- nao_configurada | pendente | ativa | rejeitada
alter table lojas add column if not exists pix_habilitado boolean not null default false;

-- O lojista pode ligar/desligar a opção de Pix no checkout a qualquer
-- momento (depois de aprovado), mas não pode editar os campos de
-- credencial/status — esses só a service role mexe (criação da subconta e
-- webhook de aprovação).
grant update (pix_habilitado) on lojas to authenticated;

-- Rastreia a cobrança Pix gerada pra cada pedido, pra bater com o webhook
-- de confirmação de pagamento sem ambiguidade.
alter table pedidos add column if not exists asaas_payment_id text;
alter table pedidos add column if not exists pago boolean not null default false;

-- View pública precisa saber se a loja aceita Pix pelo app — mas NUNCA expõe
-- a api key da subconta nem o id dela, isso é feito via service role.
create or replace view lojas_publicas
with (security_invoker = false)
as
select id, nome, slug, whatsapp, endereco, horario_funcionamento,
       cor_primaria, logo_url, pixel_meta_id, aberta, pix_habilitado
from lojas;

grant select on lojas_publicas to anon, authenticated;
