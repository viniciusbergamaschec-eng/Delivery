'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [pronto, setPronto] = useState(false)
  const [senha, setSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    // O link do e-mail de recuperação cria uma sessão temporária (evento
    // PASSWORD_RECOVERY) automaticamente ao carregar a página — só depois
    // disso é seguro deixar a pessoa definir a nova senha.
    const supabase = createClient()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPronto(true)
      }
    })
    // Caso a sessão já exista quando o componente montar (ex: recarregou a página)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }
    setSucesso(true)
    setTimeout(() => router.push('/admin'), 1500)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-1">Nova senha</h1>
        <p className="text-gray-500 text-sm mb-6">Defina uma nova senha para sua conta.</p>

        {!pronto && !sucesso && (
          <p className="bg-yellow-50 text-yellow-700 text-sm p-3 rounded-lg">
            Verificando o link... se você chegou aqui direto (sem clicar em um link de e-mail),
            volte e solicite a recuperação novamente.
          </p>
        )}

        {sucesso && (
          <p className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
            Senha atualizada! Redirecionando...
          </p>
        )}

        {pronto && !sucesso && (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            {erro && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{erro}</p>}
            <div>
              <label className="text-sm font-medium">Nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={salvando}
              className="bg-black text-white rounded-lg py-2 mt-2 font-medium disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
