<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Teams extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\TeamModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_auth();

        $teams = $this->model->getAllWithCounts();
        return json_success(['teams' => $teams]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_auth();

        $team = $this->model->getTeamWithCount($id);

        if (!$team) {
            return json_error('Team not found', 404);
        }

        return json_success(['team' => $team]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $teamId = $this->model->getInsertID();
            $team = $this->model->find($teamId);
            return json_success(['team' => $team], 201);
        }

        return json_error('Failed to create team', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role(['ADMIN', 'SUPERVISOR']);

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $team = $this->model->find($id);
            return json_success(['team' => $team]);
        }

        return json_error('Failed to update team', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Team deleted']);
        }

        return json_error('Failed to delete team', 500);
    }
}
