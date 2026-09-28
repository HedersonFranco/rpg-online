import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import type { Ficha } from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { classeBotaoPrimario, classeInput } from '../ui/estilos'

// Inventário continua texto livre (anotações soltas); itens com categoria/espaço vão na aba Equipamentos.
export function AbaInventario({
  ficha,
  podeEditar,
  onAtualizada,
}: {
  ficha: Ficha
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
}) {
  const [texto, setTexto] = useState(ficha.inventario ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(salvando)
  const alterado = texto !== (ficha.inventario ?? '')

  if (!podeEditar) {
    return ficha.inventario?.trim()
      ? <p className="whitespace-pre-wrap break-words text-zinc-300">{ficha.inventario}</p>
      : <p className="py-4 text-center text-zinc-500">Inventário vazio.</p>
  }

  async function salvar() {
    setErro(null)
    setSalvando(true)
    try {
      const { ficha: atualizada } = await api<{ ficha: Ficha }>(`/fichas/${ficha.id}`, { method: 'PATCH', body: { inventario: texto } })
      onAtualizada(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="ficha-inventario" className="sr-only">Inventário</label>
      <textarea id="ficha-inventario" rows={8} maxLength={10000} value={texto} onChange={(e) => setTexto(e.target.value)}
        disabled={salvando} placeholder="Anotações livres: dinheiro, itens soltos, pistas..." className={`${classeInput} text-sm`} />
      {erro && <Alerta mensagem={erro} />}
      <button type="button" onClick={salvar} disabled={salvando || !alterado} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>
        {mostrarSpinner && <Spinner tamanho="sm" />}
        {salvando ? 'Salvando...' : alterado ? 'Salvar inventário' : 'Salvo'}
      </button>
    </div>
  )
}
