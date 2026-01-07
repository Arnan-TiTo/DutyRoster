<?php

return [
    // Common
    'common' => [
        'save' => 'บันทึก',
        'cancel' => 'ยกเลิก',
        'delete' => 'ลบ',
        'edit' => 'แก้ไข',
        'add' => 'เพิ่ม',
        'search' => 'ค้นหา',
        'loading' => 'กำลังโหลด...',
        'no_data' => 'ไม่พบข้อมูล',
        'confirm' => 'ยืนยัน',
        'close' => 'ปิด',
        'yes' => 'ใช่',
        'no' => 'ไม่',
        'actions' => 'การดำเนินการ',
        'status' => 'สถานะ',
        'active' => 'ใช้งาน',
        'inactive' => 'ไม่ใช้งาน',
        'created_at' => 'สร้างเมื่อ',
        'updated_at' => 'แก้ไขเมื่อ',
    ],

    // Auth
    'auth' => [
        'login' => 'เข้าสู่ระบบ',
        'logout' => 'ออกจากระบบ',
        'username' => 'ชื่อผู้ใช้',
        'password' => 'รหัสผ่าน',
        'remember_me' => 'จดจำฉันไว้',
        'forgot_password' => 'ลืมรหัสผ่าน?',
        'login_failed' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        'logout_success' => 'ออกจากระบบเรียบร้อย',
    ],

    // Menu
    'menu' => [
        'dashboard' => 'หน้าหลัก',
        'calendar' => 'ปฏิทิน',
        'my_leave' => 'การลาของฉัน',
        'leave_approvals' => 'อนุมัติการลา',
        'employees' => 'พนักงาน',
        'teams' => 'ทีม/แผนก',
        'roster' => 'ตารางเวร',
        'reports' => 'รายงาน',
        'users' => 'ผู้ใช้งาน',
        'settings' => 'ตั้งค่า',
        'event_types' => 'ประเภทกิจกรรม',
        'shift_slots' => 'กะเวลาทำงาน',
        'company_holidays' => 'วันหยุดบริษัท',
        'leave_types' => 'ประเภทการลา',
        'roles' => 'สิทธิ์การใช้งาน',
        'menus' => 'เมนูระบบ',
    ],

    // Employee
    'employee' => [
        'title' => 'จัดการพนักงาน',
        'add' => 'เพิ่มพนักงาน',
        'edit' => 'แก้ไขพนักงาน',
        'emp_code' => 'รหัสพนักงาน',
        'first_name' => 'ชื่อ',
        'last_name' => 'นามสกุล',
        'nick_name' => 'ชื่อเล่น',
        'email' => 'อีเมล',
        'phone' => 'เบอร์โทร',
        'role_title' => 'ตำแหน่ง',
        'team' => 'ทีม',
        'is_active' => 'ใช้งาน',
        'deactivate' => 'ปิดการใช้งาน',
        'activate' => 'เปิดการใช้งาน',
    ],

    // Leave
    'leave' => [
        'title' => 'คำขอลา',
        'my_leaves' => 'การลาของฉัน',
        'request' => 'ขอลา',
        'leave_type' => 'ประเภทการลา',
        'date_from' => 'ตั้งแต่วันที่',
        'date_to' => 'ถึงวันที่',
        'reason' => 'เหตุผล',
        'status_pending' => 'รออนุมัติ',
        'status_approved' => 'อนุมัติ',
        'status_rejected' => 'ไม่อนุมัติ',
        'status_canceled' => 'ยกเลิก',
        'approve' => 'อนุมัติ',
        'reject' => 'ไม่อนุมัติ',
        'cancel' => 'ยกเลิก',
        'decision_note' => 'หมายเหตุการตัดสินใจ',
        'requested_at' => 'ขอเมื่อ',
        'decided_at' => 'ตัดสินใจเมื่อ',
        'decided_by' => 'ตัดสินโดย',
        'balance' => 'วันลาคงเหลือ',
    ],

    // Roster
    'roster' => [
        'title' => 'จัดการตารางเวร',
        'create_entry' => 'สร้างรายการ',
        'edit_entry' => 'แก้ไขรายการ',
        'entry_date' => 'วันที่',
        'event_type' => 'ประเภทกิจกรรม',
        'shift_slot' => 'กะเวลา',
        'start_time' => 'เวลาเริ่ม',
        'end_time' => 'เวลาสิ้นสุด',
        'assigned_staff' => 'พนักงานที่มอบหมาย',
        'note' => 'หมายเหตุ',
    ],

    // Team
    'team' => [
        'title' => 'จัดการทีม',
        'add' => 'เพิ่มทีม',
        'edit' => 'แก้ไขทีม',
        'team_code' => 'รหัสทีม',
        'team_name' => 'ชื่อทีม',
        'employee_count' => 'จำนวนพนักงาน',
    ],

    // User
    'user' => [
        'title' => 'จัดการผู้ใช้',
        'add' => 'เพิ่มผู้ใช้',
        'edit' => 'แก้ไขผู้ใช้',
        'username' => 'ชื่อผู้ใช้',
        'display_name' => 'ชื่อแสดง',
        'password' => 'รหัสผ่าน',
        'employee' => 'เชื่อมโยงพนักงาน',
        'roles' => 'สิทธิ์',
        'is_active' => 'ใช้งาน',
    ],

    // Report
    'report' => [
        'title' => 'รายงาน',
        'daily_roster' => 'รายงานตารางเวรรายวัน',
        'monthly_summary' => 'สรุปรายเดือน',
        'export_excel' => 'ส่งออก Excel',
        'select_date' => 'เลือกวันที่',
        'select_month' => 'เลือกเดือน',
        'employee' => 'พนักงาน',
        'total_hours' => 'ชั่วโมงรวม',
        'leave_days' => 'วันลา',
    ],

    // Calendar
    'calendar' => [
        'title' => 'ปฏิทิน',
        'today' => 'วันนี้',
        'month' => 'เดือน',
        'week' => 'สัปดาห์',
        'day' => 'วัน',
    ],

    // Messages
    'message' => [
        'save_success' => 'บันทึกสำเร็จ',
        'save_failed' => 'บันทึกไม่สำเร็จ',
        'delete_success' => 'ลบสำเร็จ',
        'delete_failed' => 'ลบไม่สำเร็จ',
        'delete_confirm' => 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?',
        'action_success' => 'ดำเนินการสำเร็จ',
        'action_failed' => 'ดำเนินการไม่สำเร็จ',
        'unauthorized' => 'ไม่มีสิทธิ์เข้าถึง',
        'forbidden' => 'คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้',
    ],
];
