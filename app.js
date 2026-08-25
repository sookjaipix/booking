/* ==========================================================================
   LensFlow - JavaScript Logic
   Features: Live Ticket Sync, Auto Balance Calculation, html2canvas, Google Calendar
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Inject Logo SVGs (Inline) to prevent tainted canvas issue on Safari/file protocol ---
    const LOGO_SVG = `<svg viewBox="0 0 5462 3875" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,3875) scale(0.1,-0.1)" fill="currentColor" stroke="none"><path d="M27555 23880 c-88 -23 -132 -42 -217 -91 -438 -256 -1086 -1000 -1910 -2194 -471 -683 -1185 -1862 -1563 -2583 -49 -94 -95 -172 -101 -172 -18 0 -56 -48 -187 -235 -343 -488 -641 -800 -882 -922 -108 -55 -251 -81 -341 -63 -61 12 -144 53 -144 71 0 6 24 42 53 82 346 468 605 1062 671 1535 32 230 16 547 -39 751 -75 279 -204 384 -475 384 -86 1 -116 -4 -165 -23 -74 -28 -177 -95 -229 -149 l-39 -40 -36 23 c-52 33 -165 76 -231 88 -79 15 -129 0 -236 -73 -385 -263 -775 -756 -1126 -1424 -168 -321 -581 -832 -840 -1039 -158 -127 -306 -189 -453 -190 -78 -1 -97 3 -145 26 -92 45 -92 34 -9 150 251 348 421 679 550 1068 135 409 163 760 89 1116 -38 186 -88 293 -169 366 -62 56 -141 87 -255 99 -169 19 -304 -26 -432 -144 l-67 -63 -84 42 c-99 50 -210 78 -269 69 -85 -12 -247 -130 -443 -320 -443 -431 -859 -1111 -1098 -1795 -191 -547 -222 -973 -91 -1249 62 -132 216 -248 384 -291 104 -27 287 -27 422 -1 352 68 728 294 1083 651 l126 126 59 -33 c175 -98 409 -108 614 -25 177 70 307 166 526 388 l151 152 -24 -96 c-43 -180 -56 -301 -50 -491 5 -195 18 -261 72 -376 59 -124 180 -224 335 -279 75 -26 101 -30 225 -34 104 -3 164 0 230 13 357 67 716 278 1082 638 l142 140 84 -42 c201 -99 447 -92 672 21 115 58 240 154 389 298 82 80 146 136 142 125 -113 -283 -170 -475 -188 -641 -10 -90 -10 -109 6 -168 33 -121 113 -218 225 -273 140 -69 359 -2 392 121 6 21 65 129 131 240 283 471 593 927 851 1253 l104 133 17 -88 c92 -474 275 -995 432 -1234 95 -142 247 -256 396 -294 262 -69 502 50 899 446 403 402 706 787 943 1201 54 94 66 121 60 143 -8 32 -56 60 -88 52 -36 -9 -172 -158 -431 -470 -483 -583 -623 -736 -741 -816 -95 -63 -159 -84 -259 -85 -70 0 -88 4 -139 30 -142 73 -221 214 -325 583 -36 128 -131 564 -131 603 0 12 24 17 128 27 239 21 434 74 637 171 437 210 786 579 911 961 24 75 28 101 28 220 1 126 -1 139 -26 196 -163 368 -390 444 -705 235 -124 -82 -190 -141 -629 -563 -552 -530 -494 -479 -535 -468 -157 46 -428 -230 -471 -479 -12 -69 -17 -80 -64 -130 -169 -185 -548 -651 -744 -914 -52 -70 -96 -124 -98 -119 -4 12 92 280 173 487 116 296 386 905 429 966 6 9 83 72 171 139 574 442 1573 1298 2240 1919 881 821 1467 1448 1655 1771 84 144 97 229 49 322 -91 179 -516 458 -818 538 -92 24 -145 24 -236 0z m500 -530 c89 -46 118 -147 75 -264 -45 -118 -192 -322 -419 -580 -233 -266 -1010 -1029 -1646 -1617 -346 -320 -924 -834 -1204 -1073 l-25 -21 16 25 c8 14 68 113 133 220 656 1080 1325 2006 1891 2615 370 398 642 613 878 697 107 38 224 37 301 -2z m-8865 -3198 c14 -10 39 -45 55 -77 29 -58 30 -64 29 -195 -1 -158 -23 -299 -89 -554 -115 -448 -306 -940 -476 -1226 l-62 -105 -19 65 c-79 274 -90 718 -28 1123 43 283 125 567 211 737 107 209 269 308 379 232z m3346 9 c116 -53 135 -271 58 -648 -71 -347 -255 -889 -410 -1208 -64 -132 -156 -288 -169 -287 -12 1 -40 101 -60 212 -88 507 15 1288 223 1695 60 117 155 216 228 238 65 20 81 20 130 -2z m4059 -26 c21 -20 25 -34 25 -80 0 -83 -16 -138 -76 -260 -190 -388 -695 -825 -1076 -930 l-48 -13 0 26 c0 14 -9 84 -21 155 l-21 130 159 159 c209 211 653 633 735 701 151 124 271 165 323 112z m-8296 -555 c-32 -102 -71 -290 -91 -440 -21 -152 -17 -628 5 -765 37 -221 95 -412 173 -568 24 -48 44 -92 44 -96 0 -13 -93 -126 -213 -259 -190 -211 -393 -376 -562 -457 -112 -54 -192 -75 -286 -75 -118 1 -175 36 -221 135 -21 47 -23 62 -22 225 3 364 103 708 344 1185 213 420 462 784 773 1128 44 48 81 86 83 84 2 -1 -10 -45 -27 -97z m3367 8 c-59 -192 -91 -384 -108 -650 -18 -282 4 -543 68 -793 28 -112 101 -303 146 -382 l30 -53 -88 -107 c-118 -145 -368 -393 -479 -476 -103 -77 -283 -170 -370 -192 -142 -36 -272 -10 -320 64 -49 74 -58 116 -58 271 1 367 115 749 372 1245 158 304 341 583 578 880 73 90 246 284 251 280 2 -2 -8 -41 -22 -87z"/><path d="M35040 23894 c-925 -62 -1588 -193 -2510 -496 -1075 -353 -1980 -768 -2715 -1246 -224 -145 -391 -277 -547 -432 -214 -213 -313 -377 -325 -544 -5 -60 -2 -80 19 -132 34 -83 84 -159 156 -235 166 -178 333 -179 699 -6 73 34 131 67 129 72 -3 12 -193 12 -358 0 -114 -8 -118 -7 -118 12 0 32 50 93 213 260 336 344 751 665 1287 995 835 514 1658 900 2545 1191 1036 341 1938 411 2430 187 229 -103 397 -299 478 -556 131 -414 30 -1049 -284 -1802 -175 -420 -402 -871 -665 -1324 l-79 -137 -93 -42 c-100 -45 -643 -325 -857 -441 -1328 -722 -2374 -1413 -3165 -2090 -361 -309 -930 -860 -1208 -1171 -548 -612 -896 -1132 -1051 -1572 -92 -259 -95 -519 -8 -668 34 -58 114 -130 180 -161 175 -82 452 -86 752 -11 680 172 1483 628 2410 1370 889 711 1653 1493 2296 2350 457 609 1020 1464 1380 2100 81 143 157 272 168 286 58 74 493 198 654 186 61 -4 76 -9 129 -46 74 -53 113 -61 151 -31 15 12 34 35 43 51 17 34 20 122 5 161 -13 34 -64 72 -126 93 -105 37 -413 30 -612 -14 -46 -10 -83 -16 -83 -13 0 2 29 57 64 121 224 408 448 903 570 1259 256 748 278 1314 68 1726 -87 170 -243 345 -401 450 -216 144 -514 239 -886 282 -123 14 -614 26 -735 18z m44 -4810 c-461 -823 -970 -1613 -1378 -2134 -644 -824 -1520 -1631 -2425 -2235 -282 -188 -445 -285 -671 -399 -397 -201 -654 -283 -864 -274 -202 8 -287 83 -287 252 0 200 117 450 389 832 230 324 520 652 953 1079 1101 1084 2287 1959 3724 2745 193 106 668 350 673 346 1 -2 -50 -97 -114 -212z"/><path d="M17320 23733 c-668 -47 -1397 -219 -2180 -515 -575 -218 -1138 -502 -1580 -798 -671 -449 -1096 -873 -1319 -1316 -142 -282 -199 -530 -188 -819 6 -168 19 -229 77 -351 56 -120 112 -198 219 -304 308 -305 603 -460 1633 -861 902 -351 1254 -552 1370 -786 128 -257 28 -527 -322 -873 -196 -194 -395 -331 -703 -484 -412 -203 -809 -323 -1334 -400 -258 -38 -415 -49 -693 -50 -275 -1 -402 10 -593 50 -361 76 -549 209 -550 389 -2 162 223 355 668 576 350 173 664 297 1216 480 179 59 337 113 351 119 61 28 61 94 1 132 -53 32 -137 29 -348 -17 -842 -180 -1418 -377 -1817 -618 -355 -216 -538 -473 -538 -757 1 -100 11 -153 47 -229 32 -66 134 -171 216 -219 523 -312 1640 -306 2842 14 471 126 1045 354 1418 565 131 74 387 245 487 325 255 205 481 469 581 677 56 119 72 193 67 304 -7 132 -49 216 -161 328 -196 196 -502 339 -1307 610 -573 193 -854 303 -1115 435 -576 291 -837 590 -862 990 -24 379 147 810 466 1178 276 320 734 676 1216 946 673 378 1579 684 2305 780 444 59 929 44 1195 -35 152 -45 291 -144 335 -236 60 -128 6 -317 -151 -526 -346 -459 -1548 -1300 -2378 -1663 -157 -69 -203 -97 -257 -156 -25 -28 -34 -47 -32 -66 l3 -27 95 1 c136 2 448 74 760 175 768 250 1508 734 1933 1264 297 371 437 705 437 1045 0 168 -43 284 -146 398 -164 182 -426 287 -799 322 -100 9 -453 11 -565 3z"/><path d="M42695 21385 c-95 -45 -229 -84 -380 -109 -134 -23 -350 -38 -431 -30 l-71 6 -12 -32 c-50 -144 50 -432 171 -496 15 -8 51 -14 80 -14 115 1 219 75 601 429 111 103 180 174 186 194 22 60 8 98 -33 96 -12 0 -61 -20 -111 -44z"/><path d="M39315 20484 c-632 -67 -1396 -571 -1862 -1229 -154 -217 -333 -522 -464 -789 -198 -403 -288 -730 -276 -1006 8 -193 49 -311 142 -405 132 -134 331 -201 508 -170 307 54 608 366 1292 1345 199 285 382 532 444 600 l41 45 -60 -127 c-208 -444 -330 -804 -376 -1113 -25 -172 -24 -405 4 -507 28 -102 64 -171 120 -227 158 -158 405 -138 707 57 230 148 583 492 870 847 49 61 85 101 81 90 -20 -51 -65 -250 -76 -339 -15 -119 -8 -327 14 -409 66 -244 257 -379 491 -346 244 34 491 202 884 605 395 404 952 1167 987 1351 13 70 -37 131 -99 119 -47 -9 -85 -52 -334 -386 -121 -162 -275 -365 -343 -450 -362 -457 -768 -734 -940 -641 -59 31 -74 70 -78 196 -3 96 0 125 26 225 56 217 155 462 341 845 178 366 361 676 474 802 115 129 138 307 60 470 -50 107 -166 193 -257 193 -38 0 -105 -30 -129 -57 -37 -42 -221 -411 -514 -1033 -128 -271 -138 -288 -203 -356 -37 -40 -200 -238 -362 -440 -308 -386 -500 -609 -609 -708 -249 -227 -442 -255 -506 -73 -14 42 -18 81 -17 197 3 349 131 708 504 1407 68 130 70 134 70 206 0 40 -7 96 -15 123 -34 114 -174 266 -300 326 -58 27 -126 36 -152 20 -6 -4 -44 -72 -85 -152 -229 -449 -666 -1073 -1064 -1520 -335 -375 -739 -731 -903 -794 -24 -9 -67 -17 -94 -18 -41 0 -54 5 -76 26 -25 26 -26 30 -25 139 1 91 6 128 27 199 90 296 228 559 522 994 452 671 792 1048 1162 1288 239 155 457 239 689 266 171 20 330 -16 525 -120 52 -27 104 -50 117 -50 13 0 34 11 47 25 50 49 23 150 -61 224 -157 138 -615 262 -869 235z"/><path d="M37360 15966 c-107 -33 -193 -88 -277 -178 -88 -96 -150 -218 -110 -218 8 0 47 30 86 66 39 36 71 63 71 60 0 -3 -16 -48 -35 -101 -42 -118 -118 -381 -142 -495 -10 -51 -17 -130 -18 -197 0 -98 3 -115 21 -140 31 -42 64 -50 109 -27 62 31 95 105 139 307 6 24 11 27 50 27 70 0 190 36 289 87 121 63 229 167 277 267 92 196 21 432 -157 517 -59 28 -80 33 -163 35 -60 2 -112 -2 -140 -10z m111 -146 c20 -6 57 -29 83 -51 115 -101 91 -260 -65 -423 -68 -73 -164 -134 -233 -150 l-28 -7 6 78 c3 43 8 141 11 218 3 77 8 180 11 228 6 88 7 89 38 103 37 16 126 18 177 4z"/><path d="M38952 15727 c-46 -26 -69 -85 -51 -136 13 -37 35 -51 83 -51 73 0 116 42 116 115 0 70 -80 109 -148 72z"/><path d="M40542 15429 c-93 -96 -138 -136 -143 -127 -3 7 -21 56 -39 108 -40 122 -53 142 -88 138 -61 -7 -80 -150 -47 -342 l15 -86 -75 -93 c-81 -100 -145 -210 -145 -250 0 -65 102 -28 219 78 l74 67 65 -66 c70 -72 159 -122 234 -132 80 -11 174 31 166 74 -2 9 -25 27 -52 40 -67 32 -111 69 -178 153 l-57 72 53 76 c107 152 195 352 182 407 -13 49 -44 29 -184 -117z"/><path d="M38925 15438 c-84 -98 -169 -427 -150 -573 25 -179 145 -193 217 -25 68 159 85 478 30 590 -24 49 -60 52 -97 8z"/><path d="M41634 14896 c-70 -70 -20 -171 86 -171 106 0 156 101 86 171 -30 30 -40 34 -86 34 -46 0 -56 -4 -86 -34z"/></g></svg>`;
    
    // Inject inline SVGs to prevent tainted canvas issue on Safari/file protocol
    document.querySelectorAll('.brand-logo-img, .ticket-logo-img').forEach(el => {
        el.innerHTML = LOGO_SVG;
    });

    // --- DOM Elements Selection ---
    // Form Inputs
    const form = document.getElementById('booking-form');
    const clientNameInput = document.getElementById('client-name');
    const clientPhoneInput = document.getElementById('client-phone');
    const clientFacebookInput = document.getElementById('client-facebook');
    const bookingDateInput = document.getElementById('booking-date');
    const bookingLocationInput = document.getElementById('booking-location');
    const jobTypeValueInput = document.getElementById('job-type-value');
    const photographerCountInput = document.getElementById('photographer-count');
    const bookingTimeInput = document.getElementById('booking-time');
    const additionalNotesInput = document.getElementById('additional-notes');
    const totalPriceInput = document.getElementById('total-price');
    const depositPriceInput = document.getElementById('deposit-price');
    const balancePriceInput = document.getElementById('balance-price');
    const bookingDateTbdCheckbox = document.getElementById('booking-date-tbd');

    // Stepper & Cards & Chips
    const stepDecBtn = document.getElementById('step-dec');
    const stepIncBtn = document.getElementById('step-inc');
    const jobCards = document.querySelectorAll('.job-card');
    const timeChips = document.querySelectorAll('.time-chip');
    
    // Service Option Selection
    const serviceOptionValueInput = document.getElementById('service-option-value');
    const serviceCards = document.querySelectorAll('.service-card');
    const previewServiceOption = document.getElementById('preview-service-option');
    const previewInclusionsList = document.getElementById('preview-inclusions-list');

    // Ticket Preview Elements
    const previewBookingId = document.getElementById('preview-booking-id');
    const previewName = document.getElementById('preview-name');
    const previewPhone = document.getElementById('preview-phone');
    const previewDate = document.getElementById('preview-date');
    const previewTime = document.getElementById('preview-time');
    const previewLocation = document.getElementById('preview-location');
    const previewJobType = document.getElementById('preview-job-type');
    const previewPhotographerCount = document.getElementById('preview-photographer-count');
    const previewNotes = document.getElementById('preview-notes');
    const previewNotesContainer = document.getElementById('preview-notes-container');
    const previewTotal = document.getElementById('preview-total');
    const previewDeposit = document.getElementById('preview-deposit');
    const previewBalance = document.getElementById('preview-balance');

    // Action Buttons
    const btnSaveImage = document.getElementById('btn-save-image');
    const btnSaveCalendar = document.getElementById('btn-save-calendar');
    const btnSaveSystem = document.getElementById('btn-save-system');
    const btnClearAll = document.getElementById('btn-clear-all');

    // Dashboard Elements
    const dbCountTotal = document.getElementById('db-count-total');
    const dbSumTotal = document.getElementById('db-sum-total');
    const dbSumDeposit = document.getElementById('db-sum-deposit');
    const dbSumBalance = document.getElementById('db-sum-balance');
    const bookingsTableBody = document.getElementById('bookings-table-body');
    const dbMonthlyTableBody = document.getElementById('db-monthly-table-body');
    const toastContainer = document.getElementById('toast-container');
    const searchDateInput = document.getElementById('search-date');
    const btnClearSearch = document.getElementById('btn-clear-search');



    // --- State Variables ---
    // Generate a fixed 3-digit random suffix for the Booking ID on load
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    let previousDateVal = ''; // store date if toggled TBD
    let dbMode = 'api'; // 'api' or 'local'

    // Set default date to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    bookingDateInput.value = tomorrowStr;

    // --- Google Sheets Connection Config (Google Apps Script Web App URL or Sheetbest URL) ---
    const GOOGLE_SCRIPT_URL = 'https://api.sheetbest.com/sheets/0e4d686d-0ae9-4143-96f1-19ae084b900f'; // REPLACE WITH YOUR GOOGLE WEB APP URL

    // Helper to determine if we are using Google Apps Script or Sheetbest
    function isGoogleScriptUrl() {
        return GOOGLE_SCRIPT_URL.includes('script.google.com');
    }

    // Translate English property keys to Thai columns in Google Sheets
    function serializeBooking(booking) {
        const serviceOption = booking.serviceOption || "รับภาพด่วน";
        return {
            "ชื่อผู้จอง": booking.clientName || "",
            "เบอร์ติดต่อ": booking.clientPhone || "",
            "ลิงก์ Facebook": booking.clientFacebook || "",
            "จองคิวงานวันที่": booking.date || "",
            "สถานที่": booking.location || "",
            "ประเภทงาน": booking.jobType || "",
            "จำนวนช่างภาพ": booking.photographers || "",
            "ช่วงเวลา": booking.timeSlot || "",
            "รับภาพด่วน": serviceOption === "รับภาพด่วน" ? "✓" : "",
            "รับภาพปกติ": serviceOption === "รับภาพปกติ" ? "✓" : "",
            "ข้อมูลเพิ่มเติม": booking.notes || "",
            "ยอดรวม": booking.total || 0,
            "มัดจำ": booking.deposit || 0,
            "คงเหลือ": booking.balance || 0,
            "id": booking.id || "",
            "timestamp": booking.timestamp || new Date().getTime()
        };
    }

    // Translate Google Sheets Thai columns back to English property keys
    function deserializeBooking(row) {
        let serviceOption = "รับภาพด่วน";
        if (row["รับภาพปกติ"] === "✓") {
            serviceOption = "รับภาพปกติ";
        } else if (row["รับภาพด่วน"] === "✓") {
            serviceOption = "รับภาพด่วน";
        }

        return {
            id: row["id"] || "",
            clientName: row["ชื่อผู้จอง"] || "",
            clientPhone: row["เบอร์ติดต่อ"] || "",
            clientFacebook: row["ลิงก์ Facebook"] || "",
            date: row["จองคิวงานวันที่"] || "ยังไม่ระบุ",
            location: row["สถานที่"] || "",
            jobType: row["ประเภทงาน"] || "ซ้อมใหญ่",
            photographers: row["จำนวนช่างภาพ"] || "1",
            timeSlot: row["ช่วงเวลา"] || "",
            serviceOption: serviceOption,
            notes: row["ข้อมูลเพิ่มเติม"] || "",
            total: parseFloat(row["ยอดรวม"]) || 0,
            deposit: parseFloat(row["มัดจำ"]) || 0,
            balance: parseFloat(row["คงเหลือ"]) || 0,
            timestamp: parseInt(row["timestamp"]) || new Date().getTime()
        };
    }
    
    // Format Issue Date & Time (Buddhist Era and local time of export)
    function updateIssueTimestamp() {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }) + ' น.';
        
        const previewIssueDatetime = document.getElementById('preview-issue-datetime');
        if (previewIssueDatetime) {
            previewIssueDatetime.innerText = `${formattedDate}, ${formattedTime}`;
        }
    }

    // Format currency with commas (e.g. 3,500)
    function formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH').format(amount);
    }

    // Format Date to Thai short style (e.g. 17 มิ.ย. 2569)
    function formatThaiDate(dateString) {
        if (bookingDateTbdCheckbox && bookingDateTbdCheckbox.checked) {
            return 'ยังไม่ระบุวันถ่ายภาพ';
        }
        if (!dateString) return 'ยังไม่ระบุวันถ่ายภาพ';
        
        // Parse date strictly in local time zone to avoid TZ shifts
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        
        // Native Thai formatter with Buddhist Era (พ.ศ.)
        return dateObj.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Update Remaining Balance automatically
    function updateCalculations() {
        const total = parseFloat(totalPriceInput.value) || 0;
        const deposit = parseFloat(depositPriceInput.value) || 0;
        const balance = Math.max(0, total - deposit);

        balancePriceInput.value = balance;

        // Sync values to Ticket Preview
        previewTotal.innerText = `฿${formatCurrency(total)}`;
        previewDeposit.innerText = `฿${formatCurrency(deposit)}`;
        previewBalance.innerText = `฿${formatCurrency(balance)}`;
    }

    // Generate/Update Booking ID
    function updateBookingId() {
        if (bookingDateTbdCheckbox && bookingDateTbdCheckbox.checked) {
            previewBookingId.innerText = `SJP-PENDING-${randomSuffix}`;
            return;
        }
        const dateVal = bookingDateInput.value;
        const formattedDate = dateVal ? dateVal.replace(/-/g, '') : 'PENDING';
        const finalBookingId = `SJP-${formattedDate}-${randomSuffix}`;
        
        previewBookingId.innerText = finalBookingId;
    }

    // Inclusions data for dynamic ticket preview
    const INCLUSIONS_DATA = {
        "รับภาพด่วน": [
            "ถ่ายภาพไม่จำกัดจำนวนภาพ",
            "ปรับแสงสีทุกภาพที่ส่ง",
            "ส่งภาพทาง Google Photos",
            "ช่วยจัดท่าทางและแนะนำสถานที่ถ่ายภาพ",
            "หลังถ่ายเสร็จไม่เกิน 5 วัน รับภาพทั้งหมด"
        ],
        "รับภาพปกติ": [
            "ถ่ายไม่จำกัดจำนวนภาพ",
            "ปรับแสงสีทุกภาพที่ส่ง",
            "ส่งภาพทาง Google Photos",
            "ชุดไฟส่องสว่างบริเวณจุดถ่าย",
            "หลังจบงาน 2-3 วันรับภาพตัวอย่าง",
            "หลังจบงานไม่เกิน 2 สัปดาห์ รับภาพทั้งหมด"
        ]
    };

    // Update dynamic Inclusions list on ticket
    function updateInclusions() {
        const selectedOption = serviceOptionValueInput ? serviceOptionValueInput.value : "รับภาพด่วน";
        if (previewServiceOption) {
            previewServiceOption.innerText = selectedOption;
        }
        if (previewInclusionsList) {
            previewInclusionsList.innerHTML = '';
            const items = INCLUSIONS_DATA[selectedOption] || [];
            items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${item}`;
                previewInclusionsList.appendChild(li);
            });
        }
    }

    // --- Dashboard & SQLite API Logic ---
    let bookingsList = [];

    // Show float toast notification
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        let iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-circle-xmark';
        if (type === 'info') iconClass = 'fa-circle-info';
        
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 50);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // Load bookings from SQLite Database API
    function loadBookingsFromStorage() {
        const fetchUrl = isGoogleScriptUrl()
            ? `${GOOGLE_SCRIPT_URL}?action=read`
            : GOOGLE_SCRIPT_URL;

        return fetch(fetchUrl)
            .then(res => {
                if (!res.ok) throw new Error("API response error");
                return res.json();
            })
            .then(data => {
                const rawList = data || [];
                // Filter out empty rows or header rows if any
                const validRows = rawList.filter(row => row.id || row['ชื่อผู้จอง']);
                bookingsList = validRows.map(deserializeBooking);
                dbMode = 'api';
                updateOnlineStatus();
                // Save fallback copy
                try {
                    localStorage.setItem('sjp_bookings_fallback', JSON.stringify(bookingsList));
                } catch (e) {
                    console.error("Failed to write to localStorage fallback:", e);
                }
                updateDashboardStats();
                renderBookingsTable();
            })
            .catch(err => {
                console.warn("Cannot connect to SQLite API. Switching to Local DB Mode:", err);
                dbMode = 'local';
                updateOnlineStatus();
                
                const fallbackData = localStorage.getItem('sjp_bookings_fallback');
                if (fallbackData) {
                    try {
                        bookingsList = JSON.parse(fallbackData) || [];
                    } catch (e) {
                        bookingsList = [];
                    }
                } else {
                    bookingsList = [];
                }
                updateDashboardStats();
                renderBookingsTable();
            });
    }

    // Update Dashboard Statistics Cards
    function updateDashboardStats() {
        const count = bookingsList.length;
        const totalSum = bookingsList.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const depositSum = bookingsList.reduce((sum, item) => sum + parseFloat(item.deposit), 0);
        const balanceSum = bookingsList.reduce((sum, item) => sum + parseFloat(item.balance), 0);

        if (dbCountTotal) dbCountTotal.innerText = `${count} คิว`;
        if (dbSumTotal) dbSumTotal.innerText = `฿${formatCurrency(totalSum)}`;
        if (dbSumDeposit) dbSumDeposit.innerText = `฿${formatCurrency(depositSum)}`;
        if (dbSumBalance) dbSumBalance.innerText = `฿${formatCurrency(balanceSum)}`;
        
        // Render monthly summary table
        renderMonthlySummary();
    }

    // Render Monthly Summary Table grouped by month (Thai Buddhist Era format)
    function renderMonthlySummary() {
        if (!dbMonthlyTableBody) return;
        
        if (bookingsList.length === 0) {
            dbMonthlyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted" style="padding: 20px;">ไม่มีข้อมูลการจองรายเดือน</td>
                </tr>
            `;
            return;
        }

        const monthlyData = {};
        
        bookingsList.forEach(item => {
            let monthKey = 'TBD';
            let monthName = 'ยังไม่ระบุวันถ่ายภาพ';
            
            if (item.date && item.date !== 'ยังไม่ระบุ') {
                const parts = item.date.split('-');
                if (parts.length === 3) {
                    const yearBE = parseInt(parts[0]) + 543;
                    const monthIndex = parseInt(parts[1]) - 1;
                    const monthsThai = [
                        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                    ];
                    monthKey = `${parts[0]}-${parts[1]}`;
                    monthName = `${monthsThai[monthIndex]} ${yearBE}`;
                }
            }
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    key: monthKey,
                    monthName: monthName,
                    count: 0,
                    total: 0,
                    deposit: 0,
                    balance: 0
                };
            }
            
            monthlyData[monthKey].count += 1;
            monthlyData[monthKey].total += parseFloat(item.total) || 0;
            monthlyData[monthKey].deposit += parseFloat(item.deposit) || 0;
            monthlyData[monthKey].balance += parseFloat(item.balance) || 0;
        });

        // Convert to array and sort descending by month key (TBD goes to the end)
        const sortedMonths = Object.values(monthlyData).sort((a, b) => {
            if (a.key === 'TBD') return 1;
            if (b.key === 'TBD') return -1;
            return b.key.localeCompare(a.key);
        });

        dbMonthlyTableBody.innerHTML = '';
        sortedMonths.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${item.monthName}</td>
                <td style="font-family: 'Inter', sans-serif; font-weight: 500;">${item.count} งาน</td>
                <td style="font-family: 'Inter', sans-serif; font-weight: 600;">฿${formatCurrency(item.total)}</td>
                <td style="font-family: 'Inter', sans-serif; color: var(--secondary-color);">฿${formatCurrency(item.deposit)}</td>
                <td style="font-family: 'Inter', sans-serif; font-weight: 600; color: var(--accent-warning);">฿${formatCurrency(item.balance)}</td>
            `;
            dbMonthlyTableBody.appendChild(tr);
        });
    }

    // Render Recent Bookings Table
    function renderBookingsTable() {
        if (!bookingsTableBody) return;
        
        let filteredList = [...bookingsList];
        const hasSearch = searchDateInput && searchDateInput.value;
        if (hasSearch) {
            const queryDate = searchDateInput.value; // YYYY-MM-DD
            filteredList = filteredList.filter(item => item.date === queryDate);
        }

        if (filteredList.length === 0) {
            bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted" style="padding: 20px;">
                        ${hasSearch ? 'ไม่พบข้อมูลการจองในวันที่ระบุ' : 'ไม่มีข้อมูลการจองที่บันทึกไว้'}
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date descending
        const sortedList = filteredList.sort((a, b) => {
            if (a.date === 'ยังไม่ระบุ' || !a.date) return 1;
            if (b.date === 'ยังไม่ระบุ' || !b.date) return -1;
            return b.date.localeCompare(a.date);
        });

        bookingsTableBody.innerHTML = '';
        sortedList.forEach(item => {
            const tr = document.createElement('tr');
            
            // Format Thai Date for display
            let dateDisplay = 'ยังไม่ระบุ';
            if (item.date && item.date !== 'ยังไม่ระบุ') {
                dateDisplay = formatThaiDate(item.date);
            }

            // Select badge styles depending on type
            let badgeClass = 'badge-table';
            let badgeStyle = '';
            if (item.jobType === 'ซ้อมใหญ่') {
                badgeStyle = 'border-color: rgba(6, 182, 212, 0.3); color: #0891b2; background: rgba(6, 182, 212, 0.05);';
            } else if (item.jobType === 'รับจริง') {
                badgeStyle = 'border-color: rgba(236, 72, 153, 0.3); color: #db2777; background: rgba(236, 72, 153, 0.05);';
            } else if (item.jobType === 'ถ่ายพอร์ตโฟลิโอ') {
                badgeStyle = 'border-color: rgba(16, 185, 129, 0.3); color: #059669; background: rgba(16, 185, 129, 0.05);';
            } else if (item.jobType === 'รับหมวก/รับทานสคริป') {
                badgeStyle = 'border-color: rgba(124, 58, 237, 0.3); color: #7c3aed; background: rgba(124, 58, 237, 0.05);';
            } else if (item.jobType === 'งานแต่งงาน') {
                badgeStyle = 'border-color: rgba(244, 63, 94, 0.3); color: #e11d48; background: rgba(244, 63, 94, 0.05);';
            } else if (item.jobType === 'งานอุปสมบท') {
                badgeStyle = 'border-color: rgba(245, 158, 11, 0.3); color: #d97706; background: rgba(245, 158, 11, 0.05);';
            } else if (item.jobType === 'งานฌาปนกิจ') {
                badgeStyle = 'border-color: rgba(100, 116, 139, 0.3); color: #475569; background: rgba(100, 116, 139, 0.05);';
            } else if (item.jobType === 'งานสัมมนา/งาน Event') {
                badgeStyle = 'border-color: rgba(20, 184, 166, 0.3); color: #0d9488; background: rgba(20, 184, 166, 0.05);';
            }

            tr.innerHTML = `
                <td style="font-family: 'Inter', sans-serif; font-weight: 500;">${item.id}</td>
                <td style="font-weight: 500;">${item.clientName}</td>
                <td><span class="${badgeClass}" style="${badgeStyle}">${item.jobType}</span></td>
                <td>${dateDisplay}</td>
                <td style="font-family: 'Inter', sans-serif;">฿${formatCurrency(item.total)}</td>
                <td style="font-family: 'Inter', sans-serif; color: var(--secondary-color);">฿${formatCurrency(item.deposit)}</td>
                <td style="font-family: 'Inter', sans-serif; font-weight: 600; color: var(--accent-warning);">฿${formatCurrency(item.balance)}</td>
                <td>
                    <button type="button" class="btn-table-action btn-load" data-id="${item.id}" title="โหลดมาแก้ไข"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" class="btn-table-action btn-delete" data-id="${item.id}" title="ลบ"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            bookingsTableBody.appendChild(tr);
        });

        // Attach event listeners to Load and Delete buttons in the table
        bookingsTableBody.querySelectorAll('.btn-load').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                loadBookingIntoForm(id);
            });
        });

        bookingsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`คุณต้องการลบข้อมูลการจองรหัส ${id} ใช่หรือไม่?`)) {
                    deleteBooking(id);
                }
            });
        });
    }

    // Save/Update current form values to SQLite Database API
    function saveCurrentBooking() {
        // Validate form fields
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const clientName = clientNameInput.value.trim();
        const clientPhone = clientPhoneInput.value.trim();
        const clientFacebook = clientFacebookInput ? clientFacebookInput.value.trim() : '';
        const dateVal = bookingDateInput.value || 'ยังไม่ระบุ';
        const isTbd = bookingDateTbdCheckbox && bookingDateTbdCheckbox.checked;
        const location = bookingLocationInput.value.trim();
        const jobType = jobTypeValueInput.value;
        const photographers = photographerCountInput.value;
        const timeSlot = bookingTimeInput.value.trim();
        const notes = additionalNotesInput.value.trim();
        
        const total = parseFloat(totalPriceInput.value) || 0;
        const deposit = parseFloat(depositPriceInput.value) || 0;
        const balance = Math.max(0, total - deposit);
        
        const bookingId = previewBookingId.innerText.trim();

        const bookingData = {
            id: bookingId,
            clientName,
            clientPhone,
            clientFacebook,
            date: isTbd ? 'ยังไม่ระบุ' : dateVal,
            location,
            jobType,
            photographers,
            timeSlot,
            notes,
            total,
            deposit,
            balance,
            timestamp: new Date().getTime(),
            serviceOption: serviceOptionValueInput ? serviceOptionValueInput.value : 'รับภาพด่วน'
        };

        const existingIndex = bookingsList.findIndex(item => item.id === bookingId);
        const isUpdate = existingIndex > -1;
        
        const isGas = isGoogleScriptUrl();
        const serialized = serializeBooking(bookingData);
        
        const fetchUrl = isGas 
            ? GOOGLE_SCRIPT_URL 
            : (isUpdate ? `${GOOGLE_SCRIPT_URL}/id/${bookingId}` : GOOGLE_SCRIPT_URL);
            
        const fetchOptions = isGas
            ? {
                method: 'POST',
                body: JSON.stringify({
                    action: isUpdate ? 'update' : 'create',
                    id: bookingId,
                    data: serialized
                })
              }
            : {
                method: isUpdate ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(serialized)
              };

        fetch(fetchUrl, fetchOptions)
        .then(res => {
            if (!res.ok) throw new Error("API post failed");
            return res.json();
        })
        .then(data => {
            if (isUpdate) {
                bookingsList[existingIndex] = bookingData;
                showToast(`อัปเดตข้อมูลการจองรหัส ${bookingId} เรียบร้อยแล้ว`, 'success');
            } else {
                bookingsList.push(bookingData);
                showToast(`บันทึกคิวงานรหัส ${bookingId} เข้าระบบเรียบร้อยแล้ว`, 'success');
            }
            try {
                localStorage.setItem('sjp_bookings_fallback', JSON.stringify(bookingsList));
            } catch (e) {}
            return loadBookingsFromStorage();
        })
        .catch(err => {
            console.warn("SQLite API error, saving to local fallback:", err);
            const wasApi = dbMode === 'api';
            dbMode = 'local';
            updateOnlineStatus();
            
            if (isUpdate) {
                bookingsList[existingIndex] = bookingData;
                showToast(wasApi ? `อัปเดตข้อมูลรหัส ${bookingId} ในเครื่องชั่วคราว (ออฟไลน์)` : `อัปเดตข้อมูลการจองรหัส ${bookingId} เรียบร้อยแล้ว`, wasApi ? 'info' : 'success');
            } else {
                bookingsList.push(bookingData);
                showToast(wasApi ? `บันทึกคิวงานรหัส ${bookingId} ในเครื่องชั่วคราว (ออฟไลน์)` : `บันทึกคิวงานรหัส ${bookingId} เรียบร้อยแล้ว`, wasApi ? 'info' : 'success');
            }
            try {
                localStorage.setItem('sjp_bookings_fallback', JSON.stringify(bookingsList));
            } catch (e) {}
            updateDashboardStats();
            renderBookingsTable();
        });

        return true;
    }

    // Load stored booking into active form inputs
    function loadBookingIntoForm(bookingId) {
        const item = bookingsList.find(b => b.id === bookingId);
        if (!item) return;

        clientNameInput.value = item.clientName;
        clientPhoneInput.value = item.clientPhone;
        if (clientFacebookInput) clientFacebookInput.value = item.clientFacebook || '';
        bookingLocationInput.value = item.location;
        photographerCountInput.value = item.photographers;
        bookingTimeInput.value = item.timeSlot;
        additionalNotesInput.value = item.notes || '';
        totalPriceInput.value = item.total;
        depositPriceInput.value = item.deposit;
        balancePriceInput.value = item.balance;
        
        // Handle service option packages selection
        const serviceOpt = item.serviceOption || 'รับภาพด่วน';
        if (serviceOptionValueInput) {
            serviceOptionValueInput.value = serviceOpt;
        }
        serviceCards.forEach(card => {
            if (card.getAttribute('data-option') === serviceOpt) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Handle Date TBD checkbox
        if (bookingDateTbdCheckbox) {
            const wrapper = bookingDateInput.closest('.input-icon-wrapper');
            if (item.date === 'ยังไม่ระบุ') {
                bookingDateTbdCheckbox.checked = true;
                bookingDateInput.value = '';
                bookingDateInput.disabled = true;
                bookingDateInput.required = false;
                if (wrapper) wrapper.classList.add('disabled-field');
            } else {
                bookingDateTbdCheckbox.checked = false;
                bookingDateInput.disabled = false;
                bookingDateInput.required = true;
                bookingDateInput.value = item.date;
                if (wrapper) wrapper.classList.remove('disabled-field');
            }
        } else {
            bookingDateInput.value = item.date === 'ยังไม่ระบุ' ? '' : item.date;
        }

        // Set active Job Card
        jobCards.forEach(card => {
            if (card.getAttribute('data-type') === item.jobType) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        jobTypeValueInput.value = item.jobType;

        // Force full preview sync
        syncFormToTicket();
        
        // Manually overwrite booking ID to match the loaded one
        previewBookingId.innerText = item.id;
        
        showToast(`โหลดข้อมูลการจองรหัส ${item.id} มาฟอร์มสำเร็จ`, 'info');
        
        // Smooth scroll to top of form
        window.scrollTo({
            top: form.getBoundingClientRect().top + window.scrollY - 40,
            behavior: 'smooth'
        });
    }

    // Delete booking from storage
    function deleteBooking(bookingId) {
        const isGas = isGoogleScriptUrl();
        const fetchUrl = isGas 
            ? GOOGLE_SCRIPT_URL 
            : `${GOOGLE_SCRIPT_URL}/id/${bookingId}`;
            
        const fetchOptions = isGas
            ? {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    id: bookingId
                })
              }
            : {
                method: 'DELETE'
              };

        fetch(fetchUrl, fetchOptions)
        .then(res => {
            if (!res.ok) throw new Error("API delete failed");
            return res.json();
        })
        .then(data => {
            const index = bookingsList.findIndex(item => item.id === bookingId);
            if (index > -1) {
                bookingsList.splice(index, 1);
            }
            try {
                localStorage.setItem('sjp_bookings_fallback', JSON.stringify(bookingsList));
            } catch (e) {}
            return loadBookingsFromStorage();
        })
        .then(() => {
            showToast(`ลบข้อมูลการจองรหัส ${bookingId} สำเร็จ`, 'info');
        })
        .catch(err => {
            console.warn("SQLite API delete error, deleting from fallback:", err);
            const wasApi = dbMode === 'api';
            dbMode = 'local';
            updateOnlineStatus();
            
            const index = bookingsList.findIndex(item => item.id === bookingId);
            if (index > -1) {
                bookingsList.splice(index, 1);
                try {
                    localStorage.setItem('sjp_bookings_fallback', JSON.stringify(bookingsList));
                } catch (e) {}
                showToast(wasApi ? `ลบข้อมูลรหัส ${bookingId} จากเครื่องชั่วคราว (ออฟไลน์)` : `ลบข้อมูลการจองรหัส ${bookingId} สำเร็จ`, wasApi ? 'info' : 'success');
            } else {
                showToast(`ไม่สามารถลบข้อมูลการจองรหัส ${bookingId} ได้`, 'error');
            }
            updateDashboardStats();
            renderBookingsTable();
        });
    }

    // Function to sync only Job Type Badge style and text
    function syncJobTypeStyle(selectedJob) {
        previewJobType.innerText = selectedJob;
        previewJobType.className = 'meta-val badge';
        
        if (selectedJob === 'ซ้อมใหญ่') {
            previewJobType.style.borderColor = 'rgba(6, 182, 212, 0.3)';
            previewJobType.style.color = '#0891b2';
            previewJobType.style.background = 'rgba(6, 182, 212, 0.05)';
        } else if (selectedJob === 'รับจริง') {
            previewJobType.style.borderColor = 'rgba(236, 72, 153, 0.3)';
            previewJobType.style.color = '#db2777';
            previewJobType.style.background = 'rgba(236, 72, 153, 0.05)';
        } else if (selectedJob === 'ถ่ายพอร์ตโฟลิโอ') {
            previewJobType.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            previewJobType.style.color = '#059669';
            previewJobType.style.background = 'rgba(16, 185, 129, 0.05)';
        } else if (selectedJob === 'รับหมวก/รับทานสคริป') {
            previewJobType.style.borderColor = 'rgba(124, 58, 237, 0.3)';
            previewJobType.style.color = '#7c3aed';
            previewJobType.style.background = 'rgba(124, 58, 237, 0.05)';
        } else if (selectedJob === 'งานแต่งงาน') {
            previewJobType.style.borderColor = 'rgba(244, 63, 94, 0.3)';
            previewJobType.style.color = '#e11d48';
            previewJobType.style.background = 'rgba(244, 63, 94, 0.05)';
        } else if (selectedJob === 'งานอุปสมบท') {
            previewJobType.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            previewJobType.style.color = '#d97706';
            previewJobType.style.background = 'rgba(245, 158, 11, 0.05)';
        } else if (selectedJob === 'งานฌาปนกิจ') {
            previewJobType.style.borderColor = 'rgba(100, 116, 139, 0.3)';
            previewJobType.style.color = '#475569';
            previewJobType.style.background = 'rgba(100, 116, 139, 0.05)';
        } else if (selectedJob === 'งานสัมมนา/งาน Event') {
            previewJobType.style.borderColor = 'rgba(20, 184, 166, 0.3)';
            previewJobType.style.color = '#0d9488';
            previewJobType.style.background = 'rgba(20, 184, 166, 0.05)';
        } else {
            // นอกรอบ
            previewJobType.style.borderColor = '';
            previewJobType.style.color = '';
            previewJobType.style.background = '';
        }
    }

    // Main sync function from form to ticket preview
    function syncFormToTicket() {
        // Simple text values
        previewName.innerText = clientNameInput.value.trim() || 'ยังไม่ได้ระบุชื่อ';
        previewPhone.innerText = clientPhoneInput.value.trim() || 'ยังไม่ได้ระบุเบอร์';
        
        const loc = bookingLocationInput.value.trim();
        previewLocation.innerHTML = loc 
            ? `<i class="fa-solid fa-location-dot"></i> ${loc}` 
            : `<i class="fa-solid fa-location-dot" style="color: var(--text-muted)"></i> <span style="color: var(--text-muted); font-style: italic;">ยังไม่ได้ระบุสถานที่</span>`;

        previewTime.innerText = bookingTimeInput.value.trim() || 'ยังไม่ได้ระบุช่วงเวลา';

        // Date update
        previewDate.innerText = formatThaiDate(bookingDateInput.value);
        updateBookingId();

        // Job type & Photographers
        const selectedJob = jobTypeValueInput.value;
        syncJobTypeStyle(selectedJob);

        const photographerCount = photographerCountInput.value;
        previewPhotographerCount.innerText = `${photographerCount} คน`;

        // Notes formatting
        const notes = additionalNotesInput.value.trim();
        if (notes) {
            previewNotes.innerText = notes;
            previewNotesContainer.style.display = 'block';
        } else {
            previewNotes.innerText = '-';
            previewNotesContainer.style.display = 'none'; // Clean look when empty
        }

        // Run calculations
        updateCalculations();
        updateInclusions();
    }

    // --- Interactive Event Listeners ---

    // Stepper controls
    stepDecBtn.addEventListener('click', () => {
        let val = parseInt(photographerCountInput.value) || 1;
        if (val > 1) {
            photographerCountInput.value = val - 1;
            previewPhotographerCount.innerText = `${val - 1} คน`;
        }
    });

    stepIncBtn.addEventListener('click', () => {
        let val = parseInt(photographerCountInput.value) || 1;
        if (val < 10) {
            photographerCountInput.value = val + 1;
            previewPhotographerCount.innerText = `${val + 1} คน`;
        }
    });

    // Job Type Selection Cards
    jobCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all
            jobCards.forEach(c => c.classList.remove('active'));
            // Add to clicked
            card.classList.add('active');
            // Update hidden value
            const selectedJob = card.getAttribute('data-type');
            jobTypeValueInput.value = selectedJob;
            syncJobTypeStyle(selectedJob);
        });
    });

    // Service Package Selection Cards
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all
            serviceCards.forEach(c => c.classList.remove('active'));
            // Add to clicked
            card.classList.add('active');
            // Update hidden value
            const selectedOption = card.getAttribute('data-option');
            serviceOptionValueInput.value = selectedOption;
            updateInclusions();
        });
    });

    // Time Preset Chips
    timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const timeVal = chip.getAttribute('data-time');
            bookingTimeInput.value = timeVal;
            previewTime.innerText = timeVal;
        });
    });

    // High performance targeted input listeners (avoid full re-renders on keystroke)
    clientNameInput.addEventListener('input', () => {
        previewName.innerText = clientNameInput.value.trim() || 'ยังไม่ได้ระบุชื่อ';
    });
    
    clientPhoneInput.addEventListener('input', () => {
        previewPhone.innerText = clientPhoneInput.value.trim() || 'ยังไม่ได้ระบุเบอร์';
    });
    
    bookingLocationInput.addEventListener('input', () => {
        const loc = bookingLocationInput.value.trim();
        previewLocation.innerHTML = loc 
            ? `<i class="fa-solid fa-location-dot"></i> ${loc}` 
            : `<i class="fa-solid fa-location-dot" style="color: var(--text-muted)"></i> <span style="color: var(--text-muted); font-style: italic;">ยังไม่ได้ระบุสถานที่</span>`;
    });
    
    bookingTimeInput.addEventListener('input', () => {
        previewTime.innerText = bookingTimeInput.value.trim() || 'ยังไม่ได้ระบุช่วงเวลา';
    });
    
    bookingDateInput.addEventListener('change', () => {
        previewDate.innerText = formatThaiDate(bookingDateInput.value);
        updateBookingId();
    });
    
    additionalNotesInput.addEventListener('input', () => {
        const notes = additionalNotesInput.value.trim();
        if (notes) {
            previewNotes.innerText = notes;
            previewNotesContainer.style.display = 'block';
        } else {
            previewNotes.innerText = '-';
            previewNotesContainer.style.display = 'none';
        }
    });
    
    totalPriceInput.addEventListener('input', updateCalculations);
    depositPriceInput.addEventListener('input', updateCalculations);

    // Search input date handlers
    if (searchDateInput) {
        searchDateInput.addEventListener('change', () => {
            renderBookingsTable();
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            searchDateInput.value = '';
            renderBookingsTable();
        });
    }

    // Booking Date TBD Checkbox handler
    if (bookingDateTbdCheckbox) {
        bookingDateTbdCheckbox.addEventListener('change', () => {
            const wrapper = bookingDateInput.closest('.input-icon-wrapper');
            if (bookingDateTbdCheckbox.checked) {
                previousDateVal = bookingDateInput.value;
                bookingDateInput.value = '';
                bookingDateInput.disabled = true;
                bookingDateInput.required = false;
                if (wrapper) wrapper.classList.add('disabled-field');
            } else {
                bookingDateInput.disabled = false;
                bookingDateInput.required = true;
                bookingDateInput.value = previousDateVal || tomorrowStr;
                if (wrapper) wrapper.classList.remove('disabled-field');
            }
            previewDate.innerText = formatThaiDate(bookingDateInput.value);
            updateBookingId();
        });
    }

    // --- Action: Save as Image (html2canvas) ---
    btnSaveImage.addEventListener('click', () => {
        // Validate and save booking to system first
        if (!saveCurrentBooking()) return;

        // Update document issue timestamp to the exact moment of saving
        updateIssueTimestamp();

        // Change button state to loading
        const originalHTML = btnSaveImage.innerHTML;
        btnSaveImage.disabled = true;
        btnSaveImage.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin btn-icon"></i> <span>กำลังบันทึกรูปภาพ...</span>`;

        const ticketElement = document.getElementById('booking-ticket');

        // Get current background color dynamically from CSS variable
        const currentBg = getComputedStyle(document.body).getPropertyValue('--bg-main').trim() || '#f8fafc';

        // Configure html2canvas for crisp text and premium rendering
        const options = {
            scale: 2.5, // 2.5x scale for high resolution print-like quality
            useCORS: true,
            allowTaint: false,
            backgroundColor: currentBg, // Match backdrop color for transparent circle cutouts based on current theme
            logging: false
        };

        function captureTicket() {
            html2canvas(ticketElement, options).then(canvas => {
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    
                    // Construct filename: ใบจองคิว_[ชื่อลูกค้า]_[วันที่].png
                    const clientName = clientNameInput.value.trim() || 'ลูกค้า';
                    const dateVal = bookingDateInput.value || 'ไม่ระบุวัน';
                    link.download = `ใบจองคิวถ่ายภาพ_${clientName}_${dateVal}.png`;
                    link.href = dataUrl;
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error('Error generating image:', error);
                    alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาลองใหม่อีกครั้ง');
                } finally {
                    // Restore button state
                    btnSaveImage.disabled = false;
                    btnSaveImage.innerHTML = originalHTML;
                }
            }).catch(err => {
                console.error('Canvas capture failed:', err);
                alert('ไม่สามารถบันทึกภาพได้ กรุณาลองใหม่อีกครั้ง');
                btnSaveImage.disabled = false;
                btnSaveImage.innerHTML = originalHTML;
            });
        }

        // Dynamically load html2canvas if it is not already loaded
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.onload = () => {
                setTimeout(captureTicket, 300);
            };
            script.onerror = () => {
                alert('ไม่สามารถดาวน์โหลดไฟล์บันทึกภาพได้ กรุณาลองใหม่อีกครั้ง');
                btnSaveImage.disabled = false;
                btnSaveImage.innerHTML = originalHTML;
            };
            document.head.appendChild(script);
        } else {
            setTimeout(captureTicket, 300);
        }
    });

    // --- Action: Add to Google Calendar ---
    btnSaveCalendar.addEventListener('click', () => {
        // Validate and save booking to system first
        if (!saveCurrentBooking()) return;

        // Update document issue timestamp to the exact moment of recording
        updateIssueTimestamp();

        if (bookingDateTbdCheckbox && bookingDateTbdCheckbox.checked) {
            alert('กรุณาระบุวันที่จัดงานถ่ายภาพก่อนบันทึกลง Google Calendar');
            return;
        }

        // Validate form fields first
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const clientName = clientNameInput.value.trim();
        const clientPhone = clientPhoneInput.value.trim();
        const clientFacebook = clientFacebookInput ? clientFacebookInput.value.trim() : '';
        const dateVal = bookingDateInput.value; // YYYY-MM-DD
        
        if (!dateVal) {
            alert('กรุณาระบุวันที่จัดงานถ่ายภาพก่อนบันทึกลง Google Calendar');
            return;
        }
        const location = bookingLocationInput.value.trim();
        const jobType = jobTypeValueInput.value;
        const photographers = photographerCountInput.value;
        const timeSlot = bookingTimeInput.value.trim();
        const notes = additionalNotesInput.value.trim();
        
        const total = totalPriceInput.value;
        const deposit = depositPriceInput.value;
        const balance = balancePriceInput.value;

        // Parse Time Slot to try to find hours (e.g. 08:00 - 12:00 น.)
        // Regex looks for time patterns like hh:mm or hh.mm
        const timeRegex = /(\d{1,2})[:.](\d{2})/g;
        const times = [];
        let match;
        while ((match = timeRegex.exec(timeSlot)) !== null) {
            times.push({
                hour: match[1].padStart(2, '0'),
                minute: match[2].padStart(2, '0')
            });
        }

        let dateParam = '';
        const baseDateStr = dateVal.replace(/-/g, ''); // YYYYMMDD

        if (times.length >= 2) {
            // Found start time and end time! Set dynamic event hours
            const startHour = times[0].hour;
            const startMin = times[0].minute;
            const endHour = times[1].hour;
            const endMin = times[1].minute;
            
            // Format for Google Calendar: YYYYMMDDTHHmmSS/YYYYMMDDTHHmmSS (Local time of the calendar user)
            dateParam = `${baseDateStr}T${startHour}${startMin}00/${baseDateStr}T${endHour}${endMin}00`;
        } else {
            // Fallback: All-day event.
            // Google calendar all day is YYYYMMDD/YYYYMMDD (End date is non-inclusive, so end = start + 1 day)
            const startDate = new Date(dateVal);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            
            const startStr = baseDateStr;
            const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
            
            dateParam = `${startStr}/${endStr}`;
        }

        // Construct Event Details/Description
        const title = `จองคิวถ่ายภาพ [${jobType}] - ${clientName}`;
        
        let details = `ใบจองคิวถ่ายภาพ Sook Jai Pix\n`;
        details += `-------------------------------\n`;
        details += `ผู้จอง: ${clientName}\n`;
        details += `เบอร์ติดต่อ: ${clientPhone}\n`;
        if (clientFacebook) {
            details += `Facebook: ${clientFacebook}\n`;
        }
        details += `ประเภทงาน: ${jobType}\n`;
        details += `จำนวนช่างภาพ: ${photographers} คน\n`;
        details += `ช่วงเวลา: ${timeSlot}\n`;
        if (notes) {
            details += `รายละเอียดเพิ่มเติม: ${notes}\n`;
        }
        
        // Add service inclusions package details
        const serviceOption = serviceOptionValueInput ? serviceOptionValueInput.value : "รับภาพด่วน";
        details += `ตัวเลือกบริการ: ${serviceOption}\n`;
        const inclusions = INCLUSIONS_DATA[serviceOption] || [];
        if (inclusions.length > 0) {
            details += `บริการและสิ่งที่จะได้รับ:\n`;
            inclusions.forEach(item => {
                details += `- ${item}\n`;
            });
        }
        
        details += `-------------------------------\n`;
        details += `ค่าบริการถ่ายภาพ:\n`;
        details += `- ยอดรวม: ฿${formatCurrency(total)}\n`;
        details += `- มัดจำแล้ว: ฿${formatCurrency(deposit)}\n`;
        details += `- คงเหลือหน้างาน: ฿${formatCurrency(balance)}\n`;

        // Encode parameters for Google Calendar render TEMPLATE URL
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(title)}` +
            `&dates=${dateParam}` +
            `&details=${encodeURIComponent(details)}` +
            `&location=${encodeURIComponent(location)}`;

        // Open in new tab
        window.open(calendarUrl, '_blank');
    });

    // --- Initialize values on first load ---
    syncFormToTicket();
    updateIssueTimestamp();

    // --- Connection Status Indicator Logic ---
    const statusEl = document.getElementById('connection-status');
    const statusTextEl = statusEl ? statusEl.querySelector('.status-text') : null;

    function updateOnlineStatus() {
        if (!statusEl || !statusTextEl) return;
        
        if (!navigator.onLine) {
            statusEl.className = 'connection-status offline';
            statusTextEl.innerText = 'ออฟไลน์ (ไม่มีเน็ต)';
        } else {
            if (dbMode === 'api') {
                statusEl.className = 'connection-status online';
                statusTextEl.innerHTML = '<i class="fa-solid fa-cloud" style="margin-right: 4px;"></i>ออนไลน์ (Google Sheets)';
            } else {
                statusEl.className = 'connection-status offline local-mode';
                statusTextEl.innerHTML = '<i class="fa-solid fa-database" style="margin-right: 4px;"></i>โหมดเครื่อง (Local)';
            }
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // --- Initialize Dashboard from Database ---
    loadBookingsFromStorage();

    // Attach listener to save button
    if (btnSaveSystem) {
        btnSaveSystem.addEventListener('click', () => {
            saveCurrentBooking();
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (confirm("คุณต้องการล้างข้อมูลคิวงานทั้งหมดหรือไม่?")) {
                const isGas = isGoogleScriptUrl();
                const fetchUrl = GOOGLE_SCRIPT_URL;
                const fetchOptions = isGas
                    ? {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'clear'
                        })
                      }
                    : {
                        method: 'DELETE'
                      };

                fetch(fetchUrl, fetchOptions)
                .then(res => {
                    if (!res.ok) throw new Error("API clear failed");
                    return res.json();
                })
                .then(() => {
                    bookingsList = [];
                    try {
                        localStorage.removeItem('sjp_bookings_fallback');
                    } catch (e) {}
                    updateDashboardStats();
                    renderBookingsTable();
                    showToast("ล้างข้อมูลคิวงานทั้งหมดเรียบร้อยแล้ว", "success");
                })
                .catch(err => {
                    console.warn("SQLite API error, clearing fallback copy:", err);
                    const wasApi = dbMode === 'api';
                    dbMode = 'local';
                    updateOnlineStatus();
                    
                    bookingsList = [];
                    try {
                        localStorage.removeItem('sjp_bookings_fallback');
                    } catch (e) {}
                    updateDashboardStats();
                    renderBookingsTable();
                    showToast(wasApi ? "ล้างข้อมูลคิวงานในเครื่องเรียบร้อยแล้ว (ออฟไลน์)" : "ล้างข้อมูลคิวงานทั้งหมดเรียบร้อยแล้ว", "success");
                });
            }
        });
    }

    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check local storage for preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggleBtn.innerHTML = isDark 
                ? `<i class="fa-solid fa-sun"></i>` 
                : `<i class="fa-solid fa-moon"></i>`;
        });
    }

    // --- Register Service Worker for Offline caching ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('[Service Worker] Registered successfully', reg.scope))
                .catch(err => console.error('[Service Worker] Registration failed', err));
        });
    }
});
