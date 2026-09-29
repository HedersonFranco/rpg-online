# Módulo usuario

Cadastro, login e identificação do usuário autenticado. Emite o JWT usado por todas as outras rotas e pelo socket.

## Rotas

Montado em `/auth` (`server.ts`).

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/auth/cadastro` | qualquer um (rate limit) | Cria usuário e devolve `{ usuario, token }` (201). `400` para nome vazio, email inválido, senha curta ou email já cadastrado. |
| POST | `/auth/login` | qualquer um (rate limit) | Devolve `{ usuario, token }`. `401` para email ou senha inválidos. |
| GET | `/auth/me` | autenticado | Devolve `{ id, nome, email }` do dono do token. `404` se o usuário não existe mais. |

## Regras

- Nome obrigatório (após `trim`); email validado por regex simples; senha com no mínimo 6 caracteres.
- Email duplicado é rejeitado com `400` ("Email já cadastrado").
- Senha guardada só como hash bcrypt (`bcryptjs`, 10 rounds) em `senha_hash`.
- Login com email inexistente ou senha errada dá a mesma mensagem genérica (`401`), para não revelar se o email existe.
- A resposta nunca inclui `senha_hash` — só `id`, `nome`, `email` (`paraPublico`).
- Token assinado com `{ usuarioId }`, expira em 24h (`lib/jwt.ts`).
- `POST /auth/cadastro` e `POST /auth/login` compartilham o mesmo limiter: 10 requisições/min por IP, acima disso `429` ("Muitas tentativas..."). `GET /auth/me` não passa pelo limiter.
- Nenhum evento em tempo real.

## Dependências

- `lib/prisma.ts` — client do banco (tabela `Usuario`).
- `lib/jwt.ts` — `assinarToken()` para emitir o JWT.
- `errors/AppError.ts` — erros com status HTTP.
- `middlewares/auth.ts` — `autenticar` em `/auth/me` (`401` sem token ou com token inválido/expirado).
- `middlewares/rateLimit.ts` — `authRateLimiter` em cadastro e login.
- `bcryptjs` — hash e comparação de senha.

## Testes

Sem testes automatizados.
