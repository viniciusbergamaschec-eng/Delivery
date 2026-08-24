'use client'

import { useActionState, useState } from 'react'
import {
  criarProduto,
  editarProduto,
  excluirProduto,
  alternarDisponibilidade,
} from './actions'

type Categoria = { id: string; nome: string }
type Produto = {
  id: string
  nome: string
  descricao: string | null
  preco: number
  categoria_id: string | null
  disponivel: boolean
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function GerenciadorProdutos({
  produtos,
  categorias,
}: {
  produtos: Produto[]
  categorias: Categoria[]
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const nomeCategoria = (id: string | null) =>
    categorias.find((c) => c.id === id)?.nome ?? 'Sem categoria'

  return (
    <section className="bg-white rounded-xl shadow p-5">
      <h2 className="font-semibold mb-3">Produtos</h2>

      <ul className="flex flex-col gap-2 mb-6">
        {produtos.map((p) =>
          editandoId === p.id ? (
            <li key={p.id}>
              <FormProduto
                categorias={categorias}
                produto={p}
                onFechar={() => setEditandoId(null)}
              />
            </li>
          ) : (
            <li
              key={p.id}
              className="flex items-center justify-between border rounded-lg px-3 py-2"
            >
              <div>
                <p className="font-medium">
                  {p.nome}{' '}
                  <span className="text-gray-400 text-xs font-normal">
                    ({nomeCategoria(p.categoria_id)})
                  </span>
                </p>
                {p.descricao && <p className="text-sm text-gray-500">{p.descricao}</p>}
                <p className="text-sm font-medium">{formatarPreco(p.preco)}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-sm">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={p.disponivel}
                    onChange={(e) => alternarDisponibilidade(p.id, e.target.checked)}
                  />
                  Disponível
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setEditandoId(p.id)} className="text-blue-600">
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir "${p.nome}"?`)) excluirProduto(p.id)
                    }}
                    className="text-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          )
        )}
        {produtos.length === 0 && (
          <li className="text-sm text-gray-400">Nenhum produto ainda.</li>
        )}
      </ul>

      <h3 className="text-sm font-medium mb-2">Novo produto</h3>
      <FormProduto categorias={categorias} />
    </section>
  )
}

function FormProduto({
  categorias,
  produto,
  onFechar,
}: {
  categorias: Categoria[]
  produto?: Produto
  onFechar?: () => void
}) {
  const action = produto ? editarProduto : criarProduto
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (onFechar) setTimeout(onFechar, 150)
      }}
      className="flex flex-col gap-2 border rounded-lg p-3"
    >
      {produto && <input type="hidden" name="id" value={produto.id} />}

      {state?.erro && <p className="text-red-600 text-sm">{state.erro}</p>}

      <input
        name="nome"
        required
        defaultValue={produto?.nome}
        placeholder="Nome do produto"
        className="border rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        name="descricao"
        defaultValue={produto?.descricao ?? ''}
        placeholder="Descrição (opcional)"
        className="border rounded-lg px-3 py-2 text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <input
          name="preco"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={produto?.preco}
          placeholder="Preço"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="categoria_id"
          defaultValue={produto?.categoria_id ?? ''}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {produto ? 'Salvar' : 'Adicionar produto'}
        </button>
        {onFechar && (
          <button type="button" onClick={onFechar} className="text-gray-400 text-sm">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
