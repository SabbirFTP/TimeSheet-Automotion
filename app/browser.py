from playwright.sync_api import sync_playwright, Page, BrowserContext
from typing import Iterator
from contextlib import contextmanager
from .config import Config
from .utils import Logger

@contextmanager
def get_browser_context() -> Iterator[BrowserContext]:
    """Provides a persistent Playwright browser context using the local Chrome profile."""
    playwright = sync_playwright().start()

    # Construct the profile directory path
    profile_dir = f"{Config.CHROME_PROFILE_PATH}/Profile {Config.CHROME_PROFILE_NUMBER}"

    Logger.info(f"Launching Chrome with profile: {profile_dir}")
    try:
        # We use launch_persistent_context to keep user sessions (like Google login) intact
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=Config.HEADLESS_MODE,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        yield context
    except Exception as e:
        Logger.error(f"Failed to launch browser. Make sure Chrome is completely closed. Error: {e}")
        raise
    finally:
        context.close()
        playwright.stop()
