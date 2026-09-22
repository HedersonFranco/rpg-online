import { Component, type ReactNode } from 'react'

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
      <main className="flex min-h-full items-center justify-center px-4">
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-zinc-100">Algo deu errado nesta tela.</h1>
          <p className="mt-2 text-sm text-zinc-400">Recarregue a página. Se continuar, o erro já foi registrado no console.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Recarregar
          </button>
        </div>
      </main>
    )
  }
}
