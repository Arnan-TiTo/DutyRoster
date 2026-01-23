# การเพิ่ม locationCode field ใน Shift Slots

## สถานะปัจจุบัน:
✅ แก้ไข schema.prisma เพิ่ม field `locationCode` แล้ว

## ขั้นตอนที่ต้องทำต่อ:

### 1. หยุดและรัน Migration
```bash
# หยุด dev server (Ctrl+C)
# แล้วรันคำสั่ง:
cd src
npx prisma db push
npx prisma generate

# รัน dev server ใหม่:
npm run dev
```

### 2. อัพเดทข้อมูลใน Shift Slots Table

เข้าไปตั้งค่า `location_code` ในตาราง `shift_slots`:

```sql
-- สำหรับ LP locations
UPDATE shift_slots SET location_code = 'LP1' WHERE slot_code = 'LP1_WorkDayShift1';
UPDATE shift_slots SET location_code = 'LP2' WHERE slot_code = 'LP2_WorkDayShift2';
UPDATE shift_slots SET location_code = 'LP3' WHERE slot_code = 'LP3-SundayShift';

-- สำหรับ OS locations (Icon, SP ใช้ร่วมกัน)
UPDATE shift_slots SET location_code = 'OS' WHERE slot_code = 'OS-WorkDayOut1';
-- หรือถ้าต้องการแยก:
-- UPDATE shift_slots SET location_code = 'OS-Icon' WHERE slot_code = 'OS-Icon-WorkDayOut1';
-- UPDATE shift_slots SET location_code = 'OS-SP' WHERE slot_code = 'OS-SP-WorkDayOut1';
```

### 3. Logic ที่จะใช้หลัง restart

Round Robin จะทำงานดังนี้:
1. **ตรวจสอบ field `locationCode` ก่อน** (วิธีใหม่)
2. **Fallback to naming pattern** (สำหรับ backward compatibility)

**การ Match:**
- Shift Slot มี `location_code = 'LP1'` → match กับ Location `LP1`
- Shift Slot มี `location_code = 'OS'` → match กับ `OS-Icon`, `OS-SP` (ทุก location ที่ขึ้นต้นด้วย OS)
- Shift Slot ไม่มี `location_code` → ใช้ naming pattern เหมือนเดิม

### 4. ตัวอย่างการตั้งค่า Shift Slots

| slot_code | slot_name | location_code | start_time | end_time |
|-----------|-----------|---------------|------------|----------|
| LP1_WorkDayShift1 | เวรทำงานละคร 1 | LP1 | 08:30 | 17:30 |
| LP2_WorkDayShift2 | เวรทำงานละคร 2 | LP2 | 10:00 | 19:00 |
| LP3-SundayShift | เวรวันอาทิตย์ | LP3 | 09:00 | 18:00 |
| OS-WorkDayOut1 | เวรทำงานนอกสถานที่ | OS | 10:00 | 19:00 |

**หมายเหตุ:**
- ถ้า `location_code = 'OS'` จะ match กับทั้ง `OS-Icon` และ `OS-SP`
- ถ้า `location_code = 'OS-Icon'` จะ match เฉพาะ `OS-Icon`

### 5. ประโยชน์ของวิธีใหม่

✅ **ยืดหยุ่น**: ไม่ต้องพึ่งพา naming convention
✅ **ชัดเจน**: เห็นชัดเจนว่า shift ไหนใช้กับ location ไหน
✅ **ง่ายต่อการจัดการ**: แก้ไขใน UI ได้ง่าย
✅ **รองรับ multiple locations**: OS shift เดียวใช้กับหลาย locations ได้
