import { useState, type FormEvent } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import { classeBotaoPrimario, classeInput } from '../ui/estilos'

const FACES = [4, 6, 8, 10, 12, 20, 100]

// Quem rola é o servidor; aqui só se monta o pedido. O resultado chega pra sala toda (chat).
export function PainelRolagem({ onFechar }: { onFechar: () => void }) {
  const { emitir } = useSalaSocket()
  const [quantidade, setQuantidade] = useState('1')
  const [faces, setFaces] = useState(20)
  const [modificador, setModificador] = useState('0')
  const [modo, setModo] = useState<'soma' | 'maior' | 'menor'>('soma')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function rolar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await emitir('rolagem:rolar', { quantidade: Number(quantidade), faces, modificador: Number(modificador), modo })
      onFechar()
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={rolar} aria-label="Rolar dados"
      className="absolute right-0 bottom-full z-20 mb-2 w-72 space-y-3 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs text-zinc-400">Qtd.
          <input type="number" min={1} max={20} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={`${classeInput} mt-1 px-2 py-1`} />
        </label>
        <label className="text-xs text-zinc-400">Dado
          <select value={faces} onChange={(e) => setFaces(Number(e.target.value))} className={`${classeInput} mt-1 px-2 py-1`}>
            {FACES.map((f) => <option key={f} value={f}>d{f}</option>)}
          </select>
        </label>
        <label className="text-xs text-zinc-400">Mod.
          <input type="number" min={-100} max={100} value={modificador} onChange={(e) => setModificador(e.target.value)} className={`${classeInput} mt-1 px-2 py-1`} />
        </label>
      </div>
      <label className="block text-xs text-zinc-400">Resultado
        <select value={modo} onChange={(e) => setModo(e.target.value as typeof modo)} className={`${classeInput} mt-1 px-2 py-1`}>
          <option value="soma">Somar os dados</option>
          <option value="maior">Maior dado (teste de OP)</option>
          <option value="menor">Menor dado (atributo 0)</option>
        </select>
      </label>
      {erro && <p role="alert" className="text-xs text-red-300">{erro}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onFechar} className="px-2 text-sm text-zinc-400 hover:text-zinc-200">Cancelar</button>
        <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>Rolar</button>
      </div>
    </form>
  )
}
