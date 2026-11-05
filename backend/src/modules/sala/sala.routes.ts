import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import {
  buscarController,
  criarController,
  deletarController,
  entrarController,
  listarController,
  desbanirController,
  listarBanidosController,
  promoverMembroController,
  regenerarConviteController,
  removerMembroController,
} from './sala.controller.js'
import {
  criarController as criarFichaController,
  listarController as listarFichasController,
} from '../ficha/ficha.controller.js'
import {
  criarController as criarNpcController,
  listarController as listarNpcsController,
} from '../npc/npc.controller.js'
import { listarController as listarMensagensController } from '../mensagem/mensagem.controller.js'
import {
  antesDoUploadDeMapa,
  buscarAtivoController,
  criarController as criarMapaController,
  definirAtivoController,
  listarController as listarMapasController,
} from '../mapa/mapa.controller.js'
import {
  antesDoUploadDeMontaria,
  criarController as criarMontariaController,
  listarController as listarMontariasController,
} from '../montaria/montaria.controller.js'
import { uploadImagemMontaria, uploadMapa } from '../../middlewares/upload.js'
import {
  criarController as criarPastaController,
  listarBibliotecaController,
} from '../pasta/pasta.controller.js'

export const salaRoutes = Router()

salaRoutes.use(autenticar)

salaRoutes.post('/', criarController)
salaRoutes.get('/', listarController)
// Rota estática precisa vir antes de '/:id' pra não ser capturada como :id.
salaRoutes.post('/entrar', entrarController)
salaRoutes.get('/:id', buscarController)
salaRoutes.delete('/:id', deletarController)
salaRoutes.post('/:id/convite', regenerarConviteController)
salaRoutes.patch('/:id/membros/:membroId', promoverMembroController)
salaRoutes.delete('/:id/membros/:membroId', removerMembroController)
salaRoutes.get('/:id/banidos', listarBanidosController)
salaRoutes.delete('/:id/banidos/:usuarioId', desbanirController)
salaRoutes.post('/:id/fichas', criarFichaController)
salaRoutes.get('/:id/fichas', listarFichasController)
salaRoutes.post('/:id/npcs', criarNpcController)
salaRoutes.get('/:id/npcs', listarNpcsController)
salaRoutes.get('/:id/mensagens', listarMensagensController)
// Antes do upload, quem pode e se cabe: quem não pode, ou a mesa cheia, nem chega a mandar o arquivo.
salaRoutes.post('/:id/mapas', antesDoUploadDeMapa, uploadMapa, criarMapaController)
salaRoutes.get('/:id/mapas', listarMapasController)
salaRoutes.get('/:id/mapa-ativo', buscarAtivoController)
salaRoutes.put('/:id/mapa-ativo', definirAtivoController)
salaRoutes.post('/:id/montarias', antesDoUploadDeMontaria, uploadImagemMontaria, criarMontariaController)
salaRoutes.get('/:id/montarias', listarMontariasController)
salaRoutes.post('/:id/pastas', criarPastaController)
salaRoutes.get('/:id/biblioteca', listarBibliotecaController)
