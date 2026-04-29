# TimeSheet Automation - Setup Guide

This guide will help you set up and use the TimeSheet automation tool for submitting Google Forms entries.

## Overview

This tool automates the submission of daily activity timesheet logs to a Google Form. It uses Playwright to interact with the form and a persistent Chrome profile to maintain your login session.

## Prerequisites

- Python 3.8 or higher
- Google Chrome browser
- A Google Form URL for timesheet submission

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TimeSheet-Automotion
```

### 2. Create a Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
playwright install chromium
```

## Configuration

### 1. Find Your Chrome Profile Path

#### Linux
```bash
# Default Chrome profile path
~/.config/google-chrome

# To find your exact profile path:
google-chrome --version
# Then check: ~/.config/google-chrome/
```

#### macOS
```bash
# Default Chrome profile path
~/Library/Application Support/Google/Chrome

# To find your exact profile path:
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
# Then check: ~/Library/Application Support/Google/Chrome/
```

#### Windows
```bash
# Default Chrome profile path
C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data

# To find your exact profile path:
# 1. Open Chrome
# 2. Type chrome://version/ in the address bar
# 3. Look for "Profile Path"
```

### 2. Set Up Chrome Profile Alias

Add this alias to your shell configuration file:

#### Linux/macOS (bash/zsh)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias oc='google-chrome --profile-directory="Profile 2"'
```

#### Windows (PowerShell)
```powershell
# Add to your PowerShell profile
function oc { & "C:\Program Files\Google\Chrome\Application\chrome.exe" --profile-directory="Profile 2" }
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform
CHROME_PROFILE_PATH=/home/sabbir/.config/google-chrome
CHROME_PROFILE_NUMBER=2
MAX_RETRIES=3
MIN_DELAY=2
MAX_DELAY=5
HEADLESS_MODE=False
```

**Important Notes:**
- `FORM_URL`: Your Google Form URL
- `CHROME_PROFILE_PATH`: The base path to your Chrome profiles (not including the profile folder)
- `CHROME_PROFILE_NUMBER`: The profile number you want to use (e.g., "2" for Profile 2)
- `HEADLESS_MODE`: Set to `True` to run without visible browser window

## Usage

### 1. Prepare Your Data

Create a JSON file with your timesheet entries. Example `entries.json`:

```json
[
  {
    "date": "2026-04-29",
    "task_description": "Developed new feature for user authentication",
    "start_time": "09:00",
    "end_time": "12:00",
    "rating": 10
  },
  {
    "date": "2026-04-29",
    "task_description": "Fixed bugs in payment processing module",
    "start_time": "13:00",
    "end_time": "17:00",
    "rating": 10
  }
]
```

**Field Descriptions:**
- `date`: Date in YYYY-MM-DD format
- `task_description`: Description of the work performed
- `start_time`: Start time in HH:MM format (24-hour)
- `end_time`: End time in HH:MM format (24-hour)
- `rating`: Productivity rating from 1 to 10 (default: 10)

### 2. Run the Automation

#### From a JSON file:
```bash
python -m app.main --file entries.json
```

#### From standard input (pipe):
```bash
cat entries.json | python -m app.main
```

#### Interactive mode (paste JSON):
```bash
python -m app.main
# Then paste your JSON and press Ctrl+D (Linux/macOS) or Ctrl+Z (Windows)
```

### 3. What Happens During Execution

1. The tool launches Chrome with your specified profile
2. It navigates to the Google Form
3. For each entry in your JSON:
   - Fills in the date
   - Selects "Mr Monjel Morshed Sabbir" as employee name
   - Selects "202503" as employee ID
   - Fills in the task description
   - Fills in start and end times
   - Selects rating (default: 10)
   - Submits the form
   - Waits for confirmation
   - Clicks "Submit another response" for the next entry
4. Displays a summary of successful and failed submissions

## Troubleshooting

### Chrome won't launch
- Make sure Chrome is completely closed before running the tool
- Check that your `CHROME_PROFILE_PATH` is correct
- Verify that the profile number exists

### Form submission fails
- Check that your `FORM_URL` is correct
- Ensure you're logged into Google in the specified Chrome profile
- Verify that the form selectors in `selectors.json` match your form

### Time format errors
- Ensure times are in HH:MM format (24-hour)
- Example: "09:00" for 9 AM, "17:30" for 5:30 PM

### Date format errors
- Ensure dates are in YYYY-MM-DD format
- Example: "2026-04-29" for April 29, 2026

## Security Notes

- Never commit your `.env` file to version control
- Keep your form URL private
- Use a dedicated Chrome profile for automation to avoid conflicts

## Advanced Usage

### Custom Delays

Adjust the delay between submissions in `.env`:

```env
MIN_DELAY=3  # Minimum delay in seconds
MAX_DELAY=7  # Maximum delay in seconds
```

### Retry Logic

Adjust the number of retry attempts:

```env
MAX_RETRIES=5  # Number of retry attempts per entry
```

### Headless Mode

Run without visible browser window:

```env
HEADLESS_MODE=True
```

## Support

For issues or questions, please refer to the project repository or contact the development team.
