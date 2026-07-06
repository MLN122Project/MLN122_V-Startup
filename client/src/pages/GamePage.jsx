/**
 * GamePage.jsx — Hub chính của game.
 * Đọc localStorage để biết role (admin/player), kết nối Socket.IO,
 * rồi render đúng view dựa trên trạng thái phòng.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { socket, loadSession, clearSession, STORAGE } from '../socket'
import AdminGameView  from '../components/AdminGameView'
import PlayerGameView from '../components/PlayerGameView'
import WaitingRoom    from '../components/WaitingRoom'
import GameMusicToggle from '../components/GameMusicToggle'

export default function GamePage() {
  const navigate = useNavigate()
  const { role, room: roomCode, team: teamId } = loadSession()

  const [room, setRoom]     = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!role || !roomCode) {
      navigate('/')
      return
    }

    socket.connect()

    socket.on('connect', () => {
      // On connect / reconnect, re-identify ourselves to the server
      if (role === 'admin') {
        socket.emit('reconnect:admin', { roomCode })
      } else {
        socket.emit('reconnect:player', { roomCode, teamId })
      }
    })

    socket.on('room:state', (roomData) => {
      setRoom(roomData)
      setLoading(false)
      // If game ended → save final state and go to winner page
      if (roomData.phase === 'ended') {
        localStorage.setItem(STORAGE.FINAL, JSON.stringify(roomData))
        navigate('/winner')
      }
    })

    socket.on('error:room', ({ message }) => {
      setError(message)
      setLoading(false)
    })

    // If already connected when this component mounts
    if (socket.connected) {
      if (role === 'admin') socket.emit('reconnect:admin', { roomCode })
      else socket.emit('reconnect:player', { roomCode, teamId })
    }

    return () => {
      socket.off('connect')
      socket.off('room:state')
      socket.off('error:room')
    }
  }, [])

  let content = null

  if (loading) {
    content = (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass p-10 text-center"
        >
          <div className="text-5xl mb-4 animate-bounce-soft inline-block">🚀</div>
          <p className="font-display font-bold text-xl text-slate-700">Đang kết nối...</p>
          <p className="text-slate-400 text-sm mt-2">Phòng: {roomCode}</p>
        </motion.div>
      </div>
    )
  } else if (error) {
    content = (
      <div className="page-bg min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-10 text-center max-w-md"
        >
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-display font-bold text-2xl text-slate-800 mb-3">Không thể kết nối</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/join')} className="btn-primary">Vào phòng mới</button>
            <button onClick={() => { clearSession(); navigate('/') }} className="btn-ghost">Trang chủ</button>
          </div>
        </motion.div>
      </div>
    )
  } else if (!room) {
    content = null
  } else if (room.phase === 'lobby') {
    content = (
      <WaitingRoom room={room} myRole={role} onStart={() => socket.emit('admin:startGame', { roomCode })} />
    )
  } else if (role === 'admin') {
    content = <AdminGameView room={room} roomCode={roomCode} socket={socket} />
  } else {
    const myTeam = room.teams?.find(t => t.id === teamId)
    content = <PlayerGameView room={room} myTeam={myTeam} roomCode={roomCode} socket={socket} />
  }

  return (
    <>
      {content}
      {role === 'admin' && <GameMusicToggle />}
    </>
  )
}
