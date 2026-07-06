/**
 * V-Startup Game Server — Drama & Interactive edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Express + Socket.IO · In-memory state · No database
 *
 * Room phases:  lobby → playing → ended
 * Drama turn phases: idle → event_choice → done
 */

import express    from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors       from 'cors';
import { FOUNDERS, DRAMA_EVENTS, TACTICS } from './founders.js';
import { applyDramaEvent, applyTactic, calcScore } from './gameEngine.js';

const PORT = process.env.PORT || 3001;

// ─── HTTP + Socket.IO ─────────────────────────────────────────────────────────
const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, {
  cors:        { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout:  60000,
  pingInterval: 25000,
});

app.use(cors());
app.use(express.json());
app.get('/health', (_, res) =>
  res.json({ status: 'ok', rooms: rooms.size, uptime: process.uptime() })
);

// ─── In-memory store ──────────────────────────────────────────────────────────
const rooms = new Map();

setInterval(() => {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) { rooms.delete(code); console.log(`[GC] ${code}`); }
  }
}, 30 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genCode() {
  let code, tries = 0;
  do { code = 'VST' + (Math.floor(Math.random() * 900) + 100); tries++; }
  while (rooms.has(code) && tries < 500);
  return code;
}

function makeTeam(founder) {
  return {
    // Identity
    id:          founder.id,
    teamKey:     founder.teamKey,
    customName:  founder.name,
    founder:     founder.founder,
    sector:      founder.sector,
    sectorShort: founder.sectorShort,
    emoji:       founder.emoji,
    color:       founder.color,
    colorLight:  founder.colorLight,
    perk:        founder.perk,
    perkKey:     founder.perkKey,
    meaning:     founder.meaning,

    // Chỉ số game
    budget:  founder.startBudget,
    sip:     founder.startSip,
    ap:      founder.startAp ?? 5,
    shi:     0,   // giữ lại cho tương thích
    score:   calcScore(founder.startBudget, founder.startSip, founder.startAp ?? 5),

    // Kết nối
    socketId:  null,
    connected: false,
    ready:     false,

    // Trạng thái drama
    frozen:       false,
    frozenNext:   false,
    whirlwind:    false,   // đáp án trôi vòng này
    whirlwindNext: false,
    fogged:       false,   // đáp án bị sương mù vòng này
    fogNext:      false,
    submitted: false,

    // Cờ cảnh báo
    bankrupt: false,
    warning:  false,

    // Stats cho màn tổng kết
    exposeCount:   0,  // số lần bị bóc phốt
    frozenCount:   0,  // số lần bị đóng băng
    allianceCount: 0,  // số lần liên minh
    stealCount:    0,  // số lần ăn trộm thành công
    exposedByCount: 0, // số lần bị bóc phốt bởi người khác

    // Lịch sử mỗi sự kiện
    history: [],
  };
}

/** Leaderboard sorted giảm dần theo score */
function buildLeaderboard(teams) {
  return [...teams]
    .sort((a, b) => b.score - a.score)
    .map((t, i) => ({
      rank:        i + 1,
      teamId:      t.id,
      teamName:    t.customName,
      founder:     t.founder,
      emoji:       t.emoji,
      sectorShort: t.sectorShort,
      color:       t.color,
      budget:      t.budget,
      sip:         t.sip,
      ap:          t.ap,
      score:       t.score,
      frozen:      t.frozen,
      bankrupt:    t.bankrupt,
      warning:     t.warning,
    }));
}

/** Strip socketId khỏi state trước khi broadcast */
function pub(room) {
  return {
    roomCode:       room.roomCode,
    adminName:      room.adminName,
    phase:          room.phase,
    // Drama turn state
    turnPhase:      room.turnPhase,
    currentTurnId:  room.currentTurnId,
    currentEventId: room.currentEventId,
    usedEventIds:   room.usedEventIds,
    // Classic quarterly state (giữ lại cho tương thích)
    roundPhase:     room.roundPhase,
    currentQuarter: room.currentQuarter,
    selectedEvent:  room.selectedEvent,
    // Data
    leaderboard:    room.leaderboard,
    gameLogs:       room.gameLogs,
    liveFeed:       room.liveFeed,
    lastResults:    room.lastResults,
    // Simultaneous round state
    eventSubmissions: room.eventSubmissions ?? {},
    tacticOffers:     room.tacticOffers ?? {},
    roundStartedAt:   room.roundStartedAt ?? null,
    roundEndsAt:      room.roundEndsAt ?? null,
    roundSecondsLeft: room.turnPhase === 'event_choice' && room.roundEndsAt
      ? getRoundSecondsLeft(room)
      : null,
    roundSeconds:     ROUND_SECONDS,
    frozenRevealSeconds: FROZEN_REVEAL_SECONDS,
    createdAt:      room.createdAt,
    teams: room.teams.map(({ socketId, ...rest }) => rest),
  };
}

function isAdmin(room, socket) {
  return room != null && room.adminSocketId === socket.id;
}

/** Chuẩn hóa mã phòng — tránh lệch hoa/thường khi client gửi emit */
function normCode(roomCode) {
  return (roomCode || '').toUpperCase().trim();
}

function getRoom(roomCode) {
  return rooms.get(normCode(roomCode));
}

function broadcast(roomCode) {
  const code = normCode(roomCode);
  const room = rooms.get(code);
  if (room) io.to(code).emit('room:state', pub(room));
}

const TACTIC_IDS = ['freeze', 'expose', 'steal', 'alliance', 'whirlwind', 'fog'];
const TACTIC_OFFER_RATIO = 0.90; // ~90% số team tham gia được gán chiêu (làm tròn theo n)
const ROUND_SECONDS = 40;
const FROZEN_REVEAL_SECONDS = 5; // 5 giây cuối mới thấy câu hỏi khi bị đóng băng

/** Số team được gán chiêu — scale theo n (~80% n), ≥2 team thì luôn ít nhất 1 team có chiêu */
function calcTacticOfferCount(teamCount) {
  if (teamCount <= 0) return 0;
  const exact = teamCount * TACTIC_OFFER_RATIO;
  const base = Math.floor(exact);
  const extra = Math.random() < (exact - base) ? 1 : 0;
  let k = Math.min(teamCount, base + extra);
  if (teamCount >= 2) k = Math.max(1, k);
  return k;
}

/** Random chiêu cho k team (k ∝ số team), rải loại chiêu khác nhau khi có thể */
function rollTacticsForRound(room) {
  room.tacticOffers = {};
  const teams = getParticipatingTeams(room);
  const n = teams.length;
  if (n === 0) return;

  const k = calcTacticOfferCount(n);
  if (k === 0) return;

  const picked = [...teams].sort(() => Math.random() - 0.5).slice(0, k);
  const shuffledTactics = [...TACTIC_IDS].sort(() => Math.random() - 0.5);

  picked.forEach((team, i) => {
    room.tacticOffers[team.id] = shuffledTactics[i % shuffledTactics.length];
  });
}

function getTeamTacticId(room, teamId) {
  return room.tacticOffers?.[teamId] ?? null;
}

function teamHasOfferedTactic(room, teamId) {
  return getTeamTacticId(room, teamId) != null;
}

function getRoundSecondsLeft(room) {
  if (!room.roundEndsAt) return 0;
  return Math.max(0, Math.ceil((room.roundEndsAt - Date.now()) / 1000));
}

function canFrozenTeamAct(room, team) {
  if (!team.frozen) return true;
  return getRoundSecondsLeft(room) <= FROZEN_REVEAL_SECONDS;
}

function clearRoundTimer(room) {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }
  if (room.roundTickInterval) {
    clearInterval(room.roundTickInterval);
    room.roundTickInterval = null;
  }
}

function activatePendingDebuffs(room) {
  room.teams.forEach(t => {
    t.frozen = !!t.frozenNext;
    t.frozenNext = false;
    t.whirlwind = !!t.whirlwindNext;
    t.whirlwindNext = false;
    t.fogged = !!t.fogNext;
    t.fogNext = false;
  });
}

/** Teams tham gia vòng hiện tại (online — kể cả bị đóng băng che màn hình) */
function getParticipatingTeams(room) {
  return room.teams.filter(t => t.connected);
}

function resetRoundSubmissions(room) {
  clearRoundTimer(room);
  room.eventSubmissions = {};
  room.tacticOffers     = {};
  room.roundStartedAt   = null;
  room.roundEndsAt      = null;
  room.lastResults      = null;
  room.teams.forEach(t => { t.submitted = false; });
}

function allEventChoicesIn(room) {
  const active = getParticipatingTeams(room);
  if (active.length === 0) return false;
  return active.every(t => room.eventSubmissions[t.id]);
}

function advanceToDonePhase(room) {
  clearRoundTimer(room);
  room.turnPhase = 'done';
  room.roundStartedAt = null;
  room.roundEndsAt = null;
  room.teams.forEach(t => {
    t.frozen = false;
    t.whirlwind = false;
    t.fogged = false;
  });
  room.leaderboard = buildLeaderboard(room.teams);
}

/** Áp dụng chiêu thức cho team (sau khi đã áp sự kiện) */
function _applyTacticForTeam(room, team, targetId, content, tacticId) {
  if (!tacticId) return { used: false, skipped: true, logs: [] };

  const target = targetId ? room.teams.find(t => t.id === targetId) : null;
  const { attackerDelta, targetDelta, feedEntry, logs, error } = applyTactic(
    team, target, tacticId, content || ''
  );
  if (error) throw new Error(error);

  Object.assign(team, attackerDelta);
  team.stealCount    += tacticId === 'steal'    ? 1 : 0;
  team.allianceCount += tacticId === 'alliance' ? 1 : 0;
  team.exposeCount   += tacticId === 'expose'   ? 1 : 0;

  if (target && targetDelta) {
    Object.assign(target, targetDelta);
    target.frozenCount    += tacticId === 'freeze' ? 1 : 0;
    target.exposedByCount += tacticId === 'expose' ? 1 : 0;
  }

  if (feedEntry) {
    room.liveFeed.unshift({ ...feedEntry, id: Date.now() });
    if (room.liveFeed.length > 50) room.liveFeed.pop();
  }

  room.gameLogs.unshift({
    type: 'tactic', quarter: room.currentQuarter,
    teamId: team.id, teamName: team.customName,
    tacticId, targetId: target?.id, targetName: target?.customName,
    logs, ts: Date.now(),
  });

  return {
    used: true,
    skipped: false,
    tacticId,
    targetId: target?.id,
    targetName: target?.customName,
    logs,
  };
}

/** Áp dụng sự kiện + chiêu thức trong một lần submit */
function _applyFullSubmission(room, team, optionId, invest, tacticAction, targetId, content) {
  const { newState, logs, summary } = applyDramaEvent(team, room.currentEventId, optionId, invest);
  Object.assign(team, newState);
  if (!Array.isArray(team.history)) team.history = [];
  team.history.push({ eventId: room.currentEventId, optionId, invest, ...newState, ts: Date.now() });
  team.submitted = true;

  const tacticId = getTeamTacticId(room, team.id);
  let tacticInfo = { used: false, skipped: true, tacticId: null };
  if (tacticId && tacticAction === 'use') {
    tacticInfo = _applyTacticForTeam(room, team, targetId, content, tacticId);
  } else if (tacticId) {
    room.gameLogs.unshift({
      type: 'tactic_skip', quarter: room.currentQuarter,
      teamId: team.id, teamName: team.customName,
      message: `⏭ ${team.emoji} ${team.customName} bỏ qua chiêu thức`,
      ts: Date.now(),
    });
  }

  const fullSummary = tacticInfo.used
    ? `${summary} · ⚡ Dùng ${TACTICS[tacticId]?.label}${tacticInfo.targetName ? ` → ${tacticInfo.targetName}` : ''}`
    : tacticId ? `${summary} · ⏭ Bỏ qua chiêu` : summary;

  room.eventSubmissions[team.id] = {
    teamId: team.id, teamName: team.customName, teamEmoji: team.emoji,
    optionId, invest, logs, summary: fullSummary,
    tacticUsed: tacticInfo.used,
    tacticSkipped: !tacticInfo.used && !!tacticId,
    tacticId: tacticId ?? null,
    targetId: tacticInfo.targetId ?? null,
    targetName: tacticInfo.targetName ?? null,
    ts: Date.now(),
  };

  room.gameLogs.unshift({
    type: 'event_choice', quarter: room.currentQuarter,
    teamId: team.id, teamName: team.customName, teamEmoji: team.emoji,
    eventId: room.currentEventId, optionId, invest,
    logs, summary: fullSummary,
    ts: Date.now(),
  });

  room.leaderboard = buildLeaderboard(room.teams);
}

function finishRoundByTimeout(room, code) {
  if (room.turnPhase !== 'event_choice') return;
  const event = DRAMA_EVENTS.find(e => e.id === room.currentEventId);
  if (!event) return;

  for (const team of getParticipatingTeams(room)) {
    if (room.eventSubmissions[team.id]) continue;
    const defaultOpt = event.options[0]?.id || 'A';
    try {
      _applyFullSubmission(room, team, defaultOpt, 0, 'skip', null, '');
      room.gameLogs.unshift({
        type: 'timeout', quarter: room.currentQuarter,
        teamId: team.id, teamName: team.customName,
        message: `⏱ ${team.emoji} ${team.customName} hết giờ → tự chọn ${defaultOpt}`,
        ts: Date.now(),
      });
    } catch (err) {
      console.error('[T] auto-submit error:', err);
    }
  }

  advanceToDonePhase(room);
  broadcast(code);
  console.log(`[T] Round timeout in ${code}`);
}

function startRoundTimer(room, code) {
  clearRoundTimer(room);
  room.roundStartedAt = Date.now();
  room.roundEndsAt = room.roundStartedAt + ROUND_SECONDS * 1000;
  room.roundTimer = setTimeout(() => finishRoundByTimeout(room, code), ROUND_SECONDS * 1000 + 50);
  room.roundTickInterval = setInterval(() => {
    if (room.turnPhase !== 'event_choice') {
      clearRoundTimer(room);
      return;
    }
    broadcast(code);
  }, 1000);
}

// ─── Socket handlers ──────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);

  // ── Admin: Tạo phòng ────────────────────────────────────────────────────────
  socket.on('admin:createRoom', ({ adminName = 'Admin' } = {}) => {
    const roomCode = genCode();
    const room = {
      roomCode,
      adminName:       adminName.trim() || 'Admin',
      adminSocketId:   socket.id,

      // Phase
      phase:           'lobby',     // lobby | playing | ended
      roundPhase:      null,        // giữ tương thích

      // ── Drama state ──
      turnPhase:       'idle',      // idle | event_choice | done
      currentTurnId:   null,
      currentEventId:  null,
      usedEventIds:    [],
      eventSubmissions: {},
      tacticOffers:     {},
      roundStartedAt:   null,
      roundEndsAt:      null,
      roundTimer:       null,
      roundTickInterval: null,

      // ── Classic state (giữ) ──
      currentQuarter:  1,
      selectedEvent:   'none',

      // Data
      teams:           FOUNDERS.map(makeTeam),
      leaderboard:     [],
      gameLogs:        [],
      liveFeed:        [],          // [{ type, from, to, content, ts }]
      lastResults:     null,

      createdAt:       Date.now(),
    };
    room.leaderboard = buildLeaderboard(room.teams);
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('room:created', { roomCode });
    socket.emit('room:state',   pub(room));
    console.log(`[R] ${roomCode} by ${adminName}`);
  });

  // ── Admin: Reconnect ────────────────────────────────────────────────────────
  socket.on('reconnect:admin', ({ roomCode } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (!room) { socket.emit('error:room', { message: 'Phòng không còn tồn tại!' }); return; }
    room.adminSocketId = socket.id;
    socket.join(code);
    socket.emit('room:state', pub(room));
  });

  // ── Team: Kiểm tra phòng ────────────────────────────────────────────────────
  socket.on('room:check', ({ roomCode } = {}) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) { socket.emit('room:checkResult', { valid: false, message: 'Mã phòng không tồn tại!' }); return; }
    if (room.phase !== 'lobby') { socket.emit('room:checkResult', { valid: false, message: 'Game đã bắt đầu!' }); return; }
    socket.emit('room:checkResult', {
      valid: true, roomCode: room.roomCode, adminName: room.adminName,
      teams: room.teams.map(t => ({
        id: t.id, customName: t.customName, founder: t.founder,
        sector: t.sector, sectorShort: t.sectorShort, emoji: t.emoji,
        color: t.color, connected: t.connected, ready: t.ready,
      })),
    });
  });

  // ── Team: Join ──────────────────────────────────────────────────────────────
  socket.on('team:join', ({ roomCode, teamId, customName } = {}) => {
    const room = rooms.get(roomCode);
    if (!room) { socket.emit('error:room', { message: 'Phòng không tồn tại!' }); return; }
    if (room.phase !== 'lobby') { socket.emit('error:room', { message: 'Game đã bắt đầu!' }); return; }
    const team = room.teams.find(t => t.id === teamId);
    if (!team) { socket.emit('error:room', { message: 'Founder không tồn tại!' }); return; }
    if (team.connected && team.socketId !== socket.id) {
      socket.emit('error:room', { message: `${team.customName} đã có người tham gia!` }); return;
    }
    team.socketId  = socket.id;
    team.connected = true;
    team.ready     = true;
    if (customName?.trim()) team.customName = customName.trim();
    socket.join(roomCode);
    socket.emit('team:joined', { teamId, roomCode });
    broadcast(roomCode);
    console.log(`[T] ${team.customName} joined ${roomCode}`);
  });

  // ── Team: Reconnect ─────────────────────────────────────────────────────────
  socket.on('reconnect:player', ({ roomCode, teamId } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (!room) { socket.emit('error:room', { message: 'Phòng không còn tồn tại!' }); return; }
    const team = room.teams.find(t => t.id === teamId);
    if (!team) { socket.emit('error:room', { message: 'Team không tồn tại!' }); return; }
    team.socketId  = socket.id;
    team.connected = true;
    team.ready     = true;
    socket.join(code);
    socket.emit('room:state', pub(room));
    broadcast(code);
  });

  // ── Admin: Start game ───────────────────────────────────────────────────────
  socket.on('admin:startGame', ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket) || room.phase !== 'lobby') return;
    const connectedTeams = room.teams.filter(t => t.connected);
    if (connectedTeams.length === 0) return;
    room.phase         = 'playing';
    room.roundPhase    = 'open';    // classic compat
    room.turnPhase     = 'idle';
    room.currentTurnId = null;
    broadcast(roomCode);
    console.log(`[G] Game started in ${roomCode} (${connectedTeams.length} teams)`);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // DRAMA MECHANICS — Simultaneous event + tactic in one submit
  // ════════════════════════════════════════════════════════════════════════════

  // ── Admin: Random sự kiện (tất cả team chơi cùng lúc) ─────────────────────
  socket.on('admin:rollEvent', ({ roomCode } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (!isAdmin(room, socket) || room.turnPhase !== 'idle') return;

    const available = DRAMA_EVENTS.filter(e => !room.usedEventIds.includes(e.id));
    if (available.length === 0) {
      room.phase = 'ended';
      room.leaderboard = buildLeaderboard(room.teams);
      broadcast(code);
      console.log(`[G] All events used → game ended in ${code}`);
      return;
    }

    const event = available[Math.floor(Math.random() * available.length)];
    resetRoundSubmissions(room);
    activatePendingDebuffs(room);
    room.currentEventId  = event.id;
    room.usedEventIds.push(event.id);
    rollTacticsForRound(room);
    room.currentTurnId   = null;
    room.turnPhase       = 'event_choice';
    startRoundTimer(room, code);

    const offerEntries = Object.entries(room.tacticOffers);
    const tacticMsg = offerEntries.length
      ? ` · Chiêu: ${offerEntries.map(([tid, tacid]) => {
          const tm = room.teams.find(t => t.id === tid);
          return `${TACTICS[tacid]?.emoji}${tm?.customName ?? tid}`;
        }).join(', ')}`
      : ' · Không team nào được chiêu';

    room.gameLogs.unshift({
      type: 'event_rolled', quarter: room.currentQuarter,
      eventId: event.id, eventLabel: event.label, eventEmoji: event.emoji,
      tacticOffers: { ...room.tacticOffers },
      message: `${event.emoji} "${event.label}" — ${ROUND_SECONDS}s chọn đáp án${tacticMsg}`,
      ts: Date.now(),
    });

    broadcast(code);
    console.log(`[E] Event ${event.id} offers=${JSON.stringify(room.tacticOffers)} in ${code}`);
  });

  // ── PLAYER: Gửi đáp án + chiêu thức (một lần) ─────────────────────────────
  socket.on('team:submitChoice', (payload = {}, ack) => {
    const fail = (message) => {
      socket.emit('error:choice', { message });
      if (typeof ack === 'function') ack({ ok: false, message });
    };

    const roomCode = normCode(payload.roomCode);
    const { teamId, optionId } = payload;
    const room = getRoom(roomCode);

    if (!room) { fail('Phòng không tồn tại!'); return; }
    if (room.phase !== 'playing') { fail('Game chưa bắt đầu hoặc đã kết thúc.'); return; }
    if (room.turnPhase !== 'event_choice') { fail('Không ở pha chọn phương án.'); return; }

    const team = room.teams.find(t => t.id === teamId);
    if (!team) { fail('Team không tồn tại!'); return; }
    if (!team.connected) { fail('Team chưa kết nối!'); return; }
    if (team.frozen && !canFrozenTeamAct(room, team)) {
      const wait = getRoundSecondsLeft(room) - FROZEN_REVEAL_SECONDS;
      fail(`❄️ Bị đóng băng! Còn ${Math.max(0, wait)} giây nữa mới thấy câu hỏi.`);
      return;
    }
    if (room.eventSubmissions[teamId]) { fail('Bạn đã gửi lựa chọn rồi!'); return; }
    if (!room.currentEventId) { fail('Chưa có sự kiện — chờ Admin random.'); return; }
    if (!optionId) { fail('Chọn phương án A/B/C/D trước!'); return; }

    if (team.socketId !== socket.id) {
      team.socketId  = socket.id;
      team.connected = true;
      socket.join(roomCode);
    }

    const invest = Math.max(0, Math.floor(Number(payload.investAmount) || 0));
    if (invest > team.budget) {
      fail(`Không đủ tiền! Budget hiện tại: ${team.budget.toFixed(1)}M`);
      return;
    }

    const tacticAction = payload.tacticAction === 'use' ? 'use' : 'skip';
    const tacticId = getTeamTacticId(room, teamId);
    if (tacticAction === 'use') {
      if (!tacticId) { fail('Team bạn không được gán chiêu thức vòng này!'); return; }
      const tactic = TACTICS[tacticId];
      if (tactic?.needsTarget && !payload.targetId) {
        fail('Chọn đội mục tiêu cho chiêu thức!'); return;
      }
    }

    try {
      _applyFullSubmission(room, team, optionId, invest, tacticAction, payload.targetId, payload.content || '');
      if (allEventChoicesIn(room)) advanceToDonePhase(room);
      broadcast(roomCode);
      if (typeof ack === 'function') ack({ ok: true });
      console.log(`[C] ${team.customName} → ${optionId} tactic=${tacticAction} in ${roomCode}`);
    } catch (err) {
      console.error('[C] submitChoice error:', err);
      fail(err.message || 'Lỗi xử lý — thử lại hoặc báo Admin.');
    }
  });

  // ── ADMIN: Force submit cho team offline / chậm ───────────────────────────
  socket.on('admin:forceChoice', ({ roomCode, teamId, optionId, investAmount = 0, tacticAction = 'skip' } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (!isAdmin(room, socket) || room.turnPhase !== 'event_choice') return;

    const team = room.teams.find(t => t.id === teamId);
    if (!team || !room.currentEventId || room.eventSubmissions[team.id]) return;

    const invest = Math.max(0, Math.min(Math.floor(Number(investAmount) || 0), team.budget));
    try {
      _applyFullSubmission(room, team, optionId, invest, tacticAction === 'use' ? 'use' : 'skip', null, '');
      if (allEventChoicesIn(room)) advanceToDonePhase(room);
      broadcast(code);
    } catch (err) {
      console.error('[C] forceChoice error:', err);
    }
  });

  // ── ADMIN: Chuyển pha sớm (team offline) ───────────────────────────────────
  socket.on('admin:advancePhase', ({ roomCode } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (!isAdmin(room, socket)) return;

    if (room.turnPhase === 'event_choice' && Object.keys(room.eventSubmissions).length > 0) {
      clearRoundTimer(room);
      advanceToDonePhase(room);
      broadcast(code);
    }
  });

  // ── Admin: Vòng sự kiện tiếp theo ─────────────────────────────────────────
  function _goNextEvent(room, socket) {
    if (!isAdmin(room, socket) || room.turnPhase !== 'done') return false;
    room.turnPhase      = 'idle';
    room.currentEventId = null;
    resetRoundSubmissions(room);
    if (room.usedEventIds.length >= DRAMA_EVENTS.length) {
      room.phase = 'ended';
      room.leaderboard = buildLeaderboard(room.teams);
    }
    return true;
  }

  socket.on('admin:nextEvent', ({ roomCode } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (_goNextEvent(room, socket)) broadcast(code);
  });

  socket.on('admin:endTurn', ({ roomCode } = {}) => {
    const code = normCode(roomCode);
    const room = getRoom(code);
    if (_goNextEvent(room, socket)) broadcast(code);
  });

  // ── Admin: Rã băng thủ công ─────────────────────────────────────────────────
  socket.on('admin:thawTeam', ({ roomCode, teamId } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket)) return;
    const team = room.teams.find(t => t.id === teamId);
    if (!team) return;
    team.frozen = false;
    team.frozenNext = false;
    team.whirlwind = false;
    team.whirlwindNext = false;
    team.fogged = false;
    team.fogNext = false;
    broadcast(roomCode);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CLASSIC QUARTERLY MODE (giữ nguyên để tương thích nếu cần)
  // ════════════════════════════════════════════════════════════════════════════

  socket.on('admin:lockRound',        ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket) || room.roundPhase !== 'open') return;
    room.roundPhase = 'locked';
    broadcast(roomCode);
  });

  socket.on('admin:unlockRound',      ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket) || room.roundPhase !== 'locked') return;
    room.roundPhase = 'open';
    broadcast(roomCode);
  });

  socket.on('admin:setEvent',         ({ roomCode, eventId } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket)) return;
    room.selectedEvent = eventId || 'none';
    broadcast(roomCode);
  });

  socket.on('team:submit',            ({ roomCode, teamId, decisions } = {}) => {
    const room = rooms.get(roomCode);
    if (!room || room.phase !== 'playing' || room.roundPhase !== 'open') return;
    const team = room.teams.find(t => t.id === teamId && t.socketId === socket.id);
    if (!team) return;
    const rd = Math.max(Number(decisions?.rd) || 0, 0);
    const mkt = Math.max(Number(decisions?.marketing) || 0, 0);
    const com = Math.max(Number(decisions?.community) || 0, 0);
    const price = Number(decisions?.price) || 1;
    if (rd + mkt + com > team.budget) {
      socket.emit('error:submit', { message: `Chi phí vượt ngân sách!` }); return;
    }
    if (price <= 0) {
      socket.emit('error:submit', { message: 'Giá bán phải > 0!' }); return;
    }
    team.decisions = { rd, marketing: mkt, community: com, price };
    team.submitted = true;
    broadcast(roomCode);
  });

  socket.on('admin:nextQuarter',      ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket) || room.roundPhase !== 'results') return;
    room.currentQuarter++;
    room.roundPhase = 'open';
    room.selectedEvent = 'none';
    room.lastResults = null;
    room.teams.forEach(t => { t.submitted = false; });
    broadcast(roomCode);
  });

  // ── Admin: End game (manual) ─────────────────────────────────────────────────
  socket.on('admin:endGame', ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket)) return;
    room.phase = 'ended';
    room.leaderboard = buildLeaderboard(room.teams);
    broadcast(roomCode);
    console.log(`[G] Game manually ended in ${roomCode}`);
  });

  // ── Admin: Reset ─────────────────────────────────────────────────────────────
  socket.on('admin:resetGame', ({ roomCode } = {}) => {
    const room = rooms.get(roomCode);
    if (!isAdmin(room, socket)) return;
    const oldTeams = room.teams;
    room.teams = FOUNDERS.map(f => {
      const fresh = makeTeam(f);
      const old   = oldTeams.find(o => o.id === f.id);
      if (old) {
        fresh.socketId  = old.socketId;
        fresh.connected = old.connected;
        fresh.ready     = old.connected;
        fresh.customName = old.customName;
      }
      return fresh;
    });
    room.phase          = 'lobby';
    room.roundPhase     = null;
    room.turnPhase      = 'idle';
    room.currentTurnId  = null;
    room.currentEventId = null;
    room.usedEventIds   = [];
    room.eventSubmissions = {};
    room.tacticOffers     = {};
    room.roundStartedAt   = null;
    room.roundEndsAt      = null;
    clearRoundTimer(room);
    room.currentQuarter = 1;
    room.selectedEvent  = 'none';
    room.gameLogs       = [];
    room.liveFeed       = [];
    room.lastResults    = null;
    room.leaderboard    = buildLeaderboard(room.teams);
    broadcast(roomCode);
    console.log(`[G] Game reset in ${roomCode}`);
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on('disconnect', reason => {
    console.log(`[-] ${socket.id} (${reason})`);
    for (const room of rooms.values()) {
      const team = room.teams.find(t => t.socketId === socket.id);
      if (team) {
        team.connected = false;
        broadcast(room.roomCode);
        break;
      }
    }
  });

  socket.on('ping', cb => { if (typeof cb === 'function') cb({ ts: Date.now() }); });
});

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 V-Startup Server → http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
