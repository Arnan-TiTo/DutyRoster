<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class ShiftSlots extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\ShiftSlotModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $slots = $this->model->getActive();
        return json_success(['shift_slots' => $slots]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $slot = $this->model->find($id);

        if (!$slot) {
            return json_error('Shift slot not found', 404);
        }

        return json_success(['shift_slot' => $slot]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $slot = $this->model->find($id);
            return json_success(['shift_slot' => $slot], 201);
        }

        return json_error('Failed to create shift slot', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $slot = $this->model->find($id);
            return json_success(['shift_slot' => $slot]);
        }

        return json_error('Failed to update shift slot', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Shift slot deleted']);
        }

        return json_error('Failed to delete shift slot', 500);
    }
}
