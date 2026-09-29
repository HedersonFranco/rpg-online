import { createContext, useContext } from 'react'

export type PedidoConfirmacao = {
  titulo: string
  mensagem: string
  // Rótulo do botão que executa (ex.: "Apagar ritual"). Ações destrutivas nomeiam o que fazem.
  confirmar: string
}

export const ConfirmacaoContext = createContext<((pedido: PedidoConfirmacao) => Promise<boolean>) | null>(null)

// Substitui window.confirm: resolve true só quando a pessoa confirma.
export function useConfirmar() {
  const confirmar = useContext(ConfirmacaoContext)
  if (!confirmar) throw new Error('useConfirmar precisa de <ConfirmacaoProvider>')
  return confirmar
}
