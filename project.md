3D Asset Repository — Design Spec
Date: 2026-10-31 Status: Draft for review

1. Summary
   แพลตฟอร์ม "Google Fonts สำหรับโลก 3 มิติ": Creator อัปโหลดโมเดล .glb เป็นฟรีหรือเสียเงิน Web Developer ใช้งานได้สองวิธี คือ Embed (คัดลอกโค้ดสั้นๆ ไปแปะ โมเดลสตรีมจากเซิร์ฟเวอร์เรา ไม่ต้องดาวน์โหลด) หรือ ดาวน์โหลดไฟล์

1.1 ปัญหาที่แก้
การใส่โมเดล 3 มิติบนเว็บวันนี้ยุ่งยากสำหรับ Web Developer: ต้องหาโมเดล, ดาวน์โหลดไฟล์ .glb, เอาไปเก็บบนเซิร์ฟเวอร์ของตัวเอง, ตั้งค่า CORS และ cache, เลือกและติดตั้งไลบรารี viewer แล้วเขียนโค้ด แสดงผล ไฟล์โมเดลมักหนักหลายเมกะไบต์ จึงเพิ่มภาระแบนด์วิดท์และพื้นที่เก็บของเว็บปลายทางด้วย ส่วน Creator ที่ทำโมเดลก็ไม่มีที่กลางสำหรับแจกจ่ายหรือขายให้นักพัฒนาเว็บโดยตรง

เปรียบเทียบกับ Google Fonts: นักพัฒนาไม่ต้องโฮสต์ไฟล์ฟอนต์เอง แค่แปะบรรทัดเดียว ฟอนต์ก็ขึ้นบนเว็บ โปรเจกต์นี้ทำแบบเดียวกันกับโมเดล 3 มิติ

1.2 ผู้ใช้และสิ่งที่แต่ละกลุ่มได้
Web Developer (กลุ่มเป้าหมายหลัก): ค้นหาโมเดลใน Gallery, ดูตัวอย่างหมุนได้, ปรับแต่งการแสดงผลใน Playground, กด Generate Embed Code แล้วคัดลอกไปแปะ โมเดลสตรีมจากเซิร์ฟเวอร์ของเรา ไม่ต้องดาวน์โหลด ไม่ต้องโฮสต์ไฟล์ และไม่ต้องติดตั้งไลบรารีเพิ่ม (ถ้าต้องการไฟล์จริงก็ดาวน์โหลดได้)
3D Creator: อัปโหลดไฟล์ .glb เลือกว่าจะแจกฟรีหรือตั้งราคาขาย ระบุ license และ tag แล้วโมเดลจะ อยู่ในคลังกลางให้นักพัฒนาทั่วโลกค้นเจอและนำไปใช้
ผู้ซื้อ (เป็น Web Developer คนเดิม): จ่ายเงินครั้งเดียวสำหรับโมเดลที่เป็นแบบเสียเงิน จะได้ embed key สำหรับสตรีมและสิทธิ์ดาวน์โหลดไฟล์
1.3 ทำงานอย่างไร (ภาพรวม)
Creator อัปโหลด .glb ระบบตรวจไฟล์ เก็บด้วยชื่อ = hash ของเนื้อไฟล์ และสร้างภาพ poster ให้
ระบบเปิด URL สาธารณะที่เสถียรสำหรับสตรีมไฟล์ พร้อม CORS, cache ระยะยาว และ Range request ทำหน้าที่ เสมือน CDN สำหรับไฟล์ 3 มิติข้ามโดเมน
นักพัฒนากด Generate Embed Code ได้ Iframe หรือ Web Component <vm-model> ที่ชี้มายัง URL ดังกล่าว
เว็บปลายทางโหลด viewer และโมเดลจากเซิร์ฟเวอร์เราโดยตรง เซิร์ฟเวอร์ของนักพัฒนาไม่ต้องแบกไฟล์
โมเดลเสียเงินใช้เส้นทางเดียวกัน แต่เซิร์ฟเวอร์ตรวจ embed key ที่ได้จากการซื้อก่อนส่งไฟล์
1.4 ตัวอย่างการใช้งาน
นักพัฒนาร้านขายรองเท้าออนไลน์ต้องการแสดงรองเท้า 3 มิติหมุนได้บนหน้าสินค้า: ค้นหา "sneaker" ใน Gallery → เลือกโมเดล CC0 → ปรับพื้นหลังและเปิด auto-rotate ใน Playground → คัดลอก <vm-model> สองบรรทัดไปแปะในหน้า HTML → โมเดลขึ้นทันทีโดยไม่ต้องดาวน์โหลดหรือโฮสต์ไฟล์เอง

Success criteria
แปะโค้ด 1–2 บรรทัดบนเว็บภายนอก (คนละ domain) แล้วโมเดลแสดงและหมุนได้
โมเดลฟรีใช้ได้โดยไม่ต้องมีบัญชีฝั่งผู้ชมและไม่ต้องมี key
โมเดลเสียเงินสตรีมได้เฉพาะเมื่อมี embed_key ที่ถูกต้องจากการซื้อ
Differentiators
Plug-and-play จริง: Web Component + Iframe, ไม่ต้องมี SDK/API key ฝั่งผู้ชม, snippet สำเร็จรูป HTML / React / Vue / WordPress
Embed Playground: ปรับค่าแล้วเห็นผลและโค้ดเปลี่ยนทันที
โหลดเร็ว: poster ก่อน, lazy-load, immutable cache, Range, แสดงขนาดไฟล์บนการ์ด
License ชัดเจน: บังคับเลือกตอนอัปโหลด, badge บนทุกโมเดล, ตัวกรองใน Gallery 2. Out of scope
Payout/ค่าคอมมิชชัน, ผูก embed key กับ domain, รีวิว/โซเชียล, แปลงหรือบีบอัดโมเดล (Draco — viewer อ่านไฟล์ Draco ได้อยู่แล้วถ้า Creator บีบอัดมาเอง), ฟอร์แมตอื่นนอกจาก GLB, AI สร้างโมเดล, ย้ายไป R2/S3 (เตรียม adapter ไว้)

3. Architecture
   backend/ Express 5 + TS + Postgres
   auth สมัคร/ล็อกอิน (email + bcrypt) ออก JWT
   models อัปโหลด, ค้นหา, รายละเอียด, ลบ (soft delete)
   cdn สตรีมไฟล์ผ่าน storage adapter
   payments provider interface; Stripe Checkout (test mode ก่อน) + mock สำหรับเทสต์
   storage interface put / getStream(range) / delete; v1 = LocalDiskStorage
   frontend/ Next.js
   / Gallery · /models/[id] รายละเอียด + Playground · /upload · /login · /me · /embed/[id]
   public/embed.js Web Component <vm-model> ครอบ <model-viewer>
4. Data model
   users: id, email (unique), password_hash, display_name, created_at
   models: id, owner_id, title, description, tags text[], license (enum), file_hash, file_size, preview_hash (nullable), poster_hash (nullable), price_cents (0 = ฟรี), currency, view_count, deleted_at, created_at
   purchases: id, user_id, model_id, status (pending/paid), provider_session_id, embed_key, created_at; unique (user_id, model_id)
   License enum: CC0, CC-BY, CC-BY-NC, COMMERCIAL (โมเดลเสียเงิน: ใช้ได้ตามสิทธิ์ที่ซื้อ)

5. Access rules
   โมเดล Gallery Embed Download
   ฟรี ทุกคน ทุกคน ไม่ต้องใช้ key ทุกคน
   เสียเงิน ทุกคน (แสดงไฟล์ preview) ต้องมี embed_key จากการซื้อ ล็อกอิน + ซื้อแล้ว
   โมเดลเสียเงินต้องมีไฟล์ preview (.glb เล็ก) ซึ่งเป็น public เสมอ
   key รั่วแล้วคนอื่นใช้ได้ (ไม่ผูก domain) — ผู้ซื้อกด Regenerate key ได้ key เก่าใช้ไม่ได้ทันที
6. API
   REST (/api):

POST /auth/register, POST /auth/login
GET /models?q=&tag=&license=&price=free|paid&page= · GET /models/:id
POST /models (multipart: file, preview?, poster?, title, tags, license, price) · DELETE /models/:id
POST /models/:id/checkout · POST /webhooks/stripe
GET /me/purchases · POST /purchases/:id/regenerate-key
CDN (/cdn):

GET /cdn/models/:id/:hash.glb (ฟรี/preview): CORS \*, Cache-Control: public, immutable, max-age=31536000, Range
GET /cdn/models/:id/file.glb?key= (เสียเงิน): ตรวจ key, Cache-Control: private, Range
GET /cdn/models/:id/download: Content-Disposition: attachment
GET /cdn/models/:id/poster.webp: public, immutable
Error รูปแบบเดียว: { "error": { "code", "message" } } (400/401/403/404/413/415)

7. Embed contract
<iframe src="https://HOST/embed/ID?key=KEY" width="600" height="400" loading="lazy" allow="fullscreen" style="border:0"></iframe>

<script type="module" src="https://HOST/embed.js"></script>

<vm-model model-id="ID" key="KEY" auto-rotate camera-controls></vm-model>
โมเดลฟรีไม่มี key
attribute ที่รองรับ: auto-rotate, camera-controls, background, exposure, shadow-intensity, poster, loading (lazy เป็นค่าเริ่มต้น) และ CSS variables สำหรับขนาด/สีพื้นหลัง
key ผิด/หมดสิทธิ์: viewer แสดง preview + ข้อความ "ต้องซื้อเพื่อใช้งาน" ไม่ crash
/embed/[id] ตั้ง Content-Security-Policy: frame-ancestors \*; หน้าอื่นตั้ง frame-ancestors 'self'
Snippet tabs
HTML, React (ใช้ custom element พร้อม type declaration), Vue, WordPress (shortcode/HTML block) — สร้างจาก template ฝั่ง frontend ล้วน ไม่มีผลต่อ backend

8. Embed Playground
   แผงบนหน้า /models/[id]: ควบคุม auto-rotate, camera-controls, สีพื้นหลัง, exposure, shadow, ขนาด (กว้าง×สูง) พร้อม live preview และโค้ดที่อัปเดตตามทันที มีปุ่ม Copy และ tab เลือก Iframe / Web Component / framework

9. Fast loading
   Poster: ตอนอัปโหลด frontend สร้างภาพจาก <model-viewer>.toBlob() อัตโนมัติ (ไม่ต้อง render ฝั่งเซิร์ฟเวอร์) Creator เปลี่ยนเองได้
   การ์ด Gallery แสดง poster ก่อน; โหลดโมเดลเมื่อ hover/คลิกหรือเลื่อนมาถึง (IntersectionObserver)
   URL มี content hash → immutable cache; รองรับ Range
   การ์ดและหน้ารายละเอียดแสดงขนาดไฟล์
10. Upload security
    ตรวจ magic bytes GLB (glTF, version 2) และความยาวใน header ตรงกับขนาดไฟล์
    จำกัดขนาด: file 50 MB, preview 5 MB, poster 1 MB (ตั้งผ่าน env)
    สตรีมเข้า temp file + คำนวณ sha256 แล้วย้ายเข้า storage ด้วยชื่อ = hash; ไม่ใช้ชื่อไฟล์ผู้ใช้เป็น path
    ต้องล็อกอิน + rate limit ต่อ user
11. Payment security
    ยืนยันการจ่ายจาก webhook ที่ตรวจ signature เท่านั้น; webhook idempotent
    embed_key = crypto.randomBytes(24) เทียบแบบ constant-time
    ราคามาจาก DB ฝั่งเซิร์ฟเวอร์เท่านั้น
    ลบโมเดลที่มีคนซื้อแล้ว = soft delete: ปิดการขาย ผู้ซื้อเดิมยังใช้ได้
12. Repo hygiene
    ลบโค้ด marketplace เดิมและ Socket.io ทั้งหมด
    เอา backend/.env และ frontend/.env ออกจาก git tracking, เพิ่ม .env.example (secret ที่เคย commit ควรถูกเปลี่ยนค่า)
    เขียน README ใหม่
13. Testing
    Backend (test DB Postgres จริง): ตัวตรวจ GLB, local storage adapter, ตารางสิทธิ์เข้าถึงทุกแถว, webhook idempotency, regenerate key
    Integration: อัปโหลด → ลิสต์ → ซื้อ (mock provider) → สตรีมด้วย key → regenerate แล้ว key เก่าใช้ไม่ได้
    Frontend smoke: /embed/[id] โหลดข้ามโดเมนได้, Playground สร้างโค้ดถูกต้องทุก tab
    Stripe ของจริงตรวจด้วยมือใน test mode
14. Roadmap (หลัง v1)
    Draco/meshopt บีบอัดอัตโนมัติ, ผูก domain, payout + ค่าคอมมิชชัน, R2/S3, SDK สำหรับ framework
