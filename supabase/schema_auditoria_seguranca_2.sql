-- ============================================================
-- AUDITORIA DE SEGURANÇA — pré-lançamento comercial
-- ============================================================

-- 1) BUG CRÍTICO: a policy de UPDATE em `lojas` restringe a LINHA (só a
-- própria loja), mas não restringe COLUNA nenhuma. Isso permitia que
-- qualquer lojista, chamando a API do Supabase diretamente com o próprio
-- login (sem precisar de nada sofisticado), alterasse `status_assinatura`
-- para 'ativa' e nunca pagasse a assinatura.
--
-- RLS não faz controle por coluna — quem faz isso é GRANT/REVOKE do
-- Postgres. Aqui revogamos o UPDATE geral e liberamos apenas as colunas
-- que o lojista realmente deveria poder editar. Os campos financeiros/de
-- assinatura (status_assinatura, asaas_customer_id, asaas_subscription_id,
-- valor_mensalidade) passam a só ser alteráveis pela service role (usada
-- no webhook do Asaas).

revoke update on lojas from authenticated;
grant update (
  nome, whatsapp, endereco, horario_funcionamento, cor_primaria,
  pixel_meta_id, logo_url, aceitacao_automatica
) on lojas to authenticated;

-- 2) O cadastro de loja passou a ser feito inteiramente pela service role
-- (Server Action com rollback em caso de falha parcial), então a policy
-- que permitia qualquer usuário autenticado inserir linhas em `lojas` e
-- `lojistas` diretamente não é mais necessária — e era um vetor de spam
-- (criar lojas soltas via chamada direta à API).

drop policy if exists "Usuário autenticado pode criar loja" on lojas;
drop policy if exists "Usuário cria o próprio vínculo de lojista" on lojistas;
revoke insert on lojas from authenticated;
revoke insert on lojistas from authenticated;

-- 3) Controle de trial: hoje uma loja nasce com status 'trial' e nunca
-- expira sozinha, porque não existe data de expiração. Definindo 7 dias de
-- trial gratuito — ajustável depois, é só mudar o valor default e o backfill
-- abaixo caso queira outro prazo.

alter table lojas add column if not exists trial_expira_em timestamptz
  not null default (now() + interval '7 days');

-- Lojas já existentes (antes desta migration) ganham mais 7 dias de trial
-- a partir de agora, pra ninguém ser bloqueado de surpresa em produção.
update lojas set trial_expira_em = now() + interval '7 days'
where status_assinatura = 'trial';

-- 4) `pedidos`: o lojista só deveria poder mudar o STATUS do próprio
-- pedido (recebido → preparo → pronto → entregue/cancelado), não o total,
-- cliente ou itens depois que o pedido já foi criado.

revoke update on pedidos from authenticated;
grant update (status) on pedidos to authenticated;
