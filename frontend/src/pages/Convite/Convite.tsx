import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, mensagemDeErro } from '../../services/api'
import type { SalaDetalhe } from '../../services/tipos'
import { Alerta, Carregando } from '../../components/ui/Feedback'

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
    <main className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-md">
        {erro ? (
          <>
            <Alerta mensagem={erro} />
            <Link to="/salas" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300">
              Voltar para suas mesas
            </Link>
          </>
        ) : (
          <Carregando texto="Entrando na mesa..." />
        )}
      </div>
    </main>
  )
}
