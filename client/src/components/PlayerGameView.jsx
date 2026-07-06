/**
 * PlayerGameView — Chọn đáp án + chiêu thức (nếu có) rồi submit một lần
 */

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { DRAMA_EVENTS, TACTICS } from '../data/founders'
import { SCORE_FORMULA } from '../data/gameGuide'
import GameGuidePanel from './GameGuidePanel'
import FreezeScreenOverlay from './FreezeScreenOverlay'

function StatChip({ icon, label, value, color, glow }) {
  return (
    <motion.div
      animate={glow ? { boxShadow: ['0 0 0px rgba(0,0,0,0)', `0 0 16px ${color}88`, '0 0 0px rgba(0,0,0,0)'] } : {}}
      transition={{ repeat: glow ? Infinity : 0, duration: 2 }}
      className="glass-sm px-3 py-3 flex flex-col items-center gap-0.5"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-display font-black text-lg" style={{ color }}>{value}</span>
      <span className="text-[10px] text-slate-400 font-medium">{label}</span>
    </motion.div>
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

function RoundTimerBar({ secondsLeft, total = 40, active }) {
  if (!active) return null
  const display = Math.min(total, Math.max(0, secondsLeft))
  const pct = Math.max(0, Math.min(100, (display / total) * 100))
  const urgent = display <= 10
  return (
    <div className="glass-sm p-3 border border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase">⏱ Thời gian chọn</span>
        <span className={`font-display font-black text-xl ${urgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
          {display}s
        </span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-amber-400'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

function shuffleOptionIds(ids) {
  const next = [...ids]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function useWhirlwindOptionOrder(options, whirlwind, eventId) {
  const naturalOrder = options.map(o => o.id)
  const [order, setOrder] = useState(naturalOrder)

  useEffect(() => {
    setOrder(options.map(o => o.id))
  }, [eventId])

  useEffect(() => {
    if (!whirlwind) return undefined

    const ids = options.map(o => o.id)
    const reshuffle = () => {
      setOrder(prev => {
        if (ids.length < 2) return ids
        let next = shuffleOptionIds(ids)
        let tries = 0
        while (tries < 6 && next.every((id, i) => id === prev[i])) {
          next = shuffleOptionIds(ids)
          tries++
        }
        return next
      })
    }

    reshuffle()
    const id = setInterval(reshuffle, 4000)
    return () => clearInterval(id)
  }, [whirlwind, eventId, options.length])

  return whirlwind ? order : naturalOrder
}

function AnswerOptionsArea({ whirlwind, fogged, children }) {
  if (!whirlwind && !fogged) {
    return <div className="mb-4">{children}</div>
  }

  return (
    <div className={`mb-4 relative ${whirlwind ? 'whirlwind-debuff-wrap' : 'fog-debuff-wrap'} ${fogged && whirlwind ? 'ring-2 ring-slate-300' : ''}`}>
      {whirlwind && fogged && (
        <span className="whirlwind-badge mr-1">🌪️🌫️ Lốc + Sương mù!</span>
      )}
      {whirlwind && !fogged && <span className="whirlwind-badge">🌪️ Lốc xoáy — đáp án đổi chỗ mỗi 4 giây!</span>}
      {!whirlwind && fogged && <span className="fog-badge">🌫️ Sương mù trôi — che ~45% đáp án!</span>}
      <div className={fogged ? 'fogged-options-inner relative z-[1]' : 'relative z-[1]'}>
        {children}
      </div>
      {fogged && (
        <div className="fog-clouds" aria-hidden="true">
          <div className="fog-cloud fog-cloud-1" />
          <div className="fog-cloud fog-cloud-2" />
          <div className="fog-cloud fog-cloud-3" />
          <div className="fog-cloud fog-cloud-4" />
          <div className="fog-cloud fog-cloud-5" />
          <div className="fog-cloud fog-cloud-6" />
          <div className="fog-veil" />
        </div>
      )}
    </div>
  )
}

function EventChoicePanel({
  event, offeredTactic, myTeam, allTeams, socket, roomCode, turnPhase,
  alreadySubmitted, isFrozenBlind, secondsLeft, roundSeconds, frozenRevealSeconds,
  whirlwind, fogged,
}) {
  const [selected, setSelected] = useState(null)
  const [invest, setInvest] = useState('')
  const [tacticAction, setTacticAction] = useState('skip')
  const [targetId, setTargetId] = useState(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localErr, setLocalErr] = useState('')

  useEffect(() => { if (turnPhase !== 'event_choice') setSubmitting(false) }, [turnPhase])
  useEffect(() => {
    const onErr = ({ message }) => { setSubmitting(false); setLocalErr(message) }
    socket.on('error:choice', onErr)
    return () => socket.off('error:choice', onErr)
  }, [socket])

  const displayOrder = useWhirlwindOptionOrder(event.options, whirlwind, event.id)

  if (alreadySubmitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="glass p-5 border-2 border-emerald-200 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-bold text-emerald-700">Đã gửi câu trả lời!</p>
        <p className="text-sm text-slate-500 mt-1">Đang chờ các team khác...</p>
      </motion.div>
    )
  }

  const option = event.options.find(o => o.id === selected)
  const needsInvest = option?.invest
  const investVal = parseInt(invest) || 0
  const minInvest = option?.investMin ?? 0
  const canUseTactic = offeredTactic && myTeam.ap >= offeredTactic.cost && !isFrozenBlind
  const others = allTeams.filter(t => t.id !== myTeam.id && t.connected)
  const optionColors = { A: 'sky', B: 'emerald', C: 'violet', D: 'orange' }
  const colorMap = {
    sky:     { border: 'border-sky-400', bg: 'bg-sky-50', text: 'text-sky-800', btn: 'bg-sky-400' },
    emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-800', btn: 'bg-emerald-400' },
    violet:  { border: 'border-violet-400', bg: 'bg-violet-50', text: 'text-violet-800', btn: 'bg-violet-400' },
    orange:  { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-800', btn: 'bg-orange-400' },
  }
  const optionById = Object.fromEntries(event.options.map(o => [o.id, o]))

  function handleSubmit() {
    if (isFrozenBlind) { setLocalErr('Chưa hết thời gian đóng băng!'); return }
    if (!selected) { setLocalErr('Chọn phương án A/B/C/D trước!'); return }
    if (needsInvest && minInvest > 0 && investVal < minInvest) {
      setLocalErr(`Phải đầu tư tối thiểu ${minInvest}M!`); return
    }
    if (needsInvest && investVal > myTeam.budget) {
      setLocalErr(`Không đủ ngân sách!`); return
    }
    if (offeredTactic && tacticAction === 'use') {
      if (!canUseTactic) { setLocalErr(`Cần ${offeredTactic.cost} AP!`); return }
      if (offeredTactic.needsTarget && !targetId) { setLocalErr('Chọn mục tiêu chiêu thức!'); return }
    }

    setSubmitting(true)
    setLocalErr('')
    socket.emit('team:submitChoice', {
      roomCode,
      teamId: myTeam.id,
      optionId: selected,
      investAmount: needsInvest ? investVal : 0,
      tacticAction: offeredTactic ? tacticAction : 'skip',
      targetId: tacticAction === 'use' ? targetId : null,
      content: tacticAction === 'use' ? content : '',
    }, (res) => {
      setSubmitting(false)
      if (res?.ok === false) setLocalErr(res.message || 'Gửi thất bại')
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass p-5 border-2 border-amber-300 relative overflow-hidden">

      <RoundTimerBar secondsLeft={secondsLeft} total={roundSeconds} active={turnPhase === 'event_choice'} />

      <div className={`mt-4 ${isFrozenBlind ? 'invisible select-none pointer-events-none' : ''}`}>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl">{event.emoji}</span>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-800">{event.label}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
          </div>
        </div>

        {offeredTactic && (
          <div className="mb-4 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl">
            <p className="text-xs font-bold text-violet-600 uppercase mb-2">🎁 Chiêu thức random cho team bạn</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{offeredTactic.emoji}</span>
              <div>
                <p className="font-bold text-violet-800">{offeredTactic.label}</p>
                <p className="text-xs text-violet-600">{offeredTactic.description}</p>
                <p className="text-xs font-bold text-amber-600 mt-1">Chi phí: {offeredTactic.cost} AP · Bạn có: {myTeam.ap} AP</p>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setTacticAction('use')} disabled={!canUseTactic}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all
                  ${tacticAction === 'use' ? 'border-violet-500 bg-violet-100 text-violet-800' : 'border-white bg-white/70 text-slate-600'}
                  ${!canUseTactic ? 'opacity-40 cursor-not-allowed' : ''}`}>
                ⚡ Dùng ({offeredTactic.cost} AP)
              </button>
              <button onClick={() => setTacticAction('skip')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all
                  ${tacticAction === 'skip' ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-white bg-white/70 text-slate-600'}`}>
                ⏭ Bỏ qua
              </button>
            </div>
            {tacticAction === 'use' && offeredTactic.needsTarget && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {others.map(t => (
                  <button key={t.id} onClick={() => setTargetId(t.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs
                      ${targetId === t.id ? 'border-orange-400 bg-orange-50' : 'border-white bg-white/60'}`}>
                    <span>{t.emoji}</span><span className="font-semibold truncate">{t.customName}</span>
                  </button>
                ))}
              </div>
            )}
            {tacticAction === 'use' && offeredTactic.needsContent && (
              <input className="input text-sm" placeholder="Nội dung bóc phốt..."
                value={content} onChange={e => setContent(e.target.value)} />
            )}
          </div>
        )}

        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Chọn phương án</p>
        <AnswerOptionsArea whirlwind={whirlwind} fogged={fogged}>
          <div className="grid grid-cols-2 gap-2.5 whirlwind-options-grid">
            {displayOrder.map(optId => {
              const opt = optionById[optId]
              const c = colorMap[optionColors[opt.id]]
              const isSel = selected === opt.id
              const { base, invest: needInv } = opt
              return (
                <motion.button key={opt.id} layout whileTap={{ scale: 0.97 }}
                  transition={{ layout: { type: 'spring', stiffness: 380, damping: 28 } }}
                  onClick={() => { setSelected(opt.id); setInvest(''); setLocalErr('') }}
                  className={`text-left p-3 rounded-2xl border-2 transition-colors w-full
                    ${isSel ? `${c.border} ${c.bg}` : 'border-white/70 bg-white/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center ${c.btn}`}>{opt.id}</span>
                    <span className={`font-bold text-sm ${isSel ? c.text : 'text-slate-700'}`}>{opt.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{opt.desc}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {base.budget !== 0 && <span className="text-[10px] px-1 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">{base.budget > 0 ? '+' : ''}{base.budget}M</span>}
                    {base.sip !== 0 && <span className="text-[10px] px-1 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">{base.sip > 0 ? '+' : ''}{base.sip} SIP</span>}
                    {needInv && <span className="text-[10px] px-1 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">+ đầu tư</span>}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </AnswerOptionsArea>

        {option && needsInvest && (
          <div className="glass-sm p-3 border border-amber-200 mb-4">
            <label className="text-sm font-semibold text-slate-700">💸 {option.investLabel ?? 'Đầu tư (M)'}</label>
            <input type="number" min={option.investMin ?? 0} max={Math.floor(myTeam.budget)}
              className="input w-full font-bold text-center mt-2" value={invest}
              onChange={e => setInvest(e.target.value)} placeholder={`0–${Math.floor(myTeam.budget)}M`} />
          </div>
        )}

        {localErr && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">⚠️ {localErr}</p>}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
          disabled={submitting || !selected || isFrozenBlind}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-40">
          {submitting ? '⏳ Đang gửi...' : '✅ Gửi câu trả lời'}
        </motion.button>
      </div>
    </motion.div>
  )
}

function MiniLB({ teams, myId }) {
  return (
    <div className="flex flex-col gap-1">
      {[...teams].sort((a, b) => b.score - a.score).map((t) => (
        <div key={t.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${t.id === myId ? 'bg-sky-50 border border-sky-200' : 'bg-white/40'}`}>
          <span>{t.emoji}</span>
          <span className="flex-1 truncate font-semibold">{t.customName}</span>
          <span className="font-bold text-violet-700">{t.score?.toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PlayerGameView({ room, myTeam, roomCode, socket }) {
  const prevScoreRef = useRef(myTeam?.score)
  const scoreUp = myTeam && myTeam.score > (prevScoreRef.current ?? 0)
  const [choiceError, setChoiceError] = useState('')

  const roundSeconds = room.roundSeconds ?? 40
  const frozenRevealSeconds = room.frozenRevealSeconds ?? 5
  const inChoice = room.turnPhase === 'event_choice'
  const secondsLeft = useRoundCountdown(room, inChoice)

  useEffect(() => { prevScoreRef.current = myTeam?.score }, [myTeam?.score])
  useEffect(() => {
    socket.on('error:choice', ({ message }) => { setChoiceError(message); setTimeout(() => setChoiceError(''), 4000) })
    return () => socket.off('error:choice')
  }, [socket])

  if (!myTeam) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="glass p-8 text-center"><p className="text-3xl mb-3">😕</p><p>Không tìm thấy team</p></div>
    </div>
  )

  const code = room.roomCode ?? roomCode
  const currentEvent = DRAMA_EVENTS.find(e => e.id === room.currentEventId)
  const myTacticId = room.tacticOffers?.[myTeam.id]
  const offeredTactic = myTacticId ? TACTICS[myTacticId] : null
  const mySubmission = room.eventSubmissions?.[myTeam.id]
  const canPlay = myTeam.connected
  const isFrozenBlind = myTeam.frozen && secondsLeft > frozenRevealSeconds
  const hasWhirlwind = !!myTeam.whirlwind && !isFrozenBlind
  const hasFog = !!myTeam.fogged && !isFrozenBlind

  return (
    <div className="page-bg min-h-screen px-4 py-6">
      <FreezeScreenOverlay
        active={inChoice && isFrozenBlind}
        secondsLeft={secondsLeft}
        revealAt={frozenRevealSeconds}
      />
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <motion.div className="glass p-5 relative overflow-hidden" style={{ borderTop: `3px solid ${myTeam.color}` }}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{myTeam.emoji}</span>
            <div>
              <h1 className="font-display font-bold text-2xl">{myTeam.customName}</h1>
              <p className="text-slate-500 text-sm">{myTeam.sector}</p>
              {inChoice && canPlay && !mySubmission && (
                <span className="badge badge-orange text-xs mt-2">
                  {myTeam.frozen
                    ? (isFrozenBlind ? '❄️ Bị che — chờ hiện câu hỏi' : '❄️ Chọn nhanh!')
                    : hasWhirlwind && hasFog ? '🌪️🌫️ Lốc + Sương mù!'
                    : hasWhirlwind ? '🌪️ Đáp án đổi chỗ mỗi 4s!'
                    : hasFog ? '🌫️ Đáp án bị sương mù!'
                    : offeredTactic ? '🎁 Chọn đáp án + chiêu thức' : '🎯 Chọn đáp án'}
                </span>
              )}
              {mySubmission && <span className="badge badge-mint text-xs mt-2">✅ Đã gửi</span>}
              {room.turnPhase === 'idle' && <span className="badge badge-sky text-xs mt-2">⏳ Chờ Admin random</span>}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-2">
          <StatChip icon="💰" label="Ngân sách" value={`${myTeam.budget?.toFixed(0)}M`} color="#059669" />
          <StatChip icon="🌟" label="Phụng Sự" value={myTeam.sip} color="#0284C7" />
          <StatChip icon="⚡" label="AP" value={myTeam.ap} color="#D97706" glow={!!offeredTactic && inChoice} />
          <StatChip icon="🏆" label="Điểm" value={myTeam.score?.toFixed(0)} color="#7C3AED" glow={scoreUp} />
        </div>

        {inChoice && currentEvent && canPlay && (
          <EventChoicePanel
            event={currentEvent}
            offeredTactic={offeredTactic}
            myTeam={myTeam}
            allTeams={room.teams}
            socket={socket}
            roomCode={code}
            turnPhase={room.turnPhase}
            alreadySubmitted={!!mySubmission}
            isFrozenBlind={isFrozenBlind}
            secondsLeft={secondsLeft}
            roundSeconds={roundSeconds}
            frozenRevealSeconds={frozenRevealSeconds}
            whirlwind={hasWhirlwind}
            fogged={hasFog}
          />
        )}

        {room.turnPhase === 'done' && mySubmission && (
          <div className="glass-sm p-4 border-2 border-violet-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Kết quả vòng vừa rồi</p>
            <p className="text-sm text-slate-600">{mySubmission.summary}</p>
          </div>
        )}

        {choiceError && (
          <div className="px-4 py-3 bg-red-500 text-white rounded-xl text-sm text-center">⚠️ {choiceError}</div>
        )}

        <div className="glass-sm px-4 py-3 text-xs text-center text-slate-500">
          {SCORE_FORMULA} = <strong className="text-violet-700">{myTeam.score?.toFixed(0)}</strong>
        </div>

        <GameGuidePanel defaultOpen={false} compact />
        <div className="glass p-4">
          <h3 className="font-semibold text-sm mb-3">📊 Bảng xếp hạng</h3>
          <MiniLB teams={room.teams} myId={myTeam.id} />
        </div>
      </div>
    </div>
  )
}

