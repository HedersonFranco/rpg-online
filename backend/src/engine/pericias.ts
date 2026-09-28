import type { AtributosOP1 } from './calculoFicha.js'

// As 28 perícias de Ordem Paranormal RPG v1.3 com o atributo-base de cada uma —
// Tabela 2.1 (Cap. 2, p. 41), extraída do PDF oficial em 23/09/2026.
// Agilidade 7, Força 2, Intelecto 9, Presença 9, Vigor 1.
// Fonte única: o seed popula a tabela Pericia a partir daqui.
export const PERICIAS_OP1: { nome: string; atributoBase: keyof AtributosOP1 }[] = [
  { nome: 'Acrobacia', atributoBase: 'agi' },
  { nome: 'Adestramento', atributoBase: 'pre' },
  { nome: 'Artes', atributoBase: 'pre' },
  { nome: 'Atletismo', atributoBase: 'for' },
  { nome: 'Atualidades', atributoBase: 'int' },
  { nome: 'Ciências', atributoBase: 'int' },
  { nome: 'Crime', atributoBase: 'agi' },
  { nome: 'Diplomacia', atributoBase: 'pre' },
  { nome: 'Enganação', atributoBase: 'pre' },
  { nome: 'Fortitude', atributoBase: 'vig' },
  { nome: 'Furtividade', atributoBase: 'agi' },
  { nome: 'Iniciativa', atributoBase: 'agi' },
  { nome: 'Intimidação', atributoBase: 'pre' },
  { nome: 'Intuição', atributoBase: 'pre' },
  { nome: 'Investigação', atributoBase: 'int' },
  { nome: 'Luta', atributoBase: 'for' },
  { nome: 'Medicina', atributoBase: 'int' },
  { nome: 'Ocultismo', atributoBase: 'int' },
  { nome: 'Percepção', atributoBase: 'pre' },
  { nome: 'Pilotagem', atributoBase: 'agi' },
  { nome: 'Pontaria', atributoBase: 'agi' },
  { nome: 'Profissão', atributoBase: 'int' },
  { nome: 'Reflexos', atributoBase: 'agi' },
  { nome: 'Religião', atributoBase: 'pre' },
  { nome: 'Sobrevivência', atributoBase: 'int' },
  { nome: 'Tática', atributoBase: 'int' },
  { nome: 'Tecnologia', atributoBase: 'int' },
  { nome: 'Vontade', atributoBase: 'pre' },
]
