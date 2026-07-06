/**
 * Full-screen ice freeze overlay — che toàn màn hình khi bị chiêu Đóng băng
 */
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import iceTexture from '../assets/ice-freeze-texture.png'

export default function FreezeScreenOverlay({ active, secondsLeft, revealAt = 5 }) {
  useEffect(() => {
    if (!active) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [active])

  if (typeof document === 'undefined') return null

  const wait = Math.max(0, secondsLeft - revealAt)

  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.div
          key="freeze-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="freeze-screen-overlay"
          aria-hidden="true"
        >
          <motion.div
            className="freeze-screen-texture"
            style={{ backgroundImage: `url(${iceTexture})` }}
            initial={{ scale: 1.2, opacity: 0, filter: 'blur(16px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="freeze-screen-frost" />
          <div className="freeze-screen-shimmer" />
          <div className="freeze-screen-vignette" />

          <div className="freeze-screen-content">
            <motion.p
              className="freeze-screen-icon"
              animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              ❄️
            </motion.p>
            <p className="freeze-screen-title">BỊ ĐÓNG BĂNG!</p>
            <p className="freeze-screen-desc">
              Màn hình bị băng che kín — câu hỏi &amp; đáp án đang ẩn
            </p>
            <div className="freeze-screen-timer">
              <span className="freeze-screen-timer-label">Hiện lại sau</span>
              <span className="freeze-screen-timer-value">{wait}s</span>
            </div>
            <p className="freeze-screen-hint">
              Chuẩn bị chọn nhanh trong <strong>{revealAt}s</strong> cuối!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
