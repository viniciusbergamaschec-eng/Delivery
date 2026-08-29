'use client'

import { useActionState } from 'react'
import { cadastrarLoja } from '../actions'

function formatarWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

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

        <fieldset disabled={pending} className="contents">
          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Nome da loja</label>
              <input name="nomeLoja" required className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium">Seu nome</label>
              <input name="nomeLojista" required className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp da loja (com DDD)</label>
              <input
                name="whatsapp"
                required
                inputMode="numeric"
                placeholder="(44) 99999-9999"
                onChange={(e) => { e.target.value = formatarWhatsapp(e.target.value) }}
                className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" name="email" required className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input type="password" name="senha" required minLength={6} className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-50" />
            </div>
            <button type="submit" className="bg-black text-white rounded-lg py-2 mt-2 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {pending && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {pending ? 'Criando sua loja...' : 'Criar minha loja'}
            </button>
          </form>
        </fieldset>

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
