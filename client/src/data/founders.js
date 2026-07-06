/** client mirror — sync với server/founders.js */

export const DRAMA_EVENTS = [
  {
    "id": "funding",
    "label": "Gói tín dụng ưu đãi Nhà nước 🏛️",
    "emoji": "🏛️",
    "color": "#34D399",
    "description": "Ngân hàng Chính sách xã hội mở đợt cho vay lãi suất thấp theo chỉ đạo Chính phủ. Doanh nghiệp chọn hướng sử dụng vốn theo quy định Nhà nước:",
    "options": [
      {
        "id": "A",
        "label": "Vay tối đa hạn mức",
        "desc": "Nhận đủ hạn mức vay ưu đãi theo quyết định của Nhà nước.",
        "base": {
          "budget": 30,
          "sip": 0,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "B",
        "label": "Đầu tư mở rộng sản xuất",
        "desc": "Dùng vốn vay để mở rộng quy mô theo kế hoạch đăng ký với cơ quan quản lý.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Vốn đầu tư mở rộng (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.5,
          "sip": 0,
          "ap": 0
        }
      },
      {
        "id": "C",
        "label": "Thực hiện trách nhiệm xã hội",
        "desc": "Phân bổ vốn cho hoạt động an sinh theo yêu cầu của Nhà nước → tăng Phụng Sự.",
        "base": {
          "budget": 0,
          "sip": 5,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Ngân sách an sinh (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.2,
          "sip": 0.5,
          "ap": 0
        }
      },
      {
        "id": "D",
        "label": "Đăng ký R&D công nghệ quốc gia",
        "desc": "Tham gia chương trình nghiên cứu do Bộ KH&CN triển khai.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 1
        },
        "invest": true,
        "investLabel": "Ngân sách R&D đăng ký (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.5,
          "sip": 0,
          "ap": 0.15
        }
      }
    ]
  },
  {
    "id": "viral",
    "label": "Chương trình OCOP Quốc gia 🇻🇳",
    "emoji": "🇻🇳",
    "color": "#38BDF8",
    "description": "Bộ Nông nghiệp & PTNT ban hành Quyết định triển khai OCOP toàn quốc. Doanh nghiệp phải báo cáo phương án tham gia:",
    "options": [
      {
        "id": "A",
        "label": "Đăng ký sản phẩm OCOP ngay",
        "desc": "Tuân thủ quy trình cấp chứng nhận OCOP của Nhà nước → tiếp cận thị trường.",
        "base": {
          "budget": 25,
          "sip": 0,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "B",
        "label": "Mở rộng chuỗi cung ứng",
        "desc": "Đầu tư theo kế hoạch liên kết vùng do Nhà nước hỗ trợ.",
        "base": {
          "budget": 5,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Vốn liên kết vùng (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.3,
          "sip": 0,
          "ap": 0
        }
      },
      {
        "id": "C",
        "label": "Hợp tác HTX địa phương",
        "desc": "Liên kết với hợp tác xã theo mô hình Nhà nước khuyến khích → SIP.",
        "base": {
          "budget": 5,
          "sip": 5,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Ngân sách liên kết HTX (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.3,
          "sip": 0.4,
          "ap": 0
        }
      },
      {
        "id": "D",
        "label": "Nâng cấp tiêu chuẩn chất lượng",
        "desc": "Đáp ứng tiêu chuẩn quốc gia do Bộ ban hành → tích AP.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 1
        },
        "invest": true,
        "investLabel": "Chi phí chứng nhận (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.8,
          "sip": 0,
          "ap": 0.1
        }
      }
    ]
  },
  {
    "id": "taxInspect",
    "label": "Thanh tra thuế đột xuất! ⚖️",
    "emoji": "⚖️",
    "color": "#F97316",
    "description": "Cục Thuế ban hành quyết định thanh tra đột xuất toàn ngành. Doanh nghiệp phải nộp hồ sơ và chọn phương án xử lý:",
    "options": [
      {
        "id": "A",
        "label": "Nộp phạt đúng luật",
        "desc": "Chấp hành đầy đủ quy định thuế → mất tiền nhưng uy tín pháp lý tốt.",
        "base": {
          "budget": -20,
          "sip": 10,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "B",
        "label": "Thuê tư vấn pháp lý",
        "desc": "Chi phí tuân thủ theo hướng dẫn của Cục Thuế → giảm thiệt hại.",
        "base": {
          "budget": -15,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Phí tư vấn thuế (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.5,
          "sip": 0,
          "ap": 0
        }
      },
      {
        "id": "C",
        "label": "Công khai minh bạch sổ sách",
        "desc": "Báo cáo công khai theo yêu cầu Nhà nước → xây dựng uy tín xã hội.",
        "base": {
          "budget": -10,
          "sip": 5,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí kiểm toán (M)",
        "investMin": 0,
        "perM": {
          "budget": 0,
          "sip": 0.4,
          "ap": 0
        }
      },
      {
        "id": "D",
        "label": "Nộp hồ sơ giải trình bổ sung",
        "desc": "Làm việc trực tiếp với cơ quan thuế theo quy trình chính thức.",
        "base": {
          "budget": -10,
          "sip": 5,
          "ap": 2
        },
        "invest": false
      }
    ]
  },
  {
    "id": "disaster",
    "label": "Chỉ thị ứng phó thiên tai miền Trung 🌊",
    "emoji": "🌊",
    "color": "#A78BFA",
    "description": "Thủ tướng Chính phủ ban hành Chỉ thị khẩn cấp ứng phó thiên tai. Doanh nghiệp báo cáo phương án với UBND địa phương:",
    "options": [
      {
        "id": "A",
        "label": "Tiếp tục sản xuất bình thường",
        "desc": "Không tham gia chương trình cứu trợ của Nhà nước.",
        "base": {
          "budget": 15,
          "sip": -5,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "B",
        "label": "Đóng góp Quỹ cứu trợ Nhà nước",
        "desc": "Chuyển kinh phí vào Quỹ ứng phó thiên tai do Chính phủ thành lập.",
        "base": {
          "budget": -5,
          "sip": 5,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Đóng góp Quỹ Nhà nước (M)",
        "investMin": 5,
        "perM": {
          "budget": 0,
          "sip": 0.6,
          "ap": 0
        }
      },
      {
        "id": "C",
        "label": "Huy động lao động cứu trợ",
        "desc": "Phối hợp với lực lượng dân quân tự vệ và chính quyền địa phương.",
        "base": {
          "budget": -5,
          "sip": 3,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí huy động (M)",
        "investMin": 5,
        "perM": {
          "budget": 0,
          "sip": 0.3,
          "ap": 0.05
        }
      },
      {
        "id": "D",
        "label": "Cam kết an sinh dài hạn",
        "desc": "Ký cam kết với Bộ LĐ-TB&XH hỗ trợ tái thiết vùng thiên tai.",
        "base": {
          "budget": -15,
          "sip": 25,
          "ap": 2
        },
        "invest": false
      }
    ]
  },
  {
    "id": "summit",
    "label": "Diễn đàn Kinh tế Quốc gia 🏛️",
    "emoji": "🏛️",
    "color": "#FACC15",
    "description": "Chính phủ tổ chức Diễn đàn Kinh tế Quốc gia. Doanh nghiệp được triệu tập tham gia các phiên chính sách:",
    "options": [
      {
        "id": "A",
        "label": "Đăng ký gói hỗ trợ vốn Nhà nước",
        "desc": "Nộp hồ sơ nhận hỗ trợ từ Quỹ Phát triển KH&CN quốc gia.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí hồ sơ đăng ký (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.8,
          "sip": 0,
          "ap": 0
        }
      },
      {
        "id": "B",
        "label": "Tham gia phiên liên kết vùng",
        "desc": "Kết nối chuỗi cung ứng theo chương trình Nhà nước → AP + SIP.",
        "base": {
          "budget": 0,
          "sip": 5,
          "ap": 1
        },
        "invest": true,
        "investLabel": "Chi phí tham dự (M)",
        "investMin": 0,
        "perM": {
          "budget": 0,
          "sip": 0.3,
          "ap": 0.08
        }
      },
      {
        "id": "C",
        "label": "Báo cáo mô hình kinh tế tập thể",
        "desc": "Trình bày mô hình phụng sự xã hội trước hội đồng chính sách.",
        "base": {
          "budget": 0,
          "sip": 15,
          "ap": 3
        },
        "invest": false
      },
      {
        "id": "D",
        "label": "Triển lãm sản phẩm quốc gia",
        "desc": "Gian hàng tại Triển lãm Quốc gia do Bộ Công Thương tổ chức.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Phí gian hàng Nhà nước (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.4,
          "sip": 0.1,
          "ap": 0
        }
      }
    ]
  },
  {
    "id": "dataBreach",
    "label": "Luật An toàn thông tin mạng 🔐",
    "emoji": "🔐",
    "color": "#F43F5E",
    "description": "Luật ATTTM có hiệu lực. Bộ TT&TT yêu cầu toàn bộ doanh nghiệp tuân thủ và báo cáo trong 30 ngày:",
    "options": [
      {
        "id": "A",
        "label": "Báo cáo tuân thủ đầy đủ",
        "desc": "Nộp báo cáo minh bạch theo mẫu của Bộ TT&TT → SIP phục hồi.",
        "base": {
          "budget": -15,
          "sip": 10,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "B",
        "label": "Nâng cấp hệ thống bảo mật",
        "desc": "Đầu tư đáp ứng tiêu chuẩn an ninh mạng quốc gia.",
        "base": {
          "budget": -10,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Ngân sách bảo mật (M)",
        "investMin": 5,
        "perM": {
          "budget": 0,
          "sip": 0,
          "ap": 0.1
        }
      },
      {
        "id": "C",
        "label": "Xin gia hạn báo cáo",
        "desc": "Gửi đơn xin gia hạn — rủi ro bị xử phạt, SIP giảm.",
        "base": {
          "budget": -5,
          "sip": -20,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "D",
        "label": "Phối hợp cơ quan điều tra",
        "desc": "Hợp tác với Bộ Công an điều tra sự cố theo quy trình pháp luật.",
        "base": {
          "budget": -10,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí phối hợp (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.8,
          "sip": 0,
          "ap": 0
        }
      }
    ]
  },
  {
    "id": "sandbox",
    "label": "Nghị định Sandbox đổi mới sáng tạo 🚀",
    "emoji": "🚀",
    "color": "#34D399",
    "description": "Chính phủ ban hành Nghị định thí nghiệm công nghệ mới (Regulatory Sandbox). Doanh nghiệp đăng ký tham gia:",
    "options": [
      {
        "id": "A",
        "label": "Đăng ký thí nghiệm chính thức",
        "desc": "Tham gia chương trình pilot do Bộ KH&CN cấp phép.",
        "base": {
          "budget": 10,
          "sip": 0,
          "ap": 2
        },
        "invest": true,
        "investLabel": "Vốn triển khai thí nghiệm (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.2,
          "sip": 0,
          "ap": 0.1
        }
      },
      {
        "id": "B",
        "label": "Chờ Nghị định hướng dẫn",
        "desc": "Quan sát kết quả thí nghiệm của doanh nghiệp khác — an toàn.",
        "base": {
          "budget": 10,
          "sip": 0,
          "ap": 0
        },
        "invest": false
      },
      {
        "id": "C",
        "label": "Liên doanh Viện Nghiên cứu Nhà nước",
        "desc": "Hợp tác với viện thuộc Bộ → vốn đối ứng từ ngân sách.",
        "base": {
          "budget": 5,
          "sip": 5,
          "ap": 1
        },
        "invest": true,
        "investLabel": "Vốn đối ứng (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.1,
          "sip": 0,
          "ap": 0.08
        }
      },
      {
        "id": "D",
        "label": "Tự nghiên cứu ngoài Sandbox",
        "desc": "Phát triển độc lập không qua cơ chế thí nghiệm Nhà nước.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Ngân sách R&D tự chủ (M)",
        "investMin": 10,
        "perM": {
          "budget": 1.5,
          "sip": 0,
          "ap": 0.05
        }
      }
    ]
  },
  {
    "id": "cocVang",
    "label": "Tuần lễ Khởi nghiệp Quốc gia 🚀",
    "emoji": "🚀",
    "color": "#38BDF8",
    "description": "Bộ KH&CN phối hợp các bộ ngành tổ chức Tuần lễ Quốc gia Khởi nghiệp Đổi mới. Doanh nghiệp đăng ký theo quy chế Nhà nước:",
    "options": [
      {
        "id": "A",
        "label": "Gian hàng Triển lãm Quốc gia",
        "desc": "Đăng ký gian hàng tại Hội chợ do Bộ tổ chức.",
        "base": {
          "budget": 0,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Phí gian hàng (M)",
        "investMin": 5,
        "perM": {
          "budget": 1.6,
          "sip": 0,
          "ap": 0
        }
      },
      {
        "id": "B",
        "label": "Diễn đàn kết nối vùng miền",
        "desc": "Tham gia chương trình liên kết do Nhà nước điều phối → SIP.",
        "base": {
          "budget": 0,
          "sip": 5,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí tham dự (M)",
        "investMin": 5,
        "perM": {
          "budget": 0.3,
          "sip": 0.4,
          "ap": 0
        }
      },
      {
        "id": "C",
        "label": "Giải thưởng Sáng kiến Quốc gia",
        "desc": "Nộp hồ sơ dự thi giải thưởng do Thủ tướng tặng → SIP + AP cao.",
        "base": {
          "budget": 0,
          "sip": 20,
          "ap": 2
        },
        "invest": false
      },
      {
        "id": "D",
        "label": "Đăng ký gói hỗ trợ khởi nghiệp",
        "desc": "Nộp hồ sơ nhận vốn từ Quỹ Đổi mới sáng tạo quốc gia.",
        "base": {
          "budget": 10,
          "sip": 0,
          "ap": 0
        },
        "invest": true,
        "investLabel": "Chi phí hồ sơ (M)",
        "investMin": 5,
        "perM": {
          "budget": 2,
          "sip": 0,
          "ap": 0
        }
      }
    ]
  }
];

export const TACTICS = {
  "freeze": {
    "id": "freeze",
    "label": "Đóng băng chiến thuật",
    "emoji": "❄️",
    "cost": 3,
    "description": "Vòng sau: che full màn hình băng 35s — chỉ 5s cuối mới thấy câu hỏi. CyberSec miễn nhiễm.",
    "needsTarget": true
  },
  "expose": {
    "id": "expose",
    "label": "Bóc phốt công khai",
    "emoji": "📢",
    "cost": 1,
    "description": "Đội mục tiêu -5 Phụng Sự. Nội dung xuất hiện trên Live Feed.",
    "needsTarget": true,
    "needsContent": true
  },
  "steal": {
    "id": "steal",
    "label": "Ăn trộm công nghệ",
    "emoji": "🕵️",
    "cost": 2,
    "description": "Lấy 15M từ đội mục tiêu chuyển cho mình (CyberSec bị -20M).",
    "needsTarget": true
  },
  "alliance": {
    "id": "alliance",
    "label": "Liên minh cùng phát triển",
    "emoji": "🤝",
    "cost": 2,
    "description": "Cả hai đội nhận +20M và +10 Phụng Sự.",
    "needsTarget": true
  },
  "whirlwind": {
    "id": "whirlwind",
    "label": "Lốc xoáy",
    "emoji": "🌪️",
    "cost": 2,
    "description": "Vòng sau: đáp án đối thủ đổi chỗ mỗi 4 giây trong 40s.",
    "needsTarget": true
  },
  "fog": {
    "id": "fog",
    "label": "Sương mù",
    "emoji": "🌫️",
    "cost": 2,
    "description": "Vòng sau: sương trôi che ~45% đáp án đối thủ, khó đọc.",
    "needsTarget": true
  }
};
export const TACTICS_LIST = Object.values(TACTICS);

export const FOUNDERS = [
  {
    "id": "fmcg",
    "teamKey": "fmcg",
    "name": "FMCG",
    "founder": "Lan",
    "sector": "Hàng tiêu dùng nhanh (Vinamilk/FMCG)",
    "sectorShort": "FMCG",
    "emoji": "🛍️",
    "perk": "Sau mỗi sự kiện: +2 AP thêm",
    "perkKey": "apBonus",
    "meaning": "Đưa sản phẩm thiết yếu đến mọi gia đình",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 5,
    "color": "#F97316",
    "colorLight": "rgba(249,115,22,0.10)"
  },
  {
    "id": "vy-edtech",
    "teamKey": "edtech",
    "name": "EdTech",
    "founder": "Vy",
    "sector": "Giáo dục trực tuyến vùng cao",
    "sectorShort": "EdTech",
    "emoji": "📚",
    "perk": "SIP nhận được ×1.5",
    "perkKey": "sipMultiplier",
    "meaning": "Phổ cập tri thức, thu hẹp khoảng cách giáo dục",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 5,
    "color": "#38BDF8",
    "colorLight": "rgba(56,189,248,0.12)"
  },
  {
    "id": "bach-medtech",
    "teamKey": "medtech",
    "name": "MedTech",
    "founder": "Bách",
    "sector": "Y tế số",
    "sectorShort": "MedTech",
    "emoji": "🏥",
    "perk": "+15M tiền thưởng sau mỗi sự kiện",
    "perkKey": "budgetBonus",
    "meaning": "Chăm sóc sức khỏe, an sinh xã hội",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 5,
    "color": "#F43F5E",
    "colorLight": "rgba(244,63,94,0.10)"
  },
  {
    "id": "tram-fintech",
    "teamKey": "fintech",
    "name": "FinTech",
    "founder": "Trâm",
    "sector": "Tài chính công nghệ hỗ trợ SME",
    "sectorShort": "FinTech",
    "emoji": "💳",
    "perk": "Bắt đầu 120M · Hoàn tiền thiệt hại ×1.25",
    "perkKey": "startBudgetBonus",
    "meaning": "Khơi thông dòng vốn cho doanh nghiệp nhỏ",
    "startBudget": 120,
    "startSip": 10,
    "startAp": 5,
    "color": "#FACC15",
    "colorLight": "rgba(250,204,21,0.10)"
  },
  {
    "id": "duong-greentech",
    "teamKey": "greentech",
    "name": "GreenTech",
    "founder": "Dương",
    "sector": "Năng lượng xanh & tái chế",
    "sectorShort": "GreenTech",
    "emoji": "♻️",
    "perk": "Bắt đầu 15 SIP · Sự kiện Phụng Sự thêm +5",
    "perkKey": "sipBonus",
    "meaning": "Phát triển xanh, bền vững",
    "startBudget": 100,
    "startSip": 15,
    "startAp": 5,
    "color": "#34D399",
    "colorLight": "rgba(52,211,153,0.12)"
  },
  {
    "id": "khanh-ai",
    "teamKey": "ai",
    "name": "AI",
    "founder": "Khánh",
    "sector": "AI & tự động hóa",
    "sectorShort": "AI",
    "emoji": "🤖",
    "perk": "AP nhận được ×1.5 · Bắt đầu 7 AP",
    "perkKey": "apMultiplier",
    "meaning": "Tăng năng suất lao động xã hội",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 7,
    "color": "#A78BFA",
    "colorLight": "rgba(167,139,250,0.12)"
  },
  {
    "id": "cybersec",
    "teamKey": "cybersec",
    "name": "CyberSec",
    "founder": "Minh",
    "sector": "An ninh mạng & Bảo mật",
    "sectorShort": "CyberSec",
    "emoji": "🔒",
    "perk": "Miễn nhiễm chiêu Đóng băng · Bị ăn trộm -20M thay -15M",
    "perkKey": "immuneFreeze",
    "meaning": "Bảo vệ không gian mạng quốc gia",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 5,
    "color": "#6366F1",
    "colorLight": "rgba(99,102,241,0.12)"
  },
  {
    "id": "linh-ecommerce",
    "teamKey": "ecommerce",
    "name": "E-Commerce",
    "founder": "Linh",
    "sector": "TMĐT đặc sản Việt OCOP",
    "sectorShort": "E-Commerce",
    "emoji": "🛒",
    "perk": "Budget return của invest ×1.2",
    "perkKey": "optionBBonus",
    "meaning": "Đưa sản phẩm địa phương ra thị trường lớn",
    "startBudget": 100,
    "startSip": 10,
    "startAp": 5,
    "color": "#38BDF8",
    "colorLight": "rgba(56,189,248,0.12)"
  }
];
