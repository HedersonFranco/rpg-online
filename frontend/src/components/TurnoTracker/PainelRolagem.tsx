import { useEffect, useState, type FormEvent } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import { Alerta } from '../ui/Feedback'
import { Folha } from '../ui/arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeCampo, classeRotulo, classeSelect, condensado } from '../ui/estilosArquivo'

const FACES = [4, 6, 8, 10, 12, 20, 100]

// Quem rola é o servidor; aqui só se monta o pedido. O resultado chega pra sala toda (chat) — o do mestre,
// só aos mestres; com o aviso ligado, os jogadores veem uma frase sem o resultado.
export function PainelRolagem({ souMestre, onFechar }: { souMestre: boolean; onFechar: () => void }) {
  const { emitir, avisarRolagem, setAvisarRolagem } = useSalaSocket()
  const [quantidade, setQuantidade] = useState('1')
  const [faces, setFaces] = useState(20)
  const [modificador, setModificador] = useState('0')
  const [modo, setModo] = useState<'soma' | 'maior' | 'menor'>('soma')
  // "Expressão": dano de arma/ritual com dados diferentes numa rolagem só ("2d6+1d8+3").
  const [tipo, setTipo] = useState<'dados' | 'expressao'>('dados')
  const [expressao, setExpressao] = useState('')
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
      await emitir('rolagem:rolar', tipo === 'expressao'
        ? { expressao, avisar: avisarRolagem }
        : { quantidade: Number(quantidade), faces, modificador: Number(modificador), modo, avisar: avisarRolagem })
      onFechar()
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="absolute right-0 bottom-full z-40 mb-3 w-80">
      <Folha className="p-4 sm:p-4">
        <form onSubmit={rolar} aria-label="Rolar dados" className="space-y-4">
          <div role="group" aria-label="Tipo de rolagem" className="flex overflow-hidden rounded-sm border-2 border-tinta-900">
            {([['dados', 'Dados'], ['expressao', 'Expressão']] as const).map(([valor, rotulo]) => (
              <button key={valor} type="button" aria-pressed={tipo === valor} onClick={() => setTipo(valor)}
                className={`min-h-9 flex-1 px-2.5 text-xs font-bold tracking-[0.08em] uppercase ${condensado} focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-papel-50 ${tipo === valor ? 'bg-tinta-900 text-papel-50' : 'text-tinta-900 hover:bg-tinta-900/10'}`}>
                {rotulo}
              </button>
            ))}
          </div>
          {tipo === 'expressao' ? (
            <div>
              <label htmlFor="rolagem-expressao" className={classeRotulo}>Expressão</label>
              <input id="rolagem-expressao" value={expressao} onChange={(e) => setExpressao(e.target.value)} maxLength={60} required
                autoComplete="off" spellCheck={false} placeholder="2d6+1d8+3" className={classeCampo} aria-describedby="rolagem-expressao-dica" />
              <p id="rolagem-expressao-dica" className="mt-1.5 text-xs text-tinta-700">Some ou subtraia dados e números: d4, d6, d8, d10, d12, d20, d100. Sempre soma tudo.</p>
            </div>
          ) : (
            <>
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
            </>
          )}
          {souMestre && (
            <label className="flex items-start gap-2 text-sm text-tinta-900">
              <input type="checkbox" checked={avisarRolagem} onChange={(e) => setAvisarRolagem(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-tinta-900" aria-describedby="rolagem-aviso-dica" />
              <span>
                Avisar os jogadores quando eu rolar
                <span id="rolagem-aviso-dica" className="mt-0.5 block text-xs text-tinta-700">
                  Suas rolagens são secretas. Ligado, a mesa vê uma frase como "O mestre rolou dados.", sem o resultado.
                </span>
              </span>
            </label>
          )}
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
