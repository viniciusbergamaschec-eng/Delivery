'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  return { supabase, lojaId: lojista.loja_id }
}

export async function criarRegiao(_prevState: unknown, formData: FormData) {
  const nome = String(formData.get('nome'))
  const taxa = Number(formData.get('taxa'))

  if (!nome || Number.isNaN(taxa)) {
    return { erro: 'Nome e taxa são obrigatórios' }
  }

  try {
    const { supabase, lojaId } = await getLojaId()
    const { error } = await supabase.from('regioes_entrega').insert({ nome, taxa, loja_id: lojaId })
    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
  revalidatePath('/admin/entrega')
  return { sucesso: true }
}

export async function excluirRegiao(id: string) {
  const { supabase, lojaId } = await getLojaId()
  await supabase.from('regioes_entrega').delete().eq('id', id).eq('loja_id', lojaId)
  revalidatePath('/admin/entrega')
}
