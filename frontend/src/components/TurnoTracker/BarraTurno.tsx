import { useState } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import { Carimbo } from '../ui/arquivo'
import { useConfirmar } from '../ui/confirmacaoContext'
import { Icone } from '../ui/Icone'
import { classeBotaoArquivo, classeBotaoKraft, condensado } from '../ui/estilosArquivo'
import { ModalIniciarCombate } from './ModalIniciarCombate'
import { PainelRolagem } from './PainelRolagem'

// A metade direita da régua inferior: de quem é a vez, a fila e a rolagem.
export function BarraTurno({ salaId, usuarioId, souMestre }: { salaId: string; usuarioId: string; souMestre: boolean }) {
  const { combate, emitir } = useSalaSocket()
  const confirmar = useConfirmar()
  const [modalAberto, setModalAberto] = useState(false)
  const [rolagemAberta, setRolagemAberta] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const ativo = combate?.ordem[combate.indiceAtivo]
  const minhaVez = !!ativo && ativo.usuarioId === usuarioId
  const podeEncerrar = !!ativo && (souMestre || minhaVez)
  const proximos = combate ? [...combate.ordem.slice(combate.indiceAtivo + 1), ...combate.ordem.slice(0, combate.indiceAtivo)] : []

  async function acao(evento: string, dados?: unknown) {
    setErro(null)
    setEnviando(true)
    try {
      await emitir(evento, dados)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  async function finalizar() {
    const ok = await confirmar({
      titulo: 'Encerrar o combate?',
      mensagem: 'A ordem de iniciativa é descartada para toda a mesa.',
      confirmar: 'Encerrar combate',
    })
    if (ok) acao('turno:finalizar')
  }

  return (
    <section aria-label="Turno" className="flex min-w-0 flex-1 items-center justify-end gap-3">
      {combate && ativo ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="textura-fibra flex min-w-0 shrink-0 items-center gap-3 rounded-[2px] bg-papel-50 px-3 py-1.5 text-tinta-900 shadow-[0_1px_2px_rgb(0_0_0/0.25)]">
              <p className="min-w-0 max-w-44" aria-live="polite">
                <span className={`block text-xs font-bold tracking-[0.12em] text-tinta-700 uppercase ${condensado}`}>Rodada {combate.rodada} · vez de</span>
                <span className={`block truncate text-lg leading-tight font-extrabold ${condensado}`}>{ativo.nome}</span>
                <span className="block font-datilo text-xs text-tinta-700">iniciativa {ativo.iniciativa}</span>
              </p>
              {minhaVez && <Carimbo>Sua vez</Carimbo>}
            </div>
            {proximos.length > 0 && (
              <ol aria-label="Próximos" className="flex min-w-0 flex-1 gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                {proximos.map((p) => (
                  <li key={p.id} className="shrink-0 rounded-[2px] border border-kraft-700 px-2 py-1 text-xs text-grafite-100">
                    {p.nome} <span className="font-datilo text-grafite-300">{p.iniciativa}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <button type="button" disabled={!podeEncerrar || enviando} className={classeBotaoKraft}
            title={podeEncerrar ? undefined : 'Só quem está na vez ou o mestre encerram o turno'}
            onClick={() => acao('turno:encerrar', { indiceAtivo: combate.indiceAtivo, rodada: combate.rodada })}>
            Encerrar turno
          </button>
          {souMestre && (
            <button type="button" onClick={finalizar} disabled={enviando} className={classeBotaoArquivo}>
              Finalizar
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-grafite-300">Nenhum combate em andamento</p>
          {souMestre && (
            <button type="button" onClick={() => setModalAberto(true)} className={classeBotaoArquivo}>
              Iniciar combate
            </button>
          )}
        </>
      )}
      {erro && <p role="alert" className="max-w-56 text-xs text-carimbo-300">{erro}</p>}
      <div className="relative">
        <button type="button" onClick={() => setRolagemAberta((a) => !a)} aria-expanded={rolagemAberta} className={classeBotaoArquivo}>
          <Icone nome="dados" className="h-4 w-4" /> Rolagem
        </button>
        {rolagemAberta && <PainelRolagem onFechar={() => setRolagemAberta(false)} />}
      </div>
      <ModalIniciarCombate salaId={salaId} aberto={modalAberto} onFechar={() => setModalAberto(false)} />
    </section>
  )
}
