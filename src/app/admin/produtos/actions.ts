'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getLojaId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('loja_id')
    .eq('id', user.id)
    .single()

  if (!lojista) throw new Error('Lojista não encontrado')
  return { supabase, lojaId: lojista.loja_id }
}

// ---------- Categorias ----------

export async function criarCategoria(_prevState: unknown, formData: FormData) {
  const nome = String(formData.get('nome'))
  try {
    const { supabase, lojaId } = await getLojaId()
    const { error } = await supabase.from('categorias').insert({ nome, loja_id: lojaId })
    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
  revalidatePath('/admin/produtos')
  return { sucesso: true }
}

export async function renomearCategoria(_prevState: unknown, formData: FormData) {
  const id = String(formData.get('id'))
  const nome = String(formData.get('nome'))
  try {
    const { supabase, lojaId } = await getLojaId()
    const { error } = await supabase
      .from('categorias')
      .update({ nome })
      .eq('id', id)
      .eq('loja_id', lojaId)
    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
  revalidatePath('/admin/produtos')
  return { sucesso: true }
}

export async function excluirCategoria(id: string) {
  const { supabase, lojaId } = await getLojaId()
  await supabase.from('categorias').delete().eq('id', id).eq('loja_id', lojaId)
  revalidatePath('/admin/produtos')
}

// ---------- Produtos ----------

export async function criarProduto(_prevState: unknown, formData: FormData) {
  const nome = String(formData.get('nome'))
  const descricao = String(formData.get('descricao') ?? '')
  const preco = Number(formData.get('preco'))
  const categoria_id = String(formData.get('categoria_id')) || null

  if (!nome || Number.isNaN(preco)) {
    return { erro: 'Nome e preço são obrigatórios' }
  }

  try {
    const { supabase, lojaId } = await getLojaId()
    const { error } = await supabase
      .from('produtos')
      .insert({ nome, descricao, preco, categoria_id, loja_id: lojaId })
    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
  revalidatePath('/admin/produtos')
  return { sucesso: true }
}

export async function editarProduto(_prevState: unknown, formData: FormData) {
  const id = String(formData.get('id'))
  const nome = String(formData.get('nome'))
  const descricao = String(formData.get('descricao') ?? '')
  const preco = Number(formData.get('preco'))
  const categoria_id = String(formData.get('categoria_id')) || null

  if (!nome || Number.isNaN(preco)) {
    return { erro: 'Nome e preço são obrigatórios' }
  }

  try {
    const { supabase, lojaId } = await getLojaId()
    const { error } = await supabase
      .from('produtos')
      .update({ nome, descricao, preco, categoria_id })
      .eq('id', id)
      .eq('loja_id', lojaId)
    if (error) return { erro: error.message }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
  revalidatePath('/admin/produtos')
  return { sucesso: true }
}

export async function alternarDisponibilidade(id: string, disponivel: boolean) {
  const { supabase, lojaId } = await getLojaId()
  await supabase.from('produtos').update({ disponivel }).eq('id', id).eq('loja_id', lojaId)
  revalidatePath('/admin/produtos')
}

export async function excluirProduto(id: string) {
  const { supabase, lojaId } = await getLojaId()
  await supabase.from('produtos').delete().eq('id', id).eq('loja_id', lojaId)
  revalidatePath('/admin/produtos')
}
