<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCompanyHolidaysTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'holiday_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'holiday_date' => [
                'type' => 'DATE',
            ],
            'holiday_name' => [
                'type' => 'VARCHAR',
                'constraint' => 200,
            ],
            'holiday_type' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'default' => 'ORG',
            ],
            'is_active' => [
                'type' => 'BOOLEAN',
                'default' => true,
            ],
        ]);

        $this->forge->addKey('holiday_id', true);
        $this->forge->addUniqueKey(['holiday_date', 'holiday_name']);
        $this->forge->createTable('company_holidays');
    }

    public function down()
    {
        $this->forge->dropTable('company_holidays');
    }
}
