import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListaPedidos from './lista-pedidos'
import FiltroData from '../dashboard/filtro-data'

type Periodo = 'hoje' | 'semana' | 'mes' | 'personalizado' | 'todos'

function calcularIntervalo(periodo: Periodo, de?: string, ate?: string) {
  const agora = new Date()
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

  if (periodo === 'personalizado' && de) {
    const inicio = new Date(`${de}T00:00:00`)
    const fim = ate ? new Date(`${ate}T23:59:59.999`) : new Date(`${de}T23:59:59.999`)
    return { inicio, fim }
  }

  if (periodo === 'semana') {
    const inicio = new Date(inicioHoje)
    inicio.setDate(inicio.getDate() - inicioHoje.getDay())
    return { inicio, fim: agora }
  }

  if (periodo === 'mes') {
    return { inicio: new Date(agora.getFullYear(), agora.getMonth(), 1), fim: agora }
  }

  if (periodo === 'todos') {
    return null
  }

  return { inicio: inicioHoje, fim: agora }
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>
}) {
  const params = await searchParams
  const periodo = (params.periodo as Periodo) ?? 'todos'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) redirect('/entrar')

  const intervalo = calcularIntervalo(periodo, params.de, params.ate)

  let query = supabase
    .from('pedidos')
    .select('*, pedido_itens(*)')
    .eq('loja_id', lojista.loja_id)
    .order('criado_em', { ascending: false })

  if (intervalo) {
    query = query.gte('criado_em', intervalo.inicio.toISOString()).lte('criado_em', intervalo.fim.toISOString())
  }

  const { data: pedidos } = await query

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Pedidos</h1>
        <p className="text-gray-500 text-sm mb-6">
          Acompanhe e atualize o status dos pedidos recebidos.
        </p>
        <div className="mb-6">
          <FiltroData periodo={periodo} de={params.de} ate={params.ate} basePath="/admin/pedidos" mostrarTodos />
        </div>
        <ListaPedidos pedidos={pedidos ?? []} />
      </div>
    </main>
  )
}
