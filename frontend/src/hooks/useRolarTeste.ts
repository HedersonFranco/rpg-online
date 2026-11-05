import { useState } from 'react'
import { mensagemDeErro } from '../services/api'
import type { AtributoOP1, Rolagem } from '../services/tipos'
import { useSalaSocket } from './useSocket'

export type AlvoTeste =
  | { tipo: 'pericia'; nome: string }
  | { tipo: 'atributo'; nome: AtributoOP1 }
  | { tipo: 'ataque' | 'dano' | 'critico'; entradaId: string }

// Qual botão está rolando: "pericia:Luta", "ataque:<id da arma>".
export const chaveDoAlvo = (alvo: AlvoTeste) => `${alvo.tipo}:${'nome' in alvo ? alvo.nome : alvo.entradaId}`

// Rolar da ficha: o cliente diz só QUAL teste — o servidor monta os dados e o bônus a partir da
// ficha no banco e manda o resultado pra mesa inteira (chat). `ultima` é o bilhete que a ficha mostra,
// porque o chat pode estar escondido atrás dela. `entradaDaUltima`: a última rolagem foi de uma arma —
// o bilhete vai embaixo dos botões dela, não no pé da ficha (lá ele cobria o Dano logo depois do Ataque).
export function useRolarTeste(fichaId: string) {
  const { emitir, avisarRolagem } = useSalaSocket()
  const [rolando, setRolando] = useState<string | null>(null)
  const [ultima, setUltima] = useState<Rolagem | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [entradaDaUltima, setEntradaDaUltima] = useState<string | null>(null)

  async function rolarTeste(alvo: AlvoTeste) {
    setErro(null)
    setRolando(chaveDoAlvo(alvo))
    const entrada = 'entradaId' in alvo ? alvo.entradaId : null
    try {
      const { rolagem } = await emitir<{ rolagem: Rolagem }>('rolagem:teste', { fichaId, ...alvo, avisar: avisarRolagem })
      setUltima(rolagem)
      setEntradaDaUltima(entrada)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEntradaDaUltima(entrada)
    } finally {
      setRolando(null)
    }
  }

  function dispensar() {
    setUltima(null)
    setErro(null)
    setEntradaDaUltima(null)
  }

  return { rolarTeste, rolando, ultima, erro, entradaDaUltima, dispensar }
}

export type ResultadoNaArma = { entradaId: string; rolagem: Rolagem | null; erro: string | null; dispensar: () => void }
