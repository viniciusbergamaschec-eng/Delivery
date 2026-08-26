import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FiltroData from './filtro-data'

type Periodo = 'hoje' | 'semana' | 'mes' | 'personalizado'

function calcularIntervalo(periodo: Periodo, de?: string, ate?: string) {
  const agora = new Date()
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

  if (periodo === 'personalizado' && de) {
    const inicio = new Date(`${de}T00:00:00`)
    const fim = ate ? new Date(`${ate}T23:59:59.999`) : new Date(`${de}T23:59:59.999`)
    return { inicio, fim }
  }

  if (periodo === 'semana') {
    const diaSemana = inicioHoje.getDay() // 0 = domingo
    const inicio = new Date(inicioHoje)
    inicio.setDate(inicio.getDate() - diaSemana)
    return { inicio, fim: agora }
  }

  if (periodo === 'mes') {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    return { inicio, fim: agora }
  }

  // hoje
  return { inicio: inicioHoje, fim: agora }
}

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>
}) {
  const params = await searchParams
  const periodo = (params.periodo as Periodo) ?? 'hoje'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) redirect('/entrar')

  const { inicio, fim } = calcularIntervalo(periodo, params.de, params.ate)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('status, total, criado_em')
    .eq('loja_id', lojista.loja_id)
    .gte('criado_em', inicio.toISOString())
    .lte('criado_em', fim.toISOString())

  const lista = pedidos ?? []
  const cancelados = lista.filter((p) => p.status === 'cancelado')
  const validos = lista.filter((p) => p.status !== 'cancelado')
  const faturamento = validos.reduce((soma, p) => soma + Number(p.total), 0)
  const ticketMedio = validos.length > 0 ? faturamento / validos.length : 0

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          Acompanhe pedidos e faturamento por período.
        </p>

        <FiltroData periodo={periodo} de={params.de} ate={params.ate} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400">Pedidos</p>
            <p className="text-2xl font-bold">{lista.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400">Cancelados</p>
            <p className="text-2xl font-bold">{cancelados.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400">Faturamento</p>
            <p className="text-2xl font-bold">{formatarPreco(faturamento)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400">Ticket médio</p>
            <p className="text-2xl font-bold">{formatarPreco(ticketMedio)}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Faturamento e ticket médio não contam pedidos cancelados.
        </p>
      </div>
    </main>
  )
}
