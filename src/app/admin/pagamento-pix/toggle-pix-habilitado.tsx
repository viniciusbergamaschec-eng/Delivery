'use client'

import { useState } from 'react'
import { alternarPixHabilitado } from './actions'

export default function TogglePixHabilitado({ habilitadoInicial }: { habilitadoInicial: boolean }) {
  const [habilitado, setHabilitado] = useState(habilitadoInicial)
  const [salvando, setSalvando] = useState(false)

  async function alternar() {
    const novoValor = !habilitado
    setSalvando(true)
    setHabilitado(novoValor)
    const resultado = await alternarPixHabilitado(novoValor)
    setSalvando(false)
    if (resultado.erro) setHabilitado(!novoValor)
  }

  return (
    <button
      onClick={alternar}
      disabled={salvando}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
        habilitado ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${habilitado ? 'bg-white' : 'bg-gray-400'}`} />
      {habilitado ? 'Pix ativado' : 'Pix desativado'}
    </button>
  )
}
