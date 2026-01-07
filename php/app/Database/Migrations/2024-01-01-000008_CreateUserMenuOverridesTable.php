<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUserMenuOverridesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'user_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'menu_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'allow_view' => [
                'type' => 'BOOLEAN',
                'null' => true,
            ],
            'allow_edit' => [
                'type' => 'BOOLEAN',
                'null' => true,
            ],
        ]);

        $this->forge->addKey(['user_id', 'menu_id'], true);
        $this->forge->addForeignKey('user_id', 'users', 'user_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('menu_id', 'menus', 'menu_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('user_menu_overrides');
    }

    public function down()
    {
        $this->forge->dropTable('user_menu_overrides');
    }
}
