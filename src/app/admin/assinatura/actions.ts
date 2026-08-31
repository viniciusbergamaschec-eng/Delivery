'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { asaasCriarCliente, asaasCriarAssinatura, asaasBuscarCobrancasDaAssinatura, asaasCancelarAssinatura } from '@/lib/asaas'
import { revalidatePath } from 'next/cache'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getLojaELojista() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id, nome, email')
    .eq('id', user.id)
    .single()
  if (!lojista) throw new Error('Lojista não encontrado')

  const { data: loja } = await supabase
    .from('lojas')
    .select('*')
    .eq('id', lojista.loja_id)
    .single()
  if (!loja) throw new Error('Loja não encontrada')

  return { supabase, lojista, loja }
}

export async function iniciarAssinatura(_prevState: unknown, formData: FormData) {
  const cpfCnpj = String(formData.get('cpfCnpj') ?? '').replace(/\D/g, '')

  if (!cpfCnpj) {
    return { erro: 'Informe seu CPF ou CNPJ para gerar a cobrança.' }
  }

  try {
    const { supabase, lojista, loja } = await getLojaELojista()

    let customerId = loja.asaas_customer_id as string | null

    if (!customerId) {
      const cliente = await asaasCriarCliente({
        name: lojista.nome ?? loja.nome,
        email: lojista.email,
        cpfCnpj,
        mobilePhone: loja.whatsapp ?? undefined,
      })
      customerId = cliente.id
    }

    let subscriptionId = loja.asaas_subscription_id as string | null

    if (!subscriptionId) {
      const amanha = new Date()
      amanha.setDate(amanha.getDate() + 1)
      const nextDueDate = amanha.toISOString().slice(0, 10)

      const assinatura = await asaasCriarAssinatura({
        customer: customerId,
        value: Number(loja.valor_mensalidade) || 49.9,
        nextDueDate,
        description: `Assinatura mensal - ${loja.nome}`,
      })
      subscriptionId = assinatura.id
    }

    await supabase
      .from('lojas')
      .update({ asaas_customer_id: customerId, asaas_subscription_id: subscriptionId })
      .eq('id', loja.id)
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro ao iniciar assinatura' }
  }

  revalidatePath('/admin/assinatura')
  return { sucesso: true }
}

export async function buscarLinkPagamento() {
  const { loja } = await getLojaELojista()
  if (!loja.asaas_subscription_id) return { erro: 'Assinatura ainda não iniciada' }

  try {
    const cobrancas = await asaasBuscarCobrancasDaAssinatura(loja.asaas_subscription_id)
    const cobranca = cobrancas.data?.[0]
    if (!cobranca) return { erro: 'Nenhuma cobrança encontrada ainda' }
    return { sucesso: true, invoiceUrl: cobranca.invoiceUrl, status: cobranca.status }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro ao buscar cobrança' }
  }
}

export async function cancelarAssinatura() {
  const { loja } = await getLojaELojista()
  const admin = adminClient()

  if (!loja.asaas_subscription_id) {
    // Sem assinatura no Asaas (ex: ainda em trial) — só marca localmente.
    await admin.from('lojas').update({ status_assinatura: 'cancelada' }).eq('id', loja.id)
    revalidatePath('/admin/assinatura')
    return { sucesso: true }
  }

  try {
    await asaasCancelarAssinatura(loja.asaas_subscription_id)
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro ao cancelar no Asaas' }
  }

  // Atualiza localmente na hora, sem esperar o webhook — o webhook ainda vai
  // confirmar depois (SUBSCRIPTION_DELETED), mas o lojista não deveria
  // esperar isso pra ver a mudança refletida no próprio painel.
  await admin.from('lojas').update({ status_assinatura: 'cancelada' }).eq('id', loja.id)

  revalidatePath('/admin/assinatura')
  return { sucesso: true }
}
