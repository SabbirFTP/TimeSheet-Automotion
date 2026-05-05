# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that automates Google Form submissions for timesheet entries. It consists of a popup UI and a content script that runs on Google Forms pages.

## Architecture

### Extension Components

- **manifest.json**: Chrome extension manifest (v3) with permissions for `activeTab`, `scripting`, and `storage`
- **popup.html/popup.js/styles.css**: Extension popup UI with accordion layout
- **content.js**: Content script injected into Google Forms pages

### State Management

The extension uses `chrome.storage.local` for state persistence:
- `automationData`: Array of task objects to submit
- `currentIndex`: Current position in the automation queue
- `isActive`: Boolean flag for automation status
- `customDate`: Optional date for submissions (defaults to today)
- `originalUrl`: Base URL of the form for navigation
- `dailyNotes`: User's daily work notes (auto-saved)
- `trainedChatUrl`: Optional URL for AI chat integration

### Content Script Strategy

The content script uses **label-based discovery** rather than hardcoded IDs, as Google Forms use obfuscated class names. Key functions:

- `findField(labelText)`: Searches for form fields by matching inner text against labels
- `handleDropdown(container, value)`: Complex dropdown handling with multiple matching strategies (exact, case-insensitive, contains)
- `fillText(container, value)`: Fills text/textarea inputs
- `fillTime(label, val)`: Fills time picker fields
- `realClick(el)`: Simulates realistic click events (mousedown, mouseup, click)

### Dropdown Handling

Dropdowns use a lock mechanism (`DROPDOWN_LOCK`) to prevent overlapping operations. The function:
1. Opens the dropdown and waits for options to appear
2. Tries multiple matching strategies to find the target option
3. Scrolls the option into view and clicks it
4. Waits for dropdown to close and verifies selection

### Popup UI Structure

The popup uses an accordion pattern with two main sections:
1. **AI Assistant**: Daily notes area, chat URL configuration, sample data/prompt modals
2. **Automation**: JSON input, date picker, start/reset buttons, progress stats

The accordion swaps sections when clicking an already-active tab.

## Data Schema

Each automation entry must have:
```json
{
  "project": "string",
  "description": "string",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "notes": "string (optional)"
}
```

## Development Notes

- The extension is configured for a specific timesheet form with hardcoded labels: "Employee Name", "Employee ID", "Project", "Description", "Start Time", "End Time", "Self Rating"
- Employee name and ID are constants at the top of both `content.js` and `popup.js`
- The content script handles the "Submit Another" flow by detecting `/formResponse` URLs
- Theme support: light, dark, and system preference (stored in localStorage)
- Daily notes use debounced auto-save (750ms delay)

## Testing

To test the extension:
1. Load unpacked extension in Chrome (chrome://extensions → Developer mode → Load unpacked)
2. Open a Google Form matching the expected field labels
3. Open the extension popup and paste valid JSON
4. Click "Start Automation" and observe form filling

## Important Constraints

- The content script only runs on `https://docs.google.com/forms/*` URLs
- Dropdown handling requires the form to use ARIA roles (`role="listbox"`, `role="option"`)
- The automation stops if any dropdown selection fails
- Time inputs are expected to have two number inputs (hours and minutes)
