import { Component, type ReactNode } from 'react'
import { Folha } from './ui/arquivo'
import { classeBotaoTinta, classeTituloArquivo } from './ui/estilosArquivo'

// Última linha de defesa contra tela branca: qualquer erro de render vira uma mensagem.
export class ErrorBoundary extends Component<{ children: ReactNode }, { erro: Error | null }> {
  state = { erro: null as Error | null }

  static getDerivedStateFromError(erro: Error) {
    return { erro }
  }

  componentDidCatch(erro: Error) {
    console.error(erro)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <main className="mundo-arquivo flex items-center justify-center px-4">
        <div role="alert" className="max-w-md">
          <Folha>
            <h1 className={`text-3xl leading-none ${classeTituloArquivo}`}>Algo deu errado nesta tela</h1>
            <p className="mt-3 text-sm text-tinta-700">Recarregue a página. Se continuar, o erro já foi registrado no console.</p>
            <button type="button" onClick={() => window.location.reload()} className={`${classeBotaoTinta} mt-6`}>
              Recarregar
            </button>
          </Folha>
        </div>
      </main>
    )
  }
}
