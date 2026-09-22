// Ordem Paranormal RPG II (Playtest Alpha, Ago/2026) — escala de step usada
// por atributos e perícias. "d4 < d6 < d8 < d10 < d12" e, normalmente, não
// pode passar de d12; d20 é exceção pontual dita pelo texto que a permite.
// Fonte: PDF do playtest, seção "ESCALA DOS ATRIBUTOS"/"ESCALA DAS PERÍCIAS".

export const ESCALA_DADOS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const
export type DadoOP2 = (typeof ESCALA_DADOS)[number]

const INDICE_MAXIMO_PADRAO = ESCALA_DADOS.indexOf('d12')

export function aumentarPasso(dado: DadoOP2, permiteD20 = false): DadoOP2 {
  const limite = permiteD20 ? ESCALA_DADOS.length - 1 : INDICE_MAXIMO_PADRAO
  const indice = ESCALA_DADOS.indexOf(dado)
  return ESCALA_DADOS[Math.min(indice + 1, limite)]!
}

export function diminuirPasso(dado: DadoOP2): DadoOP2 {
  const indice = ESCALA_DADOS.indexOf(dado)
  return ESCALA_DADOS[Math.max(indice - 1, 0)]!
}
