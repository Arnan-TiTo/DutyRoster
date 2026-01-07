# API Documentation

## Base URL
- Development: `http://localhost:8080/api`
- Production: `https://yourdomain.com/api`

## Authentication

All protected endpoints require session authentication. Login first to create a session.

### POST /api/auth/login
```json
{
  "username": "admin",
  "password": "Admin@9999"
}
```

### GET /api/auth/me
Returns current user info

### POST /api/auth/logout
Destroys session

## Employees

### GET /api/employees
List all employees

### POST /api/employees
Create employee
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "team_id": "uuid"
}
```

### GET /api/employees/{id}
Get employee details

### PUT /api/employees/{id}
Update employee

### POST /api/employees/{id}/deactivate
Deactivate employee

### GET /api/employees/me/holiday-balance
Get current user's holiday balance

## Leaves

### GET /api/leaves
List leave requests

### POST /api/leaves
Create leave request
```json
{
  "employee_id": "uuid",
  "leave_type_id": "uuid",
  "date_from": "2024-01-01",
  "date_to": "2024-01-03",
  "reason": "Vacation"
}
```

### POST /api/leaves/{id}/approve
Approve leave (Admin/Supervisor only)

### POST /api/leaves/{id}/reject
Reject leave (Admin/Supervisor only)

### POST /api/leaves/{id}/cancel
Cancel leave

## Roster

### GET /api/roster/entries?date_from=2024-01-01&date_to=2024-01-31
Get roster entries for date range

### POST /api/roster/entries
Create roster entry
```json
{
  "entry_date": "2024-01-01",
  "event_type_id": "uuid",
  "shift_slot_id": "uuid",
  "start_at": "08:00:00",
  "end_at": "16:00:00",
  "employee_ids": ["uuid1", "uuid2"]
}
```

## Calendar

### GET /api/calendar/month?year=2024&month=1
Get aggregated calendar data for month

## Reports

### GET /api/reports/daily?date=2024-01-01
Daily roster report

### GET /api/reports/summary?year=2024&month=1
Monthly summary report

## Response Format

### Success
```json
{
  "ok": true,
  "data": { ... }
}
```

### Error
```json
{
  "ok": false,
  "message": "Error message",
  "details": { ... }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
