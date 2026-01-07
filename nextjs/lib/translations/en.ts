import { TranslationKeys } from './th'

export const en: TranslationKeys = {
    // Roster
    roster: {
        title: 'Roster Management',
        subtitle: 'Manage shift assignments and events',
        createEntry: 'Create Entry',
        editEntry: 'Edit Entry',
        deleteEntry: 'Delete Entry',
        confirmDelete: 'Confirm Delete',
        confirmDeleteMessage: 'Are you sure you want to delete this entry? This action cannot be undone.',
        noEntries: 'No entries found',
        date: 'Date',
        eventType: 'Event Type',
        shiftSlot: 'Shift Slot',
        timeRange: 'Time Range',
        assignedStaff: 'Assigned Staff',
        actions: 'Actions'
    },

    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        noData: 'No data found',
        confirm: 'Confirm',
        close: 'Close',
        export: 'Export',
        import: 'Import',
        yes: 'Yes',
        no: 'No',
        hours: 'Hours',
        minutes: 'Minutes',
        missingFields: 'Please fill all fields',
        saveSuccess: 'Saved successfully',
        confirmDelete: 'Are you sure?',
    },

    // Login
    login: {
        title: 'Login',
        username: 'Username',
        password: 'Password',
        loginButton: 'Login',
        loggingIn: 'Logging in...',
        demoAccount: 'Demo Account',
    },

    // Sidebar
    sidebar: {
        calendar: 'Calendar',
        createEntry: 'Create Entry',
        myLeave: 'My Leave',
        leaveApprovals: 'Leave Approvals',
        employees: 'Employees',
        eventTypes: 'Event Types',
        shiftSlots: 'Shift Slots',
        companyHolidays: 'Company Holidays',
        teams: 'Teams',
        leaveTypes: 'Leave Types',
        rolesPerms: 'Roles & Permissions',
        menuSystem: 'Menu System',
        users: 'Users',
        reports: 'Reports',
        logout: 'Logout',
    },

    // Reports
    reports: {
        title: 'Reports',
        dailyRoster: 'Daily Roster',
        monthlySummary: 'Monthly Summary',
        exportExcel: 'Export Excel',
        employee: 'Employee',
        totalHours: 'Total Hours',
        leaves: 'Leaves (Days)',
        holidayCredit: 'Holiday Credit (Day)',
        date: 'Date',
        day: 'Day',
        remark: 'Remark',
    },

    // Calendar
    calendar: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        today: 'Today',
        createEvent: 'Create Event',
    },

    // Event Form
    eventForm: {
        eventType: 'Event Type',
        shiftSlot: 'Shift Slot',
        startTime: 'Start Time',
        endTime: 'End Time',
        assignStaff: 'Assign Staff',
        note: 'Note',
        selectEventType: 'Select Event Type',
        selectShiftSlot: 'Select Shift Slot',
    },

    // Employees
    employees: {
        title: 'Employee Management',
        subtitle: 'Manage employee records',
        code: 'Emp Code',
        addEmployee: 'Add Employee',
        create: 'Add Employee',
        edit: 'Edit Employee',
        firstName: 'First Name',
        lastName: 'Last Name',
        nickName: 'Nickname',
        email: 'Email',
        phone: 'Phone',
        position: 'Position',
        roleTitle: 'Position',
        team: 'Team',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        isActive: 'Active',
        createUser: 'Create User Account',
        username: 'Username',
        password: 'Password',
        role: 'Role',
        deactivate: 'Deactivate',
        confirmDeactivate: 'Deactivate this employee?'
    },

    // Leaves
    leaves: {
        title: 'Leave Requests',
        requestLeave: 'Request Leave',
        leaveType: 'Leave Type',
        dateFrom: 'From Date',
        dateTo: 'To Date',
        reason: 'Reason',
        status: 'Status',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        myLeave: 'My Leave',
        confirmCancel: 'Cancel this request?',
        confirmDelete: 'Delete this request?',
        cancelFailed: 'Cancel failed',
        deleteFailed: 'Delete failed',
        insufficientCredit: 'Cannot request leave: Insufficient Holiday Credit.\n\nPlease check your balance and try again.',
        createSuccess: 'Request submitted successfully',
        createFailed: 'Request failed',
        canceled: 'Canceled',
        subtitle: 'Manage leave requests',
    },

    menus: {
        title: 'Menu Management',
        code: 'Menu Code',
        name: 'Menu Name',
        path: 'Path',
        icon: 'Icon',
        sort: 'Sort Order',
        parent: 'Parent Menu',
        create: 'Create Menu',
        edit: 'Edit Menu'
    },

    roles: {
        title: 'Roles & Permissions',
        roleName: 'Role Name',
        description: 'Description',
        usersCount: 'Users Count',
        permissions: 'Permissions',
        create: 'Create Role',
        edit: 'Edit Role',
        code: 'Role Code',
        subtitle: 'Manage user roles and access rights.',
    },

    users: {
        title: 'User Management',
        username: 'Username',
        role: 'Role',
        employeeLink: 'Employee Link',
        create: 'Create User',
        edit: 'Edit User',
        displayName: 'Display Name',
        subtitle: 'Manage system accounts and roles.',
        passwordRequired: 'Password required for new user',
        confirmDelete: 'Delete this user?',
        assignedTo: 'Assigned To',
    },

    teams: {
        title: 'Team Management',
        code: 'Team Code',
        name: 'Team Name',
        color: 'Team Color',
        create: 'Create Team',
        edit: 'Edit Team',
        subtitle: 'Manage departments and teams.'
    },

    leaveTypes: {
        title: 'Leave Types',
        code: 'Code',
        name: 'Name',
        quota: 'Quota (Days/Year)',
        paid: 'Paid',
        unpaid: 'Unpaid',
        isPaid: 'Payment Status',
        active: 'Active',
        create: 'Create Leave Type',
        edit: 'Edit Leave Type',
        subtitle: 'Configure leave categories.'
    },

    eventTypes: {
        title: 'Event Types',
        subtitle: 'Manage event types and defaults',
        code: 'Event Code',
        name: 'Event Name',
        color: 'Color',
        isWork: 'Is Work',
        isHoliday: 'Is Holiday',
        defaultDuration: 'Default Duration (min)',
        create: 'Create Event Type',
        edit: 'Edit Event Type'
    },
    shiftSlots: {
        title: 'Shift Slots',
        subtitle: 'Manage shift times and staffing requirements',
        code: 'Slot Code',
        name: 'Slot Name',
        time: 'Time',
        startTime: 'Start Time',
        endTime: 'End Time',
        minStaff: 'Min Staff',
        maxStaff: 'Max Staff',
        create: 'Create Shift Slot',
        edit: 'Edit Shift Slot'
    },
    holidays: {
        title: 'Company Holidays',
        subtitle: 'Manage annual holidays',
        date: 'Date',
        name: 'Holiday Name',
        type: 'Type',
        create: 'Create Holiday',
        edit: 'Edit Holiday'
    },

    approvals: {
        title: 'Leave Approvals',
        subtitle: 'Approve or reject leave requests',
        employee: 'Employee',
        type: 'Type',
        from: 'From',
        to: 'To',
        reason: 'Reason',
        status: 'Status',
        approve: 'Approve',
        reject: 'Reject',
        rejectReason: 'Reason for rejection (optional)',
        confirmReject: 'Reject this request?'
    },

    // Days of week
    days: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun',
    },
}
