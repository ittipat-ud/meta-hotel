/* ============================================
   META HOTEL — UI Utilities
   
   🎨 Modal, Toast, Scroll Animations, Navbar
   
   Developer Note:
   - ใช้ได้จากทุก module ผ่าน UI.methodName()
   ============================================ */

class UI {
  /* ─── Modal ─── */

  /**
   * แสดง Modal
   * @param {Object} options - { type: 'success'|'error', title, text, buttonText }
   */
  static showModal({ type = 'success', title, text, buttonText }) {
    // Remove existing modal
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const iconEmoji = type === 'success' ? '✅' : '❌';

    const backdrop = document.createElement('div');
    backdrop.id = 'app-modal';
    backdrop.className = 'modal-backdrop active';
    backdrop.innerHTML = `
      <div class="modal animate-slide-up">
        <button class="modal-close" id="modal-close-btn">&times;</button>
        <div class="modal-icon ${type}">${iconEmoji}</div>
        <h3 class="modal-title">${title}</h3>
        <p class="modal-text">${text}</p>
        <button class="btn btn-primary" id="modal-ok-btn">${buttonText || 'OK'}</button>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Bind close events
    const close = () => backdrop.remove();
    backdrop.querySelector('#modal-close-btn').addEventListener('click', close);
    backdrop.querySelector('#modal-ok-btn').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /* ─── Toast Notifications ─── */

  /**
   * แสดง Toast Notification
   * @param {string} message - ข้อความ
   * @param {string} type - 'success'|'error'|'warning'|'info'
   * @param {number} duration - milliseconds (default: 4000)
   */
  static showToast(message, type = 'info', duration = 4000) {
    // Create container if not exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ─── Scroll Animations ─── */

  /**
   * เริ่มต้น Intersection Observer สำหรับ scroll reveal
   */
  static initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      observer.observe(el);
    });
  }

  /* ─── Smooth Scroll ─── */

  /**
   * เริ่มต้น smooth scroll สำหรับ anchor links
   */
  static initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;
          const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });

          // Close mobile menu if open
          document.querySelector('.navbar-nav')?.classList.remove('open');
          document.querySelector('.navbar-toggle')?.classList.remove('active');
        }
      });
    });
  }

  /* ─── Navbar Scroll Effect ─── */

  /**
   * เริ่มต้นเอฟเฟกต์ navbar เปลี่ยนสีเมื่อ scroll
   */
  static initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('transparent');
      } else {
        navbar.classList.remove('scrolled');
        navbar.classList.add('transparent');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }

  /* ─── Mobile Menu ─── */

  /**
   * เริ่มต้น mobile hamburger menu
   */
  static initMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const nav = document.querySelector('.navbar-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }

  /* ─── Number Formatter ─── */

  /**
   * Format ตัวเลขเป็นสกุลเงิน
   * @param {number} num
   * @returns {string} เช่น "1,500"
   */
  static formatCurrency(num) {
    return num.toLocaleString('th-TH');
  }

  /* ─── Form Helpers ─── */

  /**
   * แสดง/ซ่อน error บน input
   * @param {HTMLElement} input
   * @param {string|null} errorKey - null = clear error
   */
  static setInputError(input, errorKey) {
    const errorEl = input.parentElement.querySelector('.form-error');
    if (errorKey) {
      input.classList.add('error');
      if (errorEl) {
        errorEl.textContent = i18n.t(errorKey);
        errorEl.style.display = 'block';
      }
    } else {
      input.classList.remove('error');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }
  }

  /**
   * Clear errors ทั้งหมด
   */
  static clearAllErrors() {
    document.querySelectorAll('.form-input.error, .form-select.error').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('.form-error').forEach((el) => {
      el.style.display = 'none';
    });
  }
}
