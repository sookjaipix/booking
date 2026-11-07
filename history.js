/**
 * Sook Jai Pix - Booking History & Google Sheets Management Controller
 * Handles viewing, editing, deleting bookings and syncing with Google Sheets
 */

document.addEventListener('DOMContentLoaded', () => {
  function getSheetsAPI() {
    if (typeof window !== 'undefined' && window.SookJaiSheetsAPI) return window.SookJaiSheetsAPI;
    if (typeof globalThis !== 'undefined' && globalThis.SookJaiSheetsAPI) return globalThis.SookJaiSheetsAPI;
    if (typeof self !== 'undefined' && self.SookJaiSheetsAPI) return self.SookJaiSheetsAPI;
    return null;
  }
  const SookJaiSheetsAPI = getSheetsAPI();

  // State
  let bookings = [];
  let currentFilter = 'all'; // 'all', 'pending', 'paid'
  let searchQuery = '';
  let sortBy = 'eventDate_asc';
  let deleteTargetBooking = null;

  // DOM Elements - Status & Stats
  const statusBanner = document.getElementById('syncStatusBanner');
  const statusDotIndicator = document.getElementById('statusDotIndicator');
  const statusTitleText = document.getElementById('statusTitleText');
  const statusModeBadge = document.getElementById('statusModeBadge');
  const statusDescText = document.getElementById('statusDescText');
  const lastUpdatedText = document.getElementById('lastUpdatedText');
  const btnSyncNow = document.getElementById('btnSyncNow');
  const btnSyncNowText = document.getElementById('btnSyncNowText');
  const iconSyncNow = document.getElementById('iconSyncNow');

  const statTotalCount = document.getElementById('statTotalCount');
  const statTotalAmount = document.getElementById('statTotalAmount');
  const statRemainingAmount = document.getElementById('statRemainingAmount');
  const statPaidCount = document.getElementById('statPaidCount');

  // DOM Elements - Filter & Search
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterCountAll = document.getElementById('filterCountAll');
  const filterCountPending = document.getElementById('filterCountPending');
  const filterCountPaid = document.getElementById('filterCountPaid');
  const displayingCount = document.getElementById('displayingCount');
  const btnExportCsv = document.getElementById('btnExportCsv');

  // DOM Elements - Containers & Indicators
  const bookingListContainer = document.getElementById('bookingListContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyIndicator = document.getElementById('emptyIndicator');
  const bookingCardsGrid = document.getElementById('bookingCardsGrid');
  const btnRefresh = document.getElementById('btnRefresh');
  const iconRefresh = document.getElementById('iconRefresh');

  // DOM Elements - Edit Modal
  const modalEditBooking = document.getElementById('modalEditBooking');
  const btnCloseEditModal = document.getElementById('btnCloseEditModal');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnSaveEdit = document.getElementById('btnSaveEdit');
  const btnSaveEditText = document.getElementById('btnSaveEditText');
  const editDocNoSubtitle = document.getElementById('editDocNoSubtitle');
  const editBookingId = document.getElementById('editBookingId');
  const editCustomerName = document.getElementById('editCustomerName');
  const editCustomerPhone = document.getElementById('editCustomerPhone');
  const editCustomerFacebook = document.getElementById('editCustomerFacebook');
  const editEventType = document.getElementById('editEventType');
  const editEventDate = document.getElementById('editEventDate');
  const editTimePeriod = document.getElementById('editTimePeriod');
  const editPhotographerCount = document.getElementById('editPhotographerCount');
  const editLocation = document.getElementById('editLocation');
  const editTotalAmount = document.getElementById('editTotalAmount');
  const editDepositAmount = document.getElementById('editDepositAmount');
  const editRemainingAmountDisplay = document.getElementById('editRemainingAmountDisplay');
  const editPaymentStatusBadge = document.getElementById('editPaymentStatusBadge');

  // DOM Elements - Delete Modal
  const modalDeleteConfirm = document.getElementById('modalDeleteConfirm');
  const deleteTargetDocNo = document.getElementById('deleteTargetDocNo');
  const deleteTargetName = document.getElementById('deleteTargetName');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const btnConfirmDeleteText = document.getElementById('btnConfirmDeleteText');

  // DOM Elements - Google Sheets Settings Modal
  const modalGasSettings = document.getElementById('modalGasSettings');
  const btnOpenGasSettings = document.getElementById('btnOpenGasSettings');
  const btnCloseGasSettings = document.getElementById('btnCloseGasSettings');
  const gasUrlInput = document.getElementById('gasUrlInput');
  const btnTestGasConnection = document.getElementById('btnTestGasConnection');
  const btnTestGasText = document.getElementById('btnTestGasText');
  const btnSaveGasUrl = document.getElementById('btnSaveGasUrl');
  const btnClearGasUrl = document.getElementById('btnClearGasUrl');
  const btnCopyGasCode = document.getElementById('btnCopyGasCode');
  const btnCopyGasCodeText = document.getElementById('btnCopyGasCodeText');
  const btnToggleGasCodeView = document.getElementById('btnToggleGasCodeView');
  const btnToggleGasCodeViewText = document.getElementById('btnToggleGasCodeViewText');
  const gasCodeFullContainer = document.getElementById('gasCodeFullContainer');
  const gasCodeTextarea = document.getElementById('gasCodeTextarea');
  const btnSelectAllCode = document.getElementById('btnSelectAllCode');
  const gasUrlLiveWarning = document.getElementById('gasUrlLiveWarning');
  const gasUrlLiveWarningText = document.getElementById('gasUrlLiveWarningText');
  const gasTestResultBox = document.getElementById('gasTestResultBox');

  // DOM Elements - Toast
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');
  const toastIcon = document.getElementById('toastIcon');

  // Format currency
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return '฿' + num.toLocaleString('th-TH');
  }

  // Format date for Thai display
  function formatThaiDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const thaiMonths = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const monthName = thaiMonths[month - 1] || '';
        return `${day} ${monthName} ${year + 543}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  // Toast notification
  let toastTimer = null;
  function showToast(message, type = 'success') {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;

    if (type === 'success') {
      toastIcon.setAttribute('data-lucide', 'check');
      toastIcon.className = 'w-4 h-4 text-emerald-400';
    } else if (type === 'error') {
      toastIcon.setAttribute('data-lucide', 'alert-circle');
      toastIcon.className = 'w-4 h-4 text-rose-400';
    } else {
      toastIcon.setAttribute('data-lucide', 'info');
      toastIcon.className = 'w-4 h-4 text-champagne-400';
    }

    if (window.lucide) lucide.createIcons();
    toastMessage.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toastMessage.classList.add('hidden');
    }, 3800);
  }

  // Update Status Banner
  function updateStatusBanner() {
    const configured = SookJaiSheetsAPI.isConfigured();
    if (configured) {
      statusDotIndicator.className = 'w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0';
      statusTitleText.textContent = 'เชื่อมต่อ Google Sheets สำเร็จเรียบร้อย';
      statusModeBadge.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';
      statusModeBadge.textContent = 'Online Sync';
      statusDescText.textContent = 'ข้อมูลเชื่อมโยงกับ Google Sheets โดยตรง เมื่อบันทึกหรือแก้ไขจะซิงค์ทันที';
    } else {
      statusDotIndicator.className = 'w-3 h-3 rounded-full bg-amber-500 flex-shrink-0';
      statusTitleText.textContent = 'โหมดออฟไลน์ (บันทึกในเครื่อง LocalStorage)';
      statusModeBadge.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200';
      statusModeBadge.textContent = 'Local Cache';
      statusDescText.textContent = 'ยังไม่ได้เชื่อมต่อ Google Sheets ข้อมูลจะถูกจัดเก็บไว้ในเบราว์เซอร์เครื่องนี้';
    }
    const now = new Date();
    lastUpdatedText.textContent = `อัปเดต: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;
  }

  // Load and fetch bookings
  async function loadBookings(isRefresh = false) {
    if (isRefresh) {
      iconRefresh.classList.add('animate-spin');
    }
    loadingIndicator.classList.remove('hidden');
    emptyIndicator.classList.add('hidden');
    bookingCardsGrid.innerHTML = '';

    try {
      let res;
      if (isRefresh && SookJaiSheetsAPI.isConfigured()) {
        res = await SookJaiSheetsAPI.syncAll();
      } else {
        res = await SookJaiSheetsAPI.fetchAll();
      }
      bookings = res.data || [];
      if (res.warning) {
        showToast(res.warning, 'info');
      } else if (res.message && isRefresh) {
        showToast(res.message);
      }
      updateStatusBanner();
      renderAll();
    } catch (err) {
      console.error(err);
      bookings = SookJaiSheetsAPI.getLocalBookings();
      renderAll();
      showToast('เกิดข้อผิดพลาดในการดึงข้อมูล กำลังแสดงจากแคชในเครื่อง', 'error');
    } finally {
      loadingIndicator.classList.add('hidden');
      if (isRefresh) {
        setTimeout(() => iconRefresh.classList.remove('animate-spin'), 600);
      }
    }
  }

  // Calculate & Update Metrics
  function updateMetrics() {
    const totalCount = bookings.length;
    let totalAmt = 0;
    let remainingAmt = 0;
    let paidCount = 0;
    let pendingCount = 0;

    bookings.forEach(b => {
      const total = Number(b.totalAmount) || 0;
      const deposit = Number(b.depositAmount) || 0;
      const remaining = Number(b.remainingAmount !== undefined ? b.remainingAmount : Math.max(0, total - deposit));

      totalAmt += total;
      remainingAmt += remaining;

      if (remaining === 0 && total > 0) {
        paidCount++;
      } else {
        pendingCount++;
      }
    });

    statTotalCount.textContent = totalCount.toLocaleString('th-TH');
    statTotalAmount.textContent = formatMoney(totalAmt);
    statRemainingAmount.textContent = formatMoney(remainingAmt);
    statPaidCount.textContent = paidCount.toLocaleString('th-TH');

    filterCountAll.textContent = totalCount;
    filterCountPending.textContent = pendingCount;
    filterCountPaid.textContent = paidCount;
  }

  // Filter & Sort Bookings
  function getFilteredAndSortedBookings() {
    let result = [...bookings];

    // Status Filter
    if (currentFilter === 'pending') {
      result = result.filter(b => {
        const total = Number(b.totalAmount) || 0;
        const deposit = Number(b.depositAmount) || 0;
        const remaining = Number(b.remainingAmount !== undefined ? b.remainingAmount : total - deposit);
        return remaining > 0 || b.status === 'รอชำระวันงาน';
      });
    } else if (currentFilter === 'paid') {
      result = result.filter(b => {
        const total = Number(b.totalAmount) || 0;
        const deposit = Number(b.depositAmount) || 0;
        const remaining = Number(b.remainingAmount !== undefined ? b.remainingAmount : total - deposit);
        return (remaining === 0 && total > 0) || b.status === 'ชำระครบถ้วน';
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(b => {
        return (
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.docNo && b.docNo.toLowerCase().includes(q)) ||
          (b.customerPhone && b.customerPhone.includes(q)) ||
          (b.eventType && b.eventType.toLowerCase().includes(q)) ||
          (b.location && b.location.toLowerCase().includes(q)) ||
          (b.customerFacebook && b.customerFacebook.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'eventDate_asc') {
        return (a.eventDate || '9999-99-99').localeCompare(b.eventDate || '9999-99-99');
      }
      if (sortBy === 'eventDate_desc') {
        return (b.eventDate || '').localeCompare(a.eventDate || '');
      }
      if (sortBy === 'updated_desc') {
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      }
      if (sortBy === 'remaining_desc') {
        const remA = Number(a.remainingAmount || 0);
        const remB = Number(b.remainingAmount || 0);
        return remB - remA;
      }
      return 0;
    });

    return result;
  }

  // Render All Views
  function renderAll() {
    updateMetrics();

    const filtered = getFilteredAndSortedBookings();
    displayingCount.textContent = filtered.length;

    if (filtered.length === 0) {
      emptyIndicator.classList.remove('hidden');
      bookingCardsGrid.innerHTML = '';
      return;
    }

    emptyIndicator.classList.add('hidden');
    bookingCardsGrid.innerHTML = filtered.map(renderBookingCard).join('');

    // Reattach listeners to action buttons on cards
    attachCardListeners();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Generate Booking Card HTML
  function renderBookingCard(booking) {
    const total = Number(booking.totalAmount) || 0;
    const deposit = Number(booking.depositAmount) || 0;
    const remaining = Number(booking.remainingAmount !== undefined ? booking.remainingAmount : Math.max(0, total - deposit));
    const isPaid = (remaining === 0 && total > 0) || booking.status === 'ชำระครบถ้วน';

    const isExpress = booking.selectedPackage === 'express';
    const pkgBadge = isExpress
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-900 text-white border border-stone-800">
           <i data-lucide="zap" class="w-3 h-3 text-champagne-300"></i> ส่งงานด่วน (5 วัน)
         </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
           <i data-lucide="camera" class="w-3 h-3 text-stone-500"></i> ส่งงานปกติ (2 สัปดาห์)
         </span>`;

    const statusBadge = isPaid
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
           <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ชำระครบถ้วน
         </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
           <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> รอชำระวันงาน
         </span>`;

    const phoneLink = booking.customerPhone
      ? `<a href="tel:${booking.customerPhone}" class="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-mono hover:underline">
           <i data-lucide="phone" class="w-3 h-3 text-stone-400"></i>
           <span>${booking.customerPhone}</span>
         </a>`
      : '';

    const fbLink = booking.customerFacebook
      ? `<a href="${booking.customerFacebook}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline" title="เปิด Facebook ลูกค้า">
           <i data-lucide="facebook" class="w-3 h-3"></i>
           <span>Facebook</span>
         </a>`
      : '';

    return `
      <div class="booking-card bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all duration-200 flex flex-col justify-between" data-id="${booking.id}">
        
        <!-- Card Top: Doc No, Date & Status -->
        <div class="space-y-3 pb-4 border-b border-stone-100">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-mono font-semibold text-stone-900 tracking-tight bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200/60">
              ${booking.docNo || 'SJP-NO-ID'}
            </span>
            <div class="flex items-center gap-1.5">
              ${pkgBadge}
              ${statusBadge}
            </div>
          </div>

          <!-- Customer Name & Contacts -->
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
              ${booking.customerName || 'ไม่ระบุชื่อลูกค้า'}
            </h3>
            <div class="flex flex-wrap items-center gap-3 mt-1.5">
              ${phoneLink}
              ${fbLink}
            </div>
          </div>
        </div>

        <!-- Card Middle: Event Details -->
        <div class="py-3.5 space-y-2 text-xs text-stone-600">
          <!-- Event Type -->
          <div class="flex items-start gap-2">
            <i data-lucide="calendar-heart" class="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0"></i>
            <div>
              <span class="font-medium text-stone-900">${booking.eventType || '-'}</span>
              <span class="text-stone-400 mx-1">•</span>
              <span class="font-mono text-stone-700">${formatThaiDate(booking.eventDate)}</span>
              ${booking.timePeriod ? `<span class="text-stone-500 font-light ml-1">(${booking.timePeriod})</span>` : ''}
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-start gap-2">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0"></i>
            <span class="text-stone-700 leading-relaxed">${booking.location || 'ไม่ระบุสถานที่'}</span>
          </div>

          <!-- Photographers -->
          ${booking.photographerCount ? `
          <div class="flex items-start gap-2 text-stone-500 font-light">
            <i data-lucide="camera" class="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0"></i>
            <span>${booking.photographerCount}</span>
          </div>` : ''}
        </div>

        <!-- Card Bottom: Pricing & Actions -->
        <div class="pt-3 border-t border-stone-100 space-y-3.5">
          <!-- Pricing Grid -->
          <div class="grid grid-cols-3 gap-2 bg-stone-50/70 p-3 rounded-2xl border border-stone-100 text-center">
            <div>
              <span class="text-[9px] uppercase tracking-wider text-stone-400 block">ยอดรวม</span>
              <span class="text-xs font-mono font-medium text-stone-700">${formatMoney(total)}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase tracking-wider text-stone-400 block">มัดจำแล้ว</span>
              <span class="text-xs font-mono font-medium text-emerald-700">${formatMoney(deposit)}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase tracking-wider ${isPaid ? 'text-stone-400' : 'text-champagne-600 font-medium'} block">คงเหลือ</span>
              <span class="text-xs font-mono font-bold ${isPaid ? 'text-stone-700' : 'text-stone-900'}">${formatMoney(remaining)}</span>
            </div>
          </div>

          <!-- Payment Status Action ("ชำระยอดเรียบร้อยแล้ว") -->
          <div class="pt-0.5">
            ${!isPaid ? `
            <button type="button" class="btn-mark-paid w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 active:scale-[0.99] border border-emerald-200/90 rounded-xl transition shadow-xs group" data-id="${booking.id}" title="ระบุว่ารายการนี้ชำระยอดเรียบร้อยแล้ว">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform"></i>
              <span>ชำระยอดเรียบร้อยแล้ว</span>
            </button>
            ` : `
            <div class="flex items-center justify-between py-1.5 px-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs">
              <span class="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                <i data-lucide="check-check" class="w-4 h-4 text-emerald-600"></i>
                <span>ชำระยอดเรียบร้อยแล้ว</span>
              </span>
              <button type="button" class="btn-mark-unpaid text-[11px] text-stone-500 hover:text-stone-800 font-medium hover:underline transition" data-id="${booking.id}" title="คลิกเพื่อเปลี่ยนสถานะกลับเป็นรอชำระวันงาน">
                เปลี่ยนสถานะ
              </button>
            </div>
            `}
          </div>

          <!-- Actions Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <!-- Load to Generator (View / Re-render) -->
            <button type="button" class="btn-load-generator inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-850 active:scale-[0.98] rounded-xl shadow-xs transition" data-id="${booking.id}">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-stone-300"></i>
              <span>ดู / ออกรูป</span>
            </button>

            <div class="flex items-center gap-1">
              <!-- Google Calendar -->
              <button type="button" class="btn-calendar inline-flex items-center gap-1 p-2 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/60 rounded-xl transition" data-id="${booking.id}" title="บันทึกลง Google Calendar">
                <i data-lucide="calendar-plus" class="w-3.5 h-3.5"></i>
              </button>

              <!-- Edit Booking -->
              <button type="button" class="btn-edit-booking inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition" data-id="${booking.id}" title="แก้ไขข้อมูล">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                <span class="hidden xs:inline">แก้ไข</span>
              </button>

              <!-- Delete Booking -->
              <button type="button" class="btn-delete-booking inline-flex items-center gap-1 p-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" data-id="${booking.id}" title="ลบรายการ">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // Attach Listeners to Card Buttons
  function attachCardListeners() {
    // 1. Load into Generator & Render
    document.querySelectorAll('.btn-load-generator').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          SookJaiSheetsAPI.setActiveBookingForEdit(booking);
          window.location.href = 'index.html';
        }
      });
    });

    // 2. Open Google Calendar
    document.querySelectorAll('.btn-calendar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          openGoogleCalendarForBooking(booking);
        }
      });
    });

    // 3. Edit Booking
    document.querySelectorAll('.btn-edit-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          openEditModal(booking);
        }
      });
    });

    // 4. Delete Booking
    document.querySelectorAll('.btn-delete-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          openDeleteModal(booking);
        }
      });
    });

    // 5. Mark Paid in Full ("ชำระยอดเรียบร้อยแล้ว")
    document.querySelectorAll('.btn-mark-paid').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        btn.disabled = true;
        btn.innerHTML = '<span class="inline-flex items-center gap-1.5"><i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังบันทึก...</span></span>';
        if (window.lucide) lucide.createIcons();

        try {
          const total = Number(booking.totalAmount) || 0;
          const oldDeposit = Number(booking.depositAmount) || 0;

          const updatedBooking = Object.assign({}, booking, {
            originalDepositAmount: oldDeposit,
            depositAmount: total,
            remainingAmount: 0,
            status: 'ชำระครบถ้วน',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });

          const api = getSheetsAPI();
          let res = { success: true, syncedToSheets: false };
          if (api) {
            res = await api.updateBooking(updatedBooking);
          }

          const idx = bookings.findIndex(b => b.id === id);
          if (idx >= 0) {
            bookings[idx] = res.data || updatedBooking;
          }

          renderAll();

          if (res.syncedToSheets) {
            showToast(`ระบุ "${booking.docNo || 'รายการ'}" ชำระยอดเรียบร้อยแล้ว และซิงค์ลง Google Sheet สำเร็จ`);
          } else {
            showToast(`ระบุ "${booking.docNo || 'รายการ'}" ชำระยอดเรียบร้อยแล้ว`);
          }
        } catch (err) {
          console.error(err);
          showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + err.message, 'error');
          renderAll();
        }
      });
    });

    // 6. Mark Unpaid ("เปลี่ยนสถานะกลับเป็นรอชำระวันงาน")
    document.querySelectorAll('.btn-mark-unpaid').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        if (!confirm(`ต้องการเปลี่ยนสถานะของ "${booking.docNo || 'รายการนี้'}" กลับเป็น "รอชำระวันงาน" หรือไม่?`)) {
          return;
        }

        btn.disabled = true;
        btn.textContent = 'กำลังเปลี่ยนสถานะ...';

        try {
          const total = Number(booking.totalAmount) || 0;
          const restoredDeposit = (booking.originalDepositAmount !== undefined && Number(booking.originalDepositAmount) < total)
            ? Number(booking.originalDepositAmount)
            : 0;
          const remaining = Math.max(0, total - restoredDeposit);

          const updatedBooking = Object.assign({}, booking, {
            depositAmount: restoredDeposit,
            remainingAmount: remaining,
            status: (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : 'รอชำระวันงาน',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });

          const api = getSheetsAPI();
          let res = { success: true, syncedToSheets: false };
          if (api) {
            res = await api.updateBooking(updatedBooking);
          }

          const idx = bookings.findIndex(b => b.id === id);
          if (idx >= 0) {
            bookings[idx] = res.data || updatedBooking;
          }

          renderAll();

          showToast(`เปลี่ยนสถานะ "${booking.docNo || 'รายการ'}" เป็นรอชำระวันงานเรียบร้อยแล้ว`);
        } catch (err) {
          console.error(err);
          showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
          renderAll();
        }
      });
    });
  }

  // Google Calendar helper for a booking
  function openGoogleCalendarForBooking(booking) {
    const title = `ถ่ายภาพ: ${booking.customerName || 'ลูกค้า'} (${booking.eventType || 'งานถ่ายภาพ'})`;
    let details = `บันทึกคิวงานถ่ายภาพ Sook Jai Pix\n`;
    details += `เลขที่เอกสาร: ${booking.docNo || '-'}\n`;
    details += `ลูกค้า: ${booking.customerName || '-'}\n`;
    if (booking.customerPhone) details += `เบอร์ติดต่อ: ${booking.customerPhone}\n`;
    if (booking.customerFacebook) details += `Facebook: ${booking.customerFacebook}\n`;
    details += `ประเภทงาน: ${booking.eventType || '-'}\n`;
    details += `ช่วงเวลา: ${booking.timePeriod || '-'}\n`;
    details += `สถานที่: ${booking.location || '-'}\n`;
    details += `ช่างภาพ: ${booking.photographerCount || '-'}\n`;
    details += `แพ็กเกจ: ${booking.selectedPackage === 'express' ? 'ส่งงานด่วน (5 วัน)' : 'ส่งงานปกติ (2 สัปดาห์)'}\n`;
    details += `ยอดคงเหลือชำระวันงาน: ${formatMoney(booking.remainingAmount || 0)}\n`;

    const location = booking.location || '';
    let datesParam = '';

    if (booking.eventDate) {
      const cleanDate = booking.eventDate.replace(/-/g, '');
      datesParam = `${cleanDate}/${cleanDate}`;
    }

    const calUrl = new URL('https://calendar.google.com/calendar/render');
    calUrl.searchParams.set('action', 'TEMPLATE');
    calUrl.searchParams.set('text', title);
    calUrl.searchParams.set('details', details);
    if (location) calUrl.searchParams.set('location', location);
    if (datesParam) calUrl.searchParams.set('dates', datesParam);

    window.open(calUrl.toString(), '_blank');
  }

  // ===================================================================
  // EDIT MODAL HANDLERS
  // ===================================================================
  function openEditModal(booking) {
    editBookingId.value = booking.id;
    editDocNoSubtitle.textContent = `NO: ${booking.docNo || 'SJP-NEW'}`;
    editCustomerName.value = booking.customerName || '';
    editCustomerPhone.value = booking.customerPhone || '';
    editCustomerFacebook.value = booking.customerFacebook || '';
    editEventType.value = booking.eventType || '';
    editEventDate.value = booking.eventDate || '';
    editTimePeriod.value = booking.timePeriod || '';
    editPhotographerCount.value = booking.photographerCount || '';
    editLocation.value = booking.location || '';

    // Package radio
    const pkgRadios = document.querySelectorAll('input[name="editSelectedPackage"]');
    pkgRadios.forEach(r => {
      r.checked = (r.value === (booking.selectedPackage || 'normal'));
    });

    // Pricing
    editTotalAmount.value = booking.totalAmount || 0;
    editDepositAmount.value = booking.depositAmount || 0;
    recalculateEditRemaining();

    modalEditBooking.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  function closeEditModal() {
    modalEditBooking.classList.add('hidden');
  }

  function recalculateEditRemaining() {
    const total = Number(editTotalAmount.value) || 0;
    const deposit = Number(editDepositAmount.value) || 0;
    const remaining = Math.max(0, total - deposit);

    editRemainingAmountDisplay.textContent = formatMoney(remaining);

    if (remaining === 0 && total > 0) {
      editPaymentStatusBadge.className = 'px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-emerald-100 text-emerald-800';
      editPaymentStatusBadge.textContent = 'ชำระครบถ้วนแล้ว';
    } else {
      editPaymentStatusBadge.className = 'px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-amber-100 text-amber-800';
      editPaymentStatusBadge.textContent = 'รอชำระวันงาน';
    }
  }

  editTotalAmount.addEventListener('input', recalculateEditRemaining);
  editDepositAmount.addEventListener('input', recalculateEditRemaining);

  const btnQuickPayInModal = document.getElementById('btnQuickPayInModal');
  if (btnQuickPayInModal) {
    btnQuickPayInModal.addEventListener('click', () => {
      const total = Number(editTotalAmount.value) || 0;
      editDepositAmount.value = total;
      recalculateEditRemaining();
      showToast('ระบุชำระครบถ้วนเต็มจำนวนแล้ว กรุณากดปุ่ม "บันทึกข้อมูลการจอง"');
    });
  }

  // Save Edit Handler
  btnSaveEdit.addEventListener('click', async () => {
    const id = editBookingId.value;
    const existing = bookings.find(b => b.id === id);
    if (!existing) return;

    if (!editCustomerName.value.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      editCustomerName.focus();
      return;
    }

    const selectedPkgRadio = document.querySelector('input[name="editSelectedPackage"]:checked');
    const selectedPackage = selectedPkgRadio ? selectedPkgRadio.value : 'normal';

    const total = Number(editTotalAmount.value) || 0;
    const deposit = Number(editDepositAmount.value) || 0;
    const remaining = Math.max(0, total - deposit);

    const updatedBooking = Object.assign({}, existing, {
      customerName: editCustomerName.value.trim(),
      customerPhone: editCustomerPhone.value.trim(),
      customerFacebook: editCustomerFacebook.value.trim(),
      eventType: editEventType.value.trim(),
      eventDate: editEventDate.value,
      timePeriod: editTimePeriod.value.trim(),
      photographerCount: editPhotographerCount.value.trim(),
      location: editLocation.value.trim(),
      selectedPackage: selectedPackage,
      totalAmount: total,
      depositAmount: deposit,
      remainingAmount: remaining,
      status: (remaining === 0 && total > 0) ? 'ชำระครบถ้วน' : 'รอชำระวันงาน'
    });

    btnSaveEdit.disabled = true;
    btnSaveEditText.textContent = 'กำลังบันทึกข้อมูลการจอง...';

    try {
      const res = await SookJaiSheetsAPI.updateBooking(updatedBooking);
      const idx = bookings.findIndex(b => b.id === id);
      if (idx >= 0) {
        bookings[idx] = res.data || updatedBooking;
      }
      closeEditModal();
      renderAll();
      showToast(res.syncedToSheets ? 'บันทึกและซิงค์ข้อมูลการจองลง Google Sheets สำเร็จ' : 'บันทึกข้อมูลการจองในเครื่องเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึก: ' + err.message, 'error');
    } finally {
      btnSaveEdit.disabled = false;
      btnSaveEditText.textContent = 'บันทึกข้อมูลการจอง';
    }
  });

  btnCloseEditModal.addEventListener('click', closeEditModal);
  btnCancelEdit.addEventListener('click', closeEditModal);

  // ===================================================================
  // DELETE MODAL HANDLERS
  // ===================================================================
  function openDeleteModal(booking) {
    deleteTargetBooking = booking;
    deleteTargetDocNo.textContent = booking.docNo || 'SJP-XXXX';
    deleteTargetName.textContent = booking.customerName || 'ลูกค้า';
    modalDeleteConfirm.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  function closeDeleteModal() {
    deleteTargetBooking = null;
    modalDeleteConfirm.classList.add('hidden');
  }

  btnCancelDelete.addEventListener('click', closeDeleteModal);

  btnConfirmDelete.addEventListener('click', async () => {
    if (!deleteTargetBooking) return;

    btnConfirmDelete.disabled = true;
    btnConfirmDeleteText.textContent = 'กำลังลบ...';

    try {
      const res = await SookJaiSheetsAPI.deleteBooking(deleteTargetBooking.id, deleteTargetBooking.docNo);
      bookings = bookings.filter(b => b.id !== deleteTargetBooking.id);
      closeDeleteModal();
      renderAll();
      showToast(res.syncedToSheets ? 'ลบรายการออกจากระบบและ Google Sheets เรียบร้อย' : 'ลบรายการออกจากเครื่องเรียบร้อย');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDeleteText.textContent = 'ยืนยันการลบ';
    }
  });

  // ===================================================================
  // GOOGLE APPS SCRIPT SETTINGS MODAL
  // ===================================================================
  btnOpenGasSettings.addEventListener('click', () => {
    gasUrlInput.value = SookJaiSheetsAPI.getGasUrl();
    gasTestResultBox.classList.add('hidden');
    gasUrlLiveWarning.classList.add('hidden');
    modalGasSettings.classList.remove('hidden');

    // Populate textarea if available
    if (gasCodeTextarea && window.SOOKJAI_GAS_CODE) {
      gasCodeTextarea.value = window.SOOKJAI_GAS_CODE;
    }

    if (window.lucide) lucide.createIcons();
  });

  btnCloseGasSettings.addEventListener('click', () => {
    modalGasSettings.classList.add('hidden');
  });

  // Live input warning on gasUrlInput
  gasUrlInput.addEventListener('input', () => {
    const val = gasUrlInput.value.trim();
    if (!val) {
      gasUrlLiveWarning.classList.add('hidden');
      return;
    }
    const check = SookJaiSheetsAPI.validateGasUrl(val);
    if (!check.valid) {
      gasUrlLiveWarningText.textContent = check.error;
      gasUrlLiveWarning.classList.remove('hidden');
    } else {
      gasUrlLiveWarning.classList.add('hidden');
    }
  });

  // Toggle View Full Code
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

  // Open Test URL in New Browser Tab
  const btnOpenInNewTab = document.getElementById('btnOpenInNewTab');
  if (btnOpenInNewTab) {
    btnOpenInNewTab.addEventListener('click', () => {
      const raw = gasUrlInput.value.trim();
      if (!raw) {
        alert('กรุณากรอก Web App URL ก่อนกดเปิดทดสอบ');
        gasUrlInput.focus();
        return;
      }
      const val = SookJaiSheetsAPI.validateGasUrl(raw);
      const url = val.valid ? val.url : raw;
      const testUrl = url + (url.includes('?') ? '&' : '?') + 'action=ping&_t=' + Date.now();
      window.open(testUrl, '_blank');
    });
  }

  // Select all code in textarea
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

  // Test GAS Connection
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
      const result = await SookJaiSheetsAPI.testConnection(url);
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

  // Save GAS URL
  btnSaveGasUrl.addEventListener('click', () => {
    const raw = gasUrlInput.value.trim();
    if (raw) {
      const val = SookJaiSheetsAPI.validateGasUrl(raw);
      if (!val.valid) {
        alert(val.error);
        gasUrlInput.focus();
        return;
      }
      SookJaiSheetsAPI.setGasUrl(val.url);
      gasUrlInput.value = val.url;
    } else {
      SookJaiSheetsAPI.setGasUrl('');
    }

    modalGasSettings.classList.add('hidden');
    updateStatusBanner();
    loadBookings(true);
    showToast(raw ? 'บันทึก URL เชื่อมต่อ Google Sheets เรียบร้อยแล้ว' : 'กลับสู่โหมดออฟไลน์');
  });

  // Clear GAS URL
  btnClearGasUrl.addEventListener('click', () => {
    if (confirm('คุณต้องการตัดการเชื่อมต่อ Google Sheets และกลับไปใช้ข้อมูลในเครื่องใช่หรือไม่?')) {
      SookJaiSheetsAPI.setGasUrl('');
      gasUrlInput.value = '';
      modalGasSettings.classList.add('hidden');
      updateStatusBanner();
      loadBookings(true);
      showToast('ตัดการเชื่อมต่อแล้ว กลับสู่โหมดออฟไลน์');
    }
  });

  // Copy Code.gs Script
  btnCopyGasCode.addEventListener('click', async () => {
    const codeText = window.SOOKJAI_GAS_CODE || '';
    if (!codeText) {
      alert('ไม่พบโค้ดสคริปต์ กรุณาเปิดไฟล์ Code.gs ในโฟลเดอร์โปรเจกต์');
      return;
    }

    try {
      await navigator.clipboard.writeText(codeText);
      btnCopyGasCodeText.textContent = 'คัดลอกโค้ดสำเร็จ!';
      showToast('คัดลอกโค้ด Google Apps Script ฉบับสมบูรณ์เรียบร้อยแล้ว');
      setTimeout(() => {
        btnCopyGasCodeText.textContent = 'คัดลอกโค้ดสคริปต์';
      }, 2500);
    } catch (err) {
      // Fallback: show code container and select it
      if (gasCodeFullContainer && gasCodeTextarea) {
        gasCodeFullContainer.classList.remove('hidden');
        gasCodeTextarea.value = codeText;
        gasCodeTextarea.focus();
        gasCodeTextarea.select();
        showToast('กรุณากด Cmd+C หรือ Ctrl+C เพื่อคัดลอกโค้ดในกล่อง');
      }
    }
  });

  // ===================================================================
  // FILTER, SEARCH & CSV EXPORT
  // ===================================================================
  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.trim()) {
      btnClearSearch.classList.remove('hidden');
    } else {
      btnClearSearch.classList.add('hidden');
    }
    renderAll();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderAll();
  });

  // Sort
  sortSelect.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderAll();
  });

  // Status Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.className = 'filter-tab px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition';
      });
      tab.className = 'filter-tab active px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 text-white transition';

      currentFilter = tab.getAttribute('data-status-filter');
      renderAll();
    });
  });

  // Refresh
  btnRefresh.addEventListener('click', () => {
    loadBookings(true);
  });

  // Sync Now Button
  if (btnSyncNow) {
    btnSyncNow.addEventListener('click', async () => {
      if (!SookJaiSheetsAPI.isConfigured()) {
        openGasSettingsModal();
        showToast('กรุณาตั้งค่าเชื่อมต่อ Google Sheets ก่อนทำการซิงค์', 'info');
        return;
      }

      if (iconSyncNow) iconSyncNow.classList.add('animate-spin');
      if (btnSyncNowText) btnSyncNowText.textContent = 'กำลังซิงค์...';
      btnSyncNow.disabled = true;

      try {
        const res = await SookJaiSheetsAPI.syncAll();
        bookings = res.data || [];
        updateStatusBanner();
        renderAll();
        if (res.success) {
          showToast(res.message || 'ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย');
        } else {
          showToast(res.error || 'การซิงค์ติดขัด', 'error');
        }
      } catch (err) {
        showToast('การซิงค์ล้มเหลว: ' + err.message, 'error');
      } finally {
        if (iconSyncNow) iconSyncNow.classList.remove('animate-spin');
        if (btnSyncNowText) btnSyncNowText.textContent = 'ซิงค์ข้อมูล';
        btnSyncNow.disabled = false;
      }
    });
  }

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (bookings.length === 0) {
      showToast('ไม่มีข้อมูลการจองสำหรับส่งออก', 'info');
      return;
    }

    const headers = [
      'ID', 'เลขที่เอกสาร', 'วันที่บันทึก', 'ชื่อลูกค้า', 'เบอร์โทรลูกค้า', 'Facebook',
      'ประเภทงาน', 'สถานที่จัดงาน', 'วันที่จัดงาน', 'ช่วงเวลา', 'จำนวนช่างภาพ',
      'แพ็กเกจ', 'ยอดรวม', 'ยอดมัดจำ', 'ยอดคงเหลือ', 'สถานะการชำระ', 'อัปเดตล่าสุด'
    ];

    const rows = bookings.map(b => [
      b.id || '',
      b.docNo || '',
      b.dateGenerated || '',
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      b.customerPhone || '',
      `"${(b.customerFacebook || '').replace(/"/g, '""')}"`,
      `"${(b.eventType || '').replace(/"/g, '""')}"`,
      `"${(b.location || '').replace(/"/g, '""')}"`,
      b.eventDate || '',
      `"${(b.timePeriod || '').replace(/"/g, '""')}"`,
      `"${(b.photographerCount || '').replace(/"/g, '""')}"`,
      b.selectedPackage === 'express' ? 'ส่งงานด่วน' : 'ส่งงานปกติ',
      b.totalAmount || 0,
      b.depositAmount || 0,
      b.remainingAmount || 0,
      b.status || 'รอชำระวันงาน',
      b.updatedAt || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sookjai_bookings_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  });

  // Initial Load
  loadBookings(false);
});
