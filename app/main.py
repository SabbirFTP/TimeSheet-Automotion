"""Main entry point for the timesheet bot."""

import sys

from timesheet_bot.app.browser import BrowserManager
from timesheet_bot.app.config import Config
from timesheet_bot.app.form import submit_with_retry
from timesheet_bot.app.gemini import generate_timesheet_entries
from timesheet_bot.app.models import Entry
from timesheet_bot.app.utils import log, random_delay


def main() -> None:
    """Main execution flow."""
    try:
        # Validate configuration
        Config.validate()
        log("Configuration validated successfully")

        # Get user input
        count = int(input("Number of submissions: ").strip())
        if count <= 0:
            log("Number of submissions must be positive", "ERROR")
            sys.exit(1)

        prompt = input("Daily work description: ").strip()
        if not prompt:
            log("Work description cannot be empty", "ERROR")
            sys.exit(1)

        log(f"Generating {count} timesheet entries...")

        # Generate entries via Gemini
        entries = generate_timesheet_entries(prompt, count)
        log(f"Generated {len(entries)} entries")

        if len(entries) != count:
            log(f"Warning: Expected {count} entries, got {len(entries)}", "WARNING")

        # Launch browser
        browser = BrowserManager()
        page = browser.launch()

        # Submit each entry
        success_count = 0
        for i, entry in enumerate(entries, 1):
            log(f"Submitting {i}/{len(entries)}")

            if submit_with_retry(page, entry, Config.MAX_RETRIES):
                success_count += 1
                log("Success")
            else:
                log("Failed", "ERROR")

            # Random delay between submissions
            if i < len(entries):
                random_delay(Config.MIN_DELAY, Config.MAX_DELAY)

        # Close browser
        browser.close()

        # Summary
        log(f"Completed: {success_count}/{len(entries)} submissions successful")

        if success_count == len(entries):
            log("All submissions completed successfully!")
            sys.exit(0)
        else:
            log(f"Some submissions failed: {len(entries) - success_count} failed", "ERROR")
            sys.exit(1)

    except KeyboardInterrupt:
        log("\nInterrupted by user", "WARNING")
        sys.exit(130)
    except Exception as e:
        log(f"Fatal error: {e}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
