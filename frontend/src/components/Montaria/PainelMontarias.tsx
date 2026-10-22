import { useRef, useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket } from '../../hooks/useSocket'
import { api, BASE_URL, mensagemDeErro } from '../../services/api'
import type { Montaria } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../ui/Feedback'
import { Folha } from '../ui/arquivo'
import { Icone } from '../ui/Icone'
import { classeBotaoIconeArquivo, classeBotaoTinta, classeCampo, classeRotulo, classeTituloArquivo, condensado } from '../ui/estilosArquivo'
import { useConfirmar } from '../ui/confirmacaoContext'

const LIMITE_MB = 2

// Montarias da mesa (carro, cavalo, skate...): qualquer membro salva e põe no mapa, onde ficam sempre por
// baixo dos outros tokens. Apaga quem salvou ou o mestre. `centroDoMapa` = ponto livre no centro da vista.
export function PainelMontarias({ salaId, usuarioId, souMestre, centroDoMapa }: {
  salaId: string
  usuarioId: string
  souMestre: boolean
  centroDoMapa: () => { x: number; y: number } | null
}) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<Montaria[]>(`/salas/${salaId}/montarias`)
  const confirmar = useConfirmar()
  const [pendente, setPendente] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [noMapa, setNoMapa] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(pendente !== null)

  useAoResincronizar(revalidar)
  useEventoSocket<{ montaria: Montaria }>('montaria:criada', ({ montaria }) =>
    atualizar((lista) => (lista.some((m) => m.id === montaria.id) ? lista : [...lista, montaria])),
  )
  useEventoSocket<{ montariaId: string }>('montaria:removida', ({ montariaId }) =>
    atualizar((lista) => lista.filter((m) => m.id !== montariaId)),
  )

  async function executar(id: string, acao: () => Promise<void>) {
    setErro(null)
    setNoMapa(null)
    setPendente(id)
    try {
      await acao()
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setPendente(null)
    }
  }

  const porNoMapa = (montaria: Montaria) =>
    executar(montaria.id, async () => {
      // Sem a mesa à vista (o mestre na vista de mapas), nasce perto do canto do mapa.
      await api(`/montarias/${montaria.id}/token`, { method: 'POST', body: centroDoMapa() ?? { x: 40, y: 40 } })
      setNoMapa(`"${montaria.nome}" está no mapa. Arraste para levar; selecione para mudar o tamanho.`)
    })

  async function apagar(montaria: Montaria) {
    const ok = await confirmar({
      titulo: `Apagar "${montaria.nome}"?`,
      mensagem: 'A montaria sai da biblioteca da mesa, e todos os tokens dela saem dos mapas. Isso não pode ser desfeito.',
      confirmar: 'Apagar montaria',
    })
    if (!ok) return
    await executar(montaria.id, async () => {
      await api(`/montarias/${montaria.id}`, { method: 'DELETE' })
      atualizar((lista) => lista.filter((m) => m.id !== montaria.id))
    })
  }

  if (estado.tipo === 'carregando') return <Carregando texto="Carregando montarias..." />
  if (estado.tipo === 'erro') return <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />
  const montarias = estado.dados

  return (
    <div className="space-y-6">
      <h3 className={`text-2xl leading-none ${classeTituloArquivo}`}>
        Montarias <span className="font-arquivo text-base font-normal tracking-normal text-grafite-300 normal-case [font-stretch:100%]">{montarias.length}</span>
      </h3>
      <FormMontaria salaId={salaId} onSalva={(nova) => atualizar((lista) => (lista.some((m) => m.id === nova.id) ? lista : [...lista, nova]))} />

      {erro && <Alerta tom="arquivo" mensagem={erro} />}
      {noMapa && <p role="status" className="text-sm text-grafite-300">{noMapa}</p>}

      {montarias.length === 0 ? (
        <p className="text-sm text-grafite-300">Nenhuma montaria salva. Carro, cavalo, skate: salve a imagem acima e ponha no mapa.</p>
      ) : (
        <ul className="space-y-3">
          {montarias.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-sm border border-arquivo-700 bg-arquivo-900 p-2">
              <img src={BASE_URL + m.imagemUrl} alt="" className="h-14 w-14 shrink-0 rounded-[2px] bg-arquivo-800 object-contain" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-base leading-tight font-extrabold text-grafite-100 ${condensado}`}>{m.nome}</p>
                <p className="truncate text-xs text-grafite-300">por {m.usuarioId === usuarioId ? 'você' : m.usuario.nome}</p>
              </div>
              <button type="button" onClick={() => porNoMapa(m)} disabled={pendente !== null}
                className={`${classeBotaoIconeArquivo} h-9 w-auto gap-1.5 px-2.5 text-xs`}>
                {pendente === m.id && mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="mapa" className="h-4 w-4" />} Pôr no mapa
              </button>
              {(m.usuarioId === usuarioId || souMestre) && (
                <button type="button" onClick={() => apagar(m)} disabled={pendente !== null} aria-label={`Apagar montaria ${m.nome}`} title="Apagar"
                  className={`${classeBotaoIconeArquivo} h-9 w-9`}>
                  <Icone nome="lixeira" className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FormMontaria({ salaId, onSalva }: { salaId: string; onSalva: (montaria: Montaria) => void }) {
  const [nome, setNome] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const entradaArquivo = useRef<HTMLInputElement>(null)
  const mostrarSpinner = useAtrasado(enviando)

  function escolherArquivo(escolhido: File | null) {
    setErro(null)
    // Checagem antecipada só pra não esperar um upload que vai ser recusado; o servidor valida de novo.
    if (escolhido && escolhido.size > LIMITE_MB * 1024 * 1024) {
      setErro(`Essa imagem tem ${(escolhido.size / 1024 / 1024).toFixed(1)}MB — o limite para montarias é ${LIMITE_MB}MB.`)
      setArquivo(null)
      if (entradaArquivo.current) entradaArquivo.current.value = ''
      return
    }
    setArquivo(escolhido)
    if (escolhido && !nome) setNome(escolhido.name.replace(/\.[^.]+$/, '').slice(0, 60))
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!arquivo) return
    setErro(null)
    setEnviando(true)
    try {
      const formulario = new FormData()
      formulario.append('nome', nome.trim())
      formulario.append('imagem', arquivo)
      onSalva(await api<Montaria>(`/salas/${salaId}/montarias`, { method: 'POST', body: formulario }))
      setNome('')
      setArquivo(null)
      if (entradaArquivo.current) entradaArquivo.current.value = ''
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Folha>
      <form onSubmit={salvar} className="space-y-3">
        <div>
          <label htmlFor="montaria-arquivo" className={classeRotulo}>Imagem (PNG, JPG ou WebP, até {LIMITE_MB}MB)</label>
          <input id="montaria-arquivo" ref={entradaArquivo} type="file" accept="image/png,image/jpeg,image/webp" required
            onChange={(e) => escolherArquivo(e.target.files?.[0] ?? null)} disabled={enviando}
            className="block w-full text-sm text-tinta-900 file:mr-3 file:min-h-10 file:rounded-sm file:border-2 file:border-tinta-900 file:bg-transparent file:px-3 file:text-xs file:font-bold file:tracking-[0.1em] file:text-tinta-900 file:uppercase hover:file:bg-tinta-900/10 file:[font-stretch:72%]" />
          <p className="mt-1 text-xs text-tinta-700">Fundo transparente (PNG ou WebP) fica melhor embaixo do token de quem monta.</p>
        </div>
        <div>
          <label htmlFor="montaria-nome" className={classeRotulo}>Nome</label>
          <input id="montaria-nome" required maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        {erro && <Alerta tom="papel" mensagem={erro} />}
        <button type="submit" disabled={enviando || !arquivo} className={`${classeBotaoTinta} w-full`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Salvando...' : 'Salvar montaria'}
        </button>
      </form>
    </Folha>
  )
}
