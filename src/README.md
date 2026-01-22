# Duty Roster & Event Scheduling System (Next.js)

ระบบจัดตารางเวร/กิจกรรมแบบปฏิทิน (Month/Week/Day) รองรับการ Assign พนักงาน, วันหยุดองค์กร, วันลารายบุคคล (อนุมัติ/ปฏิเสธ), ตรวจชนเวร/ชนลา และสะสม Holiday Credit.

> โครงสร้าง/ข้อกำหนดอิงจากเอกสาร Project Plan + DB Design ที่แนบ (PostgreSQL + Next.js).

---

## Quick Start (Docker Compose) ✅

**Prereq:** Docker Desktop (หรือ Docker Engine) + Docker Compose

```bash
cd duty-roster-nextjs
docker compose up --build
```

เปิดเว็บ:
- http://localhost:3000

### Demo Login
ค่าเริ่มต้นใน docker-compose จะ seed ให้พร้อมใช้งาน:
- `admin` / `Admin@9999`
- `supervisor` / `Admin@9999`
- `staff` / `Admin@9999`

> เปลี่ยนรหัส demo ได้ โดยแก้ `SEED_DEFAULT_PASSWORD` ใน `docker-compose.yml` หรือใช้ `.env`.

---

## Local Development (ไม่ใช้ Docker)

**Prereq:** Node.js 20+ และ PostgreSQL 15+

1) สร้าง DB และ Schema `duty` (หรือให้ Docker สร้าง DB อย่างเดียวก็ได้)
2) ตั้งค่า `.env`:

```bash
cp .env.example .env
```

3) ติดตั้ง + สร้าง schema

```bash
npm install
npx prisma generate
npx prisma db push
psql "postgresql://postgres:Admin%409999@localhost:5432/duty_roster" -f scripts/post_migrate.sql
node prisma/seed.mjs
npm run dev
```

---

## Theme (อิงภาพ Oktober Best)
- Primary: `#146C9C`
- Deep Blue: `#0E5A8B`
- Accent Gold: `#CBA85E`
- Background: ไล่เฉดน้ำเงิน + ลายตารางน้ำเงิน/ขาว

อยู่ใน:
- `app/globals.css`
- `tailwind.config.ts`

---

## Notes
- API routes อยู่ที่ `app/api/**/route.ts`
- RBAC ฝั่ง server ตรวจจาก session roles (ADMIN/SUPERVISOR/STAFF)
- Calendar staff จะเห็นเฉพาะ entries ที่ถูก assign เท่านั้น

### Deploy
cd c:\SourceCode\Dutyroster\src
npm run build
pm2 delete duty-roster
pm2 stop duty-roster
pm2 start ecosystem.config.cjs
pm2 save