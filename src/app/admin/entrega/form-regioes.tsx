'use client'

import { useActionState } from 'react'
import { criarRegiao, excluirRegiao } from './actions'

type Regiao = { id: string; nome: string; taxa: number }

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function FormRegioes({ regioes }: { regioes: Regiao[] }) {
  const [state, formAction, pending] = useActionState(criarRegiao, null)

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <ul className="flex flex-col gap-2 mb-4">
        {regioes.map((r) => (
          <li key={r.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
            <span>{r.nome}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{formatarPreco(r.taxa)}</span>
              <button
                onClick={() => {
                  if (confirm(`Excluir região "${r.nome}"?`)) excluirRegiao(r.id)
                }}
                className="text-red-600 text-sm"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {regioes.length === 0 && (
          <li className="text-sm text-gray-400">Nenhuma região cadastrada.</li>
        )}
      </ul>

      {state?.erro && <p className="text-red-600 text-sm mb-2">{state.erro}</p>}

      <form action={formAction} className="flex gap-2">
        <input
          name="nome"
          required
          placeholder="Nome (ex: Centro)"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="taxa"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Taxa"
          className="w-28 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}
