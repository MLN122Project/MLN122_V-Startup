/**
 * Socket.IO client singleton.
 * Local: kết nối qua Vite proxy hoặc localhost
 * Production: kết nối tới backend Render qua VITE_SOCKET_URL
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ["websocket", "polling"],
});

// Storage keys for reconnection
export const STORAGE = {
  ROLE: "vst_role",
  ROOM: "vst_room",
  TEAM: "vst_team",
  FINAL: "vst_final",
};

export function saveSession(role, roomCode, teamId = null) {
  localStorage.setItem(STORAGE.ROLE, role);
  localStorage.setItem(STORAGE.ROOM, roomCode);
  if (teamId) localStorage.setItem(STORAGE.TEAM, teamId);
}

export function loadSession() {
  return {
    role: localStorage.getItem(STORAGE.ROLE),
    room: localStorage.getItem(STORAGE.ROOM),
    team: localStorage.getItem(STORAGE.TEAM),
  };
}

export function clearSession() {
  Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
}
