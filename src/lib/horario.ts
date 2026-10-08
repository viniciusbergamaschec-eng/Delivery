// Lógica de "loja aberta agora?" — função pura, usada tanto no servidor
// (bloqueio real do pedido) quanto na tela (aviso ao cliente e painel).

export type DiaHorario = { ativo: boolean; abre: string; fecha: string }

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const FUSOS = [
  { valor: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { valor: 'America/Manaus', label: 'Amazonas, Mato Grosso, MS, Rondônia, Roraima (GMT-4)' },
  { valor: 'America/Rio_Branco', label: 'Acre (GMT-5)' },
  { valor: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
]

const FUSO_PADRAO = 'America/Sao_Paulo'
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export function horarioValido(h: unknown): h is string {
  return typeof h === 'string' && HORA_REGEX.test(h)
}

function paraMinutos(h: string) {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

export function horariosPadrao(): DiaHorario[] {
  return DIAS_SEMANA.map(() => ({ ativo: false, abre: '18:00', fecha: '23:00' }))
}

// Aceita qualquer coisa que venha do banco (jsonb) e devolve sempre 7 dias
// bem formados. Dia com dado inválido vira "fechado" — na dúvida, fecha.
export function normalizarHorarios(valor: unknown): DiaHorario[] {
  if (!Array.isArray(valor) || valor.length !== 7) return horariosPadrao()
  return valor.map((d) => {
    const o = (d ?? {}) as Partial<DiaHorario>
    const valido = horarioValido(o.abre) && horarioValido(o.fecha) && o.abre !== o.fecha
    return {
      ativo: o.ativo === true && valido,
      abre: horarioValido(o.abre) ? o.abre : '18:00',
      fecha: horarioValido(o.fecha) ? o.fecha : '23:00',
    }
  })
}

const MAPA_DIA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

function agoraNoFuso(agora: Date, fuso: string) {
  const tz = FUSOS.some((f) => f.valor === fuso) ? fuso : FUSO_PADRAO
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(agora)
  const dia = MAPA_DIA[partes.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0
  let hora = Number(partes.find((p) => p.type === 'hour')?.value ?? 0)
  if (hora === 24) hora = 0
  const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? 0)
  return { dia, minutos: hora * 60 + minuto }
}

function estaDentroDoHorario(horarios: DiaHorario[], dia: number, minutos: number) {
  const hoje = horarios[dia]
  if (hoje.ativo) {
    const a = paraMinutos(hoje.abre)
    const f = paraMinutos(hoje.fecha)
    if (a < f) {
      if (minutos >= a && minutos < f) return true
    } else if (minutos >= a) {
      return true // horário que vira a noite (ex: 18:00 às 02:00) — parte antes da meia-noite
    }
  }
  // Parte pós-meia-noite do expediente de ontem (ex: ontem 18:00–02:00, agora 01:00)
  const ontem = horarios[(dia + 6) % 7]
  if (ontem.ativo) {
    const a = paraMinutos(ontem.abre)
    const f = paraMinutos(ontem.fecha)
    if (a > f && minutos < f) return true
  }
  return false
}

function proximaAbertura(horarios: DiaHorario[], dia: number, minutos: number): string | null {
  for (let offset = 0; offset <= 7; offset++) {
    const d = (dia + offset) % 7
    const h = horarios[d]
    if (!h.ativo) continue
    if (offset === 0 && paraMinutos(h.abre) <= minutos) continue
    if (offset === 0) return `hoje às ${h.abre}`
    if (offset === 1) return `amanhã às ${h.abre}`
    return `${DIAS_SEMANA[d].toLowerCase()} às ${h.abre}`
  }
  return null
}

export type StatusLoja = {
  aberta: boolean
  motivo: 'aberta' | 'fechada_manual' | 'fora_do_horario'
  proximaAbertura: string | null
}

// Regra: o botão manual "Loja aberta/fechada" é a chave geral — fechado
// manualmente, a loja fecha mesmo dentro do horário. No modo programado, ela
// só abre se a chave estiver ligada E estiver dentro do horário configurado.
export function statusDaLoja(
  loja: {
    aberta: boolean
    modo_funcionamento?: string | null
    horarios?: unknown
    fuso_horario?: string | null
  },
  agora: Date = new Date()
): StatusLoja {
  if (!loja.aberta) return { aberta: false, motivo: 'fechada_manual', proximaAbertura: null }
  if (loja.modo_funcionamento !== 'programado') {
    return { aberta: true, motivo: 'aberta', proximaAbertura: null }
  }

  const horarios = normalizarHorarios(loja.horarios)
  const { dia, minutos } = agoraNoFuso(agora, loja.fuso_horario ?? FUSO_PADRAO)

  if (estaDentroDoHorario(horarios, dia, minutos)) {
    return { aberta: true, motivo: 'aberta', proximaAbertura: null }
  }
  return {
    aberta: false,
    motivo: 'fora_do_horario',
    proximaAbertura: proximaAbertura(horarios, dia, minutos),
  }
}
