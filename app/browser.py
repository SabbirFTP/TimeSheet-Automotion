from playwright.sync_api import sync_playwright, Page, BrowserContext
from typing import Iterator
from contextlib import contextmanager
from .config import Config
from .utils import Logger

@contextmanager
def get_browser_context() -> Iterator[BrowserContext]:
    """Provides a persistent Playwright browser context using a shadow copy of the profile."""
    import os
    import shutil
    
    playwright = sync_playwright().start()

    # Project-local directory for automation
    automation_udd = os.path.abspath(".automation_udd")
    os.makedirs(automation_udd, exist_ok=True)
    
    # Path to the actual profile (e.g., .../Profile 2 or .../Default)
    profile_number = Config.CHROME_PROFILE_NUMBER
    if profile_number.lower() == "default":
        actual_profile_path = os.path.join(Config.CHROME_PROFILE_PATH, "Default")
    else:
        actual_profile_path = os.path.join(Config.CHROME_PROFILE_PATH, f"Profile {profile_number}")
    
    # We want Playwright's "Default" profile to point to our desired profile
    target_link = os.path.join(automation_udd, "Default")
    
    if os.path.islink(target_link):
        os.unlink(target_link)
    elif os.path.exists(target_link):
        shutil.rmtree(target_link)
        
    try:
        os.symlink(actual_profile_path, target_link)
        # Also symlink Local State if possible
        local_state_src = os.path.join(Config.CHROME_PROFILE_PATH, "Local State")
        local_state_dst = os.path.join(automation_udd, "Local State")
        if os.path.exists(local_state_src) and not os.path.exists(local_state_dst):
             os.symlink(local_state_src, local_state_dst)
    except Exception as e:
        Logger.warning(f"Could not create symlink for profile: {e}. Falling back to standard launch.")

    Logger.info(f"Launching Chrome with Shadow Profile: {actual_profile_path}")
    
    context = None
    try:
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=automation_udd,
            executable_path="/usr/bin/google-chrome",
            headless=Config.HEADLESS_MODE,
            ignore_default_args=["--enable-automation"],
            args=[
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-blink-features=AutomationControlled"
            ]
        )
        yield context
    except Exception as e:
        Logger.error(f"Failed to launch browser. ERROR: {e}")
        raise
    finally:
        if context:
            context.close()
        playwright.stop()
