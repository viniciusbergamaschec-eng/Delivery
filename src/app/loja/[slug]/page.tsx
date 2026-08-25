import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CarrinhoProvider } from './carrinho-context'
import CardProduto from './card-produto'
import BarraCarrinho from './barra-carrinho'

export default async function CardapioPublico({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, whatsapp, endereco, horario_funcionamento, cor_primaria')
    .eq('slug', slug)
    .single()

  if (!loja) notFound()

  const cor = loja.cor_primaria || '#16a34a'

  const [{ data: categorias }, { data: produtos }, { data: regioes }] = await Promise.all([
    supabase.from('categorias').select('*').eq('loja_id', loja.id).order('ordem'),
    supabase
      .from('produtos')
      .select('*')
      .eq('loja_id', loja.id)
      .eq('disponivel', true)
      .order('ordem'),
    supabase.from('regioes_entrega').select('*').eq('loja_id', loja.id).order('ordem'),
  ])

  const semCategoria = (produtos ?? []).filter((p) => !p.categoria_id)
  const grupos = (categorias ?? []).map((cat) => ({
    categoria: cat,
    itens: (produtos ?? []).filter((p) => p.categoria_id === cat.id),
  }))

  return (
    <CarrinhoProvider>
      <main className="min-h-screen bg-gray-50 pb-32">
        <header
          style={{ background: `linear-gradient(135deg, ${cor}, ${cor}dd)` }}
          className="text-white px-6 pt-10 pb-8 rounded-b-3xl shadow-lg"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">{loja.nome}</h1>
          <div className="flex flex-col gap-0.5 mt-2 text-white/90 text-sm">
            {loja.endereco && <p>📍 {loja.endereco}</p>}
            {loja.horario_funcionamento && <p>🕒 {loja.horario_funcionamento}</p>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 -mt-4 flex flex-col gap-7">
          {grupos.map(
            ({ categoria, itens }) =>
              itens.length > 0 && (
                <section key={categoria.id}>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span style={{ backgroundColor: cor }} className="w-1.5 h-5 rounded-full inline-block" />
                    {categoria.nome}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {itens.map((p) => (
                      <CardProduto key={p.id} produto={p} corPrimaria={cor} />
                    ))}
                  </div>
                </section>
              )
          )}

          {semCategoria.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Outros</h2>
              <div className="flex flex-col gap-3">
                {semCategoria.map((p) => (
                  <CardProduto key={p.id} produto={p} corPrimaria={cor} />
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

        <BarraCarrinho
          whatsappLoja={loja.whatsapp ?? ''}
          nomeLoja={loja.nome}
          lojaId={loja.id}
          corPrimaria={cor}
          regioes={regioes ?? []}
        />
      </main>
    </CarrinhoProvider>
  )
}
