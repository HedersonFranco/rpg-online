import { pedidoDeTeste, type AtributosOP1, type PedidoDeTeste, type TestePericia } from './calculoFicha.js'
import { escreverExpressao, lerExpressao, type ExpressaoLida } from './rolagem.js'

// Arma da ficha — livro v1.3, p. 54–55 e Cap. 4 ("Dano", "Acertos Críticos"), calculada só no servidor:
// - ataque = teste de Luta (corpo a corpo) ou de Pontaria (arremesso, disparo, fogo) da própria ficha + bônus da arma;
// - dano = dados da arma + dano extra + Força, que só soma em corpo a corpo e arremesso;
// - crítico multiplica só os dados do `dano`: bônus fixos, a Força e o dano extra não (1d8+3 ×2 = 2d8+3).
// Margem, multiplicador e bônus são os efetivos — poder ou modificação, o jogador ajusta na arma.
export const TIPOS_ARMA = ['CORPO_A_CORPO', 'ARREMESSO', 'DISPARO', 'FOGO'] as const
export type TipoArma = (typeof TIPOS_ARMA)[number]

export type DadosArma = {
  tipoArma: TipoArma
  dano: string
  danoExtra: string | null
  bonusAtaque: number
  margemAmeaca: number
  multiplicadorCritico: number
}

export type ArmaCalculada = {
  pericia: 'Luta' | 'Pontaria'
  ataque: PedidoDeTeste
  dano: string
  danoCritico: string
  critico: string // "19/x3"; margem 20 não aparece: "x2"
}

const juntar = (partes: ExpressaoLida[], forca: number): ExpressaoLida => ({
  grupos: partes.flatMap((p) => p.grupos),
  modificador: partes.reduce((soma, p) => soma + p.modificador, forca),
})

export function calcularArma(arma: DadosArma, atributos: AtributosOP1, testes: TestePericia[]): ArmaCalculada {
  const pericia = arma.tipoArma === 'CORPO_A_CORPO' ? 'Luta' : 'Pontaria'
  const teste = pedidoDeTeste(atributos, testes, { tipo: 'pericia', nome: pericia })!
  const forca = arma.tipoArma === 'CORPO_A_CORPO' || arma.tipoArma === 'ARREMESSO' ? atributos.for : 0
  const base = lerExpressao(arma.dano)
  const extra = arma.danoExtra ? [lerExpressao(arma.danoExtra)] : []
  const multiplicada = { ...base, grupos: base.grupos.map((g) => ({ ...g, quantidade: g.quantidade * arma.multiplicadorCritico })) }
  return {
    pericia,
    ataque: { ...teste, modificador: teste.modificador + arma.bonusAtaque },
    dano: escreverExpressao(juntar([base, ...extra], forca)),
    danoCritico: escreverExpressao(juntar([multiplicada, ...extra], forca)),
    critico: `${arma.margemAmeaca < 20 ? `${arma.margemAmeaca}/` : ''}x${arma.multiplicadorCritico}`,
  }
}

// O d20 que valeu (o melhor; o pior quando o atributo é 0) atingiu a margem: se o ataque acertar, é crítico.
export function ameacaDeCritico(rolagem: { dados: number[]; modo: string }, margem: number) {
  const valeu = rolagem.modo === 'menor' ? Math.min(...rolagem.dados) : Math.max(...rolagem.dados)
  return valeu >= margem
}
