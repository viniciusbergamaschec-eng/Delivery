import AcompanharPedido from './acompanhar-pedido'

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AcompanharPedido pedidoId={id} />
    </main>
  )
}
