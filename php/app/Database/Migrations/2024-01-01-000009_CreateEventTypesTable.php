<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEventTypesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'event_type_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'event_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'event_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'color_hex' => [
                'type' => 'VARCHAR',
                'constraint' => 7,
                'default' => '#3b82f6',
            ],
            'is_work' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
            'is_holiday' => [
                'type' => 'BOOLEAN',
                'default' => false,
            ],
            'default_duration_minutes' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'is_active' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
            'sort_order' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
        ]);

        $this->forge->addKey('event_type_id', true);
        $this->forge->addUniqueKey('event_code');
        $this->forge->createTable('event_types');
    }

    public function down()
    {
        $this->forge->dropTable('event_types');
    }
}
