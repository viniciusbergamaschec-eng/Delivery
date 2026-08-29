'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarConfiguracoes(_prevState: unknown, formData: FormData) {
  const nome = String(formData.get('nome'))
  const whatsapp = String(formData.get('whatsapp'))
  const endereco = String(formData.get('endereco'))
  const horario_funcionamento = String(formData.get('horario_funcionamento'))
  const cor_primaria = String(formData.get('cor_primaria'))
  const pixel_meta_id = String(formData.get('pixel_meta_id') ?? '').trim()
  const aceitacao_automatica = formData.get('aceitacao_automatica') === 'on'
  const logoFile = formData.get('logo') as File | null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) return { erro: 'Lojista não encontrado' }

  const dadosAtualizar: Record<string, unknown> = {
    nome,
    whatsapp,
    endereco,
    horario_funcionamento,
    cor_primaria,
    pixel_meta_id: pixel_meta_id || null,
    aceitacao_automatica,
  }

  // Só mexe no logo se o lojista de fato selecionou um arquivo novo
  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { erro: 'Logo muito grande. Envie uma imagem de até 2MB.' }
    }

    const extensao = logoFile.name.split('.').pop() || 'png'
    const caminho = `${lojista.loja_id}/logo.${extensao}`

    const { error: erroUpload } = await supabase.storage
      .from('logos')
      .upload(caminho, logoFile, { upsert: true, cacheControl: '3600' })

    if (erroUpload) return { erro: `Falha ao enviar logo: ${erroUpload.message}` }

    const { data: urlPublica } = supabase.storage.from('logos').getPublicUrl(caminho)
    // Sufixo pra invalidar cache de navegador quando o lojista troca a logo
    dadosAtualizar.logo_url = `${urlPublica.publicUrl}?v=${Date.now()}`
  }

  const { error } = await supabase
    .from('lojas')
    .update(dadosAtualizar)
    .eq('id', lojista.loja_id)

  if (error) return { erro: error.message }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/loja/[slug]', 'page')
  return { sucesso: true }
}
