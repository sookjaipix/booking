# Sook Jai Pix — ระบบสรุปยอดคงเหลือและฐานข้อมูลประวัติการจอง (Minimal Luxury Edition)

เว็บแอปพลิเคชันสำหรับสตูดิโอถ่ายภาพ **Sook Jai Pix** ออกแบบในสไตล์ **Modern Luxury & Clean Minimalist** รองรับการใช้งานทั้งบนคอมพิวเตอร์และโทรศัพท์มือถือ iPhone อย่างสมบูรณ์แบบ ประกอบด้วย 2 ระบบหลัก:

1. **ระบบสร้างใบสรุปยอด (Generator SPA - `index.html`):** สร้างใบสรุปยอดคงเหลือค่าบริการถ่ายภาพ ข้อมูลงาน กำหนดการ และเงื่อนไขการส่งมอบงาน พร้อมคำนวณยอดเงินอัตโนมัติ กดปุ่ม **"บันทึกข้อมูลการจอง"** เพื่อซิงค์ลง Google Sheets และกดบันทึกเป็นไฟล์ภาพ JPEG ส่งให้ลูกค้าผ่าน LINE หรือ Facebook Messenger ได้ทันที
2. **ระบบประวัติการจองและฐานข้อมูล Google Sheets (`history.html`):** หน้าดู แก้ไข หรือลบ ประวัติการจองและบันทึกข้อมูลคิวงาน เชื่อมโยงกับ Google Sheets แบบเรียลไทม์ผ่าน Google Apps Script (GAS v2.1) พร้อมปุ่ม "ซิงค์ข้อมูล" สองทาง (Two-Way Sync) และระบบสำรองข้อมูลออฟไลน์ในเครื่อง (Local Cache)

---

## 📂 โครงสร้างไฟล์ในโปรเจกต์

- **[index.html](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/index.html):** หน้าสร้างใบสรุปยอดค่าบริการถ่ายภาพ พร้อม Live Preview และส่งออกภาพ JPEG
- **[history.html](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/history.html):** หน้าประวัติการจองและจัดการฐานข้อมูล (ดู, แก้ไข, ลบ, ค้นหา, กรองสถานะ, ส่งออก CSV)
- **[sheets-api.js](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/sheets-api.js):** โมดูลเชื่อมต่อ Google Sheets Web App และจัดการแคชในเครื่อง
- **[history.js](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/history.js):** ตรรกะการทำงานของหน้าประวัติการจอง
- **[app.js](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/app.js):** ตรรกะการทำงานของหน้าสร้างใบสรุปยอด
- **[Code.gs](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/Code.gs):** โค้ด Google Apps Script สำหรับวางใน Google Sheets
- **[style.css](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/style.css):** สไตล์ CSS ดีไซน์มินิมอลและปรับแต่งสำหรับ iOS Safe Area
- **[html2canvas.min.js](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/html2canvas.min.js):** ไลบรารีเรนเดอร์ภาพความละเอียดสูงแบบออฟไลน์
- **[logos_base64.js](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/logos_base64.js):** โลโก้แบบ Base64 ป้องกัน Canvas Tainting

---

## ✨ ฟังก์ชันใหม่: หน้าประวัติการจอง (Booking History & Database)

### 1. การดูข้อมูล (View & Overview)
- **การ์ดสถิติ (KPIs):** แสดงจำนวนคิวงานทั้งหมด, มูลค่ารวมงานทั้งหมด, ยอดคงเหลือรอรับชำระวันงาน, และจำนวนงานที่ชำระครบถ้วน
- **การ์ดรายการจอง:** แสดงเลขที่เอกสาร (`SJP-XXXX`), วันที่จัดงาน, สถานะการชำระ (`รอชำระวันงาน` / `ชำระครบถ้วน`), แพ็กเกจที่เลือก, ข้อมูลลูกค้า, เบอร์โทร (กดโทรออกได้ทันที), ลิงก์ Facebook, และสถานที่จัดงาน
- **ปุ่ม "ดู / ออกรูป":** โหลดข้อมูลการจองนั้นกลับเข้าสู่หน้า `index.html` เพื่อเรนเดอร์การ์ดสรุปยอด หรือสร้างไฟล์ภาพใหม่ได้ทันที
- **ปุ่ม "Google Calendar":** เพิ่มนัดหมายเข้า Google Calendar อัตโนมัติพร้อมรายละเอียดครบถ้วน

### 2. การแก้ไขข้อมูล (Edit)
- กดปุ่ม **"แก้ไข"** บนการ์ดใดๆ เพื่อเปิด Modal แก้ไขรายละเอียด
- แก้ไขได้ทั้ง ชื่อลูกค้า, เบอร์โทร, Facebook, ประเภทงาน, สถานที่, วันที่, เวลา, ช่างภาพ, แพ็กเกจ, ยอดเงินรวม และเงินมัดจำ
- ระบบจะคำนวณยอดคงเหลือและสถานะให้อัตโนมัติ พร้อมส่งไปอัปเดตทั้งใน Google Sheets และในเครื่องทันที

### 3. การลบข้อมูล (Delete)
- มี Modal ยืนยันการลบ ป้องกันการกดผิดพลาด
- เมื่อกดยืนยัน ระบบจะลบรายการออกจากทั้งในเครื่องและ Google Sheets

### 4. การค้นหาและตัวกรอง (Search & Filter)
- ค้นหาแบบเรียลไทม์ด้วยชื่อลูกค้า, เบอร์โทร, เลขที่เอกสาร, สถานที่ หรือชื่องาน
- ตัวกรองแยกตามสถานะ: **ทั้งหมด**, **รอชำระวันงาน**, **ชำระครบถ้วน**
- เรียงลำดับตาม: วันที่จัดงาน (ใกล้สุด/ไกลสุด), แก้ไขล่าสุด, หรือยอดคงเหลือ
- ปุ่ม **"ส่งออก CSV"** สำหรับดาวน์โหลดข้อมูลทั้งหมดไปเปิดใน Excel

---

## 📊 วิธีติดตั้งและเชื่อมต่อ Google Sheets ผ่าน Google Apps Script

แอปพลิเคชันสามารถใช้งานได้ทันทีในโหมดออฟไลน์ (Local Storage) หากต้องการให้ข้อมูลซิงค์ลงใน Google Sheets ของสตูดิโอ ให้ทำตามขั้นตอนดังนี้ (ใช้เวลาเพียง 2 นาที):

### ขั้นตอนที่ 1: สร้าง Google Sheets
1. เปิด [Google Sheets](https://sheets.new) ขึ้นมาใหม่ 1 แผ่น
2. ตั้งชื่อไฟล์ตามต้องการ เช่น `Sook Jai Pix - Bookings Database`

### ขั้นตอนที่ 2: เปิด Apps Script
1. ที่แถบเมนูด้านบนของ Google Sheets คลิกที่ **ส่วนขยาย (Extensions)** &gt; **Apps Script**
2. ลบโค้ดเริ่มต้นทั้งหมดในไฟล์ `Code.gs` ออก

### ขั้นตอนที่ 3: วางโค้ดและบันทึก
1. คัดลอกโค้ดทั้งหมดจากไฟล์ **[Code.gs](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/Code.gs)** หรือกดปุ่ม *"คัดลอกโค้ดสคริปต์"* ในหน้าตั้งค่าของระบบ
2. วางลงใน Apps Script แล้วกดปุ่มไอคอน **บันทึก (Save / รูปแผ่นดิสก์)**

### ขั้นตอนที่ 4: ทำให้ใช้งานได้ (Deploy เป็น Web App)
1. คลิกปุ่มสีน้ำเงินด้านบนขวา: **การทำให้ใช้งานได้ (Deploy)** &gt; **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกไอคอนฟันเฟืองข้าง "เลือกประเภท" แล้วเลือก **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `Sook Jai Pix API`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me / บัญชี Google ของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** **`ทุกคน (Anyone)`** *(สำคัญมาก: ต้องเลือก Anyone เพื่อให้เว็บแอปสามารถส่งข้อมูลเข้าชีตได้)*
4. กด **การทำให้ใช้งานได้ (Deploy)**
5. หาก Google แจ้งขอสิทธิ์เข้าถึง (Authorize Access) ให้กด **ให้สิทธิ์ (Authorize)** &gt; เลือกอีเมล &gt; กด **Advanced (ขั้นสูง)** &gt; **Go to Untitled project (unsafe)** &gt; กด **Allow**
6. คัดลอก **URL เว็บแอป (Web app URL)** ที่ลงท้ายด้วย `/exec`

### ขั้นตอนที่ 5: นำ URL มาใส่ในระบบ
1. เปิดหน้า **[history.html](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/history.html)**
2. คลิกปุ่ม **"ตั้งค่า Sheets"** ที่มุมบนขวา
3. วาง Web app URL ลงในช่อง (ต้องลงท้ายด้วย `/exec`)
4. กดปุ่ม **"ทดสอบการเชื่อมต่อ"** เพื่อตรวจสอบความถูกต้อง (ระบบจะแสดงชื่อไฟล์ Google Sheets และสถานะทันที)
5. กดปุ่ม **"บันทึกการตั้งค่า"** เป็นอันเสร็จสิ้น! แถบด้านบนจะเปลี่ยนเป็นสีเขียว **Online Sync**

---

## 🛠️ การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

| ปัญหาที่พบ | สาเหตุหลัก | วิธีแก้ไข |
|---|---|---|
| **เชื่อมต่อไม่สำเร็จ / หาชีตไม่เจอ** | สร้าง Apps Script แบบเดี่ยว (Standalone) จากหน้า script.google.com ทำให้สคริปต์ไม่รู้ว่าจะบันทึกใส่ชีตไหน | **ต้องเปิดจากใน Google Sheets เท่านั้น**: เปิดไฟล์ชีตขึ้นมาก่อน แล้วคลิกเมนู `ส่วนขยาย (Extensions) > Apps Script` |
| **เบราว์เซอร์แจ้ง Error / ไม่สามารถส่งข้อมูลได้** | ในขั้นตอน Deploy เลือกผู้มีสิทธิ์เข้าถึงเป็น "เฉพาะฉัน (Only myself)" | ให้กด `Deploy > จัดการการทำให้ใช้งานได้ (Manage deployments) > กดไอคอนดินสอแก้ไข > เปลี่ยน Who has access เป็น "ทุกคน (Anyone)" > เลือก Version เป็น New version แล้วกด Deploy` |
| **URL ไม่ถูกต้อง** | คัดลอกลิงก์ Google Sheets (`docs.google.com/spreadsheets/...`) มาใส่แทน | ต้องใช้ **Web app URL** ที่ได้จากหน้าต่าง Deploy ของ Apps Script ซึ่งจะขึ้นต้นด้วย `https://script.google.com/macros/s/...` และลงท้ายด้วย `/exec` |
| **URL ลงท้ายด้วย `/dev`** | คัดลอก Test deployment URL มาใส่ | เปลี่ยนคำว่า `/dev` ท้ายลิงก์ให้เป็น `/exec` หรือคัดลอกใหม่จาก New deployment |
| **ต้องการทดสอบใน Apps Script** | ไม่แน่ใจว่าสคริปต์เชื่อมกับชีตติดหรือไม่ | ในหน้า Apps Script ให้เลือกฟังก์ชัน `testConnectionAndSetup` ด้านบน แล้วกดปุ่ม **"เรียกใช้ (Run)"** จะมี Log ยืนยันชื่อชีตและ URL ทันที |

---

## 🚀 ลิงก์สำหรับเปิดดูหน้าเว็บ

- 📄 **หน้าสร้างใบสรุปยอด:** [เปิด index.html](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/index.html)
- 🗄️ **หน้าประวัติการจอง:** [เปิด history.html](file:///Users/thanadonsukkwai/.gemini/antigravity/scratch/sookjai-pix-summary/history.html)
