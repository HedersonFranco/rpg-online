import { rateLimit } from 'express-rate-limit'

// Requisito não funcional: 10 tentativas/min por IP em /auth → 429.
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em instantes.' },
})
