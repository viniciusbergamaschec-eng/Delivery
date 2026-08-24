'use client'

import { useActionState, useState } from 'react'
import { criarCategoria, renomearCategoria, excluirCategoria } from './actions'

type Categoria = { id: string; nome: string }

export default function GerenciadorCategorias({ categorias }: { categorias: Categoria[] }) {
  const [state, formAction, pending] = useActionState(criarCategoria, null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  return (
    <section className="bg-white rounded-xl shadow p-5">
      <h2 className="font-semibold mb-3">Categorias</h2>

      <ul className="flex flex-col gap-2 mb-4">
        {categorias.map((cat) => (
          <li key={cat.id}>
            {editandoId === cat.id ? (
              <FormRenomear
                categoria={cat}
                onCancelar={() => setEditandoId(null)}
              />
            ) : (
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <span>{cat.nome}</span>
                <div className="flex gap-3 text-sm">
                  <button onClick={() => setEditandoId(cat.id)} className="text-blue-600">
                    Renomear
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir categoria "${cat.nome}"? Produtos ficarão sem categoria.`)) {
                        excluirCategoria(cat.id)
                      }
                    }}
                    className="text-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {categorias.length === 0 && (
          <li className="text-sm text-gray-400">Nenhuma categoria ainda.</li>
        )}
      </ul>

      {state?.erro && <p className="text-red-600 text-sm mb-2">{state.erro}</p>}

      <form action={formAction} className="flex gap-2">
        <input
          name="nome"
          required
          placeholder="Nova categoria (ex: Lanches)"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
    </section>
  )
}

function FormRenomear({
  categoria,
  onCancelar,
}: {
  categoria: Categoria
  onCancelar: () => void
}) {
  const [state, formAction, pending] = useActionState(renomearCategoria, null)

  return (
    <form action={formAction} className="flex gap-2 items-center">
      <input type="hidden" name="id" value={categoria.id} />
      <input
        name="nome"
        required
        defaultValue={categoria.nome}
        className="flex-1 border rounded-lg px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        onClick={() => setTimeout(onCancelar, 100)}
        className="text-green-600 text-sm font-medium"
      >
        Salvar
      </button>
      <button type="button" onClick={onCancelar} className="text-gray-400 text-sm">
        Cancelar
      </button>
      {state?.erro && <span className="text-red-600 text-xs">{state.erro}</span>}
    </form>
  )
}
