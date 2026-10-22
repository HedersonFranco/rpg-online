import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma.js'
import { assinarToken } from '../../lib/jwt.js'
import { AppError } from '../../errors/AppError.js'

const SALT_ROUNDS = 10
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NOME_MAX = 60
export const EMAIL_MAX = 254 // limite prático de endereço (RFC 5321)
export const SENHA_MIN = 8
// O bcrypt só lê os primeiros 72 bytes: acima disso, duas senhas com o mesmo começo virariam a mesma senha.
export const SENHA_MAX_BYTES = 72
// Checklist clássico (escolha de 21/10/2026, no lugar de "só tamanho + lista de senhas comuns" do NIST/OWASP).
// O cadastro mostra as mesmas regras enquanto a pessoa digita; quem barra é aqui.
// Símbolo é qualquer coisa fora de letra, acento combinado ou número — espaço conta.
const REGRAS_SENHA = [
  { falta: 'uma letra maiúscula', atende: /\p{Lu}/u },
  { falta: 'uma letra minúscula', atende: /\p{Ll}/u },
  { falta: 'um número', atende: /\p{N}/u },
  { falta: 'um símbolo', atende: /[^\p{L}\p{M}\p{N}]/u },
]
const emLista = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

// O que falta para a senha atender ao checklist (lista vazia = atende).
export function faltasNaSenha(senha: string): string[] {
  return REGRAS_SENHA.filter((regra) => !regra.atende.test(senha)).map((regra) => regra.falta)
}

// Email é guardado e buscado sempre em minúsculas: "Joao@x.com" e "joao@x.com" são a mesma conta.
export function normalizarEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

type UsuarioPublico = {
  id: string
  nome: string
  email: string
}

function paraPublico(usuario: { id: string; nome: string; email: string }): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email }
}

export async function cadastrar(nomeBruto: string, emailBruto: string, senha: string) {
  const nome = typeof nomeBruto === 'string' ? nomeBruto.trim() : ''
  const email = normalizarEmail(emailBruto)
  if (!nome) {
    throw new AppError('Nome é obrigatório', 400)
  }
  if (nome.length > NOME_MAX) {
    throw new AppError(`Nome deve ter no máximo ${NOME_MAX} caracteres`, 400)
  }
  if (email.length > EMAIL_MAX || !EMAIL_REGEX.test(email)) {
    throw new AppError('Email inválido', 400)
  }
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    throw new AppError(`Senha deve ter ao menos ${SENHA_MIN} caracteres`, 400)
  }
  if (Buffer.byteLength(senha) > SENHA_MAX_BYTES) {
    throw new AppError(`Senha deve ter no máximo ${SENHA_MAX_BYTES} caracteres`, 400)
  }
  const faltas = faltasNaSenha(senha)
  if (faltas.length > 0) {
    throw new AppError(`A senha precisa de ${emLista.format(faltas)}`, 400)
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    throw new AppError('Email já cadastrado', 400)
  }

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS)
  const usuario = await prisma.usuario.create({
    data: { nome, email, senha_hash },
  })

  const token = assinarToken({ usuarioId: usuario.id })
  return { usuario: paraPublico(usuario), token }
}

export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email: normalizarEmail(email) } })

  // Mensagem genérica de propósito — não revela se o email existe.
  if (!usuario || !(await bcrypt.compare(typeof senha === 'string' ? senha : '', usuario.senha_hash))) {
    throw new AppError('Email ou senha inválidos', 401)
  }

  const token = assinarToken({ usuarioId: usuario.id })
  return { usuario: paraPublico(usuario), token }
}

export async function buscarPorId(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } })
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404)
  }
  return paraPublico(usuario)
}
