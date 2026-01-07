<?php

namespace App\Models;

use CodeIgniter\Model;

class EventTypeModel extends Model
{
    protected $table = 'event_types';
    protected $primaryKey = 'event_type_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'event_type_id',
        'event_code',
        'event_name',
        'color_hex',
        'is_work',
        'is_holiday',
        'default_duration_minutes',
        'is_active',
        'sort_order',
    ];

    protected array $casts = [
        'is_work' => 'boolean',
        'is_holiday' => 'boolean',
        'is_active' => 'boolean',
        'default_duration_minutes' => 'integer',
        'sort_order' => 'integer',
    ];

    protected $validationRules = [
        'event_code' => 'required|max_length[50]|is_unique[event_types.event_code,event_type_id,{event_type_id}]',
        'event_name' => 'required|max_length[100]',
        'color_hex' => 'permit_empty|max_length[7]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['event_type_id'])) {
            $data['data']['event_type_id'] = get_uuid();
        }
        return $data;
    }

    public function getActive()
    {
        return $this->where('is_active', true)->orderBy('sort_order')->findAll();
    }
}
