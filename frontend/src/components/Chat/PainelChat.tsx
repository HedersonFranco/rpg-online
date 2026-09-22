import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket, useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import type { Mensagem, Rolagem } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { Icone } from '../ui/Icone'
import { classeBotaoPrimario, classeInput } from '../ui/estilos'

type Item = { tipo: 'mensagem'; dado: Mensagem; quando: string } | { tipo: 'rolagem'; dado: Rolagem; quando: string }

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function PainelChat({ salaId }: { salaId: string }) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<Mensagem[]>(`/salas/${salaId}/mensagens`)
  const { rolagens, emitir } = useSalaSocket()
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fimDaLista = useRef<HTMLDivElement>(null)

  useAoResincronizar(revalidar)
  useEventoSocket<Mensagem>('chat:mensagem', (nova) =>
    atualizar((lista) => (lista.some((m) => m.id === nova.id) ? lista : [...lista, nova])),
  )

  // Rolagens não são persistidas (regra de negócio): ficam só enquanto esta aba viu.
  const itens: Item[] =
    estado.tipo === 'ok'
      ? [
          ...estado.dados.map((m): Item => ({ tipo: 'mensagem', dado: m, quando: m.createdAt })),
          ...rolagens.map((r): Item => ({ tipo: 'rolagem', dado: r, quando: r.criadoEm })),
        ].sort((a, b) => a.quando.localeCompare(b.quando))
      : []

  useEffect(() => {
    fimDaLista.current?.scrollIntoView({ block: 'nearest' })
  }, [itens.length])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!texto.trim()) return
    setErro(null)
    setEnviando(true)
    try {
      await emitir('chat:enviar', { conteudo: texto })
      setTexto('')
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite" aria-label="Mensagens">
        {estado.tipo === 'carregando' && <Carregando texto="Carregando mensagens..." />}
        {estado.tipo === 'erro' && <Alerta mensagem={estado.mensagem} onTentarNovamente={recarregar} />}
        {estado.tipo === 'ok' && itens.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">Nenhuma mensagem ainda.</p>
        )}
        {itens.map((item) =>
          item.tipo === 'mensagem' ? (
            <div key={item.dado.id} className="text-sm">
              <span className="font-semibold text-zinc-200">{item.dado.usuario.nome}</span>{' '}
              <span className="text-xs text-zinc-500">{hora(item.dado.createdAt)}</span>
              <p className="break-words whitespace-pre-wrap text-zinc-300">{item.dado.conteudo}</p>
            </div>
          ) : (
            <div key={item.dado.id} className="rounded-md border border-violet-900/60 bg-violet-950/30 px-2 py-1.5 text-sm">
              <p className="flex items-center gap-1.5 text-xs text-violet-300">
                <Icone nome="dados" className="h-3.5 w-3.5" />
                {item.dado.autor.nome} rolou {item.dado.expressao}
                <span className="text-zinc-500">· {hora(item.dado.criadoEm)}</span>
              </p>
              <p className="text-zinc-300">
                [{item.dado.dados.join(', ')}] = <strong className="text-lg text-zinc-100">{item.dado.total}</strong>
              </p>
            </div>
          ),
        )}
        <div ref={fimDaLista} />
      </div>

      <form onSubmit={enviar} className="mt-3 flex gap-2">
        <label htmlFor="chat-texto" className="sr-only">Mensagem</label>
        <input id="chat-texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000}
          placeholder="Escreva uma mensagem" disabled={enviando} className={`${classeInput} py-1.5 text-sm`} />
        <button type="submit" disabled={enviando || !texto.trim()} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>
          Enviar
        </button>
      </form>
      {erro && <div className="mt-2"><Alerta mensagem={erro} /></div>}
    </div>
  )
}
