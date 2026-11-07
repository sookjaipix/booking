/**
 * ===================================================================
 * Sook Jai Pix - Google Apps Script Backend for Google Sheets
 * ระบบฐานข้อมูลประวัติการจองสำหรับสตูดิโอ Sook Jai Pix (เวอร์ชัน 2.1 รองรับ 2-Way Sync & Zero CORS)
 * ===================================================================
 */

const SHEET_NAME = 'Bookings';
const HEADERS = [
  'ID',
  'เลขที่เอกสาร',
  'วันที่บันทึก',
  'ชื่อลูกค้า',
  'เบอร์โทรลูกค้า',
  'Facebook',
  'ประเภทงาน',
  'สถานที่จัดงาน',
  'วันที่จัดงาน',
  'ช่วงเวลา',
  'จำนวนช่างภาพ',
  'แพ็กเกจ',
  'เงื่อนไขการส่งงาน',
  'ยอดรวม',
  'ยอดมัดจำ',
  'ยอดคงเหลือ',
  'สถานะการชำระ',
  'อัปเดตล่าสุด'
];

// ===================================================================
// ⚙️ การตั้งค่า Google Sheets (เลือกข้อใดข้อหนึ่ง)
// ===================================================================
// วิธีที่ 1 (แนะนำที่สุด): หากคุณเปิดเมนู "ส่วนขยาย (Extensions) > Apps Script"
// จากใน Google Sheets โดยตรง สคริปต์จะเชื่อมโยงชีตให้อัตโนมัติ ไม่ต้องกรอกอะไรในช่องด้านล่างนี้
//
// วิธีที่ 2: หากคุณสร้าง Apps Script แบบเดี่ยว (Standalone ที่ script.google.com) 
// ให้นำ Spreadsheet ID หรือ URL ของ Google Sheets มาวางในเครื่องหมายคำพูดด้านล่างนี้:
const SPREADSHEET_ID_OR_URL = ''; 

/**
 * ฟังก์ชันสำหรับทดสอบการทำงานภายใน Apps Script Editor (กดเลือก 'testConnectionAndSetup' แล้วกดปุ่ม 'Run / เรียกใช้')
 */
function testConnectionAndSetup() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet();
  Logger.log('====================================');
  Logger.log('✅ เชื่อมต่อ Google Sheets สำเร็จเรียบร้อย!');
  Logger.log('ชื่อไฟล์สเปรดชีต: ' + ss.getName());
  Logger.log('ชื่อแผ่นงาน: ' + sheet.getName());
  Logger.log('จำนวนแถวปัจจุบัน: ' + sheet.getLastRow());
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('====================================');
}

/**
 * ค้นหาและเปิด Google Spreadsheet
 */
function getSpreadsheet(e) {
  let ss = null;

  // 1. ลองดึงจาก Active Spreadsheet (กรณีเปิดจากเมนู Extensions ในชีต)
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    ss = null;
  }

  // 2. ถ้าไม่ได้ ให้ลองดึงจาก parameter ที่ส่งมาจาก Web App
  if (!ss && e) {
    let passedId = '';
    if (e.parameter && (e.parameter.sheetId || e.parameter.spreadsheetId)) {
      passedId = (e.parameter.sheetId || e.parameter.spreadsheetId).trim();
    } else if (e.postData && e.postData.contents) {
      try {
        const parsed = JSON.parse(e.postData.contents);
        passedId = (parsed.sheetId || parsed.spreadsheetId || '').trim();
      } catch (ex) {}
    }

    if (passedId) {
      ss = openSpreadsheetTarget(passedId);
    }
  }

  // 3. ถ้ายังไม่ได้ ให้ลองดึงจากตัวแปร SPREADSHEET_ID_OR_URL
  if (!ss && SPREADSHEET_ID_OR_URL && SPREADSHEET_ID_OR_URL.trim()) {
    ss = openSpreadsheetTarget(SPREADSHEET_ID_OR_URL.trim());
  }

  // 4. ถ้ายังไม่พบ ให้แจ้งข้อผิดพลาดพร้อมวิธีแก้ไข
  if (!ss) {
    throw new Error(
      'ไม่พบ Google Spreadsheet! กรุณาทำตามข้อใดข้อหนึ่ง:\n' +
      '1. เปิดสคริปต์นี้จากเมนู "ส่วนขยาย (Extensions) > Apps Script" ภายใน Google Sheet โดยตรง หรือ\n' +
      '2. นำ Spreadsheet ID หรือ URL มาใส่ในตัวแปร SPREADSHEET_ID_OR_URL ด้านบนของสคริปต์'
    );
  }

  return ss;
}

function openSpreadsheetTarget(target) {
  try {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return SpreadsheetApp.openByUrl(target);
    } else {
      return SpreadsheetApp.openById(target);
    }
  } catch (err) {
    throw new Error('ไม่สามารถเปิด Google Sheet ด้วย ID หรือ URL นี้ได้ (' + target + '): ' + err.message);
  }
}

/**
 * ดึงชีต Bookings หรือสร้างใหม่หากยังไม่มี
 */
function getOrCreateSheet(e) {
  const ss = getSpreadsheet(e);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1c1917');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 32);
  }
  return sheet;
}

/**
 * จัดการคำขอแบบ GET (รองรับทั้ง JSON ปกติ และ JSONP callback)
 */
function doGet(e) {
  e = e || { parameter: { action: 'ping' } };
  const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'read';

    // 1. PING: ทดสอบการเชื่อมต่อและตรวจเช็คชีต
    if (action === 'ping') {
      try {
        const ss = getSpreadsheet(e);
        const sheet = getOrCreateSheet(e);
        return jsonResponse({
          success: true,
          message: `เชื่อมต่อสำเร็จ! ไฟล์: "${ss.getName()}" (ชีต: ${sheet.getName()})`,
          spreadsheetName: ss.getName(),
          sheetName: sheet.getName(),
          spreadsheetUrl: ss.getUrl(),
          totalRows: Math.max(0, sheet.getLastRow() - 1),
          timestamp: new Date().toISOString()
        }, callback);
      } catch (errSheet) {
        return jsonResponse({
          success: false,
          error: errSheet.message || errSheet.toString(),
          isSheetError: true
        }, callback);
      }
    }

    // 2. READ: อ่านข้อมูลการจองทั้งหมด
    if (action === 'read') {
      const data = readAllBookings(e);
      return jsonResponse({
        success: true,
        count: data.length,
        data: data
      }, callback);
    }

    // 3. SYNC: สรุปและซิงค์ข้อมูลสองทาง
    if (action === 'sync') {
      let localList = [];
      if (e.parameter && e.parameter.data) {
        try { localList = JSON.parse(e.parameter.data); } catch (ex) { localList = []; }
      }
      const result = syncBookings(localList, e);
      return jsonResponse(result, callback);
    }

    // 4. CREATE via GET
    if (action === 'create') {
      let booking = {};
      if (e.parameter && e.parameter.data) {
        try { booking = JSON.parse(e.parameter.data); } catch (ex) { booking = e.parameter; }
      } else {
        booking = e.parameter;
      }
      if (Array.isArray(booking)) {
        return jsonResponse(syncBookings(booking, e), callback);
      }
      const result = createBooking(booking, e);
      return jsonResponse(result, callback);
    }

    // 5. UPDATE via GET
    if (action === 'update') {
      let booking = {};
      if (e.parameter && e.parameter.data) {
        try { booking = JSON.parse(e.parameter.data); } catch (ex) { booking = e.parameter; }
      } else {
        booking = e.parameter;
      }
      const result = updateBooking(booking, e);
      return jsonResponse(result, callback);
    }

    // 6. DELETE via GET
    if (action === 'delete') {
      const id = e.parameter.id;
      const docNo = e.parameter.docNo;
      const result = deleteBooking(id, docNo, e);
      return jsonResponse(result, callback);
    }

    return jsonResponse({
      success: true,
      message: 'Sook Jai Pix Google Apps Script Web App is Online',
      version: '2.1'
    }, callback);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, callback);
  }
}

/**
 * จัดการคำขอแบบ POST (สำหรับ fetch ส่ง JSON payload หรือ Form POST)
 */
function doPost(e) {
  e = e || { parameter: { action: 'ping' } };
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        if (e.parameter && (e.parameter.payload || e.parameter.data)) {
          try {
            payload = JSON.parse(e.parameter.payload || e.parameter.data);
          } catch (pErr) {
            payload = e.parameter || {};
          }
        } else {
          payload = e.parameter || {};
        }
      }
    } else if (e && e.parameter) {
      if (e.parameter.payload || e.parameter.data) {
        try {
          payload = JSON.parse(e.parameter.payload || e.parameter.data);
        } catch (pErr) {
          payload = e.parameter || {};
        }
      } else {
        payload = e.parameter || {};
      }
    }

    const action = payload.action || (e.parameter && e.parameter.action) || 'create';

    if (action === 'ping') {
      const ss = getSpreadsheet(e);
      const sheet = getOrCreateSheet(e);
      return jsonResponse({
        success: true,
        message: `เชื่อมต่อสำเร็จ! ไฟล์: "${ss.getName()}" (ชีต: ${sheet.getName()})`,
        spreadsheetName: ss.getName(),
        sheetName: sheet.getName(),
        totalRows: Math.max(0, sheet.getLastRow() - 1)
      });
    }

    if (action === 'read') {
      const data = readAllBookings(e);
      return jsonResponse({ success: true, count: data.length, data: data });
    }

    if (action === 'sync') {
      const localList = payload.localBookings || payload.bookings || payload.data || [];
      const result = syncBookings(localList, e);
      return jsonResponse(result);
    }

    if (action === 'create') {
      const dataToCreate = payload.booking || payload.bookings || payload.data || payload;
      if (Array.isArray(dataToCreate)) {
        return jsonResponse(syncBookings(dataToCreate, e));
      }
      const result = createBooking(dataToCreate, e);
      return jsonResponse(result);
    }

    if (action === 'update') {
      const result = updateBooking(payload.booking || payload, e);
      return jsonResponse(result);
    }

    if (action === 'delete') {
      const id = payload.id;
      const docNo = payload.docNo;
      const result = deleteBooking(id, docNo, e);
      return jsonResponse(result);
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * อ่านข้อมูลการจองทั้งหมดจากชีต
 */
function readAllBookings(e) {
  const sheet = getOrCreateSheet(e);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const bookings = values.map(row => {
    let pkgItems = [];
    if (row[12]) {
      pkgItems = String(row[12]).split('\n').filter(Boolean);
    }

    return {
      id: String(row[0] || ''),
      docNo: String(row[1] || ''),
      dateGenerated: String(row[2] || ''),
      customerName: String(row[3] || ''),
      customerPhone: String(row[4] || ''),
      customerFacebook: String(row[5] || ''),
      eventType: String(row[6] || ''),
      location: String(row[7] || ''),
      eventDate: row[8] instanceof Date ? Utilities.formatDate(row[8], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[8] || ''),
      timePeriod: String(row[9] || ''),
      photographerCount: String(row[10] || ''),
      selectedPackage: String(row[11] || 'express'),
      packageItems: pkgItems,
      totalAmount: Number(row[13] || 0),
      depositAmount: Number(row[14] || 0),
      remainingAmount: Number(row[15] || 0),
      status: String(row[16] || 'รอชำระวันงาน'),
      updatedAt: String(row[17] || '')
    };
  });

  return bookings;
}

/**
 * บันทึกการจองใหม่ (ป้องกันการสร้างแถวซ้ำด้วย ID หรือ docNo)
 */
function createBooking(b, e) {
  if (Array.isArray(b)) {
    return syncBookings(b, e);
  }
  const sheet = getOrCreateSheet(e);
  const lastRow = sheet.getLastRow();

  const id = String(b.id || ('sjp_' + Date.now() + '_' + Math.floor(Math.random() * 1000))).trim();
  const docNo = String(b.docNo || ('SJP-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMM') + '-' + Math.floor(100 + Math.random() * 900))).trim();

  // ตรวจสอบว่ามีรายการนี้อยู่แล้วหรือไม่ หากมีอยู่แล้วให้อัปเดตแทน
  if (lastRow > 1) {
    const idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const docNoCol = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let i = 0; i < idCol.length; i++) {
      const curId = String(idCol[i][0] || '').trim();
      const curDoc = String(docNoCol[i][0] || '').trim();
      if ((id && curId === id) || (docNo && curDoc === docNo)) {
        return updateBooking(b, e);
      }
    }
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const total = Number(b.totalAmount) || 0;
  const deposit = Number(b.depositAmount) || 0;
  const remaining = Math.max(0, total - deposit);
  const status = (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : (b.status === 'ชำระครบถ้วน' ? 'ชำระครบถ้วน' : 'รอชำระวันงาน');
  const pkgItems = Array.isArray(b.packageItems) ? b.packageItems.join('\n') : String(b.packageItems || '');

  const newRow = [
    id,
    docNo,
    b.dateGenerated || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    b.customerName || '',
    b.customerPhone || '',
    b.customerFacebook || '',
    b.eventType || '',
    b.location || '',
    b.eventDate || '',
    b.timePeriod || '',
    b.photographerCount || '',
    b.selectedPackage || 'express',
    pkgItems,
    total,
    deposit,
    remaining,
    status,
    b.updatedAt || now
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    id: id,
    docNo: docNo,
    message: 'บันทึกข้อมูลการจองลง Google Sheets สำเร็จเรียบร้อยแล้ว'
  };
}

/**
 * แก้ไขข้อมูลการจองที่มีอยู่
 */
function updateBooking(b, e) {
  const sheet = getOrCreateSheet(e);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createBooking(b, e);

  const idToFind = String(b.id || '').trim();
  const docNoToFind = String(b.docNo || '').trim();
  const idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const docNoCol = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

  let targetRowIndex = -1;
  for (let i = 0; i < idCol.length; i++) {
    const curId = String(idCol[i][0] || '').trim();
    const curDoc = String(docNoCol[i][0] || '').trim();
    if ((idToFind && curId === idToFind) || (docNoToFind && curDoc === docNoToFind)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    return createBooking(b, e);
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const total = Number(b.totalAmount) || 0;
  const deposit = Number(b.depositAmount) || 0;
  const remaining = Math.max(0, total - deposit);
  const status = (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : (b.status === 'ชำระครบถ้วน' ? 'ชำระครบถ้วน' : 'รอชำระวันงาน');
  const pkgItems = Array.isArray(b.packageItems) ? b.packageItems.join('\n') : String(b.packageItems || '');

  const updatedData = [
    idToFind || String(idCol[targetRowIndex - 2][0]),
    docNoToFind || String(docNoCol[targetRowIndex - 2][0]),
    b.dateGenerated || '',
    b.customerName || '',
    b.customerPhone || '',
    b.customerFacebook || '',
    b.eventType || '',
    b.location || '',
    b.eventDate || '',
    b.timePeriod || '',
    b.photographerCount || '',
    b.selectedPackage || 'express',
    pkgItems,
    total,
    deposit,
    remaining,
    status,
    now
  ];

  sheet.getRange(targetRowIndex, 1, 1, HEADERS.length).setValues([updatedData]);

  return {
    success: true,
    id: idToFind,
    docNo: docNoToFind,
    message: 'อัปเดตข้อมูลการจองใน Google Sheets เรียบร้อยแล้ว'
  };
}

/**
 * ลบข้อมูลการจอง
 */
function deleteBooking(id, docNo, e) {
  const sheet = getOrCreateSheet(e);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, error: 'ชีตว่างเปล่า ไม่มีข้อมูลให้ลบ' };

  const idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const docNoCol = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

  for (let i = 0; i < idCol.length; i++) {
    const curId = String(idCol[i][0] || '').trim();
    const curDoc = String(docNoCol[i][0] || '').trim();
    if ((id && curId === String(id).trim()) || (docNo && curDoc === String(docNo).trim())) {
      sheet.deleteRow(i + 2);
      return {
        success: true,
        message: 'ลบรายการจองออกจาก Google Sheets เรียบร้อยแล้ว'
      };
    }
  }

  return { success: false, error: 'ไม่พบรายการที่ต้องการลบใน Google Sheets' };
}

/**
 * ซิงค์ข้อมูลสองทาง (Two-Way Batch Synchronization)
 * ผสานรายการระหว่างแคชในเครื่องกับ Google Sheets โดยไม่มีรายการสูญหาย และไม่ซ้ำซ้อน
 */
function syncBookings(localBookings, e) {
  const sheet = getOrCreateSheet(e);
  const lastRow = sheet.getLastRow();

  // อ่านรายการที่มีอยู่เดิมในชีต
  const existingRows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues() : [];
  const existingMap = {};

  for (let i = 0; i < existingRows.length; i++) {
    const rowId = String(existingRows[i][0] || '').trim();
    const rowDocNo = String(existingRows[i][1] || '').trim();
    if (rowId) existingMap[rowId] = i + 2;
    if (rowDocNo) existingMap[rowDocNo] = i + 2;
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  let inserted = 0;
  let updated = 0;

  if (Array.isArray(localBookings)) {
    for (let j = 0; j < localBookings.length; j++) {
      const b = localBookings[j];
      if (!b || (!b.customerName && !b.docNo)) continue;

      const id = String(b.id || ('sjp_' + Date.now() + '_' + Math.floor(Math.random() * 1000))).trim();
      const docNo = String(b.docNo || ('SJP-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMM') + '-' + Math.floor(100 + Math.random() * 900))).trim();

      const total = Number(b.totalAmount) || 0;
      const deposit = Number(b.depositAmount) || 0;
      const remaining = Math.max(0, total - deposit);
      const status = (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : 'รอชำระวันงาน';
      const pkgItems = Array.isArray(b.packageItems) ? b.packageItems.join('\n') : String(b.packageItems || '');

      const rowData = [
        id,
        docNo,
        b.dateGenerated || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        b.customerName || '',
        b.customerPhone || '',
        b.customerFacebook || '',
        b.eventType || '',
        b.location || '',
        b.eventDate || '',
        b.timePeriod || '',
        b.photographerCount || '',
        b.selectedPackage || 'express',
        pkgItems,
        total,
        deposit,
        remaining,
        status,
        b.updatedAt || now
      ];

      const targetRow = existingMap[id] || existingMap[docNo];
      if (targetRow) {
        sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([rowData]);
        updated++;
      } else {
        sheet.appendRow(rowData);
        const newRowIdx = sheet.getLastRow();
        existingMap[id] = newRowIdx;
        existingMap[docNo] = newRowIdx;
        inserted++;
      }
    }
  }

  const allBookings = readAllBookings(e);
  return {
    success: true,
    message: `ซิงค์ข้อมูลสำเร็จ (เพิ่มใหม่ ${inserted} รายการ, อัปเดต ${updated} รายการ, รวม ${allBookings.length} รายการ)`,
    inserted: inserted,
    updated: updated,
    count: allBookings.length,
    data: allBookings
  };
}

/**
 * ส่งผลลัพธ์กลับในรูปแบบ JSON หรือ JSONP
 */
function jsonResponse(obj, callback) {
  let outputText = JSON.stringify(obj);
  let mimeType = ContentService.MimeType.JSON;

  if (callback && typeof callback === 'string' && /^[a-zA-Z0-9_$.]+$/.test(callback)) {
    outputText = callback + '(' + outputText + ');';
    mimeType = ContentService.MimeType.JAVASCRIPT;
  }

  return ContentService.createTextOutput(outputText).setMimeType(mimeType);
}
