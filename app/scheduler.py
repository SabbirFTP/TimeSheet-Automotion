"""Scheduler for managing submission times."""

from typing import List

from timesheet_bot.app.config import Config
from timesheet_bot.app.utils import log


class Scheduler:
    """Manages submission scheduling and timing."""

    @staticmethod
    def get_submission_times(count: int) -> List[str]:
        """
        Get submission times for the day.

        Args:
            count: Number of submissions

        Returns:
            List of time strings in "HH:MM" format
        """
        from timesheet_bot.app.utils import generate_timeslots

        times = generate_timeslots(count)
        log(f"Generated {len(times)} submission times: {times}")
        return times

    @staticmethod
    def should_submit_now(target_time: str) -> bool:
        """
        Check if it's time to submit.

        Args:
            target_time: Target time in "HH:MM" format

        Returns:
            True if current time matches target time (within 1 minute)
        """
        from datetime import datetime

        now = datetime.now()
        target = datetime.strptime(target_time, "%H:%M").replace(
            year=now.year, month=now.month, day=now.day
        )

        diff = abs((now - target).total_seconds())
        return diff <= 60  # Within 1 minute
