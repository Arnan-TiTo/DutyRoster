<?php

namespace App\Models;

use CodeIgniter\Model;

class LeaveTypeModel extends Model
{
    protected $table = 'leave_types';
    protected $primaryKey = 'leave_type_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'leave_type_id',
        'leave_code',
        'leave_name',
        'is_active',
    ];

    protected array $casts = [
        'is_active' => 'boolean',
    ];

    protected $validationRules = [
        'leave_code' => 'required|max_length[50]|is_unique[leave_types.leave_code,leave_type_id,{leave_type_id}]',
        'leave_name' => 'required|max_length[100]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['leave_type_id'])) {
            $data['data']['leave_type_id'] = get_uuid();
        }
        return $data;
    }

    public function getActive()
    {
        return $this->where('is_active', true)->findAll();
    }
}
