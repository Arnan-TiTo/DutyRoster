<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Users extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\UserModel';

    /**
     * GET /api/users
     * List all users (Admin only)
     */
    public function index()
    {
        helper(['api', 'auth']);

        require_role('ADMIN');

        $users = $this->model->findAll();

        // Remove password hashes
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }

        return json_success(['users' => $users]);
    }

    /**
     * GET /api/users/{id}
     * Get user details
     */
    public function show($id = null)
    {
        helper(['api', 'auth']);

        require_role(['ADMIN', 'SUPERVISOR']);

        $user = $this->model->getUserWithRoles($id);

        if (!$user) {
            return json_error('User not found', 404);
        }

        unset($user['password_hash']);

        return json_success(['user' => $user]);
    }

    /**
     * POST /api/users
     * Create new user
     */
    public function create()
    {
        helper(['api', 'auth']);

        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        $errors = validate_request([
            'username' => 'required|min_length[3]|is_unique[users.username]',
            'password' => 'required|min_length[6]',
            'display_name' => 'required|min_length[2]',
        ], $json);

        if ($errors) {
            return json_error('Validation failed', 400, $errors);
        }

        $password = $json['password'];
        unset($json['password']);

        $userId = $this->model->createUser($json, $password);

        if (!$userId) {
            return json_error('Failed to create user', 500);
        }

        // Assign roles if provided
        if (!empty($json['role_ids'])) {
            $this->model->assignRoles($userId, $json['role_ids']);
        }

        $user = $this->model->find($userId);
        unset($user['password_hash']);

        return json_success(['user' => $user], 201);
    }

    /**
     * PUT /api/users/{id}
     * Update user
     */
    public function update($id = null)
    {
        helper(['api', 'auth']);

        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        // Remove password hash from update if empty
        if (isset($json['password']) && !empty($json['password'])) {
            $json['password_hash'] = password_hash($json['password'], PASSWORD_BCRYPT);
        }
        unset($json['password']);

        // Handle role assignment separately
        $roleIds = $json['role_ids'] ?? null;
        unset($json['role_ids']);

        if ($this->model->update($id, $json)) {
            if ($roleIds !== null) {
                $this->model->assignRoles($id, $roleIds);
            }

            $user = $this->model->getUserWithRoles($id);
            unset($user['password_hash']);

            return json_success(['user' => $user]);
        }

        return json_error('Failed to update user', 500);
    }

    /**
     * DELETE /api/users/{id}
     * Delete user
     */
    public function delete($id = null)
    {
        helper(['api', 'auth']);

        require_role('ADMIN');

        // Prevent self-deletion
        if ($id === current_user_id()) {
            return json_error('Cannot delete your own account', 400);
        }

        if ($this->model->delete($id)) {
            return json_success(['message' => 'User deleted successfully']);
        }

        return json_error('Failed to delete user', 500);
    }
}
