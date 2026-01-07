<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateShiftSlotsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'shift_slot_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'slot_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'slot_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'start_time' => [
                'type' => 'TIME',
            ],
            'end_time' => [
                'type' => 'TIME',
            ],
            'min_staff' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'max_staff' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'sort_order' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'is_active' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
        ]);

        $this->forge->addKey('shift_slot_id', true);
        $this->forge->addUniqueKey('slot_code');
        $this->forge->createTable('shift_slots');
    }

    public function down()
    {
        $this->forge->dropTable('shift_slots');
    }
}
