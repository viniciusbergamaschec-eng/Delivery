-- Forma de pagamento escolhida pelo cliente no carrinho.
-- Apenas registro: não há processamento de pagamento nem geração de Pix aqui.
alter table pedidos add column if not exists forma_pagamento text not null default 'dinheiro';

alter table pedidos drop constraint if exists pedidos_forma_pagamento_check;
alter table pedidos add constraint pedidos_forma_pagamento_check
  check (forma_pagamento in ('pix', 'dinheiro', 'cartao_entrega'));

-- Acompanhamento do pedido pelo cliente, sem login.
--
-- Por que uma função em vez de uma policy de RLS "using (true)" para SELECT:
-- uma policy pública de leitura na tabela `pedidos` permitiria que QUALQUER
-- pessoa com a anon key listasse todos os pedidos de todas as lojas (nome,
-- telefone, endereço de todo mundo), bastando não aplicar o filtro por id —
-- RLS não sabe se a query no app tinha um .eq('id', ...) ou não, quem decide
-- o que é acessível é a policy, não o código do frontend.
--
-- Essa função, em vez disso, só devolve dados de UM pedido específico, dado
-- o id exato (que é um UUID praticamente impossível de adivinhar). Não dá
-- pra usá-la para listar ou descobrir outros pedidos.
create or replace function obter_status_pedido(p_pedido_id uuid)
returns table (
  id uuid,
  status text,
  tipo_entrega text,
  total numeric,
  forma_pagamento text,
  criado_em timestamptz,
  nome_loja text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.status,
    p.tipo_entrega,
    p.total,
    p.forma_pagamento,
    p.criado_em,
    l.nome as nome_loja
  from pedidos p
  join lojas l on l.id = p.loja_id
  where p.id = p_pedido_id;
$$;

-- Permite que o cliente (sem estar autenticado) chame a função pelo anon key.
grant execute on function obter_status_pedido(uuid) to anon, authenticated;
