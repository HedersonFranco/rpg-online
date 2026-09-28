import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, mensagemDeErro } from '../../services/api'
import type { SalaDetalhe } from '../../services/tipos'
import { Alerta, Carregando } from '../../components/ui/Feedback'
import { Carimbo, Folha, Pasta } from '../../components/ui/arquivo'
import { classeLinkPapel, classeTituloArquivo } from '../../components/ui/estilosArquivo'

// /convite/:token — o link que o mestre compartilha. Entrar é idempotente no
// backend, então o duplo efeito do StrictMode em dev não cria membro duplicado.
export default function Convite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    api<{ sala: SalaDetalhe }>('/salas/entrar', { method: 'POST', body: { token } })
      .then(({ sala }) => {
        if (!cancelado) navigate(`/salas/${sala.id}`, { replace: true })
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(mensagemDeErro(e))
      })
    return () => {
      cancelado = true
    }
  }, [token, navigate])

  return (
    <main className="mundo-arquivo flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {erro ? (
          <Pasta aba="Convite">
            <div className="px-3 pt-4 pb-5 sm:px-5">
              <Folha>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h1 className={`text-3xl leading-none ${classeTituloArquivo}`}>Não deu para entrar</h1>
                  <Carimbo>Sem acesso</Carimbo>
                </div>
                <Alerta tom="papel" mensagem={erro} />
                <p className="mt-3 text-sm text-tinta-700">
                  Convites valem 7 dias. Se o link expirou ou foi trocado, peça um novo ao mestre da mesa.
                </p>
                <Link to="/salas" className={`mt-5 inline-block text-sm ${classeLinkPapel}`}>
                  Voltar para suas mesas
                </Link>
              </Folha>
            </div>
          </Pasta>
        ) : (
          <Carregando texto="Entrando na mesa..." />
        )}
      </div>
    </main>
  )
}
