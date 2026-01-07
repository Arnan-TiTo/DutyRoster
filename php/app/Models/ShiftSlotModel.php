<?php

namespace App\Models;

use CodeIgniter\Model;

class ShiftSlotModel extends Model
{
    protected $table = 'shift_slots';
    protected $primaryKey = 'shift_slot_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'shift_slot_id',
        'slot_code',
        'slot_name',
        'start_time',
        'end_time',
        'min_staff',
        'max_staff',
        'sort_order',
        'is_active',
    ];

    protected array $casts = [
        'is_active' => 'boolean',
        'min_staff' => 'integer',
        'max_staff' => 'integer',
        'sort_order' => 'integer',
    ];

    protected $validationRules = [
        'slot_name' => 'required|max_length[100]',
        'start_time' => 'required',
        'end_time' => 'required',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['shift_slot_id'])) {
            $data['data']['shift_slot_id'] = get_uuid();
        }
        return $data;
    }

    public function getActive()
    {
        return $this->where('is_active', true)->orderBy('sort_order')->findAll();
    }
}
