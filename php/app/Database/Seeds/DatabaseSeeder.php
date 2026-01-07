<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        helper('api');

        // Create Roles
        $roles = [
            ['role_id' => get_uuid(), 'role_code' => 'ADMIN', 'role_name' => 'Administrator'],
            ['role_id' => get_uuid(), 'role_code' => 'SUPERVISOR', 'role_name' => 'Supervisor'],
            ['role_id' => get_uuid(), 'role_code' => 'STAFF', 'role_name' => 'Staff'],
        ];

        $this->db->table('roles')->insertBatch($roles);

        // Get role IDs for later use
        $adminRole = $this->db->table('roles')->where('role_code', 'ADMIN')->get()->getRowArray();
        $supervisorRole = $this->db->table('roles')->where('role_code', 'SUPERVISOR')->get()->getRowArray();
        $staffRole = $this->db->table('roles')->where('role_code', 'STAFF')->get()->getRowArray();

        // Create Teams
        $teams = [
            ['team_id' => get_uuid(), 'team_code' => 'SALES', 'team_name' => 'Sales Team'],
            ['team_id' => get_uuid(), 'team_code' => 'SERVICE', 'team_name' => 'Service Team'],
            ['team_id' => get_uuid(), 'team_code' => 'PARTS', 'team_name' => 'Parts Department'],
        ];

        $this->db->table('teams')->insertBatch($teams);

        // Get team IDs
        $salesTeam = $this->db->table('teams')->where('team_code', 'SALES')->get()->getRowArray();
        $serviceTeam = $this->db->table('teams')->where('team_code', 'SERVICE')->get()->getRowArray();

        // Create Employees
        $employees = [
            [
                'employee_id' => get_uuid(),
                'emp_code' => 'EMP001',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'nick_name' => 'Admin',
                'email' => 'admin@dutyroster.com',
                'phone' => '081-111-1111',
                'role_title' => 'System Administrator',
                'team_id' => null,
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'employee_id' => get_uuid(),
                'emp_code' => 'EMP002',
                'first_name' => 'Supervisor',
                'last_name' => 'User',
                'nick_name' => 'Super',
                'email' => 'supervisor@dutyroster.com',
                'phone' => '081-222-2222',
                'role_title' => 'Team Supervisor',
                'team_id' => $salesTeam['team_id'],
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'employee_id' => get_uuid(),
                'emp_code' => 'EMP003',
                'first_name' => 'Staff',
                'last_name' => 'User',
                'nick_name' => 'Staffy',
                'email' => 'staff@dutyroster.com',
                'phone' => '081-333-3333',
                'role_title' => 'Sales Staff',
                'team_id' => $salesTeam['team_id'],
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('employees')->insertBatch($employees);

        // Get employee IDs
        $adminEmp = $this->db->table('employees')->where('emp_code', 'EMP001')->get()->getRowArray();
        $supervisorEmp = $this->db->table('employees')->where('emp_code', 'EMP002')->get()->getRowArray();
        $staffEmp = $this->db->table('employees')->where('emp_code', 'EMP003')->get()->getRowArray();

        // Create Users
        $defaultPassword = password_hash('Admin@9999', PASSWORD_BCRYPT);

        $users = [
            [
                'user_id' => get_uuid(),
                'username' => 'admin',
                'password_hash' => $defaultPassword,
                'display_name' => 'Administrator',
                'employee_id' => $adminEmp['employee_id'],
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'user_id' => get_uuid(),
                'username' => 'supervisor',
                'password_hash' => $defaultPassword,
                'display_name' => 'Supervisor',
                'employee_id' => $supervisorEmp['employee_id'],
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'user_id' => get_uuid(),
                'username' => 'staff',
                'password_hash' => $defaultPassword,
                'display_name' => 'Staff Member',
                'employee_id' => $staffEmp['employee_id'],
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('users')->insertBatch($users);

        // Assign roles to users
        $adminUser = $this->db->table('users')->where('username', 'admin')->get()->getRowArray();
        $supervisorUser = $this->db->table('users')->where('username', 'supervisor')->get()->getRowArray();
        $staffUser = $this->db->table('users')->where('username', 'staff')->get()->getRowArray();

        $userRoles = [
            ['user_id' => $adminUser['user_id'], 'role_id' => $adminRole['role_id']],
            ['user_id' => $supervisorUser['user_id'], 'role_id' => $supervisorRole['role_id']],
            ['user_id' => $staffUser['user_id'], 'role_id' => $staffRole['role_id']],
        ];

        $this->db->table('user_roles')->insertBatch($userRoles);

        // Create Event Types
        $eventTypes = [
            [
                'event_type_id' => get_uuid(),
                'event_code' => 'WORK_REGULAR',
                'event_name' => 'Regular Work',
                'color_hex' => '#3b82f6',
                'is_work' => true,
                'is_holiday' => false,
                'default_duration_minutes' => 480,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'event_type_id' => get_uuid(),
                'event_code' => 'WORK_HOLIDAY',
                'event_name' => 'Work on Holiday',
                'color_hex' => '#f59e0b',
                'is_work' => true,
                'is_holiday' => true,
                'default_duration_minutes' => 480,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'event_type_id' => get_uuid(),
                'event_code' => 'TRAINING',
                'event_name' => 'Training',
                'color_hex' => '#8b5cf6',
                'is_work' => true,
                'is_holiday' => false,
                'default_duration_minutes' => 240,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        $this->db->table('event_types')->insertBatch($eventTypes);

        // Create Shift Slots
        $shiftSlots = [
            [
                'shift_slot_id' => get_uuid(),
                'slot_code' => 'MORNING',
                'slot_name' => 'Morning Shift',
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
                'min_staff' => 2,
                'max_staff' => 5,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'shift_slot_id' => get_uuid(),
                'slot_code' => 'AFTERNOON',
                'slot_name' => 'Afternoon Shift',
                'start_time' => '12:00:00',
                'end_time' => '20:00:00',
                'min_staff' => 2,
                'max_staff' => 5,
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        $this->db->table('shift_slots')->insertBatch($shiftSlots);

        // Create Leave Types
        $leaveTypes = [
            [
                'leave_type_id' => get_uuid(),
                'leave_code' => 'ANNUAL',
                'leave_name' => 'Annual Leave',
                'is_active' => true,
            ],
            [
                'leave_type_id' => get_uuid(),
                'leave_code' => 'SICK',
                'leave_name' => 'Sick Leave',
                'is_active' => true,
            ],
            [
                'leave_type_id' => get_uuid(),
                'leave_code' => 'PERSONAL',
                'leave_name' => 'Personal Leave',
                'is_active' => true,
            ],
        ];

        $this->db->table('leave_types')->insertBatch($leaveTypes);

        // Create sample holiday credits
        $credits = [
            [
                'ledger_id' => get_uuid(),
                'employee_id' => $adminEmp['employee_id'],
                'entry_id' => null,
                'leave_request_id' => null,
                'minutes_delta' => 4800, // 10 days
                'reason' => 'Initial credit allocation',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'ledger_id' => get_uuid(),
                'employee_id' => $supervisorEmp['employee_id'],
                'entry_id' => null,
                'leave_request_id' => null,
                'minutes_delta' => 4800,
                'reason' => 'Initial credit allocation',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'ledger_id' => get_uuid(),
                'employee_id' => $staffEmp['employee_id'],
                'entry_id' => null,
                'leave_request_id' => null,
                'minutes_delta' => 3840, // 8 days
                'reason' => 'Initial credit allocation',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('holiday_credit_ledger')->insertBatch($credits);

        echo "Database seeded successfully!\n";
        echo "Demo users created:\n";
        echo "- admin / Admin@9999 (Administrator)\n";
        echo "- supervisor / Admin@9999 (Supervisor)\n";
        echo "- staff / Admin@9999 (Staff)\n";
    }
}
