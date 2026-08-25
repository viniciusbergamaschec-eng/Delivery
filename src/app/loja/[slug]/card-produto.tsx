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
}: {
  produto: Produto
  corPrimaria: string
}) {
  const { itens, adicionar, alterarQuantidade } = useCarrinho()
  const itemNoCarrinho = itens.find((i) => i.id === produto.id)
  const quantidade = itemNoCarrinho?.quantidade ?? 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div
        className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${corPrimaria}1a` }}
      >
        🍽️
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{produto.nome}</p>
        {produto.descricao && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{produto.descricao}</p>
        )}
        <p className="text-sm font-bold mt-1.5" style={{ color: corPrimaria }}>
          {formatarPreco(produto.preco)}
        </p>
      </div>

      {quantidade === 0 ? (
        <button
          onClick={() => adicionar(produto)}
          style={{ backgroundColor: corPrimaria }}
          className="shrink-0 text-white rounded-xl w-10 h-10 text-xl font-bold active:scale-90 transition-transform"
        >
          +
        </button>
      ) : (
        <div
          style={{ backgroundColor: corPrimaria }}
          className="shrink-0 flex items-center gap-2 rounded-xl px-1.5 py-1"
        >
          <button
            onClick={() => alterarQuantidade(produto.id, quantidade - 1)}
            className="text-white w-7 h-7 font-bold active:scale-90 transition-transform"
          >
            -
          </button>
          <span className="text-white font-semibold w-4 text-center">{quantidade}</span>
          <button
            onClick={() => adicionar(produto)}
            className="text-white w-7 h-7 font-bold active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
