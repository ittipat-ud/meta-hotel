/**
 * ====================================================
 * META HOTEL — Backend (Google Apps Script)
 * 
 * ⚡ วางสคริปต์นี้ใน Extensions > Apps Script
 * ของ Google Sheets ที่ต้องการเก็บบันทึกข้อมูลการจอง
 * ====================================================
 */

// ชื่อแผ่นงานหลักที่จะบันทึกข้อมูล
const SHEET_NAME = "Bookings";

// รหัสผ่านสำหรับการล็อกอินแอดมิน (เก็บไว้ฝั่งหลังบ้าน ปลอดภัย 100% ไม่มีใครส่องโค้ดหน้าเว็บเจอ)
const ADMIN_PASSWORD = "meta2026";

/**
 * ฟังก์ชันสำหรับการตั้งค่าเบื้องต้น (สร้างหัวคอลัมน์ถ้ายังไม่มี)
 */
function initSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Nickname",
      "Phone",
      "Room Type",
      "Bed Type",
      "Extra Bed",
      "Floor",
      "Room",
      "Check-in",
      "Check-out",
      "Total Price",
      "Nights"
    ];
    sheet.appendRow(headers);
    // จัดแต่งหน้าตารายการหัวข้อ
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight("bold")
         .setBackground("#1a56db")
         .setFontColor("#ffffff")
         .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
}

/**
 * รับคำขอแบบ GET (สำหรับดึงข้อมูลรายการจองทั้งหมด)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getBookings") {
    return handleGetBookings();
  }
  
  if (action === "verifyAdmin") {
    var password = e.parameter.password;
    var isValid = (password === ADMIN_PASSWORD);
    return createJsonResponse({
      success: isValid,
      message: isValid ? "Login successful." : "Invalid password."
    });
  }
  
  return createJsonResponse({
    success: false,
    message: "Invalid action parameters."
  });
}

/**
 * รับคำขอแบบ POST (สำหรับบันทึกข้อมูลการจองใหม่)
 */
function doPost(e) {
  try {
    let postData;
    if (e.postData.type === "application/json") {
      postData = JSON.parse(e.postData.contents);
    } else {
      // สำหรับ request ที่ส่งมาแบบ text/plain หรือ form-encoded
      postData = JSON.parse(e.postData.contents);
    }

    const action = postData.action;
    const data = postData.data;

    if (action === "book") {
      return handleNewBooking(data);
    }

    return createJsonResponse({ success: false, message: "Invalid action payload." });
  } catch (err) {
    return createJsonResponse({ success: false, message: "Error: " + err.toString() });
  }
}

/**
 * จัดการการดึงรายการจองห้องพัก (GET handler)
 */
function handleGetBookings() {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // ถ้าไม่มีหน้า Sheet ชื่อ Bookings ให้สร้างขึ้นมาใหม่
      sheet = doc.insertSheet(SHEET_NAME);
      initSheet(sheet);
      return createJsonResponse({ success: true, data: [] });
    }
    
    initSheet(sheet);
    
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = [];
    
    // แปลงแต่ละแถว (ยกเว้นหัวตาราง) เป็น JSON object
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const booking = {};
      
      headers.forEach((header, index) => {
        let val = row[index];
        // แปลงฟิลด์พิเศษ
        if (header === "Timestamp" && val instanceof Date) {
          booking.timestamp = val.toISOString();
        } else if (header === "Nickname") {
          booking.nickname = val;
        } else if (header === "Phone") {
          booking.phone = "'" + val; // ป้องกันปัญหารหัสศูนย์นำหน้าหาย
          booking.phone = val.toString();
        } else if (header === "Room Type") {
          booking.roomType = val;
        } else if (header === "Bed Type") {
          booking.bedType = val;
        } else if (header === "Extra Bed") {
          booking.extraBed = (val === "Yes" || val === true);
        } else if (header === "Floor") {
          booking.floor = val;
        } else if (header === "Room") {
          booking.room = val;
        } else if (header === "Check-in") {
          booking.checkin = formatDateToDMY(val);
        } else if (header === "Check-out") {
          booking.checkout = formatDateToDMY(val);
        } else if (header === "Total Price") {
          booking.totalPrice = val;
        } else if (header === "Nights") {
          booking.nights = val;
        }
      });
      
      data.push(booking);
    }
    
    return createJsonResponse({ success: true, data: data });
  } catch (err) {
    return createJsonResponse({ success: false, data: [], message: err.toString() });
  }
}

/**
 * จัดการการบันทึกรายการจองห้องพักใหม่ลงในชีท (POST handler)
 */
function handleNewBooking(data) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
    }
    
    initSheet(sheet);
    
    const timestamp = new Date();
    
    // จัดข้อมูลลงแถว
    const newRow = [
      timestamp,                               // A: Timestamp
      data.nickname,                           // B: Nickname
      data.phone,                              // C: Phone
      data.roomType,                           // D: Room Type
      data.bedType,                            // E: Bed Type
      data.extraBed ? "Yes" : "No",            // F: Extra Bed
      data.floor,                              // G: Floor
      data.room,                               // H: Room
      data.checkin,                            // I: Check-in
      data.checkout,                           // J: Check-out
      data.totalPrice,                         // K: Total Price
      data.nights                              // L: Nights
    ];
    
    sheet.appendRow(newRow);
    
    return createJsonResponse({
      success: true,
      message: "Booking recorded successfully."
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Database recording error: " + err.toString()
    });
  }
}

/**
 * แปลงค่าวันที่จาก Google Sheets เป็นรูปแบบ D/M/YYYY
 */
function formatDateToDMY(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const d = val.getDate();
    const m = val.getMonth() + 1;
    const y = val.getFullYear();
    return d + "/" + m + "/" + y;
  }
  
  const valStr = String(val).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(valStr)) {
    return valStr;
  }
  
  const timestamp = Date.parse(valStr);
  if (!isNaN(timestamp)) {
    const dObj = new Date(timestamp);
    const d = dObj.getDate();
    const m = dObj.getMonth() + 1;
    const y = dObj.getFullYear();
    return d + "/" + m + "/" + y;
  }
  
  return valStr;
}

/**
 * สร้าง JSON TextOutput เพื่อตอบกลับไปยังหน้าเว็บ (เลี่ยง CORS บล็อก)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
