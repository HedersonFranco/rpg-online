import { useRef, useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { useEventoSocket } from '../../hooks/useSocket'
import { api, BASE_URL, mensagemDeErro } from '../../services/api'
import type { EstadoMapa, Mapa } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../ui/Feedback'
import { Carimbo, Folha } from '../ui/arquivo'
import { classeBotaoArquivo, classeBotaoKraft, classeBotaoTinta, classeCampo, classeRotulo, classeTituloArquivo, condensado } from '../ui/estilosArquivo'
import { useConfirmar } from '../ui/confirmacaoContext'

const LIMITE_MB = 10

export function GerenciarMapas({ salaId, souMestre, onMostrado }: { salaId: string; souMestre: boolean; onMostrado: () => void }) {
  if (!souMestre) {
    return <p className="p-6 text-sm text-grafite-300">Só o mestre gerencia os mapas da mesa. O mapa ativo aparece na folha "Mesa".</p>
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
  const confirmar = useConfirmar()

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
    const ok = await confirmar({
      titulo: 'Remover mapa?',
      mensagem: `"${mapa.nome}" e todos os tokens dele serão apagados. Isso não pode ser desfeito.`,
      confirmar: 'Remover mapa',
    })
    if (!ok) return
    setErro(null)
    try {
      await api(`/mapas/${mapa.id}`, { method: 'DELETE' })
      mapas.atualizar((lista) => lista.filter((m) => m.id !== mapa.id))
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <h2 className={`text-5xl leading-none ${classeTituloArquivo}`}>Mapas da mesa</h2>
      <p className="mt-2 text-sm text-grafite-300">Material de preparo: só você vê esta lista. Os jogadores veem o mapa que estiver na mesa.</p>

      <Folha className="mt-8 max-w-3xl">
        <form onSubmit={enviar} className="flex flex-wrap items-end gap-4">
          <div className="min-w-80 flex-[2]">
            <label htmlFor="mapa-arquivo" className={classeRotulo}>Imagem (PNG, JPG ou WebP, até {LIMITE_MB}MB)</label>
            <input id="mapa-arquivo" ref={entradaArquivo} type="file" accept="image/png,image/jpeg,image/webp" required
              onChange={(e) => escolherArquivo(e.target.files?.[0] ?? null)} disabled={enviando}
              className={`block w-full text-sm text-tinta-900 file:mr-3 file:min-h-10 file:rounded-sm file:border-2 file:border-tinta-900 file:bg-transparent file:px-3 file:text-xs file:font-bold file:tracking-[0.1em] file:text-tinta-900 file:uppercase hover:file:bg-tinta-900/10 file:[font-stretch:72%]`} />
          </div>
          <div className="min-w-48 flex-1">
            <label htmlFor="mapa-nome" className={classeRotulo}>Nome</label>
            <input id="mapa-nome" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeCampo} />
          </div>
          <button type="submit" disabled={enviando || !arquivo} className={classeBotaoTinta}>
            {mostrarSpinner && <Spinner tamanho="sm" />}
            {enviando ? 'Enviando...' : 'Enviar mapa'}
          </button>
        </form>
        {erro && <div className="mt-4"><Alerta tom="papel" mensagem={erro} /></div>}
      </Folha>

      <div className="mt-10">
        {mapas.estado.tipo === 'carregando' && <Carregando texto="Carregando mapas..." />}
        {mapas.estado.tipo === 'erro' && <Alerta tom="arquivo" mensagem={mapas.estado.mensagem} onTentarNovamente={mapas.recarregar} />}
        {mapas.estado.tipo === 'ok' && mapas.estado.dados.length === 0 && (
          <p className="text-sm text-grafite-300">Nenhum mapa enviado ainda.</p>
        )}
        {mapas.estado.tipo === 'ok' && mapas.estado.dados.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 xl:grid-cols-3" aria-label="Mapas enviados">
            {mapas.estado.dados.map((mapa) => {
              const ativo = mapa.id === idAtivo
              return (
                <li key={mapa.id} className="relative">
                  <div className="rounded-[2px] border-[5px] border-papel-100 bg-arquivo-800 shadow-[0_14px_28px_-16px_rgb(0_0_0/0.95)]">
                    <img src={BASE_URL + mapa.imagemUrl} alt="" className="h-36 w-full object-cover" />
                  </div>
                  {ativo && (
                    <span className="absolute -top-3 -right-2">
                      <span className="inline-block rounded-[3px] bg-papel-100 p-1 shadow-[0_4px_10px_-6px_rgb(0_0_0/0.9)]"><Carimbo>Na mesa</Carimbo></span>
                    </span>
                  )}
                  <p className={`mt-3 truncate text-lg leading-tight font-extrabold text-grafite-100 ${condensado}`}>{mapa.nome}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ativo ? (
                      <button type="button" onClick={() => definirAtivo(null)} className={classeBotaoArquivo}>Tirar da mesa</button>
                    ) : (
                      <button type="button" onClick={() => definirAtivo(mapa.id)} className={classeBotaoKraft}>Mostrar na mesa</button>
                    )}
                    <button type="button" onClick={() => remover(mapa)} className={classeBotaoArquivo}>Remover</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
