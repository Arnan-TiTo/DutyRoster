<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRosterAssignmentsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'entry_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'employee_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'assigned_at' => [
                'type' => 'DATETIME',
            ],
            'assigned_by' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
        ]);

        $this->forge->addKey(['entry_id', 'employee_id'], true);
        $this->forge->addKey('employee_id');
        $this->forge->addForeignKey('entry_id', 'roster_entries', 'entry_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('employee_id', 'employees', 'employee_id', 'RESTRICT', 'CASCADE');
        $this->forge->addForeignKey('assigned_by', 'users', 'user_id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('roster_assignments');
    }

    public function down()
    {
        $this->forge->dropTable('roster_assignments');
    }
}
