import { useState } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import { Icone } from '../ui/Icone'
import { classeBotaoPrimario, classeBotaoSecundario } from '../ui/estilos'
import { ModalIniciarCombate } from './ModalIniciarCombate'
import { PainelRolagem } from './PainelRolagem'

export function BarraTurno({ salaId, usuarioId, souMestre }: { salaId: string; usuarioId: string; souMestre: boolean }) {
  const { combate, aviso, limparAviso, emitir } = useSalaSocket()
  const [modalAberto, setModalAberto] = useState(false)
  const [rolagemAberta, setRolagemAberta] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const ativo = combate?.ordem[combate.indiceAtivo]
  const podeEncerrar = !!ativo && (souMestre || ativo.usuarioId === usuarioId)
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

  function finalizar() {
    if (window.confirm('Encerrar o combate? A ordem de iniciativa será descartada.')) acao('turno:finalizar')
  }

  return (
    <>
      {aviso && (
        <div role="alert" className="flex items-center justify-between gap-3 border-t border-amber-900/60 bg-amber-950/60 px-4 py-2 text-sm text-amber-200">
          <span>{aviso}</span>
          <button type="button" onClick={limparAviso} className="text-xs text-amber-300 hover:text-amber-100">Dispensar</button>
        </div>
      )}
      <section aria-label="Turno"
        className={`flex shrink-0 items-center gap-4 border-t border-zinc-800 bg-zinc-900 px-4 ${combate ? 'h-16' : 'h-11'}`}>
        {combate && ativo ? (
          <>
            <div className="min-w-0">
              <p className="text-[11px] tracking-wider text-zinc-500 uppercase">Rodada {combate.rodada} · vez de</p>
              <p className="truncate font-semibold text-violet-300" aria-live="polite">
                {ativo.nome} <span className="text-xs font-normal text-zinc-400">iniciativa {ativo.iniciativa}</span>
              </p>
            </div>
            <ol aria-label="Próximos" className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
              {proximos.map((p) => (
                <li key={p.id} className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300">
                  {p.nome} <span className="text-zinc-500">{p.iniciativa}</span>
                </li>
              ))}
            </ol>
            <button type="button" disabled={!podeEncerrar || enviando} className={`${classeBotaoPrimario} py-1.5 text-sm`}
              title={podeEncerrar ? undefined : 'Só o jogador da vez ou o mestre encerram o turno'}
              onClick={() => acao('turno:encerrar', { indiceAtivo: combate.indiceAtivo, rodada: combate.rodada })}>
              Encerrar turno
            </button>
            {souMestre && (
              <button type="button" onClick={finalizar} disabled={enviando} className={`${classeBotaoSecundario} py-1.5 text-sm`}>
                Finalizar combate
              </button>
            )}
          </>
        ) : (
          <>
            <p className="flex-1 text-sm text-zinc-500">Nenhum combate em andamento</p>
            {souMestre && (
              <button type="button" onClick={() => setModalAberto(true)} className={`${classeBotaoSecundario} py-1 text-sm`}>
                Iniciar combate
              </button>
            )}
          </>
        )}
        {erro && <p role="alert" className="max-w-56 text-xs text-red-300">{erro}</p>}
        <div className="relative">
          <button type="button" onClick={() => setRolagemAberta((a) => !a)} aria-expanded={rolagemAberta}
            className={`${classeBotaoSecundario} py-1 text-sm`}>
            <Icone nome="dados" className="h-4 w-4" /> Rolagem
          </button>
          {rolagemAberta && <PainelRolagem onFechar={() => setRolagemAberta(false)} />}
        </div>
      </section>
      {modalAberto && <ModalIniciarCombate salaId={salaId} onFechar={() => setModalAberto(false)} />}
    </>
  )
}
