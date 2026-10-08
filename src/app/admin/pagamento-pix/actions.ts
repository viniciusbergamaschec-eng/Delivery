'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { asaasCriarSubconta } from '@/lib/asaas'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getLojaId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) throw new Error('Lojista não encontrado')
  return lojista.loja_id
}

export async function criarSubcontaPix(_prevState: unknown, formData: FormData) {
  let lojaId: string
  try {
    lojaId = await getLojaId()
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Não autenticado' }
  }

  const nome = String(formData.get('nome') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const cpfCnpj = String(formData.get('cpfCnpj') ?? '').replace(/\D/g, '')
  const tipo = String(formData.get('tipo') ?? 'cpf') // cpf | cnpj
  const birthDate = String(formData.get('birthDate') ?? '')
  const telefone = String(formData.get('telefone') ?? '').replace(/\D/g, '')
  const endereco = String(formData.get('endereco') ?? '').trim()
  const numero = String(formData.get('numero') ?? '').trim()
  const bairro = String(formData.get('bairro') ?? '').trim()
  const cep = String(formData.get('cep') ?? '').replace(/\D/g, '')
  const renda = Number(formData.get('renda') ?? 0)

  if (!nome || !email || !cpfCnpj || !telefone || !endereco || !numero || !bairro || !cep || !renda) {
    return { erro: 'Preencha todos os campos.' }
  }
  if (tipo === 'cpf' && !birthDate) {
    return { erro: 'Informe a data de nascimento.' }
  }

  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'

  try {
    const conta = await asaasCriarSubconta({
      name: nome,
      email,
      cpfCnpj,
      companyType: tipo === 'cnpj' ? 'LIMITED' : undefined,
      birthDate: tipo === 'cpf' ? birthDate : undefined,
      mobilePhone: telefone,
      address: endereco,
      addressNumber: numero,
      province: bairro,
      postalCode: cep,
      incomeValue: renda,
      webhookUrlStatusConta: `${proto}://${host}/api/asaas/webhook-conta`,
      webhookUrlPagamentos: `${proto}://${host}/api/asaas/webhook`,
    })

    const admin = adminClient()
    const { error } = await admin
      .from('lojas')
      .update({
        asaas_subconta_id: conta.id,
        asaas_subconta_wallet_id: conta.walletId,
        asaas_subconta_api_key: conta.apiKey,
        asaas_subconta_status: 'pendente',
      })
      .eq('id', lojaId)

    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro ao criar subconta no Asaas' }
  }

  revalidatePath('/admin/pagamento-pix')
  return { sucesso: true }
}

export async function alternarPixHabilitado(habilitado: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()
  if (!lojista) return { erro: 'Lojista não encontrado' }

  const { error } = await supabase
    .from('lojas')
    .update({ pix_habilitado: habilitado })
    .eq('id', lojista.loja_id)

  if (error) return { erro: error.message }

  revalidatePath('/admin/pagamento-pix')
  revalidatePath('/loja/[slug]', 'page')
  return { sucesso: true }
}
