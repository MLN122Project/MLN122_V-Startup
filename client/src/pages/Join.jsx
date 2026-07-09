import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { socket, saveSession } from '../socket'
import { SectorGuideTable } from '../components/GameGuidePanel'
import SectorImage from '../components/SectorImage'

export default function Join() {
  const navigate = useNavigate()
  const [params]  = useSearchParams()

  const [code, setCode]           = useState(params.get('code') || '')
  const [checking, setChecking]   = useState(false)
  const [roomInfo, setRoomInfo]   = useState(null)   // { teams, adminName, roomCode }
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [customName, setCustomName]     = useState('')
  const [joining, setJoining]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    socket.connect()
    socket.on('room:checkResult', (result) => {
      setChecking(false)
      if (result.valid) {
        setRoomInfo(result)
        setError('')
      } else {
        setError(result.message)
        setRoomInfo(null)
      }
    })
    socket.on('team:joined', ({ teamId, roomCode }) => {
      saveSession('player', roomCode, teamId)
      navigate('/game')
    })
    socket.on('error:room', ({ message }) => {
      setError(message)
      setJoining(false)
    })

    // Auto-check if code passed via URL
    if (params.get('code')) checkRoom(params.get('code'))

    return () => {
      socket.off('room:checkResult')
      socket.off('team:joined')
      socket.off('error:room')
    }
  }, [])

  function checkRoom(codeOverride) {
    const c = (codeOverride || code).toUpperCase().trim()
    if (!c) { setError('Nhập mã phòng trước nhé!'); return }
    setChecking(true)
    setError('')
    setRoomInfo(null)
    socket.emit('room:check', { roomCode: c })
  }

  function joinTeam() {
    if (!selectedTeam) { setError('Chọn một team trước nhé!'); return }
    setJoining(true)
    setError('')
    socket.emit('team:join', {
      roomCode: roomInfo.roomCode,
      teamId: selectedTeam,
      customName: customName.trim() || undefined,
    })
  }

  return (
    <div className="page-bg min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3 animate-float inline-block">👥</div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Tham gia game</h1>
          <p className="text-slate-500 mt-1">Nhập mã phòng từ Admin để vào game</p>
        </motion.div>

        {/* Code input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 mb-5"
        >
          <label className="block text-sm font-semibold text-slate-600 mb-2">Mã phòng</label>
          <div className="flex gap-3">
            <input
              className="input flex-1 text-center font-display font-bold text-2xl tracking-[0.3em] uppercase"
              placeholder="VST123"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setRoomInfo(null); setSelectedTeam(null) }}
              onKeyDown={e => e.key === 'Enter' && checkRoom()}
              maxLength={6}
            />
            <button onClick={() => checkRoom()} disabled={checking} className="btn-primary px-6 whitespace-nowrap">
              {checking ? '⏳' : '🔍 Kiểm tra'}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              ⚠️ {error}
            </div>
          )}
        </motion.div>

        {/* Team selection */}
        <AnimatePresence>
          {roomInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <div className="glass p-6 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-slate-800">
                    🏠 Phòng của {roomInfo.adminName}
                  </h2>
                  <span className="badge badge-mint">Chọn team của bạn</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {roomInfo.teams.map(team => {
                    const isTaken = team.connected
                    const isSelected = selectedTeam === team.id
                    return (
                      <motion.button
                        key={team.id}
                        whileHover={!isTaken ? { scale: 1.02 } : {}}
                        whileTap={!isTaken ? { scale: 0.98 } : {}}
                        onClick={() => !isTaken && setSelectedTeam(team.id)}
                        disabled={isTaken}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                          ${isTaken
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                            : isSelected
                              ? 'border-sky-400 bg-sky-50 shadow-card-hover'
                              : 'border-white/80 bg-white/50 hover:border-sky-200 hover:bg-white/70'}`}
                      >
                        <SectorImage team={team} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm">{team.sectorShort}</p>
                          <p className="text-xs text-slate-400">{team.sector}</p>
                        </div>
                        {isSelected && <span className="text-sky-500 text-lg">✓</span>}
                        {isTaken && <span className="text-xs text-slate-400 font-medium">Đã có người</span>}
                      </motion.button>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Perk từng ngành</p>
                  <SectorGuideTable />
                </div>
              </div>

              {/* Custom name + Join */}
              {selectedTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass p-6"
                >
                  <h3 className="font-semibold text-slate-700 mb-3">
                    {roomInfo.teams.find(t => t.id === selectedTeam)?.emoji}{' '}
                    Đặt tên startup (tùy chọn)
                  </h3>
                  <input
                    className="input mb-4"
                    placeholder={`VD: ${roomInfo.teams.find(t => t.id === selectedTeam)?.sectorShort} Pro...`}
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && joinTeam()}
                  />
                  <button
                    onClick={joinTeam}
                    disabled={joining}
                    className="btn-primary w-full justify-center text-base py-4"
                  >
                    {joining ? '⏳ Đang vào...' : '🚀 Vào game!'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => navigate('/')} className="mt-6 block mx-auto text-slate-400 text-sm hover:text-slate-600 transition-colors">
          ← Về trang chủ
        </button>
      </div>
    </div>
  )
}
