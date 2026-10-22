import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket, useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import type { AvisoRolagem, Mensagem, Rolagem } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { BilheteRolagem } from './BilheteRolagem'
import { Folha } from '../ui/arquivo'
import { Icone } from '../ui/Icone'
import { classeBotaoTinta, classeCampo, condensado } from '../ui/estilosArquivo'

type Item =
  | { tipo: 'mensagem'; dado: Mensagem; quando: string }
  | { tipo: 'rolagem'; dado: Rolagem; quando: string }
  | { tipo: 'aviso'; dado: AvisoRolagem; quando: string }

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function PainelChat({ salaId }: { salaId: string }) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<Mensagem[]>(`/salas/${salaId}/mensagens`)
  const { rolagens, avisosRolagem, emitir } = useSalaSocket()
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
          ...avisosRolagem.map((a): Item => ({ tipo: 'aviso', dado: a, quando: a.criadoEm })),
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
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" aria-live="polite" aria-label="Mensagens">
        {estado.tipo === 'carregando' && <Carregando texto="Carregando mensagens..." />}
        {estado.tipo === 'erro' && <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />}
        {estado.tipo === 'ok' && itens.length === 0 && (
          <p className="py-6 text-center text-sm text-grafite-300">Nenhuma mensagem ainda.</p>
        )}
        {itens.map((item) =>
          item.tipo === 'mensagem' ? (
            <div key={item.dado.id} className="text-sm">
              <p className="flex items-baseline gap-2">
                <span className={`font-extrabold tracking-[0.04em] text-kraft-300 uppercase ${condensado}`}>{item.dado.usuario.nome}</span>
                <span className="font-datilo text-xs text-grafite-400">{hora(item.dado.createdAt)}</span>
              </p>
              <p className="mt-0.5 break-words whitespace-pre-wrap text-grafite-100">{item.dado.conteudo}</p>
            </div>
          ) : item.tipo === 'rolagem' ? (
            <BilheteRolagem key={item.dado.id} rolagem={item.dado} />
          ) : (
            // Rolagem secreta do mestre, com o aviso ligado: só a frase, sem resultado.
            <p key={item.dado.id} className="flex items-center gap-2 text-sm text-grafite-300 italic">
              <Icone nome="dados" className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">{item.dado.frase}</span>
              <span className="font-datilo text-xs text-grafite-400 not-italic">{hora(item.dado.criadoEm)}</span>
            </p>
          ),
        )}
        <div ref={fimDaLista} />
      </div>

      <Folha className="mt-3 p-2 sm:p-2">
        <form onSubmit={enviar} className="flex gap-2">
          <label htmlFor="chat-texto" className="sr-only">Mensagem</label>
          <input id="chat-texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000}
            placeholder="Mensagem" disabled={enviando} className={`${classeCampo} min-w-0 text-sm`} />
          <button type="submit" disabled={enviando || !texto.trim()} className={`${classeBotaoTinta} px-4`}>
            Enviar
          </button>
        </form>
        {erro && <div className="mt-2"><Alerta tom="papel" mensagem={erro} /></div>}
      </Folha>
    </div>
  )
}
