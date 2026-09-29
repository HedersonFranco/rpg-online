export type Sistema = 'ORDEM_PARANORMAL_1' | 'ORDEM_PARANORMAL_2'
export type Papel = 'MESTRE' | 'JOGADOR'
export type Classe = 'COMBATENTE' | 'ESPECIALISTA' | 'OCULTISTA'
export type NivelTreino = 'DESTREINADO' | 'TREINADO' | 'VETERANO' | 'EXPERT'

export type Usuario = { id: string; nome: string; email: string }

export type Membro = {
  id: string
  usuarioId: string
  papel: Papel
  usuario: { id: string; nome: string }
}

// Quem o dono baniu da mesa (GET /salas/:id/banidos, só o dono).
export type Banimento = { id: string; usuarioId: string; createdAt: string; usuario: { id: string; nome: string } }

export type SalaResumo = {
  id: string
  nome: string
  sistema: Sistema
  donoId: string
  createdAt: string
}

// GET /salas traz também o papel de quem pediu em cada sala.
export type SalaNaLista = SalaResumo & { papel: Papel | null }

export type SalaDetalhe = SalaResumo & {
  conviteToken: string | null
  conviteExpiraEm: string | null
  membros: Membro[]
}

export type FichaPericia = {
  id: string
  nivel: NivelTreino
  pericia: { id: string; nome: string; atributoBase: string }
}

export type Ficha = {
  id: string
  usuario_id: string
  salaId: string
  nome: string
  classe: Classe
  origem: string
  trilha: string
  nex: number
  for: number
  agi: number
  int: number
  vig: number
  pre: number
  pv_atual: number
  pv_maximo_cache: number
  pe_atual: number
  pe_maximo_cache: number
  san_atual: number
  san_maximo_cache: number
  inventario: string | null
  avatarUrl: string | null
  pericias: FichaPericia[]
  // Os 28 testes de perícia, já montados pelo backend (o front só exibe).
  testesPericias: TestePericia[]
  // Habilidades de classe acumuladas até o NEX atual (calculadas no backend, na ordem do livro).
  habilidadesDesbloqueadas: string[]
  entradas: EntradaFicha[]
  createdAt: string
}

export type AtributoOP1 = 'for' | 'agi' | 'int' | 'vig' | 'pre'

// Teste = `dados`d20 (fica com o melhor; `modo: 'menor'` = atributo 0, fica com o pior) + `bonus`.
export type TestePericia = {
  nome: string
  atributoBase: AtributoOP1
  nivel: NivelTreino
  dados: number
  bonus: number
  modo: 'maior' | 'menor'
}

export type TipoEntrada = 'RITUAL' | 'HABILIDADE' | 'PODER' | 'EQUIPAMENTO'
export type ElementoRitual = 'SANGUE' | 'MORTE' | 'CONHECIMENTO' | 'ENERGIA' | 'MEDO' | 'VARIA'

export type EntradaFicha = {
  id: string
  tipo: TipoEntrada
  nome: string
  descricao: string
  circulo: number | null
  elemento: ElementoRitual | null
  preRequisito: string | null
  categoria: number | null
  espacos: number | null
}

export type Mensagem = {
  id: string
  conteudo: string
  createdAt: string
  usuario: { id: string; nome: string }
}

export type Rolagem = {
  id: string
  autor: { id: string; nome: string }
  expressao: string
  dados: number[]
  total: number
  modo: 'soma' | 'maior' | 'menor'
  criadoEm: string
}

export type Participante = {
  id: string
  nome: string
  iniciativa: number
  tipo: 'FICHA' | 'NPC'
  refId: string
  usuarioId: string | null
}

export type Combate = {
  id: string
  rodada: number
  indiceAtivo: number
  ordem: Participante[]
}

export type Npc = { id: string; nome: string }

// Bloco de estatística fixo (não passa pelo motor de cálculo). pv/pe/san são de OP1; pv/pd de OP2.
export type NpcDetalhe = Npc & {
  pv: number | null
  pe: number | null
  san: number | null
  pd: number | null
  atributos: string | null
  avatarUrl: string | null
}

export type Mapa = { id: string; nome: string; imagemUrl: string; salaId: string }

// Dados que o backend libera pro token: da ficha, nome e PV; do NPC, só nome/avatar.
export type Token = {
  id: string
  mapaId: string
  x: number
  y: number
  nome: string | null
  fichaId: string | null
  npcId: string | null
  ficha: { id: string; nome: string; usuario_id: string; avatarUrl: string | null; pv_atual: number; pv_maximo_cache: number } | null
  npc: { id: string; nome: string; avatarUrl: string | null } | null
}

export type EstadoMapa = { mapa: Mapa | null; tokens: Token[] }

export type ParticipanteVideo = { usuarioId: string; nome: string; peerId: string; temCamera: boolean }

export const NOME_SISTEMA: Record<Sistema, string> = {
  ORDEM_PARANORMAL_1: 'Ordem Paranormal RPG',
  ORDEM_PARANORMAL_2: 'Ordem Paranormal RPG II (playtest)',
}

export const NOME_CLASSE: Record<Classe, string> = {
  COMBATENTE: 'Combatente',
  ESPECIALISTA: 'Especialista',
  OCULTISTA: 'Ocultista',
}

export const NOME_NIVEL_TREINO: Record<NivelTreino, string> = {
  DESTREINADO: 'Destreinado',
  TREINADO: 'Treinado',
  VETERANO: 'Veterano',
  EXPERT: 'Expert',
}

// Os 20 degraus de NEX do livro — a UI só oferece esses valores; o cálculo é do backend.
export const NEX_TIERS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99]

export const NOME_ELEMENTO: Record<ElementoRitual, string> = {
  SANGUE: 'Sangue',
  MORTE: 'Morte',
  CONHECIMENTO: 'Conhecimento',
  ENERGIA: 'Energia',
  MEDO: 'Medo',
  VARIA: 'Varia',
}

export const BONUS_NIVEL_TREINO: Record<NivelTreino, string> = {
  DESTREINADO: '+0',
  TREINADO: '+5',
  VETERANO: '+10',
  EXPERT: '+15',
}

// Categoria de equipamento no livro: 0, I, II, III, IV.
export const CATEGORIAS_EQUIPAMENTO = ['0', 'I', 'II', 'III', 'IV'] as const
