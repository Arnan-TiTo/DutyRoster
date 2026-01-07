<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateHolidayCreditLedgerTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'ledger_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'employee_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'entry_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'leave_request_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'minutes_delta' => [
                'type' => 'INT',
                'constraint' => 11,
            ],
            'reason' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
            ],
        ]);

        $this->forge->addKey('ledger_id', true);
        $this->forge->addKey(['employee_id', 'created_at']);
        $this->forge->addForeignKey('employee_id', 'employees', 'employee_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('entry_id', 'roster_entries', 'entry_id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('leave_request_id', 'leave_requests', 'leave_request_id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('holiday_credit_ledger');
    }

    public function down()
    {
        $this->forge->dropTable('holiday_credit_ledger');
    }
}
