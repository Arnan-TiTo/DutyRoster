<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Employees extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\EmployeeModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $employees = $this->model->getAllWithTeam();
        return json_success(['employees' => $employees]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $employee = $this->model->getEmployeeWithTeam($id);

        if (!$employee) {
            return json_error('Employee not found', 404);
        }

        return json_success(['employee' => $employee]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $employeeId = $this->model->getInsertID();
            $employee = $this->model->find($employeeId);
            return json_success(['employee' => $employee], 201);
        }

        return json_error('Failed to create employee', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $employee = $this->model->find($id);
            return json_success(['employee' => $employee]);
        }

        return json_error('Failed to update employee', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Employee deleted']);
        }

        return json_error('Failed to delete employee', 500);
    }

    public function deactivate($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        if ($this->model->deactivate($id)) {
            return json_success(['message' => 'Employee deactivated']);
        }

        return json_error('Failed to deactivate employee', 500);
    }

    public function myHolidayBalance()
    {
        helper(['api', 'auth']);
        require_auth();

        $user = current_user();
        $employeeId = $user['employee_id'] ?? null;

        if (!$employeeId) {
            return json_error('No employee linked to user', 400);
        }

        $balance = $this->model->getHolidayBalance($employeeId);

        return json_success([
            'balance_minutes' => $balance,
            'balance_hours' => minutes_to_hours($balance),
            'balance_days' => minutes_to_days($balance),
        ]);
    }
}
