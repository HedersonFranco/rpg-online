import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Folha, Pasta } from '../../components/ui/arquivo'
import { classeLinkArquivo, classeTituloArquivo } from '../../components/ui/estilosArquivo'

// Login e cadastro: uma pasta aberta sobre o arquivo, com a folha de acesso por cima.
export function LayoutAuth({ titulo, subtitulo, children, rodape }: {
  titulo: string
  subtitulo: string
  children: ReactNode
  rodape: ReactNode
}) {
  return (
    <main className="mundo-arquivo flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Pasta aba="RPG Online · Ordem Paranormal">
          <div className="px-3 pt-4 pb-5 sm:px-5 sm:pt-5">
            <Folha>
              <h1 className={`text-4xl leading-none ${classeTituloArquivo}`}>{titulo}</h1>
              <p className="mt-2 mb-6 text-sm text-tinta-700">{subtitulo}</p>
              {children}
            </Folha>
            <p className="mt-4 text-center text-sm text-tinta-900">{rodape}</p>
          </div>
        </Pasta>
        <p className="mt-6 text-center">
          <Link to="/" className={`text-sm ${classeLinkArquivo}`}>Conhecer o RPG Online</Link>
        </p>
      </div>
    </main>
  )
}
