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

export default function CardProduto({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho()

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-3">
      <div>
        <p className="font-medium">{produto.nome}</p>
        {produto.descricao && <p className="text-sm text-gray-500">{produto.descricao}</p>}
        <p className="text-sm font-semibold mt-1">{formatarPreco(produto.preco)}</p>
      </div>
      <button
        onClick={() => adicionar(produto)}
        className="shrink-0 bg-black text-white rounded-lg px-3 py-2 text-sm font-medium"
      >
        Adicionar
      </button>
    </div>
  )
}
