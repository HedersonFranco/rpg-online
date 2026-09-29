// Função pura — sem banco. O endpoint que consome isso (entrar na sala via
// link) é Etapa 4; aqui só validamos a regra "convite tem expiração de 7
// dias, nunca permanente" isoladamente.

import { randomUUID } from 'node:crypto'

export type Convite = {
  token: string
  expiraEm: Date | null
}

export type ResultadoValidacaoConvite =
  | { valido: true }
  | { valido: false; motivo: 'convite_inexistente' | 'token_invalido' | 'convite_expirado' }

const DIAS_VALIDADE_PADRAO = 7

export function gerarConvite(agora: Date = new Date()): Convite {
  const expiraEm = new Date(agora)
  expiraEm.setDate(expiraEm.getDate() + DIAS_VALIDADE_PADRAO)
  return {
    token: randomUUID(),
    expiraEm,
  }
}

export function validarConvite(
  convite: Convite | null,
  tokenFornecido: string,
  agora: Date = new Date(),
): ResultadoValidacaoConvite {
  if (!convite) {
    return { valido: false, motivo: 'convite_inexistente' }
  }
  if (convite.token !== tokenFornecido) {
    return { valido: false, motivo: 'token_invalido' }
  }
  if (!convite.expiraEm || convite.expiraEm.getTime() < agora.getTime()) {
    return { valido: false, motivo: 'convite_expirado' }
  }
  return { valido: true }
}

// Só o dono gera convites, então só ele recebe o token (e a validade) nas respostas da API.
// Para os demais membros os dois campos saem como null — sem isso, qualquer jogador leria o
// link na aba Rede do navegador e convidaria gente sem o dono saber.
export function ocultarConvite<T extends { donoId: string; conviteToken: string | null; conviteExpiraEm: Date | null }>(
  sala: T,
  usuarioId: string,
): T {
  if (sala.donoId === usuarioId) return sala
  return { ...sala, conviteToken: null, conviteExpiraEm: null }
}
