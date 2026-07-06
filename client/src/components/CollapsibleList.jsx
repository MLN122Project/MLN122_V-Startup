import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CollapsibleList({
  items,
  visibleCount = 3,
  renderItem,
  className = '',
  expandLabel,
  collapseLabel,
}) {
  const [open, setOpen] = useState(false)
  const hasMore = items.length > visibleCount
  const shown   = open ? items : items.slice(0, visibleCount)

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        {shown.map((item, i) => renderItem(item, i))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="mt-3 w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-800 py-2 rounded-xl bg-sky-50/60 border border-sky-100 transition-colors"
        >
          {open
            ? (collapseLabel ?? `▲ Thu gọn`)
            : (expandLabel ?? `▼ Xem thêm ${items.length - visibleCount} mục`)}
        </button>
      )}
    </div>
  )
}

/** Bảng có thể thu gọn — chỉ hiện N dòng đầu */
export function CollapsibleTable({ rows, headers, visibleCount = 3, className = '' }) {
  const [open, setOpen] = useState(false)
  const hasMore = rows.length > visibleCount
  const shown   = open ? rows : rows.slice(0, visibleCount)

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-sky-100">
              {headers.map(h => (
                <th key={h} className="text-left py-2 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/30' : ''}>
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 text-slate-600 text-xs">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button type="button" onClick={() => setOpen(o => !o)}
          className="mt-2 w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-800 py-2 rounded-xl bg-sky-50/60 border border-sky-100"
        >
          {open ? '▲ Thu gọn bảng' : `▼ Xem thêm ${rows.length - visibleCount} dòng`}
        </button>
      )}
    </div>
  )
}

/** Section accordion cho Home */
export function GuideAccordion({ sections }) {
  const [openId, setOpenId] = useState(sections[0]?.id ?? null)

  return (
    <div className="flex flex-col gap-3">
      {sections.map(sec => {
        const isOpen = openId === sec.id
        return (
          <div key={sec.id} className="glass overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : sec.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/40 transition-colors"
            >
              <span className="text-2xl">{sec.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-slate-800">{sec.title}</p>
                {sec.sub && !isOpen && <p className="text-xs text-slate-400 truncate mt-0.5">{sec.sub}</p>}
              </div>
              <span className="text-slate-400 text-sm flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-white/60 pt-4">
                    {sec.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
