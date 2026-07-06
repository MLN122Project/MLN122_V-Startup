import { Routes, Route, Navigate } from 'react-router-dom'
import Home       from './pages/Home'
import AdminLobby from './pages/AdminLobby'
import Join       from './pages/Join'
import GamePage   from './pages/GamePage'
import WinnerPage from './pages/WinnerPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<Home />} />
      <Route path="/admin"  element={<AdminLobby />} />
      <Route path="/join"   element={<Join />} />
      <Route path="/game"   element={<GamePage />} />
      <Route path="/winner" element={<WinnerPage />} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  )
}
