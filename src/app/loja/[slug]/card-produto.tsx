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
  const { adicionar } = useCarrinho()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="font-semibold">{produto.nome}</p>
        {produto.descricao && (
          <p className="text-sm text-gray-500 mt-0.5">{produto.descricao}</p>
        )}
        <p className="text-sm font-bold mt-1.5" style={{ color: corPrimaria }}>
          {formatarPreco(produto.preco)}
        </p>
      </div>
      <button
        onClick={() => adicionar(produto)}
        style={{ backgroundColor: corPrimaria }}
        className="shrink-0 text-white rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-95 transition-transform"
      >
        Adicionar
      </button>
    </div>
  )
}
