<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Roles extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\RoleModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $roles = $this->model->findAll();
        return json_success(['roles' => $roles]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $role = $this->model->find($id);

        if (!$role) {
            return json_error('Role not found', 404);
        }

        return json_success(['role' => $role]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $roleId = $this->model->getInsertID();
            $role = $this->model->find($roleId);
            return json_success(['role' => $role], 201);
        }

        return json_error('Failed to create role', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $role = $this->model->find($id);
            return json_success(['role' => $role]);
        }

        return json_error('Failed to update role', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        // Prevent deleting default roles
        $role = $this->model->find($id);
        if ($role && in_array($role['role_code'], ['ADMIN', 'SUPERVISOR', 'STAFF'])) {
            return json_error('Cannot delete default system role', 400);
        }

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Role deleted']);
        }

        return json_error('Failed to delete role', 500);
    }
}
