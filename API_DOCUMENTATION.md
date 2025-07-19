# Koabiga API Documentation

## Overview
The Koabiga API provides programmatic access to the agricultural management system. This documentation covers all available endpoints, authentication methods, and data formats.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:8000/api
```

## Authentication
All API endpoints require authentication using Laravel's web session authentication.

### Authentication Flow
1. User logs in through web interface
2. Session cookie is automatically included in API requests
3. API validates session and user permissions

## Rate Limiting
- **Admin Routes**: 60 requests per minute
- **Member Routes**: 60 requests per minute  
- **Leader Routes**: 60 requests per minute
- **Public Routes**: 30 requests per minute
- **Payment Callbacks**: 10 requests per minute

## Error Responses
All error responses follow this format:
```json
{
    "success": false,
    "message": "Error description"
}
```

## Admin API Endpoints

### Dashboard
```
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/activities
GET /api/admin/dashboard/members
```

### Reports Management
```
GET /api/admin/reports
POST /api/admin/reports/generate
GET /api/admin/reports/statistics
PATCH /api/admin/reports/{id}/status
DELETE /api/admin/reports/{id}
```

### System Metrics
```
GET /api/admin/system-metrics/current-stats
GET /api/admin/system-metrics/dashboard
GET /api/admin/system-metrics/historical
POST /api/admin/system-metrics/record
```

### Activity Logs
```
GET /api/admin/activity-logs
GET /api/admin/activity-logs/statistics
GET /api/admin/activity-logs/user/{userId}/summary
DELETE /api/admin/activity-logs/clear-old
```

### Error Logs
```
GET /api/admin/error-logs
GET /api/admin/error-logs/statistics
GET /api/admin/error-logs/{id}
PATCH /api/admin/error-logs/{id}/resolve
POST /api/admin/error-logs/bulk-resolve
DELETE /api/admin/error-logs/clear-old
```

### Login Sessions
```
GET /api/admin/login-sessions
GET /api/admin/login-sessions/statistics
GET /api/admin/login-sessions/user/{userId}/summary
DELETE /api/admin/login-sessions/{sessionId}/force-logout
DELETE /api/admin/login-sessions/clear-old
```

### Members Management
```
GET /api/admin/members
POST /api/admin/members
GET /api/admin/members/{id}
PUT /api/admin/members/{id}
DELETE /api/admin/members/{id}
POST /api/admin/members/import
GET /api/admin/members/export
```

### Units Management
```
GET /api/admin/admin-units
POST /api/admin/admin-units
POST /api/admin/admin-units/generate-code
GET /api/admin/admin-units/{id}
PUT /api/admin/admin-units/{id}
DELETE /api/admin/admin-units/{id}
GET /api/admin/admin-units/{id}/members
POST /api/admin/admin-units/{id}/members
DELETE /api/admin/admin-units/{id}/members/{memberId}
GET /api/admin/admin-units/statistics
```

### Zones Management
```
GET /api/admin/zones
POST /api/admin/zones
GET /api/admin/zones/{id}
PUT /api/admin/zones/{id}
DELETE /api/admin/zones/{id}
GET /api/admin/zones/{id}/units
GET /api/admin/zones/{id}/members
GET /api/admin/zones/statistics
```

### Fee Rules Management
```
GET /api/admin/fee-rules
POST /api/admin/fee-rules
GET /api/admin/fee-rules/statistics
GET /api/admin/fee-rules/{feeRule}
PUT /api/admin/fee-rules/{feeRule}
DELETE /api/admin/fee-rules/{feeRule}
POST /api/admin/fee-rules/{feeRule}/apply
POST /api/admin/fee-rules/{feeRule}/schedule
POST /api/admin/fee-rules/{feeRule}/assign-units
GET /api/admin/fee-rules/{feeRule}/applications
GET /api/admin/fee-rules/{feeRule}/unit-assignments
GET /api/admin/fee-rules/{feeRule}/statistics
```

### Pages Management
```
GET /api/admin/pages
POST /api/admin/pages
GET /api/admin/pages/{page}
PUT /api/admin/pages/{page}
DELETE /api/admin/pages/{page}
GET /api/admin/pages/navigation/{role}/preview
GET /api/admin/pages/statistics
```

### Forms Management
```
GET /api/admin/forms
POST /api/admin/forms
GET /api/admin/forms/{form}
PUT /api/admin/forms/{form}
DELETE /api/admin/forms/{form}
GET /api/admin/forms/{form}/submissions
GET /api/admin/forms/{form}/assigned-members
POST /api/admin/forms/{form}/assign-members
DELETE /api/admin/forms/{form}/unassign-members
POST /api/admin/forms/sync
GET /api/admin/forms/stats
GET /api/admin/forms/available
POST /api/admin/forms/create-file
DELETE /api/admin/forms/delete-file/{formName}
```

## Member API Endpoints

### Dashboard
```
GET /api/member/dashboard/stats
GET /api/member/dashboard/activities
GET /api/member/dashboard/upcoming-fees
```

### Data Access
```
GET /api/member/unit
GET /api/member/land
GET /api/member/crops
GET /api/member/produce
GET /api/member/forms
GET /api/member/reports
GET /api/member/fees
```

### Payments
```
POST /api/member/payments/initiate
POST /api/member/payments/check-status
GET /api/member/payments/history
```

## Leader API Endpoints

### Dashboard
```
GET /api/leaders/stats
GET /api/leaders/activities
GET /api/leaders/tasks
```

### Unit Management
```
GET /api/leaders/unit
GET /api/leaders/members
GET /api/leaders/crops
GET /api/leaders/produce
GET /api/leaders/reports
GET /api/leaders/lands
GET /api/leaders/forms
GET /api/leaders/assigned-forms
GET /api/leaders/fees
```

### Member Management
```
POST /api/leaders/members
PUT /api/leaders/members/{id}
GET /api/leaders/members/{id}
```

### Land Management
```
POST /api/leaders/land
PUT /api/leaders/land/{id}
GET /api/leaders/land/{id}
```

### Crop Management
```
POST /api/leaders/crops
PUT /api/leaders/crops/{id}
GET /api/leaders/crops/{id}
```

### Produce Management
```
POST /api/leaders/produce
PUT /api/leaders/produce/{id}
GET /api/leaders/produce/{id}
```

### Profile Management
```
PUT /api/leaders/profile
PUT /api/leaders/password
PUT /api/leaders/notifications
```

## Unit Leader Specific Endpoints

### Form Submissions
```
GET /api/unit-leader/unit
GET /api/unit-leader/land
GET /api/unit-leader/members
GET /api/unit-leader/crops
POST /api/unit-leader/land
POST /api/unit-leader/crops
POST /api/unit-leader/produce
POST /api/unit-leader/forms/submit
```

## Public Endpoints

### System Health
```
GET /api/system/health
```

### Payment Callbacks
```
POST /api/mtn-momo/callback
```

## Data Models

### User
```json
{
    "id": 1,
    "christian_name": "John",
    "family_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "member",
    "status": "active",
    "unit_id": 1,
    "zone_id": 1,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Unit
```json
{
    "id": 1,
    "name": "Unit A",
    "code": "UA001",
    "description": "Unit description",
    "zone_id": 1,
    "leader_id": 2,
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Zone
```json
{
    "id": 1,
    "name": "Zone A",
    "code": "ZA001",
    "description": "Zone description",
    "leader_id": 2,
    "location": "Kigali",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Fee Rule
```json
{
    "id": 1,
    "name": "Monthly Fee",
    "type": "monthly",
    "amount": 1000,
    "frequency": "monthly",
    "unit": "RWF",
    "status": "active",
    "applicable_to": "members",
    "description": "Monthly membership fee",
    "effective_date": "2024-01-01",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

## Pagination
Paginated responses include:
```json
{
    "success": true,
    "data": [...],
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 75
    }
}
```

## Webhooks
Currently, the API does not support webhooks. All data synchronization should be done through polling the appropriate endpoints.

## Support
For API support, contact the system administrator or refer to the internal documentation. 