import type { AtributosOP1 } from './calculoFicha.js'

// As 28 perícias de Ordem Paranormal RPG v1.3 com o atributo-base de cada uma —
// Tabela 2.1 (Cap. 2, p. 41), extraída do PDF oficial em 23/09/2026.
// Agilidade 7, Força 2, Intelecto 9, Presença 9, Vigor 1.
// Fonte única: o seed popula a tabela Pericia a partir daqui.
// `sigla`: 3 letras para o bilhete compacto da rolagem ("INV (INT)"); nenhuma repete a de um atributo
// (Fortitude é FRT, não FOR, que é Força).
export const PERICIAS_OP1: { nome: string; sigla: string; atributoBase: keyof AtributosOP1 }[] = [
  { nome: 'Acrobacia', sigla: 'ACR', atributoBase: 'agi' },
  { nome: 'Adestramento', sigla: 'ADE', atributoBase: 'pre' },
  { nome: 'Artes', sigla: 'ART', atributoBase: 'pre' },
  { nome: 'Atletismo', sigla: 'ATL', atributoBase: 'for' },
  { nome: 'Atualidades', sigla: 'ATU', atributoBase: 'int' },
  { nome: 'Ciências', sigla: 'CIE', atributoBase: 'int' },
  { nome: 'Crime', sigla: 'CRI', atributoBase: 'agi' },
  { nome: 'Diplomacia', sigla: 'DIP', atributoBase: 'pre' },
  { nome: 'Enganação', sigla: 'ENG', atributoBase: 'pre' },
  { nome: 'Fortitude', sigla: 'FRT', atributoBase: 'vig' },
  { nome: 'Furtividade', sigla: 'FUR', atributoBase: 'agi' },
  { nome: 'Iniciativa', sigla: 'INI', atributoBase: 'agi' },
  { nome: 'Intimidação', sigla: 'ITM', atributoBase: 'pre' },
  { nome: 'Intuição', sigla: 'ITU', atributoBase: 'pre' },
  { nome: 'Investigação', sigla: 'INV', atributoBase: 'int' },
  { nome: 'Luta', sigla: 'LUT', atributoBase: 'for' },
  { nome: 'Medicina', sigla: 'MED', atributoBase: 'int' },
  { nome: 'Ocultismo', sigla: 'OCU', atributoBase: 'int' },
  { nome: 'Percepção', sigla: 'PER', atributoBase: 'pre' },
  { nome: 'Pilotagem', sigla: 'PIL', atributoBase: 'agi' },
  { nome: 'Pontaria', sigla: 'PON', atributoBase: 'agi' },
  { nome: 'Profissão', sigla: 'PRO', atributoBase: 'int' },
  { nome: 'Reflexos', sigla: 'REF', atributoBase: 'agi' },
  { nome: 'Religião', sigla: 'REL', atributoBase: 'pre' },
  { nome: 'Sobrevivência', sigla: 'SOB', atributoBase: 'int' },
  { nome: 'Tática', sigla: 'TAT', atributoBase: 'int' },
  { nome: 'Tecnologia', sigla: 'TEC', atributoBase: 'int' },
  { nome: 'Vontade', sigla: 'VON', atributoBase: 'pre' },
]
