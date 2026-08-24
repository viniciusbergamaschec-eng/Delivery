'use client'

import { useState } from 'react'
import { useCarrinho } from './carrinho-context'

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function limparTelefone(numero: string) {
  return numero.replace(/\D/g, '')
}

export default function BarraCarrinho({
  whatsappLoja,
  nomeLoja,
}: {
  whatsappLoja: string
  nomeLoja: string
}) {
  const { itens, alterarQuantidade, total, quantidadeTotal, limpar } = useCarrinho()
  const [aberto, setAberto] = useState(false)
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [erro, setErro] = useState('')

  if (quantidadeTotal === 0 && !aberto) return null

  function montarMensagem() {
    const linhas: string[] = []
    linhas.push(`*Novo pedido - ${nomeLoja}*`)
    linhas.push('')
    linhas.push(`*Cliente:* ${nome}`)
    linhas.push(`*Telefone:* ${telefone}`)
    linhas.push(`*Tipo:* ${tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada no local'}`)
    if (tipoEntrega === 'entrega') {
      linhas.push(`*Endereço:* ${endereco}`)
    }
    linhas.push('')
    linhas.push('*Itens:*')
    itens.forEach((i) => {
      linhas.push(`${i.quantidade}x ${i.nome} — ${formatarPreco(i.preco * i.quantidade)}`)
    })
    linhas.push('')
    linhas.push(`*Total: ${formatarPreco(total)}*`)
    return linhas.join('\n')
  }

  function enviarPedido() {
    setErro('')
    if (!nome.trim() || !telefone.trim()) {
      setErro('Preencha nome e telefone.')
      return
    }
    if (tipoEntrega === 'entrega' && !endereco.trim()) {
      setErro('Preencha o endereço de entrega.')
      return
    }

    const mensagem = encodeURIComponent(montarMensagem())
    const numeroLoja = limparTelefone(whatsappLoja)
    window.open(`https://wa.me/55${numeroLoja}?text=${mensagem}`, '_blank')
    limpar()
    setAberto(false)
  }

  return (
    <>
      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-black text-white rounded-xl py-3 px-4 flex items-center justify-between font-medium shadow-lg"
        >
          <span>{quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'} no carrinho</span>
          <span>{formatarPreco(total)}</span>
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Seu pedido</h2>
              <button onClick={() => setAberto(false)} className="text-gray-400">
                Fechar
              </button>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {itens.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-sm">
                  <span>{i.nome}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidade(i.id, i.quantidade - 1)}
                      className="border rounded w-6 h-6"
                    >
                      -
                    </button>
                    <span>{i.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(i.id, i.quantidade + 1)}
                      className="border rounded w-6 h-6"
                    >
                      +
                    </button>
                    <span className="w-20 text-right">{formatarPreco(i.preco * i.quantidade)}</span>
                  </div>
                </div>
              ))}
              {itens.length === 0 && (
                <p className="text-sm text-gray-400">Carrinho vazio.</p>
              )}
            </div>

            <p className="font-semibold text-right mb-4">Total: {formatarPreco(total)}</p>

            <div className="flex flex-col gap-3 border-t pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoEntrega('retirada')}
                  className={`flex-1 border rounded-lg py-2 text-sm ${tipoEntrega === 'retirada' ? 'bg-black text-white' : ''}`}
                >
                  Retirada no local
                </button>
                <button
                  onClick={() => setTipoEntrega('entrega')}
                  className={`flex-1 border rounded-lg py-2 text-sm ${tipoEntrega === 'entrega' ? 'bg-black text-white' : ''}`}
                >
                  Entrega
                </button>
              </div>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Seu telefone (com DDD)"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              {tipoEntrega === 'entrega' && (
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Endereço completo"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              )}

              {erro && <p className="text-red-600 text-sm">{erro}</p>}

              <button
                onClick={enviarPedido}
                disabled={itens.length === 0}
                className="bg-green-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
              >
                Enviar pedido pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
