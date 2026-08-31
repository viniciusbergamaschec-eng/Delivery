'use client'

import { useActionState, useState } from 'react'
import { iniciarAssinatura, buscarLinkPagamento, cancelarAssinatura } from './actions'

type Loja = {
  status_assinatura: string
  valor_mensalidade: number
  asaas_subscription_id: string | null
}

const STATUS_LABEL: Record<string, string> = {
  trial: 'Período de teste',
  ativa: 'Assinatura ativa',
  inadimplente: 'Pagamento pendente',
  cancelada: 'Cancelada',
}

const STATUS_COR: Record<string, string> = {
  trial: 'bg-blue-100 text-blue-700',
  ativa: 'bg-green-100 text-green-700',
  inadimplente: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-200 text-gray-600',
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PainelAssinatura({ loja }: { loja: Loja }) {
  const [state, formAction, pending] = useActionState(iniciarAssinatura, null)
  const [buscando, setBuscando] = useState(false)
  const [erroLink, setErroLink] = useState('')
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [erroCancelamento, setErroCancelamento] = useState('')

  async function confirmarCancelamento() {
    setCancelando(true)
    setErroCancelamento('')
    const resultado = await cancelarAssinatura()
    setCancelando(false)
    if (resultado.erro) {
      setErroCancelamento(resultado.erro)
      return
    }
    setConfirmandoCancelamento(false)
    window.location.reload()
  }

  async function abrirPagamento() {
    setBuscando(true)
    setErroLink('')
    const resultado = await buscarLinkPagamento()
    setBuscando(false)
    if (resultado.erro) {
      setErroLink(resultado.erro)
      return
    }
    if (resultado.invoiceUrl) {
      window.open(resultado.invoiceUrl, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-4 ${STATUS_COR[loja.status_assinatura] ?? 'bg-gray-100 text-gray-600'}`}>
        {STATUS_LABEL[loja.status_assinatura] ?? loja.status_assinatura}
      </span>

      <p className="text-sm text-gray-500 mb-1">Mensalidade</p>
      <p className="text-2xl font-bold mb-4">{formatarPreco(loja.valor_mensalidade)}</p>

      {!loja.asaas_subscription_id ? (
        <>
          {state?.erro && <p className="text-red-600 text-sm mb-3">{state.erro}</p>}
          <form action={formAction} className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">CPF ou CNPJ</label>
              <input
                name="cpfCnpj"
                required
                placeholder="Só números"
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="bg-black text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
            >
              {pending ? 'Gerando...' : 'Assinar agora'}
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Sua assinatura já foi criada. Use o botão abaixo para acessar o link de pagamento
            (Pix, boleto ou cartão).
          </p>
          {erroLink && <p className="text-red-600 text-sm">{erroLink}</p>}
          <button
            onClick={abrirPagamento}
            disabled={buscando}
            className="bg-green-600 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {buscando ? 'Buscando...' : 'Ver / pagar cobrança atual'}
          </button>
        </div>
      )}

      {loja.status_assinatura !== 'cancelada' && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          {!confirmandoCancelamento ? (
            <button
              onClick={() => setConfirmandoCancelamento(true)}
              className="text-sm text-red-600 underline"
            >
              Cancelar assinatura
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium mb-1">Tem certeza?</p>
              <p className="text-sm text-red-600 mb-3">
                Isso cancela sua assinatura no Asaas e bloqueia o acesso ao painel imediatamente.
                Essa ação não pode ser desfeita por aqui — para reativar, será preciso assinar
                novamente.
              </p>
              {erroCancelamento && <p className="text-red-700 text-sm mb-2">{erroCancelamento}</p>}
              <div className="flex gap-2">
                <button
                  onClick={confirmarCancelamento}
                  disabled={cancelando}
                  className="bg-red-600 text-white rounded-lg py-2 px-4 text-sm font-medium disabled:opacity-50"
                >
                  {cancelando ? 'Cancelando...' : 'Sim, cancelar'}
                </button>
                <button
                  onClick={() => setConfirmandoCancelamento(false)}
                  disabled={cancelando}
                  className="text-sm text-gray-500 px-4"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
