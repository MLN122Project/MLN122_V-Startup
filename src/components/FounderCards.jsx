/**
 * FounderCards.jsx — Tab Nhân vật / Perks
 * Hiển thị thông tin 8 team founder, perk đặc biệt và ý nghĩa xã hội.
 */

import { FOUNDERS } from '../data/founders';

/** Card một founder */
function FounderCard({ founder, index }) {
  return (
    <div
      className="glass-card founder-card fade-in-up"
      style={{
        borderTop: `3px solid ${founder.color}`,
        color: founder.color,
      }}
    >
      {/* Top: emoji + tên + sector */}
      <div className="founder-card-top">
        <div className="founder-emoji-big">{founder.emoji}</div>
        <div>
          <div className="founder-name">{founder.name}</div>
          <div className="founder-sector">{founder.sector}</div>
          <span className="founder-sector-badge">{founder.sectorShort}</span>
        </div>
      </div>

      {/* Perk */}
      <div className="founder-perk" style={{ borderLeftColor: founder.color }}>
        <div className="founder-perk-title">⚡ Perk đặc biệt</div>
        <div className="founder-perk-text" style={{ color: 'var(--text-main)' }}>
          {founder.perk}
        </div>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-light)', marginTop: '4px' }}>
          {founder.perkDetail}
        </div>
      </div>

      {/* Ý nghĩa */}
      <div className="founder-meaning">
        <span>💡</span>
        <span>{founder.meaning}</span>
      </div>

      {/* Stats ban đầu */}
      <div className="founder-starting-stats">
        <span className="start-stat" style={{ color: '#059669' }}>
          💰 {founder.startBudget}M khởi đầu
        </span>
        <span className="start-stat" style={{ color: '#0284C7' }}>
          🌟 SIP ban đầu: {founder.startSip}
        </span>
      </div>
    </div>
  );
}

/** Component chính */
export default function FounderCards() {
  return (
    <div className="founder-cards-container">

      {/* Giới thiệu */}
      <div className="glass-card founder-intro-card fade-in-up">
        <h2>👥 8 Team Startup · FPTU</h2>
        <p>
          Mỗi team đại diện cho một lĩnh vực khởi nghiệp, mang perk độc đáo phản ánh tinh thần
          <strong> kinh tế thị trường định hướng xã hội chủ nghĩa</strong> — vừa cạnh tranh hiệu quả,
          vừa phụng sự cộng đồng và đất nước.
        </p>

        {/* Bảng tóm tắt perk */}
        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(56, 189, 248, 0.2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-sub)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Team</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-sub)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Perk</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-sub)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ngân sách đầu</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-sub)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>SIP đầu</th>
              </tr>
            </thead>
            <tbody>
              {FOUNDERS.map((f, i) => (
                <tr
                  key={f.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>{f.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--text-sub)' }}>{f.perk}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                    {f.startBudget}M
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 600, color: '#0284C7' }}>
                    {f.startSip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid cards */}
      <div className="founder-grid">
        {FOUNDERS.map((founder, index) => (
          <FounderCard key={founder.id} founder={founder} index={index} />
        ))}
      </div>

      {/* Footer lý luận */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              🏛️ Mô hình kinh tế thị trường định hướng XHCN
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
              Các team startup trong game không chỉ tối đa hóa lợi nhuận (ngân sách) mà còn tích lũy
              <strong> SIP</strong> (Cống hiến Xã hội) và <strong>SHI</strong> (Hòa nhập Xã hội) —
              hai chỉ số phản ánh tinh thần doanh nghiệp phụng sự cộng đồng trong nền kinh tế định hướng XHCN.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              📐 Công thức Tổng điểm
            </div>
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}>
              Score = Budget × (1 + SIP/100) + SHI
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 6 }}>
              → Team có SIP cao sẽ khuếch đại mạnh ngân sách thành điểm số tổng.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
