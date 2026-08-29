'use client'

import { useActionState } from 'react'
import { cadastrarLoja } from '../actions'

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(cadastrarLoja, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-1">Cadastre sua loja</h1>
        <p className="text-gray-500 mb-6 text-sm">Crie seu cardápio digital em minutos.</p>

        {state?.erro && (
          <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{state.erro}</p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Nome da loja</label>
            <input name="nomeLoja" required className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Seu nome</label>
            <input name="nomeLojista" required className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">WhatsApp da loja (com DDD)</label>
            <input name="whatsapp" required placeholder="44999999999" className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input type="email" name="email" required className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <input type="password" name="senha" required minLength={6} className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <button type="submit" disabled={pending} className="bg-black text-white rounded-lg py-2 mt-2 font-medium disabled:opacity-50">
            {pending ? 'Criando...' : 'Criar minha loja'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Ao criar sua loja, você concorda com os{' '}
          <a href="/termos" target="_blank" className="underline">Termos de Uso</a> e a{' '}
          <a href="/privacidade" target="_blank" className="underline">Política de Privacidade</a>.
        </p>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Já tem loja? <a href="/entrar" className="underline">Entrar</a>
        </p>
      </div>
    </main>
  )
}
