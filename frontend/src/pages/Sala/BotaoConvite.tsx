import { useState } from 'react'
import { api, mensagemDeErro } from '../../services/api'
import type { SalaDetalhe } from '../../services/tipos'
import { Icone } from '../../components/ui/Icone'
import { classeBotaoSecundario } from '../../components/ui/estilos'

// Só o dono gera convites (regra do backend). Convite vencido é renovado antes de copiar.
export function BotaoConvite({ sala }: { sala: SalaDetalhe }) {
  const [convite, setConvite] = useState({ token: sala.conviteToken, expiraEm: sala.conviteExpiraEm })
  const [status, setStatus] = useState<'ocioso' | 'copiando' | 'copiado'>('ocioso')
  const [linkManual, setLinkManual] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function copiar() {
    setErro(null)
    setLinkManual(null)
    setStatus('copiando')
    try {
      let atual = convite
      const vencido = !atual.token || !atual.expiraEm || new Date(atual.expiraEm).getTime() < Date.now()
      if (vencido) {
        atual = await api<{ token: string; expiraEm: string }>(`/salas/${sala.id}/convite`, { method: 'POST' })
        setConvite(atual)
      }
      const link = `${window.location.origin}/convite/${atual.token}`
      try {
        await navigator.clipboard.writeText(link)
        setStatus('copiado')
        setTimeout(() => setStatus('ocioso'), 2000)
      } catch {
        setLinkManual(link)
        setStatus('ocioso')
      }
    } catch (e) {
      setErro(mensagemDeErro(e))
      setStatus('ocioso')
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={copiar} disabled={status === 'copiando'} className={`${classeBotaoSecundario} py-1.5 text-sm`}>
        <Icone nome="copiar" className="h-4 w-4" />
        {status === 'copiado' ? 'Link copiado!' : 'Copiar convite'}
      </button>
      {(linkManual || erro) && (
        <div role={erro ? 'alert' : undefined} className="absolute top-full right-0 z-10 mt-2 w-80 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-xs shadow-xl">
          {erro ? (
            <p className="text-red-300">{erro}</p>
          ) : (
            <>
              <p className="mb-2 text-zinc-400">Não foi possível copiar automaticamente. Copie o link:</p>
              <input readOnly value={linkManual ?? ''} onFocus={(e) => e.target.select()} className="w-full rounded bg-zinc-800 px-2 py-1 text-zinc-100" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
