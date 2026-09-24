'use client'

import { useState } from 'react'
import { alternarLojaAberta } from './actions'

export default function ToggleLojaAberta({ abertaInicial }: { abertaInicial: boolean }) {
  const [aberta, setAberta] = useState(abertaInicial)
  const [salvando, setSalvando] = useState(false)

  async function alternar() {
    const novoValor = !aberta
    setSalvando(true)
    setAberta(novoValor) // otimista — reverte se der erro
    const resultado = await alternarLojaAberta(novoValor)
    setSalvando(false)
    if (resultado.erro) {
      setAberta(!novoValor)
    }
  }

  return (
    <button
      onClick={alternar}
      disabled={salvando}
      className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 ${
        aberta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${aberta ? 'bg-green-500' : 'bg-red-500'}`} />
      {aberta ? 'Loja aberta' : 'Loja fechada'}
    </button>
  )
}
