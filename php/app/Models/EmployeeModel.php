<?php

namespace App\Models;

use CodeIgniter\Model;

class EmployeeModel extends Model
{
    protected $table = 'employees';
    protected $primaryKey = 'employee_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'employee_id',
        'emp_code',
        'first_name',
        'last_name',
        'nick_name',
        'phone',
        'email',
        'role_title',
        'team_id',
        'is_active',
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    protected array $casts = [
        'is_active' => 'boolean',
    ];

    protected $validationRules = [
        'first_name' => 'required|max_length[100]',
        'last_name' => 'required|max_length[100]',
        'emp_code' => 'permit_empty|max_length[50]|is_unique[employees.emp_code,employee_id,{employee_id}]',
        'email' => 'permit_empty|valid_email|max_length[255]',
        'phone' => 'permit_empty|max_length[50]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['employee_id'])) {
            $data['data']['employee_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get employee with team info
     */
    public function getEmployeeWithTeam(string $employeeId)
    {
        return $this->select('employees.*, teams.team_name, teams.team_code')
            ->join('teams', 'teams.team_id = employees.team_id', 'left')
            ->where('employees.employee_id', $employeeId)
            ->first();
    }

    /**
     * Get all employees with team info
     */
    public function getAllWithTeam()
    {
        return $this->select('employees.*, teams.team_name, teams.team_code')
            ->join('teams', 'teams.team_id = employees.team_id', 'left')
            ->where('employees.is_active', true)
            ->orderBy('employees.first_name')
            ->findAll();
    }

    /**
     * Get employees by team
     */
    public function getByTeam(string $teamId)
    {
        return $this->where('team_id', $teamId)
            ->where('is_active', true)
            ->orderBy('first_name')
            ->findAll();
    }

    /**
     * Deactivate employee
     */
    public function deactivate(string $employeeId): bool
    {
        return $this->update($employeeId, ['is_active' => false]);
    }

    /**
     * Get holiday credit balance for employee
     */
    public function getHolidayBalance(string $employeeId): int
    {
        $db = \Config\Database::connect();

        $result = $db->table('holiday_credit_ledger')
            ->selectSum('minutes_delta', 'total')
            ->where('employee_id', $employeeId)
            ->get()
            ->getRowArray();

        return (int) ($result['total'] ?? 0);
    }
}
