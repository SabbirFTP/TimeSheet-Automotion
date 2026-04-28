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
                Logger.success(f"Successfully submitted entry: {entry.project}")
                return True
            except PlaywrightTimeoutError:
                Logger.warning(f"Timeout while processing entry: {entry.project} (Attempt {attempt}/{Config.MAX_RETRIES})")
            except Exception as e:
                Logger.error(f"Error submitting entry: {entry.project} (Attempt {attempt}/{Config.MAX_RETRIES}): {e}")
            
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

        # Map Entry fields to selectors
        # For simplicity, if time fields are split into Hour/Minute we assume user mapped them
        # Note: If start_time maps to two inputs (Hour, Minute), user needs special logic or specific custom selectors.
        # This implementation expects straightforward inputs as per standard forms. If custom mapping is needed,
        # users would adjust the selectors file.
        
        # We fill simple text fields and textareas
        self.page.fill(self.selectors["project"], entry.project)
        self.page.fill(self.selectors["description"], entry.description)
        
        # Time filling might vary based on form type (split fields vs single field)
        # Assuming the basic input fill for time based on standard selectors
        self.page.fill(self.selectors["start_time"], entry.start_time)
        self.page.fill(self.selectors["end_time"], entry.end_time)
        
        self.page.fill(self.selectors["notes"], entry.notes)
        
        # Rating might be a radio button or a clickable div (like a linear scale)
        rating_selector = self.selectors["rating"].replace("10", str(entry.rating))
        self.page.click(rating_selector)
        
        random_delay(0.5, 1.5) # Slight pause before submit
        
        # Submit the form
        self.page.click(self.selectors["submit_button"])
        
        # Wait for the "Submit another response" link to confirm submission
        self.page.wait_for_selector(self.selectors["submit_another_link"], timeout=10000)
