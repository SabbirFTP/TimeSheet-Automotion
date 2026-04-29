# Google Form Auto-Submitter Extension

A Chrome extension to automate daily activity timesheet logging on Google Forms.

## 🚀 Installation

1.  **Download/Clone** this repository to your local machine.
2.  Open **Chrome Browser** and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (toggle in the top-right corner).
4.  Click **Load unpacked** and select the folder containing these extension files (where `manifest.json` is located).

## 🛠️ Usage

1.  Navigate to the **Google Form** you wish to fill.
2.  Click the **Google Form Auto-Submitter** icon in your browser toolbar.
3.  Paste a JSON array of entries into the textarea.
4.  Click **Start Automation**.
5.  The extension will:
    *   Auto-select your Name (**Monjel morshed sabbir**) and ID (**202503**).
    *   Fill Project, Description, Start Time, and End Time.
    *   Set Rating to **10**.
    *   Enable **"Send me a copy of my responses"**.
    *   Submit and repeat for all entries in the JSON.

## 📊 Data Structure

The extension expects a JSON array of objects. Below are the supported fields:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `project` | String | Yes | The name of the project/app. |
| `description` | String | Yes | Detail of the task performed. |
| `start_time` | String | Yes | Format `HH:MM` (e.g., `"09:30"`). |
| `end_time` | String | Yes | Format `HH:MM` (e.g., `"18:00"`). |
| `notes` | String | No | Optional additional notes. |

### Example Input:
```json
[
  {
    "project": "Internal Dashboard",
    "description": "Fixed layout bugs and updated profile page.",
    "start_time": "10:00",
    "end_time": "11:30",
    "notes": "Used React and Tailwind."
  },
  {
    "project": "API Integration",
    "description": "Wrote unit tests for auth middleware.",
    "start_time": "11:30",
    "end_time": "13:00"
  }
]
```

## ⚠️ Notes
*   **Keep the tab active**: Do not close the tab or navigate away while the automation is running.
*   **Hardcoded values**: Your Name (`Mr Monjel Morshed Sabbir`), ID (`202503`), and Rating (`10`) are currently hardcoded in `content.js` for seamless usage.
