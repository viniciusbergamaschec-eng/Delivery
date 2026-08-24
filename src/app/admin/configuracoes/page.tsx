import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormConfiguracoes from './form-configuracoes'

export default async function ConfiguracoesPage() {
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
    .select('*')
    .eq('id', lojista.loja_id)
    .single()

  if (!loja) redirect('/admin')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1">Configurações da loja</h1>
        <p className="text-gray-500 text-sm mb-6">
          Essas informações aparecem no seu cardápio público.
        </p>
        <FormConfiguracoes loja={loja} />
      </div>
    </main>
  )
}
