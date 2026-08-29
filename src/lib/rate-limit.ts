import { headers } from 'next/headers'

// Rate limit simples em memória, por IP. Serve como uma primeira barreira
// contra abuso automatizado (bot enviando pedido em loop, por exemplo).
//
// Limitação real, pra não vender isso como algo que não é: em serverless
// (Vercel), cada instância da função tem sua própria memória — se o Vercel
// escalar pra múltiplas instâncias ou a função reiniciar (cold start), o
// contador zera. Ou seja, isso reduz abuso casual/de script simples, mas
// não é uma garantia contra um ataque distribuído ou bem coordenado. Pra
// proteção robusta de verdade, o passo seguinte é um rate limit central
// (ex: Upstash Redis), que persiste entre instâncias — vale considerar se
// o abuso real acontecer.

type Registro = { timestamps: number[] }

const acessos = new Map<string, Registro>()

// Limpa entradas antigas de tempos em tempos pra não vazar memória
// indefinidamente no processo.
let ultimaLimpeza = Date.now()
function limparAntigos(janelaMs: number) {
  const agora = Date.now()
  if (agora - ultimaLimpeza < 60_000) return
  ultimaLimpeza = agora
  for (const [chave, registro] of acessos) {
    registro.timestamps = registro.timestamps.filter((t) => agora - t < janelaMs)
    if (registro.timestamps.length === 0) acessos.delete(chave)
  }
}

export async function obterIp(): Promise<string> {
  const h = await headers()
  // Vercel injeta x-forwarded-for com o IP real do visitante
  const forwardedFor = h.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return h.get('x-real-ip') ?? 'desconhecido'
}

/**
 * Verifica se uma chave (geralmente `acao:ip`) excedeu o limite de
 * chamadas numa janela de tempo. Retorna `{ permitido: false }` quando
 * deve bloquear.
 */
export function checarLimite(
  chave: string,
  opcoes: { maximo: number; janelaMs: number }
): { permitido: boolean; tentativasRestantes: number } {
  limparAntigos(opcoes.janelaMs)

  const agora = Date.now()
  const registro = acessos.get(chave) ?? { timestamps: [] }
  registro.timestamps = registro.timestamps.filter((t) => agora - t < opcoes.janelaMs)

  if (registro.timestamps.length >= opcoes.maximo) {
    acessos.set(chave, registro)
    return { permitido: false, tentativasRestantes: 0 }
  }

  registro.timestamps.push(agora)
  acessos.set(chave, registro)
  return { permitido: true, tentativasRestantes: opcoes.maximo - registro.timestamps.length }
}
