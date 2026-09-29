import type { AtributoOP1 } from '../../services/tipos'

// Disposição da ficha oficial: AGI no topo e, em sentido horário, INT, VIG, PRE, FOR, em volta do
// disco "ATRIBUTOS". Só a disposição vem da ficha; o traço é desenho próprio, em tinta sobre papel.
const ORDEM: { chave: AtributoOP1; sigla: string; nome: string }[] = [
  { chave: 'agi', sigla: 'AGI', nome: 'Agilidade' },
  { chave: 'int', sigla: 'INT', nome: 'Intelecto' },
  { chave: 'vig', sigla: 'VIG', nome: 'Vigor' },
  { chave: 'pre', sigla: 'PRE', nome: 'Presença' },
  { chave: 'for', sigla: 'FOR', nome: 'Força' },
]

const CX = 150
const CY = 150
const RAIO_VERTICES = 100 // centro de cada círculo de atributo
const RAIO_ATRIBUTO = 40
const RAIO_DISCO = 54
const CONDENSADO = { fontFamily: 'Archivo, sans-serif', fontStretch: '72%' } as const

function ponto(anguloGraus: number, raio: number) {
  const a = (anguloGraus * Math.PI) / 180
  return [CX + raio * Math.cos(a), CY + raio * Math.sin(a)] as const
}

const anguloDe = (i: number) => -90 + i * 72

// Marcas de régua no anel externo, como uma escala impressa.
const MARCAS = Array.from({ length: 60 }, (_, k) => {
  const angulo = k * 6
  const [x1, y1] = ponto(angulo, RAIO_VERTICES + 44)
  const [x2, y2] = ponto(angulo, RAIO_VERTICES + (k % 5 === 0 ? 36 : 40))
  return { x1, y1, x2, y2, forte: k % 5 === 0 }
})

// Hastes que ligam o disco a cada atributo.
const HASTES = ORDEM.map((_, i) => {
  const [x1, y1] = ponto(anguloDe(i), RAIO_DISCO)
  const [x2, y2] = ponto(anguloDe(i), RAIO_VERTICES - RAIO_ATRIBUTO)
  return { x1, y1, x2, y2 }
})

// Os valores vêm do backend; o componente só desenha.
export function PentagonoAtributos({ atributos }: { atributos: Record<AtributoOP1, number> }) {
  const descricao = ORDEM.map(({ chave, nome }) => `${nome} ${atributos[chave]}`).join(', ')
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={`Atributos: ${descricao}`} className="mx-auto block w-full max-w-[300px]">
      <g fill="none" className="stroke-tinta-900">
        <circle cx={CX} cy={CY} r={RAIO_VERTICES + 44} strokeWidth={1.5} opacity={0.5} />
        {MARCAS.map((m, k) => (
          <line key={k} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} strokeWidth={m.forte ? 1.5 : 1} opacity={m.forte ? 0.6 : 0.35} />
        ))}
        <circle cx={CX} cy={CY} r={RAIO_VERTICES} strokeWidth={2} opacity={0.8} />
        {HASTES.map((h, i) => (
          <line key={i} x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} strokeWidth={2} opacity={0.8} />
        ))}
      </g>

      <circle cx={CX} cy={CY} r={RAIO_DISCO} className="fill-papel-50 stroke-tinta-900" strokeWidth={2.5} />
      <circle cx={CX} cy={CY} r={RAIO_DISCO - 5} fill="none" className="stroke-tinta-600" strokeWidth={1} />
      <text x={CX} y={CY + 5} textAnchor="middle" className="fill-tinta-900"
        style={{ ...CONDENSADO, fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }}>
        ATRIBUTOS
      </text>

      {ORDEM.map(({ chave, sigla }, i) => {
        const [x, y] = ponto(anguloDe(i), RAIO_VERTICES)
        return (
          <g key={chave}>
            <circle cx={x} cy={y} r={RAIO_ATRIBUTO} className="fill-papel-50 stroke-tinta-900" strokeWidth={2.5} />
            <circle cx={x} cy={y} r={RAIO_ATRIBUTO - 5} fill="none" className="stroke-tinta-600" strokeWidth={1} />
            <text x={x} y={y + 8} textAnchor="middle" className="fill-tinta-900"
              style={{ ...CONDENSADO, fontSize: 30, fontWeight: 800 }}>
              {atributos[chave]}
            </text>
            <text x={x} y={y + 25} textAnchor="middle" className="fill-tinta-700"
              style={{ ...CONDENSADO, fontSize: 13, fontWeight: 700, letterSpacing: 1.5 }}>
              {sigla}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
