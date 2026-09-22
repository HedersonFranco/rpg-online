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

export type SalaResumo = {
  id: string
  nome: string
  sistema: Sistema
  donoId: string
  createdAt: string
}

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
}

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
