import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PainelAssinatura from './painel-assinatura'

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ bloqueado?: string }>
}) {
  const { bloqueado } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()
  if (!lojista) redirect('/entrar')

  const { data: loja } = await supabase
    .from('lojas')
    .select('status_assinatura, valor_mensalidade, asaas_subscription_id')
    .eq('id', lojista.loja_id)
    .single()
  if (!loja) redirect('/admin')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">Assinatura</h1>
        <p className="text-gray-500 text-sm mb-6">
          Mantenha sua loja ativa no cardápio digital.
        </p>
        {bloqueado && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            Seu período de teste acabou ou sua assinatura está pendente. Regularize para
            voltar a acessar o painel.
          </div>
        )}
        <PainelAssinatura loja={loja} />
      </div>
    </main>
  )
}
