'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function alternarLojaAberta(aberta: boolean) {
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
    .update({ aberta })
    .eq('id', lojista.loja_id)

  if (error) return { erro: error.message }

  revalidatePath('/admin')
  revalidatePath('/loja/[slug]', 'page')
  return { sucesso: true }
}
