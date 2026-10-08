import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormSubcontaPix from './form-subconta-pix'
import TogglePixHabilitado from './toggle-pix-habilitado'

const STATUS_LABEL: Record<string, string> = {
  nao_configurada: 'Não configurado',
  pendente: 'Aguardando aprovação do Asaas',
  ativa: 'Aprovado',
  rejeitada: 'Rejeitado pelo Asaas',
}

export default async function PagamentoPixPage() {
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
    .select('asaas_subconta_status, pix_habilitado')
    .eq('id', lojista.loja_id)
    .single()
  if (!loja) redirect('/admin')

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <a href="/admin" className="text-sm text-gray-500 underline">← Voltar</a>
        <h1 className="text-2xl font-bold mt-2 mb-1">Receber Pix pelo app</h1>
        <p className="text-gray-500 text-sm mb-6">
          Opcional. O dinheiro cai direto na sua conta — isso não substitui combinar o pagamento
          na entrega ou pelo WhatsApp, só dá mais uma opção pro seu cliente.
        </p>

        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{STATUS_LABEL[loja.asaas_subconta_status] ?? loja.asaas_subconta_status}</p>
        </div>

        {loja.asaas_subconta_status === 'nao_configurada' && (
          <FormSubcontaPix nomeInicial={lojista.nome ?? ''} emailInicial={lojista.email ?? ''} />
        )}

        {loja.asaas_subconta_status === 'pendente' && (
          <div className="bg-blue-50 text-blue-700 text-sm rounded-xl p-4">
            Você vai receber um e-mail do Asaas pra confirmar seus dados e enviar documentos.
            Assim que eles aprovarem, a opção de Pix fica disponível aqui automaticamente.
          </div>
        )}

        {loja.asaas_subconta_status === 'rejeitada' && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4">
            O Asaas rejeitou o cadastro da subconta. Entre em contato com o suporte do Asaas pra
            entender o motivo.
          </div>
        )}

        {loja.asaas_subconta_status === 'ativa' && (
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="font-medium mb-1">Mostrar opção de Pix no cardápio</p>
            <p className="text-sm text-gray-500 mb-3">
              Quando ligado, o cliente final pode optar por pagar na hora, pelo app.
            </p>
            <TogglePixHabilitado habilitadoInicial={loja.pix_habilitado} />
          </div>
        )}
      </div>
    </main>
  )
}
