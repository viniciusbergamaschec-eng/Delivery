'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { entrar } from '../actions'

function AvisoConfirmarEmail() {
  const searchParams = useSearchParams()
  const confirmarEmail = searchParams.get('confirmar_email') === '1'

  if (!confirmarEmail) return null

  return (
    <p className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-4">
      Loja criada! Confirme seu e-mail antes de entrar (verifique também a caixa de spam).
    </p>
  )
}

export default function EntrarPage() {
  const [state, formAction, pending] = useActionState(entrar, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Entrar na sua loja</h1>

        <Suspense fallback={null}>
          <AvisoConfirmarEmail />
        </Suspense>

        {state?.erro && (
          <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{state.erro}</p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input type="email" name="email" required className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <input type="password" name="senha" required className="w-full border rounded-lg px-3 py-2 mt-1" />
            <a href="/recuperar-senha" className="text-xs text-gray-500 underline mt-1 inline-block">
              Esqueci minha senha
            </a>
          </div>
          <button type="submit" disabled={pending} className="bg-black text-white rounded-lg py-2 mt-2 font-medium disabled:opacity-50">
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Ainda não tem loja? <a href="/cadastro" className="underline">Cadastrar</a>
        </p>
      </div>
    </main>
  )
}
