"""Entry loader for parsing JSON input."""

import json
from typing import List

from timesheet_bot.app.models import Entry


def load_entries_from_json(json_string: str) -> List[Entry]:
    """
    Parse timesheet entries from JSON string.

    Args:
        json_string: JSON string containing array of entries

    Returns:
        List of Entry objects

    Raises:
        ValueError: If JSON is invalid or format is incorrect
    """
    try:
        data = json.loads(json_string)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")

    if not isinstance(data, list):
        raise ValueError("Expected JSON array of entries")

    entries = []
    for i, item in enumerate(data, 1):
        if not isinstance(item, dict):
            raise ValueError(f"Entry {i} must be an object")

        required_fields = ["project", "description", "start_time", "end_time", "notes"]
        for field in required_fields:
            if field not in item:
                raise ValueError(f"Entry {i} missing required field: {field}")

        entry = Entry(
            project=item["project"],
            description=item["description"],
            start_time=item["start_time"],
            end_time=item["end_time"],
            notes=item["notes"],
            rating=item.get("rating", 10),
        )
        entries.append(entry)

    return entries
