'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarConfiguracoes(_prevState: unknown, formData: FormData) {
  const nome = String(formData.get('nome'))
  const whatsapp = String(formData.get('whatsapp'))
  const endereco = String(formData.get('endereco'))
  const horario_funcionamento = String(formData.get('horario_funcionamento'))
  const cor_primaria = String(formData.get('cor_primaria'))

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
    .update({ nome, whatsapp, endereco, horario_funcionamento, cor_primaria })
    .eq('id', lojista.loja_id)

  if (error) return { erro: error.message }

  revalidatePath('/admin/configuracoes')
  return { sucesso: true }
}
