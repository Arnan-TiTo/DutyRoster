<?php

namespace App\Models;

use CodeIgniter\Model;

class LeaveRequestModel extends Model
{
    protected $table = 'leave_requests';
    protected $primaryKey = 'leave_request_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'leave_request_id',
        'employee_id',
        'leave_type_id',
        'date_from',
        'date_to',
        'reason',
        'status',
        'requested_at',
        'decided_at',
        'decided_by_user',
        'decision_note',
    ];

    protected $validationRules = [
        'employee_id' => 'required',
        'leave_type_id' => 'required',
        'date_from' => 'required|valid_date',
        'date_to' => 'required|valid_date',
    ];

    protected $beforeInsert = ['generateUUID', 'setRequestedAt'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['leave_request_id'])) {
            $data['data']['leave_request_id'] = get_uuid();
        }
        return $data;
    }

    protected function setRequestedAt(array $data)
    {
        if (empty($data['data']['requested_at'])) {
            $data['data']['requested_at'] = date('Y-m-d H:i:s');
        }
        return $data;
    }

    /**
     * Get leave requests with employee and type info
     */
    public function getWithDetails(?string $employeeId = null, ?string $status = null)
    {
        $this->select('leave_requests.*, 
                       employees.first_name, employees.last_name, employees.emp_code,
                       leave_types.leave_code, leave_types.leave_name')
            ->join('employees', 'employees.employee_id = leave_requests.employee_id')
            ->join('leave_types', 'leave_types.leave_type_id = leave_requests.leave_type_id');

        if ($employeeId) {
            $this->where('leave_requests.employee_id', $employeeId);
        }

        if ($status) {
            $this->where('leave_requests.status', $status);
        }

        return $this->orderBy('leave_requests.requested_at', 'DESC')->findAll();
    }

    /**
     * Approve leave request
     */
    public function approve(string $requestId, string $decidedByUserId, ?string $note = null): bool
    {
        helper('time');

        $request = $this->find($requestId);
        if (!$request || $request['status'] !== 'PENDING') {
            return false;
        }

        // Calculate days and deduct from holiday credit
        $days = count(get_date_range($request['date_from'], $request['date_to']));
        $minutes = $days * 8 * 60; // 8 hours per day

        // Update request
        $updated = $this->update($requestId, [
            'status' => 'APPROVED',
            'decided_at' => date('Y-m-d H:i:s'),
            'decided_by_user' => $decidedByUserId,
            'decision_note' => $note,
        ]);

        if ($updated) {
            // Deduct from holiday credit
            $ledgerModel = model('HolidayCreditLedgerModel');
            $ledgerModel->insert([
                'ledger_id' => get_uuid(),
                'employee_id' => $request['employee_id'],
                'leave_request_id' => $requestId,
                'minutes_delta' => -$minutes,
                'reason' => 'Leave approved',
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        }

        return $updated;
    }

    /**
     * Reject leave request
     */
    public function reject(string $requestId, string $decidedByUserId, ?string $note = null): bool
    {
        $request = $this->find($requestId);
        if (!$request || $request['status'] !== 'PENDING') {
            return false;
        }

        return $this->update($requestId, [
            'status' => 'REJECTED',
            'decided_at' => date('Y-m-d H:i:s'),
            'decided_by_user' => $decidedByUserId,
            'decision_note' => $note,
        ]);
    }

    /**
     * Cancel leave request
     */
    public function cancel(string $requestId): bool
    {
        $request = $this->find($requestId);
        if (!$request || !in_array($request['status'], ['PENDING', 'APPROVED'])) {
            return false;
        }

        $updated = $this->update($requestId, ['status' => 'CANCELED']);

        // If was approved, return the credit
        if ($updated && $request['status'] === 'APPROVED') {
            helper('time');
            $days = count(get_date_range($request['date_from'], $request['date_to']));
            $minutes = $days * 8 * 60;

            $ledgerModel = model('HolidayCreditLedgerModel');
            $ledgerModel->insert([
                'ledger_id' => get_uuid(),
                'employee_id' => $request['employee_id'],
                'leave_request_id' => $requestId,
                'minutes_delta' => $minutes,
                'reason' => 'Leave canceled - credit returned',
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        }

        return $updated;
    }
}
