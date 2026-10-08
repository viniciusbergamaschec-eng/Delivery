import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN
  const tokenRecebido = req.headers.get('asaas-access-token')

  // Mesma regra de sempre: sem token configurado, rejeita tudo (fail-closed)
  // em vez de aceitar sem checar.
  if (!tokenEsperado) {
    return NextResponse.json({ error: 'Webhook não configurado corretamente' }, { status: 500 })
  }
  if (tokenRecebido !== tokenEsperado) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const body = await req.json()
  const evento = body.event as string
  const contaId = body.id as string | undefined
  const statusGeral = body.accountStatus?.general as string | undefined

  if (evento !== 'ACCOUNT_STATUS_UPDATED' || !contaId || !statusGeral) {
    return NextResponse.json({ ok: true })
  }

  const supabase = adminClient()

  let novoStatus: string | null = null
  if (statusGeral === 'APPROVED') novoStatus = 'ativa'
  else if (statusGeral === 'REJECTED') novoStatus = 'rejeitada'
  else if (statusGeral === 'PENDING' || statusGeral === 'AWAITING_APPROVAL') novoStatus = 'pendente'

  if (novoStatus) {
    await supabase
      .from('lojas')
      .update({ asaas_subconta_status: novoStatus })
      .eq('asaas_subconta_id', contaId)
  }

  return NextResponse.json({ ok: true })
}
