export const th = {
    // Roster
    roster: {
        title: 'จัดการตารางเวร',
        subtitle: 'จัดการการมอบหมายกะและกิจกรรม',
        createEntry: 'สร้างรายการเวร',
        editEntry: 'แก้ไขรายการเวร',
        deleteEntry: 'ลบรายการเวร',
        confirmDelete: 'ยืนยันการลบ',
        confirmDeleteMessage: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
        noEntries: 'ไม่พบรายการ',
        date: 'วันที่',
        eventType: 'ประเภทกิจกรรม',
        shiftSlot: 'ช่วงเวลากะ',
        timeRange: 'ช่วงเวลา',
        assignedStaff: 'พนักงานที่มอบหมาย',
        actions: 'การดำเนินการ'
    },

    // Common
    common: {
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        edit: 'แก้ไข',
        add: 'เพิ่ม',
        search: 'ค้นหา',
        loading: 'กำลังโหลด...',
        noData: 'ไม่พบข้อมูล',
        confirm: 'ยืนยัน',
        close: 'ปิด',
        export: 'ส่งออก',
        import: 'นำเข้า',
        yes: 'ใช่',
        no: 'ไม่ใช่',
        hours: 'ชั่วโมง',
        minutes: 'นาที',
        missingFields: 'กรุณากรอกข้อมูลให้ครบ',
        saveSuccess: 'บันทึกสำเร็จ',
        confirmDelete: 'ยืนยันการลบ?',
    },

    // Login
    login: {
        title: 'เข้าสู่ระบบ',
        username: 'ชื่อผู้ใช้',
        password: 'รหัสผ่าน',
        loginButton: 'เข้าสู่ระบบ',
        loggingIn: 'กำลังเข้าสู่ระบบ...',
        demoAccount: 'บัญชีทดสอบ',
    },

    // Sidebar
    sidebar: {
        calendar: 'ปฏิทิน',
        createEntry: 'สร้างรายการเวร',
        myLeave: 'ลาของฉัน',
        leaveApprovals: 'อนุมัติการลา',
        employees: 'พนักงาน',
        eventTypes: 'ประเภทกิจกรรม',
        shiftSlots: 'รอบเวลา',
        companyHolidays: 'วันหยุดบริษัท',
        teams: 'ทีม',
        leaveTypes: 'ประเภทการลา',
        rolesPerms: 'บทบาทและสิทธิ์',
        menuSystem: 'ระบบเมนู',
        users: 'ผู้ใช้งาน',
        reports: 'รายงาน',
        logout: 'ออกจากระบบ',
    },

    // Reports
    reports: {
        title: 'รายงาน',
        dailyRoster: 'ตารางเวรรายวัน',
        monthlySummary: 'สรุปรายเดือน',
        exportExcel: 'ส่งออก Excel',
        employee: 'พนักงาน',
        totalHours: 'ชั่วโมงรวม',
        leaves: 'วันลา',
        holidayCredit: 'เครดิตวันหยุด',
        date: 'วันที่',
        day: 'วัน',
        remark: 'หมายเหตุ',
    },

    // Calendar
    calendar: {
        month: 'เดือน',
        week: 'สัปดาห์',
        day: 'วัน',
        today: 'วันนี้',
        createEvent: 'สร้างกิจกรรม',
    },

    // Event Form
    eventForm: {
        eventType: 'ประเภทกิจกรรม',
        shiftSlot: 'รอบเวลา',
        startTime: 'เวลาเริ่ม',
        endTime: 'เวลาสิ้นสุด',
        assignStaff: 'มอบหมายพนักงาน',
        note: 'หมายเหตุ',
        selectEventType: 'เลือกประเภทกิจกรรม',
        selectShiftSlot: 'เลือกรอบเวลา',
    },

    // Employees
    employees: {
        title: 'จัดการพนักงาน',
        subtitle: 'จัดการข้อมูลพนักงาน',
        code: 'รหัสพนักงาน',
        addEmployee: 'เพิ่มพนักงาน',
        create: 'เพิ่มพนักงาน',
        edit: 'แก้ไขพนักงาน',
        firstName: 'ชื่อ',
        lastName: 'นามสกุล',
        nickName: 'ชื่อเล่น',
        email: 'อีเมล',
        phone: 'เบอร์โทร',
        position: 'ตำแหน่ง',
        roleTitle: 'ตำแหน่ง',
        team: 'ทีม',
        status: 'สถานะ',
        active: 'ใช้งาน',
        inactive: 'ไม่ใช้งาน',
        isActive: 'สถานะ',
        createUser: 'สร้างบัญชีผู้ใช้',
        username: 'ชื่อผู้ใช้',
        password: 'รหัสผ่าน',
        role: 'สิทธิ์การใช้งาน',
        deactivate: 'ปิดการใช้งาน',
        confirmDeactivate: 'คุณต้องการปิดการใช้งานพนักงานคนนี้ใช่หรือไม่?'
    },

    // Leaves
    leaves: {
        title: 'การลา',
        requestLeave: 'ขอลา',
        leaveType: 'ประเภทการลา',
        dateFrom: 'วันที่เริ่ม',
        dateTo: 'วันที่สิ้นสุด',
        reason: 'เหตุผล',
        status: 'สถานะ',
        pending: 'รอดำเนินการ',
        approved: 'อนุมัติ',
        rejected: 'ปฏิเสธ',
        canceled: 'ยกเลิก',
        subtitle: 'ขอลา / ดูสถานะ / ยกเลิก',
        myLeave: 'รายการลาของฉัน',
        confirmCancel: 'ยกเลิกคำขอลานี้?',
        confirmDelete: 'ลบรายการนี้?',
        cancelFailed: 'ยกเลิกไม่สำเร็จ',
        deleteFailed: 'ลบไม่สำเร็จ',
        insufficientCredit: 'ไม่สามารถขอลาได้: Holiday Credit ของคุณไม่เพียงพอ\n\nกรุณาตรวจสอบยอดคงเหลือและลองใหม่อีกครั้ง',
        createSuccess: 'ส่งคำขอสำเร็จ',
        createFailed: 'ส่งคำขอไม่สำเร็จ'
    },

    menus: {
        title: 'จัดการเมนู',
        code: 'รหัสเมนู',
        name: 'ชื่อเมนู',
        path: 'เส้นทาง (Path)',
        icon: 'ไอคอน',
        sort: 'ลำดับ',
        parent: 'เมนูหลัก',
        create: 'สร้างเมนู',
        edit: 'แก้ไขเมนู'
    },

    roles: {
        title: 'จัดการบทบาทและสิทธิ์',
        roleName: 'ชื่อบทบาท',
        description: 'คำอธิบาย',
        usersCount: 'จำนวนผู้ใช้',
        permissions: 'สิทธิ์การใช้งาน',
        create: 'สร้างบทบาท',
        edit: 'แก้ไขบทบาท',
        code: 'รหัสบทบาท',
        subtitle: 'จัดการบทบาทและสิทธิ์การเข้าถึงของผู้ใช้',
    },

    users: {
        title: 'จัดการผู้ใช้งาน',
        username: 'ชื่อผู้ใช้',
        role: 'บทบาท',
        employeeLink: 'เชื่อมโยงพนักงาน',
        create: 'สร้างผู้ใช้',
        edit: 'แก้ไขผู้ใช้',
        displayName: 'ชื่อที่แสดง',
        subtitle: 'จัดการบัญชีผู้ใช้และบทบาท',
        passwordRequired: 'ต้องระบุรหัสผ่านสำหรับผู้ใช้ใหม่',
        confirmDelete: 'ลบผู้ใช้นี้?',
        assignedTo: 'พนักงาน',
    },

    teams: {
        title: 'จัดการทีม',
        code: 'รหัสทีม',
        name: 'ชื่อทีม',
        color: 'สีประจำทีม',
        create: 'สร้างทีม',
        edit: 'แก้ไขทีม',
        subtitle: 'จัดการแผนกและทีมงาน'
    },

    leaveTypes: {
        title: 'ประเภทการลา',
        code: 'รหัส',
        name: 'ชื่อประเภท',
        quota: 'โควต้า (วัน/ปี)',
        paid: 'จ่ายค่าจ้าง',
        unpaid: 'ไม่จ่ายค่าจ้าง',
        isPaid: 'การจ่ายค่าจ้าง',
        active: 'ใช้งาน',
        create: 'สร้างประเภทการลา',
        edit: 'แก้ไขประเภทการลา',
        subtitle: 'กำหนดประเภทการลา'
    },

    eventTypes: {
        title: 'ประเภทกิจกรรม',
        subtitle: 'จัดการประเภทกิจกรรมและค่าเริ่มต้น',
        code: 'รหัสกิจกรรม',
        name: 'ชื่อกิจกรรม',
        color: 'สี',
        isWork: 'เป็นงาน',
        isHoliday: 'เป็นวันหยุด',
        defaultDuration: 'ระยะเวลา (นาที)',
        create: 'สร้างประเภทกิจกรรม',
        edit: 'แก้ไขประเภทกิจกรรม'
    },
    shiftSlots: {
        title: 'ช่วงเวลาเวร',
        subtitle: 'จัดการช่วงเวลาและจำนวนคน',
        code: 'รหัสช่วงเวลา',
        name: 'ชื่อช่วงเวลา',
        time: 'เวลา',
        startTime: 'เวลาเริ่ม',
        endTime: 'เวลาสิ้นสุด',
        minStaff: 'ขั้นต่ำ (คน)',
        maxStaff: 'สูงสุด (คน)',
        create: 'สร้างช่วงเวลา',
        edit: 'แก้ไขช่วงเวลา'
    },
    holidays: {
        title: 'วันหยุดบริษัท',
        subtitle: 'จัดการวันหยุดประจำปี',
        date: 'วันที่',
        name: 'ชื่อวันหยุด',
        type: 'ประเภท',
        create: 'สร้างวันหยุด',
        edit: 'แก้ไขวันหยุด'
    },

    approvals: {
        title: 'อนุมัติการลา',
        subtitle: 'ตรวจสอบและอนุมัติคำขอลา',
        employee: 'พนักงาน',
        type: 'ประเภท',
        from: 'จาก',
        to: 'ถึง',
        reason: 'เหตุผล',
        status: 'สถานะ',
        approve: 'อนุมัติ',
        reject: 'ปฏิเสธ',
        rejectReason: 'เหตุผลที่ปฏิเสธ (ถ้ามี)',
        confirmReject: 'คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?'
    },

    // Days of week
    days: {
        mon: 'จ.',
        tue: 'อ.',
        wed: 'พ.',
        thu: 'พฤ.',
        fri: 'ศ.',
        sat: 'ส.',
        sun: 'อา.',
    },
}

export type TranslationKeys = typeof th
