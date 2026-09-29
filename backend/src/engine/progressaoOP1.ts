import type { ClasseOrdemParanormal, ProgressaoClasseEntry } from './progressaoClasse.js'
import { NEX_TIERS } from './progressaoClasse.js'

// Habilidades de classe por NEX em Ordem Paranormal RPG v1.3 — Tabelas 1.3 (Combatente, p. 25),
// 1.4 (Especialista, p. 29) e 1.5 (Ocultista, p. 33), extraídas do PDF oficial em 29/09/2026.
// Fonte única: o seed popula ProgressaoClasse a partir daqui (20 linhas por classe, uma por NEX).
//
// Formato: habilidades do mesmo NEX separadas por ";" (não vírgula — uma habilidade sozinha
// pode ter vírgula, como "Ataque especial (2 PE, +5)"). Onde o livro junta duas com vírgula
// ("Aumento de atributo, versatilidade"), aqui vira "Aumento de atributo; Versatilidade".
// São os NOMES das habilidades de classe; as de trilha e os poderes o jogador escolhe e anota
// na ficha (FichaEntrada).
const TABELAS: Record<ClasseOrdemParanormal, string[]> = {
  COMBATENTE: [
    'Ataque especial (2 PE, +5)',
    'Habilidade de trilha',
    'Poder de combatente',
    'Aumento de atributo',
    'Ataque especial (3 PE, +10)',
    'Poder de combatente',
    'Grau de treinamento',
    'Habilidade de trilha',
    'Poder de combatente',
    'Aumento de atributo; Versatilidade',
    'Ataque especial (4 PE, +15)',
    'Poder de combatente',
    'Habilidade de trilha',
    'Grau de treinamento',
    'Poder de combatente',
    'Aumento de atributo',
    'Ataque especial (5 PE, +20)',
    'Poder de combatente',
    'Aumento de atributo',
    'Habilidade de trilha',
  ],
  ESPECIALISTA: [
    'Eclético; Perito (2 PE, +1d6)',
    'Habilidade de trilha',
    'Poder de especialista',
    'Aumento de atributo',
    'Perito (3 PE, +1d8)',
    'Poder de especialista',
    'Grau de treinamento',
    'Engenhosidade (veterano); Habilidade de trilha',
    'Poder de especialista',
    'Aumento de atributo; Versatilidade',
    'Perito (4 PE, +1d10)',
    'Poder de especialista',
    'Habilidade de trilha',
    'Grau de treinamento',
    'Engenhosidade (expert); Poder de especialista',
    'Aumento de atributo',
    'Perito (5 PE, +1d12)',
    'Poder de especialista',
    'Aumento de atributo',
    'Habilidade de trilha',
  ],
  OCULTISTA: [
    'Escolhido pelo Outro Lado (1º círculo)',
    'Habilidade de trilha',
    'Poder de ocultista',
    'Aumento de atributo',
    'Escolhido pelo Outro Lado (2º círculo)',
    'Poder de ocultista',
    'Grau de treinamento',
    'Habilidade de trilha',
    'Poder de ocultista',
    'Aumento de atributo; Versatilidade',
    'Escolhido pelo Outro Lado (3º círculo)',
    'Poder de ocultista',
    'Habilidade de trilha',
    'Grau de treinamento',
    'Poder de ocultista',
    'Aumento de atributo',
    'Escolhido pelo Outro Lado (4º círculo)',
    'Poder de ocultista',
    'Aumento de atributo',
    'Habilidade de trilha',
  ],
}

export const PROGRESSAO_OP1: ProgressaoClasseEntry[] = (Object.keys(TABELAS) as ClasseOrdemParanormal[]).flatMap((classe) =>
  TABELAS[classe].map((habilidades, i) => ({ classe, nex: NEX_TIERS[i], habilidades })),
)
