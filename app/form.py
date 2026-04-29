from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError
from .models import Entry
from .config import Config
from .utils import Logger, random_delay

class FormSubmitter:
    def __init__(self, page: Page, selectors: dict):
        self.page = page
        self.selectors = selectors
        self.form_url = Config.FORM_URL

    def submit(self, entry: Entry) -> bool:
        """Attempts to submit the form with retry logic."""
        for attempt in range(1, Config.MAX_RETRIES + 1):
            try:
                self._fill_and_submit(entry)
                Logger.success(f"Successfully submitted entry: {entry.date} - {entry.task_description[:30]}...")
                return True
            except PlaywrightTimeoutError:
                Logger.warning(f"Timeout while processing entry: {entry.date} (Attempt {attempt}/{Config.MAX_RETRIES})")
            except Exception as e:
                Logger.error(f"Error submitting entry: {entry.date} (Attempt {attempt}/{Config.MAX_RETRIES}): {e}")

            if attempt < Config.MAX_RETRIES:
                Logger.info("Retrying...")
                random_delay(Config.MIN_DELAY, Config.MAX_DELAY)

        return False

    def _fill_and_submit(self, entry: Entry):
        """Navigates, fills the fields based on selectors mapping, and submits."""
        Logger.info(f"Navigating to form: {self.form_url}")
        self.page.goto(self.form_url, wait_until="networkidle")

        # Give it a short delay to ensure JS is fully loaded
        self.page.wait_for_timeout(1000)

        # Fill Date field
        Logger.info(f"Filling date: {entry.date}")
        self.page.fill(self.selectors["date"], entry.date)

        # Select Employee Name (dropdown)
        Logger.info("Selecting employee name: Mr Monjel Morshed Sabbir")
        self.page.click(self.selectors["employee_name"])

        # Select Employee ID (dropdown)
        Logger.info("Selecting employee ID: 202503")
        self.page.click(self.selectors["employee_id"])

        # Fill Task Description
        Logger.info(f"Filling task description: {entry.task_description[:30]}...")
        self.page.fill(self.selectors["task_description"], entry.task_description)

        # Fill Start Time
        Logger.info(f"Filling start time: {entry.start_time}")
        self.page.fill(self.selectors["start_time"], entry.start_time)

        # Fill End Time
        Logger.info(f"Filling end time: {entry.end_time}")
        self.page.fill(self.selectors["end_time"], entry.end_time)

        # Select Rating (always 10)
        Logger.info(f"Selecting rating: {entry.rating}")
        self.page.click(self.selectors["rating"])

        random_delay(0.5, 1.5)  # Slight pause before submit

        # Submit the form
        Logger.info("Submitting form...")
        self.page.click(self.selectors["submit_button"])

        # Wait for the "Submit another response" link to confirm submission
        Logger.info("Waiting for submission confirmation...")
        self.page.wait_for_selector(self.selectors["submit_another_link"], timeout=10000)
