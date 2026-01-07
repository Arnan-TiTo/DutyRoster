<?php helper('auth');
$user = current_user(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Leaves - Duty Roster</title>
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

        .card-balance {
            background: linear-gradient(135deg, #146C9C 0%, #0E5A8B 100%);
            color: white;
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <span class="navbar-brand">📅 Duty Roster - My Leaves</span>
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
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card card-balance">
                    <div class="card-body">
                        <h5 class="card-title">Holiday Balance</h5>
                        <h2 class="mb-0" id="balanceDays">-</h2>
                        <small>days available</small>
                    </div>
                </div>
            </div>
            <div class="col-md-8 d-flex align-items-center">
                <button class="btn  btn-success btn-lg" onclick="requestLeave()">
                    <i class="bi bi-plus-circle"></i> Request Leave
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">My Leave Requests</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="leavesTable">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th>Requested</th>
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
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        async function loadBalance() {
            try {
                const response = await fetch('/api/employees/me/holiday-balance');
                const data = await response.json();

                if (data.ok) {
                    document.getElementById('balanceDays').textContent =
                        data.balance_days?.toFixed(1) || '0';
                }
            } catch (error) {
                console.error('Error loading balance:', error);
            }
        }

        async function loadLeaves() {
            try {
                const response = await fetch('/api/leaves');
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                const tbody = document.querySelector('#leavesTable tbody');
                tbody.innerHTML = '';

                if (!data.leaves || data.leaves.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No leave requests</td></tr>';
                    return;
                }

                data.leaves.forEach(leave => {
                    const days = calculateDays(leave.date_from, leave.date_to);
                    const statusBadge = getStatusBadge(leave.status);

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${leave.leave_name || leave.leave_type_id}</td>
                        <td>${leave.date_from}</td>
                        <td>${leave.date_to}</td>
                        <td>${days}</td>
                        <td>${statusBadge}</td>
                        <td>${new Date(leave.requested_at).toLocaleDateString()}</td>
                        <td>
                            ${leave.status === 'PENDING' || leave.status === 'APPROVED' ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="cancelLeave('${leave.leave_request_id}')">
                                    Cancel
                                </button>
                            ` : '-'}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Error loading leaves:', error);
                alert('Failed to load leaves: ' + error.message);
            }
        }

        function calculateDays(from, to) {
            const d1 = new Date(from);
            const d2 = new Date(to);
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }

        function getStatusBadge(status) {
            const badges = {
                'PENDING': '<span class="badge bg-warning">Pending</span>',
                'APPROVED': '<span class="badge bg-success">Approved</span>',
                'REJECTED': '<span class="badge bg-danger">Rejected</span>',
                'CANCELED': '<span class="badge bg-secondary">Canceled</span>'
            };
            return badges[status] || status;
        }

        function requestLeave() {
            alert('Leave request form - To be implemented');
        }

        async function cancelLeave(leaveId) {
            if (!confirm('Cancel this leave request?')) {
                return;
            }

            try {
                const response = await fetch('/api/leaves/' + leaveId + '/cancel', {
                    method: 'POST'
                });
                const data = await response.json();

                if (!data.ok) {
                    throw new Error(data.message);
                }

                alert('Leave request canceled');
                loadLeaves();
                loadBalance();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed: ' + error.message);
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            loadBalance();
            loadLeaves();
        });
    </script>
</body>

</html>