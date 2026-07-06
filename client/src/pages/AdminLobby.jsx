import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { socket, saveSession } from '../socket'

export default function AdminLobby() {
  const navigate = useNavigate()
  const [adminName, setAdminName]   = useState('')
  const [roomCode, setRoomCode]     = useState(null)
  const [room, setRoom]             = useState(null)
  const [creating, setCreating]     = useState(false)
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    socket.connect()
    socket.on('room:created', ({ roomCode: code }) => {
      setRoomCode(code)
      saveSession('admin', code)
      setCreating(false)
    })
    socket.on('room:state', setRoom)
    socket.on('error:room', ({ message }) => { setError(message); setCreating(false) })

    return () => {
      socket.off('room:created')
      socket.off('room:state')
      socket.off('error:room')
    }
  }, [])

  function createRoom() {
    if (!adminName.trim()) { setError('Nhập tên Admin trước nhé!'); return }
    setCreating(true)
    setError('')
    socket.emit('admin:createRoom', { adminName: adminName.trim() })
  }

  function startGame() {
    socket.emit('admin:startGame', { roomCode })
    navigate('/game')
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const connectedCount = room?.teams?.filter(t => t.connected).length ?? 0

  if (!roomCode) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-10 w-full max-w-md text-center"
        >
          <div className="text-5xl mb-4 animate-float inline-block">🎓</div>
          <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">Tạo phòng Admin</h1>
          <p className="text-slate-500 mb-8">Nhập tên để tạo phòng game mới</p>

          <div className="text-left mb-5">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Tên Admin / Giảng viên</label>
            <input
              className="input"
              placeholder="VD: Thầy Hùng, GV MLN122..."
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createRoom()}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={createRoom}
            disabled={creating}
            className="btn-primary w-full justify-center text-base py-4"
          >
            {creating ? '⏳ Đang tạo...' : '🚀 Tạo phòng'}
          </button>

          <button onClick={() => navigate('/')} className="mt-4 text-slate-400 text-sm hover:text-slate-600 transition-colors">
            ← Về trang chủ
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-bg min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Phòng của {room?.adminName}</h1>
          <p className="text-slate-500 mt-1">Chia sẻ mã phòng để teams tham gia</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Mã phòng ── */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 flex flex-col items-center justify-center gap-6 min-h-[280px]"
          >
            <div>
              <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-3">
                Mã phòng
              </p>
              <div
                className="font-display font-black text-center leading-none cursor-pointer select-all"
                style={{ fontSize: 'clamp(3rem, 12vw, 5rem)',
                  background: 'linear-gradient(135deg, #38BDF8, #A78BFA)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {roomCode}
              </div>
            </div>

            <button onClick={copyCode} className={`btn-ghost text-sm px-5 py-2 ${copied ? 'text-emerald-600' : ''}`}>
              {copied ? '✅ Đã copy!' : '📋 Copy mã'}
            </button>

            <p className="text-sm text-slate-500 text-center max-w-xs">
              Team vào <strong>Tham gia Team</strong> và nhập mã phòng này
            </p>
          </motion.div>

          {/* ── Danh sách team ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-lg text-slate-800">
                👥 Teams ({connectedCount}/8)
              </h2>
              <span className={`badge ${connectedCount > 0 ? 'badge-mint' : 'badge-sky'}`}>
                {connectedCount > 0 ? `${connectedCount} đã vào` : 'Chờ teams...'}
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '360px' }}>
              <AnimatePresence>
                {room?.teams?.map(team => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all
                      ${team.connected ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-white/40 border border-white/60'}`}
                  >
                    <span className="text-2xl">{team.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${team.connected ? 'text-slate-800' : 'text-slate-400'}`}>
                        {team.customName}
                      </p>
                      <p className="text-xs text-slate-400">{team.sectorShort}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                      ${team.connected
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'}`}
                    >
                      {team.connected ? '✅ Đã vào' : '⏳ Chờ'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Start button */}
            <div className="mt-auto pt-4 border-t border-white/60">
              {connectedCount === 0 && (
                <p className="text-center text-slate-400 text-sm mb-3">
                  Chờ ít nhất 1 team tham gia...
                </p>
              )}
              <button
                onClick={startGame}
                disabled={connectedCount === 0}
                className={`btn-primary w-full justify-center text-base py-4
                  ${connectedCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                🎮 Bắt đầu game ({connectedCount} teams sẵn sàng)
              </button>
              <button
                onClick={() => { navigate('/game') }}
                className="mt-2 w-full text-center text-slate-400 text-xs hover:text-slate-600 transition-colors"
              >
                Vào bảng điều khiển Admin
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
