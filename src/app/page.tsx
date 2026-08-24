import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Cardápio Digital</h1>
      <div className="flex gap-3">
        <Link href="/cadastro" className="bg-black text-white px-4 py-2 rounded-lg">Cadastrar loja</Link>
        <Link href="/entrar" className="border px-4 py-2 rounded-lg">Entrar</Link>
      </div>
    </main>
  )
}
