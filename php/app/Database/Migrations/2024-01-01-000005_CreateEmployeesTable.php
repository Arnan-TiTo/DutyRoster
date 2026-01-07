<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEmployeesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'employee_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
            ],
            'emp_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'first_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'last_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'nick_name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => true,
            ],
            'phone' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'role_title' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => true,
            ],
            'team_id' => [
                'type' => 'CHAR',
                'constraint' => 36,
                'null' => true,
            ],
            'is_active' => [
                'type' => 'BOOLEAN',
                'default' => true,
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

        $this->forge->addKey('employee_id', true);
        $this->forge->addUniqueKey('emp_code');
        $this->forge->addKey('team_id');
        $this->forge->addForeignKey('team_id', 'teams', 'team_id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('employees');

        // Add foreign key from users to employees
        $this->db->query('ALTER TABLE users ADD CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL');
    }

    public function down()
    {
        $this->db->query('ALTER TABLE users DROP FOREIGN KEY fk_users_employee');
        $this->forge->dropTable('employees');
    }
}
