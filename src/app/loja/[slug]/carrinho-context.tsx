'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ItemCarrinho = {
  id: string
  nome: string
  preco: number
  quantidade: number
}

type CarrinhoContextType = {
  itens: ItemCarrinho[]
  adicionar: (produto: { id: string; nome: string; preco: number }) => void
  remover: (id: string) => void
  alterarQuantidade: (id: string, quantidade: number) => void
  total: number
  quantidadeTotal: number
  limpar: () => void
}

const CarrinhoContext = createContext<CarrinhoContextType | null>(null)

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  function adicionar(produto: { id: string; nome: string; preco: number }) {
    setItens((atual) => {
      const existente = atual.find((i) => i.id === produto.id)
      if (existente) {
        return atual.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...atual, { ...produto, quantidade: 1 }]
    })
  }

  function remover(id: string) {
    setItens((atual) => atual.filter((i) => i.id !== id))
  }

  function alterarQuantidade(id: string, quantidade: number) {
    if (quantidade <= 0) {
      remover(id)
      return
    }
    setItens((atual) => atual.map((i) => (i.id === id ? { ...i, quantidade } : i)))
  }

  function limpar() {
    setItens([])
  }

  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0)

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, remover, alterarQuantidade, total, quantidadeTotal, limpar }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider')
  return ctx
}
