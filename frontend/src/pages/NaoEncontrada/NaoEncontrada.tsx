import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { Carimbo, Folha, Pasta, PlacaGaveta } from '../../components/ui/arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeRotulo, classeTituloArquivo } from '../../components/ui/estilosArquivo'

// 404: endereço que não existe no app. Mostra o que foi procurado e a saída que faz sentido para quem chegou.
export default function NaoEncontrada() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { estado } = useAuth()
  const logado = estado.status === 'autenticado'
  // O react-router guarda a posição no histórico; 0 = chegou direto (link externo, endereço digitado).
  const temAnterior = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0

  return (
    <main className="mundo-arquivo flex flex-col items-center justify-center gap-6 px-4 py-10">
      <PlacaGaveta />
      <div className="w-full max-w-md">
        <Pasta aba="Arquivo · Ref. 404">
          <div className="px-3 pt-4 pb-5 sm:px-5">
            <Folha>
              <div className="mb-5 flex flex-wrap-reverse items-start justify-between gap-3">
                <h1 className={`text-3xl leading-none sm:text-4xl ${classeTituloArquivo}`}>Página não encontrada</h1>
                <Carimbo>Extraviado</Carimbo>
              </div>

              <dl className="mb-5 space-y-3 border-y-2 border-dashed border-tinta-600/40 py-4">
                <div>
                  <dt className={classeRotulo}>Endereço procurado</dt>
                  <dd className="font-datilo text-base break-all">{pathname}</dd>
                </div>
                <div>
                  <dt className={classeRotulo}>Situação</dt>
                  <dd className="font-datilo text-base">Sem registro neste arquivo</dd>
                </div>
              </dl>

              <p className="mb-6 text-sm text-tinta-700">
                O endereço pode ter sido digitado errado, ou o link que você seguiu está desatualizado.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to={logado ? '/salas' : '/'} className={classeBotaoTinta}>
                  {logado ? 'Ir para suas mesas' : 'Voltar ao início'}
                </Link>
                {temAnterior && (
                  <button type="button" onClick={() => navigate(-1)} className={classeBotaoContorno}>
                    Página anterior
                  </button>
                )}
              </div>
            </Folha>
          </div>
        </Pasta>
      </div>
    </main>
  )
}
