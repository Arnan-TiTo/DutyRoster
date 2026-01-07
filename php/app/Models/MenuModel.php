<?php

namespace App\Models;

use CodeIgniter\Model;

class MenuModel extends Model
{
    protected $table = 'menus';
    protected $primaryKey = 'menu_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'menu_id',
        'menu_code',
        'menu_name',
        'path',
        'sort_order',
        'is_active',
    ];

    protected array $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $validationRules = [
        'menu_code' => 'required|max_length[50]|is_unique[menus.menu_code,menu_id,{menu_id}]',
        'menu_name' => 'required|max_length[100]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['menu_id'])) {
            $data['data']['menu_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get menus for user based on roles and overrides
     */
    public function getMenusForUser(string $userId, array $roleIds)
    {
        $db = \Config\Database::connect();

        // Get menus accessible by user's roles
        $roleMenus = $db->table('role_menus rm')
            ->select('rm.menu_id, rm.can_view, rm.can_edit')
            ->whereIn('rm.role_id', $roleIds)
            ->where('rm.can_view', true)
            ->get()
            ->getResultArray();

        // Get user-specific overrides
        $overrides = $db->table('user_menu_overrides')
            ->where('user_id', $userId)
            ->get()
            ->getResultArray();

        // Build accessible menu IDs
        $menuIds = [];
        foreach ($roleMenus as $rm) {
            $menuIds[] = $rm['menu_id'];
        }

        // Apply overrides
        foreach ($overrides as $override) {
            if ($override['allow_view'] === false) {
                // Remove menu if explicitly denied
                $menuIds = array_diff($menuIds, [$override['menu_id']]);
            } elseif ($override['allow_view'] === true) {
                // Add menu if explicitly allowed
                $menuIds[] = $override['menu_id'];
            }
        }

        if (empty($menuIds)) {
            return [];
        }

        return $this->whereIn('menu_id', array_unique($menuIds))
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->findAll();
    }
}
