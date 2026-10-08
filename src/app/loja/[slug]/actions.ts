'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { checarLimite, obterIp } from '@/lib/rate-limit'
import { statusDaLoja } from '@/lib/horario'
import { asaasCriarClienteNaSubconta, asaasCriarCobrancaPixNaSubconta, asaasBuscarQrCodePix } from '@/lib/asaas'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type ItemPedido = {
  produtoId: string
  quantidade: number
}

export async function salvarPedido(dados: {
  lojaId: string
  clienteNome: string
  clienteTelefone: string
  tipoEntrega: 'retirada' | 'entrega'
  endereco?: string
  regiaoId?: string
  formaPagamento: 'pix' | 'dinheiro' | 'cartao_entrega' | 'pix_online'
  itens: ItemPedido[]
}) {
  const ip = await obterIp()
  const limite = checarLimite(`criar-pedido:${ip}`, { maximo: 5, janelaMs: 5 * 60_000 })
  if (!limite.permitido) {
    return { erro: 'Muitos pedidos em pouco tempo. Aguarde alguns minutos e tente novamente.' }
  }

  const supabase = await createClient()

  const clienteNome = dados.clienteNome.trim().slice(0, 120)
  const clienteTelefone = dados.clienteTelefone.trim().slice(0, 30)
  if (!clienteNome || !clienteTelefone) {
    return { erro: 'Preencha nome e telefone.' }
  }
  if (dados.tipoEntrega === 'entrega' && !dados.endereco?.trim()) {
    return { erro: 'Preencha o endereço de entrega.' }
  }
  if (!dados.itens.length) {
    return { erro: 'Carrinho vazio.' }
  }

  // Checagem real, não só visual: desabilitar o botão no navegador não
  // impede alguém de chamar essa action diretamente. Sem isso, "loja
  // fechada" seria só decoração na tela.
  const { data: loja } = await supabase
    .from('lojas_publicas')
    .select('aberta, modo_funcionamento, horarios, fuso_horario, aceita_entrega, aceita_retirada')
    .eq('id', dados.lojaId)
    .single()
  if (!loja) {
    return { erro: 'Loja não encontrada.' }
  }

  // Considera a chave manual E o horário programado, calculado agora, no
  // servidor — o cliente pode ter deixado a página aberta passando do horário.
  const status = statusDaLoja(loja)
  if (!status.aberta) {
    return {
      erro:
        status.motivo === 'fora_do_horario'
          ? `A loja está fora do horário de funcionamento${
              status.proximaAbertura ? ` (abre ${status.proximaAbertura})` : ''
            }.`
          : 'A loja está fechada no momento e não está aceitando pedidos.',
    }
  }

  if (dados.tipoEntrega === 'entrega' && !loja.aceita_entrega) {
    return { erro: 'Esta loja não está atendendo entrega no momento.' }
  }
  if (dados.tipoEntrega === 'retirada' && !loja.aceita_retirada) {
    return { erro: 'Esta loja não está atendendo retirada no momento.' }
  }

  // Nunca confiar em preço, nome ou total vindos do navegador: busca os
  // produtos reais no banco pelo id e recalcula tudo a partir daí. Isso
  // fecha a brecha de alguém editar o preço no DevTools antes de enviar.
  const idsProdutos = dados.itens.map((i) => i.produtoId)
  const { data: produtos, error: erroProdutos } = await supabase
    .from('produtos')
    .select('id, nome, preco, disponivel')
    .eq('loja_id', dados.lojaId)
    .in('id', idsProdutos)

  if (erroProdutos || !produtos) {
    return { erro: 'Não foi possível validar os produtos do pedido.' }
  }

  const itensValidados: { produto_nome: string; preco_unitario: number; quantidade: number }[] = []
  let subtotal = 0

  for (const item of dados.itens) {
    const quantidade = Math.trunc(item.quantidade)
    if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 99) {
      return { erro: 'Quantidade inválida em um dos itens.' }
    }
    const produto = produtos.find((p) => p.id === item.produtoId)
    if (!produto || !produto.disponivel) {
      return { erro: `Um dos itens do carrinho não está mais disponível.` }
    }
    itensValidados.push({
      produto_nome: produto.nome,
      preco_unitario: produto.preco,
      quantidade,
    })
    subtotal += produto.preco * quantidade
  }

  // Mesma lógica pra taxa de entrega: busca a região real da loja em vez
  // de aceitar o valor calculado no navegador.
  let taxaEntrega = 0
  let nomeRegiao: string | null = null
  if (dados.tipoEntrega === 'entrega' && dados.regiaoId) {
    const { data: regiao } = await supabase
      .from('regioes_entrega')
      .select('nome, taxa')
      .eq('id', dados.regiaoId)
      .eq('loja_id', dados.lojaId)
      .single()

    if (!regiao) {
      return { erro: 'Região de entrega inválida.' }
    }
    taxaEntrega = regiao.taxa
    nomeRegiao = regiao.nome
  }

  const total = subtotal + taxaEntrega

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({
      loja_id: dados.lojaId,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
      tipo_entrega: dados.tipoEntrega,
      endereco: dados.tipoEntrega === 'entrega' ? dados.endereco?.trim() : null,
      taxa_entrega: taxaEntrega,
      regiao_entrega: nomeRegiao,
      forma_pagamento: dados.formaPagamento,
      total,
    })
    .select()
    .single()

  if (error || !pedido) {
    return { erro: error?.message ?? 'Erro ao salvar pedido' }
  }

  const { error: itensError } = await supabase.from('pedido_itens').insert(
    itensValidados.map((i) => ({
      pedido_id: pedido.id,
      produto_nome: i.produto_nome,
      preco_unitario: i.preco_unitario,
      quantidade: i.quantidade,
    }))
  )

  if (itensError) {
    return { erro: itensError.message }
  }

  if (dados.formaPagamento !== 'pix_online') {
    return { sucesso: true, pedidoId: pedido.id, total }
  }

  // Pix pelo app: a cobrança é criada na SUBCONTA do próprio lojista — o
  // dinheiro nunca passa pela nossa conta. A api key da subconta é um dado
  // sensível, por isso busca com service role, nunca pela view pública.
  const admin = adminClient()
  const { data: lojaCompleta } = await admin
    .from('lojas')
    .select('asaas_subconta_api_key, pix_habilitado, asaas_subconta_status')
    .eq('id', dados.lojaId)
    .single()

  if (
    !lojaCompleta?.pix_habilitado ||
    lojaCompleta.asaas_subconta_status !== 'ativa' ||
    !lojaCompleta.asaas_subconta_api_key
  ) {
    // Pedido já foi criado normalmente — só não tem cobrança Pix online.
    // O cliente ainda consegue combinar pagamento pelo WhatsApp como sempre.
    return { sucesso: true, pedidoId: pedido.id, total, pixIndisponivel: true }
  }

  try {
    const cliente = await asaasCriarClienteNaSubconta(lojaCompleta.asaas_subconta_api_key, {
      name: clienteNome,
      mobilePhone: clienteTelefone,
    })
    const cobranca = await asaasCriarCobrancaPixNaSubconta(lojaCompleta.asaas_subconta_api_key, {
      customer: cliente.id,
      value: total,
      description: `Pedido via cardápio digital`,
    })
    const qrCode = await asaasBuscarQrCodePix(lojaCompleta.asaas_subconta_api_key, cobranca.id)

    await admin.from('pedidos').update({ asaas_payment_id: cobranca.id }).eq('id', pedido.id)

    return {
      sucesso: true,
      pedidoId: pedido.id,
      total,
      pix: { qrCodeImagem: qrCode.encodedImage, copiaECola: qrCode.payload },
    }
  } catch {
    // Falhou gerar a cobrança Pix — o pedido já existe mesmo assim, não
    // trava o cliente. Ele só não vê o QR Code e segue pelo WhatsApp normal.
    return { sucesso: true, pedidoId: pedido.id, total, pixIndisponivel: true }
  }
}
