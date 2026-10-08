'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { FUSOS, horarioValido, type DiaHorario } from '@/lib/horario'

export async function salvarFuncionamento(dados: {
  modo: 'manual' | 'programado'
  fuso: string
  horarios: DiaHorario[]
  aceitaEntrega: boolean
  aceitaRetirada: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()
  if (!lojista) return { erro: 'Lojista não encontrado' }

  // Validação no servidor: nunca confia no que o formulário mandou.
  if (dados.modo !== 'manual' && dados.modo !== 'programado') {
    return { erro: 'Modo de funcionamento inválido.' }
  }
  if (!FUSOS.some((f) => f.valor === dados.fuso)) {
    return { erro: 'Fuso horário inválido.' }
  }
  if (!dados.aceitaEntrega && !dados.aceitaRetirada) {
    return { erro: 'Deixe pelo menos uma modalidade ligada (entrega ou retirada).' }
  }
  if (!Array.isArray(dados.horarios) || dados.horarios.length !== 7) {
    return { erro: 'Horários inválidos.' }
  }

  const horarios: DiaHorario[] = []
  for (let i = 0; i < 7; i++) {
    const d = dados.horarios[i]
    const ativo = d?.ativo === true
    if (ativo) {
      if (!horarioValido(d.abre) || !horarioValido(d.fecha)) {
        return { erro: 'Horário inválido. Use o formato HH:MM.' }
      }
      if (d.abre === d.fecha) {
        return { erro: 'Abertura e fechamento não podem ser o mesmo horário.' }
      }
    }
    horarios.push({
      ativo,
      abre: horarioValido(d?.abre) ? d.abre : '18:00',
      fecha: horarioValido(d?.fecha) ? d.fecha : '23:00',
    })
  }

  if (dados.modo === 'programado' && !horarios.some((h) => h.ativo)) {
    return { erro: 'No modo programado, ligue pelo menos um dia da semana.' }
  }

  const { error } = await supabase
    .from('lojas')
    .update({
      modo_funcionamento: dados.modo,
      fuso_horario: dados.fuso,
      horarios,
      aceita_entrega: dados.aceitaEntrega,
      aceita_retirada: dados.aceitaRetirada,
    })
    .eq('id', lojista.loja_id)

  if (error) return { erro: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/funcionamento')
  revalidatePath('/loja/[slug]', 'page')
  return { sucesso: true }
}
