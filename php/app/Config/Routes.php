<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Default route
$routes->get('/', 'Home::index');

// Authentication routes (Web)
$routes->get('/login', 'Auth::login');
$routes->post('/login', 'Auth::loginPost');
$routes->get('/logout', 'Auth::logout');

// Application routes (Protected)
$routes->group('app', ['filter' => 'auth'], function ($routes) {
    $routes->get('/', 'App::dashboard');
    $routes->get('dashboard', 'App::dashboard');
    $routes->get('calendar', 'App::calendar');

    // Users
    $routes->get('users', 'App::users');
    $routes->get('users/create', 'App::userForm');
    $routes->get('users/edit/(:segment)', 'App::userForm/$1');

    // Employees
    $routes->get('employees', 'App::employees');
    $routes->get('employees/create', 'App::employeeForm');
    $routes->get('employees/edit/(:segment)', 'App::employeeForm/$1');

    // Teams
    $routes->get('teams', 'App::teams');

    // Leaves
    $routes->get('leaves', 'App::leaves');
    $routes->get('leaves/my', 'App::myLeaves');
    $routes->get('leaves/approvals', 'App::leaveApprovals');

    // Roster
    $routes->get('roster', 'App::roster');

    // Configuration
    $routes->get('event-types', 'App::eventTypes');
    $routes->get('shift-slots', 'App::shiftSlots');
    $routes->get('company-holidays', 'App::companyHolidays');
    $routes->get('leave-types', 'App::leaveTypes');

    // Reports
    $routes->get('reports/daily', 'App::dailyReport');
    $routes->get('reports/summary', 'App::summaryReport');

    // Admin
    $routes->get('roles', 'App::roles');
    $routes->get('menus', 'App::menus');
});

// API Routes
$routes->group('api', function ($routes) {

    // Auth API (No filter)
    $routes->post('auth/login', 'Api\Auth::login');
    $routes->post('auth/logout', 'Api\Auth::logout');
    $routes->get('auth/session', 'Api\Auth::session');
    $routes->get('auth/me', 'Api\Auth::me');

    // Protected API routes
    $routes->group('', ['filter' => 'auth'], function ($routes) {

        // Users API
        $routes->resource('users', ['controller' => 'Api\Users']);

        // Employees API
        $routes->resource('employees', ['controller' => 'Api\Employees']);
        $routes->post('employees/(:segment)/deactivate', 'Api\Employees::deactivate/$1');
        $routes->get('employees/me/holiday-balance', 'Api\Employees::myHolidayBalance');

        // Teams API
        $routes->resource('teams', ['controller' => 'Api\Teams']);

        // Roles API
        $routes->resource('roles', ['controller' => 'Api\Roles']);

        // Menus API
        $routes->resource('menus', ['controller' => 'Api\Menus']);
        $routes->get('menus/my', 'Api\Menus::my');

        // Event Types API
        $routes->resource('event-types', ['controller' => 'Api\EventTypes']);

        // Shift Slots API
        $routes->resource('shift-slots', ['controller' => 'Api\ShiftSlots']);

        // Company Holidays API
        $routes->resource('company-holidays', ['controller' => 'Api\CompanyHolidays']);

        // Leave Types API
        $routes->resource('leave-types', ['controller' => 'Api\LeaveTypes']);

        // Leaves API
        $routes->resource('leaves', ['controller' => 'Api\Leaves']);
        $routes->post('leaves/(:segment)/approve', 'Api\Leaves::approve/$1');
        $routes->post('leaves/(:segment)/reject', 'Api\Leaves::reject/$1');
        $routes->post('leaves/(:segment)/cancel', 'Api\Leaves::cancel/$1');

        // Roster API
        $routes->get('roster/entries', 'Api\Roster::entries');
        $routes->post('roster/entries', 'Api\Roster::createEntry');
        $routes->get('roster/entries/(:segment)', 'Api\Roster::entry/$1');
        $routes->put('roster/entries/(:segment)', 'Api\Roster::updateEntry/$1');
        $routes->delete('roster/entries/(:segment)', 'Api\Roster::deleteEntry/$1');
        $routes->get('roster/availability', 'Api\Roster::checkAvailability');

        // Calendar API
        $routes->get('calendar/month', 'Api\Calendar::month');

        // Reports API
        $routes->get('reports/daily', 'Api\Reports::daily');
        $routes->get('reports/summary', 'Api\Reports::summary');

        // Admin API
        $routes->post('admin/recalculate-holiday-credit', 'Api\Admin::recalculateHolidayCredit');
    });
});
