import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'vstartup-music-on'
const MUSIC_SRC = '/Music.mp3'

export default function GameMusicToggle() {
  const audioRef = useRef(null)
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.45
    audioRef.current = audio

    const replay = () => {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
    audio.addEventListener('ended', replay)

    return () => {
      audio.removeEventListener('ended', replay)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    try {
      localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
    } catch {
      /* ignore */
    }

    if (on) {
      audio.play().catch(() => setOn(false))
    } else {
      audio.pause()
    }
  }, [on])

  return (
    <button
      type="button"
      onClick={() => setOn(v => !v)}
      className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-2xl
        glass-sm border border-white/80 shadow-lg text-sm font-bold text-slate-700
        hover:bg-white/90 active:scale-95 transition-all"
      aria-label={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      title={on ? 'Tắt nhạc' : 'Bật nhạc'}
    >
      <span className="text-lg leading-none">{on ? '🔊' : '🔇'}</span>
      <span>{on ? 'Nhạc: Bật' : 'Nhạc: Tắt'}</span>
    </button>
  )
}
