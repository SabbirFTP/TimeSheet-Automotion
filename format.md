# Timesheet Entry Format

## JSON Structure

Provide an array of timesheet entries in the following format:

```json
[
  {
    "project": "Project Name",
    "description": "Task description",
    "start_time": "10:00",
    "end_time": "11:30",
    "notes": "Optional notes",
    "rating": 10
  },
  {
    "project": "Another Project",
    "description": "Another task",
    "start_time": "11:35",
    "end_time": "12:15",
    "notes": "More notes",
    "rating": 10
  }
]
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | Yes | Name of project/app/task |
| `description` | string | Yes | Detailed task description |
| `start_time` | string | Yes | Start time in HH:MM format |
| `end_time` | string | Yes | End time in HH:MM format |
| `notes` | string | Yes | Optional notes about the task |
| `rating` | integer | No | Rating value (default: 10) |

## Example

```json
[
  {
    "project": "API Development",
    "description": "Implemented user authentication endpoints",
    "start_time": "10:00",
    "end_time": "11:30",
    "notes": "Used JWT tokens for security",
    "rating": 10
  },
  {
    "project": "Bug Fixes",
    "description": "Fixed login form validation issue",
    "start_time": "11:35",
    "end_time": "12:15",
    "notes": "Frontend fix",
    "rating": 10
  },
  {
    "project": "Code Review",
    "description": "Reviewed pull requests for team",
    "start_time": "14:30",
    "end_time": "15:30",
    "notes": "Provided feedback on 3 PRs",
    "rating": 10
  }
]
```

## Notes

- All times must be in 24-hour format (HH:MM)
- `rating` defaults to 10 if not provided
- `notes` is required but can be an empty string
