-- SQL Script เพื่ออัพเดท location_code
-- Based on shift names ที่เห็นในรูป:
-- 1. เวร 2 (10:00-19:00) 
-- 2. เวรทำงาน ICON (10:00-19:00)
-- 3. เวรนอกสถานที่ 1 (10:00-19:00)
-- 4. เวรวันอาทิตย์ (09:00-18:00)
-- 5. เวร 1 (08:20-17:30)

-- Method 1: อัพเดทตามชื่อ slot_name
UPDATE shift_slots SET location_code = 'LP1' WHERE slot_name = 'เวร 1';
UPDATE shift_slots SET location_code = 'LP2' WHERE slot_name = 'เวร 2';
UPDATE shift_slots SET location_code = 'LP3' WHERE slot_name = 'เวรวันอาทิตย์';
UPDATE shift_slots SET location_code = 'OS-Icon' WHERE slot_name = 'เวรทำงาน ICON';
UPDATE shift_slots SET location_code = 'OS-SP' WHERE slot_name = 'เวรนอกสถานที่ 1';

-- Method 2: อัพเดทตามเวลา (ถ้า Method 1 ไม่ work)
-- UPDATE shift_slots SET location_code = 'LP1' WHERE start_time = '08:20:00' AND end_time = '17:30:00';
-- UPDATE shift_slots SET location_code = 'LP2' WHERE start_time = '10:00:00' AND end_time = '19:00:00' AND slot_name LIKE '%เวร 2%';
-- UPDATE shift_slots SET location_code = 'LP3' WHERE start_time = '09:00:00' AND end_time = '18:00:00';
-- UPDATE shift_slots SET location_code = 'OS-Icon' WHERE slot_name LIKE '%ICON%';
-- UPDATE shift_slots SET location_code = 'OS-SP' WHERE slot_name LIKE '%นอกสถานที่%';

-- ตรวจสอบผลลัพธ์
SELECT slot_name, location_code, start_time, end_time 
FROM shift_slots 
ORDER BY location_code NULLS LAST, start_time;

-- แสดงจำนวน shifts ที่มี location_code
SELECT 
    location_code,
    COUNT(*) as count
FROM shift_slots
GROUP BY location_code;
