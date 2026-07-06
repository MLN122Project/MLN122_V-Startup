/**
 * economyEngine.js
 * Toàn bộ công thức tính kết quả mỗi quý cho V-Startup.
 * Đây là "luật chơi" mô phỏng kinh tế thị trường định hướng XHCN.
 */

import { FOUNDERS, EVENTS } from '../data/founders';

/**
 * Tính kết quả một quý cho tất cả team.
 * @param {Object} gameState - state hiện tại của game
 * @param {string} eventId   - ID sự kiện vĩ mô quý này
 * @returns {Array} mảng kết quả cho mỗi team
 */
export function calculateQuarterResults(gameState, eventId) {
  const { teams } = gameState;
  const results = [];

  for (const team of teams) {
    const founder = FOUNDERS.find(f => f.id === team.id);
    if (!founder) continue;

    const { rd, marketing, community, price } = team.decisions;
    const safeRd = Number(rd) || 0;
    const safeMktg = Number(marketing) || 0;
    const safeCom = Number(community) || 0;
    const safePrice = Number(price) || 1;
    const logs = [];

    // ── 1. Chất lượng sản phẩm ──────────────────────────────────────
    let quality = safeRd;
    if (founder.teamKey === 'ai') {
      quality = safeRd * 1.2;
      logs.push(`🤖 [AI Perk] R&D hiệu quả x1.2 → quality = ${quality.toFixed(1)}`);
    }

    // ── 2. Sức mạnh marketing ────────────────────────────────────────
    let marketingPower = safeMktg;
    if (founder.teamKey === 'ecommerce') {
      marketingPower = safeMktg * 2;
      logs.push(`🛒 [E-Commerce Perk] Marketing x2 → marketingPower = ${marketingPower.toFixed(1)}`);
    }

    // ── 3. Demand cơ bản ─────────────────────────────────────────────
    let demand = (quality * 2.5 + marketingPower * 2.0) / (safePrice * 0.15 + 1);

    // AI thêm 20% demand
    if (founder.teamKey === 'ai') {
      demand *= 1.2;
      logs.push(`🤖 [AI Perk] Demand +20% → ${demand.toFixed(2)}`);
    }

    // Sự kiện: Tuần lễ Cóc Vàng FPTU
    if (eventId === 'cocVang') {
      if (founder.teamKey === 'edtech' || founder.teamKey === 'ecommerce') {
        demand *= 2;
        logs.push(`🐸 [Cóc Vàng] Demand x2 → ${demand.toFixed(2)}`);
      }
    }

    // Sự kiện: Thiên tai bão lũ
    if (eventId === 'storm') {
      if (safeCom === 0) {
        demand *= 0.85;
        logs.push(`🌊 [Bão lũ] Không có phụng sự → demand x0.85 → ${demand.toFixed(2)}`);
      } else {
        logs.push(`🌊 [Bão lũ] Có phụng sự cộng đồng → demand giữ nguyên`);
      }
    }

    // Sự kiện: Startup vướng pháp lý
    if (eventId === 'legalTrap') {
      if (['ai', 'fintech', 'ecommerce'].includes(founder.teamKey)) {
        demand *= 0.75;
        logs.push(`⚖️ [Pháp lý] ${founder.sectorShort} bị rủi ro pháp lý → demand x0.75 → ${demand.toFixed(2)}`);
      }
    }

    // Sự kiện: Nhà nước mở sandbox
    if (eventId === 'sandbox') {
      if (['ai', 'fintech', 'ecommerce'].includes(founder.teamKey)) {
        demand *= 1.4;
        logs.push(`🚀 [Sandbox] ${founder.sectorShort} được sandbox → demand x1.4 → ${demand.toFixed(2)}`);
      }
    }

    // ── 4. Capacity (sức sản xuất tối đa) ───────────────────────────
    const capacity = quality * 10 + 20;

    // ── 5. Số sản phẩm bán được ──────────────────────────────────────
    const sold = Math.floor(Math.min(demand, capacity));
    logs.push(`📊 Demand=${demand.toFixed(1)} | Capacity=${capacity.toFixed(1)} | Bán được=${sold} đơn vị`);

    // ── 6. Doanh thu ─────────────────────────────────────────────────
    const revenue = sold * safePrice;
    logs.push(`💰 Doanh thu = ${sold} × ${safePrice}M = ${revenue.toFixed(1)}M`);

    // ── 7. Chi phí thực tế ───────────────────────────────────────────
    const cost = safeRd + safeMktg + safeCom;
    logs.push(`💸 Chi phí = R&D(${safeRd}) + MKT(${safeMktg}) + Cộng đồng(${safeCom}) = ${cost}M`);

    // ── 8. Hoàn tiền R&D (Đề án 844) ────────────────────────────────
    let refund = 0;
    if (eventId === 'de844') {
      refund = safeRd * 0.3;
      if (founder.teamKey === 'fintech') {
        refund *= 1.25;
        logs.push(`🏛️ [Đề án 844 + FinTech Perk] Hoàn R&D: ${safeRd} × 30% × 1.25 = ${refund.toFixed(1)}M`);
      } else {
        logs.push(`🏛️ [Đề án 844] Hoàn R&D: ${safeRd} × 30% = ${refund.toFixed(1)}M`);
      }
    }

    // ── 9. Phạt ──────────────────────────────────────────────────────
    let penalty = 0;

    if (eventId === 'cyberCrisis') {
      if (safeRd < 15) {
        penalty = 20;
        logs.push(`🔐 [Khủng hoảng mạng] R&D = ${safeRd}M < 15M → Phạt 20M`);
      } else {
        logs.push(`🔐 [Khủng hoảng mạng] R&D = ${safeRd}M ≥ 15M → Miễn phạt`);
      }
    }

    if (eventId === 'storm' && founder.teamKey === 'agritech') {
      logs.push(`🌱 [AgriTech Perk] Giảm 20% thiệt hại thiên tai — bảo vệ được áp dụng`);
    }

    // ── 10. SIP tích lũy ─────────────────────────────────────────────
    let sipGain = safeCom;

    // EdTech perk: SIP x1.5 (áp dụng trước event)
    if (founder.teamKey === 'edtech') {
      sipGain *= 1.5;
      logs.push(`📚 [EdTech Perk] SIP x1.5 → sipGain = ${sipGain.toFixed(1)}`);
    }

    // Bão lũ: toàn bộ SIP x2
    if (eventId === 'storm') {
      sipGain *= 2;
      logs.push(`🌊 [Bão lũ] SIP x2 → sipGain = ${sipGain.toFixed(1)}`);
    }

    // Logistics trong bão lũ: x2 thêm lần nữa (tổng x4)
    if (eventId === 'storm' && founder.teamKey === 'logistics') {
      sipGain *= 2;
      logs.push(`🚚 [Logistics Perk + Bão lũ] SIP x2 thêm → sipGain = ${sipGain.toFixed(1)} (tổng x4)`);
    }

    // ── 11. SHI tích lũy ─────────────────────────────────────────────
    let shiGain = Math.floor(safeCom * 1.2);

    if (eventId === 'storm' && safeCom > 0) {
      shiGain += 10;
      logs.push(`🌊 [Bão lũ] Có cứu trợ → SHI +10 bonus`);
    }

    if (founder.teamKey === 'greentech' && safeCom > 0) {
      shiGain += 5;
      logs.push(`♻️ [GreenTech Perk] Phụng sự xanh → SHI +5 bonus`);
    }

    // ── 12. Ngân sách mới ────────────────────────────────────────────
    // MedTech bonus đầu quý
    let medBonus = 0;
    if (founder.teamKey === 'medtech') {
      medBonus = 15;
      logs.push(`🏥 [MedTech Perk] Quỹ Y tế nhân văn → +15M`);
    }

    const newBudget = team.budget - cost + revenue + refund - penalty + medBonus;
    const bankrupt = newBudget < 0;

    if (bankrupt) {
      logs.push(`⚠️ CẢNH BÁO: Ngân sách âm ${newBudget.toFixed(1)}M — Nguy cơ phá sản!`);
    }

    logs.push(`📈 Ngân sách: ${team.budget.toFixed(1)} - ${cost} + ${revenue.toFixed(1)} + ${refund.toFixed(1)} - ${penalty} + ${medBonus} = ${newBudget.toFixed(1)}M`);

    // ── 13. SIP & SHI mới ────────────────────────────────────────────
    const newSip = team.sip + sipGain;
    const newShi = team.shi + shiGain;

    // ── 14. Tổng điểm ────────────────────────────────────────────────
    const score = newBudget * (1 + newSip / 100) + newShi;

    results.push({
      id: team.id,
      budget: newBudget,
      sip: newSip,
      shi: newShi,
      score,
      lastRevenue: revenue,
      lastSold: sold,
      lastCost: cost,
      lastRefund: refund,
      lastPenalty: penalty,
      bankrupt,
      logs,
      sipGain,
      shiGain,
      revenue,
      cost,
      refund,
      penalty,
      medBonus,
    });
  }

  return results;
}

/**
 * Tính score từ budget, sip, shi — dùng khi khởi tạo state
 */
export function calcScore(budget, sip, shi) {
  return budget * (1 + sip / 100) + shi;
}

/**
 * Validate quyết định của team trước khi lưu.
 * Trả về mảng các lỗi (rỗng = hợp lệ).
 */
export function validateDecisions(decisions, currentBudget) {
  const errors = [];
  const { rd, marketing, community, price } = decisions;

  const numRd = Number(rd) || 0;
  const numMktg = Number(marketing) || 0;
  const numCom = Number(community) || 0;
  const numPrice = Number(price) || 0;

  if (numRd < 0) errors.push('R&D không được âm.');
  if (numMktg < 0) errors.push('Marketing không được âm.');
  if (numCom < 0) errors.push('Phụng sự cộng đồng không được âm.');
  if (numPrice <= 0) errors.push('Giá bán phải lớn hơn 0.');

  const totalSpend = numRd + numMktg + numCom;
  if (totalSpend > currentBudget) {
    errors.push(
      `Tổng chi phí (${totalSpend}M) vượt quá ngân sách hiện có (${currentBudget.toFixed(1)}M). Cần giảm ${(totalSpend - currentBudget).toFixed(1)}M.`
    );
  }

  return errors;
}
