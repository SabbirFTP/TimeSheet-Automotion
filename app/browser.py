from playwright.sync_api import sync_playwright, Page, BrowserContext
from typing import Iterator
from contextlib import contextmanager
from .config import Config
from .utils import Logger

@contextmanager
def get_browser_context() -> Iterator[BrowserContext]:
    """Provides a persistent Playwright browser context using the local Chrome profile."""
    playwright = sync_playwright().start()
    
    Logger.info(f"Launching Chrome with profile: {Config.CHROME_PROFILE_PATH}")
    try:
        # We use launch_persistent_context to keep user sessions (like Google login) intact
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=Config.CHROME_PROFILE_PATH,
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
