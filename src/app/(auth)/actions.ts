'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checarLimite, obterIp } from '@/lib/rate-limit'

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

  const email = String(formData.get('email'))
  const senha = String(formData.get('senha'))
  const nomeLoja = String(formData.get('nomeLoja'))
  const nomeLojista = String(formData.get('nomeLojista'))
  const whatsapp = String(formData.get('whatsapp'))

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha,
  })

  if (authError || !authData.user) {
    return { erro: authError?.message ?? 'Erro ao criar usuário' }
  }

  const slug = gerarSlug(nomeLoja)

  const { data: loja, error: lojaError } = await supabase
    .from('lojas')
    .insert({ nome: nomeLoja, slug, whatsapp })
    .select()
    .single()

  if (lojaError || !loja) {
    return { erro: lojaError?.message ?? 'Erro ao criar loja' }
  }

  const { error: vinculoError } = await supabase.from('lojistas').insert({
    id: authData.user.id,
    loja_id: loja.id,
    email,
    nome: nomeLojista,
  })

  if (vinculoError) {
    return { erro: vinculoError.message }
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
