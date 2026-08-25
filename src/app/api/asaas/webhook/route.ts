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
  }

  if (novoStatus) {
    await supabase
      .from('lojas')
      .update({ status_assinatura: novoStatus })
      .eq('asaas_subscription_id', subscriptionId)
  }

  return NextResponse.json({ ok: true })
}
