<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRoleMenusTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'role_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'menu_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'can_view' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
            'can_edit' => [
                'type' => 'BOOLEAN',
                'default' => false,
            ],
        ]);

        $this->forge->addKey(['role_id', 'menu_id'], true);
        $this->forge->addForeignKey('role_id', 'roles', 'role_id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('menu_id', 'menus', 'menu_id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('role_menus');
    }

    public function down()
    {
        $this->forge->dropTable('role_menus');
    }
}
