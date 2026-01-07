<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class App extends Controller
{
    public function dashboard()
    {
        helper('auth');
        return view('app/dashboard');
    }

    public function calendar()
    {
        helper('auth');
        return view('app/calendar');
    }

    public function users()
    {
        helper('auth');
        require_role('ADMIN');
        return view('app/users/index');
    }

    public function userForm($id = null)
    {
        helper('auth');
        require_role('ADMIN');
        return view('app/users/form', ['userId' => $id]);
    }

    public function employees()
    {
        helper('auth');
        return view('app/employees/index');
    }

    public function employeeForm($id = null)
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/employees/form', ['employeeId' => $id]);
    }

    public function teams()
    {
        helper('auth');
        return view('app/teams/index');
    }

    public function leaves()
    {
        helper('auth');
        return view('app/leaves/index');
    }

    public function myLeaves()
    {
        helper('auth');
        return view('app/leaves/my');
    }

    public function leaveApprovals()
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/leaves/approvals');
    }

    public function roster()
    {
        helper('auth');
        return view('app/roster/index');
    }

    public function eventTypes()
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/config/event_types');
    }

    public function shiftSlots()
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/config/shift_slots');
    }

    public function companyHolidays()
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/config/company_holidays');
    }

    public function leaveTypes()
    {
        helper('auth');
        require_role(['ADMIN', 'SUPERVISOR']);
        return view('app/config/leave_types');
    }

    public function dailyReport()
    {
        helper('auth');
        return view('app/reports/daily');
    }

    public function summaryReport()
    {
        helper('auth');
        return view('app/reports/summary');
    }

    public function roles()
    {
        helper('auth');
        require_role('ADMIN');
        return view('app/admin/roles');
    }

    public function menus()
    {
        helper('auth');
        require_role('ADMIN');
        return view('app/admin/menus');
    }
}
