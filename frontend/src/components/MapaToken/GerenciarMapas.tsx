import { useRef, useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { useEventoSocket } from '../../hooks/useSocket'
import { api, BASE_URL, mensagemDeErro } from '../../services/api'
import type { EstadoMapa, Mapa } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../ui/Feedback'
import { classeBotaoPrimario, classeBotaoSecundario, classeInput, classeLabel } from '../ui/estilos'

const LIMITE_MB = 10

export function GerenciarMapas({ salaId, souMestre, onMostrado }: { salaId: string; souMestre: boolean; onMostrado: () => void }) {
  if (!souMestre) {
    return <p className="p-6 text-sm text-zinc-400">Só o mestre gerencia os mapas da mesa. O mapa ativo aparece na seção "Mesa".</p>
  }
  return <GerenciarMapasMestre salaId={salaId} onMostrado={onMostrado} />
}

function GerenciarMapasMestre({ salaId, onMostrado }: { salaId: string; onMostrado: () => void }) {
  const mapas = useRecurso<Mapa[]>(`/salas/${salaId}/mapas`)
  const ativo = useRecurso<EstadoMapa>(`/salas/${salaId}/mapa-ativo`)
  const [nome, setNome] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const entradaArquivo = useRef<HTMLInputElement>(null)
  const mostrarSpinner = useAtrasado(enviando)

  useEventoSocket<EstadoMapa>('mapa:ativo', (novo) => ativo.atualizar(() => novo))
  const idAtivo = ativo.estado.tipo === 'ok' ? ativo.estado.dados.mapa?.id : undefined

  function escolherArquivo(escolhido: File | null) {
    setErro(null)
    // Checagem antecipada só pra não fazer o usuário esperar um upload que vai ser recusado; o servidor valida de novo.
    if (escolhido && escolhido.size > LIMITE_MB * 1024 * 1024) {
      setErro(`Esse arquivo tem ${(escolhido.size / 1024 / 1024).toFixed(1)}MB — o limite para mapas é ${LIMITE_MB}MB.`)
      setArquivo(null)
      if (entradaArquivo.current) entradaArquivo.current.value = ''
      return
    }
    setArquivo(escolhido)
    if (escolhido && !nome) setNome(escolhido.name.replace(/\.[^.]+$/, ''))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!arquivo) return
    setErro(null)
    setEnviando(true)
    try {
      const formulario = new FormData()
      formulario.append('nome', nome.trim())
      formulario.append('imagem', arquivo)
      const novo = await api<Mapa>(`/salas/${salaId}/mapas`, { method: 'POST', body: formulario })
      mapas.atualizar((lista) => [novo, ...lista])
      setNome('')
      setArquivo(null)
      if (entradaArquivo.current) entradaArquivo.current.value = ''
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  async function definirAtivo(mapaId: string | null) {
    setErro(null)
    try {
      await api(`/salas/${salaId}/mapa-ativo`, { method: 'PUT', body: { mapaId } })
      if (mapaId) onMostrado()
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  async function remover(mapa: Mapa) {
    if (!window.confirm(`Remover o mapa "${mapa.nome}"? Os tokens dele também serão apagados.`)) return
    setErro(null)
    try {
      await api(`/mapas/${mapa.id}`, { method: 'DELETE' })
      mapas.atualizar((lista) => lista.filter((m) => m.id !== mapa.id))
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-lg font-semibold">Mapas da mesa</h2>
      <form onSubmit={enviar} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 p-4">
        <div className="min-w-56 flex-1">
          <label htmlFor="mapa-arquivo" className={classeLabel}>Imagem (PNG, JPG ou WebP, até {LIMITE_MB}MB)</label>
          <input id="mapa-arquivo" ref={entradaArquivo} type="file" accept="image/png,image/jpeg,image/webp" required
            onChange={(e) => escolherArquivo(e.target.files?.[0] ?? null)} disabled={enviando}
            className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-200 hover:file:bg-zinc-700" />
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="mapa-nome" className={classeLabel}>Nome</label>
          <input id="mapa-nome" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        <button type="submit" disabled={enviando || !arquivo} className={classeBotaoPrimario}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Enviando...' : 'Enviar mapa'}
        </button>
      </form>
      {erro && <div className="mt-3"><Alerta mensagem={erro} /></div>}

      <div className="mt-6">
        {mapas.estado.tipo === 'carregando' && <Carregando texto="Carregando mapas..." />}
        {mapas.estado.tipo === 'erro' && <Alerta mensagem={mapas.estado.mensagem} onTentarNovamente={mapas.recarregar} />}
        {mapas.estado.tipo === 'ok' && mapas.estado.dados.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhum mapa enviado ainda.</p>
        )}
        {mapas.estado.tipo === 'ok' && mapas.estado.dados.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Mapas enviados">
            {mapas.estado.dados.map((mapa) => (
              <li key={mapa.id} className={`overflow-hidden rounded-lg border ${mapa.id === idAtivo ? 'border-violet-500' : 'border-zinc-800'}`}>
                <img src={BASE_URL + mapa.imagemUrl} alt="" className="h-28 w-full bg-zinc-900 object-cover" />
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium">{mapa.nome}</p>
                  <div className="flex flex-wrap gap-2">
                    {mapa.id === idAtivo ? (
                      <button type="button" onClick={() => definirAtivo(null)} className={`${classeBotaoSecundario} px-2 py-1 text-xs`}>Tirar da mesa</button>
                    ) : (
                      <button type="button" onClick={() => definirAtivo(mapa.id)} className={`${classeBotaoPrimario} px-2 py-1 text-xs`}>Mostrar na mesa</button>
                    )}
                    <button type="button" onClick={() => remover(mapa)} className={`${classeBotaoSecundario} px-2 py-1 text-xs`}>Remover</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
