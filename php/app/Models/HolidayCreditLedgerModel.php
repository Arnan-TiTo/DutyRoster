<?php

namespace App\Models;

use CodeIgniter\Model;

class HolidayCreditLedgerModel extends Model
{
    protected $table = 'holiday_credit_ledger';
    protected $primaryKey = 'ledger_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'ledger_id',
        'employee_id',
        'entry_id',
        'leave_request_id',
        'minutes_delta',
        'reason',
        'created_at',
    ];

    protected $validationRules = [
        'employee_id' => 'required',
        'minutes_delta' => 'required|integer',
    ];

    protected $beforeInsert = ['generateUUID', 'setCreatedAt'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['ledger_id'])) {
            $data['data']['ledger_id'] = get_uuid();
        }
        return $data;
    }

    protected function setCreatedAt(array $data)
    {
        if (empty($data['data']['created_at'])) {
            $data['data']['created_at'] = date('Y-m-d H:i:s');
        }
        return $data;
    }

    /**
     * Get balance for employee
     */
    public function getBalance(string $employeeId): int
    {
        $result = $this->selectSum('minutes_delta', 'total')
            ->where('employee_id', $employeeId)
            ->first();

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Get ledger history for employee
     */
    public function getHistory(string $employeeId, int $limit = 100)
    {
        return $this->where('employee_id', $employeeId)
            ->orderBy('created_at', 'DESC')
            ->limit($limit)
            ->findAll();
    }

    /**
     * Add credit from working on holiday
     */
    public function addHolidayCredit(string $employeeId, string $entryId, int $minutes, string $reason): bool
    {
        return (bool) $this->insert([
            'employee_id' => $employeeId,
            'entry_id' => $entryId,
            'minutes_delta' => $minutes,
            'reason' => $reason,
        ]);
    }
}
