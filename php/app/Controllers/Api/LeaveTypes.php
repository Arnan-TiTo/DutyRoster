<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class LeaveTypes extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\LeaveTypeModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $leaveTypes = $this->model->getActive();
        return json_success(['leave_types' => $leaveTypes]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $leaveType = $this->model->find($id);

        if (!$leaveType) {
            return json_error('Leave type not found', 404);
        }

        return json_success(['leave_type' => $leaveType]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $leaveType = $this->model->find($id);
            return json_success(['leave_type' => $leaveType], 201);
        }

        return json_error('Failed to create leave type', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $leaveType = $this->model->find($id);
            return json_success(['leave_type' => $leaveType]);
        }

        return json_error('Failed to update leave type', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Leave type deleted']);
        }

        return json_error('Failed to delete leave type', 500);
    }
}
