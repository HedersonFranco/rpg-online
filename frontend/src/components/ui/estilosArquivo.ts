// Classes do mundo "Dossiê de caso". Mapa e chat da mesa ainda usam estilos.ts (legado).

export const condensado = '[font-stretch:72%]'

// Campo de formulário numa folha de papel: a linha de preenchimento. O valor digitado sai datilografado.
const baseCampo =
  'w-full rounded-none border-0 border-b-2 border-tinta-600 bg-papel-50/70 px-2 py-2 text-tinta-900 caret-tinta-900 ' +
  'focus:border-tinta-900 focus:bg-papel-50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 ' +
  'disabled:opacity-60'

export const classeCampo = `${baseCampo} font-datilo text-base placeholder:font-arquivo placeholder:text-sm placeholder:text-tinta-600`

// Select com a seta desenhada (index.css .seta-select). Sem escolha, o texto é instrução (Archivo), não valor datilografado.
export function classeSelect(vazio: boolean) {
  return `${baseCampo} seta-select appearance-none ${vazio ? 'font-arquivo text-sm text-tinta-600' : 'font-datilo text-base'}`
}

export const classeRotulo = `mb-1 block text-xs font-bold tracking-[0.12em] text-tinta-700 uppercase ${condensado}`

const baseBotao =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-bold tracking-[0.1em] uppercase ${condensado} ` +
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

// Ação principal numa folha: tinta chapada.
export const classeBotaoTinta = `${baseBotao} bg-tinta-900 text-papel-50 hover:bg-tinta-700 focus-visible:outline-tinta-900`

// Ação secundária numa folha: contorno de tinta.
export const classeBotaoContorno =
  `${baseBotao} border-2 border-tinta-900 text-tinta-900 hover:bg-tinta-900/10 focus-visible:outline-tinta-900`

// Ação sobre o arquivo escuro (ex.: Sair).
export const classeBotaoArquivo =
  `${baseBotao} min-h-10 border border-arquivo-600 px-3 text-grafite-100 hover:border-kraft-500 hover:text-kraft-300 focus-visible:outline-kraft-400`

export const classeLinkArquivo =
  'font-semibold text-kraft-300 underline decoration-kraft-600 underline-offset-4 hover:text-kraft-400 hover:decoration-kraft-400 ' +
  'focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-400'

export const classeLinkPapel =
  'font-bold text-tinta-900 underline decoration-tinta-600 decoration-2 underline-offset-4 hover:decoration-tinta-900 ' +
  'focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900'

export const classeTituloArquivo = `font-extrabold tracking-[-0.01em] uppercase ${condensado}`

// Ação principal sobre o arquivo escuro (ex.: Encerrar turno): kraft chapado, texto em tinta.
export const classeBotaoKraft =
  `${baseBotao} min-h-10 bg-kraft-400 px-4 text-tinta-900 hover:bg-kraft-300 focus-visible:outline-kraft-300`

// Botão só de ícone sobre o arquivo escuro. Sempre com aria-label.
export const classeBotaoIconeArquivo =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-arquivo-600 text-grafite-100 ' +
  'hover:border-kraft-500 hover:text-kraft-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-400 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-kraft-500 aria-pressed:text-kraft-300'

// Aba de pasta suspensa numa lista de abas sobre o arquivo (painel lateral, alternador Mesa/Mapas).
export function classeAbaPasta(ativa: boolean) {
  return `h-9 rounded-t-[5px] px-4 text-xs font-bold tracking-[0.12em] uppercase ${condensado} ` +
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-kraft-300 ' +
    (ativa ? 'textura-fibra bg-kraft-500 text-tinta-900' : 'text-grafite-300 hover:bg-arquivo-800 hover:text-grafite-100')
}

// Divisória de fichário numa folha (seções da ficha): todas à vista, a ativa em tinta chapada.
export function classeAbaFolha(ativa: boolean) {
  return `h-9 rounded-[2px] px-1 text-xs font-bold tracking-[0.08em] uppercase ${condensado} ` +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 ' +
    (ativa ? 'bg-tinta-900 text-papel-50' : 'bg-papel-200 text-tinta-700 hover:bg-papel-300 hover:text-tinta-900')
}

// Botão só de ícone numa folha de papel. Sempre com aria-label.
export const classeBotaoIconeFolha =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-tinta-900 text-tinta-900 ' +
  'hover:bg-tinta-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 ' +
  'disabled:cursor-not-allowed disabled:opacity-35'
