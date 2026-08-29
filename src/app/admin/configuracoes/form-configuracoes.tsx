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
  pixel_meta_id: string | null
  logo_url: string | null
  aceitacao_automatica: boolean
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
          <label className="text-sm font-medium">Logo da loja</label>
          {loja.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loja.logo_url}
              alt="Logo atual"
              className="w-16 h-16 rounded-full object-cover border mt-1 mb-2"
            />
          )}
          <input
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP, até 2MB. Aparece ao lado do nome no cardápio.</p>
        </div>
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
        <div>
          <label className="text-sm font-medium">Pixel do Meta (Facebook/Instagram Ads)</label>
          <input
            name="pixel_meta_id"
            defaultValue={loja.pixel_meta_id ?? ''}
            placeholder="Ex: 1234567890123456"
            className="w-full border rounded-lg px-3 py-2 mt-1 font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Cole só o ID do pixel. Deixe em branco pra não rastrear.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium bg-gray-50 border rounded-lg px-3 py-2.5">
          <input
            type="checkbox"
            name="aceitacao_automatica"
            defaultChecked={loja.aceitacao_automatica}
            className="w-4 h-4"
          />
          Aceitar pedidos automaticamente
          <span className="text-xs font-normal text-gray-400">(em breve, junto com impressão automática)</span>
        </label>
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
