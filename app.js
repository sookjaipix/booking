// Sook Jai Pix - Balance Summary Generator Logic
// Minimal Luxury Studio Edition

document.addEventListener('DOMContentLoaded', () => {
  // 1. Data Definitions for Packages
  const PACKAGE_DETAILS = {
    express: {
      name: 'ส่งงานด่วน',
      badge: 'ส่งงานด่วน (Express)',
      badgeClass: 'bg-stone-900 text-white border-stone-800',
      icon: 'zap',
      items: [
        'ถ่ายภาพไม่จำกัดจำนวนภาพ',
        'ปรับแสงสีทุกภาพที่ส่ง',
        'ส่งภาพทาง Google Photos',
        'หลังจากจบงานรับภาพทั้งหมดไม่เกิน 5 วัน'
      ]
    },
    normal: {
      name: 'ส่งงานปกติ',
      badge: 'ส่งงานปกติ (Standard)',
      badgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
      icon: 'camera',
      items: [
        'ถ่ายภาพไม่จำกัดจำนวนภาพ',
        'ปรับแสงสีทุกภาพที่ส่ง',
        'ส่งภาพทาง Google Photos',
        'ชุดไฟส่องสว่างบริเวณจุดถ่ายภาพ',
        'หลังจากจบงาน 2-3 วัน ได้รับภาพตัวอย่าง',
        'หลังจากจบงานไม่เกิน 2 สัปดาห์ รับภาพทั้งหมด'
      ]
    }
  };

  // State
  const state = {
    currentBookingId: null, // Tracks if this is an existing booking from database
    currentDocNo: null,
    customerName: '',
    customerPhone: '',
    eventType: '',
    location: '',
    timePeriod: '',
    photographerCount: '',
    eventDate: '',
    customerFacebook: '',
    selectedPackage: 'normal', // Default to Standard package
    customPackageItems: null,
    totalAmount: 0,
    depositAmount: 0,
    remainingAmount: 0,
    activeTheme: 'clean' // Default to Atelier White (Clean Minimal)
  };

  // Google Sheets & History Integration Elements
  const headerBookingCount = document.getElementById('headerBookingCount');
  const bannerEditingBooking = document.getElementById('bannerEditingBooking');
  const bannerEditingDocNo = document.getElementById('bannerEditingDocNo');
  const btnCancelEditingBooking = document.getElementById('btnCancelEditingBooking');
  const btnSaveToSheets = document.getElementById('btnSaveToSheets');
  const btnSaveToSheetsText = document.getElementById('btnSaveToSheetsText');
  const btnMobileSaveSheets = document.getElementById('btnMobileSaveSheets');

  // DOM Elements - Inputs
  const elCustomerName = document.getElementById('inputCustomerName');
  const elCustomerPhone = document.getElementById('inputCustomerPhone');
  const elEventType = document.getElementById('inputEventType');
  const elLocation = document.getElementById('inputLocation');
  const elTimePeriod = document.getElementById('inputTimePeriod');
  const elPhotographerCount = document.getElementById('inputPhotographerCount');
  const elEventDate = document.getElementById('inputEventDate');
  const elCustomerFacebook = document.getElementById('inputCustomerFacebook');
  const linkOpenFacebook = document.getElementById('linkOpenFacebook');
  const elTotalAmount = document.getElementById('inputTotalAmount');
  const elDepositAmount = document.getElementById('inputDepositAmount');
  const elRadioPackages = document.querySelectorAll('input[name="deliveryPackage"]');
  const labelPkgExpress = document.getElementById('labelPkgExpress');
  const labelPkgNormal = document.getElementById('labelPkgNormal');
  const packageItemsList = document.getElementById('packageItemsList');
  const btnResetPackageText = document.getElementById('btnResetPackageText');

  // DOM Elements - Live Card Preview
  const summaryCard = document.getElementById('summaryCardToExport');
  const cardCustomerName = document.getElementById('cardCustomerName');
  const cardCustomerPhone = document.getElementById('cardCustomerPhone');
  const cardEventType = document.getElementById('cardEventType');
  const cardLocation = document.getElementById('cardLocation');
  const cardDateTime = document.getElementById('cardDateTime');
  const cardPhotographerCount = document.getElementById('cardPhotographerCount');
  const cardDeliveryItems = document.getElementById('cardDeliveryItems');
  const cardTotalAmount = document.getElementById('cardTotalAmount');
  const cardDepositAmount = document.getElementById('cardDepositAmount');
  const cardRemainingAmount = document.getElementById('cardRemainingAmount');
  const displayRemainingAmount = document.getElementById('displayRemainingAmount');
  const badgePaymentStatus = document.getElementById('badgePaymentStatus');
  const cardDocNo = document.getElementById('cardDocNo');
  const cardDateGenerated = document.getElementById('cardDateGenerated');

  // Buttons
  const btnSaveJpeg = document.getElementById('btnSaveJpeg');
  const btnTopSaveJpeg = document.getElementById('btnTopSaveJpeg');
  const btnCopyImage = document.getElementById('btnCopyImage');
  const btnGoogleCalendar = document.getElementById('btnGoogleCalendar');
  const btnQuickAddToCalendar = document.getElementById('btnQuickAddToCalendar');
  const btnQuickSample = document.getElementById('btnQuickSample');
  const btnClearForm = document.getElementById('btnClearForm');
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');

  // Format currency
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null || amount === '') return '฿0';
    return '฿' + Number(amount).toLocaleString('th-TH');
  }

  // Format date Thai (Short Clean)
  function formatThaiDate(dateString) {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const day = d.getDate();
      const month = thaiMonths[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  }

  // Format English Date for Header
  function formatEnglishDate(dateObj) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const d = dateObj.getDate();
    const m = months[dateObj.getMonth()];
    const y = dateObj.getFullYear();
    return `${d} ${m} ${y}`;
  }

  // Generate Unique Doc No
  function generateDocNo() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `SJP-${y}${m}-${random}`;
  }

  // Update Facebook quick open link button UI
  function updateFacebookLinkUI() {
    if (!elCustomerFacebook || !linkOpenFacebook) return;
    const val = elCustomerFacebook.value.trim();
    if (val && (val.startsWith('http://') || val.startsWith('https://') || val.includes('facebook.com'))) {
      const url = val.startsWith('http') ? val : `https://${val}`;
      linkOpenFacebook.href = url;
      linkOpenFacebook.classList.remove('hidden');
    } else {
      linkOpenFacebook.classList.add('hidden');
    }
  }

  // Initialize Form with State
  function populateForm() {
    elCustomerName.value = state.customerName || '';
    if (elCustomerPhone) elCustomerPhone.value = state.customerPhone || '';
    elEventType.value = state.eventType || '';
    elLocation.value = state.location || '';
    elTimePeriod.value = state.timePeriod || '';
    elPhotographerCount.value = state.photographerCount || '';
    elEventDate.value = state.eventDate || '';
    if (elCustomerFacebook) {
      elCustomerFacebook.value = state.customerFacebook || '';
      updateFacebookLinkUI();
    }
    elTotalAmount.value = state.totalAmount > 0 ? state.totalAmount : '';
    elDepositAmount.value = state.depositAmount > 0 ? state.depositAmount : '';

    // Check correct radio
    elRadioPackages.forEach(radio => {
      radio.checked = (radio.value === state.selectedPackage);
    });

    updatePackageSelectionUI();
    renderPackageEditorList();
  }

  // Calculate & Update Balance
  function updateFinancials() {
    const total = parseFloat(elTotalAmount.value) || 0;
    const deposit = parseFloat(elDepositAmount.value) || 0;
    const remaining = Math.max(0, total - deposit);

    state.totalAmount = total;
    state.depositAmount = deposit;
    state.remainingAmount = remaining;

    // Update Left panel display
    displayRemainingAmount.textContent = formatMoney(remaining);

    if (total === 0 && deposit === 0) {
      badgePaymentStatus.textContent = 'รอระบุยอดเงิน';
      badgePaymentStatus.className = 'inline-block text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-600';
    } else if (remaining === 0 && total > 0) {
      badgePaymentStatus.textContent = 'PAID IN FULL • ชำระครบถ้วน';
      badgePaymentStatus.className = 'inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-100';
    } else if (deposit > total) {
      badgePaymentStatus.textContent = 'มัดจำเกินยอดรวม';
      badgePaymentStatus.className = 'inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800';
    } else {
      badgePaymentStatus.textContent = 'รอชำระวันงาน';
      badgePaymentStatus.className = 'inline-block text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700';
    }

    // Update Right Card
    cardTotalAmount.textContent = formatMoney(total);
    cardDepositAmount.textContent = (deposit > 0 ? '-' : '') + formatMoney(deposit);
    cardRemainingAmount.textContent = formatMoney(remaining);

    // Update Mobile Indicators
    const mobileBadgeRemaining = document.getElementById('mobileBadgeRemaining');
    if (mobileBadgeRemaining) {
      mobileBadgeRemaining.textContent = formatMoney(remaining);
    }
    const mobileBarRemaining = document.getElementById('mobileBarRemaining');
    if (mobileBarRemaining) {
      mobileBarRemaining.textContent = formatMoney(remaining);
    }
  }

  // Render Package Items in Editor
  function renderPackageEditorList() {
    const pkg = PACKAGE_DETAILS[state.selectedPackage];
    const items = state.customPackageItems || pkg.items;

    packageItemsList.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex items-center gap-2 text-stone-600';
      li.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
        <span class="flex-1">${escapeHtml(item)}</span>
      `;
      packageItemsList.appendChild(li);
    });
  }

  // Update Package Radio Visuals (Minimalist Luxury)
  function updatePackageSelectionUI() {
    const checkIconHtml = '<i data-lucide="check" class="w-2.5 h-2.5 stroke-[2.5]"></i>';

    if (state.selectedPackage === 'express') {
      labelPkgExpress.className = 'group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border border-stone-900 bg-stone-900 text-white shadow-sm';
      const checkEl = labelPkgExpress.querySelector('.pkg-check');
      checkEl.className = 'pkg-check w-4 h-4 rounded-full border border-stone-600 flex items-center justify-center bg-white text-stone-900 text-[10px]';
      checkEl.innerHTML = checkIconHtml;

      labelPkgNormal.className = 'group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-800';
      const normCheckEl = labelPkgNormal.querySelector('.pkg-check');
      normCheckEl.className = 'pkg-check w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center bg-transparent text-transparent text-[10px]';
      normCheckEl.innerHTML = '';
    } else {
      labelPkgNormal.className = 'group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border border-stone-900 bg-stone-900 text-white shadow-sm';
      const normCheckEl = labelPkgNormal.querySelector('.pkg-check');
      normCheckEl.className = 'pkg-check w-4 h-4 rounded-full border border-stone-600 flex items-center justify-center bg-white text-stone-900 text-[10px]';
      normCheckEl.innerHTML = checkIconHtml;

      labelPkgExpress.className = 'group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-800';
      const expCheckEl = labelPkgExpress.querySelector('.pkg-check');
      expCheckEl.className = 'pkg-check w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center bg-transparent text-transparent text-[10px]';
      expCheckEl.innerHTML = '';
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Render the Preview Card
  function renderCard() {
    // Ensure clean Base64 logo source (prevents local file taint on canvas)
    const cardLogoImg = document.getElementById('cardLogoImg');
    if (cardLogoImg) {
      const targetSrc = (state.activeTheme === 'dark') ? (window.LOGO_WHITE_BASE64 || 'logo-white.png') : (window.LOGO_DARK_BASE64 || 'logo-dark.png');
      if (cardLogoImg.getAttribute('data-loaded-src') !== targetSrc) {
        cardLogoImg.src = targetSrc;
        cardLogoImg.setAttribute('data-loaded-src', targetSrc);
      }
    }

    // 1. Customer & Event
    cardCustomerName.textContent = elCustomerName.value.trim() || 'ระบุชื่อลูกค้า / คู่บ่าวสาว';

    // Optional customer phone display
    if (cardCustomerPhone) {
      const cPhone = elCustomerPhone ? elCustomerPhone.value.trim() : '';
      if (cPhone) {
        cardCustomerPhone.textContent = `(${cPhone})`;
        cardCustomerPhone.classList.remove('hidden');
      } else {
        cardCustomerPhone.classList.add('hidden');
      }
    }
    
    if (elEventType.value.trim()) {
      cardEventType.textContent = elEventType.value.trim();
      cardEventType.classList.remove('hidden');
    } else {
      cardEventType.classList.add('hidden');
    }

    cardLocation.textContent = elLocation.value.trim() || 'ระบุสถานที่จัดงาน';

    // Combine Date and Time
    const dateFormatted = formatThaiDate(elEventDate.value);
    const timeFormatted = elTimePeriod.value.trim();
    if (dateFormatted && timeFormatted) {
      cardDateTime.textContent = `${dateFormatted} (${timeFormatted})`;
    } else if (dateFormatted) {
      cardDateTime.textContent = dateFormatted;
    } else if (timeFormatted) {
      cardDateTime.textContent = timeFormatted;
    } else {
      cardDateTime.textContent = 'ระบุวันที่และเวลา';
    }

    cardPhotographerCount.textContent = elPhotographerCount.value.trim() || 'ตามตกลง';

    // 2. Package Details
    const pkg = PACKAGE_DETAILS[state.selectedPackage];
    const items = state.customPackageItems || pkg.items;

    cardDeliveryItems.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2.5 text-stone-700';
      li.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0"></span>
        <span class="leading-relaxed">${escapeHtml(item)}</span>
      `;
      cardDeliveryItems.appendChild(li);
    });

    // 3. Financials
    updateFinancials();

    // Refresh Lucide Icons in dynamically created elements
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Theme Switcher (Clean Minimal Presets)
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => {
        b.classList.remove('active', 'border-stone-900', 'bg-white', 'shadow-sm');
        b.classList.add('border-stone-200', 'bg-stone-50/60');
      });
      btn.classList.add('active', 'border-stone-900', 'bg-white', 'shadow-sm');
      btn.classList.remove('border-stone-200', 'bg-stone-50/60');

      const theme = btn.getAttribute('data-theme');
      state.activeTheme = theme;
      summaryCard.classList.remove('theme-warm', 'theme-dark', 'theme-clean');
      summaryCard.classList.add(`theme-${theme}`);

      // Switch logo variant based on theme (Using clean Base64 data URI to prevent canvas tainting)
      const cardLogoImg = document.getElementById('cardLogoImg');
      if (cardLogoImg) {
        cardLogoImg.src = (theme === 'dark') ? (window.LOGO_WHITE_BASE64 || 'logo-white.png') : (window.LOGO_DARK_BASE64 || 'logo-dark.png');
      }
    });
  });

  // Package Switcher Change
  elRadioPackages.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.selectedPackage = e.target.value;
      state.customPackageItems = null; // reset to template default
      updatePackageSelectionUI();
      renderPackageEditorList();
      renderCard();
    });
  });

  // Reset Package Text button
  btnResetPackageText.addEventListener('click', () => {
    state.customPackageItems = null;
    renderPackageEditorList();
    renderCard();
    showToast('รีเซ็ตเงื่อนไขการส่งงานเป็นค่าเริ่มต้นแล้ว');
  });

  // Live Input Sync Function
  function syncStateFromInputs() {
    state.customerName = elCustomerName ? elCustomerName.value.trim() : '';
    state.customerPhone = elCustomerPhone ? elCustomerPhone.value.trim() : '';
    state.customerFacebook = elCustomerFacebook ? elCustomerFacebook.value.trim() : '';
    state.eventType = elEventType ? elEventType.value.trim() : '';
    state.location = elLocation ? elLocation.value.trim() : '';
    state.timePeriod = elTimePeriod ? elTimePeriod.value.trim() : '';
    state.photographerCount = elPhotographerCount ? elPhotographerCount.value.trim() : '';
    state.eventDate = elEventDate ? elEventDate.value : '';
    state.totalAmount = elTotalAmount ? (parseFloat(elTotalAmount.value) || 0) : 0;
    state.depositAmount = elDepositAmount ? (parseFloat(elDepositAmount.value) || 0) : 0;
    state.remainingAmount = Math.max(0, state.totalAmount - state.depositAmount);
  }

  // Live Input Listeners for all fields
  const inputsToListen = [
    elCustomerName, elCustomerPhone, elEventType, 
    elLocation, elTimePeriod, elPhotographerCount, elEventDate, 
    elTotalAmount, elDepositAmount
  ];

  inputsToListen.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        syncStateFromInputs();
        renderCard();
      });
    }
  });

  // Facebook link listener
  if (elCustomerFacebook) {
    elCustomerFacebook.addEventListener('input', () => {
      state.customerFacebook = elCustomerFacebook.value.trim();
      updateFacebookLinkUI();
    });
  }

  // Google Calendar Integration
  function openGoogleCalendar() {
    const customer = elCustomerName.value.trim() || 'ลูกค้า';
    const customerPhone = elCustomerPhone ? elCustomerPhone.value.trim() : '';
    const eventType = elEventType.value.trim() || 'งานถ่ายภาพ';
    const location = elLocation.value.trim() || '';
    const dateVal = elEventDate.value; // e.g. "2026-11-30"
    const timeVal = elTimePeriod.value.trim(); // e.g. "06:30 - 12:00 น."
    const photographers = elPhotographerCount.value.trim() || '1 ท่าน';
    const fbLink = elCustomerFacebook ? elCustomerFacebook.value.trim() : '';
    const pkg = PACKAGE_DETAILS[state.selectedPackage];
    const items = state.customPackageItems || pkg.items;

    if (!dateVal) {
      alert('กรุณาระบุ "วันที่จัดงาน" ในฟอร์มก่อนกดบันทึกลง Google Calendar ครับ');
      elEventDate.focus();
      return;
    }

    // Parse time ranges (e.g. "06:30 - 12:00 น.")
    const timeMatches = [...timeVal.matchAll(/(\d{1,2})[:.](\d{2})/g)];
    let startDateTimeStr = '';
    let endDateTimeStr = '';
    const pad = (n) => String(n).padStart(2, '0');

    if (timeMatches.length >= 2) {
      const sh = parseInt(timeMatches[0][1], 10);
      const sm = parseInt(timeMatches[0][2], 10);
      const eh = parseInt(timeMatches[1][1], 10);
      const em = parseInt(timeMatches[1][2], 10);

      const [y, m, d] = dateVal.split('-').map(Number);
      const startDate = new Date(y, m - 1, d, sh, sm, 0);
      const endDate = new Date(y, m - 1, d, eh, em, 0);

      const toUTC = (dt) => {
        return dt.getUTCFullYear() +
          pad(dt.getUTCMonth() + 1) +
          pad(dt.getUTCDate()) + 'T' +
          pad(dt.getUTCHours()) +
          pad(dt.getUTCMinutes()) +
          pad(dt.getUTCSeconds()) + 'Z';
      };

      startDateTimeStr = toUTC(startDate);
      endDateTimeStr = toUTC(endDate);
    } else if (timeMatches.length === 1) {
      const sh = parseInt(timeMatches[0][1], 10);
      const sm = parseInt(timeMatches[0][2], 10);
      const [y, m, d] = dateVal.split('-').map(Number);
      const startDate = new Date(y, m - 1, d, sh, sm, 0);
      const endDate = new Date(y, m - 1, d, sh + 4, sm, 0); // default 4 hrs

      const toUTC = (dt) => {
        return dt.getUTCFullYear() +
          pad(dt.getUTCMonth() + 1) +
          pad(dt.getUTCDate()) + 'T' +
          pad(dt.getUTCHours()) +
          pad(dt.getUTCMinutes()) +
          pad(dt.getUTCSeconds()) + 'Z';
      };

      startDateTimeStr = toUTC(startDate);
      endDateTimeStr = toUTC(endDate);
    } else {
      // Whole day event
      const [y, m, d] = dateVal.split('-').map(Number);
      const nextDay = new Date(y, m - 1, d + 1);
      startDateTimeStr = `${y}${pad(m)}${pad(d)}`;
      endDateTimeStr = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
    }

    const title = `📸 [Sook Jai Pix] ${customer} — ${eventType}`;

    const descLines = [
      `📸 Sook Jai Pix — รายละเอียดนัดหมายงานถ่ายภาพ`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 ลูกค้า: ${customer}`,
      `🎉 ประเภทงาน: ${eventType}`
    ];

    if (customerPhone) {
      descLines.push(`📞 เบอร์ลูกค้า: ${customerPhone}`);
    }

    if (fbLink) {
      descLines.push(`🔗 Facebook ลูกค้า: ${fbLink}`);
    }

    descLines.push(
      `📍 สถานที่: ${location || 'ตามนัดหมาย'}`,
      `⏰ กำหนดการ: ${timeVal || 'ตามกำหนดการ'}`,
      `👥 ทีมช่างภาพ: ${photographers}`,
      ``,
      `📦 รายละเอียดการส่งงาน (${pkg.name}):`,
      ...items.map(item => `  • ${item}`),
      ``,
      `💰 ข้อมูลค่าบริการ:`,
      `  • ยอดรวมสุทธิ: ${formatMoney(state.totalAmount)}`,
      `  • ยอดมัดจำ: ${formatMoney(state.depositAmount)}`,
      `  • ยอดคงเหลือ: ${formatMoney(state.remainingAmount)}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `บันทึกโดยระบบ Sook Jai Pix App`
    );

    const description = descLines.join('\n');

    const gCalUrl = new URL('https://calendar.google.com/calendar/render');
    gCalUrl.searchParams.set('action', 'TEMPLATE');
    gCalUrl.searchParams.set('text', title);
    gCalUrl.searchParams.set('dates', `${startDateTimeStr}/${endDateTimeStr}`);
    gCalUrl.searchParams.set('details', description);
    if (location) {
      gCalUrl.searchParams.set('location', location);
    }

    window.open(gCalUrl.toString(), '_blank');
    showToast('กำลังเปิด Google Calendar เพื่อบันทึกนัดหมาย...');
  }

  // Quick Sample Button
  btnQuickSample.addEventListener('click', () => {
    elCustomerName.value = 'คุณพิมลดา & คุณกิตติศักดิ์';
    if (elCustomerPhone) elCustomerPhone.value = '081-987-6543';
    elEventType.value = 'งานฉลองมงคลสมรส (Evening Reception)';
    elLocation.value = 'ห้องฉัตรา บอลรูม โรงแรมสยามเคมปินสกี้ กรุงเทพฯ';
    elTimePeriod.value = '17:30 - 22:30 น.';
    elPhotographerCount.value = 'ช่างภาพหลัก 2 ท่าน + ช่างภาพแคนดิด 1 ท่าน';
    
    // Set date to 2 weeks from now
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    elEventDate.value = nextDate.toISOString().split('T')[0];

    if (elCustomerFacebook) {
      elCustomerFacebook.value = 'https://www.facebook.com/pimlada.k';
      updateFacebookLinkUI();
    }
    
    elTotalAmount.value = 22000;
    elDepositAmount.value = 7000;
    
    // switch to normal package
    state.selectedPackage = 'normal';
    elRadioPackages.forEach(r => r.checked = (r.value === 'normal'));
    updatePackageSelectionUI();
    renderPackageEditorList();
    syncStateFromInputs();
    renderCard();

    showToast('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
  });

  // Clear Form Button
  btnClearForm.addEventListener('click', () => {
    if (!confirm('ต้องการล้างข้อมูลทั้งหมดในฟอร์มเพื่อกรอกใหม่หรือไม่?')) return;
    state.currentBookingId = null;
    state.currentDocNo = null;
    if (bannerEditingBooking) bannerEditingBooking.classList.add('hidden');
    if (btnSaveToSheetsText) btnSaveToSheetsText.textContent = 'บันทึกข้อมูลการจอง';

    elCustomerName.value = '';
    if (elCustomerPhone) elCustomerPhone.value = '';
    elEventType.value = '';
    elLocation.value = '';
    elTimePeriod.value = '';
    elPhotographerCount.value = '';
    elEventDate.value = '';
    if (elCustomerFacebook) {
      elCustomerFacebook.value = '';
      updateFacebookLinkUI();
    }
    elTotalAmount.value = '';
    elDepositAmount.value = '';

    syncStateFromInputs();

    const newDocNo = generateDocNo();
    cardDocNo.textContent = `NO: ${newDocNo}`;

    renderCard();
    showToast('ล้างข้อมูลเรียบร้อย ฟอร์มว่างพร้อมกรอกใหม่');
  });

  // Helper to convert Data URL to Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  // Direct file download to computer / device Downloads folder
  function triggerDirectDownload(blob, dataUrl, filename) {
    // 1. IE / Edge legacy
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    // 2. Standard HTML5 <a> download using Blob URL
    let downloaded = false;
    try {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      downloaded = true;
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.warn('Blob URL download failed, trying dataURL fallback:', err);
    }

    // 3. Fallback to Data URL download if blob URL failed
    if (!downloaded && dataUrl) {
      try {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) document.body.removeChild(a);
        }, 5000);
      } catch (err2) {
        console.error('DataURL download failed:', err2);
      }
    }
  }

  // Mobile Image Preview Modal (Enables Tap & Hold to save to Photos on iPhone)
  function showImagePreviewModal(dataUrl, filename, blob) {
    let modal = document.getElementById('imagePreviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'imagePreviewModal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3 my-auto text-stone-800">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
              </span>
              <h3 class="text-sm font-semibold text-stone-900">สร้างรูปภาพเรียบร้อย</h3>
            </div>
            <button id="btnCloseImageModal" type="button" class="text-stone-400 hover:text-stone-700 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          
          <div class="text-[11px] text-stone-600 bg-amber-50 rounded-xl p-2.5 flex items-start gap-2 border border-amber-200/60">
            <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
            <span>สำหรับ iPhone: ระบบได้สั่งดาวน์โหลดไฟล์ลงเครื่องแล้ว หากต้องการเก็บเข้าอัลบั้มรูป ให้<strong>แตะค้างที่รูปภาพ</strong> แล้วเลือก <strong>"บันทึกไปยังรูปภาพ" (Save to Photos)</strong> หรือกดปุ่มแชร์ด้านล่างได้เลยครับ</span>
          </div>

          <div class="max-h-[50vh] overflow-y-auto rounded-xl border border-stone-200/80 shadow-inner flex justify-center bg-stone-100/50 p-2">
            <img id="modalPreviewImg" src="" alt="Preview" class="w-full h-auto object-contain rounded-lg shadow-sm">
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button id="btnModalShareDirect" type="button" class="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
              <i data-lucide="share" class="w-3.5 h-3.5"></i>
              <span>แชร์ / เซฟลง Photos</span>
            </button>
            <button id="btnModalCloseAction" type="button" class="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl">
              ปิด
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => {
        modal.classList.add('hidden');
      };
      modal.querySelector('#btnCloseImageModal').addEventListener('click', closeModal);
      modal.querySelector('#btnModalCloseAction').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    const previewImg = modal.querySelector('#modalPreviewImg');
    const shareBtn = modal.querySelector('#btnModalShareDirect');
    previewImg.src = dataUrl;

    if (shareBtn) {
      shareBtn.onclick = async () => {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: filename,
            });
          } catch (e) {
            if (e.name !== 'AbortError') console.warn(e);
          }
        } else {
          triggerDirectDownload(blob, dataUrl, filename);
          showToast('สั่งดาวน์โหลดลงเครื่องอีกครั้งแล้ว');
        }
      };
    }

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  // JPEG Export Logic using html2canvas
  async function generateJpegBlob() {
    if (!window.html2canvas) {
      alert('ระบบบันทึกภาพกำลังโหลด กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
      return null;
    }

    // 1. If currently in mobile editor tab, switch to preview tab so card is visible & in DOM flow
    if (typeof switchMobileTab === 'function' && window.innerWidth < 1024) {
      switchMobileTab('preview');
      await new Promise(r => setTimeout(r, 100));
    }

    // 2. Ensure all web fonts are loaded
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font ready timeout:', e);
      }
    }

    // 3. Ensure logo image is Base64 (to prevent canvas tainting on file:// protocol)
    const cardLogoImg = document.getElementById('cardLogoImg');
    if (cardLogoImg) {
      const targetSrc = (state.activeTheme === 'dark') ? (window.LOGO_WHITE_BASE64 || 'logo-white.png') : (window.LOGO_DARK_BASE64 || 'logo-dark.png');
      if (cardLogoImg.src !== targetSrc) {
        cardLogoImg.src = targetSrc;
      }
      if (!cardLogoImg.complete) {
        await new Promise(r => {
          cardLogoImg.onload = r;
          cardLogoImg.onerror = r;
          setTimeout(r, 600);
        });
      }
    }

    // 4. Determine background color based on theme
    let bg = '#ffffff';
    if (state.activeTheme === 'warm') bg = '#f7f5f0';
    if (state.activeTheme === 'dark') bg = '#121316';

    // 5. Detect mobile for safe canvas scaling (avoids iOS WebKit canvas memory crash)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const exportScale = isMobile ? 2.5 : 3;

    try {
      const canvas = await html2canvas(summaryCard, {
        scale: exportScale,
        useCORS: true,
        allowTaint: false, // Clean canvas guaranteed with Base64 logo!
        backgroundColor: bg,
        logging: false,
        imageTimeout: 6000,
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // 6. Convert canvas to Blob (with toDataURL fallback)
      let blob = null;
      if (canvas.toBlob) {
        blob = await new Promise(resolve => {
          try {
            canvas.toBlob(b => resolve(b), 'image/jpeg', 0.95);
          } catch (e) {
            resolve(null);
          }
        });
      }

      if (!blob) {
        blob = dataURItoBlob(dataUrl);
      }

      return { blob, canvas, dataUrl };
    } catch (err) {
      console.error('html2canvas render error:', err);
      throw err;
    }
  }

  // Save as JPEG File
  async function saveAsJpeg() {
    const btn = btnSaveJpeg;
    const topBtn = btnTopSaveJpeg;
    const mobileBtn = document.getElementById('btnMobileSaveJpeg');
    const originalText = btn ? btn.innerHTML : '';
    const originalTopText = topBtn ? topBtn.innerHTML : '';
    const originalMobileText = mobileBtn ? mobileBtn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังประมวลผล...</span>`;
    }
    if (topBtn) {
      topBtn.disabled = true;
      topBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังบันทึก...</span>`;
    }
    if (mobileBtn) {
      mobileBtn.disabled = true;
      mobileBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังบันทึก...</span>`;
    }
    if (window.lucide) lucide.createIcons();

    try {
      const result = await generateJpegBlob();
      if (!result || !result.blob) {
        throw new Error('ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      }

      const { blob, canvas, dataUrl } = result;
      const customer = elCustomerName.value.trim().replace(/[/\\?%*:|"<>]/g, '') || 'ลูกค้า';
      const filename = `SookJaiPix_สรุปยอดคงเหลือ_${customer}.jpeg`;

      // 1. ALWAYS trigger direct download into machine's Downloads folder!
      triggerDirectDownload(blob, dataUrl, filename);

      // 2. For Mobile (iPhone/Android), show preview modal so user can also "Tap & Hold -> Save to Photos" directly
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      if (isMobile) {
        showImagePreviewModal(dataUrl, filename, blob);
      } else {
        showToast(`บันทึกไฟล์ภาพลงเครื่องเรียบร้อย: ${filename}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกภาพ: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      if (topBtn) {
        topBtn.disabled = false;
        topBtn.innerHTML = originalTopText;
      }
      if (mobileBtn) {
        mobileBtn.disabled = false;
        mobileBtn.innerHTML = originalMobileText;
      }
      if (window.lucide) lucide.createIcons();
    }
  }

  // Copy Image to Clipboard
  async function copyImageToClipboard() {
    if (!navigator.clipboard || !window.ClipboardItem) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับการคัดลอกรูปภาพลงคลิปบอร์ดโดยตรง กรุณากดปุ่ม "บันทึกภาพ JPEG" แทนครับ');
      return;
    }

    const originalText = btnCopyImage.innerHTML;
    btnCopyImage.disabled = true;
    btnCopyImage.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-stone-500"></i><span>กำลังคัดลอก...</span>`;
    if (window.lucide) lucide.createIcons();

    try {
      const result = await generateJpegBlob();
      if (!result) return;

      const { canvas } = result;
      // Convert to PNG blob for maximum clipboard compatibility
      const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (pngBlob) {
        const item = new ClipboardItem({ 'image/png': pngBlob });
        await navigator.clipboard.write([item]);
        showToast('คัดลอกรูปภาพแล้ว! สามารถกดวาง (Cmd+V / Ctrl+V) ใน LINE หรือแชทได้ทันที');
      } else {
        throw new Error('Canvas export failed');
      }
    } catch (err) {
      console.warn('Clipboard copy error:', err);
      showToast('ไม่สามารถคัดลอกลงคลิปบอร์ดได้ กรุณากดปุ่ม "บันทึกภาพ JPEG"');
    } finally {
      btnCopyImage.disabled = false;
      btnCopyImage.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    }
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toastMessage.classList.remove('hidden');
    toastMessage.classList.add('flex');

    toastTimer = setTimeout(() => {
      toastMessage.classList.add('hidden');
      toastMessage.classList.remove('flex');
    }, 3500);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event Listeners for Export & Calendar
  btnSaveJpeg.addEventListener('click', saveAsJpeg);
  btnTopSaveJpeg.addEventListener('click', saveAsJpeg);
  btnCopyImage.addEventListener('click', copyImageToClipboard);

  if (btnGoogleCalendar) {
    btnGoogleCalendar.addEventListener('click', openGoogleCalendar);
  }
  if (btnQuickAddToCalendar) {
    btnQuickAddToCalendar.addEventListener('click', openGoogleCalendar);
  }

  // ===================================================================
  // Google Sheets & Booking History Synchronization
  // ===================================================================
  function getSheetsAPI() {
    if (typeof window !== 'undefined' && window.SookJaiSheetsAPI) return window.SookJaiSheetsAPI;
    if (typeof SookJaiSheetsAPI !== 'undefined') return SookJaiSheetsAPI;
    if (typeof globalThis !== 'undefined' && globalThis.SookJaiSheetsAPI) return globalThis.SookJaiSheetsAPI;
    if (typeof self !== 'undefined' && self.SookJaiSheetsAPI) return self.SookJaiSheetsAPI;
    return null;
  }

  function updateHeaderBookingCount() {
    const api = getSheetsAPI();
    if (!headerBookingCount || !api) return;
    try {
      const list = api.getLocalBookings();
      headerBookingCount.textContent = list.length;
    } catch (e) {
      console.warn(e);
    }
  }

  async function saveToGoogleSheets() {
    const api = getSheetsAPI();
    if (!api) {
      showToast('ระบบฐานข้อมูลกำลังเริ่มต้น กรุณาลองกดบันทึกใหม่อีกครั้ง');
      return;
    }

    syncStateFromInputs();

    const docNo = state.currentDocNo || (cardDocNo.textContent.replace('NO: ', '').trim() || generateDocNo());
    const isExisting = !!state.currentBookingId;

    const bookingData = {
      id: state.currentBookingId || ('sjp_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      docNo: docNo,
      dateGenerated: new Date().toISOString().substring(0, 10),
      customerName: state.customerName || 'ไม่ระบุชื่อลูกค้า',
      customerPhone: state.customerPhone || '',
      customerFacebook: state.customerFacebook || '',
      eventType: state.eventType || '',
      location: state.location || '',
      eventDate: state.eventDate || '',
      timePeriod: state.timePeriod || '',
      photographerCount: state.photographerCount || '',
      selectedPackage: state.selectedPackage || 'normal',
      packageItems: PACKAGE_DETAILS[state.selectedPackage].items,
      totalAmount: Number(state.totalAmount) || 0,
      depositAmount: Number(state.depositAmount) || 0,
      remainingAmount: Number(state.remainingAmount) || 0,
      status: (state.remainingAmount === 0 && state.totalAmount > 0) ? 'ชำระครบถ้วน' : 'รอชำระวันงาน'
    };

    // If Google Sheets is NOT configured yet:
    // Save to local cache first so user's work is never lost, then open setup modal
    if (!api.isConfigured()) {
      if (isExisting) {
        await api.updateBooking(bookingData);
      } else {
        await api.createBooking(bookingData);
      }

      state.currentBookingId = bookingData.id;
      state.currentDocNo = bookingData.docNo;

      if (bannerEditingBooking && bannerEditingDocNo) {
        bannerEditingDocNo.textContent = bookingData.docNo;
        bannerEditingBooking.classList.remove('hidden');
      }

      updateHeaderBookingCount();
      openGasSettingsModal();
      showToast('บันทึกข้อมูลในเครื่องแล้ว กรุณาระบุ Google Sheets URL เพื่อซิงค์ทันที');
      return;
    }

    // Google Sheets IS configured: show active spinner and sync all bookings immediately
    if (btnSaveToSheetsText) {
      btnSaveToSheetsText.innerHTML = '<span class="inline-flex items-center gap-1.5"><i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังซิงค์...</span></span>';
      if (window.lucide) lucide.createIcons();
    }
    if (btnSaveToSheets) btnSaveToSheets.disabled = true;
    if (btnMobileSaveSheets) btnMobileSaveSheets.disabled = true;

    try {
      let res;
      if (isExisting) {
        res = await api.updateBooking(bookingData);
      } else {
        res = await api.createBooking(bookingData);
      }

      state.currentBookingId = bookingData.id;
      state.currentDocNo = bookingData.docNo;

      if (bannerEditingBooking && bannerEditingDocNo) {
        bannerEditingDocNo.textContent = bookingData.docNo;
        bannerEditingBooking.classList.remove('hidden');
      }

      updateHeaderBookingCount();

      if (res.syncedToSheets) {
        showToast(`บันทึกและซิงค์ข้อมูลการจองทั้งหมด (${res.totalCount || 1} รายการ) ลง Google Sheet เรียบร้อยแล้ว`);
      } else if (res.warning) {
        showToast(res.warning);
      } else {
        showToast(`บันทึกข้อมูลการจอง ${bookingData.docNo} ในระบบเรียบร้อยแล้ว`);
      }
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      if (btnSaveToSheetsText) {
        btnSaveToSheetsText.textContent = state.currentBookingId ? 'อัปเดตข้อมูลการจอง' : 'บันทึกข้อมูลการจอง';
      }
      if (btnSaveToSheets) btnSaveToSheets.disabled = false;
      if (btnMobileSaveSheets) btnMobileSaveSheets.disabled = false;
    }
  }

  function checkForLoadedBooking() {
    const api = getSheetsAPI();
    if (!api) return;
    const loaded = api.getActiveBookingForEdit();
    if (loaded) {
      state.currentBookingId = loaded.id;
      state.currentDocNo = loaded.docNo;
      state.customerName = loaded.customerName || '';
      state.customerPhone = loaded.customerPhone || '';
      state.customerFacebook = loaded.customerFacebook || '';
      state.eventType = loaded.eventType || '';
      state.location = loaded.location || '';
      state.timePeriod = loaded.timePeriod || '';
      state.photographerCount = loaded.photographerCount || '';
      state.eventDate = loaded.eventDate || '';
      state.selectedPackage = loaded.selectedPackage || 'normal';
      state.totalAmount = Number(loaded.totalAmount) || 0;
      state.depositAmount = Number(loaded.depositAmount) || 0;
      state.remainingAmount = Number(loaded.remainingAmount !== undefined ? loaded.remainingAmount : Math.max(0, state.totalAmount - state.depositAmount));

      if (cardDocNo && loaded.docNo) {
        cardDocNo.textContent = `NO: ${loaded.docNo}`;
      }

      if (bannerEditingBooking && bannerEditingDocNo) {
        bannerEditingDocNo.textContent = loaded.docNo || 'SJP-LOADED';
        bannerEditingBooking.classList.remove('hidden');
      }

      if (btnSaveToSheetsText) {
        btnSaveToSheetsText.textContent = 'อัปเดตข้อมูลการจอง';
      }

      showToast(`โหลดข้อมูลการจอง ${loaded.docNo} เรียบร้อยแล้ว`);
    }
  }

  if (btnCancelEditingBooking) {
    btnCancelEditingBooking.addEventListener('click', () => {
      state.currentBookingId = null;
      state.currentDocNo = null;
      if (bannerEditingBooking) bannerEditingBooking.classList.add('hidden');
      const newDocNo = generateDocNo();
      cardDocNo.textContent = `NO: ${newDocNo}`;
      if (btnSaveToSheetsText) btnSaveToSheetsText.textContent = 'บันทึกข้อมูลการจอง';
      showToast('ยกเลิกการแก้ไขแล้ว สร้างเป็นรายการใหม่');
    });
  }

  if (btnSaveToSheets) {
    btnSaveToSheets.addEventListener('click', saveToGoogleSheets);
  }
  if (btnMobileSaveSheets) {
    btnMobileSaveSheets.addEventListener('click', saveToGoogleSheets);
  }

  // Mobile Segmented Navigation & Floating Action Bars
  let activeMobileTab = 'editor';
  const sectionEditor = document.getElementById('sectionEditor');
  const sectionPreview = document.getElementById('sectionPreview');
  const mobileTabEditor = document.getElementById('mobileTabEditor');
  const mobileTabPreview = document.getElementById('mobileTabPreview');
  const mobileEditorBar = document.getElementById('mobileEditorBar');
  const mobilePreviewBar = document.getElementById('mobilePreviewBar');
  const btnMobileGoPreview = document.getElementById('btnMobileGoPreview');
  const btnMobileBackEdit = document.getElementById('btnMobileBackEdit');
  const btnMobileSaveJpeg = document.getElementById('btnMobileSaveJpeg');
  const btnMobileCalendar = document.getElementById('btnMobileCalendar');

  function switchMobileTab(tab) {
    activeMobileTab = tab;
    if (window.innerWidth >= 1024) {
      if (sectionEditor) {
        sectionEditor.classList.remove('hidden');
        sectionEditor.classList.add('block');
      }
      if (sectionPreview) {
        sectionPreview.classList.remove('hidden');
        sectionPreview.classList.add('block');
      }
      return;
    }

    if (tab === 'editor') {
      if (sectionEditor) {
        sectionEditor.classList.remove('hidden');
        sectionEditor.classList.add('block');
      }
      if (sectionPreview) {
        sectionPreview.classList.add('hidden');
        sectionPreview.classList.remove('block');
      }

      if (mobileTabEditor) {
        mobileTabEditor.className = 'flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 bg-white text-stone-900 shadow-xs';
      }
      if (mobileTabPreview) {
        mobileTabPreview.className = 'flex-1 py-2.5 px-3 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900';
      }

      if (mobileEditorBar) mobileEditorBar.classList.remove('hidden');
      if (mobilePreviewBar) mobilePreviewBar.classList.add('hidden');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // preview tab
      if (sectionEditor) {
        sectionEditor.classList.add('hidden');
        sectionEditor.classList.remove('block');
      }
      if (sectionPreview) {
        sectionPreview.classList.remove('hidden');
        sectionPreview.classList.add('block');
      }

      if (mobileTabEditor) {
        mobileTabEditor.className = 'flex-1 py-2.5 px-3 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900';
      }
      if (mobileTabPreview) {
        mobileTabPreview.className = 'flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 bg-white text-stone-900 shadow-xs';
      }

      if (mobileEditorBar) mobileEditorBar.classList.add('hidden');
      if (mobilePreviewBar) mobilePreviewBar.classList.remove('hidden');

      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.lucide) lucide.createIcons();
    }
  }

  // Handle Resize between Mobile and Desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      if (sectionEditor) {
        sectionEditor.classList.remove('hidden');
        sectionEditor.classList.add('block');
      }
      if (sectionPreview) {
        sectionPreview.classList.remove('hidden');
        sectionPreview.classList.add('block');
      }
    } else {
      switchMobileTab(activeMobileTab);
    }
  });

  // Mobile Tab Listeners
  if (mobileTabEditor) {
    mobileTabEditor.addEventListener('click', () => switchMobileTab('editor'));
  }
  if (mobileTabPreview) {
    mobileTabPreview.addEventListener('click', () => switchMobileTab('preview'));
  }
  if (btnMobileGoPreview) {
    btnMobileGoPreview.addEventListener('click', () => switchMobileTab('preview'));
  }
  if (btnMobileBackEdit) {
    btnMobileBackEdit.addEventListener('click', () => switchMobileTab('editor'));
  }
  if (btnMobileSaveJpeg) {
    btnMobileSaveJpeg.addEventListener('click', saveAsJpeg);
  }
  if (btnMobileCalendar) {
    btnMobileCalendar.addEventListener('click', openGoogleCalendar);
  }

  // ===================================================================
  // Google Sheets Setup Modal Controller (index.html)
  // ===================================================================
  const modalGasSettings = document.getElementById('modalGasSettings');
  const btnOpenGasSettings = document.getElementById('btnOpenGasSettings');
  const btnCloseGasSettings = document.getElementById('btnCloseGasSettings');
  const gasUrlInput = document.getElementById('gasUrlInput');
  const gasUrlLiveWarning = document.getElementById('gasUrlLiveWarning');
  const gasUrlLiveWarningText = document.getElementById('gasUrlLiveWarningText');
  const gasTestResultBox = document.getElementById('gasTestResultBox');
  const btnToggleGasCodeView = document.getElementById('btnToggleGasCodeView');
  const btnToggleGasCodeViewText = document.getElementById('btnToggleGasCodeViewText');
  const btnCopyGasCode = document.getElementById('btnCopyGasCode');
  const btnCopyGasCodeText = document.getElementById('btnCopyGasCodeText');
  const gasCodeFullContainer = document.getElementById('gasCodeFullContainer');
  const gasCodeTextarea = document.getElementById('gasCodeTextarea');
  const btnSelectAllCode = document.getElementById('btnSelectAllCode');
  const btnClearGasUrl = document.getElementById('btnClearGasUrl');
  const btnOpenInNewTab = document.getElementById('btnOpenInNewTab');
  const btnTestGasConnection = document.getElementById('btnTestGasConnection');
  const btnTestGasText = document.getElementById('btnTestGasText');
  const btnSaveGasUrl = document.getElementById('btnSaveGasUrl');

  function openGasSettingsModal() {
    if (!modalGasSettings) return;
    const api = getSheetsAPI();
    if (gasUrlInput && api) {
      gasUrlInput.value = api.getGasUrl();
    }
    if (gasTestResultBox) {
      gasTestResultBox.classList.add('hidden');
      gasTestResultBox.innerHTML = '';
    }
    if (gasUrlLiveWarning) {
      gasUrlLiveWarning.classList.add('hidden');
    }
    modalGasSettings.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  if (btnOpenGasSettings) {
    btnOpenGasSettings.addEventListener('click', openGasSettingsModal);
  }

  if (btnCloseGasSettings) {
    btnCloseGasSettings.addEventListener('click', () => {
      modalGasSettings.classList.add('hidden');
    });
  }

  if (gasUrlInput) {
    gasUrlInput.addEventListener('input', () => {
      const val = gasUrlInput.value.trim();
      if (!val) {
        gasUrlLiveWarning.classList.add('hidden');
        return;
      }
      const api = getSheetsAPI();
      const check = api ? api.validateGasUrl(val) : { valid: true, url: val };
      if (!check.valid) {
        gasUrlLiveWarningText.textContent = check.error;
        gasUrlLiveWarning.classList.remove('hidden');
      } else {
        gasUrlLiveWarning.classList.add('hidden');
      }
    });
  }

  if (btnToggleGasCodeView && gasCodeFullContainer) {
    btnToggleGasCodeView.addEventListener('click', () => {
      const isHidden = gasCodeFullContainer.classList.contains('hidden');
      if (isHidden) {
        gasCodeFullContainer.classList.remove('hidden');
        if (gasCodeTextarea && window.SOOKJAI_GAS_CODE) {
          gasCodeTextarea.value = window.SOOKJAI_GAS_CODE;
        }
        btnToggleGasCodeViewText.textContent = 'ซ่อนโค้ด';
      } else {
        gasCodeFullContainer.classList.add('hidden');
        btnToggleGasCodeViewText.textContent = 'ดูโค้ด';
      }
    });
  }

  if (btnSelectAllCode && gasCodeTextarea) {
    btnSelectAllCode.addEventListener('click', () => {
      gasCodeTextarea.focus();
      gasCodeTextarea.select();
      try {
        navigator.clipboard.writeText(gasCodeTextarea.value);
        showToast('คัดลอกโค้ดทั้งหมดแล้ว');
      } catch (e) {}
    });
  }

  if (btnCopyGasCode) {
    btnCopyGasCode.addEventListener('click', async () => {
      const codeText = window.SOOKJAI_GAS_CODE || '';
      if (!codeText) {
        alert('ไม่พบโค้ดสคริปต์ กรุณาเปิดไฟล์ Code.gs ในโฟลเดอร์โปรเจกต์');
        return;
      }
      try {
        await navigator.clipboard.writeText(codeText);
        btnCopyGasCodeText.textContent = 'คัดลอกแล้ว!';
        showToast('คัดลอกโค้ดสคริปต์เรียบร้อยแล้ว');
        setTimeout(() => {
          btnCopyGasCodeText.textContent = 'คัดลอกโค้ดสคริปต์';
        }, 2500);
      } catch (err) {
        if (gasCodeTextarea) {
          gasCodeTextarea.value = codeText;
          if (gasCodeFullContainer) gasCodeFullContainer.classList.remove('hidden');
          gasCodeTextarea.focus();
          gasCodeTextarea.select();
          showToast('กรุณากด Ctrl+C หรือ Cmd+C เพื่อคัดลอกโค้ด');
        }
      }
    });
  }

  if (btnOpenInNewTab) {
    btnOpenInNewTab.addEventListener('click', () => {
      const raw = gasUrlInput.value.trim();
      if (!raw) {
        alert('กรุณากรอก Web App URL ก่อนกดเปิดทดสอบ');
        gasUrlInput.focus();
        return;
      }
      const api = getSheetsAPI();
      const val = api ? api.validateGasUrl(raw) : { valid: true, url: raw };
      const url = val.valid ? val.url : raw;
      const testUrl = url + (url.includes('?') ? '&' : '?') + 'action=ping&_t=' + Date.now();
      window.open(testUrl, '_blank');
    });
  }

  if (btnTestGasConnection) {
    btnTestGasConnection.addEventListener('click', async () => {
      const url = gasUrlInput.value.trim();
      if (!url) {
        alert('กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ');
        gasUrlInput.focus();
        return;
      }

      btnTestGasConnection.disabled = true;
      btnTestGasText.textContent = 'กำลังทดสอบ...';
      gasTestResultBox.classList.remove('hidden');
      gasTestResultBox.className = 'p-3.5 rounded-xl text-xs font-light bg-stone-100 text-stone-700 flex items-center gap-2';
      gasTestResultBox.innerHTML = '<span class="inline-block animate-spin text-stone-600"><i data-lucide="loader-2" class="w-4 h-4"></i></span> กำลังทดสอบส่งสัญญาณ ping และตรวจสอบการเข้าถึง Google Sheets...';
      if (window.lucide) lucide.createIcons();

      try {
        const api = getSheetsAPI();
        if (!api) throw new Error('ไม่พบโมดูลฐานข้อมูล กรุณารอสักครู่');
        const result = await api.testConnection(url);
        if (result.success) {
          if (result.targetUrl && result.targetUrl !== url) {
            gasUrlInput.value = result.targetUrl;
          }

          gasTestResultBox.className = 'p-4 rounded-2xl text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-1.5';
          let html = `
            <div class="flex items-center gap-2 font-semibold text-emerald-800 text-sm">
              <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
              <span>${result.message}</span>
            </div>
            <div class="pl-7 space-y-0.5 text-stone-600 font-light">
              ${result.spreadsheetName ? `<div>• ชื่อไฟล์: <strong class="text-stone-900">${result.spreadsheetName}</strong></div>` : ''}
              ${result.sheetName ? `<div>• ชื่อชีต: <strong class="text-stone-900">${result.sheetName}</strong></div>` : ''}
              <div>• ข้อมูลปัจจุบัน: <strong class="text-stone-900 font-mono">${result.totalRows || 0}</strong> แถว</div>
              ${result.warning ? `<div class="text-amber-700 pt-1">• ⚠️ ${result.warning}</div>` : ''}
            </div>
          `;
          gasTestResultBox.innerHTML = html;
        } else {
          gasTestResultBox.className = 'p-4 rounded-2xl text-xs bg-rose-50 text-rose-900 border border-rose-200 space-y-2';
          gasTestResultBox.innerHTML = `
            <div class="flex items-start gap-2 font-semibold text-rose-800">
              <i data-lucide="alert-circle" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"></i>
              <span class="whitespace-pre-line leading-relaxed">${result.error}</span>
            </div>
          `;
        }
      } catch (err) {
        gasTestResultBox.className = 'p-4 rounded-2xl text-xs bg-rose-50 text-rose-900 border border-rose-200';
        gasTestResultBox.innerHTML = `
          <div class="flex items-center gap-2 font-semibold text-rose-800">
            <i data-lucide="alert-circle" class="w-4 h-4 text-rose-600"></i>
            <span>เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}</span>
          </div>
        `;
      } finally {
        btnTestGasConnection.disabled = false;
        btnTestGasText.textContent = 'ทดสอบการเชื่อมต่อ';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  if (btnSaveGasUrl) {
    btnSaveGasUrl.addEventListener('click', async () => {
      const raw = gasUrlInput.value.trim();
      const api = getSheetsAPI();
      if (raw) {
        const val = api ? api.validateGasUrl(raw) : { valid: true, url: raw };
        if (!val.valid) {
          alert(val.error);
          gasUrlInput.focus();
          return;
        }
        if (api) api.setGasUrl(val.url);
        gasUrlInput.value = val.url;
      } else {
        if (api) api.setGasUrl('');
      }

      modalGasSettings.classList.add('hidden');

      if (raw) {
        showToast('กำลังซิงค์ข้อมูลการจองทั้งหมดกับ Google Sheets...');
        try {
          if (api) {
            const syncRes = await api.syncAll();
            updateHeaderBookingCount();
            if (syncRes.success) {
              showToast(`ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย (พบข้อมูลทั้งหมด ${syncRes.count} รายการ)`);
            } else {
              showToast(syncRes.error || 'การซิงค์ขัดข้อง');
            }
          }
        } catch (e) {
          showToast('บันทึก URL แล้ว แต่การซิงค์ขัดข้อง: ' + e.message, 'error');
        }
      } else {
        showToast('ตัดการเชื่อมต่อแล้ว กลับสู่โหมดออฟไลน์');
      }
    });
  }

  if (btnClearGasUrl) {
    btnClearGasUrl.addEventListener('click', () => {
      if (!confirm('ต้องการลบการเชื่อมต่อ Google Sheets และกลับสู่โหมดออฟไลน์หรือไม่?')) return;
      const api = getSheetsAPI();
      if (api) api.setGasUrl('');
      gasUrlInput.value = '';
      if (gasTestResultBox) gasTestResultBox.classList.add('hidden');
      modalGasSettings.classList.add('hidden');
      showToast('ตัดการเชื่อมต่อแล้ว กลับสู่โหมดออฟไลน์');
    });
  }

  // Set Today's Document Number and Generation Date
  const now = new Date();
  cardDateGenerated.textContent = `DATE: ${formatEnglishDate(now)}`;

  // Initial Run
  checkForLoadedBooking();
  if (!state.currentDocNo) {
    cardDocNo.textContent = `NO: ${generateDocNo()}`;
  }
  populateForm();
  renderCard();
  updateHeaderBookingCount();
  switchMobileTab('editor');
  if (window.lucide) {
    lucide.createIcons();
  }
});
