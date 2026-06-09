/* ============================================
   META HOTEL — Admin Dashboard
   
   🔧 Entry point หลังบ้าน
   Login, Stats, Booking Table, Room Grid
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const admin = new AdminDashboard();
  admin.init();
});

class AdminDashboard {
  constructor() {
    this.isAuthenticated = false;
    this.bookings = [];
    this.filteredBookings = [];
    this.mapDate = new Date(); // วันที่แสดงแผนผัง (default = วันนี้)
  }

  init() {
    this.checkAuth();
    this.bindEvents();
  }

  /* ─── Authentication ─── */

  checkAuth() {
    const auth = sessionStorage.getItem(CONFIG.STORAGE.ADMIN_AUTH);
    if (auth === 'true') {
      this.isAuthenticated = true;
      this.showDashboard();
      this.loadData();
    } else {
      this.showLogin();
    }
  }

  showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
  }

  async handleLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const errorEl = document.getElementById('loginError');
    const password = passwordInput.value;

    const result = await MetaAPI.verifyAdmin(password);

    if (result.success) {
      this.isAuthenticated = true;
      sessionStorage.setItem(CONFIG.STORAGE.ADMIN_AUTH, 'true');
      this.showDashboard();
      this.loadData();
    } else {
      errorEl.classList.add('show');
      passwordInput.value = '';
      passwordInput.focus();
      
      // Shake animation
      const card = document.querySelector('.login-card');
      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = 'shake 0.5s ease';
    }
  }

  handleLogout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem(CONFIG.STORAGE.ADMIN_AUTH);
    this.showLogin();
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').classList.remove('show');
  }

  /* ─── Data Loading ─── */

  async loadData() {
    this.showLoading(true);

    // ตั้งค่า date picker เป็นวันนี้
    const mapDatePicker = document.getElementById('mapDatePicker');
    if (mapDatePicker && !mapDatePicker.value) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      mapDatePicker.value = `${y}-${m}-${d}`;
      this.mapDate = today;
    }

    try {
      const result = await MetaAPI.getBookings();
      if (result.success) {
        this.bookings = result.data || [];
        this.filteredBookings = [...this.bookings];
      }
    } catch (error) {
      console.error('[Admin] Error loading data:', error);
    } finally {
      // แสดงผลเสมอ ถึงแม้ API จะ error (แสดงห้องว่างทั้งหมด)
      this.renderStats();
      this.renderBookingTable();
      this.renderRoomGrid();
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const loading = document.getElementById('adminLoading');
    const content = document.getElementById('adminContent');
    if (loading) loading.style.display = show ? 'flex' : 'none';
    if (content) content.style.display = show ? 'none' : 'block';
  }

  /* ─── Statistics ─── */

  renderStats() {
    const totalBookings = this.bookings.length;
    const totalRevenue = this.bookings.reduce((sum, b) => sum + (parseInt(b.totalPrice) || 0), 0);
    
    // นับห้องที่ถูกจองในวันที่เลือก (mapDate)
    const statusMap = this.getRoomStatusMapForDate(this.mapDate);
    let occupiedCount = 0;
    statusMap.forEach((status) => {
      if (status === 'occupied') occupiedCount++;
    });
    const totalRooms = CONFIG.HOTEL.FLOORS * CONFIG.HOTEL.ROOMS_PER_FLOOR;
    const availableRooms = totalRooms - occupiedCount;

    // นับจองวันนี้ (ทำรายการใหม่วันนี้)
    const today = new Date().toLocaleDateString('en-GB');
    const todayBookings = this.bookings.filter((b) => {
      if (!b.timestamp) return false;
      const bookingDate = new Date(b.timestamp).toLocaleDateString('en-GB');
      return bookingDate === today;
    }).length;

    document.getElementById('statTotalBookings').textContent = totalBookings;
    document.getElementById('statAvailableRooms').textContent = availableRooms;
    document.getElementById('statRevenue').textContent = `฿${totalRevenue.toLocaleString()}`;
    document.getElementById('statTodayBookings').textContent = todayBookings;
  }

  /* ─── Date Parsing Helper ─── */

  /**
   * แปลง "D/M/YYYY" → Date object
   */
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

  /**
   * หาห้องที่ถูกจองในวันที่ระบุ
   * @param {Date} targetDate
   * @returns {Set<string>} Set of "floor-room" keys
   */
  /**
   * คำนวณสถานะห้องพักทั้งหมดในวันที่ระบุ
   * @param {Date} targetDate
   * @returns {Map<string, string>} Map of "floor-room" -> "occupied" | "checkout" | "available"
   */
  getRoomStatusMapForDate(targetDate) {
    const statusMap = new Map();
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    // รอบที่ 1: ค้นหารายการจองเพื่อระบุห้องที่จองแล้ว (Red - Occupied)
    this.bookings.forEach((b) => {
      const ci = this.parseDateStr(b.checkin);
      const co = this.parseDateStr(b.checkout);
      if (ci && co) {
        const key = `${b.floor}-${b.room}`;
        if (target >= ci && target < co) {
          statusMap.set(key, 'occupied');
        }
      }
    });

    // รอบที่ 2: ค้นหารายการจองเพื่อระบุห้องที่เช็คเอาท์ในวันนั้น (Yellow - Checkout)
    // โดยจะไม่เขียนทับห้องที่มีการจองใหม่ (Check-in) เข้ามาในวันเดียวกัน
    this.bookings.forEach((b) => {
      const ci = this.parseDateStr(b.checkin);
      const co = this.parseDateStr(b.checkout);
      if (ci && co) {
        const key = `${b.floor}-${b.room}`;
        if (target.getFullYear() === co.getFullYear() &&
            target.getMonth() === co.getMonth() &&
            target.getDate() === co.getDate()) {
          if (statusMap.get(key) !== 'occupied') {
            statusMap.set(key, 'checkout');
          }
        }
      }
    });

    return statusMap;
  }

  /* ─── Booking Table ─── */

  renderBookingTable() {
    const tbody = document.getElementById('bookingTableBody');
    const emptyState = document.getElementById('bookingEmpty');
    if (!tbody) return;

    if (this.filteredBookings.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const formatForDisplay = (dateStr) => {
      const dObj = this.parseDateStr(dateStr);
      if (!dObj) return dateStr || '-';
      return `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear()}`;
    };

    tbody.innerHTML = this.filteredBookings
      .slice()
      .reverse() // ล่าสุดขึ้นก่อน
      .map((b, index) => {
        const roomLabel = `${b.floor}-${String(b.room).padStart(2, '0')}`;
        const typeLabel = b.roomType === 'family' ? 'Family' : 'Standard';
        const typeBadge = b.roomType === 'family'
          ? '<span class="badge badge-primary">Family</span>'
          : '<span class="badge badge-success">Standard</span>';
        const bedLabel = b.bedType === 'double' ? '🛏️ คู่' : '🛏️ เดี่ยว';
        const extraBedLabel = b.extraBed ? '➕' : '';
        const timestamp = b.timestamp
          ? new Date(b.timestamp).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '-';

        return `
          <tr>
            <td>${this.filteredBookings.length - index}</td>
            <td class="name-cell">${this.escapeHtml(b.nickname || '-')}</td>
            <td>${this.escapeHtml(b.phone || '-')}</td>
            <td>
              <div class="room-cell">
                ${typeBadge}
                <span>${roomLabel}</span>
              </div>
            </td>
            <td>${bedLabel} ${extraBedLabel}</td>
            <td>${formatForDisplay(b.checkin)}</td>
            <td>${formatForDisplay(b.checkout)}</td>
            <td><strong>฿${parseInt(b.totalPrice || 0).toLocaleString()}</strong></td>
            <td>${timestamp}</td>
          </tr>
        `;
      })
      .join('');
  }

  /* ─── Room Grid (Floor Map) — Date-Aware ─── */

  renderRoomGrid() {
    const gridContainer = document.getElementById('roomGridContainer');
    if (!gridContainer) return;

    // ใช้ mapDate เป็นวันอ้างอิงเพื่อดึงสถานะห้อง
    const statusMap = this.getRoomStatusMapForDate(this.mapDate);

    let html = '';

    // แสดงจากชั้น 10 ลงมาชั้น 1
    for (let floor = CONFIG.HOTEL.FLOORS; floor >= 1; floor--) {
      html += `<div class="floor-row">`;
      html += `<span class="floor-label">F${floor}</span>`;
      html += `<div class="floor-rooms">`;

      for (let room = 1; room <= CONFIG.HOTEL.ROOMS_PER_FLOOR; room++) {
        const key = `${floor}-${room}`;
        const status = statusMap.get(key) || 'available'; // 'occupied', 'checkout', 'available'
        const roomNum = String(room).padStart(2, '0');
        
        let statusText = 'ว่าง';
        if (status === 'occupied') {
          statusText = 'จองแล้ว';
        } else if (status === 'checkout') {
          statusText = 'เช็คเอาท์วันนี้';
        }

        html += `<div class="room-cell ${status}" title="ชั้น ${floor} ห้อง ${roomNum} (${statusText})">${roomNum}</div>`;
      }

      html += `</div></div>`;
    }

    gridContainer.innerHTML = html;
  }

  /* ─── Search / Filter ─── */

  handleSearch(query) {
    const q = query.toLowerCase().trim();
    
    if (!q) {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter((b) => {
        return (
          (b.nickname && b.nickname.toLowerCase().includes(q)) ||
          (b.phone && b.phone.includes(q)) ||
          (b.roomType && b.roomType.toLowerCase().includes(q)) ||
          (`${b.floor}-${b.room}`.includes(q))
        );
      });
    }

    this.renderBookingTable();
  }

  /* ─── Export CSV ─── */

  exportCSV() {
    if (this.bookings.length === 0) {
      alert('ไม่มีข้อมูลให้ export');
      return;
    }

    const headers = [
      'Timestamp', 'Nickname', 'Phone', 'Room Type', 'Bed Type',
      'Extra Bed', 'Floor', 'Room', 'Check-in', 'Check-out', 'Total Price',
    ];

    const rows = this.bookings.map((b) => [
      b.timestamp || '',
      b.nickname || '',
      b.phone || '',
      b.roomType || '',
      b.bedType || '',
      b.extraBed ? 'Yes' : 'No',
      b.floor || '',
      b.room || '',
      b.checkin || '',
      b.checkout || '',
      b.totalPrice || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meta_hotel_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  /* ─── Event Binding ─── */

  bindEvents() {
    // Login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLogin());
    }

    // Login on Enter key
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }

    // Search
    const searchInput = document.getElementById('bookingSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Export
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportCSV());
    }

    // Map Date Picker — เลือกวันดูแผนผัง
    const mapDatePicker = document.getElementById('mapDatePicker');
    if (mapDatePicker) {
      mapDatePicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          this.mapDate = new Date(val + 'T00:00:00');
          this.renderRoomGrid();
          this.renderStats();
        }
      });
    }
  }

  /* ─── Helpers ─── */

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/* ─── Shake animation for login error ─── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);
