<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\UserModel';

    /**
     * POST /api/auth/login
     * Authenticate user and create session
     */
    public function login()
    {
        helper(['api', 'auth']);

        $json = $this->request->getJSON(true);
        $username = $json['username'] ?? '';
        $password = $json['password'] ?? '';

        if (empty($username) || empty($password)) {
            return json_error('Username and password are required', 400);
        }

        $userModel = model('UserModel');
        $user = $userModel->verifyPassword($username, $password);

        if (!$user) {
            return json_error('Invalid credentials', 401);
        }

        // Get user roles
        $roleResult = $userModel->getUserRoles($user['user_id']);
        $roles = array_column($roleResult, 'role_code');

        // Create session
        $sessionData = [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'employee_id' => $user['employee_id'],
            'roles' => $roles,
        ];

        session()->set('user', $sessionData);

        return json_success([
            'user' => [
                'username' => $user['username'],
                'display_name' => $user['display_name'],
                'roles' => $roles,
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     * Destroy session
     */
    public function logout()
    {
        helper('api');

        session()->destroy();

        return json_success(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/auth/session
     * Get current session info
     */
    public function session()
    {
        helper(['api', 'auth']);

        $user = current_user();

        if (!$user) {
            return json_error('No active session', 401);
        }

        return json_success(['session' => $user]);
    }

    /**
     * GET /api/auth/me
     * Get current user details
     */
    public function me()
    {
        helper(['api', 'auth']);

        require_auth();

        $userId = current_user_id();
        $userModel = model('UserModel');
        $user = $userModel->getUserWithRoles($userId);

        if (!$user) {
            return json_error('User not found', 404);
        }

        unset($user['password_hash']);

        return json_success(['user' => $user]);
    }
}
