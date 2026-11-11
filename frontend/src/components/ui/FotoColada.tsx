import { useRef, useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, BASE_URL, mensagemDeErro } from '../../services/api'
import { useConfirmar } from './confirmacaoContext'
import { Spinner } from './Feedback'
import { Icone } from './Icone'
import { condensado } from './estilosArquivo'

const LIMITE_MB = 2

// Foto colada na ficha/NPC (avatar, até 2MB). Quem pode editar clica na foto para trocar e no × para tirar.
// `caminho` é a rota do avatar (/fichas/:id/avatar ou /npcs/:id/avatar); `onSalvo` recebe o que ela devolve.
export function FotoColada<T>({ nome, url, caminho, podeEditar, onSalvo, onErro, className }: {
  nome: string
  url: string | null
  caminho: string
  podeEditar: boolean
  onSalvo: (resposta: T) => void
  onErro: (mensagem: string | null) => void
  className: string // tamanho e fonte da inicial, ex.: "h-16 w-14 text-2xl"
}) {
  const confirmar = useConfirmar()
  const entrada = useRef<HTMLInputElement>(null)
  const [pendente, setPendente] = useState(false)
  const mostrarSpinner = useAtrasado(pendente)

  async function executar(pedido: () => Promise<T>) {
    onErro(null)
    setPendente(true)
    try {
      onSalvo(await pedido())
    } catch (e) {
      onErro(mensagemDeErro(e))
    } finally {
      setPendente(false)
    }
  }

  function escolher(arquivo: File | undefined) {
    if (entrada.current) entrada.current.value = '' // escolher o mesmo arquivo de novo ainda dispara
    if (!arquivo) return
    // Só pra não esperar um envio que vai ser recusado; o servidor confere tamanho e tipo de novo.
    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      onErro(`Essa imagem tem ${(arquivo.size / 1024 / 1024).toFixed(1)}MB — o limite para a foto é ${LIMITE_MB}MB.`)
      return
    }
    const formulario = new FormData()
    formulario.append('imagem', arquivo)
    void executar(() => api<T>(caminho, { method: 'PUT', body: formulario }))
  }

  async function tirar() {
    const ok = await confirmar({
      titulo: 'Tirar a foto?',
      mensagem: `A foto de "${nome}" sai daqui e do token no mapa. Para voltar, envie a imagem de novo.`,
      confirmar: 'Tirar foto',
    })
    if (ok) await executar(() => api<T>(caminho, { method: 'DELETE' }))
  }

  const moldura = `flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] border-[3px] border-papel-50 bg-arquivo-800 shadow-[0_2px_4px_rgb(0_0_0/0.3)] ${className}`
  const foto = url
    ? <img src={BASE_URL + url} alt="" className="h-full w-full object-cover" />
    : <span aria-hidden="true" className={`font-extrabold text-grafite-300 ${condensado}`}>{nome.charAt(0).toUpperCase()}</span>

  if (!podeEditar) return <div className={moldura}>{foto}</div>

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => entrada.current?.click()} disabled={pendente}
        aria-label={url ? `Trocar a foto de ${nome}` : `Enviar uma foto para ${nome}`} title={url ? 'Trocar foto' : 'Enviar foto'}
        className={`${moldura} relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 disabled:cursor-wait`}>
        {foto}
        {pendente && mostrarSpinner && (
          <span className="absolute inset-0 flex items-center justify-center bg-tinta-900/60 text-papel-50"><Spinner tamanho="sm" /></span>
        )}
        <span aria-hidden="true" className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-tl-[3px] bg-tinta-900 text-papel-50">
          <Icone nome="notas" className="h-3 w-3" />
        </span>
      </button>
      {url && (
        <button type="button" onClick={tirar} disabled={pendente} aria-label={`Tirar a foto de ${nome}`} title="Tirar foto"
          className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-papel-50 bg-tinta-900 text-papel-50 hover:bg-tinta-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tinta-900 disabled:opacity-50">
          <Icone nome="errado" className="h-3 w-3" />
        </button>
      )}
      <input ref={entrada} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => escolher(e.target.files?.[0])} />
    </div>
  )
}
