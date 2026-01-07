<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Reports extends ResourceController
{
    protected $format = 'json';

    public function daily()
    {
        helper(['api', 'auth']);
        require_auth();

        $date = $this->request->getGet('date') ?? date('Y-m-d');

        $rosterModel = model('RosterEntryModel');
        $entries = $rosterModel->getEntriesWithDetails($date, $date);

        // Group by entry and get assignments
        foreach ($entries as &$entry) {
            $db = \Config\Database::connect();
            $assignments = $db->table('roster_assignments ra')
                ->select('ra.*, e.first_name, e.last_name, e.emp_code')
                ->join('employees e', 'e.employee_id = ra.employee_id')
                ->where('ra.entry_id', $entry['entry_id'])
                ->get()
                ->getResultArray();

            $entry['assigned_staff'] = $assignments;
        }

        return json_success([
            'date' => $date,
            'entries' => $entries,
        ]);
    }

    public function summary()
    {
        helper(['api', 'auth', 'time']);
        require_auth();

        $year = $this->request->getGet('year') ?? date('Y');
        $month = $this->request->getGet('month') ?? date('m');

        // Calculate date range
        $firstDay = sprintf('%04d-%02d-01', $year, $month);
        $lastDay = date('Y-m-t', strtotime($firstDay));

        // Get all employees
        $employeeModel = model('EmployeeModel');
        $employees = $employeeModel->getAllWithTeam();

        $summary = [];

        foreach ($employees as $emp) {
            $db = \Config\Database::connect();

            // Count roster entries
            $rosterCount = $db->table('roster_assignments ra')
                ->join('roster_entries re', 're.entry_id = ra.entry_id')
                ->where('ra.employee_id', $emp['employee_id'])
                ->where('re.entry_date >=', $firstDay)
                ->where('re.entry_date <=', $lastDay)
                ->countAllResults();

            // Count leave days
            $leaveCount = $db->table('leave_requests')
                ->where('employee_id', $emp['employee_id'])
                ->where('status', 'APPROVED')
                ->groupStart()
                ->where('date_from <=', $lastDay)
                ->where('date_to >=', $firstDay)
                ->groupEnd()
                ->countAllResults();

            // Get holiday balance
            $balance = $employeeModel->getHolidayBalance($emp['employee_id']);

            $summary[] = [
                'employee_id' => $emp['employee_id'],
                'emp_code' => $emp['emp_code'],
                'name' => $emp['first_name'] . ' ' . $emp['last_name'],
                'team_name' => $emp['team_name'] ?? '',
                'roster_entries' => $rosterCount,
                'leave_days' => $leaveCount,
                'holiday_balance_days' => minutes_to_days($balance),
            ];
        }

        return json_success([
            'year' => (int) $year,
            'month' => (int) $month,
            'summary' => $summary,
        ]);
    }
}
