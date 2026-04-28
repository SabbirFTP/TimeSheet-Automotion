import argparse
from .config import Config
from .loader import load_entries
from .browser import get_browser_context
from .form import FormSubmitter
from .utils import Logger, random_delay

def main():
    parser = argparse.ArgumentParser(description="Google Form Submitter")
    parser.add_argument("--file", type=str, help="Path to the JSON file containing entries")
    args = parser.parse_args()

    # Load configuration
    try:
        Config.validate()
        selectors = Config.load_selectors()
    except Exception as e:
        Logger.error(f"Configuration Error: {e}")
        return

    # Load entries
    entries = load_entries(args.file)
    if not entries:
        Logger.info("No entries to process.")
        return

    total = len(entries)
    successful = 0
    failed = 0

    Logger.info(f"Starting submission process for {total} entries...")

    # Initialize browser and process entries
    try:
        with get_browser_context() as context:
            # Create a new page
            page = context.new_page()
            submitter = FormSubmitter(page, selectors)

            for i, entry in enumerate(entries, 1):
                Logger.info(f"--- Processing Entry {i}/{total} ---")
                
                if submitter.submit(entry):
                    successful += 1
                else:
                    failed += 1
                
                # Add delay between entries (except the last one)
                if i < total:
                    Logger.info("Waiting before next entry...")
                    random_delay(Config.MIN_DELAY, Config.MAX_DELAY)

    except Exception as e:
        Logger.error(f"Execution failed: {e}")

    # Output Summary
    print("\n")
    Logger.info("================ Summary ================")
    Logger.info(f"Total Entries: {total}")
    Logger.success(f"Successful: {successful}")
    if failed > 0:
        Logger.error(f"Failed: {failed}")
    Logger.info("=========================================")

if __name__ == "__main__":
    main()
