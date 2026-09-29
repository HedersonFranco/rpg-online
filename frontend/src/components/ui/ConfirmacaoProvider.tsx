import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ConfirmacaoContext, type PedidoConfirmacao } from './confirmacaoContext'
import { Dialogo } from './Dialogo'
import { Folha } from './arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeTituloArquivo } from './estilosArquivo'

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const confirmar = useCallback((novo: PedidoConfirmacao) => {
    resolver.current?.(false)
    setPedido(novo)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  function responder(ok: boolean) {
    resolver.current?.(ok)
    resolver.current = null
    setPedido(null)
  }

  return (
    <ConfirmacaoContext.Provider value={confirmar}>
      {children}
      <Dialogo aberto={pedido !== null} onFechar={() => responder(false)} rotulo={pedido?.titulo ?? 'Confirmar'}>
        {pedido && (
          <Folha>
            <h2 className={`text-2xl leading-none ${classeTituloArquivo}`}>{pedido.titulo}</h2>
            <p className="mt-3 text-sm text-tinta-700">{pedido.mensagem}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {/* Foco inicial no "Cancelar": Enter por engano não apaga nada. */}
              <button type="button" autoFocus onClick={() => responder(false)} className={classeBotaoContorno}>Cancelar</button>
              <button type="button" onClick={() => responder(true)} className={classeBotaoTinta}>{pedido.confirmar}</button>
            </div>
          </Folha>
        )}
      </Dialogo>
    </ConfirmacaoContext.Provider>
  )
}
