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
    .select('nome, loja_id, lojas(nome, slug, status_assinatura)')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">Painel da loja</h1>
        <p className="text-gray-600">Bem-vindo, {lojista?.nome ?? user.email}.</p>
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
        </div>
      </div>
    </main>
  )
}
