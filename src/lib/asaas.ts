const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL ?? 'https://api.asaas.com/v3'

function headers() {
  const key = process.env.ASAAS_API_KEY
  if (!key) throw new Error('ASAAS_API_KEY não configurada')
  return {
    'Content-Type': 'application/json',
    access_token: key,
  }
}

export async function asaasCriarCliente(dados: {
  name: string
  email: string
  cpfCnpj?: string
  mobilePhone?: string
}) {
  const res = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(dados),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao criar cliente no Asaas')
  return json as { id: string }
}

export async function asaasCriarAssinatura(dados: {
  customer: string
  value: number
  nextDueDate: string // yyyy-mm-dd
  cycle?: 'MONTHLY'
  description?: string
}) {
  const res = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      customer: dados.customer,
      billingType: 'UNDEFINED', // deixa o cliente escolher Pix, boleto ou cartão
      value: dados.value,
      nextDueDate: dados.nextDueDate,
      cycle: dados.cycle ?? 'MONTHLY',
      description: dados.description ?? 'Assinatura mensal - Cardápio Digital',
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao criar assinatura no Asaas')
  return json as { id: string }
}

export async function asaasBuscarCobrancasDaAssinatura(subscriptionId: string) {
  const res = await fetch(
    `${ASAAS_BASE_URL}/payments?subscription=${subscriptionId}&limit=1&order=desc`,
    { headers: headers() }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao buscar cobranças')
  return json as { data: Array<{ id: string; status: string; invoiceUrl: string }> }
}

export async function asaasCancelarAssinatura(subscriptionId: string) {
  const res = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao cancelar assinatura no Asaas')
  return json as { deleted: boolean }
}
