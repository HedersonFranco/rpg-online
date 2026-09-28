import { Link, Navigate, Route, Routes, useParams } from 'react-router'
import { RotaProtegida, RotaPublica } from './components/Rotas'
import { Carimbo, Folha, Pasta, PlacaGaveta } from './components/ui/arquivo'
import { classeLinkPapel, classeTituloArquivo } from './components/ui/estilosArquivo'
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
    <main className="mundo-arquivo flex flex-col items-center justify-center gap-6 px-4 py-10">
      <PlacaGaveta />
      <div className="w-full max-w-md">
        <Pasta aba="Arquivo">
          <div className="px-3 pt-4 pb-5 sm:px-5">
            <Folha>
              <div className="mb-4 flex items-start justify-between gap-3">
                <h1 className={`text-3xl leading-none ${classeTituloArquivo}`}>Página não encontrada</h1>
                <Carimbo>Não arquivado</Carimbo>
              </div>
              <Link to="/salas" className={`text-sm ${classeLinkPapel}`}>Ir para suas mesas</Link>
            </Folha>
          </div>
        </Pasta>
      </div>
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
