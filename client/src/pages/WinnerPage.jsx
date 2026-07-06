/**
 * WinnerPage.jsx — Màn hình tổng kết đa giải thưởng (Drama edition).
 * Giải thưởng: Quán quân · Giàu nhất · Phụng Sự cao · AP cao ·
 *              Đồng minh tốt · Drama King · Ice Master · Bị bóc phốt nhiều nhất
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { STORAGE, clearSession } from '../socket'

// ─── Victory chime ────────────────────────────────────────────────────────────
function playVictoryChime() {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g   = ctx.createGain()
      osc.connect(g); g.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.value = freq
      const t  = ctx.currentTime + i * 0.18
      g.gain.setValueAtTime(0.25, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
      osc.start(t); osc.stop(t + 0.6)
    })
  } catch { /* blocked */ }
}

function launchConfetti() {
  const colors = ['#38BDF8','#34D399','#FACC15','#F97316','#A78BFA','#F43F5E']
  confetti({ particleCount: 200, spread: 80, origin: { y: 0.55 }, colors })
  const end = Date.now() + 5000
  const frame = () => {
    confetti({ particleCount: 3, angle: 60,  spread: 60, origin: { x: 0 }, colors })
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// ─── Podium slot ──────────────────────────────────────────────────────────────
function PodiumSlot({ team, rank, height, delay }) {
  const medals = ['🥇','🥈','🥉']
  const gradients = [
    'linear-gradient(135deg,#FACC15,#F97316)',
    'linear-gradient(135deg,#94A3B8,#CBD5E1)',
    'linear-gradient(135deg,#CD7F32,#F97316)',
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 14, stiffness: 100 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="text-4xl">{team?.emoji || '🏢'}</div>
      <div className="text-center max-w-[120px]">
        <p className="font-display font-bold text-sm text-slate-800 leading-tight">{team?.customName}</p>
        <p className="text-xs text-slate-500">{team?.sectorShort}</p>
      </div>
      <div className="font-display font-black text-2xl">{medals[rank - 1]}</div>
      <div className="text-sm font-bold text-slate-700">{team?.score?.toFixed(0)} điểm</div>
      <motion.div
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        style={{ originY: 1, height, background: gradients[rank - 1] }}
        className="w-24 rounded-t-2xl flex items-end justify-center pb-3 shadow-lg"
      >
        <span className="text-white font-bold text-lg">#{rank}</span>
      </motion.div>
    </motion.div>
  )
}

// ─── Award card ───────────────────────────────────────────────────────────────
function AwardCard({ emoji, title, team, sub, delay, color = '#38BDF8' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      className="glass-sm p-4 text-center"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</p>
      {team ? (
        <>
          <div className="text-2xl">{team.emoji}</div>
          <p className="font-display font-bold text-sm text-slate-800 mt-1">{team.customName}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </>
      ) : (
        <p className="text-slate-400 text-sm italic">Không có dữ liệu</p>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WinnerPage() {
  const navigate  = useNavigate()
  const launched  = useRef(false)
  const [muted, setMuted] = useState(false)

  const finalRoom = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE.FINAL) || '{}') } catch { return {} }
  })()

  const teams  = finalRoom?.teams ?? []
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const top3   = sorted.slice(0, 3)

  // ── Tính từng giải ─────────────────────────────────────────────────────────
  const richest     = [...teams].sort((a,b) => b.budget - a.budget)[0]
  const topSip      = [...teams].sort((a,b) => b.sip - a.sip)[0]
  const topAp       = [...teams].sort((a,b) => b.ap - a.ap)[0]
  const dramaKing   = [...teams].sort((a,b) => (b.exposeCount ?? 0) - (a.exposeCount ?? 0))[0]
  const iceMaster   = [...teams].sort((a,b) => (b.frozenCount ?? 0) - (a.frozenCount ?? 0))[0]
  const alliance    = [...teams].sort((a,b) => (b.allianceCount ?? 0) - (a.allianceCount ?? 0))[0]
  const mostExposed = [...teams].sort((a,b) => (b.exposedByCount ?? 0) - (a.exposedByCount ?? 0))[0]

  useEffect(() => {
    if (launched.current) return
    launched.current = true
    setTimeout(() => {
      launchConfetti()
      if (!muted) playVictoryChime()
    }, 800)
  }, [])

  return (
    <div className="page-bg min-h-screen px-4 py-10 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ rotate: [0,-10,10,-5,5,0] }} transition={{ delay: 1, duration: 1 }}
            className="text-7xl mb-4 inline-block"
          >🏆</motion.div>
          <h1 className="font-display font-black text-5xl gradient-text mb-3">Kết thúc game!</h1>
          <p className="font-display font-semibold text-xl text-slate-600">
            Chúc mừng Top 3 Startup xuất sắc nhất!
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            {finalRoom.roomCode && <span className="badge badge-sky">Phòng {finalRoom.roomCode}</span>}
            <button
              onClick={() => setMuted(m => !m)}
              className="badge badge-sky cursor-pointer hover:bg-sky-200 transition-colors"
            >{muted ? '🔇 Tắt âm' : '🔊 Bật âm'}</button>
          </div>
        </motion.div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass p-8 mb-8"
        >
          <div className="flex items-end justify-center gap-6 md:gap-10">
            {top3[1] && <PodiumSlot team={top3[1]} rank={2} height="110px" delay={0.9}  />}
            {top3[0] && <PodiumSlot team={top3[0]} rank={1} height="155px" delay={0.5}  />}
            {top3[2] && <PodiumSlot team={top3[2]} rank={3} height="85px"  delay={1.2}  />}
          </div>
        </motion.div>

        {/* 🏅 Giải thưởng đặc biệt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
          className="glass p-6 mb-8"
        >
          <h2 className="font-display font-bold text-xl text-slate-800 mb-5 text-center">🏅 Giải thưởng đặc biệt</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AwardCard emoji="💰" title="Giàu nhất" team={richest}
              sub={`${richest?.budget?.toFixed(0)}M`} delay={1.5} color="#34D399" />
            <AwardCard emoji="🌟" title="Phụng Sự cao nhất" team={topSip}
              sub={`${topSip?.sip} SIP`} delay={1.6} color="#38BDF8" />
            <AwardCard emoji="⚡" title="AP cao nhất" team={topAp}
              sub={`${topAp?.ap} AP`} delay={1.7} color="#FACC15" />
            <AwardCard emoji="🤝" title="Đồng minh tốt nhất" team={alliance}
              sub={`${alliance?.allianceCount ?? 0} lần liên minh`} delay={1.8} color="#A78BFA" />
            <AwardCard emoji="👑" title="Drama King" team={dramaKing}
              sub={`${dramaKing?.exposeCount ?? 0} lần bóc phốt`} delay={1.9} color="#F97316" />
            <AwardCard emoji="❄️" title="Ice Master" team={iceMaster}
              sub={`${iceMaster?.frozenCount ?? 0} lần đóng băng người`} delay={2.0} color="#38BDF8" />
            <AwardCard emoji="📢" title="Bị bóc phốt nhiều nhất" team={mostExposed}
              sub={`${mostExposed?.exposedByCount ?? 0} lần bị bóc phốt`} delay={2.1} color="#F43F5E" />
            <AwardCard emoji="🥇" title="Quán quân" team={sorted[0]}
              sub={`${sorted[0]?.score?.toFixed(0)} điểm`} delay={2.2} color="#FACC15" />
          </div>
        </motion.div>

        {/* Bảng xếp hạng đầy đủ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3 }}
          className="glass p-6 mb-8"
        >
          <h2 className="font-display font-bold text-xl text-slate-800 mb-4">📊 Bảng xếp hạng đầy đủ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-sky-100">
                  {['Rank','Team','Ngành','Ngân sách','SIP','AP','Điểm'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((team, i) => (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.4 + i * 0.06 }}
                    className={i < 3 ? 'bg-yellow-50/50' : ''}
                  >
                    <td className="py-3 px-3 font-bold text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.emoji}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{team.customName}</p>
                          <p className="text-xs text-slate-400">{team.founder}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><span className="badge badge-sky text-xs">{team.sectorShort}</span></td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">{team.budget?.toFixed(1)}M</td>
                    <td className="py-3 px-3 font-semibold text-sky-700">{team.sip}</td>
                    <td className="py-3 px-3 font-semibold text-amber-600">{team.ap}</td>
                    <td className="py-3 px-3">
                      <span className="font-display font-black text-base" style={{
                        background: 'linear-gradient(135deg,#38BDF8,#A78BFA)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>{team.score?.toFixed(1)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <button
            onClick={() => { launchConfetti(); if (!muted) playVictoryChime() }}
            className="btn-warning"
          >🎉 Ăn mừng lại!</button>
          <button onClick={() => navigate('/')} className="btn-ghost">🏠 Trang chủ</button>
          <button onClick={() => { clearSession(); navigate('/admin') }} className="btn-lavender">
            🔄 Chơi ván mới
          </button>
        </motion.div>
      </div>
    </div>
  )
}
