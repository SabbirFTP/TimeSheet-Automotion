# Input Format Guide

The tool accepts input as a JSON array of objects.

## Rules
- **date** must be in `YYYY-MM-DD` format.
- **start_time** and **end_time** must be in `HH:MM` format (24-hour).
- **end_time** must strictly be after **start_time**.
- **rating** is optional (defaults to `10` if omitted or invalid).
- The array will be processed sequentially.

## Example Input

```json
[
  {
    "date": "2026-04-29",
    "task_description": "Developed new feature for user authentication",
    "start_time": "09:00",
    "end_time": "12:00",
    "rating": 10
  },
  {
    "date": "2026-04-29",
    "task_description": "Fixed bugs in payment processing module",
    "start_time": "13:00",
    "end_time": "17:00"
  }
]
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | Yes | Date in YYYY-MM-DD format |
| task_description | string | Yes | Description of the work performed |
| start_time | string | Yes | Start time in HH:MM format (24-hour) |
| end_time | string | Yes | End time in HH:MM format (24-hour) |
| rating | integer | No | Productivity rating from 1 to 10 (default: 10) |

## Notes

- Employee name is automatically set to "Mr Monjel Morshed Sabbir"
- Employee ID is automatically set to "202503"
- Rating defaults to 10 if not specified
