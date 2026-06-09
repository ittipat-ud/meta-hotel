# 🔌 META Hotel — Plugin System Guide

โปรเจกต์นี้ได้รับการออกแบบโดยใช้สถาปัตยกรรมแบบ **Modular Architecture** เพื่อเปิดโอกาสให้คุณหรือนักพัฒนาคนอื่นๆ สามารถพัฒนาส่วนขยายหรือฟีเจอร์เพิ่มเติมได้อย่างเป็นระบบโดยไม่ต้องแก้ไขโค้ดหลักของหน้าบ้าน (`app.js` หรือ `index.html`)

---

## 🚀 ขั้นตอนการสร้าง Plugin ใหม่

คุณสามารถเพิ่มฟีเจอร์ต่างๆ เช่น กล่องแชท (Chat Box), กล่องแสดงความคิดเห็น (Reviews), ป๊อปอัปข้อเสนอพิเศษ (Promo Popups) ได้โดยทำตามขั้นตอนต่อไปนี้:

### 1. สร้างไฟล์ JavaScript สำหรับ Plugin
สร้างไฟล์ JavaScript ภายใต้โฟลเดอร์ `js/plugins/` เช่น `js/plugins/chat.js` โดยโครงสร้างโค้ดต้องมีคลาสและเมธอด `init()` เป็นอย่างน้อย:

```javascript
// js/plugins/chat.js

class ChatPlugin {
  constructor() {
    this.widgetId = 'meta-chat-widget';
  }

  /**
   * เมธอดเริ่มต้นการทำงาน (เป็นจุดเชื่อมโยงกับ App หลัก)
   */
  init() {
    console.log("💬 ChatPlugin is starting...");
    this.createChatWidget();
    this.bindEvents();
  }

  /**
   * สร้าง HTML Elements และเพิ่มเข้าไปใน DOM
   */
  createChatWidget() {
    const chatBubble = document.createElement('div');
    chatBubble.id = this.widgetId;
    chatBubble.style.position = 'fixed';
    chatBubble.style.bottom = '20px';
    chatBubble.style.right = '20px';
    chatBubble.style.width = '60px';
    chatBubble.style.height = '60px';
    chatBubble.style.borderRadius = '50%';
    chatBubble.style.backgroundColor = '#1a56db';
    chatBubble.style.color = '#ffffff';
    chatBubble.style.display = 'flex';
    chatBubble.style.alignItems = 'center';
    chatBubble.style.justifyContent = 'center';
    chatBubble.style.cursor = 'pointer';
    chatBubble.style.fontSize = '24px';
    chatBubble.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    chatBubble.style.zIndex = '9999';
    chatBubble.textContent = '💬';

    document.body.appendChild(chatBubble);
  }

  /**
   * ผูกฟังก์ชันเข้ากับเหตุการณ์ (Events)
   */
  bindEvents() {
    const widget = document.getElementById(this.widgetId);
    widget.addEventListener('click', () => {
      // ตัวอย่างการใช้ UI helper ในโมดูลหลัก
      UI.showModal({
        type: 'success',
        title: i18n.currentLang === 'th' ? 'ติดต่อแชท' : 'Live Chat',
        text: i18n.currentLang === 'th' ? 'ระบบแชทกำลังอยู่ระหว่างการพัฒนา' : 'Live Chat is under construction',
        buttonText: i18n.t('modal.ok')
      });
    });
  }
}
```

### 2. นำเข้าไฟล์สคริปต์ใน HTML
ในไฟล์ `index.html` (ก่อนปิดแท็ก `</body>`) ให้ระบุไฟล์ของ Plugin ต่อท้ายระบบโมดูลหลัก:

```html
  <!-- JS Scripts -->
  <script src="js/config.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/api.js"></script>
  <script src="js/booking.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/app.js"></script>
  
  <!-- Plugins -->
  <script src="js/plugins/chat.js"></script>
```

### 3. ลงทะเบียนและเปิดใช้งาน Plugin
คุณสามารถลงทะเบียน Plugin ในคลาสหลักโดยระบุลงใน `window.MetaPlugins` (มักจะตั้งไว้บนแท็ก HTML หรือสร้างขึ้นก่อนระบบแอปหลักประมวลผล):

ตัวอย่างการลงทะเบียนง่ายๆ ที่หน้า `index.html`:
```html
  <!-- Plugins -->
  <script src="js/plugins/chat.js"></script>
  <script>
    // ลงทะเบียน Plugin เพื่อเตรียมให้ app.js เรียกทำงานอัตโนมัติ
    window.MetaPlugins = [
      new ChatPlugin()
    ];
  </script>
```

---

## 🛠️ อ็อบเจกต์และคลาสส่วนกลางที่ Plugin เรียกใช้ได้

เมื่อ Plugin ถูกทำงานผ่านระบบของ `MetaHotelApp` จะสามารถใช้ API หรือค่าพรีเซ็ตส่วนกลางได้ทันที:
- `CONFIG` — ค่าคอนฟิกูเรชันทั้งหมดใน `js/config.js` (เช่น `CONFIG.HOTEL.NAME`)
- `i18n` — ระบบจัดการสองภาษา เรียกใช้งาน `i18n.t(key)` หรือตรวจสอบ `i18n.currentLang`
- `MetaAPI` — เรียกใช้ API การเชื่อมต่อกับฐานข้อมูล (เช่น `MetaAPI.getBookings()`)
- `UI` — ฟังก์ชันจัดการ UI ส่วนกลาง เช่น:
  - `UI.showModal({ type, title, text, buttonText })`
  - `UI.showToast(message, type, duration)`
  - `UI.formatCurrency(number)`
