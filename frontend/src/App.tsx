import { Navigate, Route, Routes, useParams } from 'react-router'
import { RotaProtegida, RotaPublica } from './components/Rotas'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import ListaSalas from './pages/ListaSalas/ListaSalas'
import Sala from './pages/Sala/Sala'
import Convite from './pages/Convite/Convite'
import NaoEncontrada from './pages/NaoEncontrada/NaoEncontrada'
import { Apresentacao } from './pages/Apresentacao/Apresentacao'
import { useAuth } from './hooks/useAuth'
import { Carregando } from './components/ui/Feedback'

// key por id: trocar de mesa remonta a tela em vez de mostrar a anterior enquanto carrega.
function SalaPorId() {
  const { id } = useParams()
  return <Sala key={id} />
}

// "/" é a apresentação para quem não entrou; quem já tem sessão vai direto para as mesas.
function Inicio() {
  const { estado } = useAuth()
  if (estado.status === 'autenticado') return <Navigate to="/salas" replace />
  if (estado.status === 'carregando') {
    return <main className="mundo-arquivo flex items-center justify-center"><Carregando texto="Verificando sua sessão..." /></main>
  }
  return <Apresentacao />
}

// <title> em cada rota: o React 19 leva para o <head> e tira ao trocar de página.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<><title>Início</title><Inicio /></>} />
      <Route path="/sobre" element={<><title>Sobre</title><Apresentacao /></>} />
      <Route path="/login" element={<RotaPublica><title>Entrar</title><Login /></RotaPublica>} />
      <Route path="/cadastro" element={<RotaPublica><title>Criar conta</title><Cadastro /></RotaPublica>} />
      <Route path="/salas" element={<RotaProtegida><title>Suas mesas</title><ListaSalas /></RotaProtegida>} />
      <Route path="/salas/:id" element={<RotaProtegida><SalaPorId /></RotaProtegida>} />
      <Route path="/convite/:token" element={<RotaProtegida><title>Convite</title><Convite /></RotaProtegida>} />
      <Route path="*" element={<><title>Página não encontrada</title><NaoEncontrada /></>} />
    </Routes>
  )
}
