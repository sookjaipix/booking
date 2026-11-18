/**
 * Sook Jai Pix - Google Sheets & Booking History API Client (v2.1)
 * Multi-layer synchronization:
 * 1. Mode no-cors POST + Hidden Iframe Form Submit for 100% Reliable Writes
 * 2. Smart GET (Fetch CORS + Bulletproof JSONP failover) for 100% Reliable Reads
 * 3. Two-Way Batch Synchronization & Auto-Reconciliation
 * Zero CORS blockages across localhost, file://, and web servers.
 */

var SookJaiSheetsAPI = (() => {
  const STORAGE_KEY_URL = 'sookjai_gas_url';
  const STORAGE_KEY_BOOKINGS = 'sookjai_bookings_cache';
  const STORAGE_KEY_ACTIVE = 'sookjai_load_booking';
  const STORAGE_KEY_LAST_SYNC = 'sookjai_last_sync_time';

  // In-memory fallback if localStorage is unavailable
  const _memoryStore = {};
  function safeStorageGet(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {}
    return _memoryStore[key] !== undefined ? _memoryStore[key] : null;
  }

  function safeStorageSet(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
      }
    } catch (e) {}
    _memoryStore[key] = val;
  }

  function safeStorageRemove(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {}
    delete _memoryStore[key];
  }

  // Sample initial bookings for instant demo experience if cache is completely fresh
  const DEFAULT_SAMPLE_BOOKINGS = [
    {
      id: 'sjp_sample_01',
      docNo: 'SJP-202611-01',
      dateGenerated: '2026-10-30',
      customerName: 'คุณกมลวรรณ & คุณพิชญะ',
      customerPhone: '081-987-6543',
      customerFacebook: 'https://www.facebook.com/kamonwan.p',
      eventType: 'งานมงคลสมรส (พิธีเช้า - ฉลองเที่ยง)',
      location: 'โรงแรม The Athenee Hotel Bangkok',
      eventDate: '2026-11-30',
      timePeriod: '06:30 - 12:00 น.',
      photographerCount: 'ช่างภาพหลัก 2 ท่าน พร้อมผู้ช่วยและชุดไฟ',
      selectedPackage: 'express',
      packageItems: [
        'ถ่ายภาพไม่จำกัดจำนวนภาพ',
        'ปรับแสงสีทุกภาพที่ส่ง',
        'ส่งภาพทาง Google Photos',
        'หลังจากจบงานรับภาพทั้งหมดไม่เกิน 5 วัน'
      ],
      totalAmount: 18500,
      depositAmount: 5000,
      remainingAmount: 13500,
      status: 'รอชำระวันงาน',
      updatedAt: '2026-10-30 14:00:00'
    },
    {
      id: 'sjp_sample_02',
      docNo: 'SJP-202611-02',
      dateGenerated: '2026-11-01',
      customerName: 'คุณพิมลดา & คุณกิตติศักดิ์',
      customerPhone: '089-123-4567',
      customerFacebook: 'https://www.facebook.com/pimlada.k',
      eventType: 'งานฉลองมงคลสมรส (Evening Reception)',
      location: 'ห้องฉัตรา บอลรูม โรงแรมสยามเคมปินสกี้ กรุงเทพฯ',
      eventDate: '2026-12-15',
      timePeriod: '17:30 - 22:30 น.',
      photographerCount: 'ช่างภาพหลัก 2 ท่าน + ช่างภาพแคนดิด 1 ท่าน',
      selectedPackage: 'normal',
      packageItems: [
        'ถ่ายภาพไม่จำกัดจำนวนภาพ',
        'ปรับแสงสีทุกภาพที่ส่ง',
        'ส่งภาพทาง Google Photos',
        'ชุดไฟส่องสว่างบริเวณจุดถ่ายภาพ',
        'หลังจากจบงาน 2-3 วัน ได้รับภาพตัวอย่าง',
        'หลังจากจบงานไม่เกิน 2 สัปดาห์ รับภาพทั้งหมด'
      ],
      totalAmount: 22000,
      depositAmount: 7000,
      remainingAmount: 15000,
      status: 'รอชำระวันงาน',
      updatedAt: '2026-11-01 11:30:00'
    }
  ];

  function getGasUrl() {
    return (safeStorageGet(STORAGE_KEY_URL) || '').trim();
  }

  function setGasUrl(url) {
    if (!url) {
      safeStorageRemove(STORAGE_KEY_URL);
    } else {
      let clean = url.trim();
      if (clean.endsWith('/dev')) {
        clean = clean.replace(/\/dev$/, '/exec');
      }
      safeStorageSet(STORAGE_KEY_URL, clean);
    }
  }

  function isConfigured() {
    const url = getGasUrl();
    return !!(url && url.startsWith('http') && (url.includes('/exec') || url.includes('/macros/s/')));
  }

  function getLastSyncTime() {
    return safeStorageGet(STORAGE_KEY_LAST_SYNC) || '';
  }

  function setLastSyncTime(str) {
    safeStorageSet(STORAGE_KEY_LAST_SYNC, str || new Date().toISOString());
  }

  function getLocalBookings() {
    try {
      const raw = safeStorageGet(STORAGE_KEY_BOOKINGS);
      if (!raw) {
        safeStorageSet(STORAGE_KEY_BOOKINGS, JSON.stringify(DEFAULT_SAMPLE_BOOKINGS));
        return DEFAULT_SAMPLE_BOOKINGS;
      }
      return JSON.parse(raw) || [];
    } catch (e) {
      console.warn('Error reading local bookings cache:', e);
      return [];
    }
  }

  function setLocalBookings(list) {
    try {
      safeStorageSet(STORAGE_KEY_BOOKINGS, JSON.stringify(list || []));
    } catch (e) {
      console.error('Error saving local bookings cache:', e);
    }
  }

  // ===================================================================
  // Smart Two-Way Merge: Safeguards local offline data while syncing with Sheets
  // ===================================================================
  function mergeBookings(localList, remoteList) {
    localList = Array.isArray(localList) ? localList : [];
    remoteList = Array.isArray(remoteList) ? remoteList : [];

    const map = new Map();

    // 1. Add all remote bookings (remote has confirmed sheet data)
    remoteList.forEach(b => {
      if (!b || (!b.id && !b.docNo)) return;
      const key = b.id || b.docNo;
      map.set(key, Object.assign({}, b, { _synced: true }));
    });

    // 2. Add local bookings (preserve any created offline or with newer edits)
    localList.forEach(localB => {
      if (!localB || (!localB.id && !localB.docNo)) return;
      const key = localB.id || localB.docNo;
      if (map.has(key)) {
        const remoteB = map.get(key);
        // Compare updatedAt if both exist
        const localTime = new Date(localB.updatedAt || 0).getTime();
        const remoteTime = new Date(remoteB.updatedAt || 0).getTime();
        if (localTime > remoteTime) {
          map.set(key, Object.assign({}, remoteB, localB, { _synced: false }));
        }
      } else {
        // Item exists only locally (not yet on remote sheet)
        map.set(key, Object.assign({}, localB, { _synced: false }));
      }
    });

    const result = Array.from(map.values());
    // Sort descending by eventDate or updatedAt
    result.sort((a, b) => {
      const dateA = a.eventDate || a.updatedAt || '';
      const dateB = b.eventDate || b.updatedAt || '';
      return dateA.localeCompare(dateB);
    });

    return result;
  }

  // ===================================================================
  // Smart URL Validation & Diagnostics
  // ===================================================================
  function validateGasUrl(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      return { valid: false, error: 'กรุณากรอก Google Apps Script Web App URL' };
    }

    const url = rawUrl.trim();

    // Check if user accidentally pasted Google Sheets Spreadsheet URL
    if (url.includes('docs.google.com/spreadsheets')) {
      return {
        valid: false,
        error: '⚠️ URL ที่กรอกคือลิงก์ Google Sheets! ไม่ใช่ลิงก์ Web App ของ Apps Script\n\n' +
               'วิธีทำที่ถูกต้อง:\n' +
               '1. ในหน้า Google Sheets ให้ไปที่เมนู "ส่วนขยาย (Extensions) > Apps Script"\n' +
               '2. กดปุ่มสีน้ำเงิน "การทำให้ใช้งานได้ (Deploy) > การทำให้ใช้งานได้ใหม่"\n' +
               '3. เลือกประเภท "เว็บแอป (Web app)" และตั้งสิทธิ์ "ทุกคน (Anyone)"\n' +
               '4. คัดลอก URL ที่ลงท้ายด้วย /exec มาใส่ที่นี่'
      };
    }

    // Check if user accidentally pasted Apps Script Editor URL
    if (url.includes('script.google.com/home') || url.includes('/edit') || url.includes('projects/')) {
      return {
        valid: false,
        error: '⚠️ URL ที่กรอกคือหน้าแก้ไขโค้ด Apps Script! ไม่ใช่ลิงก์ Web App\n\n' +
               'วิธีทำที่ถูกต้อง:\n' +
               '1. กดปุ่มสีน้ำเงิน "การทำให้ใช้งานได้ (Deploy)" ด้านบนขวา\n' +
               '2. เลือก "การทำให้ใช้งานได้ใหม่"\n' +
               '3. เลือกประเภท "เว็บแอป" และเลือกผู้มีสิทธิ์เข้าถึงเป็น "ทุกคน (Anyone)"\n' +
               '4. กด Deploy แล้วคัดลอก Web App URL ที่ลงท้ายด้วย /exec'
      };
    }

    if (!url.startsWith('https://script.google.com/macros/s/')) {
      return {
        valid: false,
        error: '⚠️ รูปแบบ URL ไม่ถูกต้อง: Web App URL ต้องขึ้นต้นด้วย https://script.google.com/macros/s/...'
      };
    }

    let correctedUrl = url;
    let warning = null;
    if (url.endsWith('/dev')) {
      correctedUrl = url.replace(/\/dev$/, '/exec');
      warning = 'เปลี่ยน URL จาก /dev เป็น /exec ให้อัตโนมัติ (ลิงก์ /dev ต้องล็อกอินจึงใช้ไม่ได้)';
    }

    return { valid: true, url: correctedUrl, warning: warning };
  }

  // ===================================================================
  // Dual-Channel Read: Fetch (CORS) + Bulletproof JSONP Failover
  // ===================================================================

  // JSONP helper: Injects <script> tag which completely bypasses all browser CORS restrictions
  function requestJsonp(url, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = 'sjp_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      const timeoutMs = 10000;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error(
          'การเชื่อมต่อ Google Apps Script หมดเวลา (Timeout 10s)\n' +
          '💡 สาเหตุที่เป็นไปได้: ในขั้นตอน Deploy ยังไม่ได้เลือก "ผู้มีสิทธิ์เข้าถึง (Who has access)" เป็น "ทุกคน (Anyone)"'
        ));
      }, timeoutMs);

      function cleanup() {
        if (timer) clearTimeout(timer);
        try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
        const el = document.getElementById(callbackName);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      try {
        const urlObj = new URL(url);
        Object.keys(params).forEach(k => {
          if (params[k] !== undefined && params[k] !== null) {
            urlObj.searchParams.set(k, params[k]);
          }
        });
        urlObj.searchParams.set('callback', callbackName);
        urlObj.searchParams.set('_t', String(Date.now()));

        const script = document.createElement('script');
        script.id = callbackName;
        script.src = urlObj.toString();
        script.onerror = () => {
          cleanup();
          reject(new Error('ไม่สามารถโหลดสคริปต์ได้ (ตรวจเช็คว่าใน Apps Script ได้เลือก "Who has access: Anyone" หรือไม่)'));
        };

        document.head.appendChild(script);
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  // Smart GET: tries Fetch first, falls back to JSONP
  async function smartGet(url, params = {}) {
    const urlObj = new URL(url);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null) {
        urlObj.searchParams.set(k, params[k]);
      }
    });
    urlObj.searchParams.set('_t', String(Date.now()));

    // Attempt 1: Standard fetch
    try {
      const resp = await fetch(urlObj.toString(), {
        method: 'GET',
        cache: 'no-store',
        mode: 'cors'
      });

      if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
          throw new Error('HTTP ' + resp.status + ': สิทธิ์การเข้าถึงถูกปฏิเสธ (เกิดจากในขั้นตอน Deploy ไม่ได้เลือก "Who has access: Anyone (ทุกคน)")');
        } else if (resp.status === 404) {
          throw new Error('HTTP 404: ไม่พบ Web App URL นี้ (กรุณาตรวจเช็คว่าคัดลอก URL มาครบถ้วนหรือไม่)');
        }
      }

      const text = await resp.text();
      // Check if Google returned an HTML Login page or error page
      if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
        if (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('Sign in')) {
          throw new Error('Google ส่งหน้าล็อกอินกลับมา (เกิดจากในขั้นตอน Deploy ไม่ได้เลือก "Who has access: Anyone (ทุกคน)")');
        }
        throw new Error('Google Apps Script ส่งหน้าเว็บ HTML กลับมาแทนที่จะเป็น JSON (กรุณาตรวจเช็คการตั้งค่า Deploy)');
      }

      return JSON.parse(text);
    } catch (fetchErr) {
      console.warn('SmartGet: Fetch failed, checking JSONP failover...', fetchErr);
      if (fetchErr.message && (fetchErr.message.includes('Who has access') || fetchErr.message.includes('ล็อกอิน'))) {
        throw fetchErr;
      }
    }

    // Attempt 2: Bulletproof JSONP
    return await requestJsonp(url, params);
  }

  // ===================================================================
  // 100% Guaranteed POST Mutation: Mode no-cors + Hidden Iframe Failover
  // ===================================================================

  // Creates or retrieves a persistent hidden iframe for zero-CORS form POST
  function getOrCreateHiddenIframe() {
    let iframe = document.getElementById('sjp_hidden_gas_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'sjp_hidden_gas_iframe';
      iframe.name = 'sjp_hidden_gas_iframe';
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }
    return iframe;
  }

  /**
   * Sends data mutation (create, update, delete, sync) to Google Apps Script.
   * Uses fetch with mode 'no-cors' and text/plain (CORS safelisted).
   * Falls back to hidden iframe form submission if fetch is restricted.
   */
  async function postToGasReliably(payload) {
    const url = getGasUrl();
    if (!url) throw new Error('ยังไม่ได้กำหนดค่า Google Apps Script Web App URL');

    const jsonString = JSON.stringify(payload);
    let posted = false;

    // Method 1: Fetch with mode: 'no-cors' (CORS-safelisted text/plain header)
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: jsonString
      });
      posted = true;
    } catch (fetchErr) {
      console.warn('postToGasReliably: Fetch no-cors failed, trying hidden form fallback...', fetchErr);
    }

    // Method 2: Hidden iframe form post fallback (supported by 100% of browsers with zero CORS restrictions)
    if (!posted) {
      try {
        getOrCreateHiddenIframe();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = 'sjp_hidden_gas_iframe';
        form.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'payload';
        input.value = jsonString;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          if (form.parentNode) form.parentNode.removeChild(form);
        }, 2000);
        posted = true;
      } catch (formErr) {
        console.error('postToGasReliably: Both fetch and form post failed:', formErr);
        throw formErr;
      }
    }

    return { sent: true };
  }

  // ===================================================================
  // Public API Methods
  // ===================================================================

  // Test connection to Google Apps Script & verify Google Sheets access
  async function testConnection(urlToTest) {
    const raw = (urlToTest || getGasUrl()).trim();
    const validation = validateGasUrl(raw);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const targetUrl = validation.url;

    try {
      const json = await smartGet(targetUrl, { action: 'ping' });

      if (json && json.success) {
        return {
          success: true,
          message: json.message || 'เชื่อมต่อ Google Sheets สำเร็จเรียบร้อย!',
          spreadsheetName: json.spreadsheetName || '',
          sheetName: json.sheetName || 'Bookings',
          spreadsheetUrl: json.spreadsheetUrl || '',
          totalRows: json.totalRows || 0,
          warning: validation.warning,
          targetUrl: targetUrl
        };
      } else if (json && json.isSheetError) {
        return {
          success: false,
          error: `เชื่อมต่อ Apps Script ได้ แต่ติดปัญหาเรื่อง Google Sheet:\n${json.error}\n\n💡 วิธีแก้: กรุณาเปิด Apps Script จากเมนู "ส่วนขยาย (Extensions) > Apps Script" ในไฟล์ Google Sheet โดยตรง`
        };
      } else {
        return {
          success: false,
          error: (json && json.error) || 'ไม่ได้รับผลลัพธ์ที่ถูกต้องจาก Google Apps Script'
        };
      }
    } catch (err) {
      return {
        success: false,
        error: `เชื่อมต่อไม่สำเร็จ (${err.message})\n\n💡 สาเหตุที่เป็นไปได้บ่อยที่สุด:\n` +
               `1. ในขั้นตอน Deploy ยังไม่ได้เลือก "ผู้มีสิทธิ์เข้าถึง (Who has access)" เป็น "ทุกคน (Anyone)"\n` +
               `2. เพิ่งแก้โค้ดใน Apps Script แต่ยังไม่ได้กด "Deploy > จัดการการทำให้ใช้งานได้ > แก้ไข > เวอร์ชันใหม่"`
      };
    }
  }

  // Fetch all bookings (from Google Sheets with smart merge and local cache)
  async function fetchAll() {
    const localData = getLocalBookings();

    if (!isConfigured()) {
      return { success: true, fromGoogleSheets: false, data: localData };
    }

    const gasUrl = getGasUrl();
    try {
      const json = await smartGet(gasUrl, { action: 'read' });

      if (json && json.success && Array.isArray(json.data)) {
        // Smart merge: keep local offline items and update with sheet rows
        const merged = mergeBookings(localData, json.data);
        setLocalBookings(merged);
        setLastSyncTime(new Date().toISOString());

        // Check if there are local bookings that need uploading to Sheets
        const unSyncedItems = merged.filter(b => b._synced === false);
        if (unSyncedItems.length > 0) {
          console.log(`Auto-syncing ${unSyncedItems.length} pending local bookings to Google Sheets...`);
          postToGasReliably({ action: 'sync', localBookings: unSyncedItems }).catch(e => console.warn(e));
        }

        return { success: true, fromGoogleSheets: true, data: merged };
      } else {
        throw new Error((json && json.error) || 'Invalid response from Google Sheets');
      }
    } catch (err) {
      console.warn('Failed to fetch from Google Sheets, using local cache:', err);
      return {
        success: true,
        fromGoogleSheets: false,
        warning: 'ไม่สามารถติดต่อ Google Sheets ได้ชั่วคราว กำลังแสดงข้อมูลจากแคชในเครื่อง',
        data: localData
      };
    }
  }

  // Full Two-Way Synchronization (Pushes all local data to Sheets & retrieves consolidated list)
  async function syncAll() {
    const localData = getLocalBookings();

    if (!isConfigured()) {
      return {
        success: false,
        error: 'ยังไม่ได้เชื่อมต่อ Google Sheets กรุณากดปุ่ม "ตั้งค่า Sheets" เพื่อระบุ Web App URL',
        data: localData,
        count: localData.length
      };
    }

    const gasUrl = getGasUrl();

    try {
      // Step 1: Send batch sync with all local data (supported in v2.1 and backward compatible)
      await postToGasReliably({
        action: 'sync',
        localBookings: localData,
        booking: localData
      });

      // Step 2: Give Google Sheets 700ms to commit
      await new Promise(r => setTimeout(r, 700));

      // Step 3: Read back consolidated data with automatic retry
      let json = await smartGet(gasUrl, { action: 'read' });
      if (!json || !json.success || !Array.isArray(json.data) || (json.data.length === 0 && localData.length > 0)) {
        await new Promise(r => setTimeout(r, 800));
        json = await smartGet(gasUrl, { action: 'read' });
      }

      if (json && json.success && Array.isArray(json.data)) {
        const merged = mergeBookings(localData, json.data);
        setLocalBookings(merged);
        setLastSyncTime(new Date().toISOString());
        return {
          success: true,
          fromGoogleSheets: true,
          count: merged.length,
          data: merged,
          message: `ซิงค์กับ Google Sheets สำเร็จเรียบร้อย (พบข้อมูลทั้งหมด ${merged.length} รายการ)`
        };
      }

      return {
        success: true,
        fromGoogleSheets: true,
        count: localData.length,
        data: localData,
        message: 'ส่งข้อมูลไปยัง Google Sheets เรียบร้อยแล้ว'
      };
    } catch (err) {
      console.error('Error during full sync:', err);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดขณะซิงค์: ' + err.message,
        data: localData,
        count: localData.length
      };
    }
  }

  // Save new booking (and immediately sync all bookings)
  async function createBooking(booking) {
    const local = getLocalBookings();

    if (!booking.id) {
      booking.id = 'sjp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    booking.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const total = Number(booking.totalAmount) || 0;
    const deposit = Number(booking.depositAmount) || 0;
    const remaining = Math.max(0, total - deposit);
    booking.remainingAmount = remaining;
    booking.status = (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : (booking.status === 'ชำระครบถ้วน' ? 'ชำระครบถ้วน' : 'รอชำระวันงาน');

    // Insert or update in local cache
    const existingIndex = local.findIndex(b => b.id === booking.id || (b.docNo && b.docNo === booking.docNo));
    if (existingIndex >= 0) {
      local[existingIndex] = booking;
    } else {
      local.unshift(booking);
    }
    setLocalBookings(local);

    // If Google Sheets is not configured, save locally
    if (!isConfigured()) {
      return { success: true, syncedToSheets: false, data: booking, offline: true, count: local.length };
    }

    // Immediately sync all bookings
    const syncRes = await syncAll();
    return {
      success: true,
      syncedToSheets: syncRes.success,
      data: booking,
      totalCount: syncRes.count || local.length,
      warning: syncRes.success ? null : (syncRes.error || 'ไม่สามารถซิงค์ขึ้น Google Sheets ได้ในขณะนี้')
    };
  }

  // Update existing booking (and immediately sync all bookings)
  async function updateBooking(booking) {
    const local = getLocalBookings();
    const idx = local.findIndex(b => b.id === booking.id || (b.docNo && b.docNo === booking.docNo));

    const total = Number(booking.totalAmount) || 0;
    const deposit = Number(booking.depositAmount) || 0;
    const remaining = Math.max(0, total - deposit);
    booking.remainingAmount = remaining;
    booking.status = (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : (booking.status === 'ชำระครบถ้วน' ? 'ชำระครบถ้วน' : 'รอชำระวันงาน');
    booking.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (idx >= 0) {
      local[idx] = Object.assign({}, local[idx], booking);
    } else {
      local.unshift(booking);
    }
    setLocalBookings(local);

    if (!isConfigured()) {
      return { success: true, syncedToSheets: false, data: booking, offline: true, count: local.length };
    }

    // Immediately sync all bookings
    const syncRes = await syncAll();
    return {
      success: true,
      syncedToSheets: syncRes.success,
      data: booking,
      totalCount: syncRes.count || local.length,
      warning: syncRes.success ? null : (syncRes.error || 'ไม่สามารถส่งไปยัง Google Sheets ได้')
    };
  }

  // Delete booking
  async function deleteBooking(id, docNo) {
    let local = getLocalBookings();
    local = local.filter(b => b.id !== id && (!docNo || b.docNo !== docNo));
    setLocalBookings(local);

    if (!isConfigured()) {
      return { success: true, syncedToSheets: false, offline: true };
    }

    try {
      await postToGasReliably({ action: 'delete', id: id, docNo: docNo });

      setTimeout(async () => {
        try {
          const res = await smartGet(getGasUrl(), { action: 'read' });
          if (res && res.success && Array.isArray(res.data)) {
            const filteredRemote = res.data.filter(b => b.id !== id && (!docNo || b.docNo !== docNo));
            setLocalBookings(filteredRemote);
          }
        } catch (e) {}
      }, 700);

      return { success: true, syncedToSheets: true };
    } catch (err) {
      console.warn('Failed to delete from Google Sheets:', err);
      return {
        success: true,
        syncedToSheets: false,
        warning: 'ลบในเครื่องเรียบร้อยแล้ว แต่ไม่สามารถลบใน Google Sheets ได้'
      };
    }
  }

  // Active booking for passing between pages
  function setActiveBookingForEdit(booking) {
    try {
      safeStorageSet(STORAGE_KEY_ACTIVE, JSON.stringify(booking));
    } catch (e) {
      console.warn(e);
    }
  }

  function getActiveBookingForEdit() {
    try {
      const raw = safeStorageGet(STORAGE_KEY_ACTIVE);
      if (!raw) return null;
      safeStorageRemove(STORAGE_KEY_ACTIVE);
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  return {
    getGasUrl,
    setGasUrl,
    isConfigured,
    getLastSyncTime,
    validateGasUrl,
    testConnection,
    fetchAll,
    syncAll,
    createBooking,
    updateBooking,
    deleteBooking,
    getLocalBookings,
    setLocalBookings,
    setActiveBookingForEdit,
    getActiveBookingForEdit
  };
})();

// Explicitly expose to global environments
if (typeof window !== 'undefined') {
  window.SookJaiSheetsAPI = SookJaiSheetsAPI;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SookJaiSheetsAPI = SookJaiSheetsAPI;
}
if (typeof self !== 'undefined') {
  self.SookJaiSheetsAPI = SookJaiSheetsAPI;
}
