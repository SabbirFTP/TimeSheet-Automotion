# Technical Analysis: Form Automator Content Script

This document analyzes the current implementation of `content.js` and provides a roadmap for evolving it into a fully dynamic Google Form automation tool.

---

## 1. Current Capability: Dynamic Form Filling?

**Verdict: Semi-Dynamic.**

The script uses a **label-based discovery** strategy rather than hardcoded IDs or CSS paths. This is the correct foundation for handling Google Forms, which use obfuscated and dynamic class names.

### What is Dynamic:
*   **Field Discovery:** `findField(labelText)` searches the DOM for elements with `role="listitem"` and matches the internal text against a provided label. This allows the script to find "Project" regardless of where it is on the page.
*   **Dropdown Handling:** `handleDropdown` intelligently interacts with Google's custom `listbox` and `option` roles, which are notoriously difficult to automate with standard HTML tools.
*   **Event Simulation:** `realClick` dispatches `mousedown`, `mouseup`, and `click` events, which is necessary to bypass Google's internal state listeners.

### What is Static (Current Limitations):
*   **Hardcoded Labels:** The script specifically looks for strings like `"Employee Name"`, `"Project"`, and `"Description"`. If these change in the form, the script fails.
*   **Hardcoded Mapping:** The mapping between the JSON data (`entry.project`) and the form field ("Project") is hardcoded in the `runAutomation` function.
*   **Fixed Data Schema:** It expects a very specific JSON structure (Project, Description, Time). It cannot handle a form with different fields without code changes.
*   **Single Page Focus:** It does not currently handle "Next" buttons for multi-page forms.

---

## 2. Mandatory Requirements for Execution

To make this script successfully execute, the following environment and state must be met:

1.  **Browser Context:** Must be on a URL containing `docs.google.com/forms`.
2.  **Storage State (`chrome.storage.local`):**
    *   `isActive`: Must be `true`.
    *   `automationData`: Must be a valid JSON array of objects.
    *   `currentIndex`: Must be within the bounds of the array.
3.  **Permissions:** The extension manifest must have `storage` permissions and `content_scripts` matching `*://docs.google.com/forms/*`.
4.  **DOM Stability:** Google Forms must use the current ARIA roles (`role="listitem"`, `role="listbox"`, `role="option"`, `role="radio"`, `role="checkbox"`). These are standard for accessibility but can be changed by Google's developers.

---

## 3. Improving for Fully Dynamic Form Submission

To transform this into a tool that handles *any* Google Form dynamically, we need to shift from **hardcoded logic** to **configuration-driven logic**.

### Criteria for Dynamic Automation:

1.  **Key-to-Label Mapping:**
    *   Instead of `findField("Project")`, the script should iterate through the keys in the JSON object.
    *   For a key `"task_name"`, it should try to find a field with the label `"Task Name"` or `"Task"`.

2.  **Field Type Detection:**
    *   The script should identify the type of field it found (Short Text, Paragraph, Dropdown, Multiple Choice) and use the appropriate handler (`fillText`, `handleDropdown`, `handleRadio`).

3.  **Multi-Page Support:**
    *   Detect if a "Next" button exists instead of a "Submit" button.
    *   Fill all visible fields, click "Next", and repeat until "Submit" is found.

### Implementation Roadmap:

#### Step 1: Mapping Configuration
Create a mapping object in storage that tells the script which JSON key belongs to which Form label.
```json
{
  "mappings": {
    "Project": "project",
    "Description": "description",
    "Start Time": "start_time"
  }
}
```

#### Step 2: Generalized Field Filling
Replace the sequence in `runAutomation` with a loop:
```javascript
for (const [label, jsonKey] of Object.entries(mappings)) {
  const container = await findField(label);
  if (!container) continue;

  const value = entry[jsonKey];
  
  // Detect type and fill
  if (container.querySelector('[role="listbox"]')) {
    await handleDropdown(container, value);
  } else if (container.querySelector('textarea, input[type="text"]')) {
    fillText(container, value);
  } // ... handle other types
}
```

#### Step 3: Intelligence
Add a "Discovery Mode" where the extension scans the form and generates the JSON template for the user, ensuring the keys match the labels exactly.

---

## Current Situation
The script is highly optimized for a **specific timesheet workflow**. It handles complex Google Form components (dropdowns and time pickers) better than most generic scrapers. However, it requires manual code updates for different forms. The jump to "Fully Dynamic" requires implementing the **Configuration-Driven Loop** described above.
