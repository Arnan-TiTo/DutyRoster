<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class CompanyHolidays extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\CompanyHolidayModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $year = $this->request->getGet('year') ?? date('Y');
        $holidays = $this->model->getByYear((int) $year);

        return json_success(['holidays' => $holidays]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $holiday = $this->model->find($id);

        if (!$holiday) {
            return json_error('Holiday not found', 404);
        }

        return json_success(['holiday' => $holiday]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $holiday = $this->model->find($id);
            return json_success(['holiday' => $holiday], 201);
        }

        return json_error('Failed to create holiday', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $holiday = $this->model->find($id);
            return json_success(['holiday' => $holiday]);
        }

        return json_error('Failed to update holiday', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Holiday deleted']);
        }

        return json_error('Failed to delete holiday', 500);
    }
}
