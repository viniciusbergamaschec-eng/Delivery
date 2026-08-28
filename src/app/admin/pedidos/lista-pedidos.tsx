'use client'

import { useEffect, useState } from 'react'
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

const COLUNAS = ['recebido', 'preparo', 'pronto', 'entregue'] as const

// Rótulo depende do tipo de entrega: "pronto" é uma etapa genérica no banco,
// mas para o lojista e o cliente ela significa coisas diferentes se é
// retirada no local ou entrega no endereço.
function statusLabel(status: string, tipoEntrega: string) {
  if (status === 'recebido') return 'Recebido'
  if (status === 'preparo') return 'Em preparo'
  if (status === 'pronto') return tipoEntrega === 'entrega' ? 'Saiu para entrega' : 'Pronto p/ retirada'
  if (status === 'entregue') return tipoEntrega === 'entrega' ? 'Concluído' : 'Retirado'
  if (status === 'cancelado') return 'Cancelado'
  return status
}

const COLUNA_ESTILO: Record<string, { dot: string; borda: string; fundo: string }> = {
  recebido: { dot: 'bg-sky-500', borda: 'border-t-sky-500', fundo: 'bg-sky-50/60' },
  preparo: { dot: 'bg-amber-500', borda: 'border-t-amber-500', fundo: 'bg-amber-50/60' },
  pronto: { dot: 'bg-violet-500', borda: 'border-t-violet-500', fundo: 'bg-violet-50/60' },
  entregue: { dot: 'bg-emerald-500', borda: 'border-t-emerald-500', fundo: 'bg-emerald-50/60' },
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

export default function ListaPedidos({ pedidos: pedidosServidor }: { pedidos: Pedido[] }) {
  const router = useRouter()
  // Estado local pra mover o card na hora do clique (otimista), sem esperar
  // o round-trip do servidor — sensação mais fluida pro lojista organizando
  // vários pedidos em sequência.
  const [pedidos, setPedidos] = useState(pedidosServidor)
  const [mostrarCancelados, setMostrarCancelados] = useState(false)

  useEffect(() => {
    setPedidos(pedidosServidor)
  }, [pedidosServidor])

  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), 20000)
    return () => clearInterval(intervalo)
  }, [router])

  function avancar(pedido: Pedido) {
    const proximo = PROXIMO_STATUS[pedido.status]
    if (!proximo) return
    setPedidos((atual) => atual.map((p) => (p.id === pedido.id ? { ...p, status: proximo } : p)))
    atualizarStatusPedido(pedido.id, proximo).then(() => router.refresh())
  }

  function cancelar(pedido: Pedido) {
    if (!confirm('Cancelar este pedido?')) return
    setPedidos((atual) => atual.map((p) => (p.id === pedido.id ? { ...p, status: 'cancelado' } : p)))
    atualizarStatusPedido(pedido.id, 'cancelado').then(() => router.refresh())
  }

  const cancelados = pedidos.filter((p) => p.status === 'cancelado')
  const ativos = pedidos.filter((p) => p.status !== 'cancelado')

  if (ativos.length === 0 && cancelados.length === 0) {
    return <p className="text-gray-400 text-sm text-center mt-8">Nenhum pedido ainda.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUNAS.map((coluna) => {
          const doColuna = ativos.filter((p) => p.status === coluna)
          const estilo = COLUNA_ESTILO[coluna]
          return (
            <div key={coluna} className={`rounded-2xl border-t-4 ${estilo.borda} ${estilo.fundo} p-3 flex flex-col gap-3 min-h-[120px]`}>
              <div className="flex items-center gap-2 px-1">
                <span className={`w-2 h-2 rounded-full ${estilo.dot}`} />
                <h2 className="font-semibold text-sm text-gray-700">
                  {statusLabel(coluna, doColuna[0]?.tipo_entrega ?? 'entrega')}
                </h2>
                <span className="ml-auto text-xs font-medium text-gray-400 bg-white/70 rounded-full px-2 py-0.5">
                  {doColuna.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {doColuna.map((pedido) => {
                  const proximo = PROXIMO_STATUS[pedido.status]
                  return (
                    <div
                      key={pedido.id}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3 relative"
                    >
                      <button
                        onClick={() => cancelar(pedido)}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Cancelar pedido"
                      >
                        ✕
                      </button>

                      <p className="font-medium text-sm pr-5">{pedido.cliente_nome}</p>
                      <p className="text-xs text-gray-400">{formatarHora(pedido.criado_em)}</p>

                      <p className="text-xs text-gray-500 mt-1.5 truncate">
                        {pedido.tipo_entrega === 'entrega' ? pedido.endereco : 'Retirada no local'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {LABEL_PAGAMENTO[pedido.forma_pagamento] ?? pedido.forma_pagamento}
                      </p>

                      <ul className="text-xs mt-2 pt-2 border-t border-gray-100 flex flex-col gap-0.5">
                        {pedido.pedido_itens.map((item) => (
                          <li key={item.id} className="flex justify-between text-gray-500">
                            <span className="truncate pr-2">{item.quantidade}x {item.produto_nome}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="text-right font-semibold text-sm mt-1.5">{formatarPreco(pedido.total)}</p>

                      {proximo && (
                        <button
                          onClick={() => avancar(pedido)}
                          className="mt-2 w-full text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 active:scale-[0.98] transition-all rounded-lg py-2 flex items-center justify-center gap-1"
                        >
                          {statusLabel(proximo, pedido.tipo_entrega)}
                          <span aria-hidden>→</span>
                        </button>
                      )}
                    </div>
                  )
                })}

                {doColuna.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">Vazio</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {cancelados.length > 0 && (
        <div>
          <button
            onClick={() => setMostrarCancelados((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {mostrarCancelados ? 'Ocultar' : 'Ver'} cancelados ({cancelados.length}) {mostrarCancelados ? '▲' : '▼'}
          </button>

          {mostrarCancelados && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {cancelados.map((pedido) => (
                <div key={pedido.id} className="bg-gray-50 rounded-xl p-3 opacity-70">
                  <p className="font-medium text-sm">{pedido.cliente_nome}</p>
                  <p className="text-xs text-gray-400">{formatarHora(pedido.criado_em)}</p>
                  <p className="text-right font-semibold text-sm mt-1.5 text-gray-500">{formatarPreco(pedido.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
