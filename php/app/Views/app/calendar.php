<?php helper('auth');
$user = current_user(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar - Duty Roster</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.css" rel="stylesheet">
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

        #calendar {
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
            <span class="navbar-brand">📅 Duty Roster - Calendar</span>
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
                <h1>Calendar</h1>
            </div>
        </div>

        <div id="calendar"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const calendarEl = document.getElementById('calendar');
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: async function (info, successCallback, failureCallback) {
                    try {
                        const year = info.start.getFullYear();
                        const month = info.start.getMonth() + 1;

                        const response = await fetch(`/api/calendar/month?year=${year}&month=${month}`);
                        const data = await response.json();

                        if (!data.ok) {
                            throw new Error(data.message);
                        }

                        const events = [];

                        // Add roster entries
                        if (data.entries) {
                            data.entries.forEach(entry => {
                                events.push({
                                    title: entry.event_name,
                                    start: entry.start_at,
                                    end: entry.end_at,
                                    backgroundColor: entry.color_hex || '#3b82f6',
                                    extendedProps: {
                                        type: 'roster',
                                        data: entry
                                    }
                                });
                            });
                        }

                        // Add holidays
                        if (data.holidays) {
                            data.holidays.forEach(holiday => {
                                events.push({
                                    title: '🎉 ' + holiday.holiday_name,
                                    start: holiday.holiday_date,
                                    allDay: true,
                                    backgroundColor: '#ef4444',
                                    extendedProps: {
                                        type: 'holiday',
                                        data: holiday
                                    }
                                });
                            });
                        }

                        // Add approved leaves
                        if (data.leaves) {
                            data.leaves.forEach(leave => {
                                events.push({
                                    title: '📅 ' + leave.first_name + ' - ' + leave.leave_name,
                                    start: leave.date_from,
                                    end: leave.date_to,
                                    backgroundColor: '#f59e0b',
                                    extendedProps: {
                                        type: 'leave',
                                        data: leave
                                    }
                                });
                            });
                        }

                        successCallback(events);
                    } catch (error) {
                        console.error('Error loading calendar:', error);
                        failureCallback(error);
                    }
                },
                eventClick: function (info) {
                    alert('Event: ' + info.event.title);
                }
            });

            calendar.render();
        });
    </script>
</body>

</html>