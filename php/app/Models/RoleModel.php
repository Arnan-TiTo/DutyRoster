<?php

namespace App\Models;

use CodeIgniter\Model;

class RoleModel extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'role_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'role_id',
        'role_code',
        'role_name',
    ];

    protected $validationRules = [
        'role_code' => 'required|max_length[50]|is_unique[roles.role_code,role_id,{role_id}]',
        'role_name' => 'required|max_length[100]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['role_id'])) {
            $data['data']['role_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get role by code
     */
    public function getRoleByCode(string $code)
    {
        return $this->where('role_code', $code)->first();
    }

    /**
     * Get all active roles
     */
    public function getActiveRoles()
    {
        return $this->findAll();
    }
}
