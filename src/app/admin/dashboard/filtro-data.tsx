'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const OPCOES_BASE = [
  { valor: 'hoje', label: 'Hoje' },
  { valor: 'semana', label: 'Esta semana' },
  { valor: 'mes', label: 'Este mês' },
  { valor: 'personalizado', label: 'Personalizado' },
] as const

export default function FiltroData({
  periodo,
  de,
  ate,
  basePath = '/admin/dashboard',
  mostrarTodos = false,
}: {
  periodo: string
  de?: string
  ate?: string
  basePath?: string
  mostrarTodos?: boolean
}) {
  const router = useRouter()
  const [dataDe, setDataDe] = useState(de ?? '')
  const [dataAte, setDataAte] = useState(ate ?? '')

  const OPCOES = mostrarTodos ? [{ valor: 'todos', label: 'Todos' }, ...OPCOES_BASE] : OPCOES_BASE

  function irPara(novoPeriodo: string, novoDe?: string, novoAte?: string) {
    const query = new URLSearchParams({ periodo: novoPeriodo })
    if (novoPeriodo === 'personalizado' && novoDe) {
      query.set('de', novoDe)
      if (novoAte) query.set('ate', novoAte)
    }
    router.push(`${basePath}?${query.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {OPCOES.map((op) => (
          <button
            key={op.valor}
            onClick={() => irPara(op.valor)}
            className={`text-sm rounded-lg px-3 py-1.5 border font-medium ${
              periodo === op.valor ? 'bg-black text-white border-black' : 'text-gray-600'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {periodo === 'personalizado' && (
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">De</label>
            <input
              type="date"
              value={dataDe}
              onChange={(e) => setDataDe(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Até</label>
            <input
              type="date"
              value={dataAte}
              onChange={(e) => setDataAte(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={() => irPara('personalizado', dataDe, dataAte)}
            disabled={!dataDe}
            className="bg-black text-white text-sm rounded-lg px-3 py-1.5 disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
