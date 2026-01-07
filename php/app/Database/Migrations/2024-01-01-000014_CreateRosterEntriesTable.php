<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRosterEntriesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'entry_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'entry_date' => [
                'type' => 'DATE',
            ],
            'event_type_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'shift_slot_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'start_at' => [
                'type' => 'DATETIME',
            ],
            'end_at' => [
                'type' => 'DATETIME',
            ],
            'note' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_by' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('entry_id', true);
        $this->forge->addKey('entry_date');
        $this->forge->addKey(['start_at', 'end_at']);
        $this->forge->addForeignKey('event_type_id', 'event_types', 'event_type_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('shift_slot_id', 'shift_slots', 'shift_slot_id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('created_by', 'users', 'user_id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('roster_entries');
    }

    public function down()
    {
        $this->forge->dropTable('roster_entries');
    }
}
