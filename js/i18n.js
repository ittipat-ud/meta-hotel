/* ============================================
   META HOTEL — Internationalization (i18n)
   
   🌐 ระบบเปลี่ยนภาษา TH/EN
   
   วิธีใช้:
   1. ใน HTML: เพิ่ม data-i18n="key" บน element
      <span data-i18n="nav.home">หน้าแรก</span>
   
   2. ใน JS: ใช้ i18n.t('key') เพื่อดึงข้อความ
      const text = i18n.t('hero.title');
   
   วิธีเพิ่มภาษาใหม่:
   1. เพิ่ม object ใน translations (เช่น 'zh', 'ja')
   2. เพิ่มปุ่มภาษาใน HTML navbar
   ============================================ */

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem(CONFIG.STORAGE.LANG) || CONFIG.DEFAULT_LANG;
    this.translations = {
      /* ──────────────────────────────────────────
         ภาษาไทย
         ────────────────────────────────────────── */
      th: {
        // Navbar
        'nav.home': 'หน้าแรก',
        'nav.about': 'เกี่ยวกับเรา',
        'nav.rooms': 'ห้องพัก',
        'nav.booking': 'จองห้องพัก',

        // Hero
        'hero.badge': '★ โรงแรมระดับพรีเมียม',
        'hero.title_1': 'META',
        'hero.title_2': 'HOTEL',
        'hero.subtitle': 'สัมผัสประสบการณ์การพักผ่อนระดับพรีเมียม ใจกลางเมือง พร้อมสิ่งอำนวยความสะดวกครบครัน',
        'hero.cta_book': 'จองห้องพัก',
        'hero.cta_explore': 'สำรวจห้องพัก',
        'hero.stat_rooms': 'ห้องพัก',
        'hero.stat_floors': 'ชั้น',
        'hero.stat_service': 'บริการ 24 ชม.',
        'hero.stat_satisfaction': 'ความพึงพอใจ',

        // About
        'about.label': 'เกี่ยวกับเรา',
        'about.title': 'ยินดีต้อนรับสู่ META Hotel',
        'about.subtitle': 'โรงแรมหรูระดับพรีเมียม 10 ชั้น 100 ห้อง พร้อมสิ่งอำนวยความสะดวกครบครัน',
        'about.feature_pool': 'สระว่ายน้ำ',
        'about.feature_pool_desc': 'สระว่ายน้ำวิว Infinity Pool บนดาดฟ้า เปิดให้บริการทุกวัน',
        'about.feature_fitness': 'ฟิตเนส',
        'about.feature_fitness_desc': 'ห้องออกกำลังกายพร้อมอุปกรณ์ครบครัน เปิด 24 ชั่วโมง',
        'about.feature_restaurant': 'ร้านอาหาร',
        'about.feature_restaurant_desc': 'ร้านอาหารชั้นเลิศ เสิร์ฟอาหารนานาชาติ ทั้ง 3 มื้อ',
        'about.feature_wifi': 'Wi-Fi ฟรี',
        'about.feature_wifi_desc': 'อินเทอร์เน็ตความเร็วสูง ครอบคลุมทุกพื้นที่ของโรงแรม',

        // Rooms
        'rooms.label': 'ห้องพักของเรา',
        'rooms.title': 'เลือกห้องพักที่เหมาะกับคุณ',
        'rooms.subtitle': 'ห้องพักทุกห้องตกแต่งอย่างหรูหรา พร้อมวิวที่สวยงาม',
        'rooms.standard': 'Standard Room',
        'rooms.standard_name': 'ห้องสแตนดาร์ด',
        'rooms.standard_desc': 'ห้องพักสะดวกสบาย ตกแต่งทันสมัย เหมาะสำหรับการเดินทางแบบคู่',
        'rooms.family': 'Family Room',
        'rooms.family_name': 'ห้องแฟมิลี่',
        'rooms.family_desc': 'ห้องพักกว้างขวาง พร้อมพื้นที่นั่งเล่น เหมาะสำหรับครอบครัว',
        'rooms.feature_guests': 'คน',
        'rooms.feature_bed': 'เตียงเดี่ยว/คู่',
        'rooms.feature_extra_bed': 'เสริมได้',
        'rooms.feature_wifi': 'Wi-Fi ฟรี',
        'rooms.per_night': '/คืน',
        'rooms.book_now': 'จองเลย',

        // Booking
        'booking.label': 'จองห้องพัก',
        'booking.title': 'จองห้องพักของคุณ',
        'booking.subtitle': 'กรอกข้อมูลด้านล่างเพื่อจองห้องพัก',
        'booking.room_type': 'ประเภทห้อง',
        'booking.standard': 'Standard',
        'booking.standard_desc': '2 คน · ฿1,000/คืน',
        'booking.family': 'Family',
        'booking.family_desc': '4 คน · ฿2,000/คืน',
        'booking.bed_type': 'ประเภทเตียง',
        'booking.single_bed': 'เตียงเดี่ยว',
        'booking.double_bed': 'เตียงคู่',
        'booking.extra_bed': 'เตียงเสริม (+฿500)',
        'booking.extra_bed_label': 'เพิ่มเตียงเสริม',
        'booking.floor': 'ชั้น',
        'booking.room': 'ห้อง',
        'booking.select_floor': 'เลือกชั้น',
        'booking.select_room': 'เลือกห้อง',
        'booking.select_floor_first': 'กรุณาเลือกชั้นก่อนเลือกห้องพัก',
        'booking.checkin': 'Check-in',
        'booking.checkout': 'Check-out',
        'booking.select_dates': 'เลือกวันที่เข้าพัก',
        'booking.day': 'วัน',
        'booking.cal_weekdays': 'อา,จ,อ,พ,พฤ,ศ,ส',
        'booking.cal_months': 'มกราคม,กุมภาพันธ์,มีนาคม,เมษายน,พฤษภาคม,มิถุนายน,กรกฎาคม,สิงหาคม,กันยายน,ตุลาคม,พฤศจิกายน,ธันวาคม',
        'booking.cal_select_checkin': 'กรุณาเลือกวัน Check-in',
        'booking.cal_select_checkout': 'กรุณาเลือกวัน Check-out',
        'booking.month': 'เดือน',
        'booking.year': 'ปี',
        'booking.nickname': 'ชื่อเล่น',
        'booking.nickname_placeholder': 'กรอกชื่อเล่นของคุณ',
        'booking.phone': 'เบอร์โทรศัพท์',
        'booking.phone_placeholder': '08X-XXX-XXXX',
        'booking.summary': 'สรุปราคา',
        'booking.room_price': 'ราคาห้องพัก',
        'booking.extra_bed_price': 'เตียงเสริม',
        'booking.total': 'ราคารวมทั้งหมด',
        'booking.submit': 'ยืนยันการจอง',
        'booking.submitting': 'กำลังส่งข้อมูล...',

        // Validation
        'validation.required': 'กรุณากรอกข้อมูล',
        'validation.name_short': 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
        'validation.phone_invalid': 'เบอร์โทรไม่ถูกต้อง (9-10 หลัก)',
        'validation.date_invalid': 'กรุณาเลือกวันที่ให้ครบ',
        'validation.checkout_before': 'วันที่ Check-out ต้องหลัง Check-in',

        // Modal
        'modal.success_title': 'จองสำเร็จ! 🎉',
        'modal.success_text': 'ขอบคุณที่เลือก META Hotel เราจะติดต่อกลับหาคุณเร็วๆ นี้',
        'modal.error_title': 'เกิดข้อผิดพลาด',
        'modal.error_text': 'ไม่สามารถจองได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        'modal.close': 'ปิด',
        'modal.ok': 'ตกลง',

        // Footer
        'footer.desc': 'โรงแรมระดับพรีเมียม ใจกลางเมือง พร้อมสิ่งอำนวยความสะดวกครบครัน',
        'footer.quick_links': 'ลิงก์ด่วน',
        'footer.facilities': 'สิ่งอำนวยความสะดวก',
        'footer.contact': 'ติดต่อเรา',
        'footer.copyright': '© 2026 META Hotel. สงวนลิขสิทธิ์.',
      },

      /* ──────────────────────────────────────────
         English
         ────────────────────────────────────────── */
      en: {
        // Navbar
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.rooms': 'Rooms',
        'nav.booking': 'Booking',

        // Hero
        'hero.badge': '★ Premium Hotel',
        'hero.title_1': 'META',
        'hero.title_2': 'HOTEL',
        'hero.subtitle': 'Experience premium comfort in the heart of the city with world-class amenities and services',
        'hero.cta_book': 'Book a Room',
        'hero.cta_explore': 'Explore Rooms',
        'hero.stat_rooms': 'Rooms',
        'hero.stat_floors': 'Floors',
        'hero.stat_service': '24/7 Service',
        'hero.stat_satisfaction': 'Satisfaction',

        // About
        'about.label': 'About Us',
        'about.title': 'Welcome to META Hotel',
        'about.subtitle': 'A premium 10-floor, 100-room luxury hotel with comprehensive facilities',
        'about.feature_pool': 'Swimming Pool',
        'about.feature_pool_desc': 'Rooftop infinity pool with stunning views, open daily',
        'about.feature_fitness': 'Fitness Center',
        'about.feature_fitness_desc': 'Fully equipped gym with modern facilities, open 24 hours',
        'about.feature_restaurant': 'Restaurant',
        'about.feature_restaurant_desc': 'Fine dining restaurant serving international cuisine',
        'about.feature_wifi': 'Free Wi-Fi',
        'about.feature_wifi_desc': 'High-speed internet throughout the entire hotel',

        // Rooms
        'rooms.label': 'Our Rooms',
        'rooms.title': 'Choose Your Perfect Room',
        'rooms.subtitle': 'Every room is elegantly designed with beautiful views',
        'rooms.standard': 'Standard Room',
        'rooms.standard_name': 'Standard Room',
        'rooms.standard_desc': 'Comfortable and modern room, perfect for couples or solo travelers',
        'rooms.family': 'Family Room',
        'rooms.family_name': 'Family Room',
        'rooms.family_desc': 'Spacious room with living area, ideal for families',
        'rooms.feature_guests': 'Guests',
        'rooms.feature_bed': 'Single/Double Bed',
        'rooms.feature_extra_bed': 'Extra Bed Available',
        'rooms.feature_wifi': 'Free Wi-Fi',
        'rooms.per_night': '/night',
        'rooms.book_now': 'Book Now',

        // Booking
        'booking.label': 'Reservation',
        'booking.title': 'Book Your Room',
        'booking.subtitle': 'Fill in the details below to make a reservation',
        'booking.room_type': 'Room Type',
        'booking.standard': 'Standard',
        'booking.standard_desc': '2 Guests · ฿1,000/night',
        'booking.family': 'Family',
        'booking.family_desc': '4 Guests · ฿2,000/night',
        'booking.bed_type': 'Bed Type',
        'booking.single_bed': 'Single Bed',
        'booking.double_bed': 'Double Bed',
        'booking.extra_bed': 'Extra Bed (+฿500)',
        'booking.extra_bed_label': 'Add Extra Bed',
        'booking.floor': 'Floor',
        'booking.room': 'Room',
        'booking.select_floor': 'Select Floor',
        'booking.select_room': 'Select Room',
        'booking.select_floor_first': 'Please select floor before selecting room',
        'booking.checkin': 'Check-in',
        'booking.checkout': 'Check-out',
        'booking.select_dates': 'Select Dates',
        'booking.day': 'Day',
        'booking.cal_weekdays': 'Su,Mo,Tu,We,Th,Fr,Sa',
        'booking.cal_months': 'January,February,March,April,May,June,July,August,September,October,November,December',
        'booking.cal_select_checkin': 'Select check-in date',
        'booking.cal_select_checkout': 'Select check-out date',
        'booking.month': 'Month',
        'booking.year': 'Year',
        'booking.nickname': 'Nickname',
        'booking.nickname_placeholder': 'Enter your nickname',
        'booking.phone': 'Phone Number',
        'booking.phone_placeholder': '08X-XXX-XXXX',
        'booking.summary': 'Price Summary',
        'booking.room_price': 'Room Price',
        'booking.extra_bed_price': 'Extra Bed',
        'booking.total': 'Total Price',
        'booking.submit': 'Confirm Booking',
        'booking.submitting': 'Submitting...',

        // Validation
        'validation.required': 'This field is required',
        'validation.name_short': 'Name must be at least 2 characters',
        'validation.phone_invalid': 'Invalid phone number (9-10 digits)',
        'validation.date_invalid': 'Please select a complete date',
        'validation.checkout_before': 'Check-out date must be after check-in',

        // Modal
        'modal.success_title': 'Booking Confirmed! 🎉',
        'modal.success_text': 'Thank you for choosing META Hotel. We will contact you soon!',
        'modal.error_title': 'Something Went Wrong',
        'modal.error_text': 'Unable to complete your booking. Please try again.',
        'modal.close': 'Close',
        'modal.ok': 'OK',

        // Footer
        'footer.desc': 'Premium hotel in the heart of the city with world-class amenities',
        'footer.quick_links': 'Quick Links',
        'footer.facilities': 'Facilities',
        'footer.contact': 'Contact Us',
        'footer.copyright': '© 2026 META Hotel. All rights reserved.',
      },
    };
  }

  /**
   * ดึงข้อความตามภาษาปัจจุบัน
   * @param {string} key - Translation key เช่น 'nav.home'
   * @returns {string} ข้อความที่แปลแล้ว
   */
  t(key) {
    const lang = this.translations[this.currentLang];
    return lang && lang[key] !== undefined ? lang[key] : key;
  }

  /**
   * เปลี่ยนภาษา
   * @param {string} lang - รหัสภาษา ('th' หรือ 'en')
   */
  setLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`[i18n] Language "${lang}" not found`);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem(CONFIG.STORAGE.LANG, lang);
    this.updateDOM();
    this.updateLangButtons();

    // Dispatch event for other modules to react
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  /**
   * อัปเดตข้อความทุก element ที่มี data-i18n
   */
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      
      // สำหรับ input placeholder
      if (el.hasAttribute('data-i18n-placeholder')) {
        el.placeholder = translated;
      } else {
        el.textContent = translated;
      }
    });

    // อัปเดต data-i18n-placeholder แยก
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
  }

  /**
   * อัปเดตสถานะปุ่มเปลี่ยนภาษา
   */
  updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  }

  /**
   * เริ่มต้นระบบ i18n
   */
  init() {
    this.updateDOM();
    this.updateLangButtons();

    // Bind language switcher buttons
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setLanguage(btn.dataset.lang);
      });
    });
  }

  /**
   * ดึงรายการภาษาทั้งหมด
   * @returns {string[]}
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

// Global instance
const i18n = new I18n();
