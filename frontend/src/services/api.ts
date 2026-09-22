const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
const CHAVE_TOKEN = 'rpg-online.token'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

export function salvarToken(token: string) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
  } catch {
    // storage indisponível (modo privado, bloqueio do navegador) — a sessão vale só até o reload
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
  } catch {
    // idem salvarToken
  }
}

let aoExpirarSessao: (() => void) | null = null

export function registrarAoExpirarSessao(callback: (() => void) | null) {
  aoExpirarSessao = callback
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return 'Algo deu errado. Tente novamente.'
}

export async function api<T>(caminho: string, opcoes: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = lerToken()

  let resposta: Response
  try {
    resposta = await fetch(BASE_URL + caminho, {
      method: opcoes.method ?? 'GET',
      headers: {
        ...(opcoes.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.',
      0,
    )
  }

  if (resposta.status === 204) return undefined as T

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // 401 com token = sessão expirada (JWT de 24h). Sem token é só senha errada no login.
    if (resposta.status === 401 && token) aoExpirarSessao?.()
    throw new ApiError(dados?.error ?? `Erro inesperado do servidor (${resposta.status}).`, resposta.status)
  }

  return dados as T
}
