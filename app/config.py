import os
import json
from dotenv import load_dotenv

load_dotenv()

class Config:
    FORM_URL = os.getenv("FORM_URL")
    CHROME_PROFILE_PATH = os.getenv("CHROME_PROFILE_PATH")
    CHROME_PROFILE_NUMBER = os.getenv("CHROME_PROFILE_NUMBER", "1")
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", 3))
    MIN_DELAY = float(os.getenv("MIN_DELAY", 2.0))
    MAX_DELAY = float(os.getenv("MAX_DELAY", 5.0))
    HEADLESS_MODE = os.getenv("HEADLESS_MODE", "False").lower() in ("true", "1", "t")

    @classmethod
    def load_selectors(cls, path: str = "selectors.json") -> dict:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Selectors file not found: {path}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON format in selectors file: {path}")

    @classmethod
    def validate(cls):
        if not cls.FORM_URL:
            raise ValueError("FORM_URL is not set in the environment.")
        if not cls.CHROME_PROFILE_PATH:
            raise ValueError("CHROME_PROFILE_PATH is not set in the environment.")
