# Input Format Guide

The tool accepts input as a JSON array of objects.

## Rules
- **start_time** and **end_time** must be in `HH:MM` format (24-hour).
- **end_time** must strictly be after **start_time**.
- **rating** is optional (defaults to `10` if omitted or invalid).
- The array will be processed sequentially.

## Example Input

```json
[
  {
    "project": "API Integration",
    "description": "Integrated backend APIs for homechef cloud app",
    "start_time": "10:20",
    "end_time": "11:45",
    "notes": "Used Retrofit + JWT",
    "rating": 10
  }
]
```
