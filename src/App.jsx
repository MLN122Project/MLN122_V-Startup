/**
 * App.jsx — Component gốc của V-Startup: Đường Đua Kiến Tạo
 * Quản lý toàn bộ game state, localStorage, và điều hướng tab.
 */

import { useState, useEffect, useCallback } from 'react';
import { FOUNDERS, EVENTS } from './data/founders';
import { calculateQuarterResults, calcScore } from './utils/economyEngine';
import Leaderboard from './components/Leaderboard';
import DecisionForm from './components/DecisionForm';
import EventPanel from './components/EventPanel';
import FounderCards from './components/FounderCards';

const STORAGE_KEY = 'v-startup-game-state-v2';

/** Tạo state ban đầu cho một game mới */
function createInitialState() {
  return {
    currentQuarter: 1,
    currentEvent: 'none',
    teams: FOUNDERS.map(f => ({
      id: f.id,
      customName: f.name,
      budget: f.startBudget,
      sip: f.startSip,
      shi: 0,
      decisions: {
        rd: 20,
        marketing: 20,
        community: 10,
        price: 10,
      },
      lastRevenue: 0,
      lastSold: 0,
      lastCost: 0,
      score: calcScore(f.startBudget, f.startSip, 0),
      bankrupt: false,
    })),
    gameLogs: [],
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  // Khởi tạo state từ localStorage hoặc state mới
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // nếu parse lỗi, dùng state mới
    }
    return createInitialState();
  });

  // Tự động lưu vào localStorage mỗi khi state thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  /** Hiện toast notification ngắn */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /** Cập nhật quyết định và/hoặc tên tùy chỉnh cho một team */
  const handleUpdateDecisions = useCallback((teamId, decisions, customName) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(t =>
        t.id === teamId
          ? { ...t, decisions, customName: customName || t.customName }
          : t
      ),
    }));
    showToast('✅ Đã lưu quyết định!', 'success');
  }, [showToast]);

  /** Tính kết quả quý và chuyển sang quý tiếp theo */
  const handleCalculateQuarter = useCallback((selectedEvent) => {
    const results = calculateQuarterResults(gameState, selectedEvent);
    const eventData = EVENTS[selectedEvent] || EVENTS.none;

    // Cập nhật state của từng team dựa trên kết quả tính toán
    const updatedTeams = gameState.teams.map(team => {
      const result = results.find(r => r.id === team.id);
      if (!result) return team;
      return {
        ...team,
        budget: result.budget,
        sip: result.sip,
        shi: result.shi,
        score: result.score,
        lastRevenue: result.lastRevenue,
        lastSold: result.lastSold,
        lastCost: result.lastCost,
        bankrupt: result.bankrupt,
      };
    });

    // Tạo game log cho quý vừa kết thúc
    const quarterLog = {
      quarter: gameState.currentQuarter,
      eventId: selectedEvent,
      eventLabel: eventData.label,
      eventEmoji: eventData.emoji,
      entries: results.map(r => {
        const founder = FOUNDERS.find(f => f.id === r.id);
        const team = gameState.teams.find(t => t.id === r.id);
        return {
          teamId: r.id,
          teamName: team?.customName || founder?.name || r.id,
          emoji: founder?.emoji || '🏢',
          summary: buildSummary(team, r, founder),
          details: r.logs,
          expanded: false,
        };
      }),
    };

    setGameState(prev => ({
      ...prev,
      currentQuarter: prev.currentQuarter + 1,
      currentEvent: selectedEvent,
      teams: updatedTeams,
      gameLogs: [quarterLog, ...prev.gameLogs],
    }));

    showToast(`🎉 Quý ${gameState.currentQuarter} đã hoàn tất! Chuyển sang Quý ${gameState.currentQuarter + 1}`, 'success');
  }, [gameState, showToast]);

  /** Reset toàn bộ game về trạng thái ban đầu */
  const handleReset = useCallback(() => {
    if (window.confirm('⚠️ Reset toàn bộ game? Mọi dữ liệu sẽ bị xóa!')) {
      const fresh = createInitialState();
      setGameState(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      setActiveTab('dashboard');
      showToast('🔄 Game đã được reset!', 'info');
    }
  }, [showToast]);

  /** Xuất dữ liệu JSON */
  const handleExportJSON = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      gameName: 'V-Startup: Đường Đua Kiến Tạo',
      ...gameState,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `v-startup-q${gameState.currentQuarter}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📦 Đã xuất file JSON!', 'success');
  }, [gameState, showToast]);

  const TABS = [
    { id: 'dashboard', label: '🏆 Dashboard' },
    { id: 'decisions', label: '📝 Quyết định' },
    { id: 'events',    label: '⚡ Sự kiện' },
    { id: 'founders',  label: '👥 Nhân vật' },
  ];

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <span className="logo-emoji">🚀</span>
            <div>
              <h1>V-Startup</h1>
              <p>Đường Đua Kiến Tạo · FPTU</p>
            </div>
          </div>
          <div className="header-info">
            <div className="quarter-badge">Quý {gameState.currentQuarter}</div>
            <div className="header-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
                📦 Xuất JSON
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleReset}>
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Leaderboard gameState={gameState} />
        )}
        {activeTab === 'decisions' && (
          <DecisionForm
            teams={gameState.teams}
            onUpdate={handleUpdateDecisions}
          />
        )}
        {activeTab === 'events' && (
          <EventPanel
            gameState={gameState}
            onCalculate={handleCalculateQuarter}
          />
        )}
        {activeTab === 'founders' && (
          <FounderCards />
        )}
      </main>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

/** Tạo câu tóm tắt kết quả cho game log */
function buildSummary(team, result, founder) {
  const parts = [
    `Doanh thu +${result.revenue.toFixed(1)}M`,
    `Ngân sách: ${result.budget.toFixed(1)}M`,
    `SIP +${result.sipGain.toFixed(1)}`,
    `SHI +${result.shiGain}`,
  ];
  if (result.bankrupt) parts.push('⚠️ NGUY CƠ PHÁ SẢN');
  if (result.refund > 0) parts.push(`Hoàn R&D +${result.refund.toFixed(1)}M`);
  if (result.penalty > 0) parts.push(`Phạt -${result.penalty}M`);
  return parts.join(' · ');
}
