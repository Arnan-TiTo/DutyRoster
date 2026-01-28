-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "employee_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL,
    "role_code" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "menus" (
    "menu_id" TEXT NOT NULL,
    "menu_code" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "path" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "role_menus" (
    "role_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("role_id","menu_id")
);

-- CreateTable
CREATE TABLE "user_menu_overrides" (
    "user_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "allow_view" BOOLEAN,
    "allow_edit" BOOLEAN,

    CONSTRAINT "user_menu_overrides_pkey" PRIMARY KEY ("user_id","menu_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" TEXT NOT NULL,
    "team_code" TEXT,
    "team_name" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" TEXT NOT NULL,
    "emp_code" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nick_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "role_title" TEXT,
    "team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "event_type_id" TEXT NOT NULL,
    "event_code" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "color_hex" TEXT NOT NULL DEFAULT '#3b82f6',
    "is_work" BOOLEAN NOT NULL DEFAULT true,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "default_duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("event_type_id")
);

-- CreateTable
CREATE TABLE "shift_slots" (
    "shift_slot_id" TEXT NOT NULL,
    "slot_code" TEXT,
    "slot_name" TEXT NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "min_staff" INTEGER NOT NULL DEFAULT 0,
    "max_staff" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shift_slots_pkey" PRIMARY KEY ("shift_slot_id")
);

-- CreateTable
CREATE TABLE "company_holidays" (
    "holiday_id" TEXT NOT NULL,
    "holiday_date" DATE NOT NULL,
    "holiday_name" TEXT NOT NULL,
    "holiday_type" TEXT NOT NULL DEFAULT 'ORG',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "company_holidays_pkey" PRIMARY KEY ("holiday_id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "leave_type_id" TEXT NOT NULL,
    "leave_code" TEXT NOT NULL,
    "leave_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("leave_type_id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "leave_request_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),
    "decided_by_user" TEXT,
    "decision_note" TEXT,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("leave_request_id")
);

-- CreateTable
CREATE TABLE "roster_entries" (
    "entry_id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "event_type_id" TEXT NOT NULL,
    "shift_slot_id" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_id" TEXT,

    CONSTRAINT "roster_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "roster_assignments" (
    "entry_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT,

    CONSTRAINT "roster_assignments_pkey" PRIMARY KEY ("entry_id","employee_id")
);

-- CreateTable
CREATE TABLE "holiday_credit_ledger" (
    "ledger_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "entry_id" TEXT,
    "leave_request_id" TEXT,
    "minutes_delta" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_credit_ledger_pkey" PRIMARY KEY ("ledger_id")
);

-- CreateTable
CREATE TABLE "settings" (
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("setting_key")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" TEXT NOT NULL,
    "location_code" TEXT,
    "location_name_th" TEXT,
    "location_name" TEXT NOT NULL,
    "shifts_per_day" INTEGER NOT NULL DEFAULT 1,
    "staff_per_shift" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "menus_menu_code_key" ON "menus"("menu_code");

-- CreateIndex
CREATE UNIQUE INDEX "teams_team_code_key" ON "teams"("team_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_emp_code_key" ON "employees"("emp_code");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_event_code_key" ON "event_types"("event_code");

-- CreateIndex
CREATE UNIQUE INDEX "shift_slots_slot_code_key" ON "shift_slots"("slot_code");

-- CreateIndex
CREATE UNIQUE INDEX "company_holidays_holiday_date_holiday_name_key" ON "company_holidays"("holiday_date", "holiday_name");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_leave_code_key" ON "leave_types"("leave_code");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_date_from_date_to_idx" ON "leave_requests"("employee_id", "date_from", "date_to");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "roster_entries_entry_date_idx" ON "roster_entries"("entry_date");

-- CreateIndex
CREATE INDEX "roster_entries_start_at_end_at_idx" ON "roster_entries"("start_at", "end_at");

-- CreateIndex
CREATE INDEX "roster_assignments_employee_id_idx" ON "roster_assignments"("employee_id");

-- CreateIndex
CREATE INDEX "holiday_credit_ledger_employee_id_created_at_idx" ON "holiday_credit_ledger"("employee_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_code_key" ON "locations"("location_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_menu_overrides" ADD CONSTRAINT "user_menu_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_menu_overrides" ADD CONSTRAINT "user_menu_overrides_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("leave_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_decided_by_user_fkey" FOREIGN KEY ("decided_by_user") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("event_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_shift_slot_id_fkey" FOREIGN KEY ("shift_slot_id") REFERENCES "shift_slots"("shift_slot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "roster_entries"("entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_credit_ledger" ADD CONSTRAINT "holiday_credit_ledger_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_credit_ledger" ADD CONSTRAINT "holiday_credit_ledger_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "roster_entries"("entry_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_credit_ledger" ADD CONSTRAINT "holiday_credit_ledger_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("leave_request_id") ON DELETE SET NULL ON UPDATE CASCADE;
