import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'

// Servidores ICE pro WebRTC. STUN público resolve a maioria das redes
// domésticas; entre redes restritivas (NAT simétrico, 4G, rede corporativa)
// só um TURN resolve — ele é configurado por ambiente (credencial fora do código).
export const rtcRoutes = Router()

rtcRoutes.get('/config', autenticar, (_req, res) => {
  const iceServers: { urls: string; username?: string; credential?: string }[] = [
    { urls: 'stun:stun.l.google.com:19302' },
  ]
  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    })
  }
  res.json({ iceServers, turnConfigurado: Boolean(process.env.TURN_URL) })
})
