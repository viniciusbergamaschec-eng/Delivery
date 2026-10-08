'use client'

import { useActionState, useState } from 'react'
import { criarSubcontaPix } from './actions'

export default function FormSubcontaPix({
  nomeInicial,
  emailInicial,
}: {
  nomeInicial: string
  emailInicial: string
}) {
  const [state, formAction, pending] = useActionState(criarSubcontaPix, null)
  const [tipo, setTipo] = useState<'cpf' | 'cnpj'>('cpf')

  if (state?.sucesso) {
    return (
      <div className="bg-green-50 text-green-700 text-sm rounded-xl p-4">
        Subconta criada! Fique de olho no seu e-mail — o Asaas vai pedir confirmação e documentos
        antes de liberar.
      </div>
    )
  }

  return (
    <form action={formAction} className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
      {state?.erro && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.erro}</p>}

      <div>
        <label className="text-sm font-medium">Tipo</label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'cpf' | 'cnpj')}
          className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
        >
          <option value="cpf">Pessoa física (CPF)</option>
          <option value="cnpj">Pessoa jurídica (CNPJ)</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Nome completo / Razão social</label>
        <input name="nome" required defaultValue={nomeInicial} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium">E-mail</label>
        <input type="email" name="email" required defaultValue={emailInicial} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium">{tipo === 'cpf' ? 'CPF' : 'CNPJ'}</label>
        <input name="cpfCnpj" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
      </div>

      {tipo === 'cpf' && (
        <div>
          <label className="text-sm font-medium">Data de nascimento</label>
          <input type="date" name="birthDate" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Celular (com DDD)</label>
        <input name="telefone" required placeholder="44999999999" className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-sm font-medium">Endereço</label>
          <input name="endereco" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Número</label>
          <input name="numero" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Bairro</label>
          <input name="bairro" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">CEP</label>
          <input name="cep" required className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Renda/faturamento mensal (R$)</label>
          <input type="number" name="renda" required min="0" step="0.01" className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded-lg py-2.5 font-medium mt-2 disabled:opacity-50"
      >
        {pending ? 'Enviando...' : 'Criar conta para receber Pix'}
      </button>
    </form>
  )
}
