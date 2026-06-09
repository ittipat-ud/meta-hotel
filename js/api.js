/* ============================================
   META HOTEL — API Layer
   
   📡 ทุก API call ผ่านตัวกลางนี้
   ต้องการเปลี่ยน backend (Google Sheets → Firebase)?
   → แก้แค่ไฟล์นี้ไฟล์เดียว
   
   Developer Note:
   - ห้ามเรียก fetch() โดยตรงจากไฟล์อื่น
   - ทุก request/response ผ่าน class นี้
   ============================================ */

class MetaAPI {
  /**
   * ส่งข้อมูลการจองไปบันทึก
   * @param {Object} bookingData - ข้อมูลการจอง
   * @returns {Promise<Object>} response
   */
  static async submitBooking(bookingData) {
    try {
      // ถ้ายังไม่ได้ตั้งค่า API URL → ใช้ mock mode
      if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.warn('[API] Using mock mode. Set CONFIG.API_URL to connect to Google Sheets.');
        return MetaAPI._mockBooking(bookingData);
      }

      const payload = JSON.stringify({
        action: 'book',
        data: bookingData,
      });

      // ──────────────────────────────────────────────
      // ลองส่งแบบ text/plain (ทำงานจาก http/https)
      // ถ้า CORS error (เช่น เปิดจาก file://) → fallback เป็น no-cors
      // ──────────────────────────────────────────────
      try {
        const response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
          redirect: 'follow',
        });

        // ถ้าได้ response ปกติ (จาก http/https origin)
        try {
          const result = await response.json();
          return result;
        } catch {
          // Response ไม่ใช่ JSON (Apps Script redirect) → ถือว่าสำเร็จ
          return { success: true, message: 'Booking submitted successfully' };
        }
      } catch (corsError) {
        // CORS error → fallback ใช้ no-cors (ส่งข้อมูลได้แต่อ่าน response ไม่ได้)
        console.warn('[API] CORS blocked, using no-cors fallback:', corsError.message);

        await fetch(CONFIG.API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
        });

        // no-cors = opaque response ← ถือว่าส่งสำเร็จ
        return { success: true, message: 'Booking submitted (no-cors mode)' };
      }

    } catch (error) {
      console.error('[API] submitBooking error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * ดึงรายการจองทั้งหมด (สำหรับ Admin)
   * @returns {Promise<Object>} { success, data: [...bookings] }
   */
  static async getBookings() {
    try {
      if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.warn('[API] Using mock mode.');
        return MetaAPI._mockGetBookings();
      }

      const url = `${CONFIG.API_URL}?action=getBookings`;
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[API] getBookings error:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  /**
   * ตรวจสอบรหัสผ่าน Admin
   * @param {string} password
   * @returns {Promise<Object>} { success: boolean }
   */
  static async verifyAdmin(password) {
    // ตรวจสอบ password ฝั่ง client (simple mode)
    // ในโปรเจคจริงควรตรวจสอบฝั่ง server
    const isValid = password === CONFIG.ADMIN_PASSWORD;
    return {
      success: isValid,
      message: isValid ? 'Login successful' : 'Invalid password',
    };
  }

  /* ─── Mock Functions (ใช้ตอนยังไม่ต่อ Google Sheets) ─── */

  /**
   * จำลองการจอง (mock)
   */
  static _mockBooking(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[API Mock] Booking saved:', data);

        // บันทึกใน localStorage เพื่อทดสอบ admin
        const bookings = JSON.parse(localStorage.getItem('meta_mock_bookings') || '[]');
        bookings.push({
          ...data,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('meta_mock_bookings', JSON.stringify(bookings));

        resolve({ success: true, message: 'Booking saved (mock)' });
      }, 1000);
    });
  }

  /**
   * จำลองการดึงข้อมูลจอง (mock)
   */
  static _mockGetBookings() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = JSON.parse(localStorage.getItem('meta_mock_bookings') || '[]');
        resolve({ success: true, data: bookings });
      }, 500);
    });
  }
}
