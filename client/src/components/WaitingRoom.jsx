/** WaitingRoom.jsx — Hiển thị khi game chưa bắt đầu (phase: lobby). */

import { motion } from 'framer-motion'
import GameGuidePanel from './GameGuidePanel'
import SectorImage from './SectorImage'

const stagger = {
  show: { transition: { staggerChildren: 0.08 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
}

export default function WaitingRoom({ room, myRole, onStart }) {
  const connected = room.teams.filter(t => t.connected)
  const waiting   = room.teams.filter(t => !t.connected)
  const isAdmin   = myRole === 'admin'

  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-6xl mb-4 inline-block"
          >🚀</motion.div>
          <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">Phòng {room.roomCode}</h1>
          <p className="text-slate-500">
            {isAdmin
              ? `Đang chờ teams tham gia... (${connected.length}/8 đã vào)`
              : 'Đang chờ Admin bắt đầu game...'}
          </p>
        </motion.div>

        {/* Teams */}
        <div className="glass p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-700">👥 Danh sách teams</h2>
            <span className="badge badge-mint">{connected.length} sẵn sàng</span>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid sm:grid-cols-2 gap-3"
          >
            {room.teams.map(team => (
              <motion.div key={team.id} variants={item}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${team.connected
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white/30 border-white/60 opacity-50'}`}
              >
                <SectorImage team={team} size="md" />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${team.connected ? 'text-slate-800' : 'text-slate-400'}`}>
                    {team.customName}
                  </p>
                  <p className="text-xs text-slate-400">{team.sectorShort}</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                  ${team.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hướng dẫn — khớp với Home, thu gọn mặc định */}
        <GameGuidePanel defaultOpen={false} compact={false} />

        {/* Admin controls */}
        {isAdmin ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <button
              onClick={onStart}
              disabled={connected.length === 0}
              className={`btn-primary w-full justify-center text-lg py-5
                ${connected.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              🎮 Bắt đầu game ({connected.length} teams)
            </button>
            <p className="text-center text-slate-400 text-xs mt-3">
              Có thể bắt đầu khi ít nhất 1 team đã tham gia
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass p-5 text-center"
          >
            <div className="flex justify-center gap-1 mb-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className="w-2.5 h-2.5 rounded-full bg-sky-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-slate-500 font-medium">Đang chờ Admin bắt đầu...</p>
            <p className="text-xs text-slate-400 mt-1">Game sẽ tự động mở khi Admin nhấn bắt đầu</p>
          </motion.div>
        )}

      </div>
    </div>
  )
}
