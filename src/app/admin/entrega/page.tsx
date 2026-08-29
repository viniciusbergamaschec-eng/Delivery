import { exigirAssinaturaAtiva } from '@/lib/auth-admin'
import FormRegioes from './form-regioes'

export default async function EntregaPage() {
  const { supabase, lojista } = await exigirAssinaturaAtiva()

  const { data: regioes } = await supabase
    .from('regioes_entrega')
    .select('*')
    .eq('loja_id', lojista.loja_id)
    .order('ordem')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1">Regiões de entrega</h1>
        <p className="text-gray-500 text-sm mb-6">
          Cadastre bairros/regiões e a taxa de entrega de cada um. O cliente escolhe a região no carrinho.
        </p>
        <FormRegioes regioes={regioes ?? []} />
      </div>
    </main>
  )
}
