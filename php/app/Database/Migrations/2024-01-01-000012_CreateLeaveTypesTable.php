<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLeaveTypesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'leave_type_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'leave_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'leave_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'is_active' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
        ]);

        $this->forge->addKey('leave_type_id', true);
        $this->forge->addUniqueKey('leave_code');
        $this->forge->createTable('leave_types');
    }

    public function down()
    {
        $this->forge->dropTable('leave_types');
    }
}
