# Timesheet Bot

Automated Google Form submission tool for timesheet entries using Playwright.

---

## 🚀 Features

* Direct JSON input for timesheet entries
* Uses real Chrome profile (no login automation required)
* Fully automated form filling & submission
* Retry mechanism for reliability
* Random delays (anti-bot safe)
* Clean logging & modular architecture

---

## ⚠️ System Requirement Note (IMPORTANT)

If you're on Ubuntu/Debian (Python 3.12+), you will see:

```
error: externally-managed-environment
```

👉 This is due to PEP 668 (system Python protection).

✔ **Solution: Use Virtual Environment (REQUIRED)**

---

## 📦 Requirements

* Python 3.11+
* Google Chrome

---

## 🛠️ Setup

### 1. Install system dependencies

```bash
sudo apt install python3-venv python3-full
```

---

### 2. Create Virtual Environment

```bash
python3 -m venv .venv
```

---

### 3. Activate Virtual Environment

```bash
source .venv/bin/activate
```

You should now see:

```
(.venv)
```

---

### 4. Upgrade pip

```bash
pip install --upgrade pip
```

---

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 6. Install Playwright Browsers

```bash
playwright install
```

---

## 🌐 Chrome Profile Setup

This project uses your **existing logged-in Chrome session**.

### 🔍 Get Chrome Profile Path

**Linux:**

```bash
~/.config/google-chrome
```

👉 Recommended:
Use root profile (NOT `/Default`), example:

```
/home/sabbir/.config/google-chrome
```

---

**macOS:**

```bash
~/Library/Application Support/Google/Chrome
```

---

**Windows:**

```bash
C:\Users\YourName\AppData\Local\Google\Chrome\User Data
```

---

### ⚠️ Important

* Make sure Chrome is **logged into your Google account**
* Close all Chrome windows before running script (prevents profile lock)

---

## 🔐 Environment Configuration

Create `.env` file:

```env
CHROME_PROFILE_PATH=/absolute/path/to/chrome/profile
FORM_URL=https://docs.google.com/forms/d/e/XXXX/viewform
```

---

## 📝 Entry Format

See `format.md` or `format.json` for the complete specification.

### Quick Example

```json
[
  {
    "project": "API Development",
    "description": "Implemented user authentication endpoints",
    "start_time": "10:00",
    "end_time": "11:30",
    "notes": "Used JWT tokens",
    "rating": 10
  },
  {
    "project": "Bug Fixes",
    "description": "Fixed login form validation",
    "start_time": "11:35",
    "end_time": "12:15",
    "notes": "Frontend fix",
    "rating": 10
  }
]
```

---

## ▶️ Usage

Run the bot:

```bash
python app/main.py
```

You will be prompted to paste your JSON entries. Press Enter on an empty line to finish.

---

## 🧠 How It Works

1. You paste JSON array of timesheet entries
2. Playwright opens Chrome with your profile
3. Fills the form for each entry
4. Submits repeatedly with random delays

---

## 📁 Project Structure

```
timesheet_bot/
├── app/
│   ├── main.py          # Entry point
│   ├── config.py        # Configuration management
│   ├── browser.py       # Playwright browser automation
│   ├── form.py          # Google Form submission
│   ├── loader.py        # JSON entry parser
│   ├── models.py        # Data models
│   └── utils.py         # Utility functions
│
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
├── format.md           # Entry format documentation
├── format.json         # Entry format schema
└── README.md           # This file
```

---

## 🧩 Form Mapping

Uses aria-label selectors:

* Employee Name → `Employee Name`
* Employee ID → `Employee ID`
* Project → `Project / App / Task / Sub Task`
* Description → `Task Description`
* Start Time → `Start Time`
* End Time → `End Time`
* Notes → `Notes (Optional)`
* Rating → Always selects **10**

---

## ⏱️ Work Logic

* Entries submitted in order provided
* Random delay between submissions (2–6 sec)
* Retries each submission up to 3 times

---

## 🔁 Error Handling

* Retries each submission up to 3 times
* Logs failures without stopping entire process

---

## ❌ What NOT To Do

```bash
pip install --break-system-packages
```

🚫 Avoid this — may break system Python

---

## ⚡ Dev Tips

### Activate venv quickly:

```bash
source .venv/bin/activate
```

(Optional alias)

```bash
alias venv="source .venv/bin/activate"
```

---

## 🧪 Troubleshooting

### ❌ Chrome not opening

* Close all Chrome windows
* Check correct profile path

---

### ❌ Form not submitting

* Verify selectors (Google may change DOM)
* Ensure correct account is logged in

---

### ❌ Playwright issues

```bash
playwright install
```

---

## 🔮 Future Improvements

* CLI flags (`--file`, `--json`)
* Cron job support
* Multiple form configs
* Submission history logging

---

## 📜 License

MIT
