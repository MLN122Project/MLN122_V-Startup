/** Nội dung hướng dẫn chung — dùng cho Home + màn game */

export const SCORE_FORMULA = 'Điểm = Budget + (SIP × 2) + (AP × 3)'

export const METRICS = [
  { emoji: '💰', name: 'Budget', short: 'Ngân sách', color: '#059669',
    desc: 'Tiền của startup. Kiếm từ sự kiện, mất khi đầu tư hoặc chiêu thức.',
    example: '100M ban đầu → chọn sự kiện +30M → còn 130M' },
  { emoji: '🌟', name: 'SIP', short: 'Phụng Sự', color: '#0284C7',
    desc: 'Social Impact Points — điểm phụng sự xã hội. Mỗi SIP = +2 điểm tổng.',
    example: 'Chọn cứu trợ thiên tai → +25 SIP → +50 điểm' },
  { emoji: '⚡', name: 'AP', short: 'Action Points', color: '#D97706',
    desc: 'Điểm hành động dùng cho chiêu thức. Mỗi AP = +3 điểm tổng.',
    example: 'Bắt đầu 5 AP → dùng Đóng băng tốn 3 AP → còn 2 AP' },
]

export const GAME_FLOW = [
  { label: 'Admin tạo phòng', sub: 'Nhận mã phòng (VD: VST123) cho team tham gia' },
  { label: 'Team tham gia & chọn ngành', sub: 'Vào /join · chọn 1 trong 8 ngành · đặt tên startup' },
  { label: 'Admin bắt đầu game', sub: 'Cần ít nhất 1 team online' },
  { label: 'Admin random sự kiện', sub: '8 sự kiện drama, mỗi sự kiện chỉ xuất hiện 1 lần' },
  { label: 'Tất cả team chọn đáp án trong 40 giây', sub: '~90% số team được random 1 trong 6 chiêu thức · Từ 2 team trở lên luôn có ít nhất 1 team có chiêu' },
  { label: 'Chiêu Đóng băng', sub: 'Vòng sau: câu hỏi & đáp án bị che 35s đầu — chỉ 5s cuối mới chọn được' },
  { label: 'Admin → Sự kiện tiếp theo', sub: 'Lặp đến hết 8 sự kiện hoặc Admin kết thúc' },
  { label: 'Màn hình Winner', sub: 'Top 3 + giải đặc biệt (Drama King, Ice Master...)' },
]

export const TACTICS_GUIDE = [
  { emoji: '❄️', name: 'Đóng băng', cost: '3 AP', desc: 'Vòng sau che full màn hình băng 35s — 5s cuối mới thấy câu hỏi. CyberSec miễn nhiễm.' },
  { emoji: '📢', name: 'Bóc phốt', cost: '1 AP', desc: 'Đội mục tiêu -5 SIP. Nội dung hiện trên Live Feed.' },
  { emoji: '🕵️', name: 'Ăn trộm', cost: '2 AP', desc: 'Lấy 15M từ đội mục tiêu (CyberSec bị -20M).' },
  { emoji: '🤝', name: 'Liên minh', cost: '2 AP', desc: 'Cả hai đội +20M và +10 SIP.' },
  { emoji: '🌪️', name: 'Lốc xoáy', cost: '2 AP', desc: 'Vòng sau: đáp án hoán đổi vị trí mỗi 4 giây trong 40s chọn.' },
  { emoji: '🌫️', name: 'Sương mù', cost: '2 AP', desc: 'Vòng sau: sương trôi che ~45% đáp án, khó đọc.' },
]

export const RULES = [
  { icon: '💸', title: 'Đầu tư ≤ Budget', desc: 'Số tiền nhập khi chọn phương án không được vượt ngân sách hiện có.' },
  { icon: '✅', title: 'Tất cả chọn cùng lúc', desc: 'Khi Admin random sự kiện, mọi team online cùng chọn phương án A/B/C/D.' },
  { icon: '⏱', title: '40 giây / vòng', desc: 'Hết giờ tự chọn phương án A. Team bị đóng băng chỉ chọn được 5 giây cuối.' },
  { icon: '❄️', title: 'Đóng băng = che màn hình', desc: 'Vòng kế sau bị che câu hỏi 35 giây đầu, hiện lại 5 giây cuối để chọn.' },
  { icon: '🎯', title: '8 sự kiện / ván', desc: 'Mỗi sự kiện drama chỉ random đúng 1 lần trong cả game.' },
  { icon: '⚠️', title: 'Nguy cơ phá sản', desc: 'Budget < 0 → cảnh báo đỏ, team vẫn chơi tiếp.' },
  { icon: '🔄', title: 'Vào lại được', desc: 'Mất mạng: vào lại /join hoặc /game với cùng mã phòng + team.' },
]

export const EXAMPLE_TURN = [
  ['1', 'Sự kiện', 'Gói tín dụng Nhà nước 🏛️', 'Admin random — Chính sách vay ưu đãi'],
  ['2', 'Chọn B', 'Đầu tư mở rộng sản xuất 20M', 'Đăng ký theo quy định cơ quan quản lý'],
  ['3', 'Kết quả', 'Budget +10M · SIP +0 · AP +0', '100M → 110M'],
  ['4', 'Perk EdTech', '—', 'Không áp dụng (SIP = 0)'],
  ['5', 'Chiêu thức', 'Liên minh với GreenTech', 'Cả hai +20M · +10 SIP'],
  ['6', 'Điểm mới', '130M + 20 SIP + 5 AP', 'Score = 130 + 40 + 15 = 185'],
]

export const SECTORS = [
  { emoji: '🛍️', name: 'FMCG', perk: '+2 AP sau mỗi sự kiện' },
  { emoji: '📚', name: 'EdTech', perk: 'SIP nhận ×1.5' },
  { emoji: '🏥', name: 'MedTech', perk: '+15M sau mỗi sự kiện' },
  { emoji: '💳', name: 'FinTech', perk: '120M ban đầu · giảm thiệt hại 25%' },
  { emoji: '♻️', name: 'GreenTech', perk: '15 SIP ban đầu · SIP event +5' },
  { emoji: '🤖', name: 'AI', perk: '7 AP ban đầu · AP nhận ×1.5' },
  { emoji: '🔒', name: 'CyberSec', perk: 'Miễn đóng băng · bị ăn trộm -20M' },
  { emoji: '🛒', name: 'E-Commerce', perk: 'Budget return invest ×1.2' },
]
