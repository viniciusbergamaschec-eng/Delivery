import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Usa a service role para poder atualizar qualquer loja (webhook não tem sessão de usuário)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN
  const tokenRecebido = req.headers.get('asaas-access-token')

  // Fail-closed: se a env var não estiver configurada, rejeita tudo em vez
  // de pular a validação. Um webhook sem token de verificação aceitaria
  // requisição forjada de qualquer um marcando qualquer loja como "ativa".
  if (!tokenEsperado) {
    return NextResponse.json({ error: 'Webhook não configurado corretamente' }, { status: 500 })
  }
  if (tokenRecebido !== tokenEsperado) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const body = await req.json()

  const evento = body.event as string
  const subscriptionId = body.payment?.subscription as string | undefined

  if (!subscriptionId) {
    return NextResponse.json({ ok: true })
  }

  const supabase = adminClient()

  let novoStatus: string | null = null
  if (evento === 'PAYMENT_CONFIRMED' || evento === 'PAYMENT_RECEIVED') {
    novoStatus = 'ativa'
  } else if (evento === 'PAYMENT_OVERDUE') {
    novoStatus = 'inadimplente'
  } else if (
    evento === 'PAYMENT_DELETED' ||
    evento === 'PAYMENT_REFUNDED' ||
    evento === 'SUBSCRIPTION_DELETED' ||
    evento === 'SUBSCRIPTION_INACTIVATED'
  ) {
    novoStatus = 'cancelada'
  }

  if (novoStatus) {
    await supabase
      .from('lojas')
      .update({ status_assinatura: novoStatus })
      .eq('asaas_subscription_id', subscriptionId)
  }

  return NextResponse.json({ ok: true })
}
