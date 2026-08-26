'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarStatusPedido } from './actions'

type ItemPedido = {
  id: string
  produto_nome: string
  preco_unitario: number
  quantidade: number
}

type Pedido = {
  id: string
  cliente_nome: string
  cliente_telefone: string
  tipo_entrega: string
  endereco: string | null
  total: number
  status: string
  forma_pagamento: string
  criado_em: string
  pedido_itens: ItemPedido[]
}

const LABEL_PAGAMENTO: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao_entrega: 'Cartão na entrega/retirada',
}

// Rótulo depende do tipo de entrega: "pronto" é uma etapa genérica no banco,
// mas para o lojista e o cliente ela significa coisas diferentes se é
// retirada no local ou entrega no endereço.
function statusLabel(status: string, tipoEntrega: string) {
  if (status === 'recebido') return 'Recebido'
  if (status === 'preparo') return 'Em preparo'
  if (status === 'pronto') return tipoEntrega === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada'
  if (status === 'entregue') return tipoEntrega === 'entrega' ? 'Entregue' : 'Retirado'
  if (status === 'cancelado') return 'Cancelado'
  return status
}

const STATUS_COR: Record<string, string> = {
  recebido: 'bg-blue-100 text-blue-700',
  preparo: 'bg-yellow-100 text-yellow-700',
  pronto: 'bg-green-100 text-green-700',
  entregue: 'bg-gray-200 text-gray-600',
  cancelado: 'bg-red-100 text-red-700',
}

const PROXIMO_STATUS: Record<string, string | null> = {
  recebido: 'preparo',
  preparo: 'pronto',
  pronto: 'entregue',
  entregue: null,
  cancelado: null,
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarHora(data: string) {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ListaPedidos({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter()

  // Atualiza a lista a cada 20s pra simular "tempo real" sem infra extra
  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), 20000)
    return () => clearInterval(intervalo)
  }, [router])

  return (
    <div className="flex flex-col gap-4">
      {pedidos.map((pedido) => {
        const proximo = PROXIMO_STATUS[pedido.status]
        return (
          <div key={pedido.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COR[pedido.status]}`}>
                {statusLabel(pedido.status, pedido.tipo_entrega)}
              </span>
              <span className="text-xs text-gray-400">{formatarHora(pedido.criado_em)}</span>
            </div>

            <p className="font-medium">{pedido.cliente_nome}</p>
            <p className="text-sm text-gray-500">{pedido.cliente_telefone}</p>
            <p className="text-sm text-gray-500">
              {pedido.tipo_entrega === 'entrega' ? `Entrega — ${pedido.endereco}` : 'Retirada no local'}
            </p>
            <p className="text-sm text-gray-500">
              Pagamento: {LABEL_PAGAMENTO[pedido.forma_pagamento] ?? pedido.forma_pagamento}
            </p>

            <ul className="text-sm mt-2 border-t pt-2">
              {pedido.pedido_itens.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.quantidade}x {item.produto_nome}</span>
                  <span>{formatarPreco(item.preco_unitario * item.quantidade)}</span>
                </li>
              ))}
            </ul>

            <p className="text-right font-semibold mt-2">{formatarPreco(pedido.total)}</p>

            <div className="flex gap-2 mt-3">
              {proximo && (
                <button
                  onClick={() => atualizarStatusPedido(pedido.id, proximo)}
                  className="bg-black text-white text-sm rounded-lg px-3 py-1.5"
                >
                  Marcar como {statusLabel(proximo, pedido.tipo_entrega)}
                </button>
              )}
              {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
                <button
                  onClick={() => {
                    if (confirm('Cancelar este pedido?')) {
                      atualizarStatusPedido(pedido.id, 'cancelado')
                    }
                  }}
                  className="text-red-600 text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )
      })}

      {pedidos.length === 0 && (
        <p className="text-gray-400 text-sm text-center mt-8">Nenhum pedido ainda.</p>
      )}
    </div>
  )
}
