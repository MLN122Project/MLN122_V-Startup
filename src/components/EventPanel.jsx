/**
 * EventPanel.jsx — Tab Sự kiện & Tính quý mới
 * Admin chọn hoặc random sự kiện vĩ mô, sau đó bấm tính kết quả.
 * Hiển thị Game Log toàn bộ lịch sử các quý.
 */

import { useState } from 'react';
import { EVENTS, EVENTS_LIST } from '../data/founders';

/** Card chọn sự kiện */
function EventOption({ event, selected, onSelect }) {
  return (
    <button
      className={`event-option${selected ? ' selected' : ''}`}
      onClick={() => onSelect(event.id)}
    >
      <span className="event-option-emoji">{event.emoji}</span>
      <div className="event-option-info">
        <div className="event-option-label">{event.label}</div>
        <div className="event-option-desc">{event.description}</div>
      </div>
      {selected && <span className="event-option-check">✓</span>}
    </button>
  );
}

/** Một entry trong log, có thể mở rộng để xem chi tiết */
function LogEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="log-entry" onClick={() => setExpanded(v => !v)}>
      <div className="log-entry-summary">
        {entry.emoji} <strong>{entry.teamName}</strong>: {entry.summary}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginLeft: 6 }}>
          {expanded ? '▲ ẩn bớt' : '▼ xem chi tiết'}
        </span>
      </div>
      {expanded && (
        <div className="log-entry-details">
          {entry.details.map((line, i) => (
            <div key={i} className="log-detail-line">• {line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Component chính */
export default function EventPanel({ gameState, onCalculate }) {
  const { currentQuarter, gameLogs } = gameState;

  // Sự kiện đang được chọn (local state, chưa áp dụng)
  const [selectedEvent, setSelectedEvent] = useState('none');
  const [confirming, setConfirming] = useState(false);

  function handleRandom() {
    const eventIds = Object.keys(EVENTS);
    const random = eventIds[Math.floor(Math.random() * eventIds.length)];
    setSelectedEvent(random);
  }

  function handleCalculate() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onCalculate(selectedEvent);
    setConfirming(false);
    setSelectedEvent('none');
  }

  const selectedEventData = EVENTS[selectedEvent] || EVENTS.none;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">⚡ Sự kiện & Tính quý mới</h2>
        <p className="section-subtitle">
          Chọn sự kiện vĩ mô cho Quý {currentQuarter}, rồi tính kết quả để chuyển sang Quý {currentQuarter + 1}.
        </p>
      </div>

      <div className="event-panel-container">

        {/* ── Chọn sự kiện ── */}
        <div className="glass-card event-selection-card">
          <h2>🌐 Chọn sự kiện vĩ mô</h2>
          <div className="event-cards-grid">
            {EVENTS_LIST.map(event => (
              <EventOption
                key={event.id}
                event={event}
                selected={selectedEvent === event.id}
                onSelect={setSelectedEvent}
              />
            ))}
          </div>
          <div className="event-actions">
            <button className="btn btn-warning btn-sm" onClick={handleRandom}>
              🎲 Random sự kiện
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedEvent('none')}
            >
              ✨ Xóa chọn
            </button>
          </div>
        </div>

        {/* ── Tính toán ── */}
        <div className="glass-card calculate-card">
          <h2>🧮 Tính kết quả Quý {currentQuarter}</h2>

          {/* Hiển thị sự kiện đang chọn */}
          <div className="selected-event-summary">
            <div className="evt-title">
              <span style={{ fontSize: '1.3rem' }}>{selectedEventData.emoji}</span>
              {selectedEventData.label}
            </div>
            <div className="evt-desc">{selectedEventData.description}</div>
          </div>

          {/* Checklist nhắc nhở */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '0.82rem',
            color: 'var(--text-sub)',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
              📋 Checklist trước khi tính:
            </div>
            <div>✅ Đã nhập quyết định cho tất cả 8 team chưa?</div>
            <div>✅ Đã chọn sự kiện vĩ mô phù hợp chưa?</div>
            <div>✅ Đã thông báo cho các team biết sự kiện chưa?</div>
          </div>

          {/* Nút tính */}
          <div className="calculate-btn-wrap">
            {confirming ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
                <div style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  color: '#C2410C',
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  ⚠️ Xác nhận tính Quý {currentQuarter}?<br />
                  <span style={{ fontWeight: 400, fontSize: '0.78rem' }}>
                    Sự kiện: {selectedEventData.emoji} {selectedEventData.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-lg" onClick={handleCalculate}>
                    ✅ Xác nhận!
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirming(false)}>
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleCalculate}>
                🚀 Tính toán & Sang Quý {currentQuarter + 1}
              </button>
            )}
          </div>

          {/* Thông tin trạng thái */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', textAlign: 'center' }}>
            Đã hoàn thành {currentQuarter - 1} quý · Dữ liệu tự động lưu localStorage
          </div>
        </div>

        {/* ── Game Log ── */}
        <div className="glass-card game-log-card">
          <h2>📜 Game Log · Lịch sử</h2>
          {gameLogs.length === 0 ? (
            <div className="log-empty">
              Chưa có dữ liệu. Hãy tính quý đầu tiên! 🎮
            </div>
          ) : (
            gameLogs.map((log, qi) => (
              <div key={qi} className="log-quarter">
                <div className="log-quarter-header">
                  <span className="log-q-badge">Quý {log.quarter}</span>
                  <span style={{ fontSize: '1.1rem' }}>{log.eventEmoji}</span>
                  <span className="log-q-event">{log.eventLabel}</span>
                </div>
                <div className="log-entries">
                  {log.entries.map((entry, ei) => (
                    <LogEntry key={ei} entry={entry} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
