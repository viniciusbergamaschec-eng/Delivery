-- ============================================================
-- AUDITORIA DE RLS: correções de segurança
-- ============================================================

-- 1) A policy "Qualquer um pode ler lojas" (using true) expõe a tabela
-- lojas INTEIRA a qualquer chamada direta na API com a anon key —
-- incluindo asaas_customer_id, asaas_subscription_id e pixel_meta_id,
-- que não deveriam ser públicos. O código do site nunca pedia essas
-- colunas, mas RLS não protege por coluna, só por linha: quem decide
-- o que é público é a policy, não o `.select()` do frontend.
--
-- Correção: a leitura pública passa a ser feita por uma VIEW com
-- apenas as colunas necessárias pro cardápio. A tabela `lojas` deixa
-- de ter select público — só o próprio lojista autenticado lê a
-- linha inteira (policy que já existia, mantida).

drop policy if exists "Qualquer um pode ler lojas (cardápio público)" on lojas;

create or replace view lojas_publicas
with (security_invoker = false)
as
select id, nome, slug, whatsapp, endereco, horario_funcionamento,
       cor_primaria, logo_url, pixel_meta_id
from lojas;

grant select on lojas_publicas to anon, authenticated;

-- 2) pedidos/pedido_itens aceitavam qualquer total/preço vindo do
-- cliente (with check (true), sem validação de valor). Isso permitia
-- inserir pedido com total forjado via chamada direta à API,
-- inflando ou fraudando o dashboard financeiro do lojista.
--
-- A correção de verdade (recalcular preço a partir do produto real
-- no banco) foi feita no código da Server Action `salvarPedido`, que
-- agora ignora o preço/total enviado pelo cliente e recalcula tudo
-- a partir de `produtos` e `regioes_entrega`. Aqui reforçamos com
-- constraints de sanidade que bloqueiam valores fisicamente inválidos
-- mesmo que alguém burle a Server Action e insira direto na API:

alter table pedidos drop constraint if exists pedidos_total_positivo;
alter table pedidos add constraint pedidos_total_positivo check (total >= 0);

alter table pedidos drop constraint if exists pedidos_taxa_entrega_positiva;
alter table pedidos add constraint pedidos_taxa_entrega_positiva check (taxa_entrega >= 0);

alter table pedido_itens drop constraint if exists pedido_itens_preco_positivo;
alter table pedido_itens add constraint pedido_itens_preco_positivo check (preco_unitario >= 0);

alter table pedido_itens drop constraint if exists pedido_itens_quantidade_valida;
alter table pedido_itens add constraint pedido_itens_quantidade_valida check (quantidade > 0 and quantidade <= 99);
