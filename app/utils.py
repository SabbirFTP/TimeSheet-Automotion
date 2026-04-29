"""Utility functions for the timesheet bot."""

import random
import time
from datetime import datetime, timedelta
from typing import List


def random_delay(min_seconds: float = 2.0, max_seconds: float = 6.0) -> None:
    """Sleep for a random duration between min and max seconds."""
    delay = random.uniform(min_seconds, max_seconds)
    time.sleep(delay)


def generate_timeslots(count: int) -> List[str]:
    """
    Generate evenly distributed timeslots within work hours.

    Work hours: 10:00 → 19:00
    Lunch break: 13:30 → 14:30 (excluded)
    Max gap between submissions: 1 hour 59 minutes

    Args:
        count: Number of timeslots to generate

    Returns:
        List of time strings in "HH:MM" format
    """
    if count <= 0:
        return []

    # Define work periods (before and after lunch)
    morning_start = datetime.strptime("10:00", "%H:%M")
    morning_end = datetime.strptime("13:30", "%H:%M")
    afternoon_start = datetime.strptime("14:30", "%H:%M")
    afternoon_end = datetime.strptime("19:00", "%H:%M")

    # Calculate total available minutes
    morning_minutes = int((morning_end - morning_start).total_seconds() / 60)
    afternoon_minutes = int((afternoon_end - afternoon_start).total_seconds() / 60)
    total_minutes = morning_minutes + afternoon_minutes

    # Calculate interval between submissions
    # Ensure max gap is less than 2 hours (119 minutes)
    max_gap_minutes = 119
    interval = min(total_minutes // count, max_gap_minutes)

    timeslots = []
    current_time = morning_start

    for i in range(count):
        # Skip lunch break
        if morning_end <= current_time < afternoon_start:
            current_time = afternoon_start

        # Add current time to list
        timeslots.append(current_time.strftime("%H:%M"))

        # Move to next timeslot with small random variation (±5 minutes)
        variation = random.randint(-5, 5)
        next_time = current_time + timedelta(minutes=interval + variation)

        # Skip lunch break if we cross into it
        if morning_end <= next_time < afternoon_start:
            next_time = afternoon_start

        current_time = next_time

        # Stop if we've exceeded work hours
        if current_time >= afternoon_end:
            break

    return timeslots


def log(message: str, level: str = "INFO") -> None:
    """Print a formatted log message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")
