"""Data models for timesheet entries."""

from dataclasses import dataclass
from typing import List


@dataclass
class Entry:
    """Represents a single timesheet entry."""

    project: str
    description: str
    start_time: str
    end_time: str
    notes: str
    rating: int = 10
