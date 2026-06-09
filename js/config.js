/* ============================================
   META HOTEL — Configuration
   
   ⚙️ ค่า config ทั้งหมดรวมไว้ที่นี่ที่เดียว
   ต้องการเปลี่ยนราคา/URL/ข้อมูลโรงแรม? → แก้ที่นี่
   
   Developer Note:
   - ทุกค่าที่อาจเปลี่ยนได้อยู่ในไฟล์นี้
   - อย่า hardcode ค่าเหล่านี้ในไฟล์อื่น
   ============================================ */

const CONFIG = {
  // ─── Google Apps Script Web App URL ───
  // วิธีตั้งค่า: ดูไฟล์ SETUP.md
  API_URL: 'https://script.google.com/macros/s/AKfycbyezV1Q6OtJ_gcgSuKM5caLWAU2jwfd6Q9Ko4_g9CNxz8lI46LfwXhNmWq7N0NVlcA/exec',

  // ─── Admin Credentials ───
  ADMIN_PASSWORD: 'meta2026',

  // ─── Hotel Information ───
  HOTEL: {
    NAME: 'META HOTEL',
    FLOORS: 10,
    ROOMS_PER_FLOOR: 10,
    ADDRESS: '123 META Street, Bangkok 10110',
    PHONE: '+66 2-123-4567',
    EMAIL: 'info@metahotel.com',
  },

  // ─── Room Pricing (THB per night) ───
  PRICING: {
    STANDARD: 1000,
    FAMILY: 2000,
    EXTRA_BED: 500,
  },

  // ─── Room Capacity (persons) ───
  CAPACITY: {
    STANDARD: 2,
    FAMILY: 4,
  },

  // ─── Date Settings ───
  DATE: {
    MIN_YEAR: 2025,
    MAX_YEAR: 2030,
  },

  // ─── Validation Rules ───
  VALIDATION: {
    PHONE_PATTERN: /^[0-9]{9,10}$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
  },

  // ─── Default Language ───
  DEFAULT_LANG: 'th',

  // ─── Storage Keys ───
  STORAGE: {
    LANG: 'meta_hotel_lang',
    ADMIN_AUTH: 'meta_hotel_admin_auth',
  },
};
