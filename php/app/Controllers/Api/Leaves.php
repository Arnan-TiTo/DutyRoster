<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Leaves extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\LeaveRequestModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $user = current_user();
        $employeeId = null;

        // Staff can only see their own leaves
        if (has_role('STAFF') && !has_role(['ADMIN', 'SUPERVISOR'])) {
            $employeeId = $user['employee_id'];
        }

        $leaves = $this->model->getWithDetails($employeeId);

        return json_success(['leaves' => $leaves]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $leave = $this->model->find($id);

        if (!$leave) {
            return json_error('Leave request not found', 404);
        }

        return json_success(['leave' => $leave]);
    }

    public function create()
    {
        helper(['api', 'auth', 'time']);
        require_auth();

        $json = $this->request->getJSON(true);
        $user = current_user();

        // Set employee_id from current user if not admin
        if (!is_admin() && !is_supervisor()) {
            $json['employee_id'] = $user['employee_id'];
        }

        // Check holiday credit balance
        $employeeModel = model('EmployeeModel');
        $balance = $employeeModel->getHolidayBalance($json['employee_id']);
        $days = count(get_date_range($json['date_from'], $json['date_to']));
        $requiredMinutes = $days * 8 * 60;

        if ($balance < $requiredMinutes) {
            return json_error('Insufficient holiday credit', 400);
        }

        if ($this->model->insert($json)) {
            $leaveId = $this->model->getInsertID();
            $leave = $this->model->find($leaveId);
            return json_success(['leave' => $leave], 201);
        }

        return json_error('Failed to create leave request', 500, $this->model->errors());
    }

    public function approve($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);
        $note = $json['note'] ?? null;

        if ($this->model->approve($id, current_user_id(), $note)) {
            return json_success(['message' => 'Leave request approved']);
        }

        return json_error('Failed to approve leave request', 500);
    }

    public function reject($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);
        $note = $json['note'] ?? null;

        if ($this->model->reject($id, current_user_id(), $note)) {
            return json_success(['message' => 'Leave request rejected']);
        }

        return json_error('Failed to reject leave request', 500);
    }

    public function cancel($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        if ($this->model->cancel($id)) {
            return json_success(['message' => 'Leave request canceled']);
        }

        return json_error('Failed to cancel leave request', 500);
    }
}
