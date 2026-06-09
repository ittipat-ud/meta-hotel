/* ============================================
   META HOTEL — Booking Manager
   
   📋 Logic ฟอร์มจอง + คำนวณราคา
   ============================================ */

class BookingManager {
  constructor() {
    this.formData = {
      roomType: 'standard',
      bedType: 'single',
      extraBed: false,
      floor: '',
      room: '',
      checkin: '',
      checkout: '',
      nickname: '',
      phone: '',
    };
  }

  /**
   * คำนวณราคารวม
   * @returns {Object} { roomPrice, extraBedPrice, total }
   */
  calculatePrice() {
    const roomPrice =
      this.formData.roomType === 'family'
        ? CONFIG.PRICING.FAMILY
        : CONFIG.PRICING.STANDARD;

    const extraBedPrice = this.formData.extraBed ? CONFIG.PRICING.EXTRA_BED : 0;

    // คำนวณจำนวนคืน
    const nights = this.calculateNights();
    const nightsMultiplier = nights > 0 ? nights : 1;

    return {
      roomPrice: roomPrice,
      extraBedPrice: extraBedPrice,
      nights: nightsMultiplier,
      total: (roomPrice + extraBedPrice) * nightsMultiplier,
    };
  }

  /**
   * คำนวณจำนวนคืน
   */
  calculateNights() {
    const { checkin, checkout } = this.formData;
    
    if (!checkin || !checkout) {
      return 1;
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = checkoutDate - checkinDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  }

  /**
   * Validate ข้อมูลฟอร์ม
   * @returns {Object} { valid, errors: { fieldName: errorKey } }
   */
  validateForm() {
    const errors = {};

    // ชื่อเล่น
    if (!this.formData.nickname.trim()) {
      errors.nickname = 'validation.required';
    } else if (this.formData.nickname.trim().length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
      errors.nickname = 'validation.name_short';
    }

    // เบอร์โทร
    if (!this.formData.phone.trim()) {
      errors.phone = 'validation.required';
    } else if (!CONFIG.VALIDATION.PHONE_PATTERN.test(this.formData.phone.replace(/[-\s]/g, ''))) {
      errors.phone = 'validation.phone_invalid';
    }

    // ชั้นและห้อง
    if (!this.formData.floor) {
      errors.floor = 'validation.required';
    }
    if (!this.formData.room) {
      errors.room = 'validation.required';
    }

    // วันที่ Check-in
    if (!this.formData.checkin) {
      errors.checkin = 'validation.date_invalid';
    }

    // วันที่ Check-out
    if (!this.formData.checkout) {
      errors.checkout = 'validation.date_invalid';
    }

    // Check-out ต้องหลัง Check-in
    if (!errors.checkin && !errors.checkout) {
      const checkinDate = new Date(this.formData.checkin);
      const checkoutDate = new Date(this.formData.checkout);
      if (checkoutDate <= checkinDate) {
        errors.checkout = 'validation.checkout_before';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * อัปเดตข้อมูลฟอร์ม
   * @param {string} field
   * @param {*} value
   */
  updateField(field, value) {
    this.formData[field] = value;
  }

  /**
   * ส่งข้อมูลการจอง
   * @returns {Promise<Object>}
   */
  async submitBooking() {
    const validation = this.validateForm();
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const price = this.calculatePrice();

    // แปลงรูปแบบ YYYY-MM-DD ไปเป็น D/M/YYYY เพื่อเก็บลงสเปรดชีตให้ตรงกับฟอร์แมตเดิม
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-').map(Number);
      return `${d}/${m}/${y}`;
    };

    const bookingData = {
      nickname: this.formData.nickname.trim(),
      phone: this.formData.phone.trim(),
      roomType: this.formData.roomType,
      bedType: this.formData.bedType,
      extraBed: this.formData.extraBed,
      floor: this.formData.floor,
      room: this.formData.room,
      checkin: formatDate(this.formData.checkin),
      checkout: formatDate(this.formData.checkout),
      totalPrice: price.total,
      nights: price.nights,
    };

    const result = await MetaAPI.submitBooking(bookingData);
    return result;
  }

  /**
   * Reset ฟอร์ม
   */
  reset() {
    this.formData = {
      roomType: 'standard',
      bedType: 'single',
      extraBed: false,
      floor: '',
      room: '',
      checkin: '',
      checkout: '',
      nickname: '',
      phone: '',
    };
  }
}
