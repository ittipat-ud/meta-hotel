/* ============================================
   META HOTEL — Main Application (Frontend)
   
   🚀 Entry point หน้าบ้าน
   รวม modules ทั้งหมดและเริ่มต้นการทำงาน
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const app = new MetaHotelApp();
  app.init();
});

class MetaHotelApp {
  constructor() {
    this.booking = new BookingManager();
    this.bookingsList = [];
  }

  /**
   * เริ่มต้นทุกระบบ
   */
  async init() {
    // UI Systems
    UI.initNavbarScroll();
    UI.initMobileMenu();
    UI.initSmoothScroll();
    UI.initScrollAnimations();

    // i18n
    i18n.init();

    // ดึงข้อมูลการจองปัจจุบัน
    await this.loadBookings();

    // Booking Form
    this.initBookingForm();
    this.updatePriceSummary();

    // Plugins
    this.initPlugins();

    console.log('🏨 META Hotel app initialized');
  }

  /**
   * ดึงข้อมูลจองเพื่อเช็คสถานะห้องว่าง
   */
  async loadBookings() {
    try {
      const result = await MetaAPI.getBookings();
      if (result.success) {
        this.bookingsList = result.data || [];
      }
    } catch (error) {
      console.error('[App] Failed to load bookings:', error);
    }
  }

  /* ─── Booking Form ─── */

  initBookingForm() {
    // Room Type
    document.querySelectorAll('input[name="roomType"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.booking.updateField('roomType', e.target.value);
        this.updatePriceSummary();
      });
    });

    // Bed Type
    document.querySelectorAll('input[name="bedType"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.booking.updateField('bedType', e.target.value);
      });
    });

    // Extra Bed
    const extraBedCheckbox = document.getElementById('extraBed');
    if (extraBedCheckbox) {
      extraBedCheckbox.addEventListener('change', (e) => {
        this.booking.updateField('extraBed', e.target.checked);
        this.updatePriceSummary();
      });
    }

    // ─── Date Pickers (native) ───
    this.initDatePickers();

    // ─── Floor Select ───
    this.populateFloorDropdown();
    const floorSelect = document.getElementById('floor');
    if (floorSelect) {
      floorSelect.addEventListener('change', (e) => {
        this.booking.updateField('floor', e.target.value);
        this.booking.updateField('room', '');
        const roomInput = document.getElementById('room');
        if (roomInput) roomInput.value = '';
        this.renderRoomGrid();
      });
    }

    // Guest Info
    const nicknameInput = document.getElementById('nickname');
    const phoneInput = document.getElementById('phone');
    if (nicknameInput) {
      nicknameInput.addEventListener('input', (e) => {
        this.booking.updateField('nickname', e.target.value);
        UI.setInputError(e.target, null);
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        this.booking.updateField('phone', e.target.value);
        UI.setInputError(e.target, null);
      });
    }

    // Submit Button
    const submitBtn = document.getElementById('bookingSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Initial state
    this.validateDatesAndToggleFloor();
  }

  /* ─── Custom Calendar Picker ─── */

  initDatePickers() {
    // Calendar state
    this.calState = {
      viewDate: new Date(),       // month currently displayed
      checkinDate: null,          // selected check-in Date
      checkoutDate: null,         // selected check-out Date
      selectingCheckout: false,   // true = next click selects checkout
    };

    // Limits
    this.calMinDate = new Date();
    this.calMinDate.setHours(0, 0, 0, 0);
    this.calMaxDate = new Date();
    this.calMaxDate.setFullYear(this.calMaxDate.getFullYear() + 2);

    // Render weekday headers
    this.renderCalWeekdays();

    // Render initial calendar
    this.renderCalendar();

    // Prev/Next buttons
    document.getElementById('calPrev')?.addEventListener('click', () => {
      this.calState.viewDate.setMonth(this.calState.viewDate.getMonth() - 1);
      this.renderCalendar();
    });
    document.getElementById('calNext')?.addEventListener('click', () => {
      this.calState.viewDate.setMonth(this.calState.viewDate.getMonth() + 1);
      this.renderCalendar();
    });

    // Re-render on language change
    document.addEventListener('languageChanged', () => {
      this.renderCalWeekdays();
      this.renderCalendar();
      this.updateDateDisplays();
    });
  }

  renderCalWeekdays() {
    const el = document.getElementById('calWeekdays');
    if (!el) return;
    const names = i18n.t('booking.cal_weekdays').split(',');
    el.innerHTML = names.map(n => `<div>${n}</div>`).join('');
  }

  renderCalendar() {
    const grid = document.getElementById('calDaysGrid');
    const monthYearEl = document.getElementById('calMonthYear');
    if (!grid || !monthYearEl) return;

    const vd = this.calState.viewDate;
    const year = vd.getFullYear();
    const month = vd.getMonth();

    // Month/Year header
    const monthNames = i18n.t('booking.cal_months').split(',');
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    // First day of month & total days
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day-cell empty';
      grid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = d;

      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);

      // Disabled: past or beyond 2 years
      if (cellDate < this.calMinDate || cellDate > this.calMaxDate) {
        cell.classList.add('disabled');
      } else {
        // Highlight states
        const ci = this.calState.checkinDate;
        const co = this.calState.checkoutDate;

        if (ci && this.sameDay(cellDate, ci)) {
          cell.classList.add('selected-checkin');
        }
        if (co && this.sameDay(cellDate, co)) {
          cell.classList.add('selected-checkout');
        }
        if (ci && co && cellDate > ci && cellDate < co) {
          cell.classList.add('in-range');
        }

        // Click handler
        cell.addEventListener('click', () => this.handleCalendarClick(cellDate));
      }

      grid.appendChild(cell);
    }

    // Disable prev button if viewing current month
    const prevBtn = document.getElementById('calPrev');
    if (prevBtn) {
      const now = new Date();
      prevBtn.disabled = (year === now.getFullYear() && month <= now.getMonth());
      prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
    }

    // Disable next button if viewing max month
    const nextBtn = document.getElementById('calNext');
    if (nextBtn) {
      nextBtn.disabled = (year === this.calMaxDate.getFullYear() && month >= this.calMaxDate.getMonth());
      nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
    }
  }

  handleCalendarClick(date) {
    const ci = this.calState.checkinDate;

    if (!this.calState.selectingCheckout || !ci) {
      // First click → set check-in
      this.calState.checkinDate = date;
      this.calState.checkoutDate = null;
      this.calState.selectingCheckout = true;

      // Update hidden input
      const ciStr = this.toDateStr(date);
      document.getElementById('checkin').value = ciStr;
      document.getElementById('checkout').value = '';
      this.booking.updateField('checkin', ciStr);
      this.booking.updateField('checkout', '');
    } else {
      // Second click → set check-out
      if (date <= ci) {
        // Clicked before check-in → restart, treat as new check-in
        this.calState.checkinDate = date;
        this.calState.checkoutDate = null;
        const ciStr = this.toDateStr(date);
        document.getElementById('checkin').value = ciStr;
        document.getElementById('checkout').value = '';
        this.booking.updateField('checkin', ciStr);
        this.booking.updateField('checkout', '');
      } else {
        // Valid check-out
        this.calState.checkoutDate = date;
        this.calState.selectingCheckout = false;

        const coStr = this.toDateStr(date);
        document.getElementById('checkout').value = coStr;
        this.booking.updateField('checkout', coStr);
      }
    }

    this.updateDateDisplays();
    this.renderCalendar();
    this.updatePriceSummary();
    this.validateDatesAndToggleFloor();
  }

  updateDateDisplays() {
    const ciText = document.getElementById('checkinText');
    const coText = document.getElementById('checkoutText');
    const ciDisplay = document.getElementById('checkinDisplay');
    const coDisplay = document.getElementById('checkoutDisplay');

    if (this.calState.checkinDate) {
      ciText.textContent = this.formatDisplayDate(this.calState.checkinDate);
      ciDisplay?.classList.add('active-val');
    } else {
      ciText.textContent = '—';
      ciDisplay?.classList.remove('active-val');
    }

    if (this.calState.checkoutDate) {
      coText.textContent = this.formatDisplayDate(this.calState.checkoutDate);
      coDisplay?.classList.add('active-val');
    } else {
      coText.textContent = '—';
      coDisplay?.classList.remove('active-val');
    }
  }

  formatDisplayDate(d) {
    if (!d) return '—';
    const months = i18n.t('booking.cal_months').split(',');
    return `${d.getDate()} ${months[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`;
  }

  sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /**
   * แปลง Date เป็น YYYY-MM-DD
   */
  toDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  /* ─── Date Gate: ล็อค/ปลดล็อคชั้น+ห้อง ─── */

  validateDatesAndToggleFloor() {
    const floorSelect = document.getElementById('floor');
    if (!floorSelect) return;

    const checkin = this.booking.formData.checkin;
    const checkout = this.booking.formData.checkout;

    if (checkin && checkout && checkout > checkin) {
      floorSelect.disabled = false;
      const opt = floorSelect.querySelector('option[value=""]');
      if (opt) opt.textContent = i18n.currentLang === 'th' ? 'เลือกชั้น' : 'Select Floor';
    } else {
      floorSelect.disabled = true;
      floorSelect.value = '';
      this.booking.updateField('floor', '');
      this.booking.updateField('room', '');
      const roomInput = document.getElementById('room');
      if (roomInput) roomInput.value = '';

      const opt = floorSelect.querySelector('option[value=""]');
      if (opt) {
        opt.textContent = i18n.currentLang === 'th'
          ? 'เลือกชั้น (กรุณาเลือกวันที่ก่อน)'
          : 'Select Floor (select dates first)';
      }
    }

    this.renderRoomGrid();
  }

  /* ─── Floor Dropdown ─── */

  populateFloorDropdown() {
    const floorSelect = document.getElementById('floor');
    if (!floorSelect) return;

    const text = i18n.currentLang === 'th'
      ? 'เลือกชั้น (กรุณาเลือกวันที่ก่อน)'
      : 'Select Floor (select dates first)';
    floorSelect.innerHTML = `<option value="" disabled selected>${text}</option>`;

    for (let i = 1; i <= CONFIG.HOTEL.FLOORS; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i18n.currentLang === 'th' ? 'ชั้น' : 'Floor'} ${i}`;
      floorSelect.appendChild(opt);
    }
  }

  /* ─── Room Grid ─── */

  renderRoomGrid() {
    const grid = document.getElementById('bookingRoomGrid');
    const floorSelect = document.getElementById('floor');
    const roomInput = document.getElementById('room');
    if (!grid) return;

    const selectedFloor = floorSelect?.value;
    grid.innerHTML = '';

    const checkin = this.booking.formData.checkin;
    const checkout = this.booking.formData.checkout;

    // ยังไม่ได้เลือกวัน
    if (!checkin || !checkout || checkout <= checkin) {
      grid.innerHTML = `
        <div style="grid-column: span 5; text-align: center; color: var(--text-light-secondary); font-size: var(--text-sm); opacity: 0.7; padding: var(--space-4);">
          ${i18n.currentLang === 'th' ? 'กรุณาเลือกวันที่ Check-in / Check-out ก่อน' : 'Please select Check-in / Check-out dates first'}
        </div>`;
      return;
    }

    // ยังไม่ได้เลือกชั้น
    if (!selectedFloor) {
      grid.innerHTML = `
        <div style="grid-column: span 5; text-align: center; color: var(--text-light-secondary); font-size: var(--text-sm); opacity: 0.7; padding: var(--space-4);">
          ${i18n.t('booking.select_floor_first') || 'กรุณาเลือกชั้นก่อนเลือกห้องพัก'}
        </div>`;
      return;
    }

    // หาห้องที่จองแล้วในช่วงวันนี้
    const ciDate = new Date(checkin);
    const coDate = new Date(checkout);
    const occupiedRooms = new Set();

    this.bookingsList.forEach((b) => {
      const dbCi = this.parseDateStr(b.checkin);
      const dbCo = this.parseDateStr(b.checkout);
      if (dbCi && dbCo) {
        if (dbCi < coDate && dbCo > ciDate && String(b.floor) === String(selectedFloor)) {
          occupiedRooms.add(Number(b.room));
        }
      }
    });

    // สร้างบล็อก 10 ห้อง
    for (let r = 1; r <= CONFIG.HOTEL.ROOMS_PER_FLOOR; r++) {
      const isOccupied = occupiedRooms.has(r);
      const roomNum = String(r).padStart(2, '0');

      const block = document.createElement('div');
      block.className = `booking-room-block ${isOccupied ? 'occupied' : 'available'}`;
      block.dataset.room = r;
      block.innerHTML = `<span>${roomNum}</span>`;

      if (isOccupied) {
        block.title = i18n.currentLang === 'th' ? 'ห้องไม่ว่างในช่วงนี้' : 'Booked for these dates';
      } else {
        block.title = i18n.currentLang === 'th' ? `ห้อง ${roomNum} ว่าง` : `Room ${roomNum} Available`;

        if (String(this.booking.formData.room) === String(r)) {
          block.classList.add('selected');
        }

        block.addEventListener('click', () => {
          grid.querySelectorAll('.booking-room-block').forEach((el) => el.classList.remove('selected'));
          block.classList.add('selected');
          if (roomInput) roomInput.value = r;
          this.booking.updateField('room', r);
        });
      }

      grid.appendChild(block);
    }
  }

  parseDateStr(str) {
    if (!str) return null;
    const s = String(str).trim();
    
    // Check if it's in D/M/YYYY format
    const parts = s.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        const date = new Date(y, m, d);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
    
    // Try to parse as generic date string (ISO, UTC, etc.)
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    
    return null;
  }

  /* ─── Price Summary ─── */

  updatePriceSummary() {
    const price = this.booking.calculatePrice();

    const roomPriceEl = document.getElementById('summaryRoomPrice');
    const extraBedEl = document.getElementById('summaryExtraBed');
    const extraBedRow = document.getElementById('extraBedRow');
    const nightsEl = document.getElementById('summaryNights');
    const totalEl = document.getElementById('summaryTotal');

    if (roomPriceEl) roomPriceEl.textContent = `฿${UI.formatCurrency(price.roomPrice)}`;
    if (extraBedRow) extraBedRow.style.display = price.extraBedPrice > 0 ? 'flex' : 'none';
    if (extraBedEl) extraBedEl.textContent = `฿${UI.formatCurrency(price.extraBedPrice)}`;
    if (nightsEl) nightsEl.textContent = `× ${price.nights} ${i18n.currentLang === 'th' ? 'คืน' : 'night(s)'}`;
    if (totalEl) totalEl.textContent = `฿${UI.formatCurrency(price.total)}`;
  }

  /* ─── Submit ─── */

  async handleSubmit() {
    UI.clearAllErrors();
    const validation = this.booking.validateForm();

    if (!validation.valid) {
      for (const [field, errorKey] of Object.entries(validation.errors)) {
        const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
        if (input) UI.setInputError(input, errorKey);
      }
      UI.showToast(
        i18n.currentLang === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields',
        'warning'
      );
      return;
    }

    const submitBtn = document.getElementById('bookingSubmit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> ${i18n.t('booking.submitting')}`;

    try {
      const result = await this.booking.submitBooking();

      if (result.success) {
        UI.showModal({
          type: 'success',
          title: i18n.t('modal.success_title'),
          text: i18n.t('modal.success_text'),
          buttonText: i18n.t('modal.ok'),
        });

        // Reset
        this.booking.reset();
        document.getElementById('bookingForm')?.reset();
        document.querySelector('input[name="roomType"][value="standard"]').checked = true;
        document.querySelector('input[name="bedType"][value="single"]').checked = true;
        const roomInput = document.getElementById('room');
        if (roomInput) roomInput.value = '';

        // Reset calendar state
        this.calState.checkinDate = null;
        this.calState.checkoutDate = null;
        this.calState.selectingCheckout = false;
        this.calState.viewDate = new Date();
        document.getElementById('checkin').value = '';
        document.getElementById('checkout').value = '';
        this.updateDateDisplays();
        this.renderCalendar();

        await this.loadBookings();
        this.updatePriceSummary();
        this.validateDatesAndToggleFloor();
      } else {
        UI.showModal({
          type: 'error',
          title: i18n.t('modal.error_title'),
          text: i18n.t('modal.error_text'),
          buttonText: i18n.t('modal.close'),
        });
      }
    } catch (error) {
      UI.showModal({
        type: 'error',
        title: i18n.t('modal.error_title'),
        text: error.message,
        buttonText: i18n.t('modal.close'),
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  /* ─── Plugin System ─── */

  initPlugins() {
    if (window.MetaPlugins && Array.isArray(window.MetaPlugins)) {
      window.MetaPlugins.forEach((plugin) => {
        try {
          if (typeof plugin.init === 'function') {
            plugin.init();
            console.log(`🔌 Plugin "${plugin.constructor.name}" initialized`);
          }
        } catch (err) {
          console.error('🔌 Plugin error:', err);
        }
      });
    }
  }
}
