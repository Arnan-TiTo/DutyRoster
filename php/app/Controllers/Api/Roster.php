<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Roster extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\RosterEntryModel';

    public function entries()
    {
        helper(['api', 'auth']);
        require_auth();

        $dateFrom = $this->request->getGet('date_from');
        $dateTo = $this->request->getGet('date_to');

        if (!$dateFrom || !$dateTo) {
            return json_error('date_from and date_to are required', 400);
        }

        $entries = $this->model->getEntriesWithDetails($dateFrom, $dateTo);

        return json_success(['entries' => $entries]);
    }

    public function entry($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $entry = $this->model->getEntryWithAssignments($id);

        if (!$entry) {
            return json_error('Entry not found', 404);
        }

        return json_success(['entry' => $entry]);
    }

    public function createEntry()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);
        $json['created_by'] = current_user_id();

        $employeeIds = $json['employee_ids'] ?? [];
        unset($json['employee_ids']);

        if ($this->model->insert($json)) {
            $entryId = $this->model->getInsertID();

            // Assign employees
            if (!empty($employeeIds)) {
                $this->model->assignEmployees($entryId, $employeeIds, current_user_id());
            }

            $entry = $this->model->getEntryWithAssignments($entryId);
            return json_success(['entry' => $entry], 201);
        }

        return json_error('Failed to create entry', 500, $this->model->errors());
    }

    public function updateEntry($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);
        $employeeIds = $json['employee_ids'] ?? null;
        unset($json['employee_ids']);

        if ($this->model->update($id, $json)) {
            if ($employeeIds !== null) {
                $this->model->assignEmployees($id, $employeeIds, current_user_id());
            }

            $entry = $this->model->getEntryWithAssignments($id);
            return json_success(['entry' => $entry]);
        }

        return json_error('Failed to update entry', 500, $this->model->errors());
    }

    public function deleteEntry($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Entry deleted']);
        }

        return json_error('Failed to delete entry', 500);
    }

    public function checkAvailability()
    {
        helper(['api', 'auth']);
        require_auth();

        // TODO: Implement availability check logic
        return json_success(['available' => true]);
    }
}
