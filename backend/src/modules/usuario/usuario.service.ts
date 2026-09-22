import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma.js'
import { assinarToken } from '../../lib/jwt.js'
import { AppError } from '../../errors/AppError.js'

const SALT_ROUNDS = 10
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type UsuarioPublico = {
  id: string
  nome: string
  email: string
}

function paraPublico(usuario: { id: string; nome: string; email: string }): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email }
}

export async function cadastrar(nome: string, email: string, senha: string) {
  if (!nome?.trim()) {
    throw new AppError('Nome é obrigatório', 400)
  }
  if (!EMAIL_REGEX.test(email ?? '')) {
    throw new AppError('Email inválido', 400)
  }
  if (!senha || senha.length < 6) {
    throw new AppError('Senha deve ter ao menos 6 caracteres', 400)
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    throw new AppError('Email já cadastrado', 400)
  }

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS)
  const usuario = await prisma.usuario.create({
    data: { nome: nome.trim(), email, senha_hash },
  })

  const token = assinarToken({ usuarioId: usuario.id })
  return { usuario: paraPublico(usuario), token }
}

export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } })

  // Mensagem genérica de propósito — não revela se o email existe.
  if (!usuario || !(await bcrypt.compare(senha ?? '', usuario.senha_hash))) {
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
