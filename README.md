
# E‑Commerce Microservices Demo (Resilient Checkout)

เดโมเว็บหน้าตาเหมือนร้านค้า: มี **Catalog**, **Cart**, **Order** แยกเป็น 3 services
จุดประสงค์: ถ้า **Cart ล่ม** ผู้ใช้ยัง "ซื้อได้จริง" ผ่านปุ่ม **Buy Now** (ส่งออเดอร์ตรงไป Order service)

## Services
- catalog-service (4101): รายการสินค้า `/products`, `/products/:id`
- cart-service (4102): `/cart`, `/cart/add`, `/cart/clear` (+ `/health`, `/crash`)
- order-service (4103): สร้างออเดอร์ `POST /order` (คำนวณราคาจาก catalog)

ทุก service มี:
- `GET /health` ตรวจสถานะ
- `POST /crash` จำลองพัง
- `?ms=1000` ใส่เพื่อดีเลย์
- env `CHAOS=true` เพื่อสุ่ม 500

Frontend (Vite @ 5173) proxy ไปยัง:
- `/api/catalog` → 4101
- `/api/cart` → 4102
- `/api/order` → 4103

## วิธีรัน
```bash
npm run install:all
npm run start:all
# เปิด http://localhost:5173
```
> ถ้า Windows หา concurrently ไม่เจอ: `npm install` ที่โฟลเดอร์รากก่อน หรือ `npm i -g concurrently` หรือเปิด 4 terminal รันแยก

## สคริปต์รันแยก (ทางเลือก)
```bash
npm --prefix services/catalog-service start
npm --prefix services/cart-service start
npm --prefix services/order-service start
npm --prefix frontend run dev
```

## เดโมสถานการณ์
### A) Cart พัง แต่ยังซื้อได้ (Buy Now)
1) เรียกให้ Cart ล่ม:
   ```bash
   curl -X POST http://localhost:4102/crash
   ```
2) หน้าเว็บจะแสดง Cart = down
3) ที่การ์ดสินค้า เลือกจำนวนแล้วกด **Buy Now** → Order สำเร็จ (แสดงเลขออเดอร์) แม้ Cart จะล่ม

### B) Order พัง แต่ร้านยังเปิด
1) `POST /crash` ที่ 4103
2) หน้าเว็บยังเปิด, เพิ่มตะกร้าได้ แต่กด **Checkout** หรือ **Buy Now** จะล้ม (ชำระไม่ได้)

### C) Catalog พัง
- หน้า "สินค้า" โหลดไม่ได้ แต่ถ้าเคยมีของในตะกร้า อาจยังกด Checkout ได้ (Order จะยิงกลับไปอ่านราคาแต่จะพังเพราะเรียก Catalog ไม่ได้) → ชี้ให้เห็น dependency

## จุดที่ทำให้ "เหมือนใช้งานจริง"
- Product grid พร้อมราคา/จำนวน
- Add to Cart (พึ่งพา cart-service) + Buy Now (ไม่พึ่ง cart-service)
- Cart panel แยกส่วน: ล่มเฉพาะ cart ก็ยังช้อปต่อได้
- Badge สถานะของแต่ละ service แบบเรียลไทม์

## ต่อยอด
- ใส่ API Gateway, auth, stock check, payment mock, retry/circuit-breaker (เช่น opossum), และ Docker Compose
