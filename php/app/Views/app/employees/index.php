<?php helper('auth');
$user = current_user(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employees - Duty Roster</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            background: #f8f9fa;
        }

        .navbar {
            background: linear-gradient(135deg, #146C9C 0%, #0E5A8B 100%);
        }

        .content {
            padding: 30px;
        }

        .table-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <span class="navbar-brand">📅 Duty Roster - Employees</span>
            <div class="d-flex align-items-center text-white">
                <span class="me-3">
                    <?= esc($user['display_name']) ?>
                </span>
                <a href="/app" class="btn btn-sm btn-outline-light me-2">Dashboard</a>
                <a href="/logout" class="btn btn-sm btn-outline-light">Logout</a>
            </div>
        </div>
    </nav>

    <div class="container-fluid content">
        <div class="row mb-3">
            <div class="col">
                <h1>Employee Management</h1>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" onclick="createEmployee()">
                    <i class="bi bi-plus-circle"></i> Add Employee
                </button>
            </div>
        </div>

        <div class="table-container">
            <div class="table-responsive">
                <table class="table table-hover" id="employeesTable">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        async function loadEmployees() {
            try {
                const response = await fetch('/api/employees');
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                const tbody = document.querySelector('#employeesTable tbody');
                tbody.innerHTML = '';

                if (!data.employees || data.employees.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No employees found</td></tr>';
                    return;
                }

                data.employees.forEach(emp => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${emp.emp_code || '-'}</td>
                        <td>${emp.first_name} ${emp.last_name}<br><small class="text-muted">${emp.nick_name || ''}</small></td>
                        <td>${emp.role_title || '-'}</td>
                        <td>${emp.team_name || '-'}</td>
                        <td>
                            ${emp.email ? '<i class="bi bi-envelope"></i> ' + emp.email + '<br>' : ''}
                            ${emp.phone ? '<i class="bi bi-telephone"></i> ' + emp.phone : ''}
                        </td>
                        <td>
                            <span class="badge ${emp.is_active ? 'bg-success' : 'bg-secondary'}">
                                ${emp.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="editEmployee('${emp.employee_id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            ${emp.is_active ? `
                                <button class="btn btn-sm btn-outline-warning" onclick="deactivateEmployee('${emp.employee_id}')">
                                    <i class="bi bi-ban"></i>
                                </button>
                            ` : ''}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Error loading employees:', error);
                alert('Failed to load employees: ' + error.message);
            }
        }

        function createEmployee() {
            window.location.href = '/app/employees/create';
        }

        function editEmployee(employeeId) {
            window.location.href = '/app/employees/edit/' + employeeId;
        }

        async function deactivateEmployee(employeeId) {
            if (!confirm('Deactivate this employee?')) {
                return;
            }

            try {
                const response = await fetch('/api/employees/' + employeeId + '/deactivate', {
                    method: 'POST'
                });
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                alert('Employee deactivated successfully');
                loadEmployees();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed: ' + error.message);
            }
        }

        document.addEventListener('DOMContentLoaded', loadEmployees);
    </script>
</body>

</html>