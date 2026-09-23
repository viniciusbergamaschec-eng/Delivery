'use client'

import { useState } from 'react'

export default function LinkCardapio({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Clipboard pode falhar em navegador antigo/sem permissão — o link
      // já está visível e selecionável na tela como alternativa.
    }
  }

  const textoWhatsapp = encodeURIComponent(
    `Peça pelo nosso cardápio online: ${url}`
  )

  return (
    <div>
      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 pl-4">
        <span className="flex-1 text-sm font-medium truncate">{url}</span>
        <button
          onClick={copiar}
          className="shrink-0 bg-white text-black text-sm font-medium rounded-md px-3 py-2 transition-colors hover:bg-white/90"
        >
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
        >
          Abrir cardápio
        </a>
        <span className="opacity-40">·</span>
        <a
          href={`https://wa.me/?text=${textoWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
        >
          Compartilhar no WhatsApp
        </a>
      </div>
    </div>
  )
}
