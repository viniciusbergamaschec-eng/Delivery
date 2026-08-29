import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Garante que existe usuário logado, vinculado a uma loja, com a assinatura
 * em dia (ativa, ou dentro do período de trial). Páginas de features do
 * admin (produtos, pedidos, dashboard, entrega, configurações) devem
 * chamar isso ANTES de fazer qualquer outra coisa — sem isso, a checagem
 * de assinatura vira só um badge visual, sem efeito real de bloqueio.
 *
 * A página /admin/assinatura NÃO deve usar este helper (usa uma versão
 * mais simples, sem bloqueio), porque é justamente onde o lojista
 * inadimplente precisa conseguir entrar pra pagar.
 */
export async function exigirAssinaturaAtiva() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id, nome, email')
    .eq('id', user.id)
    .single()
  if (!lojista) redirect('/entrar')

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, status_assinatura, trial_expira_em')
    .eq('id', lojista.loja_id)
    .single()
  if (!loja) redirect('/entrar')

  const trialValido =
    loja.status_assinatura === 'trial' &&
    loja.trial_expira_em &&
    new Date(loja.trial_expira_em) > new Date()

  const assinaturaEmDia = loja.status_assinatura === 'ativa' || trialValido

  if (!assinaturaEmDia) {
    redirect('/admin/assinatura?bloqueado=1')
  }

  return { supabase, user, lojista, loja }
}
