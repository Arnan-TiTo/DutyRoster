<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLeaveRequestsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'leave_request_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'employee_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'leave_type_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'date_from' => [
                'type' => 'DATE',
            ],
            'date_to' => [
                'type' => 'DATE',
            ],
            'reason' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'default' => 'PENDING',
            ],
            'requested_at' => [
                'type' => 'DATETIME',
            ],
            'decided_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'decided_by_user' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'decision_note' => [
                'type' => 'TEXT',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('leave_request_id', true);
        $this->forge->addKey(['employee_id', 'date_from', 'date_to']);
        $this->forge->addKey('status');
        $this->forge->addForeignKey('employee_id', 'employees', 'employee_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('leave_type_id', 'leave_types', 'leave_type_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('decided_by_user', 'users', 'user_id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('leave_requests');
    }

    public function down()
    {
        $this->forge->dropTable('leave_requests');
    }
}
