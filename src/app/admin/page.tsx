import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/entrar')
  }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('nome, loja_id, lojas(nome, slug, status_assinatura, trial_expira_em)')
    .eq('id', user.id)
    .single()

  const loja = lojista?.lojas as unknown as
    | { nome: string; slug: string; status_assinatura: string; trial_expira_em: string | null }
    | null

  const trialValido =
    loja?.status_assinatura === 'trial' &&
    loja.trial_expira_em &&
    new Date(loja.trial_expira_em) > new Date()
  const assinaturaEmDia = loja?.status_assinatura === 'ativa' || trialValido

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">Painel da loja</h1>
        <p className="text-gray-600">Bem-vindo, {lojista?.nome ?? user.email}.</p>

        {!assinaturaEmDia && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mt-4">
            <p className="font-medium">Sua assinatura não está ativa.</p>
            <p className="mt-1">
              O acesso ao cardápio, pedidos e configurações fica bloqueado até a assinatura
              ser regularizada.{' '}
              <a href="/admin/assinatura" className="underline font-medium">
                Regularizar agora
              </a>
            </p>
          </div>
        )}

        <pre className="bg-gray-100 p-4 rounded-lg mt-4 text-sm overflow-auto">
          {JSON.stringify(lojista, null, 2)}
        </pre>
        <div className="flex gap-3 mt-4 flex-wrap">
          <a
            href="/admin/pedidos"
            className="inline-block bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Ver pedidos
          </a>
          <a
            href="/admin/dashboard"
            className="inline-block bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Dashboard
          </a>
          <a
            href="/admin/produtos"
            className="inline-block bg-black text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Gerenciar produtos
          </a>
          <a
            href="/admin/configuracoes"
            className="inline-block border rounded-lg px-4 py-2 text-sm font-medium"
          >
            Configurações da loja
          </a>
          <a
            href="/admin/entrega"
            className="inline-block border rounded-lg px-4 py-2 text-sm font-medium"
          >
            Regiões de entrega
          </a>
          <a
            href="/admin/assinatura"
            className="inline-block bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Minha assinatura
          </a>
        </div>
      </div>
    </main>
  )
}
