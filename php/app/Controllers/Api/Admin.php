<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Admin extends ResourceController
{
    protected $format = 'json';

    public function recalculateHolidayCredit()
    {
        helper(['api', 'auth', 'time']);
        require_role('ADMIN');

        // This is a complex operation that should:
        // 1. Clear existing credit ledger
        // 2. Recalculate from roster entries (working on holidays)
        // 3. Recalculate from approved leaves

        $db = \Config\Database::connect();

        try {
            $db->transStart();

            // Clear ledger
            $db->table('holiday_credit_ledger')->truncate();

            // Get all roster assignments where employee worked on holiday
            $rosterModel = model('RosterEntryModel');
            $holidayModel = model('CompanyHolidayModel');
            $ledgerModel = model('HolidayCreditLedgerModel');

            // Find work on holidays
            $workOnHolidays = $db->table('roster_assignments ra')
                ->select('ra.employee_id, ra.entry_id, re.entry_date, re.start_at, re.end_at')
                ->join('roster_entries re', 're.entry_id = ra.entry_id')
                ->join('event_types et', 'et.event_type_id = re.event_type_id')
                ->where('et.is_work', true)
                ->get()
                ->getResultArray();

            $creditCount = 0;

            foreach ($workOnHolidays as $work) {
                // Check if date is a holiday
                if ($holidayModel->isHoliday($work['entry_date'])) {
                    $minutes = calculate_minutes_between($work['start_at'], $work['end_at']);

                    $ledgerModel->insert([
                        'employee_id' => $work['employee_id'],
                        'entry_id' => $work['entry_id'],
                        'minutes_delta' => $minutes,
                        'reason' => 'Worked on holiday: ' . $work['entry_date'],
                    ]);

                    $creditCount++;
                }
            }

            // Deduct approved leaves
            $leaves = $db->table('leave_requests')
                ->where('status', 'APPROVED')
                ->get()
                ->getResultArray();

            $deductCount = 0;

            foreach ($leaves as $leave) {
                $days = count(get_date_range($leave['date_from'], $leave['date_to']));
                $minutes = $days * 8 * 60;

                $ledgerModel->insert([
                    'employee_id' => $leave['employee_id'],
                    'leave_request_id' => $leave['leave_request_id'],
                    'minutes_delta' => -$minutes,
                    'reason' => 'Leave deduction',
                ]);

                $deductCount++;
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return json_error('Failed to recalculate holiday credit', 500);
            }

            return json_success([
                'message' => 'Holiday credit recalculated successfully',
                'credits_added' => $creditCount,
                'leaves_deducted' => $deductCount,
            ]);

        } catch (\Exception $e) {
            return json_error('Recalculation failed: ' . $e->getMessage(), 500);
        }
    }
}
