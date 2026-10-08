'use client'

import { useState } from 'react'
import { salvarFuncionamento } from './actions'
import { DIAS_SEMANA, FUSOS, type DiaHorario } from '@/lib/horario'

function Chave({
  ligado,
  onChange,
  titulo,
  descricao,
}: {
  ligado: boolean
  onChange: (v: boolean) => void
  titulo: string
  descricao: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!ligado)}
      className="w-full flex items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block font-medium text-gray-900">{titulo}</span>
        <span className="block text-sm text-gray-500">{descricao}</span>
      </span>
      <span
        className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${
          ligado ? 'bg-green-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full transition-transform ${
            ligado ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  )
}

export default function FormFuncionamento({
  modoInicial,
  fusoInicial,
  horariosIniciais,
  aceitaEntregaInicial,
  aceitaRetiradaInicial,
}: {
  modoInicial: 'manual' | 'programado'
  fusoInicial: string
  horariosIniciais: DiaHorario[]
  aceitaEntregaInicial: boolean
  aceitaRetiradaInicial: boolean
}) {
  const [modo, setModo] = useState(modoInicial)
  const [fuso, setFuso] = useState(fusoInicial)
  const [horarios, setHorarios] = useState(horariosIniciais)
  const [aceitaEntrega, setAceitaEntrega] = useState(aceitaEntregaInicial)
  const [aceitaRetirada, setAceitaRetirada] = useState(aceitaRetiradaInicial)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  function atualizarDia(i: number, campo: keyof DiaHorario, valor: string | boolean) {
    setSalvo(false)
    setHorarios((atual) => atual.map((d, idx) => (idx === i ? { ...d, [campo]: valor } : d)))
  }

  // Impede desligar a última modalidade ligada (o servidor também checa).
  function alternarEntrega(v: boolean) {
    setSalvo(false)
    if (!v && !aceitaRetirada) {
      setErro('Deixe pelo menos uma modalidade ligada (entrega ou retirada).')
      return
    }
    setErro('')
    setAceitaEntrega(v)
  }
  function alternarRetirada(v: boolean) {
    setSalvo(false)
    if (!v && !aceitaEntrega) {
      setErro('Deixe pelo menos uma modalidade ligada (entrega ou retirada).')
      return
    }
    setErro('')
    setAceitaRetirada(v)
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    setSalvo(false)
    const resultado = await salvarFuncionamento({
      modo,
      fuso,
      horarios,
      aceitaEntrega,
      aceitaRetirada,
    })
    setSalvando(false)
    if (resultado.erro) {
      setErro(resultado.erro)
      return
    }
    setSalvo(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white rounded-xl p-5 border border-gray-100">
        <h2 className="font-semibold mb-3">Quando a loja aceita pedidos</h2>

        <div className="flex flex-col gap-2 mb-1">
          {([
            ['manual', 'Manual', 'Você abre e fecha pelo botão "Loja aberta/fechada" do painel.'],
            ['programado', 'Horário programado', 'Só aceita pedido dentro dos horários que você definir.'],
          ] as const).map(([valor, titulo, desc]) => (
            <label
              key={valor}
              className={`flex gap-3 items-start border rounded-lg p-3 cursor-pointer ${
                modo === valor ? 'border-black bg-gray-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="modo"
                checked={modo === valor}
                onChange={() => { setModo(valor); setSalvo(false) }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{titulo}</span>
                <span className="block text-xs text-gray-500">{desc}</span>
              </span>
            </label>
          ))}
        </div>

        {modo === 'programado' && (
          <div className="mt-4">
            <div className="flex flex-col gap-2">
              {horarios.map((dia, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-2 w-28 shrink-0">
                    <input
                      type="checkbox"
                      checked={dia.ativo}
                      onChange={(e) => atualizarDia(i, 'ativo', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className={dia.ativo ? 'font-medium' : 'text-gray-400'}>{DIAS_SEMANA[i]}</span>
                  </label>
                  {dia.ativo ? (
                    <>
                      <input
                        type="time"
                        value={dia.abre}
                        onChange={(e) => atualizarDia(i, 'abre', e.target.value)}
                        className="border rounded-lg px-2 py-1.5"
                      />
                      <span className="text-gray-400">até</span>
                      <input
                        type="time"
                        value={dia.fecha}
                        onChange={(e) => atualizarDia(i, 'fecha', e.target.value)}
                        className="border rounded-lg px-2 py-1.5"
                      />
                    </>
                  ) : (
                    <span className="text-gray-400">Fechado</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Horário que passa da meia-noite funciona (ex: das 18:00 às 02:00 vale até as 2h da
              madrugada do dia seguinte). O botão &quot;Loja aberta/fechada&quot; do painel continua como
              chave geral: se você fechar por ele, a loja fecha mesmo dentro do horário.
            </p>

            <label className="text-sm font-medium block mt-4">Fuso horário</label>
            <select
              value={fuso}
              onChange={(e) => { setFuso(e.target.value); setSalvo(false) }}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            >
              {FUSOS.map((f) => (
                <option key={f.valor} value={f.valor}>{f.label}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
        <h2 className="font-semibold">Modalidades de atendimento</h2>
        <Chave
          ligado={aceitaEntrega}
          onChange={alternarEntrega}
          titulo="Entrega"
          descricao="O cliente pode pedir para receber em casa."
        />
        <div className="border-t border-gray-100" />
        <Chave
          ligado={aceitaRetirada}
          onChange={alternarRetirada}
          titulo="Retirada no local"
          descricao="O cliente pode pedir para buscar na loja."
        />
        <p className="text-xs text-gray-500">
          Pelo menos uma precisa ficar ligada. Se desligar uma, o cliente só vê a outra no cardápio.
        </p>
      </section>

      {erro && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{erro}</p>}
      {salvo && <p className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">Salvo!</p>}

      <button
        onClick={salvar}
        disabled={salvando}
        className="bg-black text-white rounded-lg py-3 font-medium disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  )
}
