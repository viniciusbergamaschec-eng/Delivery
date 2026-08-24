import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListaPedidos from './lista-pedidos'

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) redirect('/entrar')

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, pedido_itens(*)')
    .eq('loja_id', lojista.loja_id)
    .order('criado_em', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Pedidos</h1>
        <p className="text-gray-500 text-sm mb-6">
          Acompanhe e atualize o status dos pedidos recebidos.
        </p>
        <ListaPedidos pedidos={pedidos ?? []} />
      </div>
    </main>
  )
}
