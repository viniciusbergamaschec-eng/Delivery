import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

function formatarPreco(preco: number) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function CardapioPublico({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, whatsapp')
    .eq('slug', slug)
    .single()

  if (!loja) notFound()

  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabase.from('categorias').select('*').eq('loja_id', loja.id).order('ordem'),
    supabase
      .from('produtos')
      .select('*')
      .eq('loja_id', loja.id)
      .eq('disponivel', true)
      .order('ordem'),
  ])

  const semCategoria = (produtos ?? []).filter((p) => !p.categoria_id)
  const grupos = (categorias ?? []).map((cat) => ({
    categoria: cat,
    itens: (produtos ?? []).filter((p) => p.categoria_id === cat.id),
  }))

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-black text-white p-6">
        <h1 className="text-2xl font-bold">{loja.nome}</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-8">
        {grupos.map(
          ({ categoria, itens }) =>
            itens.length > 0 && (
              <section key={categoria.id}>
                <h2 className="text-lg font-semibold mb-2">{categoria.nome}</h2>
                <div className="flex flex-col gap-3">
                  {itens.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl shadow p-4">
                      <p className="font-medium">{p.nome}</p>
                      {p.descricao && (
                        <p className="text-sm text-gray-500">{p.descricao}</p>
                      )}
                      <p className="text-sm font-semibold mt-1">{formatarPreco(p.preco)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )
        )}

        {semCategoria.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Outros</h2>
            <div className="flex flex-col gap-3">
              {semCategoria.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-4">
                  <p className="font-medium">{p.nome}</p>
                  {p.descricao && <p className="text-sm text-gray-500">{p.descricao}</p>}
                  <p className="text-sm font-semibold mt-1">{formatarPreco(p.preco)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(produtos ?? []).length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            Essa loja ainda não cadastrou produtos.
          </p>
        )}
      </div>
    </main>
  )
}
