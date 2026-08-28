'use client'

import { useCarrinho } from './carrinho-context'

type Produto = {
  id: string
  nome: string
  descricao: string | null
  preco: number
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CardProduto({
  produto,
  corPrimaria,
  atraso = 0,
}: {
  produto: Produto
  corPrimaria: string
  atraso?: number
}) {
  const { itens, adicionar, alterarQuantidade } = useCarrinho()
  const itemNoCarrinho = itens.find((i) => i.id === produto.id)
  const quantidade = itemNoCarrinho?.quantidade ?? 0

  return (
    <div
      className="animate-fade-in-up group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-transparent"
      style={{ animationDelay: `${atraso}ms`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `linear-gradient(145deg, ${corPrimaria}22, ${corPrimaria}0d)`,
        }}
      >
        🍽️
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-gray-900 truncate">{produto.nome}</p>
        {produto.descricao && (
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2 leading-snug">{produto.descricao}</p>
        )}
        <p className="text-sm font-bold mt-1.5" style={{ color: corPrimaria }}>
          {formatarPreco(produto.preco)}
        </p>
      </div>

      {quantidade === 0 ? (
        <button
          onClick={() => adicionar(produto)}
          style={{ backgroundColor: corPrimaria }}
          className="shrink-0 text-white rounded-full w-10 h-10 text-xl font-bold active:scale-90 transition-transform duration-150 shadow-sm hover:shadow-md flex items-center justify-center"
        >
          +
        </button>
      ) : (
        <div
          style={{ backgroundColor: corPrimaria }}
          className="shrink-0 flex items-center gap-2.5 rounded-full px-2 py-1.5 shadow-sm animate-fade-in-up"
        >
          <button
            onClick={() => alterarQuantidade(produto.id, quantidade - 1)}
            className="text-white w-6 h-6 font-bold active:scale-90 transition-transform duration-150 flex items-center justify-center"
          >
            −
          </button>
          <span className="text-white font-semibold w-4 text-center text-sm tabular-nums">{quantidade}</span>
          <button
            onClick={() => adicionar(produto)}
            className="text-white w-6 h-6 font-bold active:scale-90 transition-transform duration-150 flex items-center justify-center"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
