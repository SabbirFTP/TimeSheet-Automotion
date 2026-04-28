# Google Form Submitter

A Python automation tool that submits a Google Form repeatedly using structured JSON input. Built with Playwright, Pydantic, and python-dotenv.

## Features
- **JSON Input Handling**: Submit data from a file, standard input (pipe), or manual paste.
- **Persistent Chrome Profile**: Avoids logging in repeatedly by using an existing local Chrome profile.
- **Retry Logic & Delays**: Built-in delay between submissions and retries on failure.
- **Configurable Selectors**: Decouples the form structure from the code via `selectors.json`.

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/form-submit-auto.git
cd form-submit-auto
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

2. **Configuration**
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   
   Ensure you provide your exact `FORM_URL` and `CHROME_PROFILE_PATH`. You can find your Chrome profile path by typing `chrome://version/` in Chrome and looking for "Profile Path" (do not include the `/Default` folder if you want the root data dir, but usually it's fine).

3. **Selectors Configuration**
   Update `selectors.json` to match the CSS selectors of your specific Google Form. Google form classes change frequently, so using robust selectors (like `aria-labelledby` or `jsname`) is recommended.

## Usage

### 1. File Input
```bash
python -m app.main --file entries.json
```

### 2. Piped Input
```bash
cat entries.json | python -m app.main
```

### 3. Manual Paste (Interactive Mode)
```bash
python -m app.main
```
(Paste your JSON array and press `Ctrl+D` to submit)

## Input Format
See `format.md` and `format.json` for details on the input schema.
