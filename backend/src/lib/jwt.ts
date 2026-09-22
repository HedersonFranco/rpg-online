import 'dotenv/config'
import jwt from 'jsonwebtoken'

// JWT expira em 24h — sem refresh token na v1 (relogin obrigatório, ver CLAUDE.md).
const EXPIRES_IN = '24h'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não configurado no ambiente')
  }
  return secret
}

export type TokenPayload = {
  usuarioId: string
}

export function assinarToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES_IN })
}

export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as TokenPayload
}
