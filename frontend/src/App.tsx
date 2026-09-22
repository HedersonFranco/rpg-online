import { Link, Navigate, Route, Routes, useParams } from 'react-router'
import { RotaProtegida, RotaPublica } from './components/Rotas'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import ListaSalas from './pages/ListaSalas/ListaSalas'
import Sala from './pages/Sala/Sala'
import Convite from './pages/Convite/Convite'

// key por id: trocar de mesa remonta a tela em vez de mostrar a anterior enquanto carrega.
function SalaPorId() {
  const { id } = useParams()
  return <Sala key={id} />
}

function NaoEncontrada() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">Página não encontrada</h1>
      <Link to="/salas" className="text-sm text-violet-400 hover:text-violet-300">Ir para suas mesas</Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/salas" replace />} />
      <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
      <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
      <Route path="/salas" element={<RotaProtegida><ListaSalas /></RotaProtegida>} />
      <Route path="/salas/:id" element={<RotaProtegida><SalaPorId /></RotaProtegida>} />
      <Route path="/convite/:token" element={<RotaProtegida><Convite /></RotaProtegida>} />
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
