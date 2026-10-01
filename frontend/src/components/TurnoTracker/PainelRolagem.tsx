import { useEffect, useState, type FormEvent } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import { Alerta } from '../ui/Feedback'
import { Folha } from '../ui/arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeCampo, classeRotulo, classeSelect } from '../ui/estilosArquivo'

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

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

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
    <div className="absolute right-0 bottom-full z-20 mb-3 w-80">
      <Folha className="p-4 sm:p-4">
        <form onSubmit={rolar} aria-label="Rolar dados" className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="rolagem-qtd" className={classeRotulo}>Qtd.</label>
              <input id="rolagem-qtd" type="number" min={1} max={20} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={classeCampo} />
            </div>
            <div>
              <label htmlFor="rolagem-dado" className={classeRotulo}>Dado</label>
              <select id="rolagem-dado" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className={classeSelect(false)}>
                {FACES.map((f) => <option key={f} value={f}>d{f}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rolagem-mod" className={classeRotulo}>Mod.</label>
              <input id="rolagem-mod" type="number" min={-100} max={100} value={modificador} onChange={(e) => setModificador(e.target.value)} className={classeCampo} />
            </div>
          </div>
          <div>
            <label htmlFor="rolagem-modo" className={classeRotulo}>Resultado</label>
            <select id="rolagem-modo" value={modo} onChange={(e) => setModo(e.target.value as typeof modo)} className={classeSelect(false)}>
              <option value="soma">Somar os dados</option>
              <option value="maior">Maior dado (teste de OP)</option>
              <option value="menor">Menor dado (atributo 0)</option>
            </select>
          </div>
          {erro && <Alerta tom="papel" mensagem={erro} />}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onFechar} className={classeBotaoContorno}>Cancelar</button>
            <button type="submit" disabled={enviando} className={classeBotaoTinta}>Rolar</button>
          </div>
        </form>
      </Folha>
    </div>
  )
}
