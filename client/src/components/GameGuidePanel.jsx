/**
 * GameGuidePanel — Hướng dẫn ngắn gọn trong game (WaitingRoom / PlayerGameView).
 * Dùng chung data với Home để luôn khớp nhau.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CollapsibleList from './CollapsibleList'
import {
  SCORE_FORMULA, METRICS, GAME_FLOW, TACTICS_GUIDE, RULES, SECTORS,
} from '../data/gameGuide'

export default function GameGuidePanel({ defaultOpen = false, compact = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="glass-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/40 transition-colors"
      >
        <span className="font-display font-semibold text-sm text-slate-700">📖 Hướng dẫn chơi</span>
        <span className="text-slate-400 text-xs">{open ? '▲ Thu gọn' : '▼ Mở ra'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/60"
          >
            <div className="px-4 py-4 flex flex-col gap-4 text-sm">

              {/* Công thức điểm — luôn hiện */}
              <div className="bg-violet-50/80 border border-violet-200 rounded-xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wide mb-1">Công thức điểm</p>
                <p className="font-display font-bold text-violet-800 text-sm">{SCORE_FORMULA}</p>
              </div>

              {/* 3 chỉ số — hiện 3, không cần collapse vì đúng 3 */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">3 chỉ số</p>
                <div className="grid grid-cols-3 gap-2">
                  {METRICS.map(m => (
                    <div key={m.name} className="bg-white/50 rounded-xl p-2.5 text-center border border-white/70">
                      <div className="text-xl">{m.emoji}</div>
                      <p className="font-bold text-xs text-slate-700 mt-0.5">{m.short}</p>
                      {!compact && <p className="text-[10px] text-slate-400 mt-1 leading-snug">{m.desc.split('.')[0]}.</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Luồng chơi — 3 bước đầu, còn lại collapse */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Luồng chơi</p>
                <CollapsibleList
                  items={GAME_FLOW}
                  visibleCount={3}
                  renderItem={(step, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-slate-700 text-xs">{step.label}</p>
                        <p className="text-[10px] text-slate-400">{step.sub}</p>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Chiêu thức — 3 đầu, còn lại collapse */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Chiêu thức (dùng AP)</p>
                <CollapsibleList
                  items={TACTICS_GUIDE}
                  visibleCount={3}
                  expandLabel="▼ Xem thêm chiêu thức"
                  renderItem={(t, i) => (
                    <div key={i} className="flex gap-2 items-start bg-white/40 rounded-lg px-2.5 py-2">
                      <span className="text-lg">{t.emoji}</span>
                      <div>
                        <p className="font-semibold text-xs text-slate-700">{t.name} <span className="text-amber-600">({t.cost})</span></p>
                        <p className="text-[10px] text-slate-400">{t.desc}</p>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Luật — 3 đầu */}
              {!compact && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Luật cơ bản</p>
                  <CollapsibleList
                    items={RULES}
                    visibleCount={3}
                    renderItem={(r, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span>{r.icon}</span>
                        <div>
                          <p className="font-semibold text-xs text-slate-700">{r.title}</p>
                          <p className="text-[10px] text-slate-400">{r.desc}</p>
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Bảng 8 ngành — hiện 3, thu gọn còn lại */
export function SectorGuideTable() {
  return (
    <CollapsibleList
      items={SECTORS}
      visibleCount={3}
      expandLabel="▼ Xem thêm ngành & perk"
      renderItem={(s, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/50 last:border-0">
          <span className="text-xl">{s.emoji}</span>
          <span className="font-semibold text-sm text-slate-700 w-24">{s.name}</span>
          <span className="text-xs text-slate-500 flex-1">{s.perk}</span>
        </div>
      )}
    />
  )
}
