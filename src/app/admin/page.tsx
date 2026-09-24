import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import LinkCardapio from './link-cardapio'
import ToggleLojaAberta from './toggle-loja-aberta'

const STATUS_LABEL: Record<string, string> = {
  ativa: 'Assinatura ativa',
  trial: 'Período de teste',
  inadimplente: 'Pagamento pendente',
  cancelada: 'Assinatura cancelada',
}

const STATUS_COR: Record<string, string> = {
  ativa: 'bg-green-100 text-green-700',
  trial: 'bg-blue-100 text-blue-700',
  inadimplente: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-200 text-gray-600',
}

const ACOES = [
  {
    href: '/admin/pedidos',
    titulo: 'Pedidos',
    descricao: 'Acompanhe e atualize o status dos pedidos recebidos',
  },
  {
    href: '/admin/dashboard',
    titulo: 'Dashboard',
    descricao: 'Vendas, faturamento e desempenho da loja',
  },
  {
    href: '/admin/produtos',
    titulo: 'Produtos e cardápio',
    descricao: 'Adicione, edite ou remova itens do cardápio',
  },
  {
    href: '/admin/entrega',
    titulo: 'Regiões de entrega',
    descricao: 'Defina áreas e taxas de entrega',
  },
  {
    href: '/admin/configuracoes',
    titulo: 'Configurações da loja',
    descricao: 'Nome, WhatsApp, logo, cor e Pixel do Meta',
  },
  {
    href: '/admin/assinatura',
    titulo: 'Assinatura',
    descricao: 'Plano, cobrança e status de pagamento',
  },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/entrar')
  }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('nome, loja_id, lojas(nome, slug, status_assinatura, trial_expira_em, aberta)')
    .eq('id', user.id)
    .single()

  const loja = lojista?.lojas as unknown as
    | { nome: string; slug: string; status_assinatura: string; trial_expira_em: string | null; aberta: boolean }
    | null

  if (!loja) redirect('/entrar')

  const trialValido =
    loja.status_assinatura === 'trial' &&
    loja.trial_expira_em &&
    new Date(loja.trial_expira_em) > new Date()
  const assinaturaEmDia = loja.status_assinatura === 'ativa' || trialValido

  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const cardapioUrl = `${proto}://${host}/loja/${loja.slug}`

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">Painel da loja</p>
            <h1 className="text-2xl font-bold text-gray-900">{loja.nome}</h1>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COR[loja.status_assinatura] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[loja.status_assinatura] ?? loja.status_assinatura}
          </span>
        </div>

        <div className="mb-6">
          <ToggleLojaAberta abertaInicial={loja.aberta} />
        </div>

        {!assinaturaEmDia && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
            <p className="font-medium">Sua assinatura não está ativa.</p>
            <p className="mt-1">
              O acesso ao cardápio, pedidos e configurações fica bloqueado até a assinatura ser
              regularizada.{' '}
              <a href="/admin/assinatura" className="underline font-medium">
                Regularizar agora
              </a>
            </p>
          </div>
        )}

        <div className="bg-black text-white rounded-2xl p-6 mb-6">
          <p className="text-sm text-white/60 mb-1">Seu cardápio online</p>
          <p className="text-white/90 text-sm mb-4">
            Envie este link para seus clientes fazerem pedidos direto pelo WhatsApp.
          </p>
          <LinkCardapio url={cardapioUrl} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ACOES.map((acao) => (
            <a
              key={acao.href}
              href={acao.href}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              <p className="font-medium text-gray-900">{acao.titulo}</p>
              <p className="text-sm text-gray-500 mt-0.5">{acao.descricao}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
