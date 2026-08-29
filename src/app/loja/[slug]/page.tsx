import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { CarrinhoProvider } from './carrinho-context'
import CardProduto from './card-produto'
import CategoriaNav from './categoria-nav'
import BarraCarrinho from './barra-carrinho'

export default async function CardapioPublico({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: loja } = await supabase
    .from('lojas_publicas')
    .select('id, nome, whatsapp, endereco, horario_funcionamento, cor_primaria, logo_url, pixel_meta_id')
    .eq('slug', slug)
    .single()

  if (!loja) notFound()

  const cor = loja.cor_primaria || '#15803d'

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
  const grupoComItens = grupos.filter((g) => g.itens.length > 0)

  // Índice global de cada produto, só pra escalonar a animação de entrada
  // dos cards (cada um aparece um pouquinho depois do anterior).
  let indiceGlobal = 0

  return (
    <CarrinhoProvider>
      {loja.pixel_meta_id && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${loja.pixel_meta_id}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
      <main className="min-h-screen bg-gray-50 pb-32">
        <header
          className="relative overflow-hidden text-white px-6 pt-12 pb-12 rounded-b-[2.5rem] shadow-xl"
          style={{ background: `linear-gradient(155deg, ${cor}, ${cor}b3 65%, ${cor}80)` }}
        >
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: '#ffffff' }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#000000' }}
          />

          <div className="relative">
            <span className="inline-block text-[11px] font-semibold tracking-wide uppercase bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
              Cardápio digital
            </span>
            <div className="flex items-center gap-3">
              {loja.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loja.logo_url}
                  alt={loja.nome}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40 shrink-0"
                />
              )}
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{loja.nome}</h1>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {loja.endereco && (
                <span className="text-xs font-medium bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  📍 {loja.endereco}
                </span>
              )}
              {loja.horario_funcionamento && (
                <span className="text-xs font-medium bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  🕒 {loja.horario_funcionamento}
                </span>
              )}
            </div>
          </div>
        </header>

        {grupoComItens.length > 1 && (
          <CategoriaNav
            categorias={grupoComItens.map((g) => g.categoria)}
            corPrimaria={cor}
          />
        )}

        <div className="max-w-2xl mx-auto p-4 -mt-2 flex flex-col gap-8">
          {grupoComItens.map(({ categoria, itens }) => (
            <section key={categoria.id} id={`cat-${categoria.id}`} className="scroll-mt-20">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                <span style={{ backgroundColor: cor }} className="w-1.5 h-5 rounded-full inline-block" />
                {categoria.nome}
              </h2>
              <div className="flex flex-col gap-3">
                {itens.map((p) => (
                  <CardProduto key={p.id} produto={p} corPrimaria={cor} atraso={(indiceGlobal++ % 8) * 40} />
                ))}
              </div>
            </section>
          ))}

          {semCategoria.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 text-gray-900">Outros</h2>
              <div className="flex flex-col gap-3">
                {semCategoria.map((p) => (
                  <CardProduto key={p.id} produto={p} corPrimaria={cor} atraso={(indiceGlobal++ % 8) * 40} />
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
