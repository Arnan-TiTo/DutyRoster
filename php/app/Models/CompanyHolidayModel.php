<?php

namespace App\Models;

use CodeIgniter\Model;

class CompanyHolidayModel extends Model
{
    protected $table = 'company_holidays';
    protected $primaryKey = 'holiday_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'holiday_id',
        'holiday_date',
        'holiday_name',
        'holiday_type',
        'is_active',
    ];

    protected array $casts = [
        'is_active' => 'boolean',
    ];

    protected $validationRules = [
        'holiday_date' => 'required|valid_date',
        'holiday_name' => 'required|max_length[200]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['holiday_id'])) {
            $data['data']['holiday_id'] = get_uuid();
        }
        return $data;
    }

    public function getByYear(int $year)
    {
        return $this->where('YEAR(holiday_date)', $year)
            ->where('is_active', true)
            ->orderBy('holiday_date')
            ->findAll();
    }

    public function isHoliday(string $date): bool
    {
        $result = $this->where('holiday_date', $date)
            ->where('is_active', true)
            ->first();

        return $result !== null;
    }
}
