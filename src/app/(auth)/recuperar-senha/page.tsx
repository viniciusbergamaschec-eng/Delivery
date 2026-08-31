'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setEnviando(false)

    // Sempre mostra sucesso, mesmo se o e-mail não existir na base — isso
    // evita que alguém use esse formulário pra descobrir quais e-mails
    // estão cadastrados na plataforma (enumeration attack).
    if (error && error.message.toLowerCase().includes('rate limit')) {
      setErro('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      return
    }
    setEnviado(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-1">Recuperar senha</h1>
        <p className="text-gray-500 text-sm mb-6">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {enviado ? (
          <p className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
            Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha
            (confira também a caixa de spam).
          </p>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-4">
            {erro && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{erro}</p>}
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="bg-black text-white rounded-lg py-2 mt-2 font-medium disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          <a href="/entrar" className="underline">Voltar para o login</a>
        </p>
      </div>
    </main>
  )
}
