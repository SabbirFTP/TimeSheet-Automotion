"""Configuration management using environment variables."""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CHROME_PROFILE_PATH: str = os.getenv("CHROME_PROFILE_PATH", "")
    FORM_URL: str = os.getenv("FORM_URL", "")

    # Fixed dropdown values
    EMPLOYEE_NAME: str = "Mr Monjel Morshed Sabbir"
    EMPLOYEE_ID: str = "202503"

    # Work hours
    WORK_START: str = "10:00"
    WORK_END: str = "19:00"
    LUNCH_START: str = "13:30"
    LUNCH_END: str = "14:30"

    # Retry settings
    MAX_RETRIES: int = 3
    MIN_DELAY: float = 2.0
    MAX_DELAY: float = 6.0

    @classmethod
    def validate(cls) -> bool:
        """Validate that all required config values are present."""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required in .env")
        if not cls.CHROME_PROFILE_PATH:
            raise ValueError("CHROME_PROFILE_PATH is required in .env")
        if not cls.FORM_URL:
            raise ValueError("FORM_URL is required in .env")
        if not Path(cls.CHROME_PROFILE_PATH).exists():
            raise ValueError(f"Chrome profile path does not exist: {cls.CHROME_PROFILE_PATH}")
        return True
