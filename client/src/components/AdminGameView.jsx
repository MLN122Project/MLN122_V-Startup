/**
 * AdminGameView — Simultaneous event mode
 * Admin random sự kiện → tất cả team chọn cùng lúc → quan sát kết quả → chiêu thức
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DRAMA_EVENTS, TACTICS, TACTICS_LIST } from '../data/founders'
import SectorImage from './SectorImage'
import EventImage from './EventImage'

const PHASE_LABEL = {
  idle:         { text: '🎲 Chờ random sự kiện',     color: 'badge-sky' },
  event_choice: { text: '❓ Tất cả team đang chọn',  color: 'badge-orange' },
  done:         { text: '✅ Kết thúc vòng',           color: 'badge-mint' },
}

function EventBoard({ usedIds, currentId }) {
  return (
    <div className="glass p-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        🎯 Bảng sự kiện ({usedIds.length}/{DRAMA_EVENTS.length})
      </p>
      <div className="grid grid-cols-4 gap-2">
        {DRAMA_EVENTS.map(ev => {
          const used    = usedIds.includes(ev.id)
          const current = ev.id === currentId
          return (
            <motion.div
              key={ev.id}
              animate={current ? { scale: [1, 1.06, 1], boxShadow: ['0 0 0px rgba(0,0,0,0)', `0 0 18px ${ev.color}99`, '0 0 0px rgba(0,0,0,0)'] } : {}}
              transition={{ repeat: current ? Infinity : 0, duration: 1.4 }}
              className={`relative rounded-xl p-2.5 text-center border-2 transition-all select-none
                ${current ? 'border-violet-400 bg-violet-50' : used ? 'border-slate-200 bg-slate-50 opacity-50' : 'border-white/70 bg-white/60'}`}
            >
              <div className="flex justify-center mb-1.5">
                <EventImage event={ev} className="w-14 h-14" />
              </div>
              <p className="text-[10px] font-semibold text-slate-600 leading-tight line-clamp-2">{ev.label.replace(/[^\w\sÀ-ỹ]/g, '').trim()}</p>
              {used && !current && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
                  <span className="text-lg font-bold text-slate-300">✓</span>
                </div>
              )}
              {current && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 animate-ping" />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TeamCard({ team, submission, isFrozenBlind }) {
  return (
    <div className={`glass-sm p-3 relative overflow-hidden
      ${team.frozen ? 'bg-sky-50/80 ring-2 ring-sky-300' : ''}
      ${team.bankrupt ? 'ring-2 ring-red-300' : ''}
      ${!team.connected ? 'opacity-50' : ''}`}
    >
      {team.frozen && <div className="absolute inset-0 rounded-xl pointer-events-none"><div className="frozen-overlay" /></div>}
      <div className="flex items-center gap-2 mb-2">
        <SectorImage team={team} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{team.customName}</p>
          <p className="text-[10px] text-slate-400">{team.sectorShort}</p>
        </div>
        {submission
          ? <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
              ✓ {submission.optionId}{submission.tacticUsed ? ' ⚡' : submission.tacticSkipped ? ' ⏭' : ''}
            </span>
          : team.connected
            ? team.frozen && isFrozenBlind
              ? <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-bold">❄️ Che</span>
              : team.whirlwind && team.fogged
                ? <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">🌪️🌫️</span>
                : team.whirlwind
                  ? <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">🌪️</span>
                  : team.fogged
                    ? <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold animate-pulse">🌫️</span>
                    : <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">⏳</span>
            : <span className="text-[10px] text-slate-400">⚫</span>
        }
      </div>
      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
        <div className="bg-white/60 rounded-lg py-1"><p className="text-slate-400">💰</p><p className="font-bold">{team.budget?.toFixed(0)}M</p></div>
        <div className="bg-white/60 rounded-lg py-1"><p className="text-slate-400">🌟</p><p className="font-bold text-sky-600">{team.sip}</p></div>
        <div className="bg-white/60 rounded-lg py-1"><p className="text-slate-400">⚡</p><p className="font-bold text-amber-600">{team.ap}</p></div>
        <div className="bg-white/60 rounded-lg py-1"><p className="text-slate-400">🏆</p><p className="font-bold text-violet-600">{team.score?.toFixed(0)}</p></div>
      </div>
    </div>
  )
}

function EventQuestionPanel({ event }) {
  if (!event) return null
  return (
    <div className="mb-4">
      <div className="flex items-start gap-3 mb-4">
        <EventImage event={event} className="w-24 h-24" />
        <div>
          <p className="font-display font-bold text-lg text-slate-800">{event.label}</p>
          <p className="text-sm text-slate-500 mt-1">{event.description}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {event.options.map(opt => (
          <div key={opt.id} className="glass-sm p-3 border border-white/80">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-violet-400 text-white text-xs font-black flex items-center justify-center">{opt.id}</span>
              <span className="font-semibold text-sm text-slate-800">{opt.label}</span>
            </div>
            <p className="text-xs text-slate-500">{opt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubmissionsTable({ event, submissions, teams }) {
  const subs = Object.values(submissions ?? {})
  if (!subs.length) {
    return <p className="text-center text-sm text-slate-400 py-4">Chưa có team nào gửi lựa chọn...</p>
  }
  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">📊 Kết quả lựa chọn ({subs.length})</p>
      {subs.map(sub => {
        const opt = event?.options?.find(o => o.id === sub.optionId)
        return (
          <div key={sub.teamId} className="glass-sm p-3 border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 mb-1">
              <span>{sub.teamEmoji}</span>
              <span className="font-bold text-sm text-slate-800">{sub.teamName}</span>
              <span className="ml-auto text-xs font-black bg-violet-500 text-white px-2 py-0.5 rounded-full">{sub.optionId}</span>
            </div>
            <p className="text-xs text-slate-600">{opt?.label}{sub.invest > 0 ? ` · đầu tư ${sub.invest}M` : ''}</p>
            <p className="text-[10px] text-slate-400 mt-1">{sub.summary}</p>
          </div>
        )
      })}
    </div>
  )
}

function AdminForceChoice({ event, teams, submissions, onForce }) {
  const [teamId, setTeamId] = useState('')
  const [selOpt, setSelOpt] = useState(null)
  const [inv, setInv]       = useState(0)
  const pending = teams.filter(t => t.connected && !submissions?.[t.id])
  const team    = teams.find(t => t.id === teamId)
  const opt     = event?.options?.find(o => o.id === selOpt)

  if (!event || pending.length === 0) return null

  return (
    <details className="mt-4">
      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">⚙️ Admin chọn thay team chưa gửi</summary>
      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <select className="input text-sm mb-3" value={teamId} onChange={e => { setTeamId(e.target.value); setSelOpt(null) }}>
          <option value="">Chọn team...</option>
          {pending.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.customName}</option>)}
        </select>
        {teamId && (
          <>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {event.options.map(o => (
                <button key={o.id} onClick={() => setSelOpt(o.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold ${selOpt === o.id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white'}`}>
                  {o.id}
                </button>
              ))}
            </div>
            {opt?.invest && (
              <input type="number" min={0} max={team?.budget ?? 100} className="input text-sm mb-3"
                placeholder="Đầu tư (M)" value={inv} onChange={e => setInv(Number(e.target.value))} />
            )}
            <button onClick={() => selOpt && onForce(teamId, selOpt, opt?.invest ? inv : 0)}
              disabled={!selOpt} className="btn-warning w-full py-2 text-sm disabled:opacity-40">
              Áp dụng thay {team?.customName}
            </button>
          </>
        )}
      </div>
    </details>
  )
}

function LiveFeed({ feed }) {
  if (!feed?.length) return <div className="text-center py-6 text-slate-400 text-xs">Chưa có drama nào... 😇</div>
  const typeStyle = { expose: 'bg-red-50 border-red-200', alliance: 'bg-emerald-50 border-emerald-200' }
  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 260 }}>
      {feed.map(f => (
        <div key={f.id ?? f.ts} className={`px-3 py-2.5 rounded-xl border text-xs ${typeStyle[f.type] || 'bg-white/60 border-white/70'}`}>
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-slate-700">
            <span>{f.fromEmoji}</span><span>{f.from}</span>
            <span className="text-slate-400">{f.type === 'expose' ? '📢 bóc phốt' : '🤝 liên minh'}</span>
            <span>{f.toEmoji}</span><span>{f.to}</span>
          </div>
          {f.content && <p className="text-slate-600 italic">"{f.content}"</p>}
        </div>
      ))}
    </div>
  )
}

function LBRow({ t, rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${rank <= 3 ? 'bg-yellow-50/60' : ''}`}>
      <span className="w-6 text-center font-bold">{medals[rank] ?? rank}</span>
      <SectorImage team={{ id: t.teamId, sectorShort: t.sectorShort, emoji: t.emoji }} size="sm" className="w-7 h-7" />
      <span className="flex-1 truncate font-semibold">{t.teamName}</span>
      <span className="text-slate-400">{t.budget?.toFixed(0)}M</span>
      <span className="text-amber-600">⚡{t.ap}</span>
      <span className="font-black text-violet-600">{t.score?.toFixed(0)}</span>
    </div>
  )
}

function LogEntry({ log }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cursor-pointer border-b border-white/50 pb-2 mb-1" onClick={() => setOpen(o => !o)}>
      <div className="flex items-center gap-2 text-xs">
        <span>{log.eventEmoji || log.teamEmoji || '📋'}</span>
        <p className="flex-1 truncate text-slate-600">{log.message || log.summary}</p>
        <span className="text-slate-300">{open ? '▲' : '▼'}</span>
      </div>
      {open && log.logs && (
        <div className="pl-6 pt-1 space-y-0.5">
          {log.logs.map((line, i) => <p key={i} className="text-[10px] text-slate-400">{line}</p>)}
        </div>
      )}
    </div>
  )
}

function RoundTimerAdmin({ room }) {
  const total = room?.roundSeconds ?? 40
  const active = room?.turnPhase === 'event_choice'
  const secondsLeft = useRoundCountdown(room, active)
  if (!active) return null
  const display = Math.min(total, Math.max(0, secondsLeft))
  const urgent = display <= 10
  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
      <span className="text-sm font-semibold text-amber-800">⏱ Thời gian còn lại</span>
      <span className={`font-display font-black text-2xl ${urgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
        {display}s
      </span>
    </div>
  )
}

function useRoundCountdown(room, active) {
  const roundSeconds = room?.roundSeconds ?? 40
  const roundEndsAt = room?.roundEndsAt
  const roundStartedAt = room?.roundStartedAt
  const serverLeft = room?.roundSecondsLeft
  const eventId = room?.currentEventId
  const [secondsLeft, setSecondsLeft] = useState(roundSeconds)

  useEffect(() => {
    if (!active) {
      setSecondsLeft(0)
      return
    }
    const compute = () => {
      if (typeof serverLeft === 'number' && serverLeft >= 0) return serverLeft
      if (roundEndsAt) return Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000))
      if (roundStartedAt) {
        return Math.max(0, Math.ceil((roundStartedAt + roundSeconds * 1000 - Date.now()) / 1000))
      }
      return roundSeconds
    }
    setSecondsLeft(compute())
    const id = setInterval(() => setSecondsLeft(compute()), 250)
    return () => clearInterval(id)
  }, [active, roundEndsAt, roundStartedAt, serverLeft, roundSeconds, eventId])

  return secondsLeft
}

function TacticOffersPanel({ tacticOffers, teams }) {
  const entries = Object.entries(tacticOffers ?? {})
  if (!entries.length) {
    return <p className="text-xs text-slate-400 text-center mb-3">Vòng này không team nào được random chiêu</p>
  }
  return (
    <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-xl">
      <p className="text-xs font-bold text-violet-600 uppercase mb-2 text-center">⚡ Chiêu thức random (mỗi team riêng)</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {entries.map(([teamId, tacticId]) => {
          const team = teams.find(t => t.id === teamId)
          const tactic = TACTICS[tacticId]
          if (!team || !tactic) return null
          return (
            <div key={teamId} className="flex items-center gap-2 p-2 bg-white/70 rounded-xl text-sm">
              <span>{tactic.emoji}</span>
              <span className="font-semibold text-violet-800">{tactic.label}</span>
              <span className="text-slate-400">→</span>
              <span>{team.emoji}</span>
              <span className="font-bold text-orange-700 truncate">{team.customName}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-violet-500 text-center mt-2">Chỉ team được gán mới thấy chiêu trên màn hình player</p>
    </div>
  )
}

export default function AdminGameView({ room, roomCode, socket }) {
  const [tab, setTab] = useState('board')
  const code = room.roomCode ?? roomCode
  const currentEvent = DRAMA_EVENTS.find(e => e.id === room.currentEventId)
  const phaseInfo = PHASE_LABEL[room.turnPhase] || PHASE_LABEL.idle
  const eventsLeft = 8 - (room.usedEventIds?.length ?? 0)
  const submissions = room.eventSubmissions ?? {}
  const participating = room.teams.filter(t => t.connected)
  const submittedCount = Object.keys(submissions).length
  const frozenReveal = room.frozenRevealSeconds ?? 5
  const inChoice = room.turnPhase === 'event_choice'
  const secondsLeft = useRoundCountdown(room, inChoice)
  const isTeamFrozenBlind = (team) => team.frozen && secondsLeft > frozenReveal

  return (
    <div className="page-bg min-h-screen">
      <div className="glass border-b border-white/60 sticky top-0 z-40 px-4">
        <div className="max-w-7xl mx-auto h-14 flex items-center gap-3 overflow-x-auto">
          <span className="font-display font-black gradient-text">V-Startup</span>
          <span className="badge badge-sky">🎭 Cùng chơi</span>
          <span className={`badge ${phaseInfo.color}`}>{phaseInfo.text}</span>
          <span className="badge badge-orange">🎯 {eventsLeft} sự kiện còn</span>
          <div className="flex-1" />
          <span className="text-slate-400 text-xs font-mono">{code}</span>
          <button onClick={() => { if (confirm('Kết thúc game?')) socket.emit('admin:endGame', { roomCode: code }) }}
            className="btn-danger px-3 py-1.5 text-xs">🏁 Kết thúc</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4">
        <div className="grid xl:grid-cols-[1fr_300px] gap-4">
          <div className="flex flex-col gap-4">
            <EventBoard usedIds={room.usedEventIds ?? []} currentId={room.currentEventId} />

            <div className="glass p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-base">👥 Trạng thái team</h2>
                <span className="text-xs text-slate-400">{participating.length} tham gia</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {room.teams.map(team => (
                  <TeamCard key={team.id} team={team} submission={submissions[team.id]}
                    isFrozenBlind={isTeamFrozenBlind(team)} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {room.turnPhase === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass p-8 text-center">
                  <p className="text-slate-600 mb-4">Random sự kiện — <strong>tất cả team online</strong> có <strong>40 giây</strong> chọn cùng lúc</p>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => socket.emit('admin:rollEvent', { roomCode: code })}
                    className="btn-warning text-lg px-10 py-4">
                    🎲 Random sự kiện!
                  </motion.button>
                </motion.div>
              )}

              {room.turnPhase === 'event_choice' && currentEvent && (
                <motion.div key="choice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass p-5 border-2 border-amber-200">
                  <EventQuestionPanel event={currentEvent} />
                  <RoundTimerAdmin room={room} />
                  <TacticOffersPanel tacticOffers={room.tacticOffers} teams={room.teams} />
                  <div className="flex items-center justify-between py-3 border-t border-amber-100">
                    <p className="text-sm font-semibold text-slate-700">
                      {submittedCount}/{participating.length} team đã gửi
                    </p>
                    {submittedCount > 0 && submittedCount < participating.length && (
                      <button onClick={() => socket.emit('admin:advancePhase', { roomCode: code })}
                        className="btn-ghost text-xs py-1.5">
                        ⏩ Chuyển pha (team chậm)
                      </button>
                    )}
                  </div>
                  <SubmissionsTable event={currentEvent} submissions={submissions} teams={room.teams} />
                  <AdminForceChoice event={currentEvent} teams={room.teams} submissions={submissions}
                    onForce={(tid, opt, inv) => socket.emit('admin:forceChoice', { roomCode: code, teamId: tid, optionId: opt, investAmount: inv })} />
                </motion.div>
              )}

              {room.turnPhase === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass p-6 text-center">
                  <p className="font-bold text-slate-700 mb-2">✅ Vòng sự kiện hoàn tất!</p>
                  <SubmissionsTable event={currentEvent} submissions={submissions} teams={room.teams} />
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => socket.emit('admin:nextEvent', { roomCode: code })}
                    className="btn-primary text-lg px-10 py-4 mt-4">
                    ▶ Sự kiện tiếp theo
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <button onClick={() => { if (confirm('Reset game?')) socket.emit('admin:resetGame', { roomCode: code }) }}
                className="btn-danger px-4 py-2 text-sm">🔄 Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass p-4">
              <h2 className="font-bold text-sm mb-3">🏆 Bảng xếp hạng</h2>
              {(room.leaderboard ?? []).map(t => <LBRow key={t.teamId} t={t} rank={t.rank} />)}
            </div>
            <div className="glass p-4">
              <div className="flex gap-2 mb-3">
                {[['board', '📜 Log'], ['feed', '📢 Feed']].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-semibold ${tab === id ? 'bg-sky-100 text-sky-700' : 'text-slate-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {tab === 'board' && (
                <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                  {room.gameLogs?.map((log, i) => <LogEntry key={i} log={log} />)}
                </div>
              )}
              {tab === 'feed' && <LiveFeed feed={room.liveFeed} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
