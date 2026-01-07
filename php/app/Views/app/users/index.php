<?php helper('auth');
$user = current_user(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users - Duty Roster</title>
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
            <span class="navbar-brand">📅 Duty Roster - User Management</span>
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
                <h1>User Management</h1>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" onclick="createUser()">
                    <i class="bi bi-plus-circle"></i> Add User
                </button>
            </div>
        </div>

        <div class="table-container">
            <div class="table-responsive">
                <table class="table table-hover" id="usersTable">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Display Name</th>
                            <th>Employee</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="6" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        async function loadUsers() {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                const tbody = document.querySelector('#usersTable tbody');
                tbody.innerHTML = '';

                if (!data.users || data.users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
                    return;
                }

                data.users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.display_name}</td>
                        <td>${user.employee_id || '-'}</td>
                        <td><span class="badge bg-primary">${user.roles?.join(', ') || 'N/A'}</span></td>
                        <td>
                            <span class="badge ${user.is_active ? 'bg-success' : 'bg-secondary'}">
                                ${user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="editUser('${user.user_id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.user_id}', '${user.username}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Error loading users:', error);
                alert('Failed to load users: ' + error.message);
            }
        }

        function createUser() {
            window.location.href = '/app/users/create';
        }

        function editUser(userId) {
            window.location.href = '/app/users/edit/' + userId;
        }

        async function deleteUser(userId, username) {
            if (!confirm('Delete user "' + username + '"?')) {
                return;
            }

            try {
                const response = await fetch('/api/users/' + userId, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                alert('User deleted successfully');
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user: ' + error.message);
            }
        }

        document.addEventListener('DOMContentLoaded', loadUsers);
    </script>
</body>

</html>