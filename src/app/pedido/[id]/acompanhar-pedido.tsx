'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type StatusPedido = {
  id: string
  status: string
  tipo_entrega: string
  total: number
  forma_pagamento: string
  criado_em: string
  nome_loja: string
}

const ETAPAS = ['recebido', 'preparo', 'pronto', 'entregue']

function labelEtapa(etapa: string, tipoEntrega: string) {
  if (etapa === 'recebido') return 'Pedido recebido'
  if (etapa === 'preparo') return 'Em preparo'
  if (etapa === 'pronto') return tipoEntrega === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada'
  if (etapa === 'entregue') return tipoEntrega === 'entrega' ? 'Entregue' : 'Retirado'
  return etapa
}

const LABEL_PAGAMENTO: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro na entrega/retirada',
  cartao_entrega: 'Cartão na entrega/retirada',
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AcompanharPedido({ pedidoId }: { pedidoId: string }) {
  const [pedido, setPedido] = useState<StatusPedido | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const buscar = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('obter_status_pedido', { p_pedido_id: pedidoId })
    if (error || !data || data.length === 0) {
      setErro(true)
    } else {
      setPedido(data[0])
    }
    setCarregando(false)
  }, [pedidoId])

  useEffect(() => {
    buscar()
    const intervalo = setInterval(buscar, 15000)
    return () => clearInterval(intervalo)
  }, [buscar])

  if (carregando) {
    return <p className="text-gray-400 text-sm">Carregando pedido...</p>
  }

  if (erro || !pedido) {
    return <p className="text-gray-500 text-sm">Pedido não encontrado.</p>
  }

  const cancelado = pedido.status === 'cancelado'
  const passoAtual = ETAPAS.indexOf(pedido.status)

  return (
    <div className="bg-white rounded-3xl shadow p-6 w-full max-w-sm">
      <p className="text-sm text-gray-400">{pedido.nome_loja}</p>
      <h1 className="font-bold text-xl mb-6">Seu pedido</h1>

      {cancelado ? (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          Este pedido foi cancelado.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {ETAPAS.map((etapa, i) => {
            const feito = i <= passoAtual
            return (
              <div key={etapa} className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    feito ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
                <span className={`text-sm ${feito ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {labelEtapa(etapa, pedido.tipo_entrega)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="border-t pt-4 flex flex-col gap-1 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Forma de pagamento</span>
          <span className="font-medium text-gray-800">
            {LABEL_PAGAMENTO[pedido.forma_pagamento] ?? pedido.forma_pagamento}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-medium text-gray-800">{formatarPreco(pedido.total)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-4 text-center">Atualiza automaticamente</p>
    </div>
  )
}
