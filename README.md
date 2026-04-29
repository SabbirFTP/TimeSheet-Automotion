# TimeSheet Automation

A Python automation tool that submits a Google Form repeatedly using structured JSON input. Built with Playwright, Pydantic, and python-dotenv.

## Features

- **JSON Input Handling**: Submit data from a file, standard input (pipe), or manual paste.
- **Persistent Chrome Profile**: Avoids logging in repeatedly by using an existing local Chrome profile.
- **Retry Logic & Delays**: Built-in delay between submissions and retries on failure.
- **Configurable Selectors**: Decouples the form structure from the code via `selectors.json`.
- **Automatic Field Selection**: Employee name and ID are automatically selected.

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd TimeSheet-Automotion

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# - FORM_URL: Your Google Form URL
# - CHROME_PROFILE_PATH: Path to your Chrome profiles
# - CHROME_PROFILE_NUMBER: Profile number to use (e.g., "2")
```

### 3. Run

```bash
# From a JSON file
python -m app.main --file entries.json

# From standard input
cat entries.json | python -m app.main

# Interactive mode
python -m app.main
```

## Input Format

```json
[
  {
    "date": "2026-04-29",
    "task_description": "Developed new feature for user authentication",
    "start_time": "09:00",
    "end_time": "12:00",
    "rating": 10
  }
]
```

See [format.md](format.md) for detailed input specifications.

## Setup Guide

For detailed setup instructions, including finding your Chrome profile path on different operating systems, see [GUIDE.md](GUIDE.md).

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| FORM_URL | Google Form URL | Required |
| CHROME_PROFILE_PATH | Path to Chrome profiles | Required |
| CHROME_PROFILE_NUMBER | Profile number to use | "1" |
| MAX_RETRIES | Number of retry attempts | 3 |
| MIN_DELAY | Minimum delay between submissions (seconds) | 2 |
| MAX_DELAY | Maximum delay between submissions (seconds) | 5 |
| HEADLESS_MODE | Run without visible browser | False |

### Chrome Profile Setup

Add this alias to your shell configuration:

```bash
# Linux/macOS (add to ~/.bashrc or ~/.zshrc)
alias oc='google-chrome --profile-directory="Profile 2"'

# Windows PowerShell (add to your profile)
function oc { & "C:\Program Files\Google\Chrome\Application\chrome.exe" --profile-directory="Profile 2" }
```

## Troubleshooting

- **Chrome won't launch**: Make sure Chrome is completely closed before running the tool
- **Form submission fails**: Check that you're logged into Google in the specified Chrome profile
- **Time format errors**: Ensure times are in HH:MM format (24-hour)

See [GUIDE.md](GUIDE.md) for more troubleshooting tips.

## License

MIT
