"""Google Form automation for timesheet submission."""

import random
from typing import Optional

from playwright.sync_api import Page

from timesheet_bot.app.config import Config
from timesheet_bot.app.models import Entry
from timesheet_bot.app.utils import log, random_delay


def submit_form(page: Page, entry: Entry) -> bool:
    """
    Submit a single timesheet entry to the Google Form.

    Args:
        page: Playwright Page object
        entry: Entry data to submit

    Returns:
        True if successful, False otherwise
    """
    try:
        log(f"Submitting entry: {entry.project} - {entry.description}")

        # Navigate to form
        page.goto(Config.FORM_URL)
        page.wait_for_load_state("networkidle")

        # Fill Employee Name dropdown
        _select_dropdown(page, "Employee Name", Config.EMPLOYEE_NAME)

        # Fill Employee ID dropdown
        _select_dropdown(page, "Employee ID", Config.EMPLOYEE_ID)

        # Fill Project field
        _fill_text_field(page, "Project / App / Task / Sub Task", entry.project)

        # Fill Description field
        _fill_text_field(page, "Task Description", entry.description)

        # Fill Start Time
        _fill_text_field(page, "Start Time", entry.start_time)

        # Fill End Time
        _fill_text_field(page, "End Time", entry.end_time)

        # Fill Notes
        _fill_text_field(page, "Notes (Optional)", entry.notes)

        # Select Rating (always 10)
        _select_rating(page, "10")

        # Submit form
        _submit_form(page)

        log("Entry submitted successfully")
        return True

    except Exception as e:
        log(f"Failed to submit entry: {e}", "ERROR")
        return False


def _select_dropdown(page: Page, label: str, value: str) -> None:
    """Select an option from a dropdown by label."""
    selector = f'[aria-label="{label}"]'
    page.wait_for_selector(selector, timeout=10000)
    page.click(selector)
    random_delay(0.2, 0.5)

    # Click the option with the specified text
    option_selector = f'role=option[name="{value}"]'
    page.wait_for_selector(option_selector, timeout=5000)
    page.click(option_selector)
    random_delay(0.2, 0.5)


def _fill_text_field(page: Page, aria_label: str, value: str) -> None:
    """Fill a text field by aria-label."""
    selector = f'[aria-label="{aria_label}"]'
    page.wait_for_selector(selector, timeout=10000)

    element = page.locator(selector)
    element.scroll_into_view_if_needed()
    element.fill(value)
    random_delay(0.2, 0.5)


def _select_rating(page: Page, rating: str) -> None:
    """Select a rating by clicking the label containing the rating value."""
    selector = f'label:has-text("{rating}")'
    page.wait_for_selector(selector, timeout=10000)

    element = page.locator(selector)
    element.scroll_into_view_if_needed()
    element.click()
    random_delay(0.2, 0.5)


def _submit_form(page: Page) -> None:
    """Submit the form and wait for confirmation."""
    # Find and click submit button
    submit_selector = 'span:has-text("Submit")'
    page.wait_for_selector(submit_selector, timeout=10000)

    submit_button = page.locator(submit_selector)
    submit_button.scroll_into_view_if_needed()
    submit_button.click()

    # Wait for confirmation message
    confirmation_selector = 'div:has-text("Your response has been recorded")'
    page.wait_for_selector(confirmation_selector, timeout=15000)

    random_delay(1.0, 2.0)


def submit_with_retry(page: Page, entry: Entry, max_retries: int = 3) -> bool:
    """
    Submit form with retry mechanism.

    Args:
        page: Playwright Page object
        entry: Entry data to submit
        max_retries: Maximum number of retry attempts

    Returns:
        True if successful, False otherwise
    """
    for attempt in range(1, max_retries + 1):
        if submit_form(page, entry):
            return True

        if attempt < max_retries:
            log(f"Retrying... (Attempt {attempt + 1}/{max_retries})")
            random_delay(2.0, 4.0)

    log(f"Failed after {max_retries} attempts", "ERROR")
    return False
