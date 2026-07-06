/**
 * Socket.IO client singleton.
 * Kết nối qua Vite proxy → server:3001 (không cần hardcode port).
 */
import { io } from 'socket.io-client'

export const socket = io({
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling'],
})

// Storage keys for reconnection
export const STORAGE = {
  ROLE:      'vst_role',      // 'admin' | 'player'
  ROOM:      'vst_room',      // roomCode
  TEAM:      'vst_team',      // teamId
  FINAL:     'vst_final',     // final room state (JSON) for winner page
}

export function saveSession(role, roomCode, teamId = null) {
  localStorage.setItem(STORAGE.ROLE, role)
  localStorage.setItem(STORAGE.ROOM, roomCode)
  if (teamId) localStorage.setItem(STORAGE.TEAM, teamId)
}

export function loadSession() {
  return {
    role:   localStorage.getItem(STORAGE.ROLE),
    room:   localStorage.getItem(STORAGE.ROOM),
    team:   localStorage.getItem(STORAGE.TEAM),
  }
}

export function clearSession() {
  Object.values(STORAGE).forEach(k => localStorage.removeItem(k))
}
