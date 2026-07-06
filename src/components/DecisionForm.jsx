/**
 * DecisionForm.jsx — Tab Cập nhật quyết định
 * Cho phép admin nhập R&D, Marketing, Phụng sự, Giá bán cho mỗi team.
 * Có validation đầy đủ và hiển thị trực quan usage ngân sách.
 */

import { useState, useCallback } from 'react';
import { FOUNDERS } from '../data/founders';
import { validateDecisions } from '../utils/economyEngine';

/** Card nhập quyết định cho một team */
function TeamDecisionCard({ team, onUpdate }) {
  const founder = FOUNDERS.find(f => f.id === team.id);

  // Local state form - dùng giá trị từ team.decisions
  const [form, setForm] = useState({
    rd: team.decisions.rd,
    marketing: team.decisions.marketing,
    community: team.decisions.community,
    price: team.decisions.price,
  });
  const [customName, setCustomName] = useState(team.customName);
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);

  function handleChange(field, value) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setSaved(false);
    // Validate realtime
    const errs = validateDecisions(
      { ...updated, price: updated.price },
      team.budget
    );
    setErrors(errs);
  }

  function handleSave() {
    const errs = validateDecisions(form, team.budget);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    onUpdate(team.id, {
      rd: Number(form.rd) || 0,
      marketing: Number(form.marketing) || 0,
      community: Number(form.community) || 0,
      price: Number(form.price) || 1,
    }, customName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!founder) return null;

  const totalSpend = (Number(form.rd) || 0) + (Number(form.marketing) || 0) + (Number(form.community) || 0);
  const budgetUsagePct = team.budget > 0 ? Math.min((totalSpend / team.budget) * 100, 100) : 0;
  const isOver = totalSpend > team.budget;
  const isWarn = !isOver && budgetUsagePct > 80;
  const barClass = isOver ? 'over' : isWarn ? 'warn' : 'ok';

  // Màu accent theo founder
  const accentStyle = {
    borderLeft: `3px solid ${founder.color}`,
  };

  return (
    <div className="glass-card decision-card fade-in-up" style={accentStyle}>

      {/* Header card */}
      <div className="decision-card-header">
        <div className="team-emoji">{founder.emoji}</div>
        <div className="team-info">
          <input
            style={{
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              outline: 'none',
              width: '100%',
              padding: 0,
            }}
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            title="Nhấn để đổi tên startup"
            placeholder="Tên startup..."
          />
          <p>{founder.sector}</p>
        </div>
      </div>

      {/* Thống kê hiện tại */}
      <div className="team-stats-row">
        <span className="stat-chip budget">
          💰 {team.budget.toFixed(1)}M
        </span>
        <span className="stat-chip sip">
          🌟 SIP: {typeof team.sip === 'number' ? team.sip.toFixed(1) : team.sip}
        </span>
        <span className="stat-chip shi">
          🤝 SHI: {team.shi}
        </span>
        <span className="stat-chip score">
          🏆 {team.score.toFixed(1)} điểm
        </span>
      </div>

      {/* Perk nhắc nhở */}
      <div style={{
        background: `${founder.colorLight}`,
        border: `1px solid ${founder.color}30`,
        borderRadius: '10px',
        padding: '8px 12px',
        marginBottom: '12px',
        fontSize: '0.76rem',
        color: 'var(--text-sub)',
      }}>
        ✨ <strong>Perk:</strong> {founder.perk}
      </div>

      {/* Form inputs */}
      <div className="form-inputs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="input-row">
            <label>🔬 R&D (M)</label>
            <input
              type="number"
              min="0"
              value={form.rd}
              onChange={e => handleChange('rd', e.target.value)}
              className={isOver ? 'error' : ''}
            />
          </div>
          <div className="input-row">
            <label>📢 Marketing (M)</label>
            <input
              type="number"
              min="0"
              value={form.marketing}
              onChange={e => handleChange('marketing', e.target.value)}
              className={isOver ? 'error' : ''}
            />
          </div>
          <div className="input-row">
            <label>🤝 Phụng sự cộng đồng (M)</label>
            <input
              type="number"
              min="0"
              value={form.community}
              onChange={e => handleChange('community', e.target.value)}
              className={isOver ? 'error' : ''}
            />
          </div>
          <div className="input-row">
            <label>🏷️ Giá bán (M/đơn vị)</label>
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={e => handleChange('price', e.target.value)}
            />
          </div>
        </div>

        {/* Thanh sử dụng ngân sách */}
        <div className="budget-bar-mini">
          <div className="budget-bar-track">
            <div
              className={`budget-bar-fill ${barClass}`}
              style={{ width: `${Math.min(budgetUsagePct, 100)}%` }}
            />
          </div>
          <div className="budget-usage-text">
            <span>
              Chi: {totalSpend}M / {team.budget.toFixed(1)}M ngân sách
              {isOver && <span style={{ color: '#DC2626', fontWeight: 700 }}> (VƯỢT {(totalSpend - team.budget).toFixed(1)}M!)</span>}
            </span>
            <span style={{ color: isOver ? '#DC2626' : isWarn ? '#D97706' : '#16A34A', fontWeight: 600 }}>
              {budgetUsagePct.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Lỗi validation */}
        {errors.length > 0 && (
          <div className="validation-error">
            {errors.map((err, i) => <div key={i}>⚠️ {err}</div>)}
          </div>
        )}

        {/* Kết quả preview */}
        {errors.length === 0 && totalSpend > 0 && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.76rem',
            color: 'var(--text-sub)',
          }}>
            💡 Còn lại sau đầu tư: <strong style={{ color: '#059669' }}>
              {(team.budget - totalSpend).toFixed(1)}M
            </strong> (chưa tính doanh thu)
          </div>
        )}

        {/* Nút lưu */}
        <div className="save-btn-row">
          {saved ? (
            <div className="save-success">✅ Đã lưu quyết định!</div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={errors.length > 0}
              style={{ opacity: errors.length > 0 ? 0.5 : 1 }}
            >
              💾 Lưu quyết định
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Component chính */
export default function DecisionForm({ teams, onUpdate }) {
  return (
    <div className="decision-form-container">
      <div className="section-header">
        <h2 className="section-title">📝 Cập nhật quyết định</h2>
        <p className="section-subtitle">
          Nhập quyết định đầu tư cho từng team. R&D + Marketing + Phụng sự không được vượt ngân sách hiện có.
        </p>
      </div>

      {/* Hướng dẫn nhanh */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
          <span>🔬 <strong>R&D</strong> → tăng chất lượng & capacity</span>
          <span>📢 <strong>Marketing</strong> → tăng demand</span>
          <span>🤝 <strong>Phụng sự</strong> → tăng SIP & SHI</span>
          <span>🏷️ <strong>Giá cao</strong> → doanh thu/đơn cao nhưng demand giảm</span>
        </div>
      </div>

      <div className="decision-grid">
        {teams.map(team => (
          <TeamDecisionCard
            key={team.id}
            team={team}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
