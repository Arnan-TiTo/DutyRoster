<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTeamsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'team_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'team_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'team_name' => [
                'type' => 'VARCHAR',
                'constraint' => 200,
            ],
        ]);

        $this->forge->addKey('team_id', true);
        $this->forge->addUniqueKey('team_code');
        $this->forge->createTable('teams');
    }

    public function down()
    {
        $this->forge->dropTable('teams');
    }
}
