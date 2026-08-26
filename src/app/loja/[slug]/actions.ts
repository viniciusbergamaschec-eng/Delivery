'use server'

import { createClient } from '@/lib/supabase/server'

type ItemPedido = {
  nome: string
  preco: number
  quantidade: number
}

export async function salvarPedido(dados: {
  lojaId: string
  clienteNome: string
  clienteTelefone: string
  tipoEntrega: 'retirada' | 'entrega'
  endereco?: string
  taxaEntrega?: number
  regiaoEntrega?: string
  formaPagamento: 'pix' | 'dinheiro' | 'cartao_entrega'
  total: number
  itens: ItemPedido[]
}) {
  const supabase = await createClient()

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({
      loja_id: dados.lojaId,
      cliente_nome: dados.clienteNome,
      cliente_telefone: dados.clienteTelefone,
      tipo_entrega: dados.tipoEntrega,
      endereco: dados.endereco ?? null,
      taxa_entrega: dados.taxaEntrega ?? 0,
      regiao_entrega: dados.regiaoEntrega ?? null,
      forma_pagamento: dados.formaPagamento,
      total: dados.total,
    })
    .select()
    .single()

  if (error || !pedido) {
    return { erro: error?.message ?? 'Erro ao salvar pedido' }
  }

  const { error: itensError } = await supabase.from('pedido_itens').insert(
    dados.itens.map((i) => ({
      pedido_id: pedido.id,
      produto_nome: i.nome,
      preco_unitario: i.preco,
      quantidade: i.quantidade,
    }))
  )

  if (itensError) {
    return { erro: itensError.message }
  }

  return { sucesso: true, pedidoId: pedido.id }
}
