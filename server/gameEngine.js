/**
 * gameEngine.js — Drama & Interactive edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Tính kết quả khi một team chọn option (A/B/C/D) + nhập số tiền đầu tư.
 * Tính kết quả khi admin dùng chiêu thức.
 * Công thức điểm: Score = Budget + (SIP × 2) + (AP × 3)
 */

import { DRAMA_EVENTS } from './founders.js';

// ─── Công thức điểm ──────────────────────────────────────────────────────────
export function calcScore(budget, sip, ap) {
  return budget + sip * 2 + ap * 3;
}

// ─── Áp dụng perk ────────────────────────────────────────────────────────────
function applyPerks(delta, perkKey) {
  let { budget, sip, ap } = { ...delta };
  const logs = [];

  if (perkKey === 'sipMultiplier' && sip > 0) {
    const bonus = Math.floor(sip * 0.5);
    sip += bonus;
    logs.push(`📚 [EdTech Perk] SIP ×1.5 → +${bonus} thêm`);
  }
  if (perkKey === 'budgetBonus') {
    budget += 15;
    logs.push(`🏥 [MedTech Perk] +15M thưởng`);
  }
  if (perkKey === 'startBudgetBonus' && budget < 0) {
    const reduction = Math.floor(Math.abs(budget) * 0.25);
    budget += reduction;
    logs.push(`💳 [FinTech Perk] Giảm thiệt hại 25% → +${reduction}M`);
  }
  if (perkKey === 'sipBonus' && sip > 0) {
    sip += 5;
    logs.push(`♻️ [GreenTech Perk] SIP +5 thêm`);
  }
  if (perkKey === 'apMultiplier' && ap > 0) {
    const bonus = Math.ceil(ap * 0.5);
    ap += bonus;
    logs.push(`🤖 [AI Perk] AP ×1.5 → +${bonus} thêm`);
  }
  if (perkKey === 'apBonus') {
    ap += 2;
    logs.push(`🛍️ [FMCG Perk] +2 AP thêm`);
  }

  return { budget, sip, ap, logs };
}

/**
 * Áp dụng sự kiện drama.
 * @param {object} team
 * @param {string} eventId
 * @param {string} optionId   'A' | 'B' | 'C' | 'D'
 * @param {number} investAmount  số tiền đầu tư (M), mặc định 0
 * @returns {{ newState, logs, summary }}
 */
export function applyDramaEvent(team, eventId, optionId, investAmount = 0) {
  const event = DRAMA_EVENTS.find(e => e.id === eventId);
  if (!event) return { newState: team, logs: [`Sự kiện ${eventId} không tồn tại`], summary: '' };

  const option = event.options.find(o => o.id === optionId);
  if (!option) return { newState: team, logs: [`Option ${optionId} không tồn tại`], summary: '' };

  const invest = Math.max(0, Math.floor(investAmount));

  // ── Tính delta ──────────────────────────────────────────────────────────────
  let dB = option.base.budget;
  let dS = option.base.sip;
  let dA = option.base.ap;

  if (option.invest && invest > 0) {
    const perM = option.perM || {};
    // Budget: chi invest, thu về invest * budgetReturn
    dB += -invest + invest * (perM.budget || 0);
    dS += invest * (perM.sip || 0);
    dA += invest * (perM.ap  || 0);
  }

  // ── Áp dụng perk ────────────────────────────────────────────────────────────
  const { budget: finalB, sip: finalS, ap: finalA, logs: perkLogs } = applyPerks(
    { budget: dB, sip: dS, ap: dA }, team.perkKey
  );

  // E-Commerce perk: budget return ×1.2 (nếu dB từ invest dương)
  let extraBudget = 0;
  if (team.perkKey === 'optionBBonus' && option.invest && invest > 0) {
    const baseInvestReturn = invest * (option.perM?.budget || 0) - invest;
    if (baseInvestReturn > 0) {
      extraBudget = Math.floor(baseInvestReturn * 0.2);
      perkLogs.push(`🛒 [E-Commerce Perk] Budget invest return ×1.2 → +${extraBudget}M`);
    }
  }

  const newBudget = team.budget + finalB + extraBudget;
  const newSip    = Math.max(0, team.sip + Math.floor(finalS));
  const newAp     = Math.max(0, team.ap  + Math.floor(finalA));
  const newScore  = calcScore(newBudget, newSip, newAp);
  const bankrupt  = newBudget < 0;
  const warning   = !bankrupt && newBudget < 20;

  // ── Build logs ───────────────────────────────────────────────────────────────
  const dBFinal = finalB + extraBudget;
  const dSFinal = Math.floor(finalS);
  const dAFinal = Math.floor(finalA);

  const parts = [];
  if (dBFinal !== 0) parts.push(`${dBFinal > 0 ? '+' : ''}${dBFinal.toFixed(1)}M 💰`);
  if (dSFinal !== 0) parts.push(`${dSFinal > 0 ? '+' : ''}${dSFinal} 🌟`);
  if (dAFinal !== 0) parts.push(`${dAFinal > 0 ? '+' : ''}${dAFinal} ⚡`);

  const logs = [
    `${event.emoji} [${event.label}] Chọn ${optionId}: "${option.label}"`,
    invest > 0 ? `💸 Đầu tư: ${invest}M` : null,
    `📊 Kết quả: ${parts.join(' · ') || 'Không đổi'}`,
    `💰 Budget: ${team.budget.toFixed(1)} → ${newBudget.toFixed(1)}M`,
    `🌟 SIP: ${team.sip} → ${newSip}`,
    `⚡ AP: ${team.ap} → ${newAp}`,
    ...perkLogs,
    bankrupt ? `⚠️ NGUY CƠ PHÁ SẢN! Budget: ${newBudget.toFixed(1)}M` : null,
    warning  ? `⚠️ Budget chỉ còn ${newBudget.toFixed(1)}M` : null,
  ].filter(Boolean);

  const summary = `${team.emoji} ${team.customName}: Chọn ${optionId} "${option.label}"${invest > 0 ? ` (đầu tư ${invest}M)` : ''} → ${parts.join(', ') || 'không đổi'}`;

  return {
    newState: { budget: newBudget, sip: newSip, ap: newAp, score: newScore, bankrupt, warning },
    logs,
    summary,
  };
}

/**
 * Áp dụng chiêu thức.
 */
export function applyTactic(attacker, target, tacticId, content = '') {
  const AP_COST = { freeze: 3, expose: 1, steal: 2, alliance: 2, whirlwind: 2, fog: 2 };
  const cost = AP_COST[tacticId];

  if (attacker.ap < cost) {
    return { error: `Không đủ AP! Cần ${cost} AP, bạn chỉ có ${attacker.ap} AP.` };
  }
  if (tacticId === 'freeze' && target?.perkKey === 'immuneFreeze') {
    return { error: `🔒 ${target.customName} (CyberSec) miễn nhiễm chiêu Đóng băng!` };
  }

  let attackerDelta = { ap: attacker.ap - cost };
  let targetDelta   = {};
  let feedEntry     = null;
  const logs        = [];

  switch (tacticId) {
    case 'freeze':
      targetDelta = { frozenNext: true };
      logs.push(`❄️ ${attacker.customName} đóng băng ${target.customName} (tốn ${cost} AP)`);
      logs.push(`🧊 ${target.customName} vòng sau: câu hỏi & đáp án bị ẩn 35 giây đầu!`);
      break;

    case 'expose': {
      const sipLoss = 5;
      targetDelta = { sip: Math.max(0, target.sip - sipLoss) };
      feedEntry = {
        type: 'expose',
        from: attacker.customName, fromEmoji: attacker.emoji,
        to: target.customName, toEmoji: target.emoji,
        content: content || '(Không có nội dung)',
        ts: Date.now(),
      };
      logs.push(`📢 ${attacker.customName} bóc phốt ${target.customName}: "${content}"`);
      logs.push(`📉 ${target.customName} mất ${sipLoss} Phụng Sự`);
      break;
    }

    case 'steal': {
      const amount = target?.perkKey === 'immuneFreeze' ? 20 : 15;
      targetDelta   = { budget: target.budget - amount };
      attackerDelta = { ...attackerDelta, budget: attacker.budget + amount };
      logs.push(`🕵️ ${attacker.customName} ăn trộm ${amount}M từ ${target.customName}`);
      if (amount === 20) logs.push(`🔒 CyberSec bị ăn trộm thêm: -20M`);
      break;
    }

    case 'whirlwind':
      targetDelta = { whirlwindNext: true };
      logs.push(`🌪️ ${attacker.customName} tung lốc xoáy vào ${target.customName} (tốn ${cost} AP)`);
      logs.push(`💫 ${target.customName} vòng sau: đáp án trôi lắc liên tục!`);
      break;

    case 'fog':
      targetDelta = { fogNext: true };
      logs.push(`🌫️ ${attacker.customName} phủ sương mù lên ${target.customName} (tốn ${cost} AP)`);
      logs.push(`🌁 ${target.customName} vòng sau: sương trôi che ~45% đáp án!`);
      break;

    case 'alliance':
      targetDelta   = { budget: target.budget + 20, sip: target.sip + 10 };
      attackerDelta = { ...attackerDelta, budget: attacker.budget + 20, sip: attacker.sip + 10 };
      logs.push(`🤝 ${attacker.customName} liên minh với ${target.customName}`);
      logs.push(`💰 Cả hai +20M · 🌟 Cả hai +10 SIP`);
      feedEntry = {
        type: 'alliance',
        from: attacker.customName, fromEmoji: attacker.emoji,
        to: target.customName, toEmoji: target.emoji,
        content: 'Hai startup bắt tay hợp tác!',
        ts: Date.now(),
      };
      break;
  }

  // Recalculate scores
  const aB = attackerDelta.budget ?? attacker.budget;
  const aS = attackerDelta.sip    ?? attacker.sip;
  const aA = attackerDelta.ap     ?? attacker.ap;
  attackerDelta.score = calcScore(aB, aS, aA);

  if (target && Object.keys(targetDelta).length > 0
      && !targetDelta.frozen && !targetDelta.frozenNext
      && !targetDelta.whirlwindNext && !targetDelta.fogNext) {
    const tB = targetDelta.budget ?? target.budget;
    const tS = targetDelta.sip    ?? target.sip;
    const tA = targetDelta.ap     ?? target.ap;
    targetDelta.score = calcScore(tB, tS, tA);
  }

  return { attackerDelta, targetDelta, feedEntry, logs, error: null };
}
