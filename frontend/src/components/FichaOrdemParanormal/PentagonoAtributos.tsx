import type { AtributoOP1 } from '../../services/tipos'

// Disposição da ficha oficial (Ficha de Agente, Jambô): AGI no topo e, em
// sentido horário, INT, VIG, PRE, FOR — círculos em volta do disco "ATRIBUTOS".
// A estrutura segue a ficha; o traço (glifos, anéis) é desenho próprio, não a arte oficial.
const ORDEM: { chave: AtributoOP1; sigla: string; nome: string }[] = [
  { chave: 'agi', sigla: 'AGI', nome: 'AGILIDADE' },
  { chave: 'int', sigla: 'INT', nome: 'INTELECTO' },
  { chave: 'vig', sigla: 'VIG', nome: 'VIGOR' },
  { chave: 'pre', sigla: 'PRE', nome: 'PRESENÇA' },
  { chave: 'for', sigla: 'FOR', nome: 'FORÇA' },
]

const CX = 150
const CY = 156
const RAIO_VERTICES = 100 // centro de cada círculo de atributo
const RAIO_ATRIBUTO = 38
const RAIO_DISCO = 60
const FONTE_TITULO = 'Georgia, "Times New Roman", serif'

function ponto(anguloGraus: number, raio: number, cx = CX, cy = CY) {
  const a = (anguloGraus * Math.PI) / 180
  return [cx + raio * Math.cos(a), cy + raio * Math.sin(a)] as const
}

const anguloDe = (i: number) => -90 + i * 72

// Glifos "rúnicos" originais (caixa ~6×8, centrados na origem).
const GLIFOS = [
  'M0 -4V4M-2.5 -1.5L2.5 -3.5',
  'M-2.5 -4L0 0L2.5 -4M0 0V4',
  'M-2 -4V4M-2 0H2.5M2.5 -3V3',
  'M-2.5 4L0 -4L2.5 4M-1.3 1H1.3',
  'M0 -4V4M-2.5 -4H2.5M-2.5 4L2.5 1',
  'M-2.5 -3A2.5 2.5 0 0 1 2.5 -3M0 -3V4',
  'M-2.5 -4L2.5 4M2.5 -4L-2.5 4',
  'M-2 -4V1A2 2 0 0 0 2 1V-4',
]

// Arco de glifos no lado de fora de cada círculo (o lado que não encosta no disco central).
function arcoDeGlifos(i: number) {
  const [x, y] = ponto(anguloDe(i), RAIO_VERTICES)
  const raio = RAIO_ATRIBUTO + 9
  return Array.from({ length: 17 }, (_, k) => {
    const angulo = anguloDe(i) - 96 + k * 12
    const [gx, gy] = ponto(angulo, raio, x, y)
    return { gx, gy, rotacao: angulo + 90, d: GLIFOS[(i * 5 + k * 3) % GLIFOS.length] }
  })
}

// Espinhos saindo do disco entre os círculos (lembram a trama da ficha oficial).
const ESPINHOS = ORDEM.map((_, i) => {
  const angulo = anguloDe(i) + 36
  const [x1, y1] = ponto(angulo, RAIO_DISCO - 4)
  const [x2, y2] = ponto(angulo, RAIO_VERTICES + 8)
  return { x1, y1, x2, y2 }
})

// Os valores vêm do backend; o componente só desenha.
export function PentagonoAtributos({ atributos }: { atributos: Record<AtributoOP1, number> }) {
  const descricao = ORDEM.map(({ chave, nome }) => `${nome[0]}${nome.slice(1).toLowerCase()} ${atributos[chave]}`).join(', ')
  return (
    <svg viewBox="-14 -6 328 318" role="img" aria-label={`Atributos: ${descricao}`} className="mx-auto block w-full max-w-[320px]">
      {/* Anéis que ligam os círculos, por trás de tudo */}
      <g fill="none" className="stroke-zinc-300">
        <circle cx={CX} cy={CY} r={RAIO_VERTICES - 6} strokeWidth={3} opacity={0.75} />
        <circle cx={CX} cy={CY} r={RAIO_VERTICES + 4} strokeWidth={1.5} opacity={0.5} />
        <circle cx={CX} cy={CY} r={RAIO_DISCO + 14} strokeWidth={1} opacity={0.35} />
        {ESPINHOS.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        ))}
      </g>

      {/* Disco central */}
      <circle cx={CX} cy={CY} r={RAIO_DISCO} className="fill-zinc-800 stroke-zinc-200" strokeWidth={3} />
      <circle cx={CX} cy={CY} r={RAIO_DISCO - 6} fill="none" className="stroke-zinc-500" strokeWidth={1} />
      <text x={CX} y={CY + 6} textAnchor="middle" className="fill-zinc-50"
        style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: 0.5, fontFamily: FONTE_TITULO }}>
        ATRIBUTOS
      </text>

      {ORDEM.map(({ chave, sigla, nome }, i) => {
        const [x, y] = ponto(anguloDe(i), RAIO_VERTICES)
        return (
          <g key={chave}>
            <g className="stroke-zinc-400" fill="none" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round">
              {arcoDeGlifos(i).map((g, k) => (
                <path key={k} d={g.d} transform={`translate(${g.gx} ${g.gy}) rotate(${g.rotacao})`} />
              ))}
            </g>
            <circle cx={x} cy={y} r={RAIO_ATRIBUTO} className="fill-zinc-950 stroke-zinc-100" strokeWidth={3} />
            <circle cx={x} cy={y} r={RAIO_ATRIBUTO - 5} fill="none" className="stroke-zinc-700" strokeWidth={1} />
            <text x={x} y={y - 17} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: 6.5, letterSpacing: 0.6 }}>
              {nome}
            </text>
            <text x={x} y={y + 9} textAnchor="middle" className="fill-zinc-50" style={{ fontSize: 26, fontWeight: 700 }}>
              {atributos[chave]}
            </text>
            <text x={x} y={y + 24} textAnchor="middle" className="fill-zinc-300"
              style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTE_TITULO }}>
              {sigla}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
