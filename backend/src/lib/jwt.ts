import 'dotenv/config'
import jwt from 'jsonwebtoken'

// JWT expira em 24h — sem refresh token na v1 (relogin obrigatório, ver CLAUDE.md).
const EXPIRES_IN = '24h'
// Com HS256, um segredo curto se quebra por força bruta offline a partir de qualquer token emitido.
const SEGREDO_MIN = 32

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < SEGREDO_MIN) {
    throw new Error(`JWT_SECRET ausente ou curto demais (mínimo ${SEGREDO_MIN} caracteres) — veja .env.example`)
  }
  return secret
}
// Confere já ao carregar: sem segredo forte o servidor nem sobe, em vez de falhar no primeiro login.
getSecret()

export type TokenPayload = {
  usuarioId: string
}

export function assinarToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES_IN })
}

// Algoritmo fixo: o servidor nunca aceita um token assinado de outro jeito do que ele mesmo assina.
export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as TokenPayload
}
