<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Menus extends ResourceController
{
    protected $format = 'json';
    protected $modelName = 'App\Models\MenuModel';

    public function index()
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $menus = $this->model->where('is_active', true)->orderBy('sort_order')->findAll();
        return json_success(['menus' => $menus]);
    }

    public function show($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $menu = $this->model->find($id);

        if (!$menu) {
            return json_error('Menu not found', 404);
        }

        return json_success(['menu' => $menu]);
    }

    public function my()
    {
        helper(['api', 'auth']);
        require_auth();

        $user = current_user();
        $userId = $user['user_id'];

        // Get role IDs
        $userModel = model('UserModel');
        $roleResult = $userModel->getUserRoles($userId);
        $roleIds = array_column($roleResult, 'role_id');

        // Get menus for user
        $menus = $this->model->getMenusForUser($userId, $roleIds);

        return json_success(['menus' => $menus]);
    }

    public function create()
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $menu = $this->model->find($id);
            return json_success(['menu' => $menu], 201);
        }

        return json_error('Failed to create menu', 500, $this->model->errors());
    }

    public function update($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        $json = $this->request->getJSON(true);

        if ($this->model->update($id, $json)) {
            $menu = $this->model->find($id);
            return json_success(['menu' => $menu]);
        }

        return json_error('Failed to update menu', 500, $this->model->errors());
    }

    public function delete($id = null)
    {
        helper(['api', 'auth']);
        require_role('ADMIN');

        if ($this->model->delete($id)) {
            return json_success(['message' => 'Menu deleted']);
        }

        return json_error('Failed to delete menu', 500);
    }
}
