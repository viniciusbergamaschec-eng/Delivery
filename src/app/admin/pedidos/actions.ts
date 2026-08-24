'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarStatusPedido(pedidoId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) return

  await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', pedidoId)
    .eq('loja_id', lojista.loja_id)

  revalidatePath('/admin/pedidos')
}
