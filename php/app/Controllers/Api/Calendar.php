<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class Calendar extends ResourceController
{
    protected $format = 'json';

    public function month()
    {
        helper(['api', 'auth', 'time']);
        require_auth();

        $year = $this->request->getGet('year') ?? date('Y');
        $month = $this->request->getGet('month') ?? date('m');

        // Calculate date range for the month
        $firstDay = sprintf('%04d-%02d-01', $year, $month);
        $lastDay = date('Y-m-t', strtotime($firstDay));

        // Get roster entries
        $rosterModel = model('RosterEntryModel');
        $entries = $rosterModel->getEntriesWithDetails($firstDay, $lastDay);

        // Get company holidays
        $holidayModel = model('CompanyHolidayModel');
        $holidays = $holidayModel->getByYear((int) $year);

        // Filter holidays for this month
        $monthHolidays = array_filter($holidays, function ($h) use ($month) {
            return date('m', strtotime($h['holiday_date'])) == sprintf('%02d', $month);
        });

        // Get leave requests for the user (or all for admin/supervisor)
        $user = current_user();
        $leaveModel = model('LeaveRequestModel');

        $employeeId = null;
        if (has_role('STAFF') && !has_role(['ADMIN', 'SUPERVISOR'])) {
            $employeeId = $user['employee_id'];
        }

        $allLeaves = $leaveModel->getWithDetails($employeeId, 'APPROVED');

        // Filter leaves for this month
        $monthLeaves = array_filter($allLeaves, function ($leave) use ($firstDay, $lastDay) {
            return ($leave['date_from'] <= $lastDay && $leave['date_to'] >= $firstDay);
        });

        return json_success([
            'year' => (int) $year,
            'month' => (int) $month,
            'entries' => array_values($entries),
            'holidays' => array_values($monthHolidays),
            'leaves' => array_values($monthLeaves),
        ]);
    }
}
