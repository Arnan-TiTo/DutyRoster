<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRolesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'role_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'role_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'role_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
        ]);

        $this->forge->addKey('role_id', true);
        $this->forge->addUniqueKey('role_code');
        $this->forge->createTable('roles');
    }

    public function down()
    {
        $this->forge->dropTable('roles');
    }
}
