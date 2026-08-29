'use client'

import { useState } from 'react'
import { useCarrinho } from './carrinho-context'
import { salvarPedido } from './actions'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function limparTelefone(numero: string) {
  return numero.replace(/\D/g, '')
}

type Regiao = { id: string; nome: string; taxa: number }

const LABEL_PAGAMENTO: Record<'pix' | 'dinheiro' | 'cartao_entrega', string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro na entrega/retirada',
  cartao_entrega: 'Cartão na entrega/retirada',
}

export default function BarraCarrinho({
  whatsappLoja,
  nomeLoja,
  lojaId,
  corPrimaria,
  regioes,
}: {
  whatsappLoja: string
  nomeLoja: string
  lojaId: string
  corPrimaria: string
  regioes: Regiao[]
}) {
  const { itens, alterarQuantidade, total, quantidadeTotal, limpar } = useCarrinho()
  const [aberto, setAberto] = useState(false)
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [regiaoId, setRegiaoId] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'dinheiro' | 'cartao_entrega'>('dinheiro')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [linkAcompanhar, setLinkAcompanhar] = useState('')

  if (quantidadeTotal === 0 && !aberto) return null

  const regiaoSelecionada = regioes.find((r) => r.id === regiaoId)
  const taxaEntrega = tipoEntrega === 'entrega' ? (regiaoSelecionada?.taxa ?? 0) : 0
  const totalComTaxa = total + taxaEntrega

  function montarMensagem(linkPedido?: string) {
    const linhas: string[] = []
    linhas.push(`*Novo pedido - ${nomeLoja}*`)
    linhas.push('')
    linhas.push(`*Cliente:* ${nome}`)
    linhas.push(`*Telefone:* ${telefone}`)
    linhas.push(`*Tipo:* ${tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada no local'}`)
    if (tipoEntrega === 'entrega') {
      linhas.push(`*Região:* ${regiaoSelecionada?.nome ?? '-'}`)
      linhas.push(`*Endereço:* ${endereco}`)
    }
    linhas.push('')
    linhas.push('*Itens:*')
    itens.forEach((i) => {
      linhas.push(`${i.quantidade}x ${i.nome} — ${formatarPreco(i.preco * i.quantidade)}`)
    })
    if (taxaEntrega > 0) {
      linhas.push('')
      linhas.push(`*Taxa de entrega:* ${formatarPreco(taxaEntrega)}`)
    }
    linhas.push('')
    linhas.push(`*Forma de pagamento:* ${LABEL_PAGAMENTO[formaPagamento]}`)
    linhas.push(`*Total: ${formatarPreco(totalComTaxa)}*`)
    if (linkPedido) {
      linhas.push('')
      linhas.push(`Acompanhe o pedido: ${linkPedido}`)
    }
    return linhas.join('\n')
  }

  async function enviarPedido() {
    setErro('')
    if (!nome.trim() || !telefone.trim()) {
      setErro('Preencha nome e telefone.')
      return
    }
    if (tipoEntrega === 'entrega' && !endereco.trim()) {
      setErro('Preencha o endereço de entrega.')
      return
    }
    if (tipoEntrega === 'entrega' && regioes.length > 0 && !regiaoId) {
      setErro('Selecione a região de entrega.')
      return
    }

    setEnviando(true)
    const resultado = await salvarPedido({
      lojaId,
      clienteNome: nome,
      clienteTelefone: telefone,
      tipoEntrega,
      endereco: tipoEntrega === 'entrega' ? endereco : undefined,
      regiaoId: tipoEntrega === 'entrega' ? regiaoId || undefined : undefined,
      formaPagamento,
      itens: itens.map((i) => ({ produtoId: i.id, quantidade: i.quantidade })),
    })
    setEnviando(false)

    if (resultado.erro) {
      setErro(resultado.erro)
      return
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { value: resultado.total, currency: 'BRL' })
    }

    const linkPedido = resultado.pedidoId
      ? `${window.location.origin}/pedido/${resultado.pedidoId}`
      : undefined
    const mensagem = encodeURIComponent(montarMensagem(linkPedido))
    const numeroLoja = limparTelefone(whatsappLoja)
    window.open(`https://wa.me/55${numeroLoja}?text=${mensagem}`, '_blank')
    limpar()
    if (resultado.pedidoId) {
      setLinkAcompanhar(`/pedido/${resultado.pedidoId}`)
    } else {
      setAberto(false)
    }
  }

  return (
    <>
      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          style={{ backgroundColor: corPrimaria }}
          className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto text-white rounded-2xl py-4 px-5 flex items-center justify-between font-semibold shadow-xl active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center gap-2">
            <span className="bg-white/25 rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {quantidadeTotal}
            </span>
            Ver carrinho
          </span>
          <span>{formatarPreco(total)}</span>
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">Seu pedido</h2>
              <button onClick={() => setAberto(false)} className="text-gray-400 text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {itens.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-sm">
                  <span className="flex-1">{i.nome}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidade(i.id, i.quantidade - 1)}
                      className="border rounded-full w-7 h-7 font-medium"
                    >
                      -
                    </button>
                    <span className="w-4 text-center">{i.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(i.id, i.quantidade + 1)}
                      className="border rounded-full w-7 h-7 font-medium"
                    >
                      +
                    </button>
                    <span className="w-20 text-right font-medium">
                      {formatarPreco(i.preco * i.quantidade)}
                    </span>
                  </div>
                </div>
              ))}
              {itens.length === 0 && <p className="text-sm text-gray-400">Carrinho vazio.</p>}
            </div>

            <div className="flex flex-col gap-4 border-t pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoEntrega('retirada')}
                  className={`flex-1 border rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    tipoEntrega === 'retirada' ? 'text-white border-transparent' : 'text-gray-600'
                  }`}
                  style={tipoEntrega === 'retirada' ? { backgroundColor: corPrimaria } : {}}
                >
                  Retirada no local
                </button>
                <button
                  onClick={() => setTipoEntrega('entrega')}
                  className={`flex-1 border rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    tipoEntrega === 'entrega' ? 'text-white border-transparent' : 'text-gray-600'
                  }`}
                  style={tipoEntrega === 'entrega' ? { backgroundColor: corPrimaria } : {}}
                >
                  Entrega
                </button>
              </div>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="border rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Seu telefone (com DDD)"
                className="border rounded-xl px-4 py-2.5 text-sm"
              />

              {tipoEntrega === 'entrega' && (
                <>
                  {regioes.length > 0 && (
                    <select
                      value={regiaoId}
                      onChange={(e) => setRegiaoId(e.target.value)}
                      className="border rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="">Selecione a região de entrega</option>
                      {regioes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nome} — {formatarPreco(r.taxa)}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Endereço completo (rua, número, bairro)"
                    className="border rounded-xl px-4 py-2.5 text-sm"
                  />
                </>
              )}

              <div className="flex flex-col gap-1 text-sm border-t pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatarPreco(total)}</span>
                </div>
                {taxaEntrega > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Taxa de entrega</span>
                    <span>{formatarPreco(taxaEntrega)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatarPreco(totalComTaxa)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Forma de pagamento</span>
                <div className="flex gap-2">
                  {(['pix', 'dinheiro', 'cartao_entrega'] as const).map((forma) => (
                    <button
                      key={forma}
                      onClick={() => setFormaPagamento(forma)}
                      className={`flex-1 border rounded-xl py-2 text-xs font-medium transition-colors ${
                        formaPagamento === forma ? 'text-white border-transparent' : 'text-gray-600'
                      }`}
                      style={formaPagamento === forma ? { backgroundColor: corPrimaria } : {}}
                    >
                      {LABEL_PAGAMENTO[forma]}
                    </button>
                  ))}
                </div>
                {formaPagamento === 'pix' && (
                  <p className="text-xs text-gray-400">
                    A loja vai te passar a chave Pix pelo WhatsApp para o pagamento.
                  </p>
                )}
              </div>

              {erro && <p className="text-red-600 text-sm">{erro}</p>}

              <button
                onClick={enviarPedido}
                disabled={itens.length === 0 || enviando}
                className="bg-green-600 text-white rounded-xl py-3.5 font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {enviando ? 'Enviando...' : 'Enviar pedido pelo WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {linkAcompanhar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <h2 className="font-bold text-xl mb-2">Pedido enviado!</h2>
            <p className="text-sm text-gray-500 mb-5">
              Acompanhe o status do seu pedido pelo link abaixo.
            </p>
            <a
              href={linkAcompanhar}
              style={{ backgroundColor: corPrimaria }}
              className="block text-white rounded-xl py-3 font-semibold mb-2"
            >
              Acompanhar pedido
            </a>
            <button
              onClick={() => {
                setLinkAcompanhar('')
                setAberto(false)
              }}
              className="text-sm text-gray-400 mt-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
