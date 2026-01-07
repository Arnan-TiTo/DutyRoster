<?php helper('auth');
$user = current_user(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Duty Roster</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            background: #f8f9fa;
        }

        .navbar {
            background: linear-gradient(135deg, #146C9C 0%, #0E5A8B 100%);
        }

        .sidebar {
            background: white;
            min-height: calc(100vh - 56px);
            border-right: 1px solid #dee2e6;
        }

        .sidebar .nav-link {
            color: #495057;
            padding: 12px 20px;
        }

        .sidebar .nav-link:hover {
            background: #f8f9fa;
        }

        .sidebar .nav-link.active {
            background: #146C9C;
            color: white;
        }

        .content {
            padding: 30px;
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-dark">
        <div class="container-fluid">
            <span class="navbar-brand">📅 Duty Roster</span>
            <div class="d-flex align-items-center text-white">
                <span class="me-3">
                    <?= esc($user['display_name']) ?>
                </span>
                <a href="/logout" class="btn btn-sm btn-outline-light">Logout</a>
            </div>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-2 sidebar">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="/app/dashboard">
                                <i class="bi bi-house"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/app/calendar">
                                <i class="bi bi-calendar"></i> Calendar
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/app/leaves/my">
                                <i class="bi bi-calendar-check"></i> My Leave
                            </a>
                        </li>
                        <?php if (is_admin() || is_supervisor()): ?>
                            <hr>
                            <li class=" nav-item">
                                <a class="nav-link" href="/app/leaves/approvals">
                                    <i class="bi bi-check-circle"></i> Leave Approvals
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/app/employees">
                                    <i class="bi bi-people"></i> Employees
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/app/roster">
                                    <i class="bi bi-calendar3"></i> Roster
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php if (is_admin()): ?>
                            <hr>
                            <li class="nav-item">
                                <a class="nav-link" href="/app/users">
                                    <i class="bi bi-person-badge"></i> Users
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/app/teams">
                                    <i class="bi bi-diagram-3"></i> Teams
                                </a>
                            </li>
                        <?php endif; ?>
                    </ul>
                </div>
            </nav>

            <main class="col-md-10 ms-sm-auto content">
                <h1 class="mb-4">Dashboard</h1>

                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Welcome Back!</h5>
                                <p class="card-text">
                                    You're logged in as <strong>
                                        <?= esc($user['username']) ?>
                                    </strong>
                                </p>
                                <p class="text-muted small">
                                    Roles:
                                    <?= implode(', ', $user['roles']) ?>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Quick Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/app/calendar">View Calendar</a></li>
                                    <li><a href="/app/leaves/my">Request Leave</a></li>
                                    <?php if (is_admin() || is_supervisor()): ?>
                                        <li><a href="/app/roster">Manage Roster</a></li>
                                    <?php endif; ?>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">System Info</h5>
                                <p class="small text-muted">
                                    <strong>Version:</strong> 1.0.0-php<br>
                                    <strong>Framework:</strong> CodeIgniter 4<br>
                                    <strong>Database:</strong> MySQL
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-info">
                    <strong>Note:</strong> This is the PHP CodeIgniter version of the Duty Roster system.
                    The full frontend features are being developed. API endpoints are available at <code>/api/*</code>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>