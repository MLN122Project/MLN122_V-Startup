import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CollapsibleList, { CollapsibleTable, GuideAccordion } from '../components/CollapsibleList'
import { SectorGuideTable } from '../components/GameGuidePanel'
import {
  SCORE_FORMULA, METRICS, GAME_FLOW, TACTICS_GUIDE, RULES, EXAMPLE_TURN,
} from '../data/gameGuide'

const FV = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { show: { transition: { staggerChildren: 0.12 } } }
const viewOpts = { once: true, margin: '-60px' }

// ─── Reusable section wrapper ────────────────────────────────────────────────
function Section({ children, className = '' }) {
  return (
    <motion.section
      variants={stagger} initial="hidden" whileInView="show" viewport={viewOpts}
      className={`max-w-5xl mx-auto px-6 py-16 ${className}`}
    >
      {children}
    </motion.section>
  )
}
function SectionTitle({ icon, title, sub }) {
  return (
    <motion.div variants={FV} className="text-center mb-12">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="font-display text-3xl font-bold text-slate-800">{title}</h2>
      {sub && <p className="text-slate-500 mt-2 max-w-xl mx-auto">{sub}</p>}
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [showStartModal, setShowStartModal] = useState(false)

  return (
    <div className="page-bg">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
        {/* BG blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/50 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-7xl mb-6 inline-block"
          >🚀</motion.div>

          <h1 className="font-display font-black text-6xl md:text-7xl leading-tight mb-4">
            <span className="gradient-text">V-Startup</span>
          </h1>
          <p className="font-display font-bold text-2xl text-slate-600 mb-3">
            Đường Đua Kiến Tạo
          </p>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10">
            Web game realtime mô phỏng khởi nghiệp — phiên bản Drama &amp; Tương tác.
            Chọn ngành, đối mặt sự kiện, đầu tư chiến lược, dùng chiêu thức. FPTU · MLN122.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-base px-8 py-4 text-lg"
            >
              📖 Xem hướng dẫn
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowStartModal(true)}
              className="btn-ghost text-base px-8 py-4 text-lg"
            >
              🎮 Bắt đầu ngay
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="absolute bottom-10 text-slate-400 text-sm flex flex-col items-center gap-1"
        >
          <span>Cuộn xuống</span>
          <span className="text-xl">↓</span>
        </motion.div>
      </section>

      {/* ── GUIDE (Drama edition — khớp với màn game) ─────────────────────── */}
      <div id="guide">
        <Section>
          <SectionTitle icon="📖" title="Hướng dẫn chơi"
            sub="Nội dung khớp với màn hình game — bấm từng mục để xem chi tiết" />
          <GuideAccordion sections={[
            {
              id: 'goal',
              icon: '🎯',
              title: 'Mục tiêu game',
              sub: 'Cân bằng lợi nhuận và phụng sự xã hội',
              content: (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-sm p-5">
                    <div className="text-3xl mb-2">💰</div>
                    <h3 className="font-bold text-slate-800 mb-2">Kiếm ngân sách</h3>
                    <p className="text-sm text-slate-500">Mỗi sự kiện drama có 4 phương án A/B/C/D. Một số lựa chọn cho phép nhập số tiền đầu tư để tăng lợi nhuận.</p>
                  </div>
                  <div className="glass-sm p-5">
                    <div className="text-3xl mb-2">🌟</div>
                    <h3 className="font-bold text-slate-800 mb-2">Phụng sự &amp; AP</h3>
                    <p className="text-sm text-slate-500">Tích SIP qua lựa chọn xã hội. Tích AP để dùng chiêu thức (Đóng băng, Bóc phốt, Ăn trộm, Liên minh, Lốc xoáy, Sương mù).</p>
                  </div>
                  <div className="md:col-span-2 bg-violet-50/80 border border-violet-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-violet-500 font-semibold uppercase mb-1">Công thức điểm (giống màn game)</p>
                    <p className="font-display font-bold text-lg text-violet-800">{SCORE_FORMULA}</p>
                  </div>
                </div>
              ),
            },
            {
              id: 'flow',
              icon: '⚡',
              title: 'Quy trình một ván',
              sub: 'Admin random sự kiện · Player tự chọn phương án',
              content: (
                <CollapsibleList
                  items={GAME_FLOW}
                  visibleCount={3}
                  renderItem={(step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-violet-400 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.sub}</p>
                      </div>
                    </div>
                  )}
                />
              ),
            },
            {
              id: 'metrics',
              icon: '📊',
              title: '3 chỉ số quyết định',
              sub: 'Budget · SIP · AP',
              content: (
                <div className="grid sm:grid-cols-3 gap-4">
                  {METRICS.map(m => (
                    <div key={m.name} className="glass-sm p-4" style={{ borderTop: `3px solid ${m.color}` }}>
                      <div className="text-2xl mb-2">{m.emoji}</div>
                      <h3 className="font-bold text-slate-800">{m.short}</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-2">{m.desc}</p>
                      <p className="text-[10px] bg-white/60 rounded-lg px-2 py-1.5 text-slate-600"><strong>VD:</strong> {m.example}</p>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'tactics',
              icon: '⚔️',
              title: 'Chiêu thức tương tác',
              sub: 'Dùng AP sau mỗi lượt chọn sự kiện',
              content: (
                <CollapsibleList
                  items={TACTICS_GUIDE}
                  visibleCount={3}
                  renderItem={(t, i) => (
                    <div key={i} className="glass-sm p-4 flex gap-3 items-start">
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{t.name} <span className="text-amber-600 text-sm">({t.cost})</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  )}
                />
              ),
            },
            {
              id: 'sectors',
              icon: '🏭',
              title: '8 ngành & perk',
              sub: 'Chọn ngành khi tham gia /join',
              content: <SectorGuideTable />,
            },
            {
              id: 'example',
              icon: '📝',
              title: 'Ví dụ một lượt chơi',
              sub: 'Team EdTech · Gói tín dụng Nhà nước 🏛️',
              content: (
                <CollapsibleTable
                  headers={['Bước', 'Hành động', 'Chi tiết', 'Ghi chú']}
                  rows={EXAMPLE_TURN}
                  visibleCount={3}
                />
              ),
            },
            {
              id: 'rules',
              icon: '📋',
              title: 'Luật chơi',
              sub: 'Đơn giản · Rõ ràng · Fair',
              content: (
                <CollapsibleList
                  items={RULES}
                  visibleCount={3}
                  renderItem={(r, i) => (
                    <div key={i} className="glass-sm p-4 flex gap-3 items-start">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                        <p className="text-xs text-slate-500">{r.desc}</p>
                      </div>
                    </div>
                  )}
                />
              ),
            },
            {
              id: 'meaning',
              icon: '💡',
              title: 'Ý nghĩa kinh tế chính trị',
              sub: 'KT thị trường định hướng XHCN',
              content: (
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { emoji: '📈', title: 'Cơ chế thị trường', desc: 'Team cạnh tranh ngân sách, đầu tư ROI — ai giỏi chiến lược thắng.' },
                    { emoji: '🏛️', title: 'Vai trò Nhà nước', desc: '8 sự kiện drama mô phỏng chính sách: sandbox, thanh tra, thiên tai...' },
                    { emoji: '❤️', title: 'Kinh doanh phụng sự', desc: 'SIP cao = điểm cao. Không chỉ kiếm tiền mà còn trách nhiệm xã hội.' },
                  ].map(c => (
                    <div key={c.title} className="glass-sm p-4">
                      <div className="text-2xl mb-2">{c.emoji}</div>
                      <p className="font-bold text-slate-800 text-sm">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>
              ),
            },
          ]} />
        </Section>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewOpts} transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass p-10">
            <p className="text-5xl mb-4">🎮</p>
            <h2 className="font-display font-bold text-3xl text-slate-800 mb-3">Sẵn sàng chơi?</h2>
            <p className="text-slate-500 mb-8">Admin tạo phòng trước, team dùng mã phòng để tham gia.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/admin')}
                className="btn-primary text-lg px-8 py-4"
              >
                🎓 Tạo phòng Admin
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/join')}
                className="btn-lavender text-lg px-8 py-4"
              >
                👥 Tham gia Team
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center pb-8 text-slate-400 text-sm">
        V-Startup v3.0 Drama · FPTU · MLN122
      </footer>

      {/* Modal chọn vai trò khi bấm "Bắt đầu ngay" */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setShowStartModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="glass p-8 w-full max-w-md text-center shadow-glass-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">Bạn muốn làm gì?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Admin tạo phòng trước · Team dùng mã phòng để tham gia
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowStartModal(false); navigate('/admin') }}
                  className="btn-primary w-full justify-center text-base py-4"
                >
                  🎓 Tạo phòng Admin
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowStartModal(false); navigate('/join') }}
                  className="btn-lavender w-full justify-center text-base py-4"
                >
                  👥 Tham gia Team
                </motion.button>
                <button
                  onClick={() => setShowStartModal(false)}
                  className="mt-1 text-slate-400 text-sm hover:text-slate-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
