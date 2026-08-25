'use client'

import { useActionState } from 'react'
import { salvarConfiguracoes } from './actions'

type Loja = {
  nome: string
  whatsapp: string | null
  endereco: string | null
  horario_funcionamento: string | null
  cor_primaria: string | null
  slug: string
}

export default function FormConfiguracoes({ loja }: { loja: Loja }) {
  const [state, formAction, pending] = useActionState(salvarConfiguracoes, null)

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500 mb-4">
        Link do seu cardápio: <span className="font-mono">/loja/{loja.slug}</span>
      </p>

      {state?.erro && <p className="text-red-600 text-sm mb-3">{state.erro}</p>}
      {state?.sucesso && <p className="text-green-600 text-sm mb-3">Salvo com sucesso.</p>}

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Nome da loja</label>
          <input
            name="nome"
            required
            defaultValue={loja.nome}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">WhatsApp (com DDD, só números)</label>
          <input
            name="whatsapp"
            required
            defaultValue={loja.whatsapp ?? ''}
            placeholder="44999999999"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Endereço</label>
          <input
            name="endereco"
            defaultValue={loja.endereco ?? ''}
            placeholder="Rua Exemplo, 123 - Centro"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Horário de funcionamento</label>
          <input
            name="horario_funcionamento"
            defaultValue={loja.horario_funcionamento ?? ''}
            placeholder="Seg a Sáb, 18h às 23h"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Cor principal do cardápio</label>
          <input
            name="cor_primaria"
            type="color"
            defaultValue={loja.cor_primaria ?? '#16a34a'}
            className="w-full h-11 border rounded-lg mt-1 px-1"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-black text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  )
}
