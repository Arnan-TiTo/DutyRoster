<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Auth extends Controller
{
    public function login()
    {
        helper('auth');

        if (is_authenticated()) {
            return redirect()->to('/app');
        }

        return view('auth/login');
    }

    public function loginPost()
    {
        helper('auth');

        $username = $this->request->getPost('username');
        $password = $this->request->getPost('password');

        if (empty($username) || empty($password)) {
            return redirect()->back()->with('error', 'Username and password are required');
        }

        $userModel = model('UserModel');
        $user = $userModel->verifyPassword($username, $password);

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid credentials');
        }

        // Get user roles
        $roleResult = $userModel->getUserRoles($user['user_id']);
        $roles = array_column($roleResult, 'role_code');

        // Create session
        session()->set('user', [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'employee_id' => $user['employee_id'],
            'roles' => $roles,
        ]);

        return redirect()->to('/app');
    }

    public function logout()
    {
        session()->destroy();
        return redirect()->to('/login')->with('success', 'Logged out successfully');
    }
}
