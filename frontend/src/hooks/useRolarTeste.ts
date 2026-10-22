import { useState } from 'react'
import { mensagemDeErro } from '../services/api'
import type { AtributoOP1, Rolagem } from '../services/tipos'
import { useSalaSocket } from './useSocket'

export type AlvoTeste = { tipo: 'pericia'; nome: string } | { tipo: 'atributo'; nome: AtributoOP1 }

// Rolar da ficha: o cliente diz só QUAL teste — o servidor monta os dados e o bônus a partir da
// ficha no banco e manda o resultado pra mesa inteira (chat). `ultima` é o bilhete que a ficha mostra,
// porque o chat pode estar escondido atrás dela.
export function useRolarTeste(fichaId: string) {
  const { emitir, avisarRolagem } = useSalaSocket()
  const [rolando, setRolando] = useState<string | null>(null)
  const [ultima, setUltima] = useState<Rolagem | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function rolarTeste(alvo: AlvoTeste) {
    setErro(null)
    setRolando(`${alvo.tipo}:${alvo.nome}`)
    try {
      const { rolagem } = await emitir<{ rolagem: Rolagem }>('rolagem:teste', { fichaId, ...alvo, avisar: avisarRolagem })
      setUltima(rolagem)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setRolando(null)
    }
  }

  return { rolarTeste, rolando, ultima, erro, dispensar: () => { setUltima(null); setErro(null) } }
}
