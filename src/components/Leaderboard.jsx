/**
 * Leaderboard.jsx — Tab Dashboard
 * Hiển thị bảng xếp hạng, biểu đồ, sự kiện hiện tại và lý luận game.
 */

import { useMemo } from 'react';
import { FOUNDERS, EVENTS } from '../data/founders';

/** Màu gradient cho bar chart theo rank */
const BAR_GRADIENTS = [
  'linear-gradient(90deg, #FACC15, #F97316)',  // 1
  'linear-gradient(90deg, #94A3B8, #CBD5E1)',  // 2
  'linear-gradient(90deg, #F97316, #F43F5E)',  // 3
  'linear-gradient(90deg, #38BDF8, #34D399)',  // 4
  'linear-gradient(90deg, #A78BFA, #38BDF8)',  // 5
  'linear-gradient(90deg, #34D399, #38BDF8)',  // 6
  'linear-gradient(90deg, #F97316, #FACC15)',  // 7
  'linear-gradient(90deg, #A78BFA, #F43F5E)',  // 8
];

export default function Leaderboard({ gameState }) {
  const { teams, currentQuarter, currentEvent } = gameState;
  const eventData = EVENTS[currentEvent] || EVENTS.none;

  // Sắp xếp team theo điểm giảm dần
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  const maxScore = Math.max(...sortedTeams.map(t => t.score), 1);

  function getRankClass(index) {
    if (index === 0) return 'lb-row-top1';
    if (index === 1) return 'lb-row-top2';
    if (index === 2) return 'lb-row-top3';
    return '';
  }

  function getRankBadge(index) {
    if (index === 0) return <span className="rank-badge rank-1">🏆</span>;
    if (index === 1) return <span className="rank-badge rank-2">🥈</span>;
    if (index === 2) return <span className="rank-badge rank-3">🥉</span>;
    return <span className="rank-badge rank-other">{index + 1}</span>;
  }

  return (
    <div className="leaderboard-container fade-in-up">

      {/* ── Hàng trên: Sự kiện + Lý luận ── */}
      <div className="leaderboard-top-row">

        {/* Sự kiện vĩ mô hiện tại */}
        <div className="glass-card macro-event-card fade-in-up">
          <h3>⚡ Sự kiện vĩ mô · Quý {currentQuarter - 1 || '—'}</h3>
          <div className="macro-event-name">
            <span style={{ fontSize: '1.6rem' }}>{eventData.emoji}</span>
            {eventData.label}
          </div>
          <p className="macro-event-desc">{eventData.description}</p>
        </div>

        {/* Lý luận & Badges */}
        <div className="glass-card theory-card fade-in-up">
          <h3>💡 Lý luận kinh tế chính trị</h3>
          <p className="theory-text">
            Trong game, <strong>thị trường</strong> quyết định khách hàng thông qua chất lượng, marketing và giá bán.
            <strong> Nhà nước</strong> tác động bằng chính sách, hỗ trợ, phạt và sandbox.
            Doanh nghiệp muốn thắng không chỉ cần lợi nhuận mà còn cần <strong>SIP</strong> và <strong>SHI</strong>,
            thể hiện tinh thần phát triển vì con người.
          </p>
          <div className="theory-badges">
            <span className="badge badge-market">📈 Market — Cung cầu, Giá bán</span>
            <span className="badge badge-state">🏛️ State — Nhà nước kiến tạo</span>
            <span className="badge badge-service">🤝 Service — Kinh doanh phụng sự</span>
          </div>
        </div>
      </div>

      {/* ── Bảng xếp hạng ── */}
      <div className="glass-card lb-table-card fade-in-up">
        <h2>🏆 Bảng xếp hạng · Quý {currentQuarter}</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Founder</th>
                <th>Ngành</th>
                <th>Ngân sách (M)</th>
                <th>SIP</th>
                <th>SHI</th>
                <th>Tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const founder = FOUNDERS.find(f => f.id === team.id);
                if (!founder) return null;
                return (
                  <tr key={team.id} className={getRankClass(index)}>
                    <td>{getRankBadge(index)}</td>
                    <td>
                      <div className="team-cell">
                        <div className="team-emoji-circle">{founder.emoji}</div>
                        <div className="team-name-col">
                          <strong>{team.customName}</strong>
                          {team.bankrupt && (
                            <div className="bankrupt-tag">⚠️ Nguy cơ phá sản</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                      {founder.founder}
                    </td>
                    <td>
                      <span className="badge badge-market" style={{ fontSize: '0.72rem' }}>
                        {founder.emoji} {founder.sectorShort}
                      </span>
                    </td>
                    <td>
                      <span className={`budget-val${team.budget < 0 ? ' negative' : ''}`}>
                        {team.budget.toFixed(1)}M
                      </span>
                    </td>
                    <td>
                      <span className="sip-val">
                        {typeof team.sip === 'number' ? team.sip.toFixed(1) : team.sip}
                      </span>
                    </td>
                    <td>
                      <span className="shi-val">{team.shi}</span>
                    </td>
                    <td>
                      <span className="score-val">{team.score.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Biểu đồ cột ── */}
      <div className="glass-card bar-chart-card fade-in-up">
        <h3>📊 Biểu đồ Tổng điểm</h3>
        <div className="bar-chart">
          {sortedTeams.map((team, index) => {
            const founder = FOUNDERS.find(f => f.id === team.id);
            const widthPct = maxScore > 0 ? (team.score / maxScore) * 100 : 0;
            return (
              <div key={team.id} className="bar-item">
                <div className="bar-label">
                  <span>{founder?.emoji}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.customName}
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.max(widthPct, 2)}%`,
                      background: BAR_GRADIENTS[index] || BAR_GRADIENTS[0],
                    }}
                  >
                    <span className="bar-fill-text">{team.score.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chú thích ── */}
      <div className="glass-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
          <span><strong style={{ color: 'var(--text-main)' }}>Tổng điểm</strong> = Ngân sách × (1 + SIP/100) + SHI</span>
          <span><strong style={{ color: '#0284C7' }}>SIP</strong> = Chỉ số Cống hiến Xã hội (Social Impact Points)</span>
          <span><strong style={{ color: '#7C3AED' }}>SHI</strong> = Chỉ số Hòa nhập Xã hội (Social Harmony Index)</span>
        </div>
      </div>

    </div>
  );
}
