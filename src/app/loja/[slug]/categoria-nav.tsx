'use client'

import { useEffect, useState } from 'react'

type Categoria = { id: string; nome: string }

export default function CategoriaNav({
  categorias,
  corPrimaria,
}: {
  categorias: Categoria[]
  corPrimaria: string
}) {
  const [ativa, setAtiva] = useState(categorias[0]?.id ?? '')

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setAtiva(entrada.target.id.replace('cat-', ''))
          }
        })
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )

    categorias.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`)
      if (el) observador.observe(el)
    })

    return () => observador.disconnect()
  }, [categorias])

  return (
    <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {categorias.map((categoria) => {
          const estaAtiva = ativa === categoria.id
          return (
            <a
              key={categoria.id}
              href={`#cat-${categoria.id}`}
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300"
              style={
                estaAtiva
                  ? { backgroundColor: corPrimaria, borderColor: corPrimaria, color: '#fff' }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }
              }
            >
              {categoria.nome}
            </a>
          )
        })}
      </div>
    </div>
  )
}
