const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL ?? 'https://api.asaas.com/v3'

function headers(chaveAlternativa?: string) {
  const key = chaveAlternativa ?? process.env.ASAAS_API_KEY
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

// ---- Subcontas (Pix do cliente final direto pro lojista) ----

export async function asaasCriarSubconta(dados: {
  name: string
  email: string
  cpfCnpj: string
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION'
  birthDate?: string // yyyy-mm-dd, obrigatório se pessoa física
  phone?: string
  mobilePhone: string
  address: string
  addressNumber: string
  province: string // bairro
  postalCode: string
  incomeValue: number
  webhookUrlStatusConta: string
  webhookUrlPagamentos: string
}) {
  const res = await fetch(`${ASAAS_BASE_URL}/accounts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: dados.name,
      email: dados.email,
      cpfCnpj: dados.cpfCnpj,
      companyType: dados.companyType,
      birthDate: dados.birthDate,
      phone: dados.phone,
      mobilePhone: dados.mobilePhone,
      address: dados.address,
      addressNumber: dados.addressNumber,
      province: dados.province,
      postalCode: dados.postalCode,
      incomeValue: dados.incomeValue,
      webhooks: [
        {
          name: 'Status da conta',
          url: dados.webhookUrlStatusConta,
          email: dados.email,
          enabled: true,
          interrupted: false,
          apiVersion: 3,
          events: ['ACCOUNT_STATUS_UPDATED'],
        },
        {
          name: 'Pagamentos de pedidos',
          url: dados.webhookUrlPagamentos,
          email: dados.email,
          enabled: true,
          interrupted: false,
          apiVersion: 3,
          events: ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'],
        },
      ],
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao criar subconta no Asaas')
  return json as { id: string; apiKey: string; walletId: string }
}

export async function asaasCriarClienteNaSubconta(
  apiKeySubconta: string,
  dados: { name: string; mobilePhone?: string }
) {
  const res = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: headers(apiKeySubconta),
    body: JSON.stringify(dados),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao registrar cliente na subconta')
  return json as { id: string }
}

export async function asaasCriarCobrancaPixNaSubconta(
  apiKeySubconta: string,
  dados: { customer: string; value: number; description?: string }
) {
  const res = await fetch(`${ASAAS_BASE_URL}/payments`, {
    method: 'POST',
    headers: headers(apiKeySubconta),
    body: JSON.stringify({
      customer: dados.customer,
      billingType: 'PIX',
      value: dados.value,
      dueDate: new Date().toISOString().slice(0, 10),
      description: dados.description,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao criar cobrança Pix')
  return json as { id: string }
}

export async function asaasBuscarQrCodePix(apiKeySubconta: string, paymentId: string) {
  const res = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
    headers: headers(apiKeySubconta),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.errors?.[0]?.description ?? 'Erro ao buscar QR Code Pix')
  return json as { encodedImage: string; payload: string }
}
