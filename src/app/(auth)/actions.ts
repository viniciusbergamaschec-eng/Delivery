'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { checarLimite, obterIp } from '@/lib/rate-limit'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).slice(2, 6)
}

export async function cadastrarLoja(_prevState: unknown, formData: FormData) {
  const ip = await obterIp()
  const limite = checarLimite(`cadastro:${ip}`, { maximo: 3, janelaMs: 60 * 60_000 })
  if (!limite.permitido) {
    return { erro: 'Muitas tentativas de cadastro. Aguarde um pouco e tente novamente.' }
  }

  const email = String(formData.get('email')).trim().toLowerCase()
  const senha = String(formData.get('senha'))
  const nomeLoja = String(formData.get('nomeLoja')).trim()
  const nomeLojista = String(formData.get('nomeLojista')).trim()
  const whatsapp = String(formData.get('whatsapp')).trim()

  if (!email || !senha || !nomeLoja || !nomeLojista || !whatsapp) {
    return { erro: 'Preencha todos os campos.' }
  }
  if (senha.length < 6) {
    return { erro: 'A senha precisa ter pelo menos 6 caracteres.' }
  }

  const supabase = await createClient()

  // Cria o usuário pelo client normal (pra respeitar confirmação de e-mail,
  // se estiver habilitada no projeto). A partir daqui usamos a service role
  // pra criar loja + vínculo, porque nesse momento pode não existir ainda
  // uma sessão autenticada (se o projeto exigir confirmar e-mail antes de
  // liberar login) — e a criação da loja não pode depender disso.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha,
  })

  if (authError || !authData.user) {
    return { erro: authError?.message ?? 'Erro ao criar usuário' }
  }

  const admin = adminClient()
  const slug = gerarSlug(nomeLoja)

  const { data: loja, error: lojaError } = await admin
    .from('lojas')
    .insert({ nome: nomeLoja, slug, whatsapp })
    .select()
    .single()

  if (lojaError || !loja) {
    // Rollback: sem loja, o usuário criado fica órfão — melhor remover o
    // usuário e deixar a pessoa tentar de novo do zero.
    await admin.auth.admin.deleteUser(authData.user.id)
    return { erro: lojaError?.message ?? 'Erro ao criar loja' }
  }

  const { error: vinculoError } = await admin.from('lojistas').insert({
    id: authData.user.id,
    loja_id: loja.id,
    email,
    nome: nomeLojista,
  })

  if (vinculoError) {
    // Rollback completo: sem vínculo, a loja e o usuário ficam órfãos.
    await admin.from('lojas').delete().eq('id', loja.id)
    await admin.auth.admin.deleteUser(authData.user.id)
    return { erro: vinculoError.message }
  }

  // Se o projeto exige confirmação de e-mail, não existe sessão ainda —
  // manda pra tela de login com aviso em vez de redirecionar pro admin.
  if (!authData.session) {
    redirect('/entrar?confirmar_email=1')
  }

  redirect('/admin')
}

export async function entrar(_prevState: unknown, formData: FormData) {
  const ip = await obterIp()
  const limite = checarLimite(`login:${ip}`, { maximo: 10, janelaMs: 5 * 60_000 })
  if (!limite.permitido) {
    return { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' }
  }

  const email = String(formData.get('email'))
  const senha = String(formData.get('senha'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) {
    return { erro: error.message }
  }

  redirect('/admin')
}
