import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { exigirAssinaturaAtiva } from '@/lib/auth-admin'
import { normalizarHorarios, statusDaLoja } from '@/lib/horario'
import FormFuncionamento from './form-funcionamento'

export default async function FuncionamentoPage() {
  const { lojista } = await exigirAssinaturaAtiva()
  const supabase = await createClient()

  const { data: loja } = await supabase
    .from('lojas')
    .select('aberta, modo_funcionamento, horarios, fuso_horario, aceita_entrega, aceita_retirada')
    .eq('id', lojista.loja_id)
    .single()
  if (!loja) redirect('/admin')

  const status = statusDaLoja(loja)

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <a href="/admin" className="text-sm text-gray-500 underline">← Voltar</a>
        <h1 className="text-2xl font-bold mt-2 mb-1">Funcionamento e modalidades</h1>
        <p className="text-gray-500 text-sm mb-4">
          Defina quando a loja aceita pedidos e se atende entrega, retirada ou os dois.
        </p>

        <div
          className={`text-sm rounded-xl p-3 mb-6 ${
            status.aberta ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {status.aberta && 'Agora: a loja está aceitando pedidos.'}
          {status.motivo === 'fechada_manual' &&
            'Agora: loja fechada pela chave manual do painel (clientes não conseguem pedir).'}
          {status.motivo === 'fora_do_horario' &&
            `Agora: fora do horário programado — clientes não conseguem pedir${
              status.proximaAbertura ? ` (abre ${status.proximaAbertura})` : ''
            }.`}
        </div>

        <FormFuncionamento
          modoInicial={loja.modo_funcionamento === 'programado' ? 'programado' : 'manual'}
          fusoInicial={loja.fuso_horario}
          horariosIniciais={normalizarHorarios(loja.horarios)}
          aceitaEntregaInicial={loja.aceita_entrega}
          aceitaRetiradaInicial={loja.aceita_retirada}
        />
      </div>
    </main>
  )
}
