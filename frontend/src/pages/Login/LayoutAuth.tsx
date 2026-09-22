import type { ReactNode } from 'react'

export function LayoutAuth({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-sm font-semibold tracking-widest text-violet-400 uppercase">RPG Online</p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl shadow-black/30">
          <h1 className="text-xl font-semibold text-zinc-100">{titulo}</h1>
          <p className="mt-1 mb-6 text-sm text-zinc-400">{subtitulo}</p>
          {children}
        </div>
      </div>
    </main>
  )
}
