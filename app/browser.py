"""Browser automation using Playwright with persistent Chrome profile."""

from typing import Optional

from playwright.sync_api import Page, sync_playwright

from timesheet_bot.app.config import Config
from timesheet_bot.app.utils import log


class BrowserManager:
    """Manages browser context with persistent Chrome profile."""

    def __init__(self):
        self.context = None
        self.playwright = None

    def launch(self) -> Page:
        """
        Launch browser with persistent Chrome profile.

        Returns:
            Page object ready for automation
        """
        log("Launching browser with persistent Chrome profile...")

        self.playwright = sync_playwright().start()

        self.context = self.playwright.chromium.launch_persistent_context(
            user_data_dir=Config.CHROME_PROFILE_PATH,
            channel="chrome",
            headless=False,
            viewport={"width": 1280, "height": 720},
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--profile-directory=Profile 2",
            ],
        )
        

        page = self.context.new_page()
        log("Browser launched successfully")
        return page

    def close(self) -> None:
        """Close browser and cleanup resources."""
        if self.context:
            self.context.close()
        if self.playwright:
            self.playwright.stop()
        log("Browser closed")
