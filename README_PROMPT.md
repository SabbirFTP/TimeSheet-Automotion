# TimeSheet Automation Guide & AI Prompt

This guide helps you use the Form Automator extension effectively, including how to generate the required JSON using AI.

## 🕒 Work Hour Configuration
- **Standard Hours**: 10:00 to 19:00
- **Lunch Break**: 14:00 to 15:00 (Skip this period)
- **Goal**: Distribute tasks throughout the day without overlapping or during lunch.

---

## 🤖 AI Prompt for Gemini / ChatGPT
Copy and paste this prompt to your AI assistant along with your raw task notes:

```text
Act as a professional data analyst. I will provide you with raw task notes from my workday. 
Your goal is to convert them into a structured JSON array for my timesheet automation.

CRITICAL RULES:
1. Format: Array of objects with keys: "project", "description", "start_time", "end_time".
2. Time Window: Distribute tasks between 10:00 and 19:00.
3. Lunch Break: Do NOT schedule any tasks between 14:00 and 15:00.
4. Duration: No single task should exceed 2 hours. Split long tasks into sub-tasks if needed.
5. Continuity: The end time of one task should be the start time of the next.
6. Return ONLY the raw JSON code block, no extra text.

RAW DATA:
[PASTE YOUR NOTES HERE e.g., "Finished API integration and fixed login bug (4 hours), wrote documentation (1 hour)"]
```

---

## 📁 Data Structure Requirements

| Field | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `project` | String | Yes | Name of the project/application. |
| `description` | String | Yes | Summary of work done. |
| `start_time` | String | Yes | HH:MM format (e.g., "10:30") |
| `end_time` | String | Yes | HH:MM format (e.g., "12:45") |
| `notes` | String | No | Optional extra comments. |

---

## 🚀 How to use Custom Date
1. Open the Extension Popup.
2. If you are submitting for a **previous day**, click the "Submission Date" input and select the desired date.
3. If left **empty**, the extension automatically uses **today's date**.
4. Paste your JSON and click **Start**.

## 📊 Progress Tracking
The popup UI now shows:
- **Total**: Full count of tasks in your JSON.
- **Left**: How many tasks are remaining in the current queue.
- **Done**: How many forms have been successfully submitted in this session.

Use the **Reset Progress** button to clear the current queue if you want to start a fresh batch.
