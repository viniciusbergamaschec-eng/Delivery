import { exigirAssinaturaAtiva } from '@/lib/auth-admin'
import GerenciadorCategorias from './gerenciador-categorias'
import GerenciadorProdutos from './gerenciador-produtos'

export default async function ProdutosPage() {
  const { supabase, lojista } = await exigirAssinaturaAtiva()

  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabase
      .from('categorias')
      .select('*')
      .eq('loja_id', lojista.loja_id)
      .order('ordem'),
    supabase
      .from('produtos')
      .select('*')
      .eq('loja_id', lojista.loja_id)
      .order('ordem'),
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold">Produtos do cardápio</h1>
          <p className="text-gray-500 text-sm">Gerencie categorias e itens do seu cardápio.</p>
        </div>

        <GerenciadorCategorias categorias={categorias ?? []} />
        <GerenciadorProdutos produtos={produtos ?? []} categorias={categorias ?? []} />
      </div>
    </main>
  )
}
