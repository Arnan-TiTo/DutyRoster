<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMenusTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'menu_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'menu_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'menu_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'path' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
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

        $this->forge->addKey('menu_id', true);
        $this->forge->addUniqueKey('menu_code');
        $this->forge->createTable('menus');
    }

    public function down()
    {
        $this->forge->dropTable('menus');
    }
}
