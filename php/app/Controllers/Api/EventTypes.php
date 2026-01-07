<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class EventTypes extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\EventTypeModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $eventTypes = $this->model->getActive();
        return json_success(['event_types' => $eventTypes]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $eventType = $this->model->find($id);

        if (!$eventType) {
            return json_error('Event type not found', 404);
        }

        return json_success(['event_type' => $eventType]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $eventType = $this->model->find($id);
            return json_success(['event_type' => $eventType], 201);
        }

        return json_error('Failed to create event type', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $eventType = $this->model->find($id);
            return json_success(['event_type' => $eventType]);
        }

        return json_error('Failed to update event type', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Event type deleted']);
        }

        return json_error('Failed to delete event type', 500);
    }
}
